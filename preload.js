const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('uzun', {
  window: {
    closeWindow: () => ipcRenderer.send('window-close'),
    minimizeWindow: () => ipcRenderer.send('window-minimize'),
    maximizeWindow: () => ipcRenderer.send('window-maximize'),  // ✅ EKLE
  },
  bookmarks: {
    load: () => ipcRenderer.invoke('bookmarks:load'),
    save: (data) => ipcRenderer.invoke('bookmarks:save', data)
  },
  passwords: {
    load: () => ipcRenderer.invoke('passwords:load'),
    save: (data) => ipcRenderer.invoke('passwords:save', data)
  },
  history: {
    load: () => ipcRenderer.invoke('history:load'),
    save: (data) => ipcRenderer.invoke('history:save', data)
  },
  downloads: {
    load: () => ipcRenderer.invoke('downloads:load'),
    save: (data) => ipcRenderer.invoke('downloads:save', data)
  }
});
