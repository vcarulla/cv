# curl-cv

Curl-first CV.

## Usage

```
curl -L vcarulla.com
```

| Endpoint      | Description              |
|---------------|--------------------------|
| `/`           | Home                     |
| `/skills`     | Full tech stack          |
| `/experience` | Work history             |
| `/contact`    | Contact info             |
| `/json`       | JSON-LD output           |
| `/help`       | List of endpoints        |
| `/es`         | Force Spanish            |
| `/en`         | Force English            |

Defaults to English. In the browser, language is detected via `Accept-Language`.

Automatically detects terminal (curl/wget/httpie) or browser and responds with ANSI or HTML.

## Development

```
npm install
npm run dev       # http://localhost:8787
npm run deploy
npm run lint
```

## Structure

```
src/           → Entry point (Cloudflare Worker)
render/cli/    → ANSI output for terminal
render/web/    → HTML output for browser
content/       → CV data (cv.json, cv-es.json)
public/        → Static assets
```

## Inspiration

Inspired by [ysap.sh](https://ysap.sh) by Dave Eddy.
