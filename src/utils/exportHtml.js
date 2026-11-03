import { getResolvedTheme } from '../themes';

export function generateStandaloneHtml(data) {
  const theme = getResolvedTheme(data);
  
  // Calculate age from DOB
  let age = '28';
  if (data.dob) {
    try {
      const parts = data.dob.split('-');
      if (parts.length === 3) {
        const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        if (!isNaN(calculatedAge)) age = String(calculatedAge);
      }
    } catch (e) {
      // fallback
    }
  }

  // Height formatting (ft/in + cm)
  let formattedHeight = data.height || '';
  if (data.height && data.heightCm) {
    formattedHeight = `${data.height} (${data.heightCm} cm)`;
  } else if (data.heightCm) {
    formattedHeight = `${data.heightCm} cm`;
  }

  // Photos resolution
  const photoList = Array.isArray(data.photoUrls) && data.photoUrls.length > 0 
    ? data.photoUrls 
    : (data.photoUrl ? [data.photoUrl] : ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=600&h=750&q=80']);

  const primaryPhoto = photoList[0];
  const additionalPhotos = photoList.slice(1);

  // Pre-generate career list
  const careerHtml = (data.careerItems || []).map(item => `
      <li>
        <div class="t">${escapeHtml(item.title)}</div>
        <div class="s">${escapeHtml(item.subtitle)}</div>
      </li>
  `).join('');

  // Pre-generate hobbies
  const hobbiesHtml = (data.hobbies || []).map(h => `
      <div class="hobby"><span>${h.emoji || '✨'}</span>${escapeHtml(h.text)}</div>
  `).join('');

  // Pre-generate languages
  const languagesHtml = (data.languages || []).map(l => `
      <span class="lang">${escapeHtml(l)}</span>
  `).join('');

  // Pre-generate family members
  const familyHtml = (data.familyMembers || []).map(m => `
      <div class="fam ${m.isLate ? 'late' : ''}">
        <div class="av">${escapeHtml((m.name || 'F').trim().charAt(0).toUpperCase())}</div>
        <div class="rel">${escapeHtml(m.relation)}</div>
        <div class="nm">${escapeHtml(m.name)}</div>
        <div class="role">${escapeHtml(m.role || '')}</div>
      </div>
  `).join('');

  // Pre-generate photo gallery cards if more than 1 photo exists
  const galleryHtml = additionalPhotos.length > 0 ? `
  <section class="card">
    <div class="head">
      <div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg></div>
      <h2>Photo Gallery<small>Additional Photographs (${photoList.length} total)</small></h2>
    </div>
    <div class="gallery-grid">
      ${photoList.map((url, i) => `
        <div class="gallery-item ${i === 0 ? 'is-arch' : ''}">
          <img src="${url}" alt="Candidate photo ${i + 1}">
          ${i === 0 ? '<span class="arch-badge">Arch Portrait</span>' : ''}
        </div>
      `).join('')}
    </div>
  </section>` : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(data.fullName)} · ShubhParichay Biodata</title>
<meta name="description" content="Marriage biodata of ${escapeHtml(data.fullName)}: ${escapeHtml(data.profileTagline)}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='46' fill='%23f59e0b'/><circle cx='50' cy='50' r='30' fill='%23ea580c'/><circle cx='50' cy='50' r='14' fill='%23facc15'/></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=Poppins:wght@300;400;500;600&family=Tiro+Devanagari+Sanskrit&display=swap" rel="stylesheet">
<style>
  :root{
    --primary: ${theme.primary};
    --primary-d: ${theme.primaryDark};
    --secondary: ${theme.secondary};
    --gold: ${theme.accentGold};
    --gold-l: ${theme.goldLight};
    --cream: ${theme.bgCream};
    --card: ${theme.cardBg};
    --line: ${theme.borderColor};
    --ink: ${theme.ink};
    --muted: #7c5a48;
    --green: #2f855a;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{
    font-family:Poppins,system-ui,sans-serif; color:var(--ink); line-height:1.6;
    background:
      radial-gradient(1200px 600px at 50% -10%, #ffe4b0 0%, transparent 60%),
      radial-gradient(800px 500px at 0% 100%, #ffd5c2 0%, transparent 60%),
      radial-gradient(800px 500px at 100% 80%, #ffe9a8 0%, transparent 60%),
      var(--cream);
    min-height:100vh; overflow-x:hidden;
  }

  /* Petals */
  .petals{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden}
  .petal{position:absolute;top:-30px;width:14px;height:10px;border-radius:70% 0 70% 0;
    background:linear-gradient(135deg,#ffb347,#ff7a18);opacity:.75;animation:fall linear infinite}
  .petal.r{background:linear-gradient(135deg,#ff8fa3,#e0435e)}
  .petal.y{background:linear-gradient(135deg,#ffe066,#f5b301)}
  @keyframes fall{
    0%{transform:translate3d(0,-30px,0) rotate(0)}
    25%{transform:translate3d(30px,25vh,0) rotate(120deg)}
    50%{transform:translate3d(-20px,50vh,0) rotate(220deg)}
    75%{transform:translate3d(25px,75vh,0) rotate(320deg)}
    100%{transform:translate3d(-10px,105vh,0) rotate(420deg)}
  }

  /* Layout */
  .wrap{position:relative;z-index:2;max-width:820px;margin:0 auto;padding:44px 16px 120px}
  .shloka{text-align:center;font-family:"Tiro Devanagari Sanskrit",serif;color:var(--primary);
    font-size:1.25rem;letter-spacing:.04em;margin-top:12px;font-weight:600}
  .kalash{display:block;width:110px;height:auto;margin:0 auto 2px;
    filter:drop-shadow(0 8px 12px rgba(201,150,43,.35))}

  /* Hero */
  .hero{margin-top:22px;position:relative;text-align:center;border-radius:28px;padding:40px 20px 34px;
    color:#fff;overflow:hidden;
    background: radial-gradient(circle at 50% 0%,rgba(255,214,120,.35),transparent 55%), ${theme.heroBg};
    box-shadow:0 20px 50px -15px rgba(122,31,43,.45)}
  .hero::before,.hero::after{content:"";position:absolute;width:260px;height:260px;opacity:.13;
    background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-50 -50 100 100'%3E%3Cg fill='none' stroke='%23ffd27a' stroke-width='1.2'%3E%3Ccircle r='46'/%3E%3Ccircle r='34'/%3E%3Ccircle r='12'/%3E%3Cg id='p'%3E%3Cpath d='M0-12 C8-22 8-30 0-44 C-8-30-8-22 0-12Z'/%3E%3C/g%3E%3Cuse href='%23p' transform='rotate(30)'/%3E%3Cuse href='%23p' transform='rotate(60)'/%3E%3Cuse href='%23p' transform='rotate(90)'/%3E%3Cuse href='%23p' transform='rotate(120)'/%3E%3Cuse href='%23p' transform='rotate(150)'/%3E%3Cuse href='%23p' transform='rotate(180)'/%3E%3Cuse href='%23p' transform='rotate(210)'/%3E%3Cuse href='%23p' transform='rotate(240)'/%3E%3Cuse href='%23p' transform='rotate(270)'/%3E%3Cuse href='%23p' transform='rotate(300)'/%3E%3Cuse href='%23p' transform='rotate(330)'/%3E%3C/g%3E%3C/svg%3E") center/contain no-repeat;
    animation:spin 60s linear infinite}
  .hero::before{top:-90px;left:-90px}
  .hero::after{bottom:-90px;right:-90px;animation-direction:reverse}
  @keyframes spin{to{transform:rotate(360deg)}}

  .portrait{--w:180px;position:relative;width:var(--w);margin:0 auto}
  .rays{position:absolute;left:50%;top:calc(var(--w)/2);width:calc(var(--w)*1.9);height:calc(var(--w)*1.9);transform:translate(-50%,-50%);pointer-events:none}
  .arch{position:relative;aspect-ratio:4/5;border-radius:calc(var(--w)/2) calc(var(--w)/2) 18px 18px;overflow:hidden;
    border:4px solid var(--gold-l);
    box-shadow:0 0 0 3px rgba(255,255,255,.35),0 0 0 10px rgba(243,211,138,.22),0 0 44px rgba(255,200,100,.75),0 18px 36px rgba(0,0,0,.4)}
  .arch img{width:100%;height:100%;object-fit:cover;object-position:50% 20%;display:block}
  .photo-btn{position:absolute;top:50%;transform:translateY(-50%);z-index:25;width:34px;height:34px;border-radius:50%;border:2px solid #ffd77a;background:linear-gradient(135deg,#f59e0b,#d97706);color:#1c1917;font-size:16px;font-weight:bold;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.45);transition:all .2s}
  .photo-btn.prev{left:-20px}
  .photo-btn.next{right:-20px}
  .photo-btn:hover:not(:disabled){transform:translateY(-50%) scale(1.1);background:#fbbf24}
  .photo-btn:disabled,.photo-btn.disabled{opacity:.25;cursor:not-allowed;pointer-events:none}
  .photo-count{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);padding:2px 8px;border-radius:999px;font-size:10px;font-weight:600;background:rgba(0,0,0,.75);color:#ffd77a;border:1px solid rgba(255,215,122,.4);white-space:nowrap}
  @media print{.photo-btn,.photo-count{display:none !important}}

  .vansh{display:inline-flex;align-items:center;gap:8px;margin-top:14px;padding:4px 18px 4px 8px;border-radius:999px;
    font-family:"Tiro Devanagari Sanskrit",serif;font-size:1.15rem;line-height:1.4;color:var(--primary-d);
    background:linear-gradient(180deg,#fff0bf,#f3c25a);box-shadow:0 0 0 1px rgba(255,255,255,.5),0 6px 16px -6px rgba(0,0,0,.45)}

  .script{font-family:"Great Vibes",cursive;font-size:2rem;color:var(--gold-l);margin-top:14px;line-height:1}
  .name{font-family:"Playfair Display",serif;font-weight:700;font-size:clamp(2.1rem,7vw,3.2rem);line-height:1.15;
    background:linear-gradient(180deg,#fff6dc 0%,#ffd77a 55%,#f0b13a 100%);
    -webkit-background-clip:text;background-clip:text;color:transparent;
    filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))}
  .tag{margin-top:6px;font-size:.95rem;color:#ffe8c2;font-weight:300}
  .chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:18px}
  .chip{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;font-size:.85rem;
    background:rgba(255,255,255,.12);border:1px solid rgba(255,215,130,.45);color:#fff3da;backdrop-filter:blur(4px)}
  .chip b{color:#ffd77a;font-weight:600}

  /* Gallery Grid */
  .gallery-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:12px;margin-top:12px}
  .gallery-item{position:relative;aspect-ratio:4/5;border-radius:14px;overflow:hidden;border:2px solid var(--line);box-shadow:0 4px 10px -4px rgba(0,0,0,.2)}
  .gallery-item.is-arch{border-color:var(--gold)}
  .gallery-item img{width:100%;height:100%;object-fit:cover;display:block}
  .arch-badge{position:absolute;top:6px;left:6px;background:var(--gold);color:#000;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px}

  /* Cards */
  .card{position:relative;margin-top:26px;background:var(--card);border-radius:22px;padding:26px 22px 22px;
    border:1px solid var(--line);box-shadow:0 12px 30px -18px rgba(0,0,0,.2)}
  .card::before{content:"";position:absolute;inset:6px;border-radius:17px;border:1px dashed #ecd2a0;pointer-events:none}
  .head{display:flex;align-items:center;gap:12px;margin-bottom:16px}
  .head .ico{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:#fff;
    background:linear-gradient(135deg,var(--secondary),var(--primary));box-shadow:0 6px 14px -6px rgba(0,0,0,.4)}
  .head .ico svg{width:20px;height:20px}
  .head h2{font-family:"Playfair Display",serif;font-size:1.45rem;color:var(--primary);line-height:1.1}
  .head h2 small{display:block;font-family:Poppins,sans-serif;font-size:.72rem;letter-spacing:.18em;
    text-transform:uppercase;color:var(--gold);font-weight:500;margin-top:3px}
  .head::after{content:"";flex:1;height:2px;margin-left:6px;
    background:linear-gradient(90deg,var(--gold-l),transparent)}

  .about{font-size:1rem;color:var(--ink);line-height:1.7}
  .grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px}
  .item{background:linear-gradient(180deg,#fff,#fff8ec);border:1px solid #f3e0bd;border-radius:14px;padding:12px 14px;
    transition:transform .2s,box-shadow .2s}
  .item:hover{transform:translateY(-2px);box-shadow:0 8px 16px -8px rgba(0,0,0,.2)}
  .item .k{font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:var(--gold);font-weight:600}
  .item .v{font-size:1rem;font-weight:500;color:var(--ink);margin-top:2px}
  .badge{display:inline-block;padding:1px 10px;border-radius:999px;font-size:.8rem;font-weight:600;
    background:#e6f4e2;color:var(--green);border:1px solid #bfe0b6}

  .timeline{list-style:none;position:relative;padding-left:26px}
  .timeline::before{content:"";position:absolute;left:8px;top:6px;bottom:6px;width:2px;
    background:linear-gradient(var(--secondary),var(--gold-l))}
  .timeline li{position:relative;margin-bottom:18px}
  .timeline li:last-child{margin-bottom:0}
  .timeline li::before{content:"";position:absolute;left:-24px;top:5px;width:14px;height:14px;border-radius:50%;
    background:#fff;border:3px solid var(--secondary);box-shadow:0 0 0 4px #fff2db}
  .timeline .t{font-weight:600;color:var(--primary);font-size:1.05rem}
  .timeline .s{font-size:.92rem;color:var(--muted);margin-top:2px}

  .hobbies{display:flex;flex-wrap:wrap;gap:10px}
  .hobby{display:flex;align-items:center;gap:10px;padding:10px 16px 10px 10px;border-radius:999px;
    background:#fff;border:1px solid #f1dcb6;font-weight:500;font-size:.95rem}
  .hobby span{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:1.15rem;
    background:linear-gradient(135deg,#fff1cf,#ffd9a0)}
  .langs{margin-top:14px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:.9rem;color:var(--muted)}
  .lang{padding:3px 12px;border-radius:999px;background:var(--primary);color:#ffe6b8;font-size:.82rem}

  .family{display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:14px}
  .fam{text-align:center;padding:18px 12px;border-radius:16px;background:linear-gradient(180deg,#fff,#fff4e0);
    border:1px solid #f1dcb6;position:relative}
  .fam .av{width:50px;height:50px;margin:0 auto 8px;border-radius:50%;display:grid;place-items:center;
    font-family:"Playfair Display",serif;font-size:1.25rem;font-weight:700;color:#fff;
    background:linear-gradient(135deg,var(--primary),#b23a48);box-shadow:0 0 0 3px #fff,0 0 0 5px var(--gold-l)}
  .fam .rel{font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);font-weight:600}
  .fam .nm{font-weight:600;color:var(--ink);line-height:1.3;margin-top:2px}
  .fam .role{font-size:.85rem;color:var(--muted)}
  .fam.late .av{background:linear-gradient(135deg,#8a7a6a,#5e5146)}

  .contact{display:grid;gap:12px}
  .cbtn{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:16px;text-decoration:none;color:var(--ink);
    background:#fff;border:1px solid #f1dcb6;transition:transform .2s,box-shadow .2s}
  .cbtn:hover{transform:translateY(-2px);box-shadow:0 12px 22px -14px rgba(0,0,0,.3)}
  .cbtn .ci{flex:none;width:44px;height:44px;border-radius:12px;display:grid;place-items:center;color:#fff}
  .cbtn .ci svg{width:22px;height:22px}
  .cbtn .ck{font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:var(--gold);font-weight:600}
  .cbtn .cv{font-size:.95rem;font-weight:500;word-break:break-word}
  .bg-mail{background:linear-gradient(135deg,#e2650f,#f5a524)}
  .bg-call{background:linear-gradient(135deg,#2f855a,#48bb78)}
  .bg-home{background:linear-gradient(135deg,var(--primary),#b23a48)}
  .bg-vil{background:linear-gradient(135deg,#8b5e16,#c9962b)}

  .foot{text-align:center;margin-top:34px;color:var(--primary);font-family:"Tiro Devanagari Sanskrit",serif;font-size:1.1rem;font-weight:600}
  .foot small{display:block;font-family:Poppins,sans-serif;color:var(--muted);font-size:.85rem;margin-top:4px;font-weight:normal}

  /* Actions */
  .actions{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:40;display:flex;gap:10px;
    padding:8px;border-radius:999px;background:rgba(20,20,20,.85);backdrop-filter:blur(8px);box-shadow:0 14px 30px -10px rgba(0,0,0,.5)}
  .actions button{border:0;cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;
    font:600 .9rem Poppins,sans-serif;color:#3b1d14;background:linear-gradient(180deg,#ffe39a,#f5b33b)}
  .actions button.alt{background:transparent;color:#ffe6b8;border:1px solid rgba(255,214,130,.5)}
  .toast{position:fixed;left:50%;bottom:84px;transform:translate(-50%,20px);opacity:0;z-index:41;
    background:#111;color:#fff;padding:8px 18px;border-radius:999px;font-size:.85rem;transition:.3s;pointer-events:none}
  .toast.on{opacity:1;transform:translate(-50%,0)}

  @media print{
    @page{size:A4;margin:8mm}
    body{background:#fff}
    .petals,.actions,.toast{display:none!important}
    .wrap{padding:0;max-width:none}
    .hero,.card{break-inside:avoid;box-shadow:none}
    .hero,.head .ico,.cbtn .ci,.fam .av,.lang,.vansh{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .card{margin-top:14px}
    *{animation:none!important}
  }
</style>
</head>
<body>

${data.enablePetals ? '<div class="petals" id="petals" aria-hidden="true"></div>' : ''}

<main class="wrap">
  <!-- Kalash SVG -->
  <svg class="kalash" viewBox="0 0 120 140" aria-hidden="true">
    <defs>
      <linearGradient id="kb" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#a8721a"/><stop offset=".35" stop-color="#f7d27a"/>
        <stop offset=".6" stop-color="#e0a83a"/><stop offset="1" stop-color="#8f5f12"/>
      </linearGradient>
      <linearGradient id="kl" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#6fb24f"/><stop offset="1" stop-color="#2f6b2a"/>
      </linearGradient>
      <radialGradient id="kc" cx=".4" cy=".35" r=".7">
        <stop offset="0" stop-color="#b07a45"/><stop offset="1" stop-color="#5e3a1a"/>
      </radialGradient>
      <path id="leaf" d="M0 0 C8-10 10-30 0-46 C-10-30-8-10 0 0Z"/>
    </defs>
    <g fill="url(#kl)" stroke="#2f6b2a" stroke-width=".6">
      <use href="#leaf" transform="translate(60 60) rotate(-78)"/>
      <use href="#leaf" transform="translate(60 60) rotate(78)"/>
      <use href="#leaf" transform="translate(60 60) rotate(-52)"/>
      <use href="#leaf" transform="translate(60 60) rotate(52)"/>
      <use href="#leaf" transform="translate(60 60) rotate(-26)"/>
      <use href="#leaf" transform="translate(60 60) rotate(26)"/>
    </g>
    <ellipse cx="60" cy="42" rx="14" ry="18" fill="url(#kc)"/>
    <path d="M55 25 C57 20 63 20 65 25 C62 23 58 23 55 25Z" fill="#7a5230"/>
    <path d="M45 48 C50 40 70 40 75 48 L74 60 H46Z" fill="#c81e2e"/>
    <path d="M46 52 C52 47 68 47 74 52" fill="none" stroke="#ffd27a" stroke-width="1.4"/>
    <ellipse cx="60" cy="61" rx="22" ry="5" fill="url(#kb)" stroke="#8f5f12" stroke-width=".6"/>
    <path d="M45 63 H75 L72 76 H48Z" fill="url(#kb)"/>
    <path d="M47 68 H73" stroke="#d62828" stroke-width="2.4"/>
    <path d="M47.6 71 H72.4" stroke="#f5b301" stroke-width="2"/>
    <path d="M48 75 C22 80 14 106 28 122 C38 133 82 133 92 122 C106 106 98 80 72 75Z" fill="url(#kb)" stroke="#8f5f12" stroke-width=".8"/>
    <path d="M26 96 C40 101 80 101 94 96" fill="none" stroke="#fff3c4" stroke-width="1" stroke-dasharray="1.5 3" opacity=".9"/>
    <ellipse cx="42" cy="100" rx="5" ry="13" fill="#fff" opacity=".22"/>
    <g stroke="#a3172b" stroke-width="2.6" stroke-linecap="round" fill="none">
      <path d="M60 99 V119 M50 109 H70"/>
      <path d="M60 99 H67 M70 109 V116 M60 119 H53 M50 109 V102"/>
    </g>
    <g fill="#a3172b">
      <circle cx="54.5" cy="103.5" r="1.4"/><circle cx="65.5" cy="103.5" r="1.4"/>
      <circle cx="54.5" cy="114.5" r="1.4"/><circle cx="65.5" cy="114.5" r="1.4"/>
    </g>
    <path d="M44 128 H76 L72 134 H48Z" fill="url(#kb)" stroke="#8f5f12" stroke-width=".6"/>
  </svg>

  <p class="shloka">${escapeHtml(data.shloka)}</p>

  <!-- Hero Header -->
  <header class="hero">
    <div class="portrait">
      <svg class="rays" viewBox="-100 -100 200 200" aria-hidden="true">
        <defs>
          <radialGradient id="rg" r=".5">
            <stop offset=".3" stop-color="#ffe6a3" stop-opacity=".95"/>
            <stop offset="1" stop-color="#ffd27a" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle r="62" fill="#ffd27a" opacity=".18"/>
        <g fill="url(#rg)" id="rays"></g>
      </svg>
      ${photoList.length > 1 ? `
      <button type="button" class="photo-btn prev disabled" id="btnPrevPhoto" onclick="shiftPhoto(-1)" aria-label="Previous photo">&#10094;</button>
      ` : ''}
      <div class="arch">
        <img id="mainArchImg" src="${primaryPhoto}" alt="Photo of ${escapeHtml(data.fullName)}">
        ${photoList.length > 1 ? `<div class="photo-count" id="photoCountBadge">Photo 1 of ${photoList.length}</div>` : ''}
      </div>
      ${photoList.length > 1 ? `
      <button type="button" class="photo-btn next" id="btnNextPhoto" onclick="shiftPhoto(1)" aria-label="Next photo">&#10095;</button>
      ` : ''}
    </div>
    <p class="script">Biodata</p>
    <h1 class="name">${escapeHtml(data.fullName)}</h1>
    ${data.communityBadge ? `
    <div class="vansh">
      <svg viewBox="-16 -16 32 32" aria-hidden="true" style="width:24px;height:24px"><g fill="#d9480f"><circle r="6.5"/><path d="M0-15 2-9h-4z"/></g><circle r="3" fill="#ffd27a"/></svg>
      ${escapeHtml(data.communityBadge)}
    </div>` : ''}
    <p class="tag">${escapeHtml(data.profileTagline)}</p>
    <div class="chips">
      <span class="chip"><b>${age}</b> years</span>
      ${formattedHeight ? `<span class="chip"><b>${escapeHtml(formattedHeight)}</b> height</span>` : ''}
      ${data.birthPlace ? `<span class="chip">Born in <b>${escapeHtml(data.birthPlace)}</b></span>` : ''}
      ${data.manglik ? `<span class="chip"><b>${data.manglik === 'No' ? 'Non-Manglik' : data.manglik + ' Manglik'}</b></span>` : ''}
    </div>
  </header>

  <!-- Photo Gallery (if multiple photos exist) -->
  ${galleryHtml}

  <!-- About Me -->
  ${data.aboutMe ? `
  <section class="card">
    <div class="head">
      <div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.35-9.5-8.5C.9 9.6 2.4 5.5 6.2 5.1 8.4 4.9 10 6 12 8c2-2 3.6-3.1 5.8-2.9 3.8.4 5.3 4.5 3.7 7.4C19 16.65 12 21 12 21z"/></svg></div>
      <h2>About Me<small>A little introduction</small></h2>
    </div>
    <p class="about">${escapeHtml(data.aboutMe)}</p>
  </section>` : ''}

  <!-- Personal Details -->
  <section class="card">
    <div class="head">
      <div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg></div>
      <h2>Personal Details<small>Janma &amp; profile</small></h2>
    </div>
    <div class="grid">
      ${data.dobFormatted ? `<div class="item"><div class="k">Date of Birth</div><div class="v">${escapeHtml(data.dobFormatted)}</div></div>` : ''}
      ${data.birthTime ? `<div class="item"><div class="k">Birth Time</div><div class="v">${escapeHtml(data.birthTime)}</div></div>` : ''}
      ${data.birthPlace ? `<div class="item"><div class="k">Birth Place</div><div class="v">${escapeHtml(data.birthPlace)}</div></div>` : ''}
      <div class="item"><div class="k">Age</div><div class="v">${age} years</div></div>
      ${formattedHeight ? `<div class="item"><div class="k">Height</div><div class="v">${escapeHtml(formattedHeight)}</div></div>` : ''}
      ${data.manglik ? `<div class="item"><div class="k">Manglik</div><div class="v"><span class="badge">${escapeHtml(data.manglik)}</span></div></div>` : ''}
      ${data.gotra ? `<div class="item"><div class="k">Gotra</div><div class="v">${escapeHtml(data.gotra)}</div></div>` : ''}
      ${data.rashi ? `<div class="item"><div class="k">Rashi</div><div class="v">${escapeHtml(data.rashi)}</div></div>` : ''}
      ${data.nakshatra ? `<div class="item"><div class="k">Nakshatra</div><div class="v">${escapeHtml(data.nakshatra)}</div></div>` : ''}
      ${data.complexion ? `<div class="item"><div class="k">Complexion</div><div class="v">${escapeHtml(data.complexion)}</div></div>` : ''}
    </div>
  </section>

  <!-- Education & Career -->
  <section class="card">
    <div class="head">
      <div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg></div>
      <h2>Education &amp; Career<small>Learning and work</small></h2>
    </div>
    <ul class="timeline">
      ${careerHtml}
    </ul>
  </section>

  <!-- Interests -->
  <section class="card">
    <div class="head">
      <div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 2 3 6.5 7 .8-5.2 4.7 1.5 7L12 17.5 5.7 21l1.5-7L2 9.3l7-.8z"/></svg></div>
      <h2>Interests<small>What I enjoy</small></h2>
    </div>
    <div class="hobbies">
      ${hobbiesHtml}
    </div>
    ${languagesHtml ? `<div class="langs">Speaks ${languagesHtml}</div>` : ''}
  </section>

  <!-- Family Details -->
  <section class="card">
    <div class="head">
      <div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/></svg></div>
      <h2>Family<small>Parivar</small></h2>
    </div>
    <div class="family">
      ${familyHtml}
    </div>
  </section>

  <!-- Contact -->
  <section class="card">
    <div class="head">
      <div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg></div>
      <h2>Contact<small>Get in touch</small></h2>
    </div>
    <div class="contact">
      ${data.contacts?.phone ? `
      <a class="cbtn" href="tel:${escapeHtml(data.contacts.phone.replace(/\\s+/g,''))}">
        <span class="ci bg-call"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg></span>
        <span><span class="ck">${escapeHtml(data.contacts.phoneLabel || 'Phone')}</span><br><span class="cv">${escapeHtml(data.contacts.phone)}</span></span>
      </a>` : ''}
      ${data.contacts?.email ? `
      <a class="cbtn" href="mailto:${escapeHtml(data.contacts.email)}">
        <span class="ci bg-mail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg></span>
        <span><span class="ck">Email</span><br><span class="cv">${escapeHtml(data.contacts.email)}</span></span>
      </a>` : ''}
      ${data.contacts?.currentAddress ? `
      <a class="cbtn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.contacts.currentAddress)}" target="_blank" rel="noopener">
        <span class="ci bg-home"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg></span>
        <span><span class="ck">Current Address</span><br><span class="cv">${escapeHtml(data.contacts.currentAddress)}</span></span>
      </a>` : ''}
      ${data.contacts?.nativeAddress ? `
      <a class="cbtn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.contacts.nativeAddress)}" target="_blank" rel="noopener">
        <span class="ci bg-vil"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/></svg></span>
        <span><span class="ck">Native Address</span><br><span class="cv">${escapeHtml(data.contacts.nativeAddress)}</span></span>
      </a>` : ''}
    </div>
  </section>

  <p class="foot">${escapeHtml(data.footerBlessing || '॥ शुभम् भवतु ॥')}<small>${escapeHtml(data.footerNote || '')}</small></p>
</main>

<div class="actions">
  <button type="button" id="share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width:18px;height:18px"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>Share</button>
  <button type="button" class="alt" id="print"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width:18px;height:18px"><path d="M12 3v12m0 0-5-5m5 5 5-5"/><path d="M4 17v3h16v-3"/></svg>Save PDF</button>
</div>
<div class="toast" id="toast">Link copied</div>

<script>
  (function(){
    var g=document.getElementById('rays'), ns='http://www.w3.org/2000/svg';
    if(g){
      for(var i=0;i<32;i++){
        var p=document.createElementNS(ns,'path'), len=i%2?78:98;
        p.setAttribute('d','M0-'+len+' 3.2-40h-6.4z');
        p.setAttribute('transform','rotate('+(i*360/32)+')');
        g.appendChild(p);
      }
    }
  })();

  ${data.enablePetals ? `
  (function(){
    var p=document.getElementById('petals');
    if(p){
      var kinds=['','r','y'];
      for(var i=0;i<22;i++){
        var s=document.createElement('span'); s.className='petal '+kinds[i%3];
        s.style.left=(Math.random()*100)+'vw';
        s.style.animationDuration=(10+Math.random()*12)+'s';
        s.style.animationDelay=(-Math.random()*20)+'s';
        var sc=.7+Math.random()*.8; s.style.width=(14*sc)+'px'; s.style.height=(10*sc)+'px';
        p.appendChild(s);
      }
    }
  })();` : ''}

  var toast=document.getElementById('toast');
  function flash(m){if(toast){toast.textContent=m;toast.classList.add('on');setTimeout(function(){toast.classList.remove('on')},1800)}}
  document.getElementById('share').onclick=function(){
    var data={title:document.title,text:'Marriage Biodata',url:location.href};
    if(navigator.share){navigator.share(data).catch(function(){});}
    else if(navigator.clipboard){navigator.clipboard.writeText(location.href).then(function(){flash('Link copied')});}
  };
  document.getElementById('print').onclick=function(){window.print()};

  // Multiple photos carousel navigation
  var photoGallery = ${JSON.stringify(photoList)};
  var curPhotoIdx = 0;
  window.shiftPhoto = function(dir) {
    if (!photoGallery || photoGallery.length <= 1) return;
    curPhotoIdx = Math.max(0, Math.min(photoGallery.length - 1, curPhotoIdx + dir));
    var img = document.getElementById('mainArchImg');
    var badge = document.getElementById('photoCountBadge');
    var prev = document.getElementById('btnPrevPhoto');
    var next = document.getElementById('btnNextPhoto');
    if (img) img.src = photoGallery[curPhotoIdx];
    if (badge) badge.textContent = 'Photo ' + (curPhotoIdx + 1) + ' of ' + photoGallery.length;
    if (prev) {
      prev.disabled = curPhotoIdx === 0;
      if (curPhotoIdx === 0) prev.classList.add('disabled');
      else prev.classList.remove('disabled');
    }
    if (next) {
      next.disabled = curPhotoIdx === photoGallery.length - 1;
      if (curPhotoIdx === photoGallery.length - 1) next.classList.add('disabled');
      else next.classList.remove('disabled');
    }
  };
</script>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
