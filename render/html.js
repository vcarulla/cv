export function htmlHome(host) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${host}</title>
</head>
<body>
  <pre>Try: curl ${host}</pre>
</body>
</html>`;
}