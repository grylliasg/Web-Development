// Function that validates register credentials
function validateRegistration() 
{
    var form = document.getElementById("register");
    var fname = form.fname.value.trim();
    var lname = form.lname.value.trim();
    var username = form.username.value.trim();
    var password = form.password.value.trim();
    var verifyPassword = form.confirm_password.value.trim();
    var phone = form.phone.value.trim();

    // Get the error message elements
    var fnameError = document.getElementById("fname_error");
    var lnameError = document.getElementById("lname_error");
    var usernameError = document.getElementById("username_error");
    var passwordError = document.getElementById("password_error");
    var verifyPasswordError = document.getElementById("confirm_password_error");
    var phoneError = document.getElementById("phone_error");

    // Initialize the error messages to empty strings
    fnameError.textContent = "";
    lnameError.textContent = "";
    usernameError.textContent = "";
    passwordError.textContent = "";
    verifyPasswordError.textContent = "";
    phoneError.textContent = "";

    // Validate first name and last name (letters only)
    if(!/^[a-zA-Z]+$/.test(fname))
    {
        fnameError.textContent = "First name must contain only letters!";
        return;
    }

    if(!/^[a-zA-Z]+$/.test(lname))
    {
        lnameError.textContent = "Last name must contain only letters!";
        return;
    }

    // Validate username (only letters, numbers, underscores, dashes and between 3 and 15 characters)
    if(!/^[a-zA-Z0-9_-]{3,15}$/.test(username))
    {
        usernameError.textContent = "Username 3 - 15 chars (numbers, -, )";
        return;
    }

    // Validate password (at least 6 characters, at least one letter and one number)
    if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password))
    {
        passwordError.textContent = "Password 6 chars with at least one letter and one number!";
        return;
    }

    // Validate verify password (must match password)
    if(password !== verifyPassword)
    {
        verifyPasswordError.textContent = "Passwords do not match!";
        return;
    }

    // Validate phone number (digits only and exactly 10-15 characters)
    if(!/^\d{10,15}$/.test(phone))
    {
        phoneError.textContent = "Phone number only digits and 10 - 15 chars!";
        return;
    }
    
    var formData = new FormData(form);

    fetch("../PHP/register.php",
    {
        method: "POST",
        body: formData,
    })
        .then(response => response.text())
        .then(data => 
        {  
            if (data.includes("success"))
            {
                // Clear form
                form.reset();
                window.location = "pin.html";

            }
            else if(data.includes("taken"))
            {
                username.textContent = "Username already taken!";
            }
        })
        .catch(error =>
        {
            console.error("Fetch error:", error);
            document.getElementById("registration_msg").textContent = "An error occurred during registration.";
        });
}

// Function that validates login credentials
function validateLogin() 
{
    var formData = new FormData(document.getElementById("login"));

    fetch("../PHP/login.php",
    {
        method: "POST",
        body: formData,
    })
        .then(response => response.text())
        .then(data =>
        {
            var login_msg = document.getElementById("login_msg");

            if (data.includes("citizen"))
            {
                localStorage.setItem("check-citizen", "selected");
                window.location.replace("citizen.html");
                //Clear form
                document.getElementById("login").reset()
                login_msg.textContent = "";
            }
            else if(data.includes("rescuer"))
            {
                localStorage.setItem("check-resquer", "selected");
                window.location.replace("rescuer.html");
                //Clear form
                document.getElementById("login").reset()
                login_msg.textContent = "";
            }
            else if(data.includes("admin"))
            {
                localStorage.setItem("check-admin", "selected");
                window.location.replace("admin.html");
                //Clear form
                document.getElementById("login").reset()
                login_msg.textContent = "";
            }
            else if (data.includes("error"))
            {
                login_msg.textContent = "Invalid username or password!";
                login_msg.style.color = "red";
            }
        })
        .catch(error => 
        {
            console.error("Fetch error:", error);
            document.getElementById("login_msg").textContent = "An error occurred during login.";
        });

}

// Function to create a new rescuer account and show the modal
function createRescuerAcc()
{
    // Open a new window with the specified URL
    var popupWindow = window.open('rescuerRegistration.html', 'Rescuer Registration', 'width=500,height=500');
    
    // Wait for the new window to finish loading
    popupWindow.onload = function() 
    {
        //Focus the new window
        popupWindow.focus();        
        // Access the form in the popup window
        var formInPopup = popupWindow.document.getElementById('rescuerForm');

        // Check if the form exists before attempting to set onsubmit
        if (formInPopup) 
        {
            formInPopup.onsubmit = function() 
            {
                var formData = new FormData(formInPopup);

                fetch('../PHP/rescuer_register.php',
                {
                    method: 'POST',
                    body: formData,
                })
                .then(response => response.json())
                .then(data => 
                {
                    if(data)
                    {
                        popupWindow.location.href = 'rescuer_pin.html';
                        popupWindow.focus();
                    }
                })
                .catch(error => 
                {
                    console.error('Fetch error:', error);
                    alert('An error occurred during registration.');
                });      
            }
        }
        else
        {
            console.error('Form not found in popup window');
        }
    }
}