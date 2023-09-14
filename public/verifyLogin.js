// Stops not logged-in users from reaching sensitive pages
const s_id = sessionStorage.getItem("session_id");
if (s_id == null){
        window.location.href = "/login";
}
