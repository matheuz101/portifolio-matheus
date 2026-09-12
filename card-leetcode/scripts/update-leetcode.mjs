import { mkdir, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import core from '../stats-core.js';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const USERNAME = 'matheuz101';
export const QUERY = `query Profile($username:String!,$currentYear:Int!,$previousYear:Int!){
  allQuestionsCount { difficulty count }
  matchedUser(username:$username) {
    username
    profile { ranking }
    submitStatsGlobal { acSubmissionNum { difficulty count } }
    currentCalendar:userCalendar(year:$currentYear) { submissionCalendar }
    previousCalendar:userCalendar(year:$previousYear) { submissionCalendar }
  }
}`;

export function normalizeResponse(payload, now = new Date()) {
  if (!payload || payload.errors?.length) throw new Error('O LeetCode retornou erro na consulta.');
  const { matchedUser: user, allQuestionsCount: totals } = payload.data || {};
  if (!user || user.username?.toLowerCase() !== USERNAME) throw new Error('Perfil matheuz101 não encontrado.');
  const solved = user.submitStatsGlobal?.acSubmissionNum;
  if (!Array.isArray(totals) || !Array.isArray(solved)) throw new Error('Estatísticas ausentes.');
  const count = (items, difficulty) => items.find(item => item.difficulty === difficulty)?.count;
  const timestamps = new Map();
  for (const field of ['previousCalendar', 'currentCalendar']) {
    const raw = user[field]?.submissionCalendar;
    if (typeof raw !== 'string') throw new Error(`Calendário incompleto: ${field}.`);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Calendário inválido.');
    for (const [timestamp, value] of Object.entries(parsed)) {
      if (!/^\d+$/.test(timestamp) || !Number.isSafeInteger(Number(timestamp)) || !Number.isSafeInteger(value) || value < 0) throw new Error('Submissão inválida.');
      timestamps.set(timestamp, value);
    }
  }
  const calendar = {};
  for (const [timestamp, count] of timestamps) {
    const day = new Date(Number(timestamp) * 1000).toISOString().slice(0, 10);
    calendar[day] = (calendar[day] || 0) + count;
  }
  const snapshot = {
    schemaVersion: 1,
    username: USERNAME,
    updatedAt: now.toISOString(),
    ranking: user.profile?.ranking ?? null,
    totalSolved: count(solved, 'All'),
    totalQuestions: count(totals, 'All'),
    difficulties: ['Easy', 'Medium', 'Hard'].map(name => ({ name, solved: count(solved, name), total: count(totals, name) })),
    calendarYears: [now.getUTCFullYear() - 1, now.getUTCFullYear()],
    calendar: Object.fromEntries(Object.entries(calendar).sort(([a], [b]) => a.localeCompare(b))),
  };
  return core.validateSnapshot(snapshot, USERNAME);
}

export async function collect({ fetchImpl = fetch, now = new Date() } = {}) {
  const year = now.getUTCFullYear();
  const response = await fetchImpl('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com/' },
    body: JSON.stringify({ query: QUERY, variables: { username: USERNAME, currentYear: year, previousYear: year - 1 } }),
    signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) {
    const error = new Error(`LeetCode indisponível (HTTP ${response.status}).`);
    error.retryable = response.status === 429 || response.status >= 500;
    throw error;
  }
  return normalizeResponse(await response.json(), now);
}

async function writeSnapshot(snapshot) {
  const json = JSON.stringify(snapshot, null, 2).replace(/</g, '\\u003c');
  const folder = resolve(ROOT, 'data');
  await mkdir(folder, { recursive: true });
  const files = [
    ['leetcode.json', `${json}\n`],
    ['leetcode-data.js', `// Gerado automaticamente; os mesmos dados de leetcode.json.\nwindow.LEETCODE_SNAPSHOT = ${json};\n`],
  ];
  for (const [name, content] of files) await writeFile(resolve(folder, `${name}.tmp`), content, 'utf8');
  for (const [name] of files) await rename(resolve(folder, `${name}.tmp`), resolve(folder, name));
}

export async function update({ fetchImpl = fetch, now = new Date(), save = writeSnapshot, attempts = 3 } = {}) {
  let failure;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const snapshot = await collect({ fetchImpl, now });
      await save(snapshot);
      return snapshot;
    } catch (error) {
      failure = error;
      const transient = error.retryable || error.name === 'TimeoutError' || error.name === 'AbortError' || error instanceof TypeError;
      if (!transient || attempt === attempts - 1) break;
      await new Promise(done => setTimeout(done, 1500 * (attempt + 1)));
    }
  }
  throw failure;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const data = await update();
    console.log(`Perfil ${data.username}: ${data.totalSolved} resolvidos. Dados atualizados em ${data.updatedAt}.`);
  } catch (error) {
    console.error(`${error.message} Os últimos dados válidos foram preservados; publicação cancelada.`);
    process.exitCode = 1;
  }
}
