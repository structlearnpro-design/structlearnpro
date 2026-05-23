// ═══════════════════════════════════════════════════════════════════
// STRUCTLEARN PRO — ENGINE
// Core calculation engine: state, grid, IS 456/1893/875 design
// This file is loaded FIRST by StructLearnPro.html
// ═══════════════════════════════════════════════════════════════════

// ── PLATFORM INTEGRATION  ──────────────────────────────────────
let _userPlan='free', _currentProjectId=null, _platformSaveTimer=null, _disabledTabs=[];

window.addEventListener('message',(e)=>{
  if(e.data?.type==='USER_PLAN'){
    _userPlan=e.data.plan||'free';
    // Store user object so cert saves, tracking etc can use user_id
    if(e.data.user) {
      window.U = e.data.user;
      window.P = e.data.user;
    }
    if(typeof updateSidebarForPlan==='function') updateSidebarForPlan(_userPlan);
    try {
      const badge = document.querySelector('.plan-indicator');
      if(badge) {
        badge.textContent = _userPlan==='pro'?'PRO ✓':'FREE';
        badge.style.color = _userPlan==='pro'?'#38bdf8':'#64748b';
      }
    } catch(e2){}
  }
  if(e.data?.type==='DISABLED_TABS'){
    _disabledTabs = Array.isArray(e.data.tabs) ? e.data.tabs : [];
    applyDisabledTabs(_disabledTabs);
  }
  if(e.data?.type==='LOAD_PROJECT'){
    const proj=e.data.project;
    _currentProjectId=proj.id;
    try{
      // Supabase row uses state_json / grid_json columns
      // Legacy saves may use proj.data.S / proj.data.GRID — support both
      const savedS    = proj.state_json || (proj.data && proj.data.S) || null;
      const savedGRID = proj.grid_json  || (proj.data && proj.data.GRID) || null;

      if(savedS && typeof savedS === 'object' && Object.keys(savedS).length > 0){
        // Fresh project: state_json only has name/client/location (≤5 keys)
        // Reset S to defaults first so previous project data doesn't bleed through
        const isFreshProject = Object.keys(savedS).length <= 5 &&
          !savedS.spansX && !savedS.fck && !savedS.numFloors;
        if(isFreshProject){
          // Reset all structural inputs to defaults
          S.spansX=[4,4,4]; S.spansY=[3,3,3];
          S.numFloors=4; S.floorHt=3.2;
          S.buildingL=12; S.buildingW=9;
          S.fck=25; S.fy=500;
          S.udlLL=3.0; S.udlRoof=1.5;
          S.soilBearing=200; S.ftgDepth=1.5;
          S.zone='IV'; S.soilType='II'; S.importance=1.0;
          S.stairType='dogleg'; S.ftgType='isolated';
          S.slabThk=150; S.coverSlab=20; S.coverBeam=25; S.coverCol=40; S.coverFtg=75;
          S.columns=null; S.floorFinish=1.0; S.wallLoad=10;
          // Clear overrides and analysis state
          window._memberOverrides = {};
          window._nodeChoices = {};
          window._coordMode = false;
          localStorage.setItem('_coordMode','false');
          GRID = null;
          RES  = null;
        }
        Object.assign(S, savedS);
        // Safety: ensure spansX/spansY are valid arrays after loading
        if(!Array.isArray(S.spansX)||S.spansX.length===0) S.spansX=[4,4,4];
        if(!Array.isArray(S.spansY)||S.spansY.length===0) S.spansY=[3,3,3];
      }

      // Only restore GRID if it has all required arrays - else force reinit
      if(savedGRID && Array.isArray(savedGRID.nodes) &&
         Array.isArray(savedGRID.beams) && Array.isArray(savedGRID.bays)){
        GRID = savedGRID;
      } else {
        GRID = null; // will be reinitialised when user visits Plan & Spans
      }

      // Restore coordMode
      if(savedS && typeof savedS._coordMode !== 'undefined'){
        window._coordMode = !!savedS._coordMode;
        localStorage.setItem('_coordMode', String(window._coordMode));
      }
      // Restore nodeChoices — if saved, use them; if not, infer from restored GRID
      if(savedS && savedS._nodeChoices && Object.keys(savedS._nodeChoices).length > 0){
        window._nodeChoices = savedS._nodeChoices;
        if(typeof applyNodeChoices === 'function') applyNodeChoices();
      } else if(GRID && GRID.nodes){
        // Infer choices from the restored GRID so AUTO-VOID doesn't override saved bay types
        // Missing node next to at least one slab bay → transfer; else → void
        GRID.nodes.filter(n=>!n.hasColumn&&!n.isWall).forEach(n=>{
          const key = n.row+':'+n.col;
          if(window._nodeChoices[key]) return; // already set
          // Check adjacent bays - if any were saved as 'slab', this was a transfer node
          const adjBays = GRID.bays.filter(b=>
            (b.row===n.row||b.row===n.row-1) && (b.col===n.col||b.col===n.col-1)
          );
          const hasSlabAdj = adjBays.some(b=>b.type==='slab');
          window._nodeChoices[key] = hasSlabAdj ? 'transfer' : 'void';
          n._choice = window._nodeChoices[key];
        });
        // DO NOT call applyNodeChoices — the GRID bay types are already correct from saved data
      }
      // Restore member overrides (beam/col/ftg size changes student applied)
      if(savedS && savedS._memberOverrides && Object.keys(savedS._memberOverrides).length > 0){
        window._memberOverrides = savedS._memberOverrides;
      }

      // Restore RES — always use the saved analysis result if it exists
      const savedRES = proj.results_json || (proj.data && proj.data.RES) || null;
      if(savedRES && typeof savedRES === 'object' && Object.keys(savedRES).length > 0){
        RES = savedRES;
      }

      if(typeof renderAll==='function') renderAll();

      // Go to full report if results exist, else project info
      const goStep = (RES && RES.allBeams) ? 7 : 1;
      if(typeof go==='function') go(goStep);
    }catch(err){ console.error('Load error:',err); }
  }
  if(e.data?.type==='PROJECT_ID'){_currentProjectId=e.data.id;}
});

function requirePro(feat){
  if(_userPlan==='pro')return true;
  window.parent.postMessage({type:'REQUEST_UPGRADE',feature:feat},'*');
  return false;
}

