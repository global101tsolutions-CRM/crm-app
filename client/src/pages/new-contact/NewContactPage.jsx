import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api.js";

const emptyForm = {
  company: "",
  first_name: "",
  last_name: "",
  title: "",
  email: "",
  phone: "",
  city: "",
  country: "",
  website: "",
  address: "",
};

export default function NewContactPage({ navigate, initialCompany = "" }) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    company: initialCompany,
  }));
  const [status, setStatus] = useState({ message: "", tone: "info" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialCompany) {
      setForm((prev) => ({ ...prev, company: initialCompany }));
    }
  }, [initialCompany]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const previous = document.title;
      document.title = "Add Contact Â· Salesesy";
      return () => {
        document.title = previous;
      };
    }
    return undefined;
  }, []);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const trimmed = useMemo(
    () => ({
      ...form,
      company: form.company.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      title: form.title.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      website: form.website.trim(),
      address: form.address.trim(),
    }),
    [form]
  );

  const onBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate("/companies");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!trimmed.company) {
      setStatus({ message: "Ð’ÐºÐ°Ð¶Ñ–Ñ‚ÑŒ Ð½Ð°Ð·Ð²Ñƒ ÐºÐ¾Ð¼Ð¿Ð°Ð½Ñ–Ñ—.", tone: "error" });
      return;
    }
    if (!trimmed.first_name && !trimmed.last_name) {
      setStatus({ message: "Ð”Ð¾Ð´Ð°Ð¹Ñ‚Ðµ Ñ–Ð¼Ê¼Ñ Ð°Ð±Ð¾ Ð¿Ñ€Ñ–Ð·Ð²Ð¸Ñ‰Ðµ ÐºÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ñƒ.", tone: "error" });
      return;
    }
    if (!trimmed.email && !trimmed.phone) {
      setStatus({
        message: "Ð’ÐºÐ°Ð¶Ñ–Ñ‚ÑŒ Ñ…Ð¾Ñ‡Ð° Ð± email Ð°Ð±Ð¾ Ð½Ð¾Ð¼ÐµÑ€ Ñ‚ÐµÐ»ÐµÑ„Ð¾Ð½Ñƒ.",
        tone: "error",
      });
      return;
    }
    setSubmitting(true);
    setStatus({ message: "", tone: "info" });
    try {
      await api("/api/contacts", {
        method: "POST",
        body: JSON.stringify(trimmed),
      });
      setStatus({
        message: "ÐšÐ¾Ð½Ñ‚Ð°ÐºÑ‚ Ð·Ð±ÐµÑ€ÐµÐ¶ÐµÐ½Ð¾. ÐŸÐµÑ€ÐµÑ…Ñ–Ð´ Ð´Ð¾ ÑÑ‚Ð¾Ñ€Ñ–Ð½ÐºÐ¸ ÐºÐ¾Ð¼Ð¿Ð°Ð½Ñ–Ñ—â€¦",
        tone: "success",
      });
      setTimeout(() => {
        navigate(`/companies/${encodeURIComponent(trimmed.company.toLowerCase())}`);
      }, 400);
    } catch (error) {
      console.error(error);
      setStatus({
        message: error?.message || "ÐÐµ Ð²Ð´Ð°Ð»Ð¾ÑÑ Ð·Ð±ÐµÑ€ÐµÐ³Ñ‚Ð¸ ÐºÐ¾Ð½Ñ‚Ð°ÐºÑ‚. Ð¡Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ Ñ‰Ðµ Ñ€Ð°Ð·.",
        tone: "error",
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="full-page">
      <header className="topbar">
        <div>
          <h1>ÐÐ¾Ð²Ð¸Ð¹ ÐºÐ¾Ð½Ñ‚Ð°ÐºÑ‚</h1>
          <p className="muted">Ð”Ð¾Ð´Ð°Ð¹Ñ‚Ðµ Ñ–Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ†Ñ–ÑŽ Ð¿Ñ€Ð¾ ÐºÐ¾Ð¼Ð¿Ð°Ð½Ñ–ÑŽ Ñ‚Ð° Ð»ÑŽÐ´Ð¸Ð½Ñƒ.</p>
        </div>
        <div className="row wrap" style={{ gap: 12 }}>
          <button type="button" className="ghost" onClick={onBack}>
            ÐÐ°Ð·Ð°Ð´
          </button>
        </div>
      </header>

      <main className="content">
        <section className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
          <form className="stack" style={{ gap: 18 }} onSubmit={handleSubmit}>
            <div className="stack" style={{ gap: 12 }}>
              <label className="input-with-label">
                <span className="muted">ÐšÐ¾Ð¼Ð¿Ð°Ð½Ñ–Ñ *</span>
                <input
                  value={form.company}
                  onChange={updateField("company")}
                  placeholder="ÐÐ°Ð¿Ñ€Ð¸ÐºÐ»Ð°Ð´, Acme Inc."
                />
              </label>
              <div className="row wrap" style={{ gap: 12 }}>
                <label className="input-with-label">
                  <span className="muted">Ð†Ð¼Ê¼Ñ *</span>
                  <input
                    value={form.first_name}
                    onChange={updateField("first_name")}
                    placeholder="Ð†Ð¼Ê¼Ñ"
                  />
                </label>
                <label className="input-with-label">
                  <span className="muted">ÐŸÑ€Ñ–Ð·Ð²Ð¸Ñ‰Ðµ</span>
                  <input
                    value={form.last_name}
                    onChange={updateField("last_name")}
                    placeholder="ÐŸÑ€Ñ–Ð·Ð²Ð¸Ñ‰Ðµ"
                  />
                </label>
              </div>
              <label className="input-with-label">
                <span className="muted">ÐŸÐ¾ÑÐ°Ð´Ð°</span>
                <input
                  value={form.title}
                  onChange={updateField("title")}
                  placeholder="ÐÐ°Ð¿Ñ€Ð¸ÐºÐ»Ð°Ð´, VP of Sales"
                />
              </label>
            </div>

            <div className="stack" style={{ gap: 12 }}>
              <div className="row wrap" style={{ gap: 12 }}>
                <label className="input-with-label">
                  <span className="muted">City</span>
                  <input
                    value={form.city}
                    onChange={updateField("city")}
                    placeholder="City"
                  />
                </label>
                <label className="input-with-label">
                  <span className="muted">Country</span>
                  <input
                    value={form.country}
                    onChange={updateField("country")}
                    placeholder="Country"
                  />
                </label>
                <label className="input-with-label">
                  <span className="muted">Company website</span>
                  <input
                    type="text"
                    inputMode="url"
                    value={form.website}
                    onChange={updateField("website")}
                    placeholder="https://company.com"
                  />
                </label>
              </div>
              <div className="row wrap" style={{ gap: 12 }}>
                <label className="input-with-label">
                  <span className="muted">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    placeholder="name@company.com"
                  />
                </label>
                <label className="input-with-label">
                  <span className="muted">Phone number</span>
                  <input
                    value={form.phone}
                    onChange={updateField("phone")}
                    placeholder="+38 (0XX) XXX-XX-XX"
                  />
                </label>
              </div>
              <label className="input-with-label">
                <span className="muted">ÐÐ´Ñ€ÐµÑÐ°</span>
                <input
                  value={form.address}
                  onChange={updateField("address")}
                  placeholder="Ð’ÑƒÐ»Ð¸Ñ†Ñ, Ð±ÑƒÐ´Ð¸Ð½Ð¾Ðº, Ð¼Ñ–ÑÑ‚Ð¾"
                />
              </label>
            </div>

            {status.message ? (
              <div
                className={`alert ${
                  status.tone === "error"
                    ? "error"
                    : status.tone === "success"
                    ? "success"
                    : "info"
                }`}
              >
                {status.message}
              </div>
            ) : null}

            <div className="row wrap" style={{ justifyContent: "flex-end", gap: 12 }}>
              <button type="button" className="ghost" onClick={onBack} disabled={submitting}>
                Ð¡ÐºÐ°ÑÑƒÐ²Ð°Ñ‚Ð¸
              </button>
              <button type="submit" className="primary" disabled={submitting}>
                {submitting ? "Ð—Ð±ÐµÑ€Ñ–Ð³Ð°Ñ”Ð¼Ð¾â€¦" : "Ð—Ð±ÐµÑ€ÐµÐ³Ñ‚Ð¸"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}



