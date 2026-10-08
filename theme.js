const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('span');
const themeColor = document.querySelector('meta[name="theme-color"]');
const savedTheme = localStorage.getItem('portfolio-theme');

if (savedTheme === 'dark') {
  document.documentElement.dataset.theme = 'dark';
}

function updateThemeToggle() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  const action = isDark ? 'terang' : 'gelap';

  themeIcon.textContent = isDark ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', `Aktifkan mode ${action}`);
  themeToggle.title = `Aktifkan mode ${action}`;
  themeColor.content = isDark ? '#171916' : '#f7f7f4';
}

updateThemeToggle();

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.dataset.theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';

  if (nextTheme === 'dark') {
    document.documentElement.dataset.theme = nextTheme;
  } else {
    delete document.documentElement.dataset.theme;
  }

  localStorage.setItem('portfolio-theme', nextTheme);
  updateThemeToggle();
});
