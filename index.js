'use strict';
const path = require('path');
const {app, BrowserWindow, Menu} = require('electron');
const {autoUpdater} = require('electron-updater');
const {is} = require('electron-util');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');
const contextMenu = require('electron-context-menu');
const config = require('./config');
const menu = require('./menu');
const packageJson = require('./package.json');
unhandled();
debug();
contextMenu();
app.setAppUserModelId(packageJson.build.appId);
if (!is.development) {
	const FOUR_HOURS = 1000 * 60 * 60 * 4;
	setInterval(() => {
		autoUpdater.checkForUpdates();
	}, FOUR_HOURS);

	autoUpdater.checkForUpdates();
}
let mainWindow;
const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: "SamuelCode",
		show: false,
		width: 1000,
		height: 800,
		webPreferences: {
			nodeIntegration: true
		}
	});
	win.on('ready-to-show', () => {
		win.show();
	});
	win.on('closed', () => {
		mainWindow = undefined;
	});
	await win.loadFile(path.join(__dirname, 'index.html'));
	return win;
};
if (!app.requestSingleInstanceLock()) {
	app.quit();
}
app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}
		mainWindow.show();
	}
});
app.on('window-all-closed', () => {
	if (!is.macos) {
		app.quit();
	}
});
app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});
(async () => {
	await app.whenReady();
	Menu.setApplicationMenu(menu);
	mainWindow = await createMainWindow();
})();
