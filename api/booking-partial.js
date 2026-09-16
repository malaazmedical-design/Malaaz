/**
 * Extracts the booking modal CSS, HTML, and JS from index.html at runtime.
 * Returns { css, html, js } strings ready to embed in any SSR page.
 *
 * Line ranges must stay in sync with index.html:
 *   CSS  : 659–732
 *   HTML : 1366–1662
 *   JS   : 2381–3674
 */
const fs   = require('fs');
const path = require('path');

let _cache = null;

function getBookingPartial() {
  if (_cache) return _cache;

  const src   = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const lines = src.split('\n');

  // Slice is 0-indexed, line numbers in comments are 1-indexed
  const css  = lines.slice(658, 732).join('\n');
  const html = lines.slice(1365, 1662).join('\n');
  const js   = lines.slice(2380, 3675).join('\n');

  _cache = { css, html, js };
  return _cache;
}

module.exports = { getBookingPartial };
