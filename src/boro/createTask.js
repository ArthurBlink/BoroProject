import dotenv from 'dotenv';
import { loginToBoro, createTask } from './boroAutomation.js';

dotenv.config();

const TASK_NAME = process.argv[2] || 'Test Task';
const STREAM_URL = process.argv[3] || 'https://example.com/stream.m3u8';

async function main() {
  console.log('Starting Boro task creation...');
  console.log(`Task Name: ${TASK_NAME}`);
  console.log(`Stream URL: ${STREAM_URL}`);

  const { browser, page } = await loginToBoro();

  await page.waitForTimeout(2000);

  const success = await createTask(page, TASK_NAME, STREAM_URL);

  if (success) {
    console.log('Task created successfully!');
  } else {
    console.log('Failed to create task');
  }

  await browser.close();
}

main().catch(console.error);