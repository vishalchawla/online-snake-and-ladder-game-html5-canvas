saapSeedi.init();
var processing = false;

function updateDiceName() {
    var playerName = "", playerColor = "#000000";
    if (saapSeedi.players.length) {
        playerName = saapSeedi.players[saapSeedi.state.turn].name;
        playerColor = saapSeedi.players[saapSeedi.state.turn].color;
    }
    $("#diceName").attr({
        "style": "color: " + playerColor
    }).hide().html(playerName).fadeIn(2000);
}

function movePlayer() {
    processing = true;
    
    if (!saapSeedi.players.length) {
        processing = false;
        return false;
    }
    
    var player = saapSeedi.players[saapSeedi.state.turn];
    
    var random = Math.floor((Math.random() * 6) + 1);

    //Roll dice
    saapSeedi.rollDice();

    //Show dice after 1 to 3 seconds
    setTimeout(function() {
        saapSeedi.showDice(random);

        //Fire move request after 1 second so that player can shift eyes from dice to board
        setTimeout(function() {
            player.position == 1 ? player.move(player.position + random - 1, undefined, random == 6, updateDiceName) : player.move(player.position + random, undefined, random == 6, updateDiceName);
            if (random == 6) {
                //Show message after the piece reaches destination
                setTimeout(function() {
                    alert("You get another bonus chance.");
                }, saapSeedi.config.moveSpeed * 6 + 100);
            }
            
            processing = false;
        }, 1000);
    }, Math.floor((Math.random() * 3000) + 1000));
}

$("#addPlayer").on("click", function(e) {
    var playerName = $("#playerName").val();
    var player = saapSeedi.addPlayer(playerName);
    
    if (player) {
        alert("Player '" + playerName + "' successfully added.");
        $("#playerName").val("");
    }
    
    if (saapSeedi.config.maxPlayers == saapSeedi.state.playerCount) {
        $("#playerName").hide();
        $("#addPlayer").hide();
    }
    
    updateDiceName();
});

$("#diceControl").on("click", function(e) {
    if (processing) {
        return false;
    }
    movePlayer();
});

if (window.innerHeight > window.innerWidth) {
    $("#controls").css({top: window.innerWidth + 20,position: 'absolute'});
} else {
    $("#controls").css({left: window.innerHeight + 20,position: 'absolute'});
}
