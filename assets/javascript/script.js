let searchFormEl = document.querySelector("#search-form");

function handleSearchFormSubmit(event) {
    event.preventDefault();

    let searchCityInput = document.querySelector("#search-city-input").value;
    const APIkey = "ad132697fb09c0a3d0781a7f1977e112";

    if(!searchCityInput) {
        console.error("you need a search input value");
        return;
    }

    let queryString = "/search-results.html?q=" + searchCityInput + "?APIID=" +APIkey;
    console.log("query string: " + queryString);
}

searchFormEl.addEventListener('submit', handleSearchFormSubmit);

