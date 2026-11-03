import json, re, os, glob

ROOT = os.path.dirname(os.path.abspath(__file__))
MAP = json.load(open(os.path.join(ROOT, 'map.json')))
def blob(k): return '/_blob/' + MAP[k]

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&amp;family=Manrope:wght@400;500;600;700&amp;family=Pinyon+Script&amp;display=swap" rel="stylesheet">'

CSS_B = """
body{margin:0;background:#4B141B}
a{color:#F2E7DE}a:hover{color:#EBCFC3}
.b *{box-sizing:border-box}
.b img{display:block;max-width:100%}
.b h1,.b h2,.b h3{margin:0;font-weight:400;font-family:'Libre Caslon Display',Georgia,serif}
.b p{margin:0}
.b :focus-visible{outline:2px solid #EBCFC3;outline-offset:3px}
.b-nav a{text-decoration:none;font-size:15px;font-weight:500;padding:10px 2px;color:#F2E7DE}
.b-nav a:hover,.b-nav a[aria-current]{color:#EBCFC3}
.b-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:0 26px;border-radius:2px;border:1px solid #EBCFC3;background:#EBCFC3;color:#4B141B;font:700 15px 'Manrope',sans-serif;text-decoration:none;cursor:pointer}
.b-btn:hover{background:#F2DCD2;color:#4B141B}
.b-btn:disabled{opacity:.45;cursor:not-allowed}
.b-line{background:transparent;color:#F2E7DE;border-color:#B07F80}
.b-line:hover{background:#F2E7DE;color:#4B141B;border-color:#F2E7DE}
.b-dark{background:#4B141B;color:#F2E7DE;border-color:#4B141B}
.b-dark:hover{background:#74343C;color:#F2E7DE}
.b-chip{min-height:44px;padding:0 16px;border:1px solid #8A4A52;border-radius:999px;background:transparent;color:#F2E7DE;font:500 14.5px 'Manrope',sans-serif;cursor:pointer;white-space:nowrap}
.b-chip:hover{border-color:#B07F80}
.b-chip[aria-pressed="true"]{background:#F2E7DE;color:#4B141B;border-color:#F2E7DE}
.b-pill{min-height:48px;padding:6px 16px;border:1px solid #8A4A52;border-radius:2px;background:transparent;color:#F2E7DE;font:500 15px 'Manrope',sans-serif;cursor:pointer;text-align:left;line-height:1.3}
.b-pill:hover{border-color:#B07F80}
.b-pill[aria-pressed="true"]{border-color:#EBCFC3;background:#5F2129;box-shadow:inset 0 0 0 1px #EBCFC3}
.b-pill:disabled{opacity:.4;cursor:not-allowed}
.b-day{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:88px;padding:12px;border:1px solid #74343C;border-radius:2px;background:transparent;color:#F2E7DE;font:500 14px 'Manrope',sans-serif;cursor:pointer;text-align:left}
.b-day:hover{border-color:#B07F80}
.b-day[aria-pressed="true"]{border-color:#EBCFC3;background:#5F2129}
.b-day:disabled{opacity:.42;cursor:not-allowed}
.b-in{width:100%;min-height:50px;border:1px solid #8A4A52;border-radius:2px;background:#5A1B23;color:#F2E7DE;padding:0 14px;font:500 15px 'Manrope',sans-serif}
textarea.b-in{padding:12px 14px;min-height:96px;resize:vertical}
.b-in::placeholder{color:#C0948F}
.b-lbl{display:block;font-size:13.5px;font-weight:600;color:#E6CFC6;margin-bottom:6px}
.b-ic{width:44px;height:44px;border:0;border-radius:999px;background:transparent;color:#F2E7DE;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.b-ic:hover{background:#5F2129}
.b-card img{transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.b-card:hover img{transform:scale(1.035)}
.b-fav{position:absolute;top:10px;right:10px;width:44px;height:44px;border-radius:999px;border:0;background:rgba(60,13,19,.72);color:#F2E7DE;display:flex;align-items:center;justify-content:center;cursor:pointer}
.b details{border-top:1px solid #74343C}
.b details:last-of-type{border-bottom:1px solid #74343C}
.b summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;min-height:56px;font-weight:600}
.b summary::-webkit-details-marker{display:none}
.b summary::after{content:'+';font-size:22px;font-weight:300;color:#EBCFC3}
.b details[open] summary::after{content:'\\2212'}
.b-sw{width:44px;height:44px;border-radius:999px;padding:0;border:1px solid rgba(255,255,255,.25);cursor:pointer}
.b-sw[aria-pressed="true"]{box-shadow:0 0 0 3px #4B141B,0 0 0 5px #EBCFC3}
.b-light .b-sw[aria-pressed="true"]{box-shadow:0 0 0 3px #F2E7DE,0 0 0 5px #4B141B}
.b-tab{min-height:44px;padding:0 14px;border:0;border-bottom:2px solid transparent;background:none;color:#D3B1AB;font:600 14.5px 'Manrope',sans-serif;cursor:pointer;white-space:nowrap}
.b-tab[aria-pressed="true"]{color:#F2E7DE;border-bottom-color:#EBCFC3}
.b-chk{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:50px;border-bottom:1px solid #74343C;font-size:15px;cursor:pointer}
@media (max-width:860px){.b-hide{display:none}}
@keyframes yk-fade5{0%{opacity:0}4%{opacity:1}20%{opacity:1}24%{opacity:0}100%{opacity:0}}
@keyframes yk-kb{0%{transform:scale(1.16) translate(1.5%,1%)}24%{transform:scale(1.02) translate(0,0)}100%{transform:scale(1.02)}}
@keyframes yk-rise{from{opacity:0;transform:translateY(.55em)}to{opacity:1;transform:none}}
@keyframes yk-up{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:none}}
@keyframes yk-line{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes yk-mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes yk-cue{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
@keyframes yk-glow{0%,100%{box-shadow:0 0 0 0 rgba(235,207,195,.45)}50%{box-shadow:0 0 0 10px rgba(235,207,195,0)}}
.yk-slide{position:absolute;inset:0;opacity:0;animation:yk-fade5 30s infinite}
.yk-slide img{width:100%;height:100%;object-fit:cover;animation:yk-kb 30s infinite;animation-delay:inherit}
.yk-cap{opacity:0;animation:yk-fade5 30s infinite}
.yk-w{display:inline-block;opacity:0;animation:yk-rise 1s cubic-bezier(.2,.7,.2,1) forwards}
.yk-in{opacity:0;animation:yk-up .9s cubic-bezier(.2,.7,.2,1) forwards}
.yk-gl{display:block;height:2px;background:#EBCFC3;transform-origin:left;transform:scaleX(0);animation:yk-line 1.2s 1.1s cubic-bezier(.2,.7,.2,1) forwards}
.yk-mqwrap{overflow:hidden}
.yk-mq{display:flex;width:max-content;animation:yk-mq var(--d,48s) linear infinite}
.yk-mq.rev{animation-direction:reverse}
.yk-mqwrap:hover .yk-mq,.yk-paused .yk-mq{animation-play-state:paused}
.yk-tile{position:relative;display:block;overflow:hidden;background:#561920;text-decoration:none}
.yk-tile img{width:100%;height:100%;object-fit:cover;transition:transform 1.1s cubic-bezier(.2,.7,.2,1),filter .6s}
.yk-tile:hover img,.yk-tile:focus-within img{transform:scale(1.07)}
.yk-tile .yk-act{opacity:0;transform:translateY(14px);transition:opacity .45s,transform .45s}
.yk-tile:hover .yk-act,.yk-tile:focus-within .yk-act{opacity:1;transform:none}
.yk-cue{position:relative;width:1px;height:56px;background:rgba(242,231,222,.25);overflow:hidden}
.yk-cue::after{content:'';position:absolute;inset:0;background:#EBCFC3;animation:yk-cue 1.8s ease-in-out infinite}
.yk-pulse{animation:yk-glow 2.4s ease-in-out infinite}
.yk-panel{position:relative;overflow:hidden;min-width:0;text-decoration:none;transition:flex-grow .8s cubic-bezier(.2,.7,.2,1)}
.yk-panel img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}
.yk-panel .yk-pi{opacity:0;transform:translateY(16px);transition:opacity .5s .2s,transform .5s .2s}
.yk-panel[data-open="true"] .yk-pi{opacity:1;transform:none}
.yk-panel[data-open="true"] .yk-pv{opacity:0}
.yk-pv{transition:opacity .3s}
@media (prefers-reduced-motion:reduce){.yk-slide,.yk-slide img,.yk-cap{animation:none}.yk-slide:first-child,.yk-cap:first-child{opacity:1}.yk-w,.yk-in{animation:none;opacity:1}.yk-gl{animation:none;transform:none}.yk-mq{animation:none}.yk-cue::after{animation:none}.yk-pulse{animation:none}.yk-panel,.yk-panel img,.yk-tile img{transition:none}}
.yk-stage{position:relative;overflow:hidden;background:#3A0E14}
.yk-sh-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.05);transition:opacity .7s ease,transform 1.4s cubic-bezier(.2,.7,.2,1)}
.yk-sh-img[data-on="true"]{opacity:1;transform:scale(1)}
.yk-rail{display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;padding:26px 2px 0;scrollbar-width:none;position:relative}
.yk-rail::-webkit-scrollbar{display:none}
.yk-thumb{flex:0 0 auto;scroll-snap-align:start;display:flex;flex-direction:column;gap:8px;width:150px;padding:0 0 14px;border:0;background:none;color:#F2E7DE;text-align:left;cursor:pointer;opacity:.5;transition:opacity .35s ease,transform .45s cubic-bezier(.2,.7,.2,1);font:inherit}
.yk-thumb img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block;box-shadow:0 14px 18px -14px rgba(20,4,7,.9)}
.yk-thumb:hover{opacity:.85}
.yk-thumb[aria-pressed="true"]{opacity:1;transform:translateY(-10px)}
.yk-thumb:focus-visible{outline:2px solid #EBCFC3;outline-offset:4px}
.yk-shelf{height:1px;background:linear-gradient(90deg,rgba(235,207,195,0),#B07F80 12%,#B07F80 88%,rgba(235,207,195,0))}
@media (prefers-reduced-motion:reduce){.yk-sh-img,.yk-thumb{transition:none}}
.mj-room{position:relative;overflow:hidden;background:radial-gradient(ellipse 70% 60% at 50% 68%,#5A1C24 0%,#3A0E14 52%,#22060A 100%)}
.mj-stage{position:relative;outline:none}
.mj-rail{position:absolute;left:0;right:0;top:0;height:6px;background:linear-gradient(#1A0407,#2E0A10);box-shadow:0 2px 6px rgba(0,0,0,.5)}
.mj-top{position:absolute;left:-2%;right:-2%;background-size:900px auto;clip-path:polygon(5% 0,95% 0,100% 100%,0 100%)}
.mj-top::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,4,7,.72) 0%,rgba(20,4,7,.25) 55%,rgba(255,220,200,.06) 100%)}
.mj-edge{position:absolute;left:-2%;right:-2%;background-size:900px auto;filter:brightness(.55)}
.mj-edge::after{content:"";position:absolute;left:0;right:0;top:100%;height:60px;background:linear-gradient(rgba(10,2,4,.75),rgba(10,2,4,0))}
.mj-slot{position:absolute;transform:translateX(-50%);pointer-events:none}
.mj-fix{position:absolute;left:50%;top:6px;width:22px;height:12px;margin-left:-11px;border-radius:0 0 11px 11px;background:linear-gradient(#3A1418,#1B0508);box-shadow:inset 0 -3px 0 rgba(255,226,205,calc(.15 + var(--glow)*.7)),0 4px calc(4px + var(--glow)*18px) rgba(255,214,190,calc(var(--glow)*.55));transition:box-shadow .5s ease}
.mj-beam{position:absolute;left:50%;top:16px;transform:translateX(-50%);background:linear-gradient(180deg,rgba(255,232,214,.30),rgba(255,226,205,.10) 70%,rgba(255,226,205,.0));clip-path:polygon(46% 0,54% 0,100% 100%,0 100%);opacity:calc(var(--glow)*.9);mix-blend-mode:screen;transition:opacity .55s ease;pointer-events:none}
.mj-pool{position:absolute;left:50%;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(closest-side,rgba(255,216,190,.55),rgba(255,206,178,.18) 55%,rgba(255,206,178,0));opacity:calc(.08 + var(--glow)*.92);mix-blend-mode:screen;transition:opacity .55s ease}
.mj-shadow{position:absolute;left:50%;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(closest-side,rgba(12,2,4,.75),rgba(12,2,4,0))}
.mj-cake{position:absolute;left:50%;bottom:0;padding:0;border:0;background:none;cursor:pointer;pointer-events:auto;transform:translate(calc(-50% + var(--tx)),var(--lift));transition:transform .7s cubic-bezier(.2,.75,.2,1)}
.mj-cake img{display:block;width:100%;height:100%;object-fit:contain;object-position:50% 100%;filter:brightness(.24) saturate(.5);transition:filter .55s ease}
.mj-cake[aria-pressed="true"] img{filter:brightness(1.05) saturate(1.05)}
.mj-cake:hover img{filter:brightness(.5) saturate(.75)}
.mj-cake[aria-pressed="true"]:hover img{filter:brightness(1.08) saturate(1.06)}
.mj-cake:focus-visible{outline:2px solid #EBCFC3;outline-offset:6px}
.mj-tag{display:inline-flex;align-items:center;gap:8px;border:1px solid #8A4A52;border-radius:999px;padding:4px 12px;font-size:13px;color:#E6CFC6;font-variant-numeric:tabular-nums}
.mj-tag::before{content:"";width:6px;height:6px;border-radius:50%;background:#EBCFC3}
.mj-dot{height:7px;border-radius:999px;border:0;padding:0;background:#8A4A52;cursor:pointer;transition:width .3s ease,background .3s ease}
.mj-dot[aria-pressed="true"]{background:#EBCFC3}
.mj-dialog{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:24px;overflow-y:auto}
.mj-backdrop{position:fixed;inset:0;background:rgba(30,5,9,.97);backdrop-filter:blur(14px);animation:mj-fade .3s ease both}
.mj-fig{animation:mj-lift .75s cubic-bezier(.22,.85,.3,1) both;transform-origin:50% 100%}
.mj-fig img{transition:transform .5s cubic-bezier(.2,.75,.2,1);transform-origin:50% 100%}
.mj-info{animation:mj-rise .55s .15s ease both}
@keyframes mj-lift{0%{opacity:0;transform:translateY(70px) scale(.82) rotate(-2deg)}55%{opacity:1;transform:translateY(-14px) scale(1.02) rotate(1deg)}100%{opacity:1;transform:none}}
@keyframes mj-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes mj-fade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.mj-cake,.mj-cake img,.mj-beam,.mj-pool,.mj-fix,.mj-fig img,.mj-dot{transition:none}.mj-fig,.mj-info,.mj-backdrop{animation:none}}
@media (prefers-reduced-motion:reduce){.b *{transition:none!important}}
"""

