import test from 'node:test';
import assert from 'node:assert/strict';
import core from '../stats-core.js';
import { normalizeResponse, update } from '../scripts/update-leetcode.mjs';

function fixture() {
  return { data: {
    allQuestionsCount: [{ difficulty: 'Hard', count: 973 }, { difficulty: 'All', count: 4047 }, { difficulty: 'Easy', count: 963 }, { difficulty: 'Medium', count: 2111 }],
    matchedUser: { username: 'matheuz101', profile: { ranking: 5000001 }, submitStatsGlobal: { acSubmissionNum: [{ difficulty: 'Medium', count: 0 }, { difficulty: 'All', count: 0 }, { difficulty: 'Hard', count: 0 }, { difficulty: 'Easy', count: 0 }] }, previousCalendar: { submissionCalendar: '{}' }, currentCalendar: { submissionCalendar: '{}' } },
  } };
}
test('Um perfil sem problemas resolvidos mantém zeros reais, mesmo com dificuldades fora de ordem', () => {
  const snapshot = normalizeResponse(fixture());
  assert.equal(snapshot.totalSolved, 0);
  assert.deepEqual(snapshot.difficulties.map(item => item.total), [963, 2111, 973]);
  assert.equal(core.percentage(0, 4047), 0);
  assert.deepEqual(snapshot.calendar, {});
});
test('Mescla os dois anos sem contar timestamps repetidos duas vezes', () => {
  const payload = fixture();
  const a = Date.parse('2025-12-31T00:00:00Z') / 1000;
  const b = Date.parse('2026-01-01T00:00:00Z') / 1000;
  payload.data.matchedUser.previousCalendar.submissionCalendar = JSON.stringify({ [a]: 3 });
  payload.data.matchedUser.currentCalendar.submissionCalendar = JSON.stringify({ [a]: 3, [b]: 2 });
  const result = normalizeResponse(payload);
  assert.deepEqual(result.calendar, { '2025-12-31': 3, '2026-01-01': 2 });
});
test('Calendário de 52 semanas atravessa ano bissexto, inclui hoje e exclui dias fora do período', () => {
  const days = core.buildDays({ '2024-02-29': 5, '2025-01-01': 3, '2025-01-02': 9 }, new Date('2025-01-01T21:30:00Z'));
  assert.equal(days.length, 364);
  assert.equal(new Set(days.map(day => day.date)).size, 364);
  assert.equal(days[0].date, '2024-01-04');
  assert.deepEqual(days.at(-1), { date: '2025-01-01', count: 3 });
  assert.equal(days.find(day => day.date === '2024-02-29').count, 5);
});
test('Dados parciais e erros GraphQL nunca substituem estatísticas válidas por zeros', async () => {
  let saves = 0;
  for (const payload of [{ errors: [{ message: 'error' }] }, { data: { matchedUser: null } }, fixture()]) {
    if (payload.data?.matchedUser) delete payload.data.matchedUser.currentCalendar;
    await assert.rejects(update({ fetchImpl: async () => ({ ok: true, json: async () => payload }), save: async () => saves++, attempts: 1 }));
  }
  assert.equal(saves, 0);
});
test('Falha HTTP mantém o último arquivo válido sem executar gravação', async () => {
  let saved = false;
  await assert.rejects(update({ fetchImpl: async () => ({ ok: false, status: 503 }), save: async () => { saved = true; }, attempts: 1 }));
  assert.equal(saved, false);
});
test('Rejeita totais inconsistentes e contagens de calendário inválidas', () => {
  const snapshot = normalizeResponse(fixture());
  assert.throws(() => core.validateSnapshot({ ...snapshot, totalSolved: 2 }));
  assert.throws(() => core.validateSnapshot({ ...snapshot, calendar: { '2026-02-30': 1 } }));
  assert.throws(() => core.validateSnapshot({ ...snapshot, calendar: { '2026-02-01': -1 } }));
});
