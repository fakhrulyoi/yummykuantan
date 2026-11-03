import { asc, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { TAG } from './cache';
import { db } from './db';
import * as s from './skema';

export const senaraiSoalanTerbit = unstable_cache(
  async (): Promise<{ question: string; answer: string }[]> =>
    db.select({ question: s.faq.question, answer: s.faq.answer }).from(s.faq).where(eq(s.faq.visible, true)).orderBy(asc(s.faq.sortOrder)),
  ['soalan-terbit'],
  { tags: [TAG.soalan] },
);
