export default function ProgressChart({
  data = [],
  field = 'weight',
  unit = 'kg',
  color = '#2563EB',
}) {
  const values = data
    .slice()
    .reverse()
    .map((item) => item[field])
    .filter((value) => value != null && !Number.isNaN(value));

  if (values.length < 2) {
    return (
      <div className="chart-empty">
        <p>Minimal dua catatan untuk menampilkan grafik.</p>
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 640;
  const height = 200;
  const padding = 28;

  const points = values.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / (values.length - 1);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y, value };
  });

  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const area = `${padding},${height - padding} ${line} ${width - padding},${height - padding}`;

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="progress-chart" role="img" aria-label="Grafik progres">
        <defs>
          <linearGradient id={`chart-fill-${field}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#chart-fill-${field})`} />
        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          <circle
            key={`${point.x}-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#fff"
            stroke={color}
            strokeWidth="2.5"
          />
        ))}
        <text x={padding} y={height - 6} className="chart-label">
          {min} {unit}
        </text>
        <text x={width - padding} y={height - 6} textAnchor="end" className="chart-label">
          {max} {unit}
        </text>
      </svg>
      <div className="chart-latest">
        <span>Terakhir</span>
        <strong>{values[values.length - 1]} {unit}</strong>
      </div>
    </div>
  );
}
