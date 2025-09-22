// Get the HTML elements
const splashScreen = document.getElementById('splashScreen');
const gameContainer = document.getElementById('gameContainer');
const playButton = document.getElementById('playButton');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const livesDisplay = document.getElementById('lives');
const sizeDisplay = document.getElementById('size');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const playAgainButton = document.getElementById('playAgainButton');

// Game variables
let character = { x: canvas.width / 2, y: canvas.height - 50, size: 20 };
let lives = 3;
let fallingObjects = [];
let gameRunning = false;
let animationFrameId;
let audioInitialized = false;

// Sound variables
let burgerSound;
let gameOverSound;
let bombSound;

// Load images
const characterImg = new Image();
characterImg.src = 'character.png';

const burgerImg = new Image();
burgerImg.src = 'burger.png';

const badObjectImg = new Image();
badObjectImg.src = 'bomb.png';

function loadImages() {
    return new Promise(resolve => {
        let loadedCount = 0;
        const totalImages = 3;

        const onImageLoad = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                resolve();
            }
        };

        characterImg.onload = onImageLoad;
        burgerImg.onload = onImageLoad;
        badObjectImg.onload = onImageLoad;

        if (characterImg.complete && burgerImg.complete && badObjectImg.complete) {
            resolve();
        }
    });
}

// --- Game Functions ---

function initializeAudio() {
    burgerSound = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0,
            release: 0.1,
        }
    }).toDestination();

    bombSound = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.1,
            release: 0.2,
        }
    }).toDestination();

    gameOverSound = new Tone.PolySynth().toDestination();
    audioInitialized = true;
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(characterImg, character.x - character.size / 2, character.y - character.size / 2, character.size, character.size);

    for (let i = 0; i < fallingObjects.length; i++) {
        let obj = fallingObjects[i];
        obj.y += obj.speed;

        if (obj.type === 'burger') {
            ctx.drawImage(burgerImg, obj.x, obj.y, 20, 20);
        } else {
            ctx.drawImage(badObjectImg, obj.x, obj.y, 20, 20);
        }

        if (checkCollision(character, obj)) {
            handleCollision(obj);
            fallingObjects.splice(i, 1);
            i--;
        }
    }

    fallingObjects = fallingObjects.filter(obj => obj.y < canvas.height);

    if (Math.random() < 0.02) {
        spawnObject();
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

function spawnObject() {
    let badChance = 0.3 + (Math.floor(character.size / 2) * 0.01);
    if (badChance > 0.6) badChance = 0.6;

    let type = (Math.random() < badChance) ? 'bad' : 'burger';
    let speedModifier = Math.floor(character.size / 2) * 0.1;
    let newSpeed = (1 + Math.random() * 2) + speedModifier;

    let newObject = {
        x: Math.random() * (canvas.width - 20),
        y: 0,
        speed: newSpeed,
        type: type
    };
    fallingObjects.push(newObject);
}

// ✅ Circular collision detection
function checkCollision(char, obj) {
    const charRadius = char.size / 2;
    const objRadius = 10; // since the object is 20x20
    const objCenterX = obj.x + objRadius;
    const objCenterY = obj.y + objRadius;

    const dx = char.x - objCenterX;
    const dy = char.y - objCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < (charRadius + objRadius);
}

function handleCollision(obj) {
    if (obj.type === 'burger') {
        character.size += 2;
        sizeDisplay.textContent = Math.floor(character.size / 2);
        if (burgerSound) burgerSound.triggerAttackRelease('C4', '8n');
    } else {
        lives--;
        livesDisplay.textContent = lives;
        if (bombSound) {
            console.log('Bomb sound triggered');
            bombSound.triggerAttackRelease('16n');
        }
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
    splashScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameContainer.style.display = 'block';
    resetGame();
    gameRunning = true;
    gameLoop();
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);

    if (gameOverSound) gameOverSound.triggerAttackRelease(['C2', 'G1', 'C1'], '1s');

    finalScoreDisplay.textContent = Math.floor(character.size / 2);
    gameOverScreen.classList.remove('hidden');
    gameContainer.style.display = 'none';
}

async function startAll() {
    if (!audioInitialized) {
        await Tone.start();
        initializeAudio();
    }
    await loadImages();
    startGame();
}

// --- Event Listeners ---
playButton.addEventListener('click', startAll);
playAgainButton.addEventListener('click', startAll);

document.addEventListener('mousemove', (e) => {
    if (gameRunning) {
        character.x = e.clientX - canvas.getBoundingClientRect().left;
    }
});