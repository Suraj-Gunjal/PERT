"use client";

export default function ResultsTable({ results }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "12px",
        }}
      >
        <thead>
          <tr
            style={{ background: "#f5f5f5", borderBottom: "2px solid #667eea" }}
          >
            <th style={{ padding: "8px", textAlign: "left" }}>ID</th>
            <th style={{ padding: "8px", textAlign: "left" }}>Activity</th>
            <th style={{ padding: "8px", textAlign: "center" }}>Dur</th>
            <th style={{ padding: "8px", textAlign: "center" }}>ES</th>
            <th style={{ padding: "8px", textAlign: "center" }}>EF</th>
            <th style={{ padding: "8px", textAlign: "center" }}>LS</th>
            <th style={{ padding: "8px", textAlign: "center" }}>LF</th>
            <th style={{ padding: "8px", textAlign: "center" }}>Slack</th>
            <th style={{ padding: "8px", textAlign: "center" }}>Critical</th>
          </tr>
        </thead>
        <tbody>
          {results.activities.map((activity, index) => (
            <tr
              key={index}
              style={{
                borderBottom: "1px solid #eee",
                background: activity.critical
                  ? "#ffe6e6"
                  : index % 2 === 0
                  ? "#fff"
                  : "#f9f9f9",
              }}
            >
              <td
                style={{
                  padding: "8px",
                  fontWeight: activity.critical ? 600 : 400,
                }}
              >
                {activity.id}
              </td>
              <td style={{ padding: "8px", fontSize: "11px" }}>
                {activity.name}
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                {activity.duration.toFixed(1)}
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                {activity.es.toFixed(1)}
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                {activity.ef.toFixed(1)}
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                {activity.ls.toFixed(1)}
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                {activity.lf.toFixed(1)}
              </td>
              <td
                style={{ padding: "8px", textAlign: "center", fontWeight: 500 }}
              >
                {activity.slack.toFixed(1)}
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                {activity.critical ? "✓ Yes" : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
