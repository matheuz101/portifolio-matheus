


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
