document.addEventListener("DOMContentLoaded", function (event){
    const registerForm = document.querySelector(".register_form");

    // Adds new user into SQL table
    registerForm.addEventListener("submit", function (event){
        event.preventDefault();

        // Collects form data
        const f_name = document.querySelector("#first_name").value;
        const l_name = document.querySelector("#last_name").value;
        const pid = document.querySelector("#PID").value;
        const email = document.querySelector("#email").value;
        const u_name = document.querySelector("#username").value;
        const p_word = document.querySelector("#password").value;
        // Puts form data into json
        const jData = {
            first_name: f_name,
            last_name: l_name,
            PID: pid,
            email: email,
            user_name: u_name,
            password: p_word
        }
        // Calls server backend to add user to table
        fetch("/registerUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(jData)
        })
        .then(response => response.json())
        .then(data => {
            // Throws alert if email is already registered
          if (data == 1) {
            alert("Email already in use");
          }
          // Throws alert if username is already registered
          else if(data == 2) {
           alert("Username already in use");
          }
          // Clears form when account registered correctly
          else{
              alert("Account Registered!");
            registerForm.reset();
            //Redirect to login page
            window.location.href = "/login";
          }
        })
        .catch(error => {
          console.error(error);
        });
    });

});