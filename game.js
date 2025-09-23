The Firebase API key you provided is already in the code. I've updated the `game.js` file with your specific key, removing the placeholder text.

Here are the complete, updated codes for your project. Just copy and paste each block into its respective file to ensure everything is correct.

-----

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Burger Muncher</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=MuseoModerno:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
</head>
<body>

    <div id="splashScreen">
        <h1>Burger Muncher</h1>
        <label for="playerNameInput">Enter your name:</label>
        <input type="text" id="playerNameInput" placeholder="Player 1">
        <p>Catch the burgers and grow, but watch out for the bombs!</p>
        <button id="playButton">Play</button>
    </div>

    <div id="gameContainer">
        <div class="header">
            <p>Player: <span id="playerNameDisplay"></span></p>
            <p>Lives: <span id="lives">3</span></p>
            <p>Size: <span id="size">1</span></p>
        </div>
        <canvas id="gameCanvas" width="500" height="300"></canvas>
    </div>

    <div id="gameOverScreen" class="hidden">
        <h2>Game Over</h2>
        <p><span id="finalPlayerName"></span>'s Final Size: <span id="finalScore">0</span></p>
        <p>Date: <span id="gameDate"></span></p>
        <p>Time: <span id="gameTime"></span></p>
        <button id="playAgainButton">Play Again</button>

        <h3>Leaderboard</h3>
        <div id="leaderboard-container">
            <p id="leaderboardLoading">Loading leaderboard...</p>
            <ol id="leaderboard"></ol>
        </div>
    </div>

    <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-database.js"></script>
    
    <script src="game.js"></script>
</body>
</html>
```

-----

### `style.css`

```css
body {
    background-color: #A60F11;
    color: white;
    font-family: 'MuseoModerno', sans-serif;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

#splashScreen,
#gameOverScreen {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.7);
    padding: 40px 60px;
    border-radius: 15px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    z-index: 100;
}

#gameContainer {
    display: none;
    position: relative;
    padding: 20px;
    border-radius: 15px;
}

.header {
    display: flex;
    justify-content: space-around;
    margin-bottom: 10px;
    font-size: 1.2em;
    font-weight: bold;
}

canvas {
    border: 2px solid white;
    background-color: white;
    border-radius: 10px;
}

#playButton,
#playAgainButton {
    padding: 12px 24px;
    font-size: 1.2em;
    cursor: pointer;
    background-color: #A60F11;
    color: white;
    border: 2px solid white;
    border-radius: 8px;
    transition: transform 0.2s;
    font-family: 'MuseoModerno', sans-serif;
}

#playButton:hover,
#playAgainButton:hover {
    transform: scale(1.05);
}

.hidden {
    display: none;
}

.no-cursor {
    cursor: none;
}

#leaderboard-container {
    max-height: 150px;
    overflow-y: auto;
    margin-top: 10px;
    padding: 0 10px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
}

#leaderboard {
    padding-left: 0;
    list-style-position: inside;
}

#leaderboard li {
    padding: 5px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 0.9em;
}

#leaderboard li:last-child {
    border-bottom: none;
}

@media (max-width: 600px) {
    #splashScreen,
    #gameOverScreen {
        width: 85%;
        padding: 20px;
    }

    .header {
        width: 100%;
        padding: 10px;
    }
}
```

-----

### `game.js`

```javascript
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
const gameDateDisplay = document.getElementById('gameDate');
const gameTimeDisplay = document.getElementById('gameTime');
const playerNameInput = document.getElementById('playerNameInput');
const playerNameDisplay = document.getElementById('playerNameDisplay');
const finalPlayerNameDisplay = document.getElementById('finalPlayerName');
const leaderboardList = document.getElementById('leaderboard');
const leaderboardLoading = document.getElementById('leaderboardLoading');

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

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB4v0Akz6HmC0OXhQKN59MM-QgFENB-6pQ",
    authDomain: "burgermuncherleaderboard.firebaseapp.com",
    databaseURL: "https://burgermuncherleaderboard-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "burgermuncherleaderboard",
    storageBucket: "burgermuncherleaderboard.firebasestorage.app",
    messagingSenderId: "151543666833",
    appId: "1:151543666833:web:3c281a1bd2d57ba498c730",
    measurementId: "G-S8NENLT085"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();


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

