const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { readSnapshot, commitSnapshot, SnapshotConflictError } = require('../transactional-snapshot.js');
async function main() {
  const { PGlite } = require(process.env.PGLITE_MODULE || '@electric-sql/pglite');
  const db = new PGlite();
  try {
    await db.exec('CREATE TABLE paiso_state (id int PRIMARY KEY, data jsonb NOT NULL)');
    await db.exec(fs.readFileSync(path.join(__dirname,'../database/snapshot-revision.sql'),'utf8'));
    await db.query('INSERT INTO paiso_state(id,data) VALUES (1,$1::jsonb)',[JSON.stringify({users:{'1':{coins:100}}})]);
    const query=async(statement,params)=>(await db.query(statement,params)).rows;
    const left=await readSnapshot(query), right=await readSnapshot(query);
    assert.equal(left.revision,0); assert.equal(right.revision,0);
    left.data.users['1'].coins=125;
    assert.equal(await commitSnapshot(query,left.revision,left.data),1);
    right.data.users['1'].coins=0;
    await assert.rejects(()=>commitSnapshot(query,right.revision,right.data),SnapshotConflictError);
    const current=await readSnapshot(query);
    assert.equal(current.data.users['1'].coins,125,'stale writer cannot erase the committed balance');
    await assert.rejects(()=>commitSnapshot(async()=>{throw new Error('database unavailable');},current.revision,current.data),/database unavailable/);
    assert.equal((await readSnapshot(query)).data.users['1'].coins,125,'database error must not report a successful write');
    console.log('Versioned snapshot conflict and database failure checks passed.');
  } finally { await db.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