CSS_ADMIN = """
body{margin:0;background:#F6F2EC}
a{color:#1E1611}a:hover{color:#8C6A33}
.ad *{box-sizing:border-box}
.ad img{display:block;max-width:100%}
.ad h1,.ad h2,.ad h3{margin:0}
.ad p{margin:0}
.ad :focus-visible{outline:2px solid #8C6A33;outline-offset:2px}
.ad-nav a{display:flex;align-items:center;gap:12px;min-height:42px;padding:0 12px;border-radius:8px;text-decoration:none;color:#E2CEC6;font-size:14.5px;font-weight:500}
.ad-nav a:hover{background:#5F2129;color:#fff}
.ad-nav a[aria-current="page"]{background:#74343C;color:#fff}
.ad-card{background:#fff;border:1px solid #E6DDD2;border-radius:12px}
.ad-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;padding:0 16px;border-radius:8px;border:1px solid #4B141B;background:#4B141B;color:#fff;font:600 14px 'Manrope',sans-serif;cursor:pointer;text-decoration:none;white-space:nowrap}
.ad-btn:hover{background:#74343C;color:#fff}
.ad-btn2{background:#fff;color:#1E1611;border-color:#E2CEC6}
.ad-btn2:hover{background:#F3EDE5;color:#1E1611}
.ad-danger{background:#fff;color:#8E2620;border-color:#E9B8B3}
.ad-danger:hover{background:#FBE3E1;color:#8E2620}
.ad-in{width:100%;min-height:42px;border:1px solid #E2CEC6;border-radius:8px;background:#fff;padding:0 12px;font:500 14px 'Manrope',sans-serif;color:#1E1611}
textarea.ad-in{padding:10px 12px;min-height:90px;resize:vertical}
.ad-lbl{display:block;font-size:13px;font-weight:600;color:#7E3F47;margin-bottom:6px}
.ad-tab{min-height:40px;padding:0 12px;border:0;border-radius:8px;background:transparent;font:600 13.5px 'Manrope',sans-serif;color:#6B5B4E;cursor:pointer;white-space:nowrap}
.ad-tab:hover{background:#EFE7DD}
.ad-tab[aria-pressed="true"]{background:#4B141B;color:#fff}
.ad-row{width:100%;display:grid;align-items:center;gap:12px;padding:12px 16px;border:0;border-top:1px solid #EFE7DD;background:#fff;font:500 14px 'Manrope',sans-serif;color:#1E1611;text-align:left;cursor:pointer}
.ad-row:hover{background:#FBF8F4}
.ad-row[aria-pressed="true"]{background:#F6EFE5;box-shadow:inset 3px 0 0 #8C6A33}
.ad-badge{display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:999px;font-size:12.5px;font-weight:600;white-space:nowrap}
.ad-tog{position:relative;width:44px;height:26px;border-radius:999px;border:0;background:#E2CEC6;cursor:pointer;flex:none}
.ad-tog[aria-pressed="true"]{background:#2F6B3A}
.ad-tog span{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:999px;background:#fff;transition:left .15s}
.ad-tog[aria-pressed="true"] span{left:21px}
.ad-th{font-size:12.5px;font-weight:600;color:#6B5B4E}
@media (prefers-reduced-motion:reduce){.ad *{transition:none!important}}
"""

