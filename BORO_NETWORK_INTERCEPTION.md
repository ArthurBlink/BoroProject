# Interceptar requests de Boro con Playwright

Boro no expone API pública. Pero el browser hace XHR internamente al navegar.
Playwright puede capturar esas responses — más confiable que scraping DOM.

---

## Paso 1: Activar browser visible

En `server.js`, clase `BoroSession`, método `init()`:

```javascript
// Cambiar temporalmente para inspección
this.browser = await chromium.launch({ headless: false });
```

---

## Paso 2: Loguear todas las responses de Boro

Agregar en `BoroSession.login()` o al inicio de cualquier método, antes de navegar:

```javascript
page.on('response', async (res) => {
  const url = res.url();
  if (url.includes(BORO_URL) && res.status() < 400) {
    console.log(`[NET] ${res.status()} ${res.request().method()} ${url}`);
  }
});
```

Ejecutar `listTasks()` o `submitTask()` y observar consola.
Identificar qué URLs retornan listas de tareas, zonas, probes.

---

## Paso 3: Identificar URLs clave

Navegar a una zona y buscar en consola patterns como:

```
[NET] 200 GET https://boro.elecard.com/probes/8552/tasks
[NET] 200 GET https://boro.elecard.com/api/tasks?probe_id=8552
[NET] 200 GET https://boro.elecard.com/projects/X/probes.json
```

También útil: abrir DevTools (F12) → pestaña Network → filtrar XHR/Fetch
mientras navegas manualmente con `headless: false`.

---

## Paso 4: Reemplazar DOM scraping con intercepción

### Antes (frágil — scraping DOM):

```javascript
const tasks = await page.evaluate((zoneName) => {
  const rows = document.querySelectorAll('table tbody tr, table tr.task_row, table tr');
  // ... parsing manual del DOM
}, zone);
```

### Después (robusto — intercepción):

```javascript
const [response] = await Promise.all([
  page.waitForResponse(
    r => r.url().includes('/tasks') && r.status() === 200,
    { timeout: 15000 }
  ),
  zoneLink.click()
]);
const tasks = await response.json();
```

---

## Paso 5: Reemplazar waitForTimeout con waitForResponse

### Antes (lento + frágil):

```javascript
await zoneLink.click();
await page.waitForTimeout(2000); // espera ciega
// asumir que cargó
```

### Después (rápido + confiable):

```javascript
const [tasksResponse] = await Promise.all([
  page.waitForResponse(r => r.url().includes('/tasks')),
  zoneLink.click()
]);
// ya tenés confirmación de que cargó
```

---

## Aplicaciones concretas

| Operación | Hoy | Con intercepción |
|-----------|-----|-----------------|
| `listTasks` | Scraping DOM tabla | `waitForResponse` → JSON directo |
| `submitTask` confirmación | `waitForTimeout(3000)` | Esperar response de creación |
| `deleteTask` verificación | Asumir éxito | Verificar response 200/204 |
| Zonas disponibles | `PROBE_IDS` hardcodeado | Interceptar carga de `/probes` |

---

## Ejemplo completo: listTasks con intercepción

```javascript
async listTasksForZone(page, zone, probeId) {
  const zoneLink = page.locator(`#sidebar_probe_${probeId}`)
    .getByRole('link', { name: zone });

  const [response] = await Promise.all([
    page.waitForResponse(
      r => r.url().includes('/tasks') && r.status() === 200,
      { timeout: 15000 }
    ),
    zoneLink.click()
  ]);

  return await response.json();
}
```

---

## Descubrir zonas dinámicamente (eliminar PROBE_IDS hardcodeado)

```javascript
async discoverProbes(page) {
  const [response] = await Promise.all([
    page.waitForResponse(
      r => r.url().includes('/probes') && r.status() === 200,
      { timeout: 15000 }
    ),
    page.getByRole('link', { name: 'Bluefile iconMediastream' }).click()
  ]);

  const data = await response.json();
  // data contiene probes con id y nombre → reemplaza PROBE_IDS
  return data;
}
```

> Nota: la URL exacta de `/probes` debe confirmarse con el logging del Paso 2.

---

## Checklist de implementación

- [ ] Paso 1: `headless: false` temporalmente
- [ ] Paso 2: agregar logging de responses
- [ ] Paso 3: identificar URLs de tasks y probes
- [ ] Paso 4: reemplazar `page.evaluate` scraping en `listTasks`
- [ ] Paso 5: reemplazar `waitForTimeout` en `submitTask` y `deleteTask`
- [ ] Bonus: implementar `discoverProbes` para eliminar `PROBE_IDS` hardcodeado
- [ ] Restaurar `headless: true` en producción
