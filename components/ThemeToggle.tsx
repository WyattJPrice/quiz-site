'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

export default function ThemeToggle() {
  const { toggle } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="text-muted-foreground hover:text-foreground"
    >
      <Sun className="size-5 dark:hidden" strokeWidth={2} />
      <Moon className="hidden size-5 dark:block" strokeWidth={2} />
    </Button>
  );
}
