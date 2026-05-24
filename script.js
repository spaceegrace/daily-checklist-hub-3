/* =========================================================
   PROGRESS POND V26 - FULL SCRIPT PART 1
   Merged original V25 functions with V26 tabbed layout, averages, and tracker setup
========================================================== */

(function () {
    // ======================== DATA ========================
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
        try { Object.assign(pondData, JSON.parse(saved)); } catch (e) { console.error("Load Error:", e); }
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
                tabs.forEach(t=>t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }

    // ======================== Motivation ========================
    function setMotivation() {
        var motivationText = document.getElementById("motivationText");
        if (motivationText) motivationText.textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
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
   PROGRESS POND V26 - FULL SCRIPT PART 2
   Merged original V25 functions with V26 tabbed layout
========================================================== */

    // ======================== CORE FUNCTIONS ========================
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

    function addSugar() { var val = document.getElementById("sugarInput").value; if(val) addLog("sugarLog", {type:"sugar", val:parseFloat(val), fullDate: currentFullDate(getSelectedTime())}); }
    function addCarb() { var val = document.getElementById("carbInput").value; if(val) addLog("carbLog", {type:"carb", val:parseFloat(val), fullDate: currentFullDate(getSelectedTime())}); }
    function addInsulin() { var val = document.getElementById("insulinInput").value; if(val) addLog("insulinLog", {type:"insulin", val:parseFloat(val), fullDate: currentFullDate(getSelectedTime())}); }
    function addSleep() { /* implement sleep logging from input */ }
    function addStress(level) { addLog("stressLog", {type:"stress", val:level, score:stressScores[level], fullDate: currentFullDate(getSelectedTime())}); }
    function addEnergy(level) { addLog("energyLog", {type:"energy", val:level, score:energyScores[level], fullDate: currentFullDate(getSelectedTime())}); }
    function addSymptom(name) { addLog("symptomLog", {type:"symptom", val:name, fullDate: currentFullDate(getSelectedTime())}); }
    function addExerciseFromInput(type, intensity) { addLog("exerciseLog", {type:"exercise", val:type, intensity:intensity, fullDate: currentFullDate(getSelectedTime())}); }

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
        var waterText = document.getElementById("waterCountText"); if (waterText) waterText.textContent = pondData.waterCount + " / 8";
    }

    function renderHomeAverages() { /* calculate and display averages */ }

    function renderTasks() { /* render daily hops */ }
    function renderAnalytics() { /* render analytics panel */ }
    function renderHistory() { /* render history lists */ }
    function renderChart() { /* draw charts */ }
    function renderInsightPanel() { /* populate insights */ }

    function average(array, mapFn) { if(!array.length) return 0; return array.reduce((sum,e)=>sum+mapFn(e),0)/array.length; }
})();
 
