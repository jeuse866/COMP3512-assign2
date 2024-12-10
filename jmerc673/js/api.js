const API_BASE_URL = "https://www.randyconnolly.com/funwebdev/3rd/api/f1";


function getCachedData(key) {
  const cachedData = localStorage.getItem(key);
  return cachedData ? JSON.parse(cachedData) : null;
}

function cacheData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}


async function fetchAndCache(url, key) {
  const cachedData = getCachedData(key);
  if (cachedData) {
    console.log(`Using cached data for: ${key}`);
    return cachedData;
  }

  console.log(`Fetching fresh data for: ${key}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
  }
  const data = await response.json();
  cacheData(key, data);
  return data;
}


async function fetchRaces(season) {
  const url = `${API_BASE_URL}/races.php?season=${season}`;
  const key = `races_${season}`;
  return await fetchAndCache(url, key);
}


async function fetchQualifyingResults(raceId) {
  const url = `${API_BASE_URL}/qualifying.php?race=${raceId}`;
  const key = `qualifying_${raceId}`;
  return await fetchAndCache(url, key);
}


async function fetchRaceResults(raceId) {
  const url = `${API_BASE_URL}/results.php?race=${raceId}`;
  const key = `results_${raceId}`;
  return await fetchAndCache(url, key);
}


async function fetchDrivers() {
  const url = `${API_BASE_URL}/drivers.php`;
  const key = "drivers";
  return await fetchAndCache(url, key);
}


async function fetchConstructors() {
  const url = `${API_BASE_URL}/constructors.php`;
  const key = "constructors";
  return await fetchAndCache(url, key);
}
