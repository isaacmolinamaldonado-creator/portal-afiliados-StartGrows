import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

/* ═══════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════ */
const C = {
  gold: "#D4AF37", green: "#10b981", deepGreen: "#0D4D3D",
  muted: "#7a8f82", bg: "#060d0a", bg2: "#0a1610", card: "#0c1a14",
  border: "rgba(212,175,55,0.12)", red: "#ef4444", purple: "#8b5cf6",
  blue: "#3b82f6", pink: "#ec4899", sand: "#B8956A", text: "#e8ede9",
  wa: "#25D366",
};
const PF = "'Playfair Display',serif";
const DM = "'DM Sans',sans-serif";
const LOGO = "https://startgrows.es/wp-content/uploads/2025/08/LOGO-2.png";

/* ═══════════════════════════════════════════
   TIER SYSTEM (con mantenimiento mensual)
   Para SUBIR: acumular X refs totales
   Para MANTENERSE: cerrar mínimo Y refs/mes
   Si no cumples → bajas 1 tier
   ═══════════════════════════════════════════ */
const TIERS = [
  { n: "Bronce",   i: "🥉", min: 0,  max: 2,  com: 80,  c: "#CD7F32", keep: 0, desc: "Inicio" },
  { n: "Plata",    i: "🥈", min: 3,  max: 4,  com: 85,  c: "#C0C0C0", keep: 1, desc: "1 ref/mes para mantener" },
  { n: "Oro",      i: "🥇", min: 5,  max: 7,  com: 90,  c: "#FFD700", keep: 2, desc: "2 refs/mes para mantener" },
  { n: "Diamante", i: "💎", min: 8,  max: 11, com: 95,  c: "#b9f2ff", keep: 3, desc: "3 refs/mes para mantener" },
  { n: "Élite",    i: "👑", min: 12, max: 999,com: 100, c: C.gold,    keep: 4, desc: "4 refs/mes para mantener" },
];

const BONOS = [
  { refs: 3, amount: 50,  icon: "⚡", label: "Bono Plata",   color: C.blue },
  { refs: 6, amount: 100, icon: "🔥", label: "Bono Oro",     color: C.pink },
  { refs: 10, amount: 150, icon: "💎", label: "Bono Élite",   color: C.purple },
];

const getTier = (totalRefs) => TIERS.find(t => totalRefs >= t.min && totalRefs <= t.max) || TIERS[0];
const getNextTier = (totalRefs) => {
  const idx = TIERS.findIndex(t => totalRefs >= t.min && totalRefs <= t.max);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
};

const waLink = (nombre, codigo) => {
  const msgs = [
    `¡Hola! 👋 Soy referido de *${nombre}* (código: ${codigo}). Me interesa saber más sobre StartGrows y cómo puedo empezar a invertir con copy trading.`,
    `¡Buenas! Me ha recomendado *${nombre}* (${codigo}). Quiero información sobre cómo funciona StartGrows y los rendimientos del copy trading.`,
    `Hola, vengo de parte de *${nombre}* (ref: ${codigo}). Me gustaría conocer más sobre StartGrows y cómo puedo hacer crecer mi capital.`,
  ];
  const idx = codigo.split("").reduce((s, ch) => s + ch.charCodeAt(0), 0) % msgs.length;
  return `https://wa.me/34683105553?text=${encodeURIComponent(msgs[idx])}`;
};

/* ═══════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════ */
const AFILIADOS = [
  {
    nombre: "David Lorenz", codigo: "DAVID-SG", ci: 3603, ca: 4359, refsEsteMes: 2,
    rs: [
      { n: "Ana Martínez", k: 1500, p: 1, fecha: "2025-10" },
      { n: "Pedro Sánchez", k: 2000, p: 1, fecha: "2025-10" },
      { n: "Lucía F.", k: 800, p: 1, fecha: "2025-11" },
      { n: "Miguel Torres", k: 1200, p: 0, fecha: "2025-12" },
      { n: "Sara Jiménez", k: 900, p: 0, fecha: "2026-01" },
    ],
    pg: [{ m: 80, r: "Ana Martínez", fecha: "2025-11" }, { m: 80, r: "Pedro Sánchez", fecha: "2025-11" }, { m: 80, r: "Lucía F.", fecha: "2025-12" }],
    rt: [{ ms: "Oct", r: 4.2, c: 3603 }, { ms: "Nov", r: 6.8, c: 3848 }, { ms: "Dic", r: -1.2, c: 3802 }, { ms: "Ene", r: 5.5, c: 4011 }, { ms: "Feb", r: 3.1, c: 4135 }, { ms: "Mar", r: 5.4, c: 4359 }],
  },
  {
    nombre: "Close Nico", codigo: "NICO-SG", ci: 2500, ca: 2780, refsEsteMes: 1,
    rs: [{ n: "Laura Gómez", k: 2000, p: 1, fecha: "2025-12" }, { n: "Marcos Díaz", k: 1500, p: 1, fecha: "2026-01" }, { n: "Elena Vidal", k: 800, p: 1, fecha: "2026-02" }],
    pg: [{ m: 80, r: "Laura Gómez", fecha: "2026-01" }, { m: 80, r: "Marcos Díaz", fecha: "2026-02" }, { m: 85, r: "Elena Vidal", fecha: "2026-03" }],
    rt: [{ ms: "Dic", r: 2.1, c: 2553 }, { ms: "Ene", r: 4.5, c: 2668 }, { ms: "Feb", r: 1.8, c: 2716 }, { ms: "Mar", r: 2.4, c: 2780 }],
  },
  {
    nombre: "Judith B.", codigo: "JUDITH-SG", ci: 1200, ca: 1490, refsEsteMes: 0,
    rs: [{ n: "Carlos Ruiz", k: 1000, p: 1, fecha: "2026-01" }],
    pg: [{ m: 80, r: "Carlos Ruiz", fecha: "2026-02" }],
    rt: [{ ms: "Ene", r: 3.2, c: 1238 }, { ms: "Feb", r: 4.1, c: 1289 }, { ms: "Mar", r: 5.6, c: 1490 }],
  },
  {
    nombre: "Carlos García", codigo: "CARLOS-SG", ci: 2000, ca: 2640, refsEsteMes: 3,
    rs: [{ n: "Isabel Moreno", k: 1800, p: 1, fecha: "2026-01" }],
    pg: [{ m: 80, r: "Isabel M.", fecha: "2026-02" }],
    rt: [{ ms: "Ene", r: 6.1, c: 2122 }, { ms: "Feb", r: 8.2, c: 2296 }, { ms: "Mar", r: 5.0, c: 2640 }],
  },
  {
    nombre: "Josep Reig", codigo: "JOSEP-SG", ci: 5000, ca: 5850, refsEsteMes: 0,
    rs: [], pg: [],
    rt: [{ ms: "Ene", r: 3.8, c: 5190 }, { ms: "Feb", r: 4.2, c: 5408 }, { ms: "Mar", r: 3.1, c: 5850 }],
  },
];

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const cardStyle = {
  background: `linear-gradient(145deg,${C.card},${C.bg2})`,
  border: `1px solid ${C.border}`, borderRadius: 16,
  padding: 18, marginBottom: 12, overflow: "hidden",
};
const inputStyle = {
  width: "100%", padding: 12, borderRadius: 10,
  border: `1px solid ${C.border}`, background: C.bg,
  color: C.text, fontSize: 14, boxSizing: "border-box",
};

