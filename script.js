// =========================================================
// PROGRESS POND V26+ - MODULAR & ENHANCED WITH TABS
// =========================================================

class ProgressPond {
    constructor() {
        this.data = {
            daily: [],
            history: [],
            moodLog: [],
            sugarLog: [],
            carbLog: [],
            waterLog: [],
            insulinLog: [],
            sleepLog: [],
            stressLog: [],
            energyLog: [],
            symptomLog: [],
            exerciseLog: [],
            analytics: [],
            waterCount: 0,
            streak: 0,
            lastStreakDate: null,
            theme: 'light'
        };

        this.insightChart = null;
        this.storageKey = "ProgressPond_V26";
        this.init();
    }

    init() {
        this.loadStorage();
        this.setupMoodData();
        this.setupEventListeners();
        this.renderAll();
        this.setMotivation();
        this.resetTimePicker();
        this.checkDailyReset();
    }

    setupMoodData() {
        this.moodScores = {
            Manic: 10, Happy: 9, Focused: 8, Calm: 7, Tired: 6,
            Confused: 5, Grumpy: 4, Angry: 3, Sad: 2, Crying: 1
        };

        this.energyScores = {
            Exhausted: 1, Low: 3, Okay: 5, Good: 7, Energetic: 10
        };

        this.stressScores = {
            Calm: 1, Mild: 3, Moderate: 5, High: 7, Extreme: 10
        };

        this.sleepQualityScores = {
            Bad: 3, Good: 7, Great: 10
        };

        this.moodEmojis = {
            Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴",
            Grumpy: "😠", Confused: "😕", Angry: "😡", Sad: "😢",
            Crying: "😭", Manic: "🤪"
        };

        this.frogQuotes = [
            "🐸 💖 Ribbit! You're doing amazing! 💞 🐸",
            "✨ 🐸 Take a deep breath, little froggy! 💗 ✨",
            "🌸 🐸 Every hop counts! I'm proud of you! 💖 🌸",
            "💕 🐸 You've got this! Keep hopping! 💪 🐸",
            "🌿 🐸 Progress, not perfection! 🌿 💚"
        ];
    }

