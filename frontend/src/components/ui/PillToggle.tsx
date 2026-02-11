type PillOption = {
  key: string;
  label: string;
};

type PillToggleProps = {
  options: PillOption[];
  active: string;
  onChange: (key: string) => void;
};

export default function PillToggle({ options, active, onChange }: PillToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-brodus-border bg-brodus-background/60 p-1">
      {options.map((option) => {
        const isActive = option.key === active;
        return (
          <button
            key={option.key}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              isActive
                ? "bg-brodus-accent text-white"
                : "text-brodus-muted hover:text-brodus-text"
            }`}
            onClick={() => onChange(option.key)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
