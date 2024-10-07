var map;
var rescuerMarker;
var baseMarker;
var rescuerOffersMarker;
var pendingOffersMarker;
var rescuerRequestMarker;
var pendingRequestMarker;
var rescuersOffersLayer = L.layerGroup();
var pendingOffersLayer = L.layerGroup();
var rescuersRequestsLayer = L.layerGroup();
var pendingRequestsLayer = L.layerGroup();
var drawnLinesLayer = new L.layerGroup(); // Initialize drawnLinesLayer
var initialMapLayers = new L.LayerGroup();
var processedOffers = {}; // Initialize an object to store processed offers
var processedRequests = {}; // Initialize an object to store processed requests
var layerVisibility = {}; // Initialize an object to store layer visibility


function checkDistanceToBase(rescuerMarker, baseMarker) {
    const rescuerLatLng = rescuerMarker.getLatLng();
    const baseLatLng = baseMarker.getLatLng();
    // Calculate the distance in meters using Leaflet's distance method
    const distance = rescuerLatLng.distanceTo(baseLatLng);

    // Check if the distance is less than 100 meters
    return distance < 100;
}

function checkDistanceToTask(rescuerMarker, taskMarker) 
{
    const rescuerLatLng = rescuerMarker.getLatLng();
    const taskLatLng = taskMarker.getLatLng();

    // Calculate the distance in meters using Leaflet's distance method
    const distance = rescuerLatLng.distanceTo(taskLatLng);
    console.log(distance);

    // Check if the distance is less than 100 meters
    return distance < 50;
}

function loadItems() {
    
    // Check if the rescuer is within 100 meters of the base
    var isWithinRange = checkDistanceToBase(rescuerMarker, baseMarker);

    if (isWithinRange) {

        // Get product details from the user
        var productCategory = prompt("Enter product category:");
        var productName = prompt("Enter product name:");
        var quantityToLoad = parseInt(prompt("Enter quantity to load:"));

        // Call the server-side script to load items
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "../PHP/load_unload_rescuer.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        // Define the data to be sent
        var data = "action=load&category=" + encodeURIComponent(productCategory) +
                   "&product=" + encodeURIComponent(productName) +
                   "&quantity=" + quantityToLoad;

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                console.log(xhr.responseText); // Log the response text to the console

                if (xhr.status == 200) {
                    // Parse the JSON response
                    try {
                        var response = JSON.parse(xhr.responseText);
                        // Display the response message to the user
                        alert(response.message);
                        location.reload();
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                } else {
                    console.error('Error:', xhr.status);
                }
            }
        };
        // Send the data
        xhr.send(data);
    } else {
        alert("You are not within 100 meters of the base.");
    }
}


// Function to fetch and display items from the base inventory
function fetchMyInventory() {
    // Use AJAX to communicate with the server-side to get the inventory data
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "../PHP/load_unload_rescuer.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    // Define the data to be sent (you may need to adjust based on your needs)
    var data = "action=show";

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            console.log(xhr.responseText); // Log the response text to the console
            
            if (xhr.status == 200) {
                // Parse the JSON response (adjust as per your data format)
                try {
                    var response = JSON.parse(xhr.responseText);
                     
                    // Check if the response is successful
                    if (response.status === 'success') {
                        var inventoryData = response.data;

                        // Create a string to represent the content of the popup with styling
                        var popupContent = '<html><head><link rel="stylesheet" type="text/css" href="../CSS/rescuer.css"></head>' +
                            '<body><div class="popup-container">' + '<h2>My Inventory</h2><ul>';

                        // Iterate through the inventory data and append items to the popup content
                        for (var i = 0; i < inventoryData.length; i++) {
                            // Log each iteration to check the values
                            console.log("Iteration", i, ":", inventoryData[i]);

                            popupContent += '<li> Product: ' + inventoryData[i].product +
                            ' | Quantity: ' + inventoryData[i].quantity + '</li>';
                        }

                        popupContent += '</ul></div></body></html>';

                        // Calculate the center position
                        var screenWidth = window.innerWidth;
                        var screenHeight = window.innerHeight;
                        var popupWidth = 600; 
                        var popupHeight = 400; 
                        var leftPosition = (screenWidth - popupWidth) / 2;
                        var topPosition = (screenHeight - popupHeight) / 2;

                        // Open a new window with the popup content at the center
                        var popupWindow = window.open('', '_blank', 'width=' + popupWidth + ',height=' + popupHeight + ',left=' + leftPosition + ',top=' + topPosition + ',scrollbars=yes,resizable=yes');

                        // Load the external CSS file in the dynamic window
                        popupWindow.document.head.innerHTML += '<link rel="stylesheet" type="text/css" href="../CSS/rescuer.css">';

                        // Write the content to the new window
                        popupWindow.document.write(popupContent);

                        // Prevent the new window from navigating to a blank page
                        popupWindow.document.close();
                        
                        // Clear existing items in the list
                        var inventoryList = document.getElementById('products');
                        inventoryList.innerHTML = '';

                        // Display the 'inventory-container'
                        document.getElementById('inventory-container').style.display = 'block';
                    } else {
                        console.error('Error:', response.message);
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            } else {
                console.error('Error:', xhr.status);
            }
        }
    };
    
    // Send the data
    xhr.send(data);
}

