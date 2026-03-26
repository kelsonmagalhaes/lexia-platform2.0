const STORAGE_KEY = 'lexstudy_user';
const ACCOUNTS_KEY = 'lexstudy_accounts';

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

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getAccounts() {
  try {
    const data = localStorage.getItem(ACCOUNTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function registerAccount({ name, email, password, phone, period, institution }) {
  const accounts = getAccounts();
  if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'Este e-mail já está cadastrado.' };
  }
  const passwordHash = await hashPassword(password);
  const account = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash,
    phone: phone || '',
    period: parseInt(period) || 1,
    institution: institution || '',
    created_at: new Date().toISOString(),
  };
  saveAccounts([...accounts, account]);
  return { account };
}

export async function loginWithPassword(email, password) {
  const accounts = getAccounts();
  const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (!account) return { error: 'E-mail ou senha incorretos.' };
  const passwordHash = await hashPassword(password);
  if (account.passwordHash !== passwordHash) return { error: 'E-mail ou senha incorretos.' };
  return { account };
}
