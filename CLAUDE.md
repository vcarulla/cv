# CLAUDE.md — curl-cv (vcarulla.com)

CV "curl-first": la misma URL responde **texto ANSI** a `curl`/`wget`/`httpie` y
**HTML** a un navegador. Una sola fuente de datos (JSON) alimenta los dos renders.
**En producción**: https://vcarulla.com

## Stack
- **Hosting**: Cloudflare Worker (`src/index.js`) servido con Wrangler. Config en `wrangler.toml`.
- **Datos**: JSON en `content/` (es/en), expuestos vía `render/data.js`.
- **Render CLI**: `render/cli/` (cajas ANSI estilo Dracula). `render/web/`: HTML.
- **Estático**: `public/` (CSS, imágenes, PDFs).
- **Lint/format**: Biome (`biome.json`). **Tests**: `node --test` (`test/*.test.js`).

## Comandos
- `npm run dev` — Wrangler dev en `http://localhost:8787`.
- `npm run deploy` — deploy a Cloudflare.
- `npm test` — corre la suite de `test/`.
- `npm run lint` / `npm run lint:fix` — Biome (check / auto-fix).

## Reglas del proyecto
- **Probar local antes de deploy o commit.** `npm test` + lint en verde, y mirar la
  salida real: `curl localhost:8787` (CLI) **y** el navegador (web). Usá `/deploy-check`.
- **Paridad CLI ↔ Web.** Todo dato vive en `content/*.json`. Un cambio de contenido o de
  sección debe reflejarse en **ambos** renders (`render/cli/` y `render/web/html.js`).
- **Commits sin co-author ni firma** en este repo. Conventional commits.
- **`.claude/` no se commitea** (está en `.gitignore`); este `CLAUDE.md` sí.

## Arquitectura (lo que conviene saber antes de tocar)
- **`src/index.js`** — router del Worker. Decide CLI vs Web por `User-Agent`, resuelve el
  idioma (prefijo `/es`·`/en` o `Accept-Language`), aplica headers de seguridad y CSP, y
  despacha por `switch (cleanPath)`. Cada ruta nueva va acá **y** en `sitemap.xml`.
- **`render/cli/`** — el render de texto, la pieza frágil:
  - `text.js`: utilidades **ANSI-aware** (`stripAnsi`, `truncate`, `pad`, `cols`, `sideBySide`).
    El ancho se mide con `stripAnsi`, no con `.length`, porque los escapes de color y los
    caracteres zero-width (U+200E) no ocupan columnas.
  - `box.js`: dibuja las cajas; depende de que el ancho visible se calcule bien.
  - `sections.js`: arma las secciones y páginas (home, skills, experience, etc.).
  - `layout.js`/`colors.js`: constantes de ancho y paleta.
  - **Invariante**: todas las líneas de una caja deben tener el mismo ancho visible. Si
    tocás el cálculo de ancho, corré los tests de `box`/render (cubren zero-width y ANSI).
- **`render/web/html.js`** — render HTML. **Todo lo que viene de datos pasa por `esc()`**
  (anti-XSS). La CSP del Worker usa hashes `sha256` de los `<script>` inline: si cambiás
  un script inline, hay que recalcular su hash en `src/index.js`.

## Automatizaciones locales (`.claude/`, no commiteadas)
- Hooks `PostToolUse`: Biome auto-fix al editar; `node --test` al tocar `render/`, `src/`
  o `content/`; validación de que los `content/*.json` siguen siendo parseables.
- Skills: `/curl-qa` (revisa la salida CLI de cada ruta), `/screenshot-qa` (QA visual
  desktop+mobile), `/deploy-check` (checklist pre-deploy).
- Subagent: `render-reviewer` (audita el cálculo de ancho ANSI y la paridad CLI↔Web).
