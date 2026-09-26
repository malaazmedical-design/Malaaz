/**
 * Extracts the booking modal CSS, HTML, and JS from index.html at runtime.
 * Returns { css, html, js } strings ready to embed in any SSR page.
 *
 * Line ranges auto-detected at runtime — no manual sync needed.
 */
const fs   = require('fs');
const path = require('path');

let _cache = null;

function getBookingPartial() {
  if (_cache) return _cache;

  const src   = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const lines = src.split('\n');

  // CSS: from .modal-overlay{position:fixed block to closing </style>
  const cssStart = lines.findIndex(l => l.trim().startsWith('.modal-overlay{position:fixed'));
  const cssEnd   = lines.findIndex((l, i) => i > cssStart && l.trim() === '</style>');
  const css      = lines.slice(cssStart, cssEnd).join('\n');

  // HTML: booking modal div (id="booking-modal") to its matching closing </div>
  const htmlStart = lines.findIndex(l => l.includes('id="booking-modal"'));
  let htmlEnd = htmlStart;
  let depth = 0;
  for (let i = htmlStart; i < lines.length; i++) {
    depth += (lines[i].match(/<div/g) || []).length - (lines[i].match(/<\/div>/g) || []).length;
    if (i > htmlStart && depth <= 0) { htmlEnd = i; break; }
  }
  const html = lines.slice(htmlStart, htmlEnd + 1).join('\n');

  // JS: from bmSelectedService declaration to closing </script>
  const jsStart = lines.findIndex(l => l.includes('let bmSelectedService'));
  const jsEnd   = lines.findIndex((l, i) => i > jsStart + 100 && l.trim() === '</script>');
  const js      = lines.slice(jsStart, jsEnd).join('\n');

  _cache = { css, html, js };
  return _cache;
}

module.exports = { getBookingPartial };
