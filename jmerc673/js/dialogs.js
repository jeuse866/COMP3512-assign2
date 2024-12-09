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
    const favorites = getFromLocalStorage("favorites") || []; // Ensure it's an array
    if (Array.isArray(favorites)) {
        favorites.forEach(favorite => {
            markAsFavorite(favorite.type, favorite.item.id);
        });
    } 
}

async function showDriverDialog(driverId) {
    const driverDialog = document.querySelector("#driverDialog");
    const driverDetails = document.querySelector("#driverDetails");

    const response = await fetch(`https://www.randyconnolly.com/funwebdev/3rd/api/f1/drivers.php?ref=${driverId}`);
    const data = await response.json();

    const favorites = getFromLocalStorage("favorites") || [];
    let isFavorite = favorites.some(fav => fav.item.id === driverId && fav.type === "Driver");

    driverDetails.innerHTML = `
        <p class="Driver-${data.id}"><strong>Name:</strong> ${data.forename} ${data.surname}</p>
        <p><strong>Date of Birth:</strong> ${data.dob}</p>
        <p><strong>Nationality:</strong> ${data.nationality}</p>
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
    updateFavoritesInTable(); // Ensure heart is displayed properly
}

async function showConstructorDialog(constructorId) {
    const constructorDialog = document.querySelector("#constructorDialog");
    const constructorDetails = document.querySelector("#constructorDetails");

    const response = await fetch(`https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructors.php?ref=${constructorId}`);
    const data = await response.json();

    const favorites = getFromLocalStorage("favorites") || [];
    let isFavorite = favorites.some(fav => fav.item.id === constructorId && fav.type === "Constructor");

    constructorDetails.innerHTML = `
        <p class="Constructor-${data.id}"><strong>Name:</strong> ${data.name}</p>
        <p><strong>Nationality:</strong> ${data.nationality}</p>
        <p><a href="${data.url}" target="_blank">Learn more on Wikipedia</a></p>
        <button id="toggleFavoriteConstructorBtn">${isFavorite ? "Remove from Favorites" : "Add to Favorites"}</button>
    `;

    const toggleFavoriteBtn = document.querySelector("#toggleFavoriteConstructorBtn");
    toggleFavoriteBtn.addEventListener("click", () => {
        if (isFavorite) {
            removeFromFavorites("Constructor", data.id);
            toggleFavoriteBtn.textContent = "Add to Favorites";
        } else {
            addToFavorites("Constructor", data);
            toggleFavoriteBtn.textContent = "Remove from Favorites";
        }
        isFavorite = !isFavorite;
    });

    constructorDialog.showModal();
    updateFavoritesInTable(); // Ensure heart is displayed properly
}

async function fetchDriverById(driverId) {
    const url = `${API_BASE_URL}/drivers.php?ref=${driverId}`;
    const drivers = await fetch(url).then(res => res.json());
    return drivers.find(driver => driver.id === driverId);
}

async function fetchConstructorById(constructorId) {
    const url = `${API_BASE_URL}/constructors.php?ref=${constructorId}`;
    const constructors = await fetch(url).then(res => res.json());
    return constructors.find(constructor => constructor.id === constructorId);
}

async function showCircuitDialog(circuitId) {
    const circuitDialog = document.querySelector("#circuitDialog");
    const circuitDetails = document.querySelector("#circuitDetails");

    const response = await fetch(`https://www.randyconnolly.com/funwebdev/3rd/api/f1/circuits.php?id=${circuitId}`);
    const data = await response.json();

    circuitDetails.innerHTML = `
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Location:</strong> ${data.location}, ${data.country}</p>
        <p><a href="${data.url}" target="_blank">Learn more on Wikipedia</a></p>
    `;

    circuitDialog.showModal();
}
