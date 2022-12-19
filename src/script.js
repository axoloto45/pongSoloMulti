const canvas = document.getElementById("pong");
const context = canvas.getContext("2d");
const timer = document.getElementById("timer");
const score = document.getElementById("score");
const btn = document.querySelector('#btn');
const radioButtons = document.querySelectorAll('input[name="mode"]');
const grid = 15;
const racketHeight = grid * 5;
const maxRacketY = canvas.height - grid - racketHeight;
const racketSpeed = 10;
const ballSpeed = 8;
const FRAME_PERIOD = 60;
let incrementScore = 0;

let sec = 0;
let cent = 0;

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: grid,
  height: grid,

  dx: ballSpeed,
  dy: -ballSpeed,
  acceleration: 1.0,

  start: false,
  reset: false,
  gameFinished: false,
  mode: 1,
};

//racket for solo mode
const racket = {
  x: grid * 2,
  y: canvas.height / 2 - racketHeight / 2,
  width: grid,
  height: racketHeight,
  dy: 0,
};

//left racket for 1v1
const leftRacket = {
  x: grid * 2,
  y: canvas.height / 2 - racketHeight / 2,
  width: grid,
  height: racketHeight,
  score: 0,
  dy: 0,
};

//right racket for 1v1
const rightRacket = {
  x: canvas.width - grid * 3,
  y: canvas.height / 2 - racketHeight / 2,
  width: grid,
  height: racketHeight,
  score: 0,
  dy: 0,
};

// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}


function draw() {
  //draw walls
  context.fillRect(0, canvas.height - grid, canvas.width, grid);
  context.fillRect(0, 0, canvas.width, grid);
  //right wall for solo mode
  if (ball.mode === 1) {
    context.fillRect(canvas.width - grid, 0, grid, canvas.height);
  }

  //draw ball
  context.fillRect(ball.x, ball.y, grid, grid);

  //draw racket for solo mode
  if (ball.mode === 1) {
    context.fillRect(racket.x, racket.y, racket.width, racket.height);
  }
  //draw left then right racket for 1v1 mode
  else {
    context.fillRect(leftRacket.x, leftRacket.y, leftRacket.width, leftRacket.height);
    context.fillRect(rightRacket.x, rightRacket.y, rightRacket.width, rightRacket.height);
  }
}

function moveBalls() {
  //ball moves
  ball.x += ball.dx * ball.acceleration;
  ball.y += ball.dy * ball.acceleration;
  if ((ball.reset === false && ball.mode === 1 || ball.mode === 2) && ball.acceleration < 2) { 
    //ball go faster and faster
    ball.acceleration += 0.001;
  }
  if (ball.acceleration > 2) {
    ball.acceleration = 2;
  }
}

function moveRackets() {
  leftRacket.y += leftRacket.dy;
  rightRacket.y += rightRacket.dy;
}

function wallRacketColision() {
  //left racket colision with top wall
  if (leftRacket.y < grid) {
    leftRacket.y = grid;
  //left racket colision with bottom wall
  } else if (leftRacket.y > maxRacketY) {
    leftRacket.y = maxRacketY;
  }

  if (rightRacket.y < grid) {
    rightRacket.y = grid;
  } else if (rightRacket.y > maxRacketY) {
    rightRacket.y = maxRacketY;
  }
}

function wallColision() {
  wallCol = false;
  //ball colision with top and bottom wall
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
    wallCol = true;
  } else if (ball.y > canvas.height - grid * 2) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
    wallCol = true;
  }
  //ball colision with right wall for solo mode
  else if (ball.x > canvas.width - 2 * grid && ball.mode === 1) {
    ball.dx *= -1;
    ball.x = canvas.width - 2 * grid;
    wallCol = true;
  }
  //play colision song
  if (wallCol === true) {
    playSound("../songs/colision.mp3");
  }
}

function racketColision() {
  //racket colision with ball for solo mode
  if (collides(ball, racket)) {
    ball.dx *= -1;
    ball.x = racket.x + racket.width;
    playSound("../songs/colision.mp3");
  }
}

function racketColision1v1() {
  //left racket colision with ball for 1v1 mode
  if (collides(ball, leftRacket)) {
    ball.dx *= -1;
    ball.x = leftRacket.x + leftRacket.width;
    playSound("../songs/colision.mp3");
  //right racket colision with ball for 1v1 mode
  } else if (collides(ball, rightRacket)) {
    ball.dx *= -1;
    ball.x = rightRacket.x - rightRacket.width;
    playSound("../songs/colision.mp3");
  }
}

