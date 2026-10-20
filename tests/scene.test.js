import test from 'node:test';
import assert from 'node:assert/strict';
import {perspective,multiply,model,project,insidePolygon} from '../public/scene-math.js';
test('perspective projects centered card to viewport center',()=>{
 const m=multiply(perspective(16/9),model(0,0,-5,0,0,0,1,1.7));
 const center=project(m,0,0,1600,900);assert.deepEqual(center,[800,450]);
 const a=project(m,-.5,-.5,1600,900),b=project(m,.5,.5,1600,900);
 assert.ok(a[0]<800&&a[1]>450);assert.ok(b[0]>800&&b[1]<450);
});
test('3D card hit detection follows rotated projected quad',()=>{
 const m=multiply(perspective(1.5),model(.5,.2,-4,.1,.4,.6,.7,1.2));
 const poly=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(v=>project(m,...v,1200,800));
 assert.equal(insidePolygon(project(m,0,0,1200,800),poly),true);
 assert.equal(insidePolygon([0,0],poly),false);
});
test('nearer cards appear larger and all mobile projections stay finite',()=>{
 const p=perspective(.46);let sizes=[];
 for(const z of [-5,-3]){const m=multiply(p,model(0,0,z,0,0,0,.8,1.3));const a=project(m,-.5,0,390,844),b=project(m,.5,0,390,844);sizes.push(b[0]-a[0]);assert.ok([...m].every(Number.isFinite));}
 assert.ok(sizes[1]>sizes[0]);
});
