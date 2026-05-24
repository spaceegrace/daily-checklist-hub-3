(function(window){

var pondData={daily:[],moodLog:[],sugarLog:[],carbLog:[],insulinLog:[],sleepLog:[],stressLog:[],energyLog:[],symptomLog:[],exerciseLog:[],waterCount:0};
var pondChart=null;
var moodScores={Manic:10,Happy:9,Focused:8,Calm:7,Tired:6,Confused:5,Grumpy:4,Angry:3,Sad:2,Crying:1};

function saveAndRefresh(){localStorage.setItem('ProgressPond_V26',JSON.stringify(pondData)); renderAll();}

document.addEventListener('DOMContentLoaded',function(){
    loadStorage(); setupTabs(); setupButtons(); renderAll(); resetTimePicker();
});

function loadStorage(){var s=localStorage.getItem('ProgressPond_V26'); if(s) try{Object.assign(pondData,JSON.parse(s))}catch(e){console.error(e);}}

function setupTabs(){document.querySelectorAll('.tab-nav button').forEach(tab=>{
    tab.addEventListener('click',()=>{
        document.querySelectorAll('.tab-content').forEach(sec=>sec.classList.remove('active'));
        document.getElementById(tab.dataset.tab).classList.add('active');
        document.querySelectorAll('.tab-nav button').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        renderChart(); renderInsightPanel();
    });
});}

function setupButtons(){
    document.getElementById('addDailyBtn').addEventListener('click',addHop);
}

function addHop(){
    var input=document.getElementById('dailyInput');
    var priority=document.getElementById('priorityInput');
    if(!input||!input.value.trim()) return;
    pondData.daily.push({id:Date.now(),text:input.value.trim(),priority:priority.value,completed:false,fullDate:currentFullDate()});
    input.value=''; renderTasks(); saveAndRefresh();
}

function renderTasks(){
    var list=document.getElementById('dailyList');
    var completedList=document.getElementById('completedDailyList');
    if(!list||!completedList) return;
    list.innerHTML=''; completedList.innerHTML='';

    pondData.daily.forEach((item,index)=>{
        var li=document.createElement('li');
        li.textContent=`${item.text} [${item.priority}]`;
        if(item.completed) { li.classList.add('completed'); completedList.appendChild(li); }
        else list.appendChild(li);

        var btn=document.createElement('button');
        btn.textContent='✔'; btn.classList.add('check-complete');
        btn.addEventListener('click',()=>{item.completed=!item.completed; renderTasks(); saveAndRefresh();});
        li.appendChild(btn);

        var del=document.createElement('button'); del.textContent='❌';
        del.addEventListener('click',()=>{pondData.daily.splice(index,1); renderTasks(); saveAndRefresh();});
        li.appendChild(del);
    });
}

function currentFullDate(){
    var t=document.getElementById('manualTimeInput');
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

function renderAll(){renderTasks(); renderChart(); renderInsightPanel();}

function renderInsightPanel(){
    var box=document.getElementById('healthInsights'); if(!box) return;
    box.innerHTML='';
    if(!pondData.sugarLog.length){box.textContent='Log some health data to see insights'; return;}
    var ul=document.createElement('ul');
    var avg=pondData.sugarLog.reduce((a,b)=>a+b.val,0)/pondData.sugarLog.length;
    var li=document.createElement('li'); li.textContent=`Average Glucose: ${avg.toFixed(1)}`; ul.appendChild(li); box.appendChild(ul);
}

function resetTimePicker(){var t=document.getElementById('manualTimeInput'); if(t){var now=new Date(); t.value=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;}}

})(window);
