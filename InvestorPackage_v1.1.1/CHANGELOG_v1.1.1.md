# CHANGELOG v1.1.0 → v1.1.1 (hardening)

**Date:** 2026-04-14
**Type:** Patch / Hardening (no numeric changes)

## Fixed
- **38_Notes_and_Sources!D22**: "n=1000" → "N=50 000" (приведено в соответствие с production MC N=50 000, 28_Monte_Carlo_Summary).

## Added
- **38_Notes_and_Sources row 70**: provenance-запись о legacy `mc_samples.json` (N=2000 EBITDA VaR, старая методология, не используется в production IRR; оставлен для аудит-следа).

## Verification
- П5 32/32 на v1.1.1: 32/32 PASS (100%). И1 теперь PASS (И1-FAIL v1.1.0 был закрыт in-situ в Appendix E, но теперь и в самой модели упоминание N=50 000 корректно).

## Метрики — без изменений
Det IRR 20.09%, MoIC 2.0×, WACC 19.05%, Revenue 3Y 4 545, EBITDA 3Y 2 167, MC Mean 7.24%.
