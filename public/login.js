document.addEventListener("DOMContentLoaded", function (event){
    const loginForm = document.querySelector(".login_form");

    // Adds new user into SQL table
    loginForm.addEventListener("submit", function (event){
        event.preventDefault();

        // Collects form data
        const u_name = document.querySelector("#username").value;
        const p_word = document.querySelector("#password").value;

        // Puts form data into json
        const jData = {
            user_name: u_name,
            password: p_word
        }

        // Calls server backend to add user to table
        fetch("/checkLogin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(jData)
        })
        .then(response => response.json())
        .then(data => {
            // Wrong login info
            if( data == -999){
                alert("Incorrect Login Info")
            }
            // Correct login info
            else{
                loginForm.reset();
                const id = data;
                sessionStorage.setItem('session_id', id);
                window.location.href = "/profile";
            }
        })
        .catch(error => {
          console.error(error);
        });
    });

});