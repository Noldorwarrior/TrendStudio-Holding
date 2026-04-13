"""
generators/ — чистые функции бизнес-логики + I/O builders.

Правило: все модули, кроме xlsx_builder.py, docx_builder.py,
provenance.py и hash_manifest.py, обязаны быть чистыми функциями
(без чтения/записи файлов). Они принимают Pydantic-объекты и
возвращают Pydantic-объекты.

I/O допустим только в:
- core.py::load_inputs (читает inputs/*.yaml)
- xlsx_builder.py (пишет artifacts/*.xlsx)
- docx_builder.py (пишет artifacts/*.docx)
- provenance.py (ведёт реестр source_id)
- hash_manifest.py (пишет logs/manifest.json)
"""
