const GRID_SIZE = 4;
const GRID_GAP = 2;
const CELL_SIZE = 18;
const KEY_MAPPER = {
  ArrowUp: {
    canMove: canMoveUp,
    moveTo: moveToUp,
  },
  ArrowDown: {
    canMove: canMoveDown,
    moveTo: moveToDown,
  },
  ArrowLeft: {
    canMove: canMoveLeft,
    moveTo: moveToLeft,
  },
  ArrowRight: {
    canMove: canMoveRight,
    moveTo: moveToRight,
  },
};

const gameBoard = document.getElementById("game-board");
const score = document.getElementById("score");
const cells = createCells(gameBoard);
startGame();

function startGame() {
  clearGame();
  setupGameBoard(gameBoard);

  generateRandomTile(gameBoard, cells);
  generateRandomTile(gameBoard, cells);

  setupInput();
  setupTouch();
}

function clearGame() {
  for (const cell of cells) {
    if (!cell?.tile) continue;
    removeTileFromCell(cell);
  }
  score.textContent = 0;
}

function setupTouch() {
  const touch = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  };

  addEventListener(
    "touchstart",
    (event) => {
      event.preventDefault();
      const [{ pageX, pageY }] = event.changedTouches;
      touch.startX = pageX;
      touch.startY = pageY;
    },
    { once: true }
  );

  // addEventListener("touchmove", (event) => {
  //   event.preventDefault();
  // });

  addEventListener(
    "touchend",
    (event) => {
      event.preventDefault();
      const [{ pageX, pageY }] = event.changedTouches;
      touch.endX = pageX;
      touch.endY = pageY;
      detectMovement(touch);
    },
    { once: true }
  );
}

function detectMovement({ startX, startY, endX, endY }) {
  let key = "";
  const SENSIBILITY = 3;
  const deltaX = startX - endX;
  const deltaY = startY - endY;
  const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
  if (Math.abs(deltaX) < SENSIBILITY || Math.abs(deltaY) < SENSIBILITY) {
    return handleInput("", setupTouch);
  }
  if (isHorizontal) {
    key = deltaX > 0 ? "ArrowLeft" : "ArrowRight";
  } else {
    key = deltaY > 0 ? "ArrowUp" : "ArrowDown";
  }
  handleInput(key, setupTouch);
}

function handleInput(key, cb) {
  const obj = KEY_MAPPER[key];
  if (!obj) return cb();
  if (!obj.canMove()) return cb();
  obj.moveTo();
  updateGame(cells);
  generateRandomTile(gameBoard, cells);
  if (!hasAnyMove()) return gameOver();
  cb();
}

function setupInput() {
  addEventListener("keydown", (e) => handleInput(e.key, setupInput), {
    once: true,
  });
}

function hasAnyMove() {
  return Object.values(KEY_MAPPER).some(({ canMove }) => canMove());
}

function gameOver() {
  setTimeout(() => {
    alert("Game Over!");
    startGame();
  }, 500);
}

function generateRandomTile(gameBoard, cells) {
  const cell = randomEmptyCell(cells);
  cell.tile = createTile(gameBoard, cell);
}

function updateGame(cells) {
  for (const cell of cells) {
    if (!cell.tile) continue;
    if (cell.isMerged) {
      cell.tile.value *= 2;
      cell.isMerged = false;
      updateScore(cell.tile.value);
    }
    updateTile(cell, cell.tile);
  }
}

function createTile(gameBoard, cell, value = Math.random() < 0.9 ? 2 : 4) {
  const element = document.createElement("div");
  element.classList.add("tile");
  gameBoard.append(element);
  const tile = { value, element };
  updateTile(cell, tile);
  return tile;
}

function updateTile(cell, tile) {
  tile.element.textContent = tile.value;

  tile.element.style.setProperty("--x", cell.x);
  tile.element.style.setProperty("--y", cell.y);

  const backgroundLightness = 100 - Math.log2(tile.value) * 10;
  const colorLightness = backgroundLightness > 50 ? 20 : 80;

  tile.element.style.setProperty(
    "--background-lightness",
    `${backgroundLightness}%`
  );
  tile.element.style.setProperty("--color-lightness", `${colorLightness}%`);
}

