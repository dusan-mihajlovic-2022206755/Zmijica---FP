(function () {
    const randomPosition = (gridSize, cellSize, snakeArr) => {
        const numCells = gridSize / cellSize; // number of cells in the grid
        const pos = {
            x: Math.floor(Math.random() * numCells),
            y: Math.floor(Math.random() * numCells),
        };

        const filterArr = snakeArr.filter(elem => elem.x === pos.x && elem.y === pos.y); //primer za filter
        if (filterArr.length === 0) {
            return pos;
        } else {
            return randomPosition(gridSize, cellSize, snakeArr); //primer rekurzije (osim gameLoop-a)
        }
    };

    const bonusFoodSystem = (state, gridSize, cellSize) => {
        if (state.foodEaten >= 5 && !state.bonus) {
            return {
                ...state,
                bonus: randomPosition(gridSize, cellSize, state.snake),
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
                    foodEaten: 0,
                };
            }
        }
        return state;
    };

    const foodSystem = (state, gridSize, cellSize) => {
        const ateFood = state.snake[0].x === state.food.x && state.snake[0].y === state.food.y;
        if (ateFood) {
            return {
                ...state,
                snake: [state.snake[0], ...state.snake],
                food: randomPosition(gridSize, cellSize, state.snake),
                score: state.score + 1,
                foodEaten: state.foodEaten + 1,
            };
        }
        return state;
    };

    const movementSystem = (state) => {
        if (state.gameOver) return state;

        const currentHead = state.snake[0];
        const nextHead = {
            x: currentHead.x + state.direction.x,
            y: currentHead.y + state.direction.y,
        };

        // rešavanje baga sa dužinom 2
        if (state.snake.length > 1) {
            const secondSegment = state.snake[1];
            if (
                (nextHead.x === secondSegment.x && nextHead.y === secondSegment.y) ||
                (nextHead.x === currentHead.x - state.direction.x && nextHead.y === currentHead.y - state.direction.y)
            ) {
                return state;
            }
        }

        const newSnake = [nextHead, ...state.snake.slice(0, -1)];
        return { ...state, snake: newSnake };
    };

    const collisionSystem = (state, gridSize, cellSize) => {
        if (state.gameOver) return state;

        const numCells = gridSize / cellSize;
        const hasCollided = (pos) =>
            pos.x < 0 ||
            pos.y < 0 ||
            pos.x >= numCells ||
            pos.y >= numCells ||
            state.snake.some(
                (segment, index) => index !== 0 && segment.x === pos.x && segment.y === pos.y
            );

        const newHead = state.snake[0];
        if (hasCollided(newHead)) {
            return { ...state, gameOver: true };
        }

        return state;
    };

    const render = (state, gridSize, cellSize, ctx) => {
        ctx.clearRect(0, 0, gridSize, gridSize);

        ctx.fillStyle = "green";
        state.snake.map((segment) => { //ne vidim gde bi drugde primenio map, pa sam ga ubacio ovde. Funktor vraća segment radi poštovanja imutabilnosti...
            ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
            return segment;
        });

        ctx.fillStyle = "darkgreen";
        ctx.fillRect(state.snake[0].x * cellSize, state.snake[0].y * cellSize, cellSize, cellSize);

        ctx.fillStyle = "red";
        ctx.fillRect(state.food.x * cellSize, state.food.y * cellSize, cellSize, cellSize);

        if (state.bonus) {
            ctx.fillStyle = "orange";
            ctx.fillRect(state.bonus.x * cellSize, state.bonus.y * cellSize, cellSize, cellSize);
        }

        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText(`Score: ${state.score}`, 10, gridSize - 10);

        if (state.gameOver) {
            ctx.fillStyle = "black";
            ctx.font = "24px Arial";
            ctx.fillText("Game Over", gridSize / 2 - 60, gridSize / 2);
        }
    };

    const gameLoop = (state, gridSize, cellSize, intervalLength, ctx) => {
        const systems = [
            movementSystem,
            collisionSystem,
            foodSystem,
            bonusFoodSystem,
            bonusCollisionSystem
        ];

        const nextState = systems.reduce((state, system) => system(state, gridSize, cellSize, ctx), state);  //primer za reduce i kompozicije
        render(nextState, gridSize, cellSize, ctx);

        if (!nextState.gameOver) {
            setTimeout(() => gameLoop(
                {...nextState, direction: currentDirection},
                gridSize, cellSize, intervalLength, ctx), intervalLength);
        }
    };

    document.addEventListener("keydown", (event) => {
        const directionMap = {
            ArrowUp: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 },
        };
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
        bonus: null,
        foodEaten: 0,
    };

    let currentDirection = { x: 1, y: 0 }; //mutable

    const canvas = document.getElementById("gameCanvas");
    const CTX = canvas.getContext("2d");

    const CELL_SIZE = 50;
    const GRID_SIZE = 700;
    const INTERVAL_LENGTH_MILISECONDS = 100;

    canvas.width = GRID_SIZE;
    canvas.height = GRID_SIZE;

    /*Trudio sam se da funckcije budu što čistije. Na Math.Random i na canvas nisam mogao da utičem */

    gameLoop(initialState, GRID_SIZE, CELL_SIZE, INTERVAL_LENGTH_MILISECONDS, CTX);
})();