// ============================================
// 🌐 UZUN BROWSER - MAIN LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const header = document.getElementById('header');
  const tabsContainer = document.getElementById('tabsContainer');
  const newTabBtn = document.getElementById('newTabBtn');
  const content = document.getElementById('content');
  const bookmarksBar = document.getElementById('bookmarksBar');
  const bookmarksScroll = document.getElementById('bookmarksScroll');
  const historyPanel = document.getElementById('historyPanel');
  const downloadsPanel = document.getElementById('downloadsPanel');
  const menuDropdown = document.getElementById('menuDropdown');

  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const backBtn = document.getElementById('back');
  const forwardBtn = document.getElementById('forward');
  const reloadBtn = document.getElementById('reload');
  const homeBtn = document.getElementById('home');
  const addCurrentBookmark = document.getElementById('addCurrentBookmark');

  const bookmarksBtn = document.getElementById('bookmarksBtn');
  const historyBtn = document.getElementById('historyBtn');
  const downloadsBtn = document.getElementById('downloadsBtn');
  const menuBtn = document.getElementById('menuBtn');
  const addBookmarkBtn = document.getElementById('addBookmarkBtn');

  const historyList = document.getElementById('historyList');
  const downloadsList = document.getElementById('downloadsList');

  // Tab variables
  let tabs = [];
  let activeTab = null;
  let tabIdCounter = 0;

  // Window controls
  document.querySelector('.close').addEventListener('click', () => window.uzun.window.closeWindow());
  document.querySelector('.minimize').addEventListener('click', () => window.uzun.window.minimizeWindow());
  document.querySelector('.maximize').addEventListener('click', () => window.uzun.window.maximizeWindow());
  
  // Toggle panels
  bookmarksBtn.addEventListener('click', () => {
    bookmarksBar.classList.toggle('collapsed');
    bookmarksBtn.classList.toggle('active');
  });

  historyBtn.addEventListener('click', () => {
    historyPanel.classList.toggle('collapsed');
    historyBtn.classList.toggle('active');
    if (!historyPanel.classList.contains('collapsed')) {
      downloadsPanel.classList.add('collapsed');
      downloadsBtn.classList.remove('active');
      menuDropdown.classList.add('collapsed');
      renderHistory();
    }
  });

  downloadsBtn.addEventListener('click', () => {
    downloadsPanel.classList.toggle('collapsed');
    downloadsBtn.classList.toggle('active');
    if (!downloadsPanel.classList.contains('collapsed')) {
      historyPanel.classList.add('collapsed');
      historyBtn.classList.remove('active');
      menuDropdown.classList.add('collapsed');
      renderDownloads();
    }
  });

  menuBtn.addEventListener('click', () => {
    menuDropdown.classList.toggle('collapsed');
    if (!menuDropdown.classList.contains('collapsed')) {
      historyPanel.classList.add('collapsed');
      downloadsPanel.classList.add('collapsed');
      historyBtn.classList.remove('active');
      downloadsBtn.classList.remove('active');
    }
  });

  document.getElementById('closeHistory').addEventListener('click', () => {
    historyPanel.classList.add('collapsed');
    historyBtn.classList.remove('active');
  });

  document.getElementById('closeDownloads').addEventListener('click', () => {
    downloadsPanel.classList.add('collapsed');
    downloadsBtn.classList.remove('active');
  });

  document.getElementById('clearHistory').addEventListener('click', async () => {
    if (confirm('Tüm geçmişi silmek istediğinizden emin misiniz?')) {
      history = [];
      await window.uzun.history.save(history);
      renderHistory();
    }
  });

  // Close panels on outside click
  document.addEventListener('click', (e) => {
    if (!menuDropdown.classList.contains('collapsed') && 
        !menuBtn.contains(e.target) && 
        !menuDropdown.contains(e.target)) {
      menuDropdown.classList.add('collapsed');
    }
  });

  // URL helper
  function toSearchOrUrl(input) {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^[a-z0-9.-]+\.[a-z]{2,}(:\d+)?(\/.*)?$/i.test(trimmed)) return `https://${trimmed}`;
    return `https://www.ecosia.org/search?q=${encodeURIComponent(trimmed)}`;
  }

  // Load data
  let bookmarks = await window.uzun.bookmarks.load();
  if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
    bookmarks = [
      "https://www.ecosia.org/",
      "https://www.youtube.com/",
      "https://github.com/",
      "https://stackoverflow.com/"
    ];
    await window.uzun.bookmarks.save(bookmarks);
  }

  let passwords = await window.uzun.passwords.load();
  if (!passwords || typeof passwords !== 'object') passwords = {};

  let history = await window.uzun.history.load();
  if (!Array.isArray(history)) history = [];

  let downloads = await window.uzun.downloads.load();
  if (!Array.isArray(downloads)) downloads = [];

  // Bookmarks rendering
  function renderBookmarks() {
    bookmarksScroll.innerHTML = "";
    bookmarks.forEach((url, index) => {
      let hostname = url;
      try { hostname = new URL(url).hostname.replace('www.', ''); } catch {}

      const item = document.createElement('div');
      item.className = 'bookmark-item';
      item.innerHTML = `
        <div class="bookmark-favicon">${hostname.charAt(0).toUpperCase()}</div>
        <div class="bookmark-title">${hostname}</div>
        <button class="bookmark-delete">×</button>
      `;
      
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('bookmark-delete')) {
          if (activeTab) activeTab.webview.src = url;
        }
      });

      item.querySelector('.bookmark-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        bookmarks.splice(index, 1);
        await window.uzun.bookmarks.save(bookmarks);
        renderBookmarks();
      });

      bookmarksScroll.appendChild(item);
    });
  }
  renderBookmarks();

  // Add bookmark
  addBookmarkBtn.addEventListener('click', async () => {
    const url = prompt('Yeni yer imi URL:');
    if (url && url.trim()) {
      bookmarks.push(url.trim());
      await window.uzun.bookmarks.save(bookmarks);
      renderBookmarks();
    }
  });

  // Add current page to bookmarks
  addCurrentBookmark.addEventListener('click', async () => {
    if (!activeTab) return;
    try {
      const url = activeTab.webview.getURL();
      if (url && !bookmarks.includes(url)) {
        bookmarks.push(url);
        await window.uzun.bookmarks.save(bookmarks);
        renderBookmarks();
        addCurrentBookmark.textContent = '✓';
        setTimeout(() => { addCurrentBookmark.textContent = '★'; }, 1000);
      }
    } catch {}
  });

  // History
  function addToHistory(url, title) {
    if (!url || url.startsWith('data:')) return;
    const existing = history.findIndex(h => h.url === url);
    if (existing !== -1) history.splice(existing, 1);
    history.unshift({ url, title: title || url, time: Date.now() });
    if (history.length > 500) history = history.slice(0, 500);
    window.uzun.history.save(history);
  }

  function renderHistory() {
    historyList.innerHTML = "";
    if (history.length === 0) {
      historyList.innerHTML = '<p style="padding:10px;color:#999;text-align:center;">Henüz geçmiş yok</p>';
      return;
    }
    history.slice(0, 100).forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `<div class="history-item-title">${item.title}</div><div class="history-item-url">${item.url}</div>`;
      div.onclick = () => { if (activeTab) activeTab.webview.src = item.url; };
      historyList.appendChild(div);
    });
  }

  // Downloads
  function renderDownloads() {
    downloadsList.innerHTML = "";
    if (downloads.length === 0) {
      downloadsList.innerHTML = '<p style="padding:10px;color:#999;text-align:center;">Henüz indirme yok</p>';
      return;
    }
    downloads.forEach(item => {
      const div = document.createElement('div');
      div.className = 'download-item';
      div.innerHTML = `<div class="download-name">${item.name}</div><div class="download-progress">${item.status}</div>`;
      downloadsList.appendChild(div);
    });
  }

  function createTab(url = 'https://www.ecosia.org/') {
    const tabId = tabIdCounter++;
    
    const webview = document.createElement('webview');
    webview.id = `webview-${tabId}`;
    webview.src = url;
    webview.partition = 'persist:main';
    webview.setAttribute('allowpopups', '');
    webview.setAttribute('useragent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    webview.className = 'browser-webview';
    content.appendChild(webview);

    const tabEl = document.createElement('div');
    tabEl.className = 'tab';
    tabEl.innerHTML = `<span class="tab-title">Yeni Sekme</span><button class="tab-close">×</button>`;
    tabsContainer.appendChild(tabEl);

    const tab = { id: tabId, webview, tabEl, url, title: 'Yeni Sekme' };
    tabs.push(tab);

    tabEl.addEventListener('click', (e) => {
      if (!e.target.classList.contains('tab-close')) switchTab(tab);
    });

    tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(tab);
    });

    webview.addEventListener('dom-ready', () => {
      try {
        webview.setZoomLevel(0);
      } catch (e) {}
      if (activeTab && activeTab.id === tabId) {
        webview.classList.add('active');
      }
    });

    webview.addEventListener('did-start-loading', () => {
      tabEl.querySelector('.tab-title').textContent = '⟳';
    });

    webview.addEventListener('did-stop-loading', () => {
      try {
        const currentUrl = webview.getURL();
        const title = webview.getTitle() || new URL(currentUrl).hostname;
        tab.url = currentUrl;
        tab.title = title;
        tabEl.querySelector('.tab-title').textContent = title.length > 20 ? title.substring(0, 20) + '...' : title;
        if (tab === activeTab) searchInput.value = currentUrl;
        addToHistory(currentUrl, title);
      } catch (e) {}
      updateNavState();
    });

    webview.addEventListener('did-fail-load', (e) => {
      if (e.errorCode !== -3) {
        tabEl.querySelector('.tab-title').textContent = 'Yükleme hatası';
      }
    });

    webview.addEventListener('did-navigate', (e) => {
      if (e && e.url) {
        tab.url = e.url;
        if (tab === activeTab) searchInput.value = e.url;
      }
      updateNavState();
    });

    webview.addEventListener('did-navigate-in-page', (e) => {
      if (e && e.url) {
        tab.url = e.url;
        if (tab === activeTab) searchInput.value = e.url;
      }
      updateNavState();
    });

    webview.addEventListener('page-title-updated', (e) => {
      if (e && e.title) {
        tab.title = e.title;
        const shortTitle = e.title.length > 20 ? e.title.substring(0, 20) + '...' : e.title;
        tabEl.querySelector('.tab-title').textContent = shortTitle;
      }
    });

    webview.addEventListener('did-finish-load', () => {
      webview.executeJavaScript(`
        document.addEventListener('submit', (e) => {
          const form = e.target;
          const inputs = form.querySelectorAll('input[type="password"]');
          if (inputs.length > 0) {
            const data = { url: window.location.href, fields: [] };
            form.querySelectorAll('input').forEach(inp => {
              if (inp.type === 'password' || inp.type === 'text' || inp.type === 'email') {
                data.fields.push({ name: inp.name, type: inp.type, value: inp.value });
              }
            });
            console.log('PASSWORD_DETECTED', JSON.stringify(data));
          }
        });
      `).catch(() => {});
    });

    webview.addEventListener('console-message', (e) => {
      if (e.message && e.message.startsWith('PASSWORD_DETECTED')) {
        const data = JSON.parse(e.message.replace('PASSWORD_DETECTED ', ''));
        savePassword(data);
      }
    });

    switchTab(tab);
    return tab;
  }

  function switchTab(tab) {
    if (activeTab === tab) return;
    tabs.forEach(t => {
      t.webview.classList.remove('active');
      t.tabEl.classList.remove('active');
    });
    tab.webview.classList.add('active');
    tab.tabEl.classList.add('active');
    activeTab = tab;
    searchInput.value = tab.url;
    updateNavState();
  }

  function closeTab(tab) {
    const index = tabs.indexOf(tab);
    if (index === -1) return;
    tabs.splice(index, 1);
    tab.webview.remove();
    tab.tabEl.remove();
    if (tabs.length === 0) {
      createTab();
    } else {
      const nextTab = tabs[Math.min(index, tabs.length - 1)];
      switchTab(nextTab);
    }
  }

  newTabBtn.addEventListener('click', () => createTab());

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!activeTab) return;
    const target = toSearchOrUrl(searchInput.value);
    if (target) activeTab.webview.src = target;
  });

  backBtn.addEventListener('click', () => { 
    if (activeTab && activeTab.webview.canGoBack()) {
      activeTab.webview.goBack();
    }
  });
  
  forwardBtn.addEventListener('click', () => { 
    if (activeTab && activeTab.webview.canGoForward()) {
      activeTab.webview.goForward();
    }
  });
  
  reloadBtn.addEventListener('click', () => { 
    if (activeTab) activeTab.webview.reload();
  });
  
  homeBtn.addEventListener('click', () => { 
    if (activeTab) activeTab.webview.src = 'https://www.ecosia.org/';
  });

  function updateNavState() {
    if (!activeTab) {
      backBtn.disabled = true;
      forwardBtn.disabled = true;
      return;
    }
    try {
      backBtn.disabled = !activeTab.webview.canGoBack();
      forwardBtn.disabled = !activeTab.webview.canGoForward();
    } catch {
      backBtn.disabled = true;
      forwardBtn.disabled = true;
    }
  }

  async function savePassword(data) {
    const key = new URL(data.url).hostname;
    if (!passwords[key]) {
      passwords[key] = data.fields;
      await window.uzun.passwords.save(passwords);
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 't') { e.preventDefault(); createTab(); }
    if (e.ctrlKey && e.key === 'w') { e.preventDefault(); if (activeTab && tabs.length > 1) closeTab(activeTab); }
    if (e.ctrlKey && e.key === 'r') { e.preventDefault(); if (activeTab) activeTab.webview.reload(); }
    if (e.ctrlKey && e.key === 'd') { e.preventDefault(); addCurrentBookmark.click(); }
    if (e.ctrlKey && e.key === 'b') { e.preventDefault(); bookmarksBtn.click(); }
    if (e.ctrlKey && e.key === 'h') { e.preventDefault(); historyBtn.click(); }
    if (e.ctrlKey && e.key === 'l') { e.preventDefault(); searchInput.focus(); searchInput.select(); }
    if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); backBtn.click(); }
    if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); forwardBtn.click(); }
    if (e.ctrlKey && e.key === 'Tab') { 
      e.preventDefault(); 
      const idx = tabs.indexOf(activeTab); 
      switchTab(tabs[(idx + 1) % tabs.length]); 
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'Tab') { 
      e.preventDefault(); 
      const idx = tabs.indexOf(activeTab); 
      switchTab(tabs[(idx - 1 + tabs.length) % tabs.length]); 
    }
  });

  document.getElementById('newWindowBtn').addEventListener('click', () => {
    alert('Yeni pencere özelliği yakında eklenecek!');
  });
  document.getElementById('settingsBtn').addEventListener('click', () => {
    alert('Ayarlar paneli yakında eklenecek!');
  });
  document.getElementById('aboutBtn').addEventListener('click', () => {
    alert('Uzun Browser v1.0\nKompakt, minimal, hızlı.');
  });

  createTab();
});
