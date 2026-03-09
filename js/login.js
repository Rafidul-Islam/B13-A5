document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  if (username === "admin" && password === "admin123") {
    sessionStorage.setItem("github-issues-auth", "true");
    window.location.href = "../dashboard/dashboard.html";
  } else {
    alert("Invalid username or password.");
  }
});
