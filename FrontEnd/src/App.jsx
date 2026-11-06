import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import logo from "../Logo.png";
import {
  Activity,
  ArrowDownUp,
  ChevronDown,
  Clock3,
  Command,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Workflow as WorkflowIcon,
  X,
} from "lucide-react";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

const emptyForm = { name: "", description: "", status: "Active", triggerAt: "", notificationEmail: "" };

function friendlyError(error) {
  return error.response?.data?.message || "Could not reach the backend. Check that the API and MongoDB are running.";
}

function App() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState("checking");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadWorkflows() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/workflows");
      setWorkflows(data);
      setApiStatus("ready");
    } catch (requestError) {
      setError(friendlyError(requestError));
      setApiStatus("offline");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    api.get("/workflows")
      .then(({ data }) => {
        if (!cancelled) {
          setWorkflows(data);
          setApiStatus("ready");
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(friendlyError(requestError));
          setApiStatus("offline");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const visibleWorkflows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return workflows.filter((workflow) => {
      const matchesSearch = `${workflow.name} ${workflow.description}`.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || workflow.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workflows, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(workflow) {
    setEditing(workflow);
    setForm({
      name: workflow.name,
      description: workflow.description || "",
      status: workflow.status || "Active",
      triggerAt: toLocalDateTime(workflow.triggerAt),
      notificationEmail: workflow.notificationEmail || "",
    });
    setModalOpen(true);
  }

  async function saveWorkflow(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const workflowInput = {
        ...form,
        triggerAt: form.triggerAt ? new Date(form.triggerAt).toISOString() : null,
        notificationEmail: form.triggerAt ? form.notificationEmail.trim() : "",
      };
      if (editing) {
        const { data } = await api.put(`/workflows/${editing._id}`, workflowInput);
        setWorkflows((items) => items.map((item) => item._id === data._id ? data : item));
      } else {
        const { data } = await api.post("/workflows", workflowInput);
        setWorkflows((items) => [data, ...items]);
      }
      setModalOpen(false);
    } catch (requestError) {
      setError(friendlyError(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function deleteWorkflow(workflow) {
    if (!window.confirm(`Delete “${workflow.name}”? This cannot be undone.`)) return;
    setError("");
    try {
      await api.delete(`/workflows/${workflow._id}`);
      setWorkflows((items) => items.filter((item) => item._id !== workflow._id));
    } catch (requestError) {
      setError(friendlyError(requestError));
    }
  }

  const activeCount = workflows.filter((item) => item.status === "Active").length;
  const latestWorkflow = workflows.reduce((latest, item) =>
    !latest || new Date(item.updatedAt) > new Date(latest.updatedAt) ? item : latest, null);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="AutoFlowAI home"><img src={logo} alt="" />AutoFlowAI</a>
        <div className="workspace-switch">
          <span className="workspace-avatar">A</span>
          <span className="workspace-copy"><strong>My workspace</strong><small>Free plan</small></span>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-item" href="#overview"><LayoutDashboard size={17} /> Overview</a>
          <a className="nav-item active" href="#workflows"><WorkflowIcon size={17} /> Workflows <span className="nav-count">{workflows.length}</span></a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <span className="user-avatar">A</span>
            <span className="workspace-copy"><strong>Ayush Thakkar</strong><small>Personal workspace</small></span>
            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>

      <main className="main-area" id="top">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>Workflows</strong></div>
          <div className="topbar-right">
            <span className={`connection-indicator connection-${apiStatus}`}><span />{apiStatus === "checking" ? "Connecting..." : apiStatus === "offline" ? "API unavailable" : "API connected"}</span>
            <span className="top-avatar">A</span>
          </div>
        </header>

        <div className="content-wrap">
          <section className="page-heading" id="overview">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" />YOUR AUTOMATION SPACE</div>
              <h1>Workflows</h1>
              <p className="page-subtitle">Build and manage the routines that keep work moving.</p>
            </div>
            <button className="primary-button" onClick={openCreate}><Plus size={17} />Create workflow</button>
          </section>

          {error && <div className="alert" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss"><X size={16} /></button></div>}

          <section className="stats-grid" aria-label="Workflow summary">
            <article className="stat-card"><div className="stat-top"><span>Total workflows</span><span className="stat-icon violet"><WorkflowIcon size={17} /></span></div><strong>{workflows.length}</strong><small>In your workspace</small></article>
            <article className="stat-card"><div className="stat-top"><span>Active</span><span className="stat-icon green"><Activity size={17} /></span></div><strong>{activeCount}</strong><small>Ready to run</small></article>
            <article className="stat-card"><div className="stat-top"><span>Last updated</span><span className="stat-icon amber"><Clock3 size={17} /></span></div><strong className="last-updated">{latestWorkflow ? formatDate(latestWorkflow.updatedAt) : "—"}</strong><small>Most recent change</small></article>
          </section>

          <section className="workflow-section" id="workflows">
            <div className="section-heading">
              <div><h2>My Workflows <span className="section-count">{workflows.length}</span></h2><p>Keep your everyday processes organized in one place.</p></div>
              <button className="secondary-button" onClick={loadWorkflows}><ArrowDownUp size={15} />Refresh</button>
            </div>
            <div className="list-toolbar">
              <label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search workflows..." /></label>
              <label className="filter-control"><Command size={15} /><select aria-label="Filter workflows by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All workflows</option><option value="active">Active</option><option value="paused">Paused</option></select><ChevronDown size={14} /></label>
            </div>
            <div className="workflow-table-wrap">
              <div className="table-head"><span>WORKFLOW</span><span>STATUS</span><span>LAST UPDATED</span><span aria-label="Actions" /></div>
              {loading ? (
                <div className="empty-state"><div className="loader" /><strong>Loading workflows</strong><p>Connecting to your workspace...</p></div>
              ) : visibleWorkflows.length ? (
                <div className="workflow-list">
                  {visibleWorkflows.map((workflow, index) => (
                    <article className="workflow-row" key={workflow._id}>
                      <div className="workflow-info">
                        <span className={`workflow-symbol symbol-${index % 4}`}><WorkflowIcon size={18} /></span>
                        <div className="workflow-text">
                          <strong>{workflow.name}</strong>
                          <span>{workflow.description || "No description added"}</span>
                          {workflow.triggerAt && <small className="reminder-note">Email reminder {workflow.emailSentAt ? "sent" : "scheduled"} for {formatDateTime(workflow.triggerAt)}</small>}
                        </div>
                      </div>
                      <div><span className={`status-pill ${workflow.status === "Active" ? "status-active" : "status-paused"}`}><i />{workflow.status}</span></div>
                      <div className="updated-cell">{formatDate(workflow.updatedAt)}</div>
                      <div className="row-actions"><button onClick={() => openEdit(workflow)} className="row-action">Edit</button><button onClick={() => deleteWorkflow(workflow)} className="row-action delete-action">Delete</button></div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><Sparkles size={22} /></div>
                  <strong>{workflows.length ? "No matching workflows" : "Your first workflow starts here"}</strong>
                  <p>{workflows.length ? "Try another search or status filter." : "Create a workflow to keep a routine or process organized."}</p>
                  {!workflows.length && <button className="primary-button small-button" onClick={openCreate}><Plus size={16} />Create first workflow</button>}
                </div>
              )}
            </div>
            <div className="list-footer"><span>Showing {visibleWorkflows.length} of {workflows.length} workflows</span><span>AutoFlowAI <b>·</b> Simple automation management</span></div>
          </section>
          <footer className="page-footer"><span>Made for smoother workdays.</span><span><Sparkles size={14} />A little more flow, every day.</span></footer>
        </div>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading"><div><span className="modal-kicker">WORKFLOW DETAILS</span><h2 id="modal-title">{editing ? "Edit workflow" : "Create a workflow"}</h2></div><button className="icon-button" onClick={() => setModalOpen(false)} aria-label="Close"><X size={19} /></button></div>
            <p className="modal-description">Give this workflow a clear name so it’s easy to find later.</p>
            <form onSubmit={saveWorkflow}>
              <label className="form-label">Workflow name <span>*</span><input autoFocus maxLength={100} required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Enter Workflow Name" /></label>
              <label className="form-label">Description <small>OPTIONAL</small><textarea maxLength={500} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="About the workflow" /></label>
              <label className="form-label">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Active</option><option>Paused</option></select></label>
              <div className="reminder-fields">
                <span className="reminder-heading">Email reminder <small>OPTIONAL</small></span>
                <p>When the workflow is due and Active, AutoFlowAI sends one reminder email. SMTP must be configured on the backend.</p>
                <label className="form-label">Send at<input type="datetime-local" value={form.triggerAt} required={Boolean(form.notificationEmail)} onChange={(event) => setForm({ ...form, triggerAt: event.target.value })} /></label>
                <label className="form-label">Recipient email<input type="email" maxLength={254} value={form.notificationEmail} required={Boolean(form.triggerAt)} onChange={(event) => setForm({ ...form, notificationEmail: event.target.value })} placeholder="ayush@example.com" /></label>
              </div>
              <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : <><Plus size={16} />Create workflow</>}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function formatDate(date) {
  if (!date) return "Just now";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

function toLocalDateTime(date) {
  if (!date) return "";
  const localDate = new Date(new Date(date).getTime() - new Date(date).getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

export default App;
