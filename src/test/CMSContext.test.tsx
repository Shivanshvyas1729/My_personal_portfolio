import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CMSProvider, useCMSState, useCMSActions } from "../context/CMSContext";

// Variable to control mock roles in tests
let mockRoles = ["public"];

// Mock useAuth
vi.mock("@/hooks/useAuth", () => {
  return {
    useAuth: () => ({
      roles: mockRoles,
      isSuperAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasAccess: (role: string) => mockRoles.includes(role),
    }),
  };
});

// Mock fetch as we have a refreshData call on mount in CMSProvider
const mockFetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: {} }),
  })
);
vi.stubGlobal("fetch", mockFetch);

// A simple consumer component to inspect context values and trigger actions
const ConsumerComponent = () => {
  const state = useCMSState();
  const actions = useCMSActions();

  return (
    <div>
      <div data-testid="preview-mode">{state.previewMode ? "active" : "inactive"}</div>
      <div data-testid="preview-subtitle">{state.previewData.settings?.introSubtitle || ""}</div>
      <button data-testid="enable-preview" onClick={() => actions.setPreviewMode(true)}>
        Enable Preview
      </button>
      <button data-testid="update-field" onClick={() => actions.updateNestedField("settings.introSubtitle", "Hello Test")}>
        Update Field
      </button>
    </div>
  );
};

describe("CMSContext Preview Mode Logout behavior", () => {
  beforeEach(() => {
    mockRoles = ["admin"]; // start as admin
    sessionStorage.clear();
    mockFetch.mockClear();
  });

  it("should allow enabling preview mode and editing for admin", async () => {
    render(
      <CMSProvider>
        <ConsumerComponent />
      </CMSProvider>
    );

    expect(screen.getByTestId("preview-mode").textContent).toBe("inactive");

    // Click enable preview
    await act(async () => {
      screen.getByTestId("enable-preview").click();
    });
    expect(screen.getByTestId("preview-mode").textContent).toBe("active");

    // Click update field
    await act(async () => {
      screen.getByTestId("update-field").click();
    });
    expect(screen.getByTestId("preview-subtitle").textContent).toBe("Hello Test");
    expect(sessionStorage.getItem("cms-preview-data")).not.toBeNull();
  });

  it("should automatically disable preview mode, clear state and sessionStorage when user is no longer admin", async () => {
    // Render while admin
    const { rerender } = render(
      <CMSProvider>
        <ConsumerComponent />
      </CMSProvider>
    );

    // Make edits
    await act(async () => {
      screen.getByTestId("update-field").click();
    });
    expect(screen.getByTestId("preview-subtitle").textContent).toBe("Hello Test");
    expect(sessionStorage.getItem("cms-preview-data")).not.toBeNull();

    // Now simulate logout (roles change to public)
    mockRoles = ["public"];

    // Rerender the component tree so the context values refresh with new roles
    await act(async () => {
      rerender(
        <CMSProvider>
          <ConsumerComponent />
        </CMSProvider>
      );
    });

    // Check that previewMode is now inactive
    expect(screen.getByTestId("preview-mode").textContent).toBe("inactive");
    // Check that previewData is reverted (not "Hello Test")
    expect(screen.getByTestId("preview-subtitle").textContent).not.toBe("Hello Test");
    // Check that sessionStorage is cleared
    expect(sessionStorage.getItem("cms-preview-data")).toBeNull();
    expect(sessionStorage.getItem("cms-undo-stack")).toBeNull();
    expect(sessionStorage.getItem("cms-redo-stack")).toBeNull();
    expect(sessionStorage.getItem("cms_local_images")).toBeNull();
  });
});