function removeTileFromCell(cell) {
  if (!cell.tile) return;
  cell.tile.element.remove();
  cell.tile = null;
  cell.isMerged = false;
}

function randomEmptyCell(cells) {
  const emptyCells = cells.filter(({ tile }) => !tile);
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}

function setupGameBoard(gameBoard) {
  gameBoard.style.setProperty("--grid-size", GRID_SIZE);
  gameBoard.style.setProperty("--cell-size", `${CELL_SIZE}vmin`);
  gameBoard.style.setProperty("--grid-gap", `${GRID_GAP}vmin`);
}

function createCells(gameBoard) {
  if (!gameBoard) return [];

  const cells = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const cellElement = createCellElement();
      cells.push(createCell(cellElement, x, y));
      gameBoard.append(cellElement);
    }
  }
  return cells;
}

function createCell(element, x, y) {
  return {
    element,
    x,
    y,
    tile: null,
    isMerged: false,
  };
}

function updateScore(value) {
  const number = Number(score.textContent) || 0;
  score.textContent = number + value;
}

function createCellElement() {
  const element = document.createElement("div");
  element.classList.add("cell");
  return element;
}

function getCellsByColumns() {
  return cells.reduce((acc, cell) => {
    if (!acc[cell.x]) acc[cell.x] = [];
    acc[cell.x][cell.y] = cell;
    return acc;
  }, []);
}

function getCellsByRows() {
  return cells.reduce((acc, cell) => {
    if (!acc[cell.y]) acc[cell.y] = [];
    acc[cell.y][cell.x] = cell;
    return acc;
  }, []);
}

function reverseGroupCells(cells = []) {
  return cells.map((group) => [...group.reverse()]);
}

function moveToUp() {
  console.log("moveToUp");
  moveTo(reverseGroupCells(getCellsByColumns()));
}

function moveToDown() {
  console.log("moveToDown");
  moveTo(getCellsByColumns());
}

function moveToLeft() {
  console.log("moveToLeft");
  moveTo(reverseGroupCells(getCellsByRows()));
}

function moveToRight() {
  console.log("moveToRight");
  moveTo(getCellsByRows());
}

function moveTo(cells) {
  for (const group of cells) {
    for (let i = group.length - 2; i >= 0; i--) {
      const currentCell = group[i];
      if (!currentCell?.tile) continue;

      let validCell = null;
      for (let j = i + 1; j < group.length; j++) {
        const nextCell = group[j];
        if (nextCell?.isMerged) break;
        if (nextCell?.tile) {
          if (nextCell.tile.value === currentCell.tile.value) {
            mergeTiles(currentCell, nextCell);
          }
          break;
        }
        validCell = nextCell;
      }

      if (!validCell) continue;
      moveTile(currentCell, validCell);
    }
  }
}

function moveTile(currentCell, nextCell) {
  nextCell.tile = currentCell.tile;
  currentCell.tile = null;
}

function mergeTiles(currentCell, nextCell) {
  removeTileFromCell(nextCell);
  nextCell.tile = currentCell.tile;
  nextCell.isMerged = true;
  currentCell.tile = null;
}

function canMoveUp() {
  console.log("canMoveUp");
  return canMove(reverseGroupCells(getCellsByColumns()));
}

function canMoveDown() {
  console.log("canMoveDown");
  return canMove(getCellsByColumns());
}

function canMoveLeft() {
  console.log("canMoveLeft");
  return canMove(reverseGroupCells(getCellsByRows()));
}

function canMoveRight() {
  console.log("canMoveRight");
  return canMove(getCellsByRows());
}

function canMove(cells) {
  for (const group of cells) {
    for (let i = group.length - 2; i >= 0; i--) {
      const currentCell = group[i];
      if (!currentCell?.tile) continue;

      for (let j = i + 1; j < group.length; j++) {
        const nextCell = group[j];
        if (!nextCell?.tile) return true;
        if (nextCell.tile) {
          if (nextCell.tile.value === currentCell.tile.value) return true;
          break;
        }
      }
    }
  }
  return false;
}