function goalVerif() {
  //ball go in the goal
  if (ball.x < 0 || ball.x > canvas.width) {
    //goal in solo mode
    if (ball.mode === 1) {
      score.textContent = "Score => " + timer.textContent;
      timer.textContent = "0:00";
    //right player goals in 1v1
    } else if (ball.x < 0) {
      setTimeout(function() {
        if (leftRacket.score !== 7 && rightRacket.score !== 7) {
          ball.reset = false;
        }
      }, 2000);
      //increase score and displays it
      rightRacket.score++;
      timer.textContent = leftRacket.score + "-" + rightRacket.score;
      ball.dx = ballSpeed;
    //left player goals in 1v1
    } else {
      setTimeout(function() {
        if (leftRacket.score !== 7 && rightRacket.score !== 7) {
          ball.reset = false;
        }
      }, 2000);
      //increase score and displays it
      leftRacket.score++;
      timer.textContent = leftRacket.score + "-" + rightRacket.score;
      ball.dx = - ballSpeed;
    }
    if (ball.mode === 2) {
      score.textContent = "";
    }
    //replace ball at the center of the field and reset some settings
    ball.reset = true;
    ball.x = canvas.width / 2;
    ball.y = Math.random() * (canvas.height - grid * 2);

    if (ball.mode === 1) {
      ball.dx = 0;
    }
    ball.acceleration = 1;
    sec = 0;
    cent = 0;
  }
}

function addTime() {
  //add time per 0.01 sec
  if (ball.reset === false && ball.start === true && ball.mode === 1) {
    if (cent < 10) {
      timer.textContent = sec + ":0" + cent;
    } else if (cent >= 10) {
      timer.textContent = sec + ":" + cent;
    }
    cent++;
    if (cent === 100) {
      sec++;
      cent = 0;
    }
  }
}

//play sound
function playSound(name) {
  const audio = new Audio(name);
  audio.play();
}

//loop to make game works
function loop() {
  requestAnimationFrame(loop);
  //refresh image
  context.clearRect(0, 0, canvas.width, canvas.height);

  draw();
  if (ball.mode === 2) {
    moveRackets();
    racketColision1v1();
  }
  if (ball.mode === 2 && ball.reset === false) {
    moveBalls();
  }
  if (ball.mode === 1) {
    moveBalls();
    racketColision();
  }
  wallRacketColision();
  wallColision();
  goalVerif();
  //console.log(ball.acceleration);
}

window.addEventListener("keydown", (e) => {
  //restart solo game
  if (ball.reset === true && e.key === "Enter") {
    ball.dx = ballSpeed;
    ball.reset = false;
    //reset after goal in 1v1
    if (ball.gameFinished === true) {
      timer.style.visibility = "visible";
    }
    if (ball.mode === 2 && ball.gameFinished === true) {
      ball.gameFinished = false;
      leftRacket.score = 0;
      rightRacket.score = 0;
      timer.textContent = "0-0";
    }
  }
});

window.addEventListener("mousemove", (e) => {
  //move racket in solo
  if (ball.mode === 1) {
    posY = e.pageY - 25 - racket.height / 2;
    if (posY >= 15 && posY <= 410) {
      racket.y = posY;
    } else if (posY < 15.5) {
      racket.y = grid;
    } else {
      racket.y = maxRacketY;
    }
  }
});

document.addEventListener("keydown", (e) => {
  //move rackets in 1v1 
  if (ball.mode === 2) {
    if (e.key === "z") {
      leftRacket.dy = -racketSpeed;
    } else if (e.key === "s") {
      leftRacket.dy = racketSpeed;
    }
    if (e.key === "p") {
      rightRacket.dy = -racketSpeed;
    } else if (e.key === "m") {
      rightRacket.dy = racketSpeed;
    }
  }
});

document.addEventListener("keyup", (e) => {
  //stop rackets in 1v1
  if (ball.mode === 2) {
    if (e.key === "z" || e.key === "s") {
      leftRacket.dy = 0;
    } else if (e.key === "p" || e.key === "m") {
      rightRacket.dy = 0;
    }
  }
});

btn.addEventListener("click", () => {
  //choix du mode
  let selectedMode;
  for (const radioButton of radioButtons) {
      if (radioButton.checked) {
          selectedMode = radioButton.value;
          break;
      }
  }
  if (selectedMode === "solo") {
    //start solo mode
    if (ball.start === false) {
      ball.mode = 1;
      ball.start = true;
      requestAnimationFrame(loop);
    }
    else {
      ball.gameFinished = true;
      ball.reset = true;
      ball.mode = 1;
    }
  }
  else if (selectedMode === "1v1") {
    //start 1v1 mode
    if (ball.start === false) {
      ball.mode = 2;
      ball.start = true;
      requestAnimationFrame(loop);
    }
    else {
      leftRacket.score = 0;
      rightRacket.score = 0;
      ball.gameFinished = true;
      ball.mode = 2;
    }
  }
});

setInterval(function () {
  //flash score
  if ((leftRacket.score === 7 || rightRacket.score === 7) && ball.reset === true) {
    ball.gameFinished = true;
    if (incrementScore % 2 === 0) {
      timer.style.visibility = "hidden";
    } else {
      timer.style.visibility = "visible";
    }
    incrementScore++;
  }
}, 800);

setInterval(addTime, 10);