ICON = {
 'cart': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2L5 8z"></path><path d="M9 8V6a3 3 0 016 0v2"></path></svg>',
 'user': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"></path></svg>',
 'search': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>',
 'menu': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 8h16M4 16h16"></path></svg>',
 'back': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>',
 'wa': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-4-1.1L4 20z"></path></svg>',
}

def hdr_d(active):
    links = [('koleksi', 'Katalog_D.dc.html', 'Koleksi'), ('reka', 'Reka_D.dc.html', 'Reka kek'), ('slot', 'Main.dc.html#slot', 'Tarikh kosong'), ('tentang', 'Main.dc.html#tentang', 'Tentang kami')]
    nav = ''.join(f'<a href="{h}"{" aria-current=\"page\"" if k == active else ""}>{t}</a>' for k, h, t in links)
    return f'''<header style="border-bottom: 1px solid #74343C; background: #4B141B">
<div style="max-width: 1360px; margin: 0 auto; padding: 0 40px; height: 96px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 24px">
<nav class="b-nav b-hide" aria-label="Menu utama" style="display: flex; gap: 28px">{nav}</nav>
<a href="Main.dc.html" aria-label="Yummy Kuantan, laman utama" style="display: block; line-height: 0"><img src="@@LOGO_C@@" alt="Yummy Kuantan" style="height: 76px; width: auto"></a>
<div style="display: flex; justify-content: flex-end; align-items: center; gap: 6px">
<a class="b-ic" href="Katalog_D.dc.html" aria-label="Cari kek">{ICON['search']}</a>
<a class="b-ic" href="#akaun" aria-label="Akaun saya">{ICON['user']}</a>
<a href="Checkout_D.dc.html" style="display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 14px; border: 1px solid #8A4A52; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14.5px">{ICON['cart']}Senarai ({{{{cart}}}})</a>
</div>
</div>
</header>'''

