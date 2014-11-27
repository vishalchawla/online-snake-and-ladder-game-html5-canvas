(function(w, d) {
    function board(width, height) {
        this.boardBg = null;
        this.boardFg = null;
        this.width = width;
        this.height = height;
        this.config = {
            maxplayers: 3,
            colors: ["red", "green", "blue"],
            snakes: [{s: 58,e: 9}, {s: 75,e: 40}],
            ladders: [{s: 12,e: 47}, {s: 6,e: 24}]
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
    
    p.move = function(position) {
        var board = this.board;
        var players = board.players;
        
        if (this.id !== board.state.turn) {
            board.log("It's " + players[board.state.turn].name + "'s turn");
            return;
        }
        
        if (this.position == position || position > 100 || position < 1) {
            board.log("Destination <= Origin");
            return;
        }
        
        if (this.position < position) {
            this.removeGoti();
            this.position++;
            this.placeGoti(this.position);
        } else {
            this.removeGoti();
            this.position--;
            this.placeGoti(this.position);
        }
        
        if (this.position != position) {
            var me = this;
            window.setTimeout(function() {
                me.move(position);
            }, 100);
        } else {
            var check = board.isSmooth(this.position);
            if (check) {
                board.log('Not smooth.');
                this.move(check);
            } else {
                board.nextPlayer();
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
        var id = this.players.length;
        if (id >= this.config.maxplayers) {
            this.log("Maximum players limit reached, Can't add more players.");
            return;
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
        var dice = document.getElementById('dice');
        dice.src = 'images/f' + value + '.png';
    }
    
    b.log = function(message) {
        console.log(message);
    }
    
    b.player = player;
    w.saapSeedi = new board(w.innerHeight - 10, w.innerHeight - 10);
})(window, document);