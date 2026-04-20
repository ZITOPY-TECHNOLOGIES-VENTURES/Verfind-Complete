/* Auto-detect OS/browser colour scheme BEFORE React boots */
(function () {
  window.process = { env: { API_KEY: '' } };
  var saved = localStorage.getItem('vf-theme');
  var osPrefers = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  var theme = saved || osPrefers;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
})();
