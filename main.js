const { autoUpdater } = require('electron-updater');
const { app, BrowserWindow, Notification, dialog, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

let splash;
let mainWindow;

// // Wait until app is ready before getting userData path!
// app.on('ready', () => {
//     const logPath = path.join(app.getPath('userData'), 'updater.log');
//     fs.appendFileSync(logPath, `[${new Date().toISOString()}] LOG TEST\n`);
//     console.log('Attempted to write to:', logPath);

//     // Use app.getPath('userData') to get the correct user data folder
//     console.log('Updater log will be written to:', logPath);

//     function logUpdater(message) {
//         fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
//     }

//     autoUpdater.on('checking-for-update', () => logUpdater('Checking for updates...'));
//     autoUpdater.on('update-available', () => logUpdater('Update available!'));
//     autoUpdater.on('update-not-available', () => logUpdater('No update available.'));
//     autoUpdater.on('error', (err) => logUpdater(`Updater error: ${err}`));
//     autoUpdater.on('update-downloaded', () => logUpdater('Update downloaded!'));
// });

// autoUpdater.on('update-downloaded', () => {
//     // Optionally prompt the user to restart now
//     dialog.showMessageBox({
//         type: 'info',
//         title: 'Update Ready',
//         message: 'A new version has been downloaded. Please restart the app to apply the update.'
//     }).then(() => {
//         autoUpdater.quitAndInstall();
//     });
// });

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
            //devTools: false, // disables F12 in production
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

    // Log updater events (for troubleshooting)
    autoUpdater.on('checking-for-update', () => console.log('Checking for updates...'));
    autoUpdater.on('update-available', () => console.log('Update available!'));
    autoUpdater.on('update-not-available', () => console.log('No update available.'));
    autoUpdater.on('error', (err) => console.error('Updater error:', err));
    autoUpdater.on('update-downloaded', () => console.log('Update downloaded!'));

    // Prompt user to update now (optional)
    
    autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: 'A new version has been downloaded. Restart the app to update now?',
        buttons: ['Restart', 'Later']
        }).then(result => {
        if (result.response === 0) autoUpdater.quitAndInstall();
        });
    });

    // Check for updates
    autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});