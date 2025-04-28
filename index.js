const searchBtn = document.getElementById("search-btn")
const searchBar = document.getElementById("search-bar")
const quickViewSection = document.getElementById("quickview-section")
const mapBtn = document.getElementById("map-btn")

const map = L.map('map')
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);
setTimeout(() => {
    map.invalidateSize();
}, 100);

let marker = null;

navigator.geolocation.getCurrentPosition(
    async (position) => {
        const lat = position.coords.latitude.toFixed(5);
        const lng = position.coords.longitude.toFixed(5);
        const initData = await getWeather(`${lat},${lng}`);
        updateWeather(initData);
        map.setView([lat, lng], 15);
        
        setMarker(lat, lng)
    },
    (error) => {
        console.error('Error getting location:', error);
    }
);

map.on('click', function (e) {

    const lat = e.latlng.lat.toFixed(5);
    const lng = e.latlng.lng.toFixed(5);
  
    searchBar.value = `${lat},${lng}`;

    setMarker(lat, lng)
});

searchBar.addEventListener('keypress', (event) => {
    if(event.key === 'Enter') {
        searchBtn.click()
    }
})

searchBtn.addEventListener('click', async () => {
    const query = searchBar.value
    const data = await getWeather(query)

    updateWeather(data);
    map.setView([data.location.lat, data.location.lon], 13);
    setMarker(data.location.lat, data.location.lon)
})

function setMarker(lat, lon) {
    if(marker) {
        map.removeLayer(marker);
    }
    
    marker = L.marker([lat, lon]).addTo(map);
}

async function getWeather(query) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=a38cb3e4e2464abe952104838201908&q=${query}`)
        const data = await response.json()

        if (data.error) {
            quickViewSection.style.display = "flex"

            quickViewSection.innerHTML = 
            `
            <h3 class="error">${data.error.message}</h3>
            `
            throw new Error(data.error.message); // 👈 manually throw if API returns error
        }

        console.log(data)
        return data
    } catch (error) {
        console.error('Error:', error)
    }
}

function updateWeather(data) {
    quickViewSection.style.display = "flex"

    quickViewSection.innerHTML =
    `
    <div class="quickview-general">
        <div class="location-details">
            <h3>${data.location.name}, ${data.location.country}</h3>
            <h3 class="condition-text">${data.current.condition.text}</h3>
            <h4>Last Updated ${data.current.last_updated}</h4>
        </div>
        <div class="condition-details">
            <div class="real">
                <h5>Temperature</h5>
                <h3>${data.current.temp_c}°C</h3>
            </div>
            <div class="feels-like">
                <h5>Feels Like</h5>
                <h3>${data.current.feelslike_c}°C</h3>
            </div>
            <img src="${data.current.condition.icon ? "https:" + data.current.condition.icon : './assets/logo.png'}" alt="condition" class="icon">
        </div>
    </div>
    <div class="quickview-detailed">
        <div class="quickview-detail">
            <h3>${data.current.wind_kph}<span>km/h</span></h3>
            <h4>Wind</h4>
        </div>
        <div class="partition"></div>
        <div class="quickview-detail">
            <h3>${data.current.pressure_mb}<span>mb</span></h3>
            <h4>Pressure</h4>
        </div>
        <div class="partition"></div>
        <div class="quickview-detail">
            <h3>${data.current.precip_mm}<span>mm</span></h3>
            <h4>Precipitation</h4>
        </div>
        <div class="partition"></div>
        <div class="quickview-detail">
            <h3>${data.current.humidity}<span>%</span></h3>
            <h4>Humidity</h4>
        </div>
        <div class="partition"></div>
        <div class="quickview-detail">
            <h3>${data.current.uv}</h3>
            <h4>UV Index</h4>
        </div>
    </div>
    `
}