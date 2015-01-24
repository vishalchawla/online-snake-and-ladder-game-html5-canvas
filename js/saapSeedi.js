(function(w, d) {
    function board(width, height) {
        this.boardBg = null;
        this.boardFg = null;
        this.width = width;
        this.height = height;
        this.config = {
            maxplayers: 4,
            colors: ["red", "green", "blue", "pink"],
            snakeLadderLayer: "images/snake_ladder_layer.gif",
            snakes: [{s: 36,e: 2}, {s: 46,e: 29}, {s: 79,e: 42}, {s: 93,e: 53}],
            ladders: [{s: 8,e: 49}, {s: 22,e: 57}, {s: 54,e: 85}, {s: 61,e: 98}]
        };
        this.state = {
            playerCount: 0,
            turn: 0
        };
        this.blocks = [];
        this.players = [];
    }
    
    var player = function(board, id, name, color) {
        this.board = board;
        this.id = id;
        this.name = name;
        this.color = color;
        this.position = 1;
    }
    
    var b = board.prototype;
    var p = player.prototype;
    
    p.placeGoti = function(position) {
        var playerId = this.id;
        var board = this.board;
        var blockX = board.blocks[position].x;
        var blockY = board.blocks[position].y;
        var blockW = board.width / 10;
        var blockH = board.height / 10;
        var gotiR = board.height / 60;
        var gotiX = blockX + (blockW / 10) + gotiR + (playerId * gotiR);
        var gotiY = blockY + (0.9 * blockH) - gotiR;
        var boardFg = board.boardFg;
        boardFg.beginPath();
        boardFg.arc(gotiX, gotiY, gotiR, 0, 2 * Math.PI, false);
        boardFg.fillStyle = this.color;
        boardFg.fill();
        boardFg.lineWidth = gotiR / 3;
        boardFg.strokeStyle = '#ffffff';
        boardFg.stroke();
    }
    
    p.removeGoti = function() {
        var board = this.board;
        var players = board.players;
        var playerId = this.id;
        var position = this.position;
        
        var blockX = board.blocks[position].x;
        var blockY = board.blocks[position].y;
        var blockW = board.width / 10;
        var blockH = board.height / 10;
        var boardFg = board.boardFg;
        boardFg.clearRect(blockX, blockY, blockW, blockH);
        
        var player_id;
        for (player_id in players) {
            if (players[player_id]['position'] == position && player_id != playerId) {
                players[player_id].placeGoti(position);
            }
        }
    }
    
    p.move = function(position, speed, isSpecial) {
        var player = this;
        var board = player.board;
        var players = board.players;
        
        if (typeof isSpecial == "undefined" && player.id !== board.state.turn) {
            board.log("It's " + players[board.state.turn].name + "'s turn.");
            return false;
        }
        
        if (player.position == position || position > 100 || position < 1) {
            board.log("Invalid move.");
            return false;
        }
        
        if (player.position < position) {
            player.removeGoti();
            player.position++;
            player.placeGoti(player.position);
        } else {
            player.removeGoti();
            player.position--;
            player.placeGoti(player.position);
        }
        
        speed = typeof speed !== 'undefined' ? speed : 150;
        
        if (player.position != position) {
            window.setTimeout(function() {
                player.move(position, speed, isSpecial);
            }, speed);
        } else {
            var check = board.isSmooth(player.position);
            if (check) {
                setTimeout(function() {
                    player.move(check, 15, isSpecial);
                }, 1000);
            } else {
                if (player.position != 1) {
                    var players_id;
                    for (players_id in players) {
                        if (players[players_id]['position'] == player.position && players_id != player.id) {
                            board.log(player.name + " killed " + players[players_id]['name'] + ".");
                            setTimeout(function() {
                                players[players_id].move(1, 15, 1);
                            }, 1000);
                            break;
                        }
                    }
                }
                if (!isSpecial) {
                    board.nextPlayer();
                }
                return true;
            }
        }
    }
    
    b.init = function() {
        if (window.innerHeight > window.innerWidth) {
            this.width = this.height = window.innerWidth - 10;
        }
        this.createBoard();
        
        var img = new Image('images/f0.gif');
        img = new Image('images/f1.png');
        img = new Image('images/f2.png');
        img = new Image('images/f3.png');
        img = new Image('images/f4.png');
        img = new Image('images/f5.png');
        img = new Image('images/f6.png');
    }
    
    b.createBoard = function() {
        var canvas = document.createElement('canvas');
        canvas.height = this.height;
        canvas.width = this.width;
        canvas.style.zIndex = 1;
        document.body.appendChild(canvas);
        var boardBg = this.boardBg = canvas.getContext('2d');
        
        canvas = document.createElement('canvas');
        canvas.height = this.height;
        canvas.width = this.width;
        canvas.style.zIndex = 2;
        document.body.appendChild(canvas);
        var boardFg = this.boardFg = canvas.getContext('2d');
        
        canvas = document.createElement('canvas');
        canvas.height = this.height;
        canvas.width = this.width;
        canvas.style.zIndex = 3;
        var snakeLadderLayer = new Image();
        snakeLadderLayer.src = this.config.snakeLadderLayer;
        snakeLadderLayer.onload = function() {
            canvas.getContext('2d').drawImage(snakeLadderLayer, 0, 0, canvas.width, canvas.height);
            document.body.appendChild(canvas);
        }
        
        var a = 100, b = 91, w = this.width / 10, h = this.height / 10, y = -h, x, color, i;
        boardBg.font = w / 4 + 'px Georgia';
        while (a > 0) {
            x = 0;
            y += h;
            for (i = a; i >= b; i--) {
                color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
                boardBg.fillStyle = color
                boardBg.fillRect(x, y, w, h);
                boardBg.fillStyle = '#ffffff';
                boardBg.fillText(i, x + (w / 10), y + (h / 5));
                this.blocks[i] = {
                    x: x,
                    y: y,
                    color: color
                };
                x += w;
            }
            x = 0;
            y += h;
            for (i = b - 10; i <= a - 10; i++) {
                color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
                boardBg.fillStyle = color
                boardBg.fillRect(x, y, w, h);
                boardBg.fillStyle = '#ffffff';
                boardBg.fillText(i, x + (w / 10), y + (h / 5));
                this.blocks[i] = {
                    x: x,
                    y: y,
                    color: color
                };
                x += w;
            }
            a = a - 20;
            b = b - 20;
        }
    }
    
    b.addPlayer = function(name) {
        if (!name) {
            this.log('Please specify name of the player.');
            return false;
        }
        
        var player_id;
        for (player_id in players) {
            if (players[player_id]['name'] == name) {
                this.log(name + " is already playing, Can't you specify some other name  :/");
                return false;
            }
        }
        
        var id = this.players.length;
        if (id >= this.config.maxplayers) {
            this.log("Maximum players limit reached, Can't add more players");
            return false;
        }
        
        var player = new this.player(this, id, name, this.config.colors[id]);
        player.placeGoti(1);
        this.players.push(player);
        this.state.playerCount++;
        return player;
    }
    
    b.nextPlayer = function() {
        if (this.state.turn + 1 == this.state.playerCount) {
            this.state.turn = 0;
        } else {
            this.state.turn++;
        }
    }
    
    b.isSmooth = function(position) {
        var snakes = this.config.snakes;
        for (var key in snakes) {
            if (snakes[key].s == position) {
                return snakes[key].e;
            }
        }
        
        var ladders = this.config.ladders;
        for (var key in ladders) {
            if (ladders[key].s == position) {
                return ladders[key].e;
            }
        
        }
        return false;
    }
    
    b.rollDice = function() {
        var dice = document.getElementById('dice');
        dice.src = 'images/f0.gif';
    }
    
    b.showDice = function(value) {
        value = parseInt(value);
        if (isNaN(value) || value < 1 || value > 6) {
            this.log("Invalid value.");
            return false;
        }
        var dice = document.getElementById('dice');
        dice.src = 'images/f' + value + '.png';
    }
    
    b.log = function(message) {
        alert(message);
		//console.log(message);
    }
    
    b.player = player;
    w.saapSeedi = new board(w.innerHeight - 10, w.innerHeight - 10);
})(window, document);