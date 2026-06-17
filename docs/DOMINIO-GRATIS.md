# Cómo hacer que Julio reciba el newsletter

Resend en modo prueba **solo envía a samuel989london89@gmail.com**.  
Para enviar a **juliosatorre@gmail.com** y **Slondon99@outlook.es** hace falta un dominio verificado.

---

## OPCIÓN A — Gratis HOY (reenvío desde tu Gmail)

Mientras no tengas dominio, Julio puede recibir el email **reenviado desde tu Gmail** (2 minutos).

### Paso 1 — Crear filtro en Gmail

1. Abre **samuel989london89@gmail.com**
2. Busca el email de **2894_signals**
3. Abre el email → tres puntos **⋮** → **Filtrar mensajes como este**
4. En "De" o "Asunto" pon: `2894_signals`
5. **Crear filtro**
6. Marca: **Reenviar a** → escribe `juliosatorre@gmail.com`
7. (Si Gmail pide verificar el reenvío, confirma el enlace que llega a Julio)
8. **Crear filtro**

### Resultado

Cada lunes, cuando apruebes y se envíe el newsletter:
- Tú lo recibes en tu Gmail
- Gmail lo reenvía **automáticamente** a Julio

**Coste: 0 €.** No necesitas dominio.

---

## OPCIÓN B — Dominio 100% gratis (eu.org)

**Guía completa paso a paso:** `docs/EU-ORG-PASO-A-PASO.md`

Puedes pedir un dominio gratis tipo **`2894signals.eu.org`**.

| Ventaja | Inconveniente |
|---------|----------------|
| Gratis para siempre | Tarda **días o semanas** (revisión manual) |
| Sirve para Resend | Pasos técnicos (DNS) |

### Resumen rápido

1. Regístrate en https://nic.eu.org
2. Crea DNS gratis en https://dns.he.net o https://desec.io
3. Pide el dominio `2894signals.eu.org` (o el nombre que quieras)
4. Cuando aprueben → añade el dominio en https://resend.com/domains
5. Copia los registros DNS que te da Resend
6. Cambia en GitHub el secreto `FROM_EMAIL` a `newsletter@2894signals.eu.org`
7. En `config/resend-test.json` pon `"test_mode": false`

Guía detallada eu.org (cuando quieras): https://www.techxiaofei.com/post/common/freedomain/

---

## OPCIÓN C — Dominio barato (~3–10 €/año) — la más fiable

No es gratis, pero es la opción **más rápida y profesional** (mismo día).

| Proveedor | Precio orientativo |
|-----------|-------------------|
| [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) | ~8–10 €/año (.com) sin sobreprecio |
| [Porkbun](https://porkbun.com) | ~2–4 €/año (.xyz, .site) |
| [Namecheap](https://www.namecheap.com) | promos primer año baratas |

Dominios baratos que valen: `.xyz`, `.site`, `.online`, `.io` (más caro)

Ejemplo: compras `2894signals.xyz` → Resend → `newsletter@2894signals.xyz`

---

## Qué te recomiendo

| Urgencia | Qué hacer |
|----------|-----------|
| **Julio necesita recibirlo ya** | Opción A (reenvío Gmail) |
| **Solución seria sin gastar** | Opción B (eu.org) + mientras tanto Opción A |
| **Solución seria y rápida** | Opción C (~3 €) |

---

## Cuando tengas dominio verificado

1. Resend → dominio en verde ✓
2. GitHub secretos → `FROM_EMAIL` = `newsletter@tudominio.com`
3. `config/resend-test.json` → `"test_mode": false`
4. En Cursor: **Aprobado**

Llegará a los tres sin reenvío manual.

---

## ¿Necesitas ayuda?

Dime cuál opción eliges:
- **"A"** → te guío el filtro de Gmail paso a paso
- **"B"** → te guío eu.org desde cero
- **"C"** → te digo qué dominio comprar y qué DNS pegar en Resend
