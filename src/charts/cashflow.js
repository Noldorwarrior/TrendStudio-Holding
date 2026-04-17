/* S46: Chart-5 CashFlow — stacked bars + cumulative NET line. Contract §1.5,§2,§5.1,§7. */
(function(){'use strict';
var NS='http://www.w3.org/2000/svg',W=720,H=340,PL=54,PR=58,PT=24,PB=56;
function T(k,fb){var I=window.I18N;if(I&&I.t){var v=I.t(k);if(v&&v!==k)return v;}return fb||k;}
function F(v){var C=window.TS&&window.TS.Charts;if(C&&C.formatValue){try{return C.formatValue(v);}catch(e){}}return String(Math.round(v));}
function S(v){return(v>0?'+':v<0?'\u2212':'')+F(Math.abs(v||0));}
function M(t,a){var e=document.createElementNS(NS,t),k;if(a)for(k in a)e.setAttribute(k,a[k]);return e;}
function SC(r,s){var k=s==='bull'?1.2:s==='bear'?0.6:1,o=(r.operating||0)*k,f=(r.financing||0)*k,i=r.investing||0;return{year:r.year,operating:o,investing:i,financing:f,net:o+i+f};}
function RX(){try{var d=window.TS&&window.TS.data&&window.TS.data();if(d&&d.cashflow&&d.cashflow.yearly)return d.cashflow.yearly.slice();}catch(e){}
return[[2026,0,-1250,0,-1250],[2029,0,0,990,990],[2030,854,0,260,1114],[2031,162,0,0,162],[2032,234,0,0,234]].map(function(x){return{year:x[0],operating:x[1],investing:x[2],financing:x[3],net:x[4]};});}
function CU(rs){var o=[],a=0;rs.forEach(function(r){a+=r.net;o.push(a);});return o;}
function P(c,rs,s){
c.innerHTML='';
var p=(window.TS&&window.TS.Charts&&window.TS.Charts.palette)||{base:'#0070C0',positive:'#4CAF50',negative:'#F44336',gold:'#C9A961'};
var v=M('svg',{width:W,height:H,viewBox:'0 0 '+W+' '+H,role:'img','aria-label':T('a11y.chart.cashflow.label','Stacked cash flow with cumulative NET')});
c.appendChild(v);
var cu=CU(rs),yn=0,yx=0;
rs.forEach(function(r){var a=Math.max(0,r.operating)+Math.max(0,r.investing)+Math.max(0,r.financing),b=Math.min(0,r.operating)+Math.min(0,r.investing)+Math.min(0,r.financing);if(a>yx)yx=a;if(b<yn)yn=b;});
var cn=Math.min.apply(null,cu.concat([0])),cx=Math.max.apply(null,cu.concat([0]));
if(yn===0&&yx===0)yx=1;if(cn===cx)cx=cn+1;
var ph=H-PT-PB,pw=W-PL-PR;
function yB(x){return PT+ph*(1-(x-yn)/(yx-yn));}
function yC(x){return PT+ph*(1-(x-cn)/(cx-cn));}
function TX(a,t){var e=M('text',a);e.textContent=t;v.appendChild(e);return e;}
for(var i=0;i<=4;i++)v.appendChild(M('line',{x1:PL,x2:W-PR,y1:PT+ph*i/4,y2:PT+ph*i/4,stroke:'rgba(255,255,255,0.06)'}));
v.appendChild(M('line',{x1:PL,x2:W-PR,y1:yB(0),y2:yB(0),stroke:'rgba(255,255,255,0.45)','stroke-width':'1.5'}));
[yn,(yn+yx)/2,yx].forEach(function(t){TX({x:PL-6,y:yB(t)+4,'text-anchor':'end',fill:'#9CA3AF','font-size':'10'},F(t));});
[cn,(cn+cx)/2,cx].forEach(function(t){TX({x:W-PR+6,y:yC(t)+4,'text-anchor':'start',fill:p.gold,'font-size':'10'},F(t));});
var bw=pw/rs.length,br=Math.max(14,bw*0.48);
rs.forEach(function(r,i){
var ccx=PL+bw*(i+0.5),xx=ccx-br/2;
var g=M('g',{class:'ts-cashflow-bar',tabindex:'0',role:'button','data-year':r.year,'data-operating':r.operating,'data-investing':r.investing,'data-financing':r.financing,'data-net':r.net,'data-cumulative':cu[i],'aria-label':r.year+': Net '+S(r.net)+', cum '+S(cu[i])});
var po=0,no=0;
[['operating',r.operating,p.positive],['investing',r.investing,p.negative],['financing',r.financing,p.base]].forEach(function(s){
if(!s[1])return;var tp,hh;
if(s[1]>0){tp=yB(po+s[1]);hh=yB(po)-tp;po+=s[1];}else{tp=yB(no);hh=yB(no+s[1])-tp;no+=s[1];}
g.appendChild(M('rect',{x:xx,y:tp,width:br,height:Math.max(1,hh),fill:s[2],rx:'2'}));});
v.appendChild(g);
TX({x:ccx,y:H-PB+16,'text-anchor':'middle',fill:'#9CA3AF','font-size':'11'},String(r.year));
});
var pts=rs.map(function(r,i){return(PL+bw*(i+0.5))+','+yC(cu[i]);}).join(' ');
v.appendChild(M('polyline',{points:pts,fill:'none',stroke:p.gold,'stroke-width':'2.2','stroke-linecap':'round','stroke-linejoin':'round'}));
rs.forEach(function(r,i){v.appendChild(M('circle',{cx:PL+bw*(i+0.5),cy:yC(cu[i]),r:'3.5',fill:p.gold}));});
TX({x:PL,y:16,fill:'#F5F5F5','font-size':'13','font-weight':'600'},T('ui.chart.cashflow.title','CashFlow')+' ['+s+']');
function A(g){var d=g.dataset;return{y:d.year,o:+d.operating,i:+d.investing,f:+d.financing,n:+d.net,c:+d.cumulative};}
function TP(g,sh){var C=window.TS&&window.TS.Charts;if(!C||!C.tooltip)return;if(!sh){C.tooltip(g,'');return;}var a=A(g);C.tooltip(g,a.y+': Op '+S(a.o)+', Inv '+S(a.i)+', Fin '+S(a.f)+', Net '+S(a.n)+', cumulative '+S(a.c));}
function OP(g){if(!window.TS||!window.TS.emit)return;var a=A(g);window.TS.emit('drilldown:open',{chart:'cashflow',payload:{year:+a.y,operating:a.o,investing:a.i,financing:a.f,net:a.n,cumulative:a.c}});}
var bs=v.querySelectorAll('.ts-cashflow-bar');
for(var b=0;b<bs.length;b++)(function(g){
g.addEventListener('mouseenter',function(){TP(g,1);});g.addEventListener('mouseleave',function(){TP(g,0);});
g.addEventListener('focus',function(){TP(g,1);});g.addEventListener('blur',function(){TP(g,0);});
g.addEventListener('click',function(){OP(g);});
g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();OP(g);}});})(bs[b]);
var CC=window.TS&&window.TS.Charts;
if(CC&&CC.legend){var le=document.createElement('div');c.appendChild(le);
CC.legend(le,[[p.positive,'operating','Operating'],[p.negative,'investing','Investing'],[p.base,'financing','Financing'],[p.gold,'cumulative','Cumulative']].map(function(z){return{color:z[0],label:T('ui.chart.cashflow.legend.'+z[1],z[2])};}));}
return{svg:v,cumulative:cu};}
function RF(c,p){p=p||{};var s=p.scenario||(window.TS&&window.TS.scenario)||'base';
var r=RX(),x=r.map(function(q){return SC(q,s);}),o=P(c,x,s);
function on(n){s=n||'base';x=r.map(function(q){return SC(q,s);});o=P(c,x,s);}
if(window.TS&&window.TS.on)window.TS.on('scenario:changed',on);
return{update:function(pp){if(pp&&pp.scenario)on(pp.scenario);},destroy:function(){if(window.TS&&window.TS.off)window.TS.off('scenario:changed',on);c.innerHTML='';},_rows:function(){return x;},_cumulative:function(){return o.cumulative;}};}
function B(){if(window.TS&&window.TS.Charts&&window.TS.Charts.register){window.TS.Charts.register('cashflow',RF);return 1;}return 0;}
if(!B()&&typeof window!=='undefined'&&window.addEventListener)window.addEventListener('DOMContentLoaded',B);
})();
