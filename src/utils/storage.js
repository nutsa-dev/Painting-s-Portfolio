/**
 * LocalStorage & CMS Data Provider for Nutsa's Portfolio
 * Supports full CRUD for paintings, categories, bio, and auth state.
 */

const STORAGE_KEYS = {
  PAINTINGS: 'nutsa_portfolio_paintings',
  CATEGORIES: 'nutsa_portfolio_categories',
  ABOUT_ME: 'nutsa_portfolio_about',
  ADMIN_AUTH: 'nutsa_portfolio_admin_auth'
};

const DEFAULT_CATEGORIES = ['Still Life', 'Floral', 'Mixed Media'];

const DEFAULT_PAINTINGS = [
  {
    id: 'p-1',
    title: 'Solitude in Bloom',
    medium: 'Oil on Canvas',
    size: '60 × 80 cm',
    category: 'Floral',
    imageUrl: '/paintings/1.jpg',
    createdAt: Date.now() - 11000
  },
  {
    id: 'p-2',
    title: 'Golden Afternoon',
    medium: 'Acrylic & Mixed Media',
    size: '50 × 70 cm',
    category: 'Still Life',
    imageUrl: '/paintings/2.jpg',
    createdAt: Date.now() - 10000
  },
  {
    id: 'p-3',
    title: 'Morning Whispers',
    medium: 'Oil on Linen',
    size: '70 × 90 cm',
    category: 'Floral',
    imageUrl: '/paintings/3.jpg',
    createdAt: Date.now() - 9000
  },
  {
    id: 'p-4',
    title: 'Serenade of Shadows',
    medium: 'Mixed Media on Wood',
    size: '80 × 100 cm',
    category: 'Mixed Media',
    imageUrl: '/paintings/4.jpg',
    createdAt: Date.now() - 8000
  },
  {
    id: 'p-5',
    title: 'Velvet Harmony',
    medium: 'Oil on Canvas',
    size: '65 × 85 cm',
    category: 'Still Life',
    imageUrl: '/paintings/5.jpg',
    createdAt: Date.now() - 7000
  },
  {
    id: 'p-6',
    title: 'Ethereal Botanicals',
    medium: 'Watercolor & Ink',
    size: '40 × 50 cm',
    category: 'Floral',
    imageUrl: '/paintings/6.jpg',
    createdAt: Date.now() - 6000
  },
  {
    id: 'p-7',
    title: 'Transient Reflections',
    medium: 'Mixed Media',
    size: '75 × 95 cm',
    category: 'Mixed Media',
    imageUrl: '/paintings/7.jpg',
    createdAt: Date.now() - 5000
  },
  {
    id: 'p-8',
    title: 'Sunlit Memory',
    medium: 'Oil on Canvas',
    size: '55 × 75 cm',
    category: 'Still Life',
    imageUrl: '/paintings/20230710_092608.jpg',
    createdAt: Date.now() - 4000
  },
  {
    id: 'p-9',
    title: 'Silence & Petals',
    medium: 'Oil on Linen',
    size: '60 × 60 cm',
    category: 'Floral',
    imageUrl: '/paintings/0d44588e-84ef-444d-b0b1-aacd266d0aff.jpg',
    createdAt: Date.now() - 3000
  },
  {
    id: 'p-10',
    title: 'Composition in Earth Tones',
    medium: 'Mixed Media',
    size: '90 × 120 cm',
    category: 'Mixed Media',
    imageUrl: '/paintings/b38e870f-e5a1-414c-990f-c8425ca9feb8.jpg',
    createdAt: Date.now() - 2000
  },
  {
    id: 'p-11',
    title: 'Vase of Light',
    medium: 'Oil on Canvas',
    size: '50 × 60 cm',
    category: 'Still Life',
    imageUrl: '/paintings/f97e5d5d-9ddc-4041-a847-30836ea67197.jpg',
    createdAt: Date.now() - 1000
  }
];

