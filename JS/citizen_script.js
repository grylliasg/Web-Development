// Function to fetch and show the requests about the citizen
function showRequests() {
    var xhr = new XMLHttpRequest();
        xhr.open("GET", "../PHP/fetch_requests.php", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // Parse the JSON response (adjust as per your data format)
                var responseData = JSON.parse(xhr.responseText);

                var requests = document.getElementById('requests');

                // Print the data
                if (responseData.length === 0) {
                    requests.innerHTML += "You haven't submitted a request yet.";
                    }
                for (var i = 0; i < responseData.length; i++) {
                    requests.innerHTML += '<span style="text-decoration: underline;">Request:</span>' + '<br>';
                    requests.innerHTML += 'Category: ' + responseData[i].category + '<br>';
                    requests.innerHTML += 'Product: ' + responseData[i].product + '<br>';
                    requests.innerHTML += 'Persons: ' + responseData[i].numofPersons + '<br>';
                    requests.innerHTML += 'Date: ' + responseData[i].registration_date + '<br>';
                    requests.innerHTML += 'Status: ' + (responseData[i].approved == 0 ? '<span style="color:red;">Not Approved</span>' + " / " : '<span style="color:green;">Approved</span>' +  " / " );
                    requests.innerHTML +=(responseData[i].processed == 0 ? '<span style="color:red;">Not Processed</span>' : '<span style="color:green;">Processed</span>') + '<br>';
                    if(responseData[i].withdrawal_date != null)
                    {
                        requests.innerHTML += 'Delivery date: ' + responseData[i].withdrawal_date + '<br><br>';
                    }
                    else {
                        requests.innerHTML += '<br>';
                    }
                }          
            }
        };
        xhr.send();
}

function showOffers() {
    var xhr = new XMLHttpRequest();
        xhr.open("GET", "../PHP/fetch_offers.php", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // Parse the JSON response (adjust as per your data format)
                var responseData = JSON.parse(xhr.responseText);

                var offers = document.getElementById('offers');

                // Print the data
                if (responseData.length === 0) {
                    offers.innerHTML += "You haven't submitted an offer yet.";
                    document.getElementById("cancelButton").style.display = 'none';
                    }
                
                let flag = 1; // an to flag ginei 1 den tha yparxei to button submit

                for (var i = 0; i < responseData.length; i++) {                           
                    console.log('ID: ' + responseData[i].id);
                    offers.innerHTML += '<span style="text-decoration: underline;">Offer:</span>' + '<br>';
                    offers.innerHTML += 'Category: ' + responseData[i].category + '<br>';
                    offers.innerHTML += 'Product: ' + responseData[i].product + '<br>';
                    offers.innerHTML += 'Quantity: ' + responseData[i].quantity + '<br>';
                    offers.innerHTML += 'Status: ' + (responseData[i].approved == 0 ? (flag=0,'<span style="color:red;">Not Approved</span>') + " / " : '<span style="color:green;">Approved</span>' +  " / " );
                    offers.innerHTML +=(responseData[i].processed == 0 ? '<span style="color:red;">Not Processed</span>' : '<span style="color:green;">Processed</span>') + '<br>';       
                
                    if(responseData[i].withdrawal_date != null)
                    {
                        offers.innerHTML += 'Delivery date: ' + responseData[i].withdrawal_date + '<br><br>';
                    }
                    else {
                        offers.innerHTML += '<br>';
                    }

                if (responseData[i].approved == 0){
                // Radio button to select announcement
                var label1 = document.createElement('label1');
                label1.for = 'announcementRadio1';
                label1.textContent = 'Cancel offer: ';
                offers.appendChild(label1);

                var radio1 = document.createElement('input');
                radio1.type = 'radio';
                radio1.name = 'announcementRadio1'; // Same name for radio buttons to form a group
                radio1.value = responseData[i].id;
                offers.appendChild(radio1);
                offers.appendChild(document.createElement('br'));
                offers.appendChild(document.createElement('br')); 
               }
               offers.appendChild(document.createElement('br')); 
            }     

            if (flag == 1) {
                document.getElementById("cancelButton").style.display = 'none';
            }   
                               
            }  
        };
        xhr.send();  
}

