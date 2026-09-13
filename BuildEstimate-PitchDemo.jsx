import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#0B1017",
  surface: "#111921",
  card: "#161F2B",
  cardHover: "#1A2536",
  elevated: "#1E293B",
  border: "#1E2D3D",
  borderLight: "#2A3F55",
  text: "#E2E8F0",
  textSec: "#94A3B8",
  textDim: "#475569",
  accent: "#F59E0B",
  accentDark: "#D97706",
  accentGlow: "rgba(245,158,11,0.15)",
  accentBorder: "rgba(245,158,11,0.3)",
  green: "#22C55E",
  greenGlow: "rgba(34,197,94,0.12)",
  greenBorder: "rgba(34,197,94,0.25)",
  red: "#EF4444",
  blue: "#3B82F6",
  blueGlow: "rgba(59,130,246,0.1)",
  purple: "#A78BFA",
  cyan: "#22D3EE",
};

const fmt = n => "₹" + Math.round(n).toLocaleString("en-IN");
const fmtK = n => n >= 100000 ? (n/100000).toFixed(1)+"L" : n >= 1000 ? (n/1000).toFixed(0)+"K" : Math.round(n);

function AnimNum({ value, dur = 1200 }) {
  const [d, setD] = useState(0);
  const r = useRef();
  useEffect(() => {
    let s = null;
    const step = t => {
      if (!s) s = t;
      const p = Math.min((t-s)/dur,1);
      setD(Math.round(value * (1-Math.pow(1-p,3))));
      if (p < 1) r.current = requestAnimationFrame(step);
    };
    r.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(r.current);
  }, [value]);
  return <>₹{d.toLocaleString("en-IN")}</>;
}

function Pulse({ color = C.accent }) {
  return (
    <span style={{ display:"inline-block", width:8, height:8, borderRadius:4, background:color, position:"relative" }}>
      <span style={{
        position:"absolute", inset:-3, borderRadius:7, border:`2px solid ${color}`,
        animation:"pulse 1.5s ease-out infinite", opacity:0
      }}/>
      <style>{`@keyframes pulse { 0%{opacity:0.6;transform:scale(1)} 100%{opacity:0;transform:scale(1.8)} }`}</style>
    </span>
  );
}

// --- Floor plan ---
function PlanSVG({ highlights = [], dims = false, scan = false }) {
  const rooms = [
    { x:20,y:20,w:220,h:168, label:"Living Room", d:"5.5×4.2m" },
    { x:240,y:20,w:192,h:144, label:"Master Bed", d:"4.8×3.6m" },
    { x:240,y:164,w:132,h:132, label:"Bedroom 2", d:"3.6×3.3m" },
    { x:20,y:188,w:144,h:120, label:"Kitchen", d:"3.6×3.0m" },
    { x:164,y:188,w:76,h:72, label:"Bath 1", d:"2.4×1.8m" },
    { x:372,y:164,w:60,h:60, label:"Bath 2", d:"2.1×1.5m" },
    { x:164,y:260,w:144,h:48, label:"Dining", d:"3.6×3.0m" },
    { x:20,y:308,w:96,h:72, label:"Lobby", d:"2.4×1.8m" },
  ];
  const cols = [[20,20],[240,20],[432,20],[20,188],[164,188],[372,164],[20,308],[164,308],[308,296],[20,380],[240,296],[432,224]];
  return (
    <svg viewBox="0 0 460 400" style={{ width:"100%", height:"100%" }}>
      <rect x="18" y="18" width="416" height="364" fill="none" stroke={C.border} strokeWidth="4" rx="2"/>
      {rooms.map((r,i) => {
        const hl = highlights.includes(i);
        return (<g key={i}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={hl?C.accentGlow:"transparent"} stroke={hl?C.accent:C.borderLight} strokeWidth={hl?2:1} rx="1" style={{transition:"all 0.3s"}}/>
          <text x={r.x+r.w/2} y={r.y+r.h/2-6} textAnchor="middle" fill={hl?C.accent:C.textDim} fontSize="10" fontWeight="600">{r.label}</text>
          {dims && <text x={r.x+r.w/2} y={r.y+r.h/2+10} textAnchor="middle" fill={C.accent} fontSize="8" opacity="0.85">{r.d}</text>}
        </g>);
      })}
      {cols.map(([cx,cy],i) => <rect key={"c"+i} x={cx-4} y={cy-4} width={8} height={8} fill={C.accent} opacity={0.5}/>)}
      {/* doors */}
      {[[60,378,38],[232,20,28],[232,164,28],[162,192,22],[372,168,22],[20,290,28]].map(([x,y,w],i)=>
        <line key={"d"+i} x1={x} y1={y} x2={x+w} y2={y} stroke={C.accent} strokeWidth="2.5" opacity="0.6"/>
      )}
      {/* windows */}
      {[[80,18,48],[160,18,48],[300,18,40],[380,18,40],[280,295,40],[434,80,36]].map(([x,y,w],i)=>
        <line key={"w"+i} x1={x} y1={y} x2={x+w} y2={y} stroke={C.cyan} strokeWidth="3" opacity="0.5"/>
      )}
      {scan && <>
        <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="transparent"/><stop offset="0.5" stopColor={C.accent}/><stop offset="1" stopColor="transparent"/></linearGradient></defs>
        <rect x="18" y="18" width="416" height="3" fill="url(#sg)" style={{animation:"scanY 2s ease-in-out infinite"}}>
          <animateTransform attributeName="transform" type="translate" values="0,0;0,364;0,0" dur="2s" repeatCount="indefinite"/>
        </rect>
      </>}
    </svg>
  );
}

