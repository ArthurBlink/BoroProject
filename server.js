import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { chromium } from '@playwright/test';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(process.cwd(), 'data.json');

const BORO_URL = process.env.BORO_URL || 'https://boro.elecard.com';
const BORO_EMAIL = process.env.BORO_EMAIL || process.env.BORO_USERNAME;
const BORO_PASSWORD = process.env.BORO_PASSWORD;
const MS_API_BASE = process.env.MEDIASTREAM_API_URL
  ? new URL(process.env.MEDIASTREAM_API_URL).origin
  : 'https://dev.platform.mediastre.am';

app.use(express.json());
app.use(express.static('.'));

const PROBE_IDS = {
  'CO - Boro':           '8552',
  'BR-SaoPaulo-Sensay':  '4933',
  'CL-VMSensay':         '4957',
  'EU-EC2 Boro (Spain)': '7892',
  'PE-EC2-Lima':         '9593',
  'US-EC2-Boro':         '8566',
  'US-Link-SRT':         '6308',
};

const SUBMITTED_FILE = path.join(process.cwd(), 'submitted-tasks.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {}
  return { token: '', streams: [] };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function loadSubmittedTasks() {
  try {
    if (fs.existsSync(SUBMITTED_FILE)) return JSON.parse(fs.readFileSync(SUBMITTED_FILE, 'utf8'));
  } catch {}
  return [];
}

function saveSubmittedTasks(tasks) {
  fs.writeFileSync(SUBMITTED_FILE, JSON.stringify(tasks, null, 2));
}

function addSubmittedTask(task) {
  const tasks = loadSubmittedTasks();
  const exists = tasks.some((t) => t.name === task.name && t.zone === task.zone);
  if (!exists) {
    tasks.push({ name: task.name, zone: task.zone, createdAt: new Date().toISOString() });
    saveSubmittedTasks(tasks);
  }
}

function removeSubmittedTask(taskName, zone) {
  const tasks = loadSubmittedTasks();
  const filtered = tasks.filter((t) => !(t.name === taskName && t.zone === zone));
  saveSubmittedTasks(filtered);
}

// ============================================================
// BoroSession — browser vive entre requests, login 1 sola vez
// ============================================================

class BoroSession {
  constructor() {
    this.browser = null;
    this.context = null;
    this.loggedIn = false;
  }

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
      this.context = await this.browser.newContext();
      console.log('[Boro] Browser launched');
    }
  }

  async login() {
    await this.init();
    const page = await this.context.newPage();
    try {
      console.log('[Boro] Logging in...');
      await page.goto(`${BORO_URL}/users/sign_in`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      await page.locator('input[type="email"], input[name="user[email]"], #user_email').first().fill(BORO_EMAIL);
      await page.locator('input[type="password"], input[name="user[password]"], #user_password').first().fill(BORO_PASSWORD);
      await page.locator('button[type="submit"], input[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      this.loggedIn = true;
      console.log('[Boro] Session established');
    } finally {
      await page.close();
    }
  }

  async ensureLoggedIn() {
    if (!this.loggedIn) await this.login();
  }

  async submitTask({ streamName, streamUrl, zone, signalType = 'hls-video' }) {
    await this.ensureLoggedIn();
    const probeId = PROBE_IDS[zone] || '8552';
    const page = await this.context.newPage();

    const isAudio = signalType === 'hls-audio';
    const profiles = isAudio
      ? ['SoporteAudio', 'soporte_boro_Audio']
      : ['soporte', 'soporte_boro'];

    try {
      console.log(`[Boro] Submitting "${streamName}" [${signalType}] → ${zone} (probe: ${probeId})`);
      console.log(`[Boro] Profiles: ${profiles.join(', ')}`);

      await page.goto(`${BORO_URL}/projects`);

      // Sesión expirada — redirect a login
      if (page.url().includes('sign_in')) {
        console.log('[Boro] Session expired, re-authenticating...');
        this.loggedIn = false;
        await page.close();
        await this.login();
        return this.submitTask({ streamName, streamUrl, zone, signalType });
      }

      await page.getByRole('link', { name: 'All projects' }).click();
      await page.getByRole('link', { name: 'Bluefile iconMediastream' }).click();
      await page.locator('#toSidebar').click();

      await page.waitForTimeout(1000);
      const zoneLink = page.locator(`#sidebar_probe_${probeId}`).getByRole('link', { name: zone });
      await zoneLink.scrollIntoViewIfNeeded();
      await zoneLink.click({ timeout: 10000 });

      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'Add task' }).click();
      await page.locator('#add_task_ott').click();
      await page.locator('input[name="add_task_uri"]').fill(streamUrl);
      await page.locator('input[name="add_task_name"]').fill(streamName);

      // Seleccionar perfiles (ALARM + WEBHOOK)
      await page.getByText('select profiles').click();
      await page.waitForTimeout(500);
      if (isAudio) {
        await page.getByRole('checkbox', { name: 'SoporteAudio', exact: true }).check();
        await page.getByRole('checkbox', { name: 'soporte_boro_Audio', exact: true }).check();
      } else {
        await page.locator('label').filter({ hasText: 'soporte' }).nth(2).click();
        await page.getByRole('checkbox', { name: 'soporte_boro', exact: true }).check();
      }
      await page.getByRole('button', { name: 'OK' }).click();

      // QoE Options
      await page.waitForTimeout(500);
      if (!isAudio) {
        await page.locator('#add_task_checkbox_freeze').check();
        await page.locator('#add_task_checkbox_thumbnail').check();
      }
      await page.locator('#add_task_checkbox_audioAnalysis').check();
      await page.locator('#add_task_checkbox_audioDecodability').check();
      await page.getByRole('button', { name: 'Start' }).click();

      await page.waitForTimeout(3000);
      console.log(`[Boro] Task "${streamName}" created successfully`);
      return { success: true };

    } catch (error) {
      console.error('[Boro] Error:', error.message);
      if (error.message.includes('sign_in') || error.message.includes('Timeout')) {
        this.loggedIn = false;
      }
      throw error;
    } finally {
      await page.close();
    }
  }

  async listTasks() {
    await this.ensureLoggedIn();
    const page = await this.context.newPage();
    try {
      await page.goto(`${BORO_URL}/projects`);
      if (page.url().includes('sign_in')) {
        this.loggedIn = false;
        await page.close();
        await this.login();
        return this.listTasks();
      }
      await page.getByRole('link', { name: 'All projects' }).click();
      await page.getByRole('link', { name: 'Bluefile iconMediastream' }).click();
      await page.locator('#toSidebar').click();
      await page.waitForTimeout(1000);

      const allTasks = [];
      for (const [zone, probeId] of Object.entries(PROBE_IDS)) {
        try {
          const zoneLink = page.locator(`#sidebar_probe_${probeId}`).getByRole('link', { name: zone });
          await zoneLink.scrollIntoViewIfNeeded();
          await zoneLink.click({ timeout: 10000 });
          await page.waitForTimeout(2000);

          const tasks = await page.evaluate((zoneName) => {
            const results = [];
            const rows = document.querySelectorAll('table tbody tr, table tr.task_row, table tr');
            for (const row of rows) {
              const cells = row.querySelectorAll('td');
              if (cells.length < 2) continue;
              const nameEl = row.querySelector('a[href*="tasks"], .task_name, td:nth-child(2)');
              const statusEl = row.querySelector('.task_status, td:nth-child(3)');
              if (!nameEl) continue;
              const name = nameEl.textContent?.trim();
              if (!name || name === '') continue;
              results.push({
                name,
                status: statusEl?.textContent?.trim() || 'N/A',
                zone: zoneName,
              });
            }
            return results;
          }, zone);

          allTasks.push(...tasks);
        } catch (e) {
          console.log(`[Boro] Error listing tasks for ${zone}: ${e.message}`);
        }
      }
      console.log(`[Boro] Found ${allTasks.length} tasks across all zones`);
      return allTasks;
    } finally {
      await page.close();
    }
  }

  async deleteTask(taskName, probeId) {
    await this.ensureLoggedIn();
    const page = await this.context.newPage();
    try {
      await page.goto(`${BORO_URL}/projects`);
      if (page.url().includes('sign_in')) {
        this.loggedIn = false;
        await page.close();
        await this.login();
        return this.deleteTask(taskName, probeId);
      }
      await page.getByRole('link', { name: 'All projects' }).click();
      await page.getByRole('link', { name: 'Bluefile iconMediastream' }).click();
      await page.locator('#toSidebar').click();
      await page.waitForTimeout(1000);

      const zoneEntry = Object.entries(PROBE_IDS).find(([, id]) => id === probeId);
      const zoneName = zoneEntry ? zoneEntry[0] : probeId;
      const zoneLink = page.locator(`#sidebar_probe_${probeId}`).getByRole('link', { name: zoneName });
      await zoneLink.scrollIntoViewIfNeeded();
      await zoneLink.click({ timeout: 10000 });
      await page.waitForTimeout(2000);

      // Hacer clic en el nombre de la tarea para abrir sus detalles
      const taskLink = page.locator(`a:has-text("${taskName}")`).first();
      await taskLink.waitFor({ state: 'visible', timeout: 10000 });
      await taskLink.click();
      await page.waitForTimeout(2000);

      // Buscar botón de eliminar en los detalles de la tarea
      const deleteBtn = page.locator('a[data-method="delete"], a[class*="del"], button[class*="del"], button[class*="delete"], a:has-text("Delete"), a:has-text("delete"), button:has-text("Delete")').first();
      if (await deleteBtn.isVisible({ timeout: 5000 })) {
        await deleteBtn.click();
        await page.waitForTimeout(1000);

        // Confirmar diálogo
        try {
          const confirmBtn = page.locator('button:has-text("OK"), button:has-text("Confirm"), button:has-text("Yes"), .ui-button:has-text("OK"), .ui-dialog-titlebar-close').first();
          if (await confirmBtn.isVisible({ timeout: 3000 })) {
            await confirmBtn.click();
            await page.waitForTimeout(1000);
          }
        } catch {}
      } else {
        // Si no hay botón de eliminar, intentar con checkbox + bulk delete
        const taskRow = page.locator(`tr:has(a:text("${taskName}"))`).first();
        const checkbox = taskRow.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible({ timeout: 2000 })) {
          await checkbox.check();
          await page.waitForTimeout(500);
          const bulkDelete = page.locator('input[value="Delete"], button:has-text("Delete"), a:has-text("Delete")').first();
          if (await bulkDelete.isVisible({ timeout: 2000 })) {
            await bulkDelete.click();
            await page.waitForTimeout(1000);
          }
        } else {
          throw new Error('No delete button or checkbox found for this task');
        }
      }

      // Confirmar diálogo si aparece
      try {
        const confirmBtn = page.locator('#confirm_dialog button:has-text("OK"), button:has-text("Yes"), button:has-text("Delete"), .ui-button:has-text("OK")').first();
        if (await confirmBtn.isVisible({ timeout: 3000 })) {
          await confirmBtn.click();
          await page.waitForTimeout(1000);
        }
      } catch {}
      console.log(`[Boro] Task "${taskName}" deleted from ${zoneName}`);
      return { success: true, zone: zoneName };
    } catch (error) {
      console.error(`[Boro] Delete failed: ${error.message}`);
      throw error;
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.loggedIn = false;
      console.log('[Boro] Browser closed');
    }
  }
}

