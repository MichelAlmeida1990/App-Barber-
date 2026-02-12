/**
 * Workaround para erro ENOENT do Next tentando ler `.next/routes-manifest.json`.
 *
 * Em algumas combinações (Next 15 + App Router) o arquivo pode não existir,
 * mas o servidor ainda tenta ler — causando 500 em qualquer rota.
 *
 * Este script cria um `routes-manifest.json` mínimo quando estiver faltando.
 */

const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '..', '.next');
const manifestPath = path.join(nextDir, 'routes-manifest.json');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeIfMissing(filePath, contents) {
  if (fs.existsSync(filePath)) return;
  fs.writeFileSync(filePath, contents, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`[ensure-next-routes-manifest] criado: ${filePath}`);
}

ensureDir(nextDir);

// Formato mínimo (o Next só precisa conseguir abrir/parsear JSON aqui).
// Evitamos array grande; campos opcionais podem ser adicionados no futuro.
const minimal = JSON.stringify(
  {
    version: 1,
    basePath: '',
    pages404: true,
    redirects: [],
    headers: [],
    staticRoutes: [],
    dynamicRoutes: [],
    dataRoutes: [],
  },
  null,
  2
);

writeIfMissing(manifestPath, minimal);







