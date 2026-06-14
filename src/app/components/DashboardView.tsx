import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import { useEffect, useState } from "react";
import { Users, CheckCircle2, Clock, XCircle, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

/* ── helpers ── */
const statusBadge = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    Validated: { bg: "var(--emerald-muted)", color: "var(--emerald)" },
    Pending:   { bg: "var(--amber-muted)",   color: "var(--amber)"   },
    Rejected:  { bg: "var(--rose-muted)",    color: "var(--rose)"    },
  };
  const s = map[status] ?? { bg: "var(--secondary)", color: "var(--muted-foreground)" };
  return (
    <span className="px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color, fontSize: "0.75rem" }}>
      {status}
    </span>
  );
};

const tooltipStyle = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid rgba(15,23,42,0.09)",
    borderRadius: 8,
    color: "#0f172a",
    fontSize: "0.8125rem",
    boxShadow: "0 4px 24px rgba(15,23,42,0.08)",
  },
};

/* ── card wrapper ── */
function Card({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{ background: "#ffffff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)", ...style }}
    >
      {children}
    </div>
  );
}

/* ── custom bar shape with radius ── */
function RoundedBar(props: any) {
  const { x, y, width, height } = props;
  const r = 4;
  return (
    <path
      d={`M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`}
      fill="#2563eb"
      fillOpacity={0.85}
    />
  );
}

