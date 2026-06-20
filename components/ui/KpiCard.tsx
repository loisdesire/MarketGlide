interface Props {
  label: string;
  value: string | number;
  sub?: string;
  variant?: 'default' | 'warn' | 'danger';
}

export default function KpiCard({ label, value, sub, variant = 'default' }: Props) {
  return (
    <div className={`kpi ${variant !== 'default' ? variant : ''}`}>
      <div className="lbl">{label}</div>
      <div className="val">{value}</div>
      {sub && <div className="delta">{sub}</div>}
    </div>
  );
}
