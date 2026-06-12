import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
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

/* ── data ── */
const kpiCards = [
  { label: "Total Senders",     value: "1 248", delta: "+12%", up: true,  icon: Users,        accent: "#2563eb", bg: "#eff6ff", iconColor: "#2563eb" },
  { label: "Validés",           value: "892",   delta: "+8%",  up: true,  icon: CheckCircle2, accent: "#059669", bg: "#ecfdf5", iconColor: "#059669" },
  { label: "En attente",        value: "234",   delta: "+3%",  up: true,  icon: Clock,        accent: "#d97706", bg: "#fffbeb", iconColor: "#d97706" },
  { label: "Rejetés",           value: "122",   delta: "-2%",  up: false, icon: XCircle,      accent: "#e11d48", bg: "#fff1f2", iconColor: "#e11d48" },
];

const pieData = [
  { name: "Validés",    value: 892, color: "#059669" },
  { name: "En attente", value: 234, color: "#d97706" },
  { name: "Rejetés",    value: 122, color: "#e11d48" },
];

const lineData = [
  { month: "Jan", count: 72  }, { month: "Fév", count: 95  }, { month: "Mar", count: 118 },
  { month: "Avr", count: 88  }, { month: "Mai", count: 143 }, { month: "Jun", count: 167 },
  { month: "Jul", count: 201 }, { month: "Aoû", count: 189 }, { month: "Sep", count: 224 },
  { month: "Oct", count: 198 }, { month: "Nov", count: 241 }, { month: "Déc", count: 260 },
];

const countryData = [
  { country: "Côte d'Ivoire", senders: 312 },
  { country: "Ghana",         senders: 248 },
  { country: "Sénégal",       senders: 187 },
  { country: "Nigeria",       senders: 164 },
  { country: "Mali",          senders: 98  },
  { country: "Burkina",       senders: 76  },
];

const operatorData = [
  { operator: "Orange CI",      count: 198 },
  { operator: "MTN Ghana",      count: 167 },
  { operator: "Free Sénégal",   count: 143 },
  { operator: "Airtel Nigeria", count: 121 },
  { operator: "Moov Africa",    count: 89  },
  { operator: "Telecel",        count: 72  },
];

const recentActivities = [
  { name: "ORANGE_PROMO",  country: "Côte d'Ivoire", operator: "Orange CI",      status: "Validated", date: "14 jan. 2025" },
  { name: "MTN_ALERT",     country: "Ghana",          operator: "MTN Ghana",      status: "Pending",   date: "14 jan. 2025" },
  { name: "FREE_INFO",     country: "Sénégal",        operator: "Free Sénégal",   status: "Validated", date: "13 jan. 2025" },
  { name: "AIRTEL_MKT",   country: "Nigeria",         operator: "Airtel Nigeria", status: "Rejected",  date: "13 jan. 2025" },
  { name: "MOOV_SVC",     country: "Burkina Faso",    operator: "Moov Africa BF", status: "Pending",   date: "12 jan. 2025" },
  { name: "TELECEL_OTP",  country: "Ghana",            operator: "Telecel",        status: "Validated", date: "12 jan. 2025" },
  { name: "WAVE_PAY",     country: "Sénégal",          operator: "Orange Sénégal", status: "Validated", date: "11 jan. 2025" },
];

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
  return (
    <div className="flex flex-col gap-5 p-6 overflow-auto h-full" style={{ background: "var(--background)" }}>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, delta, up, icon: Icon, accent, bg, iconColor }) => (
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
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Évolution mensuelle</p>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--blue-muted)", color: "var(--primary)" }}>2025</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={lineData}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
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
        </Card>

        {/* Bar - Countries */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Top Pays</p>
            <button className="flex items-center gap-1 text-xs" style={{ color: "var(--primary)", fontWeight: 600 }}>Voir tout <ArrowRight size={11} /></button>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={countryData} barSize={22}>
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
            {operatorData.map(({ operator, count }, i) => {
              const pct = Math.round((count / operatorData[0].count) * 100);
              const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];
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
            <tr style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}>
              {["Sender Name", "Pays", "Opérateur", "Statut", "Date"].map((h) => (
                <th key={h} className="px-5 py-3 text-left" style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentActivities.map((row, i) => (
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
