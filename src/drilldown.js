/* S50: Drill-Down coordinator (Phase 2B)
   Owner: S50 | Deps: components.js (Modal, DrilldownCard), macros.js (TS.on/off),
   i18n.js (window.I18N.t), charts.js (TS.Charts.formatValue).
   Contract: 40_CONTRACTS.md §7. Listens 'drilldown:open' from 7 charts.
   Exposes: window.TS.Drilldown = { init, open, close }. */
(function() {
  'use strict';
  var TS = (window.TS = window.TS || {});
  var _active = null, _inited = false, _handler = null;

  function t(key, fb) {
    var I = window.I18N;
    if (I && typeof I.t === 'function') {
      var v = I.t(key);
      if (typeof v === 'string' && v.charAt(0) === '[') return fb != null ? fb : v;
      return v;
    }
    return fb != null ? fb : key;
  }
  function money(v) {
    if (v == null) return '\u2014';
    if (TS.Charts && TS.Charts.formatValue) return TS.Charts.formatValue(v, 'currency');
    var I = window.I18N;
    if (I && I.formatCurrency) return I.formatCurrency(v);
    return String(v);
  }
  function num(v, d) {
    if (v == null) return '\u2014';
    var I = window.I18N;
    if (I && I.formatNumber) return I.formatNumber(v, d);
    return String(v);
  }
  function pct(v, d) {
    if (v == null || typeof v !== 'number') return v == null ? '\u2014' : String(v);
    return v.toFixed(d != null ? d : 1) + '%';
  }
  function L(key, fb) { return t('ui.drilldown.common.' + key, fb); }

  var MAP = {
    revenue: function(p) { return [
      { label: L('year', 'Год'),     value: p.year != null ? String(p.year) : '\u2014' },
      { label: L('value', 'Значение'), value: money(p.value) },
      { label: L('scenario', 'Сценарий'), value: p.scenario || '\u2014' }
    ]; },
    ebitda: function(p) { return [
      { label: L('year', 'Год'),       value: p.year != null ? String(p.year) : '\u2014' },
      { label: t('ui.drilldown.ebitda.revenue', 'Выручка'), value: money(p.revenue) },
      { label: t('ui.drilldown.ebitda.ebitda', 'EBITDA'),   value: money(p.ebitda) },
      { label: t('ui.drilldown.ebitda.margin', 'Маржа'),    value: pct(p.margin_pct, 1) },
      { label: L('scenario', 'Сценарий'), value: p.scenario || '\u2014' }
    ]; },
    irr: function(p) { return [
      { label: t('ui.drilldown.irr.rate', 'Ставка'),      value: p.rate != null ? p.rate + '%' : '\u2014' },
      { label: t('ui.drilldown.irr.horizon', 'Горизонт'), value: p.horizon != null ? p.horizon + ' ' + L('years', 'лет') : '\u2014' },
      { label: t('ui.drilldown.irr.irr', 'IRR'),          value: p.irr != null ? pct(p.irr, 1) : '\u2014' }
    ]; },
    pipeline: function(p) { return [
      { label: t('ui.drilldown.pipeline.code', 'Код'),      value: p.code || '\u2014' },
      { label: t('ui.drilldown.pipeline.name', 'Название'), value: p.name || '\u2014' },
      { label: t('ui.drilldown.pipeline.stage', 'Стадия'),  value: p.stage_ru || p.stage || '\u2014' },
      { label: t('ui.drilldown.pipeline.start', 'Старт'),   value: p.start || '\u2014' },
      { label: t('ui.drilldown.pipeline.end', 'Финиш'),     value: p.end || '\u2014' },
      { label: t('ui.drilldown.pipeline.release', 'Релиз'), value: p.release || '\u2014' },
      { label: t('ui.drilldown.pipeline.budget', 'Бюджет'), value: money(p.budget_mrub) },
      { label: t('ui.drilldown.pipeline.revenue', 'Выручка'), value: money(p.revenue_mrub) }
    ]; },
    cashflow: function(p) { return [
      { label: L('year', 'Год'),           value: p.year != null ? String(p.year) : '\u2014' },
      { label: t('ui.drilldown.cashflow.operating', 'Операц.'),  value: money(p.operating) },
      { label: t('ui.drilldown.cashflow.investing', 'Инвест.'),  value: money(p.investing) },
      { label: t('ui.drilldown.cashflow.financing', 'Финанс.'),  value: money(p.financing) },
      { label: t('ui.drilldown.cashflow.net', 'Чистый CF'),      value: money(p.net) },
      { label: t('ui.drilldown.cashflow.cumulative', 'Кумулятив'), value: money(p.cumulative) }
    ]; },
    mc: function(p) {
      var m = [
        { label: t('ui.drilldown.mc.bin', 'Интервал IRR'), value: (p.bin_lo != null && p.bin_hi != null) ? (p.bin_lo + '%\u2013' + p.bin_hi + '%') : '\u2014' },
        { label: t('ui.drilldown.mc.count', 'Частота'),    value: p.count != null ? num(p.count, 0) : '\u2014' },
        { label: t('ui.drilldown.mc.probability', 'Вероятность'), value: p.probability != null ? pct(p.probability * 100, 2) : '\u2014' }
      ];
      if (p.cumulative != null) m.push({ label: t('ui.drilldown.mc.cumulative', 'Накопит.'), value: pct(p.cumulative * 100, 1) });
      return m;
    },
    peers: function(p) {
      var m = [];
      if (p.company) m.push({ label: t('ui.drilldown.peers.company', 'Компания'), value: p.company });
      if (p.ticker)  m.push({ label: t('ui.drilldown.peers.ticker', 'Тикер'),    value: p.ticker });
      if (p.ev_ebitda != null) m.push({ label: 'EV/EBITDA', value: String(p.ev_ebitda) + 'x' });
      if (p.pe != null) m.push({ label: 'P/E', value: String(p.pe) + 'x' });
      if (p.ps != null) m.push({ label: 'P/S', value: String(p.ps) + 'x' });
      if (p.region) m.push({ label: t('ui.drilldown.peers.region', 'Регион'), value: p.region });
      return m;
    }
  };

  function metrics(chart, p) {
    var fn = MAP[chart];
    if (fn) { try { return fn(p || {}); } catch (e) { return []; } }
    var list = [];
    if (p && typeof p === 'object') Object.keys(p).forEach(function(k) { list.push({ label: k, value: String(p[k]) }); });
    return list;
  }

  function buildBody(chart, payload) {
    var wrap = document.createElement('div');
    wrap.setAttribute('data-drilldown-chart', chart);

    if (chart === 'peers' && payload && payload.synthetic === true) {
      var w = document.createElement('div');
      w.className = 'ts-drilldown-warning';
      w.setAttribute('data-synthetic', 'true');
      w.setAttribute('role', 'note');
      w.style.cssText = 'background:rgba(255,180,0,0.08);border:1px solid rgba(255,180,0,0.35);border-radius:8px;padding:10px 12px;margin-bottom:12px;color:#FFB400;font-size:13px;';
      w.textContent = t('ui.drilldown.common.warning_synthetic',
        '\u26A0 Данные-заглушка: peer-set обновится в Phase 2C после NDA');
      wrap.appendChild(w);
    }

    var card = (TS.Components && TS.Components.DrilldownCard)
      ? TS.Components.DrilldownCard({
          title: t('ui.drilldown.' + chart + '.title', chart),
          subtitle: t('ui.drilldown.' + chart + '.explanation', '') || undefined,
          metrics: metrics(chart, payload),
          description: t('ui.drilldown.' + chart + '.methodology', '') || undefined
        })
      : document.createElement('div');
    wrap.appendChild(card);
    return wrap;
  }

  function open(chart, payload) {
    close();
    if (!TS.Components || !TS.Components.Modal) return null;
    var title = t('ui.drilldown.' + chart + '.title', chart);
    var aria  = t('a11y.drilldown.' + chart + '.label', title);
    var m = TS.Components.Modal({
      title: title,
      body: buildBody(chart, payload),
      ariaLabel: aria,
      onClose: function() { if (_active === m) _active = null; }
    });
    _active = m;
    m.open();
    return m;
  }

  function close() {
    if (_active && typeof _active.close === 'function') { try { _active.close(); } catch (e) {} }
    _active = null;
  }

  function init() {
    if (_inited || !TS.on) return;
    _inited = true;
    _handler = function(evt) {
      if (!evt || !evt.chart) return;
      open(evt.chart, evt.payload || {});
    };
    TS.on('drilldown:open', _handler);
  }

  TS.Drilldown = { init: init, open: open, close: close };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
