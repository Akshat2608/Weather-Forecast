document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("searchButton");
    const locationInput = document.getElementById("locationInput");

    searchButton.addEventListener("click", () => {
        const location = locationInput.value.trim();
        if (location) {
            getCoordinates(location);
        } else {
            alert("Please enter a valid location.");
        }
    });

    function getCoordinates(city) {
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const { latitude, longitude } = data.results[0];
                    getWeather(latitude, longitude);
                } else {
                    alert("City not found. Try another location.");
                }
            })
            .catch(error => console.error("Error fetching coordinates:", error));
    }

    function getWeather(lat, lon) {
        const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_min,temperature_2m_max&hourly=soil_temperature_0cm,soil_moisture_1_to_3cm&current=temperature_2m,relative_humidity_2m,rain,showers,wind_speed_10m,wind_direction_10m&timezone=auto`;

        fetch(weatherAPI)
            .then(response => response.json())
            .then(data => {
                if (data.current && data.daily) {
                    updateWeatherUI(data);
                    updateForecastUI(data.daily);
                    recommendCrops(data);  // Pass the entire data object
                } else {
                    alert("Weather data not available for this location.");
                }
            })
            .catch(error => console.error("Error fetching weather:", error));
    }

    function updateWeatherUI(data) {
        document.getElementById("temperature").textContent = data.current.temperature_2m + "°C";
        document.getElementById("humidity").textContent = data.current.relative_humidity_2m + "%";
        document.getElementById("precipitation").textContent = (data.current.rain + data.current.showers) + " mm";
        document.getElementById("windSpeed").textContent = data.current.wind_speed_10m + " km/h";
        document.getElementById("soilTemperature").textContent = data.hourly.soil_temperature_0cm[0] + "°C";
        document.getElementById("soilMoisture").textContent = data.hourly.soil_moisture_1_to_3cm[0] + " m³/m³";
    }

    function updateForecastUI(dailyData) {
        const forecastContainer = document.getElementById("forecastContainer");
        forecastContainer.innerHTML = ""; // Clear previous forecast

        const days = Math.min(7, dailyData.temperature_2m_max.length);
        for (let i = 0; i < days; i++) {
            const dayCard = document.createElement("div");
            dayCard.classList.add("forecast-card");

            const date = new Date();
            date.setDate(date.getDate() + i);
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

            dayCard.innerHTML = `
                <p><strong>${dayName}</strong></p>
                <p>${dailyData.temperature_2m_max[i]}°C / ${dailyData.temperature_2m_min[i]}°C</p>
            `;

            forecastContainer.appendChild(dayCard);
        }
    }

    function getWeatherCondition(code) {
        const weatherConditions = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Fog",
            48: "Depositing rime fog",
            51: "Drizzle: Light",
            53: "Drizzle: Moderate",
            55: "Drizzle: Dense",
            61: "Rain: Slight",
            63: "Rain: Moderate",
            65: "Rain: Heavy",
            71: "Snow: Slight",
            73: "Snow: Moderate",
            75: "Snow: Heavy",
            80: "Rain showers: Slight",
            81: "Rain showers: Moderate",
            82: "Rain showers: Heavy",
        };
        return weatherConditions[code] || "Unknown condition";
    }

    function recommendCrops(data) {
        if (!data || !data.current || !data.daily) {
            alert("Insufficient weather data to recommend crops.");
            return;
        }

        // Calculate average temperature
        const avgMaxTemp = data.daily.temperature_2m_max.reduce((a, b) => a + b, 0) / data.daily.temperature_2m_max.length;
        const avgMinTemp = data.daily.temperature_2m_min.reduce((a, b) => a + b, 0) / data.daily.temperature_2m_min.length;
        const avgTemp = (avgMaxTemp + avgMinTemp) / 2;
        const humidity = data.current.relative_humidity_2m;

        console.log({ avgTemp, humidity });

        let crops = [];
        let fruits = [];
        let cropDetails = [];
        let fruitDetails = [];

        // Hot and very humid (tropical)
        if (avgTemp >= 30 && humidity >= 70) {
            crops = ["Rice", "Sugarcane", "Tea", "Coffee", "Rubber"];
            fruits = ["Banana", "Pineapple", "Papaya", "Coconut", "Mango"];
            cropDetails = [
                "Rice: Perfect for hot, humid conditions. Needs clay-rich soil with good water retention",
                "Sugarcane: Thrives in high humidity. Prefers deep, well-drained loamy soil",
                "Tea: Needs warm, humid environment. Grows best in acidic, well-drained soil",
                "Coffee: Best in humid, shaded areas. Requires fertile, well-drained volcanic soil",
                "Rubber: Requires tropical conditions. Thrives in deep, well-drained clay loam"
            ];
            fruitDetails = [
                "Banana: Tropical fruit, loves humidity. Needs rich, well-drained loamy soil",
                "Pineapple: Thrives in hot, humid weather. Prefers sandy loam soil",
                "Papaya: Year-round tropical fruit. Grows best in light, well-drained sandy loam",
                "Coconut: Perfect tropical palm. Adapts to sandy, loamy, and clay soils",
                "Mango: King of tropical fruits. Prefers deep, well-drained loamy soil"
            ];
        }
        // Hot and moderate humidity (subtropical)
        else if (avgTemp >= 30 && humidity >= 50 && humidity < 70) {
            crops = ["Cotton", "Sorghum", "Corn", "Tobacco", "Jute"];
            fruits = ["Citrus", "Guava", "Dragon Fruit", "Pomegranate", "Fig"];
            cropDetails = [
                "Cotton: Tolerates high heat. Needs deep, well-drained clay or loamy soil",
                "Sorghum: Heat and drought resistant. Adapts to various soils, prefers loamy",
                "Corn: Warm season crop. Requires rich, well-drained loam soil",
                "Tobacco: Heat loving crop. Grows best in light, sandy loam soil",
                "Jute: Thrives in warm weather. Prefers well-drained alluvial soil"
            ];
            fruitDetails = [
                "Citrus: Loves warm climate. Needs well-drained, slightly acidic sandy loam",
                "Guava: Hardy tropical fruit. Adapts to most soils, prefers loamy",
                "Dragon Fruit: Heat-loving cactus fruit. Requires well-drained sandy soil",
                "Pomegranate: Drought-tolerant fruit. Thrives in deep loamy soil",
                "Fig: Mediterranean climate fruit. Prefers loose, well-drained loamy soil"
            ];
        }
        // Warm and humid (temperate)
        else if (avgTemp >= 25 && avgTemp < 30 && humidity >= 60) {
            crops = ["Maize", "Soybean", "Ginger", "Turmeric", "Sweet Potato"];
            fruits = ["Grapes", "Peach", "Plum", "Lychee", "Longan"];
            cropDetails = [
                "Maize: Warm season grain. Needs fertile, well-drained loamy soil",
                "Soybean: Summer legume crop. Grows well in loamy and clay loam soils",
                "Ginger: Tropical spice crop. Requires rich, well-drained sandy loam",
                "Turmeric: Warm climate spice. Prefers well-drained loamy soil",
                "Sweet Potato: Warm season root crop. Thrives in sandy loam soil"
            ];
            fruitDetails = [
                "Grapes: Moderate climate fruit. Needs deep, well-drained sandy loam",
                "Peach: Summer stone fruit. Prefers sandy loam to clay loam soil",
                "Plum: Temperate fruit tree. Grows best in well-drained loamy soil",
                "Lychee: Subtropical fruit. Requires deep, well-drained acidic soil",
                "Longan: Warm climate fruit. Thrives in rich, well-drained loamy soil"
            ];
        }
        // Moderate temperature (mild)
        else if (avgTemp >= 20 && avgTemp < 25) {
            crops = ["Wheat", "Barley", "Peas", "Potato", "Tomato"];
            fruits = ["Apple", "Pear", "Cherry", "Strawberry", "Blueberry"];
            cropDetails = [
                "Wheat: Cool season grain",
                "Barley: Spring/winter crop",
                "Peas: Cool season legume",
                "Potato: Cool season tuber",
                "Tomato: Moderate temp vegetable"
            ];
            fruitDetails = [
                "Apple: Classic temperate fruit",
                "Pear: Cool climate fruit tree",
                "Cherry: Spring flowering fruit",
                "Strawberry: Cool season berry",
                "Blueberry: Acid-loving berry"
            ];
        }
        // Cool conditions
        else {
            crops = ["Cabbage", "Cauliflower", "Carrot", "Spinach", "Lettuce"];
            fruits = ["Mango", "Blackberry", "Raspberry", "Orange", "Gooseberry"];
            cropDetails = [
                "Cabbage: Cold hardy vegetable",
                "Cauliflower: Cool season crop",
                "Carrot: Winter root vegetable",
                "Spinach: Cold tolerant green",
                "Lettuce: Cool weather salad crop"
            ];
            fruitDetails = [
                
                "Mango: Tropical fruit tree",
                "blackberry: Hardy berry bush",
                "Raspberry: Cool season berry",
                "Orange: Citrus fruit tree",
                "gooseberry: Hardy fruit bush"
            ];
        }

        // Update the UI with both crops and fruits
        const cropList = document.getElementById("cropList");
        cropList.innerHTML = `
            <div class="weather-summary">
                <h3>Growing Conditions:</h3>
                <p>Average Temperature: ${avgTemp.toFixed(1)}°C</p>
                <p>Humidity: ${humidity}%</p>
            </div>
            <h3>Recommended Food Crops:</h3>
        `;

        crops.forEach((crop, index) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${crop}</strong>: ${cropDetails[index]}`;
            cropList.appendChild(li);
        });

        const fruitSection = document.createElement("div");
        fruitSection.innerHTML = "<h3>Recommended Fruits:</h3>";
        cropList.appendChild(fruitSection);

        fruits.forEach((fruit, index) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${fruit}</strong>: ${fruitDetails[index]}`;
            cropList.appendChild(li);
        });
    }
});