// ── DISABLED TABS — Admin can hide/show any tab ───────────────
function applyDisabledTabs(disabled){
  // Tabs that can NEVER be hidden (core design workflow)
  const CORE = new Set(['n0','n1','n2','n3','n4','n5','n6','n7']);
  // All known nav item IDs
  const ALL_NAV = ['n0','n1','n2','n3','n4','n5','n6','n7','n8',
                   'n9','n10','n11','n12','n13','n14','n15','n16',
                   'n17','n18','n19','n20',
                   'n_certs','n_guide'];
  ALL_NAV.forEach(function(nid){
    const el = document.getElementById(nid);
    if(!el) return;
    if(CORE.has(nid)){ el.style.display=''; return; } // core always visible
    if(disabled.includes(nid)){
      el.style.display='none';
      // If currently on this page, redirect to overview
      if(typeof PAGE!=='undefined' && PAGE===parseInt(nid.replace('n',''))){
        if(typeof go==='function') go(7); // go to Full Report
      }
    } else {
      el.style.display='';
    }
  });
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
      const ftgFail =(RES.allFtgs||[]).some(f=>!f.punch_ok||!f.ow_ok||!f.Ld_ok);
      autoStatus = (beamFail||colFail||ftgFail)?'fail':'pass';
    }
    window.parent.postMessage({
      type:'SAVE_PROJECT',name:nm,
      data:{
        S:   {...S, _nodeChoices:window._nodeChoices||{}, _coordMode:!!window._coordMode,
               _memberOverrides:window._memberOverrides||{}},
        GRID: GRID ? JSON.parse(JSON.stringify(GRID)) : null,
        RES:  (typeof RES!=='undefined'&&RES) ? JSON.parse(JSON.stringify(RES)) : null,
      },
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
  // ── NEW: Coordinate-based column input ──
  // Each column: {x, y} in metres from origin (bottom-left = 0,0)
  // null = use spansX/spansY (legacy mode)
  // array = coordinate mode (new)
  columns: null,
  fck:25,fy:500,Es:200000,
  udlLL:2.0,udlRoof:1.5,floorFinish:1.0,partitions:1.5,wallLoad:12,
  slabThk:150,coverSlab:20,coverBeam:40,coverCol:40,coverFtg:75,
  soilBearing:200,ftgDepth:1.5, ftgMinD:0,windZone:'IV',terrain:'2',
  // Foundation and stair type selections (set in p5)
  ftgType:'isolated',          // 'isolated' | 'combined' | 'raft'
  stairType:'dogleg',          // 'straight' | 'dogleg' | '90turn'
  riser:150,                   // mm — stair riser height
  tread:270,                   // mm — stair tread depth
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

// Glossary strip — shows key terms for a given page type
function glossaryBar(terms) {
  const pills = terms.map(t => {
    const desc = TERM_GLOSSARY[t] || '';
    if (!desc) return '';
    return `<span title="${desc}" style="display:inline-block;padding:2px 8px;margin:2px 3px;background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.2);border-radius:12px;font-size:9px;color:#64748b;cursor:help;white-space:nowrap" onclick="this.style.color=this.style.color===' #38bdf8'?'#64748b':'#38bdf8'"><span style="color:#94a3b8;font-weight:700">${t}</span> = ${desc}</span>`;
  }).filter(Boolean).join('');
  if (!pills) return '';
  return `<div style="margin-bottom:10px;padding:8px 10px;background:rgba(15,23,42,0.6);border:1px solid rgba(56,189,248,0.1);border-radius:8px">
    <div style="font-size:9px;color:#475569;margin-bottom:4px;font-weight:700">📖 KEY TERMS USED ON THIS PAGE</div>
    <div style="line-height:2">${pills}</div>
  </div>`;
}

function krow(k,v,ref='',cls=''){return`<div class="kv"><span class="kv-k">${k}</span><span class="kv-v ${cls}">${v}</span>${ref?`<span class="kv-r">${ref}</span>`:''}</div>`;}

// Auto-WHY lookup — keyed by substrings that appear in the equation string
// ── TERM GLOSSARY — short descriptions shown inline next to each term ──
const TERM_GLOSSARY = {
  'fck':    'concrete compressive strength (N/mm²)',
  'fy':     'steel yield strength (N/mm²)',
  'Pu':     'factored axial load (1.5 × service load)',
  'Ps':     'service axial load (unfactored)',
  'Pcap':   'column axial capacity (IS 456 Cl 39.3)',
  'Ag':     'gross cross-section area of column (mm²)',
  'Ac':     'net concrete area = Ag − Asc (mm²)',
  'Asc':    'area of longitudinal steel in column (mm²)',
  'Ast':    'area of tension reinforcement (mm²)',
  'Asc_req':'steel area required from demand',
  'Asc_min':'minimum steel (0.8% of Ag) per IS 456',
  'Asc_max':'maximum steel (4% of Ag) per IS 456',
  'Aprov':  'steel area actually provided',
  'pt':     'percentage of steel (Asc/Ag × 100)',
  'Mulim':  'limiting moment — max a singly reinforced beam can carry',
  'Mmax':   'maximum bending moment in beam',
  'Mu':     'factored bending moment (design moment)',
  'Mx':     'factored moment in X-direction (short span)',
  'My':     'factored moment in Y-direction (long span)',
  'wu':     'factored UDL on beam (1.5 × total load)',
  'wu =':   'factored UDL on beam (1.5 × total load)',
  'D =':    'overall depth of beam or slab (mm)',
  'D':      'overall depth of beam or slab (mm)',
  'b =':    'width of beam (mm)',
  'b':      'width of beam (mm)',
  'd =':    'effective depth = D − cover − stirrup − half bar (mm)',
  'd':      'effective depth from top fibre to steel centroid (mm)',
  'Ld':     'development length — min bar embedment to avoid pullout',
  'Lda':    'development length available inside footing',
  'Ldr':    'development length required by IS 456',
  'RA':     'reaction at support A (end shear force)',
  'tv':     'nominal shear stress = V/(b×d)',
  'tcmax':  'maximum permissible shear stress for concrete grade',
  'tc':     'design shear strength of concrete (IS 456 Table 19)',
  'Vpu':    'punching shear force around column perimeter',
  'tvp':    'punching shear stress at critical perimeter',
  'tcp':    'permissible punching shear = 0.25√fck',
  'Bf':     'footing plan size (m)',
  'qu':     'factored net upward soil pressure (kN/m²)',
  'Ps_sbc': 'service load used for soil pressure check',
  'Vb':     'base shear — total lateral seismic force on building',
  'Ah':     'design seismic coefficient (Z×Sa/g)/(2×R×I)',
  'Sa/g':   'spectral acceleration from IS 1893 response spectrum',
  'Ta':     'fundamental natural time period of building (seconds)',
  'Z':      'seismic zone factor (IS 1893 Table 3)',
  'R':      'response reduction factor (5 for ductile frames)',
  'I':      'importance factor (1.0 residential, 1.5 hospitals)',
  'Vz':     'design wind speed at height z (m/s)',
  'pz':     'design wind pressure at height z (kN/m²)',
  'Vb =':   'basic wind speed from IS 875 Part 3 map (m/s)',
  'k1':     'risk coefficient (1.0 for 50-year return period)',
  'k2':     'terrain, height & size factor (IS 875 P3 Table 2)',
  'k3':     'topography factor (1.0 for flat ground)',
  'Cpe':    'external pressure coefficient (wind on surface)',
  'Cpi':    'internal pressure coefficient (wind inside building)',
  'lx':     'shorter span of slab panel (m)',
  'ly':     'longer span of slab panel (m)',
  'αx':     'moment coefficient for short span (IS 456 Table 26)',
  'αy':     'moment coefficient for long span (IS 456 Table 26)',
  'l/d':    'span-to-depth ratio (deflection check)',
  'Lo':     'confinement zone length at column ends (IS 13920)',
  'leff':   'effective length of column for buckling check',
  'emin':   'minimum eccentricity of load in column (IS 456 Cl 25.4)',
  'trib':   'tributary width — slab width feeding load to this beam',
};

// Auto-annotate known terms in formula text with small tooltip badge
function annotateTerms(text) {
  if (!text || typeof text !== 'string') return text;
  // Only annotate the left side (equation part), not units or IS references
  // Simple pass: find exact term at word boundary and wrap with tooltip
  let result = text;
  // Sort by length descending to match longer terms first (Asc_req before Asc)
  const terms = Object.entries(TERM_GLOSSARY).sort((a,b)=>b[0].length-a[0].length);
  const annotated = new Set();
  for (const [term, desc] of terms) {
    // Only annotate first occurrence to avoid cluttering
    const clean = term.replace(/[=]/g,'').trim();
    if (annotated.has(clean)) continue;
    // Match term as a word (not inside HTML tags)
    const regex = new RegExp(`(?<![a-zA-Z_])(${clean.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})(?![a-zA-Z_0-9])`, '');
    if (regex.test(result)) {
      result = result.replace(regex, `$1<sup title="${desc}" style="cursor:help;font-size:8px;color:#64748b;margin-left:1px;border-bottom:1px dotted #64748b" onclick="event.stopPropagation()">?</sup>`);
      annotated.add(clean);
    }
  }
  return result;
}

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

// Auto-description for formula results — shown as grey line below each fm() row
const FM_DESC = {
  // Geometry
  'lx':         'lx = shorter span of the slab panel',
  'ly':         'ly = longer span of the slab panel',
  'ly/lx':      'ly/lx = aspect ratio — determines if slab is one-way or two-way',
  'l/d':        'l/d = span-to-depth ratio — IS 456 deflection check (limit 26 for slabs)',
  'Min D':      'D = minimum overall slab/beam depth to control deflection',
  'leff':       'leff = effective length of column used for slenderness check',
  'Slenderness':'slenderness = leff/size — if ≤ 12, column is SHORT (no extra moment needed)',
  // Loads
  'DL_slab':    'DL_slab = self-weight of concrete slab = thickness × 25 kN/m³',
  'Floor finish':'floor finish + partitions = superimposed dead load on slab',
  'Live Load':  'LL = live load from IS 875 Part 2 (2 kN/m² residential, 3 kN/m² office)',
  'wu':         'wu = factored load = 1.5 × (DL + LL) — the 1.5 is IS 456 safety factor',
  'w_slab':     'w_slab = slab load transferred to beam over its tributary width',
  'w_sw':       'w_sw = beam self-weight = b × D × 25 kN/m³ (concrete density)',
  'w_wall':     'w_wall = wall load on beam = wall height × wall thickness × 20 kN/m³',
  'Tributary':  'tributary width = half the slab span on each side of the beam',
  'Ps per floor':'Ps = service load per floor = (DL + 0.25LL) × area + wall load',
  'Ps = ':      'Ps = total service load on column from ALL floors above (unfactored)',
  'Pu = 1.5':   'Pu = factored load = 1.5 × Ps — used for designing the concrete section',
  // Moments
  'Mmax':       'Mmax = maximum bending moment in beam = wu × L² / 8 (for simple support)',
  'Msup':       'Msup = hogging moment at support — for continuous beams from IS 456 Table 12',
  'Mulim':      'Mulim = limiting moment — if Mu > Mulim, beam needs compression steel or bigger depth',
  'Mx':         'Mx = design moment in short span direction (IS 456 Table 26 coefficient αx)',
  'My':         'My = design moment in long span direction (IS 456 Table 26 coefficient αy)',
  'Mu':         'Mu = factored design moment the member must resist',
  // Steel
  'Ast':        'Ast = area of tension steel required to resist the bending moment',
  'Asc_req':    'Asc_req = steel area needed from structural demand (can be zero if Pu is small)',
  'Asc_min':    'Asc_min = minimum 0.8% of column area — prevents brittle failure (IS 456 Cl 26.5.3)',
  'Asc_max':    'Asc_max = maximum 4% of column area — prevents congestion (IS 456 Cl 26.5.3)',
  'Provide:':   'bars provided — actual steel area ≥ required area; pt = steel percentage',
  'Aprov':      'Aprov = steel area actually provided by the chosen bar arrangement',
  'pt':         'pt = steel percentage = (Asc/Ag) × 100 — must be 0.8% to 4% for columns',
  // Shear
  'Vu':         'Vu = factored shear force at beam end = wu × L / 2',
  'tv':         'τv = nominal shear stress = Vu / (b × d) — must be < τc,max',
  'tc ':        'τc = concrete shear capacity from IS 456 Table 19 based on steel % and grade',
  'tcmax':      'τc,max = maximum shear stress concrete can take — if exceeded, section is too small',
  'Vus':        'Vus = shear carried by stirrups = Vu − τc × b × d',
  'Sv':         'Sv = stirrup spacing — closer near supports (Lo zone) where shear is highest',
  // Column
  'Required Ag':'Ag = gross area needed — from axial load formula Pu = 0.4fck·Ac + 0.67fy·Asc',
  'Size = ':    'column size rounded up to nearest 25mm — standard Indian formwork sizes',
  'Pcap':       'Pcap = column capacity (IS 456 Cl 39.3) = 0.4·fck·Ac + 0.67·fy·Asc',
  'emin':       'emin = minimum eccentricity of load (IS 456 Cl 25.4) — accounts for construction imperfection',
  'Lo =':       'Lo = confinement zone at top and bottom of column — closer ties required here (IS 13920)',
  'tie spacing':'tie spacing — general zone uses larger spacing; confinement zone Lo uses closer spacing',
  // Footing
  'B = ':       'B = footing size = √(Ps / net SBC) — use service load for soil pressure',
  'qu':         'qu = factored upward soil pressure = Pu / B² — used to design footing depth and steel',
  'Vpu':        'Vpu = punching shear force around column — acts on perimeter at d/2 from column face',
  'tvp':        'τvp = punching shear stress — must be < 0.25√fck (IS 456 Cl 31.6.3)',
  'tcp':        'τcp = permissible punching shear = 0.25√fck — concrete punching resistance',
  'ow_shear':   'one-way shear — acts across full footing width at distance d from column face',
  'Ld_req':     'Ld = development length — minimum bar length inside footing to prevent bar pullout',
  'Lda':        'Lda = available straight length = (B − col size)/2 − cover',
  // Seismic
  'Z ':         'Z = seismic zone factor (IS 1893 Table 3) — Zone II: 0.10, III: 0.16, IV: 0.24, V: 0.36',
  'I ':         'I = importance factor (1.0 for residential, 1.5 for hospitals and schools)',
  'R ':         'R = response reduction factor (5.0 for ductile RC moment frames per IS 13920)',
  'Ta':         'Ta = fundamental time period of building — longer period = less seismic force',
  'Sa/g':       'Sa/g = spectral acceleration from IS 1893 Fig. 2 — depends on soil type and period',
  'Ah':         'Ah = design seismic coefficient = Z × Sa/g / (2 × R × I)',
  'Vb = Ah':    'Vb = total base shear = Ah × W — horizontal force the building must resist',
  'Qi':         'Qi = seismic force at floor i — upper floors get more force (inverted triangle pattern)',
  // Wind
  'Vb (Zone':   'Vb = basic wind speed from IS 875 Part 3 map — peak gust at 10m in open terrain',
  'k1':         'k1 = risk coefficient (1.0 for 50-year design life)',
  'k2':         'k2 = terrain & height factor — increases with height, decreases in sheltered terrain',
  'k3':         'k3 = topography factor (1.0 for flat ground, higher for hills and ridges)',
  'Vz':         'Vz = design wind speed at height z = Vb × k1 × k2 × k3',
  'pz':         'pz = design wind pressure = 0.6 × Vz² / 1000 kN/m²',
  'Cpe':        'Cpe = external pressure coefficient — +ve pushes into surface, −ve is suction',
  'Net pressure':'net wind pressure = (Cpe + Cpi) × pz — worst combination of internal and external',
  // Stair
  'R (riser':   'R = riser height — vertical step height, typically 150–175mm',
  'T (tread':   'T = tread width — horizontal step depth, typically 250–300mm',
  'waist':      'waist = structural slab thickness along stair slope — carries the load',
  'Leff stair': 'effective span of stair = horizontal distance between supports',
};

function fm(eq, res, ref='') {
  const eqStr = String(eq||'');
  // Look up WHY explanation
  let why = '';
  for (const [key, explanation] of Object.entries(FM_WHY)) {
    if (eqStr.includes(key)) { why = explanation; break; }
  }
  // Look up short description for the result line
  let desc = '';
  for (const [key, d] of Object.entries(FM_DESC)) {
    if (eqStr.includes(key)) { desc = d; break; }
  }
  const refHtml = ref ? clauseRef(ref) : '';
  const descHtml = desc ? `<div style="font-size:9.5px;color:#64748b;margin-top:2px;padding-left:4px;font-style:italic">↳ ${desc}</div>` : '';
  if (!why) {
    return `<div class="fm">${eq} <span class="r">= ${res}</span>${refHtml ? ' '+refHtml : ''}${descHtml}</div>`;
  }
  const id = 'fw' + (++_fmCount);
  return `<div class="fm">${eq} <span class="r">= ${res}</span>${refHtml ? ' '+refHtml : ''}
    <button onclick="var e=document.getElementById('${id}');if(e)e.style.display=e.style.display==='none'?'block':'none'" style="margin-left:8px;padding:1px 7px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.35);border-radius:4px;color:#38bdf8;cursor:pointer;font-size:9px;font-weight:700;vertical-align:middle">WHY?</button>
    <div id="${id}" style="display:none;margin-top:6px;padding:8px 12px;background:rgba(14,165,233,0.07);border-left:2px solid #0ea5e9;border-radius:0 6px 6px 0;font-size:10.5px;color:var(--txt2);line-height:1.8">${why}</div>
    ${descHtml}
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



function svgTribArea(type,spX,spY,colRow,colCol,gridNY,gridNX){
  // colRow, colCol = actual grid position (0-indexed)
  // gridNY, gridNX = total rows/cols in grid
  // Default to 2x2 grid for backward compat
  const nRows = Math.min(gridNY||2, 4);
  const nCols = Math.min(gridNX||2, 4);
  const cr = Math.min(colRow||0, nRows);
  const cc = Math.min(colCol||0, nCols);

  const W=420, H=320, padL=55, padT=30, padR=20, padB=50;
  const maxW = W-padL-padR, maxH = H-padT-padB;
  // Scale to fit the full grid
  const scX = Math.min(maxW/(nCols*spX), maxH/(nRows*spY), 50);
  const scY = scX;
  const bW = spX*scX, bH = spY*scY;

  // Node positions for full grid
  const xs = [], ys = [];
  for(let i=0;i<=nCols;i++) xs.push(padL + i*bW);
  for(let i=0;i<=nRows;i++) ys.push(padT + i*bH);

  // Column node position
  const cx = xs[cc], cy = ys[cr];

  // Tributary area bounds (half bay each side, clamp to grid edge)
  const tribX1 = cc===0 ? xs[0] : xs[cc]-bW/2;
  const tribX2 = cc===nCols ? xs[nCols] : xs[cc]+bW/2;
  const tribY1 = cr===0 ? ys[0] : ys[cr]-bH/2;
  const tribY2 = cr===nRows ? ys[nRows] : ys[cr]+bH/2;
  const tribW = (tribX2-tribX1)/scX;
  const tribH = (tribY2-tribY1)/scY;
  const tribArea = tribW * tribH;

  let g=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g+=`<rect width="${W}" height="${H}" fill="#0a0f1e" rx="6"/>`;
  g+=`<text x="${W/2}" y="20" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">TRIBUTARY AREA — ${type.toUpperCase()} COLUMN</text>`;

  // Slab panels
  for(let r=0;r<nRows;r++) for(let ci=0;ci<nCols;ci++){
    g+=`<rect x="${xs[ci]}" y="${ys[r]}" width="${bW}" height="${bH}" fill="rgba(15,23,42,0.9)" stroke="#334155" stroke-width="1"/>`;
  }

  // Tributary area shading
  g+=`<rect x="${tribX1}" y="${tribY1}" width="${tribX2-tribX1}" height="${tribY2-tribY1}" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="5,3"/>`;

  // Trib dimension lines
  const tdMidX=(tribX1+tribX2)/2, tdMidY=(tribY1+tribY2)/2;
  // Horizontal trib dim
  g+=`<line x1="${tribX1}" y1="${tribY2+8}" x2="${tribX2}" y2="${tribY2+8}" stroke="#38bdf8" stroke-width="0.8"/>`;
  g+=`<line x1="${tribX1}" y1="${tribY2+5}" x2="${tribX1}" y2="${tribY2+11}" stroke="#38bdf8" stroke-width="0.8"/>`;
  g+=`<line x1="${tribX2}" y1="${tribY2+5}" x2="${tribX2}" y2="${tribY2+11}" stroke="#38bdf8" stroke-width="0.8"/>`;
  g+=`<text x="${tdMidX}" y="${tribY2+20}" fill="#38bdf8" font-size="9" text-anchor="middle" font-family="JetBrains Mono">${r2(tribW)}m</text>`;
  // Vertical trib dim
  g+=`<line x1="${tribX2+8}" y1="${tribY1}" x2="${tribX2+8}" y2="${tribY2}" stroke="#38bdf8" stroke-width="0.8"/>`;
  g+=`<line x1="${tribX2+5}" y1="${tribY1}" x2="${tribX2+11}" y2="${tribY1}" stroke="#38bdf8" stroke-width="0.8"/>`;
  g+=`<line x1="${tribX2+5}" y1="${tribY2}" x2="${tribX2+11}" y2="${tribY2}" stroke="#38bdf8" stroke-width="0.8"/>`;
  g+=`<text x="${tribX2+22}" y="${tdMidY+4}" fill="#38bdf8" font-size="9" text-anchor="middle" font-family="JetBrains Mono" transform="rotate(90,${tribX2+22},${tdMidY})">${r2(tribH)}m</text>`;

  // Span dimension lines — bottom
  for(let i=0;i<nCols;i++){
    const y0=ys[nRows]+14;
    g+=`<line x1="${xs[i]}" y1="${y0}" x2="${xs[i+1]}" y2="${y0}" stroke="#f59e0b" stroke-width="0.8"/>`;
    g+=`<text x="${(xs[i]+xs[i+1])/2}" y="${y0+12}" fill="#f59e0b" font-size="9" text-anchor="middle" font-family="JetBrains Mono">${spX}m</text>`;
  }
  // Span dimension lines — left
  for(let i=0;i<nRows;i++){
    const x0=padL-14;
    g+=`<line x1="${x0}" y1="${ys[i]}" x2="${x0}" y2="${ys[i+1]}" stroke="#f59e0b" stroke-width="0.8"/>`;
    g+=`<text x="${x0-10}" y="${(ys[i]+ys[i+1])/2+4}" fill="#f59e0b" font-size="9" text-anchor="middle" font-family="JetBrains Mono" transform="rotate(-90,${x0-10},${(ys[i]+ys[i+1])/2})">${spY}m</text>`;
  }

  // All column nodes — skip if missing in GRID
  xs.forEach((x,ci)=>ys.forEach((y,ri)=>{
    if(x===cx&&y===cy) return; // skip design column slot
    // Check if this node is missing/void in actual GRID
    const gridNode = GRID && getNode(ri, ci);
    if(gridNode && !gridNode.hasColumn) return; // skip void/removed columns
    g+=`<rect x="${x-5}" y="${y-5}" width="10" height="10" fill="#1e293b" stroke="#64748b" stroke-width="1.5" rx="1"/>`;
  }));

  // Design column
  g+=`<rect x="${cx-8}" y="${cy-8}" width="16" height="16" fill="#f97316" stroke="#fb923c" stroke-width="2" rx="2"/>`;
  g+=`<text x="${cx}" y="${cy+4}" fill="white" font-size="8" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">C</text>`;

  // Area label inside trib
  g+=`<text x="${tdMidX}" y="${tdMidY-5}" fill="white" font-size="12" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">A=${r2(tribArea)}m²</text>`;
  g+=`<text x="${tdMidX}" y="${tdMidY+10}" fill="#94a3b8" font-size="8" text-anchor="middle" font-family="JetBrains Mono">tributary area</text>`;

  // Legend
  const lx=W-135, ly=28;
  g+=`<rect x="${lx}" y="${ly}" width="10" height="10" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-width="1"/>`;
  g+=`<text x="${lx+14}" y="${ly+9}" fill="#38bdf8" font-size="9" font-family="JetBrains Mono">Tributary area</text>`;
  g+=`<rect x="${lx}" y="${ly+16}" width="10" height="10" fill="#f97316"/>`;
  g+=`<text x="${lx+14}" y="${ly+25}" fill="#f97316" font-size="9" font-family="JetBrains Mono">Design column</text>`;
  g+=`<rect x="${lx}" y="${ly+32}" width="10" height="10" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>`;
  g+=`<text x="${lx+14}" y="${ly+41}" fill="#64748b" font-size="9" font-family="JetBrains Mono">Other columns</text>`;

  g+=`<text x="${W/2}" y="${H-4}" fill="#475569" font-size="8" text-anchor="middle" font-family="JetBrains Mono">IS 456 — Tributary Area Method for Column Loads</text>`;
  g+='</svg>';
  return`<div class="dg">${g}<div class="dg-cap">Fig: Tributary area (shaded) for ${type} column at grid position Row ${cr+1}, Col ${cc+1}. Area = ${r2(tribArea)}m²</div></div>`;
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

// ── COORDINATE → GRID CONVERSION ────────────────────────────────
// Converts S.columns [{x,y},...] to S.spansX, S.spansY and a
// set of missing nodes (void columns). Returns a validation report.
function coordsToGrid() {
  if (!S.columns || S.columns.length === 0) return { ok: false, error: 'No columns defined.' };

  const cols = S.columns;
  if (cols.length < 2) return { ok: false, error: 'Need at least 2 columns.' };

  // Extract unique X and Y values, sorted
  const SNAP = 0.05; // 5cm tolerance for grouping
  function snapGroup(vals) {
    const sorted = [...new Set(vals.map(v => Math.round(v / SNAP) * SNAP))].sort((a,b)=>a-b);
    // Merge values within 0.1m of each other
    const merged = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - merged[merged.length-1] > 0.1) merged.push(sorted[i]);
    }
    return merged;
  }

  const uniqueX = snapGroup(cols.map(c => c.x));
  const uniqueY = snapGroup(cols.map(c => c.y));

  if (uniqueX.length < 2) return { ok: false, error: 'Need columns at least 2 different X positions.' };
  if (uniqueY.length < 2) return { ok: false, error: 'Need columns at least 2 different Y positions.' };

  // Compute spans
  const spansX = [];
  for (let i = 0; i < uniqueX.length - 1; i++) {
    const span = Math.round((uniqueX[i+1] - uniqueX[i]) * 100) / 100;
    if (span < 1.0) return { ok: false, error: `X span of ${span}m between X=${uniqueX[i]} and X=${uniqueX[i+1]} is too small (min 1.0m).` };
    if (span > 15) return { ok: false, error: `X span of ${span}m exceeds 15m maximum for RC frames.` };
    spansX.push(span);
  }
  const spansY = [];
  for (let i = 0; i < uniqueY.length - 1; i++) {
    const span = Math.round((uniqueY[i+1] - uniqueY[i]) * 100) / 100;
    if (span < 1.0) return { ok: false, error: `Y span of ${span}m is too small (min 1.0m).` };
    if (span > 15) return { ok: false, error: `Y span of ${span}m exceeds 15m maximum for RC frames.` };
    spansY.push(span);
  }

  // Map each student column to grid (row, col)
  const snapVal = (v, arr) => {
    let closest = arr[0], minD = Math.abs(v - arr[0]);
    arr.forEach(a => { const d = Math.abs(v-a); if(d<minD){minD=d;closest=a;} });
    return closest;
  };

  const placedNodes = new Set();
  const offGridWarnings = [];

  cols.forEach((c, i) => {
    const sx = snapVal(c.x, uniqueX);
    const sy = snapVal(c.y, uniqueY);
    if (Math.abs(c.x - sx) > 0.15 || Math.abs(c.y - sy) > 0.15) {
      offGridWarnings.push(`Column ${i+1} at (${c.x},${c.y}) snapped to grid (${sx},${sy})`);
    }
    const col = uniqueX.indexOf(sx);
    const row = uniqueY.indexOf(sy);
    placedNodes.add(`${row}:${col}`);
  });

  // Find missing nodes (grid positions with no column placed)
  const missingNodes = [];
  for (let r = 0; r <= spansY.length; r++) {
    for (let c = 0; c <= spansX.length; c++) {
      if (!placedNodes.has(`${r}:${c}`)) {
        missingNodes.push({ row: r, col: c, x: uniqueX[c], y: uniqueY[r] });
      }
    }
  }

  // Apply to S
  S.spansX = spansX;
  S.spansY = spansY;
  S.buildingL = Math.round((uniqueX[uniqueX.length-1] - uniqueX[0]) * 100) / 100;
  S.buildingW = Math.round((uniqueY[uniqueY.length-1] - uniqueY[0]) * 100) / 100;

  return {
    ok: true,
    spansX, spansY,
    uniqueX, uniqueY,
    missingNodes,
    warnings: offGridWarnings,
    summary: `${cols.length} columns → ${spansX.length}×${spansY.length} grid | X spans: [${spansX.join(', ')}]m | Y spans: [${spansY.join(', ')}]m${missingNodes.length ? ` | ${missingNodes.length} missing nodes (auto transfer beams)` : ''}`
  };
}

// ── DEFAULT COLUMNS from current spansX/spansY ──
// Converts legacy span arrays to coordinate columns for UI display
function spansToColumns() {
  const cols = [];
  let y = 0;
  const ys = [0];
  S.spansY.forEach(s => { y += s; ys.push(Math.round(y*100)/100); });
  let x = 0;
  const xs = [0];
  S.spansX.forEach(s => { x += s; xs.push(Math.round(x*100)/100); });
  ys.forEach(yv => xs.forEach(xv => cols.push({ x: xv, y: yv })));
  return cols;
}

// ── GRID INITIALISATION ─────────────────────────────────────────
function initGrid() {
  // ── STAGE 2: Node-based grid ─────────────────────────────────
  // Convert coordinates to spans if in coordinate mode
  let coordResult = null;
  if (S.columns && S.columns.length >= 2) {
    coordResult = coordsToGrid();
    if (!coordResult.ok) {
      console.warn('coordsToGrid failed:', coordResult.error);
      coordResult = null;
    }
  }

  const nx = S.spansX.length, ny = S.spansY.length;

  // Build cumulative real coordinates from span arrays
  const xPos = [0];
  S.spansX.forEach(s => xPos.push(Math.round((xPos[xPos.length-1]+s)*1000)/1000));
  const yPos = [0];
  S.spansY.forEach(s => yPos.push(Math.round((yPos[yPos.length-1]+s)*1000)/1000));

  const nodes = [], beams = [], bays = [];

  // ── NODES: store actual x,y coordinates ──
  for (let r = 0; r <= ny; r++) {
    for (let c = 0; c <= nx; c++) {
      nodes.push({
        id: r*(nx+1)+c, row: r, col: c,
        x: xPos[c], y: yPos[r],  // Stage 2: real coordinates
        hasColumn: true, isWall: false,
        colSize: null, label: '',
      });
    }
  }

  // Mark missing nodes from coordinate mode
  if (coordResult && coordResult.missingNodes) {
    coordResult.missingNodes.forEach(m => {
      const node = nodes.find(n => n.row===m.row && n.col===m.col);
      if (node) node.hasColumn = false;
    });
  }

  // ── BEAMS: only between nodes where at least one has a column ──
  let beamId = 0;
  // X beams (horizontal)
  for (let r = 0; r <= ny; r++) {
    for (let c = 0; c < nx; c++) {
      const nId1=r*(nx+1)+c, nId2=r*(nx+1)+c+1;
      const n1=nodes[nId1], n2=nodes[nId2];
      if (!n1.hasColumn && !n2.hasColumn) continue; // skip floating beams
      beams.push({
        id: beamId++, dir:'X', n1:nId1, n2:nId2, row:r, col:c,
        L: S.spansX[c],
        spX: S.spansX[c],
        spY: S.spansY[r] || S.spansY[r-1] || 3,
        x1: n1.x, y1: n1.y, x2: n2.x, y2: n2.y,
        endLeft:'column', endRight:'column',
        isSecondary:false, isCantilever:false, isTransfer:false,
        endCondOverride:null, customWu:null,
      });
    }
  }
  // Y beams (vertical)
  for (let c = 0; c <= nx; c++) {
    for (let r = 0; r < ny; r++) {
      const nId1=r*(nx+1)+c, nId2=(r+1)*(nx+1)+c;
      const n1=nodes[nId1], n2=nodes[nId2];
      if (!n1.hasColumn && !n2.hasColumn) continue; // skip floating beams
      beams.push({
        id: beamId++, dir:'Y', n1:nId1, n2:nId2, row:r, col:c,
        L: S.spansY[r],
        spY: S.spansY[r],
        spX: S.spansX[c] || S.spansX[c-1] || 4,
        x1: n1.x, y1: n1.y, x2: n2.x, y2: n2.y,
        endLeft:'column', endRight:'column',
        isSecondary:false, isCantilever:false, isTransfer:false,
        endCondOverride:null, customWu:null,
      });
    }
  }

  // ── BAYS: store span dimensions, auto-void if <2 corners ──
  for (let r = 0; r < ny; r++) {
    for (let c = 0; c < nx; c++) {
      const corners = [
        nodes[r*(nx+1)+c],   nodes[r*(nx+1)+c+1],
        nodes[(r+1)*(nx+1)+c], nodes[(r+1)*(nx+1)+c+1],
      ];
      const colCount = corners.filter(n=>n&&n.hasColumn).length;
      const spX=S.spansX[c], spY=S.spansY[r];
      // Default all bays to 'slab' — applyNodeChoices() will void bays adjacent to void nodes
      // Never auto-void here: let the user choose via the missing node dialog
      bays.push({
        row:r, col:c,
        type: 'slab',
        lx: Math.min(spX,spY), ly: Math.max(spX,spY),
        spX, spY,
        x: xPos[c], y: yPos[r],
        colCount, hasAllCorners: colCount===4,
      });
    }
  }

  GRID = { nodes, beams, bays, nx, ny,
           xPos, yPos, totalX:xPos[nx], totalY:yPos[ny] };
  GE.selected = null;
  return GRID;
}

// ── HELPER QUERIES ──────────────────────────────────────────────
function getNode(r,c){return GRID&&GRID.nodes.find(n=>n.row===r&&n.col===c);}
function getBay(r,c){return GRID&&GRID.bays.find(b=>b.row===r&&b.col===c);}
// Stage 2 helpers:
function getNodeAt(x,y,tol){tol=tol||0.1;return GRID&&GRID.nodes.find(n=>Math.abs(n.x-x)<tol&&Math.abs(n.y-y)<tol);}
function getBeamBetween(i1,i2){return GRID&&GRID.beams.find(b=>(b.n1===i1&&b.n2===i2)||(b.n1===i2&&b.n2===i1));}

function updateTransferBeams() {
  if(!GRID)return;
  GRID.beams.forEach(b=>{
    // Don't reset merged transfer beams (they have _transferNode stored)
    if(b._transferNode !== undefined) { b.isTransfer=true; return; }
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

// ── IS 456 CORRECT SLAB LOAD ON BEAMS ────────────────────────────
// IS 456 Annex D / SP:24 — Equivalent UDL from slab on supporting beams
// Two-way slab (ly/lx < 2):
//   Short-span beam: w_eq = w × lx/3        (triangular distribution)
//   Long-span beam:  w_eq = w × lx/3 × (3-(lx/ly)²)/2  (trapezoidal)
// One-way slab (ly/lx ≥ 2):
//   Short-span beam: w_eq = w × lx/2        (full load, rectangular)
//   Long-span beam:  w_eq = 0               (negligible load transfer)

function getSlabEquivLoad(w_total, lx, ly, beamIsAlongShortSpan){
  // w_total = total slab load per m² (kN/m²)
  // lx = shorter span, ly = longer span
  // beamIsAlongShortSpan: true if beam runs parallel to lx (i.e. it's the SHORT-span beam)
  //   Short-span beam = beam whose span equals lx (runs along X if lx is X-direction)
  //   It RECEIVES the triangular load from the slab

  const ratio = ly / lx;
  const twoWay = ratio < 2.0;

  if(twoWay){
    if(beamIsAlongShortSpan){
      // Triangular load → equivalent UDL = w × lx / 3
      // (IS 456 Annex D, also Varghese "Advanced RC Design" Eq. 3.1)
      return w_total * lx / 3;
    } else {
      // Trapezoidal load → equivalent UDL = w × lx/3 × (3-(lx/ly)²)/2
      // (IS 456 Annex D, Eq. D-3)
      const r = lx / ly;
      return w_total * lx / 3 * (3 - r*r) / 2;
    }
  } else {
    // One-way slab: load goes entirely to short-span beams as rectangular UDL
    if(beamIsAlongShortSpan){
      return w_total * lx / 2;  // half the slab on each short-span beam
    } else {
      return 0;  // long-span beams carry negligible slab load in one-way slabs
    }
  }
}

function getTribWidth(beam){
  // Stage 2: use actual bay dimensions stored on beam object
  // For legacy compatibility, fall back to S.spansX/Y if not stored
  if(!GRID) return (S.spansY.reduce((a,b)=>a+b,0)/S.spansY.length/2);
  let trib=0;
  function secBeamSplits(bayRow,bayCol,perpDir){
    return GRID.beams.some(b=>b.isSecondary&&b.dir===perpDir&&
      b.row===bayRow&&b.col===bayCol);
  }
  if(beam.dir==='X'){
    const ba=getBay(beam.row-1,beam.col);
    const bb=getBay(beam.row,beam.col);
    if(ba&&ba.type==='slab'){
      const spY=ba.spY||S.spansY[beam.row-1]||3; // Stage 2: use bay's stored spY
      const factor=secBeamSplits(beam.row-1,beam.col,'X')?0.5:1.0;
      trib+=spY/2*factor;
    }
    if(bb&&bb.type==='slab'){
      const spY=bb.spY||S.spansY[beam.row]||3;
      const factor=secBeamSplits(beam.row,beam.col,'X')?0.5:1.0;
      trib+=spY/2*factor;
    }
  } else {
    const bl=getBay(beam.row,beam.col-1);
    const br=getBay(beam.row,beam.col);
    if(bl&&bl.type==='slab'){
      const spX=bl.spX||S.spansX[beam.col-1]||4; // Stage 2: use bay's stored spX
      const factor=secBeamSplits(beam.row,beam.col-1,'Y')?0.5:1.0;
      trib+=spX/2*factor;
    }
    if(br&&br.type==='slab'){
      const spX=br.spX||S.spansX[beam.col]||4;
      const factor=secBeamSplits(beam.row,beam.col,'Y')?0.5:1.0;
      trib+=spX/2*factor;
    }
  }
  return Math.max(trib,0.5);
}

// Get correct IS 456 equivalent UDL from slab on a beam
function getBeamSlabLoad(beam, w_slab_per_m2){
  // w_slab_per_m2 = total unfactored slab load (DL+FF+Parts+LL) per m²
  if(!GRID) return w_slab_per_m2 * getTribWidth(beam);

  let wslab = 0;

  function processBay(bayRow, bayCol, beamDir){
    const bay = getBay(bayRow, bayCol);
    if(!bay || bay.type !== 'slab') return 0;

    // Stage 2: use actual bay dimensions stored on bay object
    const spanX = bay.spX || S.spansX[bayCol] || 4;
    const spanY = bay.spY || S.spansY[bayRow] || 3;
    const lx_bay = Math.min(spanX, spanY);
    const ly_bay = Math.max(spanX, spanY);

    // Is this beam running along the short span of this bay?
    // X-beam (runs along X direction) is the SHORT-span beam if spansX < spansY
    // i.e. the beam span equals lx (the shorter dimension)
    let beamIsAlongShortSpan;
    if(beamDir === 'X'){
      // X-beam spans spanX. Is spanX the shorter direction of this bay?
      beamIsAlongShortSpan = spanX <= spanY;
    } else {
      // Y-beam spans spanY. Is spanY the shorter direction?
      beamIsAlongShortSpan = spanY <= spanX;
    }

    // Check for secondary beam splitting load
    function secBeamSplits(perpDir){
      return GRID.beams.some(b=>b.isSecondary&&b.dir===perpDir&&
        b.row===bayRow&&b.col===bayCol);
    }
    const splitFactor = secBeamSplits(beamDir==='X'?'X':'Y') ? 0.5 : 1.0;

    const equiv = getSlabEquivLoad(w_slab_per_m2, lx_bay, ly_bay, beamIsAlongShortSpan);
    return equiv * splitFactor;
  }

  if(beam.dir === 'X'){
    wslab += processBay(beam.row-1, beam.col, 'X');  // bay above
    wslab += processBay(beam.row,   beam.col, 'X');  // bay below
  } else {
    wslab += processBay(beam.row, beam.col-1, 'Y');  // bay left
    wslab += processBay(beam.row, beam.col,   'Y');  // bay right
  }

  return Math.max(wslab, 0);
}

function getBeamWu(beam,DL_tot,udlLL,wallLoad){
  if(beam.customWu!==null)return beam.customWu;
  const w_slab_per_m2 = DL_tot + udlLL;
  const wslab = getBeamSlabLoad(beam, w_slab_per_m2); // IS 456 Annex D
  const wsw=(beam.b||230)/1000*(beam.D||350)/1000*25;
  const isPerim=(beam.dir==='X'&&(beam.row===0||beam.row===GRID.ny))||
                (beam.dir==='Y'&&(beam.col===0||beam.col===GRID.nx));
  const wwall=isPerim?wallLoad:0;
  return 1.5*(wslab+wsw+wwall);
}

// ── MEMBER OVERRIDES & HISTORY ───────────────────────────────────
// Stores per-member size overrides. Key format:
//   beam: "B:row:col:dir"  e.g. "B:1:2:X"
//   col:  "C:nodeId"       e.g. "C:node_3"
//   ftg:  "F:nodeId"       e.g. "F:node_3"
if (!window._memberOverrides) window._memberOverrides = {};

// History stack — each entry: {label, overrides, RES, S_snapshot}
if (!window._analysisHistory) window._analysisHistory = [];
if (window._historyIdx === undefined) window._historyIdx = -1;

function beamOverrideKey(b){ return `B:${b.row}:${b.col}:${b.dir}`; }
function colOverrideKey(c){ return `C:${c.nodeId}`; }
function ftgOverrideKey(f){ return `F:${f.nodeId||f.baseLabel}`; }

function getBeamOverride(b){ return window._memberOverrides[beamOverrideKey(b)]||null; }
function getColOverride(c){ return window._memberOverrides[colOverrideKey(c)]||null; }

function setBeamOverride(b, D, bw){
  window._memberOverrides[beamOverrideKey(b)] = {D, b: bw};
}
function setColOverride(c, size){
  window._memberOverrides[colOverrideKey(c)] = {size};
}
function clearOverride(key){
  delete window._memberOverrides[key];
}
function clearAllOverrides(){
  window._memberOverrides = {};
}

// Push current state to history before a re-run
function pushHistory(label){
  const snap = {
    label,
    overrides: JSON.parse(JSON.stringify(window._memberOverrides)),
    RES: RES,
    S_snap: JSON.parse(JSON.stringify(S)),
    time: Date.now()
  };
  // If we're not at the tip, truncate forward history
  window._analysisHistory = window._analysisHistory.slice(0, window._historyIdx + 1);
  window._analysisHistory.push(snap);
  if(window._analysisHistory.length > 10) window._analysisHistory.shift();
  window._historyIdx = window._analysisHistory.length - 1;
}

// Restore a history snapshot
function restoreHistory(idx){
  const snap = window._analysisHistory[idx];
  if(!snap) return;
  window._memberOverrides = JSON.parse(JSON.stringify(snap.overrides));
  RES = snap.RES;
  window._historyIdx = idx;
  showSec(RSEC);
  renderHistoryBar();
}

function renderHistoryBar(){
  const el = document.getElementById('_historyBar');
  if(!el) return;
  if(window._analysisHistory.length <= 1){ el.style.display='none'; return; }
  el.style.display = 'flex';
  el.innerHTML = window._analysisHistory.map((h,i) => {
    const isActive = i === window._historyIdx;
    return `<button onclick="restoreHistory(${i})" style="padding:3px 10px;border-radius:12px;border:1px solid ${isActive?'#38bdf8':'#334155'};background:${isActive?'rgba(56,189,248,0.15)':'transparent'};color:${isActive?'#38bdf8':'#64748b'};cursor:pointer;font-size:9px;white-space:nowrap;font-weight:${isActive?'700':'400'}">${i===0?'🔵 Original':('✏ '+h.label)}</button>`;
  }).join('<span style="color:#334155;align-self:center">→</span>');
}

// Run full re-analysis with current member overrides applied
function runWithOverrides(label){
  pushHistory(label || 'Custom override');
  const ldEl=document.getElementById('ld');
  const main=document.getElementById('main');
  if(ldEl) ldEl.style.display='block';
  if(main) main.innerHTML='<div style="padding:40px;text-align:center;color:#64748b;font-family:JetBrains Mono">Re-analysing with your changes...</div>';

  setTimeout(()=>{
    try{
      if(!GRID) initGrid();
      RES = runCalcsFromGrid();
      window._analysisHistory.pop(); // remove duplicate
      pushHistory(label || 'Custom override');
      window._historyIdx = window._analysisHistory.length - 1;
      if(ldEl) ldEl.style.display='none';
      // Re-render p7 FIRST (restores secBody element), then show section
      if(main) main.innerHTML = p7();
      renderHistoryBar();
      showSec(RSEC||'safety');
      // Save immediately — don't wait for 30s auto-save timer
      if(typeof saveToParent==='function') saveToParent();
      // Push fresh RES to parent so AI panel is never stale
      try{
        window.parent.postMessage({
          type:'AI_CONTEXT',
          S: JSON.parse(JSON.stringify(S)),
          RES: JSON.parse(JSON.stringify(RES)),
        }, '*');
      }catch(err){}
    } catch(e){
      console.error('Override re-run error:', e);
      if(ldEl) ldEl.style.display='none';
      if(main) main.innerHTML=`<div class="card"><div class="ct" style="color:var(--red)">Re-analysis Error</div><div class="cp" style="color:#f87171;font-size:11px;line-height:1.6">${e.message}</div><button class="btn" onclick="go(2)" style="margin-top:10px">← Fix Plan & Spans</button></div>`;
    }
  }, 400);
}

// ── SMART FIX: reads checkboxes/radios from Safety tab, applies all chosen fixes ──
function applySmartFix(){
  if(!window._memberOverrides) window._memberOverrides = {};

  // ── SLAB ──────────────────────────────────────────────────────
  const fixSlab = document.getElementById('fix-slab');
  if(fixSlab && fixSlab.checked && RES && RES.slab){
    const sl = RES.slab;
    const needed = Math.ceil((sl.lx*1000/26 + (S.coverSlab||25) + 5) / 25) * 25;
    S.slabThk = Math.max(needed, (S.slabThk||150) + 25);
  }

  // ── BEAMS ─────────────────────────────────────────────────────
  const fixBeams = document.getElementById('fix-beams');
  if(fixBeams && fixBeams.checked && RES){
    const beams = RES.allBeams || RES.beams || [];
    beams.forEach(b => {
      if(b.deflOK !== false && b.shearSafe !== false) return;
      const key = 'B:' + b.row + ':' + b.col + ':' + b.dir;
      const recD = !b.deflOK ? Math.ceil(b.D * Math.pow(b.dfl/b.dall, 1/3) / 25 + 1) * 25 : b.D;
      const recB = !b.shearSafe ? Math.max(b.b + 50, Math.ceil(b.b * 1.25 / 25) * 25) : b.b;
      window._memberOverrides[key] = { D: recD, b: recB };
    });
  }

  // ── COLUMNS ───────────────────────────────────────────────────
  const fixCols = document.getElementById('fix-cols');
  if(fixCols && fixCols.checked && RES){
    const cols = (RES.allCols || RES.cols || []).filter(c => c.floor === 1 && c.safe === false);
    cols.forEach(col => {
      const key = 'C:' + col.nodeId;
      let recSize = col.size;
      for(let sz = col.size + 25; sz <= 800; sz += 25){
        const Pcap2 = (0.4 * S.fck * (sz*sz*0.992) + 0.67 * S.fy * sz*sz*0.008) / 1000;
        if(Pcap2 >= col.Pu){ recSize = sz; break; }
      }
      window._memberOverrides[key] = { size: recSize };
    });
  }

  // ── FOOTINGS ──────────────────────────────────────────────────
  const fixFtgs = document.getElementById('fix-ftgs');
  if(fixFtgs && fixFtgs.checked && RES){
    const radios = document.querySelectorAll('input[name="ftg-fix"]');
    let ftgMethod = 'hook'; // default
    radios.forEach(r => { if(r.checked) ftgMethod = r.value; });

    const ftgs = RES.allFtgs || RES.ftgs || [];
    const failingFtgs = ftgs.filter(f => !f.Ld_ok);

    failingFtgs.forEach(f => {
      const key = 'F:' + f.nodeId;
      const Ldr_s = f.Ldr_straight || f.Ldr / 0.7; // straight dev length

      if(ftgMethod === 'hook'){
        window._memberOverrides[key] = Object.assign(window._memberOverrides[key]||{}, { hook:true, dBf:f.dBf||12 });
      } else if(ftgMethod === 'widen'){
        const bfNeed = Math.ceil(((Ldr_s * 0.7 * 2) + f.colSize + 2*(S.coverFtg||75)) / 1000 * 100) / 100;
        window._memberOverrides[key] = Object.assign(window._memberOverrides[key]||{}, { Bf:bfNeed });
      } else if(ftgMethod === 't10'){
        window._memberOverrides[key] = Object.assign(window._memberOverrides[key]||{}, { hook:true, dBf:10 });
      } else if(ftgMethod === 't8'){
        window._memberOverrides[key] = Object.assign(window._memberOverrides[key]||{}, { hook:true, dBf:8 });
      }
    });

    // Also fix punching/shear failures by increasing ftgMinD
    const punchFail = ftgs.some(f => !f.punch_ok || !f.ow_ok);
    if(punchFail){
      const maxD = Math.max(...ftgs.map(f => f.D || 300));
      S.ftgMinD = Math.ceil((maxD + 75) / 25) * 25;
    }
  }

  runWithOverrides('Smart Fix: custom selection');
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
  if(!GRID) return {xs:[],ys:[]};
  const pw=CANVAS_W-PAD.l-PAD.r, ph=CANVAS_H-PAD.t-PAD.b;
  // Stage 2: use actual stored coordinate arrays
  const totalX=GRID.totalX||S.spansX.reduce((a,b)=>a+b,0)||1;
  const totalY=GRID.totalY||S.spansY.reduce((a,b)=>a+b,0)||1;
  const xPos=GRID.xPos||[0];
  const yPos=GRID.yPos||[0];
  const xs=xPos.map(x=>PAD.l+x/totalX*pw);
  const ys=yPos.map(y=>PAD.t+y/totalY*ph);
  return{xs,ys,pw,ph,totalX,totalY};
}

function nodeCanvas(node){
  // Stage 2: use node real x,y if available
  if(GRID&&node.x!==undefined&&node.y!==undefined){
    const pw=CANVAS_W-PAD.l-PAD.r, ph=CANVAS_H-PAD.t-PAD.b;
    const totalX=GRID.totalX||1, totalY=GRID.totalY||1;
    return{x:PAD.l+node.x/totalX*pw, y:PAD.t+node.y/totalY*ph};
  }
  const{xs,ys}=getCanvasCoords();
  return{x:xs[node.col]||PAD.l, y:ys[node.row]||PAD.t};
}

// ── BAY FILL STYLES ──────────────────────────────────────────────
const BAY_STYLES={
  slab:      {fill:'rgba(56,189,248,0.07)', hatch:null,                    label:null,       labelColor:null,      legend:'Slab',     legendColor:'#38bdf8'},
  void:      {fill:'rgba(10,15,30,0.95)',   hatch:'rgba(100,116,139,0.35)',label:'VOID',     labelColor:'#64748b', legend:'Void',     legendColor:'#64748b'},
  opening:   {fill:'rgba(248,113,113,0.1)', hatch:'rgba(248,113,113,0.3)', label:'OPENING',  labelColor:'#f87171', legend:'Opening',  legendColor:'#f87171'},
  courtyard: {fill:'rgba(52,211,153,0.08)', hatch:'rgba(52,211,153,0.25)', label:'COURTYARD',labelColor:'#34d399', legend:'Courtyard',legendColor:'#34d399'},
  staircase: {fill:'rgba(245,158,11,0.12)', hatch:null,                    label:'STAIR',    labelColor:'#f59e0b', legend:'Staircase',legendColor:'#f59e0b'},
  autovoid:  {fill:'rgba(249,115,22,0.06)', hatch:'rgba(249,115,22,0.2)',  label:'AUTO-VOID',labelColor:'#f97316', legend:'Auto-void',legendColor:'#f97316'},
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

  // ── BAY FILLS — always shown in both modes ─────────────────────
  GRID.bays.forEach(bay=>{
    const x0=xs[bay.col],y0=ys[bay.row],x1=xs[bay.col+1],y1=ys[bay.row+1];
    // In coord mode: auto-void bays with missing corners show differently
    const effectiveType = (window._coordMode && bay.colCount < 4 && bay.type==='void') ? 'autovoid' : bay.type;
    const st=BAY_STYLES[effectiveType]||BAY_STYLES.slab;
    const isSelected=GE.selected&&GE.selected.type==='bay'&&GE.selected.row===bay.row&&GE.selected.col===bay.col;

    ctx.fillStyle=st.fill;
    ctx.fillRect(x0,y0,x1-x0,y1-y0);

    // Diagonal hatching for non-slab types
    if(st.hatch){
      ctx.save();ctx.strokeStyle=st.hatch;ctx.lineWidth=0.8;
      ctx.beginPath();
      ctx.rect(x0,y0,x1-x0,y1-y0);
      ctx.clip();
      for(let d=-(y1-y0);d<(x1-x0+y1-y0);d+=10){
        ctx.beginPath();
        ctx.moveTo(x0+d,y0);
        ctx.lineTo(x0+d+(y1-y0),y1);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Staircase: draw stair-step lines showing flight
    if(bay.type==='staircase'){
      ctx.save();ctx.strokeStyle='rgba(245,158,11,0.5)';ctx.lineWidth=1.2;
      const steps=5;
      const w=x1-x0,h=y1-y0;
      const sw=w/steps;
      ctx.beginPath();
      ctx.rect(x0,y0,w,h);ctx.clip();
      for(let s=0;s<steps;s++){
        ctx.beginPath();
        ctx.moveTo(x0+s*sw,y0+h);
        ctx.lineTo(x0+s*sw,y0+(s/steps)*h);
        ctx.lineTo(x0+(s+1)*sw,y0+(s/steps)*h);
        ctx.stroke();
      }
      // Arrow showing direction
      ctx.strokeStyle='rgba(245,158,11,0.8)';ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(x0+4,y1-4);ctx.lineTo(x1-4,y0+4);
      ctx.stroke();
      ctx.restore();
    }

    // Selection highlight
    if(isSelected){
      ctx.strokeStyle='#38bdf8';ctx.lineWidth=2.5;ctx.setLineDash([6,3]);
      ctx.strokeRect(x0+2,y0+2,x1-x0-4,y1-y0-4);
      ctx.setLineDash([]);
    }

    // Bay type border (always visible)
    ctx.strokeStyle=st.hatch||'rgba(30,58,138,0.3)';
    ctx.lineWidth=effectiveType==='slab'?0.5:1.0;
    ctx.strokeRect(x0,y0,x1-x0,y1-y0);

    // Slab case label (legacy mode only)
    const cx2=(x0+x1)/2,cy2=(y0+y1)/2;
    if(st.label){
      ctx.fillStyle=st.labelColor;ctx.font='bold 9px JetBrains Mono';
      ctx.textAlign='center';ctx.fillText(st.label,cx2,cy2-4);
    }
    if(bay.type==='slab'&&GE.showCase){
      const caseN=getSlabCase(bay);
      ctx.fillStyle='rgba(56,189,248,0.45)';ctx.font='9px JetBrains Mono';
      ctx.textAlign='center';ctx.fillText('Case '+caseN,cx2,cy2+5);
    }
  });

  if(!window._coordMode){
  // ── GRID LINES (faint) ────────────────────────────────────────
  ctx.strokeStyle='rgba(30,58,138,0.4)';ctx.lineWidth=0.5;ctx.setLineDash([3,4]);
  xs.forEach(x=>{ctx.beginPath();ctx.moveTo(x,PAD.t);ctx.lineTo(x,CANVAS_H-PAD.b);ctx.stroke();});
  ys.forEach(y=>{ctx.beginPath();ctx.moveTo(PAD.l,y);ctx.lineTo(CANVAS_W-PAD.r,y);ctx.stroke();});
  ctx.setLineDash([]);
  }

  // ── BEAMS ─────────────────────────────────────────────────────
  GRID.beams.forEach(beam=>{
    const n1=GRID.nodes[beam.n1],n2=GRID.nodes[beam.n2];
    if(!n1||!n2)return;
    // Skip beams whose endpoint is a void-chosen missing node
    if(!n1.hasColumn && n1._choice==='void') return;
    if(!n2.hasColumn && n2._choice==='void') return;
    // Skip dead-end beams at transfer nodes (they get merged)
    if(!beam.isTransfer && !beam._transferNode){
      if(!n1.hasColumn && n1._choice==='transfer') return;
      if(!n2.hasColumn && n2._choice==='transfer') return;
    }
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
    }else if(node._choice==='void'){
      // Void node: show nothing — the area doesn't exist
    }else if(node._choice==='transfer'){
      // Transfer node: show floating column marker (amber circle with X)
      ctx.strokeStyle='#f59e0b';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(pos.x,pos.y,7,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle='rgba(245,158,11,0.6)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(pos.x-4,pos.y-4);ctx.lineTo(pos.x+4,pos.y+4);ctx.stroke();
      ctx.beginPath();ctx.moveTo(pos.x+4,pos.y-4);ctx.lineTo(pos.x-4,pos.y+4);ctx.stroke();
    }else{
      // Missing/removed column with no choice yet — X marker (legacy span mode only)
      if(!window._coordMode){
        ctx.strokeStyle=isSel?'#0a0f1e':'#f87171';ctx.lineWidth=2.5;
        ctx.beginPath();ctx.moveTo(pos.x-6,pos.y-6);ctx.lineTo(pos.x+6,pos.y+6);ctx.stroke();
        ctx.beginPath();ctx.moveTo(pos.x+6,pos.y-6);ctx.lineTo(pos.x-6,pos.y+6);ctx.stroke();
      }
    }
  });

  // ── COORDINATE LABELS (coordinate mode only) ─────────────────
  if(window._coordMode && S.columns && S.columns.length > 0){
    // Light snap grid
    const pw2=CANVAS_W-PAD.l-PAD.r,ph2=CANVAS_H-PAD.t-PAD.b;
    const maxX=Math.max(...S.spansX.reduce((a,s,i)=>[...a,a[i]+s],[0]),1);
    const maxY=Math.max(...S.spansY.reduce((a,s,i)=>[...a,a[i]+s],[0]),1);
    ctx.strokeStyle='rgba(30,58,138,0.18)';ctx.lineWidth=0.5;ctx.setLineDash([2,8]);
    for(let gx=0;gx<=maxX;gx+=2){
      const cx2=PAD.l+gx/maxX*pw2;
      ctx.beginPath();ctx.moveTo(cx2,PAD.t);ctx.lineTo(cx2,CANVAS_H-PAD.b);ctx.stroke();
    }
    for(let gy=0;gy<=maxY;gy+=2){
      const cy2=PAD.t+gy/maxY*ph2;
      ctx.beginPath();ctx.moveTo(PAD.l,cy2);ctx.lineTo(CANVAS_W-PAD.r,cy2);ctx.stroke();
    }
    ctx.setLineDash([]);
    // Axis arrows and labels
    ctx.fillStyle='#475569';ctx.font='bold 9px JetBrains Mono';
    ctx.textAlign='right';ctx.fillText('X (m) →',CANVAS_W-PAD.r,PAD.t-10);
    ctx.save();ctx.translate(PAD.l-28,PAD.t+60);ctx.rotate(-Math.PI/2);
    ctx.textAlign='center';ctx.fillText('Y (m)',0,0);ctx.restore();
    // Coordinate labels next to each column
    GRID.nodes.forEach(node=>{
      if(!node.hasColumn)return;
      const pos=nodeCanvas(node);
      const lx=Math.round(S.spansX.slice(0,node.col).reduce((a,b)=>a+b,0)*100)/100;
      const ly=Math.round(S.spansY.slice(0,node.row).reduce((a,b)=>a+b,0)*100)/100;
      ctx.fillStyle='rgba(148,163,184,0.85)';ctx.font='8px JetBrains Mono';
      ctx.textAlign='left';
      ctx.fillText('('+lx+','+ly+')',pos.x+9,pos.y+4);
    });
  }

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

  // ── BAY TYPE LEGEND ───────────────────────────────────────────
  // Only show bay types that are actually present in this grid
  const presentTypes = [...new Set(GRID.bays.map(b=>b.type))];
  if(presentTypes.some(t=>t!=='slab') || window._coordMode){
    legY += 6;
    ctx.fillStyle='rgba(30,41,59,0.7)';
    ctx.fillRect(CANVAS_W-196,legY-2,188,presentTypes.length*13+8);
    ctx.fillStyle='#475569';ctx.font='7px JetBrains Mono';ctx.textAlign='left';
    ctx.fillText('BAY TYPES:',CANVAS_W-192,legY+5);
    legY+=11;
    const bayLegItems=[
      {type:'slab',label:'Slab (structural)'},
      {type:'void',label:'Void (outside)'},
      {type:'opening',label:'Opening'},
      {type:'courtyard',label:'Courtyard'},
      {type:'staircase',label:'Staircase'},
      {type:'autovoid',label:'Auto-void (missing col)'},
    ].filter(item=>presentTypes.includes(item.type)||
      (item.type==='autovoid'&&window._coordMode&&GRID.bays.some(b=>b.colCount<4&&b.type==='void')));
    bayLegItems.forEach(item=>{
      const st=BAY_STYLES[item.type]||BAY_STYLES.slab;
      ctx.fillStyle=st.fill==='rgba(56,189,248,0.07)'?'rgba(56,189,248,0.5)':st.labelColor||'#64748b';
      ctx.fillRect(CANVAS_W-192,legY,10,8);
      if(st.hatch){
        ctx.strokeStyle=st.hatch;ctx.lineWidth=0.8;
        ctx.beginPath();ctx.moveTo(CANVAS_W-192,legY+8);ctx.lineTo(CANVAS_W-182,legY);ctx.stroke();
      }
      ctx.fillStyle=st.legendColor||'#94a3b8';ctx.font='8px JetBrains Mono';
      ctx.fillText(item.label,CANVAS_W-178,legY+7);
      legY+=13;
    });
  }
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
      if(node.hasColumn){
        node.hasColumn=false;node.isWall=false;
        // Show void/transfer choice popup (Q2: popup/modal dialog)
        showNodeChoicePopup(node, canvas);
      }
      else if(node.isWall){node.isWall=false;}
      else{
        node.hasColumn=true;
        // Clear any stored choice when column is restored
        delete window._nodeChoices[getNodeChoiceKey(node)];
        node._choice = null;
      }
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
// ── MISSING NODE DIALOG ─────────────────────────────────────────
function showMissingNodeDialog(missingNodes, onComplete) {
  // Store callback and node keys globally — avoids serializing JS into HTML attributes
  window._missingNodeCallback = onComplete;
  window._missingNodeKeys = missingNodes.map(n => getNodeChoiceKey(n));
  window._confirmMissingNodes = function() {
    const missing = window._missingNodeKeys.filter(k => !window._nodeChoices[k]);
    if (missing.length > 0) {
      alert('Please select Void or Transfer Beam for all missing columns before continuing.');
      return;
    }
    const dlg = document.getElementById('_missingNodeDialog');
    if (dlg) dlg.remove();
    if (window._missingNodeCallback) {
      const cb = window._missingNodeCallback;
      window._missingNodeCallback = null;
      cb();
    }
  };

  // Remove any existing dialog
  const existing = document.getElementById('_missingNodeDialog');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = '_missingNodeDialog';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';

  const rowLetter = r => String.fromCharCode(65+r);

  let html = `<div style="background:#0f172a;border:1.5px solid #334155;border-radius:12px;padding:20px;max-width:600px;width:100%;max-height:90vh;overflow-y:auto;font-family:JetBrains Mono">
    <div style="font-size:14px;font-weight:800;color:#f59e0b;margin-bottom:6px">⚠ Missing Columns Detected</div>
    <div style="font-size:11px;color:#94a3b8;margin-bottom:16px;line-height:1.7">
      The following grid positions have no column placed. You must decide what each one represents before running analysis.
    </div>`;

  missingNodes.forEach((node, i) => {
    const key = getNodeChoiceKey(node);
    const suggested = classifyMissingNode(node.row, node.col, GRID.nx, GRID.ny);
    const stored = window._nodeChoices[key] || suggested;
    html += `
    <div style="margin-bottom:14px;padding:12px;background:#0a0f1e;border:1px solid #1e293b;border-radius:8px">
      <div style="font-size:11px;font-weight:700;color:#e2e8f0;margin-bottom:8px">
        Position ${rowLetter(node.row)}${node.col+1} &nbsp;·&nbsp; Coordinates (${node.x}m, ${node.y}m)
        <span style="font-size:9px;color:#475569;margin-left:8px">Suggested: ${suggested==='void'?'Outside Building':'Transfer Beam'}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button onclick="(function(){
          window._nodeChoices['${key}']='void';
          document.getElementById('_mn_void_${i}').style.borderColor='#34d399';
          document.getElementById('_mn_void_${i}').style.background='rgba(52,211,153,0.1)';
          document.getElementById('_mn_trf_${i}').style.borderColor='#334155';
          document.getElementById('_mn_trf_${i}').style.background='transparent';
        })()"
          id="_mn_void_${i}"
          style="padding:10px;border-radius:8px;border:1.5px solid ${stored==='void'?'#34d399':'#334155'};background:${stored==='void'?'rgba(52,211,153,0.1)':'transparent'};cursor:pointer;text-align:left">
          <div style="font-size:11px;font-weight:700;color:#34d399;margin-bottom:4px">⬜ VOID — Outside Building</div>
          <div style="font-size:9px;color:#64748b;line-height:1.6">No slab, no beam here.<br>Building doesn't extend to this corner.<br>All adjacent bays marked void.<br>Adjacent beams terminated.</div>
        </button>
        <button onclick="(function(){
          window._nodeChoices['${key}']='transfer';
          document.getElementById('_mn_trf_${i}').style.borderColor='#f59e0b';
          document.getElementById('_mn_trf_${i}').style.background='rgba(245,158,11,0.1)';
          document.getElementById('_mn_void_${i}').style.borderColor='#334155';
          document.getElementById('_mn_void_${i}').style.background='transparent';
        })()"
          id="_mn_trf_${i}"
          style="padding:10px;border-radius:8px;border:1.5px solid ${stored==='transfer'?'#f59e0b':'#334155'};background:${stored==='transfer'?'rgba(245,158,11,0.1)':'transparent'};cursor:pointer;text-align:left">
          <div style="font-size:11px;font-weight:700;color:#f59e0b;margin-bottom:4px">━ TRANSFER BEAM</div>
          <div style="font-size:9px;color:#64748b;line-height:1.6">Column removed for architecture.<br>Heavy beam carries load from<br>all floors above across this gap.<br>⚠ Verify with structural engineer.</div>
        </button>
      </div>
    </div>`;
  });

  html += `
    <div style="display:flex;gap:10px;margin-top:16px">
      <button onclick="window._confirmMissingNodes()" style="flex:1;padding:10px;background:rgba(56,189,248,0.12);border:1.5px solid #38bdf8;border-radius:8px;color:#38bdf8;cursor:pointer;font-size:11px;font-weight:700">
        ✓ Confirm & Run Analysis
      </button>
      <button onclick="document.getElementById('_missingNodeDialog').remove()"
        style="padding:10px 16px;background:transparent;border:1px solid #334155;border-radius:8px;color:#64748b;cursor:pointer;font-size:11px">
        Cancel
      </button>
    </div>
    <div style="margin-top:10px;font-size:9px;color:#334155;line-height:1.6">
      💡 TRANSFER BEAM: A beam that carries the load of columns from all floors above it, at a specific point along its span. It must be significantly deeper and heavier than normal beams. IS 456 does not have a simple design method — the result here is an approximation. Always verify with a qualified structural engineer before construction.
    </div>
  </div>`;


  overlay.innerHTML = html;
  document.body.appendChild(overlay);
}

// Show dialog for a single node in legacy mode (node click in grid editor)
function showNodeChoicePopup(node, canvas) {
  const key = getNodeChoiceKey(node);
  const suggested = classifyMissingNode(node.row, node.col, GRID.nx, GRID.ny);
  const rowLetter = r => String.fromCharCode(65+r);

  const existing = document.getElementById('_nodeChoicePopup');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = '_nodeChoicePopup';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center';

  overlay.innerHTML = `<div style="background:#0f172a;border:1.5px solid #334155;border-radius:10px;padding:16px;max-width:480px;width:90%;font-family:JetBrains Mono">
    <div style="font-size:12px;font-weight:800;color:#f59e0b;margin-bottom:10px">Column Removed — ${rowLetter(node.row)}${node.col+1} (${node.x}m, ${node.y}m)</div>
    <div style="font-size:10px;color:#94a3b8;margin-bottom:12px">What does this missing column represent?</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <button onclick="(function(){window._nodeChoices['${key}']='void';document.getElementById('_nodeChoicePopup').remove();applyNodeChoices();drawGrid(document.getElementById('gridCanvas'));updateStructSummary();})()"
        style="padding:10px;border-radius:8px;border:1.5px solid #34d399;background:rgba(52,211,153,0.08);cursor:pointer;text-align:left">
        <div style="font-size:10px;font-weight:700;color:#34d399;margin-bottom:3px">⬜ VOID</div>
        <div style="font-size:8px;color:#64748b;line-height:1.5">Outside building.<br>No slab, no beam.<br>Adjacent bays voided.</div>
      </button>
      <button onclick="(function(){window._nodeChoices['${key}']='transfer';document.getElementById('_nodeChoicePopup').remove();applyNodeChoices();drawGrid(document.getElementById('gridCanvas'));updateStructSummary();})()"
        style="padding:10px;border-radius:8px;border:1.5px solid #f59e0b;background:rgba(245,158,11,0.08);cursor:pointer;text-align:left">
        <div style="font-size:10px;font-weight:700;color:#f59e0b;margin-bottom:3px">━ TRANSFER BEAM</div>
        <div style="font-size:8px;color:#64748b;line-height:1.5">Column removed.<br>Heavy beam above spans gap.<br>Point load calculated.</div>
      </button>
    </div>
    <button onclick="document.getElementById('_nodeChoicePopup').remove()" style="width:100%;padding:7px;border:1px solid #334155;border-radius:6px;background:transparent;color:#64748b;cursor:pointer;font-size:10px">Cancel (keep as missing)</button>
  </div>`;

  document.body.appendChild(overlay);
}

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

      <!-- ── COORDINATE INPUT SYSTEM ── -->
      <div style="margin-top:10px">
        <!-- Mode toggle: Coordinate vs Legacy -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding:8px 10px;background:#0f172a;border:1px solid #1e3a8a;border-radius:8px">
          <span style="font-size:10px;color:#64748b;font-weight:700">INPUT MODE:</span>
          <button id="btn_coord_mode" onclick="setInputMode('coord')"
            style="padding:4px 12px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;border:1.5px solid ${window._coordMode?'#38bdf8':'#1e3a8a'};background:${window._coordMode?'rgba(56,189,248,0.12)':'transparent'};color:${window._coordMode?'#38bdf8':'#64748b'}">
            📍 Coordinate (AutoCAD-style)
          </button>
          <button id="btn_span_mode" onclick="setInputMode('span')"
            style="padding:4px 12px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;border:1.5px solid ${window._coordMode?'#1e3a8a':'#38bdf8'};background:${window._coordMode?'transparent':'rgba(56,189,248,0.12)'};color:${window._coordMode?'#64748b':'#38bdf8'}">
            📏 Span Length (classic)
          </button>
        </div>

        <!-- ⚡ QUICK TEMPLATES — always visible, auto-switches to coord mode -->
        <div style="margin-bottom:10px;padding:8px 10px;background:#0a0f1e;border:1px solid #334155;border-radius:8px">
          <div style="font-size:9px;font-weight:700;color:#64748b;margin-bottom:6px">⚡ QUICK TEMPLATES — click to load a building layout:</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${[
              {name:'3×3 Grid',sub:'4m×3m',fn:'3x3_4x3'},
              {name:'4×3 Grid',sub:'4m×3m',fn:'4x3_4x3'},
              {name:'L-Shape',sub:'4m×3m',fn:'L_4x3'},
              {name:'T-Shape',sub:'4m×3m',fn:'T_4x3'},
              {name:'5×4 Grid',sub:'4m×3m',fn:'5x4_4x3'},
            ].map(t=>`<button onclick="applyTemplate('${t.fn}')"
              style="padding:5px 12px;background:#0f172a;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:9px;transition:all 0.15s"
              onmouseover="this.style.borderColor='#38bdf8';this.style.color='#38bdf8';this.style.background='rgba(56,189,248,0.06)'"
              onmouseout="this.style.borderColor='#334155';this.style.color='#94a3b8';this.style.background='#0f172a'">
              <span style="font-weight:700">${t.name}</span>
              <span style="color:#475569;font-size:8px;margin-left:3px">${t.sub}</span>
            </button>`).join('')}
          </div>
        </div>

        <!-- COORDINATE MODE -->
        <div id="coord_input_panel" style="display:${window._coordMode?'block':'none'}">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <!-- Left: Coordinate table -->
            <div>
              <div style="font-size:10px;font-weight:700;color:#38bdf8;margin-bottom:6px">
                📍 Column Coordinates (metres from origin)
                <span style="font-size:9px;color:#64748b;font-weight:400;margin-left:6px">Origin (0,0) = top-left | Y increases downward</span>
              </div>
              <div style="max-height:320px;overflow-y:auto;padding-right:4px;scroll-behavior:smooth">
                <table style="width:100%;border-collapse:collapse;font-size:10px">
                  <tr style="background:#0f172a">
                    <th style="padding:4px 6px;border:1px solid #1e3a8a;color:#64748b;text-align:left;width:30px">#</th>
                    <th style="padding:4px 6px;border:1px solid #1e3a8a;color:#38bdf8;text-align:center">X (m)</th>
                    <th style="padding:4px 6px;border:1px solid #1e3a8a;color:#34d399;text-align:center">Y (m)</th>
                    <th style="padding:4px 6px;border:1px solid #1e3a8a;width:24px"></th>
                  </tr>
                  ${(S.columns||[]).map((c,i)=>`<tr id="coord_row_${i}" style="background:${i%2===0?'transparent':'rgba(255,255,255,0.02)'}">
                    <td style="padding:3px 6px;border:1px solid #1e293b;color:#64748b;font-family:monospace">${i+1}</td>
                    <td style="padding:2px 4px;border:1px solid #1e293b">
                      <input type="number" value="${c.x}" min="0" max="100" step="0.5"
                        style="width:100%;background:transparent;border:none;color:#38bdf8;font-family:monospace;font-size:10px;text-align:center;outline:none"
                        oninput="updateCoordinate(${i},'x',parseFloat(this.value)||0)"/>
                    </td>
                    <td style="padding:2px 4px;border:1px solid #1e293b">
                      <input type="number" value="${c.y}" min="0" max="100" step="0.5"
                        style="width:100%;background:transparent;border:none;color:#34d399;font-family:monospace;font-size:10px;text-align:center;outline:none"
                        oninput="updateCoordinate(${i},'y',parseFloat(this.value)||0)"/>
                    </td>
                    <td style="padding:2px 4px;border:1px solid #1e293b;text-align:center">
                      <button onclick="removeColumn(${i})" style="background:none;border:none;color:#f87171;cursor:pointer;font-size:11px;padding:0">✕</button>
                    </td>
                  </tr>`).join('')}
                </table>
              </div>
              <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
                <button onclick="addColumnCoord()" style="padding:4px 12px;background:#0f172a;border:1px solid #38bdf8;border-radius:5px;color:#38bdf8;cursor:pointer;font-size:10px">+ Add Column</button>
                <button onclick="addColumnOnCanvas()" style="padding:4px 12px;background:#0f172a;border:1px solid #34d399;border-radius:5px;color:#34d399;cursor:pointer;font-size:10px">🖱 Click on Canvas</button>
                <button onclick="clearAllColumns()" style="padding:4px 12px;background:#0f172a;border:1px solid #f87171;border-radius:5px;color:#f87171;cursor:pointer;font-size:10px">Clear All</button>
              </div>
              <!-- Conversion result -->
              <div id="coord_result" style="margin-top:8px;padding:8px;background:#0a0f1e;border:1px solid #1e3a8a;border-radius:6px;font-size:9px;color:#64748b;min-height:36px">
                ${(()=>{
                  if(!window._coordMode||!S.columns||S.columns.length<2) return 'Add at least 2 columns to see the frame.';
                  const r=coordsToGrid();
                  return r.ok
                    ? `<span style="color:#34d399">✓ ${r.summary}</span>${r.warnings.length?'<br><span style="color:#f59e0b">⚠ '+r.warnings.join(' | ')+'</span>':''}`
                    : `<span style="color:#f87171">✗ ${r.error}</span>`;
                })()}
              </div>
            </div>

            <!-- Right: Quick-fill templates -->
            <div>
              <div style="font-size:10px;font-weight:700;color:#64748b;margin-bottom:6px">⚡ Quick Templates</div>
              <div style="display:flex;flex-direction:column;gap:5px">
                ${[
                  {name:'3×3 Grid (4m×3m)',fn:'applyTemplate("3x3_4x3")'},
                  {name:'4×3 Grid (4m×3m)',fn:'applyTemplate("4x3_4x3")'},
                  {name:'L-Shape (4m×3m)',fn:'applyTemplate("L_4x3")'},
                  {name:'T-Shape (4m×3m)',fn:'applyTemplate("T_4x3")'},
                  {name:'Custom 5×4 Grid',fn:'applyTemplate("5x4_4x3")'},
                ].map(t=>`<button onclick="${t.fn}" style="padding:5px 10px;background:#0f172a;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:9px;text-align:left;transition:all 0.15s" onmouseover="this.style.borderColor='#38bdf8';this.style.color='#38bdf8'" onmouseout="this.style.borderColor='#334155';this.style.color='#94a3b8'">${t.name}</button>`).join('')}
              </div>
              <div style="margin-top:10px;padding:8px;background:rgba(56,189,248,0.04);border:1px solid rgba(56,189,248,0.1);border-radius:6px;font-size:9px;color:#64748b;line-height:1.7">
                <strong style="color:#38bdf8">How to use:</strong><br>
                1. Type X, Y coordinates for each column<br>
                2. Or click "Click on Canvas" then click to place<br>
                3. Origin (0,0) = top-left corner<br>
                4. All distances in <strong>metres</strong><br>
                5. App auto-draws beams between aligned columns<br>
                6. Missing intersections → auto transfer beams
              </div>
            </div>
          </div>
        </div>

        <!-- LEGACY SPAN MODE -->
        <div id="span_input_panel" style="display:${window._coordMode?'none':'flex'};gap:10px;flex-wrap:wrap">
          <div style="flex:1;min-width:180px">
            <div style="font-size:10px;font-weight:700;color:#38bdf8;margin-bottom:5px">X Spans (m) — Columns 1→${S.spansX.length+1}</div>
            ${S.spansX.map((s,i)=>`
            <div style="display:flex;gap:5px;align-items:center;margin-bottom:4px">
              <span style="font-size:9px;color:#64748b;min-width:22px">X${i+1}</span>
              <input type="number" value="${s}" min="1.5" max="15" step="0.1"
                style="flex:1;background:#0f172a;color:#f1f5f9;border:1px solid #1e3a8a;border-radius:5px;padding:4px 6px;font-size:10px;font-family:monospace"
                id="spx_${i}"
                oninput="(function(el,i){
                  const v=parseFloat(el.value);
                  if(isNaN(v)||v<1.5||v>15){
                    el.style.borderColor='rgba(248,113,113,0.8)';el.style.background='rgba(248,113,113,0.08)';
                    let tip=document.getElementById('spx_tip_'+i);
                    if(!tip){tip=document.createElement('div');tip.id='spx_tip_'+i;tip.style.cssText='font-size:9px;color:#f87171;margin-top:2px';el.parentElement.appendChild(tip);}
                    tip.textContent=v>15?'⚠ Max span is 15m for RC frames.':v<1.5?'⚠ Min span is 1.5m':'⚠ Enter a number';return;
                  }
                  el.style.borderColor='#1e3a8a';el.style.background='#0f172a';
                  const tip=document.getElementById('spx_tip_'+i);if(tip)tip.textContent='';
                  S.spansX[i]=v;GRID=null;initGrid();redrawGrid();updateStructSummary();
                })(this,${i})"/>
              <span style="font-size:9px;color:#64748b">m</span>
              ${S.spansX.length>1?`<button onclick="S.spansX.splice(${i},1);GRID=null;initGrid();go(2)" style="padding:2px 7px;background:transparent;border:1px solid #374151;border-radius:4px;color:#f87171;cursor:pointer;font-size:10px">✕</button>`:''}
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
                id="spy_${i}"
                oninput="(function(el,i){
                  const v=parseFloat(el.value);
                  if(isNaN(v)||v<1.5||v>15){
                    el.style.borderColor='rgba(248,113,113,0.8)';el.style.background='rgba(248,113,113,0.08)';
                    let tip=document.getElementById('spy_tip_'+i);
                    if(!tip){tip=document.createElement('div');tip.id='spy_tip_'+i;tip.style.cssText='font-size:9px;color:#f87171;margin-top:2px';el.parentElement.appendChild(tip);}
                    tip.textContent=v>15?'⚠ Max span is 15m for RC frames.':v<1.5?'⚠ Min span is 1.5m':'⚠ Enter a number';return;
                  }
                  el.style.borderColor='#1e3a8a';el.style.background='#0f172a';
                  const tip=document.getElementById('spy_tip_'+i);if(tip)tip.textContent='';
                  S.spansY[i]=v;GRID=null;initGrid();redrawGrid();updateStructSummary();
                })(this,${i})"/>
              <span style="font-size:9px;color:#64748b">m</span>
              ${S.spansY.length>1?`<button onclick="S.spansY.splice(${i},1);GRID=null;initGrid();go(2)" style="padding:2px 7px;background:transparent;border:1px solid #374151;border-radius:4px;color:#f87171;cursor:pointer;font-size:10px">✕</button>`:''}
            </div>`).join('')}
            <button onclick="S.spansY.push(3);GRID=null;initGrid();go(2)"
              style="font-size:9px;padding:3px 10px;background:#0f172a;border:1px solid #1e3a8a;border-radius:5px;color:#38bdf8;cursor:pointer">+ Bay Y</button>
          </div>
        </div>
      </div>

      <!-- Structure summary -->
      <div id="structSummary" style="margin-top:8px;padding:10px;background:#0a0f1e;border:1px solid #1e3a8a;border-radius:8px"></div>

      <!-- Navigation -->
      <div style="display:flex;justify-content:space-between;margin-top:10px">
        <button class="btn se" onclick="go(1)">← Back</button>
        <button class="btn" onclick="(function(){
          if(!GRID)initGrid();
          const unch=needsMissingNodeDialog();
          if(unch.length>0){showMissingNodeDialog(unch,()=>go(3));return;}
          go(3);
        })()">Next: Loads →</button>
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
  // Stage 2: use bay's stored spX/spY instead of S.spansX[c]/S.spansY[r]
  const Q=[
    {bay:getBay(r-1,c-1)},
    {bay:getBay(r-1,c)},
    {bay:getBay(r,  c-1)},
    {bay:getBay(r,  c)},
  ];
  Q.forEach(({bay})=>{
    // Use actual bay dimensions or fall back to span arrays
    const spX = bay ? (bay.spX||S.spansX[bay.col]||0) : 0;
    const spY = bay ? (bay.spY||S.spansY[bay.row]||0) : 0;
    const a=spX/2*spY/2;
    if(!bay||bay.type==='void'||bay.type==='opening'||bay.type==='courtyard') voidArea+=a;
    else slabArea+=a;
  });
  const isTopRow=r===0,isBotRow=r===GRID.ny,isLftCol=c===0,isRgtCol=c===GRID.nx;
  // Stage 2: use node x,y for perimeter calculation
  const spXright = getBay(r,c) ? (getBay(r,c).spX||S.spansX[c]||0) : (S.spansX[c]||0);
  const spXleft  = getBay(r,c-1) ? (getBay(r,c-1).spX||S.spansX[c-1]||0) : (S.spansX[c-1]||0);
  const spYbelow = getBay(r,c) ? (getBay(r,c).spY||S.spansY[r]||0) : (S.spansY[r]||0);
  const spYabove = getBay(r-1,c) ? (getBay(r-1,c).spY||S.spansY[r-1]||0) : (S.spansY[r-1]||0);
  if(isTopRow||isBotRow) perimLen+=spXright/2+spXleft/2;
  if(isLftCol||isRgtCol) perimLen+=spYbelow/2+spYabove/2;
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

  // Apply member override if student has set one
  const _cOvr = window._memberOverrides && window._memberOverrides[colOverrideKey({nodeId:node.id})];

  // Size from axial capacity (accounts for emin reduction inside loop)
  const fck_eff=0.4*fck+0.008*(0.67*fy-0.4*fck);
  let size = _cOvr ? _cOvr.size :
    Math.max(300,Math.ceil(Math.sqrt(Math.max(Pu*1000/fck_eff,90000))/25)*25);
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
    if(_cOvr) break; // override: use student's size as-is
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

  // Apply member override if student has set one (via Fix buttons or manual input)
  const _ftgOvrKey = `F:${col.nodeId}`;
  const _ftgOvr = window._memberOverrides && window._memberOverrides[_ftgOvrKey];
  if(_ftgOvr && _ftgOvr.Bf) Bf = _ftgOvr.Bf;  // override footing plan size

  const D=Math.max(_ftgOvr && _ftgOvr.D ? _ftgOvr.D : (ftgMinD||300),
                   Math.ceil((dprel+coverFtg+8)/25)*25);
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
  // Bar diameter: use override if set (e.g. student chose T10 or T8 to fix dev length)
  const dBf = (_ftgOvr && _ftgOvr.dBf) ? _ftgOvr.dBf : 12;
  const dBfA = Math.PI*(dBf/2)*(dBf/2);
  // Recalculate Ast with chosen bar size
  const Af2 = Math.max(AstFn(Mu,Bf*1000,d), 0.12*Bf*1000*D/100);
  // Spacing: bars across Bf
  const spf = clamp(Math.floor(1000*dBfA*Bf/Af2), 75, 300);
  const useHook = (_ftgOvr && _ftgOvr.hook) ? true : false;
  // Dev length: Ldr with hook = 0.7 × Ldr_straight (IS 456 Cl 26.2.2.1)
  const Ldr_straight = devLength(dBf, fy, fck, {hook:false});
  const Ldr = useHook ? Ldr_straight * 0.7 : Ldr_straight;
  const Lda = (Bf*1000-colSz)/2 - coverFtg;
  const Pa = 0.45*fck*colSz*colSz/1000;
  return{
    nodeId:col.nodeId, row:col.row, col:col.col,
    baseLabel:col.baseLabel,
    Ps,qu,quf,Bf,D,d,bo,Pu,
    Vpu,tvp,tcp,punch_ok:tvp<=tcp,
    Vow,tvow,tcow,ow_ok:tvow<=tcow,
    Mu,Af:Af2,dBf,spf,Ldr,Ldr_straight,Lda,Ld_ok:Lda>=Ldr,
    useHook,
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
  const trib=getTribWidth(gridBeam); // kept for display only
  const w_slab_per_m2 = DL_sl+floorFinish+partitions+udlLL;
  const wslab = getBeamSlabLoad(gridBeam, w_slab_per_m2); // IS 456 Annex D equivalent UDL
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

  // Apply member override if student has set one
  const _bOvr = window._memberOverrides && window._memberOverrides[beamOverrideKey(gridBeam)];
  if(_bOvr && _bOvr.D) {
    D = _bOvr.D; // use student override directly
  }

  for(let iter=0;iter<40;iter++){
    // If override set: use student's b, else auto from D
    const bW = (_bOvr && _bOvr.b) ? _bOvr.b : Math.max(200,Math.ceil(D*0.4/25)*25);
    const wsw=(bW/1000)*(D/1000)*25;
    const wu_try=1.5*(wslab+wsw+wwall);
    const ws_try=(wslab+wsw+wwall);  // service load (unfactored) for deflection
    const d_try=D-coverBeam-8-10;
    if(d_try<=0){D+=25;continue;}
    const Mu_try=alpha*wu_try*L*L;
    // For transfer beams: include point load moment in sizing
    let Mu_pt=0;
    if(gridBeam.isTransfer){
      const mn=getTransferMissingNode(gridBeam);
      if(mn){
        const tp=getTransferPointLoad(gridBeam,mn,(DL_sl||3)+(floorFinish||1)+(partitions||1.5),udlLL,udlLL_roof,wwall,S.numFloors||4);
        if(tp) Mu_pt=tp.P_u*tp.a*tp.b/L;
      }
    }
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
    if(Mu_try+Mu_pt<=Mulim_try&&dfl_try<=dall_try*0.95) break;
    if(_bOvr && _bOvr.D) break; // override: use as-is, don't iterate up
    D+=25;
  }

  const bW=(_bOvr && _bOvr.b) ? _bOvr.b : Math.max(200,Math.ceil(D*0.4/25)*25); // final
  const wsw=(bW/1000)*(D/1000)*25;
  const wu=1.5*(wslab+wsw+wwall)+wstair; // wstair already factored
  const ws=(wslab+wsw+wwall)+wstair/1.5; // service load for deflection
  const d=D-coverBeam-8-10;

  // ── TRANSFER BEAM: add point load from floating column ────────
  let transferPL = null; // {P_u, P_s, a, b} — point load data
  let M_ptload = 0;      // additional moment from point load (kN.m)
  let R_ptload = 0;      // additional reaction from point load (kN)
  if (gridBeam.isTransfer && !isRoof) {
    const missingNode = getTransferMissingNode(gridBeam);
    if (missingNode) {
      transferPL = getTransferPointLoad(gridBeam, missingNode, DL_sl+floorFinish+partitions, udlLL_floor, udlLL_roof, wallLoad, S.numFloors);
      if (transferPL) {
        const {P_u, a, b} = transferPL;
        // Simply supported beam with point load at distance a from left:
        // M_max at point load = P*a*b/L
        M_ptload = P_u * a * b / L; // kN.m
        // Reaction at left end from point load = P*b/L, at right = P*a/L
        R_ptload = Math.max(P_u * b / L, P_u * a / L); // max end reaction
      }
    }
  }

  const Mmax = alpha*wu*L*L + M_ptload; // combined UDL moment + point load moment
  const Msup = alphaSup*wu*L*L;
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
  const RA = endReactionFactor(gridBeam.endLeft, gridBeam.endRight, gridBeam.isCantilever) * wu * L + R_ptload;

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
    transferPL,  // point load data for display
    singly:true, Ast2:0, n2:0, bay:gridBeam.col||0,
    overDesigned:dfl/dall<0.4&&Mmax/Mulim<0.4&&pt<0.5,
  };
}

// ── MISSING NODE CHOICE SYSTEM ───────────────────────────────────
// Stores student's choice for each missing node: 'void' | 'transfer'
// Key: "row:col" e.g. "2:3"
if(!window._nodeChoices) window._nodeChoices = {};

function classifyMissingNode(row, col, nx, ny) {
  // Determine if missing node is interior (transfer) or edge/corner (void)
  // Interior = surrounded by other nodes on all 4 sides
  const hasLeft  = col > 0;
  const hasRight = col < nx;
  const hasUp    = row > 0;
  const hasDown  = row < ny;
  const isInterior = hasLeft && hasRight && hasUp && hasDown;

  // Check if ADJACENT nodes have columns
  const adjHaveColumns = [
    getNode(row, col-1), getNode(row, col+1),
    getNode(row-1, col), getNode(row+1, col),
  ].filter(n=>n&&n.hasColumn).length;

  if (isInterior && adjHaveColumns >= 2) return 'transfer'; // interior → likely transfer
  return 'void'; // edge/corner → likely outside building
}

function getMissingNodes() {
  if (!GRID) return [];
  return GRID.nodes.filter(n => !n.hasColumn && !n.isWall);
}

function getNodeChoiceKey(node) {
  return `${node.row}:${node.col}`;
}

function needsMissingNodeDialog() {
  // Returns missing nodes that don't have a choice yet
  return getMissingNodes().filter(n => !window._nodeChoices[getNodeChoiceKey(n)]);
}

// Apply choices to GRID after student confirms
function applyNodeChoices() {
  if (!GRID) return;

  // First pass: apply choices to nodes
  getMissingNodes().forEach(node => {
    const key = getNodeChoiceKey(node);
    const choice = window._nodeChoices[key] || classifyMissingNode(node.row, node.col, GRID.nx, GRID.ny);
    node._choice = choice;
  });

  // Second pass: for TRANSFER nodes, merge the two through-beam segments into one
  // A "through-beam" has the missing node in the MIDDLE (one segment each side)
  // A "dead-end beam" only has one segment (terminates at the missing node)
  // Dead-end beams at transfer nodes must be removed
  const mergedBeamIds = new Set(); // track which original segment IDs were merged
  const deadEndBeamIds = new Set(); // track dead-end beams to remove

  getMissingNodes().filter(n=>n._choice==='transfer').forEach(missingNode => {
    const touching = GRID.beams.filter(b => b.n1===missingNode.id || b.n2===missingNode.id);

    ['X','Y'].forEach(dir => {
      const segs = touching.filter(b=>b.dir===dir);
      if (segs.length >= 2) {
        // Two segments → can merge into through-beam
        segs.sort((a,b) => {
          const oa = GRID.nodes[a.n1===missingNode.id ? a.n2 : a.n1];
          const ob = GRID.nodes[b.n1===missingNode.id ? b.n2 : b.n1];
          return dir==='X' ? oa.x - ob.x : oa.y - ob.y;
        });

        const seg1 = segs[0], seg2 = segs[1];
        const topNodeId  = seg1.n1===missingNode.id ? seg1.n2 : seg1.n1;
        const botNodeId  = seg2.n1===missingNode.id ? seg2.n2 : seg2.n1;
        const topNode = GRID.nodes[topNodeId];
        const botNode = GRID.nodes[botNodeId];
        if (!topNode || !botNode) return;

        const totalL = seg1.L + seg2.L;

        const mergedBeam = {
          id: Date.now() + Math.random(), // unique new ID — NOT reusing seg1.id
          dir, n1: topNodeId, n2: botNodeId,
          row: dir==='Y' ? Math.min(topNode.row, botNode.row) : missingNode.row,
          col: dir==='X' ? Math.min(topNode.col, botNode.col) : missingNode.col,
          L: totalL,
          spX: dir==='X' ? totalL : (seg1.spX||4),
          spY: dir==='Y' ? totalL : (seg1.spY||3),
          x1: topNode.x, y1: topNode.y, x2: botNode.x, y2: botNode.y,
          endLeft: seg1.endLeft||'column', endRight: seg2.endRight||'column',
          isSecondary:false, isCantilever:false, isTransfer:true,
          endCondOverride: seg1.endCondOverride, customWu:null,
          _transferNode: missingNode.id,
        };

        mergedBeamIds.add(seg1.id);
        mergedBeamIds.add(seg2.id);
        GRID.beams.push(mergedBeam);
      } else if (segs.length === 1) {
        // Only ONE segment in this direction → dead-end beam → remove it
        deadEndBeamIds.add(segs[0].id);
      }
    });
  });

  // Remove original segments that were merged, AND dead-end beams at transfer nodes
  GRID.beams = GRID.beams.filter(b => !mergedBeamIds.has(b.id) && !deadEndBeamIds.has(b.id));

  // Third pass: remove beams that terminate at VOID nodes
  GRID.beams = GRID.beams.filter(beam => {
    const n1=GRID.nodes[beam.n1], n2=GRID.nodes[beam.n2];
    if(!n1||!n2) return false;
    if(!n1.hasColumn && n1._choice==='void') return false;
    if(!n2.hasColumn && n2._choice==='void') return false;
    return true;
  });

  // Fourth pass: void adjacent bays for void nodes
  GRID.bays.forEach(bay => {
    const corners = [
      GRID.nodes[bay.row*(GRID.nx+1)+bay.col],
      GRID.nodes[bay.row*(GRID.nx+1)+bay.col+1],
      GRID.nodes[(bay.row+1)*(GRID.nx+1)+bay.col],
      GRID.nodes[(bay.row+1)*(GRID.nx+1)+bay.col+1],
    ];
    if(corners.some(n=>n&&!n.hasColumn&&n._choice==='void') && bay.type==='slab') {
      bay.type='void';
    }
  });

  updateTransferBeams();
}

// ── TRANSFER BEAM POINT LOAD ─────────────────────────────────────
function getTransferPointLoad(beam, missingNode, DL_tot, udlLL, udlRoof, wallLoad, numFloors) {
  if (!beam || !missingNode) return null;
  const {slabArea, perimLen} = getColTribAreaDetailed(missingNode);
  const floorsAbove = numFloors;
  const llRedFactor = llReductionFactor(floorsAbove);
  const nTypical = floorsAbove - 1;
  const LL_total = (nTypical * udlLL + (udlRoof||1.5)) * slabArea * llRedFactor;
  const wallContrib = nTypical * wallLoad * perimLen;
  const P_s = floorsAbove * DL_tot * slabArea + LL_total + wallContrib;
  const P_u = 1.5 * P_s;
  const n1=GRID.nodes[beam.n1], n2=GRID.nodes[beam.n2];
  const a = beam.dir==='X'
    ? Math.abs(missingNode.x - Math.min(n1.x,n2.x))
    : Math.abs(missingNode.y - Math.min(n1.y,n2.y));
  const aClamped = Math.max(0.1, Math.min(a, beam.L - 0.1));
  return { P_s, P_u, a:aClamped, b:beam.L-aClamped, slabArea, floorsAbove };
}

function getTransferMissingNode(beam) {
  if (!beam || !beam.isTransfer || !GRID) return null;
  // First try: check stored _transferNode id (set during merge)
  if (beam._transferNode !== undefined) {
    return GRID.nodes.find(n => n.id === beam._transferNode) || null;
  }
  // Fallback: search for missing node between beam endpoints
  const n1=GRID.nodes[beam.n1], n2=GRID.nodes[beam.n2];
  if (!n1||!n2) return null;
  return GRID.nodes.find(n => {
    if (n.hasColumn || n.isWall || n._choice!=='transfer') return false;
    if (beam.dir==='X') {
      return n.row===beam.row
        && n.x > Math.min(n1.x,n2.x)+0.01
        && n.x < Math.max(n1.x,n2.x)-0.01;
    } else {
      return n.col===beam.col
        && n.y > Math.min(n1.y,n2.y)+0.01
        && n.y < Math.max(n1.y,n2.y)-0.01;
    }
  }) || null;
}

// Mode flag — persisted to localStorage to survive page reloads
if(typeof window._coordMode === 'undefined'){
  window._coordMode = localStorage.getItem('_coordMode')==='true';
  // Restore S.columns from localStorage if in coord mode
  if(window._coordMode){
    try{
      const saved=localStorage.getItem('_coordCols');
      if(saved){S.columns=JSON.parse(saved);}
    }catch(e){window._coordMode=false;}
  }
}

function setInputMode(mode) {
  if (mode === 'coord') {
    if (!S.columns || S.columns.length === 0) {
      S.columns = spansToColumns();
    }
    window._coordMode = true;
    localStorage.setItem('_coordMode','true');
    localStorage.setItem('_coordCols',JSON.stringify(S.columns));
  } else {
    S.columns = null;
    window._coordMode = false;
    localStorage.setItem('_coordMode','false');
    localStorage.removeItem('_coordCols');
  }
  GRID = null; initGrid(); go(2);
}

function updateCoordinate(idx, axis, val) {
  if (!S.columns || idx >= S.columns.length) return;
  S.columns[idx][axis] = Math.round(val * 100) / 100;
  localStorage.setItem('_coordCols',JSON.stringify(S.columns));
  const r = coordsToGrid();
  const el = document.getElementById('coord_result');
  if (el) {
    el.innerHTML = r.ok
      ? `<span style="color:#34d399">✓ ${r.summary}</span>${r.warnings.length ? '<br><span style="color:#f59e0b">⚠ ' + r.warnings.join(' | ') + '</span>' : ''}`
      : `<span style="color:#f87171">✗ ${r.error}</span>`;
  }
  if (r.ok) { GRID = null; initGrid(); redrawGrid(); updateStructSummary(); }
}

function addColumnCoord() {
  if (!S.columns) S.columns = [];
  // Add near last column with +4m offset
  const last = S.columns[S.columns.length - 1] || { x: 0, y: 0 };
  S.columns.push({ x: Math.round((last.x + 4) * 100) / 100, y: last.y });
  GRID = null; initGrid(); go(2);
}

function removeColumn(idx) {
  if (!S.columns || S.columns.length <= 2) {
    alert('Need at least 2 columns to form a frame.');
    return;
  }
  S.columns.splice(idx, 1);
  GRID = null; initGrid(); go(2);
}

function clearAllColumns() {
  if (!confirm('Clear all column coordinates and start fresh?')) return;
  S.columns = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 }, { x: 4, y: 3 }];
  GRID = null; initGrid(); go(2);
}

// Click on canvas to place column
// Template layouts
function applyTemplate(name) {
  const templates = {
    '3x3_4x3': ()=>{const c=[];[0,4,8].forEach(x=>[0,3,6].forEach(y=>c.push({x,y})));return c;},
    '4x3_4x3': ()=>{const c=[];[0,4,8,12].forEach(x=>[0,3,6].forEach(y=>c.push({x,y})));return c;},
    'L_4x3':   ()=>[[0,0],[4,0],[8,0],[0,3],[4,3],[0,6],[4,6],[0,9],[4,9],[8,9]].map(([x,y])=>({x,y})),
    'T_4x3':   ()=>[[0,0],[4,0],[8,0],[12,0],[4,3],[8,3],[4,6],[8,6]].map(([x,y])=>({x,y})),
    '5x4_4x3': ()=>{const c=[];[0,4,8,12,16].forEach(x=>[0,3,6,9].forEach(y=>c.push({x,y})));return c;},
  };
  const fn=templates[name];
  if(!fn){console.error('Unknown template:',name);return;}
  S.columns=fn();
  window._coordMode = true;
  localStorage.setItem('_coordMode','true');
  localStorage.setItem('_coordCols',JSON.stringify(S.columns));
  const r=coordsToGrid();
  if(!r.ok){alert('Template error: '+r.error);return;}
  GRID=null;initGrid();go(2);
}

// Canvas column placement mode
let _placingColumn=false;
function addColumnOnCanvas(){
  if(!S.columns){alert('Switch to Coordinate mode first to place columns on canvas.');return;}
  _placingColumn=true;
  const tip=document.getElementById('geTip');
  if(tip){tip.style.color='#34d399';tip.textContent='Click anywhere on the canvas to place a column. Press Esc to cancel.';}
  document.addEventListener('keydown',function esc(e){
    if(e.key==='Escape'){
      _placingColumn=false;
      document.removeEventListener('keydown',esc);
      const t=document.getElementById('geTip');
      if(t){t.style.color='#38bdf8';t.textContent='Click any node, beam, or bay to inspect and edit its properties';}
    }
  });
}

// Patch handleGridClick to intercept canvas clicks in coordinate placement mode
(function(){
  const _orig=handleGridClick;
  handleGridClick=function(e,canvas){
    if(_placingColumn&&S.columns){
      const rect=canvas.getBoundingClientRect();
      const scaleX=CANVAS_W/rect.width,scaleY=CANVAS_H/rect.height;
      const cx=(e.clientX-rect.left)*scaleX;
      const cy=(e.clientY-rect.top)*scaleY;
      const pw=CANVAS_W-PAD.l-PAD.r,ph=CANVAS_H-PAD.t-PAD.b;
      const maxX=S.columns.length>0?Math.max(...S.columns.map(c=>c.x),12):12;
      const maxY=S.columns.length>0?Math.max(...S.columns.map(c=>c.y),9):9;
      const mx=Math.round(((cx-PAD.l)/pw*maxX)*2)/2;
      const my=Math.round(((cy-PAD.t)/ph*maxY)*2)/2;
      if(mx>=0&&my>=0){
        S.columns.push({x:Math.max(0,mx),y:Math.max(0,my)});
        const r=coordsToGrid();
        if(r.ok){GRID=null;initGrid();}
        const el=document.getElementById('coord_result');
        if(el){el.innerHTML=r.ok?'<span style="color:#34d399">&#x2713; '+r.summary+'</span>':'<span style="color:#f87171">&#x2717; '+r.error+'</span>';}
        go(2);
      }
      _placingColumn=false;
      const tip=document.getElementById('geTip');
      if(tip){tip.style.color='#38bdf8';tip.textContent='Click any node, beam, or bay to inspect and edit its properties';}
      return;
    }
    _orig.call(this,e,canvas);
  };
})();

// ── MAIN ENGINE ────────────────────────────────────────────────
function runCalcsFromGrid(){
  // ── PRE-FLIGHT VALIDATION ────────────────────────────────────────
  const errors = [];
  const preWarnings = [];

  // Span validation
  const allSpans = [...S.spansX, ...S.spansY];
  const maxSpan = Math.max(...allSpans);
  const minSpan = Math.min(...allSpans);
  if(maxSpan > 15) errors.push(`❌ Span of ${maxSpan}m exceeds 15m maximum for RC frames. Maximum practical RC beam span is 10–12m without post-tensioning. Please check your span inputs — did you accidentally type ${maxSpan} instead of ${maxSpan/10}?`);
  if(minSpan < 1.5) errors.push(`❌ Span of ${minSpan}m is too small. Minimum practical bay span is 1.5m.`);
  if(maxSpan > 8) preWarnings.push(`⚠ Span of ${maxSpan}m is large for residential RC. Typical spans are 3–6m. Verify this is intentional.`);

  // Floor height validation
  if(S.floorHt < 2.4 || S.floorHt > 6) errors.push(`❌ Floor height ${S.floorHt}m is outside 2.4–6m range.`);

  // Materials
  if(S.fck < 20 || S.fck > 60) errors.push(`❌ Concrete grade fck=${S.fck} N/mm² is outside M20–M60 range.`);
  if(S.fy < 250 || S.fy > 600) errors.push(`❌ Steel grade fy=${S.fy} N/mm² is outside 250–600 N/mm² range.`);

  // Loads
  if(S.udlLL < 0.5 || S.udlLL > 15) errors.push(`❌ Live load ${S.udlLL} kN/m² is unrealistic. Typical: 2 kN/m² residential, 5 kN/m² office.`);
  if(S.numFloors < 1 || S.numFloors > 25) errors.push(`❌ Number of floors ${S.numFloors} is outside 1–25 range.`);

  if(errors.length > 0){
    const msg = errors.join('\n') + (preWarnings.length ? '\n\n' + preWarnings.join('\n') : '');
    throw new Error('INPUT VALIDATION FAILED:\n\n' + msg + '\n\nPlease fix these before running analysis.');
  }

  // Ensure GRID is initialized — initGrid() is idempotent and safe to call.
  // We no longer fall back to the old runCalcs() because it returns a
  // structurally-different RES that breaks downstream report rendering.
  // Validate GRID - reinit if null or missing required arrays (e.g. corrupted save)
  if(!GRID || !Array.isArray(GRID.nodes) || !Array.isArray(GRID.beams) || !Array.isArray(GRID.bays)){
    GRID=null;
    if(typeof initGrid === 'function') initGrid();
    if(!GRID || !Array.isArray(GRID.beams)) throw new Error('Grid could not be initialised. Please go to Plan & Spans and add at least one bay.');
  }

  GRID.beams.forEach(b=>autoEndConditions(b));
  applyNodeChoices(); // apply void/transfer choices for missing nodes
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
  const slabFloorArea = slabBays.reduce((s,b)=>(s+(b.spX||S.spansX[b.col]||0)*(b.spY||S.spansY[b.row]||0)),0);

  // ── SLAB: design EVERY slab bay individually ─────────────────
  const wu_sl_floor = 1.5*(DL_sl+floorFinish+partitions+udlLL);
  const wu_sl_roof  = 1.5*(DL_sl+floorFinish+(udlRoof||1.5));

  function designSlabBay(bay, isRoof){
    const spX=bay.spX||S.spansX[bay.col]||3, spY=bay.spY||S.spansY[bay.row]||3; // Stage 2
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
      spX:bay.spX||S.spansX[bay.col]||3, spY:bay.spY||S.spansY[bay.row]||3};
  });

  // Critical bay: governs uniform slab thickness for construction
  const critBay = slabBays.length>0
    ? slabBays.reduce((a,b)=>
        Math.min(b.spX||S.spansX[b.col]||3,b.spY||S.spansY[b.row]||3) >
        Math.min(a.spX||S.spansX[a.col]||3,a.spY||S.spansY[a.row]||3) ? b : a)
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
  // Riser/tread: use student input if set, else auto-calculate from floor height
  const riser = S.riser && S.riser >= 100 && S.riser <= 200
    ? S.riser
    : Math.min(175, Math.round(floorHt*1000/Math.ceil(floorHt*1000/165)));
  const tread = S.tread && S.tread >= 250
    ? S.tread
    : Math.max(250, 600-riser);
  const theta=Math.atan(riser/tread);  // stair angle in radians

  function designStairBay(bay){
    const spX=bay.spX||S.spansX[bay.col]||3; // Stage 2
    const spY=bay.spY||S.spansY[bay.row]||3; // Stage 2
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
      stairType: S.stairType || 'dogleg', // student-selected type
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
    ftg.lbl=ftg.label;
    ftg.colLabel=col.baseLabel;
    return ftg;
  });

  // Auto-determine correct foundation type based on actual footing sizes and spacing
  // Only override S.ftgType if user hasn't manually selected one (i.e. it's still default)
  if(!S._ftgTypeManual){
    const avgBfAuto = allFtgs.reduce((s,f)=>s+f.Bf,0)/allFtgs.length;
    const minSpanAuto = Math.min(...S.spansX,...S.spansY);
    const coverageRatio = avgBfAuto / minSpanAuto;
    // Check if any footings are genuinely close (gap < 300mm)
    let anyClose = false;
    allFtgs.forEach(f=>{
      const spanX = S.spansX[f.col]||minSpanAuto;
      const spanY = S.spansY[f.row]||minSpanAuto;
      if(spanX - f.Bf < 0.3 || spanY - f.Bf < 0.3) anyClose = true;
    });
    if(coverageRatio > 0.5 || S.soilBearing < 50) S.ftgType = 'raft';
    else if(anyClose) S.ftgType = 'combined';
    else S.ftgType = 'isolated';
  }

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


  // ── PRE-FLIGHT VALIDATION ERRORS (stored before this point) ──
  // (validation errors already threw before reaching here)

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

    // ── SANITY FLAGS — shown as prominent warnings in UI ──
    sanityWarnings: (()=>{
      const sw = [];
      // Check for unreasonably large beams (suggests bad span input)
      const maxBeamD = Math.max(...allBeams.map(b=>b.D||0));
      const maxSpan = Math.max(...S.spansX, ...S.spansY);
      const expectedMaxD = maxSpan * 1000 / 8; // L/8 is deep but still reasonable
      if(maxBeamD > 1200) sw.push(`⚠ SANITY CHECK: Largest beam depth = ${maxBeamD}mm. This is unusually large — typical RC beams are 300–800mm. Please verify your spans are in metres, not cm or mm.`);
      else if(maxBeamD > expectedMaxD) sw.push(`⚠ SANITY CHECK: Beam depth (${maxBeamD}mm) seems large for the longest span of ${maxSpan}m. Expected depth ~L/12 = ${Math.round(maxSpan*1000/12)}mm. If spans are correct, this may indicate very heavy loads.`);
      // Check for unreasonable column sizes
      const maxColSize = Math.max(...allCols.filter(c=>c.floor===1).map(c=>c.size||0));
      if(maxColSize > 1000) sw.push(`⚠ SANITY CHECK: Column size = ${maxColSize}×${maxColSize}mm. This is extremely large. Please verify load inputs.`);
      // Check for unreasonable footing sizes
      const maxFtgSize = Math.max(...allFtgs.map(f=>f.Bf||0));
      if(maxFtgSize > 8) sw.push(`⚠ SANITY CHECK: Footing size = ${r2(maxFtgSize)}m × ${r2(maxFtgSize)}m. This is very large — consider increasing soil bearing capacity or reducing loads.`);
      return sw;
    })(),
  };
}