FTR_D = '''<footer style="border-top: 1px solid #74343C; background: #3F1017">
<div style="max-width: 1360px; margin: 0 auto; padding: 56px 40px 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; font-size: 15px; color: #D3B1AB">
<div><img src="@@LOGO_C@@" alt="Yummy Kuantan" style="height: 110px; width: auto"><p style="margin-top: 14px">[Alamat dapur], Kuantan, Pahang</p><p>[Waktu operasi]</p></div>
<div><p style="color: #F2E7DE; font-weight: 600">Kek</p><p style="margin-top: 8px">Kek batik</p><p>Brownies dan bar</p><p>Italian cake</p><p>Kek kahwin</p></div>
<div><p style="color: #F2E7DE; font-weight: 600">Bantuan</p><p style="margin-top: 8px">Cara tempah</p><p>Semak tempahan</p><p>Polisi warna dan rekaan</p><p>Polisi pembatalan</p></div>
<div><p style="color: #F2E7DE; font-weight: 600">Hubungi</p><p style="margin-top: 8px"><a href="https://wa.me/601123023447" style="color: #D3B1AB">WhatsApp +60 11-2302 3447</a></p><p><a href="https://instagram.com/yummykuantan" style="color: #D3B1AB">Instagram @yummykuantan</a></p><p><a href="https://www.tiktok.com/@yummykuantan" style="color: #D3B1AB">TikTok @yummykuantan</a></p></div>
</div>
<div style="max-width: 1360px; margin: 0 auto; padding: 16px 40px 28px; border-top: 1px solid #64262E; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 13.5px; color: #C0948F"><span>© 2026 Yummy Kuantan</span><span>Terma, Privasi</span></div>
</footer>'''

