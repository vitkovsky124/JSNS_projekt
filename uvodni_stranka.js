const startLink = document.querySelector("#startGame");
const playerChoices = document.querySelectorAll('input[name="players"]');
const difficultyPicker = document.querySelector("#difficultyPicker");
const difficultyChoice = document.querySelector("#botDifficulty");

function updateStartLink() {
  const selectedPlayers = document.querySelector('input[name="players"]:checked')?.value || "1";
  const botEnabled = selectedPlayers === "1";
  difficultyPicker.hidden = !botEnabled;
  startLink.href = `pexeso.html?players=${selectedPlayers}&difficulty=${difficultyChoice.value}`;
}

playerChoices.forEach((choice) => choice.addEventListener("change", updateStartLink));
 difficultyChoice.addEventListener("change", updateStartLink);
updateStartLink();
