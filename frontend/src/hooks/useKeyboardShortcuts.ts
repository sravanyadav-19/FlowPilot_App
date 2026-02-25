import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onToggleTheme: () => void;
  onFocusSearch: () => void;
  onUndo: () => void;
  onToggleShortcuts: () => void;
  onEscape: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    // Ctrl/Cmd + D → Toggle dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      handlers.onToggleTheme();
      return;
    }

    // Ctrl/Cmd + K → Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      handlers.onFocusSearch();
      return;
    }

    // Ctrl/Cmd + Z → Undo (only when not in input)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !isInputFocused) {
      e.preventDefault();
      handlers.onUndo();
      return;
    }

    // ? → Show shortcuts modal (only when not in input)
    if (e.key === '?' && !isInputFocused) {
      e.preventDefault();
      handlers.onToggleShortcuts();
      return;
    }

    // Escape → Close modals / Clear search
    if (e.key === 'Escape') {
      handlers.onEscape();
      return;
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};