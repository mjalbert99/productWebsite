document.addEventListener("DOMContentLoaded", function (event){
    const recoveryForm = document.querySelector(".recovery_form");

    // Adds new user into SQL table
    recoveryForm.addEventListener("submit", function (event){
        event.preventDefault();

        // Collects form data
        const f_name = document.querySelector("#first_name").value;
        const l_name = document.querySelector("#last_name").value;
        const pid = document.querySelector("#PID").value;
        const email = document.querySelector("#email").value;
        const u_name = document.querySelector("#username").value;
        const n_p_word = document.querySelector("#new_password").value;
        // Puts form data into json
        const jData = {
            first_name: f_name,
            last_name: l_name,
            PID: pid,
            email: email,
            user_name: u_name,
            password: n_p_word
        }
        // Calls server backend to add user to table
        fetch("/recoverUser", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(jData)
        })
        .then(response => response.json())
        .then(data => {
            // If update fails
            if(data == false){
                alert("Couldn't Find a Registered Account with the Given Info");
            }
            // Update works
            else{
                alert("Password Updated");
                recoveryForm.reset();
                // Redirect to login page
                window.location.href = "/login";
            }
        })
        .catch(error => {
          console.error(error);
        });
    });

});