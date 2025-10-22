import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import ContactList from "./components/ContactList.jsx";
import DealBoard from "./components/DealBoard.jsx";
import Overview from "./components/Overview.jsx";
import CompanyView from "./components/CompanyView.jsx";
import TasksView from "./components/TasksView.jsx";
import SettingsView from "./components/SettingsView.jsx";
import Logo from "./assets/salesesy-logo.svg";
import AddTaskModal from "./components/modals/AddTaskModal.jsx";
import NewContactPage from "./pages/new-contact/NewContactPage.jsx";
import CompanyPage from "./pages/company/CompanyPage.jsx";
import {
  DEMO_CONTACTS,
  DEMO_DEALS,
  DEMO_PIPELINES,
  DEMO_STAGES,
  DEMO_TASKS
} from "./demoData.js";

const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  companies: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v14" />
      <path d="M9 21v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" />
      <path d="M7 10h.01M7 14h.01M17 10h-4M17 14h-4" />
    </svg>
  ),
  contacts: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M5 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" />
    </svg>
  ),
  deals: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 11 4 4 12-12" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7" />
    </svg>
  ),
  tasks: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  )
};

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "companies", label: "Companies" },
  { key: "contacts", label: "Contacts" },
  { key: "deals", label: "Deals" },
  { key: "tasks", label: "Tasks" },
  { key: "settings", label: "Settings" }
];

const TAB_COPY = {
  dashboard: "Monitor revenue health, tasks, and top deals.",
  companies: "Track account health and engagement at a glance.",
  contacts: "Grow relationships and keep details current.",
  deals: "Move opportunities forward across every stage.",
  tasks: "Prioritise follow-ups and stay on schedule.",
  settings: "Tune Salesesy to match your team's workflow."
};

const getCurrentRoute = () => {
  if (typeof window === "undefined") return "/";
  return window.location.pathname + window.location.search;
};

