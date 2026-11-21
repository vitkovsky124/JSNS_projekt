const startLink = document.querySelector("#startGame");
const playerChoices = document.querySelectorAll('input[name="players"]');
<<<<<<< HEAD
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
=======
const playerNames = document.querySelector("#playerNames");
const setupParams = new URLSearchParams(window.location.search);
const requestedPlayers = Number(setupParams.get("players"));
let pendingNames = setupParams.getAll("name");

if (Number.isInteger(requestedPlayers) && requestedPlayers >= 1 && requestedPlayers <= 4) {
  const requestedChoice = [...playerChoices].find((choice) => Number(choice.value) === requestedPlayers);
  if (requestedChoice) requestedChoice.checked = true;
}

function updateStartLink() {
  const selectedPlayers = Number(document.querySelector('input[name="players"]:checked')?.value || 1);
  const params = new URLSearchParams({ players: String(selectedPlayers) });
  playerNames.querySelectorAll("input").forEach((input) => params.append("name", input.value.trim()));
  startLink.href = `pexeso.html?${params.toString()}`;
}

function renderPlayerNames() {
  const selectedPlayers = Number(document.querySelector('input[name="players"]:checked')?.value || 1);
  const previousNames = [...playerNames.querySelectorAll("input")].map((input) => input.value);
  const fields = Array.from({ length: selectedPlayers }, (_, index) => {
    const label = document.createElement("label");
    label.className = "player-name-field";
    label.htmlFor = `playerName${index + 1}`;

    const caption = document.createElement("span");
    caption.textContent = `Jméno hráče ${index + 1}`;

    const input = document.createElement("input");
    input.type = "text";
    input.id = `playerName${index + 1}`;
    input.name = "playerName";
    input.maxLength = 24;
    input.autocomplete = "off";
    input.placeholder = `Hráč ${index + 1}`;
    input.value = previousNames[index] ?? pendingNames[index] ?? "";
    input.addEventListener("input", updateStartLink);

    label.append(caption, input);
    return label;
  });
  playerNames.replaceChildren(...fields);
  pendingNames = [];
  updateStartLink();
}

playerChoices.forEach((choice) => choice.addEventListener("change", renderPlayerNames));
renderPlayerNames();
>>>>>>> 4ee03667aa89e231f7fba964344aa5efb34052f8