/* ═══════════════════════════════════════════
   CHART COMPONENTS
   ═══════════════════════════════════════════ */
function CapitalChart({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 11, fontWeight: 700, fontFamily: PF, marginBottom: 8, color: C.gold }}>📈 Evolución de Capital</div>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.gold} stopOpacity={0.25} />
              <stop offset="100%" stopColor={C.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="ms" tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, color: C.text }} />
          <Area type="monotone" dataKey="c" stroke={C.gold} fill="url(#cg)" strokeWidth={2.5} dot={{ r: 3, fill: C.gold, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function RentChart({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 11, fontWeight: 700, fontFamily: PF, marginBottom: 8, color: C.green }}>📊 Rentabilidad</div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data}>
          <XAxis dataKey="ms" tick={{ fill: C.muted, fontSize: 8 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 8 }} axisLine={false} tickLine={false} />
          <Bar dataKey="r" radius={[4, 4, 0, 0]}>
            {data.map((e, i) => <Cell key={i} fill={e.r >= 0 ? C.green : C.red} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MINI COMPONENTS
   ═══════════════════════════════════════════ */
function Stat({ value, label, color, small }) {
  return (
    <div style={{ ...cardStyle, textAlign: "center", padding: small ? 10 : 14, marginBottom: 0 }}>
      <div style={{ fontSize: small ? 16 : 20, fontWeight: 800, color, fontFamily: PF }}>{value}</div>
      <div style={{ fontSize: small ? 7 : 8, color: C.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

function Badge({ tier, size = "md" }) {
  const s = size === "sm" ? { fontSize: 9, padding: "2px 8px" } : { fontSize: 11, padding: "4px 12px" };
  return (
    <span style={{ ...s, borderRadius: 6, background: tier.c + "15", color: tier.c, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 3, border: `1px solid ${tier.c}25` }}>
      {tier.i} {tier.n}
    </span>
  );
}

function Progress({ current, total, colorFrom, colorTo, height = 6 }) {
  const pct = Math.min(100, (current / Math.max(total, 1)) * 100);
  return (
    <div style={{ height, borderRadius: height, background: C.deepGreen + "30", overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", borderRadius: height, background: `linear-gradient(90deg,${colorFrom},${colorTo})`, width: `${pct}%`, transition: "width 0.6s ease" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("h");
  const [copied, setCopied] = useState("");
  const [rentData, setRentData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMonth, setNewMonth] = useState({ m: "", r: "", c: "" });
  const [selAf, setSelAf] = useState(null);
  const [adminTab, setAdminTab] = useState("ranking");
  const [anim, setAnim] = useState(false);

  useEffect(() => { setAnim(true); }, []);

  const copy = (text, label) => {
    try { navigator.clipboard.writeText(text); } catch (e) {}
    setCopied(label); setTimeout(() => setCopied(""), 2500);
  };

  const login = () => {
    setError("");
    const t = code.trim();
    if (t === "SGADMIN2026") { setIsAdmin(true); return; }
    const f = AFILIADOS.find(a => a.codigo.toLowerCase() === t.toLowerCase());
    if (f) { setUser(f); setRentData(f.rt); return; }
    setError("Código no válido. Contacta con StartGrows si necesitas tu código.");
  };

  const logout = () => { setUser(null); setIsAdmin(false); setTab("h"); setSelAf(null); setCode(""); };

  const tier = user ? getTier(user.rs.length) : TIERS[0];
  const nextTier = user ? getNextTier(user.rs.length) : null;
  const totalGanado = user ? user.pg.reduce((s, p) => s + p.m, 0) : 0;
  const pendiente = user ? user.rs.filter(r => !r.p).length * tier.com : 0;
  const ganInv = user ? user.ca - user.ci : 0;
  const now = new Date();
  const np = new Date(now.getFullYear(), now.getMonth(), 20);
  if (now.getDate() > 20) np.setMonth(np.getMonth() + 1);
  const diasPago = Math.ceil((np - now) / 864e5);
  const rentAcum = rentData.reduce((s, r) => s + r.r, 0).toFixed(1);
  const mejorMes = rentData.length ? rentData.reduce((b, r) => r.r > b.r ? r : b, rentData[0]) : { r: 0, ms: "-" };
  const refsEsteMes = user ? (user.refsEsteMes || 0) : 0;
  const bonosGanados = BONOS.filter(b => refsEsteMes >= b.refs);
  const totalBonos = bonosGanados.reduce((s, b) => s + b.amount, 0);
  const ranking = [...AFILIADOS].sort((a, b) => b.rs.length - a.rs.length);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:${DM};background:${C.bg}}
    ::placeholder{color:${C.muted}}input:focus{outline:none;border-color:${C.gold}50!important;box-shadow:0 0 0 3px ${C.gold}10}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.gold}20;border-radius:4px}
    @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    .fu{animation:fu .5s ease forwards}.s1{animation-delay:.05s;opacity:0}.s2{animation-delay:.1s;opacity:0}.s3{animation-delay:.15s;opacity:0}.s4{animation-delay:.2s;opacity:0}
    .bh{transition:all .2s}.bh:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(212,175,55,.15)}.bh:active{transform:translateY(0)}
    .ch{transition:all .2s}.ch:hover{border-color:${C.gold}30!important;transform:translateY(-1px)}
  `;

  /* ═══ LOGIN ═══ */
  if (!user && !isAdmin) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: DM }}>
        <style>{css}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20 }}>
          <div className={anim ? "fu" : ""} style={{ width: "100%", maxWidth: 380, background: `linear-gradient(150deg,${C.card},${C.bg2})`, border: `1px solid ${C.border}`, borderRadius: 24, padding: "44px 32px", boxShadow: "0 40px 80px rgba(0,0,0,.6)" }}>
            <div style={{ height: 3, borderRadius: 2, background: `linear-gradient(90deg,transparent,${C.gold},transparent)`, marginBottom: 32 }} />
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <img src={LOGO} alt="" style={{ height: 52, marginBottom: 16 }} onError={e => { e.target.style.display = "none"; }} />
              <h1 style={{ fontFamily: PF, fontSize: 24, fontWeight: 800, color: C.gold, letterSpacing: -0.5 }}>Portal de Afiliados</h1>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Ingresa tu código de afiliado para acceder</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 9, color: C.sand, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Código de acceso</label>
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Ej: DAVID-SG" style={{ ...inputStyle, fontSize: 16, fontWeight: 700, letterSpacing: 2, textAlign: "center", padding: 16, borderRadius: 12 }} onKeyDown={e => e.key === "Enter" && login()} />
            </div>
            {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12, padding: 10, background: C.red + "0c", borderRadius: 10, textAlign: "center", border: `1px solid ${C.red}15` }}>{error}</div>}
            <button className="bh" onClick={login} style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.deepGreen},#0a6b50)`, color: C.gold, fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 8px 24px rgba(13,77,61,.4)" }}>Acceder al Portal →</button>
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: C.muted }}>
              ¿No tienes código? <a href="https://wa.me/34683105553" target="_blank" rel="noreferrer" style={{ color: C.wa, textDecoration: "none", fontWeight: 700 }}>Contacta por WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══ ADMIN ═══ */
  if (isAdmin) {
    const tRefs = AFILIADOS.reduce((s, a) => s + a.rs.length, 0);
    const tPagado = AFILIADOS.reduce((s, a) => s + a.pg.reduce((p, x) => p + x.m, 0), 0);
    const tCap = AFILIADOS.reduce((s, a) => s + a.ca, 0);
    const tPend = AFILIADOS.reduce((s, a) => s + a.rs.filter(r => !r.p).length * getTier(a.rs.length).com, 0);

    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: DM }}>
        <style>{css}</style>
        <header style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: 56, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={LOGO} alt="" style={{ height: 30 }} onError={e => { e.target.style.display = "none"; }} />
            <div><span style={{ fontSize: 15, fontWeight: 800, color: C.gold, fontFamily: PF }}>War Room</span><div style={{ fontSize: 8, color: C.muted, letterSpacing: 1 }}>PANEL ADMINISTRATIVO</div></div>
          </div>
          <button onClick={logout} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Salir</button>
        </header>

        <div style={{ display: "flex", gap: 4, padding: "8px 20px", background: C.bg2, borderBottom: `1px solid ${C.border}` }}>
          {[["ranking", "⚔️ Ranking"], ["codigos", "🔗 Enlaces"], ["pagos", "💰 Pagos"]].map(([id, l]) => (
            <button key={id} onClick={() => { setAdminTab(id); setSelAf(null); }} className="bh" style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${adminTab === id ? C.gold + "40" : C.border}`, background: adminTab === id ? C.gold + "0c" : "transparent", color: adminTab === id ? C.gold : C.muted, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{l}</button>
          ))}
        </div>

        <main style={{ padding: "16px 20px", maxWidth: 1100, margin: "0 auto" }}>
          <div className="fu" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 16 }}>
            {[[AFILIADOS.length, "Afiliados", C.gold], [tRefs, "Referidos", C.green], [tPagado + "€", "Pagado", C.green], [tPend + "€", "Pendiente", C.sand], [tCap.toLocaleString() + "€", "Capital", C.purple]].map(([v, l, c], i) => (
              <Stat key={i} value={v} label={l} color={c} small />
            ))}
          </div>

          {adminTab === "ranking" && !selAf && (
            <div className="fu s1" style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: PF, color: C.gold }}>⚔️ Ranking de Afiliados</div>
                <div style={{ fontSize: 9, color: C.muted }}>Click para detalle</div>
              </div>
              {ranking.map((a, r) => {
                const t = getTier(a.rs.length);
                const nt = getNextTier(a.rs.length);
                const pend = a.rs.filter(x => !x.p).length * t.com;
                return (
                  <div key={a.codigo} onClick={() => setSelAf(a)} className="ch" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, marginBottom: 4, border: `1px solid ${r === 0 ? C.gold + "30" : C.border}`, background: r === 0 ? C.gold + "06" : C.bg2, cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{r < 3 ? ["🥇", "🥈", "🥉"][r] : <span style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>{r + 1}</span>}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{a.nombre}</div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3 }}>
                          <Badge tier={t} size="sm" />
                          {nt && <span style={{ fontSize: 8, color: C.muted }}>→ {nt.i} faltan {nt.min - a.rs.length}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: C.gold }}>{a.rs.length} <span style={{ fontSize: 9, fontWeight: 500 }}>refs</span></span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>+{a.pg.reduce((s, p) => s + p.m, 0)}€</span>
                      </div>
                      <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{a.refsEsteMes || 0} este mes · {t.com}€/ref{pend > 0 && <span style={{ color: C.sand }}> · {pend}€ pend.</span>}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {adminTab === "ranking" && selAf && (() => {
            const a = selAf; const t = getTier(a.rs.length); const nt = getNextTier(a.rs.length);
            return (
              <div className="fu">
                <button onClick={() => setSelAf(null)} className="bh" style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 11, marginBottom: 10, fontWeight: 600 }}>← Volver</button>
                <div style={{ ...cardStyle, background: `linear-gradient(135deg,${C.deepGreen}10,${t.c}08)`, border: `1px solid ${t.c}20` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: PF }}>{a.nombre}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}><Badge tier={t} /><span style={{ fontSize: 11, color: C.muted }}>{a.codigo}</span></div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>Comisión: <strong style={{ color: t.c }}>{t.com}€/ref</strong>{t.keep > 0 && <span> · Necesita {t.keep} refs/mes</span>}</div>
                      {nt && <div style={{ fontSize: 10, color: nt.c, marginTop: 4 }}>→ {nt.i} {nt.n} (faltan {nt.min - a.rs.length}) · {nt.com}€/ref</div>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                      {[[a.rs.length, "Refs", C.gold], [a.pg.reduce((s, p) => s + p.m, 0) + "€", "Pagado", C.green], [a.refsEsteMes || 0, "Este mes", C.blue]].map(([v, l, c], i) => (
                        <div key={i} style={{ textAlign: "center", padding: 8, borderRadius: 8, background: C.bg }}><div style={{ fontSize: 16, fontWeight: 800, color: c }}>{v}</div><div style={{ fontSize: 7, color: C.muted }}>{l}</div></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={cardStyle}>
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: PF, marginBottom: 10, color: C.gold }}>Referidos ({a.rs.length})</div>
                  {a.rs.length === 0 ? <div style={{ textAlign: "center", padding: 16, color: C.muted, fontSize: 11 }}>Sin referidos</div> : a.rs.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: 8, marginBottom: 3, background: C.bg2 }}>
                      <div><span style={{ fontSize: 11, fontWeight: 600 }}>{r.n}</span><span style={{ fontSize: 9, color: C.muted, marginLeft: 6 }}>{r.fecha}</span></div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ fontSize: 11 }}>{r.k.toLocaleString()}€</span><span style={{ fontSize: 11, fontWeight: 800, color: C.green }}>→ {t.com}€</span><span style={{ fontSize: 10, color: r.p ? C.green : C.gold }}>{r.p ? "✅" : "⏳"}</span></div>
                    </div>
                  ))}
                </div>
                <div style={cardStyle}>
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: PF, marginBottom: 8, color: C.wa }}>🔗 Enlace de Referido</div>
                  <div style={{ padding: 10, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, fontSize: 10, wordBreak: "break-all", color: C.muted, marginBottom: 8 }}>{waLink(a.nombre, a.codigo)}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => copy(waLink(a.nombre, a.codigo), a.codigo + "-l")} className="bh" style={{ flex: 1, padding: 8, borderRadius: 8, border: "none", background: C.wa + "15", color: C.wa, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>{copied === a.codigo + "-l" ? "✅ Copiado" : "📋 Copiar"}</button>
                    <a href={waLink(a.nombre, a.codigo)} target="_blank" rel="noreferrer" className="bh" style={{ flex: 1, padding: 8, borderRadius: 8, background: C.wa + "15", color: C.wa, textAlign: "center", textDecoration: "none", fontSize: 11, fontWeight: 700, display: "block" }}>📱 Abrir WA</a>
                  </div>
                </div>
              </div>
            );
          })()}

          {adminTab === "codigos" && (
            <div className="fu s1" style={cardStyle}>
              <div style={{ fontSize: 14, fontWeight: 800, fontFamily: PF, marginBottom: 14, color: C.gold }}>🔗 Enlaces de Afiliados</div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 12, padding: 10, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}` }}>Cada enlace dirige al WhatsApp con mensaje personalizado identificando al afiliado.</div>
              {AFILIADOS.map(a => { const t = getTier(a.rs.length); return (
                <div key={a.codigo} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, marginBottom: 4, background: C.bg2, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Badge tier={t} size="sm" /><span style={{ fontSize: 12, fontWeight: 700 }}>{a.nombre}</span></div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <span style={{ fontWeight: 800, color: C.gold, fontSize: 11, padding: "3px 8px", borderRadius: 5, background: C.gold + "08" }}>{a.codigo}</span>
                    <button onClick={() => copy(a.codigo, a.codigo + "-c")} className="bh" style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: C.deepGreen, color: C.gold, cursor: "pointer", fontSize: 10, fontWeight: 700 }}>{copied === a.codigo + "-c" ? "✅" : "📋"}</button>
                    <button onClick={() => copy(waLink(a.nombre, a.codigo), a.codigo + "-w")} className="bh" style={{ padding: "4px 8px", borderRadius: 6, background: C.wa + "15", color: C.wa, cursor: "pointer", fontSize: 10, border: "none", fontWeight: 700 }}>{copied === a.codigo + "-w" ? "✅" : "📱"}</button>
                    <a href={waLink(a.nombre, a.codigo)} target="_blank" rel="noreferrer" style={{ padding: "4px 8px", borderRadius: 6, background: C.wa + "10", color: C.wa, fontSize: 10, textDecoration: "none", fontWeight: 700 }}>↗</a>
                  </div>
                </div>
              ); })}
            </div>
          )}

          {adminTab === "pagos" && (
            <div className="fu s1" style={cardStyle}>
              <div style={{ fontSize: 14, fontWeight: 800, fontFamily: PF, marginBottom: 14, color: C.gold }}>💰 Comisiones por Afiliado</div>
              <div style={{ fontSize: 9, color: C.muted, marginBottom: 12, padding: 10, borderRadius: 8, background: C.bg }}>La comisión depende del tier. Pago el día 20 de cada mes.</div>
              {AFILIADOS.map(a => { const t = getTier(a.rs.length); const pg = a.pg.reduce((s, p) => s + p.m, 0); const pn = a.rs.filter(r => !r.p).length * t.com; return (
                <div key={a.codigo} style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 4, background: C.bg2, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 12, fontWeight: 700 }}>{a.nombre}</span><Badge tier={t} size="sm" /></div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: t.c }}>{t.com}€/ref</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: 10 }}>
                    <span style={{ color: C.green }}>✅ Pagado: {pg}€</span>
                    <span style={{ color: C.sand }}>⏳ Pendiente: {pn}€</span>
                    <span style={{ color: C.muted }}>Refs: {a.rs.length}</span>
                  </div>
                </div>
              ); })}
              <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: C.gold + "08", border: `1px solid ${C.gold}20`, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>Total pendiente</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: C.gold }}>{tPend}€</span>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  /* ═══ USER DASHBOARD ═══ */
  const tabs = [["h", "🏠", "Inicio"], ["n", "🏆", "Niveles"], ["r", "👥", "Referidos"], ["p", "💰", "Pagos"], ["i", "📈", "Inversión"], ["f", "⚙️", "Perfil"]];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: DM }}>
      <style>{css}</style>
      <header style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: 56, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={LOGO} alt="" style={{ height: 30 }} onError={e => { e.target.style.display = "none"; }} />
          <div><div style={{ fontSize: 14, fontWeight: 800, color: C.gold, fontFamily: PF }}>Portal Afiliados</div><div style={{ fontSize: 9, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>{user.nombre} · <Badge tier={tier} size="sm" /></div></div>
        </div>
        <button onClick={logout} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Salir</button>
      </header>

      <nav style={{ display: "flex", gap: 0, padding: "0 12px", background: C.bg2, borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
        {tabs.map(([id, ic, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "10px 12px", border: "none", cursor: "pointer", fontSize: 11, background: "transparent", color: tab === id ? C.gold : C.muted, fontWeight: tab === id ? 800 : 500, borderBottom: `2px solid ${tab === id ? C.gold : "transparent"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 50 }}>
            <span style={{ fontSize: 14 }}>{ic}</span><span style={{ fontSize: 8, letterSpacing: 0.5 }}>{label}</span>
          </button>
        ))}
      </nav>

      <main style={{ padding: "16px 20px", maxWidth: 1100, margin: "0 auto" }}>

        {tab === "h" && (
          <div>
            <div className="fu" style={{ ...cardStyle, background: `linear-gradient(135deg,${C.deepGreen}18,${C.gold}06)`, border: `1px solid ${C.gold}15` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 9, color: C.sand, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Bienvenido</div>
                  <div style={{ fontFamily: PF, fontSize: 22, fontWeight: 800, marginTop: 6 }}>{user.nombre}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}><Badge tier={tier} /><span style={{ fontSize: 11, color: C.muted }}>{tier.com}€/ref</span></div>
                  {tier.keep > 0 && <div style={{ fontSize: 9, color: C.sand, marginTop: 6 }}>🔄 Necesitas {tier.keep} refs/mes · <span style={{ color: refsEsteMes >= tier.keep ? C.green : C.red, fontWeight: 700 }}>{refsEsteMes}/{tier.keep} {refsEsteMes >= tier.keep ? "✅" : "⚠️"}</span></div>}
                </div>
                <div style={{ textAlign: "center", background: C.bg + "90", borderRadius: 14, padding: "12px 22px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 8, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Próximo pago</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.gold, fontFamily: PF, lineHeight: 1.1, marginTop: 4 }}>{diasPago}</div>
                  <div style={{ fontSize: 8, color: C.muted }}>días</div>
                </div>
              </div>
            </div>
            <div className="fu s1" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
              <Stat value={user.rs.length} label="Referidos" color={C.gold} small />
              <Stat value={totalGanado + "€"} label="Ganado" color={C.green} small />
              <Stat value={pendiente + "€"} label="Pendiente" color={C.sand} small />
              <Stat value={user.ca.toLocaleString() + "€"} label="Capital" color={C.purple} small />
            </div>
            <div className="fu s2" style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.gold, fontFamily: PF, marginBottom: 8 }}>🔗 Comparte y Gana {tier.com}€</div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>Tu enlace envía un WhatsApp automático identificándote.</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", background: C.bg, borderRadius: 10, padding: "8px 14px", border: `1px solid ${C.border}`, marginBottom: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.gold, letterSpacing: 3, flex: 1, textAlign: "center", fontFamily: PF }}>{user.codigo}</div>
                <button onClick={() => copy(user.codigo, "code")} className="bh" style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: copied === "code" ? C.green + "18" : C.deepGreen, color: copied === "code" ? C.green : C.gold, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>{copied === "code" ? "✅" : "📋"}</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <a href={waLink(user.nombre, user.codigo)} target="_blank" rel="noreferrer" className="bh" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, borderRadius: 10, background: C.wa + "12", color: C.wa, textDecoration: "none", fontSize: 12, fontWeight: 800, border: `1px solid ${C.wa}25` }}>📱 WhatsApp</a>
                <button onClick={() => copy(waLink(user.nombre, user.codigo), "walink")} className="bh" style={{ padding: 10, borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, color: C.sand, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{copied === "walink" ? "✅ Copiado" : "🔗 Copiar"}</button>
              </div>
            </div>
            {user.rs.length > 0 && <div className="fu s3" style={cardStyle}><div style={{ fontSize: 12, fontWeight: 700, fontFamily: PF, marginBottom: 8 }}>Últimos Referidos</div>{user.rs.slice(-3).reverse().map((r, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, marginBottom: 3, background: C.bg2 }}><div><span style={{ fontSize: 11, fontWeight: 600 }}>{r.n}</span><span style={{ fontSize: 9, color: C.muted, marginLeft: 6 }}>{r.fecha}</span></div><div style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ fontSize: 12, fontWeight: 800, color: C.green }}>+{tier.com}€</span><span style={{ fontSize: 10, color: r.p ? C.green : C.gold }}>{r.p ? "✅" : "⏳"}</span></div></div>))}</div>}
            {nextTier && <div className="fu s4" style={{ ...cardStyle, background: nextTier.c + "06", border: `1px solid ${nextTier.c}15` }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 11, fontWeight: 700 }}>→ <span style={{ color: nextTier.c }}>{nextTier.i} {nextTier.n}</span></span><span style={{ fontSize: 12, fontWeight: 800, color: nextTier.c }}>+{nextTier.com - tier.com}€/ref</span></div><Progress current={user.rs.length} total={nextTier.min} colorFrom={tier.c} colorTo={nextTier.c} /><div style={{ fontSize: 9, color: C.muted, marginTop: 6, textAlign: "center" }}>{user.rs.length}/{nextTier.min} — faltan {nextTier.min - user.rs.length}</div></div>}
          </div>
        )}

        {tab === "n" && (
          <div>
            <div className="fu" style={{ fontSize: 18, fontWeight: 800, fontFamily: PF, marginBottom: 14 }}>🏆 Sistema de Niveles</div>
            <div className="fu s1" style={{ ...cardStyle, padding: 0 }}>
              <div style={{ padding: "16px 18px", display: "flex", position: "relative", alignItems: "center" }}>
                <div style={{ position: "absolute", top: "50%", left: 24, right: 24, height: 4, background: C.border, zIndex: 0, transform: "translateY(-50%)", borderRadius: 2 }} />
                <div style={{ position: "absolute", top: "50%", left: 24, height: 4, background: `linear-gradient(90deg,${C.green},${C.gold})`, zIndex: 1, transform: "translateY(-50%)", width: `${Math.min(100, (TIERS.findIndex(x => x.n === tier.n) / (TIERS.length - 1)) * 100)}%`, borderRadius: 2 }} />
                {TIERS.map(t => { const done = user.rs.length >= t.min; const cur = t.n === tier.n; return (
                  <div key={t.n} style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 2 }}>
                    <div style={{ width: cur ? 44 : 32, height: cur ? 44 : 32, borderRadius: "50%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: cur ? 18 : 13, background: done ? t.c + "18" : C.bg, border: `3px solid ${done ? t.c : C.border}`, boxShadow: cur ? `0 0 20px ${t.c}30` : "none", opacity: done ? 1 : 0.3 }}>{t.i}</div>
                    <div style={{ marginTop: 4, fontSize: cur ? 10 : 8, fontWeight: cur ? 800 : 600, color: done ? t.c : C.muted }}>{t.n}</div>
                    <div style={{ fontSize: 7, color: C.muted }}>{t.com}€</div>
                  </div>
                ); })}
              </div>
              {nextTier && <div style={{ padding: "10px 18px", borderTop: `1px solid ${C.border}`, background: nextTier.c + "06", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11 }}>→ <strong style={{ color: nextTier.c }}>{nextTier.i} {nextTier.n}</strong> — faltan <strong style={{ color: nextTier.c }}>{nextTier.min - user.rs.length}</strong></span><span style={{ fontWeight: 800, color: nextTier.c, fontSize: 13 }}>+{nextTier.com - tier.com}€</span></div>}
            </div>
            <div className="fu s2" style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: PF, marginBottom: 10 }}>💰 Tabla de Comisiones</div>
              {TIERS.map(t => { const cur = t.n === tier.n; return (
                <div key={t.n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, marginBottom: 4, border: `1px solid ${cur ? t.c + "40" : C.border}`, background: cur ? t.c + "08" : C.bg2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>{t.i}</span><div><div style={{ fontSize: 12, fontWeight: 700, color: cur ? t.c : C.text }}>{t.n}{cur ? " ← TÚ" : ""}</div><div style={{ fontSize: 9, color: C.muted }}>{t.min}+ refs · {t.desc}</div></div></div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: cur ? t.c : C.text, fontFamily: PF }}>{t.com}€</span>
                </div>
              ); })}
            </div>
            {tier.keep > 0 && <div className="fu s3" style={{ ...cardStyle, background: refsEsteMes >= tier.keep ? C.green + "06" : C.red + "06", border: `1px solid ${refsEsteMes >= tier.keep ? C.green : C.red}20` }}>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: PF, marginBottom: 6 }}>{refsEsteMes >= tier.keep ? "✅ Nivel Asegurado" : "⚠️ Mantén tu Nivel"}</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Necesitas <strong style={{ color: tier.c }}>{tier.keep} refs/mes</strong> para {tier.i} {tier.n}.{refsEsteMes < tier.keep ? ` Faltan ${tier.keep - refsEsteMes}.` : " ¡Vas bien!"}</div>
              <Progress current={refsEsteMes} total={tier.keep} colorFrom={refsEsteMes >= tier.keep ? C.green : C.red} colorTo={tier.c} height={8} />
              <div style={{ fontSize: 9, color: C.muted, marginTop: 4, textAlign: "center" }}>{refsEsteMes}/{tier.keep} este mes</div>
            </div>}
            <div className="fu s4" style={cardStyle}><div style={{ fontSize: 13, fontWeight: 700, fontFamily: PF, marginBottom: 10 }}>🎁 Bonos Mensuales</div><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>{BONOS.map((b, i) => { const e = refsEsteMes >= b.refs; return (<div key={i} style={{ padding: 14, borderRadius: 12, background: e ? b.color + "12" : C.bg2, border: `1px solid ${e ? b.color + "30" : C.border}`, textAlign: "center", opacity: e ? 1 : 0.5 }}><div style={{ fontSize: 24 }}>{b.icon}</div><div style={{ fontSize: 20, fontWeight: 800, color: b.color, fontFamily: PF, marginTop: 4 }}>+{b.amount}€</div><div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{b.refs} refs/mes</div>{e && <div style={{ fontSize: 8, color: C.green, fontWeight: 700, marginTop: 4 }}>✅ GANADO</div>}</div>); })}</div>{totalBonos > 0 && <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: C.gold + "08", textAlign: "center", border: `1px solid ${C.gold}20` }}><span style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>Bonos este mes: +{totalBonos}€</span></div>}</div>
          </div>
        )}

        {tab === "r" && (
          <div>
            <div className="fu" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><span style={{ fontSize: 18, fontWeight: 800, fontFamily: PF }}>👥 Mis Referidos</span><Badge tier={tier} /></div>
            {nextTier && <div className="fu s1" style={{ ...cardStyle, padding: 12 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11 }}><span>Progreso a {nextTier.i} {nextTier.n}</span><span style={{ color: nextTier.c, fontWeight: 800 }}>{user.rs.length}/{nextTier.min}</span></div><Progress current={user.rs.length} total={nextTier.min} colorFrom={tier.c} colorTo={nextTier.c} height={8} /></div>}
            <div className="fu s2" style={cardStyle}>{user.rs.length === 0 ? <div style={{ textAlign: "center", padding: 24 }}><div style={{ fontSize: 32, marginBottom: 8 }}>🚀</div><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>¡Empieza a referir!</div><div style={{ fontSize: 11, color: C.muted }}>Comparte tu enlace y gana {tier.com}€</div></div> : user.rs.map((r, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, marginBottom: 4, background: C.bg2 }}><div><span style={{ fontSize: 12, fontWeight: 600 }}>{r.n}</span><span style={{ fontSize: 9, color: C.muted, marginLeft: 6 }}>{r.fecha}</span></div><div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 10, color: C.muted }}>{r.k.toLocaleString()}€</span><span style={{ fontSize: 12, fontWeight: 800, color: C.green }}>+{tier.com}€</span><span style={{ fontSize: 11, color: r.p ? C.green : C.gold }}>{r.p ? "✅" : "⏳"}</span></div></div>))}</div>
            <div className="fu s3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}><Stat value={totalGanado + "€"} label="Cobrado" color={C.green} small /><Stat value={pendiente + "€"} label="Pendiente" color={C.gold} small /><Stat value="Día 20" label="Pago" color={C.sand} small /></div>
          </div>
        )}

        {tab === "p" && (
          <div>
            <div className="fu" style={{ fontSize: 18, fontWeight: 800, fontFamily: PF, marginBottom: 14 }}>💰 Historial de Pagos</div>
            <div className="fu s1" style={cardStyle}>{user.pg.length === 0 ? <div style={{ textAlign: "center", padding: 20, color: C.muted, fontSize: 11 }}>Sin pagos aún</div> : user.pg.map((p, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, marginBottom: 4, background: C.bg2 }}><div><span style={{ fontSize: 12, fontWeight: 600 }}>{p.r}</span><span style={{ fontSize: 9, color: C.muted, marginLeft: 6 }}>{p.fecha}</span></div><span style={{ fontSize: 14, fontWeight: 800, color: C.green }}>+{p.m}€ ✅</span></div>))}{pendiente > 0 && <div style={{ padding: 12, borderRadius: 10, border: `1px solid ${C.gold}20`, background: C.gold + "06", marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 11, color: C.gold, fontWeight: 600 }}>Próximo · Día 20</span><span style={{ fontSize: 16, fontWeight: 800, color: C.gold, fontFamily: PF }}>{pendiente}€</span></div>}</div>
            <div className="fu s2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><Stat value={totalGanado + "€"} label="Total cobrado" color={C.green} /><Stat value={(totalGanado + pendiente) + "€"} label="Total generado" color={C.gold} /></div>
          </div>
        )}

        {tab === "i" && (
          <div>
            <div className="fu" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><span style={{ fontSize: 18, fontWeight: 800, fontFamily: PF }}>📈 Mi Inversión</span><button onClick={() => setShowModal(true)} className="bh" style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: C.deepGreen, color: C.gold, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>+ Registrar</button></div>
            <div className="fu s1" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}><Stat value={user.ca.toLocaleString() + "€"} label="Capital" color={C.gold} small /><Stat value={"+" + ganInv + "€"} label="Ganancia" color={C.green} small /><Stat value={rentAcum + "%"} label="Rent." color={C.purple} small /><Stat value={"+" + mejorMes.r + "%"} label={mejorMes.ms} color={C.sand} small /></div>
            {rentData.length > 0 && <div><div className="fu s2"><CapitalChart data={rentData} /></div><div className="fu s3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><RentChart data={rentData} /><div style={cardStyle}><div style={{ fontSize: 11, fontWeight: 700, fontFamily: PF, marginBottom: 8, color: C.purple }}>📋 Historial</div>{[...rentData].reverse().map((r, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", borderRadius: 6, marginBottom: 2, background: C.bg2 }}><span style={{ fontSize: 10, fontWeight: 600 }}>{r.ms}</span><div style={{ display: "flex", gap: 8 }}><span style={{ fontSize: 10, color: C.muted }}>{r.c.toLocaleString()}€</span><span style={{ fontSize: 11, fontWeight: 800, color: r.r >= 0 ? C.green : C.red }}>{r.r >= 0 ? "+" : ""}{r.r}%</span></div></div>))}</div></div></div>}
          </div>
        )}

        {tab === "f" && (
          <div>
            <div className="fu" style={{ fontSize: 18, fontWeight: 800, fontFamily: PF, marginBottom: 14 }}>⚙️ Mi Perfil</div>
            <div className="fu s1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={cardStyle}><div style={{ fontSize: 16, fontWeight: 800, fontFamily: PF, marginBottom: 8 }}>{user.nombre}</div><Badge tier={tier} /><div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>{tier.com}€/ref</div><div style={{ padding: "6px 8px", borderRadius: 6, background: C.bg, marginTop: 8, fontSize: 11 }}><span style={{ color: C.gold, fontWeight: 800 }}>{user.codigo}</span></div>{nextTier && <div style={{ fontSize: 10, color: C.muted, marginTop: 10 }}>→ {nextTier.i} {nextTier.n}: faltan {nextTier.min - user.rs.length}</div>}{tier.keep > 0 && <div style={{ fontSize: 9, color: C.sand, marginTop: 6 }}>🔄 {tier.keep} refs/mes para mantener</div>}</div>
              <div style={cardStyle}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>{[[user.rs.length, "Refs", C.gold], [totalGanado + "€", "Ganado", C.green], [rentAcum + "%", "Rent.", C.purple], [user.pg.length, "Pagos", C.sand]].map(([v, l, c], i) => (<div key={i} style={{ textAlign: "center", padding: 10, borderRadius: 10, background: C.bg }}><div style={{ fontSize: 18, fontWeight: 800, color: c, fontFamily: PF }}>{v}</div><div style={{ fontSize: 7, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div></div>))}</div></div>
            </div>
            <div className="fu s2" style={cardStyle}><div style={{ fontSize: 12, fontWeight: 700, fontFamily: PF, marginBottom: 8, color: C.wa }}>📱 Tu Enlace</div><div style={{ padding: 10, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, fontSize: 10, wordBreak: "break-all", color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>{waLink(user.nombre, user.codigo)}</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}><a href={waLink(user.nombre, user.codigo)} target="_blank" rel="noreferrer" className="bh" style={{ display: "block", padding: 10, borderRadius: 8, background: C.wa + "12", color: C.wa, textAlign: "center", textDecoration: "none", fontSize: 12, fontWeight: 700, border: `1px solid ${C.wa}25` }}>📱 WhatsApp</a><button onClick={() => copy(waLink(user.nombre, user.codigo), "pf-wa")} className="bh" style={{ padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.sand, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{copied === "pf-wa" ? "✅ Copiado" : "🔗 Copiar"}</button></div></div>
            <div className="fu s3" style={{ ...cardStyle, background: C.gold + "04" }}><div style={{ fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>💬 ¿Ayuda?</span><a href="https://wa.me/34683105553" target="_blank" rel="noreferrer" style={{ color: C.wa, textDecoration: "none", fontWeight: 700, fontSize: 11 }}>+34 683 105 553</a></div></div>
          </div>
        )}
      </main>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} className="fu" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, width: "100%", maxWidth: 340, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: PF, marginBottom: 16, color: C.gold }}>📊 Registrar Mes</div>
            {[["Mes", "m", "Abr 26"], ["Rentabilidad %", "r", "5.2"], ["Capital €", "c", "4500"]].map(([l, k, ph]) => (
              <div key={k} style={{ marginBottom: 10 }}><label style={{ fontSize: 9, color: C.sand, fontWeight: 700, display: "block", marginBottom: 4, letterSpacing: 1, textTransform: "uppercase" }}>{l}</label><input type={k === "m" ? "text" : "number"} step="0.1" value={newMonth[k]} onChange={e => setNewMonth({ ...newMonth, [k]: e.target.value })} placeholder={ph} style={{ ...inputStyle, borderRadius: 10 }} /></div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Cancelar</button>
              <button className="bh" onClick={() => { if (!newMonth.m || !newMonth.r || !newMonth.c) return; setRentData(p => [...p, { ms: newMonth.m, r: parseFloat(newMonth.r), c: parseFloat(newMonth.c) }]); setNewMonth({ m: "", r: "", c: "" }); setShowModal(false); }} style={{ padding: 12, borderRadius: 10, border: "none", background: `linear-gradient(135deg,${C.deepGreen},#0a6b50)`, color: C.gold, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>✅ Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}