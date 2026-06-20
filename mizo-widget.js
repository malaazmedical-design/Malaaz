/* ============================================================
   MIZO CHATBOT WIDGET — ملاذ
   ضيف السكريبت ده في آخر index.html قبل </body>
   ============================================================ */
(function () {
  'use strict';

  /* ---- البيانات ---- */
  const QUICK_REPLIES = [
    { label: '📋 خدماتكم إيه؟',          key: 'services' },
    { label: '💰 الأسعار كام؟',           key: 'pricing'  },
    { label: '📍 مناطق التغطية',          key: 'areas'    },
    { label: '⏱️ وقت الوصول',            key: 'time'     },
    { label: '💳 طرق الدفع',             key: 'payment'  },
    { label: '👨‍⚕️ هل الأطباء معتمدون؟', key: 'doctors'  },
    { label: '📞 تواصل معنا',            key: 'contact'  },
    { label: '🏥 احجز الآن',             key: 'book'     },
  ];

  const RESPONSES = {
    services: {
      text: 'أنا ميزو، سفير ملاذ! 😊\n\nإحنا بنقدم ٣ خدمات في بيتك:\n\n🩺 <b>كشف منزلي</b> — طبيب عام أو متخصص\n💉 <b>تمريض منزلي</b> — ممرض/ة معتمد/ة\n🔬 <b>أشعة منزلية</b> — أجهزة متنقلة\n\nعايز تحجز أيهم؟',
      chips: ['💰 الأسعار كام؟','🏥 احجز الآن','📍 مناطق التغطية'],
    },
    pricing: {
      text: '💰 الأسعار حسب الخدمة:\n\n🩺 <b>كشف منزلي:</b> من ٢٠٠ لـ ٨٠٠ ج.م\n💉 <b>تمريض منزلي:</b> من ١٥٠ لـ ٦٠٠ ج.م\n🔬 <b>أشعة منزلية:</b> من ٢٥٠ لـ ٩٠٠ ج.م\n\n✅ <b>الحجز مجاني</b> — الدفع بعد الخدمة!',
      chips: ['💳 طرق الدفع','🏥 احجز الآن'],
    },
    areas: {
      text: '📍 بنغطي معظم مناطق القاهرة والجيزة:\n\n🏙️ <b>القاهرة:</b> مدينة نصر، هليوبوليس، المعادي، الزيتون، شبرا، عين شمس وغيرها\n\n🌆 <b>الجيزة:</b> الدقي، المهندسين، الهرم، فيصل، الشيخ زايد وغيرها\n\nتقدر تتحقق من منطقتك وقت الحجز 😊',
      chips: ['🏥 احجز الآن','⏱️ وقت الوصول'],
    },
    time: {
      text: '⚡ بنسعى للتأكيد خلال <b>١٥ دقيقة</b> من الحجز!\n\n🏃 المقدم بيوصلك خلال <b>ساعة تقريباً</b> حسب المتاحية ومنطقتك.\n\n🌙 متاحين <b>٢٤ ساعة / ٧ أيام</b>',
      chips: ['🏥 احجز الآن','📍 مناطق التغطية'],
    },
    payment: {
      text: '💳 طرق الدفع:\n\n💵 <b>كاش</b> — بعد الخدمة مباشرة\n📱 <b>انستا باي</b> — تحويل فوري\n👛 <b>محفظة ملاذ</b> — رصيدك محفوظ\n\n🎉 مفيش أي رسوم مقدمة!',
      chips: ['🏥 احجز الآن','💰 الأسعار كام؟'],
    },
    doctors: {
      text: '👨‍⚕️ أيوه بالتأكيد! كل مقدمي الخدمة:\n\n✅ مرخصين من النقابة المختصة\n✅ بنتحقق من بياناتهم قبل القبول\n✅ عندهم خبرة موثّقة\n✅ عندنا نظام تقييم من العملاء\n\nملاذ بتضمن الجودة والأمان! 🛡️',
      chips: ['🏥 احجز الآن','📋 خدماتكم إيه؟'],
    },
    contact: {
      text: '📞 تواصل معانا في أي وقت:\n\n📱 <b>موبايل:</b> 01006484908\n📧 <b>إيميل:</b> info@malaaz.com\n💬 <b>واتساب:</b> 01039091989\n\n⏰ متاحين <b>٢٤/٧</b> لخدمتك! 🤝',
      chips: ['🏥 احجز الآن','📋 خدماتكم إيه؟'],
    },
    book: {
      text: '🎉 الحجز سهل جداً:\n\n1️⃣ اضغط <b>"احجز الآن"</b> في الموقع\n2️⃣ اختار الخدمة\n3️⃣ ادخل بياناتك وعنوانك\n4️⃣ اختار الوقت المناسب\n5️⃣ خلاص! هنتواصل معاك ✅\n\n💡 الحجز مجاني والدفع بعد الخدمة!',
      chips: ['💰 الأسعار كام؟','📞 تواصل معنا'],
    },
    greeting: {
      text: 'أهلاً وسهلاً! 😊\nأنا <b>ميزو</b>، هنا عشان أساعدك في أي سؤال عن خدمات ملاذ للرعاية المنزلية.\n\nإيه اللي تحتاجه؟',
      chips: ['📋 خدماتكم إيه؟','💰 الأسعار كام؟','🏥 احجز الآن'],
    },
    thanks: {
      text: 'العفو! 😄 يشرفنا خدمتك.\nلو محتاج أي حاجة تانية أنا هنا!',
      chips: ['🏥 احجز الآن','📞 تواصل معنا'],
    },
    fallback: {
      text: 'مش فاهم سؤالك كويس 😅\nبس مش هسيبك! اختار من الأسئلة دي أو تواصل معانا:',
      chips: ['📋 خدماتكم إيه؟','📞 تواصل معنا','🏥 احجز الآن'],
    },
  };

  /* ---- كشف النية ---- */
  const LABEL_MAP = {};
  QUICK_REPLIES.forEach(q => { LABEL_MAP[q.label] = q.key; });

  function detectIntent(msg) {
    const m = msg.toLowerCase().trim();
    if (LABEL_MAP[msg]) return LABEL_MAP[msg];
    const greet = ['أهلاً','مرحبا','هاي','hi','hello','السلام','صباح','مساء'];
    if (greet.some(g => m.includes(g.toLowerCase()))) return 'greeting';
    const thanks = ['شكر','thanks','thank','تمام','ممتاز','حلو','كويس'];
    if (thanks.some(t => m.includes(t))) return 'thanks';
    if (/خدم|ايه|إيه|عندكم|تمريض|أشعة|كشف/.test(m)) return 'services';
    if (/سعر|تكلف|كام|بكام/.test(m)) return 'pricing';
    if (/منطق|عنوان|تغطي|قاهر|جيز|فين/.test(m)) return 'areas';
    if (/وقت|امتى|وصول|ساعة|سريع|متى/.test(m)) return 'time';
    if (/دفع|كاش|انستا|محفظة/.test(m)) return 'payment';
    if (/دكتور|طبيب|معتمد|ترخيص|موثوق/.test(m)) return 'doctors';
    if (/تواصل|اتصل|موبايل|واتس|تليفون|رقم/.test(m)) return 'contact';
    if (/احجز|حجز|book|طلب/.test(m)) return 'book';
    return 'fallback';
  }

  /* ---- CSS ---- */
  const style = document.createElement('style');
  style.textContent = `
    #mizo-wrap{position:fixed;bottom:24px;left:24px;z-index:99999;font-family:'Cairo',sans-serif;direction:rtl}
    #mizo-btn{width:62px;height:62px;border-radius:50%;border:none;cursor:pointer;
      background:linear-gradient(135deg,#1e3a2f,#2d5a3d);
      box-shadow:0 4px 18px rgba(0,0,0,.3),0 0 0 3px rgba(201,168,76,.4);
      font-size:26px;display:flex;align-items:center;justify-content:center;
      transition:transform .2s;animation:mizoPulse 2.5s infinite;color:#fff}
    #mizo-btn:hover{transform:scale(1.08)}
    #mizo-badge{position:absolute;top:-4px;right:-4px;background:#e53935;color:#fff;
      border-radius:50%;width:20px;height:20px;font-size:11px;font-weight:700;
      display:flex;align-items:center;justify-content:center;border:2px solid #fff}
    #mizo-box{width:340px;max-height:540px;border-radius:20px;overflow:hidden;
      display:flex;flex-direction:column;
      box-shadow:0 20px 60px rgba(0,0,0,.28);
      animation:mizoSlideUp .3s ease}
    #mizo-head{background:linear-gradient(135deg,#1e3a2f,#2d5a3d);
      padding:13px 16px;display:flex;align-items:center;justify-content:space-between}
    #mizo-head-info{display:flex;align-items:center;gap:10px}
    #mizo-avatar-h{width:40px;height:40px;border-radius:50%;
      background:rgba(255,255,255,.1);border:2px solid rgba(201,168,76,.5);
      display:flex;align-items:center;justify-content:center;font-size:20px}
    #mizo-name{color:#fff;font-weight:700;font-size:14px}
    #mizo-status{color:rgba(255,255,255,.55);font-size:11px;display:flex;align-items:center;gap:4px}
    .mizo-dot{width:6px;height:6px;border-radius:50%;background:#4caf50;display:inline-block}
    #mizo-close{background:rgba(255,255,255,.1);border:none;color:#fff;
      width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:18px;
      display:flex;align-items:center;justify-content:center}
    #mizo-msgs{flex:1;overflow-y:auto;padding:14px 12px;
      display:flex;flex-direction:column;gap:10px;background:#f5f2ec;
      scroll-behavior:smooth}
    #mizo-msgs::-webkit-scrollbar{width:4px}
    #mizo-msgs::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:4px}
    .mizo-msg{display:flex;flex-direction:column}
    .mizo-msg.user{align-items:flex-start}
    .mizo-msg.bot{align-items:flex-end}
    .mizo-bubble{max-width:86%;border-radius:16px;padding:9px 13px;font-size:13px;line-height:1.65}
    .mizo-bubble.user{background:#fff;color:#2d3b3e;border-radius:16px 16px 4px 16px;
      border:1px solid #e8e4db;box-shadow:0 1px 4px rgba(0,0,0,.06)}
    .mizo-bubble.bot{background:linear-gradient(135deg,#1e3a2f,#2d5a3d);
      color:#fff;border-radius:16px 16px 16px 4px}
    .mizo-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;justify-content:flex-end}
    .mizo-chip{background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.4);
      border-radius:18px;padding:4px 11px;font-size:11px;cursor:pointer;
      color:#1e3a2f;font-family:'Cairo',sans-serif;font-weight:600;
      transition:background .2s}
    .mizo-chip:hover{background:rgba(201,168,76,.28)}
    .mizo-time{font-size:10px;color:#aaa;margin-top:3px;padding:0 3px}
    .mizo-typing{display:flex;align-items:center;gap:4px;
      background:linear-gradient(135deg,#1e3a2f,#2d5a3d);
      border-radius:16px 16px 16px 4px;padding:11px 14px;width:fit-content;
      align-self:flex-end}
    .mizo-typing span{width:7px;height:7px;border-radius:50%;
      background:rgba(255,255,255,.7);display:inline-block}
    .mizo-typing span:nth-child(1){animation:mizoT 1.2s .0s infinite}
    .mizo-typing span:nth-child(2){animation:mizoT 1.2s .2s infinite}
    .mizo-typing span:nth-child(3){animation:mizoT 1.2s .4s infinite}
    #mizo-quick{padding:8px 12px;border-top:1px solid #e8e4db;
      display:flex;gap:6px;overflow-x:auto;background:#fff}
    #mizo-quick::-webkit-scrollbar{display:none}
    .mizo-qr{background:#f5f2ec;border:1px solid #e0dbd0;border-radius:15px;
      padding:5px 10px;font-size:11px;cursor:pointer;white-space:nowrap;
      color:#2d3b3e;font-family:'Cairo',sans-serif;flex-shrink:0;
      transition:background .2s}
    .mizo-qr:hover{background:#ece8e0}
    #mizo-input-row{padding:9px 12px;background:#fff;border-top:1px solid #e8e4db;
      display:flex;gap:8px;align-items:center}
    #mizo-input{flex:1;border:1px solid #e0dbd0;border-radius:22px;
      padding:9px 15px;font-size:13px;font-family:'Cairo',sans-serif;
      outline:none;background:#f9f7f3;color:#2d3b3e;direction:rtl}
    #mizo-input:focus{border-color:rgba(201,168,76,.6)}
    #mizo-send{width:38px;height:38px;border-radius:50%;border:none;cursor:pointer;
      background:linear-gradient(135deg,#1e3a2f,#2d5a3d);
      color:#c9a84c;font-size:17px;display:flex;align-items:center;justify-content:center;
      flex-shrink:0;transition:transform .15s}
    #mizo-send:hover{transform:scale(1.08)}
    @keyframes mizoPulse{0%,100%{box-shadow:0 4px 18px rgba(0,0,0,.3),0 0 0 3px rgba(201,168,76,.4)}50%{box-shadow:0 4px 18px rgba(0,0,0,.3),0 0 0 7px rgba(201,168,76,.15)}}
    @keyframes mizoSlideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes mizoT{0%,60%,100%{transform:translateY(0);opacity:.7}30%{transform:translateY(-5px);opacity:1}}
    @media(max-width:400px){#mizo-box{width:calc(100vw - 32px)}}
  `;
  document.head.appendChild(style);

  /* ---- HTML ---- */
  const wrap = document.createElement('div');
  wrap.id = 'mizo-wrap';
  wrap.innerHTML = `
    <div id="mizo-btn" title="تحدث مع ميزو">
      🩺
      <div id="mizo-badge">1</div>
    </div>
    <div id="mizo-box" style="display:none">
      <div id="mizo-head">
        <div id="mizo-head-info">
          <div id="mizo-avatar-h">🩺</div>
          <div>
            <div id="mizo-name">ميزو</div>
            <div id="mizo-status"><span class="mizo-dot"></span> سفير ملاذ للرعاية المنزلية</div>
          </div>
        </div>
        <button id="mizo-close">×</button>
      </div>
      <div id="mizo-msgs"></div>
      <div id="mizo-quick"></div>
      <div id="mizo-input-row">
        <input id="mizo-input" placeholder="اكتب سؤالك هنا..." />
        <button id="mizo-send">➤</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  /* ---- العناصر ---- */
  const btn   = document.getElementById('mizo-btn');
  const box   = document.getElementById('mizo-box');
  const badge = document.getElementById('mizo-badge');
  const msgs  = document.getElementById('mizo-msgs');
  const quick = document.getElementById('mizo-quick');
  const input = document.getElementById('mizo-input');
  const send  = document.getElementById('mizo-send');
  const close = document.getElementById('mizo-close');

  let open = false;

  /* ---- وظائف ---- */
  function nowTime() {
    return new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});
  }

  function scrollBottom() {
    setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
  }

  function addMsg(from, html, chips) {
    const div = document.createElement('div');
    div.className = `mizo-msg ${from}`;
    const bubble = document.createElement('div');
    bubble.className = `mizo-bubble ${from}`;
    bubble.innerHTML = html.replace(/\n/g,'<br>');
    div.appendChild(bubble);
    if (chips && chips.length) {
      const chipRow = document.createElement('div');
      chipRow.className = 'mizo-chips';
      chips.forEach(c => {
        const ch = document.createElement('button');
        ch.className = 'mizo-chip';
        ch.textContent = c;
        ch.onclick = () => handleSend(c);
        chipRow.appendChild(ch);
      });
      div.appendChild(chipRow);
    }
    const t = document.createElement('div');
    t.className = 'mizo-time';
    t.textContent = nowTime();
    div.appendChild(t);
    msgs.appendChild(div);
    scrollBottom();
  }

  function showTyping() {
    const d = document.createElement('div');
    d.className = 'mizo-typing';
    d.id = 'mizo-typing-ind';
    d.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(d);
    scrollBottom();
    return d;
  }

  function mizoReply(intent) {
    const t = showTyping();
    const delay = 700 + Math.random() * 400;
    setTimeout(() => {
      t.remove();
      const r = RESPONSES[intent] || RESPONSES.fallback;
      addMsg('bot', r.text, r.chips);
    }, delay);
  }

  function handleSend(txt) {
    const msg = (txt || input.value).trim();
    if (!msg) return;
    input.value = '';
    addMsg('user', msg);
    const intent = detectIntent(msg);
    mizoReply(intent);
  }

  /* ---- Quick replies ---- */
  QUICK_REPLIES.forEach(qr => {
    const b = document.createElement('button');
    b.className = 'mizo-qr';
    b.textContent = qr.label;
    b.onclick = () => handleSend(qr.label);
    quick.appendChild(b);
  });

  /* ---- Events ---- */
  btn.onclick = () => {
    open = true;
    btn.style.display = 'none';
    box.style.display = 'flex';
    badge.style.display = 'none';
    // رسالة الترحيب
    if (msgs.children.length === 0) {
      addMsg('bot',
        'أهلاً بيك! أنا <b>ميزو</b> 👋 سفير ملاذ للرعاية المنزلية.\n\nعايز تعرف إيه؟',
        ['📋 خدماتكم إيه؟','💰 الأسعار كام؟','🏥 احجز الآن']
      );
    }
    setTimeout(() => input.focus(), 200);
  };

  close.onclick = () => {
    open = false;
    box.style.display = 'none';
    btn.style.display = 'flex';
  };

  send.onclick = () => handleSend();
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });

})();
