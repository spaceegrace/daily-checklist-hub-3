(function(window){

var pondData = {
    daily: [], moodLog: [], sugarLog: [], carbLog: [], insulinLog: [], sleepLog: [], stressLog: [], energyLog: [], symptomLog: [], exerciseLog: [], waterCount: 0
};
var pondChart = null;
var moodScores = {Manic:10, Happy:9, Focused:8, Calm:7, Tired:6, Confused:5, Grumpy:4, Angry:3, Sad:2, Crying:1};

function saveAndRefresh(){
    localStorage.setItem('ProgressPond_V26', JSON.stringify(pondData));
    renderAll();
}

document.addEventListener('DOMContentLoaded', function(){
    loadStorage();
    setupTabs();
    setupDailyButtons();
    setupMoodButtons();
    setupStatsButtons();
    setupSleepButtons();
    setupStressEnergyButtons();
    setupSymptomButtons();
    setupExerciseButtons();
    setupWaterButtons();
    setupHistoryButtons();
    renderAll();
    resetTimePicker();
});

function loadStorage(){
    var s = localStorage.getItem('ProgressPond_V26');
    if(s) try{Object.assign(pondData, JSON.parse(s));} catch(e){console.error(e);}
}

function setupTabs(){
    document.querySelectorAll('.tab-nav button').forEach(tab=>{
        tab.addEventListener('click', ()=>{
            document.querySelectorAll('.tab-content').forEach(sec=>sec.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
            document.querySelectorAll('.tab-nav button').forEach(t=>t.classList.remove('active'));
            tab.classList.add('active');
            renderChart();
            renderInsightPanel();
        });
    });
}

// Daily Hops
function setupDailyButtons(){
    document.getElementById('addDailyBtn').addEventListener('click', addHop);
}
function addHop(){
    var input = document.getElementById('dailyInput');
    var priority = document.getElementById('priorityInput');
    if(!input || !input.value.trim()) return;
    pondData.daily.push({id:Date.now(), text:input.value.trim(), priority:priority.value, completed:false, fullDate:currentFullDate()});
    input.value='';
    renderTasks();
    saveAndRefresh();
}
function renderTasks(){
    var list = document.getElementById('dailyList');
    var completedList = document.getElementById('completedDailyList');
    if(!list||!completedList) return;
    list.innerHTML=''; completedList.innerHTML='';

    pondData.daily.forEach((item,index)=>{
        var li=document.createElement('li');
        li.textContent=`${item.text} [${item.priority}]`;
        if(item.completed){ li.classList.add('completed'); completedList.appendChild(li);} else list.appendChild(li);

        var btn=document.createElement('button'); btn.textContent='✔'; btn.classList.add('check-complete');
        btn.addEventListener('click',()=>{item.completed=!item.completed; renderTasks(); saveAndRefresh();});
        li.appendChild(btn);

        var del=document.createElement('button'); del.textContent='❌';
        del.addEventListener('click',()=>{pondData.daily.splice(index,1); renderTasks(); saveAndRefresh();});
        li.appendChild(del);
    });
    updateDailyProgress();
}
function updateDailyProgress(){
    var progress = document.getElementById('dailyProgress');
    var text = document.getElementById('dailyProgressText');
    if(!progress || !text) return;
    var total = pondData.daily.length;
    var completed = pondData.daily.filter(d=>d.completed).length;
    var percent = total ? Math.round((completed/total)*100) : 0;
    progress.style.width = percent+'%';
    text.textContent = percent+'%';
}

// Trackers
function setupMoodButtons(){
    document.querySelectorAll('.mood-btn').forEach(btn=>{
        btn.addEventListener('click',()=>{
            pondData.moodLog.push({mood:btn.dataset.mood, fullDate:currentFullDate()});
            saveAndRefresh();
        });
    });
}
function setupStatsButtons(){
    document.getElementById('addSugarBtn').addEventListener('click', ()=>{
        var val = Number(document.getElementById('sugarInput').value);
        if(val>0) pondData.sugarLog.push({val, fullDate:currentFullDate()});
        document.getElementById('sugarInput').value=''; saveAndRefresh();
    });
    document.getElementById('addCarbBtn').addEventListener('click', ()=>{
        var val = Number(document.getElementById('carbInput').value);
        if(val>0) pondData.carbLog.push({val, fullDate:currentFullDate()});
        document.getElementById('carbInput').value=''; saveAndRefresh();
    });
    document.getElementById('addInsulinBtn').addEventListener('click', ()=>{
        var val = Number(document.getElementById('insulinInput').value);
        if(val>0) pondData.insulinLog.push({val, fullDate:currentFullDate()});
        document.getElementById('insulinInput').value=''; saveAndRefresh();
    });
}

function setupSleepButtons(){
    document.querySelectorAll('.sleep-card .mini-btn').forEach(btn=>{
        btn.addEventListener('click', ()=>{
            var hours = Number(document.getElementById('sleepHoursInput').value) || 0;
            pondData.sleepLog.push({hours, quality:btn.textContent.split(' ')[1], fullDate:currentFullDate()});
            document.getElementById('sleepHoursInput').value=''; saveAndRefresh();
        });
    });
}

function setupStressEnergyButtons(){
    document.querySelectorAll('[onclick^="addStress"]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
            var level = btn.textContent.split(' ')[0];
            pondData.stressLog.push({level:level, fullDate:currentFullDate()}); saveAndRefresh();
        });
    });
    document.querySelectorAll('[onclick^="addEnergy"]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
            var level = btn.textContent.split(' ')[0];
            pondData.energyLog.push({level:level, fullDate:currentFullDate()}); saveAndRefresh();
        });
    });
}

