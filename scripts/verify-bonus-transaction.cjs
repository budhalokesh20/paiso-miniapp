// Test-only: provide PGLITE_MODULE pointing to an isolated @electric-sql/pglite installation.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
async function main() {
  const { PGlite } = require(process.env.PGLITE_MODULE || '@electric-sql/pglite');
  const db = new PGlite();
  try {
    await db.exec('CREATE TABLE paiso_state (id int PRIMARY KEY, data jsonb NOT NULL)');
    await db.exec(fs.readFileSync(path.join(__dirname,'../database/snapshot-revision.sql'),'utf8'));
    await db.exec(fs.readFileSync(path.join(__dirname,'../database/redeem-bonus.sql'),'utf8'));
    await db.exec(fs.readFileSync(path.join(__dirname,'../database/spin-reward.sql'),'utf8'));
    const hash='a'.repeat(64);
    const initial={users:{'1':{coins:0,totalEarned:0},'2':{coins:0,totalEarned:0}},rewardCodes:{[hash]:{enabled:true,points:25,maxUses:1,uses:0,expiresAt:null,usedBy:{}}}};
    await db.query('INSERT INTO paiso_state(id,data) VALUES (1, $1::jsonb)',[JSON.stringify(initial)]);
    const redeem=async user=>(await db.query('SELECT paiso_redeem_bonus($1,$2) AS result',[user,hash])).rows[0].result;
    const attempts=await Promise.all([redeem('1'),redeem('1'),redeem('2')]);
    assert.equal(attempts.filter(result=>result.ok).length,1);
    const {rows}=await db.query('SELECT data FROM paiso_state WHERE id=1');
    assert.equal(rows[0].data.rewardCodes[hash].uses,1);
    assert.equal(rows[0].data.users['1'].coins+rows[0].data.users['2'].coins,25);
    await assert.rejects(() => db.query('UPDATE paiso_state SET data=$1::jsonb WHERE id=1',[JSON.stringify(initial)]), /snapshot revision required/, 'legacy writers must not silently overwrite a reward');
    await assert.rejects(() => db.query('SELECT paiso_save_snapshot($1,$2::jsonb)',[0,JSON.stringify(initial)]), /snapshot conflict/, 'a stale snapshot must not erase a committed reward');
    const winner=rows[0].data.users['1'].coins ? '1' : '2';
    assert.equal((await redeem(winner)).error,'claimed');
    assert.equal((await redeem(winner)).ok,false);
    const spin=async user=>(await db.query('SELECT paiso_claim_spin($1,$2) AS result',[user,1])).rows[0].result;
    const spins=await Promise.all([spin('1'),spin('1')]);
    assert.equal(spins.filter(result=>result.ok).length,1);
    assert.equal(spins.find(result=>result.ok).points,10);
    assert.equal(spins.find(result=>!result.ok).error,'cooldown');
    assert.equal((await db.query('SELECT paiso_claim_spin($1,$2) AS result',['2',99])).rows[0].result.error,'invalid');
    await db.query("UPDATE paiso_state SET data=jsonb_set(data,'{spinSettings}', $1::jsonb), revision=revision+1",[JSON.stringify({enabled:true,cooldownMs:86400000,rewards:{bad:true}})]);
    assert.equal((await spin('2')).error,'invalid','malformed configuration must fail closed');
    console.log('Atomic bonus and spin decision checks passed in an isolated PGlite database.');
  } finally { await db.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
