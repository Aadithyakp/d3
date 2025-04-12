// Fetch weather data and create map
const apiKey = "861b1e7090c4485794c235547250904";
const city = "London";
const weatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=yes`;

// Fetch weather data
fetch(weatherApiUrl)
    .then(response => response.json())
    .then(data => {
        updateWeatherInfo(data);
        createWeatherMap(data);
    })
    .catch(error => console.error("Error fetching weather data:", error));

function updateWeatherInfo(data) {
    const { current, location } = data;
    document.querySelector("#weather-info").innerHTML = `
        <h2>Weather in ${location.name}, ${location.country}</h2>
        <p>Temperature: ${current.temp_c}°C</p>
        <p>Condition: ${current.condition.text}</p>
        <p>Air Quality Index: ${current.air_quality["us-epa-index"]}</p>
    `;
}

function createWeatherMap(data) {
    // Initialize map
    const map = L.map('map-container').setView([data.location.lat, data.location.lon], 10);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create custom icon
    const weatherIcon = L.divIcon({
        html: `<img src="${data.current.condition.icon}" style="width: 32px; height: 32px;">`,
        className: 'weather-icon',
        iconSize: [32, 32]
    });

    // Add marker with weather icon
    const marker = L.marker([data.location.lat, data.location.lon], {
        icon: weatherIcon
    }).addTo(map);

    // Add popup with weather information
    marker.bindPopup(`
        <strong>${data.location.name}, ${data.location.country}</strong><br>
        Temperature: ${data.current.temp_c}°C<br>
        Condition: ${data.current.condition.text}<br>
        Wind: ${data.current.wind_kph} km/h ${data.current.wind_dir}<br>
        Humidity: ${data.current.humidity}%
    `).openPopup();

    // Add AQI circle
    const aqiColor = getAQIColor(data.current.air_quality["us-epa-index"]);
    const aqiCircle = L.circle([data.location.lat, data.location.lon], {
        color: aqiColor,
        fillColor: aqiColor,
        fillOpacity: 0.2,
        radius: 5000
    }).addTo(map);

    // Add legend
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'map-legend');
        div.innerHTML = `
            <h4>Air Quality Index</h4>
            <i style="background: #00e400"></i> Good<br>
            <i style="background: #ffff00"></i> Moderate<br>
            <i style="background: #ff7e00"></i> Unhealthy for Sensitive Groups<br>
            <i style="background: #ff0000"></i> Unhealthy<br>
            <i style="background: #8f3f97"></i> Very Unhealthy<br>
            <i style="background: #7e0023"></i> Hazardous
        `;
        return div;
    };
    legend.addTo(map);
}

function getAQIColor(aqi) {
    switch(aqi) {
        case 1: return '#00e400'; // Good
        case 2: return '#ffff00'; // Moderate
        case 3: return '#ff7e00'; // Unhealthy for Sensitive Groups
        case 4: return '#ff0000'; // Unhealthy
        case 5: return '#8f3f97'; // Very Unhealthy
        case 6: return '#7e0023'; // Hazardous
        default: return '#808080'; // Unknown
    }
}