function runNow(){
  const ldEl=document.getElementById('ld');
  const rbEl=document.getElementById('rb');

  // ── CHECK FOR MISSING NODES NEEDING STUDENT INPUT ────────────
  if(!GRID) initGrid();
  const unchosenNodes = needsMissingNodeDialog();
  if(unchosenNodes.length > 0){
    showMissingNodeDialog(unchosenNodes, ()=>runNow()); // show dialog, callback runs analysis
    return;
  }

  if(ldEl)ldEl.style.display='block';
  if(rbEl)rbEl.disabled=true;
  setTimeout(()=>{
    try{
      if(!GRID)initGrid();
      RES=runCalcsFromGrid();
      if(!RES){alert('Calculation returned empty. Check inputs.');return;}
      // Push fresh RES to parent so AI panel stays in sync
      try{
        window.parent.postMessage({
          type:'AI_CONTEXT',
          S: JSON.parse(JSON.stringify(S)),
          RES: JSON.parse(JSON.stringify(RES)),
        }, '*');
      }catch(err){}
      // Push to history as the original/first run
      if(window._analysisHistory&&window._analysisHistory.length===0){
        pushHistory('Original analysis');
      }
      // Save immediately so refresh always shows latest result
      if(typeof saveToParent==='function') saveToParent();
      go(7);
      // Show sanity warnings after results load
      if(RES.sanityWarnings&&RES.sanityWarnings.length>0){
        setTimeout(()=>{
          const m=document.getElementById('main');
          if(m){
            const sw=document.createElement('div');
            sw.style.cssText='margin:0 0 12px 0;padding:12px;background:rgba(245,158,11,0.1);border:1.5px solid rgba(245,158,11,0.5);border-radius:8px;font-size:11px;color:#fbbf24';
            sw.innerHTML='<strong>⚠ SANITY WARNINGS — Please review before trusting these results:</strong><br><br>'+RES.sanityWarnings.join('<br><br>');
            m.insertBefore(sw,m.firstChild);
          }
        },500);
      }
    }catch(e){
      console.error('runCalcs error:',e);
      if(ldEl)ldEl.style.display='none';
      if(rbEl)rbEl.disabled=false;
      const m=document.getElementById('main');
      if(m){
        // Format validation errors nicely
        const isValidation=e.message.startsWith('INPUT VALIDATION FAILED');
        const errLines=e.message.split('\n').filter(Boolean);
        m.innerHTML=`<div class="card" style="border-color:rgba(248,113,113,.5)">
          <div class="ct" style="color:var(--red)">${isValidation?'⛔ Cannot Run Analysis — Invalid Inputs':'Calculation Error'}</div>
          ${errLines.map(l=>`<div style="padding:4px 0;font-size:11px;color:${l.startsWith('❌')?'#f87171':l.startsWith('⚠')?'#fbbf24':'#94a3b8'};line-height:1.6">${l}</div>`).join('')}
          <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn" onclick="go(2)">← Fix Plan & Spans</button>
            <button class="btn" onclick="go(3)">Fix Loads</button>
            <button class="btn" onclick="go(4)">Fix Materials</button>
          </div>
        </div>`;
      }
    }
  },200);
}


