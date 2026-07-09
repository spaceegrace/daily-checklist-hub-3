// =========================================================
// PROGRESS POND V26+ - FULL UPDATED SCRIPT
// =========================================================

class ProgressPond {
    constructor() {
        this.storageKey = "ProgressPond_V26";
        this.insightChart = null;

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
            theme: "light"
        };

        this.init();
    }

    init() {
        this.loadStorage();
        this.setupMoodData();
        this.checkDailyReset();
        this.setupEventListeners();
        this.setupTabs();
        this.setupCollapsibles();
        this.renderAll();
        this.setMotivation();
        this.resetTimePicker();
    }

    setupMoodData() {
        this.moodScores = {
            Manic: 10,
            Happy: 9,
            Focused: 8,
            Calm: 7,
            Tired: 6,
            Confused: 5,
            Grumpy: 4,
            Angry: 3,
            Sad: 2,
            Crying: 1
        };

        this.energyScores = {
            Exhausted: 1,
            Low: 3,
            Okay: 5,
            Good: 7,
            Energetic: 10
        };

        this.stressScores = {
            Calm: 1,
            Mild: 3,
            Moderate: 5,
            High: 7,
            Extreme: 10
        };

        this.sleepQualityScores = {
            Bad: 3,
            Good: 7,
            Great: 10
        };

        this.moodEmojis = {
            Happy: "😊",
            Calm: "😌",
            Focused: "🧐",
            Tired: "😴",
            Grumpy: "😠",
            Confused: "😕",
            Angry: "😡",
            Sad: "😢",
            Crying: "😭",
            Manic: "🤪"
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
                    icon: this.moodEmojis[mood] || "😊",
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

    setupTabs() {
        document.querySelectorAll(".tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const tabName = btn.getAttribute("data-tab");
                this.switchTab(tabName);
            });
        });
    }

    setupCollapsibles() {
        document.querySelectorAll(".pond-card.collapsible h2").forEach(h2 => {
            h2.addEventListener("click", () => {
                h2.parentElement.classList.toggle("collapsed");
            });
        });
    }

    switchTab(tabName) {
        document.querySelectorAll(".tab-content").forEach(tab => {
            tab.classList.remove("active");
        });

        document.querySelectorAll(".tab-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        document.getElementById(tabName)?.classList.add("active");
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add("active");

        if (tabName === "insights") {
            setTimeout(() => {
                this.renderChart("insightChart", "insightAnalyticsPanel", "insightHealthInsights");
            }, 150);
        }
    }

    addButtonListener(id, callback) {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", callback);
    }

    loadStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                Object.assign(this.data, JSON.parse(saved));
            }
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
            id: Date.now() + Math.floor(Math.random() * 1000)
        });

        this.saveStorage();
        this.renderAll();
    }

    addHop() {
        const input = document.getElementById("dailyInput");
        const priority = document.getElementById("priorityInput");

        if (!input || !input.value.trim()) return;

        this.data.daily.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
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
        if (!hop) return;

        hop.completed = !hop.completed;
        this.saveStorage();
        this.renderAll();
    }

    deleteHop(id) {
        this.data.daily = this.data.daily.filter(h => h.id !== id);
        this.saveStorage();
        this.renderAll();
    }

    deleteLog(logArray, id) {
        if (!this.data[logArray]) return;

        this.data[logArray] = this.data[logArray].filter(item => item.id !== id);
        this.saveStorage();
        this.renderAll();
    }

    addSugar() {
        const input = document.getElementById("sugarInput");
        const val = parseFloat(input?.value);

        if (isNaN(val)) return;

        this.addLog("sugarLog", {
            type: "sugar",
            val,
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
            val,
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
            val,
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
            hours,
            quality,
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
            minutes,
            duration: minutes,
            intensity,
            icon: "🏃",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });

        input.value = "";
    }

    toggleWater(btn, index) {
        if (btn.classList.contains("active")) {
            this.data.waterCount = index;
        } else {
            this.data.waterCount = index + 1;
        }

        this.addLog("waterLog", {
            type: "water",
            val: this.data.waterCount,
            icon: "💧",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });
    }

    clearWater() {
        if (!confirm("Clear water intake?")) return;

        this.data.waterCount = 0;
        document.querySelectorAll(".drop-btn").forEach(btn => btn.classList.remove("active"));

        this.saveStorage();
        this.renderAll();
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
        if (waterCountEl) {
            waterCountEl.textContent = `${this.data.waterCount} / 8`;
        }

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
            <li class="task-item ${task.completed ? "completed" : ""}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? "checked" : ""}
                    onchange="pond.toggleHop(${task.id})"
                >
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
            const glucoseSum = todayGlucose.reduce((sum, s) => sum + Number(s.val || 0), 0);
            glucoseAvg = Math.round(glucoseSum / todayGlucose.length) + " mg/dL";
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

            dailyHistory.innerHTML = completed.slice(-20).reverse().map(t => `
                <div class="history-item">
                    <span>
                        <strong>${this.escapeHtml(t.text)}</strong>
                        <small>${t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}</small>
                    </span>
                    <button class="btn-delete" onclick="pond.deleteHop(${t.id})">×</button>
                </div>
            `).join("") || "<div>No completed tasks yet</div>";
        }

        const trackerHistory = document.getElementById("achievementTrackerHistoryList");

        if (trackerHistory) {
            const allLogs = [
                ...this.data.moodLog.map(m => ({
                    text: `${m.icon || "😊"} Mood: ${m.val} @ ${m.fullDate || "N/A"}`,
                    id: m.id,
                    logArray: "moodLog",
                    sort: this.dateTimeToNumber(m.fullDate)
                })),
                ...this.data.sugarLog.map(s => ({
                    text: `🩸 Glucose: ${s.val}mg/dL @ ${s.fullDate || "N/A"}`,
                    id: s.id,
                    logArray: "sugarLog",
                    sort: this.dateTimeToNumber(s.fullDate)
                })),
                ...this.data.sleepLog.map(s => ({
                    text: `😴 Sleep: ${s.hours}h (${s.quality}) @ ${s.fullDate || "N/A"}`,
                    id: s.id,
                    logArray: "sleepLog",
                    sort: this.dateTimeToNumber(s.fullDate)
                })),
                ...this.data.exerciseLog.map(e => ({
                    text: `🏃 Exercise: ${e.minutes || e.duration || 0}min ${e.exerciseType || ""} @ ${e.fullDate || "N/A"}`,
                    id: e.id,
                    logArray: "exerciseLog",
                    sort: this.dateTimeToNumber(e.fullDate)
                })),
                ...this.data.waterLog.map(w => ({
                    text: `💧 Water: ${w.val}/8 @ ${w.fullDate || "N/A"}`,
                    id: w.id,
                    logArray: "waterLog",
                    sort: this.dateTimeToNumber(w.fullDate)
                })),
                ...this.data.carbLog.map(c => ({
                    text: `🥣 Carbs: ${c.val}g @ ${c.fullDate || "N/A"}`,
                    id: c.id,
                    logArray: "carbLog",
                    sort: this.dateTimeToNumber(c.fullDate)
                })),
                ...this.data.insulinLog.map(i => ({
                    text: `💉 Insulin: ${i.val}u @ ${i.fullDate || "N/A"}`,
                    id: i.id,
                    logArray: "insulinLog",
                    sort: this.dateTimeToNumber(i.fullDate)
                })),
                ...this.data.stressLog.map(s => ({
                    text: `😰 Stress: ${s.val} @ ${s.fullDate || "N/A"}`,
                    id: s.id,
                    logArray: "stressLog",
                    sort: this.dateTimeToNumber(s.fullDate)
                })),
                ...this.data.energyLog.map(e => ({
                    text: `⚡ Energy: ${e.val} @ ${e.fullDate || "N/A"}`,
                    id: e.id,
                    logArray: "energyLog",
                    sort: this.dateTimeToNumber(e.fullDate)
                }))
            ].sort((a, b) => b.sort - a.sort);

            trackerHistory.innerHTML = allLogs.slice(0, 30).map(log => `
                <div class="history-item">
                    <span>${this.escapeHtml(log.text)}</span>
                    <button class="btn-delete" onclick="pond.deleteLog('${log.logArray}', ${log.id})">×</button>
                </div>
            `).join("") || "<div>No tracker logs yet</div>";
        }

        const symptomHistory = document.getElementById("achievementSymptomHistoryList");

        if (symptomHistory) {
            const symptoms = [...this.data.symptomLog].sort((a, b) => {
                return this.dateTimeToNumber(b.fullDate) - this.dateTimeToNumber(a.fullDate);
            });

            symptomHistory.innerHTML = symptoms.slice(0, 20).map(s => `
                <div class="history-item">
                    <span>${s.icon || "🩺"} ${this.escapeHtml(s.val)} @ ${s.fullDate || "N/A"}</span>
                    <button class="btn-delete" onclick="pond.deleteLog('symptomLog', ${s.id})">×</button>
                </div>
            `).join("") || "<div>No symptoms logged</div>";
        }
    }

    renderChart(canvasId = "insightChart", panelId = "insightAnalyticsPanel", insightId = "insightHealthInsights") {
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
            const label = this.getChartLabel(entry.fullDate);
            if (label && !labels.includes(label)) labels.push(label);
        });

        const datasets = [];

        if (sortedSugar.length > 0) {
            datasets.push({
                label: "Glucose",
                data: sortedSugar.map(s => ({
                    x: this.getChartLabel(s.fullDate),
                    y: Number(s.val)
                })),
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
                    x: this.getChartLabel(m.fullDate),
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
                data: sortedCarbs.map(c => ({
                    x: this.getChartLabel(c.fullDate),
                    y: Number(c.val)
                })),
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
                data: sortedWater.map(w => ({
                    x: this.getChartLabel(w.fullDate),
                    y: Number(w.val)
                })),
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
                data: sortedInsulin.map(i => ({
                    x: this.getChartLabel(i.fullDate),
                    y: Number(i.val)
                })),
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
                data: sortedSleep.map(sl => ({
                    x: this.getChartLabel(sl.fullDate),
                    y: Number(sl.hours)
                })),
                borderColor: "#6366f1",
                backgroundColor: "#6366f1",
                tension: 0.3,
                pointRadius: 7,
                yAxisID: "ySleep"
            });

            datasets.push({
                label: "Sleep Quality",
                data: sortedSleep.map(sl => ({
                    x: this.getChartLabel(sl.fullDate),
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
                    x: this.getChartLabel(s.fullDate),
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
                    x: this.getChartLabel(e.fullDate),
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
                    x: this.getChartLabel(ex.fullDate),
                    y: Number(ex.minutes || ex.duration || 0)
                })),
                borderColor: "#3b82f6",
                backgroundColor: "#3b82f6",
                tension: 0.3,
                pointRadius: 7,
                yAxisID: "yExercise"
            });
        }

        if (this.insightChart) {
            this.insightChart.destroy();
        }

        this.insightChart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets
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
            insightBox.innerHTML = this.buildInsights(allEntries);
        }
    }

    buildInsights(allEntries) {
        if (!allEntries.length) {
            return `
                <h3>🌸 Gentle Pattern Insights</h3>
                <ul><li>Log health data to begin seeing supportive patterns! 💚</li></ul>
            `;
        }

        const insights = [];

        // Glucose data insights
        if (this.data.sugarLog.length > 0) {
            const glucoseVals = this.data.sugarLog.map(s => Number(s.val)).filter(n => !isNaN(n));
            const minGlucose = Math.min(...glucoseVals);
            const maxGlucose = Math.max(...glucoseVals);
            const rangeGlucose = maxGlucose - minGlucose;
            
            insights.push(`📊 Your glucose data spans from ${minGlucose} to ${maxGlucose} mg/dL — that's a ${rangeGlucose} point spread!`);
        }

        // Mood data insights
        if (this.data.moodLog.length > 0) {
            const moodVals = this.data.moodLog.map(m => this.moodScores[m.val] || 5);
            const maxMood = Math.max(...moodVals);
            const happyCount = this.data.moodLog.filter(m => this.moodScores[m.val] >= 8).length;
            
            insights.push(`😊 You logged ${this.data.moodLog.length} mood entries, with ${happyCount} happy/focused moments!`);
        }

        // Sleep data insights
        if (this.data.sleepLog.length > 0) {
            const totalSleep = this.data.sleepLog.reduce((sum, s) => sum + Number(s.hours || 0), 0);
            const greatSleep = this.data.sleepLog.filter(s => s.quality === "Great").length;
            
            insights.push(`😴 You've logged ${this.data.sleepLog.length} sleep sessions (${totalSleep.toFixed(1)} total hours), including ${greatSleep} great nights! ✨`);
        }

        // Exercise data insights
        if (this.data.exerciseLog.length > 0) {
            const totalExercise = this.data.exerciseLog.reduce((sum, e) => {
                return sum + Number(e.minutes || e.duration || 0);
            }, 0);
            
            insights.push(`🏃 Amazing! You logged ${this.data.exerciseLog.length} activities for a total of ${totalExercise} minutes of movement!`);
        }

        // Water data insights
        if (this.data.waterLog.length > 0) {
            const avgWater = this.data.waterLog.reduce((sum, w) => sum + Number(w.val || 0), 0) / this.data.waterLog.length;
            
            insights.push(`💧 You averaged ${avgWater.toFixed(1)} cups of water per log — stay hydrated, little frog! 🐸`);
        }

        // Stress data insights
        if (this.data.stressLog.length > 0) {
            const calmCount = this.data.stressLog.filter(s => s.val === "Calm" || s.val === "Mild").length;
            
            insights.push(`🧘 Out of ${this.data.stressLog.length} stress entries, ${calmCount} were peaceful moments. Nice balance! 🌿`);
        }

        // Carb data insights
        if (this.data.carbLog.length > 0) {
            const totalCarbs = this.data.carbLog.reduce((sum, c) => sum + Number(c.val || 0), 0);
            const avgCarbs = totalCarbs / this.data.carbLog.length;
            
            insights.push(`🥣 You tracked ${this.data.carbLog.length} carb entries — averaging ${avgCarbs.toFixed(1)}g per entry.`);
        }

        // Insulin data insights
        if (this.data.insulinLog.length > 0) {
            const totalInsulin = this.data.insulinLog.reduce((sum, i) => sum + Number(i.val || 0), 0);
            
            insights.push(`💉 You've logged ${this.data.insulinLog.length} insulin doses totaling ${totalInsulin.toFixed(1)} units.`);
        }

        // Symptom data insights
        if (this.data.symptomLog.length > 0) {
            const symptomTypes = new Set(this.data.symptomLog.map(s => s.val)).size;
            
            insights.push(`🩺 You've tracked ${this.data.symptomLog.length} symptom entries (${symptomTypes} different types). Data helps you recognize patterns! 💪`);
        }

        // Energy data insights
        if (this.data.energyLog.length > 0) {
            const energyVals = this.data.energyLog.map(e => this.energyScores[e.val] || 5);
            const goodEnergyDays = this.data.energyLog.filter(e => this.energyScores[e.val] >= 7).length;
            
            insights.push(`⚡ You're tracking your energy levels! ${goodEnergyDays} out of ${this.data.energyLog.length} entries were high-energy. Keep it going! 🚀`);
        }

        const totalEntries = this.data.moodLog.length + this.data.sugarLog.length + this.data.carbLog.length + 
                            this.data.waterLog.length + this.data.insulinLog.length + this.data.sleepLog.length + 
                            this.data.stressLog.length + this.data.energyLog.length + this.data.exerciseLog.length + 
                            this.data.symptomLog.length;

        insights.push(`🐸 You've logged ${totalEntries} total entries! Your dedication to tracking is amazing! 💖`);

        return `
            <h3>🌸 Gentle Pattern Insights</h3>
            <ul>${insights.map(i => `<li>${this.escapeHtml(i)}</li>`).join("")}</ul>
        `;
    }

    sortByLoggedTime(logs = []) {
        return [...logs].sort((a, b) => {
            return this.dateTimeToNumber(a.fullDate) - this.dateTimeToNumber(b.fullDate);
        });
    }

    getChartLabel(fullDate) {
        const date = this.getDateOnly(fullDate);
        const time = this.getTime(fullDate);

        if (!date && !time) return "";

        return `${date} ${time}`.trim();
    }

    getTime(fullDate) {
        if (!fullDate) return "";

        if (fullDate.includes(" @ ")) {
            return fullDate.split(" @ ")[1];
        }

        return "";
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

    checkDailyReset() {
        const lastDate = localStorage.getItem("lastPondDate");
        const today = this.getTodayDate();

        if (lastDate !== today) {
            this.data.daily = this.data.daily.filter(t => t.date === today);
            this.data.waterCount = 0;
            localStorage.setItem("lastPondDate", today);
            this.saveStorage();
        }
    }

    clearDayKeepGoals() {
        if (!confirm("Clear today's health logs? This keeps tasks.")) return;

        const today = this.getTodayDate();

        const logArrays = [
            "moodLog",
            "sugarLog",
            "carbLog",
            "waterLog",
            "insulinLog",
            "sleepLog",
            "stressLog",
            "energyLog",
            "symptomLog",
            "exerciseLog"
        ];

        logArrays.forEach(logArray => {
            this.data[logArray] = this.data[logArray].filter(item => {
                return !item.fullDate?.includes(today);
            });
        });

        this.data.waterCount = 0;

        this.saveStorage();
        this.renderAll();

        if (this.insightChart) {
            this.renderChart("insightChart", "insightAnalyticsPanel", "insightHealthInsights");
        }
    }

    resetDayEverything() {
        if (!confirm("⚠️ Reset EVERYTHING? This cannot be undone!")) return;
        if (!confirm("Are you ABSOLUTELY sure?")) return;

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
            theme: "light"
        };

        this.saveStorage();
        this.renderAll();

        if (this.insightChart) {
            this.insightChart.destroy();
            this.insightChart = null;
        }
    }

    captureChartImage() {
        return new Promise((resolve) => {
            const canvas = document.getElementById("insightChart");
            if (!canvas) {
                resolve(null);
                return;
            }

            // Create a temporary canvas at high resolution for better quality
            const tempCanvas = document.createElement("canvas");
            const tempCtx = tempCanvas.getContext("2d");

            // Set high DPI for better export quality
            const scale = 2;
            tempCanvas.width = canvas.width * scale;
            tempCanvas.height = canvas.height * scale;
            tempCtx.scale(scale, scale);

            // Draw the current chart onto the temp canvas
            tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);

            // Convert to image data
            resolve(tempCanvas.toDataURL("image/png"));
        });
    }

    async exportToExcelWithChart() {
        const btn = document.getElementById("tabExportExcelBtn");

        try {
            if (!window.ExcelJS) {
                alert("❌ ExcelJS did not load. Check your CDN links in the HTML.");
                return;
            }

            if (btn) {
                btn.disabled = true;
                btn.textContent = "Exporting...";
            }

            const workbook = new ExcelJS.Workbook();
            workbook.creator = "Progress Pond";
            workbook.created = new Date();

            // Create sheets
            const chartImageSheet = workbook.addWorksheet("📈 Chart Image");
            const graphSheet = workbook.addWorksheet("📊 Graph Summary");
            const summarySheet = workbook.addWorksheet("Summary");
            const dataSheet = workbook.addWorksheet("Detailed Data");

            // ========== CHART IMAGE SHEET ==========
            chartImageSheet.pageSetup = {
                paperSize: ExcelJS.Workbook.PAPERSIZE.A4,
                orientation: "landscape"
            };

            chartImageSheet.addRow(["📈 Your Health Insights Chart 📈"]);
            chartImageSheet.getCell("A1").font = { bold: true, size: 16 };

            chartImageSheet.addRow(["Exported", new Date().toLocaleString()]);
            chartImageSheet.addRow([]);

            // Capture and insert chart image
            const chartImageData = await this.captureChartImage();
            if (chartImageData) {
                try {
                    const imageId = workbook.addImage({
                        base64: chartImageData,
                        extension: "png"
                    });

                    // Insert image at A5, spanning multiple columns/rows
                    chartImageSheet.addImage(imageId, {
                        tl: { col: 0, row: 4 },
                        ext: { width: 800, height: 400 }
                    });

                    chartImageSheet.addRow([]);
                    chartImageSheet.addRow([]);
                    chartImageSheet.addRow([]);
                    chartImageSheet.addRow([]);
                    chartImageSheet.addRow([]);
                    chartImageSheet.addRow([]);
                    chartImageSheet.addRow([]);
                    chartImageSheet.addRow([]);
                    chartImageSheet.addRow([]);
                    chartImageSheet.addRow([]);
                    chartImageSheet.addRow([]);
                    chartImageSheet.addRow([]);
                } catch (imgError) {
                    chartImageSheet.addRow(["⚠️ Chart image could not be captured"]);
                    console.warn("Image capture warning:", imgError);
                }
            }

            // ========== GRAPH SUMMARY SHEET ==========
            graphSheet.columns = [
                { width: 35 },
                { width: 20 }
            ];

            graphSheet.addRow(["🐸 Your Pond Summary 🐸"]);
            graphSheet.getCell("A1").font = { bold: true, size: 16 };

            graphSheet.addRow(["Exported", new Date().toLocaleString()]);
            graphSheet.addRow([]);

            // Quick stats for graph sheet
            const moodLogCount = this.data.moodLog.length;
            const glucoseLogCount = this.data.sugarLog.length;
            const sleepLogCount = this.data.sleepLog.length;
            const exerciseLogCount = this.data.exerciseLog.length;
            const waterLogCount = this.data.waterLog.length;
            const carbLogCount = this.data.carbLog.length;
            const insulinLogCount = this.data.insulinLog.length;
            const stressLogCount = this.data.stressLog.length;
            const energyLogCount = this.data.energyLog.length;
            const symptomLogCount = this.data.symptomLog.length;

            graphSheet.addRow(["📊 ENTRY COUNTS 📊"]);
            graphSheet.lastRow.font = { bold: true, size: 12 };

            graphSheet.addRow(["😊 Mood Entries", moodLogCount]);
            graphSheet.addRow(["🩸 Glucose Entries", glucoseLogCount]);
            graphSheet.addRow(["😴 Sleep Sessions", sleepLogCount]);
            graphSheet.addRow(["🏃 Exercise Sessions", exerciseLogCount]);
            graphSheet.addRow(["💧 Water Logs", waterLogCount]);
            graphSheet.addRow(["🥣 Carb Entries", carbLogCount]);
            graphSheet.addRow(["💉 Insulin Entries", insulinLogCount]);
            graphSheet.addRow(["😰 Stress Entries", stressLogCount]);
            graphSheet.addRow(["⚡ Energy Entries", energyLogCount]);
            graphSheet.addRow(["🩺 Symptom Entries", symptomLogCount]);

            graphSheet.addRow([]);
            graphSheet.addRow(["🎯 KEY INSIGHTS 🎯"]);
            graphSheet.lastRow.font = { bold: true, size: 12 };

            // Data-focused insights for export
            if (glucoseLogCount > 0) {
                const glucoseVals = this.data.sugarLog.map(s => Number(s.val)).filter(n => !isNaN(n));
                const minGlucose = Math.min(...glucoseVals);
                const maxGlucose = Math.max(...glucoseVals);
                graphSheet.addRow([`Glucose Range: ${minGlucose} - ${maxGlucose} mg/dL`]);
            }

            if (moodLogCount > 0) {
                const happyCount = this.data.moodLog.filter(m => this.moodScores[m.val] >= 8).length;
                graphSheet.addRow([`Happy/Focused Moments: ${happyCount}/${moodLogCount}`]);
            }

            if (sleepLogCount > 0) {
                const totalSleep = this.data.sleepLog.reduce((sum, s) => sum + Number(s.hours || 0), 0);
                graphSheet.addRow([`Total Sleep Hours: ${totalSleep.toFixed(1)}`]);
            }

            if (exerciseLogCount > 0) {
                const totalExercise = this.data.exerciseLog.reduce((sum, e) => {
                    return sum + Number(e.minutes || e.duration || 0);
                }, 0);
                graphSheet.addRow([`Total Exercise Minutes: ${totalExercise}`]);
            }

            if (waterLogCount > 0) {
                const avgWater = this.data.waterLog.reduce((sum, w) => sum + Number(w.val || 0), 0) / waterLogCount;
                graphSheet.addRow([`Average Water Cups: ${avgWater.toFixed(1)}/8`]);
            }

            if (stressLogCount > 0) {
                const calmCount = this.data.stressLog.filter(s => s.val === "Calm" || s.val === "Mild").length;
                graphSheet.addRow([`Calm/Mild Stress: ${calmCount}/${stressLogCount}`]);
            }

            const totalEntries = moodLogCount + glucoseLogCount + sleepLogCount + exerciseLogCount + 
                                waterLogCount + carbLogCount + insulinLogCount + stressLogCount + 
                                energyLogCount + symptomLogCount;

            graphSheet.addRow([]);
            graphSheet.addRow([`✨ Total Entries: ${totalEntries} ✨`]);
            graphSheet.lastRow.font = { bold: true, size: 12 };

            // ========== ORIGINAL SUMMARY SHEET ==========
            summarySheet.columns = [
                { width: 28 },
                { width: 22 },
                { width: 22 },
                { width: 22 }
            ];

            summarySheet.addRow(["🐸 Progress Pond Export"]);
            summarySheet.getCell("A1").font = { bold: true, size: 18 };

            summarySheet.addRow(["Exported", new Date().toLocaleString()]);
            summarySheet.addRow([]);

            const completedGoals = this.data.daily.filter(t => t.completed);

            const avg = arr => {
                const clean = arr.map(Number).filter(n => !isNaN(n));
                if (!clean.length) return null;
                return clean.reduce((a, b) => a + b, 0) / clean.length;
            };

            const glucoseAvg = avg(this.data.sugarLog.map(s => s.val));
            const moodAvg = avg(this.data.moodLog.map(m => this.moodScores[m.val] || 5));
            const sleepTotal = this.data.sleepLog.reduce((sum, s) => sum + Number(s.hours || 0), 0);
            const exerciseTotal = this.data.exerciseLog.reduce((sum, e) => {
                return sum + Number(e.minutes || e.duration || 0);
            }, 0);

            summarySheet.addRow(["Completed Goals", completedGoals.length]);
            summarySheet.addRow(["Mood Logs", this.data.moodLog.length]);
            summarySheet.addRow(["Average Mood", moodAvg ? moodAvg.toFixed(1) : "—"]);
            summarySheet.addRow(["Glucose Logs", this.data.sugarLog.length]);
            summarySheet.addRow(["Average Glucose", glucoseAvg ? `${Math.round(glucoseAvg)} mg/dL` : "—"]);
            summarySheet.addRow(["Total Sleep", `${sleepTotal.toFixed(2)} hours`]);
            summarySheet.addRow(["Total Exercise", `${exerciseTotal} minutes`]);
            summarySheet.addRow(["Symptoms Logged", this.data.symptomLog.length]);
            summarySheet.addRow([]);

            summarySheet.addRow(["Completed Goals 🌿"]);
            summarySheet.lastRow.font = { bold: true };

            if (completedGoals.length) {
                completedGoals.forEach(goal => {
                    summarySheet.addRow([
                        goal.text,
                        goal.priority,
                        goal.createdAt ? new Date(goal.createdAt).toLocaleString() : ""
                    ]);
                });
            } else {
                summarySheet.addRow(["No completed goals"]);
            }

            summarySheet.addRow([]);
            summarySheet.addRow(["Symptoms 🩺"]);
            summarySheet.lastRow.font = { bold: true };

            if (this.data.symptomLog.length) {
                this.data.symptomLog.forEach(symptom => {
                    summarySheet.addRow([symptom.val, symptom.fullDate || ""]);
                });
            } else {
                summarySheet.addRow(["No symptoms logged"]);
            }

            // ========== DETAILED DATA SHEET ==========
            dataSheet.columns = [
                { header: "Date", key: "date", width: 16 },
                { header: "Time", key: "time", width: 12 },
                { header: "Type", key: "type", width: 18 },
                { header: "Value", key: "value", width: 18 },
                { header: "Details", key: "details", width: 28 }
            ];

            const splitDateTime = fullDate => {
                const parts = String(fullDate || "").split(" @ ");
                return {
                    date: parts[0] || "",
                    time: parts[1] || ""
                };
            };

            const rows = [];

            const pushRow = (fullDate, type, value, details = "") => {
                const dt = splitDateTime(fullDate);

                rows.push({
                    date: dt.date,
                    time: dt.time,
                    type,
                    value,
                    details
                });
            };

            this.data.moodLog.forEach(m => pushRow(m.fullDate, "Mood", m.val, m.icon || ""));
            this.data.sugarLog.forEach(s => pushRow(s.fullDate, "Glucose", s.val, "mg/dL"));
            this.data.carbLog.forEach(c => pushRow(c.fullDate, "Carbs", c.val, "grams"));
            this.data.insulinLog.forEach(i => pushRow(i.fullDate, "Insulin", i.val, "units"));
            this.data.waterLog.forEach(w => pushRow(w.fullDate, "Water", w.val, "out of 8"));
            this.data.sleepLog.forEach(s => pushRow(s.fullDate, "Sleep", s.hours, s.quality || ""));
            this.data.stressLog.forEach(s => pushRow(s.fullDate, "Stress", s.val, s.score || ""));
            this.data.energyLog.forEach(e => pushRow(e.fullDate, "Energy", e.val, e.score || ""));
            this.data.symptomLog.forEach(s => pushRow(s.fullDate, "Symptom", s.val, s.icon || ""));

            this.data.exerciseLog.forEach(e => {
                pushRow(
                    e.fullDate,
                    "Exercise",
                    e.minutes || e.duration || "",
                    `${e.exerciseType || ""} ${e.intensity ? `(${e.intensity})` : ""}`.trim()
                );
            });

            rows
                .sort((a, b) => {
                    const aFull = `${a.date || this.getTodayDate()} @ ${a.time || "00:00"}`;
                    const bFull = `${b.date || this.getTodayDate()} @ ${b.time || "00:00"}`;
                    return this.dateTimeToNumber(aFull) - this.dateTimeToNumber(bFull);
                })
                .forEach(row => dataSheet.addRow(row));

            dataSheet.getRow(1).font = { bold: true };

            [chartImageSheet, graphSheet, summarySheet, dataSheet].forEach(sheet => {
                sheet.eachRow(row => {
                    row.eachCell(cell => {
                        cell.alignment = {
                            vertical: "middle",
                            wrapText: true
                        };
                    });
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();

            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });

            const safeDate = new Date().toISOString().slice(0, 10);

            if (window.saveAs) {
                saveAs(blob, `Progress-Pond-${safeDate}.xlsx`);
            } else {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");

                link.href = url;
                link.download = `Progress-Pond-${safeDate}.xlsx`;
                document.body.appendChild(link);
                link.click();
                link.remove();

                window.URL.revokeObjectURL(url);
            }

            alert("✅ Export successful! Your chart is in the '📈 Chart Image' tab! 🎉");
        } catch (error) {
            console.error("Export error:", error);
            alert("❌ Export failed. Check the console for details.");
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = "📊 Export to Excel";
            }
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
        this.data.theme = this.data.theme === "light" ? "dark" : "light";
        document.body.classList.toggle("dark-mode");
        this.saveStorage();
    }

    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = String(text ?? "");
        return div.innerHTML;
    }
}

let pond;

document.addEventListener("DOMContentLoaded", () => {
    pond = new ProgressPond();

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js").catch(error => {
            console.warn("Service worker not registered:", error);
        });
    }
});
