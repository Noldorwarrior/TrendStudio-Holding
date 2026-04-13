"""
schemas/stress_matrix.py — Pydantic контракт для stress_matrix.yaml.

Описывает структуру комбинированной стресс-матрицы 3×3×3 (FX × инфляция ×
задержка релизов) и параметры Monte Carlo симуляции с коррелированными
шоками.

Введено в v1.3.2 для закрытия жёлтой зоны №3 из v1.3 self-reflection.
"""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import ConfigDict, Field

from .base import ConfidenceLevel, StrictModel


class DimensionLevels(StrictModel):
    """Три уровня шока для одной переменной."""

    base: float = Field(..., ge=0.0, le=1.0)
    shock: float = Field(..., ge=0.0, le=1.0)
    extreme: float = Field(..., ge=0.0, le=1.0)


class DelayLevels(StrictModel):
    """Уровни задержки релизов в месяцах (не проценты)."""

    base: int = Field(..., ge=0, le=12)
    shock: int = Field(..., ge=0, le=12)
    extreme: int = Field(..., ge=0, le=12)


class Dimension(StrictModel):
    """Одна размерность матрицы с описанием и уровнями."""

    levels: DimensionLevels
    rationale: str = Field(..., min_length=10)


class DelayDimension(StrictModel):
    """Размерность задержек (целые месяцы)."""

    levels: DelayLevels
    rationale: str = Field(..., min_length=10)


class Dimensions(StrictModel):
    """Три размерности матрицы."""

    fx_shock_pct: Dimension
    inflation_fot_opex_pct: Dimension
    release_delay_months: DelayDimension


class ShockMechanic(StrictModel):
    description: str = Field(..., min_length=10)


class ShockMechanics(StrictModel):
    fx: ShockMechanic
    inflation_fot_opex: ShockMechanic
    release_delay: ShockMechanic


class BreachThresholds(StrictModel):
    anchor_lower_bound_mln_rub: float = Field(..., gt=0, lt=10000)
    anchor_upper_bound_mln_rub: float = Field(..., gt=0, lt=10000)
    severe_breach_threshold_mln_rub: float = Field(..., gt=0, lt=10000)


class ShockParameters(StrictModel):
    """v1.3.6 P2: параметры shock-механики, ранее magic numbers в коде.

    Хранит эффективный множитель инфляционной трансляции, границы
    clip-клэмпинга FX/инфляции/задержки и текстовые обоснования.
    """

    inflation_transmission_factor: float = Field(..., ge=0.0, le=1.0)
    inflation_transmission_derivation: str = Field(..., min_length=10)
    fx_clip_lower: float = Field(..., ge=-1.0, le=0.0)
    fx_clip_upper: float = Field(..., ge=0.0, le=1.0)
    fx_clip_rationale: str = Field(..., min_length=10)
    inflation_clip_lower: float = Field(..., ge=-1.0, le=1.0)
    inflation_clip_upper: float = Field(..., ge=0.0, le=1.0)
    inflation_clip_rationale: str = Field(..., min_length=10)
    delay_clip_lower: int = Field(..., ge=0, le=24)
    delay_clip_upper: int = Field(..., ge=0, le=24)
    delay_clip_rationale: str = Field(..., min_length=10)


class DistributionSpec(StrictModel):
    model_config = ConfigDict(extra="allow")

    distribution: Literal["normal", "half_normal", "uniform"]
    mean: Optional[float] = None
    std: Optional[float] = None
    scale: Optional[float] = None
    low: Optional[float] = None
    high: Optional[float] = None


class MonteCarloDistributions(StrictModel):
    fx_shock_pct: DistributionSpec
    inflation_pct: DistributionSpec
    release_delay_months: DistributionSpec


class MonteCarloCorrelations(StrictModel):
    fx_vs_inflation: float = Field(..., ge=-1.0, le=1.0)
    fx_vs_delay: float = Field(..., ge=-1.0, le=1.0)
    inflation_vs_delay: float = Field(..., ge=-1.0, le=1.0)


class MonteCarloCorrelationsSensitivity(StrictModel):
    """v1.3.4: альтернативные оценки корреляции для sensitivity-анализа.

    Используются в докладе (секция 8.4c) для демонстрации чувствительности
    breach_probability к выбору корреляционной меры.
    """
    pearson_calm: float = Field(..., ge=-1.0, le=1.0)
    pearson_no_2022: float = Field(..., ge=-1.0, le=1.0)
    spearman_full: float = Field(..., ge=-1.0, le=1.0)
    spearman_calm: float = Field(..., ge=-1.0, le=1.0)
    comment: Optional[str] = None


