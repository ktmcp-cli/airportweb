import axios from 'axios';

const BASE_URL = 'https://airport-web.appspot.com';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    if (status === 404) {
      throw new Error('Resource not found.');
    } else if (status === 429) {
      throw new Error('Rate limit exceeded. Please wait before retrying.');
    } else {
      const message = data?.message || data?.error || JSON.stringify(data);
      throw new Error(`API Error (${status}): ${message}`);
    }
  } else if (error.request) {
    throw new Error('No response from Airport Web API. Check your internet connection.');
  } else {
    throw error;
  }
}

// ============================================================
// AIRPORTS
// ============================================================

export async function listAirports({ search, limit = 50 } = {}) {
  try {
    const params = {};
    if (search) params.q = search;
    if (limit) params.limit = limit;
    const response = await client.get('/api/airports', { params });
    return response.data || [];
  } catch (error) {
    handleApiError(error);
  }
}

export async function getAirportByIata(iata) {
  try {
    const response = await client.get(`/api/airports/${iata.toUpperCase()}`);
    return response.data || null;
  } catch (error) {
    handleApiError(error);
  }
}

export async function listAirportsByCountry(country) {
  try {
    const params = { country };
    const response = await client.get('/api/airports', { params });
    return response.data || [];
  } catch (error) {
    handleApiError(error);
  }
}

export async function searchAirports(query) {
  try {
    const params = { q: query };
    const response = await client.get('/api/airports', { params });
    return response.data || [];
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// AIRLINES
// ============================================================

export async function listAirlines({ search, limit = 50 } = {}) {
  try {
    const params = {};
    if (search) params.q = search;
    if (limit) params.limit = limit;
    const response = await client.get('/api/airlines', { params });
    return response.data || [];
  } catch (error) {
    handleApiError(error);
  }
}

export async function getAirline(iata) {
  try {
    const response = await client.get(`/api/airlines/${iata.toUpperCase()}`);
    return response.data || null;
  } catch (error) {
    handleApiError(error);
  }
}

export async function searchAirlines(query) {
  try {
    const params = { q: query };
    const response = await client.get('/api/airlines', { params });
    return response.data || [];
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// ROUTES
// ============================================================

export async function getRoutes({ from, to } = {}) {
  try {
    const params = {};
    if (from) params.dep_iata = from.toUpperCase();
    if (to) params.arr_iata = to.toUpperCase();
    const response = await client.get('/api/routes', { params });
    return response.data || [];
  } catch (error) {
    handleApiError(error);
  }
}

export async function searchRoutes({ from, to, airline } = {}) {
  try {
    const params = {};
    if (from) params.dep_iata = from.toUpperCase();
    if (to) params.arr_iata = to.toUpperCase();
    if (airline) params.airline_iata = airline.toUpperCase();
    const response = await client.get('/api/routes', { params });
    return response.data || [];
  } catch (error) {
    handleApiError(error);
  }
}
