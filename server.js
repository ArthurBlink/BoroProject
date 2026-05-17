import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(process.cwd(), 'data.json');

const BORO_URL = process.env.BORO_URL || 'https://boro.elecard.com';
const BORO_EMAIL = process.env.BORO_EMAIL || 'jromero@mediastre.am';
const BORO_PASSWORD = process.env.BORO_PASSWORD || 'Arthur.2001';

app.use(express.json());
app.use(express.static('.'));

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {}
  return { token: '', streams: [] };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/data', (req, res) => {
  res.json(loadData());
});

app.post('/api/data', (req, res) => {
  saveData(req.body);
  res.json({ success: true });
});

app.post('/api/live-stream', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token requerido' });
  }

  try {
    const response = await fetch('https://platform.mediastre.am/api/live-stream?all=true&limit=50&skip=0', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Token': token,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    const data = await response.json();
    saveData({ token, streams: data.data || [] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/submit-to-boro', async (req, res) => {
  const { streamName, m3u8Url, zone } = req.body;
  
  if (!streamName || !m3u8Url) {
    return res.status(400).json({ success: false, error: 'Faltan parámetros' });
  }

  const probeIds = {
    'CO - Boro': '8552',
    'BR-SaoPaulo-Sensay': '4933',
    'CL-VMSensay': '4957',
    'EU-EC2 Boro (Spain)': '7892',
    'PE-EC2-Lima': '9593',
    'US-EC2-Boro': '8566',
    'US-Link-SRT': '6308'
  };

  const probeId = probeIds[zone] || '8552';
  let browser;

  try {
    console.log(`Iniciando subida a Boro: ${streamName} -> ${zone} (probe: ${probeId})`);
    
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BORO_URL}/users/sign_in`);
    await page.getByRole('textbox', { name: 'E-mail' }).fill(BORO_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(BORO_PASSWORD);
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForLoadState('networkidle');

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

    await page.waitForTimeout(5000);
    await browser.close();
    
    res.json({ success: true });
  } catch (error) {
    if (browser) await browser.close();
    console.error('Error en submit-to-boro:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor running: http://localhost:${PORT}`);
});