// FUNDO ESTRELADO: cria estrelas de tamanhos, posições e ritmos diferentes.
function buildStarfield(container, count) {
  if (!container) return;

 
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    if (Math.random() < 0.08) star.classList.add('star--gold');

    const size = (Math.random() * 1.6 + 0.6).toFixed(2);
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = (Math.random() * 100).toFixed(2) + '%';
    star.style.top = (Math.random() * 100).toFixed(2) + '%';
    star.style.animationDuration = (2.5 + Math.random() * 2.5).toFixed(2) + 's';
    star.style.animationDelay = (Math.random() * -4).toFixed(2) + 's';
    frag.appendChild(star);
  }

  
  container.replaceChildren(frag);
}

buildStarfield(document.getElementById('starfield'), 130);

// Indicador ferroviário: apenas acompanha a rolagem nativa.
(() => {
  'use strict';

  const scrollbar = document.querySelector('.hogwarts-scrollbar');
  const track = scrollbar?.querySelector('.railway-track');
  const carriage = scrollbar?.querySelector('.railway-carriage');
  const train = scrollbar?.querySelector('.hogwarts-train');
  if (!track || !carriage || !train) return;

  const root = document.documentElement;
  const scroller = document.scrollingElement || root;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let needsMeasure = true;
  let scrollRange = 0;
  let travel = 0;
  let imageReady = false;
  let moving = false;
  let stopTimer;
  let lastPosition;

  function render() {
    frame = 0;
    if (needsMeasure) {
      // Geometria só muda com o conteúdo/viewport, não a cada evento de scroll.
      scrollRange = Math.max(0, scroller.scrollHeight - root.clientHeight);
      travel = Math.max(0, track.clientHeight - carriage.offsetHeight - 4);
      needsMeasure = false;
      scrollbar.classList.toggle('is-visible', imageReady && scrollRange > 0 && travel > 0);
    }

    const progress = scrollRange > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollRange)) : 0;
    const position = (progress * travel).toFixed(2);
    if (position !== lastPosition) {
      carriage.style.transform = `translate3d(-50%, ${position}px, 0)`;
      lastPosition = position;
    }
  }

  function requestRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function measure() {
    needsMeasure = true;
    requestRender();
  }

  function stopMoving() {
    clearTimeout(stopTimer);
    scrollbar.classList.remove('train-moving');
    moving = false;
  }

  function updateImage() {
    imageReady = train.complete && train.naturalWidth > 0;
    root.classList.toggle('has-railway-scrollbar', imageReady);
    if (!imageReady) stopMoving();
    measure();
  }

  window.addEventListener('scroll', () => {
    requestRender();
    if (!imageReady || scrollRange <= 0 || reducedMotion.matches) return;
    if (!moving) {
      scrollbar.classList.add('train-moving');
      moving = true;
    }
    clearTimeout(stopTimer);
    stopTimer = setTimeout(stopMoving, 150);
  }, { passive: true });

  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure, { once: true });
  window.addEventListener('pageshow', measure);
  window.addEventListener('pagehide', stopMoving);
  reducedMotion.addEventListener('change', stopMoving);
  train.addEventListener('load', updateImage);
  train.addEventListener('error', updateImage);

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    observer.observe(track);
  }
  document.fonts?.ready.then(measure);
  updateImage();
})();


