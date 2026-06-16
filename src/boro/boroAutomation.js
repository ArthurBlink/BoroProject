import { chromium } from '@playwright/test';

const BORO_URL = process.env.BORO_URL || 'https://boro.elecard.com';
const BORO_EMAIL = process.env.BORO_EMAIL;
const BORO_PASSWORD = process.env.BORO_PASSWORD;

export async function loginToBoro() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`Navigating to ${BORO_URL}/users/sign_in`);
    await page.goto(`${BORO_URL}/users/sign_in`);

    await page.getByRole('textbox', { name: 'E-mail' }).fill(BORO_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(BORO_PASSWORD);
    await page.getByRole('button', { name: 'Log In' }).click();

    await page.waitForLoadState('networkidle');
    console.log('Logged in to Boro successfully');

    return { browser, context, page };
  } catch (error) {
    console.error('Login failed:', error.message);
    await browser.close();
    throw error;
  }
}

export async function navigateToProject(page, projectName = 'Mediastream', probeName = 'CO - Boro') {
  try {
    await page.getByRole('link', { name: 'All projects' }).click();
    await page.getByRole('link', { name: projectName }).click();
    await page.locator('#toSidebar').click();
    await page.getByRole('link', { name: probeName }).click();
    console.log(`Navigated to ${probeName}`);
    return true;
  } catch (error) {
    console.error('Navigation failed:', error.message);
    return false;
  }
}

export async function createOttTask(page, taskData) {
  try {
    await page.getByRole('button', { name: 'Add task' }).click();
    await page.locator('#add_task_ott').click();
    await page.locator('input[name="add_task_uri"]').fill(taskData.streamUrl);
    await page.locator('input[name="add_task_name"]').fill(taskData.taskName);
    await page.getByText('select profiles').click();

    if (taskData.profiles && taskData.profiles.length > 0) {
      for (const profile of taskData.profiles) {
        await page.getByRole('checkbox', { name: profile, exact: true }).check();
      }
    }

    await page.getByRole('button', { name: 'OK' }).click();

    if (taskData.options) {
      if (taskData.options.freeze) await page.locator('#add_task_checkbox_freeze').check();
      if (taskData.options.thumbnail) await page.locator('#add_task_checkbox_thumbnail').check();
      if (taskData.options.audioAnalysis) await page.locator('#add_task_checkbox_audioAnalysis').check();
      if (taskData.options.audioDecodability) await page.locator('#add_task_checkbox_audioDecodability').check();

    }

    await page.getByRole('button', { name: 'Start' }).click();
    console.log(`Task "${taskData.taskName}" created successfully`);
    return true;
  } catch (error) {
    console.error('Error creating task:', error.message);
    return false;
  }
}

export async function createTask(page, taskName, streamUrl, options = {}) {
  const isAudio = options.signalType === 'hls-audio';
  return createOttTask(page, {
    taskName,
    streamUrl,
    profiles: options.profiles || (isAudio ? ['SoporteAudio', 'soporte_boro_Audio'] : ['soporte', 'soporte_boro']),
    options: {
      freeze: !isAudio,
      thumbnail: !isAudio,
      audioAnalysis: true,
      audioDecodability: true,
      ...options
    }
  });
}
