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

async function showDriverDialog(driverRef) {
  const driverDialog = document.querySelector("#driverDialog");
  const driverDetails = document.querySelector("#driverDetails");

  try {
    const cachedDrivers = getFromLocalStorage("drivers") || [];
    let driverData = cachedDrivers.find(driver => driver.id === driverRef);

    if (!driverData) {
      const response = await fetch(`${API_BASE_URL}/drivers.php?ref=${driverRef}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      driverData = await response.json();
      saveToLocalStorage("drivers", [...cachedDrivers, driverData]);
    }

    const favorites = getFromLocalStorage("favorites") || [];
    let isFavorite = favorites.some(fav => fav.item.id === driverRef && fav.type === "Driver");

    const driverImage = "https://placehold.co/600x400";

    const results2023 = await fetchRaceResultsByDriver(driverRef, 2023);
    const results2022 = await fetchRaceResultsByDriver(driverRef, 2022);
    const results2021 = await fetchRaceResultsByDriver(driverRef, 2021);
    const results2020 = await fetchRaceResultsByDriver(driverRef, 2020);

    const raceResults = [...results2023, ...results2022, ...results2021, ...results2020];

    const raceResultsHTML = `
      <table>
        <thead>
          <tr>
            <th>Round</th>
            <th>Race Name</th>
            <th>Position</th>
          </tr>
        </thead>
        <tbody>
          ${raceResults.map(result => `
            <tr>
              <td>${result.round || "N/A"}</td>
              <td>${result.name || "N/A"}</td>
              <td>${result.positionOrder || "N/A"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;

    driverDetails.innerHTML = `
      <img src="${driverImage}" alt="Image of ${driverData.forename} ${driverData.surname}" class="driver-image">
      <p><strong>Name:</strong> ${driverData.forename} ${driverData.surname}</p>
      <p><strong>Date of Birth:</strong> ${driverData.dob}</p>
      <p><strong>Nationality:</strong> ${driverData.nationality}</p>
      <p><a href="${driverData.url}" target="_blank">Learn more on Wikipedia</a></p>
      <button id="toggleFavoriteDriverBtn">${isFavorite ? "Remove from Favorites" : "Add to Favorites"}</button>
      <div class="race-results">${raceResultsHTML}</div>
      <button id="closeDriverDialog">Close</button>
    `;

    const toggleFavoriteBtn = document.querySelector("#toggleFavoriteDriverBtn");
    toggleFavoriteBtn.addEventListener("click", () => {
      if (isFavorite) {
        removeFromFavorites("Driver", driverRef);
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
    console.log(constructorId);
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

        console.log(constructorId);
        let raceResultsHTML = `<table>
            <thead>
                <tr><th>Round</th><th>Race Name</th><th>Driver</th><th>Position</th></tr>
            </thead>
            <tbody>
                ${raceResults.map(result => `
                    <tr>
                        <td>${result.round}</td>
                        <td>${result.name}</td>
                        <td>${result.forename} ${result.surname}</td>
                        <td>${result.positionOrder}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>`;

        constructorDetails.innerHTML = `
            <img src="${constructorImage}" alt="Image of ${constructorData.name}" class="constructor-image">
            <p class="Constructor-${constructorData.constructorId}"><strong>Name:</strong> ${constructorData.name}</p>
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

