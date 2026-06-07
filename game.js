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