export default function App() {
  const [route, setRoute] = useState(getCurrentRoute);
  const [tab, setTab] = useState("dashboard");
  const [pipelines, setPipelines] = useState([]);
  const [stages, setStages] = useState([]);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [health, setHealth] = useState(null);
  const [demo, setDemo] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("salesesy-theme") === "light" ? "light" : "dark";
    }
    return "dark";
  });
  const [modal, setModal] = useState(null);
  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handler = () => setRoute(getCurrentRoute());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const navigate = useCallback((to, options = {}) => {
    if (typeof window === "undefined") return;
    const method = options.replace ? "replaceState" : "pushState";
    window.history[method]({}, "", to);
    setRoute(getCurrentRoute());
  }, []);

  const pathname = useMemo(() => {
    const pathOnly = route.split("?")[0];
    return pathOnly || "/";
  }, [route]);

  const searchParams = useMemo(() => {
    const queryIndex = route.indexOf("?");
    const query = queryIndex >= 0 ? route.slice(queryIndex + 1) : "";
    return new URLSearchParams(query);
  }, [route]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const body = document.body;
      body.classList.remove("theme-dark", "theme-light");
      body.classList.add(`theme-${theme}`);
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("salesesy-theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const enableDemo = useCallback(() => {
    setDemo(true);
    setHealth({ status: "demo" });
    setPipelines(DEMO_PIPELINES);
    setStages(DEMO_STAGES);
    setDeals(DEMO_DEALS);
    setTasks(DEMO_TASKS);
    setContacts(DEMO_CONTACTS);
  }, []);

  const loadDeals = useCallback(async () => {
    try {
      const liveDeals = await api("/api/deals");
      setDeals(liveDeals);
      setDemo(false);
    } catch (error) {
      console.error(error);
      enableDemo();
    }
  }, [enableDemo]);

  const loadTasks = useCallback(async () => {
    try {
      const liveTasks = await api("/api/tasks");
      setTasks(liveTasks);
      setDemo(false);
    } catch (error) {
      console.error(error);
      enableDemo();
    }
  }, [enableDemo]);

  const loadContacts = useCallback(async () => {
    try {
      const liveContacts = await api("/api/contacts");
      setContacts(liveContacts);
      setDemo(false);
    } catch (error) {
      console.error(error);
      enableDemo();
    }
  }, [enableDemo]);

  useEffect(() => {
    api("/api/health").then((data) => {
      setHealth(data);
      setDemo(false);
    }).catch((error) => {
      console.error(error);
      enableDemo();
    });
    api("/api/pipelines")
      .then(({ pipelines, stages }) => {
        setPipelines(pipelines);
        setStages(stages);
        setDemo(false);
      })
      .catch((error) => {
        console.error(error);
        enableDemo();
      });
    loadDeals();
    loadTasks();
    loadContacts();
  }, [enableDemo, loadDeals, loadTasks, loadContacts]);

  const primaryPipeline = pipelines[0] || null;
  const primaryStages = useMemo(() => {
    if (!primaryPipeline) return [];
    return stages
      .filter((stage) => stage.pipeline_id === primaryPipeline.id)
      .sort((a, b) => a.order_index - b.order_index);
  }, [stages, primaryPipeline]);

  const navLabel = NAV_ITEMS.find((item) => item.key === tab)?.label ?? "Dashboard";

  const openCompanyProfile = useCallback(
    (company) => {
      if (!company?.name) return;
      const slug = encodeURIComponent(company.name.trim().toLowerCase());
      navigate(`/companies/${slug}`);
    },
    [navigate]
  );

  const openAddContact = useCallback(
    (defaults = {}) => {
      const companyName = defaults.company ? defaults.company.trim() : "";
      const suffix = companyName ? `?company=${encodeURIComponent(companyName)}` : "";
      navigate(`/contacts/new${suffix}`);
    },
    [navigate]
  );

  useEffect(() => {
    if (pathname === "/companies") {
      setTab("companies");
    } else if (pathname === "/contacts") {
      setTab("contacts");
    } else if (pathname === "/deals") {
      setTab("deals");
    } else if (pathname === "/tasks") {
      setTab("tasks");
    } else if (pathname === "/settings") {
      setTab("settings");
    }
  }, [pathname, setTab]);


  const openAddTask = useCallback(
    (defaults = {}) => {
      setModal({ type: "task", data: defaults });
    },
    [setModal]
  );

  useEffect(() => {
    if (pathname === "/" || pathname === "" || pathname === "/companies") {
      loadContacts();
      loadDeals();
    }
    if (pathname === "/" || pathname === "/tasks") {
      loadTasks();
    }
  }, [pathname, loadContacts, loadDeals, loadTasks]);

  const handleCreateTask = useCallback(
    async (payload) => {
      await api("/api/tasks", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      await loadTasks();
    },
    [loadTasks]
  );

  if (pathname === "/contacts/new") {
    return <NewContactPage navigate={navigate} initialCompany={searchParams.get("company") || ""} />;
  }

  if (pathname.startsWith("/companies/") && pathname !== "/companies") {
    const slug = pathname.slice("/companies/".length);
    return <CompanyPage companySlug={slug} navigate={navigate} />;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div>
          <div className="sidebar-top">
            <button
              type="button"
              className={`theme-toggle ${theme}`}
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="toggle-thumb" />
              <span className="icon sun" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.15" />
                  <circle cx="12" cy="12" r="4" fill="none" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M5.64 18.36l1.42-1.42M16.94 6.64l1.42-1.42" />
                </svg>
              </span>
              <span className="icon moon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z" />
                </svg>
              </span>
            </button>
            <button
              type="button"
              className="brand brand-button"
              onClick={() => {
                setTab("dashboard");
                navigate("/");
              }}
              aria-label="Return to dashboard"
            >
              <img src={Logo} alt="Salesesy" width={32} height={32} />
              <div>
                <h2 className="brand-title">Salesesy</h2>
                <div className="brand-sub">Growth CRM</div>
              </div>
            </button>
          </div>
          <nav className="nav-links">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`nav-link${tab === item.key ? " active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                <span className="nav-bullet" />
                <span className="nav-icon" aria-hidden="true">{icons[item.key]}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-footer">
          <div className="status-pill">
            <span className={`status-dot${demo || health ? " online" : ""}`} />
            {demo ? "Demo mode" : health ? "API online" : "API offline"}
          </div>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div>
            <h1>{navLabel}</h1>
            <p className="muted">{TAB_COPY[tab] || TAB_COPY.dashboard}</p>
          </div>
          <div className="topbar-actions">
            <input
              type="search"
              placeholder="Quick search"
              aria-label="Quick search"
            />
            <button type="button" className="ghost" onClick={() => openAddContact()}>Add contact</button>
            <button type="button" className="primary" onClick={() => setTab("deals")}>New deal</button>
          </div>
        </header>
        <main className="content">
          {tab === "dashboard" && (
            <Overview
              deals={deals}
              stages={stages}
              pipeline={primaryPipeline}
              pipelineStages={primaryStages}
            />
          )}
          {tab === "companies" && (
            <CompanyView
              contacts={contacts}
              deals={deals}
              onRefreshContacts={loadContacts}
              onOpenCompany={openCompanyProfile}
              onAddContact={openAddContact}
              onCreateTask={openAddTask}
            />
          )}
          {tab === "contacts" && (
            <ContactList
              demo={demo}
              initialContacts={contacts}
              onContactsChanged={loadContacts}
            />
          )}
          {tab === "deals" && (
            <DealBoard
              pipelines={pipelines}
              stages={stages}
              deals={deals}
              onRefresh={loadDeals}
              demo={demo}
            />
          )}
          {tab === "tasks" && (
            <TasksView
              tasks={tasks}
              onRefresh={loadTasks}
              onCreateTask={openAddTask}
            />
          )}
          {tab === "settings" && (
            <SettingsView />
          )}
        </main>
      </div>
      {modal?.type === "task" ? (
        <AddTaskModal
          initialData={modal.data}
          onClose={closeModal}
          onSubmit={async (payload) => {
            const defaults = modal.data || {};
            const enhanced = {
              ...payload,
              related_type: payload.related_type ?? defaults.related_type,
              related_id: payload.related_id ?? defaults.related_id,
            };
            await handleCreateTask(enhanced);
            return true;
          }}
        />
      ) : null}
    </div>
  );
}

export default App;






