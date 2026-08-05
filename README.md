# Just For You Drink

Web de la barra móvil de cócteles para eventos y bodas. Página construida con Astro, 100% estática y gratis de mantener.

## Uso local

```sh
npm.cmd install    # instala dependencias (solo la primera vez)
npm.cmd run dev    # abre el sitio en http://localhost:4321
npm.cmd run build  # genera el sitio estático en dist/
npm.cmd run preview  # previsualiza la compilación
```

## Cómo publicarla gratis

### Opción A: GitHub Pages (recomendada)

1. Crea una cuenta en https://github.com (gratis).
2. Crea un repositorio nuevo llamado `justforyoudrink.github.io`.
3. Sube esta carpeta al repositorio:
   ```sh
   git init
   git add .
   git commit -m "Landing page Just For You Drink"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/justforyoudrink.github.io.git
   git push -u origin main
   ```
4. En el repositorio, ve a **Settings → Pages → Build and deployment → Source → GitHub Actions** (o elige la rama `main` con la carpeta raíz).
5. En unos minutos la web estará en `https://TU_USUARIO.github.io`.

El dominio propio `justforyoudrink.com` se puede añadir después (~10 €/año), pero no es necesario para empezar.

### Opción B: Netlify Drop (sin instalar nada más)

1. Ejecuta `npm.cmd run build`.
2. Entra en https://app.netlify.com/drop.
3. Arrastra la carpeta `dist/` dentro del navegador.
4. Listo: obtienes una URL gratis tipo `tunombre.netlify.app`.

### Opción C: Vercel

1. Ejecuta `npm.cmd run build`.
2. Entra en https://vercel.com y arrastra la carpeta `dist/`, o conecta el repositorio de GitHub y Vercel hará el build automáticamente.

## Cambiar el contenido

Todo el texto (packs, precios, FAQs, WhatsApp, Instagram) está en `src/data/site.ts`.
Las fotos van en `public/images/` y los videos en `public/videos/`.

## Estructura

- `src/data/site.ts` — todos los textos del sitio
- `src/components/` — secciones de la página
- `src/styles/global.css` — estilos (tema oscuro dorado)
- `public/images/` — fotos y logo
- `public/videos/` — video del hero y video de acción
