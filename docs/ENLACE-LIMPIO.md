# Enlace limpio (sin tu correo en la URL)

El enlace actual de GitHub lleva tu usuario:

`samuel989london89-netizen.github.io/...`

Eso **no es tu correo**, pero se parece. Para quitarlo del enlace público:

---

## Solución: dominio propio en GitHub Pages (gratis con eu.org)

Cuando tengas **`2894signals.eu.org`** (Opción B):

### Paso 1 — Archivo de config
En `config/site.json` pon:
```json
"custom_domain": "2894signals.eu.org"
```

### Paso 2 — GitHub Pages
1. https://github.com/samuel989london89-netizen/Storyboard-creator/settings/pages
2. **Custom domain** → `2894signals.eu.org`
3. Guardar

### Paso 3 — DNS (en dns.he.net)
Añade registro:
```
CNAME  @  o  www  →  samuel989london89-netizen.github.io
```
(Resend y GitHub te dirán el valor exacto al configurar)

### Paso 4 — Republicar
```bash
node scripts/publish-online.js
```
(y push a gh-pages, o espera al workflow)

### Enlace final (limpio)
**https://2894signals.eu.org/news/**

Sin `samuel989` ni nada personal en la URL.

---

## Mientras tanto — acortar un poco el enlace

En GitHub → repo **Settings** → **General** → **Repository name**

Cambia `Storyboard-creator` → `2894-signals`

Nuevo enlace:
`https://samuel989london89-netizen.github.io/2894-signals/news/`

(Más corto, pero el usuario de GitHub sigue ahí hasta que tengas dominio.)

---

## Ver tu enlace actual

```bash
node scripts/get-public-url.js
```
