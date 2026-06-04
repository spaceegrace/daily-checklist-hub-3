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
        this.addButtonListener("tabExportExcelBtn", () => this.exportToExcelWithChart());
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
        this.renderSummaryStats();
        this.renderHistory();
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

    renderSummaryStats() {
        // Home page summary stats
        const todayDate = this.getTodayDate();
        
        // Average mood today
        const todayMoods = this.data.moodLog.filter(m => m.fullDate?.includes(todayDate));
        let moodAvg = "—";
        if (todayMoods.length > 0) {
            const moodSum = todayMoods.reduce((sum, m) => sum + (this.moodScores[m.val] || 5), 0);
            moodAvg = (moodSum / todayMoods.length).toFixed(1);
        }

        // Average glucose today
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
        // Achievement tab - Goals
        const dailyHistory = document.getElementById("achievementDailyHistoryList");
        if (dailyHistory) {
            const completed = this.data.daily.filter(t => t.completed);
            dailyHistory.innerHTML = completed.slice(-10).map(t => 
                `<div class="history-item">
                    <strong>${this.escapeHtml(t.text)}</strong>
                    <small>${new Date(t.createdAt).toLocaleDateString()}</small>
                </div>`
            ).join("") || "<div>No completed tasks yet</div>";
        }

        // Achievement tab - All Tracker History
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
            trackerHistory.innerHTML = allLogs.slice(-15).map(log => 
                `<div class="history-item">${log}</div>`
            ).join("") || "<div>No tracker logs yet</div>";
        }

        // Achievement tab - Symptoms
        const symptomHistory = document.getElementById("achievementSymptomHistoryList");
        if (symptomHistory) {
            symptomHistory.innerHTML = this.data.symptomLog.slice(-10).map(s =>
                `<div class="history-item">${s.icon} ${s.val} @ ${s.fullDate || 'N/A'}</div>`
            ).join("") || "<div>No symptoms logged</div>";
        }
    }

   
        renderChart(canvasId = 'insightChart', panelId = 'insightAnalyticsPanel', insightId = 'insightHealthInsights') {
            const ctx = document.getElementById(canvasId);
            if (!ctx) return;

            const healthEntries = this.getHealthTrackerChartEntries();

            if (this.insightChart) {
                this.insightChart.destroy();
            }

            this.insightChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: healthEntries.map(entry => entry.label),
                    datasets: [
                        {
                            label: 'Mood',
                            data: healthEntries.map(entry => entry.mood),
                            borderColor: '#ffc2d1',
                            backgroundColor: 'rgba(255, 194, 209, 0.1)',
                            tension: 0.4,
                            spanGaps: true
                        },
                        {
                            label: 'Energy',
                            data: healthEntries.map(entry => entry.energy),
                            borderColor: '#00ff99',
                            backgroundColor: 'rgba(0, 255, 153, 0.1)',
                            tension: 0.4,
                            spanGaps: true
                        },
                        {
                            label: 'Stress',
                            data: healthEntries.map(entry => entry.stress),
                            borderColor: '#ff00aa',
                            backgroundColor: 'rgba(255, 0, 170, 0.1)',
                            tension: 0.4,
                            spanGaps: true
                        },
                        {
                            label: 'Sleep Quality',
                            data: healthEntries.map(entry => entry.sleep),
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            tension: 0.4,
                            spanGaps: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#5d4a4a' } }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            ticks: { color: '#5d4a4a' }
                        },
                        x: {
                            ticks: {
                                color: '#5d4a4a',
                                maxRotation: 45,
                                minRotation: 0
                            }
                        }
                    }
                }
            });

            const insightPanel = document.getElementById(panelId);
            if (insightPanel) {
                insightPanel.innerHTML = `
                    <div>📊 Health Entries: ${healthEntries.length}</div>
                    <div>😊 Mood Logs: ${this.data.moodLog.length}</div>
                    <div>⚡ Energy Logs: ${this.data.energyLog.length}</div>
                    <div>😰 Stress Logs: ${this.data.stressLog.length}</div>
                `;
            }
        }

        getHealthTrackerChartEntries() {
            const entries = [];

            this.data.moodLog.forEach(log => {
                entries.push({
                    date: log.fullDate || '',
                    label: log.fullDate || 'Mood',
                    mood: this.moodScores[log.val] || null,
                    energy: null,
                    stress: null,
                    sleep: null
                });
            });

            this.data.energyLog.forEach(log => {
                entries.push({
                    date: log.fullDate || '',
                    label: log.fullDate || 'Energy',
                    mood: null,
                    energy: this.energyScores[log.val] || null,
                    stress: null,
                    sleep: null
                });
            });

            this.data.stressLog.forEach(log => {
                entries.push({
                    date: log.fullDate || '',
                    label: log.fullDate || 'Stress',
                    mood: null,
                    energy: null,
                    stress: this.stressScores[log.val] || null,
                    sleep: null
                });
            });

            this.data.sleepLog.forEach(log => {
                entries.push({
                    date: log.fullDate || '',
                    label: log.fullDate || 'Sleep',
                    mood: null,
                    energy: null,
                    stress: null,
                    sleep: this.sleepQualityScores[log.quality] || null
                });
                });

            return entries.sort((a, b) => new Date(a.date.split(' @ ')[0]) - new Date(b.date.split(' @ ')[0]));
        }

        this.insightChart = chartInstance;

        // Update insights panel
        const insightPanel = document.getElementById(panelId);
        if (insightPanel) {
            const avgMood = this.calculateAverageMood(last7Days);
            const avgEnergy = this.calculateAverageEnergy(last7Days);
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

    // ==================== EXPORT TO EXCEL WITH CHART ====================
    
    async exportToExcelWithChart() {
        try {
            // First, ensure chart is rendered
            this.renderChart('insightChart', 'insightAnalyticsPanel', 'insightHealthInsights');
            
            // Wait a moment for chart to render
            await new Promise(resolve => setTimeout(resolve, 500));

            const workbook = new ExcelJS.Workbook();
            
            // Sheet 1: Summary with Chart
            const summarySheet = workbook.addWorksheet("Summary");
            summarySheet.pageSetup.paperSize = ExcelJS.PageSize.A4;
            summarySheet.pageSetup.orientation = 'landscape';

            // Get chart image
            const chartCanvas = document.getElementById("insightChart");
            if (chartCanvas && chartCanvas.parentElement.offsetHeight > 0) {
                try {
                    const chartImage = await html2canvas(chartCanvas, { 
                        allowTaint: true, 
                        useCORS: true,
                        scale: 2
                    });
                    const chartImageData = chartImage.toDataURL('image/png');
                    
                    // Add chart to first rows
                    const imageId = workbook.addImage({
                        base64: chartImageData,
                        extension: 'png',
                    });
                    summarySheet.addImage(imageId, 'A1:H15');
                } catch (e) {
                    console.log("Chart export skipped:", e);
                }
            }

            // Add Completed Goals
            summarySheet.addRow([]);
            summarySheet.addRow(["Completed Goals 🌿"]);
            summarySheet.getCell(summarySheet.rowCount, 1).font = { bold: true, size: 12 };
            
            const completedGoals = this.data.daily.filter(t => t.completed);
            if (completedGoals.length > 0) {
                completedGoals.forEach(goal => {
                    summarySheet.addRow([goal.text, goal.priority]);
                });
            } else {
                summarySheet.addRow(["No completed goals"]);
            }

            // Add Symptoms
            summarySheet.addRow([]);
            summarySheet.addRow(["Symptoms 🩺"]);
            summarySheet.getCell(summarySheet.rowCount, 1).font = { bold: true, size: 12 };
            
            if (this.data.symptomLog.length > 0) {
                this.data.symptomLog.forEach(symptom => {
                    summarySheet.addRow([symptom.val, symptom.fullDate]);
                });
            } else {
                summarySheet.addRow(["No symptoms logged"]);
            }

            // Add Sleep & Exercise
            summarySheet.addRow([]);
            summarySheet.addRow(["Sleep & Exercise 😴🏃"]);
            summarySheet.getCell(summarySheet.rowCount, 1).font = { bold: true, size: 12 };
            
            const sleepSum = this.data.sleepLog.reduce((sum, s) => sum + s.hours, 0);
            const exerciseSum = this.data.exerciseLog.reduce((sum, e) => sum + e.minutes, 0);
            
            summarySheet.addRow(["Total Sleep Hours", sleepSum.toFixed(2)]);
            summarySheet.addRow(["Total Exercise Minutes", exerciseSum]);

            // Sheet 2: Detailed Data
            const dataSheet = workbook.addWorksheet("Detailed Data");
            dataSheet.columns = [
                { header: "Date", key: "date", width: 15 },
                { header: "Time", key: "time", width: 10 },
                { header: "Type", key: "type", width: 12 },
                { header: "Value", key: "value", width: 15 },
                { header: "Details", key: "details", width: 20 }
            ];

            const rows = [];
            
            // Mood
            this.data.moodLog.forEach(m => {
                const [date, time] = (m.fullDate || "").split(" @ ");
                rows.push({ date, time, type: "Mood", value: m.val, details: m.icon });
            });
            
            // Glucose
            this.data.sugarLog.forEach(s => {
                const [date, time] = (s.fullDate || "").split(" @ ");
                rows.push({ date, time, type: "Glucose", value: s.val + "mg/dL", details: "" });
            });
            
            // Sleep
            this.data.sleepLog.forEach(s => {
                const [date, time] = (s.fullDate || "").split(" @ ");
                rows.push({ date, time, type: "Sleep", value: s.hours + "h", details: s.quality });
            });
            
            // Exercise
            this.data.exerciseLog.forEach(e => {
                const [date, time] = (e.fullDate || "").split(" @ ");
                rows.push({ date, time, type: "Exercise", value: e.minutes + "m", details: e.exerciseType + " (" + e.intensity + ")" });
            });

            rows.forEach(row => dataSheet.addRow(row));

            // Generate and download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
