async function getPrayerTimes() {
  const url = `https://api.aladhan.com/v1/timingsByCity?city=Edmonton&country=Canada&method=1`;
  
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

