// Define a global variable to hold the marker
var baseMarker;
var map;

var initialMapLayers = new L.LayerGroup(); // Define a variable to store the initial map layers
var linesLayer = new L.layerGroup(); // Layer group for polylines

var processedRequestsLayer = L.layerGroup(); // Layer group for processed requests
var processedOffersLayer = L.layerGroup(); // Layer group for processed offers
var pendingRequestsLayer = L.layerGroup(); // Layer group for pending requests
var pendingOffersLayer = L.layerGroup(); // Layer fgroup for pending offers
var activeTasksLayer = L.layerGroup(); // Layer group for active tasks
var inactiveTasksLayer = L.layerGroup(); // Layer group for inactive tasks

//Create an object to hold the rescuer markers
var rescuerMarkers = {};

//Create an object to hold the processed requests
var processedRequests = {};

//Create an object to hold the processed offers
var processedOffers = {};

// Create an object to hold the visible layers
var layerVisibility = {};

//Function to handle lines visibility
function toggleLines()
{
    var linesCheckBox = document.getElementById('showLinesFilter');
    var isChecked = linesCheckBox.checked;

    if(!isChecked)
    {
        //Clear all the lines from the map
        map.eachLayer(layer => 
        {
            if (layer instanceof L.Polyline) 
            {
                map.removeLayer(layer);
            }
        });
    }
    else
    {
        //Add all the lines that you have seen, to the map
        linesLayer.eachLayer(layer =>
        {
            map.addLayer(layer);
        });
    }
}

// Function to update layer visibility
function updateLayerVisibility()
{
    // Clear the map
    map.eachLayer(function (mapLayer) 
    {
        if (mapLayer instanceof L.Marker) 
        {
            map.removeLayer(mapLayer);
        }
    });

    // Iterate through all checkboxIds
    var checkboxIds = ['processedOffersFilter', 'pendingOffersFilter', 'processedRequestsFilter', 
    'pendingRequestsFilter', 'rescuersActiveTasksFilter', 'rescuersInactiveTasksFilter'];

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
        switch (checkboxId)
        {
            case 'processedOffersFilter':
                layerGroup = processedOffersLayer;
                break;
            case 'pendingOffersFilter':
                layerGroup = pendingOffersLayer;
                break;
            case 'processedRequestsFilter':
                layerGroup = processedRequestsLayer;
                break;
            case 'pendingRequestsFilter':
                layerGroup = pendingRequestsLayer;
                break;
            case 'rescuersActiveTasksFilter':
                layerGroup = activeTasksLayer;
                break;
            case 'rescuersInactiveTasksFilter':
                layerGroup = inactiveTasksLayer;
                break;
            default:
                console.error("Invalid checkboxId: " + checkboxId);
                return;
        }

        // If the checkbox is checked, add markers from the corresponding layer group to the map
        if (isChecked) 
        {
            layerGroup.eachLayer(function (layer) 
            {
                map.addLayer(layer);
            });
        }
    });
}

//Function to draw lines between source and destination markers
function drawLines(sourceMarker, destinationMarkers, color)
{
    //Making the checkbox checked
    var linesCheckBox = document.getElementById('showLinesFilter');
    linesCheckBox.checked = true;
    
    destinationMarkers.forEach(destinationMarker => 
    {
        // Draw lines connecting source marker to destination markers
        var polyline = L.polyline([
            [sourceMarker.getLatLng().lat, sourceMarker.getLatLng().lng],
            [destinationMarker.getLatLng().lat, destinationMarker.getLatLng().lng]
        ], { color: color }).addTo(map);

        // Add the polyline to the linesLayer
        linesLayer.addLayer(polyline);
    });
}

