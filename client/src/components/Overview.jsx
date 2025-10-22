import React, { useMemo } from "react";

const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

const formatDateTime = (value) => {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function Overview({ deals, stages, pipeline, pipelineStages, tasks }) {
  const stageById = useMemo(() => {
    const map = new Map();
    stages.forEach((stage) => {
      map.set(stage.id, stage);
    });
    return map;
  }, [stages]);

  const totals = useMemo(() => {
    if (!deals.length) {
      return { count: 0, total: 0, expected: 0, average: 0 };
    }

    let total = 0;
    let expected = 0;
    deals.forEach((deal) => {
      const amount = Number(deal.amount || 0);
      const probability = stageById.get(deal.stage_id)?.probability ?? 0;
      total += amount;
      expected += amount * probability;
    });

    return {
      count: deals.length,
      total,
      expected,
      average: total / deals.length
    };
  }, [deals, stageById]);

  const pipelineSnapshot = useMemo(() => {
    if (!pipeline || !pipelineStages.length) return [];
    return pipelineStages.map((stage) => {
      const stageDeals = deals.filter((deal) => deal.pipeline_id === stage.pipeline_id && deal.stage_id === stage.id);
      const amount = stageDeals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0);
      return {
        stage,
        count: stageDeals.length,
        amount
      };
    });
  }, [deals, pipeline, pipelineStages]);

  const maxSnapshotAmount = useMemo(() => {
    if (!pipelineSnapshot.length) return 0;
    return Math.max(...pipelineSnapshot.map((entry) => entry.amount));
  }, [pipelineSnapshot]);

  const topDeals = useMemo(() => {
    if (!deals.length) return [];
    return [...deals]
      .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
      .slice(0, 5);
  }, [deals]);

  const upcomingTasks = useMemo(() => {
    if (!tasks.length) return [];
    return [...tasks]
      .sort((a, b) => {
        const left = a.due_at ? new Date(a.due_at).getTime() : Infinity;
        const right = b.due_at ? new Date(b.due_at).getTime() : Infinity;
        return left - right;
      })
      .slice(0, 5);
  }, [tasks]);

  const metrics = [
    {
      key: "count",
      label: "Active deals",
      value: totals.count.toString(),
      sub: "Opportunities across all pipelines"
    },
    {
      key: "total",
      label: "Pipeline value",
      value: currency.format(totals.total || 0),
      sub: "Sum of deal amounts"
    },
    {
      key: "expected",
      label: "Expected revenue",
      value: currency.format(totals.expected || 0),
      sub: "Weighted by stage probability"
    },
    {
      key: "average",
      label: "Avg deal size",
      value: currency.format(totals.average || 0),
      sub: "Based on active deals"
    }
  ];

  return (
    <>
      <section className="metric-grid">
        {metrics.map((metric) => (
          <div key={metric.key} className="card metric-card">
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-sub">{metric.sub}</div>
          </div>
        ))}
      </section>

      <section className="grid-2">
        <div className="card">
          <div className="section-header">
            <div>
              <h3 className="section-title">{pipeline ? `${pipeline.name} snapshot` : "Pipeline snapshot"}</h3>
              <p className="muted">See how opportunities stack up across stages.</p>
            </div>
          </div>
          {pipelineSnapshot.length ? (
            <div className="stage-progress">
              {pipelineSnapshot.map(({ stage, count, amount }) => {
                const percent = maxSnapshotAmount ? Math.max(6, Math.round((amount / maxSnapshotAmount) * 100)) : 0;
                return (
                  <div key={stage.id} className="progress-row">
                    <div className="progress-label">
                      <b>{stage.name}</b>
                      <div className="progress-meta">
                        {count} {count === 1 ? "deal" : "deals"} · {currency.format(amount)}
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty">No deals in the pipeline yet. Capture a new opportunity to kick things off.</div>
          )}
        </div>

        <div className="card">
          <div className="section-header">
            <div>
              <h3 className="section-title">Upcoming tasks</h3>
              <p className="muted">Stay ahead on follow-ups and reminders.</p>
            </div>
          </div>
          {upcomingTasks.length ? (
            <div className="list">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <strong>{task.subject}</strong>
                  <div className="muted">Due {formatDateTime(task.due_at)}</div>
                  {task.owner ? <div className="muted">Owner: {task.owner}</div> : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No upcoming tasks. Schedule follow-ups to keep momentum.</div>
          )}
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Top deals</h3>
            <p className="muted">Highest-value opportunities in your pipeline.</p>
          </div>
        </div>
        {topDeals.length ? (
          <div className="list">
            {topDeals.map((deal) => (
              <div key={deal.id} className="deal-row">
                <div>
                  <strong>{deal.name}</strong>
                  <div className="muted">{deal.company || "No company"}</div>
                </div>
                <div className="deal-meta">
                  <span className="pill">{stageById.get(deal.stage_id)?.name || "Stage"}</span>
                  <div className="deal-amount">{currency.format(Number(deal.amount || 0))}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">Once you add deals, the largest opportunities will appear here.</div>
        )}
      </section>
    </>
  );
}

