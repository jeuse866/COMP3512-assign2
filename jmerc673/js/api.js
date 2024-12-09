const API_BASE_URL = "https://www.randyconnolly.com/funwebdev/3rd/api/f1";

async function fetchRaces(season) {
  const url = `${API_BASE_URL}/races.php?season=${season}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch races for season ${season}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Races Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching race data:", error);
    throw error;
  }
}

async function fetchQualifyingResults(raceId) {
  const qualifyingUrl = `${API_BASE_URL}/qualifying.php?race=${raceId}`;
  const driversUrl = `${API_BASE_URL}/drivers.php`;
  const constructorsUrl = `${API_BASE_URL}/constructors.php`;

  try {
    const [qualifyingData, driversData, constructorsData] = await Promise.all([
      fetch(qualifyingUrl).then(res => res.json()),
      fetch(driversUrl).then(res => res.json()),
      fetch(constructorsUrl).then(res => res.json()),
    ]);

    const driverMap = Object.fromEntries(driversData.map(d => [d.driverId, `${d.forename} ${d.surname}`]));
    const constructorMap = Object.fromEntries(constructorsData.map(c => [c.constructorId, c.name]));

    return qualifyingData.map(result => ({
      ...result,
      Driver: driverMap[result.driverId] || "Unknown",
      Constructor: constructorMap[result.constructorId] || "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching qualifying results:", error);
    throw error;
  }
}

async function fetchRaceResults(raceId) {
  const resultsUrl = `${API_BASE_URL}/results.php?race=${raceId}`;
  const driversUrl = `${API_BASE_URL}/drivers.php`;
  const constructorsUrl = `${API_BASE_URL}/constructors.php`;

  try {
    const [resultsData, driversData, constructorsData] = await Promise.all([
      fetch(resultsUrl).then(res => res.json()),
      fetch(driversUrl).then(res => res.json()),
      fetch(constructorsUrl).then(res => res.json()),
    ]);

    const driverMap = Object.fromEntries(driversData.map(d => [d.driverId, `${d.forename} ${d.surname}`]));
    const constructorMap = Object.fromEntries(constructorsData.map(c => [c.constructorId, c.name]));


    return resultsData.map(result => ({
      ...result,
      Driver: driverMap[result.driverId] || "Unknown",
      Constructor: constructorMap[result.constructorId] || "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching race results:", error);
    throw error;
  }
}
