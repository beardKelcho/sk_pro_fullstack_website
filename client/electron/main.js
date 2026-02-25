const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
// require('electron-serve') modülünü kullanıyoruz (import sorunu için .default fallback)
const serve = require('electron-serve').default || require('electron-serve');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

// Updater log ayarları (dosyaya yazar)
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// electron-serve konfigürasyonu (out klasörünü native servis eder)
const loadURL = serve({ directory: path.join(__dirname, '../out') });

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
        mainWindow.loadURL('http://localhost:3000/admin');
        mainWindow.webContents.openDevTools();
    } else {
        // TAMAMEN YEREL (NATIVE) ÇALIŞTIRMA MANTIĞI:
        loadURL(mainWindow).then(() => {
            // out klasöründeki admin panelini zorunlu aç, static HTML dosyasını tam belirt
            mainWindow.loadURL('app://-/admin/login.html');
        });
    }

    // Uygulama içerisinden public web sitelerine veya anasayfaya (/) sızmayı TAMAMEN KİLİTLİYORUZ.
    mainWindow.webContents.on('will-navigate', (event, url) => {
        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.protocol === 'app:') {
                const pn = parsedUrl.pathname;
                // Eğer anasayfaya (web sitesine) gitmeye çalışırsa engelle ve admin'e yönlendir
                if (pn === '/' || pn === '' || pn === '/index.html') {
                    event.preventDefault();
                    mainWindow.loadURL('app://-/admin/login.html');
                }
            }
        } catch (error) {
            log.error('Navigation error caught:', error);
        }
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    // Güncelleme Kontrolcüsünü Sadece Paket (Production) Aşamasında Başlat
    if (!isDev) {
        autoUpdater.checkForUpdatesAndNotify();
    }
});

/* --- AUTO UPDATER EVENT LISTENER LISTESI --- */
autoUpdater.on('checking-for-update', () => {
    log.info('Güncelleme kontrol ediliyor...');
});

autoUpdater.on('update-available', (info) => {
    log.info('Güncelleme bulundu: ', info);
});

autoUpdater.on('update-not-available', (info) => {
    log.info('Şu anki sürüm en günceli: ', info);
});

autoUpdater.on('error', (err) => {
    log.error('Güncelleme hatası: ', err);
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "İndirme Hızı: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - İndirilen ' + Math.round(progressObj.percent) + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    log.info(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
    log.info('Güncelleme başarıyla indirildi: ', info);

    // Kullanıcıya Dialog aracılığıyla onay sor
    const dialogOpts = {
        type: 'info',
        buttons: ['Yeniden Başlat', 'Daha Sonra'],
        title: 'Uygulama Güncellemesi',
        message: process.platform === 'win32' ? info.releaseNotes : info.releaseName,
        detail: 'Yeni bir sürüm başarıyla indirildi. Güncellemeyi tamamlamak için uygulamayı hemen yeniden başlatmak ister misiniz?'
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) {
            // Açık kalan tüm pencerelerin yükleyiciyi bloke etmemesi için zorla kapat
            app.removeAllListeners('window-all-closed');
            const windows = BrowserWindow.getAllWindows();
            if (windows.length) {
                windows.forEach((w) => w.close());
            }

            // UI thread'ini rahatlatıp yükleyiciyi başlat
            setImmediate(() => {
                autoUpdater.quitAndInstall(false, true); // (isSilent, isForceRunAfter)
            });
        }
    });
});
/* ----------------------------------------- */

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