function setupSymptomButtons(){
    document.querySelectorAll('[onclick^="addSymptom"]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
            pondData.symptomLog.push({symptom:btn.textContent, fullDate:currentFullDate()}); saveAndRefresh();
        });
    });
}

function setupExerciseButtons(){
    document.querySelectorAll('[onclick^="addExerciseFromInput"]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
            var parts = btn.textContent.split(' ');
            pondData.exerciseLog.push({type:parts[0], intensity:parts[1], minutes:Number(document.getElementById('exerciseMinutesInput').value)||0, fullDate:currentFullDate()});
            document.getElementById('exerciseMinutesInput').value=''; saveAndRefresh();
        });
    });
}

function setupWaterButtons(){
    var drops = document.querySelectorAll('.drop-btn');
    drops.forEach((btn,i)=>{
        btn.addEventListener('click', ()=>{
            pondData.waterCount = i+1; renderAll(); saveAndRefresh();
        });
    });
    document.getElementById('clearWaterBtn').addEventListener('click', ()=>{
        pondData.waterCount=0; renderAll(); saveAndRefresh();
    });
}

// History buttons (export/reset)
function setupHistoryButtons(){
    document.getElementById('resetPondBtn').addEventListener('click', ()=>{
        pondData.daily=[]; pondData.sugarLog=[]; pondData.moodLog=[]; pondData.carbLog=[]; pondData.insulinLog=[]; pondData.sleepLog=[];
        pondData.stressLog=[]; pondData.energyLog=[]; pondData.symptomLog=[]; pondData.exerciseLog=[]; pondData.waterCount=0;
        saveAndRefresh();
    });
    document.getElementById('clearHistoryBtn').addEventListener('click', ()=>{
        localStorage.removeItem('ProgressPond_V26'); pondData={daily:[], moodLog:[], sugarLog:[], carbLog:[], insulinLog:[], sleepLog:[], stressLog:[], energyLog:[], symptomLog:[], exerciseLog:[], waterCount:0}; saveAndRefresh();
    });
    // Excel export could be added here
}

function renderAll(){
    renderTasks();
    renderChart();
    renderInsightPanel();
    renderAverages();
    renderHistory();
}