class BootstrapConfig(StrictModel):
    """v1.3.4: параметры historical block bootstrap MC."""
    enabled: bool = True
    n_simulations: int = Field(..., ge=100, le=100000)
    block_length: int = Field(..., ge=1, le=24)
    historical_csv: str = Field(..., min_length=3)
    comment: Optional[str] = None


class StageGateProbabilities(StrictModel):
    """v1.3.9 F2: вероятности успешного прохождения этапов pipeline фильма.

    Источник (экспертные оценки по российской индустрии 2024-2026):
      • development → greenlight: 0.85 (15% сценариев не проходят комитет)
      • greenlight → production start: 0.92 (8% зависают на финансировании)
      • production → post completion: 0.95 (5% — форсмажор, кастинг, бюджет)
      • post → release: 0.97 (3% — задержки релиза >1 года, приравнены к cancel)
      • overall reach release: 0.85 × 0.92 × 0.95 × 0.97 ≈ 0.721
    """
    p_development_to_greenlight: float = Field(..., ge=0.0, le=1.0)
    p_greenlight_to_production: float = Field(..., ge=0.0, le=1.0)
    p_production_to_post: float = Field(..., ge=0.0, le=1.0)
    p_post_to_release: float = Field(..., ge=0.0, le=1.0)


class StageGateSunkCostPct(StrictModel):
    """v1.3.9 F2: доля бюджета фильма как sunk cost на каждом этапе.

    При cancel на данном этапе: в модели признаются затраты = budget × stage_pct.
    Суммы кумулятивные: чем позже cancel — тем больше sunk.
    """
    development: float = Field(..., ge=0.0, le=1.0)    # ~5% бюджета
    greenlight: float = Field(..., ge=0.0, le=1.0)     # ~15% — pre-production
    production: float = Field(..., ge=0.0, le=1.0)     # ~70% — основные съёмки
    post: float = Field(..., ge=0.0, le=1.0)           # ~95% — post и мастеринг


class StageGateConfig(StrictModel):
    """v1.3.9 F2: stage-gate дерево решений для 12 фильмов слейта.

    Алгоритм:
      1. Для каждой симуляции и каждого фильма — Bernoulli по 4 этапам.
      2. Если фильм cancelled до release — expected_cinema_revenue = 0,
         признаётся sunk_cost = budget × stage_pct (максимально достигнутый этап).
      3. Пересчёт slate_weight по годам → масштабирование cinema.targets.
      4. Клонирование inputs, run_all, сбор cumulative_ebitda.

    Отчёт включает:
      • mean_released_count (из 12)
      • mean/std/percentiles cumulative_ebitda
      • expected_sunk_cost_total
      • breach_probability
    """
    enabled: bool = True
    n_simulations: int = Field(..., ge=100, le=100000)
    seed: int = Field(..., ge=0)
    probabilities: StageGateProbabilities
    sunk_cost_pct: StageGateSunkCostPct
    apply_sunk_to_capex: bool = Field(
        default=True,
        description="если true, sunk_cost вычитается из cumulative EBITDA как дополнительный opex",
    )
    comment: Optional[str] = None


class LHSCopulaConfig(StrictModel):
    """v1.4.0 F3+F4: Latin Hypercube Sampling + Gaussian copula.

    F3 (LHS): n_simulations разбивается на стратифицированные u ∈ [0,1] —
    для каждой из 3 размерностей (FX, инфляция, delay) интервал [0,1] делится
    на n_sims равных страт, из каждой страты берётся 1 точка, затем страты
    независимо перемешиваются. Это даёт variance reduction ×3–5 относительно
    наивного MC (per McKay-Conover-Beckman 1979).

    F4 (Gaussian copula): стратифицированные u транслируются в N(0,1) через
    обратную CDF Φ⁻¹, затем коррелируются через Cholesky L·L^T = ρ. Полученные
    N(0,1) переводятся обратно в u через Φ, а затем через обратные маргиналы
    (normal-FX, normal-infl, half-normal-delay) — в физические шоки. Это
    корректная многомерная копула, а не приближение через coincidence-нормалей.

    Отличие от combined_stress_tests.py::run_monte_carlo:
      ─ run_monte_carlo использует наивный iid Gauss и Cholesky корреляции —
        корректно только для нормальных маргиналов и даёт overshoot в хвостах
        при half-normal delay.
      ─ run_lhs_copula использует LHS для variance reduction + честную копулу,
        которая сохраняет корреляционный ранг между РАЗНЫМИ маргиналами.
    """
    enabled: bool = True
    n_simulations: int = Field(..., ge=100, le=100000)
    seed: int = Field(..., ge=0)
    use_copula: bool = Field(
        default=True,
        description="если true — Gaussian copula через inverse-CDF, иначе прямая Cholesky на N(0,1)",
    )
    lhs_strata: bool = Field(
        default=True,
        description="если true — Latin Hypercube стратификация; иначе iid uniform",
    )
    comment: Optional[str] = None


