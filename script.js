(function () {
    const initialState = {
        snake: [{x: 5, y: 5}],
        food: {x: 10, y: 10},
        direction: {x: 1, y: 0},
        score: 0,
        gameOver: false,
        bonus: null,
        foodEaten: 0,
    };

    let currentDirection = {x: 1, y: 0}; //mutable, nije u skladu sa paradigmom funkcionalnog programiranja)

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const CELL_SIZE = 30;
    const GRID_SIZE = 500
    const INTERVAL_LENGTH_MILISECONDS = 100;

    canvas.width = GRID_SIZE
    canvas.height = GRID_SIZE

    const randomPosition = (gridSize, snakeArr) => {
        const pos = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
        }
        const filterArr = snakeArr.filter(elem => elem.x === pos.x && elem.y === pos.y); //primer za filter
        if (filterArr.length === 0) {
            return pos;
        } else {
            return randomPosition(gridSize, snakeArr); //primer rekurzije (osim gameLoop-a)
        }
    };

    const bonusFoodSystem = (state) => {
        if (state.foodEaten >= 5 && !state.bonus) {
            return {
                ...state,
                bonus: randomPosition(GRID_SIZE / CELL_SIZE, state.snake),
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

    const foodSystem = (state) => {
        const ateFood = state.snake[0].x === state.food.x && state.snake[0].y === state.food.y;
        if (ateFood) {
            return {
                ...state,
                snake: [state.snake[0], ...state.snake],
                food: randomPosition(GRID_SIZE / CELL_SIZE, state.snake),
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
            x: currentHead.x + currentDirection.x,
            y: currentHead.y + currentDirection.y,
        };

        // rešavanje baga sa dužinom 2
        if (state.snake.length > 1) {
            const secondSegment = state.snake[1];
            if (
                (nextHead.x === secondSegment.x && nextHead.y === secondSegment.y) ||
                (nextHead.x === currentHead.x - currentDirection.x && nextHead.y === currentHead.y - currentDirection.y)
            ) {
                return state;
            }
        }

        const newSnake = [nextHead, ...state.snake.slice(0, -1)];
        return {...state, snake: newSnake};
    };

    const collisionSystem = (state) => {
        if (state.gameOver) return state;

        const hasCollided = (pos) =>
            pos.x < 0 ||
            pos.y < 0 ||
            pos.x >= GRID_SIZE / CELL_SIZE ||
            pos.y >= GRID_SIZE / CELL_SIZE ||
            state.snake.some(
                (segment, index) => index !== 0 && segment.x === pos.x && segment.y === pos.y
            );

        const newHead = state.snake[0];
        if (hasCollided(newHead)) {
            return {...state, gameOver: true};
        }

        return state;
    };

    const render = (state) => {
        ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);

        ctx.fillStyle = "green";
        //primer za map
        state.snake.map((segment) => { //ne vidim gde bi drugde primenio map, pa sam ga ubacio ovde. Funktor vraća segment radi poštovanja imutabilnosti...
            ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            return segment;
        });

        ctx.fillStyle = "darkgreen";
        ctx.fillRect(state.snake[0].x * CELL_SIZE, state.snake[0].y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        ctx.fillStyle = "red";
        ctx.fillRect(state.food.x * CELL_SIZE, state.food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        if (state.bonus) {
            ctx.fillStyle = "orange";
            ctx.fillRect(state.bonus.x * CELL_SIZE, state.bonus.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }

        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText(`Score: ${state.score}`, 10, canvas.height - 10);

        if (state.gameOver) {
            ctx.fillStyle = "black";
            ctx.font = "24px Arial";
            ctx.fillText("Game Over", GRID_SIZE / 2 - 60, canvas.height / 2);
        }
    };

    let gameLoop = (state) => {
        const systems = [
            movementSystem,
            collisionSystem,
            foodSystem,
            bonusFoodSystem,
            bonusCollisionSystem,
        ];
        //TODO wrapuj systeme u funkcije pomoću map-a, u spoljne funkcije staviti konstante gore kao paramtre

        const nextState = systems.reduce((state, system) => system(state), state);  //primer za reduce i kompozicije

        render(nextState);

        if (!nextState.gameOver) {
            setTimeout(() => gameLoop(nextState), INTERVAL_LENGTH_MILISECONDS);
        }
    };


    document.addEventListener("keydown", (event) => {
        const directionMap = {
            ArrowUp: {x: 0, y: -1},
            ArrowDown: {x: 0, y: 1},
            ArrowLeft: {x: -1, y: 0},
            ArrowRight: {x: 1, y: 0},
        };
        if (directionMap[event.key]) {
            currentDirection = directionMap[event.key];
        }
    });

    gameLoop(initialState);

})()