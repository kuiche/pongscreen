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
      gameSpeed: 30,
      initialVelocity: 15,
      bumperHandlers: {
        left: new KeyHandler({
          upKey: 38,
          downKey: 40
        }),
        right: new KeyHandler({
          upKey: 38,
          downKey: 40
        })
      },
      bumperSpeed: 10
    },
    _this = this
  ;

  this.options = util.extend({}, defaultOptions, options);
  this.scores = [0,0];
  this.bumpers = document.getElementsByClassName('bumper');
  this.ball = document.getElementById('ball');
  this.board = document.getElementById('gameboard');
  this.turn = 0;

  [].forEach.call(this.bumpers, function(elem) {
    elem.up = function() {
      elem.style.top = (elem.offsetTop - _this.options.bumperSpeed) + "px";
    };
    elem.down = function() {
      elem.style.top = (elem.offsetTop + _this.options.bumperSpeed) + "px";
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
    resetBall = function() {
      if (_this.turn == 0) {
        ball.style.left = _this.bumpers[0].offsetWidth + "px";
        ball.velocity = [_this.options.initialVelocity, 0]
      } else {
        ball.style.left = (_this.board.offsetWidth - _this.bumpers[1].offsetWidth - _this.ball.offsetWidth) + "px";
        ball.velocity = [-1*_this.options.initialVelocity, 0]
      }
    },

    iteration = function() {
      // move ball
      ball.style.left = (ball.offsetLeft + ball.velocity[0]) + "px";

      _this.options.bumperHandlers.left.iteration(_this.bumpers[0]);
      _this.options.bumperHandlers.right.iteration(_this.bumpers[1]);

      // detect collision
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
        if (bumperIndex === 0) {
          ball.velocity[0] = Math.abs(ball.velocity[0]);
        } else {
          ball.velocity[0] = -Math.abs(ball.velocity[0]);
        }
      }
    }
  ;

  resetBall();

  window.setInterval(iteration, this.options.gameSpeed);
};

Game.prototype.stop = function () {
  window.clearInterval();
};


var startButton = document.getElementById('start'),
  overlay = document.getElementById('overlay')
;
startButton.onclick = function() {
  util.fadeOut(overlay, 10);

  var game = new Game();
  game.reset();

  game.run();
};