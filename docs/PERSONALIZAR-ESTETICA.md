# Personalizar la estetica de 2894_signals

La plantilla se diseña **una vez**. Cada semana solo cambia el contenido.

## Ver cambios antes de enviar

```bash
node scripts/preview-email.js
```

Abre `reports/preview-2894_signals.html` en el navegador.

Luego reenvia prueba:

```bash
RESEND_API_KEY=re_TU_CLAVE FROM_EMAIL=onboarding@resend.dev TO_EMAIL=samuel989london89@gmail.com node scripts/test-resend.js
```

## Cambiar colores (facil)

Edita las primeras lineas de `scripts/parse-report.js`:

```js
const THEME = {
  text: "#ebe6dc",      // texto principal
  muted: "#9c968a",     // texto secundario
  accent: "#e8b86d",    // dorado / marca
  accentSoft: "#c9a227",
  link: "#9ed4f0",      // enlaces
  cardBg: "#111010",    // fondo tarjetas
  cardBorder: "#2c2926",
  pillBg: "#1a1816",
};
```

La estructura del email esta en `templates/2894_signals.html`.

## Estilos disponibles (dime cual prefieres)

| Estilo | Descripcion |
|--------|-------------|
| **Actual** | Oscuro editorial, dorado, tipo revista creativa |
| **Claro** | Fondo crema, texto oscuro, mas minimal |
| **Neon** | Oscuro con acentos cyan/magenta, mas tech |
| **Minimal** | Blanco y negro, sin decoracion |

Dime: "quiero estilo claro" (o neon/minimal) y lo aplico.
