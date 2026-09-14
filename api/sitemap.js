const SUPABASE_URL = 'https://omsictbrqlsohrmxeuym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tc2ljdGJycWxzb2hybXhldXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTc1NzcsImV4cCI6MjA5NTI5MzU3N30.tbFL_7mWZ6qVUtgFkagfSwWdgni5JKRuCR8nbwqIqho';
const BASE_URL = 'https://malaaz-plum.vercel.app';

module.exports = async function handler(req, res) {
  let posts = [];
  try {
    const supaRes = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=id,updated_at,created_at&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
    const text = await supaRes.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = null; }
    if (Array.isArray(data) && data.length > 0) {
      posts = data;
    } else {
      posts = [{ id: `DBG:ok=${supaRes.ok}:status=${supaRes.status}:body=${text.slice(0,80)}`, updated_at: '2026-01-01', created_at: '2026-01-01' }];
    }
  } catch (e) {
    posts = [{ id: `DBG:catch:${e.message.slice(0,80)}`, updated_at: '2026-01-01', created_at: '2026-01-01' }];
  }

  const staticPages = [
    { loc: `${BASE_URL}/`,                    lastmod: '2026-08-17', changefreq: 'weekly',  priority: '1.0' },
    { loc: `${BASE_URL}/faq.html`,             lastmod: '2026-08-17', changefreq: 'monthly', priority: '0.9' },
    { loc: `${BASE_URL}/blog.html`,            lastmod: '2026-08-17', changefreq: 'weekly',  priority: '0.8' },
    { loc: `${BASE_URL}/privacy.html`,         lastmod: '2026-08-17', changefreq: 'yearly',  priority: '0.4' },
    { loc: `${BASE_URL}/delete-account.html`,  lastmod: '2026-08-17', changefreq: 'yearly',  priority: '0.3' },
  ];

  const staticEntries = staticPages.map(p =>
    `  <url>\n    <loc>${p.loc}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
  ).join('\n');

  const postEntries = posts.map(p => {
    const lastmod = (p.updated_at || p.created_at || '').split('T')[0];
    return `  <url>\n    <loc>${BASE_URL}/blog-post.html?id=${p.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticEntries}\n${postEntries}\n</urlset>`;

  const buf = Buffer.from(xml, 'utf8');
  res.writeHead(200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
    'Content-Length': buf.length
  });
  res.end(buf);
};