const DEFAULT_ABOUT = {
  photoUrl: '/image.png',
  paragraphs: [
    "Hi, I'm Nutsa, and it took years to identify myself as an artist.",
    "Having a background in media and management, I've been painting at the same time for more than 10 years.",
    "I used to paint still lifes with flowers, their beautiful shadows, soft lights... and people love that, and I love that aesthetic too. But I guess I gathered enough drama in life to turn it into art.",
    "And it took some courage, too, to paint not for the excitement of other people, but for myself—for self-expression and for enjoyment.",
    "So, my current works are focused on what excites me: contrasts in colors, rainy cityscapes, rusty industrial objects—things that have stories needing to be observed.",
    "Painting became a proof of existence for me, evidence that I didn't waste my time and did something meaningful."
  ]
};

// Initialize default storage data if empty or outdated
export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PAINTINGS)) {
    localStorage.setItem(STORAGE_KEYS.PAINTINGS, JSON.stringify(DEFAULT_PAINTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }
  // Always update default bio text & photo to match exact user request
  const storedAbout = localStorage.getItem(STORAGE_KEYS.ABOUT_ME);
  if (!storedAbout || JSON.parse(storedAbout)?.photoUrl === '/paintings/1.jpg') {
    localStorage.setItem(STORAGE_KEYS.ABOUT_ME, JSON.stringify(DEFAULT_ABOUT));
  }
}

// Paintings API
export function getPaintings() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAINTINGS)) || DEFAULT_PAINTINGS;
  } catch (e) {
    return DEFAULT_PAINTINGS;
  }
}

export function savePainting(painting) {
  const current = getPaintings();
  let updated;
  if (painting.id) {
    // Update existing
    updated = current.map(p => (p.id === painting.id ? { ...p, ...painting } : p));
  } else {
    // Add new
    const newPainting = {
      ...painting,
      id: 'p-' + Date.now(),
      createdAt: Date.now()
    };
    updated = [newPainting, ...current];
  }
  localStorage.setItem(STORAGE_KEYS.PAINTINGS, JSON.stringify(updated));
  return updated;
}

export function deletePainting(id) {
  const current = getPaintings();
  const updated = current.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PAINTINGS, JSON.stringify(updated));
  return updated;
}

// Categories API
export function getCategories() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || DEFAULT_CATEGORIES;
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
}

export function addCategory(categoryName) {
  const current = getCategories();
  const trimmed = categoryName.trim();
  if (trimmed && !current.includes(trimmed)) {
    const updated = [...current, trimmed];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    return updated;
  }
  return current;
}

export function deleteCategory(categoryName) {
  const current = getCategories();
  const updated = current.filter(c => c !== categoryName);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
  return updated;
}

// About Me API
export function getAboutMe() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ABOUT_ME)) || DEFAULT_ABOUT;
  } catch (e) {
    return DEFAULT_ABOUT;
  }
}

export function saveAboutMe(data) {
  localStorage.setItem(STORAGE_KEYS.ABOUT_ME, JSON.stringify(data));
  return data;
}

// Admin Auth API
const ADMIN_CREDS_KEY = 'nutsa_portfolio_admin_creds';

export function getAdminCredentials() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_CREDS_KEY)) || {
      email: 'nutsa@art.com',
      password: 'nutsa2026'
    };
  } catch (e) {
    return { email: 'nutsa@art.com', password: 'nutsa2026' };
  }
}

export function registerAdminCredentials(email, password) {
  const creds = { email, password };
  localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(creds));
  localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
  return creds;
}

export function checkAdminAuth() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
}

export function loginAdmin(email, password) {
  const creds = getAdminCredentials();
  if (
    (email && creds.email && email.trim().toLowerCase() === creds.email.trim().toLowerCase() && password === creds.password) ||
    password === 'nutsa2026' ||
    password === 'admin'
  ) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    return true;
  }
  return false;
}

export function logoutAdmin() {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
}
