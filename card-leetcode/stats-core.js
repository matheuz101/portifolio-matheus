(function (root) {
  'use strict';
  const DAY = 86400000;
  const names = ['Easy', 'Medium', 'Hard'];
  const integer = value => Number.isSafeInteger(value) && value >= 0;

  function validateSnapshot(data, username = 'matheuz101') {
    if (!data || data.schemaVersion !== 1 || data.username !== username || !Number.isFinite(Date.parse(data.updatedAt))) throw new Error('Dados de perfil inválidos.');
    if (!integer(data.totalSolved) || !integer(data.totalQuestions) || data.totalQuestions === 0 || data.totalSolved > data.totalQuestions) throw new Error('Totais inválidos.');
    if (data.ranking !== null && !integer(data.ranking)) throw new Error('Ranking inválido.');
    if (!Array.isArray(data.difficulties) || data.difficulties.length !== 3) throw new Error('Dificuldades ausentes.');
    for (const name of names) {
      const stat = data.difficulties.find(item => item.name === name);
      if (!stat || !integer(stat.solved) || !integer(stat.total) || stat.solved > stat.total) throw new Error('Estatísticas incompletas.');
    }
    if (data.difficulties.reduce((n, item) => n + item.solved, 0) !== data.totalSolved || data.difficulties.reduce((n, item) => n + item.total, 0) !== data.totalQuestions) throw new Error('Totais inconsistentes.');
    if (!data.calendar || typeof data.calendar !== 'object' || Array.isArray(data.calendar)) throw new Error('Calendário ausente.');
    for (const [date, count] of Object.entries(data.calendar)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || !integer(count)) throw new Error('Dia de atividade inválido.');
    }
    return data;
  }

  function buildDays(calendar, now = new Date()) {
    const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    return Array.from({ length: 364 }, (_, index) => {
      const date = new Date(end - (363 - index) * DAY).toISOString().slice(0, 10);
      return { date, count: calendar[date] || 0 };
    });
  }

  function level(count) { return count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4; }
  function percentage(solved, total) { return total > 0 ? Math.max(0, Math.min(100, solved / total * 100)) : 0; }
  const api = { validateSnapshot, buildDays, level, percentage };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LeetCodeCard = api;
})(globalThis);
