const SUPABASE_URL = 'https://omsictbrqlsohrmxeuym.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tc2ljdGJycWxzb2hybXhldXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTc1NzcsImV4cCI6MjA5NTI5MzU3N30.tbFL_7mWZ6qVUtgFkagfSwWdgni5JKRuCR8nbwqIqho';
const BASE_URL = 'https://malaaz-plum.vercel.app';

// Profile modal JS — uses String.raw so \' is preserved as \' in client-side output
const profileModalJs = String.raw`
let currentProviderId = null;
let _provCache = {};

function renderProviderAreas(areasStr) {
  if (!areasStr) return '';
  return areasStr.split(',').slice(0,4).map(a =>
    '<span style="font-size:11px;color:rgba(255,255,255,.4);background:rgba(255,255,255,.06);padding:3px 10px;border-radius:20px">\u{1F4CD} '+esc(a.trim())+'</span>'
  ).join('');
}

async function viewProfile(id) {
  currentProviderId = id;

  const [provArr, provSvcsRaw, provReviews] = await Promise.all([
    _provCache[id]
      ? Promise.resolve([_provCache[id]])
      : sf('providers?select=*&id=eq.'+encodeURIComponent(id)),
    sf('provider_services?select=sub_service_id,custom_price,sub_services(name,service_name,duration,price_min,price_min_specialist,price_min_consultant)&provider_id=eq.'+encodeURIComponent(id)+'&is_active=eq.true'),
    sf('reviews?select=client_name,rating,text&provider_id=eq.'+encodeURIComponent(id)+'&is_approved=eq.true&limit=5'),
  ]);

  const provider = provArr?.[0];
  if (!provider) { console.warn('viewProfile: provider not found', id); return; }
  _provCache[id] = provider;

  const isConsultant = (provider.grade || '') === 'استشاري';
  const provSvcs = (provSvcsRaw || []).map(ps => {
    const sub = ps.sub_services; if (!sub) return null;
    const tierPrice = isConsultant ? sub.price_min_consultant : sub.price_min_specialist;
    return { sub_name: sub.name, service_name: sub.service_name, duration: sub.duration, price: ps.custom_price ?? tierPrice ?? sub.price_min };
  }).filter(Boolean);

  let servicesHtml = '';
  if (provSvcs.length) {
    const grouped = {};
    provSvcs.forEach(ps => { const k = ps.service_name||'خدمات'; if(!grouped[k]) grouped[k]=[]; grouped[k].push(ps); });
    Object.entries(grouped).forEach(([svcName, subs]) => {
      servicesHtml += '<div style="margin-bottom:14px">'
        +'<div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:8px">'+esc(svcName)+'</div>'
        +'<div style="display:flex;flex-direction:column;gap:8px">'
        +subs.map(ps =>
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--bg);border-radius:12px;cursor:pointer;border:1.5px solid var(--border);transition:border .2s"'
          +' onmouseover="this.style.borderColor=\'#c9a84c\'" onmouseout="this.style.borderColor=\'var(--border)\'"'
          +' onclick="doSvcBook(this)" data-id="'+esc(provider.id)+'" data-name="'+esc(provider.name)+'" data-email="'+esc(provider.email||'')+'" data-stype="'+esc(provider.service_type||'')+'" data-sub="'+esc(ps.sub_name)+'">'
          +'<div><div style="font-size:14px;font-weight:700;color:var(--text)">'+esc(ps.sub_name)+'</div>'
          +(ps.duration?'<div style="font-size:11px;color:var(--muted);margin-top:2px">⏱ '+esc(ps.duration)+'</div>':'')+'</div>'
          +'<div style="font-size:17px;font-weight:900;color:var(--dark)">'+(ps.price||'—')+'<span style="font-size:11px;font-weight:400;color:var(--muted)"> ج.م</span></div>'
          +'</div>'
        ).join('')
        +'</div></div>';
    });
  } else {
    servicesHtml = '<div style="text-align:center;padding:24px 16px;color:var(--muted);font-size:13px">لم يحدد هذا المقدم خدماته بعد</div>';
  }

  const reviewsHtml = provReviews?.length ? '<div style="padding:16px 18px;border-top:1px solid rgba(255,255,255,.08)">'
    +'<div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:10px">⭐ آراء العملاء ('+provReviews.length+')</div>'
    +provReviews.map(r =>
      '<div style="background:var(--bg);border-radius:10px;padding:10px 12px;margin-bottom:8px">'
      +'<div style="display:flex;justify-content:space-between;margin-bottom:4px">'
      +'<span style="font-size:12px;font-weight:700">'+esc(r.client_name||'عميل')+'</span>'
      +'<span style="color:var(--accent);font-size:11px">'+'★'.repeat(r.rating||5)+'</span></div>'
      +(r.text?'<div style="font-size:12px;color:var(--muted);line-height:1.6">'+esc(r.text)+'</div>':'')
      +'</div>'
    ).join('')+'</div>' : '';

  const stars = provider.reviewCount > 0
    ? '★'.repeat(Math.round(provider.realRating||0))+'☆'.repeat(5-Math.round(provider.realRating||0))
      +' <span style="font-size:12px;color:var(--muted)">'+(provider.realRating||0).toFixed(1)+' ('+provider.reviewCount+' تقييم)</span>'
    : '<span style="color:var(--muted);font-size:13px">⭐ مقدم جديد</span>';
  const gradeLabel = provider.grade
    ? '<span style="background:rgba(201,168,76,.2);color:var(--accent);padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;margin-left:6px">'+esc(provider.grade)+'</span>' : '';
  const specText = esc(provider.specialty||provider.service_type||'');

  let modal = document.getElementById('provider-profile-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'provider-profile-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = '<div class="modal-panel" style="max-height:88vh;overflow-y:auto;border-radius:20px 20px 0 0"><div id="provider-profile-content"></div></div>';
    modal.addEventListener('click', e => { if (e.target === modal) closeProfile(); });
    document.body.appendChild(modal);
  }

  document.getElementById('provider-profile-content').innerHTML =
    '<div style="background:#243235;padding:20px;border-radius:20px 20px 0 0">'
    +'<div style="display:flex;justify-content:space-between;align-items:flex-start">'
    +'<div style="display:flex;gap:14px;align-items:center">'
    +(provider.photo_url?'<img src="'+esc(provider.photo_url)+'" style="width:64px;height:64px;border-radius:16px;object-fit:cover;border:2px solid rgba(255,255,255,.15);flex-shrink:0">':'')
    +'<div style="min-width:0;flex:1">'
    +'<div style="font-size:18px;font-weight:900;color:#fff;font-family:Tajawal,sans-serif;overflow-wrap:break-word">'+esc(provider.name)+'</div>'
    +'<div style="margin-top:5px">'+gradeLabel+'<span style="font-size:12px;color:rgba(255,255,255,.5)">'+specText+'</span></div>'
    +'<div style="color:var(--accent);font-size:14px;margin-top:6px">'+stars+'</div>'
    +'</div></div>'
    +'<button onclick="closeProfile()" style="background:rgba(255,255,255,.1);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;flex-shrink:0">\xD7</button>'
    +'</div>'
    +'<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">'+renderProviderAreas(provider.areas||provider.area)
    +(provider.experience?'<span style="font-size:11px;color:rgba(255,255,255,.4);background:rgba(255,255,255,.06);padding:3px 10px;border-radius:20px">'+esc(String(provider.experience))+' سنة خبرة</span>':'')
    +'</div>'
    +(provider.bio?'<div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:10px;line-height:1.7">'+esc(provider.bio)+'</div>':'')
    +'<div style="display:flex;gap:8px;margin-top:14px">'
    +'<a href="https://wa.me/201039091989" target="_blank" rel="noopener" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:#25D366;color:#fff;border-radius:12px;padding:10px;font-size:13px;font-weight:700;text-decoration:none;font-family:Cairo,sans-serif"><i class="fab fa-whatsapp" style="font-size:16px"></i> واتساب</a>'
    +'<a href="tel:01039091989" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:rgba(255,255,255,.1);color:#fff;border-radius:12px;padding:10px;font-size:13px;font-weight:700;text-decoration:none;font-family:Cairo,sans-serif"><i class="fas fa-phone" style="font-size:14px"></i> اتصال</a>'
    +'</div></div>'
    +'<div style="padding:14px 18px 18px">'
    +'<div style="font-size:13px;font-weight:700;color:var(--muted);margin-bottom:12px">⚙️ الخدمات والأسعار</div>'
    +servicesHtml
    +(provider.is_available
      ?'<button onclick="doMainBook(this)" data-id="'+esc(provider.id)+'" data-name="'+esc(provider.name)+'" data-email="'+esc(provider.email||'')+'" data-stype="'+esc(provider.service_type||'')+'" style="width:100%;background:var(--dark);color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:Cairo,sans-serif;margin-top:8px"><i class="fas fa-calendar-check" style="margin-left:8px"></i> احجز مع '+esc(provider.name)+'</button>'
      :'<button disabled style="width:100%;background:#e5e5e5;color:#999;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:700;cursor:not-allowed;font-family:Cairo,sans-serif;margin-top:8px">غير متاح حالياً</button>')
    +'</div>'
    +reviewsHtml;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function doSvcBook(el) {
  closeProfile();
  openProviderBooking({ id: el.dataset.id, name: el.dataset.name, email: el.dataset.email, service_type: el.dataset.stype, sub: el.dataset.sub });
}
function doMainBook(el) {
  closeProfile();
  openProviderBooking({ id: el.dataset.id, name: el.dataset.name, email: el.dataset.email, service_type: el.dataset.stype });
}

function closeProfile() {
  const modal = document.getElementById('provider-profile-modal') || document.getElementById('profileModal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}
`;
const { getBookingPartial } = require('./booking-partial');

