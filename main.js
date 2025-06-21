const { autoUpdater } = require('electron-updater');
const { app, BrowserWindow, Notification, dialog, Menu } = require('electron');
const path = require('path');

let splash;
let mainWindow;

autoUpdater.on('update-available', () => {
    // Optionally notify user that a new update is downloading
});

autoUpdater.on('update-downloaded', () => {
    // Optionally prompt the user to restart now
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'A new version has been downloaded. Please restart the app to apply the update.'
    }).then(() => {
        autoUpdater.quitAndInstall();
    });
});

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

    // Prevent opening new external windows/tabs
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // Instead of opening a new window, load the URL in the same window
        mainWindow.loadURL(url);
        return { action: 'deny' };
    })

    mainWindow.loadURL('https://app.ghlsandbox.com');
    mainWindow.setTitle(`GHL Sandbox v${app.getVersion()}`);

    mainWindow.on('page-title-updated', (event) => {
        event.preventDefault();
        mainWindow.setTitle(`GHL Sandbox v${app.getVersion()}`);
    });

    // Hide the menu bar
    mainWindow.setMenu(null);

    const menuTemplate = [
        {
            label: 'Navigation',
            submenu: [
                {
                    label: 'Support',
                    click: () => {
                        mainWindow.loadURL('https://support.ghlsandbox.net');
                    }
                },
                {
                    label: 'Community',
                    click: () => {
                        mainWindow.loadURL('https://community.ghlsandbox.net')
                    }
                },
                {
                    label: 'Enroll',
                    click: () => {
                        mainWindow.loadURL('https://ghlsandbox.net');
                    }
                },
                { type: 'separator' },
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
    const menu = Menu.buildFromTemplate(menuTemplate);
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