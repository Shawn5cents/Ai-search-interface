// Cache implementation
const CACHE_PREFIX = 'ai_search_';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

class SearchCache {
  static getItem(key) {
    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!item) return null;

      const { value, timestamp } = JSON.parse(item);
      if (Date.now() - timestamp > CACHE_DURATION) {
        this.removeItem(key);
        return null;
      }
      return value;
    } catch (error) {
      console.warn('Cache read error:', error);
      return null;
    }
  }

  static setItem(key, value) {
    try {
      const item = {
        value,
        timestamp: Date.now()
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  static removeItem(key) {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  }
}

// API configuration
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'
  : '/api';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 10000; // 10 seconds

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, retries = MAX_RETRIES) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeout);

    // Log response details in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      
      throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;

  } catch (error) {
    clearTimeout(timeout);

    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }

    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Please check your internet connection');
    }

    if (retries > 0 && shouldRetry(error)) {
      console.log(`Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
      await wait(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }

    throw error;
  }
};

const shouldRetry = (error) => {
  return error.message.includes('internet connection') ||
         error.message.includes('timed out') ||
         error.message.includes('Failed to fetch');
};

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Main search function
export const searchOpenAI = async (query) => {
  if (!query?.trim()) {
    throw new Error('Search query cannot be empty');
  }

  const trimmedQuery = query.trim();
  const cacheKey = trimmedQuery.toLowerCase();
  
  // Check cache first
  const cachedResult = SearchCache.getItem(cacheKey);
  if (cachedResult) {
    console.log('Cache hit:', { query: trimmedQuery });
    return cachedResult;
  }

  console.log('Making API request:', {
    url: `${API_URL}/search`,
    query: trimmedQuery
  });

  const result = await fetchWithRetry(`${API_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ query: trimmedQuery })
  });

  // Cache the result
  SearchCache.setItem(cacheKey, result);
  
  return result;
};