const H = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

async function supaFetch(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: H });
  return r.ok ? r.json() : [];
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildCard(p) {
  const icons = { 'كشف منزلي':'fa-stethoscope','تمريض منزلي':'fa-user-nurse','أشعة منزلية':'fa-x-ray' };
  const icon = icons[p.service_type] || 'fa-user-md';

  let specText = p.grade
    ? `${esc(p.grade)} ${esc(p.specialty || (p.service_type==='تمريض منزلي'?'تمريض':p.service_type==='أشعة منزلية'?'أشعة':''))}`
    : esc(p.specialty || (p.service_type==='تمريض منزلي'?'أخصائي تمريض':p.service_type==='أشعة منزلية'?'مركز أشعة':'—'));

  let starsHtml;
  if (p.reviewCount > 0) {
    const r = p.realRating;
    const full = Math.floor(r);
    const half = (r - full) >= 0.5;
    const stars = '★'.repeat(full) + (half?'⯨':'') + '☆'.repeat(5-full-(half?1:0));
    starsHtml = `${stars} <span style="color:#999;font-size:12px">${r.toFixed(1)} (${p.reviewCount} تقييم)</span>`;
  } else {
    starsHtml = '<span style="color:#999;font-size:13px">⭐ مقدم جديد</span>';
  }

  const areas = (p.areas || p.area || '').split(',').map(a=>a.trim()).filter(Boolean);
  const areaChips = areas.slice(0,3).map(a=>`<span class="prov-area">${esc(a)}</span>`).join('');
  const moreAreas = areas.length > 3 ? `<span class="prov-area prov-area-more">+${areas.length-3}</span>` : '';

  const photoHtml = p.photo_url
    ? `<img src="${esc(p.photo_url)}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:20px">`
    : `<i class="fas ${icon}" style="font-size:36px;color:rgba(255,255,255,.7)"></i>`;

  const bookBtn = p.is_available
    ? `<button class="prov-book-btn" onclick="openProviderPage('${esc(p.id)}','${esc(p.name).replace(/'/g,"\\'")}')">احجز الآن <i class="fas fa-arrow-left"></i></button>`
    : `<button class="prov-book-btn" disabled style="opacity:.5;cursor:not-allowed">غير متاح</button>`;

  return `<div class="prov-card">
  <div class="prov-card-head">
    <div class="prov-ava">${photoHtml}</div>
    <div>
      <div class="prov-name">${esc(p.name)}</div>
      <div class="prov-spec">${specText}</div>
    </div>
  </div>
  <div class="prov-stars">${starsHtml}</div>
  <div class="prov-avail ${p.is_available?'avail-yes':'avail-no'}">${p.is_available?'● متاح الآن':'○ غير متاح حالياً'}</div>
  <div class="prov-areas-row">${areaChips}${moreAreas}</div>
  ${p.price ? `<div class="prov-price">ابتداء من <strong>${esc(String(p.price))}</strong> ج.م</div>` : ''}
  <div class="prov-actions">
    ${bookBtn}
    <button class="prov-profile-btn" onclick="viewProfile('${esc(p.id)}')">خدماته وأسعاره</button>
  </div>
</div>`;
}

