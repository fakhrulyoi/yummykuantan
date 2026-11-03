import { db, tutupDb } from '@/lib/data/db';
import { seedDb } from './seed';

seedDb(db)
  .then(() => console.log('Data mula dimasukkan.'))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(tutupDb);
