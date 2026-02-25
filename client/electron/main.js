const { app, BrowserWindow, dialog, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

// Updater log ayarları (dosyaya yazar)
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// 1. GÜVENLİ PROTOKOL TANIMLAMASI
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }
]);

// 2. YIKICI VE YENİDEN YAPICI: SADECE ADMIN'I TANIYAN KATI DOSYA OKUYUCU
function registerNativeAdminProtocol() {
    protocol.registerFileProtocol('app', (request, callback) => {
        const urlObj = new URL(request.url);
        let pathname = decodeURIComponent(urlObj.pathname);

        // --- KÖKTEN KİLİT 1: ANA SİTEYE ERİŞİMİ YASAKLA ---
        if (pathname === '/' || pathname === '' || pathname === '/index.html') {
            log.warn('Electron tarafında anasayfaya sızıntı tespit edildi, doğrudan Admin Login dosyasına kilitleniyor.');
            pathname = '/admin/login'; // Doğrudan login rotasına yönlendir
        }

        const outPath = path.join(__dirname, '../out');
        let filePath = path.join(outPath, pathname);

        // Canlı Dosya Arama Algoritması (Next.js Statik Dosyalama)
        const stat = (p) => { try { return fs.statSync(p); } catch (e) { return null; } };

        let finalPath = '';
        if (stat(filePath) && stat(filePath).isFile()) {
            finalPath = filePath;
        } else if (stat(filePath + '.html')) {
            finalPath = filePath + '.html'; // Örneğin /admin/login -> /admin/login.html
        } else if (stat(path.join(filePath, 'index.html'))) {
            finalPath = path.join(filePath, 'index.html');
        } else {
            // Hiçbiri yoksa ana web sitesinin(index.html) AÇILMASINI ENGELLEMEK için sadece admin/login fallback!
            finalPath = path.join(outPath, 'admin/login.html');
            if (!stat(finalPath)) finalPath = path.join(outPath, 'admin.html'); // O da yoksa admin.html
        }

        callback({ path: finalPath });
    });
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000/admin/login');
        mainWindow.webContents.openDevTools();
    } else {
        // --- 3. DİREKT ÖZEL PROTOKOLE GİDİŞ ---
        mainWindow.loadURL('app://-/admin/login');
    }

    // --- 4. HARD-CODED GİRİŞ KİLİDİ (WILL-NAVIGATE EVENT) ---
    mainWindow.webContents.on('will-navigate', (event, url) => {
        try {
            const parsedUrl = new URL(url);

            // Dış dünyadaki veya uygulamanın kökündeki rotalara gidişi blokla
            if (
                parsedUrl.pathname === '/' ||
                parsedUrl.pathname === '' ||
                parsedUrl.pathname === '/index.html' ||
                parsedUrl.hostname.includes('skpro.com.tr') // Canlı domain engellemesi
            ) {
                event.preventDefault();
                log.warn('Hard-Coded navigate kilidi tetiklendi. Web sitesi sızıntısı engellendi. Hedef:', url);

                // Güvenli limana geri dön
                if (isDev) {
                    mainWindow.loadURL('http://localhost:3000/admin/login');
                } else {
                    mainWindow.loadURL('app://-/admin/login');
                }
            }
        } catch (error) {
            log.error('Navigation error caught:', error);
        }
    });
}

app.whenReady().then(() => {
    // Protokolü ayağa kaldır
    if (!isDev) {
        registerNativeAdminProtocol();
    }
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    if (!isDev) {
        autoUpdater.checkForUpdatesAndNotify();
    }
});

/* --- AUTO UPDATER EVENT LISTENER LISTESI --- */
autoUpdater.on('checking-for-update', () => log.info('Güncelleme kontrol ediliyor...'));
autoUpdater.on('update-available', (info) => log.info('Güncelleme bulundu: ', info));
autoUpdater.on('update-not-available', (info) => log.info('Şu anki sürüm en günceli: ', info));
autoUpdater.on('error', (err) => log.error('Güncelleme hatası: ', err));

autoUpdater.on('download-progress', (progressObj) => {
    log.info(`İndirme Hızı: ${progressObj.bytesPerSecond} - İndirilen ${Math.round(progressObj.percent)}% (${progressObj.transferred}/${progressObj.total})`);
});

autoUpdater.on('update-downloaded', (info) => {
    log.info('Güncelleme başarıyla indirildi: ', info);

    const dialogOpts = {
        type: 'info',
        buttons: ['Yeniden Başlat', 'Daha Sonra'],
        title: 'Uygulama Güncellemesi',
        message: process.platform === 'win32' ? info.releaseNotes : info.releaseName,
        detail: 'Yeni bir sürüm başarıyla indirildi. Güncellemeyi tamamlamak için uygulamayı hemen yeniden başlatmak ister misiniz?'
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) {
            // --- 5. GHOST PROCESS TEMİZLİĞİ: SERT KAPATMA MANTIĞI ---
            log.info('Yol temizliği: Tüm süreçler zorla kapatılıyor...');
            app.removeAllListeners('window-all-closed');
            BrowserWindow.getAllWindows().forEach((w) => {
                if (!w.isDestroyed()) w.close();
            });

            setTimeout(() => {
                autoUpdater.quitAndInstall(true, true); // (isSilent, isForceRunAfter)
                app.quit();

                // Eğer hala yaşayan süreç varsa Node altyapısından yok et
                setTimeout(() => {
                    process.exit(0);
                }, 500);
            }, 300);
        }
    });
});
/* ----------------------------------------- */

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
