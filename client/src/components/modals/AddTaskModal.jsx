import React, { useMemo, useState } from "react";
import Modal from "../Modal.jsx";

const baseState = {
  subject: "",
  due_at: "",
  owner: "",
  related_type: "",
  related_id: "",
};

const toLocalInputValue = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value) => value.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toIsoString = (value) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

export default function AddTaskModal({ initialData = {}, onSubmit, onClose }) {
  const defaults = useMemo(() => {
    const state = { ...baseState, ...initialData };
    return {
      ...state,
      due_at: toLocalInputValue(state.due_at),
    };
  }, [initialData]);

  const [form, setForm] = useState(defaults);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!form.subject.trim()) {
      setError("Add a subject to describe the task.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        subject: form.subject.trim(),
        owner: form.owner.trim() || undefined,
        related_type: form.related_type?.trim() || undefined,
        related_id: form.related_id?.trim() || undefined,
        due_at: toIsoString(form.due_at),
      };
      const result = await onSubmit?.(payload);
      if (result === false) {
        setSubmitting(false);
        return;
      }
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to create task.");
      setSubmitting(false);
    }
  };

  const footer = (
    <>
      <button type="button" className="ghost" onClick={onClose} disabled={submitting}>
        Cancel
      </button>
      <button type="button" className="primary" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Saving…" : "Save task"}
      </button>
    </>
  );

  return (
    <Modal title="Add task" onClose={onClose} footer={footer}>
      <form onSubmit={handleSubmit}>
        {error ? <div className="alert error">{error}</div> : null}
        <input
          placeholder="Task subject"
          value={form.subject}
          onChange={handleChange("subject")}
          autoFocus
        />
        <div className="row">
          <label className="input-with-label">
            <span className="muted">Due date</span>
            <input
              type="datetime-local"
              value={form.due_at}
              onChange={handleChange("due_at")}
            />
          </label>
          <label className="input-with-label">
            <span className="muted">Owner</span>
            <input
              placeholder="Owner"
              value={form.owner}
              onChange={handleChange("owner")}
            />
          </label>
        </div>
        <div className="row">
          <label className="input-with-label">
            <span className="muted">Related to</span>
            <select value={form.related_type} onChange={handleChange("related_type")}>
              <option value="company">Company</option>
              <option value="contact">Contact</option>
              <option value="deal">Deal</option>
              <option value="">None</option>
            </select>
          </label>
          <label className="input-with-label">
            <span className="muted">Identifier</span>
            <input
              placeholder="e.g. acme inc."
              value={form.related_id}
              onChange={handleChange("related_id")}
            />
          </label>
        </div>
      </form>
    </Modal>
  );
}
