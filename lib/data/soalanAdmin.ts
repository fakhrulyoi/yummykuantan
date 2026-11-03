import { asc, eq, max } from 'drizzle-orm';
import { z } from 'zod';
import { rekodAudit } from './audit';
import { db } from './db';
import * as s from './skema';

export type HasilSoalan = { ok: true } | { ok: false; ralat: string };

/** Teks `[...]` belum disahkan pemilik. Satu `[` pun dikira. */
export const adaKurungan = (teks: string) => teks.includes('[');

const KURUNGAN = 'Jawapan masih ada [kurungan]. Isi dahulu sebelum terbit.';
const skema = z.object({ q: z.string().trim().min(3, { error: 'Isi soalan' }).max(160), a: z.string().trim().min(3, { error: 'Isi jawapan' }).max(800) });

export async function senaraiSoalanAdmin() {
  return db.select().from(s.faq).orderBy(asc(s.faq.sortOrder));
}

async function ambil(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  const [f] = await db.select().from(s.faq).where(eq(s.faq.id, id));
  return f ?? null;
}

export async function simpanDrafSoalan(id: string, q: string, a: string, userId: string): Promise<HasilSoalan> {
  const p = skema.safeParse({ q, a });
  if (!p.success) return { ok: false, ralat: p.error.issues[0].message };
  const f = await ambil(id);
  if (!f) return { ok: false, ralat: 'Soalan tidak dijumpai.' };
  await db.update(s.faq).set({ draftQuestion: p.data.q, draftAnswer: p.data.a }).where(eq(s.faq.id, id));
  await rekodAudit(userId, 'draf_soalan', 'faq', id, { question: [f.draftQuestion ?? f.question, p.data.q] });
  return { ok: true };
}

/** Salin draf ke versi awam dan papar di laman. Ditolak jika masih ada `[`. */
export async function terbitSoalan(id: string, userId: string): Promise<HasilSoalan> {
  const f = await ambil(id);
  if (!f) return { ok: false, ralat: 'Soalan tidak dijumpai.' };
  const q = f.draftQuestion ?? f.question;
  const a = f.draftAnswer ?? f.answer;
  if (adaKurungan(q) || adaKurungan(a)) return { ok: false, ralat: KURUNGAN };
  await db.update(s.faq).set({ question: q, answer: a, draftQuestion: null, draftAnswer: null, visible: true }).where(eq(s.faq.id, id));
  await rekodAudit(userId, 'terbit_soalan', 'faq', id, { question: [f.question, q], answer: [f.answer, a] });
  return { ok: true };
}

export async function tunjukSoalan(id: string, visible: boolean, userId: string): Promise<HasilSoalan> {
  const f = await ambil(id);
  if (!f) return { ok: false, ralat: 'Soalan tidak dijumpai.' };
  if (visible && (adaKurungan(f.question) || adaKurungan(f.answer))) return { ok: false, ralat: KURUNGAN };
  await db.update(s.faq).set({ visible }).where(eq(s.faq.id, id));
  await rekodAudit(userId, visible ? 'tunjuk_soalan' : 'sembunyi_soalan', 'faq', id, { visible: [f.visible, visible] });
  return { ok: true };
}

export async function susunSoalan(ids: string[], userId: string): Promise<HasilSoalan> {
  if (!z.array(z.uuid()).max(100).safeParse(ids).success) return { ok: false, ralat: 'Susunan tidak sah.' };
  await db.transaction(async (tx) => {
    for (const [i, id] of ids.entries()) await tx.update(s.faq).set({ sortOrder: i }).where(eq(s.faq.id, id));
    await rekodAudit(userId, 'susun_soalan', 'faq', '*', { ids }, tx);
  });
  return { ok: true };
}

export async function tambahSoalan(userId: string): Promise<string> {
  const [{ m }] = await db.select({ m: max(s.faq.sortOrder) }).from(s.faq);
  const [f] = await db
    .insert(s.faq)
    .values({ question: '[Soalan baru]', answer: '[Jawapan]', sortOrder: (m ?? -1) + 1, visible: false })
    .returning({ id: s.faq.id });
  await rekodAudit(userId, 'tambah_soalan', 'faq', f.id, {});
  return f.id;
}

export async function padamSoalan(id: string, userId: string): Promise<HasilSoalan> {
  const f = await ambil(id);
  if (!f) return { ok: false, ralat: 'Soalan tidak dijumpai.' };
  await db.delete(s.faq).where(eq(s.faq.id, id));
  await rekodAudit(userId, 'padam_soalan', 'faq', id, { question: f.question });
  return { ok: true };
}
