import {synthesize} from './synthesis.js';
import {imageURL} from './deck.js';
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
export function renderSynthesis(container,reading,full=true){
 const s=synthesize(reading),root=el('section','synthesis');root.setAttribute('aria-label','Нэгдсэн дэлгэлтийн тайлал');
 root.append(el('span','eyebrow',reading.count===3?'ӨНГӨРСӨН → ОДОО → БОЛОМЖИТ ИРЭЭДҮЙ':'КЕЛЬТИЙН ЗАГАЛМАЙ / БАЙРЛАЛ БА ХОЛБООС'),el('h3','synthesis-title','Картуудын хамтдаа өгүүлэх түүх'),el('p','synthesis-lead',s.summary));
 const film=el('div','synthesis-film');for(const c of s.cards){const item=el('figure');const img=el('img',c.reversed?'reversed':'');img.src=imageURL(c.card);img.alt=c.card.name;item.append(img,el('figcaption','',`${c.index+1}. ${c.position} · ${c.reversed?'Урвуу':'Шулуун'}`));film.append(item);}root.append(film);
 if(s.significator)root.append(el('p','muted','Төлөөлөх карт · '+s.significator.name+' — үндсэн 10 картын тоонд ороогүй.'));
 if(full){const timeline=el('div','synthesis-timeline');s.stages.forEach((p,i)=>{const block=el('article');block.append(el('span','synthesis-number',String(i+1).padStart(2,'0')),el('h4','',p.title),el('p','',p.text));timeline.append(block);});root.append(timeline);const links=el('div','synthesis-links');links.append(el('h4','','Картууд хоорондоо хэрхэн холбогдов?'));for(const p of s.links){const row=el('article');row.append(el('h5','',p.title),el('p','',p.text));links.append(row);}root.append(links);if(s.patterns.length){const patterns=el('div','synthesis-patterns');for(const p of s.patterns){const block=el('article');block.append(el('h4','',p.title),el('p','',p.text));patterns.append(block);}root.append(patterns);}}
 const actions=el('div','synthesis-actions');actions.append(el('h4','','Одоо өөрийн хийж чадах алхам'));for(const p of s.actions)actions.append(el('p','',p.text));root.append(actions);
 const method=el('details','synthesis-method');method.append(el('summary','','Ямар дүрмээр нэгтгэсэн бэ?'),el('p','',s.method),el('p','','Байрлал → тухайн чиглэлийн утга → сэдвийн холбоос → нөхцөлт дүгнэлт гэсэн дарааллаар уншина. Эерэг картууд сөрөг картыг хүчингүй болгохгүй; урвуу картуудыг нийлүүлж муу азын оноо гаргахгүй.'));
 for(const [i,url] of s.sources.entries()){const a=el('a','source-link',i?'Waite · §7 · Байрлалын эх заавар ↗':'Waite · §4 · Утга ба дарааллын нөхцөл ↗');a.href=url;a.target='_blank';a.rel='noopener';method.append(a);}root.append(method);container.replaceChildren(root);return s;
}
