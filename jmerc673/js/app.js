document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    populateSeasonDropdown();
});

function setupEventListeners() {
    const viewRacesBtn = document.querySelector("#viewRacesBtn");
    const backToHomeBtn = document.querySelector("#backToHomeBtn");

    viewRacesBtn.addEventListener("click", async () => {
        const seasonSelect = document.querySelector("#seasonSelect");
        const selectedSeason = seasonSelect.value;
        if (selectedSeason) {
            await loadRaces(selectedSeason);
            showView("#racesView");
        } else {
            alert("Please select a season!");
        }
    });

    backToHomeBtn.addEventListener("click", () => {
        showView("#homeView");
    });
}

async function loadRaces(season) {
    const raceList = document.querySelector("#raceList");
    const raceDetailsMessage = document.querySelector("#raceDetailsMessage");
    const raceDetails = document.querySelector("#raceDetails");

    raceList.innerHTML = "";
    raceDetailsMessage.classList.remove("hidden");
    raceDetails.classList.add("hidden");

    try {
        const races = await fetchRaces(season);
        if (races.length === 0) {
            raceList.innerHTML = `<p>No races found for the selected season.</p>`;
            return;
        }

        races.sort((a, b) => a.round - b.round);
        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Round</th>
                    <th>Race Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");
        races.forEach((race) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${race.round}</td>
                <td>${race.name || "Unknown Race"}</td>
                <td>
                    <button class="viewDetailsBtn" data-race-id="${race.id}">Results</button>
                </td>
            `;

            tbody.appendChild(row);
            row.querySelector(".viewDetailsBtn").addEventListener("click", () => {
                loadRaceDetails(race);
            });
        });

        raceList.appendChild(table);
        updateFavoritesInTable();

    } catch (error) {
        console.error("Error loading races:", error);
        raceList.innerHTML = `<p>Error loading races. Please try again later.</p>`;
    }
}

async function loadRaceDetails(race) {
    const raceTitle = document.querySelector("#raceTitle");
    const qualifyingList = document.querySelector("#qualifyingList");
    const raceResultsList = document.querySelector("#raceResultsList");
    const raceDetailsMessage = document.querySelector("#raceDetailsMessage");
    const raceDetails = document.querySelector("#raceDetails");

    raceTitle.innerHTML = `
        Results for 
        <span>${race.name || "Unknown"}</span> 
        (<a href="#" class="circuit-link" data-circuit-id="${race.circuit.id}">${race.circuit.name || "Unknown Circuit"}</a>)
    `;

    qualifyingList.innerHTML = "";
    raceResultsList.innerHTML = "";
    raceDetailsMessage.classList.add("hidden");
    raceDetails.classList.remove("hidden");

    const circuitLink = raceTitle.querySelector(".circuit-link");
    if (circuitLink) {
        circuitLink.addEventListener("click", (event) => {
            event.preventDefault();
            showCircuitDialog(circuitLink.dataset.circuitId);
        });
    }

    try {
        const [qualifyingResults, raceResults] = await Promise.all([
            fetchQualifyingResults(race.id),
            fetchRaceResults(race.id),
        ]);

        if (Array.isArray(qualifyingResults)) {
            const table = document.createElement("table");
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Driver</th>
                        <th>Constructor</th>
                        <th>Q1</th>
                        <th>Q2</th>
                        <th>Q3</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = table.querySelector("tbody");

            qualifyingResults.sort((a, b) => a.position - b.position);
            qualifyingResults.forEach((result) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${result.position}</td>
                    <td>
                        <a href="#" class="driver-link" data-driver-id="${result.driver.id}">
                            ${result.driver.forename} ${result.driver.surname}
                        </a>
                    </td>
                    <td>
                        <a href="#" class="constructor-link" data-constructor-id="${result.constructor.id}">
                            ${result.constructor.name}
                        </a>
                    </td>
                    <td>${result.q1 || "N/A"}</td>
                    <td>${result.q2 || "N/A"}</td>
                    <td>${result.q3 || "N/A"}</td>
                `;
                tbody.appendChild(row);

                row.querySelector(".driver-link").addEventListener("click", (e) => {
                    e.preventDefault();
                    showDriverDialog(result.driver.ref);
                });

                row.querySelector(".constructor-link").addEventListener("click", (e) => {
                    e.preventDefault();
                    showConstructorDialog(result.constructor.ref);
                });
            });

            qualifyingList.appendChild(table);
            updateFavoritesInTable();
        } else {
            qualifyingList.innerHTML = `<p>No qualifying results available.</p>`;
        }

        if (Array.isArray(raceResults)) {
            const table = document.createElement("table");
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Driver</th>
                        <th>Constructor</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = table.querySelector("tbody");

            raceResults.sort((a, b) => a.position - b.position);
            raceResults.forEach((result, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${result.position}</td>
                    <td>
                        <a href="#" class="driver-link" data-driver-id="${result.driver.id}">
                            ${result.driver.forename} ${result.driver.surname}
                        </a>
                    </td>
                    <td>
                        <a href="#" class="constructor-link" data-constructor-id="${result.constructor.id}">
                            ${result.constructor.name}
                        </a>
                    </td>
                `;
                tbody.appendChild(row);

                row.querySelector(".driver-link").addEventListener("click", (e) => {
                    e.preventDefault();
                    showDriverDialog(result.driver.ref);
                });

                row.querySelector(".constructor-link").addEventListener("click", (e) => {
                    e.preventDefault();
                    showConstructorDialog(result.constructor.ref);
                });
            });

            raceResultsList.appendChild(table);
            updateFavoritesInTable();
        } else {
            raceResultsList.innerHTML = `<p>No race results available.</p>`;
        }
    } catch (error) {
        console.error("Error loading race details:", error);
    }
}

function showView(viewSelector) {
    document.querySelectorAll(".view").forEach(view => {
        view.classList.add("hidden");
    });
    document.querySelector(viewSelector).classList.remove("hidden");
}

function populateSeasonDropdown() {
    const seasonSelect = document.querySelector("#seasonSelect");
    const seasons = [2023, 2022, 2021, 2020];

    seasons.forEach(season => {
        const option = document.createElement("option");
        option.value = season;
        option.textContent = season;
        seasonSelect.appendChild(option);
    });
}
