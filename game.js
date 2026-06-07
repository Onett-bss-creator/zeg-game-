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
