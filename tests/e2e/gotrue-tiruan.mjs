// Pelayan GoTrue (Supabase Auth) tiruan untuk e2e. Hanya endpoint yang digunakan oleh @supabase/ssr dalam aplikasi ini.
// Pengguna tetap; token disimpan dalam memori.
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';

const PORT = Number(process.env.GOTRUE_PORT ?? 54399);
const PENGGUNA = [
  { id: '00000000-0000-4000-8000-000000000001', email: 'pemilik@ujian.my', password: 'betul-123456' },
  { id: '00000000-0000-4000-8000-000000000002', email: 'staf@ujian.my', password: 'betul-123456' },
  { id: '00000000-0000-4000-8000-000000000003', email: 'orang@ujian.my', password: 'betul-123456' },
];
const token = new Map(); // access_token -> id
const segar = new Map(); // refresh_token -> id

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const pengguna = (u) => ({
  id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email, email_confirmed_at: '2026-01-01T00:00:00Z',
  app_metadata: { provider: 'email' }, user_metadata: {}, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
});
function sesi(u) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const akses = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: u.id, email: u.email, role: 'authenticated', aud: 'authenticated', exp, session_id: randomBytes(8).toString('hex') })}.${randomBytes(16).toString('base64url')}`;
  const r = randomBytes(16).toString('hex');
  token.set(akses, u.id);
  segar.set(r, u.id);
  return { access_token: akses, token_type: 'bearer', expires_in: 3600, expires_at: exp, refresh_token: r, user: pengguna(u) };
}

const hantar = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(body === undefined ? '' : JSON.stringify(body));
};

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let badan = '';
  for await (const c of req) badan += c;
  const json = badan ? JSON.parse(badan) : {};
  const bearer = (req.headers.authorization ?? '').replace(/^Bearer /, '');

  if (req.method === 'POST' && url.pathname === '/auth/v1/token') {
    const jenis = url.searchParams.get('grant_type');
    if (jenis === 'password') {
      const u = PENGGUNA.find((x) => x.email === json.email && x.password === json.password);
      if (!u) return hantar(res, 400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
      return hantar(res, 200, sesi(u));
    }
    if (jenis === 'refresh_token') {
      const id = segar.get(json.refresh_token);
      const u = PENGGUNA.find((x) => x.id === id);
      if (!u) return hantar(res, 400, { code: 400, error_code: 'refresh_token_not_found', msg: 'Invalid Refresh Token' });
      segar.delete(json.refresh_token);
      return hantar(res, 200, sesi(u));
    }
  }
  if (req.method === 'GET' && url.pathname === '/auth/v1/user') {
    const u = PENGGUNA.find((x) => x.id === token.get(bearer));
    if (!u) return hantar(res, 403, { code: 403, error_code: 'bad_jwt', msg: 'invalid JWT' });
    return hantar(res, 200, pengguna(u));
  }
  if (req.method === 'POST' && url.pathname === '/auth/v1/logout') {
    token.delete(bearer);
    return hantar(res, 204);
  }
  if (url.pathname === '/auth/v1/health') return hantar(res, 200, { ok: true });
  hantar(res, 404, { code: 404, msg: `tiada ${req.method} ${url.pathname}` });
}).listen(PORT, () => console.log(`gotrue tiruan di ${PORT}`));
