/**
 * Empty State Components
 * Provides helpful guidance when no data is available
 */

import { Button } from '@/components/ui/button';
import { PhoneCall, Users, ChartBar, Books, Plus, ArrowRight } from '@phosphor-icons/react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 animate-in fade-in zoom-in-95 duration-300">
      {icon && (
        <div className="rounded-full bg-gradient-to-br from-blue-50 to-blue-100 p-6 mb-4 shadow-sm">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {description}
      </p>
      {action && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" onClick={action.onClick} className="shadow-sm">
            {action.icon || <Plus className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
          {secondaryAction && (
            <Button 
              size="lg" 
              variant="outline" 
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Specialized empty states for common scenarios
export function EmptyCallsState({ onStartCall }: { onStartCall: () => void }) {
  return (
    <EmptyState
      icon={<PhoneCall className="h-12 w-12 text-blue-600" weight="duotone" />}
      title="No calls yet"
      description="Start making calls to track your conversations, record insights, and build your sales pipeline."
      action={{
        label: "Make First Call",
        onClick: onStartCall,
        icon: <PhoneCall className="mr-2 h-4 w-4" />
      }}
      secondaryAction={{
        label: "View Tutorial",
        onClick: () => console.log('Tutorial')
      }}
    />
  );
}

export function EmptyLeadsState({ onAddLead }: { onAddLead: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12 text-purple-600" weight="duotone" />}
      title="No leads yet"
      description="Add your first lead to start tracking prospects, managing follow-ups, and closing deals."
      action={{
        label: "Add First Lead",
        onClick: onAddLead,
        icon: <Plus className="mr-2 h-4 w-4" />
      }}
      secondaryAction={{
        label: "Import Leads",
        onClick: () => console.log('Import')
      }}
    />
  );
}

export function EmptyAnalyticsState() {
  return (
    <EmptyState
      icon={<ChartBar className="h-12 w-12 text-teal-600" weight="duotone" />}
      title="Not enough data"
      description="Analytics will appear here once you've made calls and added leads. Start building your pipeline to see insights."
    />
  );
}

export function EmptyScriptsState({ onCreateScript }: { onCreateScript: () => void }) {
  return (
    <EmptyState
      icon={<Books className="h-12 w-12 text-orange-600" weight="duotone" />}
      title="No scripts yet"
      description="Create your first sales script to practice your pitch and improve your calling technique."
      action={{
        label: "Create Script",
        onClick: onCreateScript,
        icon: <Plus className="mr-2 h-4 w-4" />
      }}
    />
  );
}

// Generic search/filter empty state
export function EmptySearchState({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        <svg
          className="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
      <p className="text-sm text-gray-500 mb-4">
        No results for "<span className="font-medium">{searchTerm}</span>". Try adjusting your search.
      </p>
    </div>
  );
}

// Error state (different from empty)
export function ErrorState({ title, description, onRetry }: { 
  title?: string; 
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
      <div className="rounded-full bg-red-50 p-6 mb-4">
        <svg
          className="h-12 w-12 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || "Something went wrong"}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {description || "We encountered an error loading this data. Please try again."}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
