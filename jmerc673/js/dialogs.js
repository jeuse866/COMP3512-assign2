function addToFavorites(type, item) {
    const favorites = getFromLocalStorage("favorites") || [];
    if (!favorites.some(fav => fav.item.id === item.id && fav.type === type)) {
        favorites.push({ type, item });
        saveToLocalStorage("favorites", favorites);
    }
    markAsFavorite(type, item.id);
}

function removeFromFavorites(type, itemId) {
    let favorites = getFromLocalStorage("favorites") || [];
    favorites = favorites.filter(fav => fav.item.id !== itemId || fav.type !== type);
    saveToLocalStorage("favorites", favorites);
    unmarkAsFavorite(type, itemId);
}

function markAsFavorite(type, itemId) {
    const elements = document.querySelectorAll(`.${type}-${itemId}`);
    elements.forEach(element => {
        if (!element.textContent.includes("❤️")) {
            element.textContent += " ❤️";
        }
    });
}

function unmarkAsFavorite(type, itemId) {
    const elements = document.querySelectorAll(`.${type}-${itemId}`);
    elements.forEach(element => {
        element.textContent = element.textContent.replace(" ❤️", "");
    });
}

function updateFavoritesInTable() {
    const favorites = getFromLocalStorage("favorites") || [];
    if (Array.isArray(favorites)) {
        favorites.forEach(favorite => {
            markAsFavorite(favorite.type, favorite.item.id);
        });
    }
}

