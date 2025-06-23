const { autoUpdater } = require('electron-updater');
const { app, BrowserWindow, Notification, dialog, Menu } = require('electron');
const fs = require('fs');
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
    // 1. Create the main window
    createWindow();              

    // 2. Set up autoUpdater event listeners (these can be before or after checkForUpdates)
    autoUpdater.on('checking-for-update', () => console.log('Checking for updates...'));
    autoUpdater.on('update-available', () => console.log('Update available!'));
    autoUpdater.on('update-not-available', () => console.log('No update available.'));
    autoUpdater.on('error', (err) => console.error('Updater error:', err));
    autoUpdater.on('update-downloaded', () => {
        console.log('Update downloaded!');
        // Optional prompt to restart
        dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'A new version has been downloaded. Restart now to update?',
        buttons: ['Restart', 'Later']
        }).then(result => {
        if (result.response === 0) autoUpdater.quitAndInstall();
        });
    });

    // 3. Check for updates after everything is set up
    autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});