function resizeCanvas() {
    const baseWidth = 300;
    const baseHeight = 500;
    const aspectRatio = baseWidth / baseHeight;
    
    let newWidth = window.innerWidth * 0.9;
    let newHeight = window.innerHeight * 0.9;
    
    if (newWidth / newHeight > aspectRatio) {
        newWidth = newHeight * aspectRatio;
    } else {
        newHeight = newWidth / aspectRatio;
    }

    const maxWidth = 400;
    const maxHeight = 667;
    canvas.width = Math.min(newWidth, maxWidth);
    canvas.height = Math.min(newHeight, maxHeight);

    character.x = canvas.width / 2;
    character.y = canvas.height - 50;
    character.size = Math.min(canvas.width * 0.05, 20);
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(characterImg, character.x - character.size / 2, character.y - character.size / 2, character.size, character.size);

    for (let i = 0; i < fallingObjects.length; i++) {
        let obj = fallingObjects[i];
        obj.y += obj.speed;

        const objectSize = 20; 
        if (obj.type === 'burger') {
            ctx.drawImage(burgerImg, obj.x, obj.y, objectSize, objectSize);
        } else {
            ctx.drawImage(badObjectImg, obj.x, obj.y, objectSize, objectSize);
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

function checkCollision(char, obj) {
    const charRadius = char.size / 2;
    const objRadius = 10;
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
    
    document.body.classList.add('no-cursor');

    resizeCanvas();
    
    resetGame();
    gameRunning = true;
    gameLoop();
}

function displayDateTime() {
    const now = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', dateOptions);
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const formattedTime = now.toLocaleTimeString('en-US', timeOptions);

    gameDateDisplay.textContent = formattedDate;
    gameTimeDisplay.textContent = formattedTime;
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);

    document.body.classList.remove('no-cursor');

    if (gameOverSound) gameOverSound.triggerAttackRelease(['C2', 'G1', 'C1'], '1s');

    const finalScore = Math.floor(character.size / 2);
    const playerName = playerNameInput.value || 'Player 1';

    finalScoreDisplay.textContent = finalScore;
    finalPlayerNameDisplay.textContent = playerName;
    
    saveScore(playerName, finalScore);
    
    loadLeaderboard();

    displayDateTime();

    gameOverScreen.classList.remove('hidden');
    gameContainer.style.display = 'none';
}

function saveScore(name, score) {
    const newScoreRef = database.ref('scores').push();
    newScoreRef.set({
        name: name,
        score: score,
        timestamp: Date.now()
    }).then(() => {
        console.log("Score saved successfully!");
    }).catch((error) => {
        console.error("Error saving score:", error);
    });
}

function loadLeaderboard() {
    leaderboardLoading.style.display = 'block';
    leaderboardList.innerHTML = '';

    database.ref('scores').orderByChild('score').limitToLast(10).once('value', (snapshot) => {
        const scores = [];
        snapshot.forEach((childSnapshot) => {
            scores.push(childSnapshot.val());
        });

        scores.sort((a, b) => b.score - a.score);
        
        leaderboardLoading.style.display = 'none';

        scores.forEach((score) => {
            const li = document.createElement('li');
            li.textContent = `${score.name}: ${score.score}`;
            leaderboardList.appendChild(li);
        });

    }).catch((error) => {
        console.error("Error loading leaderboard:", error);
        leaderboardLoading.textContent = "Error loading leaderboard.";
    });
}

async function startAll() {
    if (!audioInitialized) {
        await Tone.start();
        initializeAudio();
    }
    await loadImages();
    playerNameDisplay.textContent = playerNameInput.value || 'Player 1';
    startGame();
}

// --- Event Listeners ---
playButton.addEventListener('click', startAll);
playAgainButton.addEventListener('click', startAll);

document.addEventListener('mousemove', (e) => {
    if (gameRunning) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        character.x = (e.clientX - rect.left) * scaleX;
    }
});

document.addEventListener('touchmove', (e) => {
    e.preventDefault(); 
    if (gameRunning) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        character.x = (e.touches[0].clientX - rect.left) * scaleX;
    }
}, { passive: false });

window.addEventListener('resize', () => {
    if (gameRunning) {
        resizeCanvas();
    }
});

window.addEventListener('load', resizeCanvas);

// --- Keyboard Zoom Fix ---
playerNameInput.addEventListener('focus', function() {
  document.body.style.zoom = "100%";
  document.body.style.touchAction = "none";
});

playerNameInput.addEventListener('blur', function() {
  document.body.style.zoom = ""; 
  document.body.style.touchAction = "auto";
});
```