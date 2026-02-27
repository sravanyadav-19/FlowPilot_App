// ============================================================================
// FILE: frontend/src/components/TemplatesPanel.tsx
// Day 8: Quick templates panel for one-click task creation
// ============================================================================

import React, { useState } from 'react';
import { TaskTemplate, Task } from '../types/task';
import { useTemplates } from '../hooks/useTemplates';

interface TemplatesPanelProps {
  onAddTasks: (tasks: Task[]) => void;
  isDark: boolean;
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  onAddTasks,
  isDark,
}) => {
  const { templates, createTasksFromTemplate } = useTemplates();
  const [expanded, setExpanded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

  const handleUseTemplate = (template: TaskTemplate) => {
    const newTasks = createTasksFromTemplate(template);
    onAddTasks(newTasks);
    setSelectedTemplate(null);
  };

  return (
    <div className={`rounded-2xl shadow-md border transition-all overflow-hidden ${
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
    }`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-5 py-4 flex justify-between items-center transition-colors ${
          isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
            <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
          </div>
          <div className="text-left">
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Quick Templates
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Add pre-defined task sets instantly
            </p>
          </div>
        </div>
        <i className={`fa-solid fa-chevron-down transition-transform ${
          expanded ? 'rotate-180' : ''
        } ${isDark ? 'text-slate-400' : 'text-slate-500'}`}></i>
      </button>

      {/* Templates Grid */}
      {expanded && (
        <div className={`px-5 pb-5 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`p-4 rounded-xl text-left transition-all hover:scale-[1.02] border-2 ${
                  isDark
                    ? 'bg-slate-700/50 border-slate-600 hover:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 hover:border-indigo-400'
                }`}
              >
                <span className="text-2xl block mb-2">{template.icon}</span>
                <p className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {template.name}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {template.tasks.length} tasks
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl animate-slide-in ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`p-5 border-b ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedTemplate.icon}</span>
                <div>
                  <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {selectedTemplate.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {selectedTemplate.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Tasks Preview */}
            <div className="p-5 max-h-[300px] overflow-y-auto">
              <p className={`text-xs font-bold uppercase mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Tasks to be created ({selectedTemplate.tasks.length})
              </p>
              <div className="space-y-2">
                {selectedTemplate.tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg flex items-start gap-3 ${
                      isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {task.title}
                      </p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className={`text-[0.65rem] px-1.5 py-0.5 rounded font-bold uppercase ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                        {task.recurrence !== 'none' && (
                          <span className="text-[0.65rem] px-1.5 py-0.5 rounded font-bold uppercase bg-purple-100 text-purple-700">
                            {task.recurrence}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`p-5 border-t flex gap-3 ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
              <button
                onClick={() => setSelectedTemplate(null)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUseTemplate(selectedTemplate)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-plus"></i>
                Add {selectedTemplate.tasks.length} Tasks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};