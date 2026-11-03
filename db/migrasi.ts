import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, tutupDb } from '../lib/data/db';

migrate(db, { migrationsFolder: 'db/migrations' })
  .then(() => console.log('Migrasi selesai.'))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(tutupDb);
