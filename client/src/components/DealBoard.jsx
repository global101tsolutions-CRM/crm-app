import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

export default function DealBoard({ pipelines, stages, deals, onRefresh, demo = false }) {
  const [form, setForm] = useState({ name: "", amount: "", pipeline_id: "", stage_id: "", company: "", owner: "" });

  useEffect(() => {
    if (pipelines.length) {
      setForm((prev) => (prev.pipeline_id ? prev : { ...prev, pipeline_id: pipelines[0].id }));
    }
  }, [pipelines]);

  const activePipelineId = form.pipeline_id || pipelines[0]?.id || "";

  const pipelineStages = useMemo(() => {
    if (!activePipelineId) return [];
    return stages
      .filter((stage) => stage.pipeline_id === activePipelineId)
      .sort((a, b) => a.order_index - b.order_index);
  }, [stages, activePipelineId]);

  useEffect(() => {
    if (!pipelineStages.length) return;
    setForm((prev) => {
      if (prev.stage_id && pipelineStages.some((stage) => stage.id === prev.stage_id)) {
        return prev;
      }
      return { ...prev, stage_id: pipelineStages[0].id };
    });
  }, [pipelineStages]);

  const visibleDeals = useMemo(() => {
    if (!activePipelineId) return [];
    return deals.filter((deal) => deal.pipeline_id === activePipelineId);
  }, [deals, activePipelineId]);

  const groups = useMemo(() => {
    return pipelineStages.map((stage) => ({
      stage,
      items: visibleDeals.filter((deal) => deal.stage_id === stage.id)
    }));
  }, [pipelineStages, visibleDeals]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => {
      if (field === "pipeline_id") {
        return { ...prev, pipeline_id: value, stage_id: "" };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      alert("Add a deal name");
      return;
    }
    if (!activePipelineId || !form.stage_id) {
      alert("Choose a pipeline and stage");
      return;
    }
    if (demo) {
      alert("Demo mode: start the API server to create deals.");
      return;
    }
    try {
      await api("/api/deals", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount || 0),
          pipeline_id: activePipelineId,
          stage_id: form.stage_id
        })
      });
      setForm((prev) => ({
        ...prev,
        name: "",
        amount: "",
        company: "",
        owner: ""
      }));
      onRefresh?.();
    } catch (error) {
      console.error(error);
      alert("Unable to create deal. Check the console for details.");
    }
  };

  const handleMove = async (deal, stageId) => {
    if (stageId === deal.stage_id) return;
    if (demo) {
      alert("Demo mode: start the API server to move deals.");
      return;
    }
    try {
      await api(`/api/deals/${deal.id}`, {
        method: "PUT",
        body: JSON.stringify({ stage_id: stageId })
      });
      onRefresh?.();
    } catch (error) {
      console.error(error);
      alert("Unable to update deal stage. Check the console for details.");
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Create deal</h3>
            <p className="muted">Log a new opportunity in seconds.</p>
          </div>
        </div>
        <form className="row wrap" onSubmit={handleSubmit}>
          <input
            placeholder="Deal name"
            value={form.name}
            onChange={handleChange("name")}
          />
          <input
            placeholder="Amount"
            type="number"
            min="0"
            value={form.amount}
            onChange={handleChange("amount")}
          />
          <select value={activePipelineId} onChange={handleChange("pipeline_id")}>
            {pipelines.map((pipeline) => (
              <option key={pipeline.id} value={pipeline.id}>{pipeline.name}</option>
            ))}
          </select>
          <select value={form.stage_id} onChange={handleChange("stage_id")}>
            {pipelineStages.map((stage) => (
              <option key={stage.id} value={stage.id}>{stage.name}</option>
            ))}
          </select>
          <input
            placeholder="Company"
            value={form.company}
            onChange={handleChange("company")}
          />
          <input
            placeholder="Owner"
            value={form.owner}
            onChange={handleChange("owner")}
          />
          <button type="submit" className="primary" disabled={demo}>
            {demo ? "API required" : "Add deal"}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Pipeline board</h3>
            <p className="muted">Move deals forward and keep momentum.</p>
          </div>
        </div>
        {pipelineStages.length ? (
          <div className="kanban">
            {groups.map(({ stage, items }) => {
              const stageAmount = items.reduce((sum, deal) => sum + Number(deal.amount || 0), 0);
              return (
                <div key={stage.id} className="column">
                  <div className="column-header">
                    <b>{stage.name}</b>
                    <span className="muted">{currency.format(stageAmount)}</span>
                  </div>
                  {items.length ? (
                    items.map((deal) => (
                      <div key={deal.id} className="deal">
                        <div className="row-grow">
                          <div>
                            <strong>{deal.name}</strong>
                            <div className="deal-company">{deal.company || "No company"}</div>
                          </div>
                          <div>
                            <div className="deal-amount">{currency.format(Number(deal.amount || 0))}</div>
                            <div className="deal-updated">{new Date(deal.updated_at).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="row wrap" style={{ marginTop: 8 }}>
                          {stages
                            .filter((s) => s.pipeline_id === deal.pipeline_id)
                            .sort((a, b) => a.order_index - b.order_index)
                            .map((stageOption) => (
                              <button
                                key={stageOption.id}
                                type="button"
                                className={stageOption.id === deal.stage_id ? "primary" : "ghost"}
                                onClick={() => handleMove(deal, stageOption.id)}
                                disabled={stageOption.id === deal.stage_id || demo}
                              >
                                {stageOption.name}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty">No deals in this stage yet.</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty">Create a pipeline stage to start tracking deals.</div>
        )}
      </div>
    </div>
  );
}
