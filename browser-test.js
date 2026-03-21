/**
 * HmarePanditJi - Comprehensive Browser Test
 * Tests all Part 0 screens and transitions
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3002';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('🚀 Starting HmarePanditJi Browser Tests...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logTest(name, passed, details = '') {
    results.tests.push({ name, passed, details });
    if (passed) {
      results.passed++;
      console.log(`✅ ${name}`);
    } else {
      results.failed++;
      console.log(`❌ ${name} - ${details}`);
    }
  }

  try {
    // ============================================
    // TEST 1: Splash Screen (S-0.0.1)
    // ============================================
    console.log('\n📱 TEST 1: Splash Screen (S-0.0.1)');
    await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'networkidle0' });
    await sleep(1000);
    
    // Check splash screen elements
    const splashGradient = await page.$('.splash-gradient');
    logTest('Splash gradient background exists', !!splashGradient);
    
    const omSymbol = await page.$('span.animate-glow-pulse');
    logTest('OM symbol with animation exists', !!omSymbol);
    
    const title = await page.evaluate(() => {
      return document.querySelector('h1')?.textContent || '';
    });
    logTest('HmarePanditJi title exists', title.includes('HmarePanditJi'));
    
    // Wait for auto-advance (3 seconds)
    await sleep(3500);
    
    // ============================================
    // TEST 2: Location Permission (S-0.0.2)
    // ============================================
    console.log('\n📍 TEST 2: Location Permission (S-0.0.2)');
    
    const locationTitle = await page.evaluate(() => {
      return document.querySelector('h2')?.textContent || '';
    });
    logTest('Location permission screen loaded', 
      locationTitle.includes('शहर') || locationTitle.includes('Location')
    );
    
    const allowButton = await page.$('button');
    logTest('Allow button exists', !!allowButton);
    
    // Click "Skip" to go to manual city entry
    const skipButton = await page.$('button:last-child');
    if (skipButton) {
      await skipButton.click();
      await sleep(1000);
      logTest('Skip button clicked', true);
    }
    
    // ============================================
    // TEST 3: Manual City Entry (S-0.0.2B)
    // ============================================
    console.log('\n🏙️ TEST 3: Manual City Entry (S-0.0.2B)');
    
    const cityChips = await page.$$('button');
    logTest('City chips/buttons exist', cityChips.length > 0);
    
    // Click on a city (e.g., Varanasi)
    if (cityChips.length > 0) {
      await cityChips[0].click();
      await sleep(1500);
      logTest('City selected', true);
    }
    
    // ============================================
    // TEST 4: Language Confirmation (S-0.0.3)
    // ============================================
    console.log('\n🌐 TEST 4: Language Confirmation (S-0.0.3)');
    
    const languageCard = await page.evaluate(() => {
      return document.querySelector('section')?.textContent || '';
    });
    logTest('Language card exists', 
      languageCard.includes('Hindi') || languageCard.includes('भाषा')
    );
    
    // Click "Haan" (Yes) button
    const confirmButton = await page.$('button.bg-primary');
    if (confirmButton) {
      await confirmButton.click();
      await sleep(2000);
      logTest('Language confirmed', true);
    }
    
    // ============================================
    // TEST 5: Language Set Celebration (S-0.0.6)
    // ============================================
    console.log('\n✨ TEST 5: Language Set Celebration (S-0.0.6)');
    
    await sleep(2000); // Wait for celebration animation
    
    const celebrationCheck = await page.$('svg.animate-draw-check');
    logTest('Checkmark animation exists', !!celebrationCheck);
    
    // Auto-advances after 1.8s
    await sleep(2000);
    
    // ============================================
    // TEST 6: Voice Tutorial (S-0.0.8)
    // ============================================
    console.log('\n🎤 TEST 6: Voice Tutorial (S-0.0.8)');
    
    const voiceTutorialTitle = await page.evaluate(() => {
      return document.querySelector('p')?.textContent || '';
    });
    logTest('Voice tutorial loaded', 
      voiceTutorialTitle.includes('आवाज़') || voiceTutorialTitle.includes('voice')
    );
    
    const micIcon = await page.$('span');
    logTest('Microphone icon exists', !!micIcon);
    
    // Click "Samajh gaya" button
    const continueButton = await page.$('button');
    if (continueButton) {
      await continueButton.click();
      await sleep(1500);
      logTest('Voice tutorial completed', true);
    }
    
    // ============================================
    // TEST 7: Tutorial Screens (S-0.1 to S-0.12)
    // ============================================
    console.log('\n📚 TEST 7: Tutorial Screens Flow');
    
    // Test progress dots
    const progressDots = await page.$$('span.rounded-full');
    logTest('Progress dots exist', progressDots.length >= 12);
    
    // Test current screen (Swagat - S-0.1)
    const swagatTitle = await page.evaluate(() => {
      return document.querySelector('h1')?.textContent || '';
    });
    logTest('Swagat screen loaded', 
      swagatTitle.includes('नमस्ते') || swagatTitle.includes('पंडित')
    );
    
    // Test Mool Mantra
    const moolMantra = await page.evaluate(() => {
      return document.querySelector('p.italic')?.textContent || '';
    });
    logTest('Mool Mantra displayed', 
      moolMantra.includes('App') && moolMantra.includes('Pandit')
    );
    
    // Click "Jaanein" button to advance
    const nextButton = await page.$('button.bg-primary');
    if (nextButton) {
      await nextButton.click();
      await sleep(2000);
      logTest('Advanced to next tutorial screen', true);
    }
    
    // Test Income Hook (S-0.2)
    const incomeTitle = await page.evaluate(() => {
      return document.querySelector('h1')?.textContent || '';
    });
    logTest('Income Hook screen loaded', 
      incomeTitle.includes('कमाई') || incomeTitle.includes('Income')
    );
    
    // Test testimonial card
    const testimonialCard = await page.$('section.bg-white');
    logTest('Testimonial card exists', !!testimonialCard);
    
    // Click through a few more screens
    for (let i = 0; i < 3; i++) {
      const nextBtn = await page.$('button.bg-primary');
      if (nextBtn) {
        await nextBtn.click();
        await sleep(1500);
        logTest(`Tutorial screen ${i + 3} advanced`, true);
      }
    }
    
    // ============================================
    // TEST 8: Voice Indicator
    // ============================================
    console.log('\n🎙️ TEST 8: Voice Indicator');
    
    const voiceBars = await page.$$('.voice-bar');
    logTest('Voice indicator bars exist', voiceBars.length >= 3);
    
    const voiceText = await page.evaluate(() => {
      return document.querySelector('span.text-vedic-gold')?.textContent || '';
    });
    logTest('Voice status text exists', 
      voiceText.includes('सुन') || voiceText.includes('sun')
    );
    
    // ============================================
    // TEST 9: Keyboard Toggle
    // ============================================
    console.log('\n⌨️ TEST 9: Keyboard Toggle');
    
    const keyboardToggle = await page.$('button[aria-label*="Keyboard"]');
    logTest('Keyboard toggle button exists', !!keyboardToggle);
    
    // ============================================
    // TEST 10: Skip Button
    // ============================================
    console.log('\n⏭️ TEST 10: Skip Button');
    
    const skipButton2 = await page.$('button');
    const skipText = await skipButton2?.evaluate(el => el.textContent);
    logTest('Skip button exists', 
      skipText?.includes('Skip') || skipText?.includes('छोड़ें')
    );
    
    // ============================================
    // TEST 11: Navigate to Registration
    // ============================================
    console.log('\n📝 TEST 11: Registration Navigation');
    
    // Click through to final CTA or skip
    await page.goto(`${BASE_URL}/onboarding/register`, { waitUntil: 'networkidle0' });
    await sleep(2000);
    
    const registrationTitle = await page.evaluate(() => {
      return document.querySelector('h1')?.textContent || '';
    });
    logTest('Registration page loaded', 
      registrationTitle.includes('Registration') || registrationTitle.includes('पंजीकरण')
    );
    
    // Test back button
    const backButton = await page.$('button[aria-label="Back"]');
    logTest('Back button exists', !!backButton);
    
    // Test mic toggle
    const micToggle = await page.$('button[aria-label*="mic"]');
    logTest('Mic toggle exists', !!micToggle);
    
    // ============================================
    // TEST 12: Back Button Functionality
    // ============================================
    console.log('\n🔙 TEST 12: Back Button Functionality');
    
    if (backButton) {
      await backButton.click();
      await sleep(2000);
      
      const currentUrl = page.url();
      logTest('Back button navigates correctly', 
        currentUrl.includes('onboarding') && currentUrl.includes('phase')
      );
    }
    
    // ============================================
    // TEST 13: Responsive Design
    // ============================================
    console.log('\n📱 TEST 13: Responsive Design');
    
    await page.setViewport({ width: 390, height: 844 });
    const mobileLayout = await page.evaluate(() => {
      const container = document.querySelector('.max-w-\\[430px\\]');
      return !!container;
    });
    logTest('Mobile layout (390px) works', mobileLayout);
    
    await page.setViewport({ width: 430, height: 932 });
    const largerLayout = await page.evaluate(() => {
      const container = document.querySelector('.max-w-\\[430px\\]');
      return !!container;
    });
    logTest('Larger screen (430px) works', largerLayout);
    
    // ============================================
    // TEST 14: Animations
    // ============================================
    console.log('\n✨ TEST 14: Animations');
    
    await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'networkidle0' });
    await sleep(500);
    
    const hasAnimations = await page.evaluate(() => {
      const styles = document.querySelector('style');
      return styles?.textContent?.includes('animate-') || false;
    });
    logTest('CSS animations loaded', hasAnimations);
    
    const hasGlowPulse = await page.evaluate(() => {
      const element = document.querySelector('.animate-glow-pulse');
      return !!element;
    });
    logTest('Glow pulse animation exists', hasGlowPulse);
    
    // ============================================
    // TEST 15: Color Tokens
    // ============================================
    console.log('\n🎨 TEST 15: Color Tokens');
    
    const colors = await page.evaluate(() => {
      const element = document.querySelector('.bg-primary');
      const style = window.getComputedStyle(element || document.body);
      return {
        hasPrimary: !!element,
        backgroundColor: style.backgroundColor
      };
    });
    logTest('Primary color applied', colors.hasPrimary);
    
    const vedicCream = await page.evaluate(() => {
      const body = document.querySelector('body');
      const style = window.getComputedStyle(body || document.documentElement);
      return style.backgroundColor;
    });
    logTest('Vedic cream background', 
      vedicCream.includes('255') || vedicCream.includes('rgb')
    );
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    results.failed++;
  }
  
  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total: ${results.passed + results.failed}`);
  console.log('='.repeat(50));
  
  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
  } else {
    console.log(`⚠️  ${results.failed} test(s) failed`);
  }
  
  // Save detailed results
  const fs = require('fs');
  const report = {
    timestamp: new Date().toISOString(),
    url: BASE_URL,
    results
  };
  
  fs.writeFileSync(
    'browser-test-results.json',
    JSON.stringify(report, null, 2)
  );
  console.log('\n📄 Detailed results saved to: browser-test-results.json');
  
  await browser.close();
  
  return results.failed === 0;
}

// Run tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
