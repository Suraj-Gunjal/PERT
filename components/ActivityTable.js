"use client";

export default function ActivityTable({
  activities,
  onUpdate,
  onAdd,
  onDelete,
  usePERT,
}) {
  return (
    <div style={{ overflowX: "auto", marginBottom: "15px" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "13px",
        }}
      >
        <thead>
          <tr
            style={{ background: "#f5f5f5", borderBottom: "2px solid #667eea" }}
          >
            <th style={{ padding: "10px", textAlign: "left" }}>ID</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
            {usePERT ? (
              <>
                <th style={{ padding: "10px", textAlign: "left" }}>Opt</th>
                <th style={{ padding: "10px", textAlign: "left" }}>
                  Most Likely
                </th>
                <th style={{ padding: "10px", textAlign: "left" }}>Pess</th>
              </>
            ) : (
              <th style={{ padding: "10px", textAlign: "left" }}>Duration</th>
            )}
            <th style={{ padding: "10px", textAlign: "left" }}>Predecessors</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity, index) => (
            <tr
              key={index}
              style={{
                borderBottom: "1px solid #eee",
                background: index % 2 === 0 ? "#fff" : "#f9f9f9",
              }}
            >
              <td style={{ padding: "10px" }}>
                <input
                  type="text"
                  value={activity.id}
                  onChange={(e) => onUpdate(index, "id", e.target.value)}
                  style={{
                    padding: "6px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    width: "45px",
                    fontSize: "13px",
                  }}
                />
              </td>
              <td style={{ padding: "10px" }}>
                <input
                  type="text"
                  value={activity.name}
                  onChange={(e) => onUpdate(index, "name", e.target.value)}
                  placeholder="Activity name"
                  style={{
                    padding: "6px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    width: "100%",
                    fontSize: "13px",
                  }}
                />
              </td>
              {usePERT ? (
                <>
                  <td style={{ padding: "10px" }}>
                    <input
                      type="number"
                      value={activity.o}
                      onChange={(e) => onUpdate(index, "o", e.target.value)}
                      min="0"
                      style={{
                        padding: "6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        width: "60px",
                        fontSize: "13px",
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px" }}>
                    <input
                      type="number"
                      value={activity.m}
                      onChange={(e) => onUpdate(index, "m", e.target.value)}
                      min="0"
                      style={{
                        padding: "6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        width: "60px",
                        fontSize: "13px",
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px" }}>
                    <input
                      type="number"
                      value={activity.p}
                      onChange={(e) => onUpdate(index, "p", e.target.value)}
                      min="0"
                      style={{
                        padding: "6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        width: "60px",
                        fontSize: "13px",
                      }}
                    />
                  </td>
                </>
              ) : (
                <td style={{ padding: "10px" }}>
                  <input
                    type="number"
                    value={activity.duration}
                    onChange={(e) =>
                      onUpdate(index, "duration", e.target.value)
                    }
                    min="0"
                    style={{
                      padding: "6px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      width: "70px",
                      fontSize: "13px",
                    }}
                  />
                </td>
              )}
              <td style={{ padding: "10px" }}>
                <input
                  type="text"
                  value={activity.predecessors.join(",")}
                  onChange={(e) =>
                    onUpdate(index, "predecessors", e.target.value)
                  }
                  placeholder="A,B"
                  style={{
                    padding: "6px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    width: "100%",
                    fontSize: "13px",
                  }}
                />
              </td>
              <td style={{ padding: "10px", textAlign: "center" }}>
                <button
                  onClick={() => onDelete(index)}
                  className="btn btn-danger btn-small"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={onAdd}
        className="btn btn-secondary"
        style={{ marginTop: "10px" }}
      >
        ➕ Add Activity
      </button>
    </div>
  );
}
