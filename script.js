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

function getPrayerTimes() {
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${userCityFormatted}&country=${userCountryFormatted}&method=${selectedValue}`;
  console.log(url);

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const timings = data.data.timings;

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
    })
    .catch(error => console.error(error));
}

function getUserLocation() {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`https://geocode.xyz/${latitude},${longitude}?json=1`)
            .then((response) => response.json())
            .then((data) => {
              const city = data.city;
              const country = data.country;
              resolve({ city, country });
            })
            .catch((error) => reject(error));
        },
        (error) => reject(error)
      );
    } else {
      reject(new Error("Geolocation not available"));
    }
  });
}


function setupSelectBox() {
  // Check if the selectBox element exists
  var selectBox = document.getElementById("selectBox");
  if (selectBox !== null) {
    selectBox.options[0].text = "Choose here";
    selectBox.options[0].style.textAlign = "center"; 
    // Add an event listener to the dropdown menu
    selectBox.addEventListener("change", function() {
      // Get the selected value and method
      var selectedValue = selectBox.value;
      var selectedMethod = selectBox.options[selectBox.selectedIndex].text;
      // Store the selected value and method in localStorage
      localStorage.setItem("selectedValue", selectedValue);
      localStorage.setItem("selectedMethod", selectedMethod);
      // Make the stored values available globally
      window.selectedValue = selectedValue;
      window.selectedMethod = selectedMethod;
    });
  }

  // Retrieve the stored value and method from localStorage
  var storedValue = localStorage.getItem("selectedValue");
  var storedMethod = localStorage.getItem("selectedMethod");

  // Check if a value and method are stored in localStorage
  if (storedValue !== null && storedMethod !== null) {
    // Use the stored value and method
    window.selectedValue = storedValue;
    window.selectedMethod = storedMethod;
    calcMethod.textContent = `Calculation Method: ${storedMethod}`;
  } else {
    // Use default values if no values are stored
    window.selectedValue = 1; // Change this to whatever default value you want
    window.selectedMethod = "Select a method";
    calcMethod.textContent = `Select a calculation method`; // Change this to whatever default value you want
  }
}

// Call the function to get the user's city and store it in a variable called userCity
function getUserLocationWithRetry() {
  getUserLocation()
    .then((city) => {
      userArea = city;
      userCity = userArea.city;
      userCityUpper = userCity.toLowerCase().replace(/\b\w/g, function(char) {
        return char.toUpperCase();
      });
      userCountry = userArea.country;
      userCountryUpper = userCountry.toLowerCase().replace(/\b\w/g, function (char) {
        return char.toUpperCase();
      });
      userCityFormatted = userCityUpper.replace(/ /g, '%20');
      userCountryFormatted = userCountryUpper.replace(/ /g, '%20');
      console.log("User city:", userCityUpper)
      console.log("User Country:", userCountryUpper);
      myCityDiv.textContent = `${userCityUpper}, ${userCountryUpper}`;
      setupSelectBox();
      getPrayerTimes();
    })
    .catch((error) => {
      console.error("Error getting user city:", error);
      setTimeout(() => {
        location.reload();
      }, 1100);
    });
}

getUserLocationWithRetry();
