const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require("electron-updater");

try {

    let win;
    let link;

    let initWindow = async () => {

        win = new BrowserWindow({
            width: 970,
            height: 585,
            webPreferences: {
                plugins: true,
                nodeIntegration: true
            },
            show: true,
            frame: false,
            transparent: true
        });

        win.loadFile('index.html');

    }

    app.on('ready', async () => {
        await initWindow();
        await autoUpdater.checkForUpdatesAndNotify();
    });

    app.on('open-url', function (event, data) {
        event.preventDefault();
        link = data;
    });

    app.setAsDefaultProtocolClient('bobbax');


    /*
     *     Auto Updater
     */

    autoUpdater.on('checking-for-update', () => {
        sendWindow('checking-for-update', '');
    });
    autoUpdater.on('update-available', () => {
        sendWindow('update-available', '');
    });
    autoUpdater.on('update-not-available', () => {
        sendWindow('update-not-available', '');
    });
    autoUpdater.on('error', (err) => {
        sendWindow('error', 'Error: ' + err);
    });
    autoUpdater.on('download-progress', (d) => {
        sendWindow('download-progress', {
            speed: d.bytesPerSecond,
            percent: d.percent,
            transferred: d.transferred,
            total: d.total
        });
    });
    autoUpdater.on('update-downloaded', () => {
        sendWindow('update-downloaded', 'Update downloaded');
        autoUpdater.quitAndInstall();
    });

    module.exports.getLink = () => link;

} catch (e) {

    app.exit(0);
    app.quit();

}