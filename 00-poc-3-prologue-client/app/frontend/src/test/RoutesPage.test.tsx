import { render, screen } from '@testing-library/react';
import RoutesPage from '../dev/RoutesPage.js';
import { ROUTE_INVENTORY } from '../dev/route-inventory.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

describe('RoutesPage', () => {
  it('renders the page heading', () => {
    render(<RoutesPage />);
    expect(screen.getByRole('heading', { name: 'dev.routesTitle' })).toBeInTheDocument();
  });

  it('renders all route inventory entries', () => {
    render(<RoutesPage />);
    const uniqueComponents = [...new Set(ROUTE_INVENTORY.map((e) => e.component))];
    for (const comp of uniqueComponents) {
      expect(screen.getAllByText(comp).length).toBeGreaterThan(0);
    }
  });

  it('shows real vs stub badges', () => {
    render(<RoutesPage />);
    const realBadges = screen.getAllByText('real');
    const stubBadges = screen.getAllByText('stub');
    expect(realBadges.length).toBeGreaterThan(0);
    expect(stubBadges.length).toBeGreaterThan(0);
  });
});