function renderInsightPanel(){
    var box=document.getElementById('healthInsights'); if(!box) return;
    box.innerHTML='';
    if(!pondData.sugarLog.length){box.textContent='Log some health data to see insights'; return;}
    var ul=document.createElement('ul');
    var avg=pondData.sugarLog.reduce((a,b)=>a+b.val,0)/pondData.sugarLog.length;
    var li=document.createElement('li'); li.textContent=`Average Glucose: ${avg.toFixed(1)}`; ul.appendChild(li);
    box.appendChild(ul);
}

function renderAverages(){
    document.getElementById('avg-glucose').textContent = pondData.sugarLog.length ? (pondData.sugarLog.reduce((a,b)=>a+b.val,0)/pondData.sugarLog.length).toFixed(1) : '--';
    document.getElementById('avg-mood').textContent = pondData.moodLog.length ? (pondData.moodLog.reduce((a,b)=>moodScores[b.mood]||0,0)/pondData.moodLog.length).toFixed(1) : '--';
    document.getElementById('avg-water').textContent = pondData.waterCount+' / 8';
    document.getElementById('avg-stress').textContent = pondData.stressLog.length ? (pondData.stressLog.reduce((a,b)=>a+b.level,0)/pondData.stressLog.length).toFixed(1) : '--';
    document.getElementById('avg-energy').textContent = pondData.energyLog.length ? (pondData.energyLog.reduce((a,b)=>a+b.level,0)/pondData.energyLog.length).toFixed(1) : '--';
}

function renderHistory(){
    ['dailyHistoryList','moodHistoryList','symptomHistoryList'].forEach(id=>{
        var container = document.getElementById(id); if(!container) return; container.innerHTML='';
    });
    pondData.daily.forEach(d=>addHistoryItem('dailyHistoryList', d.text, d.fullDate));
    pondData.moodLog.forEach(m=>addHistoryItem('moodHistoryList', m.mood, m.fullDate));
    pondData.symptomLog.forEach(s=>addHistoryItem('symptomHistoryList', s.symptom, s.fullDate));
}

function addHistoryItem(containerId, text, date){
    var container = document.getElementById(containerId);
    var div = document.createElement('div'); div.textContent = `${text} (${date})`;
    var del = document.createElement('button'); del.textContent='❌';
    del.addEventListener('click',()=>{
        if(containerId==='dailyHistoryList') pondData.daily=pondData.daily.filter(d=>d.text!==text);
        else if(containerId==='moodHistoryList') pondData.moodLog=pondData.moodLog.filter(m=>m.mood!==text);
        else if(containerId==='symptomHistoryList') pondData.symptomLog=pondData.symptomLog.filter(s=>s.symptom!==text);
        saveAndRefresh();
    });
    div.appendChild(del); container.appendChild(div);
}

function currentFullDate(){
    var t = document.getElementById('manualTimeInput');
    if(t && t.value) return t.value;
    return new Date().toLocaleString();
}

function renderChart(){
    var canvasHome=document.getElementById('healthChartTrendsHome');
    var canvasTrends=document.getElementById('healthChartTrends');
    var dataLabels=pondData.sugarLog.map(l=>l.fullDate||'');
    var dataVals=pondData.sugarLog.map(l=>l.val||0);
    if(pondChart) pondChart.destroy();
    [canvasHome,canvasTrends].forEach(c=>{
        if(c) pondChart=new Chart(c,{type:'line',data:{labels:dataLabels,datasets:[{label:'Glucose',data:dataVals,borderColor:'green',backgroundColor:'rgba(0,255,0,0.2)',tension:0.3}]},options:{responsive:true,plugins:{legend:{display:true}},scales:{y:{beginAtZero:true}}}});
    });
}

function resetTimePicker(){
    var t=document.getElementById('manualTimeInput');
    if(t){var now=new Date(); t.value=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;}
}

})(window);
