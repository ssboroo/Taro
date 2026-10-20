import {synthesisParagraphs} from './synthesis-content.js';
import {deck} from './deck.js';
import {commentary,suitContext} from './commentary.js';
import {positions,prompts} from './engine.js';
const byId=new Map(deck.map(c=>[c.id,c]));
export const formats={story:{width:1080,height:1920,label:'Story · 9:16'},portrait:{width:1080,height:1350,label:'Пост · 4:5'},square:{width:1080,height:1080,label:'Дөрвөлжин · 1:1'}};
export function cardContent(reading,index,full=false){
 const entry=reading.cards[index],card=byId.get(entry.id);if(!card)throw new Error('Unknown card');
 const cm=commentary(card),meaning=entry.reversed?card.reversed:card.upright;
 const paragraphs=[{label:'Уламжлалт утга',text:meaning}];
 if(full)paragraphs.push({label:'Дүрслэлийн бэлгэдэл',text:cm.observation},{label:'Тайлах хүрээ',text:suitContext[card.suit]},{label:'Байрлалын эргэцүүлэл',text:prompts[reading.count][index]},{label:'Өөртөө тавих асуулт',text:cm.reflection});
 return {card,reversed:entry.reversed,position:positions[reading.count][index],meaning,reflection:cm.reflection,paragraphs};
}
export function shareCaption(reading,{full=false,includeQuestion=false,index=null}={}){
 if(index===null&&reading.count>1)return ['✧ RAINY ТАРОТ · НЭГДСЭН ДЭЛГЭЛТ',includeQuestion&&reading.question?'Миний асуулт: '+reading.question:'',...reading.cards.map((entry,i)=>{const c=cardContent(reading,i);return `${i+1}. ${c.position} — ${c.card.name} (${entry.reversed?'Урвуу':'Шулуун'})`;}),...synthesisParagraphs(reading,full).map(p=>p.label+'\n'+p.text),'https://rainy-tarot.ssboroostore.chatgpt.site'].filter(Boolean).join('\n\n');
 const indices=index===null?reading.cards.map((_,i)=>i):[index];
 return ['✧ RAINY ТАРОТ',includeQuestion&&reading.question?'Миний асуулт: '+reading.question:'',...indices.map(i=>{const c=cardContent(reading,i,full);return `${i+1}. ${c.position} — ${c.card.name} (${c.reversed?'Урвуу':'Шулуун'})\n${c.paragraphs.map(p=>`${p.label}: ${p.text}`).join('\n\n')}${full?'\nЭх: '+c.card.source:''}`;}),'Уламжлалт бэлгэдэл ба өөрийгөө таних эргэцүүлэл.','https://rainy-tarot.ssboroostore.chatgpt.site'].filter(Boolean).join('\n\n');
}
export function wrapText(text,maxWidth,measure){
 const lines=[];let current='';
 for(const word of text.split(/\s+/).filter(Boolean)){
  if(measure(word)>maxWidth){if(current){lines.push(current);current='';}for(const char of Array.from(word)){if(current&&measure(current+char)>maxWidth){lines.push(current);current='';}current+=char;}continue;}
  const next=current?current+' '+word:word;
  if(current&&measure(next)>maxWidth){lines.push(current);current=word;}else current=next;
 }if(current)lines.push(current);return lines;
}
