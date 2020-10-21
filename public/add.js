let canvas, video;

// Set device location as location values.
async function getDeviceLocation() {
  if ('geolocation' in navigator) {
    console.log('(C) => Geolocation is available for this device.');
    navigator.geolocation.getCurrentPosition(async (position) => {
      let dLon = position.coords.longitude;
      let dLat = position.coords.latitude;
      console.log(`(C) => Location found: ${dLat}, ${dLon}`);
      document.getElementById('fLat').value = dLat.toFixed(4);
      document.getElementById('fLon').value = dLon.toFixed(4);
    });
  } else {
    log.error('(C) => Geolocation is NOT available for this device.');
  }
}

// Listener for getting the location of device,
document.getElementById('get_current').onclick = async () => {
  console.log('(C) => Actual location has been requested.');
  getDeviceLocation();
};

// Listener for removing draw pic.
document.getElementById('erase_pic').onclick = async () => {
  console.log('(C) => Remove request listened.');
  background(0, 0, 90);
};

// Listener for media dropdown change.
document.getElementById('pic').onchange = async () => {
  const selected = document.getElementById('pic').value;
  remove();
  new p5();
  console.log(`(C) => The selected mode is: ${selected}`);
  if (selected == 'photo') {
    setPhotoCanvas();
    document.getElementById('erase_pic').style.display = 'none';
  } else if (selected == 'drawing') {
    setDrawingCanvas();
    document.getElementById('erase_pic').style.display = 'block';
  }
};

// Create the draw container.
async function setDrawingCanvas() {
  canvas = createCanvas(260, 320);
  canvas.parent('canvas-container');
  colorMode(HSB);
  background(0, 0, 90);
}

// Create the webcam view.
async function setPhotoCanvas() {
  video = createCapture(VIDEO);
  video.parent('canvas-container');
  video.size(260, 200);
}

// Draw over the sketch.
async function draw() {
  // stroke(250, 100, 30);
  if (mouseIsPressed) {
    stroke((frameCount * 10) % 360, 60, 90);
    strokeWeight(4);
    strokeCap(ROUND);
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

// Create listener for the submit button.
document.getElementById('submit').onclick = async () => {
  console.log('(C) => Submit button is pressed.');
  const mood = document.getElementById('mood').value;
  const form_lat = document.getElementById('fLat').value;
  const form_lon = document.getElementById('fLon').value;
  const selected_media = document.getElementById('pic').value;
  let image64;
  if (selected_media === 'photo') {
    video.loadPixels();
    image64 = video.canvas.toDataURL();
  } else if (selected_media === 'drawing') {
    canvas.loadPixels();
    image64 = canvas.elt.toDataURL();
  }

  const data = {
    location: { lat: form_lat, lon: form_lon },
    mood: mood,
    picture: image64,
  };

  const post_options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  const fetch_url = '/api';

  console.log(
    `Fetching ${fetch_url} with the following info: ${JSON.stringify(
      post_options
    )}`
  );

  const response = await fetch(fetch_url, post_options);
  const res_json = await response.json();

  console.log(res_json);

  document.getElementById('results-container').style.visibility = 'visible';

  document.getElementById('temp').textContent =
    res_json.weather_information.main.temp;
  document.getElementById('forecast').textContent =
    res_json.weather_information.weather[0].description;
  if (res_json.air_quality_information.results.length > 0) {
    document.getElementById('aq_paragraph').style.display = 'block';
    document.getElementById(
      'aq_distance'
    ).textContent = res_json.air_quality_information.results[0].distance.toFixed(
      0
    );
    document.getElementById('aq_value').textContent =
      res_json.air_quality_information.results[0].measurements[0].value;
    document.getElementById('aq_unit').textContent =
      res_json.air_quality_information.results[0].measurements[0].unit;
    document.getElementById('aq_measure').textContent =
      res_json.air_quality_information.results[0].measurements[0].parameter;
    document.getElementById('aq_date').textContent =
      res_json.air_quality_information.results[0].measurements[0].lastUpdated.split('T')[0];
  } else {
    document.getElementById('aq_paragraph').style.visibility = 'none';
  }
  document.getElementById('r_image').src = res_json.image_path;
  l
};

window.onclick = (event) => {
  const container = document.getElementById('results-container');
  if (event.target == container) {
    container.style.visibility = 'hidden';
  }
};
