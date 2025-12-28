function showForm(type) {
  const forms = ["loginForm", "registerForm", "forgotForm"];
  const tabs = document.querySelectorAll(".tab");

  forms.forEach(id => {
    document.getElementById(id).classList.add("hidden");
  });

  tabs.forEach(tab => tab.classList.remove("active"));

  if (type === "login") {
    document.getElementById("loginForm").classList.remove("hidden");
    tabs[0].classList.add("active");
  }

  if (type === "register") {
    document.getElementById("registerForm").classList.remove("hidden");
    tabs[1].classList.add("active");
  }

  if (type === "forgot") {
    document.getElementById("forgotForm").classList.remove("hidden");
    tabs[2].classList.add("active");
    resetForgot();
  }
}

function showForgotStep2() {
  document.getElementById("forgotStep1").classList.add("hidden");
  document.getElementById("forgotStep2").classList.remove("hidden");
}

function resetForgot() {
  document.getElementById("forgotStep1").classList.remove("hidden");
  document.getElementById("forgotStep2").classList.add("hidden");
}

function toggleMode() {
  document.body.classList.toggle("dark");
}