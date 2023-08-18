
const nodeInfo = document.getElementById('node-version')
const chromeInfo = document.getElementById('chrome-version')
const electronInfo = document.getElementById('electron-version')


nodeInfo.innerText += window.versions.node()
chromeInfo.innerText += window.versions.chrome()
electronInfo.innerText += window.versions.electron()




const Rombtn = document.getElementById('rom-btn')
const RomfilePathElement = document.getElementById('RomfilePath')


Rombtn.addEventListener('click', async () => {
  const RomfilePath = await window.electronAPI.openRomDir()
  RomfilePathElement.innerText = RomfilePath
})

const refreshBtn = document.getElementById('refresh-btn')
refreshBtn.addEventListener('click', async () => {
  await window.electronAPI.refreshPage()
})





async function zeroTierCheck () {
  
  const result = await window.electronAPI.checkZeroTier()
  if(result) {
    document.getElementById('zero-tier-instalation').innerText = "You already have Zero Tier Installed!"
  } else {
    document.getElementById('zero-tier-instalation').innerText = "We noticed that you may not have Zero Tier Installed, would you like to install?"
    const btn = document.createElement("BUTTON")
    btn.setAttribute('id', 'zero-tier-install-btn')
    btn.innerHTML = "Install Zero Tier!"
    document.getElementById('zero-tier-div').appendChild(btn)
    document.getElementById('zero-tier-install-btn').addEventListener('click', async () => {
      await window.electronAPI.zeroTierLink()
    })
  }

}
zeroTierCheck()

async function yuzuCheck () {
  const result = await window.electronAPI.checkYuzu()
  if(result) {
    document.getElementById('yuzu-installation').innerText = "You already have Yuzu installed!"
  } else {
    document.getElementById('yuzu-installation').innerText = "We noticed that you may not have zero tier installed!"
  }
}
yuzuCheck()
// const Yuzubtn = document.getElementById('yuzu-btn')
// const YuzufilePathElement = document.getElementById('YuzufilePath')

// Yuzubtn.addEventListener('click', async () => {
//   const YuzufilePath = await window.electronAPI.openYuzuDir()
//   YuzufilePathElement.innerText = YuzufilePath
// })

const submitBtn = document.getElementById('submit-btn')

submitBtn.addEventListener('click', async () => {
  if(RomfilePathElement.innerText === undefined || RomfilePathElement.innerText === "undefiend") {
    console.log("please select rom dir")
  } else {
  }
  await window.electronAPI.submitFiles()
})