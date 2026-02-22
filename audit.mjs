import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = './audit-screenshots';
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const issues = [];
const log = (msg) => { console.log(msg); };
const issue = (page, msg) => { issues.push(`[${page}] ${msg}`); console.warn(`  ⚠️  ${msg}`); };

async function ss(page, name) {
  const fp = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: fp, fullPage: true });
  log(`  📸 ${name}.png`);
  return fp;
}

async function checkConsoleErrors(page, label) {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  // ─── WEB APP (port 3000) ───────────────────────────────────────────────────
  log('\n═══════════════════════════════════════');
  log('  WEB APP (Customer) — localhost:3000');
  log('═══════════════════════════════════════');

  const web = await ctx.newPage();
  const webErrors = [];
  web.on('console', msg => { if (msg.type() === 'error') webErrors.push(msg.text()); });
  web.on('pageerror', err => webErrors.push(err.message));

  // 1. Homepage
  log('\n[1] Homepage');
  await web.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
  await ss(web, '01-web-homepage');

  // Check key elements
  const navLinks = await web.$$eval('nav a', els => els.map(e => e.textContent?.trim()));
  log(`  Nav links: ${navLinks.join(', ')}`);

  const heroText = await web.$eval('h1', el => el.textContent?.trim()).catch(() => 'No H1 found');
  log(`  Hero H1: ${heroText}`);

  // Mobile view
  await web.setViewportSize({ width: 375, height: 812 });
  await ss(web, '02-web-homepage-mobile');
  await web.setViewportSize({ width: 1280, height: 800 });

  // 2. Search / Pandit Listing
  log('\n[2] Search Page');
  await web.goto('http://localhost:3000/search', { waitUntil: 'networkidle', timeout: 15000 });
  await ss(web, '03-web-search');
  const panditCards = await web.$$('.pandit-card, [class*="pandit"], [class*="card"]');
  log(`  Pandit cards found: ${panditCards.length}`);

  // 3. Muhurat / Puja type pages
  log('\n[3] Muhurat Page');
  await web.goto('http://localhost:3000/muhurat', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await ss(web, '04-web-muhurat');

  // 4. Login page
  log('\n[4] Login Page');
  await web.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
    await web.goto('http://localhost:3000/auth', { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
  });
  await ss(web, '05-web-login');

  const phoneInput = await web.$('input[type="tel"], input[placeholder*="phone"], input[placeholder*="Phone"], input[name="phone"]');
  if (phoneInput) {
    log('  Phone input found');
    await phoneInput.fill('9999999999');
    await ss(web, '06-web-login-filled');

    const sendOtpBtn = await web.$('button[type="submit"], button:has-text("Send OTP"), button:has-text("Get OTP")');
    if (sendOtpBtn) {
      await sendOtpBtn.click();
      await web.waitForTimeout(2000);
      await ss(web, '07-web-login-otp-sent');

      const otpInput = await web.$('input[type="text"][maxlength="1"], input[placeholder*="OTP"], input[placeholder*="otp"]');
      if (otpInput) {
        log('  OTP input found, filling 123456');
        // Fill OTP boxes
        const otpInputs = await web.$$('input[maxlength="1"]');
        if (otpInputs.length >= 6) {
          for (let i = 0; i < 6; i++) await otpInputs[i].fill(String(i < 6 ? '123456'[i] : ''));
        } else {
          await otpInput.fill('123456');
        }
        await ss(web, '08-web-login-otp-filled');

        const verifyBtn = await web.$('button:has-text("Verify"), button[type="submit"]');
        if (verifyBtn) {
          await verifyBtn.click();
          await web.waitForTimeout(3000);
          await ss(web, '09-web-after-login');
          log(`  After login URL: ${web.url()}`);
        }
      }
    }
  } else {
    issue('Login', 'No phone input found on login page');
    log(`  Current URL: ${web.url()}`);
  }

  // 5. Pandit detail page
  log('\n[5] Pandit Detail Page');
  await web.goto('http://localhost:3000/pandit/1', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await ss(web, '10-web-pandit-detail');
  const bookBtn = await web.$('button:has-text("Book"), a:has-text("Book")');
  log(`  Book button: ${bookBtn ? 'found' : 'NOT FOUND'}`);
  if (!bookBtn) issue('Pandit Detail', 'No "Book" button visible');

  // 6. Booking flow
  log('\n[6] Booking Page');
  await web.goto('http://localhost:3000/booking', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
    await web.goto('http://localhost:3000/book', { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
  });
  await ss(web, '11-web-booking');

  // 7. Dashboard
  log('\n[7] Customer Dashboard');
  await web.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await ss(web, '12-web-dashboard');

  // 8. Legal pages
  log('\n[8] Legal Pages');
  for (const [slug, label] of [['privacy-policy','Privacy'],['terms','Terms'],['refund-policy','Refund']]) {
    await web.goto(`http://localhost:3000/${slug}`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    const title = await web.$eval('h1,h2', el => el.textContent?.trim()).catch(() => 'N/A');
    log(`  ${label}: ${title}`);
  }
  await ss(web, '13-web-legal');

  if (webErrors.length > 0) {
    log(`\n  Console errors on web app:`);
    webErrors.forEach(e => issue('Web', e));
  }

  // ─── PANDIT APP (port 3002) ────────────────────────────────────────────────
  log('\n═══════════════════════════════════════');
  log('  PANDIT APP — localhost:3002');
  log('═══════════════════════════════════════');

  const pandit = await ctx.newPage();
  const panditErrors = [];
  pandit.on('console', msg => { if (msg.type() === 'error') panditErrors.push(msg.text()); });
  pandit.on('pageerror', err => panditErrors.push(err.message));

  await pandit.goto('http://localhost:3002', { waitUntil: 'networkidle', timeout: 15000 });
  await ss(pandit, '20-pandit-home');
  log(`  URL: ${pandit.url()}`);

  // Login
  const panditPhone = await pandit.$('input[type="tel"], input[placeholder*="phone"], input[placeholder*="Phone"]');
  if (panditPhone) {
    await panditPhone.fill('8888888888');
    const btn = await pandit.$('button[type="submit"]');
    if (btn) { await btn.click(); await pandit.waitForTimeout(2000); }
    await ss(pandit, '21-pandit-login-otp');
    const otpInputs = await pandit.$$('input[maxlength="1"]');
    if (otpInputs.length >= 6) {
      for (let i = 0; i < 6; i++) await otpInputs[i].fill('123456'[i]);
      const verifyBtn = await pandit.$('button[type="submit"]');
      if (verifyBtn) { await verifyBtn.click(); await pandit.waitForTimeout(3000); }
    }
    await ss(pandit, '22-pandit-after-login');
    log(`  After login URL: ${pandit.url()}`);
  }

  // Dashboard sections
  for (const [path2, label, num] of [
    ['/dashboard','Dashboard','23'],
    ['/bookings','Bookings','24'],
    ['/availability','Availability','25'],
    ['/earnings','Earnings','26'],
    ['/profile','Profile','27'],
  ]) {
    log(`\n  [${label}]`);
    await pandit.goto(`http://localhost:3002${path2}`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await ss(pandit, `${num}-pandit-${label.toLowerCase()}`);
    log(`    URL: ${pandit.url()}`);
  }

  if (panditErrors.length > 0) panditErrors.forEach(e => issue('Pandit', e));

  // ─── ADMIN APP (port 3003) ─────────────────────────────────────────────────
  log('\n═══════════════════════════════════════');
  log('  ADMIN APP — localhost:3003');
  log('═══════════════════════════════════════');

  const admin = await ctx.newPage();
  const adminErrors = [];
  admin.on('console', msg => { if (msg.type() === 'error') adminErrors.push(msg.text()); });
  admin.on('pageerror', err => adminErrors.push(err.message));

  await admin.goto('http://localhost:3003', { waitUntil: 'networkidle', timeout: 15000 });
  await ss(admin, '30-admin-home');
  log(`  URL: ${admin.url()}`);
  await admin.setViewportSize({ width: 375, height: 812 });
  await ss(admin, '31-admin-home-mobile');
  await admin.setViewportSize({ width: 1280, height: 800 });

  for (const [path3, label, num] of [
    ['/bookings','Bookings','32'],
    ['/pandits','Pandits','33'],
    ['/payouts','Payouts','34'],
    ['/cancellations','Cancellations','35'],
    ['/travel-desk','Travel Desk','36'],
    ['/support','Support','37'],
    ['/settings','Settings','38'],
  ]) {
    log(`\n  [${label}]`);
    await admin.goto(`http://localhost:3003${path3}`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await ss(admin, `${num}-admin-${label.toLowerCase().replace(/ /g,'-')}`);
    log(`    URL: ${admin.url()}`);
  }

  if (adminErrors.length > 0) adminErrors.forEach(e => issue('Admin', e));

  // ─── SUMMARY ───────────────────────────────────────────────────────────────
  log('\n═══════════════════════════════════════');
  log('  AUDIT SUMMARY');
  log('═══════════════════════════════════════');
  if (issues.length === 0) {
    log('  ✅ No issues detected!');
  } else {
    log(`  ⚠️  ${issues.length} issue(s) found:`);
    issues.forEach((iss, i) => log(`  ${i+1}. ${iss}`));
  }
  log(`\n  📁 Screenshots saved to: ${path.resolve(SCREENSHOT_DIR)}`);

  await browser.close();
})();