export function DashboardView() {
  // 1. Déclaration de l'état pour accueillir les données de la BD
  const [dashboardData, setDashboardData] = useState<{
    kpis: { total: number; validated: number; pending: number; rejected: number };
    pieData: Array<{ name: string; value: number; color: string }>;
    lineData: Array<{ month: string; count: number }>;
    countryData: Array<{ country: string; senders: number }>;
    operatorData: Array<{ operator: string; count: number }>;
    recentActivities: Array<{ name: string; country: string; operator: string; status: string; date: string }>;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  // 2. Récupération des données réelles depuis votre API Node/Express
  useEffect(() => {
    fetch("http://localhost:3000/api/dashboard/stats") // Note: corrigé de dashboard-stats à dashboard/stats
      .then((res) => res.json())
      .then((data) => {
        setDashboardData({
          kpis: {
            total: data.kpiCards[0].value,
            validated: data.kpiCards[1].value,
            pending: data.kpiCards[2].value,
            rejected: data.kpiCards[3].value
          },
          pieData: data.pieData,
          lineData: [
            { month: "Jan", count: 72  }, { month: "Fév", count: 95  }, { month: "Mar", count: 118 },
            { month: "Avr", count: 88  }, { month: "Mai", count: 143 }, { month: "Jun", count: 167 },
            { month: "Jul", count: 201 }, { month: "Aoû", count: 189 }, { month: "Sep", count: 224 },
            { month: "Oct", count: 198 }, { month: "Nov", count: 241 }, { month: "Déc", count: 260 },
          ],
          countryData: data.countryData,
          operatorData: data.operatorData,
          recentActivities: data.recentActivities
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur de chargement du dashboard :", err);
        setLoading(false);
      });
  }, []);

  // 3. Écran de chargement en attente de la BD
  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
          Chargement des données en temps réel...
        </p>
      </div>
    );
  }

  // Extraction des données
  const { kpis, pieData, lineData, countryData, operatorData, recentActivities } = dashboardData;

  // KPI Cards dynamiques
  const dynamicKpiCards = [
    { label: "Total Senders", value: kpis.total.toLocaleString(), delta: "+12%", up: true, icon: Users, accent: "#2563eb", bg: "#eff6ff", iconColor: "#2563eb" },
    { label: "Validés", value: kpis.validated.toLocaleString(), delta: "+8%", up: true, icon: CheckCircle2, accent: "#059669", bg: "#ecfdf5", iconColor: "#059669" },
    { label: "En attente", value: kpis.pending.toLocaleString(), delta: "+3%", up: true, icon: Clock, accent: "#d97706", bg: "#fffbeb", iconColor: "#d97706" },
    { label: "Rejetés", value: kpis.rejected.toLocaleString(), delta: "-2%", up: false, icon: XCircle, accent: "#e11d48", bg: "#fff1f2", iconColor: "#e11d48" },
  ];

  return (
    <div className="flex flex-col gap-5 p-6 overflow-auto h-full" style={{ background: "var(--background)" }}>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {dynamicKpiCards.map(({ label, value, delta, up, icon: Icon, accent, bg, iconColor }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon size={18} style={{ color: iconColor }} strokeWidth={2} />
              </div>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  background: up ? "var(--emerald-muted)" : "var(--rose-muted)",
                  color: up ? "var(--emerald)" : "var(--rose)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {delta}
              </span>
            </div>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>{label}</p>
            <p style={{ color: "var(--foreground)", fontWeight: 800, fontSize: "1.75rem", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{value}</p>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", marginTop: 4 }}>vs mois précédent</p>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pie */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Distribution des statuts</p>
            <button className="flex items-center gap-1 text-xs" style={{ color: "var(--primary)", fontWeight: 600 }}>Détails <ArrowRight size={11} /></button>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={88} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.8125rem", color: "#64748b" }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Line */}
        {/* <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Évolution mensuelle</p>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--blue-muted)", color: "var(--primary)" }}>2025</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={lineData}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card> */}
        <Card className="p-5">
  <div className="flex items-center justify-between mb-4">
    <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Évolution mensuelle</p>
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--blue-muted)", color: "var(--primary)" }}>2026</span>
  </div>
  <ResponsiveContainer width="100%" height={210}>
    {/* Remplacement par AreaChart pour pouvoir remplir le dessous de la courbe */}
    <AreaChart data={dashboardData.lineData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
      <defs>
        {/* Amélioration du dégradé : plus doux et plus moderne */}
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.003} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.04)" vertical={false} />
      <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
      <Tooltip {...tooltipStyle} />
      
      {/* L'Area gère à la fois le contour (stroke) et le remplissage dégradé (fill) */}
      <Area 
        type="monotone" 
        dataKey="count" 
        stroke="#3b82f6" 
        strokeWidth={2.5} 
        fill="url(#lineGrad)" 
        dot={false} 
        activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} 
      />
    </AreaChart>
  </ResponsiveContainer>
</Card>

        {/* Bar - Countries */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Top Pays</p>
            <button className="flex items-center gap-1 text-xs" style={{ color: "var(--primary)", fontWeight: 600 }}>Voir tout <ArrowRight size={11} /></button>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={countryData.slice(0, 7)} barSize={22}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.05)" vertical={false} />
              <XAxis dataKey="country" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="senders" shape={<RoundedBar />} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Horizontal bars - Operators */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Top Opérateurs</p>
            <span style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>Par volume de senders</span>
          </div>
          <div className="flex flex-col gap-4">
            {operatorData.slice(0, 5).map(({ operator, count }, i) => {
              const pct = Math.round((count / operatorData[0]?.count || 1) * 100);
              // const colors = ["#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#6366f1", "#64748b"];
              const colors = ["#2563eb", "#10b981", // vert émeraude
  "#f59e0b", 
  "#8b5cf6",
  "#ec4899", // rouge doux
  "#64748b", // turquoise
];
              return (
                <div key={operator}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ color: "var(--foreground)", fontSize: "0.8125rem", fontWeight: 500 }}>{operator}</span>
                    <span style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem", fontFamily: "monospace" }}>{count}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: colors[i] ?? "#2563eb" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Activités récentes</p>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "var(--accent)", color: "var(--primary)" }}>
            Voir tout <ArrowRight size={11} />
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#d9e9fd", borderBottom: "1px solid var(--border)" }}>
              {["Sender Name", "Pays", "Opérateur", "Statut", "Date"].map((h) => (
                <th key={h} className="px-5 py-3 text-left" style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentActivities.slice(0, 5).map((row, i) => (
              <tr
                key={i}
                className="transition-colors cursor-pointer"
                style={{ borderBottom: i < recentActivities.length - 1 ? "1px solid var(--border)" : "none" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
              >
                <td className="px-5 py-3.5">
                  <span style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "0.875rem", fontFamily: "monospace" }}>{row.name}</span>
                </td>
                <td className="px-5 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.country}</td>
                <td className="px-5 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.operator}</td>
                <td className="px-5 py-3.5">{statusBadge(row.status)}</td>
                <td className="px-5 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
// import {
//   PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
// } from "recharts";
// import { useEffect, useState } from "react";
// import { Users, CheckCircle2, Clock, XCircle, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

// /* ── helpers ── */
// const statusBadge = (status: string) => {
//   const map: Record<string, { bg: string; color: string }> = {
//     Validated: { bg: "var(--emerald-muted)", color: "var(--emerald)" },
//     Pending:   { bg: "var(--amber-muted)",   color: "var(--amber)"   },
//     Rejected:  { bg: "var(--rose-muted)",    color: "var(--rose)"    },
//   };
//   const s = map[status] ?? { bg: "var(--secondary)", color: "var(--muted-foreground)" };
//   return (
//     <span className="px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color, fontSize: "0.75rem" }}>
//       {status}
//     </span>
//   );
// };

// const tooltipStyle = {
//   contentStyle: {
//     background: "#ffffff",
//     border: "1px solid rgba(15,23,42,0.09)",
//     borderRadius: 8,
//     color: "#0f172a",
//     fontSize: "0.8125rem",
//     boxShadow: "0 4px 24px rgba(15,23,42,0.08)",
//   },
// };

// /* ── data ── */
// // const kpiCards = [
// //   { label: "Total Senders",     value: "1 248", delta: "+12%", up: true,  icon: Users,        accent: "#2563eb", bg: "#eff6ff", iconColor: "#2563eb" },
// //   { label: "Validés",           value: "892",   delta: "+8%",  up: true,  icon: CheckCircle2, accent: "#059669", bg: "#ecfdf5", iconColor: "#059669" },
// //   { label: "En attente",        value: "234",   delta: "+3%",  up: true,  icon: Clock,        accent: "#d97706", bg: "#fffbeb", iconColor: "#d97706" },
// //   { label: "Rejetés",           value: "122",   delta: "-2%",  up: false, icon: XCircle,      accent: "#e11d48", bg: "#fff1f2", iconColor: "#e11d48" },
// // ];

// // const pieData = [
// //   { name: "Validés",    value: 892, color: "#059669" },
// //   { name: "En attente", value: 234, color: "#d97706" },
// //   { name: "Rejetés",    value: 122, color: "#e11d48" },
// // ];

// // const lineData = [
// //   { month: "Jan", count: 72  }, { month: "Fév", count: 95  }, { month: "Mar", count: 118 },
// //   { month: "Avr", count: 88  }, { month: "Mai", count: 143 }, { month: "Jun", count: 167 },
// //   { month: "Jul", count: 201 }, { month: "Aoû", count: 189 }, { month: "Sep", count: 224 },
// //   { month: "Oct", count: 198 }, { month: "Nov", count: 241 }, { month: "Déc", count: 260 },
// // ];
// export function DashboardView() {
//   // 1. Déclaration de l'état pour accueillir les données de la BD
//   const [dashboardData, setDashboardData] = useState<{
//     kpis: { total: number; validated: number; pending: number; rejected: number };
//     pieData: Array<{ name: string; value: number; color: string }>;
//     lineData: Array<{ month: string; count: number }>;
//     countryData: Array<{ country: string; senders: number }>;
//     operatorData: Array<{ operator: string; count: number }>;
//     recentActivities: Array<{ name: string; country: string; operator: string; status: string; date: string }>;
//   } | null>(null);

//   const [loading, setLoading] = useState(true);

//   // 2. Récupération des données réelles depuis votre API Node/Express
//   useEffect(() => {
//     fetch("http://localhost:3000/api/dashboard-stats") // Votre endpoint backend
//       .then((res) => res.json())
//       .then((data) => {
//         setDashboardData(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Erreur de chargement du dashboard :", err);
//         setLoading(false);
//       });
//   }, []);

//   // 3. Écran de chargement en attente de la BD
//   if (loading || !dashboardData) {
//     return (
//       <div className="flex items-center justify-center h-full w-full">
//         <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
//           Chargement des données en temps réel...
//         </p>
//       </div>
//     );
//   }

//   // 4. Reconstruction à la volée des KPI Cards avec les icônes
//   const dynamicKpiCards = [
//     { label: "Total Senders", value: dashboardData.kpis.total.toLocaleString(), delta: "+12%", up: true, icon: Users, accent: "#2563eb", bg: "#eff6ff", iconColor: "#2563eb" },
//     { label: "Validés", value: dashboardData.kpis.validated.toLocaleString(), delta: "+8%", up: true, icon: CheckCircle2, accent: "#059669", bg: "#ecfdf5", iconColor: "#059669" },
//     { label: "En attente", value: dashboardData.kpis.pending.toLocaleString(), delta: "+3%", up: true, icon: Clock, accent: "#d97706", bg: "#fffbeb", iconColor: "#d97706" },
//     { label: "Rejetés", value: dashboardData.kpis.rejected.toLocaleString(), delta: "-2%", up: false, icon: XCircle, accent: "#e11d48", bg: "#fff1f2", iconColor: "#e11d48" },
//   ];

// // const countryData = [
// //   { country: "Côte d'Ivoire", senders: 312 },
// //   { country: "Ghana",         senders: 248 },
// //   { country: "Sénégal",       senders: 187 },
// //   { country: "Nigeria",       senders: 164 },
// //   { country: "Mali",          senders: 98  },
// //   { country: "Burkina",       senders: 76  },
// // ];

// // const operatorData = [
// //   { operator: "Orange CI",      count: 198 },
// //   { operator: "MTN Ghana",      count: 167 },
// //   { operator: "Free Sénégal",   count: 143 },
// //   { operator: "Airtel Nigeria", count: 121 },
// //   { operator: "Moov Africa",    count: 89  },
// //   { operator: "Telecel",        count: 72  },
// // ];

// // const recentActivities = [
// //   { name: "ORANGE_PROMO",  country: "Côte d'Ivoire", operator: "Orange CI",      status: "Validated", date: "14 jan. 2025" },
// //   { name: "MTN_ALERT",     country: "Ghana",          operator: "MTN Ghana",      status: "Pending",   date: "14 jan. 2025" },
// //   { name: "FREE_INFO",     country: "Sénégal",        operator: "Free Sénégal",   status: "Validated", date: "13 jan. 2025" },
// //   { name: "AIRTEL_MKT",   country: "Nigeria",         operator: "Airtel Nigeria", status: "Rejected",  date: "13 jan. 2025" },
// //   { name: "MOOV_SVC",     country: "Burkina Faso",    operator: "Moov Africa BF", status: "Pending",   date: "12 jan. 2025" },
// //   { name: "TELECEL_OTP",  country: "Ghana",            operator: "Telecel",        status: "Validated", date: "12 jan. 2025" },
// //   { name: "WAVE_PAY",     country: "Sénégal",          operator: "Orange Sénégal", status: "Validated", date: "11 jan. 2025" },
// // ];

// /* ── card wrapper ── */
// function Card({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
//   return (
//     <div
//       className={`rounded-xl ${className}`}
//       style={{ background: "#ffffff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)", ...style }}
//     >
//       {children}
//     </div>
//   );
// }

// /* ── custom bar shape with radius ── */
// function RoundedBar(props: any) {
//   const { x, y, width, height } = props;
//   const r = 4;
//   return (
//     <path
//       d={`M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`}
//       fill="#2563eb"
//       fillOpacity={0.85}
//     />
//   );
// }

// export function DashboardView() {
//   return (
//     <div className="flex flex-col gap-5 p-6 overflow-auto h-full" style={{ background: "var(--background)" }}>

//       {/* KPI row */}
//       <div className="grid grid-cols-4 gap-4">
//         {kpiCards.map(({ label, value, delta, up, icon: Icon, accent, bg, iconColor }) => (
//           <Card key={label} className="p-5">
//             <div className="flex items-start justify-between mb-4">
//               <div
//                 className="w-10 h-10 rounded-xl flex items-center justify-center"
//                 style={{ background: bg }}
//               >
//                 <Icon size={18} style={{ color: iconColor }} strokeWidth={2} />
//               </div>
//               <span
//                 className="flex items-center gap-1 px-2 py-0.5 rounded-full"
//                 style={{
//                   background: up ? "var(--emerald-muted)" : "var(--rose-muted)",
//                   color: up ? "var(--emerald)" : "var(--rose)",
//                   fontSize: "0.75rem",
//                   fontWeight: 600,
//                 }}
//               >
//                 {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
//                 {delta}
//               </span>
//             </div>
//             <p style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>{label}</p>
//             <p style={{ color: "var(--foreground)", fontWeight: 800, fontSize: "1.75rem", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{value}</p>
//             <p style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", marginTop: 4 }}>vs mois précédent</p>
//           </Card>
//         ))}
//       </div>

//       {/* Charts grid */}
//       <div className="grid grid-cols-2 gap-4">
//         {/* Pie */}
//         <Card className="p-5">
//           <div className="flex items-center justify-between mb-4">
//             <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Distribution des statuts</p>
//             <button className="flex items-center gap-1 text-xs" style={{ color: "var(--primary)", fontWeight: 600 }}>Détails <ArrowRight size={11} /></button>
//           </div>
//           <ResponsiveContainer width="100%" height={210}>
//             <PieChart>
//               <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={88} paddingAngle={3} dataKey="value">
//                 {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//               </Pie>
//               <Tooltip {...tooltipStyle} />
//               <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.8125rem", color: "#64748b" }} />
//             </PieChart>
//           </ResponsiveContainer>
//         </Card>

//         {/* Line */}
//         <Card className="p-5">
//           <div className="flex items-center justify-between mb-4">
//             <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Évolution mensuelle</p>
//             <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--blue-muted)", color: "var(--primary)" }}>2025</span>
//           </div>
//           <ResponsiveContainer width="100%" height={210}>
//             <LineChart data={lineData}>
//               <defs>
//                 <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
//                   <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.05)" />
//               <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
//               <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
//               <Tooltip {...tooltipStyle} />
//               <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} />
//             </LineChart>
//           </ResponsiveContainer>
//         </Card>

//         {/* Bar - Countries */}
//         <Card className="p-5">
//           <div className="flex items-center justify-between mb-4">
//             <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Top Pays</p>
//             <button className="flex items-center gap-1 text-xs" style={{ color: "var(--primary)", fontWeight: 600 }}>Voir tout <ArrowRight size={11} /></button>
//           </div>
//           <ResponsiveContainer width="100%" height={210}>
//             <BarChart data={countryData} barSize={22}>
//               <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.05)" vertical={false} />
//               <XAxis dataKey="country" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
//               <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
//               <Tooltip {...tooltipStyle} />
//               <Bar dataKey="senders" shape={<RoundedBar />} />
//             </BarChart>
//           </ResponsiveContainer>
//         </Card>

//         {/* Horizontal bars - Operators */}
//         <Card className="p-5">
//           <div className="flex items-center justify-between mb-5">
//             <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Top Opérateurs</p>
//             <span style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>Par volume de senders</span>
//           </div>
//           <div className="flex flex-col gap-4">
//             {operatorData.map(({ operator, count }, i) => {
//               const pct = Math.round((count / operatorData[0].count) * 100);
//               const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];
//               return (
//                 <div key={operator}>
//                   <div className="flex items-center justify-between mb-1.5">
//                     <span style={{ color: "var(--foreground)", fontSize: "0.8125rem", fontWeight: 500 }}>{operator}</span>
//                     <span style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem", fontFamily: "monospace" }}>{count}</span>
//                   </div>
//                   <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
//                     <div
//                       className="h-full rounded-full transition-all"
//                       style={{ width: `${pct}%`, background: colors[i] ?? "#2563eb" }}
//                     />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>
//       </div>

//       {/* Recent Activities */}
//       <Card>
//         <div
//           className="px-5 py-4 flex items-center justify-between"
//           style={{ borderBottom: "1px solid var(--border)" }}
//         >
//           <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Activités récentes</p>
//           <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "var(--accent)", color: "var(--primary)" }}>
//             Voir tout <ArrowRight size={11} />
//           </button>
//         </div>
//         <table className="w-full">
//           <thead>
//             <tr style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}>
//               {["Sender Name", "Pays", "Opérateur", "Statut", "Date"].map((h) => (
//                 <th key={h} className="px-5 py-3 text-left" style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {recentActivities.map((row, i) => (
//               <tr
//                 key={i}
//                 className="transition-colors cursor-pointer"
//                 style={{ borderBottom: i < recentActivities.length - 1 ? "1px solid var(--border)" : "none" }}
//                 onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc")}
//                 onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
//               >
//                 <td className="px-5 py-3.5">
//                   <span style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "0.875rem", fontFamily: "monospace" }}>{row.name}</span>
//                 </td>
//                 <td className="px-5 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.country}</td>
//                 <td className="px-5 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.operator}</td>
//                 <td className="px-5 py-3.5">{statusBadge(row.status)}</td>
//                 <td className="px-5 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.date}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </Card>
//     </div>
//   );
// }
