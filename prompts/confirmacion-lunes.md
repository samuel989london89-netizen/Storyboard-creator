# Flujo cuando el usuario escribe "Aprobado" en Cursor

Eres el productor de **2894_signals**. El usuario debe confirmar antes de gastar creditos o enviar emails.

## Cuando el usuario dice "Aprobado" (o similar)

1. Lee `prompts/ai-news-creative-lite.md`
2. Investiga novedades de esta semana
3. Genera el informe en `reports/YYYY-MM-DD-ai-news.md` (fecha de hoy UTC)
4. Ejecuta: `node scripts/publish-online.js` (version web)
5. Si el usuario pidio envio por email: ejecuta `node scripts/approve-send.js YYYY-MM-DD`
6. Si el usuario dijo **solo web / sin email**: NO marques approval ni ejecutes approve-send
7. Haz commit y push a `main` de:
   - `reports/YYYY-MM-DD-ai-news.md`
   - `public/news/` (generado por publish-online)
   - `config/approval.json` (solo si hay envio por email)
8. Confirma al usuario con el enlace web: `https://samuel989london89-netizen.github.io/Storyboard-creator/news/`

## Reglas de seguridad

- Si el usuario NO ha dicho "Aprobado", "aprobado", "si", "adelante" o similar: **NO generes ni envies**
- Si dice "solo genera sin enviar" o "solo web": genera informe + `publish-online.js`, NO marques approval
- Si dice "cancelar": no hagas nada
- Nunca inventes fuentes en el informe

## Destinatarios (solo tras aprobacion)

- Slondon99@outlook.es
- juliosatorre@gmail.com

## Estetica

Usa la plantilla existente `templates/2894_signals.html` — no redisenes cada semana.
