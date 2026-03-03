import { useState, useEffect, useMemo } from "react";

// ── File content embedded at build time ──
// In production this would use fs reads; here we inline for portability.
const FILE_TREE = {
  "CLAUDE.md": { type: "md", category: "root" },
  "README.md": { type: "md", category: "root" },
  "skills/research/SKILL.md": { type: "md", category: "skill" },
  "skills/watchlist/SKILL.md": { type: "md", category: "skill" },
  ".agents/README.md": { type: "md", category: "agents" },
  ".agents/registry.md": { type: "md", category: "agents" },
  ".agents/protocol.md": { type: "md", category: "agents" },
  ".agents/compliance/rules.json": { type: "json", category: "compliance" },
  ".agents/templates/report-structure.md": { type: "md", category: "templates" },
  ".agents/templates/watchlist-report-structure.md": { type: "md", category: "templates" },
  ".agents/templates/opinion-block.yaml": { type: "yaml", category: "templates" },
  ".agents/templates/perspective-summary.md": { type: "md", category: "templates" },
  ".agents/templates/search-queries.md": { type: "md", category: "templates" },
  ".agents/templates/droyd-crypto-experiments.md": { type: "md", category: "templates" },
  ".agents/templates/api-routing-index.yaml": { type: "yaml", category: "templates" },
  ".agents/research/equity/INSTRUCTIONS.md": { type: "md", category: "research" },
  ".agents/research/compliance/INSTRUCTIONS.md": { type: "md", category: "research" },
  ".agents/research/bull/INSTRUCTIONS.md": { type: "md", category: "research" },
  ".agents/research/bear/INSTRUCTIONS.md": { type: "md", category: "research" },
  ".agents/research/macro/INSTRUCTIONS.md": { type: "md", category: "research" },
  ".agents/research/synthesis/INSTRUCTIONS.md": { type: "md", category: "research" },
  ".agents/playbooks/index.yaml": { type: "yaml", category: "playbooks" },
  ".agents/playbooks/sections.schema.json": { type: "json", category: "playbooks" },
};

// Playbook directories
const PLAYBOOKS = [
  "_default", "agriculture-and-food-systems", "banking-and-financial-services",
  "bitcoin-mining-and-crypto-infrastructure", "chinese-ai-and-deep-tech",
  "consumer-and-ecommerce", "cybersecurity", "data-centers-and-cloud-infrastructure",
  "defense-and-weapons", "drones", "electric-vehicles-and-autonomous-driving",
  "fintech-and-payments", "gaming-and-interactive-entertainment",
  "healthcare-equipment-and-medtech", "industrial-testing-inspection-certification",
  "oil-and-gas", "pharmaceuticals", "precious-and-rare-earth-metals",
  "precious-metal-miners", "precious-metals-commodity", "quantum",
  "reits-and-real-estate", "robotics-and-process-automation", "saas",
  "semiconductors-and-accelerators", "shipping-and-maritime",
  "social-media-and-digital-advertising", "space",
  "specialty-and-advanced-materials", "uranium-and-nuclear-fuel", "utilities"
];

PLAYBOOKS.forEach(p => {
  FILE_TREE[`.agents/playbooks/${p}/playbook.prompt.md`] = { type: "md", category: "playbook-detail" };
  FILE_TREE[`.agents/playbooks/${p}/sections.json`] = { type: "json", category: "playbook-detail" };
});

// ── Sidebar tree builder ──
function buildTree(paths) {
  const root = { name: "analyst", children: {}, files: [] };
  paths.forEach(path => {
    const parts = path.split("/");
    let node = root;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        node.files.push({ name: part, path });
      } else {
        if (!node.children[part]) node.children[part] = { name: part, children: {}, files: [] };
        node = node.children[part];
      }
    });
  });
  return root;
}