function showAnnouncements() {
    var xhr = new XMLHttpRequest();
        xhr.open("GET", "../PHP/fetch_announcements.php", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // Parse the JSON response (adjust as per your data format)
                var responseData = JSON.parse(xhr.responseText);

                var announcements = document.getElementById('announcements');

                // Print the data
                if (responseData.length === 0) 
                    {
                    announcements.innerHTML += "There is not any available offer right now, please try again later...";
                    document.getElementById('submit-offer-button').style.display = 'none';
                    }
                for (var i = 0; i < responseData.length; i++) {                           
                    console.log('ID: ' + responseData[i].id);
                    announcements.innerHTML += '<span style="text-decoration: underline;">Announcement:</span>' + '<br>';
                    announcements.innerHTML += 'Category: ' + responseData[i].category + '<br>';
                    announcements.innerHTML += 'Product: ' + responseData[i].product + '<br>';
                    announcements.innerHTML += 'Quantity: ' + responseData[i].quantity + '<br>';
                    // Radio button to select announcement
                    var label = document.createElement('label');
                    label.for = 'announcementRadio';
                    label.textContent = 'Bind the announcement: ';
                    announcements.appendChild(label);

                    var radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = 'announcementRadio'; // Same name for radio buttons to form a group
                    radio.value = responseData[i].id;
                    announcements.appendChild(radio);
                    announcements.appendChild(document.createElement('br'));
                    announcements.appendChild(document.createElement('br'));
                }                           
            }  
        };
        xhr.send();  
        document.getElementById("next-button3").disabled = true;
        document.getElementById("next-button3").style.display = "none";
        document.getElementById("submit-offer-button").style.display = "block";
}

// Function to fetch categories, products, and persons and populate the dropdowns
function populateCategoriesAndProductsAndPersons() {
    populateCategories();
    populateProducts("food");
    populatePersons();
    document.getElementById("submitButton").style.display = "block";
    document.getElementById("autocompleteform").style.display = "block";
    // Disable the button after it's clicked (so it can be clicked only once)
    document.getElementById("next-button1").disabled = true;
    document.getElementById("next-button1").style.display = "none";
}

function submitRequest() {
    // Get selected values from dropdowns
    var categoryValue = document.getElementById("category").value;
    var productValue = document.getElementById("product").value;
    var personsValue = document.getElementById("persons").value;

    var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText); // Log the server response (for testing)
    }
};

    xmlhttp.open("POST", "../PHP/submit_request.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("categoryValue=" + categoryValue + "&productValue=" + productValue + "&personsValue=" + personsValue);
    alert('Your request has been sent!');
    location.reload();
}

function autocomplete() {
    document.getElementById("categoryLabel").style.display = 'none';
    document.getElementById("productLabel").style.display = 'none';
    document.getElementById("category").style.display = 'none';
    document.getElementById("product").style.display = 'none';
    document.getElementById("autocompleteform").style.display = 'none';
    document.getElementById("submitButton").style.display = 'none';
    document.getElementById("autocomplete").style.display = 'block';
    document.getElementById("persons").style.display = 'none';
    document.getElementById("personsLabel").style.display = 'none';


    var sugg = document.getElementById("suggestions");

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../PHP/fetch_all_products.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            // Parse the JSON response
            var products = JSON.parse(xhr.responseText);

            // Populate the dropdown options with category names            
            for (var i = 0; i < products.length; i++) {
                var productName = products[i].name;
                // Add category option
                var productOption = document.createElement("option");
                productOption.text = productName;
                sugg.appendChild(productOption);
            }
        }
    };
    xhr.send();

    document.getElementById("backk").style.display = 'block';

}

function backk() {
    location.reload();
}
    
