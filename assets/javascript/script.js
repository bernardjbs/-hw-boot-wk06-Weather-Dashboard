let searchFormEl = document.querySelector("#search-form");
let searchHistoriesEl = document.querySelector("#search-histories");

const APIkey = "ad132697fb09c0a3d0781a7f1977e112";

searchFormEl.addEventListener('submit', handleSearchFormSubmit);

function handleSearchFormSubmit(event) {
    event.preventDefault();
    let searchCityInput = document.querySelector("#search-city-input").value;
    if (!searchCityInput) {
        console.error("you need a search input value");
        return;
    }
    searchLocation(searchCityInput)
    .then(Weather => {
        console.log(Weather);
    });
}

async function searchLocation(query) {
    const apiUrl_OpenWeather = "http://api.openweathermap.org/data/2.5";
    // Get json weather data from OPENWEATHERMAP API
    const requestUrl_Weather = `${apiUrl_OpenWeather}/weather?q=${query}&appid=${APIkey}&units=metric`;
    const response_Weather = await fetch(requestUrl_Weather);
    const jsonWeatherData = await response_Weather.json();
    // console.log(jsonWeatherData);
    // Get the coordinates from the weather data
    const lat = jsonWeatherData.coord.lat;
    const lon = jsonWeatherData.coord.lon;
    // Get json onecall data from OPENWEATHERMAP API
    const requestUrl_Onecall = `${apiUrl_OpenWeather}/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${APIkey}`;
    const response_Onecall = await fetch(requestUrl_Onecall);
    const jsonOnecallData = await response_Onecall.json();
    const dailyData = jsonOnecallData.daily;
    const forecastArr =[];
    let forecastObj ={};
    for(i=0; i<5; i++) {
        // console.log("temperature: " + JSON.stringify(dailyData[i].temp.day));
        forecastObj = {
            date: unixToDate(dailyData[i].dt),
            temperature: dailyData[i].temp.day, 
            windSpeed: dailyData[i].wind_speed,
            humidity: dailyData[i].humidity, 
            uv: dailyData[i].uvi
        }
        forecastArr.push(forecastObj);
    }

    return {
        city: jsonWeatherData.name,
        date: unixToDate(jsonWeatherData.dt),
        currentTemp: jsonWeatherData.main.temp,
        currentWindSpeed: jsonWeatherData.wind.speed,
        currentHumidity: jsonWeatherData.main.humidity,
        currentUV: jsonOnecallData.daily[0].uvi,
        forecast: forecastArr
    }
}

// Function to convert unix timestamp to date format
function unixToDate(unix) {
    const unixDate = unix;
    const milliSecs = new Date(unixDate * 1000);
    const day =  milliSecs.getDate();
    const month = milliSecs.getMonth()+1;
    const year = milliSecs.getFullYear();
    const dateFormat = `${day}/${month}/${year}`;
    return dateFormat;
  }

