import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync} from 'node:fs';
import {dirname} from 'node:path';
export function createNodeStore(filename){if(filename!==':memory:')mkdirSync(dirname(filename),{recursive:true});const db=new DatabaseSync(filename);db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');if(!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tarot_orders'").get())db.exec(readFileSync(new URL('../drizzle/0000_tarot_orders.sql',import.meta.url),'utf8'));return {db,
 get:async id=>db.prepare('SELECT * FROM tarot_orders WHERE id=?').get(id),byIntent:async id=>db.prepare('SELECT * FROM tarot_orders WHERE intent_id=?').get(id),
 insert:async o=>db.prepare('INSERT OR IGNORE INTO tarot_orders (id,token_hash,fingerprint,reading_json,status,amount,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').run(o.id,o.token_hash,o.fingerprint,o.reading_json,'pending',5000,o.created_at,o.created_at),
 intent:async(id,value,expires)=>db.prepare('UPDATE tarot_orders SET intent_id=?,expires_at=?,updated_at=? WHERE id=? AND intent_id IS NULL').run(value,expires,Date.now(),id),
 checkout:async(id,url)=>db.prepare('UPDATE tarot_orders SET checkout_url=?,updated_at=? WHERE id=?').run(url,Date.now(),id),
 checked:async id=>db.prepare('UPDATE tarot_orders SET checked_at=? WHERE id=?').run(Date.now(),id),
 paid:async id=>db.prepare("UPDATE tarot_orders SET status='paid',paid_at=COALESCE(paid_at,?),updated_at=? WHERE id=? AND intent_id IS NOT NULL").run(Date.now(),Date.now(),id),close:()=>db.close()};}