(() => {
  'use strict';

  const translations = {
    en: {
      home: 'Home',
      about: 'About',
      skills: 'Skills',
      projects: 'Projects',
      contact: 'Contact',
      downloadCV: 'Download CV',
      heroGreeting: 'Hi, I’m a',
      heroRole: 'Developer.',
      heroSubtitle: 'I am a Fullstack, Web & Mobile Developer\nstudying IT at COTEMIG.',
      heroDescription: 'I build interactive web applications and mobile solutions with Swift, Kotlin, HTML, CSS, JavaScript and OOP, creating intuitive software experiences across multiple platforms and devices.',
      browseProjects: 'Browse Projects',
      titleLabel: 'Hi, I’m a Fullstack, Mobile App, Web, Back-End and Software Developer.',
      languageLabel: 'Current language: English. Switch to Portuguese.',
      openMenu: 'Open navigation menu',
      closeMenu: 'Close navigation menu',
      navigationLabel: 'Main navigation',
      homeLabel: 'Matheus — Home',
      socialLabel: 'Social links',
      cvStatus: 'CV coming soon'
    },
    'pt-BR': {
      home: 'Início',
      about: 'Sobre',
      skills: 'Habilidades',
      projects: 'Projetos',
      contact: 'Entre em contato',
      downloadCV: 'Baixar CV',
      heroGreeting: 'Olá, sou',
      heroRole: 'Desenvolvedor.',
      heroSubtitle: 'Sou desenvolvedor Fullstack, Web e Mobile\ne estudo TI no COTEMIG.',
      heroDescription: 'Crio aplicações web interativas e soluções mobile com Swift, Kotlin, HTML, CSS, JavaScript e POO, desenvolvendo experiências de software intuitivas para diversas plataformas e dispositivos.',
      browseProjects: 'Ver projetos',
      titleLabel: 'Olá, sou desenvolvedor Fullstack, Mobile App, Web, Back-End e Software.',
      languageLabel: 'Idioma atual: Português. Mudar para inglês.',
      openMenu: 'Abrir menu de navegação',
      closeMenu: 'Fechar menu de navegação',
      navigationLabel: 'Navegação principal',
      homeLabel: 'Matheus — Início',
      socialLabel: 'Redes sociais',
      cvStatus: 'Currículo em breve'
    }
  };

  const languageButton = document.querySelector('.language-button');
  const languageFlag = languageButton?.querySelector('img');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('primary-navigation');
  const title = document.getElementById('home-title');
  const typingWrapper = document.querySelector('.hero-typing');
  const dynamicText = document.querySelector('.dynamic-text');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  const specialties = ['Fullstack', 'Mobile App', 'Web', 'Back-End', 'Software'];
  const specialtyColors = ['#d5bbff', '#81d4fa', '#86efac', '#f6bc77', '#f5a9cc'];
  let currentLanguage = 'en';
  let typedInstance = null;
  let tiltInstance = null;

  
  function setMenuOpen(isOpen) {
    if (!menuButton || !navigation) return;
    navigation.classList.toggle('is-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', translations[currentLanguage][isOpen ? 'closeMenu' : 'openMenu']);
  }

  
  function setLanguage(language) {
    currentLanguage = language;
    document.documentElement.lang = language;
    const texts = translations[language];

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const translation = texts[element.dataset.i18n];
      if (translation) element.textContent = translation;
    });

    if (languageFlag) {
      languageFlag.src = language === 'en' ? 'imgs/usa-flag.png' : 'imgs/brasil-flag.png';
      languageFlag.alt = '';
    }
    if (languageButton) {
      languageButton.setAttribute('aria-label', texts.languageLabel);
      languageButton.title = texts.languageLabel;
    }
    
    if (title) title.setAttribute('aria-label', texts.titleLabel);
    document.querySelector('.navbar')?.setAttribute('aria-label', texts.navigationLabel);
    document.querySelector('.photo-header')?.setAttribute('aria-label', texts.homeLabel);
    document.querySelector('.social-links')?.setAttribute('aria-label', texts.socialLabel);
    document.querySelector('.download-cv[aria-disabled="true"]')?.setAttribute('title', texts.cvStatus);
    setMenuOpen(false);
  }


  function updateTyping() {
    if (!dynamicText || !typingWrapper) return;
    if (reducedMotion.matches || typeof window.Typed !== 'function') {
      if (typedInstance) typedInstance.destroy();
      typedInstance = null;
      dynamicText.textContent = specialties[0];
      typingWrapper.style.setProperty('--typing-color', specialtyColors[0]);
      return;
    }
    if (typedInstance) return;

    dynamicText.textContent = '';
    typedInstance = new window.Typed(dynamicText, {
      strings: specialties,
      typeSpeed: 85,
      backSpeed: 45,
      startDelay: 400,
      backDelay: 1800,
      smartBackspace: false,
      loop: true,
      showCursor: false,
      contentType: null,
      preStringTyped(index) {
        typingWrapper.style.setProperty('--typing-color', specialtyColors[index]);
      }
    });
  }


  function updateTilt() {
    const jQuery = window.jQuery;
    if (!jQuery || typeof jQuery.fn.tilt !== 'function') return;

    if (reducedMotion.matches || coarsePointer.matches) {
      if (tiltInstance) {
        jQuery.fn.tilt.destroy.call(tiltInstance);
        tiltInstance = null;
      }
      return;
    }
    if (tiltInstance || !document.querySelector('.hero-image')) return;

    tiltInstance = jQuery('.hero-image').tilt({
      maxTilt: 10,
      perspective: 1000,
      scale: 1.02,
      speed: 450,
      reset: true,
      glare: false
    });

    jQuery.fn.tilt.getValues.call(tiltInstance);
  }

  languageButton?.addEventListener('click', () => {
    setLanguage(currentLanguage === 'en' ? 'pt-BR' : 'en');
  });
  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    setMenuOpen(isOpen);
    
    if (isOpen) navigation?.querySelector('a')?.focus();
  });
  navigation?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuButton.focus();
    }
  });

  
  reducedMotion.addEventListener('change', () => {
    updateTyping();
    updateTilt();
  });
  coarsePointer.addEventListener('change', updateTilt);

  
  setLanguage('en');
  updateTyping();
  updateTilt();
})();

