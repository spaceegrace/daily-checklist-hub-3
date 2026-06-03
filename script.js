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

        this.chart = null;
        this.insightChart = null;
        this.storageKey = "ProgressPond_V26";
        this.init();
    }

    // ==================== INITIALIZATION ====================
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
        this.energyScores = { Exhausted: 1, Low: 3, Okay: 5, Good: 7, Energetic: 10 };
        this.stressScores = { Calm: 1, Mild: 3, Moderate: 5, High: 7, Extreme: 10 };
        this.sleepQualityScores = { Bad: 3, Good: 7, Great: 10 };
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
        // Tracker buttons
        this.addButtonListener("addDailyBtn", () => this.addHop());
        this.addButtonListener("addSugarBtn", () => this.addSugar());
        this.addButtonListener("addCarbBtn", () => this.addCarb());
        this.addButtonListener("addInsulinBtn", () => this.addInsulin());
        this.addButtonListener("clearWaterBtn", () => this.clearWater());
        this.addButtonListener("resetTimeBtn", () => this.resetTimePicker());

        // Tab control buttons
        this.addButtonListener("tabExportExcelBtn", () => this.exportData());
        this.addButtonListener("tabClearDayBtn", () => this.clearDayKeepGoals());
        this.addButtonListener("tabClearHistoryBtn", () => this.resetDayEverything());
        this.addButtonListener("bannerClose", () => this.closeBanner());

        // Mood buttons
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

        // Water droplets
        document.querySelectorAll(".drop-btn").forEach((btn, index) => {
            btn.addEventListener("click", () => this.toggleWater(btn, index));
        });

        // Theme toggle (if exists)
        const themeToggle = document.getElementById("themeToggle");
        if (themeToggle) {
            themeToggle.addEventListener("click", () => this.toggleTheme());
        }
    }

    addButtonListener(id, callback) {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", callback);
    }

    // ==================== STORAGE ====================
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

    // ==================== TRACKER FUNCTIONS ====================
    
    addLog(logArray, payload) {
        if (!this.data[logArray]) this.data[logArray] = [];
        this.data[logArray].push({ ...payload, id: Date.now() });
        this.saveStorage();
        this.renderAll();
    }

    addHop() {
        const input = document.getElementById("dailyInput");
        const priority = document.getElementById("priorityInput");
        
        if (!input?.value.trim()) return;

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
        const val = parseFloat(document.getElementById("sugarInput").value);
        if (isNaN(val)) return;
        this.addLog("sugarLog", {
            type: "sugar",
            val: val,
            icon: "🩸",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });
        document.getElementById("sugarInput").value = "";
    }

    addCarb() {
        const val = parseFloat(document.getElementById("carbInput").value);
        if (isNaN(val)) return;
        this.addLog("carbLog", {
            type: "carbs",
            val: val,
            icon: "🥣",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });
        document.getElementById("carbInput").value = "";
    }

    addInsulin() {
        const val = parseFloat(document.getElementById("insulinInput").value);
        if (isNaN(val)) return;
        this.addLog("insulinLog", {
            type: "insulin",
            val: val,
            icon: "💉",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });
        document.getElementById("insulinInput").value = "";
    }

    addSleepFromInput(quality) {
        const hours = parseFloat(document.getElementById("sleepHoursInput").value);
        if (isNaN(hours)) return;
        this.addLog("sleepLog", {
            type: "sleep",
            hours: hours,
            quality: quality,
            icon: "😴",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });
        document.getElementById("sleepHoursInput").value = "";
    }

    addStress(level) {
        this.addLog("stressLog", {
            type: "stress",
            val: level,
            icon: "😰",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });
    }

    addEnergy(level) {
        this.addLog("energyLog", {
            type: "energy",
            val: level,
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
        const minutes = parseInt(document.getElementById("exerciseMinutesInput").value);
        if (isNaN(minutes) || minutes < 1) return;
        this.addLog("exerciseLog", {
            type: "exercise",
            exerciseType: type,
            minutes: minutes,
            intensity: intensity,
            icon: "🏃",
            fullDate: this.currentFullDate(this.getSelectedTime())
        });
        document.getElementById("exerciseMinutesInput").value = "";
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

    // ==================== UI UPDATES ====================
    renderAll() {
        this.renderBasicUI();
        this.renderTasks();
        this.renderAnalytics();
        this.renderHistory();
        this.renderChart('healthChart', 'analyticsPanel', 'healthInsights');
    }

    renderBasicUI() {
        // Update current date
        const dateEl = document.getElementById("currentDate");
        if (dateEl) {
            const today = new Date();
            dateEl.textContent = today.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric"
            });
        }

        // Update water count
        const waterCountEl = document.getElementById("waterCountText");
        if (waterCountEl) {
            waterCountEl.textContent = `${this.data.waterCount} / 8`;
        }

        // Update water buttons
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
            list.innerHTML = '<li style="text-align: center; color: var(--txt); opacity: 0.5; padding: 20px;">No hops yet. Start hopping! 🐸</li>';
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

    renderAnalytics() {
        // Home tab analytics
        const panel = document.getElementById("analyticsPanel");
        if (panel) {
            const todayMood = this.data.moodLog.filter(m => m.fullDate?.includes(this.getTodayDate()));
            const todayEnergy = this.data.energyLog.filter(e => e.fullDate?.includes(this.getTodayDate()));
            const todayStress = this.data.stressLog.filter(s => s.fullDate?.includes(this.getTodayDate()));
            const todayExercise = this.data.exerciseLog.filter(e => e.fullDate?.includes(this.getTodayDate()));

            const stats = [
                `📊 Logs: ${todayMood.length + todayEnergy.length + todayStress.length}`,
                `🏃 Exercise: ${todayExercise.reduce((sum, e) => sum + e.minutes, 0)}m`,
                `💧 Water: ${this.data.waterCount}/8`
            ];

            panel.innerHTML = stats.map(s => `<div>${s}</div>`).join("");
        }

        // Insights tab analytics
        const insightPanel = document.getElementById("insightAnalyticsPanel");
        if (insightPanel) {
            const last7 = this.getLast7Days();
            const avgMood = this.calculateAverageMood(last7);
            const avgEnergy = this.calculateAverageEnergy(last7);
            const totalExercise = this.data.exerciseLog.reduce((sum, e) => sum + e.minutes, 0);

            const insightStats = [
                `📊 7-Day Avg Mood: ${avgMood.toFixed(1)}/10`,
                `⚡ 7-Day Avg Energy: ${avgEnergy.toFixed(1)}/10`,
                `🏃 Total Exercise: ${totalExercise}m`
            ];

            insightPanel.innerHTML = insightStats.map(s => `<div>${s}</div>`).join("");
        }
    }

    calculateAverageMood(days) {
        let total = 0, count = 0;
        days.forEach(day => {
            const logs = this.data.moodLog.filter(log => log.fullDate?.includes(day)) || [];
            logs.forEach(log => {
                const score = this.moodScores[log.val] || 5;
                total += score;
                count++;
            });
        });
        return count === 0 ? 0 : total / count;
    }

    calculateAverageEnergy(days) {
        let total = 0, count = 0;
        days.forEach(day => {
            const logs = this.data.energyLog.filter(log => log.fullDate?.includes(day)) || [];
            logs.forEach(log => {
                const score = this.energyScores[log.val] || 5;
                total += score;
                count++;
            });
        });
        return count === 0 ? 0 : total / count;
    }

    renderHistory() {
        // Achievement tab history
        const dailyHistory = document.getElementById("achievementDailyHistoryList");
        const moodHistory = document.getElementById("achievementMoodHistoryList");
        const symptomHistory = document.getElementById("achievementSymptomHistoryList");

        if (dailyHistory) {
            const completed = this.data.daily.filter(t => t.completed);
            dailyHistory.innerHTML = completed.slice(-5).map(t => 
                `<div class="history-item">
                    <strong>${this.escapeHtml(t.text)}</strong>
                    <small>${new Date(t.createdAt).toLocaleDateString()}</small>
                </div>`
            ).join("") || "<div>No completed tasks yet</div>";
        }

        if (moodHistory) {
            moodHistory.innerHTML = this.data.moodLog.slice(-5).map(m =>
                `<div class="history-item">${m.icon} ${m.val} @ ${m.fullDate || 'N/A'}</div>`
            ).join("") || "<div>No mood logs yet</div>";
        }

        if (symptomHistory) {
            symptomHistory.innerHTML = this.data.symptomLog.slice(-5).map(s =>
                `<div class="history-item">${s.icon} ${s.val} @ ${s.fullDate || 'N/A'}</div>`
            ).join("") || "<div>No symptoms logged</div>";
        }
    }

    renderChart(canvasId = 'healthChart', panelId = 'analyticsPanel', insightId = 'healthInsights') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const last7Days = this.getLast7Days();
        const moodByDay = this.aggregateByDay("moodLog", last7Days);
        const energyByDay = this.aggregateByDay("energyLog", last7Days);

        // Destroy existing chart if needed
        if (canvasId === 'healthChart' && this.chart) {
            this.chart.destroy();
        } else if (canvasId === 'insightChart' && this.insightChart) {
            this.insightChart.destroy();
        }

        const chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [
                    {
                        label: 'Mood',
                        data: moodByDay,
                        borderColor: '#ffc2d1',
                        backgroundColor: 'rgba(255, 194, 209, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Energy',
                        data: energyByDay,
                        borderColor: '#00ff99',
                        backgroundColor: 'rgba(0, 255, 153, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#5d4a4a' } } },
                scales: {
                    y: { beginAtZero: true, max: 10, ticks: { color: '#5d4a4a' } },
                    x: { ticks: { color: '#5d4a4a' } }
                }
            }
        });

        if (canvasId === 'healthChart') {
            this.chart = chartInstance;
        } else if (canvasId === 'insightChart') {
            this.insightChart = chartInstance;
        }
    }

    aggregateByDay(logType, days) {
        return days.map(day => {
            const logs = this.data[logType]?.filter(log => log.fullDate?.includes(day)) || [];
            if (logs.length === 0) return null;
            
            const scores = logs.map(log => {
                if (log.val === 'Happy') return 9;
                if (log.val === 'Sad') return 2;
                if (log.val === 'Energetic') return 10;
                if (log.val === 'Exhausted') return 1;
                if (log.val === 'Calm') return 1;
                return 5;
            });
            return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        });
    }

    // ==================== UTILITY FUNCTIONS ====================
    
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
        const timeStr = manualTime || now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
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

    // ==================== CLEAR / RESET ====================
    
    clearWater() {
        if (confirm("Clear water intake?")) {
            this.data.waterCount = 0;
            document.querySelectorAll(".drop-btn").forEach(btn => btn.classList.remove("active"));
            this.saveStorage();
            this.renderBasicUI();
        }
    }

    clearDayKeepGoals() {
        if (confirm("Clear today's health logs? (Keeps tasks)")) {
            this.data.moodLog = this.data.moodLog.filter(m => !m.fullDate?.includes(this.getTodayDate()));
            this.data.sugarLog = this.data.sugarLog.filter(s => !s.fullDate?.includes(this.getTodayDate()));
            this.data.energyLog = this.data.energyLog.filter(e => !e.fullDate?.includes(this.getTodayDate()));
            this.data.stressLog = this.data.stressLog.filter(s => !s.fullDate?.includes(this.getTodayDate()));
            this.data.waterCount = 0;
            this.saveStorage();
            this.renderAll();
        }
    }

    resetDayEverything() {
        if (confirm("⚠️ Reset EVERYTHING? This cannot be undone!")) {
            if (confirm("Are you ABSOLUTELY sure?")) {
                this.data = {
                    daily: [], history: [], moodLog: [], sugarLog: [], carbLog: [],
                    waterLog: [], insulinLog: [], sleepLog: [], stressLog: [], energyLog: [],
                    symptomLog: [], exerciseLog: [], analytics: [], waterCount: 0,
                    streak: 0, lastStreakDate: null, theme: 'light'
                };
                this.saveStorage();
                this.renderAll();
            }
        }
    }

    // ==================== EXPORT ====================
    
    exportData() {
        const format = prompt("Export as:\n1 = Excel\n2 = JSON\n3 = CSV", "1");
        
        if (format === "1") this.exportToExcel();
        else if (format === "2") this.exportToJson();
        else if (format === "3") this.exportToCsv();
    }

    exportToJson() {
        const dataStr = JSON.stringify(this.data, null, 2);
        this.downloadFile(dataStr, "progress-pond-backup.json", "application/json");
    }

    exportToCsv() {
        let csv = "Date,Type,Value,Details\n";
        
        this.data.moodLog.forEach(m => {
            csv += `${m.fullDate},Mood,${m.val},${m.icon}\n`;
        });
        this.data.sugarLog.forEach(s => {
            csv += `${s.fullDate},Glucose,${s.val}mg/dL,\n`;
        });
        this.data.exerciseLog.forEach(e => {
            csv += `${e.fullDate},Exercise,${e.minutes}min,${e.exerciseType} (${e.intensity})\n`;
        });

        this.downloadFile(csv, "progress-pond.csv", "text/csv");
    }

    exportToExcel() {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Health Data");

        worksheet.columns = [
            { header: "Date", key: "date", width: 15 },
            { header: "Time", key: "time", width: 10 },
            { header: "Type", key: "type", width: 12 },
            { header: "Value", key: "value", width: 15 },
            { header: "Details", key: "details", width: 20 }
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

        rows.forEach(row => worksheet.addRow(row));
        workbook.xlsx.writeBuffer().then(buffer => {
            this.downloadFile(buffer, "progress-pond.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        });
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    // ==================== UI INTERACTIONS ====================
    
    setMotivation() {
        const motivationText = document.getElementById("motivationText");
        if (motivationText) {
            motivationText.textContent = this.frogQuotes[Math.floor(Math.random() * this.frogQuotes.length)];
        }
    }

    closeBanner() {
        document.getElementById("motivationBar").style.display = "none";
    }

    toggleTheme() {
        this.data.theme = this.data.theme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('dark-mode');
        this.saveStorage();
    }
}

// Initialize the app
let pond;
document.addEventListener("DOMContentLoaded", () => {
    pond = new ProgressPond();
});
