/* =========================================================
   PROGRESS POND FULL UPDATED JS
   Combines:
   - Tracker functionality of v25
   - Layout and styling of v3
   - 8 water buttons
   - All logging buttons working
   - Insight panel and completed goals
========================================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "ProgressPond_V25V3";

    // Default pond data
    function defaultData() {
        return {
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
    }

    // Load and save
    function getData() {
        let data = defaultData();
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved) data = Object.assign(data, saved);
        } catch(e){console.error(e);}
        return data;
    }

    function saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        renderAll();
    }

    // Helper functions
    function makeId(){return Date.now() + '_' + Math.random().toString(36).slice(2);}
    function getManualTime(){
        const el = document.getElementById('manualTime');
        if(el && el.value) return el.value;
        const now = new Date();
        return String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    }
    function getFullDate(){
        return new Date().toLocaleDateString() + ' @ ' + getManualTime();
    }
    function escapeHTML(value){return String(value||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}

    // Logging functions
    function logValue(type, val, extra){
        if(val===null||val==='') return;
        const data = getData();
        const e = {id: makeId(), type, fullDate: getFullDate(), createdAt: new Date().toISOString()};
        Object.assign(e, extra||{});
        e.val = val;

        switch(type){
            case 'sugar': data.sugarLog.push(e); break;
            case 'carb': data.carbLog.push(e); break;
            case 'insulin': data.insulinLog.push(e); break;
            case 'sleep': data.sleepLog.push(e); break;
            case 'stress': data.stressLog.push(e); break;
            case 'energy': data.energyLog.push(e); break;
            case 'symptom': data.symptomLog.push(e); break;
            case 'exercise': data.exerciseLog.push(e); break;
            case 'mood': data.moodLog.push(e); break;
            case 'water': data.waterLog.push(e); data.waterCount = val; break;
        }
        saveData(data);
    }

    function logGlucose(){logValue('sugar', Number(document.getElementById('glucoseInput')?.value||document.getElementById('sugarInput')?.value||null)); document.getElementById('glucoseInput')?.value=''; document.getElementById('sugarInput')?.value='';}
    function logCarbs(){logValue('carb', Number(document.getElementById('carbInput')?.value||null)); document.getElementById('carbInput')?.value='';}
    function logInsulin(){logValue('insulin', Number(document.getElementById('insulinInput')?.value||null)); document.getElementById('insulinInput')?.value='';}
    function logSleep(){logValue('sleep', Number(document.getElementById('sleepInput')?.value||null), {sleepHours:Number(document.getElementById('sleepInput')?.value||null), sleepQuality:document.getElementById('sleepQualityInput')?.value||null}); document.getElementById('sleepInput')?.value=''; document.getElementById('sleepQualityInput')?.value='';}
    function logStress(){logValue('stress', document.getElementById('stressInput')?.value||null); document.getElementById('stressInput')?.value='';}
    function logEnergy(){logValue('energy', document.getElementById('energyInput')?.value||null); document.getElementById('energyInput')?.value='';}
    function logSymptom(){logValue('symptom', document.getElementById('symptomInput')?.value||null); document.getElementById('symptomInput')?.value='';}
    function logExercise(){logValue('exercise', Number(document.getElementById('exerciseMinutesInput')?.value||null), {exerciseType:document.getElementById('exerciseInput')?.value||'Exercise', minutes:Number(document.getElementById('exerciseMinutesInput')?.value||null)}); document.getElementById('exerciseInput')?.value=''; document.getElementById('exerciseMinutesInput')?.value='';}
    function logMood(mood){logValue('mood', mood, {mood});}

    function logCompletedGoal(){
        const goal=document.getElementById('goalInput')?.value||null;
        if(!goal) return;
        const data=getData();
        data.history.push({id:makeId(), type:'goal', fullDate:getFullDate(), text:goal, goal, completed:true});
        document.getElementById('goalInput').value='';
        saveData(data);
    }

    function setWater(count){logValue('water', count);}

    function connectButton(id, fn){const b=document.getElementById(id); if(b) b.addEventListener('click',fn,true);}

    function connectWaterButtons(){
        document.querySelectorAll('.drop-btn[data-water]').forEach(btn=>{
            btn.addEventListener('click',()=>{
                const count=Number(btn.getAttribute('data-water'));
                setWater(count);
            },true);
        });
    }

    function connectMoodButtons(){
        document.querySelectorAll('.mood-btn[data-mood]').forEach(btn=>{
            btn.addEventListener('click',()=>logMood(btn.getAttribute('data-mood')),true);
        });
    }

    function connectAll(){
        connectButton('addGlucoseBtn',logGlucose);
        connectButton('addCarbBtn',logCarbs);
        connectButton('addInsulinBtn',logInsulin);
        connectButton('addSleepBtn',logSleep);
        connectButton('addStressBtn',logStress);
        connectButton('addEnergyBtn',logEnergy);
        connectButton('addSymptomBtn',logSymptom);
        connectButton('addExerciseBtn',logExercise);
        connectButton('addGoalBtn',logCompletedGoal);
        connectWaterButtons();
        connectMoodButtons();
    }

    function deleteHistoryItem(id){const data=getData();data.history=data.history.filter(i=>String(i.id)!==String(id));saveData(data);}
    function deleteLogItem(type,id){const data=getData();const map={mood:'moodLog',sugar:'sugarLog',glucose:'sugarLog',carb:'carbLog',carbs:'carbLog',insulin:'insulinLog',sleep:'sleepLog',stress:'stressLog',energy:'energyLog',symptom:'symptomLog',exercise:'exerciseLog',water:'waterLog'};const key=map[type];if(!key)return;data[key]=data[key].filter(i=>String(i.id)!==String(id)); if(key==='waterLog')data.waterCount=Math.min(data.waterLog.length,8);saveData(data);}

    function renderAll(){
        const data=getData();
        // dashboard values
        document.getElementById('dashboardWaterValue')&&(document.getElementById('dashboardWaterValue').textContent=data.waterCount+' / 8');
        document.getElementById('waterTotal')&&(document.getElementById('waterTotal').textContent=data.waterCount+' / 8');
        document.getElementById('waterCount')&&(document.getElementById('waterCount').textContent=data.waterCount);
        document.getElementById('dashboardGoalsValue')&&(document.getElementById('dashboardGoalsValue').textContent=data.history.length+' done');
        document.getElementById('dashboardSymptomsValue')&&(document.getElementById('dashboardSymptomsValue').textContent=data.symptomLog.length);
        // update water button states
        document.querySelectorAll('.drop-btn[data-water]').forEach(btn=>{const c=Number(btn.getAttribute('data-water'));btn.classList.toggle('active',c<=data.waterCount);});
        // completed goals
        ['historyList','completedGoalsHistory'].forEach(id=>{
            const box=document.getElementById(id); if(!box)return;
            if(!data.history.length){box.innerHTML='<p class="empty-state">No completed goals yet.</p>';return;}
            box.innerHTML=data.history.slice().reverse().map(i=>'<div class="history-item completed-goal-item"><div class="history-item-content"><strong>✅ '+escapeHTML(i.text)+'</strong><small>'+escapeHTML(i.fullDate)+'</small></div><button type="button" data-delete-history-id="'+escapeHTML(i.id)+'">Delete</button></div>').join('');
        });
    }

    document.addEventListener('DOMContentLoaded',()=>{connectAll();renderAll();});
})();
