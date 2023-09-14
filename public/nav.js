// Used to change the navigation bar based on the login status
document.addEventListener("DOMContentLoaded", function (event){

  const s_id = sessionStorage.getItem("session_id");
  const nav = document.querySelector(".nav_list");

  if (s_id == null) {
    // User is not logged in
    nav.innerHTML = `
      <a href="/">Home</a>
      <a href="/login">Login</a>
    `;
  } else {
    // User is logged in
    nav.innerHTML = `
      <a href="/">Home</a>
      <a href="/mvp">MVP</a>
      <a href="/leaderboard">Leaderboard</a>
      <a href="/profile">Profile</a>
      <label id="log_out_button">Logout</label>
    `;

    // Get the Logout button element
    const logoutBtn = document.querySelector("#log_out_button");

      jData = {
        id: s_id
      }

    // Attach the onclick event listener
    logoutBtn.addEventListener("click", function() {
        // Calls server backend to add user to table
        fetch("/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(jData)
        })
        .then(response => response.json())
        .then(data => {
          console.log(data);
        })
        .catch(error => {
          console.error(error);
        });

       // Deletes session
      sessionStorage.removeItem("session_id");
      // Redirect the user to the login page
      window.location.href = "/login";
    });
  }
});

