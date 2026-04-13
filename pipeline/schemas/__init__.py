"""
Pydantic v2 schemas для Холдинг Кино Finmodel.

Все входные данные из inputs/*.yaml валидируются через эти контракты.
Нарушение любого бизнес-инварианта падает на этапе `make validate`,
до построения xlsx.
"""

from schemas.base import (
    ConfidenceLevel,
    MoneyMln,
    Ratio,
    ScenarioName,
    ScenarioValues,
    SourceRef,
)
from schemas.scenarios import Anchor, Scenario, ScenariosFile, anchor_check
from schemas.macro import (
    MacroFile,
    Horizon,
    InflationRate,
    UsdRubRate,
    KeyRate,
    TaxRate,
    VatRate,
)
from schemas.slate import Film, SlateFile, FilmRevenueScenario
from schemas.segments import (
    BaseSegment,
    YearTargetMln,
    YearRevenueTarget,
    YearExpenseTarget,
    CinemaSegment,
    AdvertisingSegment,
    FestivalsSegment,
    EducationSegment,
    LicenseLibrarySegment,
)
from schemas.costs import (
    OpexFile,
    OpexCategory,
    OpexContingency,
    PaCostsFile,
    PaRatioToRevenue,
    PerReleasePlan,
    CapexFile,
    ProductionCapexYear,
    InfrastructureCapexYear,
    DepreciationPolicy,
    NwcFile,
    NwcTurnover,
    NwcOpeningBalance,
    TurnoverDays,
)
from schemas.valuation import (
    ValuationFile,
    WaccMethodology,
    WaccScenario,
    TargetDcfOutput,
    SensitivityGrid,
    GrowthRate,
    ExitMultiple,
)
from schemas.investment import (
    InvestmentFile,
    AskScenario,
    ReturnScenario,
    Tranche,
    UseOfFundsPct,
    UseOfFundsMln,
    InvestorReturns,
)
from schemas.model_output import (
    PnL,
    CashFlow,
    RevenueBySegment,
    CostsByCategory,
    ValuationMetrics,
    ModelResult,
)
from schemas.inputs import ValidatedInputs, load_inputs, INPUT_FILES

__all__ = [
    # base
    "ConfidenceLevel", "MoneyMln", "Ratio", "ScenarioName",
    "ScenarioValues", "SourceRef",
    # scenarios
    "Anchor", "Scenario", "ScenariosFile", "anchor_check",
    # macro
    "MacroFile", "Horizon", "InflationRate", "UsdRubRate",
    "KeyRate", "TaxRate", "VatRate",
    # slate
    "Film", "SlateFile", "FilmRevenueScenario",
    # segments
    "BaseSegment", "YearTargetMln",
    "CinemaSegment", "AdvertisingSegment", "FestivalsSegment",
    "EducationSegment", "LicenseLibrarySegment",
    # costs
    "OpexFile", "OpexCategory", "OpexContingency",
    "PaCostsFile", "PaRatioToRevenue", "PerReleasePlan",
    "CapexFile", "ProductionCapexYear", "InfrastructureCapexYear",
    "DepreciationPolicy",
    "NwcFile", "NwcTurnover", "NwcOpeningBalance", "TurnoverDays",
    # valuation
    "ValuationFile", "WaccMethodology", "WaccScenario",
    "TargetDcfOutput", "SensitivityGrid", "GrowthRate", "ExitMultiple",
    # investment
    "InvestmentFile", "AskScenario", "Tranche",
    "UseOfFundsPct", "UseOfFundsMln", "InvestorReturns",
    # model output
    "PnL", "CashFlow", "RevenueBySegment", "CostsByCategory",
    "ValuationMetrics", "ModelResult",
    # orchestrator
    "ValidatedInputs", "load_inputs", "INPUT_FILES",
]
