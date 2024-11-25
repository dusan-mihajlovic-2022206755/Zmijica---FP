const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const CELL_SIZE = 20;

const randomPosition = (gridSize) => ({
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize),
});



const movementSystem = (state) => {
    if (state.gameOver) return state;

    const newHead = {
        x: state.snake[0].x + currentDirection.x,
        y: state.snake[0].y + currentDirection.y,
    };

    const newSnake = [newHead, ...state.snake.slice(0, -1)];

    return { ...state, snake: newSnake };
};

const collisionSystem = (state) => {
    if (state.gameOver) return state;

    const hasCollided = (pos) =>
        pos.x < 0 ||
        pos.y < 0 ||
        pos.x >= canvas.width / CELL_SIZE ||
        pos.y >= canvas.height / CELL_SIZE ||
        state.snake.some(
            (segment, index) => index !== 0 && segment.x === pos.x && segment.y === pos.y
        );

    const newHead = state.snake[0];
    if (hasCollided(newHead)) {
        return { ...state, gameOver: true };
    }

    return state;
};

const bonusScoreSystem = (state) => {
    if (state.snake.length % 5 === 0 && !state.bonus) {
        return {
            ...state,
            bonus: randomPosition(canvas.width / CELL_SIZE),
        };
    }
    return state;
};

const bonusCollisionSystem = (state) => {
    if (state.bonus) {
        const ateBonus = state.snake[0].x === state.bonus.x && state.snake[0].y === state.bonus.y;
        if (ateBonus) {
            return {
                ...state,
                score: state.score + 5,
                bonus: null,
            };
        }
    }
    return state;
};

const foodSystem = (state) => {
    const ateFood = state.snake[0].x === state.food.x && state.snake[0].y === state.food.y;

    if (ateFood) {
        return {
            ...state,
            snake: [state.snake[0], ...state.snake],
            food: randomPosition(canvas.width / CELL_SIZE),
            score: state.score + 1,
        };
    }

    return state;
};

const render = (state) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "green";
    state.snake.forEach((segment) =>
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    );

    ctx.fillStyle = "darkgreen";
    ctx.fillRect(state.snake[0].x * CELL_SIZE, state.snake[0].y * CELL_SIZE, CELL_SIZE, CELL_SIZE)

    ctx.fillStyle = "red";
    ctx.fillRect(state.food.x * CELL_SIZE, state.food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    if (state.bonus){
        ctx.fillStyle = "orange";
        ctx.fillRect(state.bonus.x * CELL_SIZE, state.bonus.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${state.score}`, 10, canvas.height - 10);

    if (state.gameOver) {
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 60, canvas.height / 2);
    }
};

const gameLoop = (state) => {
    const systems = [
        movementSystem,
        collisionSystem,
        bonusScoreSystem,
        bonusCollisionSystem,
        foodSystem
    ];
    const nextState = systems.reduce((state, system) => system(state), state);

    render(nextState);

    if (!nextState.gameOver) {
        setTimeout(() => gameLoop(nextState), 100);
    }
};


const directionMap = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
};

document.addEventListener("keydown", (event) => {
    if (directionMap[event.key]) {
        currentDirection = directionMap[event.key];
    }
});

const initialState = {
    snake: [{ x: 5, y: 5 }],
    food: { x: 10, y: 10 },
    direction: { x: 1, y: 0 },
    score: 0,
    gameOver: false,
};
let currentDirection = { x: 1, y: 0 };

gameLoop(initialState);