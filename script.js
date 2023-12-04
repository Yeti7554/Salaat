let userCity = "";
let userCityUpper = "";
let userCountry;
let userCityFormatted;
let userCountryFormatted;
const myCityDiv = document.querySelector(".my-city");
const calcMethod = document.querySelector(".calc-text");

function formatTime(timeString) {
    const [hourString, minute] = timeString.split(":");
    const hour = +hourString % 24;
    return (hour % 12 || 12) + ":" + minute + (hour < 12 ? " AM" : " PM");
}

async function getPrayerTimes() {
    const currentDate = new Date().toDateString();
    const cacheKey = `${currentDate}-${selectedValue}`;
    const cachedPrayerTimes = localStorage.getItem(cacheKey);

    if (cachedPrayerTimes) {
        populatePrayerTimes(JSON.parse(cachedPrayerTimes));
    }

    const url = `https://api.aladhan.com/v1/timingsByCity?city=${userCityFormatted}&country=${userCountryFormatted}&method=${selectedValue}`;
    const response = await fetch(url);
    const data = await response.json();
    const timings = data.data.timings;
    populatePrayerTimes(timings);
    localStorage.setItem(cacheKey, JSON.stringify(timings));
}

function populatePrayerTimes(timings) {
    const fajr = formatTime(timings.Fajr);
    const dhuhr = formatTime(timings.Dhuhr);
    const sunrise = formatTime(timings.Sunrise);
    const asr = formatTime(timings.Asr);
    const maghrib = formatTime(timings.Maghrib);
    const isha = formatTime(timings.Isha);
    const prayerTimes = [fajr, sunrise, dhuhr, asr, maghrib, isha];
    const prayerTimeElements = document.querySelectorAll('table tr:not(:first-child) td:last-child');
    prayerTimeElements.forEach((element, index) => {
        element.textContent = prayerTimes[index];
    });
}

async function getUserLocation() {
    const cachedLocation = getCachedUserLocation();
    if (cachedLocation) {
        processUserLocation(cachedLocation);
    }

    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    const { latitude, longitude } = position.coords;
    const response = await fetch(`https://geocode.xyz/${latitude},${longitude}?json=1`);
    const data = await response.json();
    const { city, country } = data;
    cacheUserLocation(city, country);
    processUserLocation({ city, country });
}

function cacheUserLocation(city, country) {
    localStorage.setItem('userCity', city);
    localStorage.setItem('userCountry', country);
}

function getCachedUserLocation() {
    const city = localStorage.getItem('userCity');
    const country = localStorage.getItem('userCountry');

    if (city && country) {
        return { city, country };
    }
    return null;
}

function processUserLocation({ city, country }) {
    userCity = city;
    userCountry = country;
    userCityUpper = userCity.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    userCountryUpper = userCountry.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    userCityFormatted = userCityUpper.replace(/ /g, '%20');
    userCountryFormatted = userCountryUpper.replace(/ /g, '%20');
    myCityDiv.textContent = `${userCityUpper}, ${userCountryUpper}`;
    setupSelectBox();
    getPrayerTimes();
}

function setupSelectBox() {
  var selectBox = document.getElementById("selectBox");

  if (selectBox) { // Check if selectBox exists
      selectBox.options[0].text = "Choose here";
      selectBox.options[0].style.textAlign = "center"; 
      selectBox.addEventListener("change", function() {
          var selectedValue = selectBox.value;
          var selectedMethod = selectBox.options[selectBox.selectedIndex].text;
          localStorage.setItem("selectedValue", selectedValue);
          localStorage.setItem("selectedMethod", selectedMethod);
          window.selectedValue = selectedValue;
          window.selectedMethod = selectedMethod;
      });
  }

  var storedValue = localStorage.getItem("selectedValue");
  var storedMethod = localStorage.getItem("selectedMethod");

  if (storedValue !== null && storedMethod !== null) {
      window.selectedValue = storedValue;
      window.selectedMethod = storedMethod;
      calcMethod.textContent = `Calculation Method: ${storedMethod}`;
  } else {
      window.selectedValue = 1;
      window.selectedMethod = "Select a method";
      calcMethod.textContent = `Select a calculation method`;
  }
}


getUserLocation();