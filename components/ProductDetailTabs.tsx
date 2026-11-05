"use client";

import { useEffect, useRef, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";

export type ProductDetailTab = {
  id: string;
  label: string;
  aliases?: string[];
  content: ReactNode;
};

const sectionChange = "bzmagnet:product-section-change";

function subscribeToSection(onChange: () => void) {
  window.addEventListener(sectionChange, onChange);
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener(sectionChange, onChange);
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

const readSection = () => window.location.hash.slice(1);
const serverSection = () => null;

export function ProductDetailTabs({ label, tabs }: { label: string; tabs: ProductDetailTab[] }) {
  const section = useSyncExternalStore<string | null>(subscribeToSection, readSection, serverSection);
  const matchingTab = tabs.find((tab) => tab.id === section || (section && tab.aliases?.includes(section)));
  const activeTab = matchingTab ?? tabs[0];
  const enhanced = section !== null;
  const list = useRef<HTMLDivElement>(null);
  const selectedLocally = useRef<string | null>(null);

  useEffect(() => {
    if (section === selectedLocally.current) {
      selectedLocally.current = null;
      return;
    }
    // A shared section link or the hero shortcut should reveal the tab list as well.
    if (matchingTab) list.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [section, matchingTab]);

  function selectTab(id: string) {
    if (readSection() === id) return;
    selectedLocally.current = id;
    window.history.pushState(null, "", `#${id}`);
    window.dispatchEvent(new Event(sectionChange));
  }

  function handleKey(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    const direction = getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
    const last = tabs.length - 1;
    let next: number;

    switch (event.key) {
      case "ArrowRight":
        next = (index + direction + tabs.length) % tabs.length;
        break;
      case "ArrowLeft":
        next = (index - direction + tabs.length) % tabs.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      case " ":
        event.preventDefault();
        selectTab(tabs[index].id);
        return;
      default:
        return;
    }

    event.preventDefault();
    const id = tabs[next].id;
    selectTab(id);
    document.getElementById(`product-tab-${id}`)?.focus({ preventScroll: true });
  }

  return <div className="product-tabs">
    <div className="product-tab-list" ref={list} role={enhanced ? "tablist" : "navigation"} aria-label={label}>
      {tabs.map((tab, index) => <a
        key={tab.id}
        id={`product-tab-${tab.id}`}
        href={`#${tab.id}`}
        role={enhanced ? "tab" : undefined}
        aria-controls={enhanced ? `product-panel-${tab.id}` : undefined}
        aria-selected={enhanced ? tab === activeTab : undefined}
        tabIndex={enhanced && tab !== activeTab ? -1 : undefined}
        onClick={(event) => {
          if (!enhanced || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
          event.preventDefault();
          selectTab(tab.id);
        }}
        onKeyDown={enhanced ? (event) => handleKey(event, index) : undefined}
      >{tab.label}</a>)}
    </div>
    {tabs.map((tab) => <div
      key={tab.id}
      id={`product-panel-${tab.id}`}
      className="product-tab-panel"
      role={enhanced ? "tabpanel" : undefined}
      aria-labelledby={enhanced ? `product-tab-${tab.id}` : undefined}
      tabIndex={enhanced && tab === activeTab ? 0 : undefined}
      hidden={enhanced && tab !== activeTab}
    >{tab.content}</div>)}
  </div>;
}
