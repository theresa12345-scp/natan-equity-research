"use client";

export interface ModuleTab {
  key: string;
  label: string;
}

interface ModuleTabsProps {
  tabs: ModuleTab[];
  active: string;
  onChange: (key: string) => void;
}

export default function ModuleTabs({
  tabs,
  active,
  onChange,
}: ModuleTabsProps): JSX.Element {
  return (
    <div
      className="flex items-center"
      role="tablist"
      style={{
        height: 32,
        background: "#000",
        borderBottom: "1px solid #2a2a2a",
        padding: "0 8px",
      }}
    >
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.key)}
            className="hover:brightness-125"
            style={{
              padding: "0 12px",
              height: 32,
              background: "transparent",
              border: "none",
              borderBottom: isActive
                ? "1px solid #ff2e88"
                : "1px solid transparent",
              color: isActive ? "#f5f5f5" : "#7a7a7a",
              fontSize: 10.5,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              lineHeight: 1,
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
