const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require("electron-updater");
const path = require('path');
const url = require('url');

const RPC = require('discord-rpc');
const client = new RPC.Client({
    transport: 'ipc'
});

client.on('ready', () => {
    client.request('SET_ACTIVITY', {
        pid: process.pid,
        activity: {
            details: "⭐ • Rejoins nous vite!",
            state: "⛓️ • www.bobbax.fr",
            timestamps: {
                start: Date.now()
            },
            assets: {
                large_image: "rpc", // large image key from developer portal > rich presence > art assets
                large_text: "teeeest"
            },
            buttons: [
                { label: "🎮 Jouer", url: "http://bobbax.fr/" },
                { label: "💬 Discord", url: "https://discord.gg/fSvJ7cwP4R" }
            ]
        }
    });
});

client.login({
    clientId: '738852320816922654', // put the client id from the dev portal here
    clientSecret: 'xt_ciY-5Dy69y0p6_XfO_uBb157Tr_EH' // put the client secret from the dev portal here
});

try {

    let win;
    let link;
    let pluginName;

    switch (process.platform) {
        case 'win32':
            if (process.arch === "x32" || process.arch === "ia32") {
                pluginName = 'win/pepflashplayer-32.dll';
            } else {
                pluginName = 'win/pepflashplayer.dll';
            }
            break;
        case 'darwin':
            pluginName = 'mac/PepperFlashPlayer.plugin';
            break;
        case "linux":
            if (process.arch === "arm") {
                pluginName = 'lin/libpepflashplayer_arm.so';
            } else {
                pluginName = 'lin/libpepflashplayer_amd.so';
            }
            break;
        case "freebsd":
        case "netbsd":
        case "openbsd":
            pluginName = 'libpepflashplayer.so';
            break;
    }
    //app.commandLine.appendSwitch("disable-renderer-backgrounding");
    if (process.platform !== "darwin") {
        app.commandLine.appendSwitch('high-dpi-support', "1");
        app.commandLine.appendSwitch('force-device-scale-factor', "1");
    }
    app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname.includes(".asar") ? process.resourcesPath : __dirname, "flash/" + pluginName));
    //app.disableHardwareAcceleration();
    app.commandLine.appendSwitch('disable-site-isolation-trials');
    //app.commandLine.appendSwitch('no-sandbox');


    let initWindow = async () => {

        win = new BrowserWindow({
            title: "Bobbax Hôtel",
            width: 970,
            height: 585,
            webPreferences: {
                plugins: true,
                nodeIntegration: true,
                enableRemoteModule: true,
                contextIsolation: false,
                nodeIntegrationInWorker: true
            },
            show: true,
            frame: false,
            transparent: true
        });

        win.on('closed', () => {
            win = null;
        });


        let deeplinkingUrl;

        //win.webContents.openDevTools();

        if (process.platform == 'win32') {
            // Keep only command line / deep linked arguments
            deeplinkingUrl = process.argv.slice(1)
            link = deeplinkingUrl;
        }
        logEverywhere('url# ' + deeplinkingUrl)

        win.loadFile('index.html');



    }

    function logEverywhere(s) {
        console.log(s)
        if (win && win.webContents) {
            win.webContents.executeJavaScript(`console.log("${s}")`)
        }
    }

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.exit(0);
            app.quit();
        }
    });

    app.on('before-quit', () => {
        win.removeAllListeners('close');
        win.close();
    });

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
