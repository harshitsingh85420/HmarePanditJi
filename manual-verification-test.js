/**
 * MANUAL VERIFICATION TEST - Run in browser with DevTools
 * This script opens Chrome and does STEP-BY-STEP verification
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3002';
const SCREENSHOTS_DIR = './test-outputs/manual-verification';

// Create directory
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runManualVerification() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  MANUAL VERIFICATION TEST');
  console.log('  Opening Chrome for step-by-step verification...');
  console.log('═══════════════════════════════════════════════════════════\n');

  const browser = await puppeteer.launch({
    headless: false, // Show browser for manual observation
    devtools: true,
    args: ['--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932 });

  try {
    // TEST 1: Splash Screen
    console.log('📱 TEST 1: Splash Screen Timing');
    console.log('   Opening: /onboarding?reset=true');
    await page.goto(`${BASE_URL}/onboarding?reset=true`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-splash.png'), fullPage: false });
    console.log('   ✓ Screenshot saved: 01-splash.png');
    console.log('   ⏱️  WATCH: Count seconds until next screen (should be ~2.5s)\n');
    await sleep(5000); // Wait for splash to complete

    // TEST 2: Location Screen
    console.log('📍 TEST 2: Location Permission Screen');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-location.png'), fullPage: false });
    console.log('   ✓ Screenshot saved: 02-location.png');
    console.log('   👆 ACTION: Click "छोड़ें — हाथ से भरूँगा"\n');
    await sleep(1000);
    
    // Click skip button
    const skipButtons = await page.$$('button');
    for (const btn of skipButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('छोड़ें') || text.includes('हाथ')) {
        await btn.click();
        console.log('   ✓ Clicked skip button\n');
        break;
      }
    }
    await sleep(2000);

    // TEST 3: Language Screen
    console.log('🌐 TEST 3: Language Confirmation');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-language.png'), fullPage: false });
    console.log('   ✓ Screenshot saved: 03-language.png');
    console.log('   👆 ACTION: Click "हाँ, यही भाषा सही है"\n');
    await sleep(1000);

    // Click confirm
    const confirmButtons = await page.$$('button');
    for (const btn of confirmButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('हाँ') && text.includes('भाषा')) {
        await btn.click();
        console.log('   ✓ Clicked language confirm\n');
        break;
      }
    }
    await sleep(3000);

    // TEST 4: Mobile Screen
    console.log('📱 TEST 4: Mobile Number Entry');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-mobile-initial.png'), fullPage: false });
    console.log('   ✓ Screenshot saved: 04-mobile-initial.png');
    
    // Enter mobile number
    const inputSelector = 'input[type="tel"]';
    try {
      await page.waitForSelector(inputSelector, { timeout: 5000 });
      console.log('   ✓ Input field found');
      
      // Type number
      await page.type(inputSelector, '9876543210', { delay: 100 });
      console.log('   ✓ Entered: 9876543210');
      await sleep(1000);
      
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-mobile-entered.png'), fullPage: false });
      console.log('   ✓ Screenshot saved: 04-mobile-entered.png');
      
      // Click submit
      const submitButtons = await page.$$('button');
      for (const btn of submitButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('आगे') || text.includes('OTP')) {
          await btn.click();
          console.log('   ✓ Clicked submit button\n');
          break;
        }
      }
      await sleep(2000);
      
      // Check for confirmation sheet
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-mobile-confirm-sheet.png'), fullPage: false });
      console.log('   ✓ Screenshot saved: 04-mobile-confirm-sheet.png');
      
      // Look for confirmation buttons
      const confirmBtns = await page.$$('button');
      let foundConfirm = false;
      for (const btn of confirmBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('हाँ') && text.includes('सही')) {
          await btn.click();
          console.log('   ✓ Clicked confirmation: "हाँ, सही है"\n');
          foundConfirm = true;
          break;
        }
      }
      
      if (!foundConfirm) {
        console.log('   ⚠️  No confirmation sheet - checking if navigated directly\n');
      }
      
      await sleep(3000);
      
      // Check current URL
      const currentUrl = page.url();
      console.log(`   📍 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/otp')) {
        console.log('   ✅ SUCCESS: Navigated to OTP screen!\n');
        
        // TEST 5: Back Navigation
        console.log('🔙 TEST 5: Back Navigation Test');
        await page.goBack({ waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(2000);
        
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-after-back.png'), fullPage: false });
        console.log('   ✓ Screenshot saved: 05-after-back.png');
        
        // Check if number persists
        const inputValue = await page.$eval(inputSelector, el => el.value).catch(() => '');
        console.log(`   📱 Input value after back: ${inputValue}`);
        
        if (inputValue.includes('9876543210')) {
          console.log('   ✅ SUCCESS: Number persisted after back navigation!\n');
        } else {
          console.log('   ❌ FAIL: Number lost after back navigation\n');
        }
      } else {
        console.log('   ❌ FAIL: Did not navigate to OTP\n');
      }
      
    } catch (err) {
      console.log(`   ❌ FAIL: ${err.message}\n`);
    }

    // TEST 6: Globe Button
    console.log('🌐 TEST 6: Language Globe Button');
    const hasGlobe = await page.evaluate(() => {
      const allText = document.body.innerText;
      return allText.includes('🌐');
    });
    console.log(`   Globe button found: ${hasGlobe}\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  MANUAL VERIFICATION COMPLETE');
    console.log('  Check screenshots in: test-outputs/manual-verification/');
    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  await sleep(5000);
  await browser.close();
}

runManualVerification();
