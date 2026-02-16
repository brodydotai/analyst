"""Local frontend pages and SQLite-backed APIs for research/system monitoring."""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel, Field

from analyst import local_store

router = APIRouter()


class ReportCreateRequest(BaseModel):
    """Request payload for adding a local report."""

    ticker: str = Field(min_length=1, max_length=16)
    title: str = Field(min_length=3, max_length=300)
    period: str = Field(min_length=1, max_length=64)
    playbook: str | None = None
    content: str = Field(min_length=20)
    source: str = "manual"


class TestRunCreateRequest(BaseModel):
    """Request payload for adding a test run event."""

    suite: str = Field(min_length=1, max_length=120)
    status: str = Field(min_length=2, max_length=32)
    details: str | None = None


class LogCreateRequest(BaseModel):
    """Request payload for adding a system log event."""

    level: str = Field(min_length=2, max_length=16)
    category: str = Field(min_length=2, max_length=64)
    message: str = Field(min_length=3)
    metadata: dict | None = None


class FeedbackCreateRequest(BaseModel):
    """Request payload for adding user feedback."""

    author: str = Field(min_length=1, max_length=120)
    rating: int | None = Field(default=None, ge=1, le=10)
    feedback: str = Field(min_length=5)
    context: str | None = None


BASE_HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Analyst Local Console</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0f1115;
      --panel: #171a21;
      --panel-2: #1f2430;
      --border: #2a3142;
      --text: #f2f4f8;
      --muted: #a5aec0;
      --accent: #67b7ff;
      --ok: #28c76f;
      --warn: #f39c12;
      --err: #ea5455;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
    }
    .app {
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: 100vh;
    }
    nav {
      border-right: 1px solid var(--border);
      background: #10131a;
      padding: 22px 16px;
    }
    nav h1 {
      margin: 0 0 20px;
      font-size: 18px;
      letter-spacing: 0.2px;
    }
    .nav-link {
      display: block;
      padding: 10px 12px;
      margin: 6px 0;
      color: var(--text);
      border-radius: 8px;
      text-decoration: none;
      border: 1px solid transparent;
    }
    .nav-link:hover { background: var(--panel); border-color: var(--border); }
    .nav-link.active { background: var(--panel-2); border-color: var(--accent); }
    main {
      padding: 24px;
      max-width: 1400px;
    }
    .title {
      margin: 0 0 8px;
      font-size: 24px;
    }
    .subtitle {
      margin: 0 0 20px;
      color: var(--muted);
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 16px;
      min-height: 72vh;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
    }
    .panel h2 {
      margin: 0 0 10px;
      font-size: 16px;
    }
    .panel h3 {
      margin: 16px 0 8px;
      font-size: 14px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .list {
      max-height: 420px;
      overflow: auto;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: #0f131c;
    }
    .list-item {
      padding: 10px;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
    }
    .list-item:last-child { border-bottom: none; }
    .list-item:hover { background: #171d2b; }
    .list-item.selected { background: #1a2436; border-left: 3px solid var(--accent); }
    .list-item strong { display: block; margin-bottom: 3px; }
    .muted { color: var(--muted); font-size: 12px; }
    .report-view {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px;
      min-height: 520px;
      line-height: 1.5;
      overflow: auto;
      background: #0f131c;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    }
    .report-view.raw {
      white-space: pre-wrap;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .report-view h1, .report-view h2, .report-view h3 {
      margin: 0 0 10px;
      line-height: 1.25;
    }
    .report-view h1 { font-size: 24px; }
    .report-view h2 { font-size: 18px; margin-top: 16px; }
    .report-view h3 { font-size: 16px; margin-top: 14px; }
    .report-view p { margin: 0 0 10px; }
    .report-view ul { margin: 0 0 10px 20px; }
    .report-view code {
      background: #152132;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 1px 6px;
    }
    form {
      display: grid;
      gap: 8px;
    }
    input, textarea, select {
      width: 100%;
      border: 1px solid var(--border);
      background: #0f131c;
      color: var(--text);
      padding: 10px;
      border-radius: 8px;
      font: inherit;
    }
    textarea { min-height: 110px; resize: vertical; }
    button {
      border: 1px solid var(--accent);
      background: #0f2f4a;
      color: #dcefff;
      border-radius: 8px;
      padding: 9px 12px;
      cursor: pointer;
      font-weight: 600;
    }
    button.secondary {
      border-color: var(--border);
      background: #121824;
      color: var(--text);
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .stack { display: grid; gap: 16px; }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    .chip { font-size: 11px; padding: 3px 8px; border-radius: 999px; border: 1px solid var(--border); }
    .ok { color: var(--ok); border-color: var(--ok); }
    .warn { color: var(--warn); border-color: var(--warn); }
    .err { color: var(--err); border-color: var(--err); }
    .row-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .tableish { max-height: 220px; overflow: auto; border: 1px solid var(--border); border-radius: 10px; background: #0f131c; }
    .table-row { padding: 9px 10px; border-bottom: 1px solid var(--border); }
    .table-row:last-child { border-bottom: none; }
    .hint { color: var(--muted); font-size: 12px; margin-top: -2px; }
    .toolbar { display: grid; gap: 8px; margin: 10px 0; }
    .empty-state {
      padding: 12px;
      color: var(--muted);
      line-height: 1.4;
    }
    .inline-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    .toast-wrap {
      position: fixed;
      top: 14px;
      right: 14px;
      display: grid;
      gap: 8px;
      z-index: 10000;
    }
    .toast {
      background: #121824;
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent);
      border-radius: 10px;
      padding: 10px 12px;
      min-width: 280px;
      max-width: 420px;
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
      font-size: 14px;
    }
    .toast.success { border-left-color: var(--ok); }
    .toast.error { border-left-color: var(--err); }
    .toast.warn { border-left-color: var(--warn); }
    @media (max-width: 1100px) {
      .app { grid-template-columns: 1fr; }
      nav { border-right: none; border-bottom: 1px solid var(--border); display: flex; gap: 10px; align-items: center; }
      nav h1 { margin: 0; font-size: 16px; }
      main { padding: 14px; }
      .grid-2 { grid-template-columns: 1fr; }
      .row-3 { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div id="toasts" class="toast-wrap" aria-live="polite"></div>
  <div class="app">
    <nav>
      <h1>Analyst Console</h1>
      <a class="nav-link __RESEARCH_ACTIVE__" href="/ui/research">Research</a>
      <a class="nav-link __SYSTEM_ACTIVE__" href="/ui/system">System</a>
    </nav>
    <main>
      __CONTENT__
    </main>
  </div>
</body>
</html>
"""


RESEARCH_CONTENT = """
<h2 class="title">Research</h2>
<p class="subtitle">Readable report viewer with local storage for iterative analysis history.</p>
<div class="grid-2">
  <section class="panel">
    <h2>Stored Reports</h2>
    <div class="inline-row">
      <div class="chips">
        <button id="refreshBtn" type="button" class="secondary">Refresh</button>
        <button id="importBtn" type="button">Import Existing Files</button>
      </div>
    </div>
    <div class="hint">Imports markdown from <code>research/reports/</code> into local SQLite log storage.</div>
    <div class="toolbar">
      <input id="reportSearch" placeholder="Search by ticker, title, period, or playbook..." />
    </div>
    <div id="reportList" class="list" style="margin-top:10px;"></div>
    <h3>Add Report Manually</h3>
    <form id="reportForm">
      <input name="ticker" placeholder="Ticker (e.g., INTC)" required />
      <input name="title" placeholder="Report title" required />
      <input name="period" placeholder="Period (e.g., feb-2026)" required />
      <input name="playbook" placeholder="Playbook filename (optional)" />
      <textarea name="content" placeholder="Paste report markdown here..." required></textarea>
      <button type="submit">Save Report</button>
      <div class="hint">Tip: Use Cmd/Ctrl+Enter to submit quickly.</div>
    </form>
  </section>
  <section class="panel">
    <div class="inline-row">
      <h2 id="reportTitle">Report Viewer</h2>
      <label class="muted"><input id="rawToggle" type="checkbox" /> Raw markdown</label>
    </div>
    <div id="reportMeta" class="muted"></div>
    <div id="reportContent" class="report-view" aria-live="polite">Select a report from the list to view its content.</div>
  </section>
</div>
<script>
async function api(path, options={}) {
  const res = await fetch(path, options);
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const payload = await res.json();
      message = payload.detail || message;
    } catch {
      const text = await res.text();
      message = text || message;
    }
    throw new Error(message);
  }
  return await res.json();
}

function showToast(message, type="info") {
  const wrap = document.getElementById("toasts");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  wrap.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function formatDate(iso) {
  const date = new Date(iso);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(diff)) return iso;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleString();
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function inlineFormat(text) {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\\*\\*([^*]+)\\*\\*/g, "<strong>$1</strong>");
  out = out.replace(/\\*([^*]+)\\*/g, "<em>$1</em>");
  out = out.replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return out;
}

function renderMarkdown(md) {
  const lines = md.split("\\n");
  let html = "";
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      continue;
    }
    if (line.startsWith("# ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h1>${inlineFormat(line.slice(2))}</h1>`;
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h2>${inlineFormat(line.slice(3))}</h2>`;
      continue;
    }
    if (line.startsWith("### ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h3>${inlineFormat(line.slice(4))}</h3>`;
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${inlineFormat(line.slice(2))}</li>`;
      continue;
    }
    if (inList) {
      html += "</ul>";
      inList = false;
    }
    html += `<p>${inlineFormat(line)}</p>`;
  }
  if (inList) html += "</ul>";
  return html || "<p class='muted'>No content.</p>";
}

function setLoading(button, loading, textWhileLoading) {
  if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
  button.disabled = loading;
  button.textContent = loading ? textWhileLoading : button.dataset.defaultText;
}

function installSubmitShortcut(form) {
  form.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      form.requestSubmit();
    }
  });
}

function reportItemHtml(r) {
  return `<div class="list-item" data-id="${r.id}">
    <strong>${r.ticker} - ${r.title}</strong>
    <div class="chips">
      <span class="chip">${r.period}</span>
      <span class="chip">${r.playbook || "no playbook"}</span>
    </div>
    <div class="muted">${formatDate(r.created_at)}</div>
  </div>`;
}

let allReports = [];
let currentReport = null;

function renderReportList() {
  const query = document.getElementById("reportSearch").value.trim().toLowerCase();
  const filtered = allReports.filter((r) =>
    `${r.ticker} ${r.title} ${r.period} ${r.playbook || ""}`.toLowerCase().includes(query)
  );
  const list = document.getElementById("reportList");
  if (!filtered.length) {
    list.innerHTML = "<div class='empty-state'>No reports match this filter. Try importing existing files or clearing the search.</div>";
    return;
  }
  list.innerHTML = filtered.map(reportItemHtml).join("");
  Array.from(list.querySelectorAll(".list-item")).forEach((el) => {
    if (currentReport && String(currentReport.id) === el.dataset.id) {
      el.classList.add("selected");
    }
    el.addEventListener("click", async () => {
      try {
        const id = el.getAttribute("data-id");
        currentReport = await api(`/api/local/reports/${id}`);
        Array.from(list.querySelectorAll(".list-item")).forEach((item) => item.classList.remove("selected"));
        el.classList.add("selected");
        document.getElementById("reportTitle").textContent = `${currentReport.ticker} - ${currentReport.title}`;
        document.getElementById("reportMeta").textContent =
          `${currentReport.period} | ${currentReport.playbook || "no playbook"} | source: ${currentReport.source} | ${formatDate(currentReport.created_at)}`;
        const raw = document.getElementById("rawToggle").checked;
        const reportEl = document.getElementById("reportContent");
        reportEl.classList.toggle("raw", raw);
        reportEl.innerHTML = raw ? escapeHtml(currentReport.content).replaceAll("\\n", "<br/>") : renderMarkdown(currentReport.content);
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });
}

async function loadReports() {
  try {
    allReports = await api("/api/local/reports");
    if (!allReports.length) {
      document.getElementById("reportList").innerHTML =
        "<div class='empty-state'>No reports stored yet. Click <strong>Import Existing Files</strong> to load historical markdown reports, or add one manually below.</div>";
      return;
    }
    renderReportList();
  } catch (err) {
    showToast(err.message, "error");
  }
}

document.getElementById("refreshBtn").addEventListener("click", loadReports);
document.getElementById("importBtn").addEventListener("click", async () => {
  if (!confirm("Import markdown reports from research/reports into local storage?")) return;
  const btn = document.getElementById("importBtn");
  setLoading(btn, true, "Importing...");
  try {
    const out = await api("/api/local/reports/import-existing", { method: "POST" });
    showToast(`Imported ${out.imported} reports from research/reports.`, "success");
    await loadReports();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    setLoading(btn, false, "");
  }
});

document.getElementById("reportForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const submitBtn = e.target.querySelector("button[type='submit']");
  setLoading(submitBtn, true, "Saving...");
  try {
    await api("/api/local/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    showToast("Report saved.", "success");
    e.target.reset();
    await loadReports();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    setLoading(submitBtn, false, "");
  }
});

document.getElementById("reportSearch").addEventListener("input", renderReportList);
document.getElementById("rawToggle").addEventListener("change", () => {
  if (!currentReport) return;
  const raw = document.getElementById("rawToggle").checked;
  const reportEl = document.getElementById("reportContent");
  reportEl.classList.toggle("raw", raw);
  reportEl.innerHTML = raw ? escapeHtml(currentReport.content).replaceAll("\\n", "<br/>") : renderMarkdown(currentReport.content);
});
installSubmitShortcut(document.getElementById("reportForm"));
loadReports();
</script>
"""


SYSTEM_CONTENT = """
<h2 class="title">System</h2>
<p class="subtitle">Testing, logging, and feedback telemetry for improving the research agent loop.</p>
<div class="stack">
  <div class="row-3">
    <section class="panel">
      <h2>Testing</h2>
      <form id="testForm">
        <input name="suite" placeholder="Suite name (e.g., report-regression)" required />
        <select name="status">
          <option value="PASS">PASS</option>
          <option value="WARN">WARN</option>
          <option value="FAIL">FAIL</option>
        </select>
        <textarea name="details" placeholder="Test details (optional)"></textarea>
        <button type="submit">Log Test Run</button>
        <div class="hint">Tip: Use Cmd/Ctrl+Enter to submit quickly.</div>
      </form>
      <h3>Recent Test Runs</h3>
      <div id="testRuns" class="tableish"></div>
    </section>
    <section class="panel">
      <h2>Logging</h2>
      <form id="logForm">
        <select name="level">
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
        </select>
        <input name="category" placeholder="Category (e.g., generation, compliance)" required />
        <textarea name="message" placeholder="Log message" required></textarea>
        <textarea name="metadata" placeholder='JSON metadata (optional), e.g. {"ticker":"INTC"}'></textarea>
        <button type="submit">Add Log Entry</button>
        <div class="hint">Metadata must be valid JSON when provided.</div>
      </form>
      <h3>Recent Logs</h3>
      <div id="logs" class="tableish"></div>
    </section>
    <section class="panel">
      <h2>Feedback</h2>
      <form id="feedbackForm">
        <input name="author" placeholder="Author" required />
        <input name="rating" type="number" min="1" max="10" placeholder="Rating 1-10 (optional)" />
        <textarea name="feedback" placeholder="Feedback for agent/system behavior" required></textarea>
        <input name="context" placeholder="Context (e.g., ticker/run id)" />
        <button type="submit">Submit Feedback</button>
        <div class="hint">Use this to capture operator notes for the improvement loop.</div>
      </form>
      <h3>Recent Feedback</h3>
      <div id="feedback" class="tableish"></div>
    </section>
  </div>
</div>
<script>
async function api(path, options={}) {
  const res = await fetch(path, options);
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const payload = await res.json();
      message = payload.detail || message;
    } catch {
      const text = await res.text();
      message = text || message;
    }
    throw new Error(message);
  }
  return await res.json();
}

function showToast(message, type="info") {
  const wrap = document.getElementById("toasts");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  wrap.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function formatDate(iso) {
  const date = new Date(iso);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(diff)) return iso;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleString();
}

function setLoading(button, loading, textWhileLoading) {
  if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
  button.disabled = loading;
  button.textContent = loading ? textWhileLoading : button.dataset.defaultText;
}

function installSubmitShortcut(form) {
  form.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      form.requestSubmit();
    }
  });
}

function chipClass(status) {
  if (status === "PASS" || status === "INFO") return "ok";
  if (status === "WARN") return "warn";
  return "err";
}

function renderRows(id, rows, mapper) {
  document.getElementById(id).innerHTML = rows.length
    ? rows.map(mapper).join("")
    : `<div class="empty-state">No entries yet. Submit the form above to create the first one.</div>`;
}

async function loadSystem() {
  try {
    const [tests, logs, feedback] = await Promise.all([
      api("/api/local/test-runs"),
      api("/api/local/logs"),
      api("/api/local/feedback"),
    ]);
    renderRows("testRuns", tests, (r) => `<div class="table-row">
      <div class="chip ${chipClass(r.status)}">${r.status}</div>
      <strong>${r.suite}</strong>
      <div class="muted">${formatDate(r.created_at)}</div>
      <div>${r.details || ""}</div>
    </div>`);
    renderRows("logs", logs, (r) => `<div class="table-row">
      <div class="chip ${chipClass(r.level)}">${r.level}</div>
      <strong>${r.category}</strong>
      <div>${r.message}</div>
      <div class="muted">${formatDate(r.created_at)}</div>
    </div>`);
    renderRows("feedback", feedback, (r) => `<div class="table-row">
      <strong>${r.author} ${r.rating ? `(${r.rating}/10)` : ""}</strong>
      <div>${r.feedback}</div>
      <div class="muted">${r.context || ""} ${formatDate(r.created_at)}</div>
    </div>`);
  } catch (err) {
    showToast(err.message, "error");
  }
}

document.getElementById("testForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  const submitBtn = e.target.querySelector("button[type='submit']");
  setLoading(submitBtn, true, "Logging...");
  try {
    await api("/api/local/test-runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    showToast("Test run logged.", "success");
    e.target.reset();
    await loadSystem();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    setLoading(submitBtn, false, "");
  }
});

document.getElementById("logForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  if (payload.metadata) {
    try {
      payload.metadata = JSON.parse(payload.metadata);
    } catch {
      showToast("Metadata must be valid JSON", "warn");
      return;
    }
  } else {
    delete payload.metadata;
  }
  const submitBtn = e.target.querySelector("button[type='submit']");
  setLoading(submitBtn, true, "Saving...");
  try {
    await api("/api/local/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    showToast("Log entry saved.", "success");
    e.target.reset();
    await loadSystem();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    setLoading(submitBtn, false, "");
  }
});

document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  if (!payload.rating) delete payload.rating;
  const submitBtn = e.target.querySelector("button[type='submit']");
  setLoading(submitBtn, true, "Submitting...");
  try {
    await api("/api/local/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    showToast("Feedback submitted.", "success");
    e.target.reset();
    await loadSystem();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    setLoading(submitBtn, false, "");
  }
});

installSubmitShortcut(document.getElementById("testForm"));
installSubmitShortcut(document.getElementById("logForm"));
installSubmitShortcut(document.getElementById("feedbackForm"));
loadSystem();
</script>
"""


def _page(content: str, active: str) -> HTMLResponse:
    """Return complete HTML page with nav state."""
    html = BASE_HTML.replace("__CONTENT__", content)
    html = html.replace("__RESEARCH_ACTIVE__", "active" if active == "research" else "")
    html = html.replace("__SYSTEM_ACTIVE__", "active" if active == "system" else "")
    return HTMLResponse(html)


@router.get("/ui")
def ui_root() -> RedirectResponse:
    """Redirect root UI route to research page."""
    return RedirectResponse(url="/ui/research")


@router.get("/ui/research", response_class=HTMLResponse)
def ui_research() -> HTMLResponse:
    """Research page with report browser and local storage form."""
    return _page(RESEARCH_CONTENT, active="research")


@router.get("/ui/system", response_class=HTMLResponse)
def ui_system() -> HTMLResponse:
    """System page for testing/logging/feedback monitoring."""
    return _page(SYSTEM_CONTENT, active="system")


@router.get("/api/local/reports")
def local_reports() -> list[dict]:
    """List local reports for UI."""
    return local_store.list_reports()


@router.get("/api/local/reports/{report_id}")
def local_report(report_id: int) -> dict:
    """Fetch one local report."""
    report = local_store.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/api/local/reports")
def local_create_report(payload: ReportCreateRequest) -> dict:
    """Create a local report entry."""
    return local_store.create_report(
        ticker=payload.ticker,
        title=payload.title,
        period=payload.period,
        playbook=payload.playbook,
        content=payload.content,
        source=payload.source,
    )


@router.post("/api/local/reports/import-existing")
def import_existing_reports() -> dict:
    """Import markdown reports from research/reports into local storage."""
    reports_dir = Path("research/reports")
    if not reports_dir.exists():
        return {"imported": 0}

    imported = 0
    for path in sorted(reports_dir.glob("*.md")):
        if path.name.endswith(".scorecard.md"):
            continue
        content = path.read_text(encoding="utf-8")
        parts = path.stem.split(".")
        ticker = parts[0].upper() if parts else "UNKNOWN"
        period = parts[1] if len(parts) > 1 else "unknown"
        first_line = content.splitlines()[0] if content.splitlines() else path.name
        title = first_line.lstrip("# ").strip() or f"{ticker} {period}"
        local_store.create_report(
            ticker=ticker,
            title=title,
            period=period,
            playbook=None,
            content=content,
            source="imported",
        )
        imported += 1

    local_store.create_system_log(
        level="INFO",
        category="import",
        message=f"Imported {imported} reports from research/reports",
        metadata={"imported": imported},
    )
    return {"imported": imported}


@router.get("/api/local/test-runs")
def local_test_runs() -> list[dict]:
    """List local test run records."""
    return local_store.list_test_runs()


@router.post("/api/local/test-runs")
def local_create_test_run(payload: TestRunCreateRequest) -> dict:
    """Create a local test run record."""
    entry = local_store.create_test_run(
        suite=payload.suite,
        status=payload.status,
        details=payload.details,
    )
    local_store.create_system_log(
        level="INFO" if entry["status"] == "PASS" else "WARN",
        category="testing",
        message=f"Test suite {entry['suite']} logged as {entry['status']}",
        metadata={"test_run_id": entry["id"]},
    )
    return entry


@router.get("/api/local/logs")
def local_logs() -> list[dict]:
    """List local monitoring logs."""
    return local_store.list_system_logs()


@router.post("/api/local/logs")
def local_create_log(payload: LogCreateRequest) -> dict:
    """Create a local monitoring log entry."""
    return local_store.create_system_log(
        level=payload.level,
        category=payload.category,
        message=payload.message,
        metadata=payload.metadata,
    )


@router.get("/api/local/feedback")
def local_feedback() -> list[dict]:
    """List local feedback entries."""
    return local_store.list_feedback_entries()


@router.post("/api/local/feedback")
def local_create_feedback(payload: FeedbackCreateRequest) -> dict:
    """Create feedback entry for agent/system improvement cycle."""
    entry = local_store.create_feedback_entry(
        author=payload.author,
        rating=payload.rating,
        feedback=payload.feedback,
        context=payload.context,
    )
    local_store.create_system_log(
        level="INFO",
        category="feedback",
        message=f"Feedback submitted by {entry['author']}",
        metadata={"feedback_id": entry["id"], "rating": entry["rating"]},
    )
    return entry
