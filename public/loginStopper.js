// Stops logged-in user from accessing the login in page,
// register page, and forgot password page
const s_id = sessionStorage.getItem("session_id");
if (s_id != null){
        window.location.href = "/profile";
}

