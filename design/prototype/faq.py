# FAQ content. Text in [square brackets] = to be confirmed by the owner (shown highlighted on the site mockup).
FAQ = [
  ("Macam mana nak tempah?", "Pilih kek atau reka kek sendiri, kemudian tekan Tempah. WhatsApp akan dibuka dengan butiran kek, tarikh dan cara terima yang siap ditulis. Tekan hantar, dan kami sahkan harga serta slot di WhatsApp."),
  ("Berapa hari awal perlu tempah?", "Sekurang-kurangnya [3 hari] untuk kek biasa dan [7 hari] untuk kek kahwin atau kek 3 tingkat. Tarikh yang masih kosong ada di laman utama."),
  ("Bayar macam mana? Perlu deposit?", "Tiada bayaran di laman ini. Selepas tempahan disahkan di WhatsApp, bayar melalui [pindahan bank atau DuitNow QR]. [Deposit 50% untuk kunci slot, baki semasa ambil atau sebelum hantar.]"),
  ("Kawasan mana yang dihantar? Berapa caj?", "Kami hantar ke Kuantan dan Pekan sahaja. Caj ikut kawasan: [Kuantan RM__, Pekan RM__]. Ambil sendiri tiada caj."),
  ("Boleh ambil sendiri? Di mana?", "Boleh. Alamat: [alamat dapur dan pin Google Maps]. Waktu ambil: [hari dan jam operasi]."),
  ("Kek ini halal?", "[Untuk diisi oleh pemilik: status halal atau penerangan bahan yang digunakan.]"),
  ("Kek tahan berapa lama dan simpan macam mana?", "[Untuk diisi oleh pemilik: contohnya simpan dalam peti sejuk, keluarkan 20 minit sebelum hidang, elok dimakan dalam 3 hari.]"),
  ("Boleh tukar tarikh atau batal tempahan?", "[Untuk diisi oleh pemilik: contohnya tukar tarikh percuma jika maklum 3 hari awal; deposit tidak dikembalikan jika batal.]"),
  ("Boleh pilih warna krim gelap?", "Tidak. Krim segar hanya dalam warna lembut kerana warna terlalu gelap atau terang boleh menjejaskan rasa dan meninggalkan kesan pada tangan dan mulut."),
  ("Saya ada gambar contoh. Boleh hantar?", "Boleh. Di halaman Reka kek, tambah sehingga 4 gambar rujukan. Pautannya dimasukkan terus dalam mesej WhatsApp anda."),
]
import re, html
def fmt(a):
  a = html.escape(a)
  return re.sub(r'\[([^\]]+)\]', r'<span class="yk-tbc">[\1]</span>', a)
def site(phone=False):
  qfs = '17px' if phone else '22px'
  items = ''.join(f'<details class="yk-faq"><summary style="font-family: \'Libre Caslon Display\', serif; font-size: {qfs}">{html.escape(q)}</summary><p style="color: #E6CFC6; font-size: {"14px" if phone else "16px"}; padding: 0 {"0" if phone else "40px"} 18px 0">{fmt(a)}</p></details>' for q, a in FAQ)
  if phone:
    return f'''<section aria-labelledby="pq" style="padding: 40px 20px 0">
<h2 id="pq" style="font-size: 28px">Soalan lazim</h2>
<div style="margin-top: 10px; border-top: 1px solid #74343C">{items}</div>
<p style="font-size: 13px; color: #D3B1AB; margin-top: 12px">Tak jumpa jawapan? <a href="https://wa.me/601123023447" style="font-weight: 600">Tanya di WhatsApp</a></p>
</section>
'''
  return f'''<section aria-labelledby="h-faq" style="max-width: 1360px; margin: 0 auto; padding: 24px 40px 96px; display: flex; flex-wrap: wrap; gap: 32px 64px">
<div style="flex: 1 1 280px; max-width: 360px"><h2 id="h-faq" style="font-size: 48px; line-height: 1">Soalan lazim</h2><p style="margin-top: 10px; color: #D3B1AB">Jawapan untuk soalan yang paling kerap ditanya di WhatsApp.</p><p style="margin-top: 14px"><a href="https://wa.me/601123023447" style="font-weight: 600">Tak jumpa jawapan? Tanya di WhatsApp</a></p></div>
<div style="flex: 999 1 560px; border-top: 1px solid #74343C">{items}</div>
</section>
'''
FAQ_CSS = '.yk-faq{border-bottom:1px solid #74343C}.yk-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;min-height:56px;padding:14px 0;line-height:1.2}.yk-faq summary::-webkit-details-marker{display:none}.yk-faq summary::after{content:"+";font-family:Manrope,sans-serif;font-size:22px;color:#EBCFC3;flex:none;transition:transform .25s ease}.yk-faq[open] summary::after{transform:rotate(45deg)}.yk-faq summary:focus-visible{outline:2px solid #EBCFC3;outline-offset:2px}.yk-tbc{background:rgba(227,181,122,.14);color:#F2C28E;padding:0 3px}'
