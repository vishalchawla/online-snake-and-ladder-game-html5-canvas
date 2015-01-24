saapSeedi.init();
var players = {};
var processing = false;

function objLength(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            size++;
        }
    }
    return size;
}

function createPlayerButton(name, color) {
    var playerButton = $('<button/>').attr({
        "class": "playerButton"
    }).html(name);
    
    $("#playerButtons").append($('<li/>').attr({
        "style": "color: " + color
    }).html(playerButton));
}

$("#addPlayer").on("click", function(e) {
    var playerName = $("#playerName").val();
    var player = saapSeedi.addPlayer(playerName);
    if (player) {
        createPlayerButton(player.name, player.color);
        players[playerName] = player;
        $("#playerName").val('');
    }
    
    if (objLength(players) == 4) {
        $("#playerName").hide();
        $("#addPlayer").hide();
    }
});

$("#playerButtons").on("click", function(e) {
    var el = e.target;
    
    if (el.className != "playerButton" || processing) {
        return;
    }
    
    saapSeedi.rollDice();
    processing = true;
    setTimeout(function() {
        var random = Math.floor((Math.random() * 6) + 1);
        saapSeedi.showDice(random);
        setTimeout(function() {
            var player = players[$(el).html()];
            player.position == 1 ? player.move(player.position + random - 1) : player.move(player.position + random);
            processing = false;
        }, 1000);
    }, Math.floor((Math.random() * 3) + 1) * 1000);
});

if (window.innerHeight > window.innerWidth) {
    $("#controls").css({top: window.innerWidth + 20,position: 'absolute'});
} else {
    $("#controls").css({left: window.innerHeight + 20,position: 'absolute'});
}