// ========= DATA =========
const DASHBOARD_DATA = {
  substructure: {
    excavation: { area: 92, depth: 0.69, volume: 63.48 },
    footing: { area: 92, height: 0.25, volume: 23.0 },
    foundationWalls: { walls: 5, lengths: [11.4, 8.8, 11.4, 8.8, 8.8], wallHeight: 3.1, surfaceArea: 62.38 },
    slab: { area: 92, thickness: 0.15, volume: 13.8 },
    pcc: { area: 92, thickness: 0.1, volume: 9.2 },
    dpc: { length: 41, area: 41 },
  },
  superstructure: {
    columns: { count: 12, size: "230×300mm", height: 3.0, volumeEach: 0.207, totalVolume: 2.48 },
    beams: { count: 14, size: "230×380mm", totalLength: 48, totalVolume: 4.19 },
    roofSlab: { area: 102, thickness: 0.125, volume: 12.75 },
    brickworkExt: { surfaceArea: 117.8, thickness: 0.23, volume: 27.09 },
    brickworkInt: { surfaceArea: 68.4, thickness: 0.115, volume: 7.87 },
    steel: { weight: 4200 },
    shuttering: { area: 180 },
  },
  finishing: {
    intPlaster: { area: 265 },
    extPlaster: { area: 117.8 },
    flooring: { area: 85.65 },
    wallTiles: { area: 38 },
    painting: { intArea: 265, extArea: 117.8 },
  },
};

const COST_ITEMS = [
  { section:"Substructure", items:[
    { id:"s1", desc:"Setting out", qty:1, unit:"LS", matRate:4000, labPercent:0, calc:"Fixed fee — small project", matCost:4000, labCost:0 },
    { id:"s2", desc:"Excavation", qty:63.48, unit:"m³", matRate:270, labPercent:0.35, calc:"92 m² × 0.69m depth = 63.48 m³", matCost:17140, labCost:5999 },
    { id:"s3", desc:"PCC (1:4:8) — 100mm", qty:9.2, unit:"m³", matRate:5200, labPercent:0.35, calc:"92 m² × 0.10m = 9.2 m³", matCost:47840, labCost:16744 },
    { id:"s4", desc:"RCC Footings (1:2:4)", qty:23.0, unit:"m³", matRate:1200, labPercent:0.35, calc:"92 m² × 0.25m height = 23.0 m³", matCost:27600, labCost:9660 },
    { id:"s5", desc:"Foundation brickwork", qty:62.38, unit:"m²", matRate:290, labPercent:0.35, calc:"5 walls: (11.4+8.8+11.4+8.8+8.8) × 3.1m", matCost:18090, labCost:6332 },
    { id:"s6", desc:"DPC", qty:41, unit:"m²", matRate:180, labPercent:0.35, calc:"Perimeter wall length × DPC width", matCost:7380, labCost:2583 },
    { id:"s7", desc:"Backfilling & compaction", qty:1, unit:"LS", matRate:0, labPercent:0, calc:"Fixed fee — excavated material reuse", matCost:0, labCost:8000 },
    { id:"s8", desc:"Concrete ground slab — 150mm", qty:13.8, unit:"m³", matRate:1200, labPercent:0.35, calc:"92 m² × 0.15m = 13.8 m³", matCost:16560, labCost:5796 },
    { id:"s9", desc:"Anti-termite treatment", qty:92, unit:"m²", matRate:45, labPercent:0.35, calc:"Building footprint area", matCost:4140, labCost:1449 },
  ]},
  { section:"Superstructure", items:[
    { id:"u1", desc:"RCC Columns (12 nos × 3m)", qty:2.48, unit:"m³", matRate:7200, labPercent:0.35, calc:"12 × 0.23 × 0.30 × 3.0 = 2.48 m³", matCost:17856, labCost:6250 },
    { id:"u2", desc:"RCC Beams (14 nos)", qty:4.19, unit:"m³", matRate:7200, labPercent:0.35, calc:"14 beams × 0.23 × 0.38 × varying lengths", matCost:30168, labCost:10559 },
    { id:"u3", desc:"RCC Roof slab — 125mm", qty:12.75, unit:"m³", matRate:7200, labPercent:0.35, calc:"102 m² × 0.125m = 12.75 m³", matCost:91800, labCost:32130 },
    { id:"u4", desc:"Reinforcement steel", qty:4200, unit:"kg", matRate:72, labPercent:0.15, calc:"Columns + beams + slab reinforcement", matCost:302400, labCost:45360 },
    { id:"u5", desc:"Centering & shuttering", qty:180, unit:"m²", matRate:420, labPercent:0, calc:"Formwork for columns + beams + slab", matCost:75600, labCost:0 },
    { id:"u6", desc:"External brickwork — 230mm", qty:27.09, unit:"m³", matRate:5600, labPercent:0.35, calc:"117.8 m² surface × 0.23m thick", matCost:151704, labCost:53096 },
    { id:"u7", desc:"Internal brickwork — 115mm", qty:7.87, unit:"m³", matRate:5200, labPercent:0.35, calc:"68.4 m² surface × 0.115m thick", matCost:40924, labCost:14323 },
    { id:"u8", desc:"Ring beam", qty:200, unit:"Rmt", matRate:350, labPercent:0.35, calc:"Perimeter + internal walls ring beam", matCost:70000, labCost:24500 },
  ]},
  { section:"Interior Finish", items:[
    { id:"f1", desc:"Internal plastering — 12mm", qty:265, unit:"m²", matRate:55, labPercent:0.35, calc:"All internal wall surfaces", matCost:14575, labCost:5101 },
    { id:"f2", desc:"External plastering — 20mm", qty:117.8, unit:"m²", matRate:65, labPercent:0.35, calc:"All external wall surfaces", matCost:7657, labCost:2680 },
    { id:"f3", desc:"Wall putty — 2 coats", qty:265, unit:"m²", matRate:38, labPercent:0.30, calc:"Internal walls only", matCost:10070, labCost:3021 },
    { id:"f4", desc:"Interior emulsion paint", qty:265, unit:"m²", matRate:28, labPercent:0.30, calc:"Internal walls + ceiling", matCost:7420, labCost:2226 },
    { id:"f5", desc:"Exterior weather paint", qty:117.8, unit:"m²", matRate:35, labPercent:0.30, calc:"External walls", matCost:4123, labCost:1237 },
    { id:"f6", desc:"Vitrified floor tiles", qty:85.65, unit:"m²", matRate:650, labPercent:0.25, calc:"Living + bedrooms + dining + lobby", matCost:55673, labCost:13918 },
    { id:"f7", desc:"Anti-skid bathroom tiles", qty:7.47, unit:"m²", matRate:420, labPercent:0.25, calc:"Bathroom 1 + Bathroom 2 floor", matCost:3137, labCost:784 },
    { id:"f8", desc:"Kitchen floor tiles", qty:10.8, unit:"m²", matRate:450, labPercent:0.25, calc:"Kitchen area", matCost:4860, labCost:1215 },
    { id:"f9", desc:"Wall tiles (kitchen+bath)", qty:38, unit:"m²", matRate:480, labPercent:0.25, calc:"Kitchen backsplash + bathroom walls", matCost:18240, labCost:4560 },
    { id:"f10", desc:"Main door — teak frame", qty:1, unit:"No", matRate:28000, labPercent:0, calc:"1 nos", matCost:28000, labCost:5000 },
    { id:"f11", desc:"Internal flush doors", qty:5, unit:"No", matRate:8500, labPercent:0, calc:"5 nos — bedrooms, kitchen, baths", matCost:42500, labCost:12500 },
    { id:"f12", desc:"Aluminium sliding windows", qty:6, unit:"No", matRate:6200, labPercent:0, calc:"6 nos", matCost:37200, labCost:7200 },
    { id:"f13", desc:"Electrical works (complete)", qty:102, unit:"m²", matRate:320, labPercent:0.30, calc:"Per m² built-up area", matCost:32640, labCost:9792 },
    { id:"f14", desc:"Plumbing & sanitary", qty:102, unit:"m²", matRate:280, labPercent:0.30, calc:"Per m² built-up area", matCost:28560, labCost:8568 },
  ]},
];