def hdr_p(back=None, title=None):
    if back:
        return f'''<header style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-bottom: 1px solid #74343C; background: #4B141B; position: relative">
<a class="b-ic" href="{back}" aria-label="Kembali">{ICON['back']}</a>
<p style="font-family: 'Libre Caslon Display', serif; font-size: 21px">{title}</p>
<a class="b-ic" href="Troli_P.dc.html" aria-label="Senarai tempahan, {{{{cart}}}} kek" style="position: relative">{ICON['cart']}<span style="position: absolute; top: 5px; right: 3px; min-width: 18px; height: 18px; border-radius: 999px; background: #EBCFC3; color: #4B141B; font-size: 11px; font-weight: 700; line-height: 18px; text-align: center">{{{{cart}}}}</span></a>
</header>'''
    return f'''<header style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-bottom: 1px solid #74343C; background: #4B141B">
<button class="b-ic" aria-label="Buka menu">{ICON['menu']}</button>
<a href="Home_P.dc.html" aria-label="Yummy Kuantan, laman utama" style="display: block; line-height: 0"><img src="@@LOGO_C@@" alt="Yummy Kuantan" style="height: 50px; width: auto"></a>
<a class="b-ic" href="Troli_P.dc.html" aria-label="Senarai tempahan, {{{{cart}}}} kek" style="position: relative">{ICON['cart']}<span style="position: absolute; top: 5px; right: 3px; min-width: 18px; height: 18px; border-radius: 999px; background: #EBCFC3; color: #4B141B; font-size: 11px; font-weight: 700; line-height: 18px; text-align: center">{{{{cart}}}}</span></a>
</header>'''

FTR_P = '''<footer style="border-top: 1px solid #74343C; padding: 28px 20px 120px; color: #D3B1AB; font-size: 14.5px; background: #3F1017">
<img src="@@LOGO_C@@" alt="Yummy Kuantan" style="height: 92px; width: auto">
<p style="margin-top: 8px">[Alamat dapur], Kuantan</p><p>Penghantaran: Kuantan dan Pekan</p><p style="margin-top: 10px"><a href="https://wa.me/601123023447" style="color: #D3B1AB">WhatsApp +60 11-2302 3447</a></p><p><a href="https://instagram.com/yummykuantan" style="color: #D3B1AB">Instagram @yummykuantan</a></p><p><a href="https://www.tiktok.com/@yummykuantan" style="color: #D3B1AB">TikTok @yummykuantan</a></p>
</footer>'''

