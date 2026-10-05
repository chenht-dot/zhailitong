(() => {
  const themeToggle = document.querySelector('#themeToggle');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');

  const applyTheme = (theme, persist = false) => {
    document.documentElement.dataset.theme = theme;
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.setAttribute('aria-label', theme === 'dark' ? '切换为明亮主题' : '切换为深色主题');
    if (persist) localStorage.setItem('zhailitong-theme', theme);
  };

  applyTheme(document.documentElement.dataset.theme || (systemTheme.matches ? 'dark' : 'light'));
  themeToggle.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
  });
  systemTheme.addEventListener('change', event => {
    if (!localStorage.getItem('zhailitong-theme')) applyTheme(event.matches ? 'dark' : 'light');
  });

  const normalizeText = root => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.includes('—') || node.nodeValue.includes('–')) {
        node.nodeValue = node.nodeValue.replace(/[—–]/g, '至');
      }
    }
  };

  normalizeText(document.body);
  new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'characterData') normalizeText(record.target.parentNode);
      record.addedNodes.forEach(node => normalizeText(node));
    });
  }).observe(document.body, { childList: true, characterData: true, subtree: true });
})();