const totalMat = COST_ITEMS.reduce((s,sec) => s + sec.items.reduce((ss,i)=>ss+i.matCost,0), 0);
const totalLab = COST_ITEMS.reduce((s,sec) => s + sec.items.reduce((ss,i)=>ss+i.labCost,0), 0);
const subtotal = totalMat + totalLab;
const contingency = Math.round(subtotal * 0.05);
const gst = Math.round(subtotal * 0.18);
const grandTotal = subtotal + contingency + gst;

// ========= COMPONENTS =========

function Tab({ label, active, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      padding:"8px 16px", fontSize:12, fontWeight:active?700:500, border:"none", cursor:"pointer",
      background: active ? C.accentGlow : "transparent",
      color: active ? C.accent : C.textSec,
      borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
      borderRadius:"6px 6px 0 0", display:"flex", alignItems:"center", gap:6,
      transition:"all 0.2s",
    }}>{icon}{label}</button>
  );
}

function Badge({ children, color = C.accent }) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:700,
      background:`${color}20`, color, border:`1px solid ${color}30`,
    }}>{children}</span>
  );
}

function CellVal({ children, editable, highlight }) {
  return (
    <span style={{
      padding:"2px 6px", borderRadius:3, fontWeight:600, fontSize:12, fontFamily:"'SF Mono',monospace",
      background: highlight ? C.accentGlow : editable ? `${C.blue}10` : "transparent",
      border: editable ? `1px dashed ${C.blue}40` : "none",
      color: highlight ? C.accent : C.text,
    }}>{children}</span>
  );
}

