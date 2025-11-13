interface StatisticsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
}

export default function StatisticsCard({ title, value, icon, bgColor, iconColor }: StatisticsCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <dl>
        <dt className="text-2xl font-bold text-slate-900">{value}</dt>
        <dd className="text-sm font-medium text-slate-500 mt-1">{title}</dd>
      </dl>
    </div>
  );
}
