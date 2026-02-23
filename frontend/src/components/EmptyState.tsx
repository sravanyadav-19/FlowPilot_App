import React from 'react';

interface EmptyStateProps {
  type: 'ready' | 'review';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const states = {
    ready: {
      icon: 'fa-regular fa-clipboard',
      title: 'No tasks ready yet',
      subtitle: 'Tasks with dates will appear here',
    },
    review: {
      icon: 'fa-regular fa-circle-check',
      title: 'All tasks are clear!',
      subtitle: 'No tasks pending review',
    },
  };

  const state = states[type];

  return (
    <div className="text-center py-12 text-gray-400">
      <i className={`${state.icon} text-3xl mb-3 block`}></i>
      <p className="font-semibold text-sm">{state.title}</p>
      <p className="text-xs mt-1">{state.subtitle}</p>
    </div>
  );
};