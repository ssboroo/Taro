import {shuffled,randomInt} from './engine.js';
export class SelectionSession {
 constructor(deck,{count=1,significator=null,reversed=false,question='',topic='Ерөнхий'}={},rng=randomInt){
  if(![1,3,10].includes(count))throw new RangeError('Invalid spread');
  if(count===10&&!deck.some(c=>c.id===significator))throw new Error('Significator required');
  this.count=count;this.significator=count===10?significator:null;this.reversed=reversed;this.question=question;this.topic=topic;this.rng=rng;this.selected=[];
  this.pool=shuffled(deck.filter(c=>c.id!==this.significator),rng);
  if(count===10)for(let i=0;i<3;i++){const cut=1+rng(this.pool.length-1);this.pool=[...this.pool.slice(cut),...this.pool.slice(0,cut)];}
 }
 get complete(){return this.selected.length===this.count;}
 choose(index){if(this.complete||!Number.isInteger(index)||index<0||index>=this.pool.length||this.selected.some(x=>x.index===index))return null;const entry={id:this.pool[index].id,index,reversed:this.reversed&&this.rng(2)===1};this.selected.push(entry);return entry;}
}
export function orbitPose(index,total,rotation=0){const a=index/total*Math.PI*2+rotation;return {x:Math.sin(a),y:Math.cos(a),z:Math.cos(a),yaw:-Math.sin(a)*.5,angle:a};}
