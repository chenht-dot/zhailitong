(function(){
  'use strict';

  const engine=globalThis.LiqiEngine;
  const dialog=document.querySelector('#annualReportDialog');
  if(!engine||!dialog)return;

  const preview=document.querySelector('#annualReportPreview');
  const closeButton=document.querySelector('#annualReportClose');
  const printButton=document.querySelector('#annualReportPrint');
  const includePersonal=document.querySelector('#annualReportIncludePersonal');
  const showBirthDate=document.querySelector('#annualReportShowBirthDate');
  const personalTypes=new Set(['lu','horse','peach','natalNoble']);
  const gridOrder=['巽宫','离宫','坤宫','震宫','中宫','兑宫','艮宫','坎宫','乾宫'];
  const state={input:null,result:null,data:null,html:''};

  function dateText(date){return engine.cnDate(date).replace(/\s+/g,' ').trim()}
  function rangeMarkup(start,end,separator='-'){return `<span class="report-date-range"><time>${dateText(start)}</time><i>${separator}</i><time>${dateText(new Date(end.getTime()-60000))}</time></span>`}
  function birthDateText(date){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'long',day:'numeric'}).format(date)}
  function statusClass(level){return level==='ok'?'ok':level==='paused'?'paused':level==='unavailable'?'muted':'critical'}
  function placeText(op){return op.unavailable?'本年无可用方位':`${op.palace} · ${engine.palaceShort[op.palace]}${op.mountain?' · '+op.mountain+'山':''}`}
  function operationKey(op){
    if(op.type==='wealth')return `wealth:${op.palace}`;
    if(op.type==='wenchang')return `wenchang:${op.title}`;
    if(['noble','natalNoble'].includes(op.type))return `${op.type}:${op.title}:${op.mountain||op.palace}`;
    return op.type;
  }
  function operationFamilyKey(op){return['noble','natalNoble'].includes(op.type)?op.type:operationKey(op)}
  function unavailableResult(){return{status:'本年未形成',level:'unavailable',reasons:['土曲星未与地三奇同宫'],warnings:[],resume:'下一立春后重新计算'}}

  function annualBoundaries(year){
    const start=engine.termDate(year,2),end=engine.termDate(year+1,2);
    const values=[start,end,engine.termDate(year,11),engine.termDate(year,22),engine.termDate(year,23),...engine.monthSegments(year).flatMap(month=>[month.start,month.end])];
    return [...new Map(values.filter(value=>value>=start&&value<=end).map(value=>[value.getTime(),value])).values()].sort((a,b)=>a-b);
  }

  function evaluatePeriod(input,start,end){
    const date=new Date(Math.min(start.getTime()+60000,end.getTime()-1));
    const year=engine.effectiveYear(date),house=engine.housePlate(input.sitting),relations=engine.houseRelations(house),annual=engine.annualPlate(year),month=engine.monthForDate(year,date),annualNoble=engine.annualNobleAt(year,date),yearTigers=engine.activeTigerMountains(year,date);
    const ctx={date,year,house,relations,annual,month,annualNoble,yearTigers};
    const personal=input.birthDate?engine.personalReport(input.birthDate,input.gender):null;
    const snapshots=engine.residentialOpportunities(ctx,personal).map(op=>{
      const result=op.unavailable?unavailableResult():engine.activationWindow(op,ctx);
      const reasons=(result.reasons||[]).map(reason=>{
        if(!op.mountain||!reason.includes(`年五虎落${op.mountain}山`))return reason;
        const currentHit=engine.yearTigerData(year).hits.some(hit=>hit.branch===op.mountain);
        const nextHit=engine.yearTigerData(year+1).hits.some(hit=>hit.branch===op.mountain);
        if(!currentHit&&nextHit&&date>=engine.termDate(year,22))return `${year+1}年五虎落${op.mountain}山，自${dateText(engine.termDate(year,22))}大雪起生效，天乙贵人不能化解`;
        return `${year}年五虎落${op.mountain}山，天乙贵人不能化解`;
      });
      return{
        key:operationKey(op),familyKey:operationFamilyKey(op),type:op.type,title:op.title,source:op.source,place:placeText(op),method:op.method,
        status:result.status,level:result.level,reasons,warnings:result.warnings||[]
      };
    });
    return{start,end,month,snapshots};
  }

  function snapshotSignature(snapshot){
    if(!snapshot)return 'missing';
    return JSON.stringify([snapshot.title,snapshot.place,snapshot.status,snapshot.level,snapshot.reasons,snapshot.warnings]);
  }

  function mergeProjectPeriods(periods,key){
    const merged=[];
    periods.forEach(period=>{
      const snapshot=period.snapshots.find(item=>item.key===key);
      if(!snapshot)return;
      const last=merged.at(-1);
      if(last&&last.end.getTime()===period.start.getTime()&&snapshotSignature(last.snapshot)===snapshotSignature(snapshot))last.end=period.end;
      else merged.push({start:period.start,end:period.end,snapshot});
    });
    return merged;
  }

  function buildAnnualData(input){
    const year=engine.effectiveYear(input.date),boundaries=annualBoundaries(year),periods=[];
    for(let index=0;index<boundaries.length-1;index++)periods.push(evaluatePeriod(input,boundaries[index],boundaries[index+1]));
    const keys=[];
    periods.forEach(period=>period.snapshots.forEach(snapshot=>{if(!keys.includes(snapshot.key))keys.push(snapshot.key)}));
    const totalDuration=boundaries.at(-1).getTime()-boundaries[0].getTime();
    const projects=keys.map(key=>{
      const item=periods.flatMap(period=>period.snapshots).find(snapshot=>snapshot.key===key),projectPeriods=mergeProjectPeriods(periods,key);
      const coverage=projectPeriods.reduce((sum,period)=>sum+period.end.getTime()-period.start.getTime(),0);
      return{key,type:item?.type,periods:projectPeriods,fullYear:coverage>=totalDuration-60000};
    });
    const months=engine.monthSegments(year).map(month=>{
      const overlapping=periods.filter(period=>period.start<month.end&&period.end>month.start);
      const monthKeys=[...new Set(overlapping.flatMap(period=>period.snapshots.map(item=>item.familyKey)))];
      let available=0,partial=0,blocked=0;
      monthKeys.forEach(key=>{
        const levels=overlapping.map(period=>period.snapshots.find(item=>item.familyKey===key)?.level).filter(Boolean);
        const hasAvailable=levels.includes('ok'),hasBlocked=levels.some(level=>level!=='ok');
        if(hasAvailable&&hasBlocked)partial++;
        else if(hasAvailable)available++;
        else blocked++;
      });
      return{...month,available,partial,blocked,hasBoundary:overlapping.length>1};
    });
    const personal=input.birthDate?engine.personalReport(input.birthDate,input.gender):null,sanshaChecks=engine.residentialSanshaAssessment(input,year,personal);
    return{input,year,start:boundaries[0],end:boundaries.at(-1),house:engine.housePlate(input.sitting),relations:engine.houseRelations(engine.housePlate(input.sitting)),projects,months,personal,sanshaChecks};
  }

  function projectSummary(project){
    const levels=project.periods.map(period=>period.snapshot.level);
    if(levels.every(level=>level==='unavailable'))return{label:'本年未形成',tone:'muted',collapse:true};
    if(levels.every(level=>level==='ok'))return{label:project.fullYear?'全年可用':'有效期内可用',tone:'ok',collapse:false};
    if(levels.includes('ok'))return{label:'分阶段使用',tone:'paused',collapse:false};
    return{label:project.fullYear?'全年禁催':'有效期内禁催',tone:'critical',collapse:true};
  }

  function houseGrid(data){
    return `<div class="report-house-grid">${gridOrder.map(palace=>{
      const relation=data.relations[palace],good=['财位','旺气'].includes(relation),danger=['煞气','内关煞'].includes(relation);
      return `<div class="report-house-cell ${palace==='中宫'?'center ':''}${good?'good':danger?'danger':''}"><small>${palace} · ${engine.palaceShort[palace]}</small><b>${data.house[palace]}</b><strong>${relation}</strong><span>${palace==='中宫'?'坐山卦入中':(engine.palaceMountains[palace]||[]).join('、')}</span></div>`;
    }).join('')}</div>`;
  }

  function reportSanshaGroups(check){
    if(!check.groups)return'';
    return `<div class="report-sansha-groups">${[['三煞',check.groups.sansha,'三煞山'],['向杀',check.groups.toward,'向杀山'],['夹杀',check.groups.jiasha,'夹杀山']].map(([label,mountains,type])=>`<span class="${check.hitType===type?'active':''}"><small>${label}</small><b>${mountains.join('、')}</b></span>`).join('')}</div>`;
  }

  function reportSanshaItem(check){
    const tone=check.hit===null?'unknown':check.hit?'risk':'clear',status=check.hit===null?'未判断':check.hitType||'三项均未犯';
    return `<div class="report-sansha-item ${tone}"><div><small>${check.label}</small><strong>${check.source}</strong></div><span>${status}</span>${reportSanshaGroups(check)}<p>${check.detail}</p></div>`;
  }

  function reportSanshaAudit(data){
    return `<div class="report-sansha-audit"><div class="report-sansha-heading"><div><small>坐山风险核对</small><strong>三煞、向杀与夹杀</strong></div><span>仅作风险提示</span></div><div class="report-sansha-list">${reportSanshaItem(data.sanshaChecks.natal)}${reportSanshaItem(data.sanshaChecks.annual)}</div><p class="report-sansha-note">此项不改变本报告现有催动项目的计算与判定。</p></div>`;
  }

  function projectRows(project){
    return project.periods.map(period=>{
      const snapshot=period.snapshot,details=[...snapshot.reasons,...snapshot.warnings];
      const status=snapshot.level==='ok'?'可催动':snapshot.status==='全年禁催'?'禁催':snapshot.status;
      return `<div class="report-period-row"><div class="report-period-date"><b>${rangeMarkup(period.start,period.end)}</b><span>${snapshot.title} · ${snapshot.place}</span></div><span class="report-status ${statusClass(snapshot.level)}">${status}</span><p>${details.length?details.join('；'):'已通过宅盘、流年与本阶段流月检查。'}</p></div>`;
    }).join('');
  }

  function collapsedProject(project,summary){
    const unique=items=>[...new Set(items.filter(Boolean))],first=project.periods[0].snapshot;
    const reasons=unique(project.periods.flatMap(period=>period.snapshot.reasons));
    const places=unique(project.periods.map(period=>period.snapshot.place));
    const ranges=[];
    project.periods.forEach(period=>{
      const last=ranges.at(-1);
      if(last&&last.end.getTime()===period.start.getTime())last.end=period.end;
      else ranges.push({start:period.start,end:period.end});
    });
    const activeRange=project.fullYear?'整个风水年度':ranges.map(period=>rangeMarkup(period.start,period.end)).join('、');
    return `<div class="report-project-verdict ${summary.tone}"><div><small>${project.fullYear?'结论':'适用时段'}</small><strong>${activeRange}</strong></div><div><small>方位</small><strong>${places.join('；')}</strong></div><p><b>判定依据</b>${reasons.length?reasons.join('；'):'本年未形成可用方位。'}</p></div><p class="report-method"><b>建议方式</b>${first.method}</p>`;
  }

  function reportMarkup(data,options){
    const projects=data.projects.filter(project=>options.includePersonal||!personalTypes.has(project.type));
    const summaries=projects.map(project=>({project,summary:projectSummary(project)}));
    const available=summaries.filter(item=>['ok','paused'].includes(item.summary.tone)).length;
    const blocked=summaries.length-available;
    const identity=data.personal
      ? `${data.personal.gz}年 · ${data.input.gender==='male'?'男':'女'}${options.showBirthDate?` · ${birthDateText(data.input.birthDate)}`:''}`
      : '未填写个人资料，报告不含个人方位';
    return `<article class="annual-report-document">
      <header class="report-cover">
        <div class="report-brand"><span aria-hidden="true"></span><b>宅理通</b><small>房屋布局指南</small></div>
        <div class="report-cover-title"><h1><span>${data.year}年房屋</span><span>布局指南</span></h1><p>${data.input.sitting}山${engine.oppositeMountain(data.input.sitting)}向 · ${engine.guaByNumber[data.house['中宫']]}宅</p></div>
        <dl class="report-meta">
          <div><dt>有效年度</dt><dd>${rangeMarkup(data.start,data.end,'至')}</dd></div>
          <div><dt>使用者资料</dt><dd>${identity}</dd></div>
          <div><dt>计算口径</dt><dd>立春换年，节气换月；规则切换点单独复算</dd></div>
        </dl>
        <div class="report-overview"><div><b>${projects.length}</b><span>催动项目</span></div><div><b>${available}</b><span>全年或分阶段可用</span></div><div><b>${blocked}</b><span>不可用／未形成</span></div></div>
      </header>

      <section class="report-section report-house-section">
        <div class="report-section-heading"><div><h2>固定宅盘</h2><p>坐山卦数 ${data.house['中宫']} 入中顺飞，宅盘资格是所有催动判断的第一层。</p></div><span>${data.input.sitting}山${engine.oppositeMountain(data.input.sitting)}向</span></div>
        ${houseGrid(data)}
        <p class="report-note">宅盘中的财位是屋宅固定财位；煞气与内关煞所在宫位不参与催动。</p>
        ${reportSanshaAudit(data)}
      </section>

      <section class="report-section report-calendar-section">
        <div class="report-section-heading"><div><h2>十二节气月总览</h2><p>“阶段切换”表示该月内因夏至、冬至、大雪等规则节点出现前后不同的判断。</p></div></div>
        <div class="report-month-table" role="table" aria-label="十二节气月催动总览">
          <div class="report-month-head" role="row"><span>节气月</span><span>有效日期</span><span>可用</span><span>阶段切换</span><span>暂停／禁催</span></div>
          ${data.months.map(month=>`<div class="report-month-row" role="row"><b>${month.name}<small>${month.stem}${month.branch}月</small></b><span>${rangeMarkup(month.start,month.end)}</span><em class="ok" data-label="可用">${month.available}</em><em class="paused" data-label="切换">${month.partial}</em><em class="critical" data-label="暂停">${month.blocked}</em></div>`).join('')}
        </div>
      </section>

      <section class="report-section report-project-section">
        <div class="report-section-heading"><div><h2>各项目年度详情</h2><p>每一段时间均复用当前住宅计算的宅盘、流年和流月判断。</p></div></div>
        <div class="report-project-list">
          ${summaries.map(({project,summary})=>{
            const first=project.periods[0].snapshot;
            const body=summary.collapse?collapsedProject(project,summary):`${projectRows(project)}<p class="report-method"><b>建议方式</b>${first.method}</p>`;
            return `<section class="report-project"><div class="report-project-head"><div><h3>${first.title}</h3><p>${first.source}</p></div><span class="report-status ${summary.tone}">${summary.label}</span></div>${body}</section>`;
          }).join('')}
        </div>
      </section>

      <section class="report-section report-caution-section">
        <div class="report-section-heading"><div><h2>使用前注意事项</h2><p>计算结果是布置前的筛选依据，不能替代现场测量与实际环境判断。</p></div></div>
        <ul><li>房屋坐向只能使用罗盘测量，不能用手机罗盘或普通指南针代替。</li><li>趋吉必先避凶；住宅缺陷未解决时，催吉效果可能无法成立。</li><li>天乙贵人不可化解五虎、五黄、外局冲煞及布局缺陷。</li><li>停止催动是关闭、遮盖或移走催动物，不等于不能正常经过该位置。</li><li>实际布置仍要核对缺角、门窗、走道、房间用途等现场条件。</li></ul>
      </section>

      <footer class="report-footer"><span>宅理通 · ${data.year}年房屋布局指南</span><span>生成于 ${birthDateText(new Date())}</span></footer>
    </article>`;
  }

  function renderPreview(){
    if(!state.data)return;
    const hasPersonal=Boolean(state.input.birthDate);
    includePersonal.disabled=!hasPersonal;
    if(!hasPersonal)includePersonal.checked=false;
    showBirthDate.disabled=!hasPersonal||!includePersonal.checked;
    if(showBirthDate.disabled)showBirthDate.checked=false;
    state.html=reportMarkup(state.data,{includePersonal:includePersonal.checked,showBirthDate:showBirthDate.checked});
    preview.innerHTML=state.html;
  }

  function openReport(){
    if(!state.input)document.querySelector('#residentialForm').requestSubmit();
    if(!state.input)return;
    printButton.disabled=true;
    printButton.textContent='正在整理年度数据…';
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
    requestAnimationFrame(()=>{
      state.data=buildAnnualData(state.input);
      renderPreview();
      printButton.disabled=false;
      printButton.textContent='打印／保存 PDF';
      preview.focus({preventScroll:true});
    });
  }

  function printReport(){
    if(!state.html)return;
    const printWindow=window.open('','_blank');
    if(!printWindow){
      printButton.textContent='浏览器阻止了打印窗口';
      setTimeout(()=>{printButton.textContent='打印／保存 PDF'},2200);
      return;
    }
    printWindow.opener=null;
    const stylesheet=new URL('annual-report.css',location.href).href;
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>宅理通-${state.data.year}年-${state.input.sitting}山房屋布局指南</title><link rel="stylesheet" href="${stylesheet}"></head><body class="report-print-document"><main class="annual-report-print">${state.html}</main></body></html>`);
    printWindow.document.close();
    printButton.disabled=true;
    printButton.textContent='正在打开打印预览…';
    const startPrint=()=>{
      printWindow.focus();
      printWindow.print();
      printButton.disabled=false;
      printButton.textContent='打印／保存 PDF';
    };
    if(printWindow.document.readyState==='complete')setTimeout(startPrint,250);
    else printWindow.addEventListener('load',()=>setTimeout(startPrint,250),{once:true});
  }

  document.addEventListener('residential:calculated',event=>{
    const hadPersonal=Boolean(state.input?.birthDate);
    state.input=event.detail.input;
    state.result=event.detail.result;
    state.data=null;
    if(state.input.birthDate&&!hadPersonal)includePersonal.checked=true;
  });
  document.querySelector('#residentialResults').addEventListener('click',event=>{
    if(event.target.closest('.annual-report-trigger'))openReport();
  });
  closeButton.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
  includePersonal.addEventListener('change',renderPreview);
  showBirthDate.addEventListener('change',renderPreview);
  printButton.addEventListener('click',printReport);
})();
