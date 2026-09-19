"use client";

export default function ResultsTable({ results }) {
  return (
    <div className="results-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Activity</th>
            <th>Dur</th>
            <th>ES</th>
            <th>EF</th>
            <th>LS</th>
            <th>LF</th>
            <th>Slack</th>
            <th>Critical</th>
          </tr>
        </thead>
        <tbody>
          {results.activities.map((activity, index) => (
            <tr key={index} className={activity.critical ? "critical-row" : ""}>
              <td className={activity.critical ? "critical-pill" : ""}>
                {activity.id}
              </td>
              <td>{activity.name}</td>
              <td>{activity.duration.toFixed(1)}</td>
              <td>{activity.es.toFixed(1)}</td>
              <td>{activity.ef.toFixed(1)}</td>
              <td>{activity.ls.toFixed(1)}</td>
              <td>{activity.lf.toFixed(1)}</td>
              <td>{activity.slack.toFixed(1)}</td>
              <td>{activity.critical ? "Yes" : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
