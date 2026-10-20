import test from 'node:test';
import assert from 'node:assert/strict';
import {cardContent,shareCaption,formats,wrapText} from '../public/share-content.js';
const reading={count:3,question:'Миний нууц асуулт',note:'Нууц тэмдэглэл',cards:[{id:'ar17',reversed:false},{id:'ar19',reversed:true},{id:'pe04',reversed:false}]};
test('share captions exclude private questions and notes by default',()=>{
 const text=shareCaption(reading);assert.ok(!text.includes(reading.question));assert.ok(!text.includes(reading.note));assert.ok(shareCaption(reading,{includeQuestion:true}).includes(reading.question));
});
test('full and short captions use the actual reversed reading and chosen card',()=>{
 const content=cardContent(reading,1,true);assert.equal(content.card.id,'ar19');assert.equal(content.reversed,true);assert.equal(content.paragraphs.length,5);assert.equal(cardContent(reading,1,false).paragraphs.length,1);const text=shareCaption(reading,{full:true,index:1});assert.ok(text.includes('Урвуу'));assert.ok(text.includes(content.card.reversed));assert.ok(!text.includes('Зоос · Дөрөв'));
});
test('image presets match story, portrait and square dimensions',()=>{
 assert.equal(formats.story.width/formats.story.height,9/16);assert.equal(formats.portrait.width/formats.portrait.height,4/5);assert.equal(formats.square.width,formats.square.height);
});
test('wrapping preserves Mongolian text without overflow or truncation',()=>{
 for(const text of ['Монгол хэлээр бүрэн тайлал үзүүлэх','МашУртЗайгүйМонголҮгДавхарДавхар','Од · Найдвар']){const lines=wrapText(text,10,t=>Array.from(t).length);assert.ok(lines.every(x=>Array.from(x).length<=10));assert.equal(lines.join('').replace(/\s/g,''),text.replace(/\s/g,''));}
});