async function showDriverDialog(driverId) {
    const driverDialog = document.querySelector("#driverDialog");
    const driverDetails = document.querySelector("#driverDetails");

    try {
        const cachedDrivers = getFromLocalStorage("drivers") || [];
        let driverData = cachedDrivers.find(driver => driver.id === driverId);

        if (!driverData) {
            const response = await fetch(`https://www.randyconnolly.com/funwebdev/3rd/api/f1/drivers.php?ref=${driverId}`);
            driverData = await response.json();
            saveToLocalStorage("drivers", [...cachedDrivers, driverData]);
        }

        const favorites = getFromLocalStorage("favorites") || [];
        let isFavorite = favorites.some(fav => fav.item.id === driverId && fav.type === "Driver");

        const driverImage = "https://placehold.co/600x400";

        // Fetch race results for the driver
        const raceResults = await fetchRaceResultsByDriver(driverId);

        // Construct race results table
        const raceResultsHTML = `
            <table>
                <thead>
                    <tr><th>Round</th><th>Race Name</th><th>Position</th></tr>
                </thead>
                <tbody>
                    ${raceResults.map(result => `
                        <tr>
                            <td>${result.round}</td>
                            <td>${result.raceName}</td>
                            <td>${result.position}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>`;

        driverDetails.innerHTML = `
            <img src="${driverImage}" alt="Image of ${driverData.forename} ${driverData.surname}" class="driver-image">
            <p class="Driver-${driverData.id}"><strong>Name:</strong> ${driverData.forename} ${driverData.surname}</p>
            <p><strong>Date of Birth:</strong> ${driverData.dob}</p>
            <p><strong>Nationality:</strong> ${driverData.nationality}</p>
            <p><strong>Permanent Number:</strong> ${driverData.permanentNumber || "N/A"}</p>
            <p><strong>Wins:</strong> ${driverData.wins || "N/A"}</p>
            <p><a href="${driverData.url}" target="_blank">Learn more on Wikipedia</a></p>
            <button id="toggleFavoriteDriverBtn">${isFavorite ? "Remove from Favorites" : "Add to Favorites"}</button>
            <div class="race-results">${raceResultsHTML}</div>
            <button id="closeDriverDialog">Close</button>
        `;

        const toggleFavoriteBtn = document.querySelector("#toggleFavoriteDriverBtn");
        toggleFavoriteBtn.addEventListener("click", () => {
            if (isFavorite) {
                removeFromFavorites("Driver", driverData.id);
                toggleFavoriteBtn.textContent = "Add to Favorites";
            } else {
                addToFavorites("Driver", driverData);
                toggleFavoriteBtn.textContent = "Remove from Favorites";
            }
            isFavorite = !isFavorite;
        });

        document.querySelector("#closeDriverDialog").addEventListener("click", () => {
            driverDialog.close();
        });

        driverDialog.showModal();
    } catch (error) {
        console.error("Error loading driver details:", error);
        driverDetails.innerHTML = `<p>Error loading driver details. Please try again later.</p>`;
    }
}

async function showConstructorDialog(constructorId) {
    const constructorDialog = document.querySelector("#constructorDialog");
    const constructorDetails = document.querySelector("#constructorDetails");

    try {
        const cachedConstructors = getFromLocalStorage("constructors") || [];
        let constructorData = cachedConstructors.find(constructor => constructor.id === constructorId);

        if (!constructorData) {
            const response = await fetch(`https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructors.php?ref=${constructorId}`);
            constructorData = await response.json();
            saveToLocalStorage("constructors", [...cachedConstructors, constructorData]);
        }

        const favorites = getFromLocalStorage("favorites") || [];
        let isFavorite = favorites.some(fav => fav.item.id === constructorId && fav.type === "Constructor");

        const raceResults = await fetchRaceResultsByConstructor(constructorId);

        const constructorImage = "https://placehold.co/600x400";

        let raceResultsHTML = `<table>
            <thead>
                <tr><th>Round</th><th>Race Name</th><th>Driver</th><th>Position</th></tr>
            </thead>
            <tbody>
                ${raceResults.map(result => `
                    <tr>
                        <td>${result.round}</td>
                        <td>${result.raceName}</td>
                        <td>${result.driverName}</td>
                        <td>${result.position}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>`;

        constructorDetails.innerHTML = `
            <img src="${constructorImage}" alt="Image of ${constructorData.name}" class="constructor-image">
            <p class="Constructor-${constructorData.id}"><strong>Name:</strong> ${constructorData.name}</p>
            <p><strong>Nationality:</strong> ${constructorData.nationality}</p>
            <p><a href="${constructorData.url}" target="_blank">Learn more on Wikipedia</a></p>
            <button id="toggleFavoriteConstructorBtn">${isFavorite ? "Remove from Favorites" : "Add to Favorites"}</button>
            <div class="race-results">${raceResultsHTML}</div>
            <button id="closeConstructorDialog">Close</button>
        `;

        const toggleFavoriteBtn = document.querySelector("#toggleFavoriteConstructorBtn");
        toggleFavoriteBtn.addEventListener("click", () => {
            if (isFavorite) {
                removeFromFavorites("Constructor", constructorData.id);
                toggleFavoriteBtn.textContent = "Add to Favorites";
            } else {
                addToFavorites("Constructor", constructorData);
                toggleFavoriteBtn.textContent = "Remove from Favorites";
            }
            isFavorite = !isFavorite;
        });

        document.querySelector("#closeConstructorDialog").addEventListener("click", () => {
            constructorDialog.close();
        });

        constructorDialog.showModal();
    } catch (error) {
        console.error("Error loading constructor details:", error);
        constructorDetails.innerHTML = `<p>Error loading constructor details. Please try again later.</p>`;
    }
}

async function showCircuitDialog(circuitId) {
    const circuitDialog = document.querySelector("#circuitDialog");
    const circuitDetails = document.querySelector("#circuitDetails");

    try {
        const cachedCircuits = getFromLocalStorage("circuits") || [];
        let circuitData = cachedCircuits.find(circuit => circuit.id === circuitId);

        if (!circuitData) {
            const response = await fetch(`https://www.randyconnolly.com/funwebdev/3rd/api/f1/circuits.php?id=${circuitId}`);
            circuitData = await response.json();
            saveToLocalStorage("circuits", [...cachedCircuits, circuitData]);
        }

        circuitDetails.innerHTML = `
            <p class="Circuit-${circuitData.id}"><strong>Name:</strong> ${circuitData.name}</p>
            <p><strong>Location:</strong> ${circuitData.location}, ${circuitData.country}</p>
            <p><a href="${circuitData.url}" target="_blank">Learn more on Wikipedia</a></p>
            <button id="toggleFavoriteCircuitBtn">Toggle Favorite</button>
        `;

        circuitDialog.showModal();
    } catch (error) {
        console.error("Error loading circuit details:", error);
        circuitDetails.innerHTML = `<p>Error loading circuit details. Please try again later.</p>`;
    }
}

async function fetchRaceResultsByConstructor(constructorId) {
    try {
        const response = await fetch(`https://www.randyconnolly.com/funwebdev/3rd/api/f1/results.php?constructor=${constructorId}`);
        const data = await response.json();

        console.log("Fetched race results:", data);

        const filteredResults = data.filter(result => result.constructor.id === constructorId);

        console.log("Filtered results:", filteredResults);

        return filteredResults.map(result => ({
            round: result.race?.round || "N/A",
            raceName: result.race?.name || "N/A",
            driverName: `${result.driver?.forename || "N/A"} ${result.driver?.surname || "N/A"}`,
            position: result.position || "N/A",
        }));

    } catch (error) {
        console.error("Error fetching race results by constructor:", error);
        return [];
    }
}