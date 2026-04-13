#!/bin/bash
# ============================================================
# setup_github.sh — Инициализация git и push на GitHub
# Репозиторий: noldorwarrior/Холдинг1 (public, main)
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Загрузка папки Холдинг на GitHub ===${NC}"
echo ""

# 1. Проверка gh CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}✗ gh CLI не установлен.${NC}"
    echo "  Установи через: brew install gh"
    echo "  Затем авторизуйся: gh auth login"
    exit 1
fi
echo -e "${GREEN}✓ gh CLI найден${NC}"

# 2. Проверка авторизации
if ! gh auth status &> /dev/null 2>&1; then
    echo -e "${RED}✗ gh не авторизован.${NC}"
    echo "  Выполни: gh auth login"
    exit 1
fi
echo -e "${GREEN}✓ gh авторизован${NC}"

# 3. Перейти в папку проекта
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
echo -e "${GREEN}✓ Рабочая папка: ${SCRIPT_DIR}${NC}"

# 4. Проверка: нет ли уже git-репозитория
if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠ Git-репозиторий уже существует в этой папке.${NC}"
    echo "  Если хочешь начать заново: rm -rf .git"
    exit 1
fi

# 5. git init
git init -b main
echo -e "${GREEN}✓ git init -b main${NC}"

# 6. git add + commit
git add .
FILECOUNT=$(git diff --cached --numstat | wc -l | tr -d ' ')
echo -e "${GREEN}✓ Добавлено файлов: ${FILECOUNT}${NC}"

git commit -m "Initial commit: ТрендСтудио холдинг — Pipeline v1.4.4 + Investor Package v3.0"
echo -e "${GREEN}✓ Коммит создан${NC}"

# 7. Создать репозиторий на GitHub и push
echo ""
echo -e "${YELLOW}Создаю репозиторий noldorwarrior/Холдинг1 на GitHub...${NC}"
gh repo create "Холдинг1" --public --source=. --remote=origin --push
echo ""
echo -e "${GREEN}✓ Готово! Репозиторий создан и код загружен.${NC}"
echo -e "${GREEN}  https://github.com/noldorwarrior/Холдинг1${NC}"

# 8. Удалить сам скрипт из репозитория (опционально — он уже загружен)
echo ""
echo -e "${YELLOW}Скрипт setup_github.sh загружен вместе с проектом.${NC}"
echo "  Если хочешь удалить его из репо:"
echo "  git rm setup_github.sh && git commit -m 'Remove setup script' && git push"
