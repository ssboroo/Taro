import {readFileSync,writeFileSync,readdirSync,mkdirSync,cpSync} from 'node:fs';
import {resolve,extname,relative} from 'node:path';
const project=resolve(process.argv[2]||'.');
const read=p=>readFileSync(resolve(project,p),'utf8');
const specs=[['public/deck.js',['deck','suits']],['public/engine.js',['positions']],['server/synthesis.js',['synthesize']],['server/payments.js',['paymentApi','paymentConfigured','d1Store']]];
const modules=specs.map(([p,names])=>'const {'+names.join(',')+'}=(()=>{\n'+read(p).replace(/^import .*?;\s*$/gm,'').replace(/^export /gm,'')+'\nreturn {'+names.join(',')+'};})();');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml'};
const assets={};for(const entry of readdirSync(resolve(project,'public'),{recursive:true,withFileTypes:true})){if(!entry.isFile())continue;const p=resolve(entry.parentPath||entry.path,entry.name),key='/'+relative(resolve(project,'public'),p);if(key==='/synthesis.js')throw Error('Synthesis must remain server-only');assets[key]=[mime[extname(p)]||'application/octet-stream',readFileSync(p,'utf8')];}
const source=modules.join('\n')+'\nconst ASSET_MAP='+JSON.stringify(assets)+';\n'+read('worker/handler.js');
mkdirSync(resolve(project,'dist/server'),{recursive:true});mkdirSync(resolve(project,'dist/.openai'),{recursive:true});writeFileSync(resolve(project,'dist/server/index.js'),source);cpSync(resolve(project,'.openai/hosting.json'),resolve(project,'dist/.openai/hosting.json'));console.log('Built payment Worker with '+Object.keys(assets).length+' embedded assets');
