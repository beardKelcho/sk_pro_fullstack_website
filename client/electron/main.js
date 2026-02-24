const { app, BrowserWindow } = require('electron');
const path = require('path');
const serve = require('electron-serve');

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
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        // file:// protokolü yerine custom internal server'ı kullanıyoruz
        loadURL(mainWindow);
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
