# 2894_signals — configuracion newsletter

Newsletter: **2894_signals** · Plantilla fija en `templates/2894_signals.html` (se diseña una vez, se reutiliza cada semana sin creditos extra).

## Que hace el sistema

1. **Lunes 08:00 UTC**: GitHub Actions comprueba presupuesto y crea un issue con `@cursor` para generar el informe.
2. **Cursor Cloud Agent**: genera `reports/YYYY-MM-DD-ai-news.md` (usa creditos Cursor).
3. **Al guardar el informe**: otra Action envia el mismo reporte por email a todos los suscriptores (gratis con Resend).

Un solo informe. Maximo 5 afiliados + tu correo como owner.

---

## Coste: como no pasarte de creditos Cursor

Cursor **no tiene API publica** para leer "creditos restantes". Por eso usamos **4 capas de proteccion**:

### Capa 1 — Tu panel de Cursor (obligatorio)
1. Ve a [cursor.com/dashboard](https://cursor.com/dashboard) → **Spending**.
2. Pon **spend limit = $0** en on-demand.
3. Asi, si se acaban los creditos incluidos, Cursor **deja de ejecutar** agentes.

### Capa 2 — Presupuesto en el repo
Archivo: `config/budget.json`

- `max_generations_per_month: 4` → 1 informe/semana
- `monthly_token_budget: 100000` → estimacion conservadora
- `stop_if_near_limit: true` → para al 85%

Si se alcanza el limite, el workflow **no crea el issue** y no gasta mas.

### Capa 3 — Prompt lite
Usa `prompts/ai-news-creative-lite.md` (menos tokens que el prompt completo).

### Capa 4 — Un solo informe para todos
No se genera por persona. 1 generacion → N emails (barato).

---

## Paso a paso (15 minutos)

### 1) Tus correos
Ya configurado:

```json
{
  "owner_email": "Slondon99@outlook.es",
  "affiliates": [],
  "max_affiliates": 5
}
```

Para anadir afiliados, edita `config/subscribers.json`.

### 2) Email gratis (Resend)

Tu codigo de Resend es correcto. **No lo pegues en el repo** — solo en secretos.

#### Prueba rapida en tu ordenador

```bash
RESEND_API_KEY=re_TU_CLAVE_AQUI \
FROM_EMAIL=onboarding@resend.dev \
TO_EMAIL=samuel989london89@gmail.com \
node scripts/test-resend.js
```

Eso envia un email de prueba con el diseno **2894_signals**.

#### Importante sobre `onboarding@resend.dev`

| Modo | From | To |
|------|------|-----|
| **Prueba** | `onboarding@resend.dev` | Solo el correo que verificaste al crear cuenta Resend |
| **Produccion** | `newsletter@tudominio.com` | Cualquier suscriptor (Outlook, Gmail, etc.) |

Para enviar a `Slondon99@outlook.es` de forma estable, mas adelante verifica un dominio propio en Resend.

#### Activar en GitHub (automatico semanal)

Repo → **Settings → Secrets and variables → Actions → New secret**:

| Secreto | Valor |
|---------|--------|
| `RESEND_API_KEY` | Tu clave `re_...` (la de Resend, nunca en codigo) |
| `FROM_EMAIL` | `onboarding@resend.dev` (prueba) o tu dominio verificado |

Equivalente a tu snippet, pero sin instalar paquetes (usa `fetch` nativo):

```js
// Esto YA esta en scripts/send-report-email.js — no copies la API key aqui
fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "2894_signals <onboarding@resend.dev>",
    to: ["Slondon99@outlook.es"],
    subject: "2894_signals · semana ...",
    html: "<!-- plantilla 2894_signals -->",
  }),
});
```

#### Si quieres usar el paquete `resend` de npm (opcional)

Solo para pruebas locales, no hace falta para GitHub Actions:

```bash
npm install resend
```

```js
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: "onboarding@resend.dev",
  to: "samuel989london89@gmail.com",
  subject: "2894_signals · prueba",
  html: "<p>Prueba OK</p>",
});
```


### 3) Activar GitHub Actions
- Los workflows estan en `.github/workflows/`.
- En el repo, activa **Actions** si no lo estan.
- El primer lunes (o manualmente: Actions → Weekly report generation → Run workflow) arrancara el ciclo.

### 4) Cursor Cloud Agent
- Conecta el repo en [cursor.com/agents](https://cursor.com/agents).
- El agente debe responder a issues con `@cursor` en el cuerpo.
- Necesitas plan de pago de Cursor para Cloud Agents (segun documentacion actual).

### 5) Vista previa del email (sin enviar)
```bash
node scripts/preview-email.js
```
Abre `reports/preview-2894_signals.html` en el navegador.

### 6) Pagina de alta (opcional)
- `public/index.html` puede publicarse en GitHub Pages.
- Configura un formulario gratis en [formspree.io](https://formspree.io) y pon el ID en el HTML.
- Tu recibes la solicitud y anades el correo manualmente a `subscribers.json` (max 5).

---

## Flujo manual de emergencia

Si quieres control total y cero riesgo de creditos:

1. Desactiva el cron: pon `"enabled": false` en `config/budget.json`.
2. Cada semana, en el chat de Cursor, pega:
   ```
   Lee prompts/ai-news-creative-lite.md, genera el informe y guardalo en reports/YYYY-MM-DD-ai-news.md
   ```
3. Al hacer push, se envia el email automaticamente.

---

## Resumen de costes esperados

| Componente | Coste |
|------------|-------|
| Generacion (Cursor) | Creditos incluidos en tu plan (~4 runs/mes) |
| Envio email (Resend) | Gratis hasta 3000/mes (5 personas × 4 semanas = 20 emails) |
| GitHub Actions | Gratis en repos publicos / minutos incluidos en privados |
| Pagina de suscripcion | Gratis (GitHub Pages + Formspree) |

**Total dinero extra esperado: $0** si respetas limites y spend limit $0 en Cursor.

---

## Pausar todo

```json
// config/budget.json
"enabled": false
```

O desactiva los workflows en GitHub Actions.
