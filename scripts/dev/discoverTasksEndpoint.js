import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BORO_URL = process.env.BORO_URL || 'https://boro.elecard.com';
const BORO_EMAIL = process.env.BORO_EMAIL || process.env.BORO_USERNAME;
const BORO_PASSWORD = process.env.BORO_PASSWORD;

async function main() {
  console.log('Starting...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Navigating to login...');
    await page.goto(`${BORO_URL}/users/sign_in`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('Filling credentials...');
    await page.locator('#user_email').fill(BORO_EMAIL);
    await page.locator('#user_password').fill(BORO_PASSWORD);
    await page.locator('input[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('Navigating to projects...');
    await page.goto(`${BORO_URL}/projects`);
    await page.waitForTimeout(1000);
    await page.getByRole('link', { name: 'All projects' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('link', { name: 'Bluefile iconMediastream' }).click();
    await page.waitForTimeout(2000);
    await page.locator('#toSidebar').click();
    await page.waitForTimeout(1000);

    // Track captured responses
    let tasksData = null;
    page.on('response', (res) => {
      if (res.url().includes('/web_api/v1') && res.status() === 200 && !tasksData) {
        res.text().then(body => {
          if (body.includes('app_get_live_tasks')) {
            const parsed = JSON.parse(body);
            const entry = parsed.find(e => e.name === 'app_get_live_tasks');
            if (entry) {
              tasksData = entry;
              console.log('\n=== app_get_live_tasks RESPONSE ===');
              console.log(JSON.stringify(entry.data, null, 2).substring(0, 10000));
            }
          }
        }).catch(() => {});
      }
    });

    console.log('Clicking CO - Boro zone...');
    await page.locator('#sidebar_probe_8552').getByRole('link', { name: 'CO - Boro' }).scrollIntoViewIfNeeded();
    await page.locator('#sidebar_probe_8552').getByRole('link', { name: 'CO - Boro' }).click();

    // Wait for data to arrive
    await page.waitForTimeout(5000);

    if (!tasksData) {
      console.log('No app_get_live_tasks found');
    }

    console.log('\nDone. Keeping browser open for 10s for manual inspection...');
    await page.waitForTimeout(10000);
  } catch(e) {
    console.error('Error:', e.message);
    console.error(e.stack);
  } finally {
    await browser.close();
  }
}

main();
