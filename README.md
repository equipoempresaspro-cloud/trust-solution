# Trust Solution Consultores SAC — sitio web

Implementación de **`Trust Solution Web.dc.html`**, importado del proyecto de
Claude Design *"Crear página web adjunta"*
(`7efa6feb-6c0a-4161-8bf2-9f1b72d75c8d`).

Sitio estático, sin build ni dependencias: se publica copiando la carpeta a
cualquier hosting (Netlify, Vercel, S3, Hostinger, cPanel…).

## Estructura

```
index.html                  Inicio
nosotros.html               Nosotros
outsourcing-integral.html   Servicio core · plan mensual
servicios-a-demanda.html    Proyectos puntuales + Gerencia Externa
soluciones-premium.html     Psicosociales, capacitaciones, ISO
contacto.html               Formulario + datos de contacto

assets/css/tokens.css       Tokens del design system (colores, tipografía,
                            espaciado, efectos) copiados literalmente
assets/css/styles.css       Componentes + layout + responsive
assets/js/site.js           Menú móvil y formulario
assets/imagery/             Fotografías
assets/logo/                Logotipo y marca

_src/Trust Solution Web.dc.html   Fuente original del diseño (referencia)
```

## Cómo se tradujo el diseño

| Diseño (`.dc.html`)                        | Implementación                                  |
| ------------------------------------------ | ----------------------------------------------- |
| `<sc-if>` por página + estado `page`        | Seis archivos HTML con URLs reales               |
| `<x-import …Button/Card/Badge/…>`           | Clases CSS (`.btn`, `.card`, `.badge`, …)        |
| Estilos inline camelCase                    | Clases en `styles.css`                           |
| `style-hover="…"`                           | Reglas `:hover`                                  |
| `hint-size`                                 | Descartado (era ayuda del lienzo)                |
| `@import` de fuentes en `typography.css`    | `<link rel="preconnect">` + `<link>` por página  |

Los componentes replican exactamente los estilos de
`_ds_bundle.js` (namespace `TrustSolutionDesignSystem_75bad7`): variantes y
tamaños de `Button`, tonos de `Badge`, los tres tamaños de `IconCircle`
(48/74/96 px), `Card`, `ChecklistItem`, `SectionHeading`, `Quote`, `Input` y
`Select`.

## Añadido sobre el diseño original

El lienzo era solo de escritorio. Se agregó lo que un sitio real necesita:

- **Responsive** en 1080 / 960 / 720 px, con menú hamburguesa accesible.
- **Accesibilidad**: `lang="es"`, enlace de salto, landmarks, `aria-current`
  en la navegación, foco visible, `prefers-reduced-motion`.
- **SEO**: `<title>` y `description` por página, Open Graph y JSON-LD
  (`ProfessionalService`, `Service`, `ContactPage`).
- **Botón flotante de WhatsApp** en todas las páginas.

## Formulario de contacto

El prototipo solo cambiaba una bandera local `enviado`; no hay backend. Hoy el
formulario **valida en el navegador y abre WhatsApp con la consulta redactada**
hacia +51 992 823 613.

Para enviarlo a un endpoint real, edita `assets/js/site.js`:

```js
var FORM_ENDPOINT = 'https://…';   // vacío = handoff a WhatsApp
```

Con un valor, hace `POST` de JSON con los campos `nombre`, `empresa`,
`trabajadores`, `telefono`, `email` y `mensaje`.

## Pendientes

1. **Fotografías.** Las tres imágenes de `assets/imagery/` son marcadores de
   posición con el degradado de marca: el lector de archivos del MCP corta a
   256 KiB y los PNG originales llegaron incompletos (18–42 %). Exporta estos
   archivos desde el proyecto de Claude Design y sobrescríbelos con el mismo
   nombre — no hay que tocar el código:

   | Archivo                                     | Tamaño   |
   | ------------------------------------------- | -------- |
   | `assets/imagery/stock-colleagues-tablet.jpg` | 950×1080 |
   | `assets/imagery/stock-colleagues-review.jpg` | 850×850  |
   | `assets/imagery/stock-executive-desk.jpg`    | 560×1080 |
   | `assets/logo/trust-solution-mark.png`        | 260×230  |

   (`assets/logo/trust-solution-logo-full.png` sí es el original.)

   Los tres archivos de `imagery/` son PNG aunque tengan extensión `.jpg`, tal
   como venían en el diseño.

2. **Dominio.** Falta `<link rel="canonical">`, `og:url` y `og:image` en cada
   página: requieren la URL definitiva y no se inventaron.

3. **Contraste (WCAG AA).** Dos tokens heredados del diseño no alcanzan 4.5:1
   sobre blanco:

   | Token                    | Contraste | Dónde se usa                        |
   | ------------------------ | --------- | ----------------------------------- |
   | `--text-muted` `#8fa6a4` | 2.57:1    | subtítulos de tarjetas, credencial  |
   | `--ts-mint-600` `#34ad82`| 2.82:1    | eyebrows, etiquetas "Nivel 1/2/3"   |

   Es una decisión de marca, así que no se modificó la paleta. Para cumplir AA,
   `--ts-teal-600` (`#2b7a78`, 5.05:1) funciona en ambos casos; `--ts-mint-700`
   (`#278a68`, 4.27:1) solo sirve para texto grande o en negrita ≥18.66 px.

## Desarrollo local

```bash
python -m http.server 4173
```
