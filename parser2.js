 document.addEventListener("DOMContentLoaded", function () {
    // Получаем элементы из DOM
    const logFileInput = document.getElementById("logFile");
    const manualLogInput = document.getElementById("manualLogInput");
    const loadLogsBtn = document.getElementById("loadLogsBtn");
    const generateLogsBtn = document.getElementById("generateLogsBtn");
    const filterRegexInput = document.getElementById("filterRegex");
    const filterBtn = document.getElementById("filterBtn");
    const resetFilterBtn = document.getElementById("resetFilterBtn");
    const logOutput = document.getElementById("logOutput");
    const lineCountSpan = document.getElementById("lineCount");
    const statsChart = document.getElementById("statsChart");
    const copyBtn = document.getElementById("copyBtn");
    const clearBtn = document.getElementById("clearBtn");

    // Уровни логов
    const logLevels = ["ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

    // Массивы для хранения логов
    let allLogs = [];
    let filteredLogs = [];

    // Инициализация обработчиков событий
    initEventListeners();

    function initEventListeners() {
        loadLogsBtn.addEventListener("click", loadLogs); // Загрузка логов
        generateLogsBtn.addEventListener("click", generateLogs); // Генерация логов
        filterBtn.addEventListener("click", applyFilter); // Применение фильтра
        resetFilterBtn.addEventListener("click", resetFilter); // Сброс фильтра
        copyBtn.addEventListener("click", copyLogs); // Копирование логов
        clearBtn.addEventListener("click", clearLogs); // Очистка логов
    }

    function loadLogs() {
        const file = logFileInput.files[0]; // Получаем файл логов
        if (file) {
            const reader = new FileReader(); // Создаем объект FileReader
            reader.onload = function (e) {
                // Читаем содержимое файла
                allLogs = e.target.result
                    .split("\n")
                    .map((l) => l.trim())
                    .filter((l) => l.length > 0);
                filteredLogs = [...allLogs]; // Копируем все логи в отфильтрованные
                displayLogs(); // Отображаем логи
            };
            reader.readAsText(file); // Читаем файл как текст
        } else if (manualLogInput.value.trim()) {
            // Если введены логи вручную
            allLogs = manualLogInput.value
                .split("\n")
                .map((l) => l.trim())
                .filter((l) => l.length > 0);
            filteredLogs = [...allLogs]; // Копируем все логи в отфильтрованные
            displayLogs(); // Отображаем логи
        } else {
            alert("Пожалуйста, загрузите файл или введите логи вручную"); // Сообщение об ошибке
        }
    }

    function generateLogs() {
        // Массив случайных сообщений
        const randomMessages = [
            "Operation completed successfully.",
            "User  logged in.",
            "File not found.",
            "Invalid input detected.",
            "Connection established.",
            "Data saved to database.",
            "Unexpected error occurred.",
            "Debugging information here.",
        ];
        const numberOfLogs =
            parseInt(document.getElementById("logCountInput").value) || 10; // Количество логов
        let generatedLogs = [];
        for (let i = 0; i < numberOfLogs; i++) {
            const level = logLevels[Math.floor(Math.random() * logLevels.length)]; // Случайный уровень лога
            const message =
                randomMessages[
                    Math.floor(Math.random() * randomMessages.length)
                ]; // Случайное сообщение
            generatedLogs.push(`${level}: ${message}`); // Добавляем сгенерированный лог
        }
        manualLogInput.value = generatedLogs.join("\n"); // Заполняем поле ввода сгенерированными логами
    }

    function applyFilter() {
        const regexPattern = filterRegexInput.value.trim(); // Получаем регулярное выражение
        if (!regexPattern) {
            alert("Введите регулярное выражение"); // Сообщение об ошибке
            return;
        }
        try {
            const regex = new RegExp(regexPattern); // Создаем регулярное выражение
            filteredLogs = allLogs.filter((line) => regex.test(line)); // Фильтруем логи
            displayLogs(); // Отображаем отфильтрованные логи
        } catch (e) {
            alert("Ошибка в регулярном выражении: " + e.message); // Сообщение об ошибке
        }
    }

    function resetFilter() {
        filteredLogs = [...allLogs]; // Сбрасываем фильтр
        filterRegexInput.value = ""; // Очищаем поле ввода регулярного выражения
        displayLogs(); // Отображаем все логи
    }

    function displayLogs() {
        logOutput.innerHTML = ""; // Очищаем вывод логов
        if (filteredLogs.length === 0) {
            logOutput.textContent = "Нет данных для отображения"; // Сообщение, если нет логов
        } else {
            filteredLogs.forEach((line) => {
                const lineDiv = document.createElement("div"); // Создаем элемент для каждой строки лога
                lineDiv.className = "log-line"; // Устанавливаем класс
                lineDiv.textContent = line; // Устанавливаем текст
                logOutput.appendChild(lineDiv); // Добавляем элемент в вывод
            });
        }
        lineCountSpan.textContent = filteredLogs.length; // Обновляем счетчик строк
        updateStats(); // Обновляем статистику
    }

    function computeLogLevelCounts() {
        const counts = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0, TRACE: 0 }; // Счетчик уровней логов
        filteredLogs.forEach((line) => {
            for (const level of logLevels) {
                if (line.startsWith(level)) {
                    counts[level]++; // Увеличиваем счетчик для соответствующего уровня
                    break;
                }
            }
        });
        return counts; // Возвращаем счетчики
    }

    function updateStats() {
        const counts = computeLogLevelCounts(); // Получаем счетчики уровней логов
        statsChart.innerHTML = ""; // Очищаем график

        const svgWidth = statsChart.clientWidth || 600; // Ширина графика
        const svgHeight = 150; // Высота графика
        const margin = { top: 20, right: 20, bottom: 40, left: 40 }; // Отступы
        const chartWidth = svgWidth - margin.left - margin.right; // Ширина графика без отступов
        const chartHeight = svgHeight - margin.top - margin.bottom; // Высота графика без отступов

        const maxCount = Math.max(...Object.values(counts), 1); // Максимальное значение для нормализации
        const barWidth = chartWidth / logLevels.length / 2.2; // Ширина столбца
        const spacing = (chartWidth - barWidth * logLevels.length) / (logLevels.length + 1); // Промежуток между столбцами

        const svgNS = "http://www.w3.org/2000/svg"; // Пространство имен для SVG
        const g = document.createElementNS(svgNS, "g"); // Создаем группу для графика
        g.setAttribute("transform", `translate(${margin.left},${margin.top})`); // Устанавливаем трансформацию
        statsChart.appendChild(g); // Добавляем группу в график

        // Горизонтальные линии сетки и метки
        for (let i = 0; i <= 5; i++) {
            const y = chartHeight - (chartHeight / 5) * i; // Вычисляем координату Y
            const line = document.createElementNS(svgNS, "line"); // Создаем линию
            line.setAttribute("x1", 0);
            line.setAttribute("y1", y);
            line.setAttribute("x2", chartWidth);
            line.setAttribute("y2", y);
            line.setAttribute("stroke", "#d1d5db");
            line.setAttribute("stroke-dasharray", "4 3");
            line.setAttribute("stroke-width", "1");
            g.appendChild(line); // Добавляем линию в группу

            const label = document.createElementNS(svgNS, "text"); // Создаем метку
            label.setAttribute("x", -10);
            label.setAttribute("y", y + 4);
            label.setAttribute("text-anchor", "end");
            label.setAttribute("font-size", "12");
            label.setAttribute("fill", "#9ca3af");
            label.setAttribute("font-weight", "600");
            label.textContent = Math.round((maxCount / 5) * i); // Устанавливаем текст метки
            g.appendChild(label); // Добавляем метку в группу
        }

        // Столбцы и метки
        logLevels.forEach((level, i) => {
            const count = counts[level]; // Получаем количество для уровня
            const barHeight = (count / maxCount) * chartHeight; // Высота столбца
            const x = spacing + i * (barWidth + spacing); // Координата X
            const y = chartHeight - barHeight; // Координата Y

            // Прямоугольник столбца
            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", y + chartHeight);
            rect.setAttribute("width", barWidth);
            rect.setAttribute("height", 0);
            rect.setAttribute("fill", "#2563eb");
            rect.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"; // Анимация роста
            g.appendChild(rect); // Добавляем столбец в группу

            // Анимация роста столбца
            setTimeout(() => {
                rect.setAttribute("y", y);
                rect.setAttribute("height", barHeight);
            }, 50);

            // Метка количества над столбцом
            if (count > 0) {
                const countLabel = document.createElementNS(svgNS, "text");
                countLabel.setAttribute("x", x + barWidth / 2);
                countLabel.setAttribute("y", y - 6);
                countLabel.setAttribute("text-anchor", "middle");
                countLabel.setAttribute("font-size", "13");
                countLabel.setAttribute("fill", "#2563eb");
                countLabel.setAttribute("font-weight", "700");
                countLabel.textContent = count; // Устанавливаем текст метки
                g.appendChild(countLabel); // Добавляем метку в группу
            }

            // Метка уровня под столбцом
            const levelLabel = document.createElementNS(svgNS, "text");
            levelLabel.setAttribute("x", x + barWidth / 2);
            levelLabel.setAttribute("y", chartHeight + 24);
            levelLabel.setAttribute("text-anchor", "middle");
            levelLabel.setAttribute("font-size", "14");
            levelLabel.setAttribute("fill", "#4b5563");
            levelLabel.setAttribute("font-weight", "600");
            levelLabel.textContent = level; // Устанавливаем текст метки уровня
            g.appendChild(levelLabel); // Добавляем метку в группу
        });
    }

    function copyLogs() {
        if (filteredLogs.length === 0) {
            alert("Нет логов для копирования"); // Сообщение об ошибке
            return;
        }
        const textToCopy = filteredLogs.join("\n"); // Текст для копирования
        navigator.clipboard
            .writeText(textToCopy) // Копируем текст в буфер обмена
            .then(() => {
                alert("Логи скопированы в буфер обмена"); // Успешное сообщение
            })
            .catch(() => {
                alert("Ошибка копирования. Попробуйте вручную."); // Сообщение об ошибке
            });
    }

    function clearLogs() {
        allLogs = []; // Очищаем все логи
        filteredLogs = []; // Очищаем отфильтрованные логи
        manualLogInput.value = ""; // Очищаем поле ввода
        logFileInput.value = ""; // Очищаем поле выбора файла
        filterRegexInput.value = ""; // Очищаем поле регулярного выражения
        displayLogs(); // Обновляем отображение логов
    }
});
