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
            "🐸 Ribbit! You're doing great today!",
            "🐸 One hop at a time, friend.",
            "🐸 Your efforts matter, even the small ones.",
            "🐸 Progress, not perfection.",
            "🐸 You've got this! 💚",
            "🐸 Be gentle with yourself.",
            "🐸 Every day is a fresh lily pad.",
            "🐸 You're stronger than you think.",
            "🐸 Rest is productive too.",
            "🐸 Celebrate the small wins!"
        ];
    }

    setMotivation() {
        const motivationEl = document.getElementById("motivationFrog");
        if (motivationEl) {
            const quote = this.frogQuotes[Math.floor(Math.random() * this.frogQuotes.length)];
            motivationEl.textContent = quote;
        }
    }

    setupEventListeners() {
        document.querySelectorAll("[data-mood]").forEach(btn => {
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

        this.data[logArray].push({
            ...payload,
            id: Date.now() + Math.floor(Math.random() * 1000)
        });

        this.saveStorage();
        this.renderAll();
    }

    addHop() {
        const input = document.getElementById("hopInput");
        const priority = document.getElementById("hopPriority");

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
        priority.value = "Medium";

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

        if (!val || isNaN(val)) return;

        this.addLog("sugarLog", {
            type: "sugar",
            val,
            icon: "🩸",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });

        input.value = "";
    }

    addCarbs() {
        const input = document.getElementById("carbInput");
        const val = parseFloat(input?.value);

        if (!val || isNaN(val)) return;

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

        if (!val || isNaN(val)) return;

        this.addLog("insulinLog", {
            type: "insulin",
            val,
            icon: "💉",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });

        input.value = "";
    }

    addSleep() {
        const hoursInput = document.getElementById("sleepHoursInput");
        const qualityInput = document.getElementById("sleepQualityInput");
        const hours = parseFloat(hoursInput?.value);
        const quality = qualityInput?.value;

        if (!hours || isNaN(hours)) return;

        this.addLog("sleepLog", {
            type: "sleep",
            hours,
            quality,
            icon: "😴",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });

        hoursInput.value = "";
        qualityInput.value = "Good";
    }

    addSymptom() {
        const input = document.getElementById("symptomInput");
        if (!input || !input.value.trim()) return;

        const symptomText = input.value.trim();

        const symptomMap = {
            low: "🩺",
            high: "🩺",
            nausea: "🤢",
            fatigue: "😴",
            headache: "🤕",
            dizziness: "😵",
            sweating: "😓",
            shaking: "🫨",
            anxiety: "😰",
            confusion: "😕",
            blurry: "👁️",
            tingling: "✋",
            other: "🩺"
        };

        const icon = Object.entries(symptomMap).find(([key]) =>
            symptomText.toLowerCase().includes(key)
        )?.[1] || "🩺";

        this.addLog("symptomLog", {
            type: "symptom",
            val: symptomText,
            icon,
            fullDate: this.currentFullDate(this.getSelectedTime())
        });

        input.value = "";
    }

    addExercise() {
        const typeInput = document.getElementById("exerciseTypeInput");
        const minutesInput = document.getElementById("exerciseMinutesInput");
        const intensityInput = document.getElementById("exerciseIntensityInput");

        const type = typeInput?.value;
        const minutes = parseFloat(minutesInput?.value);
        const intensity = intensityInput?.value;

        if (!type || !minutes || isNaN(minutes)) return;

        this.addLog("exerciseLog", {
            type: "exercise",
            exerciseType: type,
            minutes,
            duration: minutes,
            intensity,
            icon: "🏃",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });

        typeInput.value = "";
        minutesInput.value = "";
        intensityInput.value = "Moderate";
    }

    toggleWater(btn, index) {
        if (btn.classList.contains("active")) {
            this.data.waterCount = index;
        } else {
            this.data.waterCount = index + 1;
        }

        this.saveStorage();
        this.renderAll();
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
        this.renderHistory();
    }

    renderBasicUI() {
        const streakEl = document.getElementById("streakCount");
        if (streakEl) {
            streakEl.textContent = this.data.streak;
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
        const list = document.getElementById("todayTaskList");

        if (!list) return;

        const today = this.getTodayDate();
        const todayTasks = this.data.daily.filter(t => t.date === today);

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
        `).join("") || "<li>No tasks for today. Add one to get started!</li>";
    }

    renderHistory() {
        const dailyHistory = document.getElementById("dailyHistoryList");
        const todayGlucose = this.data.sugarLog.filter(s =>
            s.fullDate && s.fullDate.includes(this.getTodayDate())
        );

        let glucoseAvg = "—";

        if (todayGlucose.length > 0) {
            const glucoseSum = todayGlucose.reduce((sum, s) => sum + Number(s.val || 0), 0);
            glucoseAvg = Math.round(glucoseSum / todayGlucose.length) + " mg/dL";
        }

        const moodEl = document.getElementById("todayMoodAvg");
        if (moodEl) moodEl.textContent = glucoseAvg;

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

        const trackerHistory = document.getElementById("trackerHistoryList");

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

        const sortByLoggedTime = (logs = []) => {
            return logs.sort((a, b) => {
                return this.dateTimeToNumber(b.fullDate) - this.dateTimeToNumber(a.fullDate);
            });
        };

        const sortedSugar = sortByLoggedTime(this.data.sugarLog);
        const sortedMood = sortByLoggedTime(this.data.moodLog);
        const sortedCarbs = sortByLoggedTime(this.data.carbLog);
        const sortedWater = sortByLoggedTime(this.data.waterLog);
        const sortedInsulin = sortByLoggedTime(this.data.insulinLog);
        const sortedSleep = sortByLoggedTime(this.data.sleepLog);
        const sortedStress = sortByLoggedTime(this.data.stressLog);
        const sortedEnergy = sortByLoggedTime(this.data.energyLog);
        const sortedExercise = sortByLoggedTime(this.data.exerciseLog);

        const allEntries = [
            ...sortedSugar,
            ...sortedMood,
            ...sortedCarbs,
            ...sortedWater,
            ...sortedInsulin,
            ...sortedSleep,
            ...sortedStress,
            ...sortedEnergy,
            ...sortedExercise
        ];

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
                fill: false,
                pointRadius: 3
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
                pointRadius: 3,
                showLine: false
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
                pointRadius: 4
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
                pointRadius: 5
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
                pointRadius: 6
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
                fill: false,
                pointRadius: 3
            });
        }

        if (sortedSleep.length > 0) {
            datasets.push({
                label: "Sleep Quality",
                data: sortedSleep.map(sl => ({
                    x: this.getChartLabel(sl.fullDate),
                    y: this.sleepQualityScores[sl.quality] || 5
                })),
                borderColor: "#a855f7",
                backgroundColor: "#a855f7",
                pointRadius: 3,
                showLine: false
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
                pointRadius: 3,
                showLine: false
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
                pointRadius: 3,
                showLine: false
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
                fill: false,
                pointRadius: 3
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
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: "#5d4a4a" } }
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
                        beginAtZero: true,
                        ticks: { color: "#5d4a4a" }
                    }
                }
            }
        });

        const insightBox = document.getElementById(insightId);

        if (insightBox) {
            insightBox.innerHTML = this.buildInsights(allEntries);
        }
    }

    buildInsights(allEntries) {
        if (!allEntries.length) {
            return `
                <h3>🌸 Gentle Pattern Insights</h3>
                <ul><li>Log health data to begin seeing supportive patterns.</li></ul>
            `;
        }

        const insights = [];

        if (this.data.sugarLog.length > 0) {
            const glucoseVals = this.data.sugarLog.map(s => Number(s.val)).filter(n => !isNaN(n));
            const avgGlucose = glucoseVals.reduce((a, b) => a + b, 0) / glucoseVals.length;

            insights.push(`Your average logged glucose is about ${Math.round(avgGlucose)} mg/dL.`);
        }

        if (this.data.moodLog.length > 0) {
            const moodVals = this.data.moodLog.map(m => this.moodScores[m.val] || 5);
            const avgMood = moodVals.reduce((a, b) => a + b, 0) / moodVals.length;

            insights.push(`Your average logged mood score is ${avgMood.toFixed(1)} out of 10.`);
        }

        if (this.data.sleepLog.length > 0) {
            const totalSleep = this.data.sleepLog.reduce((sum, s) => sum + Number(s.hours || 0), 0);
            const avgSleep = totalSleep / this.data.sleepLog.length;

            insights.push(`Your average logged sleep is ${avgSleep.toFixed(1)} hours.`);
        }

        if (this.data.exerciseLog.length > 0) {
            const totalExercise = this.data.exerciseLog.reduce((sum, e) => {
                return sum + Number(e.minutes || e.duration || 0);
            }, 0);

            insights.push(`You have logged ${totalExercise} total exercise minutes.`);
        }

        insights.push("Your chart is using individual health tracker entries, not a 7-day trend average.");

        return `
            <h3>🌸 Gentle Pattern Insights</h3>
            <ul>${insights.map(i => `<li>${this.escapeHtml(i)}</li>`).join("")}</ul>
        `;
    }

    sortByLoggedTime(logs = []) {
        return logs.sort((a, b) => {
            return this.dateTimeToNumber(b.fullDate) - this.dateTimeToNumber(a.fullDate);
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

        return fullDate;
    }

    dateTimeToNumber(fullDate) {
        if (!fullDate) return 0;

        const date = this.getDateOnly(fullDate);
        const time = this.getTime(fullDate);

        const dateNum = new Date(date).getTime();
        if (!dateNum) return 0;

        if (!time) return dateNum;

        const [hours, minutes] = time.split(":").map(Number);
        return dateNum + (hours * 60 + minutes) * 60000;
    }

    getSelectedTime() {
        const timePicker = document.getElementById("timePicker");
        return timePicker?.value || this.getDefaultTime();
    }

    getDefaultTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        return `${hours}:${minutes}`;
    }

    resetTimePicker() {
        const timePicker = document.getElementById("timePicker");
        if (timePicker) {
            timePicker.value = this.getDefaultTime();
        }
    }

    currentFullDate(time = "") {
        const date = this.getTodayDate();
        const t = time || this.getDefaultTime();

        return `${date} @ ${t}`;
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

            const summarySheet = workbook.addWorksheet("Summary");
            const dataSheet = workbook.addWorksheet("Detailed Data");

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
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .forEach(row => dataSheet.addRow(row));

            dataSheet.getRow(1).font = { bold: true };

            [summarySheet, dataSheet].forEach(sheet => {
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

            alert("✅ Export successful!");
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

    setInterval(callback, timeout) {
        return window.setInterval(callback, timeout);
    }

    setTimeout(callback, timeout) {
        return window.setTimeout(callback, timeout);
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
