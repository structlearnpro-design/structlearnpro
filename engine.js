// ═══════════════════════════════════════════════════════════════════
// STRUCTLEARN PRO — ENGINE
// Core calculation engine: state, grid, IS 456/1893/875 design
// This file is loaded FIRST by StructLearnPro.html
// ═══════════════════════════════════════════════════════════════════

// ── PLATFORM INTEGRATION  ──────────────────────────────────────
let _userPlan='free', _currentProjectId=null, _platformSaveTimer=null;

window.addEventListener('message',(e)=>{
  if(e.data?.type==='USER_PLAN'){
    _userPlan=e.data.plan||'free';
    // Store user object so cert saves, tracking etc can use user_id
    if(e.data.user) {
      window.U = e.data.user;
      window.P = e.data.user;
    }
    updateSidebarForPlan(_userPlan);
    try {
      const badge = document.querySelector('.plan-indicator');
      if(badge) {
        badge.textContent = _userPlan==='pro'?'PRO ✓':'FREE';
        badge.style.color = _userPlan==='pro'?'#38bdf8':'#64748b';
      }
    } catch(e2){}
  }
  if(e.data?.type==='LOAD_PROJECT'){
    const proj=e.data.project;
    _currentProjectId=proj.id;
    if(proj.data&&Object.keys(proj.data).length>0){
      try{
        if(proj.data.S)Object.assign(S,proj.data.S);
        if(proj.data.GRID){GRID=proj.data.GRID;}
        if(typeof renderAll==='function')renderAll();
        if(typeof go==='function')go(1);
      }catch(err){console.error('Load error:',err);}
    }
  }
  if(e.data?.type==='PROJECT_ID'){_currentProjectId=e.data.id;}
});

function requirePro(feat){
  if(_userPlan==='pro')return true;
  window.parent.postMessage({type:'REQUEST_UPGRADE',feature:feat},'*');
  return false;
}

function saveToParent(status){
  if(typeof S==='undefined')return;
  try{
    const nm=S.name||S.client||('Project '+new Date().toLocaleDateString('en-IN'));
    // Auto-detect status from results
    let autoStatus = status||'draft';
    if(typeof RES!=='undefined'&&RES&&!status){
      const beamFail=(RES.allBeams||[]).some(b=>!b.deflOK||!b.shearSafe);
      const colFail =(RES.allCols||[]).some(c=>!c.safe);
      const ftgFail =(RES.allFtgs||[]).some(f=>!f.punch_ok||!f.ow_ok);
      autoStatus = (beamFail||colFail||ftgFail)?'fail':'pass';
    }
    window.parent.postMessage({
      type:'SAVE_PROJECT',name:nm,
      data:{S:{...S},GRID:GRID?JSON.parse(JSON.stringify(GRID)):null},
      floors:S.numFloors||1,spansX:S.spansX||[],spansY:S.spansY||[],
      status:autoStatus,projectId:_currentProjectId,
    },'*');
  }catch(err){console.error('Save error:',err);}
}

// Auto-save started after app initialises (see go() function)


// == 01_state.js ==

// ================================================================
// MODULE: 01_state
// State variables, S object, r2/r0/clamp helpers, field builders
// Edit this to: change defaults, add new fields, modify helpers
// ================================================================

// ── TOP-LEVEL STATE ──────────────────────────────────────────
// strict mode removed for iOS compatibility
// =======================================================
// STATE
// =======================================================
let PAGE=0, RES=null, RSEC='overview', BIDX=0, CIDX=0;
const S={
  name:'Sharma Residence',location:'New Delhi',client:'Mr. Arun Sharma',
  zone:'IV',soilType:'II',importance:1.0,
  numFloors:4,floorHt:3.2,buildingL:12,buildingW:9,
  spansX:[4,4,4],spansY:[3,3,3],
  fck:25,fy:500,Es:200000,
  udlLL:2.0,udlRoof:1.5,floorFinish:1.0,partitions:1.5,wallLoad:12,
  slabThk:150,coverSlab:20,coverBeam:40,coverCol:40,coverFtg:75,
  soilBearing:200,ftgDepth:1.5, ftgMinD:0,windZone:'IV',terrain:'2'
};