function unloadItems() {
    // Check if the rescuer is within 100 meters of the base (similar to the load logic)
    var isWithinRange = checkDistanceToBase(rescuerMarker, baseMarker); // Implement this function
    if (isWithinRange) {
        // Call the unload function to transfer items to the base inventory
        unloadMyInventory();
    } else {
        alert("You are not within 100 meters of the base.");
    }
}

// Function to unload items to the base inventory
function unloadMyInventory() {
    // Use AJAX to communicate with the server-side to unload items
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "../PHP/load_unload_rescuer.php", true); // Change to POST method
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    // Define the data to be sent (you may need to adjust based on your needs)
    var data = "action=unload";

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            console.log(xhr.responseText); // Log the response text to the console

            if (xhr.status == 200) {
                // Handle successful unloading
                alert("Items successfully unloaded to the base inventory.");
                location.reload();
            } else {
                console.error('Error:', xhr.status);
            }
        }
    };

    // Send the data
    xhr.send(data);
}

function initializeRescMap() {
    map = L.map('map').setView([38.2466, 21.7346], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    fetch('../PHP/rescuersMap_pin.php')
        .then(response => response.json())
        .then(data => {

            if (data.basePin && typeof data.basePin.latitude === 'string' && typeof data.basePin.longitude === 'string') {         
                baseLatitude = parseFloat(data.basePin.latitude);
                baseLongitude = parseFloat(data.basePin.longitude);
                if (!isNaN(baseLatitude) && !isNaN(baseLongitude)) {
                    var baseIcon = L.icon({
                        iconUrl: '../Resources/home.png',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32]
                    });
                    baseMarker = L.marker([baseLatitude, baseLongitude], { icon: baseIcon }).addTo(map)
                    .bindPopup('Base Pin');
                    }
                }

            if (data.rescuerPins && typeof data.rescuerPins === 'object') {
                rescuerLatitude = parseFloat(data.rescuerPins.latitude);
                rescuerLongitude = parseFloat(data.rescuerPins.longitude);
                if (!isNaN(rescuerLatitude) && !isNaN(rescuerLongitude)) {
                    var rescuerIcon = L.icon({
                        iconUrl: '../Resources/car.png',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32]
                    });
                    rescuerMarker = L.marker([rescuerLatitude, rescuerLongitude], { icon: rescuerIcon}).addTo(map)
                    .bindPopup(`Rescuer Pin - Latitude: ${rescuerLatitude}, Longitude: ${rescuerLongitude}`);
                    }
                }

            if (data.rescuerOffers && Array.isArray(data.rescuerOffers)) 
            {
                data.rescuerOffers.forEach(function (rescuerOffers) 
                {
                    var rescuerOffersLatitude = parseFloat(rescuerOffers.latitude);
                    var rescuerOffersLongitude = parseFloat(rescuerOffers.longitude);
                    if (!isNaN(rescuerOffersLatitude) && !isNaN(rescuerOffersLongitude)) {
                        var res_offer_Icon = L.icon({
                            iconUrl: '../Resources/processed_offer.png',
                            iconSize: [32, 32],
                            iconAnchor: [25, 32],
                            popupAnchor: [0, -32]
                        });
                        rescuerOffersMarker = L.marker([rescuerOffersLatitude, rescuerOffersLongitude], { icon: res_offer_Icon })
                        .bindPopup(`
                        <div class="popup-content">
                            <strong>Name:</strong> ${rescuerOffers.first_name} <br>
                            <strong>Surname:</strong> ${rescuerOffers.last_name} <br>
                            <strong>Phone:</strong> ${rescuerOffers.phone} <br>
                            <strong>Date of Registration:</strong> ${rescuerOffers.registration_date} <br>
                            <strong>Product:</strong> ${rescuerOffers.product} <br>
                            <strong>Quantity:</strong> ${rescuerOffers.quantity} <br>
                            <strong>Date of Withdraw:</strong> ${rescuerOffers.withdrawal_date} <br>
                            <strong>Username of Rescuer:</strong> ${rescuerOffers.username}
                        </div>
                        `).addTo(map);
                        
                        rescuersOffersLayer.addLayer(rescuerOffersMarker);
                        processedOffers[rescuerOffers.id] = rescuerOffersMarker; // Store the processed offer in the object

                         // Create a polyline between rescuerPin and rescuerOffer
                        var polyline = L.polyline([
                            [rescuerLatitude, rescuerLongitude],
                            [rescuerOffersLatitude, rescuerOffersLongitude]
                        ], { color: 'black' }); 

                        drawnLinesLayer.addLayer(polyline);
                        }
                });
            }

            if (data.pendingOffers && Array.isArray(data.pendingOffers)) {
                data.pendingOffers.forEach(function (pendingOffers) {
                    var pendingOffersLatitude = parseFloat(pendingOffers.latitude);
                    var pendingOffersLongitude = parseFloat(pendingOffers.longitude);
                    if (!isNaN(pendingOffersLatitude) && !isNaN(pendingOffersLongitude)) {
                        var pending_offer_Icon = L.icon({
                            iconUrl: '../Resources/pending_offer.png',
                            iconSize: [32, 32],
                            iconAnchor: [25, 32],
                            popupAnchor: [0, -32]
                        });
                        pendingOffersMarker = L.marker([pendingOffersLatitude, pendingOffersLongitude], { icon: pending_offer_Icon })
                        .bindPopup(`
                        <div class="popup-content">
                            <strong>Name:</strong> ${pendingOffers.first_name} <br>
                            <strong>Surname:</strong> ${pendingOffers.last_name} <br>
                            <strong>Phone:</strong> ${pendingOffers.phone} <br>
                            <strong>Date of Registration:</strong> ${pendingOffers.registration_date} <br>
                            <strong>Product:</strong> ${pendingOffers.product} <br>
                            <strong>Quantity:</strong> ${pendingOffers.quantity}
                            <button id="take-task-button" onclick="takeOffer(${pendingOffers.id})">Take Offer</button>
                        </div>
                        `).addTo(map);
                        pendingOffersLayer.addLayer(pendingOffersMarker)
                    }
                });
            }

            if (data.rescuerRequests && Array.isArray(data.rescuerRequests)) {
                data.rescuerRequests.forEach(function (rescuerRequest) {
                    var rescuerRequestsLatitude = parseFloat(rescuerRequest.latitude);
                    var rescuerRequestsLongitude = parseFloat(rescuerRequest.longitude);
                    if (!isNaN(rescuerRequestsLatitude) && !isNaN(rescuerRequestsLongitude)) {
                        var res_request_Icon = L.icon({
                            iconUrl: '../Resources/processed_request.png',
                            iconSize: [32, 32],
                            iconAnchor: [5, 32],
                            popupAnchor: [0, -32]
                        });
                        rescuerRequestMarker = L.marker([rescuerRequestsLatitude, rescuerRequestsLongitude], { icon: res_request_Icon })
                        .bindPopup(`
                        <div class="popup-content">
                            <strong>Name:</strong> ${rescuerRequest.first_name} <br>
                            <strong>Surname:</strong> ${rescuerRequest.last_name} <br>
                            <strong>Phone:</strong> ${rescuerRequest.phone} <br>
                            <strong>Date of Registration:</strong> ${rescuerRequest.registration_date} <br>
                            <strong>Product:</strong> ${rescuerRequest.product} <br>
                            <strong>Quantity:</strong> ${rescuerRequest.numofPersons} <br>
                            <strong>Date of Withdraw:</strong> ${rescuerRequest.withdrawal_date} <br>
                            <strong>Username of Rescuer:</strong> ${rescuerRequest.username}
                        </div>
                        `).addTo(map);
                        rescuersRequestsLayer.addLayer(rescuerRequestMarker)
                        processedRequests[rescuerRequest.id] = rescuerRequestMarker; // Store the processed request in the object

                         // Create a polyline between rescuerPin and rescuerRequest
                        var polyline = L.polyline([
                            [rescuerLatitude, rescuerLongitude],
                            [rescuerRequestsLatitude, rescuerRequestsLongitude]
                        ], { color: 'red' }); 

                        
                        drawnLinesLayer.addLayer(polyline);
                    }
                });
            }

            if (data.pendingRequests && Array.isArray(data.pendingRequests)) {
                data.pendingRequests.forEach(function (pendingRequest) {
                    var pendingRequestsLatitude = parseFloat(pendingRequest.latitude);
                    var pendingRequestsLongitude = parseFloat(pendingRequest.longitude);
                    if (!isNaN(pendingRequestsLatitude) && !isNaN(pendingRequestsLongitude)) {
                        var pending_request_Icon = L.icon({
                            iconUrl: '../Resources/pending_request.png',
                            iconSize: [32, 32],
                            iconAnchor: [5, 32],
                            popupAnchor: [0, -32]
                        });
                        pendingRequestMarker = L.marker([pendingRequestsLatitude, pendingRequestsLongitude], { icon: pending_request_Icon })
                        .bindPopup(`
                        <div class="popup-content">
                            <strong>Name:</strong> ${pendingRequest.first_name} <br>
                            <strong>Surname:</strong> ${pendingRequest.last_name} <br>
                            <strong>Phone:</strong> ${pendingRequest.phone} <br>
                            <strong>Date of Registration:</strong> ${pendingRequest.registration_date} <br>
                            <strong>Product:</strong> ${pendingRequest.product} <br>
                            <strong>Quantity:</strong> ${pendingRequest.numofPersons} 
                            <button id="take-task-button" onclick="takeRequest(${pendingRequest.id})">Take Request</button>
                            
                        </div>
                        `).addTo(map);
                        pendingRequestsLayer.addLayer(pendingRequestMarker)
                    }
                });
            }

            // Add all existing layers to the initialMapLayers
            map.eachLayer(layer => 
                {
                    if (layer instanceof L.Marker) 
                    {
                        initialMapLayers.addLayer(layer);
                    }
                });
        }).catch(error => {
            console.error('Error:', error);
        });
}

