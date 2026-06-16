# 📋 Flujo de Trabajo con GitHub Issues

Guía para el equipo. Esta es la metodología que vamos a usar para organizar el trabajo en BoroProject.

---

## 1. ¿Qué es un Issue?

Un **issue** en GitHub es una tarea, bug o feature que necesita ser hecha.

Cada issue tiene:
- **Título** — qué es lo que hay que hacer
- **Descripción** — por qué, cómo, criterios de éxito
- **Labels** — etiquetas para categorizar (prioridad, tipo, tamaño estimado)
- **Asignado a** — quién la va a hacer
- **Estado** — OPEN (sin hacer) / CLOSED (completada)

**Ejemplo:**
```
Título: "Reemplazar scraping de DOM en listTasks por intercepción de red"

Labels: 
  - estimate: l (8 horas)
  - priority: high (urgente)
  - triage: ready (aprobada por el equipo)

Asignado a: @ArthurBlink

Estado: OPEN (esperando que empiece)
```

---

## 2. ¿Cuál es tu asignación?

Mira [la página de issues asignados a ti](https://github.com/ArthurBlink/BoroProject/issues/assigned).

**Si eres ArthurBlink:**
- #4 — Intercepción de red en listTasks (8h, ALTA prioridad)
- #6 — Descubrir probes dinámicamente (8h, ALTA prioridad)

**Si eres Jurrego1771:**
- #7 — Reintentos con backoff (4h, ALTA prioridad)
- #9 — Persistir sesión Boro (4h, MEDIA prioridad)
- #14 — URL playlist a .env (1h, BAJA prioridad)

**Si eres hallin-sys:**
- #10 — Logging estructurado (4h, MEDIA prioridad)
- #12 — Eliminar catch vacíos (4h, MEDIA prioridad)
- #13 — Validar URLs (4h, MEDIA prioridad)
- #15 — Completar/deprecar CLI (2h, BAJA prioridad)

**Algunas están bloqueadas (⏳):**
- #5 espera a que #4 esté terminada
- #8 espera a que #4 esté terminada

---

## 3. Flujo de trabajo — paso a paso

### Paso 1: Abre el issue

Haz click en tu issue (ej: [#4](https://github.com/ArthurBlink/BoroProject/issues/4)).

Lee la descripción completa. Si algo no está claro, **comenta en el issue preguntando**.

```
Ejemplo de pregunta clara:
"En el paso de descubrimiento, ¿debo loguear TODAS las responses 
o solo las que matchean '/tasks'?"
```

### Paso 2: Crea una rama local

Trabajas en tu rama, no en `main`. 

```bash
git checkout -b feature/#4-network-interception
```

**Nombre de rama:** `feature/#NUMERO-descripcion-corta`

### Paso 3: Haz el trabajo

- Sigue los pasos en la descripción del issue
- Si encuentras problemas, comenta en el issue (que vea el equipo)
- Haz commits claros con `git commit -m "mensaje"`

**Mensaje de commit claro:**
```
fix: intercept /tasks response in listTasks instead of DOM scraping

- Add page.waitForResponse() to capture Boro's internal XHR
- Remove page.evaluate() DOM parsing
- Update return format to match JSON structure

Closes #4
```

**Mensaje de commit malo:**
```
fix stuff
updated code
```

### Paso 4: Abre un Pull Request (PR)

Cuando termines, subes tu rama:

```bash
git push origin feature/#4-network-interception
```

En GitHub, aparecerá un botón "Compare & pull request". Haz click.

**En el PR, escribe:**

```markdown
## Issue
Closes #4

## Qué cambió
- Reemplazado page.evaluate() scraping por page.waitForResponse()
- URL de tasks endpoint es: GET /api/v2/tasks?probe_id={id}
- Retorna JSON con fields: id, name, status, created_at

## Cómo lo testé
- Ejecutado contra staging de Boro
- Listadas 25 tareas sin errores de DOM
- Verificado con headless: false y headless: true

## Checklist
- [x] Código sigue convenciones del proyecto
- [x] Sin console.log() temporales
- [x] Sin comentarios de debug
```

### Paso 5: Code review

Alguien del equipo revisa tu PR:
- Si dice "Looks good" → aprobado
- Si dice "Changes requested" → haz los cambios y sube again

**Cómo responder a feedback:**

Si te piden cambios:
```bash
# Haz el cambio en tu rama local
git add archivo-modificado.js
git commit -m "address review feedback: clarify error handling"
git push origin feature/#4-network-interception
```

No necesitas hacer un nuevo PR. GitHub actualiza automáticamente el mismo PR.

### Paso 6: Merge

Cuando está aprobado, haces click en "Squash and merge" o "Create a merge commit".

**El issue se cierra automáticamente** porque dijiste "Closes #4" en el PR.

---

## 4. Comunicación en el equipo

### Usa comments en el issue para actualizaciones

**Ejemplo — ArthurBlink reporta progreso:**

```
Iniciando #4. He descubierto:
- La URL exacta es: GET /projects/1/probes/8552/tasks
- Retorna JSON con: id, name, status, created_at, url

Próximo: implementar waitForResponse matcher

Estimado: 2-3 días, luego #5 y #8 pueden empezar.
```

**Ejemplo — Alguien está bloqueado:**

```
@ArthurBlink: Estoy en #8 y necesito saber la estructura 
del JSON que retorna /tasks. ¿Puedes compartir un ejemplo 
o una screenshot?
```

**Ejemplo — Descubres un problema:**

```
En #9, al persistir la sesión me doy cuenta que el archivo 
boro-session.json tiene permisos inseguros. ¿Debo agregarlo 
a .gitignore? Sugiero crear un issue separado #16 para 
validar permisos de archivo.
```

### Menciones (@username)

Usa `@nombre` si necesitas notificar a alguien específicamente:

```
@ArthurBlink necesito que revises mi implementación 
en #5 cuando termines #4.
```

---

## 5. Estados y Labels (referencia rápida)

### Labels de Prioridad

- 🔴 **priority: high** — Urgente, hacer primero
- 🟡 **priority: medium** — Importante, hacer después
- 🟢 **priority: low** — Bueno tener, hacer al final

### Labels de Tamaño (Estimate)

- **estimate: s** — Pequeño (1-2h)
- **estimate: m** — Mediano (3-5h)
- **estimate: l** — Grande (5-8h)
- **estimate: xl** — Extra grande (8-16h)

### Labels de Estado

- **triage: ready** — Aprobada por el equipo, lista para empezar
- **blocked** — Esperando otra issue
- **in-progress** — Alguien está trabajando en ello

---

## 6. Ejemplo completo: Tu primer issue

### Día 1 — Asignación

Te asignan [#14 — URL playlist a .env](https://github.com/ArthurBlink/BoroProject/issues/14)

Lees la descripción. Es simple:
- Mover `https://mdstrm.com` de hardcoded a variable `.env`
- Crear endpoint `/api/config` en server
- Actualizar frontend para leer de `/api/config`

Estimado: 1 hora.

### Día 1 — Empezar

```bash
git checkout main
git pull origin main
git checkout -b feature/#14-playlist-url-env
```

Abres `components.jsx`, ves línea ~65:
```javascript
const playlistUrl = `https://mdstrm.com/live-stream-playlist/${stream.id}.m3u8`;
```

Cambias a:
```javascript
const { playlistBase } = await fetch('/api/config').then(r => r.json());
const playlistUrl = `${playlistBase}/live-stream-playlist/${stream.id}.m3u8`;
```

Adds en `server.js`:
```javascript
app.get('/api/config', (req, res) => {
  res.json({
    playlistBase: process.env.MS_PLAYLIST_BASE || 'https://mdstrm.com',
  });
});
```

Adds en `.env.example`:
```
MS_PLAYLIST_BASE=https://mdstrm.com/live-stream-playlist
```

### Día 1 — Commit y push

```bash
git add components.jsx server.js .env.example
git commit -m "feat: make playlist URL configurable via MS_PLAYLIST_BASE env var

- Add GET /api/config endpoint to expose playlist base URL
- Update frontend to fetch config and build URL dynamically
- Add MS_PLAYLIST_BASE to .env.example with default value

Closes #14"

git push origin feature/#14-playlist-url-env
```

### Día 1 — Pull Request

En GitHub, creas PR con título: `Make playlist URL configurable (closes #14)`

Body:
```markdown
## Issue
Closes #14

## Cambios
- Agregado endpoint GET /api/config en server.js
- Frontend ahora fetch config en lugar de usar URL hardcodeada
- Variable .env MS_PLAYLIST_BASE con default

## Testeado
- Comprobado que playlist URL se construye correctamente con default
- Comprobado que se actualiza si cambio .env
```

### Día 1 — Code review

Jurrego1771 revisa y dice: "Looks good!"

Haces click en "Squash and merge".

**Issue #14 se cierra automáticamente.**

---

## 7. Troubleshooting

### "Mi rama tiene conflictos con main"

Alguien hizo merge a main mientras trabajabas. Resuelve:

```bash
git fetch origin
git rebase origin/main
# Si hay conflictos, edita los archivos
git add archivo-conflictivo.js
git rebase --continue
git push origin feature/#XX-nombre -f  # el -f es fuerza después de rebase
```

### "Olvidé agregar Closes #14 en el commit"

Edita el PR description en GitHub y agrega `Closes #14`. Funciona igual.

### "Mi PR tiene 2 commits, quiero que sea 1"

En el PR, usa "Squash and merge" en lugar de "Create a merge commit".

### "¿Debo trabajar todo en una rama o múltiples?"

**Una rama por issue**. Si #4 tarda 2 semanas, trabajas en `feature/#4-xxx` todo ese tiempo.

---

## 8. Resumen rápido

```
1. Abre tu issue → LEE la descripción completa
2. Crea rama → git checkout -b feature/#N-nombre
3. Haz el trabajo → edita archivos, haz commits claros
4. Push → git push origin feature/#N-nombre
5. Pull Request → escribe "Closes #N" en la descripción
6. Code review → espera aprobación
7. Merge → GitHub cierra el issue automático
8. Siguiente issue → repite
```

---

## 9. Ayuda

**¿Preguntas sobre el código?**
→ Comenta en el issue

**¿Bloqueado por otro issue?**
→ Comenta mencionando a la persona, ej: `@ArthurBlink necesito...`

**¿Encontraste un bug no previsto?**
→ Comenta en el issue actual o crea un nuevo issue si es bien diferente

**¿No entiendes algo en esta guía?**
→ Comenta aquí o pregunta en el chat del equipo

---

¡Ahora saben cómo trabajar! 🚀
