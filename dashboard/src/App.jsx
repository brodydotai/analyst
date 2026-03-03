import { useState, useEffect, useMemo, useRef } from "react";

const RATING_LEVELS = ["Sell", "Hold", "Buy", "Strong Buy"];

function classifyRating(action, rating) {
  const a = (action || "").toLowerCase();
  if (a.includes("sell") || a.includes("exit") || a.includes("reduce")) return "Sell";
  if (a.includes("strong buy") || a.includes("conviction")) return "Strong Buy";
  if (a.includes("buy") || a.includes("accumulate") || a.includes("long")) return "Buy";
  if (a.includes("hold") || a.includes("neutral") || a.includes("wait")) return "Hold";

  const num = parseFloat(rating);
  if (!Number.isNaN(num)) {
    if (num >= 8.5) return "Strong Buy";
    if (num >= 6.5) return "Buy";
    if (num >= 4) return "Hold";
    return "Sell";
  }
  return "Hold";
}

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getRatingTone(level) {
  switch (level) {
    case "Strong Buy":
      return "success";
    case "Buy":
      return "info";
    case "Hold":
      return "warning";
    case "Sell":
      return "danger";
    default:
      return "neutral";
  }
}

function cleanReportContent(content) {
  if (!content) return "";
  const lines = content.split("\n");
  const titleIndex = lines.findIndex((line) => /^#\s+/.test(line));
  if (titleIndex < 0) return content;

  let i = titleIndex + 1;
  while (i < lines.length && lines[i].trim() === "") i += 1;

  let sawMetadata = false;
  while (i < lines.length) {
    const line = lines[i];
    const isMetadataLine =
      /^\*\*[^*\n]+:\*\*\s*.+$/.test(line) ||
      /^[A-Za-z][\w /()%-]+:\s*.+$/.test(line);
    if (!isMetadataLine) break;
    sawMetadata = true;
    i += 1;
  }

  while (i < lines.length && lines[i].trim() === "") i += 1;
  if (sawMetadata && lines[i]?.trim() === "---") i += 1;

  const cleaned = [lines[titleIndex], "", ...lines.slice(i)].join("\n");
  return cleaned.replace(/---\s*\n## Opinion\s*\n```yaml[\s\S]*?```\s*\n---/m, "---");
}

function extractHeadings(content) {
  const headings = [];
  if (!content) return headings;

  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^(##|###)\s+(.+)$/);
    if (!match) continue;
    const depth = match[1] === "##" ? 2 : 3;
    const text = match[2].trim();
    headings.push({ depth, text, id: slugify(text) });
  }
  return headings;
}

function normalizeMetaKey(key) {
  return key
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");
}

function toTitleCase(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function parseMetadataBlock(content) {
  const lines = content.split("\n");
  const titleIndex = lines.findIndex((line) => /^#\s+/.test(line));
  if (titleIndex < 0) return [];

  const metadata = [];
  let i = titleIndex + 1;
  while (i < lines.length && lines[i].trim() === "") i += 1;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || /^---+$/.test(line) || /^##\s+/.test(line)) break;

    let match = line.match(/^\*\*([^*]+):\*\*\s*(.+)$/);
    if (!match) {
      match = line.match(/^([A-Za-z][\w /()%-]+):\s*(.+)$/);
    }

    if (!match) break;

    metadata.push({
      key: match[1].trim(),
      normalizedKey: normalizeMetaKey(match[1]),
      value: match[2].trim(),
    });
    i += 1;
  }

  return metadata;
}

function parseOpinionBlock(content) {
  const block = content.match(/##\s+Opinion[\s\S]*?```yaml\s*([\s\S]*?)```/i)?.[1];
  if (!block) return {};

  const result = {};
  block.split("\n").forEach((line) => {
    const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:\s*(.+)\s*$/);
    if (!match) return;
    const key = normalizeMetaKey(match[1]);
    const value = match[2].replace(/^["']|["']$/g, "").trim();
    result[key] = value;
  });
  return result;
}

function lookupMeta(metadata, ...keys) {
  for (const key of keys) {
    const normalized = normalizeMetaKey(key);
    const found = metadata.find((item) => item.normalizedKey === normalized);
    if (found?.value) return found.value;
  }
  return "";
}

function parseReportMeta(content, filename) {
  const titleMatch = content.match(/^#\s+(.+)/m);
  const metadata = parseMetadataBlock(content);
  const opinion = parseOpinionBlock(content);
  const companyMatch = titleMatch?.[1]?.match(/^(.+?)\s*\(/);

  const tickerFromTitle = titleMatch?.[1]?.match(/\(([^)]+)\)/)?.[1]?.trim();
  const tickerFromMeta = lookupMeta(metadata, "ticker");
  const ticker = (tickerFromTitle || tickerFromMeta || filename.replace(".md", "")).toUpperCase();

  let dateStr = lookupMeta(metadata, "date") || "—";
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [y, m, d] = dateStr.split("-");
    dateStr = `${m}/${d}/${y}`;
  }

  const action = opinion.action || lookupMeta(metadata, "action");
  const rawRating = opinion.rating || lookupMeta(metadata, "rating");
  const ratingLevel = classifyRating(action, rawRating);

  const sector = lookupMeta(metadata, "sector", "industry");
  const playbook = lookupMeta(metadata, "playbook", "template");
  const confidence = opinion.confidence || lookupMeta(metadata, "confidence");
  const timeframe = opinion.timeframe || opinion["target timeframe"] || opinion.target_timeframe || lookupMeta(metadata, "timeframe");
  const thesis = opinion.thesis || lookupMeta(metadata, "thesis");
  const entryMatch = content.match(/\*\*Entry:\*\*\s*(.+)/);
  const riskRewardMatch = content.match(/\*\*Risk\/Reward:\*\*\s*(.+)/);

  const keyFactPairs = metadata
    .filter((item) => !["date", "playbook", "sector", "ticker", "rating", "action", "confidence", "timeframe", "thesis"].includes(item.normalizedKey))
    .slice(0, 8)
    .map((item) => ({ label: item.key, value: item.value }));

  const searchText = [
    ticker,
    companyMatch?.[1]?.trim(),
    sector,
    playbook,
    ...metadata.map((item) => item.value),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    ticker,
    title: titleMatch?.[1] || `${ticker} Report`,
    company: companyMatch?.[1]?.trim() || ticker,
    date: dateStr,
    sector: sector || "—",
    playbook: playbook || "—",
    ratingLevel,
    action: action || "—",
    confidence: confidence || "—",
    thesis: thesis || "—",
    targetTimeframe: timeframe || "—",
    keyCatalyst: opinion["key catalyst"] || opinion.catalyst || lookupMeta(metadata, "key catalyst") || "—",
    invalidation: opinion.invalidation || lookupMeta(metadata, "invalidation") || "—",
    entry: entryMatch?.[1]?.trim() || "—",
    riskReward: riskRewardMatch?.[1]?.trim() || "—",
    keyFactPairs,
    metadata,
    searchText,
    hasOpinion: Boolean(Object.keys(opinion).length),
  };
}

function renderMarkdown(text) {
  if (!text) return "";
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre class="code-block"><code class="lang-${lang || "text"}">${code.trim()}</code></pre>`
  );

  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  html = html.replace(/((?:^\|.+\|$\n?)+)/gm, (tableBlock) => {
    const rows = tableBlock.trim().split("\n").filter((r) => r.trim());
    if (rows.length < 2) return tableBlock;
    const parseRow = (r) => r.split("|").slice(1, -1).map((c) => c.trim());
    const headers = parseRow(rows[0]);
    const isSep = (r) => /^[\s|:-]+$/.test(r);
    const dataRows = rows.filter((_, i) => i !== 0 && !isSep(rows[i]));
    let t = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>`;
    dataRows.forEach((r) => {
      t += `<tr>${parseRow(r).map((c) => `<td>${c}</td>`).join("")}</tr>`;
    });
    t += "</tbody></table>";
    return t;
  });

  html = html.replace(/^###\s+(.+)$/gm, (_, title) => `<h3 id="${slugify(title)}">${title}</h3>`);
  html = html.replace(/^##\s+(.+)$/gm, (_, title) => `<h2 id="${slugify(title)}">${title}</h2>`);
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");
  html = html.replace(/^&gt;\s+(.+)$/gm, "<blockquote>$1</blockquote>");

  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ol">$1</li>');
  html = html.replace(/((?:<li class="ol">.*<\/li>\n?)+)/g, (m) => `<ol>${m.replace(/ class="ol"/g, "")}</ol>`);

  html = html.replace(/^---+$/gm, "<hr/>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  html = html.replace(/^(?!<[a-z/])((?:(?!<[a-z/]).)+)$/gm, (m) => {
    const trimmed = m.trim();
    if (!trimmed) return "";
    return `<p>${trimmed}</p>`;
  });

  return html;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M13.9 12.5h-.74l-.26-.25a5.9 5.9 0 10-.64.64l.25.26v.74L17 18.4 18.4 17l-4.5-4.5zM8.5 13A4.5 4.5 0 118.5 4a4.5 4.5 0 010 9z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h2v16H4V4zm14 6h2v10h-2V10zM9 12h2v8H9v-8zm5-8h2v16h-2V4z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" />
    </svg>
  );
}

function ConfidenceBar({ value }) {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return <span className="muted-text">—</span>;
  const pct = Math.round(num * 100);
  const tone = pct >= 70 ? "success" : pct >= 50 ? "warning" : "danger";
  return (
    <div className="confidence-wrap">
      <div className="confidence-track">
        <div className={`confidence-fill tone-${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="confidence-value">{pct}%</span>
    </div>
  );
}

function ReportCard({ report, isActive, onClick }) {
  const tone = getRatingTone(report.meta.ratingLevel);
  const subtitle = report.meta.sector !== "—" ? report.meta.sector : report.meta.playbook;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`report-card ${isActive ? "active" : ""}`}
      aria-pressed={isActive}
    >
      <div className="report-card-top">
        <span className="ticker">{report.meta.ticker}</span>
        <span className={`rating-pill tone-${tone}`}>{report.meta.ratingLevel}</span>
      </div>
      <div className="company-name">{report.meta.company}</div>
      <div className="sector-name">{subtitle || "General"}</div>
    </button>
  );
}

function ReportHeader({ meta }) {
  const tone = getRatingTone(meta.ratingLevel);
  const primaryCards = [
    { label: "Action", value: meta.action },
    { label: "Confidence", value: meta.confidence, isConfidence: true },
    { label: "Timeframe", value: meta.targetTimeframe },
    { label: "Entry", value: meta.entry },
    { label: "Risk / Reward", value: meta.riskReward },
    { label: "Key Catalyst", value: meta.keyCatalyst },
  ].filter((item) => item.value && item.value !== "—");

  const metaStack = [
    { label: "Date", value: meta.date },
    { label: "Sector", value: meta.sector },
    { label: "Playbook", value: meta.playbook },
  ].filter((item) => item.value && item.value !== "—");

  return (
    <section className="header-card">
      <div className="header-top">
        <div>
          <div className="meta-label">Rating</div>
          <div className={`rating-chip tone-${tone}`}>{meta.ratingLevel}</div>
        </div>
        <div className="meta-stack">
          {metaStack.map((item) => (
            <span key={item.label}>
              <strong>{item.label}:</strong> <span className={item.label === "Playbook" ? "mono" : ""}>{item.value}</span>
            </span>
          ))}
        </div>
      </div>

      {primaryCards.length > 0 && (
        <div className="header-grid">
          {primaryCards.map((item) => (
            <div key={item.label}>
              <div className="meta-label">{item.label}</div>
              {item.isConfidence ? <ConfidenceBar value={item.value} /> : <div className="meta-value">{item.value}</div>}
            </div>
          ))}
        </div>
      )}

      {meta.keyFactPairs?.length > 0 && (
        <div className="thesis-row">
          <div className="meta-label">Key Facts</div>
          <div className="facts-wrap">
            {meta.keyFactPairs.map((fact) => (
              <span key={`${fact.label}-${fact.value}`} className="fact-pill">
                <strong>{toTitleCase(fact.label)}:</strong> {fact.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {meta.thesis !== "—" && (
        <div className="thesis-row">
          <div className="meta-label">Thesis</div>
          <p>{meta.thesis}</p>
        </div>
      )}
    </section>
  );
}

function LoadingSidebar() {
  return (
    <div className="loading-list" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-line w-40" />
          <div className="skeleton skeleton-line w-80" />
          <div className="skeleton skeleton-line w-60" />
        </div>
      ))}
    </div>
  );
}

function LoadingContent() {
  return (
    <div className="loading-content" aria-hidden="true">
      <div className="skeleton skeleton-block h-180" />
      <div className="skeleton skeleton-block h-24" />
      <div className="skeleton skeleton-line w-90" />
      <div className="skeleton skeleton-line w-70" />
      <div className="skeleton skeleton-line w-85" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <ChartIcon />
      </div>
      <h2>No Reports Yet</h2>
      <p>Run the research pipeline to generate investment reports. Try this to start.</p>
      <code>research NVDA</code>
    </div>
  );
}

function NoSearchResults({ search, onReset }) {
  return (
    <div className="empty-state compact">
      <h2>No matching reports</h2>
      <p>Try another ticker, company name, or sector.</p>
      <div className="empty-actions">
        <code>{search}</code>
        <button type="button" className="btn-ghost" onClick={onReset}>
          Clear Search
        </button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>Analyst Research Framework</span>
    </footer>
  );
}

function TocPanel({ headings, activeHeading, onJump }) {
  if (!headings.length) return null;
  return (
    <aside className="toc-panel">
      <div className="toc-title">Quick Navigation</div>
      {headings.map((h) => (
        <button
          key={`${h.id}-${h.depth}`}
          type="button"
          className={`toc-item depth-${h.depth} ${activeHeading === h.id ? "active" : ""}`}
          onClick={() => onJump(h.id)}
        >
          {h.text}
        </button>
      ))}
    </aside>
  );
}

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilename, setSelectedFilename] = useState("");
  const [search, setSearch] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isTopbarCompact, setIsTopbarCompact] = useState(false);
  const [activeHeading, setActiveHeading] = useState("");

  const searchRef = useRef(null);
  const contentScrollRef = useRef(null);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        const modules = import.meta.glob("/reports/*.md", { query: "?raw", import: "default" });
        const loaded = [];
        for (const [path, resolver] of Object.entries(modules)) {
          const content = await resolver();
          const filename = path.split("/").pop();
          const meta = parseReportMeta(content, filename);
          loaded.push({ filename, content, meta, path });
        }
        loaded.sort((a, b) => a.meta.ticker.localeCompare(b.meta.ticker));
        setReports(loaded);
      } catch (error) {
        console.log("Glob import not available, trying fetch fallback", error);
        const knownFiles = ["copx.md", "uuuu.md", "goog.md"];
        const loaded = [];
        for (const filename of knownFiles) {
          try {
            const resp = await fetch(`/reports/${filename}`);
            if (resp.ok) {
              const content = await resp.text();
              const meta = parseReportMeta(content, filename);
              loaded.push({ filename, content, meta, path: `/reports/${filename}` });
            }
          } catch {
            // Keep fallback resilient with partial files.
          }
        }
        loaded.sort((a, b) => a.meta.ticker.localeCompare(b.meta.ticker));
        setReports(loaded);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    if (!search.trim()) return reports;
    const q = search.toLowerCase();
    return reports.filter((r) => r.meta.searchText.includes(q));
  }, [reports, search]);

  useEffect(() => {
    if (!filteredReports.length) {
      setSelectedFilename("");
      return;
    }
    if (!selectedFilename || !filteredReports.some((r) => r.filename === selectedFilename)) {
      setSelectedFilename(filteredReports[0].filename);
    }
  }, [filteredReports, selectedFilename]);

  const selectedReport = useMemo(
    () => filteredReports.find((r) => r.filename === selectedFilename) || filteredReports[0],
    [filteredReports, selectedFilename]
  );

  const cleanedContent = useMemo(
    () => (selectedReport ? cleanReportContent(selectedReport.content) : ""),
    [selectedReport]
  );
  const headings = useMemo(() => extractHeadings(cleanedContent), [cleanedContent]);
  const renderedHTML = useMemo(() => renderMarkdown(cleanedContent), [cleanedContent]);

  const reportStats = useMemo(() => {
    const counts = RATING_LEVELS.reduce((acc, level) => ({ ...acc, [level]: 0 }), {});
    filteredReports.forEach((r) => {
      counts[r.meta.ratingLevel] += 1;
    });
    return counts;
  }, [filteredReports]);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e) => setSidebarWidth(Math.max(260, Math.min(460, e.clientX)));
    const onUp = () => setIsResizing(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const target = e.target;
      const tag = target?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea";

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }

      if (!filteredReports.length || isTyping) return;
      const idx = filteredReports.findIndex((r) => r.filename === selectedReport?.filename);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = filteredReports[Math.min(idx + 1, filteredReports.length - 1)];
        if (next) setSelectedFilename(next.filename);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = filteredReports[Math.max(idx - 1, 0)];
        if (prev) setSelectedFilename(prev.filename);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filteredReports, selectedReport]);

  useEffect(() => {
    const container = contentScrollRef.current;
    if (!container) return;

    const onScroll = () => {
      const compact = container.scrollTop > 28;
      setIsTopbarCompact(compact);

      const headingEls = Array.from(container.querySelectorAll(".md-content h2[id], .md-content h3[id]"));
      let current = "";
      for (const el of headingEls) {
        if (el.offsetTop - container.scrollTop <= 130) {
          current = el.id;
        }
      }
      setActiveHeading(current);
    };

    container.addEventListener("scroll", onScroll);
    onScroll();
    return () => container.removeEventListener("scroll", onScroll);
  }, [renderedHTML]);

  function jumpToHeading(id) {
    const container = contentScrollRef.current;
    if (!container) return;
    const node = container.querySelector(`#${id}`);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveHeading(id);
    }
  }

  return (
    <div className="dashboard-shell">
      <div className={`mobile-overlay ${isSidebarOpenMobile ? "show" : ""}`} onClick={() => setIsSidebarOpenMobile(false)} />

      <aside
        className={`sidebar ${isSidebarOpenMobile ? "open-mobile" : ""}`}
        style={{ width: sidebarWidth }}
      >
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-icon" aria-hidden="true">
              <ChartIcon />
            </span>
            <div>
              <div className="brand-title">My Reports</div>
              <div className="brand-subtitle">
                {reports.length} report{reports.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn mobile-only"
            onClick={() => setIsSidebarOpenMobile(false)}
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="rating-summary">
          {RATING_LEVELS.map((level) => (
            <span key={level} className={`summary-pill tone-${getRatingTone(level)}`}>
              {level}: {reportStats[level]}
            </span>
          ))}
        </div>

        <div className="search-wrap">
          <SearchIcon />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search reports... (Cmd/Ctrl+K)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sidebar-list">
          {isLoading ? (
            <LoadingSidebar />
          ) : (
            filteredReports.map((report) => (
              <ReportCard
                key={report.filename}
                report={report}
                isActive={selectedReport?.filename === report.filename}
                onClick={() => {
                  setSelectedFilename(report.filename);
                  setIsSidebarOpenMobile(false);
                }}
              />
            ))
          )}
        </div>
      </aside>

      <div
        className={`resize-handle ${isResizing ? "active" : ""}`}
        onMouseDown={() => setIsResizing(true)}
      />

      <main className="content-shell">
        <header className={`topbar ${isTopbarCompact ? "compact" : ""}`}>
          <button
            type="button"
            className="icon-btn mobile-only"
            onClick={() => setIsSidebarOpenMobile(true)}
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>

          {selectedReport ? (
            <>
              <span className="topbar-ticker">{selectedReport.meta.ticker}</span>
              <span className="topbar-divider">/</span>
              <span className="topbar-company">{selectedReport.meta.company}</span>
              <span className="topbar-file">{selectedReport.filename}</span>
            </>
          ) : (
            <span className="topbar-company">Analyst Dashboard</span>
          )}
        </header>

        <div className="content-body" ref={contentScrollRef}>
          {isLoading ? (
            <LoadingContent />
          ) : selectedReport ? (
            <div className="content-layout">
              <article className="report-main fade-in" key={selectedReport.filename}>
                <ReportHeader meta={selectedReport.meta} />
                <div className="md-content" dangerouslySetInnerHTML={{ __html: renderedHTML }} />
                <Footer />
              </article>
              <TocPanel headings={headings} activeHeading={activeHeading} onJump={jumpToHeading} />
            </div>
          ) : search ? (
            <NoSearchResults search={search} onReset={() => setSearch("")} />
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}
