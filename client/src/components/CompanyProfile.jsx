import React, { useMemo } from "react";

const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

const formatDateTime = (value) => {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const normalizeKey = (value) => (value || "").trim().toLowerCase();
const dueInDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
const formatDay = (value) => {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function CompanyProfile({
  company,
  tasks = [],
  onBack,
  onCreateTask,
  onSendEmail,
  onAddContact
}) {
  if (!company) {
    return (
      <div className="card">
        <div className="empty">Select a company from the leaderboard to view its profile.</div>
      </div>
    );
  }

  const stageBreakdown = useMemo(() => {
    if (!company.stageBreakdown) return [];
    return Array.isArray(company.stageBreakdown)
      ? company.stageBreakdown
      : Object.entries(company.stageBreakdown);
  }, [company.stageBreakdown]);

  const lastActivityLabel =
    company.lastActivityLabel ||
    (company.lastActivity ? formatDateTime(company.lastActivity) : "No activity yet");

  const totalPipeline = currency.format(company.pipelineValue || 0);
  const openDeals = company.dealCount || company.deals?.length || 0;
  const openDealsValue = currency.format(
    (company.deals || []).reduce((sum, deal) => sum + Number(deal.amount || 0), 0)
  );
  const topStage = stageBreakdown[0]?.[0] || "No open stage";

  const contactCards = useMemo(() => {
    return (company.contacts || []).map((contact) => ({
      id: contact.id,
      name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "Unnamed contact",
      role: contact.role || contact.title || "No role provided",
      email: contact.email || "",
      phone: contact.phone || "",
      updated: contact.updated_at ? formatDateTime(contact.updated_at) : "No updates"
    }));
  }, [company.contacts]);

  const dealCards = useMemo(() => {
    return (company.deals || []).map((deal) => ({
      id: deal.id,
      name: deal.name,
      stage: deal.stage_name || "Stage not set",
      amount: currency.format(Number(deal.amount || 0)),
      updated: formatDateTime(deal.updated_at),
      owner: deal.owner || "Unassigned"
    }));
  }, [company.deals]);

  const companyKey = normalizeKey(company.name);
  const primaryOwner = company.owners?.[0] || undefined;
  const cityLabel = company.city?.trim() || "";
  const countryLabel = company.country?.trim() || "";
  let websiteUrl = "";
  let websiteLabel = "";
  if (company.website) {
    const raw = company.website.trim();
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      websiteUrl = new URL(normalized).href;
      websiteLabel = raw.replace(/^https?:\/\//i, "");
    } catch (error) {
      websiteUrl = "";
      websiteLabel = raw;
    }
  }
  const addressLabel = company.address?.trim() || "";

  const timelineGroups = useMemo(() => {
    if (!tasks?.length) return [];
    const buckets = new Map();
    tasks.forEach((task) => {
      const when = task.due_at || task.created_at;
      const key = formatDay(when);
      const timeValue = when ? new Date(when).getTime() : 0;
      const entry = {
        id: task.id || `${task.subject}-${timeValue}`,
        subject: task.subject || "Task",
        details: [
          task.status || "open",
          task.owner ? `Owner: ${task.owner}` : null,
          task.related_type ? `Related: ${task.related_type}` : null
        ]
          .filter(Boolean)
          .join(" â€¢ "),
        timestampText: formatDateTime(when),
        timeValue
      };
      const list = buckets.get(key) || [];
      list.push(entry);
      buckets.set(key, list);
    });
    return Array.from(buckets.entries())
      .map(([date, entries]) => ({
        date,
        entries: entries.sort((a, b) => b.timeValue - a.timeValue)
      }))
      .sort((a, b) => {
        const left = a.entries[0]?.timeValue ?? 0;
        const right = b.entries[0]?.timeValue ?? 0;
        return right - left;
      });
  }, [tasks]);

  const triggerTask = (subject, extra = {}) => {
    if (onCreateTask) {
      onCreateTask({
        subject,
        related_type: "company",
        related_id: companyKey,
        owner: primaryOwner,
        ...extra
      });
    } else {
      console.info("Task requested:", subject, extra);
    }
  };

  const handleEmailCompany = () => {
    if (onSendEmail) {
      onSendEmail(company);
      return;
    }
    const contactWithEmail = company.contacts?.find((contact) => contact.email);
    if (contactWithEmail?.email) {
      const subject = `Checking in with ${company.name}`;
      window.location.href = `mailto:${contactWithEmail.email}?subject=${encodeURIComponent(subject)}`;
      return;
    }
    triggerTask(`Draft email to ${company.name}`);
  };

  const handleContactEmail = (contact) => {
    if (contact.email) {
      const subject = `Quick note for ${company.name}`;
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`;
    } else {
      triggerTask(`Find email for ${contact.name || company.name}`);
    }
  };

  const handleContactCall = (contact) => {
    triggerTask(`Call ${contact.name || company.name}`, {
      related_type: "contact",
      related_id: normalizeKey(contact.id || contact.email || contact.phone || contact.name || company.name)
    });
  };

  const handleContactNote = (contact) => {
    triggerTask(`Log note for ${contact.name || company.name}`, {
      related_type: "contact",
      related_id: normalizeKey(contact.id || contact.email || contact.phone || contact.name || company.name)
    });
  };

  return (
    <div className="company-profile">
      <div className="profile-header row wrap">
        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          <button type="button" className="ghost" onClick={onBack}>
            Back to companies
          </button>
          <h2 style={{ margin: 0 }}>{company.name}</h2>
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          <button type="button" className="ghost" onClick={handleEmailCompany}>
            Send email
          </button>
          <button type="button" className="ghost" onClick={() => triggerTask(`Call ${company.name}`)}>
            Log call
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() =>
              triggerTask(`Book meeting with ${company.name}`, {
                due_at: dueInDays(5)
              })
            }
          >
            Book meeting
          </button>
          <button type="button" className="primary" onClick={() => triggerTask(`New task for ${company.name}`)}>
            Add task
          </button>
        </div>
      </div>

      <div className="company-profile-layout">
        <aside className="card profile-sidebar">
          <div className="stack" style={{ gap: 12 }}>
            <div>
              <div className="muted">Pipeline value</div>
              <h3 style={{ margin: "4px 0 0" }}>{totalPipeline}</h3>
            </div>
            <div className="profile-stat-grid">
              <div>
                <div className="muted">Open deals</div>
                <strong>{openDeals}</strong>
              </div>
              <div>
                <div className="muted">Owners</div>
                <strong>{company.owners?.length ? company.owners.join(", ") : "Unassigned"}</strong>
              </div>
              <div>
                <div className="muted">Stage</div>
                <strong>{topStage}</strong>
              </div>
              <div>
                <div className="muted">Last activity</div>
                <strong>{lastActivityLabel}</strong>
              </div>
            </div>
            <div>
              <div className="muted">Summary</div>
              <p style={{ marginTop: 6 }}>
                {stageBreakdown.length
                  ? `Opportunities are concentrated in ${topStage.toLowerCase()} with ${openDeals} active deals worth ${openDealsValue}.`
                  : "No active opportunities yet. Add a deal to start building momentum."}
              </p>
            </div>
            <div className="profile-stat-grid">
              <div>
                <div className="muted">City</div>
                <strong>{cityLabel || "Not specified"}</strong>
              </div>
              <div>
                <div className="muted">Country</div>
                <strong>{countryLabel || "Not specified"}</strong>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div className="muted">Company website</div>
                {websiteUrl ? (
                  <strong>
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                      {websiteLabel || websiteUrl}
                    </a>
                  </strong>
                ) : (
                  <strong>Not specified</strong>
                )}
              </div>
            </div>
            <div>
              <div className="muted">Address</div>
              <p style={{ marginTop: 6 }}>{addressLabel || "Not specified"}</p>
            </div>
          </div>
        </aside>

        <section className="card profile-main">
          <div className="section-header">
            <div>
              <h3 className="section-title">Recent activity</h3>
              <p className="muted">Track emails, calls, and tasks logged against this account.</p>
            </div>
            <div className="row wrap">
              <button type="button" className="ghost" onClick={() => triggerTask(`Filter activity for ${company.name}`)}>
                Filter activity
              </button>
              <button type="button" className="ghost" onClick={() => triggerTask(`Review users collaborating on ${company.name}`)}>
                All users
              </button>
            </div>
          </div>
          <div className="timeline">
            {timelineGroups.length ? (
              timelineGroups.map((group) => (
                <div key={group.date} className="timeline-day">
                  <div className="timeline-date">{group.date}</div>
                  {group.entries.map((entry) => (
                    <div key={entry.id} className="timeline-card">
                      <strong>{entry.subject}</strong>
                      <p className="muted">{entry.timestampText}</p>
                      {entry.details ? <p className="muted">{entry.details}</p> : null}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="empty">No recent activity logged yet. Create a task to get started.</div>
            )}
          </div>
        </section>

        <aside className="card profile-meta">
          <div className="stack" style={{ gap: 16 }}>
            <div>
              <h4 style={{ marginBottom: 6 }}>Quick links</h4>
              <ul className="profile-links">
                <li>
                  <button type="button" className="ghost" onClick={() => triggerTask(`Review notes for ${company.name}`)}>
                    Company notes
                  </button>
                </li>
                <li>
                  <button type="button" className="ghost" onClick={() => triggerTask(`Review open tasks for ${company.name}`)}>
                    View tasks
                  </button>
                </li>
                <li>
                  <button type="button" className="ghost" onClick={() => triggerTask(`Check related deals for ${company.name}`)}>
                    Related deals
                  </button>
                </li>
                <li>
                  <button type="button" className="ghost" onClick={() => triggerTask(`Collect attachments for ${company.name}`)}>
                    Attachments
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: 6 }}>Lifecycle</h4>
              <p className="muted">
                Currently in <strong>{topStage}</strong> with {openDeals} open opportunities.
              </p>
              <p className="muted">Last touched by {company.owners?.[0] || "Unassigned"}.</p>
            </div>
          </div>
        </aside>
      </div>

      <section className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Key contacts</h3>
            <p className="muted">People you collaborate with most frequently.</p>
          </div>
          {onAddContact ? (
            <button
              type="button"
              className="primary"
              onClick={() => onAddContact({ company: company.name })}
            >
              Add contact
            </button>
          ) : null}
        </div>
        {contactCards.length ? (
          <div className="profile-grid">
            {contactCards.map((contact) => (
              <div key={contact.id || contact.email || contact.phone || contact.name} className="profile-contact">
                <strong>{contact.name}</strong>
                <div className="muted">{contact.role}</div>
                <div className="muted">{contact.email || "No email on file"}</div>
                <div className="muted">{contact.phone || "No phone on file"}</div>
                <div className="muted" style={{ fontSize: 12 }}>Updated {contact.updated}</div>
                <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
                  <button type="button" className="ghost" onClick={() => handleContactEmail(contact)}>
                    Email
                  </button>
                  <button type="button" className="ghost" onClick={() => handleContactCall(contact)}>
                    Call
                  </button>
                  <button type="button" className="ghost" onClick={() => handleContactNote(contact)}>
                    Log note
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">No contacts synced for this company.</div>
        )}
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Open deals</h3>
            <p className="muted">Keep momentum on every opportunity.</p>
          </div>
        </div>
        {dealCards.length ? (
          <div className="profile-grid">
            {dealCards.map((deal) => (
              <div key={deal.id || deal.name} className="profile-deal">
                <div className="row-grow">
                  <strong>{deal.name}</strong>
                  <div className="deal-amount">{deal.amount}</div>
                </div>
                <div className="muted">Stage - {deal.stage}</div>
                <div className="muted">Owner - {deal.owner}</div>
                <div className="muted">Updated - {deal.updated}</div>
                <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() =>
                      triggerTask(`Review deal ${deal.name}`, {
                        related_type: "deal",
                        related_id: normalizeKey(deal.id || deal.name)
                      })
                    }
                  >
                    View deal
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() =>
                      triggerTask(`Plan next stage for ${deal.name}`, {
                        related_type: "deal",
                        related_id: normalizeKey(deal.id || deal.name),
                        due_at: dueInDays(3)
                      })
                    }
                  >
                    Move stage
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">There are no open deals for this company.</div>
        )}
      </section>
    </div>
  );
}






