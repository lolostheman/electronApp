const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
//const unrar = requrie('node-unrar-js')
const path = require('path')
const fs = require('fs-extra');
const { truncate } = require('fs');

let RomDirectory = undefined
let YuzuDirectory = undefined


// async function extractMultiPartRar(filePath, outputDir) {
//   try {

//     const archive = unrar.createExtractorFromFile(filePath);
//     await archive.extract(outputDir);
    
//     console.log('RAR archive extracted successfully.');
//   } catch (error) {
//     console.error('Error extracting RAR archive:', error);
//   }
// }


async function handleRomOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory'],
    buttonLabel: 'Select Rom Directory',
    title: 'Yuzu Rom Selection'
  })
  if (!canceled) {
    RomDirectory = filePaths[0] + '/'
    return filePaths[0]
  } else {
    RomDirectory = undefined
  }
}
async function handleYuzuOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory'],
    buttonLabel: 'Select Yuzu Installation Directory',
    title: 'Yuzu Installation Selection'
  })
  if (!canceled) {
    YuzuDirectory = filePaths[0] + '/'
    return filePaths[0]
  } else {
    YuzuDirectory = undefined
  }
}
function submit() {
  if (RomDirectory === undefined) {
    throwMessageBox()
  } else {
    transferFiles()
  }
}
function throwMessageBox() {
  const window = BrowserWindow.getFocusedWindow();
  dialog.showMessageBox(window, {
    title: "Missing Directories to Continue",
    type: 'error',
    buttons: ["OK", "Cancel", "Im gay"],
    message: "Please Select Rom Directory!"
  }).then(box => {
    console.log('Button Clicked Index - ', box.response)

  }).catch(err => {
    console.log(err)
  })

}
function transferFiles() {
  const localUserRoaming = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
  const keysDir = path.join(localUserRoaming, 'yuzu', 'keys/')
  const firmwareDir = path.join(localUserRoaming, 'yuzu', 'nand', 'system', 'Contents', 'registered/')
  const yuzuConfigFile = path.join(localUserRoaming, 'yuzu', 'config', 'qt-config.ini')

  //transfer keys & firmware
  const curKeyPath = path.join(__dirname, "assets", "keys/")
  fs.readdirSync(curKeyPath).forEach((file) => {
    // console.log(curKeyPath + file, keysDir + file)
    fs.copyFileSync(curKeyPath + file, keysDir + file)
  })
  const curFirmPath = path.join(__dirname, "assets", "registered/")
  fs.readdirSync(curFirmPath).forEach((file) => {
    // console.log(curFirmPath + file, firmwareDir + file)
    fs.copyFileSync(curFirmPath + file, firmwareDir + file)
  })

  //transfer DA ROM
  try {
    // check if directory already exists
    if (!fs.existsSync(path.join(RomDirectory, "SuperSmashBros"))) {
        fs.mkdirSync(path.join(RomDirectory, "SuperSmashBros"));
        console.log("Directory is created.");
    } else {
        console.log("Directory already exists.");
    }
} catch (err) {
    console.log(err);
}
  const smashAssetPath = path.join(__dirname, "assets", "SuperSmashBrosAssets/")
  const smashPartPath = path.join(__dirname, "assets", "SuperSmashBrosParts/")
  fs.move(smashAssetPath, path.join(RomDirectory, "SuperSmashBros", "SuperSmashBrosAssets"), err => {
    err ? console.log(err) : console.log("success on da roms")
  })
  let progress = 0.25
  const window = BrowserWindow.getFocusedWindow();
  fs.readdirSync(smashPartPath).forEach((file) => {
    // console.log(curFirmPath + file, firmwareDir + file)
    fs.move(smashPartPath + file, path.join(RomDirectory,"SuperSmashBros", file))
    window.setProgressBar(progress)
    progress += 0.25
  })
  window.setProgressBar(-1)
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: false,
    }
  })
  mainWindow.setMenu(null)
  mainWindow.loadFile('index.html')
}


async function checkForZeroTier() {
  const localUserRoaming = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
  const zeroTierDir = path.join(localUserRoaming, '..', 'Local', "ZeroTier")
  try {
    await fs.access(zeroTierDir)
    return true
  } catch (error) {
    return false
  }

}
function installZeroTier() {
  shell.openExternal('https://download.zerotier.com/dist/ZeroTier%20One.msi')

}


async function checkForYuzu() {
  const localUserRoaming = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
  const yuzuDir = path.join(localUserRoaming, "..", 'Roaming', 'yuzu')
  try {
    await fs.access(yuzuDir);
    return true
  } catch (error) {
    return false
  }
}


function showDialog() {
  return new Promise((resolve, reject) => {
  const window = BrowserWindow.getFocusedWindow();
  dialog.showMessageBox(window, {
    title: "Missing Yuzu Installation",
    type: 'error',
    buttons: ["Install Yuzu", "Cancel", "Im gay"],
    message: "You must have Yuzu installed in order to continue!"
  }).then(box => {
    if(box.response === 0) {
      resolve(true)
    } else {
      resolve(false)
    }

  }).catch(err => {
    console.log(err)
  })
  })
}


async function checkForReqs() {
  const result = await checkForYuzu()
  if (!result) {
    try {
      const installClicked = await showDialog()
      if(installClicked) {
        shell.openExternal('https://github.com/yuzu-emu/liftinstall/releases/download/1.9/yuzu_install.exe')
        checkForReqs()
      } else {
        checkForReqs()
      }
    } catch (error) {
      console.error(error)
    }

  }

}
function refresh() {
  const window = BrowserWindow.getFocusedWindow();
  window.reload();
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:openRom', handleRomOpen)
  ipcMain.handle('dialog:openYuzu', handleYuzuOpen)
  ipcMain.handle('dialog:saveFiles', submit)
  ipcMain.handle('dialog:checkZeroTier', checkForZeroTier)
  ipcMain.handle('dialog:checkYuzu', checkForYuzu)
  ipcMain.handle('dialog:refresh', refresh)
  ipcMain.handle('dialog:zeroTierInstall', installZeroTier)
  checkForReqs()
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})