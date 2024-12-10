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

function updateHearts(type, itemId) {
    const elements = document.querySelectorAll(`.${type}-${itemId}`);
    elements.forEach(element => {
        if (!element.textContent.includes("❤️")) {
            element.innerHTML = `${element.innerHTML} ❤️`;
        }
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
        const response = await fetch(`https://www.randyconnolly.com/funwebdev/3rd/api/f1/drivers.php?ref=${driverId}`);
        const data = await response.json();

        const favorites = getFromLocalStorage("favorites") || [];
        let isFavorite = favorites.some(fav => fav.item.id === driverId && fav.type === "Driver");

        const driverImage = "https://placehold.co/600x400";

        driverDetails.innerHTML = `
            <img src="${driverImage}" alt="Image of ${data.forename} ${data.surname}" class="driver-image">
            <p class="Driver-${data.id}"><strong>Name:</strong> ${data.forename} ${data.surname}</p>
            <p><strong>Date of Birth:</strong> ${data.dob}</p>
            <p><strong>Nationality:</strong> ${data.nationality}</p>
            <p><strong>Permanent Number:</strong> ${data.permanentNumber || "N/A"}</p>
            <p><strong>Wins:</strong> ${data.wins || "N/A"}</p>
            <p><a href="${data.url}" target="_blank">Learn more on Wikipedia</a></p>
            <button id="toggleFavoriteDriverBtn">${isFavorite ? "Remove from Favorites" : "Add to Favorites"}</button>
        `;

        const toggleFavoriteBtn = document.querySelector("#toggleFavoriteDriverBtn");
        toggleFavoriteBtn.addEventListener("click", () => {
            if (isFavorite) {
                removeFromFavorites("Driver", data.id);
                toggleFavoriteBtn.textContent = "Add to Favorites";
            } else {
                addToFavorites("Driver", data);
                toggleFavoriteBtn.textContent = "Remove from Favorites";
            }
            isFavorite = !isFavorite;
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
        const response = await fetch(`https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructors.php?ref=${constructorId}`);
        const data = await response.json();

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
            <img src="${constructorImage}" alt="Image of ${data.name}" class="constructor-image">
            <p class="Constructor-${data.id}"><strong>Name:</strong> ${data.name}</p>
            <p><strong>Nationality:</strong> ${data.nationality}</p>
            <p><a href="${data.url}" target="_blank">Learn more on Wikipedia</a></p>
            <div class="race-results">${raceResultsHTML}</div>
            <button id="closeConstructorDialog">Close</button>
        `;

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
        const response = await fetch(`https://www.randyconnolly.com/funwebdev/3rd/api/f1/circuits.php?id=${circuitId}`);
        const data = await response.json();

        const favorites = getFromLocalStorage("favorites") || [];
        let isFavorite = favorites.some(fav => fav.item.id === circuitId && fav.type === "Circuit");

        circuitDetails.innerHTML = `
            <p class="Circuit-${data.id}"><strong>Name:</strong> ${data.name}</p>
            <p><strong>Location:</strong> ${data.location}, ${data.country}</p>
            <p><a href="${data.url}" target="_blank">Learn more on Wikipedia</a></p>
            <button id="toggleFavoriteCircuitBtn">${isFavorite ? "Remove from Favorites" : "Add to Favorites"}</button>
        `;

        const toggleFavoriteBtn = document.querySelector("#toggleFavoriteCircuitBtn");
        toggleFavoriteBtn.addEventListener("click", () => {
            if (isFavorite) {
                removeFromFavorites("Circuit", data.id);
                toggleFavoriteBtn.textContent = "Add to Favorites";
            } else {
                addToFavorites("Circuit", data);
                toggleFavoriteBtn.textContent = "Remove from Favorites";
            }
            isFavorite = !isFavorite;
        });

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

        console.log("Fetched race results:", data); // Debugging line

        // Filter results to include only races where the constructor matches
        const filteredResults = data.filter(result => result.constructor.id === constructorId);

        console.log("Filtered results:", filteredResults); // Debugging line

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


