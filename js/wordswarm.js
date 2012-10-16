/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

var sounds={};
var wordGame;
var settingDialog;
var mainPage;

function MainPage () 
{
    var timer;
    var state=0; /* 0 for mid state and 1 for buzzing state */
    var singlePlayerGameOverDialog;
    var dualPlayersGameOverDialog;
    var playerId;
    var playerOneScore = 0;
    
    function changeState() 
    {
        if (state === 0) {  /* Mid state */
            $('#main_wings_static').css('display', 'none');
            $('#main_wings_mid_state').css('display', 'inline');
            state = 1;
        } else { /* buzzing state */
            $('#main_wings_mid_state').css('display', 'none');
            $('#main_wings_buzzing_state').css('display', 'inline');
            state = 0;
        }
    }

    function beginStateChange() 
    {
        timer = setInterval (changeState, 500);
        if (settingDialog.themeMusicOn) {
            sounds.themeMusic.play();
        }
    }

    
    function hideMiscBoardItems()
    {
        $('#game_score').hide();
        $('#game_honey_container').hide();
    }

    function handleOnePlayerGameOver() 
    {
        if (singlePlayerGameOverDialog === undefined)
            singlePlayerGameOverDialog = new SinglePlayerGameOverDialog();
        hideMiscBoardItems();
        singlePlayerGameOverDialog.show();
    }

    function startOnePlayerGame() 
    {
        if (wordGame === undefined) {
            wordGame = new Game();
        }
        var e = document.getElementById('game_1player_bee_big_image');
        e.style.display = "inline";
        e.addEventListener('webkitAnimationEnd', function () {
            e.style.display = "none";
            $('#game_honeycomb_grey, #game_go_window_1player').css("display", "inline");
            e.removeEventListener('webkitAnimationEnd', arguments.callee, false);
        }); 
        wordGame.onGameOver (handleOnePlayerGameOver);
    }

    function handleTwoPlayersGameOver()
    {
        if (playerId === 1) {
            playerId = 2;
            // saves the player 1 score
            playerOneScore = wordGame.score;
            $('#first_player_score').html(playerOneScore);
            $('#first_player_score_window').fadeIn();
            setTimeout(function () {
                hideMiscBoardItems();
                $('#first_player_score_window').fadeOut();
                $("#game_player1_score").html(playerOneScore).show();
                $("#game_player2_label").show();
                $('#game_go_2players_id').html("PLAYER " + playerId);
                $('#game_honeycomb_grey, #game_go_2players').css("display", "inline");
            } , 5000);
        } else if (playerId === 2) {
            $("#game_player2_score").html(wordGame.score).show();

            var winner = 0;
            // both player 1 and 2 are done with games. 
            // Compare scores and show the winner.
            if (wordGame.score > playerOneScore) {
                winner = 2;
            } else if (wordGame.score  < playerOneScore) {
                winner = 1;
            }
           
            if (dualPlayersGameOverDialog === undefined)
                dualPlayersGameOverDialog = new DualPlayersGameOverDialog();
            hideMiscBoardItems();
            dualPlayersGameOverDialog.show(winner);
	}
    }

    function startTwoPlayersGame() 
    {
        playerId = 1;
        if (wordGame === undefined) {
            wordGame = new Game();
        }
	$("#game_player1_label, #game_player1_score, #game_player2_label, #game_player2_score").hide();
	var beeBuzzOff = $('.game_bee_buzz_off');
        beeBuzzOff.css("display", "inline");
       
        var e = document.getElementById('game_bee_buzz_off_left');
        e.addEventListener('webkitAnimationEnd', function () {
            beeBuzzOff.css("display", "none");
            $('#game_go_2players_id').html("PLAYER " + playerId);
            $('#game_honeycomb_grey, #game_go_2players').css("display", "inline");
            e.removeEventListener('webkitAnimationEnd', arguments.callee, false);
        }); 
        wordGame.onGameOver (handleTwoPlayersGameOver);
    }

    this.twoPlayersPlayAgain = function twoPlayersPlayAgain ()
    {
        hideMiscBoardItems();
        playerId = 1;
	$("#game_player1_label, #game_player1_score, #game_player2_label, #game_player2_score").hide();
        $('#game_go_2players_id').html("PLAYER " + playerId);
        $('#game_honeycomb_grey, #game_go_2players').css("display", "inline");
    }

    this.show = function show() {
	$("#game_player1_label, #game_player1_score, #game_player2_label, #game_player2_score").hide();
        hideMiscBoardItems();
        $('#main_page').show();
    }

    function init () 
    {
        license_init("license", "main_page");
        settingDialog = new SettingDialog;
        $('#main_how_to_button').click (function() {
            $('#main_page').hide();
            $('#howto_page').show();
            if (settingDialog.themeMusicOn) {
                sounds.themeMusic.stop();
            }
        });

        $('#main_1player_button').click (function() {
            $('#main_page').hide();
            $('#game_page').show();
            if (settingDialog.themeMusicOn) {
                sounds.themeMusic.stop();
            }
            startOnePlayerGame();
        });

        $('#main_2players_button').click (function() {
            $('#main_page').hide();
            $('#game_page').show();
            if (settingDialog.themeMusicOn) {
                sounds.themeMusic.stop();
            }
            startTwoPlayersGame();
        });

        $('#howto_main_menu_button').click (function() {
            $('#howto_page').hide();
            $('#main_page').show();
            if (settingDialog.themeMusicOn) {
                sounds.themeMusic.play();
            }
        });

        sounds.wordSwarmVoice = webappCommon.createSound("audio/Intro_Vo_WordSwarm_R2_Shortened_02.wav");
        sounds.themeMusic = webappCommon.createSound("audio.themeMusic");
        sounds.beesAppear = webappCommon.createSound("audio/BeesAppear.wav");
        sounds.chooseWord = webappCommon.createSound("audio/ChooseWord.wav");
        sounds.negativeBuzzer = webappCommon.createSound("audio/NegativeBuzzer.wav");
        sounds.gameOver = webappCommon.createSound("audio/WinGame.wav");
        sounds.uncoverHoneyComb = webappCommon.createSound("audio/UncoverHoneyComb.wav");
        sounds.honeyDrip = webappCommon.createSound("audio/HoneyDrip.wav");

        sounds.wordSwarmVoice.play();
        setTimeout (beginStateChange, 1000);
    };

    init();
}

window.addEventListener('load', function () 
{
    "use strict";
    webappCommon.useMouseEvents("mouseover");
    mainPage = new MainPage();
});
