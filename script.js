(function () {
    const randomPosition = (gridSize, cellSize, snakeArr) => {
        const numCells = gridSize / cellSize;
        const pos = {
            x: Math.floor(Math.random() * numCells),
            y: Math.floor(Math.random() * numCells),
        };

        const filterArr = snakeArr.filter(elem => elem.x === pos.x && elem.y === pos.y); //primer filter
        if (filterArr.length === 0) {
            return pos;
        } else {
            return randomPosition(gridSize, cellSize, snakeArr);
        }
    };
    //proverava da li je pogodjeno sta treba i skida ga sa stanja
    const targetHit = (state, target, scoreIncrease, onHit) => {
        if (state[target] && state.snake[0].x === state[target].x && state.snake[0].y === state[target].y) {
            return {
                ...onHit({ ...state, score: state.score + scoreIncrease }),
                [target]: null
            };
        }
        return state;
    };

    const foodSystem = (state, gridSize, cellSize) => {
        const regularFoodSystem = (state) => {
            const newState = targetHit(state, 'food', 1,
                (currentState) => ({
                    ...currentState,
                    snake: [currentState.snake[0], ...currentState.snake],
                    foodEaten: currentState.foodEaten + 1,
                })
            );

            if (!newState.food) { //ukoliko je pogodjeno, skinuto je sa stanja stoga se mora dodati
                return {
                    ...newState,
                    food: randomPosition(gridSize, cellSize, newState.snake),
                };
            }

            return newState;
        };

        const bonusFoodSystem = (state) => {
            if (state.foodEaten >= 5 && !state.bonus) {
                return {
                    ...state,
                    bonus: randomPosition(gridSize, cellSize, state.snake),
                };
            }

            return targetHit(state, 'bonus', 5,
                (currentState) => ({
                    ...currentState,
                    foodEaten: 0,
                })
            );
        };
        const foodSubsystems = [regularFoodSystem, bonusFoodSystem];
        return foodSubsystems.reduce(
            (state, system) => system(state),
            state
        );
    };

    const movementSystem = (state) => {
        if (state.gameOver) return state;

        const currentHead = state.snake[0];
        const nextHead = {
            x: currentHead.x + state.direction.x,
            y: currentHead.y + state.direction.y,
        };

        if (state.snake.length > 1) {
            const secondSegment = state.snake[1];
            if (nextHead.x === secondSegment.x && nextHead.y === secondSegment.y) {
                return { ...state, gameOver: true };
            }
        }

        const newSnake = [nextHead, ...state.snake.slice(0, -1)];
        return { ...state, snake: newSnake };
    };

    const collisionSystem = (state, gridSize, cellSize) => {
        if (state.gameOver) return state;

        const numCells = gridSize / cellSize;
        const newHead = state.snake[0];
        const hasCollided = newHead.x < 0 ||
            newHead.y < 0 ||
            newHead.x >= numCells ||
            newHead.y >= numCells ||
            state.snake.slice(1).some(segment => segment.x === newHead.x && segment.y === newHead.y);

        if (hasCollided) {
            return { ...state, gameOver: true };
        }

        return state;
    };

    const render = (state, gridSize, cellSize, ctx) => {
        ctx.clearRect(0, 0, gridSize, gridSize);

        ctx.fillStyle = "green";
        state.snake.map((segment) => {
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
            ctx.font = "30px Arial";
            ctx.fillText("Game Over", gridSize / 2 - 60, gridSize / 2);
            ctx.font = "24px Arial";
            ctx.fillText(`Score: ${state.score}`, gridSize / 2 - 35, gridSize / 2 + 30);
        }
    };

    const gameLoop = (state, gridSize, cellSize, intervalLength, ctx) => {
        const systems = [
            movementSystem,
            collisionSystem,
            foodSystem
        ];

        const nextState = systems.reduce((state, system) => system(state, gridSize, cellSize), state);
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
    const INTERVAL_LENGTH_MILLISECONDS = 100;

    canvas.width = GRID_SIZE;
    canvas.height = GRID_SIZE;

    /*Trudio sam se da funckcije budu što čistije. Na Math.Random,canvas, setTimeout nisam mogao da utičem */

    gameLoop(initialState, GRID_SIZE, CELL_SIZE, INTERVAL_LENGTH_MILLISECONDS, CTX);
})();