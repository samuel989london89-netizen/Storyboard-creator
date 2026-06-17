# Opción B — Dominio GRATIS con eu.org (paso a paso)

Vas a conseguir un dominio gratis como:

**`2894signals.eu.org`**

Sirve para que Resend envíe a **Julio**, **tu Outlook** y cualquier correo.

**Tiempo:** puede tardar desde unos días hasta **varias semanas** (lo revisan a mano).  
**Mientras esperas:** sigue usando el reenvío Gmail (Opción A).

---

## Antes de empezar — ten a mano

- Tu email: **samuel989london89@gmail.com**
- Nombre del proyecto: **2894_signals**
- Dominio que pediremos: **`2894signals.eu.org`** (puedes cambiar el nombre si está ocupado)

---

# PARTE 1 — Crear cuenta en EU.org (5 min)

## Paso 1
Abre: **https://nic.eu.org/login.html**

## Paso 2
Pulsa **Sign-up** (registrarse)

## Paso 3
Rellena el formulario con datos **reales** (si no, rechazan):
- **Name:** tu nombre
- **Email:** samuel989london89@gmail.com
- **Address:** tu dirección real (calle, ciudad, país)
- **Phone:** tu teléfono

## Paso 4
Te llegará un email titulado algo como **"new EU.org contact"**.  
**Abre el enlace** para activar la cuenta.

---

# PARTE 2 — Crear DNS gratis (10 min)

EU.org no da DNS. Usamos **Hurricane Electric** (gratis).

## Paso 5
Abre: **https://dns.he.net/**

## Paso 6
Arriba a la derecha: **Register** → crea cuenta con tu Gmail

## Paso 7
Cuando entres, arriba: **Add a new domain**

## Paso 8
Escribe exactamente:
```
2894signals.eu.org
```
Pulsa **Add Domain**

## Paso 9
Anota estos dos servidores (aparecen en la página del dominio):
```
ns1.he.net
ns2.he.net
```
(Guarda esta pantalla abierta — la necesitarás en la Parte 3)

---

# PARTE 3 — Pedir el dominio gratis (10 min)

## Paso 10
Vuelve a: **https://nic.eu.org/login.html** → entra con tu cuenta

## Paso 11
Busca algo como **"New Domain"** o **"Register domain"**

## Paso 12
Dominio a pedir:
```
2894signals.eu.org
```
(Si dice que no está disponible, prueba: `2894signals-news.eu.org` o `signals2894.eu.org`)

## Paso 13
**Contact / Registrant:** elige tu contacto (el que creaste en Paso 3)

## Paso 14
**Name Servers** — elige **"server names"** y pon:
```
ns1.he.net
ns2.he.net
```

## Paso 15
Envía la solicitud (**Submit**)

Debería salir **"Done"** o similar. Entras en **cola de revisión manual**.

## Paso 16
Espera el email de aprobación

Puede tardar **3 días a 2 meses**. Cuando aprueben, llegará un email tipo:
**"request ... domain 2894signals.eu.org accepted"**

---

# PARTE 4 — Conectar Resend (cuando aprueben el dominio)

## Paso 17
Entra en: **https://resend.com/domains**  
Pulsa **Add Domain**

## Paso 18
Escribe:
```
2894signals.eu.org
```
(o el subdominio que recomienda Resend, ej. `send.2894signals.eu.org`)

## Paso 19
Resend te muestra **3–5 registros DNS** (TXT, MX, etc.)  
**Cópialos todos.**

## Paso 20
Ve a **https://dns.he.net/** → tu dominio `2894signals.eu.org`  
Añade **cada registro** que te dio Resend (tipo TXT, MX, CNAME…)

## Paso 21
En Resend, pulsa **Verify**  
Espera 5–30 minutos hasta ver **✓ verificado**

---

# PARTE 5 — Activar envío real a Julio y a ti (5 min)

Cuando Resend muestre el dominio en verde:

## Paso 22 — GitHub secretos
https://github.com/samuel989london89-netizen/Storyboard-creator/settings/secrets/actions

Edita **`FROM_EMAIL`** y pon:
```
newsletter@2894signals.eu.org
```
(usa el dominio exacto que verificaste)

## Paso 23 — Desactivar modo prueba

Abre en el proyecto el archivo `config/resend-test.json` y cambia:
```json
"test_mode": false
```

Haz commit/push a `main` (o dime **"aplica paso 23"** y lo hago yo).

## Paso 24 — Probar envío

En Cursor escribe:
```
Aprobado — envia 2894_signals sin generar informe nuevo
```

Debería llegar a:
- Slondon99@outlook.es
- juliosatorre@gmail.com
- samuel989london89@gmail.com

---

# Si algo falla

| Problema | Solución |
|----------|----------|
| EU.org rechaza el dominio | Revisa que ns1/ns2.he.net estén bien en dns.he.net antes de pedir |
| Tarda mucho | Normal. Sigue con reenvío Gmail |
| Resend no verifica DNS | Espera 30 min; revisa que copiaste los TXT sin espacios de más |
| No sabes editar GitHub | Dime "haz el paso 23" |

---

# Resumen en 4 líneas

1. Cuenta en **nic.eu.org** + activar email  
2. Dominio en **dns.he.net** → anotar ns1/ns2  
3. Pedir **2894signals.eu.org** en EU.org → esperar aprobación  
4. Dominio en **Resend** → DNS → `test_mode: false` → **Aprobado**

---

Cuando termines el **Paso 16** (te aprueben), escribe aquí: **"dominio aprobado"** y te guío solo la Parte 4 y 5.
