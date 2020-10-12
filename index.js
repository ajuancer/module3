const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();

// console.log(process.env);

const app = express();
const database = new Datastore('database.db');
database.loadDatabase();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});

app.use(express.json({ limit: '1mb' }));

app.use(express.static('public'));

app.get('/api', (req, res) => {
  database.find({}, (err, data) => {
    if (err) {
      console.log(err);
      res.end();
    } else {
      res.json(data);
    }
  });
});

app.post('/api', (req, res) => {
  const data = req.body;
  const timestamp = Date.now();
  data.timestamp = timestamp;

  database.insert(data);
  res.json(data);
});

app.get('/weather/:latlon', async (req, res) => {
  const latlon = req.params.latlon.split(',');
  console.log(latlon);
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