async function takeOffer(announcementId) {

    var hasmaxfourtasks = await checkNumofTasks();

    if (hasmaxfourtasks) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "../PHP/take_over_task.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200){
                alert("You have successfully taken over the offer!")
                location.reload();
            }
        };
        xhr.send('announcementId=' + encodeURIComponent(announcementId));
    }
    else {
        alert("You currently have 4 tasks in progress. As per our policy, we kindly request you not to take on more than 4 tasks simultaneously.") 
    }
}

async function takeRequest(requestId) {

    var hasmaxfourtasks = await checkNumofTasks();
    if (hasmaxfourtasks) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "../PHP/take_over_task.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200){
                alert("You have successfully taken over the request!")
                location.reload();
            }
        };
        xhr.send('requestId=' + encodeURIComponent(requestId));
    }
    else {
        alert("You currently have 4 tasks in progress. As per our policy, we kindly request you not to take on more than 4 tasks simultaneously.") 
    }
}

function checkNumofTasks() {
    // Make an asynchronous request to your server
    return fetch('../PHP/take_over_task.php')
        .then(response => response.json())
        .then(data => {
            // Data should contain the counts for announcements and supply_requests
            var announcementsCount = parseInt(data.announcementsCount);
            var supplyRequestsCount = parseInt(data.supplyRequestsCount);

            console.log(announcementsCount);
            console.log(supplyRequestsCount);
            // Calculate the total count
            var totalTasksCount = announcementsCount + supplyRequestsCount;

            console.log(totalTasksCount);
            // Return true if the total count is less than or equal to 4, false otherwise
            return totalTasksCount < 4;
        })
        .catch(error => {
            console.error('Error:', error);
            return false; // Handle errors as needed
        });
}


