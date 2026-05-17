import dotenv from 'dotenv';
import { loginToBoro, listTasks, getTaskStatus } from './boroAutomation.js';

dotenv.config();

const TASK_NAME = process.argv[2];

async function main() {
  console.log('Connecting to Boro...');

  const { browser, page } = await loginToBoro();

  await page.waitForTimeout(2000);

  if (TASK_NAME) {
    const status = await getTaskStatus(page, TASK_NAME);
    console.log(`\nTask: ${TASK_NAME}`);
    console.log(`Status: ${status}`);
  } else {
    const tasks = await listTasks(page);
    console.log('\n--- Tasks List ---');
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.name}`);
    });
  }

  await browser.close();
}

main().catch(console.error);