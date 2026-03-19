// Playwright screenshot script — captures all onboarding phases at mobile size
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE_URL = 'http://localhost:3000/onboarding'
const STORAGE_KEY = 'hpj_pandit_onboarding_v1'
const OUT_DIR = path.join(__dirname, 'screenshots')
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR)

const PHASES = [
  'SPLASH',
  'LOCATION_PERMISSION',
  'MANUAL_CITY',
  'LANGUAGE_CONFIRM',
  'LANGUAGE_LIST',
  'LANGUAGE_CHOICE_CONFIRM',
  'LANGUAGE_SET',
  'VOICE_TUTORIAL',
  'TUTORIAL_SWAGAT',
  'TUTORIAL_INCOME',
  'TUTORIAL_DAKSHINA',
  'TUTORIAL_ONLINE_REVENUE',
  'TUTORIAL_BACKUP',
  'TUTORIAL_PAYMENT',
  'TUTORIAL_VOICE_NAV',
  'TUTORIAL_DUAL_MODE',
  'TUTORIAL_TRAVEL',
  'TUTORIAL_VIDEO_VERIFY',
  'TUTORIAL_GUARANTEES',
  'TUTORIAL_CTA',
]

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },   // iPhone 14 Pro
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()

  // First load to initialise the app
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  for (let i = 0; i < PHASES.length; i++) {
    const phase = PHASES[i]
    const stateObj = {
      phase,
      selectedLanguage: 'Hindi',
      detectedCity: 'Delhi',
      detectedState: 'Delhi',
      pendingLanguage: phase === 'LANGUAGE_CHOICE_CONFIRM' ? 'Marathi' : null,
      languageConfirmed: true,
      firstEverOpen: true,
      voiceTutorialSeen: false,
      tutorialStarted: phase.startsWith('TUTORIAL'),
      tutorialCompleted: false,
      currentTutorialScreen: i >= 8 ? i - 8 : 0,
      helpRequested: false,
    }

    await page.evaluate(
      ([key, val]) => localStorage.setItem(key, val),
      [STORAGE_KEY, JSON.stringify(stateObj)]
    )

    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(600)   // let animations settle

    const file = path.join(OUT_DIR, `${String(i + 1).padStart(2, '0')}_${phase}.png`)
    await page.screenshot({ path: file, fullPage: false })
    console.log(`✓ ${phase}`)
  }

  await browser.close()
  console.log(`\nDone. Screenshots saved to: ${OUT_DIR}`)
})()
