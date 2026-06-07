const canvas  = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tileSize = 64;

const hpBar = document.getElementById("hpBar");
const manaBar = document.getElementById("manaBar");
const levelText = document.getElementById("level");
const keyStatus = document.getElementById("keyStatus");

const wallTexture = new Image();
wallTexture.src = "sciana.png";

const exitTexture = new Image();
exitTexture.src = "exit.png";

const hpPotionTexture = new Image();
hpPotionTexture.src = "hp_poton.png";

const manaPotionTexture = new Image();
manaPotionTexture.src = "mana_potion.png"

const levels = [
    [
        "###############",
        "#P..H..#..M..X#",
        "#.###..#.###..#",
        "#...#......#..#",
        "###.#####..#..#",
        "#....K.#......#",
        "#..#...#..E...#",
        "#..#####......#",
        "#.............#",
        "###############"
    ],
    [
        "###############",
        "#P......#....X#",
        "#.#####.#.###.#",
        "#.....#.#.....#",
        "###.#.#.#####.#",
        "#...#.#...K...#",
        "#.#.#.#####.#.#",
        "#.#...H.E...#.#",
        "#.......E..M..#",
        "###############"
    ],
    [
        "###############",
        "#P.H..#..E...X#",
        "#.###.#.###.#.#",
        "#...#.#.....#.#",
        "###.#.#####.#.#",
        "#...#..K..#.#.#",
        "#.#######.#.#.#",
        "#..E.M.E..#...#",
        "#....E....E...#",
        "###############"
    ]
];
let currentLevel = 0;
let gameState = "PLAYING";

let walls = [];
let enemies = [];
let projectiles = [];
let keys = {};

let hpPotions = [];
let manaPotions = [];

let exitDoor = null;
let keyItem = null;
let hasKey = false;
let lastDirectional = "right";

const player = {
    x: 0,
    y: 0,
    size: 40,
    speed: 3,
    hp: 100,
    maxHp: 100,
    mana: 100,
    maxMana: 100
};

document.addEventListener("keydown", (e) => {
    // Jeśli gra się skończyła, reaguj tylko na klawisz R (restart)
    if (gameState !== "PLAYING") {
        if (e.key.toLowerCase() === "r") {
            resetGame();
        }
        return;
    }

    keys[e.key.toLowerCase()] = true;

    if (e.code === "Space") {
        castSpell();
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

function resetGame() {
    currentLevel = 0;
    player.hp = 100;
    player.mana = 100;
    gameState = "PLAYING";
    loadLevel(0);
}

function loadLevel(id) {
    walls = [];
    enemies = [];
    projectiles = [];
    hpPotions = [];
    manaPotions = [];

    exitDoor = null;
    keyItem = null;

    hasKey = false;
    keyStatus.textContent = "Nie";

    const map = levels[id];

    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            const tile = map[r][c];
            const x = c * tileSize;
            const y = r * tileSize;

            if (tile === "#") {
                walls.push({ x, y });
            }

            if (tile === "P") {
                player.x = x + 12;
                player.y = y + 12;
            }

            if (tile === "E") {
                enemies.push({
                    x: x + 12,
                    y: y + 12,
                    size: 40,
                    hp: 30 + id * 25,
                    speed: 1 + id
                });
            }

            if (tile === "X") {
                exitDoor = { x, y };
            }

            if (tile === "K") {
                keyItem = { x, y };
            }

            if (tile === "H") {
                hpPotions.push({ x, y });
            }

            if (tile === "M") {
                manaPotions.push({ x, y });
            }
        }
    }

    levelText.textContent = id + 1;
}

function rectCollision(a, b, w = tileSize, h = tileSize) {
    return (
        a.x < b.x + w &&
        a.x + a.size > b.x &&
        a.y < b.y + h &&
        a.y + a.size > b.y
    );
}