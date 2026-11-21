const startLink = document.querySelector("#startGame");
const playerChoices = document.querySelectorAll('input[name="players"]');
const playerNames = document.querySelector("#playerNames");
const difficultyPicker = document.querySelector("#difficultyPicker");
const difficultyChoice = document.querySelector("#botDifficulty");
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
  difficultyPicker.hidden = selectedPlayers !== 1;
  params.set("difficulty", difficultyChoice.value);
  startLink.href = `pexeso.html?${params.toString()}`;
}

const requestedDifficulty = setupParams.get("difficulty");
if (["easy", "medium", "hard"].includes(requestedDifficulty)) difficultyChoice.value = requestedDifficulty;
difficultyChoice.addEventListener("change", updateStartLink);

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
