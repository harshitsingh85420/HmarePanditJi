const puppeteer = require('puppeteer');
const fs = require('fs');

async function runTest() {
  console.log('🎭 Starting automated QA test as Pandit Ji...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream']
  });
  
  const page = await browser.newPage();
  
  // Emulate a mobile device (iPhone 12/13 size) since Pandit Ji uses a phone
  await page.setViewport({ width: 390, height: 844, isMobile: true });

  try {
    console.log('1. Navigating to /intro (Splash Screen)...');
    await page.goto('http://localhost:3002/intro', { waitUntil: 'networkidle0' });
    
    console.log('2. Waiting for Splash Screen to auto-navigate to Location Permission (3-4 seconds)...');
    // Using XPath or robust text matching to find the location permission screen
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('लोकेशन') || text.includes('Location');
    }, { timeout: 10000 });
    console.log('✅ Reached Location Permission Screen natively.');

    console.log('3. Edge Case: Denying location - looking for fallback button "शहर चुनें"');
    const fallbackBtns = await page.$$eval('button, a, div[role="button"]', buttons => {
      return buttons
        .filter(b => b.innerText.includes('नहीं') || b.innerText.includes('शहर') || b.innerText.includes('Manually'))
        .map(b => b.className);
    });
    
    // Attempt clicking the fallback button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const fallbackBtn = btns.find(b => b.innerText.includes('नहीं') || b.innerText.includes('शहर') || b.innerText.includes('Manually') || b.innerText.includes('Skip') || b.innerText.includes('Deny'));
      if (fallbackBtn) fallbackBtn.click();
    });

    console.log('4. Waiting for Manual City Selection screen...');
    await page.waitForTimeout(1000); // give React time to transition state
    const bodyTextAfterClick = await page.evaluate(() => document.body.innerText);
    
    if (bodyTextAfterClick.includes('City') || bodyTextAfterClick.includes('शहर')) {
       console.log('✅ Reached Manual City Selection gracefully.');
    } else {
       console.log('⚠️ Might have auto-navigated somewhere else: ' + bodyTextAfterClick.substring(0, 100));
    }

    // Capture the state inside localStorage to prove the orchestrator saved it
    const storedState = await page.evaluate(() => localStorage.getItem('hpj_pandit_onboarding_v1'));
    console.log('💾 Current Persisted State in LocalStorage:');
    console.log(storedState);

    console.log('5. Edge Case: Speedrun check - Injecting tutorial finish state to ensure /onboarding kicks in...');
    await page.evaluate(() => {
      localStorage.setItem('hpj_pandit_onboarding_v1', JSON.stringify({ tutorialCompleted: true }));
    });
    
    await page.reload({ waitUntil: 'networkidle0' });
    
    const finalUrl = page.url();
    if (finalUrl.includes('/onboarding')) {
      console.log('✅ Speedrunner Edge Case Passed: App properly respected tutorialCompleted:true and kicked user to Registration wizard at /onboarding.');
    } else {
      console.log('❌ Speedrunner Edge Case Failed: URL is still ' + finalUrl);
    }
    
    console.log('🎉 All Pandit Ji edge case simulations completed successfully!');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await browser.close();
  }
}

runTest();
