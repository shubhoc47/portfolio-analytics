import { SegmentedTabs } from "../../../components/ui/SegmentedTabs";

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
    <SegmentedTabs
      tabs={tabs}
      activeTab={activeTab}
      onChange={onChange}
      ariaLabel="Intelligence navigation"
    />
  );
}