// Function to make the base pin draggable
function makePinDraggable2() 
{
    var option = window.confirm('Are you sure you want to change your location?');
    if(option)
    {
        // Enable dragging for the baseMarker only if not already enabled
        if (!rescuerMarker.dragging.enabled()) 
        {
            rescuerMarker.dragging.enable();
            // Add a dragend event listener to the marker only if not already added
            if (!rescuerMarker.hasEventListeners('dragend')) 
            {
                rescuerMarker.on('dragend', function (event) 
                {
                    var newLatLng = event.target.getLatLng();
                    updateRescuerLocation(newLatLng);
                });
            }
        }
    }
}

// Function to update the base location
function updateRescuerLocation(newLatLng)
{
    // Send the base location to the server
    fetch('../PHP/rescuersMap_pin.php',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `latitude=${newLatLng.lat}&longitude=${newLatLng.lng}`,
    });

    // Inform the user about the update and marker addition
    alert('Rescuer location updated to: ' + newLatLng.lat + ', ' + newLatLng.lng + '\nMarker added at this location.');
    // Disable dragging after updating the location
    rescuerMarker.dragging.disable();
    location.reload();
}

function updateLayerVisibility2() {
    // Clear the map
    map.eachLayer(function (mapLayer) {
        if (mapLayer instanceof L.Marker) {
            map.removeLayer(mapLayer);
        }
    });

    // Iterate through all checkboxIds
    var checkboxIds = ['rescuerOffersFilter', 'pendingOffersFilter', 'rescuerRequestsFilter', 'pendingRequestsFilter'];

    // Check if all checkboxes are unchecked
    var allUnchecked = checkboxIds.every(function (checkboxId) 
    {
        return !document.getElementById(checkboxId).checked;
    });

    // If all checkboxes are unchecked, revert to the initial map state
    if(allUnchecked) 
    {
        initialMapLayers.eachLayer(function (layer) 
        {
            map.addLayer(layer);
        });
    }

    checkboxIds.forEach(function (checkboxId) 
    {
        var checkbox = document.getElementById(checkboxId);
        var isChecked = checkbox.checked;
        var layerGroup;

        // Determine the layer group based on the checkboxId
        switch (checkboxId) {
            case 'rescuerOffersFilter':
                layerGroup = rescuersOffersLayer;
                break;
            case 'pendingOffersFilter':
                layerGroup = pendingOffersLayer;
                break;
            case 'rescuerRequestsFilter':
                layerGroup = rescuersRequestsLayer;
                break;
            case 'pendingRequestsFilter':
                layerGroup = pendingRequestsLayer;
                break;
            default:
                console.error("Invalid checkboxId: " + checkboxId);
                return;
        }

        // If the checkbox is checked, add markers from the corresponding layer group to the map
        if (isChecked) {
            layerGroup.eachLayer(function (layer) 
            {
                map.addLayer(layer);
            });
        }
    });
}

