export interface SchedulerOptions {
  intervalMs: number;
  condition: () => boolean;
  onTick: () => void;
  onComplete?: () => void;
}

export function createAutoUpdateScheduler(options: SchedulerOptions): {
  start: () => void;
  stop: () => void;
  isActive: boolean;
} {
  let currentTimeout: ReturnType<typeof setTimeout> | null = null;
  let isActive = false;

  const start = () => {
    if (isActive) {
      stop(); // Clear any existing timeout
    }

    isActive = true;

    const tick = () => {
      if (!options.condition()) {
        stop();
        if (options.onComplete) {
          options.onComplete();
        }
        return;
      }

      options.onTick();

      if (isActive) {
        currentTimeout = setTimeout(tick, options.intervalMs);
      }
    };

    // Start the first tick
    currentTimeout = setTimeout(tick, options.intervalMs);
  };

  const stop = () => {
    isActive = false;
    if (currentTimeout) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }
  };

  return {
    start,
    stop,
    get isActive() {
      return isActive;
    },
  };
}
