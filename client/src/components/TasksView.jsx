import React, { useMemo } from "react";

const formatDateTime = (value) => {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

const today = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export default function TasksView({ tasks, onRefresh, onCreateTask }) {
  const metrics = useMemo(() => {
    if (!tasks.length) {
      return {
        total: 0,
        open: 0,
        overdue: 0,
        dueToday: 0
      };
    }
    const startOfToday = today();
    const total = tasks.length;
    let open = 0;
    let overdue = 0;
    let dueToday = 0;

    tasks.forEach((task) => {
      const isCompleted = task.status === "completed";
      if (!isCompleted) open += 1;
      if (task.due_at) {
        const dueDate = new Date(task.due_at);
        if (!Number.isNaN(dueDate.getTime())) {
          if (!isCompleted && dueDate < startOfToday) overdue += 1;
          if (dueDate >= startOfToday && dueDate < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)) dueToday += 1;
        }
      }
    });

    return { total, open, overdue, dueToday };
  }, [tasks]);

  const upcoming = useMemo(() => {
    return [...tasks]
      .sort((a, b) => {
        const left = a.due_at ? new Date(a.due_at).getTime() : Infinity;
        const right = b.due_at ? new Date(b.due_at).getTime() : Infinity;
        return left - right;
      })
      .slice(0, 6);
  }, [tasks]);

  return (
    <div className="grid">
      <section className="metric-grid">
        <div className="card metric-card">
          <div className="metric-label">All tasks</div>
          <div className="metric-value">{metrics.total}</div>
          <div className="metric-sub">Total follow-ups in the workspace</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Open</div>
          <div className="metric-value">{metrics.open}</div>
          <div className="metric-sub">Tasks still in progress</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Due today</div>
          <div className="metric-value">{metrics.dueToday}</div>
          <div className="metric-sub">Planned for the next 24 hours</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Overdue</div>
          <div className="metric-value">{metrics.overdue}</div>
          <div className="metric-sub">Past due and still open</div>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Upcoming</h3>
            <p className="muted">Next six follow-ups ordered by due date.</p>
          </div>
          <div className="row wrap">
            <button type="button" className="ghost" onClick={onRefresh}>Refresh tasks</button>
            {onCreateTask ? (
              <button type="button" className="primary" onClick={() => onCreateTask({})}>
                Add task
              </button>
            ) : null}
          </div>
        </div>
        {upcoming.length ? (
          <div className="list">
            {upcoming.map((task) => (
              <div key={task.id} className="task-item">
                <strong>{task.subject}</strong>
                <div className="muted">Due {formatDateTime(task.due_at)}</div>
                <div className="row wrap" style={{ marginTop: 6 }}>
                  <span className="pill">{task.status || "open"}</span>
                  {task.owner ? <span className="pill">Owner: {task.owner}</span> : null}
                  {task.related_type && task.related_id ? (
                    <span className="pill">Related: {task.related_type}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">No tasks scheduled. Add reminders to keep your pipeline moving.</div>
        )}
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Task board</h3>
            <p className="muted">Full task list with quick status insight.</p>
          </div>
        </div>
        {tasks.length ? (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Due</th>
                <th>Owner</th>
                <th>Status</th>
                <th className="right">Created</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.subject}</td>
                  <td>{formatDateTime(task.due_at)}</td>
                  <td>{task.owner || "—"}</td>
                  <td>{task.status || "open"}</td>
                  <td className="right">{formatDateTime(task.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No tasks logged. Create reminders to kick things off.</div>
        )}
      </section>
    </div>
  );
}
