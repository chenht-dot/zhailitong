const stems=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const branches=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const palaces=['中宫','乾宫','兑宫','艮宫','离宫','坎宫','坤宫','震宫','巽宫'];
const gridOrder=['巽宫','离宫','坤宫','震宫','中宫','兑宫','艮宫','坎宫','乾宫'];
const palaceShort={'巽宫':'东南','离宫':'正南','坤宫':'西南','震宫':'正东','中宫':'中央','兑宫':'正西','艮宫':'东北','坎宫':'正北','乾宫':'西北'};
const guaByNumber={1:'坎',2:'坤',3:'震',4:'巽',6:'乾',7:'兑',8:'艮',9:'离'};
const elementByGua={'坎':'水','坤':'土','震':'木','巽':'木','乾':'金','兑':'金','艮':'土','离':'火'};
const starNames={1:'一白官星',2:'二黑病符星',3:'三碧蚩尤星',4:'四绿文昌星',5:'五黄关煞星',6:'六白财星',7:'七赤贼星',8:'八白运星',9:'九紫喜星'};
const starFunctions={1:'事业',2:'疾病',3:'冲动、纠纷、官司',4:'思维、学习',5:'意外、破财或血光',6:'财运',7:'财来财去、难以留财',8:'整体运势',9:'增强正面影响'};
const zodiac=['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const solarTermInfo=[0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758];
const monthNames=['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
function mod(n,m){return((n%m)+m)%m}
function digitalRoot(n){while(n>9)n=String(n).split('').reduce((a,b)=>a+Number(b),0);return n}
function reverseCountFromOne(n){return mod(10-n,9)+1}
function termDate(year,index){return new Date(31556925974.7*(year-1900)+solarTermInfo[index]*60000+Date.UTC(1900,0,6,2,5))}
function cnDate(d){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(d)}
function ganzhiYear(year){return stems[mod(year-4,10)]+branches[mod(year-4,12)]}
function effectiveYear(date){const y=Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Shanghai',year:'numeric'}).format(date));return date<termDate(y,2)?y-1:y}
function sexagenaryIndex(year){return mod(year-1984,60)}
function fly(values,reverse=false){const out={};palaces.forEach((p,i)=>out[p]=values[reverse?mod(-i,values.length):mod(i,values.length)]);return out}
function numberCycle(start){return Array.from({length:9},(_,i)=>mod(start-1+i,9)+1)}
function annualCenter(year){const s=digitalRoot([...String(year)].reduce((a,b)=>a+Number(b),0));return reverseCountFromOne(s)}
function annualPlate(year){return fly(numberCycle(annualCenter(year)))}
function gridHTML(plate,marks={},compact=false){return`<div class="luoshu ${compact?'compact':''}">${gridOrder.map(p=>{const v=plate[p];return`<div class="palace ${marks[v]||''}"><b>${v}</b><span>${starNames[v]}</span><small>${p.replace('宫','')} · ${palaceShort[p]}</small></div>`}).join('')}</div>`}
function yearStemBranch(year){return{stem:stems[mod(year-4,10)],branch:branches[mod(year-4,12)]}}
function monthCenterFirst(branch){const i=branches.indexOf(branch);if([0,3,6,9].includes(i))return 8;if([1,4,7,10].includes(i))return 5;return 2}
function firstMonthStem(yearStem){return{甲:'丙',己:'丙',乙:'戊',庚:'戊',丙:'庚',辛:'庚',丁:'壬',壬:'壬',戊:'甲',癸:'甲'}[yearStem]}
function monthBoundary(year,index){if(index<=10)return termDate(year,2+index*2);if(index===11)return termDate(year+1,0);return termDate(year+1,2)}
function monthSegments(year){const{stem,branch}=yearStemBranch(year),firstIdx=stems.indexOf(firstMonthStem(stem)),firstCenter=monthCenterFirst(branch);return monthNames.map((name,i)=>({name,branch:branches[mod(2+i,12)],stem:stems[mod(firstIdx+i,10)],start:monthBoundary(year,i),end:monthBoundary(year,i+1),center:mod(firstCenter-1-i,9)+1}))}
function activeMonth(year){const now=new Date();return monthSegments(year).findIndex(m=>now>=m.start&&now<m.end)}
function fiveTigerForStartStem(startStem){const start=stems.indexOf(startStem),hits=[];branches.slice(2).concat(branches.slice(0,2)).forEach((b,i)=>{const s=stems[mod(start+i,10)];if(s==='戊'||s==='己')hits.push({branch:b,stem:s})});return hits}
function branchPalace(branch){const i=branches.indexOf(branch);if([11,0,1].includes(i))return'坎宫';if([2,3,4].includes(i))return'震/巽宫';if([5,6,7].includes(i))return'离宫';return'兑/乾宫'}
function placeSequenceInPalaces(startValue,sequence,reverse=false){const start=sequence.indexOf(startValue),out={};palaces.forEach((p,i)=>out[p]=sequence[mod(start+(reverse?-i:i),sequence.length)]);return out}
function findPalace(map,value){return Object.keys(map).find(k=>map[k]===value)||'未找到'}
const nayin=['海中金','海中金','炉中火','炉中火','大林木','大林木','路旁土','路旁土','剑锋金','剑锋金','山头火','山头火','涧下水','涧下水','城头土','城头土','白蜡金','白蜡金','杨柳木','杨柳木','泉中水','泉中水','屋上土','屋上土','霹雳火','霹雳火','松柏木','松柏木','长流水','长流水','沙中金','沙中金','山下火','山下火','平地木','平地木','壁上土','壁上土','金箔金','金箔金','覆灯火','覆灯火','天河水','天河水','大驿土','大驿土','钗钏金','钗钏金','桑柘木','桑柘木','大溪水','大溪水','沙中土','沙中土','天上火','天上火','石榴木','石榴木','大海水','大海水'];
const lu={甲:'寅',乙:'卯',丙:'巳',戊:'巳',丁:'午',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
const noble={甲:['未','丑'],乙:['申','子'],丙:['酉','亥'],丁:['亥','酉'],戊:['丑','未'],己:['子','申'],庚:['丑','未'],辛:['寅','午'],壬:['卯','巳'],癸:['巳','卯']};
const annualWenchang={甲:'巳',乙:'子',丙:'申',丁:'卯',戊:'亥',己:'卯',庚:'亥',辛:'未',壬:'寅',癸:'酉'};
function groupResult(branch,type){const i=branches.indexOf(branch),water=[8,0,4],fire=[2,6,10],metal=[5,9,1],wood=[11,3,7];if(type==='horse'){if(water.includes(i))return'寅';if(fire.includes(i))return'申';if(metal.includes(i))return'亥';return'巳'}if(type==='peach'){if(water.includes(i))return'酉';if(fire.includes(i))return'卯';if(wood.includes(i))return'子';return'午'}if(type==='sansha'){if(water.includes(i))return['巳','午','未'];if(fire.includes(i))return['亥','子','丑'];if(metal.includes(i))return['寅','卯','辰'];return['申','酉','戌']}}
function mingGua(year,gender){const s=digitalRoot([...String(year)].reduce((a,b)=>a+Number(b),0));let n=gender==='male'?reverseCountFromOne(s):mod(s+3,9)+1;if(n===5)n=gender==='male'?2:8;return{number:n,gua:guaByNumber[n],element:elementByGua[guaByNumber[n]],group:[1,3,4,9].includes(n)?'东四命':'西四命'}}
function personalReport(date,gender){const year=effectiveYear(date),{stem,branch}=yearStemBranch(year),mg=mingGua(year,gender),ng=noble[stem],peach=groupResult(branch,'peach');return{year,gz:stem+branch,stem,branch,zodiac:zodiac[branches.indexOf(branch)],ming:mg,nayin:nayin[sexagenaryIndex(year)],sansha:groupResult(branch,'sansha'),lu:lu[stem],horse:groupResult(branch,'horse'),peach,biasedPeach:['子','午','卯','酉'].filter(x=>x!==peach),yangNoble:ng[0],yinNoble:ng[1]}}
function statDetail(title,value,summary,detail){return`<details class="stat stat-detail"><summary><small>${title}</small><b>${value}</b><em>${summary}</em><span>查看详情</span></summary><div class="stat-more">${detail}</div></details>`}
function renderPersonal(data){const cards=[statDetail('命卦',`${data.ming.gua}卦 · ${data.ming.number}`,data.ming.group,'<p>由规则年和性别计算，是个人方位判断的基础。应用到床位、书桌等位置时，还要结合房屋坐山、宅盘与流年。</p>'),statDetail('纳音',data.nayin,'出生年干支','<p>纳音取自出生规则年的干支组合，笔记中主要与一百二十分金配合细看健康影响；需要房屋坐山和分金资料。</p>'),statDetail('人命三煞',data.sansha.join('、')+'山','判断住宅时需结合坐山','<p>对应个人不宜久居的三个山位。它是住宅适配的一项条件，不能脱离宅盘单独判断整宅好坏。</p>'),statDetail('禄位',data.lu+'山','由出生年天干','<p>禄位侧重工作表现与稳定效率，适合各类工作者。实际使用前须避开住宅非位及当年不利飞星。</p>'),statDetail('马位',data.horse+'山','由出生年地支','<p>马位主走动、奔波和业务拓展，较适合销售、外勤等人群；领导者或需要稳定坐镇的人不宜只凭马位安排位置。</p>'),statDetail('桃花位',`正桃花 ${data.peach}山`,`偏桃花 ${data.biasedPeach.join('、')}山`,`<p><b>正桃花：</b>${data.peach}山，侧重正面人缘与合宜关系。</p><p><b>偏桃花：</b>${data.biasedPeach.join('、')}山，是子、午、卯、酉中除正桃花外的三山，可能带来不稳定或不合宜的关系。</p>`),statDetail('阳贵人',data.yangNoble+'山','冬至至夏至用事','<p>阳贵人用于冬至至夏至期间，取助力、人缘与贵人扶持之意。本身不具化煞作用，仍须避开非位和当年凶星。</p>'),statDetail('阴贵人',data.yinNoble+'山','夏至至冬至用事','<p>阴贵人用于夏至至冬至期间，取助力、人缘与贵人扶持之意。个人贵人位每半年切换，实际使用仍要核对宅盘及流年。</p>')];document.querySelector('#personalResults').innerHTML=`<div class="result-block result-hero"><div class="section-label">个人总览</div><h3>${data.gz} · ${data.ming.gua}命</h3><p>规则年 ${data.year} · 属${data.zodiac} · ${data.ming.element}卦 · ${data.ming.group}</p></div><div class="result-block"><div class="detail-hint">点击任一项目，可查看作用、用法与限制。</div><div class="stat-grid">${cards.join('')}</div><p class="rule-note">出生年以立春为界。个人固定方位应用到住宅时，还要与房屋坐山、宅盘、非位及流年吉凶叠加判断。</p></div>`}
function moduleHeader(title,desc,tag,body){return`<div class="module-title"><div><h3>${title}</h3><p>${desc}</p></div><span class="tag">${tag}</span></div>${body}`}
function renderAnnual(year){const plate=annualPlate(year),center=annualCenter(year);return moduleHeader(`${ganzhiYear(year)}流年九星盘`,'九颗飞星的名称、落宫与主要作用如下。',`${year} · ${center}入中`,`<div class="annual-layout">${gridHTML(plate,{2:'bad',3:'bad',5:'bad',7:'bad'})}<div class="star-directory">${Object.keys(starNames).map(n=>`<div class="star-item"><span>${n}</span><div><b>${starNames[n]}</b><small>${findPalace(plate,Number(n))} · ${palaceShort[findPalace(plate,Number(n))]}</small><em>${starFunctions[n]}</em></div></div>`).join('')}</div></div><p class="rule-note">年份数字求和后按男命卦同法取值年星，五入中时不寄卦；入中后按洛书顺飞。各星作用需结合具体房屋和同宫关系判断。</p>`)}
function renderMonths(year,mode){const months=monthSegments(year),active=activeMonth(year);if(mode==='monthly')return moduleHeader(`${ganzhiYear(year)}全年流月盘`,'从立春到下一年立春，完整列出十二个节气月及月盘。',`${year}年`,`<div class="month-cards month-plates">${months.map((m,i)=>{const plate=fly(numberCycle(m.center));return`<article class="month-card ${i===active?'current':''}"><div class="month-card-head"><div><h4>${m.name} · ${m.stem}${m.branch}</h4><p>${cnDate(m.start)} — ${cnDate(m.end)}</p></div>${i===active?'<span class="now-label">当前月</span>':''}</div>${gridHTML(plate,{2:'bad',3:'bad',5:'bad',7:'bad'},true)}<strong>值月星：${starNames[m.center]} · ${m.center}入中</strong></article>`}).join('')}</div><p class="rule-note">正月值月星由年支分组确定，之后每月递减一位，遇零取九。月份以节气划分。</p>`);return moduleHeader(`${ganzhiYear(year)}全年月五虎`,'一次列出十二个月，并分别标明戊、己所到山位。',`${year}年`,`<div class="table-wrap"><table class="year-table"><thead><tr><th>月份</th><th>月干支</th><th>有效时间</th><th>戊所在山</th><th>己所在山</th><th>本月五虎山位</th></tr></thead><tbody>${months.map((m,i)=>{const hits=fiveTigerForStartStem(m.stem),wu=hits.filter(h=>h.stem==='戊').map(h=>h.branch),ji=hits.filter(h=>h.stem==='己').map(h=>h.branch);return`<tr class="${i===active?'current':''}"><td>${m.name}${i===active?' · 当前':''}</td><td>${m.stem}${m.branch}</td><td>${cnDate(m.start)} — ${cnDate(m.end)}</td><td>${wu.join('、')}</td><td>${ji.join('、')}</td><td>${hits.map(h=>`${h.branch}（${h.stem}）`).join('、')}</td></tr>`}).join('')}</tbody></table></div><div class="function-box"><h4>作用与禁忌</h4><p>月五虎是年五虎杀的减弱版，发凶条件相同但程度较轻。月五虎所在山位不可催动；无论催财、文昌、桃花、禄马、利名或贵人，重合时当月一律暂停。</p></div><p class="rule-note">以当月天干从寅位起布十天干，戊、己落到的地支即为当月五虎杀。</p>`)}
function yearTigerData(year){const{stem}=yearStemBranch(year),startStem=firstMonthStem(stem);return{year,gz:ganzhiYear(year),startStem,hits:fiveTigerForStartStem(startStem),start:termDate(year-1,22),end:termDate(year+1,2)}}
function tigerSetHTML(d,label){return`<article class="tiger-set"><div class="tiger-set-head"><div><small>${label}</small><h4>${d.year} · ${d.gz}年</h4></div><span>正月${d.startStem}寅起</span></div><div class="mountain-row">${d.hits.map(h=>`<span class="mountain">${h.branch}<small>${h.stem}</small></span>`).join('')}</div><p>有效期：${cnDate(d.start)} — ${cnDate(d.end)}</p></article>`}
function renderYearTiger(year){const current=yearTigerData(year),next=yearTigerData(year+1);return moduleHeader(`${ganzhiYear(year)}年五虎杀`,'分别显示当年与第二年的五虎杀及各自有效期。','大雪至立春双存',`<div class="tiger-grid">${tigerSetHTML(current,'当年五虎杀')}${tigerSetHTML(next,'第二年五虎杀')}</div><div class="overlap-note"><b>两年同时存在：</b>${cnDate(termDate(year,22))}（${year}年大雪）至 ${cnDate(termDate(year+1,2))}（${year+1}年立春）。</div><div class="function-box"><h4>作用与禁忌</h4><p>五虎杀又称五方杀，古称“都天戊己杀”，笔记将其列为比五黄更凶险的煞气。所在方位不可催动，催财时必须避开。</p><p>动宅只在第一太极论断；静宅只在第一太极和外局论断。</p></div><p class="rule-note">每组年五虎从上一年大雪提前出现，持续至下一年立春，因此查询年大雪之后会叠加第二年的五虎杀。</p>`)}
function renderEarth(year){const{branch}=yearStemBranch(year),opp=branches[mod(branches.indexOf(branch)+6,12)],ss=groupResult(branch,'sansha'),toward=ss.map(b=>branches[mod(branches.indexOf(b)+6,12)]);return moduleHeader(`${ganzhiYear(year)}太岁、岁破与年三煞`,'这里计算通用山位；判断住宅是否犯煞仍需坐山。',`${year}年`,`<div class="detail-list"><div class="detail-item"><small>太岁</small><b>${branch}山</b></div><div class="detail-item"><small>岁破</small><b>${opp}山</b></div><div class="detail-item"><small>三煞山</small><b>${ss.join('、')}</b></div><div class="detail-item"><small>向煞</small><b>${toward.join('、')}</b></div></div><p class="rule-note">夹煞位于三煞地支之间所夹的天干山，具体罗盘标注在完整二十四山视图中呈现。</p>`)}
function renderHidden(year){const months=monthSegments(year),active=activeMonth(year);return moduleHeader(`${ganzhiYear(year)}全年暗建杀`,'由每月值月星返回洛书原位确定。',`${year}年`,`<div class="table-wrap"><table class="year-table"><thead><tr><th>月份</th><th>月干支</th><th>值月星</th><th>暗建杀</th></tr></thead><tbody>${months.map((m,i)=>`<tr class="${i===active?'current':''}"><td>${m.name}</td><td>${m.stem}${m.branch}</td><td>${m.center} 入中</td><td>${m.center===5?'无':guaByNumber[m.center]+'宫'}</td></tr>`).join('')}</tbody></table></div><div class="function-box"><h4>作用与禁忌</h4><p>暗建杀是随月份变动的月杀。暗建杀所在卦位当月严禁动土；值月飞星五居中宫时，该月没有暗建杀。</p></div><p class="rule-note">其余月份取值月星在洛书中的原始宫位，作为当月暗建杀所在卦位。</p>`)}
function renderNoble(year){const{stem,branch}=yearStemBranch(year),[yang,yin]=noble[stem],forward=placeSequenceInPalaces(branch,branches),reverse=placeSequenceInPalaces(branch,branches,true),yp=findPalace(forward,yang),ip=findPalace(reverse,yin);return moduleHeader(`${ganzhiYear(year)}天乙贵人`,'阳贵顺飞、阴贵逆飞；用事切换点为冬至和夏至。',`${stem}年`,`<div class="detail-list"><div class="detail-item"><small>阳贵人</small><b>${yang} · ${yp}</b></div><div class="detail-item"><small>阴贵人</small><b>${yin} · ${ip}</b></div><div class="detail-item"><small>阳贵用事</small><b>上一年冬至至本年夏至</b></div><div class="detail-item"><small>阴贵用事</small><b>本年夏至至本年冬至</b></div></div><div class="function-box"><h4>作用与使用</h4><p>天乙贵人所到之处，除五黄及含五黄的组合外，其余凶星、五虎和同宫问题均可化解。五黄力量强，不能由天乙贵人化解。</p><p>除解煞外，贵人位也可用于财运、事业和贵人助力。冬至至夏至取阳贵人，夏至至冬至取阴贵人；另一位在非用事时段属于减力贵人。</p></div><p class="rule-note">若贵人地支本身所在的二十四山与飞布后的卦宫一致，笔记称为“还家贵人”。</p>`)}
function renderWenchang(year){const{stem,branch}=yearStemBranch(year),target=annualWenchang[stem],p=findPalace(placeSequenceInPalaces(branch,branches),target),four=findPalace(annualPlate(year),4),usable=p!=='中宫';return moduleHeader(`${ganzhiYear(year)}流年文昌`,'流年文昌采用独立公式，与流年九星盘中的四绿文昌星不是同一项。',`${stem} → ${target}`,`<div class="compare-grid"><article class="compare-card emphasis"><small>流年文昌</small><h4>${usable?p+' · '+palaceShort[p]:'中宫，本年无可用方位'}</h4><p>先查年干对应的文昌地支 ${target}，再把年支 ${branch} 入中顺飞，取 ${target} 所到宫位。</p></article><article class="compare-card"><small>流年盘四绿文昌星</small><h4>${four} · ${palaceShort[four]}</h4><p>四绿的位置直接从流年九星盘读取，计算路径不同，所以两者可能落在不同宫位。</p></article></div><div class="function-box"><h4>作用与使用</h4><p>流年文昌用于加强活跃思考、学习考试和知识工作的效率，适合学生，以及写作、新闻、刑侦等需要持续动脑的人。方位只在所查询的流年内使用；若飞入中宫，该年没有可用的流年文昌方位。</p><p>按笔记中的选用次序：流年文昌优先于四绿文昌星，四绿文昌星再优先于屋宅文昌；实际布置仍须避开宅盘与流年中的不利因素。</p></div>`)}
function renderFame(year){const{stem,branch}=yearStemBranch(year),earthBranch=branches[mod(branches.indexOf(branch)+3,12)],earthPalace=branchExactPalace(earthBranch),stemMap=placeSequenceInPalaces(stem,stems),three={壬:findPalace(stemMap,'壬'),癸:findPalace(stemMap,'癸'),辛:findPalace(stemMap,'辛')},match=Object.entries(three).find(([,p])=>p===earthPalace);return moduleHeader(`${ganzhiYear(year)}利名星`,'土曲星与地三奇同宫时，该宫才形成利名星。',match?'本年形成':'本年未形成',`<div class="detail-list"><div class="detail-item"><small>土曲星</small><b>${earthBranch}山 · ${earthPalace}</b></div><div class="detail-item"><small>地三奇</small><b>壬 ${three.壬} · 癸 ${three.癸} · 辛 ${three.辛}</b></div><div class="detail-item"><small>计算结论</small><b>${match?match[1]+'为利名星':'土曲星未与地三奇重合'}</b></div></div><div class="function-box"><h4>作用与使用</h4><p>利名星适合短期冲刺，可提升考试、面试或关键场合的临场应变能力，也有助于职场表现和升职。找到方位后，可在该方位工作或学习以获得增益，只在第一空间使用。</p><p>长期备考和持续学习仍以文昌位为主；利名星侧重临近考试或重要表现期的短期使用。</p></div><p class="rule-note">十二建除从年支起“建”顺排，找到“平”为土曲星；再将年干入中顺飞，查壬、癸、辛三奇是否重合。</p>`)}

const mountainOrder=['子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙','午','丁','未','坤','申','庚','酉','辛','戌','乾','亥','壬'];
const palaceMountains={坎宫:['壬','子','癸'],艮宫:['丑','艮','寅'],震宫:['甲','卯','乙'],巽宫:['辰','巽','巳'],离宫:['丙','午','丁'],坤宫:['未','坤','申'],兑宫:['庚','酉','辛'],乾宫:['戌','乾','亥']};
const palaceByMountain=Object.fromEntries(Object.entries(palaceMountains).flatMap(([p,ms])=>ms.map(m=>[m,p])));
const palaceNumber={坎宫:1,坤宫:2,震宫:3,巽宫:4,乾宫:6,兑宫:7,艮宫:8,离宫:9};
const numberElement={1:'水',2:'土',3:'木',4:'木',5:'土',6:'金',7:'金',8:'土',9:'火'};
const generates={水:'木',木:'火',火:'土',土:'金',金:'水'};
const controls={水:'火',火:'金',金:'木',木:'土',土:'水'};
const badStars=[2,3,5,7];
const absolutePairs=['2-5','3-8','6-7','6-9','7-9'];

function oppositeMountain(m){return mountainOrder[mod(mountainOrder.indexOf(m)+12,24)]}
function housePlate(sitting){return fly(numberCycle(palaceNumber[palaceByMountain[sitting]]))}
function houseRelation(center,number){
  if(number===5)return'内关煞';
  const c=numberElement[center],p=numberElement[number];
  if(generates[p]===c)return'财位';
  if(p===c)return'旺气';
  if(generates[c]===p)return'退气';
  if(controls[p]===c)return'煞气';
  if(controls[c]===p)return'死气';
  return'待定';
}
function houseRelations(plate){const out={};Object.entries(plate).forEach(([p,n])=>out[p]=houseRelation(plate['中宫'],n));return out}
function pairKey(a,b){return[a,b].sort((x,y)=>x-y).join('-')}
function pairDanger(a,b){return absolutePairs.includes(pairKey(a,b))}
function branchExactPalace(branch){return palaceByMountain[branch]||'中宫'}
function famePosition(year){
  const{stem,branch}=yearStemBranch(year),earthBranch=branches[mod(branches.indexOf(branch)+3,12)],earthPalace=branchExactPalace(earthBranch),stemMap=placeSequenceInPalaces(stem,stems);
  return Object.entries({壬:findPalace(stemMap,'壬'),癸:findPalace(stemMap,'癸'),辛:findPalace(stemMap,'辛')}).find(([,p])=>p===earthPalace)||null;
}
function annualNobleAt(year,date){
  let useYear=year,kind='阳';
  const summer=termDate(year,11),winter=termDate(year,23);
  if(date>=winter){useYear=year+1;kind='阳'}else if(date>=summer)kind='阴';
  const{stem,branch}=yearStemBranch(useYear),[yang,yin]=noble[stem],target=kind==='阳'?yang:yin,map=kind==='阳'?placeSequenceInPalaces(branch,branches):placeSequenceInPalaces(branch,branches,true);
  return{year:useYear,kind,target,palace:findPalace(map,target)};
}
function activeTigerMountains(year,date){
  const sets=[yearTigerData(year)];
  if(date>=termDate(year,22))sets.push(yearTigerData(year+1));
  return[...new Set(sets.flatMap(s=>s.hits.map(h=>h.branch)))];
}
function monthForDate(year,date){return monthSegments(year).find(m=>date>=m.start&&date<m.end)||monthSegments(year)[0]}
function monthsFromDate(year,date){return monthSegments(year).filter(m=>m.end>date)}
function natalNobleAt(data,date){const y=date.getUTCFullYear(),summer=termDate(y,11),winter=termDate(y,23),kind=(date>=summer&&date<winter)?'阴':'阳',mountain=kind==='阳'?data.yangNoble:data.yinNoble;return{kind,mountain,palace:branchExactPalace(mountain)}}
function residentialAnnualBase(op,ctx){
  const houseNumber=ctx.house[op.palace],annualStar=ctx.annual[op.palace],reasons=[],warnings=[];
  const nobleHere=ctx.annualNoble.palace===op.palace;
  let blocked=false,level='blocked';
  if(['煞气','死气','内关煞'].includes(ctx.relations[op.palace])&&op.type!=='wealth'){
    if(nobleHere)warnings.push(`宅盘${ctx.relations[op.palace]}由天乙贵人同宫化解`);
    else{blocked=true;reasons.push(`宅盘为${ctx.relations[op.palace]}，个人或流年用途不能在此催动`)}
  }
  if(pairDanger(houseNumber,annualStar)){
    if(nobleHere&&!pairKey(houseNumber,annualStar).split('-').includes('5'))warnings.push(`宅盘 ${houseNumber} 与流年 ${annualStar} 的同宫问题由天乙贵人化解`);
    else{blocked=true;reasons.push(`宅盘 ${houseNumber} 与流年 ${annualStar} 形成禁催同宫组合`)}
  }
  if(annualStar===5){blocked=true;level='critical';reasons.push('流年五黄到宫，天乙贵人不能化解')}
  else if([2,3,7].includes(annualStar)){
    if(nobleHere)warnings.push(`流年${starNames[annualStar]}由${ctx.annualNoble.year}年${ctx.annualNoble.kind}贵人同宫化解`);
    else{blocked=true;reasons.push(`流年${starNames[annualStar]}到宫，全年不催动`)}
  }
  if(houseNumber===annualStar&&(annualStar===3||annualStar===7)){
    if(nobleHere)warnings.push(`宅盘与流年${annualStar}伏吟，由天乙贵人同宫化解`);
    else{blocked=true;reasons.push(`宅盘与流年${annualStar}伏吟，凶性加强`)}
  }
  if(op.mountain&&ctx.yearTigers.includes(op.mountain)){
    if(nobleHere)warnings.push(`年五虎落${op.mountain}山，由天乙贵人同宫化解`);
    else{blocked=true;reasons.push(`年五虎落${op.mountain}山，不可催动`)}
  }
  const palaceTiger=palaceMountains[op.palace]?.filter(m=>ctx.yearTigers.includes(m))||[];
  if(!op.mountain&&palaceTiger.length)warnings.push(nobleHere?`本宫年五虎所在的${palaceTiger.join('、')}山由天乙贵人化解`:`本宫须避开年五虎所在的${palaceTiger.join('、')}山`);
  if(!blocked&&[1,6,8].includes(annualStar))warnings.push(`流年${starNames[annualStar]}到宫，作为加分项`);
  return{blocked,level,reasons,warnings,houseNumber,annualStar};
}
function residentialMonthBase(op,ctx,month){
  const plate=fly(numberCycle(month.center)),monthStar=plate[op.palace],houseNumber=ctx.house[op.palace],annualStar=ctx.annual[op.palace],reasons=[],warnings=[];
  const nobleHere=ctx.annualNoble.palace===op.palace;
  let blocked=false,level='paused';
  if(monthStar===5){
    blocked=true;reasons.push(`流月${starNames[monthStar]}到宫，本月所有催动暂停`);
    level='critical';
  }else if([2,3,7].includes(monthStar)){
    if(nobleHere)warnings.push(`流月${starNames[monthStar]}由天乙贵人同宫化解`);
    else{blocked=true;reasons.push(`流月${starNames[monthStar]}到宫，本月所有催动暂停`)}
  }
  if(pairDanger(houseNumber,monthStar)){
    if(nobleHere&&!pairKey(houseNumber,monthStar).split('-').includes('5'))warnings.push(`宅盘 ${houseNumber} 与流月 ${monthStar} 的同宫问题由天乙贵人化解`);
    else{blocked=true;reasons.push(`宅盘 ${houseNumber} 与流月 ${monthStar} 形成禁催同宫组合`)}
  }
  if(pairDanger(annualStar,monthStar)){
    if(nobleHere&&!pairKey(annualStar,monthStar).split('-').includes('5'))warnings.push(`流年 ${annualStar} 与流月 ${monthStar} 的同宫问题由天乙贵人化解`);
    else{blocked=true;reasons.push(`流年 ${annualStar} 与流月 ${monthStar} 形成禁催同宫组合`)}
  }
  const monthTigers=fiveTigerForStartStem(month.stem).map(h=>h.branch);
  if(op.mountain&&monthTigers.includes(op.mountain)){
    if(nobleHere)warnings.push(`月五虎落${op.mountain}山，由天乙贵人同宫化解`);
    else{blocked=true;reasons.push(`月五虎落${op.mountain}山，本月暂停催动`)}
  }
  const palaceTiger=palaceMountains[op.palace]?.filter(m=>monthTigers.includes(m))||[];
  if(!op.mountain&&palaceTiger.length)warnings.push(nobleHere?`本月五虎所在的${palaceTiger.join('、')}山由天乙贵人化解`:`本月须避开月五虎所在的${palaceTiger.join('、')}山`);
  return{blocked,level,reasons,warnings,monthStar,plate,monthTigers};
}
function activationWindow(op,ctx){
  const annual=residentialAnnualBase(op,ctx),current=ctx.month,currentCheck=residentialMonthBase(op,ctx,current);
  if(annual.blocked)return{status:'全年禁催',level:annual.level,reasons:annual.reasons,warnings:annual.warnings,start:null,stop:termDate(ctx.year+1,2),resume:'下一立春后重新计算',annual,current:currentCheck};
  if(currentCheck.blocked)return{status:currentCheck.level==='critical'?'重点警示':'本月暂停',level:currentCheck.level,reasons:currentCheck.reasons,warnings:[...annual.warnings,...currentCheck.warnings],start:current.start,stop:current.end,resume:`${cnDate(current.end)}交节后重新检查`,annual,current:currentCheck};
  let nextBlock=null;
  for(const m of monthsFromDate(ctx.year,ctx.date)){
    if(m===current)continue;
    const check=residentialMonthBase(op,ctx,m);
    if(check.blocked){nextBlock={month:m,check};break}
  }
  const stop=nextBlock?nextBlock.month.start:termDate(ctx.year+1,2);
  const resume=nextBlock?`${cnDate(nextBlock.month.end)}交节后重新检查`:'下一立春重新排盘';
  return{status:'当前可催动',level:'ok',reasons:[],warnings:[...annual.warnings,...currentCheck.warnings],start:ctx.date,stop,resume,stopReason:nextBlock?nextBlock.check.reasons[0]:'流年切换',annual,current:currentCheck};
}
function houseGridHTML(plate,relations){
  return`<div class="house-grid">${gridOrder.map(p=>`<div class="house-palace relation-${relations[p]}"><small>${p} · ${palaceShort[p]}</small><b>${plate[p]}</b><strong>${relations[p]}</strong>${p==='中宫'?'<em>坐山卦入中</em>':`<em>${(palaceMountains[p]||[]).join('、')}</em>`}</div>`).join('')}</div>`;
}
function residentialOpportunities(ctx,personal){
  const ops=[];
  const yearText=`${ctx.year} · ${ganzhiYear(ctx.year)}年`;
  Object.keys(ctx.relations).filter(p=>p!=='中宫'&&ctx.relations[p]==='财位').forEach(p=>ops.push({type:'wealth',title:'催财',source:'宅盘财位',palace:p,method:'可按现场条件选用鱼缸或合规植物；流年财星只作加分。'}));
  const{stem,branch}=yearStemBranch(ctx.year),wen=annualWenchang[stem],wenPalace=findPalace(placeSequenceInPalaces(branch,branches),wen);
  if(wenPalace!=='中宫')ops.push({type:'wenchang',title:'流年文昌',source:`${yearText}文昌${wen}`,palace:wenPalace,method:'适合安放书桌、学习或持续脑力工作，也可按文昌规则使用植物。'});
  const fourPalace=findPalace(ctx.annual,4);
  if(fourPalace!=='中宫')ops.push({type:'wenchang',title:'四绿文昌星',source:`${yearText}流年九星`,palace:fourPalace,method:'作为文昌辅助位置，适合学习与知识工作。'});
  const fame=famePosition(ctx.year);
  if(fame&&fame[1]!=='中宫')ops.push({type:'fame',title:'利名星',source:`${yearText} · 地三奇${fame[0]}与土曲星同宫`,palace:fame[1],method:'适合考试、面试、晋升前的短期工作或学习。'});
  else ops.push({type:'fame',title:'利名星',source:`${yearText}计算结果`,unavailable:true,method:'土曲星未与地三奇同宫，本年没有可用的利名星方位。'});
  if(ctx.annualNoble.palace!=='中宫')ops.push({type:'noble',title:`流年${ctx.annualNoble.kind}贵人`,source:`${ctx.annualNoble.year} · ${ganzhiYear(ctx.annualNoble.year)}年天乙贵人`,palace:ctx.annualNoble.palace,method:'适合工作、会客、求助力；除五黄外，其余凶星与煞均可化解。'});
  if(personal){
    const birthYearText=`${personal.year} · ${personal.gz}年`;
    ops.push({type:'lu',title:'禄位',source:`${birthYearText}出生年天干`,palace:branchExactPalace(personal.lu),mountain:personal.lu,method:'适合安放办公桌，提升稳定工作效率。'});
    ops.push({type:'horse',title:'马位',source:`${birthYearText}出生年地支`,palace:branchExactPalace(personal.horse),mountain:personal.horse,method:'适合销售、业务及外勤人员使用；管理者不宜只凭马位布置。'});
    ops.push({type:'peach',title:'正桃花',source:`${birthYearText}出生年地支`,palace:branchExactPalace(personal.peach),mountain:personal.peach,method:'只使用正桃花山位，按桃花植物规则催动。'});
    const nn=natalNobleAt(personal,ctx.date);
    ops.push({type:'natalNoble',title:`个人${nn.kind}贵人`,source:`${birthYearText}出生年天干`,palace:nn.palace,mountain:nn.mountain,method:'适合工作、会客和寻求助力，本身没有化煞能力。'});
  }
  return ops;
}
function activationCard(op,result){
  const place=op.unavailable?'本年无可用方位':`${op.palace} · ${palaceShort[op.palace]}${op.mountain?' · '+op.mountain+'山':''}`,badgeClass=result.level==='ok'?'ok':result.level==='critical'?'critical':'paused';
  const reason=result.reasons.length?result.reasons.join('；'):'已通过宅盘、流年和当前流月检查';
  const time=result.level==='ok'?`<b>可开始</b><span>${cnDate(result.start)}</span><b>预计停止</b><span>${cnDate(result.stop)} · ${result.stopReason}</span>`:result.level==='unavailable'?`<b>重新计算</b><span>${result.resume}</span>`:result.status==='全年禁催'?`<b>禁催至</b><span>${cnDate(result.stop)}前，届时重新排盘</span>`:`<b>暂停区间</b><span>${cnDate(result.start)} — ${cnDate(result.stop)}</span><b>恢复</b><span>${result.resume}</span>`;
  return`<article class="activation-card ${badgeClass}"><div class="activation-head"><div><small>${op.source}</small><h4>${op.title}</h4><p>${place}</p></div><span>${result.status}</span></div><div class="activation-reason ${result.level==='critical'?'critical-copy':''}">${reason}</div>${result.warnings.length?`<ul>${result.warnings.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}<p class="activation-method"><b>建议方式：</b>${op.method}</p><div class="activation-time">${time}</div></article>`;
}
function renderResidential(input){
  const date=input.date,year=effectiveYear(date),house=housePlate(input.sitting),relations=houseRelations(house),annual=annualPlate(year),month=monthForDate(year,date),annualNoble=annualNobleAt(year,date),yearTigers=activeTigerMountains(year,date),ctx={date,year,house,relations,annual,month,annualNoble,yearTigers};
  const personal=input.birthDate?personalReport(input.birthDate,input.gender):null,ops=residentialOpportunities(ctx,personal),results=ops.map(op=>({op,result:op.unavailable?{status:'本年未形成',level:'unavailable',reasons:['土曲星未与地三奇同宫'],warnings:[],resume:'下一立春后重新计算'}:activationWindow(op,ctx)})),counts={ok:results.filter(x=>x.result.level==='ok').length,paused:results.filter(x=>x.result.level==='paused').length,critical:results.filter(x=>['critical','blocked','unavailable'].includes(x.result.level)).length};
  document.querySelector('#residentialResults').innerHTML=`<div class="result-block house-summary"><div><div class="section-label">住宅总览</div><h3>${input.sitting}山${oppositeMountain(input.sitting)}向 · ${guaByNumber[house['中宫']]}宅</h3><p>${year} · ${ganzhiYear(year)}年 · ${month.name}${month.stem}${month.branch}月 · 先看年盘，再看月盘</p></div><div class="summary-counts"><span><b>${counts.ok}</b>可催动</span><span><b>${counts.paused}</b>本月暂停</span><span><b>${counts.critical}</b>禁催/警示</span></div></div><div class="result-block"><div class="result-section-head"><div><div class="section-label">生杀五气宅盘</div><h3>坐山卦数 ${house['中宫']} 入中顺飞</h3></div><span class="tag">固定宅盘</span></div>${houseGridHTML(house,relations)}<p class="rule-note">财位以宅盘生气方为主。</p></div><div class="result-block"><div class="result-section-head"><div><div class="section-label">当前催动判断</div><h3>可催动项目一览表</h3></div><span class="tag">${cnDate(date)}</span></div><div class="logic-strip"><span>宅盘定资格</span><i>→</i><span>流年定年度基础</span><i>→</i><span>流月定时间</span></div><div class="activation-list">${results.map(x=>activationCard(x.op,x.result)).join('')}</div></div><div class="result-block caution-panel"><div class="section-label">使用说明</div><h3>使用前注意事项</h3><ul><li>财位只以宅盘生气方为基础，流年财星属于加分项。</li><li>流月二黑、三碧、五黄、七赤到达时，原则上暂停主动催动；天乙贵人同宫时，除五黄外均可化解。</li><li>天乙贵人可化解凶星、五虎及同宫问题，但不能化解流年或流月五黄，也不能化解含五黄的组合。</li><li>五虎按二十四山判断；没有天乙贵人同宫化解时，摆设跨越两个山位且其中一山犯五虎，便不要催动。</li><li>停止催动是指关闭或遮盖鱼缸、移走催动植物，或停止刻意使用该位置，不等于不能正常经过或居住。</li><li>实际布置还要核对缺角、门窗、走道、房间用途等现场条件，计算结果仅供参考。</li></ul></div>`;
  return{year,sitting:input.sitting,facing:oppositeMountain(input.sitting),house,relations,opportunities:results};
}
let activeModule='annual';
function renderModule(){const year=Number(document.querySelector('#queryYear').value),map={annual:renderAnnual,monthly:y=>renderMonths(y,'monthly'),yearTiger:renderYearTiger,monthTiger:y=>renderMonths(y,'monthTiger'),earth:renderEarth,hidden:renderHidden,noble:renderNoble,wenchang:renderWenchang,fame:renderFame};document.querySelector('#moduleResult').innerHTML=map[activeModule](year)}
if(typeof globalThis!=='undefined')globalThis.LiqiEngine={effectiveYear,mingGua,personalReport,annualCenter,annualPlate,monthSegments,fiveTigerForStartStem,yearTigerData,housePlate,houseRelations,houseRelation,annualNobleAt,activeTigerMountains,residentialAnnualBase,residentialMonthBase,activationWindow,renderResidential,renderAnnual,renderMonths,renderYearTiger,renderHidden,renderNoble,renderWenchang,renderFame};
if(typeof document!=='undefined'){
document.querySelectorAll('.mode-tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.mode-tab').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.mode-panel').forEach(x=>x.classList.toggle('active',x.id===btn.dataset.mode))}));
document.querySelectorAll('.module-tab').forEach(btn=>btn.addEventListener('click',()=>{activeModule=btn.dataset.module;document.querySelectorAll('.module-tab').forEach(x=>x.classList.toggle('active',x===btn));renderModule()}));
document.querySelector('#personalForm').addEventListener('submit',e=>{e.preventDefault();const d=document.querySelector('#birthDate').value,t=document.querySelector('#birthTime').value||'12:00',g=document.querySelector('input[name=gender]:checked').value;renderPersonal(personalReport(new Date(`${d}T${t}:00+08:00`),g))});
const mountainSelect=document.querySelector('#sittingMountain');mountainOrder.forEach(m=>{const o=document.createElement('option');o.value=m;o.textContent=`${m}山${oppositeMountain(m)}向`;mountainSelect.append(o)});mountainSelect.value='午';
const todayParts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),todayValue=`${todayParts.find(x=>x.type==='year').value}-${todayParts.find(x=>x.type==='month').value}-${todayParts.find(x=>x.type==='day').value}`;document.querySelector('#residentialDate').value=todayValue;
document.querySelector('#residentialForm').addEventListener('submit',e=>{e.preventDefault();const d=document.querySelector('#residentialDate').value,b=document.querySelector('#residentBirthDate').value,bt=document.querySelector('#residentBirthTime').value||'12:00',g=document.querySelector('input[name=residentGender]:checked').value;renderResidential({sitting:mountainSelect.value,date:new Date(`${d}T12:00:00+08:00`),birthDate:b?new Date(`${b}T${bt}:00+08:00`):null,gender:g})});
const select=document.querySelector('#queryYear'),current=effectiveYear(new Date());for(let y=current-20;y<=current+20;y++){const o=document.createElement('option');o.value=y;o.textContent=`${y} · ${ganzhiYear(y)}年`;o.selected=y===current;select.append(o)}select.addEventListener('change',renderModule);document.querySelector('#todayChip').textContent=`今日 · ${new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'long',day:'numeric'}).format(new Date())}`;document.querySelector('#personalForm').requestSubmit();document.querySelector('#residentialForm').requestSubmit();setTimeout(()=>document.querySelector('#residentialForm').requestSubmit(),0);renderModule();
if(document.modelContext?.registerTool){const register=tool=>Promise.resolve(document.modelContext.registerTool(tool)).catch(()=>{});register({name:'calculate_personal_liqi',title:'计算个人理气',description:'根据出生日期、时间和性别更新页面并返回个人命卦、纳音、三煞、禄马、桃花和贵人。',inputSchema:{type:'object',properties:{birthDate:{type:'string'},birthTime:{type:'string'},gender:{type:'string',enum:['male','female']}},required:['birthDate','gender'],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate))throw new Error('出生日期格式应为 YYYY-MM-DD');const time=input.birthTime||'12:00',data=personalReport(new Date(`${input.birthDate}T${time}:00+08:00`),input.gender);document.querySelector('#birthDate').value=input.birthDate;document.querySelector('#birthTime').value=time;document.querySelector(`input[name=gender][value=${input.gender}]`).checked=true;renderPersonal(data);return data}});register({name:'show_general_calculation',title:'查看通用计算',description:'按干支年切换并展示一个独立通用计算模块。',inputSchema:{type:'object',properties:{year:{type:'integer',minimum:1901,maximum:2099},module:{type:'string',enum:['annual','monthly','yearTiger','monthTiger','earth','hidden','noble','wenchang','fame']}},required:['year','module'],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!document.querySelector(`#queryYear option[value="${input.year}"]`)){const o=document.createElement('option');o.value=input.year;o.textContent=`${input.year} · ${ganzhiYear(input.year)}年`;select.append(o)}select.value=String(input.year);activeModule=input.module;document.querySelectorAll('.module-tab').forEach(x=>x.classList.toggle('active',x.dataset.module===activeModule));document.querySelectorAll('.mode-tab').forEach(x=>x.classList.toggle('active',x.dataset.mode==='general'));document.querySelectorAll('.mode-panel').forEach(x=>x.classList.toggle('active',x.id==='general'));renderModule();return{year:input.year,module:input.module,displayed:true}}})}
}
