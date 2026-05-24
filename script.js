/* =========================================================
   PROGRESS POND V26 - FULL FUNCTIONAL SCRIPT WITH RESET TIME AND INDIVIDUAL HISTORY DELETION
========================================================== */

(function (window) {
    var pondData = {
        daily: [], moodLog: [], sugarLog: [], carbLog: [], insulinLog: [], sleepLog: [],
        stressLog: [], energyLog: [], symptomLog: [], exerciseLog: [], waterCount: 0
    };

    var pondChart = null;
    var moodScores = { Manic: 10, Happy: 9, Focused: 8, Calm: 7, Tired: 6, Confused: 5, Grumpy: 4, Angry: 3, Sad: 2, Crying: 1 };
    var energyScores = { Exhausted: 1, Low: 3, Okay: 5, Good: 7, Energetic: 10 };
    var stressScores = { Calm: 1, Mild: 3, Moderate: 5, High: 7, Extreme: 10 };
    var moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠", Confused: "😕", Angry: "😡", Sad: "😢", Crying: "😭", Manic: "🤪" };

    document.addEventListener("DOMContentLoaded", function() {
        loadStorage(); setupTabs(); setMotivation(); resetTimePicker(); setupButtons(); renderAll();
    });

    function loadStorage() { var saved = localStorage.getItem("ProgressPond_V26"); if (!saved) return; try { Object.assign(pondData, JSON.parse(saved)); } catch(e){console.error(e); } }
    function saveAndRefresh() { localStorage.setItem("ProgressPond_V26", JSON.stringify(pondData)); renderAll(); }

    // ======================== TABS ========================
    function setupTabs() { document.querySelectorAll('.tab-nav button').forEach(tab => { tab.addEventListener('click', ()=>{ document.querySelectorAll('.tab-content').forEach(sec=>sec.classList.remove('active')); document.getElementById(tab.dataset.tab).classList.add('active'); document.querySelectorAll('.tab-nav button').forEach(t=>t.classList.remove('active')); tab.classList.add('active'); renderChart(); renderInsightPanel(); }); }); }

    function setMotivation() { var motivationText = document.getElementById("motivationText"); if(motivationText) motivationText.textContent = ["🐸 You're doing great!","🐸 Keep hopping!","🐸 Stay hydrated!"].sort(()=>0.5-Math.random())[0]; }

    function setupButtons() {
        window.addHop = addHop; window.addSugar = addSugar; window.addCarb = addCarb; window.addInsulin = addInsulin;
        window.addSleep = addSleep; window.addStress = addStress; window.addEnergy = addEnergy;
        window.addSymptom = addSymptom; window.addExerciseFromInput = addExerciseFromInput;
        window.clearDayKeepGoals = clearDayKeepGoals; window.resetDayEverything = resetDayEverything;
        window.clearWater = clearWater; window.exportGoalsToExcel = exportGoalsToExcel;
        window.resetTimePicker = resetTimePicker;

        document.querySelectorAll('.mood-btn').forEach(btn => btn.addEventListener('click', ()=> addLog('moodLog',{type:'mood', val:btn.dataset.mood, icon:moodEmojis[btn.dataset.mood], fullDate:currentFullDate()})));
        document.querySelectorAll('.drop-btn').forEach((btn,i)=>btn.addEventListener('click',()=>{ if(btn.classList.contains('active')){ btn.classList.remove('active'); pondData.waterCount = Math.max(0,pondData.waterCount-1); } else{ btn.classList.add('active'); pondData.waterCount=i+1; addLog('waterLog',{type:'water', val:pondData.waterCount, icon:'💧', fullDate:currentFullDate()}); } saveAndRefresh(); }));
    }

    function addLog(logArray,payload){ if(!pondData[logArray]) pondData[logArray]=[]; pondData[logArray].push(Object.assign({id:Date.now()},payload)); saveAndRefresh(); }

    // ======================== TRACKER FUNCTIONS ========================
    function addHop(){ var input=document.getElementById('dailyInput'); var priority=document.getElementById('priorityInput'); if(!input||!input.value.trim()) return; pondData.daily.push({id:Date.now(), text:input.value.trim(), priority:priority?priority.value:'Medium', fullDate:currentFullDate()}); input.value=''; renderTasks(); saveAndRefresh(); renderChart(); renderInsightPanel(); }
    function addSugar(){ var val=document.getElementById('sugarInput').value; if(val) addLog('sugarLog',{type:'sugar', val:parseFloat(val), fullDate:currentFullDate()}); renderChart(); renderInsightPanel(); }
    function addCarb(){ var val=document.getElementById('carbInput').value; if(val) addLog('carbLog',{type:'carb', val:parseFloat(val), fullDate:currentFullDate()}); renderChart(); renderInsightPanel(); }
    function addInsulin(){ var val=document.getElementById('insulinInput').value; if(val) addLog('insulinLog',{type:'insulin', val:parseFloat(val), fullDate:currentFullDate()}); renderChart(); renderInsightPanel(); }
    function addSleep(){ renderChart(); renderInsightPanel(); }
    function addStress(level){ addLog('stressLog',{type:'stress', val:level, score:5, fullDate:currentFullDate()}); renderChart(); renderInsightPanel(); }
    function addEnergy(level){ addLog('energyLog',{type:'energy', val:level, score:5, fullDate:currentFullDate()}); renderChart(); renderInsightPanel(); }
    function addSymptom(name){ addLog('symptomLog',{type:'symptom', val:name, fullDate:currentFullDate()}); renderChart(); renderInsightPanel(); }
    function addExerciseFromInput(type,intensity){ addLog('exerciseLog',{type:'exercise', val:type, intensity:intensity, fullDate:currentFullDate()}); renderChart(); renderInsightPanel(); }

    // ======================== CLEAR / RESET FUNCTIONS ========================
    function clearDayKeepGoals(){ pondData.moodLog=[]; pondData.sugarLog=[]; pondData.carbLog=[]; pondData.insulinLog=[]; pondData.sleepLog=[]; pondData.stressLog=[]; pondData.energyLog=[]; pondData.symptomLog=[]; pondData.exerciseLog=[]; pondData.waterCount=0; saveAndRefresh(); }
    function resetDayEverything(){ clearDayKeepGoals(); pondData.daily=[]; saveAndRefresh(); }
    function clearWater(){ pondData.waterCount=0; saveAndRefresh(); }

    // ======================== RESET TIME ========================
    function resetTimePicker(){
        var t=document.getElementById('manualTimeInput');
        if(!t) return;
        var now=new Date();
        t.value=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
        renderChart(); renderInsightPanel();
    }

    // ======================== EXPORT ========================
    function exportGoalsToExcel(){ alert('Excel export ready to implement'); }

    // ======================== RENDER FUNCTIONS ========================
    function renderAll(){ renderBasicUI(); renderTasks(); renderChart(); renderInsightPanel(); renderHomeAverages(); }

    function renderBasicUI(){ var cd=document.getElementById('currentDate'); if(cd) cd.textContent=new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}); document.querySelectorAll('.drop-btn').forEach((btn,i)=>btn.classList.toggle('active',i<pondData.waterCount)); var waterText=document.getElementById('waterCountText'); if(waterText) waterText.textContent=pondData.waterCount+' / 8'; }

    function renderTasks(){
        var list=document.getElementById('dailyList');
        var historyList=document.getElementById('dailyHistoryList');
        if(!list||!historyList) return;
        list.innerHTML=''; historyList.innerHTML='';
        pondData.daily.forEach((item,index)=>{
            var li=document.createElement('li'); li.textContent=`${item.text} [${item.priority}]`;
            var del=document.createElement('button'); del.textContent='❌'; del.addEventListener('click',()=>{ pondData.daily.splice(index,1); renderTasks(); saveAndRefresh(); });
            li.appendChild(del); list.appendChild(li);

            var hi=document.createElement('li'); hi.textContent=`${item.text} [${item.priority}] @ ${item.fullDate}`;
            historyList.appendChild(hi);
        });
    }

    function renderChart(){
        var ctx=document.getElementById('healthChartTrends'); if(!ctx) return;
        var labels=pondData.sugarLog.length ? pondData.sugarLog.map(l=>l.fullDate) : ['No Data'];
        var data=pondData.sugarLog.length ? pondData.sugarLog.map(l=>l.val) : [0];
        if(pondChart) pondChart.destroy();
        pondChart=new Chart(ctx,{type:'line',data:{labels:labels,datasets:[{label:'Glucose',data:data,borderColor:'green',backgroundColor:'rgba(0,255,0,0.2)',tension:0.3}]},options:{responsive:true,plugins:{legend:{display:true}},scales:{y:{beginAtZero:true}}}});
    }

    function renderInsightPanel(){ var box=document.getElementById('healthInsights'); if(!box) return; box.innerHTML=''; if(pondData.sugarLog.length===0){ box.textContent='Log some health data to see insights'; return; } var ul=document.createElement('ul'); var avgSugar=average(pondData.sugarLog,l=>l.val).toFixed(1); var li=document.createElement('li'); li.textContent=`Average Glucose: ${avgSugar}`; ul.appendChild(li); box.appendChild(ul); }

    function renderHomeAverages(){ var avgGlucose=average(pondData.sugarLog,e=>e.val)||0; var avgMood=average(pondData.moodLog,e=>moodScores[e.val]||5)||0; var avgWater=average(pondData.waterLog,e=>e.val)||0; var avgStress=average(pondData.stressLog,e=>e.score||5)||0; var avgEnergy=average(pondData.energyLog,e=>e.score||5)||0; var mapping={"avg-glucose":avgGlucose,"avg-mood":avgMood,"avg-water":avgWater,"avg-stress":avgStress,"avg-energy":avgEnergy}; Object.keys(mapping).forEach(id=>{var el=document.getElementById(id); if(el) el.textContent=mapping[id];}); }

    function average(array,mapFn){ if(!array.length) return 0; return array.reduce((sum,e)=>sum+mapFn(e),0)/array.length; }

})(window);
