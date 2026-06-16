// scripts/dev/exploreBoro.js
// Development-only: used to reverse-engineer Boro selectors.
// Not part of production — kept here for reference when Boro UI changes.
import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config();

const BORO_URL = process.env.BORO_URL;
const BORO_USERNAME = process.env.BORO_USERNAME;
const BORO_PASSWORD = process.env.BORO_PASSWORD;

async function exploreBoro() {
  console.log('=== Explorando Boro para identificar selectors ===\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Navegando directamente a Boro login...');
    await page.goto('https://boro.elecard.com/users/sign_in');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log(`   URL actual: ${page.url()}`);

    console.log('\n2. Analizando formulario de login...');
    const loginForm = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      const inputs = document.querySelectorAll('input');
      const labels = document.querySelectorAll('label');
      const buttons = document.querySelectorAll('button, input[type="submit"]');
      return {
        forms_count: forms.length,
        inputs: Array.from(inputs).map(i => ({
          type: i.type,
          name: i.name,
          id: i.id,
          placeholder: i.placeholder,
          class: i.className
        })),
        labels: Array.from(labels).map(l => ({
          text: l.textContent?.trim(),
          for: l.htmlFor
        })),
        buttons: Array.from(buttons).map(b => ({
          text: b.textContent?.trim(),
          type: b.type,
          class: b.className,
          value: b.value
        }))
      };
    });
    console.log('   Inputs:', JSON.stringify(loginForm.inputs, null, 2));
    console.log('   Labels:', JSON.stringify(loginForm.labels, null, 2));
    console.log('   Botones:', JSON.stringify(loginForm.buttons, null, 2));

    console.log('\n3. Completando credenciales...');
    const emailInput = page.locator('#user_email, input[name="user[email]"]').first();
    await emailInput.fill(BORO_USERNAME);
    console.log('   Email completado');

    const passwordInput = page.locator('#user_password, input[name="user[password]"]').first();
    await passwordInput.fill(BORO_PASSWORD);
    console.log('   Password completado');

    const rememberMeCheckbox = page.locator('#user_remember_me').first();
    if (await rememberMeCheckbox.isVisible()) {
      await rememberMeCheckbox.check();
      console.log('   Recordarme marcado');
    }

    const submitBtn = page.locator('input[type="submit"], button[type="submit"]').first();
    const submitInfo = await submitBtn.evaluate(el => ({
      type: el.type,
      value: el.value,
      class: el.className
    }));
    console.log(`   Botón submit: ${JSON.stringify(submitInfo)}`);

    await submitBtn.click();
    console.log('   Login enviado...');
    await page.waitForTimeout(3000);

    console.log(`   URL después del login: ${page.url()}`);

    console.log('\n4. Cerrando diálogos si existen...');
    const closeButtons = await page.locator('button:has-text("OK"), button:has-text("Close"), .ui-dialog-titlebar-close').all();
    for (const btn of closeButtons.slice(0, 3)) {
      try {
        if (await btn.isVisible({ timeout: 1000 })) {
          await btn.click();
          await page.waitForTimeout(500);
          console.log('   Cerrado diálogo');
        }
      } catch (e) {}
    }

    console.log('\n5. Explorando página principal después del login...');
    await page.waitForTimeout(2000);

    const mainPage = await page.evaluate(() => {
      const navItems = document.querySelectorAll('nav a, .nav a, [class*="nav"] a, menu a, [role="menuitem"]');
      const buttons = document.querySelectorAll('button, [role="button"], .btn');
      const links = document.querySelectorAll('a');
      const pageTitle = document.querySelector('h1, h2, [class*="title"], [class*="header"]');
      return {
        page_title: pageTitle?.textContent?.trim(),
        nav_items: Array.from(navItems).map(a => ({
          text: a.textContent?.trim(),
          href: a.href,
          class: a.className
        })).slice(0, 20),
        buttons: Array.from(buttons).slice(0, 15).map(b => ({
          text: b.textContent?.trim(),
          class: b.className
        })),
        links_sample: Array.from(links).slice(0, 15).map(a => ({
          text: a.textContent?.trim(),
          href: a.href?.substring(0, 80)
        }))
      };
    });
    console.log('   Título de página:', mainPage.page_title);
    console.log('   Navegación:', JSON.stringify(mainPage.nav_items, null, 2));
    console.log('   Botones:', JSON.stringify(mainPage.buttons, null, 2));

    console.log('\n6. Buscando "All Projects"...');
    const allProjectsLink = await page.locator('text=All Projects').first();
    if (await allProjectsLink.isVisible()) {
      const allProjectsSelector = await allProjectsLink.evaluate(el => {
        if (el.id) return `#${el.id}`;
        if (el.className) return `.${el.className.split(' ').join('.')}`;
        return el.outerHTML.substring(0, 150);
      });
      console.log(`   All Projects encontrado: ${allProjectsSelector}`);
      await allProjectsLink.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('   No se encontró "All Projects" visible');
    }

    console.log(`\n   URL actual: ${page.url()}`);

    console.log('\n7. Buscando proyecto "Mediastream"...');
    const projectLink = await page.locator('text=Mediastream').first();
    if (await projectLink.isVisible()) {
      const projectSelector = await projectLink.evaluate(el => ({
        tag: el.tagName,
        text: el.textContent?.trim(),
        class: el.className,
        id: el.id,
        href: el.href
      }));
      console.log(`   Proyecto encontrado: ${JSON.stringify(projectSelector)}`);
    } else {
      console.log('   No se encontró "Mediastream" visible');
    }

    console.log('\n8. Haciendo clic en proyecto Mediastream...');
    await page.locator('text=Mediastream').click();
    await page.waitForTimeout(3000);
    console.log(`   URL después de clic en Mediastream: ${page.url()}`);

    console.log('\n9. Explorando estructura de zonas (CL, CO, EU, PE, US, SRT)...');
    const zones = await page.evaluate(() => {
      const zoneTabs = document.querySelectorAll('[class*="tab"], [role="tab"], .tabs, [class*="zone"]');
      const headings = document.querySelectorAll('h1, h2, h3, h4, [class*="heading"]');
      const sidebarItems = document.querySelectorAll('[class*="sidebar"] a, [class*="menu"] a, [class*="nav"] a');
      return {
        headings: Array.from(headings).map(h => h.textContent?.trim()).filter(Boolean).slice(0, 10),
        tabs: Array.from(zoneTabs).map(t => ({
          text: t.textContent?.trim().substring(0, 50),
          class: t.className
        })),
        sidebar: Array.from(sidebarItems).map(s => ({
          text: s.textContent?.trim(),
          href: s.href
        }))
      };
    });
    console.log('   Encabezados:', JSON.stringify(zones.headings, null, 2));
    console.log('   Tabs/Zonas:', JSON.stringify(zones.zones, null, 2));
    console.log('   Sidebar:', JSON.stringify(zones.sidebar, null, 2));

    console.log('\n10. Explorando la página del proyecto...');
    const projectPage = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      const links = document.querySelectorAll('a');
      const divs = document.querySelectorAll('div[class]');
      return {
        tables_count: tables.length,
        links_count: links.length,
        divs_sample: Array.from(divs).slice(0, 20).map(d => ({
          class: d.className,
          text: d.textContent?.trim().substring(0, 80)
        }))
      };
    });
    console.log('   Tables:', projectPage.tables_count);
    console.log('   Links:', projectPage.links_count);
    console.log('   Divs:', JSON.stringify(projectPage.dirs_sample, null, 2));

    console.log('\n=== Exploración completada ===');
    console.log('\n=== RESUMEN DE SELECTORS ===');
    console.log('Login: #user_email, #user_password, input[type="submit"]');
    console.log('All Projects: a[href="/projects?projects=all"]');
    console.log('Proyecto Mediastream: a.project_link2, text=Mediastream');

  } catch (error) {
    console.error('Error durante exploración:', error.message);
  } finally {
    await browser.close();
  }
}

exploreBoro().catch(console.error);
