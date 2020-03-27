/* eslint-disable no-return-await */
import { app, BrowserWindow } from 'electron' // eslint-disable-line
import Server from '../server/index';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;
const SERVER_PORT = 9081;
let mainWindow;
const server = new Server(SERVER_PORT);

process.on('SIGINT', () => {
  server.stop();
  app.quit();
});
process.on('SIGTERM', () => {
  server.stop();
  app.quit();
});

async function createWindow() {
  if (!server.isRunning) {
    await server.stop();
  }

  await server.start();
  console.info('Running backend on port', SERVER_PORT);

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 600,
    useContentSize: true,
    width: 1000,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
    },
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', async () => {
    await server.stop();
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await server.stop();
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall();
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
