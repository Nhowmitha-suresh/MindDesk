function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!user || !pass) {
    alert("Please enter name and password");
    return;
  }

  const session = {
    user,
    loginTime: new Date().toISOString()
  };

  localStorage.setItem("minddesk_session", JSON.stringify(session));
  location.href = "dashboard.html";
}

function logout() {
  localStorage.clear();
  location.href = "index.html";
}
