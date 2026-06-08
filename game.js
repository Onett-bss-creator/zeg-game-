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

function updateEnemies() {
    enemies.forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;

        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
            let oldX = enemy.x;
            let oldY = enemy.y;

            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;

            for (const wall of walls) {
                if (rectCollision(enemy, wall)) {
                    enemy.x = oldX;
                    enemy.y = oldY;
                }
            }
        }

        if (
            player.x < enemy.x + enemy.size &&
            player.x + player.size > enemy.x &&
            player.y < enemy.y + enemy.size &&
            player.y + player.size > enemy.y
        ) {
            player.hp -= 0.15;
        }
    });
}

function checkKey() {
    if (!keyItem || hasKey) return;

    if (rectCollision(player, keyItem)) {
        hasKey = true;
        keyItem = null;

        keyStatus.textContent = "Tak";
    }
}

function checkExit() {
    if (!exitDoor || !hasKey) return;

    if (rectCollision(player, exitDoor)) {
        currentLevel++;

        if (currentLevel >= levels.length) {
            gameState = "GAME_WON"; // Aktywacja ekranu wygranej
            return;
        }

        loadLevel(currentLevel);
    }
}

function checkPotions() {
    
    for (let i = hpPotions.length - 1; i >= 0; i--) {
        if (rectCollision(player, hpPotions[i])) {
            player.hp = Math.min(player.maxHp, player.hp + 30); // Przywraca 30 HP
            hpPotions.splice(i, 1);
        }
    }

    
    for (let i = manaPotions.length - 1; i >= 0; i--) {
        if (rectCollision(player, manaPotions[i])) {
            player.mana = Math.min(player.maxMana, player.mana + 40); // Przywraca 40 Many
            manaPotions.splice(i, 1);
        }
    }
}

function update() {
    if (gameState !== "PLAYING") return; 

    movePlayer();
    updateEnemies();
    updateProjectiles();

    checkKey();
    checkExit();
    checkPotions(); 

    player.mana += 0.03;

    if (player.mana > player.maxMana) player.mana = player.maxMana;

    if (player.hp <= 0) {
        player.hp = 0;
        gameState = "GAME_OVER"; 
    }

    hpBar.style.width = player.hp + "%";
    manaBar.style.width = player.mana + "%";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    for (const wall of walls) {
        if (wallTexture.complete) {
            ctx.drawImage(wallTexture, wall.x, wall.y, tileSize, tileSize);
        } else {
            ctx.fillStyle = "#666";
            ctx.fillRect(wall.x, wall.y, tileSize, tileSize);
            ctx.strokeStyle = "#999";
            ctx.strokeRect(wall.x, wall.y, tileSize, tileSize);
        }
    }

    
    if (exitDoor) {
        if (exitTexture.complete) {
            ctx.drawImage(exitTexture, exitDoor.x, exitDoor.y, tileSize, tileSize);
        } else {
            ctx.fillStyle = "gold";
            ctx.fillRect(exitDoor.x + 8, exitDoor.y + 8, tileSize - 16, tileSize - 16);
            ctx.fillStyle = "black";
            ctx.font = "18px Arial";
            ctx.fillText("EXIT", exitDoor.x + 6, exitDoor.y + 38);
        }
    }

    
    hpPotions.forEach(potion => {
        if (hpPotionTexture.complete) {
            ctx.drawImage(hpPotionTexture, potion.x + 12, potion.y + 12, 40, 40);
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(potion.x + 22, potion.y + 22, 20, 20);
        }
    });

    
    manaPotions.forEach(potion => {
        if (manaPotionTexture.complete) {
            ctx.drawImage(manaPotionTexture, potion.x + 12, potion.y + 12, 40, 40);
        } else {
            ctx.fillStyle = "blue";
            ctx.fillRect(potion.x + 22, potion.y + 22, 20, 20);
        }
    });

    
    if (keyItem) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(keyItem.x + 32, keyItem.y + 32, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    
    ctx.fillStyle = "lime";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    
    enemies.forEach(enemy => {
        ctx.fillStyle = "crimson";
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        ctx.fillStyle = "red";
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.hp, 5);
    });

    
    ctx.fillStyle = "cyan";
    projectiles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    if (gameState === "GAME_WON") {
        ctx.fillStyle =  "rgba(0, 0, 0, 0.85)";
        ctx.fillRect = (0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";
        
        ctx.fillStyle = "gold";
        ctx.font = "bold 50px Arial";
        ctx.fillText("GRATULACJE!", canvas.width / 2, canvas.height / 2 - 30);

        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("Ukończyłeś cały labirynt!", canvas.width / 2, canvas.height / 2 + 20);
        
        ctx.fillStyle = "#aaa";
        ctx.font = "18px Arial";
        ctx.fillText("Naciśnij 'R', aby zagrać ponownie", canvas.width / 2, canvas.height / 2 + 80);
        
        ctx.textAlign = "left";
    }
    
    if (gameState === "GAME_OVER") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";
        
        ctx.fillStyle = "crimson";
        ctx.font = "bold 50px Arial";
        ctx.fillText("KONIEC GRY", canvas.width / 2, canvas.height / 2 - 30);

        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("Zostałeś pokonany przez potwory.", canvas.width / 2, canvas.height / 2 + 20);
        
        ctx.fillStyle = "#aaa";
        ctx.font = "18px Arial";
        ctx.fillText("Naciśnij 'R', aby spróbować ponownie", canvas.width / 2, canvas.height / 2 + 80);
        
        ctx.textAlign = "left";
    }
}

function loop() {
    update();
    draw();

    requestAnimationFrame(loop);
}

wallTexture.onload = () => {
    loadLevel(0);
    loop();
};