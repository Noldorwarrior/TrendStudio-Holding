/* S45: Pipeline Gantt (Phase 2B). Registers 'pipeline_gantt' on TS.Charts.
   7 projects x 16 quarters (2025-Q1..2028-Q4). Colour by stage, stripe=series,
   dashed release line + gear glyph, click -> drilldown:open (chart=pipeline). */
(function(){
'use strict';
var NS='http://www.w3.org/2000/svg';
var QS=['2025-Q1','2025-Q2','2025-Q3','2025-Q4','2026-Q1','2026-Q2','2026-Q3','2026-Q4','2027-Q1','2027-Q2','2027-Q3','2027-Q4','2028-Q1','2028-Q2','2028-Q3','2028-Q4'];
function qi(s){if(!s)return -1;s=String(s).trim();var m=s.match(/^(\d{4})-Q([1-4])$/);if(m)return(+m[1]-2025)*4+(+m[2]-1);m=s.match(/^Q([1-4])\s+(\d{4})$/);if(m)return(+m[2]-2025)*4+(+m[1]-1);return -1;}
function t(k,fb){var I=(typeof window!=='undefined')?window.I18N:null;if(I&&typeof I.t==='function'){var v=I.t(k);if(v&&String(v).charAt(0)!=='[')return v;}return fb||k;}
function gp(){var T=(typeof window!=='undefined')?window.TS:null;if(T&&typeof T.data==='function'){var d=T.data();if(d&&d.pipeline&&Array.isArray(d.pipeline.projects))return d.pipeline.projects;}return [];}
function el(tag,a){var e=document.createElementNS(NS,tag);if(a)for(var k in a){if(a.hasOwnProperty(k))e.setAttribute(k,a[k]);}return e;}
function render(container,payload){
if(!container)return null;
container.innerHTML='';
container.classList.add('ts-chart-pipeline-gantt');
var TS=window.TS,C=TS&&TS.Charts;if(!C)return null;
var projects=gp();if(projects.length>7)projects=projects.slice(0,7);
var W=container.clientWidth||720,H=container.clientHeight||360;if(H<260)H=260;
var svg=C.createSVG(container,W,H);
svg.setAttribute('aria-label',t('a11y.chart.pipeline.label','Пайплайн проектов: диаграмма Ганта 7 проектов, 2025-Q1 … 2028-Q4'));
var tn=el('title');tn.textContent=t('ui.chart.pipeline.title','Пайплайн проектов 2025–2028');svg.appendChild(tn);
var PL=90,PR=18,PT=34,PB=52;
var pW=W-PL-PR,pH=H-PT-PB,cW=pW/QS.length;
var rH=pH/Math.max(projects.length,1),bH=Math.max(14,Math.min(26,rH-6));
var defs=el('defs');
var pat=el('pattern',{id:'ts-gantt-stripes',width:'6',height:'6',patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'});
pat.appendChild(el('rect',{width:'6',height:'6',fill:'rgba(255,255,255,0.14)'}));
pat.appendChild(el('rect',{width:'2',height:'6',fill:'rgba(255,255,255,0.38)'}));
defs.appendChild(pat);svg.appendChild(defs);
var ttl=el('text',{x:String(PL),y:'20',fill:'#E8EAED','font-size':'14','font-weight':'600','class':'ts-gantt-title'});
ttl.textContent=t('ui.chart.pipeline.title','Пайплайн проектов 2025–2028');svg.appendChild(ttl);
var ax=el('g',{'class':'ts-gantt-axis-x'});
for(var i=0;i<QS.length;i++){
var qx=PL+i*cW;
var lb=el('text',{x:String(qx+cW/2),y:String(PT-6),'text-anchor':'middle',fill:'#9CA3AF','font-size':'10'});
lb.textContent=QS[i].slice(2);ax.appendChild(lb);
ax.appendChild(el('line',{x1:String(qx),x2:String(qx),y1:String(PT),y2:String(PT+pH),stroke:(i%4===0)?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.06)','stroke-width':(i%4===0)?'1':'0.5'}));
}
ax.appendChild(el('line',{x1:String(PL+pW),x2:String(PL+pW),y1:String(PT),y2:String(PT+pH),stroke:'rgba(255,255,255,0.18)'}));
svg.appendChild(ax);
var yg=el('g',{'class':'ts-gantt-axis-y'});
for(var p=0;p<projects.length;p++){
var py=PT+p*rH+rH/2;
var yl=el('text',{x:String(PL-8),y:String(py+4),'text-anchor':'end',fill:'#C9A961','font-size':'11','font-weight':'600'});
yl.textContent=projects[p].code||('P'+(p+1));yg.appendChild(yl);
}
svg.appendChild(yg);
var bg=el('g',{'class':'ts-gantt-bars'});svg.appendChild(bg);
for(var b=0;b<projects.length;b++){
var pr=projects[b],sI=qi(pr.start),eI=qi(pr.end);
if(sI<0||eI<0)continue;if(eI<sI)eI=sI;
var bx=PL+sI*cW+2,bw=Math.max(cW,(eI-sI+1)*cW-4),by=PT+b*rH+(rH-bH)/2;
var stage=pr.stage||'prod',color=(C.palette.stage&&C.palette.stage[stage])||C.palette.base;
var g=el('g',{'class':'ts-gantt-bar','data-project-id':pr.id||('p'+(b+1)),'data-project-code':pr.code||('P'+(b+1)),'data-stage':stage,'data-type':pr.type||'film',role:'button',tabindex:'0'});
g.style.cursor='pointer';
g.appendChild(el('rect',{x:String(bx),y:String(by),width:String(bw),height:String(bH),rx:'3',fill:color,stroke:'rgba(0,0,0,0.35)','stroke-width':'1'}));
if(pr.type==='series')g.appendChild(el('rect',{x:String(bx),y:String(by),width:String(bw),height:String(bH),rx:'3',fill:'url(#ts-gantt-stripes)'}));
var nm=t('ui.project.'+(pr.code||'p'+(b+1)).toLowerCase()+'.name',pr.name||pr.code||'');
var mc=Math.floor(bw/7),lt=String(nm);if(lt.length>mc&&mc>3)lt=lt.slice(0,mc-1)+'\u2026';
var tx=el('text',{x:String(bx+6),y:String(by+bH/2+4),fill:'#FFFFFF','font-size':'11','font-weight':'600','pointer-events':'none'});
tx.textContent=lt;g.appendChild(tx);
var rI=qi(pr.release);
if(rI>=0){
var rx=PL+rI*cW+cW/2;
g.appendChild(el('line',{x1:String(rx),x2:String(rx),y1:String(by-2),y2:String(by+bH+2),stroke:C.palette.stage.release||'#388E3C','stroke-width':'1.5','stroke-dasharray':'3,2','class':'ts-gantt-release-line'}));
var gr=el('text',{x:String(rx),y:String(by+bH/2+4),'text-anchor':'middle',fill:'#FFFFFF','font-size':'12','pointer-events':'none','class':'ts-gantt-release-mark'});
gr.textContent='\u2699';g.appendChild(gr);
}
g.setAttribute('aria-label',(pr.code||'')+' '+(pr.name||'')+', '+(pr.stage_ru||stage)+', '+(pr.start||'')+' — '+(pr.end||'')+', бюджет '+(pr.budget_mrub||0)+' млн ₽, выручка '+(pr.revenue_mrub||0)+' млн ₽');
(function(gE,R){
gE.addEventListener('mouseenter',function(){C.tooltip(gE.querySelector('rect')||gE,(R.code||'')+' «'+(R.name||'')+'», '+(R.stage_ru||R.stage||'')+', '+(R.start||'')+' \u2192 '+(R.end||'')+', бюджет '+(R.budget_mrub||0)+', revenue '+(R.revenue_mrub||0));});
gE.addEventListener('mouseleave',function(){C.tooltip(gE,'');});
function op(){if(TS&&TS.emit)TS.emit('drilldown:open',{chart:'pipeline',payload:{projectId:R.id,code:R.code,name:R.name,type:R.type,stage:R.stage,stage_ru:R.stage_ru,start:R.start,end:R.end,release:R.release,budget_mrub:R.budget_mrub,revenue_mrub:R.revenue_mrub}});}
gE.addEventListener('click',op);
gE.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();op();}});
})(g,pr);
bg.appendChild(g);
}
var lh=document.createElement('div');
lh.className='ts-gantt-legend-host';
lh.style.cssText='position:absolute;left:0;right:0;bottom:4px;padding:0 '+PL+'px;';
if(getComputedStyle(container).position==='static')container.style.position='relative';
container.appendChild(lh);
C.legend(lh,[
{color:C.palette.stage.script,label:t('ui.chart.pipeline.legend.stage.script','Сценарий')},
{color:C.palette.stage.dev,label:t('ui.chart.pipeline.legend.stage.dev','Разработка')},
{color:C.palette.stage.pre,label:t('ui.chart.pipeline.legend.stage.pre','Pre-Production')},
{color:C.palette.stage.prod,label:t('ui.chart.pipeline.legend.stage.prod','Production')},
{color:C.palette.stage.post,label:t('ui.chart.pipeline.legend.stage.post','Post-Production')}
]);
var sc=(payload&&payload.scenario)||(TS&&TS.scenario)||'base';
svg.setAttribute('data-scenario',sc);
return {svg:svg,update:function(n){var ns=(n&&n.scenario)||sc;if(ns!==sc)render(container,{scenario:ns});},destroy:function(){container.innerHTML='';}};
}
var TS=(typeof window!=='undefined')?window.TS:(typeof globalThis!=='undefined'?globalThis.TS:null);
if(TS&&TS.Charts&&typeof TS.Charts.register==='function')TS.Charts.register('pipeline_gantt',render);
})();
