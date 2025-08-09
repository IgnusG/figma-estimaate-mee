// Debug utility for controlled logging
// Can be toggled via a synced state in the widget or via console

class DebugLogger {
  private enabled: boolean = false;

  enable() {
    if (!this.enabled) {
      this.enabled = true;
      console.log("🐛 Debug logging enabled");
    }
  }

  disable() {
    if (this.enabled) {
      this.enabled = false;
      console.log("🐛 Debug logging disabled");
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    console.log(`🐛 Debug logging ${this.enabled ? 'enabled' : 'disabled'}`);
  }

  isEnabled() {
    return this.enabled;
  }

  log(...args: unknown[]) {
    if (this.enabled) {
      console.log(...args);
    }
  }

  error(...args: unknown[]) {
    if (this.enabled) {
      console.error(...args);
    }
  }

  warn(...args: unknown[]) {
    if (this.enabled) {
      console.warn(...args);
    }
  }
}

// Export a singleton instance
export const debug = new DebugLogger();

// For console access in Figma, users can toggle via the UI button
// or import this module in the console and call debug.enable() directly
