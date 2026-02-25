fetch('https://panel.faydev.my.id/data/app-config.json')
    .then(response => response.json())
    .then(data => {
        // Use the fetched data to update the UI
        console.log(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });