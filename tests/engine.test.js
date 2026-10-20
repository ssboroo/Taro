import test from 'node:test';
import assert from 'node:assert/strict';
import {deck} from '../public/deck.js';
import {commentary} from '../public/commentary.js';
import {drawReading,randomInt,shuffled,positions} from '../public/engine.js';
test('complete 78-card inventory with both meanings and individual editorial observations',()=>{
  assert.equal(deck.length,78);assert.equal(new Set(deck.map(c=>c.id)).size,78);
  assert.equal(deck.filter(c=>c.suit==='major').length,22);
  for(const suit of ['wa','cu','sw','pe'])assert.equal(deck.filter(c=>c.suit===suit).length,14);
  for(const c of deck){assert.ok(c.upright.length>15);assert.ok(c.reversed.length>15);assert.ok(commentary(c).observation.length>20);assert.ok(commentary(c).reflection.endsWith('?'));assert.ok(c.source.startsWith('https://sacred-texts.com/'));}
  assert.equal(new Set(deck.map(c=>commentary(c).observation)).size,78);
});
test('all supported spreads draw without replacement across repeated trials',()=>{
  for(const count of [1,3,10])for(let i=0;i<100;i++){
    const result=drawReading(deck,count,true,'ar11');
    assert.equal(result.length,count);assert.equal(new Set(result.map(c=>c.id)).size,count);
    if(count===10)assert.ok(result.every(c=>c.id!=='ar11'));
    assert.equal(positions[count].length,count);
  }
});
test('disabled reversals never produce reversed cards; input deck is unchanged',()=>{
  const before=JSON.stringify(deck);assert.ok(drawReading(deck,3,false).every(c=>c.reversed===false));shuffled(deck);assert.equal(JSON.stringify(deck),before);
});
test('Celtic cross requires a valid separate significator',()=>{
  assert.throws(()=>drawReading(deck,10));assert.throws(()=>drawReading(deck,10,false,'missing'));assert.throws(()=>drawReading(deck,4));
});
test('rejection sampling discards biased tail of uint32 range',()=>{
  let calls=0;const crypto={getRandomValues(a){a[0]=calls++===0?4294967295:7;return a;}};
  assert.equal(randomInt(10,crypto),7);assert.equal(calls,2);assert.throws(()=>randomInt(0));
});
test('shuffle and three nonempty cuts preserve cards, without mutating source',()=>{
  const source=deck.map(x=>x.id);const result=shuffled(source,()=>0);assert.deepEqual(new Set(source),new Set(result));assert.notDeepEqual(source,result);
  const draw=drawReading(deck,10,true,'ar11',()=>0);assert.equal(draw.length,10);assert.ok(draw.every(c=>!c.reversed));
});
