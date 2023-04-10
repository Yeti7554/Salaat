let userCity = "";
const myCityDiv = document.querySelector(".my-city");

function getUserCity() {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`https://geocode.xyz/${latitude},${longitude}?json=1`)
            .then((response) => response.json())
            .then((data) => {
              const city = data.city;
              resolve(city);
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

// Call the function to get the user's city and store it in a variable called userCity
getUserCity()
  .then((city) => {
    userCity = city;
    console.log("User city:", userCity);
    myCityDiv.textContent = userCity;
  })
  .catch((error) => {
    console.error("Error getting user city:", error);
  });

  async function getPrayerTimes() {
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${userCity}&country=Canada&method=1`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      const timings = data.data.timings;
      
      const fajr = timings.Fajr;
      const dhuhr = timings.Dhuhr;
      const asr = timings.Asr;
      const maghrib = timings.Maghrib;
      const isha = timings.Isha;
      
      const prayerTimes = [fajr, dhuhr, asr, maghrib, isha];
      
      const prayerTimeElements = document.querySelectorAll('table tr:not(:first-child) td:last-child');
      prayerTimeElements.forEach((element, index) => {
        element.textContent = prayerTimes[index];
      });
      
    } catch (error) {
      console.error(error);
    }
  }
  
  getPrayerTimes();

