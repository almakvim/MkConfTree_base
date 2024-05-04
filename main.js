const { app, BrowserWindow } = require('electron')
const path = require('path')
const ipcMain = require('electron').ipcMain
const dialog = require('electron').dialog
//const fs = require('fs')
let win

// open a window
openWindow = (type) => {
  win = new BrowserWindow({
    width: 650, //1250, 650
    height: 1150,
    //show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  })
  //============================================
  //win.webContents.openDevTools() // Отладка
  //============================================
  if (type === 'tree') {
    //win.loadFile('./preload.js')
    win.loadFile('./tree.html') // image window
  } else {
    win.loadFile('./hello.html') // default window
  }
}

// when app is ready, create a window
app.on('ready', () => {
  openWindow() // open default window
})

// when all windows are closed, quit the application
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit() // exit
  }
})

// when application is activated, open default window
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    openWindow() // open default window
  }
})
//========================================= Сохранить выбранные узлы
ipcMain.on('save-favor-dialog', (event) => {
  let filePath = path.join(__dirname, 'favorites')
  if (filePath.includes('\\app.asar\\'))
    filePath = filePath.replace('\\app.asar\\', '\\')

  dialog
    .showOpenDialog({
      title: 'Сохранить выбранные узлы в файл',
      defaultPath: filePath,
      buttonLabel: 'Сохранить',
      filters: [
        { name: 'All Files', extensions: ['*'] },
        //{ name: 'JSON', extensions: ['json'] },
      ],
      properties: ['openFile', 'multiSelections', 'showHiddenFiles'],
    })
    .then((data) => {
      event.sender.send('save-selected-favor', data.filePaths)
    })
})
//========================================= Сохранить конфигурацию в файл
ipcMain.on('save-file-dialog', (event) => {
  let filePath = path.join(__dirname, 'init')
  if (filePath.includes('\\app.asar\\'))
    filePath = filePath.replace('\\app.asar\\', '\\')

  dialog
    .showOpenDialog({
      title: 'Сохранить конфигурацию в файл',
      defaultPath: filePath,
      buttonLabel: 'Сохранить',
      filters: [
        { name: 'All Files', extensions: ['*'] },
        //{ name: 'JSON', extensions: ['json'] },
      ],
      properties: ['openFile', 'multiSelections', 'showHiddenFiles'],
    })
    .then((data) => {
      event.sender.send('save-selected-file', data.filePaths)
    })
})
//========================================= Загрузить конфигурацию из файла
ipcMain.on('open-file-dialog', (event) => {
  let filePath = path.join(__dirname, 'init')
  if (filePath.includes('\\app.asar\\'))
    filePath = filePath.replace('\\app.asar\\', '\\')

  dialog
    .showOpenDialog({
      title: 'Загрузить конфигурацию из файла',
      defaultPath: filePath,
      buttonLabel: 'Выбрать',
      filters: [
        { name: 'JSON', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile', 'multiSelections', 'showHiddenFiles'],
    })
    .then((data) => {
      event.sender.send('open-selected-file', data.filePaths)
    })
})
//========================================= Добавить/Отменить выбранные узлы
ipcMain.on('open-favor-dialog', (event) => {
  let filePath = path.join(__dirname, 'favorites')
  if (filePath.includes('\\app.asar\\'))
    filePath = filePath.replace('\\app.asar\\', '\\')

  dialog
    .showOpenDialog({
      title: 'Добавить/Отменить выбранные узлы из файла',
      defaultPath: filePath,
      buttonLabel: 'Выбрать',
      filters: [
        { name: 'JSON', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile', 'multiSelections', 'showHiddenFiles'],
    })
    .then((data) => {
      event.sender.send('open-selected-favor', data.filePaths)
    })
})
//========================================= Добавить соединения от устройства
ipcMain.on('open-favor-modal', (event) => {
  let filePath = path.join(__dirname, 'favorites')
  if (filePath.includes('\\app.asar\\'))
    filePath = filePath.replace('\\app.asar\\', '\\')

  dialog
    .showOpenDialog({
      title: 'Добавить/Отменить выбранные узлы из файла',
      defaultPath: filePath,
      buttonLabel: 'Выбрать',
      filters: [
        { name: 'JSON', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile', 'multiSelections', 'showHiddenFiles'],
    })
    .then((data) => {
      event.sender.send('open-modal-favor', data.filePaths)
    })
})
//========================================= Загрузить список из файла
ipcMain.on('open-file-list', (event) => {
  let filePath = path.join(__dirname, 'list')
  if (filePath.includes('\\app.asar\\'))
    filePath = filePath.replace('\\app.asar\\', '\\')

  dialog
    .showOpenDialog({
      title: 'Загрузить список из файла',
      defaultPath: filePath,
      buttonLabel: 'Выбрать',
      filters: [
        { name: 'JSON', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile', 'showHiddenFiles'],
    })
    .then((data) => {
      event.sender.send('open-list-file', data.filePaths)
    })
})
//========================================= Сохранить выбранные узлы
ipcMain.on('save-list-dialog', (event) => {
  let filePath = path.join(__dirname, 'list')
  if (filePath.includes('\\app.asar\\'))
    filePath = filePath.replace('\\app.asar\\', '\\')

  dialog
    .showOpenDialog({
      title: 'Сохранить список в файл',
      defaultPath: filePath,
      buttonLabel: 'Сохранить',
      filters: [
        { name: 'All Files', extensions: ['*'] },
        //{ name: 'JSON', extensions: ['json'] },
      ],
      properties: ['openFile', 'multiSelections', 'showHiddenFiles'],
    })
    .then((data) => {
      event.sender.send('save-selected-list', data.filePaths)
    })
})
//=========================================
ipcMain.on('send:load-tree', () => {
  console.log('[message received]', 'send:rewrite-file')
  app.quit() // exit
  openWindow('tree') // open tree window
})

//=========================================
