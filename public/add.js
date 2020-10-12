// Geo Locate
let lat, lon;
if ('geolocation' in navigator) {
  console.log('geolocation available');
  navigator.geolocation.getCurrentPosition(async (position) => {
    let lat, lon, weather, air;
    try {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      document.getElementById('latitude').textContent = lat.toFixed(2);
      document.getElementById('longitude').textContent = lon.toFixed(2);
      const api_url = `/weather/${lat},${lon}`;
      const response = await fetch(api_url);
      const json = await response.json();
      console.log(json);
      weather = json.weather;
      air = json.air_quality.results[0].measurements[4];
      document.getElementById('description').textContent =
        weather.weather[0].description;
      document.getElementById('temperature').textContent = weather.main.temp;
      document.getElementById('air_value').textContent = air.value;
      document.getElementById('air_unit').textContent = air.unit;
    } catch (error) {
      console.log('there was an error :(');
      console.error(error);
    }

    const data = { lat, lon, weather, air };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    const db_response = await fetch('/api', options);
    const db_json = await db_response.json();
    console.log(db_json);
  });
} else {
  console.log('geolocation not available');
}