const boroSession = new BoroSession();

// ============================================================
// Job queue — procesa 1 a la vez, no hay Playwright concurrente
// ============================================================

const jobQueue = [];
const jobEmitter = new EventEmitter();
const jobResults = new Map(); // cache resultado para polling tardío
let queueRunning = false;

async function processQueue() {
  if (queueRunning || jobQueue.length === 0) return;
  queueRunning = true;
  const job = jobQueue.shift();
  console.log(`[Queue] Processing job ${job.id} (${jobQueue.length} in queue)`);
  try {
    const result = await boroSession.submitTask(job.data);
    finishJob(job.id, result, job.data);
  } catch (e) {
    finishJob(job.id, { success: false, error: e.message }, job.data);
  } finally {
    queueRunning = false;
    processQueue();
  }
}

function finishJob(id, result, taskData) {
  jobResults.set(id, result);
  jobEmitter.emit(id, result);
  if (result.success && taskData) {
    addSubmittedTask({ name: taskData.streamName, zone: taskData.zone });
    console.log(`[Queue] Task "${taskData.streamName}" saved as submitted`);
  }
  setTimeout(() => jobResults.delete(id), 5 * 60 * 1000);
}

// ============================================================
// Routes
// ============================================================

app.get('/api/data', (req, res) => res.json(loadData()));

