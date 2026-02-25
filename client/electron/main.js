const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const serve = require('electron-serve');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

// Updater log ayarları (dosyaya yazar)
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// electron-serve paketi `/out` klasörü için `app://-` adında bir local sunucu oluşturur
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
        // file:// protokolü yerine custom internal server'ı kullanıyoruz
        loadURL(mainWindow).then(() => {
            mainWindow.loadURL('app://-/admin.html');
        });
    }
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
        if (returnValue.response === 0) autoUpdater.quitAndInstall(); // Onaylanırsa kurar
    });
});
/* ----------------------------------------- */

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
