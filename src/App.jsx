import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

/* ═══ TOKENS ═══ */
const C = { gold:"#D4AF37", green:"#10b981", dg:"#0D4D3D", mu:"#7a8f82", bg:"#060d0a", bg2:"#0a1610", cd:"#0c1a14", bd:"rgba(212,175,55,0.12)", red:"#ef4444", pu:"#8b5cf6", bl:"#3b82f6", pk:"#ec4899", sa:"#B8956A", tx:"#e8ede9", wa:"#25D366" };
const PF="'Playfair Display',serif", DM="'DM Sans',sans-serif";
const LG="https://startgrows.es/wp-content/uploads/2025/08/LOGO-2.png";

/* ═══ TIERS ═══ */
const TIERS=[
  {n:"Bronce",i:"🥉",min:0,max:2,com:80,c:"#CD7F32",keep:0,desc:"Inicio"},
  {n:"Plata",i:"🥈",min:3,max:4,com:85,c:"#C0C0C0",keep:1,desc:"1 ref/mes"},
  {n:"Oro",i:"🥇",min:5,max:7,com:90,c:"#FFD700",keep:2,desc:"2 refs/mes"},
  {n:"Diamante",i:"💎",min:8,max:11,com:95,c:"#b9f2ff",keep:3,desc:"3 refs/mes"},
  {n:"Élite",i:"👑",min:12,max:999,com:100,c:C.gold,keep:4,desc:"4 refs/mes"},
];
const DEF_BONOS=[{refs:3,amount:50,icon:"⚡",color:C.bl},{refs:6,amount:100,icon:"🔥",color:C.pk},{refs:10,amount:150,icon:"💎",color:C.pu}];
const gT=n=>TIERS.find(t=>n>=t.min&&n<=t.max)||TIERS[0];
const gN=n=>{const i=TIERS.findIndex(t=>n>=t.min&&n<=t.max);return i<TIERS.length-1?TIERS[i+1]:null};

const waLink=(nm,cd)=>{
  const m=[`¡Hola! 👋 Soy referido de *${nm}* (código: ${cd}). Me interesa StartGrows y el copy trading.`,`¡Buenas! Me recomendó *${nm}* (${cd}). Quiero info sobre StartGrows.`,`Hola, vengo de parte de *${nm}* (ref: ${cd}). Quiero hacer crecer mi capital con StartGrows.`];
  return`https://wa.me/34683105553?text=${encodeURIComponent(m[cd.split("").reduce((s,c)=>s+c.charCodeAt(0),0)%m.length])}`;
};

/* ═══ STYLES ═══ */
const crd={background:`linear-gradient(145deg,${C.cd},${C.bg2})`,border:`1px solid ${C.bd}`,borderRadius:16,padding:18,marginBottom:12,overflow:"hidden"};
const inp={width:"100%",padding:12,borderRadius:10,border:`1px solid ${C.bd}`,background:C.bg,color:C.tx,fontSize:14,boxSizing:"border-box"};
const css=`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{font-family:${DM};background:${C.bg}}::placeholder{color:${C.mu}}input:focus{outline:none;border-color:${C.gold}50!important;box-shadow:0 0 0 3px ${C.gold}10}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.gold}20;border-radius:4px}@keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fu .5s ease forwards}.s1{animation-delay:.05s;opacity:0}.s2{animation-delay:.1s;opacity:0}.s3{animation-delay:.15s;opacity:0}.bh{transition:all .2s}.bh:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(212,175,55,.15)}.bh:active{transform:translateY(0)}.ch{transition:all .2s}.ch:hover{border-color:${C.gold}30!important;transform:translateY(-1px)}`;

/* ═══ MINI COMPONENTS ═══ */
function CapChart({data}){if(!data||!data.length)return null;return(<div style={crd}><div style={{fontSize:11,fontWeight:700,fontFamily:PF,marginBottom:8,color:C.gold}}>📈 Capital</div><ResponsiveContainer width="100%" height={150}><AreaChart data={data}><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.gold} stopOpacity={.25}/><stop offset="100%" stopColor={C.green} stopOpacity={0}/></linearGradient></defs><XAxis dataKey="ms" tick={{fill:C.mu,fontSize:9}} axisLine={false} tickLine={false}/><YAxis tick={{fill:C.mu,fontSize:9}} axisLine={false} tickLine={false} width={40}/><Tooltip contentStyle={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:8,fontSize:11,color:C.tx}}/><Area type="monotone" dataKey="c" stroke={C.gold} fill="url(#cg)" strokeWidth={2.5} dot={{r:3,fill:C.gold,strokeWidth:0}}/></AreaChart></ResponsiveContainer></div>)}
function RChart({data}){if(!data||!data.length)return null;return(<div style={crd}><div style={{fontSize:11,fontWeight:700,fontFamily:PF,marginBottom:8,color:C.green}}>📊 Rentabilidad</div><ResponsiveContainer width="100%" height={120}><BarChart data={data}><XAxis dataKey="ms" tick={{fill:C.mu,fontSize:8}} axisLine={false} tickLine={false}/><YAxis tick={{fill:C.mu,fontSize:8}} axisLine={false} tickLine={false}/><Bar dataKey="r" radius={[4,4,0,0]}>{data.map((e,i)=><Cell key={i} fill={e.r>=0?C.green:C.red}/>)}</Bar></BarChart></ResponsiveContainer></div>)}
function Stat({value,label,color,small}){return(<div style={{...crd,textAlign:"center",padding:small?10:14,marginBottom:0}}><div style={{fontSize:small?16:20,fontWeight:800,color,fontFamily:PF}}>{value}</div><div style={{fontSize:small?7:8,color:C.mu,marginTop:2,textTransform:"uppercase",letterSpacing:1}}>{label}</div></div>)}
function Badge({tier,size="md"}){const s=size==="sm"?{fontSize:9,padding:"2px 8px"}:{fontSize:11,padding:"4px 12px"};return(<span style={{...s,borderRadius:6,background:tier.c+"15",color:tier.c,fontWeight:800,display:"inline-flex",alignItems:"center",gap:3,border:`1px solid ${tier.c}25`}}>{tier.i} {tier.n}</span>)}
function Prog({current,total,colorFrom,colorTo,height=6}){const p=Math.min(100,(current/Math.max(total,1))*100);return(<div style={{height,borderRadius:height,background:C.dg+"30",overflow:"hidden",width:"100%"}}><div style={{height:"100%",borderRadius:height,background:`linear-gradient(90deg,${colorFrom},${colorTo})`,width:`${p}%`,transition:"width .6s"}}/></div>)}

