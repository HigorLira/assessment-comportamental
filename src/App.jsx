import { useState, useEffect, useMemo, useCallback } from "react";
import { db, auth, authHelper } from "./firebase.js";

// ═══════════════════════════════════════════════════════════════
// ASSESSMENT DATA
// ═══════════════════════════════════════════════════════════════

const DISC_QS = [
  {id:1,text:"Em uma reunião de equipe, você geralmente...",opts:[{l:"Assume o controle e direciona a discussão",p:"D"},{l:"Motiva o grupo e gera entusiasmo",p:"I"},{l:"Escuta atentamente e busca consenso",p:"S"},{l:"Analisa os dados antes de opinar",p:"C"}]},
  {id:2,text:"Quando surge um conflito no trabalho, você...",opts:[{l:"Enfrenta diretamente e busca resolução rápida",p:"D"},{l:"Usa humor e carisma para amenizar",p:"I"},{l:"Busca entender os dois lados com paciência",p:"S"},{l:"Apresenta fatos para resolver logicamente",p:"C"}]},
  {id:3,text:"Ao receber um novo projeto, sua primeira reação é...",opts:[{l:"Definir metas e prazos imediatamente",p:"D"},{l:"Compartilhar com colegas e pensar em possibilidades",p:"I"},{l:"Planejar com calma, passo a passo",p:"S"},{l:"Pesquisar referências e analisar requisitos",p:"C"}]},
  {id:4,text:"O que mais te motiva no trabalho?",opts:[{l:"Superar desafios e alcançar resultados",p:"D"},{l:"Reconhecimento e interação social",p:"I"},{l:"Estabilidade e trabalho em equipe harmoniosa",p:"S"},{l:"Qualidade, precisão e expertise técnica",p:"C"}]},
  {id:5,text:"Quando precisa tomar uma decisão importante, você...",opts:[{l:"Decide rapidamente com base na intuição",p:"D"},{l:"Consulta pessoas de confiança e segue o coração",p:"I"},{l:"Pondera cuidadosamente e evita riscos",p:"S"},{l:"Coleta dados, analisa prós e contras minuciosamente",p:"C"}]},
  {id:6,text:"Em situações de pressão e prazo apertado, você...",opts:[{l:"Se energiza e trabalha com mais intensidade",p:"D"},{l:"Mantém o otimismo e anima o time",p:"I"},{l:"Fica tenso mas mantém a constância no trabalho",p:"S"},{l:"Se concentra nos detalhes para não errar",p:"C"}]},
  {id:7,text:"Como você prefere receber feedback?",opts:[{l:"Direto e objetivo, sem rodeios",p:"D"},{l:"De forma positiva e encorajadora",p:"I"},{l:"Com empatia, em conversa particular",p:"S"},{l:"Com dados concretos e exemplos específicos",p:"C"}]},
  {id:8,text:"Quando trabalha em equipe, seu papel natural é...",opts:[{l:"Liderar e delegar tarefas",p:"D"},{l:"Conectar pessoas e criar clima positivo",p:"I"},{l:"Apoiar e garantir harmonia no grupo",p:"S"},{l:"Garantir qualidade e padrões técnicos",p:"C"}]},
  {id:9,text:"O que te causa mais frustração?",opts:[{l:"Falta de ação e lentidão nas decisões",p:"D"},{l:"Ambiente negativo e falta de reconhecimento",p:"I"},{l:"Mudanças bruscas e falta de segurança",p:"S"},{l:"Trabalho mal feito e falta de padrões",p:"C"}]},
  {id:10,text:"Como você lida com mudanças inesperadas?",opts:[{l:"Adapta rapidamente e vê como oportunidade",p:"D"},{l:"Aceita com entusiasmo se envolver pessoas",p:"I"},{l:"Precisa de tempo para processar e se adaptar",p:"S"},{l:"Analisa o impacto antes de aceitar",p:"C"}]},
  {id:11,text:"Seu estilo de comunicação é mais...",opts:[{l:"Assertivo e direto ao ponto",p:"D"},{l:"Expressivo e persuasivo",p:"I"},{l:"Calmo e acolhedor",p:"S"},{l:"Preciso e detalhado",p:"C"}]},
  {id:12,text:"Em um ambiente ideal de trabalho, você teria...",opts:[{l:"Autonomia e poder de decisão",p:"D"},{l:"Liberdade criativa e interação social",p:"I"},{l:"Rotina previsível e bom relacionamento",p:"S"},{l:"Processos claros e recursos para pesquisa",p:"C"}]},
];

const BM_QS = [
  {id:"bm1",dim:"energy",text:"Como você descreveria seu ritmo de trabalho?",left:"Cauteloso e constante",right:"Dinâmico e acelerado"},
  {id:"bm2",dim:"energy",text:"Ao começar o dia, você prefere...",left:"Rotina estruturada",right:"Novos desafios cada dia"},
  {id:"bm3",dim:"social",text:"Qual é seu nível de conforto em interações sociais no trabalho?",left:"Prefiro trabalhar sozinho",right:"Adoro trabalhar com pessoas"},
  {id:"bm4",dim:"social",text:"Em um evento corporativo, você geralmente...",left:"Fica mais reservado",right:"É o centro das conversas"},
  {id:"bm5",dim:"decision",text:"Ao tomar decisões, você é mais...",left:"Analítico e cuidadoso",right:"Intuitivo e rápido"},
  {id:"bm6",dim:"decision",text:"Quando há risco envolvido, você...",left:"Evita riscos ao máximo",right:"Abraça riscos com coragem"},
  {id:"bm7",dim:"adapt",text:"Diante de mudanças organizacionais, você...",left:"Resiste até entender o motivo",right:"Abraça imediatamente"},
  {id:"bm8",dim:"adapt",text:"Sua flexibilidade ao lidar com imprevistos é...",left:"Preciso de preparo prévio",right:"Improvisar é meu forte"},
  {id:"bm9",dim:"focus",text:"Você se considera mais orientado a...",left:"Pessoas e relacionamentos",right:"Tarefas e resultados"},
  {id:"bm10",dim:"focus",text:"No trabalho, sua maior satisfação vem de...",left:"Ajudar e desenvolver pessoas",right:"Entregar resultados concretos"},
];

