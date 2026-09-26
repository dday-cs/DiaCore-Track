document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const get = key => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const set = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const now = new Date();
  $('currentDate').textContent = now.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
  const profile = JSON.parse(localStorage.getItem('userProfile') || 'null') || {};
  $('userName').textContent = (profile.name || 'there').trim().split(/\s+/)[0];
  $('sidebarName').textContent = profile.name || 'Your account';
  const initials = (profile.name || 'U').split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0]).join('').toUpperCase();
  $('userInitials').textContent = initials; $('topInitials').textContent = initials;

  const LOW = 3.9, HIGH = 10;
  const normalize = log => {
    const date = new Date(log.dateTime || log.timestamp || log.date);
    const value = Number(log.value ?? log.glucose ?? log.glucoseLevel);
    return Number.isFinite(value) && !Number.isNaN(date.getTime()) ? {...log, date, value} : null;
  };
  let chart;
  function updateGlucose() {
    const logs = get('glucoseLogs').map(normalize).filter(Boolean).sort((a,b)=>a.date-b.date);
    const start = new Date(now); start.setHours(0,0,0,0); start.setDate(start.getDate()-6);
    const week = logs.filter(x=>x.date>=start&&x.date<=now);
    const latest = logs.at(-1);
    if (latest) {
      $('latestReading').textContent = `${latest.value.toFixed(1)} mmol/L`;
      $('latestReadingTime').textContent = latest.date.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+' · '+latest.date.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
      $('latestContext').textContent = latest.context || 'Logged';
    }
    $('weekCount').textContent=String(week.length);
    $('chartEmpty').classList.toggle('visible',week.length===0);
    if(chart){chart.destroy();chart=null;}
    if(!week.length||!window.Chart){['avgGlucose','maxGlucose','minGlucose','maxDay','minDay'].forEach(id=>$(id).textContent='—');return;}
    const days=Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d;});
    const points=week.map(x=>({x:x.date.getTime(),y:x.value}));
    const ctx=$('glucoseChart').getContext('2d');const fill=ctx.createLinearGradient(0,0,0,210);fill.addColorStop(0,'rgba(49,139,105,.15)');fill.addColorStop(1,'rgba(49,139,105,0)');
    chart=new Chart(ctx,{type:'line',data:{datasets:[{data:points,borderColor:'#348d6c',backgroundColor:fill,fill:true,tension:.32,borderWidth:2,pointRadius:5,pointHoverRadius:7,pointBackgroundColor:p=>p.raw.y>HIGH?'#df8c71':p.raw.y<LOW?'#7199bd':'#348d6c',pointBorderColor:'#fff',pointBorderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,parsing:false,interaction:{intersect:false,mode:'nearest'},plugins:{legend:{display:false},tooltip:{displayColors:false,backgroundColor:'#253d32',padding:10,callbacks:{title:items=>new Date(items[0].parsed.x).toLocaleString('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}),label:item=>`${item.parsed.y.toFixed(1)} mmol/L${item.parsed.y>HIGH?' · above reference band':item.parsed.y<LOW?' · below reference band':''}`}}},scales:{x:{type:'linear',min:days[0].getTime(),max:new Date(days[6].getFullYear(),days[6].getMonth(),days[6].getDate(),23,59,59).getTime(),grid:{display:false},ticks:{stepSize:86400000,callback:v=>{const d=new Date(v);return d.getHours()===0?d.toLocaleDateString('en-US',{weekday:'short'}):''},color:'#9aa69f',font:{size:9},maxRotation:0},border:{display:false}},y:{suggestedMin:Math.max(0,Math.floor(Math.min(LOW,...week.map(x=>x.value))-1)),suggestedMax:Math.ceil(Math.max(HIGH,...week.map(x=>x.value))+1),grid:{color:'#eef2ef',drawTicks:false},ticks:{color:'#9aa69f',font:{size:9},padding:8},border:{display:false}}}},plugins:[{id:'referenceBand',beforeDatasetsDraw(c){if(!c.chartArea)return;const top=c.scales.y.getPixelForValue(HIGH),bottom=c.scales.y.getPixelForValue(LOW);c.ctx.save();c.ctx.fillStyle='rgba(225,241,231,.62)';c.ctx.fillRect(c.chartArea.left,top,c.chartArea.right-c.chartArea.left,bottom-top);c.ctx.restore();}}]});
    const avg=week.reduce((s,x)=>s+x.value,0)/week.length, high=week.reduce((a,b)=>a.value>b.value?a:b), low=week.reduce((a,b)=>a.value<b.value?a:b);
    $('avgGlucose').textContent=avg.toFixed(1)+' mmol/L';$('maxGlucose').textContent=high.value.toFixed(1)+' mmol/L';$('minGlucose').textContent=low.value.toFixed(1)+' mmol/L';
    $('maxDay').textContent=high.date.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});$('minDay').textContent=low.date.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  }
  function medicationDoses(){return get('medications').filter(m=>m.status==='active').flatMap(m=>(m.times?.length?m.times:[m.time]).filter(Boolean).map(time=>({time,name:m.name||'Medication',dosage:m.dosage||'',meal:m.mealTiming||m.notes||''}))).sort((a,b)=>a.time.localeCompare(b.time));}
  function updateReminders(){const box=$('reminderList');box.replaceChildren();const doses=medicationDoses();const upcoming=[...doses.filter(x=>x.time>=now.toTimeString().slice(0,5)),...doses.filter(x=>x.time<now.toTimeString().slice(0,5))].slice(0,3);if(!upcoming.length){const p=document.createElement('p');p.className='reminder-empty';p.textContent='No medication reminders scheduled. Add an active medicine to set dose times.';box.append(p);$('nextReminderTime').textContent='All clear';$('nextReminderTitle').textContent='No upcoming medicine';return;}upcoming.forEach((d,i)=>{const row=document.createElement('div');row.className='reminder-item';const time=document.createElement('span');time.className='reminder-time';time.textContent=new Date(`2000-01-01T${d.time}`).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});const mark=document.createElement('span');mark.className='reminder-mark med';mark.innerHTML='<i class="fa-solid fa-pills"></i>';const info=document.createElement('span');info.className='reminder-info';const title=document.createElement('strong');title.textContent=`Take ${d.name}`;const small=document.createElement('small');small.textContent=[d.dosage,d.meal].filter(Boolean).join(' · ')||'Medication dose';info.append(title,small);const tag=document.createElement('span');tag.className='reminder-status';tag.textContent=i?'TODAY':'NEXT';row.append(time,mark,info,tag);box.append(row);});$('nextReminderTime').textContent=new Date(`2000-01-01T${upcoming[0].time}`).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});$('nextReminderTitle').textContent=`Take ${upcoming[0].name}`;}
  function updateMedicationPreview(){const box=$('medicationList');box.replaceChildren();const meds=get('medications').filter(m=>m.status==='active');$('medicationCount').textContent=`${meds.length} active`;$('medicationHint').textContent=meds.length?'Current medicines':'Add medicines during setup or here';if(!meds.length){const p=document.createElement('p');p.className='med-empty';p.textContent='Your current medicines will appear here.';box.append(p);return;}meds.slice(0,4).forEach(m=>{const row=document.createElement('div');row.className='medication-item';const icon=document.createElement('span');icon.className='medication-symbol';icon.innerHTML='<i class="fa-solid fa-capsules"></i>';const details=document.createElement('span');details.className='medication-details';const name=document.createElement('strong');name.textContent=m.name||'Medicine';const dose=document.createElement('small');dose.textContent=m.dosage||'Dose not set';details.append(name,dose);const times=document.createElement('span');times.className='medication-clock';times.textContent=(m.times?.length?m.times:[m.time]).filter(Boolean).map(t=>new Date(`2000-01-01T${t}`).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})).join(', ')||'No time set';row.append(icon,details,times);box.append(row);});}

  const openReading=()=>{const value=$('readingWhen');value.value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);$('readingModal').showModal();};
  $('openReading').addEventListener('click',openReading);$('emptyLogReading').addEventListener('click',openReading);$('mobileLog').addEventListener('click',openReading);
  $('readingForm').addEventListener('submit',e=>{e.preventDefault();const date=new Date($('readingWhen').value),value=Number($('readingValue').value);if(!Number.isFinite(value)||value<=0||Number.isNaN(date.getTime()))return;const logs=get('glucoseLogs');logs.push({date:date.toISOString(),value,context:$('readingContext').value});set('glucoseLogs',logs);$('readingForm').reset();$('readingModal').close();updateGlucose();});
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
  updateGlucose();updateReminders();updateMedicationPreview();
});
