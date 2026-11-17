/** The hand pointer closes into the game's grip while a mouse button is held, as it does in the game's menus. */
const root = document.documentElement;
const release = () => root.classList.remove('hand-grip');
addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'mouse') root.classList.add('hand-grip');
});
addEventListener('pointerup', release);
addEventListener('pointercancel', release);
addEventListener('blur', release);
