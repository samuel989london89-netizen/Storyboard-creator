# 2894_signals — Automatico cada lunes

## Destinatarios actuales

| Rol | Correo |
|-----|--------|
| Owner (tu) | Slondon99@outlook.es |
| Afiliado 1 | juliosatorre@gmail.com |

Maximo 5 afiliados en total.

---

## Que pasa cada lunes (automatico)

```
Lunes 07:00 UTC  →  Crea issue @cursor para generar informe
       ↓
Cursor genera reports/FECHA-ai-news.md y hace push a main
       ↓
Lunes 09:00 UTC  →  Envia email 2894_signals a todos los suscriptores
```

Tambien se envia **al momento** cuando se sube un informe nuevo a `main`.

---

## IMPORTANTE: activar en GitHub (una sola vez)

Los workflows automaticos **solo funcionan en la rama `main`**.

### Paso 1 — Fusionar los cambios
1. Abre: https://github.com/samuel989london89-netizen/Storyboard-creator/pull/2
2. Pulsa **Merge pull request**

### Paso 2 — Secretos de Resend (si no lo hiciste)
GitHub → repo → **Settings → Secrets → Actions**:

| Nombre | Valor |
|--------|--------|
| `RESEND_API_KEY` | tu clave `re_...` |
| `FROM_EMAIL` | `onboarding@resend.dev` |

### Paso 3 — Cursor conectado a GitHub
1. [cursor.com/agents](https://cursor.com/agents)
2. Repo conectado: **Storyboard-creator**
3. El agente debe responder a `@cursor` en issues

### Paso 4 — Probar manualmente (opcional)
GitHub → **Actions** → **2894_signals — Lunes automatico** → **Run workflow**

---

## Nota sobre correos

Con `onboarding@resend.dev` (modo prueba), Resend puede limitar destinatarios.
Para que llegue bien a **Outlook** y a **juliosatorre@gmail.com** cada semana,
verifica un dominio en Resend cuando puedas.

---

## Pausar el automatico

En `config/budget.json` pon `"enabled": false`
