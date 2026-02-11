import PillToggle from "@/components/ui/PillToggle";

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
  const options = [
    { key: "trades", label: `Trade Log · ${tradeCount}` },
    { key: "journal", label: `Daily Journal · ${journalCount}` },
  ];

  return (
    <PillToggle
      options={options}
      active={activeTab}
      onChange={(key) => onTabChange(key as JournalTab)}
    />
  );
}

export type { JournalTab };
