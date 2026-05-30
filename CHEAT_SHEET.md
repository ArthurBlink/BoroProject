# ⚡ Cheat Sheet — GitHub Issues & PR Workflow

Copypaste los comandos. Reemplaza `#N` por tu número de issue.

---

## 🚀 Iniciar un issue

```bash
# 1. Ve a main actualizado
git checkout main
git pull origin main

# 2. Crea tu rama (reemplaza #4 y descripción)
git checkout -b feature/#4-network-interception

# 3. Abre el issue en GitHub para leer qué hacer
# https://github.com/ArthurBlink/BoroProject/issues/4
```

---

## 💻 Trabajar en el código

```bash
# Ver cambios que hiciste
git status
git diff archivo.js

# Guardar cambios (commit)
git add archivo.js archivo2.js
git commit -m "mensaje claro"

# Mensajes de commit BUENOS:
# ✅ "fix: remove DOM scraping in listTasks, use waitForResponse instead"
# ✅ "refactor: replace setTimeout with event-driven waits"
# ✅ "feat: add retry logic with exponential backoff"

# Mensajes MALOS:
# ❌ "fix"
# ❌ "updated code"
# ❌ "wip"
```

---

## 📤 Subir cambios a GitHub

```bash
# Sube tu rama (reemplaza feature/#4-xxx)
git push origin feature/#4-network-interception

# Si fue fuerza-push después de rebase:
git push origin feature/#4-network-interception -f
```

---

## 🔄 Pull Request (PR)

Después de push, GitHub te muestra botón "Compare & pull request" en la rama.

### Template de PR (cópialo)

```markdown
## Issue
Closes #4

## Qué cambió
- Punto 1
- Punto 2
- Punto 3

## Cómo lo testeé
- Describa cómo verificó que funciona

## Checklist
- [ ] Sin console.log() de debug
- [ ] Sin comentarios TODO temporales
- [ ] Probado en headless: false
- [ ] Probado en headless: true (si aplica)
```

---

## 👀 Code Review

Alguien revisa tu PR.

**Si dice "Approved":**
```bash
# Haz click en "Squash and merge" en GitHub
# El issue se cierra automático ✓
```

**Si dice "Changes requested":**
```bash
# Haz los cambios en tu rama local
git add archivo-modificado.js
git commit -m "address review feedback: explain error handling"
git push origin feature/#4-network-interception
# GitHub actualiza el PR automático, no necesitas nuevo PR
```

---

## 💬 Comunicar en el issue

**Pregunta clara:**
```
@ArthurBlink: En el paso 3, cuando logueo todas las responses 
obtengo 50+ logs. ¿Debo filtrar solo las de /tasks?
```

**Reporte de bloqueo:**
```
Estoy en #8 pero está bloqueada por #4. 
¿Cuándo aproximadamente terminas #4?
```

**Compartir descubrimiento:**
```
Encontré que la URL es: GET /api/v2/tasks?probe_id={id}

Respuesta ejemplo:
{
  "id": "task_123",
  "name": "CNN_HD",
  "status": "active",
  "created_at": "2026-05-30T14:22:00Z"
}
```

---

## 🐛 Si hay conflictos en la rama

```bash
# Tu rama está atrás de main (alguien hizo merge)
git fetch origin
git rebase origin/main

# Si hay conflictos, GitHub te lo dice. Resuelve manualmente:
# 1. Abre archivo con <<< >>> conflictos
# 2. Elige qué versión quieres
# 3. git add archivo-resuelto.js
# 4. git rebase --continue
# 5. git push origin feature/#4-xxx -f

# Si se pone complicado, reinicia:
git rebase --abort
git push origin feature/#4-xxx -f
```

---

## 📋 Ver mis issues asignados

```bash
# En terminal:
gh issue list --assignee @tu-usuario

# O en navegador:
# https://github.com/ArthurBlink/BoroProject/issues/assigned
```

---

## 📌 Labels (referencia)

| Label | Significa |
|-------|-----------|
| `priority: high` | Hacer primero (🔴) |
| `priority: medium` | Hacer después (🟡) |
| `priority: low` | Si sobra tiempo (🟢) |
| `estimate: s` | 1-2 horas |
| `estimate: m` | 3-5 horas |
| `estimate: l` | 5-8 horas |
| `estimate: xl` | 8-16 horas |
| `blocked` | Esperando otra issue |
| `triage: ready` | Aprobada, lista para empezar |

---

## 🚨 Errores comunes

### "fatal: pathspec 'feature/#4-xxx' did not match any files"
```bash
# Olvidaste las comillas en comandos con #
git checkout -b "feature/#4-xxx"
```

### "error: Your local changes to [...] would be overwritten by merge"
```bash
# Tienes cambios sin commit
git add .
git commit -m "checkpoint"
git pull
```

### "fatal: The current branch has no upstream branch"
```bash
# Primer push de la rama
git push -u origin feature/#4-xxx
# (después solo: git push)
```

---

## ✅ Checklist ante de hacer PR

- [ ] Lei la descripción del issue completa
- [ ] Hice los cambios que pide
- [ ] Probé localmente que funciona
- [ ] Sin `console.log()` de debug
- [ ] Sin comentarios TODO o WIP
- [ ] Commits con mensajes claros
- [ ] Escribo "Closes #N" en el PR

---

**¿Duda?** Comenta en el issue o pregunta en el chat.

**¿Atascado?** Menciona a alguien: `@nombre necesito ayuda en...`
