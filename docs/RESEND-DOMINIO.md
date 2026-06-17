# Resend — enviar a Outlook y Gmail de Julio

## Que paso

Los secretos de GitHub **estan bien**.  
Resend respondio:

> Solo puedes enviar emails de prueba a **samuel989london89@gmail.com**.  
> Para otros destinatarios, verifica un dominio en Resend.

Por eso **no llego** a:
- Slondon99@outlook.es
- juliosatorre@gmail.com

---

## Solucion (cuando quieras produccion real)

### Paso 1 — Dominio en Resend
1. https://resend.com/domains → **Add Domain**
2. Pon un dominio que controles (ej. `tudominio.com`)
3. Resend te da registros DNS — copialos en tu proveedor de dominio (GoDaddy, Cloudflare, etc.)
4. Espera verificacion (suele tardar minutos u horas)

### Paso 2 — Cambiar FROM_EMAIL en GitHub
Secretos → `FROM_EMAIL` → cambia a:

```
newsletter@tudominio.com
```

(o `2894@tudominio.com`, el que verifiques)

### Paso 3 — Volver a enviar
En Cursor escribe: **Aprobado** (o relanza el workflow en GitHub Actions)

---

## Mientras tanto — prueba solo a tu Gmail

El pipeline **si funciona**. Para comprobarlo:

GitHub Actions → **Send 2894_signals newsletter** → Run workflow

Con `config/resend-test.json` en modo prueba, solo envia a tu Gmail verificado.

---

## Sin dominio propio

Opciones:
- Comprar dominio barato (~10€/ano) y verificarlo en Resend
- Usar un subdominio si ya tienes web
- Enviar manualmente cada semana con `node scripts/test-resend.js` a tu Gmail y reenviar a Julio (manual, no ideal)
