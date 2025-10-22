import React from "react";

export default function SettingsView() {
  return (
    <div className="grid">
      <section className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Workspace preferences</h3>
            <p className="muted">Configure appearance, defaults, and sharing.</p>
          </div>
        </div>
        <div className="list">
          <div className="task-item">
            <strong>Theme</strong>
            <div className="muted">Dark emerald \u2022 Optimised for focus</div>
          </div>
          <div className="task-item">
            <strong>Default pipeline</strong>
            <div className="muted">Sales Pipeline</div>
          </div>
          <div className="task-item">
            <strong>Notifications</strong>
            <div className="muted">Daily digest, mention alerts</div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Automation toggles</h3>
            <p className="muted">Keep routine work off your team's plate.</p>
          </div>
        </div>
        <div className="row wrap">
          <button type="button" className="primary">Enable deal reminders</button>
          <button type="button" className="ghost">Manage integrations</button>
          <button type="button" className="ghost">Audit log</button>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Team access</h3>
            <p className="muted">Control who can update deals, contacts, and settings.</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Members</th>
              <th>Permissions</th>
              <th className="right">Last change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Admins</td>
              <td>3</td>
              <td>All access</td>
              <td className="right">Mar 28, 14:21</td>
            </tr>
            <tr>
              <td>Sales</td>
              <td>12</td>
              <td>Deals, contacts, tasks</td>
              <td className="right">Mar 30, 09:35</td>
            </tr>
            <tr>
              <td>CS</td>
              <td>6</td>
              <td>Accounts, tasks</td>
              <td className="right">Mar 27, 18:02</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

