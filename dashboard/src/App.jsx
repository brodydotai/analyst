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
  return content
    .replace(
      /^# .+\n(?:\n)?(?:\*\*[^*\n]+:\*\*.*\n)+\n---\n/m,
      (match) => match.split("\n")[0] + "\n\n"
    )
    .replace(/---\s*\n## Opinion\s*\n```yaml[\s\S]*?```\s*\n---/m, "---");
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

function parseReportMeta(content, filename) {
  const ticker = filename.replace(".md", "").toUpperCase();
  const titleMatch = content.match(/^#\s+(.+)/m);
  const dateMatch = content.match(/\*\*Date:\*\*\s*(\S+)/);
  const sectorMatch = content.match(/\*\*Sector:\*\*\s*(.+)/);
  const playbookMatch = content.match(/\*\*Playbook:\*\*\s*(.+)/);

  const actionMatch = content.match(/action:\s*["']?([^"'\n]+)/);
  const confidenceMatch = content.match(/confidence:\s*["']?([^"'\n]+)/);
  const ratingMatch = content.match(/rating:\s*["']?([^"'\n]+)/);
  const thesisMatch = content.match(/thesis:\s*["']([^"']+)["']/);
  const targetTimeframeMatch = content.match(/target_timeframe:\s*["']([^"']+)["']/);
  const keyCatalystMatch = content.match(/key_catalyst:\s*["']([^"']+)["']/);
  const invalidationMatch = content.match(/invalidation:\s*["']([^"']+)["']/);

  const entryMatch = content.match(/\*\*Entry:\*\*\s*(.+)/);
  const riskRewardMatch = content.match(/\*\*Risk\/Reward:\*\*\s*(.+)/);
  const companyMatch = titleMatch?.[1]?.match(/^(.+?)\s*\(/);

  let dateStr = dateMatch?.[1] || "—";
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [y, m, d] = dateStr.split("-");
    dateStr = `${m}/${d}/${y}`;
  }

  const action = actionMatch?.[1]?.trim() || "";
  const rawRating = ratingMatch?.[1]?.trim() || "";
  const ratingLevel = classifyRating(action, rawRating);

  return {
    ticker,
    title: titleMatch?.[1] || `${ticker} Report`,
    company: companyMatch?.[1]?.trim() || ticker,
    date: dateStr,
    sector: sectorMatch?.[1]?.trim() || "—",
    playbook: playbookMatch?.[1]?.trim() || "—",
    ratingLevel,
    action: action || "—",
    confidence: confidenceMatch?.[1]?.trim() || "—",
    thesis: thesisMatch?.[1]?.trim() || "—",
    targetTimeframe: targetTimeframeMatch?.[1]?.trim() || "—",
    keyCatalyst: keyCatalystMatch?.[1]?.trim() || "—",
    invalidation: invalidationMatch?.[1]?.trim() || "—",
    entry: entryMatch?.[1]?.trim() || "—",
    riskReward: riskRewardMatch?.[1]?.trim() || "—",
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
      <div className="sector-name">{report.meta.sector}</div>
    </button>
  );
}

function ReportHeader({ meta }) {
  const tone = getRatingTone(meta.ratingLevel);
  return (
    <section className="header-card">
      <div className="header-top">
        <div>
          <div className="meta-label">Rating</div>
          <div className={`rating-chip tone-${tone}`}>{meta.ratingLevel}</div>
        </div>
        <div className="meta-stack">
          <span>{meta.date}</span>
          <span>{meta.sector}</span>
          <span className="mono">{meta.playbook}</span>
        </div>
      </div>

      <div className="header-grid">
        <div>
          <div className="meta-label">Action</div>
          <div className="meta-value">{meta.action}</div>
        </div>
        <div>
          <div className="meta-label">Confidence</div>
          <ConfidenceBar value={meta.confidence} />
        </div>
        <div>
          <div className="meta-label">Timeframe</div>
          <div className="meta-value">{meta.targetTimeframe}</div>
        </div>
      </div>

      <div className="header-grid">
        <div>
          <div className="meta-label">Entry</div>
          <div className="meta-value">{meta.entry}</div>
        </div>
        <div>
          <div className="meta-label">Risk / Reward</div>
          <div className="meta-value">{meta.riskReward}</div>
        </div>
        <div>
          <div className="meta-label">Key Catalyst</div>
          <div className="meta-value">{meta.keyCatalyst}</div>
        </div>
      </div>

      <div className="thesis-row">
        <div className="meta-label">Thesis</div>
        <p>{meta.thesis}</p>
      </div>
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
      <span>Generated by Claude</span>
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
    return reports.filter(
      (r) =>
        r.meta.ticker.toLowerCase().includes(q) ||
        r.meta.company.toLowerCase().includes(q) ||
        r.meta.sector.toLowerCase().includes(q)
    );
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
