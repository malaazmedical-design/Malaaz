const SUPABASE_URL = 'https://omsictbrqlsohrmxeuym.supabase.co';
const BASE_URL = 'https://malaaz-plum.vercel.app';

module.exports = async function handler(req, res) {
  try {
    const key = process.env.SUPABASE_KEY;
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=id,updated_at,created_at&order=created_at.desc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);
    const posts = await response.json();

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

    const postEntries = (Array.isArray(posts) ? posts : []).map(p => {
      const lastmod = (p.updated_at || p.created_at || '').split('T')[0];
      return `  <url>\n    <loc>${BASE_URL}/blog-post.html?id=${p.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticEntries}\n${postEntries}\n</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).end(Buffer.from(xml, 'utf8'));
  } catch (e) {
    res.status(500).send(`Error generating sitemap: ${e.message}`);
  }
}
