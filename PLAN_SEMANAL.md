# 📅 Plan Semanal — BoroProject Improvements

Quién hace qué y cuándo. Prioridad por dependencias.

---

## Semana 1 (Mayo 30 — Junio 6)

### 🚀 ALTA PRIORIDAD — Hacer primero (bloqueadores)

#### ArthurBlink — #4 (8h) 🚨 CRÍTICO
**Reemplazar scraping de DOM en listTasks por intercepción de red**

```
Estado: OPEN → IN PROGRESS
Rama: feature/#4-network-interception
PR: Pending
```

**Tareas:**
1. Ejecutar `headless: false` + logging temporal
2. Identificar URL exacta del endpoint `/tasks` en Boro
3. Reemplazar `page.evaluate()` DOM scraping por `waitForResponse()`
4. Testar con headless true/false
5. Abrir PR

**Entrega esperada:** Jueves 2 de junio

**Desbloquea:** #5 (8h), #8 (4h) → equipo espera esto

**Contacto:** Si tardas más de 4h, comenta en el issue

---

### 🎯 Paralelo — No dependen de bloqueadores

#### Jurrego1771 — #7 (4h)
**Agregar lógica de reintentos con backoff exponencial**

```
Estado: OPEN → IN PROGRESS
Rama: feature/#7-retry-logic
```

**Tareas:**
1. Crear función `processWithRetry(job, maxRetries=3)`
2. Implementar backoff: 2s, 4s, 8s, máx 30s
3. Distinguir errores retriables vs permanentes
4. Loguear intentos
5. Testar fallo de red simulado

**Entrega esperada:** Miércoles 1 de junio (rápida)

---

#### Jurrego1771 — #9 (4h)
**Persistir sesión Boro en disco**

```
Estado: OPEN → IN PROGRESS
Rama: feature/#9-persist-session
```

**Tareas:**
1. Usar `context.storageState({ path: './boro-session.json' })`
2. Restaurar en `init()`
3. Agregar `boro-session.json` a `.gitignore`
4. Testar reinicio del servidor (no requiere re-login)

**Entrega esperada:** Viernes 3 de junio

**Nota:** Si #4 termina temprano, puede ayudar.

---

#### Jurrego1771 — #14 (1h)
**URL playlist a .env**

```
Estado: OPEN → IN PROGRESS
Rama: feature/#14-playlist-url-env
```

**Tareas:**
1. Crear endpoint `/api/config`
2. Mover hardcoded URL a `MS_PLAYLIST_BASE` env
3. Frontend fetch config

**Entrega esperada:** Lunes 30 de mayo (hoy, si queda tiempo)

**Nota:** Simple, puedes hacer primero para ganar momentum

---

#### hallin-sys — #10 (4h)
**Logging estructurado persistente**

```
Estado: OPEN → IN PROGRESS
Rama: feature/#10-structured-logging
```

**Tareas:**
1. Instalar Winston: `npm install winston`
2. Crear logger con transports (console + archivo)
3. Reemplazar todos `console.log/error` por `logger.info/error`
4. Loguear: jobId, timestamp, error stack
5. Rotar logs en `logs/`

**Entrega esperada:** Viernes 3 de junio

**Nota:** Paralela, no depende de nada

---

#### hallin-sys — #12 (4h)
**Eliminar catch {} vacíos**

```
Estado: OPEN → IN PROGRESS
Rama: feature/#12-remove-silent-catches
```

**Tareas:**
1. Encontrar todos `catch {}` en server.js
2. Agregar log warning mínimo en cada uno
3. Especificar si es "normal" ignorar o si es error

**Ubicaciones:**
- `loadData()` línea ~40
- `loadSubmittedTasks()` línea ~51
- `deleteTask()` línea ~293, ~318

**Entrega esperada:** Miércoles 1 de junio (rápida)

---

#### hallin-sys — #13 (4h)
**Validar URLs antes de encolar**

```
Estado: OPEN → IN PROGRESS
Rama: feature/#13-input-validation
```

**Tareas:**
1. Validar `streamUrl` con `new URL()`
2. Validar `zone` existe en PROBE_IDS
3. Validar `signalType` es enum válido
4. Retornar 400 con mensajes específicos

**Entrega esperada:** Jueves 2 de junio

---

#### hallin-sys — #15 (2h)
**Completar o deprecar scripts CLI**

```
Estado: OPEN → IN PROGRESS
Rama: feature/#15-cleanup-cli
```

**Tareas:**
1. Decidir: eliminar `listTasks.js` (redundante) o completar
2. Mover `exploreBoro.js` a `scripts/dev/` con README
3. Documentar qué es cada script

**Entrega esperada:** Lunes 30 de mayo (fácil)

---

## Semana 2 (Junio 6 — Junio 13)

### ⏳ Se desbloquea cuando #4 está hecho

#### ArthurBlink → Jurrego1771 — #5 (8h) 🔗 Depende de #4
**Reemplazar waitForTimeout fijos por esperas orientadas a eventos**

```
Estado: BLOCKED → IN PROGRESS (cuando #4 mergea)
Rama: feature/#5-event-driven-waits
```

**No puede empezar hasta:** #4 esté merged