function toggleDrawnLines() 
{
    var checkbox = document.getElementById('drawnLinesFilter');
    if (checkbox.checked) 
    {
        drawnLinesLayer.eachLayer(function (layer) 
        {
            map.addLayer(layer);
        });
    } 
    else 
    {
        drawnLinesLayer.eachLayer(function (layer) 
        {
            map.removeLayer(layer);
        });
    }
}

function fetchCurrentTasks() {
    fetch('../PHP/fetch_current_tasks.php')
        .then(response => response.json())
        .then(data => {
            const tasksContainer = document.getElementById('tasks-list');
            tasksContainer.innerHTML = '';

            data.forEach(task => {
                const taskPanel = document.createElement('div');
                taskPanel.classList.add('task-panel');

                taskPanel.innerHTML = `
                    <div class="task-details">
                        <h2>${task.type}</h2>
                        <p><strong>Name:</strong> ${task.first_name} ${task.last_name}</p>
                        <p><strong>Phone:</strong> ${task.phone}</p>
                        <p><strong>Registration Date:</strong> ${task.registration_date}</p>
                        <p><strong>Product:</strong> ${task.product}</p>
                `;

                if (task.quantity !== undefined) {
                    taskPanel.innerHTML += `<p><strong>Quantity:</strong> ${task.quantity}</p>`;
                } else if (task.numofPersons !== undefined) {
                    taskPanel.innerHTML += `<p><strong>Number of Persons:</strong> ${task.numofPersons}</p>`;
                }

                taskPanel.innerHTML += `
                </div>
                <div class="buttons">
                    <button class="done-button" onclick="taskDone(${task.id}, '${task.type}')">Done</button>
                    <button class="cancel-button" onclick="taskCancelled(${task.id}, '${task.type}')">Cancel</button>
                </div>
            `;
                tasksContainer.appendChild(taskPanel);
            });
        })
        .catch(error => console.error('Error fetching tasks:', error));
}

