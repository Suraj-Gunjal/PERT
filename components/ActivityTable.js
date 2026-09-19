"use client";

export default function ActivityTable({
  activities,
  onUpdate,
  onAdd,
  onDelete,
  usePERT,
}) {
  return (
    <div className="activity-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            {usePERT ? (
              <>
                <th>Opt</th>
                <th>Most likely</th>
                <th>Pess</th>
              </>
            ) : (
              <th>Duration</th>
            )}
            <th>Predecessors</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity, index) => (
            <tr key={index} className="activity-row">
              <td>
                <input
                  type="text"
                  value={activity.id}
                  onChange={(e) => onUpdate(index, "id", e.target.value)}
                  className="id-input"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={activity.name}
                  onChange={(e) => onUpdate(index, "name", e.target.value)}
                  placeholder="Activity name"
                />
              </td>
              {usePERT ? (
                <>
                  <td>
                    <input
                      type="number"
                      value={activity.o}
                      onChange={(e) => onUpdate(index, "o", e.target.value)}
                      min="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={activity.m}
                      onChange={(e) => onUpdate(index, "m", e.target.value)}
                      min="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={activity.p}
                      onChange={(e) => onUpdate(index, "p", e.target.value)}
                      min="0"
                    />
                  </td>
                </>
              ) : (
                <td>
                  <input
                    type="number"
                    value={activity.duration}
                    onChange={(e) =>
                      onUpdate(index, "duration", e.target.value)
                    }
                    min="0"
                  />
                </td>
              )}
              <td>
                <input
                  type="text"
                  value={activity.predecessors.join(",")}
                  onChange={(e) =>
                    onUpdate(index, "predecessors", e.target.value)
                  }
                  placeholder="A,B"
                />
              </td>
              <td>
                <button
                  onClick={() => onDelete(index)}
                  className="delete-button"
                  aria-label={`Delete activity ${activity.id}`}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={onAdd} className="btn btn-secondary table-add">
        + Add activity
      </button>
    </div>
  );
}