// GitHub Profile Stats Card — busca dados reais em tempo real.
const GITHUB_USERNAME = 'matheuz101';

function formatNumber(num) {
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}

async function fetchAllRepos(username) {
  let repos = [];
  let page = 1;
  while (page <= 5) { // limite de segurança (até 500 repositórios)
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`);
    if (!res.ok) break;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    repos = repos.concat(data);
    if (data.length < 100) break;
    page++;
  }
  return repos;
}

async function loadGithubStats() {
  const nameEl = document.getElementById('gh-name');
  const starsEl = document.getElementById('gh-stars');
  const prsEl = document.getElementById('gh-prs');
  const issuesEl = document.getElementById('gh-issues');
  const buttonEl = document.getElementById('gh-button');

  if (buttonEl) buttonEl.href = `https://github.com/${GITHUB_USERNAME}`;

  try {
    const [userRes, repos, prRes, issueRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`).then(r => r.json()),
      fetchAllRepos(GITHUB_USERNAME),
      fetch(`https://api.github.com/search/issues?q=author:${GITHUB_USERNAME}+type:pr`).then(r => r.json()),
      fetch(`https://api.github.com/search/issues?q=author:${GITHUB_USERNAME}+type:issue`).then(r => r.json()),
    ]);

    if (userRes.message) throw new Error(userRes.message);

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

    if (nameEl) nameEl.textContent = userRes.name || userRes.login;
    if (starsEl) starsEl.textContent = formatNumber(totalStars);
    if (prsEl) prsEl.textContent = formatNumber(prRes.total_count || 0);
    if (issuesEl) issuesEl.textContent = formatNumber(issueRes.total_count || 0);

  } catch (err) {
    if (nameEl) nameEl.textContent = GITHUB_USERNAME;
    if (starsEl) starsEl.textContent = '?';
    if (prsEl) prsEl.textContent = '?';
    if (issuesEl) issuesEl.textContent = '?';
    console.error('Não foi possível carregar os dados do GitHub:', err.message);
  }
}

loadGithubStats();

;// LEETCODE: comportamento isolado do card integrado
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
    status.title = `Última coleta válida: ${updated.toLocaleString('pt-BR')}.`;
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

// FIM LEETCODE 

// interatividade e acessibilidade para a animação das cartas na seção skills

document.querySelectorAll('.skill-card').forEach((card) => {
  function setOpen(isOpen) {
    card.classList.toggle('open', isOpen);
    card.setAttribute('aria-pressed', String(isOpen));
    card.setAttribute(
       'aria-label',
        `${isOpen ? 'Fechar' : 'Abrir'} carta da habilidade ${card.dataset.skill}`
        );
 }

    setOpen(card.classList.contains('open'));

    // O botão nativo também responde a Enter, Espaço e toque.
    card.addEventListener('click', () => {
      setOpen(!card.classList.contains('open'));
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
     }
 });
});
