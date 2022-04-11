// Constants and Variables
const searchFormEl = document.querySelector("#search-form");
const searchHistoriesEl = document.querySelector("#search-histories");
const searchCityInput = document.querySelector("#search-city-input");
const currentWeatherEl = document.querySelector("#current-weather");
const forecastEl = document.querySelector("#forecast");
const weatherImgEl = document.querySelector("#weather-image");
const searchButtonEl = document.querySelector("#search-button");
const h1El = document.querySelector("h1");
const resetButtonEl = document.querySelector("#reset-button");

const iconUrl = "https://openweathermap.org/img/wn";
const APIkey = "ad132697fb09c0a3d0781a7f1977e112";
let cityArr = [];
let defaultCity = "";

// Event listener for reset button click
resetButtonEl.addEventListener("click", () =>  {
    resetWeather()
})

// Event listener for city button click
searchHistoriesEl.addEventListener("click", (event) => {
    const isButton = event.target.nodeName === "BUTTON";
    if (!isButton) {
        return;
    }
    searchLocation(event.target.id)
        .then(Weather => {
            renderWeather(Weather);
            renderCurrentWeather(Weather);
            renderForecast(Weather);
            checkDayOrNight(Weather, "");
        });
})

// Function to check local storage for cities
const localStorage_CheckCities = () => {
    if (JSON.parse(localStorage.getItem("cities"))) {

        cityArr = JSON.parse(localStorage.getItem("cities"));
        defaultCity = cityArr[0];
        searchLocation(defaultCity)
            .then(Weather => {
                renderCurrentWeather(Weather);
                renderForecast(Weather);
                renderCityButtons(Weather, cityArr);
                checkDayOrNight(Weather, currentWeatherEl);
                checkDayOrNight(Weather, "");
                checkDayOrNight(Weather, searchButtonEl)
            });
        defaultCity = "";
        resetButtonEl.classList.remove("hidden");
    }
}

// Function to handle city input search form submit
const handleSearchFormSubmit = (event) => {
    event.preventDefault();

    if (!searchCityInput.value) {
        window.alert("you need a search input value");
        return;
    }
    searchLocation(searchCityInput.value)
        .then(Weather => {
            renderWeather(Weather);
        });
}

// Asynchronous function to handle API fetch requests and data
async function searchLocation(query) {
    const apiUrl_OpenWeather = "https://api.openweathermap.org/data/2.5";
    const forecastArr = [];
    let forecastObj = {};
    let lat = "";
    let lon = "";
    let jsonWeatherData = "";
    // Get json weather data from OPENWEATHERMAP API
    const requestUrl_Weather = `${apiUrl_OpenWeather}/weather?q=${query}&appid=${APIkey}&units=metric`;
    const response_Weather = await fetch(requestUrl_Weather);
    if (response_Weather.status !== 200) {
        window.alert(`Error! "${query}" cannot be found. Please enter a valid city`);
    }
    else {
        jsonWeatherData = await response_Weather.json();
        // Get the coordinates from the weather data
        lat = jsonWeatherData.coord.lat;
        lon = jsonWeatherData.coord.lon;
    }



    // Get json onecall data from OPENWEATHERMAP API
    const requestUrl_Onecall = `${apiUrl_OpenWeather}/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${APIkey}`;
    const response_Onecall = await fetch(requestUrl_Onecall);
    const jsonOnecallData = await response_Onecall.json();

    const currentData = jsonOnecallData.current;
    const dailyData = jsonOnecallData.daily;

    console.log(jsonOnecallData);
    // Fill array of forecast objects
    for (i = 0; i < 5; i++) {
        forecastObj = {
            date: unixToDate(dailyData[i].dt),
            temperature: `${Math.round(dailyData[i].temp.day)}\u00B0C`,
            windSpeed: `${dailyData[i].wind_speed} mt/s`,
            humidity: `${dailyData[i].humidity}%`,
            uv: dailyData[i].uvi,
            icon: dailyData[i].weather[0].icon
        }
        forecastArr.push(forecastObj);
    }

    // Fill and return the Weather object
    return {
        city: jsonWeatherData.name,
        defaultCity: defaultCity,
        unixDate: currentData.dt,
        date: unixToDate(currentData.dt),
        sunrise: currentData.sunrise,
        sunset: currentData.sunset,
        currentTemp: `${Math.round(currentData.temp)}\u00B0C`,
        currentWindSpeed: `${currentData.wind_speed} mt/s`,
        currentHumidity: `${currentData.humidity}%`,
        currentUV: currentData.uvi,
        currentIcon: currentData.weather[0].icon,
        forecast: forecastArr,
        timezone: jsonOnecallData.timezone
    }
}

