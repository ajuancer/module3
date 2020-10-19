const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// console.log(process.env);

const app = express();
const database = new Datastore('main.db');
database.loadDatabase();

const port = process.env.PORT || 3000;

console.log(database);

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});

app.use(express.json({ limit: '1mb' }));

app.use(express.static('public'));

app.get('/api', (req, res) => {
  database.find({}, (err, data) => {
    if (err) {
      console.log('(B) => get /api raised:', err);
      res.end();
    } else {
      res.json(data);
    }
  });
});

app.post('/api', async (req, res) => {
  const r_data = req.body;
  const lat = r_data.location.lat;
  const lon = r_data.location.lon;

  // Get actual time.
  const timestamp = Date.now();

  // Save received image.
  const img_name = `image_${Number(
    timestamp
  )}.png`;
  const img_path = path.join('images', img_name);
  fs.writeFile(
    img_path,
    r_data.picture.replace(/^data:image\/png;base64,/, ''),
    'base64',
    (err) => {
      console.error('(B) => saving file raised:', err);
    }
  );

  // Get weather info.
  const weather_info = await getClimateInfo(lat, lon);

  // Data object.
  const data = {
    coordinates: { latitude: lat, longitude: lon },
    timestamp: timestamp,
    mood: r_data.mood,
    image_path: r_data.picture,
    weather_information: weather_info.weather,
    air_quality_information: weather_info.air_quality,
  };
  res.json(data);

  // Replace path attribute with a real path.
  data.image_path = img_path;
  database.insert(data);
});

// Get specific location information with external APIs
async function getClimateInfo(lat, lon) {
    const api_key = process.env.API_KEY;
    const weather_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
    const weather_response = await fetch(weather_url);
    const weather_data = await weather_response.json();

    const aq_url = `https://api.openaq.org/v1/latest?coordinates=${lat},${lon}`;
    const aq_response = await fetch(aq_url);
    const aq_data = await aq_response.json();

    const data = {
      weather: weather_data,
      air_quality: aq_data,
    };
    return data;
}

// Return base64 file of the requested image.
app.get('/image/:id', async (req, res) => {
  const id = req.params.id;
  database.find({"_id": id}, (err, result) => {
   if (result.length != 0) {
     const data = result[0];
     const img64 = fs.readFileSync(data.image_path, 'base64');
     res.json(img64);
   } else {
     res.sendStatus(404);
   }
  });
});

// Get specific location information with external APIs.
app.get('/weather/:latlon', async (req, res) => {
  const latlon = req.params.latlon.split(',');
  const lat = latlon[0];
  const lon = latlon[1];
  const api_key = process.env.API_KEY;
  const weather_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
  const weather_response = await fetch(weather_url);
  const weather_data = await weather_response.json();

  const aq_url = `https://api.openaq.org/v1/latest?coordinates=${lat},${lon}`;
  const aq_response = await fetch(aq_url);
  const aq_data = await aq_response.json();

  const data = {
    weather: weather_data,
    air_quality: aq_data,
  };
  res.json(data);
});
