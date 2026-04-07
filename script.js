const button = document.getElementById("thisButton");

button.addEventListener("click", function () {
  document.getElementById("message").innerText = "button was clicked";
});