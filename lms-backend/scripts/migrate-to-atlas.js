/**
 * scripts/migrate-to-atlas.js
 * Copy every collection from local MongoDB into the Atlas database in .env.
 * Documents keep their original _id (cross-collection references stay valid)
 * and the script is safe to re-run: it upserts instead of dropping data.
 */
require('dotenv').config();
const { MongoClient } = require('mongodb');

const SOURCE_URI = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017';
const SOURCE_DB = process.env.MONGO_DB_LOCAL || 'edunova_lms';
const TARGET_URI = process.env.MONGO_URI;
const TARGET_DB = process.env.MONGO_DB || 'edunova_lms';

const run = async () => {
  if (!TARGET_URI) {
    throw new Error('MONGO_URI is not defined. Set it in lms-backend/.env');
  }

  const source = new MongoClient(SOURCE_URI, { serverSelectionTimeoutMS: 5000 });
  const target = new MongoClient(TARGET_URI, { serverSelectionTimeoutMS: 15000 });

  try {
    await Promise.all([source.connect(), target.connect()]);
    const srcDb = source.db(SOURCE_DB);
    const dstDb = target.db(TARGET_DB);

    const collections = (await srcDb.listCollections().toArray())
      .map((c) => c.name)
      .filter((name) => !name.startsWith('system.'))
      .sort();

    if (collections.length === 0) {
      throw new Error(`No collections found in ${SOURCE_DB} at ${SOURCE_URI}`);
    }

    console.log(`[migrate] ${SOURCE_URI}/${SOURCE_DB} -> Atlas/${TARGET_DB}`);

    for (const name of collections) {
      const docs = await srcDb.collection(name).find({}).toArray();

      if (docs.length > 0) {
        await dstDb.collection(name).bulkWrite(
          docs.map((doc) => ({
            replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true },
          })),
          { ordered: false }
        );
      }

      const indexes = await srcDb.collection(name).listIndexes().toArray();
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        const options = { ...idx, name: idx.name };
        delete options.key;
        delete options.v;
        delete options.ns;
        try {
          await dstDb.collection(name).createIndex(idx.key, options);
        } catch (error) {
          console.warn(`[migrate] index ${name}.${idx.name} skipped: ${error.message}`);
        }
      }

      console.log(`[migrate] ${name}: copied ${docs.length} documents, ${indexes.length - 1} indexes`);
    }

    for (const name of collections) {
      const srcCount = await srcDb.collection(name).countDocuments();
      const dstCount = await dstDb.collection(name).countDocuments();
      console.log(`[verify] ${name}: local=${srcCount} atlas=${dstCount}`);
      if (dstCount < srcCount) {
        throw new Error(`Incomplete migration: ${name} has ${dstCount}/${srcCount} documents in Atlas`);
      }
    }

    console.log('[migrate] finished successfully');
  } finally {
    await Promise.all([source.close(), target.close()]);
  }
};

run().catch((error) => {
  console.error('[migrate] failed:', error.message);
  process.exit(1);
});