**Tareas:**
1. Reemplazar `waitForTimeout(2000)` por `waitForLoadState('networkidle')`
2. Reemplazar `waitForTimeout()` antes de click por `waitForResponse()`
3. Quitar timeouts en submitTask, deleteTask, listTasks

**Entrega esperada:** 8-10 de junio

**Nota:** ArthurBlink: cuando termines #4, avisa en #5 que ya puede empezar

---

#### hallin-sys — #8 (4h) 🔗 Depende de #4
**Verificar duplicados antes de crear tarea**

```
Estado: BLOCKED → IN PROGRESS (cuando #4 mergea)
Rama: feature/#8-dedup-check
```

**No puede empezar hasta:** #4 esté merged (necesita listTasks funcional)

**Tareas:**
1. Crear `taskExistsInBoro(taskName, zone)`
2. Llamar antes de `submitTask()`
3. Retornar `{ success: true, skipped: true }` si existe

**Entrega esperada:** 8-9 de junio

---

#### Jurrego1771 — #11 (4h) ✅ Independiente
**Metadatos completos en submitted-tasks.json**

```
Estado: OPEN → IN PROGRESS (cuando termines otros)
Rama: feature/#11-task-metadata
```

**Tareas:**
1. Expandir schema: agregar `streamUrl`, `signalType`, `account`, `boroTaskId`
2. Migración de entradas antiguas (campos faltantes = null)
3. Actualizar `finishJob()` para guardar todos los metadatos

**Entrega esperada:** Cualquier momento (no depende de nadie)

---

## 📊 Resumen por persona

### ArthurBlink
| # | Issue | Tamaño | Semana | Estado |
|---|-------|--------|--------|--------|
| 4 | Intercepción de red | L (8h) | S1 | 🚨 CRÍTICO |
| 6 | Descubrir probes | L (8h) | S1 | 🔴 HIGH |
| **Total** | | **16h** | | |

### Jurrego1771
| # | Issue | Tamaño | Semana | Estado |
|---|-------|--------|--------|--------|
| 14 | URL playlist | S (1h) | S1 | 🟢 LOW (hoy) |
| 7 | Reintentos | M (4h) | S1 | 🔴 HIGH |
| 9 | Persistir sesión | M (4h) | S1 | 🟡 MEDIUM |
| 5 | waitForTimeout | L (8h) | S2 | ⏳ BLOQUEADO |
| 11 | Metadatos | M (4h) | S2 | ✅ Ready now |
| **Total S1** | | **9h** | | |
| **Total S2** | | **12h** | | |

### hallin-sys
| # | Issue | Tamaño | Semana | Estado |
|---|-------|--------|--------|--------|
| 15 | Cleanup CLI | S (2h) | S1 | 🟢 LOW (hoy) |
| 12 | Eliminar catch | M (4h) | S1 | 🟡 MEDIUM |
| 10 | Logging | M (4h) | S1 | 🟡 MEDIUM |
| 13 | Validar URLs | M (4h) | S1 | 🟡 MEDIUM |
| 8 | Verificar duplicados | M (4h) | S2 | ⏳ BLOQUEADO |
| **Total S1** | | **14h** | | |
| **Total S2** | | **4h** | | |

---

## 🎯 Reglas de la semana 1

1. **ArthurBlink prioriza #4** — es el cuello de botella
   - Si termina en 2-3 días: puede ayudar en paralelo
   - Si termina el viernes: avisa en los issues bloqueados

2. **Otros avanzan en paralelo** — #4 no te detiene
   - Jurrego1771 hace #7, #9, #14
   - hallin-sys hace #10, #12, #13, #15

3. **Al terminar PR**: 
   - Comenta "Listo para review" en el issue
   - Espera aprobación (otro la revisa)
   - Merge cuando aprobada

4. **Si estás bloqueado:**
   - Comenta mencionando a quien depende
   - No esperes en silencio

5. **Comunicar diario:**
   - Si pasó algo raro, comenta en issue
   - Si va rápido, comenta "Terminé X, listar para review"

---

## ✅ Hito de éxito

**Viernes 3 de junio (fin de S1):**
- ✓ #4 Merged (ArthurBlink)
- ✓ #6 Merged (ArthurBlink)
- ✓ #7 Merged (Jurrego1771)
- ✓ #9 Merged (Jurrego1771)
- ✓ #14 Merged (Jurrego1771)
- ✓ #10 Merged (hallin-sys)
- ✓ #12 Merged (hallin-sys)
- ✓ #13 Merged (hallin-sys)
- ✓ #15 Merged (hallin-sys)

**Viernes 10 de junio (fin de S2):**
- ✓ #5 Merged (bloqueador #4 liberado)
- ✓ #8 Merged (bloqueador #4 liberado)
- ✓ #11 Merged (Jurrego1771)

**Total esperado:** 12 issues cerrados en 2 semanas.

---

## 🚀 Ahora sí, ¡a trabajar!

1. Abre tu issue asignado
2. Lee FLUJO_DE_TRABAJO.md
3. Crea tu rama con `git checkout -b feature/#N-xxx`
4. Haz el trabajo
5. Sube PR cuando termines

**¿Preguntas?** Comenta en el issue o en el chat.

¡Adelante! 💪
