# Just For You Drink

Sitio web de la barra móvil de cócteles para eventos y bodas.

## Comandos

En esta máquina (Windows PowerShell) usa `npm.cmd` en lugar de `npm`:

```
npm.cmd run dev      # servidor de desarrollo
npm.cmd run build    # genera el sitio estático en dist/
npm.cmd run preview  # sirve la compilación localmente
```

Para el servidor de desarrollo en segundo plano usa:

```
astro dev --background
```

Gestiona el servidor con `astro dev stop`, `astro dev status` y `astro dev logs`.

## Estructura

- `src/data/site.ts` — textos, packs, FAQs y datos de contacto. Edita aquí todo el contenido.
- `src/components/` — componentes de la página (Header, Hero, Packs, Galería, FAQ, Contacto...).
- `src/styles/global.css` — estilos de todo el sitio (tema oscuro dorado).
- `src/pages/index.astro` — página principal.
- `public/images/` — fotos y logo. `foto_1.jpg`, `foto_2.jpg`, `foto_3.jpg` son los huecos de la galería.
- `public/videos/` — videos (video_1.mp4 en el hero, video_2.mp4 en la sección de acción).

## Convenciones

- Contenido en español (catalán/inglés solo si se pide expresamente).
- Colores de marca: fondo `#0a0a0a`, dorado `#e6c068`. Tipografías: Crimson Text (títulos) e Inter (texto).
- Las fotos nuevas deben ir en `public/images/` y citarse con ruta absoluta `/images/...`.
- No añadir comentarios al código salvo que se pida.
- Los cambios de contenido se hacen en `src/data/site.ts`, no en los componentes.

## Despliegue gratis

1. Sube el repositorio a GitHub (`justforyoudrink.github.io` si quieres ese dominio).
2. Activa GitHub Pages en Settings → Pages → Build & deployment → GitHub Actions (o rama `main`).
3. El build genera el sitio en `dist/` con `npm.cmd run build`.

Alternativas sin GitHub: Netlify Drop o Vercel (arrastra la carpeta `dist/`).

## Documentación

- https://docs.astro.build
- Guías: routing, componentes, estilos, i18n.
