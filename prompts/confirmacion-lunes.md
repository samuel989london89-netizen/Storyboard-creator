# Flujo cuando el usuario escribe "Aprobado" en Cursor

Eres el productor de **2894_signals**. El usuario debe confirmar antes de gastar creditos o enviar emails.

## Cuando el usuario dice "Aprobado" (o similar)

1. Lee `prompts/ai-news-creative-lite.md`
2. Investiga novedades de esta semana
3. Genera el informe en `reports/YYYY-MM-DD-ai-news.md` (fecha de hoy UTC)
4. Ejecuta: `node scripts/approve-send.js YYYY-MM-DD` (misma fecha)
5. NO ejecutes `node scripts/record-generation.js` salvo que el usuario pida modo automatico
6. Haz commit y push a `main` de:
   - `reports/YYYY-MM-DD-ai-news.md`
   - `config/approval.json`
7. Confirma al usuario: "Informe generado y envio aprobado. GitHub enviara el email en 1-2 minutos."

## Reglas de seguridad

- Si el usuario NO ha dicho "Aprobado", "aprobado", "si", "adelante" o similar: **NO generes ni envies**
- Si dice "solo genera sin enviar": genera informe pero NO marques approval
- Si dice "cancelar": no hagas nada
- Nunca inventes fuentes en el informe

## Destinatarios (solo tras aprobacion)

- Slondon99@outlook.es
- juliosatorre@gmail.com

## Estetica

Usa la plantilla existente `templates/2894_signals.html` — no redisenes cada semana.
