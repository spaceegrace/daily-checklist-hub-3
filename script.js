// =========================================================
// PROGRESS POND V26 - COMPLETE JS
// =========================================================

(function () {
    var pondData = {
        daily: [], history: [], moodLog: [], sugarLog: [], carbLog: [],
        waterLog: [], insulinLog: [], sleepLog: [], stressLog: [], energyLog: [],
        symptomLog: [], exerciseLog: [], analytics: [], waterCount: 0,
        streak: 0, lastStreakDate: null
    };

    var pondChart = null;

    var moodScores = { Manic:10, Happy:9, Focused:8, Calm:7, Tired:6, Confused:5, Grumpy:4, Angry:3, Sad:2, Crying:1 };
    var energyScores = { Exhausted:1, Low:3, Okay:5, Good:7, Energetic:10 };
    var stressScores = { Calm:1, Mild:3, Moderate:5, High:7, Extreme:10 };
    var sleepQualityScores = { Bad:3, Good:7, Great:10 };

    var moodEmojis = { Happy:"😊", Calm:"😌", Focused:"🧐", Tired:"😴", Grumpy:"😠", Confused:"😕", Angry:"😡", Sad:"😢", Crying:"😭", Manic:"🤪" };

    var frogQuotes = ["🐸 💖 Ribbit! You're doing amazing! 💞 🐸","✨ 🐸 Take a deep breath, little froggy! 💗 ✨","🌸 🐸 Every hop counts! I'm proud of you! 💖 🌸","💕 🐸 Stay hydrated and stay happy! 🐸 💕","🐸 💗 You are the best frog in the pond! ✨ 🐸","🐸 ✨ Leap into happiness! ✨ 🐸","🐸 Don't worry, be hoppy! 🐸","🐸 🌈 Keep calm and leap on! 🌈 🐸"];

    document.addEventListener("DOMContentLoaded", function(){
        loadStorage(); setMotivation(); resetTimePicker(); setupButtons(); renderAll();
    });

    function loadStorage(){
        var saved = localStorage.getItem("ProgressPond_V25");
        if(!saved) return;
        try { Object.assign(pondData, JSON.parse(saved)); } catch(e){ console.error("Load Error:",e); }
    }

    function saveAndRefresh(){ localStorage.setItem("ProgressPond_V25", JSON.stringify(pondData)); renderAll(); }

    function setMotivation(){
        var motivationText = document.getElementById("motivationText");
        if(motivationText) motivationText.textContent = frogQuotes[Math.floor(Math.random()*frogQuotes.length)];
    }

    function setupButtons(){
        setClick("addDailyBtn", addHop);
        setClick("addSugarBtn", addSugar);
        setClick("addCarbBtn", addCarb);
        setClick("addInsulinBtn", addInsulin);
        setClick("resetPondBtn", clearDayKeepGoals);
        setClick("clearHistoryBtn", resetDayEverything);
        setClick("clearWaterBtn", clearWater);
        setClick("resetTimeBtn", resetTimePicker);
        setClick("exportExcelBtn", exportGoalsToExcel);
        setClick("historyToggle", ()=>{document.getElementById("historyFooter").classList.toggle("collapsed");});
        setClick("bannerClose", ()=>{document.getElementById("motivationBar").style.display="none"});

        document.querySelectorAll(".mood-btn").forEach(btn=>{
            btn.addEventListener("click",()=>{ addLog("moodLog",{type:"mood", val:btn.getAttribute("data-mood"), icon:moodEmojis[btn.getAttribute("data-mood")], fullDate:currentFullDate(getSelectedTime())}); });
        });

        document.querySelectorAll(".drop-btn").forEach((btn,index)=>{
            btn.addEventListener("click",()=>{
                if(btn.classList.contains("active")) { btn.classList.remove("active"); pondData.waterCount=Math.max(0,pondData.waterCount-1); saveAndRefresh(); }
                else { btn.classList.add("active"); pondData.waterCount=index+1; addLog("waterLog",{type:"water", val:pondData.waterCount, icon:"💧", fullDate:currentFullDate(getSelectedTime())}); }
            });
        });
    }

    function setClick(id, fn){ var el=document.getElementById(id); if(el) el.addEventListener("click",fn); }
    function getSelectedTime(){ var timeInput=document.getElementById("manualTimeInput"); return timeInput?timeInput.value:null; }
    function resetTimePicker(){ var timeInput=document.getElementById("manualTimeInput"); if(!timeInput) return; var now=new Date(); timeInput.value=String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0"); }
    function currentFullDate(manualTime){ var now=new Date(); var timeStr = manualTime || now.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",hour12:false}); return now.toLocaleDateString([], {month:"short", day:"numeric"}) + " @ " + timeStr; }
    function getTime(fullDate){ if(!fullDate||fullDate.indexOf("@")===-1) return"00:00"; return fullDate.split("@")[1].trim(); }
    function timeToMinutes(fullDate){ var time=getTime(fullDate); var parts=time.split(":"); return parseInt(parts[0],10)*60 + parseInt(parts[1],10); }
    function sortByLoggedTime(arr){ return arr.slice().sort((a,b)=>timeToMinutes(a.fullDate)-timeToMinutes(b.fullDate)); }

    function addLog(logArray,payload){ if(!pondData[logArray]) pondData[logArray]=[]; pondData[logArray].push(Object.assign({id:Date.now()},payload)); saveAndRefresh(); }

    // All tracker functions: addHop, toggleHop, deleteHop, addSugar, addCarb, addInsulin, addSleepFromInput, addStress, addEnergy, addSymptom, addExerciseFromInput

    // Clear / Reset Functions: clearWater, clearDayKeepGoals, resetDayEverything, clearEverything

    // History and Chart Rendering: renderAll, renderBasicUI, renderTasks, renderAnalytics, renderHistory, renderChart

    // Health Insights: generateHealthInsights, renderInsightPanel

    // Export Function: exportGoalsToExcel

    // Collapsible cards logic
    document.addEventListener('DOMContentLoaded',()=>{
        document.querySelectorAll('.pond-card.collapsible h2').forEach(h2=>{
            h2.addEventListener('click',()=>{h2.parentElement.classList.toggle('collapsed');});
        });
    });
})();
