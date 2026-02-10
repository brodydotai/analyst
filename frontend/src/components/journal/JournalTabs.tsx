type JournalTab = "trades" | "journal";

type JournalTabsProps = {
  activeTab: JournalTab;
  onTabChange: (tab: JournalTab) => void;
  tradeCount: number;
  journalCount: number;
};

export default function JournalTabs({
  activeTab,
  onTabChange,
  tradeCount,
  journalCount,
}: JournalTabsProps) {
  const tabs: { key: JournalTab; label: string; count: number }[] = [
    { key: "trades", label: "Trade Log", count: tradeCount },
    { key: "journal", label: "Daily Journal", count: journalCount },
  ];

  return (
    <div className="flex gap-1 border-b border-brodus-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === tab.key
              ? "border-brodus-accent text-brodus-text"
              : "border-transparent text-brodus-muted hover:text-brodus-text"
          }`}
          onClick={() => onTabChange(tab.key)}
          type="button"
        >
          {tab.label}
          <span
            className={`rounded px-1.5 py-0.5 text-2xs ${
              activeTab === tab.key
                ? "bg-brodus-accent/20 text-brodus-accent"
                : "bg-brodus-surface text-brodus-muted"
            }`}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}

export type { JournalTab };