class MarketBootstrapConfig(StrictModel):
    """v1.3.8 F1: блочный bootstrap годовых YoY-множителей рынка проката.

    Источник: inputs/eais_seed/annual_box_office.csv (2019–2025, 6 YoY-точек).
    Модель: для горизонта 2026–2028 (3 года) выбирается трасса из 3 YoY-шоков
    с помощью блочного bootstrap размера `block_size`. Блок стартует на случайном
    индексе; если блок короче горизонта — дополняется независимыми выборками.

    Применение шока: рыночный YoY транслируется в мультипликатор
    cinema.targets_mln_rub года t относительно базового 2026 плана через
    market_beta (доля выручки холдинга, зависящая от рынка в целом, ∈ [0;1]).

    Например, если historic YoY = 1.10 (рост рынка на 10%) и market_beta=0.6,
    то cinema_target_t ×= 1.0 + 0.6 × (1.10 − 1.0) = 1.06.
    """
    enabled: bool = True
    n_simulations: int = Field(..., ge=50, le=100000)
    block_size: int = Field(..., ge=1, le=6, description="длина блока в годах")
    seed: int = Field(..., ge=0)
    seed_csv: str = Field(..., min_length=3, description="путь к eais_seed CSV")
    market_beta: float = Field(..., ge=0.0, le=1.5, description="доля revenue, зависящая от market YoY")
    horizon_years: int = Field(3, ge=1, le=10)
    exclude_years: Optional[list[int]] = Field(default=None, description="годы, исключаемые из выборки (например, структурные разрывы)")
    comment: Optional[str] = None


class HistoricalCalibration(StrictModel):
    """v1.3.4: метаданные исторической калибровки (источники + σ)."""
    model_config = ConfigDict(extra="allow", str_strip_whitespace=True)

    enabled: bool = True
    source_fx: str = Field(..., min_length=3)
    source_inflation: str = Field(..., min_length=3)
    source_key_rate: Optional[str] = None
    n_observations: int = Field(..., ge=12, le=10000)
    method: str = Field(..., min_length=3)
    calibration_doc: str = Field(..., min_length=3)
    full_period_sigma_fx_annual: Optional[float] = None
    calm_period_sigma_fx_annual: Optional[float] = None
    full_period_sigma_infl_annual: Optional[float] = None
    calm_period_sigma_infl_annual: Optional[float] = None


class MonteCarloConfig(StrictModel):
    n_simulations: int = Field(..., ge=100, le=100000)
    seed: int = Field(..., ge=0)
    distributions: MonteCarloDistributions
    correlations: MonteCarloCorrelations
    correlations_sensitivity: Optional[MonteCarloCorrelationsSensitivity] = None
    bootstrap: Optional[BootstrapConfig] = None
    market_bootstrap: Optional[MarketBootstrapConfig] = None
    stage_gate: Optional[StageGateConfig] = None
    lhs_copula: Optional[LHSCopulaConfig] = None
    historical_calibration: Optional[HistoricalCalibration] = None


class StressMatrixMeta(StrictModel):
    model_config = ConfigDict(extra="allow", str_strip_whitespace=True)

    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$", min_length=3, max_length=80)
    source_title: Optional[str] = None
    confidence: Optional[ConfidenceLevel] = None
    last_updated: Optional[str] = None
    comment: Optional[str] = None


class StressMatrixFile(StrictModel):
    """Контракт для inputs/stress_matrix.yaml."""

    dimensions: Dimensions
    shock_mechanics: ShockMechanics
    shock_parameters: ShockParameters
    breach_thresholds: BreachThresholds
    monte_carlo: MonteCarloConfig
    meta: StressMatrixMeta
