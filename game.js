// Get the HTML elements
const splashScreen = document.getElementById('splashScreen');
const gameContainer = document.getElementById('gameContainer');
const playButton = document.getElementById('playButton');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const livesDisplay = document.getElementById('lives');
const sizeDisplay = document.getElementById('size');

// Game variables
let character = { x: canvas.width / 2, y: canvas.height - 50, size: 20 };
let lives = 3;
let fallingObjects = [];
let gameRunning = false;
let animationFrameId;

// Load images
const characterImg = new Image();
characterImg.src = 'character.png';

const burgerImg = new Image();
burgerImg.src = 'burger.png';

const badObjectImg = new Image();
badObjectImg.src = 'bomb.png';

// --- Game Functions ---

function gameLoop() {
    if (!gameRunning) return;

    // 1. Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw the character
    ctx.drawImage(characterImg, character.x - character.size / 2, character.y - character.size / 2, character.size, character.size);

    // 3. Update and draw falling objects
    for (let i = 0; i < fallingObjects.length; i++) {
        let obj = fallingObjects[i];
        obj.y += obj.speed;

        // Draw the correct image
        if (obj.type === 'burger') {
            ctx.drawImage(burgerImg, obj.x, obj.y, 20, 20);
        } else {
            ctx.drawImage(badObjectImg, obj.x, obj.y, 20, 20);
        }

        // Check for collisions
        if (checkCollision(character, obj)) {
            handleCollision(obj);
            fallingObjects.splice(i, 1);
            i--;
        }
    }

    // 4. Remove off-screen objects
    fallingObjects = fallingObjects.filter(obj => obj.y < canvas.height);

    // 5. Spawn new objects
    if (Math.random() < 0.02) {
        spawnObject();
    }

    // 6. Request next frame
    animationFrameId = requestAnimationFrame(gameLoop);
}

function spawnObject() {
    // --- NEW CODE FOR DIFFICULTY ---
    // The chance for a bad object starts at 30% and increases with size
    let badChance = 0.3 + (Math.floor(character.size / 10) * 0.01);
    if (badChance > 0.6) {
        badChance = 0.6; // This caps the bad object chance at 60%
    }
    let type = (Math.random() < badChance) ? 'bad' : 'burger';

    // The object speed starts from a base and increases with character size
    let speedModifier = Math.floor(character.size / 10) * 0.1;
    let newSpeed = (1 + Math.random() * 2) + speedModifier;
    // --- END OF NEW CODE ---

    let newObject = {
        x: Math.random() * (canvas.width - 20),
        y: 0,
        speed: newSpeed,
        type: type
    };
    fallingObjects.push(newObject);
}

function checkCollision(char, obj) {
    return (char.x < obj.x + 20 &&
            char.x + char.size > obj.x &&
            char.y < obj.y + 20 &&
            char.y + char.size > obj.y);
}

function handleCollision(obj) {
    if (obj.type === 'burger') {
        character.size += 2;
        sizeDisplay.textContent = Math.floor(character.size / 2);
    } else {
        lives--;
        livesDisplay.textContent = lives;
        if (lives <= 0) {
            endGame();
        }
    }
}

function resetGame() {
    character.x = canvas.width / 2;
    character.y = canvas.height - 50;
    character.size = 20;
    lives = 3;
    fallingObjects = [];
    livesDisplay.textContent = lives;
    sizeDisplay.textContent = 1;
}

function startGame() {
    splashScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    resetGame();
    gameRunning = true;
    gameLoop();
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    if (confirm('Game Over! Play again?')) {
        startGame();
    }
}

// --- Event Listeners ---
playButton.addEventListener('click', startGame);

document.addEventListener('mousemove', (e) => {
    if (gameRunning) {
        character.x = e.clientX - canvas.getBoundingClientRect().left;
    }
});