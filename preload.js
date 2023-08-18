const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
  // we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld('electronAPI', {
  openRomDir: () => ipcRenderer.invoke('dialog:openRom'),
  openYuzuDir: () => ipcRenderer.invoke('dialog:openYuzu'),
  submitFiles: () => ipcRenderer.invoke('dialog:saveFiles'),
  checkZeroTier: () => ipcRenderer.invoke('dialog:checkZeroTier'),
  checkYuzu: () => ipcRenderer.invoke('dialog:checkYuzu'),
  refreshPage: () => ipcRenderer.invoke('dialog:refresh'),
  zeroTierLink: () => ipcRenderer.invoke('dialog:zeroTierInstall')
})

// process.once('loaded', () => {
//   window.addEventListener('message', evt => {
//     if (evt.data.type === 'select-dirs') {
//       ipcRenderer.send('select-dirs')
//     }
//   })
// })