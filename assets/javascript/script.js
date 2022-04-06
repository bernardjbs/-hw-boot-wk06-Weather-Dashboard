const searchFormEl = document.querySelector("#search-form");
const searchHistoriesEl = document.querySelector("#search-histories");
const searchCityInput = document.querySelector("#search-city-input");
const currentWeatherEl = document.querySelector("#current-weather");
const forecastEl = document.querySelector("#forecast");
const iconUrl = "https://openweathermap.org/img/wn";

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
    currentWeatherEl.innerHTML = "";
    forecastEl.innerHTML = "";
    const cityButton = document.createElement("Button");
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

    renderCurrentWeather(Weather);
    renderForecast(Weather);

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

// Function to render the current weather
    const renderCurrentWeather = (Weather) => {
    const cwH2 = document.createElement("h2");
    const cwIcon = document.createElement("img");
    const cwUl = document.createElement("ul");
    const cwLiTemp = document.createElement("li");
    const cwLiWind = document.createElement("li"); 
    const cwLiHumidity = document.createElement("li"); 
    const cwLiUVindex = document.createElement("li"); 

    // Set the text for current weather H2 element
    cwH2.textContent = `${Weather.city} - ${Weather.date}`;

    // Set the icon to the current weather image element
    cwIcon.src = `${iconUrl}/${Weather.currentIcon}@2x.png`

    cwH2.append(cwIcon);

    // Create text nodes for the li elements
    cwLiTemp.appendChild(document.createTextNode(`Temperature: ${Weather.currentTemp}`));
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
}

// Function to render the forecast weather
    const renderForecast = (Weather) => {
    const forecastArr = Weather.forecast;
    for(i=0; i<forecastArr.length; i++) {

    // Create new elements for the forecast section
    const cardsEl = document.createElement("section");
    const dailyForecastEl = document.createElement("section");    
    let datePel = document.createElement("p");
    const iconPel = document.createElement("img");
    const fcUl = document.createElement("ul"); 
    const fcLiTemp = document.createElement("li"); 
    const fcLiWind = document.createElement("li"); 
    const fcLiHumidity = document.createElement("li"); 
    const fcLiUVindex = document.createElement("li"); 

    // Setting IDs and Classes to new elements
    cardsEl.setAttribute("id", "cards");
    dailyForecastEl.setAttribute("class", "daily-forecast");

    // Fill the Date and Icon data
     datePel = forecastArr[i].date;
     iconPel.src = `${iconUrl}/${forecastArr[i].icon}@2x.png` ;

    // Create text nodes for the li elements
    fcLiTemp.appendChild(document.createTextNode(`Temperature: ${forecastArr[i].temperature}`));
    fcLiWind.appendChild(document.createTextNode(`Wind: ${forecastArr[i].windSpeed}`));
    fcLiHumidity.appendChild(document.createTextNode(`Humidity: ${forecastArr[i].umidity}`));
    fcLiUVindex.appendChild(document.createTextNode(`UV Index: ${forecastArr[i].uvi}`));

    // Append the li elements to the current weather ul
    fcUl.appendChild(fcLiTemp);
    fcUl.appendChild(fcLiWind);
    fcUl.appendChild(fcLiHumidity);
    fcUl.appendChild(fcLiUVindex);

    // Append Weather data elements to daily-forcast section
    dailyForecastEl.append(datePel);
    dailyForecastEl.append(iconPel);
    dailyForecastEl.append(fcUl);

    // Append daily forecast section to cards section
    cardsEl.append(dailyForecastEl);

    // Append cards section to to forecast section
    forecastEl.appendChild(cardsEl);
    }

}
// TODO: Local storage for city buttons