# Ver 2894_signals online (sin correo)

Si prefieres leer el newsletter en el navegador, sin depender del email.

## URL publica

Cuando GitHub Pages este activo, tu enlace es:

```bash
node scripts/get-public-url.js
```

**Sin dominio propio**, GitHub incluye tu usuario en la URL.  
Para un enlace limpio (sin eso): `docs/ENLACE-LIMPIO.md`

---

## Activar GitHub Pages (una sola vez, 2 minutos)

1. Abre: https://github.com/samuel989london89-netizen/Storyboard-creator/settings/pages
2. En **Source** / **Build and deployment**:
   - Source: **GitHub Actions**
3. Guarda

La primera vez puede tardar 2-5 minutos en publicarse.

---

## Cuando se actualiza la web

Cada vez que hay un informe nuevo en `reports/` y se sube a `main`, la web se actualiza sola.

Tambien puedes publicar manualmente en tu ordenador:

```bash
node scripts/publish-online.js
```

---

## Solo web, sin email

En Cursor escribe:

```
Aprobado — genera el informe y publícalo online, pero NO envíes email
```

(o despues de generar, no marques approval / no actives envio)

---

## Compartir con Julio

Mientras no tengas dominio en Resend, puedes enviarle el **enlace web** por WhatsApp:

```
https://TU-ENLACE/news/
```
(Obtén el enlace exacto con `node scripts/get-public-url.js`)

Gratis y sin configurar correo.
