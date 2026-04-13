# Schemas Reference — Pydantic-модели

## `schemas/base.py`

### `StrictModel`
> Базовый класс: строгая конфигурация, запрет лишних полей.

### `SourceRef`
> Ссылка на запись в inputs/sources.yaml.
Поля: `source_id`, `source_title`, `confidence`, `last_updated`

### `MoneyMln`
> Сумма в млн руб. ≥ 0.
Поля: `value`, `source_id`, `confidence`

### `Ratio`
> Доля / процент в диапазоне [0, 1].
Поля: `value`, `source_id`, `confidence`

### `ScenarioValues`
> Тройка значений по сценариям (cons/base/opt).
Поля: `cons`, `base`, `opt`, `source_id`, `confidence`

## `schemas/costs.py`

### `OpexCategory`
Поля: `category_id`, `title`, `share_in_opex_pct`

### `OpexContingency`
Поля: `included`, `contingency_rate_pct`, `rationale`

### `OpexFile`
Поля: `targets_mln_rub`, `cost_categories`, `contingency`, `meta`

### `PaRatioToRevenue`
Поля: `cons`, `base`, `opt`, `industry_benchmark`, `rationale`

### `PerReleasePlan`
Поля: `flagship_release_mln_rub`, `medium_release_mln_rub`, `small_release_mln_rub`

### `PaCostsFile`
Поля: `targets_mln_rub`, `pa_ratio_to_cinema_revenue`, `cost_breakdown_pct`, `per_release_plan`, `meta`

### `ProductionCapexYear`
Поля: `year`, `cons`, `base`, `opt`, `releases_count`, `comment`

### `InfrastructureCapexYear`
Поля: `year`, `base`, `items`

### `DepreciationPolicy`
Поля: `production_amortization_curve`, `infrastructure_useful_life_years`

### `CapexFile`
Поля: `production_capex_mln_rub`, `cogs_targets_mln_rub`, `infrastructure_capex_mln_rub`, `depreciation_policy`, `meta`

### `TurnoverDays`
> Оборачиваемость в днях. Разрешены доп. поля (rationale, comment).
Поля: `cons`, `base`, `opt`

### `NwcTurnover`
Поля: `accounts_receivable`, `accounts_payable`, `inventory_wip`, `advances_received`

### `NwcOpeningBalance`
Поля: `ar_mln_rub`, `ap_mln_rub`, `inventory_mln_rub`, `advances_mln_rub`, `net_nwc_mln_rub`

### `NwcFile`
Поля: `turnover_days`, `nwc_change_mln_rub`, `opening_balance_2026`, `meta`

## `schemas/inputs.py`

### `ValidatedInputs`
> Единый контейнер всех 14 валидированных входов.
Поля: `scenarios`, `macro`, `slate`, `cinema`, `advertising`, `festivals`, `education`, `license_library`, `opex`, `pa_costs`, `capex`, `nwc`, `valuation`, `investment`

## `schemas/investment.py`

### `AskScenario`
> Запрос денег у инвестора: cons (плохо → просим больше) ≥ base ≥ opt.
Поля: `cons`, `base`, `opt`

### `ReturnScenario`
> Возврат инвестору (MOIC / IRR): cons ≤ base ≤ opt.
Поля: `cons`, `base`, `opt`

### `Tranche`
Поля: `tranche_id`, `title`, `amount_mln_rub`, `instrument`

### `UseOfFundsPct`
Поля: `production_slate_2026_2027`, `opening_working_capital`, `infrastructure_capex`, `pa_marketing_reserve`, `general_contingency`

### `UseOfFundsMln`
Поля: `production_slate_2026_2027`, `opening_working_capital`, `infrastructure_capex`, `pa_marketing_reserve`, `general_contingency`

### `InvestorReturns`
Поля: `expected_exit_year`, `expected_exit_multiple_moic`, `expected_irr_pct`, `exit_strategy`

### `InvestmentFile`
Поля: `round_type`, `round_stage`, `ask_mln_rub`, `headline_ask_mln_rub`, `tranche_structure`, `use_of_funds_pct`, `use_of_funds_mln_rub`, `investor_returns`, `meta`

## `schemas/macro.py`

### `Horizon`
Поля: `start_year`, `end_year`, `total_years`

### `YearlyRate`
> Годовая ставка/курс/инфляция с cons/base/opt.
Поля: `year`, `cons`, `base`, `opt`

### `InflationRate`

### `UsdRubRate`

### `KeyRate`

### `TaxRate`
Поля: `rate`, `source_id`

### `VatRate`
Поля: `rate`, `cinema_exempt`, `source_id`

### `MacroFile`
Поля: `horizon`, `inflation_cpi`, `usd_rub`, `key_rate_cbr`, `profit_tax_rate`, `vat_rate`, `meta`

## `schemas/model_output.py`

### `FilmRevenue`
> Выручка одного фильма в разрезе каналов (млн ₽, одна строка = один год).
Поля: `film_id`, `year`, `theatrical`, `svod`, `tv`, `home_video`

### `RevenueBySegment`
> Выручка холдинга в разрезе 5 сегментов × 3 года (млн ₽).
Поля: `cinema`, `advertising`, `festivals`, `education`, `license_library`

