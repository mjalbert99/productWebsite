document.addEventListener("DOMContentLoaded", function(event){

    const update_email = document.querySelector("#update_email");
    const update_username = document.querySelector("#update_username");
    const update_password = document.querySelector("#update_password");

    // Add function that grabs account info on page load
    // that displays current username and email
    // Live update when changed


    update_email.addEventListener("submit", function (event){
        event.preventDefault();
        const old_email = update_email.querySelector("#old_email").value;
        const new_email = update_email.querySelector("#new_email").value;
        const s_id = sessionStorage.getItem("session_id");

        const jData = {
            old: old_email,
            new: new_email,
            id: s_id
        }

        fetch("/updateEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(jData)
        })
        .then(response => response.json())
        .then(data => {
            // Wrong info
            if( data == 1){
                alert("Old email incorrect")
            }
            else if( data == 2){
                alert("New email not available")
            }
            // Updated
            else{
                alert("Updated email")
                update_email.reset();
            }
        })
        .catch(error => {
          console.error(error);
        });

    });

    update_username.addEventListener("submit", function (event){
        event.preventDefault();
        const old_username = update_username.querySelector("#old_username").value;
        const new_username = update_username.querySelector("#new_username").value;
        const s_id = sessionStorage.getItem("session_id");

        const jData = {
            old: old_username,
            new: new_username,
            id: s_id
        }

        fetch("/updateUsername", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(jData)
        })
        .then(response => response.json())
        .then(data => {
            // Wrong info
            if( data == 1){
                alert("Old username incorrect")
            }
            else if( data == 2){
                alert("New username not available")
            }
            // Updated
            else{
                alert("Updated username")
                update_username.reset();
            }
        })
        .catch(error => {
          console.error(error);
        });

    });

    update_password.addEventListener("submit", function (event){
        event.preventDefault();
        const old_password = update_password.querySelector("#old_password").value;
        const new_password = update_password.querySelector("#new_password").value;
        const s_id = sessionStorage.getItem("session_id");

        const jData = {
            old: old_password,
            new: new_password,
            id: s_id
        }

        fetch("/updatePassword", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(jData)
        })
        .then(response => response.json())
        .then(data => {
            // Wrong info
            if( data == 1){
                alert("Old password incorrect")
            }
            // Updated
            else{
                alert("Updated password")
                update_password.reset();
            }
        })
        .catch(error => {
          console.error(error);
        });

    });
});