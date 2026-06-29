/* ============================================================
   MIZO CHATBOT WIDGET — ملاذ v3
   ضيف في آخر index.html قبل </body>:
   <script src="mizo-widget.js"></script>
   ============================================================ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     بيانات الخدمات والأسعار
  ══════════════════════════════════════════════ */
  const DATA = {
    services: {
      'كشف منزلي': {
        icon: '🩺',
        desc: 'طبيب متخصص يجي عندك في البيت',
        subs: [
          { name: 'أخصائي',    min: 1000, max: 1400 },
          { name: 'استشاري',   min: 1300, max: 1700 },
        ],
        bookFn: "كشف منزلي",
      },
      'تمريض منزلي': {
        icon: '👩‍⚕️',
        desc: 'ممرض/ة معتمد/ة لجميع الاحتياجات التمريضية',
        subs: [
          { name: 'خدمات سريعة', min: 400,  max: null },
          { name: 'إقامة ١٢ ساعة', min: 600,  max: null },
          { name: 'إقامة ٢٤ ساعة', min: 1200, max: null },
        ],
        bookFn: "تمريض منزلي",
      },
      'أشعة منزلية': {
        icon: '🔬',
        desc: 'أجهزة أشعة متنقلة في بيتك',
        subs: [
          { name: 'سونار',       min: 1000, max: null },
          { name: 'دوبلر',       min: 1100, max: null },
          { name: 'أشعة سينية', min: 500,  max: null },
          { name: 'إيكو قلب',   min: 1000, max: null },
        ],
        bookFn: "أشعة منزلية",
      },
    },
    contact: {
      phone:    '01039091989',
      whatsapp: '01039091989',
      email:    'malaaz.medical@gmail.com',
    },
    areas: {
      cairo: ['مدينة نصر','النزهة','هليوبوليس','المعادي','المقطم','الزيتون','شبرا','عين شمس','عباسية','مصر الجديدة','التجمع'],
      giza:  ['الدقي','المهندسين','الهرم','فيصل','بولاق الدكرور','الشيخ زايد','أكتوبر','إمبابة'],
    },
  };

  /* ── جلب الأسعار الحقيقية من قاعدة البيانات (sub_services) ──
     عشان ميزو يقرا نفس الأسعار اللي على صفحة الحجز على طول،
     من غير ما نحتاج نحدّث الأرقام يدوياً في الملف ده. */
  function loadLivePrices() {
    try {
      if (typeof sb === 'undefined' || !sb || !sb.from) return;
      sb.from('sub_services').select('*').eq('is_active', true).then(({ data, error }) => {
        if (error || !data || !data.length) return;

        const byService = {};
        data.forEach(r => { (byService[r.service_name] = byService[r.service_name] || []).push(r); });

        // كشف منزلي: أخصائي / استشاري — مجمّعين من كل التخصصات
        const kashfRows = byService['كشف منزلي'] || [];
        if (kashfRows.length) {
          const specMin = kashfRows.map(r => Number(r.price_min_specialist)).filter(n => !isNaN(n));
          const specMax = kashfRows.map(r => Number(r.price_max_specialist)).filter(n => !isNaN(n));
          const consMin = kashfRows.map(r => Number(r.price_min_consultant)).filter(n => !isNaN(n));
          const consMax = kashfRows.map(r => Number(r.price_max_consultant)).filter(n => !isNaN(n));
          if (specMin.length && specMax.length) {
            DATA.services['كشف منزلي'].subs[0] = { name: 'أخصائي', min: Math.min(...specMin), max: Math.max(...specMax) };
          }
          if (consMin.length && consMax.length) {
            DATA.services['كشف منزلي'].subs[1] = { name: 'استشاري', min: Math.min(...consMin), max: Math.max(...consMax) };
          }
        }

        // تمريض منزلي / أشعة منزلية: كل خدمة بسعرها كما هي في الداتابيز
        ['تمريض منزلي', 'أشعة منزلية'].forEach(svcName => {
          const rows = byService[svcName];
          if (!rows || !rows.length) return;
          DATA.services[svcName].subs = rows.map(r => ({
            name: r.name,
            min: Number(r.price_min) || 0,
            max: Number(r.price_max) || null,
          }));
        });
      }).catch(() => {});
    } catch (e) {}
  }
  loadLivePrices();
  // إعادة التحميل لو الإدمن غيّر الأسعار وميزو لسه مفتوح من زمان
  setInterval(loadLivePrices, 5 * 60 * 1000);

  /* ── مساعد: رسم السعر ── */
  function priceText(sub) {
    if (sub.max) return `من ${sub.min} لـ ${sub.max} ج.م`;
    return `يبدأ من ${sub.min} ج.م`;
  }

  /* ── زر الحجز المباشر ── */
  function bookBtn(serviceName, label) {
    // نرجع placeholder خاص بدل HTML عشان ميتأثرش بـ replace
    return `[[BTN:${serviceName}:${label}]]`;
  }
  
  function renderBubble(el, html) {
    // نقسم على البلاسهولدر ونبني كل جزء
    const parts = html.split(/(\[\[BTN:[^\]]+\]\])/);
    parts.forEach(part => {
      const btnMatch = part.match(/\[\[BTN:([^:]+):([^\]]+)\]\]/);
      if (btnMatch) {
        const [, svcName, lbl] = btnMatch;
        const btn = document.createElement('button');
        btn.textContent = '🏥 احجز ' + lbl + ' الآن';
        btn.style.cssText = 'display:block;margin-top:10px;padding:9px 20px;border:none;border-radius:20px;cursor:pointer;background:linear-gradient(135deg,#c9a84c,#e8c56a);color:#1e3a2f;font-family:Cairo,sans-serif;font-weight:700;font-size:13px;width:100%;';
        btn.onclick = function() {
          document.getElementById('mz-box').style.display = 'none';
          document.getElementById('mz-btn').style.display = 'flex';
          if (typeof openBookingModal === 'function') openBookingModal(svcName);
        };
        el.appendChild(btn);
      } else if (part) {
        const span = document.createElement('span');
        span.innerHTML = part.replace(/\n/g, '<br>');
        el.appendChild(span);
      }
    });
  }

  /* ══════════════════════════════════════════════
     بناء الردود
  ══════════════════════════════════════════════ */
  function buildResponses() {
    const s = DATA.services;
    const c = DATA.contact;
    const a = DATA.areas;

    return {
      greeting: {
        text: 'أهلاً وسهلاً! 😊\nأنا <b>ميزو</b>، سفير ملاذ للرعاية الطبية المنزلية.\n\nإيه اللي تحتاجه؟',
        chips: ['📋 خدماتنا','💰 الأسعار','🏥 احجز الآن'],
      },
      thanks: {
        text: 'العفو! 😄 يشرفنا خدمتك.\nلو محتاج أي حاجة تانية أنا هنا! 🤝',
        chips: ['🏥 احجز الآن','📞 تواصل معنا'],
      },

      /* ── كل الخدمات ── */
      services: {
        text: `إحنا بنقدم ٣ خدمات طبية في بيتك:\n\n` +
          Object.entries(s).map(([n,v]) =>
            `${v.icon} <b>${n}</b>\n${v.desc}`
          ).join('\n\n') +
          `\n\nعايز تعرف أكتر عن خدمة؟`,
        chips: ['🩺 كشف منزلي','👩‍⚕️ تمريض منزلي','🔬 أشعة منزلية'],
      },

      /* ── كشف منزلي ── */
      kashf: {
        text: `🩺 <b>الكشف المنزلي</b>\n\n${s['كشف منزلي'].desc}\n\n` +
          `👨‍⚕️ <b>أنواع الكشف:</b>\n• كشف عام\n• كشف متخصص (باطنة، أطفال، قلب، جلدية، عظام، نساء وتوليد، مخ وأعصاب)\n\n` +
          `💰 <b>الأسعار:</b>\n` +
          s['كشف منزلي'].subs.map(sub => `• ${sub.name}: ${priceText(sub)}`).join('\n') +
          `\n\n✅ الدفع بعد الخدمة` +
          bookBtn('كشف منزلي','كشف'),
        chips: ['💰 سعر الأخصائي','💰 سعر الاستشاري','📍 مناطق التغطية'],
      },

      /* ── تمريض منزلي ── */
      nursing: {
        text: `👩‍⚕️ <b>التمريض المنزلي</b>\n\n${s['تمريض منزلي'].desc}\n\n` +
          `🏥 <b>الخدمات:</b>\n• حقن وأدوية وريدية\n• تغيير ضمادات وجروح\n• قياس ضغط وسكر\n• تركيب كانيولا وسيروم\n• رعاية مرضى الفراش\n• تمريض ما بعد العمليات\n\n` +
          `💰 <b>الأسعار:</b>\n` +
          s['تمريض منزلي'].subs.map(sub => `• ${sub.name}: ${priceText(sub)}`).join('\n') +
          `\n\n⏰ متاحين ٢٤ ساعة / ٧ أيام` +
          bookBtn('تمريض منزلي','تمريض'),
        chips: ['💰 الأسعار','📍 مناطق التغطية'],
      },

      /* ── أشعة منزلية ── */
      xray: {
        text: `🔬 <b>الأشعة المنزلية</b>\n\n${s['أشعة منزلية'].desc}\n\n` +
          `📸 <b>الأسعار:</b>\n` +
          s['أشعة منزلية'].subs.map(sub => `• ${sub.name}: ${priceText(sub)}`).join('\n') +
          `\n\n📋 التقرير بيوصلك بعد الانتهاء مباشرة` +
          bookBtn('أشعة منزلية','أشعة'),
        chips: ['💰 الأسعار','📍 مناطق التغطية'],
      },

      /* ── الأسعار الكاملة ── */
      pricing: {
        text: `💰 <b>الأسعار الكاملة:</b>\n\n` +
          Object.entries(s).map(([n,v]) =>
            `${v.icon} <b>${n}:</b>\n` +
            v.subs.map(sub => `   • ${sub.name}: ${priceText(sub)}`).join('\n')
          ).join('\n\n') +
          `\n\n✅ الحجز مجاني — الدفع بعد الخدمة`,
        chips: ['🩺 كشف منزلي','👩‍⚕️ تمريض منزلي','🔬 أشعة منزلية','🏥 احجز الآن'],
      },

      /* ── سعر الأخصائي ── */
      price_specialist: {
        text: `🩺 <b>سعر الأخصائي:</b>\n\nيبدأ من ${s['كشف منزلي'].subs[0].min} لـ ${s['كشف منزلي'].subs[0].max} ج.م\n\n💡 السعر بيتحدد حسب التخصص والمنطقة` +
          bookBtn('كشف منزلي','كشف'),
        chips: ['💰 سعر الاستشاري','📍 مناطق التغطية'],
      },

      /* ── سعر الاستشاري ── */
      price_consultant: {
        text: `🩺 <b>سعر الاستشاري:</b>\n\nيبدأ من ${s['كشف منزلي'].subs[1].min} لـ ${s['كشف منزلي'].subs[1].max} ج.م\n\n💡 السعر بيتحدد حسب التخصص والمنطقة` +
          bookBtn('كشف منزلي','كشف'),
        chips: ['💰 سعر الأخصائي','📍 مناطق التغطية'],
      },

      /* ── مناطق التغطية ── */
      areas: {
        text: `📍 <b>مناطق التغطية:</b>\n\n🏙️ <b>القاهرة:</b>\n${a.cairo.join(' · ')}\n\n🌆 <b>الجيزة:</b>\n${a.giza.join(' · ')}\n\nتقدر تتأكد من منطقتك وقت الحجز 😊`,
        chips: ['🏥 احجز الآن','⏱️ وقت الوصول'],
      },

      /* ── وقت الوصول ── */
      time: {
        text: `⚡ بنسعى للتأكيد خلال <b>١٥ دقيقة</b>!\n\n🏃 المقدم بيوصلك خلال <b>ساعة تقريباً</b> حسب المتاحية ومنطقتك\n\n🌙 متاحين <b>٢٤ ساعة / ٧ أيام</b>`,
        chips: ['🏥 احجز الآن','📍 مناطق التغطية'],
      },

      /* ── الدفع ── */
      payment: {
        text: `💳 <b>طرق الدفع:</b>\n\n💵 <b>كاش</b> — بعد الخدمة مباشرة\n📱 <b>انستا باي</b> — تحويل فوري\n👛 <b>محفظة ملاذ</b> — رصيدك محفوظ\n\n🎉 الحجز مجاني — مفيش رسوم مقدمة!`,
        chips: ['🏥 احجز الآن','💰 الأسعار'],
      },

      /* ── الأطباء ── */
      doctors: {
        text: `👨‍⚕️ كل مقدمي الخدمة عندنا:\n\n✅ مرخصين من النقابة المختصة\n✅ بنتحقق من بياناتهم قبل القبول\n✅ عندهم خبرة موثّقة\n✅ نظام تقييم من العملاء\n\nملاذ بتضمن الجودة والأمان! 🛡️`,
        chips: ['🏥 احجز الآن','📋 خدماتنا'],
      },

      /* ── التواصل ── */
      contact: {
        text: `📞 <b>تواصل معانا في أي وقت:</b>\n\n📱 <b>موبايل/واتساب:</b> ${c.phone}\n📧 <b>إيميل:</b> ${c.email}\n\n⏰ متاحين <b>٢٤/٧</b> لخدمتك! 🤝`,
        chips: ['🏥 احجز الآن','📋 خدماتنا'],
      },

      /* ── الحجز ── */
      book: {
        text: `🎉 اختار الخدمة اللي عايزها وهنفتحلك الحجز فوراً:`,
        chips: ['🩺 احجز كشف','👩‍⚕️ احجز تمريض','🔬 احجز أشعة'],
      },

      /* ── حجز مباشر ── */
      book_kashf: {
        text: `🩺 <b>حجز كشف منزلي</b>\n\n${bookBtn('كشف منزلي','كشف')}`,
        chips: ['💰 الأسعار','📍 مناطق التغطية'],
      },
      book_nursing: {
        text: `👩‍⚕️ <b>حجز تمريض منزلي</b>\n\n${bookBtn('تمريض منزلي','تمريض')}`,
        chips: ['💰 الأسعار','📍 مناطق التغطية'],
      },
      book_xray: {
        text: `🔬 <b>حجز أشعة منزلية</b>\n\n${bookBtn('أشعة منزلية','أشعة')}`,
        chips: ['💰 الأسعار','📍 مناطق التغطية'],
      },

      fallback: {
        text: 'مش فاهم سؤالك كويس 😅\nبس مش هسيبك! اختار من دول أو تواصل معانا:',
        chips: ['📋 خدماتنا','💰 الأسعار','📞 تواصل معنا','🏥 احجز الآن'],
      },
    };
  }

  /* ══════════════════════════════════════════════
     كشف النية
  ══════════════════════════════════════════════ */
  const CHIP_MAP = {
    '📋 خدماتنا'           : 'services',
    '💰 الأسعار'           : 'pricing',
    '🩺 كشف منزلي'        : 'kashf',
    '👩‍⚕️ تمريض منزلي'   : 'nursing',
    '🔬 أشعة منزلية'      : 'xray',
    '💰 سعر الأخصائي'     : 'price_specialist',
    '💰 سعر الاستشاري'    : 'price_consultant',
    '💰 سعر تخصص معين'    : 'price_specialist',
    '📍 مناطق التغطية'    : 'areas',
    '⏱️ وقت الوصول'       : 'time',
    '💳 طرق الدفع'        : 'payment',
    '📞 تواصل معنا'       : 'contact',
    '🏥 احجز الآن'        : 'book',
    '🩺 احجز كشف'         : 'book_kashf',
    '👩‍⚕️ احجز تمريض'    : 'book_nursing',
    '🔬 احجز أشعة'        : 'book_xray',
  };

  function detectIntent(msg) {
    if (CHIP_MAP[msg]) return CHIP_MAP[msg];
    const m = msg.toLowerCase();

    const greet = ['أهل','مرحب','هاي','hi ','hello','السلام','صباح','مساء'];
    if (greet.some(g => m.includes(g))) return 'greeting';
    const thanks = ['شكر','thanks','thank','تمام','ممتاز','حلو','كويس'];
    if (thanks.some(t => m.includes(t))) return 'thanks';

    // أسعار محددة
    if (/استشاري|consultant/.test(m))                          return 'price_consultant';
    if (/أخصائي|اخصائي|specialist/.test(m))                   return 'price_specialist';
    if (/سعر.*سونار|سونار.*سعر|كام.*سونار/.test(m))           return 'xray';
    if (/سعر.*دوبلر|دوبلر/.test(m))                           return 'xray';
    if (/سعر.*إيكو|إيكو|ايكو/.test(m))                       return 'xray';
    if (/سعر.*أشعة|أشعة.*سعر|كام.*أشعة/.test(m))            return 'xray';
    if (/سعر.*تمريض|تمريض.*سعر|كام.*تمريض/.test(m))         return 'nursing';
    if (/سعر.*كشف|كشف.*سعر|كام.*كشف/.test(m))               return 'kashf';
    if (/سعر|تكلف|كام|بكام|فلوس|تمن/.test(m))               return 'pricing';

    // خدمات محددة
    if (/سونار|دوبلر|إيكو|ايكو|أشعة|xray|ecg|تخطيط/.test(m)) return 'xray';
    if (/تمريض|ممرض|حقن|كانيول|ضمادة|سيروم|إقامة/.test(m))  return 'nursing';
    if (/كشف|دكتور|طبيب|استشار|باطنة|أطفال|قلب|جلد|عظام/.test(m)) return 'kashf';
    if (/خدم|عندكم|إيه|ايه|بتعمل/.test(m))                   return 'services';

    // احجز مباشر
    if (/احجز.*كشف|حجز.*كشف/.test(m))    return 'book_kashf';
    if (/احجز.*تمريض|حجز.*تمريض/.test(m)) return 'book_nursing';
    if (/احجز.*أشعة|حجز.*أشعة/.test(m))  return 'book_xray';
    if (/احجز|حجز|book|طلب/.test(m))      return 'book';

    if (/منطق|عنوان|تغطي|قاهر|جيز|فين/.test(m)) return 'areas';
    if (/وقت|امتى|وصول|ساعة|سريع|متى/.test(m))  return 'time';
    if (/دفع|كاش|انستا|محفظة/.test(m))           return 'payment';
    if (/معتمد|ترخيص|موثوق|جودة/.test(m))        return 'doctors';
    if (/تواصل|اتصل|موبايل|واتس|تليفون|رقم|ايميل/.test(m)) return 'contact';
    return 'fallback';
  }

  /* ══════════════════════════════════════════════
     Quick Replies
  ══════════════════════════════════════════════ */
  const QUICK = [
    '📋 خدماتنا','💰 الأسعار',
    '🩺 كشف منزلي','👩‍⚕️ تمريض منزلي','🔬 أشعة منزلية',
    '📍 مناطق التغطية','📞 تواصل معنا','🏥 احجز الآن',
  ];

  /* ══════════════════════════════════════════════
     CSS
  ══════════════════════════════════════════════ */
  const css = document.createElement('style');
  css.textContent = `
  #mz-wrap{position:fixed;bottom:24px;left:24px;z-index:99999;font-family:'Cairo',sans-serif;direction:rtl}
  #mz-btn{width:64px;height:64px;border-radius:50%;border:3px solid rgba(201,168,76,.5);cursor:pointer;
    background:linear-gradient(135deg,#1e3a2f,#2d5a3d);
    box-shadow:0 4px 20px rgba(0,0,0,.35);
    display:flex;align-items:center;justify-content:center;
    transition:transform .2s;animation:mzPulse 2.5s infinite;padding:0;overflow:hidden;position:relative}
  #mz-btn:hover{transform:scale(1.08)}
  #mz-btn img{width:100%;height:100%;object-fit:cover;border-radius:50%}
  #mz-btn-fb{display:none;position:absolute;inset:0;align-items:center;justify-content:center;
    font-size:26px;color:#c9a84c;font-family:'Cairo',sans-serif;font-weight:900}
  #mz-badge{position:absolute;top:-4px;right:-4px;background:#e53935;color:#fff;
    border-radius:50%;width:20px;height:20px;font-size:11px;font-weight:700;
    display:flex;align-items:center;justify-content:center;border:2px solid #fff;z-index:1}
  #mz-box{width:345px;height:560px;border-radius:22px;overflow:hidden;
    display:flex;flex-direction:column;
    box-shadow:0 20px 60px rgba(0,0,0,.3);animation:mzUp .3s ease}
  #mz-head{background:linear-gradient(135deg,#1C2B2A,#2d5a3d);
    padding:13px 16px;display:flex;align-items:center;justify-content:space-between}
  #mz-hinfo{display:flex;align-items:center;gap:10px}
  #mz-hava{width:42px;height:42px;border-radius:50%;
    border:2px solid rgba(201,168,76,.6);overflow:hidden;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.08)}
  #mz-hava img{width:100%;height:100%;object-fit:cover}
  #mz-hname{color:#fff;font-weight:700;font-size:15px}
  #mz-hstatus{color:rgba(255,255,255,.55);font-size:11px;display:flex;align-items:center;gap:4px;margin-top:2px}
  .mz-dot{width:6px;height:6px;border-radius:50%;background:#4caf50;display:inline-block}
  #mz-close{background:rgba(255,255,255,.1);border:none;color:#fff;
    width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:20px;
    display:flex;align-items:center;justify-content:center}
  #mz-msgs{flex:1;min-height:0;overflow-y:auto;padding:14px 12px;
    display:flex;flex-direction:column;gap:10px;background:#f5f2ec}
  #mz-msgs::-webkit-scrollbar{width:3px}
  #mz-msgs::-webkit-scrollbar-thumb{background:rgba(0,0,0,.1);border-radius:3px}
  .mz-row{display:flex;flex-direction:column}
  .mz-row.user{align-items:flex-start}
  .mz-row.bot{align-items:flex-end}
  .mz-bub{max-width:88%;border-radius:16px;padding:10px 14px;font-size:13px;line-height:1.75}
  .mz-bub.user{background:#fff;color:#2d3b3e;border-radius:16px 16px 4px 16px;
    border:1px solid #e8e4db;box-shadow:0 1px 5px rgba(0,0,0,.06)}
  .mz-bub.bot{background:linear-gradient(135deg,#1C2B2A,#2a4a3a);
    color:#fff;border-radius:16px 16px 16px 4px}
  .mz-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;justify-content:flex-end}
  .mz-chip{background:rgba(201,168,76,.13);border:1px solid rgba(201,168,76,.45);
    border-radius:18px;padding:4px 12px;font-size:12px;cursor:pointer;
    color:#1C2B2A;font-family:'Cairo',sans-serif;font-weight:600;transition:background .15s}
  .mz-chip:hover{background:rgba(201,168,76,.3)}
  .mz-time{font-size:10px;color:#bbb;margin-top:3px;padding:0 3px}
  .mz-typing{display:flex;align-items:center;gap:4px;align-self:flex-end;
    background:linear-gradient(135deg,#1C2B2A,#2a4a3a);
    border-radius:16px 16px 16px 4px;padding:11px 14px}
  .mz-typing span{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.7)}
  .mz-typing span:nth-child(1){animation:mzT 1.2s .0s infinite}
  .mz-typing span:nth-child(2){animation:mzT 1.2s .2s infinite}
  .mz-typing span:nth-child(3){animation:mzT 1.2s .4s infinite}
  #mz-quick{padding:8px 12px;border-top:1px solid #ebe7df;
    display:flex;gap:6px;overflow-x:auto;background:#fff;scrollbar-width:none;
    flex-shrink:0}
  #mz-quick::-webkit-scrollbar{display:none}
  .mz-qr{background:#f5f2ec;border:1px solid #e0dbd0;border-radius:15px;
    padding:5px 11px;font-size:11px;cursor:pointer;white-space:nowrap;
    color:#2d3b3e;font-family:'Cairo',sans-serif;flex-shrink:0;transition:background .15s}
  .mz-qr:hover{background:#ece8e0}
  #mz-irow{padding:9px 12px;background:#fff;border-top:1px solid #ebe7df;
    display:flex;gap:8px;align-items:center;flex-shrink:0}
  #mz-input{flex:1;border:1px solid #e0dbd0;border-radius:22px;
    padding:9px 15px;font-size:13px;font-family:'Cairo',sans-serif;
    outline:none;background:#f9f7f3;color:#2d3b3e;direction:rtl}
  #mz-input:focus{border-color:rgba(201,168,76,.6);box-shadow:0 0 0 3px rgba(201,168,76,.1)}
  #mz-send{width:38px;height:38px;border-radius:50%;border:none;cursor:pointer;
    background:linear-gradient(135deg,#1C2B2A,#2d5a3d);
    color:#c9a84c;font-size:17px;display:flex;align-items:center;justify-content:center;
    flex-shrink:0;transition:transform .15s}
  #mz-send:hover{transform:scale(1.08)}
  @keyframes mzPulse{
    0%,100%{box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 3px rgba(201,168,76,.4)}
    50%{box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 8px rgba(201,168,76,.12)}}
  @keyframes mzUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes mzT{0%,60%,100%{transform:translateY(0);opacity:.7}30%{transform:translateY(-5px);opacity:1}}
  @media(max-width:420px){#mz-box{width:calc(100vw - 28px)}}
  `;
  document.head.appendChild(css);

  /* ══════════════════════════════════════════════
     HTML
  ══════════════════════════════════════════════ */
  const MIZO_IMG = 'mizo.webp';

  const wrap = document.createElement('div');
  wrap.id = 'mz-wrap';
  wrap.innerHTML = `
    <div id="mz-btn" title="تحدث مع ميزو">
      <img src="${MIZO_IMG}" alt="ميزو"
        onerror="this.style.display='none';document.getElementById('mz-btn-fb').style.display='flex'">
      <div id="mz-btn-fb">M</div>
      <div id="mz-badge">1</div>
    </div>
    <div id="mz-box" style="display:none">
      <div id="mz-head">
        <div id="mz-hinfo">
          <div id="mz-hava">
            <img src="${MIZO_IMG}" alt="ميزو" onerror="this.parentElement.innerHTML='🩺'">
          </div>
          <div>
            <div id="mz-hname">ميزو</div>
            <div id="mz-hstatus"><span class="mz-dot"></span> سفير ملاذ للرعاية المنزلية</div>
          </div>
        </div>
        <button id="mz-close">×</button>
      </div>
      <div id="mz-msgs"></div>
      <div id="mz-quick"></div>
      <div id="mz-irow">
        <input id="mz-input" placeholder="اكتب سؤالك هنا..." autocomplete="off">
        <button id="mz-send">➤</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  /* ══════════════════════════════════════════════
     اللوجيك
  ══════════════════════════════════════════════ */
  const btn  = document.getElementById('mz-btn');
  const box  = document.getElementById('mz-box');
  const badge= document.getElementById('mz-badge');
  const msgs = document.getElementById('mz-msgs');
  const quick= document.getElementById('mz-quick');
  const inp  = document.getElementById('mz-input');
  const snd  = document.getElementById('mz-send');
  const cls  = document.getElementById('mz-close');

  function nowTime() {
    return new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});
  }
  function scrollBot(){ setTimeout(()=>{ msgs.scrollTop=msgs.scrollHeight; },60); }

  function addMsg(from, html, chips) {
    const row = document.createElement('div');
    row.className = `mz-row ${from}`;
    const bub = document.createElement('div');
    bub.className = `mz-bub ${from}`;
    renderBubble(bub, html);
    row.appendChild(bub);
    if (chips && chips.length) {
      const cr = document.createElement('div');
      cr.className = 'mz-chips';
      chips.forEach(c => {
        const ch = document.createElement('button');
        ch.className = 'mz-chip';
        ch.textContent = c;
        ch.onclick = () => send_(c);
        cr.appendChild(ch);
      });
      row.appendChild(cr);
    }
    const t = document.createElement('div');
    t.className = 'mz-time';
    t.textContent = nowTime();
    row.appendChild(t);
    msgs.appendChild(row);
    scrollBot();
  }

  function showTyping() {
    const d = document.createElement('div');
    d.className = 'mz-typing';
    d.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(d);
    scrollBot();
    return d;
  }

  function mizoReply(intent) {
    const t = showTyping();
    setTimeout(() => {
      t.remove();
      const R = buildResponses();
      const r = R[intent] || R.fallback;
      addMsg('bot', r.text, r.chips);
    }, 700 + Math.random()*350);
  }

  function send_(txt) {
    const msg = (txt || inp.value).trim();
    if (!msg) return;
    inp.value = '';
    addMsg('user', msg);
    mizoReply(detectIntent(msg));
  }

  /* quick replies bar */
  QUICK.forEach(q => {
    const b = document.createElement('button');
    b.className = 'mz-qr';
    b.textContent = q;
    b.onclick = () => send_(q);
    quick.appendChild(b);
  });

  /* events */
  btn.onclick = () => {
    btn.style.display = 'none';
    box.style.display = 'flex';
    badge.style.display = 'none';
    if (!msgs.children.length) {
      setTimeout(() => {
        addMsg('bot',
          'أهلاً بيك! أنا <b>ميزو</b> 👋 سفير ملاذ للرعاية الطبية المنزلية.\n\nعايز تعرف إيه؟',
          ['📋 خدماتنا','💰 الأسعار','🏥 احجز الآن']
        );
      }, 300);
    }
    setTimeout(()=>inp.focus(),400);
  };

  cls.onclick = () => {
    box.style.display = 'none';
    btn.style.display = 'flex';
  };

  snd.onclick = () => send_();
  inp.addEventListener('keydown', e => { if(e.key==='Enter') send_(); });

})();
