"""
scripts/ — CLI utilities.

- build_nav.py — генерация 9 компонентов navigation/ из schemas+generators
- verify.py — запуск преcета П3+М2 верификации (32 механизма)
- diff_runs.py — сравнение текущего run с предыдущим (по audit_log.jsonl)
- bootstrap_memory.py — инициализация persistent memory при первой сборке

Запускаются через make targets или напрямую: python scripts/build_nav.py
"""
