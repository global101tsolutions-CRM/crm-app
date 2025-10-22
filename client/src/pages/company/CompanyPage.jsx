import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api.js";
import CompanyProfile from "../../components/CompanyProfile.jsx";
import AddTaskModal from "../../components/modals/AddTaskModal.jsx";

const initialState = {
  loading: true,
  error: null,
  summary: null,
  contacts: [],
  deals: [],
  tasks: [],
};

export default function CompanyPage({ companySlug, navigate }) {
  const [state, setState] = useState(initialState);
  const [taskDefaults, setTaskDefaults] = useState(null);

  const companyKey = decodeURIComponent(companySlug || "").trim().toLowerCase();

  const fetchCompany = useCallback(async () => {
    if (!companyKey) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "ÐšÐ¾Ð¼Ð¿Ð°Ð½Ñ–ÑŽ Ð½Ðµ Ð·Ð½Ð°Ð¹Ð´ÐµÐ½Ð¾.",
      }));
      return;
    }
    setState(initialState);
    try {
      const response = await api(`/api/companies/${encodeURIComponent(companyKey)}`);
      setState({
        loading: false,
        error: null,
        summary: response.summary,
        contacts: response.contacts || [],
        deals: response.deals || [],
        tasks: response.tasks || [],
      });
      if (typeof document !== "undefined" && response.summary?.name) {
        document.title = `${response.summary.name} Â· Salesesy`;
      }
    } catch (error) {
      console.error(error);
      setState({
        loading: false,
        error: error?.message || "ÐÐµ Ð²Ð´Ð°Ð»Ð¾ÑÑ Ð·Ð°Ð²Ð°Ð½Ñ‚Ð°Ð¶Ð¸Ñ‚Ð¸ Ð´Ð°Ð½Ñ– ÐºÐ¾Ð¼Ð¿Ð°Ð½Ñ–Ñ—.",
        summary: null,
        contacts: [],
        deals: [],
        tasks: [],
      });
    }
  }, [companyKey]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const company = useMemo(() => {
    if (!state.summary) return null;
    const lastActivity = state.summary.lastActivity || null;
    const lastActivityLabel = lastActivity
      ? new Date(lastActivity).toLocaleString()
      : "No activity yet";
    const breakdownEntries = Array.isArray(state.summary.stageBreakdown)
      ? state.summary.stageBreakdown
      : Object.entries(state.summary.stageBreakdown || {});
    return {
      name: state.summary.name,
      pipelineValue: state.summary.pipelineValue,
      dealCount: state.summary.dealsCount,
      contactCount: state.summary.contactsCount,
      owners: state.summary.owners,
      lastActivity,
      lastActivityLabel,
      stageBreakdown: breakdownEntries,
      address: state.summary.address,
      city: state.summary.city,
      country: state.summary.country,
      website: state.summary.website,
      contacts: state.contacts,
      deals: state.deals,
    };
  }, [state.summary, state.contacts, state.deals]);

  const handleCreateTask = async (payload) => {
    try {
      await api("/api/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setTaskDefaults(null);
      await fetchCompany();
    } catch (error) {
      console.error(error);
      setTaskDefaults(null);
    }
  };

  const onBack = () => {
    navigate("/companies");
  };

  const onAddContact = (defaults = {}) => {
    const companyName = defaults.company || company?.name || "";
    const suffix = companyName
      ? `?company=${encodeURIComponent(companyName)}`
      : "";
    navigate(`/contacts/new${suffix}`);
  };

  return (
    <div className="full-page">
      <header className="topbar">
        <div>
          <h1>{company?.name || "ÐšÐ¾Ð¼Ð¿Ð°Ð½Ñ–Ñ"}</h1>
          <p className="muted">
            ÐŸÐµÑ€ÐµÐ³Ð»ÑÐ´Ð°Ð¹Ñ‚Ðµ Ð´ÐµÑ‚Ð°Ð»Ñ– Ñ‚Ð° Ñ–ÑÑ‚Ð¾Ñ€Ñ–ÑŽ Ð²Ð·Ð°Ñ”Ð¼Ð¾Ð´Ñ–Ñ— Ð· ÐºÐ»Ñ–Ñ”Ð½Ñ‚Ð¾Ð¼.
          </p>
        </div>
        <div className="row wrap" style={{ gap: 12 }}>
          <button type="button" className="ghost" onClick={onBack}>
            Ð”Ð¾ ÑÐ¿Ð¸ÑÐºÑƒ ÐºÐ¾Ð¼Ð¿Ð°Ð½Ñ–Ð¹
          </button>
          <button type="button" className="primary" onClick={() => onAddContact({ company: company?.name })}>
            Ð”Ð¾Ð´Ð°Ñ‚Ð¸ ÐºÐ¾Ð½Ñ‚Ð°ÐºÑ‚
          </button>
        </div>
      </header>
      <main className="content" style={{ paddingBottom: 48 }}>
        {state.loading ? (
          <section className="card">
            <div className="empty">Ð—Ð°Ð²Ð°Ð½Ñ‚Ð°Ð¶ÐµÐ½Ð½Ñ Ð´Ð°Ð½Ð¸Ñ…â€¦</div>
          </section>
        ) : state.error ? (
          <section className="card">
            <div className="empty">{state.error}</div>
            <div className="row wrap" style={{ marginTop: 12 }}>
              <button type="button" className="primary" onClick={fetchCompany}>
                Ð¡Ð¿Ñ€Ð¾Ð±ÑƒÐ²Ð°Ñ‚Ð¸ Ñ‰Ðµ Ñ€Ð°Ð·
              </button>
            </div>
          </section>
        ) : company ? (
          <CompanyProfile
            company={company}
            tasks={state.tasks}
            onBack={onBack}
            onAddContact={onAddContact}
            onCreateTask={(defaults = {}) => {
              setTaskDefaults({
                related_type: defaults.related_type || "company",
                related_id:
                  defaults.related_id ||
                  (company.name ? company.name.toLowerCase() : companyKey),
                owner: defaults.owner || company.owners?.[0] || undefined,
                subject: defaults.subject || `Ð—Ð°Ð²Ð´Ð°Ð½Ð½Ñ Ð´Ð»Ñ ${company.name}`,
                due_at: defaults.due_at,
              });
            }}
          />
        ) : (
          <section className="card">
            <div className="empty">ÐšÐ¾Ð¼Ð¿Ð°Ð½Ñ–ÑŽ Ð½Ðµ Ð·Ð½Ð°Ð¹Ð´ÐµÐ½Ð¾.</div>
          </section>
        )}
      </main>

      {taskDefaults ? (
        <AddTaskModal
          initialData={taskDefaults}
          onClose={() => setTaskDefaults(null)}
          onSubmit={async (payload) => {
            const normalized = {
              ...payload,
              related_type: payload.related_type || taskDefaults.related_type,
              related_id: payload.related_id || taskDefaults.related_id,
            };
            await handleCreateTask(normalized);
            return true;
          }}
        />
      ) : null}
    </div>
  );
}