module.exports = async function handler(req, res) {
  const areaParam = decodeURIComponent(req.query.area || '').trim();
  const today = new Date().toISOString().split('T')[0];

  // Parallel fetches
  let [providers, reviews, areas, xraySubs] = await Promise.all([
    areaParam
      ? supaFetch(`providers?select=*&status=eq.active&areas=ilike.*${encodeURIComponent(areaParam)}*&order=is_available.desc,name.asc`)
      : supaFetch(`providers?select=*&status=eq.active&order=is_available.desc,name.asc`),
    supaFetch(`reviews?select=provider_id,rating&is_approved=eq.true`),
    supaFetch(`coverage_areas?select=name,city&is_active=eq.true&order=name`),
    supaFetch(`sub_services?select=name&service_name=eq.أشعة منزلية&is_active=eq.true&order=name`),
  ]);

  // Attach ratings
  const ratingMap = {};
  (reviews || []).forEach(r => {
    if (!r.provider_id) return;
    if (!ratingMap[r.provider_id]) ratingMap[r.provider_id] = { sum: 0, count: 0 };
    ratingMap[r.provider_id].sum += r.rating;
    ratingMap[r.provider_id].count++;
  });
  (providers || []).forEach(p => {
    const m = ratingMap[p.id];
    p.realRating = m ? m.sum / m.count : null;
    p.reviewCount = m ? m.count : 0;
  });
  providers.sort((a,b) => (b.realRating||0)-(a.realRating||0) || (b.reviewCount||0)-(a.reviewCount||0));

  // Group providers by service type
  const byType = {};
  (providers || []).forEach(p => {
    const t = p.service_type || 'أخرى';
    if (!byType[t]) byType[t] = [];
    byType[t].push(p);
  });

  // Build sections — only show types that have providers
  const typeOrder = ['كشف منزلي','تمريض منزلي','أشعة منزلية'];
  let sectionsHtml = '';
  for (const t of typeOrder) {
    const list = byType[t];
    if (!list || !list.length) continue;
    const icons = { 'كشف منزلي':'fa-stethoscope','تمريض منزلي':'fa-user-nurse','أشعة منزلية':'fa-x-ray' };
    sectionsHtml += `
<div class="prov-section">
  <h2 class="prov-section-title"><i class="fas ${icons[t]||'fa-user-md'}"></i> ${esc(t)}</h2>
  <div class="prov-grid" data-type="${esc(t)}">
    ${list.map(p => buildCard(p)).join('\n')}
  </div>
</div>`;
  }

  if (!sectionsHtml) {
    sectionsHtml = `<div class="prov-empty">لا يوجد مقدمو خدمة في هذه المنطقة حالياً</div>`;
  }

  // Build area options grouped by city
  const cairo = (areas||[]).filter(a=>a.city==='القاهرة');
  const giza  = (areas||[]).filter(a=>a.city==='الجيزة');
  const areaOptions = `<option value="">كل المناطق</option>
    <optgroup label="القاهرة">${cairo.map(a=>`<option value="${esc(a.name)}"${areaParam===a.name?' selected':''}>${esc(a.name)}</option>`).join('')}</optgroup>
    <optgroup label="الجيزة">${giza.map(a=>`<option value="${esc(a.name)}"${areaParam===a.name?' selected':''}>${esc(a.name)}</option>`).join('')}</optgroup>`;

  // xray options
  const xrayOptions = (xraySubs||[]).map(s=>`<option value="${esc(s.name)}">${esc(s.name)}</option>`).join('');

  const pageTitle = areaParam
    ? `مقدمو الخدمة في ${areaParam} — ملاذ`
    : 'مقدمو الخدمة — ملاذ';
  const pageDesc = areaParam
    ? `أطباء وممرضون وأجهزة أشعة متاحون في ${areaParam} — احجز بدون رسوم والدفع بعد الخدمة`
    : 'قارن بين الأطباء والممرضين المتاحين في القاهرة والجيزة واحجز مع اللي يناسبك';
  const canonicalUrl = areaParam
    ? `${BASE_URL}/مقدمو-الخدمة/${encodeURIComponent(areaParam)}`
    : `${BASE_URL}/مقدمو-الخدمة`;

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "ملاذ للرعاية الطبية المنزلية",
    "description": pageDesc,
    "url": canonicalUrl,
    "areaServed": areaParam || "القاهرة والجيزة",
    "medicalSpecialty": "GeneralPractice"
  });

  const booking = getBookingPartial();

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(pageDesc)}">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(pageDesc)}">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:type" content="website">
<meta name="robots" content="index,follow">
<script type="application/ld+json">${schema}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js" defer></script>
<script>window.addEventListener('load',()=>{if(typeof emailjs!=='undefined')emailjs.init('P2Xy0_OBIWdVXk1gE');});</script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --dark:#1e2c2f;
  --accent:#c9a84c;
  --bg:#f5f2ec;
  --white:#fff;
  --text:#1e2c2f;
  --muted:#7a8c90;
  --border:#e0dcd4;
}
html{scroll-behavior:smooth}
body{font-family:'Cairo',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}

