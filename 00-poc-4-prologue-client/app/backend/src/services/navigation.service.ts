import { memoryStore } from '../store/memoryStore.js';
import type { NavItem } from '../domain/types.js';

export function listNavigationMenu(): NavItem[] {
  // Return a defensive copy so callers cannot mutate the seed.
  return memoryStore.get().navItems.map((n) => ({ ...n }));
}