// =======================================================
// MATH HELPERS
// =======================================================
const r2=v=>String(isNaN(v)?0:Math.round(v*100)/100);
const r1=v=>String(isNaN(v)?0:Math.round(v*10)/10);
const r0=v=>String(isNaN(v)?0:Math.round(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const PI=Math.PI;

// ── TOP-LEVEL CONSTANTS (used across modules) ────────────────
// IS456_T26, IS456_T16A, FRR_BY_OCCUPANCY, PRACTICAL, 
// GRID, GE, MODES, CANVAS_W, PAD are defined in their modules.



function sv(id,v){
  const tx=['name','location','client','zone','soilType','windZone','terrain'];
  S[id]=tx.includes(id)?v:(parseFloat(v)||0);
  // Auto-recalculate dependent values when key inputs change
  if(id==='floorHt'||id==='slabThk'){
    // Wall load = brick wall * floor height * density * (1 - openings)
    // 0.23m thick * floorHt * 19 kN/m3 * 0.7 (30% openings) - slab thickness
    const ht=S.floorHt||3.2;
    const wallH=ht-(S.slabThk||150)/1000;
    const autoWall=Math.round(0.23*wallH*19*0.7*10)/10;
    S.wallLoad=autoWall;
    const wlEl=document.getElementById('wallLoad');
    if(wlEl)wlEl.value=autoWall;
  }
  if(id==='floorHt'){
    // Update coverCol default based on exposure (no change needed)
    // Rebuild spans display if needed
  }
}

// Validation rules per field ID
const FLD_RULES={
  numFloors:{min:2,max:20,msg:'2–20 floors'},floorHt:{min:2.4,max:6,msg:'2.4–6 m'},
  buildingL:{min:3,max:50,msg:'3–50 m'},buildingW:{min:3,max:30,msg:'3–30 m'},
  fck:{min:20,max:60,msg:'M20–M60'},fy:{min:250,max:600,msg:'250–600 N/mm2'},
  udlLL:{min:1,max:10,msg:'1–10 kN/m2'},udlRoof:{min:0.5,max:5,msg:'0.5–5 kN/m2'},
  floorFinish:{min:0,max:3,msg:'0–3 kN/m2'},partitions:{min:0,max:4,msg:'0–4 kN/m2'},
  soilBearing:{min:50,max:500,msg:'50–500 kN/m2'},ftgDepth:{min:0.5,max:4,msg:'0.5–4 m'},
  coverSlab:{min:15,max:50,msg:'15–50 mm'},coverBeam:{min:25,max:60,msg:'25–60 mm'},
  coverCol:{min:30,max:60,msg:'30–60 mm'},
};
function validateFld(id,v){
  const rule=FLD_RULES[id];if(!rule)return'';
  const num=parseFloat(v);
  if(isNaN(num))return'Enter a number';
  if(num<rule.min||num>rule.max)return rule.msg;
  return'';
}
function fldValidate(id){
  const el=document.getElementById(id);if(!el)return;
  const err=validateFld(id,el.value);
  let tip=el.parentElement.querySelector('.vld-tip');
  if(!tip){tip=document.createElement('span');tip.className='vld-tip';tip.style.cssText='font-size:10px;margin-left:6px;transition:color 0.2s';el.parentElement.querySelector('label').appendChild(tip);}
  if(err){tip.textContent=' ⚠ '+err;tip.style.color='#f87171';el.style.borderColor='rgba(248,113,113,0.6)';}
  else{tip.textContent=' ✓';tip.style.color='#34d399';el.style.borderColor='rgba(52,211,153,0.5)';}
}
function fld(id,lbl,tip,unit,type,val,opts){
  const u=unit?`<span style="color:var(--txt3);font-size:10px">[${unit}]</span>`:'';
  const t=`<span style="display:inline-block;background:#1e3a8a;color:#93c5fd;border-radius:50%;width:13px;height:13px;font-size:9px;text-align:center;line-height:13px;cursor:default" title="${tip}">?</span>`;
  if(type==='sel'){
    const o=opts.map(x=>`<option value="${x.v}"${x.v==val?' selected':''}>${x.l}</option>`).join('');
    return`<div class="fld"><label>${lbl} ${t} ${u}</label><select id="${id}" onchange="sv('${id}',this.value)">${o}</select></div>`;
  }
  return`<div class="fld"><label>${lbl} ${t} ${u}</label><input type="number" id="${id}" value="${val}" oninput="sv('${id}',this.value);fldValidate('${id}')"/></div>`;
}

function tfld(id,lbl,tip,val){return`<div class="fld"><label>${lbl} <span title="${tip}" style="display:inline-block;background:#1e3a8a;color:#93c5fd;border-radius:50%;width:13px;height:13px;font-size:9px;text-align:center;line-height:13px;cursor:default">?</span></label><input type="text" id="${id}" value="${val}" oninput="sv('${id}',this.value)" style="width:100%;background:var(--bg1);color:var(--txt);border:1px solid var(--b2);border-radius:6px;padding:7px 10px;font-size:12px;font-family:var(--mono)"/></div>`;}

// =======================================================
// ALL PAGES
// =======================================================


// ── IS CODE CLAUSE DICTIONARY ────────────────────────────────────
const IS_CLAUSES = {
  'IS 456 Cl 23.2':   'Deflection control: Span/effective-depth ratio shall not exceed 26 for simply supported, 20 for continuous spans (basic values, adjusted for steel and compression steel).',
  'IS 456 Cl 23.2a':  'Maximum permissible deflection = Span/250, or 20mm, whichever is less, for beams and slabs.',
  'IS 456 Cl 26.5.1': 'Minimum width of beam = 200mm. Minimum depth = Span/12 for simply supported, Span/15 for continuous.',
  'IS 456 Cl 26.5.1.2':'Beam width shall not be less than 200mm.',
  'IS 456 Cl 38.1':   'Design compressive strength of concrete = 0.67 fck. With partial safety factor 1.5 → fcd = 0.67fck/1.5 = 0.446fck.',
  'IS 456 Cl 36.1':   'Design tensile strength of steel: fyd = fy / gamma_s where gamma_s = 1.15. So fyd = 0.87fy.',
  'IS 456 Cl 40.2':   'Nominal shear stress tv = Vu/(b×d). Maximum shear stress tc_max from Table 20 (IS 456). If tv > tc_max, section must be redesigned.',
  'IS 456 Cl 40.4':   'Design of shear reinforcement: Vus = 0.87×fy×Asv×d/sv. Minimum shear links required even if tv < tc.',
  'IS 456 Cl 26.2.1': 'Development length Ld = phi × sigma_s / (4 × tau_bd). For Fe500 bars in M25 concrete: Ld ≈ 40φ (tension), 30φ (compression).',
  'IS 456 Cl 26.4':   'Nominal cover to reinforcement: for moderate exposure = 40mm (beams/columns), 20mm (slabs), 50mm (foundations).',
  'IS 456 Cl 26.4.2.2':'Cover for foundations in contact with earth: minimum 75mm on bottom face.',
  'IS 456 Cl 39.3':   'Column capacity Pu ≤ 0.4×fck×Ac + 0.67×fy×Asc. Minimum eccentricity emin = max(L/500 + b/30, 20mm) must be checked.',
  'IS 456 Cl 26.5.3.1':'Minimum steel in columns: Asc_min = 0.8% of gross area. Maximum = 4% (6% at laps).',
  'IS 456 Cl 31.6':   'Punching shear: critical perimeter at d/2 from face of column. Permissible punching shear stress tc = 0.25√fck.',
  'IS 456 Cl 34.2.4': 'One-way shear in footings: critical section at d from face of column. Design shear resistance from Table 19.',
  'IS 456 Table 16':  'Nominal cover for different exposure conditions: Mild=20mm, Moderate=30mm, Severe=45mm, Very Severe=50mm, Extreme=75mm.',
  'IS 456 Annex G':   'Limiting moment of resistance: Mulim = 0.36×fck×b×Xu,max×(d - 0.42×Xu,max). For Fe500: Xu,max/d = 0.46.',
  'IS 1893 Cl 6.4':   'Design horizontal seismic coefficient: Ah = (Z/2)×(I/R)×(Sa/g). Z=zone factor, I=importance factor, R=response reduction factor.',
  'IS 1893 Cl 7.6':   'Base shear Vb = Ah × W, where W is seismic weight of building (DL + fraction of LL).',
  'IS 13920 Cl 6.3.5':'Beam stirrups must have 135-degree hooks at both ends. 90-degree hooks are NOT permitted in seismic zones III, IV, V.',
  'IS 13920 Cl 7.4':  'Column confinement zone Lo = max(larger dimension of column, clear height/6, 450mm) from each end. Special confining reinforcement required in Lo.',
  'IS 13920 Cl 7.4.7':'Hooks in lateral ties: 135-degree hooks with 10d extension. No 90-degree hooks in confinement zones.',
  'IS 875 Pt 3':      'Design wind speed Vz = Vb × k1 × k2 × k3. Design wind pressure pz = 0.6 × Vz². Applies to all exposed structures.',
};

function clauseRef(ref) {
  if (!ref) return '';
  const tip = IS_CLAUSES[ref.trim()];
  if (!tip) return `<span class="ref">${ref}</span>`;
  return `<span class="ref clause-link" onclick="showClauseTip('${ref.replace(/'/g,"\'")}',this)" title="Click to see clause text" style="cursor:pointer;border-bottom:1px dashed var(--blue);padding-bottom:1px">${ref} ℹ</span>`;
}

function showClauseTip(ref, el) {
  // Remove any existing tip
  const old = document.getElementById('clauseTipBox');
  if (old) { old.remove(); if (old._ref === ref) return; }
  const tip = IS_CLAUSES[ref];
  if (!tip) return;
  const box = document.createElement('div');
  box.id = 'clauseTipBox';
  box._ref = ref;
  box.style.cssText = 'position:fixed;z-index:9999;max-width:420px;background:#0f172a;border:1.5px solid #1e40af;border-radius:10px;padding:14px 16px;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-size:11.5px;line-height:1.8;color:#cbd5e1';
  // Position near clicked element
  const rect = el.getBoundingClientRect();
  const top = rect.bottom + 8 + window.scrollY;
  const left = Math.min(rect.left, window.innerWidth - 440);
  box.style.top = top + 'px';
  box.style.left = Math.max(8, left) + 'px';
  box.innerHTML = '<div style="font-size:11px;font-weight:700;color:#38bdf8;margin-bottom:6px">' + ref + '</div>'
    + '<div>' + tip + '</div>'
  + '<button onclick="var b=document.getElementById(\'clauseTipBox\');if(b)b.remove()" style="margin-top:10px;padding:3px 10px;background:transparent;border:1px solid #64748b;border-radius:5px;color:#64748b;cursor:pointer;font-size:10px">Close</button>';
  document.body.appendChild(box);
  // Auto-close after 8s
  setTimeout(() => { const b=document.getElementById('clauseTipBox'); if(b&&b._ref===ref)b.remove(); }, 8000);
}


// ── "WHY?" EXPANDABLE EXPLANATIONS ───────────────────────────────
let _whyCounter = 0;
function fmWhy(eq, res, ref, why) {
  // Extended fm() with optional expandable "Why?" section
  if (!why) return fm(eq, res, ref);
  const id = 'why_' + (++_whyCounter);
  const refHtml = ref ? clauseRef(ref) : '';
  return `<div class="fm">
    ${eq} <span class="r">= ${res}</span>
    ${refHtml ? '<span style="margin-left:6px">' + refHtml + '</span>' : ''}
    <button onclick="toggleWhy('${id}')" style="margin-left:8px;padding:1px 7px;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.3);border-radius:4px;color:#38bdf8;cursor:pointer;font-size:9px;font-weight:700" title="Expand to see why this formula is used">WHY?</button>
    <div id="${id}" style="display:none;margin-top:6px;padding:8px 12px;background:rgba(14,165,233,0.06);border-left:2px solid #0ea5e9;border-radius:0 6px 6px 0;font-size:10.5px;color:var(--txt2);line-height:1.8">${why}</div>
  </div>`;
}
function toggleWhy(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function krow(k,v,ref='',cls=''){return`<div class="kv"><span class="kv-k">${k}</span><span class="kv-v ${cls}">${v}</span>${ref?`<span class="kv-r">${ref}</span>`:''}</div>`;}

// Auto-WHY lookup — keyed by substrings that appear in the equation string
const FM_WHY = {
  'D = d_min':    'Beam depth D rounded up to nearest 25mm from span/12 rule. Effective depth d = D - cover - stirrup - half bar diameter. Rounding UP to 25mm is standard Indian practice for formwork economy.',
  'b = max(230':  'Minimum beam width 200mm from IS 456 Cl 26.5.1. b = max(230, 0.4D) ensures the section is compact enough to fit the required bar arrangement with cover and spacing.',
  'd = D - cover': 'Effective depth d = overall depth D minus cover minus stirrup diameter minus half main bar diameter. This is the lever arm distance from extreme compression fibre to centroid of tension steel.',
  'wu = 1.5x':    'Factored load wu = 1.5 x (Dead Load + Live Load). The factor 1.5 is the partial safety factor for DL+LL combination from IS 456 Table 18. Always use factored loads for structural design.',
  'Mmax = wux':   'Maximum midspan moment for UDL on simply supported beam = wL²/8. For continuous beams IS 456 Table 12 gives smaller coefficients (1/10 to 1/12 at midspan). Larger end moments exist at supports.',
  'Mulim = 0.138': 'Limiting moment of resistance for singly reinforced beam (IS 456 Annex G). For Fe500: Xu_max/d = 0.46, so Mulim = 0.138 x fck x b x d². If Mu > Mulim, increase depth or add compression steel.',
  'Mulim':        'Limiting moment of resistance (IS 456 Annex G). For Fe500 steel: Xu_max/d = 0.46. Beam must be designed so Mu ≤ Mulim to remain singly reinforced (no compression steel).',
  'Ld_req':       'Required development length Ld = (φ x σs)/(4 x τbd). For Fe500 bars in M25 concrete Ld ≈ 40φ in tension. The bar must extend this length beyond the critical section to fully develop its strength.',
  'Ldr = ':       'Development length with 90° standard hook reduction factor 0.7 (IS 456 Cl 26.2.1). Hook allows shorter straight anchorage. Ld_available must be ≥ Ld_required for the check to pass.',
  'Pu = 1.5 x P': 'Factored axial load Pu = 1.5 x service load Ps. Factor 1.5 is for DL+LL combination from IS 456 Table 18. For columns carry cumulative load from ALL floors above.',
  'Pcap':         'Short column capacity (IS 456 Cl 39.3): 0.4xfck×Ac + 0.67xfy×Asc. The 0.4 (not 0.446) is specific to column formula. Add 0.67fy contribution of steel bars. Pu must be ≤ Pcap.',
  'B = sqrtAf':   'Footing size B = √(Ps/qa) where qa = SBC - 18×depth is allowable net soil pressure. IMPORTANT: use service load Ps (not factored) for soil pressure since SBC is already a service-level limit.',
  'qu = ':        'Factored net upward soil pressure qu = Pu/B² for structural design of footing depth and steel. Uses factored load Pu since we are designing the concrete section.',
  'tcp = 0.25':   'Permissible punching shear stress = 0.25√fck (IS 456 Cl 31.6.3). This is the two-way shear resistance of plain concrete. If tv_punching > tcp, increase footing depth.',
  'Vpu':          'Punching shear force Vpu = qu × (B² - (col+d)²). The critical perimeter is at d/2 from column face forming a square of side (col+d). Force is the upward pressure on area outside this perimeter.',
  'ly/lx = ':     'Aspect ratio ly/lx of slab panel. If ly/lx < 2.0: two-way slab (spans in both directions, uses IS 456 Table 26 coefficients). If ly/lx ≥ 2.0: one-way slab (main span in short direction only).',
  'ly/lx':        'Aspect ratio determines slab behaviour. Two-way slab (ly/lx < 2) carries load to all four supports — more efficient. One-way slab (ly/lx ≥ 2) carries load mainly to two supports.',
  'ax':           'Bending moment coefficients αx (short span) and αy (long span) from IS 456 Table 26. Depend on boundary conditions: Case 4 (all edges continuous) has smallest coefficients; Case 1 (all simply supported) has largest.',
  'Vb = Ah x W':  'Base shear Vb = Ah x W = total horizontal seismic force. Distributed up the building height using inverted triangle pattern (top floor gets most). IS 1893 Cl 7.5.3 and 7.6.',
  'Ah = ':        'Design seismic coefficient Ah = (Z/2)(Sa/g)/(RxI). Z/2 is design level (half MCE). Sa/g from response spectrum depends on soil type and building period. R=5 for good ductile frames.',
  'Ta = 0.09H':   'Fundamental time period of RC frame: Ta = 0.09H/√D (IS 1893 Cl 7.6.1b). H=total height in m, D=base width in m in the direction of motion. Longer period → lower Sa/g → lower seismic force.',
  'pz = 0.6xVz':  'Design wind pressure pz = 0.6Vz² N/m² (IS 875 Pt3 Cl 5.4). Vz is design wind speed in m/s. The 0.6 = ½×air density. pz gives basic pressure; multiply by Cp coefficients for net force on surfaces.',
  'Qi = Vb':      'Floor seismic force Qi = Vb × WiHi²/ΣWjHj². Upper floors attract more seismic force (inverted triangle). This distribution reflects the first mode shape of the building vibrating.',
  'Sa/g':         'Spectral acceleration Sa/g from IS 1893 Fig. 2 response spectrum. Depends on building period Ta and soil type. For short stiff buildings Sa/g = 2.5 (peak). Reduces for longer periods.',
};

let _fmCount = 0;
function fm(eq, res, ref='') {
  // Look up auto-WHY explanation
  let why = '';
  const eqStr = String(eq||'');
  for (const [key, explanation] of Object.entries(FM_WHY)) {
    if (eqStr.includes(key)) { why = explanation; break; }
  }
  // Also check fmWhy override
  const refHtml = ref ? clauseRef(ref) : '';
  if (!why) {
    return `<div class="fm">${eq} <span class="r">= ${res}</span>${refHtml ? ' '+refHtml : ''}</div>`;
  }
  const id = 'fw' + (++_fmCount);
  return `<div class="fm">${eq} <span class="r">= ${res}</span>${refHtml ? ' '+refHtml : ''}
    <button onclick="var e=document.getElementById('${id}');if(e)e.style.display=e.style.display==='none'?'block':'none'" style="margin-left:8px;padding:1px 7px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.35);border-radius:4px;color:#38bdf8;cursor:pointer;font-size:9px;font-weight:700;vertical-align:middle">WHY?</button>
    <div id="${id}" style="display:none;margin-top:6px;padding:8px 12px;background:rgba(14,165,233,0.07);border-left:2px solid #0ea5e9;border-radius:0 6px 6px 0;font-size:10.5px;color:var(--txt2);line-height:1.8">${why}</div>
  </div>`;
}

function vd(ok,msg,util){
  // util = 0..1 (demand/capacity ratio) — optional
  const bar=util!==undefined?`<span style="display:inline-block;width:60px;height:6px;background:var(--bg1);border-radius:3px;margin-left:8px;vertical-align:middle;overflow:hidden"><span style="display:block;height:100%;width:${Math.min(100,Math.round(util*100))}%;background:${util>1?'#f87171':util>0.85?'#fbbf24':'#34d399'};border-radius:3px;transition:width 0.4s"></span></span>`:'';
  return`<div class="vd ${ok===true?'ok':ok===false?'ng':'wn'}"><span>${ok===true?'OK':ok===false?'X':'!!'}</span>${msg}${bar}</div>`;
}

function sb(n,title,html,col=''){return`<div class="sb ${col}" data-n="${n}"><div style="padding-top:8px;font-size:11px;font-weight:700;color:var(--cyan);margin-bottom:7px">${title}</div>${html}</div>`;}

function sdiv(t){return`<div class="sdiv"><div class="sdiv-l"></div><div class="sdiv-t">${t}</div><div class="sdiv-l"></div></div>`;}

// =======================================================
// SVG DIAGRAM GENERATORS
// =======================================================

// Tributary area diagram - shows how area is assigned to column

// == 02_svgdiagrams.js ==

// ================================================================
// MODULE: 02_svgdiagrams
// SVG diagram generators
// ================================================================



function svgTribArea(type,spX,spY){
  const W=400,H=300,pad=50;
  // Auto-scale so both bays fit within canvas
  const maxW=W-2*pad, maxH=H-2*pad-20;
  const scX=Math.min(maxW/(2*spX), maxH/(2*spY), 55);
  const scY=scX;
  const bW=spX*scX, bH=spY*scY;
  // 3×3 grid of nodes (2 bays each direction)
  const bx=[pad, pad+bW, pad+2*bW];
  const by=[pad, pad+bH, pad+2*bH];

  // Which node is the design column?
  // corner=top-left(0,0), edge=top-center(1,0), interior=center(1,1)
  const colNodeX = type==='corner'?0 : type==='edge'?1 : 1;
  const colNodeY = type==='corner'?0 : type==='edge'?0 : 1;
  const cx=bx[colNodeX], cy=by[colNodeY];

  // Tributary area shading (half-bay each side from column)
  let tribX1,tribX2,tribY1,tribY2;
  if(type==='corner'){
    tribX1=bx[0]; tribX2=(bx[0]+bx[1])/2;
    tribY1=by[0]; tribY2=(by[0]+by[1])/2;
  } else if(type==='edge'){
    tribX1=(bx[0]+bx[1])/2; tribX2=(bx[1]+bx[2])/2;
    tribY1=by[0]; tribY2=(by[0]+by[1])/2;
  } else { // interior
    tribX1=(bx[0]+bx[1])/2; tribX2=(bx[1]+bx[2])/2;
    tribY1=(by[0]+by[1])/2; tribY2=(by[1]+by[2])/2;
  }
  const tribArea = (tribX2-tribX1)*(tribY2-tribY1)/(scX*scY);

  let g=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g+=`<rect width="${W}" height="${H}" fill="#0a0f1e" rx="6"/>`;
  g+=`<text x="${W/2}" y="18" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">TRIBUTARY AREA — ${type.toUpperCase()} COLUMN</text>`;

  // Slab panels (light fill)
  for(let r=0;r<2;r++) for(let ci=0;ci<2;ci++){
    g+=`<rect x="${bx[ci]}" y="${by[r]}" width="${bW}" height="${bH}" fill="rgba(30,41,59,0.8)" stroke="#334155" stroke-width="1"/>`;
  }

  // Tributary area shading
  g+=`<rect x="${tribX1}" y="${tribY1}" width="${tribX2-tribX1}" height="${tribY2-tribY1}" fill="rgba(56,189,248,0.22)" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="5,3"/>`;

  // Dimension lines — horizontal (span X)
  g+=`<line x1="${bx[0]}" y1="${by[2]+18}" x2="${bx[1]}" y2="${by[2]+18}" stroke="#f59e0b" stroke-width="1"/>`;
  g+=`<line x1="${bx[1]}" y1="${by[2]+18}" x2="${bx[2]}" y2="${by[2]+18}" stroke="#f59e0b" stroke-width="1"/>`;
  g+=`<text x="${(bx[0]+bx[1])/2}" y="${by[2]+30}" fill="#f59e0b" font-size="10" text-anchor="middle" font-family="JetBrains Mono">${spX}m</text>`;
  g+=`<text x="${(bx[1]+bx[2])/2}" y="${by[2]+30}" fill="#f59e0b" font-size="10" text-anchor="middle" font-family="JetBrains Mono">${spX}m</text>`;

  // Dimension lines — vertical (span Y)
  g+=`<line x1="${bx[0]-18}" y1="${by[0]}" x2="${bx[0]-18}" y2="${by[1]}" stroke="#f59e0b" stroke-width="1"/>`;
  g+=`<line x1="${bx[0]-18}" y1="${by[1]}" x2="${bx[0]-18}" y2="${by[2]}" stroke="#f59e0b" stroke-width="1"/>`;
  g+=`<text x="${bx[0]-30}" y="${(by[0]+by[1])/2+4}" fill="#f59e0b" font-size="10" text-anchor="middle" font-family="JetBrains Mono" transform="rotate(-90,${bx[0]-30},${(by[0]+by[1])/2+4})">${spY}m</text>`;
  g+=`<text x="${bx[0]-30}" y="${(by[1]+by[2])/2+4}" fill="#f59e0b" font-size="10" text-anchor="middle" font-family="JetBrains Mono" transform="rotate(-90,${bx[0]-30},${(by[1]+by[2])/2+4})">${spY}m</text>`;

  // All column nodes
  bx.forEach(x=>by.forEach(y=>{
    g+=`<rect x="${x-6}" y="${y-6}" width="12" height="12" fill="#1e293b" stroke="#64748b" stroke-width="1.5" rx="2"/>`;
  }));

  // Design column (highlighted)
  g+=`<rect x="${cx-8}" y="${cy-8}" width="16" height="16" fill="#f97316" stroke="#fb923c" stroke-width="2" rx="2"/>`;
  g+=`<text x="${cx}" y="${cy+4}" fill="white" font-size="8" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">C</text>`;

  // Tributary area label
  const ax=(tribX1+tribX2)/2, ay=(tribY1+tribY2)/2;
  g+=`<text x="${ax}" y="${ay-6}" fill="white" font-size="11" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">A=${r2(tribArea)}m²</text>`;
  g+=`<text x="${ax}" y="${ay+10}" fill="#94a3b8" font-size="8" text-anchor="middle" font-family="JetBrains Mono">trib area</text>`;

  // Trib dim annotations
  g+=`<line x1="${tribX1}" y1="${tribY2+6}" x2="${tribX2}" y2="${tribY2+6}" stroke="#38bdf8" stroke-width="0.8"/>`;
  g+=`<text x="${ax}" y="${tribY2+18}" fill="#38bdf8" font-size="8" text-anchor="middle" font-family="JetBrains Mono">${r2((tribX2-tribX1)/scX)}m</text>`;
  g+=`<line x1="${tribX2+6}" y1="${tribY1}" x2="${tribX2+6}" y2="${tribY2}" stroke="#38bdf8" stroke-width="0.8"/>`;
  g+=`<text x="${tribX2+22}" y="${ay+4}" fill="#38bdf8" font-size="8" text-anchor="middle" font-family="JetBrains Mono">${r2((tribY2-tribY1)/scY)}m</text>`;

  // Legend
  g+=`<rect x="${W-130}" y="28" width="10" height="10" fill="rgba(56,189,248,0.22)" stroke="#38bdf8" stroke-width="1"/>`;
  g+=`<text x="${W-116}" y="38" fill="#38bdf8" font-size="9" font-family="JetBrains Mono">Tributary area</text>`;
  g+=`<rect x="${W-130}" y="44" width="10" height="10" fill="#f97316"/>`;
  g+=`<text x="${W-116}" y="54" fill="#f97316" font-size="9" font-family="JetBrains Mono">Design column</text>`;
  g+=`<rect x="${W-130}" y="60" width="10" height="10" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>`;
  g+=`<text x="${W-116}" y="70" fill="#64748b" font-size="9" font-family="JetBrains Mono">Other columns</text>`;

  g+=`<text x="${W/2}" y="${H-6}" fill="#475569" font-size="8" text-anchor="middle" font-family="JetBrains Mono">IS 456 — Tributary Area Method for Column Loads</text>`;
  g+='</svg>';
  return`<div class="dg">${g}<div class="dg-cap">Fig: Tributary area (shaded) for ${type} column. Column load = (DL+LL) × ${r2(tribArea)}m² × no. of floors</div></div>`;
}

// Load diagram on beam - UDL + reactions

function svgBeamLoad(L,wu,RA){
  const W=500,H=180,pl=60,pr=60,by=110;
  let g=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g+=`<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;
  const bw=W-pl-pr;
  // beam
  g+=`<rect x="${pl}" y="${by}" width="${bw}" height="16" fill="#374151" stroke="#6b7280" stroke-width="1.5" rx="3"/>`;
  // UDL arrows
  const na=14;
  for(let i=0;i<=na;i++){
    const ax=pl+i*(bw/na);
    g+=`<line x1="${ax}" y1="${by-32}" x2="${ax}" y2="${by-2}" stroke="#fb923c" stroke-width="1.5" marker-end="url(#arr)"/>`;
  }
  g+=`<line x1="${pl}" y1="${by-32}" x2="${pl+bw}" y2="${by-32}" stroke="#fb923c" stroke-width="2"/>`;
  g+=`<text x="${pl+bw/2}" y="${by-38}" fill="#fb923c" font-size="11" text-anchor="middle" font-family="JetBrains Mono">wu = ${r2(wu)} kN/m</text>`;
  // supports
  [[pl,'A'],[pl+bw,'B']].forEach(([x,lbl])=>{
    g+=`<polygon points="${x},${by+16} ${x-10},${by+34} ${x+10},${by+34}" fill="#64748b" stroke="#64748b" stroke-width="1.5"/>`;
    g+=`<text x="${x}" y="${by+48}" fill="#94a3b8" font-size="11" text-anchor="middle" font-family="JetBrains Mono">${lbl}</text>`;
  });
  // reactions
  g+=`<line x1="${pl}" y1="${by+34}" x2="${pl}" y2="${by+55}" stroke="#34d399" stroke-width="2" marker-end="url(#garr)"/>`;
  g+=`<text x="${pl}" y="${by+68}" fill="#34d399" font-size="10" text-anchor="middle" font-family="JetBrains Mono">RA=${r2(RA)}kN</text>`;
  g+=`<line x1="${pl+bw}" y1="${by+34}" x2="${pl+bw}" y2="${by+55}" stroke="#34d399" stroke-width="2" marker-end="url(#garr)"/>`;
  g+=`<text x="${pl+bw}" y="${by+68}" fill="#34d399" font-size="10" text-anchor="middle" font-family="JetBrains Mono">RB=${r2(RA)}kN</text>`;
  // span dim
  g+=`<line x1="${pl}" y1="18" x2="${pl+bw}" y2="18" stroke="#64748b" stroke-width="1" marker-start="url(#darr)" marker-end="url(#darr)"/>`;
  g+=`<text x="${pl+bw/2}" y="14" fill="#64748b" font-size="10" text-anchor="middle" font-family="JetBrains Mono">L = ${r2(L)} m</text>`;
  // arrowhead defs
  g+=`<defs>
    <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto"><polygon points="0,0 6,0 3,6" fill="#fb923c"/></marker>
    <marker id="garr" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto"><polygon points="0,6 6,6 3,0" fill="#34d399"/></marker>
    <marker id="darr" markerWidth="6" markerHeight="4" refX="0" refY="2" orient="auto"><polygon points="0,2 4,0 4,4" fill="#64748b"/></marker>
  </defs>`;
  g+='</svg>';
  return`<div class="dg">${g}<div class="dg-cap">Fig: Free body diagram  -  UDL on simply supported beam</div></div>`;
}

// SFD diagram

function svgSFD(L,wu,RA){
  const W=500,H=160,pl=60,pr=60,base=100;
  const bw=W-pl-pr;
  let g=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g+=`<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;
  // baseline
  g+=`<line x1="${pl}" y1="${base}" x2="${pl+bw}" y2="${base}" stroke="#64748b" stroke-width="3"/>`;
  // SFD path (linear)
  const sc=(base-20)/RA;
  const pts=[];
  for(let i=0;i<=50;i++){const x=i/50;pts.push(`${pl+x*bw},${base-( RA-wu*x*L)*sc}`);}
  g+=`<polyline points="${pts.join(' ')}" fill="none" stroke="#38bdf8" stroke-width="2.5"/>`;
  // fill above/below
  g+=`<polygon points="${pl},${base} ${pts.slice(0,26).join(' ')} ${pl+bw/2},${base}" fill="rgba(56,189,248,0.2)"/>`;
  g+=`<polygon points="${pl+bw/2},${base} ${pts.slice(25).join(' ')} ${pl+bw},${base}" fill="rgba(248,113,113,0.15)"/>`;
  // zero crossing marker
  g+=`<circle cx="${pl+bw/2}" cy="${base}" r="4" fill="#34d399"/>`;
  g+=`<line x1="${pl+bw/2}" y1="${base-40}" x2="${pl+bw/2}" y2="${base+20}" stroke="rgba(52,211,153,0.5)" stroke-width="1" stroke-dasharray="3,3"/>`;
  g+=`<text x="${pl+bw/2+6}" y="${base-28}" fill="#34d399" font-size="9" font-family="JetBrains Mono">V=0 at L/2</text>`;
  // value labels
  g+=`<text x="${pl+4}" y="${base-RA*sc+14}" fill="#38bdf8" font-size="10" font-family="JetBrains Mono">+${r2(RA)}kN</text>`;
  g+=`<text x="${pl+bw-60}" y="${base+RA*sc-4}" fill="#f87171" font-size="10" font-family="JetBrains Mono">-${r2(RA)}kN</text>`;
  g+=`<text x="${pl+bw/2}" y="14" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">SHEAR FORCE DIAGRAM (kN)</text>`;
  g+='</svg>';
  return`<div class="dg">${g}<div class="dg-cap">Fig: SFD  -  shear varies linearly. Maximum ${r2(RA)} kN at supports, zero at midspan.</div></div>`;
}

// BMD diagram

function svgBMD(L,wu,Mmax){
  const W=500,H=170,pl=60,pr=60,base=40;
  const bw=W-pl-pr;
  let g=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g+=`<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;
  const sc=(H-base-30)/Mmax;
  const pts=[];
  for(let i=0;i<=60;i++){const x=i/60*L;const M=wu*x*(L-x)/2;pts.push(`${pl+i/60*bw},${base+M*sc}`);}
  g+=`<polygon points="${pl},${base} ${pts.join(' ')} ${pl+bw},${base}" fill="rgba(251,146,60,0.2)"/>`;
  g+=`<polyline points="${pts.join(' ')}" fill="none" stroke="#fb923c" stroke-width="2.5"/>`;
  g+=`<line x1="${pl}" y1="${base}" x2="${pl+bw}" y2="${base}" stroke="#64748b" stroke-width="3"/>`;
  // peak
  g+=`<circle cx="${pl+bw/2}" cy="${base+Mmax*sc}" r="5" fill="#fb923c"/>`;
  g+=`<line x1="${pl+bw/2}" y1="${base}" x2="${pl+bw/2}" y2="${base+Mmax*sc}" stroke="rgba(251,146,60,0.4)" stroke-width="1" stroke-dasharray="3,3"/>`;
  g+=`<text x="${pl+bw/2+8}" y="${base+Mmax*sc-8}" fill="#fb923c" font-size="10" font-family="JetBrains Mono" font-weight="bold">Mmax=${r2(Mmax)}kN.m</text>`;
  g+=`<text x="${pl}" y="8" fill="#0ea5e9" font-size="9" font-family="JetBrains Mono">M=0</text>`;
  g+=`<text x="${pl+bw-30}" y="8" fill="#0ea5e9" font-size="9" font-family="JetBrains Mono">M=0</text>`;
  g+=`<text x="${pl+bw/2}" y="${H-4}" fill="#fb923c" font-size="11" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">BENDING MOMENT DIAGRAM (kN.m)</text>`;
  g+='</svg>';
  return`<div class="dg">${g}<div class="dg-cap">Fig: BMD  -  parabolic shape for UDL. Maximum sagging moment ${r2(Mmax)} kN.m at midspan.</div></div>`;
}

// Beam cross section with reinforcement

function svgBeamXS(b,D,cover,nBot,dBot,nTop,dTop,sv2){
  const W=320,H=260,scale=Math.min((W-60)/b,(H-60)/D)*0.85;
  const bw=b*scale,dh=D*scale,x0=W/2-bw/2,y0=30;
  let g=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g+=`<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;
  // concrete
  g+=`<rect x="${x0}" y="${y0}" width="${bw}" height="${dh}" fill="#374151" stroke="#6b7280" stroke-width="2"/>`;
  // aggregate dots
  for(let i=0;i<25;i++)g+=`<circle cx="${x0+8+Math.random()*(bw-16)}" cy="${y0+8+Math.random()*(dh-16)}" r="2" fill="rgba(150,150,150,0.3)"/>`;
  // cover line dashed
  const cv=cover*scale;
  g+=`<rect x="${x0+cv}" y="${y0+cv}" width="${bw-2*cv}" height="${dh-2*cv}" fill="none" stroke="rgba(250,204,21,0.3)" stroke-width="1" stroke-dasharray="4,3"/>`;
  // stirrup
  g+=`<rect x="${x0+cv+2}" y="${y0+cv+2}" width="${bw-2*cv-4}" height="${dh-2*cv-4}" fill="none" stroke="#94a3b8" stroke-width="${Math.max(1,8*scale/15)}"/>`;
  // bottom bars
  const botR=Math.max(4,dBot/2*scale*0.7);
  const botY=y0+dh-cv-botR-2;
  const botSp=(bw-2*cv-2*botR)/(nBot-1||1);
  for(let i=0;i<nBot;i++){
    const bx=x0+cv+botR+(nBot>1?i*botSp:botSp/2);
    g+=`<circle cx="${bx}" cy="${botY}" r="${botR}" fill="#fbbf24" stroke="#d97706" stroke-width="0.8"/>`;
    if(i===0)g+=`<text x="${bx}" y="${botY+1}" fill="#000" font-size="${Math.max(6,botR*0.8)}" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono">${dBot}</text>`;
  }
  // top bars
  const topR=Math.max(3,dTop/2*scale*0.65);
  const topY=y0+cv+topR+2;
  const topSp=(bw-2*cv-2*topR)/(nTop-1||1);
  for(let i=0;i<nTop;i++){
    const bx=x0+cv+topR+(nTop>1?i*topSp:topSp/2);
    g+=`<circle cx="${bx}" cy="${topY}" r="${topR}" fill="#a78bfa" stroke="#7c3aed" stroke-width="0.8"/>`;
    if(i===0)g+=`<text x="${bx}" y="${topY+1}" fill="#fff" font-size="${Math.max(5,topR*0.8)}" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono">${dTop}</text>`;
  }
  // dimensions
  g+=`<line x1="${x0-8}" y1="${y0}" x2="${x0-8}" y2="${y0+dh}" stroke="#64748b" stroke-width="1"/>`;
  g+=`<text x="${x0-18}" y="${y0+dh/2}" fill="#64748b" font-size="10" text-anchor="middle" transform="rotate(-90,${x0-18},${y0+dh/2})" font-family="JetBrains Mono">D=${D}</text>`;
  g+=`<line x1="${x0}" y1="${y0+dh+8}" x2="${x0+bw}" y2="${y0+dh+8}" stroke="#64748b" stroke-width="1"/>`;
  g+=`<text x="${x0+bw/2}" y="${y0+dh+20}" fill="#64748b" font-size="10" text-anchor="middle" font-family="JetBrains Mono">b=${b}</text>`;
  // cover annotation
  g+=`<line x1="${x0+cv}" y1="${y0+dh-cv}" x2="${x0}" y2="${y0+dh}" stroke="rgba(250,204,21,0.6)" stroke-width="1"/>`;
  g+=`<text x="${x0+bw/2+20}" y="${y0+dh-cv+8}" fill="rgba(250,204,21,0.7)" font-size="9" font-family="JetBrains Mono">cover=${cover}mm</text>`;
  // legend
  g+=`<circle cx="${x0+bw+20}" cy="${y0+dh/3}" r="5" fill="#fbbf24"/>`;
  g+=`<text x="${x0+bw+30}" y="${y0+dh/3+4}" fill="#fbbf24" font-size="9" font-family="JetBrains Mono">${nBot}T${dBot} bot</text>`;
  g+=`<circle cx="${x0+bw+20}" cy="${y0+dh/3+18}" r="4" fill="#a78bfa"/>`;
  g+=`<text x="${x0+bw+30}" y="${y0+dh/3+22}" fill="#a78bfa" font-size="9" font-family="JetBrains Mono">${nTop}T${dTop} top</text>`;
  g+=`<text x="${x0+bw+14}" y="${y0+dh/3+36}" fill="#94a3b8" font-size="9" font-family="JetBrains Mono">T8@${sv2}</text>`;
  g+=`<text x="${W/2}" y="16" fill="#fb923c" font-size="11" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">BEAM CROSS SECTION (mm)</text>`;
  g+='</svg>';
  return`<div class="dg">${g}<div class="dg-cap">Fig: Reinforced concrete beam cross-section showing bar positions, cover, and stirrups</div></div>`;
}

// Column cross section

function svgColXS(size,nBars,dBar,cover){
  const W=240,H=240,sc=Math.min((W-50)/size,(H-50)/size)*0.85;
  const cs=size*sc,x0=W/2-cs/2,y0=W/2-cs/2;
  let g=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g+=`<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;
  g+=`<rect x="${x0}" y="${y0}" width="${cs}" height="${cs}" fill="#374151" stroke="#6b7280" stroke-width="2"/>`;
  for(let i=0;i<20;i++)g+=`<circle cx="${x0+8+Math.random()*(cs-16)}" cy="${y0+8+Math.random()*(cs-16)}" r="1.5" fill="rgba(150,150,150,0.25)"/>`;
  const cv=cover*sc;
  g+=`<rect x="${x0+cv}" y="${y0+cv}" width="${cs-2*cv}" height="${cs-2*cv}" fill="none" stroke="rgba(250,204,21,0.3)" stroke-width="1" stroke-dasharray="3,3"/>`;
  g+=`<rect x="${x0+cv+3}" y="${y0+cv+3}" width="${cs-2*cv-6}" height="${cs-2*cv-6}" fill="none" stroke="#64748b" stroke-width="${Math.max(1.2,8*sc/150)}"/>`;
  const barR=Math.max(3.5,dBar/2*sc*0.65);
  const bpos=[];
  const hc=cs-2*cv-6;
  if(nBars>=4){
    bpos.push([x0+cv+barR+3,y0+cv+barR+3],[x0+cs-cv-barR-3,y0+cv+barR+3],[x0+cv+barR+3,y0+cs-cv-barR-3],[x0+cs-cv-barR-3,y0+cs-cv-barR-3]);
    if(nBars>=6){const my=y0+cs/2;bpos.push([x0+cv+barR+3,my],[x0+cs-cv-barR-3,my]);}
    if(nBars>=8){const mx=x0+cs/2;bpos.splice(4,0,[mx,y0+cv+barR+3],[mx,y0+cs-cv-barR-3]);}
  }
  bpos.slice(0,nBars).forEach(([bx,by])=>{g+=`<circle cx="${bx}" cy="${by}" r="${barR}" fill="#34d399" stroke="#047857" stroke-width="0.8"/>`;g+=`<text x="${bx}" y="${by+1}" fill="#000" font-size="${Math.max(5,barR*0.75)}" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono">${dBar}</text>`;});
  g+=`<line x1="${x0-8}" y1="${y0}" x2="${x0-8}" y2="${y0+cs}" stroke="#64748b" stroke-width="1"/>`;
  g+=`<text x="${x0-18}" y="${y0+cs/2}" fill="#64748b" font-size="10" text-anchor="middle" transform="rotate(-90,${x0-18},${y0+cs/2})" font-family="JetBrains Mono">${size}</text>`;
  g+=`<line x1="${x0}" y1="${y0+cs+8}" x2="${x0+cs}" y2="${y0+cs+8}" stroke="#64748b" stroke-width="1"/>`;
  g+=`<text x="${x0+cs/2}" y="${y0+cs+20}" fill="#64748b" font-size="10" text-anchor="middle" font-family="JetBrains Mono">${size}mm</text>`;
  g+=`<text x="${W/2}" y="14" fill="#a78bfa" font-size="11" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">COLUMN CROSS SECTION</text>`;
  g+='</svg>';
  return`<div class="dg">${g}<div class="dg-cap">Fig: ${size}x${size}mm column  -  ${nBars} T${dBar} bars (green). Cover = ${cover}mm to tie.</div></div>`;
}

// Footing diagram (section + plan)

function svgFooting(Bf,colSize,D,dBar,sp){
  const W=460,H=230,sc=Math.min(180/(Bf*1000),(H-60)/D)*0.75;
  const fw=Bf*1000*sc,fh=D*sc,cx2=W/2-fw/2,cy2=20,csw=colSize*sc,csh=60;
  let g=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g+=`<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;
  // footing section
  g+=`<rect x="${cx2}" y="${cy2}" width="${fw}" height="${fh}" fill="#374151" stroke="#6b7280" stroke-width="2"/>`;
  // column stub
  g+=`<rect x="${W/2-csw/2}" y="${cy2-csh}" width="${csw}" height="${csh+4}" fill="#1e293b" stroke="#64748b" stroke-width="2"/>`;
  // rebar bottom
  const nr=Math.min(6,Math.floor(fw/30));
  for(let i=0;i<nr;i++){const bx=cx2+15+i*(fw-30)/(nr-1||1);g+=`<circle cx="${bx}" cy="${cy2+fh-15}" r="4" fill="#fbbf24" stroke="#d97706"/>`;} 
  // dimensions
  g+=`<line x1="${cx2}" y1="${cy2+fh+12}" x2="${cx2+fw}" y2="${cy2+fh+12}" stroke="#64748b" stroke-width="1"/>`;
  g+=`<text x="${W/2}" y="${cy2+fh+26}" fill="#64748b" font-size="11" text-anchor="middle" font-family="JetBrains Mono">B = ${Bf}m</text>`;
  g+=`<line x1="${cx2-12}" y1="${cy2}" x2="${cx2-12}" y2="${cy2+fh}" stroke="#64748b" stroke-width="1"/>`;
  g+=`<text x="${cx2-25}" y="${cy2+fh/2}" fill="#64748b" font-size="10" text-anchor="middle" transform="rotate(-90,${cx2-25},${cy2+fh/2})" font-family="JetBrains Mono">D=${D}mm</text>`;
  // critical sections
  const deff=D-75-8;
  const punchX=cx2+colSize*sc/2;
  // punching perim
  const pp=colSize*sc/2+deff*sc/2;
  g+=`<rect x="${W/2-pp}" y="${cy2}" width="${pp*2}" height="${fh}" fill="none" stroke="rgba(248,113,113,0.4)" stroke-width="1.5" stroke-dasharray="5,3"/>`;
  g+=`<text x="${W/2+pp+4}" y="${cy2+20}" fill="#f87171" font-size="9" font-family="JetBrains Mono">d/2 from col</text>`;
  g+=`<text x="${W/2+pp+4}" y="${cy2+30}" fill="#f87171" font-size="9" font-family="JetBrains Mono">(punching)</text>`;
  // one-way critical
  const owX=cx2+colSize*sc/2+deff*sc;
  g+=`<line x1="${W/2+owX-W/2}" y1="${cy2}" x2="${W/2+owX-W/2}" y2="${cy2+fh}" stroke="rgba(56,189,248,0.5)" stroke-width="1.5" stroke-dasharray="4,3"/>`;
  g+=`<text x="${W/2+owX-W/2+4}" y="${cy2+fh-10}" fill="#38bdf8" font-size="9" font-family="JetBrains Mono">d from col</text>`;
  g+=`<text x="${W/2+owX-W/2+4}" y="${cy2+fh}" fill="#38bdf8" font-size="9" font-family="JetBrains Mono">(one-way)</text>`;
  // cover annotation
  g+=`<line x1="${cx2+fw-8}" y1="${cy2+fh}" x2="${cx2+fw-8}" y2="${cy2+fh-15}" stroke="rgba(250,204,21,0.7)" stroke-width="1.5"/>`;
  g+=`<text x="${cx2+fw-10}" y="${cy2+fh-18}" fill="rgba(250,204,21,0.8)" font-size="9" text-anchor="end" font-family="JetBrains Mono">75mm cover</text>`;
  // legend
  g+=`<line x1="10" y1="${H-30}" x2="25" y2="${H-30}" stroke="#f87171" stroke-width="1.5" stroke-dasharray="5,3"/>`;
  g+=`<text x="28" y="${H-26}" fill="#f87171" font-size="9" font-family="JetBrains Mono">Punching critical</text>`;
  g+=`<line x1="10" y1="${H-15}" x2="25" y2="${H-15}" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,3"/>`;
  g+=`<text x="28" y="${H-11}" fill="#38bdf8" font-size="9" font-family="JetBrains Mono">One-way shear critical</text>`;
  g+=`<text x="${W/2}" y="${H-2}" fill="#facc15" font-size="10" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">FOOTING SECTION  -  Critical shear planes shown</text>`;
  g+='</svg>';
  return`<div class="dg">${g}<div class="dg-cap">Fig: Footing section showing critical planes for punching shear (red dashed, at d/2 from col face) and one-way shear (blue dashed, at d from col face). Bars (yellow dots) at 75mm cover from bottom.</div></div>`;
}

// Slab panel with reinforcement layout

function svgSlabPanel(lx,ly,sp_x,sp_y,twoWay){
  const W=420,H=280,pad=50;
  const pw=W-2*pad,ph=H-2*pad;
  let g=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g+=`<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;
  // slab panel
  g+=`<rect x="${pad}" y="${pad}" width="${pw}" height="${ph}" fill="#374151" stroke="#6b7280" stroke-width="2.5"/>`;
  // X bars (main - orange)
  const nx=Math.min(10,Math.floor(ph*0.9/20));
  for(let i=1;i<=nx;i++){const by2=pad+i*ph/(nx+1);g+=`<line x1="${pad+5}" y1="${by2}" x2="${pad+pw-5}" y2="${by2}" stroke="#fb923c" stroke-width="2.5" opacity="0.8"/>`;}
  // Y bars (dist - blue)
  const ny=Math.min(8,Math.floor(pw*0.9/25));
  for(let i=1;i<=ny;i++){const bx2=pad+i*pw/(ny+1);g+=`<line x1="${bx2}" y1="${pad+5}" x2="${bx2}" y2="${pad+ph-5}" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="${twoWay?'':'4,4'}" opacity="0.7"/>`;}
  // Span labels
  g+=`<line x1="${pad}" y1="${H-12}" x2="${pad+pw}" y2="${H-12}" stroke="#64748b" stroke-width="1"/>`;
  g+=`<text x="${W/2}" y="${H-4}" fill="#64748b" font-size="10" text-anchor="middle" font-family="JetBrains Mono">lx = ${lx}m ${twoWay?'(shorter span)':''}</text>`;
  g+=`<text x="${pad-18}" y="${pad+ph/2}" fill="#64748b" font-size="10" text-anchor="middle" transform="rotate(-90,${pad-18},${pad+ph/2})" font-family="JetBrains Mono">ly = ${ly}m</text>`;
  // Legend
  g+=`<line x1="${W-110}" y1="14" x2="${W-90}" y2="14" stroke="#fb923c" stroke-width="2.5"/>`;
  g+=`<text x="${W-86}" y="18" fill="#fb923c" font-size="9" font-family="JetBrains Mono">T10@${sp_x} (main)</text>`;
  g+=`<line x1="${W-110}" y1="28" x2="${W-90}" y2="28" stroke="#38bdf8" stroke-width="1.8" ${twoWay?'':'stroke-dasharray="4,4"'}/>`;
  g+=`<text x="${W-86}" y="32" fill="#38bdf8" font-size="9" font-family="JetBrains Mono">T8@${sp_y} (${twoWay?'Y-dir':'dist'})</text>`;
  g+=`<text x="${W/2}" y="16" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">${twoWay?'TWO-WAY':'ONE-WAY'} SLAB  -  Bottom Reinforcement</text>`;
  g+='</svg>';
  return`<div class="dg">${g}<div class="dg-cap">Fig: Slab panel showing bottom reinforcement layout. Orange = main bars (along shorter span lx). Blue = ${twoWay?'Y-direction bars':'distribution bars'}. Top steel (not shown) to be placed at supports.</div></div>`;
}

// Confinement zone diagram for column (IS 13920)

function svgConfinement(D,Lo,tieSp,tieSp_conf,floorHt){
  const W=180,H=300,sc=H*0.8/(floorHt*1000),x0=50,cw=60;
  let g=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g+=`<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;
  const ht=floorHt*1000*sc,top=20,bot=top+ht;
  g+=`<rect x="${x0}" y="${top}" width="${cw}" height="${ht}" fill="#374151" stroke="#6b7280" stroke-width="1.5"/>`;
  // confinement zones (top and bottom)
  const Lop=Lo*sc;
  g+=`<rect x="${x0}" y="${top}" width="${cw}" height="${Lop}" fill="rgba(248,113,113,0.15)" stroke="#f87171" stroke-width="1.5"/>`;
  g+=`<rect x="${x0}" y="${bot-Lop}" width="${cw}" height="${Lop}" fill="rgba(248,113,113,0.15)" stroke="#f87171" stroke-width="1.5"/>`;
  // close ties in confinement
  const nConf=Math.floor(Lop/(tieSp_conf*sc));
  for(let i=0;i<=nConf;i++)g+=`<line x1="${x0}" y1="${top+i*tieSp_conf*sc}" x2="${x0+cw}" y2="${top+i*tieSp_conf*sc}" stroke="#f87171" stroke-width="1.2"/>`;
  const nConf2=Math.floor(Lop/(tieSp_conf*sc));
  for(let i=0;i<=nConf2;i++)g+=`<line x1="${x0}" y1="${bot-Lop+i*tieSp_conf*sc}" x2="${x0+cw}" y2="${bot-Lop+i*tieSp_conf*sc}" stroke="#f87171" stroke-width="1.2"/>`;
  // general zone ties
  const midTop=top+Lop,midBot=bot-Lop;
  const nMid=Math.floor((midBot-midTop)/(tieSp*sc));
  for(let i=0;i<=nMid;i++)g+=`<line x1="${x0}" y1="${midTop+i*(midBot-midTop)/(nMid||1)}" x2="${x0+cw}" y2="${midTop+i*(midBot-midTop)/(nMid||1)}" stroke="#94a3b8" stroke-width="0.8"/>`;
  // labels
  g+=`<text x="${x0+cw+6}" y="${top+Lop/2}" fill="#f87171" font-size="9" font-family="JetBrains Mono">Lo=${r0(Lo)}mm</text>`;
  g+=`<text x="${x0+cw+6}" y="${top+Lop/2+12}" fill="#f87171" font-size="9" font-family="JetBrains Mono">@${tieSp_conf}mm</text>`;
  g+=`<text x="${x0+cw+6}" y="${(top+Lop+bot-Lop)/2}" fill="#94a3b8" font-size="9" font-family="JetBrains Mono">@${tieSp}mm</text>`;
  g+=`<text x="${x0+cw+6}" y="${bot-Lop/2}" fill="#f87171" font-size="9" font-family="JetBrains Mono">Lo=${r0(Lo)}mm</text>`;
  g+=`<text x="${x0+cw+6}" y="${bot-Lop/2+12}" fill="#f87171" font-size="9" font-family="JetBrains Mono">@${tieSp_conf}mm</text>`;
  // title
  g+=`<text x="${W/2}" y="13" fill="#a78bfa" font-size="9" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">IS 13920 CONFINEMENT</text>`;
  g+='</svg>';
  return`<div class="dg" style="max-width:200px">${g}<div class="dg-cap">Fig: Column elevation. Red zones = confinement (dense ties). Grey = general zone.</div></div>`;
}

// Seismic inverted triangle distribution

function svgSeismicDist(floors2){
  const W=300,H=260,pad=40,bh=(H-2*pad)/floors2.length;
  const maxQ=Math.max(...floors2.map(f=>f.Qi));
  let g=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g+=`<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;
  // floor lines & force arrows
  floors2.slice().reverse().forEach((f,i)=>{
    const fy2=pad+i*bh;
    g+=`<line x1="${pad}" y1="${fy2}" x2="${W-pad}" y2="${fy2}" stroke="#64748b" stroke-width="1.5"/>`;
    const fw2=Math.max(8,(f.Qi/maxQ)*(W-pad-80));
    g+=`<rect x="${pad}" y="${fy2+3}" width="${fw2}" height="${bh-6}" fill="rgba(52,211,153,0.25)" stroke="#34d399" stroke-width="1.2" rx="2"/>`;
    g+=`<text x="${pad+fw2+4}" y="${fy2+bh/2+4}" fill="#34d399" font-size="9" font-family="JetBrains Mono">${r2(f.Qi)}kN</text>`;
    g+=`<text x="${pad-4}" y="${fy2+bh/2+4}" fill="#94a3b8" font-size="9" text-anchor="end" font-family="JetBrains Mono">F${f.floor}</text>`;
  });
  // base
  g+=`<line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="#f87171" stroke-width="2.5"/>`;
  g+=`<text x="${W/2}" y="${H-pad+14}" fill="#f87171" font-size="10" text-anchor="middle" font-family="JetBrains Mono">Base shear Vb = ${r2(floors2[0]?.Vi||0)} kN</text>`;
  g+=`<text x="${W/2}" y="13" fill="#34d399" font-size="10" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">SEISMIC FORCE DISTRIBUTION</text>`;
  g+='</svg>';
  return`<div class="dg">${g}<div class="dg-cap">Fig: IS 1893 Cl 7.6  -  Higher floors get more seismic force (inverted triangle). Top floor has max force, ground storey has max storey shear.</div></div>`;
}

// =======================================================
// FULL CALCULATION ENGINE (same as before, compact)
// =======================================================

// == 03_calc.js ==

// ================================================================
// MODULE: 03_calc
// Core calculation engine (simple grid)
// ================================================================



function runCalcs(){
  S.buildingL=S.spansX.reduce((a,b)=>a+b,0);
  S.buildingW=S.spansY.reduce((a,b)=>a+b,0);
  const{fck,fy,Es,numFloors,floorHt,spansX,spansY,udlLL,floorFinish,partitions,
        wallLoad,slabThk,coverSlab,coverBeam,coverCol,coverFtg,soilBearing,ftgDepth,
        zone,soilType,importance,terrain,windZone,buildingL,buildingW}=S;
  // Materials
  const Ec=5000*Math.sqrt(fck),fcd=0.446*fck,fyd=fy/1.15;
  // IS 456 Cl 38.1 — limiting xu_max/d depends on steel grade
  // Fe250: 0.531, Fe415: 0.48, Fe500: 0.46. Formula uses εcu=0.0035 and εsu=0.87fy/Es+0.002 (HYSD)
  const xu_d = fy>=500 ? 0.46 : fy>=415 ? 0.48 : 0.531;
  const Mf=0.36*xu_d*(1-0.42*xu_d);
  // Slab
  const lx=Math.min(...spansX,...spansY),ly=Math.max(...spansX,...spansY);
  const ratio=ly/lx,twoWay=ratio<2;
  const slabD=Math.max(slabThk,Math.ceil(lx*1000/26/5)*5,125);
  const slabd=slabD-coverSlab-5;
  const DL_sl=slabD/1000*25,DL_tot=DL_sl+floorFinish+partitions;
  const wu_sl=1.5*(DL_sl+floorFinish+partitions+udlLL);
  let Mx=0,My=0,ax=0,ay=0;
  if(twoWay){ax=clamp(0.062+(ratio-1)*0.012,0.04,0.099);ay=clamp(0.062/ratio/ratio,0.02,0.062);Mx=ax*wu_sl*lx*lx;My=ay*wu_sl*lx*lx;}
  else{Mx=wu_sl*lx*lx/8;My=0.26*Mx;}
  const Ast=(Mu,b,d)=>{
    // IS 456 Annex G.1.1(b) — exact closed form
    const Astmin = 0.12*b*d/100;
    if(Mu<=0) return Astmin;
    const factor = 4.598 * Mu * 1e6 / (fck * b * d * d);
    if(factor >= 1) return Math.max(Mf*fck*b*d/(0.87*fy), Astmin);
    let A = 0.5 * fck * b * d / fy * (1 - Math.sqrt(1 - factor));
    if(isNaN(A)||A<0) A = 200;
    return Math.max(A, Astmin);
  }
  const Mulim_sl=Mf*fck*1000*slabd*slabd/1e6;
  const Ax=Ast(Mx,1000,slabd),Ay=Math.max(Ast(My,1000,slabd),0.12*1000*slabD/100);
  const Ax_neg=Ast(Mx*0.8,1000,slabd)*0.5;
  const spx=clamp(Math.floor(1000*PI*25/Ax),75,Math.min(3*slabD,300));
  const spy=clamp(Math.floor(1000*PI*16/Ay),75,300);
  const spx_n=clamp(Math.floor(1000*PI*16/Math.max(Ax_neg,180)),75,300);
  // Seismic — IS 1893:2016
  const ZM={II:0.10,III:0.16,IV:0.24,V:0.36},Z=ZM[zone]||0.24,I=importance,R=5;
  const H=numFloors*floorHt,db=buildingW;
  const Ta=0.09*H/Math.sqrt(db);
  // IS 1893:2016 Cl 6.4.5 — proper Sa/g per soil type (no separate sf factor)
  let Sa;
  if(Ta<=0.10){ Sa=1+15*Ta; }
  else if(soilType==='I'){      Sa = Ta<=0.40 ? 2.5 : 1.00/Ta; }
  else if(soilType==='III'){    Sa = Ta<=0.67 ? 2.5 : 1.67/Ta; }
  else{                          Sa = Ta<=0.55 ? 2.5 : 1.36/Ta; }
  const sf=1.0;
  const Ah=(Z/2)*(Sa/R)*I;
  const fa=buildingL*buildingW;
  // IS 1893:2016 Table 8 imposed-load fraction
  const llF = udlLL > 3 ? 0.5 : 0.25;
  const Wf=DL_tot*fa+llF*udlLL*fa+wallLoad*2*(buildingL+buildingW);
  const Wf_roof=DL_tot*fa+llF*udlLL*fa;   // no wall above roof
  const Wt=Wf*(numFloors-1)+Wf_roof;
  const Vb=Ah*Wt;
  const floors=[];
  for(let i=1;i<=numFloors;i++){const hi=i*floorHt;const Wi=(i===numFloors)?Wf_roof:Wf;floors.push({floor:i,h:hi,W:Wi,Wh2:Wi*hi*hi});}
  const sWh=floors.reduce((a,f)=>a+f.Wh2,0);
  floors.forEach(f=>{f.Qi=sWh>0?Vb*f.Wh2/sWh:0;});
  let cs=0;for(let i=floors.length-1;i>=0;i--){cs+=floors[i].Qi;floors[i].Vi=cs;}
  // Wind
  const VbW={I:33,II:39,III:44,IV:47,V:50,VI:55}[windZone]||47;
  const k2={'1':1.05,'2':0.98,'3':0.91}[terrain]||0.98;
  const Vz=VbW*k2,pz=0.6*Vz*Vz/1000,Fw=(0.8+0.5)*pz;
  // Beams
  const dBeam=(L,trib,edge)=>{
    const b=Math.max(200,Math.ceil(L*1000/14/25)*25);
    let D=Math.max(200,Math.ceil(L*1000/12/25)*25);
    const wslab=(DL_sl+floorFinish+partitions+udlLL)*trib;
    const ww=edge?wallLoad:0;
    const bD=20,bA=PI*100;
    const Asv=2*PI*16;
    const tcmax=0.62*Math.sqrt(fck);
    const tbl=[[0.15,0.28],[0.25,0.36],[0.50,0.48],[0.75,0.56],[1.00,0.62],[1.25,0.67],[1.50,0.72],[1.75,0.75],[2.00,0.79],[2.50,0.82]];
    const Ld=devLength(bD, fy, fck);
    // Auto-increase D until singly reinforced (recalc wu each step since SW changes)
    while(D<1200){
      const dTry=D-coverBeam-8-10;
      const wuTry=1.5*(wslab+(b/1000)*(D/1000)*25+ww);
      const MmaxTry=wuTry*L*L/8;
      if(MmaxTry<=Mf*fck*b*dTry*dTry/1e6)break;
      D+=25;
    }
    const wsw=(b/1000)*(D/1000)*25;
    const wu=1.5*(wslab+wsw+ww);
    const RA=wu*L/2,Mmax=wu*L*L/8,Msup=wu*L*L/12;
    const d=D-coverBeam-8-10;
    const Mulim=Mf*fck*b*d*d/1e6;
    let Am=Math.max(Ast(Mmax,b,d),0.85*b*d/fy);
    let As=Math.max(Ast(Msup,b,d),0.85*b*d/fy);
    let nm=Math.max(2,Math.ceil(Am/bA));
    let ns=Math.max(2,Math.ceil(As/bA));
    let Ap=nm*bA;
    const pt=Ap/(b*d)*100;
    let tc=0.28;
    for(let j=0;j<tbl.length-1;j++){
      if(pt>=tbl[j][0]&&pt<tbl[j+1][0]){
        tc=tbl[j][1]+(pt-tbl[j][0])*(tbl[j+1][1]-tbl[j][1])/(tbl[j+1][0]-tbl[j][0]);
        break;
      }
    }
    const tv=RA*1000/(b*d);
    const svMid=tv>tc?clamp(Math.floor(0.87*fy*Asv/((tv-tc)*b)),75,clamp(Math.floor(0.75*d),75,300)):clamp(Math.floor(0.75*d),75,300);
    const svEnd=Math.min(Math.floor(d/4),Math.floor(8*bD),100);
    const EI=(Ec*(0.35*b*D*D*D/12))/1e12;        // effective EI
    const ws=(wslab+wsw+ww);                       // service load (unfactored)
    const dfl=1.6*5*ws*Math.pow(L,4)/(384*EI);     // include creep factor 1.6
    const dall=L*1000/250;
    return{L,b,D,d,wu,RA,Mmax,Msup,Mulim,singly:true,
      Am,As2:As,nm,ns,Ap,Ast2:0,n2:0,
      tv,tc,tcmax,sv:svMid,svd:svEnd,
      dfl,dall,deflOK:dfl<=dall,shearSafe:tv<=tcmax,
      EI,Ld,pt,wslab,wsw,ww,trib};
  }
  const beams=[];
  spansX.forEach((L,i)=>{const tw=(i===0||i===spansX.length-1)?spansY.reduce((a,b)=>a+b,0)/spansY.length/2:spansY.reduce((a,b)=>a+b,0)/spansY.length;beams.push({...dBeam(L,tw,i===0||i===spansX.length-1),label:`Beam MB${i+1} (X, Bay ${i+1})`,dir:'X',bay:i+1});});
  spansY.forEach((L,i)=>{const tw=spansX.reduce((a,b)=>a+b,0)/spansX.length/2;beams.push({...dBeam(L,tw,true),label:`Beam SB${i+1} (Y, Bay ${i+1})`,dir:'Y',bay:i+1});});
  // Columns
  const dCol=(fls,corner,edge,inter)=>{
    const sx=spansX[0]||4,sy=spansY[0]||3;
    const ta=corner?sx*sy/4:edge?sx*sy/2:sx*sy;
    const Ps=fls*(DL_tot*ta+udlLL*ta*0.25+wallLoad*(corner?sx/2:sx));
    const Pu2=1.5*Ps;
    const size=Math.max(300,Math.ceil(Math.sqrt(Pu2*1000/(0.4*fck+0.01*(0.67*fy-0.4*fck)))/25)*25);
    const Ag=size*size,leff=0.65*floorHt*1000,lex=leff/size,short=lex<=12;
    const emin=Math.max(floorHt*1000/500+size/30,20);
    const Ar=Math.max(0.008*Ag,(Pu2*1000-0.4*fck*Ag)/(0.67*fy-0.4*fck));
    const Af=clamp(Ar,0.008*Ag,0.04*Ag);
    const dB=16,dBA=PI*64;
    const nb=Math.max(4,Math.ceil(Af/dBA)),Aprov=nb*dBA;
    const Pcap=(0.4*fck*(Ag-Aprov)+0.67*fy*Aprov)/1000;
    const td=Math.max(8,Math.ceil(dB/4)),ts=Math.min(size,16*dB,300);
    const Lo=Math.max(size,floorHt*1000/6,450),tsc=Math.min(ts,8*dB,100,75);
    return{Ps,Pu:Pu2,Pcap,size,Ag,leff,lex,short,emin,Ar,Af,Aprov,pt:Aprov/Ag*100,nb,dB,td,ts,tsc,Lo,safe:Pu2<=Pcap,ta,corner,edge,inter};
  }
  const cols=[];
  for(let f=numFloors;f>=1;f--){
    cols.push({floor:f,label:`Corner Col CC-${f}`,...dCol(f,true,false,false)});
    cols.push({floor:f,label:`Edge Col EC-${f}`,...dCol(f,false,true,false)});
    cols.push({floor:f,label:`Int. Col IC-${f}`,...dCol(f,false,false,true)});
  }
  // Footings
  const dFtg=(Ps,cs2,lbl)=>{
    const qn=Math.max(80,soilBearing-ftgDepth*18);
    const Bf2=Math.ceil(Math.sqrt(Ps/qn)*100)/100;
    const qu2=Ps/(Bf2*Bf2),quf=qu2*1.5;
    const dprel=(Bf2*1000-cs2)/4;
    const D2auto=Math.ceil((dprel+coverFtg+8)/25)*25;
    const D2=S.ftgMinD>0?Math.max(D2auto,S.ftgMinD):D2auto;
    const d2=D2-coverFtg-8;
    const bo=4*(cs2+d2);
    const Pu3=Ps*1.5;
    const Vpu=Pu3-quf*(cs2/1000+d2/1000)*(cs2/1000+d2/1000);
    const tvp=Vpu*1000/(bo*d2),tcp=0.25*Math.sqrt(fck);
    const proj=Math.max(0,(Bf2*1000-cs2)/2-d2);
    const Vow=quf*Bf2*proj/1000;
    const tvow=Vow*1000/(Bf2*1000*d2),tcow=0.36;
    const x2=(Bf2-cs2/1000)/2;
    const Mu2=quf*Bf2*x2*x2/2;
    const Af2=Math.max(Ast(Mu2,Bf2*1000,d2),0.12*Bf2*1000*D2/100);
    const dBf=12,dBfA=PI*36;
    const spf=Math.min(Math.floor(Bf2*1000*dBfA/Af2/Bf2),300);
    const Ldr=devLength(dBf, fy, fck, {hook:true});  // standard 90° hook reduction
    const Lda=(Bf2*1000-cs2)/2-coverFtg;
    const Pa=0.45*fck*cs2*cs2/1000;
    return{Ps,qu:qu2,quf,Bf:Bf2,D:D2,d:d2,bo,Vpu,tvp,tcp,punch_ok:tvp<=tcp,
      Vow,tvow,tcow,ow_ok:tvow<=tcow,Mu:Mu2,Af:Af2,dBf,spf,Ldr,Lda,Ld_ok:Lda>=Ldr,Pa,tr_ok:Ps<=Pa,lbl,col:cs2};
  }
  const cc=cols.find(c=>c.floor===1&&c.corner)||cols[0];
  const ec=cols.find(c=>c.floor===1&&c.edge)||cols[1];
  const ic=cols.find(c=>c.floor===1&&c.inter)||cols[2];
  const ftgs=[dFtg(cc.Ps,cc.size,'Corner Footing CF'),dFtg(ec.Ps,ec.size,'Edge Footing EF'),dFtg(ic.Ps,ic.size,'Interior Footing IF')];
  // Stair
  const riser=165,tread=270,ss=1.5,wD=150,wd=wD-coverSlab-5;
  const DLst=wD/1000*25+(riser/2/1000)*25+floorFinish,wust=1.5*(DLst+3.0);
  const Mst=wust*ss*ss/8,Ast2=Ast(Mst,1000,wd);
  const stsp=clamp(Math.floor(1000*PI*25/Ast2),75,200);
  return{mat:{Ec,fcd,fyd,Mf},
    slab:{lx,ly,ratio,twoWay,slabD,slabd,DL_sl,wu_sl,Mx,My,ax,ay,Mulim:Mulim_sl,
          Ax,Ay,spx,spy,spx_n,ok:Mx<=Mulim_sl,ld_ok:lx*1000/slabd<=26},
    seis:{Z,I,R,sf,Ta,Sa,Ah,Wt,Vb,floors},
    wind:{VbW,k2,Vz,pz,Fw},
    beams,cols,ftgs,
    stair:{riser,tread,ss,wD,wd,DLst,wust,Mst,Ast2,stsp}};
}
// =======================================================
// NAVIGATION & PAGE SYSTEM
// =======================================================

// == 04_grid.js ==

// ================================================================
// MODULE: 04_grid  —  Building Plan Editor v2
// Complete redesign: sidebar tools, click-to-select, context panel,
// right-click menu, secondary beams by drag, open areas, joint types
// ================================================================

let GRID = null;

// ── GRID INITIALISATION ─────────────────────────────────────────
function initGrid() {
  const nx = S.spansX.length, ny = S.spansY.length;
  const nodes = [], beams = [], bays = [];

  for (let r = 0; r <= ny; r++) {
    for (let c = 0; c <= nx; c++) {
      nodes.push({
        id: r*(nx+1)+c, row: r, col: c,
        hasColumn: true, isWall: false,
        colSize: null,    // null = use global S.colSize
        label: '',
      });
    }
  }

  let beamId = 0;
  // X beams
  for (let r = 0; r <= ny; r++) {
    for (let c = 0; c < nx; c++) {
      const n1 = r*(nx+1)+c, n2 = r*(nx+1)+c+1;
      beams.push({
        id: beamId++, dir:'X', n1, n2, row:r, col:c, L:S.spansX[c],
        endLeft:'column', endRight:'column',
        isSecondary:false, isCantilever:false, isTransfer:false,
        endCondOverride: null,  // null=auto | 'continuous'|'pinned'|'fixed'|'free'
        customWu: null,
      });
    }
  }
  // Y beams
  for (let c = 0; c <= nx; c++) {
    for (let r = 0; r < ny; r++) {
      const n1 = r*(nx+1)+c, n2 = (r+1)*(nx+1)+c;
      beams.push({
        id: beamId++, dir:'Y', n1, n2, row:r, col:c, L:S.spansY[r],
        endLeft:'column', endRight:'column',
        isSecondary:false, isCantilever:false, isTransfer:false,
        endCondOverride: null,
        customWu: null,
      });
    }
  }
  // Bays
  for (let r = 0; r < ny; r++) {
    for (let c = 0; c < nx; c++) {
      bays.push({
        row:r, col:c,
        type:'slab',   // 'slab'|'void'|'opening'|'courtyard'|'staircase'
        lx:Math.min(S.spansX[c],S.spansY[r]),
        ly:Math.max(S.spansX[c],S.spansY[r]),
      });
    }
  }

  GRID = { nodes, beams, bays, nx, ny };
  GE.selected = null;
  return GRID;
}

// ── HELPER QUERIES ──────────────────────────────────────────────
function getNode(r,c){return GRID&&GRID.nodes.find(n=>n.row===r&&n.col===c);}
function getBay(r,c){return GRID&&GRID.bays.find(b=>b.row===r&&b.col===c);}

function updateTransferBeams() {
  if(!GRID)return;
  GRID.beams.forEach(b=>{
    const n1=GRID.nodes[b.n1],n2=GRID.nodes[b.n2];
    if(!n1||!n2)return;
    b.isTransfer=(!n1.hasColumn&&!n1.isWall)||(!n2.hasColumn&&!n2.isWall);
  });
}

function autoEndConditions(beam) {
  if(!GRID)return;
  const n1=GRID.nodes[beam.n1],n2=GRID.nodes[beam.n2];
  if(!n1||!n2)return;
  if(beam.endCondOverride){
    // User has explicitly set end conditions — respect override
    if(beam.endCondOverride==='continuous'){beam.endLeft='column';beam.endRight='column';}
    else if(beam.endCondOverride==='pinned'){beam.endLeft='wall';beam.endRight='wall';}
    else if(beam.endCondOverride==='left_pinned'){beam.endLeft='wall';beam.endRight='column';}
    else if(beam.endCondOverride==='right_pinned'){beam.endLeft='column';beam.endRight='wall';}
    else if(beam.endCondOverride==='free'){beam.endLeft='free';beam.endRight='free';}
    return;
  }
  beam.endLeft  = n1.hasColumn?'column':n1.isWall?'wall':'free';
  beam.endRight = n2.hasColumn?'column':n2.isWall?'wall':'free';
}

function getMomentCoeffs(beam) {
  const el=beam.endLeft,er=beam.endRight;
  if(beam.isCantilever)return{alpha_mid:0,alpha_sup_free:0.5,alpha_sup_fixed:0,type:'cantilever',label:'Cantilever'};
  const lc=el==='column',rc=er==='column';
  if(lc&&rc)return{alpha_mid:1/16,alpha_sup:1/12,type:'both_continuous',label:'Both ends continuous (IS 456 T12: alpha=1/16 midspan, 1/12 at supports)'};
  if(lc||rc)return{alpha_mid:1/10,alpha_sup:1/10,type:'one_continuous',label:'One end continuous (IS 456 T12: alpha=1/10 midspan, 1/10 at support)'};
  return{alpha_mid:1/8,alpha_sup:0,type:'simply_supported',label:'Simply supported (Mu = wL^2/8)'};
}

function _edgeIsContinuous(dir,row,col){
  if(!GRID)return false;
  const b=GRID.beams.find(bm=>bm.dir===dir&&bm.row===row&&bm.col===col);
  return b&&b.endLeft==='column'&&b.endRight==='column';
}

function getSlabCase(bay){
  if(!GRID)return 9;
  const r=bay.row,c=bay.col;
  const topCont   = r>0&&_edgeIsContinuous('X',r,c);
  const bottomCont= r<GRID.ny-1&&_edgeIsContinuous('X',r+1,c);
  const leftCont  = c>0&&_edgeIsContinuous('Y',r,c);
  const rightCont = c<GRID.nx-1&&_edgeIsContinuous('Y',r,c+1);
  const disc=4-[topCont,bottomCont,leftCont,rightCont].filter(Boolean).length;
  if(disc===0)return 1;
  if(disc===1)return(!topCont||!bottomCont)?2:3;
  if(disc===2)return((!topCont&&!bottomCont)||(!leftCont&&!rightCont))?5:4;
  if(disc===3)return 7;
  return 9;
}

function getEffectiveSpan(beam){return beam.L;}

function getTribWidth(beam){
  if(!GRID)return(S.spansY.reduce((a,b)=>a+b,0)/S.spansY.length/2);
  let trib=0;
  // Check if a secondary beam exists parallel to this beam in an adjacent bay
  // If yes, that secondary beam takes half the tributary — primary gets less load
  function secBeamSplits(bayRow,bayCol,perpDir){
    return GRID.beams.some(b=>b.isSecondary&&b.dir===perpDir&&
      b.row===bayRow&&b.col===bayCol);
  }
  if(beam.dir==='X'){
    const ba=getBay(beam.row-1,beam.col);
    const bb=getBay(beam.row,beam.col);
    // Above bay: full half-span, reduced by 0.5 if secondary Y-beam runs through it
    if(ba&&ba.type==='slab'){
      const factor=secBeamSplits(beam.row-1,beam.col,'X')?0.5:1.0;
      trib+=S.spansY[beam.row-1]/2*factor;
    }
    // Below bay
    if(bb&&bb.type==='slab'){
      const factor=secBeamSplits(beam.row,beam.col,'X')?0.5:1.0;
      trib+=S.spansY[beam.row]/2*factor;
    }
  }else{
    const bl=getBay(beam.row,beam.col-1);
    const br=getBay(beam.row,beam.col);
    if(bl&&bl.type==='slab'){
      const factor=secBeamSplits(beam.row,beam.col-1,'Y')?0.5:1.0;
      trib+=S.spansX[beam.col-1]/2*factor;
    }
    if(br&&br.type==='slab'){
      const factor=secBeamSplits(beam.row,beam.col,'Y')?0.5:1.0;
      trib+=S.spansX[beam.col]/2*factor;
    }
  }
  return Math.max(trib,0.5);
}

function getBeamWu(beam,DL_tot,udlLL,wallLoad){
  if(beam.customWu!==null)return beam.customWu;
  const trib=getTribWidth(beam);
  const wslab=(DL_tot+udlLL)*trib;
  const wsw=(beam.b||230)/1000*(beam.D||350)/1000*25;
  const isPerim=(beam.dir==='X'&&(beam.row===0||beam.row===GRID.ny))||
                (beam.dir==='Y'&&(beam.col===0||beam.col===GRID.nx));
  const wwall=isPerim?wallLoad:0;
  return 1.5*(wslab+wsw+wwall);
}

// ── EDITOR STATE ─────────────────────────────────────────────────
let GE = {
  mode: 'select',
  selected: null,       // {type:'node'|'beam'|'bay', id, ...}
  dragSecStart: null,   // for secondary beam drag
  contextMenu: null,
  showDims: true,
  showCase: true,
  zoom: 1,
};

// ── CANVAS LAYOUT ────────────────────────────────────────────────
const CANVAS_W=760, CANVAS_H=480;
const PAD={l:60,r:20,t:50,b:50};

function getCanvasCoords(){
  if(!GRID)return{xs:[],ys:[]};
  const pw=CANVAS_W-PAD.l-PAD.r, ph=CANVAS_H-PAD.t-PAD.b;
  const totalX=S.spansX.reduce((a,b)=>a+b,0);
  const totalY=S.spansY.reduce((a,b)=>a+b,0);
  let xs=[PAD.l];
  S.spansX.forEach(s=>xs.push(xs[xs.length-1]+s/totalX*pw));
  let ys=[PAD.t];
  S.spansY.forEach(s=>ys.push(ys[ys.length-1]+s/totalY*ph));
  return{xs,ys,pw,ph,totalX,totalY};
}

function nodeCanvas(node){
  const{xs,ys}=getCanvasCoords();
  return{x:xs[node.col],y:ys[node.row]};
}

// ── BAY FILL STYLES ──────────────────────────────────────────────
const BAY_STYLES={
  slab:      {fill:'rgba(56,189,248,0.06)',hatch:null,label:null,labelColor:null},
  void:      {fill:'rgba(10,15,30,0.9)',hatch:'rgba(100,116,139,0.3)',label:'VOID',labelColor:'#64748b'},
  opening:   {fill:'rgba(248,113,113,0.08)',hatch:'rgba(248,113,113,0.25)',label:'OPENING',labelColor:'#f87171'},
  courtyard: {fill:'rgba(16,185,129,0.08)',hatch:'rgba(16,185,129,0.2)',label:'COURTYARD',labelColor:'#34d399'},
  staircase: {fill:'rgba(245,158,11,0.1)',hatch:'rgba(245,158,11,0.2)',label:'STAIR',labelColor:'#f59e0b'},
};
const BAY_TYPES=['slab','void','opening','courtyard','staircase'];

// ── DRAWING ──────────────────────────────────────────────────────
function drawGrid(canvas){
  if(!canvas||!GRID)return;
  const ctx=canvas.getContext('2d');
  const{xs,ys}=getCanvasCoords();
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Background
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,canvas.width,canvas.height);

  // ── BAY FILLS ─────────────────────────────────────────────────
  GRID.bays.forEach(bay=>{
    const x0=xs[bay.col],y0=ys[bay.row],x1=xs[bay.col+1],y1=ys[bay.row+1];
    const st=BAY_STYLES[bay.type]||BAY_STYLES.slab;
    const isSelected=GE.selected&&GE.selected.type==='bay'&&GE.selected.row===bay.row&&GE.selected.col===bay.col;

    ctx.fillStyle=st.fill;
    ctx.fillRect(x0,y0,x1-x0,y1-y0);

    // Hatch for non-slab types
    if(st.hatch){
      ctx.save();ctx.strokeStyle=st.hatch;ctx.lineWidth=0.8;
      for(let d=-100;d<(x1-x0+y1-y0+100);d+=10){
        ctx.beginPath();
        ctx.moveTo(x0+Math.max(0,d),y0+Math.max(0,-d));
        ctx.lineTo(x0+Math.min(x1-x0,d+y1-y0),y0+Math.min(y1-y0,d));
        ctx.stroke();
      }
      ctx.restore();
    }

    // Selection highlight
    if(isSelected){
      ctx.strokeStyle='#38bdf8';ctx.lineWidth=2.5;ctx.setLineDash([6,3]);
      ctx.strokeRect(x0+2,y0+2,x1-x0-4,y1-y0-4);
      ctx.setLineDash([]);
    }

    // Slab hatch (subtle)
    if(bay.type==='slab'){
      ctx.save();ctx.strokeStyle='rgba(56,189,248,0.05)';ctx.lineWidth=0.5;
      for(let xi=x0;xi<x1;xi+=14){ctx.beginPath();ctx.moveTo(xi,y0);ctx.lineTo(xi,y1);ctx.stroke();}
      ctx.restore();
    }

    // Labels
    const cx2=(x0+x1)/2,cy2=(y0+y1)/2;
    if(st.label){
      ctx.fillStyle=st.labelColor;ctx.font='bold 10px JetBrains Mono';
      ctx.textAlign='center';ctx.fillText(st.label,cx2,cy2-4);
    }
    if(bay.type==='slab'&&GE.showCase){
      const caseN=getSlabCase(bay);
      ctx.fillStyle='rgba(56,189,248,0.45)';ctx.font='9px JetBrains Mono';
      ctx.textAlign='center';ctx.fillText('Case '+caseN,cx2,cy2+5);
    }
  });

  // ── GRID LINES (faint) ────────────────────────────────────────
  ctx.strokeStyle='rgba(30,58,138,0.4)';ctx.lineWidth=0.5;ctx.setLineDash([3,4]);
  xs.forEach(x=>{ctx.beginPath();ctx.moveTo(x,PAD.t);ctx.lineTo(x,CANVAS_H-PAD.b);ctx.stroke();});
  ys.forEach(y=>{ctx.beginPath();ctx.moveTo(PAD.l,y);ctx.lineTo(CANVAS_W-PAD.r,y);ctx.stroke();});
  ctx.setLineDash([]);

  // ── BEAMS ─────────────────────────────────────────────────────
  GRID.beams.forEach(beam=>{
    const n1=GRID.nodes[beam.n1],n2=GRID.nodes[beam.n2];
    if(!n1||!n2)return;
    const p1=nodeCanvas(n1),p2=nodeCanvas(n2);
    const isSel=GE.selected&&GE.selected.type==='beam'&&GE.selected.id===beam.id;

    let color,lw,dash=[];
    if(beam.isCantilever){color='#34d399';lw=5;}
    else if(beam.isTransfer){color='#f59e0b';lw=6;dash=[8,4];}
    else if(beam.isSecondary){color='#8b5cf6';lw=3;}
    else{
      const c=getMomentCoeffs(beam);
      color=c.type==='both_continuous'?'#38bdf8':c.type==='one_continuous'?'#60a5fa':'#94a3b8';
      lw=5;
    }
    if(isSel){lw+=2;color='#0a0f1e';}

    ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.setLineDash(dash);
    ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
    ctx.setLineDash([]);

    // End condition symbols
    [{node:n1,pos:p1,end:beam.endLeft},{node:n2,pos:p2,end:beam.endRight}].forEach(({node,pos,end})=>{
      if(end==='wall'){
        ctx.save();ctx.strokeStyle='#94a3b8';ctx.lineWidth=2;
        const ang=beam.dir==='X'?Math.PI/2:0;
        ctx.translate(pos.x,pos.y);ctx.rotate(ang);
        for(let i=-8;i<=8;i+=4){ctx.beginPath();ctx.moveTo(i,-4);ctx.lineTo(i+4,4);ctx.stroke();}
        ctx.restore();
      }else if(end==='free'){
        ctx.save();ctx.strokeStyle='#f87171';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(pos.x,pos.y,5,0,Math.PI*2);ctx.stroke();
        ctx.restore();
      }
    });

    // Span label
    if(GE.showDims){
      const mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2;
      const offX=beam.dir==='Y'?12:0, offY=beam.dir==='X'?-12:0;
      ctx.fillStyle='rgba(148,163,184,0.75)';ctx.font='9px JetBrains Mono';
      ctx.textAlign='center';
      ctx.fillText(beam.L+'m',mx+offX,my+offY+(beam.dir==='Y'?4:0));
    }
  });

  // ── NODES (columns) ──────────────────────────────────────────
  GRID.nodes.forEach(node=>{
    const pos=nodeCanvas(node);
    const isSel=GE.selected&&GE.selected.type==='node'&&GE.selected.id===node.id;

    if(node.hasColumn){
      const sz=isSel?11:8;
      ctx.fillStyle=isSel?'#1e3a8a':'#1a2540';
      ctx.strokeStyle=isSel?'#0a0f1e':'#34d399';
      ctx.lineWidth=isSel?2.5:2;
      ctx.fillRect(pos.x-sz,pos.y-sz,sz*2,sz*2);
      ctx.strokeRect(pos.x-sz,pos.y-sz,sz*2,sz*2);
      // Centre dot
      ctx.fillStyle=isSel?'#38bdf8':'#34d399';
      ctx.beginPath();ctx.arc(pos.x,pos.y,3,0,Math.PI*2);ctx.fill();
      // Node label if custom
      if(node.label){
        ctx.fillStyle='#94a3b8';ctx.font='8px JetBrains Mono';
        ctx.textAlign='center';ctx.fillText(node.label,pos.x,pos.y-13);
      }
    }else if(node.isWall){
      ctx.fillStyle='#2a2a3a';ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;
      ctx.fillRect(pos.x-10,pos.y-5,20,10);ctx.strokeRect(pos.x-10,pos.y-5,20,10);
      ctx.strokeStyle='rgba(148,163,184,0.4)';
      for(let i=pos.x-8;i<pos.x+10;i+=4){
        ctx.beginPath();ctx.moveTo(i,pos.y-5);ctx.lineTo(i-4,pos.y+5);ctx.stroke();
      }
    }else{
      // Missing/removed column — X marker
      ctx.strokeStyle=isSel?'#0a0f1e':'#f87171';ctx.lineWidth=2.5;
      ctx.beginPath();ctx.moveTo(pos.x-6,pos.y-6);ctx.lineTo(pos.x+6,pos.y+6);ctx.stroke();
      ctx.beginPath();ctx.moveTo(pos.x+6,pos.y-6);ctx.lineTo(pos.x-6,pos.y+6);ctx.stroke();
    }
  });

  // ── SECONDARY BEAM DRAG PREVIEW ──────────────────────────────
  if(GE.dragSecStart&&GE.dragSecCurrent){
    ctx.strokeStyle='rgba(139,92,246,0.7)';ctx.lineWidth=3;ctx.setLineDash([6,4]);
    ctx.beginPath();ctx.moveTo(GE.dragSecStart.x,GE.dragSecStart.y);
    ctx.lineTo(GE.dragSecCurrent.x,GE.dragSecCurrent.y);ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── AXIS LABELS ──────────────────────────────────────────────
  // Column grid numbers (top)
  ctx.fillStyle='#38bdf8';ctx.font='bold 10px JetBrains Mono';ctx.textAlign='center';
  xs.forEach((x,i)=>{
    ctx.beginPath();ctx.arc(x,PAD.t-18,8,0,Math.PI*2);
    ctx.fillStyle='#1e3a8a';ctx.fill();
    ctx.strokeStyle='#38bdf8';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='#38bdf8';ctx.fillText(String(i+1),x,PAD.t-14);
  });
  // Row letters (left)
  ctx.fillStyle='#38bdf8';
  ys.forEach((y,i)=>{
    ctx.beginPath();ctx.arc(PAD.l-20,y,8,0,Math.PI*2);
    ctx.fillStyle='#1e3a8a';ctx.fill();
    ctx.strokeStyle='#38bdf8';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='#38bdf8';ctx.textAlign='center';
    ctx.fillText(String.fromCharCode(65+i),PAD.l-20,y+4);
  });

  // ── SPAN DIMENSIONS ──────────────────────────────────────────
  if(GE.showDims){
    ctx.fillStyle='#fb923c';ctx.font='bold 10px JetBrains Mono';ctx.textAlign='center';
    S.spansX.forEach((s,i)=>{
      ctx.fillText(s+'m',(xs[i]+xs[i+1])/2,CANVAS_H-PAD.b+18);
    });
    S.spansY.forEach((s,i)=>{
      ctx.save();ctx.translate(PAD.l-40,(ys[i]+ys[i+1])/2);
      ctx.rotate(-Math.PI/2);ctx.fillText(s+'m',0,0);ctx.restore();
    });
  }

  // ── LEGEND (top right) ────────────────────────────────────────
  const leg=[
    {clr:'#38bdf8',lw:4,label:'Both ends continuous'},
    {clr:'#60a5fa',lw:4,label:'One end continuous'},
    {clr:'#94a3b8',lw:4,label:'Simply supported'},
    {clr:'#f59e0b',lw:5,dash:true,label:'Transfer beam'},
    {clr:'#8b5cf6',lw:3,label:'Secondary beam'},
    {clr:'#34d399',lw:4,label:'Cantilever'},
  ];
  let legY=10;
  leg.forEach(item=>{
    ctx.setLineDash(item.dash?[5,3]:[]);
    ctx.strokeStyle=item.clr;ctx.lineWidth=item.lw;
    ctx.beginPath();ctx.moveTo(CANVAS_W-190,legY+4);ctx.lineTo(CANVAS_W-168,legY+4);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle=item.clr;ctx.font='8px JetBrains Mono';ctx.textAlign='left';
    ctx.fillText(item.label,CANVAS_W-164,legY+7);
    legY+=13;
  });
}

// ── HIT TESTING ──────────────────────────────────────────────────
function hitNode(x,y){
  if(!GRID)return null;
  const{xs,ys}=getCanvasCoords();
  for(let r=0;r<=GRID.ny;r++)for(let c=0;c<=GRID.nx;c++){
    if(Math.abs(x-xs[c])<14&&Math.abs(y-ys[r])<14)
      return GRID.nodes.find(n=>n.row===r&&n.col===c);
  }
  return null;
}

function hitBeam(x,y){
  if(!GRID)return null;
  let best=null,bestDist=12;
  GRID.beams.forEach(beam=>{
    const n1=GRID.nodes[beam.n1],n2=GRID.nodes[beam.n2];
    if(!n1||!n2)return;
    const p1=nodeCanvas(n1),p2=nodeCanvas(n2);
    // Distance from point to segment
    const dx=p2.x-p1.x,dy=p2.y-p1.y;
    const len2=dx*dx+dy*dy;
    if(len2===0)return;
    const t=Math.max(0,Math.min(1,((x-p1.x)*dx+(y-p1.y)*dy)/len2));
    const px=p1.x+t*dx,py=p1.y+t*dy;
    const dist=Math.sqrt((x-px)**2+(y-py)**2);
    if(dist<bestDist){bestDist=dist;best=beam;}
  });
  return best;
}

function hitBay(x,y){
  if(!GRID)return null;
  const{xs,ys}=getCanvasCoords();
  for(let r=0;r<GRID.ny;r++)for(let c=0;c<GRID.nx;c++){
    if(x>xs[c]+16&&x<xs[c+1]-16&&y>ys[r]+16&&y<ys[r+1]-16)
      return GRID.bays.find(b=>b.row===r&&b.col===c);
  }
  return null;
}

// ── CANVAS EVENTS ────────────────────────────────────────────────
function getCanvasXY(e,canvas){
  const rect=canvas.getBoundingClientRect();
  const scaleX=CANVAS_W/rect.width,scaleY=CANVAS_H/rect.height;
  const src=e.touches?e.touches[0]:e;
  return{x:(src.clientX-rect.left)*scaleX,y:(src.clientY-rect.top)*scaleY};
}

function handleGridMouseDown(e,canvas){
  e.preventDefault();
  const{x,y}=getCanvasXY(e,canvas);
  if(GE.mode==='secbeam'){
    const node=hitNode(x,y);
    if(node){
      GE.dragSecStart={x:nodeCanvas(node).x,y:nodeCanvas(node).y,node};
      GE.dragSecCurrent={x,y};
    }
    return;
  }
}

function handleGridMouseMove(e,canvas){
  if(!GE.dragSecStart)return;
  const{x,y}=getCanvasXY(e,canvas);
  GE.dragSecCurrent={x,y};
  drawGrid(canvas);
}

function handleGridMouseUp(e,canvas){
  if(GE.mode==='secbeam'&&GE.dragSecStart){
    const{x,y}=getCanvasXY(e,canvas);
    const endNode=hitNode(x,y);
    if(endNode&&endNode.id!==GE.dragSecStart.node.id){
      addSecondaryBeam(GE.dragSecStart.node,endNode);
    }
    GE.dragSecStart=null;GE.dragSecCurrent=null;
    drawGrid(canvas);
  }
}

function handleGridClick(e,canvas){
  if(!GRID||!canvas)return;
  const{x,y}=getCanvasXY(e,canvas);

  if(GE.mode==='select'){
    // Try node first, then beam, then bay
    const node=hitNode(x,y);
    if(node){GE.selected={type:'node',id:node.id};showContextPanel();drawGrid(canvas);return;}
    const beam=hitBeam(x,y);
    if(beam){GE.selected={type:'beam',id:beam.id};showContextPanel();drawGrid(canvas);return;}
    const bay=hitBay(x,y);
    if(bay){GE.selected={type:'bay',row:bay.row,col:bay.col};showContextPanel();drawGrid(canvas);return;}
    GE.selected=null;showContextPanel();drawGrid(canvas);
  }

  else if(GE.mode==='column'){
    const node=hitNode(x,y);
    if(node){
      if(node.hasColumn){node.hasColumn=false;node.isWall=false;}
      else if(node.isWall){node.isWall=false;}
      else{node.hasColumn=true;}
      GRID.beams.forEach(b=>{if(b.n1===node.id||b.n2===node.id)autoEndConditions(b);});
      updateTransferBeams();drawGrid(canvas);updateStructSummary();
    }
  }

  else if(GE.mode==='wall'){
    const node=hitNode(x,y);
    if(node&&!node.hasColumn){
      node.isWall=!node.isWall;
      GRID.beams.forEach(b=>{if(b.n1===node.id||b.n2===node.id)autoEndConditions(b);});
      drawGrid(canvas);updateStructSummary();
    }
  }

  else if(GE.mode==='bay'){
    const bay=hitBay(x,y);
    if(bay){
      bay.type=BAY_TYPES[(BAY_TYPES.indexOf(bay.type)+1)%BAY_TYPES.length];
      drawGrid(canvas);updateStructSummary();
    }
  }

  else if(GE.mode==='cantilever'){
    const node=hitNode(x,y);
    if(node){
      const edge=node.row===0||node.row===GRID.ny||node.col===0||node.col===GRID.nx;
      if(edge){
        const exists=GRID.beams.find(b=>b.isCantilever&&(b.n1===node.id||b.n2===node.id));
        if(exists)GRID.beams=GRID.beams.filter(b=>b!==exists);
        else GRID.beams.push({
          id:Date.now(),dir:node.col===0||node.col===GRID.nx?'Y':'X',
          n1:node.id,n2:node.id,row:node.row,col:node.col,L:1.5,
          endLeft:'column',endRight:'free',isSecondary:false,isCantilever:true,
          isTransfer:false,endCondOverride:null,customWu:null,
          cantDir:node.col===0?'left':node.col===GRID.nx?'right':node.row===0?'up':'down',
        });
        drawGrid(canvas);updateStructSummary();
      }
    }
  }

  else if(GE.mode==='endcond'){
    const beam=hitBeam(x,y);
    if(beam&&!beam.isCantilever&&!beam.isSecondary){
      const opts=['continuous','left_pinned','right_pinned','pinned'];
      const cur=beam.endCondOverride||'continuous';
      beam.endCondOverride=opts[(opts.indexOf(cur)+1)%opts.length];
      autoEndConditions(beam);drawGrid(canvas);updateStructSummary();
    }
  }
}

function handleGridTouchStart(e,canvas){
  e.preventDefault();
  if(GE.mode==='secbeam'){handleGridMouseDown(e,canvas);}
  else handleGridClick({touches:e.touches},canvas);
}
function handleGridTouchMove(e,canvas){e.preventDefault();handleGridMouseMove(e,canvas);}
function handleGridTouchEnd(e,canvas){e.preventDefault();handleGridMouseUp({touches:[e.changedTouches[0]]},canvas);}

// ── SECONDARY BEAM ───────────────────────────────────────────────
function addSecondaryBeam(n1,n2){
  // Check if they are in same row or col (otherwise it's a diagonal — not supported)
  if(n1.row!==n2.row&&n1.col!==n2.col){
    showGEToast('Secondary beams must be horizontal or vertical','#f87171');return;
  }
  const dir=n1.row===n2.row?'X':'Y';
  const L=dir==='X'?Math.abs(S.spansX.slice(Math.min(n1.col,n2.col),Math.max(n1.col,n2.col)).reduce((a,b)=>a+b,0)):
                    Math.abs(S.spansY.slice(Math.min(n1.row,n2.row),Math.max(n1.row,n2.row)).reduce((a,b)=>a+b,0));
  // Check not duplicate
  if(GRID.beams.find(b=>b.isSecondary&&((b.n1===n1.id&&b.n2===n2.id)||(b.n1===n2.id&&b.n2===n1.id)))){
    showGEToast('Secondary beam already exists here','#fbbf24');return;
  }
  GRID.beams.push({
    id:Date.now(),dir,n1:n1.id,n2:n2.id,
    row:Math.min(n1.row,n2.row),col:Math.min(n1.col,n2.col),
    L:Math.max(L,1),endLeft:'column',endRight:'column',
    isSecondary:true,isCantilever:false,isTransfer:false,
    endCondOverride:null,customWu:null,
  });
  showGEToast('Secondary beam added','#8b5cf6');
}

// ── TOAST ────────────────────────────────────────────────────────
function showGEToast(msg,color){
  const old=document.getElementById('geToast');if(old)old.remove();
  const t=document.createElement('div');t.id='geToast';
  t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#0f172a;border:1px solid '+color+';color:'+color+';padding:7px 16px;border-radius:8px;font-size:11px;font-weight:700;z-index:9999;font-family:monospace';
  t.textContent=msg;document.body.appendChild(t);
  setTimeout(()=>t.remove(),2200);
}

// ── CONTEXT PANEL (right panel shown when item selected) ─────────
function showContextPanel(){
  const panel=document.getElementById('geContextPanel');
  if(!panel)return;
  if(!GE.selected){panel.innerHTML=noSelHTML();return;}
  const{type,id}=GE.selected;

  if(type==='node'){
    const node=GRID.nodes.find(n=>n.id===id);
    if(!node){panel.innerHTML=noSelHTML();return;}
    panel.innerHTML=nodePanel(node);
  }else if(type==='beam'){
    const beam=GRID.beams.find(b=>b.id===id);
    if(!beam){panel.innerHTML=noSelHTML();return;}
    panel.innerHTML=beamPanel(beam);
  }else if(type==='bay'){
    const bay=getBay(GE.selected.row,GE.selected.col);
    if(!bay){panel.innerHTML=noSelHTML();return;}
    panel.innerHTML=bayPanel(bay);
  }
}

function noSelHTML(){
  return `<div style="padding:12px;font-size:10px;color:#64748b;text-align:center;line-height:1.8">
    <div style="font-size:20px;margin-bottom:6px">👆</div>
    Click any <strong style="color:#38bdf8">node</strong>,<br>
    <strong style="color:#f59e0b">beam</strong>, or<br>
    <strong style="color:#34d399">bay panel</strong><br>
    to edit its properties
  </div>`;
}

function nodePanel(node){
  const typeName=node.hasColumn?'Column':node.isWall?'Wall Support':'Removed';
  const typeColor=node.hasColumn?'#34d399':node.isWall?'#94a3b8':'#f87171';
  return `<div style="padding:10px;font-size:11px">
    <div style="font-weight:700;color:#38bdf8;margin-bottom:8px">Node ${String.fromCharCode(65+node.row)}-${node.col+1}</div>
    <div style="font-size:9px;color:#64748b;margin-bottom:10px">Row ${node.row}, Col ${node.col}</div>
    <div style="font-size:10px;font-weight:700;color:${typeColor};margin-bottom:10px">● ${typeName}</div>

    <div style="font-size:10px;font-weight:700;color:#64748b;margin-bottom:6px">NODE TYPE</div>
    ${['Column','Wall','Removed'].map(t=>`
      <button onclick="setNodeType(${node.id},'${t}')"
        style="display:block;width:100%;margin-bottom:4px;padding:6px;border-radius:5px;
        background:${node.hasColumn&&t==='Column'||node.isWall&&t==='Wall'||(!node.hasColumn&&!node.isWall)&&t==='Removed'?'rgba(56,189,248,0.15)':'transparent'};
        border:1px solid ${node.hasColumn&&t==='Column'||node.isWall&&t==='Wall'||(!node.hasColumn&&!node.isWall)&&t==='Removed'?'#38bdf8':'#1e3a8a'};
        color:${t==='Column'?'#34d399':t==='Wall'?'#94a3b8':'#f87171'};cursor:pointer;font-size:10px;font-weight:600;text-align:left">
        ${t==='Column'?'🏛':t==='Wall'?'🧱':'✗'} ${t}
      </button>`).join('')}

    <div style="margin-top:10px;font-size:10px;font-weight:700;color:#64748b;margin-bottom:4px">LABEL (optional)</div>
    <input value="${node.label||''}" oninput="setNodeLabel(${node.id},this.value)"
      placeholder="e.g. C1, C2..."
      style="width:100%;box-sizing:border-box;background:#0f172a;color:#f1f5f9;border:1px solid #1e3a8a;border-radius:5px;padding:5px 8px;font-size:10px;font-family:monospace"/>
  </div>`;
}

function beamPanel(beam){
  const coeffs=getMomentCoeffs(beam);
  const condLabel=beam.endCondOverride||'auto';
  return `<div style="padding:10px;font-size:11px">
    <div style="font-weight:700;color:#38bdf8;margin-bottom:4px">Beam ${beam.dir}-dir (L=${beam.L}m)</div>
    <div style="font-size:9px;color:#64748b;margin-bottom:10px">n1=${beam.n1} → n2=${beam.n2} ${beam.isSecondary?'| SECONDARY':beam.isTransfer?'| TRANSFER':''}</div>

    <div style="font-size:10px;font-weight:700;color:#64748b;margin-bottom:6px">END CONDITIONS</div>
    <div style="font-size:9px;color:#94a3b8;margin-bottom:6px;padding:5px;background:#0f172a;border-radius:4px">${coeffs.label}</div>
    ${['auto','continuous','left_pinned','right_pinned','pinned'].map(opt=>`
      <button onclick="setBeamEndCond(${beam.id},'${opt}')"
        style="display:block;width:100%;margin-bottom:3px;padding:5px;border-radius:4px;
        background:${condLabel===opt?'rgba(56,189,248,0.15)':'transparent'};
        border:1px solid ${condLabel===opt?'#38bdf8':'#1e3a8a'};
        color:${condLabel===opt?'#38bdf8':'#64748b'};cursor:pointer;font-size:9px;text-align:left">
        ${{auto:'🔄 Auto (from nodes)',continuous:'=== Both fixed',left_pinned:'O== Left pinned',right_pinned:'==O Right pinned',pinned:'O=O Both pinned'}[opt]}
      </button>`).join('')}

    ${!beam.isCantilever&&!beam.isSecondary?`
    <div style="margin-top:10px;font-size:10px;font-weight:700;color:#64748b;margin-bottom:4px">CUSTOM LOAD (kN/m)</div>
    <div style="font-size:9px;color:#64748b;margin-bottom:4px">Leave blank to auto-calc from slab</div>
    <input type="number" value="${beam.customWu||''}" placeholder="auto"
      oninput="setBeamCustomWu(${beam.id},this.value)"
      style="width:100%;box-sizing:border-box;background:#0f172a;color:#f1f5f9;border:1px solid #1e3a8a;border-radius:5px;padding:5px 8px;font-size:10px;font-family:monospace"/>
    `:''}

    ${beam.isSecondary?`
    <div style="margin-top:10px">
      <button onclick="deleteSecBeam(${beam.id})"
        style="width:100%;padding:6px;background:rgba(248,113,113,0.1);border:1px solid #f87171;border-radius:5px;color:#f87171;cursor:pointer;font-size:10px;font-weight:700">
        🗑 Delete Secondary Beam
      </button>
    </div>`:''}
  </div>`;
}

function bayPanel(bay){
  const caseN=bay.type==='slab'?getSlabCase(bay):null;
  return `<div style="padding:10px;font-size:11px">
    <div style="font-weight:700;color:#38bdf8;margin-bottom:4px">Bay ${String.fromCharCode(65+bay.row)}-${bay.col+1}</div>
    <div style="font-size:9px;color:#64748b;margin-bottom:10px">Row ${bay.row}, Col ${bay.col} | lx=${r2(bay.lx)}m, ly=${r2(bay.ly)}m</div>

    <div style="font-size:10px;font-weight:700;color:#64748b;margin-bottom:6px">BAY TYPE</div>
    ${BAY_TYPES.map(t=>{
      const st=BAY_STYLES[t];
      return `<button onclick="setBayType(${bay.row},${bay.col},'${t}')"
        style="display:block;width:100%;margin-bottom:4px;padding:6px 8px;border-radius:5px;
        background:${bay.type===t?'rgba(56,189,248,0.15)':'transparent'};
        border:1px solid ${bay.type===t?'#38bdf8':'#1e3a8a'};
        color:${st.labelColor||'#94a3b8'};cursor:pointer;font-size:10px;font-weight:600;text-align:left">
        ${t==='slab'?'🟦':t==='void'?'⬛':t==='opening'?'🔴':t==='courtyard'?'🌿':'🪜'} ${t.charAt(0).toUpperCase()+t.slice(1)}
        ${bay.type===t?' ✓':''}
      </button>`;
    }).join('')}

    ${bay.type==='slab'&&caseN?`
    <div style="margin-top:10px;padding:7px;background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.2);border-radius:6px">
      <div style="font-size:10px;font-weight:700;color:#38bdf8">IS 456 Table 26: Case ${caseN}</div>
      <div style="font-size:9px;color:#64748b;margin-top:3px;line-height:1.6">${getSlabCaseDesc(caseN)}</div>
    </div>`:''}

    ${bay.type!=='slab'?`
    <div style="margin-top:8px;padding:6px;background:rgba(100,116,139,0.1);border-radius:5px;font-size:9px;color:#64748b">
      This bay will <strong style="color:#f1f5f9">not</strong> contribute load to surrounding beams. Beams around this bay will be designed for reduced load.
    </div>`:''}
  </div>`;
}

function getSlabCaseDesc(c){
  const d={1:'All 4 edges continuous — interior panel (lowest moments)',
    2:'One short edge discontinuous',3:'One long edge discontinuous',
    4:'Two adjacent edges discontinuous — corner panel',
    5:'Two short edges discontinuous',6:'Two long edges discontinuous',
    7:'Three edges discontinuous (one long edge continuous)',
    8:'Three edges discontinuous (one short edge continuous)',
    9:'All 4 edges discontinuous — simply supported on all sides (highest moments)'};
  return d[c]||'Edge condition from column support pattern';
}

// ── PANEL ACTIONS ────────────────────────────────────────────────
function setNodeType(nodeId,type){
  const node=GRID.nodes.find(n=>n.id===nodeId);if(!node)return;
  node.hasColumn=type==='Column';node.isWall=type==='Wall';
  GRID.beams.forEach(b=>{if(b.n1===nodeId||b.n2===nodeId)autoEndConditions(b);});
  updateTransferBeams();showContextPanel();redrawGrid();updateStructSummary();
}
function setNodeLabel(nodeId,lbl){
  const node=GRID.nodes.find(n=>n.id===nodeId);if(node)node.label=lbl;redrawGrid();
}
function setBeamEndCond(beamId,opt){
  const beam=GRID.beams.find(b=>b.id===beamId);if(!beam)return;
  beam.endCondOverride=opt==='auto'?null:opt;
  autoEndConditions(beam);showContextPanel();redrawGrid();updateStructSummary();
}
function setBeamCustomWu(beamId,val){
  const beam=GRID.beams.find(b=>b.id===beamId);if(!beam)return;
  beam.customWu=val===''||isNaN(parseFloat(val))?null:parseFloat(val);
}
function setBayType(row,col,type){
  const bay=getBay(row,col);if(!bay)return;
  bay.type=type;showContextPanel();redrawGrid();updateStructSummary();
}
function deleteSecBeam(beamId){
  GRID.beams=GRID.beams.filter(b=>b.id!==beamId);
  GE.selected=null;showContextPanel();redrawGrid();updateStructSummary();
}

function updateStructSummary(){
  const el=document.getElementById('structSummary');if(!el||!GRID)return;
  const nCols=GRID.nodes.filter(n=>n.hasColumn).length;
  const nWalls=GRID.nodes.filter(n=>n.isWall).length;
  const nMissing=GRID.nodes.filter(n=>!n.hasColumn&&!n.isWall).length;
  const nTransfer=GRID.beams.filter(b=>b.isTransfer).length;
  const nSec=GRID.beams.filter(b=>b.isSecondary).length;
  const nCant=GRID.beams.filter(b=>b.isCantilever).length;
  const nVoid=GRID.bays.filter(b=>b.type!=='slab').length;
  const nBoth=GRID.beams.filter(b=>!b.isCantilever&&b.endLeft==='column'&&b.endRight==='column').length;
  const nOne=GRID.beams.filter(b=>!b.isCantilever&&(b.endLeft==='column')!==(b.endRight==='column')).length;
  const nSS=GRID.beams.filter(b=>!b.isCantilever&&b.endLeft!=='column'&&b.endRight!=='column').length;
  el.innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:10px">
      <div>
        <div style="font-weight:700;color:#38bdf8;margin-bottom:4px">Structure</div>
        <div style="color:#34d399">🏛 Columns: ${nCols}</div>
        ${nWalls?`<div style="color:#94a3b8">🧱 Walls: ${nWalls}</div>`:''}
        ${nMissing?`<div style="color:#f87171">✗ Removed: ${nMissing}</div>`:''}
        ${nTransfer?`<div style="color:#f59e0b">⚡ Transfer: ${nTransfer}</div>`:''}
        ${nSec?`<div style="color:#8b5cf6">+ Secondary: ${nSec}</div>`:''}
        ${nCant?`<div style="color:#34d399">↗ Cantilever: ${nCant}</div>`:''}
        ${nVoid?`<div style="color:#64748b">□ Non-slab bays: ${nVoid}</div>`:''}
      </div>
      <div>
        <div style="font-weight:700;color:#38bdf8;margin-bottom:4px">Beam Conditions</div>
        <div style="color:#38bdf8">Both cont.: ${nBoth}</div>
        <div style="color:#60a5fa">One cont.: ${nOne}</div>
        <div style="color:#94a3b8">Simply supp.: ${nSS}</div>
        <div style="margin-top:5px;font-size:9px;color:#64748b">Slab cases auto from IS 456 T26</div>
      </div>
    </div>`;
}

// ── MODE BUTTONS ─────────────────────────────────────────────────
const GE_MODES=[
  {id:'select',   icon:'↖',  label:'Select',      color:'#38bdf8', tip:'Click any node/beam/bay to inspect and edit its full properties'},
  {id:'column',   icon:'🏛', label:'Column',      color:'#34d399', tip:'Click nodes to toggle column → wall → removed → column'},
  {id:'wall',     icon:'🧱', label:'Wall',        color:'#94a3b8', tip:'Click a removed node to mark it as wall-supported (pinned end)'},
  {id:'bay',      icon:'□',  label:'Bay Type',    color:'#f59e0b', tip:'Click bay panels to cycle: Slab → Void → Opening → Courtyard → Staircase'},
  {id:'endcond',  icon:'⚡', label:'End Cond.',   color:'#60a5fa', tip:'Click beams to cycle end conditions: Auto → Both fixed → Left pinned → Right pinned → Both pinned'},
  {id:'cantilever',icon:'↗', label:'Cantilever',  color:'#34d399', tip:'Click an edge node to add/remove a cantilever stub'},
  {id:'secbeam',  icon:'+',  label:'Sec. Beam',   color:'#8b5cf6', tip:'Drag from one node to another to add a secondary beam'},
];

// ── P2 PAGE ─────────────────────────────────────────────────────
function p2(){
  if(!GRID)initGrid();
  return `
<div class="card bl" style="padding:0;overflow:hidden">
  <div style="padding:12px 14px;border-bottom:1px solid var(--b1)">
    <div class="ct" style="margin:0 0 4px">📐 Building Plan Editor</div>
    <div class="cd" style="margin:0;font-size:10px">Design your actual building layout. Click any element to edit it. Use the right panel for detailed properties.</div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 160px;height:calc(100% - 60px)">

    <!-- LEFT: Canvas + tools -->
    <div style="padding:10px 6px 6px 10px">

      <!-- Mode toolbar -->
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;align-items:center">
        ${GE_MODES.map(m=>`
          <button onclick="GE.mode='${m.id}';redrawGrid();document.getElementById('geTip').textContent='${m.tip}';this.parentElement.querySelectorAll('button').forEach(b=>b.setAttribute('data-active','false'));this.setAttribute('data-active','true')"
            data-active="${GE.mode===m.id?'true':'false'}"
            title="${m.tip}"
            style="padding:5px 9px;border-radius:6px;font-size:10px;cursor:pointer;font-family:monospace;font-weight:600;transition:all 0.15s;
            border:1.5px solid ${GE.mode===m.id?m.color:'rgba(30,58,138,0.6)'};
            background:${GE.mode===m.id?m.color+'20':'transparent'};
            color:${GE.mode===m.id?m.color:'#64748b'}">
            ${m.icon} ${m.label}
          </button>`).join('')}
        <button onclick="GE.showDims=!GE.showDims;redrawGrid()" title="Toggle dimension labels"
          style="padding:5px 9px;border-radius:6px;font-size:10px;cursor:pointer;font-family:monospace;border:1px solid #1e3a8a;background:transparent;color:#64748b">
          📏 Dims
        </button>
        <button onclick="GE.showCase=!GE.showCase;redrawGrid()" title="Toggle slab case labels"
          style="padding:5px 9px;border-radius:6px;font-size:10px;cursor:pointer;font-family:monospace;border:1px solid #1e3a8a;background:transparent;color:#64748b">
          📋 Cases
        </button>
      </div>

      <!-- Tip bar -->
      <div id="geTip" style="padding:5px 10px;background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.15);border-radius:6px;font-size:10px;color:#38bdf8;margin-bottom:6px">
        ${GE_MODES.find(m=>m.id===GE.mode)?.tip||'Select a mode'}
      </div>

      <!-- Canvas -->
      <canvas id="gridCanvas" width="${CANVAS_W}" height="${CANVAS_H}"
        style="display:block;width:100%;border-radius:8px;cursor:crosshair;touch-action:none;border:1px solid rgba(30,58,138,0.5)"
        onclick="handleGridClick(event,this)"
        onmousedown="handleGridMouseDown(event,this)"
        onmousemove="handleGridMouseMove(event,this)"
        onmouseup="handleGridMouseUp(event,this)"
        ontouchstart="handleGridTouchStart(event,this)"
        ontouchmove="handleGridTouchMove(event,this)"
        ontouchend="handleGridTouchEnd(event,this)">
      </canvas>

      <!-- Span inputs -->
      <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap">
        <div style="flex:1;min-width:180px">
          <div style="font-size:10px;font-weight:700;color:#38bdf8;margin-bottom:5px">X Spans (m) — Columns 1→${S.spansX.length+1}</div>
          ${S.spansX.map((s,i)=>`
            <div style="display:flex;gap:5px;align-items:center;margin-bottom:4px">
              <span style="font-size:9px;color:#64748b;min-width:22px">X${i+1}</span>
              <input type="number" value="${s}" min="1.5" max="15" step="0.1"
                style="flex:1;background:#0f172a;color:#f1f5f9;border:1px solid #1e3a8a;border-radius:5px;padding:4px 6px;font-size:10px;font-family:monospace"
                oninput="S.spansX[${i}]=parseFloat(this.value)||3;GRID=null;initGrid();redrawGrid();updateStructSummary()"/>
              <span style="font-size:9px;color:#64748b">m</span>
              ${S.spansX.length>1?`<button onclick="S.spansX.splice(${i},1);GRID=null;initGrid();go(2)"
                style="padding:2px 7px;background:transparent;border:1px solid #374151;border-radius:4px;color:#f87171;cursor:pointer;font-size:10px">✕</button>`:''}
            </div>`).join('')}
          <button onclick="S.spansX.push(3.5);GRID=null;initGrid();go(2)"
            style="font-size:9px;padding:3px 10px;background:#0f172a;border:1px solid #1e3a8a;border-radius:5px;color:#38bdf8;cursor:pointer">+ Bay X</button>
        </div>
        <div style="flex:1;min-width:180px">
          <div style="font-size:10px;font-weight:700;color:#38bdf8;margin-bottom:5px">Y Spans (m) — Rows A→${String.fromCharCode(65+S.spansY.length)}</div>
          ${S.spansY.map((s,i)=>`
            <div style="display:flex;gap:5px;align-items:center;margin-bottom:4px">
              <span style="font-size:9px;color:#64748b;min-width:22px">Y${i+1}</span>
              <input type="number" value="${s}" min="1.5" max="15" step="0.1"
                style="flex:1;background:#0f172a;color:#f1f5f9;border:1px solid #1e3a8a;border-radius:5px;padding:4px 6px;font-size:10px;font-family:monospace"
                oninput="S.spansY[${i}]=parseFloat(this.value)||3;GRID=null;initGrid();redrawGrid();updateStructSummary()"/>
              <span style="font-size:9px;color:#64748b">m</span>
              ${S.spansY.length>1?`<button onclick="S.spansY.splice(${i},1);GRID=null;initGrid();go(2)"
                style="padding:2px 7px;background:transparent;border:1px solid #374151;border-radius:4px;color:#f87171;cursor:pointer;font-size:10px">✕</button>`:''}
            </div>`).join('')}
          <button onclick="S.spansY.push(3);GRID=null;initGrid();go(2)"
            style="font-size:9px;padding:3px 10px;background:#0f172a;border:1px solid #1e3a8a;border-radius:5px;color:#38bdf8;cursor:pointer">+ Bay Y</button>
        </div>
      </div>

      <!-- Structure summary -->
      <div id="structSummary" style="margin-top:8px;padding:10px;background:#0a0f1e;border:1px solid #1e3a8a;border-radius:8px"></div>

      <!-- Navigation -->
      <div style="display:flex;justify-content:space-between;margin-top:10px">
        <button class="btn se" onclick="go(1)">← Back</button>
        <button class="btn" onclick="go(3)">Next: Loads →</button>
      </div>
    </div>

    <!-- RIGHT: Context property panel -->
    <div style="border-left:1px solid var(--b1);background:#0a0f1e;overflow-y:auto">
      <div style="padding:8px 10px;border-bottom:1px solid #1e3a8a;font-size:10px;font-weight:700;color:#64748b">PROPERTIES</div>
      <div id="geContextPanel">${noSelHTML()}</div>
    </div>

  </div>
</div>`;
}

function redrawGrid(){
  const c=document.getElementById('gridCanvas');
  if(c){drawGrid(c);updateStructSummary();}
}


// == 05_calc_grid.js ==

// ================================================================
// MODULE: 05_calc_grid  v4
// Designs EVERY beam on EVERY floor, EVERY column on EVERY floor.
// Floor 1 = Ground (max column load). Roof has reduced LL.
// Results indexed as beams[{floor, beamId, ...}], cols[{floor, nodeId, ...}]
// ================================================================

const TC_TABLE=[[0.15,0.28],[0.25,0.36],[0.50,0.48],[0.75,0.56],
  [1.00,0.62],[1.25,0.67],[1.50,0.72],[1.75,0.75],[2.00,0.79],[2.50,0.82],[3.00,0.82]];

function getTc(pt){
  for(let i=0;i<TC_TABLE.length-1;i++){
    const [p0,t0]=TC_TABLE[i],[p1,t1]=TC_TABLE[i+1];
    if(pt>=p0&&pt<p1) return t0+(pt-p0)*(t1-t0)/(p1-p0);
  }
  return TC_TABLE[TC_TABLE.length-1][1];
}

// IS 456 Table 19 — design bond stress for plain bars in tension (N/mm²)
// HYSD/TMT deformed bars get 60% increase per Cl 26.2.1.1.
// Compression: τbd_design × 1.25 (Cl 26.2.1.1).
function tauBd(fck, isHYSD, isCompression){
  const tbl = { 20:1.2, 25:1.4, 30:1.5, 35:1.7, 40:1.9, 45:2.0, 50:2.1 };
  // Round fck DOWN to nearest table grade for safety; interpolate above 50.
  let key = 20;
  for(const k of [20,25,30,35,40,45,50]) if(fck>=k) key=k;
  let tbd = tbl[key] || 0.16*Math.sqrt(fck);
  if(isHYSD) tbd *= 1.6;
  if(isCompression) tbd *= 1.25;
  return tbd;
}

// IS 456 Cl 26.2.1 — Development length
// Ld = (φ × σs) / (4 × τbd_design),  σs = 0.87 fy
// hookFactor: 0.7 for standard 90° hook (Cl 26.2.1.1 — equivalent anchorage)
function devLength(phi, fy, fck, opts){
  opts = opts || {};
  const isHYSD = (fy >= 415);
  const tbd = tauBd(fck, isHYSD, !!opts.compression);
  const Ld = phi * 0.87 * fy / (4 * tbd);
  return opts.hook ? Ld * 0.7 : Ld;
}

function AstCalc(Mu,b,d,fck,fy,Mf){
  // IS 456 Annex G.1.1(b) — exact closed-form solution of:
  //   Mu = 0.87 fy Ast d (1 - Ast fy / (b d fck))
  // ⇒  Ast = 0.5 fck b d / fy · (1 - √(1 - 4.598 Mu / (fck b d²)))
  // Fall back to min steel (0.12% bD) if Mu invalid or section under-loaded.
  const Astmin = 0.12*b*d/100;
  if(Mu<=0 || d<=0 || b<=0 || fck<=0 || fy<=0) return Astmin;
  const Mu_Nmm = Mu*1e6;
  const factor = 4.598 * Mu_Nmm / (fck * b * d * d);
  if(factor >= 1) {
    // Section is over its singly-reinforced capacity; caller should
    // increase D. Return Ast for balanced section as a conservative
    // approximation — caller's geometry loop will resize.
    return Math.max((Mf||0.138)*fck*b*d/(0.87*fy), Astmin);
  }
  const Ast = 0.5 * fck * b * d / fy * (1 - Math.sqrt(1 - factor));
  return Math.max(isNaN(Ast)||Ast<0 ? Astmin : Ast, Astmin);
}

// ── COLUMN TRIBUTARY AREA from actual GRID bays ────────────────
function getColTribAreaDetailed(node){
  const r=node.row, c=node.col;
  let slabArea=0, voidArea=0, perimLen=0;
  const Q=[
    {bay:getBay(r-1,c-1), spX:S.spansX[c-1]||0, spY:S.spansY[r-1]||0},
    {bay:getBay(r-1,c),   spX:S.spansX[c]||0,   spY:S.spansY[r-1]||0},
    {bay:getBay(r,  c-1), spX:S.spansX[c-1]||0, spY:S.spansY[r]||0},
    {bay:getBay(r,  c),   spX:S.spansX[c]||0,   spY:S.spansY[r]||0},
  ];
  Q.forEach(({bay,spX,spY})=>{
    const a=spX/2*spY/2;
    if(!bay||bay.type==='void'||bay.type==='opening'||bay.type==='courtyard') voidArea+=a;
    else slabArea+=a;
  });
  const isTopRow=r===0,isBotRow=r===GRID.ny,isLftCol=c===0,isRgtCol=c===GRID.nx;
  if(isTopRow||isBotRow) perimLen+=(S.spansX[c]||0)/2+(S.spansX[c-1]||0)/2;
  if(isLftCol||isRgtCol) perimLen+=(S.spansY[r]||0)/2+(S.spansY[r-1]||0)/2;
  return{slabArea,voidArea,perimLen};
}

// ── DESIGN ONE COLUMN for a specific floor ────────────────────
// floorsAbove = how many floors this column supports (including its own floor)
// IS 875 Part 2 Cl 3.2.1 — reduction in imposed loads on supporting columns
// based on number of floors above the column being designed.
function llReductionFactor(nFloors){
  // Returns reduction factor to be applied to TOTAL accumulated LL
  // 1 floor: 1.0  | 2: 0.9 | 3: 0.8 | 4: 0.7 | 5: 0.6 | 6+: 0.5
  if(nFloors<=1) return 1.0;
  if(nFloors===2) return 0.9;
  if(nFloors===3) return 0.8;
  if(nFloors===4) return 0.7;
  if(nFloors===5) return 0.6;
  return 0.5;
}

function designOneColumn(node, floorsAbove, DL_tot, udlLL_floor, udlLL_roof,
                          wallLoad, fck, fy, floorHt, coverCol, Mf, numFloors){
  const{slabArea,perimLen}=getColTribAreaDetailed(node);

  // Roof contributes DL+roof_LL, other floors contribute DL+floor_LL.
  // IS 875-2 LL reduction depends on number of floors above column.
  const llRedFactor = llReductionFactor(floorsAbove);
  const DL_per_floor = DL_tot*slabArea + wallLoad*perimLen;
  // Roof = 1 floor (the top), with roof LL; the rest are typical floors with floor LL
  const nTypicalFloors = floorsAbove - 1; // floors that aren't the roof above this column
  const LL_total = (nTypicalFloors*udlLL_floor + udlLL_roof) * slabArea * llRedFactor;
  // Wall load: no wall above roof — so wall acts on (floorsAbove-1) typical floors
  // (Roof column carrying just the roof: floorsAbove=1, nTypicalFloors=0, wall=0.)
  const wallContribution = nTypicalFloors * wallLoad * perimLen;
  const Ps = floorsAbove*DL_tot*slabArea + LL_total + wallContribution;
  const Pu_axial = 1.5 * Ps;

  // IS 456 Cl 39.3 — design must include moment from minimum eccentricity
  // emin = max(L/500 + b/30, 20mm). If emin > 0.05·D, moment must be considered.
  // We approximate by reducing axial capacity via a multiplier:
  // For uniaxial bending with small e: Pu_eq ≈ Pu × (1 + 6·e/D) (approximate
  // for symmetric reinforcement). This is a simplification; full P-M check
  // is shown in the dedicated P-M Interaction page.
  let Pu = Pu_axial;

  // Size from axial capacity (accounts for emin reduction inside loop)
  const fck_eff=0.4*fck+0.008*(0.67*fy-0.4*fck);
  let size=Math.max(300,Math.ceil(Math.sqrt(Math.max(Pu*1000/fck_eff,90000))/25)*25);
  for(let iter=0;iter<20;iter++){
    const Ag=size*size;
    const Ar=(Pu*1000-0.4*fck*Ag)/(0.67*fy-0.4*fck);
    const Af=clamp(Math.max(Ar,0.008*Ag),0.008*Ag,0.04*Ag);
    const dB=Pu>800?20:16;
    const nb=Math.max(4,Math.ceil(Af/(Math.PI*dB*dB/4)));
    const Aprov=nb*(Math.PI*dB*dB/4);
    const Pcap_a=(0.4*fck*(Ag-Aprov)+0.67*fy*Aprov)/1000;
    // Reduce capacity for min-eccentricity moment (IS 456 Cl 39.3)
    const emin_i=Math.max(floorHt*1000/500+size/30,20);
    const eR=emin_i/size;
    const red=eR>0.05?Math.max(0.6,1-1.5*eR):1.0;
    if(Pcap_a*red>=Pu||size>=800) break;
    size+=25;
  }
  const Ag=size*size;
  const Ar=(Pu*1000-0.4*fck*Ag)/(0.67*fy-0.4*fck);
  const Af=clamp(Math.max(Ar,0.008*Ag),0.008*Ag,0.04*Ag);
  const dB=Pu>800?20:16;
  const dBA=Math.PI*dB*dB/4;
  const nb=Math.max(4,Math.ceil(Af/dBA));
  const Aprov=nb*dBA;
  const Pcap_axial=(0.4*fck*(Ag-Aprov)+0.67*fy*Aprov)/1000;
  const pt=Aprov/Ag*100;
  const leff=0.65*floorHt*1000, lex=leff/size;
  const emin=Math.max(floorHt*1000/500+size/30,20);
  const ts=Math.min(size,16*dB,300);
  const tsc=Math.min(ts,8*dB,100,75);
  const Lo=Math.max(size,floorHt*1000/6,450);

  // IS 456 Cl 39.3 — if emin > 0.05·D, axial-only capacity must be reduced.
  // Conservative approximation using Bresler's reciprocal load equation
  // simplified for uniaxial bending: Pcap_eff = Pcap_axial × (1 - 1.5·emin/size)
  // (works for small eccentricities up to ~0.1·size; full P-M shown on Advanced page).
  const eRatio = emin/size;
  const eccReduction = eRatio > 0.05 ? Math.max(0.6, 1 - 1.5*eRatio) : 1.0;
  const Pcap = Pcap_axial * eccReduction;
  const Mu_min = Pu * emin / 1000; // kN·m moment from min eccentricity

  const isCorner=(node.row===0||node.row===GRID.ny)&&(node.col===0||node.col===GRID.nx);
  const isEdge=!isCorner&&(node.row===0||node.row===GRID.ny||node.col===0||node.col===GRID.nx);
  const posType=isCorner?'CC':isEdge?'EC':'IC';
  const rowLbl=String.fromCharCode(65+node.row);
  const colLbl=String(node.col+1);
  const baseLabel=node.label||(posType+rowLbl+colLbl);

  return{
    baseLabel, nodeId:node.id, floorsAbove,
    row:node.row, col:node.col,
    Ps, Pu, Pcap, Pcap_axial, eccReduction, Mu_min,
    size, Ag,
    Ar, Af, Aprov, pt, nb, dB,
    leff, lex, short:lex<=12, emin,
    ts, tsc, Lo,
    safe:Pu<=Pcap,
    ta:slabArea, perimLen,
    corner:isCorner, edge:isEdge, inter:!isCorner&&!isEdge,
  };
}

// ── DESIGN ONE FOOTING ────────────────────────────────────────
function designOneFooting(col, soilBearing, ftgDepth, coverFtg, fck, fy, ftgMinD, AstFn){
  const Ps=col.Ps, colSz=col.size;
  const qn=Math.max(80,soilBearing-ftgDepth*18);
  let Bf=Math.max(Math.ceil(Math.sqrt(Ps/qn)*100)/100, colSz/1000+0.3);
  const qu=Ps/(Bf*Bf), quf=qu*1.5;
  const dprel=(Bf*1000-colSz)/4;
  const D=Math.max(ftgMinD||300,Math.ceil((dprel+coverFtg+8)/25)*25);
  const d=D-coverFtg-8;
  const bo=4*(colSz+d);
  const Pu=Ps*1.5;
  const Vpu=Math.max(0,Pu-quf*(colSz/1000+d/1000)**2);
  const tvp=Vpu*1000/(bo*d), tcp=0.25*Math.sqrt(fck);
  const proj=Math.max(0,(Bf*1000-colSz)/2-d);
  const Vow=quf*Bf*proj/1000;
  const tvow=Vow*1000/(Bf*1000*d), tcow=0.36;
  const x=(Bf-colSz/1000)/2;
  const Mu=quf*Bf*x*x/2;
  const Af=Math.max(AstFn(Mu,Bf*1000,d),0.12*Bf*1000*D/100);
  const dBf=12, dBfA=Math.PI*36;
  // Spacing of bars across the footing width Bf [m]:
  // Steel per metre strip = Af / Bf [mm²/m]
  // Spacing [mm] = 1000 × area_per_bar / (steel per metre) = 1000·dBfA·Bf / Af
  // Previous version dropped Bf — gave over-tight spacing (extra steel).
  const spf=clamp(Math.floor(1000*dBfA*Bf/Af),75,300);
  const Ldr=devLength(dBf, fy, fck, {hook:true});
  const Lda=(Bf*1000-colSz)/2-coverFtg;
  const Pa=0.45*fck*colSz*colSz/1000;
  return{
    nodeId:col.nodeId, row:col.row, col:col.col,
    baseLabel:col.baseLabel,
    Ps,qu,quf,Bf,D,d,bo,Pu,
    Vpu,tvp,tcp,punch_ok:tvp<=tcp,
    Vow,tvow,tcow,ow_ok:tvow<=tcow,
    Mu,Af,dBf,spf,Ldr,Lda,Ld_ok:Lda>=Ldr,
    Pa,tr_ok:Ps<=Pa,colSize:colSz,
  };
}

// ── DESIGN ONE BEAM for a specific floor ──────────────────────
function designOneBeam(gridBeam, floorNum, isRoof,
                        DL_sl, floorFinish, partitions,
                        udlLL_floor, udlLL_roof, wallLoad,
                        fck, fy, Ec, Mf, coverBeam){
  const L=gridBeam.L;
  if(!L||L<=0) return null;

  // Load: roof uses roof LL, typical floors use floor LL
  const udlLL=isRoof?udlLL_roof:udlLL_floor;
  const trib=getTribWidth(gridBeam);
  const wslab=(DL_sl+floorFinish+partitions+udlLL)*trib;
  // Add stair reaction load to beams adjacent to stair bays
  // Stair slab reaction acts on the beams that support the stair landing/flight ends
  let wstair=0;
  if(!isRoof&&GRID){
    const stairDesigns=window._stairDesignsForBeam||[];
    if(gridBeam.dir==='X'){
      const baAbove=getBay(gridBeam.row-1,gridBeam.col);
      const baBelow=getBay(gridBeam.row,gridBeam.col);
      if(baAbove&&baAbove.type==='staircase'){
        const sd=stairDesigns.find(s=>s.row===gridBeam.row-1&&s.col===gridBeam.col);
        if(sd) wstair+=sd.stairReaction;
      }
      if(baBelow&&baBelow.type==='staircase'){
        const sd=stairDesigns.find(s=>s.row===gridBeam.row&&s.col===gridBeam.col);
        if(sd) wstair+=sd.stairReaction;
      }
    }else{
      const baLeft=getBay(gridBeam.row,gridBeam.col-1);
      const baRight=getBay(gridBeam.row,gridBeam.col);
      if(baLeft&&baLeft.type==='staircase'){
        const sd=stairDesigns.find(s=>s.row===gridBeam.row&&s.col===gridBeam.col-1);
        if(sd) wstair+=sd.stairReaction;
      }
      if(baRight&&baRight.type==='staircase'){
        const sd=stairDesigns.find(s=>s.row===gridBeam.row&&s.col===gridBeam.col);
        if(sd) wstair+=sd.stairReaction;
      }
    }
  }
  const isPerim=(gridBeam.dir==='X'&&(gridBeam.row===0||gridBeam.row===GRID.ny))||
                (gridBeam.dir==='Y'&&(gridBeam.col===0||gridBeam.col===GRID.nx));
  // Roof beams: no wall above, so no wall load
  const wwall=(!isRoof&&isPerim)?wallLoad:0;

  // End conditions
  const coeffs=getMomentCoeffs(gridBeam);
  const alpha=gridBeam.isCantilever?0.5:coeffs.alpha_mid;
  const alphaSup=coeffs.alpha_sup||0;

  // Size: start at L/12, iterate up. bW = max(200, 0.4D) updated each iteration
  let D=Math.max(200,Math.ceil(L*1000/12/25)*25);

  for(let iter=0;iter<40;iter++){
    const bW=Math.max(200,Math.ceil(D*0.4/25)*25); // recalculate bW as D grows
    const wsw=(bW/1000)*(D/1000)*25;
    const wu_try=1.5*(wslab+wsw+wwall);
    const ws_try=(wslab+wsw+wwall);  // service load (unfactored) for deflection
    const d_try=D-coverBeam-8-10;
    if(d_try<=0){D+=25;continue;}
    const Mu_try=alpha*wu_try*L*L;
    const Mulim_try=Mf*fck*bW*d_try*d_try/1e6;
    // Deflection per IS 456 Cl 23.2: use service load + effective I.
    // Approximate I_eff ≈ 0.35·Ig (Branson's formula gives roughly this for
    // typical loading) and apply long-term creep factor 1.6 for sustained loads.
    const I_try=0.35*bW*D*D*D/12;
    const creep=1.6;
    const dfl_try=gridBeam.isCantilever
      ?creep*ws_try*L**4/(8*Ec*I_try/1e12)
      :creep*5*ws_try*L**4/(384*Ec*I_try/1e12);
    const dall_try=gridBeam.isCantilever?L*1000/150:L*1000/250;
    if(Mu_try<=Mulim_try&&dfl_try<=dall_try*0.95) break;
    D+=25;
  }

  const bW=Math.max(200,Math.ceil(D*0.4/25)*25); // final value after loop
  const wsw=(bW/1000)*(D/1000)*25;
  const wu=1.5*(wslab+wsw+wwall)+wstair; // wstair already factored
  const ws=(wslab+wsw+wwall)+wstair/1.5; // service load for deflection
  const d=D-coverBeam-8-10;
  const Mmax=alpha*wu*L*L;
  const Msup=alphaSup*wu*L*L;
  const Mulim=Mf*fck*bW*d*d/1e6;
  // End reactions: for shear design we use the MAX end reaction.
  // SS: 0.5wL each end. Propped cantilever (one end fixed, one SS):
  // R_fixed ≈ 0.625wL, R_pinned ≈ 0.375wL. Fixed-fixed (interior beam): 0.5wL each.
  // Cantilever: full wL at support.
  function endReactionFactor(eL,eR,cant){
    if(cant) return 1.0;
    const cL=eL==='column', cR=eR==='column';
    if(cL&&cR) return 0.5;        // both continuous
    if(cL||cR) return 0.625;      // one continuous, one pinned → max at fixed end
    return 0.5;                    // simply supported
  }
  const RA = endReactionFactor(gridBeam.endLeft, gridBeam.endRight, gridBeam.isCantilever) * wu * L;

  const AstFn=(Mu,b,d2)=>AstCalc(Mu,b,d2,fck,fy,Mf);
  const bA=Math.PI*100;
  const Am=Math.max(AstFn(Mmax,bW,d),0.85*bW*d/fy);
  const As=Math.max(AstFn(Msup,bW,d),0.85*bW*d/fy);
  const nm=Math.max(2,Math.ceil(Am/bA));
  const ns=Math.max(2,Math.ceil(As/bA));
  const Ap=nm*bA;
  const pt=Ap/(bW*d)*100;
  const tv=RA*1000/(bW*d);
  const tcmax=0.62*Math.sqrt(fck);
  const tc=getTc(pt);
  const Asv=2*Math.PI*16;
  const svMid=tv>tc
    ?clamp(Math.floor(0.87*fy*Asv/((tv-tc)*bW)),75,clamp(Math.floor(0.75*d),75,300))
    :clamp(Math.floor(0.75*d),75,300);
  const svEnd=Math.min(Math.floor(d/4),Math.floor(8*20),100);
  const EI=(Ec*(0.35*bW*D**3/12))/1e12;   // effective EI (cracked, ≈0.35 Ig)
  const creep=1.6;                          // long-term creep multiplier
  const dfl=gridBeam.isCantilever?creep*ws*L**4/(8*EI):creep*5*ws*L**4/(384*EI);
  const dall=gridBeam.isCantilever?L*1000/150:L*1000/250;
  const Ld=devLength(20, fy, fck);

  // Label: e.g. B-A1-X F2 means beam at row A col 1 X-direction floor 2
  const rowLbl=String.fromCharCode(65+gridBeam.row);
  const colLbl=String(gridBeam.col+1);
  const typ=gridBeam.isCantilever?'CANT':gridBeam.isTransfer?'TRF':gridBeam.isSecondary?'SEC':'B';
  const label=`${typ}${rowLbl}${colLbl}-${gridBeam.dir}`;
  const floorLabel=isRoof?'Roof':`F${floorNum}`;

  return{
    id:gridBeam.id, label, floorLabel, floor:floorNum, isRoof,
    dir:gridBeam.dir, row:gridBeam.row, col:gridBeam.col,
    L, b:bW, D, d, wu, RA,
    Mmax, Msup, Mulim,
    Am, As2:As, nm, ns, Ap, pt,
    tv, tc, tcmax, sv:svMid, svd:svEnd,
    dfl, dall, deflOK:dfl<=dall, shearSafe:tv<=tcmax,
    EI, Ld,
    wslab, wsw, ww:wwall, trib,
    deflUtil:dfl/dall, momUtil:Mmax/Mulim, shearUtil:tv/tcmax,
    endCond:coeffs.label||coeffs.type,
    isCantilever:!!gridBeam.isCantilever,
    isTransfer:!!gridBeam.isTransfer,
    isSecondary:!!gridBeam.isSecondary,
    singly:true, Ast2:0, n2:0, bay:gridBeam.col||0,
    overDesigned:dfl/dall<0.4&&Mmax/Mulim<0.4&&pt<0.5,
  };
}

// ── MAIN ENGINE ────────────────────────────────────────────────
function runCalcsFromGrid(){
  // Ensure GRID is initialized — initGrid() is idempotent and safe to call.
  // We no longer fall back to the old runCalcs() because it returns a
  // structurally-different RES that breaks downstream report rendering.
  if(!GRID){
    if(typeof initGrid === 'function') initGrid();
    if(!GRID) throw new Error('Grid could not be initialised. Please go to Plan & Spans and add at least one bay.');
  }

  GRID.beams.forEach(b=>autoEndConditions(b));
  updateTransferBeams();

  const{fck,fy,Es,numFloors,floorHt,
    udlLL,udlRoof,floorFinish,partitions,wallLoad,
    slabThk,coverSlab,coverBeam,coverCol,coverFtg,
    soilBearing,ftgDepth,ftgMinD,
    zone,soilType,importance,windZone,terrain}=S;

  S.buildingL=S.spansX.reduce((a,b)=>a+b,0);
  S.buildingW=S.spansY.reduce((a,b)=>a+b,0);

  const Ec=5000*Math.sqrt(fck), fyd=fy/1.15;
  // IS 456 Cl 38.1 — limiting xu_max/d depends on steel grade.
  // Fe250: 0.531, Fe415: 0.48, Fe500: 0.46. Derived from εcu=0.0035 and εsu=0.87fy/Es+0.002 (HYSD)
  const xu_d = fy>=500 ? 0.46 : fy>=415 ? 0.48 : 0.531;
  const Mf=0.36*xu_d*(1-0.42*xu_d);
  const DL_sl=slabThk/1000*25;
  const DL_tot=DL_sl+floorFinish+partitions;
  const AstFn=(Mu,b,d)=>AstCalc(Mu,b,d,fck,fy,Mf);

  // ── BAY ANALYSIS ──────────────────────────────────────────────
  const slabBays   = GRID.bays.filter(b=>b.type==='slab');
  const voidBays   = GRID.bays.filter(b=>b.type!=='slab'&&b.type!=='staircase');
  const stairBays  = GRID.bays.filter(b=>b.type==='staircase');
  const slabFloorArea = slabBays.reduce((s,b)=>(s+(S.spansX[b.col]||0)*(S.spansY[b.row]||0)),0);

  // ── SLAB: design EVERY slab bay individually ─────────────────
  const wu_sl_floor = 1.5*(DL_sl+floorFinish+partitions+udlLL);
  const wu_sl_roof  = 1.5*(DL_sl+floorFinish+(udlRoof||1.5));

  function designSlabBay(bay, isRoof){
    const spX=S.spansX[bay.col]||3, spY=S.spansY[bay.row]||3;
    const lx=Math.min(spX,spY), ly=Math.max(spX,spY);
    const ratio=ly/lx, twoWay=ratio<2;
    // Minimum D: IS 456 Cl 23.2 l/d ≤ 26 for two-way, 20 for one-way
    const ldRatio=twoWay?26:20;
    const D=Math.max(slabThk, Math.ceil(lx*1000/ldRatio/5)*5, 125);
    const d=D-coverSlab-5;
    const wu=isRoof?wu_sl_roof:wu_sl_floor;
    const caseN=getSlabCase(bay);
    const coeffs=getSlabCoeffs(caseN,Math.min(ratio,2.0));
    const ax=coeffs?.ax||(twoWay?0.062:0.125);
    const ay=coeffs?.ay||(twoWay?0.062:0);
    // IS 456 Table 26 negative moment coefficients
    const ax_n=coeffs?.ax_n||ax*1.33;
    const ay_n=coeffs?.ay_n||ay*1.33;
    const Mx=ax*wu*lx*lx, My=ay*wu*lx*lx;
    const Mx_neg=ax_n*wu*lx*lx, My_neg=ay_n*wu*lx*lx;
    const Mulim=Mf*fck*1000*d*d/1e6;
    const Ax=AstFn(Mx,1000,d);
    const Ay=Math.max(AstFn(My,1000,d),0.12*1000*D/100);
    const Ax_neg=Math.max(AstFn(Mx_neg,1000,d),0.12*1000*D/100);
    const Ay_neg=Math.max(AstFn(My_neg,1000,d),0.12*1000*D/100);
    // Bar spacings: T10 bottom, T8 top
    const spx  =clamp(Math.floor(1000*Math.PI*25/Ax),75,Math.min(3*D,300));
    const spy  =clamp(Math.floor(1000*Math.PI*16/Ay),75,300);
    const spx_n=clamp(Math.floor(1000*Math.PI*16/Ax_neg),75,300);
    const spy_n=clamp(Math.floor(1000*Math.PI*16/Ay_neg),75,300);
    // l/d check
    const ld=lx*1000/d;
    const ld_ok=ld<=ldRatio;
    const rowLbl=String.fromCharCode(65+bay.row);
    const colLbl=String(bay.col+1);
    return{
      bayLabel:'Bay '+rowLbl+colLbl, row:bay.row, col:bay.col,
      spX, spY, lx, ly, ratio, twoWay, D, d, isRoof,
      wu, caseN, caseName:coeffs?.name||'',
      ax, ay, ax_n, ay_n,
      Mx, My, Mx_neg, My_neg, Mulim,
      Ax, Ay, Ax_neg, Ay_neg,
      spx, spy, spx_n, spy_n,
      ld, ldRatio, ld_ok,
      ok:Mx<=Mulim&&My<=Mulim&&ld_ok,
    };
  }

  // Design all slab bays for typical floor and roof
  const allSlabPanels=[];
  slabBays.forEach(bay=>{
    allSlabPanels.push({...designSlabBay(bay,false), floor:'Typical'});
    allSlabPanels.push({...designSlabBay(bay,true),  floor:'Roof'});
  });

  // Staircase bays get stair slab design (not two-way panel)
  const stairPanels=stairBays.map(bay=>{
    const rowLbl=String.fromCharCode(65+bay.row);
    const colLbl=String(bay.col+1);
    return{bayLabel:'Stair '+rowLbl+colLbl, row:bay.row, col:bay.col, isStair:true,
      spX:S.spansX[bay.col]||3, spY:S.spansY[bay.row]||3};
  });

  // Critical bay: governs uniform slab thickness for construction
  const critBay = slabBays.length>0
    ? slabBays.reduce((a,b)=>
        Math.min(S.spansX[b.col]||3,S.spansY[b.row]||3) >
        Math.min(S.spansX[a.col]||3,S.spansY[a.row]||3) ? b : a)
    : {row:0,col:0,type:'slab'};
  const lx   = allSlabPanels.length>0 ? allSlabPanels[0].lx : 3;
  const ly   = allSlabPanels.length>0 ? allSlabPanels[0].ly : 4;
  const ratio= ly/lx, twoWay=ratio<2;
  // Use max D across all panels for construction (uniform thickness)
  const slabD= allSlabPanels.length>0
    ? Math.max(slabThk, ...allSlabPanels.map(p=>p.D))
    : Math.max(slabThk,150);
  const slabd= slabD-coverSlab-5;
  const wu_sl= wu_sl_floor;
  const caseN= allSlabPanels.length>0 ? allSlabPanels[0].caseN : 9;
  const slabCoeffs= getSlabCoeffs(caseN,Math.min(ratio,2.0));
  const ax=slabCoeffs?.ax||(twoWay?0.062:0.125);
  const ay=slabCoeffs?.ay||(twoWay?0.062:0);
  const Mx=ax*wu_sl*lx*lx, My=ay*wu_sl*lx*lx;
  const Mulim_sl=Mf*fck*1000*slabd*slabd/1e6;
  const Ax=AstFn(Mx,1000,slabd);
  const Ay=Math.max(AstFn(My,1000,slabd),0.12*1000*slabD/100);
  const spx=clamp(Math.floor(1000*Math.PI*25/Ax),75,Math.min(3*slabD,300));
  const spy=clamp(Math.floor(1000*Math.PI*16/Ay),75,300);
  const spxn=clamp(Math.floor(1000*Math.PI*16/Math.max(AstFn(Mx*0.8,1000,slabd)*0.5,180)),75,300);

  // ── SEISMIC (uses actual slab area, not total plan) ───────────
  // IS 1893:2016 Cl 6.4 — design horizontal seismic coefficient
  const ZM={II:0.10,III:0.16,IV:0.24,V:0.36};
  const Z=ZM[zone]||0.24,Ifac=importance,R=5;
  const H=numFloors*floorHt;
  // Period from Cl 7.6.2(c) for frames with infill — uses base dimension
  // in considered direction. We compute Ta in each direction; the worse
  // case (max Vb) governs.
  const Ta_x = 0.09*H/Math.sqrt(S.buildingW);   // shaking along X
  const Ta_y = 0.09*H/Math.sqrt(S.buildingL);   // shaking along Y
  // IS 1893:2016 Cl 6.4.5 — Sa/g spectrum (proper per-soil-type curves,
  // NOT the old IS 1893:2002 single curve + multiplier approach)
  function spectralAccel(T,soil){
    if(T<=0.10) return 1+15*T;
    if(soil==='I'){       // rock / hard soil
      if(T<=0.40) return 2.5;
      return 1.00/T;
    } else if(soil==='III'){ // soft soil
      if(T<=0.67) return 2.5;
      return 1.67/T;
    } else {              // medium soil (Type II — default)
      if(T<=0.55) return 2.5;
      return 1.36/T;
    }
  }
  const Sa_x = spectralAccel(Ta_x, soilType);
  const Sa_y = spectralAccel(Ta_y, soilType);
  // For backward compatibility, keep "Ta", "Sa", "sf" pointing to governing direction
  const useDirX = Sa_x >= Sa_y;
  const Ta = useDirX ? Ta_x : Ta_y;
  const Sa = useDirX ? Sa_x : Sa_y;
  const sfac = 1.0;  // multiplier no longer needed — handled inside spectralAccel()
  const Ah=(Z/2)*(Sa/R)*Ifac;
  const wallPerim=2*(S.buildingL+S.buildingW);
  // IS 1893:2016 Table 8 — imposed load fraction for seismic weight
  // LL ≤ 3 kN/m² → 25%; LL > 3 kN/m² → 50%
  const llFactor = udlLL > 3 ? 0.5 : 0.25;
  const llFactor_roof = (udlRoof||1.5) > 3 ? 0.5 : 0.25;
  // Each typical floor has DL + LL fraction + wall load
  const Wf_floor = DL_tot*slabFloorArea + llFactor*udlLL*slabFloorArea + wallLoad*wallPerim;
  // Roof has DL + roof-LL fraction but NO wall load above (parapet ignored)
  const Wf_roof  = DL_tot*slabFloorArea + llFactor_roof*(udlRoof||1.5)*slabFloorArea;
  // Total seismic weight = (numFloors-1) typical floors + 1 roof
  const Wt = Wf_floor*(numFloors-1) + Wf_roof;
  const Vb=Ah*Wt;
  const floors_s=[];
  for(let i=1;i<=numFloors;i++){
    const hi=i*floorHt;
    const Wi=(i===numFloors)?Wf_roof:Wf_floor;
    floors_s.push({floor:i,h:hi,W:Wi,Wh2:Wi*hi*hi});
  }
  const sWh=floors_s.reduce((a,f)=>a+f.Wh2,0);
  floors_s.forEach(f=>{f.Qi=sWh>0?Vb*f.Wh2/sWh:0;});
  let cs=0;for(let i=floors_s.length-1;i>=0;i--){cs+=floors_s[i].Qi;floors_s[i].Vi=cs;}

  // ── WIND ──────────────────────────────────────────────────────
  const VbW={I:33,II:39,III:44,IV:47,V:50,VI:55}[windZone]||47;
  const k2={'1':1.05,'2':0.98,'3':0.91}[terrain]||0.98;
  const Vz=VbW*k2,pz=0.6*Vz*Vz/1000,Fw=1.3*pz;

  // ── STAIR: design each stair bay individually ────────────────
  // Riser/tread from actual floor height
  const riser=Math.min(175,Math.round(floorHt*1000/Math.ceil(floorHt*1000/165)));
  const tread=Math.max(250,600-riser);
  const theta=Math.atan(riser/tread);  // stair angle in radians

  function designStairBay(bay){
    const spX=S.spansX[bay.col]||3;
    const spY=S.spansY[bay.row]||3;
    // Flight span = shorter bay dimension (stair goes across shorter span)
    // Landing takes ~30% of span, flight takes ~70%
    const flightSpan=Math.min(spX,spY)*0.7;
    const landingSpan=Math.min(spX,spY)*0.3;
    // Waist slab thickness: max of user input, L/20 for stair (steeper l/d)
    const wD=Math.max(slabThk, Math.ceil(flightSpan*1000/20/5)*5, 125);
    const wd=wD-coverSlab-5;
    // Loading on inclined flight
    const DL_waist=(wD/1000)*25/Math.cos(theta);
    const DL_steps=(riser/2/1000)*25;
    const LL_stair=3.0; // IS 875 Part 2: stairs 3.0 kN/m²
    const DLst=DL_waist+DL_steps+floorFinish;
    const wust=1.5*(DLst+LL_stair);
    // Moment: treat as simply supported on flight span
    const Mst=wust*flightSpan*flightSpan/8;
    const Ast2=AstFn(Mst,1000,wd);
    const stsp=clamp(Math.floor(1000*Math.PI*100/Ast2),75,200);
    // Stair reaction load on adjacent beams (per metre width)
    // RA = RB = wust * flightSpan / 2 (for SS beam analogy)
    const stairReaction=wust*flightSpan/2;  // kN/m width
    const rowLbl=String.fromCharCode(65+bay.row);
    const colLbl=String(bay.col+1);
    return{
      bayLabel:'Stair '+rowLbl+colLbl,
      row:bay.row, col:bay.col,
      spX, spY, flightSpan, landingSpan,
      riser, tread, theta:theta*180/Math.PI,
      wD, wd, DL_waist, DL_steps, DLst, wust,
      LL_stair, Mst, Ast2, stsp,
      stairReaction,
      isStair:true,
    };
  }

  // Design all stair bays
  const allStairDesigns=stairBays.map(designStairBay);

  // Backward compat: single stair object for report (first stair bay, or fallback)
  const firstStair=allStairDesigns[0];
  const stairSpan=firstStair?firstStair.flightSpan:1.5;
  const wD=firstStair?firstStair.wD:Math.max(125,slabThk);
  const wd=firstStair?firstStair.wd:wD-coverSlab-5;
  const DLst=firstStair?firstStair.DLst:wD/1000*25+(riser/2/1000)*25+floorFinish;
  const wust=firstStair?firstStair.wust:1.5*(DLst+3.0);
  const Mst=firstStair?firstStair.Mst:wust*stairSpan*stairSpan/8;
  const Ast2=firstStair?firstStair.Ast2:AstFn(Mst,1000,wd);
  const stsp=firstStair?firstStair.stsp:clamp(Math.floor(1000*Math.PI*100/Ast2),75,200);

  // Make stair designs available to designOneBeam via window ref
  window._stairDesignsForBeam=allStairDesigns;

  // ── BEAMS: design for EVERY floor ────────────────────────────
  // Floor numbering: 1=ground floor beams (between GL and F1)
  // numFloors = top floor = Roof beams
  const allBeams=[];
  for(let flr=1;flr<=numFloors;flr++){
    const isRoof=(flr===numFloors);
    GRID.beams.filter(b=>b.L>0).forEach(b=>{
      const result=designOneBeam(
        b, flr, isRoof,
        DL_sl, floorFinish, partitions, udlLL, udlRoof||1.5, wallLoad,
        fck, fy, Ec, Mf, coverBeam
      );
      if(result) allBeams.push(result);
    });
  }

  // ── COLUMNS: design for EVERY node, EVERY floor ──────────────
  const colNodes=GRID.nodes.filter(n=>n.hasColumn||n.isWall);
  const allCols=[];
  colNodes.forEach(node=>{
    // Design column at each storey level
    // Floor f column supports (numFloors - f + 1) floors above it
    for(let flr=1;flr<=numFloors;flr++){
      const floorsAbove=numFloors-flr+1; // ground=numFloors, top=1
      const result=designOneColumn(
        node, floorsAbove, DL_tot, udlLL, udlRoof||1.5,
        wallLoad, fck, fy, floorHt, coverCol, Mf, numFloors
      );
      const rowLbl=String.fromCharCode(65+node.row);
      const colLbl=String(node.col+1);
      const floorLabel=flr===numFloors?'Roof':`F${flr}`;
      result.floor=flr;
      result.floorsAbove=floorsAbove;
      result.floorLabel=floorLabel;
      result.label=result.baseLabel+'-'+floorLabel;
      allCols.push(result);
    }
  });

  // ── FOOTINGS: one per column node (ground floor load = max) ───
  const groundCols=colNodes.map(node=>{
    return allCols.find(c=>c.nodeId===node.id&&c.floor===1);
  }).filter(Boolean);
  const allFtgs=groundCols.map(col=>{
    const ftg=designOneFooting(col,soilBearing,ftgDepth,coverFtg,fck,fy,ftgMinD||300,AstFn);
    ftg.label='FTG-'+col.baseLabel;
    ftg.lbl=ftg.label; // alias — both f.label and f.lbl work
    ftg.colLabel=col.baseLabel;
    return ftg;
  });

  // ── SLAB: design for each FLOOR (typical vs roof) ─────────────
  // Typical floor slab
  const slabFloor={lx,ly,ratio,twoWay,slabD,slabd,DL_sl,wu_sl,Mx,My,ax,ay,
    Mulim:Mulim_sl,Ax,Ay,spx,spy,spx_n:spxn,
    ok:Mx<=Mulim_sl,ld_ok:lx*1000/slabd<=26,
    slabCase:caseN,slabCaseName:slabCoeffs?.name||'',
    floor:'Typical',udlLL};
  // Roof slab (lighter LL)
  const wu_roof=1.5*(DL_sl+floorFinish+(udlRoof||1.5));
  const Mx_r=ax*wu_roof*lx*lx, My_r=ay*wu_roof*lx*lx;
  const Ax_r=AstFn(Mx_r,1000,slabd);
  const Ay_r=Math.max(AstFn(My_r,1000,slabd),0.12*1000*slabD/100);
  const slabRoof={...slabFloor,
    wu_sl:wu_roof,Mx:Mx_r,My:My_r,Ax:Ax_r,Ay:Ay_r,
    spx:clamp(Math.floor(1000*Math.PI*25/Ax_r),75,Math.min(3*slabD,300)),
    spy:clamp(Math.floor(1000*Math.PI*16/Ay_r),75,300),
    ok:Mx_r<=Mulim_sl,floor:'Roof',udlLL:udlRoof||1.5};


  // ── WARNINGS ──────────────────────────────────────────────────
  const warnings=[];
  const missingCols=GRID.nodes.filter(n=>!n.hasColumn&&!n.isWall);
  if(missingCols.length>0)
    warnings.push(missingCols.length+' removed column(s) — transfer beams carry these loads.');
  if(voidBays.length>0)
    warnings.push(voidBays.length+' void/opening bay(s) — excluded from column loads and seismic weight.');
  if(stairBays.length>0)
    warnings.push(stairBays.length+' staircase bay(s) — stair slab designed separately.');
  const cantBeams=GRID.beams.filter(b=>b.isCantilever);
  if(cantBeams.length>0)
    warnings.push(cantBeams.length+' cantilever beam(s) — check L/150 deflection limit.');
  const userOverrides=GRID.beams.filter(b=>b.endCondOverride);
  if(userOverrides.length>0)
    warnings.push(userOverrides.length+' beam(s) with user-set end conditions.');

  // ── BACKWARD COMPAT ALIASES ─────────────────────────────────────
  // RES.beams = all ground floor beams (used by PDF, improvements, summary)
  // RES.cols = all ground floor columns (worst case — most loaded)
  // RES.ftgs = all footings (already per-node)
  const typicalBeams=allBeams.filter(b=>b.floor===1);
  const groundColsForReport=allCols.filter(c=>c.floor===1);

  return{
    mat:{Ec,fcd:0.446*fck,fyd,Mf},
    slab:slabFloor,
    slabRoof,
    slabs:[slabFloor,slabRoof],
    allSlabPanels, stairPanels,
    seis:{Z,I:Ifac,R,sf:sfac,Ta,Sa,Ah,Wt,Vb,floors:floors_s,slabFloorArea},
    wind:{VbW,k2,Vz,pz,Fw},
    // All members across all floors
    allBeams, allCols, allFtgs,
    // Backward compat for existing report functions
    beams:typicalBeams,
    cols:groundColsForReport,
    ftgs:allFtgs,
    stair:{riser,tread,wD,wd,DLst,wust,Mst,Ast2,stsp,ss:stairSpan},
    allStairDesigns,
    warnings,
    gridSummary:{
      nCols:colNodes.length,
      nMissing:missingCols.length,
      nTransfer:GRID.beams.filter(b=>b.isTransfer).length,
      nCant:cantBeams.length,
      nVoid:voidBays.length,
      nSlab:slabBays.length,
      nFloorsBeams:numFloors,
      totalBeams:allBeams.length,
      totalCols:allCols.length,
      totalFtgs:allFtgs.length,
    },
  };
}

function runNow(){
  const ldEl=document.getElementById('ld');
  const rbEl=document.getElementById('rb');
  if(ldEl)ldEl.style.display='block';
  if(rbEl)rbEl.disabled=true;
  setTimeout(()=>{
    try{
      if(!GRID)initGrid();
      RES=runCalcsFromGrid();
      if(!RES){alert('Calculation returned empty. Check inputs.');return;}
      go(7);
    }catch(e){
      console.error('runCalcs error:',e);
      const m=document.getElementById('main');
      if(m)m.innerHTML='<div class="card" style="border-color:rgba(248,113,113,.5)"><div class="ct" style="color:var(--red)">Calculation Error</div><div class="cp re"><strong>Error:</strong> '+e.message+'</div><button class="btn" onclick="go(2)">Fix Plan</button></div>';
    }
  },1200);
}


