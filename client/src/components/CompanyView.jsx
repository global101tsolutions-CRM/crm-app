import React, { useEffect, useMemo, useState } from "react";

const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

const formatDateTime = (value) => {
  if (!value) return "No activity yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0][0] || "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : parts[0][1] || "";
  return (first + (second || "")).toUpperCase();
};

export default function CompanyView({
  contacts,
  deals,
  onRefreshContacts,
  onOpenCompany,
  onAddContact,
  onCreateTask
}) {
  const companies = useMemo(() => {
    const map = new Map();

    const touch = (rawName) => {
      const name = rawName?.trim() || "Unassigned";
      const key = name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          name,
          contactCount: 0,
          dealCount: 0,
          pipelineValue: 0,
          owners: new Set(),
          stages: new Map(),
          lastActivity: null,
          contacts: [],
          deals: []
        });
      }
      return map.get(key);
    };

    contacts.forEach((contact) => {
      const bucket = touch(contact.company);
      bucket.contactCount += 1;
      bucket.contacts.push(contact);
      const updated = contact.updated_at ? new Date(contact.updated_at) : null;
      if (updated && !Number.isNaN(updated.getTime())) {
        if (!bucket.lastActivity || updated > bucket.lastActivity) bucket.lastActivity = updated;
      }
    });

    deals.forEach((deal) => {
      const bucket = touch(deal.company);
      bucket.dealCount += 1;
      bucket.pipelineValue += Number(deal.amount || 0);
      bucket.deals.push(deal);
      if (deal.owner) bucket.owners.add(deal.owner);
      if (deal.stage_name) {
        bucket.stages.set(deal.stage_name, (bucket.stages.get(deal.stage_name) ?? 0) + 1);
      }
      const updated = deal.updated_at ? new Date(deal.updated_at) : null;
      if (updated && !Number.isNaN(updated.getTime())) {
        if (!bucket.lastActivity || updated > bucket.lastActivity) bucket.lastActivity = updated;
      }
    });

    return Array.from(map.values())
      .map((entry) => ({
        ...entry,
        owners: Array.from(entry.owners),
        stageBreakdown: Array.from(entry.stages.entries()).sort((a, b) => b[1] - a[1]),
        lastActivityLabel: formatDateTime(entry.lastActivity)
      }))
      .sort((a, b) => b.pipelineValue - a.pipelineValue || b.dealCount - a.dealCount);
  }, [contacts, deals]);

  const totals = useMemo(() => {
    if (!companies.length) {
      return { count: 0, deals: 0, value: 0, avg: 0 };
    }
    const count = companies.length;
    const dealsTotal = companies.reduce((sum, company) => sum + company.dealCount, 0);
    const valueTotal = companies.reduce((sum, company) => sum + company.pipelineValue, 0);
    return {
      count,
      deals: dealsTotal,
      value: valueTotal,
      avg: dealsTotal ? valueTotal / dealsTotal : 0
    };
  }, [companies]);

  const topCompany = companies[0];
  const stageLeaderboard = useMemo(() => {
    const tally = new Map();
    companies.forEach((company) => {
      company.stageBreakdown.forEach(([stage, count]) => {
        tally.set(stage, (tally.get(stage) ?? 0) + count);
      });
    });
    return Array.from(tally.entries()).sort((a, b) => b[1] - a[1]);
  }, [companies]);

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!companies.length) {
      setSelected(null);
      return;
    }
    setSelected((prev) => {
      if (!prev) return companies[0];
      const updated = companies.find((company) => company.name === prev.name);
      return updated || companies[0];
    });
  }, [companies]);

  const activeCompany = selected;

  const handleAddContact = (companyName) => {
    onAddContact?.({ company: companyName || "" });
  };

  const scheduleTask = (subject, companyName, opts = {}) => {
    if (!onCreateTask) return;
    const related = (companyName || "").trim().toLowerCase();
    onCreateTask({
      subject,
      related_type: "company",
      related_id: related,
      ...opts
    });
  };

  const mkDueInDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const activeContacts = useMemo(() => {
    if (!activeCompany) return [];
    return [...activeCompany.contacts].sort((a, b) => {
      const left = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const right = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return right - left;
    });
  }, [activeCompany]);

  const activeDeals = useMemo(() => {
    if (!activeCompany) return [];
    return [...activeCompany.deals].sort((a, b) => {
      const left = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const right = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return right - left;
    });
  }, [activeCompany]);

  return (
    <div className="grid">
      <section className="metric-grid">
        <div className="card metric-card">
          <div className="metric-label">Active companies</div>
          <div className="metric-value">{totals.count}</div>
          <div className="metric-sub">Accounts with at least one touch</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Open deals</div>
          <div className="metric-value">{totals.deals}</div>
          <div className="metric-sub">Across every active account</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Pipeline value</div>
          <div className="metric-value">{currency.format(totals.value || 0)}</div>
          <div className="metric-sub">Sum of forecasted revenue</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Avg deal size</div>
          <div className="metric-value">{currency.format(totals.avg || 0)}</div>
          <div className="metric-sub">Based on open opportunities</div>
        </div>
      </section>

      {topCompany ? (
        <section className="card">
          <div className="section-header">
            <div>
              <h3 className="section-title">Account spotlight</h3>
              <p className="muted">Most valuable company in your pipeline right now.</p>
            </div>
            <div className="row wrap">
              <button type="button" className="ghost" onClick={onRefreshContacts}>Refresh companies</button>
              {onAddContact ? (
                <button type="button" className="primary" onClick={() => handleAddContact(topCompany?.name)}>
                  Add contact
                </button>
              ) : null}
            </div>
          </div>
          <div className="company-spotlight">
            <div>
              <h4>{topCompany.name}</h4>
              <p className="muted">Last activity • {topCompany.lastActivityLabel}</p>
              <div className="row wrap" style={{ marginTop: 12 }}>
                <span className="pill">{topCompany.contactCount} contacts</span>
                <span className="pill">{topCompany.dealCount} deals</span>
                <span className="pill">{currency.format(topCompany.pipelineValue || 0)}</span>
              </div>
            </div>
            <div className="stage-stack">
              {topCompany.stageBreakdown.length ? topCompany.stageBreakdown.map(([stage, count]) => (
                <div key={stage} className="stage-chip">
                  <span>{stage}</span>
                  <b>{count}</b>
                </div>
              )) : <div className="muted">No open deals yet.</div>}
            </div>
          </div>
        </section>
      ) : (
        <section className="card">
          <div className="section-header">
            <div>
              <h3 className="section-title">Account spotlight</h3>
              <p className="muted">Most valuable company in your pipeline right now.</p>
            </div>
            <div className="row wrap">
              <button type="button" className="ghost" onClick={onRefreshContacts}>Refresh companies</button>
              {onAddContact ? (
                <button type="button" className="primary" onClick={() => handleAddContact("")}>
                  Add contact
                </button>
              ) : null}
            </div>
          </div>
          <div className="empty">Add contacts or deals to see company level insights.</div>
        </section>
      )}

      <section className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Company leaderboard</h3>
            <p className="muted">Sorted by pipeline value and overall engagement.</p>
          </div>
        </div>
        {companies.length ? (
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Contacts</th>
                <th>Open deals</th>
                <th>Owners</th>
                <th>Pipeline value</th>
                <th className="right">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr
                  key={company.name}
                  className={`company-row${activeCompany?.name === company.name ? " selected" : ""}`}
                  onClick={() => {
                    setSelected(company);
                    onOpenCompany?.(company);
                  }}
                >
                  <td>
                    <div className="company-cell">
                      <div className="company-initial" aria-hidden="true">{getInitials(company.name)}</div>
                      <div className="stack-tight">
                        <strong>{company.name}</strong>
                        <span className="muted">
                          {company.stageBreakdown.length ? `${company.stageBreakdown[0][0]} lead` : "No open stage"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{company.contactCount}</td>
                  <td>{company.dealCount}</td>
                  <td>{company.owners.length ? company.owners.join(", ") : "Unassigned"}</td>
                  <td>{currency.format(company.pipelineValue || 0)}</td>
                  <td className="right">{company.lastActivityLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No companies to show. Add contacts and deals to populate your leaderboard.</div>
        )}
      </section>

      {activeCompany ? (
        <section className="card company-detail">
          <div className="section-header">
            <div>
              <h3 className="section-title">{activeCompany.name}</h3>
              <p className="muted">
                {(activeCompany.stageBreakdown[0]?.[0] ?? "No open stage")} • {currency.format(activeCompany.pipelineValue || 0)} pipeline • Owners{" "}
                {activeCompany.owners.length ? activeCompany.owners.join(", ") : "Unassigned"}
              </p>
            </div>
            <div className="row wrap">
              <button type="button" className="ghost" onClick={() => onOpenCompany?.(activeCompany)}>Open profile</button>
              {onCreateTask ? (
                <button
                  type="button"
                  className="ghost"
                  onClick={() =>
                    scheduleTask(`Call ${activeCompany.name}`, activeCompany.name, {
                      owner: activeCompany.owners?.[0] || undefined
                    })
                  }
                >
                  Log call
                </button>
              ) : null}
              {onCreateTask ? (
                <button
                  type="button"
                  className="primary"
                  onClick={() =>
                    scheduleTask(`Follow up with ${activeCompany.name}`, activeCompany.name, {
                      owner: activeCompany.owners?.[0] || undefined,
                      due_at: mkDueInDays(2)
                    })
                  }
                >
                  Schedule follow-up
                </button>
              ) : null}
            </div>
          </div>
          <div className="company-detail-grid">
            <div>
              <div className="row wrap" style={{ justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <h4 style={{ margin: 0 }}>Key contacts</h4>
                {onAddContact ? (
                  <button type="button" className="ghost" onClick={() => handleAddContact(activeCompany.name)}>
                    Add contact
                  </button>
                ) : null}
              </div>
              {activeContacts.length ? (
                <ul className="company-list">
                  {activeContacts.slice(0, 5).map((contact) => (
                    <li key={contact.id} className="company-list-item">
                      <strong>{`${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "Unnamed contact"}</strong>
                      <div className="muted">{contact.role || contact.title || "No role provided"}</div>
                      <div className="muted">{contact.email || "No email on file"}</div>
                      <div className="muted">{contact.phone || "No phone on file"}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty">No contacts stored for this company yet.</div>
              )}
            </div>
            <div>
              <h4>Open deals</h4>
              {activeDeals.length ? (
                <ul className="company-list">
                  {activeDeals.slice(0, 5).map((deal) => (
                    <li key={deal.id} className="company-list-item">
                      <div className="row-grow" style={{ alignItems: "flex-start" }}>
                        <div>
                          <strong>{deal.name}</strong>
                          <div className="muted">{deal.stage_name || "Stage not set"}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="deal-amount">{currency.format(Number(deal.amount || 0))}</div>
                          <div className="deal-updated">{formatDateTime(deal.updated_at)}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty">No active deals. Create one to get started.</div>
              )}
            </div>
          </div>
          <div className="company-note muted">Last activity • {activeCompany.lastActivityLabel}</div>
        </section>
      ) : null}

      {stageLeaderboard.length ? (
        <section className="card">
          <div className="section-header">
            <div>
              <h3 className="section-title">Stage distribution</h3>
              <p className="muted">Where company opportunities sit in the funnel.</p>
            </div>
          </div>
          <div className="row wrap">
            {stageLeaderboard.map(([stage, count]) => (
              <div key={stage} className="stage-card">
                <span className="stage-label">{stage}</span>
                <strong>{count}</strong>
                <p className="muted">open deals</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
