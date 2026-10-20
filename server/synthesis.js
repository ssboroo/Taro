import {deck,suits} from '../public/deck.js';
import {positions} from '../public/engine.js';
const byId=new Map(deck.map(c=>[c.id,c]));
// Editorial thematic index, not a historical table of fixed card combinations.
export const themes={
start:{label:'санаачилга ба үйлдэл',action:'Хийхийг хүсэж буй ажлаа нэг жижиг, шалгаж болох алхам болгон тодорхойл.'},
bond:{label:'холбоо ба харилцан ойлголцол',action:'Таны таамаг болон нөгөө хүний хэлсэн бодит үгийг ялгаж, нэг тодруулах асуулт асуу.'},
clarity:{label:'ялган таних ба шийдвэр',action:'Шийдвэрт хэрэгтэй батлагдсан баримт, дутуу мэдээллээ хоёр баганад бич.'},
resources:{label:'нөөц ба тогтвортой байдал',action:'Боломжит цаг, мөнгө, хүчээ бодитоор тоолж, хүрэлцэх хэмжээгээр төлөвлө.'},
change:{label:'өөрчлөлт ба шилжилт',action:'Юуг үргэлжлүүлэх, юуг дуусгах, юуг шинээр туршихаа тус бүр нэг өгүүлбэрээр бич.'},
rest:{label:'түр азнах ба тунгаах',action:'Яаралтай биш шийдвэрт түр завсарлага авч, дахин шалгах тодорхой хугацаа тогтоо.'},
conflict:{label:'зөрчил ба дарамт',action:'Зөрчилд оролцож буй хэрэгцээ, санал зөрсөн нэг асуудлыг ялгаад тайван хэлэлцэх алхам сонго.'},
uncertainty:{label:'тодорхойгүй байдал ба таамаг',action:'Мэдэхгүй зүйлээ таамгаар нөхөхийн оронд ямар баримтаар шалгаж болохыг бич.'},
boundary:{label:'хязгаар ба хариуцлага',action:'Өөрийн хариуцах зүйл болон таны хяналтаас гадуурх зүйлийг ялгаж, нэг хил хязгаар тогтоо.'},
joy:{label:'сэтгэл ханамж ба дэмжлэг',action:'Одоо ажиллаж байгаа нэг сайн зүйлийг нэрлэж, түүнийг хадгалахад хийх үйлдлээ сонго.'},
loss:{label:'алдагдал ба гүйцээгүй хэрэгцээ',action:'Юу дутагдаж байгааг тодорхой нэрлээд, авч болох бодит тусламжийн нэг эх үүсвэр ол.'}
};
const major=[
'start uncertainty/uncertainty rest','start clarity/uncertainty conflict','clarity uncertainty/bond uncertainty','start resources/clarity uncertainty','boundary resources/joy uncertainty','bond boundary/bond boundary','bond joy/conflict uncertainty','start conflict/conflict loss','start joy/boundary conflict','rest clarity/uncertainty boundary','change joy/resources boundary','clarity boundary/conflict boundary','rest clarity/boundary uncertainty','change loss/rest loss','resources boundary/conflict bond','conflict boundary/uncertainty boundary','change loss/conflict boundary','loss joy/boundary loss','uncertainty conflict/uncertainty change','joy bond/joy','change clarity/clarity uncertainty','joy change/rest boundary'
];
const minor={
wa:['start resources/change loss','resources conflict/uncertainty change','start bond/rest change','joy bond/joy bond','conflict start/conflict clarity','joy start/uncertainty loss','start conflict/uncertainty conflict','start change/conflict uncertainty','boundary start/conflict rest','conflict boundary/start uncertainty','start clarity/uncertainty loss','change start/conflict change','bond resources/boundary conflict','boundary resources/boundary clarity'],
cu:['joy resources/change uncertainty','bond joy/bond','joy bond/start change','rest loss/change bond','loss bond/bond change','bond rest/change start','uncertainty start/clarity start','change loss/joy','joy resources/clarity uncertainty','joy bond/conflict loss','clarity rest/bond uncertainty','bond change/uncertainty conflict','clarity bond/bond uncertainty','boundary start/uncertainty conflict'],
sw:['start boundary/conflict start','bond boundary/uncertainty conflict','loss change/uncertainty conflict','rest boundary/clarity resources','loss conflict/loss conflict','change start/clarity bond','start uncertainty/clarity uncertainty','boundary conflict/uncertainty conflict','loss uncertainty/uncertainty boundary','loss conflict/joy resources','clarity boundary/uncertainty change','start conflict/start uncertainty','loss boundary/uncertainty conflict','clarity boundary/conflict boundary'],
pe:['joy resources/resources boundary','resources joy/joy uncertainty','start resources/rest resources','resources boundary/boundary rest','loss bond/change conflict','resources bond/boundary conflict','resources uncertainty/uncertainty resources','start resources/boundary uncertainty','resources clarity/uncertainty loss','resources bond/resources uncertainty','start clarity/boundary loss','boundary resources/rest loss','resources joy/uncertainty boundary','resources clarity/uncertainty conflict']
};
export const themeIndex=Object.fromEntries(deck.map(c=>{const pair=(c.suit==='major'?major[c.rank]:minor[c.suit][c.rank-1]).split('/');return [c.id,{upright:pair[0].split(' '),reversed:pair[1].split(' ')}];}));
const transitions={
'loss|joy':'Гачигдал, сэтгэл дундуур үлдсэн хэсгийн дараа дэмжлэгийг хүлээн авах, байгаа сайн зүйлээ анзаарах сэдэв гарч байна. Өмнөх дутагдлыг одоогийн тусламжаар хэрхэн нөхөж болохыг бод.',
'joy|resources':'Одоо бүрдэж буй дэмжлэг, сэтгэл ханамжийг бодит цаг, чадвар, нөөцтэй холбох хэрэгтэй гэсэн уншлага гарна. Таатай мэдрэмжийг тогтвортой дадал болгох нь энэ хоёрын хоорондох гол алхам.',
'loss|resources':'Дутагдаж байсан зүйлээ таних нь нөөцөө бодитоор удирдах сэдэвтэй холбогдож байна. Юуг нөхөх шаардлагатай, юуг аль хэдийн ашиглаж болохоо ялгах нь энэ чиглэлийн бодит ажил.',
'conflict|joy':'Дарамт, санал зөрөлдөөний сэдвээс дэмжлэг, тайтгарал руу анхаарал шилжиж байна. Асуудлаа нуухын оронд тусламж авч, харилцан зөвшилцөх боломжийг эргэцүүл.',
'joy|conflict':'Таатай нөхцөл байсан ч дараагийн байрлалд зөрчил, ачааллыг авч үзэх шаардлага гарна. Байгаа дэмжлэгээ ашиглан хүндрэлд эртхэн бэлтгэх тухай уншиж болно.',
'uncertainty|clarity':'Таамаг, дутуу мэдээллээс ялган таних, шийдвэрт хүрэх сэдэв рүү шилжинэ. Юу тодорхой болсон, юу хараахан шалгагдаагүйг тусад нь бичих нь энэ холбоосын бодит алхам.',
'clarity|uncertainty':'Шийдвэр гаргасан мэт санагдсан ч дараагийн байрлалд тодорхойгүй хэсэг үлдэнэ. Дүгнэлтээ өөрчлөхөд хүргэж болох шинэ мэдээлэл юу байж болохыг шалга.',
'rest|start':'Азнаж, тунгаасан зүйлээ жижиг бодит алхам болгох боломжийг эргэцүүлнэ. Бэлтгэлээ дуусгасан эсэхээ шалгаад, буцааж өөрчилж болох нэг туршилт сонго.',
'start|rest':'Эхлүүлсэн ажлаа цааш түлхэхээс өмнө завсарлаж, үр дүнгээ харах хэрэгцээ гарч байна. Хурдыг багасгах нь ажлаа бүрмөсөн орхихтой ижил биш.',
'bond|resources':'Харилцан ойлголцлыг бодит амлалт, цаг, хөдөлмөр, нөөцийн хуваарилалттай холбож уншина. Хэн юуг хариуцахыг тодорхой хэлэлцэх нь холбоог бодит болгоно.',
'resources|bond':'Нөөц, тогтвортой байдлын асуудал харилцан ойлголцох хэрэгцээтэй холбогдоно. Практик боломжоо нөгөө талын хэрэгцээтэй тулгаж ярилцах нь гол асуулт.',
'change|resources':'Шилжилтийн дараа юунд тулгуурлан тогтвортой байдлаа бий болгох вэ гэсэн асуулт гарна. Шинэ нөхцөлд хэрэгтэй цаг, чадвар, зардлаа дахин тооц.',
'resources|change':'Тогтсон нөөц, дадлыг өөрчлөлтөд хэрхэн авч орохыг эргэцүүлнэ. Хадгалж болох сууриа ялгаад, өөрчлөх хэсгээ жижиглэн турш.',
'conflict|boundary':'Зөрчилд дахин оролцохын оронд хариуцлага, зөвшөөрөх хязгаараа тодорхой болгох сэдэв гарна. Хэний хийх ёстой ажил болохыг ялгаж ярилц.',
'boundary|joy':'Тодорхой хязгаар, хариуцлага нь тайван байдал, дэмжлэгийг хадгалахтай холбогдож байна. Өөрийгөө хэт ачаалахгүйгээр сайн зүйлээ үргэлжлүүлэх боломжийг бод.',
'start|resources':'Санаачилгыг хэрэгжүүлэхэд бодит нөөц, ур чадвар, тогтмол ажил хэрэгтэй гэсэн холбоос гарна. Эхлэх хүсэлдээ таарсан боломжит хуваарь гарга.',
'clarity|start':'Тодруулсан зүйлээ үйлдэл болгох сэдэв гарч байна. Шийдвэрийн үндэслэлээ нэг өгүүлбэрээр бичээд, эхний алхмаа сонго.',
'change|rest':'Өөрчлөлтийн дараа шинэ байдлаа ойлгож, хүчээ нөхөх хэрэгцээг эргэцүүлнэ. Дараагийн өөрчлөлтийг шууд хийхээс өмнө юу сурсан гэдгээ тэмдэглэ.'
};
const joins={
'bond|conflict':'Харилцан ойлголцох хэрэгцээ ба санал зөрөлдөөн зэрэгцэж байна. Холбоо чухал байлаа ч зөрчлийг үл тоомсорлох үндэс болохгүй.',
'clarity|uncertainty':'Тодруулах хүсэл ба дутуу мэдээлэл зэрэгцэж байна. Итгэлтэй санагдаж буй дүгнэлтээ шалгах баримттай салгаж үз.',
'joy|loss':'Дэмжлэг, сэтгэл ханамжийн зэрэгцээ дутагдал, алдагдлын сэдэв бий. Нэг сайн шинж нөгөө хүндрэлтэй хэсгийг хүчингүй болгохгүй.',
'rest|start':'Үйлдэх хүсэл ба азнах хэрэгцээ зэрэгцэж байна. Бүхнийг зэрэг хөдөлгөхийн оронд бэлтгэлээ хангаад нэг алхам турших боломжийг бод.',
'boundary|change':'Өөрчлөх хэрэгцээ ба хадгалах хязгаар зэрэгцэж байна. Шинэ алхам хийхдээ аль үүрэг, хязгаарыг хэвээр авч явахаа тодруул.'
};
function state(entry,index,count){const card=byId.get(entry.id);if(!card||typeof entry.reversed!=='boolean')throw new Error('Invalid reading card');return {id:card.id,card,index,reversed:entry.reversed,position:positions[count][index],meaning:entry.reversed?card.reversed:card.upright,tags:themeIndex[card.id][entry.reversed?'reversed':'upright']};}
function name(s){return `${s.card.name} (${s.reversed?'урвуу':'шулуун'})`;}
function label(s){return themes[s.tags[0]].label;}
export function relate(a,b){
 const shared=a.tags.filter(t=>b.tags.includes(t));
 const contrast=Object.entries(joins).find(([key])=>{const [x,y]=key.split('|');return (a.tags.includes(x)&&b.tags.includes(y))||(a.tags.includes(y)&&b.tags.includes(x));});
 const evidence=`${a.index+1}. ${name(a)} → ${b.index+1}. ${name(b)}`;
 const directional=transitions[a.tags[0]+'|'+b.tags[0]];
 const text=directional?directional:contrast?contrast[1]:shared.length?`Хоёр картын дунд «${themes[shared[0]].label}» сэдэв давтагдана. ${a.position} дахь энэ сэдэв ${b.position.toLocaleLowerCase('mn')} дээр өөр өнцгөөс харагдаж байгаа тул энэ хэрэгцээнд дахин анхаарах нь нийт уншлагын гол сэдэв болно.`:`«${label(a)}» гэсэн сэдэв «${label(b)}» гэсэн өөр хэрэгцээтэй холбогдоно. ${themes[b.tags[0]].action}`;
 return {title:evidence,text,cardIds:[a.id,b.id],rule:directional?'transition':contrast?'tension':shared.length?'shared-theme':'different-themes'};
}
const positionFrames={
3:[['Өнгөрсөн · Одоо хүрч ирсэн нөлөө','Өмнөх туршлага, хэвшлийн ямар хэсэг өнөөдрийн сонголтод нөлөөлж байгааг энэ сэдэвтэй холбож хар.'],['Одоо · Өөрийн оролцоог харах','Яг одоо энэ сэдвийн аль хэсэгт өөрийн оролцоогоор нөлөөлж болохыг тодруул.'],['Ирээдүй · Боломжит чиглэл','Энэ нь одоогийн нөхцөл үргэлжилбэл анхаарч болох чиглэл. Таны сонголт, орчны өөрчлөлтөөр өөр үр дүн боломжтой.']],
10:[['Өнөөгийн нөлөө','Энэ нь дэлгэлтийн гол нөхцөл. Саадын карттай хамт уншина.'],['Хөндлөн саад','Энэ байрлалд эерэг карт ч хэтрүүлсэн, тохирохгүй эсвэл хүрэлцэхгүй нөөцийг эргэцүүлэх сэдэв болж болно. Эерэг утгыг шууд муу болгон урвуулахгүй.'],['Зорилго ба дээд боломж','Хүсэж буй чиглэлийг илэрхийлнэ; эцсийн үр дүнтэй адилтгахгүй.'],['Суурь нөхцөл','Ил харагдах байдлын ард юу байж болохыг эргэцүүлнэ; далд баримт илрүүлсэн гэсэн үг биш.'],['Өнгөрч буй нөлөө','Холдож буй нөхцөл буюу өнгөрсөн нөлөөг өнөөгийн картаас ялгаж уншина.'],['Ойртож буй нөлөө','Ойрын боломжит хөдөлгөөн; арав дахь эцсийн чиглэлтэй ижил байрлал биш.'],['Таны байр суурь','Өөрийн хандлага, оролцоо, хариуцлагыг харна.'],['Хүрээлэл ба орчин','Гадаад нөхцөлийг эргэцүүлнэ. Бусдын нууц бодол, санааг баталсан дүгнэлт гаргахгүй.'],['Найдвар ба айдас','Хүсэл болон айдсыг ажиглана. Айдас төрүүлсэн дүр нь тэр үйл явдал болно гэсэн мэдээ биш.'],['Боломжит үр дүн','Бусад есөн байрлалтай уялдуулан унших нөхцөлт чиглэл. Тогтсон амлалт, тохиолдох огноо биш.']]
};
export function synthesize(reading){
 if(!reading||![1,3,10].includes(reading.count)||!Array.isArray(reading.cards)||reading.cards.length!==reading.count||new Set(reading.cards.map(c=>c.id)).size!==reading.count)throw new Error('Incomplete or invalid spread');
 if(reading.count===10&&(!byId.has(reading.significator)||reading.cards.some(c=>c.id===reading.significator)))throw new Error('Invalid significator');
 const cards=reading.cards.map((e,i)=>state(e,i,reading.count));const current=cards[reading.count===3?1:0],future=cards[reading.count===10?9:reading.count===3?2:0];
 const stages=cards.map((s,i)=>({title:positionFrames[reading.count]?.[i][0]||'Энэ мөчийн эргэцүүлэл',cardIds:[s.id],text:`${name(s)}: ${s.meaning} ${positionFrames[reading.count]?.[i][1]||'Энэ нэг картаас өнгөрсөн, одоо, ирээдүйн гурван тусдаа үр дүн гаргахгүй.'}`}));
 const pairs=reading.count===3?[[0,1],[1,2],[0,2]]:reading.count===10?[[0,1],[2,3],[4,0],[0,5],[6,7],[8,9],[5,9]]:[];
 const links=pairs.map(([a,b])=>relate(cards[a],cards[b]));
 const counts=Object.fromEntries(Object.keys(suits).map(s=>[s,cards.filter(c=>c.card.suit===s).length]));
 const repeated=Object.entries(counts).filter(([,n])=>n>=2).sort((a,b)=>b[1]-a[1]);
 const suitReading={wa:'Санаачилга, хөдөлгөөн, хийж буй ажлын сэдэв давтагдаж байна.',cu:'Мэдрэмж, харилцаа, дэмжлэгийн сэдэв давтагдаж байна.',sw:'Бодол, шийдвэр, зөрчлийг ялган харах сэдэв давтагдаж байна.',pe:'Нөөц, ажил, бодит хэрэгжилтийн сэдэв давтагдаж байна.'};
 const patterns=repeated.map(([s,n])=>({title:`${suits[s]} · ${n}/${cards.length}`,text:s==='major'?'Томоохон амьдралын сэдвийг эргэцүүлэх дүрс олон байна. Үүнийг үйл явдал том эсвэл зайлшгүй болохын хэмжүүр болгохгүй.':`«${suits[s]}» масть давтагдсан. ${suitReading[s]} Карт тус бүрийн байрлал, утгын ялгааг хамт уншина.`,cardIds:cards.filter(c=>c.card.suit===s).map(c=>c.id)}));
 const reversed=cards.filter(c=>c.reversed);if(reversed.length)patterns.push({title:`Урвуу · ${reversed.length}/${cards.length}`,text:'Урвуу бүрийг тухайн картын өөрийн урвуу утгаар уншсан. Олон урвуу карт гарсныг муу аз, хаалт эсвэл сөрөг үр дүнгийн оноо гэж тооцоогүй.',cardIds:reversed.map(c=>c.id)});
 let summary=reading.count===3?`Өнгөрсөн байрлалын ${name(cards[0])} нь «${label(cards[0])}» сэдвийг авчирна. Одоогийн ${name(current)} энэ нөлөөг «${label(current)}» гэсэн өнцгөөр үргэлжлүүлж, ирээдүйн байрлалын ${name(future)} нь «${label(future)}» гэсэн боломжит чиглэлийг эргэцүүлнэ. ${relate(current,future).text}`:reading.count===10?`Гол нөхцөл дэх ${name(current)}-ыг хөндлөн саадын ${name(cards[1])}-тай хамт уншихад: ${relate(current,cards[1]).text} Эцсийн байрлалын ${name(future)} нь «${label(future)}» гэсэн чиглэлийг эргэцүүлэх сэдэв; зорилго болон айдсын байрлалыг үр дүн болгож солиогүй.`:`${name(current)} нь «${label(current)}» гэсэн сэдвийг өнөөдрийн эргэцүүлэлд авчирна. ${current.meaning}`;
 const actions=[...new Set([...current.tags,future.tags[0]])].slice(0,3).map(t=>({title:themes[t].label,text:themes[t].action,cardIds:cards.filter(c=>c.tags.includes(t)).map(c=>c.id)}));
 return {version:'1.0.0',count:reading.count,cards,summary,stages,links,patterns,actions,significator:reading.count===10?byId.get(reading.significator):null,method:'Waite-ийн картын утга ба Кельтийн байрлалд тулгуурласан редакцын нэгдүүлэлт. Гурван картын цаг хугацааны загвар, сэдвийн индекс, карт хоорондын холбоос нь сайтын боловсруулсан арга; Waite-ийн бэлэн хослолын хүснэгт биш.',sources:['https://sacred-texts.com/tarot/pkt/pkt0304.htm','https://sacred-texts.com/tarot/pkt/pkt0307.htm']};
}
export function synthesisParagraphs(reading,full=false){const s=synthesize(reading);return [{label:'Нэгдсэн тайлал',text:s.summary},...(full?[...s.stages,...s.links,...s.patterns].map(p=>({label:p.title,text:p.text})):[]),...s.actions.map(p=>({label:'Дараагийн алхам · '+p.title,text:p.text})),{label:'Тайллын арга',text:s.method}];}
