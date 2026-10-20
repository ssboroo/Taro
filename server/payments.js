import {synthesize} from './synthesis.js';
export const PRICE_MNT=5000;
const encoder=new TextEncoder();
export class PaymentError extends Error{constructor(message,status=400){super(message);this.status=status;}}
export async function sha256(text){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(text))),x=>x.toString(16).padStart(2,'0')).join('');}
function safeEqual(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
export function cleanReading(r){if(!r||![1,3,10].includes(r.count)||!Array.isArray(r.cards)||r.cards.length!==r.count)throw new PaymentError('Дэлгэлтийн мэдээлэл буруу байна.');const clean={count:r.count,cards:r.cards.map(e=>({id:e?.id,reversed:e?.reversed})),significator:r.count===10?r.significator:null};try{synthesize(clean);}catch{throw new PaymentError('Дэлгэлтийн карт, байрлалыг шалгана уу.');}return clean;}
export function paymentConfigured(env){return /^sk_live_[A-Za-z0-9_-]+$/.test(env.WIRE_MN_API_KEY||'')&&/^[A-Za-z0-9_-]{1,100}$/.test(env.WIRE_QPAY_OPERATOR_ID||'');}
export function trustedCheckout(url){try{const u=new URL(url);if(u.protocol!=='https:'||u.hostname!=='pay.wire.mn'||u.username||u.password||u.port)throw Error();return u.href;}catch{throw new PaymentError('Төлбөрийн холбоос баталгаагүй байна.',502);}}
export async function verifySignature(raw,header,secret,now=Date.now()){
 if(!secret)return false;const parts=header.split(',').map(x=>x.trim()),ts=parts.filter(x=>x.startsWith('t='));if(ts.length!==1||!/^\d+$/.test(ts[0].slice(2)))return false;const timestamp=ts[0].slice(2);if(Math.abs(now/1000-Number(timestamp))>300)return false;const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const bytes=await crypto.subtle.sign('HMAC',key,encoder.encode(timestamp+'.'+raw));const expected=Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');return parts.filter(x=>x.startsWith('v1=')).some(x=>safeEqual(expected,x.slice(3).toLowerCase()));
}
export function matchesPayment(order,intent,operator){return intent.id===order.intent_id&&intent.status==='succeeded'&&intent.amount===PRICE_MNT&&intent.currency==='MNT'&&intent.livemode===true&&intent.metadata?.app==='rainy-tarot'&&intent.metadata?.order_id===order.id&&intent.selected_operator===operator;}
export function d1Store(db){return {
 get:id=>db.prepare('SELECT * FROM tarot_orders WHERE id = ?').bind(id).first(),
 byIntent:id=>db.prepare('SELECT * FROM tarot_orders WHERE intent_id = ?').bind(id).first(),
 insert:o=>db.prepare('INSERT OR IGNORE INTO tarot_orders (id,token_hash,fingerprint,reading_json,status,amount,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind(o.id,o.token_hash,o.fingerprint,o.reading_json,'pending',PRICE_MNT,o.created_at,o.created_at).run(),
 intent:(id,value,expires)=>db.prepare('UPDATE tarot_orders SET intent_id = ?,expires_at = ?,updated_at = ? WHERE id = ? AND intent_id IS NULL').bind(value,expires,Date.now(),id).run(),
 checkout:(id,url)=>db.prepare('UPDATE tarot_orders SET checkout_url = ?,updated_at = ? WHERE id = ?').bind(url,Date.now(),id).run(),
 checked:id=>db.prepare('UPDATE tarot_orders SET checked_at = ? WHERE id = ?').bind(Date.now(),id).run(),
 paid:id=>db.prepare("UPDATE tarot_orders SET status = 'paid',paid_at = COALESCE(paid_at,?),updated_at = ? WHERE id = ? AND intent_id IS NOT NULL").bind(Date.now(),Date.now(),id).run()
};}
async function wireRequest(env,path,body,idempotency,fetcher){
 let response;try{response=await fetcher('https://api.wire.mn/v1'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+env.WIRE_MN_API_KEY,...(body?{'Content-Type':'application/json','Idempotency-Key':idempotency}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});}catch{throw new PaymentError('QPay холболт түр хариу өгөхгүй байна. Дахин шалгана уу.',503);}
 if(!response.ok)throw new PaymentError('QPay төлбөрийн үйлчилгээнд холбогдож чадсангүй. Давхар төлөхөөс өмнө төлөвөө шалгана уу.',503);try{return await response.json();}catch{throw new PaymentError('Төлбөрийн хариу буруу байна.',502);}
}
async function authorized(store,id,token){if(!/^[a-zA-Z0-9-]{16,80}$/.test(id)||!/^[a-f0-9]{64}$/.test(token))throw new PaymentError('Төлбөрийн эрх олдсонгүй.',404);const o=await store.get(id);if(!o||!safeEqual(o.token_hash,await sha256(token)))throw new PaymentError('Төлбөрийн эрх олдсонгүй.',404);return o;}
async function reconcile(store,env,order,fetcher){if(order.status==='paid'||!order.intent_id)return order;if(!paymentConfigured(env))throw new PaymentError('QPay холболтыг тохируулж байна.',503);const pi=await wireRequest(env,'/payment_intents/'+encodeURIComponent(order.intent_id),null,null,fetcher);await store.checked(order.id);if(matchesPayment(order,pi,env.WIRE_QPAY_OPERATOR_ID)){await store.paid(order.id);return {...order,status:'paid'};}if(pi.status==='succeeded')throw new PaymentError('Төлбөрийн дүн, захиалга эсвэл оператор таарахгүй байна. Дэмжлэгтэй холбогдоно уу.',409);return {...order,provider_status:pi.status};}
function json(data,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});}
async function bodyText(request){const advertised=Number(request.headers.get('content-length')||0);if(advertised>16384)throw new PaymentError('Хүсэлт хэт том байна.',413);const bytes=await request.arrayBuffer();if(bytes.byteLength>16384)throw new PaymentError('Хүсэлт хэт том байна.',413);return new TextDecoder().decode(bytes);}
function view(order){return {id:order.id,status:order.status,price:PRICE_MNT,currency:'MNT',expiresAt:order.expires_at||null,...(order.status!=='paid'&&order.checkout_url?{checkoutUrl:trustedCheckout(order.checkout_url)}:{}),...(order.provider_status?{providerStatus:order.provider_status}:{})};}
export async function paymentApi(request,env,{store,fetcher=fetch}={}){
 const url=new URL(request.url),path=url.pathname;
 try{
  if(path==='/api/payments/config'&&request.method==='GET')return json({price:PRICE_MNT,currency:'MNT',label:'QPay',enabled:paymentConfigured(env)&&!!store});
  if(!store)throw new PaymentError('Төлбөрийн санг тохируулж байна. Одоогоор төлбөр авахгүй.',503);
  if(path==='/api/payments/webhook'&&request.method==='POST'){
   const raw=await bodyText(request);if(!await verifySignature(raw,request.headers.get('WirePayment-Signature')||'',env.WIRE_MN_WEBHOOK_SECRET))throw new PaymentError('Invalid signature',400);const event=JSON.parse(raw);if(event.type==='payment_intent.succeeded'){const pi=event.data?.object?.id||event.data?.id;if(typeof pi!=='string')throw new PaymentError('Invalid event');const o=await store.byIntent(pi);if(o)await reconcile(store,env,o,fetcher);}return json({received:true});
  }
  if(request.method!=='GET'&&request.headers.get('origin')!==url.origin)throw new PaymentError('Хүсэлтийн эх сурвалж буруу байна.',403);
  if(path==='/api/payments/orders'&&request.method==='POST'){
   if(!(request.headers.get('content-type')||'').startsWith('application/json'))throw new PaymentError('JSON хүсэлт шаардлагатай.',415);
   let v;try{v=JSON.parse(await bodyText(request));}catch(e){if(e instanceof PaymentError)throw e;throw new PaymentError('Хүсэлт буруу байна.');}
   if(!/^[a-zA-Z0-9-]{16,80}$/.test(v.id)||!/^[a-f0-9]{64}$/.test(v.token))throw new PaymentError('Захиалгын мэдээлэл буруу байна.');
   const reading=cleanReading(v.reading),serialized=JSON.stringify(reading),fingerprint=await sha256(serialized);let order=await store.get(v.id);
   if(order){order=await authorized(store,v.id,v.token);if(order.fingerprint!==fingerprint)throw new PaymentError('Энэ төлбөр өөр дэлгэлтэд хамаарна. Шинэ дэлгэлт үүсгэнэ үү.',409);if(order.status==='paid')return json(view(order));}
   if(!paymentConfigured(env))throw new PaymentError('QPay холболтыг тохируулж байна. Одоогоор төлбөр авахгүй.',503);
   if(!order){await store.insert({id:v.id,token_hash:await sha256(v.token),fingerprint,reading_json:serialized,created_at:Date.now()});order=await authorized(store,v.id,v.token);if(order.fingerprint!==fingerprint)throw new PaymentError('Захиалгын дугаар давхардлаа.',409);}
   if(order.intent_id){order=await reconcile(store,env,order,fetcher);if(order.status==='paid')return json(view(order));if(order.expires_at&&order.expires_at<=Date.now())throw new PaymentError('Нэхэмжлэлийн хугацаа дууссан. Төлсөн бол “Төлбөр шалгах”-ыг дарна уу. Дэмжлэгтэй холбогдож нэхэмжлэлээ шинэчлүүлнэ үү.',410);}
   if(order.checkout_url)return json(view(order));
   if(!order.intent_id){const pi=await wireRequest(env,'/payment_intents',{amount:PRICE_MNT,currency:'MNT',description:'RAINY Тарот · Нэг дэлгэлтийн тайлал',automatic_operator:false,allowed_operators:[env.WIRE_QPAY_OPERATOR_ID],metadata:{app:'rainy-tarot',order_id:order.id}},'tarot-'+order.id+'-create',fetcher);if(!/^pi_[A-Za-z0-9_-]+$/.test(pi.id)||pi.amount!==PRICE_MNT||pi.currency!=='MNT'||pi.livemode!==true)throw new PaymentError('Нэхэмжлэлийн мэдээлэл таарахгүй байна.',502);await store.intent(order.id,pi.id,Number.isFinite(pi.expires_at)?pi.expires_at*1000:null);order=await authorized(store,order.id,v.token);}
   const origin=new URL(env.PUBLIC_SITE_URL||url.origin);if(origin.protocol!=='https:')throw new PaymentError('Төлбөрийн буцах хаяг тохируулаагүй байна.',503);
   const back=new URL('/?payment='+order.id,origin).href;
   const checkout=await wireRequest(env,'/checkout/sessions',{payment_intent:order.intent_id,success_url:back,cancel_url:back},'tarot-'+order.id+'-checkout',fetcher);const checkoutUrl=trustedCheckout(checkout.url);await store.checkout(order.id,checkoutUrl);return json(view({...order,checkout_url:checkoutUrl}));
  }
  const match=path.match(/^\/api\/payments\/orders\/([a-zA-Z0-9-]{16,80})(\/reading)?$/);
  if(match&&['GET','POST'].includes(request.method)){
   const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');let order=await authorized(store,match[1],token);
   if(request.method==='POST'){if(match[2])throw new PaymentError('Method not allowed',405);if(order.status!=='paid'&&Date.now()-(order.checked_at||0)<2500)throw new PaymentError('Төлөвийг хэдэн секундийн дараа дахин шалгана уу.',429);order=await reconcile(store,env,order,fetcher);}
   if(match[2]){if(order.status!=='paid')throw new PaymentError('Тайллыг нээхийн тулд 5,000₮ төлбөрөө баталгаажуулна уу.',402);const reading=JSON.parse(order.reading_json);return json({orderId:order.id,reading,synthesis:synthesize(reading)});}
   return json(view(order));
  }
  return json({error:'Хуудас олдсонгүй.'},404);
 }catch(e){return json({error:e instanceof PaymentError?e.message:'Төлбөрийн үйлчилгээнд алдаа гарлаа. Төлөвөө шалгаад дахин оролдоно уу.'},e instanceof PaymentError?e.status:500);}
}
