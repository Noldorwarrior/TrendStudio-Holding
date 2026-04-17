/* S47: Chart-6 MC IRR Distribution. Contract: 40_CONTRACTS.md §1/§2.2/§7. */
(function(){'use strict';
var TS=(typeof window!=='undefined')?(window.TS=window.TS||{}):(globalThis.TS=globalThis.TS||{});
if(!TS.Charts||typeof TS.Charts.register!=='function')return;
var NS='http://www.w3.org/2000/svg',W=760,H=360,PAD={left:48,right:16,top:28,bottom:44};
function erf(x){var s=x<0?-1:1;x=Math.abs(x);var t=1/(1+0.3275911*x);
 return s*(1-((((1.061405429*t-1.453152027)*t+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x));}
function ncdf(x,m,s){return 0.5*(1+erf((x-m)/(Math.SQRT2*s)));}
function _i(k,f){var I=window.I18N;if(I&&I.t){var v=I.t(k);if(v&&v!==k)return v;}return f||k;}
function pick(lv,n){return lv[String(n)]||lv[n];}
function interp(lv,st){if(!lv)return{mean_shift:0,sigma_mult:1};
 var ks=Object.keys(lv).map(Number).sort(function(a,b){return a-b;}),n=ks.length;
 if(st<=ks[0])return pick(lv,ks[0]);if(st>=ks[n-1])return pick(lv,ks[n-1]);
 for(var i=0;i<n-1;i++){var lo=ks[i],hi=ks[i+1];if(st>=lo&&st<=hi){
  var t=(st-lo)/(hi-lo),a=pick(lv,lo),b=pick(lv,hi);
  return{mean_shift:a.mean_shift+(b.mean_shift-a.mean_shift)*t,sigma_mult:a.sigma_mult+(b.sigma_mult-a.sigma_mult)*t};}}
 return pick(lv,ks[0]);}
function regen(bb,mu0,sg0,sh,ml){var mu=mu0+sh,sg=Math.max(0.1,sg0*ml),o=[],sB=0,sO=0;
 for(var i=0;i<bb.length;i++){var b=bb[i],p=Math.max(0,ncdf(b.bin_high,mu,sg)-ncdf(b.bin_low,mu,sg));
  o.push({bin_low:b.bin_low,bin_high:b.bin_high,prob:p});sB+=b.prob;sO+=p;}
 if(sO>0&&sB>0){var sc=sB/sO;for(var j=0;j<o.length;j++)o[j].prob*=sc;}return o;}

TS.Charts.register('mc_distribution',function(container,payload){
 payload=payload||{};var stress=(typeof payload.stress==='number')?payload.stress:0;
 var data=(TS.data&&TS.data())||{},mc=data.mc||{};
 var bb=Array.isArray(mc.irr_distribution)?mc.irr_distribution:[];
 var lv=mc.stress_levels||{0:{mean_shift:0,sigma_mult:1}};
 var det=(typeof mc.det_line==='number')?mc.det_line:20.09;
 var pc=mc.percentiles||{};
 var mu0=(typeof pc.mean==='number')?pc.mean:(typeof pc.p50==='number'?pc.p50:11.44);
 var sg0=(typeof mc.stdev==='number')?mc.stdev:6.47;

 container.innerHTML='';container.classList.add('ts-chart-mc');
 container.setAttribute('role','figure');
 container.setAttribute('aria-label',_i('a11y.chart.mc.label','MC IRR distribution'));
 var tt=document.createElement('div');tt.className='ts-chart-mc-title';
 tt.textContent=_i('ui.chart.mc.title','Monte Carlo — IRR');
 tt.style.cssText='font:13px Inter,sans-serif;color:#F5F5F5;margin:0 0 6px 2px;';
 container.appendChild(tt);
 var svg=TS.Charts.createSVG(container,W,H);svg.setAttribute('class','ts-chart-mc-svg');
 var pal=TS.Charts.palette,gold=pal.gold||'#C9A961';
 TS.Charts.legend(container,[
  {color:'#6C8FB3',label:_i('ui.chart.mc.legend.distribution','Distribution')},
  {color:gold,label:_i('ui.chart.mc.legend.det','Det IRR')},
  {color:pal.negative,label:_i('ui.chart.mc.legend.p5','P5')},
  {color:pal.neutral,label:_i('ui.chart.mc.legend.p50','P50')},
  {color:pal.positive,label:_i('ui.chart.mc.legend.p95','P95')}]);

 function el(n,a){var e=document.createElementNS(NS,n);if(a)for(var k in a)e.setAttribute(k,a[k]);return e;}

 function draw(cs){
  while(svg.firstChild)svg.removeChild(svg.firstChild);
  var pr=interp(lv,cs),bins=(cs>0&&bb.length>0)?regen(bb,mu0,sg0,pr.mean_shift,pr.sigma_mult):bb.slice();
  if(!bins.length)return;
  var xMin=bins[0].bin_low,xMax=bins[bins.length-1].bin_high,mP=0;
  for(var i=0;i<bins.length;i++)if(bins[i].prob>mP)mP=bins[i].prob;if(mP<=0)mP=1;
  var pw=W-PAD.left-PAD.right,ph=H-PAD.top-PAD.bottom;
  function X(v){return PAD.left+(v-xMin)/(xMax-xMin)*pw;}
  function Y(v){return PAD.top+ph-(v/mP)*ph;}
  // grid
  for(var g=0;g<=4;g++){var gy=PAD.top+ph-(g/4)*ph;
   svg.appendChild(el('line',{x1:PAD.left,x2:W-PAD.right,y1:gy,y2:gy,stroke:'rgba(255,255,255,0.06)'}));
   var tl=el('text',{x:PAD.left-6,y:gy+4,'text-anchor':'end','font-size':10,fill:'#9CA3AF'});
   tl.textContent=(mP*(g/4)*100).toFixed(1)+'%';svg.appendChild(tl);}
  // bars
  for(var b=0;b<bins.length;b++){(function(bn){
   var bx=X(bn.bin_low),bw=Math.max(1,X(bn.bin_high)-X(bn.bin_low)-1),by=Y(bn.prob),bh=Math.max(0,(PAD.top+ph)-by);
   var r=el('rect',{x:bx,y:by,width:bw,height:bh,fill:'#6C8FB3','fill-opacity':0.85,
    stroke:'rgba(255,255,255,0.12)','stroke-width':0.5,'class':'ts-mc-bar',
    'data-bin-low':String(bn.bin_low),'data-bin-high':String(bn.bin_high),'data-prob':String(bn.prob),
    'data-point':'1',tabindex:'0',role:'button',
    'aria-label':'IRR '+bn.bin_low.toFixed(1)+'..'+bn.bin_high.toFixed(1)+'%, p='+(bn.prob*100).toFixed(2)+'%'});
   r.addEventListener('mouseenter',function(){TS.Charts.tooltip(r,
    'IRR \u2208 ['+bn.bin_low.toFixed(1)+', '+bn.bin_high.toFixed(1)+']%, prob '+(bn.prob*100).toFixed(2)+'%');});
   r.addEventListener('mouseleave',function(){TS.Charts.tooltip(r,'');});
   r.addEventListener('click',function(){TS.emit('drilldown:open',{chart:'mc',
    payload:{bin_low:bn.bin_low,bin_high:bn.bin_high,prob:bn.prob,stress:cs}});});
   svg.appendChild(r);})(bins[b]);}
  // X axis
  var yAx=PAD.top+ph;
  svg.appendChild(el('line',{x1:PAD.left,x2:W-PAD.right,y1:yAx,y2:yAx,stroke:'rgba(255,255,255,0.25)'}));
  var t0=Math.ceil(xMin/5)*5;
  for(var tv=t0;tv<=xMax;tv+=5){var tx=X(tv);
   svg.appendChild(el('line',{x1:tx,x2:tx,y1:yAx,y2:yAx+4,stroke:'rgba(255,255,255,0.3)'}));
   var xt=el('text',{x:tx,y:yAx+16,'text-anchor':'middle','font-size':10,fill:'#9CA3AF'});xt.textContent=tv+'%';svg.appendChild(xt);}
  var xl=el('text',{x:PAD.left+pw/2,y:H-6,'text-anchor':'middle','font-size':11,fill:'#9CA3AF'});
  xl.textContent=_i('ui.chart.mc.axis.x','IRR, %');svg.appendChild(xl);
  // markers
  function V(xV,c,d,lbl,cls){if(xV<xMin||xV>xMax)return;var px=X(xV);
   svg.appendChild(el('line',{x1:px,x2:px,y1:PAD.top,y2:PAD.top+ph,stroke:c,'stroke-width':1.5,'stroke-dasharray':d,'class':cls}));
   var tx=el('text',{x:px+3,y:PAD.top+10,'font-size':10,fill:c,'class':cls+' ts-mc-marker-label'});tx.textContent=lbl;svg.appendChild(tx);}
  function sP(v){if(typeof v!=='number')return null;return mu0+pr.mean_shift+(v-mu0)*pr.sigma_mult;}
  var p5=sP(pc.p5),p50=sP(typeof pc.p50==='number'?pc.p50:pc.mean),p95=sP(pc.p95);
  if(p5!==null)V(p5,pal.negative,'2,2','P5 '+p5.toFixed(1)+'%','ts-mc-p5');
  if(p50!==null)V(p50,pal.neutral,'2,2','P50 '+p50.toFixed(1)+'%','ts-mc-p50');
  if(p95!==null)V(p95,pal.positive,'2,2','P95 '+p95.toFixed(1)+'%','ts-mc-p95');
  V(det,gold,'4,3','Det '+det.toFixed(2)+'%','ts-mc-det');
 }
 draw(stress);

 function onParam(e){var d=(e&&e.detail)?e.detail:e;if(!d)return;
  if(typeof d.stress==='undefined')return;ctrl.update({stress:d.stress});}
 TS.on('param:changed',onParam);
 var ctrl={update:function(p){p=p||{};if(typeof p.stress==='number'){stress=Math.max(0,Math.min(100,p.stress));draw(stress);}},
  destroy:function(){if(TS.off)TS.off('param:changed',onParam);container.innerHTML='';}};
 return ctrl;
});})();
