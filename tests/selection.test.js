import test from 'node:test';
import assert from 'node:assert/strict';
import {deck} from '../public/deck.js';
import {SelectionSession,orbitPose} from '../public/selection.js';
test('manual selection includes all 78 cards and accepts the last card',()=>{
 const s=new SelectionSession(deck);assert.equal(s.pool.length,78);assert.equal(new Set(s.pool.map(c=>c.id)).size,78);const x=s.choose(77);assert.equal(x.id,s.pool[77].id);assert.equal(s.complete,true);assert.equal(s.choose(0),null);
});
test('three-card selection preserves chosen order and rejects duplicate taps',()=>{
 const s=new SelectionSession(deck,{count:3});const a=s.choose(12);assert.equal(s.choose(12),null);const b=s.choose(77),c=s.choose(0);assert.deepEqual(s.selected.map(x=>x.id),[a.id,b.id,c.id]);assert.equal(s.complete,true);assert.equal(new Set(s.selected.map(x=>x.id)).size,3);
});
test('Celtic cross separates significator and takes 10 of remaining 77',()=>{
 const s=new SelectionSession(deck,{count:10,significator:'ar11'});assert.equal(s.pool.length,77);assert.ok(s.pool.every(x=>x.id!=='ar11'));for(let i=0;i<10;i++)s.choose(i);assert.equal(s.complete,true);assert.throws(()=>new SelectionSession(deck,{count:10}));
});
test('invalid selections cannot alter the session; reversals are optional',()=>{
 const s=new SelectionSession(deck,{count:3,reversed:true},()=>1);for(const i of [-1,78,.1,NaN])assert.equal(s.choose(i),null);assert.equal(s.selected.length,0);assert.equal(s.choose(0).reversed,true);assert.equal(new SelectionSession(deck).choose(0).reversed,false);
});
test('full rotation brings every card to the front without changing its identity',()=>{
 for(let i=0;i<78;i++){const p=orbitPose(i,78,-i/78*Math.PI*2);assert.ok(Math.abs(p.x)<1e-10);assert.ok(Math.abs(p.z-1)<1e-10);}assert.ok(Math.abs(orbitPose(0,78).x-orbitPose(78,78).x)<1e-10);
});
