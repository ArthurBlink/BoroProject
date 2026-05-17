import dotenv from 'dotenv';
import { getStreamUrl } from '../api/getStream.js';
import { loginToBoro, createTask } from '../boro/boroAutomation.js';

dotenv.config();

const STREAM_ID = process.argv[2];
const TASK_NAME = process.argv[3] || `Stream ${STREAM_ID}`;

async function main() {
  if (!STREAM_ID) {
    console.error('Usage: node autoCreateTask.js <stream-id> [task-name]');
    process.exit(1);
  }

  console.log('=== Auto Create Boro Task ===\n');

  console.log('Step 1: Getting stream URL from Mediastre.am...');
  const streamUrl = await getStreamUrl(STREAM_ID);

  if (!streamUrl) {
    console.error('Failed to get stream URL');
    process.exit(1);
  }

  console.log('\nStep 2: Creating task in Boro...');
  const { browser, page } = await loginToBoro();

  await page.waitForTimeout(2000);

  const success = await createTask(page, TASK_NAME, streamUrl);

  if (success) {
    console.log('\n✓ Task created successfully!');
    console.log(`  Name: ${TASK_NAME}`);
    console.log(`  URL: ${streamUrl}`);
  } else {
    console.log('\n✗ Failed to create task');
  }

  await browser.close();
}

main().catch(console.error);