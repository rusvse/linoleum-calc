export function initStorage() {
  const STORAGE_KEY = 'linoleumCalcProject';

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  window.linoleumStorage = { save, load, clear };
}