/* ═══ MAIN ═══ */
export default function App(){
  const[user,setUser]=useState(null);
  const[isAdmin,setIsAdmin]=useState(false);
  const[code,setCode]=useState("");
  const[pw,setPw]=useState("");
  const[error,setError]=useState("");
  const[tab,setTab]=useState("h");
  const[copied,setCopied]=useState("");
  const[rentData,setRentData]=useState([]);
  const[showModal,setShowModal]=useState(false);
  const[newMonth,setNewMonth]=useState({m:"",r:"",c:""});
  const[selAf,setSelAf]=useState(null);
  const[adminTab,setAdminTab]=useState("ranking");
  const[loading,setLoading]=useState(false);
  const[allAf,setAllAf]=useState([]);
  const[bonos,setBonos]=useState(DEF_BONOS);
  const[adminPw,setAdminPw]=useState("SGAdmin$$2026");
  const[showAdd,setShowAdd]=useState(false);
  const[newAf,setNewAf]=useState({nombre:"",codigo:"",password:"",capital_inicial:""});

  const loadConfig=useCallback(async()=>{
    try{const{data}=await supabase.from('afiliados_config').select('*');if(data&&data.length){const cfg={};data.forEach(r=>{cfg[r.clave]=r.valor});if(cfg.admin_password)setAdminPw(cfg.admin_password);const b=[...DEF_BONOS];if(cfg.bono_1_refs)b[0]={...b[0],refs:parseInt(cfg.bono_1_refs),amount:parseInt(cfg.bono_1_amount||'50')};if(cfg.bono_2_refs)b[1]={...b[1],refs:parseInt(cfg.bono_2_refs),amount:parseInt(cfg.bono_2_amount||'100')};if(cfg.bono_3_refs)b[2]={...b[2],refs:parseInt(cfg.bono_3_refs),amount:parseInt(cfg.bono_3_amount||'150')};setBonos(b)}}catch(e){console.error(e)}
  },[]);

  const loadAf=useCallback(async()=>{
    try{const[{data:afs},{data:refs},{data:pgs},{data:rts}]=await Promise.all([supabase.from('afiliados').select('*').eq('activo',true).order('created_at'),supabase.from('afiliados_referidos').select('*').order('created_at'),supabase.from('afiliados_pagos').select('*').order('created_at'),supabase.from('afiliados_rentabilidad').select('*').order('created_at')]);if(!afs)return;
    setAllAf(afs.map(a=>({...a,ci:a.capital_inicial||0,ca:a.capital_actual||0,refsEsteMes:a.refs_este_mes||0,rs:(refs||[]).filter(r=>r.afiliado_id===a.id).map(r=>({n:r.nombre,k:r.capital||0,p:r.pagado?1:0,fecha:r.fecha||'',comision:r.comision||80,refId:r.id})),pg:(pgs||[]).filter(p=>p.afiliado_id===a.id).map(p=>({m:p.monto||0,r:p.referido_nombre||'',fecha:p.fecha||''})),rt:(rts||[]).filter(r=>r.afiliado_id===a.id).map(r=>({ms:r.mes,r:r.rentabilidad||0,c:r.capital||0}))})))}catch(e){console.error(e)}
  },[]);

  useEffect(()=>{loadConfig();loadAf()},[loadConfig,loadAf]);

  const copy=(t,l)=>{try{navigator.clipboard.writeText(t)}catch(e){}setCopied(l);setTimeout(()=>setCopied(""),2500)};

  const login=async()=>{
    setError("");setLoading(true);const c=code.trim(),p=pw.trim();
    if(c==="ADMIN"&&p===adminPw){setIsAdmin(true);setLoading(false);return}
    const f=allAf.find(a=>a.codigo.toLowerCase()===c.toLowerCase());
    if(!f){setError("Código no encontrado.");setLoading(false);return}
    if(f.password&&f.password!==p){setError("Contraseña incorrecta.");setLoading(false);return}
    setUser(f);setRentData(f.rt);setLoading(false);
  };

  const logout=()=>{setUser(null);setIsAdmin(false);setTab("h");setSelAf(null);setCode("");setPw("")};

  /* Admin: mark referral as paid */
  const markPaid=async(afiliado,ref)=>{
    await supabase.from('afiliados_referidos').update({pagado:true}).eq('id',ref.refId);
    const mes=new Date().toISOString().slice(0,7);
    await supabase.from('afiliados_pagos').insert([{afiliado_id:afiliado.id,referido_nombre:ref.n,monto:ref.comision,fecha:mes}]);
    await loadAf();setSelAf(prev=>{if(!prev)return null;const updated=allAf.find(a=>a.id===prev.id);return updated||prev});
  };

  /* Admin: add new afiliado */
  const addAfiliado=async()=>{
    if(!newAf.nombre||!newAf.codigo||!newAf.password)return;
    const{error}=await supabase.from('afiliados').insert([{nombre:newAf.nombre,codigo:newAf.codigo.toUpperCase(),password:newAf.password,capital_inicial:parseFloat(newAf.capital_inicial)||0,capital_actual:parseFloat(newAf.capital_inicial)||0,refs_este_mes:0,activo:true,tier_actual:'Bronce'}]);
    if(!error){setNewAf({nombre:"",codigo:"",password:"",capital_inicial:""});setShowAdd(false);await loadAf()}
  };

  /* Admin: reset monthly refs & degrade tiers (manual trigger) */
  const resetMonth=async()=>{
    if(!window.confirm("¿Resetear refs del mes y degradar tiers que no cumplieron? Esta acción es irreversible."))return;
    for(const a of allAf){
      const tier=gT(a.rs.length);
      if(tier.keep>0&&a.refsEsteMes<tier.keep){
        // Degrade: find previous tier
        const idx=TIERS.findIndex(t=>t.n===tier.n);
        const prev=idx>0?TIERS[idx-1]:TIERS[0];
        await supabase.from('afiliados').update({refs_este_mes:0,tier_actual:prev.n}).eq('id',a.id);
      }else{
        await supabase.from('afiliados').update({refs_este_mes:0}).eq('id',a.id);
      }
    }
    await loadAf();alert("✅ Mes reseteado. Tiers actualizados.");
  };

  /* Save rent month */
  const saveMonth=async()=>{
    if(!newMonth.m||!newMonth.r||!newMonth.c||!user)return;
    await supabase.from('afiliados_rentabilidad').insert([{afiliado_id:user.id,mes:newMonth.m,rentabilidad:parseFloat(newMonth.r),capital:parseFloat(newMonth.c)}]);
    await supabase.from('afiliados').update({capital_actual:parseFloat(newMonth.c)}).eq('id',user.id);
    setRentData(p=>[...p,{ms:newMonth.m,r:parseFloat(newMonth.r),c:parseFloat(newMonth.c)}]);
    setNewMonth({m:"",r:"",c:""});setShowModal(false);
  };

  // Computed
  const tier=user?gT(user.rs.length):TIERS[0];
  const nextTier=user?gN(user.rs.length):null;
  const totalGanado=user?user.pg.reduce((s,p)=>s+p.m,0):0;
  const pendiente=user?user.rs.filter(r=>!r.p).length*tier.com:0;
  const ganInv=user?user.ca-user.ci:0;
  const now=new Date(),np=new Date(now.getFullYear(),now.getMonth(),20);
  if(now.getDate()>20)np.setMonth(np.getMonth()+1);
  const diasPago=Math.ceil((np-now)/864e5);
  const rentAcum=rentData.reduce((s,r)=>s+r.r,0).toFixed(1);
  const mejorMes=rentData.length?rentData.reduce((b,r)=>r.r>b.r?r:b,rentData[0]):{r:0,ms:"-"};
  const refsEsteMes=user?(user.refsEsteMes||0):0;
  const bonosGanados=bonos.filter(b=>refsEsteMes>=b.refs);
  const totalBonos=bonosGanados.reduce((s,b)=>s+b.amount,0);
  const ranking=[...allAf].sort((a,b)=>b.rs.length-a.rs.length);

  /* ═══ LOGIN ═══ */
  if(!user&&!isAdmin){
    return(<div style={{minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:DM}}><style>{css}</style>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:20}}>
        <div className="fu" style={{width:"100%",maxWidth:380,background:`linear-gradient(150deg,${C.cd},${C.bg2})`,border:`1px solid ${C.bd}`,borderRadius:24,padding:"44px 32px",boxShadow:"0 40px 80px rgba(0,0,0,.6)"}}>
          <div style={{height:3,borderRadius:2,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,marginBottom:32}}/>
          <div style={{textAlign:"center",marginBottom:32}}>
            <img src={LG} alt="" style={{height:52,marginBottom:16}} onError={e=>{e.target.style.display="none"}}/>
            <h1 style={{fontFamily:PF,fontSize:24,fontWeight:800,color:C.gold}}>Portal de Afiliados</h1>
            <p style={{fontSize:12,color:C.mu,marginTop:8}}>Ingresa tu código y contraseña</p>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:9,color:C.sa,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:6}}>Código</label>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Ej: DAVID-SG o ADMIN" style={{...inp,fontSize:15,fontWeight:700,letterSpacing:2,textAlign:"center",padding:14,borderRadius:12}} onKeyDown={e=>e.key==="Enter"&&login()}/>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:9,color:C.sa,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:6}}>Contraseña</label>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Tu contraseña" style={{...inp,fontSize:15,fontWeight:600,textAlign:"center",padding:14,borderRadius:12}} onKeyDown={e=>e.key==="Enter"&&login()}/>
          </div>
          {error&&<div style={{color:C.red,fontSize:12,marginBottom:12,padding:10,background:C.red+"0c",borderRadius:10,textAlign:"center",border:`1px solid ${C.red}15`}}>{error}</div>}
          <button className="bh" onClick={login} disabled={loading} style={{width:"100%",padding:15,borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.dg},#0a6b50)`,color:C.gold,fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 8px 24px rgba(13,77,61,.4)",opacity:loading?.6:1}}>{loading?"Cargando...":"Acceder →"}</button>
          <div style={{textAlign:"center",marginTop:16,fontSize:10,color:C.mu}}>¿No tienes acceso? <a href="https://wa.me/34683105553" target="_blank" rel="noreferrer" style={{color:C.wa,textDecoration:"none",fontWeight:700}}>WhatsApp</a></div>
        </div>
      </div>
    </div>);
  }

  /* ═══ ADMIN ═══ */
  if(isAdmin){
    const tRefs=allAf.reduce((s,a)=>s+a.rs.length,0);
    const tPagado=allAf.reduce((s,a)=>s+a.pg.reduce((p,x)=>p+x.m,0),0);
    const tCap=allAf.reduce((s,a)=>s+a.ca,0);
    const tPend=allAf.reduce((s,a)=>s+a.rs.filter(r=>!r.p).length*gT(a.rs.length).com,0);
    const pendPago=allAf.filter(a=>a.rs.some(r=>!r.p));
    const enRiesgo=allAf.filter(a=>{const t=gT(a.rs.length);return t.keep>0&&a.refsEsteMes<t.keep});

    return(<div style={{minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:DM}}><style>{css}</style>
      <header style={{background:C.cd,borderBottom:`1px solid ${C.bd}`,padding:"0 24px",height:56,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><img src={LG} alt="" style={{height:30}} onError={e=>{e.target.style.display="none"}}/><div><span style={{fontSize:15,fontWeight:800,color:C.gold,fontFamily:PF}}>War Room</span><div style={{fontSize:8,color:C.mu,letterSpacing:1}}>ADMIN</div></div></div>
        <button onClick={logout} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.bd}`,background:"transparent",color:C.mu,cursor:"pointer",fontSize:11,fontWeight:600}}>Salir</button>
      </header>

      <div style={{display:"flex",gap:4,padding:"8px 24px",background:C.bg2,borderBottom:`1px solid ${C.bd}`,flexWrap:"wrap"}}>
        {[["ranking","⚔️ Ranking"],["codigos","🔗 Enlaces"],["pagos","💰 Pagos"],["alertas","🔔 Alertas"],["ajustes","⚙️ Ajustes"]].map(([id,l])=>(
          <button key={id} onClick={()=>{setAdminTab(id);setSelAf(null)}} className="bh" style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${adminTab===id?C.gold+"40":C.bd}`,background:adminTab===id?C.gold+"0c":"transparent",color:adminTab===id?C.gold:C.mu,cursor:"pointer",fontSize:12,fontWeight:700}}>{l}</button>
        ))}
      </div>

      <main style={{padding:"16px 24px"}}>
        <div className="fu" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:16}}>
          {[[allAf.length,"Afiliados",C.gold],[tRefs,"Referidos",C.green],[tPagado+"€","Pagado",C.green],[tPend+"€","Pendiente",C.sa],[tCap.toLocaleString()+"€","Capital",C.pu]].map(([v,l,c],i)=><Stat key={i} value={v} label={l} color={c} small/>)}
        </div>

        {/* RANKING */}
        {adminTab==="ranking"&&!selAf&&(
          <div className="fu s1" style={crd}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:800,fontFamily:PF,color:C.gold}}>⚔️ Ranking</div>
              <button onClick={()=>setShowAdd(true)} className="bh" style={{padding:"6px 14px",borderRadius:8,border:"none",background:C.dg,color:C.gold,cursor:"pointer",fontSize:11,fontWeight:700}}>+ Nuevo Afiliado</button>
            </div>
            {ranking.map((a,r)=>{const t=gT(a.rs.length);const nt=gN(a.rs.length);const pend=a.rs.filter(x=>!x.p).length*t.com;const riesgo=t.keep>0&&a.refsEsteMes<t.keep;return(
              <div key={a.codigo} onClick={()=>setSelAf(a)} className="ch" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",borderRadius:12,marginBottom:4,border:`1px solid ${riesgo?C.red+"30":r===0?C.gold+"30":C.bd}`,background:riesgo?C.red+"04":r===0?C.gold+"06":C.bg2,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:16,width:24,textAlign:"center"}}>{r<3?["🥇","🥈","🥉"][r]:<span style={{fontSize:12,color:C.mu,fontWeight:700}}>{r+1}</span>}</span>
                  <div><div style={{fontSize:13,fontWeight:700}}>{a.nombre}{riesgo&&<span style={{fontSize:9,color:C.red,marginLeft:6}}>⚠️ riesgo</span>}</div><div style={{display:"flex",gap:6,alignItems:"center",marginTop:3}}><Badge tier={t} size="sm"/>{nt&&<span style={{fontSize:8,color:C.mu}}>→ {nt.i} faltan {nt.min-a.rs.length}</span>}</div></div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"flex-end"}}><span style={{fontSize:14,fontWeight:800,color:C.gold}}>{a.rs.length} <span style={{fontSize:9,fontWeight:500}}>refs</span></span><span style={{fontSize:12,fontWeight:700,color:C.green}}>+{a.pg.reduce((s,p)=>s+p.m,0)}€</span></div>
                  <div style={{fontSize:9,color:C.mu,marginTop:2}}>{a.refsEsteMes||0} este mes · {t.com}€/ref{pend>0&&<span style={{color:C.sa}}> · {pend}€ pend.</span>}</div>
                </div>
              </div>
            )})}
          </div>
        )}

        {/* RANKING DETAIL */}
        {adminTab==="ranking"&&selAf&&(()=>{const a=selAf;const t=gT(a.rs.length);const nt=gN(a.rs.length);const unpaid=a.rs.filter(r=>!r.p);return(
          <div className="fu">
            <button onClick={()=>{setSelAf(null);loadAf()}} className="bh" style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.bd}`,background:"transparent",color:C.mu,cursor:"pointer",fontSize:11,marginBottom:10,fontWeight:600}}>← Volver</button>
            <div style={{...crd,background:`linear-gradient(135deg,${C.dg}10,${t.c}08)`,border:`1px solid ${t.c}20`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                <div><div style={{fontSize:18,fontWeight:800,fontFamily:PF}}>{a.nombre}</div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:6}}><Badge tier={t}/><span style={{fontSize:11,color:C.mu}}>{a.codigo}</span></div><div style={{fontSize:10,color:C.mu,marginTop:6}}>Comisión: <strong style={{color:t.c}}>{t.com}€/ref</strong> · Contraseña: <strong>{a.password||'—'}</strong></div>{nt&&<div style={{fontSize:10,color:nt.c,marginTop:4}}>→ {nt.i} {nt.n} (faltan {nt.min-a.rs.length})</div>}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>{[[a.rs.length,"Refs",C.gold],[a.pg.reduce((s,p)=>s+p.m,0)+"€","Pagado",C.green],[a.refsEsteMes||0,"Este mes",C.bl]].map(([v,l,c],i)=>(<div key={i} style={{textAlign:"center",padding:8,borderRadius:8,background:C.bg}}><div style={{fontSize:16,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:7,color:C.mu}}>{l}</div></div>))}</div>
              </div>
            </div>
            {/* Referidos con botón PAGAR */}
            <div style={crd}><div style={{fontSize:12,fontWeight:700,fontFamily:PF,marginBottom:10,color:C.gold}}>Referidos ({a.rs.length})</div>
              {a.rs.length===0?<div style={{textAlign:"center",padding:16,color:C.mu,fontSize:11}}>Sin referidos</div>:a.rs.map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:8,marginBottom:3,background:C.bg2}}>
                  <div><span style={{fontSize:11,fontWeight:600}}>{r.n}</span><span style={{fontSize:9,color:C.mu,marginLeft:6}}>{r.fecha}</span></div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:11}}>{r.k.toLocaleString()}€</span>
                    <span style={{fontSize:11,fontWeight:800,color:C.green}}>→ {r.comision}€</span>
                    {r.p?<span style={{fontSize:10,color:C.green}}>✅ Pagado</span>:
                      <button onClick={(e)=>{e.stopPropagation();markPaid(a,r)}} className="bh" style={{padding:"4px 10px",borderRadius:6,border:"none",background:C.gold+"15",color:C.gold,cursor:"pointer",fontSize:10,fontWeight:700}}>💰 Pagar {r.comision}€</button>
                    }
                  </div>
                </div>
              ))}
            </div>
            <div style={crd}><div style={{fontSize:12,fontWeight:700,fontFamily:PF,marginBottom:8,color:C.wa}}>🔗 Enlace</div><div style={{padding:10,borderRadius:8,background:C.bg,border:`1px solid ${C.bd}`,fontSize:10,wordBreak:"break-all",color:C.mu,marginBottom:8}}>{waLink(a.nombre,a.codigo)}</div><div style={{display:"flex",gap:6}}><button onClick={()=>copy(waLink(a.nombre,a.codigo),a.codigo+"-l")} className="bh" style={{flex:1,padding:8,borderRadius:8,border:"none",background:C.wa+"15",color:C.wa,cursor:"pointer",fontSize:11,fontWeight:700}}>{copied===a.codigo+"-l"?"✅":"📋 Copiar"}</button><a href={waLink(a.nombre,a.codigo)} target="_blank" rel="noreferrer" className="bh" style={{flex:1,padding:8,borderRadius:8,background:C.wa+"15",color:C.wa,textAlign:"center",textDecoration:"none",fontSize:11,fontWeight:700,display:"block"}}>📱 WA</a></div></div>
          </div>)})()}

        {/* ENLACES */}
        {adminTab==="codigos"&&(<div className="fu s1" style={crd}><div style={{fontSize:14,fontWeight:800,fontFamily:PF,marginBottom:14,color:C.gold}}>🔗 Enlaces</div>{allAf.map(a=>{const t=gT(a.rs.length);return(<div key={a.codigo} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,marginBottom:4,background:C.bg2,border:`1px solid ${C.bd}`}}><div style={{display:"flex",alignItems:"center",gap:8}}><Badge tier={t} size="sm"/><span style={{fontSize:12,fontWeight:700}}>{a.nombre}</span></div><div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontWeight:800,color:C.gold,fontSize:11,padding:"3px 8px",borderRadius:5,background:C.gold+"08"}}>{a.codigo}</span><button onClick={()=>copy(waLink(a.nombre,a.codigo),a.codigo+"-w")} className="bh" style={{padding:"4px 8px",borderRadius:6,background:C.wa+"15",color:C.wa,cursor:"pointer",fontSize:10,border:"none",fontWeight:700}}>{copied===a.codigo+"-w"?"✅":"📱"}</button><a href={waLink(a.nombre,a.codigo)} target="_blank" rel="noreferrer" style={{padding:"4px 8px",borderRadius:6,background:C.wa+"10",color:C.wa,fontSize:10,textDecoration:"none",fontWeight:700}}>↗</a></div></div>)})}</div>)}

        {/* PAGOS */}
        {adminTab==="pagos"&&(<div className="fu s1" style={crd}><div style={{fontSize:14,fontWeight:800,fontFamily:PF,marginBottom:14,color:C.gold}}>💰 Comisiones</div>{allAf.map(a=>{const t=gT(a.rs.length);const pg=a.pg.reduce((s,p)=>s+p.m,0);const pn=a.rs.filter(r=>!r.p).length*t.com;return(<div key={a.codigo} style={{padding:"12px 14px",borderRadius:10,marginBottom:4,background:C.bg2,border:`1px solid ${C.bd}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:12,fontWeight:700}}>{a.nombre}</span><Badge tier={t} size="sm"/></div><span style={{fontSize:12,fontWeight:800,color:t.c}}>{t.com}€/ref</span></div><div style={{display:"flex",gap:12,fontSize:10}}><span style={{color:C.green}}>✅ {pg}€</span><span style={{color:C.sa}}>⏳ {pn}€</span></div></div>)})}
          <div style={{marginTop:12,padding:12,borderRadius:10,background:C.gold+"08",border:`1px solid ${C.gold}20`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,fontWeight:700,color:C.gold}}>Total pendiente</span><span style={{fontSize:16,fontWeight:800,color:C.gold}}>{allAf.reduce((s,a)=>s+a.rs.filter(r=>!r.p).length*gT(a.rs.length).com,0)}€</span></div>
        </div>)}

        {/* ALERTAS */}
        {adminTab==="alertas"&&(<div className="fu s1">
          {/* Pagos pendientes */}
          <div style={crd}>
            <div style={{fontSize:14,fontWeight:800,fontFamily:PF,marginBottom:14,color:C.sa}}>⏳ Pagos Pendientes</div>
            {allAf.flatMap(a=>a.rs.filter(r=>!r.p).map(r=>({af:a,ref:r}))).length===0
              ?<div style={{textAlign:"center",padding:16,color:C.mu,fontSize:11}}>✅ Todo pagado</div>
              :allAf.flatMap(a=>a.rs.filter(r=>!r.p).map(r=>({af:a,ref:r}))).map((item,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,marginBottom:4,background:C.bg2}}>
                  <div><span style={{fontSize:11,fontWeight:700}}>{item.af.nombre}</span><span style={{fontSize:10,color:C.mu,marginLeft:6}}>→ {item.ref.n}</span></div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:12,fontWeight:800,color:C.gold}}>{item.ref.comision}€</span>
                    <button onClick={()=>markPaid(item.af,item.ref)} className="bh" style={{padding:"4px 10px",borderRadius:6,border:"none",background:C.green+"15",color:C.green,cursor:"pointer",fontSize:10,fontWeight:700}}>✅ Marcar pagado</button>
                  </div>
                </div>
              ))
            }
          </div>
          {/* En riesgo de bajar */}
          <div style={crd}>
            <div style={{fontSize:14,fontWeight:800,fontFamily:PF,marginBottom:14,color:C.red}}>⚠️ En Riesgo de Bajar Tier</div>
            {enRiesgo.length===0
              ?<div style={{textAlign:"center",padding:16,color:C.mu,fontSize:11}}>Todos cumplen su mínimo</div>
              :enRiesgo.map(a=>{const t=gT(a.rs.length);return(
                <div key={a.codigo} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,marginBottom:4,background:C.red+"06",border:`1px solid ${C.red}15`}}>
                  <div><span style={{fontSize:12,fontWeight:700}}>{a.nombre}</span><span style={{marginLeft:8}}><Badge tier={t} size="sm"/></span></div>
                  <div style={{fontSize:10,color:C.red,fontWeight:700}}>{a.refsEsteMes}/{t.keep} refs este mes</div>
                </div>
              )})
            }
          </div>
        </div>)}

        {/* AJUSTES */}
        {adminTab==="ajustes"&&(<div className="fu s1">
          <div style={crd}>
            <div style={{fontSize:14,fontWeight:800,fontFamily:PF,marginBottom:14,color:C.gold}}>⚙️ Ajustes del Mes</div>
            <button onClick={resetMonth} className="bh" style={{width:"100%",padding:14,borderRadius:10,border:`1px solid ${C.red}30`,background:C.red+"08",color:C.red,cursor:"pointer",fontSize:13,fontWeight:700,marginBottom:10}}>🔄 Resetear Mes (degradar tiers que no cumplen)</button>
            <div style={{fontSize:10,color:C.mu,padding:10,borderRadius:8,background:C.bg}}>
              Esto resetea <strong>refs_este_mes</strong> a 0 para todos. Los que no cumplieron el mínimo bajan 1 tier. Hazlo el día 1 de cada mes.
            </div>
          </div>
          <div style={crd}>
            <div style={{fontSize:12,fontWeight:700,fontFamily:PF,marginBottom:8}}>Contraseñas</div>
            {allAf.map(a=>(<div key={a.codigo} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",borderRadius:6,marginBottom:2,background:C.bg2}}><span style={{fontSize:11}}>{a.nombre}</span><div style={{display:"flex",gap:8}}><span style={{fontSize:10,color:C.gold}}>{a.codigo}</span><span style={{fontSize:10,color:C.mu}}>{a.password}</span></div></div>))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",borderRadius:6,marginBottom:2,background:C.gold+"06",marginTop:4}}><span style={{fontSize:11,fontWeight:700}}>ADMIN</span><span style={{fontSize:10,color:C.gold}}>{adminPw}</span></div>
          </div>
        </div>)}
      </main>

      {/* MODAL: Add Afiliado */}
      {showAdd&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={()=>setShowAdd(false)}><div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:18,width:"100%",maxWidth:380,padding:24}}>
        <div style={{fontSize:15,fontWeight:800,fontFamily:PF,marginBottom:16,color:C.gold}}>➕ Nuevo Afiliado</div>
        {[["Nombre","nombre","David López"],["Código","codigo","DAVID-SG"],["Contraseña","password","david2026"],["Capital Inicial €","capital_inicial","3000"]].map(([l,k,ph])=>(
          <div key={k} style={{marginBottom:10}}><label style={{fontSize:9,color:C.sa,fontWeight:700,display:"block",marginBottom:4,letterSpacing:1,textTransform:"uppercase"}}>{l}</label><input value={newAf[k]} onChange={e=>setNewAf({...newAf,[k]:k==="codigo"?e.target.value.toUpperCase():e.target.value})} placeholder={ph} style={{...inp,borderRadius:10}}/></div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4}}>
          <button onClick={()=>setShowAdd(false)} style={{padding:12,borderRadius:10,border:`1px solid ${C.bd}`,background:"transparent",color:C.mu,cursor:"pointer",fontSize:12}}>Cancelar</button>
          <button className="bh" onClick={addAfiliado} style={{padding:12,borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.dg},#0a6b50)`,color:C.gold,fontWeight:800,fontSize:13,cursor:"pointer"}}>✅ Crear</button>
        </div>
      </div></div>)}
    </div>);
  }

  /* ═══ USER ═══ */
  const tabs=[["h","🏠","Inicio"],["n","🏆","Niveles"],["r","👥","Referidos"],["p","💰","Pagos"],["i","📈","Inversión"],["f","⚙️","Perfil"]];

  return(<div style={{minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:DM}}><style>{css}</style>
    <header style={{background:C.cd,borderBottom:`1px solid ${C.bd}`,padding:"0 24px",height:56,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><img src={LG} alt="" style={{height:30}} onError={e=>{e.target.style.display="none"}}/><div><div style={{fontSize:14,fontWeight:800,color:C.gold,fontFamily:PF}}>Portal Afiliados</div><div style={{fontSize:9,color:C.mu,display:"flex",alignItems:"center",gap:4}}>{user.nombre} · <Badge tier={tier} size="sm"/></div></div></div>
      <button onClick={logout} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.bd}`,background:"transparent",color:C.mu,cursor:"pointer",fontSize:11,fontWeight:600}}>Salir</button>
    </header>
    <nav style={{display:"flex",gap:0,padding:"0 16px",background:C.bg2,borderBottom:`1px solid ${C.bd}`,overflowX:"auto"}}>
      {tabs.map(([id,ic,label])=>(<button key={id} onClick={()=>setTab(id)} style={{padding:"10px 12px",border:"none",cursor:"pointer",fontSize:11,background:"transparent",color:tab===id?C.gold:C.mu,fontWeight:tab===id?800:500,borderBottom:`2px solid ${tab===id?C.gold:"transparent"}`,display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:50}}><span style={{fontSize:14}}>{ic}</span><span style={{fontSize:8,letterSpacing:.5}}>{label}</span></button>))}
    </nav>
    <main style={{padding:"16px 24px"}}>

      {tab==="h"&&(<div>
        <div className="fu" style={{...crd,background:`linear-gradient(135deg,${C.dg}18,${C.gold}06)`,border:`1px solid ${C.gold}15`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}><div><div style={{fontSize:9,color:C.sa,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>Bienvenido</div><div style={{fontFamily:PF,fontSize:22,fontWeight:800,marginTop:6}}>{user.nombre}</div><div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}><Badge tier={tier}/><span style={{fontSize:11,color:C.mu}}>{tier.com}€/ref</span></div>{tier.keep>0&&<div style={{fontSize:9,color:C.sa,marginTop:6}}>🔄 Necesitas {tier.keep} refs/mes · <span style={{color:refsEsteMes>=tier.keep?C.green:C.red,fontWeight:700}}>{refsEsteMes}/{tier.keep} {refsEsteMes>=tier.keep?"✅":"⚠️"}</span></div>}</div><div style={{textAlign:"center",background:C.bg+"90",borderRadius:14,padding:"12px 22px",border:`1px solid ${C.bd}`}}><div style={{fontSize:8,color:C.mu,textTransform:"uppercase",letterSpacing:1}}>Próximo pago</div><div style={{fontSize:28,fontWeight:800,color:C.gold,fontFamily:PF,lineHeight:1.1,marginTop:4}}>{diasPago}</div><div style={{fontSize:8,color:C.mu}}>días</div></div></div></div>
        <div className="fu s1" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:12}}><Stat value={user.rs.length} label="Referidos" color={C.gold} small/><Stat value={totalGanado+"€"} label="Ganado" color={C.green} small/><Stat value={pendiente+"€"} label="Pendiente" color={C.sa} small/><Stat value={user.ca.toLocaleString()+"€"} label="Capital" color={C.pu} small/></div>
        <div className="fu s2" style={crd}><div style={{fontSize:13,fontWeight:800,color:C.gold,fontFamily:PF,marginBottom:8}}>🔗 Comparte y Gana {tier.com}€</div><div style={{fontSize:10,color:C.mu,marginBottom:10}}>Tu enlace envía un WhatsApp automático identificándote.</div><div style={{display:"flex",gap:6,alignItems:"center",background:C.bg,borderRadius:10,padding:"8px 14px",border:`1px solid ${C.bd}`,marginBottom:10}}><div style={{fontSize:16,fontWeight:800,color:C.gold,letterSpacing:3,flex:1,textAlign:"center",fontFamily:PF}}>{user.codigo}</div><button onClick={()=>copy(user.codigo,"code")} className="bh" style={{padding:"6px 14px",borderRadius:8,border:"none",background:copied==="code"?C.green+"18":C.dg,color:copied==="code"?C.green:C.gold,cursor:"pointer",fontSize:11,fontWeight:700}}>{copied==="code"?"✅":"📋"}</button></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}><a href={waLink(user.nombre,user.codigo)} target="_blank" rel="noreferrer" className="bh" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:10,borderRadius:10,background:C.wa+"12",color:C.wa,textDecoration:"none",fontSize:12,fontWeight:800,border:`1px solid ${C.wa}25`}}>📱 WhatsApp</a><button onClick={()=>copy(waLink(user.nombre,user.codigo),"walink")} className="bh" style={{padding:10,borderRadius:10,border:`1px solid ${C.bd}`,background:C.bg,color:C.sa,cursor:"pointer",fontSize:12,fontWeight:700}}>{copied==="walink"?"✅ Copiado":"🔗 Copiar"}</button></div></div>
        {user.rs.length>0&&<div className="fu s3" style={crd}><div style={{fontSize:12,fontWeight:700,fontFamily:PF,marginBottom:8}}>Últimos Referidos</div>{user.rs.slice(-3).reverse().map((r,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",borderRadius:8,marginBottom:3,background:C.bg2}}><div><span style={{fontSize:11,fontWeight:600}}>{r.n}</span><span style={{fontSize:9,color:C.mu,marginLeft:6}}>{r.fecha}</span></div><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:12,fontWeight:800,color:C.green}}>+{r.comision}€</span><span style={{fontSize:10,color:r.p?C.green:C.gold}}>{r.p?"✅":"⏳"}</span></div></div>))}</div>}
        {nextTier&&<div className="fu s3" style={{...crd,background:nextTier.c+"06",border:`1px solid ${nextTier.c}15`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:11,fontWeight:700}}>→ <span style={{color:nextTier.c}}>{nextTier.i} {nextTier.n}</span></span><span style={{fontSize:12,fontWeight:800,color:nextTier.c}}>+{nextTier.com-tier.com}€/ref</span></div><Prog current={user.rs.length} total={nextTier.min} colorFrom={tier.c} colorTo={nextTier.c}/><div style={{fontSize:9,color:C.mu,marginTop:6,textAlign:"center"}}>{user.rs.length}/{nextTier.min} — faltan {nextTier.min-user.rs.length}</div></div>}
      </div>)}

      {tab==="n"&&(<div>
        <div className="fu" style={{fontSize:18,fontWeight:800,fontFamily:PF,marginBottom:14}}>🏆 Niveles</div>
        <div className="fu s1" style={{...crd,padding:0}}><div style={{padding:"16px 18px",display:"flex",position:"relative",alignItems:"center"}}><div style={{position:"absolute",top:"50%",left:24,right:24,height:4,background:C.bd,zIndex:0,transform:"translateY(-50%)",borderRadius:2}}/><div style={{position:"absolute",top:"50%",left:24,height:4,background:`linear-gradient(90deg,${C.green},${C.gold})`,zIndex:1,transform:"translateY(-50%)",width:`${Math.min(100,(TIERS.findIndex(x=>x.n===tier.n)/(TIERS.length-1))*100)}%`,borderRadius:2}}/>{TIERS.map(t=>{const d=user.rs.length>=t.min,cur=t.n===tier.n;return(<div key={t.n} style={{flex:1,textAlign:"center",position:"relative",zIndex:2}}><div style={{width:cur?44:32,height:cur?44:32,borderRadius:"50%",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",fontSize:cur?18:13,background:d?t.c+"18":C.bg,border:`3px solid ${d?t.c:C.bd}`,boxShadow:cur?`0 0 20px ${t.c}30`:"none",opacity:d?1:.3}}>{t.i}</div><div style={{marginTop:4,fontSize:cur?10:8,fontWeight:cur?800:600,color:d?t.c:C.mu}}>{t.n}</div><div style={{fontSize:7,color:C.mu}}>{t.com}€</div></div>)})}</div>{nextTier&&<div style={{padding:"10px 18px",borderTop:`1px solid ${C.bd}`,background:nextTier.c+"06",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11}}>→ <strong style={{color:nextTier.c}}>{nextTier.i} {nextTier.n}</strong> — faltan <strong style={{color:nextTier.c}}>{nextTier.min-user.rs.length}</strong></span><span style={{fontWeight:800,color:nextTier.c,fontSize:13}}>+{nextTier.com-tier.com}€</span></div>}</div>
        <div className="fu s2" style={crd}><div style={{fontSize:13,fontWeight:700,fontFamily:PF,marginBottom:10}}>💰 Comisiones</div>{TIERS.map(t=>{const cur=t.n===tier.n;return(<div key={t.n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderRadius:10,marginBottom:4,border:`1px solid ${cur?t.c+"40":C.bd}`,background:cur?t.c+"08":C.bg2}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{t.i}</span><div><div style={{fontSize:12,fontWeight:700,color:cur?t.c:C.tx}}>{t.n}{cur?" ← TÚ":""}</div><div style={{fontSize:9,color:C.mu}}>{t.min}+ refs · {t.desc}</div></div></div><span style={{fontSize:18,fontWeight:800,color:cur?t.c:C.tx,fontFamily:PF}}>{t.com}€</span></div>)})}</div>
        {tier.keep>0&&<div className="fu s3" style={{...crd,background:refsEsteMes>=tier.keep?C.green+"06":C.red+"06",border:`1px solid ${refsEsteMes>=tier.keep?C.green:C.red}20`}}><div style={{fontSize:12,fontWeight:700,fontFamily:PF,marginBottom:6}}>{refsEsteMes>=tier.keep?"✅ Nivel Asegurado":"⚠️ Mantén tu Nivel"}</div><div style={{fontSize:11,color:C.mu,marginBottom:8}}>Necesitas <strong style={{color:tier.c}}>{tier.keep} refs/mes</strong>.{refsEsteMes<tier.keep?` Faltan ${tier.keep-refsEsteMes}.`:" ¡Vas bien!"}</div><Prog current={refsEsteMes} total={tier.keep} colorFrom={refsEsteMes>=tier.keep?C.green:C.red} colorTo={tier.c} height={8}/></div>}
        <div className="fu s3" style={crd}><div style={{fontSize:13,fontWeight:700,fontFamily:PF,marginBottom:10}}>🎁 Bonos</div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{bonos.map((b,i)=>{const e=refsEsteMes>=b.refs;return(<div key={i} style={{padding:14,borderRadius:12,background:e?b.color+"12":C.bg2,border:`1px solid ${e?b.color+"30":C.bd}`,textAlign:"center",opacity:e?1:.5}}><div style={{fontSize:24}}>{b.icon}</div><div style={{fontSize:20,fontWeight:800,color:b.color,fontFamily:PF,marginTop:4}}>+{b.amount}€</div><div style={{fontSize:9,color:C.mu,marginTop:2}}>{b.refs} refs/mes</div>{e&&<div style={{fontSize:8,color:C.green,fontWeight:700,marginTop:4}}>✅</div>}</div>)})}</div></div>
      </div>)}

      {tab==="r"&&(<div>
        <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{fontSize:18,fontWeight:800,fontFamily:PF}}>👥 Referidos</span><Badge tier={tier}/></div>
        {nextTier&&<div className="fu s1" style={{...crd,padding:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:11}}><span>Progreso a {nextTier.i} {nextTier.n}</span><span style={{color:nextTier.c,fontWeight:800}}>{user.rs.length}/{nextTier.min}</span></div><Prog current={user.rs.length} total={nextTier.min} colorFrom={tier.c} colorTo={nextTier.c} height={8}/></div>}
        <div className="fu s2" style={crd}>{user.rs.length===0?<div style={{textAlign:"center",padding:24}}><div style={{fontSize:32,marginBottom:8}}>🚀</div><div style={{fontSize:13,fontWeight:700}}>¡Empieza a referir!</div></div>:user.rs.map((r,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,marginBottom:4,background:C.bg2}}><div><span style={{fontSize:12,fontWeight:600}}>{r.n}</span><span style={{fontSize:9,color:C.mu,marginLeft:6}}>{r.fecha}</span></div><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:10,color:C.mu}}>{r.k.toLocaleString()}€</span><span style={{fontSize:12,fontWeight:800,color:C.green}}>+{r.comision}€</span><span style={{fontSize:11,color:r.p?C.green:C.gold}}>{r.p?"✅":"⏳"}</span></div></div>))}</div>
        <div className="fu s3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}><Stat value={totalGanado+"€"} label="Cobrado" color={C.green} small/><Stat value={pendiente+"€"} label="Pendiente" color={C.gold} small/><Stat value="Día 20" label="Pago" color={C.sa} small/></div>
      </div>)}

      {tab==="p"&&(<div>
        <div className="fu" style={{fontSize:18,fontWeight:800,fontFamily:PF,marginBottom:14}}>💰 Pagos</div>
        <div className="fu s1" style={crd}>{user.pg.length===0?<div style={{textAlign:"center",padding:20,color:C.mu,fontSize:11}}>Sin pagos</div>:user.pg.map((p,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,marginBottom:4,background:C.bg2}}><div><span style={{fontSize:12,fontWeight:600}}>{p.r}</span><span style={{fontSize:9,color:C.mu,marginLeft:6}}>{p.fecha}</span></div><span style={{fontSize:14,fontWeight:800,color:C.green}}>+{p.m}€ ✅</span></div>))}{pendiente>0&&<div style={{padding:12,borderRadius:10,border:`1px solid ${C.gold}20`,background:C.gold+"06",marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11,color:C.gold,fontWeight:600}}>Próximo · Día 20</span><span style={{fontSize:16,fontWeight:800,color:C.gold,fontFamily:PF}}>{pendiente}€</span></div>}</div>
        <div className="fu s2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Stat value={totalGanado+"€"} label="Cobrado" color={C.green}/><Stat value={(totalGanado+pendiente)+"€"} label="Generado" color={C.gold}/></div>
      </div>)}

      {tab==="i"&&(<div>
        <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{fontSize:18,fontWeight:800,fontFamily:PF}}>📈 Inversión</span><button onClick={()=>setShowModal(true)} className="bh" style={{padding:"7px 16px",borderRadius:8,border:"none",background:C.dg,color:C.gold,fontWeight:700,fontSize:11,cursor:"pointer"}}>+ Registrar</button></div>
        <div className="fu s1" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:12}}><Stat value={user.ca.toLocaleString()+"€"} label="Capital" color={C.gold} small/><Stat value={"+"+ganInv+"€"} label="Ganancia" color={C.green} small/><Stat value={rentAcum+"%"} label="Rent." color={C.pu} small/><Stat value={"+"+mejorMes.r+"%"} label={mejorMes.ms} color={C.sa} small/></div>
        {rentData.length>0&&<div><div className="fu s2"><CapChart data={rentData}/></div><div className="fu s3" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><RChart data={rentData}/><div style={crd}><div style={{fontSize:11,fontWeight:700,fontFamily:PF,marginBottom:8,color:C.pu}}>📋 Historial</div>{[...rentData].reverse().map((r,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 8px",borderRadius:6,marginBottom:2,background:C.bg2}}><span style={{fontSize:10,fontWeight:600}}>{r.ms}</span><div style={{display:"flex",gap:8}}><span style={{fontSize:10,color:C.mu}}>{r.c.toLocaleString()}€</span><span style={{fontSize:11,fontWeight:800,color:r.r>=0?C.green:C.red}}>{r.r>=0?"+":""}{r.r}%</span></div></div>))}</div></div></div>}
      </div>)}

      {tab==="f"&&(<div>
        <div className="fu" style={{fontSize:18,fontWeight:800,fontFamily:PF,marginBottom:14}}>⚙️ Perfil</div>
        <div className="fu s1" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={crd}><div style={{fontSize:16,fontWeight:800,fontFamily:PF,marginBottom:8}}>{user.nombre}</div><Badge tier={tier}/><div style={{fontSize:11,color:C.mu,marginTop:8}}>{tier.com}€/ref</div><div style={{padding:"6px 8px",borderRadius:6,background:C.bg,marginTop:8,fontSize:11}}><span style={{color:C.gold,fontWeight:800}}>{user.codigo}</span></div>{nextTier&&<div style={{fontSize:10,color:C.mu,marginTop:10}}>→ {nextTier.i} faltan {nextTier.min-user.rs.length}</div>}</div>
          <div style={crd}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{[[user.rs.length,"Refs",C.gold],[totalGanado+"€","Ganado",C.green],[rentAcum+"%","Rent.",C.pu],[user.pg.length,"Pagos",C.sa]].map(([v,l,c],i)=>(<div key={i} style={{textAlign:"center",padding:10,borderRadius:10,background:C.bg}}><div style={{fontSize:18,fontWeight:800,color:c,fontFamily:PF}}>{v}</div><div style={{fontSize:7,color:C.mu,textTransform:"uppercase",letterSpacing:1}}>{l}</div></div>))}</div></div>
        </div>
        <div className="fu s2" style={crd}><div style={{fontSize:12,fontWeight:700,fontFamily:PF,marginBottom:8,color:C.wa}}>📱 Tu Enlace</div><div style={{padding:10,borderRadius:8,background:C.bg,border:`1px solid ${C.bd}`,fontSize:10,wordBreak:"break-all",color:C.mu,marginBottom:8,lineHeight:1.5}}>{waLink(user.nombre,user.codigo)}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}><a href={waLink(user.nombre,user.codigo)} target="_blank" rel="noreferrer" className="bh" style={{display:"block",padding:10,borderRadius:8,background:C.wa+"12",color:C.wa,textAlign:"center",textDecoration:"none",fontSize:12,fontWeight:700,border:`1px solid ${C.wa}25`}}>📱 WA</a><button onClick={()=>copy(waLink(user.nombre,user.codigo),"pf-wa")} className="bh" style={{padding:10,borderRadius:8,border:`1px solid ${C.bd}`,background:C.bg,color:C.sa,cursor:"pointer",fontSize:12,fontWeight:700}}>{copied==="pf-wa"?"✅":"🔗 Copiar"}</button></div></div>
        <div className="fu s3" style={{...crd,background:C.gold+"04"}}><div style={{fontSize:11,display:"flex",justifyContent:"space-between"}}><span>💬 ¿Ayuda?</span><a href="https://wa.me/34683105553" target="_blank" rel="noreferrer" style={{color:C.wa,textDecoration:"none",fontWeight:700,fontSize:11}}>+34 683 105 553</a></div></div>
      </div>)}
    </main>

    {showModal&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={()=>setShowModal(false)}><div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:18,width:"100%",maxWidth:340,padding:24}}><div style={{fontSize:15,fontWeight:800,fontFamily:PF,marginBottom:16,color:C.gold}}>📊 Registrar Mes</div>{[["Mes","m","Abr 26"],["Rent %","r","5.2"],["Capital €","c","4500"]].map(([l,k,ph])=>(<div key={k} style={{marginBottom:10}}><label style={{fontSize:9,color:C.sa,fontWeight:700,display:"block",marginBottom:4,letterSpacing:1,textTransform:"uppercase"}}>{l}</label><input type={k==="m"?"text":"number"} step="0.1" value={newMonth[k]} onChange={e=>setNewMonth({...newMonth,[k]:e.target.value})} placeholder={ph} style={{...inp,borderRadius:10}}/></div>))}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4}}><button onClick={()=>setShowModal(false)} style={{padding:12,borderRadius:10,border:`1px solid ${C.bd}`,background:"transparent",color:C.mu,cursor:"pointer",fontSize:12}}>Cancelar</button><button className="bh" onClick={saveMonth} style={{padding:12,borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.dg},#0a6b50)`,color:C.gold,fontWeight:800,fontSize:13,cursor:"pointer"}}>✅ Guardar</button></div></div></div>)}
  </div>);
}