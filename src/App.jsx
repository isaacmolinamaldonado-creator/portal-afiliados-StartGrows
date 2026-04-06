import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

/* ═══ TOKENS ═══ */
const C = {
  gold:"#D4AF37", goldL:"#f0d878", green:"#34d399", dg:"#0f6b52", mu:"#8b9e93",
  bg:"#0a0f0c", bg2:"#111a14", bg3:"#182019", card:"#141e17",
  bd:"rgba(212,175,55,0.08)", red:"#f87171", pu:"#a78bfa", bl:"#60a5fa",
  pk:"#f472b6", sa:"#d4a574", tx:"#ecf0ed", txM:"#c8d5cc", wa:"#25D366",
  acc:"#22c55e"
};
const PF="'Playfair Display',serif", DM="'DM Sans',sans-serif";
const LG="https://startgrows.es/wp-content/uploads/2025/08/LOGO-2.png";

/* ═══ TIERS ═══ */
const TIERS=[
  {n:"Bronce",i:"🥉",min:0,max:2,com:80,c:"#CD7F32",keep:0,desc:"Inicio"},
  {n:"Plata",i:"🥈",min:3,max:4,com:85,c:"#C0C0C0",keep:1,desc:"1 ref/mes"},
  {n:"Oro",i:"🥇",min:5,max:7,com:90,c:"#FFD700",keep:2,desc:"2 refs/mes"},
  {n:"Diamante",i:"💎",min:8,max:11,com:95,c:"#7dd3fc",keep:3,desc:"3 refs/mes"},
  {n:"Élite",i:"👑",min:12,max:999,com:100,c:C.goldL,keep:4,desc:"4 refs/mes"},
];
const DEF_BONOS=[{refs:3,amount:50,icon:"⚡",color:C.bl},{refs:6,amount:100,icon:"🔥",color:C.pk},{refs:10,amount:150,icon:"💎",color:C.pu}];
const gT=n=>TIERS.find(t=>n>=t.min&&n<=t.max)||TIERS[0];
const gN=n=>{const i=TIERS.findIndex(t=>n>=t.min&&n<=t.max);return i<TIERS.length-1?TIERS[i+1]:null};

const waLink=(nm,cd)=>{
  const m=[`¡Hola! 👋 Soy referido de *${nm}* (código: ${cd}). Me interesa StartGrows y el copy trading.`,`¡Buenas! Me recomendó *${nm}* (${cd}). Quiero info sobre StartGrows.`,`Hola, vengo de parte de *${nm}* (ref: ${cd}). Quiero hacer crecer mi capital con StartGrows.`];
  return`https://wa.me/34683105553?text=${encodeURIComponent(m[cd.split("").reduce((s,c)=>s+c.charCodeAt(0),0)%m.length])}`;
};

/* ═══ STYLES ═══ */
const crd={background:C.card,borderRadius:16,padding:20,marginBottom:14};
const inp={width:"100%",padding:13,borderRadius:10,border:`1px solid ${C.bg3}`,background:C.bg2,color:C.tx,fontSize:14,boxSizing:"border-box"};
const btnP={padding:"10px 20px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.dg},${C.acc})`,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"};
const css=`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{font-family:${DM};background:${C.bg};-webkit-font-smoothing:antialiased}::placeholder{color:${C.mu}60}input:focus{outline:none;border-color:${C.gold}60!important}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.gold}25;border-radius:4px}@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fu .4s ease forwards}.s1{animation-delay:.06s;opacity:0}.s2{animation-delay:.12s;opacity:0}.s3{animation-delay:.18s;opacity:0}.bh{transition:all .15s ease}.bh:hover{transform:translateY(-1px);filter:brightness(1.1)}.bh:active{transform:scale(.98)}`;