app.post('/api/data', (req, res) => {
  saveData(req.body);
  res.json({ success: true });
});

app.post('/api/live-stream', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token requerido' });
  try {
    const response = await fetch(`${MS_API_BASE}/api/live-stream?all=true&limit=50&skip=0`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-API-Token': token,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    const data = await response.json();
    saveData({ token, streams: data.data || [] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Encola el job, responde inmediatamente con jobId
app.post('/api/submit-to-boro', (req, res) => {
  const { streamName, streamUrl, zone, signalType } = req.body;
  if (!streamName || !streamUrl) return res.status(400).json({ error: 'Faltan parámetros' });

  const jobId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const position = jobQueue.length;
  jobQueue.push({ id: jobId, data: { streamName, streamUrl, zone, signalType } });
  console.log(`[Queue] Job ${jobId} enqueued at position ${position}`);

  res.json({ jobId, position });
  processQueue();
});

// Long-poll: espera hasta 30s por resultado, responde 'pending' si no llega
app.get('/api/job/:id', (req, res) => {
  const { id } = req.params;

  // Resultado ya disponible (polling tardío)
  if (jobResults.has(id)) {
    return res.json({ status: 'done', ...jobResults.get(id) });
  }

  const timer = setTimeout(() => {
    jobEmitter.off(id, handler);
    res.json({ status: 'pending' });
  }, 30000);

  const handler = (result) => {
    clearTimeout(timer);
    res.json({ status: 'done', ...result });
  };

  jobEmitter.once(id, handler);
});

// Proxy para emitir access token de consumo HLS desde Mediastream
app.post('/api/issue-access-token', async (req, res) => {
  const { apiKey, streamId } = req.body;
  if (!apiKey || !streamId) return res.status(400).json({ error: 'apiKey y streamId requeridos' });
  try {
    const response = await fetch(
      `${MS_API_BASE}/api/access/issue?type=live&max_use=10&token=${encodeURIComponent(apiKey)}&id=${encodeURIComponent(streamId)}`,
      { method: 'POST', redirect: 'follow' }
    );
    const data = await response.json();
    if (data.status === 'OK') {
      res.json({ access_token: data.access_token });
    } else {
      res.status(400).json({ error: data.message || 'Error emitiendo token' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Listar tareas subidas desde esta app
app.get('/api/boro/tasks', async (req, res) => {
  try {
    const tasks = loadSubmittedTasks();
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Eliminar una tarea de Boro y de la lista local
app.post('/api/boro/delete-task', async (req, res) => {
  const { taskName, probeId, zone } = req.body;
  if (!taskName || !probeId) return res.status(400).json({ error: 'taskName y probeId requeridos' });
  try {
    const result = await boroSession.deleteTask(taskName, probeId);
    removeSubmittedTask(taskName, zone || result.zone);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Graceful shutdown — cierra el browser de Playwright
process.on('SIGTERM', async () => { await boroSession.close(); process.exit(0); });
process.on('SIGINT',  async () => { await boroSession.close(); process.exit(0); });

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
