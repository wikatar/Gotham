'use client';

import React, { useState } from 'react';
import { CommentThreadView } from './CommentThreadView';
import { ActivityLogView } from './ActivityLogView';

interface CollaborationPanelProps {
  entityType: string;
  entityId: string;
  currentUser?: {
    id: string;
    name: string;
    email: string;
  };
  defaultTab?: 'comments' | 'activity';
  className?: string;
}

export function CollaborationPanel({
  entityType,
  entityId,
  currentUser = { id: 'dev-user', name: 'Test User', email: 'user@gotham.se' },
  defaultTab = 'comments',
  className = '',
}: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>(defaultTab);

  const tabs = [
    {
      id: 'comments' as const,
      name: 'Kommentarer',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
        </svg>
      ),
    },
    {
      id: 'activity' as const,
      name: 'Aktivitetshistorik',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
            >
              <span
                className={`${
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                } transition-colors duration-200`}
              >
                {tab.icon}
              </span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="relative">
        {activeTab === 'comments' && (
          <div className="p-0">
            <CommentThreadView
              entityType={entityType}
              entityId={entityId}
              currentUser={currentUser}
              className="border-0 rounded-none"
            />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-0">
            <ActivityLogView
              entityType={entityType}
              entityId={entityId}
              className="border-0 rounded-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Mindre variant för sidopaneler
export function CollaborationSidebar({
  entityType,
  entityId,
  currentUser,
  className = '',
}: Omit<CollaborationPanelProps, 'defaultTab'>) {
  return (
    <div className={`w-full max-w-sm ${className}`}>
      <CollaborationPanel
        entityType={entityType}
        entityId={entityId}
        currentUser={currentUser}
        defaultTab="comments"
        className="h-full"
      />
    </div>
  );
}

// Kompakt variant för modaler eller begränsat utrymme
export function CollaborationCompact({
  entityType,
  entityId,
  currentUser,
  className = '',
}: Omit<CollaborationPanelProps, 'defaultTab'>) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">
                Kommentarer & Aktivitet
              </span>
            </div>
            <div className="w-5 h-5 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Kommentarer & Aktivitet
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="w-5 h-5 text-gray-400 hover:text-gray-600"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
      
      <div className="max-h-96 overflow-hidden">
        <CollaborationPanel
          entityType={entityType}
          entityId={entityId}
          currentUser={currentUser}
          defaultTab="comments"
          className="border-0 rounded-none"
        />
      </div>
    </div>
  );
} 