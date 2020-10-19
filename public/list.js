getData();
async function getData() {
  const response = await fetch('/api');
  const data = await response.json();

  const mymap = L.map('all-map', {
    center: [30, -35],
    zoom: 2.2,
  });

  const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</>';
  const titleUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tiles = L.tileLayer(titleUrl, {
    attribution,
  });
  tiles.addTo(mymap);

  let markers = [];

  for (item of data) {
    console.log('(C) => displaying ', item);
    const root = document.createElement('tr');
    const geo = document.createElement('td');
    const date = document.createElement('td');
    const mood = document.createElement('td');
    const image = document.createElement('img');
    const weather = document.createElement('td');
    const temp = document.createElement('td');
    const aq = document.createElement('td');
    console.log(item.timestamp);

    const dateString = new Date(item.timestamp).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: 'numeric',
    });
    date.textContent = dateString;

    let emoji;
    switch (item.mood) {
      case 'happy':
        emoji = '😁';
        break;
      case 'sad':
        emoji = '😟';
        break;
      case 'rainbow':
        emoji = '🌈';
        break;
      case 'amazed':
        emoji = '😮';
        break;
      case 'love':
        emoji = '😍';
        break;
      case 'cool':
        emoji = '😎';
        break;
      case 'train':
        emoji = '🚂';
        break;
      default:
        emoji = 'no data :(';
        break;
    }
    try {
      mood.textContent = emoji;
      geo.textContent = item.weather_information.name;
      weather.textContent = item.weather_information.weather[0].description;
      temp.textContent = item.weather_information.main.temp;
      const aq_read = item.air_quality_information.results[0].measurements[0];
      aq.textContent = `${aq_read.value}${aq_read.unit} of ${aq_read.parameter}`;
    } catch {
      console.error(item._id);
    }
    const response = await fetch(`/image/${item._id}`);
    const json = await response.json();
    image.src = `data:image/jpeg;base64, ${json}`;

    root.append(geo, date, mood, image, weather, temp, aq);
    document.getElementById('data_table').append(root);

    // emoji_hex = `\\${emoji.codePointAt(0).toString(16)}`;

    // console.log(emoji_img);
    const settings = {
      className: 'map-marker',
      html: emoji
    };

    const size = 50; // needs to correspond to font-size above
    const iconOptions = {
      iconSize: [size, size],
      iconAnchor: [size / 2, size + 9],
      className: 'mymarker',
      //runner, medium skin tone, Zero-Width-Joiner, female:
      html: emoji, // or: '&#x1f3c3;&#x1f3fd;&#x200d;&#x2640;'
    };

    const marker = L.marker(
      [item.coordinates.latitude, item.coordinates.longitude], {icon: L.divIcon(settings)}
    ).addTo(mymap);
    markers.push(marker);
  }
}
