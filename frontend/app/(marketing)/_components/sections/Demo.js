'use client';

import dynamic from 'next/dynamic';
import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const tabs = [
  { key: 'alerts', label: 'Alerts' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'team', label: 'Team' }
];

function PanelLoading() {
  return (
    <div className="rounded-ds16 border border-line bg-surface p-4 shadow-elevation1 md:p-5" aria-live="polite">
      <div className="h-5 w-1/4 animate-pulse rounded bg-white/[0.06]" />
      <div className="mt-3 h-36 animate-pulse rounded bg-white/[0.04]" />
    </div>
  );
}

const panelComponents = {
  alerts: dynamic(() => import('../demo/AlertsPanel'), { ssr: false, loading: () => <PanelLoading /> }),
  analytics: dynamic(() => import('../demo/AnalyticsPanel'), { ssr: false, loading: () => <PanelLoading /> }),
  evidence: dynamic(() => import('../demo/EvidencePanel'), { ssr: false, loading: () => <PanelLoading /> }),
  team: dynamic(() => import('../demo/TeamPanel'), { ssr: false, loading: () => <PanelLoading /> })
};

export default function Demo() {
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const tabRefs = useRef([]);

  const activeTabMeta = useMemo(() => {
    const tab = tabs.find((item) => item.key === activeTab) || tabs[0];
    return {
      ...tab,
      tabId: `tab-${tab.key}`,
      panelId: `panel-${tab.key}`
    };
  }, [activeTab]);

  const ActivePanel = panelComponents[activeTabMeta.key];

  const handleKeyDown = (index, event) => {
    let nextIndex = index;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex !== index) {
      event.preventDefault();
      const nextTab = tabs[nextIndex];
      setActiveTab(nextTab.key);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <section id="experience" className="section-shell panel px-5 py-7 md:px-10 md:py-10" aria-labelledby="demo-title">
      <p className="eyebrow">Product Experience</p>
      <h2 id="demo-title" className="mt-4 display-md">
        See what your dashboard <span className="gradient-text">looks like day to day.</span>
      </h2>

      <div className="mt-5 rounded-ds16 border border-line bg-layer/70 p-1.5">
        <div role="tablist" aria-label="Product experience tabs" className="flex flex-wrap gap-1.5">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.key;
            const tabId = `tab-${tab.key}`;
            const panelId = `panel-${tab.key}`;

            return (
              <button
                key={tab.key}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onClick={() => setActiveTab(tab.key)}
                className={`relative rounded-ds10 px-3 py-2 text-sm font-semibold transition ${isActive ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="tab-active"
                    className="absolute inset-0 z-0 rounded-ds10 bg-surface shadow-elevation1"
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTabMeta.key}
            id={activeTabMeta.panelId}
            role="tabpanel"
            aria-labelledby={activeTabMeta.tabId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <ActivePanel />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
