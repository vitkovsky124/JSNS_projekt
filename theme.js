(() => {
  const button = document.querySelector(".theme-toggle");
  const savedTheme = localStorage.getItem("pexeso-theme");
  if (savedTheme === "dark") document.documentElement.dataset.theme = "dark";

  function updateButton() {
    const dark = document.documentElement.dataset.theme === "dark";
    button.textContent = dark ? "☀️ Světlý režim" : "🌙 Tmavý režim";
    button.setAttribute("aria-pressed", String(dark));
  }

  button.addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("pexeso-theme", dark ? "dark" : "light");
    updateButton();
  });
  updateButton();
})();
