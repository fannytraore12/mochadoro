const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// --- Serial (Arduino) setup ---
// Wrapped in try/catch: if the 'serialport' package isn't installed or its
// native binding fails to load, this would otherwise throw here and crash
// the ENTIRE main process before the window, minimize, or close handlers
// ever get set up.
let SerialPort = null;
try {
    ({ SerialPort } = require('serialport'));
} catch (err) {
    console.error('serialport module unavailable — Arduino features disabled:', err.message);
}

let arduinoPort = null;

function initSerial() {
    if (!SerialPort) return; // module failed to load; skip silently

    try {
        arduinoPort = new SerialPort({ path: 'COM3', baudRate: 9600 });

        arduinoPort.on('error', (err) => {
            console.error('Serial bus fault:', err.message);
        });

        arduinoPort.on('close', () => {
            console.log('Port lost');
            arduinoPort = null;
        });
    } catch (err) {
        console.error('Failed to open serial port:', err.message);
        arduinoPort = null;
    }
}

function sendCommand(cmd) {
    if (!arduinoPort || !arduinoPort.isOpen) {
        console.warn('Skipping write: port offline');
        return;
    }
    arduinoPort.write(cmd + '\n', 'utf8');
}

// --- Window setup ---
function createWindow() {
    const win = new BrowserWindow({
        width: 620,
        height: 800,
        resizable: false,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.loadFile('index.html');
    return win;
}

app.whenReady().then(() => {
    const win = createWindow();

    initSerial();

    ipcMain.on('arduino-cmd', (_, cmd) => sendCommand(cmd));

    ipcMain.on('minimize-window', () => {
        win.minimize();
    });

    ipcMain.on('close-window', () => {
        win.close();
    });

    app.on('before-quit', () => {
        if (arduinoPort && arduinoPort.isOpen) arduinoPort.close();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});