// Polyfill for import.meta.url in CJS bundles
var __importMetaUrl = typeof __filename !== 'undefined'
  ? require('url').pathToFileURL(__filename).href
  : 'file://unknown';
var __importMetaDir = typeof __dirname !== 'undefined' ? __dirname : '/';
