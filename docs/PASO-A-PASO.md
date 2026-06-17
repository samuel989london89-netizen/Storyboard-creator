# 2894_signals — Guia paso a paso (sin tecnicismos)

## Que tienes ya hecho (no toques nada)

- El informe semanal
- El diseno bonito del email (2894_signals)
- Tu correo guardado: Slondon99@outlook.es

Solo falta **conectar el envio por email**. Son 2 partes.

---

# PARTE A — Recibir tu primer email de prueba (10 minutos)

## Paso 1: Entra en Resend y copia tu clave

1. Abre https://resend.com y entra en tu cuenta
2. Ve a **API Keys**
3. Copia tu clave (empieza por `re_...`)
4. **No la compartas con nadie** y no la pegues en chats

## Paso 2: Abre la terminal en Cursor

1. Abre tu proyecto en Cursor
2. Arriba en el menu: **Terminal → New Terminal**
3. Veras una ventanita negra abajo. Eso es la terminal.

## Paso 3: Pega este comando (cambia solo la clave)

Copia todo, pega en la terminal, y **sustituye** `re_PON_AQUI_TU_CLAVE` por tu clave real:

```bash
RESEND_API_KEY=re_PON_AQUI_TU_CLAVE FROM_EMAIL=onboarding@resend.dev TO_EMAIL=samuel989london89@gmail.com node scripts/test-resend.js
```

Pulsa **Enter**.

## Paso 4: Mira tu Gmail

- Abre **samuel989london89@gmail.com**
- Busca un email de **2894_signals**
- Si no esta, mira en **Spam**

### Si sale error

- **"Falta RESEND_API_KEY"** → no pegaste bien la clave
- **"You can only send to your own email"** → cambia `TO_EMAIL` al correo con el que creaste la cuenta Resend
- **"Invalid API key"** → copia de nuevo la clave en Resend

---

# PARTE B — Que te llegue a Outlook (Slondon99@outlook.es)

Con `onboarding@resend.dev` (modo prueba) **solo puedes enviar al Gmail verificado**.

Para enviar a **Slondon99@outlook.es** necesitas despues:

1. Tener un dominio (ej: `tudominio.com`)
2. Verificarlo en Resend
3. Usar `FROM_EMAIL=newsletter@tudominio.com`

**Por ahora:** prueba con Gmail. Cuando funcione, pasamos a Outlook.

---

# PARTE C — Activar envio automatico (cuando la prueba funcione)

## Paso 5: Entra en GitHub

1. Abre https://github.com/samuel989london89-netizen/Storyboard-creator
2. Arriba: **Settings** (Configuracion)
3. Menu izquierda: **Secrets and variables → Actions**

## Paso 6: Crea el secreto 1

1. Pulsa **New repository secret**
2. Name: `RESEND_API_KEY`
3. Secret: pega tu clave `re_...`
4. **Add secret**

## Paso 7: Crea el secreto 2

1. Otra vez **New repository secret**
2. Name: `FROM_EMAIL`
3. Secret: `onboarding@resend.dev`
4. **Add secret**

## Paso 8: Prueba el envio automatico

1. En GitHub, pestana **Actions**
2. Elige **Send weekly newsletter**
3. Pulsa **Run workflow** → **Run workflow**
4. Espera 1-2 minutos (circulo verde = OK)

---

# PARTE D — Cada semana (informe nuevo)

## Opcion facil (tu solo escribes 1 frase en Cursor)

Cada lunes (o cuando quieras), en el chat de Cursor pega:

```
Lee prompts/ai-news-creative-lite.md, investiga las novedades de esta semana y genera el informe. Guardalo en reports/FECHA-ai-news.md
```

(Cambia FECHA por hoy, ej: 2026-06-24)

Cuando se guarde el archivo y se suba a GitHub, el email se envia solo a tus suscriptores.

---

# Resumen en 4 lineas

1. Copia tu clave de Resend
2. Ejecuta el comando de prueba en la terminal de Cursor
3. Si llega el Gmail, pon los 2 secretos en GitHub
4. Cada semana: pide el informe en Cursor → se envia solo

---

# Si te atasacas

Dime exactamente en que paso estas (1, 2, 3...) y que mensaje de error ves. Te lo resuelvo.
