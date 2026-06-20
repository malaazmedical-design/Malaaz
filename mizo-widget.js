/* ============================================================
   MIZO CHATBOT WIDGET — ملاذ v2
   ضيف في آخر index.html قبل </body>:
   <script src="mizo-widget.js"></script>
   ============================================================ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     بيانات الخدمات — بتتحدث من الصفحة تلقائياً
  ══════════════════════════════════════════════ */
  const DATA = {
    services: {
      'كشف منزلي':   { icon:'🩺', min:200, max:800,  desc:'طبيب عام أو متخصص يجي عندك في البيت' },
      'تمريض منزلي': { icon:'👩‍⚕️', min:150, max:600,  desc:'ممرض/ة معتمد/ة لجميع الاحتياجات التمريضية' },
      'أشعة منزلية': { icon:'🔬', min:250, max:900,  desc:'أجهزة أشعة وسونار متنقلة في بيتك' },
    },
    contact: {
      phone:   '01039091989',
      whatsapp:'01039091989',
      email:   'malaaz.medical@gmail.com',
    },
    areas: {
      cairo: ['مدينة نصر','النزهة','هليوبوليس','المعادي','المقطم','الزيتون','شبرا','عين شمس','عباسية','مصر الجديدة','التجمع'],
      giza:  ['الدقي','المهندسين','الهرم','فيصل','بولاق الدكرور','الشيخ زايد','أكتوبر','إمبابة'],
    },
  };

  /* — يسحب الأسعار الحقيقية من الصفحة لو اتحملت — */
  function syncPricesFromPage() {
    try {
      // يجرب يقرأ من price cards اللي رسمها loadPricing()
      document.querySelectorAll('.price-card').forEach(card => {
        const nameEl  = card.querySelector('.price-card-header h3, [class*="name"], h3, h4');
        const minEl   = card.querySelector('.price-min');
        const maxEl   = card.querySelector('.price-max');
        if (!nameEl) return;
        const name = nameEl.textContent.trim();
        if (DATA.services[name] && minEl && maxEl) {
          DATA.services[name].min = parseInt(minEl.textContent) || DATA.services[name].min;
          DATA.services[name].max = parseInt(maxEl.textContent) || DATA.services[name].max;
        }
      });
      // يجرب يقرأ الإيميل من footer
      const emailEl = document.getElementById('footer-email');
      if (emailEl && emailEl.textContent.includes('@')) {
        DATA.contact.email = emailEl.textContent.trim();
      }
    } catch(e) {}
  }

  /* ══════════════════════════════════════════════
     ردود ميزو
  ══════════════════════════════════════════════ */
  function buildResponses() {
    syncPricesFromPage();
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

      /* ── الخدمات ── */
      services: {
        text: `إحنا بنقدم ٣ خدمات طبية في بيتك:\n\n${Object.entries(s).map(([n,v])=>`${v.icon} <b>${n}</b>\n   ${v.desc}\n   💰 من ${v.min} لـ ${v.max} ج.م`).join('\n\n')}\n\nعايز تعرف أكتر عن خدمة معينة؟`,
        chips: ['🩺 كشف منزلي','👩‍⚕️ تمريض منزلي','🔬 أشعة منزلية','🏥 احجز الآن'],
      },

      /* ── كشف منزلي ── */
      kashf: {
        text: `🩺 <b>الكشف المنزلي</b>\n\n${s['كشف منزلي'].desc}\n\n👨‍⚕️ <b>أنواع الكشف:</b>\n• كشف عام\n• كشف متخصص (باطنة، أطفال، قلب، جلدية، عظام، نساء وتوليد، مخ وأعصاب، والمزيد)\n\n💰 <b>الأسعار:</b>\n• طبيب عام: من ${s['كشف منزلي'].min} ج.م\n• طبيب متخصص: من ${Math.round(s['كشف منزلي'].min*1.5)} لـ ${s['كشف منزلي'].max} ج.م\n\n✅ الدفع بعد الخدمة`,
        chips: ['💰 سعر تخصص معين','🏥 احجز كشف','📍 مناطق التغطية'],
      },

      /* ── تمريض منزلي ── */
      nursing: {
        text: `👩‍⚕️ <b>التمريض المنزلي</b>\n\n${s['تمريض منزلي'].desc}\n\n🏥 <b>الخدمات التمريضية:</b>\n• حقن وأدوية وريدية\n• تغيير ضمادات وجروح\n• قياس ضغط وسكر\n• تركيب كانيولا وسيروم\n• رعاية مرضى الفراش\n• تمريض ما بعد العمليات\n\n💰 <b>الأسعار:</b> من ${s['تمريض منزلي'].min} لـ ${s['تمريض منزلي'].max} ج.م\n\n⏰ متاحين ٢٤ ساعة / ٧ أيام`,
        chips: ['🏥 احجز تمريض','💰 الأسعار','📞 تواصل معنا'],
      },

      /* ── أشعة منزلية ── */
      xray: {
        text: `🔬 <b>الأشعة المنزلية</b>\n\n${s['أشعة منزلية'].desc}\n\n📸 <b>أنواع الأشعة:</b>\n• سونار (موجات فوق صوتية)\n• أشعة سينية (X-Ray)\n• تخطيط قلب (ECG)\n• تحاليل طبية منزلية\n\n💰 <b>الأسعار:</b> من ${s['أشعة منزلية'].min} لـ ${s['أشعة منزلية'].max} ج.م\n\n📋 التقرير بيوصلك بعد الانتهاء مباشرة`,
        chips: ['🏥 احجز أشعة','💰 الأسعار','📞 تواصل معنا'],
      },

      /* ── الأسعار ── */
      pricing: {
        text: `💰 <b>الأسعار الكاملة:</b>\n\n${Object.entries(s).map(([n,v])=>`${v.icon} <b>${n}</b>: ${v.min} – ${v.max} ج.م`).join('\n')}\n\n✅ الحجز مجاني\n✅ الدفع بعد الخدمة\n✅ مفيش رسوم خفية\n\nعايز سعر خدمة معينة؟`,
        chips: ['🩺 سعر الكشف','👩‍⚕️ سعر التمريض','🔬 سعر الأشعة','🏥 احجز الآن'],
      },

      /* ── سعر الكشف ── */
      price_kashf: {
        text: `🩺 <b>أسعار الكشف المنزلي:</b>\n\n• طبيب عام: من ${s['كشف منزلي'].min} ج.م\n• طبيب متخصص (باطنة، أطفال، إلخ): من ${Math.round(s['كشف منزلي'].min*1.5)} لـ ${s['كشف منزلي'].max} ج.م\n\n💡 السعر النهائي بيتحدد حسب التخصص والمنطقة\n✅ الدفع بعد الكشف`,
        chips: ['🏥 احجز كشف','👩‍⚕️ سعر التمريض','🔬 سعر الأشعة'],
      },

      /* ── سعر التمريض ── */
      price_nursing: {
        text: `👩‍⚕️ <b>أسعار التمريض المنزلي:</b>\n\n• زيارة تمريضية: من ${s['تمريض منزلي'].min} ج.م\n• رعاية يومية/مستمرة: من ${Math.round(s['تمريض منزلي'].min*2)} ج.م\n• أقصى: ${s['تمريض منزلي'].max} ج.م\n\n💡 السعر حسب نوع الخدمة والمدة\n✅ الدفع بعد الخدمة`,
        chips: ['🏥 احجز تمريض','🩺 سعر الكشف','🔬 سعر الأشعة'],
      },

      /* ── سعر الأشعة ── */
      price_xray: {
        text: `🔬 <b>أسعار الأشعة المنزلية:</b>\n\n• سونار: من ${s['أشعة منزلية'].min} ج.م\n• أشعة سينية: من ${Math.round(s['أشعة منزلية'].min*1.2)} ج.م\n• تخطيط قلب (ECG): من ${Math.round(s['أشعة منزلية'].min*0.9)} ج.م\n• أقصى: ${s['أشعة منزلية'].max} ج.م\n\n💡 السعر حسب نوع الأشعة والمنطقة\n✅ الدفع بعد الخدمة`,
        chips: ['🏥 احجز أشعة','🩺 سعر الكشف','👩‍⚕️ سعر التمريض'],
      },

      /* ── مناطق التغطية ── */
      areas: {
        text: `📍 <b>مناطق التغطية:</b>\n\n🏙️ <b>القاهرة:</b>\n${a.cairo.join(' · ')}\n\n🌆 <b>الجيزة:</b>\n${a.giza.join(' · ')}\n\nتقدر تتأكد من منطقتك وقت الحجز 😊`,
        chips: ['🏥 احجز الآن','⏱️ وقت الوصول'],
      },

      /* ── وقت الوصول ── */
      time: {
        text: `⚡ بنسعى للتأكيد خلال <b>١٥ دقيقة</b>!\n\n🏃 المقدم بيوصلك خلال <b>ساعة تقريباً</b> حسب:\n• المتاحية\n• منطقتك\n• نوع الخدمة\n\n🌙 متاحين <b>٢٤ ساعة / ٧ أيام</b>`,
        chips: ['🏥 احجز الآن','📍 مناطق التغطية'],
      },

      /* ── الدفع ── */
      payment: {
        text: `💳 <b>طرق الدفع:</b>\n\n💵 <b>كاش</b> — بعد الخدمة مباشرة\n📱 <b>انستا باي</b> — تحويل فوري\n👛 <b>محفظة ملاذ</b> — رصيدك محفوظ\n\n🎉 <b>الحجز مجاني</b> — مفيش رسوم مقدمة!`,
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
        text: `🎉 <b>الحجز سهل جداً:</b>\n\n1️⃣ اضغط "احجز الآن" في الموقع\n2️⃣ اختار الخدمة\n3️⃣ ادخل بياناتك وعنوانك\n4️⃣ اختار الوقت\n5️⃣ خلاص! ✅\n\n💡 الحجز مجاني والدفع بعد الخدمة`,
        chips: ['💰 الأسعار','📞 تواصل معنا'],
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
    '📋 خدماتنا'       : 'services',
    '💰 الأسعار'       : 'pricing',
    '🩺 كشف منزلي'    : 'kashf',
    '👩‍⚕️ تمريض منزلي': 'nursing',
    '🔬 أشعة منزلية'  : 'xray',
    '🩺 سعر الكشف'    : 'price_kashf',
    '👩‍⚕️ سعر التمريض': 'price_nursing',
    '🔬 سعر الأشعة'   : 'price_xray',
    '💰 سعر تخصص معين': 'price_kashf',
    '📍 مناطق التغطية' : 'areas',
    '⏱️ وقت الوصول'   : 'time',
    '💳 طرق الدفع'    : 'payment',
    '👨‍⚕️ هل الأطباء معتمدون؟': 'doctors',
    '📞 تواصل معنا'   : 'contact',
    '🏥 احجز الآن'    : 'book',
    '🏥 احجز كشف'     : 'book',
    '🏥 احجز تمريض'   : 'book',
    '🏥 احجز أشعة'    : 'book',
  };

  function detectIntent(msg) {
    if (CHIP_MAP[msg]) return CHIP_MAP[msg];
    const m = msg.toLowerCase();
    const greet = ['أهل','مرحب','هاي','hi ','hello','السلام','صباح','مساء','ازيك','ازيك'];
    if (greet.some(g => m.includes(g))) return 'greeting';
    const thanks = ['شكر','thanks','thank','تمام','ممتاز','حلو','كويس','عظيم'];
    if (thanks.some(t => m.includes(t))) return 'thanks';

    // أسعار محددة
    if (/سعر.*كشف|كشف.*سعر|كام.*كشف|كشف.*كام/.test(m)) return 'price_kashf';
    if (/سعر.*تمريض|تمريض.*سعر|كام.*تمريض|تمريض.*كام/.test(m)) return 'price_nursing';
    if (/سعر.*أشعة|أشعة.*سعر|كام.*أشعة|أشعة.*كام|سعر.*سونار|سونار.*سعر/.test(m)) return 'price_xray';
    if (/سعر|تكلف|كام|بكام|فلوس|تمن/.test(m)) return 'pricing';

    // خدمات محددة
    if (/كشف|دكتور|طبيب|استشار/.test(m)) return 'kashf';
    if (/تمريض|ممرض|حقن|كانيول|ضمادة|سيروم|ضغط.*قياس|سكر.*قياس/.test(m)) return 'nursing';
    if (/أشعة|سونار|xray|x-ray|ecg|تخطيط/.test(m)) return 'xray';
    if (/خدم|عندكم|إيه|ايه|عندك|بتعمل/.test(m)) return 'services';

    if (/منطق|عنوان|تغطي|قاهر|جيز|فين|وصول.*منطق/.test(m)) return 'areas';
    if (/وقت|امتى|وصول|ساعة|سريع|متى|بكام وقت/.test(m)) return 'time';
    if (/دفع|كاش|انستا|محفظة|payment/.test(m)) return 'payment';
    if (/معتمد|ترخيص|موثوق|كفاءة|جودة/.test(m)) return 'doctors';
    if (/تواصل|اتصل|موبايل|واتس|تليفون|رقم|ايميل|إيميل/.test(m)) return 'contact';
    if (/احجز|حجز|book|طلب|عايز.*خدم/.test(m)) return 'book';
    return 'fallback';
  }

  /* ══════════════════════════════════════════════
     Quick Replies الشريط
  ══════════════════════════════════════════════ */
  const QUICK = [
    '📋 خدماتنا','💰 الأسعار','🩺 كشف منزلي',
    '👩‍⚕️ تمريض منزلي','🔬 أشعة منزلية','📍 مناطق التغطية',
    '📞 تواصل معنا','🏥 احجز الآن',
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
    transition:transform .2s;animation:mzPulse 2.5s infinite;padding:0;overflow:hidden}
  #mz-btn:hover{transform:scale(1.08)}
  #mz-btn img{width:100%;height:100%;object-fit:cover;border-radius:50%}
  #mz-btn-fallback{font-size:28px;color:#c9a84c;font-family:'Cairo',sans-serif;font-weight:900}
  #mz-badge{position:absolute;top:-4px;right:-4px;background:#e53935;color:#fff;
    border-radius:50%;width:20px;height:20px;font-size:11px;font-weight:700;
    display:flex;align-items:center;justify-content:center;border:2px solid #fff}
  #mz-box{width:345px;max-height:550px;border-radius:22px;overflow:hidden;
    display:flex;flex-direction:column;
    box-shadow:0 20px 60px rgba(0,0,0,.3);animation:mzUp .3s ease}
  #mz-head{background:linear-gradient(135deg,#1e3a2f,#2d5a3d);
    padding:13px 16px;display:flex;align-items:center;justify-content:space-between}
  #mz-hinfo{display:flex;align-items:center;gap:10px}
  #mz-hava{width:42px;height:42px;border-radius:50%;
    border:2px solid rgba(201,168,76,.5);overflow:hidden;
    display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.08)}
  #mz-hava img{width:100%;height:100%;object-fit:cover}
  #mz-hname{color:#fff;font-weight:700;font-size:14px}
  #mz-hstatus{color:rgba(255,255,255,.55);font-size:11px;display:flex;align-items:center;gap:4px;margin-top:2px}
  .mz-dot{width:6px;height:6px;border-radius:50%;background:#4caf50;display:inline-block}
  #mz-close{background:rgba(255,255,255,.1);border:none;color:#fff;
    width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:20px;
    display:flex;align-items:center;justify-content:center;line-height:1}
  #mz-msgs{flex:1;overflow-y:auto;padding:14px 12px;
    display:flex;flex-direction:column;gap:10px;background:#f5f2ec}
  #mz-msgs::-webkit-scrollbar{width:3px}
  #mz-msgs::-webkit-scrollbar-thumb{background:rgba(0,0,0,.1);border-radius:3px}
  .mz-row{display:flex;flex-direction:column}
  .mz-row.user{align-items:flex-start}
  .mz-row.bot{align-items:flex-end}
  .mz-bub{max-width:87%;border-radius:16px;padding:9px 13px;font-size:13px;line-height:1.7}
  .mz-bub.user{background:#fff;color:#2d3b3e;border-radius:16px 16px 4px 16px;
    border:1px solid #e8e4db;box-shadow:0 1px 5px rgba(0,0,0,.06)}
  .mz-bub.bot{background:linear-gradient(135deg,#1e3a2f,#2d5a3d);
    color:#fff;border-radius:16px 16px 16px 4px}
  .mz-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;justify-content:flex-end}
  .mz-chip{background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.4);
    border-radius:18px;padding:4px 11px;font-size:11.5px;cursor:pointer;
    color:#1e3a2f;font-family:'Cairo',sans-serif;font-weight:600;transition:background .15s}
  .mz-chip:hover{background:rgba(201,168,76,.3)}
  .mz-time{font-size:10px;color:#bbb;margin-top:3px;padding:0 3px}
  .mz-typing{display:flex;align-items:center;gap:4px;align-self:flex-end;
    background:linear-gradient(135deg,#1e3a2f,#2d5a3d);
    border-radius:16px 16px 16px 4px;padding:11px 14px}
  .mz-typing span{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.7)}
  .mz-typing span:nth-child(1){animation:mzT 1.2s .0s infinite}
  .mz-typing span:nth-child(2){animation:mzT 1.2s .2s infinite}
  .mz-typing span:nth-child(3){animation:mzT 1.2s .4s infinite}
  #mz-quick{padding:8px 12px;border-top:1px solid #ebe7df;
    display:flex;gap:6px;overflow-x:auto;background:#fff;scrollbar-width:none}
  #mz-quick::-webkit-scrollbar{display:none}
  .mz-qr{background:#f5f2ec;border:1px solid #e0dbd0;border-radius:15px;
    padding:5px 11px;font-size:11px;cursor:pointer;white-space:nowrap;
    color:#2d3b3e;font-family:'Cairo',sans-serif;flex-shrink:0;transition:background .15s}
  .mz-qr:hover{background:#ece8e0}
  #mz-irow{padding:9px 12px;background:#fff;border-top:1px solid #ebe7df;
    display:flex;gap:8px;align-items:center}
  #mz-input{flex:1;border:1px solid #e0dbd0;border-radius:22px;
    padding:9px 15px;font-size:13px;font-family:'Cairo',sans-serif;
    outline:none;background:#f9f7f3;color:#2d3b3e;direction:rtl}
  #mz-input:focus{border-color:rgba(201,168,76,.6);box-shadow:0 0 0 3px rgba(201,168,76,.1)}
  #mz-send{width:38px;height:38px;border-radius:50%;border:none;cursor:pointer;
    background:linear-gradient(135deg,#1e3a2f,#2d5a3d);
    color:#c9a84c;font-size:17px;display:flex;align-items:center;justify-content:center;
    flex-shrink:0;transition:transform .15s}
  #mz-send:hover{transform:scale(1.08)}
  @keyframes mzPulse{0%,100%{box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 3px rgba(201,168,76,.4)}
    50%{box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 8px rgba(201,168,76,.12)}}
  @keyframes mzUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes mzT{0%,60%,100%{transform:translateY(0);opacity:.7}30%{transform:translateY(-5px);opacity:1}}
  @media(max-width:400px){#mz-box{width:calc(100vw - 30px)}}
  `;
  document.head.appendChild(css);

  /* ══════════════════════════════════════════════
     HTML
  ══════════════════════════════════════════════ */
  const MIZO_IMG = 'mizo.webp'; // ← اسم صورة ميزو اللي هترفعها
  const imgTag = `<img src="${MIZO_IMG}" alt="ميزو" onerror="this.style.display='none';document.getElementById('mz-btn-fb').style.display='flex'">`;

  const wrap = document.createElement('div');
  wrap.id = 'mz-wrap';
  wrap.innerHTML = `
    <div id="mz-btn" title="تحدث مع ميزو">
      ${imgTag}
      <div id="mz-btn-fb" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center">
        <span id="mz-btn-fallback">M</span>
      </div>
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
  const btn   = document.getElementById('mz-btn');
  const box   = document.getElementById('mz-box');
  const badge = document.getElementById('mz-badge');
  const msgs  = document.getElementById('mz-msgs');
  const quick = document.getElementById('mz-quick');
  const inp   = document.getElementById('mz-input');
  const send  = document.getElementById('mz-send');
  const cls   = document.getElementById('mz-close');

  function nowTime() {
    return new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});
  }
  function scrollBot() { setTimeout(()=>{ msgs.scrollTop=msgs.scrollHeight; },60); }

  function addMsg(from, html, chips) {
    const row = document.createElement('div');
    row.className = `mz-row ${from}`;
    const bub = document.createElement('div');
    bub.className = `mz-bub ${from}`;
    bub.innerHTML = html.replace(/\n/g,'<br>');
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
    }, 700 + Math.random()*400);
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
      // أول فتح — رسالة ترحيب
      setTimeout(() => {
        addMsg('bot',
          'أهلاً بيك! أنا <b>ميزو</b> 👋 سفير ملاذ للرعاية الطبية المنزلية.\n\nعايز تعرف إيه؟',
          ['📋 خدماتنا','💰 الأسعار','🏥 احجز الآن']
        );
      }, 300);
    }
    setTimeout(() => inp.focus(), 400);
  };

  cls.onclick = () => {
    box.style.display = 'none';
    btn.style.display = 'flex';
  };

  send.onclick = () => send_();
  inp.addEventListener('keydown', e => { if(e.key==='Enter') send_(); });

  /* sync أسعار بعد ما الصفحة تخلص تحميل */
  window.addEventListener('load', () => { setTimeout(syncPricesFromPage, 2000); });

})();
