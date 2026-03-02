# curl-cv

![tag](https://img.shields.io/github/v/tag/vcarulla/cv)
![status](https://img.shields.io/website?url=https://vcarulla.com/healthz&cacheSeconds=300)

CV curl-first.

## Uso

```
curl -L vcarulla.com
```

| Endpoint      | Descripción              |
|---------------|--------------------------|
| `/`           | Home                     |
| `/skills`     | Stack técnico completo   |
| `/experience` | Historial laboral        |
| `/contact`    | Información de contacto  |
| `/json`       | Output JSON-LD           |
| `/help`       | Lista de endpoints       |
| `/es`         | Forzar español           |
| `/en`         | Forzar inglés            |

Por defecto responde en español. En el navegador el idioma se detecta según `Accept-Language`.
Detecta automáticamente si es terminal _(curl/wget/httpie)_ o navegador y responde en ANSI o HTML.

## Desarrollo

```
npm install
npm run dev       # http://localhost:8787
npm run deploy
npm run lint
```

## Estructura

```
src/           → Entry point (Cloudflare Worker)
render/cli/    → ANSI output para terminal
render/web/    → HTML output para navegador
content/       → Datos del CV (cv.json, cv-es.json)
public/        → Assets estáticos
```

## Inspiración

Inspirado en [ysap.sh](https://ysap.sh) de Dave Eddy.
