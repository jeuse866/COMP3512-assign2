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
            hideDropdownControls();
        } else {
            alert("Please select a season!");
        }
    });

    backToHomeBtn.addEventListener("click", () => {
        showView("#homeView");
        resetDropdownControls();
    });

    document.querySelector("#logo").addEventListener("click", (e) => {
        e.preventDefault();
        resetHomePage();
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
                    <td class="Race-${race.id}">
                        ${race.name || "Unknown Race"}
                    </td>
                    <td>
                        <button class="viewDetailsBtn" data-race-id="${race.id}">Results</button>
                    </td>
                `;

            tbody.appendChild(row);
            row.querySelector(".viewDetailsBtn").addEventListener("click", () => {
                loadRaceDetails(race);
            });

            const favorites = getFromLocalStorage("favorites") || [];
            if (favorites.some(fav => fav.type === "Race" && fav.item.id === race.id)) {
                markAsFavorite("Race", race.id);
            }
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

        populateResultsTable(qualifyingList, qualifyingResults, "qualifying");
        populateResultsTable(raceResultsList, raceResults, "race");
    } catch (error) {
        console.error("Error loading race details:", error);
    }
}

function populateResultsTable(container, results, type) {
    if (Array.isArray(results)) {
        const table = document.createElement("table");
        table.id = type === "qualifying" ? "qualifyingResultsTable" : "raceResultsTable";
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Position</th>
                    <th>Driver</th>
                    <th>Constructor</th>
                    ${type === "qualifying" ? "<th>Q1</th><th>Q2</th><th>Q3</th>" : ""}
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");
        results.sort((a, b) => a.position - b.position);
        results.forEach((result) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${result.position}</td>
                <td class="Driver-${result.driver.id}">
                    <a href="#" class="driver-link" data-driver-id="${result.driver.id}">
                        ${result.driver.forename} ${result.driver.surname}
                    </a>
                </td>
                <td class="Constructor-${result.constructor.id}">
                    <a href="#" class="constructor-link" data-constructor-id="${result.constructor.id}">
                        ${result.constructor.name}
                    </a>
                </td>
                ${type === "qualifying" ? `
                <td>${result.q1 || "N/A"}</td>
                <td>${result.q2 || "N/A"}</td>
                <td>${result.q3 || "N/A"}</td>` : ""}
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

        container.appendChild(table);
        addSorting(table.id);
    } else {
        container.innerHTML = `<p>No ${type} results available.</p>`;
    }
}

function showView(viewSelector) {

    document.querySelectorAll(".view").forEach(view => {
        view.classList.add("hidden");
    });


    const selectedView = document.querySelector(viewSelector);
    if (selectedView) {
        selectedView.classList.remove("hidden");
    }


    if (viewSelector === "#homeView") {

        const seasonSelect = document.querySelector("#seasonSelect");
        const viewRacesBtn = document.querySelector("#viewRacesBtn");
        const trackImage = document.querySelector(".right-content img");

        if (seasonSelect) seasonSelect.style.display = "inline-block";
        if (viewRacesBtn) viewRacesBtn.style.display = "inline-block";
        if (trackImage) trackImage.style.display = "inline-block";
    } else {

        const seasonSelect = document.querySelector("#seasonSelect");
        const viewRacesBtn = document.querySelector("#viewRacesBtn");
        const trackImage = document.querySelector(".right-content img");

        if (seasonSelect) seasonSelect.style.display = "none";
        if (viewRacesBtn) viewRacesBtn.style.display = "none";
        if (trackImage) trackImage.style.display = "none";
    }
}

function resetHomePage() {
    showView("#homeView");
    resetDropdownControls();
    const raceList = document.querySelector("#raceList");
    raceList.innerHTML = "";
    document.querySelector("#qualifyingList").innerHTML = "";
    document.querySelector("#raceResultsList").innerHTML = "";
}

function hideDropdownControls() {
    document.querySelector(".content-row").style.display = "none";
}

function resetDropdownControls() {
    document.querySelector(".content-row").style.display = "flex";
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

function addSorting(tableId) {
    const table = document.querySelector(`#${tableId}`);
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        header.addEventListener("click", () => {
            sortTable(table, index);
            updateSortIndicator(header);
        });
    });
}

function sortTable(table, columnIndex) {
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const sortedRows = rows.sort((a, b) => {
        const aText = a.children[columnIndex].textContent.trim();
        const bText = b.children[columnIndex].textContent.trim();
        return aText.localeCompare(bText, undefined, { numeric: true });
    });
    sortedRows.forEach(row => table.querySelector("tbody").appendChild(row));
}

function updateSortIndicator(header) {
    const headers = header.parentElement.querySelectorAll("th");
    headers.forEach(h => h.classList.remove("ascending", "descending"));

    if (header.classList.contains("ascending")) {
        header.classList.remove("ascending");
        header.classList.add("descending");
    } else {
        header.classList.remove("descending");
        header.classList.add("ascending");
    }
}