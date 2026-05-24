/* =========================================================
   PROGRESS POND V26 - TABBED LAYOUT PART 1
   Includes tab switching, home averages, and tracker setup
========================================================== */

(function () {
    var pondData = {
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
        lastStreakDate: null
    };

    var pondChart = null;

    var moodScores = { Manic: 10, Happy: 9, Focused: 8, Calm: 7, Tired: 6, Confused: 5, Grumpy: 4, Angry: 3, Sad: 2, Crying: 1 };
    var energyScores = { Exhausted: 1, Low: 3, Okay: 5, Good: 7, Energetic: 10 };
    var stressScores = { Calm: 1, Mild: 3, Moderate: 5, High: 7, Extreme: 10 };
    var sleepQualityScores = { Bad: 3, Good: 7, Great: 10 };

    var moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠", Confused: "😕", Angry: "😡", Sad: "😢", Crying: "😭", Manic: "🤪" };

    var frogQuotes = [
        "🐸 💖 Ribbit! You're doing amazing! 💞 🐸",
        "✨ 🐸 Take a deep breath, little froggy! 💗 ✨",
        "🌸 🐸 Every hop counts! I'm proud of you! 💖 🌸",
        "💕 🐸 Stay hydrated and stay happy! 🐸 💕",
        "🐸 💗 You are the best frog in the pond! ✨ 🐸",
        "🐸 ✨ Leap into happiness! ✨ 🐸",
        "🐸 Don't worry, be hoppy! 🐸",
        "🐸 🌈 Keep calm and leap on! 🌈 🐸"
    ];

    document.addEventListener("DOMContentLoaded", function () {
        loadStorage();
        setupTabs();
        setMotivation();
        resetTimePicker();
        setupButtons();
        renderAll();
    });

    function loadStorage() {
        var saved = localStorage.getItem("ProgressPond_V26");
        if (!saved) return;

        try {
            Object.assign(pondData, JSON.parse(saved));
        } catch (e) { console.error("Load Error:", e); }
    }

    function saveAndRefresh() {
        localStorage.setItem("ProgressPond_V26", JSON.stringify(pondData));
        renderAll();
    }

    // ======================== Tabs ========================
    function setupTabs() {
        const tabs = document.querySelectorAll('.tab-nav button');
        const sections = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                sections.forEach(sec => sec.classList.remove('active'));
                document.getElementById(tab.dataset.tab).classList.add('active');
            });
        });
    }

    // ======================== Motivation ========================
    function setMotivation() {
        var motivationText = document.getElementById("motivationText");
        if (motivationText) {
            motivationText.textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
        }
    }

    // ======================== Buttons ========================
    function setupButtons() {
        setClick("addDailyBtn", addHop);
        setClick("addSugarBtn", addSugar);
        setClick("addCarbBtn", addCarb);
        setClick("addInsulinBtn", addInsulin);
        setClick("addSleepBtn", addSleep);
        setClick("resetPondBtn", clearDayKeepGoals);
        setClick("clearHistoryBtn", resetDayEverything);
        setClick("clearWaterBtn", clearWater);
        setClick("resetTimeBtn", resetTimePicker);
        setClick("exportExcelBtn", exportGoalsToExcel);

        document.querySelectorAll(".mood-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var mood = btn.getAttribute("data-mood");
                addLog("moodLog", { type: "mood", val: mood, icon: moodEmojis[mood], fullDate: currentFullDate(getSelectedTime()) });
            });
        });

        document.querySelectorAll(".drop-btn").forEach(function (btn, index) {
            btn.addEventListener("click", function () {
                if (btn.classList.contains("active")) {
                    btn.classList.remove("active");
                    pondData.waterCount = Math.max(0, pondData.waterCount - 1);
                } else {
                    btn.classList.add("active");
                    pondData.waterCount = index + 1;
                    addLog("waterLog", { type: "water", val: pondData.waterCount, icon: "💧", fullDate: currentFullDate(getSelectedTime()) });
                }
                saveAndRefresh();
            });
        });
    }

    function setClick(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener("click", fn); }
    function getSelectedTime() { var timeInput = document.getElementById("manualTimeInput"); return timeInput ? timeInput.value : null; }
    function resetTimePicker() {
        var timeInput = document.getElementById("manualTimeInput");
        if (!timeInput) return;
        var now = new Date();
        timeInput.value = String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
    }
    function currentFullDate(manualTime) {
        var now = new Date();
        var timeStr = manualTime || now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
        return now.toLocaleDateString([], { month: "short", day: "numeric" }) + " @ " + timeStr;
    }
    /* =========================================================
   PROGRESS POND V26 - TABBED LAYOUT PART 2
   Rendering, charting, insights, history, averages
========================================================== */

        function addLog(logArray, payload) {
            if (!pondData[logArray]) pondData[logArray] = [];
            pondData[logArray].push({ id: Date.now(), ...payload });
            saveAndRefresh();
        }

        function addHop() {
            var input = document.getElementById("dailyInput");
            var priority = document.getElementById("priorityInput");
            if (!input || !input.value.trim()) return;
            pondData.daily.push({ id: Date.now(), text: input.value.trim(), priority: priority ? priority.value : "Medium" });
            input.value = "";
            saveAndRefresh();
        }

        // ======================== Render Functions ========================
        function renderAll() {
            renderBasicUI();
            renderTasks();
            renderAnalytics();
            renderHistory();
            renderChart();
            renderInsightPanel();
            renderHomeAverages();
        }

        function renderBasicUI() {
            var currentDate = document.getElementById("currentDate");
            if (currentDate) currentDate.textContent = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

            document.querySelectorAll(".drop-btn").forEach(function(btn,i){ btn.classList.toggle("active", i<pondData.waterCount); });
            var waterText = document.getElementById("waterCountText");
            if (waterText) waterText.textContent = pondData.waterCount + " / 8";
       }

        function renderHomeAverages() {
            var avgGlucose = Math.round(average(pondData.sugarLog, e => e.val) || 0);
            var avgMood = Math.round(average(pondData.moodLog, e => moodScores[e.val]||5) || 0);
            var avgWater = Math.round(average(pondData.waterLog, e => e.val) || 0);
            var avgStress = Math.round(average(pondData.stressLog, e => e.score||5) || 0);
            var avgEnergy = Math.round(average(pondData.energyLog, e => e.score||5) || 0);

            var mapping = {
                "avg-glucose": avgGlucose,
                "avg-mood": avgMood,
                "avg-water": avgWater,
                "avg-stress": avgStress,
                "avg-energy": avgEnergy
            };

            Object.keys(mapping).forEach(id => {
                var el = document.getElementById(id);
                if(el) el.textContent = mapping[id];
            });
        }

    // Existing renderTasks, renderAnalytics, renderHistory, renderChart, renderInsightPanel functions
    // are reused from V25 code without changes, just ensure they target correct tab content.

})();
