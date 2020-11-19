window.addEventListener("load", Load);

let JsonCities;
let JsonCountries;
let sortedJsonCountries;

async function Load() {
    let response = await fetch('https://raw.githubusercontent.com/nuranai/weather-app/master/cities.list.json');
    JsonCities = await response.json();

    response = await fetch('https://raw.githubusercontent.com/nuranai/weather-app/master/countries.json');
    JsonCountries = await response.json();

    response = await fetch('https://raw.githubusercontent.com/nuranai/weather-app/master/sortedJsonCountries.json');
    sortedJsonCountries = await response.json();

    let latitude;
    let longitude;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, err);
    }

    function success(pos) {
        latitude = Math.round(pos.coords.latitude * 100) / 100;
        longitude = Math.round(pos.coords.longitude * 100) / 100;
        getWeather(`lat=${latitude}&lon=${longitude}`);
    }

    function err(error) {
        if (error.code === 2) {
            alert(`ERROR code: ${error.code} message: ${error.message}`);
        }
        else {
            console.error(`ERROR code: ${error.code} message: ${error.message}`);
        }
    }
}


async function getWeather(location) {
    let response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?${location}&appid=74e2b52ca60d76d9d3d425e076501261`
    );
    let weather = await response.json();
    console.log(weather);
}


function action() {
    let inputCountries = document.querySelector(".countrySearch");
    let countryList = document.querySelector(".countries");
    let buttonsToCity;
    inputCountries.addEventListener("input", updateCountryList);


    let inputCities = document.querySelector(".citySearch");
    let cityList = document.querySelector(".cities");
    let buttonsSend;
    let iso2;
    inputCities.addEventListener("input", updateCityList);

    let cityId;

    function updateCountryList(e) {
        inputCities.disabled = true;

        buttonsToCity = document.querySelectorAll(".toCity");
        for (let button of buttonsToCity) {
            button.removeEventListener("click", enableCityList);
        }

        countryList.innerHTML = "";

        buttonsSend = document.querySelectorAll(".sendRequest");
        if (buttonsSend.length > 0) {
            for (let button of buttonsSend) {
                button.removeEventListener("click", sendWeatherRequest);
            }
        }

        cityList.innerHTML = ""

        let string = e.target.value;

        if (string != "") {
            let regex = new RegExp(string, "i");
            for (let i = 0; i < JsonCountries.length - 1; i++) {
                if ((JsonCountries[i].name.search(regex) + 1) || (JsonCountries[i].iso2.search(regex) + 1)) {
                    let newLi = document.createElement("li");

                    newLi.innerHTML = `<span class="countryName">${JsonCountries[i].name}</span>
                                    <span class="flag">${JsonCountries[i].emoji}</span>
                                    <span class="countryIso">${JsonCountries[i].iso2}</span><button class="toCity">=></button>`;

                    countryList.append(newLi);
                }
                buttonsToCity = document.querySelectorAll(".toCity");
                for (let button of buttonsToCity) {
                    button.addEventListener("click", enableCityList);
                }

            }
        }
    }

    function enableCityList(e) {
        document.querySelector(".citySearch").disabled = false;
        inputCountries.value = e.target.parentNode.firstChild.textContent;
        inputCities.value = "";
        countryList.innerHTML = "";
        iso2 = e.target.previousSibling.textContent;
        console.log(iso2);
    }

    function updateCityList(e) {
        cityList.innerHTML = "";

        let string = e.target.value;

        let count = 0;

        buttonsSend = document.querySelectorAll(".sendRequest");
        for (let button of buttonsSend) {
            button.removeEventListener("click", sendWeatherRequest);
        }

        if (string != "") {
            let regex = new RegExp(string, "i");
            let countryIndex = sortedJsonCountries.findIndex(country => {
                if (country.iso2 === iso2) {
                    return country;
                }
            });

            for (let i = sortedJsonCountries[countryIndex].place.cityIndexStart; i < sortedJsonCountries[countryIndex].place.cityIndexEnd && count < 100; i++) {
                if (JsonCities[i].name.search(regex) + 1) {
                    let newLi = document.createElement("li");

                    newLi.innerHTML = `<span class="cityName" id="${JsonCities[i].id}">${JsonCities[i].name}</span>
                                    <button class="sendRequest">=></button>`;

                    cityList.append(newLi);
                    count++;
                }
            }
            buttonsSend = document.querySelectorAll(".sendRequest");
            for (let button of buttonsSend) {
                button.addEventListener("click", sendWeatherRequest);
            }
            // for (let i = 0; i < JsonCities.length - 1; i++) {
            //     if (JsonCities[i].country === iso2) {
            //         if (JsonCities[i].name.search(regex) + 1) {
            // let newLi = document.createElement("li");

            // newLi.innerHTML = `<span class="cityName" id="${JsonCities[i].id}">${JsonCities[i].name}</span>
            //                 <button class="sendRequest">=></button>`;

            // cityList.append(newLi);
            //         }
            // buttonsSend = document.querySelectorAll(".sendRequest");
            // for (let button of buttonsSend) {
            //     button.addEventListener("click", sendWeatherRequest);
            // }
            //     }

            // }
        }
    }

    function sendWeatherRequest(e) {
        cityId = e.target.previousElementSibling.id;
        getWeather(`id=${cityId}`);
    }
}

action();