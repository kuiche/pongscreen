function KeyHandler(options) {
  var _this = this;
  this.up = false; this.down = false;

  window.addEventListener("keydown", function(e) {
    if (e.keyCode === options.upKey && !_this.up) {
      _this.down = false;
      _this.up = true;
    } else if (e.keyCode === options.downKey && !_this.down) {
      _this.down = true;
      _this.up = false;
    }
  }, false);
  window.addEventListener("keyup", function(e) {
    if (e.keyCode === options.upKey) {
      _this.up = false;
    } else if (e.keyCode === options.downKey) {
      _this.down = false;
    }
  }, false);
};

KeyHandler.prototype.iteration = function(bumper) {
  if (this.up) {
    bumper.up();
  }
  if (this.down) {
    bumper.down();
  }
};

function Game(options) {
  var defaultOptions = {
      gameSpeed: 10,
      initialVelocity: 10,
      bumperHandlers: {
        left: new KeyHandler({
          upKey: 87, // w
          downKey: 83 // s
        }),
        right: new KeyHandler({
          upKey: 38, // up
          downKey: 40 // down
        })
      },
      bumperSpeed: 20
    },
    _this = this
  ;

  this.options = util.extend({}, defaultOptions, options);
  this.scores = [0,0];
  this.bumpers = document.getElementsByClassName('bumper');
  this.ball = document.getElementById('ball');
  this.board = document.getElementById('gameboard');
  this.server = 0;

  [].forEach.call(this.bumpers, function(elem) {
    elem.up = function() {
      if (elem.offsetTop > _this.board.offsetTop + _this.options.bumperSpeed){
        elem.style.top = (elem.offsetTop - _this.options.bumperSpeed) + "px";
      } else {
        elem.style.top = _this.board.offsetTop;
      }
    };
    elem.down = function() {
      if (elem.offsetTop + elem.offsetHeight < _this.board.offsetTop + _this.board.offsetHeight - _this.options.bumperSpeed){
        elem.style.top = (elem.offsetTop + _this.options.bumperSpeed) + "px";
      } else {
        elem.style.top = (_this.board.offsetTop + _this.board.offsetHeight - elem.offsetHeight) + "px";
      }
    };
  });
};

Game.prototype.reset = function() {
  this.scores = [0,0];
  [].forEach.call(this.bumpers, function(elem) { elem.removeAttribute('style') });
};

Game.prototype.run = function() {
  var _this = this,
    ball = this.ball,
    iteration = function() {
      // move ball
      ball.style.left = (ball.offsetLeft + ball.velocity[0]) + "px";
      ball.style.top = (ball.offsetTop + ball.velocity[1]) + "px";

      _this.options.bumperHandlers.left.iteration(_this.bumpers[0]);
      _this.options.bumperHandlers.right.iteration(_this.bumpers[1]);

      // detect bumper collision
      var bumperIndex = 0;
      if (
          (
            ball.offsetLeft < _this.bumpers[0].offsetWidth
            && ball.offsetTop + ball.offsetHeight >= _this.bumpers[0].offsetTop
            && ball.offsetTop <= _this.bumpers[0].offsetTop + _this.bumpers[0].offsetHeight
          )
        ||
        (
          ball.offsetLeft > _this.board.offsetWidth - _this.bumpers[1].offsetWidth - _this.ball.offsetWidth
          && ball.offsetTop + ball.offsetHeight >= _this.bumpers[1].offsetTop
          && ball.offsetTop <= _this.bumpers[1].offsetTop + _this.bumpers[1].offsetHeight
          && (bumperIndex = 1)
        )
          ) {
        var ballOffset = ball.offsetTop + ball.offsetHeight/2,
          bumperOffset = _this.bumpers[bumperIndex].offsetTop + _this.bumpers[bumperIndex].offsetHeight/2,
          turn = (ballOffset - bumperOffset)/5
        ;

        if (bumperIndex === 0) {
          ball.velocity[0] = Math.abs(ball.velocity[0]);
          ball.velocity[1] += turn;
        } else {
          ball.velocity[0] = -Math.abs(ball.velocity[0]);
          ball.velocity[1] += turn;
        }
      }

      // detect edge collision
      if (ball.offsetTop <= _this.board.offsetTop + _this.options.initialVelocity) {
        ball.velocity[1] = Math.abs(ball.velocity[0]);
      } else if (ball.offsetTop + ball.offsetHeight >= _this.board.offsetTop + _this.board.offsetHeight - _this.options.initialVelocity) {
        ball.velocity[1] = -Math.abs(ball.velocity[0]);
      }

      // score condition
      var roundEnd = false;
      if (ball.offsetLeft <= _this.board.offsetLeft) {
        _this.scores[1]++;
        _this.server = 0;
        roundEnd = true;
      } else if (ball.offsetLeft + ball.offsetWidth >= _this.board.offsetLeft + _this.board.offsetWidth) {
        _this.scores[0]++;
        _this.server = 1;
        roundEnd = true;
      }

      if (roundEnd) {
        _this.updateScoreboard();
        _this.newRound();
      }
    }
  ;

  // call with anon function otherwise we get a crazy error
  this.mainLoop = window.setInterval(function() { iteration() }, this.options.gameSpeed);
};

Game.prototype.stop = function() {
  clearInterval(this.mainLoop);
};

Game.prototype.updateScoreboard = function() {
  var scoreboards = document.getElementsByClassName('score');
  this.scores.forEach(function(score, id) {
    scoreboards[id].innerHTML = score;
  });
};

Game.prototype.newRound = function() {
  var _this = this,
    ball = this.ball,
    // ball to go in a kinda random direction
    verticalV = Math.floor(Math.random() * 5) * (Math.random() < 0.5 ? 1 :-1)
  ;

  console.log(verticalV);
  if (this.server == 0) {
    ball.style.left = this.bumpers[0].offsetWidth + "px";
    ball.velocity = [this.options.initialVelocity, verticalV];
  } else {
    ball.style.left = (this.board.offsetWidth - this.bumpers[1].offsetWidth - this.ball.offsetWidth) + "px";
    ball.velocity = [-1*this.options.initialVelocity, verticalV];
  }

  ball.style.top = (this.bumpers[this.server].offsetTop
    + this.bumpers[this.server].offsetHeight/2
    - ball.offsetHeight/2) + "px";

  clearInterval(this.mainLoop);

  setTimeout(function() { _this.run() }, 300);
};


var startButton = document.getElementById('start'),
  overlay = document.getElementById('overlay')
;
startButton.onclick = function() {
  util.fadeOut(overlay, 10);

  var game = new Game();
  game.reset();

  game.newRound();
};
