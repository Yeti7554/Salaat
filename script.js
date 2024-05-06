let userCity = "";
let userCityUpper = "";
let userCountry;
let userCityFormatted;
let userCountryFormatted;
const myCityDiv = document.querySelector(".my-city");
const calcMethod = document.querySelector(".calc-text");
var fajr;
var dhuhr;
var asr;
var maghrib;
var isha;
var nextPrayer;

// Function to format time to HH:MM AM/PM format
function formatTime(timeString) {
    const [hourString, minute] = timeString.split(":");
    const hour = +hourString % 24;
    return (hour % 12 || 12) + ":" + minute + (hour < 12 ? " AM" : " PM");
}

// Function to get prayer times from API
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

    // Find the next closest prayer after getting prayer times
    findNextPrayer();
}

// Function to populate prayer times on the page
function populatePrayerTimes(timings) {
    fajr = formatTime(timings.Fajr);
    dhuhr = formatTime(timings.Dhuhr);
    asr = formatTime(timings.Asr);
    maghrib = formatTime(timings.Maghrib);
    isha = formatTime(timings.Isha);
    sunrise = formatTime(timings.Sunrise);

    // Populate prayer times table
    document.getElementById('fajr').textContent ="Fajr: " + fajr;
    document.getElementById('sunrise').textContent ="Sunrise: " + sunrise;
    document.getElementById('dhuhr').textContent ="Dhuhr: " + dhuhr;
    document.getElementById('asr').textContent ="Asr: " + asr;
    document.getElementById('maghrib').textContent ="Maghrib: " + maghrib;
    document.getElementById('isha').textContent ="Isha: " + isha;
}



// Function to find the next closest prayer time after the current time
function findNextPrayer() {
    var currentTimeInMinutes = convertTimeToMinutes(getCurrentTime());
    var prayerTimes = [
        { name: 'Fajr', time: fajr },
        { name: 'Dhuhr', time: dhuhr },
        { name: 'Asr', time: asr },
        { name: 'Maghrib', time: maghrib },
        { name: 'Isha', time: isha }
    ];
    var nextPrayerInfo = null;

    // Iterate through prayer times array
    for (var i = 0; i < prayerTimes.length; i++) {
        var prayerTimeInMinutes = convertTimeToMinutes(prayerTimes[i].time);

        // Check if the current prayer time is greater than the current time
        if (prayerTimeInMinutes > currentTimeInMinutes) {
            nextPrayerInfo = prayerTimes[i];
            break;
        }
    }

    // Display next prayer in the "nextPrayer" div
    if (nextPrayerInfo !== null) {
        nextPrayer = nextPrayerInfo.time;
        var nextPrayerName = nextPrayerInfo.name;
        var nextPrayerDiv = document.querySelector('.nextPrayer');
        var nextPrayerTimeDiv = document.querySelector('.nextPrayerTime');
        nextPrayerDiv.textContent = `${nextPrayerName}`;
        nextPrayerTimeDiv.textContent = `${nextPrayer}`;
    } else {
        // If there is no next prayer (i.e., all prayers have passed for the day)
        nextPrayerDiv.textContent = "All prayers for today have passed.";
    }
}


// Function to convert time to minutes for comparison
function convertTimeToMinutes(time) {
    var [hourString, minuteString, ampm] = time.split(/:| /);
    var hour = parseInt(hourString);
    var minute = parseInt(minuteString);
    
    // Convert hours to 24-hour format
    if (ampm === 'PM' && hour < 12) {
        hour += 12;
    } else if (ampm === 'AM' && hour === 12) {
        hour = 0;
    }
    
    return hour * 60 + minute;
}

// Function to get the current time in HH:MM AM/PM format
function getCurrentTime() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 12-hour format
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

// Function to get user location
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

// Function to cache user location
function cacheUserLocation(city, country) {
    localStorage.setItem('userCity', city);
    localStorage.setItem('userCountry', country);
}

// Function to get cached user location
function getCachedUserLocation() {
    const city = localStorage.getItem('userCity');
    const country = localStorage.getItem('userCountry');

    if (city && country) {
        return { city, country };
    }
    return null;
}

// Function to process user location
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

// Function to setup select box
function setupSelectBox() {
    var selectBox = document.getElementById("selectBox");
  
    if (selectBox) { // Check if selectBox exists
        selectBox.options[0].text = "Method";
        selectBox.options[0].style.textAlign = "center"; 
        selectBox.addEventListener("change", function() {
            var selectedValue = selectBox.value;
            var selectedMethod = selectBox.options[selectBox.selectedIndex].text;
            localStorage.setItem("selectedValue", selectedValue);
            localStorage.setItem("selectedMethod", selectedMethod);
            window.selectedValue = selectedValue;
            window.selectedMethod = selectedMethod;
  
            // Refresh the page after selecting an option
            location.reload();
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
  

document.addEventListener('DOMContentLoaded', function() {
    // Get user location
    getUserLocation();
});