// Function to handle rescuer marker click
function handleRescuerMarkerClick(rescuerId, rescuerMarkers, processedRequests, processedOffers) 
{
    // Clear existing polylines on the map
    map.eachLayer(layer => 
    {
        if (layer instanceof L.Polyline) 
        {
            map.removeLayer(layer);
        }
    });
    
    // Check if the rescuer has processed requests
    if (processedRequests[rescuerId]) 
    {
        drawLines(rescuerMarkers[rescuerId], processedRequests[rescuerId], 'green');
    } 
    else 
    {
        console.log('Rescuer has no processed requests.');
    }

    // Check if the rescuer has processed offers
    if (processedOffers[rescuerId]) 
    {
        drawLines(rescuerMarkers[rescuerId], processedOffers[rescuerId], 'blue');
    } 
    else 
    {
        console.log('Rescuer has no processed offers.');
    }
}

// Function to handle processed request or offer marker click
function handleProcessedMarkerClick(rescuerId, processedMarkers, color)
{
    
    // Clear existing polylines on the map
    map.eachLayer(layer =>
    {
        if (layer instanceof L.Polyline) 
        {
            map.removeLayer(layer);
        }
    })

    // Check if the rescuer has processed markers
    if (processedMarkers[rescuerId]) 
    {
        drawLines(rescuerMarkers[rescuerId], processedMarkers[rescuerId], color);
    } 
    else 
    {
        console.log('Rescuer has no processed markers.');
    }
}

