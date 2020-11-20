window.addEventListener("load", Load);
//! link to waether icon http://openweathermap.org/img/wn/10d@2x.png
let JsonCities;
let JsonCountries;
let sortedJsonCountries;

async function Load() {
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
        latitude = Math.round(pos.coords.latitude * 100) / 100; //getting latitude if geo access granted
        longitude = Math.round(pos.coords.longitude * 100) / 100; //getting longitutde if geo access granted
        getWeather(`lat=${latitude}&lon=${longitude}`);  
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
    let buttonsToCity; //buttons that granting access to city indexes
    inputCountries.addEventListener("input", updateCountryList); 

    let inputCities = document.querySelector(".citySearch");
    let cityList = document.querySelector(".cities");
    let buttonsSend; //buttons that send info to openweather site
    let iso2; //iso code for chosen country
    inputCities.addEventListener("input", updateCityList);

    let cityId;

    function updateCountryList(e) {
        inputCities.disabled = true; //reseting access to city

        buttonsToCity = document.querySelectorAll(".toCity"); //deleting listeners of current buttons in list
        for (let button of buttonsToCity) {
            button.removeEventListener("click", enableCityList);
        }

        countryList.innerHTML = ""; //clearing list

        buttonsSend = document.querySelectorAll(".sendRequest"); //deleting listeners of buttons-info-senders in city list 
        if (buttonsSend.length > 0) { 
            for (let button of buttonsSend) {
                button.removeEventListener("click", sendWeatherRequest);
            }
        }

        cityList.innerHTML = ""; //clearing city list

        let string = e.target.value; //current string in input 

        if (string != "") {
            let regex = new RegExp(string, "i"); //creating regexp for searching
            //searching by country name or country iso code
            for (let i = 0; i < JsonCountries.length - 1; i++) {
                if ((JsonCountries[i].name.search(regex) + 1) || (JsonCountries[i].iso2.search(regex) + 1)) {
                    let newLi = document.createElement("li"); //creating and adding li to country list if matched

                    newLi.innerHTML = `<span class="countryName">${JsonCountries[i].name}</span>
                                    <span class="flag">${JsonCountries[i].emoji}</span>
                                    <span class="countryIso">${JsonCountries[i].iso2}</span><button class="toCity">=></button>`;

                    countryList.append(newLi);
                }
            }
            //adding listeners to created buttons
            buttonsToCity = document.querySelectorAll(".toCity");
            for (let button of buttonsToCity) {
                button.addEventListener("click", enableCityList);
            }
        }
    }

    function enableCityList(e) {
        //on pressed button gives user access to ciy input
        document.querySelector(".citySearch").disabled = false;
        inputCountries.value = e.target.parentNode.firstChild.textContent;
        inputCities.value = "";
        countryList.innerHTML = "";
        iso2 = e.target.previousSibling.textContent;
    }

    function updateCityList(e) {
        cityList.innerHTML = "";//clearing list

        let string = e.target.value;//current string in input 

        let count = 0; //reseting count of elements

        buttonsSend = document.querySelectorAll(".sendRequest");//deleting listeners of current buttons in list
        for (let button of buttonsSend) {
            button.removeEventListener("click", sendWeatherRequest);
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

                    newLi.innerHTML = `<span class="cityName" id="${JsonCities[i].id}">${JsonCities[i].name}</span>
                                    <button class="sendRequest">=></button>`;

                    cityList.append(newLi);
                    count++;
                }
            }
                        //adding listeners to created buttons
            buttonsSend = document.querySelectorAll(".sendRequest");
            for (let button of buttonsSend) {
                button.addEventListener("click", sendWeatherRequest);
            }
        }
    }

    function sendWeatherRequest(e) { //sending weather request by sity id of the chosen city
        cityId = e.target.previousElementSibling.id;
        getWeather(`id=${cityId}`);
    }
}

async function getWeather(location) {
    let response = await fetch( //sending data by geocoords or city indexes
        `https://api.openweathermap.org/data/2.5/weather?${location}&units=metric&appid=74e2b52ca60d76d9d3d425e076501261`
    );
    let weather = await response.json(); 
    console.log(weather); //currently logging to console
}


action();