import { describe, expect, it } from 'vitest';
import { semakUrlDb } from '@/lib/data/db';

describe('semakUrlDb', () => {
  it('terima URI postgres', () => {
    expect(semakUrlDb('postgresql://u:p@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres')).toBeNull();
    expect(semakUrlDb('postgres://u:p@localhost/db')).toBeNull();
  });
  it('terangkan bentuk salah tanpa dedah nilai', () => {
    const m = semakUrlDb('"postgresql://u:rahsia123@x.pooler.supabase.com:6543/postgres"')!;
    expect(m).toContain('tanda petik');
    expect(m).not.toContain('rahsia123');
    expect(semakUrlDb('psql -h x -U y')).toContain('psql');
    expect(semakUrlDb('DATABASE_URL=postgresql://a')).toContain('DATABASE_URL=');
  });
});
