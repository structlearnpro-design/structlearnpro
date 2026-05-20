// ═══════════════════════════════════════════════════════════════════
// STRUCTLEARN PRO — UI
// Pages, report rendering, PDFs, diagrams, learning modules,
// certificates, guided design, student tracking
// This file is loaded AFTER engine.js by StructLearnPro.html
// ═══════════════════════════════════════════════════════════════════

// == 06_pages.js ==

// ================================================================
// MODULE: 06_pages
// Navigation pages p0-p7
// ================================================================



function go(n){
  if(n===7&&!RES)return;
  PAGE=n;
  try{
    document.querySelectorAll('.nav-i').forEach((el)=>{
      const onclick=el.getAttribute('onclick')||'';
      const goIdx=onclick.indexOf('go('+String(n)+')');
      el.classList.toggle('active',goIdx>=0);
    });
    const html=pages[n]();
    document.getElementById('main').innerHTML=html||'<div class="card">Page '+n+' loaded.</div>';
    window.scrollTo(0,0);
    if(n===7)setTimeout(()=>{
      showSec(RSEC);
      // Auto-scroll to first failure after content loads
      setTimeout(()=>{
        const fails=document.querySelectorAll('.vd-fail,.verdict-fail,[class*="fail"],[style*="f87171"],[style*="dc2626"]');
        for(const el of fails){
          if(el.offsetParent!==null){el.scrollIntoView({behavior:'smooth',block:'center'});break;}
        }
      },300);
    },60);
    if(n===2){
      if(!GRID)initGrid();
      // Apply any stored node choices so canvas is correct immediately
      if(Object.keys(window._nodeChoices||{}).length>0) applyNodeChoices();
      // Multiple draws to ensure _coordMode flag is read correctly
      setTimeout(()=>{
        const cv=document.getElementById('gridCanvas');
        if(cv){drawGrid(cv);updateStructSummary();}
      },60);
      setTimeout(()=>{
        const cv=document.getElementById('gridCanvas');
        if(cv){drawGrid(cv);}
      },300);
    }
  }catch(e){
    document.getElementById('main').innerHTML='<div class="card" style="border-color:rgba(248,113,113,.5)"><div class="ct" style="color:#f87171">Page Error</div><div style="color:#94a3b8;font-size:12px;padding:10px">'+e.message+'<br><br><small>Check console for details. Try clicking a different page.</small></div></div>';
    console.error('go('+n+') error:',e);
  }
}

function p0(){return`
<div style="text-align:center;padding:18px 0 24px">
  <div style="font-size:50px;margin-bottom:10px">🏗</div>
  <div style="font-family:var(--sans);font-size:22px;font-weight:800;color:var(--blue)">STRUCTLEARN PRO</div>
  <div style="font-size:12px;color:var(--txt3);margin:6px auto;max-width:500px;line-height:1.8">Complete structural design with visual diagrams  -  exactly how a senior engineer explains to a fresh graduate. Every calculation has a picture.</div>
</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px">
  ${[['📐','Visual Diagrams','Every calculation step has an SVG diagram  -  tributary area, load, SFD, BMD, cross-sections'],
     ['🌍','Full IS Codes','IS 456 . IS 1893 . IS 875 P3 . IS 13920  -  all calculations shown'],
     ['🔩','Complete Design','Slab, beam, column, footing, staircase  -  every member, every check'],
     ['💨','Seismic + Wind','Both calculated fully. Comparison shown. Governing load identified'],
     ['🏗','Punching Shear','IS 456 Cl 31.6  -  full punching check with diagram showing critical perimeter'],
     ['📥','PDF Report','Download complete step-by-step report (fixed in v2)'],
  ].map(([i,t,d])=>`<div class="card" style="padding:14px"><div style="font-size:20px;margin-bottom:7px">${i}</div><div style="font-size:12px;font-weight:700;color:var(--txt);margin-bottom:4px;font-family:var(--sans)">${t}</div><div style="font-size:10px;color:var(--txt3);line-height:1.5">${d}</div></div>`).join('')}
</div>
<button class="btn" style="width:100%;padding:13px;font-size:14px" onclick="go(1)">Start Complete Design -></button>
<button class="btn vi" style="width:100%;padding:11px;font-size:12px;margin-top:8px" onclick="go(8)">🎓 Reference Design  -  G+3 Delhi (Learn from worked example)</button>
<div style="margin-top:16px;padding:12px;background:var(--bg1);border:1px solid var(--b1);border-radius:10px">
  <div style="font-size:11px;font-weight:700;color:var(--txt3);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Project Storage</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
    <button class="btn" onclick="loadProject()" style="background:linear-gradient(135deg,#065f46,#047857);border:1px solid #059669;font-size:11px">💾 Restore Last Saved</button>
    <button class="btn se" onclick="importProject()" style="font-size:11px">📂 Import JSON File</button>
  </div>
  <div id="savedProjectInfo" style="margin-top:8px;font-size:10px;color:var(--txt3);text-align:center"></div>
</div>`;
// Show last saved project info
setTimeout(()=>{
  try{
    const auto=localStorage.getItem('structlearn_project_v1_auto')||localStorage.getItem('structlearn_project_v1');
    const el=document.getElementById('savedProjectInfo');
    if(auto&&el){
      const d=JSON.parse(auto);
      const age=Math.round((Date.now()-d.ts)/60000);
      el.innerHTML='Last saved: <strong style="color:var(--blue)">'+(d.S&&d.S.name||'unnamed')+'</strong> ('+(age<60?age+'m ago':Math.round(age/60)+'h ago')+')';
    }
  }catch(e){}
},100);
}

function p1(){return`
<div class="card bl">
  <div class="ct">📋 Project Information</div>
  <div class="row">
    <div class="col2">
      ${tfld('name','Project Name','Name on report cover',S.name)}
      ${tfld('client','Client','Property owner name',S.client)}
      ${tfld('location','City / Location','Determines seismic zone and wind zone',S.location)}
      ${fld('numFloors','Number of Floors','Total storeys including ground. G+3 = 4','floors','num',S.numFloors)}
      ${fld('floorHt','Floor to Floor Height','Typical residential: 3.0-3.2m','m','num',S.floorHt)}
    </div>
    <div class="col2">
      ${fld('zone','Seismic Zone','Delhi=IV, Mumbai=III, Chennai=III, Bangalore=II','','sel',S.zone,[{v:'II',l:'Zone II  -  Z=0.10'},{v:'III',l:'Zone III  -  Z=0.16'},{v:'IV',l:'Zone IV  -  Z=0.24 (Delhi) OK'},{v:'V',l:'Zone V  -  Z=0.36'}])}
      ${fld('soilType','Soil Type','Type I=Hard rock. Type II=Medium (most cities). Type III=Soft/coastal','','sel',S.soilType,[{v:'I',l:'Type I  -  Hard rock (factor 1.0)'},{v:'II',l:'Type II  -  Medium (factor 1.2) OK'},{v:'III',l:'Type III  -  Soft (factor 1.5)'}])}
      ${fld('importance','Importance Factor I','Residential=1.0, Schools/Hospitals=1.5','','sel',S.importance,[{v:1.0,l:'I=1.0  -  Residential/Commercial'},{v:1.5,l:'I=1.5  -  Schools/Hospitals'},{v:2.0,l:'I=2.0  -  Critical'}])}
      ${fld('windZone','Wind Zone','Delhi/Pune=IV (47m/s). Chennai=V (50m/s)','','sel',S.windZone,[{v:'I',l:'Zone I  -  33m/s'},{v:'II',l:'Zone II  -  39m/s'},{v:'III',l:'Zone III  -  44m/s'},{v:'IV',l:'Zone IV  -  47m/s (Delhi) OK'},{v:'V',l:'Zone V  -  50m/s'},{v:'VI',l:'Zone VI  -  55m/s'}])}
      ${fld('terrain','Terrain Category','Cat 2 = open terrain with sparse obstacles (most cities)','','sel',S.terrain,[{v:'1',l:'Cat 1  -  Open (k2=1.05)'},{v:'2',l:'Cat 2  -  Sparse obstacles (k2=0.98) OK'},{v:'3',l:'Cat 3  -  Urban (k2=0.91)'}])}
    </div>
  </div>
  <div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn" onclick="go(2)">Next -></button></div>
</div>`;}

function p3(){
  // Auto-update wallLoad based on current floor height before rendering
  {const ht=S.floorHt||3.2;const wallH=ht-(S.slabThk||150)/1000;S.wallLoad=Math.round(0.23*wallH*19*0.7*10)/10;}return`
<div class="card or">
  <div class="ct or">v Load Definition (IS 875 Parts 1 & 2)</div>
  <div class="cp or" style="margin-bottom:14px">All 6 load combinations per IS 456 Cl 18.2 + IS 1893 Cl 6.3 are applied automatically: 1.5(DL+LL) . 1.2(DL+LL+EQ) . 1.5(DL+EQ) . 0.9DL+1.5EQ . 1.2(DL+LL+WL) . 1.5(DL+WL)</div>
  <div class="row">
    <div class="col2">
      ${fld('udlLL','Live Load  -  Floors','IS 875 P2 Table 1: Residential=2.0, Corridors=3.0','kN/m^2','num',S.udlLL)}
      ${fld('udlRoof','Live Load  -  Roof','IS 875 P2: Accessible=1.5, Non-accessible=0.75','kN/m^2','num',S.udlRoof)}
      ${fld('floorFinish','Floor Finish','Tiles+mortar+screed ~ 1.0 kN/m^2','kN/m^2','num',S.floorFinish)}
    </div>
    <div class="col2">
      ${fld('partitions','Partition Load','IS 875 P2 Cl 3.1.2: Movable partitions ~ 1.0-1.5 kN/m^2','kN/m^2','num',S.partitions)}
      ${fld('wallLoad','Wall Load on Beams','Auto = 0.23m brick x floor height x 19 kN/m3 x 0.7 (30% openings). Changes when floor height changes. Override if needed.','kN/m','num',S.wallLoad)}
      ${fld('slabThk','Trial Slab Thickness','Will be verified by l/d check. Min 125mm.','mm','num',S.slabThk)}
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:12px">
    <button class="btn se" onclick="go(2)"><- Back</button>
    <button class="btn" onclick="go(4)">Next -></button>
  </div>
</div>`;}

function p4(){return`
<div class="card">
  <div class="ct">🧱 Material Specification (IS 456 Table 5 + IS 1786)</div>
  <div class="row">
    <div class="col2">
      ${fld('fck','Concrete Grade','IS 456 Table 5: Moderate exposure -> min M25','','sel',S.fck,[{v:20,l:'M20  -  Mild exposure only'},{v:25,l:'M25  -  Standard residential OK'},{v:30,l:'M30  -  Moderate/coastal'},{v:35,l:'M35  -  Heavy exposure'},{v:40,l:'M40  -  High strength'}])}
      ${fld('coverBeam','Cover  -  Beams','IS 456 Table 16: Moderate exposure = 40mm nominal','mm','num',S.coverBeam)}
      ${fld('coverCol','Cover  -  Columns','IS 456 Table 16: 40mm for moderate exposure','mm','num',S.coverCol)}
    </div>
    <div class="col2">
      ${fld('fy','Steel Grade','IS 13920 Cl 5.3: Fe500D mandatory in seismic zones','','sel',S.fy,[{v:415,l:'Fe415  -  HYSD (non-seismic only)'},{v:500,l:'Fe500D  -  Ductile TMT OK (seismic zones)'}])}
      ${fld('coverSlab','Cover  -  Slabs','IS 456 Table 16: Bottom of slab = 20mm (moderate)','mm','num',S.coverSlab)}
      ${fld('coverFtg','Cover  -  Footings','IS 456 Cl 26.4.2.2: 75mm against earth  -  mandatory','mm','num',S.coverFtg)}
    </div>
  </div>
  <div class="cp gr" style="margin-top:10px">
    <strong>Derived: </strong>
    Ec = 5000sqrt${S.fck} = ${r0(5000*Math.sqrt(S.fck))} N/mm^2 &nbsp;|&nbsp;
    fyd = ${S.fy}/1.15 = ${r2(S.fy/1.15)} N/mm^2 &nbsp;|&nbsp;
    Mulim factor = ${r2(0.36*(S.fy/1.15/(S.fy/1.15+700))*(1-0.42*(S.fy/1.15/(S.fy/1.15+700))))}
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:12px">
    <button class="btn se" onclick="go(3)"><- Back</button>
    <button class="btn" onclick="go(5)">Next -></button>
  </div>
</div>`;}

function p5(){return`
<div class="card ye">
  <div class="ct ye">🌍 Soil & Foundation Data</div>
  <div class="row">
    <div class="col2">
      ${fld('soilBearing','Safe Bearing Capacity','From SI Report (IS 6403). Delhi alluvial: 150-250 kN/m^2','kN/m^2','num',S.soilBearing)}
      ${fld('ftgDepth','Foundation Depth Df (below NGL)','IS 1904: min 0.5m below NGL. Delhi: 1.5m typical. Deeper = more net SBC reduction.','m','num',S.ftgDepth)}
      ${fld('ftgMinD','Footing Thickness D (override)','Leave 0 for auto-calculation. Set a value if you want to fix the footing depth (e.g. 300mm minimum due to space constraints).','mm','num',S.ftgMinD||0)}
    </div>
    <div class="col2">
      <div class="cp ye">
        <strong>Net SBC calculation:</strong><br>
        Net SBC = Gross SBC - gammaxDf<br>
        = ${S.soilBearing} - 18x${S.ftgDepth}<br>
        = <strong>${r2(S.soilBearing-18*S.ftgDepth)} kN/m^2</strong><br><br>
        <strong>Typical SBC (IS 6403):</strong><br>
        Filled soil: &lt;50 | Alluvial: 100-200 | Dense sand: 200-400 | Rock: &gt;400 kN/m^2
      </div>
    </div>
  </div>

  <!-- ── FOOTING TYPE SELECTION ─────────────────────────────── -->
  <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,0.05);border:1px solid rgba(251,191,36,0.2);border-radius:8px">
    <div style="font-size:11px;font-weight:700;color:#fbbf24;margin-bottom:8px">🏗 Footing Type</div>
    <div style="font-size:10px;color:#94a3b8;margin-bottom:10px">Select foundation type. App auto-checks if isolated footings overlap and warns you to switch. For weak soils (SBC &lt; 75 kN/m²), raft is recommended.</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${[
        {id:'isolated', label:'Isolated Pad', desc:'One footing per column. IS 456 Cl 34.', icon:'⬜', color:'#34d399'},
        {id:'combined', label:'Combined Footing', desc:'Two columns share one elongated pad.', icon:'▭', color:'#f59e0b'},
        {id:'raft',     label:'Raft / Mat',   desc:'Continuous slab under all columns. IS 456 Cl 34.4.', icon:'▦', color:'#f87171'},
      ].map(t=>`
        <button onclick="S.ftgType='${t.id}';go(5)"
          style="flex:1;min-width:140px;padding:10px 12px;border-radius:8px;cursor:pointer;text-align:left;
          border:1.5px solid ${(S.ftgType||'isolated')===t.id?t.color:'rgba(30,58,138,0.4)'};
          background:${(S.ftgType||'isolated')===t.id?'rgba('+((S.ftgType||'isolated')===t.id&&t.color==="#34d399"?'52,211,153':t.color==='#f59e0b'?'245,158,11':'248,113,113')+',0.08)':'transparent'}">
          <div style="font-size:13px;margin-bottom:3px">${t.icon}</div>
          <div style="font-size:10px;font-weight:700;color:${(S.ftgType||'isolated')===t.id?t.color:'#94a3b8'}">${t.label}</div>
          <div style="font-size:8px;color:#64748b;margin-top:2px">${t.desc}</div>
        </button>`).join('')}
    </div>
    ${(S.ftgType||'isolated')==='raft'?`<div style="margin-top:8px;padding:8px;background:rgba(248,113,113,0.08);border-radius:6px;font-size:9px;color:#f87171">⚠ Raft foundation design requires separate detailed analysis. The app will size individual column footings as reference; actual raft design must be done by a structural engineer.</div>`:''}
    ${(S.ftgType||'isolated')==='combined'?`<div style="margin-top:8px;padding:8px;background:rgba(245,158,11,0.08);border-radius:6px;font-size:9px;color:#f59e0b">ℹ Combined footing: app designs each column's tributary area. For actual combined footing, the engineer must design the connecting beam/slab.</div>`:''}
  </div>

  <!-- ── STAIR TYPE SELECTION ───────────────────────────────── -->
  <div style="margin-top:14px;padding:12px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);border-radius:8px">
    <div style="font-size:11px;font-weight:700;color:#f59e0b;margin-bottom:8px">🪜 Staircase Type & Geometry <span style="font-size:9px;color:#64748b;font-weight:400">(only needed if you marked a bay as Staircase)</span></div>

    <!-- Type selector -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
      ${[
        {id:'straight', label:'Straight Flight', desc:'Single run, no turn. Bay ≥ 2m × 4m.', col:'#f59e0b'},
        {id:'dogleg',   label:'Dog-Leg (U-Turn)',desc:'Two flights + mid landing. Bay ≥ 2.5m × 5m.', col:'#34d399'},
        {id:'90turn',   label:'90° Quarter-Turn',desc:'L-shaped with quarter landing. Bay ≥ 3m × 3m.', col:'#38bdf8'},
      ].map(t=>`
        <button onclick="S.stairType='${t.id}';go(5)"
          style="flex:1;min-width:130px;padding:8px 10px;border-radius:8px;cursor:pointer;text-align:left;
          border:1.5px solid ${(S.stairType||'dogleg')===t.id?t.col:'rgba(30,58,138,0.4)'};
          background:${(S.stairType||'dogleg')===t.id?'rgba(245,158,11,0.06)':'transparent'}">
          <div style="font-size:10px;font-weight:700;color:${(S.stairType||'dogleg')===t.id?t.col:'#94a3b8'}">${t.label} ${(S.stairType||'dogleg')===t.id?'✓':''}</div>
          <div style="font-size:8px;color:#64748b;margin-top:2px">${t.desc}</div>
        </button>`).join('')}
    </div>

    <!-- Riser / Tread inputs -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
      <div>
        <label style="font-size:10px;color:#94a3b8;display:block;margin-bottom:3px">Riser (R) mm</label>
        <input type="number" value="${S.riser||150}" min="100" max="200" step="5"
          style="width:100%;background:#0f172a;color:#f1f5f9;border:1px solid ${(S.riser||150)<100||(S.riser||150)>200?'#f87171':'#1e3a8a'};border-radius:6px;padding:6px 8px;font-size:11px;font-family:monospace"
          oninput="S.riser=Math.max(100,Math.min(200,parseInt(this.value)||150));this.style.borderColor=S.riser<100||S.riser>200?'#f87171':'#1e3a8a'">
        <div style="font-size:8px;color:#64748b;margin-top:2px">IS NBC: 100–200mm</div>
      </div>
      <div>
        <label style="font-size:10px;color:#94a3b8;display:block;margin-bottom:3px">Tread (T) mm</label>
        <input type="number" value="${S.tread||270}" min="250" max="350" step="5"
          style="width:100%;background:#0f172a;color:#f1f5f9;border:1px solid ${(S.tread||270)<250?'#f87171':'#1e3a8a'};border-radius:6px;padding:6px 8px;font-size:11px;font-family:monospace"
          oninput="S.tread=Math.max(250,Math.min(400,parseInt(this.value)||270));this.style.borderColor=S.tread<250?'#f87171':'#1e3a8a'">
        <div style="font-size:8px;color:#64748b;margin-top:2px">IS NBC: min 250mm</div>
      </div>
      <div>
        <label style="font-size:10px;color:#94a3b8;display:block;margin-bottom:3px">2R + T check</label>
        <div style="padding:6px 8px;background:#0f172a;border:1px solid ${Math.abs(2*(S.riser||150)+(S.tread||270)-600)<=50?'#34d399':'#f87171'};border-radius:6px;font-size:11px;color:${Math.abs(2*(S.riser||150)+(S.tread||270)-600)<=50?'#34d399':'#f87171'};font-family:monospace">
          ${2*(S.riser||150)+(S.tread||270)} mm
        </div>
        <div style="font-size:8px;color:#64748b;margin-top:2px">Should be 550–650mm (IS NBC)</div>
      </div>
    </div>
    <div style="margin-top:8px;font-size:9px;color:#64748b">
      Steps per floor = ${Math.ceil((S.floorHt||3.2)*1000/(S.riser||150))} steps at ${S.riser||150}mm rise &nbsp;|&nbsp;
      Flight run = ${Math.ceil((S.floorHt||3.2)*1000/(S.riser||150))} × ${S.tread||270} = ${Math.ceil((S.floorHt||3.2)*1000/(S.riser||150))*(S.tread||270)}mm (${r2(Math.ceil((S.floorHt||3.2)*1000/(S.riser||150))*(S.tread||270)/1000)}m)
      &nbsp;|&nbsp; θ = ${Math.round(Math.atan((S.riser||150)/(S.tread||270))*180/Math.PI)}°
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;margin-top:12px">
    <button class="btn se" onclick="go(4)"><- Back</button>
    <button class="btn" onclick="go(6)">Next -></button>
  </div>
</div>`;}

function p6(){return`
<div class="card bl">
  <div class="ct">* Ready to Run</div>
  <div class="cp" style="margin-bottom:14px">
    ${[['Project',S.name],['Location',S.location],['Floors',`G+${S.numFloors-1} x ${S.floorHt}m`],
       ['Plan',`${S.buildingL}m x ${S.buildingW}m`],
       ['Seismic Zone',`Zone ${S.zone}`],['Wind Zone',`Zone ${S.windZone}`],
       ['Concrete','M'+S.fck],['Steel','Fe'+S.fy],['SBC',S.soilBearing+' kN/m^2'],
    ].map(([k,v])=>`<strong style="color:var(--txt)">${k}:</strong> ${v}`).join(' &nbsp;.&nbsp; ')}
  </div>
  <button class="btn gr" id="rb" style="width:100%;padding:13px;font-size:14px" onclick="runNow();setTimeout(()=>saveToParent('draft'),2000)">🚀 Run Full Analysis</button>
  <div id="ld" style="display:none;margin-top:12px">
    <div class="lbar"><div class="lfill"></div></div>
    <div style="font-size:11px;color:var(--teal);line-height:2.2;text-align:center;padding:8px">
      <div>OK Seismic analysis (IS 1893:2016)...</div><div>OK Wind load (IS 875 Part 3)...</div>
      <div>OK 6 load combinations (IS 456 Cl 18.2)...</div><div>OK Slab design with diagrams...</div>
      <div>OK Beam design  -  SFD, BMD, shear...</div><div>OK Column + ductile detailing (IS 13920)...</div>
      <div>OK Footings  -  punching + one-way shear...</div>
    </div>
  </div>
  <div style="display:flex;justify-content:flex-start;margin-top:10px"><button class="btn se" onclick="go(5)"><- Back</button></div>
</div>`;}

// =======================================================
// REPORT SECTIONS WITH VISUAL DIAGRAMS
// =======================================================

function p7(){
  if(!RES)return`<div class="card">Run analysis first.</div>`;
  return`
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;padding:10px;background:var(--bg1);border-radius:8px;border:1px solid var(--b1)">
  <button class="btn gr" onclick="if(requirePro('PDF Report')) showPDFDialog()">↓ Download Report PDF <span style="font-size:9px;background:#f59e0b;color:#1a1208;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:700">PRO</span></button>
  ${typeof _userPlan!=='undefined'&&_userPlan!=='pro'?`
  <div style="width:100%;margin-top:6px;padding:8px 12px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:6px;font-size:11px;color:#94a3b8;display:flex;align-items:center;gap:8px">
    <span>📖 You can view all reports below for free.</span>
    <button onclick="if(typeof showUp!=='undefined')showUp()" style="padding:3px 10px;background:#b8860b;border:none;border-radius:4px;color:#1a1208;font-size:10px;font-weight:700;cursor:pointer">Upgrade to download PDF →</button>
  </div>`:``}
  <button class="btn" onclick="saveProject()" style="background:linear-gradient(135deg,#065f46,#047857);border:1px solid #059669" title="Save to browser memory">💾 Save</button>
  <button class="btn" onclick="loadProject()" style="background:linear-gradient(135deg,#1e3a5f,#047857);border:1px solid #059669" title="Load from browser memory">📂 Load</button>
  <button class="btn" onclick="if(requirePro('Export Project')) exportProject()" style="background:linear-gradient(135deg,#1e3a5f,#1e40af);border:1px solid #2563eb" title="Export as JSON file">📤 Export <span style="font-size:9px;background:#f59e0b;color:#1a1208;padding:1px 5px;border-radius:3px;font-weight:700">PRO</span></button>
  <button class="btn se" onclick="importProject()" title="Import from JSON file">📥 Import</button>
      <button class="btn" onclick="if(requirePro('Construction Drawings')) showConstructionPDFDialog()" style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8);border:1px solid #3b82f6;margin-left:8px">📐 Construction Drawing Package <span style="font-size:9px;background:#f59e0b;color:#1a1208;padding:1px 5px;border-radius:3px;font-weight:700">PRO</span></button>
  <button class="btn" onclick="if(requirePro('Snapshot')) takeSnapshot()" title="Save current design for comparison" style="background:linear-gradient(135deg,#1e3a8a,#312e81);border:1px solid #6366f1">📸 Snapshot <span style="font-size:9px;background:#f59e0b;color:#1a1208;padding:1px 5px;border-radius:3px;font-weight:700">PRO</span></button>
  <button class="btn se" onclick="go(2)"><- Edit Inputs</button>
  <button class="btn se" onclick="RES=null;go(0)">🔄 New</button>
</div>
<div id="pdfProg" class="pdf-prog">
  <div style="font-size:11px;font-weight:700;color:var(--teal);margin-bottom:8px">📄 Generating PDF Report...</div>
  <div class="lbar"><div class="lfill"></div></div>
  <div id="pdfLog" class="pdf-log"></div>
</div>
<div class="tabs">
  ${['overview','seismic','wind','slab','beams','columns','footings','staircase','safety','schedule','snapshot'].map(s=>
    `<button class="tab${RSEC===s?' active':''}" onclick="showSec('${s}')">${s.toUpperCase()}</button>`).join('')}
</div>
<div id="_historyBar" style="display:none;align-items:center;gap:6px;flex-wrap:wrap;padding:8px 12px;background:rgba(56,189,248,0.04);border:1px solid rgba(56,189,248,0.15);border-radius:8px;margin-bottom:10px">
  <span style="font-size:9px;color:#64748b;font-weight:700;white-space:nowrap">📋 HISTORY:</span>
</div>
<div id="secBody"></div>`;}

function renderGridPrev(){
  const el=document.getElementById('gridPrev');if(!el)return;
  const sx=S.spansX,sy=S.spansY,W=260,H=180,pad=25;
  const totX=sx.reduce((a,b)=>a+b,0),totY=sy.reduce((a,b)=>a+b,0);
  const scx=(W-2*pad)/totX,scy=(H-2*pad)/totY;
  let xs=[pad],ys=[pad];
  sx.forEach(s=>xs.push(xs[xs.length-1]+s*scx));
  sy.forEach(s=>ys.push(ys[ys.length-1]+s*scy));
  let g=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block">`;
  g+=`<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;
  // beams — skip if either endpoint is void/missing
  xs.forEach((x,ci)=>{
    ys.forEach((y,ri)=>{
      if(ri<sy.length){
        const n1=GRID&&getNode(ri,ci), n2=GRID&&getNode(ri+1,ci);
        if(n1&&!n1.hasColumn&&n1._choice==='void') return;
        if(n2&&!n2.hasColumn&&n2._choice==='void') return;
        g+=`<line x1="${x}" y1="${y}" x2="${x}" y2="${ys[ri+1]}" stroke="#fb923c" stroke-width="3.5" stroke-linecap="round"/>`;
      }
    });
  });
  ys.forEach((y,ri)=>{
    xs.forEach((x,ci)=>{
      if(ci<sx.length){
        const n1=GRID&&getNode(ri,ci), n2=GRID&&getNode(ri,ci+1);
        if(n1&&!n1.hasColumn&&n1._choice==='void') return;
        if(n2&&!n2.hasColumn&&n2._choice==='void') return;
        g+=`<line x1="${x}" y1="${y}" x2="${xs[ci+1]}" y2="${y}" stroke="#fb923c" stroke-width="3.5" stroke-linecap="round"/>`;
      }
    });
  });
  // columns — skip void/missing nodes
  xs.forEach((x,ci)=>ys.forEach((y,ri)=>{
    const gn=GRID&&getNode(ri,ci);
    if(gn&&!gn.hasColumn) return; // skip removed columns
    g+=`<rect x="${x-6}" y="${y-6}" width="12" height="12" fill="#374151" stroke="#34d399" stroke-width="1.8" rx="2"/>`;
    g+=`<circle cx="${x}" cy="${y}" r="2.5" fill="#34d399"/>`;
  }));
  // span labels x
  for(let i=0;i<sx.length;i++)g+=`<text x="${(xs[i]+xs[i+1])/2}" y="${ys[0]-6}" fill="#64748b" font-size="8" text-anchor="middle" font-family="JetBrains Mono">${sx[i]}m</text>`;
  // span labels y
  for(let i=0;i<sy.length;i++){g+=`<text x="${xs[0]-6}" y="${(ys[i]+ys[i+1])/2+3}" fill="#64748b" font-size="8" text-anchor="end" font-family="JetBrains Mono">${sy[i]}m</text>`;}
  g+=`<text x="${W/2}" y="${H-2}" fill="#38bdf8" font-size="8" text-anchor="middle" font-family="JetBrains Mono">${(sx.length+1)*(sy.length+1)} cols . ${sx.length*sy.length} bays</text>`;
  g+='</svg>';
  el.innerHTML=g;
}

// == 07_report.js ==

// ================================================================
// MODULE: 07_report
// Report sections
// ================================================================





// Member selector state (single declaration)
if(typeof _beamFloor==='undefined'){var _beamFloor=1,_beamIdx=0,_colFloor=1,_colNodeIdx=0,_ftgIdx=0;}
function showSec(s){
  RSEC=s;
  document.querySelectorAll('.tab').forEach(t=>{t.classList.toggle('active',t.textContent.toLowerCase()===s);});
  const fns={overview:secOverview,seismic:secSeismic,wind:secWind,slab:secSlab,beams:secBeams,columns:secColumns,footings:secFootings,staircase:secStair,safety:secSafety,schedule:secMemberSchedule,snapshot:secSnapshot};
  const el=document.getElementById('secBody');
  if(el)(fns[s]||secOverview)().then?fns[s]().then(h=>el.innerHTML=h):el.innerHTML=(fns[s]||secOverview)();
  setTimeout(()=>{if(s==='seismic'&&RES)renderGridPrev&&renderGridPrev();},50);
}

function secOverview(){
  const{slab,seis,wind,beams,cols,ftgs}=RES;
  // Use allBeams/allCols/allFtgs if available, fall back to beams/cols/ftgs
  const allBeamsArr = RES.allBeams||beams;
  const allColsArr  = RES.allCols||cols;
  const allFtgsArr  = RES.allFtgs||ftgs;
  const allB=allBeamsArr.every(b=>b.deflOK&&b.shearSafe);
  const allC=allColsArr.filter(c=>c.floor===1).every(c=>c.safe);
  const allF=allFtgsArr.every(f=>f.punch_ok&&f.ow_ok);
  return`
<div class="card bl">
  <div class="ct">Design Summary  -  ${S.name}</div>
  ${RES.sanityWarnings&&RES.sanityWarnings.length>0?`
  <div style="margin-bottom:14px;padding:12px;background:rgba(245,158,11,0.08);border:2px solid rgba(245,158,11,0.6);border-radius:8px">
    <div style="font-size:12px;font-weight:800;color:#f59e0b;margin-bottom:8px">⚠ SANITY CHECK — Review Before Trusting Results</div>
    ${RES.sanityWarnings.map(w=>`<div style="font-size:10.5px;color:#fbbf24;line-height:1.7;margin-bottom:4px">${w}</div>`).join('')}
    <div style="font-size:9px;color:#92400e;margin-top:8px">Go back to <button onclick="go(2)" style="background:none;border:none;color:#f59e0b;cursor:pointer;text-decoration:underline;font-size:9px">Plan & Spans</button> and verify your inputs.</div>
  </div>`:``}
  ${RES.gridSummary&&RES.gridSummary.nMissing>0?`<div class="cp" style="border-left-color:var(--yellow);margin-bottom:10px"><strong style="color:var(--yellow)">Irregular Structure:</strong> ${RES.gridSummary.nMissing} missing column(s), ${RES.gridSummary.nTransfer} transfer beam(s), ${RES.gridSummary.nCant} cantilever(s). Results account for actual grid configuration.</div>`:''}
  <div style="font-size:11px;color:var(--txt3);margin-bottom:12px">G+${S.numFloors-1} . ${S.buildingL}mx${S.buildingW}m . M${S.fck}/Fe${S.fy} . Zone ${S.zone} seismic . Zone ${S.windZone} wind</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div>
      ${krow('Base Shear (Vb)',r2(seis.Vb)+' kN','IS 1893','val')}
      ${krow('Design Acc. (Ah)',seis.Ah.toFixed(4),'IS 1893')}
      ${krow('Wind pressure (pz)',r2(wind.pz)+' kN/m^2','IS 875 P3')}
      ${krow('Governs','Seismic (Vb='+r2(seis.Vb)+'kN)','compare')}
    </div>
    <div>
      ${krow('Slab',slab.ok?'SAFE OK':'REVISE','',(slab.ok?'ok':'ng'))}
      ${krow('Beams',allB?'ALL SAFE OK':'CHECK','',(allB?'ok':'ng'))}
      ${krow('Columns (F1)',allC?'ALL SAFE OK':'CHECK','',(allC?'ok':'ng'))}
      ${krow('Footings  -  Punching',allF?'ALL SAFE OK':'CHECK','',(allF?'ok':'ng'))}
    </div>
  </div>
  ${sdiv('Member Schedule')}
  <table>
    <tr><th>Member</th><th>Size</th><th>Main Steel</th><th>Links/Ties</th><th>Status</th></tr>
    <tr><td>Slab (${slab.twoWay?'2-way':'1-way'})</td><td class="val">${slab.slabD}mm</td><td class="val">T10@${slab.spx}(X)+T8@${slab.spy}(Y)</td><td> - </td><td class="${slab.ok?'ok':'ng'}">${slab.ok?'SAFE':'REVISE'}</td></tr>
    ${beams.map(b=>`<tr><td>${b.label}</td><td class="val">${b.b}x${b.D}</td><td class="val">${b.nm}T20+${b.ns}T20</td><td class="val">T8@${b.svd}(e)/@${b.sv}(m)</td><td class="${b.deflOK&&b.shearSafe?'ok':'ng'}">${b.deflOK&&b.shearSafe?'SAFE':'CHECK'}</td></tr>`).join('')}
    ${['corner','edge','inter'].map((tp,i)=>{const c=cols.find(cl=>cl.floor===1&&cl[tp]);if(!c)return'';return`<tr><td>${tp} Col F1</td><td class="val">${c.size}x${c.size}</td><td class="val">${c.nb}T${c.dB}(${r2(c.pt)}%)</td><td class="val">T8@${c.tsc}(Lo)/@${c.ts}</td><td class="${c.safe?'ok':'ng'}">${c.safe?'SAFE':'REVISE'}</td></tr>`;}).join('')}
    ${ftgs.map(f=>`<tr><td>${f.lbl}</td><td class="val">${r2(f.Bf)}m D=${r0(f.D)}mm</td><td class="val">T${f.dBf}@${f.spf}EW</td><td>75mm cover</td><td class="${f.punch_ok&&f.ow_ok?'ok':'ng'}">${f.punch_ok&&f.ow_ok?'SAFE':'CHECK'}</td></tr>`).join('')}
  </table>
</div>`;}


// ── STAIR TYPE SELECTION + CROSS-SECTION DIAGRAM ─────────────────
function svgStairSection(st) {
  var spX = st.spX || 3, spY = st.spY || 4;
  var flightSpan = st.flightSpan || spX * 0.7;
  var riser = st.riser || S.riser || 150;   // use student input
  var tread = st.tread || S.tread || 270;   // use student input
  var steps = Math.ceil(S.floorHt * 1000 / riser);
  var wD = st.wD || 150;         // waist slab thickness mm
  var cover = S.coverSlab || 20;
  var Ast = st.Ast2 || st.Ast || 400;       // mm²/m

  // Use student-selected type from result (set before analysis) or S state
  var type = st.stairType || S.stairType || (spX >= 2.5 && spY >= 5 ? 'dogleg' : spX >= 3 && spY >= 3 ? '90turn' : 'straight');

  var W = 660, H = 380;
  var lines = [];
  lines.push('<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;background:#0a0f1e;border-radius:8px">');

  // ── TYPE ILLUSTRATIONS (top row) ───────────────────────────────
  var typeData = [
    { id:'straight', label:'Straight Flight',  col:'#f59e0b', recW:'≥ 2m',   recL:'≥ 4m',  desc:'Single flight, no U-turn. Common for tight spaces.' },
    { id:'dogleg',   label:'Dog-Leg (U-Turn)', col:'#34d399', recW:'≥ 2.5m', recL:'≥ 5m',  desc:'Two flights with mid-landing. Most common residential.' },
    { id:'90turn',   label:'90° Quarter-Turn', col:'#38bdf8', recW:'≥ 3m',   recL:'≥ 3m',  desc:'L-shaped. Open well, elegant for corner bays.' },
  ];
  var cardW = 180, cardH = 100, cardGap = 16;
  var totalTW = typeData.length * cardW + (typeData.length - 1) * cardGap;
  var startX = (W - totalTW) / 2;

  typeData.forEach(function(td, i) {
    var tx = startX + i * (cardW + cardGap);
    var ty = 12;
    var isRec = td.id === type;
    var alpha = isRec ? 1 : 0.3;

    lines.push('<rect x="' + tx + '" y="' + ty + '" width="' + cardW + '" height="' + cardH + '" rx="6" fill="rgba(15,23,42,0.8)" stroke="' + td.col + '" stroke-width="' + (isRec ? 2 : 0.6) + '" opacity="' + alpha + '"/>');
    if (isRec) lines.push('<text x="' + (tx + cardW - 8) + '" y="' + (ty + 14) + '" fill="' + td.col + '" font-size="10" text-anchor="end" font-family="JetBrains Mono">✓ Recommended</text>');

    var cx = tx + cardW / 2, cy = ty + 30;

    if (td.id === 'straight') {
      // Step-up profile
      var sx2 = tx + 16, sy2 = ty + 75, nS = 5, sw = 22, sh = 10;
      for (var s = 0; s < nS; s++) {
        lines.push('<rect x="' + (sx2 + s*sw) + '" y="' + (sy2 - s*sh) + '" width="' + sw + '" height="' + (H/10) + '" fill="rgba(245,158,11,0.2)" stroke="' + td.col + '" stroke-width="0.8" opacity="' + alpha + '"/>');
      }
      lines.push('<line x1="' + (sx2+nS*sw) + '" y1="' + (sy2-nS*sh) + '" x2="' + (sx2+nS*sw+20) + '" y2="' + (sy2-nS*sh) + '" stroke="' + td.col + '" stroke-width="1.5" opacity="' + alpha + '"/>');
    } else if (td.id === 'dogleg') {
      // Up-landing-down profile
      var lx2 = tx + 10, ly2 = ty + 72, nS2 = 4, sw2 = 18, sh2 = 9;
      for (var s2 = 0; s2 < nS2; s2++) {
        lines.push('<rect x="' + (lx2 + s2*sw2) + '" y="' + (ly2 - s2*sh2) + '" width="' + sw2 + '" height="12" fill="rgba(52,211,153,0.2)" stroke="' + td.col + '" stroke-width="0.8" opacity="' + alpha + '"/>');
      }
      // Landing
      lines.push('<rect x="' + (lx2+nS2*sw2) + '" y="' + (ly2-nS2*sh2-4) + '" width="20" height="14" fill="rgba(52,211,153,0.3)" stroke="' + td.col + '" stroke-width="1" opacity="' + alpha + '"/>');
      // Second flight
      var rx2 = lx2 + nS2*sw2 + 20;
      for (var s3 = 0; s3 < nS2; s3++) {
        lines.push('<rect x="' + (rx2 + s3*sw2) + '" y="' + (ly2 - nS2*sh2 - s3*sh2) + '" width="' + sw2 + '" height="12" fill="rgba(52,211,153,0.2)" stroke="' + td.col + '" stroke-width="0.8" opacity="' + alpha + '"/>');
      }
    } else {
      // 90 degree turn
      var qx = tx + 18, qy = ty + 72, nS4 = 3, qsw = 22, qsh = 9;
      // First flight (horizontal in plan = vertical in elevation)
      for (var s4 = 0; s4 < nS4; s4++) {
        lines.push('<rect x="' + (qx + s4*qsw) + '" y="' + (qy - s4*qsh) + '" width="' + qsw + '" height="12" fill="rgba(56,189,248,0.2)" stroke="' + td.col + '" stroke-width="0.8" opacity="' + alpha + '"/>');
      }
      // Corner landing
      lines.push('<rect x="' + (qx+nS4*qsw) + '" y="' + (qy-nS4*qsh-4) + '" width="18" height="18" fill="rgba(56,189,248,0.3)" stroke="' + td.col + '" stroke-width="1" opacity="' + alpha + '"/>');
      // Second flight (90 degrees)
      for (var s5 = 0; s5 < nS4; s5++) {
        lines.push('<rect x="' + (qx+nS4*qsw) + '" y="' + (qy-nS4*qsh-4-s5*qsh) + '" width="12" height="' + qsh + '" fill="rgba(56,189,248,0.2)" stroke="' + td.col + '" stroke-width="0.8" opacity="' + alpha + '"/>');
      }
    }

    lines.push('<text x="' + cx + '" y="' + (ty + cardH - 24) + '" fill="' + td.col + '" font-size="9" font-weight="700" text-anchor="middle" font-family="JetBrains Mono" opacity="' + alpha + '">' + td.label + '</text>');
    lines.push('<text x="' + cx + '" y="' + (ty + cardH - 12) + '" fill="#64748b" font-size="7.5" text-anchor="middle" font-family="JetBrains Mono" opacity="' + alpha + '">' + td.recW + ' × ' + td.recL + ' bay</text>');
  });

  // ── STAIR CROSS-SECTION (bottom half) ──────────────────────────
  var csY = 125, csH = H - csY - 15;
  var csX = 40, csW = W - 80;
  var nSteps = Math.min(steps, 12);
  var stepW = Math.min(tread / 5, csW / (nSteps + 2));
  var stepH = Math.min(riser / 3, csH / (nSteps + 2));
  var waistThk = Math.max(8, wD / 20);

  // Title
  lines.push('<text x="' + (W/2) + '" y="' + (csY - 4) + '" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="middle" font-family="JetBrains Mono">WAIST SLAB CROSS-SECTION — ' + steps + ' steps @ ' + riser + 'mm rise / ' + tread + 'mm tread</text>');

  // Ground / landing at bottom-left
  lines.push('<rect x="' + csX + '" y="' + (csY + csH - 20) + '" width="40" height="20" fill="rgba(71,85,105,0.6)" stroke="#475569" stroke-width="1"/>');
  lines.push('<text x="' + (csX + 20) + '" y="' + (csY + csH + 10) + '" fill="#64748b" font-size="8" text-anchor="middle" font-family="JetBrains Mono">Ground</text>');

  // Steps
  var stairPath = 'M ' + (csX + 40) + ' ' + (csY + csH - 20);
  var curX = csX + 40, curY = csY + csH - 20;
  for (var s6 = 0; s6 < nSteps; s6++) {
    // Riser (vertical)
    stairPath += ' L ' + curX + ' ' + (curY - stepH);
    curY -= stepH;
    // Tread (horizontal)
    stairPath += ' L ' + (curX + stepW) + ' ' + curY;
    curX += stepW;
  }
  var topRightX = curX, topRightY = curY;
  stairPath += ' L ' + topRightX + ' ' + (topRightY + 20);
  stairPath += ' L ' + (csX + 40) + ' ' + (csY + csH - 20) + ' Z';

  // Waist slab (parallel to flight, shifted down by waistThk)
  var angle = Math.atan2(stepH, stepW);
  var perpX = Math.sin(angle) * waistThk;
  var perpY = Math.cos(angle) * waistThk;

  lines.push('<path d="' + stairPath + '" fill="rgba(100,116,139,0.15)" stroke="#475569" stroke-width="1.5"/>');

  // Waist slab bottom surface (parallel band)
  var wStartX = csX + 40, wStartY = csY + csH - 20;
  var waistPath = 'M ' + (wStartX + perpX) + ' ' + (wStartY + perpY);
  var wx = wStartX + perpX, wy = wStartY + perpY;
  for (var s7 = 0; s7 < nSteps; s7++) {
    wx = wStartX + perpX + s7 * stepW;
    wy = wStartY + perpY - s7 * stepH;
    waistPath += ' L ' + (wStartX + perpX + (s7 + 1) * stepW) + ' ' + (wStartY + perpY - (s7 + 1) * stepH);
  }
  lines.push('<line x1="' + (wStartX + perpX) + '" y1="' + (wStartY + perpY) + '" x2="' + (wStartX + perpX + nSteps * stepW) + '" y2="' + (wStartY + perpY - nSteps * stepH) + '" stroke="#38bdf8" stroke-width="' + waistThk + '" stroke-linecap="round" opacity="0.3"/>');

  // Reinforcement bars (along bottom of waist slab)
  var nBars = 3;
  for (var bi = 0; bi < nBars; bi++) {
    var barOffset = (waistThk * 0.3 + bi * waistThk * 0.2);
    var bpX = Math.sin(angle) * barOffset, bpY = Math.cos(angle) * barOffset;
    lines.push('<line x1="' + (wStartX + bpX) + '" y1="' + (wStartY + bpY) + '" x2="' + (wStartX + bpX + nSteps * stepW) + '" y2="' + (wStartY + bpY - nSteps * stepH) + '" stroke="#34d399" stroke-width="2.5" stroke-linecap="round"/>');
  }

  // Top landing
  lines.push('<rect x="' + topRightX + '" y="' + (topRightY - 5) + '" width="40" height="25" fill="rgba(71,85,105,0.5)" stroke="#475569" stroke-width="1"/>');
  lines.push('<text x="' + (topRightX + 20) + '" y="' + (topRightY + 26) + '" fill="#64748b" font-size="8" text-anchor="middle" font-family="JetBrains Mono">Landing</text>');

  // Dimension: waist slab thickness
  var midStep = Math.floor(nSteps / 2);
  var dimX1 = csX + 40 + midStep * stepW;
  var dimY1 = csY + csH - 20 - midStep * stepH;
  lines.push('<line x1="' + dimX1 + '" y1="' + dimY1 + '" x2="' + (dimX1 + perpX * 1.5) + '" y2="' + (dimY1 + perpY * 1.5) + '" stroke="#38bdf8" stroke-width="1" marker-end="url(#sArr)"/>');
  lines.push('<text x="' + (dimX1 + perpX * 2) + '" y="' + (dimY1 + perpY * 2 + 4) + '" fill="#38bdf8" font-size="8" font-family="JetBrains Mono">wD=' + wD + 'mm</text>');

  // Riser and tread labels
  lines.push('<line x1="' + (csX + 40) + '" y1="' + (csY + csH - 20) + '" x2="' + (csX + 40) + '" y2="' + (csY + csH - 20 - stepH) + '" stroke="#f59e0b" stroke-width="0.8"/>');
  lines.push('<text x="' + (csX + 30) + '" y="' + (csY + csH - 20 - stepH / 2) + '" fill="#f59e0b" font-size="8" text-anchor="end" font-family="JetBrains Mono">' + riser + 'mm</text>');
  lines.push('<line x1="' + (csX + 40) + '" y1="' + (csY + csH - 20) + '" x2="' + (csX + 40 + stepW) + '" y2="' + (csY + csH - 20) + '" stroke="#f59e0b" stroke-width="0.8"/>');
  lines.push('<text x="' + (csX + 40 + stepW / 2) + '" y="' + (csY + csH) + '" fill="#f59e0b" font-size="8" text-anchor="middle" font-family="JetBrains Mono">' + tread + 'mm</text>');

  // Angle label
  lines.push('<text x="' + (csX + 40 + 12) + '" y="' + (csY + csH - 27) + '" fill="#94a3b8" font-size="8" font-family="JetBrains Mono">θ=' + Math.round(Math.atan(riser/tread)*180/Math.PI) + '°</text>');

  // Legend
  var lgY = H - 12;
  var lgItems = [
    ['#34d399', 'Main bars D10@' + (st.stsp || 150) + 'mm c/c (along slope) — Ast=' + r0(Ast) + ' mm²/m'],
    ['#38bdf8', 'Waist slab D=' + wD + 'mm (perpendicular to flight)'],
    ['#f59e0b', 'Riser ' + riser + 'mm / Tread ' + tread + 'mm — ' + steps + ' steps per flight'],
  ];
  lgItems.forEach(function(item, i) {
    lines.push('<circle cx="' + (42 + i * 220) + '" cy="' + (lgY - 3) + '" r="4" fill="' + item[0] + '"/>');
    lines.push('<text x="' + (50 + i * 220) + '" y="' + lgY + '" fill="' + item[0] + '" font-size="8" font-family="JetBrains Mono">' + item[1] + '</text>');
  });

  lines.push('</svg>');
  return '<div class="dg">' + lines.join('') + '<div class="dg-cap">Fig: Stair waist slab section — ' + (type === 'dogleg' ? 'Dog-leg' : type === '90turn' ? '90° Quarter-turn' : 'Straight flight') + ' type recommended for ' + r2(spX) + 'm × ' + r2(spY) + 'm bay. Waist slab designed as inclined one-way slab. IS 456 Cl 33. Minimum riser 150mm, max 200mm. Minimum tread 250mm. IS NBC 2016.</div></div>';
}

// ── SEISMIC ILLUSTRATIONS ─────────────────────────────────────────
// 1. Building response illustration — shows deformation mode
// 2. Sa/g spectrum curve with building's period marked
// 3. Load path illustration — how seismic forces travel

function svgSeismicBuilding(seis, numFloors, floorHt) {
  var W = 320, H = 320;
  var padL = 60, padR = 40, padT = 30, padB = 50;
  var nF = numFloors, fh = floorHt || 3;
  var bldH = H - padT - padB;
  var fhPx = bldH / nF;
  var bldW = 80;
  var bx = padL, by = padT;
  var maxQ = Math.max.apply(null, seis.floors.map(function(f) { return f.Qi; }));
  var maxDisp = bldW * 0.35; // exaggerated lateral displacement at top

  var lines = [];
  lines.push('<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;background:#0a0f1e">');
  lines.push('<text x="' + (W/2) + '" y="14" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle" font-family="JetBrains Mono">BUILDING SEISMIC RESPONSE</text>');
  lines.push('<text x="' + (W/2) + '" y="24" fill="#475569" font-size="8" text-anchor="middle" font-family="JetBrains Mono">(Inverted triangle force pattern)</text>');

  // Ground
  lines.push('<rect x="' + (bx - 20) + '" y="' + (by + bldH) + '" width="' + (bldW + 40) + '" height="12" fill="rgba(71,85,105,0.6)" stroke="#475569" stroke-width="1"/>');
  for (var gi = 0; gi < 8; gi++) {
    lines.push('<line x1="' + (bx - 20 + gi * 20) + '" y1="' + (by + bldH + 12) + '" x2="' + (bx - 24 + gi * 20) + '" y2="' + (by + bldH + 20) + '" stroke="#475569" stroke-width="1"/>');
  }
  lines.push('<text x="' + (bx + bldW / 2) + '" y="' + (by + bldH + 28) + '" fill="#64748b" font-size="8" text-anchor="middle" font-family="JetBrains Mono">Fixed base</text>');

  // Deformed building shape (first mode — cantilever)
  var dispPath = 'M ' + bx + ' ' + (by + bldH);
  var heights = [];
  for (var fi = 0; fi <= nF; fi++) {
    var frac = fi / nF;
    var disp = maxDisp * frac * frac; // parabolic approximation of first mode
    heights.push({ x: bx + disp, y: by + bldH - fi * fhPx, disp: disp });
  }
  // Deformed centreline
  lines.push('<polyline points="' + heights.map(function(h) { return r2(h.x) + ',' + r2(h.y); }).join(' ') + '" fill="none" stroke="rgba(52,211,153,0.3)" stroke-width="2" stroke-dasharray="4,3"/>');

  // Original (undeformed) building
  lines.push('<rect x="' + bx + '" y="' + by + '" width="' + bldW + '" height="' + bldH + '" fill="rgba(56,189,248,0.06)" stroke="#38bdf8" stroke-width="1"/>');

  // Floor slabs
  seis.floors.forEach(function(f, i) {
    var fy2 = by + bldH - f.floor * fhPx;
    lines.push('<line x1="' + bx + '" y1="' + r2(fy2) + '" x2="' + (bx + bldW) + '" y2="' + r2(fy2) + '" stroke="#334155" stroke-width="2"/>');

    // Force arrow (horizontal, pointing right)
    var arrowLen = Math.max(8, (f.Qi / maxQ) * 60);
    var arrowX = bx + bldW;
    lines.push('<line x1="' + arrowX + '" y1="' + r2(fy2) + '" x2="' + (arrowX + arrowLen) + '" y2="' + r2(fy2) + '" stroke="#34d399" stroke-width="2" marker-end="url(#sArr2)"/>');
    lines.push('<text x="' + (arrowX + arrowLen + 4) + '" y="' + r2(fy2 + 4) + '" fill="#34d399" font-size="8" font-family="JetBrains Mono">F' + f.floor + '=' + r2(f.Qi) + 'kN</text>');
  });

  // Deformed shape (exaggerated) outline
  var defLeft = heights.map(function(h) { return r2(h.x) + ',' + r2(h.y); }).join(' ');
  var defRight = heights.slice().reverse().map(function(h) { return r2(h.x + bldW) + ',' + r2(h.y); }).join(' ');
  lines.push('<polygon points="' + defLeft + ' ' + defRight + '" fill="rgba(52,211,153,0.04)" stroke="rgba(52,211,153,0.4)" stroke-width="1" stroke-dasharray="4,2"/>');

  // Base shear arrow (at ground)
  lines.push('<defs><marker id="sArr2" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><polygon points="0,0 5,2.5 0,5" fill="#34d399"/></marker></defs>');
  var baseY = by + bldH;
  lines.push('<line x1="' + (bx - 15) + '" y1="' + baseY + '" x2="' + (bx + 30) + '" y2="' + baseY + '" stroke="#f87171" stroke-width="3" marker-end="url(#sArr2)" opacity="0.8"/>');
  lines.push('<text x="' + (bx - 16) + '" y="' + (baseY - 4) + '" fill="#f87171" font-size="8" text-anchor="end" font-family="JetBrains Mono">Vb=' + r2(seis.Vb) + 'kN</text>');

  // Labels
  lines.push('<text x="' + bx + '" y="' + (by + bldH / 2) + '" fill="#38bdf8" font-size="8" text-anchor="end" font-family="JetBrains Mono" transform="rotate(-90,' + (bx - 10) + ',' + (by + bldH / 2) + ')">H=' + r2(nF * fh) + 'm</text>');

  lines.push('</svg>');
  return lines.join('');
}

function svgSeismicSpectrum(seis) {
  var W = 320, H = 220;
  var padL = 45, padR = 20, padT = 30, padB = 40;
  var plotW = W - padL - padR, plotH = H - padT - padB;
  var Ta = seis.Ta || 0.3;
  var Sa = seis.Sa || 2.5;
  var soil = S.soilType || 'II';

  // IS 1893 spectrum points for different soil types
  var spectra = {
    'I':   [[0,1],[0.1,2.5],[0.4,2.5],[4.0,0.625]],
    'II':  [[0,1],[0.1,2.5],[0.55,2.5],[4.0,0.455]],
    'III': [[0,1],[0.1,2.5],[0.67,2.5],[4.0,0.373]],
  };
  var pts = spectra[soil] || spectra['II'];

  var maxT = 2.5, maxSa = 3.0;
  function px(T) { return padL + (T / maxT) * plotW; }
  function py(s) { return padT + plotH - (s / maxSa) * plotH; }

  var lines = [];
  lines.push('<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;background:#0a0f1e">');
  lines.push('<text x="' + (W/2) + '" y="14" fill="#f59e0b" font-size="9" font-weight="700" text-anchor="middle" font-family="JetBrains Mono">Sa/g RESPONSE SPECTRUM (IS 1893:2016)</text>');
  lines.push('<text x="' + (W/2) + '" y="24" fill="#475569" font-size="8" text-anchor="middle" font-family="JetBrains Mono">Soil Type ' + soil + ' | Ta=' + r2(Ta) + 's | Sa/g=' + r2(Sa) + '</text>');

  // Axes
  lines.push('<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (padT+plotH) + '" stroke="#334155" stroke-width="1.5"/>');
  lines.push('<line x1="' + padL + '" y1="' + (padT+plotH) + '" x2="' + (padL+plotW) + '" y2="' + (padT+plotH) + '" stroke="#334155" stroke-width="1.5"/>');
  lines.push('<text x="' + (W/2) + '" y="' + (H-4) + '" fill="#64748b" font-size="8" text-anchor="middle" font-family="JetBrains Mono">Time Period T (seconds)</text>');
  lines.push('<text x="10" y="' + (padT+plotH/2) + '" fill="#64748b" font-size="8" text-anchor="middle" font-family="JetBrains Mono" transform="rotate(-90,10,' + (padT+plotH/2) + ')">Sa/g</text>');

  // Grid
  [0.5,1.0,1.5,2.0,2.5].forEach(function(T) {
    var x2 = px(T);
    lines.push('<line x1="' + x2 + '" y1="' + padT + '" x2="' + x2 + '" y2="' + (padT+plotH) + '" stroke="#1e293b" stroke-width="0.8"/>');
    lines.push('<text x="' + x2 + '" y="' + (padT+plotH+12) + '" fill="#475569" font-size="7.5" text-anchor="middle" font-family="JetBrains Mono">' + T + '</text>');
  });
  [1.0,2.0,2.5].forEach(function(s) {
    var y2 = py(s);
    lines.push('<line x1="' + padL + '" y1="' + y2 + '" x2="' + (padL+plotW) + '" y2="' + y2 + '" stroke="#1e293b" stroke-width="0.8"/>');
    lines.push('<text x="' + (padL-4) + '" y="' + (y2+3) + '" fill="#475569" font-size="7.5" text-anchor="end" font-family="JetBrains Mono">' + s + '</text>');
  });

  // Spectrum curve fill
  var fillPts = pts.map(function(p) { return r2(px(Math.min(p[0],maxT))) + ',' + r2(py(Math.min(p[1],maxSa))); }).join(' ');
  fillPts += ' ' + r2(px(maxT)) + ',' + r2(padT+plotH) + ' ' + r2(padL) + ',' + r2(padT+plotH);
  lines.push('<polygon points="' + fillPts + '" fill="rgba(245,158,11,0.1)"/>');

  // Spectrum curve
  var curvePts = pts.map(function(p) { return r2(px(Math.min(p[0],maxT))) + ',' + r2(py(Math.min(p[1],maxSa))); }).join(' ');
  lines.push('<polyline points="' + curvePts + '" fill="none" stroke="#f59e0b" stroke-width="2"/>');

  // Ta marker
  var taX = px(Math.min(Ta, maxT));
  var saY = py(Math.min(Sa, maxSa));
  lines.push('<line x1="' + taX + '" y1="' + padT + '" x2="' + taX + '" y2="' + (padT+plotH) + '" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,2"/>');
  lines.push('<line x1="' + padL + '" y1="' + saY + '" x2="' + (padL+plotW) + '" y2="' + saY + '" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,2"/>');
  lines.push('<circle cx="' + taX + '" cy="' + saY + '" r="5" fill="#34d399" stroke="#0a0f1e" stroke-width="1.5"/>');
  lines.push('<text x="' + (taX+6) + '" y="' + (saY-6) + '" fill="#34d399" font-size="8.5" font-weight="700" font-family="JetBrains Mono">Ta=' + r2(Ta) + 's, Sa/g=' + r2(Sa) + '</text>');

  // Plateau label
  lines.push('<text x="' + px(0.3) + '" y="' + (py(2.5)-6) + '" fill="#f59e0b" font-size="8" text-anchor="middle" font-family="JetBrains Mono">Plateau Sa/g=2.5</text>');

  lines.push('</svg>');
  return lines.join('');
}

function svgSeismicLoadPath(seis, numFloors, floorHt) {
  var W = 320, H = 260;
  var nF = numFloors, fhPx = (H - 60) / nF;
  var bx = 60, bW = 140;
  var by = 20;

  var lines = [];
  lines.push('<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;background:#0a0f1e">');
  lines.push('<text x="' + (W/2) + '" y="13" fill="#a78bfa" font-size="9" font-weight="700" text-anchor="middle" font-family="JetBrains Mono">SEISMIC LOAD PATH</text>');

  // Columns (vertical lines)
  [bx + 10, bx + bW - 10].forEach(function(cx2) {
    lines.push('<rect x="' + (cx2 - 4) + '" y="' + by + '" width="8" height="' + (nF * fhPx) + '" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" stroke-width="1"/>');
  });

  // Floor slabs and storey shear arrows
  var Vi = seis.Vb;
  seis.floors.slice().reverse().forEach(function(f, i) {
    var fy2 = by + i * fhPx;
    // Slab
    lines.push('<rect x="' + (bx + 6) + '" y="' + (fy2 + fhPx - 4) + '" width="' + (bW - 12) + '" height="6" fill="rgba(56,189,248,0.3)" stroke="#38bdf8" stroke-width="0.8"/>');

    // Storey shear in column (accumulates downward)
    var shearW = Math.max(3, (f.Vi / seis.Vb) * 18);
    lines.push('<rect x="' + (bx + 2) + '" y="' + fy2 + '" width="' + shearW + '" height="' + fhPx + '" fill="rgba(248,113,113,0.2)" stroke="none"/>');
    lines.push('<text x="' + (bx + 2 + shearW + 2) + '" y="' + (fy2 + fhPx / 2 + 3) + '" fill="#f87171" font-size="7.5" font-family="JetBrains Mono">V' + f.floor + '=' + r2(f.Vi) + 'kN</text>');

    // Floor label
    lines.push('<text x="' + (bx - 4) + '" y="' + (fy2 + fhPx / 2 + 3) + '" fill="#64748b" font-size="7.5" text-anchor="end" font-family="JetBrains Mono">F' + f.floor + '</text>');

    // Lateral force arrow
    var flen = Math.max(6, (f.Qi / seis.Vb) * 40);
    var ay2 = fy2 + fhPx - 4;
    lines.push('<line x1="' + (bx + bW) + '" y1="' + ay2 + '" x2="' + (bx + bW + flen) + '" y2="' + ay2 + '" stroke="#34d399" stroke-width="1.5"/>');
    lines.push('<polygon points="' + (bx + bW + flen) + ',' + ay2 + ' ' + (bx + bW + flen - 4) + ',' + (ay2 - 3) + ' ' + (bx + bW + flen - 4) + ',' + (ay2 + 3) + '" fill="#34d399"/>');
  });

  // Ground (base shear)
  lines.push('<rect x="' + (bx - 20) + '" y="' + (by + nF * fhPx) + '" width="' + (bW + 40) + '" height="10" fill="rgba(71,85,105,0.7)" stroke="#475569" stroke-width="1"/>');
  lines.push('<line x1="' + (bx - 5) + '" y1="' + (by + nF * fhPx + 5) + '" x2="' + (bx + 35) + '" y2="' + (by + nF * fhPx + 5) + '" stroke="#f87171" stroke-width="2.5"/>');
  lines.push('<polygon points="' + (bx - 5) + ',' + (by + nF * fhPx + 5) + ' ' + (bx + 1) + ',' + (by + nF * fhPx + 2) + ' ' + (bx + 1) + ',' + (by + nF * fhPx + 8) + '" fill="#f87171"/>');
  lines.push('<text x="' + (bx + 36) + '" y="' + (by + nF * fhPx + 9) + '" fill="#f87171" font-size="8" font-family="JetBrains Mono">Vb=' + r2(seis.Vb) + 'kN</text>');

  // Legend
  lines.push('<text x="5" y="' + (H - 28) + '" fill="#a78bfa" font-size="7.5" font-family="JetBrains Mono">█ Column carries</text>');
  lines.push('<text x="5" y="' + (H - 16) + '" fill="#f87171" font-size="7.5" font-family="JetBrains Mono">█ Storey shear Vi</text>');
  lines.push('<text x="5" y="' + (H - 4) + '" fill="#34d399" font-size="7.5" font-family="JetBrains Mono">→ Floor force Qi</text>');
  lines.push('<text x="110" y="' + (H - 20) + '" fill="#38bdf8" font-size="7.5" font-family="JetBrains Mono">█ Floor slab</text>');
  lines.push('<text x="110" y="' + (H - 8) + '" fill="#64748b" font-size="7.5" font-family="JetBrains Mono">Shear accumulates ↓</text>');

  lines.push('</svg>');
  return lines.join('');
}

function secSeismic(){
  const{seis}=RES;
  return`
<div class="card gr">
  <div class="ct gr">🌍 Seismic Analysis  -  IS 1893:2016  -  With Diagrams</div>
  ${sb('EQ-1','Zone Factor & Parameters',`
    <div style="display:flex;gap:14px;flex-wrap:wrap">
      <div style="flex:1;min-width:200px">
        ${fm(`Z (Zone ${S.zone})`,seis.Z,'IS 1893 Table 3')}
        ${fm('I (Importance Factor)',seis.I,'IS 1893 Table 8')}
        ${fm('R (SMRF with IS 13920)',seis.R,'IS 1893 Table 9')}
        ${fm('Soil type',S.soilType+' (per-type Sa/g spectrum)','IS 1893 Cl 6.4.5')}
      </div>
      <div style="flex:1;min-width:200px">
        <div class="cp tl"><strong>Why R=5?</strong> SMRF (Special Moment Resisting Frame) with IS 13920 ductile detailing can deform plastically before collapse, absorbing 5x more seismic energy. This halves the design force  -  but REQUIRES 135 deg hooks, confinement zones, and Fe500D steel. No shortcuts.</div>
      </div>
    </div>
  `,'tl')}
  ${sb('EQ-2','Natural Time Period Ta',`
    ${fm(`Ta = 0.09H/sqrtd = 0.09x${r2(S.numFloors*S.floorHt)}/sqrt${S.buildingW}`,r2(seis.Ta)+' s','IS 1893 Cl 7.6.2(c)')}
    <div class="cp tl">H = ${r2(S.numFloors*S.floorHt)}m total height | d = ${S.buildingW}m width in direction of motion (governing direction shown)<br>
    Ta = ${r2(seis.Ta)}s — Sa/g curve chosen per IS 1893:2016 for Type ${S.soilType} soil</div>
  `,'tl')}
  ${sb('EQ-3','Spectral Acceleration & Design Ah',`
    ${fm('Sa/g per IS 1893:2016 spectrum (Type '+S.soilType+')',r2(seis.Sa),'IS 1893 Cl 6.4.5 / Fig. 2')}
    ${fmWhy(`Ah = (Z/2)x(Sa/g)/RxI = (${seis.Z}/2)x${r2(seis.Sa)}/${seis.R}x${seis.I}`,seis.Ah.toFixed(4),'IS 1893 Cl 6.4.2')}
    ${vd(true,`Ah = ${seis.Ah.toFixed(4)} -> Every kN of building weight produces ${r2(seis.Ah*1000)} N of horizontal seismic force`)}
    ${svgSeismicSpectrum(seis)}
  `,'tl')}
  ${sb('EQ-4','Seismic Weight & Base Shear',`
    ${fm('Floor area = '+S.buildingL+'x'+S.buildingW,r2(S.buildingL*S.buildingW)+' m^2','')}
    ${fm('W_total = (DL+0.25LL)xarea x floors + walls',r0(seis.Wt)+' kN','IS 1893 Cl 7.3.1')}
    ${fmWhy('Vb = Ah x W = '+seis.Ah.toFixed(4)+'x'+r0(seis.Wt),r2(seis.Vb)+' kN','IS 1893 Cl 7.5.3')}
    ${vd(true,'Base Shear Vb = '+r2(seis.Vb)+' kN  -  this horizontal force acts at the building base during design earthquake')}
  `,'tl')}
  ${sb('EQ-5','Distribution Over Building Height',`
    <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
      <div style="flex:2;min-width:220px">
        ${fm('Qi = Vb x WiHi^2 / SumWjHj^2','(inverted triangle pattern)','IS 1893 Cl 7.6')}
        <table>
          <tr><th>Floor</th><th>Hi (m)</th><th>WiHi^2 (kN.m^2)</th><th>Qi (kN)</th><th>Vi (kN)</th></tr>
          ${seis.floors.map(f=>`<tr><td>${f.floor}</td><td>${f.h}</td><td>${r0(f.Wh2)}</td><td class="val">${r2(f.Qi)}</td><td class="val">${r2(f.Vi)}</td></tr>`).join('')}
        </table>
      </div>
      <div style="flex:1;min-width:180px">${svgSeismicDist(seis.floors)}</div>
    </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
        <div>${svgSeismicBuilding(seis,S.numFloors,S.floorHt)}</div>
        <div>${svgSeismicLoadPath(seis,S.numFloors,S.floorHt)}</div>
      </div>
  `,'tl')}
</div>`;}

function secWind(){
  const{wind,seis}=RES;
  const H=S.numFloors*S.floorHt;
  const B=S.buildingW, L=S.buildingL;
  const hb=H/B;

  // Storey-wise wind force calculation
  const k2Table={'1':[[10,1.05],[15,1.09],[20,1.12],[30,1.15],[50,1.20]],
    '2':[[10,1.00],[15,1.05],[20,1.07],[30,1.12],[50,1.17]],
    '3':[[10,0.91],[15,0.97],[20,1.01],[30,1.06],[50,1.12]]};
  const k2vals=k2Table[S.terrain]||k2Table['2'];

  function getK2(z){
    for(let i=0;i<k2vals.length;i++){
      if(z<=k2vals[i][0]) return k2vals[i][1];
      if(i<k2vals.length-1&&z<=k2vals[i+1][0]){
        const [z0,v0]=k2vals[i],[z1,v1]=k2vals[i+1];
        return v0+(z-z0)*(v1-v0)/(z1-z0);
      }
    }
    return k2vals[k2vals.length-1][1];
  }

  const windFloors=[];
  let totalWindForce=0;
  for(let i=1;i<=S.numFloors;i++){
    const zi=i*S.floorHt;
    const k2i=getK2(zi);
    const Vzi=wind.VbW*1.0*k2i*1.0;
    const pzi=0.6*Vzi*Vzi/1000;
    const Fwi=1.3*pzi;
    const tributH=(i===1)?S.floorHt/2+0.5:(i===S.numFloors)?S.floorHt/2:S.floorHt;
    const Fi=Fwi*tributH*B;
    totalWindForce+=Fi;
    windFloors.push({floor:i,h:zi,k2:k2i,Vz:Vzi,pz:pzi,Fw:Fwi,tributH,Fi});
  }

  const seismicGoverns=seis.Vb>totalWindForce;
  const cpe_w=0.8, cpe_l=-0.5;
  const cpe_side = hb<=0.5?-0.7:(hb<=1?-0.7:(hb<=2?-0.8:-0.9));

  return`
<div class="card or">
  <div class="ct or">\ud83d\udca8 Wind Analysis \u2014 IS 875 Part 3:2015</div>
  <div class="cd">Wind analysis determines horizontal force on the building from wind. For low-rise residential in seismic zones III-V, seismic usually governs \u2014 but wind MUST be checked independently.</div>

  ${sb('W-1','Basic Wind Speed (Vb)',`
    ${fm('Vb (Zone '+S.windZone+')',wind.VbW+' m/s','IS 875 P3 Cl 5.2 / Fig. 1')}
    <div class="cp or">
      <strong>Wind zone map (IS 875 P3 Fig. 1):</strong><br>
      Zone I: 33 m/s (Himalayan foothills) | Zone II: 39 m/s (Central India) |
      Zone III: 44 m/s (Mumbai, Pune, Bangalore) | Zone IV: 47 m/s (Delhi, Agra, Lucknow) |
      Zone V: 50 m/s (Chennai, Kolkata, coastal Odisha) | Zone VI: 55 m/s (Coastal cyclone belt)
    </div>
    <div class="cp" style="border-left-color:var(--blue)">
      <strong>What is Vb?</strong> The basic wind speed is the peak 3-second gust speed at 10m height in open terrain (Category 2) with a 50-year return period. It is NOT the average wind speed \u2014 it is the short-duration maximum that structures must withstand.
    </div>
  `,'or')}

  ${sb('W-2','Wind Speed Modification Factors (k1, k2, k3, k4)',`
    <div style="display:grid;gap:10px;margin-bottom:10px">
      <div class="cp or">
        <strong>k1 = Risk Coefficient</strong> (IS 875 P3 Table 1)<br>
        For residential buildings with 50-year design life: <strong>k1 = 1.0</strong><br>
        <span style="font-size:10px;color:var(--txt3)">k1 increases to 1.08 for 100-year return (hospitals), decreases to 0.90 for temporary structures (5-year return).</span>
      </div>
      <div class="cp or">
        <strong>k2 = Terrain, Height & Structure Size Factor</strong> (IS 875 P3 Table 2)<br>
        Terrain Category ${S.terrain}: k2 = <strong>${wind.k2}</strong> at height ${r2(H)}m<br>
        <span style="font-size:10px;color:var(--txt3)">
          Category 1: Open sea coast, flat plains (k2 = 1.05 at 10m).
          Category 2: Open terrain with scattered obstructions (k2 = 1.00 at 10m).
          Category 3: Closely built-up areas, city centres (k2 = 0.91 at 10m).
          k2 INCREASES with height \u2014 taller buildings catch faster wind above the boundary layer.
        </span>
      </div>
      <div class="cp or">
        <strong>k3 = Topography Factor</strong> (IS 875 P3 Cl 5.3.3)<br>
        For flat ground or gentle slopes (<3\u00b0): <strong>k3 = 1.0</strong><br>
        <span style="font-size:10px;color:var(--txt3)">k3 > 1.0 for buildings on hilltops, ridges, or escarpments where wind accelerates. Can reach 1.36 for steep cliffs.</span>
      </div>
      <div class="cp or">
        <strong>k4 = Importance Factor for Cyclonic Region</strong> (IS 875 P3 Cl 5.3.4)<br>
        For non-cyclonic regions: <strong>k4 = 1.0</strong><br>
        <span style="font-size:10px;color:var(--txt3)">k4 = 1.15 for buildings within 60km of coast in cyclone-prone areas (Gujarat, Odisha, AP, TN coast).</span>
      </div>
    </div>
    ${fm('Design wind speed: Vz = Vb \u00d7 k1 \u00d7 k2 \u00d7 k3 \u00d7 k4','','IS 875 P3 Cl 5.3')}
    ${fm('Vz = '+wind.VbW+' \u00d7 1.0 \u00d7 '+wind.k2+' \u00d7 1.0 \u00d7 1.0',r2(wind.Vz)+' m/s','')}
    ${fmWhy('Design wind pressure: pz = 0.6 \u00d7 Vz\u00b2 / 1000',r2(wind.pz)+' kN/m\u00b2','IS 875 P3 Cl 5.4',
      'The 0.6 factor comes from \u00bd\u03c1 where \u03c1 = air density = 1.2 kg/m\u00b3. So \u00bd\u00d71.2 = 0.6. The formula gives pressure in N/m\u00b2 when Vz is in m/s; divide by 1000 for kN/m\u00b2.')}
  `,'or')}

  ${sb('W-3','Pressure Coefficients (Cpe & Cpi)',`
    <div class="cp or">
      <strong>Building geometry:</strong> L = ${L}m \u00d7 B = ${B}m \u00d7 H = ${r2(H)}m | h/b = ${r2(hb)}<br>
      External pressure coefficients depend on h/b ratio and face orientation.
    </div>
    <table>
      <tr><th>Surface</th><th>Cpe</th><th>Explanation</th></tr>
      <tr><td>Windward wall</td><td class="val" style="color:var(--green)">+${cpe_w}</td><td>Positive = pushes INTO building</td></tr>
      <tr><td>Leeward wall</td><td class="val" style="color:var(--blue)">${cpe_l}</td><td>Negative = suction OUTWARD</td></tr>
      <tr><td>Side walls</td><td class="val" style="color:var(--blue)">${cpe_side}</td><td>Suction \u2014 increases with h/b ratio</td></tr>
      <tr><td>Roof (h/b=${r2(hb)})</td><td class="val" style="color:var(--blue)">-0.5 to -0.9</td><td>Uplift \u2014 roof sheeting must be anchored</td></tr>
    </table>
    <div class="cp" style="border-left-color:var(--blue);margin-top:10px">
      <strong>Internal pressure (Cpi):</strong><br>
      Enclosed buildings with small openings (<5%): <strong>Cpi = \u00b10.2</strong>. Medium openings (5-20%): Cpi = \u00b10.5.<br>
      <span style="font-size:10px;color:var(--txt3)">The \u00b1 means we check BOTH cases: internal pressure helping AND opposing external pressure. Take the worst combination.</span>
    </div>
    ${fm('Net pressure on windward = (Cpe_w + |Cpi|) \u00d7 pz = (0.8+0.5) \u00d7 '+r2(wind.pz),r2(1.3*wind.pz)+' kN/m\u00b2','worst case')}
    ${fm('Net pressure on leeward = (|Cpe_l| + Cpi) \u00d7 pz = (0.5+0.5) \u00d7 '+r2(wind.pz),r2(1.0*wind.pz)+' kN/m\u00b2 (suction)','')}
    ${fm('Combined net lateral pressure on building = 1.3 \u00d7 pz',r2(wind.Fw)+' kN/m\u00b2','IS 875 P3 Cl 6.3')}
  `,'or')}

  ${sb('W-4','Floor-by-Floor Wind Force Distribution',`
    <div class="cp or">
      Unlike seismic (which distributes force based on mass \u00d7 height\u00b2), wind force depends on the actual wind pressure at each floor level. Higher floors get more force because k2 increases with height.
    </div>
    <table>
      <tr><th>Floor</th><th>Height (m)</th><th>k2</th><th>Vz (m/s)</th><th>pz (kN/m\u00b2)</th><th>Trib H (m)</th><th>Force Fi (kN)</th></tr>
      ${windFloors.map(f=>'<tr><td>'+(f.floor===S.numFloors?'Roof':'F'+f.floor)+'</td><td class="val">'+r2(f.h)+'</td><td class="val">'+r2(f.k2)+'</td><td class="val">'+r2(f.Vz)+'</td><td class="val">'+r2(f.pz)+'</td><td class="val">'+r2(f.tributH)+'</td><td class="val" style="font-weight:700">'+r2(f.Fi)+'</td></tr>').join('')}
      <tr style="border-top:2px solid var(--b1);font-weight:700">
        <td colspan="6">Total Wind Base Shear</td>
        <td class="val" style="color:var(--orange)">${r2(totalWindForce)} kN</td>
      </tr>
    </table>
  `,'or')}

  ${sb('W-5','Seismic vs Wind Comparison \u2014 Which Governs?',`
    <table>
      <tr><th>Parameter</th><th>Seismic (IS 1893)</th><th>Wind (IS 875 P3)</th><th>Governs</th></tr>
      <tr>
        <td>Base shear</td>
        <td class="val">${r2(seis.Vb)} kN</td>
        <td class="val">${r2(totalWindForce)} kN</td>
        <td class="val" style="font-weight:700;color:${seismicGoverns?'var(--green)':'var(--orange)'}">${seismicGoverns?'SEISMIC':'WIND'}</td>
      </tr>
      <tr><td>Load factor</td><td>1.5 (IS 1893)</td><td>1.5 (IS 875)</td><td>Same</td></tr>
      <tr><td>Direction</td><td>Both X and Y</td><td>Critical direction</td><td>\u2014</td></tr>
    </table>
    ${vd(true, seismicGoverns
      ? 'Seismic base shear ('+r2(seis.Vb)+' kN) exceeds wind ('+r2(totalWindForce)+' kN) \u2014 SEISMIC GOVERNS for lateral design. This is typical for low-rise residential in Indian seismic zones III-V. However, local wind effects (roof uplift, cladding design) still use IS 875 Part 3 values.'
      : 'Wind base shear ('+r2(totalWindForce)+' kN) exceeds seismic ('+r2(seis.Vb)+' kN) \u2014 WIND GOVERNS for lateral design. This can happen in low-seismic zones (Zone II) with high wind speeds. Design columns and beams for wind + gravity combination.'
    )}
    <div class="cp" style="border-left-color:var(--txt3);margin-top:10px">
      <strong>Why seismic usually governs for Indian residential buildings:</strong><br>
      A typical G+3 residential building in Zone IV (Z=0.24) has Ah \u2248 0.06. With building weight ~4000 kN, Vb \u2248 240 kN.
      Wind pressure pz \u2248 1.3 kN/m\u00b2 gives total wind force \u2248 80-100 kN \u2014 about half the seismic force.
      Wind can govern for: (1) tall industrial buildings with large exposed area, (2) coastal zones with high wind + low seismic zone, (3) lightweight structures like steel sheds.
    </div>
  `,'or')}
</div>`;
}

// ================================================================
// SLAB — floor selector + typical vs roof
// ================================================================
function secSlab(){
  // Use allSlabPanels if available, fallback to old structure
  const panels = RES.allSlabPanels;
  const slabs = RES.slabs||[RES.slab,RES.slabRoof].filter(Boolean);
  const activeFloor = window._slabFloor||'Typical';
  const activePanel = window._slabPanelIdx||0;

  // Get unique floors
  const floors = panels ? [...new Set(panels.map(p=>p.floor))] : ['Typical','Roof'];

  // Get panels for active floor
  const floorPanels = panels
    ? panels.filter(p=>p.floor===activeFloor)
    : [];
  const selPanel = floorPanels[activePanel] || floorPanels[0];

  // Header
  const warns = RES.warnings&&RES.warnings.length
    ? `<div class="cp" style="border-left-color:#f59e0b;margin-bottom:10px"><strong style="color:#f59e0b">⚠ Notes:</strong> ${RES.warnings.join(' | ')}</div>` : '';

  // Count passes/fails
  const passCount = floorPanels.filter(p=>p.ok).length;
  const failCount = floorPanels.length - passCount;

  return`
<div class="card">
  <div class="ct">🔲 Slab Design — Every Bay Individually — IS 456 Cl 24, 26.5.2, Table 26</div>
  ${warns}

  <!-- Floor selector -->
  <div style="margin-bottom:10px">
    <div style="font-size:10px;font-weight:700;color:var(--txt3);margin-bottom:5px">FLOOR TYPE</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${floors.map(fl=>`
        <button onclick="window._slabFloor='${fl}';window._slabPanelIdx=0;showSec('slab')"
          style="padding:5px 14px;border-radius:6px;border:1px solid ${activeFloor===fl?'var(--blue)':'var(--b1)'};
          background:${activeFloor===fl?'rgba(56,189,248,0.12)':'transparent'};
          color:${activeFloor===fl?'var(--blue)':'var(--txt3)'};cursor:pointer;font-size:10px;font-weight:700">
          ${fl==='Typical'?`Typical Floor (LL=${S.udlLL} kN/m²)`:`Roof (LL=${S.udlRoof||1.5} kN/m²)`}
        </button>`).join('')}
    </div>
  </div>

  <!-- Summary bar -->
  ${floorPanels.length>0?`
  <div style="padding:8px 12px;background:var(--bg1);border:1px solid var(--b1);border-radius:8px;margin-bottom:10px;font-size:10px">
    <strong>${floorPanels.length}</strong> slab panels —
    <span style="color:#34d399">${passCount} pass</span>
    ${failCount?`<span style="color:#f87171"> | ${failCount} FAIL</span>`:''}
    &nbsp;|&nbsp; Uniform construction thickness: <strong style="color:var(--blue)">${Math.max(...floorPanels.map(p=>p.D))}mm</strong>
    (max across all panels)
  </div>`:''}

  ${panels&&panels.length>0?`
  <!-- Panel selector grid -->
  <div style="margin-bottom:12px">
    <div style="font-size:10px;font-weight:700;color:var(--txt3);margin-bottom:5px">SELECT PANEL (plan view)</div>
    <div style="display:inline-grid;gap:3px;grid-template-columns:repeat(${(GRID&&GRID.nx)||3},auto)">
      ${(()=>{
        if(!GRID||!floorPanels.length) return '';
        let html='';
        for(let r=0;r<GRID.ny;r++){
          for(let c=0;c<GRID.nx;c++){
            const idx2=floorPanels.findIndex(p=>p.row===r&&p.col===c);
            const p2=floorPanels[idx2];
            const isAct=idx2===activePanel&&p2;
            const stair=RES.stairPanels&&RES.stairPanels.find(sp=>sp.row===r&&sp.col===c);
            if(stair){
              html+=`<div style="width:52px;height:44px;border-radius:5px;background:rgba(245,158,11,0.1);border:1px solid #f59e0b;display:flex;align-items:center;justify-content:center;font-size:8px;color:#f59e0b;font-weight:700">STAIR<br>${String.fromCharCode(65+r)}${c+1}</div>`;
            } else if(p2){
              const ok=p2.ok;
              html+=`<button onclick="window._slabPanelIdx=${idx2};showSec('slab')"
                style="width:52px;height:44px;border-radius:5px;cursor:pointer;font-size:8px;font-weight:700;
                border:1.5px solid ${isAct?'#0a0f1e':(ok?'var(--blue)':'#f87171')};
                background:${isAct?'rgba(56,189,248,0.2)':(ok?'rgba(56,189,248,0.06)':'rgba(248,113,113,0.08)')};
                color:${isAct?'#0a0f1e':(ok?'var(--blue)':'#f87171')}">
                ${String.fromCharCode(65+r)}${c+1}<br><span style="font-size:7px;font-weight:400">${p2.lx.toFixed(1)}×${p2.ly.toFixed(1)}</span>
              </button>`;
            } else {
              // void/opening
              const bay=GRID.bays.find(b=>b.row===r&&b.col===c);
              html+=`<div style="width:52px;height:44px;border-radius:5px;background:rgba(100,116,139,0.1);border:1px dashed #1e3a8a;display:flex;align-items:center;justify-content:center;font-size:8px;color:#64748b">${bay?bay.type.toUpperCase():'VOID'}</div>`;
            }
          }
        }
        return html;
      })()}
    </div>
    <div style="font-size:9px;color:var(--txt3);margin-top:4px">Blue = pass | Red = fail | White border = selected | Orange = staircase bay</div>
  </div>

  <!-- Selected panel detail -->
  ${selPanel ? slabPanelDetail(selPanel) : '<div style="padding:12px;color:var(--txt3)">Select a slab panel above</div>'}

  <!-- All panels summary table -->
  ${floorPanels.length>1?`
  <div style="margin-top:16px">
    <div style="font-size:11px;font-weight:700;color:var(--cyan);margin-bottom:8px">All Panels Summary — ${activeFloor} Floor</div>
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:10px">
        <tr style="background:var(--bg1)">
          ${['Panel','lx m','ly m','ratio','IS Case','D mm','d mm','Mx kN.m','My kN.m','Mulim','Ast_x mm²','Ast_y mm²','Spx mm','Spy mm','l/d','Status'].map(h=>`<th style="padding:4px 6px;border:1px solid var(--b1);color:var(--txt3);white-space:nowrap">${h}</th>`).join('')}
        </tr>
        ${floorPanels.map((p,i)=>{
          const isAct=i===activePanel;
          const ok=p.ok;
          return`<tr style="background:${isAct?'rgba(56,189,248,0.06)':'transparent'};cursor:pointer"
            onclick="window._slabPanelIdx=${i};showSec('slab')">
            <td style="padding:4px 6px;border:1px solid var(--b1);font-weight:${isAct?'700':'400'};color:var(--blue)">${p.bayLabel}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:right">${r2(p.lx)}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:right">${r2(p.ly)}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:right">${r2(p.ratio)}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:center">Case ${p.caseN}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:right;font-weight:700">${p.D}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:right">${p.d}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:right">${r2(p.Mx)}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:right">${r2(p.My)}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:right">${r2(p.Mulim)}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:right">${r0(p.Ax)}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:right">${r0(p.Ay)}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:right">${p.spx}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:right">${p.spy}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);text-align:right;color:${p.ld_ok?'inherit':'#f87171'}">${r2(p.ld)}</td>
            <td style="padding:4px 6px;border:1px solid var(--b1);color:${ok?'#34d399':'#f87171'};font-weight:700">${ok?'OK':'FAIL'}</td>
          </tr>`;
        }).join('')}
      </table>
    </div>
  </div>`:''}
  `:''}

  ${(!panels||panels.length===0)?`
  <!-- Fallback to old single-slab design -->
  ${(()=>{const sl=slabs.find(s=>s.floor===activeFloor)||slabs[0];return sl?slabPanelDetail(sl):''})()}
  `:''}

  ${RES.stairPanels&&RES.stairPanels.length>0?`
  <div style="margin-top:16px;padding:12px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.3);border-radius:8px">
    <div style="font-size:11px;font-weight:700;color:#f59e0b;margin-bottom:8px">🪜 Staircase Bay(s) — ${RES.stairPanels.length} found</div>
    <div style="font-size:10px;color:var(--txt2)">Bays: <strong>${RES.stairPanels.map(sp=>sp.bayLabel).join(', ')}</strong><br>
      No flat slab designed here — stair waist slab replaces floor slab in this bay.<br>
      Stair slab reactions <strong style="color:#f59e0b">added to adjacent beam loads</strong> automatically.
      <div style="margin-top:6px">
        <button onclick="showSec('staircase')" style="padding:5px 14px;background:rgba(245,158,11,0.15);border:1px solid #f59e0b;border-radius:5px;color:#f59e0b;cursor:pointer;font-size:10px;font-weight:700">→ View Staircase Design Detail</button>
      </div></div>
  </div>`:''}
</div>`;
}

function slabPanelDetail(p){
  if(!p) return '';
  const ok=p.ok;
  const isStairFallback=!p.caseN&&p.floor;
  return`
<div style="border:1px solid ${ok?'rgba(56,189,248,0.3)':'rgba(248,113,113,0.4)'};border-radius:8px;padding:12px;margin-top:4px">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">
    <div style="font-size:13px;font-weight:800;color:var(--blue)">${p.bayLabel||'Slab Panel'}</div>
    <div style="font-size:10px;color:var(--txt3)">${p.floor||''} | ${p.twoWay?'Two-way':'One-way'} | ${r2(p.lx||0)}m × ${r2(p.ly||0)}m | Case ${p.caseN||'?'} (IS 456 T26)</div>
  </div>
  ${vd(ok,ok?'All checks pass — panel safe':'One or more checks FAIL')}

  ${sb('S-1','Geometry & Span/Depth Check',`
    ${fm('lx (short span)',r2(p.lx||0)+' m','')}
    ${fm('ly (long span)',r2(p.ly||0)+' m','')}
    ${fm('ly/lx = '+r2(p.ly||0)+'/'+r2(p.lx||1),r2(p.ratio||1)+' → '+(p.twoWay?'TWO-WAY (< 2)':'ONE-WAY (≥ 2)'),'IS 456 Cl 24.4')}
    ${fm('Min D from l/d ≤ '+(p.ldRatio||26)+': D = lx×1000/'+(p.ldRatio||26),r0(p.D||0)+' mm (provided: '+Math.max(p.D||0,S.slabThk)+'mm)','IS 456 Cl 23.2')}
    ${fm('d = D - cover - half bar = '+Math.max(p.D||0,S.slabThk)+' - '+S.coverSlab+' - 5',r0(p.d||0)+' mm','')}
    ${vd(p.ld_ok,'l/d = '+r2(p.ld||0)+' '+(p.ld_ok?'≤ ':'> ')+(p.ldRatio||26)+' → '+(p.ld_ok?'OK':'FAIL — increase D'),p.ld_ok?p.ld/p.ldRatio:1.1)}
  `)}

  ${sb('S-2','Factored Load',`
    ${fm('DL_slab = '+Math.max(p.D||150,S.slabThk)+'/1000 × 25',r2(Math.max(p.D||150,S.slabThk)/1000*25)+' kN/m²','')}
    ${fm('Floor finish + Partitions',r2(S.floorFinish+S.partitions)+' kN/m²','')}
    ${fm('Live Load ('+(p.isRoof?'Roof':'Floor')+')',p.isRoof?(S.udlRoof||1.5):S.udlLL+' kN/m²','')}
    ${fm('wu = 1.5 × (DL + FF + Parts + LL)',r2(p.wu||0)+' kN/m²','IS 456 Table 18')}
    ${fm('IS 456 Table 26 Case '+p.caseN+' — '+(p.caseName||''),p.twoWay?('αx='+r2(p.ax||0)+' αy='+r2(p.ay||0)):'1/8','')}
  `)}

  ${sb('S-3','Moments (IS 456 Table 26)',`
    <div class="cp" style="font-size:10px;line-height:2.0;margin-bottom:8px">
      <strong>Formula:</strong> Mx = αx × wu × lx² &nbsp;|&nbsp; My = αy × wu × lx²<br>
      <strong>Where:</strong><br>
      &nbsp;&nbsp;αx = ${r2(p.ax||0)} (short span moment coefficient from IS 456 Table 26, Case ${p.slabCase||4})<br>
      &nbsp;&nbsp;αy = ${r2(p.ay||0)} (long span moment coefficient from IS 456 Table 26)<br>
      &nbsp;&nbsp;wu = ${r2(p.wu||0)} kN/m² (factored load per unit area of slab)<br>
      &nbsp;&nbsp;lx = ${r2(p.lx||0)} m (shorter span — always used in both Mx and My formulas)<br>
      <strong>Results:</strong><br>
      &nbsp;&nbsp;Mx = ${r2(p.ax||0)} × ${r2(p.wu||0)} × ${r2(p.lx||0)}² = <strong style="color:var(--cyan)">${r2(p.Mx||0)} kN.m/m</strong> (short span, +ve midspan)<br>
      &nbsp;&nbsp;My = ${r2(p.ay||0)} × ${r2(p.wu||0)} × ${r2(p.lx||0)}² = <strong style="color:var(--cyan)">${r2(p.My||0)} kN.m/m</strong> (long span, +ve midspan)<br>
      &nbsp;&nbsp;Mx_neg = ${r2(p.Mx_neg||0)} kN.m/m (hogging at short-span supports)<br>
      &nbsp;&nbsp;My_neg = ${r2(p.My_neg||0)} kN.m/m (hogging at long-span supports)<br><br>
      <strong>Mulim check:</strong> Mulim = 0.138 × fck × b × d² / 10⁶<br>
      &nbsp;&nbsp;= 0.138 × ${S.fck} × 1000 × ${r0(p.d||0)}² / 10⁶ = <strong style="color:var(--cyan)">${r2(p.Mulim||0)} kN.m/m</strong><br>
      &nbsp;&nbsp;(0.138 = limiting factor for Fe${S.fy} steel; b = 1000mm for per-metre strip)
    </div>
    ${(()=>{const Mmax=Math.max(p.Mx||0,p.My||0);const momOK=Mmax<=(p.Mulim||0);return vd(momOK,'Max moment '+r2(Mmax)+' kN.m/m '+(momOK?'≤':'>')+' Mulim '+r2(p.Mulim||0)+' → '+(momOK?'Singly reinforced OK':'Increase slab depth D'));})()}
  `)}

  ${sb('S-4','Reinforcement',`
    <div class="cp" style="font-size:10px;line-height:2.0;margin-bottom:8px">
      <strong>Formula:</strong> Ast = Mu / (0.87 × fy × d × [1 − Mu/(fck × b × d²)])<br>
      <strong>Where:</strong> fy=${S.fy} N/mm², d=${r0(p.d||0)} mm, fck=${S.fck} N/mm², b=1000mm (per metre strip)<br>
      <strong>Results:</strong><br>
      &nbsp;&nbsp;Ast_x (short span, bottom) = <strong>${r0(p.Ax||0)} mm²/m</strong> → Provide D10@${p.spx}mm c/c<br>
      &nbsp;&nbsp;Ast_y (long span, bottom) = <strong>${r0(p.Ay||0)} mm²/m</strong> → Provide D8@${p.spy}mm c/c<br>
      &nbsp;&nbsp;Ast_x_neg (short span top at supports) = ${r0(p.Ax_neg||0)} mm²/m → D8@${p.spx_n}mm c/c<br>
      &nbsp;&nbsp;Ast_y_neg (long span top at supports) = ${r0(p.Ay_neg||0)} mm²/m → D8@${p.spy_n}mm c/c<br>
      &nbsp;&nbsp;Top bars extend 0.3×lx = ${r2((p.lx||3)*0.3)}m from each support face
    </div>
    <div class="cp" style="margin-top:8px">
      <strong>Summary — Provide (${p.bayLabel}):</strong><br>
      Bottom short-span: D10@${p.spx}mm c/c &nbsp;|&nbsp; Bottom long-span: D8@${p.spy}mm c/c<br>
      Top (negative): D8@${p.spx_n}mm short-span &nbsp;|&nbsp; D8@${p.spy_n}mm long-span
    </div>
  `)}
  ${sb('S-5','Cross-Section Diagram',svgSlabSection(p),'or')}
</div>`;
}


function svgSlabSection(p){
  const D = Math.max(p.D||125, S.slabThk);
  const d = p.d || D - S.coverSlab - 5;
  const cover = S.coverSlab || 15;
  const lx = p.lx || 3;
  const ly = p.ly || 4;
  const twoWay = p.twoWay;
  const diaBot = 10, diaTop = 8, diaLong = 8;
  const spx = p.spx || 200, spy = p.spy || 250;
  const spx_n = p.spx_n || 300;

  const W = 660, padL = 80, padR = 90, padT = 70;
  const slabW = W - padL - padR;
  const slabH = Math.max(70, Math.min(120, D * 1.8));
  const scaleH = slabH / D;
  const sx = padL, sy = padT;
  const ex = W - padR;
  const suppH = 24, suppW = 40;
  const bmdGap = 18;
  const bmdH = 25;
  const lgLines = twoWay ? 3 : 2;
  const totalH = padT + slabH + suppH + bmdGap + bmdH + 50 + lgLines * 15 + 20;

  const botCoverY = sy + slabH - cover * scaleH;
  const topCoverY = sy + cover * scaleH;
  const botBarY = botCoverY - diaBot * scaleH / 2;
  const topBarY = topCoverY + diaTop * scaleH / 2;
  const longBarY = botBarY - (diaBot + diaLong) * scaleH / 2 - 1;
  const extPx = Math.round(0.3 * slabW);
  const nBotBars = Math.max(4, Math.min(9, Math.round(slabW / 45)));
  const nTopBars = Math.max(2, Math.round(extPx / 30));
  const nLongBars = Math.max(3, Math.min(7, Math.round(slabW / 55)));

  const bmdY = sy + slabH + suppH + bmdGap;

  // Build SVG as array of strings for clarity
  const lines = [];

  lines.push('<svg viewBox="0 0 ' + W + ' ' + totalH + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;background:#0a0f1e;border-radius:8px">');
  lines.push('<defs><marker id="sArr" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto"><polygon points="0,0 4,2 0,4" fill="#64748b"/></marker></defs>');

  // Title
  lines.push('<text x="' + (W/2) + '" y="18" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">SLAB CROSS-SECTION — ' + p.bayLabel + ' (D=' + D + 'mm, ' + (twoWay ? 'Two-way' : 'One-way') + ')</text>');
  lines.push('<text x="' + (W/2) + '" y="34" fill="#64748b" font-size="9" text-anchor="middle" font-family="JetBrains Mono">Section through short span (lx=' + r2(lx) + 'm) — IS 456 Cl 26.5.2 | Cover=' + cover + 'mm | d=' + d + 'mm</text>');
  lines.push('<text x="' + (W/2) + '" y="50" fill="#475569" font-size="8.5" text-anchor="middle" font-family="JetBrains Mono">M20 concrete — Fe' + S.fy + ' steel — wu=' + r2(p.wu) + ' kN/m² — Case ' + p.caseN + ' (IS 456 Table 26)</text>');

  // Slab concrete body
  lines.push('<rect x="' + sx + '" y="' + sy + '" width="' + slabW + '" height="' + slabH + '" fill="rgba(100,116,139,0.12)" stroke="#475569" stroke-width="1.5"/>');

  // Concrete hatch
  lines.push('<clipPath id="slabHatch"><rect x="' + sx + '" y="' + sy + '" width="' + slabW + '" height="' + slabH + '"/></clipPath>');
  lines.push('<g clip-path="url(#slabHatch)" stroke="rgba(100,116,139,0.18)" stroke-width="0.7">');
  for (let i = -slabH; i < slabW + slabH; i += 16) {
    lines.push('<line x1="' + (sx+i) + '" y1="' + sy + '" x2="' + (sx+i+slabH) + '" y2="' + (sy+slabH) + '"/>');
  }
  lines.push('</g>');

  // Cover dashed lines
  lines.push('<line x1="' + (sx+6) + '" y1="' + botCoverY + '" x2="' + (ex-6) + '" y2="' + botCoverY + '" stroke="rgba(99,102,241,0.35)" stroke-width="0.8" stroke-dasharray="4,3"/>');
  lines.push('<line x1="' + (sx+6) + '" y1="' + topCoverY + '" x2="' + (ex-6) + '" y2="' + topCoverY + '" stroke="rgba(99,102,241,0.35)" stroke-width="0.8" stroke-dasharray="4,3"/>');
  lines.push('<text x="' + (sx+4) + '" y="' + (topCoverY - 2) + '" fill="rgba(99,102,241,0.6)" font-size="7.5" font-family="JetBrains Mono">cover=' + cover + 'mm</text>');

  // Bottom short-span bars
  for (let i = 1; i <= nBotBars; i++) {
    const bx = sx + i * (slabW / (nBotBars + 1));
    const r = Math.max(3, diaBot * scaleH / 2);
    lines.push('<circle cx="' + r2(bx) + '" cy="' + r2(botBarY) + '" r="' + r2(r) + '" fill="#34d399" stroke="#166534" stroke-width="0.8"/>');
  }

  // Long-span bottom bars (above short-span)
  if (twoWay) {
    for (let i = 1; i <= nLongBars; i++) {
      const bx = sx + i * (slabW / (nLongBars + 1));
      const r = Math.max(3, diaLong * scaleH / 2);
      lines.push('<circle cx="' + r2(bx) + '" cy="' + r2(longBarY) + '" r="' + r2(r) + '" fill="#38bdf8" stroke="#1e3a5f" stroke-width="0.8"/>');
    }
  }

  // Top bars — left zone
  for (let i = 1; i <= nTopBars; i++) {
    const bx = sx + i * (extPx / (nTopBars + 1));
    const r = Math.max(3, diaTop * scaleH / 2);
    lines.push('<circle cx="' + r2(bx) + '" cy="' + r2(topBarY) + '" r="' + r2(r) + '" fill="#f87171" stroke="#7f1d1d" stroke-width="0.8"/>');
  }
  // Top bars — right zone
  for (let i = 1; i <= nTopBars; i++) {
    const bx = ex - i * (extPx / (nTopBars + 1));
    const r = Math.max(3, diaTop * scaleH / 2);
    lines.push('<circle cx="' + r2(bx) + '" cy="' + r2(topBarY) + '" r="' + r2(r) + '" fill="#f87171" stroke="#7f1d1d" stroke-width="0.8"/>');
  }

  // Top bar zone extent lines (above slab)
  const zbY = sy - 7;
  lines.push('<line x1="' + sx + '" y1="' + zbY + '" x2="' + (sx+extPx) + '" y2="' + zbY + '" stroke="#f87171" stroke-width="1.2"/>');
  lines.push('<line x1="' + sx + '" y1="' + (zbY-4) + '" x2="' + sx + '" y2="' + (zbY+4) + '" stroke="#f87171" stroke-width="1"/>');
  lines.push('<line x1="' + (sx+extPx) + '" y1="' + (zbY-4) + '" x2="' + (sx+extPx) + '" y2="' + (zbY+4) + '" stroke="#f87171" stroke-width="1"/>');
  lines.push('<text x="' + (sx+extPx/2) + '" y="' + (zbY-9) + '" fill="#f87171" font-size="8" text-anchor="middle" font-family="JetBrains Mono">0.3lx=' + r2(0.3*lx) + 'm</text>');
  lines.push('<line x1="' + (ex-extPx) + '" y1="' + zbY + '" x2="' + ex + '" y2="' + zbY + '" stroke="#f87171" stroke-width="1.2"/>');
  lines.push('<line x1="' + (ex-extPx) + '" y1="' + (zbY-4) + '" x2="' + (ex-extPx) + '" y2="' + (zbY+4) + '" stroke="#f87171" stroke-width="1"/>');
  lines.push('<line x1="' + ex + '" y1="' + (zbY-4) + '" x2="' + ex + '" y2="' + (zbY+4) + '" stroke="#f87171" stroke-width="1"/>');
  lines.push('<text x="' + (ex-extPx/2) + '" y="' + (zbY-9) + '" fill="#f87171" font-size="8" text-anchor="middle" font-family="JetBrains Mono">0.3lx=' + r2(0.3*lx) + 'm</text>');
  lines.push('<text x="' + (W/2) + '" y="' + (zbY-20) + '" fill="#f87171" font-size="9" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">D' + diaTop + '@' + spx_n + 'mm TOP — Ast=' + r0(p.Ax_neg) + ' mm\u00b2/m (negative moment at supports)</text>');

  // Supports
  lines.push('<rect x="' + (sx-suppW) + '" y="' + (sy+slabH) + '" width="' + suppW + '" height="' + suppH + '" fill="rgba(71,85,105,0.5)" stroke="#475569" stroke-width="1"/>');
  lines.push('<text x="' + (sx-suppW/2) + '" y="' + (sy+slabH+15) + '" fill="#94a3b8" font-size="8" text-anchor="middle" font-family="JetBrains Mono">Support</text>');
  lines.push('<rect x="' + ex + '" y="' + (sy+slabH) + '" width="' + suppW + '" height="' + suppH + '" fill="rgba(71,85,105,0.5)" stroke="#475569" stroke-width="1"/>');
  lines.push('<text x="' + (ex+suppW/2) + '" y="' + (sy+slabH+15) + '" fill="#94a3b8" font-size="8" text-anchor="middle" font-family="JetBrains Mono">Support</text>');

  // Depth dimension (left side)
  const dimX = sx - 22;
  lines.push('<line x1="' + dimX + '" y1="' + sy + '" x2="' + dimX + '" y2="' + (sy+slabH) + '" stroke="#64748b" stroke-width="0.8"/>');
  lines.push('<line x1="' + (dimX-4) + '" y1="' + sy + '" x2="' + (dimX+4) + '" y2="' + sy + '" stroke="#64748b" stroke-width="0.8"/>');
  lines.push('<line x1="' + (dimX-4) + '" y1="' + (sy+slabH) + '" x2="' + (dimX+4) + '" y2="' + (sy+slabH) + '" stroke="#64748b" stroke-width="0.8"/>');
  lines.push('<text x="' + (dimX-10) + '" y="' + (sy+slabH/2+4) + '" fill="#e2e8f0" font-size="10" font-weight="700" text-anchor="middle" font-family="JetBrains Mono" transform="rotate(-90,' + (dimX-10) + ',' + (sy+slabH/2) + ')">' + D + 'mm</text>');

  // Cover dim right
  const covX = ex + 22;
  lines.push('<line x1="' + covX + '" y1="' + (sy+slabH) + '" x2="' + covX + '" y2="' + botCoverY + '" stroke="rgba(99,102,241,0.6)" stroke-width="0.8"/>');
  lines.push('<line x1="' + (covX-3) + '" y1="' + (sy+slabH) + '" x2="' + (covX+3) + '" y2="' + (sy+slabH) + '" stroke="rgba(99,102,241,0.6)" stroke-width="0.8"/>');
  lines.push('<line x1="' + (covX-3) + '" y1="' + botCoverY + '" x2="' + (covX+3) + '" y2="' + botCoverY + '" stroke="rgba(99,102,241,0.6)" stroke-width="0.8"/>');
  lines.push('<text x="' + (covX+10) + '" y="' + ((sy+slabH+botCoverY)/2+3) + '" fill="rgba(99,102,241,0.9)" font-size="8" font-family="JetBrains Mono">' + cover + 'mm</text>');

  // Effective depth d
  lines.push('<line x1="' + (ex+58) + '" y1="' + topBarY + '" x2="' + (ex+58) + '" y2="' + botBarY + '" stroke="rgba(148,163,184,0.4)" stroke-width="0.8" stroke-dasharray="3,2"/>');
  lines.push('<text x="' + (ex+68) + '" y="' + ((topBarY+botBarY)/2+3) + '" fill="#94a3b8" font-size="8" font-family="JetBrains Mono">d=' + d + 'mm</text>');

  // BMD
  lines.push('<text x="' + (W/2) + '" y="' + (bmdY-5) + '" fill="#475569" font-size="8" text-anchor="middle" font-family="JetBrains Mono">— Bending Moment Diagram (schematic) —</text>');
  lines.push('<line x1="' + sx + '" y1="' + bmdY + '" x2="' + ex + '" y2="' + bmdY + '" stroke="#334155" stroke-width="0.8"/>');
  // Sagging
  lines.push('<path d="M' + sx + ',' + bmdY + ' C' + (sx+slabW*0.25) + ',' + bmdY + ' ' + (sx+slabW*0.25) + ',' + (bmdY+bmdH) + ' ' + (W/2) + ',' + (bmdY+bmdH) + ' C' + (ex-slabW*0.25) + ',' + (bmdY+bmdH) + ' ' + (ex-slabW*0.25) + ',' + bmdY + ' ' + ex + ',' + bmdY + '" stroke="#34d399" stroke-width="1.5" fill="rgba(52,211,153,0.12)"/>');
  lines.push('<text x="' + (W/2) + '" y="' + (bmdY+bmdH+12) + '" fill="#34d399" font-size="8.5" text-anchor="middle" font-family="JetBrains Mono">+Mx = ' + r2(p.Mx) + ' kN.m/m (sagging — bottom tension)</text>');
  // Hogging
  const hogH = 16;
  lines.push('<path d="M' + sx + ',' + bmdY + ' C' + (sx+extPx*0.4) + ',' + bmdY + ' ' + (sx+extPx*0.6) + ',' + (bmdY-hogH) + ' ' + (sx+extPx) + ',' + bmdY + '" stroke="#f87171" stroke-width="1.5" fill="rgba(248,113,113,0.1)"/>');
  lines.push('<path d="M' + (ex-extPx) + ',' + bmdY + ' C' + (ex-extPx*0.6) + ',' + bmdY + ' ' + (ex-extPx*0.4) + ',' + (bmdY-hogH) + ' ' + ex + ',' + bmdY + '" stroke="#f87171" stroke-width="1.5" fill="rgba(248,113,113,0.1)"/>');
  lines.push('<text x="' + (sx+extPx/2) + '" y="' + (bmdY-hogH-4) + '" fill="#f87171" font-size="7.5" text-anchor="middle" font-family="JetBrains Mono">-' + r2(p.Mx_neg) + ' kN.m</text>');
  lines.push('<text x="' + (ex-extPx/2) + '" y="' + (bmdY-hogH-4) + '" fill="#f87171" font-size="7.5" text-anchor="middle" font-family="JetBrains Mono">-' + r2(p.Mx_neg) + ' kN.m</text>');

  // Legend
  const lgY = bmdY + bmdH + 30;
  const lgItems = [
    ['#34d399', 'D' + diaBot + '@' + spx + 'mm c/c — Short-span bottom, Ast_x = ' + r0(p.Ax) + ' mm\u00b2/m'],
    twoWay ? ['#38bdf8', 'D' + diaLong + '@' + spy + 'mm c/c — Long-span bottom (above), Ast_y = ' + r0(p.Ay) + ' mm\u00b2/m'] : null,
    ['#f87171', 'D' + diaTop + '@' + spx_n + 'mm c/c — Top/negative bars at supports, Ast_neg = ' + r0(p.Ax_neg) + ' mm\u00b2/m'],
  ].filter(Boolean);

  lgItems.forEach(function(item, i) {
    const col = item[0], label = item[1];
    lines.push('<circle cx="' + (padL+8) + '" cy="' + (lgY+i*15) + '" r="4.5" fill="' + col + '"/>');
    lines.push('<text x="' + (padL+20) + '" y="' + (lgY+i*15+4) + '" fill="' + col + '" font-size="8.5" font-family="JetBrains Mono">' + label + '</text>');
  });

  lines.push('</svg>');

  const cap = 'Fig: Cross-section through short span of slab ' + p.bayLabel + ' (lx=' + r2(lx) + 'm, ly=' + r2(ly) + 'm). Top bars at 0.3\u00d7lx=' + r2(0.3*lx) + 'm from supports per IS 456 Cl 26.5.2.3.';
  return '<div class="dg">' + lines.join('') + '<div class="dg-cap">' + cap + '</div></div>';
}


// ── BEAM LONGITUDINAL DIAGRAM ────────────────────────────────────
// Shows: elevation view with beam outline, bar zones, stirrup spacing,
// cover, D, L, tension/compression zones, lap positions
function svgBeamLongitudinal(b) {
  var L = b.L, bw = b.b, D = b.D, d = b.d;
  var cover = S.coverBeam || 40;
  var nm = b.nm || 2, ns = b.ns || 2;
  var diaBotBar = 20, diaTopBar = 20, diaStirrup = 8;
  var sv = b.sv || 200, svd = b.svd || 100;
  var Ld = b.Ld || 500; // development length in mm
  var Lo = Math.max(2 * D, L * 1000 / 4); // confinement zone
  var isCant = b.isCantilever, isTrf = b.isTransfer;

  var W = 680, padL = 60, padR = 60, padT = 100, padB = 130;
  var beamW = W - padL - padR;
  var beamH = Math.max(60, Math.min(110, D * 0.5));
  var scaleL = beamW / (L * 1000); // px per mm
  var scaleD = beamH / D;
  var sx = padL, sy = padT;
  var ex = W - padR;
  var totalH = padT + beamH + padB;

  // Computed positions
  var coverPx = cover * scaleD;
  var botBarY = sy + beamH - coverPx - diaStirrup * scaleD - diaBotBar * scaleD / 2;
  var topBarY = sy + coverPx + diaStirrup * scaleD + diaTopBar * scaleD / 2;
  var LoPx = Lo * scaleL;
  var LdPx = Ld * scaleL;

  var lines = [];
  lines.push('<svg viewBox="0 0 ' + W + ' ' + totalH + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;background:#0a0f1e;border-radius:8px">');

  // Title
  lines.push('<text x="' + (W/2) + '" y="16" fill="#fb923c" font-size="11" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">BEAM ELEVATION — ' + b.label + ' (L=' + L + 'm, ' + bw + '×' + D + 'mm)</text>');
  lines.push('<text x="' + (W/2) + '" y="30" fill="#64748b" font-size="9" text-anchor="middle" font-family="JetBrains Mono">' + b.endCond.split('(')[0].trim() + ' | wu=' + r2(b.wu) + ' kN/m | Mmax=' + r2(b.Mmax) + ' kN.m | RA=' + r2(b.RA) + ' kN</text>');
  lines.push('<text x="' + (W/2) + '" y="44" fill="#475569" font-size="8.5" text-anchor="middle" font-family="JetBrains Mono">Stirrups: D' + diaStirrup + '@' + svd + 'mm (confinement zone Lo) | D' + diaStirrup + '@' + sv + 'mm (midspan) | Ld=' + r0(Ld) + 'mm</text>');

  // ── SUPPORTS ────────────────────────────────────────────────────
  var suppW = 28, suppH = beamH + 20;
  // Left support
  lines.push('<rect x="' + (sx - suppW) + '" y="' + (sy - 10) + '" width="' + suppW + '" height="' + suppH + '" fill="rgba(71,85,105,0.5)" stroke="#475569" stroke-width="1"/>');
  // Right support
  lines.push('<rect x="' + ex + '" y="' + (sy - 10) + '" width="' + suppW + '" height="' + suppH + '" fill="rgba(71,85,105,0.5)" stroke="#475569" stroke-width="1"/>');

  // ── BEAM CONCRETE BODY ──────────────────────────────────────────
  lines.push('<rect x="' + sx + '" y="' + sy + '" width="' + beamW + '" height="' + beamH + '" fill="rgba(100,116,139,0.1)" stroke="#475569" stroke-width="1.5"/>');

  // Concrete hatch
  lines.push('<clipPath id="bmClip"><rect x="' + sx + '" y="' + sy + '" width="' + beamW + '" height="' + beamH + '"/></clipPath>');
  lines.push('<g clip-path="url(#bmClip)" stroke="rgba(100,116,139,0.15)" stroke-width="0.6">');
  for (var hi = -beamH; hi < beamW + beamH; hi += 14) {
    lines.push('<line x1="' + (sx + hi) + '" y1="' + sy + '" x2="' + (sx + hi + beamH) + '" y2="' + (sy + beamH) + '"/>');
  }
  lines.push('</g>');

  // Cover dashed lines (top and bottom)
  lines.push('<line x1="' + (sx + 4) + '" y1="' + (sy + coverPx) + '" x2="' + (ex - 4) + '" y2="' + (sy + coverPx) + '" stroke="rgba(99,102,241,0.3)" stroke-width="0.8" stroke-dasharray="4,3"/>');
  lines.push('<line x1="' + (sx + 4) + '" y1="' + (sy + beamH - coverPx) + '" x2="' + (ex - 4) + '" y2="' + (sy + beamH - coverPx) + '" stroke="rgba(99,102,241,0.3)" stroke-width="0.8" stroke-dasharray="4,3"/>');

  // ── CONFINEMENT ZONES (Lo from each end) ─────────────────────
  // Left zone
  lines.push('<rect x="' + sx + '" y="' + sy + '" width="' + Math.min(LoPx, beamW * 0.45) + '" height="' + beamH + '" fill="rgba(248,113,113,0.05)" stroke="none"/>');
  lines.push('<line x1="' + (sx + Math.min(LoPx, beamW * 0.45)) + '" y1="' + sy + '" x2="' + (sx + Math.min(LoPx, beamW * 0.45)) + '" y2="' + (sy + beamH) + '" stroke="#f87171" stroke-width="0.8" stroke-dasharray="3,3"/>');
  // Right zone
  lines.push('<rect x="' + (ex - Math.min(LoPx, beamW * 0.45)) + '" y="' + sy + '" width="' + Math.min(LoPx, beamW * 0.45) + '" height="' + beamH + '" fill="rgba(248,113,113,0.05)" stroke="none"/>');
  lines.push('<line x1="' + (ex - Math.min(LoPx, beamW * 0.45)) + '" y1="' + sy + '" x2="' + (ex - Math.min(LoPx, beamW * 0.45)) + '" y2="' + (sy + beamH) + '" stroke="#f87171" stroke-width="0.8" stroke-dasharray="3,3"/>');

  // ── STIRRUPS ────────────────────────────────────────────────────
  // Dense stirrups in confinement zone
  var LoPx2 = Math.min(LoPx, beamW * 0.45);
  var svdPx = svd * scaleL, svPx = sv * scaleL;
  var stY1 = sy + coverPx + diaStirrup * scaleD / 2;
  var stH = beamH - 2 * coverPx - diaStirrup * scaleD;

  // Left zone stirrups
  for (var xi = svdPx; xi < LoPx2; xi += svdPx) {
    lines.push('<rect x="' + r2(sx + xi - 1) + '" y="' + r2(stY1) + '" width="2" height="' + r2(stH) + '" fill="#34d399" opacity="0.7"/>');
  }
  // Midspan stirrups
  var midStart = LoPx2, midEnd = beamW - LoPx2;
  for (var xi2 = midStart + svPx; xi2 < midEnd; xi2 += svPx) {
    lines.push('<rect x="' + r2(sx + xi2 - 1) + '" y="' + r2(stY1) + '" width="2" height="' + r2(stH) + '" fill="#34d399" opacity="0.4"/>');
  }
  // Right zone stirrups
  for (var xi3 = svdPx; xi3 < LoPx2; xi3 += svdPx) {
    lines.push('<rect x="' + r2(ex - xi3 - 1) + '" y="' + r2(stY1) + '" width="2" height="' + r2(stH) + '" fill="#34d399" opacity="0.7"/>');
  }

  // ── BOTTOM BARS (tension — full length) ─────────────────────────
  var barR = Math.max(3, diaBotBar * scaleD / 2);
  for (var bi = 0; bi < nm; bi++) {
    var byOff = bi * (diaBotBar + 4) * scaleD;
    lines.push('<line x1="' + (sx + LdPx) + '" y1="' + r2(botBarY - byOff) + '" x2="' + (ex - LdPx) + '" y2="' + r2(botBarY - byOff) + '" stroke="#34d399" stroke-width="' + r2(barR * 1.6) + '" stroke-linecap="round"/>');
  }
  // Bottom bar hooks / Ld at ends
  lines.push('<line x1="' + sx + '" y1="' + r2(botBarY) + '" x2="' + (sx + LdPx) + '" y2="' + r2(botBarY) + '" stroke="#34d399" stroke-width="' + r2(barR * 0.8) + '" stroke-dasharray="3,3" opacity="0.5"/>');
  lines.push('<line x1="' + (ex - LdPx) + '" y1="' + r2(botBarY) + '" x2="' + ex + '" y2="' + r2(botBarY) + '" stroke="#34d399" stroke-width="' + r2(barR * 0.8) + '" stroke-dasharray="3,3" opacity="0.5"/>');

  // ── TOP BARS (compression/hogging — support zones only) ──────────
  var topBarR = Math.max(3, diaTopBar * scaleD / 2);
  var topExtPx = Math.max(LdPx * 1.5, LoPx2); // extend at least Ld past confinement zone
  for (var ti = 0; ti < ns; ti++) {
    var tyOff = ti * (diaTopBar + 4) * scaleD;
    // Left zone top bars
    lines.push('<line x1="' + sx + '" y1="' + r2(topBarY + tyOff) + '" x2="' + (sx + topExtPx) + '" y2="' + r2(topBarY + tyOff) + '" stroke="#f87171" stroke-width="' + r2(topBarR * 1.4) + '" stroke-linecap="round"/>');
    // Right zone top bars
    lines.push('<line x1="' + (ex - topExtPx) + '" y1="' + r2(topBarY + tyOff) + '" x2="' + ex + '" y2="' + r2(topBarY + tyOff) + '" stroke="#f87171" stroke-width="' + r2(topBarR * 1.4) + '" stroke-linecap="round"/>');
  }

  // ── TRANSFER BEAM: Point load marker ─────────────────────────
  if (isTrf && b.transferPL) {
    var ptX = sx + b.transferPL.a * 1000 * scaleL;
    lines.push('<line x1="' + r2(ptX) + '" y1="' + (sy - 25) + '" x2="' + r2(ptX) + '" y2="' + sy + '" stroke="#f59e0b" stroke-width="2.5"/>');
    lines.push('<polygon points="' + r2(ptX) + ',' + sy + ' ' + r2(ptX - 6) + ',' + (sy - 12) + ' ' + r2(ptX + 6) + ',' + (sy - 12) + '" fill="#f59e0b"/>');
    lines.push('<text x="' + r2(ptX) + '" y="' + (sy - 30) + '" fill="#f59e0b" font-size="8.5" text-anchor="middle" font-family="JetBrains Mono">P_u=' + r2(b.transferPL.P_u) + 'kN</text>');
  }

  // ── DIMENSION LINES ─────────────────────────────────────────────
  // Total span L
  var dimY = sy + beamH + 16;
  lines.push('<line x1="' + sx + '" y1="' + dimY + '" x2="' + ex + '" y2="' + dimY + '" stroke="#f59e0b" stroke-width="0.8"/>');
  lines.push('<line x1="' + sx + '" y1="' + (dimY - 4) + '" x2="' + sx + '" y2="' + (dimY + 4) + '" stroke="#f59e0b" stroke-width="0.8"/>');
  lines.push('<line x1="' + ex + '" y1="' + (dimY - 4) + '" x2="' + ex + '" y2="' + (dimY + 4) + '" stroke="#f59e0b" stroke-width="0.8"/>');
  lines.push('<text x="' + (W/2) + '" y="' + (dimY + 13) + '" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="middle" font-family="JetBrains Mono">L = ' + L + ' m = ' + (L*1000) + ' mm</text>');

  // Lo dimensions
  var loDimY = sy - 18;
  lines.push('<line x1="' + sx + '" y1="' + loDimY + '" x2="' + (sx + LoPx2) + '" y2="' + loDimY + '" stroke="#f87171" stroke-width="0.8"/>');
  lines.push('<text x="' + (sx + LoPx2 / 2) + '" y="' + (loDimY - 5) + '" fill="#f87171" font-size="8" text-anchor="middle" font-family="JetBrains Mono">Lo=' + r0(Lo) + 'mm</text>');
  lines.push('<line x1="' + (ex - LoPx2) + '" y1="' + loDimY + '" x2="' + ex + '" y2="' + loDimY + '" stroke="#f87171" stroke-width="0.8"/>');
  lines.push('<text x="' + (ex - LoPx2 / 2) + '" y="' + (loDimY - 5) + '" fill="#f87171" font-size="8" text-anchor="middle" font-family="JetBrains Mono">Lo=' + r0(Lo) + 'mm</text>');

  // Depth D — left side
  var dDimX = sx - 20;
  lines.push('<line x1="' + dDimX + '" y1="' + sy + '" x2="' + dDimX + '" y2="' + (sy + beamH) + '" stroke="#64748b" stroke-width="0.8"/>');
  lines.push('<line x1="' + (dDimX - 4) + '" y1="' + sy + '" x2="' + (dDimX + 4) + '" y2="' + sy + '" stroke="#64748b" stroke-width="0.8"/>');
  lines.push('<line x1="' + (dDimX - 4) + '" y1="' + (sy + beamH) + '" x2="' + (dDimX + 4) + '" y2="' + (sy + beamH) + '" stroke="#64748b" stroke-width="0.8"/>');
  lines.push('<text x="' + (dDimX - 10) + '" y="' + (sy + beamH / 2 + 4) + '" fill="#e2e8f0" font-size="9" font-weight="700" text-anchor="middle" font-family="JetBrains Mono" transform="rotate(-90,' + (dDimX - 10) + ',' + (sy + beamH / 2) + ')">' + D + 'mm</text>');

  // ── BAR LABELS ─────────────────────────────────────────────────
  var lgY = sy + beamH + 38;
  var lgItems = [
    ['#34d399', nm + 'T20 bottom bars (tension, full span) — Ast=' + r0(b.Am) + ' mm\u00b2'],
    ['#f87171', ns + 'T20 top bars at supports (hogging zone Lo) — Ast=' + r0(b.As2||b.ns*314) + ' mm\u00b2'],
    ['#34d399', 'D' + diaStirrup + '@' + svd + 'mm stirrups in Lo (IS 13920 Cl 6.3.5) | D' + diaStirrup + '@' + sv + 'mm at midspan'],
  ];
  if (isTrf) lgItems.push(['#f59e0b', 'Point load P_u=' + r2(b.transferPL ? b.transferPL.P_u : 0) + ' kN from floating column at ' + r2(b.transferPL ? b.transferPL.a : 0) + 'm from left end']);

  lgItems.forEach(function(item, i) {
    var sw = i === 2 ? 8 : 10;
    var sy2 = lgY + i * 16;
    if (i === 2) {
      lines.push('<rect x="' + (padL + 4) + '" y="' + (sy2 - 5) + '" width="' + sw + '" height="6" fill="' + item[0] + '" opacity="0.7"/>');
    } else {
      lines.push('<circle cx="' + (padL + 8) + '" cy="' + (sy2 - 1) + '" r="5" fill="' + item[0] + '"/>');
    }
    lines.push('<text x="' + (padL + 20) + '" y="' + (sy2 + 3) + '" fill="' + item[0] + '" font-size="8.5" font-family="JetBrains Mono">' + item[1] + '</text>');
  });

  lines.push('</svg>');
  return '<div class="dg">' + lines.join('') + '<div class="dg-cap">Fig: Beam ' + b.label + ' elevation — longitudinal section showing bar zones, stirrup spacing, and confinement zones Lo per IS 13920:2016 Cl 6.3.5. Top bars extend Lo=' + r0(Lo) + 'mm from each support. Bottom bars run full span with development length Ld=' + r0(Ld) + 'mm anchorage into supports.</div></div>';
}

// ── FOOTING TYPE SELECTION ────────────────────────────────────────
// Returns the recommended footing type for a node based on:
// 1. If Bf overlaps with adjacent footing → Combined footing
// 2. If all footings overlap widely → Raft
// 3. Otherwise → Isolated
function getFootingType(ftg) {
  if (!GRID || !RES || !RES.allFtgs) return 'isolated';
  var allFtgs = RES.allFtgs;
  var node = GRID.nodes.find(function(n) { return n.row === ftg.row && n.col === ftg.col; });
  if (!node) return 'isolated';

  // Check if footing overlaps with adjacent footings
  // Overlap occurs if Bf/2 + adjacent.Bf/2 > span between columns
  var overlaps = [];
  // Check X-direction neighbours
  var adjRight = allFtgs.find(function(f) { return f.row === ftg.row && f.col === ftg.col + 1; });
  var adjLeft  = allFtgs.find(function(f) { return f.row === ftg.row && f.col === ftg.col - 1; });
  var adjDown  = allFtgs.find(function(f) { return f.row === ftg.row + 1 && f.col === ftg.col; });
  var adjUp    = allFtgs.find(function(f) { return f.row === ftg.row - 1 && f.col === ftg.col; });

  // Practical rule: if Bf > 0.5 × adjacent span, footings would be too close
  // Combined footing needed. If Bf > 0.75 × span, recommend raft.
  var maxSpanX = S.spansX.length ? Math.max.apply(null, S.spansX) : 4;
  var maxSpanY = S.spansY.length ? Math.max.apply(null, S.spansY) : 4;
  var minSpanX = S.spansX.length ? Math.min.apply(null, S.spansX) : 4;
  var minSpanY = S.spansY.length ? Math.min.apply(null, S.spansY) : 4;
  var minSpan = Math.min(minSpanX, minSpanY);

  // Check if any adjacent pair would overlap
  if (adjRight) {
    var combinedHalfX = (ftg.Bf + adjRight.Bf) / 2;
    var spanX = S.spansX[ftg.col] || maxSpanX;
    if (combinedHalfX > spanX * 0.9) overlaps.push('X+');
    else if (combinedHalfX > spanX * 0.5) overlaps.push('X+ close');
  }
  if (adjLeft) {
    var combinedHalfX2 = (ftg.Bf + adjLeft.Bf) / 2;
    var spanX2 = S.spansX[ftg.col - 1] || maxSpanX;
    if (combinedHalfX2 > spanX2 * 0.9) overlaps.push('X-');
    else if (combinedHalfX2 > spanX2 * 0.5) overlaps.push('X- close');
  }
  if (adjDown) {
    var combinedHalfY = (ftg.Bf + adjDown.Bf) / 2;
    var spanY = S.spansY[ftg.row] || maxSpanY;
    if (combinedHalfY > spanY * 0.9) overlaps.push('Y+');
    else if (combinedHalfY > spanY * 0.5) overlaps.push('Y+ close');
  }
  if (adjUp) {
    var combinedHalfY2 = (ftg.Bf + adjUp.Bf) / 2;
    var spanY2 = S.spansY[ftg.row - 1] || maxSpanY;
    if (combinedHalfY2 > spanY2 * 0.9) overlaps.push('Y-');
    else if (combinedHalfY2 > spanY2 * 0.5) overlaps.push('Y- close');
  }

  // Global check: if average Bf > 50% of min span across whole building → raft
  var avgBf = allFtgs.reduce(function(s, f2) { return s + f2.Bf; }, 0) / allFtgs.length;
  // Raft: average footing covers >60% of bay, or SBC very low (< 75 kN/m² typical weak soil)
  var ftgCoverageRatio = avgBf / minSpan;
  if (ftgCoverageRatio > 0.6 || S.soilBearing < 50) return 'raft';
  if (ftg.Bf > minSpan * 0.4) return 'combined';
  if (overlaps.length > 0) return 'combined';
  return 'isolated';
}

function svgFootingTypePanel(ftg) {
  var type = getFootingType(ftg);
  var Bf = ftg.Bf, D = ftg.D, d = ftg.d, colSz = ftg.colSize || 300;
  var Ps = ftg.Ps, Pu = ftg.Pu;
  var SBC = S.soilBearing;

  // Colour and icon by type
  var typeInfo = {
    isolated: { col: '#34d399', icon: '⬜', name: 'ISOLATED FOOTING', short: 'Isolated' },
    combined: { col: '#f59e0b', icon: '▭', name: 'COMBINED FOOTING RECOMMENDED', short: 'Combined' },
    raft:     { col: '#f87171', icon: '▦', name: 'RAFT FOUNDATION RECOMMENDED', short: 'Raft' },
  };
  var ti = typeInfo[type];

  var W = 660, H = 420;
  var lines = [];
  lines.push('<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;background:#0a0f1e;border-radius:8px">');
  lines.push('<text x="' + (W/2) + '" y="20" fill="' + ti.col + '" font-size="11" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">FOOTING TYPE — ' + ti.name + '</text>');

  // Draw all three types side by side with the recommended one highlighted
  var types = ['isolated', 'combined', 'raft'];
  var tw = 180, th = 180, tGap = 20;
  var totW = types.length * tw + (types.length - 1) * tGap;
  var startX = (W - totW) / 2;

  types.forEach(function(t, i) {
    var tx = startX + i * (tw + tGap);
    var ty = 40;
    var isActive = t === type;
    var tc = typeInfo[t].col;
    var alpha = isActive ? '1' : '0.3';

    // Card border
    lines.push('<rect x="' + tx + '" y="' + ty + '" width="' + tw + '" height="' + th + '" rx="8" fill="' + (isActive ? 'rgba(' + (t==='isolated'?'52,211,153':t==='combined'?'245,158,11':'248,113,113') + ',0.08)' : 'rgba(30,41,59,0.5)') + '" stroke="' + tc + '" stroke-width="' + (isActive ? '2' : '0.5') + '" opacity="' + alpha + '"/>');

    var cx = tx + tw / 2, cy = ty + th / 2;

    if (t === 'isolated') {
      // Plan view: square pad with column in centre
      var padW = 80, padH = 80, colW = 20;
      lines.push('<rect x="' + (cx-padW/2) + '" y="' + (ty+28) + '" width="' + padW + '" height="' + padH + '" fill="rgba(52,211,153,0.15)" stroke="#34d399" stroke-width="' + (isActive?1.5:0.5) + '" opacity="' + alpha + '"/>');
      lines.push('<rect x="' + (cx-colW/2) + '" y="' + (ty+28+padH/2-colW/2) + '" width="' + colW + '" height="' + colW + '" fill="rgba(52,211,153,0.5)" stroke="#34d399" stroke-width="1" opacity="' + alpha + '"/>');
      // Dimension arrows
      lines.push('<text x="' + cx + '" y="' + (ty+28+padH+16) + '" fill="#34d399" font-size="8" text-anchor="middle" font-family="JetBrains Mono" opacity="' + alpha + '">Bf × Bf</text>');
      // Elevation inset
      var ey = ty + 28 + padH + 28;
      lines.push('<rect x="' + (cx-padW/2) + '" y="' + ey + '" width="' + padW + '" height="18" fill="rgba(52,211,153,0.1)" stroke="#34d399" stroke-width="' + (isActive?1:0.5) + '" opacity="' + alpha + '"/>');
      lines.push('<rect x="' + (cx-colW/2) + '" y="' + (ey-12) + '" width="' + colW + '" height="12" fill="rgba(52,211,153,0.4)" stroke="#34d399" stroke-width="0.8" opacity="' + alpha + '"/>');

    } else if (t === 'combined') {
      // Two columns on one elongated pad
      var cpadW = 140, cpadH = 50, ccolW = 18;
      var cey = ty + 45;
      lines.push('<rect x="' + (cx-cpadW/2) + '" y="' + (cey+20) + '" width="' + cpadW + '" height="' + cpadH + '" fill="rgba(245,158,11,0.12)" stroke="#f59e0b" stroke-width="' + (isActive?1.5:0.5) + '" opacity="' + alpha + '"/>');
      // Two columns
      [-35, 35].forEach(function(ox) {
        lines.push('<rect x="' + (cx+ox-ccolW/2) + '" y="' + (cey+8) + '" width="' + ccolW + '" height="12" fill="rgba(245,158,11,0.5)" stroke="#f59e0b" stroke-width="0.8" opacity="' + alpha + '"/>');
        lines.push('<rect x="' + (cx+ox-ccolW/2) + '" y="' + (cey+20) + '" width="' + ccolW + '" height="12" fill="rgba(245,158,11,0.3)" stroke="none" opacity="' + alpha + '"/>');
      });
      lines.push('<text x="' + cx + '" y="' + (cey+20+cpadH+14) + '" fill="#f59e0b" font-size="8" text-anchor="middle" font-family="JetBrains Mono" opacity="' + alpha + '">Two columns, one pad</text>');
      lines.push('<text x="' + cx + '" y="' + (cey+20+cpadH+26) + '" fill="#f59e0b" font-size="7.5" text-anchor="middle" font-family="JetBrains Mono" opacity="' + alpha + '">When footings would overlap</text>');

    } else {
      // Raft — full slab under building
      var rpadW = 150, rpadH = 25;
      var rey = ty + 55;
      // Slab
      lines.push('<rect x="' + (cx-rpadW/2) + '" y="' + (rey+20) + '" width="' + rpadW + '" height="' + rpadH + '" fill="rgba(248,113,113,0.1)" stroke="#f87171" stroke-width="' + (isActive?1.5:0.5) + '" opacity="' + alpha + '"/>');
      // Multiple columns
      [-55,-18,18,55].forEach(function(ox) {
        lines.push('<rect x="' + (cx+ox-7) + '" y="' + (rey+8) + '" width="14" height="12" fill="rgba(248,113,113,0.5)" stroke="#f87171" stroke-width="0.8" opacity="' + alpha + '"/>');
        lines.push('<rect x="' + (cx+ox-7) + '" y="' + (rey+20) + '" width="14" height="10" fill="rgba(248,113,113,0.25)" stroke="none" opacity="' + alpha + '"/>');
      });
      lines.push('<text x="' + cx + '" y="' + (rey+20+rpadH+14) + '" fill="#f87171" font-size="8" text-anchor="middle" font-family="JetBrains Mono" opacity="' + alpha + '">Continuous slab under all columns</text>');
      lines.push('<text x="' + cx + '" y="' + (rey+20+rpadH+26) + '" fill="#f87171" font-size="7.5" text-anchor="middle" font-family="JetBrains Mono" opacity="' + alpha + '">Weak soil or heavy loads</text>');
    }

    // Label
    lines.push('<text x="' + cx + '" y="' + (ty + th - 8) + '" fill="' + tc + '" font-size="9" font-weight="700" text-anchor="middle" font-family="JetBrains Mono" opacity="' + alpha + '">' + typeInfo[t].short + (isActive ? ' ✓' : '') + '</text>');
  });

  // ── DESIGN SUMMARY FOR THIS FOOTING ─────────────────────────
  var detY = 240;
  lines.push('<rect x="20" y="' + detY + '" width="' + (W-40) + '" height="165" rx="6" fill="rgba(15,23,42,0.8)" stroke="' + ti.col + '" stroke-width="1"/>');
  lines.push('<text x="40" y="' + (detY+16) + '" fill="' + ti.col + '" font-size="10" font-weight="700" font-family="JetBrains Mono">' + ti.icon + ' ' + ftg.label + ' — ' + ti.name + '</text>');

  var rows = [
    ['Service load Ps', r2(Ps) + ' kN', 'From column design (all floors above)'],
    ['SBC (soil bearing)', SBC + ' kN/m²', 'As specified in Soil & Site input'],
    ['Area required = Ps / SBC', r2(Ps/SBC) + ' m²', 'IS 456 Cl 34.1'],
    ['Footing plan size', r2(Bf) + ' × ' + r2(Bf) + ' m = ' + r2(Bf*Bf) + ' m²', 'Square isolated pad'],
    ['Net upward pressure qu = Pu / Bf²', r2(ftg.quf) + ' kN/m²', 'Factored pressure for design'],
    ['Depth D (punching governs)', D + ' mm', 'IS 456 Cl 31.6'],
    ['Effective depth d = D - cover - bar/2', d + ' mm', 'cover=' + S.coverFtg + 'mm'],
  ];
  rows.forEach(function(row, i) {
    var ry = detY + 32 + i * 19;
    lines.push('<text x="40" y="' + ry + '" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">' + row[0] + '</text>');
    lines.push('<text x="300" y="' + ry + '" fill="#e2e8f0" font-size="8.5" font-weight="700" font-family="JetBrains Mono">' + row[1] + '</text>');
    lines.push('<text x="420" y="' + ry + '" fill="#475569" font-size="8" font-family="JetBrains Mono">' + row[2] + '</text>');
  });

  // Type recommendation explanation
  var expY = detY + 32 + rows.length * 19 + 6;
  var explanation = {
    isolated: 'Gap between adjacent footings > 300mm. Individual isolated pads are adequate. No overlap risk at this SBC and column load.',
    combined: 'Adjacent footings would be within 300mm of each other. Combine them on a single elongated pad to avoid undermining, simplify construction, and distribute load more evenly. Design combined footing as inverted T-beam.',
    raft: 'More than 50% of footings overlap when individually sized. A raft (mat) foundation is more economical and practical. Raft also reduces differential settlement. Raft design requires separate analysis.',
  };
  lines.push('<text x="40" y="' + expY + '" fill="' + ti.col + '" font-size="8.5" font-family="JetBrains Mono">Recommendation: ' + explanation[type] + '</text>');

  lines.push('</svg>');

  var cap = 'Fig: Footing type selection for ' + ftg.label + '. Recommended: ' + ti.name + '. Based on IS 456 Cl 34 and proximity to adjacent footings (gap < 300mm triggers combined footing recommendation).';
  return '<div class="dg">' + lines.join('') + '<div class="dg-cap">' + cap + '</div></div>';
}

function secBeams(){
  if(!RES.allBeams||RES.allBeams.length===0)return'<div class="card">No beam data.</div>';

  const warns=RES.warnings&&RES.warnings.length
    ?`<div class="cp" style="border-left-color:#f59e0b;margin-bottom:10px">
        <strong style="color:#f59e0b">⚠ Notes:</strong> ${RES.warnings.join(' | ')}
      </div>`:'' ;

  // Available floors
  const allFloors=[...new Set(RES.allBeams.map(b=>b.floor))].sort((a,b)=>a-b);
  if(_beamFloor===undefined||!allFloors.includes(_beamFloor)) _beamFloor=allFloors[0];

  // Beams on selected floor
  const floorBeams=RES.allBeams.filter(b=>b.floor===_beamFloor);
  if(_beamIdx===undefined||_beamIdx>=floorBeams.length) _beamIdx=0;
  const beam=floorBeams[_beamIdx];

  // Floor tabs
  const floorTabs=allFloors.map(f=>{
    const isRoof=f===S.numFloors;
    const lbl=isRoof?`Roof`:`F${f}`;
    const fBeams=RES.allBeams.filter(b=>b.floor===f);
    const allOk=fBeams.every(b=>b.deflOK&&b.shearSafe);
    return`<button onclick="window._beamFloor=${f};_beamFloor=${f};_beamIdx=0;showSec('beams')"
      style="padding:5px 12px;border-radius:6px;border:1px solid ${_beamFloor===f?'var(--orange)':'var(--b1)'};
      background:${_beamFloor===f?'rgba(249,115,22,0.12)':'transparent'};
      color:${_beamFloor===f?'var(--orange)':allOk?'var(--txt3)':'#f87171'};cursor:pointer;font-size:10px;font-weight:700">
      ${lbl} ${allOk?'':'⚠'}
    </button>`;
  }).join('');

  // Beam selector for this floor — grouped by direction
  const xBeams=floorBeams.filter(b=>b.dir==='X');
  const yBeams=floorBeams.filter(b=>b.dir==='Y');
  const secBeams2=floorBeams.filter(b=>b.isSecondary||b.isTransfer||b.isCantilever);

  function beamBtn(b,i){
    const globalIdx=floorBeams.indexOf(b);
    const ok=b.deflOK&&b.shearSafe;
    return`<button onclick="_beamIdx=${globalIdx};showSec('beams')"
      style="padding:4px 9px;border-radius:5px;font-size:9px;cursor:pointer;font-family:monospace;
      border:1px solid ${_beamIdx===globalIdx?'var(--orange)':(ok?'var(--b1)':'rgba(248,113,113,0.5)')};
      background:${_beamIdx===globalIdx?'rgba(249,115,22,0.15)':(ok?'transparent':'rgba(248,113,113,0.06)')};
      color:${_beamIdx===globalIdx?'var(--orange)':(ok?'var(--txt2)':'#f87171')};
      font-weight:${_beamIdx===globalIdx?'700':'400'}">
      ${b.label} <span style="font-size:8px">${r2(b.L)}m</span>
    </button>`;
  }

  const summary_ok=floorBeams.filter(b=>b.deflOK&&b.shearSafe).length;
  const summary_fail=floorBeams.length-summary_ok;

  return`
<div class="card or">
  <div class="ct or">🔶 Beam Design — IS 456 Cl 22, 23, 26.5 + IS 13920</div>
  ${warns}

  <!-- Floor Selector -->
  <div style="margin-bottom:10px">
    <div style="font-size:10px;font-weight:700;color:var(--txt3);margin-bottom:5px">SELECT FLOOR</div>
    <div style="display:flex;flex-wrap:wrap;gap:5px">${floorTabs}</div>
  </div>

  <!-- Floor Summary -->
  <div style="padding:8px 12px;background:var(--bg1);border:1px solid var(--b1);border-radius:8px;margin-bottom:10px;font-size:10px">
    Floor ${_beamFloor===S.numFloors?'Roof':'F'+_beamFloor}:
    <strong>${floorBeams.length}</strong> beams total —
    <span style="color:#34d399">${summary_ok} pass</span>
    ${summary_fail?`<span style="color:#f87171"> | ${summary_fail} FAIL</span>`:''}
    &nbsp;|&nbsp; X-dir: ${xBeams.length} &nbsp;|&nbsp; Y-dir: ${yBeams.length}
    ${secBeams2.length?`&nbsp;|&nbsp; Special: ${secBeams2.length}`:''}
  </div>

  <!-- Beam Selector -->
  <div style="margin-bottom:12px">
    <div style="font-size:10px;font-weight:700;color:var(--txt3);margin-bottom:4px">SELECT BEAM</div>
    ${xBeams.length?`<div style="font-size:9px;color:#f59e0b;margin-bottom:3px;margin-top:2px">X-DIRECTION</div><div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:5px">${xBeams.map(beamBtn).join('')}</div>`:''}
    ${yBeams.length?`<div style="font-size:9px;color:#34d399;margin-bottom:3px">Y-DIRECTION</div><div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:5px">${yBeams.map(beamBtn).join('')}</div>`:''}
    ${secBeams2.length?`<div style="font-size:9px;color:#8b5cf6;margin-bottom:3px">SPECIAL BEAMS</div><div style="display:flex;flex-wrap:wrap;gap:3px">${secBeams2.map(beamBtn).join('')}</div>`:''}
  </div>

  <!-- Selected Beam Detail -->
  ${beam?beamDetail(beam):'<div style="padding:12px;color:var(--txt3)">Select a beam above</div>'}
</div>`;
}

// ── BEAM DIAGRAMS (SVG inline generators) ───────────────────────
function svgBeamBMD_SFD(b){
  const W=380,H=240,pad=40;
  const spanPx=W-2*pad;
  const isCant=b.isCantilever;
  let svg=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:380px;display:block">`;
  // Background
  svg+=`<rect width="${W}" height="${H}" fill="#0a0f1e" rx="6"/>`;
  // Title
  svg+=`<text x="${W/2}" y="14" fill="#38bdf8" font-size="9" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">SHEAR FORCE & BENDING MOMENT DIAGRAMS</text>`;
  // Beam line
  const by=60;
  svg+=`<line x1="${pad}" y1="${by}" x2="${pad+spanPx}" y2="${by}" stroke="#94a3b8" stroke-width="2"/>`;
  // Supports
  if(isCant){
    // Fixed at left, free at right
    svg+=`<rect x="${pad-4}" y="${by-12}" width="8" height="24" fill="#475569" stroke="#94a3b8"/>`;
    for(let i=0;i<4;i++) svg+=`<line x1="${pad-8}" y1="${by-12+i*8}" x2="${pad-2}" y2="${by-6+i*8}" stroke="#64748b" stroke-width="1"/>`;
  } else {
    // Triangle supports
    svg+=`<polygon points="${pad},${by+2} ${pad-8},${by+14} ${pad+8},${by+14}" fill="#475569" stroke="#94a3b8"/>`;
    svg+=`<polygon points="${pad+spanPx},${by+2} ${pad+spanPx-8},${by+14} ${pad+spanPx+8},${by+14}" fill="#475569" stroke="#94a3b8"/>`;
  }
  // UDL arrows
  for(let i=0;i<10;i++){
    const xi=pad+spanPx*i/9;
    svg+=`<line x1="${xi}" y1="${by-22}" x2="${xi}" y2="${by-4}" stroke="#f59e0b" stroke-width="1"/>`;
    svg+=`<polygon points="${xi},${by-4} ${xi-2},${by-10} ${xi+2},${by-10}" fill="#f59e0b"/>`;
  }
  svg+=`<line x1="${pad}" y1="${by-22}" x2="${pad+spanPx}" y2="${by-22}" stroke="#f59e0b" stroke-width="1.5"/>`;
  svg+=`<text x="${W/2}" y="${by-26}" fill="#f59e0b" font-size="8" text-anchor="middle" font-family="JetBrains Mono">wu = ${r2(b.wu)} kN/m</text>`;
  // SFD
  const sfdy=105, sfdH=35;
  svg+=`<text x="${pad-2}" y="${sfdy-8}" fill="#34d399" font-size="8" font-weight="bold" font-family="JetBrains Mono">SFD</text>`;
  svg+=`<line x1="${pad}" y1="${sfdy}" x2="${pad+spanPx}" y2="${sfdy}" stroke="#475569" stroke-width="0.5" stroke-dasharray="3,3"/>`;
  if(isCant){
    svg+=`<polygon points="${pad},${sfdy-sfdH} ${pad+spanPx},${sfdy} ${pad},${sfdy}" fill="rgba(52,211,153,0.15)" stroke="#34d399" stroke-width="1.5"/>`;
    svg+=`<text x="${pad+4}" y="${sfdy-sfdH-4}" fill="#34d399" font-size="7" font-family="JetBrains Mono">${r2(b.RA)} kN</text>`;
  } else {
    svg+=`<polygon points="${pad},${sfdy-sfdH} ${W/2},${sfdy} ${pad},${sfdy}" fill="rgba(52,211,153,0.15)" stroke="#34d399" stroke-width="1.5"/>`;
    svg+=`<polygon points="${W/2},${sfdy} ${pad+spanPx},${sfdy+sfdH} ${pad+spanPx},${sfdy}" fill="rgba(248,113,113,0.15)" stroke="#f87171" stroke-width="1.5"/>`;
    svg+=`<text x="${pad+4}" y="${sfdy-sfdH-3}" fill="#34d399" font-size="7" font-family="JetBrains Mono">+${r2(b.RA)} kN</text>`;
    svg+=`<text x="${pad+spanPx-40}" y="${sfdy+sfdH+10}" fill="#f87171" font-size="7" font-family="JetBrains Mono">-${r2(b.RA)} kN</text>`;
  }
  // BMD
  const bmdy=185, bmdH=40;
  svg+=`<text x="${pad-2}" y="${bmdy-bmdH-8}" fill="#f59e0b" font-size="8" font-weight="bold" font-family="JetBrains Mono">BMD</text>`;
  svg+=`<line x1="${pad}" y1="${bmdy}" x2="${pad+spanPx}" y2="${bmdy}" stroke="#475569" stroke-width="0.5" stroke-dasharray="3,3"/>`;
  if(isCant){
    // Cantilever: max moment at support, parabolic to zero at free end
    let pts=`${pad},${bmdy}`;
    for(let i=0;i<=20;i++){
      const t=i/20;
      const xi=pad+spanPx*t;
      const mi=bmdH*(1-t)*(1-t); // parabolic
      pts+=` ${xi},${bmdy-mi}`;
    }
    pts+=` ${pad+spanPx},${bmdy}`;
    svg+=`<polygon points="${pts}" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" stroke-width="1.5"/>`;
    svg+=`<text x="${pad+8}" y="${bmdy-bmdH-3}" fill="#f59e0b" font-size="7" font-family="JetBrains Mono">${r2(b.Mmax)} kN.m</text>`;
  } else {
    // SS or continuous: parabolic sagging
    let pts=`${pad},${bmdy}`;
    for(let i=0;i<=20;i++){
      const t=i/20;
      const xi=pad+spanPx*t;
      const mi=bmdH*4*t*(1-t);
      pts+=` ${xi},${bmdy+mi}`;
    }
    pts+=` ${pad+spanPx},${bmdy}`;
    svg+=`<polygon points="${pts}" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" stroke-width="1.5"/>`;
    svg+=`<text x="${W/2}" y="${bmdy+bmdH+12}" fill="#f59e0b" font-size="8" text-anchor="middle" font-family="JetBrains Mono">${r2(b.Mmax)} kN.m</text>`;
    // Hogging at supports if continuous
    if(b.Msup>0){
      const hogH=bmdH*b.Msup/Math.max(b.Mmax,1)*0.8;
      svg+=`<rect x="${pad}" y="${bmdy-hogH}" width="${spanPx*0.15}" height="${hogH}" fill="rgba(248,113,113,0.15)" stroke="#f87171" stroke-width="1"/>`;
      svg+=`<rect x="${pad+spanPx*0.85}" y="${bmdy-hogH}" width="${spanPx*0.15}" height="${hogH}" fill="rgba(248,113,113,0.15)" stroke="#f87171" stroke-width="1"/>`;
      svg+=`<text x="${pad+spanPx*0.08}" y="${bmdy-hogH-3}" fill="#f87171" font-size="6" text-anchor="middle" font-family="JetBrains Mono">${r2(b.Msup)}</text>`;
    }
  }
  svg+='</svg>';
  return`<div class="dg">${svg}<div class="dg-cap">Fig: SFD and BMD for ${b.label} (L=${b.L}m, wu=${r2(b.wu)} kN/m)</div></div>`;
}

function svgBeamCrossSection(b){
  const W=240,H=200;
  const sc=Math.min(140/b.b,150/b.D)*0.7;
  const bw=b.b*sc, bh=b.D*sc;
  const ox=(W-bw)/2, oy=20;
  const cv=S.coverBeam*sc, stir=8*sc;
  const barR=Math.max(3,10*sc);
  const nBot=b.nm||2, nTop=b.ns||2;
  let s=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:240px;display:block">`;
  s+=`<rect width="${W}" height="${H}" fill="#0a0f1e" rx="6"/>`;
  s+=`<text x="${W/2}" y="14" fill="#a78bfa" font-size="9" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">BEAM CROSS-SECTION</text>`;
  // Concrete body
  s+=`<rect x="${ox}" y="${oy}" width="${bw}" height="${bh}" fill="rgba(71,85,105,0.5)" stroke="#64748b" stroke-width="2" rx="1"/>`;
  // Cover dashed
  s+=`<rect x="${ox+cv}" y="${oy+cv}" width="${bw-2*cv}" height="${bh-2*cv}" fill="none" stroke="#f59e0b" stroke-width="0.5" stroke-dasharray="3,3"/>`;
  // Stirrup
  s+=`<rect x="${ox+cv+stir/2}" y="${oy+cv+stir/2}" width="${bw-2*cv-stir}" height="${bh-2*cv-stir}" fill="none" stroke="#94a3b8" stroke-width="${stir}" stroke-linejoin="round"/>`;
  // Bottom bars (tension — orange)
  const botY=oy+bh-cv-barR;
  for(let i=0;i<nBot;i++){
    const bx=ox+cv+barR+(bw-2*cv-2*barR)*i/Math.max(nBot-1,1);
    s+=`<circle cx="${bx}" cy="${botY}" r="${barR}" fill="#f59e0b" stroke="#fbbf24" stroke-width="1"/>`;
  }
  // Top bars (compression — blue)
  const topY=oy+cv+barR;
  for(let i=0;i<nTop;i++){
    const bx=ox+cv+barR+(bw-2*cv-2*barR)*i/Math.max(nTop-1,1);
    s+=`<circle cx="${bx}" cy="${topY}" r="${barR*0.8}" fill="#38bdf8" stroke="#7dd3fc" stroke-width="1"/>`;
  }
  // Dimensions
  s+=`<line x1="${ox}" y1="${oy+bh+10}" x2="${ox+bw}" y2="${oy+bh+10}" stroke="#94a3b8" stroke-width="0.8"/>`;
  s+=`<text x="${ox+bw/2}" y="${oy+bh+20}" fill="#94a3b8" font-size="8" text-anchor="middle" font-family="JetBrains Mono">${b.b}mm</text>`;
  s+=`<line x1="${ox+bw+10}" y1="${oy}" x2="${ox+bw+10}" y2="${oy+bh}" stroke="#94a3b8" stroke-width="0.8"/>`;
  s+=`<text x="${ox+bw+20}" y="${oy+bh/2+3}" fill="#94a3b8" font-size="8" font-family="JetBrains Mono" transform="rotate(90,${ox+bw+20},${oy+bh/2})">${b.D}mm</text>`;
  // Legend
  s+=`<circle cx="${ox+8}" cy="${oy+bh+35}" r="4" fill="#f59e0b"/><text x="${ox+16}" y="${oy+bh+38}" fill="#f59e0b" font-size="7" font-family="JetBrains Mono">${nBot}-D20 bot (tension)</text>`;
  s+=`<circle cx="${ox+bw/2+10}" cy="${oy+bh+35}" r="3" fill="#38bdf8"/><text x="${ox+bw/2+18}" y="${oy+bh+38}" fill="#38bdf8" font-size="7" font-family="JetBrains Mono">${nTop}-D20 top</text>`;
  s+=`<text x="${ox+8}" y="${oy+bh+50}" fill="#94a3b8" font-size="7" font-family="JetBrains Mono">Stirrups: D8@${b.svd}mm(Lo) / D8@${b.sv}mm(mid) | Cover: ${S.coverBeam}mm</text>`;
  s+='</svg>';
  return`<div class="dg">${s}<div class="dg-cap">Fig: Beam ${b.label} transverse cross-section at midspan</div></div>`;
}

function svgTributaryArea(b){
  const W=440, H=320, padL=55, padT=40, padR=30, padB=55;

  // For transfer beams: use actual beam span L (merged), not stored spX/spY
  const isX = b.dir==='X';
  const beamSpanActual = b.L || (isX ? b.spX||4 : b.spY||3);
  const spX = isX ? beamSpanActual : (b.spX||S.spansX[b.col]||4);
  const spY = isX ? (b.spY||S.spansY[b.row]||3) : beamSpanActual;

  // For transfer beams: use merged span in the relevant direction
  const nCols = Math.min(S.spansX.length, 4);
  const nRows = Math.min(S.spansY.length, 4);
  const beamRow = b.row||0;
  const beamCol = b.col||0;

  // Determine slab type for adjacent bays
  const lx_bay = Math.min(isX ? b.L||spX : spX, isX ? spY : b.L||spY);
  const ly_bay = Math.max(isX ? b.L||spX : spX, isX ? spY : b.L||spY);
  const ratio = ly_bay / Math.max(lx_bay, 0.1);
  const twoWay = ratio < 2.0;

  // Is this beam along the short span?
  const beamSpan = isX ? spX : spY;
  const beamIsShort = beamSpan <= (isX ? spY : spX);

  const maxW = W-padL-padR, maxH = H-padT-padB;
  const scX = Math.min(maxW/(nCols*spX), maxH/(nRows*spY), 52);
  const scY = scX;
  const bW = spX*scX, bH = spY*scY;
  const xs = [], ys = [];
  for(let i=0;i<=nCols;i++) xs.push(padL + i*bW);
  for(let i=0;i<=nRows;i++) ys.push(padT + i*bH);

  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  s += `<rect width="${W}" height="${H}" fill="#0a0f1e" rx="6"/>`;

  // Title
  const slabType = twoWay ? 'TWO-WAY SLAB' : 'ONE-WAY SLAB';
  s += `<text x="${W/2}" y="16" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">BEAM ${b.label} \u2014 ${slabType} LOAD PATTERN (IS 456 Annex D)</text>`;

  // Draw slab panels with load pattern shading
  for(let r=0;r<nRows;r++) for(let c=0;c<nCols;c++){
    const isAdjacentBay = isX
      ? (c===beamCol && (r===beamRow-1||r===beamRow))
      : (r===beamRow && (c===beamCol-1||c===beamCol));

    s += `<rect x="${xs[c]}" y="${ys[r]}" width="${bW}" height="${bH}" fill="${isAdjacentBay?'rgba(15,23,42,0.95)':'rgba(15,23,42,0.8)'}" stroke="${isAdjacentBay?'#475569':'#1e293b'}" stroke-width="${isAdjacentBay?1.2:0.6}"/>`;

    if(isAdjacentBay && twoWay){
      // Draw 45° yield lines showing actual load distribution
      const x1=xs[c], y1=ys[r], x2=xs[c+1], y2=ys[r+1];
      const w=x2-x1, h=y2-y1;
      const hl = Math.min(w,h)/2; // half the shorter dimension

      // 45° lines from corners
      s += `<line x1="${x1}" y1="${y1}" x2="${x1+hl}" y2="${y1+hl}" stroke="#64748b" stroke-width="0.8" stroke-dasharray="3,2"/>`;
      s += `<line x1="${x2}" y1="${y1}" x2="${x2-hl}" y2="${y1+hl}" stroke="#64748b" stroke-width="0.8" stroke-dasharray="3,2"/>`;
      s += `<line x1="${x1}" y1="${y2}" x2="${x1+hl}" y2="${y2-hl}" stroke="#64748b" stroke-width="0.8" stroke-dasharray="3,2"/>`;
      s += `<line x1="${x2}" y1="${y2}" x2="${x2-hl}" y2="${y2-hl}" stroke="#64748b" stroke-width="0.8" stroke-dasharray="3,2"/>`;

      // Shade the tributary zone for THIS beam
      if(isX){
        // X-beam gets triangular load: shade the triangles on top/bottom edges
        const isBayAbove = r===beamRow-1;
        if(isBayAbove){
          // Triangle pointing DOWN (beam is at bottom of this bay)
          s += `<polygon points="${x1},${y2} ${x1+hl},${y2-hl} ${x2-hl},${y2-hl} ${x2},${y2}" fill="rgba(249,115,22,0.25)" stroke="none"/>`;
        } else {
          // Triangle pointing UP (beam is at top of this bay)
          s += `<polygon points="${x1},${y1} ${x1+hl},${y1+hl} ${x2-hl},${y1+hl} ${x2},${y1}" fill="rgba(249,115,22,0.25)" stroke="none"/>`;
        }
      } else {
        // Y-beam gets trapezoidal load: shade left/right edges
        const isBayLeft = c===beamCol-1;
        if(isBayLeft){
          // Trapezoid on right edge of left bay
          s += `<polygon points="${x2},${y1} ${x2-hl},${y1+hl} ${x2-hl},${y2-hl} ${x2},${y2}" fill="rgba(249,115,22,0.25)" stroke="none"/>`;
        } else {
          // Trapezoid on left edge of right bay
          s += `<polygon points="${x1},${y1} ${x1+hl},${y1+hl} ${x1+hl},${y2-hl} ${x1},${y2}" fill="rgba(249,115,22,0.25)" stroke="none"/>`;
        }
      }
    } else if(isAdjacentBay && !twoWay){
      // One-way: shade full half-strip for short-span beam, nothing for long-span
      if(beamIsShort){
        s += `<rect x="${xs[c]}" y="${ys[r]}" width="${bW}" height="${bH}" fill="rgba(249,115,22,0.2)" stroke="none"/>`;
      }
    }
  }

  // Draw the design beam — for transfer beams, span full merged length
  if(isX){
    const y=ys[beamRow];
    // For transfer beam: draw from beamCol to end of merged span
    const x1=xs[beamCol];
    const x2 = b.isTransfer ? (xs[beamCol]+beamSpanActual*((W-padL-padR)/S.spansX.reduce((a,v)=>a+v,0))) : (xs[beamCol+1]||xs[beamCol]+bW);
    const beamColor = b.isTransfer ? '#f59e0b' : '#f59e0b';
    const beamDash = b.isTransfer ? '8,4' : '';
    if(beamDash) s += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${beamColor}" stroke-width="6" stroke-dasharray="${beamDash}" stroke-linecap="round"/>`;
    else s += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${beamColor}" stroke-width="4" stroke-linecap="round"/>`;
    s += `<text x="${(x1+x2)/2}" y="${y-7}" fill="${beamColor}" font-size="9" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">${b.label} (L=${b.L||spX}m${b.isTransfer?' TRANSFER':''})</text>`;
    // Mark floating column position if transfer
    if(b.isTransfer && b.transferPL){
      const maxX=S.spansX.reduce((a,v)=>a+v,0)||12;
      const pw=W-padL-padR;
      const ptX = x1 + b.transferPL.a/maxX*pw;
      s += `<line x1="${ptX}" y1="${y-15}" x2="${ptX}" y2="${y+15}" stroke="#f87171" stroke-width="2" stroke-dasharray="3,2"/>`;
      s += `<text x="${ptX}" y="${y-18}" fill="#f87171" font-size="8" text-anchor="middle" font-family="JetBrains Mono">↓ P_u=${r2(b.transferPL.P_u)}kN</text>`;
    }
  } else {
    const x=xs[beamCol];
    const y1=ys[beamRow];
    const y2 = b.isTransfer ? (ys[beamRow]+beamSpanActual*((H-padT-padB)/S.spansY.reduce((a,v)=>a+v,0))) : (ys[beamRow+1]||ys[beamRow]+bH);
    const beamDash = b.isTransfer ? '8,4' : '';
    if(beamDash) s += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#f59e0b" stroke-width="6" stroke-dasharray="${beamDash}" stroke-linecap="round"/>`;
    else s += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>`;
    s += `<text x="${x+6}" y="${(y1+y2)/2+4}" fill="#f59e0b" font-size="9" font-weight="bold" font-family="JetBrains Mono">${b.label} (L=${b.L||spY}m${b.isTransfer?' TRANSFER':''})</text>`;
    if(b.isTransfer && b.transferPL){
      const maxY=S.spansY.reduce((a,v)=>a+v,0)||9;
      const ph=H-padT-padB;
      const ptY = y1 + b.transferPL.a/maxY*ph;
      s += `<line x1="${x-15}" y1="${ptY}" x2="${x+15}" y2="${ptY}" stroke="#f87171" stroke-width="2" stroke-dasharray="3,2"/>`;
      s += `<text x="${x+18}" y="${ptY+4}" fill="#f87171" font-size="8" font-family="JetBrains Mono">← P_u=${r2(b.transferPL.P_u)}kN</text>`;
    }
  }

  // Column nodes — skip missing/void nodes
  for(let r=0;r<=nRows;r++) for(let c=0;c<=nCols;c++){
    const gridNode = GRID && getNode(r, c);
    if(gridNode && !gridNode.hasColumn) continue; // skip void/removed columns
    s += `<rect x="${xs[c]-5}" y="${ys[r]-5}" width="10" height="10" fill="#1e293b" stroke="#a78bfa" stroke-width="1.5" rx="1"/>`;
  }

  // Equivalent UDL annotation (show what IS 456 formula gives)
  const w_unit = 10; // example per m² for annotation
  let equivLabel = '';
  if(twoWay){
    if(beamIsShort){
      equivLabel = `w_eq = w\u00d7lx/3 = w\u00d7${r2(lx_bay)}/3 (triangular\u2192equiv UDL)`;
    } else {
      const r2v = lx_bay/ly_bay;
      equivLabel = `w_eq = w\u00d7lx/3\u00d7(3-(lx/ly)\u00b2)/2 (trapezoidal\u2192equiv UDL)`;
    }
  } else {
    equivLabel = beamIsShort
      ? `w_eq = w\u00d7lx/2 (one-way: full rectangular load)`
      : `w_eq \u2248 0 (one-way: negligible load on long-span beam)`;
  }
  s += `<text x="${W/2}" y="${H-38}" fill="#38bdf8" font-size="8" text-anchor="middle" font-family="JetBrains Mono">${equivLabel}</text>`;
  s += `<text x="${W/2}" y="${H-26}" fill="#475569" font-size="8" text-anchor="middle" font-family="JetBrains Mono">IS 456 Annex D | ly/lx=${r2(ratio)} \u2192 ${twoWay?'Two-way':'One-way'} slab</text>`;

  // Span dims — bottom
  for(let c=0;c<nCols;c++){
    const y0=ys[nRows]+10;
    s += `<line x1="${xs[c]}" y1="${y0}" x2="${xs[c+1]}" y2="${y0}" stroke="#f59e0b" stroke-width="0.8"/>`;
    s += `<line x1="${xs[c]}" y1="${y0-3}" x2="${xs[c]}" y2="${y0+3}" stroke="#f59e0b" stroke-width="0.8"/>`;
    s += `<line x1="${xs[c+1]}" y1="${y0-3}" x2="${xs[c+1]}" y2="${y0+3}" stroke="#f59e0b" stroke-width="0.8"/>`;
    s += `<text x="${(xs[c]+xs[c+1])/2}" y="${y0+11}" fill="#f59e0b" font-size="9" text-anchor="middle" font-family="JetBrains Mono">${spX}m</text>`;
  }
  // Span dims — left
  for(let r=0;r<nRows;r++){
    const x0=padL-12;
    s += `<line x1="${x0}" y1="${ys[r]}" x2="${x0}" y2="${ys[r+1]}" stroke="#f59e0b" stroke-width="0.8"/>`;
    s += `<line x1="${x0-3}" y1="${ys[r]}" x2="${x0+3}" y2="${ys[r]}" stroke="#f59e0b" stroke-width="0.8"/>`;
    s += `<line x1="${x0-3}" y1="${ys[r+1]}" x2="${x0+3}" y2="${ys[r+1]}" stroke="#f59e0b" stroke-width="0.8"/>`;
    s += `<text x="${x0-14}" y="${(ys[r]+ys[r+1])/2+4}" fill="#f59e0b" font-size="9" text-anchor="middle" font-family="JetBrains Mono" transform="rotate(-90,${x0-14},${(ys[r]+ys[r+1])/2})">${spY}m</text>`;
  }

  // Legend
  const ly0 = ys[nRows]+24;
  s += `<polygon points="10,${ly0+8} 22,${ly0} 22,${ly0+8}" fill="rgba(249,115,22,0.25)" stroke="#f97316" stroke-width="1"/>`;
  s += `<text x="26" y="${ly0+8}" fill="#f97316" font-size="9" font-family="JetBrains Mono">${twoWay?(beamIsShort?'Triangular load zone':'Trapezoidal load zone'):'Rectangular load zone'}</text>`;
  s += `<line x1="200" y1="${ly0+4}" x2="212" y2="${ly0+4}" stroke="#f59e0b" stroke-width="3"/>`;
  s += `<text x="216" y="${ly0+8}" fill="#f59e0b" font-size="9" font-family="JetBrains Mono">Design beam</text>`;
  if(twoWay){
    s += `<line x1="300" y1="${ly0+4}" x2="312" y2="${ly0+4}" stroke="#64748b" stroke-width="1" stroke-dasharray="3,2"/>`;
    s += `<text x="316" y="${ly0+8}" fill="#64748b" font-size="9" font-family="JetBrains Mono">45\u00b0 yield lines</text>`;
  }

  s += '</svg>';

  const loadDesc = twoWay
    ? (beamIsShort
        ? `Short-span beam gets triangular load. Equivalent UDL = w × lx/3 = w × ${r2(lx_bay)}/3.`
        : `Long-span beam gets trapezoidal load. Equivalent UDL = w × lx/3 × (3-(lx/ly)²)/2.`)
    : (beamIsShort
        ? `One-way slab: short-span beam gets full rectangular load = w × lx/2.`
        : `One-way slab: long-span beam carries negligible slab load.`);

  return`<div class="dg">${s}<div class="dg-cap">IS 456 Annex D load pattern for beam ${b.label}. ${loadDesc}</div></div>`;
}
function beamFailureExplanation(b){
  if(b.deflOK && b.shearSafe) return '';
  let html='<div style="margin-top:10px;padding:12px;background:rgba(248,113,113,0.06);border:1.5px solid rgba(248,113,113,0.3);border-radius:8px">';
  html+='<div style="font-size:12px;font-weight:700;color:#f87171;margin-bottom:8px">⚠ WHY IS THIS BEAM FAILING?</div>';
  if(!b.deflOK){
    const dNeed=Math.ceil(b.D*Math.pow(b.dfl/b.dall,1/3)/25+1)*25;
    html+=`<div style="margin-bottom:8px;padding:8px 10px;background:rgba(248,113,113,0.08);border-radius:6px;font-size:11px;line-height:1.8;color:#fca5a5">
      <strong>Deflection failure:</strong> The beam bends ${r2(b.dfl)}mm under load, but the IS 456 limit is ${r2(b.dall)}mm (L/${b.isCantilever?'150':'250'}).
      This means occupants would see visible sagging, and floor tiles or plaster on the ceiling below would crack.<br><br>
      <strong>Root cause:</strong> The beam depth (D=${b.D}mm) is not stiff enough for a ${b.L}m span. Stiffness goes as D³ — so a small increase in D gives a big reduction in deflection.<br><br>
      <strong>How to fix:</strong><br>
      1. <strong style="color:#34d399">Increase D to ${dNeed}mm</strong> — most effective. Deflection reduces as D³ so ${dNeed-b.D}mm more depth cuts deflection dramatically.<br>
      2. Add an intermediate column to halve the span (deflection reduces 16×).<br>
      3. Make end joints continuous (reduces midspan moment 30-40%).<br>
      4. Use higher grade concrete (M${S.fck+5}) — increases Ec by ~10%.
    </div>`;
  }
  if(!b.shearSafe){
    html+=`<div style="margin-bottom:8px;padding:8px 10px;background:rgba(248,113,113,0.08);border-radius:6px;font-size:11px;line-height:1.8;color:#fca5a5">
      <strong>Shear failure:</strong> Nominal shear stress τv = ${r2(b.tv)} N/mm² exceeds τc_max = ${r2(b.tcmax)} N/mm² for M${S.fck} concrete.
      This is a brittle failure mode — the beam can snap suddenly without warning. It MUST be fixed.<br><br>
      <strong>Root cause:</strong> The cross-section (${b.b}×${b.D}) is too small for the end shear force of ${r2(b.RA)} kN.<br><br>
      <strong>How to fix:</strong><br>
      1. <strong style="color:#34d399">Increase beam width b</strong> — τv = V/(b×d), so wider beam directly reduces shear stress.<br>
      2. <strong>Increase beam depth D</strong> — also reduces τv and increases d.<br>
      3. Both together: increase to ${Math.max(b.b+50,Math.ceil(b.b*1.2/25)*25)}×${b.D+50}mm minimum.
    </div>`;
  }
  html+='</div>';
  return html;
}

function beamDetail(b){
  if(!b)return'';
  const ok=b.deflOK&&b.shearSafe;
  const flrLbl=b.isRoof?'Roof':`Floor ${b.floor}`;
  return`
<div style="border:1px solid ${ok?'rgba(249,115,22,0.3)':'rgba(248,113,113,0.4)'};border-radius:8px;padding:12px;margin-top:4px">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">
    <div style="font-size:13px;font-weight:800;color:var(--orange)">${b.label}</div>
    <div style="font-size:10px;color:var(--txt3)">${flrLbl} | ${b.dir==='X'?'X-direction':'Y-direction'} | L=${b.L}m</div>
    ${b.isCantilever?'<span style="padding:2px 7px;background:rgba(52,211,153,0.1);border:1px solid #34d399;border-radius:4px;font-size:9px;color:#34d399">CANTILEVER</span>':''}
    ${b.isTransfer?'<span style="padding:2px 7px;background:rgba(245,158,11,0.1);border:1px solid #f59e0b;border-radius:4px;font-size:9px;color:#f59e0b">TRANSFER</span>':''}
    ${b.isSecondary?'<span style="padding:2px 7px;background:rgba(139,92,246,0.1);border:1px solid #8b5cf6;border-radius:4px;font-size:9px;color:#8b5cf6">SECONDARY</span>':''}
  </div>
  ${vd(ok,ok?'All checks PASS — beam is safe':'One or more checks FAIL — revision required')}
  <div style="font-size:10px;color:var(--txt3);margin-bottom:10px">End conditions: <strong style="color:var(--txt2)">${b.endCond||'auto'}</strong></div>

  ${b.isTransfer?`
  <div style="margin-bottom:12px;padding:12px;background:rgba(245,158,11,0.06);border:1.5px solid rgba(245,158,11,0.4);border-radius:8px">
    <div style="font-size:12px;font-weight:800;color:#f59e0b;margin-bottom:8px">⚠ TRANSFER BEAM — Read This First</div>
    <div style="font-size:10px;color:#fbbf24;line-height:1.8;margin-bottom:8px">
      <strong>What is a transfer beam?</strong><br>
      A transfer beam carries the load of a <em>floating column</em> — a column that has no support below it. This happens when a column is removed for architectural reasons (open plan, parking, lobby). The transfer beam must carry the entire load from all floors above the missing column, delivered as a heavy <strong>point load</strong> at a specific position along its span, in addition to its normal slab UDL load.
    </div>
    ${b.transferPL?`
    <div style="font-size:10px;color:#94a3b8;line-height:1.8;background:#0a0f1e;padding:8px;border-radius:6px;margin-bottom:8px">
      <strong style="color:#f59e0b">Point Load from floating column:</strong><br>
      Service load P_s = <strong>${r2(b.transferPL.P_s)} kN</strong> (${b.transferPL.floorsAbove} floors × ${r2(b.transferPL.slabArea)}m² tributary area)<br>
      Factored load P_u = 1.5 × ${r2(b.transferPL.P_s)} = <strong style="color:#f59e0b">${r2(b.transferPL.P_u)} kN</strong><br>
      Position: <strong>${r2(b.transferPL.a)}m from left end</strong>, ${r2(b.transferPL.b)}m from right end (L=${b.L}m)<br>
      Additional moment: P_u × a × b / L = ${r2(b.transferPL.P_u)} × ${r2(b.transferPL.a)} × ${r2(b.transferPL.b)} / ${b.L} = <strong>${r2(b.transferPL.P_u*b.transferPL.a*b.transferPL.b/b.L)} kN.m</strong>
    </div>`:``}
    <div style="font-size:9px;color:#92400e;padding:6px 10px;background:rgba(245,158,11,0.08);border-radius:4px">
      ⚠ <strong>IMPORTANT:</strong> Transfer beam design is approximate. The actual design must account for:<br>
      • Deflection under point load (much larger than UDL beams)<br>
      • Differential settlement at supports<br>
      • Connection detailing at the floating column<br>
      • Seismic considerations — IS 1893 requires special detailing<br>
      <strong>Always verify transfer beam design with a qualified structural engineer before construction.</strong>
    </div>
  </div>`:``}

  ${sb('B-1','Beam Size',`
    ${fm('D (start at L×1000/12 = '+r2(b.L*1000)+'/12, iterate up until Mu≤Mulim & δ≤δallow)',b.D+' mm','')}
    ${fm('b = max(200, 0.4D) = max(200, '+r0(0.4*b.D)+')',b.b+' mm','IS 456 Cl 26.5.1.2')}
    ${fm('d = D - cover - stirrup - half bar = '+b.D+' - '+S.coverBeam+' - 8 - 10',b.d+' mm','')}
  `,'or')}

  ${sb('B-2','Loading',`
    ${svgTributaryArea(b)}
    ${fm('Tributary width from grid (slab bays only)',r2(b.trib)+' m','')}
    ${(()=>{
      const lx=Math.min(b.spX||S.spansX[b.col]||4, b.spY||S.spansY[b.row]||3);
      const ly=Math.max(b.spX||S.spansX[b.col]||4, b.spY||S.spansY[b.row]||3);
      const r=ly/lx, twoWay=r<2;
      const beamSpan=b.dir==='X'?(b.spX||S.spansX[b.col]||4):(b.spY||S.spansY[b.row]||3);
      const isShort=beamSpan<=Math.max(b.spX||S.spansX[b.col]||4,b.spY||S.spansY[b.row]||3);
      const wBase=r2(RES.slab.DL_sl+S.floorFinish+S.partitions+(b.isRoof?S.udlRoof:S.udlLL));
      let formula='', result='';
      if(twoWay && isShort){
        formula=`w_slab = w × lx/3 = ${wBase} × ${r2(lx)}/3`;
        result=r2(b.wslab)+' kN/m (triangular → equiv UDL, IS 456 Annex D)';
      } else if(twoWay && !isShort){
        formula=`w_slab = w × lx/3 × (3-(lx/ly)²)/2 = ${wBase} × ${r2(lx)}/3 × (3-${r2((lx/ly)**2)})/2`;
        result=r2(b.wslab)+' kN/m (trapezoidal → equiv UDL, IS 456 Annex D)';
      } else if(isShort){
        formula=`w_slab = w × lx/2 = ${wBase} × ${r2(lx)}/2`;
        result=r2(b.wslab)+' kN/m (one-way slab: rectangular, IS 456 Cl 24.1)';
      } else {
        formula=`w_slab ≈ 0 (one-way slab: long-span beam, IS 456 Cl 24.1)`;
        result=r2(b.wslab)+' kN/m';
      }
      return fm(formula, result, '');
    })()}
    ${fm('w_sw (self-weight) = '+b.b+'/1000 × '+b.D+'/1000 × 25',r2(b.wsw)+' kN/m','')}
    ${b.ww>0?fm('w_wall (perimeter beam)',r2(b.ww)+' kN/m',''):''}
    ${fm('wu = 1.5 × ('+r2(b.wslab)+' + '+r2(b.wsw)+(b.ww>0?' + '+r2(b.ww):'')+') factored',r2(b.wu)+' kN/m','IS 456 Table 18')}
  `,'or')}

  ${sb('B-3','Bending Moment & Shear Force Diagrams',`
    ${svgBeamBMD_SFD(b)}
    ${sb('B-3a','Longitudinal Section — Bar Layout & Stirrups',svgBeamLongitudinal(b),'or')}

    <div class="cp or" style="font-size:10px;line-height:2.0;margin-bottom:8px">
      <strong>Formula:</strong> Mmax = α × wu × L²<br>
      <strong>Where:</strong><br>
      &nbsp;&nbsp;α = moment coefficient = ${r2(b.isCantilever?0.5:b.Mmax/(b.wu*b.L*b.L))} (${b.isCantilever?'cantilever = 0.5':'IS 456 Table 12'})<br>
      &nbsp;&nbsp;wu = ${r2(b.wu)} kN/m (factored UDL = 1.5 × total service load)<br>
      &nbsp;&nbsp;L = ${b.L} m (effective span of beam)<br>
      <strong>Result:</strong> Mmax = ${r2(b.isCantilever?0.5:b.Mmax/(b.wu*b.L*b.L))} × ${r2(b.wu)} × ${b.L}² = <strong style="color:var(--orange)">${r2(b.Mmax)} kN.m</strong><br><br>
      <strong>Formula:</strong> Mulim = Mf × fck × b × d² / 10⁶<br>
      <strong>Where:</strong><br>
      &nbsp;&nbsp;Mf = ${r2(b.Mulim*1e6/(S.fck*b.b*b.d*b.d))} (limiting factor for Fe${S.fy} steel from IS 456 Annex G)<br>
      &nbsp;&nbsp;fck = ${S.fck} N/mm² (concrete grade M${S.fck})<br>
      &nbsp;&nbsp;b = ${b.b} mm (beam width)<br>
      &nbsp;&nbsp;d = ${b.d} mm (effective depth)<br>
      <strong>Result:</strong> Mulim = ${r2(b.Mulim*1e6/(S.fck*b.b*b.d*b.d))} × ${S.fck} × ${b.b} × ${b.d}² / 10⁶ = <strong style="color:var(--orange)">${r2(b.Mulim)} kN.m</strong>
    </div>
    ${vd(b.Mmax<=b.Mulim,'Mmax ('+r2(b.Mmax)+') '+(b.Mmax<=b.Mulim?'≤':'>')+' Mulim ('+r2(b.Mulim)+') → '+(b.Mmax<=b.Mulim?'Singly reinforced OK':'DOUBLY reinforced needed — or increase depth'),b.momUtil)}
  `,'or')}

  ${sb('B-4','Reinforcement & Cross-Section',`
    ${svgBeamCrossSection(b)}
    <div class="cp or" style="font-size:10px;line-height:2.0;margin-bottom:8px">
      <strong>Formula:</strong> Ast = Mu / (0.87 × fy × d × [1 − Mu/(fck × b × d² × 0.48)])<br>
      <strong>Where:</strong><br>
      &nbsp;&nbsp;Mu = ${r2(b.Mmax)} kN.m (design bending moment)<br>
      &nbsp;&nbsp;fy = ${S.fy} N/mm² (steel yield strength Fe${S.fy})<br>
      &nbsp;&nbsp;d = ${b.d} mm (effective depth)<br>
      &nbsp;&nbsp;fck = ${S.fck} N/mm² (concrete grade M${S.fck})<br>
      &nbsp;&nbsp;b = ${b.b} mm (beam width)<br>
      <strong>Result:</strong> Ast_required = <strong style="color:var(--orange)">${r0(b.Am)} mm²</strong>
    </div>
    ${fm('No. of T20 bars = Ast/π×100 = '+r0(b.Am)+'/314',b.nm+' bars (Ap='+r0(b.Ap)+' mm²)','IS 456 Cl 26.5.1.2')}
    ${b.ns>0?fm('Top bars (at support — compression/hogging)',b.ns+' bars',''):''}
    ${fm('pt = Ap/(b×d) × 100 = '+r0(b.Ap)+'/('+b.b+'×'+b.d+')×100',r2(b.pt)+'%','')}
    ${fm('Ld = 0.87fy×φ/(4τbd) = 0.87×'+S.fy+'×20/(4×1.6×1.25×√'+S.fck+')',r0(b.Ld)+' mm','IS 456 Cl 26.2')}
  `,'or')}

  ${sb('B-5','Shear Design',`
    <div class="cp or" style="font-size:10px;line-height:2.0;margin-bottom:8px">
      <strong>Formula:</strong> τv = Vu / (b × d)<br>
      <strong>Where:</strong><br>
      &nbsp;&nbsp;Vu = end shear = ${b.isCantilever?'wu × L':'0.55 × wu × L'} = ${b.isCantilever?r2(b.wu)+'×'+b.L:'0.55×'+r2(b.wu)+'×'+b.L} = <strong>${r2(b.RA)} kN</strong><br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(${b.isCantilever?'cantilever: full wu×L at support':'IS 456 Table 12 shear coefficient 0.55 for continuous beam'})<br>
      &nbsp;&nbsp;b = ${b.b} mm (beam width)<br>
      &nbsp;&nbsp;d = ${b.d} mm (effective depth)<br>
      <strong>Result:</strong> τv = ${r2(b.RA)} × 1000 / (${b.b} × ${b.d}) = <strong style="color:var(--orange)">${r2(b.tv)} N/mm²</strong><br><br>
      &nbsp;&nbsp;τc = ${r2(b.tc)} N/mm² (concrete shear capacity from IS 456 Table 19 at pt=${r2(b.pt)}%)<br>
      &nbsp;&nbsp;τc,max = ${r2(b.tcmax)} N/mm² (maximum limit for M${S.fck} from IS 456 Table 20)
    </div>
    ${vd(b.shearSafe,'τv ('+r2(b.tv)+') '+(b.shearSafe?'≤':'>')+' τc,max ('+r2(b.tcmax)+') → '+(b.shearSafe?'Shear OK':'FAIL — increase b or D'),b.shearUtil)}
    ${fm('Stirrups (confinement zone Lo): D8@'+b.svd+'mm | Midspan: D8@'+b.sv+'mm','Lo=max(2D,L/4)='+r0(Math.max(2*b.D,b.L*1000/4))+'mm','IS 13920 Cl 6.3.5')}
  `,'or')}

  ${sb('B-6','Deflection',`
    ${fm('δ = 5wu×L⁴/(384EI) = 5×'+r2(b.wu)+'×'+b.L+'⁴/(384×'+r2(b.EI)+')',r2(b.dfl)+' mm','')}
    ${fm('δallow = L/'+( b.isCantilever?'150':'250')+' = '+b.L*1000+'/'+(b.isCantilever?'150':'250'),r2(b.dall)+' mm','IS 456 Cl 23.2')}
    ${vd(b.deflOK,'δ ('+r2(b.dfl)+') '+(b.deflOK?'≤':'>')+' δallow ('+r2(b.dall)+') → '+(b.deflOK?'OK':'FAIL — increase D'),b.deflUtil)}
  `,'or')}

  ${(()=>{
    if(!RES.allBeams) return '';
    const sameBeams=RES.allBeams.filter(x=>x.row===b.row&&x.col===b.col&&x.dir===b.dir);
    if(sameBeams.length<=1) return '';
    const rows=sameBeams.map(fb=>{
      const ok=fb.deflOK&&fb.shearSafe;
      const isAct=fb.floor===b.floor;
      return '<tr style="background:'+(isAct?'rgba(249,115,22,0.08)':'transparent')+'">'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);font-weight:'+(isAct?'700':'400')+';color:var(--orange)">'+fb.floorLabel+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);text-align:right">'+(fb.isRoof?S.udlRoof:S.udlLL)+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);text-align:right">'+r2(fb.wu)+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);text-align:right">'+r2(fb.Mmax)+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);text-align:center">'+fb.D+'×'+fb.b+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);text-align:center">'+fb.nm+' D20</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);text-align:center">D8@'+fb.sv+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);color:'+(ok?'#34d399':'#f87171')+';font-weight:700">'+(ok?'OK':'FAIL')+'</td>'
        +'</tr>';
    }).join('');
    const tblHtml='<table style="width:100%;border-collapse:collapse;font-size:10px">'
      +'<tr style="background:var(--bg1)">'
      +'<th style="padding:4px 8px;text-align:left;border:1px solid var(--b1);color:var(--txt3)">Floor</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">LL kN/m²</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">wu kN/m</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">Mmax kN.m</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">D×b mm</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">Bot. bars</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">Stirrups</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">Status</th>'
      +'</tr>'+rows+'</table>';
    const note='<div style="font-size:9px;color:var(--txt3);margin-top:6px">💡 Same section (D×b) on all floors — formwork reuse. Steel reduces on upper floors and roof (lower LL, no wall load).</div>';
    return sb('B-7','Floor-by-Floor Beam Summary (same span, varying load)',
      '<div style="font-size:10px;color:var(--txt3);margin-bottom:6px">D×b governed by deflection — constant on all floors. Load, steel and stirrups vary.</div>'+tblHtml+note,'or');
  })()}
  ${beamFailureExplanation(b)}

  ${(()=>{
    // ── FEATURE B: Member Override Panel ──
    const ovrKey = `B:${b.row}:${b.col}:${b.dir}`;
    const hasOvr = window._memberOverrides && window._memberOverrides[ovrKey];
    const recD = !b.deflOK ? Math.ceil(b.D*Math.pow(b.dfl/b.dall,1/3)/25+1)*25 : null;
    const recB = !b.shearSafe ? Math.max(b.b+50, Math.ceil(b.b*1.25/25)*25) : null;
    const ovr = hasOvr ? window._memberOverrides[ovrKey] : null;

    return `<div style="margin-top:12px;padding:12px;background:rgba(56,189,248,0.05);border:1.5px solid rgba(56,189,248,0.2);border-radius:8px">
      <div style="font-size:11px;font-weight:700;color:#38bdf8;margin-bottom:8px">🔧 Try Different Size — Re-analyse with Override</div>
      <div style="font-size:10px;color:#94a3b8;margin-bottom:10px">
        Change the size of beam <strong style="color:#f59e0b">${b.label}</strong> and see how the full building responds.
        ${!b.deflOK||!b.shearSafe?`<span style="color:#34d399">Recommended fix: D=${recD||b.D}mm${recB?', b='+recB+'mm':''}</span>`:''}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:10px">
        <div>
          <div style="font-size:9px;color:#64748b;margin-bottom:3px">Depth D (mm)</div>
          <input id="ovr_bD_${ovrKey.replace(/:/g,'_')}" type="number" min="200" max="1000" step="25"
            value="${ovr?ovr.D:b.D}"
            style="width:90px;padding:6px 8px;background:#0f172a;border:1px solid ${!b.deflOK?'#f87171':'#334155'};border-radius:6px;color:#f1f5f9;font-size:11px;font-family:JetBrains Mono"/>
          ${recD?`<div style="font-size:8px;color:#34d399;margin-top:2px">Recommended: ${recD}mm</div>`:''}
        </div>
        <div>
          <div style="font-size:9px;color:#64748b;margin-bottom:3px">Width b (mm)</div>
          <input id="ovr_bB_${ovrKey.replace(/:/g,'_')}" type="number" min="150" max="600" step="25"
            value="${ovr?ovr.b:b.b}"
            style="width:90px;padding:6px 8px;background:#0f172a;border:1px solid ${!b.shearSafe?'#f87171':'#334155'};border-radius:6px;color:#f1f5f9;font-size:11px;font-family:JetBrains Mono"/>
          ${recB?`<div style="font-size:8px;color:#34d399;margin-top:2px">Recommended: ${recB}mm</div>`:''}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${recD||recB?`<button onclick="
            document.getElementById('ovr_bD_${ovrKey.replace(/:/g,'_')}').value=${recD||b.D};
            document.getElementById('ovr_bB_${ovrKey.replace(/:/g,'_')}').value=${recB||b.b};
          " style="padding:6px 12px;background:rgba(52,211,153,0.12);border:1px solid #34d399;border-radius:6px;color:#34d399;cursor:pointer;font-size:10px;font-weight:700">
            ✓ Use Recommended
          </button>`:''}
          <button onclick="(function(){
            const k='${ovrKey}';
            const D=parseInt(document.getElementById('ovr_bD_${ovrKey.replace(/:/g,'_')}').value);
            const bw=parseInt(document.getElementById('ovr_bB_${ovrKey.replace(/:/g,'_')}').value);
            if(!window._memberOverrides) window._memberOverrides={};
            window._memberOverrides[k]={D,b:bw};
            runWithOverrides('Beam ${b.label}: D→'+D+'mm, b→'+bw+'mm');
          })()" style="padding:6px 14px;background:rgba(56,189,248,0.12);border:1px solid #38bdf8;border-radius:6px;color:#38bdf8;cursor:pointer;font-size:10px;font-weight:700">
            ⚡ Re-analyse
          </button>
          ${hasOvr?`<button onclick="delete window._memberOverrides['${ovrKey}'];runWithOverrides('Reset ${b.label}')" style="padding:6px 12px;background:transparent;border:1px solid #64748b;border-radius:6px;color:#64748b;cursor:pointer;font-size:10px">
            ↺ Reset to auto
          </button>`:''}
        </div>
      </div>
      ${hasOvr?`<div style="font-size:9px;padding:4px 10px;background:rgba(249,115,22,0.1);border-radius:4px;color:#f97316">⚠ This beam is using a student override (D=${ovr.D}mm, b=${ovr.b}mm). Auto-design is disabled for this beam.</div>`:''}
    </div>`;
  })()}
</div>`;
}


// ================================================================
// COLUMNS — floor selector + node selector
// ================================================================
_colFloor=1, _colNodeIdx=0;

function secColumns(){
  if(!RES.allCols||RES.allCols.length===0)return'<div class="card">No column data.</div>';

  const allFloors=[...new Set(RES.allCols.map(c=>c.floor))].sort((a,b)=>a-b);
  if(!allFloors.includes(_colFloor)) _colFloor=allFloors[0];

  const floorCols=RES.allCols.filter(c=>c.floor===_colFloor);
  // Sort by row then col
  floorCols.sort((a,b)=>a.row-b.row||a.col-b.col);
  if(_colNodeIdx>=floorCols.length) _colNodeIdx=0;
  const col=floorCols[_colNodeIdx];

  const floorTabs=allFloors.map(f=>{
    const lbl=f===S.numFloors?'Roof':`F${f}`;
    const fCols=RES.allCols.filter(c=>c.floor===f);
    const allOk=fCols.every(c=>c.safe);
    return`<button onclick="_colFloor=${f};window._colFloor=${f};_colNodeIdx=0;showSec('columns')"
      style="padding:5px 12px;border-radius:6px;border:1px solid ${_colFloor===f?'#a78bfa':'var(--b1)'};
      background:${_colFloor===f?'rgba(167,139,250,0.12)':'transparent'};
      color:${_colFloor===f?'#a78bfa':allOk?'var(--txt3)':'#f87171'};cursor:pointer;font-size:10px;font-weight:700">
      ${lbl} ${allOk?'':'⚠'}
    </button>`;
  }).join('');

  const safe_cnt=floorCols.filter(c=>c.safe).length;
  const fail_cnt=floorCols.length-safe_cnt;

  // Build column node grid (like a plan view selector)
  const ny=GRID.ny, nx=GRID.nx;
  // Build column grid plan: (nx+2) columns = 1 row-label + (nx+1) node cells
  let nodeGrid='<div style="display:inline-grid;gap:3px;grid-template-columns:repeat('+(nx+2)+',auto);margin:6px 0">';
  // Header: empty corner + column numbers 1..(nx+1)
  nodeGrid+='<div></div>'; // corner spacer
  for(let c=0;c<=nx;c++) nodeGrid+=`<div style="text-align:center;font-size:9px;color:#38bdf8;padding:2px 6px;font-weight:700">${c+1}</div>`;
  // Rows
  for(let r=0;r<=ny;r++){
    // Row label: A, B, C...
    nodeGrid+=`<div style="font-size:9px;color:#38bdf8;padding:2px 6px;font-weight:700;align-self:center">${String.fromCharCode(65+r)}</div>`;
    for(let c=0;c<=nx;c++){
      const node=GRID&&GRID.nodes.find(n=>n.row===r&&n.col===c);
      const isCol=node&&(node.hasColumn||node.isWall);
      // Find result by row+col (unique per node)
      const colResult=isCol?floorCols.find(fc=>fc.row===r&&fc.col===c):null;
      const globalIdx=colResult?floorCols.indexOf(colResult):-1;
      const isActive=globalIdx>=0&&globalIdx===_colNodeIdx;
      const ok=colResult?colResult.safe!==false:true;
      const lbl=colResult?(colResult.baseLabel||String.fromCharCode(65+r)+(c+1)):(isCol?'?':'');
      if(!isCol){
        nodeGrid+=`<div style="width:34px;height:34px;border:1px dashed #1e293b;border-radius:4px;opacity:0.25"></div>`;
      } else if(!colResult){
        // Column node exists in GRID but no design result — show greyed label
        nodeGrid+=`<div style="width:34px;height:34px;border:1px dashed #64748b;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:7px;color:#64748b">${String.fromCharCode(65+r)}${c+1}</div>`;
      } else {
        nodeGrid+=`<button onclick="_colNodeIdx=${globalIdx};showSec('columns')"
          style="width:34px;height:34px;border-radius:4px;cursor:pointer;font-size:8px;font-weight:700;
          border:1.5px solid ${isActive?'#0a0f1e':(ok?'#a78bfa':'#f87171')};
          background:${isActive?'rgba(167,139,250,0.35)':(ok?'rgba(167,139,250,0.1)':'rgba(248,113,113,0.12)')};
          color:${isActive?'#0a0f1e':(ok?'#a78bfa':'#f87171')}">
          ${lbl}
        </button>`;
      }
    }
  }
  nodeGrid+='</div>';

  return`
<div class="card vi">
  <div class="ct vi">🏛 Column Design — IS 456 Cl 39 + IS 13920 Cl 7</div>

  <div style="margin-bottom:10px">
    <div style="font-size:10px;font-weight:700;color:var(--txt3);margin-bottom:5px">SELECT FLOOR (column carries load of floors above)</div>
    <div style="display:flex;flex-wrap:wrap;gap:5px">${floorTabs}</div>
  </div>

  <div style="padding:8px 12px;background:var(--bg1);border:1px solid var(--b1);border-radius:8px;margin-bottom:10px;font-size:10px">
    Floor F${_colFloor}: <strong>${floorCols.length}</strong> columns —
    <span style="color:#34d399">${safe_cnt} safe</span>
    ${fail_cnt?`<span style="color:#f87171"> | ${fail_cnt} FAIL</span>`:''}
  </div>

  <div style="margin-bottom:12px">
    <div style="font-size:10px;font-weight:700;color:var(--txt3);margin-bottom:5px">SELECT COLUMN (grid plan view)</div>
    <div style="overflow-x:auto">${nodeGrid}</div>
    <div style="font-size:9px;color:var(--txt3);margin-top:4px">Purple = safe | Red = fail | White border = selected</div>
  </div>

  ${col?colDetail(col):'<div style="padding:12px;color:var(--txt3)">Select a column in the grid above</div>'}
</div>`;
}

function colDetail(c){
  if(!c)return'';
  const ok=c.safe;
  return`
<div style="border:1px solid ${ok?'rgba(167,139,250,0.3)':'rgba(248,113,113,0.4)'};border-radius:8px;padding:12px">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">
    <div style="font-size:13px;font-weight:800;color:#a78bfa">${c.label}</div>
    <div style="font-size:10px;color:var(--txt3)">
      ${c.corner?'Corner column':c.edge?'Edge column':'Interior column'} |
      Grid: Row ${String.fromCharCode(65+c.row)}, Col ${c.col+1} |
      Supports ${c.floorsAbove} floor(s) above
    </div>
  </div>
  ${vd(ok,ok?'SAFE — Pu('+r2(c.Pu)+'kN) ≤ Pcap('+r2(c.Pcap)+'kN)':'UNSAFE — Pu('+r2(c.Pu)+'kN) > Pcap('+r2(c.Pcap)+'kN) — REVISE',c.Pu/c.Pcap)}

  ${sb('C-1','Tributary Area & Axial Load',`
    ${svgTribArea(c.corner?'corner':c.edge?'edge':'interior', S.spansX[c.col]||4, S.spansY[c.row]||3, c.row, c.col, GRID.ny, GRID.nx)}
    ${fm('Slab trib area (slab bays only, voids excluded)',r2(c.ta)+' m²','')}
    ${c.perimLen>0?fm('Perimeter beam length (wall load)',r2(c.perimLen)+' m',''):''}
    ${fm('Ps per floor = DL_tot×area + LL×area×0.25 + wallLoad×perimLen',r2(c.Ps/c.floorsAbove)+' kN/floor','')}
    ${fm('Ps = Ps_per_floor × '+c.floorsAbove+' floors above',r2(c.Ps)+' kN','')}
    ${fm('Pu = 1.5 × Ps',r2(c.Pu)+' kN','IS 456 Cl 18.2')}
  `,'vi')}

  ${sb('C-2','Column Size — Step-by-Step',`
    <div class="cp vi" style="margin-bottom:10px;font-size:10px;line-height:2.0">
      <strong>Formula:</strong> Required Ag = Pu × 1000 / (0.4·fck + 0.008·(0.67·fy − 0.4·fck))<br>
      <strong>Where:</strong><br>
      &nbsp;&nbsp;Pu = ${r2(c.Pu)} kN (factored axial load = 1.5 × ${r2(c.Ps)} kN service)<br>
      &nbsp;&nbsp;fck = ${S.fck} N/mm² (concrete grade M${S.fck})<br>
      &nbsp;&nbsp;fy = ${S.fy} N/mm² (steel grade Fe${S.fy})<br>
      &nbsp;&nbsp;0.4·fck = ${r2(0.4*S.fck)} N/mm²<br>
      &nbsp;&nbsp;0.67·fy = ${r2(0.67*S.fy)} N/mm²<br>
      <strong>Result:</strong> Ag = ${r2(c.Pu)}×1000 / (${r2(0.4*S.fck)} + 0.008×(${r2(0.67*S.fy)} − ${r2(0.4*S.fck)})) = <strong style="color:#a78bfa">${r0(c.Ag)} mm²</strong>
    </div>
    ${fm('Size = √'+r0(c.Ag)+' rounded up to 25mm, min 300mm (IS 13920)',c.size+'×'+c.size+' mm','IS 13920 Cl 7.1')}
    ${fm('leff = 0.65×H = 0.65×'+r2(S.floorHt*1000),r0(c.leff)+' mm','IS 456 Table 28')}
    ${fm('Slenderness = leff/size = '+r0(c.leff)+'/'+c.size,r2(c.lex),'IS 456 Cl 25.1')}
    ${vd(c.short,c.lex+(c.short?' ≤ 12 → SHORT column OK':' > 12 → LONG column — additional moment required'))}
  `,'vi')}

  ${sb('C-3','Reinforcement — Step-by-Step (IS 456 Cl 39.3)',`
    <div class="cp vi" style="margin-bottom:10px;font-size:10px;line-height:2.0">
      <strong>Column capacity formula (IS 456 Cl 39.3):</strong><br>
      Pcap = 0.4·fck·Ac + 0.67·fy·Asc<br>
      <strong>Where:</strong><br>
      &nbsp;&nbsp;Ac = Ag − Asc = ${r0(c.Ag)} − ${r0(c.Aprov)} = ${r0(c.Ag-c.Aprov)} mm² (net concrete area)<br>
      &nbsp;&nbsp;Asc = ${r0(c.Aprov)} mm² (steel area provided = ${c.nb}×D${c.dB})<br>
      <strong>Result:</strong> Pcap = 0.4×${S.fck}×${r0(c.Ag-c.Aprov)} + 0.67×${S.fy}×${r0(c.Aprov)} = <strong style="color:#a78bfa">${r2(c.Pcap)} kN</strong>
    </div>
    ${fm('Asc_req from demand = (Pu×1000 − 0.4×fck×Ag)/(0.67×fy−0.4×fck)',r0(Math.max(0,c.Ar))+' mm²','')}
    ${fm('Asc_min = 0.8% × Ag = 0.008 × '+r0(c.Ag),r0(0.008*c.Ag)+' mm²','IS 456 Cl 26.5.3.1')}
    ${fm('Asc_max = 4% × Ag = 0.04 × '+r0(c.Ag),r0(0.04*c.Ag)+' mm²','IS 456 Cl 26.5.3.1')}
    ${fm('Provide: '+c.nb+' D'+c.dB+' bars',r0(c.Aprov)+' mm² (pt='+r2(c.pt)+'%)','IS 456 Cl 26.5.3')}
    ${(()=>{
      const sz=c.size,cv=40,stir=8,barR=c.dB/2;
      const W=220,H=220;
      const sc=Math.min(150/sz,150/sz)*0.65;
      const bw=sz*sc,ox=(W-bw)/2,oy=20;
      const cvs=cv*sc,sts=stir*sc,brs=Math.max(3,barR*sc);
      let s='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:220px;display:block">';
      s+='<rect width="'+W+'" height="'+H+'" fill="#0a0f1e" rx="6"/>';
      s+='<text x="'+W/2+'" y="14" fill="#a78bfa" font-size="9" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">COLUMN CROSS-SECTION</text>';
      s+='<rect x="'+ox+'" y="'+oy+'" width="'+bw+'" height="'+bw+'" fill="rgba(71,85,105,0.5)" stroke="#64748b" stroke-width="2" rx="1"/>';
      s+='<rect x="'+(ox+cvs)+'" y="'+(oy+cvs)+'" width="'+(bw-2*cvs)+'" height="'+(bw-2*cvs)+'" fill="none" stroke="#f59e0b" stroke-width="0.5" stroke-dasharray="3,3"/>';
      s+='<rect x="'+(ox+cvs+sts/2)+'" y="'+(oy+cvs+sts/2)+'" width="'+(bw-2*cvs-sts)+'" height="'+(bw-2*cvs-sts)+'" fill="none" stroke="#94a3b8" stroke-width="'+sts+'" stroke-linejoin="round"/>';
      const nb2=c.nb;
      const positions=[];
      const startX=ox+cvs+sts+brs;const startY=oy+cvs+sts+brs;
      const endX=ox+bw-cvs-sts-brs;const endY=oy+bw-cvs-sts-brs;
      // Always place corner bars first, then distribute extras along sides
      // Corners: TL, TR, BR, BL
      const corners=[[startX,startY],[endX,startY],[endX,endY],[startX,endY]];
      corners.forEach(pt=>positions.push(pt));
      // Extra bars beyond 4 are placed along sides (top, right, bottom, left)
      const extras=nb2-4;
      if(extras>0){
        const perSide=Math.floor(extras/4);
        const rem=extras%4;
        // Top side extras
        const topN=perSide+(rem>0?1:0);
        for(let i=1;i<=topN;i++) positions.push([startX+(endX-startX)*(i/(topN+1)),startY]);
        // Right side extras
        const rightN=perSide+(rem>1?1:0);
        for(let i=1;i<=rightN;i++) positions.push([endX,startY+(endY-startY)*(i/(rightN+1))]);
        // Bottom side extras
        const botN=perSide+(rem>2?1:0);
        for(let i=1;i<=botN;i++) positions.push([startX+(endX-startX)*(i/(botN+1)),endY]);
        // Left side extras
        const leftN=perSide;
        for(let i=1;i<=leftN;i++) positions.push([startX,startY+(endY-startY)*(i/(leftN+1))]);
      }
      for(let j=0;j<Math.min(nb2,positions.length);j++){
        s+='<circle cx="'+positions[j][0]+'" cy="'+positions[j][1]+'" r="'+brs+'" fill="#f59e0b" stroke="#fbbf24" stroke-width="1"/>';
      }
      s+='<line x1="'+ox+'" y1="'+(oy+bw+10)+'" x2="'+(ox+bw)+'" y2="'+(oy+bw+10)+'" stroke="#94a3b8" stroke-width="0.8"/>';
      s+='<text x="'+(ox+bw/2)+'" y="'+(oy+bw+20)+'" fill="#94a3b8" font-size="8" text-anchor="middle" font-family="JetBrains Mono">'+c.size+'mm</text>';
      s+='<circle cx="'+(ox+8)+'" cy="'+(oy+bw+35)+'" r="4" fill="#f59e0b"/>';
      s+='<text x="'+(ox+16)+'" y="'+(oy+bw+38)+'" fill="#f59e0b" font-size="7" font-family="JetBrains Mono">'+c.nb+'-D'+c.dB+' (pt='+r2(c.pt)+'%)</text>';
      s+='<text x="'+(ox+8)+'" y="'+(oy+bw+50)+'" fill="#94a3b8" font-size="7" font-family="JetBrains Mono">Ties: D8@'+c.ts+'(gen) / D8@'+c.tsc+'(Lo) | 135°</text>';
      s+='</svg>';
      return '<div class="dg">'+s+'<div class="dg-cap">Fig: Column '+c.label+' cross-section ('+c.size+'×'+c.size+'mm)</div></div>';
    })()}
  `,'vi')}

  ${sb('C-4','Lateral Ties + IS 13920 Confinement',`
    ${fm('General tie spacing = min('+c.size+', 16×'+c.dB+', 300)',c.ts+'mm','IS 456 Cl 26.5.3.2')}
    ${fm('Confinement zone Lo = max('+c.size+', H/6, 450)',r0(c.Lo)+' mm','IS 13920 Cl 7.4.1')}
    ${fm('Confining tie spacing = min(ts, 8×'+c.dB+', 100, 75)',c.tsc+'mm','IS 13920 Cl 7.4.6')}
    <div class="cp vi" style="margin-top:8px">
      <strong>Provide:</strong> D8 ties @ ${c.ts}mm (general) | D8 ties @ ${c.tsc}mm (Lo=${r0(c.Lo)}mm each end) | All hooks: 135° mandatory (IS 13920 Cl 7.4.7)
    </div>
  `,'vi')}

  ${(()=>{
    if(!RES.allCols) return '';
    const sameNode=RES.allCols.filter(x=>x.nodeId===c.nodeId).sort((a,b2)=>a.floor-b2.floor);
    if(sameNode.length<=1) return '';
    const rows=sameNode.map(fc=>{
      const isAct=fc.floor===c.floor;
      return '<tr style="background:'+(isAct?'rgba(167,139,250,0.08)':'transparent')+'">'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);font-weight:'+(isAct?'700':'400')+';color:#a78bfa">'+fc.floorLabel+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);text-align:center">'+fc.floorsAbove+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);text-align:right">'+r0(fc.Ps)+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);text-align:right">'+r0(fc.Pu)+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);text-align:center;font-weight:700">'+fc.size+'×'+fc.size+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);text-align:center">'+fc.nb+' D'+fc.dB+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);text-align:right">'+r2(fc.pt)+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);text-align:right">'+r0(fc.Pcap)+'</td>'
        +'<td style="padding:4px 8px;border:1px solid var(--b1);color:'+(fc.safe?'#34d399':'#f87171')+';font-weight:700">'+(fc.safe?'OK':'FAIL')+'</td>'
        +'</tr>';
    }).join('');
    const tblHtml='<table style="width:100%;border-collapse:collapse;font-size:10px">'
      +'<tr style="background:var(--bg1)">'
      +'<th style="padding:4px 8px;text-align:left;border:1px solid var(--b1);color:var(--txt3)">Floor</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">Floors above</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">Ps kN</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">Pu kN</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">Size mm</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">Bars</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">pt %</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">Pcap kN</th>'
      +'<th style="padding:4px 8px;border:1px solid var(--b1);color:var(--txt3)">Status</th>'
      +'</tr>'+rows+'</table>';
    const note='<div style="font-size:9px;color:var(--txt3);margin-top:6px">💡 Column load reduces on upper floors (fewer floors above). 300mm min size per IS 13920 for seismic zones.</div>';
    return sb('C-5','Floor-by-Floor Column Summary (cumulative load)',
      '<div style="font-size:10px;color:var(--txt3);margin-bottom:6px">Same column node — decreasing load on upper floors. Size may reduce; 300mm IS 13920 minimum governs.</div>'+tblHtml+note,'vi');
  })()}

  ${(()=>{
    // ── FEATURE B: Column Override Panel ──
    const ovrKey = `C:${c.nodeId}`;
    const hasOvr = window._memberOverrides && window._memberOverrides[ovrKey];
    const ovr = hasOvr ? window._memberOverrides[ovrKey] : null;
    // Recommended size: iterate up by 25mm until Pcap >= Pu
    let recSize = c.size;
    if(!c.safe){
      for(let sz=c.size+25;sz<=800;sz+=25){
        const Ag2=sz*sz;
        const Ar2=(c.Pu*1000-0.4*S.fck*Ag2)/(0.67*S.fy-0.4*S.fck);
        const Ap2=Math.max(0.008*Ag2,Ar2)*(Math.PI*16*16/4)/(Math.PI*16*16/4);
        const Pcap2=(0.4*S.fck*(Ag2-0.008*Ag2)+0.67*S.fy*0.008*Ag2)/1000;
        if(Pcap2>=c.Pu){recSize=sz;break;}
      }
    }

    return `<div style="margin-top:12px;padding:12px;background:rgba(167,139,250,0.05);border:1.5px solid rgba(167,139,250,0.2);border-radius:8px">
      <div style="font-size:11px;font-weight:700;color:#a78bfa;margin-bottom:8px">🔧 Try Different Size — Re-analyse with Override</div>
      <div style="font-size:10px;color:#94a3b8;margin-bottom:10px">
        Change column <strong style="color:#a78bfa">${c.label}</strong> size. This applies to ALL floors of this column.
        ${!c.safe?`<span style="color:#34d399"> Recommended: ${recSize}×${recSize}mm</span>`:''}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:10px">
        <div>
          <div style="font-size:9px;color:#64748b;margin-bottom:3px">Column Size (mm × mm)</div>
          <input id="ovr_cS_${ovrKey.replace(/:/g,'_')}" type="number" min="200" max="800" step="25"
            value="${ovr?ovr.size:c.size}"
            style="width:100px;padding:6px 8px;background:#0f172a;border:1px solid ${!c.safe?'#f87171':'#334155'};border-radius:6px;color:#f1f5f9;font-size:11px;font-family:JetBrains Mono"/>
          ${!c.safe?`<div style="font-size:8px;color:#34d399;margin-top:2px">Recommended: ${recSize}mm</div>`:''}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${!c.safe?`<button onclick="document.getElementById('ovr_cS_${ovrKey.replace(/:/g,'_')}').value=${recSize}"
            style="padding:6px 12px;background:rgba(52,211,153,0.12);border:1px solid #34d399;border-radius:6px;color:#34d399;cursor:pointer;font-size:10px;font-weight:700">
            ✓ Use Recommended
          </button>`:''}
          <button onclick="(function(){
            const k='${ovrKey}';
            const sz=parseInt(document.getElementById('ovr_cS_${ovrKey.replace(/:/g,'_')}').value);
            if(!window._memberOverrides) window._memberOverrides={};
            window._memberOverrides[k]={size:sz};
            runWithOverrides('Col ${c.label}: size→'+sz+'mm');
          })()" style="padding:6px 14px;background:rgba(167,139,250,0.12);border:1px solid #a78bfa;border-radius:6px;color:#a78bfa;cursor:pointer;font-size:10px;font-weight:700">
            ⚡ Re-analyse
          </button>
          ${hasOvr?`<button onclick="delete window._memberOverrides['${ovrKey}'];runWithOverrides('Reset ${c.label}')"
            style="padding:6px 12px;background:transparent;border:1px solid #64748b;border-radius:6px;color:#64748b;cursor:pointer;font-size:10px">
            ↺ Reset to auto
          </button>`:''}
        </div>
      </div>
      ${hasOvr?`<div style="font-size:9px;padding:4px 10px;background:rgba(249,115,22,0.1);border-radius:4px;color:#f97316">⚠ This column is using a student override (${ovr.size}×${ovr.size}mm). Auto-design is disabled.</div>`:''}
    </div>`;
  })()}
</div>`;
}


// ================================================================
// FOOTINGS — footing selector by node
// ================================================================
_ftgIdx=0;

function secFootings(){
  if(!RES.allFtgs||RES.allFtgs.length===0)return'<div class="card">No footing data.</div>';
  if(_ftgIdx>=RES.allFtgs.length) _ftgIdx=0;
  const ftg=RES.allFtgs[_ftgIdx];

  // Selector grid
  const ny=GRID.ny, nx=GRID.nx;
  // Build footing grid plan: (nx+2) columns = 1 row-label + (nx+1) node cells
  const allFtgsArr=RES.allFtgs||(RES.ftgs||[]);
  let nodeGrid='<div style="display:inline-grid;gap:3px;grid-template-columns:repeat('+(nx+2)+',auto)">';
  // Header
  nodeGrid+='<div></div>';
  for(let c=0;c<=nx;c++) nodeGrid+=`<div style="text-align:center;font-size:9px;color:#38bdf8;padding:2px 6px;font-weight:700">${c+1}</div>`;
  // Rows
  for(let r=0;r<=ny;r++){
    nodeGrid+=`<div style="font-size:9px;color:#38bdf8;padding:2px 6px;font-weight:700;align-self:center">${String.fromCharCode(65+r)}</div>`;
    for(let c=0;c<=nx;c++){
      const node=GRID&&GRID.nodes.find(n=>n.row===r&&n.col===c);
      const isCol=node&&(node.hasColumn||node.isWall);
      // Find footing by row AND col (grid column index, NOT column size)
      const ftgResult=isCol?allFtgsArr.find(f=>f.row===r&&f.col===c):null;
      const globalIdx=ftgResult?allFtgsArr.indexOf(ftgResult):-1;
      const isActive=globalIdx>=0&&globalIdx===_ftgIdx;
      const ok=ftgResult&&ftgResult.punch_ok&&ftgResult.ow_ok;
      const lbl=ftgResult?(ftgResult.baseLabel||String.fromCharCode(65+r)+(c+1)):(isCol?'?':'');
      if(!isCol){
        nodeGrid+=`<div style="width:36px;height:36px;border:1px dashed #1e293b;border-radius:4px;opacity:0.25"></div>`;
      } else if(!ftgResult){
        nodeGrid+=`<div style="width:36px;height:36px;border:1px dashed #64748b;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:7px;color:#64748b">${String.fromCharCode(65+r)}${c+1}</div>`;
      } else {
        nodeGrid+=`<button onclick="_ftgIdx=${globalIdx};showSec('footings')"
          style="width:36px;height:36px;border-radius:4px;cursor:pointer;font-size:7px;font-weight:700;
          border:1.5px solid ${isActive?'#0a0f1e':(ok?'#fbbf24':'#f87171')};
          background:${isActive?'rgba(251,191,36,0.3)':(ok?'rgba(251,191,36,0.1)':'rgba(248,113,113,0.12)')};
          color:${isActive?'#0a0f1e':(ok?'#fbbf24':'#f87171')}">
          ${lbl}
        </button>`;
      }
    }
  }
  nodeGrid+='</div>';

  const allOk=RES.allFtgs.filter(f=>f.punch_ok&&f.ow_ok).length;
  const allFail=RES.allFtgs.length-allOk;

  return`
<div class="card ye">
  <div class="ct ye">🏗 Footing Design — IS 456 Cl 31.6 + 34.2.4</div>

  <div style="padding:8px 12px;background:var(--bg1);border:1px solid var(--b1);border-radius:8px;margin-bottom:10px;font-size:10px">
    <strong>${RES.allFtgs.length}</strong> individual footings designed —
    <span style="color:#34d399">${allOk} pass</span>
    ${allFail?`<span style="color:#f87171"> | ${allFail} FAIL</span>`:''}
    | SBC=${S.soilBearing} kN/m² at ${S.ftgDepth}m depth
  </div>

  <div style="margin-bottom:12px">
    <div style="font-size:10px;font-weight:700;color:var(--txt3);margin-bottom:5px">SELECT FOOTING (plan view)</div>
    <div style="overflow-x:auto">${nodeGrid}</div>
    <div style="font-size:9px;color:var(--txt3);margin-top:4px">Yellow = pass | Red = fail | White border = selected</div>
  </div>

  ${ftg?ftgDetail(ftg):'<div style="padding:12px;color:var(--txt3)">Select a footing above</div>'}
</div>`;
}

function ftgDetail(f){
  if(!f)return'';
  const ok=f.punch_ok&&f.ow_ok&&f.Ld_ok;
  const ftgTypeLabel={'isolated':'Isolated Pad','combined':'Combined Footing','raft':'Raft Foundation'}[S.ftgType||'isolated']||'Isolated Pad';
  const ftgTypeColor={'isolated':'#34d399','combined':'#f59e0b','raft':'#f87171'}[S.ftgType||'isolated']||'#34d399';
  return`
<div style="border:1px solid ${ok?'rgba(251,191,36,0.3)':'rgba(248,113,113,0.4)'};border-radius:8px;padding:12px">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap">
    <div style="font-size:13px;font-weight:800;color:#fbbf24">${f.label||'FTG-'+f.baseLabel}</div>
    <span style="padding:2px 8px;border-radius:4px;font-size:9px;font-weight:700;background:rgba(0,0,0,0.3);border:1px solid ${ftgTypeColor};color:${ftgTypeColor}">${ftgTypeLabel}</span>
    ${(S.ftgType||'isolated')!=='isolated'?`<span style="font-size:9px;color:#64748b">⚠ Refer to engineer for detailed ${ftgTypeLabel.toLowerCase()} design</span>`:''}
  </div>
  ${vd(ok,ok?'All checks PASS OK':'One or more checks FAIL — REVISE')}

  ${sb('F-1','Size & Pressure',`
    ${fm('Net SBC = soil_bearing - γ×depth = '+S.soilBearing+' - 18×'+S.ftgDepth,r2(Math.max(80,S.soilBearing-S.ftgDepth*18))+' kN/m²','')}
    ${fm('Service load Ps (from column design)',r2(f.Ps)+' kN','')}
    ${fm('Bf = √(Ps/qnet) = √('+r2(f.Ps)+'/'+r2(Math.max(80,S.soilBearing-S.ftgDepth*18))+')',r2(f.Bf)+' m','IS 456 Cl 34.1')}
    ${fm('Actual soil pressure qu = Ps/Bf² = '+r2(f.Ps)+'/'+r2(f.Bf)+'²',r2(f.qu)+' kN/m²','')}
    ${vd(f.qu<=S.soilBearing,'qu ('+r2(f.qu)+') '+(f.qu<=S.soilBearing?'≤':'>')+' SBC ('+S.soilBearing+') → '+(f.qu<=S.soilBearing?'OK':'FAIL'),f.qu/S.soilBearing)}
  `,'ye')}


  ${sb('F-1a','Foundation Type Selection',svgFootingTypePanel(f),'or')}

  ${sb('F-2','Footing Depth',`
    <div class="cp ye" style="font-size:10px;line-height:2.0;margin-bottom:8px">
      <strong>Formula:</strong> D = max(min depth, projection + cover + bar)<br>
      <strong>Where:</strong><br>
      &nbsp;&nbsp;Projection = (Bf × 1000 − col_size) / 4 = (${r2(f.Bf*1000)} − ${f.colSize}) / 4 = <strong>${r0((f.Bf*1000-f.colSize)/4)} mm</strong><br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(controls cantilever bending and shear demand on footing)<br>
      &nbsp;&nbsp;cover = ${S.coverFtg} mm (concrete cover to reinforcement in footing)<br>
      <strong>Result:</strong> D = ${r0(f.D)} mm (rounded up to nearest 25mm, min ${S.ftgMinD||300}mm)<br>
      &nbsp;&nbsp;d = D − cover − bar = ${r0(f.D)} − ${S.coverFtg} − 8 = <strong style="color:#fbbf24">${r0(f.d)} mm</strong> (effective depth)<br>
      &nbsp;&nbsp;Factored qu_f = 1.5 × qu = 1.5 × ${r2(f.qu)} = <strong>${r2(f.quf)} kN/m²</strong> (factored upward soil pressure for section design)
    </div>
  `,'ye')}

  ${sb('F-3 ★','Punching Shear (IS 456 Cl 31.6)',`
    <div class="cp ye" style="font-size:10px;line-height:2.0;margin-bottom:8px">
      <strong>What is punching shear?</strong> The column punches DOWN through the footing like a cookie cutter. The failure perimeter is a square at d/2 from the column face on all four sides.<br><br>
      <strong>Formula:</strong> τvp = Vpu × 1000 / (bo × d)<br>
      <strong>Where:</strong><br>
      &nbsp;&nbsp;bo = 4 × (col_size + d) = 4 × (${f.colSize} + ${r0(f.d)}) = <strong>${r0(f.bo)} mm</strong> (critical perimeter at d/2 from column face)<br>
      &nbsp;&nbsp;Vpu = Pu − qu_f × (col+d)² = ${r2(f.Pu)} − ${r2(f.quf)} × ${r2((f.colSize/1000+f.d/1000)**2)} × 1000 = <strong>${r2(f.Vpu)} kN</strong><br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(net upward punch = total load minus upward pressure inside the critical perimeter)<br>
      &nbsp;&nbsp;Pu = ${r2(f.Pu)} kN (factored column load), d = ${r0(f.d)} mm<br>
      <strong>Result:</strong> τvp = ${r2(f.Vpu)} × 1000 / (${r0(f.bo)} × ${r0(f.d)}) = <strong style="color:#fbbf24">${r2(f.tvp)} N/mm²</strong><br>
      &nbsp;&nbsp;Limit: τcp = 0.25×√fck = 0.25×√${S.fck} = <strong>${r2(f.tcp)} N/mm²</strong> (IS 456 Cl 31.6.3)
    </div>
    ${vd(f.punch_ok,'τvp ('+r2(f.tvp)+') '+(f.punch_ok?'≤':'>')+' τcp ('+r2(f.tcp)+') → '+(f.punch_ok?'SAFE — punching shear OK':'FAIL — increase footing depth d'),f.tvp/f.tcp)}
  `,'ye')}

  ${sb('F-4 ★','One-Way Shear (IS 456 Cl 34.2.4)',`
    <div class="cp ye" style="font-size:10px;line-height:2.0;margin-bottom:8px">
      <strong>What is one-way shear?</strong> The footing bends like a cantilever slab from each column face outward. Shear failure can occur across the full width at distance d from column face.<br><br>
      <strong>Formula:</strong> τvow = Vow × 1000 / (Bf × 1000 × d)<br>
      <strong>Where:</strong><br>
      &nbsp;&nbsp;Critical section is at d = ${r0(f.d)} mm from column face (IS 456 Cl 34.2.4)<br>
      &nbsp;&nbsp;Projection to critical section = (Bf − col)/2 − d = ${r2(Math.max(0,(f.Bf*1000-f.colSize)/2-f.d))} mm<br>
      &nbsp;&nbsp;Vow = qu_f × Bf × projection / 1000 = ${r2(f.quf)} × ${r2(f.Bf)} × ${r2(Math.max(0,(f.Bf*1000-f.colSize)/2-f.d))}/1000 = <strong>${r2(f.Vow)} kN</strong><br>
      &nbsp;&nbsp;Bf = ${r2(f.Bf)} m (footing width), d = ${r0(f.d)} mm<br>
      <strong>Result:</strong> τvow = ${r2(f.Vow)} × 1000 / (${r2(f.Bf*1000)} × ${r0(f.d)}) = <strong style="color:#fbbf24">${r2(f.tvow)} N/mm²</strong><br>
      &nbsp;&nbsp;Limit: τcow = ${r2(f.tcow)} N/mm² (IS 456 Table 19 at pt ≈ 0.15%)
    </div>
    ${vd(f.ow_ok,'τvow ('+r2(f.tvow)+') '+(f.ow_ok?'≤':'>')+' τcow ('+r2(f.tcow)+') → '+(f.ow_ok?'SAFE — one-way shear OK':'FAIL — increase footing depth D'),f.tvow/f.tcow)}
  `,'ye')}

  ${sb('F-5','Bending & Steel',`
    <div class="cp ye" style="font-size:10px;line-height:2.0;margin-bottom:8px">
      <strong>Formula:</strong> Mu = qu_f × Bf × x² / 2 &nbsp; (cantilever bending moment at column face)<br>
      <strong>Where:</strong><br>
      &nbsp;&nbsp;x = cantilever arm = (Bf − col_size/1000) / 2 = (${r2(f.Bf)} − ${r2(f.colSize/1000)}) / 2 = <strong>${r2((f.Bf-f.colSize/1000)/2)} m</strong><br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(the footing overhang acts as a cantilever slab from column face to edge)<br>
      &nbsp;&nbsp;qu_f = ${r2(f.quf)} kN/m² (factored upward soil pressure), Bf = ${r2(f.Bf)} m<br>
      <strong>Result:</strong> Mu = ${r2(f.quf)} × ${r2(f.Bf)} × ${r2((f.Bf-f.colSize/1000)/2)}² / 2 = <strong style="color:#fbbf24">${r2(f.Mu)} kN.m</strong><br>
      &nbsp;&nbsp;Ast = ${r0(f.Af)} mm² → Provide D${f.dBf}@${f.spf}mm both ways (IS 456 Cl 34.3)
    </div>
    ${fm('Ld_req (90° hook in footing)',r0(f.Ldr)+' mm | Ld_avail = '+r0(f.Lda)+' mm','IS 456 Cl 26.2.2')}
    ${vd(f.Ld_ok,'Ld_avail ('+r0(f.Lda)+') '+(f.Ld_ok?'≥':'<')+' Ld_req ('+r0(f.Ldr)+') → '+(f.Ld_ok?'OK':'FAIL — see below'))}
  `,'ye')}


  ${!f.Ld_ok?`
  <div style="margin-top:10px;padding:12px;background:rgba(248,113,113,0.06);border:1.5px solid rgba(248,113,113,0.3);border-radius:8px">
    <div style="font-size:12px;font-weight:700;color:#f87171;margin-bottom:8px">⚠ DEVELOPMENT LENGTH FAILURE</div>
    <div style="font-size:10.5px;line-height:1.8;color:#fca5a5;margin-bottom:12px">
      <strong>What is development length?</strong> For a bar to carry its full tensile force, it must be embedded in concrete for a minimum length (Ld). If shorter, the bar <strong>pulls out</strong> — a brittle failure.<br><br>
      <strong>Your footing:</strong> Ld_avail = ${r0(f.Lda)}mm but Ld_req = ${r0(f.Ldr)}mm — short by <strong style="color:#f87171">${r0(f.Ldr-f.Lda)}mm</strong>.
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px">
      <div style="padding:10px;background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.3);border-radius:8px">
        <div style="font-size:11px;font-weight:700;color:#34d399;margin-bottom:6px">✅ Option A: 90° Hook</div>
        <div style="font-size:10px;color:var(--txt2);line-height:1.7">
          IS 456 Cl 26.2.2.1 allows <strong>0.7×</strong> reduction with hook.<br>
          Ld with hook = 0.7 × ${r0(f.Ldr)} = <strong style="color:#34d399">${r0(Math.ceil(f.Ldr*0.7))}mm</strong><br>
          ${f.Lda>=f.Ldr*0.7?'<span style="color:#34d399;font-weight:700">✔ HOOK FIXES IT</span>':'<span style="color:#f87171">Still not enough</span>'}
        </div>
        <svg viewBox="0 0 180 80" style="width:100%;max-width:180px;margin-top:6px">
          <rect width="180" height="80" fill="#0a0f1e" rx="4"/>
          <rect x="10" y="30" width="160" height="40" fill="rgba(71,85,105,0.3)" stroke="#475569" rx="2"/>
          <text x="90" y="25" fill="#94a3b8" font-size="7" text-anchor="middle">FOOTING SECTION</text>
          <line x1="30" y1="60" x2="130" y2="60" stroke="#f59e0b" stroke-width="2"/>
          <line x1="130" y1="60" x2="130" y2="40" stroke="#f59e0b" stroke-width="2"/>
          <text x="140" y="52" fill="#34d399" font-size="6">hook</text>
        </svg>
      </div>
      <div style="padding:10px;background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.3);border-radius:8px">
        <div style="font-size:11px;font-weight:700;color:#38bdf8;margin-bottom:6px">Option B: Increase Footing Size</div>
        <div style="font-size:10px;color:var(--txt2);line-height:1.7">
          Make footing wider for more grip length.<br>
          Bf needed ≥ (2×Ld+col+2×cover)/1000<br>
          = <strong style="color:#38bdf8">${r2((2*f.Ldr+f.colSize+2*S.coverFtg)/1000)}m</strong> (now: ${r2(f.Bf)}m)
        </div>
        <svg viewBox="0 0 180 80" style="width:100%;max-width:180px;margin-top:6px">
          <rect width="180" height="80" fill="#0a0f1e" rx="4"/>
          <rect x="5" y="30" width="170" height="40" fill="rgba(71,85,105,0.3)" stroke="#475569" rx="2"/>
          <text x="90" y="25" fill="#94a3b8" font-size="7" text-anchor="middle">WIDER FOOTING</text>
          <line x1="15" y1="60" x2="165" y2="60" stroke="#f59e0b" stroke-width="2"/>
          <text x="90" y="57" fill="#38bdf8" font-size="6" text-anchor="middle">longer bar = more grip</text>
        </svg>
      </div>
    </div>
    <div style="font-size:9px;color:var(--txt3)">
      <strong>Recommendation:</strong> ${f.Lda>=f.Ldr*0.7?'Use 90° hook — simplest fix, no size change needed.':'Use BOTH hooks AND increase footing.'}
    </div>
  </div>
  `:''}
</div>`;
}



function secStair(){
  const stairDesigns = RES.allStairDesigns;

  // If no stair bays marked, fall back to generic single stair
  if(!stairDesigns||stairDesigns.length===0){
    const st=RES.stair;
    if(!st)return '<div class="card"><div class="ct tl">🪜 Staircase Design</div><div class="cd">No staircase bays marked in the plan. Mark a bay as "Staircase" in the Building Plan Editor.</div></div>';
    return stairSinglePanel(st,'Generic Stair (no bay marked)');
  }

  // Multiple stair bays: tab per bay
  const activeIdx=window._stairTab||0;
  const active=stairDesigns[activeIdx]||stairDesigns[0];

  const tabs=stairDesigns.map((sd,i)=>`
    <button onclick="window._stairTab=${i};showSec('staircase')"
      style="padding:5px 14px;border-radius:6px;border:1px solid ${i===activeIdx?'#f59e0b':'var(--b1)'};
      background:${i===activeIdx?'rgba(245,158,11,0.15)':'transparent'};
      color:${i===activeIdx?'#f59e0b':'var(--txt3)'};cursor:pointer;font-size:10px;font-weight:700">
      ${sd.bayLabel} (${r2(sd.spX)}×${r2(sd.spY)}m)
    </button>`).join('');

  // Stair type recommendation based on bay dimensions
  const stairW=active.spX||3, stairL=active.spY||3;
  const recType=stairW>=2.5&&stairL>=5?'Dog-leg (most common for residential)':stairW>=2&&stairL>=4?'Dog-leg or 90° turn':'Straight flight (compact bay)';

  return`
<div class="card tl">
  <div class="ct tl">🪜 Staircase Design — ${stairDesigns.length} Stair Bay(s) — Waist Slab Method</div>

  <div style="margin-bottom:14px;padding:12px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);border-radius:8px">
    <div style="font-size:11px;font-weight:700;color:#f59e0b;margin-bottom:8px">STAIR TYPE GUIDE</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px">
      <div style="padding:8px;background:rgba(245,158,11,0.06);border-radius:6px;text-align:center">
        <svg viewBox="0 0 80 60" style="width:80px;height:60px;display:block;margin:0 auto 4px">
          <rect width="80" height="60" fill="#0a0f1e" rx="4"/>
          <line x1="10" y1="50" x2="10" y2="40" stroke="#f59e0b" stroke-width="2"/>
          <line x1="10" y1="40" x2="20" y2="40" stroke="#f59e0b" stroke-width="2"/>
          <line x1="20" y1="40" x2="20" y2="30" stroke="#f59e0b" stroke-width="2"/>
          <line x1="20" y1="30" x2="30" y2="30" stroke="#f59e0b" stroke-width="2"/>
          <line x1="30" y1="30" x2="30" y2="20" stroke="#f59e0b" stroke-width="2"/>
          <line x1="30" y1="20" x2="40" y2="20" stroke="#f59e0b" stroke-width="2"/>
          <line x1="40" y1="20" x2="40" y2="10" stroke="#f59e0b" stroke-width="2"/>
          <line x1="40" y1="10" x2="70" y2="10" stroke="#f59e0b" stroke-width="2"/>
        </svg>
        <div style="font-size:9px;font-weight:700;color:#f59e0b">Straight Flight</div>
        <div style="font-size:8px;color:var(--txt3)">Bay ≥ 2m × 4m<br>Simple, economical</div>
      </div>
      <div style="padding:8px;background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.2);border-radius:6px;text-align:center">
        <svg viewBox="0 0 80 60" style="width:80px;height:60px;display:block;margin:0 auto 4px">
          <rect width="80" height="60" fill="#0a0f1e" rx="4"/>
          <line x1="10" y1="50" x2="10" y2="35" stroke="#34d399" stroke-width="2"/>
          <line x1="10" y1="35" x2="20" y2="35" stroke="#34d399" stroke-width="2"/>
          <line x1="20" y1="35" x2="20" y2="25" stroke="#34d399" stroke-width="2"/>
          <line x1="20" y1="25" x2="35" y2="25" stroke="#34d399" stroke-width="2"/>
          <rect x="35" y="20" width="15" height="10" fill="rgba(52,211,153,0.2)" stroke="#34d399" stroke-width="1"/>
          <text x="42" y="27" fill="#34d399" font-size="5" text-anchor="middle">landing</text>
          <line x1="50" y1="25" x2="60" y2="25" stroke="#34d399" stroke-width="2"/>
          <line x1="60" y1="25" x2="60" y2="15" stroke="#34d399" stroke-width="2"/>
          <line x1="60" y1="15" x2="70" y2="15" stroke="#34d399" stroke-width="2"/>
          <line x1="70" y1="15" x2="70" y2="10" stroke="#34d399" stroke-width="2"/>
        </svg>
        <div style="font-size:9px;font-weight:700;color:#34d399">Dog-Leg (U-Turn)</div>
        <div style="font-size:8px;color:var(--txt3)">Bay ≥ 2.5m × 5m<br>Most common residential</div>
      </div>
      <div style="padding:8px;background:rgba(56,189,248,0.06);border-radius:6px;text-align:center">
        <svg viewBox="0 0 80 60" style="width:80px;height:60px;display:block;margin:0 auto 4px">
          <rect width="80" height="60" fill="#0a0f1e" rx="4"/>
          <line x1="10" y1="50" x2="10" y2="35" stroke="#38bdf8" stroke-width="2"/>
          <line x1="10" y1="35" x2="25" y2="35" stroke="#38bdf8" stroke-width="2"/>
          <rect x="25" y="30" width="15" height="10" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-width="1"/>
          <line x1="40" y1="35" x2="40" y2="15" stroke="#38bdf8" stroke-width="2"/>
          <line x1="40" y1="15" x2="55" y2="15" stroke="#38bdf8" stroke-width="2"/>
          <line x1="55" y1="15" x2="55" y2="10" stroke="#38bdf8" stroke-width="2"/>
        </svg>
        <div style="font-size:9px;font-weight:700;color:#38bdf8">90° Turn</div>
        <div style="font-size:8px;color:var(--txt3)">Bay ≥ 3m × 3m<br>Open-well, elegant</div>
      </div>
    </div>
    <div style="font-size:10px;color:var(--txt2)">
      <strong>For your bay (${r2(stairW)}m × ${r2(stairL)}m):</strong> Recommended type: <strong style="color:#34d399">${recType}</strong>.
      The waist slab method (used below) works for all types — the structural design is identical; only the geometry changes.
    </div>
  </div>

  ${stairDesigns.length>1?`
  <div style="margin-bottom:12px">
    <div style="font-size:10px;font-weight:700;color:var(--txt3);margin-bottom:5px">SELECT STAIR BAY</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">${tabs}</div>
  </div>`:''}

  ${stairSinglePanel(active)}
</div>`;
}

function stairSinglePanel(st, titleOverride){
  const title=titleOverride||st.bayLabel;
  return`
<div>
  <div style="font-size:12px;font-weight:800;color:#f59e0b;margin-bottom:12px">
    ${title}
    ${st.spX?`<span style="font-size:10px;font-weight:400;color:var(--txt3);margin-left:8px">Bay: ${r2(st.spX)}m × ${r2(st.spY)}m | Flight span: ${r2(st.flightSpan||st.ss||1.5)}m</span>`:''}
  </div>

  ${sb('ST-1','Geometry & Dimensions',`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      <div>
        ${krow('Bay size',r2(st.spX||3)+'m × '+r2(st.spY||3)+'m')}
        ${krow('Flight span (70% of short bay dim)',r2(st.flightSpan||st.ss||1.5)+'m')}
        ${krow('Landing span (30%)',r2(st.landingSpan||0.5)+'m')}
      </div>
      <div>
        ${krow('Riser R',(st.riser||165)+'mm  (IS NBC: max 175mm)')}
        ${krow('Tread T',(st.tread||270)+'mm  (IS NBC: min 250mm)')}
        ${krow('Comfort: 2R+T',2*(st.riser||165)+(st.tread||270)+' mm  (target 550–650mm)')}
      </div>
    </div>
    ${fm('Stair angle θ = arctan(R/T) = arctan('+(st.riser||165)+'/'+((st.tread||270))+')',r2(st.theta||19.4)+' deg','')}
    ${fm('No. of risers = floorHt/R = '+Math.round(S.floorHt*1000)+'/'+st.riser,Math.round(S.floorHt*1000/(st.riser||165))+' steps','IS NBC')}
    ${vd(2*(st.riser||165)+(st.tread||270)>=550&&2*(st.riser||165)+(st.tread||270)<=650,
      '2R+T = '+(2*(st.riser||165)+(st.tread||270))+'mm — '+(2*(st.riser||165)+(st.tread||270)>=550&&2*(st.riser||165)+(st.tread||270)<=650?'Comfortable (550–650mm)':'Outside comfort range'))}
  `,'tl')}

  ${sb('ST-2','Loading on Inclined Waist Slab',`
    ${fm('DL_waist = (D/1000)×25/cosθ = ('+st.wD+'/1000)×25/cos('+r2(st.theta||19.4)+'°)',r2(st.DL_waist||st.wD/1000*25)+' kN/m²','')}
    ${fm('DL_steps = (R/2)×γ = ('+(st.riser||165)+'/2)/1000×25',r2(st.DL_steps||(st.riser||165)/2/1000*25)+' kN/m² (triangular wedge)','')}
    ${fm('Floor finish',S.floorFinish+' kN/m²','')}
    ${fm('LL (IS 875 Part 2: Stairs)',(st.LL_stair||3.0)+' kN/m²','IS 875 P2 Table 1')}
    ${fm('wu = 1.5 × (DL_waist + DL_steps + FF + LL)',r2(st.wust)+' kN/m²','IS 456 Cl 18.2')}
    <div class="cp tl" style="margin-top:8px;font-size:10px">
      <strong>Note:</strong> This load is applied to the waist slab. The stair reaction
      <strong style="color:#f59e0b">${r2((st.stairReaction||st.wust*(st.flightSpan||1.5)/2))} kN/m</strong>
      is also applied to the beams supporting the stair landing ends (included in their beam design).
    </div>
  `,'tl')}

  ${sb('ST-3','Waist Slab Design (IS 456)',`
    ${(()=>{ const Mf_s = S.fy>=500?0.133:S.fy>=415?0.138:0.149;
             const Mulim_s = Mf_s*S.fck*1000*st.wd*st.wd/1e6;
             return `
    ${fm('Span = flight span (simply supported)',r2(st.flightSpan||st.ss||1.5)+'m','')}
    ${fm('D = max(user input '+S.slabThk+'mm, L×1000/20)',st.wD+'mm','')}
    ${fm('d = D - cover - half bar = '+st.wD+' - '+S.coverSlab+' - 5',st.wd+'mm','')}
    ${fm('Mu = wu×L²/8 = '+r2(st.wust)+'×'+r2(st.flightSpan||st.ss||1.5)+'²/8',r2(st.Mst)+' kN.m/m','')}
    ${fm('Mulim = '+Mf_s+'×fck×b×d² = '+Mf_s+'×'+S.fck+'×1000×'+st.wd+'²/1e6',r2(Mulim_s)+' kN.m/m','IS 456 Annex G')}
    ${fm('Ast_req = Mu/(0.87fy×d×lever arm)',r0(st.Ast2)+' mm²/m','IS 456 Annex G')}
    ${fm('Spacing = 1000×π×(D10)²/4 / Ast_req','D10@'+st.stsp+'mm c/c','IS 456 Cl 26.3.3')}
    ${vd(st.Mst<=Mulim_s,'Mu ('+r2(st.Mst)+') ≤ Mulim ('+r2(Mulim_s)+') → Singly reinforced OK')}`;
    })()}
    <div class="cp tl" style="margin-top:10px">
      <strong>✓ Provide:</strong><br>
      Waist slab: <strong>${st.wD}mm thick</strong> | Main bars: <strong>D10@${st.stsp}mm</strong> along flight<br>
      Distribution: <strong>D8@300mm</strong> perpendicular | Cover: <strong>${S.coverSlab}mm</strong><br>
      Landing slab: <strong>${st.wD}mm thick</strong> | D10@${st.stsp}mm both ways | Extend 0.3L into wall/beam
    </div>
  `,'tl')}

  ${sb('ST-4','Landing Design',`
    ${fm('Landing span (30% of bay)',r2(st.landingSpan||0.5)+'m','')}
    ${fm('Landing load = 1.5×(DL_slab + FF + LL)',r2(1.5*(st.wD/1000*25+S.floorFinish+3.0))+' kN/m²','')}
    ${fm('Landing Mu = wu×L²/8',r2(1.5*(st.wD/1000*25+S.floorFinish+3.0)*(st.landingSpan||0.5)**2/8)+' kN.m/m','')}
    <div class="cp tl">Landing reinforcement same as waist slab: D10@${st.stsp}mm. Extend at least 1.2m (Ld) into wall or beam.</div>
  `,'tl')}

  ${sb('ST-0','Stair Type Selection & Cross-Section',svgStairSection(st),'tl')}

</div>`;
}

function secSafety(){
  const{slab,beams,cols,ftgs}=RES;

  // Group checks by category
  const slabChecks=[];
  const slabLd = (slab.lx && slab.slabd) ? r2(slab.lx*1000/slab.slabd) : 'N/A';
  slabChecks.push({it:'Slab l/d ratio',ok:!!slab.ld_ok,note:'l/d='+slabLd+' (limit 26)',cat:'Slab'});
  slabChecks.push({it:'Slab Mu < Mulim',ok:!!slab.ok,note:'Mu='+r2(slab.Mx||0)+' vs '+r2(slab.Mulim||0)+' kN.m/m',cat:'Slab'});

  const beamChecks=[];
  beams.forEach(b=>{
    beamChecks.push({it:b.label+' Shear',ok:b.shearSafe,note:'τv='+r2(b.tv)+' vs τc,max='+r2(b.tcmax)+' N/mm²',cat:'Beam',beam:b});
    beamChecks.push({it:b.label+' Deflection',ok:b.deflOK,note:'δ='+r2(b.dfl)+'mm, allow='+r2(b.dall)+'mm',cat:'Beam',beam:b});
  });

  const colChecks=[];
  cols.filter(c=>c.floor===1).forEach(c=>{
    colChecks.push({it:c.label+' Axial capacity',ok:c.safe,note:'Pu='+r2(c.Pu)+' vs Pcap='+r2(c.Pcap)+' kN',cat:'Column',col:c});
    colChecks.push({it:c.label+' Steel ratio',ok:c.pt>=0.8&&c.pt<=4,note:'pt='+r2(c.pt)+'% (0.8–4%)',cat:'Column',col:c});
  });

  const ftgChecks=[];
  ftgs.forEach(f=>{
    const flbl = f.label || f.lbl || 'FTG';
    ftgChecks.push({it:flbl+' Punching shear',ok:f.punch_ok,note:'τvp='+r2(f.tvp)+' vs τcp='+r2(f.tcp)+' N/mm²',cat:'Footing'});
    ftgChecks.push({it:flbl+' One-way shear',ok:f.ow_ok,note:'τv='+r2(f.tvow)+' vs τc='+r2(f.tcow),cat:'Footing'});
    ftgChecks.push({it:flbl+' Dev length',ok:f.Ld_ok,note:'Avail='+r0(f.Lda)+' vs req='+r0(f.Ldr)+'mm',cat:'Footing'});
  });

  const allChecks=[...slabChecks,...beamChecks,...colChecks,...ftgChecks];
  const p=allChecks.filter(c=>c.ok).length,t=allChecks.length;
  const failChecks=allChecks.filter(c=>!c.ok);

  function renderGroup(title,emoji,color,checks){
    const gp=checks.filter(c=>c.ok).length,gt=checks.length;
    const allOk=gp===gt;
    return `
    <div style="margin-bottom:16px;padding:12px;background:rgba(${allOk?'52,211,153':'248,113,113'},0.04);border:1px solid rgba(${allOk?'52,211,153':'248,113,113'},0.2);border-radius:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-size:12px;font-weight:700;color:${color}">${emoji} ${title}</div>
        <div style="padding:2px 10px;border-radius:12px;font-size:10px;font-weight:700;background:rgba(${allOk?'52,211,153':'248,113,113'},0.15);color:${allOk?'#34d399':'#f87171'}">${gp}/${gt} pass</div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:10px">
        <tr style="background:var(--bg1)">
          <th style="padding:5px 8px;border:1px solid var(--b1);text-align:left;color:var(--txt3)">Check</th>
          <th style="padding:5px 8px;border:1px solid var(--b1);width:60px;color:var(--txt3)">Status</th>
          <th style="padding:5px 8px;border:1px solid var(--b1);text-align:left;color:var(--txt3)">Values</th>
        </tr>
        ${checks.map(c=>`<tr>
          <td style="padding:4px 8px;border:1px solid var(--b1)">${c.it}</td>
          <td style="padding:4px 8px;border:1px solid var(--b1);text-align:center;font-weight:700;color:${c.ok?'#34d399':'#f87171'}">${c.ok?'✓ PASS':'✗ FAIL'}</td>
          <td style="padding:4px 8px;border:1px solid var(--b1);font-size:9px;color:var(--txt3)">${c.note}</td>
        </tr>`).join('')}
      </table>
    </div>`;
  }

  return`
<div class="card">
  <div class="ct">🛡️ Complete Safety Summary — ${p}/${t} checks pass</div>

  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:14px;border-radius:8px;background:${p===t?'rgba(52,211,153,0.08)':'rgba(248,113,113,0.08)'}">
    <div style="font-size:32px">${p===t?'✅':'⚠️'}</div>
    <div>
      <div style="font-size:14px;font-weight:800;color:${p===t?'#34d399':'#f87171'}">${p===t?'ALL CHECKS PASS — Design is safe':(t-p)+' CHECK'+(t-p>1?'S':'')+' FAIL — Revise before construction'}</div>
      <div style="font-size:10px;color:var(--txt3);margin-top:2px">IS 456:2000 | IS 1893:2016 | IS 13920:2016 | IS 875 Part 2&3</div>
    </div>
  </div>

  ${failChecks.length>0?`
  <div style="margin-bottom:16px;padding:12px;background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.2);border-radius:8px">
    <div style="font-size:11px;font-weight:700;color:#f87171;margin-bottom:8px">\u26a0 FAILURES REQUIRING ATTENTION</div>
    ${failChecks.map(c=>`<div style="font-size:10px;color:#fca5a5;padding:3px 0">\u2022 <strong>${c.it}:</strong> ${c.note}</div>`).join('')}
  </div>
  <div style="margin-bottom:16px;padding:12px;background:rgba(52,211,153,0.04);border:1.5px solid rgba(52,211,153,0.2);border-radius:8px">
    <div style="font-size:11px;font-weight:700;color:#34d399;margin-bottom:4px">\ud83d\udd27 Quick Fix \u2014 Apply Recommended Sizes & Re-analyse</div>
    <div style="font-size:10px;color:#94a3b8;margin-bottom:10px">One click applies the recommended fix for ALL failing members and re-runs the full analysis.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="(function(){
        if(!window._memberOverrides) window._memberOverrides={};
        ${beamChecks.filter(c=>!c.ok&&c.beam).map(c=>{
          const b=c.beam;
          const key='B:'+b.row+':'+b.col+':'+b.dir;
          const recD=!b.deflOK?Math.ceil(b.D*Math.pow(b.dfl/b.dall,1/3)/25+1)*25:b.D;
          const recB=!b.shearSafe?Math.max(b.b+50,Math.ceil(b.b*1.25/25)*25):b.b;
          return "window._memberOverrides['"+key+"']={D:"+recD+",b:"+recB+"};";
        }).join('')}
        ${colChecks.filter(c=>!c.ok&&c.col).map(c=>{
          const col=c.col;
          const key='C:'+col.nodeId;
          let recSize=col.size;
          for(let sz=col.size+25;sz<=800;sz+=25){
            const Pcap2=(0.4*S.fck*(sz*sz*0.992)+0.67*S.fy*sz*sz*0.008)/1000;
            if(Pcap2>=col.Pu){recSize=sz;break;}
          }
          return "window._memberOverrides['"+key+"']={size:"+recSize+"};";
        }).join('')}
        runWithOverrides('Quick Fix: all recommended sizes');
      })()" style="padding:8px 16px;background:rgba(52,211,153,0.12);border:1.5px solid #34d399;border-radius:8px;color:#34d399;cursor:pointer;font-size:11px;font-weight:700">
        \u2713 Apply All Recommended & Re-analyse
      </button>
      ${(window._memberOverrides&&Object.keys(window._memberOverrides).length>0)?`
      <button onclick="window._memberOverrides={};runWithOverrides('Reset all to auto')"
        style="padding:8px 16px;background:transparent;border:1px solid #64748b;border-radius:8px;color:#64748b;cursor:pointer;font-size:11px">
        \u21ba Reset All Overrides
      </button>`:''}
    </div>
    <div style="font-size:9px;color:#475569;margin-top:8px">\ud83d\udca1 After re-analysis, use the history bar at the top to compare before and after.</div>
  </div>
  `:``}

  ${renderGroup('SLAB','\ud83d\udd32','var(--cyan)',slabChecks)}
  ${renderGroup('BEAMS','\ud83d\udfe7','var(--orange)',beamChecks)}
  ${renderGroup('COLUMNS','\ud83c\udfdb','#a78bfa',colChecks)}
  ${renderGroup('FOOTINGS','\ud83d\udfe8','#fbbf24',ftgChecks)}

  <div style="margin-top:10px;padding:10px;background:var(--bg1);border-radius:8px;font-size:9px;color:var(--txt3)">
    \ud83d\udca1 This summary checks every structural member. A single failure means the design is NOT safe for construction.
    Click on individual member pages (Beam, Column, Footing) for detailed failure explanations and override controls.
  </div>
</div>`;}


// =======================================================
// REFERENCE DESIGN PAGE
// =======================================================

// == 08_reference.js ==

// ================================================================
// MODULE: 08_reference
// Reference design page
// ================================================================



function p8(){return`
<div class="card bl" style="background:linear-gradient(135deg,#071428,#0c1a3a)">
  <div style="text-align:center;padding:12px 0 16px">
    <div style="font-size:38px">🎓</div>
    <div style="font-family:var(--sans);font-size:18px;font-weight:800;color:var(--blue)">REFERENCE DESIGN  -  G+3 Delhi Residential</div>
    <div style="font-size:11px;color:var(--txt3);margin-top:6px">Complete worked example with visual diagrams  -  learn structural engineering from first principles</div>
  </div>
  <div id="refGrid" style="background:var(--bg1);border-radius:8px;border:1px solid var(--bg3);margin-bottom:14px;padding:10px"></div>
</div>
${refData()}`;}

function refData(){
  // Pre-computed reference design values for G+3 Delhi
  const R={
    lx:3,ly:4,D:150,d:125,wu_sl:12.38,Mx:8.25,Mulim_sl:54,Ax:393,spx:200,spy:200,
    beam:{b:230,D2:450,d2:397,wu:58,RA:116,Mmax:116.3,Mulim:118.4,nm:3,ns:2,tv:1.27,tcmax:3.1,tc:0.63,sv:200,svd:100,dfl:10.1,dall:16},
    col:{size:300,Ps:310,Pu:465,Pcap:1165,nb:4,dB:16,ts:250,tsc:75,Lo:600,pt:0.89},
    ftg:{Ps:310,Bf:1.5,D3:400,d3:317,tvp:0.605,tcp:1.25,tvow:0.226,tcow:0.36,Ast_f:565,spf:200}
  };
  return`
<div class="card gr">
  <div class="ct gr">1. Building Data</div>
  ${krow('Plan','12m x 9m | 3 bays X (4+4+4m) x 3 bays Y (3+3+3m)')}
  ${krow('Floors','G+3 = 4 floors x 3.2m = 12.8m total height')}
  ${krow('Seismic Zone','IV (Z=0.24)  -  Delhi | Soil Type II | Wind Zone IV (47m/s)')}
  ${krow('Materials','M25 concrete | Fe500D steel | IS 456 Moderate exposure')}
  ${krow('Foundation','SBC = 200 kN/m^2, Df = 1.5m, Net SBC = 200-27 = 173 kN/m^2')}
  <div class="cp gr" style="margin-top:10px"><strong>Reference design uses spans 4mx3m.</strong> The 4m is the critical span  -  it drives beam size, reinforcement, and deflection. The 3m is shorter  -  it drives slab design. Typical Indian residential building spacing.</div>
</div>
<div class="card or">
  <div class="ct or">2. Loads</div>
  ${krow('DL slab','(150/1000)x25 = 3.75 kN/m^2')}
  ${krow('FF + Partitions','1.0 + 1.5 = 2.5 kN/m^2')}
  ${krow('LL (residential)','2.0 kN/m^2 (IS 875 P2 Table 1)')}
  ${krow('wu','1.5x(3.75+2.5+2.0) = 1.5x8.25 = 12.38 kN/m^2')}
  ${krow('Wall on edge beams','0.23x3.2x19x0.7 = 10 kN/m -> use 12 kN/m')}
</div>
<div class="card" style="border-color:rgba(45,212,191,.3)">
  <div class="ct tl">3. Seismic Analysis  -  Full Calculation</div>
  ${fm('Ta = 0.09x12.8/sqrt9','= 0.384s','IS 1893 Cl 7.6.1b')}
  ${fm('Sa/g = 2.5 x 1.2 (Type II soil)','= 3.0','IS 1893 Fig. 2')}
  ${fm('Ah = (0.24/2) x 3.0 / 5 x 1.0','= 0.072','IS 1893 Cl 6.4.2')}
  ${fm('W_total ~ 4x(5.75+0.5)x108 + walls','~ 3484 kN','')}
  ${fm('Vb = 0.072 x 3484','= 250.8 kN','IS 1893 Cl 7.5.3')}
  ${svgSeismicDist([{floor:4,Qi:121.5,Vi:121.5},{floor:3,Qi:68.4,Vi:189.9},{floor:2,Qi:30.4,Vi:220.3},{floor:1,Qi:7.6,Vi:227.9}])}
</div>
<div class="card">
  <div class="ct">4. Slab Design  -  4mx3m Panel (ly/lx=1.33 -> Two-way)</div>
  ${svgSlabPanel(3,4,200,200,true)}
  ${fm('alphax = 0.074, alphay = 0.047 (IS 456 Table 27, ly/lx=1.33)','','IS 456 Table 27')}
  ${fm('Mx = 0.074x12.38x3^2 = 8.25 kN.m/m | My = 0.047x12.38x3^2 = 5.24 kN.m/m','','')}
  ${fm('Mulim = 0.138x25x1000x125^2/10^6','= 54.0 kN.m/m >> 8.25 OK','')}
  ${fm('Ast_min = 0.12%x1000x150 = 180 mm^2/m (governs) -> T10@200mm','','')}
  ${vd(true,'T10@200mm (X+Y, bottom) | T8@250mm top at supports | Corner steel: T8@200mm, lx/5=600mm from corner')}
</div>
<div class="card or">
  <div class="ct or">5. Main Beam Design  -  4m Span (Critical Beam)</div>
  <div class="cp or">The 4m external beam carries the heaviest load: slab from 3m each side + own weight + 230mm brick wall. This is the most critical beam in the building.</div>
  ${svgBeamLoad(4,R.beam.wu,R.beam.RA)}
  ${fm('b=230mm, D=450mm (revised from 350mm  -  see below), d=397mm','','')}
  ${fm('wu = 1.5x(24.75+2.01+12)','= 58.1 kN/m','')}
  ${fm('Mmax = 58.1x4^2/8','= 116.3 kN.m','')}
  ${fm('Mulim (D=350mm) = 0.1338x25x230x292^2/10^6 = 65.7 kN.m < 116.3','-> DOUBLY REINFORCED','')}
  <div class="rv"><div class="rv-t">!! DESIGN REVISION  -  Increase D to avoid doubly reinforced</div><div class="rv-b">As senior engineer: singly reinforced beams are simpler, more reliable, and easier to detail. Revised D=450mm -> d=397mm -> Mulim = 0.1338x25x230x397^2/10^6 = 121.8 kN.m > 116.3 kN.m OK SINGLY</div></div>
  ${svgBMD(4,R.beam.wu,R.beam.Mmax)}
  ${fm('Ast_mid = 838mm^2 -> 3-T20 = 942mm^2 OK','bottom steel','')}
  ${fm('Ast_sup = 527mm^2 -> 2-T20 = 628mm^2 OK','top steel','')}
  ${fm('tvv = 116300/(230x397) = 1.27 N/mm^2 | tvc = 0.63 N/mm^2 | Sv = 200mm c/c','mid-zone stirrups','')}
  ${fm('IS 13920: end zone = max(2x450, 4000/4) = 1000mm -> T8@100mm c/c','','IS 13920 Cl 6.3.5')}
  ${svgBeamXS(230,450,40,3,20,2,20,100)}
  ${vd(true,'230x450mm | 3T20 bot + 2T20 top | T8@100mm(end 1000mm) + T8@200mm(mid) | 135 deg hooks | delta=10.1mm < 16mm OK')}
</div>
<div class="card vi">
  <div class="ct vi">6. Interior Column  -  Ground Floor</div>
  <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
    <div style="flex:2;min-width:240px">
      ${svgTribArea('interior',4,3)}
      ${fm('Trib area (interior) = (4/2+4/2)x(3/2+3/2) = 4x3','= 12 m^2','')}
      ${fm('Ps = (DL+LL)x12x4 floors = 8.25x12x4 (approx)','= 396 kN -> with self-weight ~ 465 kN','')}
      ${fm('Pu = 1.5x310','= 465 kN','')}
      ${fm('Ag_req = 465000/(0.4x25+0.01x(0.67x500-10))','= 35,100 mm^2 -> size = 187mm -> use 300mm','IS 13920 min')}
      ${fm('4T16 = 804mm^2 (0.89%  -  min 0.8%) OK','','')}
      ${fm('Pu_cap = 0.4x25x(90000-804)+0.67x500x804/1000','= 1165 kN >> 465 kN OK','')}
      ${fm('IS 13920 confinement: Lo = max(300, 3200/6, 450) = 533 -> 600mm','T8@75mm c/c','IS 13920 Cl 7.4')}
    </div>
    <div style="flex:1;min-width:190px">
      ${svgColXS(300,4,16,40)}
      ${svgConfinement(300,600,250,75,3.2)}
    </div>
  </div>
  ${vd(true,'300x300mm | 4T16 | T8@75mm c/c (600mm from ends) | T8@250mm general | 135 deg hooks')}
</div>
<div class="card ye">
  <div class="ct ye">7. Interior Footing Design  -  Full Shear Checks</div>
  ${svgFooting(1.5,300,400,12,200)}
  ${fm('Ps = 310kN | SBC_net = 173kN/m^2 | B = sqrt(310/173) = 1.34m -> 1.5mx1.5m','','')}
  ${fm('qu = 310/2.25 = 137.8 kN/m^2 | qu_fac = 1.5x137.8 = 206.7 kN/m^2','','')}
  ${fm('D = 400mm, d = 317mm','','')}
  ${fm('PUNCHING: bo=4(300+317)=2468mm | Vu=465-206.7x(0.617)^2=386kN | tvv=0.494 N/mm^2','< tvc=1.25 OK','IS 456 Cl 31.6')}
  ${fm('ONE-WAY: proj=(1500-300)/2-317=283mm | Vu_ow=207x1.5x0.283=87.8kN | tvv=0.184','< tvc=0.36 OK','IS 456 Cl 34.2.4')}
  ${fm('T12@200mm EW -> Ast=565mm^2/m > 480mm^2 (min 0.12%) OK','','')}
  ${vd(true,'1.5mx1.5m, D=400mm | T12@200mm EW | Punching SAFE (0.494<1.25) | One-way SAFE (0.184<0.36) | Cover 75mm')}
</div>
<div class="card" style="border-color:rgba(251,146,60,.3)">
  <div class="ct or">8. Secondary Beam Design  -  3m Y-direction Span</div>
  <div class="cd">Secondary beams span in Y-direction (3m). Lighter than main beams  -  no wall load, smaller tributary.</div>
  ${svgBeamLoad(3,24.4,36.6)}
  ${fm('b=230mm (min), D=275mm (l/d=12->250->+25mm), d=217mm','','IS 456')}
  ${fm('Slab UDL = (DL+FF+PL+LL)xtrib = 8.25x2.0','= 16.5 kN/m','')}
  ${fm('SW = (0.23x0.275x25)','= 1.58 kN/m','')}
  ${fm('wu = 1.5x(16.5+1.58)','= 27.1 kN/m','')}
  ${fm('Mmax = 27.1x3^2/8','= 30.5 kN.m','midspan')}
  ${fm('Mulim = 0.1338x25x230x217^2/10^6','= 36.2 kN.m > 30.5 OK SINGLY','IS 456 Annex G')}
  ${svgBMD(3,27.1,30.5)}
  ${fm('Ast_mid = 340mm^2 -> 2T16 = 402mm^2 OK','','IS 456')}
  ${fm('Ast_top = 227mm^2 -> 2T12 = 226mm^2 -> use 2T16','','IS 456')}
  ${fm('tvv = 40650/(230x217) = 0.814 N/mm^2 | tvc (pt=0.80%) ~ 0.595 | Sv = 175mm','T8@175mm mid','IS 456')}
  ${fm('End zone IS 13920: T8@54mm -> use 50mm c/c for 600mm from support','','IS 13920 Cl 6.3.5')}
  ${svgBeamXS(230,275,40,2,16,2,16,50)}
  ${vd(true,'Secondary Beam SB: 230x275mm | 2T16 bot + 2T16 top | T8@50mm(end 600mm) + T8@175mm(mid) | delta=3.8mm < 12mm OK')}
</div>
<div class="card vi">
  <div class="ct vi">9. Corner Column  -  Ground Floor</div>
  <div class="cd">Corner column carries only 1/4 bay area  -  lightest column in building.</div>
  <div style="display:flex;gap:14px;flex-wrap:wrap">
    <div style="flex:2;min-width:220px">
      ${svgTribArea('corner',4,3)}
      ${fm('Trib area = 4/2 x 3/2','= 6.0 m^2 (1/4 bay area, lightest column)','')}
      ${fm('Ps = (DL+0.25LL)xareax4 + wall contribution','~ 165 kN (4 floors)','')}
      ${fm('Pu = 1.5 x 165','= 247 kN','')}
      ${fm('Ag_req -> size = 300x300mm (minimum IS 13920)','300x300mm','')}
      ${fm('4T16 = 804mm^2 (0.89%) | Pu_cap = 1165 kN >> 247 kN','VERY conservative','corner col')}
      ${fm('IS 13920: Lo=600mm, T8@75mm c/c | General: T8@250mm','','IS 13920 Cl 7.4')}
    </div>
    <div style="flex:1;min-width:180px">
      ${svgColXS(300,4,16,40)}
      ${svgConfinement(300,600,250,75,3.2)}
    </div>
  </div>
  ${vd(true,'Corner Col: 300x300mm | 4T16 | Pu_cap=1165kN >> Pu=247kN | T8@75mm(conf Lo=600mm) | T8@250mm general')}
</div>
<div class="card vi">
  <div class="ct vi">10. Edge Column  -  Ground Floor</div>
  <div class="cd">Edge column carries 1/2 bay area  -  intermediate between corner and interior.</div>
  <div style="display:flex;gap:14px;flex-wrap:wrap">
    <div style="flex:2;min-width:220px">
      ${svgTribArea('edge',4,3)}
      ${fm('Trib area = 4/2 x 3/2 x 2','= 12.0 m^2 (1/2 bay area)','')}
      ${fm('Ps = (DL+0.25LL)x12x4 floors','~ 350 kN (cumulative)','')}
      ${fm('Pu = 1.5 x 350','= 525 kN','')}
      ${fm('Size = 300x300mm (IS 13920 min) | 4T16 (same as corner  -  min steel governs)','','')}
      ${fm('Pu_cap = 1165 kN > 525 kN OK | IS 13920: T8@75mm (Lo=600mm)','','')}
    </div>
    <div style="flex:1;min-width:180px">
      ${svgColXS(300,4,16,40)}
    </div>
  </div>
  ${vd(true,'Edge Col: 300x300mm | 4T16 | Pu_cap=1165kN >> Pu=525kN | T8@75mm(conf) | T8@250mm')}
</div>
<div class="card ye">
  <div class="ct ye">11. Corner & Edge Footing Design</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div>
      <div style="font-size:11px;font-weight:700;color:var(--yellow);margin-bottom:6px">Corner Footing (Ps=165kN)</div>
      ${fm('B = sqrt(165/173)','= 0.98m -> use 1.0mx1.0m','')}
      ${fm('qu = 165/1.0','= 165 kN/m^2 < 173 OK','')}
      ${fm('D = 300mm, d = 217mm','','')}
      ${fm('PUNCHING: bo=4(300+217)=2068mm | tvv=0.302 N/mm^2 < tvc=1.25 OK','','')}
      ${fm('ONE-WAY: proj=150mm | tvv=0.109 N/mm^2 < tvc=0.36 OK','','')}
      ${fm('T10@200mm EW (Ast_min governs)','','')}
      ${vd(true,'1.0x1.0m, D=300mm | T10@200mm EW | SAFE OK')}
    </div>
    <div>
      <div style="font-size:11px;font-weight:700;color:var(--yellow);margin-bottom:6px">Edge Footing (Ps=350kN)</div>
      ${fm('B = sqrt(350/173)','= 1.42m -> use 1.5mx1.5m','')}
      ${fm('qu = 350/2.25','= 155.6 kN/m^2 < 173 OK','')}
      ${fm('D = 375mm -> use 400mm, d = 317mm','','')}
      ${fm('PUNCHING: tvv=0.463 N/mm^2 < tvc=1.25 OK','','')}
      ${fm('ONE-WAY: tvv=0.158 N/mm^2 < tvc=0.36 OK','','')}
      ${fm('T12@200mm EW (same as interior)','','')}
      ${vd(true,'1.5x1.5m, D=400mm | T12@200mm EW | SAFE OK')}
    </div>
  </div>
  ${svgFooting(1.5,300,400,12,200)}
</div>
<div class="card bl" style="background:linear-gradient(135deg,#071428,#0c1a3a);margin-top:14px">
  <div class="ct">📋 Complete Reference Design Schedule  -  G+3 Delhi</div>
  <table>
    <tr><th>Member</th><th>Type</th><th>Size</th><th>Main Steel</th><th>Links/Ties</th><th>Check</th></tr>
    <tr><td>Slab</td><td>2-way 4x3m</td><td class="val">150mm</td><td class="val">T10@200(X)+T8@200(Y) bot</td><td>T8@250 top at sup</td><td class="ok">OK</td></tr>
    <tr><td>Main Beam</td><td>4m X-span (edge)</td><td class="val">230x450mm</td><td class="val">3T20 bot + 2T20 top</td><td>T8@100(end) @200(mid)</td><td class="ok">delta=10mm OK</td></tr>
    <tr><td>Sec. Beam</td><td>3m Y-span</td><td class="val">230x275mm</td><td class="val">2T16 bot + 2T16 top</td><td>T8@50(end) @175(mid)</td><td class="ok">delta=3.8mm OK</td></tr>
    <tr><td>Corner Col</td><td>GF (Pu=247kN)</td><td class="val">300x300mm</td><td class="val">4T16 (0.89%)</td><td>T8@75(Lo=600mm) @250</td><td class="ok">cap=1165kN OK</td></tr>
    <tr><td>Edge Col</td><td>GF (Pu=525kN)</td><td class="val">300x300mm</td><td class="val">4T16 (0.89%)</td><td>T8@75(Lo=600mm) @250</td><td class="ok">cap=1165kN OK</td></tr>
    <tr><td>Interior Col</td><td>GF (Pu=465kN)</td><td class="val">300x300mm</td><td class="val">4T16 (0.89%)</td><td>T8@75(Lo=600mm) @250</td><td class="ok">cap=1165kN OK</td></tr>
    <tr><td>Corner Ftg</td><td>Ps=165kN</td><td class="val">1.0x1.0m D=300mm</td><td class="val">T10@200 EW</td><td>Cover 75mm</td><td class="ok">Punch 0.30<1.25 OK</td></tr>
    <tr><td>Edge Ftg</td><td>Ps=350kN</td><td class="val">1.5x1.5m D=400mm</td><td class="val">T12@200 EW</td><td>Cover 75mm</td><td class="ok">Punch 0.46<1.25 OK</td></tr>
    <tr><td>Interior Ftg</td><td>Ps=310kN</td><td class="val">1.5x1.5m D=400mm</td><td class="val">T12@200 EW</td><td>Cover 75mm</td><td class="ok">Punch 0.49<1.25 OK</td></tr>
    <tr><td>Staircase</td><td>Waist slab</td><td class="val">150mm</td><td class="val">T10@200mm main</td><td>T8@300mm dist.</td><td class="ok">Mu=14.3 OK</td></tr>
  </table>
  <div class="cp" style="margin-top:10px;font-size:10px">
    <strong style="color:var(--blue)">Key learning: All 3 column types (corner/edge/interior) end up 300x300mm with 4T16.</strong> This is because IS 13920 Zone IV requires minimum 300mm size  -  the load capacity is far above what's needed in all cases. In taller buildings (G+8+) or larger spans, the interior columns would be larger. For G+3, detailing requirements (not load) govern column size.
  </div>
  <button class="btn" style="width:100%;margin-top:12px;padding:11px" onclick="go(1)">Now Design Your Own Building -></button>
</div>`;}

function drawRefGrid(){
  const el=document.getElementById('refGrid');if(!el)return;
  const W=640,H=240,pad=30;
  const sx=[4,4,4],sy=[3,3,3];
  let xs=[pad],ys=[pad];
  const scx=(W-2*pad)/12,scy=(H-2*pad)/9;
  sx.forEach(s=>xs.push(xs[xs.length-1]+s*scx));
  sy.forEach(s=>ys.push(ys[ys.length-1]+s*scy));
  let g=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block">`;
  g+=`<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;
  // slab hatch
  for(let r=0;r<3;r++)for(let c=0;c<3;c++){const x1=xs[c],y1=ys[r],x2=xs[c+1],y2=ys[r+1];for(let i=x1;i<x2;i+=8)g+=`<line x1="${i}" y1="${y1}" x2="${i}" y2="${y2}" stroke="rgba(56,189,248,0.08)"/>`;}
  // beams
  xs.forEach(x=>g+=`<line x1="${x}" y1="${ys[0]}" x2="${x}" y2="${ys[3]}" stroke="#fb923c" stroke-width="4.5" stroke-linecap="round"/>`);
  ys.forEach(y=>g+=`<line x1="${xs[0]}" y1="${y}" x2="${xs[3]}" y2="${y}" stroke="#fb923c" stroke-width="4.5" stroke-linecap="round"/>`);
  // columns
  xs.forEach(x=>ys.forEach(y=>{g+=`<rect x="${x-8}" y="${y-8}" width="16" height="16" fill="#374151" stroke="#34d399" stroke-width="2" rx="2"/>`;g+=`<circle cx="${x}" cy="${y}" r="3" fill="#34d399"/>`;;}));
  // labels
  for(let i=0;i<3;i++)g+=`<text x="${(xs[i]+xs[i+1])/2}" y="${ys[0]-8}" fill="#fb923c" font-size="10" text-anchor="middle" font-family="JetBrains Mono">${sx[i]}m</text>`;
  for(let i=0;i<3;i++)g+=`<text x="${xs[0]-8}" y="${(ys[i]+ys[i+1])/2+4}" fill="#fb923c" font-size="10" text-anchor="end" font-family="JetBrains Mono">${sy[i]}m</text>`;
  g+=`<text x="${W/2}" y="${H-4}" fill="#38bdf8" font-size="10" text-anchor="middle" font-family="JetBrains Mono">G+3 Delhi . 12mx9m Plan . 4 columns x 4 columns = 16 columns per floor</text>`;
  g+='</svg>';
  el.innerHTML=g;
}

// =======================================================
// PDF GENERATOR  -  FIXED, CHUNKED APPROACH
// =======================================================

// == 09_pdf.js ==

// ================================================================
// MODULE: 09_pdf
// PDF report generator
// ================================================================



// ── PDF MEMBER SELECTOR DIALOG ───────────────────────────────────
function showPDFDialog(){
  if(!RES){alert('Run analysis first.');return;}
  const old=document.getElementById('pdfDlg');if(old)old.remove();

  const allBeams =RES.allBeams||RES.beams||[];
  const allCols  =RES.allCols||RES.cols||[];
  const allFtgs  =RES.allFtgs||RES.ftgs||[];
  const panels   =RES.allSlabPanels||[];
  const nx=GRID?GRID.nx:3, ny=GRID?GRID.ny:3;
  const numFloors=S.numFloors||1;

  // ── Build inner HTML ──────────────────────────────────────────
  function floorLabel(f){ return f===numFloors?'Roof':'F'+f; }

  // ── BEAM PLAN GRID (per floor) ────────────────────────────────
  function beamGrid(flr){
    const fb=allBeams.filter(b=>b.floor===flr);
    const xB=fb.filter(b=>b.dir==='X');
    const yB=fb.filter(b=>b.dir==='Y');
    const sB=fb.filter(b=>b.isSecondary||b.isTransfer||b.isCantilever);
    function beamChk(b){
      const i=allBeams.indexOf(b);
      const ok=b.deflOK&&b.shearSafe;
      return`<label style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:4px;
        border:1px solid ${ok?'#f97316':'rgba(248,113,113,0.6)'};cursor:pointer;font-size:9px;
        color:${ok?'#f97316':'#f87171'};background:rgba(249,115,22,0.05);white-space:nowrap">
        <input type="checkbox" class="pdf_beam_cb" data-idx="${i}" checked style="accent-color:#f97316;width:10px;height:10px">
        ${b.label} <span style="font-size:8px;opacity:.6">${b.L}m</span>
      </label>`;
    }
    return`
      ${xB.length?`<div style="font-size:9px;color:#fb923c;font-weight:700;margin-bottom:3px">X-DIRECTION (${xB.length})</div>
        <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">${xB.map(beamChk).join('')}</div>`:''}
      ${yB.length?`<div style="font-size:9px;color:#fbbf24;font-weight:700;margin-bottom:3px">Y-DIRECTION (${yB.length})</div>
        <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">${yB.map(beamChk).join('')}</div>`:''}
      ${sB.length?`<div style="font-size:9px;color:#8b5cf6;font-weight:700;margin-bottom:3px">SPECIAL</div>
        <div style="display:flex;flex-wrap:wrap;gap:3px">${sB.map(beamChk).join('')}</div>`:''}`;
  }

  // ── COLUMN PLAN GRID ──────────────────────────────────────────
  function colGrid(flr){
    const fc=allCols.filter(c=>c.floor===flr).sort((a,b)=>a.row-b.row||a.col-b.col);
    let g=`<div style="display:inline-grid;gap:3px;grid-template-columns:repeat(${nx+2},auto)">`;
    g+=`<div></div>`;
    for(let c=0;c<=nx;c++) g+=`<div style="text-align:center;font-size:8px;color:#38bdf8;padding:1px 4px;font-weight:700">${c+1}</div>`;
    for(let r=0;r<=ny;r++){
      g+=`<div style="font-size:8px;color:#38bdf8;padding:1px 4px;font-weight:700;align-self:center">${String.fromCharCode(65+r)}</div>`;
      for(let c=0;c<=nx;c++){
        const node=GRID&&GRID.nodes.find(n=>n.row===r&&n.col===c);
        const isCol=node&&(node.hasColumn||node.isWall);
        const cr=isCol?fc.find(x=>x.row===r&&x.col===c):null;
        const idx=cr?allCols.indexOf(cr):-1;
        const ok=cr?cr.safe:true;
        const lbl=cr?(cr.baseLabel||String.fromCharCode(65+r)+(c+1)):'';
        if(!isCol){
          g+=`<div style="width:36px;height:32px;border:1px dashed #1e293b;border-radius:4px;opacity:.2"></div>`;
        } else if(!cr){
          g+=`<div style="width:36px;height:32px;border:1px dashed #64748b;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:7px;color:#64748b">${String.fromCharCode(65+r)}${c+1}</div>`;
        } else {
          g+=`<label style="display:flex;flex-direction:column;align-items:center;justify-content:center;
            width:36px;height:32px;border-radius:4px;cursor:pointer;font-size:7px;font-weight:700;
            border:1.5px solid ${ok?'#a78bfa':'#f87171'};
            background:${ok?'rgba(167,139,250,0.1)':'rgba(248,113,113,0.1)'};
            color:${ok?'#a78bfa':'#f87171'}">
            <input type="checkbox" class="pdf_col_cb" data-nodeId="${cr.nodeId}" checked
              style="accent-color:#a78bfa;width:9px;height:9px;margin-bottom:1px">
            <span style="font-size:7px;line-height:1">${lbl}</span>
          </label>`;
        }
      }
    }
    g+=`</div>`;
    return g;
  }

  // ── FOOTING PLAN GRID ─────────────────────────────────────────
  function ftgGrid(){
    let g=`<div style="display:inline-grid;gap:3px;grid-template-columns:repeat(${nx+2},auto)">`;
    g+=`<div></div>`;
    for(let c=0;c<=nx;c++) g+=`<div style="text-align:center;font-size:8px;color:#38bdf8;padding:1px 4px;font-weight:700">${c+1}</div>`;
    for(let r=0;r<=ny;r++){
      g+=`<div style="font-size:8px;color:#38bdf8;padding:1px 4px;font-weight:700;align-self:center">${String.fromCharCode(65+r)}</div>`;
      for(let c=0;c<=nx;c++){
        const node=GRID&&GRID.nodes.find(n=>n.row===r&&n.col===c);
        const isCol=node&&(node.hasColumn||node.isWall);
        const fr=isCol?allFtgs.find(f=>f.row===r&&f.col===c):null;
        const idx=fr?allFtgs.indexOf(fr):-1;
        const ok=fr&&fr.punch_ok&&fr.ow_ok;
        const lbl=fr?((fr.label||fr.baseLabel||'FTG').slice(0,6)):'';
        if(!isCol){
          g+=`<div style="width:38px;height:34px;border:1px dashed #1e293b;border-radius:4px;opacity:.2"></div>`;
        } else if(!fr){
          g+=`<div style="width:38px;height:34px;border:1px dashed #64748b;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:7px;color:#64748b">${String.fromCharCode(65+r)}${c+1}</div>`;
        } else {
          g+=`<label style="display:flex;flex-direction:column;align-items:center;justify-content:center;
            width:38px;height:34px;border-radius:4px;cursor:pointer;font-size:7px;font-weight:700;
            border:1.5px solid ${ok?'#fbbf24':'#f87171'};
            background:${ok?'rgba(251,191,36,0.1)':'rgba(248,113,113,0.1)'};
            color:${ok?'#fbbf24':'#f87171'}">
            <input type="checkbox" class="pdf_ftg_cb" data-idx="${idx}" checked
              style="accent-color:#fbbf24;width:9px;height:9px;margin-bottom:2px">
            <span style="font-size:6px;line-height:1;text-align:center">${lbl}</span>
          </label>`;
        }
      }
    }
    g+=`</div>`;
    return g;
  }

  // ── SLAB PLAN GRID ────────────────────────────────────────────
  function slabGrid(){
    const typPanels=panels.filter(p=>p.floor==='Typical');
    if(!typPanels.length) return`<div style="font-size:9px;color:#64748b">No slab panels found.</div>`;
    let g=`<div style="display:inline-grid;gap:3px;grid-template-columns:repeat(${nx},auto)">`;
    for(let r=0;r<ny;r++){
      for(let c=0;c<nx;c++){
        const p=typPanels.find(x=>x.row===r&&x.col===c);
        const stair=RES.stairPanels&&RES.stairPanels.find(s=>s.row===r&&s.col===c);
        const bay=GRID&&GRID.bays.find(b=>b.row===r&&b.col===c);
        if(stair){
          g+=`<div style="width:52px;height:44px;border:1px solid #f59e0b;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:7px;color:#f59e0b;background:rgba(245,158,11,0.08);flex-direction:column">
            🪜<span>STAIR</span></div>`;
        } else if(!p){
          const btype=bay?bay.type.toUpperCase():'VOID';
          g+=`<div style="width:52px;height:44px;border:1px dashed #1e293b;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:7px;color:#64748b;opacity:.5">${btype}</div>`;
        } else {
          const idx=typPanels.indexOf(p);
          const ok=p.ok;
          g+=`<label style="display:flex;flex-direction:column;align-items:center;justify-content:center;
            width:52px;height:44px;border-radius:4px;cursor:pointer;
            border:1.5px solid ${ok?'#38bdf8':'#f87171'};
            background:${ok?'rgba(56,189,248,0.08)':'rgba(248,113,113,0.08)'};
            color:${ok?'#38bdf8':'#f87171'}">
            <input type="checkbox" class="pdf_slab_cb" data-idx="${idx}" checked
              style="accent-color:#38bdf8;width:9px;height:9px;margin-bottom:2px">
            <span style="font-size:8px;font-weight:700">${p.bayLabel.replace('Bay ','')}</span>
            <span style="font-size:7px;opacity:.7">${p.lx.toFixed(1)}×${p.ly.toFixed(1)}</span>
          </label>`;
        }
      }
    }
    g+=`</div>`;
    return g;
  }

  // ── Beam floors tabs HTML ─────────────────────────────────────
  const beamFloors=[...new Set(allBeams.map(b=>b.floor))].sort((a,b2)=>a-b2);
  const colFloors =[...new Set(allCols.map(c=>c.floor))].sort((a,b2)=>a-b2);
  const firstBeamFloor=beamFloors[0]||1;
  const firstColFloor=colFloors[0]||1;

  function floorTabsHTML(floors, prefix, color, activeFl){
    return floors.map(f=>`<button id="${prefix}_tab_${f}"
      onclick="pdfFloorTab('${prefix}',${f},[${floors.join(',')}])"
      style="padding:3px 10px;border-radius:5px;border:1px solid ${color};
      background:${f===activeFl?color+'33':'transparent'};
      color:${f===activeFl?color:'#64748b'};cursor:pointer;font-size:9px;font-weight:700">
      ${floorLabel(f)}
    </button>`).join('');
  }

  const dlg=document.createElement('div');
  dlg.id='pdfDlg';
  dlg.style.cssText='position:fixed;inset:0;background:rgba(0,5,20,0.92);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto';

  dlg.innerHTML=`
  <div style="background:#0a0f1e;border:2px solid #1e40af;border-radius:14px;width:100%;max-width:780px;padding:24px">

    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
      <div>
        <div style="font-size:20px;font-weight:900;color:#38bdf8">📄 Download Report PDF</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px">Select members to include. Uncheck any to exclude from report.</div>
      </div>
      <button onclick="document.getElementById('pdfDlg').remove()"
        style="background:none;border:1px solid #64748b;border-radius:6px;color:#64748b;cursor:pointer;padding:4px 10px;font-size:14px">✕</button>
    </div>

    <!-- Section toggles -->
    <div style="margin-bottom:16px;padding:10px 12px;background:#060f1f;border-radius:8px;border:1px solid #1e293b">
      <div style="font-size:10px;font-weight:700;color:#64748b;margin-bottom:7px">REPORT SECTIONS</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${['Cover & Summary','Project & Materials','Loads & Seismic','Wind & Slab','Beams','Columns','Footings','Safety Summary','Design Schedule','Code Notes']
          .map((s,i)=>`<label style="display:flex;align-items:center;gap:4px;padding:4px 9px;border-radius:5px;border:1px solid #1e3a8a;cursor:pointer;font-size:10px;color:#94a3b8;white-space:nowrap">
            <input type="checkbox" id="pdf_sec_${i}" checked style="accent-color:#38bdf8"> ${s}
          </label>`).join('')}
      </div>
    </div>

    <!-- SLAB -->
    <div style="margin-bottom:12px;padding:12px;background:#060f1f;border-radius:8px;border:1px solid #1e3a8a">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-size:11px;font-weight:700;color:#38bdf8">🔲 SLAB PANELS (Typical Floor)</div>
        <label style="font-size:9px;color:#64748b;cursor:pointer;display:flex;align-items:center;gap:4px">
          <input type="checkbox" id="pdf_slab_all" checked
            onchange="document.querySelectorAll('.pdf_slab_cb').forEach(x=>x.checked=this.checked)"
            style="accent-color:#38bdf8"> All panels
        </label>
      </div>
      <div style="overflow-x:auto">${slabGrid()}</div>
      <div style="font-size:8px;color:#64748b;margin-top:5px">Blue = pass | Red = fail | Uncheck to exclude from PDF</div>
    </div>

    <!-- BEAMS -->
    <div style="margin-bottom:12px;padding:12px;background:#060f1f;border-radius:8px;border:1px solid #1e3a8a">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-size:11px;font-weight:700;color:#f97316">🔶 BEAMS</div>
        <label style="font-size:9px;color:#64748b;cursor:pointer;display:flex;align-items:center;gap:4px">
          <input type="checkbox" id="pdf_beam_all" checked
            onchange="document.querySelectorAll('.pdf_beam_cb').forEach(x=>x.checked=this.checked)"
            style="accent-color:#f97316"> All beams
        </label>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px" id="pdf_beam_floor_tabs">
        ${floorTabsHTML(beamFloors,'pdf_bft','#f97316',firstBeamFloor)}
      </div>
      <div id="pdf_beam_member_grid">${beamGrid(firstBeamFloor)}</div>
      <div style="font-size:8px;color:#64748b;margin-top:5px">Orange = pass | Red = fail | Switch floor tabs to select per floor</div>
    </div>

    <!-- COLUMNS -->
    <div style="margin-bottom:12px;padding:12px;background:#060f1f;border-radius:8px;border:1px solid #1e3a8a">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-size:11px;font-weight:700;color:#a78bfa">🏛 COLUMNS</div>
        <label style="font-size:9px;color:#64748b;cursor:pointer;display:flex;align-items:center;gap:4px">
          <input type="checkbox" id="pdf_col_all" checked
            onchange="document.querySelectorAll('.pdf_col_cb').forEach(x=>x.checked=this.checked)"
            style="accent-color:#a78bfa"> All columns
        </label>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px" id="pdf_col_floor_tabs">
        ${floorTabsHTML(colFloors,'pdf_cft','#a78bfa',firstColFloor)}
      </div>
      <div id="pdf_col_member_grid" style="overflow-x:auto">${colGrid(firstColFloor)}</div>
      <div style="font-size:8px;color:#64748b;margin-top:5px">Purple = safe | Red = fail | Plan view — click to select/deselect</div>
    </div>

    <!-- FOOTINGS -->
    <div style="margin-bottom:20px;padding:12px;background:#060f1f;border-radius:8px;border:1px solid #1e3a8a">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-size:11px;font-weight:700;color:#fbbf24">🏗 FOOTINGS</div>
        <label style="font-size:9px;color:#64748b;cursor:pointer;display:flex;align-items:center;gap:4px">
          <input type="checkbox" id="pdf_ftg_all" checked
            onchange="document.querySelectorAll('.pdf_ftg_cb').forEach(x=>x.checked=this.checked)"
            style="accent-color:#fbbf24"> All footings
        </label>
      </div>
      <div style="overflow-x:auto">${ftgGrid()}</div>
      <div style="font-size:8px;color:#64748b;margin-top:5px">Yellow = pass | Red = fail | Plan view matches building layout</div>
    </div>

    <!-- Buttons -->
    <div style="display:flex;gap:10px;justify-content:flex-end;align-items:center">
      <button onclick="document.getElementById('pdfDlg').remove()"
        style="padding:9px 20px;background:transparent;border:1.5px solid #64748b;border-radius:7px;color:#94a3b8;cursor:pointer;font-size:12px">Cancel</button>
      <button onclick="startPDFWithFilters()"
        style="padding:9px 28px;background:linear-gradient(135deg,#1d4ed8,#2563eb);border:none;border-radius:7px;color:#fff;cursor:pointer;font-size:13px;font-weight:800;letter-spacing:.3px">
        ↓ Generate PDF
      </button>
    </div>
  </div>`;

  document.body.appendChild(dlg);
}

function pdfFloorTab(prefix, flr, allFloors){
  // Highlight active tab
  allFloors.forEach(f=>{
    const t=document.getElementById(prefix+'_tab_'+f);
    if(!t)return;
    const color=prefix==='pdf_bft'?'#f97316':'#a78bfa';
    t.style.background=f===flr?color+'33':'transparent';
    t.style.color=f===flr?color:'#64748b';
  });
  // Regenerate member grid
  if(prefix==='pdf_bft'){
    const grid=document.getElementById('pdf_beam_member_grid');
    if(grid){
      const allBeams2=RES.allBeams||RES.beams||[];
      const fb=allBeams2.filter(b=>b.floor===flr);
      const xB=fb.filter(b=>b.dir==='X');
      const yB=fb.filter(b=>b.dir==='Y');
      const sB=fb.filter(b=>b.isSecondary||b.isTransfer||b.isCantilever);
      function bChk(b){
        const i=allBeams2.indexOf(b);
        const ok=b.deflOK&&b.shearSafe;
        return`<label style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:4px;
          border:1px solid ${ok?'#f97316':'rgba(248,113,113,0.6)'};cursor:pointer;font-size:9px;
          color:${ok?'#f97316':'#f87171'};background:rgba(249,115,22,0.05);white-space:nowrap">
          <input type="checkbox" class="pdf_beam_cb" data-idx="${i}" checked style="accent-color:#f97316;width:10px;height:10px">
          ${b.label} <span style="font-size:8px;opacity:.6">${b.L}m</span>
        </label>`;
      }
      grid.innerHTML=
        (xB.length?`<div style="font-size:9px;color:#fb923c;font-weight:700;margin-bottom:3px">X-DIRECTION</div><div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">${xB.map(bChk).join('')}</div>`:'')+
        (yB.length?`<div style="font-size:9px;color:#fbbf24;font-weight:700;margin-bottom:3px">Y-DIRECTION</div><div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">${yB.map(bChk).join('')}</div>`:'')+
        (sB.length?`<div style="font-size:9px;color:#8b5cf6;font-weight:700;margin-bottom:3px">SPECIAL</div><div style="display:flex;flex-wrap:wrap;gap:3px">${sB.map(bChk).join('')}</div>`:'');
    }
  } else {
    const grid=document.getElementById('pdf_col_member_grid');
    if(grid){
      const allCols2=RES.allCols||RES.cols||[];
      const fc=allCols2.filter(c=>c.floor===flr).sort((a,b)=>a.row-b.row||a.col-b.col);
      const nx2=GRID?GRID.nx:3, ny2=GRID?GRID.ny:3;
      let g=`<div style="display:inline-grid;gap:3px;grid-template-columns:repeat(${nx2+2},auto)">`;
      g+=`<div></div>`;
      for(let c=0;c<=nx2;c++) g+=`<div style="text-align:center;font-size:8px;color:#38bdf8;padding:1px 4px;font-weight:700">${c+1}</div>`;
      for(let r=0;r<=ny2;r++){
        g+=`<div style="font-size:8px;color:#38bdf8;padding:1px 4px;font-weight:700;align-self:center">${String.fromCharCode(65+r)}</div>`;
        for(let c=0;c<=nx2;c++){
          const node=GRID&&GRID.nodes.find(n=>n.row===r&&n.col===c);
          const isCol2=node&&(node.hasColumn||node.isWall);
          const cr=isCol2?fc.find(x=>x.row===r&&x.col===c):null;
          const ok=cr?cr.safe:true;
          const lbl=cr?(cr.baseLabel||String.fromCharCode(65+r)+(c+1)):'';
          if(!isCol2){
            g+=`<div style="width:36px;height:32px;border:1px dashed #1e293b;border-radius:4px;opacity:.2"></div>`;
          } else if(!cr){
            g+=`<div style="width:36px;height:32px;border:1px dashed #64748b;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:7px;color:#64748b">${String.fromCharCode(65+r)}${c+1}</div>`;
          } else {
            g+=`<label style="display:flex;flex-direction:column;align-items:center;justify-content:center;
              width:36px;height:32px;border-radius:4px;cursor:pointer;font-size:7px;font-weight:700;
              border:1.5px solid ${ok?'#a78bfa':'#f87171'};
              background:${ok?'rgba(167,139,250,0.1)':'rgba(248,113,113,0.1)'};
              color:${ok?'#a78bfa':'#f87171'}">
              <input type="checkbox" class="pdf_col_cb" data-nodeId="${cr.nodeId}" checked
                style="accent-color:#a78bfa;width:9px;height:9px;margin-bottom:1px">
              <span style="font-size:7px;line-height:1">${lbl}</span>
            </label>`;
          }
        }
      }
      g+=`</div>`;
      grid.innerHTML=g;
    }
  }
}

function startPDFWithFilters(){
  const selBeamIdxs =[...document.querySelectorAll('.pdf_beam_cb:checked')].map(x=>parseInt(x.dataset.idx));
  const selColNodeIds=[...document.querySelectorAll('.pdf_col_cb:checked')].map(x=>parseInt(x.dataset.nodeId));
  const selFtgIdxs  =[...document.querySelectorAll('.pdf_ftg_cb:checked')].map(x=>parseInt(x.dataset.idx));
  const selSecs     =[...document.querySelectorAll('[id^=pdf_sec_]:checked')].map(x=>parseInt(x.id.replace('pdf_sec_','')));
  const selSlabIdxs =[...document.querySelectorAll('.pdf_slab_cb:checked')].map(x=>parseInt(x.dataset.idx));
  document.getElementById('pdfDlg').remove();
  window._pdfFilters={beamIdxs:selBeamIdxs,colNodeIds:selColNodeIds,ftgIdxs:selFtgIdxs,sections:selSecs,slabIdxs:selSlabIdxs};
  startPDF();
}


async function startPDF(){
  if(!RES){alert('Run analysis first');return;}
  const pDiv=document.getElementById('pdfProg');
  const pLog=document.getElementById('pdfLog');
  if(pDiv)pDiv.style.display='block';
  const log=msg=>{if(pLog)pLog.innerHTML+=`<div>OK ${msg}</div>`;};
  await new Promise(r=>setTimeout(r,50));
  try{
    const{jsPDF}=window.jspdf;
    const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    const PW=210,PH=297,ML=14,MR=14,LW=PW-ML-MR;
    let y=20;
    // Safe helpers
    const sf=v=>{const n=parseFloat(v);return isFinite(n)?n:0;};
    const sr=s=>{var t=String(s||'');var o='';for(var i=0;i<t.length;i++){var c=t.charCodeAt(i);if(c===9||c===10||c===13||(c>=32&&c<=126))o+=t[i];}return o;};

    const F=(sz,wt,r,g,b)=>{doc.setFont('helvetica',wt||'normal');doc.setFontSize(sf(sz)||9);doc.setTextColor(sf(r)||0,sf(g)||0,sf(b)||0);};
    const setFill=(r,g,b)=>doc.setFillColor(sf(r),sf(g),sf(b));
    const setStroke=(r,g,b)=>doc.setDrawColor(sf(r),sf(g),sf(b));
    const Rect=(x,yy,w,h,s)=>{
      const fx=sf(x),fy=sf(yy),fw=Math.max(0.1,sf(w)),fh=Math.max(0.1,sf(h));
      if(isFinite(fx)&&isFinite(fy))doc.rect(fx,fy,fw,fh,s||'F');
    };
    const Line=(x1,y1,x2,y2)=>{
      if(isFinite(sf(x1))&&isFinite(sf(y1))&&isFinite(sf(x2))&&isFinite(sf(y2)))
        doc.line(sf(x1),sf(y1),sf(x2),sf(y2));
    };
    const Txt=(s,x,yy,opts)=>{
      const str=sr(String(s||''));
      if(str&&isFinite(sf(x))&&isFinite(sf(yy)))doc.text(str,sf(x),sf(yy),opts||{});
    };
    const splitT=(s,w)=>{
      const r=doc.splitTextToSize(sr(String(s||'')),Math.max(1,sf(w)));
      return(r&&r.length)?r:[''];
    };
    const TxtW=(s,x,yy,w)=>{
      const ls=splitT(s,w);
      if(ls.length&&isFinite(sf(x))&&isFinite(sf(yy)))doc.text(ls,sf(x),sf(yy));
      return ls.length;
    };
    let pgN=0;
    const newPg=()=>{doc.addPage();pgN++;y=20;hdr();};
    const chkY=(need)=>{if(y+(need||8)>PH-18)newPg();};
    const skip=(n)=>{y+=n||5;};
    const hdr=()=>{
      setFill(8,18,40);Rect(0,0,PW,11);
      F(7,'bold',56,189,248);Txt('STRUCTLEARN PRO  -  IS 456 / IS 1893 / IS 875 / IS 13920',ML,7.5);
      F(6.5,'normal',100,130,160);Txt(sr(S.name)+'  |  Page '+(pgN+1),PW-MR,7.5,{align:'right'});
      setFill(14,165,233);Rect(0,11,PW,1.2);
      y=20;
    }
    const secTitle=(num,title,r,g,b)=>{
      chkY(12);
      setFill(r||15,g||40,b||100);Rect(ML,y,LW,8);
      setFill(r?Math.min(r+30,255):50,g?Math.min(g+30,255):80,b||100);Rect(ML,y,3,8);
      F(9,'bold',255,255,255);Txt(sr(num+'  '+title),ML+6,y+5.5);
      y+=11;
    }
    const subTitle=(title)=>{
      chkY(9);
      setFill(30,41,59);Rect(ML,y,LW,6.5);
      setFill(14,165,233);Rect(ML,y,2,6.5);
      F(8,'bold',148,163,184);Txt(sr(title),ML+6,y+4.5);
      y+=9;
    }
    let altRow=false;
    const kvReset=()=>{altRow=false;}
    const kv=(label,val,ref)=>{
      chkY(6);altRow=!altRow;
      if(altRow){setFill(245,248,252);Rect(ML,y-3.5,LW,6);}
      F(7.5,'bold',50,70,110);Txt(sr(label),ML+2,y);
      F(7.5,'normal',20,30,50);
      const n=TxtW(val,ML+65,y,LW-90);
      if(ref){F(6,'italic',130,150,170);Txt(sr(ref),PW-MR,y,{align:'right'});}
      y+=Math.max(5.5,n*5);
    }
    const fmRow=(eq,res,ok)=>{
      chkY(7);
      const bg=ok===true?[232,248,240]:ok===false?[252,232,232]:[228,236,252];
      setFill(...bg);Rect(ML,y-3.5,LW,6.5);
      setStroke(180,200,240);doc.setLineWidth(0.15);Rect(ML,y-3.5,LW,6.5,'D');
      F(7.5,'normal',30,50,120);
      const eqLines=splitT(eq,LW*0.62);
      if(eqLines.length&&isFinite(y))doc.text(eqLines,ML+2,y);
      const rc=ok===true?[5,120,60]:ok===false?[180,20,20]:[8,80,160];
      F(8,'bold',...rc);Txt('= '+sr(String(res||'')),ML+LW*0.65,y);
      y+=Math.max(6,eqLines.length*5)+1;
    }
    const verdictBox=(ok,msg,why,fix)=>{
      const rows=1+(why?1:0)+(fix?1:0);
      const h=8+rows*6;chkY(h+3);
      const bg=ok?[228,248,236]:[252,228,228];
      const bd=ok?[5,150,80]:[200,30,30];
      setFill(...bg);setStroke(...bd);doc.setLineWidth(0.4);Rect(ML,y,LW,h,'FD');
      setFill(...bd);Rect(ML,y,3,h);
      F(8,'bold',...(ok?[5,120,60]:[180,20,20]));
      Txt((ok?'PASS  ':'FAIL  ')+sr(msg),ML+7,y+5.5);
      let yy=y+10;
      if(!ok&&why){F(7,'bold',140,20,20);Txt('WHY:',ML+7,yy);F(7,'normal',80,30,30);TxtW(why,ML+24,yy,LW-30);yy+=6;}
      if(!ok&&fix){F(7,'bold',0,100,50);Txt('FIX:',ML+7,yy);F(7,'normal',0,80,40);TxtW(fix,ML+24,yy,LW-30);}
      y+=h+3;
    }
    let tRow=0;
    const tblReset=()=>{tRow=0;}
    const tblHdr=(cols,ws)=>{
      chkY(9);setFill(10,30,70);Rect(ML,y-3,LW,7);
      F(7,'bold',255,255,255);
      let x=ML;cols.forEach((c,i)=>{Txt(sr(c),x+2,y);x+=ws[i];});
      y+=7;
    }
    const tblRow=(cells,ws,stat)=>{
      chkY(6.5);tRow++;
      const bg=stat==='F'?[255,235,235]:stat==='P'?[232,248,236]:tRow%2?[250,251,254]:[255,255,255];
      setFill(...bg);Rect(ML,y-3.5,LW,6);
      setStroke(210,220,235);doc.setLineWidth(0.15);Rect(ML,y-3.5,LW,6,'D');
      let x=ML;
      cells.forEach((c,i)=>{
        const isLast=(i===cells.length-1);
        if(isLast&&stat){F(7,'bold',...(stat==='F'?[180,20,20]:[5,120,60]));}
        else{F(7,'normal',20,30,50);}
        Txt(sr(String(c||'')).slice(0,40),x+2,y);
        x+=ws[i];
      });
      y+=6;
    }

    // -- COVER PAGE ------------------------------
    log('Cover page...');await new Promise(r=>setTimeout(r,30));
    setFill(6,16,38);Rect(0,0,PW,PH);
    setFill(14,165,233);Rect(0,0,PW,3);Rect(0,PH-3,PW,3);
    setFill(255,255,255);doc.setOpacity?doc.setOpacity(0.05):null;
    setFill(20,50,100);Rect(ML,35,LW,115);
    setFill(14,165,233);Rect(ML,35,4,115);
    F(7,'normal',14,165,233);Txt('STRUCTURAL ENGINEERING DESIGN REPORT',ML+10,50);
    F(20,'bold',255,255,255);Txt('STRUCTLEARN PRO',ML+10,65);
    F(12,'bold',148,180,220);Txt(sr(S.name),ML+10,78);
    setFill(14,165,233);Rect(ML+10,84,70,0.8);
    F(8,'normal',148,163,184);
    Txt('Client: '+sr(S.client||''),ML+10,93);
    Txt('Location: '+sr(S.location||''),ML+10,101);
    Txt('Date: '+new Date().toLocaleDateString('en-IN'),ML+10,109);
    const ZV={II:0.10,III:0.16,IV:0.24,V:0.36};
    const WV={I:33,II:39,III:44,IV:47,V:50,VI:55};
    const rx=ML+LW/2+6;
    F(7,'bold',14,165,233);Txt('PROJECT PARAMETERS',rx,50);
    const prms=[['Structure','G+'+(S.numFloors-1)+' Residential ('+S.numFloors+' floors)'],
      ['Height',S.numFloors*S.floorHt+'m'],['Plan',S.buildingL+'m x '+S.buildingW+'m'],
      ['Zone','Zone '+S.zone+' (Z='+(ZV[S.zone]||0.24)+')'],
      ['Concrete','M'+S.fck+' / Fe'+S.fy+'D'],['SBC',S.soilBearing+' kN/m2']];
    prms.forEach(([k,v],i)=>{F(6.5,'bold',100,140,180);Txt(k,rx,58+i*9);F(7,'normal',200,220,240);Txt(sr(v),rx+26,58+i*9);});
    setFill(20,50,100);Rect(ML,160,LW,45);
    F(7,'bold',14,165,233);Txt('CODES OF PRACTICE',ML+6,170);
    F(7,'normal',148,163,184);
    ['IS 456:2000  -  Plain and Reinforced Concrete','IS 1893:2016 (Part 1)  -  Earthquake Resistant Design',
     'IS 875:2015 (Part 3)  -  Wind Loads','IS 13920:2016  -  Ductile Detailing'].forEach((c,i)=>Txt(c,ML+6,178+i*7));
    F(6.5,'italic',80,100,130);
    const disc=splitT('This report is for educational and preliminary design purposes only. Final drawings must be verified by a licensed Structural Engineer.',LW);
    if(disc.length)doc.text(disc,ML,220);
    F(7,'bold',14,165,233);Txt('STRUCTLEARN PRO',ML,PH-12);
    F(6.5,'normal',80,100,130);Txt('Generated: '+new Date().toLocaleString('en-IN'),PW-MR,PH-12,{align:'right'});

    // -- PAGE 1: PROJECT + MATERIALS ------------------------------
    log('Project & materials...');await new Promise(r=>setTimeout(r,20));
    newPg();hdr();
    secTitle('1','PROJECT SUMMARY');kvReset();
    const sf2={I:1.0,II:1.2,III:1.5};
    [['Project Name',S.name],['Client',S.client||''],['Location',S.location||''],
     ['Structure','G+'+(S.numFloors-1)+' Residential RCC Frame ('+S.numFloors+' floors)'],
     ['Plan',S.buildingL+'m x '+S.buildingW+'m  |  Grid X:('+S.spansX.join('+')+')m Y:('+S.spansY.join('+')+')m'],
     ['Floor Height',S.floorHt+'m floor-to-floor  |  Total: '+(S.numFloors*S.floorHt)+'m'],
     ['Seismic Zone','Zone '+S.zone+'  -  Z='+(ZV[S.zone]||0.24),'IS 1893:2016 T3'],
     ['Wind Zone','Zone '+S.windZone+'  -  Vb='+(WV[S.windZone]||47)+' m/s','IS 875 P3'],
     ['Soil Type','Type '+S.soilType+' (sf='+(sf2[S.soilType]||1.2)+')','IS 1893 T3'],
     ['SBC',S.soilBearing+' kN/m2  |  Df='+S.ftgDepth+'m  |  Net='+(S.soilBearing-18*S.ftgDepth).toFixed(0)+' kN/m2','IS 6403'],
    ].forEach(([k,v,ref])=>kv(k,v,ref));
    skip(4);
    secTitle('2','MATERIAL PROPERTIES',5,100,80);kvReset();
    [['Concrete Grade','M'+S.fck+' | fck='+S.fck+' N/mm2 | Moderate exposure','IS 456 T5'],
     ['Steel Grade','Fe'+S.fy+'D | fy='+S.fy+' N/mm2 | Ductile TMT','IS 1786+IS 13920'],
     ['Ec','5000 x sqrt('+S.fck+') = '+r0(RES.mat.Ec)+' N/mm2','IS 456 Cl 6.2.3.1'],
     ['fcd','0.446 x '+S.fck+' = '+r2(RES.mat.fcd)+' N/mm2','IS 456 Cl 38.1'],
     ['fyd',S.fy+'/1.15 = '+r2(RES.mat.fyd)+' N/mm2','IS 456 Cl 36.4.2'],
     ['Mulim factor',r2(RES.mat.Mf),'IS 456 Annex G'],
     ['Cover Beams/Cols',S.coverBeam+'mm nominal','IS 456 T16'],
     ['Cover Slabs',S.coverSlab+'mm','IS 456 T16'],
     ['Cover Footings','75mm (earth face)','IS 456 Cl 26.4.2.2'],
    ].forEach(([k,v,ref])=>kv(k,v,ref));

    // -- PAGE 2: LOADS + SEISMIC ------------------------------
    log('Loads & seismic...');await new Promise(r=>setTimeout(r,20));
    newPg();hdr();
    secTitle('3','LOAD CALCULATION',160,70,10);kvReset();
    [['Slab SW',S.slabThk+'/1000 x 25 = '+r2(S.slabThk/1000*25)+' kN/m2','IS 875 P1'],
     ['Floor Finish',S.floorFinish+' kN/m2','IS 875 P1'],
     ['Partitions',S.partitions+' kN/m2','IS 875 P2'],
     ['Live Load - Floors',S.udlLL+' kN/m2','IS 875 P2 T1'],
     ['Live Load - Roof',S.udlRoof+' kN/m2','IS 875 P2 T1'],
     ['Wall Load on Beams',S.wallLoad+' kN/m','IS 875 P1'],
     ['Total DL/floor',(S.slabThk/1000*25+S.floorFinish+S.partitions).toFixed(2)+' kN/m2',''],
     ['Factored wu (slab)','1.5 x (DL+LL) = '+r2(RES.slab.wu_sl)+' kN/m2','IS 456 Cl 18.2'],
    ].forEach(([k,v,ref])=>kv(k,v,ref));
    skip(3);F(7.5,'bold',80,80,100);Txt('LOAD COMBINATIONS  -  IS 456 Cl 18.2.3.1',ML,y);y+=6;
    tblHdr(['Comb.','Formula','Governs For'],[18,55,LW-73]);tblReset();
    [['LC-1','1.5(DL+LL)','Slab, beam sagging'],['LC-2','1.2(DL+LL+EQ)','Columns seismic'],
     ['LC-3','1.5(DL+EQ)','Columns, no LL'],['LC-4','0.9DL+1.5EQ','Overturning'],
     ['LC-5','1.2(DL+LL+WL)','Wind + gravity'],['LC-6','1.5(DL+WL)','Wind maximum'],
    ].forEach(([a,b2,c])=>tblRow([a,b2,c],[18,55,LW-73]));
    skip(5);
    secTitle('4','SEISMIC ANALYSIS  -  IS 1893:2016',5,100,90);
    const se=RES.seis;kvReset();
    kv('Zone Factor Z','Zone '+S.zone+'  -  Z='+se.Z,'IS 1893 T3');
    kv('Importance I',String(se.I),'IS 1893 T8');
    kv('Response R',se.R+' (SMRF + IS 13920)','IS 1893 T9');
    kv('Soil Type','Type '+S.soilType+' (IS 1893:2016 per-type spectrum)','IS 1893 Cl 6.4.5');
    skip(2);
    fmRow('Ta = 0.09 x H / sqrt(d) = 0.09 x '+(S.numFloors*S.floorHt)+' / sqrt('+S.buildingW+')',r2(se.Ta)+' s','IS 1893 Cl 7.6.2(c)');
    fmRow('Sa/g (IS 1893:2016 Type '+S.soilType+' spectrum)',r2(se.Sa),'IS 1893 Cl 6.4.5');
    fmRow('Ah = (Z/2) x (Sa/g) / R x I',se.Ah.toFixed(4),'IS 1893 Cl 6.4.2');
    fmRow('Seismic Weight W',r0(se.Wt)+' kN','IS 1893 Cl 7.3.1');
    fmRow('Base Shear Vb = Ah x W',r2(se.Vb)+' kN','IS 1893 Cl 7.5.3',true);
    skip(3);F(7.5,'bold',80,80,100);Txt('STOREY SHEAR DISTRIBUTION',ML,y);y+=5;
    tblHdr(['Floor','Hi(m)','Wi(kN)','WixHi2','Qi(kN)','Vi(kN)'],[16,24,28,36,30,LW-134]);tblReset();
    se.floors.slice().reverse().forEach(f=>tblRow([f.floor,r2(f.h),r0(f.W),r0(f.Wh2),r2(f.Qi),r2(f.Vi)],[16,24,28,36,30,LW-134]));

    // -- PAGE 3: WIND + SLAB ------------------------------
    log('Wind & slab...');await new Promise(r=>setTimeout(r,20));
    newPg();hdr();
    secTitle('5','WIND ANALYSIS  -  IS 875 PART 3',160,70,10);
    const wi=RES.wind;kvReset();
    kv('Basic Vb (Zone '+S.windZone+')',wi.VbW+' m/s','IS 875 P3');
    fmRow('Vz = Vb x k2 = '+wi.VbW+' x '+wi.k2,r2(wi.Vz)+' m/s','IS 875 P3 Cl 5.3');
    fmRow('pz = 0.6 x Vz2 / 1000',r2(wi.pz)+' kN/m2','IS 875 P3 Cl 5.4');
    fmRow('Net pressure = (0.8+0.5) x pz',r2(wi.Fw)+' kN/m2','IS 875 P3');
    const wTot=wi.Fw*S.buildingW*S.numFloors*S.floorHt/2;
    verdictBox(parseFloat(r2(se.Vb))>wTot,'Seismic Vb='+r2(se.Vb)+'kN > Wind='+r2(wTot)+'kN  -  SEISMIC GOVERNS',null,null);
    skip(4);
    secTitle('6','SLAB DESIGN  -  IS 456 Cl 24, Table 26 & 27',15,40,100);
    const sl=RES.slab;
    F(8,'bold',20,60,140);Txt('Panel: lx='+r2(sl.lx)+'m x ly='+r2(sl.ly)+'m  |  ly/lx='+r2(sl.ratio)+'  ->  '+(sl.twoWay?'TWO-WAY':'ONE-WAY')+' SLAB',ML,y);y+=7;
    if(sl.slabCaseName){F(7,'italic',80,120,180);Txt('IS 456 Table 26 Case '+sl.slabCase+': '+sr(sl.slabCaseName),ML,y);y+=6;}
    kvReset();
    fmRow('d_min = lx x 1000/26 = '+r2(sl.lx*1000)+'/26',sl.slabd+'mm  ->  D='+sl.slabD+'mm','IS 456 Cl 23.2');
    fmRow('l/d = '+r2(sl.lx*1000)+'/'+sl.slabd,r2(sl.lx*1000/sl.slabd)+'  (limit 26)',null,sl.ld_ok);
    verdictBox(sl.ld_ok,'l/d='+r2(sl.lx*1000/sl.slabd)+' '+(sl.ld_ok?'<= 26  PASS':'> 26  FAIL'),
      sl.ld_ok?null:'Slab too thin  -  excessive deflection.',
      sl.ld_ok?null:'Increase D to '+Math.ceil((sl.lx*1000/26+S.coverSlab+5)/25)*25+'mm.');
    fmRow('wu = 1.5 x (DL+LL)',r2(sl.wu_sl)+' kN/m2','IS 456 Cl 18.2');
    fmRow('Mx = '+r2(sl.ax)+' x '+r2(sl.wu_sl)+' x '+r2(sl.lx)+'^2',r2(sl.Mx)+' kN.m/m','IS 456 T26/27');
    fmRow('My = '+r2(sl.ay)+' x '+r2(sl.wu_sl)+' x '+r2(sl.lx)+'^2',r2(sl.My)+' kN.m/m','IS 456 T26/27');
    fmRow('Mulim = 0.138 x fck x b x d^2/10^6',r2(sl.Mulim)+' kN.m/m','IS 456 Annex G');
    verdictBox(sl.ok,'Mu('+r2(sl.Mx)+') '+(sl.ok?'<=':'>=')+' Mulim('+r2(sl.Mulim)+') kN.m/m  '+(sl.ok?'SINGLY reinforced OK':'EXCEEDS limit'),
      sl.ok?null:'Moment exceeds singly reinforced limit.',sl.ok?null:'Increase depth.');
    kvReset();
    kv('Main Steel X (bottom)','D10@'+sl.spx+'mm c/c  |  Ast='+r0(sl.Ax)+'mm2/m','IS 456 Annex G');
    kv('Dist. Steel Y (bottom)','D8@'+sl.spy+'mm c/c  |  Ast='+r0(sl.Ay)+'mm2/m','IS 456 Cl 26.5.2.2');
    kv('Top at Supports','D8@'+sl.spx_n+'mm c/c  -  extend L/5='+r2(sl.lx/5*1000)+'mm from each support','IS 456 Cl 24.3.2');
    if(sl.twoWay)kv('Corner Steel','D8@'+Math.min(sl.spx,200)+'mm 4 layers over lx/5='+r2(sl.lx/5)+'m','IS 456 Cl 24.4.1');

    // -- BEAM PAGES ------------------------------
    log('Beams...');await new Promise(r=>setTimeout(r,20));
    // Apply beam filter from dialog
    const _pdfAllBeams=RES.allBeams||RES.beams;
    const _pdfBF=window._pdfFilters;
    const _pdfBeams=_pdfBF&&_pdfBF.beamIdxs&&_pdfBF.beamIdxs.length
      ?_pdfAllBeams.filter((_,i)=>_pdfBF.beamIdxs.includes(i))
      :_pdfAllBeams;
    _pdfBeams.forEach((b,bi)=>{
      newPg();hdr();
      const bOK=b.deflOK&&b.shearSafe;
      secTitle('7.'+(bi+1),'BEAM  -  '+sr(b.label||'B'+(bi+1))+' | Floor '+(b.floorLabel||b.floor||1)+' | L='+b.L+'m | '+b.b+'x'+b.D+'mm',bOK?130:140,bOK?70:20,bOK?10:20);
      // Overall status banner
      setFill(bOK?228:252,bOK?248:228,bOK?236:228);Rect(ML,y,LW,7);
      setFill(bOK?5:200,bOK?150:30,bOK?80:30);Rect(ML,y,3,7);
      F(8,'bold',...(bOK?[5,120,60]:[180,20,20]));
      Txt((bOK?'ALL CHECKS PASS':'REVISION REQUIRED')+'   -   b='+b.b+'mm D='+b.D+'mm d='+b.d+'mm',ML+7,y+5);y+=10;
      if(b.endCond){F(7,'italic',80,120,180);Txt(sr(b.endCond),ML,y);y+=6;}

      subTitle('B-1  SECTION SIZING & LOADING');
      fmRow('D = L x 1000/12 = '+b.L*1000+'/12 (rounded, auto-increased if needed)',b.D+'mm','IS 456 Annex G');
      fmRow('b = max(230, 0.4D)',b.b+'mm','IS 456 Cl 26.5.1.2');
      fmRow('d = D - cover - stirrup - 0.5bar = '+b.D+'-'+S.coverBeam+'-8-10',b.d+'mm','');
      fmRow('Trib width',r2(b.trib)+'m  |  wu = 1.5(wslab+wsw+wwall)',r2(b.wu)+' kN/m','IS 456 Cl 18.2');

      subTitle('B-2  SHEAR FORCE & BENDING MOMENT');
      fmRow('RA = RB = wu x L/2 = '+r2(b.wu)+' x '+b.L+'/2',r2(b.RA)+' kN','');
      fmRow('Mmax (midspan) = '+r2(b.Mmax)+'kN.m  |  Msup (support) = '+r2(b.Msup)+'kN.m','IS 456 T12/Cl 22.5','');
      fmRow('Mulim = '+r2(RES.mat.Mf)+' x '+S.fck+' x '+b.b+' x '+b.d+'^2/10^6',r2(b.Mulim)+' kN.m','IS 456 Annex G');
      verdictBox(b.singly,'Mmax('+r2(b.Mmax)+') '+(b.singly?'<=':'>=')+' Mulim('+r2(b.Mulim)+') kN.m  -  '+(b.singly?'SINGLY reinforced OK':'depth increased until singly reinforced'),null,null);

      subTitle('B-3  REINFORCEMENT');
      fmRow('Bottom: Ast_req='+r0(b.Am)+'mm2  ->  '+b.nm+'xT20 = '+r0(b.Ap)+'mm2  pt='+r2(b.pt)+'%',r0(b.Ap)+'mm2','IS 456 Annex G');
      fmRow('Top at supports: Ast_req='+r0(b.As2)+'mm2  ->  '+b.ns+'xT20 (extend L/4+Ld)','Ld='+r0(b.Ld)+'mm','IS 456 Cl 26.2');

      subTitle('B-4  SHEAR DESIGN');
      fmRow('tv = Vmax x 1000/(b x d) = '+r2(b.RA)+'000/('+b.b+'x'+b.d+')',r2(b.tv)+' N/mm2','IS 456 Cl 40.1');
      fmRow('tc_max (M'+S.fck+')',r2(b.tcmax)+' N/mm2','IS 456 T20');
      verdictBox(b.shearSafe,'tv('+r2(b.tv)+') '+(b.shearSafe?'<=':'>=')+' tc_max('+r2(b.tcmax)+')  -  '+(b.shearSafe?'Section OK':'SECTION TOO SMALL'),
        b.shearSafe?null:'Nominal shear stress exceeds maximum  -  beam is too thin.',
        b.shearSafe?null:'Increase width to '+Math.ceil(b.RA*1000/(b.tcmax*(b.d||200))/25+1)*25+'mm.');
      fmRow('Stirrups T8 2-leg: end zone T8@'+b.svd+'mm  |  mid zone T8@'+b.sv+'mm','IS 456 Cl 40.4','');
      kv('IS 13920 Confinement zone','max(2D,L/4)='+Math.max(2*b.D,Math.round(b.L*1000/4))+'mm from each support face | T8@'+b.svd+'mm | 135deg hooks','IS 13920 Cl 6.3.5');

      subTitle('B-5  DEFLECTION CHECK');
      fmRow('delta = 5 x wu x L^4/(384 x EI)',r2(b.dfl)+'mm','IS 456 Cl 23.2');
      fmRow('delta_allow = L/250 = '+r2(b.L*1000)+'/250',r2(b.dall)+'mm','IS 456 Cl 23.2a');
      verdictBox(b.deflOK,'delta('+r2(b.dfl)+'mm) '+(b.deflOK?'<=':'>=')+' allow('+r2(b.dall)+'mm)  '+(b.deflOK?'PASS':'FAIL'),
        b.deflOK?null:'Beam deflects > L/250  -  visible sag, cracked finishes.',
        b.deflOK?null:'Increase depth to ~'+Math.ceil(b.D*Math.pow(b.dfl/b.dall,1/3)/25+1)*25+'mm.');
    });

    // -- COLUMN PAGES ------------------------------
    log('Columns...');await new Promise(r=>setTimeout(r,20));
    const _allColsForPDF=RES.allCols||RES.cols;
    const _selColIds=(_pdfBF&&_pdfBF.colNodeIds&&_pdfBF.colNodeIds.length)?_pdfBF.colNodeIds:_allColsForPDF.map(c=>c.nodeId);
    const cFloors=[...new Set(_allColsForPDF.filter(c=>_selColIds.includes(c.nodeId)).map(c=>c.floor))].sort((a,b2)=>a-b2);
    cFloors.forEach(fl=>{
      newPg();hdr();
      secTitle('8','COLUMN DESIGN  -  FLOOR '+fl+'  (IS 456 Cl 39 + IS 13920 Cl 7)',80,20,140);
      _allColsForPDF.filter(c=>c.floor===fl&&_selColIds.includes(c.nodeId)).forEach(c=>{
        chkY(12);
        setFill(240,235,255);Rect(ML,y,LW,8);
        setFill(160,130,220);Rect(ML,y,3,8);
        F(8,'bold',80,30,160);Txt(sr(c.label),ML+5,y+5.5);
        F(7,'normal',80,60,140);Txt('Trib='+r2(c.ta)+'m2  Pu='+r2(c.Pu)+'kN  Cap='+r2(c.Pcap)+'kN',ML+80,y+5.5);
        y+=11;
        kvReset();
        fmRow('Ps (cumulative gravity load, '+fl+' floors)',r2(c.Ps)+' kN','Tributary');
        fmRow('Pu = 1.5 x Ps',r2(c.Pu)+' kN','IS 456 Cl 18.2');
        fmRow('Size = '+c.size+'x'+c.size+'mm  |  Ag = '+r0(c.Ag)+'mm2  |  leff/D='+r2(c.lex)+' '+(c.short?'SHORT':'LONG'),c.size+'x'+c.size,'IS 456 Cl 25.1');
        fmRow('Asc: '+c.nb+'-D'+c.dB+' = '+r0(c.Aprov)+'mm2  pt='+r2(c.pt)+'%','Pcap='+r2(c.Pcap)+' kN','IS 456 Cl 39.3');
        verdictBox(c.safe,'Pu('+r2(c.Pu)+'kN) '+(c.safe?'<=':'>=')+' Pcap('+r2(c.Pcap)+'kN)  '+(c.safe?'SAFE':'UNSAFE'),
          c.safe?null:'Column overloaded  -  crushing failure.',
          c.safe?null:'Increase size to '+(c.size+50)+'x'+(c.size+50)+'mm or use M'+(S.fck+5)+'.');
        kv('General ties','D8@'+c.ts+'mm c/c = min(D,16dia,300mm)','IS 456 Cl 26.5.3.2');
        kv('Confinement zone Lo','max(D,H/6,450)='+r0(c.Lo)+'mm from BOTH ends','IS 13920 Cl 7.4.1');
        kv('Ties in Lo','D8@'+c.tsc+'mm c/c  -  135deg hooks MANDATORY','IS 13920 Cl 7.4.6');
        skip(3);
      });
    });

    // -- FOOTING PAGE ------------------------------
    log('Footings...');await new Promise(r=>setTimeout(r,20));
    newPg();hdr();
    secTitle('9','FOOTING DESIGN  -  IS 456 Cl 31.6, 34',120,90,0);
    const _allFtgsForPDF=RES.allFtgs||RES.ftgs;
    const _selFtgIdxs=(_pdfBF&&_pdfBF.ftgIdxs&&_pdfBF.ftgIdxs.length)?_pdfBF.ftgIdxs:_allFtgsForPDF.map((_,i)=>i);
    _allFtgsForPDF.filter((_,i)=>_selFtgIdxs.includes(i)).forEach((f,fi)=>{
      chkY(10);
      setFill(255,252,230);Rect(ML,y,LW,8);setFill(180,150,0);Rect(ML,y,3,8);
      F(8,'bold',140,100,0);Txt(sr((f.label||f.baseLabel||'FTG'))+' (col '+f.colSize+'x'+f.colSize+'mm)',ML+5,y+5.5);
      const fOK=f.punch_ok&&f.ow_ok&&f.Ld_ok;
      F(7.5,'bold',...(fOK?[5,120,60]:[180,20,20]));Txt(fOK?'ALL SAFE':'REVISION NEEDED',PW-MR-2,y+5.5,{align:'right'});
      y+=11;
      fmRow('Ps='+r2(f.Ps)+'kN | Net SBC='+r2(S.soilBearing-18*S.ftgDepth)+' kN/m2  ->  B',r2(f.Bf)+'m x '+r2(f.Bf)+'m','IS 6403');
      fmRow('qu=Ps/B2='+r2(f.qu)+' kN/m2  |  qu_fac=1.5xqu',r2(f.quf)+' kN/m2','');
      fmRow('D='+r0(f.D)+'mm  |  d_eff=D-75-8',r0(f.d)+'mm','IS 456 Cl 26.4.2.2');
      fmRow('Punching: tv='+r2(f.tvp)+' vs tc='+r2(f.tcp)+' N/mm2',f.punch_ok?'SAFE':'FAIL',null,f.punch_ok);
      verdictBox(f.punch_ok,'Punching shear '+(f.punch_ok?'SAFE':'FAILS'),
        f.punch_ok?null:'Column punches through footing  -  brittle sudden failure.',
        f.punch_ok?null:'Increase D to '+Math.ceil((f.d*Math.sqrt(f.tvp/f.tcp)+30+75+8)/25)*25+'mm.');
      fmRow('One-way: tv='+r2(f.tvow)+' vs tc='+r2(f.tcow)+' N/mm2',f.ow_ok?'SAFE':'FAIL',null,f.ow_ok);
      verdictBox(f.ow_ok,'One-way shear '+(f.ow_ok?'SAFE':'FAILS'),f.ow_ok?null:'Cantilever shear exceeds capacity.',f.ow_ok?null:'Increase depth D.');
      fmRow('Dev. length: Ld_req='+r0(f.Ldr)+'mm  Ld_avail='+r0(f.Lda)+'mm',f.Ld_ok?'OK':'INSUFFICIENT',null,f.Ld_ok);
      verdictBox(f.Ld_ok,'Development length '+(f.Ld_ok?'OK':'INSUFFICIENT'),
        f.Ld_ok?null:'Bars pull out before yielding.',f.Ld_ok?null:'Provide 90-deg hook per IS 456 Fig.9.');
      kv('Reinforcement','D'+f.dBf+'@'+f.spf+'mm c/c each way  (Ast_min governs)','IS 456 Cl 26.5.2.1');
      skip(4);
    });

    // -- SAFETY SUMMARY ------------------------------
    log('Safety summary...');await new Promise(r=>setTimeout(r,20));
    newPg();hdr();
    secTitle('10','COMPLETE SAFETY CHECK SUMMARY',15,40,100);
    const checks=[];
    const sl2=RES.slab;
    checks.push({it:'Slab l/d ratio',ok:sl2.ld_ok,val:'l/d='+r2(sl2.lx*1000/sl2.slabd)+' (limit 26)',why:'Thin slab  -  excess deflection.',fix:'Increase D to '+Math.ceil((sl2.lx*1000/26+S.coverSlab+5)/25)*25+'mm.'});
    checks.push({it:'Slab Mu < Mulim',ok:sl2.ok,val:'Mu='+r2(sl2.Mx)+' Mulim='+r2(sl2.Mulim)+' kN.m/m',why:'Moment exceeds singly reinforced.',fix:'Increase depth.'});
    (RES.allBeams||RES.beams).forEach(b=>{
      checks.push({it:sr(b.label||'Beam')+'  Shear',ok:b.shearSafe,val:'tv='+r2(b.tv)+' tc_max='+r2(b.tcmax)+' N/mm2',why:'Section too small.',fix:'Increase b to '+Math.ceil(b.RA*1000/(b.tcmax*(b.d||200))/25+1)*25+'mm.'});
      checks.push({it:sr(b.label||'Beam')+'  Deflect',ok:b.deflOK,val:'delta='+r2(b.dfl)+'mm limit='+r2(b.dall)+'mm',why:'Visible sag.',fix:'Increase D to '+Math.ceil(b.D*Math.pow(b.dfl/b.dall,1/3)/25+1)*25+'mm.'});
    });
    (RES.allCols||RES.cols).filter(c=>c.floor===1).forEach(c=>{
      checks.push({it:sr(c.label)+' Axial',ok:c.safe,val:'Pu='+r2(c.Pu)+' cap='+r2(c.Pcap)+' kN',why:'Crushing failure.',fix:'Increase size to '+(c.size+50)+'x'+(c.size+50)+'mm.'});
      checks.push({it:sr(c.label)+' pt%',ok:c.pt>=0.8&&c.pt<=4,val:'pt='+r2(c.pt)+'%',why:c.pt<0.8?'Too little steel.':'Too much steel.',fix:c.pt<0.8?'Add steel to 0.8%xAg.':'Increase column size.'});
    });
    (RES.allFtgs||RES.ftgs).forEach(f=>{
      checks.push({it:sr((f.label||f.baseLabel||'FTG'))+' Punching',ok:f.punch_ok,val:'tv='+r2(f.tvp)+' tc='+r2(f.tcp)+' N/mm2',why:'Punching through slab.',fix:'Increase depth.'});
      checks.push({it:sr((f.label||f.baseLabel||'FTG'))+' Ld',ok:f.Ld_ok,val:'avail='+r0(f.Lda)+' req='+r0(f.Ldr)+'mm',why:'Bars pull out.',fix:'90-deg hook.'});
    });
    const passed=checks.filter(c=>c.ok).length,total=checks.length,allPass=passed===total;
    setFill(allPass?220:252,allPass?248:225,allPass?230:225);setStroke(allPass?5:200,allPass?150:30,allPass?80:30);
    doc.setLineWidth(0.6);Rect(ML,y,LW,12,'FD');
    setFill(allPass?5:200,allPass?150:30,allPass?80:30);Rect(ML,y,5,12);
    F(11,'bold',...(allPass?[5,120,60]:[180,20,20]));
    Txt(passed+'/'+total+' CHECKS PASS'+(allPass?'  ALL SAFE':'  REVISIONS REQUIRED'),ML+10,y+8);y+=16;
    const fails=checks.filter(c=>!c.ok);
    if(fails.length){
      chkY(8);setFill(252,240,240);Rect(ML,y,LW,7);
      F(8,'bold',160,20,20);Txt('ITEMS REQUIRING REVISION ('+fails.length+'):',ML+4,y+5);y+=10;
      fails.forEach(f=>{
        chkY(16);
        setFill(255,248,248);setStroke(230,190,190);doc.setLineWidth(0.2);Rect(ML,y,LW,14,'FD');
        setFill(200,30,30);Rect(ML,y,3,14);
        F(7.5,'bold',160,20,20);Txt('FAIL  '+sr(f.it),ML+6,y+4.5);
        F(7,'normal',80,40,40);Txt('Value: '+sr(f.val),ML+6,y+9.5);
        F(7,'bold',130,20,20);Txt('WHY:',ML+LW/2+4,y+4.5);
        F(7,'normal',80,40,40);TxtW(f.why,ML+LW/2+18,y+4.5,LW/2-22);
        F(7,'bold',0,100,50);Txt('FIX:',ML+LW/2+4,y+10);
        TxtW(f.fix,ML+LW/2+18,y+10,LW/2-22);
        y+=17;
      });
    }
    skip(4);
    tblHdr(['Check Item','Status','Values'],[LW*0.48,20,LW-LW*0.48-20]);tblReset();
    checks.forEach(c=>tblRow([sr(c.it),c.ok?'PASS':'FAIL',sr(c.val)],[LW*0.48,20,LW-LW*0.48-20],c.ok?'P':'F'));

    // -- DESIGN SCHEDULE ------------------------------
    log('Design schedule...');await new Promise(r=>setTimeout(r,20));
    newPg();hdr();
    secTitle('11','COMPLETE DESIGN SCHEDULE',15,40,100);
    F(6.5,'italic',80,90,110);Txt('All dimensions in mm unless noted. For construction drawings.',ML,y);y+=7;
    F(8,'bold',20,60,140);Txt('SLAB',ML,y);y+=5;
    tblHdr(['Member','D','Main Bot X','Dist Bot Y','Top at Supp','Status'],[22,16,36,36,40,LW-150]);tblReset();
    tblRow([(sl2.twoWay?'Two-way':'One-way')+' slab',sl2.slabD,'D10@'+sl2.spx+'mm','D8@'+sl2.spy+'mm','D8@'+sl2.spx_n+'mm',sl2.ok&&sl2.ld_ok?'SAFE':'CHECK'],[22,16,36,36,40,LW-150],sl2.ok&&sl2.ld_ok?'P':'F');
    skip(4);F(8,'bold',160,70,10);Txt('BEAMS',ML,y);y+=5;
    tblHdr(['Label','bxD','Bot','Top','Stirr-End','Mid','Status'],[30,20,22,22,28,20,LW-142]);tblReset();
    (RES.allBeams||RES.beams).filter(b=>b.floor===1).forEach(b=>tblRow([sr((b.label||'B').slice(0,16)),b.b+'x'+b.D,''+b.nm+'D20',''+b.ns+'D20','D8@'+b.svd+'('+Math.max(2*b.D,Math.round(b.L*1000/4))+'mm)','D8@'+b.sv,b.deflOK&&b.shearSafe?'SAFE':'CHECK'],[30,20,22,22,28,20,LW-142],b.deflOK&&b.shearSafe?'P':'F'));
    skip(4);F(8,'bold',80,20,140);Txt('COLUMNS (Ground Floor  -  Max Load)',ML,y);y+=5;
    tblHdr(['Type','Size','Steel','pt%','Gen Ties','Lo','In Lo','Status'],[22,20,20,14,24,20,18,LW-138]);tblReset();
    (RES.allCols||RES.cols).filter(c=>c.floor===1).forEach(c=>{
      tblRow([sr((c.label||c.baseLabel||'Col').slice(0,18)),c.size+'x'+c.size,''+c.nb+'D'+c.dB,r2(c.pt),'D8@'+c.ts+'mm',r0(c.Lo),'D8@'+c.tsc+'mm',c.safe?'SAFE':'CHECK'],[22,20,20,14,24,20,18,LW-138],c.safe?'P':'F');
    });
    skip(4);F(8,'bold',120,90,0);Txt('FOOTINGS',ML,y);y+=5;
    tblHdr(['Footing','BxB(m)','D','d','Reinf.','Punch','Ld','Status'],[26,22,16,16,30,16,16,LW-142]);tblReset();
    (RES.allFtgs||RES.ftgs).forEach(f=>{const flbl=(f.label||f.baseLabel||'FTG').slice(0,14);tblRow([sr(flbl),r2(f.Bf)+'x'+r2(f.Bf),r0(f.D),r0(f.d),'D'+f.dBf+'@'+f.spf+'EW',f.punch_ok?'OK':'FAIL',f.Ld_ok?'OK':'FAIL',f.punch_ok&&f.ow_ok&&f.Ld_ok?'SAFE':'CHECK'],[26,22,16,16,30,16,16,LW-142],f.punch_ok&&f.ow_ok&&f.Ld_ok?'P':'F');});

    // -- CODE COMPLIANCE ------------------------------
    log('Code notes...');await new Promise(r=>setTimeout(r,20));
    newPg();hdr();
    secTitle('12','CODE OF PRACTICE COMPLIANCE',15,40,100);
    [['IS 456:2000','Plain and Reinforced Concrete. All structural member designs comply with limit state method. M'+S.fck+', Fe'+S.fy+'D.'],
     ['IS 1893:2016','Earthquake Resistant Design. Equivalent Static Method. Zone '+S.zone+', Soil Type '+S.soilType+', R='+se.R+' SMRF.'],
     ['IS 875:2015','Design Loads Parts 1,2,3. Wind Zone '+S.windZone+', Terrain '+S.terrain+', k2='+r2(wi.k2)+'.'],
     ['IS 13920:2016','Ductile Detailing. All beams and columns: confinement zones, 135-deg hooks, Fe500D.'],
     ['IS 1904:1986','Foundation depth '+S.ftgDepth+'m below NGL. Isolated footings for all columns.'],
     ['IS 6403:1981','SBC='+S.soilBearing+' kN/m2 from soil investigation.'],
     ['SP 34:1987','Concrete Reinforcement and Detailing Handbook. Bar bending, spacing, cover, development length.'],
    ].forEach(([code,desc])=>{
      chkY(16);setFill(238,244,255);Rect(ML,y,LW,6);
      F(7.5,'bold',20,50,130);Txt(code,ML+3,y+4.2);y+=7;
      F(7,'normal',30,40,70);const ls=splitT(desc,LW-4);if(ls.length)doc.text(ls,ML+3,y);y+=ls.length*5+4;
    });
    chkY(24);setFill(255,248,220);setStroke(180,150,0);doc.setLineWidth(0.4);Rect(ML,y,LW,22,'FD');
    setFill(180,150,0);Rect(ML,y,4,22);
    F(8,'bold',120,90,0);Txt('IMPORTANT DISCLAIMER',ML+8,y+7);
    F(7,'normal',60,50,10);
    const d2=splitT('This report is for EDUCATIONAL and PRELIMINARY DESIGN purposes only. All calculations must be verified by a licensed Structural Engineer before use in construction. Final drawings must bear the seal of a registered Structural Engineer.',LW-14);
    if(d2.length)doc.text(d2,ML+8,y+13);y+=24;
    chkY(14);setFill(10,24,48);Rect(ML,y,LW,13);
    F(9,'bold',14,165,233);Txt('STRUCTLEARN PRO',ML+4,y+6);
    F(7,'normal',100,130,160);Txt('IS 456 / IS 1893 / IS 875 / IS 13920  |  Complete Structural Design Platform',ML+4,y+11);
    F(7,'normal',80,100,130);Txt('Generated: '+new Date().toLocaleString('en-IN')+'  |  Total pages: '+( pgN+1),PW-MR,y+11,{align:'right'});

    log('Saving PDF...');await new Promise(r=>setTimeout(r,50));
    doc.save((S.name||'Structure').replace(new RegExp('\\s+','g'),'_')+'_Structural_Report.pdf');
    if(pLog)pLog.innerHTML+='<div style="color:#34d399;font-weight:bold;font-size:13px;margin-top:8px">PDF Downloaded!</div>';
    setTimeout(()=>{if(pDiv)pDiv.style.display='none';},4000);
  }catch(err){
    console.error('PDF Error:',err);
    if(pLog)pLog.innerHTML+='<div style="color:#f87171;margin-top:6px">Error: '+err.message+'</div>';
  }
}


// =======================================================
// FEATURE 1: P-M INTERACTION DIAGRAM  -  IS 456 Annex B
// =======================================================
// Generates points on the P-M interaction curve for a rectangular
// RC column section. Used for combined axial + bending (seismic).

// == 10_advanced_consts.js ==

// ================================================================
// MODULE: 10_advanced_consts
// IS 456 Table 26, Table 16A, FRR lookup tables
// These constants are used by the advanced topic modules
// ================================================================




// == 10a_pm_interaction.js ==

// ================================================================
// MODULE: 10a_pm_interaction
// P-M Interaction Diagram
// ================================================================

function calcPMInteraction(colSize, fck, fy, Asc, nBars, dBar, cover, numPts) {
  // Column: bxD = colSizexcolSize (square), Asc total steel area
  const b = colSize, D = colSize;
  const d2 = cover + dBar / 2;          // dist from edge to bar centroid
  const d = D - d2;                      // effective depth
  const fyd = fy / 1.15;
  const fcd = 0.446 * fck;              // IS 456 design comp strength
  const n = numPts || 20;
  const pts = [];

  // Point 1: Pure compression (xu->inf limit)
  // Pu_max = 0.4*fck*Ag + 0.67*fy*Asc  (IS 456 Cl 39.3)
  const Ag = b * D;
  const Pu_max = (0.4 * fck * (Ag - Asc) + 0.67 * fy * Asc) / 1000; // kN
  pts.push({ Pu: Pu_max, Mu: 0, label: 'Pure compression' });

  // Sweep neutral axis depth xu from 0 to very large
  // For each xu, compute Pu and Mu using IS 456 stress block
  const xuMax = D * 3; // beyond this = pure compression
  const steps = n;

  for (let i = 1; i <= steps; i++) {
    const xu = (i / steps) * xuMax;
    const xu_D = xu / D;

    // Concrete compression force (IS 456 stress block)
    // Depth of stress block = 0.42*xu (for xu <= D)
    const xu_eff = Math.min(xu, D);
    const Cc = 0.36 * fck * b * xu_eff / 1000; // kN

    // Moment of Cc about section centroid
    const Mc_arm = D / 2 - 0.42 * xu_eff;     // mm
    const Mc = Cc * Mc_arm / 1000;             // kN.m

    // Steel forces  -  assume bars split equally top & bottom
    // Top bars (compression side): strain = 0.0035*(xu - d2)/xu
    const es_top = 0.0035 * (xu - d2) / xu;
    const fs_top = Math.min(Math.max(es_top * 200000, -fyd), fyd); // N/mm^2
    const As_top = Asc / 2;
    const Fs_top = (fs_top - (es_top > 0 ? 0.446 * fck : 0)) * As_top / 1000; // kN

    // Bottom bars (tension side): strain = 0.0035*(D - xu - d2)/xu
    const es_bot = 0.0035 * (d - xu) / xu;
    const fs_bot = Math.min(Math.max(es_bot * 200000, -fyd), fyd);
    const As_bot = Asc / 2;
    const Fs_bot = fs_bot * As_bot / 1000; // kN (negative = tension)

    // Total axial (compression positive)
    const Pu = Cc + Fs_top - Fs_bot;

    // Total moment about centroid
    const Mu = Math.abs(
      Mc +
      Fs_top * (D / 2 - d2) / 1000 +
      Fs_bot * (d - D / 2) / 1000
    );

    if (Pu >= -50) { // skip extreme tension zone
      pts.push({ Pu: Math.round(Pu * 10) / 10, Mu: Math.round(Mu * 100) / 100 });
    }
  }

  // Point: Pure bending (Pu=0)
  // Solve for xu when Pu=0
  let xuPB = D * 0.1;
  for (let iter = 0; iter < 50; iter++) {
    const Cc2 = 0.36 * fck * b * Math.min(xuPB, D) / 1000;
    const es_t = 0.0035 * (xuPB - d2) / xuPB;
    const fs_t = Math.min(Math.max(es_t * 200000, -fyd), fyd);
    const es_b = 0.0035 * (d - xuPB) / xuPB;
    const fs_b = Math.min(Math.max(es_b * 200000, -fyd), fyd);
    const Pu_try = Cc2 + (fs_t - 0.446 * fck) * Asc / 2 / 1000 - fs_b * Asc / 2 / 1000;
    if (Math.abs(Pu_try) < 0.5) break;
    xuPB += Pu_try > 0 ? -xuPB * 0.1 : xuPB * 0.1;
  }
  const Mu_pb = 0.36 * fck * b * xuPB * (D / 2 - 0.42 * xuPB) / 1e6 +
    fyd * Asc / 2 * (d - d2) / 1e6;
  pts.push({ Pu: 0, Mu: Math.round(Mu_pb * 100) / 100, label: 'Pure bending' });

  // Sort by Pu descending
  pts.sort((a, b2) => b2.Pu - a.Pu);

  // Key points for annotation
  const Pub = 0.456 * fck * b * D / 1000; // balanced Pu (approx)
  const MuMax = Math.max(...pts.map(p => p.Mu));
  const MuMaxPt = pts.find(p => p.Mu === MuMax);

  return { pts, Pu_max, Mu_pb, MuMax, MuMaxPt, b, D, Asc };
}

// SVG P-M Interaction Diagram
function svgPMDiagram(pmData, Pu_design, Mu_design, label) {
  const { pts, Pu_max, Mu_pb, MuMax } = pmData;
  const W = 420, H = 320, pad = { l: 55, r: 20, t: 30, b: 50 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;

  const maxMu = Math.max(MuMax * 1.15, Mu_design * 1.3, 10);
  const maxPu = Math.max(Pu_max * 1.1, Pu_design * 1.3, 100);
  const minPu = -100;
  const scX = pw / maxMu;
  const scY = ph / (maxPu - minPu);

  const toX = mu => pad.l + mu * scX;
  const toY = pu => pad.t + (maxPu - pu) * scY;

  // Build SVG path
  const pathPts = pts.filter(p => p.Mu >= 0 && p.Pu <= maxPu && p.Pu >= minPu);
  const pathD = pathPts.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${toX(p.Mu).toFixed(1)},${toY(p.Pu).toFixed(1)}`
  ).join(' ');

  // Design point - check if safe
  const dpX = toX(Mu_design), dpY = toY(Pu_design);
  const isSafe = checkPMSafe(pts, Pu_design, Mu_design);

  let g = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g += `<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;

  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const x = pad.l + i * pw / 4;
    const y2 = pad.t + i * ph / 4;
    g += `<line x1="${x}" y1="${pad.t}" x2="${x}" y2="${pad.t + ph}" stroke="#1e3a5f" stroke-width="1"/>`;
    g += `<line x1="${pad.l}" y1="${y2}" x2="${pad.l + pw}" y2="${y2}" stroke="#1e3a5f" stroke-width="1"/>`;
  }

  // Axes
  g += `<line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t + ph}" stroke="#64748b" stroke-width="1.5"/>`;
  g += `<line x1="${pad.l}" y1="${pad.t + ph}" x2="${pad.l + pw}" y2="${pad.t + ph}" stroke="#64748b" stroke-width="1.5"/>`;
  // Zero Pu line
  const y0 = toY(0);
  g += `<line x1="${pad.l}" y1="${y0}" x2="${pad.l + pw}" y2="${y0}" stroke="#64748b" stroke-width="1" stroke-dasharray="4,3"/>`;

  // Filled interaction curve
  const fillPath = `${pathD} L${toX(0)},${toY(pathPts[pathPts.length - 1]?.Pu || 0)} L${toX(0)},${toY(pathPts[0]?.Pu || Pu_max)} Z`;
  g += `<path d="${fillPath}" fill="rgba(14,165,233,0.08)" stroke="none"/>`;

  // Interaction curve
  g += `<path d="${pathD}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>`;

  // Safe zone label
  g += `<text x="${pad.l + 10}" y="${pad.t + 20}" fill="rgba(56,189,248,0.4)" font-size="9" font-family="JetBrains Mono">SAFE ZONE</text>`;

  // Design point
  const dpClr = isSafe ? '#34d399' : '#f87171';
  g += `<circle cx="${dpX}" cy="${dpY}" r="7" fill="${dpClr}" fill-opacity="0.3" stroke="${dpClr}" stroke-width="2"/>`;
  g += `<circle cx="${dpX}" cy="${dpY}" r="3" fill="${dpClr}"/>`;

  // Crosshairs from design point
  g += `<line x1="${pad.l}" y1="${dpY}" x2="${dpX}" y2="${dpY}" stroke="${dpClr}" stroke-width="0.8" stroke-dasharray="3,2"/>`;
  g += `<line x1="${dpX}" y1="${dpY}" x2="${dpX}" y2="${pad.t + ph}" stroke="${dpClr}" stroke-width="0.8" stroke-dasharray="3,2"/>`;

  // Design point label
  const lblX = dpX + 8 < pad.l + pw - 60 ? dpX + 8 : dpX - 75;
  g += `<text x="${lblX}" y="${dpY - 8}" fill="${dpClr}" font-size="9" font-weight="bold" font-family="JetBrains Mono">${isSafe ? 'SAFE' : 'UNSAFE'}</text>`;
  g += `<text x="${lblX}" y="${dpY + 4}" fill="${dpClr}" font-size="8" font-family="JetBrains Mono">Pu=${r2(Pu_design)}kN</text>`;
  g += `<text x="${lblX}" y="${dpY + 13}" fill="${dpClr}" font-size="8" font-family="JetBrains Mono">Mu=${r2(Mu_design)}kN.m</text>`;

  // Balanced point marker
  const Pub_approx = Pu_max * 0.45;
  const Pub_pt = pts.reduce((a, p) => Math.abs(p.Pu - Pub_approx) < Math.abs(a.Pu - Pub_approx) ? p : a, pts[0]);
  if (Pub_pt) {
    g += `<circle cx="${toX(Pub_pt.Mu)}" cy="${toY(Pub_pt.Pu)}" r="4" fill="#fb923c"/>`;
    g += `<text x="${toX(Pub_pt.Mu) + 5}" y="${toY(Pub_pt.Pu) - 4}" fill="#fb923c" font-size="8" font-family="JetBrains Mono">Balanced pt</text>`;
  }

  // Axis labels
  g += `<text x="${pad.l + pw / 2}" y="${H - 8}" fill="#64748b" font-size="10" text-anchor="middle" font-family="JetBrains Mono">Moment Mu (kN.m) -->  Bending</text>`;
  g += `<text x="12" y="${H / 2}" fill="#64748b" font-size="10" text-anchor="middle" transform="rotate(-90,12,${H / 2})" font-family="JetBrains Mono">Axial Pu (kN) -->  Compression</text>`;

  // Axis values
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const muV = Math.round(maxMu * t);
    const puV = Math.round(maxPu - (maxPu - minPu) * t);
    g += `<text x="${toX(muV)}" y="${pad.t + ph + 14}" fill="#64748b" font-size="8" text-anchor="middle" font-family="JetBrains Mono">${muV}</text>`;
    g += `<text x="${pad.l - 4}" y="${toY(puV) + 3}" fill="#64748b" font-size="8" text-anchor="end" font-family="JetBrains Mono">${puV}</text>`;
  });

  // Title
  g += `<text x="${W / 2}" y="18" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">P-M INTERACTION DIAGRAM  -  ${label || 'Column'}</text>`;

  g += '</svg>';
  return `<div class="dg">${g}<div class="dg-cap">Fig: P-M Interaction Diagram (IS 456 Annex B). Blue curve = capacity envelope. Green dot = design point INSIDE curve = SAFE. The curve shows all combinations of axial (Pu) and bending (Mu) the column can resist simultaneously.</div></div>`;
}

function checkPMSafe(pts, Pu, Mu) {
  // Check if (Pu, Mu) is inside the interaction curve
  // Find the two points on the curve bracketing this Pu
  const sorted = pts.slice().sort((a, b) => b.Pu - a.Pu);
  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i], p2 = sorted[i + 1];
    if (Pu <= p1.Pu && Pu >= p2.Pu) {
      // Interpolate Mu_cap at this Pu
      const t = (p1.Pu - Pu) / (p1.Pu - p2.Pu);
      const Mu_cap = p1.Mu + t * (p2.Mu - p1.Mu);
      return Mu <= Mu_cap;
    }
  }
  return false;
}

function secPMInteraction() {
  if (!RES) return '<div class="card">Run analysis first.</div>';
  const { cols } = RES;
  const c = cols.find(c2 => c2.floor === 1 && c2.inter) || cols.find(c2 => c2.floor === 1) || cols[0];
  if (!c) return '<div class="card">No column data.</div>';

  // Seismic moment on column = Vb * h / (2 * numCols_per_floor)
  // Simplified: M_seismic = storey_shear * floorHt / numCols * 0.5
  const numCols = (S.spansX.length + 1) * (S.spansY.length + 1);
  const Vi = RES.seis.floors[0]?.Vi || RES.seis.Vb;
  const M_seis = (Vi * S.floorHt) / (numCols * 2); // kN.m per column
  const Pu_d = c.Pu;
  const Mu_d = Math.max(M_seis, c.Pu * c.emin / 1000);

  const pmData = calcPMInteraction(c.size, S.fck, S.fy, c.Aprov, c.nb, c.dB, S.coverCol, 30);
  const safe = checkPMSafe(pmData.pts, Pu_d, Mu_d);

  return `
<div class="card vi">
  <div class="ct vi">P-M Interaction Diagram  -  Column Under Axial + Seismic Bending</div>
  <div class="cd">During an earthquake, columns carry BOTH axial load (from gravity) AND bending moment (from lateral seismic force). The P-M diagram shows if the combined effect is safe. A point INSIDE the curve = safe. OUTSIDE = failure.</div>

  <div class="cp vi">
    <strong>Why P-M interaction matters:</strong> A column designed for pure axial load (Pu only) may FAIL when an earthquake adds bending moment. IS 456 Annex B requires checking the combined effect. The interaction curve is the boundary  -  any (Pu, Mu) combination outside it means the column section is inadequate.
  </div>

  ${sdiv('Column Section: '+c.size+'x'+c.size+'mm | '+c.nb+'-T'+c.dB+' bars ('+r2(c.pt)+'%)')}

  ${sb('PM-1','Design Loads on Column',`
    ${fm('Axial load Pu (gravity cumulative, all floors)',r2(Pu_d)+' kN','IS 456 Cl 18.2')}
    ${fm('Seismic storey shear V1 (ground floor)',r2(Vi)+' kN','IS 1893 Cl 7.6')}
    ${fm('No. of columns per floor = ('+( S.spansX.length+1)+'+1) x ('+(S.spansY.length+1)+'+1)',numCols,'Grid method')}
    ${fm('Seismic moment per col = Vi x floorHt / (numCols x 2) = '+r2(Vi)+' x '+S.floorHt+' / ('+numCols+' x 2)',r2(M_seis)+' kN.m','Simplified distribution')}
    ${fm('Min eccentricity moment = Pu x emin = '+r2(Pu_d)+' x '+r2(c.emin)+'/1000',r2(Pu_d*c.emin/1000)+' kN.m','IS 456 Cl 25.4')}
    ${fm('Design Mu = max(M_seismic, M_emin)',r2(Mu_d)+' kN.m','Governing')}
  `,'vi')}

  ${sb('PM-2','P-M Interaction Diagram (IS 456 Annex B)',`
    ${svgPMDiagram(pmData, Pu_d, Mu_d, c.label)}
    <div class="cp vi">
      <strong>How to read this diagram:</strong><br>
      - <span style="color:var(--blue)">Blue curve</span> = boundary of what the column can carry. Every point ON the curve = column at its limit.<br>
      - <span style="color:${safe?'var(--green)':'var(--red)'}">Coloured dot</span> = your design point (Pu=${r2(Pu_d)}kN, Mu=${r2(Mu_d)}kN.m).<br>
      - Dot INSIDE curve = ${safe?'SAFE OK  -  Column can carry this combination':'UNSAFE FAIL  -  Column cannot carry this combination'}.<br>
      - The curve has three zones: (1) Upper part = compression governs, (2) Around max Mu = balanced failure, (3) Lower part = tension governs.
    </div>
    ${vd(safe,
      safe?'Design point (Pu='+r2(Pu_d)+'kN, Mu='+r2(Mu_d)+'kN.m) is INSIDE the interaction curve  -  column is safe under combined axial + seismic bending':'Design point OUTSIDE the interaction curve  -  column FAILS under combined loading',
      safe?null:'The column section cannot resist the combined axial load and seismic bending simultaneously.',
      safe?null:'Options: (1) Increase column size to '+(c.size+50)+'x'+(c.size+50)+'mm. (2) Increase steel to 2% or more. (3) Add shear wall to reduce seismic moment on column.'
    )}
  `,'vi')}

  ${sb('PM-3','Key Points on the Interaction Curve',`
    <table>
      <tr><th>Point</th><th>Pu (kN)</th><th>Mu (kN.m)</th><th>What it means</th></tr>
      <tr><td>Pure compression</td><td class="val">${r2(pmData.Pu_max)}</td><td class="val">0</td><td>Max axial  -  no bending at all (impossible in practice)</td></tr>
      <tr><td>Max moment (balanced)</td><td class="val">${r2(pmData.MuMaxPt?.Pu||0)}</td><td class="val">${r2(pmData.MuMax)}</td><td>Most bending the column can take  -  steel and concrete fail simultaneously</td></tr>
      <tr><td>Pure bending</td><td class="val">0</td><td class="val">${r2(pmData.Mu_pb)}</td><td>Max moment with zero axial  -  like a beam</td></tr>
      <tr><td><strong>Design point</strong></td><td class="val" style="color:${safe?'var(--green)':'var(--red)'}">${r2(Pu_d)}</td><td class="val" style="color:${safe?'var(--green)':'var(--red)'}">${r2(Mu_d)}</td><td style="color:${safe?'var(--green)':'var(--red)'}">${safe?'INSIDE curve  -  SAFE':'OUTSIDE curve  -  UNSAFE'}</td></tr>
    </table>
  `,'vi')}

  ${sb('PM-4','Why Axial Load HELPS Columns in Bending (up to a point)',`
    <div class="cp vi">
      <strong>Counter-intuitive fact:</strong> Adding axial compression to a column INCREASES its moment capacity  -  up to the balanced point.<br><br>
      This is because the axial load puts the section into compression, helping close cracks that bending would open. This is why columns carry more moment than beams of the same size.<br><br>
      <strong>But beyond the balanced point</strong>, more axial load REDUCES moment capacity  -  because the concrete crushes before the steel yields (brittle failure). This is the dangerous zone  -  high axial + high bending.<br><br>
      <strong>IS 13920 Rule:</strong> For seismic design, axial load on columns must not exceed 0.4xfckxAg (IS 13920 Cl 7.2). This keeps columns in the ductile region of the interaction curve where they can absorb seismic energy.
    </div>
    ${fm('IS 13920 axial limit = 0.4 x fck x Ag = 0.4 x '+S.fck+' x '+r0(c.Ag),r2(0.4*S.fck*c.Ag/1000)+' kN','IS 13920 Cl 7.2')}
    ${fm('Design Pu = '+r2(Pu_d)+' kN',r2(Pu_d/( 0.4*S.fck*c.Ag/1000)*100)+'% of limit','Is Pu within IS 13920 limit?')}
    ${vd(Pu_d <= 0.4*S.fck*c.Ag/1000,
      'Pu ('+r2(Pu_d)+'kN) '+(Pu_d<=0.4*S.fck*c.Ag/1000?'<=':'>')+' IS 13920 limit ('+r2(0.4*S.fck*c.Ag/1000)+'kN)  -  Column '+(Pu_d<=0.4*S.fck*c.Ag/1000?'remains ductile OK':'may become brittle FAIL'),
      Pu_d > 0.4*S.fck*c.Ag/1000?'High axial ratio reduces ductility  -  column cannot absorb seismic energy by bending.':null,
      Pu_d > 0.4*S.fck*c.Ag/1000?'Increase column size to reduce axial ratio, or add shear walls to reduce seismic demand.':null
    )}
  `,'vi')}
</div>`;
}


// =======================================================
// FEATURE 2: CONTINUOUS BEAM ANALYSIS  -  Moment Distribution
// Three-span continuous beam using IS 456 Table 12/13
// =======================================================


// == 10b_continuous_beam.js ==

// ================================================================
// MODULE: 10b_continuous_beam
// Continuous Beam Analysis
// ================================================================

function calcContinuousBeam(spans, wu_per_span, fck, fy, b, D, coverBeam) {
  // Use IS 456 Table 12 (simply supported end conditions)
  // and Table 13 (fixed end conditions) coefficients
  // For 3-span continuous beam, typical residential
  const n = spans.length;
  if (n < 2) return null;

  const d = D - coverBeam - 8 - 10;
  const Mf = 0.36 * (fy/1.15/(fy/1.15+700)) * (1-0.42*(fy/1.15/(fy/1.15+700)));
  const Mulim_val = Mf * fck * b * d * d / 1e6;

  // IS 456 Table 12: Bending moment coefficients for continuous beams
  // alpham values at support and midspan for different end conditions
  // For beams with more than 2 spans:
  // Near middle of end span: +1/10 (simply supported end), +1/12 (fixed end)
  // At first interior support: -1/10
  // Middle of interior span: +1/16
  // At interior supports: -1/12

  const results = [];
  spans.forEach((L, i) => {
    const wu = wu_per_span[i] || wu_per_span[0];
    const isFirst = i === 0;
    const isLast = i === n - 1;
    const isInterior = !isFirst && !isLast;

    // IS 456 Table 12 moment coefficients
    let alpha_mid, alpha_sup_left, alpha_sup_right;

    if (isFirst || isLast) {
      // End span
      alpha_mid = 1 / 10;      // near middle of end span (simply supported end)
      alpha_sup_left = isFirst ? 0 : -1 / 10;
      alpha_sup_right = isLast ? 0 : -1 / 10;
    } else {
      // Interior span
      alpha_mid = 1 / 16;     // middle of interior span
      alpha_sup_left = -1 / 12;
      alpha_sup_right = -1 / 12;
    }

    const Mmid = alpha_mid * wu * L * L;   // kN.m (sagging, positive)
    const Msup_L = Math.abs(alpha_sup_left * wu * L * L); // kN.m (hogging)
    const Msup_R = Math.abs(alpha_sup_right * wu * L * L);
    const Mmax_design = Math.max(Mmid, Msup_L, Msup_R);

    // Reinforcement
    const bA = Math.PI * 100; // T20 area
    const AstCalcCB=(Mu)=>{
      if (Mu <= 0) return 0.85 * b * d / fy;
      const inner = 1 - Mu * 1e6 / (0.36 * fck * b * d * 0.48 * d);
      if (inner <= 0) return 0.85 * b * d / fy;
      const A = Mu * 1e6 / (0.87 * fy * d * inner);
      return Math.max(A, 0.85 * b * d / fy);
    }

    const Ast_mid = AstCalcCB(Mmid);
    const Ast_sup = AstCalcCB(Math.max(Msup_L, Msup_R));
    const nm = Math.max(2, Math.ceil(Ast_mid / bA));
    const ns = Math.max(2, Math.ceil(Ast_sup / bA));

    // Shear: RA, RB (IS 456 Table 13 for continuous)
    // End support: 0.4*wu*L, First interior: 0.6*wu*L (from IS 456 Table 13)
    const RA = (isFirst ? 0.4 : 0.5) * wu * L;
    const RB = (isLast ? 0.4 : 0.6) * wu * L;
    const Vmax = Math.max(RA, RB);
    const tv = Vmax * 1000 / (b * d);

    results.push({
      span: i + 1, L, wu, isFirst, isLast, isInterior,
      alpha_mid, Mmid, Msup_L, Msup_R,
      simply_Mmax: wu * L * L / 8,  // for comparison
      reduction: (1 - Mmid / (wu * L * L / 8)) * 100,
      Ast_mid, Ast_sup, nm, ns,
      RA, RB, Vmax, tv,
      Mulim: Mulim_val,
      safe_mid: Mmid <= Mulim_val,
      safe_sup: Math.max(Msup_L, Msup_R) <= Mulim_val
    });
  });

  return { results, d, Mulim: Mulim_val, b, D };
}

function svgContinuousBeamBMD(results, spans) {
  const W = 520, H = 260, pad = 40, base = 140;
  const totalL = spans.reduce((a, b) => a + b, 0);
  const bw = W - 2 * pad;
  const maxM = Math.max(...results.map(r => Math.max(r.Mmid, r.Msup_L, r.Msup_R, r.simply_Mmax)));
  const sc = (H - base - 30) / maxM;

  let g = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g += `<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;

  // Baseline
  g += `<line x1="${pad}" y1="${base}" x2="${pad + bw}" y2="${base}" stroke="#64748b" stroke-width="2.5"/>`;

  let xCursor = pad;
  results.forEach((r, i) => {
    const spanW = r.L / totalL * bw;
    const x0 = xCursor, x1 = xCursor + spanW;
    const xm = x0 + spanW / 2;

    // Simply supported BMD (dashed, grey) for comparison
    const nPts = 20;
    const ssPts = [];
    for (let j = 0; j <= nPts; j++) {
      const t = j / nPts;
      const x_pos = x0 + t * spanW;
      const M_ss = r.wu * r.L * t * (1 - t) * r.L / 2; // = wu*L^2/8 * 4t(1-t)
      ssPts.push(`${x_pos.toFixed(1)},${(base - M_ss * sc).toFixed(1)}`);
    }
    g += `<polyline points="${ssPts.join(' ')}" fill="none" stroke="rgba(100,116,139,0.4)" stroke-width="1.5" stroke-dasharray="4,3"/>`;

    // Continuous BMD (solid)
    // Parabolic between support moments
    const M_L = i === 0 ? 0 : r.Msup_L;
    const M_R = i === results.length - 1 ? 0 : r.Msup_R;
    const contPts = [];
    for (let j = 0; j <= nPts; j++) {
      const t = j / nPts;
      // Superimpose: UDL parabola + linear variation of support moments
      const M_udl = r.wu * r.L * t * (1 - t) * r.L / 2;
      const M_linear = -M_L * (1 - t) - M_R * t; // hogging at supports (negative sign)
      const M_total = M_udl + M_linear;
      const x_pos = x0 + t * spanW;
      contPts.push(`${x_pos.toFixed(1)},${(base - M_total * sc).toFixed(1)}`);
    }
    // Fill under continuous BMD
    const fillPts = contPts.join(' ') + ` ${x1},${base} ${x0},${base}`;
    g += `<polygon points="${contPts.join(' ')} ${x1},${base} ${x0},${base}" fill="rgba(251,146,60,0.15)"/>`;
    g += `<polyline points="${contPts.join(' ')}" fill="none" stroke="#fb923c" stroke-width="2.5"/>`;

    // Midspan value label
    const Mmid_y = base - r.Mmid * sc;
    g += `<circle cx="${xm}" cy="${Mmid_y}" r="4" fill="#fb923c"/>`;
    g += `<text x="${xm}" y="${Mmid_y - 7}" fill="#fb923c" font-size="9" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">+${r2(r.Mmid)}</text>`;

    // Span label
    g += `<text x="${xm}" y="${base + 16}" fill="#64748b" font-size="9" text-anchor="middle" font-family="JetBrains Mono">Span ${r.span} (${r.L}m)</text>`;

    // Support moment markers (hogging)
    if (i > 0) {
      const sup_y = base + r.Msup_L * sc;
      g += `<line x1="${x0}" y1="${base}" x2="${x0}" y2="${sup_y}" stroke="#38bdf8" stroke-width="1.5"/>`;
      g += `<text x="${x0}" y="${sup_y + 12}" fill="#38bdf8" font-size="9" text-anchor="middle" font-family="JetBrains Mono">-${r2(r.Msup_L)}</text>`;
    }

    xCursor += spanW;
  });

  // Last support
  const lastR = results[results.length - 1];
  if (lastR.Msup_R > 0) {
    const sup_y = base + lastR.Msup_R * sc;
    g += `<line x1="${pad + bw}" y1="${base}" x2="${pad + bw}" y2="${sup_y}" stroke="#38bdf8" stroke-width="1.5"/>`;
  }

  // Legend
  g += `<line x1="${W - 180}" y1="15" x2="${W - 155}" y2="15" stroke="#fb923c" stroke-width="2.5"/>`;
  g += `<text x="${W - 150}" y="19" fill="#fb923c" font-size="9" font-family="JetBrains Mono">Continuous BMD</text>`;
  g += `<line x1="${W - 180}" y1="30" x2="${W - 155}" y2="30" stroke="rgba(100,116,139,0.6)" stroke-width="1.5" stroke-dasharray="4,3"/>`;
  g += `<text x="${W - 150}" y="34" fill="#64748b" font-size="9" font-family="JetBrains Mono">Simply supported (compare)</text>`;

  g += `<text x="${W / 2}" y="${H - 4}" fill="#fb923c" font-size="10" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">BENDING MOMENT DIAGRAM  -  CONTINUOUS BEAM (kN.m)</text>`;
  g += '</svg>';
  return `<div class="dg">${g}<div class="dg-cap">Fig: BMD for continuous beam using IS 456 Table 12 coefficients. Orange = continuous beam (lower moments due to redistribution). Grey dashed = simply supported for comparison. Blue = hogging moments at interior supports.</div></div>`;
}

function secContinuousBeam() {
  if (!RES) return '<div class="card">Run analysis first.</div>';
  const { beams } = RES;
  if (!beams || !beams.length) return '<div class="card">No beam data.</div>';

  // Use X-direction beams for continuous analysis
  const xBeams = beams.filter(b => b.dir === 'X');
  if (!xBeams.length) return '<div class="card">No X-direction beams.</div>';

  const b_sz = xBeams[0].b, D_sz = xBeams[0].D;
  const spans = xBeams.map(b => b.L);
  const wu_spans = xBeams.map(b => b.wu);

  const cb = calcContinuousBeam(spans, wu_spans, S.fck, S.fy, b_sz, D_sz, S.coverBeam);
  if (!cb) return '<div class="card">Could not compute.</div>';

  return `
<div class="card or">
  <div class="ct or">Continuous Beam Analysis  -  IS 456 Table 12 Moment Coefficients</div>
  <div class="cd">Real buildings have continuous beams  -  beams connected across multiple spans. Continuity reduces midspan moments (by 20-40%) but creates hogging moments at supports. IS 456 Table 12 gives moment coefficients for different span and loading conditions.</div>

  <div class="cp or">
    <strong>Simply supported vs Continuous  -  the key difference:</strong><br>
    Simply supported: Midspan M = wL^2/8 (maximum at centre, zero at ends)<br>
    Continuous: Midspan M = wL^2/10 or wL^2/16 (reduced!) BUT hogging M at supports = wL^2/10 or wL^2/12<br><br>
    <strong>Why this matters for design:</strong> Continuous beams need TOP steel at supports (for hogging) and BOTTOM steel at midspan (for sagging). Simply supported beams only need bottom steel. Getting this wrong means cracks at supports from hogging moment that wasn't designed for.
  </div>

  ${sb('CB-1','Bending Moment Diagram  -  Continuous vs Simply Supported',`
    ${svgContinuousBeamBMD(cb.results, spans)}
  `,'or')}

  ${sb('CB-2','Moment Coefficients  -  IS 456 Table 12',`
    <div class="cp or">IS 456 Table 12 gives alpha values. Mu = alpha x wu x L^2. Different alpha for end spans vs interior spans, and at midspan vs supports.</div>
    <table>
      <tr><th>Span</th><th>L (m)</th><th>wu (kN/m)</th><th>alpha_mid</th><th>Mmid (kN.m)</th><th>alpha_sup</th><th>Msup (kN.m)</th><th>SS Mmax</th><th>Reduction</th></tr>
      ${cb.results.map(r => `
        <tr>
          <td>${r.isFirst ? 'End' : r.isLast ? 'End' : 'Interior'} Span ${r.span}</td>
          <td>${r.L}</td><td>${r2(r.wu)}</td>
          <td class="val">1/${Math.round(1/r.alpha_mid)}</td>
          <td class="val">${r2(r.Mmid)}</td>
          <td class="val">${r.isFirst || r.isLast ? '1/10' : '1/12'}</td>
          <td class="val">${r2(Math.max(r.Msup_L, r.Msup_R))}</td>
          <td>${r2(r.simply_Mmax)}</td>
          <td class="${r.reduction > 0 ? 'ok' : ''}">${r2(r.reduction)}% less</td>
        </tr>`).join('')}
    </table>
    <div class="cp or"><strong>Key takeaway:</strong> Continuous beam midspan moment is ${r2(cb.results[0]?.reduction || 0)}% LESS than simply supported. This saves steel at midspan but you must provide hogging steel at supports.</div>
  `,'or')}

  ${sb('CB-3','Reinforcement for Continuous Beam',`
    <table>
      <tr><th>Span</th><th>Midspan Ast</th><th>Bot Bars</th><th>Support Ast</th><th>Top Bars</th><th>Curtailment</th></tr>
      ${cb.results.map(r => `
        <tr>
          <td>Span ${r.span}</td>
          <td>${r0(r.Ast_mid)} mm^2</td>
          <td class="val">${r.nm}-T20 (bottom)</td>
          <td>${r0(r.Ast_sup)} mm^2</td>
          <td class="val">${r.ns}-T20 (top)</td>
          <td>Top bars: extend L/4 from each support</td>
        </tr>`).join('')}
    </table>
    <div class="cp or">
      <strong>Top bar curtailment rule (IS 456 Cl 26.2.3):</strong> Top bars at interior supports must extend at least L/4 (quarter of span) from the support face into EACH adjacent span. This covers the hogging moment zone. Do NOT cut them off at the support face.
    </div>
  `,'or')}

  ${sb('CB-4','Shear in Continuous Beam  -  IS 456 Table 13',`
    <div class="cp or">IS 456 Table 13: Shear force coefficients. End support = 0.4wL. First interior support (outer face) = 0.6wL  -  this is 50% MORE than the end support and must be designed carefully.</div>
    <table>
      <tr><th>Span</th><th>RA (kN)</th><th>RB (kN)</th><th>Vmax (kN)</th><th>tv (N/mm^2)</th><th>Status</th></tr>
      ${cb.results.map(r => `<tr>
        <td>Span ${r.span}</td>
        <td>${r2(r.RA)}</td><td>${r2(r.RB)}</td>
        <td class="val">${r2(r.Vmax)}</td>
        <td class="val">${r2(r.tv)}</td>
        <td class="${r.tv <= 3.1 ? 'ok' : 'ng'}">${r.tv <= 3.1 ? 'OK' : 'CHECK'}</td>
      </tr>`).join('')}
    </table>
  `,'or')}
</div>`;
}


// =======================================================
// FEATURE 3: SEISMIC DRIFT CHECK  -  IS 1893:2016 Cl 7.11
// =======================================================


// == 10c_seismic_drift.js ==

// ================================================================
// MODULE: 10c_seismic_drift
// Seismic Drift Check
// ================================================================

function calcSeismicDrift(floors, floorHt, numFloors, buildingW, fck, spansX, spansY, beams, cols) {
  // IS 1893:2016 Cl 7.11.1: Storey drift limit = 0.004 x storey height
  // Approximate lateral stiffness using Kani's method or simplified frame
  // Simplified: K_storey = Sum(12EI/h^3) for columns + factor for beams
  const Ec = 5000 * Math.sqrt(fck);
  const h = floorHt * 1000; // mm
  const driftLimit = 0.004 * h; // mm

  const colTypes = ['corner', 'edge', 'inter'];
  const nCols = (spansX.length + 1) * (spansY.length + 1);
  const nCorner = 4, nEdge = 2 * spansX.length + 2 * spansY.length - 4;
  const nInter = nCols - nCorner - nEdge;

  const driftResults = floors.slice().reverse().map(f => {
    // Find col for this floor
    const c = cols?.find(c2 => c2.floor === f.floor && c2.inter) ||
      cols?.find(c2 => c2.floor === f.floor) ||
      { size: 300, Aprov: 804 };
    const colSize = c.size || 300;
    const Ic = colSize * colSize * colSize * colSize / 12; // mm^4

    // Column lateral stiffness K = 12EI/h^3 per column
    const Kcol = 12 * Ec * Ic / (h * h * h); // N/mm

    // Total storey stiffness (sum of all columns)
    const Ktotal = nCols * Kcol; // N/mm = kN/m * 1e3/1e3 = same

    // Storey shear (from seismic distribution)
    const Vi_kN = f.Vi; // kN

    // Lateral displacement of this storey
    const delta_i = Vi_kN * 1000 / (Ktotal) * 1000; // convert to mm
    // Note: Ktotal in N/mm, Vi in N -> delta in mm

    // Drift = delta_i (storey displacement)
    const drift = delta_i;
    const driftRatio = drift / h;
    const safe = drift <= driftLimit;

    return {
      floor: f.floor,
      h: floorHt,
      Vi: Vi_kN,
      Ktotal_kNm: Ktotal / 1000, // kN/m
      delta: Math.round(drift * 100) / 100,
      drift: Math.round(drift * 100) / 100,
      driftLimit: Math.round(driftLimit * 10) / 10,
      driftRatio: (driftRatio * 1000).toFixed(2),
      safe,
      Kcol: Math.round(Kcol / 1000),
      colSize
    };
  });

  return { driftResults, driftLimit, h };
}

function svgDriftDiagram(driftResults, floorHt) {
  const W = 340, H = 280, pad = 50;
  const nFloors = driftResults.length;
  const maxDrift = Math.max(...driftResults.map(r => r.drift), driftResults[0]?.driftLimit || 10) * 1.3;
  const bw = W - pad - 30, bh = H - 2 * pad;
  const scX = bw / maxDrift;
  const floorH = bh / (nFloors + 1);

  let g = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g += `<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;

  // Floor lines
  for (let i = 0; i <= nFloors; i++) {
    const y2 = pad + i * floorH;
    g += `<line x1="${pad}" y1="${y2}" x2="${pad + bw}" y2="${y2}" stroke="#1e3a5f" stroke-width="0.8"/>`;
    const flNum = nFloors - i;
    if (flNum >= 0) g += `<text x="${pad - 5}" y="${y2 + 4}" fill="#64748b" font-size="9" text-anchor="end" font-family="JetBrains Mono">F${flNum}</text>`;
  }

  // Drift limit line
  const limitX = pad + driftResults[0]?.driftLimit * scX;
  g += `<line x1="${limitX}" y1="${pad}" x2="${limitX}" y2="${pad + bh}" stroke="#f87171" stroke-width="1.5" stroke-dasharray="4,3"/>`;
  g += `<text x="${limitX + 3}" y="${pad + 12}" fill="#f87171" font-size="8" font-family="JetBrains Mono">Limit</text>`;
  g += `<text x="${limitX + 3}" y="${pad + 21}" fill="#f87171" font-size="8" font-family="JetBrains Mono">${driftResults[0]?.driftLimit}mm</text>`;

  // Drift bars
  driftResults.slice().reverse().forEach((r, i) => {
    const y2 = pad + i * floorH;
    const barH = floorH * 0.6;
    const barW = r.drift * scX;
    const clr = r.safe ? '#34d399' : '#f87171';
    g += `<rect x="${pad}" y="${y2 + floorH * 0.2}" width="${barW}" height="${barH}" fill="${clr}" fill-opacity="0.7" rx="2"/>`;
    g += `<text x="${pad + barW + 3}" y="${y2 + floorH * 0.6}" fill="${clr}" font-size="8" font-family="JetBrains Mono">${r.drift}mm</text>`;
  });

  g += `<text x="${W / 2}" y="14" fill="#34d399" font-size="10" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">STOREY DRIFT (mm)</text>`;
  g += `<text x="${pad + bw / 2}" y="${H - 8}" fill="#64748b" font-size="9" text-anchor="middle" font-family="JetBrains Mono">Drift (mm)  -  Red line = 0.004 x storey height (IS 1893 limit)</text>`;
  g += '</svg>';
  return `<div class="dg">${g}<div class="dg-cap">Fig: Storey drift at each floor under seismic loading. Green bars = within IS 1893 limit. Red bars = exceeds limit  -  add shear walls or increase column stiffness.</div></div>`;
}

function secSeismicDrift() {
  if (!RES) return '<div class="card">Run analysis first.</div>';
  const { seis, cols, beams } = RES;
  const dr = calcSeismicDrift(
    seis.floors, S.floorHt, S.numFloors, S.buildingW,
    S.fck, S.spansX, S.spansY, beams, cols
  );
  const allSafe = dr.driftResults.every(r => r.safe);

  return `
<div class="card" style="border-color:rgba(45,212,191,.3)">
  <div class="ct tl">Seismic Drift Check  -  IS 1893:2016 Cl 7.11</div>
  <div class="cd">Drift = the horizontal displacement of one floor relative to the floor below during an earthquake. Too much drift damages non-structural elements (walls, windows, pipes) even if the structure itself doesn't collapse.</div>

  <div class="cp tl">
    <strong>IS 1893:2016 Cl 7.11.1 limit:</strong> Storey drift <= 0.004 x storey height<br>
    For this building: 0.004 x ${S.floorHt*1000}mm = <strong>${r2(0.004*S.floorHt*1000)}mm</strong> per floor<br><br>
    <strong>Why drift matters even if structure is safe:</strong> A building can be structurally intact but drift so much that all the brick infill walls crack, windows shatter, and pipework breaks. The drift limit protects these non-structural elements and ensures the building remains functional after a moderate earthquake (not just that it doesn't collapse).
  </div>

  ${sb('DR-1','Lateral Stiffness of Each Storey',`
    <div class="cp tl">Storey stiffness K = sum of all column stiffnesses = Sum(12EI/h^3). Stiffer columns = less drift. Taller storeys = much less stiff (stiffness prop 1/h^3  -  doubling floor height reduces stiffness 8x).</div>
    ${fm('Column stiffness formula: K_col = 12EI/h^3 per column','K = 12 x Ec x (colSize^4/12) / floorHt^3','IS 1893, Frame analysis')}
    ${fm('Ec = 5000sqrtfck = 5000sqrt'+S.fck,r0(5000*Math.sqrt(S.fck))+' N/mm^2','IS 456 Cl 6.2.3.1')}
    ${fm('Column size (ground floor)',r0(dr.driftResults[dr.driftResults.length-1]?.colSize||300)+' x '+r0(dr.driftResults[dr.driftResults.length-1]?.colSize||300)+' mm','')}
    ${fm('Storey stiffness (sum, all columns)',r0(dr.driftResults[dr.driftResults.length-1]?.Ktotal_kNm||0)+' kN/m','')}
  `,'tl')}

  ${sb('DR-2','Drift Check  -  All Floors',`
    <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
      <div style="flex:2;min-width:240px">
        <table>
          <tr><th>Floor</th><th>Storey Shear Vi (kN)</th><th>Storey Stiffness (kN/m)</th><th>Drift (mm)</th><th>Limit (mm)</th><th>Status</th></tr>
          ${dr.driftResults.map(r => `<tr>
            <td>${r.floor}</td>
            <td>${r2(r.Vi)}</td>
            <td>${r0(r.Ktotal_kNm)}</td>
            <td class="val">${r.drift}</td>
            <td>${r.driftLimit}</td>
            <td class="${r.safe?'ok':'ng'}">${r.safe?'OK OK':'FAIL FAIL'}</td>
          </tr>`).join('')}
        </table>
      </div>
      <div style="flex:1;min-width:200px">${svgDriftDiagram(dr.driftResults, S.floorHt)}</div>
    </div>
    ${vd(allSafe,
      allSafe?'All storeys satisfy IS 1893 drift limit of '+r2(dr.driftLimit)+'mm OK':'One or more storeys EXCEED drift limit of '+r2(dr.driftLimit)+'mm',
      allSafe?null:'Excessive drift will damage infill walls, windows and services even if structure survives the earthquake.',
      allSafe?null:'Solutions: (1) Add RC shear walls  -  most effective. (2) Increase column sizes  -  deeper section increases I by D^4. (3) Reduce storey height. A 300mm shear wall 2m long adds ~10x the stiffness of a single column.'
    )}
  `,'tl')}

  ${sb('DR-3','How to Reduce Drift  -  Shear Wall Design Concept',`
    <div class="cp tl">
      <strong>Shear wall stiffness:</strong> K_wall = (ExtxL^3/h^3) x [1/(1+3(L/h)^2)] approx<br>
      A 230mm thick x 2000mm long shear wall adds approximately:<br>
      K_wall ~ ${r0(5000*Math.sqrt(S.fck)*230*Math.pow(2000,3)/(12*Math.pow(S.floorHt*1000,3))/1000)} kN/m  -  much more than a single column.<br><br>
      <strong>IS 13920 shear wall requirement:</strong> If the building has more than 5 storeys OR is in Zone IV/V, provision of shear walls is strongly recommended (IS 13920 Cl 9). Two shear walls in each direction is typical for a residential building.
    </div>
    ${fm('Recommended shear wall: 230mm thick x 2000mm long x full height','Adds ~'+r0(5000*Math.sqrt(S.fck)*230*2000*2000*2000/(12*Math.pow(S.floorHt*1000,3))/1000)+' kN/m stiffness per wall','IS 13920 Cl 9')}
  `,'tl')}
</div>`;
}


// =======================================================
// FEATURE 4: TWO-WAY SLAB WITH EDGE CONDITIONS
// IS 456 Table 26  -  coefficients for different boundary conditions
// =======================================================
const IS456_T26 = {
  // [case]: {ax_pos, ay_pos, ax_neg, ay_neg} for ly/lx = 1.0 to 2.0
  // Case 1: Interior panel  -  all four edges continuous
  1: { name:'Interior panel (all 4 edges continuous)', ax:[0.032,0.037,0.043,0.048,0.053,0.058,0.063,0.067,0.071,0.075,0.079], ay:[0.032,0.028,0.025,0.023,0.022,0.021,0.020,0.019,0.018,0.017,0.017], ax_n:0.045, ay_n:0.045 },
  // Case 2: One short edge discontinuous
  2: { name:'One short edge discontinuous', ax:[0.037,0.043,0.048,0.051,0.055,0.058,0.061,0.064,0.067,0.069,0.071], ay:[0.037,0.032,0.029,0.027,0.025,0.024,0.023,0.022,0.021,0.020,0.020], ax_n:0.045, ay_n:0.045 },
  // Case 3: One long edge discontinuous
  3: { name:'One long edge discontinuous', ax:[0.037,0.044,0.052,0.057,0.063,0.067,0.071,0.075,0.078,0.081,0.083], ay:[0.037,0.028,0.023,0.020,0.018,0.016,0.015,0.014,0.013,0.013,0.012], ax_n:0.045, ay_n:0.045 },
  // Case 4: Two adjacent edges discontinuous
  4: { name:'Two adjacent edges discontinuous (corner panel)', ax:[0.047,0.053,0.060,0.065,0.071,0.075,0.080,0.084,0.088,0.091,0.095], ay:[0.047,0.040,0.036,0.033,0.031,0.029,0.028,0.027,0.025,0.025,0.024], ax_n:0.045, ay_n:0.037 },
  // Case 5: Two short edges discontinuous
  5: { name:'Two short edges discontinuous', ax:[0.045,0.049,0.052,0.056,0.059,0.060,0.062,0.063,0.064,0.065,0.065], ay:[0.045,0.039,0.035,0.032,0.030,0.028,0.027,0.026,0.025,0.024,0.024], ax_n:0.000, ay_n:0.045 },
  // Case 6: Two long edges discontinuous
  6: { name:'Two long edges discontinuous', ax:[0.045,0.054,0.063,0.071,0.078,0.084,0.091,0.097,0.103,0.108,0.113], ay:[0.045,0.036,0.028,0.024,0.021,0.018,0.016,0.015,0.014,0.013,0.012], ax_n:0.045, ay_n:0.000 },
  // Case 7: Three edges discontinuous (one long edge continuous)
  7: { name:'Three edges discontinuous (one long edge continuous)', ax:[0.057,0.065,0.071,0.076,0.081,0.084,0.087,0.090,0.092,0.093,0.094], ay:[0.057,0.048,0.042,0.038,0.035,0.032,0.030,0.028,0.027,0.026,0.025], ax_n:0.000, ay_n:0.045 },
  // Case 8: Three edges discontinuous (one short edge continuous)
  8: { name:'Three edges discontinuous (one short edge continuous)', ax:[0.057,0.067,0.077,0.085,0.093,0.099,0.106,0.111,0.116,0.120,0.124], ay:[0.057,0.043,0.035,0.029,0.025,0.022,0.020,0.018,0.017,0.016,0.015], ax_n:0.045, ay_n:0.000 },
  // Case 9: All four edges discontinuous (simply supported)
  9: { name:'Simply supported all four edges', ax:[0.062,0.074,0.084,0.093,0.099,0.104,0.113,0.118,0.122,0.124,0.125], ay:[0.062,0.061,0.059,0.055,0.051,0.046,0.042,0.038,0.035,0.032,0.029], ax_n:0.000, ay_n:0.000 },
};


// == 10d_slab_edge.js ==

// ================================================================
// MODULE: 10d_slab_edge
// Two-way Slab Edge Conditions
// ================================================================

function getSlabCoeffs(slabCase, ratio) {
  const c = IS456_T26[slabCase];
  if (!c) return null;
  // Interpolate for ratio between 1.0 and 2.0 (11 values at 0.1 intervals)
  const idx = Math.min(Math.max((ratio - 1.0) / 0.1, 0), 10);
  const i0 = Math.floor(idx), i1 = Math.min(i0 + 1, 10);
  const t = idx - i0;
  const ax = c.ax[i0] + t * (c.ax[i1] - c.ax[i0]);
  const ay = c.ay[i0] + t * (c.ay[i1] - c.ay[i0]);
  return { ax, ay, ax_n: c.ax_n, ay_n: c.ay_n, name: c.name };
}

function secSlabEdgeConditions() {
  if (!RES) return '<div class="card">Run analysis first.</div>';
  const { slab } = RES;
  const lx = slab.lx, ly = slab.ly, ratio = slab.ratio;
  const slabD = slab.slabD, slabd = slab.slabd;
  const wu = slab.wu_sl;
  const fck = S.fck, fy = S.fy;

  const calcCase=(caseNum)=>{
    const coeffs = getSlabCoeffs(caseNum, Math.min(ratio, 2.0));
    if (!coeffs) return null;
    const Mx_pos = coeffs.ax * wu * lx * lx;
    const My_pos = coeffs.ay * wu * lx * lx;
    const Mx_neg = coeffs.ax_n * wu * lx * lx;
    const My_neg = coeffs.ay_n * wu * lx * lx;
    const Mf_s = fy>=500?0.133:fy>=415?0.138:0.149;
    const Mulim = Mf_s * fck * 1000 * slabd * slabd / 1e6;

    const astCalc=(Mu)=>{
      // IS 456 Annex G.1.1(b) — exact closed-form for required Ast.
      const Astmin = 0.12 * 1000 * slabD / 100;
      if (Mu <= 0) return Astmin;
      const factor = 4.598 * Mu * 1e6 / (fck * 1000 * slabd * slabd);
      if (factor >= 1) return Math.max(Mulim*1e6/(0.87*fy*slabd*0.85), Astmin);
      const A = 0.5 * fck * 1000 * slabd / fy * (1 - Math.sqrt(1 - factor));
      return Math.max(A, Astmin);
    }

    const Ast_mx = astCalc(Mx_pos);
    const Ast_my = astCalc(My_pos);
    const spx = clamp(Math.floor(1000 * Math.PI * 25 / Ast_mx), 75, Math.min(3 * slabD, 300));
    const spy = clamp(Math.floor(1000 * Math.PI * 16 / Ast_my), 75, 300);

    return {
      caseNum, name: coeffs.name, ax: coeffs.ax, ay: coeffs.ay,
      ax_n: coeffs.ax_n, ay_n: coeffs.ay_n,
      Mx_pos, My_pos, Mx_neg, My_neg, Mulim,
      Ast_mx, Ast_my, spx, spy,
      safe: Mx_pos <= Mulim && My_pos <= Mulim
    };
  }

  const cases = [1, 2, 4, 9].map(n => calcCase(n)).filter(Boolean);
  const userCase = calcCase(9); // Default simply supported for comparison

  return `
<div class="card">
  <div class="ct">Two-Way Slab  -  Edge Conditions & IS 456 Table 26 Coefficients</div>
  <div class="cd">The boundary conditions of a slab panel (which edges are continuous vs simply supported) dramatically change the design moments. IS 456 Table 26 gives 9 different cases. Using the WRONG case leads to over or under-design.</div>

  <div class="cp">
    <strong>What are edge conditions?</strong><br>
    - <strong>Continuous edge</strong> = slab continues over a beam into the next panel. The beam provides rotational restraint  -  the slab "wants" to lift off the beam at the edge, creating hogging moment there. Less sagging at midspan.<br>
    - <strong>Discontinuous (simply supported) edge</strong> = slab ends at the beam (edge beam, wall, or end of building). No restraint  -  slab is free to rotate. More sagging at midspan, no hogging at the edge.<br><br>
    <strong>Practical implication:</strong> An interior panel (Case 1) has 50% less midspan moment than a simply supported panel (Case 9)  -  but needs hogging steel at ALL four edges. The positions in the building determine which case applies to each panel.
  </div>

  <div class="cp">
    <strong>Panel: lx = ${r2(lx)}m x ly = ${r2(ly)}m | ly/lx = ${r2(Math.min(ratio,2))} | wu = ${r2(wu)} kN/m^2</strong>
  </div>

  ${sb('SE-1','Comparison of All Four Common Cases',`
    <table>
      <tr><th>Case</th><th>Edge Condition</th><th>alphax (midspan)</th><th>Mx_pos</th><th>alphay (midspan)</th><th>My_pos</th><th>Mx_neg (support)</th><th>Steel vs SS</th></tr>
      ${cases.map(c => `<tr>
        <td class="val">Case ${c.caseNum}</td>
        <td style="font-size:10px">${c.name}</td>
        <td>${r2(c.ax)}</td>
        <td class="${c.caseNum===9?'':'ok'} val">${r2(c.Mx_pos)} kN.m</td>
        <td>${r2(c.ay)}</td>
        <td class="val">${r2(c.My_pos)} kN.m</td>
        <td class="val">${r2(c.Mx_neg)} kN.m</td>
        <td class="${c.caseNum<9?'ok':''}">${c.caseNum===9?'Baseline':'-'+r2((1-c.Mx_pos/(userCase?.Mx_pos||1))*100)+'%'}</td>
      </tr>`).join('')}
    </table>
    <div class="cp">
      <strong>Key learning:</strong> An interior slab panel (Case 1) needs only ${r2((cases[0]?.ax||0.032)/(cases[3]?.ax||0.062)*100)}% of the midspan steel of a simply supported panel (Case 9). This is why continuity in slab design is important  -  it saves steel AND reduces deflection.
    </div>
  `)}

  ${sb('SE-2','How to Identify Your Case on Site',`
    <div class="cp">
      Walk around the slab and look at each of the 4 edges:<br><br>
      <strong>Is this edge continuous or discontinuous?</strong><br>
      - Beam runs INTO another slab panel -> <strong>Continuous</strong> (rotation restrained)<br>
      - Beam is at the building perimeter (edge beam / wall) -> <strong>Discontinuous</strong> (simply supported)<br>
      - Opening or cantilever beyond -> <strong>Free edge</strong> (special design needed)<br><br>
      For a typical floor plan, most INTERIOR panels = Case 1. CORNER panels = Case 4. EDGE panels = Case 2 or 3. Only the rare panel with no continuity = Case 9.
    </div>
    <div style="background:var(--bg1);border:1px solid var(--bg3);border-radius:8px;padding:12px;margin:8px 0">
      <div style="font-size:11px;font-weight:700;color:var(--cyan);margin-bottom:8px">TYPICAL FLOOR PLAN  -  WHICH CASE APPLIES?</div>
      ${(() => {
        const nx = S.spansX.length, ny = S.spansY.length;
        let rows = '';
        for (let j = 0; j < ny; j++) {
          let row = '';
          for (let i = 0; i < nx; i++) {
            const isCorner = (i===0||i===nx-1) && (j===0||j===ny-1);
            const isEdge = !isCorner && (i===0||i===nx-1||j===0||j===ny-1);
            const caseN = isCorner ? 4 : isEdge ? 2 : 1;
            const clr = isCorner ? 'var(--orange)' : isEdge ? 'var(--blue)' : 'var(--green)';
            row += `<div style="flex:1;border:1px solid var(--bg3);padding:6px;text-align:center;font-size:10px;color:${clr}">Case ${caseN}<br><span style="font-size:9px;color:var(--txt3)">${isCorner?'Corner':isEdge?'Edge':'Interior'}</span></div>`;
          }
          rows += `<div style="display:flex;gap:4px;margin-bottom:4px">${row}</div>`;
        }
        return rows;
      })()}
      <div style="display:flex;gap:14px;margin-top:8px;font-size:10px">
        <span style="color:var(--orange)">- Orange = Case 4 (corner)</span>
        <span style="color:var(--blue)">- Blue = Case 2/3 (edge)</span>
        <span style="color:var(--green)">- Green = Case 1 (interior)</span>
      </div>
    </div>
  `)}

  ${sb('SE-3','Design for Most Critical Case in This Building',`
    ${(() => {
      const c = calcCase(S.spansX.length > 1 && S.spansY.length > 1 ? 1 : 4);
      if (!c) return '';
      return `
        <div class="cp">Using <strong>Case ${c.caseNum}</strong> (${c.name}) as the primary design case for this ${S.spansX.length>1&&S.spansY.length>1?'interior':'corner/edge'} panel.</div>
        ${fm('alphax = '+r2(c.ax)+' | Mx+ = '+r2(c.ax)+' x '+r2(wu)+' x '+r2(lx)+'^2 (midspan sagging)',r2(c.Mx_pos)+' kN.m/m','IS 456 Table 26')}
        ${fm('alphay = '+r2(c.ay)+' | My+ = '+r2(c.ay)+' x '+r2(wu)+' x '+r2(lx)+'^2 (midspan sagging)',r2(c.My_pos)+' kN.m/m','IS 456 Table 26')}
        ${c.ax_n>0?fm('Mx- (hogging at continuous edge) = '+r2(c.ax_n)+' x '+r2(wu)+' x '+r2(lx)+'^2',r2(c.Mx_neg)+' kN.m/m','IS 456 Table 26'):''}
        ${vd(c.safe,'Mulim = '+r2(c.Mulim)+' kN.m/m | Max moment = '+r2(Math.max(c.Mx_pos,c.My_pos))+' kN.m/m  -  '+(c.safe?'SAFE':'REVISE depth'))}
        <div class="cp"><strong>Required steel: </strong>Bottom X: T10@${c.spx}mm | Bottom Y: T8@${c.spy}mm${c.ax_n>0?' | Top at continuous edges: T8@'+clamp(Math.floor(1000*Math.PI*16/Math.max(c.Ast_mx*0.5,180)),75,300)+'mm':''}</div>
      `;
    })()}
  `)}
</div>`;
}


// =======================================================
// FEATURE 5: RETAINING WALL DESIGN
// Cantilever RC retaining wall  -  IS 456 + IS 1904
// =======================================================


// == 10e_retaining_wall.js ==

// ================================================================
// MODULE: 10e_retaining_wall
// Retaining Wall Design
// ================================================================

function calcRetainingWall(H, gamma_soil, phi_deg, gamma_conc, SBC, surcharge, fck, fy, cover) {
  const phi = phi_deg * Math.PI / 180;
  const Ka = Math.pow(Math.tan(Math.PI/4 - phi/2), 2); // Rankine active pressure coeff
  const Kp = 1 / Ka; // Passive

  // Active earth pressure
  const Pa_surcharge = Ka * surcharge * H;           // kN/m (uniform)
  const Pa_soil = 0.5 * Ka * gamma_soil * H * H;    // kN/m (triangular)
  const Pa_total = Pa_surcharge + Pa_soil;           // kN/m total

  // Point of action from base
  const ya_surcharge = H / 2;
  const ya_soil = H / 3;
  const ya_total = (Pa_surcharge * ya_surcharge + Pa_soil * ya_soil) / Pa_total;

  // Overturning moment about toe
  const M_ot = Pa_surcharge * ya_surcharge + Pa_soil * ya_soil; // kN.m/m

  // Preliminary dimensions
  const t_stem = Math.max(200, Math.ceil(H * 1000 / 12 / 50) * 50); // stem thickness at base (mm)
  const t_stem_top = Math.max(150, t_stem / 2);
  const B = Math.max(0.5 * H, 0.4 + 0.6 * H); // base width (m) = 0.4H to 0.7H
  const Dtoe = Math.max(0.3, H / 10); // toe projection (m)
  const Dheel = B - Dtoe - t_stem / 1000; // heel projection (m)
  const t_base = Math.max(300, Math.ceil(H * 1000 / 10 / 50) * 50); // base slab thickness (mm)

  // Weights (per unit length)
  const W_stem = gamma_conc * t_stem / 1000 * (H - t_base / 1000); // kN/m
  const W_base = gamma_conc * t_base / 1000 * B; // kN/m
  const W_soil_heel = gamma_soil * Dheel * (H - t_base / 1000); // kN/m
  const W_surcharge = surcharge * Dheel; // kN/m
  const W_total = W_stem + W_base + W_soil_heel + W_surcharge;

  // Centroid of each from toe
  const x_stem = Dtoe + t_stem / 2000; // m
  const x_base = B / 2; // m
  const x_soil = Dtoe + t_stem / 1000 + Dheel / 2; // m
  const x_surcharge = x_soil;

  // Restoring moment about toe
  const M_rest = W_stem * x_stem + W_base * x_base +
    W_soil_heel * x_soil + W_surcharge * x_surcharge;

  // Overturning check
  const FOS_ot = M_rest / M_ot;

  // Sliding check
  const F_sliding = Pa_total;
  const mu = 0.5; // coefficient of friction (concrete on soil)
  const F_resist = mu * W_total;
  const FOS_sl = F_resist / F_sliding;

  // Bearing pressure
  const e = B / 2 - (M_rest - M_ot) / W_total; // eccentricity
  const q_max = W_total / B * (1 + 6 * e / B); // kN/m^2
  const q_min = W_total / B * (1 - 6 * e / B);
  const safe_bearing = q_max <= SBC;

  // Stem design (cantilever from base)
  const M_stem = Pa_surcharge * ya_surcharge + Pa_soil * ya_soil; // kN.m/m (at base of stem)
  const d_stem = t_stem - cover - 8; // mm
  const Mf_stem = fy>=500?0.133:fy>=415?0.138:0.149;
  const Mulim_stem = Mf_stem * fck * 1000 * d_stem * d_stem / 1e6;

  const astCalcRW=(Mu,d)=>{
    if (Mu <= 0) return 0.12 * 1000 * (d + cover + 8) / 100;
    const inner = 1 - Mu * 1e6 / (0.36 * fck * 1000 * d * 0.48 * d);
    if (inner <= 0) return 1000;
    return Math.max(Mu * 1e6 / (0.87 * fy * d * inner), 0.12 * 1000 * (d + cover + 8) / 100);
  }

  const Ast_stem = astCalcRW(M_stem, d_stem);
  const sp_stem = clamp(Math.floor(1000 * Math.PI * 100 / Ast_stem), 75, 300); // T20 bars

  // Heel slab design
  const q_heel = q_min; // pressure at heel (conservative)
  const M_heel = W_soil_heel * Dheel / 2 + W_surcharge * Dheel / 2 - q_heel * Dheel * Dheel / 2;
  const d_heel = t_base - cover - 8;
  const Ast_heel = astCalcRW(Math.abs(M_heel), d_heel);
  const sp_heel = clamp(Math.floor(1000 * Math.PI * 100 / Ast_heel), 75, 300);

  // Toe slab design
  const M_toe = q_max * Dtoe * Dtoe / 2 - gamma_conc * t_base / 1000 * Dtoe * Dtoe / 2;
  const d_toe = t_base - cover - 8;
  const Ast_toe = astCalcRW(Math.abs(M_toe), d_toe);
  const sp_toe = clamp(Math.floor(1000 * Math.PI * 100 / Ast_toe), 75, 300);

  return {
    H, gamma_soil, phi_deg, Ka, Kp, surcharge,
    Pa_soil, Pa_surcharge, Pa_total, ya_total, M_ot,
    t_stem, t_stem_top, t_base, B, Dtoe, Dheel,
    W_stem, W_base, W_soil_heel, W_surcharge, W_total,
    M_rest, FOS_ot, FOS_sl, F_sliding, F_resist,
    e, q_max, q_min, safe_bearing,
    M_stem, d_stem, Mulim_stem, Ast_stem, sp_stem,
    M_heel, d_heel, Ast_heel, sp_heel,
    M_toe, d_toe, Ast_toe, sp_toe,
    ok_ot: FOS_ot >= 1.5, ok_sl: FOS_sl >= 1.4, ok_br: safe_bearing
  };
}

function svgRetainingWall(rw) {
  const W = 400, H = 340, pad = 30;
  const scH = (H - 2*pad) / rw.H;   // scale: 1m -> scH px
  const baseX = pad + 60;
  const baseY = H - pad - 20;
  const wallH = rw.H * scH;
  const wallW = rw.t_stem / 1000 * scH * 2;  // stem width scaled
  const baseW = rw.B * scH * 2;              // base width scaled
  const baseH = rw.t_base / 1000 * scH * 2;
  const toeW = rw.Dtoe * scH * 2;

  let g = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  g += `<rect width="${W}" height="${H}" fill="#0a0f1e"/>`;

  // Soil hatch (retained side)
  for (let i = 0; i < 12; i++) {
    const sy = baseY - wallH + i * wallH / 12;
    g += `<line x1="${baseX + wallW}" y1="${sy}" x2="${W - pad}" y2="${sy}" stroke="rgba(180,150,100,0.25)" stroke-width="1"/>`;
    g += `<line x1="${baseX + wallW + i * 15}" y1="${baseY - wallH}" x2="${baseX + wallW}" y2="${baseY - wallH + i * wallH / 12}" stroke="rgba(180,150,100,0.15)" stroke-width="1"/>`;
  }
  g += `<rect x="${baseX + wallW}" y="${baseY - wallH}" width="${W - pad - baseX - wallW}" height="${wallH}" fill="rgba(160,120,60,0.1)"/>`;

  // Ground line
  g += `<line x1="${pad}" y1="${baseY - wallH}" x2="${baseX + wallW}" y2="${baseY - wallH}" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6,3"/>`;
  g += `<line x1="${baseX + wallW}" y1="${baseY - wallH}" x2="${W - pad}" y2="${baseY - wallH}" stroke="#6b5a3e" stroke-width="1.5"/>`;

  // Stem (trapezoidal)
  const stemPath = `M${baseX} ${baseY} L${baseX + wallW} ${baseY} L${baseX + wallW * 0.6} ${baseY - wallH} L${baseX + wallW * 0.4} ${baseY - wallH} Z`;
  g += `<path d="${stemPath}" fill="#374151" stroke="#6b7280" stroke-width="1.5"/>`;

  // Base slab
  g += `<rect x="${baseX - toeW}" y="${baseY}" width="${baseW}" height="${baseH}" fill="#374151" stroke="#6b7280" stroke-width="1.5"/>`;

  // Soil below base
  g += `<rect x="${pad}" y="${baseY + baseH}" width="${W - 2 * pad}" height="20" fill="rgba(180,150,100,0.3)"/>`;
  for (let i = 0; i < 8; i++) {
    g += `<line x1="${pad + i * 20}" y1="${baseY + baseH + 2}" x2="${pad + i * 20 + 12}" y2="${baseY + baseH + 18}" stroke="rgba(180,150,100,0.5)" stroke-width="1"/>`;
  }

  // Reinforcement bars
  // Stem bars (vertical, tension face = soil side)
  for (let i = 0; i < 5; i++) {
    const bx = baseX + wallW - 8 - i * 0;
    g += `<line x1="${baseX + wallW - 8}" y1="${baseY}" x2="${baseX + wallW * 0.65}" y2="${baseY - wallH + 15}" stroke="#fbbf24" stroke-width="2.5"/>`;
  }
  g += `<line x1="${baseX + wallW - 8}" y1="${baseY}" x2="${baseX + wallW * 0.65}" y2="${baseY - wallH + 15}" stroke="#fbbf24" stroke-width="2.5"/>`;
  // Heel bars (bottom of heel slab)
  g += `<line x1="${baseX + wallW}" y1="${baseY + baseH - 8}" x2="${baseX - toeW + baseW}" y2="${baseY + baseH - 8}" stroke="#fbbf24" stroke-width="2.5"/>`;
  // Toe bars (top of toe slab)
  g += `<line x1="${baseX - toeW + 5}" y1="${baseY + 8}" x2="${baseX + 5}" y2="${baseY + 8}" stroke="#a78bfa" stroke-width="2.5"/>`;

  // Earth pressure arrow
  const Pa_y = baseY - rw.ya_total * scH;
  g += `<line x1="${W - pad - 20}" y1="${Pa_y}" x2="${baseX + wallW + 5}" y2="${Pa_y}" stroke="#f87171" stroke-width="2" marker-end="url(#rarr)"/>`;
  g += `<text x="${W - pad - 18}" y="${Pa_y - 4}" fill="#f87171" font-size="9" text-anchor="end" font-family="JetBrains Mono">Pa=${r2(rw.Pa_total)}kN/m</text>`;
  g += `<defs><marker id="rarr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><polygon points="0,0 6,3 0,6" fill="#f87171"/></marker></defs>`;

  // Dimensions
  g += `<line x1="${baseX - toeW - 8}" y1="${baseY}" x2="${baseX - toeW - 8}" y2="${baseY - wallH}" stroke="#64748b" stroke-width="1"/>`;
  g += `<text x="${baseX - toeW - 18}" y="${baseY - wallH / 2 + 4}" fill="#64748b" font-size="9" text-anchor="end" font-family="JetBrains Mono">H=${rw.H}m</text>`;
  g += `<line x1="${baseX - toeW}" y1="${baseY + baseH + 12}" x2="${baseX - toeW + baseW}" y2="${baseY + baseH + 12}" stroke="#64748b" stroke-width="1"/>`;
  g += `<text x="${baseX - toeW + baseW / 2}" y="${baseY + baseH + 22}" fill="#64748b" font-size="9" text-anchor="middle" font-family="JetBrains Mono">B=${r2(rw.B)}m</text>`;

  // Labels
  g += `<text x="${baseX + wallW / 2}" y="${baseY - wallH / 2}" fill="#38bdf8" font-size="8" text-anchor="middle" font-family="JetBrains Mono">STEM</text>`;
  g += `<text x="${baseX - toeW + baseW / 2}" y="${baseY + baseH / 2 + 4}" fill="#38bdf8" font-size="8" text-anchor="middle" font-family="JetBrains Mono">BASE SLAB</text>`;

  // Bar legend
  g += `<line x1="${pad}" y1="15" x2="${pad + 20}" y2="15" stroke="#fbbf24" stroke-width="2.5"/>`;
  g += `<text x="${pad + 24}" y="19" fill="#fbbf24" font-size="8" font-family="JetBrains Mono">Main tension bars</text>`;
  g += `<line x1="${pad}" y1="28" x2="${pad + 20}" y2="28" stroke="#a78bfa" stroke-width="2.5"/>`;
  g += `<text x="${pad + 24}" y="32" fill="#a78bfa" font-size="8" font-family="JetBrains Mono">Toe top bars</text>`;

  g += `<text x="${W/2}" y="${H-2}" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle" font-family="JetBrains Mono">CANTILEVER RETAINING WALL  -  Cross Section</text>`;
  g += '</svg>';
  return `<div class="dg">${g}<div class="dg-cap">Fig: Cantilever RC retaining wall. Yellow bars = main vertical steel (tension on soil side). Purple = toe reinforcement. Red arrow = resultant active earth pressure Pa.</div></div>`;
}

// Retaining wall section  -  uses a simple input panel
let RW = { H: 3.0, gamma_soil: 18, phi_deg: 30, surcharge: 10 };

function secRetainingWall() {
  const rw = calcRetainingWall(RW.H, RW.gamma_soil, RW.phi_deg, 25, S.soilBearing, RW.surcharge, S.fck, S.fy, S.coverBeam);
  const allOK = rw.ok_ot && rw.ok_sl && rw.ok_br;

  return `
<div class="card" style="border-color:rgba(52,211,153,.3)">
  <div class="ct gr">Retaining Wall Design  -  Cantilever RC Wall (IS 456 + IS 1904)</div>
  <div class="cd">A retaining wall holds back soil on one side. The design must ensure it doesn't overturn (tip over), slide (move horizontally), or sink (overstress the soil).</div>

  <div class="row" style="margin-bottom:14px">
    <div class="col2">
      ${fld('rw_H','Wall Height H','Height of retained earth above base','m','num',RW.H)}
      ${fld('rw_gamma','Soil Unit Weight','Typically 18-20 kN/m^3 for soil','kN/m^3','num',RW.gamma_soil)}
    </div>
    <div class="col2">
      ${fld('rw_phi','Angle of Friction phi','Typical: 28-35 deg for cohesionless soil','degrees','num',RW.phi_deg)}
      ${fld('rw_q','Surcharge on backfill','Traffic, construction loads on top of retained soil','kN/m^2','num',RW.surcharge)}
    </div>
  </div>
  <button class="btn gr" onclick="RW.H=+document.getElementById('rw_H')?.value||3;RW.gamma_soil=+document.getElementById('rw_gamma')?.value||18;RW.phi_deg=+document.getElementById('rw_phi')?.value||30;RW.surcharge=+document.getElementById('rw_q')?.value||10;showSec('retwall')" style="margin-bottom:12px">Redesign Retaining Wall</button>

  <div class="cp gr">
    <strong>Rankine's active earth pressure:</strong> Ka = tan^2(45 deg - phi/2) = tan^2(45 deg - ${rw.phi_deg/2} deg) = <strong>${r2(rw.Ka)}</strong><br>
    Active pressure acts horizontally from soil onto the wall. The lower Ka is, the less force the wall must resist.
  </div>

  ${sb('RW-1','Earth Pressure Calculation',`
    ${svgRetainingWall(rw)}
    ${fm('Ka = tan^2(45 - phi/2) = tan^2(45 - '+rw.phi_deg+'/2)',r2(rw.Ka),'Rankine active pressure')}
    ${fm('Pa_soil = 0.5 x Ka x gamma x H^2 = 0.5 x '+r2(rw.Ka)+' x '+rw.gamma_soil+' x '+rw.H+'^2',r2(rw.Pa_soil)+' kN/m','Triangular distribution')}
    ${fm('Pa_surcharge = Ka x q x H = '+r2(rw.Ka)+' x '+rw.surcharge+' x '+rw.H,r2(rw.Pa_surcharge)+' kN/m','Uniform over height')}
    ${fm('Total Pa = Pa_soil + Pa_surcharge',r2(rw.Pa_total)+' kN/m  acting at '+r2(rw.ya_total)+'m above base','IS 3967')}
  `,'gr')}

  ${sb('RW-2','Overturning Check  -  FOS >= 1.5 (IS 1904)',`
    <div class="cp gr">All forces trying to ROTATE the wall about the toe (front edge). Restoring moments (gravity) must be 1.5x the overturning moment (earth pressure).</div>
    ${fm('Overturning moment M_ot = Pa x ya = '+r2(rw.Pa_total)+' x '+r2(rw.ya_total),r2(rw.M_ot)+' kN.m/m  (about toe)','IS 1904')}
    ${fm('Weight of stem = gamma_c x t_stem x H = 25 x '+r2(rw.t_stem/1000)+' x '+r2(rw.H),r2(rw.W_stem)+' kN/m','')}
    ${fm('Weight of base = 25 x t_base x B = 25 x '+r2(rw.t_base/1000)+' x '+r2(rw.B),r2(rw.W_base)+' kN/m','')}
    ${fm('Weight of soil on heel = '+rw.gamma_soil+' x '+r2(rw.Dheel)+' x '+r2(rw.H),r2(rw.W_soil_heel)+' kN/m','')}
    ${fm('Restoring moment M_rest (all weights x arm from toe)',r2(rw.M_rest)+' kN.m/m','')}
    ${fm('FOS_overturning = M_rest / M_ot = '+r2(rw.M_rest)+' / '+r2(rw.M_ot),r2(rw.FOS_ot),'Limit: 1.5')}
    ${vd(rw.ok_ot,'FOS_OT = '+r2(rw.FOS_ot)+' '+(rw.ok_ot?'>= 1.5  SAFE':'< 1.5  UNSAFE  -  wall will overturn'),
      rw.ok_ot?null:'Earth pressure is overcoming the gravity restoring forces. The wall will rotate about the toe.',
      rw.ok_ot?null:'Increase base width B to '+r2(rw.B*1.3)+'m OR increase soil weight on heel (thicker fill) OR add a heel slab key.')}
  `,'gr')}

  ${sb('RW-3','Sliding Check  -  FOS >= 1.4 (IS 1904)',`
    ${fm('Horizontal force (sliding) = Pa_total',r2(rw.Pa_total)+' kN/m','')}
    ${fm('Friction force = mu x W_total = 0.5 x '+r2(rw.W_total),r2(rw.F_resist)+' kN/m','mu=0.5 for concrete on soil')}
    ${fm('FOS_sliding = F_resist / F_sliding = '+r2(rw.F_resist)+' / '+r2(rw.Pa_total),r2(rw.FOS_sl),'Limit: 1.4')}
    ${vd(rw.ok_sl,'FOS_SL = '+r2(rw.FOS_sl)+' '+(rw.ok_sl?'>= 1.4  SAFE':'< 1.4  UNSAFE  -  wall will slide'),
      rw.ok_sl?null:'Earth pressure pushes the wall horizontally. Friction is insufficient.',
      rw.ok_sl?null:'Provide a concrete shear key below the base slab (most effective). Or increase base width.')}
  `,'gr')}

  ${sb('RW-4','Bearing Pressure Check',`
    ${fm('Eccentricity e = B/2 - (M_rest - M_ot)/W_total',r2(rw.e)+'m  (B/6 = '+r2(rw.B/6)+'m  -  e must be < B/6 for no tension)','IS 1904')}
    ${fm('q_max = W/B x (1 + 6e/B) = '+r2(rw.W_total)+'/'+r2(rw.B)+' x (1 + 6x'+r2(rw.e)+'/'+r2(rw.B)+')',r2(rw.q_max)+' kN/m^2  (toe)','IS 1904')}
    ${fm('q_min = W/B x (1 - 6e/B)',r2(rw.q_min)+' kN/m^2  (heel)'+(rw.q_min<0?' -> TENSION  -  soil cannot take tension, use B/6 rule':' OK'),'')}
    ${vd(rw.ok_br,'q_max = '+r2(rw.q_max)+' kN/m^2 '+(rw.ok_br?'<= SBC ('+S.soilBearing+' kN/m^2)  SAFE':'> SBC ('+S.soilBearing+' kN/m^2)  OVERSTRESSED  -  soil fails'),
      rw.ok_br?null:'Soil bearing capacity exceeded  -  foundation will sink differentially.',
      rw.ok_br?null:'Increase base width to '+r2(rw.B*Math.sqrt(rw.q_max/S.soilBearing))+'m to spread the load.')}
  `,'gr')}

  ${sb('RW-5','Stem & Slab Reinforcement',`
    <table>
      <tr><th>Element</th><th>Design Moment</th><th>Ast req</th><th>Reinforcement</th><th>Status</th></tr>
      <tr><td>Stem (vert. bars, soil face)</td><td>${r2(rw.M_stem)} kN.m/m</td><td>${r0(rw.Ast_stem)} mm^2/m</td><td class="val">T20@${rw.sp_stem}mm c/c (vertical)</td><td class="${rw.M_stem<=rw.Mulim_stem?'ok':'ng'}">${rw.M_stem<=rw.Mulim_stem?'OK':'REVISE'}</td></tr>
      <tr><td>Heel slab (bottom)</td><td>${r2(Math.abs(rw.M_heel))} kN.m/m</td><td>${r0(rw.Ast_heel)} mm^2/m</td><td class="val">T20@${rw.sp_heel}mm c/c</td><td class="ok">OK</td></tr>
      <tr><td>Toe slab (top)</td><td>${r2(Math.abs(rw.M_toe))} kN.m/m</td><td>${r0(rw.Ast_toe)} mm^2/m</td><td class="val">T20@${rw.sp_toe}mm c/c</td><td class="ok">OK</td></tr>
      <tr><td>Horizontal (temperature)</td><td> - </td><td>${r0(0.12*rw.t_stem*1000/100)} mm^2/m</td><td>T10@300mm c/c (both faces)</td><td class="ok">Min steel</td></tr>
    </table>
    <div class="cp gr"><strong>Stem bar curtailment:</strong> Full bars for bottom 1/2 of height. Alternate bars curtailed at 1/2H. Continue distribution bars T10@300mm both faces full height.</div>
  `,'gr')}

  <div class="res-summary gr">
    <div class="res-t gr">${allOK?'OK':'!!'} Retaining Wall Summary  -  H=${rw.H}m, B=${r2(rw.B)}m</div>
    ${krow('Stem thickness at base',rw.t_stem+'mm')}
    ${krow('Base slab thickness',rw.t_base+'mm')}
    ${krow('FOS Overturning',r2(rw.FOS_ot)+(rw.ok_ot?' OK':' FAIL'))}
    ${krow('FOS Sliding',r2(rw.FOS_sl)+(rw.ok_sl?' OK':' FAIL'))}
    ${krow('Max bearing pressure',r2(rw.q_max)+' kN/m^2 vs SBC '+S.soilBearing+' kN/m^2'+(rw.ok_br?' OK':' FAIL'))}
  </div>
</div>`;
}


// =======================================================
// FEATURE 6: FIRE RESISTANCE  -  IS 456 Table 16A
// Cover requirements for different fire ratings
// =======================================================
const IS456_T16A = {
  // [member][FRR hours] = {cover_mm, min_dimension_mm, notes}
  beam: {
    0.5: { cover: 20, minB: 80,  note: 'Simply supported or continuous' },
    1.0: { cover: 25, minB: 120, note: '1 hour FRR  -  typical residential' },
    1.5: { cover: 35, minB: 150, note: '1.5 hour  -  commercial buildings' },
    2.0: { cover: 45, minB: 200, note: '2 hour  -  public buildings, hospitals' },
    3.0: { cover: 60, minB: 240, note: '3 hour  -  special buildings' },
    4.0: { cover: 70, minB: 280, note: '4 hour  -  critical infrastructure' },
  },
  column: {
    0.5: { cover: 20, minB: 150, note: '' },
    1.0: { cover: 25, minB: 200, note: '' },
    1.5: { cover: 35, minB: 250, note: '' },
    2.0: { cover: 35, minB: 300, note: '' },
    3.0: { cover: 35, minB: 400, note: '' },
    4.0: { cover: 35, minB: 450, note: '' },
  },
  slab: {
    // Simply supported one-way / two-way
    0.5: { cover: 15, minD: 75,  note: '' },
    1.0: { cover: 20, minD: 95,  note: '' },
    1.5: { cover: 25, minD: 110, note: '' },
    2.0: { cover: 35, minD: 125, note: '' },
    3.0: { cover: 45, minD: 150, note: '' },
    4.0: { cover: 55, minD: 170, note: '' },
  },
  wall: {
    0.5: { cover: 15, minB: 75, note: '' },
    1.0: { cover: 15, minB: 100, note: '' },
    1.5: { cover: 20, minB: 110, note: '' },
    2.0: { cover: 25, minB: 120, note: '' },
    3.0: { cover: 25, minB: 150, note: '' },
    4.0: { cover: 35, minB: 175, note: '' },
  }
};

// NBC 2016 Table 1  -  Building occupancy groups and required FRR
const FRR_BY_OCCUPANCY = {
  'A1 (Residential <= G+2)': 1.0,
  'A2 (Residential G+3 to G+6)': 1.0,
  'A3 (Residential > G+6)': 2.0,
  'B (Educational)': 2.0,
  'C (Institutional / Hospital)': 3.0,
  'D (Assembly / Theatre)': 2.0,
  'E (Business / Office)': 1.5,
  'F (Mercantile / Shop)': 2.0,
  'G (Industrial)': 2.0,
  'H (Storage)': 3.0,
};


// == 10f_fire_resistance.js ==

// ================================================================
// MODULE: 10f_fire_resistance
// Fire Resistance Check
// ================================================================

function secFireResistance() {
  if (!RES) return '<div class="card">Run analysis first.</div>';
  const { beams, cols, slab } = RES;

  // Determine FRR from building type
  const numFloors = S.numFloors;
  const occupancy = numFloors <= 3 ? 'A1 (Residential <= G+2)' :
    numFloors <= 7 ? 'A2 (Residential G+3 to G+6)' : 'A3 (Residential > G+6)';
  const frr = FRR_BY_OCCUPANCY[occupancy] || 1.0;

  // Check each member
  const frBeam = IS456_T16A.beam[frr];
  const frCol  = IS456_T16A.column[frr];
  const frSlab = IS456_T16A.slab[frr];

  const b0 = beams[0] || { b: 230, D: 350, d: 292 };
  const c0 = cols.find(c => c.floor === 1) || { size: 300 };

  const checks = [
    {
      member: 'Beams', frr_req: frr,
      param: 'Cover', req: frBeam.cover, prov: S.coverBeam,
      ok: S.coverBeam >= frBeam.cover,
      why: `IS 456 Table 16A: ${frr}hr FRR requires min cover ${frBeam.cover}mm for beams`,
    },
    {
      member: 'Beams', frr_req: frr,
      param: 'Min width b', req: frBeam.minB, prov: b0.b,
      ok: b0.b >= frBeam.minB,
      why: `${frr}hr FRR requires beam width >= ${frBeam.minB}mm`,
    },
    {
      member: 'Columns', frr_req: frr,
      param: 'Cover', req: frCol.cover, prov: S.coverCol,
      ok: S.coverCol >= frCol.cover,
      why: `${frr}hr FRR requires min cover ${frCol.cover}mm for columns`,
    },
    {
      member: 'Columns', frr_req: frr,
      param: 'Min size', req: frCol.minB, prov: c0.size,
      ok: c0.size >= frCol.minB,
      why: `${frr}hr FRR requires column size >= ${frCol.minB}mm`,
    },
    {
      member: 'Slabs', frr_req: frr,
      param: 'Cover', req: frSlab.cover, prov: S.coverSlab,
      ok: S.coverSlab >= frSlab.cover,
      why: `${frr}hr FRR requires min cover ${frSlab.cover}mm for slabs`,
    },
    {
      member: 'Slabs', frr_req: frr,
      param: 'Min thickness', req: frSlab.minD, prov: slab.slabD,
      ok: slab.slabD >= frSlab.minD,
      why: `${frr}hr FRR requires slab thickness >= ${frSlab.minD}mm`,
    },
  ];

  const allOK = checks.every(c => c.ok);

  return `
<div class="card" style="border-color:rgba(248,113,113,.3)">
  <div class="ct" style="color:var(--red)">🔥 Fire Resistance  -  IS 456 Table 16A + NBC 2016</div>
  <div class="cd">Fire resistance is the ability of a structural member to continue performing its function (carrying loads without collapse) for a specified duration during a fire. IS 456 Table 16A specifies minimum cover and dimensions for each FRR (Fire Resistance Rating) in hours.</div>

  <div class="cp re">
    <strong>Why fire resistance is a structural requirement, not just safety:</strong><br>
    During a fire, steel reinforcement heats up rapidly. When steel temperature exceeds 300-400 degC, its yield strength drops to 50% of room temperature value. If the cover is too thin, the rebar heats up faster -> the beam/column loses strength -> collapse under its own load while the fire is still burning.<br><br>
    <strong>The cover IS the fire protection.</strong> Thicker cover = more concrete between fire and rebar = longer time before rebar gets hot = more time to evacuate.
  </div>

  ${sb('FR-1','Required Fire Resistance Rating (FRR)',`
    ${fm('Building occupancy','Residential, '+S.numFloors+' floors = '+occupancy,'NBC 2016 Table 1')}
    ${fm('Required FRR for this building',frr+' hour(s)','NBC 2016 Table 1')}
    <div class="cp re">
      <strong>What FRR means practically:</strong><br>
      ${frr} hour = The structure must remain standing for ${frr}x60 = ${frr*60} minutes after the fire starts. This gives time for: (1) Occupants to evacuate, (2) Fire brigade to arrive and prevent spread, (3) Structural collapse NOT to occur while people are still inside.
    </div>
  `,'re')}

  ${sb('FR-2','IS 456 Table 16A  -  Member-by-Member Check',`
    <table>
      <tr><th>Member</th><th>Parameter</th><th>Required (${frr}hr)</th><th>Provided</th><th>Status</th><th>IS 456 Reference</th></tr>
      ${checks.map(c => `<tr>
        <td>${c.member}</td>
        <td>${c.param}</td>
        <td class="val">${c.req} mm</td>
        <td class="${c.ok?'ok':'ng'}">${c.prov} mm</td>
        <td class="${c.ok?'ok':'ng'}">${c.ok?'OK OK':'FAIL FAIL'}</td>
        <td style="font-size:10px">${c.why}</td>
      </tr>`).join('')}
    </table>
    ${vd(allOK,
      allOK?'All members satisfy '+frr+'-hour fire resistance requirements':'One or more members FAIL fire resistance check',
      allOK?null:'Insufficient cover or section size  -  reinforcement will overheat during fire, causing structural collapse.',
      allOK?null:'Increase cover to minimum required. Note: increasing cover reduces effective depth d  -  may need to increase overall member size accordingly.'
    )}
  `,'re')}

  ${sb('FR-3','Cover Requirements for Different FRR  -  Full Table',`
    <table>
      <tr><th>FRR</th><th>Beam Cover</th><th>Beam Min b</th><th>Column Cover</th><th>Column Min D</th><th>Slab Cover</th><th>Slab Min D</th><th>Occupancy</th></tr>
      ${Object.entries(IS456_T16A.beam).map(([hrs, b]) => {
        const c = IS456_T16A.column[hrs], s = IS456_T16A.slab[hrs];
        const isCurrent = parseFloat(hrs) === frr;
        return `<tr style="${isCurrent?'background:rgba(56,189,248,0.08)':''}">
          <td class="${isCurrent?'val':''}">${hrs} hr${hrs>1?'s':''}</td>
          <td>${b.cover} mm</td><td>${b.minB} mm</td>
          <td>${c.cover} mm</td><td>${c.minB} mm</td>
          <td>${s.cover} mm</td><td>${s.minD} mm</td>
          <td style="font-size:10px">${Object.entries(FRR_BY_OCCUPANCY).filter(([,v])=>v==parseFloat(hrs)).map(([k])=>k.split(' ')[0]).join(', ')}</td>
        </tr>`;
      }).join('')}
    </table>
    <div class="cp re" style="margin-top:10px">
      <strong>Highlighted row = required for this building (${frr} hour).</strong><br>
      Note that HIGHER axial load on columns reduces effective FRR. For columns with Pu/fckxbxD > 0.4, increase cover by 10mm.
    </div>
  `,'re')}

  ${sb('FR-4','Practical Fire Protection Measures on Site',`
    <div class="cp re">
      <strong>1. Nominal cover vs fire cover:</strong> The cover in IS 456 Table 16 (for durability) may be less than Table 16A (for fire). ALWAYS use the LARGER of the two. Example: M25 moderate exposure = 40mm cover (Table 16). 2-hr FRR = 45mm cover (Table 16A). Use 45mm.
    </div>
    <div class="cp re">
      <strong>2. If cover is increased, recalculate:</strong> Increasing cover from 40mm to 45mm reduces d by 5mm -> reduces Ast slightly (negligible for beams). But for slabs, 5mm more cover on a 150mm slab is significant  -  check l/d ratio still satisfied.
    </div>
    <div class="cp re">
      <strong>3. For basement / parking structures:</strong> Use 2-hr FRR minimum. Car parks require 2 hours. Use siliceous aggregates (granite) not calcareous (limestone)  -  granite spalls at ~573 degC, reducing insulation. Lightweight concrete or vermiculite plaster improves FRR.
    </div>
    <div class="cp re">
      <strong>4. Intumescent paint:</strong> For steel elements (if any), intumescent paint expands in fire to provide thermal insulation. NOT needed for RC members  -  concrete itself provides the fire protection.
    </div>
    <table style="margin-top:8px">
      <tr><th>Cover provided</th><th>This design (${S.coverBeam}mm beams)</th><th>Required ${frr}hr</th><th>Margin</th></tr>
      <tr><td>Beam cover</td><td class="${S.coverBeam>=frBeam.cover?'ok':'ng'}">${S.coverBeam}mm</td><td>${frBeam.cover}mm</td><td class="${S.coverBeam>=frBeam.cover?'ok':'ng'}">${S.coverBeam-frBeam.cover}mm ${S.coverBeam>=frBeam.cover?'spare':'SHORT'}</td></tr>
      <tr><td>Column cover</td><td class="${S.coverCol>=frCol.cover?'ok':'ng'}">${S.coverCol}mm</td><td>${frCol.cover}mm</td><td class="${S.coverCol>=frCol.cover?'ok':'ng'}">${S.coverCol-frCol.cover}mm ${S.coverCol>=frCol.cover?'spare':'SHORT'}</td></tr>
      <tr><td>Slab cover</td><td class="${S.coverSlab>=frSlab.cover?'ok':'ng'}">${S.coverSlab}mm</td><td>${frSlab.cover}mm</td><td class="${S.coverSlab>=frSlab.cover?'ok':'ng'}">${S.coverSlab-frSlab.cover}mm ${S.coverSlab>=frSlab.cover?'spare':'SHORT'}</td></tr>
    </table>
  `,'re')}
</div>`;
}


// ===============================================================
// GRID STRUCTURAL MODEL
// Replaces the simple spansX/spansY with a full node-beam-bay model
// ===============================================================

// Grid state  -  initialised from S.spansX / S.spansY


// == 11_guidance.js ==

// ================================================================
// MODULE: 11_guidance
// Teaching guidance engine
// ================================================================


const PRACTICAL = {
  beam: {
    maxSpan: 7,        // m — beyond this, need intermediate column or PT
    minDepthRatio: 12, // D >= L/12
    maxDepthRatio: 8,  // D <= L/8 (economy limit)
    minWidth: 200,     // mm
    minPt: 0.3,        // % steel — below this, section oversized
    maxPt: 3.0,        // % steel — above this, congestion risk
    maxDefl: 25,       // mm — beyond this, cracking of finishes visible
  },
  col: {
    minSize: 230,      // mm — below this, bar placement impossible
    minPt: 0.8,        // % — IS 456 minimum
    maxPt: 4.0,        // % — IS 456 maximum
    maxSlender: 12,    // leff/D — beyond this = long column (magnified moments)
    minAxialRatio: 0.05, // Pu/fck*Ag — too low means column oversized
  },
  slab: {
    minThk: 125,       // mm — IS 456 minimum
    maxSpan: 4.5,      // m — beyond this, two-way slab becomes inefficient
    minCover: 15,      // mm
  },
  footing: {
    minD: 300,         // mm — minimum footing depth
    minCover: 75,      // mm — mandatory IS 456
  }
};




function beamTeachingWarnings(b) {
  const warns = [];
  const L = b.L, D = b.D, bw = b.b, pt = b.pt||0;
  const dflRatio = b.dfl / (b.dall||1);

  // Span check
  if(L > PRACTICAL.beam.maxSpan)
    warns.push({level:'error', msg:'Span '+L+'m exceeds practical limit of '+PRACTICAL.beam.maxSpan+'m. At this span, deflection and cost become uneconomical. SOLUTION: Add an intermediate column to create two ~'+r2(L/2)+'m spans.'});

  // Depth check
  const dMin = Math.ceil(L*1000/PRACTICAL.beam.minDepthRatio);
  const dMax = Math.ceil(L*1000/PRACTICAL.beam.maxDepthRatio);
  if(D < dMin)
    warns.push({level:'error', msg:'Depth '+D+'mm is below the IS 456 minimum of L/12 = '+dMin+'mm for a '+L+'m span. This beam WILL fail deflection check. Use D = '+Math.ceil(dMin/25)*25+'mm minimum.'});
  else if(D > dMax*1.5)
    warns.push({level:'warn', msg:'Depth '+D+'mm is very large for a '+L+'m span (economical range: '+dMin+'–'+dMax+'mm). Consider if span can be reduced instead.'});

  // Width check
  if(bw < PRACTICAL.beam.minWidth)
    warns.push({level:'warn', msg:'Width '+bw+'mm is narrow. Minimum practical width is 200mm for reinforcement placement and concrete compaction on site.'});

  // Steel % check
  if(pt < PRACTICAL.beam.minPt)
    warns.push({level:'warn', msg:'Steel ratio '+r2(pt)+'% is very low. Minimum useful ratio is ~0.3%. This suggests section may be oversized — consider reducing depth.'});
  if(pt > PRACTICAL.beam.maxPt)
    warns.push({level:'error', msg:'Steel ratio '+r2(pt)+'% exceeds 3%. Bars will be congested — concrete cannot be properly compacted. SOLUTION: Increase width or depth, not steel.'});

  // Deflection reality check
  if(b.dfl > 100)
    warns.push({level:'error', msg:'Calculated deflection '+r2(b.dfl)+'mm is physically unrealistic for a '+L+'m beam (limit = '+r2(b.dall)+'mm). This is '+r0(dflRatio)+'x the limit — a serious input error. Check: (1) span too long? (2) section too small? (3) is wall load realistic?'});
  else if(b.dfl > PRACTICAL.beam.maxDefl)
    warns.push({level:'warn', msg:'Deflection '+r2(b.dfl)+'mm exceeds '+PRACTICAL.beam.maxDefl+'mm. At this level, finishes (tiles, plaster) will crack visibly even if within L/250 limit.'});

  return warns;
}

// ── ALL FIX OPTIONS when member fails ─────────────────────────

function beamFixOptions(b) {
  const fixes = {defl:[], shear:[], moment:[]};
  if(!b.deflOK) {
    const dNeed = Math.ceil(b.D * Math.pow(b.dfl/b.dall, 1/3) / 25 + 1) * 25;
    fixes.defl = [
      'Option 1 (BEST): Increase depth to D = '+dNeed+'mm. Deflection reduces as D^3 — small increase in D gives large deflection reduction.',
      'Option 2: Add intermediate column to halve the span (L/2 span = deflection reduces 16x).',
      'Option 3: Make end joints continuous (if currently simply supported) — reduces midspan moment by 30–40%.',
      'Option 4: Use M'+(S.fck+5)+' concrete — increases Ec by ~10%, modest deflection improvement.',
      'Option 5: Add compression steel at top — reduces long-term creep deflection by up to 50% over time.',
      'Option 6: Use a pre-cambered beam — beam is cast with upward bow to counteract expected deflection.',
    ];
  }
  if(!b.shearSafe) {
    const bNeed = Math.ceil(b.RA*1000/(b.tcmax*(b.d||200))/25+1)*25;
    fixes.shear = [
      'Option 1: Increase beam width to b = '+bNeed+'mm (shear stress tv = V/(b*d) reduces proportionally).',
      'Option 2: Increase depth D — increases d, reducing shear stress.',
      'Option 3: Use 4-legged stirrups T8 instead of 2-legged (doubles shear capacity from stirrups).',
      'Option 4: Use T10 stirrups instead of T8 (increases stirrup area by 56%).',
      'Option 5: Use M'+(S.fck+5)+' concrete (tc_max is proportional to sqrt(fck)).',
      'Option 6: Add shear studs or bent-up bars near supports (old practice, rarely used now).',
    ];
  }
  return fixes;
}

// ── COLUMN GUIDANCE ─────────────────────────────────────────────

function colTeachingWarnings(c) {
  const warns = [];
  if(c.size < PRACTICAL.col.minSize)
    warns.push({level:'error', msg:'Column size '+c.size+'mm is below practical minimum of 230mm. Bars cannot be properly placed and concrete cannot flow. Minimum for seismic zones: 300mm (IS 13920).'});
  if(c.pt < PRACTICAL.col.minPt)
    warns.push({level:'warn', msg:'Steel '+r2(c.pt)+'% is below IS 456 minimum of 0.8%. MUST provide at least 0.8% Ag = '+r0(0.008*c.Ag)+'mm2.'});
  if(c.pt > PRACTICAL.col.maxPt)
    warns.push({level:'error', msg:'Steel '+r2(c.pt)+'% exceeds IS 456 maximum of 4%. Cannot physically place these bars. Increase column size.'});
  if(!c.short)
    warns.push({level:'warn', msg:'Column is SLENDER (leff/D = '+r2(c.lex)+' > 12). Slender columns fail by buckling, not crushing. Magnified moments must be considered per IS 456 Cl 39.7. Use a larger section or reduce height.'});
  return warns;
}

function colFixOptions(c) {
  if(c.safe) return {};
  return {axial:[
    'Option 1: Increase column size to '+(c.size+50)+'x'+(c.size+50)+'mm (most reliable).',
    'Option 2: Increase steel to '+r2(Math.min(4,c.pt+1))+'% — add bars but check fit (max 4%).',
    'Option 3: Use M'+(S.fck+5)+' concrete (0.4xfck term in capacity increases).',
    'Option 4: Reduce number of floors (reduces cumulative load Pu).',
    'Option 5: Check if load was correctly calculated — is tributary area correct?',
  ]};
}

// ── SLAB GUIDANCE ─────────────────────────────────────────────

function slabTeachingWarnings(sl) {
  const warns = [];
  if(sl.lx > PRACTICAL.slab.maxSpan)
    warns.push({level:'warn', msg:'Shorter span lx = '+r2(sl.lx)+'m is large for a slab. Above 4.5m, consider a one-way ribbed slab or add intermediate beam to reduce span.'});
  if(sl.slabD < PRACTICAL.slab.minThk)
    warns.push({level:'error', msg:'Slab thickness '+sl.slabD+'mm is below IS 456 minimum of 125mm. Must increase.'});
  if(sl.lx*1000/sl.slabd > 26)
    warns.push({level:'error', msg:'l/d = '+r2(sl.lx*1000/sl.slabd)+' exceeds limit of 26. Slab will deflect excessively. Increase thickness to '+Math.ceil((sl.lx*1000/26+S.coverSlab+5)/25)*25+'mm.'});
  return warns;
}

// ── FORMAT WARNINGS INTO HTML ─────────────────────────────────

function fmtWarnings(warns) {
  if(!warns || !warns.length) return '';
  return '<div style="margin:8px 0">' +
    warns.map(w=>'<div style="padding:7px 10px;margin:4px 0;border-radius:5px;font-size:11px;line-height:1.6;'+
      (w.level==='error'
        ? 'background:rgba(248,113,113,0.1);border-left:3px solid #f87171;color:#fca5a5'
        : 'background:rgba(245,158,11,0.08);border-left:3px solid #f59e0b;color:#fcd34d')+'">'
      +(w.level==='error'?'ERROR: ':'NOTE: ')+w.msg+'</div>'
    ).join('') + '</div>';
}

function fmtFixes(fixes, type) {
  const list = fixes[type];
  if(!list || !list.length) return '';
  return '<div style="background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.2);border-radius:6px;padding:10px;margin:8px 0">'
    +'<div style="font-size:11px;font-weight:700;color:#34d399;margin-bottom:6px">ALL FIX OPTIONS:</div>'
    +'<div style="font-size:11px;color:#a7f3d0;line-height:1.8">'
    +list.join('<br>')+'</div></div>';
}

// ── JOINT TYPE SELECTOR ────────────────────────────────────────

function jointTypeGuide(beam) {
  const t = beam.endCond||'';
  const isBoth = t.includes('Both ends continuous');
  const isOne  = t.includes('One end');
  const isSS   = !isBoth && !isOne;
  return sb('JOINT','Beam End Conditions & Joint Type',
    '<div class="cp or">'
    +'<strong>Current condition:</strong> '+( t||'Simply supported')+'<br><br>'
    +'<strong>Which to choose?</strong><br>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:8px 0;font-size:10px">'
    +'<div style="border:1px solid '+(isBoth?'var(--blue)':'var(--bg3)')+';border-radius:5px;padding:7px;background:'+(isBoth?'rgba(56,189,248,0.08)':'transparent')+'">'
    +'<strong style="color:var(--blue)">Both Continuous</strong><br>Beam frames into RC columns both ends.<br>alpha=1/16. Moment -38% vs SS.<br><em>Use when: both supports are columns.</em></div>'
    +'<div style="border:1px solid '+(isOne?'var(--blue)':'var(--bg3)')+';border-radius:5px;padding:7px;background:'+(isOne?'rgba(56,189,248,0.08)':'transparent')+'">'
    +'<strong style="color:var(--blue)">One Continuous</strong><br>One end column, other end wall.<br>alpha=1/10. Moment -20% vs SS.<br><em>Use when: end span with wall support.</em></div>'
    +'<div style="border:1px solid '+(isSS?'var(--orange)':'var(--bg3)')+';border-radius:5px;padding:7px;background:'+(isSS?'rgba(251,146,60,0.08)':'transparent')+'">'
    +'<strong style="color:var(--orange)">Simply Supported</strong><br>Both ends on walls/free.<br>alpha=1/8. Maximum moment.<br><em>Use when: both supports are walls.</em></div>'
    +'</div>'
    +'<strong>Impact on design:</strong> Choosing continuous joints correctly reduces required steel by 20-40% and reduces deflection. Never use simply supported when columns exist at both ends — that wastes material and underestimates joint stresses.</div>'
  ,'or');
}


// ════════════════════════════════════════════════════════════════
// CROSS-SECTION DETAIL PAGE
// SVG drawings of all members with reinforcement
// ════════════════════════════════════════════════════════════════

// == 11_xsections.js ==

// ================================================================
// MODULE: 11_xsections  —  Cross-Section Drawing Page (p15)
// Full annotated SVG drawings for every member with labels
// ================================================================

function secXSections() {
  if (!RES) return '<div class="card"><div class="ct bl">Cross-Section Drawings</div><div class="cd">Run analysis first (Step 6) to generate all reinforcement drawings.</div><button class="btn" onclick="go(6)">Go to Run Analysis</button></div>';

  const sl = RES.slab;
  const beams = RES.beams || [];
  const c1 = RES.cols.find(c => c.floor === 1 && c.corner);
  const c2 = RES.cols.find(c => c.floor === 1 && c.edge);
  const c3 = RES.cols.find(c => c.floor === 1 && c.inter);
  const cols = [c1, c2, c3].filter(Boolean);
  const ftgs = RES.ftgs || [];

  // ── SVG HELPERS ──────────────────────────────────────────────
  function dimLine(x1, y1, x2, y2, label, offset, horiz) {
    let s = '';
    if (horiz) {
      const my = y1 + offset;
      s += `<line x1="${x1}" y1="${y1}" x2="${x1}" y2="${my}" stroke="#64748b" stroke-width="0.5" stroke-dasharray="2,2"/>`;
      s += `<line x1="${x2}" y1="${y2}" x2="${x2}" y2="${my}" stroke="#64748b" stroke-width="0.5" stroke-dasharray="2,2"/>`;
      s += `<line x1="${x1}" y1="${my}" x2="${x2}" y2="${my}" stroke="#64748b" stroke-width="0.8" marker-start="url(#arr)" marker-end="url(#arr)"/>`;
      s += `<text x="${(x1+x2)/2}" y="${my+(offset>0?9:-4)}" fill="#64748b" font-size="8" text-anchor="middle" font-family="monospace">${label}</text>`;
    } else {
      const mx = x1 + offset;
      s += `<line x1="${x1}" y1="${y1}" x2="${mx}" y2="${y1}" stroke="#64748b" stroke-width="0.5" stroke-dasharray="2,2"/>`;
      s += `<line x1="${x2}" y1="${y2}" x2="${mx}" y2="${y2}" stroke="#64748b" stroke-width="0.5" stroke-dasharray="2,2"/>`;
      s += `<line x1="${mx}" y1="${y1}" x2="${mx}" y2="${y2}" stroke="#64748b" stroke-width="0.8" marker-start="url(#arr)" marker-end="url(#arr)"/>`;
      s += `<text x="${mx+(offset>0?4:-4)}" y="${(y1+y2)/2+3}" fill="#64748b" font-size="8" text-anchor="${offset>0?'start':'end'}" font-family="monospace">${label}</text>`;
    }
    return s;
  }

  const arrowDef = `<defs>
    <marker id="arr" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
      <polygon points="0,0 5,2.5 0,5" fill="#64748b"/>
    </marker>
    <marker id="arrrev" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto-start-reverse">
      <polygon points="0,0 5,2.5 0,5" fill="#64748b"/>
    </marker>
    <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="6" stroke="#64748b" stroke-width="0.5"/>
    </pattern>
  </defs>`;

  // ── BEAM CROSS-SECTION ───────────────────────────────────────
  function svgBeam(b) {
    const W = 340, H = 220;
    const bScale = Math.min(180 / b.b, 160 / b.D) * 0.82;
    const bw = b.b * bScale, bh = b.D * bScale;
    const ox = 70, oy = 28;
    const cv = S.coverBeam * bScale;
    const stirR = 4 * bScale;
    const barR = Math.max(3, 10 * bScale);
    const nBot = b.nm || 2, nTop = b.ns || 2;

    let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:340px;display:block">${arrowDef}`;

    // Concrete body with hatch fill
    s += `<rect x="${ox}" y="${oy}" width="${bw}" height="${bh}" fill="url(#hatch)" stroke="#64748b" stroke-width="2" rx="1"/>`;
    s += `<rect x="${ox}" y="${oy}" width="${bw}" height="${bh}" fill="rgba(71,85,105,0.6)" stroke="#64748b" stroke-width="2" rx="1"/>`;

    // Cover zone dashed
    s += `<rect x="${ox+cv}" y="${oy+cv}" width="${bw-2*cv}" height="${bh-2*cv}" fill="none" stroke="#f59e0b" stroke-width="0.8" stroke-dasharray="4,3"/>`;

    // Stirrup (T8 closed loop)
    const stX = ox + cv + stirR, stY = oy + cv + stirR;
    const stW = bw - 2*cv - 2*stirR, stH = bh - 2*cv - 2*stirR;
    s += `<rect x="${stX}" y="${stY}" width="${stW}" height="${stH}" fill="none" stroke="#94a3b8" stroke-width="${stirR*2}" stroke-linejoin="round"/>`;
    // 135deg hook indicators at top corners
    s += `<line x1="${stX}" y1="${stY}" x2="${stX-stirR*2}" y2="${stY-stirR*2}" stroke="#94a3b8" stroke-width="${stirR*1.5}"/>`;
    s += `<line x1="${stX+stW}" y1="${stY}" x2="${stX+stW+stirR*2}" y2="${stY-stirR*2}" stroke="#94a3b8" stroke-width="${stirR*1.5}"/>`;

    // Bottom tension bars (orange/yellow — most important)
    const botY = oy + bh - cv - barR;
    const botSp = nBot > 1 ? (bw - 2*cv - 2*barR) / (nBot - 1) : 0;
    for (let i = 0; i < nBot; i++) {
      const bx = ox + cv + barR + i * botSp;
      s += `<circle cx="${bx}" cy="${botY}" r="${barR}" fill="#f59e0b" stroke="#d97706" stroke-width="1.5"/>`;
    }

    // Top bars (blue — at supports for hogging)
    const topY = oy + cv + barR;
    const topSp = nTop > 1 ? (bw - 2*cv - 2*barR) / (nTop - 1) : 0;
    for (let i = 0; i < nTop; i++) {
      const tx = ox + cv + barR + i * topSp;
      s += `<circle cx="${tx}" cy="${topY}" r="${barR * 0.8}" fill="#60a5fa" stroke="#2563eb" stroke-width="1.5"/>`;
    }

    // Cover annotation
    s += `<line x1="${ox}" y1="${botY}" x2="${ox+cv}" y2="${botY}" stroke="#f59e0b" stroke-width="0.8" stroke-dasharray="2,2"/>`;
    s += `<text x="${ox+cv/2}" y="${botY-4}" fill="#f59e0b" font-size="7" text-anchor="middle" font-family="monospace">cover</text>`;
    s += `<text x="${ox+cv/2}" y="${botY+8}" fill="#f59e0b" font-size="7" text-anchor="middle" font-family="monospace">${S.coverBeam}mm</text>`;

    // Dimension lines
    s += dimLine(ox, oy+bh, ox+bw, oy+bh, b.b+'mm', 20, true);
    s += dimLine(ox+bw, oy, ox+bw, oy+bh, b.D+'mm', 28, false);

    // Labels on right side
    const lx = ox + bw + 38;
    const items = [
      { y: topY,   color: '#60a5fa', text: `Top: ${nTop}-T20`, sub: 'Compression/hogging' },
      { y: (topY+botY)/2, color: '#94a3b8', text: `Stirrup: T8`, sub: `@${b.svd}mm(end) @${b.sv}mm(mid)` },
      { y: botY,   color: '#f59e0b', text: `Bot: ${nBot}-T20`, sub: 'Tension/sagging (main)' },
    ];
    items.forEach(item => {
      s += `<line x1="${ox+bw+2}" y1="${item.y}" x2="${lx-4}" y2="${item.y}" stroke="${item.color}" stroke-width="0.6" stroke-dasharray="2,2"/>`;
      s += `<text x="${lx}" y="${item.y-2}" fill="${item.color}" font-size="8.5" font-weight="bold" font-family="monospace">${item.text}</text>`;
      s += `<text x="${lx}" y="${item.y+8}" fill="#64748b" font-size="7.5" font-family="monospace">${item.sub}</text>`;
    });

    // Title
    s += `<text x="${ox+bw/2}" y="14" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle" font-family="monospace">${(b.label||'Beam').slice(0,18)}</text>`;
    // Status badge
    const ok = b.deflOK && b.shearSafe;
    s += `<rect x="${ox+bw/2-18}" y="${H-16}" width="36" height="12" rx="3" fill="${ok?'rgba(52,211,153,0.2)':'rgba(248,113,113,0.2)'}" stroke="${ok?'#34d399':'#f87171'}" stroke-width="0.8"/>`;
    s += `<text x="${ox+bw/2}" y="${H-7}" fill="${ok?'#34d399':'#f87171'}" font-size="8" font-weight="bold" text-anchor="middle" font-family="monospace">${ok?'SAFE':'FAIL'}</text>`;

    s += '</svg>';
    return s;
  }

  // ── SLAB CROSS-SECTION ───────────────────────────────────────
  function svgSlab() {
    const W = 380, H = 160;
    const sw = 300, sh = Math.min(70, Math.max(35, sl.slabD * 0.18));
    const ox = 40, oy = 50;
    const cv = Math.max(3, S.coverSlab * sh / sl.slabD);
    const mainR = Math.max(2, 5);
    const distR = Math.max(1.5, 4);

    let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:380px;display:block">${arrowDef}`;

    // Slab body
    s += `<rect x="${ox}" y="${oy}" width="${sw}" height="${sh}" fill="rgba(71,85,105,0.65)" stroke="#64748b" stroke-width="2"/>`;

    // Cover lines
    s += `<line x1="${ox}" y1="${oy+cv}" x2="${ox+sw}" y2="${oy+cv}" stroke="#f59e0b" stroke-width="0.6" stroke-dasharray="4,3"/>`;
    s += `<line x1="${ox}" y1="${oy+sh-cv}" x2="${ox+sw}" y2="${oy+sh-cv}" stroke="#f59e0b" stroke-width="0.6" stroke-dasharray="4,3"/>`;

    // Main bars X — bottom (orange)
    const nMain = Math.floor(sw / (sl.spx * sh / sl.slabD * 1.2 + mainR*2)) + 1;
    const mainSp = (sw - 2*mainR) / Math.max(1, nMain - 1);
    for (let i = 0; i < nMain; i++) {
      const bx = ox + mainR + i * mainSp;
      s += `<circle cx="${bx}" cy="${oy+sh-cv-mainR}" r="${mainR}" fill="#f59e0b" stroke="#d97706" stroke-width="1.2"/>`;
    }

    // Distribution bars Y — above main (cyan)
    const nDist = Math.floor(nMain * 0.7);
    const distSp = (sw - 4*distR) / Math.max(1, nDist - 1);
    for (let i = 0; i < nDist; i++) {
      const dx = ox + 2*distR + i * distSp;
      s += `<circle cx="${dx}" cy="${oy+sh-cv-mainR*2-distR-1}" r="${distR}" fill="#22d3ee" stroke="#0891b2" stroke-width="1"/>`;
    }

    // Top bars at supports (purple)
    const nTop = Math.floor(nMain * 0.5);
    const topSp2 = (sw - 4*distR) / Math.max(1, nTop - 1);
    for (let i = 0; i < nTop; i++) {
      const tx = ox + 2*distR + i * topSp2;
      s += `<circle cx="${tx}" cy="${oy+cv+distR}" r="${distR}" fill="#a78bfa" stroke="#7c3aed" stroke-width="1"/>`;
    }

    // Dimension lines
    s += dimLine(ox, oy+sh, ox+sw, oy+sh, sl.slabD+'mm thick', 18, true);
    s += dimLine(ox+sw+2, oy, ox+sw+2, oy+sh, sl.slabD+'mm', 24, false);

    // Labels
    s += `<text x="${ox+10}" y="${oy-6}" fill="#38bdf8" font-size="10" font-weight="bold" font-family="monospace">SLAB — ${sl.twoWay?'Two-way':'One-way'} (${sl.slabD}mm thick)</text>`;

    // Legend
    const leg = [
      { r: mainR, fill: '#f59e0b', text: `Main X-bars: T10@${sl.spx}mm (bottom, shorter span) Ast=${r0(sl.Ax)}mm²/m` },
      { r: distR,  fill: '#22d3ee', text: `Dist Y-bars: T8@${sl.spy}mm (above main, longer span) Ast=${r0(sl.Ay)}mm²/m` },
      { r: distR,  fill: '#a78bfa', text: `Top bars at supports: T8@${sl.spx_n}mm (hogging), extend L/5=${r0(sl.lx/5*1000)}mm` },
    ];
    leg.forEach((item, i) => {
      const ly = oy + sh + 32 + i * 16;
      s += `<circle cx="${ox+item.r}" cy="${ly}" r="${item.r}" fill="${item.fill}" stroke="none"/>`;
      s += `<text x="${ox+item.r*2+5}" y="${ly+4}" fill="#94a3b8" font-size="8.5" font-family="monospace">${item.text}</text>`;
    });

    s += '</svg>';
    return s;
  }

  // ── COLUMN CROSS-SECTION ─────────────────────────────────────
  function svgCol(c) {
    const W = 240, H = 210;
    const sc = Math.min(150 / c.size, 150 / c.size) * 0.88;
    const sw = c.size * sc;
    const ox = (W - sw) / 2, oy = 25;
    const cv = S.coverCol * sc;
    const tieR = 4 * sc;
    const barR = Math.max(3.5, c.dB / 2 * sc * 0.75);
    const inner = sw - 2*cv;

    let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:240px;display:block">${arrowDef}`;

    // Column body
    s += `<rect x="${ox}" y="${oy}" width="${sw}" height="${sw}" fill="rgba(71,85,105,0.65)" stroke="#64748b" stroke-width="2"/>`;

    // Cover zone
    s += `<rect x="${ox+cv}" y="${oy+cv}" width="${inner}" height="${inner}" fill="none" stroke="#f59e0b" stroke-width="0.6" stroke-dasharray="4,3"/>`;

    // Lateral ties
    const tiePad = cv + tieR;
    s += `<rect x="${ox+tiePad}" y="${oy+tiePad}" width="${sw-2*tiePad}" height="${sw-2*tiePad}" fill="none" stroke="#94a3b8" stroke-width="${tieR*2}" stroke-linejoin="round"/>`;
    // 135deg hooks
    s += `<line x1="${ox+tiePad}" y1="${oy+tiePad}" x2="${ox+tiePad-tieR*2.5}" y2="${oy+tiePad-tieR*2.5}" stroke="#94a3b8" stroke-width="${tieR*1.5}"/>`;
    s += `<line x1="${ox+tiePad+sw-2*tiePad}" y1="${oy+tiePad}" x2="${ox+tiePad+sw-2*tiePad+tieR*2.5}" y2="${oy+tiePad-tieR*2.5}" stroke="#94a3b8" stroke-width="${tieR*1.5}"/>`;

    // Longitudinal bars
    const nb = c.nb || 4;
    const barPad = cv + tieR*2 + barR;
    const barsPerSide = nb <= 4 ? 2 : nb <= 8 ? Math.ceil(nb/4)+1 : 3;
    const barPositions = [];
    // Corners always
    barPositions.push([ox+barPad, oy+barPad]);
    barPositions.push([ox+sw-barPad, oy+barPad]);
    barPositions.push([ox+barPad, oy+sw-barPad]);
    barPositions.push([ox+sw-barPad, oy+sw-barPad]);
    // Extra bars on sides
    if (nb >= 6) {
      barPositions.push([ox+sw/2, oy+barPad]);
      barPositions.push([ox+sw/2, oy+sw-barPad]);
    }
    if (nb >= 8) {
      barPositions.push([ox+barPad, oy+sw/2]);
      barPositions.push([ox+sw-barPad, oy+sw/2]);
    }
    barPositions.slice(0, nb).forEach(([px, py]) => {
      s += `<circle cx="${px}" cy="${py}" r="${barR}" fill="#34d399" stroke="#059669" stroke-width="1.5"/>`;
    });

    // Dimension lines
    s += dimLine(ox, oy+sw, ox+sw, oy+sw, c.size+'mm', 18, true);
    s += dimLine(ox+sw+2, oy, ox+sw+2, oy+sw, c.size+'mm', 22, false);

    // Title and info
    s += `<text x="${W/2}" y="14" fill="#a78bfa" font-size="10" font-weight="bold" text-anchor="middle" font-family="monospace">${(c.label||'Column').slice(0,18)}</text>`;

    // Legend below
    const legY = oy + sw + 28;
    s += `<circle cx="${ox+5}" cy="${legY}" r="4" fill="#34d399"/>`;
    s += `<text x="${ox+12}" y="${legY+4}" fill="#94a3b8" font-size="8" font-family="monospace">${nb}-T${c.dB} bars (pt=${r2(c.pt)}%, Asc=${r0(c.Aprov)}mm²)</text>`;
    s += `<rect x="${ox}" y="${legY+10}" width="8" height="4" fill="none" stroke="#94a3b8" stroke-width="2"/>`;
    s += `<text x="${ox+12}" y="${legY+16}" fill="#94a3b8" font-size="8" font-family="monospace">Ties T8@${c.ts}mm (gen) | T8@${c.tsc}mm in Lo=${r0(c.Lo)}mm</text>`;
    s += `<line x1="${ox}" y1="${legY+22}" x2="${ox+8}" y2="${legY+22}" stroke="#f59e0b" stroke-width="0.8" stroke-dasharray="3,2"/>`;
    s += `<text x="${ox+12}" y="${legY+25}" fill="#94a3b8" font-size="8" font-family="monospace">Cover = ${S.coverCol}mm (nominal)</text>`;

    const ok = c.safe;
    s += `<rect x="${W/2-20}" y="${H-14}" width="40" height="12" rx="3" fill="${ok?'rgba(52,211,153,0.2)':'rgba(248,113,113,0.2)'}" stroke="${ok?'#34d399':'#f87171'}" stroke-width="0.8"/>`;
    s += `<text x="${W/2}" y="${H-5}" fill="${ok?'#34d399':'#f87171'}" font-size="8" font-weight="bold" text-anchor="middle" font-family="monospace">${ok?'SAFE':'FAIL'}</text>`;

    s += '</svg>';
    return s;
  }

  // ── FOOTING CROSS-SECTION ────────────────────────────────────
  function svgFtg(f) {
    const W = 300, H = 200;
    const fScale = Math.min(200 / (f.Bf * 1000), 0.14);
    const fw = f.Bf * 1000 * fScale;
    const fh = Math.min(70, Math.max(35, f.D * fScale * 2));
    const colW = (f.col || 300) * fScale;
    const ox = (W - fw) / 2, oy = 30;
    const cv = 75 * fScale;
    const barR = Math.max(2, f.dBf / 2 * fScale * 1.5);
    const nBars = Math.min(8, Math.max(3, Math.floor(fw / 28)));

    let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:300px;display:block">${arrowDef}`;

    // Soil (hatched)
    s += `<rect x="${ox}" y="${oy+fh}" width="${fw}" height="18" fill="url(#hatch)" opacity="0.5"/>`;
    s += `<rect x="${ox}" y="${oy+fh}" width="${fw}" height="18" fill="rgba(180,150,100,0.25)" stroke="#78716c" stroke-width="0.5"/>`;

    // Footing body
    s += `<rect x="${ox}" y="${oy}" width="${fw}" height="${fh}" fill="rgba(71,85,105,0.65)" stroke="#64748b" stroke-width="2"/>`;

    // Column stub at top
    s += `<rect x="${ox+(fw-colW)/2}" y="${oy-18}" width="${colW}" height="20}" fill="rgba(100,116,139,0.8)" stroke="#94a3b8" stroke-width="1.5"/>`;
    s += `<text x="${W/2}" y="${oy-8}" fill="#a78bfa" font-size="8" text-anchor="middle" font-family="monospace">Column ${f.col||300}x${f.col||300}mm</text>`;

    // Cover line
    s += `<line x1="${ox}" y1="${oy+fh-cv}" x2="${ox+fw}" y2="${oy+fh-cv}" stroke="#f59e0b" stroke-width="0.6" stroke-dasharray="3,2"/>`;

    // Bottom bars — both ways
    const barSp = (fw - 2*barR) / (nBars - 1);
    for (let i = 0; i < nBars; i++) {
      const bx = ox + barR + i * barSp;
      s += `<circle cx="${bx}" cy="${oy+fh-cv-barR}" r="${barR}" fill="#f59e0b" stroke="#d97706" stroke-width="1.2"/>`;
    }
    // Transverse bars (shown as smaller dots in front)
    for (let i = 1; i < nBars - 1; i++) {
      const bx = ox + barR + i * barSp;
      s += `<circle cx="${bx}" cy="${oy+fh-cv-barR*2.5}" r="${barR*0.7}" fill="#22d3ee" stroke="#0891b2" stroke-width="1"/>`;
    }

    // Critical section lines (punching + one-way)
    const d2 = f.d * fScale;
    const halfCol = colW / 2;
    // Punching perimeter at d/2 from column face
    const punchOff = d2 / 2;
    s += `<rect x="${ox+(fw-colW)/2-punchOff}" y="${oy-punchOff}" width="${colW+2*punchOff}" height="${punchOff+2}" fill="none" stroke="#f87171" stroke-width="0.8" stroke-dasharray="3,2"/>`;

    // Dimension lines
    s += dimLine(ox, oy+fh+22, ox+fw, oy+fh+22, r2(f.Bf)+'m', 14, true);
    s += dimLine(ox+fw+2, oy, ox+fw+2, oy+fh, f.D+'mm depth', 28, false);

    // Legend
    const legY = oy + fh + 50;
    s += `<circle cx="${ox+5}" cy="${legY}" r="${barR}" fill="#f59e0b"/>`;
    s += `<text x="${ox+5+barR+4}" y="${legY+4}" fill="#94a3b8" font-size="8" font-family="monospace">T${f.dBf}@${f.spf}mm c/c both ways (Ast=${r0(f.Af)}mm²)</text>`;
    s += `<text x="${ox}" y="${legY+16}" fill="#64748b" font-size="8" font-family="monospace">Cover=75mm (earth face, IS 456 Cl 26.4.2.2) | d_eff=${r0(f.d)}mm</text>`;
    const ok = f.punch_ok && f.ow_ok && f.Ld_ok;
    s += `<text x="${ox}" y="${legY+28}" fill="${ok?'#34d399':'#f87171'}" font-size="8" font-weight="bold" font-family="monospace">${ok?'All checks PASS':'Needs revision - see footing design section'}</text>`;

    s += `<text x="${W/2}" y="14" fill="#fbbf24" font-size="10" font-weight="bold" text-anchor="middle" font-family="monospace">${(f.lbl||'Footing').slice(0,20)} — ${r2(f.Bf)}m x ${r2(f.Bf)}m</text>`;
    s += '</svg>';
    return s;
  }

  // ── ELEVATION SKETCH — beam-column frame ─────────────────────
  function svgElevation() {
    const W = 380, H = 200;
    const nBay = Math.min(3, S.spansX.length);
    const spanPx = 90, storyH = 100, nStory = Math.min(2, S.numFloors);
    const startX = 40, startY = 170;

    let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:380px;display:block">${arrowDef}`;

    // Ground line
    s += `<line x1="${startX-20}" y1="${startY+8}" x2="${startX+nBay*spanPx+20}" y2="${startY+8}" stroke="#78716c" stroke-width="2"/>`;
    for (let i = 0; i <= nBay + 2; i++) s += `<line x1="${startX-20+i*14}" y1="${startY+8}" x2="${startX-28+i*14}" y2="${startY+16}" stroke="#78716c" stroke-width="1"/>`;

    // Footings
    for (let i = 0; i <= nBay; i++) {
      const fx = startX + i * spanPx;
      s += `<rect x="${fx-14}" y="${startY}" width="28" height="10" fill="#64748b" stroke="#64748b" stroke-width="1.5"/>`;
    }

    // Columns + beams per storey
    for (let st = 0; st < nStory; st++) {
      const baseY = startY - st * storyH;
      for (let i = 0; i <= nBay; i++) {
        const cx = startX + i * spanPx;
        s += `<rect x="${cx-6}" y="${baseY-storyH}" width="12" height="${storyH}" fill="#4c1d95" stroke="#7c3aed" stroke-width="1.5"/>`;
      }
      for (let i = 0; i < nBay; i++) {
        const bx1 = startX + i * spanPx + 6, bx2 = startX + (i+1) * spanPx - 6;
        const by = baseY - storyH + 8;
        s += `<rect x="${bx1}" y="${by}" width="${bx2-bx1}" height="14}" fill="#7c2d12" stroke="#f59e0b" stroke-width="1.5"/>`;
        // Span label
        const spanM = S.spansX[i] || 4;
        s += `<text x="${(bx1+bx2)/2}" y="${by-4}" fill="#f59e0b" font-size="8" text-anchor="middle" font-family="monospace">${spanM}m</text>`;
      }
      // Floor height label
      s += `<text x="${startX-28}" y="${baseY-storyH/2}" fill="#94a3b8" font-size="7" text-anchor="end" font-family="monospace">${S.floorHt}m</text>`;
      s += `<line x1="${startX-24}" y1="${baseY-storyH}" x2="${startX-24}" y2="${baseY}" stroke="#64748b" stroke-width="0.5"/>`;
    }

    s += `<text x="${W/2}" y="12" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle" font-family="monospace">FRAME ELEVATION — ${nBay} Bay x ${nStory} Storey</text>`;
    s += `<text x="${startX-20}" y="${startY+28}" fill="#64748b" font-size="8" font-family="monospace">Purple = columns | Orange = beams</text>`;
    s += '</svg>';
    return s;
  }

  // ── PAGE ASSEMBLY ─────────────────────────────────────────────
  const legend = `<div style="display:flex;flex-wrap:wrap;gap:14px;padding:10px 14px;background:var(--bg1);border-radius:8px;margin-bottom:16px;font-size:11px">
    <span style="font-weight:700;color:var(--txt2)">Legend:</span>
    <span><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#f59e0b;vertical-align:middle;margin-right:4px"></span>Tension bars (bottom of beam, bottom of slab)</span>
    <span><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#60a5fa;vertical-align:middle;margin-right:4px"></span>Compression/top bars (at supports, hogging)</span>
    <span><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#34d399;vertical-align:middle;margin-right:4px"></span>Column bars</span>
    <span><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#22d3ee;vertical-align:middle;margin-right:4px"></span>Distribution/transverse bars</span>
    <span><span style="display:inline-block;width:30px;height:3px;background:none;border-top:1px dashed #f59e0b;vertical-align:middle;margin-right:4px"></span>Cover line (nominal cover)</span>
    <span><span style="display:inline-block;width:30px;height:3px;background:#94a3b8;vertical-align:middle;margin-right:4px"></span>Stirrup / tie</span>
  </div>`;

  return `<div class="card bl">
    <div class="ct">Reinforcement Drawings — All Members</div>
    <div class="cd">Annotated cross-section drawings showing exact bar sizes, spacings, cover, and location. These are the sections a site engineer would mark on structural drawings.</div>
    ${legend}

    ${sb('XS-0','Frame Elevation — How Members Connect',svgElevation()+'<div style="font-size:11px;color:var(--txt3);margin-top:8px;line-height:1.8">This sketch shows how beams and columns form the structural frame. Beams (orange) span between columns (purple) at each floor level. Footings transfer column loads to the soil.</div>','bl')}

    ${sb('XS-1','Slab Cross-Section (Typical Floor Panel)',svgSlab()+`
      <div style="margin-top:10px;font-size:11px;color:var(--txt2);line-height:1.8">
        <strong>Panel:</strong> lx = ${r2(sl.lx)}m (short) × ly = ${r2(sl.ly)}m (long) | Type: ${sl.twoWay?'Two-way (bends in both directions)':'One-way (bends along short span only)'}<br>
        <strong>Main bars X</strong> run along the shorter span (where the slab bends most). They carry the most force and are placed at the bottom where tension occurs.<br>
        <strong>Distribution bars Y</strong> run perpendicular to main bars, above them. They distribute load and control cracking.<br>
        <strong>Top bars at supports</strong> are needed at walls or beams where the slab is continuous — the slab bends upward (hogging) there, so tension is at the top.<br>
        <strong>Cover = ${S.coverSlab}mm</strong> — mandatory clear distance from face of steel to concrete surface (IS 456 Table 16 — moderate exposure).
      </div>
    `,'bl')}

    <div style="font-size:12px;font-weight:700;color:var(--orange);margin:16px 0 8px">BEAM CROSS-SECTIONS</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px">
      ${beams.map(b => `<div style="background:var(--bg1);border:1px solid var(--bg3);border-radius:10px;padding:14px">
        ${svgBeam(b)}
        <div style="font-size:11px;line-height:1.8;color:var(--txt2);margin-top:10px">
          <strong>Section:</strong> ${b.b} × ${b.D}mm | Span: ${b.L}m<br>
          <strong style="color:#f59e0b">Bottom ${b.nm}-T20:</strong> These are the main tension bars. In a simply supported or continuous beam, the bottom fibre is in tension at midspan. Area = ${r0(b.Ap)}mm² (needed ${r0(b.Am)}mm²)<br>
          <strong style="color:#60a5fa">Top ${b.ns}-T20:</strong> At supports (columns), the beam bends upward — top is in tension. Extend L/4 + ${r0(b.Ld)}mm (development length) from support.<br>
          <strong style="color:#94a3b8">Stirrups T8:</strong> End zone ${r0(Math.max(2*b.D,b.L*1000/4))}mm → T8@${b.svd}mm | Middle → T8@${b.sv}mm. 135° hooks mandatory (IS 13920).<br>
          <strong>Cover = ${S.coverBeam}mm</strong> | pt = ${r2(b.pt)}% | Ld = ${r0(b.Ld)}mm
        </div>
      </div>`).join('')}
    </div>

    <div style="font-size:12px;font-weight:700;color:var(--violet);margin:16px 0 8px">COLUMN CROSS-SECTIONS — Ground Floor (Maximum Load)</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px">
      ${cols.map(c => `<div style="background:var(--bg1);border:1px solid var(--bg3);border-radius:10px;padding:14px">
        ${svgCol(c)}
        <div style="font-size:11px;line-height:1.8;color:var(--txt2);margin-top:10px">
          <strong>${c.label}:</strong> ${c.size}×${c.size}mm<br>
          <strong style="color:#34d399">${c.nb}-T${c.dB}:</strong> Longitudinal bars carry axial load + bending. pt=${r2(c.pt)}% (min 0.8%, max 4%)<br>
          <strong style="color:#94a3b8">Ties T8@${c.ts}mm:</strong> General zone — prevent bar buckling<br>
          <strong style="color:#38bdf8">Ties T8@${c.tsc}mm:</strong> Confinement zone Lo=${r0(c.Lo)}mm — seismic ductility<br>
          Pu=${r2(c.Pu)}kN | Capacity=${r2(c.Pcap)}kN | ${c.safe?'SAFE':'NEEDS REVISION'}
        </div>
      </div>`).join('')}
    </div>

    <div style="font-size:12px;font-weight:700;color:var(--yellow);margin:16px 0 8px">FOOTING CROSS-SECTIONS</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
      ${ftgs.map(f => `<div style="background:var(--bg1);border:1px solid var(--bg3);border-radius:10px;padding:14px">
        ${svgFtg(f)}
        <div style="font-size:11px;line-height:1.8;color:var(--txt2);margin-top:10px">
          <strong>${f.lbl}:</strong> ${r2(f.Bf)}m × ${r2(f.Bf)}m, D=${r0(f.D)}mm<br>
          <strong style="color:#f59e0b">T${f.dBf}@${f.spf}mm both ways:</strong> The footing bends like an upturned slab — tension at bottom. Steel runs in both directions.<br>
          <strong>Cover = 75mm:</strong> Earth face requires extra cover — soil can be wet and aggressive (IS 456 Cl 26.4.2.2).<br>
          Punching: ${f.punch_ok?'OK':'FAIL'} | One-way shear: ${f.ow_ok?'OK':'FAIL'} | Dev.length: ${f.Ld_ok?'OK':'Need 90° hook'}
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}


// == 14_joint_types.js ==

// ================================================================
// MODULE: 14_joint_types — Joint Type Selection & Teaching Page
// ================================================================

// ── DATA ────────────────────────────────────────────────────────
const JOINT_TYPES = {
  both_fixed: {
    label: 'Fixed–Fixed (Both Ends into Columns)',
    shortLabel: 'Both continuous',
    icon: '🔒🔒',
    color: '#34d399',
    alpha_mid: 1/16, alpha_sup: 1/12,
    IS_ref: 'IS 456 Table 12 — Interior span',
    moment_vs_ss: -38,
    // What a student sees on a drawing / site
    how_to_identify: [
      'Column bars pass through the joint — you can see them continuing up through the floor',
      'Beam bars are bent and lapped into the column on both sides',
      'Joint has extra ties (hoops) at the beam-column intersection',
      'On the structural drawing: beam is marked as "continuous" or shown with top steel at both supports',
    ],
    when_to_use: 'Whenever a beam spans between two RC columns — this is the standard case in almost every residential RC frame building. Both ends are restrained against rotation by the columns.',
    residential_use: 'Most common — used for ALL interior beams and most exterior beams in a typical G+2 or G+3 house.',
    not_when: 'Do NOT assume this if the beam actually rests on a masonry wall at one end — the wall provides no rotational restraint.',
    steel_implication: 'Needs top steel at BOTH ends (hogging) AND bottom steel at midspan (sagging). Saves 38% steel vs simply supported.',
    detailing: 'Beam top bars must pass through the column or be lapped with U-bars. Bottom bars stop at the column face (or extend 12 bar diameters into column).',
  },
  one_fixed: {
    label: 'Fixed–Pinned (Column One Side, Wall Other)',
    shortLabel: 'One continuous',
    icon: '🔒📌',
    color: '#60a5fa',
    alpha_mid: 1/10, alpha_sup: 1/10,
    IS_ref: 'IS 456 Table 12 — End span',
    moment_vs_ss: -20,
    how_to_identify: [
      'One end connects to an RC column (bars visible, lapped into column)',
      'Other end simply rests on a 230mm (or thicker) brick wall with a bearing of 75–150mm',
      'On the drawing: one end shows a column symbol, other end shows a wall or "pinned" symbol',
      'The wall-resting end has NO top steel — only a small nominal bar for shrinkage',
    ],
    when_to_use: 'End beams of a building where the outer wall is load-bearing masonry (no column). Also used for secondary beams that rest on a primary beam.',
    residential_use: 'Common for boundary beams where the building edge has a wall instead of a column. Often seen in older residential buildings.',
    not_when: 'If the wall is very thin (115mm), it cannot provide adequate bearing — this end becomes unstable. Use a column instead.',
    steel_implication: 'Top steel needed only at the column end. Simply supported end has no hogging. Saves 20% vs simply supported.',
    detailing: 'At the pinned end: provide min 150mm bearing on wall, 2-T10 top bars for nominal (not structural). At fixed end: full top steel extending L/4 + Ld.',
  },
  simply_supported: {
    label: 'Pinned–Pinned (Both Ends on Walls)',
    shortLabel: 'Simply supported',
    icon: '📌📌',
    color: '#f59e0b',
    alpha_mid: 1/8, alpha_sup: 0,
    IS_ref: 'IS 456 Cl 22.5.1',
    moment_vs_ss: 0,
    how_to_identify: [
      'Both ends rest on masonry walls with a visible bearing area (75–150mm)',
      'No column bars visible at the beam ends',
      'On the drawing: triangle/pin support symbols at both ends',
      'Only bottom steel runs the full length — no structural top steel at supports',
    ],
    when_to_use: 'Lintel beams over doors and windows. Chajja (sunshade) support beams. Precast beams placed on walls. Secondary beams resting on primary beams at BOTH ends.',
    residential_use: 'Used for lintels, small roof beams, and any beam where both ends sit on walls. NOT used for typical floor beams in RC frame buildings.',
    not_when: 'If your beam is part of an RC frame (has columns), never use simply supported — you will waste 38% more steel and get much higher deflection.',
    steel_implication: 'Maximum moment → most steel. No top steel needed at supports. Highest deflection of all options.',
    detailing: 'All main steel at bottom. Provide 2-T8 nominal top bars for handling and shrinkage. Bearing on wall minimum 75mm (IS 456 Cl 22.2).',
  },
  cantilever: {
    label: 'Cantilever (Fixed Root, Free Tip)',
    shortLabel: 'Cantilever',
    icon: '🔒↗️',
    color: '#f87171',
    alpha_mid: 0, alpha_sup: 0.5,
    IS_ref: 'IS 456 Cl 22.5.2',
    moment_vs_ss: 0,
    how_to_identify: [
      'Beam projects beyond its support — the free end has nothing under it',
      'Heavy bars at the TOP near the root (fixed end) — this is the tension face',
      'The bottom bars stop or reduce near the free end',
      'On the drawing: hatched support symbol at root, free end shows arrow pointing down',
      'Stricter deflection limit: L/150 instead of L/250',
    ],
    when_to_use: 'Balconies, chajjas (sunshades), overhanging slabs, canopy structures, any projection beyond the building line.',
    residential_use: 'Very common for balconies in residential buildings. Maximum practical cantilever for a standard RC beam is 2–2.5m. Beyond that, special design is needed.',
    not_when: 'NEVER make a cantilever longer than 2.5m without careful checking of the column for uplift. The root column must be checked for uplift (it may try to lift off the footing).',
    steel_implication: 'Moment at root = wL²/2 — same formula but coefficient 0.5 (vs 1/8 for SS). All main steel goes at TOP. Deflection limit L/150 is very strict — often the governing check.',
    detailing: 'Top bars must extend well beyond the support into the back-span (minimum 1.5× the cantilever length or development length, whichever is larger). Bottom bars are nominal.',
  },
};

// ── JOINT TYPE TEACHING PAGE ────────────────────────────────────
function secJointTypes() {
  const currentBeam = RES && RES.beams && RES.beams[BIDX || 0];
  const activeKey = !currentBeam ? null
    : currentBeam.isCantilever ? 'cantilever'
    : currentBeam.endLeft === 'column' && currentBeam.endRight === 'column' ? 'both_fixed'
    : (currentBeam.endLeft === 'column' || currentBeam.endRight === 'column') ? 'one_fixed'
    : 'simply_supported';

  // Moment comparison bar chart
  const exW = 15, exL = 5;
  const moments = {
    both_fixed: exW * exL * exL / 16,
    one_fixed:  exW * exL * exL / 10,
    simply_supported: exW * exL * exL / 8,
    cantilever: exW * exL * exL / 2,
  };
  const maxM = moments.cantilever;

  function momentBar(key) {
    const jt = JOINT_TYPES[key];
    const pct = (moments[key] / maxM * 100).toFixed(0);
    return `<div style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px">
        <span style="color:var(--txt2)">${jt.shortLabel}</span>
        <span style="color:${jt.color};font-weight:700">${r2(moments[key])} kN.m (${pct}%)</span>
      </div>
      <div style="height:12px;background:var(--bg3);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${jt.color};border-radius:4px;transition:width 0.3s"></div>
      </div>
    </div>`;
  }

  // SVG joint diagrams
  function svgJoint(key) {
    const W = 260, H = 120;
    let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:260px">`;
    s += `<rect width="${W}" height="${H}" fill="#0a0f1e" rx="6"/>`;

    const beamY = 52, bh = 16, bx1 = 55, bx2 = W - 55;

    // Beam body
    s += `<rect x="${bx1}" y="${beamY}" width="${bx2-bx1}" height="${bh}" fill="#64748b" stroke="#64748b" stroke-width="1.5" rx="1"/>`;

    // Load arrows
    for (let x = bx1 + 12; x < bx2; x += 20) {
      s += `<path d="M${x},${beamY-14} L${x},${beamY-3}" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#jArr)"/>`;
    }
    s += `<defs><marker id="jArr" markerWidth="5" markerHeight="4" refX="2.5" refY="4" orient="auto"><polygon points="0,0 5,0 2.5,4" fill="#f59e0b"/></marker></defs>`;
    s += `<line x1="${bx1}" y1="${beamY-16}" x2="${bx2}" y2="${beamY-16}" stroke="#f59e0b" stroke-width="0.8"/>`;
    s += `<text x="${W/2}" y="${beamY-19}" fill="#f59e0b" font-size="8" text-anchor="middle" font-family="monospace">w kN/m</text>`;

    // Support drawing functions
    const drawCol = (x, top) => {
      s += `<rect x="${x-10}" y="${top?beamY-40:beamY}" width="20" height="${top?40:40}" fill="#4c1d95" stroke="#7c3aed" stroke-width="1.5" rx="1"/>`;
      // bar dots
      [[x-5,top?beamY-35:beamY+5],[x+5,top?beamY-35:beamY+5],
       [x-5,top?beamY-10:beamY+30],[x+5,top?beamY-10:beamY+30]].forEach(([px,py])=>{
        s += `<circle cx="${px}" cy="${py}" r="2" fill="#34d399"/>`;
      });
    };
    const drawWall = (x) => {
      s += `<rect x="${x-12}" y="${beamY-2}" width="14" height="${bh+4}" fill="#64748b" stroke="#94a3b8" stroke-width="1"/>`;
      for (let dy = 0; dy <= bh+4; dy += 5) s += `<line x1="${x-12}" y1="${beamY-2+dy}" x2="${x-20}" y2="${beamY+2+dy}" stroke="#64748b" stroke-width="0.8"/>`;
    };
    const drawPin = (x) => {
      s += `<polygon points="${x},${beamY+bh} ${x-14},${beamY+bh+16} ${x+14},${beamY+bh+16}" fill="#64748b" stroke="#94a3b8" stroke-width="1.5"/>`;
      s += `<circle cx="${x}" cy="${beamY+bh}" r="3" fill="#94a3b8"/>`;
      s += `<line x1="${x-18}" y1="${beamY+bh+16}" x2="${x+18}" y2="${beamY+bh+16}" stroke="#64748b" stroke-width="1.5"/>`;
      for (let dx = -16; dx <= 16; dx += 6) s += `<line x1="${x+dx}" y1="${beamY+bh+16}" x2="${x+dx-4}" y2="${beamY+bh+22}" stroke="#64748b" stroke-width="0.8"/>`;
    };

    if (key === 'both_fixed')      { drawCol(bx1); drawCol(bx2); }
    else if (key === 'one_fixed')  { drawCol(bx1); drawPin(bx2); }
    else if (key === 'simply_supported') { drawPin(bx1); drawPin(bx2); }
    else if (key === 'cantilever') { drawCol(bx1); }

    // Deflected shape + BMD
    const bmdY = beamY + bh + 4;
    s += `<text x="${W/2}" y="${H-4}" fill="#64748b" font-size="8" text-anchor="middle" font-family="monospace">BMD shape</text>`;
    if (key === 'both_fixed') {
      // Hogging at ends, sagging in middle
      s += `<path d="M${bx1},${bmdY} C${bx1+20},${bmdY+20} ${W/2-20},${bmdY+20} ${W/2},${bmdY+20} S${bx2-20},${bmdY+20} ${bx2},${bmdY}" fill="rgba(52,211,153,0.15)" stroke="#34d399" stroke-width="1.5"/>`;
    } else if (key === 'one_fixed') {
      const mid = (bx1+bx2)/2-20;
      s += `<path d="M${bx1},${bmdY} Q${mid},${bmdY+22} ${bx2},${bmdY}" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" stroke-width="1.5"/>`;
    } else if (key === 'simply_supported') {
      const mid = (bx1+bx2)/2;
      s += `<path d="M${bx1},${bmdY} Q${mid},${bmdY+26} ${bx2},${bmdY}" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" stroke-width="1.5"/>`;
    } else if (key === 'cantilever') {
      s += `<path d="M${bx1},${bmdY} L${bx1},${bmdY+28} L${bx2},${bmdY}" fill="rgba(248,113,113,0.15)" stroke="#f87171" stroke-width="1.5"/>`;
      s += `<text x="${bx1+5}" y="${bmdY+20}" fill="#f87171" font-size="7.5" font-family="monospace">MAX at root</text>`;
    }

    s += '</svg>';
    return s;
  }

  // Full joint card
  function jointCard(key) {
    const jt = JOINT_TYPES[key];
    const isActive = key === activeKey;
    return `<div style="border:1.5px solid ${isActive ? jt.color : 'var(--bg3)'};border-radius:12px;padding:16px;background:${isActive ? 'rgba('+hexToRgb(jt.color)+',0.04)' : 'var(--bg1)'}">
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px">
        <span style="font-size:26px;line-height:1">${jt.icon}</span>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:800;color:var(--txt);margin-bottom:2px">${jt.label}</div>
          <div style="font-size:10px;color:${jt.color}">${jt.IS_ref}</div>
          ${isActive ? `<div style="display:inline-block;margin-top:4px;padding:2px 8px;background:${jt.color};color:#000;border-radius:10px;font-size:9px;font-weight:700">YOUR CURRENT BEAM</div>` : ''}
        </div>
        <div style="text-align:right">
          <div style="font-size:22px;font-weight:900;color:${jt.moment_vs_ss < 0 ? '#34d399' : jt.moment_vs_ss === 0 && key !== 'cantilever' ? '#f59e0b' : '#f87171'}">${jt.moment_vs_ss < 0 ? jt.moment_vs_ss+'%' : key==='cantilever'?'4x SS':'Base'}</div>
          <div style="font-size:9px;color:var(--txt3)">vs simply supported</div>
        </div>
      </div>

      ${svgJoint(key)}

      <div style="margin-top:10px;display:grid;gap:8px">
        <div style="padding:8px 10px;background:var(--bg3);border-radius:7px">
          <div style="font-size:10px;font-weight:700;color:${jt.color};margin-bottom:4px">HOW TO IDENTIFY ON SITE / DRAWING</div>
          ${jt.how_to_identify.map(h => `<div style="font-size:10px;color:var(--txt2);padding:2px 0;display:flex;gap:6px"><span style="color:${jt.color};flex-shrink:0">→</span>${h}</div>`).join('')}
        </div>

        <div style="padding:8px 10px;background:var(--bg3);border-radius:7px">
          <div style="font-size:10px;font-weight:700;color:var(--teal);margin-bottom:4px">WHEN TO USE IN RESIDENTIAL BUILDINGS</div>
          <div style="font-size:10px;color:var(--txt2);line-height:1.6">${jt.when_to_use}</div>
          <div style="margin-top:4px;font-size:10px;color:${jt.color};font-weight:600">${jt.residential_use}</div>
        </div>

        <div style="padding:8px 10px;background:var(--bg3);border-radius:7px">
          <div style="font-size:10px;font-weight:700;color:#f87171;margin-bottom:4px">DO NOT USE WHEN</div>
          <div style="font-size:10px;color:#fca5a5;line-height:1.6">${jt.not_when}</div>
        </div>

        <div style="padding:8px 10px;background:var(--bg3);border-radius:7px">
          <div style="font-size:10px;font-weight:700;color:var(--yellow);margin-bottom:4px">STEEL REQUIREMENT & DETAILING</div>
          <div style="font-size:10px;color:var(--txt2);line-height:1.6">${jt.steel_implication}</div>
          <div style="margin-top:3px;font-size:10px;color:#94a3b8">${jt.detailing}</div>
        </div>

        <div style="padding:8px 10px;background:rgba(56,189,248,0.07);border:1px solid rgba(56,189,248,0.15);border-radius:7px;display:flex;gap:16px">
          <div style="text-align:center">
            <div style="font-size:18px;font-weight:800;color:var(--orange)">${jt.alpha_mid===0?'wL²/2':('1/'+ Math.round(1/jt.alpha_mid))}</div>
            <div style="font-size:9px;color:var(--txt3)">alpha (midspan)</div>
          </div>
          <div style="font-size:10px;color:var(--txt2);line-height:1.7">
            M_midspan = alpha x wu x L²<br>
            Example (wu=15 kN/m, L=5m):<br>
            <strong style="color:${jt.color}">M = ${jt.alpha_mid===0?'15x25/2=':('1/'+ Math.round(1/jt.alpha_mid)+' x 15 x 25 =')} ${r2(jt.alpha_mid===0?15*25/2:jt.alpha_mid*15*25)} kN.m</strong>
          </div>
        </div>
      </div>
    </div>`;
  }

  // Helper for rgba
  function hexToRgb(hex) {
    if(hex==='#34d399') return '52,211,153';
    if(hex==='#60a5fa') return '96,165,250';
    if(hex==='#f59e0b') return '245,158,11';
    if(hex==='#f87171') return '248,113,113';
    return '148,163,184';
  }

  return `<div class="card bl">
    <div class="ct">Joint Types — IS 456 Table 12</div>
    <div class="cd">The joint type (how a beam connects at each end) is the single most important decision in beam design. It determines how much moment the beam carries, how much steel is needed, and how the beam will deflect. Getting this wrong can waste 30–40% of steel or cause deflection failures.</div>

    <div style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.2);border-radius:10px;padding:14px;margin-bottom:18px">
      <div style="font-size:12px;font-weight:700;color:var(--cyan);margin-bottom:10px">Moment Comparison — Same beam, same load (w=15 kN/m, L=5m), different joint types:</div>
      ${Object.keys(JOINT_TYPES).map(momentBar).join('')}
      <div style="font-size:10px;color:var(--txt3);margin-top:6px;line-height:1.6">
        A student who wrongly assumes simply supported (when columns exist at both ends) will over-design the beam by 38% — wasting steel and increasing cost. A student who wrongly assumes fixed (when ends are on walls) will UNDER-design the beam — it will crack and deflect badly.
      </div>
    </div>

    <div style="font-size:12px;font-weight:700;color:var(--txt);margin-bottom:12px">Residential Building — Which Joint Is Used Where?</div>
    <div style="background:var(--bg1);border:1px solid var(--bg3);border-radius:10px;padding:12px;margin-bottom:18px;font-size:11px;line-height:1.9">
      <div><strong style="color:#34d399">Interior beams between columns</strong> → Fixed-Fixed (both continuous) — 95% of beams in a typical RC frame house</div>
      <div><strong style="color:#60a5fa">End beams where outer wall is masonry (no column)</strong> → Fixed-Pinned (one continuous)</div>
      <div><strong style="color:#f59e0b">Lintels over doors/windows</strong> → Simply supported (both on wall) — lintel beams only, not floor beams</div>
      <div><strong style="color:#f87171">Balcony projections</strong> → Cantilever — check carefully, max 2m practical span</div>
      <div style="margin-top:6px;padding:8px;background:var(--bg3);border-radius:6px;color:var(--txt3)">
        <strong>Rule for a G+3 residential building:</strong> If you have RC columns at both ends of the beam → use Fixed-Fixed. If one end is a wall → use Fixed-Pinned. In doubt → use Fixed-Pinned (safer assumption than both fixed if column detail is uncertain).
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
      ${Object.keys(JOINT_TYPES).map(jointCard).join('')}
    </div>
  </div>`;
}

// ── JOINT SELECTOR (shown inside beam detail) ───────────────────
function renderJointSelector(beamId, currentLeft, currentRight) {
  const opts = [
    {val:'column', label:'Column (Fixed)', icon:'🔒', desc:'RC column — provides rotation restraint'},
    {val:'wall',   label:'Wall (Pinned)',  icon:'📌', desc:'Masonry wall — no rotation restraint'},
    {val:'free',   label:'Free',           icon:'○',  desc:'Nothing — cantilever tip or free end'},
  ];
  return `<div style="background:var(--bg1);border:1px solid rgba(56,189,248,0.2);border-radius:8px;padding:12px;margin:10px 0">
    <div style="font-size:11px;font-weight:700;color:var(--cyan);margin-bottom:4px">Joint Type — Override End Conditions</div>
    <div style="font-size:10px;color:var(--txt3);margin-bottom:10px">Change if the auto-detected conditions are wrong. Re-run analysis after changing.</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${['left','right'].map(side => `<div>
        <div style="font-size:10px;font-weight:700;color:var(--txt3);margin-bottom:6px">${side.toUpperCase()} END</div>
        ${opts.map(o => {
          const cur = side === 'left' ? currentLeft : currentRight;
          const isChecked = cur === o.val;
          return `<label style="display:flex;align-items:center;gap:8px;padding:5px 7px;margin-bottom:3px;border-radius:6px;cursor:pointer;border:1px solid ${isChecked?'var(--blue)':'transparent'};background:${isChecked?'rgba(56,189,248,0.07)':'transparent'}">
            <input type="radio" name="${side}_${beamId}" value="${o.val}" ${isChecked?'checked':''} onchange="updateBeamJoint('${beamId}','${side}','${o.val}')" style="margin:0;accent-color:var(--blue)">
            <span style="font-size:16px">${o.icon}</span>
            <div><div style="font-size:10px;font-weight:700;color:var(--txt)">${o.label}</div><div style="font-size:9px;color:var(--txt3)">${o.desc}</div></div>
          </label>`;
        }).join('')}
      </div>`).join('')}
    </div>
    <div id="joint_changed_${beamId}" style="display:none;margin-top:8px;padding:6px 10px;background:rgba(245,158,11,0.1);border:1px solid #f59e0b;border-radius:5px;font-size:10px;color:#fcd34d">
      Joint type changed. Re-run analysis (Step 6) to update all calculations.
    </div>
  </div>`;
}

function updateBeamJoint(beamId, side, value) {
  if (!GRID) return;
  const beam = GRID.beams.find(b => String(b.id) === String(beamId));
  if (beam) {
    if (side === 'left')  beam.endLeft  = value;
    if (side === 'right') beam.endRight = value;
  }
  const note = document.getElementById('joint_changed_' + beamId);
  if (note) note.style.display = 'block';
}


// == 15_step_by_step.js ==

// ================================================================
// MODULE: 15_step_by_step
// Proper step-by-step calculations:
// Each step = What is this? → Why calculate it? → Formula with units
// → Each term explained → Substitute values → Answer
// ================================================================

function stepBox(id, title, steps) {
  const html = steps.map((st, i) => `
    <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--bg3)">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <div style="min-width:28px;height:28px;border-radius:50%;background:var(--blue);color:#000;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:800;color:var(--txt);margin-bottom:4px">${st.title}</div>
          ${st.what ? `<div style="font-size:11px;color:var(--txt2);margin-bottom:5px;line-height:1.6"><strong style="color:var(--teal)">What is this?</strong> ${st.what}</div>` : ''}
          ${st.why  ? `<div style="font-size:11px;margin-bottom:6px;padding:5px 8px;background:rgba(52,211,153,0.07);border-radius:4px;line-height:1.6"><strong style="color:#34d399">Why calculate it?</strong> <span style="color:var(--txt2)">${st.why}</span></div>` : ''}
          ${st.formula ? `
            <div style="margin-bottom:6px;padding:8px 12px;background:rgba(56,189,248,0.07);border:1px solid rgba(56,189,248,0.15);border-radius:6px">
              <div style="font-size:9px;font-weight:700;color:var(--cyan);margin-bottom:4px;letter-spacing:0.5px">FORMULA</div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--blue)">${st.formula}</div>
            </div>` : ''}
          ${st.terms ? `
            <div style="margin-bottom:6px;padding:7px 10px;background:var(--bg1);border-radius:6px">
              <div style="font-size:9px;font-weight:700;color:var(--txt3);margin-bottom:4px;letter-spacing:0.5px">TERMS</div>
              ${st.terms.map(t => `<div style="font-size:10px;color:var(--txt2);padding:2px 0;display:flex;gap:8px"><span style="font-family:var(--mono);color:var(--orange);min-width:80px;flex-shrink:0">${t[0]}</span><span>${t[1]}</span></div>`).join('')}
            </div>` : ''}
          ${st.sub ? `
            <div style="margin-bottom:6px;padding:7px 10px;background:rgba(251,146,60,0.07);border:1px solid rgba(251,146,60,0.15);border-radius:6px">
              <div style="font-size:9px;font-weight:700;color:var(--orange);margin-bottom:4px;letter-spacing:0.5px">SUBSTITUTING VALUES</div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--orange)">${st.sub}</div>
            </div>` : ''}
          ${st.answer ? `
            <div style="padding:8px 12px;background:rgba(56,189,248,0.12);border-left:3px solid var(--blue);border-radius:0 6px 6px 0">
              <div style="font-size:9px;font-weight:700;color:var(--cyan);margin-bottom:2px;letter-spacing:0.5px">RESULT</div>
              <div style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--txt)">${st.answer}</div>
            </div>` : ''}
        </div>
      </div>
    </div>`).join('');

  return `<details style="margin:12px 0;border:1px solid rgba(56,189,248,0.2);border-radius:10px;overflow:hidden">
    <summary style="padding:11px 14px;cursor:pointer;background:rgba(56,189,248,0.05);display:flex;align-items:center;gap:8px;list-style:none">
      <span style="font-size:16px">📖</span>
      <span style="font-size:11px;font-weight:700;color:var(--blue)">${title}</span>
      <span style="margin-left:auto;font-size:10px;color:var(--txt3)">▼ click to expand</span>
    </summary>
    <div style="padding:16px;background:var(--bg0)">${html}</div>
  </details>`;
}

// ── BEAM STEP-BY-STEP ──────────────────────────────────────────
function beamStepByStep(b) {
  const alpha = b.Mmax / (b.wu * b.L * b.L);
  const alphaFrac = Math.abs(alpha - 1/16) < 0.002 ? '1/16'
    : Math.abs(alpha - 1/10) < 0.002 ? '1/10'
    : Math.abs(alpha - 1/8)  < 0.005 ? '1/8'
    : Math.abs(alpha - 1/2)  < 0.01  ? '1/2'
    : r2(alpha);
  const Ec = r0(5000 * Math.sqrt(S.fck));
  const I  = r0(b.b * b.D * b.D * b.D / 12);

  const steps = [
    {
      title: 'Effective Depth d',
      what: 'd is the distance from the compression face of the beam to the centroid of the tension steel. It is the "working depth" — the actual lever arm available for the moment couple.',
      why: 'All moment capacity and steel area formulas use d, not D (overall depth). A larger d means more lever arm = more moment capacity with the same steel.',
      formula: 'd = D - cover - stirrup_dia - half_main_bar_dia  [mm]',
      terms: [
        ['D', `Overall depth = ${b.D} mm`],
        ['cover', `Nominal cover = ${S.coverBeam} mm (IS 456 Table 16, moderate exposure)`],
        ['stirrup_dia', '8 mm (T8 stirrups used)'],
        ['half_main_bar', '10 mm (half of T20 = 20/2)'],
      ],
      sub: `d = ${b.D} - ${S.coverBeam} - 8 - 10`,
      answer: `d = ${b.d} mm`,
    },
    {
      title: 'Factored Load wu (kN/m)',
      what: 'wu is the total design load per unit length of beam, already multiplied by the load factor 1.5 (IS 456 Cl 18.2). It includes slab load, beam self-weight, and wall load if any.',
      why: 'All structural checks use factored loads — we design for the worst realistic load, not the average expected load. The factor 1.5 covers uncertainties in load estimation and material variability.',
      formula: 'wu = 1.5 × (w_slab + w_selfweight + w_wall)  [kN/m]',
      terms: [
        ['w_slab', `(DL + FF + PL + LL) × trib = (${r2(RES.slab.DL_sl)} + ${S.floorFinish} + ${S.partitions} + ${S.udlLL}) × ${r2(b.trib)} = ${r2(b.wslab)} kN/m`],
        ['w_sw', `(b/1000) × (D/1000) × 25 = (${b.b}/1000) × (${b.D}/1000) × 25 = ${r2(b.wsw)} kN/m`],
        ['w_wall', b.ww > 0 ? `${r2(b.ww)} kN/m (edge beam carries wall load)` : '0 (not an edge beam)'],
        ['1.5', 'Load factor for DL + LL combination (IS 456 Table 18)'],
      ],
      sub: `wu = 1.5 × (${r2(b.wslab)} + ${r2(b.wsw)}${b.ww > 0 ? ' + ' + r2(b.ww) : ''})`,
      answer: `wu = ${r2(b.wu)} kN/m`,
    },
    {
      title: 'Design Bending Moment Mu (kN.m)',
      what: 'Mu is the maximum factored bending moment the beam must resist. It depends on the loading (wu), span (L), and how the ends are supported (joint type — see Joint Types section).',
      why: 'Bending moment is what causes the beam to try to "snap" at its weakest point. The steel must provide enough tensile force to resist this moment.',
      formula: 'Mu = alpha × wu × L²  [kN.m]',
      terms: [
        ['alpha', `${alphaFrac} — IS 456 Table 12 moment coefficient for ${b.endCond || 'this end condition'}`],
        ['wu', `${r2(b.wu)} kN/m — factored UDL from Step 2`],
        ['L', `${b.L} m — effective span of beam`],
        ['L²', `${b.L}² = ${r2(b.L * b.L)} m²`],
      ],
      sub: `Mu = ${alphaFrac} × ${r2(b.wu)} × ${b.L}²  =  ${alphaFrac} × ${r2(b.wu)} × ${r2(b.L * b.L)}`,
      answer: `Mu = ${r2(b.Mmax)} kN.m (midspan, sagging)${b.Msup > 0 ? ` | M_support = ${r2(b.Msup)} kN.m (hogging)` : ''}`,
    },
    {
      title: 'Limiting Moment Capacity Mulim (kN.m)',
      what: 'Mulim is the maximum moment a singly reinforced section of this size can carry without the concrete crushing before the steel yields. If Mu > Mulim, the section is "doubly reinforced" (compression steel needed) or the depth must increase.',
      why: 'We want the steel to yield before the concrete crushes — this gives ductile failure with visible cracking, not sudden brittle collapse. IS 456 limits the neutral axis depth to ensure this.',
      formula: 'Mulim = Mf × fck × b × d²  [N.mm] ÷ 1×10⁶ → [kN.m]',
      terms: [
        ['Mf', `${r2(RES.mat.Mf)} — IS 456 Annex G, = 0.36×(xu/d)×(1 - 0.42×xu/d), limiting neutral axis`],
        ['fck', `${S.fck} N/mm² — characteristic cylinder strength of M${S.fck} concrete`],
        ['b', `${b.b} mm — beam width`],
        ['d²', `${b.d}² = ${r0(b.d * b.d)} mm²`],
      ],
      sub: `Mulim = ${r2(RES.mat.Mf)} × ${S.fck} × ${b.b} × ${b.d}² ÷ 1,000,000`,
      answer: `Mulim = ${r2(b.Mulim)} kN.m  →  ${b.singly ? 'Mu (' + r2(b.Mmax) + ') ≤ Mulim (' + r2(b.Mulim) + ')  SINGLY REINFORCED OK' : 'Mu > Mulim — section depth has been increased automatically'}`,
    },
    {
      title: 'Required Steel Area Ast (mm²)',
      what: 'Ast is the cross-sectional area of tension steel bars needed at the bottom of the beam to resist the bending moment Mu. It is derived from IS 456 Annex G — equilibrium of the section.',
      why: 'Concrete cannot carry tension. Steel bars at the bottom take all the tension force. The required area tells us how many bars of what diameter to provide.',
      formula: 'Ast = Mu×10⁶ / [0.87×fy×d×(1 - Mu×10⁶/(0.36×fck×b×d×0.48×d))]  [mm²]',
      terms: [
        ['0.87×fy', `0.87 × ${S.fy} = ${r0(0.87*S.fy)} N/mm² — design strength of steel (fy/1.15)`],
        ['d', `${b.d} mm — effective depth`],
        ['Mu×10⁶', `${r2(b.Mmax)} × 10⁶ = ${r0(b.Mmax*1e6)} N.mm (converting kN.m to N.mm)`],
        ['0.36×fck×b×0.48×d', 'Concrete compression force parameters (IS 456 Annex G)'],
      ],
      sub: `Required Ast = ${r0(b.Am)} mm²\nUsing T20 bars: area per bar = π/4 × 20² = 314 mm²\nNumber of bars = ceil(${r0(b.Am)} / 314) = ${b.nm} bars`,
      answer: `Provide ${b.nm}-T20 at bottom  →  Ast_provided = ${b.nm} × 314 = ${r0(b.nm*314)} mm²  (needed ${r0(b.Am)} mm²)`,
    },
    {
      title: 'Shear Force and Stirrup Design',
      what: 'Shear force V is the vertical force trying to slide the beam apart near the supports. Shear stress tv = V/(b×d). If tv exceeds the concrete capacity tc, stirrups must carry the excess shear.',
      why: 'Shear failure is sudden and brittle — no warning. Stirrups (closed rectangular bars) hold the beam together and prevent diagonal tension cracks from splitting the beam.',
      formula: 'tv = Vmax × 1000 / (b × d)  [N/mm²]',
      terms: [
        ['Vmax', `${r2(b.RA)} kN — maximum shear at support = wu×L/2 or per IS 456 T13`],
        ['×1000', 'Converting kN to N'],
        ['b × d', `${b.b} × ${b.d} = ${r0(b.b*b.d)} mm²`],
        ['tc_max', `${r2(b.tcmax)} N/mm² — absolute maximum shear stress for M${S.fck} (IS 456 Table 20 = 0.62×sqrt(fck))`],
      ],
      sub: `tv = ${r2(b.RA)} × 1000 / (${b.b} × ${b.d})  =  ${r2(b.RA*1000)} / ${r0(b.b*b.d)}`,
      answer: `tv = ${r2(b.tv)} N/mm²  ${b.tv <= b.tcmax ? '≤' : '>'} tc_max = ${r2(b.tcmax)} N/mm²  →  ${b.shearSafe ? 'Section size OK' : 'SECTION TOO SMALL — increase b or d'}\nStirrup spacing: T8@${b.svd}mm in end zone (${r0(Math.max(2*b.D,b.L*1000/4))}mm) | T8@${b.sv}mm in middle`,
    },
    {
      title: 'Deflection Check',
      what: 'We calculate how much the beam sags at midspan under the factored load, using elastic beam theory. This must be within IS 456 limits to avoid cracking of finishes.',
      why: 'Excessive deflection cracks floor tiles, plaster, and partition walls — even if the beam is structurally safe. The limit L/250 ensures visible deflection does not occur.',
      formula: 'delta = 5 × wu × L⁴ / (384 × EI)  [mm]',
      terms: [
        ['5/384', 'Coefficient for UDL on simply/continuously supported beam (elastic theory)'],
        ['wu', `${r2(b.wu)} kN/m = ${r2(b.wu)} N/mm (since 1 kN/m = 1 N/mm)`],
        ['L⁴', `(${b.L} × 1000)⁴ = ${b.L}⁴ × 10¹² mm⁴`],
        ['E', `Ec = 5000×sqrt(${S.fck}) = ${Ec} N/mm² (IS 456 Cl 6.2.3.1)`],
        ['I', `b×D³/12 = ${b.b}×${b.D}³/12 = ${I} mm⁴`],
        ['EI', `${Ec} × ${I} = ${r2(b.EI * 1e12)} N.mm²`],
        ['delta_allow', `L/250 = ${b.L*1000}/250 = ${r2(b.dall)} mm (IS 456 Cl 23.2a)`],
      ],
      sub: `delta = 5 × ${r2(b.wu)} × (${b.L}×1000)⁴ / (384 × ${Ec} × ${I})`,
      answer: `delta = ${r2(b.dfl)} mm  ${b.deflOK ? '≤' : '>'}  delta_allow = ${r2(b.dall)} mm (L/250)  →  ${b.deflOK ? 'PASS' : 'FAIL — increase depth D'}`,
    },
  ];
  return stepBox('beam_' + (b.id !== undefined ? b.id : BIDX), 'Step-by-Step Beam Design Calculations (Beginner Guide)', steps);
}

// ── SLAB STEP-BY-STEP ──────────────────────────────────────────
function slabStepByStep(sl) {
  const steps = [
    {
      title: 'Slab Type — One-way or Two-way?',
      what: 'If ly/lx < 2, the slab bends in both directions and is called two-way. If ly/lx ≥ 2, it mainly bends in one direction (the shorter span) and is one-way.',
      why: 'This determines which IS 456 table to use for moment coefficients — Table 26 for two-way, simple formula for one-way. Two-way slabs need steel in both directions.',
      formula: 'ratio = ly / lx  [dimensionless]',
      terms: [
        ['ly', `${r2(sl.ly)} m — longer span`],
        ['lx', `${r2(sl.lx)} m — shorter span`],
      ],
      sub: `ratio = ${r2(sl.ly)} / ${r2(sl.lx)}`,
      answer: `ratio = ${r2(sl.ratio)}  →  ${sl.twoWay ? 'Two-way slab (ratio < 2.0)' : 'One-way slab (ratio ≥ 2.0)'}`,
    },
    {
      title: 'Minimum Slab Thickness D (mm)',
      what: 'IS 456 Cl 23.2 gives a span-to-depth ratio (l/d) limit of 26 for simply supported slabs and up to 32 for continuous. This ensures deflection is acceptable without a detailed check.',
      why: 'Thinner slabs are cheaper but deflect more. If l/d exceeds the limit, the slab will crack and show visible sagging. The minimum thickness also ensures fire resistance and cover.',
      formula: 'd_min = lx × 1000 / 26  →  D = d_min + cover + half_bar_dia  [mm]',
      terms: [
        ['lx', `${r2(sl.lx)} m — shorter span (governs for two-way)`],
        ['26', 'IS 456 Table 23 limit for continuous/two-way slabs'],
        ['cover', `${S.coverSlab} mm (IS 456 Table 16, moderate exposure)`],
        ['half_bar', '5 mm (half of T10 = 10/2)'],
      ],
      sub: `d_min = ${r2(sl.lx)} × 1000 / 26 = ${r0(sl.lx*1000/26)} mm\nD = ${r0(sl.lx*1000/26)} + ${S.coverSlab} + 5 = ${r0(sl.lx*1000/26+S.coverSlab+5)} mm → round up to ${sl.slabD} mm`,
      answer: `D = ${sl.slabD} mm  |  d_eff = ${sl.slabd} mm  |  l/d = ${r2(sl.lx*1000/sl.slabd)} ${sl.ld_ok ? '≤ 26 OK' : '> 26 FAIL — increase D'}`,
    },
    {
      title: 'Factored Load wu (kN/m²)',
      what: 'wu is the total design load per square metre of slab, multiplied by the safety factor 1.5. It includes self-weight of slab, floor finish, partition load, and live load.',
      why: 'We design for the worst realistic load. The 1.5 factor covers overloading and material variation. All moment calculations use wu.',
      formula: 'wu = 1.5 × (DL_slab + FF + PL + LL)  [kN/m²]',
      terms: [
        ['DL_slab', `(D/1000) × 25 = (${sl.slabD}/1000) × 25 = ${r2(sl.DL_sl)} kN/m²`],
        ['FF', `Floor finish = ${S.floorFinish} kN/m²`],
        ['PL', `Partition load = ${S.partitions} kN/m²`],
        ['LL', `Live load = ${S.udlLL} kN/m²`],
        ['1.5', 'IS 456 Cl 18.2 — load factor for DL+LL combination'],
      ],
      sub: `wu = 1.5 × (${r2(sl.DL_sl)} + ${S.floorFinish} + ${S.partitions} + ${S.udlLL})  =  1.5 × ${r2(sl.DL_sl+S.floorFinish+S.partitions+S.udlLL)}`,
      answer: `wu = ${r2(sl.wu_sl)} kN/m²`,
    },
    {
      title: 'Design Bending Moment Mx and My (kN.m/m)',
      what: 'Mx is the moment per metre width in the shorter-span direction (main steel direction). My is the moment in the longer-span direction. These are found using IS 456 Table 26 coefficients for two-way slabs, or wL²/8 for one-way.',
      why: 'The moments tell us the tension force the steel must carry. Higher moment = more steel. IS 456 Table 26 gives different coefficients for 9 different edge conditions.',
      formula: sl.twoWay ? 'Mx = alphax × wu × lx²  |  My = alphay × wu × lx²  [kN.m/m]' : 'Mx = wu × lx² / 8  [kN.m/m]',
      terms: sl.twoWay ? [
        ['alphax', `${r2(sl.ax)} — IS 456 Table 26, Case ${sl.slabCase}, shorter span coefficient`],
        ['alphay', `${r2(sl.ay)} — IS 456 Table 26, Case ${sl.slabCase}, longer span coefficient`],
        ['wu', `${r2(sl.wu_sl)} kN/m²`],
        ['lx²', `${r2(sl.lx)}² = ${r2(sl.lx*sl.lx)} m²`],
      ] : [
        ['1/8', 'Simply supported coefficient'],
        ['wu', `${r2(sl.wu_sl)} kN/m²`],
        ['lx²', `${r2(sl.lx)}² = ${r2(sl.lx*sl.lx)} m²`],
      ],
      sub: sl.twoWay
        ? `Mx = ${r2(sl.ax)} × ${r2(sl.wu_sl)} × ${r2(sl.lx*sl.lx)}\nMy = ${r2(sl.ay)} × ${r2(sl.wu_sl)} × ${r2(sl.lx*sl.lx)}`
        : `Mx = ${r2(sl.wu_sl)} × ${r2(sl.lx*sl.lx)} / 8`,
      answer: `Mx = ${r2(sl.Mx)} kN.m/m  |  My = ${r2(sl.My)} kN.m/m`,
    },
    {
      title: 'Steel Area Ast_x and Spacing (mm²/m)',
      what: 'Ast_x is the required area of main steel per metre width of slab in the shorter span direction. We then select a bar diameter and calculate the spacing to provide this area.',
      why: 'The steel carries the tension from bending. Area controls strength; spacing controls crack width. IS 456 limits minimum steel to 0.12% of gross area to prevent shrinkage cracking.',
      formula: 'Spacing = 1000 × Abar / Ast_req  [mm]  where Abar = π/4 × dia²',
      terms: [
        ['Ast_req_x', `${r0(sl.Ax)} mm²/m — from IS 456 Annex G using Mx = ${r2(sl.Mx)} kN.m/m`],
        ['Ast_min', `0.12% × 1000 × D = 0.12/100 × 1000 × ${sl.slabD} = ${r0(0.12*1000*sl.slabD/100)} mm²/m`],
        ['T10 bar area', 'π/4 × 10² = 78.5 mm²'],
        ['Spacing', `1000 × 78.5 / ${r0(sl.Ax)} = ${r0(1000*78.5/sl.Ax)} mm → use ${sl.spx}mm`],
      ],
      sub: `Ast_req_x = max(${r0(sl.Ax)}, ${r0(0.12*1000*sl.slabD/100)}) = ${r0(sl.Ax)} mm²/m\nSpacing = 1000 × 78.5 / ${r0(sl.Ax)} = ${r0(1000*78.5/sl.Ax)} mm`,
      answer: `Main steel X: T10@${sl.spx}mm c/c  →  Ast_prov = ${r0(1000*78.5/sl.spx)} mm²/m\nDist steel Y: T8@${sl.spy}mm c/c  →  Ast_prov = ${r0(1000*50.3/sl.spy)} mm²/m`,
    },
  ];
  return stepBox('slab', 'Step-by-Step Slab Design Calculations (Beginner Guide)', steps);
}

// ── COLUMN STEP-BY-STEP ────────────────────────────────────────
function colStepByStep(c) {
  const steps = [
    {
      title: 'Service Load Ps (kN) — Cumulative Load from All Floors',
      what: 'Ps is the total unfactored (service) vertical load that this column carries, accumulated from all floors above it. It includes slab+beam dead load, live load, and wall load from each floor.',
      why: 'We must know the total load the column carries to size it correctly. A ground floor column carries the load of every single floor above it — it is the most heavily loaded member.',
      formula: 'Ps = floors × (DL + LL) × trib_area  [kN]',
      terms: [
        ['floors', `${c.floor} floors above this column`],
        ['DL+LL', `Total load per m² ≈ ${r0((c.Ps/c.floor/c.ta))} kN/m² (slab DL + FF + PL + 0.25×LL)`],
        ['trib_area', `${r2(c.ta)} m² — tributary floor area (area of slab the column supports)`],
        ['0.25×LL', 'IS 456 Cl 7.3.1 — only 25% of live load is used for seismic weight (also applied here for simplicity)'],
      ],
      sub: `Ps ≈ ${c.floor} × ${r0(c.Ps/c.floor/c.ta)} × ${r2(c.ta)}`,
      answer: `Ps = ${r2(c.Ps)} kN`,
    },
    {
      title: 'Factored Load Pu (kN)',
      what: 'Pu is the design load — the service load multiplied by the safety factor 1.5 (IS 456 Cl 18.2). This is what the column must be designed to carry.',
      why: 'The 1.5 factor accounts for possible overloading (more people, furniture, water tanks) and material variability. All capacity checks use Pu.',
      formula: 'Pu = 1.5 × Ps  [kN]',
      terms: [['Ps', `${r2(c.Ps)} kN — service load from Step 1`], ['1.5', 'IS 456 load factor, DL+LL combination']],
      sub: `Pu = 1.5 × ${r2(c.Ps)}`,
      answer: `Pu = ${r2(c.Pu)} kN`,
    },
    {
      title: 'Column Size — Gross Area Ag (mm²)',
      what: 'We choose the column cross-section size by rearranging the IS 456 short column capacity formula. We assume a trial steel ratio (pt = 1%) and solve for the required area.',
      why: 'The column must have enough concrete + steel area to carry Pu without crushing. IS 456 Cl 39.3 gives the formula for short column capacity.',
      formula: 'Pu ≤ 0.4×fck×Ac + 0.67×fy×Asc  [N] → solve for Ag = Ac + Asc',
      terms: [
        ['0.4×fck', `0.4 × ${S.fck} = ${r2(0.4*S.fck)} N/mm² — concrete contribution (IS 456 Cl 39.3)`],
        ['0.67×fy', `0.67 × ${S.fy} = ${r2(0.67*S.fy)} N/mm² — steel contribution`],
        ['Size', `sqrt(Ag) → rounded to ${c.size}mm. Min 300mm in seismic zones (IS 13920 Cl 7.1.2)`],
      ],
      sub: `Required Ag ≈ ${r0(c.Ag)} mm²\nSide = sqrt(${r0(c.Ag)}) = ${r0(Math.sqrt(c.Ag))} mm → use ${c.size} mm`,
      answer: `Column size: ${c.size} × ${c.size} mm  |  Ag = ${r0(c.Ag)} mm²`,
    },
    {
      title: 'Longitudinal Steel Asc (mm²)',
      what: 'Asc is the total area of vertical bars running through the column. These bars carry both axial load and bending moment from earthquakes.',
      why: 'IS 456 Cl 26.5.3.1: minimum 0.8% of Ag prevents sudden brittle failure. Maximum 4% prevents bar congestion during casting.',
      formula: 'Asc = pt% × Ag / 100  [mm²]  →  choose bars',
      terms: [
        ['Ag', `${r0(c.Ag)} mm² — gross area of column`],
        ['Asc_min', `0.8% × ${r0(c.Ag)} = ${r0(0.008*c.Ag)} mm²`],
        ['T'+c.dB+' bar area', `π/4 × ${c.dB}² = ${r0(Math.PI*c.dB*c.dB/4)} mm²`],
        ['nb', `${c.nb} bars provided → Asc = ${r0(c.Aprov)} mm² → pt = ${r2(c.pt)}%`],
      ],
      sub: `${c.nb}-T${c.dB}: Asc_prov = ${c.nb} × ${r0(Math.PI*c.dB*c.dB/4)} = ${r0(c.Aprov)} mm²`,
      answer: `${c.nb}-T${c.dB}  |  Asc = ${r0(c.Aprov)} mm²  |  pt = ${r2(c.pt)}%  |  Capacity = ${r2(c.Pcap)} kN  ${c.safe ? '≥' : '<'} Pu = ${r2(c.Pu)} kN  →  ${c.safe ? 'SAFE' : 'UNSAFE'}`,
    },
    {
      title: 'Lateral Ties — General and Confinement Zones',
      what: 'Lateral ties (closed rectangular bars) are placed around the longitudinal bars at regular intervals. General ties prevent bar buckling. Confinement zone ties (at top and bottom of each floor height) provide ductility in earthquakes.',
      why: 'During an earthquake, the column ends are subjected to reversed bending. Closely-spaced ties confine the concrete (prevent it from exploding outward) and allow large deformations without collapse. This is the key to seismic-resistant design.',
      formula: 'General spacing: min(b, 16φ, 300)  |  Lo zone spacing: min(b/4, 6φ, 100)',
      terms: [
        ['General sv', `min(${c.size}, 16×${c.dB}, 300) = min(${c.size}, ${16*c.dB}, 300) = ${c.ts} mm`],
        ['Lo', `max(b, H/6, 450) = max(${c.size}, ${r0(S.floorHt*1000/6)}, 450) = ${r0(c.Lo)} mm from each end`],
        ['Lo spacing', `min(${c.size}/4, 6×${c.dB}, 100) = ${c.tsc} mm — very tight (IS 13920 Cl 7.4)`],
        ['135° hooks', 'MANDATORY — 90° hooks straighten out in earthquake and fail (IS 13920 Cl 7.4.7)'],
      ],
      sub: `General zone: T8@${c.ts}mm\nConfinement zone Lo=${r0(c.Lo)}mm from each end: T8@${c.tsc}mm (135° hooks)`,
      answer: `Ties: T8@${c.ts}mm (general) | T8@${c.tsc}mm in Lo=${r0(c.Lo)}mm from top and bottom of each storey`,
    },
  ];
  return stepBox('col_' + c.floor + (c.corner?'C':c.edge?'E':'I'), 'Step-by-Step Column Design Calculations (Beginner Guide)', steps);
}

// ── FOOTING STEP-BY-STEP ───────────────────────────────────────
function ftgStepByStep(f) {
  const steps = [
    {
      title: 'Net Safe Bearing Capacity SBC_net (kN/m²)',
      what: 'SBC_net is the soil pressure available for the structural load only. We subtract the weight of soil above the footing base because that weight was already on the soil before construction.',
      why: 'Using gross SBC would double-count the overburden weight. The net SBC gives a more accurate (and slightly less conservative) footing size.',
      formula: 'SBC_net = SBC_gross - gamma_soil × Df  [kN/m²]',
      terms: [
        ['SBC_gross', `${S.soilBearing} kN/m² — from soil investigation report`],
        ['gamma_soil', '18 kN/m³ — unit weight of soil (typical)'],
        ['Df', `${S.ftgDepth} m — depth of footing below ground level`],
      ],
      sub: `SBC_net = ${S.soilBearing} - 18 × ${S.ftgDepth}`,
      answer: `SBC_net = ${r2(S.soilBearing - 18*S.ftgDepth)} kN/m²`,
    },
    {
      title: 'Footing Plan Size B (m)',
      what: 'B is the side of the square footing. We find the minimum area needed so the actual soil pressure does not exceed SBC_net, then take the square root to get B.',
      why: 'If the footing is too small, the soil pressure under it exceeds the safe limit and the soil fails — the building settles or tilts.',
      formula: 'B = sqrt(Ps / SBC_net)  [m]  → round up to nearest 100mm',
      terms: [
        ['Ps', `${r2(f.Ps)} kN — total service load on this footing`],
        ['SBC_net', `${r2(S.soilBearing - 18*S.ftgDepth)} kN/m²`],
        ['Area_req', `${r2(f.Ps)} / ${r2(S.soilBearing - 18*S.ftgDepth)} = ${r2(f.Ps/(S.soilBearing - 18*S.ftgDepth))} m²`],
      ],
      sub: `B = sqrt(${r2(f.Ps)} / ${r2(S.soilBearing - 18*S.ftgDepth)}) = sqrt(${r2(f.Ps/(S.soilBearing-18*S.ftgDepth))})`,
      answer: `B = ${r2(Math.sqrt(f.Ps/(S.soilBearing-18*S.ftgDepth)))} m → use ${r2(f.Bf)} m  (footing: ${r2(f.Bf)}m × ${r2(f.Bf)}m)`,
    },
    {
      title: 'Factored Soil Pressure qu_f (kN/m²)',
      what: 'qu_f is the upward pressure from the soil under the footing when the factored load Pu acts. It is the load the footing slab must resist as an upward force.',
      why: 'The footing slab acts like an inverted slab with upward soil pressure. This pressure is what we use to design the footing depth and reinforcement.',
      formula: 'qu_f = 1.5 × Ps / (B × B)  [kN/m²]',
      terms: [
        ['1.5', 'Load factor (IS 456 Cl 18.2)'],
        ['Ps', `${r2(f.Ps)} kN`],
        ['B²', `${r2(f.Bf)}² = ${r2(f.Bf*f.Bf)} m²`],
      ],
      sub: `qu_f = 1.5 × ${r2(f.Ps)} / ${r2(f.Bf*f.Bf)}`,
      answer: `qu_f = ${r2(f.quf)} kN/m²`,
    },
    {
      title: 'Punching Shear Check — Most Critical (IS 456 Cl 31.6)',
      what: 'Punching shear is the tendency of the column to punch through the footing like a cookie cutter. The critical perimeter is at d/2 from the column face all around. The shear stress on this perimeter must not exceed 0.25×sqrt(fck).',
      why: 'Punching failure is SUDDEN with no warning — the column punches straight through. This single check usually governs footing depth — it is more critical than bending in most cases.',
      formula: 'tv_punch = Vu / (bo × d)  [N/mm²]  where bo = 4 × (col_size + d)',
      terms: [
        ['Vu', `${r2(f.Vpu)} kN — punching shear = Pu - qu_f × (col + d)² = ${r2(f.quf)} × (${f.col || 300}/1000 + ${r0(f.d)}/1000)²`],
        ['bo', `4 × (col + d) = 4 × (${f.col||300} + ${r0(f.d)}) = ${r0(f.bo)} mm (perimeter at d/2 from column)`],
        ['d', `${r0(f.d)} mm (effective depth = D - 75 - 8)`],
        ['tv_allow', `0.25 × sqrt(${S.fck}) = ${r2(f.tcp)} N/mm²`],
        ['×1000', 'kN → N conversion'],
      ],
      sub: `tv = ${r2(f.Vpu)} × 1000 / (${r0(f.bo)} × ${r0(f.d)})`,
      answer: `tv = ${r2(f.tvp)} N/mm²  ${f.punch_ok ? '≤' : '>'}  tc = ${r2(f.tcp)} N/mm²  →  ${f.punch_ok ? 'PASS' : 'FAIL — increase D'}`,
    },
    {
      title: 'Bending Moment and Reinforcement (IS 456 Cl 34.2.3)',
      what: 'The footing cantilevers out from the column face in both directions. The critical section for bending is at the column face. The moment here is caused by the upward soil pressure on the cantilever portion.',
      why: 'The footing slab acts like a cantilever — the soil pushes it up, the column holds it down. The footing bars must carry the tension from this bending (at the bottom).',
      formula: 'M = qu_f × B × x² / 2  [kN.m]  where x = (B - col_size/1000) / 2',
      terms: [
        ['x', `(${r2(f.Bf)} - ${f.col||300}/1000) / 2 = ${r2((f.Bf-(f.col||300)/1000)/2)} m — cantilever projection`],
        ['qu_f × B', `${r2(f.quf)} × ${r2(f.Bf)} = ${r2(f.quf*f.Bf)} kN/m`],
        ['Steel spacing', `T${f.dBf}@${f.spf}mm c/c both ways`],
      ],
      sub: `Mu = ${r2(f.quf)} × ${r2(f.Bf)} × ${r2((f.Bf-(f.col||300)/1000)/2)}² / 2`,
      answer: `Mu = ${r2(f.Mu)} kN.m  →  Ast = ${r0(f.Af)} mm²  →  T${f.dBf}@${f.spf}mm (both directions, bottom)\nDevelopment length: need ${r0(f.Ldr)}mm, available ${r0(f.Lda)}mm → ${f.Ld_ok ? 'OK' : 'Provide 90° hook'}`,
    },
  ];
  return stepBox('ftg_' + (f.lbl||'').replace(/\s/g,''), 'Step-by-Step Footing Design Calculations (Beginner Guide)', steps);
}


// == 16_improvements.js ==

// ================================================================
// MODULE: 16_improvements — Design Improvement Suggestions Page
// Identifies over-design, under-design, uneconomical choices
// and suggests specific changes with reasoning
// ================================================================

function secImprovements() {
  if (!RES) return '<div class="card"><div class="ct">Design Improvements</div><div class="cd">Run analysis first to generate improvement suggestions.</div></div>';

  const sl = RES.slab;
  const beams = RES.beams || [];
  const cols = RES.cols || [];
  const ftgs = RES.ftgs || [];
  const suggestions = [];

  // ── Slab checks ───────────────────────────────────────────────
  const slabExcessD = sl.slabD > Math.ceil((sl.lx*1000/26 + S.coverSlab + 5)/25)*25 + 25;
  if (slabExcessD) {
    const optD = Math.ceil((sl.lx*1000/26 + S.coverSlab + 5)/25)*25;
    suggestions.push({
      member: 'Slab', type: 'reduce', priority: 'medium',
      title: 'Slab thickness can be reduced',
      issue: `Your slab is ${sl.slabD}mm. IS 456 requires only D_min = ${optD}mm for your ${r2(sl.lx)}m span.`,
      fix: `Reduce slab thickness to ${optD}mm.`,
      saving: `Saves ${r2((sl.slabD - optD)/1000 * S.buildingL * S.buildingW * 25)} kN of dead load per floor. Reduces beam loads, column loads, and footing sizes — a cascade effect.`,
      howTo: 'Change slab thickness in Materials input. Re-run analysis. Verify l/d check still passes.',
    });
  }

  // ── Beam checks ───────────────────────────────────────────────
  beams.forEach((b, bi) => {
    const label = b.label || `Beam ${bi+1}`;
    const dMin = Math.ceil(b.L*1000/12/25)*25;
    const dEco = Math.ceil(b.L*1000/10/25)*25;

    // Over-deep beam
    if (b.deflOK && b.shearSafe && b.D > dEco + 75 && b.pt < 0.5) {
      suggestions.push({
        member: label, type: 'reduce', priority: 'low',
        title: `Beam depth D=${b.D}mm is larger than needed`,
        issue: `Your beam is ${b.D}mm deep for a ${b.L}m span. Steel ratio pt=${r2(b.pt)}% is very low — the beam is oversized. Economical depth is ${dMin}–${dEco}mm.`,
        fix: `Try reducing depth to D=${dEco}mm and re-running analysis.`,
        saving: `Reduced self-weight (${r2((b.D-dEco)/1000 * b.b/1000 * 25)} kN/m less beam SW). Saves formwork cost. Increases headroom.`,
        howTo: 'Override depth in the beam editor or adjust span inputs. Check deflection passes after reduction.',
      });
    }

    // Under-designed (fails)
    if (!b.deflOK) {
      const dNeed = Math.ceil(b.D * Math.pow(b.dfl/b.dall, 1/3) / 25 + 1) * 25;
      suggestions.push({
        member: label, type: 'fix', priority: 'critical',
        title: `Beam FAILS deflection — must fix`,
        issue: `Deflection ${r2(b.dfl)}mm exceeds limit ${r2(b.dall)}mm (L/250). This will cause cracking of floor finishes and visible sagging.`,
        fix: `Option 1 (best): Increase depth to D=${dNeed}mm. Option 2: Add a mid-span support column. Option 3: Change end conditions from simply supported to continuous.`,
        saving: 'N/A — this is a safety and serviceability requirement, not optional.',
        howTo: 'Increase D in beam sizing. Deflection reduces as D³ — a 10% increase in D reduces deflection 27%.',
      });
    }

    if (!b.shearSafe) {
      const bNeed = Math.ceil(b.RA*1000/(b.tcmax*(b.d||200))/25+1)*25;
      suggestions.push({
        member: label, type: 'fix', priority: 'critical',
        title: `Beam FAILS shear — section too small`,
        issue: `Shear stress tv=${r2(b.tv)} N/mm² exceeds tc_max=${r2(b.tcmax)} N/mm². Beam will fail in shear before bending — brittle, sudden failure.`,
        fix: `Increase beam width to b=${bNeed}mm or increase depth D (both reduce shear stress).`,
        saving: 'N/A — mandatory structural fix.',
        howTo: 'Change beam width in inputs. Shear stress = V/(b×d) — wider beam directly reduces tv.',
      });
    }

    // Very high steel ratio
    if (b.pt > 2.5) {
      suggestions.push({
        member: label, type: 'reduce', priority: 'medium',
        title: `High steel ratio pt=${r2(b.pt)}% — consider larger section`,
        issue: `Steel ratio above 2.5% makes placing concrete difficult on site (bar congestion). Maximum practical is 2–2.5%.`,
        fix: `Increase beam depth by ${Math.ceil(b.D*0.15/25)*25}mm. Deeper beam reduces required steel significantly.`,
        saving: 'Easier construction, better concrete quality, reduced long-term cracking risk.',
        howTo: 'Increase D by 50–75mm and re-run. The moment capacity increases as d², so less steel is needed.',
      });
    }

    // Span too long warning
    if (b.L > 7) {
      suggestions.push({
        member: label, type: 'redesign', priority: 'high',
        title: `Span ${b.L}m is too long for a typical residential beam`,
        issue: `Spans above 6–7m are uneconomical for RC beams. The beam gets very deep, heavy, and expensive. Beyond 7m, prestressed concrete or a steel beam is more appropriate.`,
        fix: `Add an intermediate column at midspan to create two ${r2(b.L/2)}m spans. This reduces midspan moment by 75% and deflection by 94%.`,
        saving: `Adding one column (cost: ~Rs 15,000–25,000) saves far more in beam steel and foundation costs.`,
        howTo: 'Add a column in the Plan & Spans editor at the midpoint of this beam.',
      });
    }

    // Joint type suggestion
    if (b.endLeft !== 'column' || b.endRight !== 'column') {
      if (!b.isCantilever) {
        suggestions.push({
          member: label, type: 'redesign', priority: 'medium',
          title: `Joint type is not optimal — consider making ends continuous`,
          issue: `This beam currently uses ${b.endCond||'simply supported'} conditions. If an RC column exists at each end, making both ends continuous (fixed) will reduce midspan moment by 20–38%.`,
          fix: `If columns exist at both ends: set both ends to "Column (Fixed)" in the joint selector. Moment coefficient changes from 1/8 or 1/10 to 1/16.`,
          saving: `Up to ${r0((b.Mmax * 0.38))} kN.m reduction in moment → approximately ${r0(b.nm * 0.3)} fewer T20 bars needed.`,
          howTo: 'Use the joint type selector in the beam detail section, or set end conditions in the Plan & Spans editor.',
        });
      }
    }
  });

  // ── Column checks ─────────────────────────────────────────────
  const groundCols = cols.filter(c => c.floor === 1);
  groundCols.forEach(c => {
    // Over-sized column
    if (c.safe && c.pt < 0.9 && c.size > 300) {
      const optSize = Math.max(300, Math.ceil(Math.sqrt(c.Pu*1000/(0.4*S.fck+0.01*(0.67*S.fy-0.4*S.fck)))/25)*25);
      if (optSize < c.size - 25) {
        suggestions.push({
          member: c.label, type: 'reduce', priority: 'low',
          title: `Column may be over-sized (pt=${r2(c.pt)}% is very low)`,
          issue: `Steel ratio ${r2(c.pt)}% is well below practical minimum of ~1%. This usually means the column is larger than needed. Minimum practical pt is 1–1.5%.`,
          fix: `Try reducing column size to ${optSize}×${optSize}mm and check if capacity still exceeds Pu=${r2(c.Pu)}kN.`,
          saving: `Smaller column saves concrete, reduces footing size, and increases usable floor area.`,
          howTo: 'Manually override column size in inputs. IS 13920 requires minimum 300mm in seismic zones.',
        });
      }
    }

    // Under-designed
    if (!c.safe) {
      suggestions.push({
        member: c.label, type: 'fix', priority: 'critical',
        title: `Column is UNSAFE — Pu=${r2(c.Pu)}kN > Capacity=${r2(c.Pcap)}kN`,
        issue: `The column cannot carry the load above it. This is a structural failure — the column will crush under load.`,
        fix: `Option 1: Increase size to ${c.size+50}×${c.size+50}mm. Option 2: Increase steel to ${Math.min(4,c.pt+1).toFixed(1)}% (add bars). Option 3: Use M${S.fck+5} concrete.`,
        saving: 'N/A — mandatory fix.',
        howTo: 'Increase column size in inputs and re-run analysis.',
      });
    }

    // High slenderness
    if (!c.short) {
      suggestions.push({
        member: c.label, type: 'fix', priority: 'high',
        title: `Column is SLENDER (leff/D=${r2(c.lex)} > 12) — magnified moments`,
        issue: `Slender columns fail by buckling, not crushing. IS 456 Cl 39.7 requires moment magnification for slender columns — this design may be unconservative.`,
        fix: `Increase column size to reduce leff/D below 12. Required size ≥ ${Math.ceil(S.floorHt*1000*0.65/12/25)*25}mm.`,
        saving: 'N/A — structural safety issue.',
        howTo: 'Increase column size. Alternatively add intermediate beams or bracing to reduce effective height.',
      });
    }
  });

  // ── Footing checks ────────────────────────────────────────────
  ftgs.forEach(f => {
    if (!f.punch_ok || !f.ow_ok || !f.Ld_ok) {
      suggestions.push({
        member: f.lbl, type: 'fix', priority: 'critical',
        title: `Footing has failed check — must fix`,
        issue: `Failed: ${!f.punch_ok?'Punching shear ':''}${!f.ow_ok?'One-way shear ':''}${!f.Ld_ok?'Development length':''}`,
        fix: `Option 1: Set "Footing Thickness D override" in Soil & Site to ${Math.ceil(f.D*1.2/25)*25}mm (increases depth). Option 2: Increase column size — bigger column reduces punching stress. Option 3: Increase SBC if soil investigation allows. Option 4: Consider combined/raft footing if adjacent footings overlap (consult engineer).`,
        saving: 'N/A — structural requirement.',
        howTo: 'Go to Soil & Site page → set Footing Thickness D override. Or increase column size in the analysis and re-run.',
      });
    }

    // Oversized footing
    if (f.punch_ok && f.ow_ok && f.tvp < f.tcp * 0.5) {
      suggestions.push({
        member: f.lbl, type: 'reduce', priority: 'low',
        title: `Footing depth may be more than required`,
        issue: `Punching stress tv=${r2(f.tvp)} N/mm² is only ${r0(f.tvp/f.tcp*100)}% of the limit ${r2(f.tcp)} N/mm². Footing depth is conservative.`,
        fix: `Try reducing D to ${Math.ceil(f.D*0.8/25)*25}mm and re-checking.`,
        saving: `Reduces concrete volume by ${r0(20)}% in the footing — significant saving for large footings.`,
        howTo: 'Reduce footing depth in Soil & Site inputs and re-run.',
      });
    }
  });

  // ── General building-level suggestions ────────────────────────
  const allBeamsFail = beams.every(b => !b.deflOK);
  if (allBeamsFail && beams.length > 0) {
    suggestions.push({
      member: 'All Beams', type: 'redesign', priority: 'critical',
      title: 'All beams fail deflection — fundamental layout issue',
      issue: 'When all beams fail, it usually means spans are too long or slab depth is too large (adding too much load). This needs a design review, not just fixing individual beams.',
      fix: '1. Reduce spans by adding intermediate columns. 2. Reduce slab thickness if over-designed. 3. Check if live load is realistic (2 kN/m² for residential is standard).',
      saving: 'Systematic fix saves more than patching each beam individually.',
      howTo: 'Review the Plan & Spans page. Add columns to reduce long spans.',
    });
  }

  // Check if material grade is conservative
  if (S.fck < 25) {
    suggestions.push({
      member: 'Materials', type: 'upgrade', priority: 'medium',
      title: `M${S.fck} concrete — consider upgrading to M25`,
      issue: `M${S.fck} concrete is below the recommended minimum of M25 for RC frame buildings in seismic zones (IS 456 Cl 6.1.2, IS 13920 Cl 5.2).`,
      fix: 'Change concrete grade to M25. This increases beam, column, and footing capacity — you can reduce section sizes.',
      saving: 'Reduces steel requirement by ~8% (through improved shear capacity and development length). Reduces all section sizes.',
      howTo: 'Change fck in Materials input. Re-run analysis. Review if section sizes can be reduced.',
    });
  }

  // ── RENDER ────────────────────────────────────────────────────
  const critical = suggestions.filter(s => s.priority === 'critical');
  const high     = suggestions.filter(s => s.priority === 'high');
  const medium   = suggestions.filter(s => s.priority === 'medium');
  const low      = suggestions.filter(s => s.priority === 'low');

  function card(s) {
    const colors = {
      critical: {border:'#f87171',bg:'rgba(248,113,113,0.06)',badge:'#f87171',badgeBg:'rgba(248,113,113,0.15)'},
      high:     {border:'#f59e0b',bg:'rgba(245,158,11,0.06)', badge:'#f59e0b',badgeBg:'rgba(245,158,11,0.15)'},
      medium:   {border:'#60a5fa',bg:'rgba(96,165,250,0.05)', badge:'#60a5fa',badgeBg:'rgba(96,165,250,0.15)'},
      low:      {border:'#34d399',bg:'rgba(52,211,153,0.05)', badge:'#34d399',badgeBg:'rgba(52,211,153,0.15)'},
    };
    const typeIcons = {fix:'🔧',reduce:'📉',redesign:'🔄',upgrade:'⬆️'};
    const c = colors[s.priority];
    return `<div style="border:1.5px solid ${c.border};border-radius:10px;padding:14px;background:${c.bg};margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:20px">${typeIcons[s.type]||'💡'}</span>
        <div style="flex:1">
          <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700;background:${c.badgeBg};color:${c.badge};margin-right:6px">${s.priority.toUpperCase()}</span>
          <span style="font-size:10px;color:var(--txt3)">${s.member}</span>
          <div style="font-size:12px;font-weight:700;color:var(--txt);margin-top:2px">${s.title}</div>
        </div>
      </div>
      <div style="display:grid;gap:6px;font-size:11px">
        <div style="padding:6px 10px;background:var(--bg3);border-radius:6px">
          <strong style="color:#f87171">Problem:</strong> <span style="color:var(--txt2)">${s.issue}</span>
        </div>
        <div style="padding:6px 10px;background:var(--bg3);border-radius:6px">
          <strong style="color:#34d399">Fix:</strong> <span style="color:var(--txt2)">${s.fix}</span>
        </div>
        <div style="padding:6px 10px;background:var(--bg3);border-radius:6px">
          <strong style="color:#60a5fa">Benefit:</strong> <span style="color:var(--txt2)">${s.saving}</span>
        </div>
        <div style="padding:6px 10px;background:var(--bg3);border-radius:6px">
          <strong style="color:var(--txt3)">How:</strong> <span style="color:var(--txt3)">${s.howTo}</span>
        </div>
      </div>
    </div>`;
  }

  function section(title, items, color) {
    if (!items.length) return '';
    return `<div style="margin-bottom:20px">
      <div style="font-size:12px;font-weight:700;color:${color};margin-bottom:8px">${title} (${items.length})</div>
      ${items.map(card).join('')}
    </div>`;
  }

  const score = suggestions.length === 0 ? 100
    : Math.max(0, 100 - critical.length*25 - high.length*10 - medium.length*5 - low.length*2);
  const scoreColor = score >= 80 ? '#34d399' : score >= 60 ? '#f59e0b' : '#f87171';
  const scoreMsg = score >= 80 ? 'Well designed — minor optimisations possible'
    : score >= 60 ? 'Acceptable design — some improvements recommended'
    : 'Needs significant revision before finalising';

  return `<div class="card">
    <div class="ct">Design Improvement Suggestions</div>
    <div class="cd">Specific suggestions to fix failures, remove over-design, and make the structure more economical. Each suggestion explains the problem, the fix, and the benefit.</div>

    <div style="display:flex;align-items:center;gap:16px;padding:14px;background:var(--bg1);border-radius:10px;margin-bottom:18px">
      <div style="text-align:center">
        <div style="font-size:36px;font-weight:900;color:${scoreColor}">${score}</div>
        <div style="font-size:10px;color:var(--txt3)">Design Score</div>
      </div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:700;color:${scoreColor};margin-bottom:4px">${scoreMsg}</div>
        <div style="display:flex;gap:10px;font-size:11px;flex-wrap:wrap">
          ${critical.length ? `<span style="color:#f87171">${critical.length} critical</span>` : ''}
          ${high.length     ? `<span style="color:#f59e0b">${high.length} high</span>` : ''}
          ${medium.length   ? `<span style="color:#60a5fa">${medium.length} medium</span>` : ''}
          ${low.length      ? `<span style="color:#34d399">${low.length} low-priority</span>` : ''}
          ${!suggestions.length ? '<span style="color:#34d399">No issues found — good design!</span>' : ''}
        </div>
      </div>
    </div>

    ${section('CRITICAL — Fix Before Proceeding', critical, '#f87171')}
    ${section('HIGH PRIORITY — Fix Soon', high, '#f59e0b')}
    ${section('MEDIUM — Improvements Recommended', medium, '#60a5fa')}
    ${section('LOW — Optional Optimisations', low, '#34d399')}

    ${suggestions.length === 0 ? `<div style="text-align:center;padding:30px;color:#34d399;font-size:14px">
      No significant issues found. Your design is reasonable for a G+${S.numFloors-1} residential building.
      Minor optimisations may still be possible — check individual member details.
    </div>` : ''}

    <div style="margin-top:16px;padding:12px;background:var(--bg1);border-radius:8px;font-size:11px;color:var(--txt3);line-height:1.8">
      <strong style="color:var(--txt2)">How to use these suggestions:</strong><br>
      1. Fix all CRITICAL issues first — these are structural failures.<br>
      2. Review HIGH items — these affect safety or serviceability significantly.<br>
      3. Consider MEDIUM and LOW items for economy — important for real projects.<br>
      4. After any change, re-run the analysis (Step 6) to see updated results.<br>
      5. This list is generated automatically — always verify with a licensed Structural Engineer for construction.
    </div>
  </div>`;
}


// == 17_accept_rerun.js ==

// ================================================================
// MODULE: 17_accept_rerun
// "Accept recommended value & re-run" for every failed member
// Sets the fix value directly into S, then calls runNow()
// ================================================================

// ── CORE: Accept a fix and re-run ───────────────────────────────
function acceptFix(fixes, label) {
  // fixes = array of {key, value, display} — what to set in S
  // label = human-readable description shown in confirm
  const desc = fixes.map(f => f.display).join(', ');
  fixes.forEach(f => { S[f.key] = f.value; });

  // Update visible input fields so user can see what changed
  fixes.forEach(f => {
    const el = document.getElementById(f.key);
    if (el) el.value = f.value;
  });

  // Show notification then re-run
  const notif = document.createElement('div');
  notif.style.cssText = 'position:fixed;top:16px;right:16px;z-index:9999;padding:12px 18px;background:#1e3a8a;color:#fff;border-radius:8px;font-size:12px;font-family:monospace;box-shadow:0 4px 20px rgba(0,0,0,0.4)';
  notif.innerHTML = '⚙️ Applied: ' + desc + '<br><small>Re-running analysis...</small>';
  document.body.appendChild(notif);
  setTimeout(() => {
    if (notif.parentNode) notif.parentNode.removeChild(notif);
  }, 3000);

  // Re-run after short delay so user sees the notification
  setTimeout(() => runNow(), 600);
}

// ── FIX BUTTON HTML ─────────────────────────────────────────────
function fixBtn(fixes, btnLabel, note) {
  const fixJson = JSON.stringify(fixes).replace(/"/g, '&quot;');
  return `<div style="margin:8px 0;padding:10px 12px;background:rgba(52,211,153,0.07);border:1px solid rgba(52,211,153,0.25);border-radius:8px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
    <div style="flex:1;min-width:160px">
      <div style="font-size:10px;font-weight:700;color:#34d399;margin-bottom:2px">RECOMMENDED FIX</div>
      <div style="font-size:11px;color:var(--txt2)">${note}</div>
    </div>
    <button onclick="acceptFix(JSON.parse(this.dataset.f),'${btnLabel.replace(/'/g,'')}')"
      data-f="${fixJson}"
      style="padding:8px 16px;background:#059669;color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--mono);white-space:nowrap;flex-shrink:0">
      ✓ ${btnLabel}
    </button>
  </div>`;
}

// ── CUSTOM VALUE INPUT ────────────────────────────────────────────
function fixInputBtn(key, label, unit, currentVal, recVal, note) {
  const inputId = 'fix_input_' + key + '_' + Math.random().toString(36).slice(2,6);
  return `<div style="margin:8px 0;padding:10px 12px;background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.2);border-radius:8px">
    <div style="font-size:10px;font-weight:700;color:var(--cyan);margin-bottom:4px">APPLY CUSTOM OR RECOMMENDED VALUE</div>
    <div style="font-size:11px;color:var(--txt3);margin-bottom:8px">${note}</div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <div style="font-size:11px;color:var(--txt2)">Current: <strong>${currentVal}${unit}</strong> → </div>
      <input id="${inputId}" type="number" value="${recVal}" 
        style="width:90px;padding:6px 8px;background:var(--bg3);color:var(--txt);border:1px solid var(--blue);border-radius:5px;font-size:12px;font-family:var(--mono);font-weight:700"
        min="1"/>
      <span style="font-size:11px;color:var(--txt3)">${unit}</span>
      <button onclick="
        const v=parseFloat(document.getElementById('${inputId}').value)||${recVal};
        acceptFix([{key:'${key}',value:v,display:'${label}='+v+'${unit}'}],'Set ${label}');
      " style="padding:7px 14px;background:var(--blue);color:#000;border:none;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--mono)">
        ✓ Apply & Re-run
      </button>
    </div>
  </div>`;
}

// ── BEAM FIX BUTTONS ────────────────────────────────────────────
function beamFixButtons(b) {
  let html = '';
  if (!b.deflOK) {
    const dNeed = Math.ceil(b.D * Math.pow(b.dfl / b.dall, 1/3) / 25 + 1) * 25;
    html += fixInputBtn('beamOverrideD_' + (b.id||0), 'Beam depth D',
      'mm', b.D, dNeed,
      'Deflection ' + r2(b.dfl) + 'mm > limit ' + r2(b.dall) + 'mm (L/250). Recommended depth = ' + dNeed + 'mm. You can also try a different value.');

    // Accept: also offer adding a column (can't auto-do that, just explain)
    html += `<div style="margin:4px 0;padding:8px 10px;background:var(--bg1);border-radius:6px;font-size:10px;color:var(--txt3)">
      Alternative: Add an intermediate column to halve the span (most effective — reduces deflection 16×). Do this in Plan & Spans editor.
    </div>`;
  }
  if (!b.shearSafe) {
    const bNeed = Math.ceil(b.RA * 1000 / (b.tcmax * (b.d || 200)) / 25 + 1) * 25;
    html += fixInputBtn('beamOverrideB_' + (b.id||0), 'Beam width b',
      'mm', b.b, bNeed,
      'Shear stress tv=' + r2(b.tv) + ' > tc_max=' + r2(b.tcmax) + ' N/mm². Recommended width = ' + bNeed + 'mm.');
  }
  return html;
}

// ── SLAB FIX BUTTONS ───────────────────────────────────────────
function slabFixButtons(sl) {
  let html = '';
  if (!sl.ld_ok) {
    const dNeed = Math.ceil((sl.lx * 1000 / 26 + S.coverSlab + 5) / 25) * 25;
    html += fixInputBtn('slabThk', 'Slab thickness',
      'mm', S.slabThk, dNeed,
      'l/d = ' + r2(sl.lx * 1000 / sl.slabd) + ' > 26 limit. Slab will deflect excessively. Recommended D = ' + dNeed + 'mm.');
  }
  if (!sl.ok) {
    const dNeed = Math.ceil((sl.slabD + 25) / 25) * 25;
    html += fixInputBtn('slabThk', 'Slab thickness',
      'mm', S.slabThk, dNeed,
      'Moment Mu=' + r2(sl.Mx) + ' > Mulim=' + r2(sl.Mulim) + ' kN.m/m. Increase depth.');
  }
  return html;
}

// ── COLUMN FIX BUTTONS ─────────────────────────────────────────
function colFixButtons(c) {
  let html = '';
  if (!c.safe) {
    const sizeNeed = Math.ceil(c.size / 25 + 2) * 25;
    // Can't override individual column size easily — offer increasing all column sizes
    // via a global scale or just explain
    html += `<div style="margin:8px 0;padding:10px 12px;background:rgba(248,113,113,0.07);border:1px solid rgba(248,113,113,0.25);border-radius:8px">
      <div style="font-size:10px;font-weight:700;color:#f87171;margin-bottom:4px">COLUMN UNSAFE — Pu=${r2(c.Pu)}kN > Pcap=${r2(c.Pcap)}kN</div>
      <div style="font-size:11px;color:var(--txt2);margin-bottom:8px">
        To fix: increase column size (go to Plan & Spans, the column size is auto-calculated from load). 
        Fastest fix: reduce number of floors OR use M${S.fck + 5} concrete.
      </div>
      ${fixBtn([{key:'fck', value: S.fck+5, display:'Concrete M'+(S.fck+5)}],
        'Use M'+(S.fck+5)+' concrete & re-run',
        'Increases column and beam capacity. Re-run will recalculate all members.')}
    </div>`;
  }
  if (!c.short) {
    html += `<div style="margin:8px 0;padding:8px 10px;background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.2);border-radius:8px;font-size:11px;color:var(--txt2)">
      Slender column (leff/D=${r2(c.lex)}>12). Column size is auto-calculated. To fix: reduce floor height or add intermediate bracing. Min size for non-slender at ${S.floorHt}m: ${Math.ceil(S.floorHt*1000*0.65/12/25)*25}mm.
    </div>`;
  }
  return html;
}

// ── FOOTING FIX BUTTONS ────────────────────────────────────────
function ftgFixButtons(f) {
  let html = '';

  if (!f.punch_ok) {
    // Punching fails → need deeper footing
    const dNeed = Math.ceil(f.D * 1.25 / 25) * 25;
    html += fixInputBtn('ftgMinD', 'Footing min depth D',
      'mm', S.ftgMinD || 0, dNeed,
      'Punching shear tv=' + r2(f.tvp) + ' > tc=' + r2(f.tcp) + ' N/mm². Deeper footing increases d, reducing punching stress.');

    html += fixBtn([{key:'fck', value: Math.min(35, S.fck+5), display:'Concrete M'+Math.min(35,S.fck+5)}],
      'Use M' + Math.min(35, S.fck+5) + ' concrete & re-run',
      'Increases tc_max = 0.25×sqrt(fck). Effective for punching shear.');
  }

  if (!f.ow_ok) {
    const dNeed = Math.ceil(f.D * 1.2 / 25) * 25;
    html += fixInputBtn('ftgMinD', 'Footing min depth D',
      'mm', S.ftgMinD || 0, dNeed,
      'One-way shear tv=' + r2(f.tvow) + ' > tc=' + r2(f.tcow) + '. Increase footing depth.');
  }

  if (!f.Ld_ok) {
    // Ld fails → footing too small for column size OR need larger Bf
    // Fix 1: reduce SBC so footing gets bigger naturally
    const sbcNeed = Math.max(80, S.soilBearing - 30);
    html += `<div style="margin:8px 0;padding:10px 12px;background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.2);border-radius:8px">
      <div style="font-size:10px;font-weight:700;color:var(--cyan);margin-bottom:4px">DEVELOPMENT LENGTH FAIL — Bar doesn't have enough length to develop full strength</div>
      <div style="font-size:11px;color:var(--txt2);margin-bottom:6px">
        Available length Lda=${r0(f.Lda)}mm &lt; Required Ldr=${r0(f.Ldr)}mm (with 90° hook).<br>
        This happens when the footing is small (low load) but the column is large.<br>
        <strong>The 90° hook is already accounted for in this calculation.</strong>
      </div>
      <div style="font-size:11px;color:var(--txt3);margin-bottom:8px">
        Fix: make the footing wider (increase Bf) by using a lower SBC value, OR reduce column size.
      </div>
      ${fixInputBtn('soilBearing', 'Safe Bearing Capacity', 'kN/m²', S.soilBearing, sbcNeed,
        'Lower SBC → bigger footing → more bar embedment length. Use actual SI report value — do not guess.')}
    </div>`;
  }

  return html;
}


// == 18_design_summary.js ==

// ================================================================
// MODULE: 18_design_summary  —  Design Summary + Sizing Guide
// Interactive table: all members, utilisation bars, accept buttons
// ================================================================

// ── HOW SIZES ARE DECIDED — teaching boxes ──────────────────────
function sizingGuide() {
  const sl = RES.slab;
  const b0 = (RES.allBeams||RES.beams)[0] || {};
  const c0 = (RES.allCols||RES.cols).find(c=>c.floor===1&&c.inter) || RES.cols[0] || {};
  const f0 = RES.ftgs[0] || {};

  function guideCard(emoji, title, color, steps, example) {
    return `<div style="border:1px solid ${color}22;border-radius:10px;overflow:hidden;background:var(--bg1)">
      <div style="padding:10px 14px;background:${color}11;border-bottom:1px solid ${color}22;display:flex;gap:10px;align-items:center">
        <span style="font-size:22px">${emoji}</span>
        <span style="font-size:12px;font-weight:800;color:var(--txt)">${title}</span>
      </div>
      <div style="padding:12px 14px">
        <div style="font-size:11px;line-height:1.9;color:var(--txt2)">
          ${steps.map((s,i)=>`<div style="display:flex;gap:8px;margin-bottom:4px">
            <span style="min-width:18px;height:18px;border-radius:50%;background:${color};color:#000;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</span>
            <span>${s}</span>
          </div>`).join('')}
        </div>
        <div style="margin-top:10px;padding:8px 10px;background:${color}0d;border-left:3px solid ${color};border-radius:0 6px 6px 0;font-size:10px;font-family:var(--mono);color:${color}">
          ${example}
        </div>
      </div>
    </div>`;
  }

  const sl_dmin = Math.ceil((sl.lx*1000/26+S.coverSlab+5)/25)*25;

  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-bottom:24px">

    ${guideCard('🟦','HOW IS SLAB THICKNESS DECIDED?','#38bdf8',
      [
        '<strong>Step 1 — Know your shorter span lx:</strong> The slab mainly bends along lx. For your slab, lx = <strong>'+(r2(sl.lx))+'m</strong>.',
        '<strong>Step 2 — Use IS 456 span/depth rule:</strong> IS 456 Cl 23.2 says the effective depth d must satisfy l/d ≤ 26 (for two-way continuous slab). So d_min = lx/26.',
        '<strong>Step 3 — Add cover + bar radius:</strong> D = d + cover + ½ bar = d + '+S.coverSlab+' + 5mm. Round up to nearest 25mm.',
        '<strong>Step 4 — Check moment:</strong> Mulim = 0.138×fck×d² must be ≥ Mu from IS 456 Table 26. If Mu > Mulim, increase D.',
        '<strong>Minimum D:</strong> IS 456 says never less than 125mm for slabs in buildings.',
      ],
      'For lx='+r2(sl.lx)+'m: d_min = '+r2(sl.lx*1000)+'/26 = '+r0(sl.lx*1000/26)+'mm\n→ D = '+r0(sl.lx*1000/26)+' + '+S.coverSlab+' + 5 = '+r0(sl.lx*1000/26+S.coverSlab+5)+'mm\n→ Round up to '+sl_dmin+'mm  (provided: '+sl.slabD+'mm)'
    )}

    ${guideCard('🟧','HOW IS BEAM SIZE DECIDED?','#f59e0b',
      [
        '<strong>Step 1 — Start with depth D = L/12:</strong> This is the rule of thumb from IS 456. For a '+( b0.L||4)+'m span: D = '+(b0.L||4)+'×1000/12 = '+Math.round((b0.L||4)*1000/12)+'mm → round to '+Math.ceil(Math.round((b0.L||4)*1000/12)/25)*25+'mm.',
        '<strong>Step 2 — Set width b = D/2:</strong> Minimum 200mm for bar placement and concrete compaction. Wider beams have better shear capacity.',
        '<strong>Step 3 — Calculate load wu:</strong> Slab load over tributary width + beam self-weight + wall load (if edge). Multiply by 1.5.',
        '<strong>Step 4 — Check three things:</strong> (a) Mu ≤ Mulim? (b) Deflection ≤ L/250? (c) Steel ratio pt between 0.4% and 3%?',
        '<strong>Step 5 — If any check fails:</strong> Increase D by 25mm and repeat. The app does this automatically — it is the minimum depth that passes all three checks.',
      ],
      'For L='+( b0.L||4)+'m: Start D='+Math.ceil((b0.L||4)*1000/12/25)*25+'mm, b='+Math.max(200,Math.ceil(Math.ceil((b0.L||4)*1000/12/25)*25/2/25)*25)+'mm\nwu = 1.5×(slab+SW+wall) = '+r2(b0.wu||15)+' kN/m\nResult: '+b0.b+'×'+b0.D+'mm (pt='+r2(b0.pt)+'%)'
    )}

    ${guideCard('🟪','HOW IS COLUMN SIZE DECIDED?','#a78bfa',
      [
        '<strong>Step 1 — Calculate design load Pu:</strong> Add up all slab + beam + wall loads from every floor above this column. Multiply by 1.5.',
        '<strong>Step 2 — Use IS 456 Cl 39.3 formula backwards:</strong> Pu = 0.4×fck×Ac + 0.67×fy×Asc. Assume 1% steel, solve for gross area Ag.',
        '<strong>Step 3 — Find side length:</strong> Side = √Ag. Round up to nearest 25mm. Minimum 300mm in seismic zones (IS 13920 Cl 7.1.2).',
        '<strong>Step 4 — Choose steel:</strong> Minimum 0.8%×Ag (IS 456 Cl 26.5.3.1). Choose number of T16 or T20 bars. Verify capacity ≥ Pu.',
        '<strong>Why minimum 300mm?</strong> Below 300mm, it is impossible to place 4 corner bars + ties properly, especially with IS 13920 confinement requirements.',
      ],
      'Ps='+r2(c0.Ps||400)+'kN (service) → Pu='+r2(c0.Pu||600)+'kN\nAg_req = √(Pu/(0.4×fck+...)) → '+( c0.size||300)+'×'+(c0.size||300)+'mm\nSteel: '+( c0.nb||4)+'-T'+(c0.dB||16)+' (pt='+r2(c0.pt||1.2)+'%)'
    )}

    ${guideCard('🟨','HOW IS FOOTING SIZE DECIDED?','#fbbf24',
      [
        '<strong>Step 1 — Net SBC:</strong> SBC_net = SBC_gross − 18×Df. The weight of soil above the footing was already there — only the net capacity is available for structural load.',
        '<strong>Step 2 — Plan size B:</strong> B = √(Ps / SBC_net). Round up to nearest 100mm. This ensures soil pressure stays within safe limits.',
        '<strong>Step 3 — Footing depth D:</strong> D is governed by punching shear at d/2 from column face. D = max(projection/4 + cover + bar, 300mm).',
        '<strong>Step 4 — Three checks:</strong> (a) Punching shear: tv ≤ 0.25√fck. (b) One-way shear: tv ≤ 0.36 N/mm². (c) Development length: Lda ≥ 0.7×Ldr (with 90° hook).',
        '<strong>Key insight:</strong> Footing depth is NOT about load capacity — it is only about shear. The size B handles load. Deeper footing = better shear.',
      ],
      'Ps='+r2(f0.Ps||300)+'kN, SBC_net='+(S.soilBearing-18*S.ftgDepth)+'kN/m²\nB = √('+r2(f0.Ps||300)+'/'+( S.soilBearing-18*S.ftgDepth)+') = '+r2(f0.Bf||1.5)+'m\nD = '+( f0.D||350)+'mm (punching governs)'
    )}

  </div>`;
}

// ── UTILISATION BAR ──────────────────────────────────────────────
function utilBar(value, label, failLimit, warnLimit) {
  // value: 0=empty, 1=100% used, >1=overstressed
  const pct   = Math.min(value * 100, 150);
  const color  = value > failLimit ? '#f87171'   // over limit = red
    : value > warnLimit ? '#f59e0b'               // near limit = orange
    : value < 0.35      ? '#60a5fa'               // under 35% = blue (over-designed)
    : '#34d399';                                  // 35-warn = green (economical)
  const txt = value > failLimit ? 'FAIL'
    : value < 0.35 ? 'OVER-DESIGNED'
    : 'OK';
  return `<div style="margin-bottom:3px">
    <div style="display:flex;justify-content:space-between;font-size:9px;margin-bottom:2px;color:var(--txt3)">
      <span>${label}</span><span style="color:${color};font-weight:700">${r0(value*100)}% ${txt}</span>
    </div>
    <div style="height:8px;background:var(--bg3);border-radius:4px;overflow:hidden;position:relative">
      <div style="height:100%;width:${Math.min(pct,100)}%;background:${color};border-radius:4px;transition:width 0.4s"></div>
      ${value>1?'<div style="position:absolute;top:0;left:0;height:100%;width:100%;background:rgba(248,113,113,0.3);border-radius:4px"></div>':''}
    </div>
  </div>`;
}

// ── ACCEPT ROW BUTTON ───────────────────────────────────────────
function acceptRowBtn(fixes, label) {
  const fixJson = JSON.stringify(fixes).replace(/"/g,'&quot;');
  return `<button onclick="acceptFix(JSON.parse(this.dataset.f),'${label}')" data-f="${fixJson}"
    style="padding:5px 10px;background:#059669;color:#fff;border:none;border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;font-family:var(--mono);white-space:nowrap">
    ✓ Apply
  </button>`;
}

// ── MAIN SUMMARY PAGE ────────────────────────────────────────────
function secDesignSummary() {
  if (!RES) return '<div class="card"><div class="ct">Design Summary</div><div class="cd">Run analysis first.</div></div>';

  const {slab,beams,cols,ftgs} = RES;
  const c_corner = cols.find(c=>c.floor===1&&c.corner)||cols[0];
  const c_edge   = cols.find(c=>c.floor===1&&c.edge)||cols[1];
  const c_inter  = cols.find(c=>c.floor===1&&c.inter)||cols[2];
  const allCols  = [c_corner,c_edge,c_inter].filter(Boolean);

  // Overall status
  const allFails = [
    !slab.ld_ok, !slab.ok,
    ...beams.flatMap(b=>[!b.deflOK,!b.shearSafe]),
    ...allCols.flatMap(c=>[!c.safe]),
    ...ftgs.flatMap(f=>[!f.punch_ok,!f.ow_ok,!f.Ld_ok]),
  ];
  const nFail = allFails.filter(Boolean).length;
  const nTotal = allFails.length;
  const allOk = nFail === 0;

  // ── SLAB ROW ─────────────────────────────────────────────────
  const slabUtil = slab.lx*1000/slab.slabd/26;  // l/d utilisation
  const slabMomUtil = slab.Mx/slab.Mulim;
  const slabMax = Math.max(slabUtil, slabMomUtil);
  const slabOptD = Math.ceil((slab.lx*1000/26+S.coverSlab+5)/25)*25;
  const slabOver = slab.slabD > slabOptD + 25;
  const slabStatus = !slab.ld_ok||!slab.ok ? 'FAIL'
    : slabOver ? 'OVER-DESIGNED'
    : 'OK';

  function slabRow() {
    return `<tr style="border-bottom:1px solid var(--bg3)">
      <td style="padding:10px 8px">
        <div style="font-size:11px;font-weight:700;color:var(--blue)">Slab</div>
        <div style="font-size:10px;color:var(--txt3)">${slab.twoWay?'Two-way':'One-way'} | ${r2(slab.lx)}m×${r2(slab.ly)}m</div>
      </td>
      <td style="padding:10px 8px">
        <div style="font-size:12px;font-weight:800;color:var(--txt)">${slab.slabD}mm</div>
        <div style="font-size:10px;color:var(--txt3)">D (thickness)</div>
      </td>
      <td style="padding:10px 8px;min-width:120px">
        ${utilBar(slabUtil,'l/d (limit=26)',1,0.85)}
        ${utilBar(slabMomUtil,'Mu/Mulim (moment)',1,0.85)}
      </td>
      <td style="padding:10px 8px">
        <div style="font-size:10px;color:var(--txt2)">T10@${slab.spx}mm (X)<br>T8@${slab.spy}mm (Y)<br>T8@${slab.spx_n}mm (top)</div>
      </td>
      <td style="padding:10px 8px;text-align:center">
        <div style="padding:3px 8px;border-radius:10px;font-size:9px;font-weight:700;display:inline-block;margin-bottom:4px;
          background:${slabStatus==='FAIL'?'rgba(248,113,113,0.15)':slabStatus==='OVER-DESIGNED'?'rgba(96,165,250,0.15)':'rgba(52,211,153,0.15)'};
          color:${slabStatus==='FAIL'?'#f87171':slabStatus==='OVER-DESIGNED'?'#60a5fa':'#34d399'}">
          ${slabStatus}
        </div>
        ${slabOver && slab.ld_ok && slab.ok
          ? '<div style="font-size:9px;color:var(--txt3);margin-bottom:4px">Optimal: '+slabOptD+'mm saves concrete</div>'
          + acceptRowBtn([{key:'slabThk',value:slabOptD,display:'Slab D='+slabOptD+'mm'}],'Use '+slabOptD+'mm')
          : !slab.ld_ok
          ? acceptRowBtn([{key:'slabThk',value:slabOptD,display:'Slab D='+slabOptD+'mm'}],'Fix: '+slabOptD+'mm')
          : ''}
      </td>
      <td style="padding:10px 8px;font-size:10px;color:var(--txt3)">
        ${slabOver ? 'Your '+slab.slabD+'mm is '+( slab.slabD-slabOptD)+'mm thicker than needed. Reducing to '+slabOptD+'mm saves '+r2((slab.slabD-slabOptD)/1000*S.buildingL*S.buildingW*25)+' kN dead load per floor.' : !slab.ld_ok ? 'Too thin — will deflect and crack. Increase to '+slabOptD+'mm.' : 'Well-designed.'}
      </td>
    </tr>`;
  }

  // ── BEAM ROWS ─────────────────────────────────────────────────
  function beamRow(b) {
    const deflU = b.dfl/b.dall;
    const momU  = b.Mmax/b.Mulim;
    const shearU= b.tv/b.tcmax;
    const maxU  = Math.max(deflU,momU,shearU);
    const overD = b.overDesigned || (deflU<0.35 && momU<0.35 && b.pt<0.5);
    const status = !b.deflOK||!b.shearSafe ? 'FAIL'
      : overD ? 'OVER-DESIGNED'
      : 'OK';
    const econD = b.econD || Math.max(200,Math.ceil(b.D*Math.cbrt(Math.max(deflU,0.35))/25)*25);
    const econB = b.econB || b.b;

    return `<tr style="border-bottom:1px solid var(--bg3)">
      <td style="padding:10px 8px">
        <div style="font-size:11px;font-weight:700;color:var(--orange)">${(b.label||'Beam').slice(0,16)}</div>
        <div style="font-size:10px;color:var(--txt3)">L=${b.L}m | ${b.endCond?b.endCond.split(' ')[0]:'SS'}</div>
      </td>
      <td style="padding:10px 8px">
        <div style="font-size:12px;font-weight:800;color:var(--txt)">${b.b}×${b.D}mm</div>
        <div style="font-size:10px;color:var(--txt3)">b×D | pt=${r2(b.pt)}%</div>
      </td>
      <td style="padding:10px 8px;min-width:120px">
        ${utilBar(deflU,'Deflection δ/limit',1,0.85)}
        ${utilBar(momU,'Moment Mu/Mulim',1,0.85)}
        ${utilBar(shearU,'Shear tv/tc_max',1,0.85)}
      </td>
      <td style="padding:10px 8px">
        <div style="font-size:10px;color:var(--txt2)">${b.nm}-T20 (bot)<br>${b.ns}-T20 (top)<br>T8@${b.svd}/${b.sv}mm</div>
      </td>
      <td style="padding:10px 8px;text-align:center">
        <div style="padding:3px 8px;border-radius:10px;font-size:9px;font-weight:700;display:inline-block;margin-bottom:4px;
          background:${status==='FAIL'?'rgba(248,113,113,0.15)':status==='OVER-DESIGNED'?'rgba(96,165,250,0.15)':'rgba(52,211,153,0.15)'};
          color:${status==='FAIL'?'#f87171':status==='OVER-DESIGNED'?'#60a5fa':'#34d399'}">
          ${status}
        </div>
        ${overD && b.deflOK && b.shearSafe
          ? '<div style="font-size:9px;color:var(--txt3);margin-bottom:4px">Try '+econD+'×'+econB+'mm</div>'
          + acceptRowBtn([
              {key:'beamOverrideD_'+(b.id||0),value:econD,display:'Beam D='+econD+'mm'},
              {key:'beamOverrideB_'+(b.id||0),value:econB,display:'b='+econB+'mm'},
            ],'Try '+econD+'mm')
          : !b.deflOK
          ? acceptRowBtn([{key:'beamOverrideD_'+(b.id||0),value:Math.ceil(b.D*Math.pow(b.dfl/b.dall,1/3)/25+1)*25,display:'Fix beam D'}],'Fix depth')
          : ''}
      </td>
      <td style="padding:10px 8px;font-size:10px;color:var(--txt3)">
        ${overD ? 'Beam uses only '+r0(Math.max(deflU,momU)*100)+'% of its capacity. '+b.b+'×'+b.D+'mm is larger than needed. Trying '+econD+'mm depth will save steel without failing.' : !b.deflOK ? 'δ='+r2(b.dfl)+'mm > '+r2(b.dall)+'mm limit. Beam sags too much — floor tiles will crack.' : !b.shearSafe ? 'Shear exceeds limit. Increase width or depth.' : 'Utilisation '+r0(maxU*100)+'% — well designed.'}
      </td>
    </tr>`;
  }

  // ── COLUMN ROWS ───────────────────────────────────────────────
  function colRow(c) {
    if (!c) return '';
    const axialU = c.Pu/c.Pcap;
    const over   = axialU < 0.35 && c.pt < 1.0 && c.size > 300;
    const status = !c.safe ? 'FAIL' : over ? 'OVER-DESIGNED' : 'OK';
    const optSize= Math.max(300, Math.ceil(Math.sqrt(c.Pu*1000/(0.4*S.fck+0.01*(0.67*S.fy-0.4*S.fck)))/25)*25);

    return `<tr style="border-bottom:1px solid var(--bg3)">
      <td style="padding:10px 8px">
        <div style="font-size:11px;font-weight:700;color:var(--violet)">${(c.label||'Col').slice(0,16)}</div>
        <div style="font-size:10px;color:var(--txt3)">Floor ${c.floor}</div>
      </td>
      <td style="padding:10px 8px">
        <div style="font-size:12px;font-weight:800;color:var(--txt)">${c.size}×${c.size}mm</div>
        <div style="font-size:10px;color:var(--txt3)">${c.nb}-T${c.dB} | pt=${r2(c.pt)}%</div>
      </td>
      <td style="padding:10px 8px;min-width:120px">
        ${utilBar(axialU,'Pu/Capacity',1,0.85)}
        ${utilBar(c.pt/4,'Steel pt/4% max',1,0.7)}
      </td>
      <td style="padding:10px 8px">
        <div style="font-size:10px;color:var(--txt2)">General: T8@${c.ts}mm<br>Conf.zone: T8@${c.tsc}mm<br>Lo=${r0(c.Lo)}mm</div>
      </td>
      <td style="padding:10px 8px;text-align:center">
        <div style="padding:3px 8px;border-radius:10px;font-size:9px;font-weight:700;display:inline-block;margin-bottom:4px;
          background:${status==='FAIL'?'rgba(248,113,113,0.15)':status==='OVER-DESIGNED'?'rgba(96,165,250,0.15)':'rgba(52,211,153,0.15)'};
          color:${status==='FAIL'?'#f87171':status==='OVER-DESIGNED'?'#60a5fa':'#34d399'}">
          ${status}
        </div>
        ${!c.safe ? '<div style="font-size:9px;color:#f87171">Pu='+r2(c.Pu)+'kN<br>Cap='+r2(c.Pcap)+'kN</div>' : over && optSize<c.size ? '<div style="font-size:9px;color:var(--txt3);margin-bottom:4px">Optimal: '+optSize+'mm</div>' : ''}
      </td>
      <td style="padding:10px 8px;font-size:10px;color:var(--txt3)">
        ${!c.safe ? 'UNSAFE — column will crush. Increase size or use stronger concrete.' : over ? 'Column is '+( c.size-optSize)+'mm larger than needed. Auto-sizing from load calculation — check if column load is correct.' : 'Axial utilisation '+r0(axialU*100)+'% — good design.'}
      </td>
    </tr>`;
  }

  // ── FOOTING ROWS ──────────────────────────────────────────────
  function ftgRow(f) {
    if (!f) return '';
    const punchU = f.tvp/f.tcp;
    const owU    = f.tvow/f.tcow;
    const maxU   = Math.max(punchU,owU);
    const over   = maxU < 0.4 && f.punch_ok && f.ow_ok && f.Ld_ok;
    const status = !f.punch_ok||!f.ow_ok||!f.Ld_ok ? 'FAIL' : over ? 'CONSERVATIVE' : 'OK';
    const dNeed  = Math.ceil(f.D*1.2/25)*25;

    return `<tr style="border-bottom:1px solid var(--bg3)">
      <td style="padding:10px 8px">
        <div style="font-size:11px;font-weight:700;color:var(--yellow)">${(f.lbl||'Footing').slice(0,16)}</div>
        <div style="font-size:10px;color:var(--txt3)">Ps=${r2(f.Ps)}kN</div>
      </td>
      <td style="padding:10px 8px">
        <div style="font-size:12px;font-weight:800;color:var(--txt)">${r2(f.Bf)}m × ${r2(f.Bf)}m</div>
        <div style="font-size:10px;color:var(--txt3)">D=${r0(f.D)}mm | d=${r0(f.d)}mm</div>
      </td>
      <td style="padding:10px 8px;min-width:120px">
        ${utilBar(punchU,'Punching shear',1,0.85)}
        ${utilBar(owU,'One-way shear',1,0.85)}
        ${utilBar(f.Ld_ok?0.5:1.1,'Dev.length',1,0.99)}
      </td>
      <td style="padding:10px 8px">
        <div style="font-size:10px;color:var(--txt2)">T${f.dBf}@${f.spf}mm EW<br>Cover 75mm<br>Ast=${r0(f.Af)}mm²</div>
      </td>
      <td style="padding:10px 8px;text-align:center">
        <div style="padding:3px 8px;border-radius:10px;font-size:9px;font-weight:700;display:inline-block;margin-bottom:4px;
          background:${status==='FAIL'?'rgba(248,113,113,0.15)':status==='CONSERVATIVE'?'rgba(96,165,250,0.15)':'rgba(52,211,153,0.15)'};
          color:${status==='FAIL'?'#f87171':status==='CONSERVATIVE'?'#60a5fa':'#34d399'}">
          ${status}
        </div>
        ${!f.punch_ok ? acceptRowBtn([{key:'ftgMinD',value:dNeed,display:'Ftg D='+dNeed+'mm'}],'Fix: '+dNeed+'mm') : ''}
        ${!f.Ld_ok ? acceptRowBtn([{key:'soilBearing',value:Math.max(80,S.soilBearing-25),display:'SBC='+(Math.max(80,S.soilBearing-25))+'kN/m²'}],'Bigger Bf') : ''}
      </td>
      <td style="padding:10px 8px;font-size:10px;color:var(--txt3)">
        ${!f.punch_ok ? 'Punching shear fail. Column tries to punch through footing. Increase depth or concrete grade.' : !f.ow_ok ? 'One-way shear fail. Increase depth.' : !f.Ld_ok ? 'Bar too short to develop full strength. Footing needs to be wider or use 90° hooks (already applied in calc).' : over ? 'Footing depth is conservative ('+r0(maxU*100)+'% used). Auto-sized from shear — correct practice.' : 'Good design.'}
      </td>
    </tr>`;
  }

  // ── TABLE HEADER ──────────────────────────────────────────────
  const thead = `<tr style="background:var(--bg3)">
    <th style="padding:8px;font-size:10px;text-align:left">Member</th>
    <th style="padding:8px;font-size:10px;text-align:left">Size</th>
    <th style="padding:8px;font-size:10px;text-align:left;min-width:130px">Utilisation</th>
    <th style="padding:8px;font-size:10px;text-align:left">Reinforcement</th>
    <th style="padding:8px;font-size:10px;text-align:center">Status / Action</th>
    <th style="padding:8px;font-size:10px;text-align:left">Explanation</th>
  </tr>`;

  const allRows = [
    slabRow(),
    ...beams.map(beamRow),
    ...allCols.map(colRow),
    ...ftgs.map(ftgRow),
  ].join('');

  return `<div class="card">
    <div class="ct">Design Summary — All Members</div>
    <div class="cd">Complete overview of every structural member. The utilisation bars show how efficiently each member is used. Blue = over-designed (wasteful). Green = economical. Red = fails (must fix). Click any "Apply" button to set the recommended value and re-run analysis.</div>

    <div style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:var(--bg1);border-radius:10px;margin-bottom:18px">
      <div style="text-align:center">
        <div style="font-size:36px;font-weight:900;color:${allOk?'#34d399':'#f87171'}">${nTotal-nFail}/${nTotal}</div>
        <div style="font-size:10px;color:var(--txt3)">checks pass</div>
      </div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:700;color:${allOk?'#34d399':'#f87171'};margin-bottom:4px">
          ${allOk ? 'ALL CHECKS PASS — Design is safe and can proceed to drawings.' : nFail+' check'+(nFail>1?'s':'')+' fail — use the Apply buttons to fix and re-run.'}
        </div>
        <div style="font-size:11px;color:var(--txt3)">
          Blue bars = over-designed (safe but wasteful — consider reducing). Green = economical. Red = must fix.
        </div>
      </div>
    </div>

    <div style="font-size:12px;font-weight:700;color:var(--txt);margin-bottom:12px">
      How Are Sizes Decided? — Click to understand the logic before reading the table below.
    </div>
    ${sizingGuide()}

    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:11px">
        ${thead}
        ${allRows}
      </table>
    </div>

    <div style="margin-top:14px;padding:10px 14px;background:var(--bg1);border-radius:8px;font-size:10px;color:var(--txt3);line-height:1.8">
      <strong style="color:var(--txt2)">Utilisation Guide:</strong>
      <span style="color:#f87171"> ■ Red >100% = FAIL (must fix)</span>
      <span style="color:#f59e0b"> ■ Orange 85–100% = Near limit (safe, check carefully)</span>
      <span style="color:#34d399"> ■ Green 35–85% = Economical zone (good design)</span>
      <span style="color:#60a5fa"> ■ Blue &lt;35% = Over-designed (section larger than needed)</span>
    </div>
  </div>`;
}


// == 19_parametric.js ==

// ================================================================
// MODULE: 19_parametric  —  Parametric Design Explorer v3
// Multi-param: all sliders stay at their set values simultaneously.
// Frame elevation SVG updates live showing BMD / deflection / shear.
// ================================================================

// ── MULTI-PARAM STATE ───────────────────────────────────────────
// _PSTATE holds ALL current overrides; never resets when switching tabs
if (!window._PSTATE) window._PSTATE = {};
if (!window._PBASE)  window._PBASE  = null;
if (!window._PACTIVE) window._PACTIVE = 'slabThk';

// ── FAST STRUCTURAL CALC ────────────────────────────────────────
function fastCalc(overrides) {
  const p = Object.assign({}, S, overrides);

  // Beam geometry: use explicit override or derive from span
  const bL  = p.spansX[Math.floor(p.spansX.length / 2)] || 4;
  const trib = (p.spansY[0]||3)/2 + (p.spansY[1]||p.spansY[0]||3)/2;
  const Ec   = 5000 * Math.sqrt(p.fck);
  const Mf   = (()=>{
    const fyd = p.fy/1.15;
    const xud = fyd/(fyd + 0.0035*p.Es);
    return 0.36*xud*(1-0.42*xud);
  })();

  // Slab
  const lx = Math.min(...p.spansX, ...p.spansY);
  const DL_slab = (p.slabThk/1000)*25;
  const wu_slab = 1.5*(DL_slab + p.floorFinish + p.partitions + p.udlLL);
  const slab_d  = p.slabThk - p.coverSlab - 5;
  const slab_ld = lx*1000/slab_d;
  const slab_Mu = 0.062*wu_slab*lx*lx;
  const slab_Mulim = Mf*p.fck*1000*slab_d*slab_d/1e6;

  // Beam — start from override or derive
  let bD = (overrides._beamD) ? overrides._beamD : Math.max(200, Math.ceil(bL*1000/12/25)*25);
  let bW = (overrides._beamB) ? overrides._beamB : Math.max(200, Math.ceil(bD/2/25)*25);
  const w_slab = (DL_slab + p.floorFinish + p.partitions + p.udlLL)*trib;
  const wsw = (bW/1000)*(bD/1000)*25;
  const wu_b = 1.5*(w_slab + wsw);
  const bd   = bD - p.coverBeam - 8 - 10;
  const Mmax_b  = (1/16)*wu_b*bL*bL;
  const Mulim_b = Mf*p.fck*bW*bd*bd/1e6;
  const I_b     = bW*Math.pow(bD,3)/12;
  const dfl_b   = 5*wu_b*Math.pow(bL,4)/(384*Ec*I_b/1e12);
  const dall_b  = bL*1000/250;
  const Vu_b    = 0.55*wu_b*bL;                  // end reaction
  const tv_b    = Vu_b*1000/(bW*bd);             // shear stress N/mm²
  const tc_b    = 0.48;                           // approx for ~0.5%pt
  const Ast_b   = Math.max(0.85*bW*bd/p.fy, Mmax_b>0 ? Mmax_b*1e6/(0.87*p.fy*bd) : 0);
  const pt_b    = Ast_b/(bW*bd)*100;

  // Column
  const sx = p.spansX[0]||4, sy = p.spansY[0]||3;
  const Ps_floor = ((DL_slab + p.floorFinish + p.partitions)*sx*sy + p.udlLL*sx*sy*0.25);
  const Ps_col   = Ps_floor * p.numFloors;
  const Pu_col   = 1.5 * Ps_col;
  // Use override col size or compute minimum required
  let colSz;
  if (overrides._colSize) {
    colSz = overrides._colSize;
  } else {
    colSz = Math.max(300, Math.ceil(Math.sqrt(Pu_col*1000/(0.4*p.fck + 0.008*(0.67*p.fy - 0.4*p.fck)))/25)*25);
  }
  const col_Ag  = colSz*colSz;
  const col_Ast = Math.max(0.008*col_Ag, (Pu_col*1000 - 0.4*p.fck*col_Ag)/(0.67*p.fy - 0.4*p.fck));
  const col_Pcap= (0.4*p.fck*(col_Ag - col_Ast) + 0.67*p.fy*col_Ast)/1000;
  const col_ok  = Pu_col <= col_Pcap;
  const col_util= Pu_col/col_Pcap;

  // Footing
  const qn = Math.max(80, p.soilBearing - p.ftgDepth*18);
  const Bf  = Math.ceil(Math.sqrt(Ps_col/qn)*100)/100;
  const quf = Ps_col/(Bf*Bf)*1.5;
  const dpre= (Bf*1000 - colSz)/4;
  const fD  = Math.max(300, Math.ceil((dpre + p.coverFtg + 8)/25)*25);
  const fd  = fD - p.coverFtg - 8;
  const tvp = ((Pu_col - quf*(colSz/1000 + fd/1000)**2)*1000)/(4*(colSz + fd)*fd);
  const tcp = 0.25*Math.sqrt(p.fck);

  // Seismic
  const H  = p.numFloors * p.floorHt;
  const bW2 = p.spansY.reduce((a,b)=>a+b, 0)||9;
  const Ta  = 0.09*H/Math.sqrt(bW2);
  const ZM  = {II:0.10, III:0.16, IV:0.24, V:0.36};
  const sfM = {I:1.0, II:1.2, III:1.5};
  const Z   = ZM[p.zone]||0.24;
  const Sa  = (Ta<=0.1?1+15*Ta:Ta<=0.55?2.5:1.36/Ta)*(sfM[p.soilType]||1.2);
  const Ah  = (Z/2)*(Sa/5)*(p.importance||1.0);
  const Vb  = Ah*(Ps_floor*p.numFloors);

  return {
    slab:  { DL:DL_slab, wu:wu_slab, ld:slab_ld, Mu:slab_Mu, Mulim:slab_Mulim, ok:slab_Mu<=slab_Mulim&&slab_ld<=26 },
    beam:  { L:bL, b:bW, D:bD, d:bd, wu:wu_b, Mmax:Mmax_b, Mulim:Mulim_b, dfl:dfl_b, dall:dall_b, Vu:Vu_b, tv:tv_b, tc:tc_b, Ast:Ast_b, pt:pt_b, ok:dfl_b<=dall_b&&Mmax_b<=Mulim_b },
    col:   { Ps:Ps_col, Pu:Pu_col, size:colSz, Ag:col_Ag, Ast:col_Ast, Pcap:col_Pcap, ok:col_ok, util:col_util },
    ftg:   { Ps:Ps_col, Bf:Bf, D:fD, d:fd, tvp:tvp, tcp:tcp, ok:tvp<=tcp },
    seismic:{ Ta:Ta, Ah:Ah, Vb:Vb },
    inputs:{ bL:bL, numFloors:p.numFloors, floorHt:p.floorHt, fck:p.fck, fy:p.fy },
  };
}

// ── PARAMETER DEFINITIONS ──────────────────────────────────────
const PARAMS = [
  { key:'slabThk',    label:'Slab Thickness', unit:'mm',    min:100, max:250, step:10,  color:'#38bdf8',
    why:'Slab self-weight = D/1000×25 kN/m². Changes beam load → column load → footing size.' },
  { key:'udlLL',      label:'Live Load',       unit:'kN/m²', min:1.0, max:6.0, step:0.5, color:'#f59e0b',
    why:'People, furniture, stored goods. Flows into slab moments, beam load, column load.' },
  { key:'fck',        label:'Concrete fck',    unit:'N/mm²', min:20,  max:60,  step:5,   color:'#34d399',
    why:'Higher fck → higher Mulim (∝fck), higher Pcap (0.4fck term), better punching resistance.' },
  { key:'fy',         label:'Steel fy',        unit:'N/mm²', min:415, max:600, step:85,  color:'#a78bfa',
    why:'Higher fy → less steel area for same moment. Also increases development length Ld.' },
  { key:'numFloors',  label:'No. of Floors',   unit:'floors',min:1,   max:10,  step:1,   color:'#f87171',
    why:'Each extra floor adds one floor load to every column below. Ground column & footing most affected.' },
  { key:'floorHt',    label:'Floor Height',    unit:'m',     min:2.5, max:5.0, step:0.1, color:'#fb923c',
    why:'Taller floors → heavier wall loads on beams, longer column, larger seismic period Ta.' },
  { key:'soilBearing',label:'Soil SBC',        unit:'kN/m²', min:80,  max:400, step:10,  color:'#fbbf24',
    why:'Higher SBC → smaller footings. Lower SBC → much larger footings. Critical for cost.' },
  { key:'_beamD',     label:'Beam Depth (D)',  unit:'mm',    min:200, max:800, step:25,  color:'#f97316',
    why:'Deeper beams → higher Mulim (∝d²), less deflection (∝1/d³). Adds self-weight.' },
  { key:'_beamB',     label:'Beam Width (b)',  unit:'mm',    min:150, max:450, step:25,  color:'#e879f9',
    why:'Wider beams → better shear capacity, easier bar placement. Min 200mm (IS 456 Cl 26.5.1).' },
  { key:'_colSize',   label:'Column Size',     unit:'mm',    min:200, max:700, step:25,  color:'#22d3ee',
    why:'Larger columns → higher Pcap, less congestion. Min 300mm recommended in seismic zones.' },
];

// ── FRAME ELEVATION SVG ─────────────────────────────────────────
function frameElevSVG(res, mode) {
  // mode: 'bmd' | 'deflection' | 'shear' | 'member'
  const nB = Math.min(S.spansX.length, 4);
  const nF = Math.min(res.inputs.numFloors, 5);
  const svgW = 380, svgH = 280;
  const marginL = 28, marginB = 30, marginT = 20, marginR = 30;
  const drawW = svgW - marginL - marginR;
  const drawH = svgH - marginT - marginB;
  const spW   = drawW / nB;   // width per bay
  const stH   = drawH / nF;   // height per storey
  const colW  = Math.max(4, (res.col.size||300)/300*6);

  let s = `<svg viewBox="0 0 ${svgW} ${svgH}" style="width:100%;background:#0a0f1e;border-radius:8px;border:1px solid rgba(56,189,248,0.2)">`;

  // Ground
  s += `<line x1="${marginL-10}" y1="${svgH-marginB}" x2="${svgW-marginR+10}" y2="${svgH-marginB}" stroke="#8b7355" stroke-width="2"/>`;
  for (let hx = marginL; hx < svgW-marginR; hx += 8)
    s += `<line x1="${hx}" y1="${svgH-marginB}" x2="${hx-5}" y2="${svgH-marginB+6}" stroke="#6b5a3e" stroke-width="0.8"/>`;

  // Column x positions
  const cx = (i) => marginL + i*spW;
  const fy = (f) => svgH - marginB - f*stH;  // y for floor f (0=ground)

  // Draw members per mode
  for (let f = 0; f < nF; f++) {
    const y0 = fy(f), y1 = fy(f+1);

    // Columns
    for (let i = 0; i <= nB; i++) {
      const x = cx(i);
      if (mode === 'member') {
        const ok = res.col.ok;
        const util = Math.min(1.2, res.col.util);
        const colColor = util > 1 ? '#f87171' : util > 0.85 ? '#fbbf24' : '#34d399';
        s += `<rect x="${x-colW/2}" y="${y1}" width="${colW}" height="${stH}" fill="${colColor}33" stroke="${colColor}" stroke-width="1.5" rx="1"/>`;
        // Util bar inside column
        const fillH = stH * Math.min(1, util);
        s += `<rect x="${x-colW/2+0.5}" y="${y1+stH-fillH}" width="${colW-1}" height="${fillH}" fill="${colColor}66" rx="0.5"/>`;
      } else {
        s += `<rect x="${x-colW/2}" y="${y1}" width="${colW}" height="${stH}" fill="#4a2a8088" stroke="#7c3aed" stroke-width="1.2" rx="1"/>`;
      }
    }

    // Beams & diagrams
    for (let i = 0; i < nB; i++) {
      const x0 = cx(i) + colW/2, x1c = cx(i+1) - colW/2;
      const bW2 = x1c - x0;
      const bH = Math.max(4, (res.beam.D||350)/350*8);

      if (mode === 'bmd') {
        // Bending moment diagram — parabola below beam for sagging
        const scale = Math.min(stH*0.45, 40);
        const util = Math.min(1.2, res.beam.Mmax/res.beam.Mulim);
        const bmdColor = util > 1 ? '#f87171' : util > 0.85 ? '#fbbf24' : '#60a5fa';
        // Sagging parabola (midspan positive moment)
        let path = `M${x0},${y1}`;
        for (let px = 0; px <= bW2; px += 2) {
          const xi = px/bW2;
          const ordinate = 4*xi*(1-xi)*scale*util;  // parabola
          path += ` L${x0+px},${y1+bmdColor?ordinate:ordinate}`;
        }
        path += ` L${x1c},${y1} Z`;
        s += `<path d="${path}" fill="${bmdColor}44" stroke="${bmdColor}" stroke-width="0.8"/>`;
        // Hogging at supports (negative moment)
        const hogScale = scale*0.6*util;
        s += `<path d="M${x0},${y1} Q${x0+bW2*0.15},${y1-hogScale} ${x0+bW2*0.25},${y1}" fill="#f8717144" stroke="#f87171" stroke-width="0.6"/>`;
        s += `<path d="M${x1c},${y1} Q${x1c-bW2*0.15},${y1-hogScale} ${x1c-bW2*0.25},${y1}" fill="#f8717144" stroke="#f87171" stroke-width="0.6"/>`;
        // Beam outline
        s += `<rect x="${x0}" y="${y1-bH}" width="${bW2}" height="${bH}" fill="#5a3210aa" stroke="#c78a30" stroke-width="0.8" rx="1"/>`;
        // Moment value
        if (f === 0) s += `<text x="${(x0+x1c)/2}" y="${y1+scale*util*0.5+4}" fill="${bmdColor}" font-size="7" text-anchor="middle" font-family="monospace">${r2(res.beam.Mmax)} kN.m</text>`;

      } else if (mode === 'deflection') {
        // Deflected shape — exaggerated parabola
        const maxDfl = Math.min(stH*0.4, res.beam.dfl/res.beam.dall*stH*0.35);
        const deflColor = res.beam.ok ? '#34d399' : '#f87171';
        let path = `M${x0},${y1-bH/2}`;
        for (let px = 0; px <= bW2; px += 2) {
          const xi = px/bW2;
          const dfl = 4*xi*(1-xi)*maxDfl;
          path += ` L${x0+px},${y1-bH/2+dfl}`;
        }
        s += `<path d="${path}" fill="none" stroke="${deflColor}" stroke-width="1.8" stroke-dasharray="3,2"/>`;
        s += `<rect x="${x0}" y="${y1-bH}" width="${bW2}" height="${bH}" fill="#5a3210aa" stroke="#c78a30" stroke-width="0.8" rx="1"/>`;
        // Limit line
        const limitY = y1-bH/2 + stH*0.35;
        s += `<line x1="${x0}" y1="${limitY}" x2="${x1c}" y2="${limitY}" stroke="#f87171" stroke-width="0.6" stroke-dasharray="4,3"/>`;
        if (f === 0) {
          s += `<text x="${(x0+x1c)/2}" y="${y1+maxDfl+9}" fill="${deflColor}" font-size="7" text-anchor="middle" font-family="monospace">${r2(res.beam.dfl)}mm / ${r2(res.beam.dall)}mm lim</text>`;
        }

      } else if (mode === 'shear') {
        // Shear force diagram — rectangular with triangles
        const scale = Math.min(stH*0.38, 35);
        const util = Math.min(1.2, res.beam.tv/res.beam.tc);
        const shColor = util > 1 ? '#f87171' : util > 0.85 ? '#fbbf24' : '#a78bfa';
        // Left shear block
        s += `<polygon points="${x0},${y1} ${x0+bW2*0.35},${y1} ${x0+bW2*0.35},${y1-scale*util} ${x0},${y1-scale*util}" fill="${shColor}44" stroke="${shColor}" stroke-width="0.8"/>`;
        // Right shear block
        s += `<polygon points="${x1c},${y1} ${x1c-bW2*0.35},${y1} ${x1c-bW2*0.35},${y1-scale*util} ${x1c},${y1-scale*util}" fill="${shColor}44" stroke="${shColor}" stroke-width="0.8"/>`;
        s += `<rect x="${x0}" y="${y1-bH}" width="${bW2}" height="${bH}" fill="#5a3210aa" stroke="#c78a30" stroke-width="0.8" rx="1"/>`;
        if (f === 0) s += `<text x="${x0+4}" y="${y1-scale*util/2}" fill="${shColor}" font-size="7" font-family="monospace">${r2(res.beam.tv)} N/mm²</text>`;

      } else {
        // 'member' mode — show member with colour-coded status
        const bOk = res.beam.ok;
        const bColor = bOk ? '#34d399' : '#f87171';
        s += `<rect x="${x0}" y="${y1-bH}" width="${bW2}" height="${bH}" fill="${bColor}33" stroke="${bColor}" stroke-width="1.2" rx="1"/>`;
        // Deflection curve hint
        const dfl = Math.min(stH*0.3, res.beam.dfl/res.beam.dall*stH*0.3);
        let dpath = `M${x0},${y1-bH/2}`;
        for (let px = 0; px <= bW2; px += 3) {
          const xi = px/bW2;
          dpath += ` L${x0+px},${y1-bH/2+4*xi*(1-xi)*dfl}`;
        }
        s += `<path d="${dpath}" fill="none" stroke="${bColor}aa" stroke-width="0.8"/>`;
      }
    }
  }

  // Grid labels — column numbers
  for (let i = 0; i <= nB; i++) {
    const x = cx(i);
    s += `<circle cx="${x}" cy="${svgH-marginB+12}" r="7" fill="#1e3a8a" stroke="#38bdf8" stroke-width="1"/>`;
    s += `<text x="${x}" y="${svgH-marginB+16}" fill="#38bdf8" font-size="7" text-anchor="middle" font-weight="bold" font-family="monospace">${i+1}</text>`;
  }
  // Floor labels
  for (let f = 0; f <= nF; f++) {
    const y = fy(f);
    const lbl = f === 0 ? 'GL' : f === nF ? 'ROOF' : 'F'+f;
    s += `<text x="${marginL-4}" y="${y+3}" fill="#64748b" font-size="7" text-anchor="end" font-family="monospace">${lbl}</text>`;
    s += `<line x1="${marginL-2}" y1="${y}" x2="${cx(nB)+colW/2}" y2="${y}" stroke="#1e3a8a" stroke-width="0.4" stroke-dasharray="3,3"/>`;
  }

  // Mode label
  const modeLabels = { bmd:'Bending Moment Diagram', deflection:'Deflected Shape', shear:'Shear Force Diagram', member:'Member Status (Capacity)' };
  s += `<text x="${svgW/2}" y="13" fill="#94a3b8" font-size="8" text-anchor="middle" font-family="monospace" font-weight="bold">${modeLabels[mode]||mode}</text>`;

  // Legend
  const legX = marginL, legY = 15;
  if (mode === 'member') {
    s += `<circle cx="${legX+4}" cy="${legY}" r="3" fill="#34d399"/>`;
    s += `<text x="${legX+9}" y="${legY+3}" fill="#64748b" font-size="7" font-family="monospace">Safe</text>`;
    s += `<circle cx="${legX+35}" cy="${legY}" r="3" fill="#fbbf24"/>`;
    s += `<text x="${legX+40}" y="${legY+3}" fill="#64748b" font-size="7" font-family="monospace">Near limit</text>`;
    s += `<circle cx="${legX+90}" cy="${legY}" r="3" fill="#f87171"/>`;
    s += `<text x="${legX+95}" y="${legY+3}" fill="#64748b" font-size="7" font-family="monospace">Fail</text>`;
  }

  s += '</svg>';
  return s;
}

// ── COMPARISON TABLE ─────────────────────────────────────────────
function compareRow(label, baseV, currV, unit, lowerBetter) {
  const d = currV - baseV;
  if (Math.abs(d) < 0.0005) return '';
  const imp = lowerBetter ? d < 0 : d > 0;
  const clr = imp ? '#34d399' : '#f87171';
  const arr = d > 0 ? '▲' : '▼';
  const pct = baseV ? Math.round(Math.abs(d/baseV)*100) : 0;
  return `<tr>
    <td style="padding:4px 8px;color:#94a3b8;font-size:10px">${label}</td>
    <td style="padding:4px 8px;color:#64748b;font-size:10px;text-align:right">${r2(baseV)}${unit}</td>
    <td style="padding:4px 8px;font-size:10px;text-align:right"><span style="font-weight:700;color:#f1f5f9">${r2(currV)}${unit}</span></td>
    <td style="padding:4px 8px;text-align:right"><span style="color:${clr};font-size:11px;font-weight:800">${arr}</span></td>
    <td style="padding:4px 8px;font-size:9px;color:${clr}">${d>0?'+':''}${r2(d)}${unit} ${pct?'('+pct+'%)':''}</td>
  </tr>`;
}

function fullCompareTable(base, curr) {
  const section = (title, color, rows) => {
    const content = rows.filter(Boolean).join('');
    if (!content) return '';
    return `<tr><td colspan="5" style="padding:6px 8px 2px;font-size:10px;font-weight:700;color:${color};background:${color}11">${title}</td></tr>${content}`;
  };
  const R = compareRow;
  const html = `
    <table style="width:100%;border-collapse:collapse;font-family:monospace">
      <thead><tr>
        <th style="padding:5px 8px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #1e3a8a">Parameter</th>
        <th style="padding:5px 8px;text-align:right;font-size:9px;color:#64748b;border-bottom:1px solid #1e3a8a">Original</th>
        <th style="padding:5px 8px;text-align:right;font-size:9px;color:#64748b;border-bottom:1px solid #1e3a8a">Current</th>
        <th style="padding:5px 8px;font-size:9px;color:#64748b;border-bottom:1px solid #1e3a8a"></th>
        <th style="padding:5px 8px;text-align:right;font-size:9px;color:#64748b;border-bottom:1px solid #1e3a8a">Change</th>
      </tr></thead>
      <tbody>
        ${section('🟦 SLAB','#38bdf8',[
          R('Self-weight DL', base.slab.DL, curr.slab.DL, ' kN/m²', true),
          R('Load wu',         base.slab.wu, curr.slab.wu, ' kN/m²', true),
          R('l/d ratio',       base.slab.ld, curr.slab.ld, '', true),
          R('Moment Mu',       base.slab.Mu, curr.slab.Mu, ' kN.m/m', true),
          R('Capacity Mulim',  base.slab.Mulim, curr.slab.Mulim, ' kN.m/m', false),
        ])}
        ${section('🟧 BEAM (mid span)','#f59e0b',[
          R('Depth D',     base.beam.D, curr.beam.D, ' mm', false),
          R('Width b',     base.beam.b, curr.beam.b, ' mm', false),
          R('Load wu',     base.beam.wu, curr.beam.wu, ' kN/m', true),
          R('Moment Mmax', base.beam.Mmax, curr.beam.Mmax, ' kN.m', true),
          R('Capacity Mulim', base.beam.Mulim, curr.beam.Mulim, ' kN.m', false),
          R('Deflection δ', base.beam.dfl, curr.beam.dfl, ' mm', true),
          R('Limit δallow', base.beam.dall, curr.beam.dall, ' mm', false),
          R('Shear tv',    base.beam.tv, curr.beam.tv, ' N/mm²', true),
          R('Steel Ast',   base.beam.Ast, curr.beam.Ast, ' mm²', true),
          R('Steel pt %',  base.beam.pt, curr.beam.pt, '%', true),
        ])}
        ${section('🟪 COLUMN (interior, ground)','#a78bfa',[
          R('Service Ps', base.col.Ps,   curr.col.Ps,   ' kN', true),
          R('Factored Pu', base.col.Pu,  curr.col.Pu,   ' kN', true),
          R('Size (sq)',   base.col.size, curr.col.size, ' mm', false),
          R('Capacity Pcap', base.col.Pcap, curr.col.Pcap, ' kN', false),
          R('Util Pu/Pcap', base.col.util, curr.col.util, '', true),
        ])}
        ${section('🟨 FOOTING (interior)','#fbbf24',[
          R('Plan size Bf', base.ftg.Bf,  curr.ftg.Bf,  ' m', true),
          R('Depth D',      base.ftg.D,   curr.ftg.D,   ' mm', true),
          R('Punch tv',     base.ftg.tvp, curr.ftg.tvp, ' N/mm²', true),
          R('Capacity tcp', base.ftg.tcp, curr.ftg.tcp, ' N/mm²', false),
        ])}
        ${section('🌍 SEISMIC','#34d399',[
          R('Period Ta', base.seismic.Ta,  curr.seismic.Ta,  ' s', false),
          R('Coeff Ah',  base.seismic.Ah,  curr.seismic.Ah,  '', false),
          R('Base shear Vb', base.seismic.Vb, curr.seismic.Vb, ' kN', true),
        ])}
      </tbody>
    </table>`;
  return html;
}

// ── STATUS BADGE ────────────────────────────────────────────────
function statusBadge(ok, label) {
  const clr = ok ? '#34d399' : '#f87171';
  const bg  = ok ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)';
  const sym = ok ? '✓' : '✗';
  return `<span style="padding:2px 8px;border-radius:10px;border:1px solid ${clr};background:${bg};color:${clr};font-size:9px;font-weight:700">${sym} ${label}</span>`;
}

// ── SLIDER HTML ──────────────────────────────────────────────────
function sliderForParam(p) {
  const stored = window._PSTATE[p.key];
  const currentVal = stored !== undefined ? stored : (p.key.startsWith('_') ? null : (S[p.key] || p.min));
  const defaultVal = p.key.startsWith('_') ? (p.min + p.max)/2 : (S[p.key] || p.min);
  const displayVal = currentVal !== null ? currentVal : defaultVal;
  const isChanged = stored !== undefined && Math.abs(stored - defaultVal) > 0.001;
  const isActive  = window._PACTIVE === p.key;

  return `<div style="padding:10px 12px;border-radius:8px;border:1.5px solid ${isActive ? p.color : isChanged ? p.color+'66' : '#1e3a8a'};background:${isActive ? p.color+'0d' : isChanged ? p.color+'06' : 'transparent'};transition:all 0.2s;cursor:pointer"
    onclick="window._PACTIVE='${p.key}';refreshParaPanel()">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <div style="font-size:11px;font-weight:700;color:${p.color};flex:1">${p.label}</div>
      <div style="font-size:13px;font-weight:900;color:${isChanged?p.color:'#64748b'}" id="pdisp_${p.key}">${r2(displayVal)}</div>
      <div style="font-size:9px;color:#64748b">${p.unit}</div>
      ${isChanged ? `<button onclick="event.stopPropagation();delete window._PSTATE['${p.key}'];refreshParaPanel()" style="padding:1px 6px;background:transparent;border:1px solid #64748b;border-radius:4px;color:#64748b;cursor:pointer;font-size:9px">↺</button>` : ''}
    </div>
    <div style="display:flex;align-items:center;gap:6px">
      <span style="font-size:9px;color:#64748b;min-width:28px">${p.min}</span>
      <input type="range" min="${p.min}" max="${p.max}" step="${p.step}"
        value="${displayVal}"
        id="pslider_${p.key}"
        oninput="event.stopPropagation();window._PSTATE['${p.key}']=parseFloat(this.value);window._PACTIVE='${p.key}';document.getElementById('pdisp_${p.key}').textContent=parseFloat(this.value).toFixed(${p.step<1?1:0});updateParaLive()"
        style="flex:1;accent-color:${p.color};height:5px;cursor:pointer"/>
      <span style="font-size:9px;color:#64748b;min-width:28px;text-align:right">${p.max}</span>
    </div>
    ${isActive ? `<div style="font-size:9px;color:#64748b;margin-top:5px;line-height:1.5">${p.why}</div>` : ''}
  </div>`;
}

// ── MAIN PAGE ────────────────────────────────────────────────────
function secParametric() {
  if (!RES) return `<div class="card"><div class="ct">Parametric Explorer</div><div class="cd">Run analysis first (Step 6).</div><button class="btn" onclick="go(6)">Run Analysis</button></div>`;

  // Compute baseline ONCE from original RES (never with _PSTATE)
  if (!window._PBASE) window._PBASE = fastCalc({});
  const base = window._PBASE;
  const curr = fastCalc(window._PSTATE);

  // Count changes
  const changedCount = Object.keys(window._PSTATE).length;

  // Changed params summary
  const changedSummary = changedCount > 0
    ? PARAMS.filter(p=>window._PSTATE[p.key]!==undefined)
        .map(p=>`<span style="padding:2px 8px;border-radius:10px;background:${p.color}22;border:1px solid ${p.color}55;color:${p.color};font-size:9px;font-weight:700">${p.label}: ${r2(window._PSTATE[p.key])} ${p.unit}</span>`).join(' ')
    : '<span style="color:#64748b;font-size:10px">No changes yet — move any slider below</span>';

  // Diagram mode (stored in window)
  if (!window._PMODE) window._PMODE = 'member';

  return `<div class="card bl" id="paraPanel">
    <div class="ct">⚡ Parametric Design Explorer</div>
    <div style="font-size:11px;color:#64748b;margin-bottom:14px;line-height:1.7">
      Move <strong style="color:#f1f5f9">any combination of sliders</strong> — all changes stack simultaneously. Every slider holds its value when you click another one. Click <strong style="color:#f87171">Reset All</strong> to return to original design.
    </div>

    <!-- Status bar -->
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 12px;background:#0f172a;border:1px solid #1e3a8a;border-radius:8px;margin-bottom:14px">
      <div style="font-size:10px;font-weight:700;color:#64748b;white-space:nowrap">ACTIVE CHANGES:</div>
      <div style="flex:1;display:flex;flex-wrap:wrap;gap:5px">${changedSummary}</div>
      <div style="display:flex;gap:8px;align-items:center">
        ${statusBadge(curr.beam.ok, 'Beam')}
        ${statusBadge(curr.col.ok, 'Column')}
        ${statusBadge(curr.ftg.ok, 'Footing')}
        ${statusBadge(curr.slab.ok, 'Slab')}
        <button onclick="window._PSTATE={};window._PBASE=null;refreshParaPanel()"
          style="padding:4px 12px;background:rgba(248,113,113,0.1);border:1px solid #f87171;border-radius:6px;color:#f87171;cursor:pointer;font-size:10px;font-weight:700">
          ↺ Reset All
        </button>
        <button onclick="Object.entries(window._PSTATE).forEach(([k,v])=>{if(!k.startsWith('_'))S[k]=v});runNow()"
          style="padding:4px 12px;background:rgba(52,211,153,0.1);border:1px solid #34d399;border-radius:6px;color:#34d399;cursor:pointer;font-size:10px;font-weight:700">
          ✓ Apply & Re-run
        </button>
      </div>
    </div>

    <!-- Two column layout: sliders left, diagram right -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">

      <!-- LEFT: All sliders -->
      <div id="sliderPanel" style="display:flex;flex-direction:column;gap:6px">
        ${PARAMS.map(p=>sliderForParam(p)).join('')}
      </div>

      <!-- RIGHT: Frame elevation diagram + mode tabs -->
      <div>
        <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
          ${['member','bmd','deflection','shear'].map(m=>`
            <button onclick="window._PMODE='${m}';updateParaLive()"
              style="padding:4px 10px;border-radius:6px;border:1px solid ${window._PMODE===m?'#38bdf8':'#1e3a8a'};background:${window._PMODE===m?'rgba(56,189,248,0.15)':'transparent'};color:${window._PMODE===m?'#38bdf8':'#64748b'};cursor:pointer;font-size:9px;font-weight:${window._PMODE===m?'700':'400'}">
              ${{member:'Member Status',bmd:'Bending Moment',deflection:'Deflection',shear:'Shear Force'}[m]}
            </button>`).join('')}
        </div>
        <div id="frameElevDiv">
          ${frameElevSVG(curr, window._PMODE)}
        </div>
        <!-- Key metrics cards -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px">
          ${[
            {label:'Beam δ/δlimit', val:r2(curr.beam.dfl)+'/'+r2(curr.beam.dall)+'mm', ok:curr.beam.ok, color:'#f59e0b'},
            {label:'Beam Mu/Mulim', val:r2(curr.beam.Mmax)+'/'+r2(curr.beam.Mulim)+'kN.m', ok:curr.beam.Mmax<=curr.beam.Mulim, color:'#fb923c'},
            {label:'Column Pu/Pcap', val:r2(curr.col.Pu)+'/'+r2(curr.col.Pcap)+'kN', ok:curr.col.ok, color:'#a78bfa'},
            {label:'Ftg punch tv/tc', val:r2(curr.ftg.tvp)+'/'+r2(curr.ftg.tcp)+' N/mm²', ok:curr.ftg.ok, color:'#fbbf24'},
          ].map(({label,val,ok,color})=>`
            <div style="padding:7px 10px;border-radius:6px;border:1px solid ${ok?color+'55':'#f8717166'};background:${ok?color+'0a':'rgba(248,113,113,0.06)'}">
              <div style="font-size:8px;color:#64748b;margin-bottom:2px">${label}</div>
              <div style="font-size:10px;font-weight:700;color:${ok?color:'#f87171'}">${val}</div>
              <div style="font-size:8px;color:${ok?'#34d399':'#f87171'}">${ok?'✓ OK':'✗ FAIL'}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Full comparison table -->
    <div style="border:1px solid #1e3a8a;border-radius:8px;overflow:hidden">
      <div style="padding:8px 12px;background:#0f172a;font-size:11px;font-weight:700;color:#38bdf8;display:flex;align-items:center;gap:8px">
        📊 Full Impact Comparison
        <span style="font-size:9px;color:#64748b;font-weight:400">Only changed rows shown · Green=improved · Red=worse</span>
      </div>
      <div id="compareTableDiv" style="overflow-x:auto;max-height:400px;overflow-y:auto">
        ${fullCompareTable(base, curr)}
      </div>
    </div>

    <!-- Learning exercises -->
    <div style="margin-top:14px;padding:12px;background:#0a0f1e;border:1px solid #1e3a8a;border-radius:8px">
      <div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:8px">💡 TRY THESE EXERCISES</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px">
        ${[
          ['Slab Thickness: 150→200mm','Watch beam load, column load, footing size all increase.','#38bdf8'],
          ['Live Load: 2→4 kN/m²','Footing nearly doubles. Why commercial buildings need bigger foundations.','#f59e0b'],
          ['Concrete: M25→M30','Beam depth can reduce (Mulim↑). Column capacity improves.','#34d399'],
          ['Add 2 more floors','Column and footing jump significantly. High-rise needs much bigger foundation.','#f87171'],
          ['Reduce SBC to 80 kN/m²','Footing size may triple. Shows why soil investigation is critical.','#fbbf24'],
          ['Beam Depth: 350→500mm','Watch deflection drop, moment capacity rise, and self-weight add up.','#f97316'],
          ['Column Size: 300→400mm','Capacity shoots up. See how overdesign gives large safety margin.','#22d3ee'],
          ['Floor Height: 3.2→4.5m','Wall loads increase, seismic period changes, columns get more slender.','#fb923c'],
        ].map(([title,desc,color])=>`
          <div style="padding:7px;background:#0f172a;border:1px solid ${color}22;border-radius:6px;cursor:pointer">
            <div style="font-size:9px;font-weight:700;color:${color};margin-bottom:2px">${title}</div>
            <div style="font-size:9px;color:#64748b;line-height:1.5">${desc}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── LIVE UPDATE (no page refresh) ──────────────────────────────
function updateParaLive() {
  if (!RES) return;
  if (!window._PBASE) window._PBASE = fastCalc({});
  const base = window._PBASE;
  const curr = fastCalc(window._PSTATE);

  // Update frame elevation
  const frameEl = document.getElementById('frameElevDiv');
  if (frameEl) frameEl.innerHTML = frameElevSVG(curr, window._PMODE||'member');

  // Update compare table
  const tableEl = document.getElementById('compareTableDiv');
  if (tableEl) tableEl.innerHTML = fullCompareTable(base, curr);

  // Update status badges inline
  const panel = document.getElementById('paraPanel');
  if (!panel) return;

  // Update all displayed values
  PARAMS.forEach(p=>{
    const disp = document.getElementById('pdisp_'+p.key);
    if (disp) {
      const v = window._PSTATE[p.key];
      if (v !== undefined) {
        disp.textContent = r2(v);
        disp.style.color = p.color;
      }
    }
  });
}

// Full refresh (re-renders sliders to show changed state)
function refreshParaPanel() {
  window._PBASE = null; // reset baseline when full refresh
  go(19);
}


// == 20_discussion.js ==

// ================================================================
// MODULE: 20_discussion
// Narrative analysis discussion — world's best teacher style
// Each section: what is happening, why, cost impact, what to do
// ================================================================

function secDiscussion() {
  if (!RES) return '<div class="card"><div class="ct">Analysis Discussion</div><div class="cd">Run full analysis first.</div><button class="btn" onclick="go(6)">Run Analysis</button></div>';

  const { slab, seis, wind, beams, cols, ftgs, mat } = RES;
  const g = (key) => cols.find(c => c.floor===1 && c[key]);
  const c1=g('corner'), c2=g('edge'), c3=g('inter');
  const f1=ftgs[0], f2=ftgs[1], f3=ftgs[2];
  const allBeamOk = beams.every(b => b.deflOK && b.shearSafe);
  const failBeams = beams.filter(b => !b.deflOK || !b.shearSafe);
  const overBeams = beams.filter(b => b.dfl/b.dall < 0.40 && b.Mmax/b.Mulim < 0.40);
  const avgPt = beams.length ? beams.reduce((a,b)=>a+b.pt,0)/beams.length : 0;
  const worstDefl = beams.reduce((a,b)=>b.dfl/b.dall>a.dfl/a.dall?b:a, beams[0]||{dfl:0,dall:1});
  const slabOptD = Math.ceil((slab.lx*1000/26+S.coverSlab+5)/25)*25;
  const slabSavingDL = Math.max(0, S.slabThk - slabOptD)/1000*25; // kN/m² per 1mm saved
  const seisGoverns = seis.Vb > wind.Fw*(S.buildingL||12)*(S.numFloors*S.floorHt)/2;
  const colUtil3 = c3 ? c3.Pu/c3.Pcap : 0;

  // Cost estimation helpers (rough order of magnitude, Indian market)
  const conc_cost = 7000;  // Rs/m³ for M25 including labour
  const steel_cost = 75;   // Rs/kg
  const shuttering = 450;  // Rs/m² form area

  // Rough cost per beam cross-section change
  const beamConcSave = (b, dD) => {
    const vol = (b.b/1000)*(dD/1000)*b.L;
    return vol * conc_cost;
  };
  const slabConcSave = slabSavingDL > 0
    ? (S.slabThk-slabOptD)/1000 * S.buildingL * S.buildingW * conc_cost * S.numFloors
    : 0;

  // ── SVG HELPERS ──────────────────────────────────────────────
  function svgDeflection(b, W, H) {
    const dRatio = Math.min(b.dfl/b.dall, 2.0);
    const L = W - 60, ox = 30, oy = 20, bh = 18;
    const mid = ox + L/2;
    const sag = Math.min(dRatio * 28, 55);
    const ok = b.deflOK;
    const color = ok ? '#34d399' : '#f87171';
    let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px">`;
    s += `<rect width="${W}" height="${H}" fill="#0a0f1e" rx="6"/>`;

    // Ground / support marks
    [[ox,oy+bh],[ox+L,oy+bh]].forEach(([sx,sy])=>{
      s += `<polygon points="${sx},${sy} ${sx-12},${sy+16} ${sx+12},${sy+16}" fill="#64748b" stroke="#94a3b8" stroke-width="1.2"/>`;
      s += `<line x1="${sx-16}" y1="${sy+16}" x2="${sx+16}" y2="${sy+16}" stroke="#64748b" stroke-width="1.5"/>`;
    });

    // Beam outline (undeflected)
    s += `<rect x="${ox}" y="${oy}" width="${L}" height="${bh}" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1" opacity="0.4" stroke-dasharray="4,3"/>`;

    // Deflected shape
    const pts = [];
    for (let i=0;i<=20;i++) {
      const x = ox + i/20*L;
      const xn = i/20;
      const dy = 4*sag*xn*(1-xn); // parabola
      pts.push(`${x},${oy+bh/2+dy}`);
    }
    s += `<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2.5"/>`;
    s += `<rect x="${ox}" y="${oy}" width="${L}" height="${bh/2}" fill="${color}" opacity="0.1"/>`;

    // Delta arrow
    s += `<line x1="${mid}" y1="${oy+bh/2}" x2="${mid}" y2="${oy+bh/2+sag-2}" stroke="${color}" stroke-width="1" stroke-dasharray="3,2"/>`;
    s += `<text x="${mid+5}" y="${oy+bh/2+sag/2+4}" fill="${color}" font-size="9" font-family="monospace">δ=${r2(b.dfl)}mm</text>`;

    // Limit line
    const limitY = oy + bh/2 + Math.min(28, 28);
    s += `<line x1="${ox+10}" y1="${limitY}" x2="${ox+L-10}" y2="${limitY}" stroke="#f59e0b" stroke-width="0.8" stroke-dasharray="5,3"/>`;
    s += `<text x="${ox+L-8}" y="${limitY-3}" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="end">L/250=${r2(b.dall)}mm</text>`;

    // Label
    s += `<text x="${W/2}" y="13" fill="${color}" font-size="9" font-weight="bold" text-anchor="middle" font-family="monospace">${(b.label||'Beam').slice(0,18)} — ${ok?'DEFLECTION OK':'DEFLECTION FAIL'}</text>`;
    s += `<text x="${W-4}" y="${H-4}" fill="#64748b" font-size="8" text-anchor="end" font-family="monospace">${r0(b.dfl/b.dall*100)}% of limit used</text>`;
    s += '</svg>';
    return s;
  }

  function svgShearDiagram(b, W, H) {
    const L = W-50, ox=25, oy=H/2;
    let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px">`;
    s += `<rect width="${W}" height="${H}" fill="#0a0f1e" rx="6"/>`;
    s += `<line x1="${ox}" y1="${oy}" x2="${ox+L}" y2="${oy}" stroke="#64748b" stroke-width="1"/>`;
    const V = b.RA; const scale = Math.min((H/2-14)/V, 2.5);
    // SFD trapezoid
    const pts = `${ox},${oy} ${ox},${oy-V*scale} ${ox+L},${oy+V*scale} ${ox+L},${oy}`;
    s += `<polygon points="${pts}" fill="rgba(251,146,60,0.2)" stroke="#fb923c" stroke-width="1.5"/>`;
    s += `<text x="${ox+5}" y="${oy-V*scale+12}" fill="#fb923c" font-size="9" font-family="monospace">+${r2(V)}kN</text>`;
    s += `<text x="${ox+L-5}" y="${oy+V*scale-4}" fill="#fb923c" font-size="9" font-family="monospace" text-anchor="end">-${r2(V)}kN</text>`;
    // Confinement zones
    const zoneL = Math.min(Math.max(2*b.D,b.L*1000/4)/1000, b.L*0.35);
    const zPx = zoneL/b.L*L;
    s += `<rect x="${ox}" y="${oy-H/2+8}" width="${zPx}" height="${H-16}" fill="rgba(248,113,113,0.08)" stroke="#f87171" stroke-width="0.8" stroke-dasharray="3,2"/>`;
    s += `<rect x="${ox+L-zPx}" y="${oy-H/2+8}" width="${zPx}" height="${H-16}" fill="rgba(248,113,113,0.08)" stroke="#f87171" stroke-width="0.8" stroke-dasharray="3,2"/>`;
    s += `<text x="${ox+zPx/2}" y="${H-5}" fill="#f87171" font-size="8" text-anchor="middle" font-family="monospace">T8@${b.svd}mm</text>`;
    s += `<text x="${ox+L/2}" y="${H-5}" fill="#34d399" font-size="8" text-anchor="middle" font-family="monospace">T8@${b.sv}mm</text>`;
    s += `<text x="${W/2}" y="11" fill="#f59e0b" font-size="9" font-weight="bold" text-anchor="middle" font-family="monospace">Shear Force Diagram</text>`;
    s += '</svg>';
    return s;
  }

  function svgBMD(b, W, H) {
    const L = W-50, ox=25, oy=8;
    const alpha = b.Mmax/(b.wu*b.L*b.L);
    const isCant = b.isCantilever;
    let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px">`;
    s += `<rect width="${W}" height="${H}" fill="#0a0f1e" rx="6"/>`;
    const baseY = oy + H*0.38;
    s += `<line x1="${ox}" y1="${baseY}" x2="${ox+L}" y2="${baseY}" stroke="#64748b" stroke-width="1"/>`;
    const scale = (H-oy-22)/Math.max(b.Mmax, b.Msup||0.01);
    if (isCant) {
      // Triangular hogging
      const pts2 = `${ox},${baseY} ${ox},${baseY-b.Mmax*scale} ${ox+L},${baseY}`;
      s += `<polygon points="${pts2}" fill="rgba(248,113,113,0.15)" stroke="#f87171" stroke-width="1.8"/>`;
      s += `<text x="${ox+8}" y="${baseY-b.Mmax*scale+12}" fill="#f87171" font-size="9" font-family="monospace">${r2(b.Mmax)}kN.m</text>`;
    } else {
      // Sagging parabola
      const pts3 = [];
      for(let i=0;i<=24;i++){const xn=i/24;pts3.push(`${ox+xn*L},${baseY+b.Mmax*scale*4*xn*(1-xn)}`);}
      s += `<polyline points="${pts3.join(' ')}" fill="none" stroke="#60a5fa" stroke-width="2"/>`;
      s += `<polygon points="${ox},${baseY} ${pts3.join(' ')} ${ox+L},${baseY}" fill="rgba(96,165,250,0.1)"/>`;
      // Hogging at supports
      if(b.Msup>0){
        const sh=b.Msup*scale;
        s+=`<polygon points="${ox},${baseY} ${ox},${baseY-sh} ${ox+L*0.25},${baseY}" fill="rgba(248,113,113,0.15)" stroke="#f87171" stroke-width="1.2"/>`;
        s+=`<polygon points="${ox+L},${baseY} ${ox+L},${baseY-sh} ${ox+L*0.75},${baseY}" fill="rgba(248,113,113,0.15)" stroke="#f87171" stroke-width="1.2"/>`;
        s+=`<text x="${ox+6}" y="${baseY-sh+11}" fill="#f87171" font-size="8" font-family="monospace">${r2(b.Msup)}</text>`;
      }
      s += `<text x="${ox+L/2}" y="${baseY+b.Mmax*scale+12}" fill="#60a5fa" font-size="9" text-anchor="middle" font-family="monospace">${r2(b.Mmax)}kN.m</text>`;
    }
    // Mulim line
    s += `<line x1="${ox}" y1="${baseY+b.Mulim*scale}" x2="${ox+L}" y2="${baseY+b.Mulim*scale}" stroke="#f59e0b" stroke-width="0.8" stroke-dasharray="4,3"/>`;
    s += `<text x="${ox+L-2}" y="${baseY+b.Mulim*scale-3}" fill="#f59e0b" font-size="8" text-anchor="end" font-family="monospace">Mulim=${r2(b.Mulim)}</text>`;
    s += `<text x="${W/2}" y="11" fill="#60a5fa" font-size="9" font-weight="bold" text-anchor="middle" font-family="monospace">Bending Moment Diagram</text>`;
    s += '</svg>';
    return s;
  }

  function svgCostBar(label, value, maxValue, color) {
    const pct = Math.min(value/maxValue*100, 100);
    return `<div style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px">
        <span style="color:var(--txt3)">${label}</span>
        <span style="color:${color};font-weight:700">Rs ${r0(value).replace(/\B(?=(\d{3})+(?!\d))/g,',')}</span>
      </div>
      <div style="height:10px;background:var(--bg3);border-radius:5px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:5px"></div>
      </div>
    </div>`;
  }

  function svgColumnLoad(W, H) {
    const floors = Math.min(S.numFloors, 5);
    const fh = (H-30)/floors;
    const cx = W/2, colW=18;
    let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px">`;
    s += `<rect width="${W}" height="${H}" fill="#0a0f1e" rx="6"/>`;
    let cumLoad = 0;
    const Ps_per_floor = c3 ? c3.Ps/S.numFloors : 100;
    for(let f=floors;f>=1;f--){
      const y = (floors-f)*fh+25;
      const floorLoad = Ps_per_floor;
      cumLoad += floorLoad;
      const pct = cumLoad/(c3?c3.Ps:cumLoad);
      const w = Math.max(8, colW*pct);
      // Column segment (gets visually thicker as load accumulates)
      s += `<rect x="${cx-w/2}" y="${y}" width="${w}" height="${fh*0.9}" fill="#4c1d95" stroke="#7c3aed" stroke-width="1" rx="1"/>`;
      // Floor slab
      s += `<rect x="${cx-45}" y="${y}" width="90" height="5" fill="#1e3a8a" stroke="#3b82f6" stroke-width="0.5" rx="1"/>`;
      // Load annotation
      s += `<text x="${cx+w/2+4}" y="${y+fh/2+4}" fill="#94a3b8" font-size="8" font-family="monospace">+${r0(floorLoad)}kN</text>`;
      s += `<text x="${cx-w/2-4}" y="${y+fh/2+4}" fill="#a78bfa" font-size="8" text-anchor="end" font-family="monospace">${r0(cumLoad)}kN</text>`;
    }
    // Footing
    s += `<rect x="${cx-35}" y="${25+floors*fh-5}" width="70" height="12" fill="#78350f" stroke="#fbbf24" stroke-width="1" rx="2"/>`;
    s += `<text x="${W/2}" y="14" fill="#a78bfa" font-size="9" font-weight="bold" text-anchor="middle" font-family="monospace">Column load accumulation</text>`;
    s += '</svg>';
    return s;
  }

  // ── LAYOUT HELPERS ───────────────────────────────────────────
  const P = (txt) => `<p style="font-size:13px;line-height:1.95;color:var(--txt2);margin:0 0 16px 0">${txt}</p>`;
  const H3 = (txt,col) => `<h3 style="font-size:15px;font-weight:800;color:${col||'var(--txt)'};margin:22px 0 10px 0">${txt}</h3>`;
  const EM = (txt,col) => `<span style="font-weight:700;color:${col||'var(--blue)'}">${txt}</span>`;
  const COST = (txt) => `<span style="font-weight:700;color:#fbbf24">💰 ${txt}</span>`;

  function Box(type,title,body){
    const cfg={
      good:   {bg:'rgba(52,211,153,0.07)', border:'#34d399', icon:'✓'},
      warn:   {bg:'rgba(245,158,11,0.08)',  border:'#f59e0b', icon:'⚠'},
      bad:    {bg:'rgba(248,113,113,0.08)', border:'#f87171', icon:'✗'},
      learn:  {bg:'rgba(167,139,250,0.07)', border:'#a78bfa', icon:'📖'},
      cost:   {bg:'rgba(251,191,36,0.07)',  border:'#fbbf24', icon:'💰'},
      idea:   {bg:'rgba(56,189,248,0.07)',  border:'#38bdf8', icon:'💡'},
    }[type]||{bg:'rgba(56,189,248,0.07)',border:'#38bdf8',icon:'ℹ'};
    return `<div style="margin:14px 0;padding:14px 16px;background:${cfg.bg};border-left:4px solid ${cfg.border};border-radius:0 8px 8px 0">
      <div style="font-size:10px;font-weight:800;color:${cfg.border};letter-spacing:0.8px;margin-bottom:6px">${cfg.icon} ${title}</div>
      <div style="font-size:12px;color:var(--txt2);line-height:1.75">${body}</div>
    </div>`;
  }

  function Section(icon,title,color,content){
    return `<div style="margin-bottom:36px">
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:2px solid ${color}28;margin-bottom:18px">
        <span style="font-size:26px">${icon}</span>
        <span style="font-size:18px;font-weight:900;color:${color}">${title}</span>
      </div>
      ${content}
    </div>`;
  }

  // ── SECTION 0: OVERALL VERDICT ───────────────────────────────
  const overall = Section('🏗️','Overall Structural Assessment','#38bdf8',`
    ${P(`You have designed a ${EM('G+'+(S.numFloors-1)+' residential RC frame building')} measuring ${EM(S.buildingL+'m × '+S.buildingW+'m')} in plan, ${EM(S.numFloors)} floors at ${EM(S.floorHt+'m')} floor-to-floor. Total height: ${EM(r2(S.numFloors*S.floorHt)+'m')}. This sits in ${EM('Seismic Zone '+S.zone)} — ${S.zone==='V'?'the highest seismic risk zone in India':S.zone==='IV'?'a high seismic risk zone':S.zone==='III'?'a moderate seismic risk zone':'a low seismic risk zone'}, making IS 13920 ductile detailing ${S.zone>='III'?'mandatory':'recommended'}.`)}

    ${P(`Materials: ${EM('M'+S.fck+' concrete')} (Ec = ${r0(mat.Ec)} N/mm²) with ${EM('Fe'+S.fy+'D steel')} (design yield = ${r2(mat.fyd)} N/mm²). ${S.fck<25?EM('⚠ M'+S.fck+' is below the IS 13920 minimum of M25 for seismic zones. This increases beam and column sizes and costs more in steel to compensate.','#f59e0b'):S.fck===25?'M25 is the code minimum — a sound choice for a residential building.':'M'+S.fck+' gives good capacity margins, allowing smaller sections.'}`)}

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin:16px 0">
      ${[
        ['Slab',slab.ok&&slab.ld_ok,'#38bdf8'],
        ['Beams',allBeamOk,'#f59e0b'],
        ['Columns',[c1,c2,c3].filter(Boolean).every(c=>c.safe),'#a78bfa'],
        ['Footings',ftgs.every(f=>f.punch_ok&&f.ow_ok&&f.Ld_ok),'#fbbf24'],
      ].map(([lbl,ok,col])=>`<div style="text-align:center;padding:12px;background:${ok?'rgba(52,211,153,0.1)':'rgba(248,113,113,0.1)'};border:1px solid ${ok?'#34d399':'#f87171'};border-radius:8px">
        <div style="font-size:22px;margin-bottom:4px">${ok?'✅':'❌'}</div>
        <div style="font-size:12px;font-weight:800;color:${col}">${lbl}</div>
        <div style="font-size:10px;color:${ok?'#34d399':'#f87171'};font-weight:700">${ok?'SAFE':'REVISE'}</div>
      </div>`).join('')}
    </div>

    ${!allBeamOk ? Box('bad','Beams Need Revision',`${failBeams.length} beam(s) fail: ${failBeams.map(b=>(b.label||'Beam')+' ('+(!b.deflOK?'deflection':'')+(!b.shearSafe?' shear':'')+')').join(', ')}. These must be fixed before construction drawings.`) : ''}
    ${overBeams.length>0 ? Box('cost','Over-designed Members Detected',`${overBeams.length} beam(s) use less than 40% of their capacity. These are larger than needed. Reducing them saves concrete volume and cost without compromising safety.`) : ''}
  `);

  // ── SECTION 1: MATERIALS & COST ──────────────────────────────
  const matSec = Section('🧱','Material Choices — First Decision, Biggest Impact','#34d399',`
    ${H3('Why material grade is the most important decision you make','#34d399')}
    ${P(`Everything downstream — beam depths, column sizes, footing areas — depends on what concrete and steel you choose. Let me walk you through the numbers so you understand the trade-offs.`)}

    ${P(`${EM('Concrete M'+S.fck+':')} The modulus of elasticity Ec = 5000√${S.fck} = ${EM(r0(mat.Ec)+' N/mm²')}. This controls how much your structure deflects. The limiting moment factor Mf = ${EM(r2(mat.Mf))} — think of this as how efficiently your concrete cross-section can carry moment before needing compression steel. ${S.fck===25?'At M25, Mf='+r2(mat.Mf)+'. If you moved to M30, Mf increases slightly but more importantly the column capacity formula (0.4×fck×Ac) improves by 20%, allowing smaller column sizes — which saves cost on concrete and formwork.':S.fck===30?'At M30, you get 20% better column capacity than M25 for the same size. Beam deflection also improves because Ec is higher. This is usually worth the small premium in concrete cost.':'Check whether this grade is available locally at reasonable cost.'}`)}

    ${P(`${EM('Steel Fe'+S.fy+'D:')} The design yield strength fyd = fy/1.15 = ${EM(r2(mat.fyd)+' N/mm²')}. Higher steel grade means you need less area (Ast ∝ 1/fy), which means fewer bars, easier placement on site, faster construction. ${S.fy===500?'Fe500D at fy=500 N/mm² is the optimum choice for India — it is the default IS 13920 requirement and widely available.':'Verify availability before finalising.'}`)}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0">
      <div>
        ${H3('Grade upgrade: what does it cost?','#fbbf24')}
        ${P(`Moving from M25 to M30 costs roughly Rs 400–500 more per m³ of concrete. For a ${S.buildingL}×${S.buildingW}m building with ${S.numFloors} floors, the total concrete volume is approximately ${r0(S.buildingL*S.buildingW*S.numFloors*0.12)} m³ (slab+beam+col). The upgrade costs ~Rs ${r0(S.buildingL*S.buildingW*S.numFloors*0.12*450).replace(/\B(?=(\d{3})+(?!\d))/g,',')} extra. BUT you can reduce column size by 25–50mm, saving formwork and concrete. Often it breaks even or saves money overall.`)}
      </div>
      <div>
        ${H3('Cover: hidden cost of corrosion','#f87171')}
        ${P(`Your cover is ${S.coverBeam}mm for beams and ${S.coverSlab}mm for slabs. IS 456 requires 40mm nominal cover for moderate exposure (most Indian cities). ${S.coverBeam<40?EM('Your beam cover of '+S.coverBeam+'mm is below the 40mm requirement — this is a durability risk. In 10–15 years, steel will corrode and concrete will spall off.','#f87171'):'Cover is adequate.'} Every 5mm of extra cover costs you effective depth d — which increases beam size to compensate. So the right cover is not minimum, but not excessive either.`)}
      </div>
    </div>

    ${Box('idea','Design Idea: Can we use less concrete overall?',`Yes — by optimising the slab thickness first (biggest volume member), then beam depths. Your slab at ${S.slabThk}mm uses ~${r2(S.slabThk/1000*S.buildingL*S.buildingW)} m³ per floor = ${r2(S.slabThk/1000*S.buildingL*S.buildingW*S.numFloors)} m³ total. If reduced to ${slabOptD}mm (IS 456 minimum), saving = ${r2((S.slabThk-slabOptD)/1000*S.buildingL*S.buildingW*S.numFloors)} m³ × Rs ${conc_cost}/m³ = ${COST('Rs '+r0((S.slabThk-slabOptD)/1000*S.buildingL*S.buildingW*S.numFloors*conc_cost).replace(/\B(?=(\d{3})+(?!\d))/g,','))} saved. This also reduces dead load, making beams, columns, and footings smaller — a cascade saving.`)}
  `);

  // ── SECTION 2: SLAB ──────────────────────────────────────────
  const slabSec = Section('🟦','Slab Analysis — The Largest Cost Item','#38bdf8',`
    ${H3('Understanding your slab','#38bdf8')}
    ${P(`Your ${EM(slab.twoWay?'two-way':'one-way')} slab spans ${EM(r2(slab.lx)+'m × '+r2(slab.ly)+'m')} with ly/lx = ${EM(r2(slab.ratio))}. ${slab.twoWay?`This is a two-way slab — it bends in both directions simultaneously, which distributes load to all four beams. Think of it like a trampoline fixed at all four edges. The shorter span (lx=${r2(slab.lx)}m) carries more load, so the main steel (T10@${slab.spx}mm) runs in that direction.`:`This is a one-way slab — it bends mainly in the ${r2(slab.lx)}m direction, like a plank. Load goes to the two beams on the short sides. The two beams on the long sides carry almost nothing from the slab.`}`)}

    ${H3('Thickness decision — where students often make mistakes','#38bdf8')}
    ${P(`You provided D = ${EM(S.slabThk+'mm')}. The IS 456 minimum effective depth is lx/26 = ${r2(slab.lx*1000)}/26 = ${r0(slab.lx*1000/26)}mm. Adding ${S.coverSlab}mm cover + 5mm bar radius = ${r0(slab.lx*1000/26+S.coverSlab+5)}mm → rounded to ${EM(slabOptD+'mm')}. ${S.slabThk>slabOptD+25?`Your ${S.slabThk}mm is ${S.slabThk-slabOptD}mm thicker than needed. This adds ${r2((S.slabThk-slabOptD)/1000*25)} kN/m² extra dead load to every beam. Over ${S.numFloors} floors and ${S.buildingL*S.buildingW} m² plan area, this is ${r2((S.slabThk-slabOptD)/1000*25*S.buildingL*S.buildingW*S.numFloors)} kN of unnecessary weight the structure must carry — right down to the footings.`:S.slabThk<=slabOptD?'Your slab is at or below the minimum recommended thickness. Verify the l/d check passes.':'Thickness is close to optimal.'}`)}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0">
      <div style="background:var(--bg1);border-radius:8px;padding:12px">
        ${H3('l/d Check','#38bdf8')}
        ${P(`l/d = ${r2(slab.lx*1000/slab.slabd)} vs limit 26 → ${slab.ld_ok?EM('PASS','#34d399'):EM('FAIL — increase D','#f87171')}`)}
        ${P(`This check ensures the slab will not deflect visibly. If l/d exceeds 26, you will see:
        <br>• Tiles cracking along the middle of the slab span within 1–2 years
        <br>• Doors and windows sticking because the frame distorts
        <br>• Plaster cracking on the ceiling below`)}
        ${slab.ld_ok ? Box('good','Deflection controlled','l/d = '+r2(slab.lx*1000/slab.slabd)+' is within the limit. The slab will not show visible sagging in service.') : Box('bad','Must fix','Increase slab thickness to '+slabOptD+'mm immediately. Use the Accept button in Design Summary.')}
      </div>
      <div style="background:var(--bg1);border-radius:8px;padding:12px">
        ${H3('Moment Check','#38bdf8')}
        ${P(`Mu = ${r2(slab.Mx)} kN.m/m vs Mulim = ${r2(slab.Mulim)} kN.m/m → ${slab.ok?EM('PASS','#34d399'):EM('FAIL','#f87171')}`)}
        ${P(`Main steel T10@${slab.spx}mm provides ${r0(1000*78.5/slab.spx)}mm²/m vs required ${r0(slab.Ax)}mm²/m.`)}
        ${P(`Distribution bars T8@${slab.spy}mm — these run perpendicular to the main bars and control cracking in the long direction. They are often omitted on site but are essential for durability.`)}
      </div>
    </div>

    ${Box('cost','Slab Cost Analysis',`
      Slab concrete volume: ${r2(S.slabThk/1000*S.buildingL*S.buildingW*S.numFloors)} m³ @ Rs ${conc_cost}/m³ = ${COST('Rs '+r0(S.slabThk/1000*S.buildingL*S.buildingW*S.numFloors*conc_cost).replace(/\B(?=(\d{3})+(?!\d))/g,','))} total<br>
      ${S.slabThk>slabOptD+25?`Potential saving by using ${slabOptD}mm: ${COST('Rs '+r0(slabConcSave).replace(/\B(?=(\d{3})+(?!\d))/g,','))} in concrete alone, plus reduced beam/column/footing costs.`:'Slab thickness is near-optimal — good design.'}<br>
      Shuttering (soffit formwork): ${r2(S.buildingL*S.buildingW*S.numFloors)} m² @ Rs ${shuttering}/m² = ${COST('Rs '+r0(S.buildingL*S.buildingW*S.numFloors*shuttering).replace(/\B(?=(\d{3})+(?!\d))/g,','))}
    `)}

    ${Box('warn','Critical site instruction: Top steel at supports',`Many slabs crack badly at column and beam supports because site workers omit the top bars. T8@${slab.spx_n}mm must be placed at the TOP of the slab, extending ${r0(slab.lx/5*1000)}mm from each support into the span. This steel resists the hogging moment — if absent, the slab cracks immediately above the support and the crack propagates downward until it is visible on the ceiling below.`)}
  `);

  // ── SECTION 3: BEAMS ─────────────────────────────────────────
  const beamSec = Section('🟧','Beam Analysis — Load Path and Structural Behaviour','#f59e0b',`
    ${H3('How your beams work together','#f59e0b')}
    ${P(`Your ${EM(beams.length+' beams')} form a grid that carries slab load to the columns. The average steel ratio across all beams is ${EM(r2(avgPt)+'%')}. ${avgPt<0.7?`This is low — most beams are larger than the minimum moment demand requires. This is often because the deflection check (not the moment check) is governing. A deeper but narrower beam can sometimes save material.`:avgPt>2.5?`This is high. Dense reinforcement makes concrete placement and compaction difficult. If steel ratio is consistently above 2%, consider increasing beam dimensions to reduce the steel.`:`This is in the practical range of 0.5–2.5% — beams are well-proportioned.`}`)}

    ${P(`Joint type understanding is essential. ${beams.filter(b=>b.endLeft==='column'&&b.endRight==='column').length} of your beams have ${EM('both ends into RC columns')} (fixed-fixed, α=1/16). ${beams.filter(b=>(b.endLeft==='wall'||b.endRight==='wall')&&!(b.endLeft==='wall'&&b.endRight==='wall')).length} have ${EM('one end into a column, one on a wall')} (α=1/10). ${beams.filter(b=>b.endLeft!=='column'&&b.endRight!=='column'&&!b.isCantilever).length} are ${EM('simply supported on walls')} (α=1/8 — highest moment). ${beams.filter(b=>b.isCantilever).length} are ${EM('cantilevers')} (α=1/2 at root). Getting these right can reduce beam steel by 20–40%.`)}

    ${beams.slice(0,Math.min(beams.length,4)).map((b,i) => {
      const deflU = b.dfl/b.dall;
      const momU  = b.Mmax/b.Mulim;
      const shU   = b.tv/b.tcmax;
      const over  = deflU<0.40 && momU<0.40;
      const wu_slab_pct = r0(b.wslab/(b.wslab+b.wsw+(b.ww||0))*100);
      return `<div style="margin-bottom:20px;padding:14px;background:var(--bg1);border-radius:10px;border:1px solid ${b.deflOK&&b.shearSafe?'var(--bg3)':'#f87171'}">
        <div style="font-size:13px;font-weight:800;color:var(--orange);margin-bottom:10px">${b.label||'Beam '+(i+1)} — L=${b.L}m, ${b.b}×${b.D}mm</div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
          <div>
            ${svgBMD(b, 200, 120)}
          </div>
          <div>
            ${svgDeflection(b, 200, 120)}
          </div>
        </div>
        ${svgShearDiagram(b, 400, 80)}

        <div style="margin-top:12px;font-size:12px;color:var(--txt2);line-height:1.8">
          <strong style="color:var(--orange)">Load composition:</strong> Slab load ${r2(b.wslab)} kN/m (${wu_slab_pct}%) + Self-weight ${r2(b.wsw)} kN/m${b.ww>0?' + Wall '+r2(b.ww)+' kN/m':''} = ${r2(b.wu/1.5)} kN/m unfactored → ${EM('wu = '+r2(b.wu)+' kN/m',' var(--orange)')} factored.<br>
          <strong>Moment:</strong> Mmax = ${r2(b.Mmax)} kN.m (${r0(momU*100)}% of Mulim=${r2(b.Mulim)} kN.m). ${momU>0.90?EM('Near capacity — little margin left.','#f59e0b'):momU<0.35?EM('Well below capacity — beam is over-sized.','#60a5fa'):'Good utilisation.'}<br>
          <strong>Deflection:</strong> ${r2(b.dfl)}mm vs limit ${r2(b.dall)}mm = ${r0(deflU*100)}% used. ${b.deflOK?(deflU<0.35?EM('Very low deflection — beam depth could likely be reduced by '+Math.ceil((b.D-b.econD)/25||25)+'mm without failing.','#60a5fa'):'Deflection well controlled.'):EM('FAILING — beam must be deepened to '+Math.ceil(b.D*Math.pow(deflU,1/3)/25+1)*25+'mm.','#f87171')}<br>
          <strong>Steel:</strong> ${b.nm}-T20 bottom (${r0(b.Ap)}mm²) + ${b.ns}-T20 top. pt = ${r2(b.pt)}%. ${b.pt>2.5?EM('High steel ratio — bars will be congested on site.','#f59e0b'):''}<br>
          <strong>Shear:</strong> T8@${b.svd}mm in confinement zones (${r0(Math.max(2*b.D,b.L*1000/4))}mm from supports) — IS 13920 mandatory. T8@${b.sv}mm in middle.
          ${over ? '<br>' + EM('⚠ This beam is over-designed. Depth could be '+b.econD+'mm instead of '+b.D+'mm, saving concrete and reducing dead load.','#60a5fa') : ''}
          ${!b.deflOK||!b.shearSafe ? '<br>' + EM('✗ This beam fails — use the fix button in Design Summary to apply the recommended depth.','#f87171') : ''}
        </div>
      </div>`;
    }).join('')}

    ${H3('What happens to your building when beams deflect','#f59e0b')}
    ${P(`Beam deflection is not just an abstract number. Here is what each level means in practice:`)}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin:10px 0 16px 0">
      ${[
        ['< L/500','Invisible','Tiles and plaster intact. No visible effects.','#34d399'],
        ['L/500–L/250','Noticeable to instruments','Floor tiles may show hairline cracks after 2–3 years.','#f59e0b'],
        ['L/250–L/150','Visible to trained eye','Door frames distort, plaster cracks at corners, tiles crack at midspan.','#f59e0b'],
        ['> L/150','Visible to anyone','Clear sag in floor, doors/windows stick, cracks in masonry below.','#f87171'],
      ].map(([ratio,vis,effect,col])=>`<div style="padding:10px;background:var(--bg1);border-radius:7px;border-top:3px solid ${col}">
        <div style="font-size:12px;font-weight:800;color:${col};margin-bottom:4px">${ratio}</div>
        <div style="font-size:11px;font-weight:700;color:var(--txt);margin-bottom:3px">${vis}</div>
        <div style="font-size:10px;color:var(--txt3)">${effect}</div>
      </div>`).join('')}
    </div>
    ${P(`Your worst-case deflection is ${EM(r2(worstDefl.dfl)+'mm')} in ${EM(worstDefl.label||'the critical beam')} against a limit of ${r2(worstDefl.dall)}mm. ${worstDefl.deflOK?`This is ${r0(worstDefl.dfl/worstDefl.dall*100)}% of the limit — your beam will remain in the "invisible to most" category during its service life. Good design.`:`This EXCEEDS the limit. Your floor will show visible cracking and door jamb distortion within 1–2 years of construction.`}`)}

    ${Box('cost','Beam Cost Optimisation',`
      Over-designed beams (${overBeams.length}) could be reduced in depth. Typical saving per beam:
      reducing D by 50mm on a ${r2((beams[0]||{b:230}).b)}mm wide, ${r2((beams[0]||{L:4}).L)}m beam = ${r2((beams[0]||{b:230}).b/1000*0.05*(beams[0]||{L:4}).L)} m³ concrete per beam.
      Over ${beams.length} beams × ${S.numFloors} floors = ${COST('Rs '+r0(overBeams.length*beams.length*(beams[0]||{b:230}).b/1000*0.05*((beams[0]||{L:4}).L)*conc_cost).replace(/\B(?=(\d{3})+(?!\d))/g,','))} potential savings.
      More importantly, shallower beams increase headroom — which improves the building's market value and allows lower parapet walls on each floor.
    `)}
  `);

  // ── SECTION 4: COLUMNS ───────────────────────────────────────
  const colSec = Section('🟪','Column Analysis — The Backbone','#a78bfa',`
    ${H3('How columns accumulate load from every floor','#a78bfa')}
    ${P(`This is the most important concept in column design. Look at the diagram below. Each floor adds its full weight to the column below. By the time we reach the ground floor, the column is carrying the weight of every floor above it. This is why ground floor columns are always the largest.`)}

    <div style="display:grid;grid-template-columns:160px 1fr;gap:16px;align-items:start;margin:14px 0">
      <div>${svgColumnLoad(160, 220)}</div>
      <div style="font-size:12px;color:var(--txt2);line-height:1.8">
        <strong style="color:var(--violet)">Corner column (Gnd floor):</strong> Ps = ${r2(c1?.Ps||0)} kN. Supports one quarter of the slab (tributary area = ${r2(c1?.ta||0)} m²). Pu = ${r2(c1?.Pu||0)} kN. Size: ${c1?.size||300}×${c1?.size||300}mm. Utilisation: ${r0((c1?.Pu||0)/(c1?.Pcap||1)*100)}%.<br><br>
        <strong style="color:var(--violet)">Edge column:</strong> Ps = ${r2(c2?.Ps||0)} kN. Supports half the slab (trib = ${r2(c2?.ta||0)} m²). Size: ${c2?.size||300}×${c2?.size||300}mm. Utilisation: ${r0((c2?.Pu||0)/(c2?.Pcap||1)*100)}%.<br><br>
        <strong style="color:var(--violet)">Interior column:</strong> Ps = ${r2(c3?.Ps||0)} kN. Heaviest — supports full tributary area of ${r2(c3?.ta||0)} m². Size: ${c3?.size||300}×${c3?.size||300}mm. Utilisation: ${r0(colUtil3*100)}%.<br><br>
        <strong>Key insight:</strong> The interior column carries ${c1?r0((c3?.Ps||1)/(c1?.Ps||1))+'×':''} the load of the corner column. Yet many students provide the same column size for all positions — this wastes material in corners and may under-design interior columns.
      </div>
    </div>

    ${H3('Slenderness — the invisible failure mode','#a78bfa')}
    ${P(`A column can fail in two ways: (1) crushing under compression, or (2) buckling sideways like a ruler under pressure. Buckling happens when the column is too slender — specifically when leff/D > 12 (IS 456 Cl 25.1). For your ${S.floorHt}m floor height with leff = 0.65×${S.floorHt*1000}mm = ${r0(S.floorHt*1000*0.65)}mm, the minimum column size for non-slenderness is ${r0(S.floorHt*1000*0.65/12)}mm → ${Math.ceil(S.floorHt*1000*0.65/12/25)*25}mm. ${c3?.short?`Your ${c3?.size||300}mm column gives leff/D = ${r2(c3?.lex||5)} < 12 — it is a ${EM('short column','#34d399')}. Crushing governs, which is the safer failure mode (it is gradual and detectable, not sudden).`:`Your column is slender (leff/D = ${r2(c3?.lex||13)} > 12). IS 456 Cl 39.7 requires ${EM('moment magnification','#f59e0b')} — the design moment is increased to account for the P-delta effect (the axial load amplifies the bending moment as the column deflects sideways).`}`)}

    ${H3('IS 13920 Confinement — Why it saves lives','#a78bfa')}
    ${P(`In an earthquake, the column ends — within ${r0(c3?.Lo||500)}mm from the joint — are subjected to very large repeated moments. Without closely-spaced ties in this zone, the concrete crushes and the bars buckle outward. The column fails suddenly and everything above collapses. With confinement (ties at ${r0(c3?.tsc||75)}mm centres here vs ${r0(c3?.ts||200)}mm in the general zone), the concrete is held together under large strains. The column can bend significantly without losing its load-carrying capacity — this is called ${EM('ductility')}, and it is what separates buildings that survive earthquakes from those that do not.`)}

    ${Box('cost','Column optimisation',`
      The IS 13920 minimum of 300mm means corner columns are often over-designed (utilisation ${r0((c1?.Pu||0)/(c1?.Pcap||1)*100)}%). This is code-mandated minimum — cannot reduce.
      Interior column utilisation is ${r0(colUtil3*100)}%. ${colUtil3<0.60?`At ${r0(colUtil3*100)}% utilisation, the column is conservative. If you upgrade to M30 concrete, the same size column can carry more load — or you could achieve the same capacity with a smaller section.`:'Well utilised.'}
      Column formwork (4 faces × height) costs more per m² than slab formwork. Fewer columns = more beam span = deeper beams. There is a design trade-off between adding columns (simpler members, less cost per column) and removing columns (more open plan, longer spans).
    `)}
  `);

  // ── SECTION 5: FOOTINGS ──────────────────────────────────────
  const ftgSec = Section('🟨','Foundation Analysis — The Most Unforgiving Member','#fbbf24',`
    ${H3('Why foundation design errors are the costliest','#fbbf24')}
    ${P(`Every structural error above ground can be repaired after construction, though expensively. A foundation error generally cannot be fixed at all — you would have to underpin the entire building. This is why foundation design requires the most conservative approach and why a proper soil investigation is not optional.`)}

    ${P(`Your footings are designed for a Safe Bearing Capacity of ${EM(S.soilBearing+' kN/m²')} at a depth of ${EM(S.ftgDepth+'m')} below ground level. Net SBC = ${S.soilBearing} - 18×${S.ftgDepth} = ${EM(r2(S.soilBearing-18*S.ftgDepth)+' kN/m²')}. ${S.soilBearing>=200?'This is a reasonable SBC for alluvial soils in cities like Delhi, Lucknow, or Ahmedabad. Always verify with an actual soil investigation report.':S.soilBearing<120?EM('This is low SBC — indicates soft clay or silty soil. Footings will be large. Consider: (1) deeper foundation to reach better strata, (2) ground improvement (stone columns, dynamic compaction), or (3) raft foundation.','#f59e0b'):'Moderate SBC. Verify actual value from SI report.'}`)}

    ${H3('The three checks — and which one really governs','#fbbf24')}
    ${P(`Most students think footing size is governed by bearing capacity. Actually, it is governed by ${EM('punching shear')} — the tendency of the column to punch through the footing like a cookie cutter. Here is how the three checks relate:`)}

    <div style="overflow-x:auto;margin:12px 0">
      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <tr style="background:var(--bg3)">
          <th style="padding:8px;text-align:left">Check</th>
          <th style="padding:8px">CF (${f3?.lbl||'Interior'})</th>
          <th style="padding:8px">EF (${f2?.lbl||'Edge'})</th>
          <th style="padding:8px">IF (${f1?.lbl||'Corner'})</th>
          <th style="padding:8px;text-align:left">What it means</th>
        </tr>
        <tr style="border-bottom:1px solid var(--bg3)">
          <td style="padding:8px;color:var(--txt2)">Plan size B</td>
          <td style="padding:8px;text-align:center;color:var(--yellow)">${r2(f3?.Bf||0)}m</td>
          <td style="padding:8px;text-align:center;color:var(--yellow)">${r2(f2?.Bf||0)}m</td>
          <td style="padding:8px;text-align:center;color:var(--yellow)">${r2(f1?.Bf||0)}m</td>
          <td style="padding:8px;color:var(--txt3)">Governs by bearing: Ps/SBC_net</td>
        </tr>
        <tr style="border-bottom:1px solid var(--bg3)">
          <td style="padding:8px;color:var(--txt2)">Punching shear</td>
          <td style="padding:8px;text-align:center;color:${f3?.punch_ok?'#34d399':'#f87171'}">${f3?r2(f3.tvp)+'/'+r2(f3.tcp):'-'} ${f3?.punch_ok?'✓':'✗'}</td>
          <td style="padding:8px;text-align:center;color:${f2?.punch_ok?'#34d399':'#f87171'}">${f2?r2(f2.tvp)+'/'+r2(f2.tcp):'-'} ${f2?.punch_ok?'✓':'✗'}</td>
          <td style="padding:8px;text-align:center;color:${f1?.punch_ok?'#34d399':'#f87171'}">${f1?r2(f1.tvp)+'/'+r2(f1.tcp):'-'} ${f1?.punch_ok?'✓':'✗'}</td>
          <td style="padding:8px;color:var(--txt3)">tv/tc N/mm² — governs depth D</td>
        </tr>
        <tr>
          <td style="padding:8px;color:var(--txt2)">Dev. length</td>
          <td style="padding:8px;text-align:center;color:${f3?.Ld_ok?'#34d399':'#f87171'}">${f3?.Ld_ok?'OK':'FAIL'} ${f3?.Ld_ok?'✓':'✗'}</td>
          <td style="padding:8px;text-align:center;color:${f2?.Ld_ok?'#34d399':'#f87171'}">${f2?.Ld_ok?'OK':'FAIL'} ${f2?.Ld_ok?'✓':'✗'}</td>
          <td style="padding:8px;text-align:center;color:${f1?.Ld_ok?'#34d399':'#f87171'}">${f1?.Ld_ok?'OK':'FAIL'} ${f1?.Ld_ok?'✓':'✗'}</td>
          <td style="padding:8px;color:var(--txt3)">Bar must bond before reaching column face</td>
        </tr>
      </table>
    </div>

    ${P(`The interior footing carries ${EM(r2(f3?.Ps||0)+' kN')} service load, requiring a ${EM(r2(f3?.Bf||0)+'m × '+r2(f3?.Bf||0)+'m')} plan area (${r2((f3?.Bf||1)*(f3?.Bf||1))} m²) at depth ${r0(f3?.D||350)}mm. At full scale, this is a concrete block about ${r2((f3?.Bf||1.5))}m on each side and ${r0((f3?.D||350))}mm deep — sitting silently under your building for its entire lifetime.`)}

    ${Box('warn','What happens if footing SBC assumption is wrong',`If the actual SBC is lower than ${S.soilBearing} kN/m² — say 120 kN/m² due to undetected weak layer — your footing soil pressure of ${r2(f3?.qu||100)} kN/m² exceeds the actual capacity. The soil flows plastically under the footing. The column settles. Differential settlement between interior (more loaded) and corner (less loaded) footings causes the slab to crack diagonally at corners — this is the most common structural failure visible in older Indian buildings. The fix is underpinning — extremely expensive and disruptive. The prevention is a proper soil investigation before design.`)}

    ${Box('idea','Consider a raft foundation if SBC < 120 kN/m²',`When individual footings become very large (B > 1.5m) and spaced closely, the total footing area starts approaching 50% of the building footprint. At that point, a raft foundation (one continuous slab under the whole building, 300–400mm thick) becomes economical. A raft:
    1. Distributes load over 100% of the plan area, reducing soil pressure dramatically.
    2. Ties all columns together, reducing differential settlement.
    3. Acts as a waterproof barrier against rising damp.
    Cost: approximately Rs 600–800/m² (concrete + steel + formwork). For a ${S.buildingL}×${S.buildingW}m building: ~${COST('Rs '+r0(S.buildingL*S.buildingW*700).replace(/\B(?=(\d{3})+(?!\d))/g,','))} total. Compare this with ${ftgs.length} individual footings + ground beams.`)}

    ${Box('cost','Footing cost breakdown',`
      Interior footing concrete: ${r2((f3?.Bf||1.5)*(f3?.Bf||1.5)*(f3?.D||0.35)/1000)} m³ × Rs ${conc_cost} = ${COST('Rs '+r0((f3?.Bf||1.5)*(f3?.Bf||1.5)*(f3?.D||350)/1000*conc_cost).replace(/\B(?=(\d{3})+(?!\d))/g,','))}<br>
      PCC blinding below (75mm): ${r2((f3?.Bf||1.5)*(f3?.Bf||1.5)*0.075)} m³ × Rs 4500 = mandatory, often omitted on site — do not omit it.<br>
      Excavation: ${r2((f3?.Bf||1.5)*(f3?.Bf||1.5)*(S.ftgDepth+0.075+f3?.D/1000||0.5))} m³ × Rs 350–500 (manual) or Rs 200 (machine)<br>
      Total per interior footing ≈ ${COST('Rs '+r0((f3?.Bf||1.5)*(f3?.Bf||1.5)*((f3?.D||350)/1000*conc_cost+(S.ftgDepth||1.5)*400)).replace(/\B(?=(\d{3})+(?!\d))/g,','))}
    `)}
  `);

  // ── SECTION 6: SEISMIC ───────────────────────────────────────
  const seisSec = Section('🌍','Seismic and Wind Analysis — How the Building Behaves Under Lateral Forces','#34d399',`
    ${H3('Understanding the equivalent static method','#34d399')}
    ${P(`The IS 1893:2016 Equivalent Static Method converts the dynamic earthquake motion into a single static horizontal force. This force — the Base Shear ${EM('Vb = '+r2(seis.Vb)+' kN')} — acts at the base of the building and is distributed upward to each floor based on the height and weight of that floor.`)}

    ${P(`How was Vb calculated? First, the fundamental period: Ta = 0.09H/√d = 0.09×${r2(S.numFloors*S.floorHt)}/√${S.buildingW} = ${EM(r2(seis.Ta)+'s')}. This is how long your building takes to complete one full oscillation if pushed sideways. The Sa/g value is read directly from the IS 1893:2016 response spectrum for soil Type ${S.soilType} — giving Sa/g = ${r2(seis.Sa)}. Whether you're on the flat plateau (worst case, Sa/g = 2.5) or the descending branch depends on the soil type AND the period.`)}

    ${P(`The seismic weight is W = ${EM(r0(seis.Wt)+' kN')} (full DL + 25% LL, IS 1893 Cl 7.3.1). The design horizontal acceleration is Ah = (Z/2)×(Sa/g)/R×I = ${EM(seis.Ah.toFixed(4))}. So every kN of your building's weight generates ${r2(seis.Ah*1000)} N of horizontal force. ${EM('Vb = Ah×W = '+r2(seis.Vb)+' kN')} total horizontal force at the base.`)}

    ${P(`Compare this with wind: wind generates approximately ${r2(wind.pz)} kN/m² pressure. For your ${S.buildingL}m wide building over ${S.numFloors} floors, total wind force ≈ ${r2(wind.Fw*S.buildingL*S.numFloors*S.floorHt/2)} kN. ${seisGoverns?EM('Seismic governs','#34d399')+' — your design must resist the seismic base shear. Wind is smaller and automatically covered.':EM('Wind governs in this case','#f59e0b')+' — design for wind load. Seismic is automatically covered.'}`)}

    ${H3('How seismic force is distributed across floors','#34d399')}
    ${P(`IS 1893 Clause 7.6.3 distributes Vb using Wi×Hi² — taller floors get disproportionately more force. This is the "inverted triangle" distribution: the top floor gets the highest force, even though it has the same weight as lower floors. This is because the inertia effect (the tendency of mass to stay put while the ground moves) amplifies at height. The ground floor storey shear equals the total base shear (${r2(seis.Vb)} kN) — this is what every column and footing at ground level must resist horizontally.`)}

    <div style="overflow-x:auto;margin:12px 0">
      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <tr style="background:var(--bg3)"><th style="padding:7px;text-align:left">Floor</th><th style="padding:7px">Height</th><th style="padding:7px">Wi (kN)</th><th style="padding:7px">Qi (kN)</th><th style="padding:7px">Vi (kN)</th><th style="padding:7px;text-align:left">% of Vb</th></tr>
        ${seis.floors.slice().reverse().map(f=>`<tr style="border-bottom:1px solid var(--bg3)">
          <td style="padding:7px;color:var(--txt2)">Floor ${f.floor}</td>
          <td style="padding:7px;text-align:center">${r2(f.h)}m</td>
          <td style="padding:7px;text-align:center">${r0(f.W)}</td>
          <td style="padding:7px;text-align:center;color:#34d399">${r2(f.Qi)}</td>
          <td style="padding:7px;text-align:center;color:#38bdf8">${r2(f.Vi)}</td>
          <td style="padding:7px"><div style="height:8px;background:rgba(56,189,248,0.15);border-radius:3px"><div style="height:100%;width:${r0(f.Qi/seis.Vb*100)}%;background:#38bdf8;border-radius:3px"></div></div></td>
        </tr>`).join('')}
      </table>
    </div>

    ${Box('idea','Improving seismic performance without adding cost',`1. ${EM('Symmetric plan:')} An irregular or asymmetric building twists during earthquakes (torsion), multiplying forces. Your ${S.buildingL}m×${S.buildingW}m rectangular plan is good — avoid irregular shapes.
    2. ${EM('Avoid soft storeys:')} If ground floor has less walls/columns than upper floors (open parking), it acts as a weak link and collapses first. IS 1893 requires soft storey to be designed for 2.5× the storey shear.
    3. ${EM('Short columns are dangerous:')} A column that is partially embedded in a wall becomes shorter than its neighbours. The full storey shear concentrates in the short column — very common failure in schools and hospitals where windows extend half the wall height.
    4. ${EM('Joint design:')} Your beam-column joints must be able to resist the beam moment reversal during an earthquake. This is why IS 13920 mandates transverse reinforcement through every joint. This costs almost nothing in steel but is often omitted on site.`)}
  `);

  // ── SECTION 7: OVERALL ECONOMY ───────────────────────────────
  const econSec = Section('💰','Construction Economy — Where Your Money Is Going','#fbbf24',`
    ${H3('The three biggest cost drivers','#fbbf24')}

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin:12px 0 20px 0">
      ${[
        ['Slab (concrete+steel+shuttering)', r0(S.slabThk/1000*S.buildingL*S.buildingW*S.numFloors*(conc_cost+steel_cost*80)+S.buildingL*S.buildingW*S.numFloors*shuttering), '#38bdf8', 'Largest volume member. Every mm of excess thickness costs significantly across the whole building.'],
        ['Beams (concrete+steel+shuttering)', r0(beams.length*0.23*0.4*(beams[0]?.L||4)*S.numFloors*(conc_cost+steel_cost*120)+beams.length*(beams[0]?.L||4)*S.numFloors*0.7*shuttering), '#f59e0b', 'Beam depth drives shuttering cost (soffit). Deeper beams = taller and heavier prop-and-plank system.'],
        ['Columns (concrete+steel+shuttering)', r0((RES.gridSummary?.nCols||12)*S.numFloors*(0.3*0.3*S.floorHt*conc_cost+0.012*0.3*0.3*S.floorHt*7850*steel_cost)), '#a78bfa', 'Column formwork is expensive per m³ (4 faces, multiple lifts). Reducing column count by adding intermediate beams is sometimes false economy.'],
        ['Foundations (footing+excavation+PCC)', r0(ftgs.length*((f3?.Bf||1.5)*(f3?.Bf||1.5)*(f3?.D||0.35)/1000*conc_cost+(f3?.Bf||1.5)*(f3?.Bf||1.5)*S.ftgDepth*400)), '#fbbf24', 'Foundation cost is one-time. Spending on soil investigation reduces risk of this becoming much more expensive if footings need redesign.'],
      ].map(([label,val,col,tip])=>`<div style="background:var(--bg1);border-radius:8px;padding:12px">
        <div style="font-size:10px;color:var(--txt3);margin-bottom:4px">${label}</div>
        <div style="font-size:22px;font-weight:900;color:${col}">Rs ${(val+'').replace(/\B(?=(\d{3})+(?!\d))/g,',')}</div>
        <div style="font-size:10px;color:var(--txt3);margin-top:6px;line-height:1.6">${tip}</div>
      </div>`).join('')}
    </div>

    ${H3('Top 5 changes that reduce cost without reducing safety','#fbbf24')}
    ${[
      overBeams.length>0 ? `${EM('1. Reduce over-designed beam depths:')} ${overBeams.length} beam(s) use less than 40% capacity. Reducing depth by 50mm each: saves concrete, reduces dead load, improves headroom. Estimated saving: ${COST('Rs '+r0(overBeams.length*S.numFloors*0.05*(overBeams[0]||beams[0]||{b:230}).b/1000*((overBeams[0]||beams[0]||{L:4}).L)*conc_cost).replace(/\B(?=(\d{3})+(?!\d))/g,','))} and further cascade savings.` : null,
      S.slabThk>slabOptD+25 ? `${EM('2. Reduce slab thickness to '+slabOptD+'mm:')} Current ${S.slabThk}mm is ${S.slabThk-slabOptD}mm more than IS 456 minimum. Direct saving: ${COST('Rs '+r0(slabConcSave).replace(/\B(?=(\d{3})+(?!\d))/g,','))} in concrete plus cascade reduction in beam/column/footing loads.` : null,
      S.fck<30 ? `${EM('3. Upgrade concrete to M30:')} Additional cost Rs 400/m³ in concrete, but allows 10–15% smaller column sections, reducing formwork and column concrete volume. Often net saving.` : null,
      `${EM('4. Rationalise span layout:')} Beams with L > 5m are expensive (deep sections, heavy steel, large deflection risk). Adding one column at midspan of a 6m beam creates two 3m spans — deflection reduces 16×, steel reduces 60%, beam depth halves. The column costs less than the beam saving.`,
      `${EM('5. Use AAC (autoclaved aerated concrete) blocks instead of brick:')} Wall load reduces from ~12 kN/m to ~5 kN/m. For ${S.numFloors} floors, wall load reduction = ${r2(7*S.numFloors*(S.buildingL*2+S.buildingW*2))} kN. This directly reduces beam loads — potential 10–15% reduction in beam steel.`,
    ].filter(Boolean).map(s=>`<p style="font-size:12px;line-height:1.85;color:var(--txt2);margin:0 0 10px 0;padding-left:14px;border-left:3px solid #fbbf24">${s}</p>`).join('')}

    ${Box('idea','The most impactful change you can make right now',`Use the Parametric Explorer (🔬 in sidebar). Set Slab Thickness to ${slabOptD}mm and see the cascade saving across every member. Then try increasing Concrete Grade to M30 and observe how column sizes can reduce. These two changes together typically save 8–15% of total structural cost in a residential building.`)}
  `);

  // ── ASSEMBLE ─────────────────────────────────────────────────
  return `<div class="card" style="max-width:900px;margin:0 auto">
    <div class="ct">Detailed Analysis Discussion</div>
    <div class="cd" style="font-size:12px;line-height:1.8">A complete narrative discussion of your structural analysis — what every number means, how the structure will behave once built, what can be improved, and what it all costs. Read this alongside the Full Report.</div>
    <div style="padding:4px 0 20px 0">
      ${overall}
      ${matSec}
      ${slabSec}
      ${beamSec}
      ${colSec}
      ${ftgSec}
      ${seisSec}
      ${econSec}
    </div>
    <div style="padding:14px;background:var(--bg1);border-radius:8px;font-size:11px;color:var(--txt3);line-height:1.8;margin-top:8px">
      <strong style="color:var(--txt2)">Disclaimer:</strong> This discussion is for educational purposes only. All designs must be reviewed and certified by a licensed Structural Engineer before use in construction. Cost estimates are approximate and based on typical Indian market rates (2024) — actual costs depend on location, contractor, and market conditions.
    </div>
  </div>`;
}


// == 21_construction_pdf.js ==

// ================================================================
// MODULE: 21_construction_pdf  —  Engineering Drawing Package v3
// A3 landscape · White background · Professional Indian format
// 12 sheets · All layout bugs fixed · Min 6.5pt text
// ================================================================

function showConstructionPDFDialog() {
  if (!RES) { alert('Run analysis first.'); return; }
  const fails=[!RES.slab.ok,!RES.slab.ld_ok,
    ...(RES.allBeams||RES.beams).flatMap(b=>[!b.deflOK,!b.shearSafe]),
    ...RES.cols.filter(c=>c.floor===1).map(c=>!c.safe),
    ...(RES.allFtgs||RES.ftgs).flatMap(f=>[!f.punch_ok,!f.ow_ok])
  ].filter(Boolean).length;
  const old=document.getElementById('cpdDlg');if(old)old.remove();
  const d=document.createElement('div');
  d.id='cpdDlg';
  d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  d.innerHTML=`<div style="background:#0a0f1e;border:1.5px solid #1e40af;border-radius:12px;max-width:540px;width:100%;padding:28px">
    <div style="font-size:19px;font-weight:900;color:#38bdf8;margin-bottom:6px">Generate Construction Drawing Package</div>
    <div style="font-size:11px;color:#64748b;margin-bottom:16px">A3 landscape · Indian structural drawing format · 12 sheets</div>
    ${fails>0?`<div style="padding:10px 14px;background:rgba(248,113,113,0.1);border:1px solid #f87171;border-radius:8px;font-size:11px;color:#fca5a5;margin-bottom:14px">Warning: ${fails} check(s) fail. Fix in Design Summary before generating.</div>`:`<div style="padding:10px 14px;background:rgba(52,211,153,0.1);border:1px solid #34d399;border-radius:8px;font-size:11px;color:#6ee7b7;margin-bottom:14px">All checks pass — ready for drawing generation.</div>`}
    <div style="font-size:11px;color:#94a3b8;columns:2;column-gap:20px;line-height:2.2;margin-bottom:16px">
      ST/TP01 — Title Page &amp; Index<br>ST/TN01 — Technical Notes<br>ST/FD01 — Footing Layout Plan<br>ST/FD02 — Footing Detail<br>ST/CL01 — Column Layout Plan<br>ST/CL02 — Column Detail<br>
      ST/BM01 — Beam Layout Plan<br>ST/BM02 — Beam Detail<br>ST/SL01 — Slab Detail<br>ST/BB01 — Bar Bending Schedule<br>ST/EL01 — Building Elevation<br>ST/SC01 — Staircase Detail
    </div>
    <div style="padding:10px 12px;background:rgba(245,158,11,0.1);border:1px solid #f59e0b;border-radius:7px;font-size:10px;color:#fcd34d;margin-bottom:18px;line-height:1.7">
      FOR EDUCATIONAL PURPOSE ONLY. All drawings must be reviewed and certified by a licensed Structural Engineer before use in actual construction.
    </div>
    <div style="display:flex;gap:12px;justify-content:flex-end">
      <button onclick="document.getElementById('cpdDlg').remove()" style="padding:9px 20px;background:transparent;border:1px solid #64748b;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px">Cancel</button>
      <button onclick="document.getElementById('cpdDlg').remove();startConstructionPDF()" style="padding:9px 22px;background:#1d4ed8;border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px;font-weight:700">Generate 12 Sheets</button>
    </div>
  </div>`;
  document.body.appendChild(d);
}

async function startConstructionPDF() {
  if (!RES) return;
  const ov=document.createElement('div');
  ov.id='cpdOv';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px';
  ov.innerHTML=`<div style="font-size:24px">&#128208;</div>
    <div style="font-size:14px;font-weight:700;color:#38bdf8">Generating 12-Sheet Drawing Package...</div>
    <div id="cpdLog" style="font-size:10px;color:#64748b;font-family:monospace;text-align:center;line-height:2.2;min-height:60px;max-width:380px"></div>
    <div style="width:280px;height:5px;background:#1e3a8a;border-radius:3px;overflow:hidden">
      <div id="cpdBar" style="height:100%;width:0%;background:#38bdf8;border-radius:3px;transition:width 0.25s"></div>
    </div>`;
  document.body.appendChild(ov);
  const log=(m,p)=>{const e=document.getElementById('cpdLog');if(e)e.innerHTML+=`<div>${m}</div>`;const b=document.getElementById('cpdBar');if(b&&p)b.style.width=p+'%';};
  await new Promise(r=>setTimeout(r,50));

  try {
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a3'});

    // ── PAGE CONSTANTS ────────────────────────────────────────────
    const PW=420,PH=297;
    const MARGIN=5;
    const NC_W=62;            // notes column width
    const TB_H=42;            // title block height
    const TB_W=135;           // title block width (right portion)
    const DR_X=MARGIN+NC_W+1; // drawing area left = 68mm
    const DR_Y=MARGIN+1;      // drawing area top = 6mm
    const DR_W=PW-MARGIN-NC_W-MARGIN-1;  // 349mm
    const DRAW_BOT=PH-MARGIN-TB_H;       // 250mm (top of title block)
    const DR_H=DRAW_BOT-DR_Y;            // 244mm drawing height
    const TB_X=DR_X+DR_W-TB_W;           // title block x start

    // ── SAFE TEXT ─────────────────────────────────────────────────
    const s2=t=>{let o='';for(const c of String(t||'')){const cd=c.charCodeAt(0);if(cd>=32&&cd<=126)o+=c;else if(c==='°')o+=' deg';else if(c==='×')o+='x';}return o;};
    const n=v=>{const x=parseFloat(v);return isFinite(x)?x:0;};

    // ── DRAWING PRIMITIVES ────────────────────────────────────────
    const F=(sz,wt,r,g,b)=>{doc.setFont('helvetica',wt||'normal');doc.setFontSize(Math.max(5,n(sz)));doc.setTextColor(n(r)||0,n(g)||0,n(b)||0);};
    const LC=(r,g,b)=>doc.setDrawColor(n(r),n(g),n(b));
    const FC=(r,g,b)=>doc.setFillColor(n(r),n(g),n(b));
    const LW=w=>doc.setLineWidth(Math.max(0.05,n(w)));
    const Rect=(x,y,w,h,s)=>{const a=n(x),b2=n(y),c=Math.max(0.1,n(w)),d=Math.max(0.1,n(h));if(isFinite(a+b2))doc.rect(a,b2,c,d,s||'F');};
    const Line=(x1,y1,x2,y2)=>{if(isFinite(n(x1)+n(y1)+n(x2)+n(y2)))doc.line(n(x1),n(y1),n(x2),n(y2));};
    const Txt=(t2,x,y,opts)=>{const str=s2(t2);if(str&&isFinite(n(x)+n(y)))doc.text(str,n(x),n(y),opts||{});};
    const TW=(t2,x,y,mw)=>{const ls=doc.splitTextToSize(s2(String(t2||'')),Math.max(1,n(mw)));if(ls.length&&isFinite(n(x)+n(y)))doc.text(ls,n(x),n(y));return ls.length;};

    // ── FEET-INCHES ───────────────────────────────────────────────
    const ftin=(m)=>{
      const ti=n(m)*39.3701;
      const ft=Math.floor(ti/12);
      const inR=Math.round((ti%12)*2)/2;
      if(inR===0)return ft+"'-0\"";
      if(inR===Math.floor(inR))return ft+"'-"+Math.floor(inR)+"\"";
      return ft+"'-"+Math.floor(inR)+"1/2\"";
    };
    const mm2ft=(mm)=>ftin(n(mm)/1000);

    // ── SCALE BAR ─────────────────────────────────────────────────
    const drawScaleBar = (x, y, scaleRatio, realMetres) => {
      // scaleRatio e.g. 100 means 1:100
      // realMetres e.g. 5 means the bar represents 5 metres
      const barMm = realMetres * 1000 / scaleRatio; // bar length in mm on paper
      const segments = 5;
      const segW = barMm / segments;
      F(5.5,'bold',0,0,0); Txt('SCALE 1:'+scaleRatio, x, y-2);
      // Alternating black/white segments
      for(let i=0;i<segments;i++){
        const sx = x + i*segW;
        FC(i%2===0?0:255,i%2===0?0:255,i%2===0?0:255);
        LC(0,0,0);LW(0.2);Rect(sx,y,segW,3,'FD');
      }
      // Labels at 0, half, full
      F(5,'normal',0,0,0);
      Txt('0',x,y+6,{align:'center'});
      Txt(r0(realMetres/2)+'m',x+barMm/2,y+6,{align:'center'});
      Txt(realMetres+'m',x+barMm,y+6,{align:'center'});
      // Metre label
      F(5,'italic',80,80,80);Txt('('+realMetres+'m)',x+barMm+2,y+2);
    };


    // ── ENGINEERING DRAWING TOOLS ─────────────────────────────────
    // Horizontal dim line (clean, with end ticks)
    const DH=(x1,x2,y,label,above)=>{
      const ay=above?y-5:y+5;
      LC(0,0,0);LW(0.15);
      Line(x1,y,x1,ay);Line(x2,y,x2,ay);Line(x1,ay,x2,ay);
      // Small ticks at ends
      Line(x1,ay-1,x1,ay+1);Line(x2,ay-1,x2,ay+1);
      F(6,'normal',0,0,0);Txt(label,(x1+x2)/2,above?ay-1.5:ay+4,{align:'center'});
    };
    // Vertical dim line
    const DV=(x,y1,y2,label,lft)=>{
      const ax=lft?x-5:x+5;
      LC(0,0,0);LW(0.15);
      Line(x,y1,ax,y1);Line(x,y2,ax,y2);Line(ax,y1,ax,y2);
      Line(ax-1,y1,ax+1,y1);Line(ax-1,y2,ax+1,y2);
      F(6,'normal',0,0,0);Txt(label,lft?ax-1.5:ax+1.5,(y1+y2)/2,{angle:90,align:'center'});
    };
    // Leader line: dot at bar, line to label
    const Ld=(x1,y1,x2,y2,label,sz)=>{
      LC(0,0,0);LW(0.25);
      FC(0,0,0);doc.circle(n(x1),n(y1),0.7,'F');
      Line(x1,y1,x2,y2);
      // Short horizontal tail
      Line(x2,y2,x2+8,y2);
      F(sz||6.5,'normal',0,0,0);Txt(label,x2+9,y2+1);
    };
    // Concrete hatch — LIGHT, sparse (won't obscure bars)
    const Hatch=(x,y,w,h)=>{
      LC(190,190,190);LW(0.08);
      doc.setLineDashPattern([0.5,2],0);
      const sp=5;
      for(let d=0;d<n(w)+n(h);d+=sp){
        const x1a=n(x)+Math.min(d,n(w)),y1a=n(y)+Math.max(0,d-n(w));
        const x2a=n(x)+Math.max(0,d-n(h)),y2a=n(y)+Math.min(d,n(h));
        Line(x1a,y1a,x2a,y2a);
      }
      doc.setLineDashPattern([],0);
    };
    // Rebar dot (solid black — clearly visible)
    const Rebar=(cx,cy,r2)=>{FC(0,0,0);doc.circle(n(cx),n(cy),Math.max(0.8,n(r2)),'F');};
    // Open rebar dot (distribution/secondary bars)
    const RebarOpen=(cx,cy,r2)=>{LC(0,0,0);LW(0.3);doc.circle(n(cx),n(cy),Math.max(0.7,n(r2)),'D');};
    // Stirrup rectangle with hooks
    const Stirrup=(x,y,w,h)=>{LC(0,0,0);LW(0.5);doc.rect(n(x),n(y),n(w),n(h),'D');LW(0.35);Line(x,y,x-1.8,y-1.8);Line(x+w,y,x+w+1.8,y-1.8);};

    // ── NOTES COLUMN — on every page ──────────────────────────────
    let pgN=0;
    const drawPage=(code,title,scale)=>{
      // White background
      FC(255,255,255);Rect(0,0,PW,PH,'F');
      // Outer border (double line effect)
      LC(0,0,0);LW(1.0);Rect(MARGIN,MARGIN,PW-2*MARGIN,PH-2*MARGIN,'D');
      LW(0.3);Rect(MARGIN+1.5,MARGIN+1.5,PW-2*MARGIN-3,PH-2*MARGIN-3,'D');
      // Notes column right border
      LW(0.5);Line(MARGIN+NC_W,MARGIN,MARGIN+NC_W,PH-MARGIN);
      // Title block bottom border
      Line(TB_X,DRAW_BOT,PW-MARGIN,DRAW_BOT);

      // ── NOTES COLUMN CONTENT ──────────────────────────────────
      let ny=MARGIN+3;
      const NX=MARGIN+2, NW=NC_W-4;

      // "STRUCTURAL DRAWING" — bold header
      FC(0,0,0);Rect(NX-2,ny,NW+4,7,'F');
      F(7,'bold',255,255,255);Txt('STRUCTURAL DRAWING',NX+NW/2,ny+5,{align:'center'});
      ny+=9;
      // Validity
      F(5.5,'bold',0,0,0);TW('THIS DRAWING IS VALID ONLY IF CONSULTANT CHECKS AT SITE',NX,ny,NW);ny+=10;

      // Separator
      LC(0,0,0);LW(0.3);Line(NX,ny,NX+NW,ny);ny+=3;
      F(6.5,'bold',0,0,0);Txt('DESIGN LOADS:',NX,ny);ny+=5;
      F(6,'normal',0,0,0);
      Txt('1. FLOOR SLAB - '+S.udlLL+' kN/Sq.M',NX+1,ny);ny+=4;
      Txt('2. ROOF SLAB - '+S.udlRoof+' kN/Sq.M',NX+1,ny);ny+=4;
      Txt('3. FLOOR FINISH - '+S.floorFinish+' kN/Sq.M',NX+1,ny);ny+=4;
      Txt('4. PARTITIONS - '+S.partitions+' kN/Sq.M',NX+1,ny);ny+=6;

      LC(0,0,0);LW(0.3);Line(NX,ny,NX+NW,ny);ny+=3;
      F(6.5,'bold',0,0,0);Txt('NOTES',NX,ny);ny+=5;
      F(6,'normal',0,0,0);
      const nts=['1. GRADE OF CONCRETE: M'+S.fck+' (IS 456-2000)',
        '2. GRADE OF STEEL: Fe'+S.fy+'D (IS 1786-2008)',
        '3. DISCREPANCIES: Report to consultant before execution.',
        '4. DO NOT CAST without site engineer confirmation.',
        '5. Shuttering & propping: contractor responsibility.'];
      nts.forEach(nt=>{ny+=TW(nt,NX+1,ny,NW)*4.0+0.5;});
      ny+=3;

      F(6.5,'bold',0,0,0);Txt('6. CLEAR COVER FOR REINFORCEMENT:',NX,ny);ny+=4.5;
      F(6,'normal',0,0,0);
      const cvs=[['A) GRADE/PLINTH BEAM','25 MM (1")'],['B) FOOTING - BOTTOM','75 MM (3")'],
        ['C) COLUMN',S.coverCol+' MM'],['D) FOOTING - SIDE','50 MM (2")'],
        ['E) ALL ROOF BEAM','25 MM (1")'],['F) ALL ROOF SLAB',S.coverSlab+' MM'],
        ['G) ALL FLOOR SLAB',S.coverSlab+' MM']];
      cvs.forEach(([a,b2])=>{F(5.5,'normal',0,0,0);Txt(a,NX+1,ny);Txt(b2,NX+NW,ny,{align:'right'});ny+=3.8;});
      ny+=3;

      LC(0,0,0);LW(0.3);Line(NX,ny,NX+NW,ny);ny+=3;
      F(6,'normal',0,0,0);
      TW('7. REINFORCEMENT SYMBOL:',NX,ny,NW);ny+=4;
      TW('Y or O = HIGH YIELD Fe'+S.fy+' BARS (Min yield '+S.fy+' N/MM2)',NX+1,ny,NW);ny+=7;
      TW('8. DO NOT SCALE - REFER FIGURED DIMENSIONS',NX+1,ny,NW);ny+=7;
      F(6.5,'bold',0,0,0);Txt('9. LAPPING / ANCHORAGE LENGTH:',NX,ny);ny+=4.5;
      F(6,'normal',0,0,0);
      Txt(' A) BEAM AND SLAB = 60 x DIA',NX+1,ny);ny+=4;
      Txt(' B) COLUMN = 48 x DIA',NX+1,ny);ny+=5;

      LC(0,0,0);LW(0.3);Line(NX,ny,NX+NW,ny);ny+=3;
      F(6,'normal',0,0,0);
      ny+=TW('10. ASSUMED SBC OF SOIL = '+S.soilBearing+' kN/M2 AT '+S.ftgDepth+'m DEPTH. VERIFY WITH ACTUAL SOIL INVESTIGATION.',NX+1,ny,NW)*4.2+2;
      ny+=TW('11. FOUNDATION FOR G+'+(S.numFloors-1),NX+1,ny,NW)*4.2+4;

      LC(0,0,0);LW(0.3);Line(NX,ny,NX+NW,ny);ny+=3;
      F(6.5,'bold',0,0,0);Txt('CONCRETE MIX: 1:1.5:3',NX,ny);ny+=4.5;
      F(6,'normal',0,0,0);Txt('M'+S.fck+' (IS 456-2000 Design Mix)',NX+1,ny);ny+=6;

      // Disclaimer box
      LC(150,0,0);LW(0.5);Rect(NX-1,ny-1,NW+2,28,'D');
      F(6,'bold',150,0,0);Txt('IMPORTANT DISCLAIMER:',NX+1,ny+4);
      F(5.5,'normal',0,0,0);
      TW('THIS DRAWING IS FOR EDUCATIONAL PURPOSE ONLY. It was generated using StructLearnPro (educational software). ALL drawings MUST be reviewed, verified and certified by a licensed Structural Engineer before use in actual construction. Never build from this drawing without professional certification.',NX+1,ny+8,NW);
      ny+=30;

      // Company
      LC(0,0,0);LW(0.3);Line(NX,ny,NX+NW,ny);ny+=3;
      F(6.5,'bold',0,0,110);TW('M-STRUCTURES STRUCTURAL CONSULTANT',NX,ny,NW);ny+=5;
      F(5.5,'normal',80,80,80);TW('structlearnpro@edu.in | Educational Software Tool',NX,ny,NW);ny+=6;

      // Drawing status box
      if(ny<DRAW_BOT-20){
        LC(0,0,0);LW(0.5);Rect(NX-1,ny,NW+2,16,'D');
        F(6.5,'bold',0,0,0);Txt('DRAWING STATUS',NX+NW/2,ny+5.5,{align:'center'});
        LC(0,0,0);LW(0.3);Line(NX-1,ny+7,NX+NW+1,ny+7);
        F(5.5,'italic',80,80,80);Txt('FOR REVIEW ONLY',NX+NW/2,ny+12,{align:'center'});
        Txt('NOT FOR CONSTRUCTION',NX+NW/2,ny+15.5,{align:'center'});
      }

      // ── TITLE BLOCK (bottom right) ────────────────────────────
      const tx=TB_X, ty=DRAW_BOT, tw=PW-MARGIN-tx, th=TB_H;
      LC(0,0,0);LW(0.6);Rect(tx,ty,tw,th,'D');

      // Scale bar bottom-left (above title block)
      if(scale&&scale!=='NTS'){
        const scN=parseInt(scale.replace('1:','').replace(/[^0-9]/g,''))||100;
        const realM=scN<=25?1:scN<=50?2:5;
        const barMm=realM*1000/scN;
        const bx=DR_X+2, by=DRAW_BOT+3;
        F(5.5,'bold',0,0,0);Txt('SCALE '+scale,bx,by+2);
        for(let i=0;i<5;i++){FC(i%2===0?0:255,i%2===0?0:255,i%2===0?0:255);LC(0,0,0);LW(0.15);Rect(bx+i*barMm/5,by+3.5,barMm/5,2.5,'FD');}
        F(5,'normal',0,0,0);Txt('0',bx,by+8);Txt(r0(realM/2)+'m',bx+barMm/2,by+8,{align:'center'});Txt(realM+'m',bx+barMm,by+8,{align:'center'});
      }
      // Company band (dark blue)
      FC(0,40,100);Rect(tx,ty,tw,9,'F');
      F(7.5,'bold',255,255,255);Txt('M-STRUCTURES  STRUCTURAL CONSULTANT',tx+tw/2,ty+6,{align:'center'});

      // Field grid
      const r1=ty+12,r2=ty+19,r3=ty+26,r4=ty+33;
      const cw4=tw/4;
      LC(0,0,0);LW(0.25);
      [r1-1,r2-1,r3-1,r4-1].forEach(ry=>Line(tx,ry,tx+tw,ry));
      [1,2,3].forEach(i=>Line(tx+i*cw4,ty+9,tx+i*cw4,ty+th));

      const lbl2=(label,val,x,y,truncLen)=>{
        F(5,'bold',80,80,100);Txt(label+':',x+1,y-1.5);
        F(6.5,'bold',0,0,0);Txt(s2(String(val||'').slice(0,truncLen||22)),x+1,y+4);
      };
      lbl2('TITLE',s2(title).slice(0,20),tx,r1,20);
      lbl2('DRAWN','Student',tx+cw4,r1);
      lbl2('DESIGNED','Student',tx+2*cw4,r1);
      lbl2('PROJECT NO',(s2(S.name||'').replace(/\s+/g,'-').slice(0,14))+'-'+new Date().getFullYear(),tx+3*cw4,r1);
      lbl2('CHECKED','Lecturer',tx,r2);
      lbl2('DATE',new Date().toLocaleDateString('en-IN'),tx+cw4,r2);
      lbl2('APPROVED','SE (Licensed)',tx+2*cw4,r2);
      lbl2('DRAWING NO',code,tx+3*cw4,r2);
      lbl2('USE','RESIDENTIAL',tx,r3);
      lbl2('FLOORS','G+'+(S.numFloors-1),tx+cw4,r3);
      lbl2('LOCATION',s2(S.location||'India').slice(0,16),tx+2*cw4,r3);
      lbl2('CLIENT',s2(S.client||S.name||'').slice(0,18),tx+3*cw4,r3);
      lbl2('SCALE',scale||'NTS',tx,r4);
      lbl2('SURVEY NO','AS/SITE',tx+cw4,r4);
      lbl2('BLOCK NO','AS/ARCH',tx+2*cw4,r4);
      lbl2('SHEET',String(pgN+1)+' / 12',tx+3*cw4,r4);

      // Sheet title bar inside drawing area
      FC(220,230,248);Rect(DR_X,DR_Y,DR_W,8,'F');
      LC(0,0,100);LW(0.5);Rect(DR_X,DR_Y,DR_W,8,'D');
      F(8,'bold',0,0,100);Txt(code+'  \x97  '+s2(title),DR_X+DR_W/2,DR_Y+5.8,{align:'center'});
      pgN++;
    };

    // ── DATA ALIASES ─────────────────────────────────────────────
    const sl=RES.slab;
    const beams=(RES.allBeams||RES.beams)||[];
    const c1=(RES.allCols||RES.cols).find(c=>c.floor===1&&c.corner)||(RES.allCols||RES.cols)[0];
    const c2=(RES.allCols||RES.cols).find(c=>c.floor===1&&c.edge)||c1;
    const c3=(RES.allCols||RES.cols).find(c=>c.floor===1&&c.inter)||c1;
    const f1=(RES.allFtgs||RES.ftgs)[0]||{Bf:1,D:300,dBf:12,spf:200,Ps:100,qu:100,quf:150,d:200,col:300,punch_ok:true,ow_ok:true,Ld_ok:true};
    const f2=(RES.allFtgs||RES.ftgs)[1]||f1;
    const f3=(RES.allFtgs||RES.ftgs)[2]||f1;
    const stair=RES.stair||{riser:165,tread:270,wD:150,wd:125,Ast2:200,stsp:200};
    const nBX=Math.min(S.spansX.length,5);
    const nBY=Math.min(S.spansY.length,4);
    const totX=S.spansX.slice(0,nBX).reduce((a,b)=>a+b,0);
    const totY=S.spansY.slice(0,nBY).reduce((a,b)=>a+b,0);

    // Grid x/y positions on paper (1:100 scale = 10mm per metre)
    const mmPerM=10;
    const planW=totX*mmPerM, planH=totY*mmPerM;
    const cxArr=[0];S.spansX.slice(0,nBX).forEach(sp=>cxArr.push(cxArr[cxArr.length-1]+sp*mmPerM));
    const cyArr=[0];S.spansY.slice(0,nBY).forEach(sp=>cyArr.push(cyArr[cyArr.length-1]+sp*mmPerM));
    // Absolute positions centred in drawing area
    const planXoff=DR_X+(DR_W-planW)/2;
    const planYoff=DR_Y+20;
    const cxA=cxArr.map(x=>planXoff+x);
    const cyA=cyArr.map(y=>planYoff+y);
    const colType=(i,j)=>(i===0||i===nBX)&&(j===0||j===nBY)?'C1':(i===0||i===nBX||j===0||j===nBY)?'C2':'C3';

    // Grid drawing helper (used in layout plans)
    const drawGrid=(ox,oy,pw2,ph2,cxA2,cyA2,nBX2,nBY2)=>{
      // Grid circles and CL lines
      cxA2.forEach((gx,i)=>{
        LC(150,150,200);LW(0.15);doc.setLineDashPattern([3,2],0);Line(gx,oy-14,gx,oy+ph2+6);doc.setLineDashPattern([],0);
        LC(0,0,0);LW(0.5);doc.circle(gx,oy-10,3,'D');
        F(7,'bold',0,0,0);Txt(String(i+1),gx,oy-7.5,{align:'center'});
      });
      cyA2.forEach((gy,j)=>{
        LC(150,150,200);LW(0.15);doc.setLineDashPattern([3,2],0);Line(ox-14,gy,ox+pw2+6,gy);doc.setLineDashPattern([],0);
        LC(0,0,0);LW(0.5);doc.circle(ox-10,gy,3,'D');
        F(7,'bold',0,0,0);Txt(String.fromCharCode(65+j),ox-10,gy+2,{align:'center'});
      });
    };

    // ================================================================
    // SHEET 1 — TITLE PAGE
    // ================================================================
    log('Sheet 1: Title page...',8);
    drawPage('ST/TP01/R0','TITLE PAGE & DRAWING INDEX','NTS');
    let y=DR_Y+12;
    const DX=DR_X+4,DW2=DR_W-8;

    // Project banner (compact)
    FC(0,40,100);Rect(DX,y,DW2,14,'F');
    LC(0,0,0);LW(0.5);Rect(DX,y,DW2,14,'D');
    F(14,'bold',255,255,255);Txt(s2(S.name||'Project'),DX+DW2/2,y+6.5,{align:'center'});
    F(8,'normal',180,210,255);Txt(s2(S.location||'')+' | G+'+(S.numFloors-1)+' RC Frame | M'+S.fck+'/Fe'+S.fy+'D',DX+DW2/2,y+11.5,{align:'center'});
    y+=18;

    // Two-column info
    const c1w=DW2*0.46,c2x2=DX+DW2*0.54;
    // Left: project parameters
    LC(0,0,100);LW(0.5);Rect(DX,y,c1w,78,'D');
    FC(220,228,248);Rect(DX,y,c1w,7,'F');
    F(7,'bold',0,0,100);Txt('PROJECT PARAMETERS',DX+c1w/2,y+5,{align:'center'});
    let py2=y+11;
    [['Client',s2(S.client||S.name||'—')],['Location',s2(S.location||'—')],
     ['No. of Floors','G+'+(S.numFloors-1)+' ('+S.numFloors+' floors)'],
     ['Floor Height',S.floorHt+' m ('+ftin(S.floorHt)+')'],
     ['Total Height',r2(S.numFloors*S.floorHt)+' m'],
     ['Plan Dimensions',S.buildingL+'m x '+S.buildingW+'m ('+ftin(S.buildingL)+' x '+ftin(S.buildingW)+')'],
     ['Seismic Zone','Zone '+S.zone+' (IS 1893:2016)'],
     ['Wind Zone','Zone '+S.windZone+' (IS 875 Pt.3)'],
     ['Soil Type','Type '+S.soilType+' (IS 1893)'],
     ['SBC',S.soilBearing+' kN/m2 at '+S.ftgDepth+'m depth']
    ].forEach(([l,v],i)=>{
      if(i%2===0){FC(242,246,255);Rect(DX+1,py2-3.5,c1w-2,6,'F');}
      F(6.5,'bold',0,40,100);Txt(l,DX+3,py2);
      F(6.5,'normal',0,0,0);Txt(v,DX+48,py2);
      py2+=7;
    });

    // Right: materials
    LC(0,0,100);LW(0.5);Rect(c2x2,y,DW2-DW2*0.54,78,'D');
    FC(220,228,248);Rect(c2x2,y,DW2-DW2*0.54,7,'F');
    F(7,'bold',0,0,100);Txt('MATERIAL SPECIFICATIONS',c2x2+(DW2-DW2*0.54)/2,y+5,{align:'center'});
    let my2=y+11;
    [['Concrete Grade','M'+S.fck+' (IS 456-2000)'],['Steel Grade','Fe'+S.fy+'D TMT (IS 1786-2008)'],
     ['Ec (Modulus)',r0(5000*Math.sqrt(S.fck))+' N/mm2'],['fck Design',r2(0.446*S.fck)+' N/mm2'],
     ['fyd Design',r2(S.fy/1.15)+' N/mm2'],['Cover - Beam',S.coverBeam+' mm nominal'],
     ['Cover - Slab',S.coverSlab+' mm nominal'],['Cover - Column',S.coverCol+' mm nominal'],
     ['Cover - Footing','75 mm (earth face)'],['Exposure Class','Moderate (IS 456 Table 3)']
    ].forEach(([l,v],i)=>{
      if(i%2===0){FC(242,246,255);Rect(c2x2+1,my2-3.5,DW2-DW2*0.54-2,6,'F');}
      F(6.5,'bold',0,40,100);Txt(l,c2x2+3,my2);
      F(6.5,'normal',0,0,0);Txt(v,c2x2+46,my2);
      my2+=7;
    });
    y+=82;

    // Drawing index
    FC(220,228,248);Rect(DX,y,DW2,7,'F');LC(0,0,100);LW(0.5);Rect(DX,y,DW2,7,'D');
    F(7,'bold',0,0,100);Txt('DRAWING INDEX',DX+DW2/2,y+5,{align:'center'});
    y+=8;
    // Column widths: DRG NO(22) | TITLE(35) | DESCRIPTION(90) | CONTENT(50) | SCALE(20) | STATUS(22) = 239 - fits 
    const iws=[22,35,90,50,20,22];
    const ihdr=['DRG NO','SHEET TITLE','DESCRIPTION','DRAWING CONTENT','SCALE','STATUS'];
    FC(220,228,248);Rect(DX,y,DW2,6,'F');LC(0,0,0);LW(0.2);Rect(DX,y,DW2,6,'D');
    F(6.5,'bold',0,0,100);let ix=DX+1;ihdr.forEach((h,i)=>{Txt(h,ix+1,y+4.5);ix+=iws[i];});
    y+=6;
    [['ST/TP01/R0','TITLE PAGE','Drawing index, project parameters, material specs','Cover & Index','NTS'],
     ['ST/TN01/R0','TECHNICAL NOTES','Construction, curing, formwork, lapping details','Tech Notes','NTS'],
     ['ST/FD01/R0','FOOTING LAYOUT','Plan view of all footings with grid lines and labels','Layout Plan','1:100'],
     ['ST/FD02/R0','FOOTING DETAIL','Schedule, cross-sections for each footing type','Section & Sched.','1:25'],
     ['ST/CL01/R0','COLUMN LAYOUT','Column positions, marking plan, grid dimensions','Layout Plan','1:100'],
     ['ST/CL02/R0','COLUMN DETAIL','Cross-sections, schedule, confinement, lapping','Section & Sched.','1:25'],
     ['ST/BM01/R0','BEAM LAYOUT','Beam layout with beam IDs and sizes for all floors','Layout Plan','1:100'],
     ['ST/BM02/R0','BEAM DETAIL','Elevations showing steel zones and cross-sections','Detail','1:50'],
     ['ST/SL01/R0','SLAB DETAIL','Reinforcement detail, schedule, edge conditions','Slab Detail','1:50'],
     ['ST/BB01/R0','BAR BENDING SCHED.','Mark, dia, shape, cut length, number and weight','BBS','NTS'],
     ['ST/EL01/R0','BUILDING ELEVATION','Front and side elevation, all floors dimensioned','Elevation','1:100'],
     ['ST/SC01/R0','STAIRCASE DETAIL','Cross-section, reinforcement, stair schedule','Stair Detail','1:25'],
    ].forEach(([dno,dt,desc,cont,sc],i)=>{
      if(i%2===0){FC(246,249,255);Rect(DX,y,DW2,6,'F');}
      LC(0,0,0);LW(0.1);Rect(DX,y,DW2,6,'D');
      F(6.5,'bold',0,0,100);ix=DX+1;Txt(dno,ix+1,y+4.5);ix+=iws[0];
      F(6.5,'bold',0,0,0);Txt(dt,ix+1,y+4.5);ix+=iws[1];
      F(6,'normal',40,40,40);Txt(desc.slice(0,48),ix+1,y+4.5);ix+=iws[2];
      F(6,'normal',0,0,0);Txt(cont,ix+1,y+4.5);ix+=iws[3];
      F(6.5,'normal',0,0,0);Txt(sc,ix+1,y+4.5);ix+=iws[4];
      F(6.5,'bold',0,120,0);Txt('ISSUED',ix+1,y+4.5);
      y+=6;
    });
    y+=6;

    // Certification
    LC(0,0,100);LW(0.5);Rect(DX,y,DW2,26,'D');
    FC(240,244,255);Rect(DX,y,DW2,7,'F');
    F(7,'bold',0,0,100);Txt('CERTIFICATION',DX+DW2/2,y+5,{align:'center'});
    F(6,'normal',0,0,0);
    TW('This drawing package is prepared as per IS 456:2000, IS 1893:2016, IS 875:2015, and IS 13920:2016 using StructLearnPro educational software. Construction must be supervised by a qualified civil engineer. The Structural Engineer of Record (SE) must review, verify, certify and seal all drawings before submission to local building authority.',DX+3,y+11,DW2-6);
    LC(0,0,0);LW(0.25);
    ['Prepared by (Student)','Checked by (Lecturer/SE)','Approved - Structural Engineer (Licensed)'].forEach((sg,i)=>{
      const sx=DX+5+i*(DW2/3);
      Line(sx,y+24,sx+DW2/3-10,y+24);
      F(5.5,'normal',80,80,80);Txt(sg,sx,y+27.5);
    });

    log('Sheet 1 done',10);

    // ================================================================
    // SHEET 2 — TECHNICAL NOTES
    // ================================================================
    log('Sheet 2: Technical notes...',16);
    doc.addPage();drawPage('ST/TN01/R0','TECHNICAL NOTES','NTS');
    y=DR_Y+12;
    F(8,'bold',0,0,100);Txt('GENERAL NOTES & TECHNICAL NOTES',DX+DW2/2,y,{align:'center'});
    y+=8;

    // 2 columns of 3 sections each — wider than before
    const tnW=(DW2-6)/2, tnStartY=y;
    const techSec=[
      {t:'1) FOUNDATION NOTES',items:[
        '1. Safe Bearing Capacity shown on foundation drawings.',
        '2. After excavation, backfill shall be compacted to 95% of max dry density.',
        '3. Site engineer must check neighboring building safety during excavation.',
        '4. If groundwater found during excavation, contact structural consultant.',
        '5. Foundation must rest on PCC 1:4:8 (100mm thick minimum).',
        '6. Sub-structures in contact with soil: apply 2 coats of bitumen paint.',
        '7. Ground improvement if soil is loose: lime-sand or stone column piling.',
      ]},
      {t:'2) CONCRETE NOTES',items:[
        '1. Characteristic strength fck = '+S.fck+' N/mm2 at 28 days.',
        '2. Water-cement ratio shall not exceed 0.45 for moderate exposure.',
        '3. Minimum cement content: 300 kg/m3.',
        '4. Cube tests: minimum 3 cubes per 5m3 or per pour.',
        '5. Ready mix concrete to conform IS 4926.',
        '6. All construction joints: clean and roughen before new pour.',
        '7. No load until 28 days strength achieved.',
      ]},
      {t:'3) CURING NOTES',items:[
        '1. Curing must start within 8 hours of concreting.',
        '2. Minimum 7 days, maximum 21 days wet curing required.',
        '3. Vertical elements: cure using jute bags / hessian cloth kept wet.',
        '4. Horizontal slabs: cure by ponding or continuous spraying.',
        '5. Do not allow concrete to dry during curing period.',
        '6. Use curing compound only with SE approval.',
      ]},
      {t:'4) FORMWORK NOTES',items:[
        '1. Stability of formwork is contractor responsibility.',
        '2. Props and supports must be approved by site engineer.',
        '3. Apply oil inside shuttering before steel placement.',
        '4. Column side: remove after 24h (43 grade) or 12h (53 grade).',
        '5. Beam soffit (<6m): 14 days (43 gr) or 7 days (53 gr).',
        '6. Beam soffit (>6m): 21 days (43 gr) or 14 days (53 gr).',
        '7. Slab soffit: minimum 14 days before striking props.',
      ]},
      {t:'5) REINFORCEMENT NOTES',items:[
        '1. All bars Fe'+S.fy+'D as per IS 1786-2008.',
        '2. Bars must be free of loose rust, mud, oil or coating.',
        '3. Bent bars: 90 deg = 9d extra, 180 deg = 4d extra.',
        '4. No lapping at sections of maximum moment.',
        '5. Stagger laps: not more than 50% at any section.',
        '6. ALL STIRRUPS AND TIES: 135 deg hooks mandatory (IS 13920).',
        '7. Cover blocks: precast concrete blocks, not stone chips.',
      ]},
      {t:'6) LAPPING DETAILS',items:[
        'BEAM & SLAB: 60 x Dia | COLUMN: 48 x Dia',
        '',
        'MINIMUM LAP FOR COLUMNS (M'+S.fck+', Fe'+S.fy+'):',
        '  T12 = '+r0(48*12)+'mm ('+ftin(48*12/1000)+')',
        '  T16 = '+r0(48*16)+'mm ('+ftin(48*16/1000)+')',
        '  T20 = '+r0(48*20)+'mm ('+ftin(48*20/1000)+')',
        '  T25 = '+r0(48*25)+'mm ('+ftin(48*25/1000)+')',
        '',
        'MINIMUM LAP FOR BEAMS & SLABS:',
        '  T8 = '+r0(60*8)+'mm | T10 = '+r0(60*10)+'mm',
        '  T12 = '+r0(60*12)+'mm | T16 = '+r0(60*16)+'mm',
        '  T20 = '+r0(60*20)+'mm | T25 = '+r0(60*25)+'mm',
      ]},
    ];
    techSec.forEach((sec,si)=>{
      const col=si%2, row=Math.floor(si/2);
      const tx2=DX+col*(tnW+6), ty2=tnStartY+row*(DR_H/3+2);
      const boxH=DR_H/3-4;
      LC(0,0,100);LW(0.4);Rect(tx2,ty2,tnW,boxH,'D');
      FC(220,228,248);Rect(tx2,ty2,tnW,7,'F');
      F(7,'bold',0,0,100);Txt(sec.t,tx2+tnW/2,ty2+5,{align:'center'});
      let sy2=ty2+10;
      F(6.5,'normal',0,0,0);
      sec.items.forEach(item=>{
        if(item===''){sy2+=3;return;}
        const bold=item.endsWith(':');
        F(bold?6.5:6.5,bold?'bold':'normal',0,0,0);
        sy2+=TW(item,tx2+3,sy2,tnW-6)*4.2+0.5;
        if(sy2>ty2+boxH-4)return;
      });
    });

    log('Sheet 2 done',18);

    // ================================================================
    // SHEET 3 — FOOTING LAYOUT PLAN
    // ================================================================
    log('Sheet 3: Footing layout...',24);
    doc.addPage();drawPage('ST/FD01/R0','LAYOUT OF FOOTING','1:100');
    y=DR_Y+14;

    // Centre plan in drawing area with good margins
    const fpX=DR_X+(DR_W-planW)/2, fpY=y+16;
    drawGrid(fpX,fpY,planW,planH,cxA,cyA,nBX,nBY);

    // Footing squares at each column intersection
    cxA.forEach((gx,i)=>{cyA.forEach((gy,j)=>{
      const ct=colType(i,j);
      const f=ct==='C1'?f1:ct==='C2'?f2:f3;
      const fw=Math.max(4,(f.Bf||1)*mmPerM);
      // Footing outline (bold)
      LC(0,0,0);LW(0.5);Rect(gx-fw/2,gy-fw/2,fw,fw,'D');
      // Cross centre mark
      LW(0.2);Line(gx-fw/2,gy,gx+fw/2,gy);Line(gx,gy-fw/2,gx,gy+fw/2);
      // Type label above, size inside box, check status indicator
      F(6.5,'bold',0,0,100);Txt(ct,gx,gy-fw/2-2,{align:'center'});
      // Size label below box
      F(5.5,'normal',0,0,0);Txt(ftin(f.Bf||1)+'x'+ftin(f.Bf||1),gx,gy+fw/2+4,{align:'center'});
      // D= inside box
      F(5,'italic',60,80,120);Txt('D='+r0(f.D||300),gx,gy+1.5,{align:'center'});
    });});

    // Plot line dashed border
    LC(100,100,100);LW(0.4);doc.setLineDashPattern([5,3],0);
    Rect(fpX-16,fpY-16,planW+32,planH+32,'D');
    doc.setLineDashPattern([],0);
    F(6.5,'normal',80,80,80);Txt('PLOT LINE',fpX-14,fpY-12);Txt('PLOT LINE',fpX+planW+2,fpY+planH/2);

    // Horizontal dim chains (below plan)
    S.spansX.slice(0,nBX).forEach((sp,i)=>DH(cxA[i],cxA[i+1],fpY+planH+14,ftin(sp),false));
    DH(fpX,fpX+planW,fpY+planH+22,ftin(totX)+' (Total)',false);
    // Vertical dim chains (left of plan)
    S.spansY.slice(0,nBY).forEach((sp,j)=>DV(fpX-22,cyA[j],cyA[j+1],ftin(sp),true));
    DV(fpX-30,fpY,fpY+planH,ftin(totY)+' (Total)',true);

    // Footing schedule summary
    const schY=fpY+planH+34;
    F(7,'bold',0,0,0);Txt('FOOTING SCHEDULE SUMMARY:',fpX,schY);
    F(6.5,'normal',0,0,0);
    Txt('C1 (Corner): '+ftin(f1.Bf||0.5)+' x '+ftin(f1.Bf||0.5)+' x D='+r0(f1.D||300)+'mm  |  Ps='+r2(f1.Ps||0)+'kN',fpX,schY+6);
    Txt('C2 (Edge):   '+ftin(f2.Bf||0.8)+' x '+ftin(f2.Bf||0.8)+' x D='+r0(f2.D||350)+'mm  |  Ps='+r2(f2.Ps||0)+'kN',fpX,schY+12);
    Txt('C3 (Interior):'+ftin(f3.Bf||1.0)+' x '+ftin(f3.Bf||1.0)+' x D='+r0(f3.D||400)+'mm  |  Ps='+r2(f3.Ps||0)+'kN',fpX,schY+18);
    F(6.5,'italic',80,80,80);Txt('NOTE: All footings are ISOLATED SQUARE footings. All dimensions refer to plan size (L x B). Refer ST/FD02 for cross-section details.',fpX,schY+26);

    log('Sheet 3 done',28);

    // ================================================================
    // SHEET 4 — FOOTING DETAIL
    // ================================================================
    log('Sheet 4: Footing detail...',34);
    doc.addPage();drawPage('ST/FD02/R0','FOUNDATION DETAIL','1:25');
    y=DR_Y+14;

    // 3 footings side by side — each zone is DR_W/3 = ~116mm
    const fzW=(DR_W-8)/3;
    [{lbl:'CORNER FOOTING (CF)',f:f1},{lbl:'EDGE FOOTING (EF)',f:f2},{lbl:'INTERIOR FOOTING (IF)',f:f3}].forEach(({lbl,f},fi)=>{
      const fzX=DR_X+2+fi*(fzW+2);
      const fcx=fzX+fzW/2;

      // Zone header
      FC(220,228,248);LC(0,0,100);LW(0.4);Rect(fzX,y,fzW,7,'FD');
      F(7,'bold',0,0,100);Txt(lbl,fcx,y+5,{align:'center'});

      // Scale at 1:25: 1m=40mm on paper
      const sc25=Math.min(fzW*0.6,(f.Bf||1)*1000/25);
      const planSz=sc25; // plan side in mm on paper
      const planFx=fcx-planSz/2, planFy=y+12;

      // ── PLAN VIEW ──────────────────────────────────────────────
      F(7,'bold',0,0,0);Txt('PLAN',fcx,planFy-2,{align:'center'});
      FC(240,242,248);LC(0,0,0);LW(0.6);Rect(planFx,planFy,planSz,planSz,'FD');
      // Grid of bars both ways
      const nBF=Math.min(8,Math.floor(planSz/6)+2);
      const bSp2=(planSz-6)/(nBF-1||1);
      LC(0,0,0);LW(0.5);for(let i=0;i<nBF;i++)Line(planFx+3,planFy+3+i*bSp2,planFx+planSz-3,planFy+3+i*bSp2);
      LC(160,160,160);LW(0.25);for(let i=0;i<nBF;i++)Line(planFx+3+i*bSp2,planFy+3,planFx+3+i*bSp2,planFy+planSz-3);
      // Column in plan
      const colPW=Math.max(4,Math.min(10,(f.colSize||300)/25));
      FC(100,100,130);Rect(fcx-colPW/2,planFy+planSz/2-colPW/2,colPW,colPW,'F');
      LC(0,0,0);LW(0.4);Rect(fcx-colPW/2,planFy+planSz/2-colPW/2,colPW,colPW,'D');
      // Plan dims
      DH(planFx,planFx+planSz,planFy+planSz+3,ftin(f.Bf||1)+' x '+ftin(f.Bf||1),false);
      F(6,'italic',80,80,80);Txt('SCALE 1:25',fcx,planFy+planSz+10,{align:'center'});
      F(6.5,'normal',0,0,0);Txt('Bars both ways: Y'+f.dBf+'@'+f.spf+' c/c',fcx,planFy+planSz+15,{align:'center'});

      // ── SECTION ────────────────────────────────────────────────
      const secTopY=planFy+planSz+24;
      F(7,'bold',0,0,0);Txt('TYPICAL SECTION',fcx,secTopY-2,{align:'center'});
      const ftSW=Math.min(fzW-8,(f.Bf||1)*1000/25);
      const ftSH=Math.max(10,Math.min(25,(f.D||300)/25));
      const ssx=fcx-ftSW/2;

      // NGL label
      F(7,'bold',0,0,0);Txt('N.G.L',ssx-6,secTopY+1.5,{align:'right'});
      // NGL line
      LC(0,0,0);LW(0.8);Line(ssx-4,secTopY,ssx+ftSW+4,secTopY);
      // Soil hatch below footing
      FC(210,195,165);Rect(ssx-3,secTopY+ftSH,ftSW+6,8,'F');
      LC(120,95,55);LW(0.3);for(let hx=ssx-2;hx<ssx+ftSW+4;hx+=4)Line(hx,secTopY+ftSH,hx-3,secTopY+ftSH+5);
      // PCC blinding
      FC(195,188,175);LC(0,0,0);LW(0.3);Rect(ssx-2,secTopY+ftSH-2,ftSW+4,2.5,'FD');
      // Footing concrete (light fill + hatch)
      FC(235,237,242);LC(0,0,0);LW(0.6);Rect(ssx,secTopY,ftSW,ftSH,'FD');
      Hatch(ssx,secTopY,ftSW,ftSH);
      // Cover dashed line at bottom
      const cvB=3;// 75mm at 1:25
      LC(150,100,0);LW(0.25);doc.setLineDashPattern([2,1.5],0);
      Line(ssx,secTopY+ftSH-cvB,ssx+ftSW,secTopY+ftSH-cvB);
      doc.setLineDashPattern([],0);
      F(6,'normal',80,60,0);Txt('75mm cover',ssx+ftSW+2,secTopY+ftSH-cvB+1);
      // Bottom bars
      const barR=Math.max(0.9,f.dBf/2/25);
      const nBS=Math.min(6,Math.floor(ftSW/5)+1);
      const bSpS2=(ftSW-cvB*2)/(nBS-1||1);
      for(let i=0;i<nBS;i++)Rebar(ssx+cvB+i*bSpS2,secTopY+ftSH-cvB-barR,barR);
      // Transverse (open dots)
      for(let i=1;i<nBS-1;i++)RebarOpen(ssx+cvB+i*bSpS2,secTopY+ftSH-cvB-barR*3,barR*0.7);
      // Column stub + STARTER BARS (dowels)
      const colSW2=Math.max(4,Math.min(10,(f.colSize||300)/25));
      const colH2=10;
      const dowelLap=r0(48*(c1?.dB||16)); // 48D lap
      const dowelDraw=Math.min(20,dowelLap/25); // scaled
      FC(180,182,200);LC(0,0,0);LW(0.5);Rect(fcx-colSW2/2,secTopY-colH2,colSW2,colH2,'FD');
      // Column bar lines in stub
      LC(0,0,0);LW(0.4);
      Line(fcx-colSW2/2+1,secTopY-colH2+1,fcx-colSW2/2+1,secTopY-0.5);
      Line(fcx+colSW2/2-1,secTopY-colH2+1,fcx+colSW2/2-1,secTopY-0.5);
      // Starter bars projecting UP from footing (dowels)
      LC(0,0,100);LW(0.6);
      const dOff=colSW2/2*0.5;
      Line(fcx-dOff,secTopY,fcx-dOff,secTopY-colH2-dowelDraw);
      Line(fcx+dOff,secTopY,fcx+dOff,secTopY-colH2-dowelDraw);
      // 90-deg hook at top of starter bars
      Line(fcx-dOff,secTopY-colH2-dowelDraw,fcx-dOff-2,secTopY-colH2-dowelDraw);
      Line(fcx+dOff,secTopY-colH2-dowelDraw,fcx+dOff+2,secTopY-colH2-dowelDraw);
      // Lap length annotation
      F(5,'bold',0,0,150);
      Txt('Lap='+dowelLap+'mm',fcx+dOff+3,secTopY-colH2-dowelDraw/2);
      // Starter bar label
      LC(0,0,0);LW(0.2);doc.setLineDashPattern([1,1],0);
      Line(fcx+colSW2/2+1,secTopY-colH2-dowelDraw/2,fcx+colSW2/2+8,secTopY-colH2-dowelDraw/2);
      doc.setLineDashPattern([],0);
      F(5,'normal',0,0,150);Txt('Starter bars',fcx+colSW2/2+9,secTopY-colH2-dowelDraw/2+1);
      F(5,'normal',0,0,0);Txt('('+( c1?.nb||4)+'-D'+(c1?.dB||16)+' dowels)',fcx+colSW2/2+9,secTopY-colH2-dowelDraw/2+4.5);
      // Punching perimeter (red dashed)
      const pOff=Math.max(2,(f.d||150)/25/2);
      LC(180,0,0);LW(0.3);doc.setLineDashPattern([2,1.5],0);
      Rect(fcx-colSW2/2-pOff,secTopY-pOff,colSW2+2*pOff,ftSH/2+pOff,'D');
      doc.setLineDashPattern([],0);
      F(5.5,'italic',150,0,0);Txt('Punching perim.',fcx,secTopY-pOff-1.5,{align:'center'});
      // Section dims
      DH(ssx,ssx+ftSW,secTopY+ftSH+8,ftin(f.Bf||1),false);
      DV(ssx+ftSW+4,secTopY,secTopY+ftSH,r0(f.D||300)+'mm',false);
      // Leader to bars
      Ld(ssx+cvB+bSpS2,secTopY+ftSH-cvB-barR,fcx-ftSW/4,secTopY+ftSH+18,'D'+f.dBf+'@'+f.spf+' c/c EW');

      // Schedule box
      const sbY=secTopY+ftSH+26;
      LC(0,0,100);LW(0.4);Rect(fzX+2,sbY,fzW-4,36,'D');
      FC(220,228,248);Rect(fzX+2,sbY,fzW-4,6,'F');
      F(6.5,'bold',0,0,100);Txt('FOOTING SCHEDULE:',fcx,sbY+4.5,{align:'center'});
      F(6.5,'normal',0,0,0);let sy3=sbY+10;
      [['Size',ftin(f.Bf||1)+' x '+ftin(f.Bf||1)],
       ['Depth D',r0(f.D||300)+'mm'],
       ['d eff',r0(f.d||200)+'mm'],
       ['Bars','D'+f.dBf+'@'+f.spf+' both ways'],
       ['Service load Ps',r2(f.Ps||0)+' kN'],
       ['Soil pressure',r2(f.qu||0)+' kN/m2'],
       ['Punch: '+(f.punch_ok?'OK':'FAIL'),'OW: '+(f.ow_ok?'OK':'FAIL')]
      ].forEach(([l,v])=>{
        F(6,'bold',0,0,100);Txt(l,fzX+4,sy3);
        F(6,'normal',0,0,0);Txt(v,fzX+4+36,sy3);
        sy3+=5;
      });
    });

    log('Sheet 4 done',36);

    // ================================================================
    // SHEET 5 — COLUMN LAYOUT
    // ================================================================
    log('Sheet 5: Column layout...',42);
    doc.addPage();drawPage('ST/CL01/R0','COLUMN MARKING LAYOUT','1:100');
    y=DR_Y+14;
    const cpX0=DR_X+(DR_W-planW)/2, cpY0=y+16;
    drawGrid(cpX0,cpY0,planW,planH,cxA,cyA,nBX,nBY);

    // Columns with type + size on separate lines, staggered
    cxA.forEach((gx,i)=>{cyA.forEach((gy,j)=>{
      const ct=colType(i,j);
      const col=ct==='C1'?c1:ct==='C2'?c2:c3;
      const cw2=Math.max(4,(col?.size||300)/100/2);
      // Fill and outline
      FC(210,215,235);LC(0,0,0);LW(0.6);Rect(gx-cw2,gy-cw2,cw2*2,cw2*2,'FD');
      // Diagonals to indicate column
      LW(0.2);Line(gx-cw2,gy-cw2,gx+cw2,gy+cw2);Line(gx+cw2,gy-cw2,gx-cw2,gy+cw2);
      // Type label above box, size below box, diagonal dim inside
      F(6.5,'bold',0,0,150);Txt(ct,gx,gy-cw2-2,{align:'center'});
      F(5.5,'normal',0,0,0);Txt(r0(col?.size||300)+'x'+r0(col?.size||300)+'mm',gx,gy+cw2+5,{align:'center'});
    });});

    // Dims
    S.spansX.slice(0,nBX).forEach((sp,i)=>DH(cxA[i],cxA[i+1],cpY0+planH+14,ftin(sp),false));
    DH(cpX0,cpX0+planW,cpY0+planH+22,ftin(totX)+' TOTAL',false);
    S.spansY.slice(0,nBY).forEach((sp,j)=>DV(cpX0-22,cyA[j],cyA[j+1],ftin(sp),true));
    DV(cpX0-30,cpY0,cpY0+planH,ftin(totY)+' TOTAL',true);

    // Schedule and diagonal
    const diagLen=Math.round(Math.sqrt(totX*totX+totY*totY)*100)/100;
    const lgY3=cpY0+planH+34;
    F(7,'bold',0,0,0);Txt('COLUMN SCHEDULE:',cpX0,lgY3);
    F(6.5,'normal',0,0,0);
    Txt('C1 (Corner): '+r0(c1?.size||300)+'x'+r0(c1?.size||300)+'mm, '+( c1?.nb||4)+'-D'+r0(c1?.dB||16)+', Ties D8@'+r0(c1?.ts||200)+'mm',cpX0,lgY3+6);
    Txt('C2 (Edge):   '+r0(c2?.size||300)+'x'+r0(c2?.size||300)+'mm, '+( c2?.nb||4)+'-D'+r0(c2?.dB||16)+', Ties D8@'+r0(c2?.ts||200)+'mm',cpX0,lgY3+12);
    Txt('C3 (Interior):'+r0(c3?.size||300)+'x'+r0(c3?.size||300)+'mm, '+( c3?.nb||4)+'-D'+r0(c3?.dB||16)+', Ties D8@'+r0(c3?.ts||200)+'mm',cpX0,lgY3+18);
    F(7,'bold',0,0,0);Txt('GRID LENGTHS & DIAGONAL:',cpX0+DR_W*0.5,lgY3);
    F(6.5,'normal',0,0,0);
    Txt('Grid X Total: '+ftin(totX)+'  ('+totX+'m)',cpX0+DR_W*0.5,lgY3+6);
    Txt('Grid Y Total: '+ftin(totY)+'  ('+totY+'m)',cpX0+DR_W*0.5,lgY3+12);
    Txt('Diagonal: '+ftin(diagLen)+'  ('+diagLen+'m)',cpX0+DR_W*0.5,lgY3+18);

    log('Sheet 5 done',44);

    // ================================================================
    // SHEET 6 — COLUMN DETAIL
    // ================================================================
    log('Sheet 6: Column detail...',50);
    doc.addPage();drawPage('ST/CL02/R0','COLUMN DETAIL','1:25');
    y=DR_Y+14;

    // 3 columns side by side — 116mm each
    const czW2=(DR_W-8)/3;
    [{lbl:'C1 (CORNER)',c:c1},{lbl:'C2 (EDGE)',c:c2},{lbl:'C3 (INTERIOR)',c:c3}].forEach(({lbl,c},ci)=>{
      if(!c)return;
      const czX=DR_X+2+ci*(czW2+2);
      const fcx2=czX+czW2/2;

      // Header
      FC(220,228,248);LC(0,0,100);LW(0.4);Rect(czX,y,czW2,7,'FD');
      F(7,'bold',0,0,100);Txt(lbl,fcx2,y+5,{align:'center'});

      // SECTION — at 1:25, 300mm col = 12mm on paper
      const sc2=Math.min(czW2*0.4,40)/c.size; // adaptive scale
      const sw=c.size*sc2;
      const csecY=y+16;
      const bx3=fcx2-sw/2, by3=csecY;
      const cv3=S.coverCol*sc2;

      F(7,'bold',0,0,0);Txt('SECTION',fcx2,csecY-2,{align:'center'});

      // Concrete outline only (no fill hatch to keep bars visible)
      FC(232,235,242);LC(0,0,0);LW(0.7);Rect(bx3,by3,sw,sw,'FD');
      // Light hatch
      Hatch(bx3,by3,sw,sw);
      // Cover boundary (dashed)
      LC(150,100,0);LW(0.2);doc.setLineDashPattern([1.5,1],0);
      Rect(bx3+cv3,by3+cv3,sw-2*cv3,sw-2*cv3,'D');
      doc.setLineDashPattern([],0);
      // Ties (clear rectangle)
      const tieR=(S.coverCol+5)*sc2;
      Stirrup(bx3+tieR,by3+tieR,sw-2*tieR,sw-2*tieR);
      // Longitudinal bars — large, clearly visible
      const barPad=(S.coverCol+8)*sc2;
      const nb3=c.nb||4;
      const barR3=Math.max(1.2,c.dB/2*sc2*0.8);
      const bpos=[[bx3+barPad,by3+barPad],[bx3+sw-barPad,by3+barPad],
                  [bx3+barPad,by3+sw-barPad],[bx3+sw-barPad,by3+sw-barPad]];
      if(nb3>=6)bpos.push([fcx2,by3+barPad],[fcx2,by3+sw-barPad]);
      if(nb3>=8)bpos.push([bx3+barPad,csecY+sw/2],[bx3+sw-barPad,csecY+sw/2]);
      bpos.slice(0,nb3).forEach(([px,py])=>Rebar(px,py,barR3));

      // Clear dimension labels
      DH(bx3,bx3+sw,by3+sw+3,r0(c.size)+' mm',false);
      DV(bx3-4,by3,by3+sw,r0(c.size)+' mm',true);
      F(6,'italic',80,80,80);Txt('SCALE 1:25',fcx2,by3+sw+10,{align:'center'});

      // Leader labels — positioned to not overlap
      F(6.5,'bold',0,0,0);
      Ld(bx3+barPad,by3+barPad,czX+2,csecY-4,nb3+'-D'+c.dB+' LONG.');
      // Ties leader
      F(6.5,'normal',0,0,0);
      Ld(bx3+tieR+1,by3+tieR+sw/2,czX+2,csecY+sw/2+4,'Y8 TIES');

      // ELEVATION (confinement detail)
      const elevY=csecY+sw+18;
      const elW=Math.min(16,sw*0.9);
      const elH=Math.min(55,(S.floorHt*1000/40)); // 1:40 scale
      F(7,'bold',0,0,0);Txt('ELEVATION',fcx2,elevY-2,{align:'center'});
      const elx=fcx2-elW/2;

      // Beam/slab stubs at top and bottom
      FC(180,185,210);LC(0,0,0);LW(0.5);
      Rect(elx-5,elevY,elW+10,4,'FD');
      Rect(elx-5,elevY+elH-4,elW+10,4,'FD');
      // Column body
      FC(232,235,242);LC(0,0,0);LW(0.6);Rect(elx,elevY+4,elW,elH-8,'FD');
      // Confinement zones (red fill)
      const LoH=Math.min((c.Lo||500)/40,(elH-8)*0.35);
      FC(255,225,225);LC(180,0,0);LW(0.4);
      Rect(elx,elevY+4,elW,LoH,'FD');
      Rect(elx,elevY+elH-4-LoH,elW,LoH,'FD');
      // Confinement ties (red dense)
      const tscD=(c.tsc||75)/40;
      LC(180,0,0);LW(0.35);
      for(let ty2=elevY+4+tscD;ty2<elevY+4+LoH;ty2+=tscD)Line(elx,ty2,elx+elW,ty2);
      for(let ty2=elevY+elH-4-LoH;ty2<elevY+elH-4;ty2+=tscD)Line(elx,ty2,elx+elW,ty2);
      // General ties (grey)
      const tsD=(c.ts||200)/40;
      LC(80,80,80);LW(0.2);
      for(let ty2=elevY+4+LoH+tsD;ty2<elevY+elH-4-LoH;ty2+=tsD)Line(elx,ty2,elx+elW,ty2);
      // Long bars
      LC(0,0,0);LW(0.6);
      Line(elx+1.5,elevY+4,elx+1.5,elevY+elH-4);
      Line(elx+elW-1.5,elevY+4,elx+elW-1.5,elevY+elH-4);

      // Elevation annotations — all to the right, clear
      DV(elx+elW+4,elevY,elevY+elH,ftin(S.floorHt),false);
      F(7,'bold',180,0,0);Txt('Lo='+r0(c.Lo||500)+'mm',elx+elW+5,elevY+4+LoH/2+1);
      F(6.5,'bold',180,0,0);Txt('D8@'+r0(c.tsc||75)+'mm',elx+elW+5,elevY+4+LoH/2+6);
      Txt('Lo='+r0(c.Lo||500)+'mm',elx+elW+5,elevY+elH-4-LoH/2+1);
      F(6.5,'normal',0,0,100);Txt('D8@'+r0(c.ts||200)+'mm',elx+elW+5,elevY+elH/2);

      // Schedule table
      const sbY2=elevY+elH+8;
      LC(0,0,100);LW(0.4);Rect(czX+2,sbY2,czW2-4,34,'D');
      FC(220,228,248);Rect(czX+2,sbY2,czW2-4,6,'F');
      F(6.5,'bold',0,0,100);Txt('SCHEDULE',fcx2,sbY2+4.5,{align:'center'});
      F(6.5,'normal',0,0,0);let sy4=sbY2+10;
      [['SIZE',r0(c.size)+'x'+r0(c.size)+' mm ('+s2(Math.round(c.size/25.4)+'" x '+Math.round(c.size/25.4)+'")')],
       ['MAIN BARS',nb3+'-D'+c.dB+' (pt='+r2(c.pt)+'%)'],
       ['TIES (GEN)','D8@'+r0(c.ts)+'mm'],
       ['TIES (CONF)','D8@'+r0(c.tsc)+'mm (Lo='+r0(c.Lo)+'mm)'],
       ['Pu / Cap',r2(c.Pu)+' / '+r2(c.Pcap)+' kN'],
       ['STATUS',c.safe?'SAFE':'FAIL - REVISE'],
      ].forEach(([l,v],ri)=>{
        if(ri%2===0){FC(245,248,255);Rect(czX+3,sy4-3.5,czW2-6,5.5,'F');}
        F(6.5,'bold',0,40,100);Txt(l,czX+4,sy4);
        F(6.5,'normal',c.safe||l!=='STATUS'?0:180,0,0);Txt(v,czX+30,sy4);
        sy4+=5.5;
      });
    });

    // Lapping notes at bottom
    const lnY=DRAW_BOT-20;
    LC(0,0,100);LW(0.3);Rect(DR_X,lnY,DR_W,18,'D');
    FC(240,244,255);Rect(DR_X,lnY,DR_W,7,'F');
    F(7,'bold',0,0,100);Txt('LAPPING NOTES - MINIMUM LAP FOR COLUMN (48D):',DR_X+4,lnY+5);
    F(6.5,'normal',0,0,0);
    [12,16,20,25].forEach((dia,i)=>{Txt('D'+dia+' = '+r0(48*dia)+'mm  ('+ftin(48*dia/1000)+')',DR_X+4+i*65,lnY+12);});
    F(6.5,'italic',80,80,80);Txt('All ties: 135 deg hooks mandatory (IS 13920). No lapping within Lo zone.',DR_X+4,lnY+17);

    log('Sheet 6 done',52);

    // ================================================================
    // SHEET 7 — BEAM LAYOUT PLAN
    // ================================================================
    log('Sheet 7: Beam layout...',56);
    doc.addPage();drawPage('ST/BM01/R0','BEAM LAYOUT PLAN','1:100');
    y=DR_Y+14;
    const bpX0=DR_X+(DR_W-planW)/2, bpY0=y+16;
    drawGrid(bpX0,bpY0,planW,planH,cxA,cyA,nBX,nBY);

    // X-beams (horizontal)
    const bThick=Math.max(2,(beams[0]?.b||230)/100/2);
    let bIdx=0;
    cyA.forEach((gy,j)=>{
      cxA.forEach((gx,i)=>{
        if(i<cxA.length-1){
          const b3=beams[bIdx%beams.length]||{b:230,D:350};
          LC(180,0,0);LW(bThick);Line(gx,gy,cxA[i+1],gy);
          // Beam label ABOVE the line (not on it)
          F(6,'bold',160,0,0);Txt('B'+(bIdx+1)+'('+b3.b+'x'+b3.D+')',(gx+cxA[i+1])/2,gy-2,{align:'center'});
          bIdx++;
        }
      });
    });
    // Y-beams (vertical)
    cxA.forEach((gx,i)=>{
      cyA.forEach((gy,j)=>{
        if(j<cyA.length-1){
          const b3=beams[bIdx%beams.length]||{b:230,D:350};
          LC(0,100,0);LW(bThick);Line(gx,gy,gx,cyA[j+1]);
          // Y-beam label to the RIGHT of the line
          F(6,'bold',0,100,0);Txt('B'+(bIdx+1),gx+2.5,(gy+cyA[j+1])/2+1.5);
          bIdx++;
        }
      });
    });
    // Columns (solid squares)
    cxA.forEach((gx,i)=>{cyA.forEach((gy,j)=>{
      const ct=colType(i,j);
      const cw3=(ct==='C1'?c1:ct==='C2'?c2:c3)?.size||300;
      const csd=cw3/100/2;
      FC(100,100,160);LC(0,0,0);LW(0.5);Rect(gx-csd,gy-csd,csd*2,csd*2,'FD');
      F(6,'bold',255,255,255);Txt(ct,gx,gy+2,{align:'center'});
    });});
    // Slab panel labels — in the CENTRE of each bay, boxed
    cxA.forEach((gx,i)=>{if(i<cxA.length-1)cyA.forEach((gy,j)=>{
      if(j<cyA.length-1){
        const mx=(gx+cxA[i+1])/2, my=(gy+cyA[j+1])/2;
        FC(240,245,255);LC(0,0,180);LW(0.2);Rect(mx-7,my-4,14,7,'FD');
        F(6.5,'bold',0,0,150);Txt('S'+(j*nBX+i+1),mx,my+2,{align:'center'});
      }
    });});

    // Dims
    S.spansX.slice(0,nBX).forEach((sp,i)=>DH(cxA[i],cxA[i+1],bpY0+planH+14,ftin(sp),false));
    DH(bpX0,bpX0+planW,bpY0+planH+22,ftin(totX)+' TOTAL',false);
    S.spansY.slice(0,nBY).forEach((sp,j)=>DV(bpX0-22,cyA[j],cyA[j+1],ftin(sp),true));
    DV(bpX0-30,bpY0,bpY0+planH,ftin(totY)+' TOTAL',true);

    // Legend
    const lgY4=bpY0+planH+34;
    LC(180,0,0);LW(bThick);Line(DR_X+4,lgY4,DR_X+22,lgY4);
    F(7,'bold',0,0,0);Txt('LEGEND:',DR_X+4,lgY4-5);
    F(6.5,'normal',0,0,0);Txt('X-Beam (B1..)',DR_X+25,lgY4+1);
    LC(0,100,0);LW(bThick);Line(DR_X+80,lgY4,DR_X+98,lgY4);
    Txt('Y-Beam',DR_X+101,lgY4+1);
    F(6.5,'italic',80,80,80);Txt('Beam notation: B(No)(Width x Depth)  e.g. B1(230x400) = Beam 1, 230mm wide x 400mm deep',DR_X+4,lgY4+8);
    Txt('Refer ST/BM02 for detailed beam elevations and cross-sections.',DR_X+4,lgY4+14);

    // Typical floor note — prominent box with floor list
    const tfnY=lgY4+22;
    LC(0,60,150);LW(0.5);FC(230,240,255);Rect(DR_X,tfnY,DR_W,26,'FD');
    F(7.5,'bold',0,40,140);Txt('TYPICAL FLOOR BEAM LAYOUT  (APPLIES TO ALL FLOORS LISTED BELOW)',DR_X+DR_W/2,tfnY+6,{align:'center'});
    F(6.5,'normal',0,0,0);
    const floorList=[];
    for(let fi=1;fi<S.numFloors;fi++){floorList.push(fi===S.numFloors-1?'Roof Beam':'F'+fi+' Beam');}
    Txt('Floors: Ground Floor Beam (plinth) | '+floorList.join(' | '),DR_X+DR_W/2,tfnY+13,{align:'center'});
    Txt('NOTE: Ground floor (plinth/grade) beam sizes may differ. Verify with structural engineer.',DR_X+DR_W/2,tfnY+18.5,{align:'center'});
    Txt('All beams shown: '+beams[0].b+'mm wide x '+beams[0].D+'mm deep (typical).',DR_X+DR_W/2,tfnY+23,{align:'center'});

    log('Sheet 7 done',60);

    // ================================================================
    // SHEET 8 — BEAM DETAIL
    // ================================================================
    log('Sheet 8: Beam detail...',66);
    doc.addPage();drawPage('ST/BM02/R0','BEAM DETAIL','1:25 / 1:50');
    y=DR_Y+14;

    // Typical stirrup detail — compact box top-right
    const tdX=DR_X+DR_W-80, tdY=y-2;
    LC(0,0,100);LW(0.4);Rect(tdX,tdY,78,28,'D');
    FC(220,228,248);Rect(tdX,tdY,78,7,'F');
    F(7,'bold',0,0,100);Txt('TYPICAL STIRRUP DETAIL',tdX+39,tdY+5,{align:'center'});
    F(6.5,'normal',0,0,0);
    Txt('AT SUPPORT: D8@5" c/c (135 deg hook)',tdX+2,tdY+12);
    Txt('AT MIDSPAN: D8@7" c/c (135 deg hook)',tdX+2,tdY+17);
    TW('Confinement zone: max(2D, L/4) from support',tdX+2,tdY+22,76);

    // Show up to 3 unique beam types, one per row
    const uBeams2=[];
    beams.forEach(b=>{if(!uBeams2.find(u=>u.b===b.b&&u.D===b.D&&u.nm===b.nm))uBeams2.push(b);});
    const showB=uBeams2.slice(0,3);if(!showB.length&&beams.length)showB.push(beams[0]);
    const bRowH=(DR_H-14)/Math.max(1,showB.length);

    showB.forEach((b3,bi)=>{
      const bzy=y+bi*bRowH;
      // Row header
      FC(0,40,100);Rect(DR_X,bzy,DR_W-82,7,'F');
      F(7,'bold',255,255,255);Txt(s2((b3.label||'Beam B'+(bi+1)).slice(0,20))+'  '+b3.b+'x'+b3.D+'mm  L='+b3.L+'m ('+ftin(b3.L)+')',DR_X+3,bzy+5);

      // ── CROSS SECTION (left ~80mm) ─────────────────────────────
      const secW=72, secH=bRowH-16;
      const sc3=Math.min(secW/b3.b,(secH-8)/b3.D)*0.8;
      const bw3=b3.b*sc3, bh3=b3.D*sc3;
      const bcx2=DR_X+2+secW/2, bcy2=bzy+10+bh3/2;
      const bx4=bcx2-bw3/2, by4=bcy2-bh3/2;
      const cv4=S.coverBeam*sc3;

      F(7,'bold',0,0,0);Txt('SECTION',bcx2,by4-3,{align:'center'});
      // Concrete
      FC(232,235,242);LC(0,0,0);LW(0.7);Rect(bx4,by4,bw3,bh3,'FD');
      Hatch(bx4,by4,bw3,bh3);
      // Cover line (dashed)
      LC(150,100,0);LW(0.2);doc.setLineDashPattern([1.5,1],0);
      Rect(bx4+cv4,by4+cv4,bw3-2*cv4,bh3-2*cv4,'D');doc.setLineDashPattern([],0);
      // Stirrup
      const strDia=8*sc3;
      Stirrup(bx4+cv4+strDia,by4+cv4+strDia,bw3-2*cv4-2*strDia,bh3-2*cv4-2*strDia);
      // Bottom bars (solid, main tension)
      const barR4=Math.max(1.0,10*sc3);
      const nb4=b3.nm||2;
      const bspan2=(nb4>1?(bw3-2*cv4-2*strDia-2*barR4)/(nb4-1):0);
      for(let i=0;i<nb4;i++)Rebar(bx4+cv4+strDia+barR4+i*bspan2,by4+bh3-cv4-strDia-barR4,barR4);
      // Top bars (slightly smaller)
      const nt4=b3.ns||2;
      const tspan2=(nt4>1?(bw3-2*cv4-2*strDia-2*barR4*0.85)/(nt4-1):0);
      for(let i=0;i<nt4;i++)Rebar(bx4+cv4+strDia+barR4*0.85+i*tspan2,by4+cv4+strDia+barR4*0.85,barR4*0.85);

      // Dims
      DH(bx4,bx4+bw3,by4+bh3+3,r0(b3.b)+'mm',false);
      DV(bx4-4,by4,by4+bh3,r0(b3.D)+'mm',true);
      F(5.5,'italic',80,80,80);Txt('Scale 1:'+Math.round(1/sc3),bcx2,by4+bh3+10,{align:'center'});
      // Leaders — offset to avoid overlap
      F(6.5,'normal',0,0,0);
      Ld(bx4+cv4+strDia+barR4,by4+bh3-cv4-strDia-barR4,DR_X+4,bzy+bRowH-8,nb4+'-Y20 (BOT)');
      Ld(bx4+cv4+strDia+barR4*0.85,by4+cv4+strDia+barR4*0.85,DR_X+4,bzy+bRowH-14,nt4+'-Y20 (TOP)');
      Ld(bx4+cv4+strDia,by4+bh3/2,bcx2-bw3/2-2,bzy+bRowH-3,'Y8 STIRRUP');

      // ── ELEVATION (right ~260mm) ────────────────────────────────
      const elStartX=DR_X+secW+8;
      const elW2=DR_W-secW-90; // leave 82mm for stirrup detail
      const elH2=Math.min(28,bRowH-20);
      const sc50=Math.min(elW2/(b3.L*1000),0.02);
      const elActW=b3.L*1000*sc50;
      const elX2=elStartX+(elW2-elActW)/2;
      const elY2=bzy+10;

      F(7,'bold',0,0,0);Txt('ELEVATION (1:50)',elStartX+elW2/2,elY2-2,{align:'center'});

      // Column stubs
      const colW4=Math.max(4,(c3?.size||300)*sc50);
      FC(180,182,210);LC(0,0,0);LW(0.6);
      Rect(elX2-colW4,elY2,colW4,elH2,'FD');
      Rect(elX2+elActW,elY2,colW4,elH2,'FD');
      F(6,'bold',0,0,100);Txt('COL',elX2-colW4/2,elY2+elH2/2+2,{align:'center'});
      Txt('COL',elX2+elActW+colW4/2,elY2+elH2/2+2,{align:'center'});

      // Beam concrete
      FC(232,235,242);LC(0,0,0);LW(0.5);Rect(elX2,elY2,elActW,elH2,'FD');
      Hatch(elX2,elY2,elActW,elH2);

      // Bottom bar line (bold continuous)
      LC(0,0,0);LW(1.5);Line(elX2+3,elY2+elH2-2.5,elX2+elActW-3,elY2+elH2-2.5);
      F(6.5,'bold',0,0,0);Txt(nb4+'-Y20 CONT.',elX2+elActW/2,elY2+elH2-4,{align:'center'});

      // Top steel in confinement zones
      const Lo3=Math.max(2*b3.D,b3.L*1000/4)*sc50;
      LC(0,0,0);LW(1.2);
      Line(elX2+3,elY2+2.5,elX2+Lo3,elY2+2.5);
      Line(elX2+elActW-Lo3,elY2+2.5,elX2+elActW-3,elY2+2.5);
      F(6.5,'bold',0,0,0);
      Txt(nt4+'-Y20',elX2+Lo3/2,elY2+4.5,{align:'center'});
      Txt(nt4+'-Y20',elX2+elActW-Lo3/2,elY2+4.5,{align:'center'});

      // Stirrups
      const svdD=b3.svd*sc50, svM=b3.sv*sc50;
      LC(80,80,80);LW(0.25);
      for(let sx=elX2+4;sx<elX2+Lo3;sx+=Math.max(1,svdD))Line(sx,elY2+2,sx,elY2+elH2-2);
      for(let sx=elX2+Lo3+svM;sx<elX2+elActW-Lo3;sx+=Math.max(1,svM))Line(sx,elY2+3,sx,elY2+elH2-3);
      for(let sx=elX2+elActW-Lo3;sx<elX2+elActW-4;sx+=Math.max(1,svdD))Line(sx,elY2+2,sx,elY2+elH2-2);

      // Confinement zone bracket (below beam)
      LC(180,0,0);LW(0.5);
      Line(elX2,elY2+elH2+3,elX2+Lo3,elY2+elH2+3);
      Line(elX2+Lo3,elY2+elH2+3,elX2+Lo3,elY2+elH2+2);
      Line(elX2+elActW-Lo3,elY2+elH2+3,elX2+elActW,elY2+elH2+3);
      Line(elX2+elActW-Lo3,elY2+elH2+3,elX2+elActW-Lo3,elY2+elH2+2);

      // Stirrup spacing labels BELOW confinement bracket
      F(6.5,'bold',180,0,0);Txt('D8@'+r0(b3.svd)+' (Lo)',elX2+Lo3/2,elY2+elH2+9,{align:'center'});
      F(6.5,'normal',0,0,100);Txt('D8@'+r0(b3.sv),elX2+elActW/2,elY2+elH2+9,{align:'center'});
      F(6.5,'bold',180,0,0);Txt('D8@'+r0(b3.svd)+' (Lo)',elX2+elActW-Lo3/2,elY2+elH2+9,{align:'center'});

      // Span and Lo dims — BELOW the stirrup labels
      DH(elX2,elX2+elActW,elY2+elH2+15,'L = '+b3.L+'m  ('+ftin(b3.L)+')',false);
      DH(elX2,elX2+Lo3,elY2+elH2+22,'Lo='+r0(Math.max(2*b3.D,b3.L*1000/4))+'mm',false);
    });

    // Note at very bottom
    y=DRAW_BOT-12;
    LC(0,0,0);LW(0.3);Line(DR_X,y-3,DR_X+DR_W,y-3);
    F(6.5,'italic',0,0,0);TW('NOTE: All stirrups to have 135 deg hooks at both ends (IS 13920 Cl 6.3.5). Confinement zone Lo = max(2D, L/4) from face of support. Cover = '+S.coverBeam+'mm to stirrup. Development length Ld for Y20 = '+r0(beams[0]?.Ld||480)+'mm. DO NOT lap bars within L/4 of support.',DR_X+2,y,DR_W-4);

    log('Sheet 8 done',68);

    // ================================================================
    // SHEET 9 — SLAB DETAIL
    // ================================================================
    log('Sheet 9: Slab detail...',72);
    doc.addPage();drawPage('ST/SL01/R0','SLAB REINFORCEMENT DETAIL','1:50');
    y=DR_Y+14;
    F(8,'bold',0,0,100);Txt('SLAB REINFORCEMENT DETAIL  -  TYPICAL FLOOR ('+ftin(sl.slabD/1000)+' THICK)',DX+DW2/2,y,{align:'center'});
    y+=10;

    // Two side-by-side diagrams: intermediate support (left) + edge support (right)
    const diagW=(DW2-10)/2, diagH=70;

    // ── INTERMEDIATE SUPPORT ──────────────────────────────────────
    F(7,'bold',0,0,100);Txt('INTERMEDIATE SUPPORT DETAIL',DX+diagW/2,y-1,{align:'center'});
    const isy=y+4;
    const slH=18, beamW2=Math.max(8,(beams[0]?.b||230)/50);
    const midX3=DX+diagW/2;

    // Left slab
    FC(232,235,242);LC(0,0,0);LW(0.5);Rect(DX+4,isy,diagW/2-beamW2/2-4,slH,'FD');Hatch(DX+4,isy,diagW/2-beamW2/2-4,slH);
    // Right slab
    Rect(midX3+beamW2/2,isy,diagW/2-beamW2/2-4,slH,'FD');Hatch(midX3+beamW2/2,isy,diagW/2-beamW2/2-4,slH);
    // Beam
    FC(195,198,215);LC(0,0,0);LW(0.5);Rect(midX3-beamW2/2,isy-8,beamW2,slH+8,'FD');
    F(6.5,'bold',0,0,100);Txt('BEAM',midX3,isy-4.5,{align:'center'});
    F(6,'normal',0,0,0);Txt(r0(beams[0]?.b||230)+'x'+r0(beams[0]?.D||350),midX3,isy-1,{align:'center'});

    // Bottom bar (continuous)
    const barDia=10; // T10 main bar
    LC(0,0,0);LW(1.0);Line(DX+6,isy+slH-3,midX3-beamW2/2,isy+slH-3);
    Line(midX3+beamW2/2,isy+slH-3,DX+diagW-4,isy+slH-3);
    F(6.5,'bold',0,0,0);Txt('Y'+barDia+'@'+sl.spx+' BOT. CONT.',DX+8,isy+slH-4.5);

    // Top bar over support — correct extent = lx/5 or 0.3L
    const topEx=Math.min(sl.lx/5*1000/50,diagW/2-beamW2/2-2); // at 1:50
    LW(1.2);Line(midX3-beamW2/2-topEx,isy+2,midX3+beamW2/2+topEx,isy+2);
    F(6.5,'bold',0,0,0);Txt('D8@'+sl.spx_n+' TOP',midX3,isy+1,{align:'center'});
    // Extent dim
    DH(midX3-beamW2/2-topEx,midX3-beamW2/2,isy-7,'0.3L ('+ftin(sl.lx*0.3)+')',true);
    // Slab thickness dim
    DV(DX+2,isy,isy+slH,r0(sl.slabD)+'mm',true);
    // L labels
    F(7,'bold',0,0,100);Txt('L1',DX+8+diagW/4-beamW2/4,isy+slH/2,{align:'center'});
    Txt('L2',midX3+beamW2/2+diagW/4-2,isy+slH/2,{align:'center'});
    F(6,'normal',0,0,0);Txt('SLAB D = '+r0(sl.slabD)+'mm  ('+ftin(sl.slabD/1000)+')',DX+4,isy+slH+8);

    // ── EDGE SUPPORT ──────────────────────────────────────────────
    const esd_x=DX+diagW+6;
    F(7,'bold',0,0,100);Txt('EDGE SUPPORT DETAIL',esd_x+diagW/2,y-1,{align:'center'});
    const esy=y+4;
    const wallW=10, wallX=esd_x+diagW-22;
    // Wall
    FC(160,160,160);LC(0,0,0);LW(0.3);Rect(wallX,esy-8,wallW,slH+8,'FD');
    for(let hy=esy-8;hy<esy+slH;hy+=5){LC(120,120,120);LW(0.2);Line(wallX,hy,wallX+wallW,hy);Line(wallX,hy,wallX-3,hy+3);}
    F(6.5,'bold',0,0,0);Txt('WALL',wallX+wallW/2,esy-5,{align:'center'});
    // Edge slab
    FC(232,235,242);LC(0,0,0);LW(0.5);Rect(esd_x+4,esy,wallX-esd_x-6,slH,'FD');
    Hatch(esd_x+4,esy,wallX-esd_x-6,slH);
    // L-bar at edge (bent 90°)
    LC(0,0,0);LW(1.2);
    Line(esd_x+6,esy+slH-3,wallX-1,esy+slH-3); // horizontal
    Line(wallX-1,esy+slH-3,wallX-1,esy+3);       // vertical leg
    F(6.5,'bold',0,0,0);Txt('L-BAR AT EDGE',esd_x+6,esy+slH+5);
    // Correct Ld: 60 × bar dia (T10 = 10mm → Ld = 600mm)
    const slabBarDia=10;
    F(6.5,'normal',0,0,0);Txt('Ld = 60x'+slabBarDia+' = '+r0(60*slabBarDia)+'mm',esd_x+6,esy+slH+11);
    DV(esd_x+2,esy,esy+slH,r0(sl.slabD)+'mm',true);

    // Slab schedule table
    y+=diagH;
    LC(0,0,100);LW(0.5);Rect(DX,y,DW2,7,'D');
    FC(220,228,248);Rect(DX,y,DW2,7,'F');
    F(7,'bold',0,0,100);Txt('SCHEDULE OF SLABS',DX+DW2/2,y+5,{align:'center'});
    y+=8;
    // Compact column widths
    const shdr2=['SLAB','LONG SPAN','SHORT SPAN','TOP (LONG)','TOP (SHORT)','BOT. (LONG)','BOT. (SHORT)','TYPE','REMARKS'];
    const sws2=[16,24,24,20,20,22,22,18,26];
    FC(220,228,248);Rect(DX,y,DW2,6,'FD');LC(0,0,0);LW(0.1);Rect(DX,y,DW2,6,'D');
    F(6.5,'bold',0,0,100);let six2=DX+1;shdr2.forEach((h,i)=>{Txt(h,six2+1,y+4.5);six2+=sws2[i];});
    y+=6;
    ['S1','S2','S3'].forEach((slbl,sri)=>{
      if(sri%2===0){FC(246,249,255);Rect(DX,y,DW2,6,'F');}
      LC(0,0,0);LW(0.1);Rect(DX,y,DW2,6,'D');
      six2=DX+1;
      F(6.5,'bold',0,0,0);Txt(slbl,six2+1,y+4.5);six2+=sws2[0];
      F(6.5,'normal',0,0,0);
      [ftin(sl.ly),ftin(sl.lx),'D8@'+sl.spx_n+' c/c','D8@'+sl.spx_n+' c/c',
       'Y'+slabBarDia+'@'+sl.spx+' c/c','D8@'+sl.spy+' c/c',
       sl.twoWay?'TWO WAY':'ONE WAY','REFER TYPICAL DETAIL'
      ].forEach((v,i)=>{Txt(v,six2+1,y+4.5);six2+=sws2[i+1];});
      y+=6;
    });
    y+=8;

    // Lapping table
    F(7,'bold',0,0,0);Txt('MINIMUM LAP LENGTH FOR BEAM AND SLAB (60D):',DX,y);y+=6;
    F(6.5,'normal',0,0,0);
    [8,10,12,16,20,25].forEach((dia,i)=>Txt('D'+dia+' = '+r0(60*dia)+'mm ('+ftin(60*dia/1000)+')',DX+i*45,y));
    y+=8;
    F(6.5,'italic',80,80,80);
    TW('NOTE: D = '+r0(sl.slabD)+'mm  |  d eff = '+r0(sl.slabd)+'mm  |  Cover = '+S.coverSlab+'mm  |  Case '+sl.slabCase+' (IS 456 Table 26)  |  Top bars extend 0.25L ('+ftin(sl.lx*0.25)+') from intermediate support and 0.3L ('+ftin(sl.lx*0.3)+') from edge support. L-bar at all edge supports.',DX,y,DW2-4);

    log('Sheet 9 done',76);

    // ================================================================
    // SHEET 10 — BAR BENDING SCHEDULE
    // ================================================================
    log('Sheet 10: BBS...',80);
    doc.addPage();drawPage('ST/BB01/R0','BAR BENDING SCHEDULE (BBS)','NTS');
    y=DR_Y+14;


    // ── BAR SHAPE SKETCH for BBS ─────────────────────────────────
    const drawBarShape = (x, y, shape, A, B) => {
      const w = 18, h = 8; // sketch box size
      LC(0,0,0); LW(0.5);
      const sh = (shape||'').toLowerCase();
      if(sh.includes('straight')||sh.includes('str')){
        // ── straight bar
        Line(x+2, y+h/2, x+w-2, y+h/2);
        Line(x+2, y+h/2-1, x+2, y+h/2+1);   // left tick
        Line(x+w-2, y+h/2-1, x+w-2, y+h/2+1); // right tick
      } else if(sh.includes('l-bar')||sh.includes('l bar')){
        // ⌐ L-bar
        Line(x+2, y+2, x+w-2, y+2);  // top horizontal
        Line(x+2, y+2, x+2, y+h-2);  // vertical leg
      } else if(sh.includes('90hook')||sh.includes('90 hook')){
        // straight + 90° hook at right
        Line(x+2, y+h/2, x+w-4, y+h/2);
        Line(x+w-4, y+h/2, x+w-4, y+h/2-3);
      } else if(sh.includes('closed')||sh.includes('rect')||sh.includes('stirrup')){
        // closed rectangle stirrup
        const rx=x+2, ry=y+1.5, rw=w-4, rh=h-3;
        doc.rect(rx, ry, rw, rh, 'D');
        // 135° hooks
        LW(0.35);
        Line(rx, ry, rx-2, ry-2);
        Line(rx+rw, ry, rx+rw+2, ry-2);
      } else if(sh.includes('crank')){
        // cranked bar (column bar with crank)
        Line(x+2, y+3, x+7, y+3);
        Line(x+7, y+3, x+11, y+h-3);
        Line(x+11, y+h-3, x+w-2, y+h-3);
      } else {
        // default: straight
        Line(x+2, y+h/2, x+w-2, y+h/2);
      }
    };

    const wt3=(dia,len)=>Math.round(Math.PI/4*(n(dia)/1000)**2*n(len)/1000*7850*100)/100;
    let bbsTotal=0;
    let tRow3=0;
    const bbsHdr=(title,r2c,g2,b2c)=>{
      FC(n(r2c),n(g2),n(b2c));Rect(DR_X,y,DR_W,7,'F');
      LC(0,0,0);LW(0.3);Rect(DR_X,y,DR_W,7,'D');
      F(7,'bold',255,255,255);Txt(title,DR_X+DR_W/2,y+5,{align:'center'});y+=8;
      const hs=['MARK','DIA','SKETCH','SHAPE','A (mm)','B (mm)','L (mm)','NO.','WT (kg)'];
      const ws3=[20,14,20,20,20,18,20,14,20];
      FC(220,228,248);Rect(DR_X,y,DR_W,6,'FD');LC(0,0,0);LW(0.1);Rect(DR_X,y,DR_W,6,'D');
      F(6.5,'bold',0,0,100);let hx=DR_X+1;hs.forEach((h,i)=>{Txt(h,hx+1,y+4.5);hx+=ws3[i];});y+=6;tRow3=0;
    };
    const bbsRow=(mark,dia,shape,A,B,L,num,note)=>{
      const wt4=wt3(dia,L*num);bbsTotal+=wt4;tRow3++;
      if(tRow3%2===0){FC(246,249,255);}else{FC(255,255,255);}
      Rect(DR_X,y,DR_W,6,'F');LC(0,0,0);LW(0.1);Rect(DR_X,y,DR_W,6,'D');
      const ws3=[20,14,20,20,20,18,20,14,20];
      // Draw bar shape sketch in column 2
      drawBarShape(DR_X+35, y-0.5, shape, n(A), n(B));
      const cells=[mark,'D'+dia,'',shape,A||'-',B||'-',L,num,Math.round(wt4*100)/100+(note?' *':'')];
      let hx=DR_X+1;cells.forEach((c,i)=>{if(i===2){hx+=ws3[i];return;}F(6.5,i===0||i===8?'bold':'normal',0,0,0);Txt(s2(String(c||'')),hx+1,y+4.5);hx+=ws3[i];});y+=6;
    };

    // SLAB
    bbsHdr('SLAB  -  TYPICAL FLOOR (x'+S.numFloors+' floors)',0,60,130);
    const sNX2=Math.ceil(sl.ly*1000/sl.spx)+1, sNY2=Math.ceil(sl.lx*1000/sl.spy)+1;
    const sBx2=r0(sl.lx*1000+2*S.coverSlab+160), sBy2=r0(sl.ly*1000+2*S.coverSlab+160);
    const sTopL=r0(sl.lx/5*1000+100), sTopN2=(Math.ceil(sl.ly*1000/sl.spx_n)+1)*4;
    bbsRow('Bx1',10,'Straight',sBx2,'',sBx2,sNX2*S.numFloors,'');
    bbsRow('By1',8,'Straight',sBy2,'',sBy2,sNY2*S.numFloors,'');
    bbsRow('Tx1',8,'L-Bar',r0(sl.lx/5*1000+100),r0(sl.lx/5*1000+100),r0(sTopL*2+100),sTopN2*S.numFloors,'');
    y+=3;

    // BEAMS — grouped by unique type
    const uB2=[];beams.forEach(b=>{if(!uB2.find(u=>u.b===b.b&&u.D===b.D&&u.nm===b.nm))uB2.push(b);});
    bbsHdr('BEAMS (x'+S.numFloors+' floors)',130,60,10);
    uB2.forEach((b3,bi)=>{
      const mc=beams.filter(bm=>bm.b===b3.b&&bm.D===b3.D&&bm.nm===b3.nm).length;
      const cBt=r0(b3.L*1000+2*(b3.Ld||480)+80);
      const cTp=r0(Math.max(2*b3.D,b3.L*1000/4)+(b3.Ld||480)+80);
      const sP=r0(2*(b3.b-2*S.coverBeam)+2*(b3.D-2*S.coverBeam)+2*11.2*8);
      const nZ=Math.ceil(Math.max(2*b3.D,b3.L*1000/4)/b3.svd);
      const nM=Math.max(1,Math.ceil((b3.L*1000-2*Math.max(2*b3.D,b3.L*1000/4))/b3.sv));
      const pfx='B'+(bi+1);
      bbsRow(pfx+'b',20,'Str+Hook',cBt,'',cBt,b3.nm*mc*S.numFloors,'Bot-cts');
      bbsRow(pfx+'t',20,'Straight',cTp,'',cTp,b3.ns*2*mc*S.numFloors,'Top-supt');
      bbsRow(pfx+'se',8,'Closed 135',r0(b3.b-2*S.coverBeam+88),r0(b3.D-2*S.coverBeam),sP,nZ*2*mc*S.numFloors,'Conf.zone');
      bbsRow(pfx+'sm',8,'Closed 135',r0(b3.b-2*S.coverBeam+88),r0(b3.D-2*S.coverBeam),sP,nM*mc*S.numFloors,'Mid.span');
    });
    y+=3;

    // COLUMNS
    bbsHdr('COLUMNS (x'+S.numFloors+' floors)',80,40,140);
    [[c1,'CC',2],[c2,'EC',4],[c3,'IC',6]].forEach(([c,lbl,cnt])=>{
      if(!c)return;
      const cL=r0(S.floorHt*1000+600);
      const tP=r0(4*(c.size-2*S.coverCol)+2*11.2*8);
      const nG=Math.ceil((S.floorHt*1000-(c.Lo||500)*2)/(c.ts||200));
      const nC=Math.ceil((c.Lo||500)/(c.tsc||75))*2;
      bbsRow(lbl+'_L',c.dB,'Cranked',cL,'',cL,c.nb*cnt*S.numFloors,'');
      bbsRow(lbl+'_TG',8,'Cl.Rect',r0(c.size-2*S.coverCol+88),r0(c.size-2*S.coverCol),tP,nG*cnt*S.numFloors,'Gen.ties');
      bbsRow(lbl+'_TC',8,'Cl.135',r0(c.size-2*S.coverCol+88),r0(c.size-2*S.coverCol),tP,nC*cnt*S.numFloors,'Conf.ties');
    });
    y+=3;

    // FOOTINGS
    if(y<DRAW_BOT-28){
      bbsHdr('FOOTINGS',80,60,10);
      [{f:f1,lbl:'FTG-C',cnt:2},{f:f2,lbl:'FTG-E',cnt:4},{f:f3,lbl:'FTG-I',cnt:6}].forEach(({f,lbl,cnt})=>{
        const nBF=Math.floor((f.Bf||1)*1000/(f.spf||200))+1;
        const cF=r0((f.Bf||1)*1000-150+160);
        bbsRow(lbl+'_F',f.dBf,'Str+90Hook',r0((f.Bf||1)*1000-150),80,cF,nBF*2*cnt,'Both ways');
      });
      y+=3;
    }

    // Grand total
    LC(0,0,0);LW(0.6);FC(0,40,100);Rect(DR_X,y,DR_W,11,'FD');
    F(11,'bold',255,255,255);Txt('TOTAL STEEL: '+Math.round(bbsTotal)+' kg  =  '+Math.round(bbsTotal/10)/100+' MT',DR_X+4,y+7.5);
    F(7,'normal',200,220,255);Txt('@ Rs.75/kg  =  Rs.'+Math.round(bbsTotal*75).toLocaleString('en-IN'),DR_X+DR_W-2,y+7.5,{align:'right'});
    y+=15;
    F(6.5,'italic',80,80,80);Txt('* Add 5% wastage for procurement. Weights are theoretical (IS 1786, density 7850 kg/m3).',DR_X,y);

    log('Sheet 10 done',84);

    // ================================================================
    // SHEET 11 — BUILDING ELEVATION
    // ================================================================
    log('Sheet 11: Building elevation...',88);
    doc.addPage();drawPage('ST/EL01/R0','BUILDING ELEVATION','1:100');
    y=DR_Y+14;

    F(8,'bold',0,0,100);Txt('BUILDING ELEVATION  -  FRONT & SIDE VIEWS',DX+DW2/2,y,{align:'center'});
    y+=10;

    // Front elevation — takes up 58% of drawing width
    const feW2=DW2*0.56, feX2=DX;
    const feH2=Math.min(DR_H-30,S.numFloors*S.floorHt*1000/100); // 1:100
    const feSc2=feH2/(S.numFloors*S.floorHt*1000);
    const feW3=totX*1000*feSc2; // actual plan width at this scale
    const feX3=feX2+(feW2-feW3)/2;
    const feY0=y+feH2+4; // ground level

    F(7,'bold',0,0,80);Txt('FRONT ELEVATION ('+ftin(totX)+' x '+ftin(S.numFloors*S.floorHt)+')',feX3,y-1);

    // Span x positions at elevation scale
    const feSpX=[feX3];S.spansX.slice(0,nBX).forEach(sp=>{feSpX.push(feSpX[feSpX.length-1]+sp*1000*feSc2);});

    // Ground line
    LC(0,0,0);LW(1.2);Line(feX3-15,feY0,feX3+feW3+15,feY0);
    LC(100,80,40);LW(0.3);for(let hx=feX3-14;hx<feX3+feW3+14;hx+=5)Line(hx,feY0+0.5,hx-4,feY0+5);

    // CL grid lines
    feSpX.forEach((gx,i)=>{
      LC(160,160,210);LW(0.15);doc.setLineDashPattern([3,2],0);
      Line(gx,feY0+2,gx,feY0-feH2-8);doc.setLineDashPattern([],0);
      LC(0,0,0);LW(0.4);doc.circle(gx,feY0+8,2.5,'D');
      F(6.5,'bold',0,0,0);Txt(String(i+1),gx,feY0+10,{align:'center'});
    });

    // Floor level lines and labels
    for(let f2=0;f2<=S.numFloors;f2++){
      const gy=feY0-f2*S.floorHt*1000*feSc2;
      LC(160,170,200);LW(0.2);doc.setLineDashPattern([5,3],0);
      Line(feX3-8,gy,feX3+feW3+8,gy);doc.setLineDashPattern([],0);
      const lbl=f2===0?'G.L.':f2===S.numFloors?'ROOF':'F.F.L.'+(f2>1?f2:'');
      F(7,'bold',0,0,0);Txt(lbl,feX3-10,gy+1.5,{align:'right'});
    }

    // Columns (visible solid rectangles)
    const colWfe=Math.max(4,(c3?.size||300)*feSc2);
    feSpX.forEach(gx=>{
      for(let f2=0;f2<S.numFloors;f2++){
        const gy=feY0-f2*S.floorHt*1000*feSc2;
        FC(100,100,160);LC(0,0,0);LW(0.4);
        Rect(gx-colWfe/2,gy-S.floorHt*1000*feSc2,colWfe,S.floorHt*1000*feSc2,'FD');
      }
    });

    // Beams and slabs
    const bHfe=Math.max(3,(beams[0]?.D||350)*feSc2);
    const slHfe=Math.max(1.5,(sl.slabD||150)*feSc2*0.5);
    for(let f2=1;f2<=S.numFloors;f2++){
      const gy=feY0-f2*S.floorHt*1000*feSc2;
      feSpX.forEach((gx,i)=>{if(i<feSpX.length-1){
        FC(130,70,20);LC(0,0,0);LW(0.4);
        Rect(gx+colWfe/2,gy,feSpX[i+1]-gx-colWfe,bHfe,'FD');
      }});
      FC(195,200,218);LC(0,0,0);LW(0.2);
      Rect(feX3,gy+bHfe,feW3,slHfe,'FD');
      // Windows (schematic)
      if(f2<S.numFloors){
        feSpX.forEach((gx,i)=>{if(i<feSpX.length-1){
          const wW=Math.min(feSpX[i+1]-feSpX[i]-colWfe-4,25);
          const wx=(feSpX[i]+feSpX[i+1])/2-wW/2;
          const wH=(S.floorHt*1000*feSc2-bHfe-slHfe)*0.55;
          const wy2=gy-S.floorHt*1000*feSc2+bHfe+5;
          FC(200,220,245);LC(0,0,0);LW(0.25);Rect(wx,wy2,wW,wH,'FD');
          LW(0.15);Line(wx+wW/2,wy2,wx+wW/2,wy2+wH);Line(wx,wy2+wH/2,wx+wW,wy2+wH/2);
        }});
      }
    }
    // Parapet
    const parH=1.0*1000*feSc2;
    FC(155,160,180);LC(0,0,0);LW(0.3);Rect(feX3,feY0-feH2-parH,feW3,parH,'FD');
    F(6,'italic',0,0,0);Txt('Parapet 1.0m',feX3+feW3/2,feY0-feH2-parH/2+1,{align:'center'});

    // Elevation dims
    S.spansX.slice(0,nBX).forEach((sp,i)=>DH(feSpX[i],feSpX[i+1],feY0+18,ftin(sp),false));
    DH(feX3,feX3+feW3,feY0+26,ftin(totX)+' TOTAL',false);
    for(let f2=0;f2<S.numFloors;f2++)
      DV(feX3+feW3+12,feY0-f2*S.floorHt*1000*feSc2,feY0-(f2+1)*S.floorHt*1000*feSc2,ftin(S.floorHt),false);
    DV(feX3+feW3+20,feY0,feY0-feH2,ftin(S.numFloors*S.floorHt)+' HT.',false);

    // SIDE ELEVATION
    const seW2=DW2*0.38, seX2=DX+DW2*0.6;
    const seH2=feH2, seSc2=seH2/(S.numFloors*S.floorHt*1000);
    const seW3=totY*1000*seSc2;
    const seX3=seX2+(seW2-seW3)/2, seY0=y+seH2+4;
    const seSpY=[seX3];S.spansY.slice(0,nBY).forEach(sp=>{seSpY.push(seSpY[seSpY.length-1]+sp*1000*seSc2);});

    F(7,'bold',0,0,80);Txt('SIDE ELEVATION ('+ftin(totY)+' x '+ftin(S.numFloors*S.floorHt)+')',seX3,y-1);
    LC(0,0,0);LW(1.2);Line(seX3-15,seY0,seX3+seW3+15,seY0);
    LC(100,80,40);LW(0.3);for(let hx=seX3-14;hx<seX3+seW3+14;hx+=5)Line(hx,seY0+0.5,hx-4,seY0+5);

    seSpY.forEach((gx,i)=>{
      LC(160,160,210);LW(0.15);doc.setLineDashPattern([3,2],0);Line(gx,seY0+2,gx,seY0-seH2-8);doc.setLineDashPattern([],0);
      LC(0,0,0);LW(0.4);doc.circle(gx,seY0+8,2.5,'D');
      F(6.5,'bold',0,0,0);Txt(String.fromCharCode(65+i),gx,seY0+10,{align:'center'});
    });
    for(let f2=0;f2<=S.numFloors;f2++){
      const gy=seY0-f2*S.floorHt*1000*seSc2;
      LC(160,170,200);LW(0.2);doc.setLineDashPattern([5,3],0);Line(seX3-5,gy,seX3+seW3+5,gy);doc.setLineDashPattern([],0);
    }
    const colWse=(c3?.size||300)*seSc2;
    for(let f2=0;f2<S.numFloors;f2++){
      seSpY.forEach(gx=>{FC(100,100,160);LC(0,0,0);LW(0.4);Rect(gx-colWse/2,seY0-(f2+1)*S.floorHt*1000*seSc2,colWse,S.floorHt*1000*seSc2,'FD');});
      const gy=seY0-f2*S.floorHt*1000*seSc2;
      seSpY.forEach((gx,i)=>{if(i<seSpY.length-1){
        FC(130,70,20);LC(0,0,0);LW(0.3);Rect(gx+colWse/2,gy-S.floorHt*1000*seSc2,seSpY[i+1]-gx-colWse,Math.max(3,(beams[0]?.D||350)*seSc2),'FD');
      }});
      FC(195,200,218);Rect(seX3,gy-S.floorHt*1000*seSc2+Math.max(3,(beams[0]?.D||350)*seSc2),seW3,slHfe*0.8,'F');
    }
    FC(155,160,180);LC(0,0,0);LW(0.3);Rect(seX3,seY0-seH2-parH*0.9,seW3,parH*0.9,'FD');

    S.spansY.slice(0,nBY).forEach((sp,j)=>DH(seSpY[j],seSpY[j+1],seY0+18,ftin(sp),false));
    DH(seX3,seX3+seW3,seY0+26,ftin(totY),false);
    for(let f2=0;f2<S.numFloors;f2++)
      DV(seX3+seW3+10,seY0-f2*S.floorHt*1000*seSc2,seY0-(f2+1)*S.floorHt*1000*seSc2,ftin(S.floorHt),false);

    log('Sheet 11 done',92);

    // ================================================================
    // SHEET 12 — STAIRCASE DETAIL
    // ================================================================
    log('Sheet 12: Staircase...',96);
    doc.addPage();drawPage('ST/SC01/R0','STAIRCASE DETAIL','1:25');
    y=DR_Y+14;
    F(8,'bold',0,0,100);Txt('TYPICAL STAIRCASE DETAIL',DX+DW2/2,y,{align:'center'});
    y+=10;

    const st=stair;
    const nSteps=Math.round(S.floorHt*1000/st.riser)||10;
    const nTread=Math.ceil(nSteps/2);
    const sc25s=0.035; // ~1:25 but adjusted for page
    const stepH=st.riser*sc25s, stepW=st.tread*sc25s;
    const totalW=nTread*stepW, totalH=nTread*stepH;

    F(7,'bold',0,0,80);Txt('CROSS SECTION OF FLIGHT-1',DX+totalW/2+10,y-1);

    const stX=DX+12, stBaseY=y+totalH+12;

    // Grade beam level label
    F(7,'bold',0,0,0);Txt('GRADE BEAM LVL.',stX-12,stBaseY+3,{align:'right'});
    // Base slab
    FC(195,198,215);LC(0,0,0);LW(0.5);Rect(stX-15,stBaseY,totalW+30,7,'FD');
    // Ground line
    LW(0.8);Line(stX-18,stBaseY,stX+totalW+18,stBaseY);

    // Waist slab (filled triangle/parallelogram)
    const wD=st.wD*sc25s;
    FC(215,218,228);LC(0,0,0);LW(0.5);
    // Draw waist as sloped filled shape
    doc.triangle?doc.triangle(stX,stBaseY,stX+totalW,stBaseY-totalH,stX+totalW,stBaseY-totalH+wD,'FD'):null;
    // Fallback: individual steps
    let curX=stX, curY=stBaseY;
    for(let i=0;i<nTread;i++){
      FC(228,230,240);LC(0,0,0);LW(0.5);
      // Riser
      doc.rect(curX,curY-stepH,stepW*0.12,stepH,'FD');
      // Tread
      doc.rect(curX,curY-stepH,stepW,stepH*0.12,'FD');
      // Fill interior
      FC(215,218,228);doc.rect(curX+stepW*0.12,curY-stepH+stepH*0.12,stepW*(1-0.12),stepH*(1-0.12),'F');
      curX+=stepW; curY-=stepH;
    }

    // Main reinforcement line along slope
    LC(0,0,0);LW(1.5);Line(stX+4,stBaseY-4,stX+totalW-4,stBaseY-totalH+4);
    // Distribution bars
    LC(0,0,0);LW(0.5);
    for(let i=1;i<nTread-1;i+=2){
      Rebar(stX+i*stepW+stepW/2,stBaseY-(i+0.5)*stepH+wD/2,1.0);
    }

    // Floor level landing
    F(7,'bold',0,0,0);Txt('FLOOR LEVEL',stX+totalW+2,stBaseY-totalH-3);
    FC(195,198,215);LC(0,0,0);LW(0.5);Rect(stX+totalW,stBaseY-totalH-4,18,wD+4,'FD');

    // Rebar annotation
    F(6.5,'bold',0,0,0);
    // Main bar label — positioned clearly away from steps
    Ld(stX+totalW/2,stBaseY-totalH/2,stX+totalW+22,stBaseY-totalH/2,'Y'+(st.Ast2>300?12:10)+'@'+r0(st.stsp)+'mm MAIN');
    Ld(stX+totalW/2,stBaseY-totalH/2+wD,stX+totalW+22,stBaseY-totalH/2+6,'D8@200mm DIST.');

    // Dimensions
    DH(stX,stX+totalW,stBaseY+12,nTread+'x'+r0(st.tread)+'='+r0(nTread*st.tread)+'mm ('+ftin(nTread*st.tread/1000)+')',false);
    DV(stX-8,stBaseY-totalH,stBaseY,nTread+'x'+r0(st.riser)+'='+r0(nTread*st.riser)+'mm',true);
    DV(stX-14,stBaseY-wD,stBaseY,r0(st.wD)+'mm',true);
    F(6.5,'italic',80,80,80);Txt('SCALE 1:25',stX+totalW/2,stBaseY+22,{align:'center'});

    // Schedule and notes — in a clean table on the right
    const ssX=stX+totalW+40, ssW=DW2-totalW-44;
    LC(0,0,100);LW(0.4);Rect(ssX,y-4,ssW,90,'D');
    FC(220,228,248);Rect(ssX,y-4,ssW,7,'F');
    F(7,'bold',0,0,100);Txt('STAIRCASE SCHEDULE',ssX+ssW/2,y+0.5,{align:'center'});
    let sy5=y+10;F(6.5,'normal',0,0,0);
    [['Riser',r0(st.riser)+'mm ('+Math.round(st.riser/25.4*2)/2+'")'],
     ['Tread',r0(st.tread)+'mm ('+Math.round(st.tread/25.4*2)/2+'")'],
     ['Waist D',r0(st.wD)+'mm'],['Eff. depth d',r0(st.wd)+'mm'],
     ['No. of Steps',nSteps+' per flight'],['Concrete','M'+S.fck+' (IS 456)'],
     ['Steel','Fe'+S.fy+'D'],['Main bars','Y'+(st.Ast2>300?12:10)+'@'+r0(st.stsp)+'mm'],
     ['Dist. bars','D8@200mm'],['Cover','20mm (IS 456)'],
    ].forEach(([l,v],ri)=>{
      if(ri%2===0){FC(245,248,255);Rect(ssX+1,sy5-3.5,ssW-2,5.8,'F');}
      F(6.5,'bold',0,40,100);Txt(l,ssX+3,sy5);F(6.5,'normal',0,0,0);Txt(v,ssX+42,sy5);sy5+=6.2;
    });
    sy5+=4;
    F(7,'bold',0,0,0);Txt('NOTES:',ssX+3,sy5);sy5+=6;
    F(6,'normal',0,0,0);
    ['1. Refer arch. drawing for riser/tread dimensions.',
     '2. Provide 20mm clear cover to main bars.',
     '3. Main bars extend Ld into landing slab.',
     '4. L = Ld or 0.3L whichever is greater, into support.',
     '5. Brick wall below stairs: compacted fill or as site.',
    ].forEach(nt=>{sy5+=TW(nt,ssX+3,sy5,ssW-6)*4.5+1;});
    // Lap sketch
    sy5+=6;F(6.5,'bold',0,0,0);Txt('TYPICAL BAR LAP AT SUPPORT:',ssX+3,sy5);sy5+=7;
    LC(0,0,0);LW(1.0);Line(ssX+8,sy5,ssX+32,sy5);Line(ssX+14,sy5+5,ssX+42,sy5+5);
    LW(0.25);doc.setLineDashPattern([2,1.5],0);Line(ssX+32,sy5,ssX+32,sy5+9);Line(ssX+14,sy5+5,ssX+14,sy5+9);doc.setLineDashPattern([],0);
    DH(ssX+14,ssX+32,sy5+11,'Ld = '+r0(60*slabBarDia)+'mm',false);
    F(6,'italic',80,80,80);Txt('(=60xdia for slabs)',ssX+3,sy5+18);

    log('All done! Saving...',99);
    await new Promise(r=>setTimeout(r,80));

    const fname=s2(S.name||'Structure').replace(/\s+/g,'_').replace(/[^A-Za-z0-9_]/g,'')+'_Construction_Drawings.pdf';
    doc.save(fname);
    setTimeout(()=>{const o=document.getElementById('cpdOv');if(o)o.remove();},3000);
    const ov2=document.getElementById('cpdOv');
    if(ov2)ov2.innerHTML+=`<div style="font-size:17px;color:#34d399;font-weight:900;margin-top:14px">12 Sheets Downloaded!</div><div style="font-size:10px;color:#64748b;margin-top:4px">${fname}</div>`;

  }catch(err){
    console.error('PDF Error:',err);
    const ov2=document.getElementById('cpdOv');
    if(ov2)ov2.innerHTML+=`<div style="color:#f87171;margin-top:12px;font-size:12px">Error: ${err.message}</div>`;
    setTimeout(()=>{const o=document.getElementById('cpdOv');if(o)o.remove();},5000);
  }
}


// == 22_saveload.js ==

// ================================================================
// MODULE: 22_saveload — Project Save / Load via localStorage
// ================================================================

const SAVE_KEY = 'structlearn_project_v1';

function saveProject() {
  try {
    const data = JSON.stringify({ S, ts: Date.now(), ver: 1 });
    localStorage.setItem(SAVE_KEY, data);
    showSaveToast('Project saved!', '#34d399');
  } catch(e) {
    showSaveToast('Save failed: ' + e.message, '#f87171');
  }
}

function loadProject() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) { showSaveToast('No saved project found.', '#fbbf24'); return; }
    const data = JSON.parse(raw);
    if (!data.S) { showSaveToast('Invalid save data.', '#f87171'); return; }
    // Restore all S fields
    Object.assign(S, data.S);
    // Refresh current page inputs
    go(PAGE || 1);
    const age = Math.round((Date.now() - data.ts) / 60000);
    showSaveToast('Loaded! (saved ' + (age < 60 ? age + ' min' : Math.round(age/60) + ' hr') + ' ago)', '#34d399');
  } catch(e) {
    showSaveToast('Load failed: ' + e.message, '#f87171');
  }
}

function exportProject() {
  try {
    const data = JSON.stringify({ S, ts: Date.now(), ver: 1 }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (S.name || 'project').replace(/\s+/g, '_') + '_structlearn.json';
    a.click();
    URL.revokeObjectURL(url);
    showSaveToast('Project exported as JSON!', '#34d399');
  } catch(e) {
    showSaveToast('Export failed: ' + e.message, '#f87171');
  }
}

function importProject() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json';
  inp.onchange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.S) throw new Error('Not a StructLearn project file');
        Object.assign(S, data.S);
        go(PAGE || 1);
        showSaveToast('Project imported: ' + (data.S.name || 'unnamed'), '#34d399');
      } catch(err) { showSaveToast('Import failed: ' + err.message, '#f87171'); }
    };
    reader.readAsText(file);
  };
  inp.click();
}

function showSaveToast(msg, color) {
  const old = document.getElementById('saveToast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'saveToast';
  t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#0f172a;border:1px solid '+color+';color:'+color+';padding:10px 18px;border-radius:8px;font-size:12px;font-weight:700;z-index:9999;font-family:monospace;box-shadow:0 4px 20px rgba(0,0,0,0.4);transition:opacity 0.4s';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 2500);
}

// Auto-save to localStorage every time S changes (debounced)
let _autoSaveTimer = null;
const _origSv = typeof sv === 'function' ? sv : null;
function svWithAutoSave(id, v) {
  if (_origSv) _origSv(id, v);
  else { S[id] = v; }
  clearTimeout(_autoSaveTimer);
  _autoSaveTimer = setTimeout(() => {
    try { localStorage.setItem(SAVE_KEY + '_auto', JSON.stringify({ S, ts: Date.now() })); } catch(e) {}
  }, 1500);
}

// Check for auto-save on startup and offer restore
function checkAutoRestore() {
  try {
    const auto = localStorage.getItem(SAVE_KEY + '_auto');
    const manual = localStorage.getItem(SAVE_KEY);
    const raw = manual || auto;
    if (!raw) return;
    const data = JSON.parse(raw);
    const age = Math.round((Date.now() - data.ts) / 60000);
    if (age > 60 * 24 * 7) return; // ignore if older than 1 week
    // Show restore banner
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0f172a;border:1px solid #1e40af;border-radius:10px;padding:12px 20px;z-index:9998;font-size:12px;color:#93c5fd;font-family:monospace;display:flex;gap:12px;align-items:center;box-shadow:0 4px 24px rgba(0,0,0,0.5)';
    banner.innerHTML = '<span>💾 Saved project found (' + (age < 60 ? age + 'm' : Math.round(age/60) + 'h') + ' ago): <strong>' + (data.S&&data.S.name||'unnamed') + '</strong></span>'
      + '<button onclick="loadProject();document.getElementById(\'restoreBanner\').remove()" style="padding:5px 12px;background:#1d4ed8;border:none;border-radius:5px;color:#fff;cursor:pointer;font-size:11px">Restore</button>'
      + '<button onclick="document.getElementById(\'restoreBanner\').remove()" style="padding:5px 10px;background:transparent;border:1px solid #64748b;border-radius:5px;color:#64748b;cursor:pointer;font-size:11px">Dismiss</button>';
    banner.id = 'rBnr';
    document.body.appendChild(banner);
    setTimeout(() => { if(banner.parentElement) banner.remove(); }, 8000);
  } catch(e) {}
}

// Run after page loads
setTimeout(checkAutoRestore, 1000);


// == 22_snapshot.js ==

// ================================================================
// MODULE: 22_snapshot — Design Snapshot Comparison
// Save a "before" snapshot, make changes, compare side-by-side
// ================================================================

let _snapshots = [];

function takeSnapshot(label) {
  if (!RES) { alert('Run analysis first to take a snapshot.'); return; }
  const snap = {
    label: label || ('Snapshot ' + (_snapshots.length + 1)),
    ts: new Date().toLocaleTimeString('en-IN'),
    S: JSON.parse(JSON.stringify(S)),
    summary: {
      totalSteel: RES.beams.reduce((a,b)=>a+(b.Am||0),0),
      beamCount: RES.beams.length,
      maxDefl: Math.max(...RES.beams.map(b=>b.dfl||0)),
      allSafe: RES.beams.every(b=>b.deflOK&&b.shearSafe) &&
               RES.cols.filter(c=>c.floor===1).every(c=>c.safe) &&
               RES.ftgs.every(f=>f.punch_ok&&f.ow_ok),
      colSize: RES.cols[0]&&RES.cols[0].size||0,
      slabD: RES.slab&&RES.slab.slabD||0,
      beamD: RES.beams[0]&&RES.beams[0].D||0,
      beamB: RES.beams[0]&&RES.beams[0].b||0,
      fck: S.fck, fy: S.fy,
      numFloors: S.numFloors, floorHt: S.floorHt,
    }
  };
  _snapshots.push(snap);
  showSaveToast('Snapshot saved: ' + snap.label, '#38bdf8');
  // Refresh snapshot panel if open
  const panel = document.getElementById('snapshotPanel');
  if (panel) panel.innerHTML = renderSnapshotPanel();
}

function renderSnapshotPanel() {
  if (_snapshots.length === 0) return '<div style="color:var(--txt3);font-size:12px;padding:8px">No snapshots yet. Run analysis and click "Take Snapshot".</div>';
  
  const cols = _snapshots.slice(-3); // show last 3
  const fields = [
    ['Concrete Grade','fck','M',''],
    ['Steel Grade','fy','Fe',''],
    ['Floors','numFloors','G+',''],
    ['Floor Height','floorHt','','m'],
    ['Slab Thickness','slabD','','mm'],
    ['Beam Size','beamD','','mm D'],
    ['Column Size','colSize','','mm sq'],
    ['Max Deflection','maxDefl','','mm'],
    ['Status','allSafe','',''],
  ];
  
  let html = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px">';
  // Header
  html += '<tr><th style="padding:6px 8px;background:var(--bg1);border:1px solid var(--b1);text-align:left;color:var(--txt3)">Parameter</th>';
  cols.forEach(s => {
    const age = s.ts;
    html += `<th style="padding:6px 8px;background:var(--bg1);border:1px solid var(--b1);text-align:center;color:var(--blue)">${s.label}<br><span style="font-size:9px;color:var(--txt3);font-weight:normal">${age}</span></th>`;
  });
  html += '</tr>';
  
  // Data rows
  fields.forEach(([label, key, prefix, suffix]) => {
    html += `<tr><td style="padding:5px 8px;border:1px solid var(--b1);color:var(--txt3);font-weight:bold">${label}</td>`;
    const vals = cols.map(s => s.summary[key]);
    cols.forEach((s, i) => {
      const v = s.summary[key];
      let display = '';
      let style = 'text-align:center;border:1px solid var(--b1);padding:5px 8px;';
      
      if (key === 'allSafe') {
        display = v ? '<span style="color:#34d399;font-weight:bold">✓ SAFE</span>' : '<span style="color:#f87171;font-weight:bold">✗ FAIL</span>';
      } else if (key === 'maxDefl') {
        display = parseFloat(v).toFixed(1) + suffix;
        // Highlight worst
        const maxVal = Math.max(...vals.map(x=>parseFloat(x)||0));
        if (parseFloat(v) === maxVal && vals.length > 1) style += 'background:rgba(251,191,36,0.15);color:#fbbf24;';
      } else {
        display = prefix + v + suffix;
        // Highlight differences
        if (vals.length > 1 && vals.some(x => x !== vals[0])) {
          const numVals = vals.map(x=>parseFloat(x)||0);
          const myNum = parseFloat(v)||0;
          if (myNum === Math.max(...numVals)) style += 'background:rgba(59,130,246,0.1);color:#60a5fa;font-weight:bold;';
          if (myNum === Math.min(...numVals)) style += 'background:rgba(16,185,129,0.1);color:#34d399;font-weight:bold;';
        }
      }
      html += `<td style="${style}">${display}</td>`;
    });
    html += '</tr>';
  });
  
  html += '</table></div>';
  
  // Clear button
  html += '<div style="margin-top:8px;display:flex;gap:8px">';
  const clearFn = "document.getElementById('snapshotPanel').innerHTML=renderSnapshotPanel()";
  html += '<button class="btn se" onclick="_snapshots=[];' + clearFn + '" style="font-size:10px;padding:4px 10px">Clear All</button>';
  html += '<span style="font-size:10px;color:var(--txt3);align-self:center">Tip: Blue = highest value, green = lowest value across snapshots</span>';
  html += '</div>';
  
  return html;
}

function secSnapshot() {
  return `
<div class="card" style="border-color:rgba(56,189,248,0.3)">
  <div class="ct" style="color:#38bdf8">📸 Design Snapshot Comparison</div>
  <div style="font-size:11px;color:var(--txt3);margin-bottom:12px">
    Take snapshots of your current design at different stages. Compare parameters and results side-by-side to understand the effect of your design decisions.
  </div>
  <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
    <button class="btn" onclick="if(requirePro('Snapshot')) takeSnapshot()" style="background:linear-gradient(135deg,#1e40af,#1d4ed8);border:1px solid #3b82f6">
      📸 Take Snapshot ${RES?'':'(run analysis first)'}
     <span style="font-size:9px;background:#f59e0b;color:#1a1208;padding:1px 5px;border-radius:3px;font-weight:700">PRO</span></button>
    <button class="btn se" onclick="
      if(requirePro('Snapshot')){
        const lbl=prompt('Snapshot label:','Design v'+(_snapshots.length+1));
        if(lbl)takeSnapshot(lbl);
      }
    " style="font-size:11px">Custom Label</button>
  </div>
  <div id="snapshotPanel">${renderSnapshotPanel()}</div>
  <div style="margin-top:12px;padding:10px;background:var(--bg1);border-radius:8px;font-size:11px;color:var(--txt3);line-height:1.8">
    <strong style="color:var(--txt2)">How to use:</strong><br>
    1. Run analysis → take a snapshot (Snapshot 1)<br>
    2. Change something (e.g. increase fck from M25 to M30)<br>
    3. Run analysis again → take another snapshot (Snapshot 2)<br>
    4. See the comparison above — which design is safer? Which is cheaper?
  </div>
</div>`;
}


// == 23_member_schedule.js ==

// ================================================================
// MODULE: 23_member_schedule — Member Size & Reinforcement Schedule
// One page showing every member: calculated size + recommended size
// + bar count + dia for easy site reference
// ================================================================

function secMemberSchedule(){
  if(!RES) return '<div class="card"><div class="ct">Member Schedule</div><div class="cd">Run analysis first.</div></div>';

  const allBeams  = RES.allBeams || RES.beams || [];
  const allCols   = RES.allCols  || RES.cols  || [];
  const allFtgs   = RES.allFtgs  || RES.ftgs  || [];
  const panels    = RES.allSlabPanels || [];

  // ── HELPER: round size UP to practical increment ──────────────
  // Beams: round D to nearest 25, b to nearest 25, min 200
  function practicalBeam(D,b){
    const pD=Math.ceil(D/25)*25;
    const pB=Math.max(200,Math.ceil(b/25)*25);
    // Recommendation: if over-designed by >20%, suggest smaller
    const ecoD=Math.max(200,Math.ceil(D*0.85/25)*25);
    const ecoB=Math.max(200,Math.ceil(b*0.85/25)*25);
    return{pD,pB,ecoD,ecoB};
  }
  // Columns: round to nearest 25, min 300
  function practicalCol(size){
    return Math.max(300,Math.ceil(size/25)*25);
  }
  // Footings: round to nearest 100mm for plan, 25 for depth
  function practicalFtg(Bf,D){
    const pBf=Math.ceil(Bf*10)/10; // round to 100mm
    const pD=Math.ceil(D/25)*25;
    return{pBf,pD};
  }

  // ── GROUP beams by floor ──────────────────────────────────────
  const beamFloors=[...new Set(allBeams.map(b=>b.floor))].sort((a,b2)=>a-b2);
  // Ground floor beams are the critical ones for schedule
  const scheduleBeams = allBeams.filter(b=>b.floor===1);

  // ── UNIQUE COLUMN DESIGNS (by nodeId, floor 1) ────────────────
  const scheduleCols = allCols.filter(c=>c.floor===1).sort((a,b2)=>{
    if(a.row!==b2.row) return a.row-b2.row;
    return a.col-b2.col;
  });

  // ── SLAB PANELS (typical floor) ───────────────────────────────
  const schedPanels = panels.filter(p=>p.floor==='Typical');

  // ── STEEL WEIGHT ESTIMATE ────────────────────────────────────
  function barWt(dia,len,n){ return Math.PI/4*(dia/1000)**2*len*n*7850; }

  return`
<div class="card" style="padding:0">
  <div style="padding:12px 16px;border-bottom:1px solid var(--b1)">
    <div class="ct" style="margin:0 0 4px">📋 Member Schedule — Calculated vs Recommended Sizes</div>
    <div class="cd" style="margin:0;font-size:10px">
      All members at a glance: calculated size from IS 456 design, practical recommended size for construction,
      and reinforcement details. Use this as a site reference table.
    </div>
  </div>

  <div style="padding:12px 16px;overflow-x:auto">

  <!-- ── BEAM SCHEDULE ──────────────────────────────────────── -->
  <div style="margin-bottom:20px">
    <div style="font-size:12px;font-weight:800;color:var(--orange);margin-bottom:4px">
      🔶 BEAM SCHEDULE — Ground Floor (Critical — max load)
    </div>
    <div style="font-size:9px;color:var(--txt3);margin-bottom:8px">
      Upper floors: same section size, less reinforcement. See Full Report → Beams tab for per-floor detail.
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:10px;min-width:900px">
      <thead>
        <tr style="background:rgba(249,115,22,0.15)">
          <th style="padding:6px 8px;border:1px solid var(--b1);text-align:left;color:var(--orange)">Member</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:var(--orange)">Dir</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:var(--orange)">Span m</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:var(--orange)">Calc D×b mm</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#34d399">Recommended</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:var(--orange)">End Cond.</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:var(--orange)">wu kN/m</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:var(--orange)">Mmax kN.m</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:var(--orange)">Bot. Bars</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:var(--orange)">Top Bars</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:var(--orange)">Stirrups</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:var(--orange)">δ/δlim</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:var(--orange)">Status</th>
        </tr>
      </thead>
      <tbody>
        ${scheduleBeams.map((b,i)=>{
          const ok=b.deflOK&&b.shearSafe;
          const{pD,pB}=practicalBeam(b.D,b.b);
          const util=Math.min(1.0,b.deflUtil||0);
          const utilColor=util>0.85?'#fbbf24':util>0.5?'#34d399':'#38bdf8';
          // Recommended size logic:
          // FAIL → size up to pass (deflection: D prop cube root; shear: increase b)
          // OVER-DESIGNED → size down to save material (if deflUtil<0.4 AND momUtil<0.4)
          // OK → keep as-is
          let recD=b.D, recB=b.b, recNote='', recColor='#34d399';
          if(!b.deflOK){
            recD=Math.ceil(b.D*Math.pow(b.dfl/b.dall,1/3)/25+1)*25;
            recNote='↑ Defl fail: increase D';
            recColor='#f87171';
          } else if(!b.shearSafe){
            recB=Math.max(b.b+50, Math.ceil(b.b*1.25/25)*25);
            recNote='↑ Shear fail: increase b';
            recColor='#f87171';
          } else if((b.deflUtil||1)<0.4 && (b.momUtil||1)<0.4 && b.D>250){
            recD=Math.max(200, Math.ceil(b.D*0.85/25)*25);
            recNote='↓ Over-designed: can reduce';
            recColor='#60a5fa';
          } else {
            recNote='OK as designed';
          }
          const endShort={'Both ends continuous':'Both fixed','One end continuous':'One pinned','Simply supported':'SS','cantilever':'Cantilever'}[b.endCond]||b.endCond||'auto';
          return`<tr style="background:${i%2===0?'transparent':'rgba(255,255,255,0.02)'}">
            <td style="padding:5px 8px;border:1px solid var(--b1);font-weight:600;color:var(--orange);white-space:nowrap">${b.label}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center">${b.dir}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r2(b.L)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;font-weight:700">${b.D}×${b.b}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;color:${recColor};font-weight:700">${recD}×${recB}<br><span style="font-size:8px;font-weight:400;color:var(--txt3)">${recNote}</span></td>
            <td style="padding:5px 8px;border:1px solid var(--b1);font-size:9px">${endShort}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r2(b.wu)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r2(b.Mmax)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;font-weight:600">${b.nm}-D20</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center">${b.ns}-D20</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;font-size:9px">D8@${b.svd}(Lo)<br>D8@${b.sv}(mid)</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">
              <div style="display:inline-flex;align-items:center;gap:4px">
                <span style="color:${utilColor}">${r2(b.dfl)}/${r2(b.dall)}</span>
              </div>
            </td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;font-weight:700;color:${ok?'#34d399':'#f87171'}">${ok?'✓':'✗'}</td>
          </tr>`;
        }).join('')}
        <tr style="border-top:2px solid var(--b1)"><td colspan="13" style="padding:6px 8px;font-size:9px;color:var(--txt3)">
          ${scheduleBeams.filter(b=>{
            const clearW=b.b-2*S.coverBeam-2*8;
            const minSpacing=Math.max(20,20); // 20mm or bar dia
            const maxBars=Math.floor((clearW+minSpacing)/(20+minSpacing));
            return b.nm>maxBars;
          }).length>0?'<span style="color:#f87171;font-weight:700">⚠ Some beams have too many bars for the width — consider 2 layers or increase b.</span>':'<span style="color:#34d399">✔ All bar arrangements are practically buildable in single layer.</span>'}
        </td></tr>
      </tbody>
    </table>
    ${beamFloors.length>1?`
    <div style="margin-top:6px;padding:8px;background:rgba(249,115,22,0.06);border-radius:6px;font-size:10px;color:var(--txt3)">
      <strong style="color:var(--orange)">Other floors:</strong>
      ${beamFloors.filter(f=>f!==1).map(f=>{
        const fb=allBeams.filter(b=>b.floor===f);
        const flbl=f===S.numFloors?'Roof':`F${f}`;
        const maxBars=fb.length>0?Math.max(...fb.map(b=>b.nm)):0;
        const minBars=fb.length>0?Math.min(...fb.map(b=>b.nm)):0;
        return `${flbl}: ${fb.length} beams, ${minBars}–${maxBars} D20 bot. bars (same section D×b)`;
      }).join(' | ')}
    </div>`:''}
  </div>

  <!-- ── COLUMN SCHEDULE ─────────────────────────────────────── -->
  <div style="margin-bottom:20px">
    <div style="font-size:12px;font-weight:800;color:#a78bfa;margin-bottom:4px">
      🏛 COLUMN SCHEDULE — Ground Floor (Max Load)
    </div>
    <div style="font-size:9px;color:var(--txt3);margin-bottom:8px">
      Upper floor columns carry less load → smaller size possible. 300mm min per IS 13920.
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:10px;min-width:850px">
      <thead>
        <tr style="background:rgba(167,139,250,0.15)">
          <th style="padding:6px 8px;border:1px solid var(--b1);text-align:left;color:#a78bfa">Member</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#a78bfa">Position</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#a78bfa">Trib m²</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#a78bfa">Ps kN</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#a78bfa">Pu kN</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#a78bfa">Calc Size</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#34d399">Recommended</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#a78bfa">Long. Bars</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#a78bfa">pt %</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#a78bfa">Gen. Ties</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#a78bfa">Conf. Ties</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#a78bfa">Lo mm</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#a78bfa">Pcap kN</th>
          <th style="padding:6px 8px;border:1px solid var(--b1);color:#a78bfa">Status</th>
        </tr>
      </thead>
      <tbody>
        ${scheduleCols.map((c,i)=>{
          const ok=c.safe;
          const pSize=practicalCol(c.size);
          const posType=c.corner?'Corner':c.edge?'Edge':'Interior';
          // Floor-by-floor sizes for this node
          const nodeFloors=allCols.filter(x=>x.nodeId===c.nodeId).sort((a,b2)=>a.floor-b2.floor);
          const sizeRange=[...new Set(nodeFloors.map(x=>x.size))];
          const sizeLabel=sizeRange.length>1?`${Math.max(...sizeRange)}→${Math.min(...sizeRange)}`:`${c.size}`;
          // Recommended column size:
          // FAIL → size up until Pcap >= Pu
          // OVER-DESIGNED (Pu/Pcap < 0.5 and size > 300) → suggest smaller
          // OK → keep as-is
          let recSize=c.size, recColNote='', recColColor='#34d399';
          if(!ok){
            // Iterate up by 25mm until capacity exceeds demand
            recSize=c.size;
            for(let sz=c.size+25; sz<=800; sz+=25){
              const Ag2=sz*sz;
              const Af2=Math.max(0.008*Ag2,(c.Pu*1000-0.4*S.fck*Ag2)/(0.67*S.fy-0.4*S.fck));
              const dB2=c.Pu>800?20:16;
              const nb2=Math.max(4,Math.ceil(Af2/(Math.PI*dB2*dB2/4)));
              const Ap2=nb2*(Math.PI*dB2*dB2/4);
              const Pcap2=(0.4*S.fck*(Ag2-Ap2)+0.67*S.fy*Ap2)/1000;
              if(Pcap2>=c.Pu){ recSize=sz; break; }
            }
            recColNote='↑ Fails: increase to '+recSize;
            recColColor='#f87171';
          } else if(c.Pcap>0 && c.Pu/c.Pcap<0.5 && c.size>300){
            recSize=Math.max(300,Math.ceil(c.size*0.85/25)*25);
            recColNote='↓ Over-designed: can reduce';
            recColColor='#60a5fa';
          } else {
            recColNote='OK as designed';
          }
          return`<tr style="background:${i%2===0?'transparent':'rgba(255,255,255,0.02)'}">
            <td style="padding:5px 8px;border:1px solid var(--b1);font-weight:600;color:#a78bfa;white-space:nowrap">${c.label||c.baseLabel}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);font-size:9px">${posType}<br><span style="color:var(--txt3)">R${String.fromCharCode(65+c.row)}C${c.col+1}</span></td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r2(c.ta)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r0(c.Ps)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r0(c.Pu)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;font-weight:700">${c.size}×${c.size}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;color:${recColColor};font-weight:700">${recSize}×${recSize}<br><span style="font-size:8px;font-weight:400;color:var(--txt3)">${recColNote}</span></td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;font-weight:600">${c.nb}-D${c.dB}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r2(c.pt)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center">D8@${c.ts}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center">D8@${c.tsc}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r0(c.Lo)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r0(c.Pcap)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;font-weight:700;color:${ok?'#34d399':'#f87171'}">${ok?'✓':'✗'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <div style="margin-top:6px;font-size:9px;color:var(--txt3)">
      All ties: 135° hooks mandatory (IS 13920). Lo = confinement zone from each end of column.
    </div>
  </div>

  <!-- ── SLAB SCHEDULE ───────────────────────────────────────── -->
  <div style="margin-bottom:20px">
    <div style="font-size:12px;font-weight:800;color:var(--cyan);margin-bottom:4px">
      🔲 SLAB PANEL SCHEDULE — Typical Floor
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:10px;min-width:900px">
      <thead>
        <tr style="background:rgba(56,189,248,0.12)">
          ${['Panel','lx m','ly m','Ratio','Case','D mm','d mm','wu kN/m²','Mx kN.m','My kN.m',
             'Bot. Short','Bot. Long','Top Short','Top Long','l/d','Status']
             .map(h=>`<th style="padding:6px 8px;border:1px solid var(--b1);color:var(--cyan);white-space:nowrap">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${schedPanels.length>0?schedPanels.map((p,i)=>{
          const ok=p.ok;
          return`<tr style="background:${i%2===0?'transparent':'rgba(255,255,255,0.02)'}">
            <td style="padding:5px 8px;border:1px solid var(--b1);font-weight:600;color:var(--blue)">${p.bayLabel}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r2(p.lx)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r2(p.ly)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r2(p.ratio)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center">Case ${p.caseN}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;font-weight:700">${p.D}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${p.d}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r2(p.wu)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r2(p.Mx)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r2(p.My)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center">D10@${p.spx}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center">D8@${p.spy}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center">D8@${p.spx_n}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center">D8@${p.spy_n}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right;color:${p.ld_ok?'inherit':'#f87171'}">${r2(p.ld)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;font-weight:700;color:${ok?'#34d399':'#f87171'}">${ok?'✓':'✗'}</td>
          </tr>`;
        }).join(''):`<tr><td colspan="16" style="padding:12px;text-align:center;color:var(--txt3)">
          No slab panels — mark bays as 'Slab' in the Plan Editor to design them.
        </td></tr>`}
      </tbody>
    </table>
    <div style="margin-top:6px;font-size:9px;color:var(--txt3)">
      Uniform construction D = ${schedPanels.length>0?Math.max(...schedPanels.map(p=>p.D)):S.slabThk}mm (max across all panels). Top bars extend 0.3×lx from supports.
    </div>
  </div>

  <!-- ── FOOTING SCHEDULE ────────────────────────────────────── -->
  <div style="margin-bottom:20px">
    <div style="font-size:12px;font-weight:800;color:#fbbf24;margin-bottom:4px">
      🏗 FOOTING SCHEDULE — Isolated Square Footings
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:10px;min-width:850px">
      <thead>
        <tr style="background:rgba(251,191,36,0.12)">
          ${['Footing','Col. Ref','Ps kN','Plan Bf m','Depth D mm','d mm','qu kN/m²','Mu kN.m','Calc Steel','Spacing','Punch','OW Shear','Status']
             .map(h=>`<th style="padding:6px 8px;border:1px solid var(--b1);color:#fbbf24;white-space:nowrap">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${allFtgs.map((f,i)=>{
          const ok=f.punch_ok&&f.ow_ok&&f.Ld_ok;
          return`<tr style="background:${i%2===0?'transparent':'rgba(255,255,255,0.02)'}">
            <td style="padding:5px 8px;border:1px solid var(--b1);font-weight:600;color:#fbbf24;white-space:nowrap">${f.label||'FTG-'+i}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1)">${f.colLabel||f.baseLabel||''}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r0(f.Ps)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;font-weight:700">${r2(f.Bf)}×${r2(f.Bf)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;font-weight:700">${r0(f.D)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r0(f.d)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r2(f.qu)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:right">${r2(f.Mu)}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center">D${f.dBf}@${f.spf}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center">${f.spf}mm EW</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;color:${f.punch_ok?'#34d399':'#f87171'}">${f.punch_ok?'OK':'FAIL'}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;color:${f.ow_ok?'#34d399':'#f87171'}">${f.ow_ok?'OK':'FAIL'}</td>
            <td style="padding:5px 8px;border:1px solid var(--b1);text-align:center;font-weight:700;color:${ok?'#34d399':'#f87171'}">${ok?'✓':'✗'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <div style="margin-top:6px;font-size:9px;color:var(--txt3)">
      All footings on PCC 1:4:8 (75mm). Cover to bottom = 75mm. SBC = ${S.soilBearing} kN/m² at ${S.ftgDepth}m depth.
    </div>
  </div>

  <!-- ── QUICK REFERENCE BOX ────────────────────────────────── -->
  <div style="padding:12px;background:rgba(0,40,100,0.3);border:1px solid #1e3a8a;border-radius:8px">
    <div style="font-size:11px;font-weight:700;color:#38bdf8;margin-bottom:8px">📌 Quick Site Reference</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;font-size:10px">
      <div style="padding:8px;background:#0f172a;border-radius:6px">
        <div style="color:#f59e0b;font-weight:700;margin-bottom:4px">CONCRETE</div>
        M${S.fck} (IS 456:2000) | w/c ≤ 0.45 | Min cement 300 kg/m³
      </div>
      <div style="padding:8px;background:#0f172a;border-radius:6px">
        <div style="color:#a78bfa;font-weight:700;margin-bottom:4px">STEEL</div>
        Fe${S.fy}D TMT (IS 1786) | All stirrups: 135° hooks (IS 13920)
      </div>
      <div style="padding:8px;background:#0f172a;border-radius:6px">
        <div style="color:#38bdf8;font-weight:700;margin-bottom:4px">COVER</div>
        Slab: ${S.coverSlab}mm | Beam: ${S.coverBeam}mm | Column: ${S.coverCol}mm | Footing: ${S.coverFtg}mm
      </div>
      <div style="padding:8px;background:#0f172a;border-radius:6px">
        <div style="color:#34d399;font-weight:700;margin-bottom:4px">LAP LENGTH</div>
        Beam/Slab: 60D | Column: 48D | Min col lap D16 = ${48*16}mm
      </div>
      <div style="padding:8px;background:#0f172a;border-radius:6px">
        <div style="color:#f87171;font-weight:700;margin-bottom:4px">SEISMIC ZONE</div>
        Zone ${S.zone} | Soil Type ${S.soilType} | IS 1893:2016 | IS 13920:2016
      </div>
      <div style="padding:8px;background:#0f172a;border-radius:6px">
        <div style="color:#fbbf24;font-weight:700;margin-bottom:4px">FOUNDATION</div>
        SBC = ${S.soilBearing} kN/m² | Depth = ${S.ftgDepth}m | Verify with soil test
      </div>
    </div>
  </div>

  </div><!-- end padding div -->
</div>`;
}


// == 13_pages_adv.js ==

// ================================================================
// MODULE: 13_pages_adv
// Advanced topic pages
// ================================================================



function p9(){return RES?secPMInteraction():'<div class="card"><div class="ct vi">P-M Interaction</div><div class="cd">Run full analysis first to see the P-M interaction diagram for your columns.</div><button class="btn" onclick="go(6)">Go to Run Analysis -></button></div>';}

function p10(){return RES?secContinuousBeam():'<div class="card"><div class="ct or">Continuous Beam Analysis</div><div class="cd">Run full analysis first.</div><button class="btn" onclick="go(6)">Go to Run Analysis -></button></div>';}

function p11(){return RES?secSeismicDrift():'<div class="card"><div class="ct tl">Seismic Drift Check</div><div class="cd">Run full analysis first.</div><button class="btn" onclick="go(6)">Go to Run Analysis -></button></div>';}

function p12(){return RES?secSlabEdgeConditions():'<div class="card"><div class="ct">Slab Edge Conditions</div><div class="cd">Run full analysis first.</div><button class="btn" onclick="go(6)">Go to Run Analysis -></button></div>';}

function p13(){return secRetainingWall();}

function p14(){return RES?secFireResistance():'<div class="card"><div class="ct" style="color:var(--red)">Fire Resistance</div><div class="cd">Run full analysis first.</div><button class="btn" onclick="go(6)">Go to Run Analysis -></button></div>';}

function p15(){return RES?secXSections():'<div class="card"><div class="ct bl">Reinforcement Drawings</div><div class="cd">Run analysis first to generate cross-section drawings.</div><button class="btn" onclick="go(6)">Run Analysis</button></div>';}

// == 00_init.js ==

// ================================================================
// MODULE: 00_init
// Initialization — runs last after all modules are loaded
// ================================================================

function p16(){return secJointTypes();}
function p17(){return RES?secImprovements():'<div class="card"><div class="ct">Improvement Suggestions</div><div class="cd">Run analysis first.</div><button class="btn" onclick="go(6)">Run Analysis</button></div>';}
function p18(){return RES?secDesignSummary():'<div class="card"><div class="ct">Design Summary</div><div class="cd">Run analysis first.</div><button class="btn" onclick="go(6)">Run Analysis</button></div>';}
function p19(){return secParametric();}
function p20(){return RES?secDiscussion():'<div class="card"><div class="ct">Analysis Discussion</div><div class="cd">Run analysis first.</div><button class="btn" onclick="go(6)">Run Analysis</button></div>';}

var pages=[p0,p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20];
go(0);
setTimeout(()=>renderGridPrev&&renderGridPrev(),200);
setInterval(()=>{try{saveToParent('draft');}catch(e){}},30000);

// Auto-draw ref grid on page 8
window.p8orig=p8;
document.addEventListener('click',e=>{if(e.target.closest('[onclick*="go(8)"]'))setTimeout(drawRefGrid,100);});


// ══════════════════════════════════════════════════════
// QUIZ + CERTIFICATE SYSTEM
// ══════════════════════════════════════════════════════

/* 
  RUN THIS IN SUPABASE SQL EDITOR:
  
  create table public.certificates (
    id uuid default gen_random_uuid() primary key,
    cert_id text unique not null,
    user_id uuid references auth.users,
    student_name text,
    level text,
    issued_date timestamp default now(),
    is_valid boolean default true
  );
  alter table public.certificates enable row level security;
  create policy "Anyone can verify certificates"
    on public.certificates for select using (true);
  create policy "Users insert own certificates"
    on public.certificates for insert with check (auth.uid() = user_id);
*/


// Question Bank
// ── QUESTION BANK ─────────────────────────────────────────────
// 180 questions across 3 levels
// Each question: {q, opts:[A,B,C,D], ans: index(0-3), topic}

const QB = {

// ══════════════════════════════════════════════════════════════
// LEVEL 1 — FOUNDATION (40 questions)
// ══════════════════════════════════════════════════════════════
L1: [
// IS 456 BASICS (8)
{q:"What does IS 456 govern?",opts:["Steel structures","Plain and reinforced concrete","Foundation design","Seismic design"],ans:1,topic:"IS 456"},
{q:"What is the full form of RCC?",opts:["Reinforced Cement Concrete","Rigid Cement Construction","Reduced Concrete Cover","Reinforced Cold Construction"],ans:0,topic:"IS 456"},
{q:"Which grade of concrete is minimum recommended for seismic zones?",opts:["M15","M20","M25","M30"],ans:2,topic:"IS 456"},
{q:"What does fck represent in IS 456?",opts:["Characteristic compressive strength of concrete","Steel yield strength","Shear strength","Bond strength"],ans:0,topic:"IS 456"},
{q:"What does fy represent?",opts:["Concrete strength","Yield strength of steel","Factored load","Moment of inertia"],ans:1,topic:"IS 456"},
{q:"Fe 500D steel — what does D stand for?",opts:["Dense","Ductile","Deformed","Diameter"],ans:1,topic:"IS 456"},
{q:"What is the load factor for dead load in IS 456 limit state?",opts:["1.0","1.2","1.5","2.0"],ans:2,topic:"IS 456"},
{q:"Which method does IS 456 use for structural design?",opts:["Working stress method only","Limit state method","Elastic method","Plastic method"],ans:1,topic:"IS 456"},

// LOADS — IS 875 (8)
{q:"What is the standard live load for residential floors per IS 875?",opts:["1.5 kN/m²","2.0 kN/m²","3.0 kN/m²","4.0 kN/m²"],ans:1,topic:"IS 875"},
{q:"What is the live load for roofs (accessible) per IS 875?",opts:["0.75 kN/m²","1.5 kN/m²","2.0 kN/m²","3.0 kN/m²"],ans:1,topic:"IS 875"},
{q:"Which IS code covers dead loads?",opts:["IS 456","IS 875 Part 1","IS 875 Part 2","IS 1893"],ans:1,topic:"IS 875"},
{q:"Which IS code covers imposed (live) loads?",opts:["IS 456","IS 875 Part 1","IS 875 Part 2","IS 1893"],ans:2,topic:"IS 875"},
{q:"What is the unit weight of normal concrete?",opts:["20 kN/m³","23 kN/m³","25 kN/m³","28 kN/m³"],ans:2,topic:"IS 875"},
{q:"What is the unit weight of brick masonry?",opts:["15 kN/m³","19 kN/m³","22 kN/m³","25 kN/m³"],ans:1,topic:"IS 875"},
{q:"Floor finish load typically falls under which category?",opts:["Live load","Dead load","Wind load","Seismic load"],ans:1,topic:"IS 875"},
{q:"Partition wall load is treated as which type of load?",opts:["Concentrated dead load","Distributed live load","Equivalent distributed dead load","Wind load"],ans:2,topic:"IS 875"},

// SEISMIC BASICS (8)
{q:"Which IS code covers earthquake resistant design?",opts:["IS 456","IS 875","IS 1893","IS 13920"],ans:2,topic:"Seismic"},
{q:"How many seismic zones does India have as per IS 1893?",opts:["3","4","5","6"],ans:1,topic:"Seismic"},
{q:"Which seismic zone has the highest intensity?",opts:["Zone II","Zone III","Zone IV","Zone V"],ans:3,topic:"Seismic"},
{q:"What is the Importance Factor for a hospital?",opts:["1.0","1.2","1.5","2.0"],ans:2,topic:"Seismic"},
{q:"What is the Importance Factor for a residential building?",opts:["1.0","1.2","1.5","2.0"],ans:0,topic:"Seismic"},
{q:"Base shear depends on which of these?",opts:["Only building height","Only seismic zone","Seismic zone, soil type, building weight and height","Only soil type"],ans:2,topic:"Seismic"},
{q:"Which soil type gives highest seismic amplification?",opts:["Type I — Hard rock","Type II — Medium","Type III — Soft soil","All same"],ans:2,topic:"Seismic"},
{q:"IS 13920 covers which aspect of seismic design?",opts:["Base shear calculation","Ductile detailing of RC structures","Wind pressure","Foundation design"],ans:1,topic:"Seismic"},

// MEMBER TERMINOLOGY (8)
{q:"What does lx represent in slab design?",opts:["Long span","Short span","Effective depth","Slab thickness"],ans:1,topic:"Members"},
{q:"When is a slab considered two-way?",opts:["When ly/lx > 2","When ly/lx ≤ 2","When ly/lx = 1","Always"],ans:1,topic:"Members"},
{q:"What is effective depth 'd' of a beam?",opts:["Total depth D","D minus cover","D minus cover minus half bar diameter","D plus cover"],ans:2,topic:"Members"},
{q:"Tributary area of a column is used to calculate?",opts:["Beam moment","Column axial load","Slab deflection","Foundation depth"],ans:1,topic:"Members"},
{q:"Which member transfers load from slab to columns?",opts:["Footing","Wall","Beam","Staircase"],ans:2,topic:"Members"},
{q:"What is a transfer beam?",opts:["Beam carrying slab load only","Beam carrying column load from above","Beam in staircase","Secondary beam"],ans:1,topic:"Members"},
{q:"Stirrups in beams resist which force primarily?",opts:["Bending moment","Axial compression","Shear force","Torsion"],ans:2,topic:"Members"},
{q:"Ties in columns resist which tendency?",opts:["Buckling of longitudinal bars","Bending","Deflection","Settlement"],ans:0,topic:"Members"},

// COVER & MATERIALS (8)
{q:"Minimum cover for footings below ground per IS 456?",opts:["20mm","40mm","60mm","75mm"],ans:3,topic:"Cover"},
{q:"Minimum cover for columns per IS 456?",opts:["20mm","25mm","40mm","75mm"],ans:2,topic:"Cover"},
{q:"Minimum cover for slabs (mild exposure)?",opts:["15mm","20mm","25mm","40mm"],ans:1,topic:"Cover"},
{q:"Why is cover provided to reinforcement?",opts:["To increase beam depth","To protect steel from corrosion and fire","To reduce steel quantity","To increase self weight"],ans:1,topic:"Cover"},
{q:"M25 concrete — what does 25 represent?",opts:["Cement content in kg","Characteristic strength in N/mm²","Mix ratio","Water cement ratio"],ans:1,topic:"Cover"},
{q:"Which steel grade is mandatory per IS 13920 for seismic zones?",opts:["Fe 250","Fe 415","Fe 500D","Fe 600"],ans:2,topic:"Cover"},
{q:"What is the minimum bar diameter for main steel in beams?",opts:["6mm","8mm","10mm","12mm"],ans:3,topic:"Cover"},
{q:"Nominal cover is measured to which reinforcement?",opts:["Main bars","Stirrups or ties (outermost bar)","Both equally","Depends on member"],ans:1,topic:"Cover"},
],

// ══════════════════════════════════════════════════════════════
// LEVEL 2 — PROFICIENCY (60 questions)
// ══════════════════════════════════════════════════════════════
L2: [
// BEAM DESIGN (10)
{q:"A beam with span 6m has depth governed by deflection. The IS 456 basic span/depth ratio for simply supported beam is?",opts:["16","20","26","30"],ans:2,topic:"Beams"},
{q:"For a continuous beam with both ends fixed, the midspan moment coefficient α is?",opts:["1/8","1/10","1/12","1/16"],ans:3,topic:"Beams"},
{q:"Your beam B2 fails in deflection but passes in moment. Best fix?",opts:["Add more steel","Increase beam depth D","Increase concrete grade","Reduce live load"],ans:1,topic:"Beams"},
{q:"Why does beam depth D stay the same on all floors of a multi-storey building?",opts:["Software limitation","Span is same every floor so deflection requirement is same","Upper floors have more load","Code mandates uniform depth"],ans:1,topic:"Beams"},
{q:"For an edge beam (one end pinned, one continuous), the moment coefficient at continuous end is?",opts:["1/8","1/10","1/12","1/16"],ans:1,topic:"Beams"},
{q:"Minimum beam width b as per IS 456 Cl 23.1?",opts:["150mm","200mm","230mm","250mm"],ans:1,topic:"Beams"},
{q:"Shear reinforcement (stirrups) spacing near support should be?",opts:["Larger than midspan","Same throughout","Closer than midspan","Only at midspan"],ans:2,topic:"Beams"},
{q:"A beam with wu=20 kN/m and span 5m (simply supported). Mmax = ?",opts:["62.5 kN.m","78.1 kN.m","52.1 kN.m","41.7 kN.m"],ans:0,topic:"Beams"},
{q:"Mulim for a singly reinforced beam depends on?",opts:["Steel quantity only","Concrete grade and beam dimensions","Steel grade only","Span only"],ans:1,topic:"Beams"},
{q:"Why are secondary beams used?",opts:["To carry column loads","To reduce main beam span and slab span","For aesthetics","To resist wind loads"],ans:1,topic:"Beams"},

// COLUMN DESIGN (10)
{q:"IS 13920 minimum column dimension in seismic zones?",opts:["200mm","250mm","300mm","350mm"],ans:2,topic:"Columns"},
{q:"Why does a corner column carry less load than an interior column?",opts:["Corner columns are taller","Corner columns have smaller tributary area","Interior columns have more steel","Corner columns are stronger"],ans:1,topic:"Columns"},
{q:"Minimum steel percentage in columns per IS 456?",opts:["0.4%","0.8%","1.0%","2.0%"],ans:1,topic:"Columns"},
{q:"Maximum steel percentage in columns per IS 456?",opts:["4%","5%","6%","8%"],ans:2,topic:"Columns"},
{q:"Column load increases from top floor to ground floor because?",opts:["Ground floor columns are longer","Cumulative load from all floors above adds up","Ground has more seismic force","Foundation adds load"],ans:1,topic:"Columns"},
{q:"Confinement zone in a column per IS 13920 is provided at?",opts:["Midheight only","Top and bottom of column near joints","Throughout column height","Only at base"],ans:1,topic:"Columns"},
{q:"For a G+3 building, which floor column carries maximum load?",opts:["Roof floor","Third floor","Second floor","Ground floor"],ans:3,topic:"Columns"},
{q:"Lateral ties in columns are provided to?",opts:["Resist bending","Prevent buckling of longitudinal bars and confine concrete","Carry shear only","Reduce self weight"],ans:1,topic:"Columns"},
{q:"Short column fails by?",opts:["Buckling","Material crushing","Deflection","Settlement"],ans:1,topic:"Columns"},
{q:"Effective length of a column with both ends fixed is?",opts:["L","0.5L","0.7L","2L"],ans:1,topic:"Columns"},

// SLAB DESIGN (10)
{q:"IS 456 Table 26 gives moment coefficients for?",opts:["Beam design","Two-way slab design","Column design","Staircase design"],ans:1,topic:"Slabs"},
{q:"A slab bay has lx=3m, ly=5m. What type of slab is it?",opts:["Two-way slab","One-way slab","Flat slab","Waffle slab"],ans:1,topic:"Slabs"},
{q:"Minimum slab thickness for deflection control (simply supported)?",opts:["L/20","L/26","L/35","L/40"],ans:1,topic:"Slabs"},
{q:"IS 456 Case 1 slab means?",opts:["Simply supported on all sides","All four edges continuous","Two edges continuous","One edge continuous"],ans:1,topic:"Slabs"},
{q:"Distribution steel in a one-way slab is placed in?",opts:["Direction of main span","Perpendicular to main span","Both directions equally","Along diagonal"],ans:1,topic:"Slabs"},
{q:"Why is a staircase bay not designed as a flat slab?",opts:["Stairs are stronger","No flat floor slab exists in stair bay — waist slab replaces it","Stairs use steel","Code does not allow it"],ans:1,topic:"Slabs"},
{q:"Negative moment in a slab occurs at?",opts:["Midspan","Supports (continuous edges)","Corners only","Free edges"],ans:1,topic:"Slabs"},
{q:"Minimum steel in slabs per IS 456 (Fe500)?",opts:["0.10%","0.12%","0.15%","0.20%"],ans:1,topic:"Slabs"},
{q:"A void bay in the building plan means?",opts:["Lighter slab","No slab — open to below","Thicker slab","One-way slab"],ans:1,topic:"Slabs"},
{q:"Effective span of a slab is taken as?",opts:["Centre to centre of supports","Clear span only","Clear span plus effective depth","Clear span plus full support width"],ans:0,topic:"Slabs"},

// FOOTING DESIGN (10)
{q:"Punching shear in a footing acts on which perimeter?",opts:["Footing edge","Column face","Critical perimeter at d/2 from column face","d from column face"],ans:2,topic:"Footings"},
{q:"Safe bearing capacity (SBC) is reduced at depth because?",opts:["Soil is weaker at depth","Self weight of soil above footing reduces net bearing capacity","Foundation adds weight","Water table effect"],ans:1,topic:"Footings"},
{q:"Which check governs footing depth in most practical cases?",opts:["Bending moment","One-way shear","Punching shear","Settlement"],ans:2,topic:"Footings"},
{q:"An isolated footing is designed for which type of load?",opts:["Only dead load","Factored axial load from column","Service load only","Wind load only"],ans:1,topic:"Footings"},
{q:"Minimum cover for footings per IS 456?",opts:["40mm","50mm","60mm","75mm"],ans:3,topic:"Footings"},
{q:"Footing plan size is determined by?",opts:["Column size","Safe bearing capacity of soil","Concrete grade","Steel percentage"],ans:1,topic:"Footings"},
{q:"Net soil pressure under footing = ?",opts:["Total load / footing area","(Column load + footing self weight) / area","Column load / (area × SBC)","Column load / area"],ans:3,topic:"Footings"},
{q:"A larger column load requires?",opts:["Smaller footing","Same footing always","Larger footing plan size","Thinner footing"],ans:2,topic:"Footings"},
{q:"Footing reinforcement is designed for?",opts:["Compression","Bending moment at column face","Shear only","Punching only"],ans:1,topic:"Footings"},
{q:"Why are footings provided below ground level?",opts:["To hide them","To reach firm soil and avoid frost action","To reduce cost","Code not required above ground"],ans:1,topic:"Footings"},

// SEISMIC UNDERSTANDING (10)
{q:"Base shear V = Ah × W. What is W?",opts:["Wind load","Seismic weight of building","Wall load","Water load"],ans:1,topic:"Seismic"},
{q:"Seismic weight of a floor includes?",opts:["Full live load","Dead load plus 25% of live load for most buildings","Dead load only","Full live load plus dead load"],ans:1,topic:"Seismic"},
{q:"A void bay reduces seismic weight because?",opts:["Void bays are stronger","No slab mass in void bay — excluded from seismic weight","Void bays are lighter concrete","Code reduces by 50%"],ans:1,topic:"Seismic"},
{q:"Storey shear is maximum at?",opts:["Roof level","Midheight","Ground level","Top floor"],ans:2,topic:"Seismic"},
{q:"Response Reduction Factor R accounts for?",opts:["Material strength","Ductility and overstrength of the structure","Wind effect","Soil type"],ans:1,topic:"Seismic"},
{q:"For a ductile RC frame building, R = ?",opts:["3","4","5","6"],ans:2,topic:"Seismic"},
{q:"Taller buildings have longer time period T. This means?",opts:["Higher base shear always","Lower Sa/g for medium/hard soil — lower base shear","Higher Sa/g always","No effect on base shear"],ans:1,topic:"Seismic"},
{q:"IS 13920 applies to buildings in which seismic zones?",opts:["All zones","Zone II only","Zone III, IV and V","Zone V only"],ans:2,topic:"Seismic"},
{q:"Soft storey is dangerous in earthquakes because?",opts:["It is at the bottom","It has much less lateral stiffness than floors above — concentrates damage","It has more columns","It is taller"],ans:1,topic:"Seismic"},
{q:"Seismic force distribution over building height follows?",opts:["Uniform distribution","Triangular distribution — more at top","Concentrated at base","Random distribution"],ans:1,topic:"Seismic"},

// IS 13920 DETAILING (10)
{q:"Minimum longitudinal steel in beam per IS 13920?",opts:["0.24fck/fy × bd","0.12% of bd","2 bars minimum 10mm dia","Both A and C"],ans:3,topic:"IS 13920"},
{q:"Maximum steel ratio at any section in beam per IS 13920?",opts:["2%","2.5%","3%","4%"],ans:1,topic:"IS 13920"},
{q:"Confinement zone length at beam-column joint per IS 13920?",opts:["d from face","2d from face","L/4 from face or 2d whichever is more","L/6"],ans:2,topic:"IS 13920"},
{q:"In confinement zone of column, maximum tie spacing?",opts:["100mm","150mm","B/4 or 75mm whichever is less","d/2"],ans:2,topic:"IS 13920"},
{q:"Why does IS 13920 mandate Fe 500D?",opts:["Higher strength","Ductile properties — can elongate without fracture","Cheaper","Easier to bend"],ans:1,topic:"IS 13920"},
{q:"Shear capacity of beam must be based on?",opts:["Applied shear only","Moment capacity — to ensure ductile flexural failure before shear failure","Code table value","Tributary area"],ans:1,topic:"IS 13920"},
{q:"Lap splices in columns per IS 13920 should NOT be placed at?",opts:["Midheight","Quarter height","Top and bottom (confinement zones)","Any location"],ans:2,topic:"IS 13920"},
{q:"Minimum column dimension per IS 13920 in seismic zones?",opts:["200mm","250mm","300mm","400mm"],ans:2,topic:"IS 13920"},
{q:"Hook angle for stirrups per IS 13920 in seismic zones?",opts:["90°","90° or 135°","135° mandatory","180°"],ans:2,topic:"IS 13920"},
{q:"Strong column — weak beam concept means?",opts:["Columns stronger than beams in compression","Column moment capacity > beam moment capacity at joint to ensure ductile failure","Beams should fail first in flexure","Both A and C"],ans:1,topic:"IS 13920"},
],

// ══════════════════════════════════════════════════════════════
// LEVEL 3 — COMPETENT (80 questions)
// ══════════════════════════════════════════════════════════════
L3: [
// BEAM CALCULATIONS (10)
{q:"Beam: span=5m, wu=30 kN/m, both ends continuous. Midspan Mu (α=1/16)?",opts:["46.9 kN.m","93.8 kN.m","37.5 kN.m","56.3 kN.m"],ans:0,topic:"Beam Calc"},
{q:"Beam: D=450mm, cover=40mm, bar=20mm. Effective depth d=?",opts:["390mm","400mm","410mm","420mm"],ans:1,topic:"Beam Calc"},
{q:"Mulim = 0.138 × fck × b × d². For M25, b=230, d=400mm. Mulim=?",opts:["127.3 kN.m","101.3 kN.m","85.2 kN.m","143.1 kN.m"],ans:0,topic:"Beam Calc"},
{q:"Ast_req for Mu=80 kN.m, d=400mm, fy=500, b=230 using IS 456 Annex G approx?",opts:["480 mm²","520 mm²","560 mm²","610 mm²"],ans:1,topic:"Beam Calc"},
{q:"A beam has wu=25 kN/m, L=6m. Max shear Vu at support (SS beam)?",opts:["75 kN","150 kN","112.5 kN","187.5 kN"],ans:0,topic:"Beam Calc"},
{q:"Nominal shear stress τv = Vu/(b×d). For Vu=75kN, b=230, d=400. τv=?",opts:["0.65 N/mm²","0.81 N/mm²","0.72 N/mm²","0.54 N/mm²"],ans:1,topic:"Beam Calc"},
{q:"Deflection check: actual span/depth ratio = 6000/400 = 15. IS 456 permissible = 26. Result?",opts:["Fails — too shallow","Passes — within limit","Borderline","Cannot determine"],ans:1,topic:"Beam Calc"},
{q:"Beam with 3-D20 bars. Ast provided = ?",opts:["785 mm²","942 mm²","1100 mm²","628 mm²"],ans:1,topic:"Beam Calc"},
{q:"Stirrup spacing = Asv×0.87fy/(0.4×b). For 2-legged D8, b=230, fy=500. Spacing=?",opts:["150mm","175mm","200mm","225mm"],ans:1,topic:"Beam Calc"},
{q:"A cantilever beam L=2m, wu=20 kN/m. Mu at fixed end=?",opts:["20 kN.m","40 kN.m","80 kN.m","160 kN.m"],ans:1,topic:"Beam Calc"},

// COLUMN CALCULATIONS (10)
{q:"Column Pu=800kN, size=300×300, fck=25, fy=500. Min Ast (0.8%)?",opts:["480 mm²","640 mm²","720 mm²","960 mm²"],ans:2,topic:"Col Calc"},
{q:"Column capacity Pcap=0.4×fck×Ac+0.67×fy×Ast. For 300×300, M25, 4-D16. Pcap≈?",opts:["850 kN","920 kN","980 kN","1050 kN"],ans:1,topic:"Col Calc"},
{q:"A G+4 building. Ground floor column carries loads from how many floors?",opts:["1","2","4","5"],ans:3,topic:"Col Calc"},
{q:"Interior column tributary area in 3m×4m grid (4 equal bays around it). Area=?",opts:["6 m²","12 m²","3 m²","24 m²"],ans:1,topic:"Col Calc"},
{q:"Column steel percentage pt = 100×Ast/(b×D). For 300×300 with 4-D20. pt=?",opts:["1.40%","1.60%","1.80%","2.00%"],ans:0,topic:"Col Calc"},
{q:"Tie spacing in confinement zone: B/4=75mm or 100mm whichever less. For 300mm column?",opts:["100mm","75mm","50mm","150mm"],ans:1,topic:"Col Calc"},
{q:"Column: Pu=1200kN, pt=1.2%, fck=25. Required size (approx)?",opts:["300×300","350×350","400×400","450×450"],ans:2,topic:"Col Calc"},
{q:"Lap length for column bars per IS 456 = 45× bar diameter. For D20 bars?",opts:["600mm","750mm","900mm","1000mm"],ans:2,topic:"Col Calc"},
{q:"A corner column has tributary area = 1/4 of interior column for same grid. If interior Pu=800kN, corner Pu≈?",opts:["200kN","400kN","600kN","100kN"],ans:0,topic:"Col Calc"},
{q:"Why does pt% decrease on upper floors for same column size?",opts:["Less concrete on upper floors","Less cumulative load → less Ast required but same size maintained for formwork","More wind on upper floors","Code mandates reduction"],ans:1,topic:"Col Calc"},

// SLAB CALCULATIONS (10)
{q:"Slab: lx=3m, ly=4m. ly/lx ratio = 1.33. Slab type?",opts:["One-way","Two-way — IS 456 Table 26 applies","Flat slab","Waffle slab"],ans:1,topic:"Slab Calc"},
{q:"IS 456 Table 26 Case 1 (all edges continuous): αx coefficient for ly/lx=1.0 ≈?",opts:["0.032","0.062","0.056","0.045"],ans:0,topic:"Slab Calc"},
{q:"Slab Mx = αx × wu × lx². For αx=0.032, wu=12 kN/m², lx=3m. Mx=?",opts:["3.46 kN.m/m","2.88 kN.m/m","4.32 kN.m/m","1.73 kN.m/m"],ans:1,topic:"Slab Calc"},
{q:"Slab effective depth d=150-20-5=125mm. For Ast=180mm²/m, spacing of D10 bars?",opts:["300mm","350mm","436mm","250mm"],ans:2,topic:"Slab Calc"},
{q:"Minimum Ast for slab with Fe500: 0.12% of bd. For d=125, b=1000mm. Min Ast=?",opts:["120 mm²","150 mm²","180 mm²","200 mm²"],ans:1,topic:"Slab Calc"},
{q:"A slab span/depth check: lx/d = 3000/125 = 24. IS 456 limit for two-way = 32. Result?",opts:["Fails","Passes","Exactly at limit","Cannot check without steel"],ans:1,topic:"Slab Calc"},
{q:"Waist slab DL = (D/1000)×25/cosθ. For D=150mm, θ=20°. DL_waist≈?",opts:["3.75 kN/m²","3.99 kN/m²","4.25 kN/m²","3.50 kN/m²"],ans:1,topic:"Slab Calc"},
{q:"For one-way slab with span 4m, simply supported. Basic l/d = 20. Min d=?",opts:["150mm","175mm","200mm","225mm"],ans:2,topic:"Slab Calc"},
{q:"Distribution steel in slab = 0.12% of bD (gross). For D=150, b=1000. Ast_dist=?",opts:["120 mm²","150 mm²","180 mm²","200 mm²"],ans:2,topic:"Slab Calc"},
{q:"Slab negative moment at continuous edge ≈ how many times the positive midspan moment?",opts:["Same","1.33 times","0.5 times","2 times"],ans:1,topic:"Slab Calc"},

// FOOTING CALCULATIONS (10)
{q:"Footing: Pu=600kN, SBC=200kN/m². Net bearing pressure. Min footing area=?",opts:["2.0 m²","3.0 m²","4.0 m²","1.5 m²"],ans:1,topic:"Ftg Calc"},
{q:"Square footing size for area=3m²: side length=?",opts:["1.5m","1.7m","1.8m","2.0m"],ans:1,topic:"Ftg Calc"},
{q:"Punching shear perimeter bo = 4×(col+d). For col=300, d=350mm. bo=?",opts:["2200mm","2600mm","2800mm","3000mm"],ans:1,topic:"Ftg Calc"},
{q:"Punching shear stress τvp = Vpu/(bo×d). For Vpu=500kN, bo=2600, d=350. τvp≈?",opts:["0.45 N/mm²","0.55 N/mm²","0.65 N/mm²","0.75 N/mm²"],ans:1,topic:"Ftg Calc"},
{q:"Permissible punching shear τcp = 0.25√fck. For M25. τcp=?",opts:["1.0 N/mm²","1.25 N/mm²","1.5 N/mm²","0.75 N/mm²"],ans:1,topic:"Ftg Calc"},
{q:"Footing bending moment at column face: Mu = q×B×(B-c)²/8. For q=200kN/m², B=1.7m, c=0.3m. Mu≈?",opts:["58 kN.m","67 kN.m","82 kN.m","47 kN.m"],ans:0,topic:"Ftg Calc"},
{q:"Net SBC = Gross SBC - γ×depth. For SBC=200, γ=18, depth=1.5m. Net SBC=?",opts:["173 kN/m²","183 kN/m²","191 kN/m²","165 kN/m²"],ans:0,topic:"Ftg Calc"},
{q:"Corner column Pu=300kN, SBC=150kN/m². Min footing area=?",opts:["1.0 m²","2.0 m²","2.5 m²","3.0 m²"],ans:1,topic:"Ftg Calc"},
{q:"Footing depth is INCREASED when punching shear fails. Why?",opts:["More concrete = stronger","Increasing d increases both bo and shear area — reduces τvp","More self weight","Cover requirements"],ans:1,topic:"Ftg Calc"},
{q:"Lap length for footing bars = 45×dia. For D12 bars?",opts:["480mm","540mm","600mm","450mm"],ans:1,topic:"Ftg Calc"},

// SEISMIC CALCULATIONS (10)
{q:"Design seismic coefficient Ah = Z/2 × I/R × Sa/g. Zone IV: Z=0.24, I=1.0, R=5, Sa/g=2.5. Ah=?",opts:["0.048","0.060","0.072","0.096"],ans:1,topic:"Seismic Calc"},
{q:"Base shear V = Ah × W. For Ah=0.06, W=5000kN. V=?",opts:["250kN","300kN","350kN","400kN"],ans:1,topic:"Seismic Calc"},
{q:"Seismic weight of floor = DL + 0.25×LL. For DL=800kN, LL=200kN. W_floor=?",opts:["850kN","900kN","950kN","1000kN"],ans:0,topic:"Seismic Calc"},
{q:"Time period T = 0.075×h^0.75 for RC frame. For h=12m (G+3). T≈?",opts:["0.45s","0.52s","0.61s","0.70s"],ans:1,topic:"Seismic Calc"},
{q:"Lateral force at roof is HIGHER than at ground because?",opts:["Roof is heavier","IS 1893 distributes base shear proportional to Wi×hi — higher floors get more","Wind governs at roof","Code mandates it"],ans:1,topic:"Seismic Calc"},
{q:"For Zone V hospital: Z=0.36, I=1.5, R=5, Sa/g=2.5. Ah=?",opts:["0.135","0.270","0.108","0.162"],ans:0,topic:"Seismic Calc"},
{q:"A building has 4 floors each W=1000kN at heights 3,6,9,12m. Base shear=200kN. Force at roof (h=12)?",opts:["40kN","60kN","80kN","100kN"],ans:2,topic:"Seismic Calc"},
{q:"Reducing R from 5 to 3 (less ductile system) changes Ah by factor?",opts:["0.6","1.67","1.0","0.8"],ans:1,topic:"Seismic Calc"},
{q:"Soft soil (Type III) vs hard rock (Type I) — Sa/g ratio at T=0.3s approximately?",opts:["Same","Soft soil 2.5x higher","Hard rock 2x higher","Soft soil 1.5x higher"],ans:1,topic:"Seismic Calc"},
{q:"A 5-storey building removes ground floor walls (open ground floor). This creates?",opts:["Stronger building","Soft storey — dangerous concentration of drift","Better air circulation only","Stiffer building"],ans:1,topic:"Seismic Calc"},

// DESIGN JUDGMENT (10)
{q:"You have two options: M25+Fe500D or M30+Fe415. For seismic zone IV, which is correct?",opts:["M25+Fe500D — Fe500D mandatory per IS 13920","M30+Fe415 — higher concrete is better","Either works","M30+Fe500D only"],ans:0,topic:"Judgment"},
{q:"Beam fails in shear but passes in moment. You should?",opts:["Accept — moment governs","Increase stirrup density or beam depth — shear failure is brittle","Reduce live load","Increase steel"],ans:1,topic:"Judgment"},
{q:"All columns pass but one edge column fails. Best solution?",opts:["Ignore — one failure acceptable","Increase that column size or add wall","Reduce building height","Change seismic zone"],ans:1,topic:"Judgment"},
{q:"Student designs G+10 building with 300×300 columns. This is?",opts:["Correct — minimum size","Likely wrong — load requirement will exceed capacity for 10 floors","Fine if M40 concrete","Only acceptable in Zone II"],ans:1,topic:"Judgment"},
{q:"Footing on soft soil (SBC=80kN/m²) vs hard soil (SBC=300kN/m²). Same column load. Footing size?",opts:["Same size","Larger on soft soil","Larger on hard soil","Depth changes not size"],ans:1,topic:"Judgment"},
{q:"A building has irregular plan with re-entrant corner. Special concern is?",opts:["More steel needed","Stress concentration and torsion at re-entrant corner under seismic load","Foundation problem","Slab thickness"],ans:1,topic:"Judgment"},
{q:"Punching shear fails at a footing. You cannot increase depth. Alternative?",opts:["Use higher concrete grade only","Increase column size to increase perimeter, or use pedestal","Reduce column load","Change footing to mat"],ans:1,topic:"Judgment"},
{q:"Design shows beam depth D=600mm for span 4m. This seems?",opts:["Correct","Over-designed — span/depth = 6.7, much deeper than l/d=16-26 suggests","Under-designed","Cannot judge without load"],ans:1,topic:"Judgment"},
{q:"Client wants to remove a column to create open plan. You should?",opts:["Refuse — columns cannot be removed","Design a transfer beam to carry the load from above","Just remove it — load redistributes","Add more columns nearby"],ans:1,topic:"Judgment"},
{q:"Same building designed in Zone II vs Zone V. What changes significantly?",opts:["Slab design","Column and beam steel, column size, foundation size","Foundation depth only","Concrete grade only"],ans:1,topic:"Judgment"},

// CODE INTERPRETATION (10)
{q:"IS 456 Cl 23.2.1 basic l/d ratio for cantilever beam?",opts:["7","10","16","20"],ans:0,topic:"Code"},
{q:"IS 456 Table 16 cover for 'moderate' exposure beams?",opts:["20mm","30mm","40mm","45mm"],ans:2,topic:"Code"},
{q:"IS 456 Cl 26.5.1 minimum steel in beams = 0.85/fy × bd. For fy=500, b=230, d=400. Min Ast=?",opts:["115 mm²","145 mm²","157 mm²","196 mm²"],ans:3,topic:"Code"},
{q:"IS 1893 importance factor for school with >200 occupants?",opts:["1.0","1.2","1.5","2.0"],ans:1,topic:"Code"},
{q:"IS 13920 Cl 7.1.1 — minimum column width in direction of seismic force?",opts:["200mm","250mm","300mm","350mm"],ans:2,topic:"Code"},
{q:"IS 456 Cl 31.6.2 — critical section for punching shear is at?",opts:["Column face","d/2 from column face","d from column face","2d from column face"],ans:1,topic:"Code"},
{q:"IS 875 Part 3 — design wind speed Vz = Vb×k1×k2×k3. k2 depends on?",opts:["Terrain and building height","Risk factor","Topography","Structural damping"],ans:0,topic:"Code"},
{q:"IS 456 Cl 26.3.3 maximum spacing of main bars in slab?",opts:["3d or 300mm","2d or 300mm","3d or 450mm","d or 300mm"],ans:0,topic:"Code"},
{q:"IS 456 minimum eccentricity for columns = L/500 + D/30 ≥ 20mm. For L=3m, D=300. emin=?",opts:["16mm","20mm","26mm","30mm"],ans:1,topic:"Code"},
{q:"IS 13920 beam — at any section, neither tension nor compression steel shall exceed?",opts:["2.0%","2.5%","3.0%","4.0%"],ans:1,topic:"Code"},

// IRREGULAR STRUCTURES (10)
{q:"A building with staircase bay — adjacent beams get extra load from?",opts:["Nothing — stair is separate","Stair slab reaction transferred to supporting beams","Column only","Foundation"],ans:1,topic:"Irregular"},
{q:"Cantilever beam at edge — moment at fixed end with UDL w, length L?",opts:["wL²/8","wL²/2","wL²/4","wL²/3"],ans:1,topic:"Irregular"},
{q:"A bay is marked as 'void'. Effect on adjacent beam tributary load?",opts:["Beam gets full void bay load","Beam gets no slab load from void side","Beam doubles in size","No effect"],ans:1,topic:"Irregular"},
{q:"Transfer beam carries load from?",opts:["Slab only","A column that is discontinued above — carries column load","Foundation to column","Wall to slab"],ans:1,topic:"Irregular"},
{q:"Building with one storey much taller than others. Problem under seismic?",opts:["No problem","Soft storey effect — that storey attracts more lateral force and drift","Stiffer building","Foundation problem"],ans:1,topic:"Irregular"},
{q:"L-shaped building plan under seismic loading experiences?",opts:["Uniform stress","Torsional effects due to asymmetry","Only axial forces","No special effect"],ans:1,topic:"Irregular"},
{q:"A secondary beam framing into a main beam — main beam gets?",opts:["Nothing extra","Concentrated point load at secondary beam connection","Distributed load only","Reduced load"],ans:1,topic:"Irregular"},
{q:"Wall support at end of beam (instead of column) gives which end condition?",opts:["Fixed","Continuous","Pinned/simply supported","Cantilever"],ans:2,topic:"Irregular"},
{q:"Courtyard bay in building plan — effect on seismic weight?",opts:["Increases seismic weight","Reduces seismic weight — no slab mass","No effect","Doubles nearby floor weight"],ans:1,topic:"Irregular"},
{q:"A G+5 building has ground floor height 6m, upper floors 3m each. Risk?",opts:["None","Soft storey at ground floor — 6m height makes it much more flexible","Only aesthetic issue","Foundation problem"],ans:1,topic:"Irregular"},
],
};

// Export for use in other files
if(typeof module !== 'undefined') module.exports = QB;


// Quiz + Certificate Engine
// ══════════════════════════════════════════════════════════════
// STRUCTLEARN PRO — QUIZ + CERTIFICATE + BEHAVIOR TRACKER
// Complete system — inject into StructLearnPro.html
// ══════════════════════════════════════════════════════════════

// ── BEHAVIOR TRACKER ──────────────────────────────────────────
const _BT = {
  // 10 behaviors tracked silently
  behaviors: {
    B1: { done:false, desc:'Changed seismic zone' },
    B2: { done:false, desc:'Changed concrete or steel grade' },
    B3: { done:false, desc:'Had a member failure' },
    B4: { done:false, desc:'Fixed a failure by iterating' },
    B5: { done:false, desc:'Opened beam report' },
    B6: { done:false, desc:'Opened column report' },
    B7: { done:false, desc:'Changed span after seeing results' },
    B8: { done:false, desc:'Added staircase or void bay' },
    B9: { done:false, desc:'Ran analysis 3+ times' },
    B10:{ done:false, desc:'Spent 20+ minutes in app' },
  },
  analysisCount: 0,
  startTime: Date.now(),
  hadFailure: false,
  prevHadFailure: false,
  prevSeismicZone: null,
  prevFck: null,
  prevFy: null,
  prevSpans: null,

  // Mark a behavior complete
  mark(key) {
    if(!this.behaviors[key].done) {
      this.behaviors[key].done = true;
      this._saveLocal();
      this.updateProgress();
      // Sync to Supabase immediately so other devices get it too
      try { if(typeof _EDU !== 'undefined') _EDU._syncToCloud(); } catch(e) {}
    }
  },

  // Save behaviors to localStorage for hard-refresh survival
  _saveLocal() {
    try {
      localStorage.setItem('slp_bt_behaviors', JSON.stringify(this.export()));
    } catch(e) {}
  },

  // Load behaviors from localStorage on startup
  _loadLocal() {
    try {
      var stored = JSON.parse(localStorage.getItem('slp_bt_behaviors') || '{}');
      this.importFrom(stored);
    } catch(e) {}
  },

  // Count completed behaviors
  count() {
    return Object.values(this.behaviors).filter(b=>b.done).length;
  },
  export() {
    var out = {};
    Object.keys(this.behaviors).forEach(function(k){
      if(_BT.behaviors[k].done) out[k] = true;
    });
    return out;
  },
  importFrom(data) {
    if(!data) return;
    var self = this;
    Object.keys(data).forEach(function(k){
      if(self.behaviors[k]) self.behaviors[k].done = true;
    });
    this._saveLocal();
    // Update UI after restoring
    setTimeout(function(){ 
      try { self.updateProgress(); } catch(e) {}
    }, 100);
  },

  // Calculate confidence score
  confidence() {
    return Math.round((this.count() / 10) * 100);
  },

  // Check level unlock
  level() {
    const c = this.count();
    if(c >= 10) return 3;
    if(c >= 7)  return 2;
    if(c >= 4)  return 1;
    return 0;
  },

  // Update progress UI
  updateProgress() {
    const pct = this.confidence();
    const bar = document.getElementById('_cert_bar_fill');
    const txt = document.getElementById('_cert_confidence');
    const lvl = document.getElementById('_cert_level_text');
    if(bar) bar.style.width = pct + '%';
    if(txt) txt.textContent = pct + '%';
    if(lvl) {
      const lv = this.level();
      lvl.textContent = lv===0?'Keep exploring...':
        lv===1?'🥉 Foundation unlocked — take the quiz!':
        lv===2?'🥈 Proficiency unlocked — take the quiz!':
        '🥇 Competent unlocked — take the quiz!';
      lvl.style.color = lv===0?'#64748b':lv===1?'#d97706':lv===2?'#94a3b8':'#b8860b';
    }
    // Check if new level unlocked
    if(this.level() > 0) {
      this.showLevelNotification();
    }
  },

  lastNotifiedLevel: 0,
  showLevelNotification() {
    const lv = this.level();
    if(lv > this.lastNotifiedLevel) {
      this.lastNotifiedLevel = lv;
      const msgs = ['','🥉 Foundation quiz unlocked!','🥈 Proficiency quiz unlocked!','🥇 Competent quiz unlocked!'];
      showCertToast(msgs[lv], lv===3?'#b8860b':lv===2?'#94a3b8':'#d97706');
    }
  },

  // Start time tracker
  startTimeTracker() {
    setInterval(() => {
      const mins = (Date.now() - this.startTime) / 60000;
      if(mins >= 20) this.mark('B10');
    }, 30000); // check every 30 sec
  },

  // Called after every analysis run
  onAnalysis(res, currentS) {
    this.analysisCount++;
    if(this.analysisCount >= 3) this.mark('B9');

    // Check for failures
    const hasFailure = (res.allBeams||[]).some(b=>!b.deflOK||!b.shearSafe) ||
                       (res.allCols||[]).some(c=>!c.safe) ||
                       (res.allFtgs||[]).some(f=>!f.punch_ok||!f.ow_ok);

    if(hasFailure) {
      this.mark('B3');
      this.prevHadFailure = true;
    } else if(this.prevHadFailure) {
      // Had failure before, now fixed
      this.mark('B4');
      this.prevHadFailure = false;
    }

    // Check seismic zone change
    if(this.prevSeismicZone !== null && this.prevSeismicZone !== currentS.seismicZone) {
      this.mark('B1');
    }
    this.prevSeismicZone = currentS.seismicZone;

    // Check material change
    if((this.prevFck !== null && this.prevFck !== currentS.fck) ||
       (this.prevFy  !== null && this.prevFy  !== currentS.fy)) {
      this.mark('B2');
    }
    this.prevFck = currentS.fck;
    this.prevFy  = currentS.fy;

    // Check span change after results
    const spanKey = (currentS.spansX||[]).join(',') + (currentS.spansY||[]).join(',');
    if(this.prevSpans !== null && this.prevSpans !== spanKey && this.analysisCount > 1) {
      this.mark('B7');
    }
    this.prevSpans = spanKey;
  },

  // Called when report tab is opened
  onTab(tabName) {
    if(tabName === 'beams') this.mark('B5');
    if(tabName === 'columns') this.mark('B6');
  },

  // Called when bay type changed
  onBayChange(type) {
    if(type === 'staircase' || type === 'void') this.mark('B8');
  },
};

// ── QUIZ STATE ────────────────────────────────────────────────
const _QZ = {
  active: false,
  level: 0,
  questions: [],
  current: 0,
  answers: [],
  timeLeft: 0,
  timer: null,
  tabWarnings: 0,
  fullscreenWarnings: 0,
  violations: [],

  timeLimits: { 1:12*60, 2:20*60, 3:35*60 },
  questionCounts: { 1:15, 2:20, 3:25 },
  passMark: { 1:10, 2:13, 3:18 },

  // Get random questions for level
  getQuestions(level) {
    const pool = QB['L'+level];
    const count = this.questionCounts[level];
    const shuffled = [...pool].sort(()=>Math.random()-0.5);
    return shuffled.slice(0, count).map(q => ({
      ...q,
      // Shuffle options too
      shuffled: (() => {
        const idxs = [0,1,2,3].sort(()=>Math.random()-0.5);
        return {
          opts: idxs.map(i=>q.opts[i]),
          correctIdx: idxs.indexOf(q.ans)
        };
      })()
    }));
  },

  logViolation(type) {
    this.violations.push({ type, time: new Date().toISOString(), q: this.current });
  }
};

// ── COOLDOWN MANAGEMENT ───────────────────────────────────────
function getCooldownKey(level) { return `slp_quiz_cd_${level}`; }
function getCooldownHours(level, attempt) {
  if(level===1) return 24;
  if(level===2) return 48;
  return 72;
}
function getAttempts(level) {
  return parseInt(localStorage.getItem(`slp_quiz_att_${level}`)||'0');
}
function setAttempts(level, n) { localStorage.setItem(`slp_quiz_att_${level}`, n); }
function getMaxAttempts(level) { return level===1?3:level===2?3:2; }
function getCooldownEnd(level) {
  const v = localStorage.getItem(getCooldownKey(level));
  return v ? parseInt(v) : 0;
}
function setCooldown(level) {
  const att = getAttempts(level);
  const hrs = getCooldownHours(level, att);
  const end = Date.now() + hrs*3600*1000;
  localStorage.setItem(getCooldownKey(level), end);
}
function isCoolingDown(level) { return Date.now() < getCooldownEnd(level); }

// ── CERTIFICATE GENERATION ────────────────────────────────────
function generateCertId(level) {
  const prefix = level===1?'F':level===2?'P':'C';
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random()*90000);
  return `SLP-${prefix}-${year}-${rand.toString().padStart(5,'0')}`;
}

function saveCertificate(level, certId, userName) {
  // Save to localStorage (would go to Supabase in full version)
  const certs = JSON.parse(localStorage.getItem('slp_certs')||'[]');
  const cert = {
    id: certId,
    level,
    userName,
    date: new Date().toISOString(),
    valid: true,
  };
  certs.push(cert);
  localStorage.setItem('slp_certs', JSON.stringify(certs));

  // Save to Supabase if available
  if(typeof db !== 'undefined' && typeof U !== 'undefined' && U) {
    db.from('certificates').insert({
      cert_id: certId,
      user_id: U.id,
      student_name: userName,
      level: level===1?'foundation':level===2?'proficiency':'competent',
      issued_date: new Date().toISOString(),
      is_valid: true,
    }).then(()=>{}).catch(()=>{});
  }
  return cert;
}

function getCertColors(level) {
  if(level===1) return { primary:'#d97706', secondary:'#92400e', bg:'#fafaf9', accent:'#f59e0b', text:'#1c1917' };
  if(level===2) return { primary:'#64748b', secondary:'#64748b', bg:'#f8fafc', accent:'#94a3b8', text:'#0f172a' };
  return { primary:'#b8860b', secondary:'#7f1d1d', bg:'#fefdf5', accent:'#d4a843', text:'#1a0a00' };
}

function getCertTitle(level) {
  return level===1?'Certificate of Foundation':
         level===2?'Certificate of Proficiency':
         'Certificate of Competence';
}

function getCertSubtitle(level) {
  return level===1?'IS 456 Structural Design — Foundation Level':
         level===2?'Reinforced Concrete Structural Design — Proficiency Level':
         'Reinforced Concrete Structural Design · Indian Standards — Full Competence';
}

function getCertBody(level) {
  return level===1?
    'for completing the foundational level of the StructLearn Pro Structural Design Training Program and demonstrating basic understanding of IS 456:2000 reinforced concrete design principles.':
    level===2?
    'for demonstrating proficiency in reinforced concrete structural design, including iterative design optimization, seismic analysis per IS 1893, and member design following IS 456 and IS 13920.':
    'for successfully demonstrating full competence in the design of Reinforced Concrete Structures following Indian Standards, including seismic analysis, ductile detailing, structural member design, and complete construction documentation.';
}

function getCertCodes(level) {
  if(level===1) return ['IS 456:2000','IS 1893:2016','IS 875:2015'];
  if(level===2) return ['IS 456:2000','IS 1893:2016','IS 875:2015','IS 13920:2016'];
  return ['IS 456:2000','IS 1893:2016','IS 875:2015','IS 13920:2016','SP 34:1987'];
}

function getMedalEmoji(level) { return level===1?'🥉':level===2?'🥈':'🥇'; }

function buildCertificateSVG(level, certId, userName, dateStr) {
  const c = getCertColors(level);
  const title = getCertTitle(level);
  const subtitle = getCertSubtitle(level);
  const body = getCertBody(level);
  const codes = getCertCodes(level);
  const medal = getMedalEmoji(level);
  const verifyURL = `${window.location.origin}/verify.html?id=${certId}`;

  // Build QR code as data URL using qrcode library
  // We'll use a simple QR placeholder — real QR needs the library
  const qrPlaceholder = `<text x="815" y="480" font-size="7" fill="${c.primary}" font-family="monospace" text-anchor="middle">${certId}</text>
    <text x="815" y="492" font-size="6" fill="${c.secondary}" font-family="sans-serif" text-anchor="middle">Scan to verify</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1123" height="794" viewBox="0 0 1123 794">
  <!-- Background -->
  <rect width="1123" height="794" fill="${c.bg}"/>
  ${level===3?`
  <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
    <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.06"/>
    <stop offset="100%" stop-color="${c.bg}" stop-opacity="0"/>
  </radialGradient>
  <rect width="1123" height="794" fill="url(#bgGlow)"/>
  `:''}

  <!-- Top band -->
  <rect x="0" y="0" width="1123" height="${level===3?10:7}"
    fill="${c.secondary}"/>
  ${level===3?`<rect x="0" y="0" width="1123" height="10"
    fill="url(#topBand)"/>
  <linearGradient id="topBand" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#7f1d1d"/>
    <stop offset="25%" stop-color="#b45309"/>
    <stop offset="50%" stop-color="#f59e0b"/>
    <stop offset="75%" stop-color="#b45309"/>
    <stop offset="100%" stop-color="#7f1d1d"/>
  </linearGradient>`:''}

  <!-- Bottom band -->
  <rect x="0" y="${794-7}" width="1123" height="7" fill="${c.secondary}"/>

  <!-- Left/Right bars (level 2 only) -->
  ${level===2?`
  <rect x="0" y="0" width="8" height="794" fill="url(#sideBand)"/>
  <rect x="1115" y="0" width="8" height="794" fill="url(#sideBand)"/>
  <linearGradient id="sideBand" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#64748b"/>
    <stop offset="50%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#64748b"/>
  </linearGradient>`:''}

  <!-- Level 4: corner ornaments -->
  ${level===3?`
  <g stroke="${c.primary}" stroke-width="1.5" fill="none">
    <line x1="10" y1="18" x2="10" y2="70"/>
    <line x1="18" y1="10" x2="70" y2="10"/>
    <circle cx="10" cy="10" r="5" fill="${c.primary}"/>
    <line x1="10" y1="30" x2="30" y2="10" stroke="${c.accent}" stroke-width="0.5"/>
    <line x1="10" y1="50" x2="50" y2="10" stroke="${c.accent}" stroke-width="0.5"/>
  </g>
  <g stroke="${c.primary}" stroke-width="1.5" fill="none" transform="translate(1123,0) scale(-1,1)">
    <line x1="10" y1="18" x2="10" y2="70"/>
    <line x1="18" y1="10" x2="70" y2="10"/>
    <circle cx="10" cy="10" r="5" fill="${c.primary}"/>
  </g>
  <g stroke="${c.primary}" stroke-width="1.5" fill="none" transform="translate(0,794) scale(1,-1)">
    <line x1="10" y1="18" x2="10" y2="70"/>
    <line x1="18" y1="10" x2="70" y2="10"/>
    <circle cx="10" cy="10" r="5" fill="${c.primary}"/>
  </g>
  <g stroke="${c.primary}" stroke-width="1.5" fill="none" transform="translate(1123,794) scale(-1,-1)">
    <line x1="10" y1="18" x2="10" y2="70"/>
    <line x1="18" y1="10" x2="70" y2="10"/>
    <circle cx="10" cy="10" r="5" fill="${c.primary}"/>
  </g>`:''}

  <!-- Outer border -->
  <rect x="12" y="12" width="1099" height="770" fill="none"
    stroke="${c.primary}" stroke-width="${level===3?3:2}"/>
  <!-- Inner border -->
  <rect x="20" y="20" width="1083" height="754" fill="none"
    stroke="${c.primary}" stroke-width="0.8" stroke-opacity="0.4"/>
  ${level===3?`<rect x="26" y="26" width="1071" height="742" fill="none" stroke="${c.accent}" stroke-width="0.5" stroke-opacity="0.3"/>`:''}

  <!-- Watermark star -->
  <g opacity="0.04" transform="translate(562,397)">
    <polygon points="0,-180 42,−55 171,-55 69,21 107,146 0,70 -107,146 -69,21 -171,-55 -42,-55"
      fill="${c.primary}"/>
  </g>

  <!-- Medal badge -->
  <text x="562" y="70" text-anchor="middle" font-size="22" font-family="sans-serif">${medal}</text>
  <text x="562" y="90" text-anchor="middle" font-size="9" font-family="sans-serif" font-weight="700"
    letter-spacing="4" fill="${c.secondary}" text-transform="uppercase">
    ${level===1?'FOUNDATION CERTIFICATE':level===2?'PROFICIENCY CERTIFICATE':'COMPETENT STRUCTURAL DESIGNER'}
  </text>

  <!-- Logo -->
  <text x="562" y="118" text-anchor="middle" font-size="11" font-family="sans-serif"
    font-weight="700" letter-spacing="3" fill="${c.primary}">🏗 STRUCTLEARN PRO 🏗</text>

  <!-- Divider line -->
  <line x1="382" y1="130" x2="742" y2="130" stroke="${c.primary}" stroke-width="2"/>
  <line x1="442" y1="134" x2="682" y2="134" stroke="${c.accent}" stroke-width="0.5"/>

  <!-- "Presents" text -->
  <text x="562" y="154" text-anchor="middle" font-size="9" font-family="sans-serif"
    letter-spacing="4" fill="${c.secondary}">STRUCTURAL DESIGN TRAINING PROGRAM</text>

  <!-- Certificate title -->
  <text x="562" y="198" text-anchor="middle" font-size="36" font-family="Georgia,serif"
    font-weight="700" fill="${c.text}">${title.split(' of ')[0]} of</text>
  <text x="562" y="238" text-anchor="middle" font-size="42" font-family="Georgia,serif"
    font-weight="700" fill="${c.secondary}">${title.split(' of ')[1]}</text>

  <!-- Subtitle -->
  <text x="562" y="262" text-anchor="middle" font-size="9" font-family="sans-serif"
    letter-spacing="2" fill="${c.primary}">${subtitle}</text>

  <!-- "Awarded to" -->
  <text x="562" y="298" text-anchor="middle" font-size="10" font-family="sans-serif"
    letter-spacing="2" fill="${c.secondary}">THIS CERTIFICATE IS PROUDLY AWARDED TO</text>

  <!-- Student name -->
  <text x="562" y="348" text-anchor="middle" font-size="52" font-family="Georgia,serif"
    font-style="italic" font-weight="700" fill="${c.text}">${userName}</text>

  <!-- Name underline -->
  <line x1="212" y1="362" x2="912" y2="362" stroke="${c.accent}" stroke-width="2"/>
  <line x1="262" y1="366" x2="862" y2="366" stroke="${c.primary}" stroke-width="0.5"/>

  <!-- Body text (wrapped manually) -->
  <text x="562" y="398" text-anchor="middle" font-size="12" font-family="Georgia,serif"
    fill="#3d3020" width="700">${body.slice(0,80)}</text>
  <text x="562" y="416" text-anchor="middle" font-size="12" font-family="Georgia,serif"
    fill="#3d3020">${body.slice(80,160)}</text>
  <text x="562" y="434" text-anchor="middle" font-size="12" font-family="Georgia,serif"
    fill="#3d3020">${body.slice(160)}</text>

  <!-- IS Code badges -->
  ${codes.map((code, i) => {
    const totalW = codes.length * 120 + (codes.length-1)*10;
    const startX = 562 - totalW/2;
    const x = startX + i*130;
    return `<rect x="${x}" y="455" width="118" height="20" rx="10" fill="none" stroke="${c.primary}" stroke-width="1"/>
    <text x="${x+59}" y="469" text-anchor="middle" font-size="9" font-family="sans-serif"
      font-weight="700" letter-spacing="1" fill="${c.secondary}">${code}</text>`;
  }).join('')}

  <!-- Bottom section divider -->
  <line x1="60" y1="500" x2="1063" y2="500" stroke="${c.primary}" stroke-width="0.5" stroke-opacity="0.3"/>

  <!-- Left: Signature -->
  <text x="160" y="560" text-anchor="middle" font-size="18" font-family="Georgia,serif"
    font-style="italic" fill="${c.text}">StructLearn Pro</text>
  <line x1="80" y1="570" x2="240" y2="570" stroke="${c.primary}" stroke-width="1"/>
  <text x="160" y="584" text-anchor="middle" font-size="9" font-family="sans-serif"
    letter-spacing="1" fill="${c.secondary}">AUTHORIZED SIGNATORY</text>
  <text x="160" y="596" text-anchor="middle" font-size="8" font-family="sans-serif"
    fill="${c.primary}">StructLearn Pro Platform</text>

  <!-- Center: Seal -->
  <g transform="translate(502,520)">
    <circle cx="60" cy="52" r="48" stroke="${c.primary}" stroke-width="2.5" fill="${c.bg}" fill-opacity="0.5"/>
    <circle cx="60" cy="52" r="42" stroke="${c.primary}" stroke-width="0.5" fill="none"/>
    <polygon points="60,14 65,34 84,34 69,46 75,66 60,54 45,66 51,46 36,34 55,34"
      fill="${c.primary}" opacity="0.85"/>
    <circle cx="60" cy="52" r="9" fill="${c.accent}"/>
    <path id="sealTop" d="M 18,52 A 42,42 0 0,1 102,52" fill="none"/>
    <path id="sealBot" d="M 102,52 A 42,42 0 0,1 18,52" fill="none"/>
    <text font-size="7" fill="${c.secondary}" font-family="sans-serif" font-weight="700" letter-spacing="1.5">
      <textPath href="#sealTop" startOffset="5%">
        ${level===1?'FOUNDATION':level===2?'PROFICIENCY':'COMPETENT DESIGNER'} · CERTIFIED
      </textPath>
    </text>
    <text font-size="6" fill="${c.secondary}" font-family="sans-serif" letter-spacing="1">
      <textPath href="#sealBot" startOffset="12%">STRUCTLEARN PRO · EXCELLENCE</textPath>
    </text>
  </g>

  <!-- Right: Certificate ID + Date + QR placeholder -->
  <rect x="760" y="510" width="80" height="80" fill="${c.primary}" fill-opacity="0.08"
    stroke="${c.primary}" stroke-width="1"/>
  <text x="800" y="556" text-anchor="middle" font-size="8" font-family="sans-serif"
    fill="${c.secondary}">QR VERIFY</text>
  <text x="800" y="568" text-anchor="middle" font-size="6" font-family="sans-serif"
    fill="${c.primary}">${certId}</text>

  <text x="870" y="530" font-size="9" font-family="monospace" fill="${c.primary}">${certId}</text>
  <text x="870" y="545" font-size="8" font-family="sans-serif" fill="${c.secondary}">${dateStr}</text>
  <text x="870" y="558" font-size="7" font-family="sans-serif" fill="${c.secondary}"
    letter-spacing="1">CERTIFICATE ID</text>
  <text x="870" y="574" font-size="7" font-family="sans-serif" fill="${c.primary}">
    ${verifyURL.slice(0,40)}
  </text>
</svg>`;
  return svg;
}

// ── TOAST NOTIFICATION ────────────────────────────────────────
function showCertToast(msg, color='#b8860b') {
  let t = document.getElementById('_cert_toast');
  if(!t) {
    t = document.createElement('div');
    t.id = '_cert_toast';
    t.style.cssText = 'position:fixed;top:70px;right:16px;padding:12px 18px;border-radius:10px;font-size:12px;font-weight:700;font-family:sans-serif;z-index:99999;transition:all 0.3s;opacity:0;transform:translateX(100px);max-width:280px;line-height:1.5;background:#0a0f1e;border:2px solid;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.borderColor = color;
  t.style.color = color;
  t.style.opacity = '1';
  t.style.transform = 'translateX(0)';
  setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(100px)'; }, 5000);
}

// ── LEARNING JOURNEY PANEL ────────────────────────────────────
function buildLearningPanel() {
  const panel = document.createElement('div');
  panel.id = '_cert_panel';
  panel.style.cssText = 'position:fixed;bottom:16px;right:16px;width:220px;background:#0a0f1e;border:1px solid #1e3a8a;border-radius:10px;padding:12px;z-index:9000;font-family:sans-serif;transition:all 0.3s;max-height:calc(100vh - 80px);overflow-y:auto;';

  const hints = [
    "💡 Try changing the seismic zone and observe how column sizes change",
    "💡 What happens when a beam fails? Try fixing it by adjusting inputs",
    "💡 Add a staircase bay and see how adjacent beams are affected",
    "💡 Change concrete grade from M25 to M30 — compare the differences",
    "💡 Try designing a building in Zone V — the highest seismic zone",
    "💡 Run the analysis, note the results, change a span, run again",
    "💡 Open the Columns tab — explore the floor-by-floor summary",
    "💡 Look at the Safety tab — all checks in one place",
  ];
  let hintIdx = 0;

    panel.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
    + '<div style="font-size:11px;font-weight:700;color:#38bdf8">🎓 Learning Journey</div>'
    + '<button id="_cert_panel_toggle" onclick="toggleCertPanel()" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:14px;padding:0">−</button>'
    + '</div>'
    + '<div id="_cert_panel_body">'
    + '<div style="margin-bottom:8px">'
    +   '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'
    +     '<span style="font-size:10px;color:#64748b">Design Confidence</span>'
    +     '<span id="_cert_confidence" style="font-size:11px;font-weight:700;color:#38bdf8">0%</span>'
    +   '</div>'
    +   '<div style="height:6px;background:#1e293b;border-radius:3px;overflow:hidden">'
    +     '<div id="_cert_bar_fill" style="height:100%;width:0%;background:linear-gradient(90deg,#1d4ed8,#38bdf8);border-radius:3px;transition:width 0.5s"></div>'
    +   '</div>'
    + '</div>'
    + '<div id="_cert_level_text" style="font-size:10px;color:#64748b;margin-bottom:8px">Keep exploring...</div>'
    + '<div id="_cert_hint" style="font-size:10px;color:#64748b;line-height:1.5;padding:8px;background:#060f1f;border-radius:6px;margin-bottom:10px;min-height:44px">' + hints[0] + '</div>'
    + '<div style="display:flex;flex-direction:column;gap:5px">'
    +   '<button onclick="startGuidedDesign()" style="width:100%;padding:7px;background:rgba(249,115,22,0.15);border:1px solid #f97316;border-radius:6px;color:#f97316;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">🎯 Guided Design</button>'
    +   '<button onclick="openLearningHub()" style="width:100%;padding:7px;background:rgba(167,139,250,0.15);border:1px solid #a78bfa;border-radius:6px;color:#a78bfa;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">📖 Learning Modules</button>'
    +   '<button onclick="openStudentGuide()" style="width:100%;padding:7px;background:rgba(56,189,248,0.15);border:1px solid #38bdf8;border-radius:6px;color:#38bdf8;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">📚 Student Guide</button>'
    + '</div>'
    + '</div>';

    document.body.appendChild(panel);

  // Rotate hints every 30 seconds
  setInterval(()=>{
    hintIdx = (hintIdx+1) % hints.length;
    const el = document.getElementById('_cert_hint');
    if(el) { el.style.opacity='0'; setTimeout(()=>{ el.textContent=hints[hintIdx]; el.style.opacity='1'; },300); }
    el.style.transition='opacity 0.3s';
  }, 30000);

  _BT.updateProgress();
  // Panel starts expanded
}

function toggleCertPanel() {
  const panel = document.getElementById('_cert_panel');
  const btn = document.getElementById('_cert_panel_toggle');
  const body = document.getElementById('_cert_panel_body');
  if(!body) return;
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? '' : 'none';
  btn.textContent = isHidden ? '−' : '+';
}

// ── CERTIFICATE HUB ───────────────────────────────────────────
function openCertHub() {
  const old = document.getElementById('_cert_hub'); if(old) old.remove();
  const level = _BT.level();
  const hub = document.createElement('div');
  hub.id = '_cert_hub';
  hub.style.cssText = 'position:fixed;inset:0;background:rgba(0,5,20,0.92);z-index:99990;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto;font-family:sans-serif;';

  const certs = JSON.parse(localStorage.getItem('slp_certs')||'[]');
  const earnedLevels = certs.map(c=>c.level);

  // Check lesson completion for each level
  const M1done = LEARNING_MODULES[0].lessons.every(l=>_EDU.isQuizPassed(l.id));
  const M2done = LEARNING_MODULES[1].lessons.every(l=>_EDU.isQuizPassed(l.id));
  const M3done = LEARNING_MODULES[2].lessons.every(l=>_EDU.isQuizPassed(l.id));
  const lessonsDoneForLevel = [false, M1done, M2done, M3done]; // index by level

  const certCards = [1,2,3].map(lv => {
    const earned = earnedLevels.includes(lv);
    const medal = getMedalEmoji(lv);
    const title = lv===1?'Foundation':lv===2?'Proficiency':'Competent';
    const color = lv===1?'#d97706':lv===2?'#94a3b8':'#b8860b';
    const behaviorLocked = lv > level;
    const lessonLocked = !lessonsDoneForLevel[lv];
    const locked = behaviorLocked || lessonLocked;
    const onCooldown = isCoolingDown(lv);
    const att = getAttempts(lv);
    const maxAtt = getMaxAttempts(lv);

    let btn = '';
    if(earned) {
      btn = `<button onclick="showCertificate(${lv})"
        style="width:100%;padding:8px;background:${color};border:none;border-radius:6px;color:white;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:8px">
        ↓ Download Certificate
      </button>`;
    } else if(locked) {
      btn = '<div style="text-align:center;font-size:10px;color:#94a3b8;margin-top:10px;padding:8px;background:rgba(30,41,59,0.5);border-radius:6px;line-height:1.8">'
        + (!lessonsDoneForLevel[lv] ? '<div>📖 Complete all lessons in Module '+lv+' first</div>' : '')
        + (lv > level ? '<div>🎯 Need '+[,'40%','70%','100%'][lv]+' confidence (you have '+_BT.confidence()+'%)</div>' : '')
        + '</div>';
    } else if(onCooldown) {
      const hrs = Math.ceil((getCooldownEnd(lv) - Date.now())/3600000);
      const mins = Math.ceil((getCooldownEnd(lv) - Date.now())/60000);
      const timeStr = hrs >= 1 ? hrs+'h' : mins+'m';
      btn = '<div style="margin-top:10px">'
        + '<div style="text-align:center;padding:10px;background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.3);border-radius:8px;margin-bottom:8px">'
        + '<div style="font-size:16px;margin-bottom:4px">⏰</div>'
        + '<div style="font-size:12px;font-weight:700;color:#fb923c">Cooldown — '+timeStr+' remaining</div>'
        + '<div style="font-size:10px;color:#94a3b8;margin-top:3px">Attempts used: '+att+'/'+maxAtt+'</div>'
        + '</div>'
        + '<div style="font-size:10px;color:#64748b;text-align:center">Come back after the cooldown to retry</div>'
        + '</div>';
    } else if(att > 0) {
      // Has attempted before but not on cooldown — show RETRY prominently
      const remaining = maxAtt - att;
      btn = '<div style="margin-top:10px">'
        + '<div style="text-align:center;padding:8px;background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.25);border-radius:8px;margin-bottom:10px">'
        + '<div style="font-size:11px;color:#f87171;font-weight:700">Attempt '+att+' — Not passed</div>'
        + '<div style="font-size:10px;color:#94a3b8;margin-top:2px">'+remaining+' attempt'+(remaining!==1?'s':'')+' left</div>'
        + '</div>'
        + '<button onclick="startQuiz('+lv+')" style="width:100%;padding:10px;background:linear-gradient(135deg,#dc2626,#b91c1c);border:none;border-radius:8px;color:white;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:0.5px">'
        + '🔄 RETRY QUIZ — Attempt '+(att+1)+'/'+maxAtt
        + '</button>'
        + '</div>';
    } else {
      btn = '<button onclick="startQuiz('+lv+')" style="width:100%;padding:10px;background:linear-gradient(135deg,#1d4ed8,#2563eb);border:none;border-radius:8px;color:white;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:10px">'
        + '📝 Take Certificate Quiz'
        + '</button>';
    }

    return `
    <div style="background:#0a0f1e;border:1.5px solid ${locked?'#1e293b':color};border-radius:10px;padding:16px;flex:1;min-width:200px;opacity:${locked?0.5:1}">
      <div style="font-size:24px;text-align:center;margin-bottom:6px">${earned?medal:locked?'🔒':medal}</div>
      <div style="font-size:13px;font-weight:700;color:${color};text-align:center;margin-bottom:4px">${title}</div>
      <div style="font-size:10px;color:#64748b;text-align:center;margin-bottom:10px">
        ${lv===1?'15 questions · 12 min · Free':lv===2?'20 questions · 20 min · Pro':'25 questions · 35 min · Pro'}
      </div>
      <div style="font-size:10px;color:#64748b;line-height:1.7">
        ${lv===1?'Pass: 10/15 (67%)':lv===2?'Pass: 13/20 (65%)':'Pass: 18/25 (72%)'}
      </div>
      ${btn}
    </div>`;
  }).join('');

  hub.innerHTML = `
  <div style="background:#0a0f1e;border:2px solid #1e40af;border-radius:14px;width:100%;max-width:700px;padding:28px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <div style="font-size:20px;font-weight:900;color:#38bdf8">🏆 My Certificates</div>
      <button onclick="document.getElementById('_cert_hub').remove()"
        style="background:none;border:1px solid #64748b;border-radius:6px;color:#64748b;cursor:pointer;padding:4px 10px;font-size:14px">✕</button>
    </div>
    <div style="font-size:11px;color:#64748b;margin-top:4px;margin-bottom:16px">
      Design Confidence: <strong style="color:#38bdf8">${_BT.confidence()}%</strong> &nbsp;·&nbsp; ${_BT.count()}/10 behaviors
    </div>

    <div style="padding:14px 18px;background:#060f1f;border:1px solid #1e3a8a;border-radius:10px;margin-bottom:20px">
      <div style="font-size:11px;font-weight:700;color:#38bdf8;letter-spacing:1px;margin-bottom:12px">HOW TO EARN YOUR CERTIFICATE</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="display:flex;gap:10px">
          <span style="font-size:20px;flex-shrink:0">📖</span>
          <div><div style="font-size:12px;font-weight:700;color:#f1f5f9;margin-bottom:3px">Step 1 — Complete Lessons</div>
          <div style="font-size:11px;color:#64748b;line-height:1.6">Finish all lessons in the module and pass each lesson quiz. Foundation is free. Proficiency and Competent require Pro.</div></div>
        </div>
        <div style="display:flex;gap:10px">
          <span style="font-size:20px;flex-shrink:0">🎯</span>
          <div><div style="font-size:12px;font-weight:700;color:#f1f5f9;margin-bottom:3px">Step 2 — Use the Design Tool</div>
          <div style="font-size:11px;color:#64748b;line-height:1.6">Explore the app — change seismic zones, fix failures, try different designs. Design Confidence % grows as you explore.</div></div>
        </div>
        <div style="display:flex;gap:10px">
          <span style="font-size:20px;flex-shrink:0">📝</span>
          <div><div style="font-size:12px;font-weight:700;color:#f1f5f9;margin-bottom:3px">Step 3 — Pass Certificate Quiz</div>
          <div style="font-size:11px;color:#64748b;line-height:1.6">Timed quiz, large question bank, anti-cheat enforced. Both requirements must be met before quiz unlocks.</div></div>
        </div>
        <div style="display:flex;gap:10px">
          <span style="font-size:20px;flex-shrink:0">🏆</span>
          <div><div style="font-size:12px;font-weight:700;color:#f1f5f9;margin-bottom:3px">Step 4 — Download and Share</div>
          <div style="font-size:11px;color:#64748b;line-height:1.6">Unique certificate ID, verifiable by anyone. Share on LinkedIn to show your IS 456 competence.</div></div>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:12px;flex-wrap:wrap">${certCards}</div>
  </div>`;

  document.body.appendChild(hub);
}

// ── SHOW CERTIFICATE ─────────────────────────────────────────
function showCertificate(level) {
  const certs = JSON.parse(localStorage.getItem('slp_certs')||'[]');
  const cert = certs.filter(c=>c.level===level).pop();
  if(!cert) return;

  const old = document.getElementById('_cert_view'); if(old) old.remove();
  const view = document.createElement('div');
  view.id = '_cert_view';
  view.style.cssText = 'position:fixed;inset:0;background:rgba(0,5,20,0.95);z-index:99991;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;font-family:sans-serif;overflow-y:auto;';

  const dateStr = new Date(cert.date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  const svg = buildCertificateSVG(level, cert.id, cert.userName, dateStr);

  view.innerHTML = `
  <div style="max-width:900px;width:100%">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div style="font-size:16px;font-weight:700;color:#38bdf8">${getMedalEmoji(level)} ${getCertTitle(level)}</div>
      <div style="display:flex;gap:8px">
        <button onclick="downloadCert(${level})"
          style="padding:8px 18px;background:#1d4ed8;border:none;border-radius:6px;color:white;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">
          ↓ Download PDF
        </button>
        <button onclick="document.getElementById('_cert_view').remove()"
          style="padding:8px 14px;background:transparent;border:1px solid #64748b;border-radius:6px;color:#64748b;cursor:pointer;font-size:12px;font-family:inherit">✕</button>
      </div>
    </div>
    <div style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
      ${svg}
    </div>
    <div style="text-align:center;margin-top:12px;font-size:11px;color:#64748b">
      Certificate ID: <strong style="color:#38bdf8;font-family:monospace">${cert.id}</strong> ·
      Verify at: <strong style="color:#38bdf8">${window.location.origin}/verify.html?id=${cert.id}</strong>
    </div>
  </div>`;

  document.body.appendChild(view);
}

// ── QUIZ ENGINE ───────────────────────────────────────────────
function startQuiz(level) {
  if(isCoolingDown(level)) { showCertToast('Quiz on cooldown. Try later.','#f87171'); return; }
  const att = getAttempts(level);
  if(att >= getMaxAttempts(level)) { showCertToast('Max attempts reached. Cooldown in effect.','#f87171'); return; }

  // Check if pro required
  if(level >= 2 && typeof _userPlan !== 'undefined' && _userPlan !== 'pro') {
    showCertToast('Level 2 & 3 certificates require Pro plan.','#f59e0b');
    if(typeof showUp === 'function') showUp();
    return;
  }

  _QZ.active = true;
  _QZ.level = level;
  _QZ.questions = _QZ.getQuestions(level);
  _QZ.current = 0;
  _QZ.answers = new Array(_QZ.questions.length).fill(-1);
  _QZ.timeLeft = _QZ.timeLimits[level];
  _QZ.tabWarnings = 0;
  _QZ.violations = [];

  // Close hub
  const hub = document.getElementById('_cert_hub'); if(hub) hub.remove();
  const certView = document.getElementById('_cert_view'); if(certView) certView.remove();

  renderQuiz();
  enterFullscreen();
  startQuizTimer();
  startTabDetection();
}

function renderQuiz() {
  const old = document.getElementById('_quiz_screen'); if(old) old.remove();
  const qs = _QZ.questions;
  const ci = _QZ.current;
  const q = qs[ci];
  const level = _QZ.level;
  const color = level===1?'#d97706':level===2?'#94a3b8':'#b8860b';
  const pct = Math.round(((ci)/_QZ.questionCounts[level])*100);

  const screen = document.createElement('div');
  screen.id = '_quiz_screen';
  screen.style.cssText = `
    position:fixed;inset:0;background:#040812;z-index:99999;
    display:flex;flex-direction:column;
    font-family:'Segoe UI',sans-serif;
    user-select:none;-webkit-user-select:none;
  `;

  // Disable right click
  screen.oncontextmenu = e => e.preventDefault();

  const mins = Math.floor(_QZ.timeLeft/60).toString().padStart(2,'0');
  const secs = (_QZ.timeLeft%60).toString().padStart(2,'0');
  const timeColor = _QZ.timeLeft < 60?'#f87171':_QZ.timeLeft < 180?'#f59e0b':color;

  screen.innerHTML = `
  <!-- Quiz Header -->
  <div style="background:#0a0f1e;border-bottom:1px solid #1e293b;padding:10px 20px;display:flex;justify-content:space-between;align-items:center">
    <div style="display:flex;align-items:center;gap:12px">
      <div style="font-size:13px;font-weight:700;color:${color}">${getMedalEmoji(level)} Level ${level} Quiz</div>
      <div style="font-size:11px;color:#64748b">Question ${ci+1} of ${qs.length}</div>
    </div>
    <div style="display:flex;align-items:center;gap:16px">
      <div id="_quiz_timer" style="font-size:18px;font-weight:900;color:${timeColor};font-family:monospace">${mins}:${secs}</div>
      <div style="font-size:10px;color:#64748b">${_QZ.tabWarnings > 0 ? `⚠ ${_QZ.tabWarnings} warning(s)`:''}</div>
    </div>
  </div>

  <!-- Progress bar -->
  <div style="height:3px;background:#1e293b">
    <div style="height:100%;width:${pct}%;background:${color};transition:width 0.3s"></div>
  </div>

  <!-- Topic -->
  <div style="padding:8px 24px;background:#060f1f;border-bottom:1px solid #0f1a2e">
    <span style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:2px">Topic: ${q.topic}</span>
  </div>

  <!-- Question -->
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:24px 40px;max-width:760px;margin:0 auto;width:100%">
    <div style="font-size:16px;color:#f1f5f9;line-height:1.7;margin-bottom:28px;font-weight:500">
      ${q.q}
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      ${q.shuffled.opts.map((opt, i) => {
        const selected = _QZ.answers[ci] === i;
        return `<button onclick="selectAnswer(${i})"
          style="text-align:left;padding:14px 18px;border-radius:8px;cursor:pointer;font-size:13px;font-family:inherit;
          border:1.5px solid ${selected?color:'#1e3a8a'};
          background:${selected?`rgba(${level===1?'217,119,6':level===2?'100,116,139':'184,134,11'},0.15)`:'rgba(30,58,138,0.15)'};
          color:${selected?color:'#94a3b8'};
          transition:all 0.15s;">
          <span style="display:inline-block;width:22px;height:22px;border-radius:50%;
            border:2px solid ${selected?color:'#64748b'};margin-right:12px;vertical-align:middle;
            background:${selected?color:'transparent'};transition:all 0.15s;"></span>
          ${String.fromCharCode(65+i)}. ${opt}
        </button>`;
      }).join('')}
    </div>
  </div>

  <!-- Navigation -->
  <div style="padding:16px 40px;background:#0a0f1e;border-top:1px solid #1e293b;display:flex;justify-content:space-between;align-items:center">
    <button onclick="quizNav(-1)" ${ci===0?'disabled':''} style="padding:9px 20px;border-radius:7px;border:1px solid #64748b;background:transparent;color:${ci===0?'#1e293b':'#94a3b8'};cursor:${ci===0?'default':'pointer'};font-size:12px;font-family:inherit">← Previous</button>

    <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;max-width:400px">
      ${qs.map((_,i)=>`<div onclick="jumpToQ(${i})"
        style="width:22px;height:22px;border-radius:4px;cursor:pointer;font-size:9px;display:flex;align-items:center;justify-content:center;font-weight:700;
        background:${i===ci?color:_QZ.answers[i]>=0?'rgba(52,211,153,0.2)':'#0f172a'};
        border:1px solid ${i===ci?color:_QZ.answers[i]>=0?'#34d399':'#1e293b'};
        color:${i===ci?'white':_QZ.answers[i]>=0?'#34d399':'#64748b'}">${i+1}</div>`).join('')}
    </div>

    ${ci < qs.length-1
      ? `<button onclick="quizNav(1)" style="padding:9px 20px;border-radius:7px;border:none;background:${color};color:white;cursor:pointer;font-size:12px;font-weight:700;font-family:inherit">Next →</button>`
      : `<button onclick="submitQuiz()" style="padding:9px 20px;border-radius:7px;border:none;background:#15803d;color:white;cursor:pointer;font-size:12px;font-weight:700;font-family:inherit">Submit Quiz ✓</button>`
    }
  </div>`;

  document.body.appendChild(screen);
}

function selectAnswer(idx) {
  _QZ.answers[_QZ.current] = idx;
  renderQuiz();
}
function quizNav(dir) { _QZ.current += dir; renderQuiz(); }
function jumpToQ(idx) { _QZ.current = idx; renderQuiz(); }

function startQuizTimer() {
  if(_QZ.timer) clearInterval(_QZ.timer);
  _QZ.timer = setInterval(()=>{
    _QZ.timeLeft--;
    const el = document.getElementById('_quiz_timer');
    if(el) {
      const m = Math.floor(_QZ.timeLeft/60).toString().padStart(2,'0');
      const s = (_QZ.timeLeft%60).toString().padStart(2,'0');
      el.textContent = m+':'+s;
      el.style.color = _QZ.timeLeft<60?'#f87171':_QZ.timeLeft<180?'#f59e0b':'inherit';
    }
    if(_QZ.timeLeft <= 0) {
      clearInterval(_QZ.timer);
      showCertToast('⏰ Time is up! Submitting quiz...','#f87171');
      setTimeout(submitQuiz, 1500);
    }
  }, 1000);
}

function startTabDetection() {
  document.addEventListener('visibilitychange', handleTabSwitch);
}
function handleTabSwitch() {
  if(!_QZ.active) return;
  if(document.hidden) {
    _QZ.tabWarnings++;
    _QZ.logViolation('tab_switch');
    if(_QZ.tabWarnings === 1) {
      showCertToast('⚠️ Warning: You left the quiz tab! 30 seconds deducted.','#f87171');
      _QZ.timeLeft = Math.max(0, _QZ.timeLeft - 30);
    } else {
      showCertToast('❌ Second violation: Quiz auto-submitted!','#f87171');
      setTimeout(submitQuiz, 1500);
    }
    renderQuiz();
  }
}

function enterFullscreen() {
  const el = document.documentElement;
  if(el.requestFullscreen) el.requestFullscreen().catch(()=>{});
  document.addEventListener('fullscreenchange', handleFullscreenChange);
}
function handleFullscreenChange() {
  if(!_QZ.active || document.fullscreenElement) return;
  _QZ.fullscreenWarnings++;
  _QZ.logViolation('fullscreen_exit');
  showCertToast('⚠️ Please stay in fullscreen during the quiz!','#f59e0b');
  if(_QZ.fullscreenWarnings > 2) {
    showCertToast('❌ Repeated fullscreen exits: Quiz auto-submitted!','#f87171');
    setTimeout(submitQuiz, 1500);
  }
}

function submitQuiz() {
  if(!_QZ.active) return;
  clearInterval(_QZ.timer);
  _QZ.active = false;
  document.removeEventListener('visibilitychange', handleTabSwitch);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  if(document.exitFullscreen && document.fullscreenElement) document.exitFullscreen();

  // Score
  const qs = _QZ.questions;
  let score = 0;
  qs.forEach((q, i) => {
    if(_QZ.answers[i] === q.shuffled.correctIdx) score++;
  });

  const pass = score >= _QZ.passMark[_QZ.level];
  const level = _QZ.level;

  // Update attempts
  const att = getAttempts(level) + 1;
  setAttempts(level, att);
  if(!pass) setCooldown(level);

  // Track quiz attempt
  try {
    _TRACK.emit('cert_quiz_attempt', {
      level: level,
      score: score,
      total: qs.length,
      pass: pass,
      attempt: att
    });
    if(pass) {
      _TRACK.emit('cert_earned', { level: level });
    }
    _TRACK.flushSession();
  } catch(e) {}

  showQuizResult(score, qs.length, pass, level, att);
}

function showQuizResult(score, total, pass, level, attempts) {
  const old = document.getElementById('_quiz_screen'); if(old) old.remove();
  const color = level===1?'#d97706':level===2?'#94a3b8':'#b8860b';
  const pct = Math.round((score/total)*100);

  const result = document.createElement('div');
  result.id = '_quiz_result';
  result.style.cssText = 'position:fixed;inset:0;background:#040812;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:sans-serif;';

  let certSection = '';
  if(pass) {
    // Generate certificate
    const userName = (typeof P !== 'undefined' && P?.full_name) || 'Student';
    const certId = generateCertId(level);
    saveCertificate(level, certId, userName);
    certSection = `
    <div style="margin-top:16px;padding:14px;background:rgba(${level===1?'217,119,6':level===2?'100,116,139':'184,134,11'},0.1);border:1px solid ${color};border-radius:8px;text-align:center">
      <div style="font-size:13px;font-weight:700;color:${color};margin-bottom:4px">${getMedalEmoji(level)} Certificate Generated!</div>
      <div style="font-size:11px;color:#64748b;margin-bottom:10px">ID: <span style="font-family:monospace;color:${color}">${certId}</span></div>
      <button onclick="showCertificate(${level});document.getElementById('_quiz_result').remove()"
        style="padding:8px 20px;background:${color};border:none;border-radius:6px;color:white;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">
        ↓ Download Certificate
      </button>
    </div>`;
  }

  const maxAtt = getMaxAttempts(level);
  const attLeft = pass ? 0 : maxAtt - attempts;
  const cooldownHrs = pass ? 0 : getCooldownHours(level, attempts);

  result.innerHTML = `
  <div style="background:#0a0f1e;border:2px solid ${pass?'#15803d':'#991b1b'};border-radius:14px;padding:32px;max-width:480px;width:100%;text-align:center">
    <div style="font-size:48px;margin-bottom:12px">${pass?'🎉':'😔'}</div>
    <div style="font-size:22px;font-weight:900;color:${pass?'#34d399':'#f87171'};margin-bottom:6px">
      ${pass?'Quiz Passed!':'Quiz Not Passed'}
    </div>
    <div style="font-size:32px;font-weight:900;color:${color};margin-bottom:4px">${score}/${total}</div>
    <div style="font-size:13px;color:#64748b;margin-bottom:16px">${pct}% · Pass mark: ${Math.round((_QZ.passMark[level]/total)*100)}%</div>
    ${pass?'':`
    <div style="font-size:11px;color:#f87171;margin-bottom:12px;padding:10px;background:rgba(248,113,113,0.08);border-radius:6px">
      ${attLeft > 0
        ? `You have ${attLeft} attempt(s) remaining before ${cooldownHrs}hr cooldown.`
        : `Cooldown started: ${cooldownHrs} hours before next attempt. Use this time to study!`}
    </div>`}
    ${certSection}
    ${!pass?`
    <div style="margin-top:14px;font-size:11px;color:#64748b;line-height:1.6">
      💡 Review the report tabs carefully, especially the WHY? buttons.<br>
      The questions are based on what the app shows and explains.
    </div>`:''}
    <button onclick="document.getElementById('_quiz_result').remove();openCertHub()"
      style="width:100%;margin-top:16px;padding:10px;border:1px solid #64748b;border-radius:7px;background:transparent;color:#94a3b8;cursor:pointer;font-size:12px;font-family:inherit">
      Back to Certificate Hub
    </button>
  </div>`;

  document.body.appendChild(result);
}

// ── DOWNLOAD CERT AS PNG ─────────────────────────────────────
function downloadCert(level) {
  const certs = JSON.parse(localStorage.getItem('slp_certs')||'[]');
  const cert = certs.filter(c=>c.level===level).pop();
  if(!cert) return;
  const dateStr = new Date(cert.date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  const svg = buildCertificateSVG(level, cert.id, cert.userName, dateStr);
  const blob = new Blob([svg], {type:'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `StructLearnPro_${cert.id}.svg`;
  a.click(); URL.revokeObjectURL(url);
  showCertToast('Certificate downloaded as SVG! Open in browser to print as PDF.', '#34d399');
}

// ── INIT ─────────────────────────────────────────────────────
(function initCertSystem(){
  // Wait for DOM
  window.addEventListener('load', () => {
    setTimeout(() => {
      buildLearningPanel();
      _BT.startTimeTracker();
    }, 2000);
  });
})();


// Hook into existing functions — deferred to after all code loads
window.addEventListener('load', function() {
  // Hook go() to track tab views
  if(typeof go === 'function') {
    const _origGo = go;
    window.go = function(n) {
      _origGo(n);
      if(n === 7) _BT.onTab('overview');
    };
  }

  // Hook showSec to track report tabs
  if(typeof showSec === 'function') {
    const _origShowSec = showSec;
    window.showSec = function(tab) {
      _origShowSec(tab);
      _BT.onTab(tab);
    };
  }

  // Hook setBayType to track bay changes
  if(typeof setBayType === 'function') {
    const _origSetBayType = setBayType;
    window.setBayType = function(row, col, type) {
      _origSetBayType(row, col, type);
      _BT.onBayChange(type);
    };
  }

  // Hook runNow to track analysis
  if(typeof runNow === 'function') {
    const _origRunNow = runNow;
    runNow = function() {
      _origRunNow();
      setTimeout(() => {
        if(typeof RES !== 'undefined' && RES) {
          _BT.onAnalysis(RES, S);
        }
      }, 1500);
    };
  }
});

// ══════════════════════════════════════════════════════════════
// EDUCATION SYSTEM — Student Guide + Learning Modules + Guided Design
// ══════════════════════════════════════════════════════════════

const GUIDE_CHAPTERS = [
{id:'ch1',icon:'🏗',title:'How Buildings Stand',subtitle:'Load path — the most important concept in structural engineering',color:'#38bdf8',
sections:[
{heading:'What holds a building up?',content:'Every building is a system of connected members — slabs, beams, columns and footings — each passing load to the next. This chain is called the <strong>load path</strong>. Understanding it is the foundation of structural engineering.<br><br>Think of it like this: a book sitting on a table pushes down on the table top, which pushes down on the legs, which push into the floor. A building works exactly the same way — just with people, furniture and concrete instead of books and wood.'},
{heading:'The load path in a building',content:'<strong>Step 1 — Slab:</strong> People and furniture sit on the floor slab. The slab carries this load and bends slightly, transferring it to the beams at its edges.<br><br><strong>Step 2 — Beams:</strong> Beams collect load from the slabs on either side and carry it to the columns at their ends. Beams bend under load — this bending is what we design for.<br><br><strong>Step 3 — Columns:</strong> Columns carry load from all the beams connected to them, plus all the floors above. A ground floor column in a 4-storey building carries the combined weight of 4 floors.<br><br><strong>Step 4 — Footings:</strong> Footings spread the column load over a large area of soil. The bigger the load, the bigger the footing needed.',diagram:'load_path'},
{heading:'Why this matters for your design',content:'In StructLearn Pro, when you draw the building plan and run analysis, the software follows this exact load path. It calculates how much load each member carries and sizes it accordingly. If you remove a column, the beam above must carry that extra load — this is why removing columns requires a <strong>transfer beam</strong>.<br><br>Every number in your report traces back to this load path. Once you understand it, the results make sense.',is_code:'IS 456:2000 Cl 22 — Methods of analysis'}
]},
{id:'ch2',icon:'📐',title:'The Building Grid',subtitle:'Columns, bays and spans — setting up your plan',color:'#f97316',
sections:[
{heading:'What is the structural grid?',content:'The structural grid is a regular pattern of columns. In StructLearn Pro, you see this as rows (A, B, C...) and columns (1, 2, 3...). The rectangular areas between four columns are called <strong>bays</strong>.<br><br>The distance between two column lines is the <strong>span</strong>. A span of 3.5m means the beam connecting two columns is 3.5m long. This single number — span — controls almost every other design decision.'},
{heading:'How span affects everything',content:'<strong>Longer span = deeper beam.</strong> A beam spanning 6m needs roughly twice the depth of a beam spanning 3m. This is because deflection increases with the cube of the span.<br><br><strong>Typical spans for residential buildings:</strong><br>• 3.0 to 4.0m — ideal, economical<br>• 4.0 to 5.5m — acceptable, beams get deeper<br>• Above 5.5m — expensive, needs careful design',is_code:'IS 456 Cl 23.2 — Control of deflection'},
{heading:'Corner, edge and interior columns',content:'Not all columns carry equal load. The amount of slab area a column supports — its <strong>tributary area</strong> — determines its load.<br><br><strong>Corner column:</strong> Supports one quarter of one bay. Carries least load.<br><strong>Edge column:</strong> Supports one quarter of two bays. Carries moderate load.<br><strong>Interior column:</strong> Supports one quarter of four bays. Carries most load.<br><br>This is why interior columns are always larger than corner columns in tall buildings.',diagram:'tributary'}
]},
{id:'ch3',icon:'🔲',title:'Slab Design',subtitle:'Two-way, one-way, cases and reinforcement',color:'#38bdf8',
sections:[
{heading:'Two-way vs one-way slab',content:'A slab carries load in the direction of its shorter span. When ly/lx ≤ 2, the slab bends in both directions — this is a <strong>two-way slab</strong>. When ly/lx > 2, it bends mainly in one direction — a <strong>one-way slab</strong>.<br><br><strong>Example:</strong> Bay of 3m × 4m → ly/lx = 1.33 ≤ 2 → Two-way slab.<br>Bay of 3m × 7m → ly/lx = 2.33 > 2 → One-way slab.',is_code:'IS 456 Cl 24.1 — Determination of bending moments'},
{heading:'IS 456 Table 26 Cases',content:'For two-way slabs, the bending moment depends on which edges are continuous and which are discontinuous.<br><br><strong>Case 1:</strong> All four edges continuous — interior panel. Lowest moments.<br><strong>Case 4:</strong> Two adjacent edges discontinuous — corner panel. Highest moments.<br><br>StructLearn Pro automatically detects the case from your beam end conditions.',is_code:'IS 456 Table 26 — Bending moment coefficients'},
{heading:'Understanding bar spacing',content:'When the report says <strong>D10@185mm c/c</strong>, it means:<br>• <strong>D10</strong> — 10mm diameter deformed bar<br>• <strong>@185mm</strong> — one bar every 185mm<br>• <strong>c/c</strong> — centre to centre<br><br>Closer spacing = more steel = stronger slab but more cost. Maximum spacing: 3d or 300mm, whichever is less.',is_code:'IS 456 Cl 26.3.3 — Maximum distance between bars'}
]},
{id:'ch4',icon:'🔶',title:'Beam Design',subtitle:'Depth, moment, shear and deflection explained',color:'#f97316',
sections:[
{heading:'Why beam depth is governed by deflection',content:'This surprises most students. You might expect the beam to be sized for bending moment — but <strong>deflection controls depth</strong> for most beams.<br><br>IS 456 limits the span/depth ratio. For a continuous beam this ratio is 26 (depth ≥ span/26). For simply supported it is 20.<br><br><strong>Example:</strong> Beam spanning 5m continuous → minimum depth = 5000/26 = 192mm. If you used less, the beam would sag visibly and crack the finishes below.',is_code:'IS 456 Cl 23.2 — Control of deflection'},
{heading:'Bending moment — what it physically means',content:'When a beam carries load, it bends. The top gets compressed, the bottom gets stretched. Concrete is strong in compression but weak in tension — so we put <strong>steel bars at the bottom</strong> to carry the tension.<br><br>For a uniformly distributed load w on span L:<br>• Simply supported: Mu = wL²/8<br>• Both ends continuous midspan: Mu = wL²/16<br><br>Continuity halves the midspan moment — this is why continuous beams need less steel.',is_code:'IS 456 Table 12 — Bending moment coefficients'},
{heading:'Shear and stirrups',content:'Shear failure is dangerous — it happens suddenly without warning. At beam ends, the beam wants to slide vertically. <strong>Stirrups</strong> (closed links) prevent this.<br><br>Near supports: stirrups closely spaced.<br>At midspan: stirrups can be further apart.<br><br>IS 13920 requires closely spaced stirrups at beam ends in seismic zones — the <strong>confinement zone</strong>.',is_code:'IS 456 Cl 40 — Shear | IS 13920 Cl 6.3'}
]},
{id:'ch5',icon:'🏛',title:'Column Design',subtitle:'Axial load, minimum size and seismic detailing',color:'#a78bfa',
sections:[
{heading:'How columns carry load',content:'Columns are primarily <strong>compression members</strong>. A ground floor column in a G+3 building carries load from all 4 floors above. This cumulative load is why ground floor columns are always the most critical.<br><br>The design ensures concrete and steel together can carry the total factored load: Pu ≤ 0.4×fck×Ac + 0.67×fy×Asc',is_code:'IS 456 Cl 39 — Limit state of compression'},
{heading:'Why all columns are minimum 300mm',content:'IS 13920:2016 Clause 7.1 mandates a <strong>minimum column dimension of 300mm</strong> in seismic zones III, IV and V.<br><br>The reason is ductility. A 200mm column cannot provide adequate confinement zone for the stirrups required by IS 13920. Columns must deform without collapsing during an earthquake.',is_code:'IS 13920 Cl 7.1.1 — Dimensional requirements'},
{heading:'Confinement zone',content:'At the top and bottom of each column, IS 13920 requires closely spaced ties — the <strong>confinement zone</strong>. Tie spacing here: B/4 or 75mm, whichever is less.<br><br>Why so close at the ends? The highest bending and shear during an earthquake occurs at column ends. Close ties prevent concrete splitting and bar buckling.',is_code:'IS 13920 Cl 7.4 — Transverse reinforcement'}
]},
{id:'ch6',icon:'🏗',title:'Footing Design',subtitle:'Soil pressure, punching shear and bending',color:'#fbbf24',
sections:[
{heading:'Why footings spread the load',content:'Soil can only carry limited pressure — the <strong>Safe Bearing Capacity (SBC)</strong>. A 600kN column on a 300×300mm base gives 6,667 kN/m² — far exceeding any soil capacity.<br><br><strong>Required footing area = Column load / Net SBC</strong><br>For 600kN and SBC=200 kN/m²: Area = 3.0m² → 1.73m × 1.73m footing.',is_code:'IS 6403 — Bearing capacity of shallow foundations'},
{heading:'Punching shear — the critical check',content:'The column tries to punch through the footing slab. The concrete resists along a perimeter at d/2 from the column face.<br><br><strong>bo = 4 × (column size + d)</strong><br><strong>Stress = Vu / (bo × d)</strong><br><strong>Permissible = 0.25√fck</strong><br><br>If punching fails: increase footing depth d. This rapidly reduces the stress.',is_code:'IS 456 Cl 31.6.2 — Punching shear'},
{heading:'Net SBC — why it reduces with depth',content:'<strong>Net SBC = Gross SBC − γ × depth</strong><br>For SBC=200, γ=18, depth=1.5m: Net SBC = 200 − 27 = <strong>173 kN/m²</strong><br><br>Always use net SBC for sizing the footing. Using gross SBC overestimates capacity and gives an unsafe design.'}
]},
{id:'ch7',icon:'🌍',title:'Seismic Design',subtitle:'Zones, base shear, IS 1893 and ductile detailing',color:'#f87171',
sections:[
{heading:'Why seismic design exists',content:'Earthquakes create horizontal forces. A building designed only for gravity loads can collapse in an earthquake because it has no horizontal resistance.<br><br>IS 1893 force depends on:<br>• Seismic zone (II to V)<br>• Soil type (soft soil amplifies more)<br>• Building weight<br>• Building height (taller = longer time period)',is_code:'IS 1893:2016 Part 1 — Earthquake resistant design'},
{heading:'Base shear',content:'Total horizontal force at building base = <strong>V = Ah × W</strong><br><br>Ah = (Z/2) × (I/R) × (Sa/g)<br>W = Dead load + 25% of live load<br><br>This force is distributed over height — more to upper floors. The ground floor column carries the full accumulated base shear.',is_code:'IS 1893 Cl 7.6 — Design seismic base shear'},
{heading:'IS 13920 — ductile detailing',content:'The building must deform under seismic force without collapsing — <strong>ductility</strong>.<br><br>IS 13920 rules:<br>• Minimum column 300mm<br>• Confinement zones at beam/column ends<br>• 135° hooks on stirrups<br>• Fe500D steel<br>• Strong column — weak beam principle<br><br><strong>Strong column — weak beam:</strong> Beams yield first, absorbing energy. Columns stay intact.',is_code:'IS 13920:2016 — Ductile detailing of RC structures'}
]},
{id:'ch8',icon:'📊',title:'Reading Your Report',subtitle:'How to use StructLearn Pro results professionally',color:'#34d399',
sections:[
{heading:'First thing to check — the Safety tab',content:'When results load, go to the <strong>Safety tab first</strong>. This gives a single pass/fail verdict for every member.<br><br><strong>Common failures:</strong><br>• Beam deflection fail → increase slab thickness or reduce span<br>• Beam shear fail → increase beam width b<br>• Column fail → increase column size or concrete grade<br>• Punching shear fail → increase footing depth'},
{heading:'How to fix a failing member',content:'<strong>Step 1:</strong> Identify failing member (red in Safety tab)<br><strong>Step 2:</strong> Go to that member\'s tab<br><strong>Step 3:</strong> Read which check failed<br><strong>Step 4:</strong> Click WHY? button for the fix<br><strong>Step 5:</strong> Change inputs<br><strong>Step 6:</strong> Run analysis again<br><strong>Step 7:</strong> Confirm failure resolved<br><br>This iterative process is exactly what professional structural engineers do.'},
{heading:'What the report does NOT cover',content:'StructLearn Pro checks strength and deflection. It does NOT check:<br>• Foundation settlement over time<br>• Wind on cladding and facades<br>• Durability in aggressive environments<br>• Fire resistance<br>• Dynamic effects from machinery<br><br>For any real construction, all of these need a licensed structural engineer. This software is for learning and preliminary design only.',is_code:'IS 456 Cl 8 — Durability | IS 456 Cl 16 — Fire resistance'}
]}
];


const LEARNING_MODULES = [
{
  id:'M1', level:'foundation', color:'#d97706', icon:'🥉',
  title:'Foundation Module',
  subtitle:'Learn the basics of RC structural design',
  free: true,
  lessons:[
    {
      id:'L1_1', title:'How Buildings Stand — The Load Path',
      duration:'5 min read',
      theory:`<h3>Every load has a journey</h3>
<p>When you stand in a room, your weight travels through the floor, into the beams below, then into the columns, and finally into the ground through the footings. This journey is called the <strong>load path</strong>.</p>
<p>As a structural engineer, your job is to make sure every member on this journey is strong enough to carry the load safely.</p>
<h3>The four members</h3>
<p><strong>Slab</strong> — The floor you stand on. Spans between beams. Carries people, furniture and its own weight.</p>
<p><strong>Beam</strong> — A horizontal member that collects load from slabs and carries it to columns. Beams bend under load.</p>
<p><strong>Column</strong> — A vertical member. Carries load from all floors above. Columns are compressed — they get shorter under load.</p>
<p><strong>Footing</strong> — Spreads the column load over a large area of soil so the soil does not fail under pressure.</p>
<h3>The key insight</h3>
<p>Nothing is isolated. Every member affects every other. If you make a bay larger, the beam spanning it must be deeper. If you add a floor, every column below must be larger. This interconnection is what makes structural engineering both challenging and fascinating.</p>`,
      practice:`Open the Design Tool. Look at the building plan canvas. You will see the column grid — dots connected by lines. Each dot is a column, each line is a beam, and each rectangular area is a bay where the slab sits. Spend 2 minutes just looking at the layout and identifying these four members.`,
      task:'view_report',
      quiz:[
        {q:'What is the "load path" in a building?',opts:['The route construction workers take','The chain of members through which loads travel from slab to ground','The direction wind blows','The path of electrical wiring'],ans:1},
        {q:'Which member carries load directly from the soil pressure?',opts:['Slab','Beam','Column','Footing'],ans:3},
        {q:'What happens to a beam when it carries load?',opts:['It gets shorter','It gets longer','It bends','It rotates'],ans:2},
      ]
    },
    {
      id:'L1_2', title:'Setting Up Your Building — Project Info and Plan',
      duration:'8 min + practice',
      theory:`<h3>Before you design, you must define</h3>
<p>A structural design is meaningless without context. The same 4-storey building in Seismic Zone II needs completely different design than in Zone V. You must tell the software exactly what you are designing.</p>
<h3>Key inputs that change everything</h3>
<p><strong>Number of floors:</strong> Each additional floor adds load to every column below. A G+4 building's ground floor column carries 5 times more than the top floor column.</p>
<p><strong>Floor height:</strong> Taller floors mean taller columns, which means more wall load on beams, and a longer time period for seismic calculations.</p>
<p><strong>Seismic zone:</strong> This single choice can change your column steel by 50%. Zone V buildings need much more robust detailing than Zone II.</p>
<p><strong>Span lengths:</strong> This is your most powerful design choice. Shorter spans mean smaller beams, thinner slabs, smaller columns and smaller footings. Span is the master variable.</p>
<h3>The rule of thumb for spans</h3>
<p>For a typical residential building, spans between 3.0m and 4.0m give the most economical design. Below 3.0m, you have too many columns. Above 4.5m, beams become very deep and costly.</p>`,
      practice:`Go to Project Info (Step 1) and set up a G+2 residential building in your city. Then go to Plan and Spans (Step 2). Set a 2×2 grid with spans of 3.5m × 3.0m. This represents a modest 2-bedroom apartment floor plate.`,
      task:'setup_plan',
      quiz:[
        {q:'A G+3 building has how many floors total?',opts:['3','4','5','6'],ans:1},
        {q:'Which span range is most economical for residential buildings?',opts:['1-2m','3-4m','5-6m','7-8m'],ans:1},
        {q:'Which single input most affects beam depth?',opts:['Number of floors','Seismic zone','Span length','Concrete grade'],ans:2},
      ]
    },
    {
      id:'L1_3', title:'Loads — What Are We Designing For?',
      duration:'6 min read',
      theory:`<h3>Types of loads</h3>
<p><strong>Dead load (DL)</strong> — Permanent loads that never change. Self weight of concrete (25 kN/m³), floor finish, brick walls. These are always present.</p>
<p><strong>Live load (LL)</strong> — Variable loads from people and furniture. For residential floors: 2.0 kN/m² (IS 875 Part 2). This means 200 kg per square metre — imagine a crowded room.</p>
<p><strong>Seismic load</strong> — Horizontal force from earthquakes. Calculated from IS 1893 based on building weight and zone.</p>
<h3>The load factor — why we multiply by 1.5</h3>
<p>We never design for the exact calculated load. We multiply by a <strong>load factor of 1.5</strong> to account for uncertainty. Real loads might be higher than calculated. Materials might be slightly weaker than specified. The factor gives us a safety margin.</p>
<p>Factored load wu = 1.5 × (DL + LL)</p>
<p>This is the load we actually design for — the <strong>design load</strong>.</p>
<h3>Wall load — often forgotten</h3>
<p>Brick walls sitting on beams create a significant line load. A 230mm thick wall, 2.8m tall (floor height minus slab) has a load of approximately: 0.23 × 2.8 × 19 = 12.2 kN/m. This is often the dominant load on perimeter beams.</p>`,
      practice:`Go to Loads (Step 3). Enter LL = 2.0 kN/m² for floors, 1.5 kN/m² for roof. Floor finish = 1.0 kN/m². Leave wall load as auto-calculated. Look at the wall load value — it should be around 10-14 kN/m.`,
      task:'enter_loads',
      quiz:[
        {q:'What is the standard live load for residential floors per IS 875?',opts:['1.0 kN/m²','1.5 kN/m²','2.0 kN/m²','3.0 kN/m²'],ans:2},
        {q:'Why do we multiply loads by 1.5?',opts:['To make the design more expensive','To account for uncertainty and provide a safety margin','Because IS 456 requires it always','To reduce the beam size'],ans:1},
        {q:'Wall load is a type of which load?',opts:['Live load','Dead load','Seismic load','Wind load'],ans:1},
      ]
    },
    {
      id:'L1_4', title:'Run Your First Analysis and Read the Results',
      duration:'10 min practice',
      theory:`<h3>What happens when you run analysis?</h3>
<p>The software follows the load path you learned about. Starting from the slab, it calculates how much load each member carries and sizes each member to carry it safely.</p>
<p>The order is: Slab → Staircase → Beams → Columns → Footings → Seismic</p>
<h3>Reading the Overview tab</h3>
<p>The Overview gives you a quick summary of your building. Key things to note:<br>
• Total seismic weight (how heavy your building is)<br>
• Critical members — which beam, column or footing has the highest utilisation<br>
• Overall status — does everything pass?</p>
<h3>The most important number — utilisation ratio</h3>
<p>A utilisation ratio of 0.85 means the member is using 85% of its capacity. Between 0.6 and 0.9 is ideal — the member is working hard but has a safe margin. Below 0.5 it is over-designed (wasteful). Above 1.0 it has failed.</p>`,
      practice:`Go to Step 6 and click Run Analysis. Wait for the results to load. Then click through each report tab — Overview, Slab, Beams, Columns, Footings. Do not worry about understanding everything yet. Just look at the colours — green means pass, red means fail. Note which members pass and which fail.`,
      task:'run_analysis',
      quiz:[
        {q:'What utilisation ratio indicates an over-designed member?',opts:['0.2','0.75','0.95','1.1'],ans:0},
        {q:'Which tab should you check first after analysis?',opts:['Beams','Slab','Safety','Footings'],ans:2},
        {q:'A utilisation ratio above 1.0 means?',opts:['Member is very strong','Member has failed — unsafe','Member is efficient','Member needs more data'],ans:1},
      ]
    }
  ]
},
{
  id:'M2', level:'proficiency', color:'#64748b', icon:'🥈',
  title:'Proficiency Module',
  subtitle:'Understand why — not just what',
  free: false,
  lessons:[
    {
      id:'L2_1', title:'Multi-Floor Buildings — Cumulative Loads',
      duration:'7 min read',
      theory:`<h3>Load accumulates floor by floor</h3>
<p>In a single-storey building, the ground floor column carries only the loads from that one floor. In a G+3 building, the ground floor column carries loads from all 4 floors — plus wall loads from all 4 storeys, plus its own weight.</p>
<p>This is why the column schedule in your report shows different steel percentages on each floor. The ground floor has the most load and needs the most steel. The roof floor has the least load and may need only the minimum steel.</p>
<h3>The C-5 floor-by-floor summary</h3>
<p>In the Columns tab, click any column and scroll to section C-5. This shows the cumulative load at every floor level. Watch how Ps (service load) decreases as you go up. The ground floor column carries everything — the roof column carries only its one floor.</p>
<h3>Why column size stays the same</h3>
<p>In practice, changing column size at every floor creates construction problems — workers must change formwork on every floor. Engineers often keep the same size throughout and reduce the steel as load decreases. Some buildings use 2-floor groupings — same size for every 2 floors.</p>`,
      practice:`Design a G+3 building and compare the steel percentage of the ground floor interior column vs the roof floor interior column. How much does it reduce? Now compare the footing sizes of a corner column vs interior column. The difference should be significant.`,
      task:'compare_floors',
      quiz:[
        {q:'Why does a ground floor column carry more load than a top floor column?',opts:['Ground floor is stronger','It carries cumulative load from all floors above','Ground floor concrete is denser','The soil adds load'],ans:1},
        {q:'Why do engineers keep the same column size on all floors?',opts:['It is always required by code','To simplify construction formwork','It is cheaper concrete','Upper floors need more steel'],ans:1},
        {q:'In the C-5 summary, load is highest at which floor?',opts:['Roof','Top floor','Mid height','Ground floor'],ans:3},
      ]
    },
    {
      id:'L2_2', title:'Seismic Zones — What Actually Changes',
      duration:'8 min read',
      theory:`<h3>The zone factor Z</h3>
<p>India is divided into 4 seismic zones (II to V). Zone V covers areas of highest seismic risk — Himalayan region, parts of Northeast India, Andaman & Nicobar. Zone II is the lowest risk.<br>
Zone II: Z=0.10 | Zone III: Z=0.16 | Zone IV: Z=0.24 | Zone V: Z=0.36</p>
<h3>How zone affects your design</h3>
<p>The base shear V = Ah × W, where Ah includes Z/2. Going from Zone II to Zone V triples the seismic coefficient. This means:<br>
• Larger columns (more steel for combined axial + seismic moment)<br>
• More stirrups in beams and columns<br>
• IS 13920 ductile detailing becomes mandatory<br>
• Minimum column size becomes 300mm</p>
<h3>The experiment to try</h3>
<p>Design the same building in Zone II. Note the base shear, column steel and beam stirrup spacing. Now change to Zone V and rerun. Compare the results. This single experiment teaches you more than reading 10 textbook pages.</p>`,
      practice:`Take your G+2 design from Module 1. Run it in Zone II. Note the base shear, typical column steel percentage, and stirrup spacing. Then change to Zone V and rerun. Write down what changed and by how much.`,
      task:'compare_zones',
      quiz:[
        {q:'Which seismic zone has the highest risk in India?',opts:['Zone II','Zone III','Zone IV','Zone V'],ans:3},
        {q:'Zone factor Z for Zone IV is?',opts:['0.10','0.16','0.24','0.36'],ans:2},
        {q:'IS 13920 ductile detailing is mandatory in which zones?',opts:['All zones','Zone II only','Zone III IV and V','Zone V only'],ans:2},
      ]
    },
    {
      id:'L2_3', title:'Design Iteration — Fixing Failures',
      duration:'10 min practice',
      theory:`<h3>All first designs have failures</h3>
<p>Every experienced structural engineer knows: the first run always has something that fails. Design is an iterative process — you run, check, fix, rerun. The skill is knowing which change fixes which failure.</p>
<h3>The most common failures and their fixes</h3>
<p><strong>Beam deflection fail:</strong> The beam is too shallow. Fix: increase slab thickness D, or reduce span by adding a secondary beam at midspan.</p>
<p><strong>Beam shear fail:</strong> The beam is overloaded for its width. Fix: increase beam width b. Shear capacity is proportional to b × d.</p>
<p><strong>Column fail:</strong> Load exceeds capacity. Fix: increase column size, or increase concrete grade (fck). The latter adds less concrete but costs more.</p>
<p><strong>Footing punching fail:</strong> Footing too thin. Fix: increase footing depth. This rapidly improves punching — both the perimeter bo and the depth d increase.</p>
<h3>The economy of design</h3>
<p>More steel and bigger sections always work — but the best design is the one that uses the minimum material while safely carrying all loads. Over-designed members waste money and material.</p>`,
      practice:`Deliberately create a failing design: reduce your beam span to just 2m (very short — slabs can span this without beams). Or increase live load to 20 kN/m² (industrial floor). Run analysis, see the failures. Then fix them one by one and rerun after each fix.`,
      task:'fix_failure',
      quiz:[
        {q:'Your beam fails in deflection. What is the most direct fix?',opts:['Add more steel','Increase beam depth D','Change concrete grade','Increase span'],ans:1},
        {q:'Your footing punching check fails. What should you increase?',opts:['Footing plan size','Footing depth','Column size only','Steel in footing'],ans:1},
        {q:'Why is over-designing wasteful?',opts:['It always fails later','It uses unnecessary material and cost','It violates IS 456','It increases seismic load'],ans:1},
      ]
    },
    {
      id:'L2_4', title:'Irregular Buildings — Voids Cantilevers and Stairs',
      duration:'8 min read',
      theory:`<h3>Real buildings are never perfectly regular</h3>
<p>Textbooks show neat rectangular buildings. Real buildings have courtyards, open-to-sky areas, staircase openings, balconies and removed columns. Each irregularity has structural consequences.</p>
<h3>Void and courtyard bays</h3>
<p>When a bay has no slab (void or courtyard), the adjacent beams get no slab load from that side. Their tributary load is halved on one side. But the columns still need to support whatever is above — the next floor may have a slab in that bay.</p>
<p>In seismic weight calculation: void bays are excluded. This reduces the base shear — counterintuitively, removing a floor slab reduces the seismic force on that floor.</p>
<h3>Cantilever beams — the balcony</h3>
<p>A cantilever beam is fixed at one end and free at the other. The bending moment is maximum at the fixed end (not midspan as in simply supported beams): Mu = wL²/2 for UDL. This is why long balconies need very deep beams at the connection to the main structure.</p>
<h3>Staircase bays</h3>
<p>The staircase bay has no flat floor slab. Instead, an inclined waist slab carries the steps. The waist slab is designed separately, and its reaction load is added to the adjacent beams. When you mark a bay as staircase in StructLearn Pro, the software handles all of this automatically.</p>`,
      practice:`Add a void bay to your design (mark one bay as Void in the Bay Type mode). Rerun analysis. Compare the column loads adjacent to the void — they should be lower than before. Then add a cantilever to one edge column and rerun. See how the cantilever beam design differs from a regular beam.`,
      task:'irregular_design',
      quiz:[
        {q:'A void bay in the building plan — how does it affect seismic weight?',opts:['Increases it','Reduces it — no slab mass','No effect','Doubles adjacent floor weight'],ans:1},
        {q:'For a cantilever beam with UDL, maximum moment occurs at?',opts:['Free end','Midspan','Fixed end','Quarter point'],ans:2},
        {q:'When a bay is marked as staircase, the flat slab is?',opts:['Thicker than normal','Same as normal slab','Not designed — waist slab replaces it','Designed as one-way'],ans:2},
      ]
    }
  ]
},
{
  id:'M3', level:'competent', color:'#b8860b', icon:'🥇',
  title:'Competent Module',
  subtitle:'Professional-level design judgment',
  free: false,
  lessons:[
    {
      id:'L3_1', title:'IS 13920 — Ductile Detailing in Practice',
      duration:'9 min read',
      theory:`<h3>Why ductility saves lives</h3>
<p>A brittle material breaks suddenly without warning. A ductile material deforms significantly before breaking — giving people time to evacuate. Reinforced concrete can be made ductile through proper detailing.</p>
<p>During the 2001 Bhuj earthquake, many RC buildings collapsed because their columns had inadequate confinement. Buildings with IS 13920 detailing performed dramatically better.</p>
<h3>The five key IS 13920 rules for beams</h3>
<p>1. Minimum 2 bars top and bottom throughout<br>
2. Maximum steel ratio at any section: 2.5%<br>
3. Confinement zone at each end: 2d from face or span/4, whichever is more<br>
4. In confinement zone, stirrup spacing: d/4 or 8× smallest bar diameter<br>
5. 135° hooks on stirrups — not 90° as in non-seismic design</p>
<h3>The five key IS 13920 rules for columns</h3>
<p>1. Minimum dimension: 300mm<br>
2. Minimum steel: 0.8% of Ag<br>
3. Confinement zone at each end: Lo = max(larger column dim, span/6, 450mm)<br>
4. In confinement zone, tie spacing: B/4 or 75mm, whichever is less<br>
5. No lap splices in confinement zone</p>`,
      practice:`Look at your column report section C-4 (Confinement). Note the tie spacing inside vs outside the confinement zone. The difference should be significant. Also check the beam report section B-5 (Shear) — note how stirrup spacing changes near the support vs at midspan.`,
      task:'check_confinement',
      quiz:[
        {q:'IS 13920 maximum stirrup spacing in column confinement zone?',opts:['100mm','B/4 or 75mm whichever less','150mm','d/2'],ans:1},
        {q:'Hook angle for stirrups in seismic zones per IS 13920?',opts:['90°','90° or 135°','135° mandatory','180°'],ans:2},
        {q:'Confinement zone length at column end: minimum of?',opts:['Only 450mm','Larger dim or span/6 or 450mm — whichever is most','150mm only','d from face'],ans:1},
      ]
    },
    {
      id:'L3_2', title:'Foundation Design — Soil and Structure Interaction',
      duration:'8 min read',
      theory:`<h3>The soil is a structural material</h3>
<p>Most engineers think of soil as just the thing footings sit on. But soil is actually the last structural member in the load path — it has its own capacity that must not be exceeded.</p>
<h3>What SBC means physically</h3>
<p>Safe Bearing Capacity (SBC) is the pressure the soil can safely carry without excessive settlement or shear failure. It varies enormously:<br>
• Soft clay, filled ground: 50-100 kN/m²<br>
• Medium dense sand: 100-200 kN/m²<br>
• Dense gravel: 200-400 kN/m²<br>
• Hard rock: 3000-10000 kN/m²</p>
<p>The SBC should come from a soil investigation report (bore log + laboratory tests). If you do not have one, use conservative values.</p>
<h3>Settlement — the other failure mode</h3>
<p>Even if soil stress is within SBC, excessive settlement can damage the building. Differential settlement — where one column settles more than another — causes cracking and distress. Soft soil buildings almost always need a differential settlement check, which is beyond the scope of StructLearn Pro.</p>`,
      practice:`Change the SBC in your design from 200 kN/m² to 100 kN/m² (soft soil) and rerun. How do the footing sizes change? Now try 300 kN/m² (hard soil). Note how footing size is inversely proportional to SBC.`,
      task:'vary_sbc',
      quiz:[
        {q:'SBC of soft clay is approximately?',opts:['500-800 kN/m²','200-400 kN/m²','50-100 kN/m²','1000+ kN/m²'],ans:2},
        {q:'If SBC doubles, footing area?',opts:['Doubles','Halves','Stays the same','Increases by 4'],ans:1},
        {q:'Differential settlement causes?',opts:['Higher seismic force','Cracking due to unequal column settlement','Deeper footings','Larger beams'],ans:1},
      ]
    },
    {
      id:'L3_3', title:'Complete Professional Design — Putting It All Together',
      duration:'15 min practice',
      theory:`<h3>A professional design checklist</h3>
<p>Before calling a design complete, a professional structural engineer checks:<br><br>
<strong>1. All members pass</strong> — No red in Safety tab.<br>
<strong>2. No member is grossly over-designed</strong> — Utilisation above 0.5 for all members.<br>
<strong>3. Seismic detailing complete</strong> — IS 13920 requirements met if in Zone III+.<br>
<strong>4. Footing depth adequate</strong> — Below frost line (not relevant in India) and firm soil.<br>
<strong>5. Column sizes practical</strong> — Same size throughout or logical grouping.<br>
<strong>6. Slab thickness consistent</strong> — Not varying wildly bay to bay.<br>
<strong>7. Report reviewed</strong> — Every section checked, not just Safety tab.</p>
<h3>The judgment calls</h3>
<p>The software gives you the minimum required. Practical design adds judgment:<br>
• Round beam depths to nearest 25mm (easier formwork: 300, 325, 350 not 317mm)<br>
• Use the same beam size for similar spans (simplifies construction)<br>
• Keep column sizes consistent per 2 floors minimum<br>
• Specify standard bar diameters (8, 10, 12, 16, 20, 25, 32mm) — not odd sizes</p>`,
      practice:`Design a complete G+3 residential building with: 3×3 grid, spans 3.5m × 3.0m, Zone IV, M25 concrete, Fe500D steel, SBC 150 kN/m². Include a staircase bay. Achieve a design where all members pass and no member is below 50% utilisation. Download the full PDF report.`,
      task:'complete_design',
      quiz:[
        {q:'What is the minimum acceptable utilisation ratio for an efficient design?',opts:['0.1','0.3','0.5','0.9'],ans:2},
        {q:'Why do engineers round beam depth to nearest 25mm?',opts:['Code requirement','Easier formwork and construction','Stronger concrete','Less steel needed'],ans:1},
        {q:'Standard bar diameters in India include (select all common ones)?',opts:['7mm, 11mm, 13mm','8mm, 10mm, 12mm, 16mm, 20mm','9mm, 14mm, 18mm','Only 20mm and 25mm'],ans:1},
      ]
    }
  ]
}
];


// ── MODULE PROGRESS TRACKING ──────────────────────────────────
const _EDU = {
  getProgress() {
    try { return JSON.parse(localStorage.getItem('slp_edu_progress')||'{}'); } catch(e){ return {}; }
  },
  saveProgress(data) {
    const merged = {...this.getProgress(),...data};
    localStorage.setItem('slp_edu_progress', JSON.stringify(merged));
    // Sync to Supabase via parent (cross-device persistence)
    _EDU._syncToCloud();
  },
  _syncToCloud() {
    try {
      const progress = this.getProgress();
      // Get cert quiz attempts from localStorage
      const quizAttempts = {};
      [1,2,3].forEach(function(lv){
        const att = parseInt(localStorage.getItem('slp_quiz_att_'+lv)||'0');
        const cd  = localStorage.getItem('slp_quiz_cd_'+lv)||'0';
        quizAttempts[lv] = {attempts:att, cooldownEnd:cd};
      });
      window.parent.postMessage({
        type: 'SAVE_PROGRESS',
        progress: {
          lessons:      progress,
          behaviors:    (_BT && typeof _BT.export==='function') ? _BT.export() : {},
          quizAttempts: quizAttempts,
          confidence:   _BT ? _BT.confidence() : 0
        }
      }, '*');
    } catch(e) {}
  },
  isLessonComplete(lessonId) { return !!this.getProgress()[lessonId+'_done']; },
  isQuizPassed(lessonId)    { return !!this.getProgress()[lessonId+'_quiz']; },
  completeLesson(lessonId)  { this.saveProgress({[lessonId+'_done']:true}); },
  passQuiz(lessonId)        { this.saveProgress({[lessonId+'_quiz']:true}); },
  getModuleProgress(moduleId) {
    const mod = LEARNING_MODULES.find(m=>m.id===moduleId);
    if(!mod) return 0;
    const done = mod.lessons.filter(l=>this.isLessonComplete(l.id)&&this.isQuizPassed(l.id)).length;
    return Math.round((done/mod.lessons.length)*100);
  }
};

// ── STUDENT GUIDE UI ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
// STUDENT GUIDE — COMPLETE EXPANDED VERSION
// 8 Chapters, Full IS 456 Reference
// ══════════════════════════════════════════════════════════════

const VISUAL_CHAPTERS = [

// ═══════════════════════════════════════════════════════════════
// CHAPTER 1 — HOW BUILDINGS STAND
// ═══════════════════════════════════════════════════════════════
{
  id:'ch1', icon:'🏗', title:'How Buildings Stand', color:'#38bdf8',
  subtitle:'Load path, load types, and the role of reinforced concrete',
  visual:`<svg viewBox="0 0 420 240" style="width:100%;max-width:420px;display:block;margin:12px auto">
    <rect x="30" y="200" width="360" height="16" rx="4" fill="#1e3a8a" opacity="0.6"/>
    <text x="210" y="228" text-anchor="middle" fill="#38bdf8" font-size="10" font-family="sans-serif">SOIL — transfers load to ground</text>
    <rect x="65" y="162" width="76" height="38" rx="3" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" stroke-width="1.5"/>
    <rect x="172" y="162" width="76" height="38" rx="3" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" stroke-width="1.5"/>
    <rect x="279" y="162" width="76" height="38" rx="3" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" stroke-width="1.5"/>
    <text x="103" y="185" text-anchor="middle" fill="#fbbf24" font-size="9" font-family="sans-serif">FOOTING</text>
    <text x="210" y="185" text-anchor="middle" fill="#fbbf24" font-size="9" font-family="sans-serif">FOOTING</text>
    <text x="317" y="185" text-anchor="middle" fill="#fbbf24" font-size="9" font-family="sans-serif">FOOTING</text>
    <rect x="98" y="82" width="10" height="80" rx="2" fill="rgba(167,139,250,0.3)" stroke="#a78bfa" stroke-width="1.5"/>
    <rect x="205" y="82" width="10" height="80" rx="2" fill="rgba(167,139,250,0.3)" stroke="#a78bfa" stroke-width="1.5"/>
    <rect x="312" y="82" width="10" height="80" rx="2" fill="rgba(167,139,250,0.3)" stroke="#a78bfa" stroke-width="1.5"/>
    <text x="65" y="125" fill="#a78bfa" font-size="9" font-family="sans-serif">COLUMN</text>
    <rect x="52" y="72" width="316" height="12" rx="3" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="1.5"/>
    <text x="210" y="68" text-anchor="middle" fill="#f97316" font-size="9" font-family="sans-serif">BEAM — bends, transfers to columns</text>
    <rect x="52" y="18" width="316" height="52" rx="4" fill="rgba(56,189,248,0.08)" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4"/>
    <text x="210" y="42" text-anchor="middle" fill="#38bdf8" font-size="9" font-family="sans-serif">SLAB — people and furniture here</text>
    <text x="210" y="54" text-anchor="middle" fill="#38bdf8" font-size="8" font-family="sans-serif">Dead load + Live load + Seismic</text>
    <path d="M210 16 L210 4" stroke="#f87171" stroke-width="2" marker-end="url(#arrdn)"/>
    <text x="210" y="2" text-anchor="middle" fill="#f87171" font-size="9" font-family="sans-serif">LOAD ↓</text>
    <defs><marker id="arrdn" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 Z" fill="#f87171"/></marker></defs>
    <text x="395" y="135" text-anchor="end" fill="#64748b" font-size="8" font-family="sans-serif">LOAD</text>
    <text x="395" y="145" text-anchor="end" fill="#64748b" font-size="8" font-family="sans-serif">PATH ↓</text>
  </svg>`,
  sections:[
    {
      heading:'The Four Structural Members',
      is_code:'IS 456:2000 Cl 22 — Methods of analysis',
      content:`Every reinforced concrete building has four structural members that work together to carry all loads safely to the ground. <strong style="color:#38bdf8">Slab</strong> — the floor you walk on, spans between beams, carries people and furniture. <strong style="color:#f97316">Beam</strong> — collects load from slabs on either side and carries it to columns at each end. Beams bend under load — the bottom is in tension, the top in compression. <strong style="color:#a78bfa">Column</strong> — vertical member, carries load from all floors above. Ground floor columns carry the most — the cumulative weight of everything above. <strong style="color:#fbbf24">Footing</strong> — spreads the concentrated column load over a large area of soil so soil pressure stays within safe limits.`
    },
    {
      heading:'Three Types of Loads',
      is_code:'IS 875 Parts 1-3, IS 1893:2016',
      content:`<strong style="color:#34d399">Dead Load (DL)</strong> — Permanent loads that never change. Self-weight of concrete (25 kN/m³), brick walls, floor finish, waterproofing. Always present. Calculated from dimensions and unit weights. <br><br><strong style="color:#f97316">Live Load (LL)</strong> — Variable loads from people, furniture, equipment. IS 875 Part 2 specifies: Residential 2.0 kN/m², Offices 4.0 kN/m², Libraries 7.5 kN/m². Must be included even when building appears empty — future use may be different. <br><br><strong style="color:#f87171">Seismic Load</strong> — Horizontal force during earthquakes. Calculated from IS 1893 based on zone, soil type, building weight and height. Can govern design in Zones IV and V.`
    },
    {
      heading:'The Load Factor — Why We Multiply by 1.5',
      is_code:'IS 456:2000 Cl 36.4 — Partial safety factors',
      content:`We never design for the exact calculated load. We multiply by a partial safety factor of <strong style="color:#38bdf8">1.5</strong> for the combination of dead load + live load.<br><br>Factored load wu = 1.5 × (DL + LL)<br><br>Why 1.5? Because: (1) actual loads may be higher than estimated, (2) material strengths may be slightly lower than specified, (3) construction tolerances introduce errors, (4) our structural models are simplified approximations of reality. The factor 1.5 gives a safety margin that covers all these uncertainties. This is called the <em>Limit State Method</em> of design.`
    },
    {
      heading:'Why Reinforced Concrete — Not Plain Concrete or Steel Alone',
      is_code:'IS 456:2000 Cl 5 — Assumptions in design',
      content:`Plain concrete is <strong>strong in compression but very weak in tension</strong> — only about 10% of its compressive strength. A beam bends under load, creating tension at the bottom. Plain concrete beams would crack and fail at the bottom almost immediately.<br><br>Steel is strong in both tension and compression but expensive and requires fire protection and corrosion protection on its own.<br><br>Reinforced concrete combines the best of both: concrete handles the compression, steel bars handle the tension. Together they work as a composite material — far stronger than either alone. The bond between steel and concrete is what makes RC work — the two materials deform together.`
    },
    {
      heading:'Stiffness vs Strength — Two Different Things',
      content:`Students often confuse these. <strong style="color:#38bdf8">Strength</strong> is how much load a member can carry before failure. <strong style="color:#f97316">Stiffness</strong> is how much it deflects under a given load — a stiff member deflects less.<br><br>A member can be strong but flexible (like a thin steel cable — holds huge loads but deflects a lot) or stiff but not very strong (like a thick rubber block — barely deflects but fails at low load).<br><br>In IS 456 design, we check both: the member must be <em>strong enough</em> (moment capacity ≥ factored moment) AND <em>stiff enough</em> (span/depth ratio within limits). Deflection is often the governing criterion for beams and slabs.`
    },
    {
      heading:'What IS 456 Covers — and What It Does Not',
      is_code:'IS 456:2000 Scope',
      content:`IS 456 covers the design and construction of plain and reinforced concrete structures for buildings. It covers: beam design, slab design, column design, footing design, cover requirements, durability, and construction practices.<br><br>IS 456 does NOT cover: earthquake-resistant detailing (IS 13920), wind load calculation (IS 875 Part 3), seismic force calculation (IS 1893), prestressed concrete (IS 1343), pile foundations (IS 2911). A complete building design requires all these codes together.`,
      mistake:'Common mistake: Using IS 456 alone for seismic zones. In Zone III, IV, V you must also follow IS 13920 for ductile detailing — without this, a building designed per IS 456 can still collapse in an earthquake.'
    },
  ]
},

// ═══════════════════════════════════════════════════════════════
// CHAPTER 2 — THE BUILDING GRID
// ═══════════════════════════════════════════════════════════════
{
  id:'ch2', icon:'📐', title:'The Building Grid', color:'#f97316',
  subtitle:'Columns, bays, spans, irregularities and their structural effects',
  visual:`<svg viewBox="0 0 380 220" style="width:100%;max-width:380px;display:block;margin:12px auto">
    <line x1="60" y1="30" x2="60" y2="180" stroke="#1e3a8a" stroke-width="1" stroke-dasharray="3"/>
    <line x1="160" y1="30" x2="160" y2="180" stroke="#1e3a8a" stroke-width="1" stroke-dasharray="3"/>
    <line x1="260" y1="30" x2="260" y2="180" stroke="#1e3a8a" stroke-width="1" stroke-dasharray="3"/>
    <line x1="40" y1="50" x2="290" y2="50" stroke="#1e3a8a" stroke-width="1" stroke-dasharray="3"/>
    <line x1="40" y1="130" x2="290" y2="130" stroke="#1e3a8a" stroke-width="1" stroke-dasharray="3"/>
    <rect x="53" y="43" width="14" height="14" rx="2" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="1.5"/>
    <rect x="153" y="43" width="14" height="14" rx="2" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="1.5"/>
    <rect x="253" y="43" width="14" height="14" rx="2" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="1.5"/>
    <rect x="53" y="123" width="14" height="14" rx="2" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="1.5"/>
    <rect x="153" y="123" width="14" height="14" rx="2" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="1.5"/>
    <rect x="253" y="123" width="14" height="14" rx="2" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="1.5"/>
    <text x="110" y="44" text-anchor="middle" fill="#f97316" font-size="9" font-family="sans-serif">3.5m</text>
    <text x="207" y="44" text-anchor="middle" fill="#f97316" font-size="9" font-family="sans-serif">3.5m</text>
    <text x="43" y="92" text-anchor="middle" fill="#f97316" font-size="9" font-family="sans-serif">3m</text>
    <text x="110" y="92" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="sans-serif">Bay A1</text>
    <text x="207" y="92" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="sans-serif">Bay A2</text>
    <text x="110" y="160" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="sans-serif">Bay B1</text>
    <text x="207" y="160" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="sans-serif">Bay B2</text>
    <text x="60" y="200" text-anchor="middle" fill="#34d399" font-size="8" font-family="sans-serif">CORNER</text>
    <text x="160" y="200" text-anchor="middle" fill="#fbbf24" font-size="8" font-family="sans-serif">EDGE</text>
    <text x="260" y="200" text-anchor="middle" fill="#34d399" font-size="8" font-family="sans-serif">CORNER</text>
    <rect x="295" y="40" width="80" height="100" rx="4" fill="#060f1f" stroke="#1e293b" stroke-width="1"/>
    <text x="335" y="56" text-anchor="middle" fill="#38bdf8" font-size="8" font-family="sans-serif" font-weight="700">Tributary Area</text>
    <text x="335" y="70" text-anchor="middle" fill="#34d399" font-size="8" font-family="sans-serif">Corner: A/4</text>
    <text x="335" y="83" text-anchor="middle" fill="#fbbf24" font-size="8" font-family="sans-serif">Edge: A/2</text>
    <text x="335" y="96" text-anchor="middle" fill="#f87171" font-size="8" font-family="sans-serif">Interior: A</text>
    <text x="335" y="109" text-anchor="middle" fill="#94a3b8" font-size="7" font-family="sans-serif">(A = one bay area)</text>
  </svg>`,
  sections:[
    {
      heading:'How to Choose Grid Dimensions',
      is_code:'IS 456:2000 Cl 23.2 — Deflection control (span limits)',
      content:`The structural grid should follow the architectural room layout — columns typically sit at room corners. Ideal span lengths for different building types: <strong>Residential rooms:</strong> 3.0-4.5m (economical, thin slabs, modest beams). <strong>Living/dining areas:</strong> 4.5-6.0m (deeper beams needed, acceptable cost). <strong>Commercial office floors:</strong> 6.0-8.0m (significant beam depth, consider secondary beams). <strong>Parking basements:</strong> 7.5-9.0m (may require post-tensioning). <strong>Shopping malls:</strong> 8-15m (special structural systems needed).<br><br>The rule: shorter spans always give more economical designs. Every doubling of span increases beam moment by 4× and required depth by about 1.7×.`
    },
    {
      heading:'Tributary Area — Who Carries What Load',
      is_code:'IS 456:2000 Cl 22 — Analysis of structures',
      content:`Each column carries the load from its <strong>tributary area</strong> — the floor area it effectively supports. Think of it as drawing lines midway between adjacent columns; the enclosed area belongs to that column.<br><br><strong>Corner column:</strong> supports ¼ of one bay → carries least load.<br><strong>Edge column:</strong> supports ½ of two bays → carries moderate load.<br><strong>Interior column:</strong> supports ¼ of four bays → carries maximum load — typically 4× a corner column.<br><br>This is why interior columns are always larger. In a 4m × 5m grid, an interior column has 20m² of tributary area, while a corner column has only 5m².`
    },
    {
      heading:'Secondary Beams — When and Why',
      content:`When a bay is large (say 5m × 8m), the slab spanning 8m would need to be very thick. Instead, a <strong>secondary beam</strong> is added at midspan of the 8m direction, reducing effective slab span to 4m. The secondary beam then frames into the main beams at its ends.<br><br>Secondary beams transfer their load as concentrated point loads onto the main beams — this must be accounted for in main beam design. Secondary beams are also used to support heavy partition walls, water tanks, or mechanical equipment that creates concentrated loads on the slab.`
    },
    {
      heading:'Transfer Beams — When Columns Are Removed',
      content:`Sometimes a column needed structurally does not suit the architectural plan (it would sit in the middle of a room or block a view). The solution: a <strong>transfer beam</strong> — a very deep, heavily reinforced beam that carries the column load from above and transfers it to adjacent columns at its ends.<br><br>Transfer beams are expensive and complex. They are typically 600-1200mm deep. The columns above them are called <em>floating columns</em> — common in Indian mixed-use buildings where the ground floor is commercial with an open plan, and upper floors are residential with more columns.`,
      mistake:'Common mistake: Assuming floating columns are always wrong. They are acceptable if properly designed with a transfer beam. The mistake is using floating columns without designing the transfer beam — this has caused collapses.'
    },
    {
      heading:'Soft Storey — The Most Dangerous Irregularity',
      is_code:'IS 1893:2016 Cl 7.1 — Irregularity',
      content:`A <strong>soft storey</strong> occurs when one floor is significantly more flexible (less stiff) than the floors above and below it. The most common cause: ground floor without masonry infill walls (open for parking or commercial use) while upper floors have brick walls providing lateral stiffness.<br><br>During an earthquake, the soft storey concentrates almost all the lateral displacement into that one floor. Columns in that storey must deform far more than designed for — they fail by shear or combined bending-shear collapse.<br><br>IS 1893 defines soft storey as one where lateral stiffness is less than 70% of the storey above, or less than 80% of average of three storeys above. Such buildings require special analysis and design.`
    },
    {
      heading:'Torsional Irregularity — When the Building Twists',
      is_code:'IS 1893:2016 Cl 7.1 — Plan irregularity',
      content:`Every building has two important points in plan: the <strong>Centre of Mass (CM)</strong> — where the total weight effectively acts — and the <strong>Centre of Rigidity (CR)</strong> — where the lateral stiffness is concentrated.<br><br>When CM and CR do not coincide (as in L-shaped buildings, buildings with setbacks, or buildings with asymmetric walls), earthquake forces create a <em>torsional moment</em> in addition to lateral forces. Corner columns and edge frames get much higher forces than expected from a pure lateral analysis.<br><br>IS 1893 requires that the distance between CM and CR be minimised through symmetric structural planning. When unavoidable, 3D dynamic analysis is required.`
    },
  ]
},

// ═══════════════════════════════════════════════════════════════
// CHAPTER 3 — SLAB DESIGN
// ═══════════════════════════════════════════════════════════════
{
  id:'ch3', icon:'🔲', title:'Slab Design', color:'#38bdf8',
  subtitle:'Two-way, one-way, deflection, minimum steel, staircase and crack control',
  visual:`<svg viewBox="0 0 400 200" style="width:100%;max-width:400px;display:block;margin:12px auto">
    <text x="90" y="16" text-anchor="middle" fill="#34d399" font-size="10" font-family="sans-serif" font-weight="700">TWO-WAY (ly/lx ≤ 2)</text>
    <rect x="15" y="22" width="150" height="100" rx="4" fill="rgba(56,189,248,0.06)" stroke="#38bdf8" stroke-width="1.5"/>
    <line x1="20" y1="62" x2="160" y2="62" stroke="#38bdf8" stroke-width="1.5"/>
    <line x1="20" y1="72" x2="160" y2="72" stroke="#f97316" stroke-width="1.5"/>
    <line x1="20" y1="82" x2="160" y2="82" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="90" y="58" text-anchor="middle" fill="#38bdf8" font-size="8" font-family="sans-serif">bars along lx (short)</text>
    <line x1="55" y1="27" x2="55" y2="118" stroke="#a78bfa" stroke-width="1.5"/>
    <line x1="75" y1="27" x2="75" y2="118" stroke="#a78bfa" stroke-width="1.5"/>
    <line x1="95" y1="27" x2="95" y2="118" stroke="#a78bfa" stroke-width="1.5"/>
    <text x="90" y="132" text-anchor="middle" fill="#94a3b8" font-size="8" font-family="sans-serif">3m × 4m | ratio 1.33</text>
    <text x="90" y="142" text-anchor="middle" fill="#34d399" font-size="8" font-family="sans-serif">Bends BOTH ways ✓</text>
    <text x="295" y="16" text-anchor="middle" fill="#f87171" font-size="10" font-family="sans-serif" font-weight="700">ONE-WAY (ly/lx > 2)</text>
    <rect x="220" y="22" width="150" height="100" rx="4" fill="rgba(248,113,113,0.06)" stroke="#f87171" stroke-width="1.5"/>
    <line x1="225" y1="55" x2="365" y2="55" stroke="#38bdf8" stroke-width="2.5"/>
    <line x1="225" y1="70" x2="365" y2="70" stroke="#38bdf8" stroke-width="2.5"/>
    <line x1="225" y1="85" x2="365" y2="85" stroke="#38bdf8" stroke-width="2.5"/>
    <text x="295" y="51" text-anchor="middle" fill="#38bdf8" font-size="8" font-family="sans-serif">MAIN bars (short span)</text>
    <line x1="265" y1="27" x2="265" y2="118" stroke="#64748b" stroke-width="0.8" stroke-dasharray="3"/>
    <line x1="305" y1="27" x2="305" y2="118" stroke="#64748b" stroke-width="0.8" stroke-dasharray="3"/>
    <line x1="345" y1="27" x2="345" y2="118" stroke="#64748b" stroke-width="0.8" stroke-dasharray="3"/>
    <text x="295" y="132" text-anchor="middle" fill="#94a3b8" font-size="8" font-family="sans-serif">3m × 7m | ratio 2.33</text>
    <text x="295" y="142" text-anchor="middle" fill="#f87171" font-size="8" font-family="sans-serif">Bends SHORT way only</text>
    <text x="200" y="175" text-anchor="middle" fill="#64748b" font-size="8" font-family="sans-serif">--- Distribution bars in long span (0.12% of bd)</text>
    <text x="200" y="190" text-anchor="middle" fill="#38bdf8" font-size="8" font-family="sans-serif">━ Main bars in short span (designed for moment)</text>
  </svg>`,
  sections:[
    {
      heading:'Two-Way vs One-Way Slab — The Fundamental Distinction',
      is_code:'IS 456:2000 Cl 24 — Slabs spanning in two directions',
      content:`When the longer span (ly) is less than twice the shorter span (lx), the slab bends in both directions — this is a <strong>two-way slab</strong>. The load is shared between both sets of reinforcement. More efficient — requires less steel and smaller depth than a one-way slab for the same span.<br><br>When ly/lx > 2, almost all bending occurs in the short span direction. This is a <strong>one-way slab</strong>. Main bars run in the short direction. Distribution bars (minimum 0.12% of bd) run in the long direction — not for moment resistance but to distribute the load and control cracking.<br><br>Example: 3m × 4m bay → ratio = 1.33 → two-way. 3m × 7m bay → ratio = 2.33 → one-way.`
    },
    {
      heading:'IS 456 Table 26 — Moment Coefficients for Two-Way Slabs',
      is_code:'IS 456:2000 Table 26 — Bending moment coefficients',
      content:`IS 456 Table 26 gives <strong>moment coefficients (α)</strong> based on: the ly/lx ratio and the edge conditions (which edges are continuous and which are discontinuous).<br><br>Bending moment: Mx = αx × wu × lx² (short span moment)<br>My = αy × wu × lx² (long span moment)<br><br>Edge conditions — Nine cases in IS 456: Case 1 (all four edges continuous — interior panel, lowest moments) through Case 9 (various combinations). StructLearn Pro automatically determines the case from your beam layout. A corner panel with two free edges gets Case 4 — highest αx values and needs the most steel.`
    },
    {
      heading:'Deflection Control — Why Depth Often Governs',
      is_code:'IS 456:2000 Cl 23.2 — Control of deflection',
      content:`The deflection of a slab must be limited to prevent damage to finishes, partitions and ceilings below. IS 456 sets basic span/effective depth ratios for deflection control:<br><br>Simply supported: l/d ≤ 20. One end continuous: l/d ≤ 26. Both ends continuous: l/d ≤ 26. Cantilever: l/d ≤ 7.<br><br>These values assume normal steel stress levels. They can be modified by the modification factor based on actual steel area provided vs required. Typically the span/depth check governs slab thickness in residential buildings — not the bending moment. This is why a 3m span slab is often 120mm thick even though 100mm would carry the moment.`,
      mistake:'Common mistake: Designing slab thickness only for moment capacity and ignoring the deflection check. This leads to slabs that crack the tiles and plaster below them even though they technically do not fail structurally.'
    },
    {
      heading:'Minimum and Maximum Steel — Why Both Limits Exist',
      is_code:'IS 456:2000 Cl 26.5.2 — Minimum reinforcement in slabs',
      content:`<strong>Minimum steel (0.12% of bd for Fe500)</strong> — Even if the calculated moment is very small, we must provide this minimum. Why? Concrete shrinks as it cures and temperature changes cause expansion/contraction. Without minimum steel, these movements crack the concrete. The minimum steel controls shrinkage and temperature cracking — it has nothing to do with structural load.<br><br><strong>Maximum steel</strong> — IS 456 limits tension steel to control ductility. Over-reinforced sections fail suddenly in compression without warning. Under-reinforced sections give visible deflection before failure — much safer. For slabs, maximum steel is typically 4% but practically limited by spacing requirements.`
    },
    {
      heading:'Waist Slab Design — Staircase is Different',
      content:`The staircase bay has no flat floor slab. Instead, an inclined <strong>waist slab</strong> carries the treads and risers. The waist slab is designed as a simply supported or continuous one-way slab spanning between the landing beams at top and bottom.<br><br>Key difference: The waist slab load per unit horizontal plan area is amplified by the cosine of the slope angle. A stair with 150mm risers, 280mm treads has slope angle ≈ 28°. The self weight of a 150mm waist slab on plan = (0.15 × 25) / cos(28°) = 4.25 kN/m² — higher than the same slab on a flat floor. Plus the step weight (solid concrete of steps) adds another 2-3 kN/m².`
    },
    {
      heading:'Crack Width and Durability',
      is_code:'IS 456:2000 Cl 35.3 — Crack control',
      content:`Cracks in reinforced concrete are <strong>inevitable and acceptable</strong> up to a limit. IS 456 limits surface crack width to 0.3mm under service loads for normal exposure, 0.2mm for severe exposure. Cracks at this width are too small to see clearly and do not affect structural performance or steel corrosion significantly.<br><br>What causes cracks: excessive deflection under load, plastic shrinkage during curing, temperature changes, insufficient cover, improper curing. Controlling crack width means: providing adequate cover, using appropriate bar spacing (IS 456 Cl 26.3.3 limits bar spacing to 3d or 300mm), proper curing for 14 days minimum.`
    },
  ]
},

// ═══════════════════════════════════════════════════════════════
// CHAPTER 4 — BEAM DESIGN
// ═══════════════════════════════════════════════════════════════
{
  id:'ch4', icon:'🔶', title:'Beam Design', color:'#f97316',
  subtitle:'Moment, shear, deflection, T-beam action, development length and torsion',
  visual:`<svg viewBox="0 0 420 200" style="width:100%;max-width:420px;display:block;margin:12px auto">
    <text x="210" y="14" text-anchor="middle" fill="#f97316" font-size="10" font-family="sans-serif" font-weight="700">Beam under uniform load — internal forces</text>
    <rect x="20" y="20" width="380" height="60" rx="4" fill="rgba(249,115,22,0.08)" stroke="#f97316" stroke-width="1.5"/>
    <line x1="70" y1="10" x2="70" y2="20" stroke="#f87171" stroke-width="1.5"/>
    <line x1="140" y1="10" x2="140" y2="20" stroke="#f87171" stroke-width="1.5"/>
    <line x1="210" y1="10" x2="210" y2="20" stroke="#f87171" stroke-width="1.5"/>
    <line x1="280" y1="10" x2="280" y2="20" stroke="#f87171" stroke-width="1.5"/>
    <line x1="350" y1="10" x2="350" y2="20" stroke="#f87171" stroke-width="1.5"/>
    <text x="210" y="8" text-anchor="middle" fill="#f87171" font-size="8" font-family="sans-serif">w kN/m (uniform load)</text>
    <rect x="25" y="24" width="370" height="22" rx="2" fill="rgba(56,189,248,0.25)"/>
    <text x="210" y="39" text-anchor="middle" fill="#38bdf8" font-size="9" font-family="sans-serif">COMPRESSION ZONE — concrete handles this</text>
    <rect x="25" y="52" width="370" height="24" rx="2" fill="rgba(248,113,113,0.2)"/>
    <text x="210" y="68" text-anchor="middle" fill="#f87171" font-size="9" font-family="sans-serif">TENSION ZONE — steel bars handle this (below neutral axis)</text>
    <circle cx="70" cy="78" r="5" fill="#34d399"/><circle cx="210" cy="78" r="5" fill="#34d399"/><circle cx="350" cy="78" r="5" fill="#34d399"/>
    <text x="210" y="92" text-anchor="middle" fill="#34d399" font-size="8" font-family="sans-serif">● Bottom steel bars resist tension (main reinforcement)</text>
    <path d="M 30 110 Q 210 155 390 110" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="5"/>
    <text x="210" y="145" text-anchor="middle" fill="#f97316" font-size="9" font-family="sans-serif">Deflection curve — max at midspan</text>
    <text x="30" y="170" fill="#38bdf8" font-size="8" font-family="sans-serif">Simply supported: Mu = wL²/8</text>
    <text x="30" y="183" fill="#34d399" font-size="8" font-family="sans-serif">Continuous (midspan): Mu = wL²/16</text>
    <text x="225" y="170" fill="#f87171" font-size="8" font-family="sans-serif">Depth: d ≥ L/26 (continuous)</text>
    <text x="225" y="183" fill="#f87171" font-size="8" font-family="sans-serif">Depth: d ≥ L/20 (simply supported)</text>
  </svg>`,
  sections:[
    {
      heading:'The Complete Beam Design Procedure',
      is_code:'IS 456:2000 Cl 22-26 — Analysis and design of beams',
      content:`Step 1 — <strong>Estimate depth</strong> from deflection: d_min = L/26 (continuous) or L/20 (simply supported). Round up to nearest 25mm. Add cover and half bar dia to get total depth D.<br>Step 2 — <strong>Calculate design moment</strong> Mu from IS 456 Table 12 coefficients or analysis.<br>Step 3 — <strong>Check if singly reinforced</strong>: If Mu ≤ Mulim = 0.138 × fck × b × d², single reinforcement is sufficient. If Mu > Mulim, compression steel at top is needed (doubly reinforced).<br>Step 4 — <strong>Calculate Ast</strong> (tensile steel area) from IS 456 Annex G.<br>Step 5 — <strong>Design shear</strong>: Calculate τv = Vu/(b×d). Check against τc (permissible concrete shear from Table 19). Design stirrups for excess shear.<br>Step 6 — <strong>Verify deflection</strong>: Check l/d ratio with modification factor.`
    },
    {
      heading:'T-Beam Action — The Slab Helps the Beam',
      is_code:'IS 456:2000 Cl 23.1.2 — Effective width of flange',
      content:`When a beam is cast monolithically with a slab (as is always the case in a building), the slab on either side acts as a compression flange — the beam behaves as a T-shaped section, not a rectangular one. This is called <strong>T-beam action</strong>.<br><br>The effective flange width (bf) per IS 456 Cl 23.1.2: bf = L0/6 + bw + 6Df (where L0 = effective span, bw = web width, Df = slab thickness). The actual slab width is taken up to the midpoint between adjacent beams.<br><br>T-beam has much more compression area than a rectangular beam — this significantly reduces the required steel. Ignoring T-beam action leads to overestimating steel by 30-50%.`,
      mistake:'Common mistake: Designing beams as rectangular sections even when they are cast with the slab. This overestimates the required reinforcement significantly.'
    },
    {
      heading:'Development Length — Why Bars Must Extend Beyond Supports',
      is_code:'IS 456:2000 Cl 26.2 — Development length of bars',
      content:`The force in a steel bar is transferred to surrounding concrete through <strong>bond stress</strong> along the bar surface. If a bar is too short, it pulls out of the concrete before reaching its yield stress — an anchorage failure.<br><br>Development length Ld = (φ × σs) / (4 × τbd) where φ = bar diameter, σs = stress in bar, τbd = design bond stress from IS 456 Table 26A.<br><br>For Fe500D in M25 concrete: Ld ≈ 40φ. A D20 bar needs at least 40×20 = 800mm of embedment beyond the point where full stress is needed.<br><br>At supports: bottom bars must extend Ld beyond the support face into the beam span. At simply supported ends: a hook is often needed if available length is insufficient.`
    },
    {
      heading:'Torsion in Beams — When It Occurs and How to Handle It',
      is_code:'IS 456:2000 Cl 41 — Limit state of torsion',
      content:`Torsion (twisting) occurs in beams when load is applied eccentrically or when the beam supports another beam or slab on one side only. Common examples: spandrel beams (edge beams) supporting a slab on one side — the slab load creates a torque on the beam. Secondary beams framing into the web of a main beam — the secondary beam reaction is eccentric.<br><br>Torsion is resisted by a combination of closed stirrups and longitudinal bars at corners. The design combines torsional moment with shear in equivalent shear terms per IS 456 Cl 41.3. Key rule: closed stirrups are always required when torsion is significant — open stirrups (as used for shear alone) cannot resist torsion.`
    },
    {
      heading:'Seismic Requirements for Beams — IS 13920',
      is_code:'IS 13920:2016 Cl 6 — Flexural members (beams)',
      content:`In seismic zones III, IV, V, beams must follow IS 13920 additional rules beyond IS 456:<br><br>(1) <strong>Steel ratio limits:</strong> ρmin = 0.24√fck/fy at any section. ρmax = 2.5% at any section. Both top and bottom reinforcement must run throughout the span.<br><br>(2) <strong>Confinement zone:</strong> At both ends of the beam, within 2d from face or L/4 from support, stirrups must be spaced at d/4 or 8× smallest bar diameter — whichever is less.<br><br>(3) <strong>Hooks:</strong> All stirrups must have 135° hooks in seismic zones — 90° hooks are not permitted as they open up during earthquakes.`
    },
    {
      heading:'Reading the Beam Report in StructLearn Pro',
      content:`The beam report shows B-1 through B-7 sections for each beam: <strong>B-1 size</strong> (depth and width selected by deflection), <strong>B-2 loading</strong> (dead + live + wall loads per metre), <strong>B-3 moments</strong> (at supports and midspan with the IS 456 coefficient used), <strong>B-4 main steel</strong> (number and diameter, area provided vs required), <strong>B-5 shear</strong> (stirrup size and spacing at support and midspan), <strong>B-6 deflection check</strong> (actual l/d ratio vs permissible), <strong>B-7 floor summary</strong> (same beam across all floors with varying loads).<br><br>Always check B-6 first — if deflection fails, increasing steel alone will not fix it. You need to increase the beam depth.`
    },
  ]
},

// ═══════════════════════════════════════════════════════════════
// CHAPTER 5 — COLUMN DESIGN
// ═══════════════════════════════════════════════════════════════
{
  id:'ch5', icon:'🏛', title:'Column Design', color:'#a78bfa',
  subtitle:'Axial load, eccentricity, P-M interaction, slenderness and seismic detailing',
  visual:`<svg viewBox="0 0 320 240" style="width:100%;max-width:320px;display:block;margin:12px auto">
    <text x="160" y="14" text-anchor="middle" fill="#a78bfa" font-size="10" font-family="sans-serif" font-weight="700">Cumulative load — floor by floor</text>
    <rect x="110" y="20" width="80" height="32" rx="3" fill="rgba(167,139,250,0.12)" stroke="#a78bfa" stroke-width="1.5"/>
    <text x="150" y="33" text-anchor="middle" fill="#a78bfa" font-size="9" font-family="sans-serif">ROOF</text>
    <text x="150" y="44" text-anchor="middle" fill="#64748b" font-size="8" font-family="sans-serif">Pu = 150 kN</text>
    <rect x="110" y="59" width="80" height="32" rx="3" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" stroke-width="1.5"/>
    <text x="150" y="72" text-anchor="middle" fill="#a78bfa" font-size="9" font-family="sans-serif">3rd FLOOR</text>
    <text x="150" y="83" text-anchor="middle" fill="#94a3b8" font-size="8" font-family="sans-serif">Pu = 320 kN</text>
    <rect x="110" y="98" width="80" height="32" rx="3" fill="rgba(167,139,250,0.3)" stroke="#a78bfa" stroke-width="2"/>
    <text x="150" y="111" text-anchor="middle" fill="#a78bfa" font-size="9" font-family="sans-serif">2nd FLOOR</text>
    <text x="150" y="122" text-anchor="middle" fill="#c4b5fd" font-size="8" font-family="sans-serif">Pu = 490 kN</text>
    <rect x="110" y="137" width="80" height="32" rx="3" fill="rgba(167,139,250,0.45)" stroke="#a78bfa" stroke-width="2.5"/>
    <text x="150" y="150" text-anchor="middle" fill="#e9d5ff" font-size="9" font-family="sans-serif" font-weight="700">GROUND</text>
    <text x="150" y="161" text-anchor="middle" fill="#f1f5f9" font-size="8" font-family="sans-serif" font-weight="700">Pu = 660 kN ← MAX</text>
    <path d="M150 52 L150 59" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#arvc)"/>
    <path d="M150 91 L150 98" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#arvc)"/>
    <path d="M150 130 L150 137" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#arvc)"/>
    <rect x="22" y="137" width="78" height="32" rx="3" fill="rgba(245,158,11,0.1)" stroke="#f59e0b" stroke-width="1"/>
    <text x="61" y="150" text-anchor="middle" fill="#f59e0b" font-size="8" font-family="sans-serif" font-weight="700">IS 13920</text>
    <text x="61" y="161" text-anchor="middle" fill="#f59e0b" font-size="8" font-family="sans-serif">Min 300mm</text>
    <rect x="85" y="177" width="130" height="20" rx="3" fill="rgba(251,191,36,0.2)" stroke="#fbbf24" stroke-width="1.5"/>
    <text x="150" y="191" text-anchor="middle" fill="#fbbf24" font-size="9" font-family="sans-serif">FOOTING — 660 kN</text>
    <rect x="220" y="20" width="90" height="150" rx="4" fill="#060f1f" stroke="#1e293b" stroke-width="1"/>
    <text x="265" y="36" text-anchor="middle" fill="#38bdf8" font-size="8" font-family="sans-serif" font-weight="700">Min Steel %</text>
    <text x="265" y="50" text-anchor="middle" fill="#34d399" font-size="8" font-family="sans-serif">0.8% (IS 456)</text>
    <text x="265" y="70" text-anchor="middle" fill="#38bdf8" font-size="8" font-family="sans-serif" font-weight="700">Max Steel %</text>
    <text x="265" y="84" text-anchor="middle" fill="#f87171" font-size="8" font-family="sans-serif">6% (IS 456)</text>
    <text x="265" y="104" text-anchor="middle" fill="#38bdf8" font-size="8" font-family="sans-serif" font-weight="700">Min Dim (seismic)</text>
    <text x="265" y="118" text-anchor="middle" fill="#f59e0b" font-size="8" font-family="sans-serif">300mm (IS 13920)</text>
    <text x="265" y="138" text-anchor="middle" fill="#38bdf8" font-size="8" font-family="sans-serif" font-weight="700">Tie spacing</text>
    <text x="265" y="152" text-anchor="middle" fill="#94a3b8" font-size="8" font-family="sans-serif">≤ 300mm normal</text>
    <text x="265" y="162" text-anchor="middle" fill="#f87171" font-size="8" font-family="sans-serif">B/4 or 75mm conf.</text>
    <defs><marker id="arvc" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#a78bfa"/></marker></defs>
  </svg>`,
  sections:[
    {
      heading:'Short vs Slender Column — When Buckling Governs',
      is_code:'IS 456:2000 Cl 25.1.2 — Slenderness ratio',
      content:`A <strong>short column</strong> fails by material crushing — concrete reaches its compressive strength limit. A <strong>slender column</strong> can buckle laterally before the material fails — like a long ruler bending sideways under a vertical push.<br><br>IS 456 defines a column as short if the effective length/least lateral dimension (le/b) ≤ 12 AND effective length/radius of gyration (le/i) ≤ 40. Otherwise it is slender.<br><br>For slender columns, additional bending moment (called moment magnification) must be added. Most columns in normal residential buildings (3m storey height, 300mm columns) are short. Columns in warehouses, factories, or those with reduced lateral restraint may be slender.`
    },
    {
      heading:'Minimum Eccentricity — Columns are Never Purely Axial',
      is_code:'IS 456:2000 Cl 39.2 — Assumptions in design',
      content:`A perfectly axially loaded column is a theoretical ideal. In practice, construction inaccuracies, beam reactions not perfectly centred, and small unintended offsets create bending moments in every column.<br><br>IS 456 requires that all columns be designed for a <strong>minimum eccentricity</strong> of emin = L/500 + D/30, with a minimum of 20mm. For a 3m tall column with 300mm dimension: emin = 3000/500 + 300/30 = 6 + 10 = 16mm, but minimum 20mm governs.<br><br>This minimum eccentricity means even a column designed for pure axial load must have a small moment capacity. In practice, for typical residential buildings the minimum eccentricity rarely governs — beam moments transferred to columns are usually larger.`
    },
    {
      heading:'P-M Interaction Diagram — The Column Design Tool',
      is_code:'IS 456:2000 Annex C — Axial load and moment',
      content:`Every column section has a characteristic curve called the <strong>interaction diagram</strong> that shows all combinations of axial load (P) and bending moment (M) that the section can safely carry. Points inside the curve are safe; outside means failure.<br><br>The diagram has three key regions: (1) Pure axial compression at the top (no moment), (2) Balanced point in the middle (where concrete reaches crushing strain simultaneously with steel yielding), (3) Pure bending at the bottom (no axial load — beam behaviour).<br><br>For a column with both axial load and moment, you plot the (Pu, Mu) point and check if it falls within the interaction boundary. This is what structural analysis software does automatically.`
    },
    {
      heading:'Biaxial Bending — Corner Columns Under Earthquake',
      is_code:'IS 456:2000 Cl 39.6 — Biaxially loaded columns',
      content:`Corner columns are subjected to bending in <strong>both directions simultaneously</strong> during earthquakes — beams frame into them from two perpendicular directions. This is called biaxial bending and requires a more complex interaction check.<br><br>IS 456 Cl 39.6 gives the interaction formula for biaxial bending: (Mux/Mux1)^αn + (Muy/Muy1)^αn ≤ 1.0, where αn depends on the axial load ratio. StructLearn Pro checks this for all columns — particularly important for corner columns in seismic zones where both horizontal directions are excited simultaneously.`
    },
    {
      heading:'Column Splices — Where to Join and Where Never to Join',
      is_code:'IS 13920:2016 Cl 7.5 — Splices in columns',
      content:`Column bars must be spliced (joined) between floors since continuous bars from foundation to roof would be impractical. A <strong>lap splice</strong> overlaps two bars by a development length so load transfers through bond.<br><br>IS 13920 strictly prohibits lap splices in the confinement zone (top and bottom of column). These are the highest stress regions during earthquakes. All splices must be placed at mid-height of the storey.<br><br>Minimum lap length for seismic zones: 1.3 × Ld = 1.3 × 40φ = 52φ (for Fe500D in M25). For D20 bars: 52 × 20 = 1040mm. Splices in more than half the bars at the same section are not permitted.`,
      mistake:'Common mistake in construction: Splicing bars at the same level as the floor beam (for convenience). This is exactly the confinement zone — the worst possible location for a splice.'
    },
    {
      heading:'Strong Column — Weak Beam: The Fundamental Seismic Principle',
      is_code:'IS 13920:2016 Cl 7.2.1 — Beam-column moment ratio',
      content:`During an earthquake, plastic hinges (regions of concentrated bending deformation) must form in <strong>beams</strong> rather than columns. If columns form plastic hinges, the entire floor can collapse — called a <em>storey mechanism</em>. If beams form plastic hinges, only the beam is damaged and the building remains standing — called a <em>beam mechanism</em>.<br><br>IS 13920 requires: ΣMc ≥ 1.1 × ΣMb — the sum of column moment capacities at a joint must exceed 1.1 times the sum of beam moment capacities. This forces beams to yield first. The 1.1 factor provides a margin since actual capacities may differ from calculated values.`
    },
  ]
},

// ═══════════════════════════════════════════════════════════════
// CHAPTER 6 — FOOTING DESIGN
// ═══════════════════════════════════════════════════════════════
{
  id:'ch6', icon:'🏗', title:'Footing Design', color:'#fbbf24',
  subtitle:'Foundation types, bearing capacity, punching shear, settlement and eccentric loading',
  visual:`<svg viewBox="0 0 380 200" style="width:100%;max-width:380px;display:block;margin:12px auto">
    <text x="190" y="14" text-anchor="middle" fill="#fbbf24" font-size="10" font-family="sans-serif" font-weight="700">Punching shear — the critical failure mode</text>
    <rect x="155" y="20" width="70" height="60" rx="2" fill="rgba(167,139,250,0.25)" stroke="#a78bfa" stroke-width="1.5"/>
    <text x="190" y="53" text-anchor="middle" fill="#a78bfa" font-size="9" font-family="sans-serif">COLUMN</text>
    <text x="190" y="65" text-anchor="middle" fill="#64748b" font-size="8" font-family="sans-serif">600 kN</text>
    <rect x="60" y="80" width="260" height="50" rx="4" fill="rgba(251,191,36,0.12)" stroke="#fbbf24" stroke-width="2"/>
    <text x="190" y="109" text-anchor="middle" fill="#fbbf24" font-size="9" font-family="sans-serif">FOOTING 1.73m × 1.73m</text>
    <line x1="155" y1="80" x2="100" y2="130" stroke="#f87171" stroke-width="1.5" stroke-dasharray="5"/>
    <line x1="225" y1="80" x2="280" y2="130" stroke="#f87171" stroke-width="1.5" stroke-dasharray="5"/>
    <text x="55" y="145" fill="#f87171" font-size="8" font-family="sans-serif">Punching cone</text>
    <rect x="130" y="68" width="120" height="74" rx="2" fill="none" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4"/>
    <text x="265" y="88" fill="#34d399" font-size="8" font-family="sans-serif">Critical perimeter</text>
    <text x="265" y="98" fill="#34d399" font-size="8" font-family="sans-serif">bo at d/2 from face</text>
    <text x="190" y="155" text-anchor="middle" fill="#38bdf8" font-size="8" font-family="sans-serif">bo = 4 × (col_size + d_footing)</text>
    <text x="190" y="167" text-anchor="middle" fill="#38bdf8" font-size="8" font-family="sans-serif">τvp = Vu/(bo×d) ≤ 0.25√fck</text>
    <text x="190" y="179" text-anchor="middle" fill="#94a3b8" font-size="8" font-family="sans-serif">Soil pressure = 600/(1.73×1.73) = 200 kN/m²</text>
    <text x="190" y="191" text-anchor="middle" fill="#34d399" font-size="8" font-family="sans-serif">= Net SBC ✓ — design is adequate</text>
  </svg>`,
  sections:[
    {
      heading:'Foundation Types — When to Use Which',
      is_code:'IS 1904:2006 — Design of foundations, IS 2911 — Pile foundations',
      content:`<strong>Isolated footing</strong> — one footing under one column. Used when columns are spaced well apart and SBC is adequate. Most common for residential buildings. If columns are too close together, footings overlap — use combined footing instead.<br><br><strong>Combined footing</strong> — one footing under two or more columns. Used when columns are close to the property boundary (eccentric footing would project outside) or when columns are too close for isolated footings.<br><br><strong>Raft (mat) foundation</strong> — single slab covering entire building footprint. Used when SBC is very low (< 100 kN/m²) and individual footings would be too large and overlap, or when differential settlement must be minimised.<br><br><strong>Pile foundation</strong> — load transferred to deeper firm strata through long slender members. Used when soft soil extends to great depth, for high-rise buildings, or near water bodies.`
    },
    {
      heading:'Net vs Gross Safe Bearing Capacity',
      is_code:'IS 6403:1981 — Bearing capacity of shallow foundations',
      content:`<strong>Gross SBC</strong> = total pressure the soil can carry (from geotechnical investigation report).<br><strong>Net SBC</strong> = Gross SBC − overburden pressure = Gross SBC − γ × Df<br><br>Why subtract? Before excavation, the soil at foundation depth was carrying the weight of soil above it. When you excavate and place a footing, you remove that soil weight and replace it with concrete. The net additional pressure on the soil is only the building load — the overburden was already there.<br><br>Example: Gross SBC = 200 kN/m², γ = 18 kN/m³, Df = 1.5m. Net SBC = 200 − 18×1.5 = 173 kN/m². Always use net SBC for footing size calculation.`,
      mistake:'Common mistake: Using gross SBC directly for footing design. This overestimates available capacity, leading to undersized footings and potential settlement.'
    },
    {
      heading:'Two Shear Checks in Footings',
      is_code:'IS 456:2000 Cl 31.6 — Shear in footings',
      content:`Footings must be checked for two types of shear:<br><br><strong>Punching shear (two-way shear)</strong> — The column tries to punch through the footing like a stamp on paper. Critical perimeter is at d/2 from column face. τvp = Vu/(bo×d) where bo = 4×(col_size + d). Permissible = 0.25√fck (IS 456 Cl 31.6.3). This usually governs footing depth.<br><br><strong>One-way shear (beam shear)</strong> — The footing acts like a wide beam bending about a critical section at 'd' from the column face. τv = Vu/(b×d). Permissible from Table 19 based on pt%. Usually less critical than punching but must be checked.`
    },
    {
      heading:'Settlement — The Other Failure Mode',
      content:`Even if soil stress is safely within SBC, <strong>differential settlement</strong> can cause serious damage. Differential settlement is when different footings settle by different amounts — causing the building to tilt or rack, cracking walls and slabs.<br><br>Differential settlement causes: (1) columns not at the same level, creating secondary moments in beams, (2) cracking of masonry walls (typically diagonal cracks at 45°), (3) doors and windows jamming as frames distort, (4) in severe cases, structural distress.<br><br>IS 1904 limits: total settlement ≤ 50mm for isolated footings on clay, 65mm on sand. Differential settlement ≤ L/500 (where L is distance between columns). Soft compressible soils require detailed settlement analysis by a geotechnical engineer.`
    },
    {
      heading:'Eccentric Loading — Wind and Seismic Uplift',
      is_code:'IS 456:2000 Cl 34.2 — Design of combined footings',
      content:`Under lateral loads (wind or earthquake), a column carries not just axial load but also a bending moment at its base. This creates an <strong>eccentric load</strong> on the footing — higher soil pressure on one side, lower on the other.<br><br>Soil pressure: q = P/A ± M×y/I. If the moment is large enough, one side of the footing lifts off the soil (tension) — but soil cannot take tension. The footing redistributes, carrying load on a reduced effective area. IS 456 Cl 34.2 gives the procedure for this case.<br><br>For severe seismic zones, footings must often be tied together with grade beams (tie beams at foundation level) to prevent relative movement and differential settlement during earthquakes.`
    },
    {
      heading:'Reading the Footing Report',
      content:`The footing report shows: <strong>Column load (Pu)</strong> — factored axial load from column above. <strong>Service load</strong> — unfactored load for footing sizing. <strong>Net SBC</strong> — after deducting overburden. <strong>Footing size (B×L)</strong> — plan dimensions. <strong>Footing depth (D)</strong> — total depth from ground level to bottom. <strong>Effective depth (d)</strong> — D minus cover minus half bar dia. <strong>Punching shear check</strong> — τvp vs 0.25√fck. <strong>One-way shear check</strong>. <strong>Bending moment at column face</strong> and required Ast. <strong>Development length check</strong> — bars must extend to provide Ld from column face.`
    },
  ]
},

// ═══════════════════════════════════════════════════════════════
// CHAPTER 7 — SEISMIC DESIGN
// ═══════════════════════════════════════════════════════════════
{
  id:'ch7', icon:'🌍', title:'Seismic Design', color:'#f87171',
  subtitle:'Earthquake mechanism, response spectrum, ductility, IS 1893 and IS 13920 in depth',
  visual:`<svg viewBox="0 0 400 200" style="width:100%;max-width:400px;display:block;margin:12px auto">
    <text x="200" y="14" text-anchor="middle" fill="#f87171" font-size="10" font-family="sans-serif" font-weight="700">Seismic force distribution over building height</text>
    <rect x="160" y="22" width="80" height="14" rx="2" fill="rgba(248,113,113,0.2)" stroke="#f87171" stroke-width="1.5"/>
    <text x="200" y="33" text-anchor="middle" fill="#f87171" font-size="8" font-family="sans-serif">ROOF</text>
    <rect x="160" y="44" width="80" height="18" rx="2" fill="rgba(248,113,113,0.2)" stroke="#f87171" stroke-width="1.5"/>
    <text x="200" y="57" text-anchor="middle" fill="#f87171" font-size="8" font-family="sans-serif">3rd FLOOR</text>
    <rect x="160" y="70" width="80" height="18" rx="2" fill="rgba(248,113,113,0.2)" stroke="#f87171" stroke-width="1.5"/>
    <text x="200" y="83" text-anchor="middle" fill="#f87171" font-size="8" font-family="sans-serif">2nd FLOOR</text>
    <rect x="160" y="96" width="80" height="18" rx="2" fill="rgba(248,113,113,0.2)" stroke="#f87171" stroke-width="1.5"/>
    <text x="200" y="109" text-anchor="middle" fill="#f87171" font-size="8" font-family="sans-serif">1st FLOOR</text>
    <rect x="140" y="122" width="120" height="12" rx="2" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="200" y="132" text-anchor="middle" fill="#38bdf8" font-size="8" font-family="sans-serif">FOUNDATION — full base shear V</text>
    <line x1="240" y1="29" x2="310" y2="29" stroke="#f87171" stroke-width="3" marker-end="url(#arhs)"/>
    <text x="315" y="32" fill="#f87171" font-size="8" font-family="sans-serif">F4=60kN</text>
    <line x1="240" y1="53" x2="295" y2="53" stroke="#f87171" stroke-width="2.5" marker-end="url(#arhs)"/>
    <text x="300" y="56" fill="#f87171" font-size="8" font-family="sans-serif">F3=45kN</text>
    <line x1="240" y1="79" x2="278" y2="79" stroke="#f87171" stroke-width="2" marker-end="url(#arhs)"/>
    <text x="283" y="82" fill="#f87171" font-size="8" font-family="sans-serif">F2=28kN</text>
    <line x1="240" y1="105" x2="260" y2="105" stroke="#f87171" stroke-width="1.5" marker-end="url(#arhs)"/>
    <text x="265" y="108" fill="#f87171" font-size="8" font-family="sans-serif">F1=12kN</text>
    <text x="200" y="152" text-anchor="middle" fill="#64748b" font-size="8" font-family="sans-serif">V = Ah × W = 145 kN total</text>
    <text x="200" y="162" text-anchor="middle" fill="#64748b" font-size="8" font-family="sans-serif">Ah = (Z/2) × (I/R) × (Sa/g)</text>
    <rect x="10" y="20" width="130" height="120" rx="6" fill="#060f1f" stroke="#1e293b" stroke-width="1"/>
    <text x="75" y="36" text-anchor="middle" fill="#38bdf8" font-size="9" font-family="sans-serif" font-weight="700">Zone Factors (Z)</text>
    <text x="75" y="52" text-anchor="middle" fill="#34d399" font-size="8" font-family="sans-serif">Zone II: 0.10 (Low)</text>
    <text x="75" y="66" text-anchor="middle" fill="#fbbf24" font-size="8" font-family="sans-serif">Zone III: 0.16 (Mod)</text>
    <text x="75" y="80" text-anchor="middle" fill="#f97316" font-size="8" font-family="sans-serif">Zone IV: 0.24 (High)</text>
    <text x="75" y="94" text-anchor="middle" fill="#f87171" font-size="8" font-family="sans-serif" font-weight="700">Zone V: 0.36 (Very High)</text>
    <text x="75" y="112" text-anchor="middle" fill="#64748b" font-size="7" font-family="sans-serif">Delhi=IV, Mumbai=III</text>
    <text x="75" y="122" text-anchor="middle" fill="#64748b" font-size="7" font-family="sans-serif">Guwahati=V, Chennai=II</text>
    <defs><marker id="arhs" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#f87171"/></marker></defs>
  </svg>`,
  sections:[
    {
      heading:'Why Buildings Fail in Earthquakes',
      is_code:'IS 1893:2016 Part 1 — Criteria for earthquake resistant design',
      content:`Earthquakes create rapid ground motion — the ground accelerates horizontally. Since F = ma, any mass (the building) experiences an inertial force opposing the acceleration. The building wants to stay still while the ground moves — creating lateral forces throughout the structure.<br><br>Buildings fail when: (1) lateral force exceeds the strength of members (overload failure), (2) excessive lateral deformation damages connections and causes instability (displacement failure), (3) local failure of a critical member triggers progressive collapse (soft storey, weak column).<br><br>The goal of seismic design is not to prevent all damage — that would be economically impossible. The goal is: <em>no collapse for rare severe earthquakes</em> (saving lives), <em>no structural damage for moderate earthquakes</em> (limiting repair cost), <em>no non-structural damage for frequent minor earthquakes</em> (operational continuity).`
    },
    {
      heading:'Natural Period and Resonance — The Real Danger',
      content:`Every building has a <strong>natural period</strong> — the time it takes to complete one full oscillation back and forth when displaced. Short buildings (1-2 floors) have short periods (0.1-0.3 seconds). Tall buildings have longer periods (1-3 seconds).<br><br>Earthquakes contain energy at different frequencies. When the earthquake ground motion frequency matches the building natural period, <strong>resonance</strong> occurs — the building absorbs maximum energy and deflects much more than expected. The 1985 Mexico City earthquake had dominant period around 2 seconds — medium-rise buildings (8-14 floors) with similar periods suffered catastrophic resonance damage while shorter and taller buildings nearby survived.<br><br>IS 1893 empirical formula: T = 0.075 × h^0.75 (for RC moment frames, h in metres). For a G+3 building (12m): T ≈ 0.075 × 12^0.75 ≈ 0.52 seconds.`
    },
    {
      heading:'The Design Seismic Coefficient — Ah',
      is_code:'IS 1893:2016 Cl 6.4 — Design acceleration coefficient',
      content:`Ah = (Z/2) × (I/R) × (Sa/g)<br><br><strong>Z</strong> = Zone factor (II: 0.10, III: 0.16, IV: 0.24, V: 0.36). Represents peak ground acceleration for the zone divided by 2 (design basis earthquake is half the maximum considered earthquake).<br><br><strong>I</strong> = Importance factor (1.0 residential, 1.5 schools/hospitals). Higher for critical occupancies.<br><br><strong>R</strong> = Response Reduction factor (5.0 for ductile RC moment frame). Accounts for the building ability to absorb energy through inelastic deformation without collapse. Higher R for more ductile systems.<br><br><strong>Sa/g</strong> = Spectral acceleration coefficient from IS 1893 Figure 2 — depends on soil type and building period. Ranges from 1.0 to 2.5 for typical buildings.`
    },
    {
      heading:'Storey Drift — How Much Can the Building Sway',
      is_code:'IS 1893:2016 Cl 7.11.1 — Storey drift limitation',
      content:`<strong>Storey drift</strong> is the relative horizontal displacement between two adjacent floor levels during an earthquake. Excessive drift causes: non-structural damage (cracking of walls, glass breakage, pipe failures), P-delta effects (gravity load acting on displaced columns creates additional overturning moment), and potential collapse.<br><br>IS 1893 limits storey drift to 0.004 × storey height = 0.004 × 3000 = 12mm for a 3m storey. This is a service level check — if drift exceeds this, the structure must be stiffened (larger columns, shear walls, or bracing).<br><br>For buildings with brittle masonry infill, drift must be further limited to protect the infill from damage — typically 0.002 × storey height.`
    },
    {
      heading:'IS 13920 — Every Rule Explained',
      is_code:'IS 13920:2016 — Ductile design and detailing of RC structures',
      content:`IS 13920 applies to all RC buildings in seismic zones III, IV, V. Key requirements:<br><br><strong>Material:</strong> Minimum M25 concrete, Fe500D steel mandatory. Higher strength and ductility needed.<br><strong>Beam steel:</strong> Minimum 0.24√fck/fy at any section. Maximum 2.5% tension steel. Both top and bottom bars must be continuous throughout span (no cutting off bottom bars at supports).<br><strong>Beam stirrups:</strong> Confinement zone at both ends — within 2d from column face. Spacing: d/4 or 8× smallest bar dia. 135° hooks mandatory.<br><strong>Column dimensions:</strong> Minimum 300mm. Aspect ratio ≤ 4 (no very narrow columns).<br><strong>Column steel:</strong> 0.8-6% of Ag. Splice only at mid-height.<br><strong>Column confinement:</strong> At top and bottom Lo = max(larger dim, height/6, 450mm). Tie spacing: B/4 or 75mm, whichever less.`,
      mistake:'Common mistake: Applying IS 456 design without IS 13920 detailing in seismic zones. The columns and beams may be strong enough for the design loads but will be brittle — they fail suddenly without warning during actual earthquakes.'
    },
    {
      heading:'Ductility — Why It Saves Lives',
      content:`<strong>Ductility</strong> is the ability of a structure or member to undergo large deformations beyond its elastic limit without losing load-carrying capacity. A ductile structure gives visible warning (large deformation, cracking) before failure — allowing evacuation. A brittle structure fails suddenly without warning.<br><br>Plain concrete is brittle. Reinforced concrete can be made ductile through: (1) using ductile steel (Fe500D), (2) providing confinement (closely spaced ties that prevent concrete from spalling and keep bars from buckling), (3) limiting reinforcement to keep sections under-reinforced (steel yields before concrete crushes), (4) following strong column-weak beam principle.<br><br>A ductile building may be severely damaged in a major earthquake — but it will not collapse suddenly. This distinction between damage and collapse is literally the difference between life and death.`
    },
  ]
},

// ═══════════════════════════════════════════════════════════════
// CHAPTER 8 — READING YOUR REPORT
// ═══════════════════════════════════════════════════════════════
{
  id:'ch8', icon:'📊', title:'Reading Your Report', color:'#34d399',
  subtitle:'Complete navigation, utilisation ratio, failure patterns, schedules and limitations',
  visual:`<svg viewBox="0 0 400 190" style="width:100%;max-width:400px;display:block;margin:12px auto">
    <text x="200" y="14" text-anchor="middle" fill="#34d399" font-size="10" font-family="sans-serif" font-weight="700">Safety Tab — what it tells you at a glance</text>
    <rect x="10" y="22" width="380" height="155" rx="6" fill="#060f1f" stroke="#1e293b" stroke-width="1"/>
    <rect x="10" y="22" width="380" height="22" rx="6" fill="#0a0f1e"/>
    <text x="60" y="37" fill="#38bdf8" font-size="9" font-family="sans-serif" font-weight="700">Member</text>
    <text x="170" y="37" fill="#38bdf8" font-size="9" font-family="sans-serif" font-weight="700">Check</text>
    <text x="260" y="37" fill="#38bdf8" font-size="9" font-family="sans-serif" font-weight="700">Result</text>
    <text x="340" y="37" fill="#38bdf8" font-size="9" font-family="sans-serif" font-weight="700">Util.</text>
    <text x="40" y="58" fill="#f97316" font-size="9" font-family="sans-serif">Beam B1 F1</text>
    <text x="170" y="58" fill="#94a3b8" font-size="9" font-family="sans-serif">Deflection</text>
    <text x="250" y="58" fill="#94a3b8" font-size="9" font-family="sans-serif">l/d=22.1≤26</text>
    <rect x="325" y="48" width="52" height="14" rx="3" fill="rgba(52,211,153,0.2)" stroke="#34d399" stroke-width="1"/>
    <text x="351" y="58" text-anchor="middle" fill="#34d399" font-size="8" font-family="sans-serif" font-weight="700">PASS 0.85</text>
    <text x="40" y="78" fill="#f97316" font-size="9" font-family="sans-serif">Beam B2 F1</text>
    <text x="170" y="78" fill="#94a3b8" font-size="9" font-family="sans-serif">Shear</text>
    <text x="250" y="78" fill="#94a3b8" font-size="9" font-family="sans-serif">τv=1.8>τc</text>
    <rect x="325" y="68" width="52" height="14" rx="3" fill="rgba(248,113,113,0.2)" stroke="#f87171" stroke-width="1"/>
    <text x="351" y="78" text-anchor="middle" fill="#f87171" font-size="8" font-family="sans-serif" font-weight="700">FAIL 1.12</text>
    <text x="40" y="98" fill="#a78bfa" font-size="9" font-family="sans-serif">Col A1 F1</text>
    <text x="170" y="98" fill="#94a3b8" font-size="9" font-family="sans-serif">Capacity</text>
    <text x="250" y="98" fill="#94a3b8" font-size="9" font-family="sans-serif">Pu/Pcap=0.78</text>
    <rect x="325" y="88" width="52" height="14" rx="3" fill="rgba(52,211,153,0.2)" stroke="#34d399" stroke-width="1"/>
    <text x="351" y="98" text-anchor="middle" fill="#34d399" font-size="8" font-family="sans-serif" font-weight="700">PASS 0.78</text>
    <text x="40" y="118" fill="#fbbf24" font-size="9" font-family="sans-serif">Ftg A1</text>
    <text x="170" y="118" fill="#94a3b8" font-size="9" font-family="sans-serif">Punching</text>
    <text x="250" y="118" fill="#94a3b8" font-size="9" font-family="sans-serif">τvp=0.62</text>
    <rect x="325" y="108" width="52" height="14" rx="3" fill="rgba(52,211,153,0.2)" stroke="#34d399" stroke-width="1"/>
    <text x="351" y="118" text-anchor="middle" fill="#34d399" font-size="8" font-family="sans-serif" font-weight="700">PASS 0.62</text>
    <text x="200" y="145" text-anchor="middle" fill="#f87171" font-size="9" font-family="sans-serif" font-weight="700">⚠ Beam B2 shear fails</text>
    <text x="200" y="158" text-anchor="middle" fill="#64748b" font-size="9" font-family="sans-serif">→ Go to Beams tab → B-5 Shear → Click WHY? → Fix: increase beam width b</text>
    <text x="200" y="170" text-anchor="middle" fill="#64748b" font-size="9" font-family="sans-serif">Utilisation ratio 1.12 means 12% overstressed</text>
  </svg>`,
  sections:[
    {
      heading:'Report Navigation — Which Tab to Check First and Why',
      content:`Always follow this order: <strong>Safety tab first</strong> — single pass/fail verdict for every member, shows the full picture at a glance. <strong>Seismic tab second</strong> — check base shear, storey shear distribution, time period. These are building-level outputs that affect everything. <strong>Slabs tab</strong> — check each bay panel, confirm all pass, note any unusual depths. <strong>Beams tab</strong> — check beam depths (are they practical?), steel ratios (not too high?), deflection check. <strong>Columns tab</strong> — check if all 300mm, steel percentages floor by floor, confinement requirements. <strong>Footings tab</strong> — check footing sizes (overlap?), punching shear utilisation. <strong>Summary tab</strong> — overall member schedule, material quantities.`
    },
    {
      heading:'Understanding Utilisation Ratio — What It Physically Means',
      content:`The <strong>utilisation ratio</strong> is the ratio of design load to member capacity: Utilisation = Design demand / Member capacity.<br><br><strong>0.0-0.4:</strong> Significantly over-designed. The member is carrying far less than it can. This is wasteful — costs more concrete and steel than needed. Common for corner columns in small buildings.<br><strong>0.5-0.8:</strong> Ideal range. Member is working efficiently, has adequate safety margin, economical design.<br><strong>0.8-1.0:</strong> Highly utilised. Member is near its capacity limit but still passes. Acceptable but leaves little margin for construction variations.<br><strong>Above 1.0:</strong> FAIL. The design demand exceeds the member capacity. This member must be changed before the design can be used.`
    },
    {
      heading:'Common Failure Patterns — What Failures Tell You',
      content:`Failures rarely appear in isolation. Patterns reveal the root cause:<br><br><strong>All beams in one direction fail in deflection:</strong> spans too large in that direction. Reduce span or increase slab thickness.<br><strong>All ground floor columns fail, upper floors pass:</strong> cumulative load from many floors exceeds column capacity. Increase ground floor column size or concrete grade.<br><strong>Corner footings pass but interior footings fail in punching:</strong> interior columns carry 4× more load. Increase interior footing depth.<br><strong>Beams near staircase bay fail:</strong> staircase slab reaction creates extra concentrated load on adjacent beams. The software includes this automatically — check B-2 loading section.`,
      mistake:'Common mistake: Fixing the first failure shown and running analysis again without checking if the fix caused new failures. Always recheck ALL members after any change.'
    },
    {
      heading:'Member Schedule — Reading the Bar Schedule',
      content:`The member schedule at the end of the report lists all reinforcement systematically. For each beam: span identifier (B1X-F1 = Bay 1 X-direction Floor 1), size (D×b), main steel (e.g., 3-D16 at bottom, 2-D12 at top), stirrups (D8@150 at ends, D8@200 at midspan). For each column: size, floor level, longitudinal bars (e.g., 4-D20 at corners), ties (D8@150 normal zone, D8@75 confinement zone).<br><br>This schedule is what the site engineer uses to prepare the bar-bending schedule (BBS) — the actual list of bars cut to length, bent to shape, and placed on site. The BBS is generated from the member schedule.`
    },
    {
      heading:'What This Report Does NOT Cover',
      is_code:'Professional scope of IS 456 design',
      content:`StructLearn Pro designs for structural strength and deflection under the specified loads. It does NOT check:<br><br><strong>Foundation settlement</strong> — how much the building sinks over years as soil consolidates. Requires soil investigation and geotechnical analysis.<br><strong>Vibration from machinery</strong> — factories, pump rooms, generators. Dynamic analysis needed.<br><strong>Wind on facades</strong> — cladding, glass, curtain walls. IS 875 Part 3 clause by clause analysis needed.<br><strong>Fire resistance</strong> — column sizes for fire rating, cover for fire exposure. IS 456 Cl 16 and NBC fire provisions.<br><strong>Durability in aggressive environments</strong> — coastal areas, industrial pollution, chemicals. Special cement, admixtures, coatings may be needed.<br><strong>Foundation interaction</strong> — when footings are on soil that creeps or settles over time.`
    },
    {
      heading:'When to Involve a Licensed Structural Engineer',
      content:`StructLearn Pro is an educational tool and for preliminary design. A licensed structural engineer must be involved for:<br><br>(1) Any building requiring a structural stability certificate for municipal building permission.<br>(2) Buildings with irregular geometry, mixed-use, or unusual loading.<br>(3) Buildings in coastal areas, near slopes, or on problematic soils.<br>(4) Buildings above 4 storeys in Zone III, IV, V — enhanced analysis may be needed per IS 1893.<br>(5) Buildings with water bodies, swimming pools, water tanks above ground level.<br>(6) Any design that will actually be constructed — not just for learning purposes.<br><br>Use StructLearn Pro to understand concepts, learn the design process, do preliminary estimates, and check if professional designs make sense. Do not use it as a replacement for professional engineering judgment.`
    },
  ]
},

]; // end VISUAL_CHAPTERS


function openStudentGuide(chapterId) {
  const old = document.getElementById('_guide_screen'); if(old) old.remove();
  const ch = chapterId || 'ch1';
  const activeChapter = VISUAL_CHAPTERS.find(function(c){ return c.id===ch; }) || VISUAL_CHAPTERS[0];

  const screen = document.createElement('div');
  screen.id = '_guide_screen';
  screen.style.cssText = 'position:fixed;inset:0;background:#0a0f1e;z-index:99990;display:flex;font-family:Segoe UI,sans-serif;overflow:hidden;';

  // Sidebar
  var sidebarHTML = VISUAL_CHAPTERS.map(function(c) {
    var isActive = c.id === activeChapter.id;
    return '<div onclick="switchGuideChapter(\''+c.id+'\',\''+c.id+'\')"'
      + ' style="padding:9px 14px;cursor:pointer;border-radius:6px;margin:2px 0;display:flex;align-items:center;gap:8px;'
      + 'background:'+(isActive?'rgba(56,189,248,0.08)':'transparent')+';'
      + 'border-left:3px solid '+(isActive?c.color:'transparent')+'">'
      + '<span style="font-size:14px">'+c.icon+'</span>'
      + '<div>'
      +   '<div style="font-size:11px;font-weight:700;color:'+(isActive?c.color:'#64748b')+'">'+c.title+'</div>'
      +   '<div style="font-size:9px;color:#64748b;margin-top:1px">'+c.sections.length+' topics</div>'
      + '</div>'
      + '</div>';
  }).join('');

  // Sections
  var sectionsHTML = activeChapter.sections.map(function(sec) {
    var mistakeBox = sec.mistake
      ? '<div style="margin-top:12px;padding:10px 14px;background:rgba(248,113,113,0.06);border-left:3px solid #f87171;border-radius:0 6px 6px 0">'
      +   '<div style="font-size:10px;font-weight:700;color:#f87171;margin-bottom:5px">⚠ COMMON MISTAKE</div>'
      +   '<div style="font-size:12px;color:#94a3b8;line-height:1.7">'+sec.mistake+'</div>'
      + '</div>' : '';
    var isCodeBox = sec.is_code
      ? '<div style="margin-top:8px;padding:5px 12px;background:#060f1f;border-left:3px solid '+activeChapter.color+';border-radius:0 5px 5px 0;font-size:10px;color:'+activeChapter.color+';font-family:monospace">'+sec.is_code+'</div>'
      : '';
    return '<div style="margin-bottom:28px;padding-bottom:28px;border-bottom:1px solid #0f172a">'
      + '<h3 style="font-size:15px;font-weight:700;color:#f1f5f9;margin-bottom:12px;display:flex;align-items:center;gap:8px">'
      +   '<span style="width:4px;height:18px;background:'+activeChapter.color+';border-radius:2px;flex-shrink:0;display:inline-block"></span>'
      +   sec.heading
      + '</h3>'
      + '<div style="font-size:13px;color:#94a3b8;line-height:1.9">'+sec.content+'</div>'
      + isCodeBox
      + mistakeBox
      + '</div>';
  }).join('');

  screen.innerHTML = '<div style="width:220px;background:#0a0f1e;border-right:1px solid #1e293b;padding:14px;overflow-y:auto;flex-shrink:0;display:flex;flex-direction:column">'
    + '<div style="font-size:13px;font-weight:800;color:#38bdf8;margin-bottom:2px">📚 Student Guide</div>'
    + '<div style="font-size:10px;color:#64748b;margin-bottom:14px">IS 456 Complete Reference</div>'
    + sidebarHTML
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;padding:28px 36px;background:#0a0f1e">'
    +   '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">'
    +     '<div>'
    +       '<div style="font-size:22px;font-weight:900;color:'+activeChapter.color+'">'+activeChapter.icon+' '+activeChapter.title+'</div>'
    +       '<div style="font-size:12px;color:#64748b;margin-top:4px">'+activeChapter.subtitle+'</div>'
    +     '</div>'
    +     '<button onclick="document.getElementById(\'_guide_screen\').remove()" style="padding:6px 14px;background:transparent;border:1px solid #64748b;border-radius:6px;color:#64748b;cursor:pointer;font-size:12px;font-family:inherit;flex-shrink:0;margin-left:16px">✕ Close</button>'
    +   '</div>'
    + activeChapter.visual
    + '<div style="margin-top:20px">'+sectionsHTML+'</div>'
    + '</div>';

  document.body.appendChild(screen);
}


function switchGuideChapter(id) {
  var old = document.getElementById('_guide_screen'); if(old) old.remove();
  openStudentGuide(id);
}

// ── LEARNING MODULE UI ────────────────────────────────────────

// ── MODULE + LESSON SYSTEM ────────────────────────────────────

function handleModuleClick(el) {
  var target = el;
  while(target && !target.dataset.modid) target = target.parentElement;
  if(!target) return;
  var modId  = target.dataset.modid;
  var locked = target.dataset.locked === '1';
  if(locked) { showProModulePreview(modId); return; }
  openModuleDetail(modId);
}

function showProModulePreview(modId) {
  var mod = LEARNING_MODULES.find(function(m){ return m.id===modId; });
  if(!mod) return;
  var old = document.getElementById('_pro_mod_prev'); if(old) old.remove();
  var popup = document.createElement('div');
  popup.id = '_pro_mod_prev';
  popup.style.cssText = 'position:fixed;inset:0;background:rgba(0,5,20,0.92);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Segoe UI,sans-serif;';

  var lessonList = mod.lessons.map(function(l,i) {
    return '<div style="padding:8px 12px;border-bottom:1px solid #1e293b;font-size:12px;color:#64748b;display:flex;align-items:center;gap:10px">'
      + '<span style="width:20px;height:20px;border-radius:50%;background:#1e293b;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#64748b;flex-shrink:0">'+(i+1)+'</span>'
      + '<span>'+l.title+'</span>'
      + '<span style="margin-left:auto;font-size:10px;color:#64748b">'+l.duration+'</span>'
      + '</div>';
  }).join('');

  popup.innerHTML = '<div style="background:#0a0f1e;border:2px solid #b8860b;border-radius:14px;padding:28px;max-width:480px;width:100%">'
    + '<div style="display:inline-flex;align-items:center;gap:6px;padding:3px 12px;background:rgba(184,134,11,0.15);border:1px solid #b8860b;border-radius:20px;font-size:10px;font-weight:700;color:#b8860b;margin-bottom:14px">&#9733; PRO FEATURE</div>'
    + '<div style="font-size:18px;font-weight:800;color:#f1f5f9;margin-bottom:4px">'+mod.icon+' '+mod.title+'</div>'
    + '<div style="font-size:12px;color:#64748b;margin-bottom:16px">'+mod.subtitle+'</div>'
    + '<div style="background:#060f1f;border:1px solid #1e293b;border-radius:8px;overflow:hidden;margin-bottom:18px">'
    + '<div style="padding:10px 12px;background:#0a0f1e;font-size:10px;font-weight:700;color:#38bdf8;letter-spacing:1px">'+mod.lessons.length+' LESSONS INSIDE</div>'
    + lessonList
    + '</div>'
    + '<div style="font-size:12px;color:#64748b;margin-bottom:16px;line-height:1.7">Upgrade to Pro to access this module, take the quiz, and earn the <strong style="color:#b8860b">'+mod.icon+' '+mod.title.split(' ')[0]+'</strong> certificate.</div>'
    + '<button id="_pro_mod_upgrade" style="width:100%;padding:12px;background:linear-gradient(135deg,#b8860b,#d4a843);border:none;border-radius:8px;color:#1a1208;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;margin-bottom:8px">&#9889; Upgrade to Pro</button>'
    + '<button id="_pro_mod_close" style="width:100%;padding:8px;background:transparent;border:1px solid #64748b;border-radius:7px;color:#64748b;font-size:12px;cursor:pointer;font-family:inherit">Maybe later</button>'
    + '</div>';

  document.body.appendChild(popup);
  document.getElementById('_pro_mod_upgrade').onclick = function(){ popup.remove(); if(typeof showUp==='function') showUp(); };
  document.getElementById('_pro_mod_close').onclick   = function(){ popup.remove(); };
}

// ── MODULE DETAIL PAGE ────────────────────────────────────────
function openModuleDetail(modId) {
  var mod = LEARNING_MODULES.find(function(m){ return m.id===modId; });
  if(!mod) return;
  var old = document.getElementById('_module_detail'); if(old) old.remove();

  var screen = document.createElement('div');
  screen.id = '_module_detail';
  screen.style.cssText = 'position:fixed;inset:0;background:#0a0f1e;z-index:99990;overflow-y:auto;font-family:Segoe UI,sans-serif;';

  var pct = _EDU.getModuleProgress(mod.id);
  var allLessonsDone = mod.lessons.every(function(l){ return _EDU.isQuizPassed(l.id); });

  // Certificate requires BOTH: all lessons complete AND enough behaviors
  var certLevel = mod.id==='M1'?1:mod.id==='M2'?2:3;
  var behaviorLevel = _BT.level();
  var behaviorNeeded = certLevel; // level 1=4 behaviors, level 2=7 behaviors, level 3=10 behaviors
  var behaviorOk = behaviorLevel >= certLevel;
  var certUnlocked = allLessonsDone && behaviorOk;
  var lessonsDone = mod.lessons.filter(function(l){ return _EDU.isQuizPassed(l.id); }).length;
  var behaviorsNow = _BT.count();
  var behaviorsNeeded = certLevel===1?4:certLevel===2?7:10;

  var lessonCards = mod.lessons.map(function(l, i) {
    var done    = _EDU.isLessonComplete(l.id);
    var quizOk  = _EDU.isQuizPassed(l.id);
    var status  = quizOk ? 'complete' : done ? 'quiz' : 'start';
    var statusLabel = quizOk ? '✓ Complete' : done ? 'Take Quiz' : 'Start Lesson';
    var statusColor = quizOk ? '#34d399' : done ? '#38bdf8' : '#f97316';
    var statusBg    = quizOk ? 'rgba(52,211,153,0.1)' : done ? 'rgba(56,189,248,0.1)' : 'rgba(249,115,22,0.1)';
    var borderColor = quizOk ? '#34d399' : done ? '#38bdf8' : '#1e293b';

    return '<div style="background:#0a0f1e;border:1.5px solid '+borderColor+';border-radius:10px;padding:18px;margin-bottom:12px;display:flex;align-items:center;gap:16px">'
      + '<div style="width:36px;height:36px;border-radius:50%;background:'+(quizOk?'rgba(52,211,153,0.15)':'#060f1f')+';border:2px solid '+(quizOk?'#34d399':'#1e293b')+';display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:'+(quizOk?'#34d399':'#64748b')+';flex-shrink:0">'
      + (quizOk?'✓':(i+1))+'</div>'
      + '<div style="flex:1">'
      +   '<div style="font-size:13px;font-weight:700;color:#f1f5f9;margin-bottom:3px">'+l.title+'</div>'
      +   '<div style="font-size:11px;color:#64748b">'+l.duration+' · Theory + Practice + Quiz</div>'
      + '</div>'
      + '<button data-lid="'+l.id+'" data-mid="'+mod.id+'" onclick="openLessonFromCard(this)"'
      +   ' style="padding:7px 16px;background:'+statusBg+';border:1px solid '+statusColor+';border-radius:6px;color:'+statusColor+';font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">'
      + statusLabel+'</button>'
      + '</div>';
  }).join('');

  // Build cert status rows
  var lessonRow = '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #0f172a">'
    + '<span style="font-size:16px">'+(allLessonsDone?'✅':'⬜')+'</span>'
    + '<div style="flex:1">'
    +   '<div style="font-size:12px;font-weight:600;color:'+(allLessonsDone?'#34d399':'#f1f5f9')+'">Complete all '+mod.lessons.length+' lesson quizzes</div>'
    +   '<div style="font-size:11px;color:#64748b;margin-top:2px">'+lessonsDone+' / '+mod.lessons.length+' done'+(allLessonsDone?' — ✓ Complete':' — finish remaining lessons')+'</div>'
    + '</div>'
    + '</div>';

  var behaviorRow = '<div style="display:flex;align-items:center;gap:10px;padding:10px 0">'
    + '<span style="font-size:16px">'+(behaviorOk?'✅':'⬜')+'</span>'
    + '<div style="flex:1">'
    +   '<div style="font-size:12px;font-weight:600;color:'+(behaviorOk?'#34d399':'#f1f5f9')+'">Reach Design Confidence '+behaviorsNeeded*10+'%</div>'
    +   '<div style="font-size:11px;color:#64748b;margin-top:2px">Currently '+_BT.confidence()+'%'+(behaviorOk?' — ✓ Achieved':' — keep exploring the design tool')+'</div>'
    +   '<div style="height:4px;background:#1e293b;border-radius:2px;margin-top:6px;overflow:hidden">'
    +     '<div style="height:100%;width:'+Math.min(_BT.confidence(),100)+'%;background:'+(behaviorOk?'#34d399':'#38bdf8')+';border-radius:2px;transition:width 0.5s"></div>'
    +   '</div>'
    + '</div>'
    + '</div>';

  var certBorderColor = certUnlocked ? '#34d399' : allLessonsDone ? '#38bdf8' : '#1e293b';
  var certBg = certUnlocked ? 'rgba(52,211,153,0.05)' : 'rgba(15,23,42,0.5)';

  var certSection = '<div style="margin-top:24px;padding:20px;background:'+certBg+';border:1.5px solid '+certBorderColor+';border-radius:12px">'
    + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">'
    +   '<div style="font-size:30px">'+(certLevel===1?'🥉':certLevel===2?'🥈':'🥇')+'</div>'
    +   '<div>'
    +     '<div style="font-size:15px;font-weight:800;color:'+(certUnlocked?'#34d399':'#f1f5f9')+'">Certificate Quiz'+(certUnlocked?' — Unlocked! 🎉':'')+'</div>'
    +     '<div style="font-size:11px;color:#64748b;margin-top:2px">'+(certUnlocked?'Both requirements met — you can take the quiz now!':'Complete both requirements below to unlock')+'</div>'
    +   '</div>'
    + '</div>'
    + '<div style="background:#060f1f;border-radius:8px;padding:12px 16px;margin-bottom:14px">'
    + lessonRow + behaviorRow
    + '</div>'
    + (certUnlocked
      ? '<button onclick="openCertHub()" style="width:100%;padding:12px;background:linear-gradient(135deg,#065f46,#059669);border:none;border-radius:8px;color:white;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">🏆 Take Certificate Quiz →</button>'
      : '<div style="font-size:11px;color:#64748b;text-align:center;padding:6px">Complete both requirements above to unlock the quiz</div>'
    )
    + '</div>';

  screen.innerHTML = '<div style="max-width:720px;margin:0 auto;padding:28px 20px">'
    + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">'
    +   '<button onclick="document.getElementById(\'_module_detail\').remove();openLearningHub()" style="padding:6px 14px;background:transparent;border:1px solid #64748b;border-radius:6px;color:#64748b;font-size:12px;cursor:pointer;font-family:inherit">← All Modules</button>'
    +   '<div style="flex:1">'
    +     '<div style="font-size:22px;font-weight:900;color:#f1f5f9">'+mod.icon+' '+mod.title+'</div>'
    +     '<div style="font-size:12px;color:#64748b;margin-top:2px">'+mod.subtitle+'</div>'
    +   '</div>'
    +   '<div style="text-align:right">'
    +     '<div style="font-size:22px;font-weight:900;color:'+(mod.color)+'">'+pct+'%</div>'
    +     '<div style="font-size:10px;color:#64748b">complete</div>'
    +   '</div>'
    + '</div>'
    // Progress bar
    + '<div style="height:4px;background:#1e293b;border-radius:2px;margin-bottom:24px;overflow:hidden">'
    +   '<div style="height:100%;width:'+pct+'%;background:'+mod.color+';border-radius:2px;transition:width 0.3s"></div>'
    + '</div>'
    + lessonCards
    + certSection
    + '</div>';

  document.body.appendChild(screen);
}

function openLessonFromCard(el) {
  var lid = el.dataset.lid;
  var mid = el.dataset.mid;
  var mod = LEARNING_MODULES.find(function(m){ return m.id===mid; });
  if(!mod) return;
  var lesson = mod.lessons.find(function(l){ return l.id===lid; });
  if(!lesson) return;
  openLesson(mod, lesson);
}

// ── LEARNING HUB (3 module cards) ────────────────────────────
function openLearningHub() {
  var old = document.getElementById('_module_hub'); if(old) old.remove();
  var screen = document.createElement('div');
  screen.id = '_module_hub';
  screen.style.cssText = 'position:fixed;inset:0;background:#0a0f1e;z-index:99990;overflow-y:auto;font-family:Segoe UI,sans-serif;';

  var cards = LEARNING_MODULES.map(function(mod) {
    var pct    = _EDU.getModuleProgress(mod.id);
    var locked = !mod.free && typeof _userPlan!=='undefined' && _userPlan!=='pro';
    var done   = mod.lessons.filter(function(l){ return _EDU.isQuizPassed(l.id); }).length;

    return '<div data-modid="'+mod.id+'" data-locked="'+(locked?'1':'0')+'" onclick="handleModuleClick(this)"'
      + ' style="background:#0a0f1e;border:1.5px solid '+(locked?'#1e293b':mod.color+'55')+';border-radius:12px;padding:22px;cursor:pointer;position:relative;overflow:hidden">'
      + (locked?'<div style="position:absolute;top:12px;right:12px;background:rgba(184,134,11,0.9);color:#1a1208;font-size:9px;font-weight:700;padding:2px 8px;border-radius:10px">PRO</div>':'')
      + '<div style="font-size:28px;margin-bottom:8px">'+mod.icon+'</div>'
      + '<div style="font-size:16px;font-weight:800;color:'+(locked?'#64748b':mod.color)+';margin-bottom:4px">'+mod.title+'</div>'
      + '<div style="font-size:11px;color:#64748b;margin-bottom:14px">'+mod.subtitle+'</div>'
      // Progress
      + '<div style="display:flex;justify-content:space-between;margin-bottom:6px">'
      +   '<span style="font-size:10px;color:#64748b">'+done+' / '+mod.lessons.length+' lessons done</span>'
      +   '<span style="font-size:10px;color:'+mod.color+';font-weight:700">'+pct+'%</span>'
      + '</div>'
      + '<div style="height:4px;background:#1e293b;border-radius:2px;overflow:hidden;margin-bottom:14px">'
      +   '<div style="height:100%;width:'+pct+'%;background:'+mod.color+';border-radius:2px"></div>'
      + '</div>'
      // Lesson list preview
      + '<div style="font-size:10px;color:#64748b">'
      + mod.lessons.slice(0,3).map(function(l,i){
          var ok = _EDU.isQuizPassed(l.id);
          return '<div style="padding:4px 0;border-bottom:1px solid #0f172a;display:flex;gap:8px;align-items:center">'
            + '<span style="color:'+(ok?'#34d399':'#64748b')+'">'+(ok?'✓':'○')+'</span>'
            + '<span style="color:'+(ok?'#64748b':'#64748b')+'">'+(i+1)+'. '+l.title.split('—')[0].trim()+'</span>'
            + '</div>';
        }).join('')
      + (mod.lessons.length>3?'<div style="padding:4px 0;color:#1e293b">+'+(mod.lessons.length-3)+' more lessons</div>':'')
      + '</div>'
      + '<div style="margin-top:14px;padding:8px 16px;background:'+(locked?'rgba(184,134,11,0.1)':'rgba(56,189,248,0.08)')+';border:1px solid '+(locked?'#b8860b':'rgba(56,189,248,0.3)')+';border-radius:6px;text-align:center;font-size:11px;font-weight:700;color:'+(locked?'#b8860b':'#38bdf8')+'">'
      + (locked?'View Preview & Upgrade →':'Open Module →')
      + '</div>'
      + '</div>';
  }).join('');

  screen.innerHTML = '<div style="max-width:860px;margin:0 auto;padding:28px 20px">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">'
    +   '<div><div style="font-size:24px;font-weight:900;color:#38bdf8">📖 Learning Modules</div>'
    +   '<div style="font-size:12px;color:#64748b;margin-top:3px">Complete all lessons in a module to unlock its certificate quiz</div></div>'
    +   '<button onclick="document.getElementById(\'_module_hub\').remove()" style="padding:7px 16px;background:transparent;border:1px solid #64748b;border-radius:6px;color:#64748b;font-size:12px;cursor:pointer;font-family:inherit">✕ Close</button>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">'
    + cards + '</div></div>';

  document.body.appendChild(screen);
}

// Keep openLearningModules as alias
function openLearningModules(modId) {
  if(modId) { openModuleDetail(modId); }
  else { openLearningHub(); }
}

// ── LESSON VIEWER ─────────────────────────────────────────────
function openLesson(mod, lesson) {
  var old = document.getElementById('_lesson_view'); if(old) old.remove();

  var lessonIdx  = mod.lessons.indexOf(lesson);
  var isDone     = _EDU.isLessonComplete(lesson.id);
  var isQuizDone = _EDU.isQuizPassed(lesson.id);

  var screen = document.createElement('div');
  screen.id = '_lesson_view';
  screen.style.cssText = 'position:fixed;inset:0;background:#0a0f1e;z-index:99991;display:flex;font-family:Segoe UI,sans-serif;overflow:hidden;';

  // Sidebar nav
  var sideNav = mod.lessons.map(function(l, i) {
    var active  = l.id === lesson.id;
    var passed  = _EDU.isQuizPassed(l.id);
    var done    = _EDU.isLessonComplete(l.id);
    return '<div data-lid="'+l.id+'" data-mid="'+mod.id+'" onclick="openLessonFromCard(this)"'
      + ' style="padding:9px 12px;border-radius:6px;cursor:pointer;margin:2px 0;display:flex;align-items:center;gap:8px;'
      + 'background:'+(active?'rgba(56,189,248,0.1)':'transparent')+';'
      + 'border-left:3px solid '+(active?'#38bdf8':passed?'#34d399':'transparent')+'">'
      + '<span style="font-size:11px;color:'+(active?'#38bdf8':passed?'#34d399':'#64748b')+'">'+(passed?'✓':(i+1))+'</span>'
      + '<span style="font-size:11px;color:'+(active?'#38bdf8':passed?'#64748b':'#64748b')+'">'+(i+1)+'. '+l.title.split('—')[0].trim()+'</span>'
      + '</div>';
  }).join('');

  // Quiz HTML
  var quizHTML = '';
  if(isQuizDone) {
    quizHTML = '<div style="background:rgba(52,211,153,0.08);border:1.5px solid #34d399;border-radius:10px;padding:18px;text-align:center">'
      + '<div style="font-size:20px;margin-bottom:8px">🎉</div>'
      + '<div style="font-size:14px;font-weight:700;color:#34d399;margin-bottom:4px">Lesson Complete!</div>'
      + '<div style="font-size:11px;color:#64748b">You passed the quiz for this lesson.</div>'
      + '</div>';
  } else if(!isDone) {
    quizHTML = '<div style="background:#0a0f1e;border:1px solid #1e293b;border-radius:10px;padding:18px;text-align:center">'
      + '<div style="font-size:13px;color:#64748b;margin-bottom:12px">Read the theory and complete the practice task, then mark it done to unlock the quiz.</div>'
      + '<button data-lid="'+lesson.id+'" data-mid="'+mod.id+'" onclick="doneAndShowQuiz(this)"'
      + ' style="padding:9px 20px;background:rgba(249,115,22,0.15);border:1px solid #f97316;border-radius:7px;color:#f97316;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">'
      + '✓ I have done the practice — show quiz</button>'
      + '</div>';
  } else {
    // Show quiz questions
    var qItems = lesson.quiz.map(function(q, qi) {
      var opts = q.opts.map(function(opt, oi) {
        return '<label style="display:flex;align-items:flex-start;gap:10px;padding:9px 12px;border-radius:7px;cursor:pointer;border:1px solid #1e293b;margin-bottom:6px;font-size:12px;color:#94a3b8">'
          + '<input type="radio" name="lq_'+lesson.id+'_'+qi+'" value="'+oi+'" style="margin-top:2px;accent-color:#38bdf8;flex-shrink:0">'
          + opt+'</label>';
      }).join('');
      return '<div style="margin-bottom:20px">'
        + '<div style="font-size:13px;font-weight:600;color:#f1f5f9;margin-bottom:10px">Q'+(qi+1)+'. '+q.q+'</div>'
        + opts+'</div>';
    }).join('');

    quizHTML = '<div style="background:#0a0f1e;border:1.5px solid #38bdf8;border-radius:10px;padding:20px">'
      + '<div style="font-size:11px;font-weight:700;color:#38bdf8;letter-spacing:2px;margin-bottom:16px">LESSON QUIZ — '+lesson.quiz.length+' QUESTIONS</div>'
      + qItems
      + '<button data-lid="'+lesson.id+'" data-mid="'+mod.id+'" onclick="submitLessonQuiz(this)"'
      + ' style="width:100%;padding:11px;background:#1d4ed8;border:none;border-radius:7px;color:white;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">'
      + 'Submit Quiz →</button>'
      + '</div>';
  }

  screen.innerHTML = '<div style="width:220px;background:#0a0f1e;border-right:1px solid #1e293b;padding:16px;overflow-y:auto;flex-shrink:0;display:flex;flex-direction:column">'
    + '<div style="font-size:11px;color:'+mod.color+';font-weight:700;margin-bottom:2px">'+mod.icon+' '+mod.title+'</div>'
    + '<div style="font-size:10px;color:#64748b;margin-bottom:14px">'+mod.lessons.length+' lessons</div>'
    + sideNav
    + '<div style="margin-top:auto;padding-top:16px;border-top:1px solid #1e293b">'
    +   '<button data-mid="'+mod.id+'" onclick="backToDetail(this)"'
    +     ' style="width:100%;padding:7px;background:transparent;border:1px solid #64748b;border-radius:6px;color:#64748b;font-size:11px;cursor:pointer;font-family:inherit">'
    +     '← Back to Module</button>'
    + '</div>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;padding:28px 36px;background:#0a0f1e">'
    +   '<div style="font-size:10px;color:#64748b;margin-bottom:6px">Lesson '+(lessonIdx+1)+' of '+mod.lessons.length+' · '+lesson.duration+'</div>'
    +   '<div style="font-size:22px;font-weight:800;color:#f1f5f9;margin-bottom:22px">'+lesson.title+'</div>'
    // Theory
    +   '<div style="background:#0a0f1e;border:1px solid #1e293b;border-radius:10px;padding:22px;margin-bottom:18px">'
    +     '<div style="font-size:10px;font-weight:700;color:#38bdf8;letter-spacing:2px;margin-bottom:14px">THEORY</div>'
    +     '<div style="font-size:13px;color:#cbd5e1;line-height:1.9">'+lesson.theory+'</div>'
    +   '</div>'
    // Practice
    +   '<div style="background:#0a1a0a;border:1.5px solid rgba(249,115,22,0.4);border-radius:10px;padding:20px;margin-bottom:18px">'
    +     '<div style="font-size:10px;font-weight:700;color:#f97316;letter-spacing:2px;margin-bottom:12px">PRACTICE TASK</div>'
    +     '<div style="font-size:13px;color:#cbd5e1;line-height:1.8">'+lesson.practice+'</div>'
    +   '</div>'
    // Quiz
    +   quizHTML
    + '</div>';

  document.body.appendChild(screen);
}

function doneAndShowQuiz(el) {
  _EDU.completeLesson(el.dataset.lid);
  var mod = LEARNING_MODULES.find(function(m){ return m.id===el.dataset.mid; });
  var lesson = mod ? mod.lessons.find(function(l){ return l.id===el.dataset.lid; }) : null;
  if(mod && lesson) { openLesson(mod, lesson); }
}

function submitLessonQuiz(el) {
  var lid = el.dataset.lid;
  var mid = el.dataset.mid;
  var mod = LEARNING_MODULES.find(function(m){ return m.id===mid; });
  var lesson = mod ? mod.lessons.find(function(l){ return l.id===lid; }) : null;
  if(!lesson) return;

  var correct = 0;
  lesson.quiz.forEach(function(q, qi) {
    var sel = document.querySelector('input[name="lq_'+lid+'_'+qi+'"]:checked');
    if(sel && parseInt(sel.value) === q.ans) correct++;
  });

  var needed = Math.ceil(lesson.quiz.length * 0.67);
  var pass = correct >= needed;

  if(pass) {
    _EDU.passQuiz(lid);
    _BT.updateProgress();
    showCertToast('✓ Passed! '+correct+'/'+lesson.quiz.length+' correct — Lesson complete!', '#34d399');
    setTimeout(function(){
      var old = document.getElementById('_lesson_view'); if(old) old.remove();
      openModuleDetail(mid);
    }, 1200);
  } else {
    showCertToast('✗ '+correct+'/'+lesson.quiz.length+' — need '+needed+' to pass. Try again!', '#f87171');
  }
}

function backToDetail(el) {
  var old = document.getElementById('_lesson_view'); if(old) old.remove();
  openModuleDetail(el.dataset.mid);
}

// ── LEGACY ALIASES ────────────────────────────────────────────
function navToLesson(modId, lessonId) {
  var mod = LEARNING_MODULES.find(function(m){ return m.id===modId; });
  var lesson = mod ? mod.lessons.find(function(l){ return l.id===lessonId; }) : null;
  if(mod && lesson) openLesson(mod, lesson);
}
function navToLessonEl(el)    { navToLesson(el.dataset.mid, el.dataset.lid); }
function markLessonDone(lid)  { _EDU.completeLesson(lid); }
function markLessonEl(el)     { _EDU.completeLesson(el.dataset.lid); }
function backToModules(el)    { var s=document.getElementById('_lesson_screen'); if(s)s.remove(); openModuleDetail(el.dataset.mid); }
function openLessonFromCard(el) {
  var lid = el.dataset.lid, mid = el.dataset.mid;
  var mod = LEARNING_MODULES.find(function(m){ return m.id===mid; });
  var lesson = mod ? mod.lessons.find(function(l){ return l.id===lid; }) : null;
  if(mod && lesson) openLesson(mod, lesson);
}
function checkLessonQuiz2El(btn) { submitLessonQuiz(btn); }
function checkLessonQuiz2(btn,lid,mid) {
  btn.dataset.lid=lid; btn.dataset.mid=mid; submitLessonQuiz(btn);
}
function checkLessonQuiz(lid,quiz,mod,idx) {}



// ── GUIDED DESIGN OVERLAY ─────────────────────────────────────

// ══════════════════════════════════════════════════════════════
// GUIDED DESIGN — 28 STEPS WITH INPUT HIGHLIGHTING
// ══════════════════════════════════════════════════════════════

const GUIDED_STEPS = [

// ─── WELCOME ─────────────────────────────────────────────────
{
  id:'GS0', page:1, highlight:null,
  title:'Welcome — Let’s Build Together',
  what:'We are going to design a real G+2 residential building together from scratch.',
  why:'By the end of this guide you will have a complete structural design following IS 456, IS 1893 and IS 13920 — and you will understand every number in the report.',
  realWorld:'G+2 means Ground floor + 2 upper floors = 3 slabs total. This is the most common residential building type in India.',
  effect:'Each step explains one input — what it means, why it matters, and what real engineers use.',
  action:'next', actionLabel:'Let\'s Start →'
},

// ─── PAGE 1: PROJECT INFO ─────────────────────────────────────
{
  id:'GS1', page:1, highlight:'name',
  title:'Project Name',
  what:'A label for your design. Use a meaningful name like "Sharma Residence G+2" so you can find it later.',
  why:'In professional practice every design is tracked by project name and number. Get into this habit from the start.',
  realWorld:'Real structural drawings always show project name, client name, and drawing number on every sheet.',
  effect:'No structural effect — purely for identification and record keeping.',
  action:'next', actionLabel:'Got it, Next →'
},
{
  id:'GS2', page:1, highlight:'numFloors',
  title:'Number of Floors',
  what:'Total number of floor slabs including ground floor. G+2 = 3 slabs (ground, first, second). Enter 3.',
  why:'Each floor adds to the cumulative load on every column below it. A ground floor column in a G+3 building carries 4 times more than the same column in a G+0 building.',
  realWorld:'Typical residential: G+0 to G+3. Above G+4 you need detailed structural analysis and municipal approval. Most urban plots allow G+3 under normal bylaws.',
  effect:'Most critical input for column and footing size. Double the floors → roughly double the column steel and footing area.',
  action:'next', actionLabel:'Understood →'
},
{
  id:'GS3', page:1, highlight:'floorHt',
  title:'Floor to Floor Height',
  what:'Vertical distance from one floor slab to the next. Enter 3.0m — the standard for comfortable residential spaces.',
  why:'Taller floors mean taller columns, which means more wall height, which means more wall load on beams. Also affects the buildings time period for seismic calculations.',
  realWorld:'Residential: 2.8-3.2m. Commercial offices: 3.5-4.0m. Hospitals/Malls: 4.0-5.0m. Below 2.7m feels cramped — avoid it.',
  effect:'Every extra 0.5m of floor height adds approximately 2-3 kN/m to beam load from the taller brick walls. Also changes the seismic time period slightly.',
  action:'next', actionLabel:'Clear →'
},
{
  id:'GS4', page:1, highlight:'zone',
  title:'Seismic Zone — Most Important Input',
  what:'India is divided into 4 seismic zones (II to V) based on earthquake history and tectonic activity. Select Zone IV.',
  why:'This single input changes your entire design. Zone V requires 3.6 times more seismic force than Zone II. It directly affects column size, stirrup spacing, and foundation design.',
  realWorld:'Zone II: South Tamil Nadu, Andhra coast. Zone III: Mumbai, Kolkata, Bhopal. Zone IV: Delhi, Dehradun, Jammu, Roorkee. Zone V: Himalayan region, Guwahati, Manipur, Andaman.',
  effect:'Going from Zone II to Zone V increases base shear by 3.6x. Column steel typically increases by 40-60%. Ductile detailing per IS 13920 becomes mandatory in Zone III, IV, V.',
  action:'next', actionLabel:'Understood →'
},
{
  id:'GS5', page:1, highlight:'importance',
  title:'Importance Factor',
  what:'A multiplier that increases seismic design force for buildings where failure would have severe consequences. Residential buildings use 1.0.',
  why:'A hospital must stay functional after an earthquake to treat casualties. A school must not collapse while children are inside. These buildings get a higher importance factor so they are designed stronger.',
  realWorld:'I=1.0: Residential, offices, hotels. I=1.2: Industrial structures (not post-earthquake critical). I=1.5: Schools, hospitals, power stations, water towers. I=2.0: Atomic power plants.',
  effect:'Directly multiplies the seismic coefficient Ah. I=1.5 means 50% more seismic design force compared to I=1.0 for the same zone.',
  action:'next', actionLabel:'Got it →'
},
{
  id:'GS6', page:1, highlight:'soilType',
  title:'Soil Type — How Earthquakes Travel',
  what:'The type of soil below your building affects how much the ground shakes during an earthquake. Select Type II (Medium) for most Indian cities.',
  why:'Soft soil amplifies ground motion dramatically. The 1989 Mexico City earthquake showed that soft lakebed soils caused 10x more damage than nearby rock sites — even though the rock sites were closer to the epicentre.',
  realWorld:'Type I (Hard rock/Dense gravel): Most hill stations. Type II (Medium dense sand/gravel): Most urban areas — Delhi, Pune, Bangalore. Type III (Soft clay/fill): Coastal areas, reclaimed land, river deltas — Mumbai suburbs, Chennai coast.',
  effect:'Sa/g (spectral acceleration) is highest for Type III soil. Going from Type I to Type III can increase seismic force by 50-100% depending on the building height.',
  action:'next', actionLabel:'Clear →'
},
{
  id:'GS7', page:1, highlight:'location',
  title:'Location',
  what:'Enter your city name. This is used for the report cover and helps set the wind zone context.',
  why:'Location identifies the site. In professional practice this goes on every drawing — the site address, latitude/longitude, and municipal details are all part of the project documentation.',
  realWorld:'For this exercise enter "New Delhi" or your own city. The seismic and wind zones you set manually are what structurally matters — the location field here is for project records.',
  effect:'No direct structural calculation effect. The zone and soil type you selected above are what drive the structural design.',
  action:'next', actionLabel:'Done with Page 1 →'
},

// ─── PAGE 2: PLAN AND SPANS ───────────────────────────────────
{
  id:'GS8', page:2, highlight:'gridCanvas',
  title:'The Building Plan — Your Structural Grid',
  what:'You are now looking at the building plan. Every dot is a column. Every line connecting dots is a beam. The rectangles between columns are bays where the slab sits.',
  why:'The structural grid is the backbone of the building. Every other design decision flows from this grid — slab thickness, beam depth, column size, footing size.',
  realWorld:'Structural engineers spend more time on the grid layout than any other decision. A well-planned grid saves 15-20% on structural cost compared to a poorly planned one.',
  effect:'The grid you draw here defines every member the software will design. Think of it as drawing the skeleton of your building.',
  action:'next', actionLabel:'I see it →'
},
{
  id:'GS9', page:2, highlight:'structSummary',
  title:'Number of Bays — How Many Column Spacings',
  what:'The current grid has 2 bays in X and 2 bays in Y — meaning 3 column lines in each direction and 4 rectangular bays total. This is perfect for a small residential building.',
  why:'More bays = more columns = shorter spans = smaller beams and slabs but more column foundations. Fewer bays = fewer columns = longer spans = deeper beams and thicker slabs. There is always a trade-off.',
  realWorld:'Small house (5m×7m plot): 2×2 grid. Medium house (7m×10m): 2×3 or 3×3. Apartment building: 3×4 or 4×5. The grid usually follows the room layout — columns at room corners.',
  effect:'Doubling the span (same load) increases beam depth by 1.4x and beam moment by 4x. More columns means more foundations but smaller ones each.',
  action:'next', actionLabel:'Got it →'
},
{
  id:'GS10', page:2, highlight:'structSummary',
  title:'Span Length — The Master Variable',
  what:'The span is the distance between two adjacent column lines. The current spans are 3.5m and 3.0m in X, 4.0m and 3.0m in Y. These are ideal for residential design.',
  why:'Span is the single most important structural variable. It controls beam depth more than any other input. The beam depth must satisfy l/d ≤ 26 for continuous beams — so a 5m beam needs at minimum 5000/26 = 192mm depth.',
  realWorld:'Typical spans: Residential rooms 3.0-4.5m. Living rooms 4.5-6.0m (deeper beams needed). Parking basement 6.0-8.0m (very deep beams or post-tensioning). Shopping mall 8.0-12m (special design needed).',
  effect:'Doubling span from 3m to 6m increases beam moment by 4x and required depth by ~1.7x. The footing under longer-span columns also gets larger because beams deliver more load.',
  action:'next', actionLabel:'Understood →'
},
{
  id:'GS11', page:2, highlight:'geContextPanel',
  title:'Bay Types — What Sits in Each Bay',
  what:'Each rectangular bay in your plan has a type. Regular bay = flat floor slab. Void/Courtyard = no slab (open to sky). Staircase = inclined waist slab, no flat floor. Cantilever = slab or beam projecting beyond last column.',
  why:'Different bay types change the structural behaviour completely. A staircase bay has no flat slab — instead an inclined waist slab carries the steps and deposits load on adjacent beams. A void bay removes mass from seismic weight calculations.',
  realWorld:'Every real building has at least one staircase. Apartments have lift shafts (treated as void). Bungalows have courtyards (void bays). Balconies are often cantilever slabs beyond the last beam.',
  effect:'Staircase bay: adjacent beams get extra load from stair slab reaction. Void bay: reduces seismic weight by that bay\'s area × floor load. Cantilever: moment at fixed end = wL²/2 — requires deep beam at connection.',
  action:'next', actionLabel:'Clear →'
},

// ─── PAGE 3: LOADS ────────────────────────────────────────────
{
  id:'GS12', page:3, highlight:'udlLL',
  title:'Live Load on Floors',
  what:'The load from people, furniture, equipment and anything that moves. For residential floors enter 2.0 kN/m². This means 200 kg per square metre of floor area.',
  why:'IS 875 Part 2 specifies live loads based on building occupancy. Residential floors must be designed for 2.0 kN/m² — even if your actual furniture weighs less. This ensures the floor can handle parties, gatherings and future use changes.',
  realWorld:'Residential: 2.0 kN/m². Office: 4.0 kN/m². Classroom: 4.0 kN/m². Library stacks: 7.5 kN/m². Parking: 4.0 kN/m² (cars). Boiler room: 7.5-10 kN/m². Roof terrace: 4.0 kN/m².',
  effect:'Live load is typically 20-35% of total beam load in a residential building. Increasing LL from 2.0 to 4.0 kN/m² increases beam moment by roughly 20-30% for typical spans and wall loads.',
  action:'next', actionLabel:'Got it →'
},
{
  id:'GS13', page:3, highlight:'udlRoof',
  title:'Live Load on Roof',
  what:'The roof has less activity but still needs to carry maintenance workers, water tanks, solar panels and equipment. Enter 1.5 kN/m² for an accessible roof.',
  why:'IS 875 specifies 0.75 kN/m² for non-accessible roofs (only maintenance) and 1.5 kN/m² for accessible roofs (terrace, garden, amenity space). Most Indian residential roofs are accessible — family members use them.',
  realWorld:'Non-accessible sloped roof: 0.75 kN/m². Flat accessible roof (terrace): 1.5 kN/m². Roof with heavy equipment (AHU, cooling tower): 4.0-7.5 kN/m². Green roof with soil: 5.0-15 kN/m².',
  effect:'Roof slab load is lower than floor slabs because there is no floor above. Roof beams and roof columns carry less load than intermediate floors. This is why roof columns need less steel.',
  action:'next', actionLabel:'Understood →'
},
{
  id:'GS14', page:3, highlight:'floorFinish',
  title:'Floor Finish Load',
  what:'The weight of the finishing layer on top of the structural slab — tiles, adhesive mortar, screed, waterproofing membrane. Enter 1.0 kN/m² for standard ceramic tiles.',
  why:'This load is permanent and must be included in dead load calculations. Many students forget floor finish and underestimate the slab load by 10-15%. A 50mm screed layer alone weighs 1.15 kN/m².',
  realWorld:'Ceramic tiles + adhesive: 0.5 kN/m². Ceramic + screed 50mm: 1.0-1.2 kN/m². Marble/granite: 1.5-2.0 kN/m². Heavy stone + thick mortar: 2.5-3.0 kN/m². Timber flooring: 0.3-0.5 kN/m².',
  effect:'Part of dead load — applied on every floor. For a 3m×4m bay: finish load of 1.0 kN/m² adds 12 kN total to that bay. Over 10 bays on 4 floors that is 480 kN — not negligible.',
  action:'next', actionLabel:'Clear →'
},
{
  id:'GS15', page:3, highlight:'partitions',
  title:'Partition Wall Load',
  what:'Additional allowance for internal partition walls that divide rooms. These are not shown in the structural plan but must be accounted for as an equivalent distributed load.',
  why:'IS 875 Part 2 Clause 3.1.2 allows movable partitions up to 1.5 kN/m² to be treated as equivalent live load. Internal walls can be relocated by future owners — so we cannot treat them as fixed dead load.',
  realWorld:'Light partitions (drywall, glass): 0.5-1.0 kN/m². Medium (light brick, block): 1.0-1.5 kN/m². Heavy (full brick, stone): Treat as dead load separately. For typical residential use 1.0 kN/m².',
  effect:'Added to live load for slab and beam design. For a 3m×4m bay at 1.0 kN/m²: 12 kN additional. This often governs the slab thickness for lightweight partition buildings.',
  action:'next', actionLabel:'Got it →'
},
{
  id:'GS16', page:3, highlight:'wallLoad',
  title:'Wall Load on Beams — The Hidden Dominant Load',
  what:'The weight of the brick wall sitting on each beam. For a 230mm thick brick wall at 3.0m floor height the load is approximately 12-14 kN per metre of beam length.',
  why:'This is often the single largest load on perimeter beams — larger than the slab load for typical residential buildings. Many students underestimate it. The wall load depends on wall thickness, floor height, and the number of door/window openings that reduce wall area.',
  realWorld:'230mm brick wall (standard): ~12 kN/m. 115mm half-brick wall: ~6 kN/m. 200mm AAC block: ~5 kN/m. Glass curtain wall: ~1-2 kN/m. The auto-calculated value shown considers wall height = floor height minus slab thickness.',
  effect:'Perimeter beams carry wall load on one or both sides. An interior corridor beam with walls on both sides gets 24-28 kN/m total wall load — far more than the slab load. This drives the beam to its maximum moment.',
  action:'next', actionLabel:'That makes sense →'
},

// ─── PAGE 4: MATERIALS ────────────────────────────────────────
{
  id:'GS17', page:4, highlight:'fck',
  title:'Concrete Grade (fck)',
  what:'The characteristic compressive strength of concrete in N/mm². Select M25. This means concrete that develops 25 N/mm² strength after 28 days of curing.',
  why:'IS 456 and IS 13920 together mandate minimum M25 for structures in seismic zones III, IV and V. M20 is not allowed because higher grade concrete is more ductile — it absorbs more energy during earthquakes before cracking.',
  realWorld:'M20: Non-seismic, low-rise (not recommended for new construction). M25: Standard for all seismic zone buildings — minimum. M30: Large spans, heavy loads, aggressive environments. M35-M40: High-rise buildings, prestressed structures, marine environments.',
  effect:'Increasing from M25 to M30 increases concrete capacity by ~18%. This typically allows a 5-10% reduction in reinforcement. Higher fck also reduces slab and beam depth slightly as permissible stresses increase.',
  action:'next', actionLabel:'Understood →'
},
{
  id:'GS18', page:4, highlight:'fy',
  title:'Steel Grade — Why Fe500D is Non-Negotiable',
  what:'Select Fe500D. The "500" means yield strength of 500 N/mm². The "D" stands for Ductile — this steel can elongate by 16% before breaking, versus only 10% for ordinary Fe500.',
  why:'IS 13920 Clause 5.3 makes Fe500D mandatory for all reinforcement in seismic zones III, IV and V. During an earthquake, steel must stretch significantly without breaking — allowing the structure to absorb energy and give occupants time to evacuate. Fe415 is no longer accepted in seismic zones.',
  realWorld:'Fe250 (Mild steel): Only for links and ties in non-seismic design. Never use for main bars. Fe415: Older standard, not allowed in seismic zones. Fe500D: Current mandatory standard for all seismic zone RC construction. Fe550D: High-rise buildings where reducing bar diameter is economically important.',
  effect:'Fe500D gives 20% higher yield stress than Fe415. This means approximately 20% less steel by weight for the same design. But the D ductility requirement is what matters structurally — ductile failure gives warning, brittle failure does not.',
  action:'next', actionLabel:'Got it →'
},
{
  id:'GS19', page:4, highlight:'coverSlab',
  title:'Cover to Reinforcement — Protecting the Steel',
  what:'The minimum thickness of concrete between the outer surface and the nearest steel bar. For slabs in moderate exposure (most Indian cities) the cover is 20-25mm.',
  why:'Steel corrodes in the presence of moisture and oxygen. The concrete cover provides a chemical and physical barrier. Once corrosion starts it expands and cracks the concrete — called spalling. Insufficient cover is the most common cause of premature structural deterioration in Indian buildings.',
  realWorld:'Mild exposure (interior, dry): 20mm. Moderate (general urban, humidity): 25-30mm. Severe (industrial, near sea): 40mm. Very severe (marine tidal zone): 50mm. Extreme (direct seawater): 75mm. IS 456 Table 16 gives all values.',
  effect:'Cover is non-structural for strength calculations but critical for durability. The effective depth d = Total depth D - cover - half bar diameter. Larger cover reduces effective depth slightly and requires marginally more steel.',
  action:'next', actionLabel:'Clear →'
},
{
  id:'GS20', page:4, highlight:'coverFtg',
  title:'Footing Cover — 75mm Always',
  what:'Footings always require 75mm cover — the largest of any member. This is mandatory per IS 456 Clause 26.4.2.2 and cannot be reduced.',
  why:'Footings sit in direct contact with soil which contains moisture, salts, sulphates and organic acids. Soil is far more aggressive than exposed air. The 75mm cover provides adequate protection for the 50-100 year design life of the foundation.',
  realWorld:'Some engineers in practice mistakenly use 40mm for footings (same as beams). This is wrong and leads to premature corrosion of footing steel. Foundation repairs cost 5-10x more than superstructure repairs because excavation is required.',
  effect:'The large cover for footings means the effective depth d is significantly less than total depth D. A 400mm deep footing has effective depth of approximately 400-75-16=309mm (for D16 bar). This is why footings are always thicker than you might expect.',
  action:'next', actionLabel:'Important — understood →'
},

// ─── PAGE 5: SOIL AND SITE ────────────────────────────────────
{
  id:'GS21', page:5, highlight:'soilBearing',
  title:'Safe Bearing Capacity — What the Soil Can Hold',
  what:'SBC is the maximum pressure the soil can safely support without excessive settlement or shear failure. Enter 150 kN/m² — a conservative value for typical medium-dense urban soil.',
  why:'This is the most critical geotechnical input. Too high and your footings will be undersized causing settlement. Too low and your footings will be excessively large. The correct value must come from a Soil Investigation report (bore holes + lab tests).',
  realWorld:'Filled/disturbed ground: 50-80 kN/m². Soft clay (Kolkata, Chennai coast): 50-100 kN/m². Alluvial medium sand (Delhi, Lucknow): 100-200 kN/m². Dense gravel (Bangalore, Pune): 200-400 kN/m². Soft rock: 500-1000 kN/m². Hard rock: 3000-10000 kN/m².',
  effect:'SBC directly controls footing size. Halving SBC doubles the footing area. For a column load of 600 kN: SBC=200 → 1.73m×1.73m footing. SBC=100 → 2.45m×2.45m footing. At very low SBC individual footings may merge — requiring a raft foundation.',
  action:'next', actionLabel:'Got it →'
},
{
  id:'GS22', page:5, highlight:'ftgDepth',
  title:'Foundation Depth',
  what:'How deep below ground level the bottom of the footing sits. Enter 1.5m — the standard minimum for most Indian conditions.',
  why:'IS 1904 requires foundations below the zone of seasonal moisture movement (0.5m minimum). In practice 1.5m is used to: (1) reach undisturbed firm soil below the topsoil and fill layers, (2) avoid frost damage in northern India, (3) stay below the level where soil swells and shrinks with moisture changes.',
  realWorld:'Rocky terrain: 0.6-1.0m (depends on rock level). Urban with made-up ground: 1.5-2.0m. Expansive/black cotton soil: 1.5-2.5m. High water table areas: May need to go above water table + special design. Soft compressible soil: May need piles instead of footings.',
  effect:'Foundation depth affects Net SBC = Gross SBC - γ×Df. For Df=1.5m and γ=18 kN/m³: Net SBC = SBC - 27. So a site with gross SBC=150 has net SBC=123 for footing design. Deeper foundations increase this reduction.',
  action:'next', actionLabel:'Understood →'
},

// ─── RUN ANALYSIS ─────────────────────────────────────────────
{
  id:'GS23', page:6, highlight:null,
  title:'Ready to Run Analysis',
  what:'All inputs are set. Click the Run Analysis & Design button. The software will now design every structural member in your building following IS 456, IS 1893, IS 875 and IS 13920.',
  why:'The analysis follows the complete load path: slab loads → beam moments → column loads → footing pressures → seismic forces. Every member is sized to carry its design load with appropriate safety factors.',
  realWorld:'In professional practice this calculation would take a senior engineer 2-3 days per floor using manual methods following IS 456. The software completes it in seconds — but the engineer must understand every output to use it responsibly.',
  effect:'After running you will see: slab panel designs, beam depths and steel, column sizes floor by floor, footing sizes, seismic base shear, and a complete safety check for every member.',
  action:'run', actionLabel:'Run Analysis Now →'
},
{
  id:'GS24', page:7, highlight:null,
  title:'Reading Your Results — Safety Tab First',
  what:'Your results are ready. Always go to the Safety tab first. Green = member passes all checks. Red = member fails — unsafe and must be fixed before the design can be used.',
  why:'The Safety tab gives you a single consolidated pass/fail view across all members. Checking each individual tab first wastes time. One red member can indicate a fundamental design problem that affects multiple other members.',
  realWorld:'In professional structural design the engineer signs off on a drawing only after verifying every member passes every check. A single failing member makes the entire structure non-compliant with IS 456.',
  effect:'If members fail: go back to inputs (← Edit button), change the relevant value, and rerun. Common fixes: Beam deflection fail → increase slab thickness. Column fail → increase column size. Footing fail → increase footing depth.',
  action:'next', actionLabel:'Exploring results now →'
},
{
  id:'GS25', page:7, highlight:null,
  title:'The Learning Experiment — Break Something Intentionally',
  what:'This is how structural engineers truly learn. Go back to inputs and change one X span from 3.5m to 7.0m (double it). Rerun analysis. See what happens to beam depth, beam moment, and whether anything fails.',
  why:'Understanding failure modes is more valuable than always getting a passing design. When you see a beam fail in deflection because the span doubled, you viscerally understand why span is the master variable — not from reading but from seeing it happen.',
  realWorld:'Every experienced engineer has mental models built from years of seeing designs succeed and fail. This experiment in 5 minutes teaches you what would take months to learn from textbooks alone.',
  effect:'Expected changes: Beam depth will increase by 1.5-2x. Beam moment will increase by 4x. Beam shear may fail. Slab may become one-way instead of two-way. After exploring, change span back to 3.5m and rerun.',
  action:'edit', actionLabel:'← Go Back to Edit Inputs'
},
{
  id:'GS26', page:7, highlight:null,
  title:'Explore Each Report Tab',
  what:'Now explore all the report tabs. Slab: see each bay\'s design and bar spacing. Beams: see how depth was determined by deflection. Columns: notice all are 300mm minimum. Footings: corner footings are smaller than interior ones.',
  why:'The report is your complete output document. In real practice you would take this report to site and verify that what is being built matches the design. The WHY? buttons next to every formula explain the IS code clause behind each calculation.',
  realWorld:'A proper structural design report runs 50-100 pages. Every calculation is shown with the IS code reference. This software condenses that into a clear interactive report — understanding it is the skill.',
  effect:'Nothing to change here — just explore. Click on individual bay panels in the Slab tab. Click on beam B-1 in the Beams tab. Look at the C-5 floor summary in Columns — see how load accumulates floor by floor.',
  action:'next', actionLabel:'Explored! What\'s next →'
},
{
  id:'GS27', page:7, highlight:null,
  title:'Download Your Report',
  what:'You can download the full PDF report showing every calculation for every member. This is a Pro feature — upgrade to download. Free users can view everything in the browser.',
  why:'The PDF report is formatted for professional use — suitable for submission to municipal authorities, structural review, and site reference. It includes all IS code references and member schedules.',
  realWorld:'Every building permission in India requires a structural stability certificate signed by a licensed structural engineer with calculations. The type of detailed report StructLearn Pro generates is what forms the basis for those calculations.',
  effect:'Free: View complete report in browser. Pro: Download as PDF, Construction drawings, Export project data.',
  action:'next', actionLabel:'I understand →'
},
{
  id:'GS28', page:0, highlight:null,
  title:'Guided Design Complete!',
  what:'You have gone from zero to a complete structural design of a G+2 residential building. Every input explained. Every output understood.',
  why:'You now know: what every input means, why it matters, what real engineers use, and how it affects the structure. This is the foundation of structural engineering judgment.',
  realWorld:'A junior engineer at a structural consultancy learns exactly this in their first 3-6 months. You just compressed that into 30 minutes of guided practice.',
  effect:'Next steps: 1) Explore Learning Modules for deeper theory on each topic. 2) Try designing a different building — change the zone, spans, or number of floors. 3) Check My Certificates to see your progress toward the certificate quiz.',
  action:'close', actionLabel:'Start Designing on My Own →'
}

]; // end GUIDED_STEPS



let _guideStep = 0;
let _guideActive = false;

function startGuidedDesign() {
  _guideStep = 0;
  _guideActive = true;
  showGuideStep();
}

function showGuideStep() {
  const old = document.getElementById('_guide_overlay'); if(old) old.remove();
  removeGuideHighlight();
  if(_guideStep >= GUIDED_STEPS.length) { _guideActive = false; return; }
  const step = GUIDED_STEPS[_guideStep];

  // Navigate to correct page
  if(step.page && step.page > 0 && typeof go === 'function') go(step.page);

  // Highlight input field after page renders
  if(step.highlight) {
    setTimeout(function() { addGuideHighlight(step.highlight); }, 400);
  }

  const overlay = document.createElement('div');
  overlay.id = '_guide_overlay';
  overlay.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9995;font-family:Segoe UI,sans-serif;box-shadow:0 -6px 30px rgba(0,0,0,0.6);';

  const total = GUIDED_STEPS.length;
  const pct   = Math.round((_guideStep / total) * 100);

  // Build step dots
  const dots = Array.from({length:total}, function(_,i) {
    return '<div style="width:'+(i===_guideStep?'20px':'6px')+';height:6px;border-radius:3px;background:'+(i<_guideStep?'#34d399':i===_guideStep?'#38bdf8':'#1e293b')+';transition:all 0.3s;flex-shrink:0"></div>';
  }).join('');

  overlay.innerHTML =
    // Progress bar
    '<div style="height:3px;background:#1e293b">'
    + '<div style="height:100%;width:'+pct+'%;background:#38bdf8;transition:width 0.4s"></div>'
    + '</div>'
    // Step dots row
    + '<div style="display:flex;align-items:center;gap:4px;padding:6px 16px;background:#060f1f;border-top:1px solid #1e293b;overflow-x:auto">'
    + '<span style="font-size:12px;color:#64748b;font-weight:600;white-space:nowrap;margin-right:8px">Step '+(_guideStep+1)+' of '+total+'</span>'
    + dots
    + '<span style="margin-left:auto;font-size:12px;color:#64748b;font-weight:600;white-space:nowrap">'+pct+'% complete</span>'
    + '</div>'
    // Main content area
    + '<div style="display:flex;background:#0a0f1e;border-top:2px solid #1e40af;max-height:300px">'
    // Left: step title + 4 explanation rows
    + '<div style="flex:1;overflow-y:auto;padding:16px 22px">'
    +   '<div style="font-size:15px;font-weight:800;color:#38bdf8;margin-bottom:10px">🎯 '+step.title+'</div>'
    +   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
    +     '<div style="background:#060f1f;border-radius:8px;padding:12px">'
    +       '<div style="font-size:11px;font-weight:700;color:#f97316;letter-spacing:1px;margin-bottom:6px">WHAT IT IS</div>'
    +       '<div style="font-size:13px;color:#f1f5f9;line-height:1.7">'+step.what+'</div>'
    +     '</div>'
    +     '<div style="background:#060f1f;border-radius:7px;padding:10px">'
    +       '<div style="font-size:11px;font-weight:700;color:#f87171;letter-spacing:1px;margin-bottom:6px">WHY IT MATTERS</div>'
    +       '<div style="font-size:13px;color:#f1f5f9;line-height:1.7">'+step.why+'</div>'
    +     '</div>'
    +     '<div style="background:#060f1f;border-radius:7px;padding:10px">'
    +       '<div style="font-size:11px;font-weight:700;color:#34d399;letter-spacing:1px;margin-bottom:6px">REAL BUILDINGS USE</div>'
    +       '<div style="font-size:13px;color:#f1f5f9;line-height:1.7">'+step.realWorld+'</div>'
    +     '</div>'
    +     '<div style="background:#060f1f;border-radius:7px;padding:10px">'
    +       '<div style="font-size:11px;font-weight:700;color:#a78bfa;letter-spacing:1px;margin-bottom:6px">EFFECT ON STRUCTURE</div>'
    +       '<div style="font-size:13px;color:#f1f5f9;line-height:1.7">'+step.effect+'</div>'
    +     '</div>'
    +   '</div>'
    + '</div>'
    // Right: navigation
    + '<div style="width:180px;flex-shrink:0;display:flex;flex-direction:column;justify-content:center;padding:14px 12px;gap:8px;border-left:1px solid #1e293b;background:#060f1f">'
    +   '<button data-action="'+step.action+'" data-page="'+step.page+'" onclick="guideNextBtn(this)"'
    +     ' style="padding:11px;background:linear-gradient(135deg,#1d4ed8,#2563eb);border:none;border-radius:7px;color:white;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;text-align:center">'
    +     step.actionLabel
    +   '</button>'
    +   (_guideStep > 0
      ? '<button onclick="prevGuideStep()" style="padding:9px;background:transparent;border:1px solid #64748b;border-radius:7px;color:#64748b;font-size:12px;cursor:pointer;font-family:inherit">← Previous</button>'
      : '')
    +   '<button onclick="exitGuide()" style="padding:5px;background:transparent;border:none;color:#64748b;font-size:10px;cursor:pointer;font-family:inherit">✕ Exit Guide</button>'
    + '</div>'
    + '</div>';

  document.body.appendChild(overlay);

  // Push main content up so bottom bar doesn't cover inputs
  const main = document.getElementById('main');
  if(main) main.style.paddingBottom = '360px';
}

// ── INPUT HIGHLIGHTING ────────────────────────────────────────
function addGuideHighlight(fieldId) {
  removeGuideHighlight();
  // Try direct ID first
  var el = document.getElementById(fieldId);
  // If not found try the label container
  if(!el) {
    var labels = document.querySelectorAll('label');
    for(var i=0;i<labels.length;i++){
      if(labels[i].getAttribute('for')===fieldId){
        el = labels[i].closest('.fld-wrap, div, td') || labels[i];
        break;
      }
    }
  }
  // Try finding by name attribute
  if(!el) el = document.querySelector('[name="'+fieldId+'"]');
  // Try finding input near a label containing the field key
  if(!el) {
    var all = document.querySelectorAll('input, select');
    for(var j=0;j<all.length;j++){
      if(all[j].id===fieldId || (all[j].getAttribute && all[j].getAttribute('data-key')===fieldId)){
        el = all[j]; break;
      }
    }
  }
  if(!el) return;

  // Scroll to element
  el.scrollIntoView({behavior:'smooth', block:'center'});

  // Add highlight
  el.style.outline = '3px solid #38bdf8';
  el.style.outlineOffset = '4px';
  el.style.boxShadow = '0 0 20px rgba(56,189,248,0.4)';
  el.style.borderRadius = '6px';
  el.dataset.guideHighlighted = '1';

  // Also highlight parent container if it's a label-input pair
  var parent = el.closest ? el.closest('.field, .fld, div[style]') : null;
  if(parent && parent !== el) {
    parent.style.outline = '2px solid rgba(56,189,248,0.3)';
    parent.style.borderRadius = '8px';
    parent.dataset.guideHighlighted = '1';
  }
}

function removeGuideHighlight() {
  document.querySelectorAll('[data-guide-highlighted]').forEach(function(el) {
    el.style.outline = '';
    el.style.outlineOffset = '';
    el.style.boxShadow = '';
    el.style.borderRadius = '';
    delete el.dataset.guideHighlighted;
  });
}


function nextGuideStep(action, page) {
  const overlay = document.getElementById('_guide_overlay');
  if(overlay) overlay.remove();
  removeGuideHighlight();

  if(action === 'run') {
    if(typeof go === 'function') go(6);
    setTimeout(() => {
      if(typeof runNow === 'function') runNow();
      setTimeout(() => { _guideStep++; showGuideStep(); }, 2000);
    }, 300);
    return;
  }
  if(action === 'edit') {
    if(typeof go === 'function') go(1);
    return;
  }
  if(action === 'close') {
    exitGuide();
    _BT.mark('B9');
    showCertToast('Guided Design complete! 🎉 Check your certificate progress.', '#34d399');
    return;
  }
  if(page && typeof go === 'function') go(page);
  _guideStep++;
  setTimeout(showGuideStep, 300);
}

function guideNextBtn(el) {
  nextGuideStep(el.dataset.action, parseInt(el.dataset.page)||0);
}

function prevGuideStep() {
  if(_guideStep > 0) { _guideStep--; showGuideStep(); }
}

function exitGuide() {
  _guideActive = false;
  const overlay = document.getElementById('_guide_overlay');
  if(overlay) overlay.remove();
  removeGuideHighlight();
  const main = document.getElementById('main');
  if(main) main.style.paddingBottom = '';
}

// ── ADD EDUCATION BUTTONS TO LEARNING PANEL ──────────────────
// Show guided design prompt on first visit
(function checkFirstVisit(){
  window.addEventListener('load', () => {
    setTimeout(() => {
      if(!localStorage.getItem('slp_visited')) {
        localStorage.setItem('slp_visited', '1');
        // Show welcome prompt after 3 seconds
        setTimeout(() => {
          if(!_guideActive) {
            const prompt = document.createElement('div');
            prompt.id = '_welcome_modal';
            prompt.style.cssText = 'position:fixed;inset:0;background:rgba(0,5,20,0.92);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Segoe UI,sans-serif;';
            prompt.innerHTML = '<div style="background:#0a0f1e;border:2px solid #1d4ed8;border-radius:16px;padding:36px;max-width:500px;width:100%;text-align:center">'
              + '<div style="font-size:52px;margin-bottom:16px">&#127959;</div>'
              + '<div style="font-size:22px;font-weight:900;color:#38bdf8;margin-bottom:8px">Welcome to StructLearn Pro!</div>'
              + '<div style="font-size:13px;color:#64748b;line-height:1.8;margin-bottom:24px">The complete IS 456 structural design learning platform.<br>Design real buildings. Earn verified certificates.</div>'
              + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px">'
              +   '<div style="padding:14px;background:#060f1f;border:1px solid #1e3a8a;border-radius:10px">'
              +     '<div style="font-size:22px;margin-bottom:6px">&#127919;</div>'
              +     '<div style="font-size:12px;font-weight:700;color:#38bdf8;margin-bottom:4px">Guided Design</div>'
              +     '<div style="font-size:10px;color:#64748b;line-height:1.5">Step-by-step walkthrough — I explain every decision</div>'
              +   '</div>'
              +   '<div style="padding:14px;background:#060f1f;border:1px solid #1e3a8a;border-radius:10px">'
              +     '<div style="font-size:22px;margin-bottom:6px">&#127942;</div>'
              +     '<div style="font-size:12px;font-weight:700;color:#38bdf8;margin-bottom:4px">Earn Certificates</div>'
              +     '<div style="font-size:10px;color:#64748b;line-height:1.5">Complete designs and quizzes to earn IS 456 certificates</div>'
              +   '</div>'
              + '</div>'
              + '<button id="_wm_guided_btn" style="width:100%;padding:14px;background:linear-gradient(135deg,#1d4ed8,#2563eb);border:none;border-radius:9px;color:white;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;margin-bottom:10px">'
              +   '&#127919; Start Guided Design (Recommended)'
              + '</button>'
              + '<button id="_wm_skip_btn" style="width:100%;padding:10px;background:transparent;border:1px solid #64748b;border-radius:8px;color:#64748b;font-size:12px;cursor:pointer;font-family:inherit">'
              +   "I'll explore on my own &#8594;"
              + '</button>'
              + '</div>';
            document.body.appendChild(prompt);
            document.getElementById('_wm_guided_btn').onclick = function(){ startGuidedDesign(); document.getElementById('_welcome_modal').remove(); };
            document.getElementById('_wm_skip_btn').onclick = function(){ document.getElementById('_welcome_modal').remove(); };
          }
        }, 2000);
      }
    }, 1000);
  });
})();

// ── PRO SECTION PREVIEW ───────────────────────────────────────
function showProPreview(navId, label, desc) {
  // If user is pro, just go to the page
  if(typeof _userPlan !== 'undefined' && _userPlan === 'pro') {
    const pageNum = parseInt(navId.replace('n',''));
    if(typeof go === 'function') go(pageNum);
    return;
  }

  // Show info popup
  const old = document.getElementById('_pro_preview'); if(old) old.remove();
  const popup = document.createElement('div');
  popup.id = '_pro_preview';
  popup.style.cssText = 'position:fixed;inset:0;background:rgba(0,5,20,0.85);z-index:9990;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Segoe UI,sans-serif;';
  popup.innerHTML = '<div style="background:#0a0f1e;border:2px solid #b8860b;border-radius:14px;padding:28px;max-width:440px;width:100%;text-align:center">'
    + '<div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(184,134,11,0.15);border:1px solid #b8860b;border-radius:20px;font-size:10px;font-weight:700;color:#b8860b;margin-bottom:16px">&#9733; PRO FEATURE</div>'
    + '<div style="font-size:18px;font-weight:800;color:#f1f5f9;margin-bottom:10px">'+label+'</div>'
    + '<div style="font-size:13px;color:#64748b;line-height:1.8;margin-bottom:24px">'+desc+'</div>'
    + '<div style="background:#060f1f;border:1px solid #1e293b;border-radius:10px;padding:14px;margin-bottom:20px;text-align:left">'
    +   '<div style="font-size:10px;font-weight:700;color:#64748b;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">What you get with Pro</div>'
    +   '<div style="font-size:12px;color:#cbd5e1;line-height:1.9">'
    +     '&#10003; This feature + all other Pro sections<br>'
    +     '&#10003; Download PDF reports<br>'
    +     '&#10003; Construction drawing package<br>'
    +     '&#10003; Unlimited project saves<br>'
    +     '&#10003; Proficiency &amp; Competent certificates'
    +   '</div>'
    + '</div>'
    + '<button id="_pro_upgrade_btn" style="width:100%;padding:13px;background:linear-gradient(135deg,#b8860b,#d4a843);border:none;border-radius:8px;color:#1a1208;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;margin-bottom:10px">'
    +   '&#9889; Upgrade to Pro &#8212; &#8377;299/month'
    + '</button>'
    + '<button id="_pro_close_btn" style="width:100%;padding:9px;background:transparent;border:1px solid #64748b;border-radius:7px;color:#64748b;font-size:12px;cursor:pointer;font-family:inherit">'
    +   'Maybe later'
    + '</button>'
    + '</div>';
  document.body.appendChild(popup);
  document.getElementById('_pro_upgrade_btn').onclick = function(){
    popup.remove();
    if(typeof showUp==='function') showUp();
  };
  document.getElementById('_pro_close_btn').onclick = function(){ popup.remove(); };
}

// Update pro section visibility when plan changes
function updateSidebarForPlan(plan) {
  document.querySelectorAll('.nav-pro-item').forEach(el => {
    if(plan === 'pro') {
      el.style.opacity = '1';
      const badge = el.querySelector('span');
      if(badge) badge.style.display = 'none';
    } else {
      el.style.opacity = '0.7';
      const badge = el.querySelector('span');
      if(badge) badge.style.display = '';
    }
  });
}


// ══════════════════════════════════════════════════════════════
// STUDENT ANALYTICS TRACKER — Phase A+B
// Sends events to index.html via postMessage → Supabase
// ══════════════════════════════════════════════════════════════

const _TRACK = {
  sessionStart: Date.now(),
  pageViews: {},
  analysisCount: 0,
  failureCount: 0,
  fixCount: 0,
  currentFloors: 0,
  currentZone: 'II',
  whyClicks: 0,
  tabsViewed: new Set(),
  lastFlush: Date.now(),

  // Send event to index.html which writes to Supabase
  emit(type, data) {
    try {
      window.parent.postMessage({
        type: 'TRACK_EVENT',
        eventType: type,
        eventData: data || {}
      }, '*');
    } catch(e) {}
  },

  // Track page view
  trackPage(pageNum) {
    var k = 'p' + pageNum;
    this.pageViews[k] = (this.pageViews[k] || 0) + 1;
  },

  // Track analysis run
  trackAnalysis(S, RES) {
    this.analysisCount++;
    var floors = S.numFloors || 0;
    var zone = S.zone || 'II';
    var spans = (S.spansX||[]).concat(S.spansY||[]);
    var maxSpan = spans.length ? Math.max.apply(null, spans) : 0;
    var hasIrregular = false;

    // Check for irregular bays
    if(typeof GRID !== 'undefined' && GRID.bayTypes) {
      var types = Object.values(GRID.bayTypes);
      hasIrregular = types.some(function(t){ return t !== 'regular'; });
    }

    // Complexity score for this design
    var complexity = 0;
    complexity += Math.min((floors - 2) * 2, 10);
    complexity += {II:1, III:2, IV:4, V:6}[zone] || 1;
    complexity += hasIrregular ? 3 : 0;
    complexity += maxSpan > 5 ? 3 : maxSpan > 4 ? 1 : 0;

    // Count failures
    var hadFailure = false;
    if(RES) {
      var failCount = 0;
      if(RES.allBeams) RES.allBeams.forEach(function(b){ if(b.fail) failCount++; });
      if(RES.allCols)  RES.allCols.forEach(function(c){ if(c.fail) failCount++; });
      if(RES.allFtgs)  RES.allFtgs.forEach(function(f){ if(f.fail) failCount++; });
      hadFailure = failCount > 0;
      if(hadFailure) this.failureCount++;
    }

    // Update max tracking
    if(floors > this.currentFloors) this.currentFloors = floors;
    this.currentZone = zone;

    this.emit('analysis_run', {
      floors: floors,
      zone: zone,
      maxSpan: maxSpan,
      hasIrregular: hasIrregular,
      complexity: complexity,
      hadFailure: hadFailure,
      fck: S.fck || 25,
      fy: S.fy || 500
    });

    // Flush session data every analysis
    this.flushSession();
  },

  // Track WHY button click
  trackWhy(context) {
    this.whyClicks++;
    this.emit('why_clicked', { context: context, total: this.whyClicks });
  },

  // Track report tab view
  trackReportTab(tabName) {
    this.tabsViewed.add(tabName);
    this.emit('report_tab_viewed', { tab: tabName, totalTabs: this.tabsViewed.size });
  },

  // Track zone change
  trackZoneChange(newZone, oldZone) {
    this.emit('zone_changed', { from: oldZone, to: newZone });
  },

  // Track lesson quiz passed
  trackLessonQuiz(lessonId, score, attempts) {
    this.emit('lesson_quiz_passed', { lessonId: lessonId, score: score, attempts: attempts });
    this.flushSession();
  },

  // Track cert earned
  trackCertEarned(level, certId) {
    this.emit('cert_earned', { level: level, certId: certId });
    this.flushSession();
  },

  // Track student guide chapter read
  trackGuideChapter(chapterId) {
    this.emit('guide_chapter_read', { chapter: chapterId });
  },

  // Track failure fixed (ran analysis again and passed)
  trackFailureFixed(memberType) {
    this.fixCount++;
    this.emit('failure_fixed', { memberType: memberType, totalFixes: this.fixCount });
  },

  // Flush current session data to Supabase
  flushSession() {
    var now = Date.now();
    var durationMin = Math.round((now - this.sessionStart) / 60000);
    window.parent.postMessage({
      type: 'FLUSH_SESSION',
      duration: durationMin,
      pageViews: this.pageViews,
      analysisRuns: this.analysisCount,
      failureCount: this.failureCount,
      fixCount: this.fixCount,
      maxFloors: this.currentFloors,
      maxZone: this.currentZone,
      whyClicks: this.whyClicks,
      tabsViewed: Array.from(this.tabsViewed)
    }, '*');
    this.lastFlush = now;
  },

  // Start session timer — flush every 5 minutes
  init() {
    var self = this;
    setInterval(function(){ self.flushSession(); }, 5 * 60 * 1000);
    window.addEventListener('beforeunload', function(){ self.flushSession(); });
  }
};

// ── HOOK INTO EXISTING FUNCTIONS ─────────────────────────────

// Hook go() for page tracking
(function(){
  var _origGo = go;
  go = function(n) {
    _origGo(n);
    _TRACK.trackPage(n);
  };
})();

// Hook runNow() for analysis tracking
(function(){
  var _origRun = typeof runNow === 'function' ? runNow : null;
  if(_origRun) {
    runNow = function() {
      _origRun();
      setTimeout(function(){
        if(typeof S !== 'undefined' && typeof RES !== 'undefined') {
          _TRACK.trackAnalysis(S, RES);
        }
      }, 1500);
    };
  }
})();

// Hook _EDU.passQuiz for lesson tracking
(function(){
  var _origPassQuiz = _EDU.passQuiz.bind(_EDU);
  _EDU.passQuiz = function(lessonId) {
    _origPassQuiz(lessonId);
    _TRACK.trackLessonQuiz(lessonId, 0, 1);
  };
})();

// Initialize tracker
_TRACK.init();

// Restore behavior tracker from localStorage (survives hard refresh / Ctrl+Shift+R)
_BT._loadLocal();

// ── RESTORE PROGRESS FROM SUPABASE (cross-device) ────────────
window.addEventListener('message', function(e) {
  if(!e.data || e.data.type !== 'RESTORE_PROGRESS') return;
  var prog = e.data.progress;
  if(!prog) return;
  if(prog.lessons && Object.keys(prog.lessons).length > 0) {
    var existing = _EDU.getProgress();
    // Supabase is authoritative — it wins over local cache
    var merged = Object.assign({}, existing, prog.lessons);
    localStorage.setItem('slp_edu_progress', JSON.stringify(merged));
  }
  if(prog.behaviors) {
    _BT.importFrom(prog.behaviors);
    // Update all confidence UI — retry if panel not built yet
    function applyConfidenceUI() {
      var bar = document.getElementById('_cert_bar_fill');
      var txt = document.getElementById('_cert_confidence');
      var lvl = document.getElementById('_cert_level_text');
      var pct = _BT.confidence();
      if(bar) bar.style.width = pct + '%';
      if(txt) txt.textContent = pct + '%';
      if(lvl) {
        var lv = _BT.level();
        lvl.textContent = lv===0?'Keep exploring...':
          lv===1?'🥉 Foundation unlocked — take the quiz!':
          lv===2?'🥈 Proficiency unlocked — take the quiz!':
          '🥇 Competent unlocked — take the quiz!';
        lvl.style.color = lv===0?'#64748b':lv===1?'#d97706':lv===2?'#94a3b8':'#b8860b';
      }
    }
    applyConfidenceUI();
    // Panel might not be built yet — retry after it loads
    setTimeout(applyConfidenceUI, 2500);
    setTimeout(applyConfidenceUI, 5000);
  }
  if(prog.quizAttempts) {
    Object.keys(prog.quizAttempts).forEach(function(lv) {
      var data = prog.quizAttempts[lv];
      if(data.attempts > 0) {
        var stored = parseInt(localStorage.getItem('slp_quiz_att_'+lv)||'0');
        if(data.attempts > stored) localStorage.setItem('slp_quiz_att_'+lv, data.attempts);
      }
      if(data.cooldownEnd && parseInt(data.cooldownEnd) > Date.now()) {
        var stored2 = parseInt(localStorage.getItem('slp_quiz_cd_'+lv)||'0');
        if(parseInt(data.cooldownEnd) > stored2) localStorage.setItem('slp_quiz_cd_'+lv, data.cooldownEnd);
      }
    });
  }
});

// ── GAME CHALLENGE SYSTEM ─────────────────────────────────────
var _CHALLENGES = {
  lastShown: 0,
  MIN_GAP: 8 * 60 * 1000,
  shown: [],

  CHALLENGES: [
    {
      id: 'extra_floor', trigger: 'analysis_pass',
      title: 'SURVIVAL CHALLENGE', emoji: '🏗',
      hook: 'Your building just passed.',
      challenge: 'Can it survive one more floor?',
      stakes: 'Add a floor. Something might break. Most students are wrong about which member fails first.',
      btnText: 'ADD THE FLOOR',
      btnColor: 'linear-gradient(135deg,#dc2626,#b91c1c)',
      action: function() {
        var el = document.getElementById('floors');
        if(el){ el.value = parseInt(el.value||2)+1; el.dispatchEvent(new Event('change')); }
        go(6); setTimeout(runNow, 300);
      }
    },
    {
      id: 'zone_iv', trigger: 'analysis_pass',
      skipZones: ['IV','V'],
      title: 'EARTHQUAKE CHALLENGE', emoji: '⚡',
      hook: 'Your building is safe in this zone.',
      challenge: 'But what if the site moves to Delhi?',
      stakes: 'Zone IV. 4x the earthquake force. Does your design survive?',
      btnText: 'MOVE TO DELHI — ZONE IV',
      btnColor: 'linear-gradient(135deg,#d97706,#b45309)',
      action: function() {
        var el = document.getElementById('seismicZone');
        if(el){ el.value='IV'; el.dispatchEvent(new Event('change')); }
        go(6); setTimeout(runNow, 300);
      }
    },
    {
      id: 'weak_soil', trigger: 'analysis_pass',
      title: 'SOFT SOIL CHALLENGE', emoji: '🌊',
      hook: 'Good soil. Safe footings.',
      challenge: 'Now try black cotton coastal soil. SBC = 80.',
      stakes: 'Same building. Same loads. How big do the footings get?',
      btnText: 'SWITCH TO WEAK SOIL',
      btnColor: 'linear-gradient(135deg,#0d9488,#0f766e)',
      action: function() {
        var el = document.getElementById('sbc') || document.getElementById('bearingCap');
        if(el){ el.value=80; el.dispatchEvent(new Event('change')); }
        go(6); setTimeout(runNow, 300);
      }
    },
    {
      id: 'fix_and_check', trigger: 'failure_fixed',
      title: 'CHAIN REACTION CHECK', emoji: '🔧',
      hook: 'You fixed the failure.',
      challenge: 'Did fixing it create a new problem?',
      stakes: 'Heavier fix = more load on columns below. Check if they noticed.',
      btnText: 'CHECK COLUMNS NOW',
      btnColor: 'linear-gradient(135deg,#059669,#047857)',
      action: function() { go(7); }
    }
  ],

  canShow: function() {
    if(Date.now() - this.lastShown < this.MIN_GAP) return false;
    var self = this;
    return this.CHALLENGES.some(function(c){ return self.shown.indexOf(c.id) < 0; });
  },

  getChallenge: function(triggerName, context) {
    var self = this;
    var candidates = this.CHALLENGES.filter(function(c) {
      if(self.shown.indexOf(c.id) >= 0) return false;
      if(c.trigger !== triggerName) return false;
      if(c.skipZones && context && c.skipZones.indexOf(context.zone) >= 0) return false;
      return true;
    });
    if(!candidates.length) return null;
    return candidates[Math.floor(Math.random()*candidates.length)];
  },

  show: function(challenge) {
    if(!challenge) return;
    var old = document.getElementById('_challenge_popup');
    if(old) old.remove();
    this.shown.push(challenge.id);
    this.lastShown = Date.now();

    var popup = document.createElement('div');
    popup.id = '_challenge_popup';
    popup.style.cssText = 'position:fixed;inset:0;z-index:99995;display:flex;align-items:center;justify-content:center;padding:20px;font-family:sans-serif;';

    var backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(3px);';
    backdrop.onclick = function(){ popup.remove(); };
    popup.appendChild(backdrop);

    var card = document.createElement('div');
    card.style.cssText = 'position:relative;z-index:2;background:linear-gradient(135deg,#111827,#1a2236);border:2px solid #374e6e;border-radius:20px;padding:36px;max-width:440px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,0.7);';
    card.innerHTML = ''
      + '<style>@keyframes chIn{from{opacity:0;transform:scale(0.85) translateY(30px)}to{opacity:1;transform:scale(1) translateY(0)}}</style>'
      + '<div style="animation:chIn 0.4s cubic-bezier(0.22,1,0.36,1) both">'
      + '<div style="display:inline-block;padding:4px 14px;background:rgba(220,38,38,0.15);border:1px solid rgba(220,38,38,0.4);border-radius:100px;font-size:10px;font-weight:900;color:#f87171;letter-spacing:2px;margin-bottom:20px">🎮 ' + challenge.title + '</div>'
      + '<div style="font-size:56px;text-align:center;margin-bottom:14px">' + challenge.emoji + '</div>'
      + '<div style="font-size:13px;color:#94a3b8;text-align:center;margin-bottom:8px">' + challenge.hook + '</div>'
      + '<div style="font-size:20px;font-weight:900;color:#f1f5f9;text-align:center;line-height:1.3;margin-bottom:16px">' + challenge.challenge + '</div>'
      + '<div style="font-size:12px;color:#94a3b8;text-align:center;padding:12px;background:rgba(255,255,255,0.04);border-radius:10px;margin-bottom:22px">' + challenge.stakes + '</div>'
      + '<button id="_ch_btn" style="width:100%;padding:15px;background:' + challenge.btnColor + ';border:none;border-radius:12px;color:white;font-size:14px;font-weight:900;cursor:pointer;font-family:sans-serif;margin-bottom:10px;">' + challenge.btnText + '</button>'
      + '<div style="text-align:center"><button onclick="closeChallengePopup()" style="background:none;border:none;color:#475569;font-size:11px;cursor:pointer;">skip</button></div>'
      + '</div>';

    popup.appendChild(card);
    document.body.appendChild(popup);

    document.getElementById('_ch_btn').addEventListener('click', function() {
      popup.remove();
      try { challenge.action(); } catch(e) {}
    });
  },

  trigger: function(triggerName, context) {
    if(!this.canShow()) return;
    var ch = this.getChallenge(triggerName, context);
    if(ch) { var self = this; setTimeout(function(){ self.show(ch); }, 1800); }
  }
};

function closeChallengePopup(){var el=document.getElementById("_challenge_popup");if(el)el.remove();}

// Hook runNow for challenges
(function(){
  var _origRun = runNow;
  runNow = function() {
    _origRun();
    setTimeout(function(){
      try {
        if(typeof RES === 'undefined' || !RES) return;
        var allPass = (RES.allBeams||[]).every(function(b){return !b.fail;}) &&
                      (RES.allCols||[]).every(function(c){return !c.fail;}) &&
                      (RES.allFtgs||[]).every(function(f){return !f.fail;});
        var zone = (typeof S !== 'undefined' && S) ? (S.zone||'II') : 'II';
        if(allPass) _CHALLENGES.trigger('analysis_pass', {zone:zone});
      } catch(e) {}
    }, 2000);
  };
})();

