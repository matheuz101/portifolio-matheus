(() => {
  'use strict';
  const frame = document.getElementById('lc-portfolio-card');
  if (!frame) return;
  const USERNAME = 'matheuz101';
  const core = (() => {
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

    return api;
  })();
  // O caminho pertence ao card, mesmo com o código no script principal.
  const dataUrl = new URL(frame.dataset.lcDataUrl, document.baseURI);
  const byId = id => frame.querySelector(`#lc-${id}`);
  const tooltip = byId('heatmap-tooltip');
  const calendar = byId('calendar');
  const status = byId('update-status');
  const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' });
  let current;

  function showTooltip(cell) {
    tooltip.textContent = cell.getAttribute('aria-label');
    tooltip.hidden = false;
    const cardRect = tooltip.parentElement.getBoundingClientRect();
    const rect = cell.getBoundingClientRect();
    tooltip.style.left = `${Math.max(8, Math.min(rect.left - cardRect.left - tooltip.offsetWidth / 2 + rect.width / 2, cardRect.width - tooltip.offsetWidth - 10))}px`;
    tooltip.style.top = `${rect.top - cardRect.top - tooltip.offsetHeight - 8}px`;
    cell.setAttribute('aria-describedby', tooltip.id);
  }

  function hideTooltip() {
    tooltip.hidden = true;
    calendar.querySelector('[aria-describedby]')?.removeAttribute('aria-describedby');
  }

  function render(data) {
    core.validateSnapshot(data, USERNAME);
    current = data;
    byId('username').textContent = data.username;
    byId('ranking').textContent = data.ranking ? `#${data.ranking}` : '—';
    byId('ranking').setAttribute('aria-label', data.ranking ? `Ranking global: ${data.ranking}` : 'Ranking indisponível');
    byId('total-solved').textContent = data.totalSolved;
    byId('total-chart').setAttribute('aria-label', `${data.totalSolved} de ${data.totalQuestions} problemas resolvidos`);
    const amount = core.percentage(data.totalSolved, data.totalQuestions);
    byId('total-ring').style.strokeDasharray = `${amount} ${100 - amount}`;
    byId('total-ring').style.visibility = amount > 0 ? 'visible' : 'hidden';
    for (const item of data.difficulties) {
      const key = item.name.toLowerCase();
      byId(`${key}-value`).textContent = `${item.solved} / ${item.total}`;
      byId(`${key}-bar`).style.width = `${core.percentage(item.solved, item.total)}%`;
      const progress = byId(`${key}-progress`);
      progress.setAttribute('aria-valuemax', item.total);
      progress.setAttribute('aria-valuenow', item.solved);
      progress.setAttribute('aria-valuetext', `${item.solved} de ${item.total} problemas resolvidos`);
    }
    const days = core.buildDays(data.calendar);
    const fragment = document.createDocumentFragment();
    days.forEach((day, index) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'lc-day';
      cell.dataset.level = core.level(day.count);
      cell.dataset.index = index;
      cell.tabIndex = index === days.length - 1 ? 0 : -1;
      cell.setAttribute('aria-label', `${dateFormat.format(new Date(`${day.date}T00:00:00Z`))}: ${day.count} ${day.count === 1 ? 'submissão' : 'submissões'}`);
      fragment.append(cell);
    });
    hideTooltip();
    calendar.replaceChildren(fragment);
    const shortDate = date => date.split('-').map(Number).join('.');
    byId('start-date').textContent = shortDate(days[0].date);
    byId('end-date').textContent = shortDate(days.at(-1).date);
    const updated = new Date(data.updatedAt);
    const formatted = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(updated);
    status.textContent = `Atualizado em ${formatted}`;
    status.title = `Última coleta válida: ${updated.toLocaleString('pt-BR')}. Atualização programada a cada 6 horas.`;
    status.dataset.state = Date.now() - updated.getTime() > 24 * 60 * 60 * 1000 ? 'stale' : 'ready';
    if (status.dataset.state === 'stale') status.textContent += ' · dados anteriores';
  }

  calendar.addEventListener('pointerover', event => { if (event.target.matches('.lc-day')) showTooltip(event.target); });
  calendar.addEventListener('pointerleave', hideTooltip);
  calendar.addEventListener('focusin', event => { if (event.target.matches('.lc-day')) showTooltip(event.target); });
  calendar.addEventListener('focusout', hideTooltip);
  calendar.addEventListener('click', event => { if (event.target.matches('.lc-day')) showTooltip(event.target); });
  calendar.addEventListener('keydown', event => {
    if (!event.target.matches('.lc-day')) return;
    if (event.key === 'Escape') { hideTooltip(); return; }
    const delta = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 }[event.key];
    const index = Number(event.target.dataset.index);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? calendar.children.length - 1 : delta === undefined ? undefined : Math.max(0, Math.min(calendar.children.length - 1, index + delta));
    if (next === undefined) return;
    event.preventDefault();
    calendar.querySelector('[tabindex="0"]')?.setAttribute('tabindex', '-1');
    calendar.children[next].tabIndex = 0;
    calendar.children[next].focus();
  });

  try { if (window.LEETCODE_SNAPSHOT) render(window.LEETCODE_SNAPSHOT); } catch (error) { console.warn(error.message); }
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    fetch(dataUrl, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
      .then(response => { if (!response.ok) throw new Error('Falha ao ler estatísticas.'); return response.json(); })
      .then(data => { core.validateSnapshot(data, USERNAME); if (!current || Date.parse(data.updatedAt) > Date.parse(current.updatedAt)) render(data); })
      .catch(() => {
        if (current) { status.title += ' Usando os últimos dados salvos.'; return; }
        status.textContent = 'Estatísticas indisponíveis. Tente novamente mais tarde.';
        status.dataset.state = 'error';
      });
  } else if (!current) {
    status.textContent = 'Dados indisponíveis. Execute a atualização pelo GitHub Actions.';
    status.dataset.state = 'error';
  }
})();

