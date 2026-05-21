export const localImageStore: Record<string, string> = {};

export function registerLocalImage(id: string, base64: string) {
  localImageStore[id] = base64;
  try {
    sessionStorage.setItem('cms_local_images', JSON.stringify(localImageStore));
  } catch (e) {}
}

export function getLocalImage(id: string): string | null {
  if (localImageStore[id]) return localImageStore[id];
  try {
    const cached = sessionStorage.getItem('cms_local_images');
    if (cached) {
      const parsed = JSON.parse(cached);
      Object.assign(localImageStore, parsed);
      return localImageStore[id] || null;
    }
  } catch (e) {}
  return null;
}

export function clearLocalImages() {
  for (const key in localImageStore) {
    delete localImageStore[key];
  }
  sessionStorage.removeItem('cms_local_images');
}
