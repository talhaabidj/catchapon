/**
 * BedroomTransitions — reusable fullscreen transition overlays for BedroomScene.
 */

export function createBlackFadeOverlay(): HTMLDivElement {
  const fade = document.createElement('div');
  fade.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    z-index: 50;
    opacity: 0;
    transition: opacity 0.6s ease;
  `;
  document.body.appendChild(fade);
  return fade;
}

export async function fadeToBlack(
  overlay: HTMLDivElement,
  delayMs = 700,
): Promise<void> {
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function playDesktopReturnTransition(): Promise<HTMLDivElement> {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 1200;
    pointer-events: none;
    opacity: 0;
    background: rgba(8, 10, 16, 0);
    backdrop-filter: blur(0px) saturate(1);
    transition: opacity 0.2s ease, background 0.28s ease, backdrop-filter 0.28s ease;
  `;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    overlay.style.background = 'rgba(8, 10, 16, 0.45)';
    overlay.style.backdropFilter = 'blur(6px) saturate(0.82)';
  });

  await new Promise((resolve) => setTimeout(resolve, 220));

  overlay.style.background = '#000000';
  overlay.style.backdropFilter = 'blur(10px) saturate(0.72)';

  await new Promise((resolve) => setTimeout(resolve, 260));
  return overlay;
}
