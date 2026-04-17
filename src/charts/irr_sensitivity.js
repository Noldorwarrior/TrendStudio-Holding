/* S44: IRR Sensitivity Heatmap 7x4 — Phase 2B.
   TS.Charts.register('irr_sensitivity'); payload {rate,horizon}; listens param:changed; click->drilldown:open. */
(function(){'use strict';
  var TS = (typeof window!=='undefined')?(window.TS=window.TS||{}):(globalThis.TS=globalThis.TS||{});
  if(!TS.Charts||typeof TS.Charts.register!=='function'){return;}
  var NS='http://www.w3.org/2000/svg',W=560,H=340,P={t:36,r:14,b:44,l:78};
  function color(v){if(v==null||!isFinite(v))return'#2a2a2a';if(v<10)return'#C62828';if(v<18)return'#F9A825';if(v<=25)return'#2E7D32';return'#1B5E20';}
  function near(a,v){if(!a||!a.length)return 0;var b=0,d=Math.abs(a[0]-v);for(var i=1;i<a.length;i++){var x=Math.abs(a[i]-v);if(x<d){b=i;d=x;}}return b;}
  function t(k,f){var I=(typeof window!=='undefined')?window.I18N:null;if(I&&I.t){var v=I.t(k);if(v&&v!==k)return v;}return f;}
  function fmt(v){if(v==null||!isFinite(v))return'\u2014';var C=TS.Charts;if(C&&C.formatValue){try{return C.formatValue(v,'percent');}catch(e){}}return(Math.round(v*10)/10)+'%';}
  function el(tag,attrs,text){var e=document.createElementNS(NS,tag);if(attrs)for(var k in attrs)e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;return e;}
  function getM(){var d=(typeof TS.data==='function')?(TS.data()||{}):{};var m=(d.sensitivity&&d.sensitivity.irr_matrix)||null;
    if(!m)return{rates:[10,12,15,18,20,22,25],horizons:[3,5,7,10],
      values:[[21.5,22.5,23.4,24.7],[21.0,22.0,22.8,24.1],[20.3,21.2,22.0,23.3],[19.5,20.4,21.2,22.4],[19.0,19.8,20.6,21.8],[18.5,19.3,20.1,21.2],[17.8,18.5,19.3,20.4]],
      anchor:{rate:19,horizon:5,irr:20.09},synthetic:true};return m;}

  TS.Charts.register('irr_sensitivity',function(container,payload){
    while(container.firstChild)container.removeChild(container.firstChild);
    payload=payload||{};
    var M=getM(),rates=M.rates||[],hrz=M.horizons||[],vals=M.values||[],anc=M.anchor||{rate:19,horizon:5};
    var state={rate:(payload.rate!=null)?+payload.rate:anc.rate,horizon:(payload.horizon!=null)?+payload.horizon:anc.horizon};
    var svg=TS.Charts.createSVG(container,W,H);
    svg.setAttribute('class','ts-chart-irr');
    svg.setAttribute('aria-label',t('a11y.chart.irr.label','IRR sensitivity heatmap 7x4'));
    svg.appendChild(el('text',{x:W/2,y:18,'text-anchor':'middle',fill:'#F5F5F5','font-size':13,'font-weight':600},t('ui.chart.irr.title','IRR sensitivity — 7x4')));

    var cW=(W-P.l-P.r)/Math.max(hrz.length,1),cH=(H-P.t-P.b)/Math.max(rates.length,1);
    var cells=[];
    for(var ri=0;ri<rates.length;ri++)for(var hi=0;hi<hrz.length;hi++){
      var x=P.l+hi*cW,y=P.t+ri*cH;
      var v=(vals[ri]&&vals[ri][hi]!=null)?vals[ri][hi]:null;
      var r=el('rect',{x:x+1,y:y+1,width:Math.max(cW-2,0),height:Math.max(cH-2,0),fill:color(v),stroke:'rgba(255,255,255,0.08)','stroke-width':1,'class':'ts-irr-cell',role:'gridcell',tabindex:'0','data-rate':rates[ri],'data-horizon':hrz[hi],'data-irr':(v!=null)?v:'','data-ri':ri,'data-hi':hi,'aria-label':'Rate '+rates[ri]+'%, Horizon '+hrz[hi]+'Y, IRR '+fmt(v)});
      svg.appendChild(r);
      var tx=el('text',{x:x+cW/2,y:y+cH/2+4,'text-anchor':'middle',fill:'#FFFFFF','font-size':11,'font-weight':500,'pointer-events':'none','class':'ts-irr-cell-label'},(v!=null)?((Math.round(v*10)/10)+'%'):'\u2014');
      svg.appendChild(tx);
      cells.push({rect:r,text:tx,ri:ri,hi:hi,irr:v});
    }
    for(var yi=0;yi<rates.length;yi++)svg.appendChild(el('text',{x:P.l-8,y:P.t+yi*cH+cH/2+4,'text-anchor':'end',fill:'#9CA3AF','font-size':11},rates[yi]+'%'));
    svg.appendChild(el('text',{x:14,y:H/2,fill:'#9CA3AF','font-size':11,transform:'rotate(-90 14 '+(H/2)+')','text-anchor':'middle'},t('ui.chart.irr.axis.y','Discount rate, %')));
    for(var xi=0;xi<hrz.length;xi++)svg.appendChild(el('text',{x:P.l+xi*cW+cW/2,y:H-P.b+16,'text-anchor':'middle',fill:'#9CA3AF','font-size':11},hrz[xi]+'Y'));
    svg.appendChild(el('text',{x:W/2,y:H-8,fill:'#9CA3AF','font-size':11,'text-anchor':'middle'},t('ui.chart.irr.axis.x','Horizon, years')));

    var leg=[{c:'#C62828',l:t('ui.chart.irr.legend.low','< 10%')},{c:'#F9A825',l:t('ui.chart.irr.legend.mid','10-18%')},{c:'#2E7D32',l:t('ui.chart.irr.legend.high','> 18%')}];
    var lx=P.l,ly=4;
    for(var li=0;li<leg.length;li++){
      svg.appendChild(el('rect',{x:lx,y:ly,width:10,height:10,fill:leg[li].c}));
      svg.appendChild(el('text',{x:lx+14,y:ly+9,fill:'#9CA3AF','font-size':10},leg[li].l));
      lx+=14+leg[li].l.length*6+12;
    }

    var act=el('rect',{fill:'none',stroke:'#C9A961','stroke-width':3,'pointer-events':'none','class':'ts-irr-active',rx:2});
    svg.appendChild(act);

    function hi_(rate,horizon){
      var ri=near(rates,rate),hi=near(hrz,horizon);
      var x=P.l+hi*cW,y=P.t+ri*cH;
      act.setAttribute('x',x+1);act.setAttribute('y',y+1);
      act.setAttribute('width',Math.max(cW-2,0));act.setAttribute('height',Math.max(cH-2,0));
      for(var k=0;k<cells.length;k++){var c=cells[k],a=(c.ri===ri&&c.hi===hi);c.text.setAttribute('font-size',a?14:11);c.text.setAttribute('font-weight',a?700:500);}
      state.rate=rates[ri];state.horizon=hrz[hi];
      state._irr=(vals[ri]&&vals[ri][hi]!=null)?vals[ri][hi]:null;
      if(TS.A11y&&TS.A11y.announce){try{TS.A11y.announce('IRR '+fmt(state._irr)+' @ rate '+state.rate+'%, horizon '+state.horizon+'Y');}catch(e){}}
    }
    hi_(state.rate,state.horizon);

    function onOver(e){var r=e.target;if(!r||!r.getAttribute||r.getAttribute('class')!=='ts-irr-cell')return;
      var ir=r.getAttribute('data-irr');
      var msg='Rate '+r.getAttribute('data-rate')+'%, Horizon '+r.getAttribute('data-horizon')+'Y \u2192 IRR '+((ir==='')?'\u2014':fmt(+ir));
      if(TS.Charts.tooltip)TS.Charts.tooltip(r,msg);}
    function onOut(){if(TS.Charts.tooltip)TS.Charts.tooltip(null,'');}
    function onClick(e){var r=e.target;if(!r||!r.getAttribute||r.getAttribute('class')!=='ts-irr-cell')return;
      var ir=r.getAttribute('data-irr');
      if(TS.emit)TS.emit('drilldown:open',{chart:'irr',payload:{rate:+r.getAttribute('data-rate'),horizon:+r.getAttribute('data-horizon'),irr:(ir==='')?null:+ir}});}
    svg.addEventListener('mouseover',onOver);svg.addEventListener('mouseout',onOut);svg.addEventListener('click',onClick);

    function onParam(e){var d=(e&&e.detail)?e.detail:e;if(!d)return;
      if(d.rate!==undefined||d.horizon!==undefined){
        var rr=(d.rate!=null)?+d.rate:state.rate,hh=(d.horizon!=null)?+d.horizon:state.horizon;
        hi_(rr,hh);}}
    if(TS.on)TS.on('param:changed',onParam);

    return{
      update:function(np){np=np||{};hi_((np.rate!=null)?+np.rate:state.rate,(np.horizon!=null)?+np.horizon:state.horizon);},
      destroy:function(){if(TS.off)TS.off('param:changed',onParam);
        try{svg.removeEventListener('mouseover',onOver);}catch(e){}
        try{svg.removeEventListener('mouseout',onOut);}catch(e){}
        try{svg.removeEventListener('click',onClick);}catch(e){}
        while(container.firstChild)container.removeChild(container.firstChild);},
      _state:state,_cells:cells
    };
  });
})();
