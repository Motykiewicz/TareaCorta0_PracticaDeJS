//document.write("-");


// === Utilidades DOM del modal ===
document.getElementById("info-btn").onclick = () => {
  document.getElementById("cuadro-info").classList.add("abierto");
};
document.getElementById("cerrar-cuadro").onclick = () => {
  document.getElementById("cuadro-info").classList.remove("abierto");
};

// === 2048 tetris funcionamiento ===
const ROWS = 5;
const COLS = 4;
const DROP_MS_START = 1000;
const DROP_MS_DELAY = 500; // para una pausa desde cuando cae el bloque hasta que empieza a caer uno nuevo 

let board;           // Matriz 5x4 con valores numéricos
let active = null;
let dropMs = DROP_MS_START;
let dropTimer = null;
let score = 0;
const scoreEl = document.getElementById("score");
document.getElementById("reiniciar").addEventListener("click", resetGame);

// Helpers
const inBounds = (r,c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;
const cellId = (r,c) => `cuadro-${r}-${c}`;
const getEl = (r,c) => document.getElementById(cellId(r,c));

function randomTileValue(){
  // 90% => 2, 10% => 4
  return Math.random() < 0.9 ? 2 : 4;
}

function emptyBoard(){
  return Array.from({length: ROWS}, () => Array(COLS).fill(0));
}

function render(){
  for(let r=0; r<ROWS; r++){
    for(let c=0; c<COLS; c++){
      let v = board[r][c];
      const el = getEl(r,c);
      // Si es la pieza activa, se “pinta” sobre el tablero
      if(active && active.r === r && active.c === c){
        v = active.val;
      }
      // Texto
      el.textContent = v === 0 ? "" : v;
      // Clases de color
      const primeraFilaVacia = (r === 0 && v === 0);
      el.className = `cuadro ${primeraFilaVacia ? 'cuadro-primera-fila':''} tile-${v<=2048?v:2048}`.trim();
    }
  }
  scoreEl.textContent = String(score);
}

function canMove(r, c){
  // Solo verifica colisiones con el tablero y límites para la pieza activa
  if(!inBounds(r,c)) return false;
  // No se permite caer dentro de otra ficha sólida
  // (salvo que sea la posición actual de la pieza activa)
  return board[r][c] === 0 || (active && active.r === r && active.c === c);
}

function spawn(){
  // Intenta spawnear en una columna libre de la fila 0
  const libres = [];
  for(let c=0; c<COLS; c++){
    if(board[0][c] === 0) libres.push(c);
  }
  if(libres.length === 0){
    gameOver();
    return;
  }
  const col = libres[Math.floor(Math.random() * libres.length)];
  active = { r: 0, c: col, val: randomTileValue() };
  // Si inmediatamente no hay espacio para moverse (bloqueo), fin.
  if(!canFallOne(active)){
    // Si ya está bloqueado al nacer, intentamos bloquear y revisar fusiones
    lockAndResolve();
  }
  render();
}

function canFallOne(piece){
  const nr = piece.r + 1;
  const nc = piece.c;
  if(!inBounds(nr, nc)) return false;
  // Puede "atravesar" celdas vacías. Si hay algo, no cae.
  return board[nr][nc] === 0;
}

function dropStep(){
  if(!active){ return; }
  // Si puede caer 1, cae
  if(canFallOne(active)){
    active.r += 1;
    render();
    return;
  }
  // Si no puede caer, bloquea y resuelve fusiones en cascada
  lockAndResolve();
}

function lockAndResolve(){
  if(!active) return;
  const { r, c, val } = active;
  // Bloquea la pieza activa en el tablero
  if(board[r][c] !== 0){
    // Si choca al bloquear, es game over
    gameOver();
    return;
  }
  board[r][c] = val;
  active = null;
  // Después del lock: aplica “gravedad+fusion” hacia abajo, en cascada.
  settleFrom(r, c);
  render();

  // Acelera caída cada 100 puntos para aumentar la dificultad
  if (score > 0 && score % 100 === 0 && dropMs > 200) {
    dropMs-=100;
    startLoop();
  }

  // Chequeo 2048
  if(board.flat().some(v => v === 2048)){
    setTimeout(() => alert("¡Ganaste! Has llegado a 2048 🎉"), 50);
  }
  // Spawnea siguiente
  stopLoop();
  setTimeout(() => {
    spawn();
    startLoop();
  }, DROP_MS_DELAY);
}

function settleFrom(sr, sc){
  // Hacemos “cadenas”: si abajo hay igual, fusiona y el resultado sigue cayendo;
  // si abajo está vacío, sigue cayendo; si no, se detiene.
  let r = sr, c = sc;
  while(true){
    const below = r + 1;
    if(!inBounds(below, c)) break;
    if(board[below][c] === 0){
      // Caída simple
      board[below][c] = board[r][c];
      board[r][c] = 0;
      r = below;
      continue;
    }
    if(board[below][c] === board[r][c]){
      // Fusiona
      const newVal = board[r][c] * 2;
      board[below][c] = newVal;
      board[r][c] = 0;
      score += newVal; // típica suma de 2048
      r = below;       // el fusionado puede seguir cayendo
      continue;
    }
    // No puede caer ni fusionar más
    break;
  }
}

function moveHoriz(dx){
  if(!active) return;
  const nc = active.c + dx;
  const nr = active.r;
  if(!inBounds(nr, nc)) return;
  // Puede moverse si la celda destino está vacía
  if(board[nr][nc] === 0){
    active.c = nc;
    render();
  }
}

function hardDrop(){
  if(!active) return;
  while(canFallOne(active)){
    active.r += 1;
  }
  render();
  lockAndResolve();
}

function startLoop(){
  if(dropTimer) clearInterval(dropTimer);
  dropTimer = setInterval(dropStep, dropMs);
}

function stopLoop(){
  if(dropTimer) clearInterval(dropTimer);
  dropTimer = null;
}

function gameOver(){
  stopLoop();
  render();
  setTimeout(() => alert("Game Over 😵 — No hay espacio para nuevas fichas"), 50);
}

function resetGame(){
  stopLoop();
  board = emptyBoard();
  active = null;
  score = 0;
  dropMs = DROP_MS_START;
  render();
  spawn();
  startLoop();
}

// Controles
document.addEventListener("keydown", (e) => {
  if(!active) return;
  switch(e.key){
    case "ArrowLeft":  e.preventDefault(); moveHoriz(-1); break;
    case "ArrowRight": e.preventDefault(); moveHoriz(1);  break;
    case "ArrowDown":  e.preventDefault(); dropStep();    break;
    case " ":
    case "Spacebar":   e.preventDefault(); hardDrop();    break;
    default: break;
  }
});

// Inicio
resetGame();
