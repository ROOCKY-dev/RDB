import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
};

type ShortcutHandler = (e: KeyboardEvent) => void;

interface ShortcutOptions {
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: { combo: KeyCombo; handler: ShortcutHandler; options?: ShortcutOptions }[]
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Avoid triggering shortcuts when typing in inputs/textareas
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName) ||
        (event.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      for (const { combo, handler, options } of shortcuts) {
        const keyMatch = event.key.toLowerCase() === combo.key.toLowerCase() ||
                         event.code.toLowerCase() === combo.key.toLowerCase();
        const ctrlMatch = !!combo.ctrlKey === event.ctrlKey;
        const shiftMatch = !!combo.shiftKey === event.shiftKey;
        const metaMatch = !!combo.metaKey === event.metaKey;
        const altMatch = !!combo.altKey === event.altKey;

        // Allow command or ctrl interchangeably for Mac/Windows flexibility
        const cmdOrCtrlMatch = (!!combo.metaKey || !!combo.ctrlKey) === (event.metaKey || event.ctrlKey);

        if (keyMatch && shiftMatch && altMatch && cmdOrCtrlMatch) {
          if (options?.preventDefault !== false) {
            event.preventDefault();
          }
          handler(event);
          break; // Stop matching other shortcuts once one hits
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