// ── Markdown-to-HTML (lightweight) ──
function renderMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Fenced code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre class="code-block"><code class="lang-${lang || "text"}">${code.trim()}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Tables
  html = html.replace(/((?:^\|.+\|$\n?)+)/gm, (tableBlock) => {
    const rows = tableBlock.trim().split("\n").filter(r => r.trim());
    if (rows.length < 2) return tableBlock;
    const parseRow = r => r.split("|").slice(1, -1).map(c => c.trim());
    const headers = parseRow(rows[0]);
    const isSep = r => /^[\s|:-]+$/.test(r);
    const sepIdx = rows.findIndex(isSep);
    const dataRows = rows.filter((_, i) => i !== 0 && !isSep(rows[i]));
    let t = '<table><thead><tr>' + headers.map(h => `<th>${h}</th>`).join("") + '</tr></thead><tbody>';
    dataRows.forEach(r => { t += '<tr>' + parseRow(r).map(c => `<td>${c}</td>`).join("") + '</tr>'; });
    t += '</tbody></table>';
    return t;
  });

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Bold, italic, strikethrough
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ol">$1</li>');
  html = html.replace(/((?:<li class="ol">.*<\/li>\n?)+)/g, (m) =>
    '<ol>' + m.replace(/ class="ol"/g, '') + '</ol>'
  );

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr/>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Paragraphs (lines not already wrapped)
  html = html.replace(/^(?!<[a-z/])((?:(?!<[a-z/]).)+)$/gm, (m) => {
    const t = m.trim();
    if (!t) return "";
    return `<p>${t}</p>`;
  });

  return html;
}

// ── Folder icon ──
const FolderIcon = ({ open }) => (
  <span style={{ marginRight: 6, fontSize: 14, opacity: 0.7 }}>
    {open ? "📂" : "📁"}
  </span>
);

const FileIcon = ({ type }) => {
  const icons = { md: "📄", json: "⚙️", yaml: "📋" };
  return <span style={{ marginRight: 6, fontSize: 13 }}>{icons[type] || "📄"}</span>;
};

