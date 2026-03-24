/**
 * Electron Preload Script
 * contextIsolation: true ile çalışır.
 * Renderer process'e Node.js/Electron API'larını güvenli şekilde köprüler.
 * Mevcut uygulama yalnızca web içeriği yüklediğinden intentionally minimal tutulmuştur.
 */
const { contextBridge, ipcRenderer } = require('electron');

// Sadece ihtiyaç duyulan API'ları güvenli şekilde expose et
contextBridge.exposeInMainWorld('electronAPI', {
  // Uygulama versiyonu
  getVersion: () => ipcRenderer.invoke('get-version'),
  // Platform bilgisi (renderer'da process.platform kullanamayız)
  platform: process.platform,
});