const EQ_QS = [
  {id:"eq1",dim:"selfAware",text:"Consigo identificar minhas emoções no momento em que elas surgem."},
  {id:"eq2",dim:"selfAware",text:"Reconheço como meu humor afeta meu desempenho no trabalho."},
  {id:"eq3",dim:"selfReg",text:"Consigo manter a calma em situações de alta pressão."},
  {id:"eq4",dim:"selfReg",text:"Penso antes de reagir quando algo me irrita ou frustra."},
  {id:"eq5",dim:"motivation",text:"Mantenho-me motivado mesmo quando os resultados demoram a aparecer."},
  {id:"eq6",dim:"motivation",text:"Busco excelência por satisfação pessoal, não apenas por recompensas externas."},
  {id:"eq7",dim:"empathy",text:"Consigo perceber como as outras pessoas estão se sentindo, mesmo sem que digam."},
  {id:"eq8",dim:"empathy",text:"Considero os sentimentos dos outros antes de tomar decisões que os afetam."},
  {id:"eq9",dim:"socialSk",text:"Consigo influenciar e persuadir pessoas de forma construtiva."},
  {id:"eq10",dim:"socialSk",text:"Construo e mantenho relacionamentos profissionais com facilidade."},
];

const VAL_QS = [
  {id:"v1",text:"Autonomia e liberdade de ação",cat:"Autonomia"},
  {id:"v2",text:"Crescimento e aprendizado contínuo",cat:"Desenvolvimento"},
  {id:"v3",text:"Segurança e estabilidade profissional",cat:"Segurança"},
  {id:"v4",text:"Reconhecimento e valorização do trabalho",cat:"Reconhecimento"},
  {id:"v5",text:"Propósito e impacto social positivo",cat:"Propósito"},
  {id:"v6",text:"Equilíbrio entre vida pessoal e profissional",cat:"Equilíbrio"},
  {id:"v7",text:"Inovação e criatividade no dia a dia",cat:"Inovação"},
  {id:"v8",text:"Trabalho em equipe e colaboração",cat:"Colaboração"},
  {id:"v9",text:"Remuneração e benefícios competitivos",cat:"Remuneração"},
  {id:"v10",text:"Desafios complexos e estimulantes",cat:"Desafio"},
];

const OPEN_QS = [
  {key:"q1",text:"Quais são seus 3 maiores talentos ou habilidades naturais?"},
  {key:"q2",text:"Descreva uma situação recente em que você superou um desafio significativo."},
  {key:"q3",text:"O que você mudaria no seu ambiente de trabalho para ser mais produtivo e feliz?"},
  {key:"q4",text:"Onde você se vê profissionalmente nos próximos 2 anos?"},
];

const DISC_M = {
  D:{name:"Dominância",color:"#dc2626",emoji:"🦁",traits:["Decidido","Competitivo","Assertivo","Orientado a resultados"],desc:"Perfil orientado a resultados, com foco em superar desafios. Líderes naturais que valorizam eficiência e ação rápida.",str:"Liderança, tomada de decisão rápida, foco em resultados, determinação.",dev:"Paciência com processos, escuta ativa, sensibilidade interpessoal."},
  I:{name:"Influência",color:"#f59e0b",emoji:"🦊",traits:["Comunicativo","Entusiasta","Otimista","Persuasivo"],desc:"Perfil sociável e carismático, com facilidade para motivar equipes e criar conexões.",str:"Comunicação, networking, criatividade, capacidade de motivar.",dev:"Foco em detalhes, organização, follow-up de tarefas."},
  S:{name:"Estabilidade",color:"#10b981",emoji:"🐘",traits:["Paciente","Confiável","Leal","Cooperativo"],desc:"Perfil estável e confiável, que valoriza harmonia e consistência no trabalho.",str:"Consistência, trabalho em equipe, lealdade, paciência.",dev:"Assertividade, adaptação a mudanças rápidas, iniciativa própria."},
  C:{name:"Conformidade",color:"#3b82f6",emoji:"🦉",traits:["Analítico","Preciso","Sistemático","Qualidade"],desc:"Perfil meticuloso e analítico, com alto padrão de qualidade e precisão.",str:"Análise crítica, atenção a detalhes, qualidade, processos.",dev:"Flexibilidade, delegação, comunicação emocional."},
};
const DIM_L={energy:"Energia e Ritmo",social:"Orientação Social",decision:"Tomada de Decisão",adapt:"Adaptabilidade",focus:"Foco e Orientação"};
const EQ_L={selfAware:"Autoconsciência",selfReg:"Autorregulação",motivation:"Motivação",empathy:"Empatia",socialSk:"Hab. Sociais"};

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const FNT=`'Outfit',sans-serif`, MNO=`'JetBrains Mono',monospace`;
const css = {
  page:{minHeight:"100vh",background:"#fafaf9",fontFamily:FNT,color:"#1c1917",margin:0},
  card:{background:"#fff",border:"1px solid #e7e5e4",borderRadius:16,padding:28},
  btn:(p)=>({background:p?"#1c1917":"#fff",border:p?"none":"1px solid #d6d3d1",borderRadius:12,padding:"13px 32px",color:p?"#fff":"#1c1917",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FNT,transition:"opacity 0.2s"}),
  sm:{background:"#fff",border:"1px solid #d6d3d1",borderRadius:10,padding:"8px 16px",color:"#1c1917",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:FNT},
  inp:{width:"100%",padding:"12px 16px",background:"#fff",border:"1px solid #d6d3d1",borderRadius:10,color:"#1c1917",fontSize:14,fontFamily:FNT,outline:"none",boxSizing:"border-box"},
  lbl:{display:"block",fontSize:12,fontWeight:600,color:"#78716c",marginBottom:6},
  tag:(c)=>({display:"inline-block",fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:6,background:c+"15",color:c,border:`1px solid ${c}30`}),
};
const genId=()=>{const c="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";let r="";for(let i=0;i<8;i++)r+=c[Math.floor(Math.random()*c.length)];return r;};
const fmtT=(s)=>`${Math.floor(s/60)}min ${String(s%60).padStart(2,"0")}s`;
const FontLink=()=><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet"/>;

