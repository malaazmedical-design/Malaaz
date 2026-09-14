const SUPABASE_URL = 'https://omsictbrqlsohrmxeuym.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tc2ljdGJycWxzb2hybXhldXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTc1NzcsImV4cCI6MjA5NTI5MzU3N30.tbFL_7mWZ6qVUtgFkagfSwWdgni5JKRuCR8nbwqIqho';

module.exports = async function handler(req, res) {
  const id = req.query.id;
  const host = req.headers.host;
  const templateUrl = `https://${host}/blog-post-template.html`;

  let html;
  try {
    const templateRes = await fetch(templateUrl);
    html = await templateRes.text();
  } catch (e) {
    res.status(500).send('Template load error');
    return;
  }

  if (id) {
    try {
      const supaRes = await fetch(
        `${SUPABASE_URL}/rest/v1/blog_posts?select=id,title,summary,created_at,updated_at&id=eq.${id}&status=eq.published`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await supaRes.json();
      const post = Array.isArray(data) ? data[0] : null;

      if (post) {
        const title = `${post.title} — ملاذ`;
        const description = (post.summary || '').replace(/"/g, '&quot;');
        const pageUrl = `https://malaaz-plum.vercel.app/blog-post.html?id=${post.id}`;

        html = html
          .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
          .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${pageUrl}$2`)
          .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
          .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${pageUrl}$2`)
          .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`);

        const schema = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.summary,
          "author": { "@type": "Organization", "name": "ملاذ للرعاية الطبية المنزلية" },
          "publisher": { "@type": "Organization", "name": "ملاذ", "logo": { "@type": "ImageObject", "url": "https://malaaz-plum.vercel.app/og-image.jpg" } },
          "datePublished": post.created_at,
          "dateModified": post.updated_at || post.created_at,
          "mainEntityOfPage": pageUrl,
          "image": "https://malaaz-plum.vercel.app/og-image.jpg"
        });
        html = html.replace(
          /<script type="application\/ld\+json" id="article-schema">.*?<\/script>/s,
          `<script type="application/ld+json" id="article-schema">${schema}</script>`
        );
      }
    } catch (e) {
      // serve template as-is on error
    }
  }

  const buf = Buffer.from(html, 'utf8');
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=300, s-maxage=3600',
    'Content-Length': buf.length
  });
  res.end(buf);
};
