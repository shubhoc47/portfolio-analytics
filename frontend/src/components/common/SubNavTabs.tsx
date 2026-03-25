import { SegmentedTabs, type SegmentedTabItem, type SegmentedTabsShell } from "../ui/SegmentedTabs";

export type SubNavTabItem<T extends string> = SegmentedTabItem<T>;

interface SubNavTabsProps<T extends string> {
  tabs: SubNavTabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  shell?: SegmentedTabsShell;
  className?: string;
}

export function SubNavTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  shell = "default",
  className,
}: SubNavTabsProps<T>) {
  return (
    <SegmentedTabs
      tabs={tabs}
      activeTab={activeTab}
      onChange={onChange}
      ariaLabel="Portfolio section navigation"
      shell={shell}
      className={className}
    />
  );
}
