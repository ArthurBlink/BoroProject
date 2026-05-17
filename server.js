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
const BORO_EMAIL = process.env.BORO_EMAIL;
const BORO_PASSWORD = process.env.BORO_PASSWORD;

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

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {}
  return { token: '', streams: [] };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
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
      await page.goto(`${BORO_URL}/users/sign_in`);
      await page.getByRole('textbox', { name: 'E-mail' }).fill(BORO_EMAIL);
      await page.getByRole('textbox', { name: 'Password' }).fill(BORO_PASSWORD);
      await page.getByRole('button', { name: 'Log In' }).click();
      await page.waitForLoadState('networkidle');
      this.loggedIn = true;
      console.log('[Boro] Session established');
    } finally {
      await page.close();
    }
  }

  async ensureLoggedIn() {
    if (!this.loggedIn) await this.login();
  }

  async submitTask({ streamName, m3u8Url, zone }) {
    await this.ensureLoggedIn();
    const probeId = PROBE_IDS[zone] || '8552';
    const page = await this.context.newPage();

    try {
      console.log(`[Boro] Submitting "${streamName}" → ${zone} (probe: ${probeId})`);

      await page.goto(`${BORO_URL}/projects`);

      // Sesión expirada — redirect a login
      if (page.url().includes('sign_in')) {
        console.log('[Boro] Session expired, re-authenticating...');
        this.loggedIn = false;
        await page.close();
        await this.login();
        return this.submitTask({ streamName, m3u8Url, zone });
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
      await page.locator('input[name="add_task_uri"]').fill(m3u8Url);
      await page.locator('input[name="add_task_name"]').fill(streamName);
      await page.getByText('select profiles').click();
      await page.getByRole('checkbox', { name: 'soporte_boro', exact: true }).check();
      await page.getByRole('button', { name: 'OK' }).click();

      await page.waitForTimeout(500);
      await page.locator('#add_task_checkbox_freeze').check();
      await page.locator('#add_task_checkbox_thumbnail').check();
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
    finishJob(job.id, result);
  } catch (e) {
    finishJob(job.id, { success: false, error: e.message });
  } finally {
    queueRunning = false;
    processQueue();
  }
}

function finishJob(id, result) {
  jobResults.set(id, result);
  jobEmitter.emit(id, result);
  // limpiar resultado del cache después de 5 minutos
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
    const response = await fetch('https://platform.mediastre.am/api/live-stream?all=true&limit=50&skip=0', {
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
  const { streamName, m3u8Url, zone } = req.body;
  if (!streamName || !m3u8Url) return res.status(400).json({ error: 'Faltan parámetros' });

  const jobId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const position = jobQueue.length;
  jobQueue.push({ id: jobId, data: { streamName, m3u8Url, zone } });
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

// Graceful shutdown — cierra el browser de Playwright
process.on('SIGTERM', async () => { await boroSession.close(); process.exit(0); });
process.on('SIGINT',  async () => { await boroSession.close(); process.exit(0); });

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