// Spinner
const Spin=({text})=>(
  <div style={{...css.page,display:"flex",alignItems:"center",justifyContent:"center"}}><FontLink/>
    <div style={{textAlign:"center"}}>
      <div style={{width:36,height:36,border:"3px solid #e7e5e4",borderTopColor:"#1c1917",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 14px"}}/>
      <div style={{color:"#78716c",fontSize:14}}>{text||"Carregando..."}</div>
    </div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════

function LoginScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const errorMap = {
    "auth/invalid-email": "Email inválido.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "Email ou senha incorretos.",
    "auth/email-already-in-use": "Este email já possui uma conta.",
    "auth/weak-password": "A senha deve ter no mínimo 6 caracteres.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um momento.",
  };

  const handleSubmit = async () => {
    setErr("");
    if (!email || !pass) { setErr("Preencha todos os campos."); return; }
    if (mode === "register" && pass !== pass2) { setErr("As senhas não coincidem."); return; }
    if (mode === "register" && pass.length < 6) { setErr("A senha deve ter no mínimo 6 caracteres."); return; }

    setLoading(true);
    try {
      if (mode === "login") {
        await authHelper.login(email, pass);
      } else {
        await authHelper.register(email, pass);
      }
    } catch (e) {
      setErr(errorMap[e.code] || "Erro ao autenticar. Tente novamente.");
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={css.page}><FontLink/>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:24 }}>
        <div style={{ ...css.card, width:"100%", maxWidth:420, padding:40 }}>
          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ width:56, height:56, borderRadius:14, background:"#1c1917", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <span style={{ color:"#fff", fontSize:22, fontWeight:800 }}>A</span>
            </div>
            <h1 style={{ fontSize:24, fontWeight:800, margin:"0 0 4px", letterSpacing:-0.5 }}>Assessment Manager</h1>
            <p style={{ fontSize:13, color:"#a8a29e", margin:0 }}>{mode==="login"?"Entre na sua conta":"Crie sua conta de administrador"}</p>
          </div>

          {/* Form */}
          <div style={{ marginBottom:16 }}>
            <label style={css.lbl}>Email</label>
            <input style={css.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={handleKey} placeholder="seu@email.com" autoFocus />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={css.lbl}>Senha</label>
            <input style={css.inp} type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={handleKey} placeholder="••••••••" />
          </div>
          {mode==="register" && (
            <div style={{ marginBottom:16 }}>
              <label style={css.lbl}>Confirmar senha</label>
              <input style={css.inp} type="password" value={pass2} onChange={e=>setPass2(e.target.value)} onKeyDown={handleKey} placeholder="••••••••" />
            </div>
          )}

          {err && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#dc2626", fontWeight:500 }}>
              {err}
            </div>
          )}

          <button style={{ ...css.btn(true), width:"100%", opacity:loading?0.5:1, marginBottom:16 }} onClick={handleSubmit} disabled={loading}>
            {loading ? "Aguarde..." : mode==="login" ? "Entrar" : "Criar conta"}
          </button>

          <div style={{ textAlign:"center" }}>
            <button onClick={()=>{setMode(mode==="login"?"register":"login");setErr("");}} style={{ background:"none", border:"none", color:"#78716c", fontSize:13, cursor:"pointer", fontFamily:FNT, textDecoration:"underline" }}>
              {mode==="login" ? "Não tem conta? Criar agora" : "Já tem conta? Fazer login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════════════════

function AdminPanel({ user }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [viewData, setViewData] = useState(null); // results view
  const [tName, setTName] = useState("");
  const [tRole, setTRole] = useState("");
  const [tDept, setTDept] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await db.listByOwner(user.uid);
    setAssessments(list);
    setLoading(false);
  }, [user.uid]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async () => {
    if (!tName.trim() || saving) return;
    setSaving(true);
    const id = genId();
    const data = { id, ownerId: user.uid, targetName: tName.trim(), targetRole: tRole.trim(), targetDept: tDept.trim(), createdAt: new Date().toISOString(), completed: false, results: null };
    await db.set(id, data);
    setTName(""); setTRole(""); setTDept("");
    await refresh();
    setSaving(false);
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}${window.location.pathname}#respond-${id}`;
    navigator.clipboard.writeText(url).catch(()=>{});
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };

  const openResults = async (id) => {
    const data = await db.get(id);
    if (data) setViewData(data);
  };

  const del = async (id) => {
    if (!window.confirm("Excluir este assessment?")) return;
    await db.del(id);
    await refresh();
  };

  const logout = () => authHelper.logout();

  // ─── Results View ───
  if (viewData?.results) {
    return <ResultsDashboard data={viewData} onBack={() => { setViewData(null); refresh(); }} />;
  }

  return (
    <div style={css.page}><FontLink/>
      {/* Top bar */}
      <div style={{ borderBottom:"1px solid #e7e5e4", padding:"14px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#fff" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"#1c1917", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, fontWeight:700 }}>A</div>
          <span style={{ fontSize:15, fontWeight:700 }}>Assessment Manager</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#10b981" }} />
            <span style={{ fontSize:12, color:"#78716c" }}>{user.email}</span>
          </div>
          <button onClick={logout} style={{ ...css.sm, color:"#dc2626", borderColor:"#fecaca" }}>Sair</button>
        </div>
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"40px 24px" }}>
        {/* Create */}
        <div style={{ ...css.card, marginBottom:32 }}>
          <h2 style={{ fontSize:18, fontWeight:700, margin:"0 0 4px" }}>Criar novo assessment</h2>
          <p style={{ fontSize:13, color:"#78716c", margin:"0 0 20px" }}>Preencha os dados e gere um link exclusivo para o colaborador.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
            <div><label style={css.lbl}>Nome *</label><input style={css.inp} value={tName} onChange={e=>setTName(e.target.value)} placeholder="Nome completo" /></div>
            <div><label style={css.lbl}>Cargo</label><input style={css.inp} value={tRole} onChange={e=>setTRole(e.target.value)} placeholder="Ex: Analista Sr." /></div>
            <div><label style={css.lbl}>Departamento</label><input style={css.inp} value={tDept} onChange={e=>setTDept(e.target.value)} placeholder="Ex: Tecnologia" /></div>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button style={{ ...css.btn(true), opacity:tName.trim()&&!saving?1:0.4 }} onClick={create} disabled={!tName.trim()||saving}>{saving?"Criando...":"+ Criar Assessment"}</button>
            <button style={css.sm} onClick={refresh}>↻ Atualizar</button>
          </div>
        </div>

        {/* List */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ fontSize:16, fontWeight:700, margin:0 }}>Seus assessments</h3>
          <span style={{ fontSize:12, color:"#a8a29e" }}>{assessments.length} registros</span>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:40, color:"#a8a29e" }}>Carregando...</div>
        ) : assessments.length === 0 ? (
          <div style={{ ...css.card, textAlign:"center", padding:48, color:"#a8a29e" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
            <div style={{ fontSize:14 }}>Nenhum assessment criado ainda.</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {assessments.map(a => (
              <div key={a.id} style={{ ...css.card, padding:20, display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:180 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:15, fontWeight:700 }}>{a.targetName}</span>
                    {a.completed ? <span style={css.tag("#10b981")}>Respondido</span> : <span style={css.tag("#f59e0b")}>Pendente</span>}
                  </div>
                  <div style={{ fontSize:12, color:"#a8a29e" }}>{a.targetRole && `${a.targetRole} · `}{new Date(a.createdAt).toLocaleDateString("pt-BR")} <span style={{ fontFamily:MNO, fontSize:11 }}>ID: {a.id}</span></div>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0, flexWrap:"wrap" }}>
                  <button style={css.sm} onClick={() => copyLink(a.id)}>{copiedId === a.id ? "✓ Copiado!" : "Copiar link"}</button>
                  {a.completed && <button style={{ ...css.sm, background:"#1c1917", color:"#fff", border:"none" }} onClick={() => openResults(a.id)}>Ver resultados</button>}
                  <button style={{ ...css.sm, color:"#dc2626", borderColor:"#fecaca" }} onClick={() => del(a.id)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RESULTS DASHBOARD
// ═══════════════════════════════════════════════════════════════

function ResultsDashboard({ data, onBack }) {
  const r = data.results;
  const discScores = { D:0, I:0, S:0, C:0 };
  Object.values(r.disc).forEach(p => { discScores[p]++; });
  const dominant = Object.entries(discScores).sort((a, b) => b[1] - a[1])[0];
  const dI = DISC_M[dominant[0]];

  const bmDims = {};
  BM_QS.forEach(q => { if (!bmDims[q.dim]) bmDims[q.dim] = []; if (r.behavioral[q.id] !== undefined) bmDims[q.dim].push(r.behavioral[q.id]); });
  const bmAvgs = {}; Object.entries(bmDims).forEach(([k, v]) => { bmAvgs[k] = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; });

  const eqDims = {};
  EQ_QS.forEach(q => { if (!eqDims[q.dim]) eqDims[q.dim] = []; if (r.eq[q.id] !== undefined) eqDims[q.dim].push(r.eq[q.id]); });
  const eqAvgs = {}; Object.entries(eqDims).forEach(([k, v]) => { eqAvgs[k] = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; });
  const eqOvr = Object.values(eqAvgs).reduce((a, b) => a + b, 0) / Math.max(Object.keys(eqAvgs).length, 1);

  const valData = VAL_QS.map(v => ({ cat: v.cat, score: r.values[v.id] || 0 })).sort((a, b) => b.score - a.score);

  const rSz=260,rC=rSz/2,rR=rSz/2-40,eqE=Object.entries(eqAvgs),rAng=(Math.PI*2)/eqE.length;
  const rPt=(i,val)=>{const a=rAng*i-Math.PI/2,rv=(val/5)*rR;return{x:rC+rv*Math.cos(a),y:rC+rv*Math.sin(a)};};

  return (
    <div style={css.page}><FontLink/>
      <div style={{ borderBottom:"1px solid #e7e5e4", padding:"14px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#fff" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={onBack} style={{ background:"none", border:"1px solid #e7e5e4", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontFamily:FNT, fontSize:12, fontWeight:600, color:"#78716c" }}>← Voltar</button>
          <span style={{ fontSize:15, fontWeight:700 }}>Resultados: {data.targetName}</span>
        </div>
        <button onClick={() => window.print()} style={css.sm}>🖨 Imprimir / PDF</button>
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"32px 24px" }}>
        {/* Meta + Time */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
          <div style={css.card}>
            <div style={css.lbl}>Colaborador</div>
            <div style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>{data.targetName}</div>
            <div style={{ fontSize:13, color:"#78716c" }}>{data.targetRole}{data.targetDept ? ` · ${data.targetDept}` : ""}</div>
            <div style={{ fontSize:12, color:"#a8a29e", marginTop:8 }}>Respondido em {new Date(r.completedAt).toLocaleString("pt-BR")}</div>
          </div>
          <div style={css.card}>
            <div style={css.lbl}>⏱ Tempos de Resposta</div>
            <div style={{ fontFamily:MNO, fontSize:28, fontWeight:700, marginBottom:12 }}>{fmtT(r.totalSeconds)}</div>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              {Object.entries(r.sectionTimes || {}).filter(([k]) => k).map(([k, t]) => (
                <div key={k} style={{ background:"#fafaf9", borderRadius:8, padding:"6px 12px", border:"1px solid #e7e5e4" }}>
                  <div style={{ fontSize:10, color:"#a8a29e", textTransform:"capitalize" }}>{k}</div>
                  <div style={{ fontFamily:MNO, fontSize:13, fontWeight:700 }}>{fmtT(t)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DISC */}
        <div style={{ ...css.card, marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <h3 style={{ fontSize:16, fontWeight:700, margin:0 }}>Perfil DISC</h3>
            <span style={css.tag(dI.color)}>{dominant[0]} — {dI.name}</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
            {["D","I","S","C"].map(p => { const inf=DISC_M[p], pct=(discScores[p]/DISC_QS.length)*100; return (
              <div key={p} style={{ textAlign:"center" }}>
                <div style={{ fontSize:28, marginBottom:4 }}>{inf.emoji}</div>
                <div style={{ fontFamily:MNO, fontSize:22, fontWeight:700, color:inf.color }}>{discScores[p]}</div>
                <div style={{ fontSize:11, fontWeight:600, color:"#78716c", marginBottom:8 }}>{inf.name}</div>
                <div style={{ height:6, background:"#f5f5f4", borderRadius:10, overflow:"hidden" }}><div style={{ height:"100%", width:`${pct}%`, background:inf.color, borderRadius:10 }} /></div>
              </div>
            ); })}
          </div>
          <div style={{ background:"#fafaf9", borderRadius:12, padding:20, border:"1px solid #e7e5e4" }}>
            <p style={{ fontSize:13, color:"#57534e", lineHeight:1.7, margin:"0 0 12px" }}>{dI.desc}</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>{dI.traits.map(t => <span key={t} style={css.tag(dI.color)}>{t}</span>)}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><div style={{ fontSize:11, fontWeight:700, color:"#10b981", marginBottom:4 }}>PONTOS FORTES</div><div style={{ fontSize:12, color:"#57534e", lineHeight:1.6 }}>{dI.str}</div></div>
              <div><div style={{ fontSize:11, fontWeight:700, color:"#f59e0b", marginBottom:4 }}>DESENVOLVIMENTO</div><div style={{ fontSize:12, color:"#57534e", lineHeight:1.6 }}>{dI.dev}</div></div>
            </div>
          </div>
        </div>

        {/* Behavioral Map */}
        <div style={{ ...css.card, marginBottom:24 }}>
          <h3 style={{ fontSize:16, fontWeight:700, margin:"0 0 20px" }}>Mapa Comportamental</h3>
          {Object.entries(bmAvgs).map(([dim, avg]) => { const pct=((avg-1)/6)*100; const q=BM_QS.find(q=>q.dim===dim); return (
            <div key={dim} style={{ marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:13, fontWeight:700 }}>{DIM_L[dim]}</span>
                <span style={{ fontFamily:MNO, fontSize:12, color:"#78716c" }}>{avg.toFixed(1)}/7</span>
              </div>
              <div style={{ position:"relative", height:8, background:"#f5f5f4", borderRadius:10 }}>
                <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${pct}%`, background:"#1c1917", borderRadius:10 }} />
                <div style={{ position:"absolute", top:"50%", left:`${pct}%`, transform:"translate(-50%,-50%)", width:16, height:16, borderRadius:"50%", background:"#1c1917", border:"3px solid #fff", boxShadow:"0 1px 4px rgba(0,0,0,0.15)" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                <span style={{ fontSize:10, color:"#a8a29e" }}>{q?.left}</span><span style={{ fontSize:10, color:"#a8a29e" }}>{q?.right}</span>
              </div>
            </div>
          ); })}
        </div>

        {/* EQ */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
          <div style={{ ...css.card, display:"flex", justifyContent:"center", alignItems:"center" }}>
            <svg width={rSz} height={rSz} viewBox={`0 0 ${rSz} ${rSz}`}>
              {[1,2,3,4,5].map(l => { const rv=(l/5)*rR; const pts=eqE.map((_,i)=>{const a=rAng*i-Math.PI/2;return`${rC+rv*Math.cos(a)},${rC+rv*Math.sin(a)}`;}).join(" "); return <polygon key={l} points={pts} fill="none" stroke={l===5?"#d6d3d1":"#f5f5f4"} strokeWidth={1}/>; })}
              <polygon points={eqE.map(([,avg],i)=>{const p=rPt(i,avg);return`${p.x},${p.y}`;}).join(" ")} fill="rgba(28,25,23,0.08)" stroke="#1c1917" strokeWidth={2}/>
              {eqE.map(([,avg],i)=>{const p=rPt(i,avg);return<circle key={i} cx={p.x} cy={p.y} r={4} fill="#1c1917" stroke="#fff" strokeWidth={2}/>;  })}
              {eqE.map(([k],i)=>{const lp=rPt(i,6.3);return<text key={k} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central" fill="#78716c" fontSize={9} fontWeight={600} fontFamily="Outfit">{EQ_L[k]}</text>;})}
            </svg>
          </div>
          <div style={css.card}>
            <h3 style={{ fontSize:16, fontWeight:700, margin:"0 0 4px" }}>Inteligência Emocional</h3>
            <div style={{ fontFamily:MNO, fontSize:36, fontWeight:700, marginBottom:16 }}>{eqOvr.toFixed(1)}<span style={{ fontSize:14, color:"#a8a29e" }}>/5.0</span></div>
            {Object.entries(eqAvgs).map(([k, avg]) => (
              <div key={k} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}><span style={{ fontSize:12, fontWeight:600, color:"#57534e" }}>{EQ_L[k]}</span><span style={{ fontFamily:MNO, fontSize:12, fontWeight:700 }}>{avg.toFixed(1)}</span></div>
                <div style={{ height:5, background:"#f5f5f4", borderRadius:10, overflow:"hidden" }}><div style={{ height:"100%", width:`${(avg/5)*100}%`, background:"#1c1917", borderRadius:10 }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div style={{ ...css.card, marginBottom:24 }}>
          <h3 style={{ fontSize:16, fontWeight:700, margin:"0 0 20px" }}>Valores e Motivadores</h3>
          {valData.map((v, i) => (
            <div key={v.cat} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <div style={{ width:24, fontFamily:MNO, fontSize:12, fontWeight:700, color:i<3?"#1c1917":"#a8a29e", textAlign:"center" }}>{i+1}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}><span style={{ fontSize:12, fontWeight:600, color:"#44403c" }}>{v.cat}</span><span style={{ fontFamily:MNO, fontSize:12, fontWeight:700, color:i<3?"#1c1917":"#a8a29e" }}>{v.score}/5</span></div>
                <div style={{ height:5, background:"#f5f5f4", borderRadius:10, overflow:"hidden" }}><div style={{ height:"100%", width:`${(v.score/5)*100}%`, background:i===0?"#1c1917":i===1?"#57534e":i===2?"#a8a29e":"#d6d3d1", borderRadius:10 }} /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Open */}
        {Object.values(r.openEnded).some(v => v) && (
          <div style={{ ...css.card, marginBottom:32 }}>
            <h3 style={{ fontSize:16, fontWeight:700, margin:"0 0 16px" }}>Respostas Abertas</h3>
            {OPEN_QS.filter(q => r.openEnded[q.key]).map(q => (
              <div key={q.key} style={{ padding:"14px 0", borderBottom:"1px solid #f5f5f4" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#78716c", marginBottom:6 }}>{q.text}</div>
                <div style={{ fontSize:13, color:"#44403c", lineHeight:1.7 }}>{r.openEnded[q.key]}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RESPONDENT FLOW (no login required)
// ═══════════════════════════════════════════════════════════════

function RespondentFlow({ assessmentData, assessmentId }) {
  const [step, setStep] = useState(0);
  const [discA, setDiscA] = useState({});
  const [discP, setDiscP] = useState(0);
  const [bmA, setBmA] = useState({});
  const [eqA, setEqA] = useState({});
  const [valA, setValA] = useState({});
  const [openA, setOpenA] = useState({ q1:"", q2:"", q3:"", q4:"" });
  const [totalSec, setTotalSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [secTimes, setSecTimes] = useState({});
  const [secStart, setSecStart] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { let iv; if (running) iv = setInterval(() => setTotalSec(s => s + 1), 1000); return () => clearInterval(iv); }, [running]);

  const progress = useMemo(() => {
    const total = DISC_QS.length + BM_QS.length + EQ_QS.length + VAL_QS.length + 4;
    const d = Object.keys(discA).length + Object.keys(bmA).length + Object.keys(eqA).length + Object.keys(valA).length + Object.values(openA).filter(v => v.length > 10).length;
    return Math.round((d / total) * 100);
  }, [discA, bmA, eqA, valA, openA]);

  const goStep = async (s) => {
    const keys = ["", "disc", "behavioral", "eq", "values", "open"];
    if (secStart && step > 0 && step < 6) {
      const el = Math.floor((Date.now() - secStart) / 1000);
      setSecTimes(p => ({ ...p, [keys[step]]: (p[keys[step]] || 0) + el }));
    }
    setStep(s);
    setSecStart(Date.now());
    if (s === 1 && !running) setRunning(true);
    if (s === 6) {
      setRunning(false);
      setSaving(true);
      const el = secStart ? Math.floor((Date.now() - secStart) / 1000) : 0;
      const fst = { ...secTimes, open: (secTimes.open || 0) + el };
      const results = { disc: discA, behavioral: bmA, eq: eqA, values: valA, openEnded: openA, totalSeconds: totalSec, sectionTimes: fst, completedAt: new Date().toISOString() };
      await db.set(assessmentId, { ...assessmentData, completed: true, results });
      setSaving(false);
      setDone(true);
    }
  };

  const TopBar = () => (
    <div style={{ borderBottom:"1px solid #e7e5e4", padding:"12px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#fff", position:"sticky", top:0, zIndex:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:28, height:28, borderRadius:7, background:"#1c1917", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700 }}>A</div>
        <span style={{ fontSize:13, fontWeight:600, color:"#78716c" }}>Assessment Comportamental</span>
      </div>
      {step > 0 && step < 6 && (
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:running?"#10b981":"#d6d3d1" }} />
            <span style={{ fontFamily:MNO, fontSize:12, color:"#78716c" }}>{fmtT(totalSec)}</span>
          </div>
          <div style={{ width:100, height:4, background:"#e7e5e4", borderRadius:10, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progress}%`, background:"#1c1917", borderRadius:10, transition:"width 0.4s" }} />
          </div>
          <span style={{ fontFamily:MNO, fontSize:12, fontWeight:600 }}>{progress}%</span>
        </div>
      )}
    </div>
  );

  const StepDots = () => {
    const st = [{ n:1, l:"Perfil" }, { n:2, l:"Mapa" }, { n:3, l:"IE" }, { n:4, l:"Valores" }, { n:5, l:"Abertas" }];
    return (
      <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:32 }}>
        {st.map(s => (
          <div key={s.n} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, fontFamily:MNO, background:step===s.n?"#1c1917":step>s.n?"#10b981":"#e7e5e4", color:step>=s.n?"#fff":"#a8a29e", transition:"all 0.3s" }}>{step > s.n ? "✓" : s.n}</div>
            <span style={{ fontSize:11, fontWeight:600, color:step===s.n?"#1c1917":"#a8a29e", marginRight:8 }}>{s.l}</span>
            {s.n < 5 && <div style={{ width:24, height:1, background:"#e7e5e4" }} />}
          </div>
        ))}
      </div>
    );
  };

  // Done
  if (done) return (
    <div style={{ ...css.page, display:"flex", alignItems:"center", justifyContent:"center" }}><FontLink/>
      <div style={{ ...css.card, maxWidth:480, textAlign:"center", padding:48, margin:24 }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:28 }}>✓</div>
        <h2 style={{ fontSize:24, fontWeight:700, margin:"0 0 8px" }}>Assessment enviado!</h2>
        <p style={{ fontSize:14, color:"#78716c", lineHeight:1.7, margin:0 }}>Suas respostas foram registradas com sucesso. Obrigado por participar.</p>
        <div style={{ marginTop:20, padding:16, background:"#fafaf9", borderRadius:12, border:"1px solid #e7e5e4" }}>
          <div style={{ fontSize:12, color:"#a8a29e", marginBottom:4 }}>Tempo total</div>
          <div style={{ fontFamily:MNO, fontSize:22, fontWeight:700 }}>{fmtT(totalSec)}</div>
        </div>
      </div>
    </div>
  );

  if (saving) return <Spin text="Salvando respostas..." />;

  // Welcome
  if (step === 0) return (
    <div style={css.page}><FontLink/><TopBar/>
      <div style={{ maxWidth:520, margin:"0 auto", padding:"60px 24px" }}>
        <div style={{ ...css.card, textAlign:"center", padding:40 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>👋</div>
          <h1 style={{ fontSize:26, fontWeight:700, margin:"0 0 8px" }}>Olá, {assessmentData?.targetName}!</h1>
          <p style={{ fontSize:14, color:"#78716c", lineHeight:1.7, marginBottom:24 }}>Este é seu assessment comportamental. São 5 etapas rápidas. Responda com honestidade — não há respostas certas ou erradas.</p>
          <div style={{ fontSize:12, color:"#a8a29e", marginBottom:24, padding:"10px 16px", background:"#fafaf9", borderRadius:8, border:"1px solid #e7e5e4" }}>⏱ O tempo de resposta será registrado automaticamente.</div>
          <button style={{ ...css.btn(true), width:"100%", fontSize:16, padding:"16px 32px" }} onClick={() => goStep(1)}>Iniciar</button>
        </div>
      </div>
    </div>
  );

  // DISC
  if (step === 1) {
    const pp=4, tp=Math.ceil(DISC_QS.length/pp), pq=DISC_QS.slice(discP*pp,(discP+1)*pp);
    return (
      <div style={css.page}><FontLink/><TopBar/>
        <div style={{ maxWidth:640, margin:"0 auto", padding:"32px 24px" }}><StepDots/>
          <div style={{ marginBottom:24 }}><h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 4px" }}>Perfil Comportamental</h2><p style={{ fontSize:13, color:"#78716c", margin:0 }}>Selecione a alternativa que mais combina com você. Página {discP+1}/{tp}.</p></div>
          {pq.map(q => (
            <div key={q.id} style={{ ...css.card, marginBottom:12, padding:22 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:14, lineHeight:1.5 }}><span style={{ fontFamily:MNO, color:"#a8a29e", marginRight:8, fontSize:12 }}>{String(q.id).padStart(2,"0")}</span>{q.text}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {q.opts.map((o,i) => { const sel=discA[q.id]===o.p; return <button key={i} onClick={() => setDiscA(p=>({...p,[q.id]:o.p}))} style={{ background:sel?"#1c1917":"#fafaf9", border:`1.5px solid ${sel?"#1c1917":"#e7e5e4"}`, borderRadius:10, padding:"12px 16px", cursor:"pointer", textAlign:"left", fontFamily:FNT, fontSize:13, fontWeight:sel?600:400, color:sel?"#fff":"#57534e", transition:"all 0.2s" }}>{o.l}</button>; })}
              </div>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:20 }}>
            <button style={css.btn(false)} onClick={() => discP>0&&setDiscP(p=>p-1)} disabled={discP===0}>← Anterior</button>
            {discP<tp-1 ? <button style={css.btn(true)} onClick={() => setDiscP(p=>p+1)}>Próxima →</button> : <button style={css.btn(true)} onClick={() => goStep(2)}>Continuar →</button>}
          </div>
        </div>
      </div>
    );
  }

  // Behavioral
  if (step === 2) return (
    <div style={css.page}><FontLink/><TopBar/>
      <div style={{ maxWidth:640, margin:"0 auto", padding:"32px 24px" }}><StepDots/>
        <div style={{ marginBottom:24 }}><h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 4px" }}>Mapa Comportamental</h2><p style={{ fontSize:13, color:"#78716c", margin:0 }}>Escolha o ponto da escala que melhor representa você.</p></div>
        {BM_QS.map(q => (
          <div key={q.id} style={{ ...css.card, marginBottom:12, padding:22 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:14, lineHeight:1.5 }}>{q.text}</div>
            <div style={{ display:"flex", gap:6 }}>
              {[1,2,3,4,5,6,7].map(v => { const sel=bmA[q.id]===v; return <button key={v} onClick={() => setBmA(p=>({...p,[q.id]:v}))} style={{ flex:1, height:40, borderRadius:8, cursor:"pointer", fontFamily:MNO, background:sel?"#1c1917":"#fafaf9", border:`1.5px solid ${sel?"#1c1917":"#e7e5e4"}`, color:sel?"#fff":"#a8a29e", fontSize:13, fontWeight:700, transition:"all 0.15s" }}>{v}</button>; })}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
              <span style={{ fontSize:10, color:"#a8a29e" }}>{q.left}</span><span style={{ fontSize:10, color:"#a8a29e" }}>{q.right}</span>
            </div>
          </div>
        ))}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:20 }}>
          <button style={css.btn(false)} onClick={() => goStep(1)}>← Anterior</button>
          <button style={css.btn(true)} onClick={() => goStep(3)}>Continuar →</button>
        </div>
      </div>
    </div>
  );

  // EQ
  if (step === 3) return (
    <div style={css.page}><FontLink/><TopBar/>
      <div style={{ maxWidth:640, margin:"0 auto", padding:"32px 24px" }}><StepDots/>
        <div style={{ marginBottom:24 }}><h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 4px" }}>Inteligência Emocional</h2><p style={{ fontSize:13, color:"#78716c", margin:0 }}>Avalie o quanto cada afirmação representa você.</p></div>
        <div style={css.card}>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:12, marginBottom:16, paddingBottom:12, borderBottom:"1px solid #f5f5f4" }}>
            {["Discordo totalmente","Discordo","Neutro","Concordo","Concordo totalmente"].map((l,i) => <div key={i} style={{ textAlign:"center", width:40 }}><div style={{ fontFamily:MNO, fontSize:12, fontWeight:700, marginBottom:2 }}>{i+1}</div><div style={{ fontSize:8, color:"#a8a29e", lineHeight:1.2 }}>{l}</div></div>)}
          </div>
          {EQ_QS.map((q, i) => (
            <div key={q.id} style={{ padding:"14px 0", borderBottom:i<EQ_QS.length-1?"1px solid #f5f5f4":"none", display:"flex", justifyContent:"space-between", alignItems:"center", gap:20 }}>
              <div style={{ flex:1, fontSize:13, fontWeight:500, color:"#44403c", lineHeight:1.5 }}>{q.text}</div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                {[1,2,3,4,5].map(v => { const sel=eqA[q.id]===v; return <button key={v} onClick={() => setEqA(p=>({...p,[q.id]:v}))} style={{ width:40, height:36, borderRadius:8, cursor:"pointer", background:sel?"#1c1917":"#fafaf9", border:`1.5px solid ${sel?"#1c1917":"#e7e5e4"}`, color:sel?"#fff":"#a8a29e", fontSize:13, fontWeight:700, fontFamily:MNO, transition:"all 0.15s" }}>{v}</button>; })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:20 }}>
          <button style={css.btn(false)} onClick={() => goStep(2)}>← Anterior</button>
          <button style={css.btn(true)} onClick={() => goStep(4)}>Continuar →</button>
        </div>
      </div>
    </div>
  );

  // Values
  if (step === 4) return (
    <div style={css.page}><FontLink/><TopBar/>
      <div style={{ maxWidth:640, margin:"0 auto", padding:"32px 24px" }}><StepDots/>
        <div style={{ marginBottom:24 }}><h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 4px" }}>Valores e Motivadores</h2><p style={{ fontSize:13, color:"#78716c", margin:0 }}>Avalie de 1 a 5 o quanto cada item é importante para você.</p></div>
        <div style={css.card}>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:12, paddingBottom:12, borderBottom:"1px solid #f5f5f4" }}>
            {["Pouco","","Moderado","","Muito"].map((l,i) => <div key={i} style={{ textAlign:"center", width:36 }}><div style={{ fontFamily:MNO, fontSize:12, fontWeight:700 }}>{i+1}</div>{l && <div style={{ fontSize:7, color:"#a8a29e" }}>{l}</div>}</div>)}
          </div>
          {VAL_QS.map((v, i) => (
            <div key={v.id} style={{ padding:"14px 0", borderBottom:i<VAL_QS.length-1?"1px solid #f5f5f4":"none", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16 }}>
              <div style={{ flex:1, fontSize:13, fontWeight:500, color:"#44403c" }}>{v.text}</div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                {[1,2,3,4,5].map(val => { const sel=valA[v.id]===val; return <button key={val} onClick={() => setValA(p=>({...p,[v.id]:val}))} style={{ width:36, height:36, borderRadius:8, cursor:"pointer", background:sel?"#1c1917":"#fafaf9", border:`1.5px solid ${sel?"#1c1917":"#e7e5e4"}`, color:sel?"#fff":"#a8a29e", fontSize:13, fontWeight:700, fontFamily:MNO, transition:"all 0.15s" }}>{val}</button>; })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:20 }}>
          <button style={css.btn(false)} onClick={() => goStep(3)}>← Anterior</button>
          <button style={css.btn(true)} onClick={() => goStep(5)}>Continuar →</button>
        </div>
      </div>
    </div>
  );

  // Open
  if (step === 5) return (
    <div style={css.page}><FontLink/><TopBar/>
      <div style={{ maxWidth:640, margin:"0 auto", padding:"32px 24px" }}><StepDots/>
        <div style={{ marginBottom:24 }}><h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 4px" }}>Perguntas Abertas</h2><p style={{ fontSize:13, color:"#78716c", margin:0 }}>Responda com suas próprias palavras.</p></div>
        {OPEN_QS.map(q => (
          <div key={q.key} style={{ ...css.card, marginBottom:12, padding:22 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:12, lineHeight:1.5 }}>{q.text}</div>
            <textarea style={{ ...css.inp, minHeight:90, resize:"vertical" }} value={openA[q.key]} onChange={e => setOpenA(p=>({...p,[q.key]:e.target.value}))} placeholder="Sua resposta..." />
          </div>
        ))}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:20 }}>
          <button style={css.btn(false)} onClick={() => goStep(4)}>← Anterior</button>
          <button style={css.btn(true)} onClick={() => goStep(6)}>Enviar Assessment ✓</button>
        </div>
      </div>
    </div>
  );

  return <Spin text="Carregando..." />;
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP — Router
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [authState, setAuthState] = useState("loading"); // loading | login | admin
  const [user, setUser] = useState(null);
  const [respondData, setRespondData] = useState(null);
  const [respondId, setRespondId] = useState(null);
  const [isRespondent, setIsRespondent] = useState(false);
  const [respondError, setRespondError] = useState(null);

  useEffect(() => {
    // Check if this is a respondent link FIRST
    const hash = window.location.hash.replace("#", "");
    if (hash.startsWith("respond-")) {
      setIsRespondent(true);
      const id = hash.replace("respond-", "");
      setRespondId(id);
      // Load assessment data
      (async () => {
        const data = await db.get(id);
        if (data && !data.completed) {
          setRespondData(data);
        } else if (data && data.completed) {
          setRespondError("already_done");
        } else {
          setRespondError("not_found");
        }
      })();
      return;
    }

    // Admin flow: listen for auth changes
    const unsub = authHelper.onAuthChange((u) => {
      if (u) {
        setUser(u);
        setAuthState("admin");
      } else {
        setUser(null);
        setAuthState("login");
      }
    });
    return () => unsub();
  }, []);

  // ─── Respondent flow (no auth needed) ───
  if (isRespondent) {
    if (respondError === "already_done") return (
      <div style={{ ...css.page, display:"flex", alignItems:"center", justifyContent:"center" }}><FontLink/>
        <div style={{ ...css.card, maxWidth:420, textAlign:"center", padding:40, margin:24 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 8px" }}>Assessment já respondido</h2>
          <p style={{ fontSize:14, color:"#78716c", margin:0 }}>Este assessment já foi preenchido anteriormente.</p>
        </div>
      </div>
    );
    if (respondError === "not_found") return (
      <div style={{ ...css.page, display:"flex", alignItems:"center", justifyContent:"center" }}><FontLink/>
        <div style={{ ...css.card, maxWidth:420, textAlign:"center", padding:40, margin:24 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 8px" }}>Assessment não encontrado</h2>
          <p style={{ fontSize:14, color:"#78716c", margin:0 }}>O link pode estar incorreto ou o assessment foi removido.</p>
        </div>
      </div>
    );
    if (!respondData) return <Spin text="Carregando assessment..." />;
    return <RespondentFlow assessmentData={respondData} assessmentId={respondId} />;
  }

  // ─── Admin flow ───
  if (authState === "loading") return <Spin text="Verificando autenticação..." />;
  if (authState === "login") return <LoginScreen />;
  if (authState === "admin" && user) return <AdminPanel user={user} />;

  return <Spin />;
}
