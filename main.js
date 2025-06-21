const { autoUpdater } = require('electron-updater');
const { app, BrowserWindow, Notification, dialog, Menu } = require('electron');
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
    splash.loadFile('splash.html');

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 900,
        show: false, // Hide main window until ready
        icon: path.join(__dirname, 'icon.png'),
        title: `GHL Sandbox v${app.getVersion()}`,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            devTools: false, // disables F12 in production
        }
    });

    mainWindow.loadURL('https://app.ghlsandbox.com');

    // Hide the menu bar
    mainWindow.setMenu(null);

    const template = [
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About',
                            message: `GHL Sandbox Desktop App \nVersion ${app.getVersion()}\n© 2025 GHL Sandbox`
                        });
                    }
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);

    // Hide but allow Alt key to show menu (Windows only)
    mainWindow.setAutoHideMenuBar(true);
    mainWindow.setMenuBarVisibility(false);

    // Optional: Show a notification when the app loads
    mainWindow.webContents.on('did-finish-load', () => {
        if (splash && !splash.isDestroyed()) {
            splash.close();
        }
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