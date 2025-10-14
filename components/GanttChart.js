"use client";

export default function GanttChart({ results }) {
  const maxDuration = results.projectDuration;
  const barHeight = 28;
  const spacing = 8;
  const leftMargin = 120;
  const topMargin = 50;
  const pixelsPerDay = 40;
  const width = leftMargin + maxDuration * pixelsPerDay + 50;
  const height =
    topMargin + results.activities.length * (barHeight + spacing) + 40;

  return (
    <div style={{ overflowX: "auto", marginTop: "20px" }}>
      <svg
        width={width}
        height={height}
        style={{ border: "1px solid #ddd", borderRadius: "8px" }}
      >
        {/* Timeline header */}
        <rect
          x="0"
          y="0"
          width={width}
          height={topMargin}
          fill="#f5f5f5"
          stroke="#ddd"
          strokeWidth="1"
        />

        {/* Timeline labels */}
        {Array.from({ length: Math.ceil(maxDuration) + 1 }).map((_, i) => (
          <g key={`timeline-${i}`}>
            <line
              x1={leftMargin + i * pixelsPerDay}
              y1={topMargin - 10}
              x2={leftMargin + i * pixelsPerDay}
              y2={height}
              stroke="#eee"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <text
              x={leftMargin + i * pixelsPerDay}
              y={topMargin - 15}
              fontSize="12"
              textAnchor="middle"
              fill="#666"
            >
              {i}
            </text>
          </g>
        ))}

        {/* Activity bars */}
        {results.activities.map((activity, index) => {
          const y = topMargin + index * (barHeight + spacing);
          const x = leftMargin + activity.es * pixelsPerDay;
          const barWidth = activity.duration * pixelsPerDay;
          const isCritical = activity.critical;

          return (
            <g key={`activity-${activity.id}`}>
              {/* Activity label */}
              <text
                x={10}
                y={y + barHeight / 2 + 4}
                fontSize="12"
                fontWeight={isCritical ? 600 : 400}
                fill="#333"
              >
                {activity.id} - {activity.name.substring(0, 15)}
              </text>

              {/* Slack visualization */}
              {activity.slack > 0.1 && (
                <rect
                  x={x + barWidth}
                  y={y + 5}
                  width={activity.slack * pixelsPerDay}
                  height={barHeight - 10}
                  fill="#e8f4f8"
                  stroke="#99c9d4"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              )}

              {/* Activity bar */}
              <rect
                x={x}
                y={y + 5}
                width={barWidth}
                height={barHeight - 10}
                fill={isCritical ? "#dc3545" : "#667eea"}
                stroke={isCritical ? "#a02830" : "#4a5fc4"}
                strokeWidth="2"
                rx="4"
              />

              {/* Duration label on bar */}
              <text
                x={x + barWidth / 2}
                y={y + barHeight / 2 + 4}
                fontSize="11"
                fontWeight="600"
                fill="#fff"
                textAnchor="middle"
              >
                {activity.duration.toFixed(1)}d
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <text x="20" y={height - 15} fontSize="11" fill="#666" fontWeight="600">
          Legend:
        </text>
        <rect
          x="75"
          y={height - 25}
          width="15"
          height="10"
          fill="#dc3545"
          rx="2"
        />
        <text x="95" y={height - 15} fontSize="11" fill="#666">
          Critical
        </text>
        <rect
          x="170"
          y={height - 25}
          width="15"
          height="10"
          fill="#667eea"
          rx="2"
        />
        <text x="190" y={height - 15} fontSize="11" fill="#666">
          Normal
        </text>
        <rect
          x="260"
          y={height - 25}
          width="15"
          height="10"
          fill="#e8f4f8"
          stroke="#99c9d4"
          strokeWidth="1"
          strokeDasharray="2,2"
          rx="2"
        />
        <text x="280" y={height - 15} fontSize="11" fill="#666">
          Slack
        </text>
      </svg>
    </div>
  );
}
