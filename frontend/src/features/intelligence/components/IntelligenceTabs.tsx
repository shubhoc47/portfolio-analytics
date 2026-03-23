import { Button } from "../../../components/ui/Button";

export type IntelligenceTabKey = "news" | "sentiment" | "summaries" | "alerts" | "ratings";

export interface IntelligenceTabItem {
  key: IntelligenceTabKey;
  label: string;
}

interface IntelligenceTabsProps {
  tabs: IntelligenceTabItem[];
  activeTab: IntelligenceTabKey;
  onChange: (tab: IntelligenceTabKey) => void;
}

export function IntelligenceTabs({ tabs, activeTab, onChange }: IntelligenceTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Button
            key={tab.key}
            variant={isActive ? "primary" : "secondary"}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
