export function mountPauseUI() {
  const container = document.createElement('div');
  container.id = 'pause-menu';
  container.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(10, 10, 20, 0.85); backdrop-filter: blur(8px);
    display: none; flex-direction: column; justify-content: center; align-items: center;
    z-index: 1000; color: white; font-family: 'Inter', sans-serif;
  `;

  const title = document.createElement('h1');
  title.innerText = 'Paused';
  title.style.cssText = `
    font-size: 4rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
    margin-bottom: 3rem; background: linear-gradient(135deg, #fff, #999);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  `;

  const btnContainer = document.createElement('div');
  btnContainer.style.cssText = `display: flex; flex-direction: column; gap: 1rem; width: 300px;`;

  const btnStyle = `
    padding: 1rem 2rem; font-size: 1.25rem; font-weight: 600; text-transform: uppercase;
    background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
    color: white; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;
  `;

  const resumeBtn = document.createElement('button');
  resumeBtn.innerText = 'Resume Game';
  resumeBtn.id = 'pause-resume-btn';
  resumeBtn.style.cssText = btnStyle;
  resumeBtn.onmouseenter = () => { resumeBtn.style.background = 'rgba(255, 255, 255, 0.1)'; };
  resumeBtn.onmouseleave = () => { resumeBtn.style.background = 'rgba(255, 255, 255, 0.05)'; };

  // Note: Quit simply forces navigation or reload to reset state if we want,
  // or we can wire it to go to BedroomScene if requested.
  // For now we will just make it reset the app.
  const quitBtn = document.createElement('button');
  quitBtn.innerText = 'Quit to Start';
  quitBtn.id = 'pause-quit-btn';
  quitBtn.style.cssText = btnStyle;
  quitBtn.onmouseenter = () => { quitBtn.style.background = 'rgba(255, 50, 50, 0.2)'; };
  quitBtn.onmouseleave = () => { quitBtn.style.background = 'rgba(255, 255, 255, 0.05)'; };
  quitBtn.onclick = () => { window.location.reload(); };

  btnContainer.appendChild(resumeBtn);
  btnContainer.appendChild(quitBtn);

  container.appendChild(title);
  container.appendChild(btnContainer);

  document.body.appendChild(container);
}

export function unmountPauseUI() {
  document.getElementById('pause-menu')?.remove();
}

export function showPauseMenu(onResumeCallback: () => void) {
  const menu = document.getElementById('pause-menu');
  if (!menu) return;
  menu.style.display = 'flex';

  const resumeBtn = document.getElementById('pause-resume-btn');
  if (resumeBtn) {
    resumeBtn.onclick = () => {
      menu.style.display = 'none';
      onResumeCallback();
    };
  }
}

export function hidePauseMenu() {
  const menu = document.getElementById('pause-menu');
  if (menu) menu.style.display = 'none';
}

export function isPauseMenuVisible(): boolean {
  return document.getElementById('pause-menu')?.style.display === 'flex';
}