### `CostsByCategory`
> Расходы холдинга в разрезе 7 категорий × 3 года (млн ₽).
Поля: `cogs`, `pa`, `opex`, `taxes`, `contingency`, `depreciation`, `nwc_change`

### `PnLRow`
> Одна строка P&L для одного сценария.
Поля: `label`, `year_2026`, `year_2027`, `year_2028`

### `PnL`
> Полный P&L для одного сценария (3 года).
Поля: `scenario`, `revenue_total`, `cogs`, `gross_profit`, `pa`, `opex`, `contingency`, `ebitda`, `depreciation`, `ebit`, `taxes`, `net_income`

### `CashFlow`
> Cash Flow Statement (косвенный метод) для одного сценария.
Поля: `scenario`, `net_income`, `depreciation_add`, `nwc_change`, `capex`, `operating_cf`, `investing_cf`, `financing_cf`, `free_cash_flow`

### `ValuationMetrics`
> Метрики валюации — все 3 подхода WACC + 2 методологии Exit.
Поля: `scenario`, `wacc_capm`, `wacc_switcher`, `wacc_buildup`, `npv_capm`, `npv_switcher`, `npv_buildup`, `irr`, `moic`, `payback_years`, `terminal_value_multiple`, `terminal_value_gordon`

### `ModelResult`
> Итоговый результат построения модели для одного сценария.
Поля: `scenario`, `revenue`, `costs`, `pnl`, `cashflow`, `valuation`

## `schemas/scenarios.py`

### `Anchor`
> Незыблемый якорь модели.
Поля: `metric`, `scenario`, `value_mln_rub`, `tolerance_pct`, `unit`, `rationale`

### `Scenario`
> Один сценарий с весом и мультипликаторами.
Поля: `name`, `short`, `weight`, `ebitda_multiplier`, `hit_rate_multiplier`, `description`

### `ScenariosFile`
> Содержимое inputs/scenarios.yaml.
Поля: `anchor`, `scenarios`, `meta`

## `schemas/segments.py`

### `YearTargetMln`
> Целевое значение на год с cons/base/opt.
Поля: `year`, `cons`, `base`, `opt`

### `YearRevenueTarget`
> YearTargetMln для доходных метрик: cons ≤ base ≤ opt.

### `YearExpenseTarget`
> YearTargetMln для расходных метрик: cons ≥ base ≥ opt.

### `BaseSegment`
> Общая часть сегментных файлов: доля + 3 целевых года + meta.
Поля: `segment_share_pct`, `targets_mln_rub`, `meta`

### `DistributionParams`
Поля: `theatrical_window_days`, `vpf_per_copy_rub`, `avg_copies_per_release`, `p_and_a_budget_ratio`, `min_distribution_fee_pct`

### `RevenueRecognition`
Поля: `method`, `timing`, `source_id`

### `CinemaSegment`
Поля: `distribution_params`, `revenue_recognition`

### `AdvStreamBase`
Поля: `stream_id`, `title`, `share_in_segment_pct`

### `AdvStreamGeneric`

### `GrowthDrivers`
Поля: `year_on_year_pct`, `rationale`

### `AdvertisingSegment`
Поля: `revenue_streams`, `growth_drivers`

### `FestivalEvent`
Поля: `event_id`, `title`, `type`

### `FestivalsSegment`
Поля: `events`

### `EducationProgram`
Поля: `program_id`, `title`, `format`

### `EducationSegment`
Поля: `programs`

### `LicenseStream`
Поля: `stream_id`, `title`, `share_in_segment_pct`

### `LibraryDepth`
Поля: `titles_at_start_2026`, `new_titles_per_year`, `library_monetization_curve`

### `LicenseLibrarySegment`
Поля: `revenue_streams`, `library_depth`

## `schemas/slate.py`

### `FilmRevenueScenario`
> Box office и hit rate в 3 сценариях.
Поля: `cons`, `base`, `opt`

### `Film`
Поля: `id`, `title`, `release_year`, `release_quarter`, `genre`, `budget_mln_rub`, `box_office_mln_rub`, `holding_share_pct`, `hit_rate`, `source_id`

### `SlateFile`
Поля: `films`, `meta`

## `schemas/valuation.py`

### `WaccScenario`
Поля: `cons`, `base`, `opt`

### `WaccMethodology`
Поля: `method_id`, `title`, `wacc`, `source_id`

### `GrowthRate`
Поля: `cons`, `base`, `opt`

### `ExitMultiple`
Поля: `cons`, `base`, `opt`

### `TvMethodology`
Поля: `method_id`, `title`, `rationale`

### `TvGordonGrowth`
Поля: `perpetual_growth_rate`

### `TvExitMultiple`
Поля: `ev_ebitda_multiple`

### `ValuationScenario`
Поля: `cons`, `base`, `opt`

### `TargetDcfOutput`
Поля: `enterprise_value_mln_rub`, `equity_value_mln_rub`

### `SensitivityGrid`
Поля: `wacc_range`, `terminal_growth_range`

### `ValuationFile`
Поля: `wacc_methodologies`, `terminal_value_methodologies`, `target_dcf_output`, `sensitivity_grid`, `meta`
