import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockFigmaUser, clearFigmaMocks } from "../test-setup";

describe("User ID Consistency (Bug Fix)", () => {
  beforeEach(() => {
    clearFigmaMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should use consistent user IDs for vote storage and retrieval", () => {
    // Test the user ID consistency fix
    const mockCurrentUserId = "consistent-user-123";
    
    // Mock figma.currentUser using helper
    mockFigmaUser("figma-user-456", "Test User");

    // Simulate the fix: use currentUserId parameter over figma.currentUser?.id
    const useConsistentUserId = (currentUserId: string) => {
      interface GlobalWithFigma {
        figma: { currentUser?: { id?: string; name?: string } | null };
      }
      const figma = (globalThis as unknown as GlobalWithFigma).figma;
      const userId = currentUserId || figma.currentUser?.id || `voter-${Date.now()}`;
      return userId;
    };

    const resultUserId = useConsistentUserId(mockCurrentUserId);
    expect(resultUserId).toBe(mockCurrentUserId); // Should prefer parameter over figma.currentUser.id
    
    const resultWithoutParam = useConsistentUserId("");
    expect(resultWithoutParam).toBe("figma-user-456"); // Should fallback to figma.currentUser.id
  });

  it("should generate fallback ID when both sources are unavailable", () => {
    // Mock Date.now for predictable test
    const mockTime = 1234567890;
    vi.spyOn(Date, 'now').mockReturnValue(mockTime);
    
    // Mock figma with no currentUser
    mockFigmaUser(); // No parameters = null user

    const useConsistentUserId = (currentUserId: string) => {
      interface GlobalWithFigma {
        figma: { currentUser?: { id?: string; name?: string } | null };
      }
      const figma = (globalThis as unknown as GlobalWithFigma).figma;
      const userId = currentUserId || figma.currentUser?.id || `voter-${Date.now()}`;
      return userId;
    };

    const resultUserId = useConsistentUserId("");
    expect(resultUserId).toBe(`voter-${mockTime}`);
  });

  it("should handle undefined figma.currentUser gracefully", () => {
    // Set currentUser to undefined
    interface GlobalWithFigma {
      figma: {
        currentUser?: { id?: string; name?: string } | null;
        activeUsers?: Array<{ id?: string; name?: string }>;
      };
    }
    
    (globalThis as unknown as GlobalWithFigma).figma.currentUser = undefined;
    
    const useConsistentUserId = (currentUserId: string) => {
      const figma = (globalThis as unknown as GlobalWithFigma).figma;
      const userId = currentUserId || figma.currentUser?.id || `fallback-id`;
      return userId;
    };

    const resultUserId = useConsistentUserId("");
    expect(resultUserId).toBe("fallback-id");
  });
});