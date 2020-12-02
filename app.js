window.addEventListener("load", Load);
//! link to waether icon http://openweathermap.org/img/wn/10d@2x.png
let JsonCities;
let JsonCountries;
let sortedJsonCountries;
let units = "metric";
let lastLocation;
let temperature = document.querySelector(".temperature");
let descriptionShort = document.querySelector(".description__short");
let compass = document.querySelector(".compass");
let img = document.querySelector("img");
let wind  = document.querySelector(".wind");
let hunidity  = document.querySelector(".hunidity");
let pressure = document.querySelector(".pressure");
let visibility = document.querySelector(".visibility");
let radios = document.querySelectorAll("input[type=radio][name=unit-switch]");
let loading = document.querySelector(".loading__screen");

async function Load() {
    document.querySelector("input[value=metric]").checked = true;
    document.querySelector(".countrySearch").value = "";
    document.querySelector(".citySearch").value = "";
    let response = await fetch('https://raw.githubusercontent.com/nuranai/weather-app/master/cities.list.json');
    JsonCities = await response.json(); // loading and adding json if cities

    response = await fetch('https://raw.githubusercontent.com/nuranai/weather-app/master/countries.json');
    JsonCountries = await response.json(); // loading and adding json of countries (full info)

    response = await fetch('https://raw.githubusercontent.com/nuranai/weather-app/master/sortedJsonCountries.json');
    sortedJsonCountries = await response.json(); /* loading and adding json of countries 
                            (less info has places of start and end indexes of city json) */

    let latitude;
    let longitude;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, err);
    }

    function success(pos) { //success handler
        latitude = pos.coords.latitude; //getting latitude if geo access granted
        longitude = pos.coords.latitude; //getting longitutde if geo access granted
        lastLocation = `lat=${latitude}&lon=${longitude}`;
        getWeather(lastLocation);  
    }

    function err(error) { //error handler
        if (error.code === 2) { 
            alert(`ERROR code: ${error.code} message: ${error.message}`);
        }
        else {
            console.error(`ERROR code: ${error.code} message: ${error.message}`);
        }
    }
}


function action() {
    let inputCountries = document.querySelector(".countrySearch");
    let countryList = document.querySelector(".countries");
    inputCountries.addEventListener("input", updateCountryList); 

    let inputCities = document.querySelector(".citySearch");
    let cityList = document.querySelector(".cities");
    let iso2; //iso code for chosen country
    inputCities.addEventListener("input", updateCityList);

    let cityId;

    for (let radio of radios) {
        radio.addEventListener("change", changeUnit);
    }

    function updateCountryList(e) {
        inputCities.disabled = true; //reseting access to city

        let oldLiCountry = document.querySelectorAll(".countries"); //deleting listeners of current buttons in list
        for (let li of oldLiCountry) {
            li.removeEventListener("click", enableCityList);
        }

        let oldLiCity = document.querySelectorAll(".sendRequest"); //deleting listeners of buttons-info-senders in city list 
        if (oldLiCity > 0) { 
            for (let li of oldLiCity) {
                li.removeEventListener("click", sendWeatherRequest);
            }
        }

        countryList.innerHTML = ""; //clearing list

        cityList.innerHTML = ""; //clearing city list

        let string = e.target.value; //current string in input 

        if (string != "") {
            let regex = new RegExp(string, "i"); //creating regexp for searching
            //searching by country name or country iso code
            for (let i = 0; i < JsonCountries.length - 1; i++) {
                if ((JsonCountries[i].name.search(regex) + 1) || (JsonCountries[i].iso2.search(regex) + 1)) {
                    let newLi = document.createElement("li"); //creating and adding li to country list if matched

                    newLi.innerHTML = `<div><span class="countryName">${JsonCountries[i].name}</span>
<span class="flag">${JsonCountries[i].emoji}</span>
<span class="countryIso">${JsonCountries[i].iso2}</span></div>`;

                    countryList.append(newLi);
                    newLi.addEventListener("click", enableCityList);
                }
            }
        }
    }

    function enableCityList(e) {
        //on pressed button gives user access to ciy input
        document.querySelector(".citySearch").disabled = false;
        inputCountries.value = e.target.firstChild.textContent;
        let oldLiCountry = document.querySelectorAll(".countries"); //deleting listeners of current buttons in list
        for (let li of oldLiCountry) {
            li.removeEventListener("click", enableCityList);
        }
        inputCities.value = "";
        countryList.innerHTML = "";
        iso2 = e.target.lastChild.textContent;
    }

    function updateCityList(e) {
        cityList.innerHTML = "";//clearing list

        let string = e.target.value;//current string in input 

        let count = 0; //reseting count of elements

        let oldLiCity = document.querySelectorAll(".sendRequest"); //deleting listeners of buttons-info-senders in city list 
            for (let li of oldLiCity) {
                li.removeEventListener("click", sendWeatherRequest);
            }

        if (string != "") {
            let regex = new RegExp(string, "i");//creating regexp for searching
            //searching in sorted country begin and end indexes in city json 
            let countryIndex = sortedJsonCountries.findIndex(country => {
                if (country.iso2 === iso2) {
                    return country;
                }
            });
            //searching first 100 cities by name
            for (let i = sortedJsonCountries[countryIndex].place.cityIndexStart; i < sortedJsonCountries[countryIndex].place.cityIndexEnd && count < 100; i++) {
                if (JsonCities[i].name.search(regex) + 1) {
                    let newLi = document.createElement("li");

                    newLi.innerHTML = `<span class="cityName" id="${JsonCities[i].id}">${JsonCities[i].name}</span>`;
                    
                    cityList.append(newLi);
                    newLi.addEventListener("click", sendWeatherRequest);
                    count++;
                }
            }
        }
    }

    function sendWeatherRequest(e) { //sending weather request by sity id of the chosen city
        inputCities.value = e.target.textContent;
        buttonsSend = document.querySelectorAll(".sendRequest");//deleting listeners of current buttons in list
        for (let button of buttonsSend) {
            button.removeEventListener("click", sendWeatherRequest);
        }
        cityList.innerHTML = "";
        cityId = e.target.firstChild.id;
        lastLocation = `id=${cityId}`;
        getWeather(lastLocation);
    }

    function changeUnit() {
        if (this.value === 'metric') {
            units = 'metric';
        }
        else {
            units = 'imperial';
        }
        if (lastLocation) {
            getWeather(lastLocation);
        }
    }
}

async function getWeather(location) {
    loading.style.display = "block";
    let speedUnits, temperatureUnits;
    if (units === "metric") {
        speedUnits = "m/s";
        temperatureUnits = "C";
    }
    else {
        speedUnits = "mi/h";
        temperatureUnits = "F";
    }
    let response = await fetch( //sending data by geocoords or city indexes
        `https://api.openweathermap.org/data/2.5/weather?${location}&units=${units}&appid=74e2b52ca60d76d9d3d425e076501261`
    );
    let weather = await response.json(); 
    descriptionShort.textContent = `Feels like ${Math.round(weather.main.feels_like)}, ${weather.weather[0].description}`;
    img.src = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
    temperature.textContent = `${Math.round(weather.main.temp)}°${temperatureUnits}`;
    compass.style.transform = `rotate(${weather.wind.deg + 148}deg)`;
    wind.textContent = `${weather.wind.speed}${speedUnits}`;
    hunidity.textContent = `Humidity: ${weather.main.humidity}%`;
    pressure.textContent = `Pressure: ${weather.main.pressure}hPa`;
    visibility.textContent = `Visibility: ${weather.visibility / 1000}km`;
    loading.style.display = "none";
}


action();