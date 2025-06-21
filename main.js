const { autoUpdater } = require('electron-updater');
const { app, BrowserWindow, Notification } = require('electron');
const path = require('path');

let splash;
let mainWindow;

function createWindow() {

    splash = new BrowserWindow({
        width: 400,
        height: 300,
        transparent: true,
        frame: false,
        alwaysOnTop: true
    });
    splash.loadFile('splas.html');

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 900,
        show: false, // Hide main window until ready
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            devTools: false, // disables F12 in production
        }
    });

    mainWindow.loadURL('https://app.ghlsandbox.com');

    // Hide the menu bar
    //win.setMenu(null);

    // Hide but allow Alt key to show menu (Windows only)
    mainWindow.setAutoHideMenuBar(true);
    mainWindow.setMenuBarVisibility(false);

    // Optional: Show a notification when the app loads
    mainWindow.webContents.on('did-finish-load', () => {
        splash.close();
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    createWindow();

    // Check for updates after the window is created
    autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});