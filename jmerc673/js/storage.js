function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    try {
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : null;
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return null;
    }
}