function taskDone(id, type) {
    
    if(type === 'OFFER')
    {
        console.log(processedOffers[id]);
        var isWithinRange = checkDistanceToTask(rescuerMarker, processedOffers[id]);
        if(isWithinRange)
        {
            taskProcessed(id, type);
        } else {
            alert("You are not within 50 meters of the task.");
        }
    }
    else if(type === 'REQUEST')
    {
        console.log(processedRequests[id]);
        // Check if the rescuer is within 50 meters of the base
        var isWithinRange = checkDistanceToTask(rescuerMarker, processedRequests[id]);
        if (isWithinRange)
        {
            taskProcessed(id, type);
        } else {
            alert("You are not within 50 meters of the task.");
        }
    }
}

function taskProcessed(taskId, taskType) {
        // Call the server to mark the task as completed
        fetch('../PHP/mark_task_completed.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ task_id: taskId, task_type: taskType })
        })
        .then(response => response.json())
        .then(data => {
            // Handle the server response
            if (data.success) 
            {
                // Update UI or perform any additional actions
                console.log(data.success);
                alert("Task marked as completed!");
                location.reload();
            } 
            else 
            {
                // Handle error response
                console.error(data.error);
                if (data.error === 'Product does not exist in inventory.') {
                    alert("Not enough products in the inventory.");
                } else if (data.error === 'Not enough products in the inventory.') {
                    alert("Not enough products in the inventory.");
                }
            }
        })
        .catch(error => console.error('Error marking task as completed:', error));
}


function taskCancelled(taskId, taskType) {
    // Call the server to mark the task as cancelled
    fetch('../PHP/mark_task_cancelled.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task_id: taskId, task_type: taskType })
    })
    .then(response => response.json())
    .then(data => {
        // Handle the server response
        if (data.success) {
            // Update UI or perform any additional actions
            console.log(data.success);
            alert("Task marked as canceled.");
            location.reload();
        } else {
            // Handle error response
            console.error(data.error);
        }
    })
    .catch(error => console.error('Error cancelling task:', error));
}

// Function to fetch and display the rescuer's profile information
function retrieveInfo()
{
    var name = document.getElementById('name');
    var surname = document.getElementById('surname');

    fetch('../PHP/fetch_rescuerInfo.php')
    .then(response => response.json())
    .then(data => 
    {
        if(data)
        {
            name.innerHTML = data.first_name;
            surname.innerHTML = data.last_name;
        }
    })
    .catch(error => console.error('Error fetching profile information:', error));
}