// Function to render the current weather and forecast for the next five days
const renderWeather = (Weather) => {
    currentWeatherEl.innerHTML = "";
    forecastEl.innerHTML = "";
    if (cityArr.includes(Weather.city) && Weather.defaultCity != "") {
        return;
    }
    else {
        cityArr.push(`${Weather.city}`);

    }
    searchCityInput.value = "";
    cityArr = [... new Set(cityArr)];
    // Save cityArr to localstorage
    localStorage.setItem("cities", JSON.stringify(cityArr));
    renderCityButtons(Weather, cityArr);
    renderCurrentWeather(Weather);
    renderForecast(Weather);
}

// Function to convert unix timestamp to date format
const unixToDate = (unix) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "DecC"];
    const milliSecs = new Date(unix * 1000);
    let day = milliSecs.getDate();
    let month = months[milliSecs.getMonth()];
    const year = milliSecs.getFullYear();
    if (day < 10) day = `0${day}`;
    if (month < 10) month = `0${month}`;
    const dateFormat = `${day} ${month} ${year}`;
    return dateFormat;
}

// Function to render the current weather
const renderCurrentWeather = (Weather) => {

    while (currentWeatherEl.firstChild) {
        currentWeatherEl.removeChild(currentWeatherEl.firstChild);
    }
    const cwH2 = document.createElement("h2");
    const cwIcon = document.createElement("img");
    const cwUl = document.createElement("ul");
    const cwTimezone = document.createElement("li");
    const cwLiTemp = document.createElement("li");
    const cwLiWind = document.createElement("li");
    const cwLiHumidity = document.createElement("li");
    const cwLiUVindex = document.createElement("li");

    // Set the text for current weather H2 and H3 element
    cwH2.textContent = `${Weather.city} - ${Weather.date}`;

    // Set the icon to the current weather image element
    cwIcon.src = `${iconUrl}/${Weather.currentIcon}@2x.png`

    cwH2.append(cwIcon);

    // Create text nodes for the li elements
    cwTimezone.appendChild(document.createTextNode(`Timezone: ${Weather.timezone}`));
    cwLiTemp.appendChild(document.createTextNode(`Temperature: ${Weather.currentTemp}`));
    cwLiWind.appendChild(document.createTextNode(`Wind: ${Weather.currentWindSpeed}`));
    cwLiHumidity.appendChild(document.createTextNode(`Humidity: ${Weather.currentHumidity}`));
    cwLiUVindex.appendChild(document.createTextNode(`UV Index: ${Weather.currentUV}`));

    // Append the li elements to the current weather ul
    cwUl.appendChild(cwTimezone);
    cwUl.appendChild(cwLiTemp);
    cwUl.appendChild(cwLiWind);
    cwUl.appendChild(cwLiHumidity);
    cwUl.appendChild(cwLiUVindex);

    // Append the the ul element to the current weather section
    currentWeatherEl.append(cwH2);
    currentWeatherEl.append(cwUl);

    checkDayOrNight(Weather, cwH2);
    checkDayOrNight(Weather, cwUl);
}

