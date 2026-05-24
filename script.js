/* =========================================================
   PROGRESS POND V26 - JS Updated for New HTML
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

    var moodScores = {Manic:10,Happy:9,Focused:8,Calm:7,Tired:6,Confused:5,Grumpy:4,Angry:3,Sad:2,Crying:1};
    var energyScores = {Exhausted:1,Low:3,Okay:5,Good:7,Energetic:10};
    var stressScores = {Calm:1,Mild:3,Moderate:5,High:7,Extreme:10};
    var sleepQualityScores = {Bad:3,Good:7,Great:10};
    var moodEmojis = {Happy:"😊",Calm:"😌",Focused:"🧐",Tired:"😴",Grumpy:"😠",Confused:"😕",Angry:"😡",Sad:"😢",Crying:"😭",Manic:"🤪"};
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
        setMotivation();
        resetTimePicker();
        setupButtons();
        renderAll();
    });

    function loadStorage() {
        var saved = localStorage.getItem("ProgressPond_V25");
        if (!saved) return;
        try { Object.assign(pondData, JSON.parse(saved)); } catch(e){console.error(e);}
    }

    function saveAndRefresh() {
        localStorage.setItem("ProgressPond_V25", JSON.stringify(pondData));
        renderAll();
    }

    function setMotivation() {
        var motivationText = document.getElementById("motivationText");
        if (motivationText) motivationText.textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
    }

    function setupButtons() {
        setClick("addDailyBtn", addHop);
        setClick("addSugarBtn", addSugar);
        setClick("addCarbBtn", addCarb);
        setClick("addInsulinBtn", addInsulin);
        setClick("resetTimeBtn", resetTimePicker);
        setClick("clearWaterBtn", clearWater);
        setClick("bannerClose", function(){document.getElementById("motivationBar").style.display='none';});

        document.querySelectorAll(".mood-btn").forEach(btn => {
            btn.addEventListener("click", function(){
                var mood = btn.getAttribute("data-mood");
                addLog("moodLog", {type:"mood", val:mood, icon:moodEmojis[mood], fullDate:currentFullDate(getSelectedTime())});
            });
        });

        document.querySelectorAll(".drop-btn").forEach((btn, index) => {
            btn.addEventListener("click", function(){
                if(btn.classList.contains("active")){
                    btn.classList.remove("active"); pondData.waterCount=Math.max(0, pondData.waterCount-1); saveAndRefresh();
                } else {
                    btn.classList.add("active"); pondData.waterCount=index+1;
                    addLog("waterLog", {type:"water", val:pondData.waterCount, icon:"💧", fullDate:currentFullDate(getSelectedTime())});
                }
            });
        });
    }

    function setClick(id, fn){ var el = document.getElementById(id); if(el) el.addEventListener("click", fn); }
    function getSelectedTime(){ var t=document.getElementById("manualTimeInput"); return t?t.value:null; }
    function resetTimePicker(){ var t=document.getElementById("manualTimeInput"); if(!t) return; var now=new Date(); t.value=String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");}

    function currentFullDate(manualTime){
        var now=new Date();
        var timeStr=manualTime||now.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",hour12:false});
        return now.toLocaleDateString([], {month:"short", day:"numeric"})+" @ "+timeStr;
    }

    function getTime(fullDate){ return fullDate && fullDate.indexOf("@")!==-1 ? fullDate.split("@")[1].trim() : "00:00"; }
    function timeToMinutes(fullDate){ var parts=getTime(fullDate).split(":"); return (parseInt(parts[0],10)||0)*60+(parseInt(parts[1],10)||0); }
    function sortByLoggedTime(arr){ return arr.slice().sort((a,b)=>timeToMinutes(a.fullDate)-timeToMinutes(b.fullDate)); }

    function addLog(logArray, payload){
        if(!pondData[logArray]) pondData[logArray]=[];
        pondData[logArray].push(Object.assign({id:Date.now()},payload));
        saveAndRefresh();
    }

    function addHop(){
        var input=document.getElementById("dailyInput");
        var priority=document.getElementById("priorityInput");
        if(!input||!input.value.trim()) return;
        pondData.daily.push({id:Date.now(), text:input.value.trim(), priority:priority?priority.value:"Medium"});
        input.value=""; saveAndRefresh();
    }

    window.toggleHop=function(id){ var idx=pondData.daily.findIndex(g=>g.id===id); if(idx>-1){
        var item=pondData.daily.splice(idx,1)[0];
        pondData.history.push({id:Date.now(), text:"["+item.priority+"] "+item.text, fullDate:currentFullDate(getSelectedTime())});
        saveAndRefresh();
    }};

    window.deleteHop=function(id){ pondData.daily=pondData.daily.filter(g=>g.id!==id); saveAndRefresh(); };

    function addSugar(){ var input=document.getElementById("sugarInput"); if(!input) return; var val=parseInt(input.value,10); if(!val) return;
        addLog("sugarLog",{type:"sugar", val:val, color:val<70||val>250?"#ff4d4d":val>180?"#ffa500":"#2d5a27", fullDate:currentFullDate(getSelectedTime())});
        input.value="";
    }

    function addCarb(){ var input=document.getElementById("carbInput"); if(!input) return; var val=parseInt(input.value,10); if(!val) return; addLog("carbLog",{type:"carb", val:val, fullDate:currentFullDate(getSelectedTime())}); input.value="";}
    function addInsulin(){ var input=document.getElementById("insulinInput"); if(!input) return; var val=parseFloat(input.value); if(!val) return; addLog("insulinLog",{type:"insulin", val:val, fullDate:currentFullDate(getSelectedTime())}); input.value="";}

    window.addSleepFromInput=function(quality){ var hoursInput=document.getElementById("sleepHoursInput"); var hours=hoursInput?parseFloat(hoursInput.value):0; if(!hours||hours<=0){alert("Please enter how many hours you slept."); return;} addLog("sleepLog",{type:"sleep", sleepHours:hours, sleepQuality:quality, val:hour
