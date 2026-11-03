export default function MetricCard({
  title,
  value,
  subvalue,
  icon: Icon,
  variant = 'blue',
  trend,
  trendType = 'positive', // 'positive' | 'negative' | 'neutral'
  badge
}) {
  const variantStyles = {
    blue: {
      border: 'rgba(59, 130, 246, 0.25)',
      glow: 'rgba(59, 130, 246, 0.1)',
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#60a5fa'
    },
    violet: {
      border: 'rgba(139, 92, 246, 0.25)',
      glow: 'rgba(139, 92, 246, 0.1)',
      iconBg: 'rgba(139, 92, 246, 0.15)',
      iconColor: '#a78bfa'
    },
    emerald: {
      border: 'rgba(16, 185, 129, 0.25)',
      glow: 'rgba(16, 185, 129, 0.1)',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#34d399'
    },
    amber: {
      border: 'rgba(245, 158, 11, 0.25)',
      glow: 'rgba(245, 158, 11, 0.1)',
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#fbbf24'
    },
    rose: {
      border: 'rgba(244, 63, 94, 0.25)',
      glow: 'rgba(244, 63, 94, 0.1)',
      iconBg: 'rgba(244, 63, 94, 0.15)',
      iconColor: '#fb7185'
    }
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <div
      className="metric-card"
      style={{
        border: `1px solid ${style.border}`,
        background: `linear-gradient(145deg, #0f172a 0%, ${style.glow} 100%)`
      }}
    >
      <div className="metric-header-row">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div
            className="metric-icon-box"
            style={{ background: style.iconBg, color: style.iconColor }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="metric-value-row">
        <span className="metric-main-value">{value}</span>
        {badge && <span className={`badge badge-${variant}`}>{badge}</span>}
      </div>

      {(subvalue || trend) && (
        <div className="metric-footer-row">
          {trend && (
            <span className={`metric-trend ${trendType}`}>
              {trend}
            </span>
          )}
          {subvalue && <span className="metric-subvalue">{subvalue}</span>}
        </div>
      )}
    </div>
  );
}

