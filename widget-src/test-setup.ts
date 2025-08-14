// Test setup for Figma widget mocking

interface MockFigmaUser {
  id?: string;
  name?: string;
}

interface MockFigma {
  currentUser?: MockFigmaUser | null;
  activeUsers?: MockFigmaUser[];
  widget?: Record<string, unknown>;
}

interface GlobalWithFigma {
  figma: MockFigma;
}

// Initialize global figma mock - avoid conflict with @figma types
(globalThis as unknown as GlobalWithFigma).figma = {
  currentUser: null,
  activeUsers: [],
  widget: {},
} as MockFigma;

// Export helper functions for tests
export const mockFigmaUser = (id?: string, name?: string) => {
  (globalThis as unknown as GlobalWithFigma).figma.currentUser =
    id || name ? { id, name } : null;
};

export const mockFigmaActiveUsers = (
  users: Array<{ id?: string; name?: string }>,
) => {
  (globalThis as unknown as GlobalWithFigma).figma.activeUsers = users;
};

export const clearFigmaMocks = () => {
  (globalThis as unknown as GlobalWithFigma).figma.currentUser = null;
  (globalThis as unknown as GlobalWithFigma).figma.activeUsers = [];
};
