/* S43: Chart-2 EBITDA breakdown — stacked bar + margin line (Phase 2B) */
(function(){
'use strict';
var TS=(typeof window!=='undefined')?(window.TS=window.TS||{}):(globalThis.TS=globalThis.TS||{});
if(!TS.Charts||!TS.Charts.register)return;
var NS='http://www.w3.org/2000/svg',M={base:1,bull:1.25,bear:0.6};
function tr(k,f){var I=window.I18N;if(I&&I.t){var v=I.t(k);if(v&&v!==k)return v;}return f;}
function fmt(v,t){return TS.Charts.formatValue?TS.Charts.formatValue(v,t):String(v);}
function rows0(){var d=(TS.data&&TS.data())||{},a=(d.pnl||{}).ebitda_breakdown;
 if(!a||!a.length)a=[{year:2026,revenue:385,cogs:-390,opex:-80,ebitda:58.3,margin_pct:15.1},
  {year:2027,revenue:1665,cogs:-1050,opex:-150,ebitda:987.7,margin_pct:59.3},
  {year:2028,revenue:2495,cogs:-1287,opex:-220,ebitda:1121.4,margin_pct:44.9}];return a;}
function sc(r,s){var m=M[s]||1,e=r.ebitda*m,g=r.revenue?(e/r.revenue)*100:r.margin_pct*m;
 return{year:r.year,revenue:r.revenue,cogs:r.cogs,opex:r.opex,ebitda:Math.round(e*10)/10,margin_pct:Math.round(g*10)/10};}
function E(t,a){var e=document.createElementNS(NS,t);if(a)for(var k in a)if(a.hasOwnProperty(k))e.setAttribute(k,String(a[k]));return e;}
function draw(svg,rs,W,H){while(svg.firstChild)svg.removeChild(svg.firstChild);
 var P={l:52,r:56,t:24,b:36},pal=TS.Charts.palette,iw=W-P.l-P.r,ih=H-P.t-P.b,mx=0;
 rs.forEach(function(r){mx=Math.max(mx,Math.abs(r.revenue),Math.abs(r.cogs)+Math.abs(r.opex)+Math.abs(r.ebitda));});
 mx=Math.ceil(mx/500)*500||500;var gd=pal.gold||'#C9A961';
 for(var i=0;i<=5;i++){var y=P.t+ih*(1-i/5);
  svg.appendChild(E('line',{x1:P.l,y1:y,x2:W-P.r,y2:y,stroke:'rgba(156,163,175,0.18)'}));
  var a=E('text',{x:P.l-6,y:y+4,'text-anchor':'end','font-size':11,fill:'#9CA3AF'});a.textContent=fmt(mx*i/5);svg.appendChild(a);
  var b=E('text',{x:W-P.r+6,y:y+4,'text-anchor':'start','font-size':11,fill:gd});b.textContent=(20*i)+'%';svg.appendChild(b);}
 var sl=iw/rs.length,bw=Math.min(64,sl*0.55),hf=bw/2,yB=P.t+ih;
 rs.forEach(function(r,i){var cx=P.l+sl*(i+0.5),xB=cx-hf,rH=(r.revenue/mx)*ih,yT=yB-rH;
  svg.appendChild(E('rect',{x:xB,y:yT,width:bw,height:rH,fill:pal.base,
   'data-point':'revenue','data-year':r.year,'data-revenue':r.revenue,'data-ebitda':r.ebitda,'data-margin':r.margin_pct,
   role:'button',tabindex:0,'aria-label':r.year+' EBITDA '+r.ebitda+' '+r.margin_pct+'%'}));
  var xS=cx+hf+6,sw=Math.max(8,bw*0.35),cH=(Math.abs(r.cogs)/mx)*ih,oH=(Math.abs(r.opex)/mx)*ih,eH=(r.ebitda/mx)*ih;
  svg.appendChild(E('rect',{x:xS,y:yT,width:sw,height:cH,fill:pal.negative,opacity:0.85,'data-point':'cogs','data-year':r.year}));
  svg.appendChild(E('rect',{x:xS,y:yT+cH,width:sw,height:oH,fill:pal.neutral,opacity:0.85,'data-point':'opex','data-year':r.year}));
  svg.appendChild(E('rect',{x:xS,y:yT+cH+oH,width:sw,height:eH,fill:pal.positive,'data-point':'ebitda','data-year':r.year,'data-value':r.ebitda}));
  var xl=E('text',{x:cx,y:yB+18,'text-anchor':'middle','font-size':12,fill:'#9CA3AF'});xl.textContent=String(r.year);svg.appendChild(xl);
  r._cx=cx;r._my=yB-(r.margin_pct/100)*ih;});
 var d='';rs.forEach(function(r,i){d+=(i?'L':'M')+r._cx+','+r._my+' ';});
 if(rs.length>1)svg.appendChild(E('path',{d:d,fill:'none',stroke:gd,'stroke-width':2}));
 rs.forEach(function(r){svg.appendChild(E('circle',{cx:r._cx,cy:r._my,r:4,fill:gd,
  'data-point':'margin','data-year':r.year,'data-value':r.margin_pct}));});
 svg.appendChild(E('line',{x1:P.l,y1:yB,x2:W-P.r,y2:yB,stroke:'#9CA3AF'}));}
TS.Charts.register('ebitda',function(c,p){
 p=p||{};var sn=p.scenario||TS.scenario||'base';c.innerHTML='';
 c.setAttribute('aria-label',tr('a11y.chart.ebitda.label','EBITDA chart'));c.setAttribute('role','group');
 var ttl=document.createElement('div');ttl.className='ts-chart-title';
 ttl.textContent=tr('ui.chart.ebitda.title','EBITDA and Margin by Year');
 ttl.style.cssText='font:600 13px Inter,sans-serif;color:#F5F5F5;margin:0 0 6px;';c.appendChild(ttl);
 var W=c.clientWidth||640,H=Math.max(220,(c.clientHeight||300)-40);
 var svg=TS.Charts.createSVG(c,W,H);
 svg.setAttribute('aria-label',tr('a11y.chart.ebitda.label','EBITDA chart'));
 var lg=document.createElement('div');c.appendChild(lg);var pl=TS.Charts.palette;
 TS.Charts.legend(lg,[
  {color:pl.base,label:tr('ui.chart.ebitda.legend.revenue','Revenue')},
  {color:pl.negative,label:tr('ui.chart.ebitda.legend.cogs','COGS')},
  {color:pl.neutral,label:tr('ui.chart.ebitda.legend.opex','OPEX')},
  {color:pl.positive,label:tr('ui.chart.ebitda.legend.ebitda','EBITDA')},
  {color:pl.gold||'#C9A961',label:tr('ui.chart.ebitda.legend.margin','EBITDA margin')}]);
 var st={scenario:sn,rows:null};
 function rd(){st.rows=rows0().map(function(r){return sc(r,st.scenario);});draw(svg,st.rows,W,H);}
 function fnd(y){for(var i=0;i<st.rows.length;i++)if(String(st.rows[i].year)===String(y))return st.rows[i];return null;}
 function cl(e){var y=e.target&&e.target.getAttribute&&e.target.getAttribute('data-year');if(!y)return;
  var r=fnd(y);if(!r||!TS.emit)return;
  TS.emit('drilldown:open',{chart:'ebitda',payload:{year:r.year,revenue:r.revenue,ebitda:r.ebitda,margin_pct:r.margin_pct,scenario:st.scenario}});}
 function mv(e){var y=e.target&&e.target.getAttribute&&e.target.getAttribute('data-year');
  if(!y){TS.Charts.tooltip(svg,'');return;}var r=fnd(y);if(!r)return;
  TS.Charts.tooltip(svg,r.year+': Revenue '+fmt(r.revenue)+', EBITDA '+fmt(r.ebitda)+', Margin '+fmt(r.margin_pct,'percent'),
   {x:e.clientX,y:e.clientY-8});}
 svg.addEventListener('click',cl);svg.addEventListener('mousemove',mv);
 svg.addEventListener('mouseleave',function(){TS.Charts.tooltip(svg,'');});
 function oS(v){st.scenario=v||'base';rd();}
 if(TS.on)TS.on('scenario:changed',oS);
 rd();
 return{update:function(q){if(q&&q.scenario&&M[q.scenario])st.scenario=q.scenario;rd();},
  destroy:function(){try{svg.removeEventListener('click',cl);svg.removeEventListener('mousemove',mv);if(TS.off)TS.off('scenario:changed',oS);}catch(e){}c.innerHTML='';},
  _state:st};
});
})();