// Function to initiate the map and fetch the pins from the server
function initializeMap()
{
        map = L.map('map').setView([38.2466, 21.7346], 14);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    
    // Fetch the base pin location from the server when the page loads
    fetch('../PHP/base_pin.php')
        .then(response => response.json())
        .then(data => 
        {
            // Fetching the all the pins from the server
            if (data.basePin)
            {
                // If the server has a base pin location, add a marker on the map
                var baseIcon = L.icon({
                    iconUrl: '../Resources/home.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                });

                baseMarker = L.marker([data.basePin.latitude, data.basePin.longitude], {icon: baseIcon})
                .bindPopup('Base Station')
                .addTo(map);

                localStorage.setItem('baseMarkerData', JSON.stringify(baseMarker.getLatLng()));
            }

            if(data.rescuerPins)
            {
                //If the server has rescuer pins, add markers on the map
                var rescuerIcon = L.icon({
                    iconUrl: '../Resources/car.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                });

                data.rescuerPins.forEach(pin =>
                    {
                        var rescuerMarker = L.marker([pin.latitude, pin.longitude], {icon: rescuerIcon})
                        .bindPopup('<b>Vehicle: ' + pin.username + '<br>Product: ' + pin.product + '<br>Quantity: ' + pin.quantity + '</b>')
                        .addTo(map);

                        //Create an object to store the rescuer markers with rescuer id as key
                        rescuerMarkers[pin.citizen_id] = rescuerMarker;

                        //Check if the rescuer has an active task
                        if(pin.citizen_id === pin.req_takenby || pin.citizen_id === pin.off_takenby)
                        { 
                            //Add the marker to the active tasks layer
                            activeTasksLayer.addLayer(rescuerMarker);
                        }
                        else if(pin.req_takenby === null && pin.of_takenby === null)
                        {
                            //Add the marker to the inactive tasks layer
                            inactiveTasksLayer.addLayer(rescuerMarker);
                        }

                        //Adding click event on the rescuer marker
                        rescuerMarker.on('click', function()
                        {
                            handleRescuerMarkerClick(pin.citizen_id, rescuerMarkers, processedRequests, processedOffers);
                        });
                    });
            }

            if(data.pendingRequests)
            {
                //If the server has pending request pins, add markers on the map
                var pendingRequestIcon = L.icon({
                    iconUrl: '../Resources/pending_request.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                });

                data.pendingRequests.forEach(pin =>
                    {
                        var pendingRequestMarker = L.marker([pin.latitude, pin.longitude], {icon: pendingRequestIcon})
                        .bindPopup('<b>Name: ' + pin.first_name + '<br>Last Name: ' + pin.last_name + '<br>Phone: ' + pin.phone +  '<br>Request\'s Date: ' 
                        + pin.registration_date +'<br>Product: ' + pin.product + '<br>Quantity: ' + pin.numOfPersons)
                        .addTo(map);

                        // Add the marker to the pending requests layer
                        pendingRequestsLayer.addLayer(pendingRequestMarker);
                    });
            }

            if(data.pendingOffers)
            {
                //If the server has pending offer pins, add markers on the map
                var pendingOfferIcon = L.icon({
                    iconUrl: '../Resources/pending_offer.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                });

                data.pendingOffers.forEach(pin =>
                    {
                        var pendingOfferMarker = L.marker([pin.latitude, pin.longitude], {icon: pendingOfferIcon})
                        .bindPopup('<b>Name: ' + pin.first_name + '<br>Last Name: ' + pin.last_name + '<br>Phone: ' + pin.phone +  '<br>Product: ' + 
                        pin.product + '<br>Registration Date: ' + pin.registration_date + '<br>Quantity: ' + pin.quantity + '</b>')
                        .addTo(map);

                        // Add the marker to the pending offers layer
                        pendingOffersLayer.addLayer(pendingOfferMarker);
                    });
            }

            if(data.processedRequests)
            {
                //If the server has processed request pins, add markers on the map
                var processedRequestIcon = L.icon({
                    iconUrl: '../Resources/processed_request.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                });

                data.processedRequests.forEach(pin =>
                    {
                        var processedRequestMarker = L.marker([pin.latitude, pin.longitude], {icon: processedRequestIcon})
                        .bindPopup('<b>Name: ' + pin.first_name + '<br>Last Name: ' + pin.last_name + '<br>Phone: ' + pin.phone +  '<br>Request\'s Date: '
                        + pin.registration_date +'<br>Product: ' + pin.product + '<br>Quantity: ' + pin.numOfPersons + '<br>Withdrawal Date: ' + pin.withdrawal_date + '</b>')
                        .addTo(map);

                        // Add the marker to the processed requests layer
                        processedRequestsLayer.addLayer(processedRequestMarker);

                        // Check if the key (rescuerId) exists, if not, create an array for it
                        if (!processedRequests[pin.taken_by]) 
                        {
                            processedRequests[pin.taken_by] = [];
                        }
                        
                        // Push the processed request marker into the array
                        processedRequests[pin.taken_by].push(processedRequestMarker);

                        processedRequestMarker.on('click', function()
                        {
                            handleProcessedMarkerClick(pin.taken_by, processedRequests, 'green');
                        });
                    });
            }

            if(data.processedOffers)
            {
                //If the server has processed offer pins, add markers on the map
                var processedOfferIcon = L.icon({
                    iconUrl: '../Resources/processed_offer.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                });

                data.processedOffers.forEach(pin =>
                    {
                        var processedOfferMarker = L.marker([pin.latitude, pin.longitude], {icon: processedOfferIcon})
                        .bindPopup('<b>Name: ' + pin.first_name + '<br>Last Name: ' + pin.last_name + '<br>Phone: ' + pin.phone  + '<br>Request\'s Date: ' 
                        + pin.registration_date + '<br>Product: ' + pin.product + '<br>Quantity: ' + pin.quantity +  '<br>Withdrawal Date: '+ pin.withdrawal_date +'</b>')
                        .addTo(map);

                        // Add the marker to the processed offers layer
                        processedOffersLayer.addLayer(processedOfferMarker);

                        //Check if the key (rescuerId) exists, if not, create an array for it
                        if (!processedOffers[pin.taken_by]) 
                        {
                            processedOffers[pin.taken_by] = [];
                        }

                        //Push the processed offer marker into the array
                        processedOffers[pin.taken_by].push(processedOfferMarker);

                        processedOfferMarker.on('click', function()
                        {
                            handleProcessedMarkerClick(pin.taken_by, processedOffers, 'blue');
                        });
                    });
                }

                // Add all existing layers to the initialMapLayers
                map.eachLayer(layer => 
                {
                    if (layer instanceof L.Marker || layer instanceof L.Polyline) 
                    {
                        initialMapLayers.addLayer(layer);
                    }
                });
        })
            .catch(error => 
            {
                console.error('Error:', error);
            });
}

// Function to make the base pin draggable
function makePinDraggable()
{
    var option = window.confirm('Are you sure you want to change the base location?');
    if(option)
    {
        // Enable dragging for the baseMarker only if not already enabled
        if (!baseMarker.dragging.enabled()) 
        {
            baseMarker.dragging.enable();

            // Add a dragend event listener to the marker only if not already added
            if (!baseMarker.hasEventListeners('dragend')) 
            {
                baseMarker.on('dragend', function (event) 
                {
                    var newLatLng = event.target.getLatLng();
                    updateBaseLocation(newLatLng);
                });
            }
        }
    }
}

// Function to update the base location
function updateBaseLocation(newLatLng)
{
    // Send the base location to the server
    fetch('../PHP/base_pin.php',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `latitude=${newLatLng.lat}&longitude=${newLatLng.lng}`,
    });

    // Inform the user about the update and marker addition
    alert('Base location updated to: ' + newLatLng.lat + ', ' + newLatLng.lng + '\nMarker added at this location.');
    
    // Disable dragging after updating the location
    baseMarker.dragging.disable();
}

// Function to toggle the visibility of the add category form
function toggleAddCategoryForm() 
{
    var addCategoryForm = document.getElementById('categoryFormSection');
    addCategoryForm.style.display = 'block'
}

// Function to toggle the visibility of the modify products form
function toggleModifyForm() 
{
    var modifyFormSection = document.getElementById('modifyFormSection');
    modifyFormSection.style.display = 'block';
}

// Function to hide the add category form
function hideCategoryForm() 
{
    var addCategoryForm = document.getElementById('categoryFormSection');
    var newCategoryInput = document.getElementById('newCategoryName');

    // Remove the 'required' attribute before hiding the form
    newCategoryInput.removeAttribute('required');

    addCategoryForm.style.display = 'none'
}

// Function to hide the modify products form
function hideModifyForm()
{
    var modifyFormSection = document.getElementById('modifyFormSection');
    var selectedCategory = document.getElementById('selectedCategory');
    var selectedProduct = document.getElementById('selectedProduct');
    var modifyDetails = document.getElementById('modifyDetails');
    var modifyQuantity = document.getElementById('modifyQuantity');

    // Remove the 'required' attribute before hiding the form
    selectedCategory.removeAttribute('required');
    selectedProduct.removeAttribute('required');
    modifyDetails.removeAttribute('required');
    modifyQuantity.removeAttribute('required');

    modifyFormSection.style.display = 'none';
}

//Function to handle the form submission and insert product into the database
function uploadProduct()
{
    var selectedCategory = document.getElementById('category').value;
    var product = document.getElementById('product').value;
    var details = document.getElementById('details').value;
    var quantity = document.getElementById('quantity').value;

    if (selectedCategory.trim() === '')
    {
        alert('Category can not be empty!');
        return false; // Prevent form submission
    }
    
    // Check if the product name is empty
    if (product.trim() === '')
    {
        alert('Product name can not be empty!');
        return false; // Prevent form submission
    }

    // Check if the product quantity is empty
    if (quantity.trim() === '') 
    {
        alert('Product quantity can not be empty!');
        return false; // Prevent form submission
    }

    if (quantity <= 0)
    {
        alert('Product quantity must be greater than 0!');
        return false; // Prevent form submission
    }

    // Make an AJAX request to the PHP script
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../PHP/add_product.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () 
    {
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            // Handle the response from the PHP script
            document.getElementById('product').value = '';
            document.getElementById('details').value = '';
            document.getElementById('quantity').value = '';
            alert(xhr.responseText);
        }
    };

    // Send the product details to the PHP script
    xhr.send('selectedCategory=' + encodeURIComponent(selectedCategory) + '&product=' + encodeURIComponent(product) + '&details=' + encodeURIComponent(details) + '&quantity=' + encodeURIComponent(quantity));
    return false;
}

// Function to handle the form submission and insert category into the database
function uploadCategory() 
{
    var newCategoryName = document.getElementById('newCategoryName').value;

    // Check if the category name is empty
    if (newCategoryName.trim() === '') 
    {
        alert('Category name can not be empty!');
        return false; // Prevent form submission
    }

    // Make an AJAX request to the PHP script
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../PHP/add_category.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () 
    {
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            // Handle the response from the PHP script
            document.getElementById('newCategoryName').value = '';
            var response = JSON.parse(xhr.responseText);
            alert(response.message);
        }
    };

    // Send the category name to the PHP script
    xhr.send('newCategoryName=' + encodeURIComponent(newCategoryName));
}

// Function to fetch and populate categories in the dropdown lists
function populateCategoriesDropdown() 
{
    var categoryDropdown = document.getElementById('category');
    var selectedCategoryDropdown = document.getElementById('selectedCategory');
    var tableSelectedCategoryDropdown = document.getElementById('categorySelect');
    var announcementCategoryDropdown = document.getElementById('announcementCategory');

    // Make an AJAX request to the PHP script for fetching categories
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../PHP/fetch_categories.php', true);
    xhr.onreadystatechange = function () 
    {
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            // Try to parse the response as JSON
            var categories = JSON.parse(xhr.responseText);
            
            // Populate the dropdown with fetched categories
            categories.forEach(function (category)
            {
                var option = document.createElement('option');
                option.value = category.name;
                option.text = category.name;

                categoryDropdown.add(option);
                selectedCategoryDropdown.add(option.cloneNode(true));
                tableSelectedCategoryDropdown.add(option.cloneNode(true));
                announcementCategoryDropdown.add(option.cloneNode(true));
            });
            
        }
    };

    // Send the request to fetch categories
    xhr.send();
}

// Function to populate products in the modify form dropdown based on the selected category
function populateProductsDropdown() 
{
    var selectedCategory = document.getElementById('selectedCategory').value;
    var modifyProductDropdown = document.getElementById('selectedProduct');

    // Make an AJAX request to the PHP script for fetching products based on the selected category
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../PHP/fetch_products.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            // Handle the response from the PHP script
            var products = JSON.parse(xhr.responseText);

            // Clear existing options
            modifyProductDropdown.innerHTML = '';
            
            // Populate the dropdown with fetched products
            products.forEach(function (product) 
            {
                var option = document.createElement('option');
                option.value = product;
                option.text = product;

                modifyProductDropdown.add(option);
            });
        }
    };

    // Send the request to fetch products based on the selected category
    xhr.send('selectedCategory=' + encodeURIComponent(selectedCategory));
}

// Function to populate products in the announcement form dropdown based on the selected category
function populateAnnouncementProductsDropdown()
{
    var selectedCategory = document.getElementById('announcementCategory').value;
    var announcementProductDropdown = document.getElementById('announcementItems');

    // Make an AJAX request to the PHP script for fetching products based on the selected category
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../PHP/fetch_products.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () 
    {
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            console.log('xhr.responseText: ' + xhr.responseText);
            // Handle the response from the PHP script
            var products = JSON.parse(xhr.responseText);

            // Clear existing options
            announcementProductDropdown.innerHTML = '';
            
            // Populate the dropdown with fetched products
            products.forEach(function (product) 
            {
                var option = document.createElement('option');
                option.value = product;
                option.text = product;

                announcementProductDropdown.add(option);
            });
        }
    };

    // Send the request to fetch products based on the selected category
    xhr.send('selectedCategory=' + encodeURIComponent(selectedCategory));
}

function modifyForm()
{
    var selectedCategory = document.getElementById('selectedCategory').value;
    var selectedProduct = document.getElementById('selectedProduct').value;
    var modifiedDetails = document.getElementById('modifyDetails').value;
    var modifiedQuantity = document.getElementById('modifyQuantity').value;
    
    if(selectedProduct.trim() === '')
    {
        alert('Product can not be empty!');
        return false; // Prevent form submission
    }

    if (modifiedQuantity.trim() === '')
    {
        alert('Quantity can not be empty!');
        return false; // Prevent form submission
    }

    //Make an AJAX request to the PHP script
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../PHP/modify_product.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () 
    {
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            // Handle the response from the PHP script
            document.getElementById('modifyDetails').value = '';
            document.getElementById('modifyQuantity').value = '';

            var response = JSON.parse(xhr.responseText);
            alert(response.text);
        }
    };

    //Send the modified product details to the PHP script
    xhr.send('selectedCategory=' + encodeURIComponent(selectedCategory) + 
    '&selectedProduct=' + encodeURIComponent(selectedProduct) + 
    '&modifiedDetails=' + encodeURIComponent(modifiedDetails) + 
    '&modifiedQuantity=' + encodeURIComponent(modifiedQuantity)
    );
}

// Function to load items from the JSON file
function loadItemsFromJson()
{
    var option = window.confirm('Are you sure you want to load items from the JSON file?');
    if(option)
    {
        var xhr = new XMLHttpRequest();

        // Use the local proxy script
        var jsonUrl = '../PHP/proxy.php';

        xhr.open('GET', jsonUrl, true);
        xhr.onreadystatechange = function () 
        {
            if (xhr.readyState == 4 && xhr.status == 200) 
            {
                var response = JSON.parse(xhr.responseText);
                
                handleJsonData(response);
            }
        };

    xhr.send();
    }
}

// Function to handle the JSON data properly
function handleJsonData(data) 
{
    // Extract categories and items from the JSON data
    var categories = data.categories;
    var items = data.items;

    addJSONCategoriesToDatabase(categories);
    addJSONProductsToDatabase(items);

    alert('Items loaded from the JSON file successfully!');
}

// Function to save the categories of the JSON file to the database
function addJSONCategoriesToDatabase(categories)
{
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../PHP/jsonCategories_upload.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () 
    {
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            console.log(xhr.responseText);
        }
    };

    // Send the categories data to the PHP script
    xhr.send('categories=' + encodeURIComponent(JSON.stringify(categories)));
}

// Function to save the products of the JSON file to the database
function addJSONProductsToDatabase(items)
{
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../PHP/jsonProducts_upload.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () 
    {
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            console.log(xhr.responseText);
        }
    };

    // Send the products data to the PHP script
    xhr.send('products=' + encodeURIComponent(JSON.stringify(items)));
}

// Function to load the warehouse status from the JSON file
function viewWarehouseStatus()
{
    // Get the select element and table body
    var categorySelect = document.getElementById('categorySelect');
    var tableBody = document.getElementById('warehouseTableBody');

    // Get the selected category value
    var selectedCategory = categorySelect.value;

    // Clear the table body before populating it again
    tableBody.innerHTML = '';

    // Fetch warehouse status data from the server
    fetch('../PHP/warehouse_status.php?category=' + selectedCategory)
        .then(response => response.json())
        .then(data => 
            {
            // Check if data is available
            if (data && data.length > 0) 
            {
                // Iterate through the data and create table rows
                data.forEach(item => 
                {
                    var row = tableBody.insertRow();
                    // Create cells and populate data
                    var itemNameCell = row.insertCell(0);
                    itemNameCell.textContent = item.name;

                    var categoryCell = row.insertCell(1);
                    categoryCell.textContent = item.quantity;

                    var quantityCell = row.insertCell(2);
                    quantityCell.textContent = item.source;
                });
            } 
            else 
            {
                // Display a message if no data is available
                var noDataRow = tableBody.insertRow();
                var noDataCell = noDataRow.insertCell(0);
                noDataCell.textContent = 'No data available.';
                noDataCell.colSpan = 3;
            }
        })
        .catch(error => 
        {
            console.error('Error fetching warehouse status:', error);
            // Display an error message if there is an issue with the fetch
            var errorRow = tableBody.insertRow();
            var errorCell = errorRow.insertCell(0);
            errorCell.textContent = 'Error fetching warehouse status.';
            errorCell.colSpan = 3; 
        });
}

// Function to upload an announcement 
function createAnnouncements()
{
    var product = document.getElementById('announcementItems').value;
    var category = document.getElementById('announcementCategory').value;
    var quantity = document.getElementById('offerQuantity').value;

    // Send data to the server using AJAX (similar to previous examples)
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../PHP/upload_announcements.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () 
    {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            // Handle the server response if needed
            var response = JSON.parse(xhr.responseText);
            alert(response.message);
        }
    };
    
    // Customize the data you want to send to the server
    var data = 'product=' + encodeURIComponent(product) + '&category=' + encodeURIComponent(category) + '&quantity=' + encodeURIComponent(quantity);
    xhr.send(data);
}

// Function to display the map
function displayMap()
{
    // Creating map options
    var mapOptions = {
        center: [38.2466, 21.7346],
        zoom: 15
    }
     
    // Creating a map object
    var new_map = new L.map('map', mapOptions);
    var clickedCoordinates;
     
    // Creating a Layer object
    var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
     
    // Adding layer to the map
    new_map.addLayer(layer);
    
    var baseMarkerData = JSON.parse(localStorage.getItem('baseMarkerData'));
    if (baseMarkerData)
    {
        var baseIcon = L.icon({
            iconUrl: '../Resources/home.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        
        var base = L.marker([baseMarkerData.lat, baseMarkerData.lng], {icon: baseIcon}).addTo(new_map).bindPopup('Base');
    }

    var rescuer_marker = null;

    new_map.on('click', function (e) 
    {
        if(!rescuer_marker)  
        {
            // Save the coordinates to the variable
            clickedCoordinates = e.latlng;
            localStorage.setItem('clickedCoordinates', JSON.stringify(e.latlng));
            // Create a new marker at the clicked location
            rescuer_marker = L.marker(clickedCoordinates).addTo(new_map);

            // Bind a popup to the marker with coordinates
            base.bindPopup("Base Marker at " + base.toString()).openPopup();

            // Bind a popup to the marker with coordinates
            rescuer_marker.bindPopup("Marker at " + clickedCoordinates.toString()).openPopup();

            // Calculate distance between base and rescuer markers
            var baseLatLng = base.getLatLng();
            var rescuerLatLng = rescuer_marker.getLatLng();
            var distance = calculateDistance(baseLatLng, rescuerLatLng);

            if(!distance)
            {
                alert('Rescuer is not within 5km of the base.');  
                //Reload the page
                location.reload();
            }
            // Remove the ability for putting two pins
            new_map.off('click');
        }
    });
}

function calculateDistance(baseMarker, rescuerMarker) 
{
    // Calculate the distance in meters using Leaflet's distance method
    const distance = rescuerMarker.distanceTo(baseMarker);
    console.log(distance);

    // Check if the distance is less than 100 meters
    return distance < 5000;
}

// Function to save the pin to the database
function savePin()
{
    var rescuerMarkerData = JSON.parse(localStorage.getItem('clickedCoordinates'));
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../PHP/send_rescuer_pin.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            // Handle the response from the PHP script
            console.log(xhr.responseText);
            //close the popup
            alert('Pin saved successfully!');
            // Refresh the parent page to see the new pin
            window.opener.location.reload();
            window.close();
        }
    };

    // Send the pin data to the PHP script
    xhr.send('latitude=' + encodeURIComponent(rescuerMarkerData.lat) + '&longitude=' + encodeURIComponent(rescuerMarkerData.lng));
}