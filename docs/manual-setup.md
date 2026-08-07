# Что нужно сделать вручную (инструкция)

## 1. Включить GitHub Pages для нового репозитория
1. Откройте https://github.com/rusvse/linoleum-calc
2. Нажмите Settings (шестерёнка вверху)
3. В левом меню выберите Pages
4. В разделе Build and deployment выберите:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /(root)
5. Нажмите Save
6. Через 1–3 минуты сайт будет доступен по адресу:
   https://rusvse.github.io/linoleum-calc/

## 2. Настроить домен linoleum.anvaska.ru
1. В том же разделе Settings → Pages найдите Custom domain
2. Введите: linoleum.anvaska.ru
3. Нажмите Save
4. GitHub начнёт проверку DNS
5. Когда появится зелёная галочка, включите Enforce HTTPS

## 3. Проверить DNS в REG.RU
У вас уже настроено (видно на скриншоте):
- CNAME linoleum → rusvse.github.io.
- CNAME linum → rusvse.github.io.

Если сайт не открывается по linoleum.anvaska.ru через 10 минут:
- Проверьте, что в REG.RU запись linoleum CNAME rusvse.github.io. существует
- Подождите до 24 часов (обычно быстрее)

## 4. Подключить Google Apps Script (если нужен архив)
1. Создайте новую Google Таблицу: https://sheets.google.com
2. Назовите её: linoleum-calc archive
3. Перейдите в Extensions → Apps Script
4. Удалите содержимое и вставьте код из файла google-apps-script/Code.gs из репозитория
5. Нажмите Save
6. Deploy → New deployment
7. Type: Web app
8. Description: Archive for linoleum-calc
9. Execute as: Me
10. Who has access: Anyone (или Anyone with Google account)
11. Нажмите Deploy
12. Скопируйте URL (заканчивается на /exec)
13. Вставьте этот URL в файл app.js в строку:
    const APPS_SCRIPT_URL = "ВАШ_URL_СЮДА";
14. Сохраните файл (я могу это сделать, если пришлёте URL)

## 5. Проверить работу
1. Откройте https://linoleum.anvaska.ru
2. Заполните тестовый проект
3. Нажмите Рассчитать
4. Проверьте, что таблица результатов заполняется
5. Нажмите Выгрузить в Google таблицы
6. Проверьте, что в Google Таблице появилась запись
7. Обновите страницу и нажмите Обновить список в архиве
8. Выберите расчёт и нажмите Загрузить

## Что я уже сделал автоматически
- Создал репозиторий linoleum-calc
- Загрузил все файлы (index.html, style.css, app.js, модули, docs, Code.gs)
- Добавил CNAME для linoleum.anvaska.ru
- Настроил структуру с модульным JavaScript
- Подготовил логику расчёта линолеума
- Подготовил интеграцию с Google Sheets
- Создал документацию по требованиям и задачам

## Что не могу сделать сам
- Включить GitHub Pages (требует доступа к настройкам репозитория через веб-интерфейс)
- Ввести Custom domain в настройках Pages
- Подтвердить Enforce HTTPS после проверки DNS
- Создать и настроить Google Apps Script (требует доступа к вашему Google-аккаунту)
- Вставить URL Apps Script в код (нужен сам URL от вас)

## Следующие шаги после вашей настройки
Когда вы выполните пункты 1–4, сообщите мне, и я:
- проверю, что сайт открывается
- внесу любые правки в код, если что-то не работает
- добавлю новые функции по вашему запросу
