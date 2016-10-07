const {app, Tray, Menu, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const GhReleases = require('electron-gh-releases')
const iconPath = path.join(__dirname, 'icon.png')


let options = {
  repo: 'sgtaziz/RemoteMessages-Client',
  currentVersion: app.getVersion()
}

const updater = new GhReleases(options)

let appIcon

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

var forceQuit = false

function createWindow () {
	//Perform update
	updater.check((err, status) => {
		if (!err && status) {
			updater.download()
		}
	})
	updater.on('update-downloaded', (info) => {
		updater.install()
	})

	win = new BrowserWindow({width: 800, height: 600, icon:`${__dirname}/icon.png`})
	win.setMenu(null)

	if (process.platform !== 'darwin') {
		appIcon = new Tray(iconPath)

		var contextMenu = Menu.buildFromTemplate([
			{
				label: 'Quit',
				click: function() {
					forceQuit = true
					app.quit()
				}
			}
		])

		appIcon.setToolTip('Remote Messages')
		appIcon.setContextMenu(contextMenu)

		appIcon.on('click', function(alt, shift, ctrl, meta) {
			win.show()
		})
	}

	ipcMain.on('window-focus', (e, msg) => {
		if (win.isMinimized()) win.maximize()
		win.show()
		win.focus()
	})
	// and load the index.html of the app.
	win.loadURL(`file://${__dirname}/index.html`)

	app.on('before-quit', function() {
		if (process.platform !== 'win32') forceQuit = true
	})

	// Emitted when the window is closed.
	win.on('close', (event) => {
		if(!forceQuit && (process.platform !== 'linux' || !win.isMinimized() )) {
			event.preventDefault()
			if (process.platform === 'linux') win.minimize()
			else win.hide()
			return false
		}
	})

	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow()
	} else {
		win.show()
	}
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