/* NAVBAR */
nav{position:sticky;top:0;z-index:100;background:var(--dark);display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:64px;gap:20px}
.nav-logo{display:flex;flex-direction:column;line-height:1;text-decoration:none;cursor:pointer}
.nav-logo-ar{font-size:20px;font-weight:800;color:var(--accent);letter-spacing:.02em}
.nav-logo-en{font-size:9px;font-weight:600;color:rgba(255,255,255,.35);letter-spacing:.15em}
.nav-links{display:flex;gap:4px}
.nav-links a{color:rgba(255,255,255,.65);font-size:14px;font-weight:600;padding:8px 14px;border-radius:8px;cursor:pointer;text-decoration:none;transition:color .2s,background .2s}
.nav-links a:hover,.nav-links a.active{color:#fff;background:rgba(255,255,255,.08)}
.nav-right{display:flex;align-items:center;gap:10px}
.nav-provider-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.7);font-size:13px;font-weight:600;padding:7px 14px;border-radius:8px;cursor:pointer;font-family:'Cairo',sans-serif;white-space:nowrap}
.nav-cta{background:var(--accent);color:var(--dark);font-size:14px;font-weight:700;padding:9px 20px;border-radius:10px;border:none;cursor:pointer;font-family:'Cairo',sans-serif;white-space:nowrap}

