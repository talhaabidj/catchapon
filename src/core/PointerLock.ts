/**
 * PointerLock — compatibility wrapper for browser pointer-lock requests.
 *
 * Pointer lock is user-activation gated and reports failure differently across
 * browsers. This helper turns both event-based and promise-based implementations
 * into a small result value so callers can recover instead of getting wedged.
 */

export type PointerLockRequestResult =
  | 'locked'
  | 'error'
  | 'timeout'
  | 'unsupported';

interface PointerLockOptions {
  timeoutMs?: number;
}

const DEFAULT_POINTER_LOCK_TIMEOUT_MS = 1600;

export function requestPointerLockSafely(
  element: HTMLElement,
  options: PointerLockOptions = {},
): Promise<PointerLockRequestResult> {
  if (typeof document === 'undefined') {
    return Promise.resolve('unsupported');
  }

  if (document.pointerLockElement === element) {
    return Promise.resolve('locked');
  }

  if (typeof element.requestPointerLock !== 'function') {
    return Promise.resolve('unsupported');
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_POINTER_LOCK_TIMEOUT_MS;

  return new Promise((resolve) => {
    let settled = false;
    let timeoutId = 0;

    const cleanup = () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      window.clearTimeout(timeoutId);
    };

    const finish = (result: PointerLockRequestResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const onPointerLockChange = () => {
      if (document.pointerLockElement === element) {
        finish('locked');
      }
    };

    const onPointerLockError = () => {
      finish('error');
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('pointerlockerror', onPointerLockError);
    timeoutId = window.setTimeout(() => {
      finish(document.pointerLockElement === element ? 'locked' : 'timeout');
    }, timeoutMs);

    try {
      const request = element.requestPointerLock();
      const maybePromise = request as Promise<void> | undefined;
      maybePromise
        ?.then(() => {
          if (document.pointerLockElement === element) {
            finish('locked');
          }
        })
        .catch(() => {
          finish('error');
        });
    } catch {
      finish('error');
    }
  });
}