    setupEventListeners() {
        this.addButtonListener("addDailyBtn", () => this.addHop());
        this.addButtonListener("addSugarBtn", () => this.addSugar());
        this.addButtonListener("addCarbBtn", () => this.addCarb());
        this.addButtonListener("addInsulinBtn", () => this.addInsulin());
        this.addButtonListener("clearWaterBtn", () => this.clearWater());
        this.addButtonListener("resetTimeBtn", () => this.resetTimePicker());

        this.addButtonListener("tabExportExcelBtn", () => this.exportToExcelWithChart());
        this.addButtonListener("tabClearDayBtn", () => this.clearDayKeepGoals());
        this.addButtonListener("tabClearHistoryBtn", () => this.resetDayEverything());
        this.addButtonListener("bannerClose", () => this.closeBanner());

        document.querySelectorAll(".mood-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const mood = btn.getAttribute("data-mood");

                this.addLog("moodLog", {
                    type: "mood",
                    val: mood,
                    icon: this.moodEmojis[mood],
                    fullDate: this.currentFullDate(this.getSelectedTime())
                });
            });
        });

        document.querySelectorAll(".drop-btn").forEach((btn, index) => {
            btn.addEventListener("click", () => this.toggleWater(btn, index));
        });

        const themeToggle = document.getElementById("themeToggle");
        if (themeToggle) {
            themeToggle.addEventListener("click", () => this.toggleTheme());
        }
    }

    addButtonListener(id, callback) {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", callback);
    }

    loadStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) Object.assign(this.data, JSON.parse(saved));
        } catch (error) {
            console.error("Storage load error:", error);
        }
    }

    saveStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error("Storage save error:", error);
        }
    }

    addLog(logArray, payload) {
        if (!this.data[logArray]) this.data[logArray] = [];

        this.data[logArray].push({
            ...payload,
            id: Date.now()
        });

        this.saveStorage();
        this.renderAll();
    }

    addHop() {
        const input = document.getElementById("dailyInput");
        const priority = document.getElementById("priorityInput");

        if (!input || !input.value.trim()) return;

        this.data.daily.push({
            id: Date.now(),
            text: input.value.trim(),
            priority: priority?.value || "Medium",
            completed: false,
            createdAt: new Date().toISOString(),
            date: this.getTodayDate()
        });

        input.value = "";
        this.saveStorage();
        this.renderAll();
    }

    toggleHop(id) {
        const hop = this.data.daily.find(h => h.id === id);

        if (hop) {
            hop.completed = !hop.completed;
            this.saveStorage();
            this.renderAll();
        }
    }

    deleteHop(id) {
        this.data.daily = this.data.daily.filter(h => h.id !== id);
        this.saveStorage();
        this.renderAll();
    }

    addSugar() {
        const input = document.getElementById("sugarInput");
        const val = parseFloat(input?.value);

        if (isNaN(val)) return;

        this.addLog("sugarLog", {
            type: "sugar",
            val: val,
            icon: "🩸",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });

        input.value = "";
    }

    addCarb() {
        const input = document.getElementById("carbInput");
        const val = parseFloat(input?.value);

        if (isNaN(val)) return;

        this.addLog("carbLog", {
            type: "carbs",
            val: val,
            icon: "🥣",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });

        input.value = "";
    }

    addInsulin() {
        const input = document.getElementById("insulinInput");
        const val = parseFloat(input?.value);

        if (isNaN(val)) return;

        this.addLog("insulinLog", {
            type: "insulin",
            val: val,
            icon: "💉",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });

        input.value = "";
    }

    addSleepFromInput(quality) {
        const input = document.getElementById("sleepHoursInput");
        const hours = parseFloat(input?.value);

        if (isNaN(hours)) return;

        this.addLog("sleepLog", {
            type: "sleep",
            hours: hours,
            quality: quality,
            icon: "😴",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });

        input.value = "";
    }

    addStress(level) {
        this.addLog("stressLog", {
            type: "stress",
            val: level,
            score: this.stressScores[level] || 5,
            icon: "😰",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });
    }

    addEnergy(level) {
        this.addLog("energyLog", {
            type: "energy",
            val: level,
            score: this.energyScores[level] || 5,
            icon: "⚡",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });
    }

    addSymptom(symptom) {
        this.addLog("symptomLog", {
            type: "symptom",
            val: symptom,
            icon: "🩺",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });
    }

    addExerciseFromInput(type, intensity) {
        const input = document.getElementById("exerciseMinutesInput");
        const minutes = parseInt(input?.value, 10);

        if (isNaN(minutes) || minutes < 1) return;

        this.addLog("exerciseLog", {
            type: "exercise",
            exerciseType: type,
            minutes: minutes,
            duration: minutes,
            intensity: intensity,
            icon: "🏃",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });

        input.value = "";
    }

    toggleWater(btn, index) {
        if (btn.classList.contains("active")) {
            btn.classList.remove("active");
            this.data.waterCount = Math.max(0, this.data.waterCount - 1);
        } else {
            btn.classList.add("active");
            this.data.waterCount = index + 1;
        }

        this.addLog("waterLog", {
            type: "water",
            val: this.data.waterCount,
            icon: "💧",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });
    }

    renderAll() {
        this.renderBasicUI();
        this.renderTasks();
        this.renderSummaryStats();
        this.renderHistory();
    }

    renderBasicUI() {
        const dateEl = document.getElementById("currentDate");

        if (dateEl) {
            const today = new Date();

            dateEl.textContent = today.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric"
            });
        }

        const waterCountEl = document.getElementById("waterCountText");
        if (waterCountEl) waterCountEl.textContent = `${this.data.waterCount} / 8`;

        document.querySelectorAll(".drop-btn").forEach((btn, index) => {
            if (index < this.data.waterCount) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }

    renderTasks() {
        const list = document.getElementById("dailyList");
        if (!list) return;

        const todayDate = this.getTodayDate();
        const todayTasks = this.data.daily.filter(t => t.date === todayDate);

        if (todayTasks.length === 0) {
            list.innerHTML = `
                <li style="text-align:center;color:var(--txt);opacity:0.5;padding:20px;">
                    No hops yet. Start hopping! 🐸
                </li>
            `;
            this.updateProgress(0, 0);
            return;
        }

        list.innerHTML = todayTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}
                    onchange="pond.toggleHop(${task.id})">
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
                <button class="btn-delete" onclick="pond.deleteHop(${task.id})">×</button>
            </li>
        `).join("");

        const completed = todayTasks.filter(t => t.completed).length;
        this.updateProgress(completed, todayTasks.length);
    }

    updateProgress(completed, total) {
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        const progressFill = document.getElementById("dailyProgress");
        const progressText = document.getElementById("dailyProgressText");

        if (progressFill) progressFill.style.width = percent + "%";
        if (progressText) progressText.textContent = percent + "%";
    }

    renderSummaryStats() {
        const todayDate = this.getTodayDate();

        const todayMoods = this.data.moodLog.filter(m => m.fullDate?.includes(todayDate));
        let moodAvg = "—";

        if (todayMoods.length > 0) {
            const moodSum = todayMoods.reduce((sum, m) => sum + (this.moodScores[m.val] || 5), 0);
            moodAvg = (moodSum / todayMoods.length).toFixed(1);
        }

        const todayGlucose = this.data.sugarLog.filter(s => s.fullDate?.includes(todayDate));
        let glucoseAvg = "—";

        if (todayGlucose.length > 0) {
            const glucoseSum = todayGlucose.reduce((sum, s) => sum + s.val, 0);
            glucoseAvg = (glucoseSum / todayGlucose.length).toFixed(0) + " mg/dL";
        }

        const moodEl = document.getElementById("todayMoodAvg");
        const glucoseEl = document.getElementById("todayGlucoseAvg");

        if (moodEl) moodEl.textContent = moodAvg;
        if (glucoseEl) glucoseEl.textContent = glucoseAvg;
    }

    renderHistory() {
        const dailyHistory = document.getElementById("achievementDailyHistoryList");

        if (dailyHistory) {
            const completed = this.data.daily.filter(t => t.completed);

            dailyHistory.innerHTML = completed.slice(-10).map(t => `
                <div class="history-item">
                    <strong>${this.escapeHtml(t.text)}</strong>
                    <small>${new Date(t.createdAt).toLocaleDateString()}</small>
                </div>
            `).join("") || "<div>No completed tasks yet</div>";
        }

        const trackerHistory = document.getElementById("achievementTrackerHistoryList");

        if (trackerHistory) {
            const allLogs = [
                ...this.data.moodLog.map(m => `${m.icon} Mood: ${m.val} @ ${m.fullDate || 'N/A'}`),
                ...this.data.sugarLog.map(s => `🩸 Glucose: ${s.val}mg/dL @ ${s.fullDate || 'N/A'}`),
                ...this.data.sleepLog.map(s => `😴 Sleep: ${s.hours}h (${s.quality}) @ ${s.fullDate || 'N/A'}`),
                ...this.data.exerciseLog.map(e => `🏃 Exercise: ${e.minutes}min ${e.exerciseType} @ ${e.fullDate || 'N/A'}`),
                ...this.data.waterLog.map(w => `💧 Water: ${w.val}/8 @ ${w.fullDate || 'N/A'}`),
                ...this.data.carbLog.map(c => `🥣 Carbs: ${c.val}g @ ${c.fullDate || 'N/A'}`),
                ...this.data.insulinLog.map(i => `💉 Insulin: ${i.val}u @ ${i.fullDate || 'N/A'}`),
                ...this.data.stressLog.map(s => `😰 Stress: ${s.val} @ ${s.fullDate || 'N/A'}`),
                ...this.data.energyLog.map(e => `⚡ Energy: ${e.val} @ ${e.fullDate || 'N/A'}`)
            ];

            trackerHistory.innerHTML = allLogs.slice(-15).map(log => `
                <div class="history-item">${log}</div>
            `).join("") || "<div>No tracker logs yet</div>";
        }

        const symptomHistory = document.getElementById("achievementSymptomHistoryList");

        if (symptomHistory) {
            symptomHistory.innerHTML = this.data.symptomLog.slice(-10).map(s => `
                <div class="history-item">${s.icon} ${s.val} @ ${s.fullDate || 'N/A'}</div>
            `).join("") || "<div>No symptoms logged</div>";
        }
    }

    renderChart(canvasId = 'insightChart', panelId = 'insightAnalyticsPanel', insightId = 'insightHealthInsights') {
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof Chart === "undefined") return;

        const ctx = canvas.getContext("2d");

        const sortedSugar = this.sortByLoggedTime(this.data.sugarLog);
        const sortedMood = this.sortByLoggedTime(this.data.moodLog);
        const sortedCarbs = this.sortByLoggedTime(this.data.carbLog);
        const sortedWater = this.sortByLoggedTime(this.data.waterLog);
        const sortedInsulin = this.sortByLoggedTime(this.data.insulinLog);
        const sortedSleep = this.sortByLoggedTime(this.data.sleepLog);
        const sortedStress = this.sortByLoggedTime(this.data.stressLog);
        const sortedEnergy = this.sortByLoggedTime(this.data.energyLog);
        const sortedExercise = this.sortByLoggedTime(this.data.exerciseLog);

        const allEntries = []
            .concat(sortedSugar, sortedMood, sortedCarbs, sortedWater, sortedInsulin)
            .concat(sortedSleep, sortedStress, sortedEnergy, sortedExercise)
            .sort((a, b) => this.dateTimeToNumber(a.fullDate) - this.dateTimeToNumber(b.fullDate));

        const labels = [];

        allEntries.forEach(entry => {
            const t = this.getTime(entry.fullDate);
            if (t && !labels.includes(t)) labels.push(t);
        });

        const datasets = [];

        if (sortedSugar.length > 0) {
            datasets.push({
                label: "Glucose",
                data: sortedSugar.map(s => ({ x: this.getTime(s.fullDate), y: s.val })),
                borderColor: "#ef4444",
                backgroundColor: "#ef4444",
                tension: 0.3,
                yAxisID: "y"
            });
        }

        if (sortedMood.length > 0) {
            datasets.push({
                label: "Mood",
                data: sortedMood.map(m => ({
                    x: this.getTime(m.fullDate),
                    y: this.moodScores[m.val] || 5
                })),
                borderColor: "#f59e0b",
                backgroundColor: "#f59e0b",
                tension: 0.3,
                yAxisID: "yMood"
            });
        }

        if (sortedCarbs.length > 0) {
            datasets.push({
                label: "Carbs",
                data: sortedCarbs.map(c => ({ x: this.getTime(c.fullDate), y: c.val })),
                backgroundColor: "#10b981",
                pointStyle: "rect",
                showLine: false,
                pointRadius: 8,
                yAxisID: "y"
            });
        }

        if (sortedWater.length > 0) {
            datasets.push({
                label: "Water",
                data: sortedWater.map(w => ({ x: this.getTime(w.fullDate), y: w.val })),
                backgroundColor: "#00d4ff",
                pointStyle: "triangle",
                showLine: false,
                pointRadius: 8,
                yAxisID: "yMood"
            });
        }

        if (sortedInsulin.length > 0) {
            datasets.push({
                label: "Insulin",
                data: sortedInsulin.map(i => ({ x: this.getTime(i.fullDate), y: i.val })),
                backgroundColor: "#8b5cf6",
                pointStyle: "star",
                showLine: false,
                pointRadius: 10,
                yAxisID: "yMood"
            });
        }

        if (sortedSleep.length > 0) {
            datasets.push({
                label: "Sleep Hours",
                data: sortedSleep.map(sl => ({ x: this.getTime(sl.fullDate), y: sl.hours })),
                borderColor: "#6366f1",
                backgroundColor: "#6366f1",
                tension: 0.3,
                pointRadius: 7,
                yAxisID: "ySleep"
            });

            datasets.push({
                label: "Sleep Quality",
                data: sortedSleep.map(sl => ({
                    x: this.getTime(sl.fullDate),
                    y: this.sleepQualityScores[sl.quality] || 5
                })),
                borderColor: "#a855f7",
                backgroundColor: "#a855f7",
                tension: 0.3,
                pointStyle: "rectRounded",
                pointRadius: 7,
                yAxisID: "yMood"
            });
        }

        if (sortedStress.length > 0) {
            datasets.push({
                label: "Stress",
                data: sortedStress.map(s => ({
                    x: this.getTime(s.fullDate),
                    y: this.stressScores[s.val] || s.score || 5
                })),
                borderColor: "#ff00aa",
                backgroundColor: "#ff00aa",
                tension: 0.3,
                yAxisID: "yMood"
            });
        }

        if (sortedEnergy.length > 0) {
            datasets.push({
                label: "Energy",
                data: sortedEnergy.map(e => ({
                    x: this.getTime(e.fullDate),
                    y: this.energyScores[e.val] || e.score || 5
                })),
                borderColor: "#00aa77",
                backgroundColor: "#00aa77",
                tension: 0.3,
                yAxisID: "yMood"
            });
        }

        if (sortedExercise.length > 0) {
            datasets.push({
                label: "Exercise Minutes",
                data: sortedExercise.map(ex => ({
                    x: this.getTime(ex.fullDate),
                    y: ex.minutes || ex.duration || 0
                })),
                borderColor: "#3b82f6",
                backgroundColor: "#3b82f6",
                tension: 0.3,
                pointRadius: 7,
                yAxisID: "yExercise"
            });
        }

        if (this.insightChart) this.insightChart.destroy();

        this.insightChart = new Chart(ctx, {
            type: "line",
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: "nearest",
                    intersect: false
                },
                scales: {
                    x: {
                        type: "category",
                        labels: labels,
                        ticks: {
                            color: "#5d4a4a",
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        position: "left",
                        min: 0,
                        max: 350,
                        title: {
                            display: true,
                            text: "Glucose / Carbs"
                        },
                        ticks: {
                            color: "#5d4a4a"
                        }
                    },
                    yMood: {
                        position: "right",
                        min: 1,
                        max: 10,
                        title: {
                            display: true,
                            text: "Mood / Stress / Energy / Water / Insulin"
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: "#5d4a4a"
                        }
                    },
                    ySleep: {
                        position: "right",
                        min: 0,
                        max: 16,
                        title: {
                            display: true,
                            text: "Sleep Hours"
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: "#5d4a4a"
                        }
                    },
                    yExercise: {
                        position: "right",
                        min: 0,
                        max: 120,
                        title: {
                            display: true,
                            text: "Exercise Minutes"
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: "#5d4a4a"
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            boxWidth: 10,
                            font: {
                                size: 10
                            }
                        }
                    },
                    tooltip: {
                        enabled: true
                    }
                }
            }
        });

        const insightPanel = document.getElementById(panelId);

        if (insightPanel) {
            insightPanel.innerHTML = `
                <div>📊 Entries graphed: ${allEntries.length}</div>
                <div>🩸 Glucose logs: ${sortedSugar.length}</div>
                <div>😊 Mood logs: ${sortedMood.length}</div>
                <div>⚡ Energy logs: ${sortedEnergy.length}</div>
            `;
        }

        const insightBox = document.getElementById(insightId);

        if (insightBox) {
            if (allEntries.length === 0) {
                insightBox.innerHTML = `
                    <h3>🌸 Gentle Pattern Insights</h3>
                    <ul><li>Log health data to begin seeing supportive patterns.</li></ul>
                `;
            } else {
                insightBox.innerHTML = `
                    <h3>🌸 Gentle Pattern Insights</h3>
                    <ul>
                        <li>Your chart is now using individual health tracker entries instead of a 7-day trend average.</li>
                        <li>Entries are plotted by the time you logged them, so past-time entries should appear in the right order.</li>
                        <li>Glucose and carbs use the left axis; mood, stress, energy, water, insulin, sleep, and exercise use their own scaled axes.</li>
                    </ul>
                `;
            }
        }
    }

    sortByLoggedTime(logs = []) {
        return [...logs].sort((a, b) => {
            return this.dateTimeToNumber(a.fullDate) - this.dateTimeToNumber(b.fullDate);
        });
    }

    getTime(fullDate) {
        if (!fullDate) return "";

        if (fullDate.includes(" @ ")) {
            return fullDate.split(" @ ")[1];
        }

        return fullDate;
    }

    getDateOnly(fullDate) {
        if (!fullDate) return "";

        if (fullDate.includes(" @ ")) {
            return fullDate.split(" @ ")[0];
        }

        return this.getTodayDate();
    }

    timeToMinutes(fullDate) {
        const time = this.getTime(fullDate);
        if (!time) return 0;

        const parts = time.split(":");
        const hours = parseInt(parts[0], 10) || 0;
        const minutes = parseInt(parts[1], 10) || 0;

        return hours * 60 + minutes;
    }

    dateTimeToNumber(fullDate) {
        const datePart = this.getDateOnly(fullDate);
        const timeMinutes = this.timeToMinutes(fullDate);

        const parsedDate = new Date(datePart);
        const dateValue = isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();

        return dateValue + timeMinutes * 60000;
    }

    getSelectedTime() {
        return document.getElementById("manualTimeInput")?.value || null;
    }

    resetTimePicker() {
        const timeInput = document.getElementById("manualTimeInput");
        if (!timeInput) return;

        const now = new Date();
        timeInput.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }

    currentFullDate(manualTime) {
        const now = new Date();

        const timeStr = manualTime || now.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });

        return `${now.toLocaleDateString()} @ ${timeStr}`;
    }

    getTodayDate() {
        return new Date().toLocaleDateString();
    }

    getLast7Days() {
        const days = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString());
        }

        return days;
    }

    checkDailyReset() {
        const lastDate = localStorage.getItem("lastPondDate");
        const today = this.getTodayDate();

        if (lastDate !== today) {
            this.data.daily = this.data.daily.filter(t => t.date === today);
            localStorage.setItem("lastPondDate", today);
        }
    }

    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    clearWater() {
        if (confirm("Clear water intake?")) {
            this.data.waterCount = 0;
            document.querySelectorAll(".drop-btn").forEach(btn => btn.classList.remove("active"));
            this.saveStorage();
            this.renderBasicUI();
            this.renderHistory();
        }
    }

    clearDayKeepGoals() {
        if (confirm("Clear today's health logs? (Keeps tasks)")) {
            const today = this.getTodayDate();

            this.data.moodLog = this.data.moodLog.filter(m => !m.fullDate?.includes(today));
            this.data.sugarLog = this.data.sugarLog.filter(s => !s.fullDate?.includes(today));
            this.data.carbLog = this.data.carbLog.filter(c => !c.fullDate?.includes(today));
            this.data.waterLog = this.data.waterLog.filter(w => !w.fullDate?.includes(today));
            this.data.insulinLog = this.data.insulinLog.filter(i => !i.fullDate?.includes(today));
            this.data.sleepLog = this.data.sleepLog.filter(s => !s.fullDate?.includes(today));
            this.data.stressLog = this.data.stressLog.filter(s => !s.fullDate?.includes(today));
            this.data.energyLog = this.data.energyLog.filter(e => !e.fullDate?.includes(today));
            this.data.symptomLog = this.data.symptomLog.filter(s => !s.fullDate?.includes(today));
            this.data.exerciseLog = this.data.exerciseLog.filter(e => !e.fullDate?.includes(today));

            this.data.waterCount = 0;

            this.saveStorage();
            this.renderAll();
        }
    }

    resetDayEverything() {
        if (confirm("⚠️ Reset EVERYTHING? This cannot be undone!")) {
            if (confirm("Are you ABSOLUTELY sure?")) {
                this.data = {
                    daily: [],
                    history: [],
                    moodLog: [],
                    sugarLog: [],
                    carbLog: [],
                    waterLog: [],
                    insulinLog: [],
                    sleepLog: [],
                    stressLog: [],
                    energyLog: [],
                    symptomLog: [],
                    exerciseLog: [],
                    analytics: [],
                    waterCount: 0,
                    streak: 0,
                    lastStreakDate: null,
                    theme: 'light'
                };

                this.saveStorage();
                this.renderAll();

                if (this.insightChart) {
                    this.insightChart.destroy();
                    this.insightChart = null;
                }
            }
        }
    }

    async exportToExcelWithChart() {
        try {
            this.renderChart('insightChart', 'insightAnalyticsPanel', 'insightHealthInsights');

            await new Promise(resolve => setTimeout(resolve, 500));

            const workbook = new ExcelJS.Workbook();

            const summarySheet = workbook.addWorksheet("Summary");
            summarySheet.pageSetup.paperSize = ExcelJS.PageSize.A4;
            summarySheet.pageSetup.orientation = 'landscape';

            const chartCanvas = document.getElementById("insightChart");

            if (chartCanvas && chartCanvas.parentElement.offsetHeight > 0) {
                try {
                    const chartImage = await html2canvas(chartCanvas, {
                        allowTaint: true,
                        useCORS: true,
                        scale: 2
                    });

                    const chartImageData = chartImage.toDataURL('image/png');

                    const imageId = workbook.addImage({
                        base64: chartImageData,
                        extension: 'png'
                    });

                    summarySheet.addImage(imageId, 'A1:H15');
                } catch (e) {
                    console.log("Chart export skipped:", e);
                }
            }

            summarySheet.addRow([]);
            summarySheet.addRow(["Completed Goals 🌿"]);
            summarySheet.getCell(summarySheet.rowCount, 1).font = {
                bold: true,
                size: 12
            };

            const completedGoals = this.data.daily.filter(t => t.completed);

            if (completedGoals.length > 0) {
                completedGoals.forEach(goal => {
                    summarySheet.addRow([goal.text, goal.priority]);
                });
            } else {
                summarySheet.addRow(["No completed goals"]);
            }

            summarySheet.addRow([]);
            summarySheet.addRow(["Symptoms 🩺"]);
            summarySheet.getCell(summarySheet.rowCount, 1).font = {
                bold: true,
                size: 12
            };

            if (this.data.symptomLog.length > 0) {
                this.data.symptomLog.forEach(symptom => {
                    summarySheet.addRow([symptom.val, symptom.fullDate]);
                });
            } else {
                summarySheet.addRow(["No symptoms logged"]);
            }

            summarySheet.addRow([]);
            summarySheet.addRow(["Sleep & Exercise 😴🏃"]);
            summarySheet.getCell(summarySheet.rowCount, 1).font = {
                bold: true,
                size: 12
            };

            const sleepSum = this.data.sleepLog.reduce((sum, s) => sum + Number(s.hours || 0), 0);
            const exerciseSum = this.data.exerciseLog.reduce((sum, e) => sum + Number(e.minutes || 0), 0);

            summarySheet.addRow(["Total Sleep Hours", sleepSum.toFixed(2)]);
            summarySheet.addRow(["Total Exercise Minutes", exerciseSum]);

            const dataSheet = workbook.addWorksheet("Detailed Data");

            dataSheet.columns = [
                { header: "Date", key: "date", width: 15 },
                { header: "Time", key: "time", width: 10 },
                { header: "Type", key: "type", width: 12 },
                { header: "Value", key: "value", width: 15 },
                { header: "Details", key: "details", width: 25 }
            ];

            const rows = [];

            this.data.moodLog.forEach(m => {
                const [date, time] = (m.fullDate || "").split(" @ ");
                rows.push({ date, time, type: "Mood", value: m.val, details: m.icon });
            });

            this.data.sugarLog.forEach(s => {
                const [date, time] = (s.fullDate || "").split(" @ ");
                rows.push({ date, time, type: "Glucose", value: s.val + "mg/dL", details: "" });
            });

            this.data.carbLog.forEach(c => {
                const [date, time] = (c.fullDate || "").split(" @ ");
                rows.push({ date, time, type: "Carbs", value: c.val + "g", details: "" });
            });

            this.data.insulinLog.forEach(i => {
                const [date, time] = (i.fullDate || "").split(" @ ");
                rows.push({ date, time, type: "Insulin", value: i.val + "u", details: "" });
            });

            this.data.waterLog.forEach(w => {
                const [date, time] = (w.fullDate || "").split(" @ ");
                rows.push({ date, time, type: "Water", value: w.val + "/8", details: "" });
            });

            this.data.sleepLog.forEach(s => {
                const [date, time] = (s.fullDate || "").split(" @ ");
                rows.push({ date, time, type: "Sleep", value: s.hours + "h", details: s.quality });
            });

            this.data.stressLog.forEach(s => {
                const [date, time] = (s.fullDate || "").split(" @ ");
                rows.push({ date, time, type: "Stress", value: s.val, details: s.score || "" });
            });

            this.data.energyLog.forEach(e => {
                const [date, time] = (e.fullDate || "").split(" @ ");
                rows.push({ date, time, type: "Energy", value: e.val, details: e.score || "" });
            });

            this.data.exerciseLog.forEach(e => {
                const [date, time] = (e.fullDate || "").split(" @ ");
                rows.push({
                    date,
                    time,
                    type: "Exercise",
                    value: e.minutes + "m",
                    details: e.exerciseType + " (" + e.intensity + ")"
                });
            });

            rows
                .sort((a, b) => {
                    const aFull = `${a.date || this.getTodayDate()} @ ${a.time || "00:00"}`;
                    const bFull = `${b.date || this.getTodayDate()} @ ${b.time || "00:00"}`;
                    return this.dateTimeToNumber(aFull) - this.dateTimeToNumber(bFull);
                })
                .forEach(row => dataSheet.addRow(row));

            const buffer = await workbook.xlsx.writeBuffer();

            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `Progress-Pond-${this.getTodayDate()}.xlsx`;
            link.click();

            window.URL.revokeObjectURL(url);

            alert("✅ Export successful!");
        } catch (error) {
            console.error("Export error:", error);
            alert("❌ Export failed. Please try again.");
        }
    }

    setMotivation() {
        const motivationText = document.getElementById("motivationText");

        if (motivationText) {
            motivationText.textContent = this.frogQuotes[Math.floor(Math.random() * this.frogQuotes.length)];
        }
    }

    closeBanner() {
        const bar = document.getElementById("motivationBar");
        if (bar) bar.style.display = "none";
    }

    toggleTheme() {
        this.data.theme = this.data.theme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('dark-mode');
        this.saveStorage();
    }
}

let pond;

document.addEventListener("DOMContentLoaded", () => {
    pond = new ProgressPond();
});
