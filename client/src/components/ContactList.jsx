import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { DEMO_CONTACTS } from "../demoData.js";

export default function ContactList({ onContactsChanged, demo = false, initialContacts = DEMO_CONTACTS }) {
  const [contacts, setContacts] = useState(demo ? initialContacts : []);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", company: "" });
  const [demoMode, setDemoMode] = useState(demo);
  const [status, setStatus] = useState({ message: "", tone: "info" });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showStatus = (message, tone = "info") => setStatus({ message, tone });

  const filterContacts = (source) => {
    if (!query) return source;
    const needle = query.toLowerCase();
    return source.filter((contact) => {
      const haystack = `${contact.first_name || ""} ${contact.last_name || ""} ${contact.email || ""} ${contact.phone || ""} ${contact.company || ""}`.toLowerCase();
      return haystack.includes(needle);
    });
  };

  const load = async () => {
    if (demoMode) {
      setContacts(filterContacts(initialContacts));
      showStatus("API offline. Showing demo contacts.", "info");
      return;
    }
    try {
      setLoading(true);
      const suffix = query ? `?q=${encodeURIComponent(query)}` : "";
      const results = await api(`/api/contacts${suffix}`);
      setContacts(results);
      if (query) {
        showStatus(`Found ${results.length} contact${results.length === 1 ? "" : "s"} matching "${query}".`, "info");
      } else {
        showStatus("", "info");
      }
    } catch (error) {
      console.error(error);
      setDemoMode(true);
      setContacts(filterContacts(initialContacts));
      showStatus("Couldn't reach the API. Switched to demo data.", "info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (demo) {
      setDemoMode(true);
      setContacts(filterContacts(initialContacts));
      showStatus("Demo mode enabled.", "info");
      return;
    }
    setDemoMode(false);
    setStatus({ message: "", tone: "info" });
    load().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, initialContacts]);

  const handleCreate = async () => {
    if (!form.first_name.trim() && !form.last_name.trim()) {
      showStatus("Please provide at least a first or last name.", "error");
      return;
    }
    if (demoMode) {
      showStatus("Start the API server to add contacts.", "info");
      return;
    }
    try {
      setSubmitting(true);
      await api("/api/contacts", { method: "POST", body: JSON.stringify(form) });
      setForm({ first_name: "", last_name: "", email: "", phone: "", company: "" });
      await load();
      onContactsChanged?.();
      showStatus("Contact added.", "success");
    } catch (error) {
      console.error(error);
      setDemoMode(true);
      setContacts(filterContacts(initialContacts));
      showStatus("Unable to create contact. Showing demo data instead.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Contacts</h3>
            <p className="muted">Search your network and add new relationships.</p>
          </div>
          <div className="row wrap">
            <input
              placeholder="Search contacts..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="button" className="ghost" onClick={load} disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>
        <div className="row wrap">
          <input
            placeholder="First name"
            value={form.first_name}
            onChange={(event) => setForm({ ...form, first_name: event.target.value })}
          />
          <input
            placeholder="Last name"
            value={form.last_name}
            onChange={(event) => setForm({ ...form, last_name: event.target.value })}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
          <input
            placeholder="Company"
            value={form.company}
            onChange={(event) => setForm({ ...form, company: event.target.value })}
          />
          <button
            type="button"
            className="primary"
            onClick={handleCreate}
            disabled={demoMode || submitting}
          >
            {demoMode ? "API required" : submitting ? "Saving…" : "Add contact"}
          </button>
        </div>
        {status.message ? (
          <div className={`alert ${status.tone === "error" ? "error" : status.tone === "success" ? "success" : "info"}`}>
            {status.message}
          </div>
        ) : null}
      </div>

      <div className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Directory</h3>
            <p className="muted">Recently updated contacts first.</p>
          </div>
        </div>
        {contacts.length ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th className="right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>{contact.first_name} {contact.last_name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone}</td>
                  <td>{contact.company}</td>
                  <td className="right">{new Date(contact.updated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No contacts yet. Add your first relationship to get started.</div>
        )}
      </div>
    </div>
  );
}