ADMIN_NAV = [('dash', 'Admin_Dash.dc.html', 'Papan pemuka', 'M4 13h6V4H4zM14 20h6v-9h-6zM14 4h6v4h-6zM4 20h6v-3H4z'),
             ('tempahan', 'Admin_Tempahan.dc.html', 'Tempahan', 'M5 4h14v16H5zM9 9h6M9 13h6M9 17h4'),
             ('kalendar', 'Admin_Kalendar.dc.html', 'Kalendar dan kapasiti', 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4'),
             ('produk', 'Admin_Produk.dc.html', 'Produk', 'M4 20h16v-8H4zM6 12V9h12v3M12 9V5'),
             ('reka', 'Admin_Reka3D.dc.html', 'Pilihan reka 3D', 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5'),
             ('kandungan', 'Admin_Kandungan.dc.html', 'Kandungan laman', 'M4 5h16v14H4zM8 9h8M8 13h5'),
             ('pelanggan', '#pelanggan', 'Pelanggan', 'M8 11a3 3 0 100-6 3 3 0 000 6zM2 20c.8-3 3-5 6-5s5.2 2 6 5M16 11a3 3 0 100-6M18 15c2 .6 3.4 2.4 4 5'),
             ('promosi', '#promosi', 'Promosi', 'M4 12l8-8h8v8l-8 8zM15 9h.01'),
             ('laporan', '#laporan', 'Laporan', 'M5 20V10M12 20V4M19 20v-7')]

def sidebar(active):
    items = ''.join(f'<a href="{h}"{" aria-current=\"page\"" if k == active else ""}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="{d}"></path></svg>{t}</a>' for k, h, t, d in ADMIN_NAV)
    return f'''<aside aria-label="Menu admin" style="flex: 0 0 248px; background: #4B141B; color: #F2E7DE; padding: 22px 14px; display: flex; flex-direction: column; gap: 20px">
<div style="padding: 0 10px; display: flex; align-items: center; gap: 12px"><img src="@@LOGO_C@@" alt="" style="height: 58px; width: auto"><div><p style="font-family: 'Libre Caslon Display', serif; font-size: 20px; line-height: 1.1">Yummy Kuantan</p><p style="font-size: 12.5px; color: #D3B1AB">Panel admin</p></div></div>
<nav class="ad-nav" style="display: flex; flex-direction: column; gap: 2px">{items}</nav>
<div style="margin-top: auto; padding: 12px; border-top: 1px solid #74343C; font-size: 13px; color: #D3B1AB"><p style="color: #F2E7DE; font-weight: 600">[Nama pemilik]</p><p>Pentadbir</p></div>
</aside>'''

def admin_top(title, sub):
    return f'''<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px">
<div><p style="font-size: 13px; color: #6B5B4E">{sub}</p><h1 style="font-family: 'Libre Caslon Display', serif; font-weight: 400; font-size: 36px; margin-top: 2px">{title}</h1></div>
<div style="display: flex; gap: 8px; align-items: center"><label for="ad-q" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Cari</label><input id="ad-q" class="ad-in" placeholder="Cari tempahan, pelanggan, produk" style="width: 300px"><span style="font-size: 13.5px; color: #6B5B4E; white-space: nowrap">Selasa, 3 Nov 2026</span></div>
</div>'''

# ---------------- product data (from WhatsApp catalogue) ----------------
P = [
 # id, name, cat, sizes [(label, price)], desc
 ('01', 'Kekbatik Indulgence Cheese', 'Kek batik', [('7 inci', 55), ('10 inci', 110)], 'Kek batik berlapis cheese dan ganache coklat.'),
 ('20', 'Kekbatik 7x14 inci', 'Kek batik', [('7x14 inci', 160)], 'Saiz dulang panjang untuk majlis dan jamuan.'),
 ('22', 'Kekbatik Mewah', 'Kek batik', [('Satu saiz', 120)], 'Mascarpone cheese, mentega tulen dan ganache coklat couverture.'),
 ('26', 'Kekbatik Mewah Resipi Mr Ali', 'Kek batik', [('Satu saiz', 110)], 'Coklat couverture, mascarpone dan mentega tulen.'),
 ('27', 'Kekbatik Indulgence Matcha', 'Kek batik', [('Satu saiz', 65)], 'Kek batik dengan lapisan matcha.'),
 ('29', 'Kekbatik Ganache', 'Kek batik', [('7 inci', 48), ('10 inci', 95)], 'Tiada lapisan cheese, hanya lapisan ganache coklat.'),
 ('33', 'Kekbatik Crunchy', 'Kek batik', [('8 inci', 50)], 'Menggunakan mentega tulen.'),
 ('34', 'Kekbatik Cadbury', 'Kek batik', [('7 inci', 50), ('10 inci', 90)], 'Kek batik dengan coklat Cadbury.'),
 ('05', 'Brownies Petak', 'Brownies dan bar', [('Ikut hiasan', 70)], 'Harga bergantung jenis hiasan kek.'),
 ('17', 'Brownies', 'Brownies dan bar', [('7 inci', 60), ('10 inci', 120)], 'Brownies coklat dengan hiasan.'),
 ('28', 'Brownies Plain', 'Brownies dan bar', [('7 inci', 45), ('10 inci', 80)], 'Brownies tanpa hiasan.'),
 ('32', 'Brownies Tower', 'Brownies dan bar', [('Satu set', 95)], 'Termasuk kotak lutsinar.'),
 ('25', 'Congo Bars', 'Brownies dan bar', [('Choc chip', 50), ('Walnut', 55)], 'Pilihan choc chip atau walnut.'),
 ('04', 'Italian Cake', 'Italian cake', [('6 inci', 100), ('8 inci', 280), ('10 inci', 380)], 'Kek krim gaya vintage dengan strawberi segar di atas.'),
 ('07', 'Italian Cake Full Strawberry', 'Italian cake', [('12 inci', 500)], 'Penuh strawberi segar di atas.'),
 ('15', 'Tall Cake Italian', 'Italian cake', [('7 inci', 250)], 'Kek tinggi gaya Italian.'),
 ('16', 'Burnt Cheese Cake Italian', 'Italian cake', [('6 inci', 80), ('8 inci', 190)], 'Termasuk topper nama custom.'),
 ('06', 'Italian Wedding Cake 2 Tingkat', 'Kek kahwin', [('2 tingkat', 350)], 'Kek kahwin dua tingkat gaya Italian.'),
 ('09', '2 Tier Wedding Cake', 'Kek kahwin', [('2 tingkat', 350)], 'Kek kahwin dua tingkat.'),
 ('12', 'Italian Cake Wedding 12 inci', 'Kek kahwin', [('12 inci', 400)], 'Kek kahwin satu tingkat besar.'),
 ('18', '1 Tier Wedding Cake', 'Kek kahwin', [('7 inci', 150)], 'Kek kahwin satu tingkat.'),
 ('21', 'Tiramisu Wedding 12 inci', 'Kek kahwin', [('12 inci', 250)], 'Tidak termasuk topper nama custom.'),
 ('08', 'Kek Petak Sponge', 'Hari jadi dan majlis', [('12 inci', 130)], '1 lapisan. Pilihan sponge vanila, pandan atau coklat.'),
 ('10', 'Birthday Cake', 'Hari jadi dan majlis', [('6 inci', 150), ('8 inci', 250)], '8 inci lebih kurang 3.5 kg.'),
 ('11', 'Vintage Love Cake', 'Hari jadi dan majlis', [('6 inci', 110)], 'Kek gaya vintage.'),
 ('19', 'Slice Cake', 'Hari jadi dan majlis', [('10 inci', 80)], 'Kek dulang untuk dipotong.'),
 ('03', 'Victoria Sandwich Cake 8 inci', 'Kek mentega', [('8 inci', 280)], 'Buttercake, swiss meringue buttercream dan kompot buah buatan sendiri. Mentega tulen.'),
 ('24', 'Victoria Sandwich Cake', 'Kek mentega', [('Satu saiz', 100)], 'Buttercake dengan kompot buah.'),
 ('13', 'Buttercake', 'Kek mentega', [('Satu saiz', 55)], 'Mentega tulen.'),
 ('23', 'Pandan Gula Melaka', 'Kek mentega', [('Satu saiz', 90)], 'Buttercake pandan, SMBC pandan, sos gula melaka. Mentega tulen.'),
 ('30', 'Red Velvet', 'Kek mentega', [('8 inci', 89)], 'Kek moist dengan cream cheese butter frosting.'),
 ('31', 'Chocolate Moist', 'Kek mentega', [('7 inci', 48)], 'Kek coklat moist.'),
 ('35', 'Double Chocolate Banana Cake', 'Kek mentega', [('9 inci', 50)], 'Kek pisang dengan dua jenis coklat.'),
]
POP = ['01', '04', '17', '09', '29', '11', '23', '30', '22', '10', '07', '16', '31', '05', '34', '06', '21', '18', '12', '15', '32', '25', '28', '20', '26', '27', '33', '08', '19', '03', '24', '13', '35']
FEAT = ['04', '09', '10', '11', '15', '16', '18', '32']   # admin: "Paparkan di meja kek" + kedudukan
REKA = {'04', '07', '15', '06', '09', '12', '18', '10', '11', '08'}   # admin: "Tunjuk butang Reka sendiri" (kek krim)
HERO = {'04': '04_02'}
PRODUCTS = [dict(id=i, name=n, cat=c, sizes=[dict(l=a, p=b) for a, b in s], price=min(b for _, b in s), desc=d, img=blob(i + '_01'), hero=blob(HERO.get(i, i + '_01')), pop=len(POP) - POP.index(i), feat=(FEAT.index(i) + 1 if i in FEAT else 0), reka=i in REKA, prep='[3 hari]' if c != 'Kek kahwin' else '[7 hari]') for i, n, c, s, d in P]
CATS = ['Kek batik', 'Brownies dan bar', 'Italian cake', 'Kek kahwin', 'Hari jadi dan majlis', 'Kek mentega']

COLORS = [('ivory', 'Krim putih', '#F3EBDD'), ('blush', 'Merah jambu lembut', '#EBC4BA'), ('matcha', 'Pistachio', '#C9D3AD'), ('sky', 'Biru lembut', '#D4E0EC')]
IMGS = {k: blob(k) for k in MAP if k.startswith(('t_', 'c_', 'S_'))}

from faq import FAQ, site as faq_site, FAQ_CSS
def expand(s):
    s = s.replace('@@FAQ_D@@', faq_site(False)).replace('@@FAQ_P@@', faq_site(True)).replace('@@FAQ_JSON@@', 'const FAQ = ' + json.dumps(FAQ, ensure_ascii=False) + ';')
    s = s.replace('@@FONTS@@', FONTS).replace('@@CSS_B@@', CSS_B + FAQ_CSS).replace('@@CSS_ADMIN@@', CSS_ADMIN)
    s = re.sub(r'@@HDR_D:(\w+)@@', lambda m: hdr_d(m.group(1)), s)
    s = s.replace('@@LOGO_C@@', blob('logo_cream')).replace('@@LOGO_COL@@', blob('logo_color'))
    s = s.replace('@@WA@@', ICON['wa']).replace('@@BACK@@', ICON['back'])
    s = s.replace('@@FTR_D@@', FTR_D).replace('@@FTR_P@@', FTR_P)
    s = re.sub(r'@@HDR_P:([^:@]*):([^@]*)@@', lambda m: hdr_p(m.group(1), m.group(2)), s)
    s = s.replace('@@HDR_P@@', hdr_p())
    s = re.sub(r'@@SIDEBAR:(\w+)@@', lambda m: sidebar(m.group(1)), s)
    s = re.sub(r'@@TOP:([^|]*)\|([^@]*)@@', lambda m: admin_top(m.group(1), m.group(2)), s)
    s = s.replace('@@PRODUCTS@@', 'const PRODUCTS = ' + json.dumps(PRODUCTS, ensure_ascii=False) + ';')
    s = s.replace('@@CATS@@', 'const CATS = ' + json.dumps(CATS, ensure_ascii=False) + ';')
    s = s.replace('@@COLORS@@', 'const COLORS = ' + json.dumps(COLORS, ensure_ascii=False) + ';')
    s = s.replace('@@IMGS@@', 'const IMGS = ' + json.dumps(IMGS) + ';')
    s = s.replace('@@WA_JS@@', "const WA_NO = '601123023447'; const waLink = (t) => 'https://wa.me/' + WA_NO + '?text=' + encodeURIComponent(t);")
    s = s.replace('@@SHOWCASE_JS@@', open(os.path.join(ROOT, 'showcase.js')).read())
    s = s.replace('@@MEJA_JS@@', 'const CUT = ' + json.dumps({k[4:]: blob(k) for k in MAP if k.startswith('cut_')}) + ';\n' + open(os.path.join(ROOT, 'meja.js')).read())
    if '@@STUDIO_JS@@' in s:
        s = s.replace('@@STUDIO_JS@@', open(os.path.join(ROOT, 'studio.js')).read())
    if '@@CHECKOUT_JS@@' in s:
        s = s.replace('@@CHECKOUT_JS@@', open(os.path.join(ROOT, 'checkout.js')).read())
    s = re.sub(r'@@IMG:([0-9a-z_]+)@@', lambda m: blob(m.group(1)), s)
    s = s.replace('@@LOGO_C@@', blob('logo_cream')).replace('@@LOGO_COL@@', blob('logo_color')).replace('@@WOOD@@', blob('wood'))
    left = re.findall(r'@@[^@]{0,40}@@', s)
    assert not left, left
    return s

if __name__ == '__main__':
    os.makedirs(os.path.join(ROOT, 'out/project'), exist_ok=True)
    for f in sorted(glob.glob(os.path.join(ROOT, 'pages/*.html'))):
        out = expand(open(f).read())
        name = os.path.basename(f).replace('.html', '.dc.html')
        open(os.path.join(ROOT, 'out/project', name), 'w').write(out)
        print('built', name, len(out))