// Function to fetch categories and populate the dropdown
function populateCategories() {
    var categoryDropdown = document.getElementById("category");
    var categoryLabel = document.getElementById("categoryLabel");
    
    // Fetch categories from the server using an AJAX request
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../PHP/fetch_categories.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            // Parse the JSON response
            var categories = JSON.parse(xhr.responseText);

            // Populate the dropdown options with category names            
            for (var i = 0; i < categories.length; i++) {
                var categoryName = categories[i].name;
                // Add category option
                var categoryOption = document.createElement("option");
                categoryOption.text = categoryName;
                categoryDropdown.add(categoryOption);
            }

            // Show the label and dropdown after populating options
            categoryLabel.style.display = "block";
            categoryDropdown.style.display = "block";

            // Add event listener 
            categoryDropdown.addEventListener("change", function () {
                // Call the populateProducts function with the selected category
                populateProducts(categoryDropdown.value);
            });
        }
    };
    xhr.send();
}

// Function to fetch categories and products and populate the dropdown
function populateProducts(selectedCategory) {
    
    var productDropdown = document.getElementById("product");
    var productLabel = document.getElementById("productLabel");

    // Fetch products from the server using an AJAX request
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "../PHP/fetch_products.php", true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Parse the JSON response
            var products = JSON.parse(xhr.responseText);
            console.log(products);

            // clear existing options
            productDropdown.innerHTML = "";

            // Populate the dropdown options with product names
            for (var i = 0; i < products.length; i++) {
                var productName = products[i];
                // Add product option
                var productOption = document.createElement("option");
                productOption.text = productName;
                productDropdown.add(productOption);                  
            }
            // Show the label and dropdown after populating options
            productLabel.style.display = "block";
            productDropdown.style.display = "block";                    
        }
    };
    xhr.send('selectedCategory=' + encodeURIComponent(selectedCategory));
}

// Function to populate the "Select Number of Persons" dropdown
function populatePersons() {
    var personsDropdown = document.getElementById("persons");
    var personsLabel = document.getElementById("personsLabel");

    for (var i = 1; i < 6; i++) {
        var persons = i;
        // Add product option
        var personsOption = document.createElement("option");
        personsOption.value = persons;
        personsOption.text = persons;
        personsDropdown.add(personsOption);
    }

    // Show the label and dropdown
    personsLabel.style.display = "block";
    personsDropdown.style.display = "block";
}

function submitOffer() {
console.log("radioButtons");
var radioButtons = document.getElementsByName('announcementRadio');
var selectedValue;

// Loop through the radio buttons to find the checked one
for (var i = 0; i < radioButtons.length; i++) {
    if (radioButtons[i].checked) {
        // Get the selected value
        selectedValue = radioButtons[i].value;
    }
}
var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
       if (this.readyState == 4 && this.status == 200) {
          console.log(this.responseText); // Log the server response (for testing)
 }
};

xmlhttp.open("POST", "../PHP/submit_offer.php", true);
xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
xmlhttp.send("selectedValue=" + selectedValue);
alert('Your offer has been sent!');
location.reload();
}

function cancelOffer() {
    var radioButtons = document.getElementsByName('announcementRadio1');
    var selectedValue;
    
    // Loop through the radio buttons to find the checked one
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            // Get the selected value
            selectedValue = radioButtons[i].value;
            console.log(selectedValue);
        }
    }
    var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
           if (this.readyState == 4 && this.status == 200) {
              console.log(this.responseText); // Log the server response (for testing)
     }
    };
    
    xmlhttp.open("POST", "../PHP/cancel_offer.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("selectedValue=" + selectedValue);
    alert('Your offer has been canceled!');
    location.reload();
}

function disableDirectAccess() {
    // Check if the variable has been saved in script.js (validateLogin)
    var value = localStorage.getItem("check-citizen");
    console.log(value);

    // If not, the user tries to log in without the log in form
    if(value != 'selected') {
        window.location.replace("index.html");
    }
}

// Set a timeout to clear local storage after 10 minutes (10 * 60 * 1000 milliseconds)
setTimeout(function() {
    // Clear local storage
    localStorage.clear();
    console.log('Local storage cleared after 10 minutes');
}, 10 * 60 * 1000);