import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {database,sources} from '../public/knowledge.js';
import {deck} from '../public/deck.js';
test('knowledge records reference known sources and cover every card once',()=>{assert.equal(database.cards.length,78);assert.equal(new Set(database.cards.map(c=>c.id)).size,78);const refs=new Set(sources.map(s=>s.id));for(const list of [database.cards,database.rules,database.history,database.glossary])for(const r of list){assert.ok(r.title&&r.text);for(const ref of r.refs)assert.ok(refs.has(ref),ref);}assert.match(deck.find(c=>c.id==='cu02').reversed,/§4/);});
test('primary archive honestly records retrieval gaps and preserves supplementary provenance',()=>{const data=JSON.parse(readFileSync(new URL('../public/primary-texts.json',import.meta.url)));assert.equal(data.entries.length,56);assert.equal(data.entries.filter(e=>e.status==='retrieved').length,55);assert.equal(data.entries.find(e=>e.id==='cu07').status,'unavailable');assert.match(data.additional,/Reversed: Passion/);assert.match(data.major,/THE WORLD/);for(const e of data.entries.filter(e=>e.status==='retrieved')){assert.ok(e.text.length>40);assert.ok(e.url.startsWith('https://sacred-texts.com/'));}});
