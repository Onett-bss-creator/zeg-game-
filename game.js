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

function movePlayer() {
    let oldX = player.x;
    let oldY = player.y;

    if (keys["w"] || keys["arrowup"]) {
        player.y -= player.speed;
        lastDirection = "up";
    } else if (keys["s"] || keys["arrowdown"]) {
        player.y += player.speed;
        lastDirection = "down";
    }

    for (const wall of walls) {
        if (rectCollision(player, wall)) {
            player.y = oldY;
            break;
        }
    }

    if (keys["a"] || keys["arrowleft"]) {
        player.x -= player.speed;
        lastDirection = "left";
    } else if (keys["d"] || keys["arrowright"]) {
        player.x += player.speed;
        lastDirection = "right";
    }

    for (const wall of walls) {
        if (rectCollision(player, wall)) {
            player.x = oldX;
            break;
        }
    }
}
function castSpell() {
    if (player.mana < 10) return;

    player.mana -= 10;

    let vx = 0;
    let vy = 0;

    switch (lastDirection) {
        case "up":
            vy = -8;
            break;
        case "down":
            vy = 8;
            break;
        case "left":
            vx = -8;
            break;
        case "right":
            vx = 8;
            break;
    }

    projectiles.push({
        x: player.x + player.size / 2,
        y: player.y + player.size / 2,
        vx,
        vy,
        size: 8
    });
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];

        p.x += p.vx;
        p.y += p.vy;

        let remove = false;

        for (const wall of walls) {
            if (
                p.x > wall.x &&
                p.x < wall.x + tileSize &&
                p.y > wall.y &&
                p.y < wall.y + tileSize
            ) {
                remove = true;
            }
        }

        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];

            if (
                p.x > e.x &&
                p.x < e.x + e.size &&
                p.y > e.y &&
                p.y < e.y + e.size
            ) {
                e.hp -= 20;
                remove = true;

                if (e.hp <= 0) {
                    enemies.splice(j, 1);
                }
            }
        }

        if (remove) {
            projectiles.splice(i, 1);
        }
    }
}