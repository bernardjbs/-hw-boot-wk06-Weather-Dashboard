const searchFormEl = document.querySelector("#search-form");
const searchHistoriesEl = document.querySelector("#search-histories");
const searchCityInput = document.querySelector("#search-city-input");
const currentWeatherEl = document.querySelector("#current-weather");
const forecastEl = document.querySelector("#forecast");

const APIkey = "ad132697fb09c0a3d0781a7f1977e112";
let cityArr = [];

searchFormEl.addEventListener('submit', handleSearchFormSubmit);

function handleSearchFormSubmit(event) {
    event.preventDefault();

    if (!searchCityInput.value) {
        console.error("you need a search input value");
        return;
    }
    searchLocation(searchCityInput.value)
        .then(Weather => {
            renderWeather(Weather);
        });
}

async function searchLocation(query) {
    const apiUrl_OpenWeather = "http://api.openweathermap.org/data/2.5";
    const forecastArr = [];
    let forecastObj = {};

    // Get json weather data from OPENWEATHERMAP API
    const requestUrl_Weather = `${apiUrl_OpenWeather}/weather?q=${query}&appid=${APIkey}&units=metric`;
    const response_Weather = await fetch(requestUrl_Weather);
    const jsonWeatherData = await response_Weather.json();

    // Get the coordinates from the weather data
    const lat = jsonWeatherData.coord.lat;
    const lon = jsonWeatherData.coord.lon;

    // Get json onecall data from OPENWEATHERMAP API
    const requestUrl_Onecall = `${apiUrl_OpenWeather}/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${APIkey}`;
    const response_Onecall = await fetch(requestUrl_Onecall);
    const jsonOnecallData = await response_Onecall.json();

    const currentData = jsonOnecallData.current;
    const dailyData = jsonOnecallData.daily;

    // Fill array of forecast objects
    for (i = 0; i < 5; i++) {
        forecastObj = {
            date: unixToDate(dailyData[i].dt),
            temperature: dailyData[i].temp.day,
            windSpeed: dailyData[i].wind_speed,
            humidity: dailyData[i].humidity,
            uv: dailyData[i].uvi,
            icon: dailyData[i].weather[0].icon
        }
        forecastArr.push(forecastObj);
    }

    // Fill and return the Weather object
    return {
        // id: jsonWeatherData.id,
        city: jsonWeatherData.name,
        date: unixToDate(currentData.dt),
        currentTemp: currentData.temp,
        currentWindSpeed: currentData.wind_speed,
        currentHumidity: currentData.humidity,
        currentUV: currentData.uvi,
        currentIcon: currentData.weather[0].icon,
        forecast: forecastArr
    }
}

function renderWeather(Weather) {
    console.log(Weather);
    const iconUrl = "https://openweathermap.org/img/wn";

    const cityButton = document.createElement("Button");
    // cityButton.setAttribute("id", `${Weather.id}`);
    if (cityArr.includes(Weather.city)) {
        return;
    }
    else {
        cityArr.push(`${Weather.city}`);
        cityButton.textContent = Weather.city;
        searchHistoriesEl.append(cityButton)
    }
    cityArr = [... new Set(cityArr)];
    searchCityInput.value = "";

    //Render weather for the current city in the #current-weather section
    let cwH2 = document.createElement("h2")
    let cwIcon = document.createElement("img");
    let cwUl = document.createElement("ul"); //Create ul for current weather
    let cwLiTemp = document.createElement("li"); // Create li for current weather temperature
    let cwLiWind = document.createElement("li"); // Create li for current weather wind speed
    let cwLiHumidity = document.createElement("li"); // Create li for current weather humidity
    let cwLiUVindex = document.createElement("li"); // Create li for current weather UV index

    // Set the text for current weather H2 element
    cwH2.textContent = `${Weather.city} - ${Weather.date}`;

    // Set the icon to the current weather image element
    cwIcon.src = `${iconUrl}/${Weather.currentIcon}@2x.png`

    cwH2.append(cwIcon);

    // Create text nodes for the li elements
    cwLiTemp.appendChild(document.createTextNode(`Temperature: ${Weather.currentTemp}` ));
    cwLiWind.appendChild(document.createTextNode(`Wind: ${Weather.currentWindSpeed}`));
    cwLiHumidity.appendChild(document.createTextNode(`Humidity: ${Weather.currentHumidity}`));
    cwLiUVindex.appendChild(document.createTextNode(`UV Index: ${Weather.currentUV}`));

    // Append the li elements to the current weather ul
    cwUl.appendChild(cwLiTemp);
    cwUl.appendChild(cwLiWind);
    cwUl.appendChild(cwLiHumidity);
    cwUl.appendChild(cwLiUVindex);
    
    // Append the the ul element to the current weather section
    currentWeatherEl.append(cwH2);
    currentWeatherEl.append(cwUl);

    //Render the forecast for the current city in the #forecast section
}

// Function to convert unix timestamp to date format
function unixToDate(unix) {
    const unixDate = unix;
    const milliSecs = new Date(unixDate * 1000);
    const day = milliSecs.getDate();
    const month = milliSecs.getMonth() + 1;
    const year = milliSecs.getFullYear();
    const dateFormat = `${day}/${month}/${year}`;
    return dateFormat;
}