// ── Tree node component ──
function TreeNode({ node, depth, selectedPath, onSelect, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || depth < 2);
  const dirs = Object.values(node.children).sort((a, b) => a.name.localeCompare(b.name));
  const files = [...node.files].sort((a, b) => a.name.localeCompare(b.name));
  const hasChildren = dirs.length > 0 || files.length > 0;
  const indent = depth * 16;

  const dirLabel = node.name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    .replace(/^\./, "");

  return (
    <div>
      {depth > 0 && (
        <div
          onClick={() => setOpen(!open)}
          style={{
            paddingLeft: indent,
            paddingTop: 4, paddingBottom: 4,
            cursor: hasChildren ? "pointer" : "default",
            display: "flex", alignItems: "center",
            fontSize: 13, fontWeight: 500,
            color: "#c9d1d9",
            userSelect: "none",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <FolderIcon open={open} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {dirLabel}
          </span>
          {hasChildren && (
            <span style={{ marginLeft: "auto", paddingRight: 8, fontSize: 10, opacity: 0.4 }}>
              {open ? "▾" : "▸"}
            </span>
          )}
        </div>
      )}
      {(open || depth === 0) && (
        <div>
          {dirs.map(d => (
            <TreeNode
              key={d.name} node={d} depth={depth + 1}
              selectedPath={selectedPath} onSelect={onSelect}
            />
          ))}
          {files.map(f => {
            const ext = f.name.split(".").pop();
            const isActive = f.path === selectedPath;
            return (
              <div
                key={f.path}
                onClick={() => onSelect(f.path)}
                style={{
                  paddingLeft: indent + 16,
                  paddingTop: 4, paddingBottom: 4,
                  cursor: "pointer",
                  display: "flex", alignItems: "center",
                  fontSize: 12.5,
                  color: isActive ? "#58a6ff" : "#8b949e",
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? "rgba(88,166,255,0.08)" : "transparent",
                  borderRight: isActive ? "2px solid #58a6ff" : "2px solid transparent",
                  userSelect: "none",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <FileIcon type={ext} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Search component ──
function SearchBar({ value, onChange }) {
  return (
    <div style={{ padding: "12px 12px 8px" }}>
      <input
        type="text"
        placeholder="Search files..."
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "6px 10px", fontSize: 12,
          background: "#161b22", border: "1px solid #30363d",
          borderRadius: 6, color: "#c9d1d9",
          outline: "none",
        }}
        onFocus={e => e.target.style.borderColor = "#58a6ff"}
        onBlur={e => e.target.style.borderColor = "#30363d"}
      />
    </div>
  );
}

// ── Main app ──
export default function Dashboard() {
  const [selectedPath, setSelectedPath] = useState("README.md");
  const [fileContent, setFileContent] = useState("");
  const [search, setSearch] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  // All file paths
  const allPaths = useMemo(() => Object.keys(FILE_TREE).sort(), []);

  // Filtered paths based on search
  const filteredPaths = useMemo(() => {
    if (!search.trim()) return allPaths;
    const q = search.toLowerCase();
    return allPaths.filter(p => p.toLowerCase().includes(q));
  }, [allPaths, search]);

  // Build tree from filtered paths
  const tree = useMemo(() => buildTree(filteredPaths), [filteredPaths]);

  // Simulated file loading — in a real deployment this reads from disk
  useEffect(() => {
    // We use a placeholder that tells the user to load files
    const meta = FILE_TREE[selectedPath];
    if (!meta) {
      setFileContent("# File Not Found\n\nThis file path doesn't exist in the framework index.");
      return;
    }
    // Generate helpful content based on the file path
    const fileName = selectedPath.split("/").pop();
    const dirName = selectedPath.split("/").slice(0, -1).join("/");

    setFileContent(generatePreviewContent(selectedPath, meta));
  }, [selectedPath]);

  // Resize handler
  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e) => setSidebarWidth(Math.max(200, Math.min(500, e.clientX)));
    const onUp = () => setIsResizing(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [isResizing]);

  // Stats
  const stats = useMemo(() => ({
    totalFiles: allPaths.length,
    playbooks: PLAYBOOKS.length,
    agents: 6,
    templates: allPaths.filter(p => p.includes("/templates/")).length,
  }), [allPaths]);

  const renderedHTML = useMemo(() => {
    const meta = FILE_TREE[selectedPath];
    if (meta && (meta.type === "json" || meta.type === "yaml")) {
      return `<pre class="code-block"><code class="lang-${meta.type}">${fileContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
    }
    return renderMarkdown(fileContent);
  }, [fileContent, selectedPath]);

  return (
    <div style={{
      display: "flex", height: "100vh", width: "100vw",
      background: "#0d1117", color: "#c9d1d9",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      overflow: "hidden",
    }}>
      {/* ── Sidebar ── */}
      <div style={{
        width: sidebarWidth, minWidth: 200, maxWidth: 500,
        background: "#0d1117",
        borderRight: "1px solid #21262d",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid #21262d",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>📊</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#f0f6fc", letterSpacing: -0.3 }}>
              Analyst
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.5 }}>
            Investment Research Framework
          </div>
          <div style={{
            display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: "#8b949e",
          }}>
            <span title="Total files">{stats.totalFiles} files</span>
            <span style={{ color: "#30363d" }}>|</span>
            <span title="Sector playbooks">{stats.playbooks} playbooks</span>
            <span style={{ color: "#30363d" }}>|</span>
            <span title="Research agents">{stats.agents} agents</span>
          </div>
        </div>

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} />

        {/* Tree */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: 20 }}>
          <TreeNode
            node={tree} depth={0}
            selectedPath={selectedPath}
            onSelect={setSelectedPath}
          />
        </div>
      </div>

      {/* ── Resize handle ── */}
      <div
        onMouseDown={() => setIsResizing(true)}
        style={{
          width: 4, cursor: "col-resize",
          background: isResizing ? "#58a6ff" : "transparent",
          transition: "background 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={e => { if (!isResizing) e.currentTarget.style.background = "#30363d"; }}
        onMouseLeave={e => { if (!isResizing) e.currentTarget.style.background = "transparent"; }}
      />

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Breadcrumb bar */}
        <div style={{
          padding: "10px 24px",
          borderBottom: "1px solid #21262d",
          fontSize: 12, color: "#8b949e",
          display: "flex", alignItems: "center", gap: 6,
          background: "#0d1117",
          flexShrink: 0,
        }}>
          {selectedPath.split("/").map((part, i, arr) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {i > 0 && <span style={{ color: "#30363d" }}>/</span>}
              <span style={{
                color: i === arr.length - 1 ? "#f0f6fc" : "#8b949e",
                fontWeight: i === arr.length - 1 ? 600 : 400,
              }}>
                {part}
              </span>
            </span>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#484f58" }}>
            {FILE_TREE[selectedPath]?.type?.toUpperCase() || ""}
          </span>
        </div>

        {/* Content area */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "32px 48px 64px",
          maxWidth: 900,
        }}>
          <style>{`
            .md-content h1 { font-size: 28px; font-weight: 700; color: #f0f6fc; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 1px solid #21262d; }
            .md-content h2 { font-size: 22px; font-weight: 600; color: #f0f6fc; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #21262d; }
            .md-content h3 { font-size: 18px; font-weight: 600; color: #e6edf3; margin: 24px 0 10px; }
            .md-content h4 { font-size: 15px; font-weight: 600; color: #e6edf3; margin: 20px 0 8px; }
            .md-content h5, .md-content h6 { font-size: 14px; font-weight: 600; color: #c9d1d9; margin: 16px 0 8px; }
            .md-content p { margin: 8px 0; line-height: 1.7; font-size: 14px; }
            .md-content strong { color: #e6edf3; }
            .md-content em { color: #c9d1d9; }
            .md-content a { color: #58a6ff; text-decoration: none; }
            .md-content a:hover { text-decoration: underline; }
            .md-content ul, .md-content ol { margin: 8px 0; padding-left: 24px; }
            .md-content li { margin: 4px 0; line-height: 1.6; font-size: 14px; }
            .md-content blockquote {
              border-left: 3px solid #3b82f6; padding: 8px 16px;
              margin: 12px 0; color: #8b949e; background: rgba(56,139,253,0.05);
              border-radius: 0 6px 6px 0;
            }
            .md-content hr { border: none; border-top: 1px solid #21262d; margin: 24px 0; }
            .md-content table {
              border-collapse: collapse; width: 100%; margin: 16px 0;
              font-size: 13px;
            }
            .md-content th {
              text-align: left; padding: 8px 12px;
              border-bottom: 2px solid #30363d;
              color: #f0f6fc; font-weight: 600; font-size: 12px;
              text-transform: uppercase; letter-spacing: 0.5px;
            }
            .md-content td {
              padding: 8px 12px; border-bottom: 1px solid #21262d;
            }
            .md-content tr:hover td { background: rgba(255,255,255,0.02); }
            .md-content .code-block {
              background: #161b22; border: 1px solid #30363d;
              border-radius: 8px; padding: 16px; margin: 12px 0;
              overflow-x: auto; font-size: 13px; line-height: 1.5;
            }
            .md-content .code-block code { font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; }
            .md-content .inline-code {
              background: rgba(110,118,129,0.2); padding: 2px 6px;
              border-radius: 4px; font-size: 12.5px;
              font-family: 'SF Mono', 'Fira Code', monospace;
              color: #e6edf3;
            }
            .md-content del { color: #484f58; }
            /* Scrollbar */
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
            ::-webkit-scrollbar-thumb:hover { background: #484f58; }
          `}</style>
          <div
            className="md-content"
            dangerouslySetInnerHTML={{ __html: renderedHTML }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Content generator for preview ──
function generatePreviewContent(path, meta) {
  const parts = path.split("/");
  const fileName = parts[parts.length - 1];

  // Playbook directories
  if (path.includes("/playbooks/") && path.endsWith("playbook.prompt.md")) {
    const playbook = parts[parts.length - 2];
    const label = playbook.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return `# ${label} — Playbook\n\n> Sector-specific investment research prompt for the **${label}** vertical.\n\n## File Location\n\n\`${path}\`\n\n## Usage\n\nThis playbook is automatically loaded by the **equity research agent** during Phase 1 of the pipeline. It defines:\n\n- **Role** — the analyst persona and domain expertise\n- **Section A** — Foundational synthesis and company classification\n- **Section B** — Sector-specific economics and metrics\n- **Section C** — Macro and cycle positioning\n- **Section D** — Financial logic and valuation frameworks\n- **Section E** — Pattern matching and red flag detection\n- **Section F** — Investigation tracks for deep-dive research\n\n## How to Trigger\n\nAny ticker mapped to this playbook in \`index.yaml\` will automatically route here. You can also force it:\n\n\`\`\`\nresearch TICKER --playbook ${playbook}\n\`\`\`\n\n## Companion Files\n\n| File | Purpose |\n|------|--------|\n| \`sections.json\` | Compressed index for compliance scoring |\n| \`../../compliance/rules.json\` | Scoring weights and thresholds |\n`;
  }

  if (path.includes("/playbooks/") && path.endsWith("sections.json")) {
    const playbook = parts[parts.length - 2];
    const label = playbook.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return `# ${label} — Section Index\n\n> Compressed compliance index for the **${label}** playbook.\n\n## Purpose\n\nThis JSON file enables the **compliance agent** to score reports without loading the full playbook text — saving ~5K tokens per run.\n\n## Schema\n\nFollows \`.agents/playbooks/sections.schema.json\`:\n\n- **sections[]** — array of section objects (id, title, required_elements)\n- **structural_requirements[]** — cross-section checks (Opinion block, Summary, citations, investigation tracks)\n\n## File Location\n\n\`${path}\``;
  }

  if (path.includes("/research/") && fileName === "INSTRUCTIONS.md") {
    const agent = parts[parts.length - 2];
    const label = agent.charAt(0).toUpperCase() + agent.slice(1);
    const roles = {
      equity: "Generates the primary research report by executing the assigned playbook with web research.",
      compliance: "Scores reports against playbook requirements and produces scorecards.",
      bull: "Produces the strongest data-grounded bull case from the report summary.",
      bear: "Produces the strongest data-grounded bear case from the report summary.",
      macro: "Assesses how the current macro regime affects the investment thesis.",
      synthesis: "Reconciles all perspectives into a final recommendation with conviction rating.",
    };
    return `# ${label} Agent — Instructions\n\n> **Role:** ${roles[agent] || "Specialized research agent."}\n\n## File Location\n\n\`${path}\`\n\n## Pipeline Position\n\n${agent === "equity" ? "**Phase 1** — First agent to execute. Produces the report that all downstream agents consume." :
      agent === "compliance" ? "**Phase 2** — Runs after the equity agent. Scores the report against playbook requirements." :
      agent === "synthesis" ? "**Phase 4** — Final agent. Reconciles equity report, scorecard, and all perspectives." :
      "**Phase 3** — Runs in parallel with other perspective agents after the equity report is complete."}\n\n## Key Constraints\n\n- Boot sequence must consume < 2,000 tokens\n- Reads only its INSTRUCTIONS.md + the minimum required input\n- ${["bull", "bear", "macro"].includes(agent) ? "Does NOT write files — returns structured JSON to orchestrator" : `Writes to \`artifacts/{asset_class}/\``}`;
  }

  if (path.includes("/templates/")) {
    const label = fileName.replace(/\.[^.]+$/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return `# ${label} — Template\n\n> Agent template file used during pipeline execution.\n\n## File Location\n\n\`${path}\`\n\n## Usage\n\nThis template is referenced by agents during their execution phase. Templates provide standardized output formats and query patterns to ensure consistency across research runs.`;
  }

  if (path === "CLAUDE.md") {
    return `# CLAUDE.md — Orchestrator Boot Context\n\n> This is the primary context file read by Claude at session start. It defines the framework identity, pipeline overview, operating rules, and token budgets.\n\n## What It Does\n\nWhen a user opens this repository in Claude Cowork, Claude reads this file first to understand:\n\n- What the framework is (multi-agent investment research)\n- How to trigger a pipeline run (\`research NVDA\`)\n- The boot sequence (CLAUDE.md → SKILL.md → index.yaml)\n- Operating rules (no fabrication, cite sources, lean instructions)\n- Token budget targets (< 80K for full pipeline)\n\n## File Location\n\n\`CLAUDE.md\` (repository root)`;
  }

  if (path === "README.md") {
    return `# README.md — User Setup Guide\n\n> User-facing documentation for the Analyst framework.\n\n## Contents\n\n- How to install (add folder to Claude Cowork session)\n- Available commands (\`research\`, \`analyze\`, \`run equity research\`, etc.)\n- Output format (4 artifacts per run)\n- Architecture overview (5-phase pipeline, 6 agents)\n- Directory structure\n- Available playbooks (31 sector-specific + fallback)\n- How to add new playbooks and agents\n\n## File Location\n\n\`README.md\` (repository root)`;
  }

  if (path === "skills/research/SKILL.md") {
    return `# Research Orchestrator — Skill Definition\n\n> The core skill that drives the full investment research pipeline.\n\n## Trigger Phrases\n\n- \`research {TICKER}\`\n- \`analyze {TICKER}\`\n- \`run playbook on {TICKER}\`\n\n## Pipeline Phases\n\n| Phase | Agent | Output |\n|-------|-------|--------|\n| 0 | Orchestrator | Playbook auto-detection |\n| 1 | Equity | Full research report |\n| 2 | Compliance | Scorecard |\n| 3 | Bull + Bear + Macro | Perspectives JSON |\n| 4 | Synthesis | Final recommendation |\n| 5 | Orchestrator | Delivery to user |\n\n## Token Budget\n\nTotal target: < 80K tokens\n\n## File Location\n\n\`skills/research/SKILL.md\``;
  }

  if (path === ".agents/registry.md") {
    return `# Agent Registry\n\n> Master index of all agents in the framework.\n\n## Active Agents\n\n| Agent | Role | Output |\n|-------|------|--------|\n| research/equity | Report generation | \`reports/*.md\` |\n| research/compliance | Scorecard verification | \`scorecards/*.scorecard.md\` |\n| research/bull | Bull perspective | In-memory JSON |\n| research/bear | Bear perspective | In-memory JSON |\n| research/macro | Macro overlay | In-memory JSON |\n| research/synthesis | Final recommendation | \`synthesis/*.synthesis.md\` |\n| orchestrator | Pipeline coordination | Chat output |\n\n## File Location\n\n\`.agents/registry.md\``;
  }

  if (path === ".agents/protocol.md") {
    return `# Agent Communication Protocol\n\n> Defines how agents coordinate work, hand off tasks, and optimize token usage.\n\n## Key Concepts\n\n- **Compressed handoffs** — Perspective agents read only Summary + Opinion, not full reports\n- **Section indexes** — Compliance uses \`sections.json\` instead of full playbook text\n- **Token budget** — Full pipeline targets < 80K tokens\n- **Playbook auto-detection** — \`index.yaml\` maps tickers to playbooks automatically\n\n## File Location\n\n\`.agents/protocol.md\``;
  }

  if (path === ".agents/README.md") {
    return `# .agents Directory Guide\n\n> Layout and boundary rules for all agent-operational assets.\n\n## Structure\n\n- \`research/\` — 6 agent instruction files\n- \`playbooks/\` — 31 sector playbooks with section indexes\n- \`templates/\` — Report skeletons, opinion schemas, search patterns\n- \`compliance/\` — Scoring rules and weights\n\n## File Location\n\n\`.agents/README.md\``;
  }

  if (path.endsWith("index.yaml")) {
    return `# Playbook Index\n\n> Maps tickers and keywords to sector-specific playbooks for auto-detection.\n\n## How It Works\n\n1. Orchestrator receives a ticker (e.g., \`NVDA\`)\n2. Searches this file for a direct ticker match\n3. If found, uses the mapped playbook and asset class\n4. If not found, web-searches the company and matches via keywords\n5. Falls back to \`_default\` if nothing matches\n\n## Coverage\n\n**31 playbook mappings** covering ~250+ tickers across equities, commodities, and crypto.\n\n## File Location\n\n\`.agents/playbooks/index.yaml\``;
  }

  if (path.endsWith("sections.schema.json")) {
    return `# Sections Schema\n\n> JSON Schema defining the structure of \`sections.json\` companion files.\n\n## Required Fields\n\n- \`playbook_file\` — source playbook filename\n- \`version\` — index version tag\n- \`generated_at\` — ISO-8601 date\n- \`section_count\` — number of sections\n- \`sections[]\` — array of {id, title, required_elements[]}\n- \`structural_requirements[]\` — cross-section checks\n\n## File Location\n\n\`.agents/playbooks/sections.schema.json\``;
  }

  if (path.endsWith("rules.json")) {
    return `# Compliance Rules\n\n> Scoring weights and structural checks for the compliance agent.\n\n## Scoring Formula\n\n| Component | Weight |\n|-----------|--------|\n| Section Coverage | 40% |\n| Element Coverage | 40% |\n| Structural Checks | 20% |\n\n## Grade Scale\n\n| Grade | Score |\n|-------|-------|\n| A | 90+ |\n| B | 80-89 |\n| C | 70-79 |\n| D | 60-69 |\n| F | <60 |\n\n## File Location\n\n\`.agents/compliance/rules.json\``;
  }

  return `# ${fileName}\n\n\`${path}\`\n\nSelect a file from the sidebar to view its contents.`;
}
