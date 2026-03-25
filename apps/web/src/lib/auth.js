const STORAGE_KEY = 'lexstudy_user';

export function getUser() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('lexstudy_profile');
}

export function getProfile() {
  try {
    const data = localStorage.getItem('lexstudy_profile');
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function saveProfile(profile) {
  localStorage.setItem('lexstudy_profile', JSON.stringify(profile));
}
