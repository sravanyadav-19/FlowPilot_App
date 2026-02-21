import React from 'react';

interface EmptyStateProps {
  type: 'calendar' | 'review';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const states = {
    calendar: {
      icon: '📱',
      title: 'No tasks ready yet',
      subtitle: 'Extract some tasks to see schedulable items'
    },
    review: {
      icon: '⚡',
      title: 'Tasks will appear here',
      subtitle: 'Paste some text and click Extract'
    }
  };

  const state = states[type];

  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-inner">
        <span className="text-3xl">{state.icon}</span>
      </div>
      <p className="text-xl font-medium text-gray-600 mb-2">{state.title}</p>
      <p className="text-gray-500 text-sm">{state.subtitle}</p>
    </div>
  );
};
