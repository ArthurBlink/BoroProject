# 👨‍💻 Bienvenido al equipo BoroProject

Esta es tu guía para entender cómo trabajamos.

## 📖 Documentación (léelo en orden)

### 1. **[FLUJO_DE_TRABAJO.md](./FLUJO_DE_TRABAJO.md)** ← EMPIEZA AQUÍ
Guía completa y educativa sobre cómo funciona GitHub Issues, PRs y el workflow. Lee esto primero.

**Cubre:**
- Qué es un issue
- Cómo te asignan tareas
- Pasos de trabajo (rama → commit → PR → merge)
- Cómo comunicarse en equipo
- Troubleshooting común

**Tiempo:** 10 minutos

---

### 2. **[CHEAT_SHEET.md](./CHEAT_SHEET.md)** ← QUICK REFERENCE
Hoja de trucos. Comandos de Git/GitHub que copypaste mientras trabajas.

**Cubre:**
- Comando: iniciar issue
- Comando: hacer commit
- Comando: subir PR
- Solución rápida a errores comunes

**Tiempo:** 2 minutos (consultarlo según necesites)

---

### 3. **[PLAN_SEMANAL.md](./PLAN_SEMANAL.md)** ← TU ROADMAP
Qué hace cada persona, en qué orden, y cuándo.

**Cubre:**
- Issues asignados a ti
- Dependencias (qué debe hacerse primero)
- Tamaño estimado (horas)
- Fechas esperadas

**Tiempo:** 5 minutos

---

### 4. **[BORO_NETWORK_INTERCEPTION.md](./BORO_NETWORK_INTERCEPTION.md)** ← SI TRABAJAS EN #4, #5, #8
Guía técnica específica para interceptar requests de Boro con Playwright.

**Cubre:**
- Cómo descubrir URLs internas de Boro
- Reemplazar DOM scraping por network interception

**Tiempo:** 5 minutos

---

## 🎯 Quick Start

### Tu primer día

```bash
# 1. Lee FLUJO_DE_TRABAJO.md (10 min)

# 2. Ve a tu issue asignado
# https://github.com/ArthurBlink/BoroProject/issues/assigned

# 3. Crea tu rama
git checkout main
git pull origin main
git checkout -b feature/#N-corta-descripcion

# 4. Haz el trabajo (sigue pasos en el issue)

# 5. Cuando termines
git add archivo1.js archivo2.js
git commit -m "feat: descripción clara (Closes #N)"
git push origin feature/#N-corta-descripcion

# 6. En GitHub, abre PR (usa template en CHEAT_SHEET.md)

# 7. Espera review → merge → issue cierra automático ✓
```

---

## 👥 Quién hace qué

- **ArthurBlink:** Issues #4, #6 (Playwright, network interception)
- **Jurrego1771:** Issues #7, #9, #14, y #5, #11 (queue, session, config)
- **hallin-sys:** Issues #10, #12, #13, #15, y #8 (logging, security, cleanup)

**Plan detallado:** [PLAN_SEMANAL.md](./PLAN_SEMANAL.md)

---

## 📞 Ayuda rápida

| Pregunta | Respuesta |
|----------|-----------|
| ¿Cuál es mi issue? | [Tu assignee](https://github.com/ArthurBlink/BoroProject/issues/assigned) |
| ¿Cómo empiezo? | [FLUJO_DE_TRABAJO.md](./FLUJO_DE_TRABAJO.md) sección 3 |
| ¿Qué comando es? | [CHEAT_SHEET.md](./CHEAT_SHEET.md) |
| ¿Cuándo debo terminar? | [PLAN_SEMANAL.md](./PLAN_SEMANAL.md) |
| ¿Me quedé atascado? | Comenta en tu issue mencionando a alguien |
| ¿Issue tiene un bug/typo? | Comenta: `Creo que hay un error en paso 3, ¿podrías revisar?` |

---

## 🚨 Lo más importante

1. **Leer la descripción del issue completa.** Si no está clara, comenta.

2. **Una rama por issue.** No hagas 3 issues en una sola rama.

3. **Commits con mensaje claro.** `git commit -m "feat: descripción (Closes #N)"`

4. **PR con "Closes #N"** en la descripción. El issue se cierra automático.

5. **Comunicar en el issue si estás bloqueado.** No esperes en silencio.

6. **Si algo falla:** comenta en el issue, no en privado.

---

## 📚 Documentación técnica

- **[BORO_NETWORK_INTERCEPTION.md](./BORO_NETWORK_INTERCEPTION.md)** — Cómo usar Playwright para interceptar requests
- **[CLAUDE.md](./.claude/README.md)** — Configuración de Claude Code (si lo usas)

---

## ✅ Ahora sí

1. **Lee [FLUJO_DE_TRABAJO.md](./FLUJO_DE_TRABAJO.md)** (10 min)
2. **Abre tu issue asignado**
3. **Crea tu rama y empieza**

¡Bienvenido! 🚀

---

**Última actualización:** 2026-05-30  
**Creado por:** @jurrego1771  
**Para:** BoroProject team