/* PAGE HERO */
.page-hero{background:var(--dark);padding:56px 32px 48px;text-align:center;position:relative;overflow:hidden}
.page-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 80% at 50% 50%,rgba(201,168,76,.06) 0%,transparent 70%)}
.breadcrumb{display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;color:rgba(255,255,255,.4);margin-bottom:16px;position:relative}
.breadcrumb a{color:rgba(255,255,255,.4);text-decoration:none}
.breadcrumb a:hover{color:rgba(255,255,255,.7)}
.breadcrumb .sep{opacity:.4}
.page-tag{display:inline-block;background:rgba(201,168,76,.15);color:var(--accent);font-size:12px;font-weight:700;letter-spacing:.1em;padding:5px 14px;border-radius:100px;border:1px solid rgba(201,168,76,.25);margin-bottom:16px;position:relative}
.page-title{font-size:clamp(26px,4vw,40px);font-weight:800;color:#fff;line-height:1.25;margin-bottom:12px;position:relative}
.page-sub{font-size:16px;color:rgba(255,255,255,.55);max-width:560px;margin:0 auto;line-height:1.7;position:relative}

/* SEARCH BAR */
.search-bar{background:var(--white);border-radius:16px;box-shadow:0 4px 32px rgba(0,0,0,.1);padding:20px 24px;max-width:1060px;margin:-28px auto 0;position:relative;z-index:10}
.search-row{display:flex;gap:10px;align-items:flex-end;flex-wrap:nowrap}
.search-field{display:flex;flex-direction:column;gap:5px;flex:1;min-width:0}
.search-field label{font-size:11px;font-weight:700;color:var(--muted);letter-spacing:.05em;white-space:nowrap}
.search-field select,.search-field input{padding:9px 12px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-family:'Cairo',sans-serif;color:var(--text);background:var(--bg);outline:none;width:100%;transition:border-color .2s}
.search-field select:focus,.search-field input:focus{border-color:var(--accent)}
.search-btn{background:var(--dark);color:var(--accent);font-size:14px;font-weight:700;padding:9px 22px;border-radius:10px;border:none;cursor:pointer;font-family:'Cairo',sans-serif;white-space:nowrap;align-self:flex-end;margin-top:16px;transition:background .2s;flex-shrink:0}
.search-btn:hover{background:#253438}
#s-dynamic{display:contents}

/* CONTENT */
.prov-content{max-width:1100px;margin:48px auto;padding:0 20px}
.prov-section{margin-bottom:56px}
.prov-section-title{font-size:20px;font-weight:800;color:var(--dark);margin-bottom:20px;display:flex;align-items:center;gap:10px}
.prov-section-title i{color:var(--accent)}

/* GRID */
.prov-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}

/* CARD */
.prov-card{background:var(--dark);border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:12px;transition:transform .2s,box-shadow .2s}
.prov-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.25)}
.prov-card-head{display:flex;align-items:center;gap:14px}
.prov-ava{width:56px;height:56px;border-radius:20px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
.prov-name{font-size:16px;font-weight:700;color:#fff}
.prov-spec{font-size:13px;color:rgba(255,255,255,.5);margin-top:2px}
.prov-stars{font-size:13px;color:var(--accent)}
.avail-yes{color:#22c55e;font-size:13px}
.avail-no{color:#888;font-size:13px}
.prov-areas-row{display:flex;flex-wrap:wrap;gap:5px}
.prov-area{font-size:11px;color:rgba(255,255,255,.55);background:rgba(255,255,255,.07);padding:3px 10px;border-radius:100px}
.prov-area-more{color:rgba(201,168,76,.8);background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.2)}
.prov-price{font-size:13px;color:rgba(255,255,255,.6)}
.prov-price strong{color:var(--accent);font-size:16px}
.prov-actions{display:flex;gap:8px;margin-top:4px}
.prov-book-btn{flex:1;background:var(--accent);color:var(--dark);border:none;border-radius:10px;padding:10px 16px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Cairo',sans-serif;display:flex;align-items:center;justify-content:center;gap:6px;transition:opacity .2s}
.prov-book-btn:hover{opacity:.88}
.prov-profile-btn{background:rgba(255,255,255,.07);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Cairo',sans-serif;white-space:nowrap;transition:background .2s}
.prov-profile-btn:hover{background:rgba(255,255,255,.12)}
.prov-empty{text-align:center;padding:80px 20px;color:var(--muted);font-size:16px}

/* profile modal uses booking .modal-overlay + .modal-panel — no extra CSS needed */

/* FOOTER */
footer{background:#141e20;color:rgba(255,255,255,.5);text-align:center;padding:32px 20px;font-size:13px}
footer a{color:rgba(255,255,255,.4);text-decoration:none}
footer a:hover{color:rgba(255,255,255,.7)}

/* RESPONSIVE */
@media(max-width:720px){
  nav{padding:0 16px}
  .nav-links{display:none}
  .nav-provider-btn{display:none}
  .page-hero{padding:40px 16px 36px}
  .search-bar{margin:0 12px;border-radius:12px}
  .search-row{flex-direction:column}
  .dynamic-fields{flex-direction:column;width:100%}
  .search-btn{width:100%;margin-top:0}
  .prov-content{margin:28px auto}
}
/* ── Booking modal styles injected at runtime ── */
__BOOKING_CSS__
</style>
</head>
<body>

<!-- NAVBAR -->
<nav>
  <a class="nav-logo" href="/">
    <span class="nav-logo-ar">ملاذ</span>
    <span class="nav-logo-en">MALAAZ</span>
  </a>
  <div class="nav-links">
    <a href="/">الرئيسية</a>
    <a href="/#services">الخدمات</a>
    <a href="/مقدمو-الخدمة" class="active">مقدمو الخدمة</a>
    <a href="/#pricing">الأسعار</a>
    <a href="/#about">من نحن</a>
  </div>
  <div class="nav-right">
    <button class="nav-provider-btn" onclick="window.open('/provider.html','_blank')">مقدم خدمة؟ سجّل هنا</button>
    <button class="nav-cta" onclick="openBookingModal()">احجز الآن <i class="fas fa-arrow-left" style="margin-right:5px;font-size:12px"></i></button>
  </div>
</nav>

<!-- PAGE HERO -->
<div class="page-hero">
  <div class="breadcrumb">
    <a href="/">الرئيسية</a>
    <span class="sep">/</span>
    <span>${areaParam ? `<a href="/مقدمو-الخدمة">مقدمو الخدمة</a>` : 'مقدمو الخدمة'}</span>
    ${areaParam ? `<span class="sep">/</span><span>${esc(areaParam)}</span>` : ''}
  </div>
  <div class="page-tag">فريقنا الطبي</div>
  <h1 class="page-title">${areaParam ? `مقدمو الخدمة في ${esc(areaParam)}` : 'أطباء وممرضون معتمدون'}</h1>
  <p class="page-sub">قارن بين الأطباء والممرضين المتاحين واحجز مع اللي يناسبك</p>
</div>

<!-- SEARCH BAR -->
<div class="search-bar">
  <form class="search-row" onsubmit="doSearch(event)">
    <div class="search-field" style="min-width:160px">
      <label>الخدمة</label>
      <select id="s-service" onchange="onServiceChange()">
        <option value="كشف منزلي">كشف منزلي</option>
        <option value="تمريض منزلي">تمريض منزلي</option>
        <option value="أشعة منزلية">أشعة منزلية</option>
      </select>
    </div>
    <div class="dynamic-fields" id="s-dynamic">
      <!-- يتملأ بـ JS حسب الخدمة -->
    </div>
    <div class="search-field" style="min-width:150px">
      <label>المنطقة</label>
      <select id="s-area">${areaOptions}</select>
    </div>
    <div class="search-field" style="min-width:140px">
      <label>اسم مقدم الخدمة</label>
      <input type="text" id="s-name" placeholder="ابحث بالاسم...">
    </div>
    <button type="submit" class="search-btn"><i class="fas fa-search" style="margin-left:6px"></i> بحث</button>
  </form>
</div>

<!-- PROVIDERS -->
<div class="prov-content" id="prov-content">
  ${sectionsHtml}
</div>

<!-- provider-profile-modal injected dynamically by viewProfile() -->

<!-- BOOKING MODAL injected at runtime -->
__BOOKING_HTML__

<!-- TOAST -->
<div id="toast" style="position:fixed;top:90px;left:50%;transform:translateX(-50%) translateY(-20px);opacity:0;background:var(--dark);color:#fff;padding:14px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;transition:all .3s;pointer-events:none;white-space:nowrap;border:1px solid rgba(201,168,76,.2);"></div>

<!-- FOOTER -->
<footer>
  <div style="margin-bottom:12px">
    <span style="font-size:18px;font-weight:800;color:var(--accent)">ملاذ</span>
  </div>
  <div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin-bottom:12px">
    <a href="/">الرئيسية</a>
    <a href="/مقدمو-الخدمة">مقدمو الخدمة</a>
    <a href="/blog.html">المقالات</a>
    <a href="/faq.html">الأسئلة الشائعة</a>
    <a href="/privacy.html">سياسة الخصوصية</a>
  </div>
  <div>© ${new Date().getFullYear()} ملاذ للرعاية الطبية المنزلية — جميع الحقوق محفوظة</div>
</footer>

<script>
const SUPA_URL = '${SUPABASE_URL}';
const SUPA_KEY = '${SUPABASE_KEY}';

async function sf(path) {
  const r = await fetch(SUPA_URL + '/rest/v1/' + path, { headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY } });
  return r.ok ? r.json() : [];
}

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Dynamic search fields
const nursingOptions = ['خدمات سريعة','إقامة 12 ساعة','إقامة 24 ساعة'];
let specialties = [];
let xrayTypes = [];

async function loadSpecialties() {
  if (specialties.length) return;
  const data = await sf("providers?select=specialty,grade&status=eq.active&service_type=eq.كشف منزلي&specialty=not.is.null");
  const specs = [...new Set((data||[]).map(p=>p.specialty).filter(Boolean))].sort();
  specialties = specs;
}

async function loadXray() {
  if (xrayTypes.length) return;
  const data = await sf("sub_services?select=name&service_name=eq.أشعة منزلية&is_active=eq.true&order=name");
  xrayTypes = (data||[]).map(s=>s.name);
}

async function onServiceChange() {
  const svc = document.getElementById('s-service').value;
  const dyn = document.getElementById('s-dynamic');
  if (svc === 'كشف منزلي') {
    await loadSpecialties();
    const specOpts = specialties.map(s=>'<option value="'+esc(s)+'">'+esc(s)+'</option>').join('');
    dyn.innerHTML =
      '<div class="search-field"><label>التخصص</label><select id="s-spec"><option value="">كل التخصصات</option>'+specOpts+'</select></div>' +
      '<div class="search-field"><label>الدرجة العلمية</label><select id="s-grade"><option value="">الكل</option><option>أخصائي</option><option>استشاري</option></select></div>';
  } else if (svc === 'تمريض منزلي') {
    const opts = nursingOptions.map(o=>'<option>'+esc(o)+'</option>').join('');
    dyn.innerHTML = '<div class="search-field" style="flex:2"><label>نوع الخدمة</label><select id="s-nursing-type"><option value="">كل الأنواع</option>'+opts+'</select></div>';
  } else {
    await loadXray();
    const opts = xrayTypes.map(x=>'<option>'+esc(x)+'</option>').join('');
    dyn.innerHTML = '<div class="search-field" style="flex:2"><label>نوع الأشعة</label><select id="s-xray-type"><option value="">كل الأنواع</option>'+opts+'</select></div>';
  }
}

function doSearch(e) {
  e.preventDefault();
  const area = document.getElementById('s-area').value;
  const base = '/مقدمو-الخدمة';
  const params = new URLSearchParams();
  const svc = document.getElementById('s-service').value;
  const name = document.getElementById('s-name').value.trim();
  if (svc && svc !== 'كشف منزلي') params.set('service', svc);
  if (name) params.set('q', name);
  const spec = document.getElementById('s-spec')?.value;
  if (spec) params.set('spec', spec);
  const grade = document.getElementById('s-grade')?.value;
  if (grade) params.set('grade', grade);
  const qs = params.toString();
  const url = area ? base + '/' + encodeURIComponent(area) + (qs?'?'+qs:'') : base + (qs?'?'+qs:'');
  location.href = url;
}

// Client-side filter (name/spec/grade) applied after page load
function clientFilter() {
  const params = new URLSearchParams(location.search);
  const q = (params.get('q')||'').toLowerCase();
  const spec = (params.get('spec')||'').toLowerCase();
  const grade = (params.get('grade')||'').toLowerCase();
  const svc = params.get('service') || '';
  if (!q && !spec && !grade && !svc) return;
  document.querySelectorAll('.prov-section').forEach(sec => {
    const type = sec.querySelector('.prov-grid')?.dataset.type || '';
    if (svc && type !== svc) { sec.style.display = 'none'; return; }
    const cards = sec.querySelectorAll('.prov-card');
    let visible = 0;
    cards.forEach(card => {
      const name = card.querySelector('.prov-name')?.textContent.toLowerCase() || '';
      const specEl = card.querySelector('.prov-spec')?.textContent.toLowerCase() || '';
      const show = (!q || name.includes(q) || specEl.includes(q))
        && (!spec || specEl.includes(spec))
        && (!grade || specEl.includes(grade));
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    sec.style.display = visible ? '' : 'none';
  });
}

__PROFILE_MODAL_JS__

// ── Supabase client (required by booking JS) ──────────────
const SUPABASE_URL = '${SUPABASE_URL}';
const SUPABASE_KEY = '${SUPABASE_KEY}';
let sb;
try { sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch(e) { sb = null; }

// Shims referenced by booking JS
let allDocs = [];
function sanitize(s) { return String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function sanitizeNum(v) { const n = parseFloat(v); return isNaN(n) ? null : n; }
async function loadSiteContentForIndex() {} // no-op (index-only)
function updateSEO() {}                    // no-op (index-only)
function updateSchemaRating() {}           // no-op (index-only)
function setMeta() {}                      // no-op (index-only)

// Load coverage areas into #bm-area select (used by openBookingModal)
async function loadAreas() {
  if (!sb) return;
  try {
    const { data } = await sb.from('coverage_areas').select('name,city').eq('is_active', true).order('name');
    if (!data) return;
    const areaSelect = document.getElementById('bm-area');
    if (!areaSelect) return;
    areaSelect.innerHTML = '<option value="">اختر المنطقة *</option>';
    const cairo = data.filter(a => a.city === 'القاهرة');
    const giza  = data.filter(a => a.city === 'الجيزة');
    const addGroup = (label, list) => {
      if (!list.length) return;
      const grp = document.createElement('optgroup');
      grp.label = label;
      list.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.name;
        opt.textContent = a.name;
        grp.appendChild(opt);
      });
      areaSelect.appendChild(grp);
    };
    addGroup('القاهرة', cairo);
    addGroup('الجيزة', giza);
  } catch(e) {}
}

// ── Booking modal JS injected at runtime ──────────
__BOOKING_JS__

// Open booking for a specific provider from this page
function openProviderPage(id, name) {
  closeProfile();
  openProviderBooking({ id, name });
}

// Init
onServiceChange();
clientFilter();
</script>
</body>
</html>`;

  // Inject booking partial via replace (not template literal) to avoid
  // Node.js interpolating backticks and ${...} inside the booking JS/CSS.
  const finalHtml = html
    .replace('__BOOKING_CSS__', booking.css)
    .replace('__BOOKING_HTML__', booking.html)
    .replace('__BOOKING_JS__', booking.js)
    .replace('__PROFILE_MODAL_JS__', profileModalJs);

  const buf = Buffer.from(finalHtml, 'utf8');
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=180, s-maxage=900',
    'Content-Length': buf.length
  });
  res.end(buf);
};
