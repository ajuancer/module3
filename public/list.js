    getData();
    
    async function getData() {
        const response = await fetch('/api');
        const data = await response.json();
    
        const all_list = document.createElement('ul');
        all_list.id='all_list';
        for (item of data) {
            const value_wrapper = document.createElement('li');
            const root = document.createElement('ul');
            root.id = 'row_list'
            const geo = document.createElement('li');
            const date = document.createElement('li');
            const image = document.createElement('img');
    
            const dateString = new Date(item.timestamp).toLocaleString();
            geo.textContent = `location: ${item.lat}°, ${item.lon}°`;
            date.textContent = `date: ${dateString}`;
            image.src = item.image64;

            root.append(geo, date, image);
            value_wrapper.append(root);
            all_list.append(value_wrapper);
            document.getElementById('main').append(all_list);
    
        }
        console.log(data);
    }