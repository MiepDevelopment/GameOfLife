function createGameOfLife(canvasId, statusId, cellSize = 10) {
  const canvas = document.getElementById(canvasId);
  const colorPicker = document.getElementById("colorPicker");
  const ctx = canvas.getContext("2d");
  const statusElement = document.getElementById(statusId);
  const cols = Math.floor(canvas.width / cellSize);
  const rows = Math.floor(canvas.height / cellSize);
  let grid = createGrid();
  let isRunning = false;
  let intervalId = null;
  let showGrid = true;
  let randomAreaSize = 100; // Default size (%)

  function createGrid() {
    return Array(rows)
      .fill()
      .map(() => Array(cols).fill(0));
  }

  function randomize() {
    const areaSize = randomAreaSize / 100; // Convert percentage to decimal
    const startRow = Math.floor((rows - rows * areaSize) / 2);
    const startCol = Math.floor((cols - cols * areaSize) / 2);
    const endRow = startRow + Math.floor(rows * areaSize);
    const endCol = startCol + Math.floor(cols * areaSize);

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        grid[row][col] = Math.random() > 0.7 ? 1 : 0;
      }
    }
    draw();
    updateStatus(`Randomized ${randomAreaSize}% of the grid`);
  }

  function clear() {
    grid = createGrid();
    draw();
    updateStatus("Cleared the grid");
  }

  function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    grid[row][col] = grid[row][col] ? 0 : 1;
    draw();
    updateStatus(`Toggled cell at row ${row}, column ${col}`);
  }

  function countNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newRow = (row + i + rows) % rows;
        const newCol = (col + j + cols) % cols;
        count += grid[newRow][newCol];
      }
    }
    return count;
  }

  function update() {
    const newGrid = createGrid();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const neighbors = countNeighbors(row, col);
        if (grid[row][col]) {
          newGrid[row][col] = neighbors === 2 || neighbors === 3 ? 1 : 0;
        } else {
          newGrid[row][col] = neighbors === 3 ? 1 : 0;
        }
      }
    }
    grid = newGrid;
  }

  function drawGrid() {
    ctx.strokeStyle = "#ccccc";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }
    for (let j = 0; j <= cols; j++) {
      ctx.beginPath();
      ctx.moveTo(j * cellSize, 0);
      ctx.lineTo(j * cellSize, canvas.height);
      ctx.stroke();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showGrid) {
      drawGrid();
    }

    ctx.fillStyle = colorPicker.value;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (grid[row][col]) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  function start() {
    if (!isRunning) {
      isRunning = true;
      run();
      updateStatus("Started simulating");
    }
  }

  function stop() {
    if (isRunning) {
      isRunning = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
      updateStatus("Stopped simulating");
    }
  }

  function run() {
    intervalId = setInterval(() => {
      update();
      draw();
    }, 100);
  }

  function toggleGrid() {
    showGrid = !showGrid;
    draw();
    updateStatus(showGrid ? "Showed grid/cellboxes" : "Hid grid/cellboxes");
  }

  function updateStatus(message) {
    statusElement.textContent = message;
  }

  function setRandomAreaSize(size) {
    randomAreaSize = size;
    updateStatus(`Set random area size to ${size}%`);
  }

  function drawShape(shape) {
    const centerRow = Math.floor(rows / 2);
    const centerCol = Math.floor(cols / 2);

    switch (shape) {
      case "I":
        for (let i = -5; i <= 5; i++) {
          if (centerRow + i >= 0 && centerRow + i < rows) {
            grid[centerRow + i][centerCol] = 1;
          }
        }
        break;
      case "H":
        for (let i = -5; i <= 5; i++) {
          if (centerRow + i >= 0 && centerRow + i < rows) {
            grid[centerRow + i][centerCol - 2] = 1;
            grid[centerRow + i][centerCol + 2] = 1;
          }
        }
        for (let j = -2; j <= 2; j++) {
          if (centerCol + j >= 0 && centerCol + j < cols) {
            grid[centerRow][centerCol + j] = 1;
          }
        }
        break;
      case "O":
        for (let i = -3; i <= 3; i++) {
          for (let j = -3; j <= 3; j++) {
            if (
              i * i + j * j <= 10 &&
              centerRow + i >= 0 &&
              centerRow + i < rows &&
              centerCol + j >= 0 &&
              centerCol + j < cols
            ) {
              grid[centerRow + i][centerCol + j] = 1;
            }
          }
        }
        break;
      case "S":
        for (let i = -4; i <= 4; i++) {
          if (centerRow + i >= 0 && centerRow + i < rows) {
            if (i < -1) grid[centerRow + i][centerCol - 2] = 1;
            if (i > 1) grid[centerRow + i][centerCol + 2] = 1;
            if (i === -1 || i === 0 || i === 1)
              grid[centerRow + i][centerCol + (i === 1 ? 2 : -2)] = 1;
          }
        }
        for (let j = -2; j <= 2; j++) {
          if (centerCol + j >= 0 && centerCol + j < cols) {
            grid[centerRow - 4][centerCol + j] = 1;
            grid[centerRow][centerCol + j] = 1;
            grid[centerRow + 4][centerCol + j] = 1;
          }
        }
        break;
    }
    draw();
    updateStatus(`Drew shape: ${shape}`);
  }

  function handleKeyPress(event) {
    const key = event.key.toUpperCase();
    if (["I", "H", "O", "S"].includes(key)) {
      drawShape(key);
    }
  }

  canvas.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeyPress);

  return {
    start,
    stop,
    clear,
    randomize,
    draw,
    toggleGrid,
    setRandomAreaSize,
  };
}

// Set up the game when the window loads
window.onload = function () {
  const game = createGameOfLife("gameCanvas", "statusText");

  document.getElementById("startBtn").addEventListener("click", game.start);
  document.getElementById("stopBtn").addEventListener("click", game.stop);
  document.getElementById("clearBtn").addEventListener("click", function () {
    game.stop(); game.clear();
  });

  document
    .getElementById("randomBtn")
    .addEventListener("click", function () {
      game.clear();
      game.randomize();
    });

  document
    .getElementById("toggleGridBtn")
    .addEventListener("click", game.toggleGrid);

  const sizeSlider = document.getElementById("sizeSlider");
  sizeSlider.addEventListener("input", function () {
    game.setRandomAreaSize(this.value);
    document.getElementById("sizeValue").textContent = "Random Area Size " + this.value + "%";
  });

  game.draw();
};
