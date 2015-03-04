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
      initialVelocity: 30,
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
      bumperSpeed: 40
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
    resetBall = function() {
      if (_this.turn == 0) {
        ball.style.left = _this.bumpers[0].offsetWidth + "px";
        ball.velocity = [_this.options.initialVelocity, 0];
      } else {
        ball.style.left = (_this.board.offsetWidth - _this.bumpers[1].offsetWidth - _this.ball.offsetWidth) + "px";
        ball.velocity = [-1*_this.options.initialVelocity, 0];
      }
    },

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
