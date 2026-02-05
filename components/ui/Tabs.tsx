'use client';

import { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      <div className="border-b border-text-primary/10">
        <nav className="flex gap-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2
                  font-medium text-sm
                  border-b-2 transition-colors
                  ${
                    isActive
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-primary/20'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="py-4">
        {activeTabContent}
      </div>
    </div>
  );
}