// Function to render the forecast weather
const renderForecast = (Weather) => {
    while (forecastEl.firstChild) {
        forecastEl.removeChild(forecastEl.firstChild);
    }
    const forecastH3el = document.createElement("h3");
    forecastH3el.setAttribute("id", "forecast-h3");
    forecastH3el.textContent = `5 Days forecast for ${Weather.city}`


    const cardsSectionEl = document.createElement("section");
    cardsSectionEl.setAttribute("id", "cards");
    forecastEl.append(forecastH3el);
    forecastEl.append(cardsSectionEl);

    const forecastArr = Weather.forecast;
    for (i = 0; i < forecastArr.length; i++) {

        // Create new elements for the forecast section
        const weatherCardEl = document.createElement("section");
        const dailyForecastEl = document.createElement("section");
        let datePel = document.createElement("p");
        const iconPel = document.createElement("img");
        const fcUl = document.createElement("ul");
        const fcLiTemp = document.createElement("li");
        const fcLiWind = document.createElement("li");
        const fcLiHumidity = document.createElement("li");
        const fcLiUVindex = document.createElement("li");

        // Setting IDs and Classes to new elements
        weatherCardEl.setAttribute("class", "WeatherCard");
        dailyForecastEl.setAttribute("class", "daily-forecast");

        // Fill the elements with data
        datePel = forecastArr[i].date;
        iconPel.src = `${iconUrl}/${forecastArr[i].icon}@2x.png`;

        // Create text nodes for the li elements
        fcLiTemp.appendChild(document.createTextNode(`Temperature: ${forecastArr[i].temperature}`));
        fcLiWind.appendChild(document.createTextNode(`Wind: ${forecastArr[i].windSpeed}`));
        fcLiHumidity.appendChild(document.createTextNode(`Humidity: ${forecastArr[i].humidity}`));
        fcLiUVindex.appendChild(document.createTextNode(`UV Index: ${forecastArr[i].uv}`));

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
        weatherCardEl.append(dailyForecastEl);

        // Append cards section to to forecast section
        // forecastEl.appendChild(cardsEl);
        cardsSectionEl.append(weatherCardEl);

        checkDayOrNight(Weather, dailyForecastEl);
    }

}
// Function to render city buttons
const renderCityButtons = (Weather, cityArr) => {
    while (searchHistoriesEl.firstChild) {
        searchHistoriesEl.removeChild(searchHistoriesEl.firstChild);
    }
    if (cityArr.length > 0) {
        resetButtonEl.classList.remove("hidden");
    }
    cityArr.forEach(city => {
        const cityButton = document.createElement("Button");
        cityButton.setAttribute("class", "btn btn-primary city-button")
        cityButton.setAttribute("id", city);
        cityButton.textContent = city;
        searchHistoriesEl.append(cityButton)
        checkDayOrNight(Weather, cityButton)
    });
}

// Function to check if current time is daytime or night time based on sunrise and sunset
const checkDayOrNight = (Weather, element) => {
    let cityCurrentDate = Weather.unixDate;

    const sunrise = Weather.sunrise;
    const sunset = Weather.sunset;

    console.log("now: " + cityCurrentDate);
    console.log("sunrise: " + sunrise);
    console.log("sunset: " + sunset);

    if (element != "") {
        if (sunrise < cityCurrentDate && cityCurrentDate < sunset) {
            if (element.tagName === "BUTTON") {
                element.classList.add("day-button");
            }
            else {
                element.classList.add("day");
            }
            weatherImgEl.src = "./assets/images/weather_day.jpg";
            h1El.classList.add("h1Day");
            h1El.classList.remove("h1Night");
        }
        else {
            if (element.tagName === "BUTTON") {
                element.classList.add("night-button");
            }
            else {
                element.classList.add("night");
            }
            weatherImgEl.src = "./assets/images/weather_night.png";
            h1El.classList.add("h1Night");
            h1El.classList.remove("h1Day");
        }
    }
}

// const listenReset = () => {
//     if (window.getComputedStyle(resetButtonEl).display != "none") {
//         resetButtonEl.addEventListener("click", resetWeather())
//     }
// }

const resetWeather = (event) => {
    location.reload()
    localStorage.removeItem("cities");
    console.log("i am here");
}
// Main Functions
localStorage_CheckCities();
searchFormEl.addEventListener("submit", handleSearchFormSubmit);

// 
