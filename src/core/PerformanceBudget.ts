/**
 * PerformanceBudget — shared frame and telemetry thresholds.
 *
 * Used by adaptive resolution and long-task tracking so tuning lives
 * in one place.
 */

export const TARGET_FPS = 60;
export const TARGET_FRAME_MS = 1000 / TARGET_FPS;

// Adaptive DPR checks
export const ADAPTIVE_RESOLUTION_EVAL_MS = 900;
export const ADAPTIVE_RESOLUTION_STEP_DOWN = 0.06;
export const ADAPTIVE_RESOLUTION_STEP_UP = 0.03;
export const ADAPTIVE_RESOLUTION_DOWNSHIFT_MS = 19.5;
export const ADAPTIVE_RESOLUTION_UPSHIFT_MS = 15.2;

// Long task telemetry
export const LONG_TASK_WINDOW_MS = 30000;
export const LONG_TASK_MIN_DURATION_MS = 50;
