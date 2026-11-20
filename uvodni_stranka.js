const startLink = document.querySelector("#startGame");
const playerChoices = document.querySelectorAll('input[name="players"]');

function updateStartLink() {
  const selectedPlayers = document.querySelector('input[name="players"]:checked')?.value || "1";
  startLink.href = `pexeso.html?players=${selectedPlayers}`;
}

playerChoices.forEach((choice) => choice.addEventListener("change", updateStartLink));
updateStartLink();
