import {paymentApi} from './server/payments.js';
import {createNodeStore} from './server/node-store.js';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('public');
const portOption=process.argv.indexOf('--port');const listenPort=Number(process.env.PORT||(portOption>=0?process.argv[portOption+1]:3000));
const paymentStore=createNodeStore(process.env.PAYMENT_DB_PATH||'data/payments.sqlite');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
export const server = http.createServer(async (req, res) => {
  if(req.url.startsWith('/api/payments/')){try{const origin=process.env.PUBLIC_SITE_URL||'http://localhost:'+listenPort;const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(v!==undefined)headers.set(k,Array.isArray(v)?v.join(','):v);const chunks=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>16384){res.writeHead(413);res.end();return;}chunks.push(chunk);}const request=new Request(new URL(req.url,origin),{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});const response=await paymentApi(request,process.env,{store:paymentStore});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Төлбөрийн үйлчилгээ түр боломжгүй байна.'}));}return;}
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path === '/health') {res.writeHead(200, {'Content-Type':'application/json'});return res.end('{"status":"ok"}');}
    const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));
    if (!file.startsWith(root + sep)) {res.writeHead(403);return res.end();}
    const data = await readFile(file);
    res.writeHead(200, {'Content-Type': types[extname(file)] || 'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; img-src 'self' https://raw.githubusercontent.com https://cdn.jsdelivr.net data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",'Cache-Control':'no-cache'});
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});res.end('Хуудас олдсонгүй.');}
});
server.listen(listenPort, '0.0.0.0', () => console.log('RAINY Тарот сервер бэлэн'));
