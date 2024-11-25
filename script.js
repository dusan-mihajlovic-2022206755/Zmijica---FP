// Constants
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const CELL_SIZE = 20;

// Initial Game State
const initialState = {
    snake: [{ x: 5, y: 5 }],
    food: { x: 10, y: 10 },
    direction: { x: 1, y: 0 },
    score: 0,
    gameOver: false,
};

// Utility: Generate Random Position
const randomPosition = (gridSize) => ({
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize),
});

// Pure Function: Update Game State
const updateState = (state, inputDirection) => {
    if (state.gameOver) return state;

    const direction = inputDirection() || state.direction;

    const newHead = {
        x: state.snake[0].x + direction.x,
        y: state.snake[0].y + direction.y,
    };

    const hasCollided = (pos) =>
        pos.x < 0 ||
        pos.y < 0 ||
        pos.x >= canvas.width / CELL_SIZE ||
        pos.y >= canvas.height / CELL_SIZE ||
        state.snake.some(
            (segment, index) => index !== 0 && segment.x === pos.x && segment.y === pos.y
        );

    if (hasCollided(newHead)) {
        return { ...state, gameOver: true };
    }

    const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;

    const newSnake = ateFood
        ? [newHead, ...state.snake]
        : [newHead, ...state.snake.slice(0, -1)];

    return {
        ...state,
        snake: newSnake,
        food: ateFood ? randomPosition(canvas.width / CELL_SIZE) : state.food,
        direction,
        score: ateFood ? state.score + 1 : state.score,
    };
};

// Render Function
const render = (state) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Snake
    ctx.fillStyle = "green";
    state.snake.forEach((segment) =>
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    );

    // Draw Food
    ctx.fillStyle = "red";
    ctx.fillRect(state.food.x * CELL_SIZE, state.food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    // Draw Score
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${state.score}`, 10, canvas.height - 10);

    if (state.gameOver) {
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 60, canvas.height / 2);
    }
};

// Main Game Loop
const gameLoop = (state) => {
    const nextState = updateState(state, currentDirection);
    render(nextState);
    console.log(nextState.direction);

    if (!nextState.gameOver) {
        setTimeout(() => {
            console.log("--------------------------------");
            gameLoop(nextState);
        }, 100);
    }
};

const directionMap = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
};

let currentDirection = () => initialState.direction;
document.addEventListener("keydown", (event) => {
    debugger;
    console.log(currentDirection());
    currentDirection = () => directionMap[event.key];
});

// Start the Game
gameLoop(initialState);