// ========= MAIN APP =========
export default function BuildEstimateDemo() {
  const [screen, setScreen] = useState("landing"); // landing, upload, analyze, app
  const [appTab, setAppTab] = useState("dashboard"); // dashboard, costSummary, report
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [expandedSec, setExpandedSec] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [showLinked, setShowLinked] = useState(null);
  const [bimPulse, setBimPulse] = useState(false);

  useEffect(() => {
    if (screen === "analyze") {
      const timers = [600,1800,3000,4000,5000,5800].map((d,i) => setTimeout(()=>setAnalyzeStep(i+1),d));
      const done = setTimeout(()=>{ setScreen("app"); setAppTab("dashboard"); }, 7000);
      return () => { timers.forEach(clearTimeout); clearTimeout(done); };
    }
  }, [screen]);

  const base = {
    width:"100%", minHeight:"100vh", background:C.bg, color:C.text,
    fontFamily:"'Inter',-apple-system,system-ui,sans-serif",
  };

  // ===== LANDING =====
  if (screen === "landing") return (
    <div style={base}>
      <div style={{ maxWidth:880, margin:"0 auto", padding:"72px 24px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:56 }}>
          <div style={{ width:38, height:38, borderRadius:8, background:`linear-gradient(135deg,${C.accent},${C.accentDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:19, color:"#fff" }}>B</div>
          <span style={{ fontSize:19, fontWeight:800, letterSpacing:-0.5 }}>BuildEstimate</span>
        </div>

        <h1 style={{ fontSize:"clamp(30px,5.5vw,52px)", fontWeight:900, lineHeight:1.08, letterSpacing:-1.5, margin:"0 0 20px" }}>
          From drawings to<br/>cost estimate in minutes
        </h1>
        <p style={{ fontSize:17, color:C.textSec, lineHeight:1.65, maxWidth:540, margin:"0 auto 44px" }}>
          Upload your plan or connect your BIM model. The AI extracts quantities, links them to your rate schedule, and auto-generates material + labor costs.
        </p>

        <button onClick={()=>setScreen("upload")} style={{
          padding:"15px 44px", fontSize:15, fontWeight:800, color:"#fff",
          background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,
          border:"none", borderRadius:10, cursor:"pointer",
          boxShadow:`0 4px 28px ${C.accent}50`,
        }}>See it in action</button>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:20, marginTop:64, textAlign:"left" }}>
          {[
            ["📐","Plan Upload","PDF, DWG, images — AI reads dimensions instantly"],
            ["🔗","BIM Integration","Link ArchiCAD / Revit models for live data extraction"],
            ["📊","Dashboard → Cost","Quantities auto-flow into your rate schedule"],
            ["📄","Export Reports","PDF + Excel with full material & labor breakdown"],
          ].map(([ico,t,d]) => (
            <div key={t} style={{ padding:18, borderRadius:10, background:C.card, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{ico}</div>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{t}</div>
              <div style={{ fontSize:11, color:C.textDim, lineHeight:1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Nav
  const nav = (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", borderBottom:`1px solid ${C.border}`, background:C.surface }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:26, height:26, borderRadius:6, background:`linear-gradient(135deg,${C.accent},${C.accentDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, color:"#fff" }}>B</div>
        <span style={{ fontSize:14, fontWeight:800 }}>BuildEstimate</span>
        <span style={{ fontSize:10, color:C.textDim, background:C.accentGlow, padding:"2px 8px", borderRadius:4, border:`1px solid ${C.accentBorder}`, fontWeight:600 }}>Demo</span>
      </div>
      <div style={{ fontSize:12, color:C.textSec }}>2BHK House · Kochi, Kerala · 102 m²</div>
    </div>
  );

  // ===== UPLOAD =====
  if (screen === "upload") return (
    <div style={base}>
      {nav}
      <div style={{ maxWidth:700, margin:"0 auto", padding:"44px 24px" }}>
        <h2 style={{ fontSize:22, fontWeight:800, marginBottom:6 }}>Start a new estimate</h2>
        <p style={{ color:C.textSec, fontSize:13, marginBottom:28 }}>Upload drawings or connect your BIM project for auto-extraction</p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
          <div onClick={()=>setScreen("analyze")} style={{
            padding:"32px 20px", borderRadius:10, background:C.card, border:`2px dashed ${C.borderLight}`,
            textAlign:"center", cursor:"pointer", transition:"border-color 0.2s",
          }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
          onMouseLeave={e=>e.currentTarget.style.borderColor=C.borderLight}>
            <div style={{ fontSize:32, marginBottom:8 }}>📐</div>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Upload Plan</div>
            <div style={{ fontSize:11, color:C.textDim }}>PDF, PNG, JPG, DWG, DXF</div>
          </div>
          <div onClick={()=>setScreen("analyze")} style={{
            padding:"32px 20px", borderRadius:10, background:C.card, border:`2px dashed ${C.borderLight}`,
            textAlign:"center", cursor:"pointer", transition:"border-color 0.2s",
          }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue}
          onMouseLeave={e=>e.currentTarget.style.borderColor=C.borderLight}>
            <div style={{ fontSize:32, marginBottom:8 }}>🏗️</div>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Connect BIM Model</div>
            <div style={{ fontSize:11, color:C.textDim }}>ArchiCAD, Revit, SketchUp</div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8, color:C.textDim, fontSize:12, margin:"20px 0" }}>
          <div style={{ flex:1, height:1, background:C.border }}/>or try a sample<div style={{ flex:1, height:1, background:C.border }}/>
        </div>

        <div onClick={()=>setScreen("analyze")} style={{
          display:"flex", alignItems:"center", gap:14, padding:16, borderRadius:10,
          background:C.card, border:`1px solid ${C.border}`, cursor:"pointer",
        }}
        onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
        onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
          <div style={{ width:48, height:48, borderRadius:8, background:C.accentGlow, border:`1px solid ${C.accentBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🏠</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:13 }}>2BHK Residential — Sample Plan + BIM Model</div>
            <div style={{ fontSize:11, color:C.textSec, marginTop:2 }}>G+0 · 102 m² · Kochi, Kerala · Full drawings included</div>
          </div>
          <span style={{ color:C.accent, fontWeight:700, fontSize:12 }}>Load →</span>
        </div>

        <div style={{ marginTop:24, padding:14, borderRadius:8, background:C.blueGlow, border:`1px solid ${C.blue}20`, fontSize:12, color:C.textSec, lineHeight:1.6 }}>
          <strong style={{ color:C.blue }}>How it works:</strong> Upload → AI scans dimensions → Quantities populate your Dashboard → Rates applied → Cost Summary auto-calculates → Export report
        </div>
      </div>
    </div>
  );

  // ===== ANALYZING =====
  if (screen === "analyze") {
    const steps = [
      "Converting drawing to vector data...",
      "Identifying structural walls and footprint...",
      "Extracting room dimensions and areas...",
      "Measuring columns, beams, slab thickness...",
      "Detecting door & window openings...",
      "Populating dashboard with quantities...",
    ];
    return (
      <div style={base}>
        {nav}
        <div style={{ maxWidth:820, margin:"0 auto", padding:"40px 24px" }}>
          <div style={{ display:"flex", gap:28, flexWrap:"wrap" }}>
            <div style={{ flex:"1 1 280px", aspectRatio:"460/400", background:C.card, borderRadius:12, border:`1px solid ${C.border}`, position:"relative", overflow:"hidden" }}>
              <PlanSVG highlights={[...Array(Math.min(analyzeStep,8)).keys()]} dims={analyzeStep>=4} scan={analyzeStep<6}/>
              {analyzeStep >= 5 && <div style={{ position:"absolute", bottom:12, left:12, right:12, padding:"8px 12px", borderRadius:6, background:`${C.bg}E0`, border:`1px solid ${C.greenBorder}`, fontSize:11, color:C.green, fontWeight:600, backdropFilter:"blur(8px)" }}>
                ✓ Extracted: 8 rooms · 10 walls · 12 columns · 12 openings
              </div>}
            </div>
            <div style={{ flex:"1 1 260px" }}>
              <Badge color={C.accent}>AI Processing</Badge>
              <h3 style={{ fontSize:18, fontWeight:800, margin:"14px 0 20px" }}>Extracting quantities from plan...</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {steps.map((s,i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:10, fontSize:12,
                    opacity:i<=analyzeStep?1:0.2, transition:"opacity 0.4s",
                    color:i<analyzeStep?C.green:i===analyzeStep?C.text:C.textDim,
                  }}>
                    <div style={{
                      width:20, height:20, borderRadius:10, fontSize:10, fontWeight:800,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background:i<analyzeStep?C.greenGlow:i===analyzeStep?C.accentGlow:"transparent",
                      border:`1px solid ${i<analyzeStep?C.greenBorder:i===analyzeStep?C.accentBorder:C.border}`,
                      color:i<analyzeStep?C.green:i===analyzeStep?C.accent:C.textDim,
                    }}>{i<analyzeStep?"✓":i+1}</div>
                    {s}
                    {i===analyzeStep && <Pulse/>}
                  </div>
                ))}
              </div>
              {analyzeStep >= 4 && (
                <div style={{ marginTop:20, padding:12, borderRadius:8, background:C.elevated, border:`1px solid ${C.border}`, fontSize:11 }}>
                  <div style={{ color:C.textDim, marginBottom:6 }}>Linked to BIM model via exported schedule</div>
                  <div style={{ fontFamily:"'SF Mono',monospace", fontSize:10, color:C.accent, background:C.accentGlow, padding:"4px 8px", borderRadius:4 }}>
                    dashboard!E11 ← archicad_export.txt
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== APP (Dashboard / Cost Summary / Report) =====
  return (
    <div style={base}>
      {nav}
      {/* Tab bar */}
      <div style={{ display:"flex", gap:4, padding:"0 20px", borderBottom:`1px solid ${C.border}`, background:C.surface }}>
        <Tab label="Dashboard" icon="📊" active={appTab==="dashboard"} onClick={()=>setAppTab("dashboard")}/>
        <Tab label="Cost Summary" icon="💰" active={appTab==="costSummary"} onClick={()=>setAppTab("costSummary")}/>
        <Tab label="Report" icon="📄" active={appTab==="report"} onClick={()=>setAppTab("report")}/>
      </div>

      {/* ===== DASHBOARD TAB ===== */}
      {appTab === "dashboard" && (
        <div style={{ maxWidth:960, margin:"0 auto", padding:"24px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:8 }}>
            <div>
              <h2 style={{ fontSize:20, fontWeight:800, margin:0 }}>Quantity Dashboard</h2>
              <p style={{ fontSize:12, color:C.textSec, margin:"4px 0 0" }}>All calculations here auto-populate the Cost Summary tab</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>{setBimPulse(true);setTimeout(()=>setBimPulse(false),2000)}} style={{ padding:"7px 14px", fontSize:11, fontWeight:700, background:C.blueGlow, color:C.blue, border:`1px solid ${C.blue}30`, borderRadius:6, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                {bimPulse ? <Pulse color={C.green}/> : "🔄"} {bimPulse ? "Refreshed from BIM" : "Refresh from BIM"}
              </button>
              <button onClick={()=>setAppTab("costSummary")} style={{ padding:"7px 14px", fontSize:11, fontWeight:700, background:C.accent, color:"#fff", border:"none", borderRadius:6, cursor:"pointer" }}>
                View costs →
              </button>
            </div>
          </div>

          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            {/* Plan */}
            <div style={{ flex:"1 1 240px", background:C.card, borderRadius:10, border:`1px solid ${C.border}`, padding:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.textDim, marginBottom:6 }}>Floor Plan</div>
              <PlanSVG highlights={[0,1,2,3,4,5,6,7]} dims={true}/>
              <div style={{ display:"flex", gap:12, marginTop:10, fontSize:10, color:C.textDim }}>
                <span><span style={{ display:"inline-block", width:8, height:3, background:C.accent, borderRadius:2, marginRight:3 }}/>Doors</span>
                <span><span style={{ display:"inline-block", width:8, height:3, background:C.cyan, borderRadius:2, marginRight:3 }}/>Windows</span>
                <span><span style={{ display:"inline-block", width:6, height:6, background:C.accent, opacity:0.5, borderRadius:1, marginRight:3 }}/>Cols</span>
              </div>
            </div>

            {/* Dashboard tables */}
            <div style={{ flex:"2 1 400px", display:"flex", flexDirection:"column", gap:14 }}>
              {/* Substructure */}
              <DashSection title="Substructure" color={C.accent} rows={[
                ["Excavation volume", `92 m² × 0.69m`, "63.48 m³"],
                ["PCC volume", `92 m² × 0.10m`, "9.2 m³"],
                ["Footing volume", `92 m² × 0.25m`, "23.0 m³"],
                ["Foundation wall area", `Σ(11.4+8.8×2+8.8) × 3.1m`, "62.38 m²"],
                ["Ground slab volume", `92 m² × 0.15m`, "13.8 m³"],
                ["DPC", `Perimeter length`, "41 m²"],
              ]} bimPulse={bimPulse}/>

              {/* Superstructure */}
              <DashSection title="Superstructure" color={C.blue} rows={[
                ["Column volume", `12 × (0.23×0.30×3.0)`, "2.48 m³"],
                ["Beam volume", `14 beams × (0.23×0.38×L)`, "4.19 m³"],
                ["Roof slab volume", `102 m² × 0.125m`, "12.75 m³"],
                ["Steel reinforcement", `Columns + beams + slab`, "4,200 kg"],
                ["Ext brickwork vol", `117.8 m² × 0.23m`, "27.09 m³"],
                ["Int brickwork vol", `68.4 m² × 0.115m`, "7.87 m³"],
                ["Brick count (ext)", `27.09 m³ ÷ 0.0012 m³/brick`, "≈22,575 nos"],
                ["Shuttering area", `Cols + beams + slab formwork`, "180 m²"],
              ]} bimPulse={bimPulse}/>

              {/* Finishing */}
              <DashSection title="Interior Finish" color={C.purple} rows={[
                ["Int plastering area", `All internal walls`, "265 m²"],
                ["Ext plastering area", `All external walls`, "117.8 m²"],
                ["Floor tiling area", `Rooms total`, "85.65 m²"],
                ["Wall tiling area", `Kitchen + bathrooms`, "38 m²"],
                ["Painting area (int)", `Internal walls + ceiling`, "265 m²"],
                ["Painting area (ext)", `External walls`, "117.8 m²"],
              ]} bimPulse={bimPulse}/>

              <div style={{ padding:10, borderRadius:6, background:C.accentGlow, border:`1px solid ${C.accentBorder}`, fontSize:11, color:C.accent, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:14 }}>🔗</span>
                <span>These quantities are linked to Cost Summary via <code style={{ background:`${C.accent}20`, padding:"1px 6px", borderRadius:3, fontFamily:"monospace", fontSize:10 }}>=Dashboard!E11</code> cell references</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== COST SUMMARY TAB ===== */}
      {appTab === "costSummary" && (
        <div style={{ maxWidth:1000, margin:"0 auto", padding:"24px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:8 }}>
            <div>
              <h2 style={{ fontSize:20, fontWeight:800, margin:0 }}>Cost Summary</h2>
              <p style={{ fontSize:12, color:C.textSec, margin:"4px 0 0" }}>Quantities pulled from Dashboard · Rates applied per local schedule</p>
            </div>
            <button onClick={()=>setAppTab("report")} style={{ padding:"7px 14px", fontSize:11, fontWeight:700, background:C.accent, color:"#fff", border:"none", borderRadius:6, cursor:"pointer" }}>View report →</button>
          </div>

          {/* Summary cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:20 }}>
            {[
              { l:"Total Estimate", v:subtotal, big:true },
              { l:"Material Cost", v:totalMat, c:C.accent },
              { l:"Labor Cost", v:totalLab, c:C.blue },
              { l:"Cost / m²", v:Math.round(subtotal/102), c:C.text },
            ].map(c => (
              <div key={c.l} style={{
                padding:"14px 16px", borderRadius:8,
                background:c.big?C.accentGlow:C.card,
                border:`1px solid ${c.big?C.accentBorder:C.border}`,
              }}>
                <div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>{c.l}</div>
                <div style={{ fontSize:c.big?24:18, fontWeight:800, color:c.c||C.accent, letterSpacing:-0.5 }}>
                  <AnimNum value={c.v} dur={c.big?1500:1000}/>
                </div>
              </div>
            ))}
          </div>

          {/* Cost table */}
          <div style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, overflow:"hidden" }}>
            {/* Table header */}
            <div style={{ display:"grid", gridTemplateColumns:"40px 1fr 70px 40px 70px 85px 70px 85px 90px", gap:0, padding:"8px 14px", borderBottom:`2px solid ${C.border}`, fontSize:10, color:C.textDim, fontWeight:700, textTransform:"uppercase", letterSpacing:0.4 }}>
              <span>#</span><span>Description</span><span style={{textAlign:"right"}}>Qty</span><span style={{textAlign:"center"}}>Unit</span>
              <span style={{textAlign:"right"}}>Mat Rate</span><span style={{textAlign:"right",color:C.accent}}>Mat Cost</span>
              <span style={{textAlign:"right"}}>Lab Rate</span><span style={{textAlign:"right",color:C.blue}}>Lab Cost</span>
              <span style={{textAlign:"right"}}>Total</span>
            </div>

            <div style={{ maxHeight:420, overflowY:"auto" }}>
              {COST_ITEMS.map((sec, si) => (
                <div key={sec.section}>
                  {/* Section header */}
                  <div onClick={()=>setExpandedSec(expandedSec===si?null:si)} style={{
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"10px 14px", cursor:"pointer",
                    background:expandedSec===si?C.elevated:C.card,
                    borderBottom:`1px solid ${C.border}`,
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:9, color:C.textDim, transition:"transform 0.2s", display:"inline-block", transform:expandedSec===si?"rotate(90deg)":"" }}>▶</span>
                      <span style={{ fontWeight:700, fontSize:13 }}>{sec.section}</span>
                      <span style={{ fontSize:10, color:C.textDim }}>({sec.items.length})</span>
                    </div>
                    <div style={{ display:"flex", gap:16, fontSize:12 }}>
                      <span style={{ color:C.accent }}>{fmt(sec.items.reduce((s,i)=>s+i.matCost,0))}</span>
                      <span style={{ color:C.blue }}>{fmt(sec.items.reduce((s,i)=>s+i.labCost,0))}</span>
                      <span style={{ fontWeight:800 }}>{fmt(sec.items.reduce((s,i)=>s+i.matCost+i.labCost,0))}</span>
                    </div>
                  </div>

                  {/* Items */}
                  {expandedSec === si && sec.items.map((item, ii) => (
                    <div key={item.id}>
                      <div style={{
                        display:"grid", gridTemplateColumns:"40px 1fr 70px 40px 70px 85px 70px 85px 90px",
                        gap:0, padding:"7px 14px", fontSize:12,
                        borderBottom:`1px solid ${C.border}`, background:C.elevated,
                        alignItems:"center",
                      }}>
                        <span style={{ color:C.textDim, fontSize:10 }}>{item.id}</span>
                        <span style={{ fontSize:11, fontWeight:500 }}>{item.desc}</span>
                        <span style={{ textAlign:"right" }}><CellVal highlight>{item.qty}</CellVal></span>
                        <span style={{ textAlign:"center", color:C.textDim, fontSize:10 }}>{item.unit}</span>
                        <span style={{ textAlign:"right" }}><CellVal editable>{item.matRate>0?fmt(item.matRate):"-"}</CellVal></span>
                        <span style={{ textAlign:"right", color:C.accent, fontWeight:600 }}>{item.matCost>0?fmt(item.matCost):"-"}</span>
                        <span style={{ textAlign:"right", fontSize:10, color:C.textDim }}>{item.labPercent>0?`×${item.labPercent}`:"fixed"}</span>
                        <span style={{ textAlign:"right", color:C.blue, fontWeight:600 }}>{item.labCost>0?fmt(item.labCost):"-"}</span>
                        <span style={{ textAlign:"right", fontWeight:700 }}>{fmt(item.matCost+item.labCost)}</span>
                      </div>
                      {/* Calculation basis row */}
                      <div style={{ padding:"4px 14px 6px 54px", fontSize:10, color:C.textDim, borderBottom:`1px solid ${C.border}`, background:C.elevated }}>
                        📐 {item.calc} {item.labPercent > 0 && <span style={{ marginLeft:8, color:C.blue }}>| Labor = {item.labPercent}× material cost</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Totals footer */}
            <div style={{ padding:"12px 14px", borderTop:`2px solid ${C.border}`, background:C.elevated }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
                <span style={{ fontWeight:700 }}>Subtotal (Material + Labor)</span>
                <span style={{ fontWeight:800, fontSize:16 }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", gap:20, fontSize:11, color:C.textSec }}>
                <span>Material: <strong style={{ color:C.accent }}>{fmt(totalMat)}</strong></span>
                <span>Labor: <strong style={{ color:C.blue }}>{fmt(totalLab)}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ marginTop:14, padding:10, borderRadius:6, background:C.accentGlow, border:`1px solid ${C.accentBorder}`, fontSize:11, color:C.accent }}>
            💡 <strong>Qty cells</strong> (highlighted) are linked from Dashboard. <strong style={{ color:C.blue }}>Rate cells</strong> (dashed) are editable — change a rate and costs recalculate instantly.
          </div>
        </div>
      )}

      {/* ===== REPORT TAB ===== */}
      {appTab === "report" && (
        <div style={{ maxWidth:800, margin:"0 auto", padding:"24px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:8 }}>
            <h2 style={{ fontSize:20, fontWeight:800, margin:0 }}>Estimate Report</h2>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ padding:"7px 16px", fontSize:11, fontWeight:700, background:"transparent", color:C.text, border:`1px solid ${C.border}`, borderRadius:6, cursor:"pointer" }}>Export PDF</button>
              <button style={{ padding:"7px 16px", fontSize:11, fontWeight:700, background:C.accent, color:"#fff", border:"none", borderRadius:6, cursor:"pointer" }}>Export Excel</button>
            </div>
          </div>

          <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
            {/* Report header */}
            <div style={{ padding:"24px 24px", borderBottom:`1px solid ${C.border}`, background:C.accentGlow }}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                <div>
                  <div style={{ fontSize:9, color:C.textDim, textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>Construction Cost Estimate</div>
                  <div style={{ fontSize:20, fontWeight:900 }}>2BHK Residential House</div>
                  <div style={{ fontSize:12, color:C.textSec, marginTop:3 }}>Kochi, Kerala · G+0 · New Construction</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:10, color:C.textDim }}>Date</div>
                  <div style={{ fontSize:12, fontWeight:600 }}>{new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                  <Badge color={C.accent}>Budget ±15%</Badge>
                </div>
              </div>
            </div>

            {/* Project info */}
            <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.textDim, marginBottom:10 }}>Project Details</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12 }}>
                {[["Built-up Area","102 m²"],["Floors","G+0"],["Rooms","8 (2BHK)"],["Columns","12 nos"],["Slab","125mm RCC"],["Walls","230mm ext · 115mm int"]].map(([k,v])=>(
                  <div key={k}><div style={{ fontSize:10, color:C.textDim }}>{k}</div><div style={{ fontSize:12, fontWeight:600 }}>{v}</div></div>
                ))}
              </div>
            </div>

            {/* Section totals */}
            <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.textDim, marginBottom:12 }}>Category Breakdown</div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ borderBottom:`2px solid ${C.border}`, fontSize:10, color:C.textDim, textTransform:"uppercase" }}>
                    <th style={{ padding:"6px 0", textAlign:"left" }}>Section</th>
                    <th style={{ textAlign:"right", color:C.accent }}>Material</th>
                    <th style={{ textAlign:"right", color:C.blue }}>Labor</th>
                    <th style={{ textAlign:"right" }}>Total</th>
                    <th style={{ textAlign:"right" }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {COST_ITEMS.map(sec => {
                    const mat = sec.items.reduce((s,i)=>s+i.matCost,0);
                    const lab = sec.items.reduce((s,i)=>s+i.labCost,0);
                    const tot = mat+lab;
                    return (
                      <tr key={sec.section} style={{ borderBottom:`1px solid ${C.border}` }}>
                        <td style={{ padding:"10px 0", fontWeight:600 }}>{sec.section}</td>
                        <td style={{ textAlign:"right", color:C.accent }}>{fmt(mat)}</td>
                        <td style={{ textAlign:"right", color:C.blue }}>{fmt(lab)}</td>
                        <td style={{ textAlign:"right", fontWeight:700 }}>{fmt(tot)}</td>
                        <td style={{ textAlign:"right", color:C.textDim }}>{((tot/subtotal)*100).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Grand total */}
            <div style={{ padding:"18px 24px" }}>
              {[
                ["Material subtotal", fmt(totalMat), C.accent],
                ["Labor subtotal", fmt(totalLab), C.blue],
                ["Direct cost subtotal", fmt(subtotal), C.text],
              ].map(([l,v,c])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"4px 0" }}>
                  <span style={{ color:C.textSec }}>{l}</span><span style={{ fontWeight:600, color:c }}>{v}</span>
                </div>
              ))}
              <div style={{ height:1, background:C.border, margin:"8px 0" }}/>
              {[
                ["Contingency (5%)", fmt(contingency)],
                ["GST (18%)", fmt(gst)],
              ].map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"4px 0" }}>
                  <span style={{ color:C.textSec }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span>
                </div>
              ))}
              <div style={{ height:2, background:C.accent, margin:"10px 0 8px", opacity:0.3 }}/>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                <span style={{ fontSize:16, fontWeight:900 }}>Grand Total</span>
                <span style={{ fontSize:24, fontWeight:900, color:C.accent }}><AnimNum value={grandTotal} dur={1500}/></span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                <span style={{ fontSize:11, color:C.textDim }}>Cost per square metre</span>
                <span style={{ fontSize:14, fontWeight:700 }}>{fmt(Math.round(grandTotal/102))}/m²</span>
              </div>
            </div>

            <div style={{ padding:"12px 24px", background:C.elevated, borderTop:`1px solid ${C.border}`, fontSize:10, color:C.textDim, lineHeight:1.7 }}>
              This estimate is for budgeting purposes only — not a binding quotation. Rates based on Kochi, Kerala market (Sep 2026). Labor calculated as percentage of material cost per local convention. Actual costs may vary ±15%. Professional review recommended.
            </div>
          </div>

          <div style={{ textAlign:"center", marginTop:28 }}>
            <button onClick={()=>{setScreen("landing");setAppTab("dashboard");setExpandedSec(null);setAnalyzeStep(0)}} style={{ padding:"8px 24px", fontSize:12, fontWeight:600, background:"transparent", color:C.textSec, border:`1px solid ${C.border}`, borderRadius:7, cursor:"pointer" }}>← Restart demo</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard section component
function DashSection({ title, color, rows, bimPulse }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background:C.card, borderRadius:8, border:`1px solid ${C.border}`, overflow:"hidden" }}>
      <div onClick={()=>setOpen(!open)} style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"8px 14px", borderBottom:open?`1px solid ${C.border}`:"none", cursor:"pointer",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:9, transition:"transform 0.2s", display:"inline-block", transform:open?"rotate(90deg)":"", color:C.textDim }}>▶</span>
          <span style={{ fontSize:12, fontWeight:700, color }}>{title}</span>
        </div>
        {bimPulse && <Pulse color={C.green}/>}
      </div>
      {open && (
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
          <thead>
            <tr style={{ fontSize:9, color:C.textDim, textTransform:"uppercase", letterSpacing:0.5 }}>
              <th style={{ padding:"5px 14px", textAlign:"left" }}>Item</th>
              <th style={{ padding:"5px 14px", textAlign:"left" }}>Calculation</th>
              <th style={{ padding:"5px 14px", textAlign:"right" }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([item, calc, result], i) => (
              <tr key={i} style={{ borderTop:`1px solid ${C.border}` }}>
                <td style={{ padding:"6px 14px", fontWeight:500 }}>{item}</td>
                <td style={{ padding:"6px 14px", color:C.textDim, fontFamily:"'SF Mono',monospace", fontSize:10 }}>{calc}</td>
                <td style={{ padding:"6px 14px", textAlign:"right" }}>
                  <span style={{
                    fontWeight:700, color, padding:"2px 8px", borderRadius:4,
                    background:`${color}15`, fontSize:11,
                    transition: bimPulse ? "background 0.3s" : "none",
                    ...(bimPulse ? { background:`${C.green}20`, color:C.green } : {}),
                  }}>{result}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
