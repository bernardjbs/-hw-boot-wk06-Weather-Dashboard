let searchFormEl = document.querySelector("#search-form");
let searchHistoriesEl = document.querySelector("#search-histories");
let buttonIDarr = [];

const APIkey = "ad132697fb09c0a3d0781a7f1977e112";

searchFormEl.addEventListener('submit', handleSearchFormSubmit);

function handleSearchFormSubmit(event) {
    event.preventDefault();
    const searchCityInput = document.querySelector("#search-city-input").value;
    if (!searchCityInput) {
        console.error("you need a search input value");
        return;
    }
    searchLocation(searchCityInput)
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
    console.log(jsonWeatherData);

    // Get the coordinates from the weather data
    const lat = jsonWeatherData.coord.lat;
    const lon = jsonWeatherData.coord.lon;

    // Get json onecall data from OPENWEATHERMAP API
    const requestUrl_Onecall = `${apiUrl_OpenWeather}/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${APIkey}`;
    const response_Onecall = await fetch(requestUrl_Onecall);
    const jsonOnecallData = await response_Onecall.json();
    const dailyData = jsonOnecallData.daily;

    // console.log(jsonOnecallData);

    // Fill array of forecast objects
    for (i = 0; i < 5; i++) {
        forecastObj = {
            date: unixToDate(dailyData[i].dt),
            temperature: dailyData[i].temp.day,
            windSpeed: dailyData[i].wind_speed,
            humidity: dailyData[i].humidity,
            uv: dailyData[i].uvi
        }
        forecastArr.push(forecastObj);
    }

    // Fill and return the Weather object
    return {
        id: jsonWeatherData.id,
        city: jsonWeatherData.name,
        date: unixToDate(jsonWeatherData.dt),
        currentTemp: jsonWeatherData.main.temp,
        currentWindSpeed: jsonWeatherData.wind.speed,
        currentHumidity: jsonWeatherData.main.humidity,
        currentUV: jsonOnecallData.daily[0].uvi,
        forecast: forecastArr
    }
}

function renderWeather(Weather) {
    let searchHistoriesEl = document.querySelector("#search-histories");
    let cityButton = document.createElement("Button");
    cityButton.setAttribute("id", `${Weather.id}`);

    if (buttonIDarr.includes(Weather.city)) {
        console.log("city is found - do nothing");

    }
    else {
        console.log("city not found - add button");

        buttonIDarr.push(`${Weather.city}`);

        cityButton.textContent = Weather.city;
        searchHistoriesEl.append(cityButton)
    }
    buttonIDarr = [... new Set(buttonIDarr)];
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

