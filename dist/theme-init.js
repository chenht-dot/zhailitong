(() => {
  const savedTheme = localStorage.getItem('zhailitong-theme');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = savedTheme || systemTheme;
})();
