"use client";

export default function StatsCard({ results }) {
  const criticalCount = results.activities.filter((a) => a.critical).length;
  const avgSlack =
    results.activities.reduce((sum, a) => sum + a.slack, 0) /
    results.activities.length;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Project Duration</div>
        <div className="stat-value">{results.projectDuration.toFixed(1)}</div>
        <div style={{ fontSize: "12px" }}>days</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Critical Path</div>
        <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "10px" }}>
          {results.criticalPath.join(" → ")}
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Critical Activities</div>
        <div className="stat-value">{criticalCount}</div>
        <div style={{ fontSize: "12px" }}>of {results.activities.length}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Avg Slack</div>
        <div className="stat-value">{avgSlack.toFixed(1)}</div>
        <div style={{ fontSize: "12px" }}>days</div>
      </div>
    </div>
  );
}