/* ═══ COMPONENTS ═══ */
function CapChart({data}){if(!data?.length)return null;return(<div style={crd}><div style={{fontSize:12,fontWeight:700,fontFamily:PF,marginBottom:10,color:C.gold}}>📈 Capital</div><ResponsiveContainer width="100%" height={160}><AreaChart data={data}><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.gold} stopOpacity={.3}/><stop offset="100%" stopColor={C.green} stopOpacity={0}/></linearGradient></defs><XAxis dataKey="ms" tick={{fill:C.mu,fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:C.mu,fontSize:10}} axisLine={false} tickLine={false} width={45}/><Tooltip contentStyle={{background:C.bg3,border:"none",borderRadius:10,fontSize:12,color:C.tx,boxShadow:"0 8px 32px rgba(0,0,0,.4)"}}/><Area type="monotone" dataKey="c" stroke={C.gold} fill="url(#cg)" strokeWidth={2.5} dot={{r:3,fill:C.gold,strokeWidth:0}}/></AreaChart></ResponsiveContainer></div>)}
function RChart({data}){if(!data?.length)return null;return(<div style={crd}><div style={{fontSize:12,fontWeight:700,fontFamily:PF,marginBottom:10,color:C.green}}>📊 Rentabilidad</div><ResponsiveContainer width="100%" height={130}><BarChart data={data}><XAxis dataKey="ms" tick={{fill:C.mu,fontSize:9}} axisLine={false} tickLine={false}/><YAxis tick={{fill:C.mu,fontSize:9}} axisLine={false} tickLine={false}/><Bar dataKey="r" radius={[5,5,0,0]}>{data.map((e,i)=><Cell key={i} fill={e.r>=0?C.green:C.red}/>)}</Bar></BarChart></ResponsiveContainer></div>)}
function S({v,l,c,s}){return(<div style={{background:C.bg3,borderRadius:14,padding:s?12:16,textAlign:"center"}}><div style={{fontSize:s?17:22,fontWeight:800,color:c,fontFamily:PF}}>{v}</div><div style={{fontSize:s?8:9,color:C.mu,marginTop:3,textTransform:"uppercase",letterSpacing:1.2,fontWeight:600}}>{l}</div></div>)}
function B({tier,sz="md"}){const s=sz==="sm"?{fontSize:10,padding:"3px 10px",borderRadius:8}:{fontSize:12,padding:"5px 14px",borderRadius:10};return(<span style={{...s,background:`${tier.c}20`,color:tier.c,fontWeight:800,display:"inline-flex",alignItems:"center",gap:4}}>{tier.i} {tier.n}</span>)}
function P({cur,tot,cF,cT,h=7}){const p=Math.min(100,(cur/Math.max(tot,1))*100);return(<div style={{height:h,borderRadius:h,background:C.bg,overflow:"hidden",width:"100%"}}><div style={{height:"100%",borderRadius:h,background:`linear-gradient(90deg,${cF},${cT})`,width:`${p}%`,transition:"width .6s"}}/></div>)}
function Row({children,style={}}){return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderRadius:12,marginBottom:4,background:C.bg2,...style}}>{children}</div>}
function Modal({onClose,children}){return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(4px)"}} onClick={onClose}><div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.card,borderRadius:20,width:"100%",maxWidth:400,padding:28,boxShadow:"0 24px 64px rgba(0,0,0,.6)"}}>{children}</div></div>)}

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
  const[showModal,setShowModal]=useState(null); // null | 'month' | 'addUser' | 'addRef'
  const[newMonth,setNewMonth]=useState({m:"",r:"",c:""});
  const[selAf,setSelAf]=useState(null);
  const[adminTab,setAdminTab]=useState("ranking");
  const[loading,setLoading]=useState(false);
  const[allAf,setAllAf]=useState([]);
  const[bonos,setBonos]=useState(DEF_BONOS);
  const[adminPw,setAdminPw]=useState("SGAdmin$$2026");
  const[newAf,setNewAf]=useState({nombre:"",codigo:"",password:"",capital_inicial:""});
  const[newRef,setNewRef]=useState({afiliado_id:"",nombre:"",capital:"",fecha:""});
  const[notifs,setNotifs]=useState([]);

  const loadConfig=useCallback(async()=>{try{const{data}=await supabase.from('afiliados_config').select('*');if(data?.length){const cfg={};data.forEach(r=>{cfg[r.clave]=r.valor});if(cfg.admin_password)setAdminPw(cfg.admin_password);const b=[...DEF_BONOS];if(cfg.bono_1_refs)b[0]={...b[0],refs:+cfg.bono_1_refs,amount:+(cfg.bono_1_amount||50)};if(cfg.bono_2_refs)b[1]={...b[1],refs:+cfg.bono_2_refs,amount:+(cfg.bono_2_amount||100)};if(cfg.bono_3_refs)b[2]={...b[2],refs:+cfg.bono_3_refs,amount:+(cfg.bono_3_amount||150)};setBonos(b)}}catch(e){}},[]);

  const loadAf=useCallback(async()=>{try{const[{data:afs},{data:refs},{data:pgs},{data:rts}]=await Promise.all([supabase.from('afiliados').select('*').eq('activo',true).order('created_at'),supabase.from('afiliados_referidos').select('*').order('created_at'),supabase.from('afiliados_pagos').select('*').order('created_at'),supabase.from('afiliados_rentabilidad').select('*').order('created_at')]);if(!afs)return;setAllAf(afs.map(a=>({...a,ci:a.capital_inicial||0,ca:a.capital_actual||0,refsEsteMes:a.refs_este_mes||0,rs:(refs||[]).filter(r=>r.afiliado_id===a.id).map(r=>({n:r.nombre,k:r.capital||0,p:r.pagado?1:0,fecha:r.fecha||'',comision:r.comision||80,refId:r.id})),pg:(pgs||[]).filter(p=>p.afiliado_id===a.id).map(p=>({m:p.monto||0,r:p.referido_nombre||'',fecha:p.fecha||''})),rt:(rts||[]).filter(r=>r.afiliado_id===a.id).map(r=>({ms:r.mes,r:r.rentabilidad||0,c:r.capital||0}))})))}catch(e){}},[]);

  useEffect(()=>{loadConfig();loadAf()},[loadConfig,loadAf]);

  // Load user notifications
  useEffect(()=>{if(user?.notificaciones)setNotifs(Array.isArray(user.notificaciones)?user.notificaciones:[])},[user]);

  const copy=(t,l)=>{try{navigator.clipboard.writeText(t)}catch(e){}setCopied(l);setTimeout(()=>setCopied(""),2e3)};

  const login=async()=>{setError("");setLoading(true);const c=code.trim(),p=pw.trim();
    if(c==="ADMIN"&&p===adminPw){setIsAdmin(true);setLoading(false);return}
    const f=allAf.find(a=>a.codigo.toLowerCase()===c.toLowerCase());
    if(!f){setError("Código no encontrado.");setLoading(false);return}
    if(f.password&&f.password!==p){setError("Contraseña incorrecta.");setLoading(false);return}
    setUser(f);setRentData(f.rt);setLoading(false)};
  const logout=()=>{setUser(null);setIsAdmin(false);setTab("h");setSelAf(null);setCode("");setPw("")};

  const markPaid=async(af,ref)=>{
    await supabase.from('afiliados_referidos').update({pagado:true,fecha_pago:new Date().toISOString().slice(0,7)}).eq('id',ref.refId);
    const mes=new Date().toISOString().slice(0,7);
    await supabase.from('afiliados_pagos').insert([{afiliado_id:af.id,referido_nombre:ref.n,monto:ref.comision,fecha:mes}]);
    // Notify
    const nots=Array.isArray(af.notificaciones)?af.notificaciones:[];
    nots.push({tipo:"pago",msg:`✅ Se te ha pagado ${ref.comision}€ por ${ref.n}`,fecha:new Date().toISOString()});
    await supabase.from('afiliados').update({notificaciones:nots}).eq('id',af.id);
    await loadAf();
  };

  const addAfiliado=async()=>{if(!newAf.nombre||!newAf.codigo||!newAf.password)return;
    await supabase.from('afiliados').insert([{nombre:newAf.nombre,codigo:newAf.codigo.toUpperCase(),password:newAf.password,capital_inicial:parseFloat(newAf.capital_inicial)||0,capital_actual:parseFloat(newAf.capital_inicial)||0,refs_este_mes:0,activo:true}]);
    setNewAf({nombre:"",codigo:"",password:"",capital_inicial:""});setShowModal(null);await loadAf()};

  const deleteAfiliado=async(af)=>{if(!window.confirm(`¿Eliminar a ${af.nombre}? Se eliminarán todos sus datos.`))return;
    await supabase.from('afiliados').update({activo:false}).eq('id',af.id);await loadAf();setSelAf(null)};

  const addReferido=async()=>{if(!newRef.afiliado_id||!newRef.nombre)return;
    const af=allAf.find(a=>a.id===newRef.afiliado_id);if(!af)return;
    const tier=gT(af.rs.length+1); // tier AFTER adding this ref
    await supabase.from('afiliados_referidos').insert([{afiliado_id:af.id,nombre:newRef.nombre,capital:parseFloat(newRef.capital)||0,pagado:false,comision:tier.com,fecha:newRef.fecha||new Date().toISOString().slice(0,7)}]);
    await supabase.from('afiliados').update({refs_este_mes:(af.refs_este_mes||0)+1}).eq('id',af.id);
    // Notify the affiliate
    const nots=Array.isArray(af.notificaciones)?af.notificaciones:[];
    nots.push({tipo:"ref",msg:`🎉 ¡Nuevo referido cerrado! ${newRef.nombre} — comisión: ${tier.com}€`,fecha:new Date().toISOString()});
    await supabase.from('afiliados').update({notificaciones:nots}).eq('id',af.id);
    setNewRef({afiliado_id:"",nombre:"",capital:"",fecha:""});setShowModal(null);await loadAf()};

  const resetMonth=async()=>{if(!window.confirm("¿Resetear mes y degradar tiers?"))return;
    for(const a of allAf){const tier=gT(a.rs.length);if(tier.keep>0&&a.refsEsteMes<tier.keep){const idx=TIERS.findIndex(t=>t.n===tier.n);const prev=idx>0?TIERS[idx-1]:TIERS[0];const nots=Array.isArray(a.notificaciones)?a.notificaciones:[];nots.push({tipo:"tier",msg:`⚠️ Has bajado a ${prev.i} ${prev.n} por no cumplir el mínimo mensual.`,fecha:new Date().toISOString()});await supabase.from('afiliados').update({refs_este_mes:0,tier_actual:prev.n,notificaciones:nots}).eq('id',a.id)}else{await supabase.from('afiliados').update({refs_este_mes:0}).eq('id',a.id)}}
    await loadAf();alert("✅ Mes reseteado.")};

  const saveMonth=async()=>{if(!newMonth.m||!newMonth.r||!newMonth.c||!user)return;
    await supabase.from('afiliados_rentabilidad').insert([{afiliado_id:user.id,mes:newMonth.m,rentabilidad:parseFloat(newMonth.r),capital:parseFloat(newMonth.c)}]);
    await supabase.from('afiliados').update({capital_actual:parseFloat(newMonth.c)}).eq('id',user.id);
    setRentData(p=>[...p,{ms:newMonth.m,r:parseFloat(newMonth.r),c:parseFloat(newMonth.c)}]);
    setNewMonth({m:"",r:"",c:""});setShowModal(null)};

  const clearNotif=async(idx)=>{const n=[...notifs];n.splice(idx,1);setNotifs(n);await supabase.from('afiliados').update({notificaciones:n}).eq('id',user.id)};

  // Computed
  const tier=user?gT(user.rs.length):TIERS[0];
  const nextTier=user?gN(user.rs.length):null;
  const totalGanado=user?user.pg.reduce((s,p)=>s+p.m,0):0;
  const pendiente=user?user.rs.filter(r=>!r.p).length*tier.com:0;
  const ganInv=user?user.ca-user.ci:0;
  const now=new Date(),np2=new Date(now.getFullYear(),now.getMonth(),20);
  if(now.getDate()>20)np2.setMonth(np2.getMonth()+1);
  const diasPago=Math.ceil((np2-now)/864e5);
  const rentAcum=rentData.reduce((s,r)=>s+r.r,0).toFixed(1);
  const mejorMes=rentData.length?rentData.reduce((b,r)=>r.r>b.r?r:b,rentData[0]):{r:0,ms:"-"};
  const refsEsteMes=user?(user.refsEsteMes||0):0;
  const ranking=[...allAf].sort((a,b)=>b.rs.length-a.rs.length);

  /* ═══ LOGIN ═══ */
  if(!user&&!isAdmin){
    return(<div style={{minHeight:"100vh",background:`radial-gradient(ellipse at top,${C.bg3},${C.bg})`,color:C.tx,fontFamily:DM}}><style>{css}</style>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:20}}>
        <div className="fu" style={{width:"100%",maxWidth:400,background:C.card,borderRadius:28,padding:"48px 36px",boxShadow:"0 40px 80px rgba(0,0,0,.5)"}}>
          <div style={{textAlign:"center",marginBottom:36}}>
            <img src={LG} alt="" style={{height:56,marginBottom:18}} onError={e=>{e.target.style.display="none"}}/>
            <h1 style={{fontFamily:PF,fontSize:26,fontWeight:800,color:C.gold}}>Portal de Afiliados</h1>
            <p style={{fontSize:13,color:C.mu,marginTop:8}}>Accede a tu panel personalizado</p>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:10,color:C.sa,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:6}}>Código</label>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="DAVID-SG o ADMIN" style={{...inp,fontSize:16,fontWeight:700,letterSpacing:2,textAlign:"center"}} onKeyDown={e=>e.key==="Enter"&&login()}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:10,color:C.sa,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:6}}>Contraseña</label>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" style={{...inp,fontSize:16,fontWeight:600,textAlign:"center"}} onKeyDown={e=>e.key==="Enter"&&login()}/>
          </div>
          {error&&<div style={{color:C.red,fontSize:12,marginBottom:14,padding:12,background:C.red+"10",borderRadius:12,textAlign:"center"}}>{error}</div>}
          <button className="bh" onClick={login} disabled={loading} style={{...btnP,width:"100%",padding:16,fontSize:16,borderRadius:14,opacity:loading?.6:1}}>{loading?"Cargando...":"Acceder →"}</button>
          <div style={{textAlign:"center",marginTop:20,fontSize:11,color:C.mu}}>¿Sin acceso? <a href="https://wa.me/34683105553" target="_blank" rel="noreferrer" style={{color:C.wa,textDecoration:"none",fontWeight:700}}>WhatsApp</a></div>
        </div>
      </div>
    </div>);
  }

  /* ═══ ADMIN ═══ */
  if(isAdmin){
    const tR=allAf.reduce((s,a)=>s+a.rs.length,0),tP=allAf.reduce((s,a)=>s+a.pg.reduce((p,x)=>p+x.m,0),0),tC=allAf.reduce((s,a)=>s+a.ca,0),tPe=allAf.reduce((s,a)=>s+a.rs.filter(r=>!r.p).length*gT(a.rs.length).com,0);
    const enRiesgo=allAf.filter(a=>{const t=gT(a.rs.length);return t.keep>0&&a.refsEsteMes<t.keep});
    return(<div style={{minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:DM}}><style>{css}</style>
      <header style={{background:C.card,padding:"0 28px",height:60,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><img src={LG} alt="" style={{height:32}} onError={e=>{e.target.style.display="none"}}/><div><span style={{fontSize:16,fontWeight:800,color:C.gold,fontFamily:PF}}>War Room</span><div style={{fontSize:9,color:C.mu,letterSpacing:1.5,fontWeight:600}}>ADMIN</div></div></div>
        <button onClick={logout} className="bh" style={{padding:"8px 18px",borderRadius:10,background:C.bg3,color:C.mu,cursor:"pointer",fontSize:12,fontWeight:600,border:"none"}}>Salir</button>
      </header>

      <div style={{display:"flex",gap:6,padding:"10px 28px",background:C.bg2,overflowX:"auto"}}>
        {[["ranking","⚔️ Ranking"],["codigos","🔗 Enlaces"],["pagos","💰 Pagos"],["alertas","🔔 Alertas"],["ajustes","⚙️ Ajustes"]].map(([id,l])=>(<button key={id} onClick={()=>{setAdminTab(id);setSelAf(null)}} className="bh" style={{padding:"8px 18px",borderRadius:10,background:adminTab===id?C.gold+"15":"transparent",color:adminTab===id?C.gold:C.mu,cursor:"pointer",fontSize:12,fontWeight:700,border:"none",whiteSpace:"nowrap"}}>{l}</button>))}
      </div>

      <main style={{padding:"20px 28px"}}>
        <div className="fu" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:20}}>
          {[[allAf.length,"Afiliados",C.gold],[tR,"Referidos",C.green],[tP+"€","Pagado",C.acc],[tPe+"€","Pendiente",C.sa],[tC.toLocaleString()+"€","Capital",C.pu]].map(([v,l,c],i)=><S key={i} v={v} l={l} c={c} s/>)}
        </div>

        {adminTab==="ranking"&&!selAf&&(<div className="fu s1" style={crd}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:16,fontWeight:800,fontFamily:PF,color:C.gold}}>⚔️ Ranking</div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setShowModal("addRef")} className="bh" style={{...btnP,padding:"8px 16px",fontSize:11,background:`linear-gradient(135deg,${C.green},${C.dg})`}}>+ Cerrar Cliente</button>
              <button onClick={()=>setShowModal("addUser")} className="bh" style={{...btnP,padding:"8px 16px",fontSize:11}}>+ Nuevo Afiliado</button>
            </div>
          </div>
          {ranking.map((a,r)=>{const t=gT(a.rs.length);const nt=gN(a.rs.length);const pend=a.rs.filter(x=>!x.p).length*t.com;const risk=t.keep>0&&a.refsEsteMes<t.keep;return(
            <div key={a.codigo} onClick={()=>setSelAf(a)} className="ch" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderRadius:14,marginBottom:6,background:risk?C.red+"08":r===0?C.gold+"08":C.bg2,cursor:"pointer",borderLeft:r===0?`3px solid ${C.gold}`:risk?`3px solid ${C.red}`:"3px solid transparent"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:18,width:28,textAlign:"center"}}>{r<3?["🥇","🥈","🥉"][r]:<span style={{fontSize:13,color:C.mu,fontWeight:800}}>{r+1}</span>}</span>
                <div><div style={{fontSize:14,fontWeight:700}}>{a.nombre}{risk&&<span style={{fontSize:10,color:C.red,marginLeft:8}}>⚠️</span>}</div><div style={{display:"flex",gap:6,alignItems:"center",marginTop:4}}><B tier={t} sz="sm"/>{nt&&<span style={{fontSize:9,color:C.mu}}>→ {nt.i} faltan {nt.min-a.rs.length}</span>}</div></div>
              </div>
              <div style={{textAlign:"right"}}><div style={{display:"flex",gap:10,alignItems:"center",justifyContent:"flex-end"}}><span style={{fontSize:15,fontWeight:800,color:C.gold}}>{a.rs.length}</span><span style={{fontSize:13,fontWeight:700,color:C.green}}>+{a.pg.reduce((s,p)=>s+p.m,0)}€</span></div><div style={{fontSize:10,color:C.mu,marginTop:2}}>{a.refsEsteMes||0}/mes · {t.com}€/ref{pend>0&&<span style={{color:C.sa}}> · {pend}€</span>}</div></div>
            </div>)})}
        </div>)}

        {adminTab==="ranking"&&selAf&&(()=>{const a=selAf;const t=gT(a.rs.length);const nt=gN(a.rs.length);return(
          <div className="fu">
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <button onClick={()=>{setSelAf(null);loadAf()}} className="bh" style={{padding:"8px 18px",borderRadius:10,background:C.bg3,color:C.mu,cursor:"pointer",fontSize:12,border:"none",fontWeight:600}}>← Volver</button>
              <button onClick={()=>deleteAfiliado(a)} className="bh" style={{padding:"8px 18px",borderRadius:10,background:C.red+"10",color:C.red,cursor:"pointer",fontSize:12,border:"none",fontWeight:600}}>🗑 Eliminar</button>
            </div>
            <div style={{...crd,background:`linear-gradient(135deg,${C.bg3},${t.c}08)`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
                <div><div style={{fontSize:20,fontWeight:800,fontFamily:PF}}>{a.nombre}</div><div style={{display:"flex",gap:10,alignItems:"center",marginTop:8}}><B tier={t}/><span style={{fontSize:12,color:C.mu}}>{a.codigo}</span></div><div style={{fontSize:11,color:C.mu,marginTop:8}}>Comisión: <strong style={{color:t.c}}>{t.com}€/ref</strong> · PW: <strong style={{color:C.sa}}>{a.password}</strong></div>{nt&&<div style={{fontSize:11,color:nt.c,marginTop:4}}>→ {nt.i} {nt.n} (faltan {nt.min-a.rs.length})</div>}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>{[[a.rs.length,"Refs",C.gold],[a.pg.reduce((s,p)=>s+p.m,0)+"€","Pagado",C.green],[a.refsEsteMes||0,"Mes",C.bl]].map(([v,l,c],i)=>(<div key={i} style={{textAlign:"center",padding:10,borderRadius:10,background:C.bg}}><div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:8,color:C.mu}}>{l}</div></div>))}</div>
              </div>
            </div>
            <div style={crd}><div style={{fontSize:13,fontWeight:700,fontFamily:PF,marginBottom:12,color:C.gold}}>Referidos ({a.rs.length})</div>
              {a.rs.length===0?<div style={{textAlign:"center",padding:20,color:C.mu}}>Sin referidos</div>:a.rs.map((r,i)=>(
                <Row key={i}><div><span style={{fontSize:12,fontWeight:600}}>{r.n}</span><span style={{fontSize:10,color:C.mu,marginLeft:8}}>{r.fecha}</span></div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:11,color:C.mu}}>{r.k.toLocaleString()}€</span><span style={{fontSize:12,fontWeight:800,color:C.green}}>→ {r.comision}€</span>
                {r.p?<span style={{fontSize:11,color:C.green,fontWeight:700}}>✅</span>:<button onClick={e=>{e.stopPropagation();markPaid(a,r)}} className="bh" style={{padding:"5px 12px",borderRadius:8,border:"none",background:C.gold+"15",color:C.gold,cursor:"pointer",fontSize:11,fontWeight:700}}>💰 Pagar</button>}</div></Row>))}
            </div>
            <div style={crd}><div style={{fontSize:13,fontWeight:700,fontFamily:PF,marginBottom:10,color:C.wa}}>🔗 Enlace</div><div style={{padding:12,borderRadius:10,background:C.bg2,fontSize:11,wordBreak:"break-all",color:C.mu,marginBottom:10}}>{waLink(a.nombre,a.codigo)}</div><div style={{display:"flex",gap:8}}><button onClick={()=>copy(waLink(a.nombre,a.codigo),a.codigo+"-l")} className="bh" style={{flex:1,padding:10,borderRadius:10,border:"none",background:C.wa+"12",color:C.wa,cursor:"pointer",fontSize:12,fontWeight:700}}>{copied===a.codigo+"-l"?"✅":"📋 Copiar"}</button><a href={waLink(a.nombre,a.codigo)} target="_blank" rel="noreferrer" className="bh" style={{flex:1,padding:10,borderRadius:10,background:C.wa+"12",color:C.wa,textAlign:"center",textDecoration:"none",fontSize:12,fontWeight:700,display:"block"}}>📱 WA</a></div></div>
          </div>)})()}

        {adminTab==="codigos"&&(<div className="fu s1" style={crd}><div style={{fontSize:16,fontWeight:800,fontFamily:PF,marginBottom:16,color:C.gold}}>🔗 Enlaces</div>{allAf.map(a=>{const t=gT(a.rs.length);return(<Row key={a.codigo}><div style={{display:"flex",alignItems:"center",gap:10}}><B tier={t} sz="sm"/><span style={{fontSize:13,fontWeight:700}}>{a.nombre}</span></div><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontWeight:800,color:C.gold,fontSize:12}}>{a.codigo}</span><button onClick={()=>copy(waLink(a.nombre,a.codigo),a.codigo+"-w")} className="bh" style={{padding:"5px 10px",borderRadius:8,background:C.wa+"12",color:C.wa,cursor:"pointer",fontSize:11,border:"none",fontWeight:700}}>{copied===a.codigo+"-w"?"✅":"📱"}</button><a href={waLink(a.nombre,a.codigo)} target="_blank" rel="noreferrer" style={{padding:"5px 10px",borderRadius:8,background:C.wa+"08",color:C.wa,fontSize:11,textDecoration:"none",fontWeight:700}}>↗</a></div></Row>)})}</div>)}

        {adminTab==="pagos"&&(<div className="fu s1" style={crd}><div style={{fontSize:16,fontWeight:800,fontFamily:PF,marginBottom:16,color:C.gold}}>💰 Comisiones</div>{allAf.map(a=>{const t=gT(a.rs.length);const pg=a.pg.reduce((s,p)=>s+p.m,0);const pn=a.rs.filter(r=>!r.p).length*t.com;return(<Row key={a.codigo} style={{padding:"14px 16px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:13,fontWeight:700}}>{a.nombre}</span><B tier={t} sz="sm"/></div><div style={{display:"flex",gap:16,alignItems:"center",fontSize:12}}><span style={{color:C.green,fontWeight:700}}>✅ {pg}€</span>{pn>0&&<span style={{color:C.gold,fontWeight:700}}>⏳ {pn}€</span>}<span style={{color:t.c,fontWeight:800}}>{t.com}€/ref</span></div></Row>)})}<div style={{marginTop:14,padding:16,borderRadius:14,background:C.gold+"0c",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:14,fontWeight:700,color:C.gold}}>Total pendiente</span><span style={{fontSize:20,fontWeight:800,color:C.gold,fontFamily:PF}}>{tPe}€</span></div></div>)}

        {adminTab==="alertas"&&(<div className="fu s1">
          <div style={crd}><div style={{fontSize:16,fontWeight:800,fontFamily:PF,marginBottom:16,color:C.sa}}>⏳ Pagos Pendientes</div>
            {allAf.flatMap(a=>a.rs.filter(r=>!r.p).map(r=>({af:a,ref:r}))).length===0?<div style={{textAlign:"center",padding:20,color:C.green,fontSize:13}}>✅ Todo pagado</div>:allAf.flatMap(a=>a.rs.filter(r=>!r.p).map(r=>({af:a,ref:r}))).map((it,i)=>(<Row key={i}><div><span style={{fontSize:12,fontWeight:700}}>{it.af.nombre}</span><span style={{fontSize:11,color:C.mu,marginLeft:8}}>→ {it.ref.n}</span></div><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:13,fontWeight:800,color:C.gold}}>{it.ref.comision}€</span><button onClick={()=>markPaid(it.af,it.ref)} className="bh" style={{padding:"6px 14px",borderRadius:8,border:"none",background:C.green+"15",color:C.green,cursor:"pointer",fontSize:11,fontWeight:700}}>✅ Pagar</button></div></Row>))}
          </div>
          <div style={crd}><div style={{fontSize:16,fontWeight:800,fontFamily:PF,marginBottom:16,color:C.red}}>⚠️ Riesgo Degradación</div>
            {enRiesgo.length===0?<div style={{textAlign:"center",padding:20,color:C.green,fontSize:13}}>Todos cumplen</div>:enRiesgo.map(a=>{const t=gT(a.rs.length);return(<Row key={a.codigo} style={{borderLeft:`3px solid ${C.red}`}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13,fontWeight:700}}>{a.nombre}</span><B tier={t} sz="sm"/></div><div style={{fontSize:11,color:C.red,fontWeight:700}}>{a.refsEsteMes}/{t.keep} refs</div></Row>)})}
          </div>
        </div>)}

        {adminTab==="ajustes"&&(<div className="fu s1">
          <div style={crd}><div style={{fontSize:16,fontWeight:800,fontFamily:PF,marginBottom:16,color:C.gold}}>⚙️ Fin de Mes</div><button onClick={resetMonth} className="bh" style={{width:"100%",padding:16,borderRadius:12,background:C.red+"10",color:C.red,cursor:"pointer",fontSize:14,fontWeight:700,border:"none",marginBottom:10}}>🔄 Resetear Mes y Degradar Tiers</button><div style={{fontSize:11,color:C.mu,padding:12,borderRadius:10,background:C.bg2}}>Resetea refs_este_mes a 0. Los que no cumplieron bajan 1 tier y reciben notificación.</div></div>
          <div style={crd}><div style={{fontSize:14,fontWeight:700,fontFamily:PF,marginBottom:12}}>🔑 Credenciales</div>{allAf.map(a=>(<Row key={a.codigo}><span style={{fontSize:12}}>{a.nombre}</span><div style={{display:"flex",gap:10}}><span style={{fontSize:11,color:C.gold,fontWeight:700}}>{a.codigo}</span><span style={{fontSize:11,color:C.mu}}>{a.password}</span></div></Row>))}<Row style={{background:C.gold+"08",marginTop:6}}><span style={{fontSize:12,fontWeight:700}}>ADMIN</span><span style={{fontSize:11,color:C.gold,fontWeight:700}}>{adminPw}</span></Row></div>
        </div>)}
      </main>

      {/* MODALS */}
      {showModal==="addUser"&&<Modal onClose={()=>setShowModal(null)}><div style={{fontSize:17,fontWeight:800,fontFamily:PF,marginBottom:20,color:C.gold}}>➕ Nuevo Afiliado</div>{[["Nombre","nombre","David López"],["Código","codigo","DAVID-SG"],["Contraseña","password","david2026"],["Capital €","capital_inicial","3000"]].map(([l,k,ph])=>(<div key={k} style={{marginBottom:12}}><label style={{fontSize:10,color:C.sa,fontWeight:700,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{l}</label><input value={newAf[k]} onChange={e=>setNewAf({...newAf,[k]:k==="codigo"?e.target.value.toUpperCase():e.target.value})} placeholder={ph} style={inp}/></div>))}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:8}}><button onClick={()=>setShowModal(null)} style={{padding:14,borderRadius:12,background:C.bg3,color:C.mu,cursor:"pointer",fontSize:13,border:"none"}}>Cancelar</button><button className="bh" onClick={addAfiliado} style={btnP}>✅ Crear</button></div></Modal>}

      {showModal==="addRef"&&<Modal onClose={()=>setShowModal(null)}><div style={{fontSize:17,fontWeight:800,fontFamily:PF,marginBottom:20,color:C.green}}>🎉 Registrar Cliente Cerrado</div>
        <div style={{marginBottom:12}}><label style={{fontSize:10,color:C.sa,fontWeight:700,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>Afiliado</label><select value={newRef.afiliado_id} onChange={e=>setNewRef({...newRef,afiliado_id:e.target.value})} style={{...inp,cursor:"pointer"}}><option value="">Seleccionar...</option>{allAf.map(a=><option key={a.id} value={a.id}>{a.nombre} ({a.codigo})</option>)}</select></div>
        {[["Nombre del cliente","nombre","Juan Pérez"],["Capital €","capital","2000"],["Fecha (YYYY-MM)","fecha","2026-04"]].map(([l,k,ph])=>(<div key={k} style={{marginBottom:12}}><label style={{fontSize:10,color:C.sa,fontWeight:700,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{l}</label><input value={newRef[k]} onChange={e=>setNewRef({...newRef,[k]:e.target.value})} placeholder={ph} style={inp}/></div>))}
        <div style={{padding:12,borderRadius:10,background:C.green+"08",marginBottom:14,fontSize:11,color:C.green}}>El afiliado recibirá una notificación automática del cierre.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><button onClick={()=>setShowModal(null)} style={{padding:14,borderRadius:12,background:C.bg3,color:C.mu,cursor:"pointer",fontSize:13,border:"none"}}>Cancelar</button><button className="bh" onClick={addReferido} style={{...btnP,background:`linear-gradient(135deg,${C.green},${C.dg})`}}>✅ Registrar</button></div>
      </Modal>}
    </div>);
  }

  /* ═══ USER ═══ */
  const tabs=[["h","🏠","Inicio"],["n","🏆","Niveles"],["r","👥","Referidos"],["p","💰","Pagos"],["i","📈","Inversión"],["f","⚙️","Perfil"]];
  return(<div style={{minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:DM}}><style>{css}</style>
    <header style={{background:C.card,padding:"0 24px",height:60,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}><img src={LG} alt="" style={{height:32}} onError={e=>{e.target.style.display="none"}}/><div><div style={{fontSize:15,fontWeight:800,color:C.gold,fontFamily:PF}}>Portal Afiliados</div><div style={{fontSize:10,color:C.mu,display:"flex",alignItems:"center",gap:6}}>{user.nombre} · <B tier={tier} sz="sm"/></div></div></div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>{notifs.length>0&&<span style={{background:C.red,color:"#fff",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:10}}>{notifs.length}</span>}<button onClick={logout} className="bh" style={{padding:"8px 18px",borderRadius:10,background:C.bg3,color:C.mu,cursor:"pointer",fontSize:12,fontWeight:600,border:"none"}}>Salir</button></div>
    </header>
    <nav style={{display:"flex",gap:0,padding:"0 16px",background:C.bg2,overflowX:"auto"}}>
      {tabs.map(([id,ic,label])=>(<button key={id} onClick={()=>setTab(id)} style={{padding:"12px 14px",border:"none",cursor:"pointer",fontSize:11,background:"transparent",color:tab===id?C.gold:C.mu,fontWeight:tab===id?800:500,borderBottom:`2px solid ${tab===id?C.gold:"transparent"}`,display:"flex",flexDirection:"column",alignItems:"center",gap:3,minWidth:52}}><span style={{fontSize:15}}>{ic}</span><span style={{fontSize:8,letterSpacing:.5}}>{label}</span></button>))}
    </nav>
    <main style={{padding:"20px 24px"}}>

      {/* Notifications banner */}
      {notifs.length>0&&tab==="h"&&<div className="fu" style={{...crd,background:C.gold+"0c",marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,fontFamily:PF,marginBottom:10,color:C.gold}}>🔔 Notificaciones</div>
        {notifs.map((n,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:10,marginBottom:4,background:C.bg2}}><span style={{fontSize:12}}>{n.msg}</span><button onClick={()=>clearNotif(i)} style={{padding:"3px 8px",borderRadius:6,background:C.bg3,color:C.mu,cursor:"pointer",fontSize:10,border:"none"}}>✕</button></div>))}
      </div>}

      {tab==="h"&&(<div>
        <div className="fu" style={{...crd,background:`linear-gradient(135deg,${C.bg3},${C.gold}08)`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
            <div><div style={{fontSize:10,color:C.sa,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>Bienvenido</div><div style={{fontFamily:PF,fontSize:24,fontWeight:800,marginTop:6}}>{user.nombre}</div><div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}><B tier={tier}/><span style={{fontSize:12,color:C.mu}}>{tier.com}€/ref</span></div>{tier.keep>0&&<div style={{fontSize:10,color:C.sa,marginTop:8}}>🔄 Mínimo {tier.keep} refs/mes · <span style={{color:refsEsteMes>=tier.keep?C.green:C.red,fontWeight:700}}>{refsEsteMes}/{tier.keep} {refsEsteMes>=tier.keep?"✅":"⚠️"}</span></div>}</div>
            <div style={{textAlign:"center",background:C.bg,borderRadius:16,padding:"14px 26px"}}><div style={{fontSize:9,color:C.mu,textTransform:"uppercase",letterSpacing:1.5}}>Pago en</div><div style={{fontSize:32,fontWeight:800,color:C.gold,fontFamily:PF,lineHeight:1,marginTop:4}}>{diasPago}</div><div style={{fontSize:9,color:C.mu}}>días</div></div>
          </div></div>
        <div className="fu s1" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10,marginBottom:14}}><S v={user.rs.length} l="Referidos" c={C.gold} s/><S v={totalGanado+"€"} l="Ganado" c={C.green} s/><S v={pendiente+"€"} l="Pendiente" c={C.sa} s/><S v={user.ca.toLocaleString()+"€"} l="Capital" c={C.pu} s/></div>
        <div className="fu s2" style={crd}><div style={{fontSize:14,fontWeight:800,color:C.gold,fontFamily:PF,marginBottom:8}}>🔗 Comparte y Gana {tier.com}€</div><div style={{fontSize:11,color:C.mu,marginBottom:12}}>Tu enlace envía un WhatsApp automático identificándote.</div><div style={{display:"flex",gap:8,alignItems:"center",background:C.bg2,borderRadius:12,padding:"10px 16px",marginBottom:12}}><div style={{fontSize:18,fontWeight:800,color:C.gold,letterSpacing:3,flex:1,textAlign:"center",fontFamily:PF}}>{user.codigo}</div><button onClick={()=>copy(user.codigo,"code")} className="bh" style={{padding:"8px 16px",borderRadius:10,border:"none",background:copied==="code"?C.green+"20":C.dg,color:copied==="code"?C.green:C.gold,cursor:"pointer",fontSize:12,fontWeight:700}}>{copied==="code"?"✅":"📋"}</button></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><a href={waLink(user.nombre,user.codigo)} target="_blank" rel="noreferrer" className="bh" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:12,borderRadius:12,background:C.wa+"15",color:C.wa,textDecoration:"none",fontSize:13,fontWeight:800}}>📱 WhatsApp</a><button onClick={()=>copy(waLink(user.nombre,user.codigo),"walink")} className="bh" style={{padding:12,borderRadius:12,background:C.bg3,color:C.sa,cursor:"pointer",fontSize:13,fontWeight:700,border:"none"}}>{copied==="walink"?"✅ Copiado":"🔗 Copiar"}</button></div></div>
        {user.rs.length>0&&<div className="fu s3" style={crd}><div style={{fontSize:13,fontWeight:700,fontFamily:PF,marginBottom:10}}>Últimos Referidos</div>{user.rs.slice(-3).reverse().map((r,i)=>(<Row key={i}><div><span style={{fontSize:12,fontWeight:600}}>{r.n}</span><span style={{fontSize:10,color:C.mu,marginLeft:8}}>{r.fecha}</span></div><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:13,fontWeight:800,color:C.green}}>+{r.comision}€</span><span style={{fontSize:11,color:r.p?C.green:C.gold}}>{r.p?"✅":"⏳"}</span></div></Row>))}</div>}
        {nextTier&&<div className="fu s3" style={{...crd,background:nextTier.c+"08"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:12,fontWeight:700}}>→ <span style={{color:nextTier.c}}>{nextTier.i} {nextTier.n}</span></span><span style={{fontSize:13,fontWeight:800,color:nextTier.c}}>+{nextTier.com-tier.com}€/ref</span></div><P cur={user.rs.length} tot={nextTier.min} cF={tier.c} cT={nextTier.c}/><div style={{fontSize:10,color:C.mu,marginTop:6,textAlign:"center"}}>{user.rs.length}/{nextTier.min} — faltan {nextTier.min-user.rs.length}</div></div>}
      </div>)}

      {tab==="n"&&(<div>
        <div className="fu" style={{fontSize:20,fontWeight:800,fontFamily:PF,marginBottom:16}}>🏆 Niveles</div>
        <div className="fu s1" style={crd}><div style={{display:"flex",position:"relative",alignItems:"center",padding:"8px 0"}}><div style={{position:"absolute",top:"50%",left:24,right:24,height:4,background:C.bg,zIndex:0,transform:"translateY(-50%)",borderRadius:2}}/><div style={{position:"absolute",top:"50%",left:24,height:4,background:`linear-gradient(90deg,${C.green},${C.gold})`,zIndex:1,transform:"translateY(-50%)",width:`${Math.min(100,(TIERS.findIndex(x=>x.n===tier.n)/(TIERS.length-1))*100)}%`,borderRadius:2}}/>{TIERS.map(t=>{const d=user.rs.length>=t.min,cur=t.n===tier.n;return(<div key={t.n} style={{flex:1,textAlign:"center",position:"relative",zIndex:2}}><div style={{width:cur?48:34,height:cur?48:34,borderRadius:"50%",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",fontSize:cur?20:14,background:d?t.c+"20":C.bg,border:`3px solid ${d?t.c:C.bg3}`,boxShadow:cur?`0 0 24px ${t.c}30`:"none",opacity:d?1:.3}}>{t.i}</div><div style={{marginTop:5,fontSize:cur?11:9,fontWeight:cur?800:600,color:d?t.c:C.mu}}>{t.n}</div><div style={{fontSize:8,color:C.mu}}>{t.com}€</div></div>)})}</div>{nextTier&&<div style={{padding:"12px 18px",background:nextTier.c+"08",borderRadius:"0 0 16px 16px",display:"flex",justifyContent:"space-between",marginTop:8}}><span style={{fontSize:12}}>→ <strong style={{color:nextTier.c}}>{nextTier.i} {nextTier.n}</strong> — faltan {nextTier.min-user.rs.length}</span><span style={{fontWeight:800,color:nextTier.c,fontSize:14}}>+{nextTier.com-tier.com}€</span></div>}</div>
        <div className="fu s2" style={crd}><div style={{fontSize:14,fontWeight:700,fontFamily:PF,marginBottom:12}}>💰 Comisiones</div>{TIERS.map(t=>{const cur=t.n===tier.n;return(<Row key={t.n} style={{background:cur?t.c+"10":C.bg2,borderLeft:cur?`3px solid ${t.c}`:"3px solid transparent"}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>{t.i}</span><div><div style={{fontSize:13,fontWeight:700,color:cur?t.c:C.tx}}>{t.n}{cur?" ← TÚ":""}</div><div style={{fontSize:10,color:C.mu}}>{t.min}+ refs · {t.desc}</div></div></div><span style={{fontSize:20,fontWeight:800,color:cur?t.c:C.tx,fontFamily:PF}}>{t.com}€</span></Row>)})}</div>
        {tier.keep>0&&<div className="fu s3" style={{...crd,background:refsEsteMes>=tier.keep?C.green+"08":C.red+"08"}}><div style={{fontSize:13,fontWeight:700,fontFamily:PF,marginBottom:8}}>{refsEsteMes>=tier.keep?"✅ Nivel Asegurado":"⚠️ Mantén tu Nivel"}</div><div style={{fontSize:12,color:C.mu,marginBottom:10}}>Necesitas <strong style={{color:tier.c}}>{tier.keep} refs/mes</strong>.{refsEsteMes<tier.keep?` Faltan ${tier.keep-refsEsteMes}.`:" ¡Bien!"}</div><P cur={refsEsteMes} tot={tier.keep} cF={refsEsteMes>=tier.keep?C.green:C.red} cT={tier.c} h={8}/></div>}
        <div className="fu s3" style={crd}><div style={{fontSize:14,fontWeight:700,fontFamily:PF,marginBottom:12}}>🎁 Bonos</div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>{bonos.map((b,i)=>{const e=refsEsteMes>=b.refs;return(<div key={i} style={{padding:16,borderRadius:14,background:e?b.color+"15":C.bg2,textAlign:"center",opacity:e?1:.4}}><div style={{fontSize:28}}>{b.icon}</div><div style={{fontSize:22,fontWeight:800,color:b.color,fontFamily:PF,marginTop:4}}>+{b.amount}€</div><div style={{fontSize:10,color:C.mu,marginTop:3}}>{b.refs} refs/mes</div>{e&&<div style={{fontSize:9,color:C.green,fontWeight:700,marginTop:6}}>✅ GANADO</div>}</div>)})}</div></div>
      </div>)}

      {tab==="r"&&(<div>
        <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontSize:20,fontWeight:800,fontFamily:PF}}>👥 Referidos</span><B tier={tier}/></div>
        {nextTier&&<div className="fu s1" style={{...crd,padding:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:12}}><span>→ {nextTier.i} {nextTier.n}</span><span style={{color:nextTier.c,fontWeight:800}}>{user.rs.length}/{nextTier.min}</span></div><P cur={user.rs.length} tot={nextTier.min} cF={tier.c} cT={nextTier.c} h={8}/></div>}
        <div className="fu s2" style={crd}>{user.rs.length===0?<div style={{textAlign:"center",padding:28}}><div style={{fontSize:36,marginBottom:10}}>🚀</div><div style={{fontSize:14,fontWeight:700}}>¡Empieza a referir!</div></div>:user.rs.map((r,i)=>(<Row key={i}><div><span style={{fontSize:13,fontWeight:600}}>{r.n}</span><span style={{fontSize:10,color:C.mu,marginLeft:8}}>{r.fecha}</span></div><div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:11,color:C.mu}}>{r.k.toLocaleString()}€</span><span style={{fontSize:13,fontWeight:800,color:C.green}}>+{r.comision}€</span><span style={{fontSize:12,color:r.p?C.green:C.gold}}>{r.p?"✅":"⏳"}</span></div></Row>))}</div>
        <div className="fu s3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}><S v={totalGanado+"€"} l="Cobrado" c={C.green} s/><S v={pendiente+"€"} l="Pendiente" c={C.gold} s/><S v="Día 20" l="Pago" c={C.sa} s/></div>
      </div>)}

      {tab==="p"&&(<div>
        <div className="fu" style={{fontSize:20,fontWeight:800,fontFamily:PF,marginBottom:16}}>💰 Pagos</div>
        <div className="fu s1" style={crd}>{user.pg.length===0?<div style={{textAlign:"center",padding:24,color:C.mu}}>Sin pagos</div>:user.pg.map((p,i)=>(<Row key={i}><div><span style={{fontSize:13,fontWeight:600}}>{p.r}</span><span style={{fontSize:10,color:C.mu,marginLeft:8}}>{p.fecha}</span></div><span style={{fontSize:15,fontWeight:800,color:C.green}}>+{p.m}€ ✅</span></Row>))}{pendiente>0&&<div style={{padding:14,borderRadius:12,background:C.gold+"0c",marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:C.gold,fontWeight:600}}>Próximo · Día 20</span><span style={{fontSize:18,fontWeight:800,color:C.gold,fontFamily:PF}}>{pendiente}€</span></div>}</div>
        <div className="fu s2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><S v={totalGanado+"€"} l="Cobrado" c={C.green}/><S v={(totalGanado+pendiente)+"€"} l="Generado" c={C.gold}/></div>
      </div>)}

      {tab==="i"&&(<div>
        <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontSize:20,fontWeight:800,fontFamily:PF}}>📈 Inversión</span><button onClick={()=>setShowModal("month")} className="bh" style={{...btnP,fontSize:12}}>+ Registrar</button></div>
        <div className="fu s1" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10,marginBottom:14}}><S v={user.ca.toLocaleString()+"€"} l="Capital" c={C.gold} s/><S v={"+"+ganInv+"€"} l="Ganancia" c={C.green} s/><S v={rentAcum+"%"} l="Rent." c={C.pu} s/><S v={"+"+mejorMes.r+"%"} l={mejorMes.ms} c={C.sa} s/></div>
        {rentData.length>0&&<div><div className="fu s2"><CapChart data={rentData}/></div><div className="fu s3" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><RChart data={rentData}/><div style={crd}><div style={{fontSize:12,fontWeight:700,fontFamily:PF,marginBottom:10,color:C.pu}}>📋 Historial</div>{[...rentData].reverse().map((r,i)=>(<Row key={i}><span style={{fontSize:11,fontWeight:600}}>{r.ms}</span><div style={{display:"flex",gap:10}}><span style={{fontSize:11,color:C.mu}}>{r.c.toLocaleString()}€</span><span style={{fontSize:12,fontWeight:800,color:r.r>=0?C.green:C.red}}>{r.r>=0?"+":""}{r.r}%</span></div></Row>))}</div></div></div>}
      </div>)}

      {tab==="f"&&(<div>
        <div className="fu" style={{fontSize:20,fontWeight:800,fontFamily:PF,marginBottom:16}}>⚙️ Perfil</div>
        <div className="fu s1" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={crd}><div style={{fontSize:18,fontWeight:800,fontFamily:PF,marginBottom:10}}>{user.nombre}</div><B tier={tier}/><div style={{fontSize:12,color:C.mu,marginTop:10}}>{tier.com}€/ref</div><div style={{padding:"8px 10px",borderRadius:8,background:C.bg2,marginTop:10,fontSize:12}}><span style={{color:C.gold,fontWeight:800}}>{user.codigo}</span></div>{nextTier&&<div style={{fontSize:11,color:C.mu,marginTop:10}}>→ {nextTier.i} faltan {nextTier.min-user.rs.length}</div>}</div>
          <div style={crd}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[[user.rs.length,"Refs",C.gold],[totalGanado+"€","Ganado",C.green],[rentAcum+"%","Rent.",C.pu],[user.pg.length,"Pagos",C.sa]].map(([v,l,c],i)=>(<div key={i} style={{textAlign:"center",padding:12,borderRadius:12,background:C.bg}}><div style={{fontSize:20,fontWeight:800,color:c,fontFamily:PF}}>{v}</div><div style={{fontSize:8,color:C.mu,textTransform:"uppercase",letterSpacing:1}}>{l}</div></div>))}</div></div>
        </div>
        <div className="fu s2" style={crd}><div style={{fontSize:13,fontWeight:700,fontFamily:PF,marginBottom:10,color:C.wa}}>📱 Tu Enlace</div><div style={{padding:12,borderRadius:10,background:C.bg2,fontSize:11,wordBreak:"break-all",color:C.mu,marginBottom:10,lineHeight:1.6}}>{waLink(user.nombre,user.codigo)}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><a href={waLink(user.nombre,user.codigo)} target="_blank" rel="noreferrer" className="bh" style={{display:"block",padding:12,borderRadius:10,background:C.wa+"15",color:C.wa,textAlign:"center",textDecoration:"none",fontSize:13,fontWeight:700}}>📱 WA</a><button onClick={()=>copy(waLink(user.nombre,user.codigo),"pf")} className="bh" style={{padding:12,borderRadius:10,background:C.bg3,color:C.sa,cursor:"pointer",fontSize:13,fontWeight:700,border:"none"}}>{copied==="pf"?"✅":"🔗 Copiar"}</button></div></div>
        <div className="fu s3" style={{...crd,background:C.bg3}}><div style={{fontSize:12,display:"flex",justifyContent:"space-between"}}><span>💬 ¿Ayuda?</span><a href="https://wa.me/34683105553" target="_blank" rel="noreferrer" style={{color:C.wa,textDecoration:"none",fontWeight:700}}>+34 683 105 553</a></div></div>
      </div>)}
    </main>

    {showModal==="month"&&<Modal onClose={()=>setShowModal(null)}><div style={{fontSize:17,fontWeight:800,fontFamily:PF,marginBottom:20,color:C.gold}}>📊 Registrar Mes</div>{[["Mes","m","Abr 26"],["Rent %","r","5.2"],["Capital €","c","4500"]].map(([l,k,ph])=>(<div key={k} style={{marginBottom:12}}><label style={{fontSize:10,color:C.sa,fontWeight:700,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{l}</label><input type={k==="m"?"text":"number"} step="0.1" value={newMonth[k]} onChange={e=>setNewMonth({...newMonth,[k]:e.target.value})} placeholder={ph} style={inp}/></div>))}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:8}}><button onClick={()=>setShowModal(null)} style={{padding:14,borderRadius:12,background:C.bg3,color:C.mu,cursor:"pointer",fontSize:13,border:"none"}}>Cancelar</button><button className="bh" onClick={saveMonth} style={btnP}>✅ Guardar</button></div></Modal>}
  </div>);
}