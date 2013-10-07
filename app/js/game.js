/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

function Game() {
    "use strict";
    var self = this;
    this.level = 1;
    this.score = 0;
    this.resume = resume;
    this.pause = pause;
    this.newWordPuzzle = newWordPuzzle;
    var honeyLevel = 200;
    var honeyDrainRate = 0;
    var pauseDialog;
    var wordsDataList;
    var wordsUsed = [];
    var wordBegin = false;
    var letters = [];
    var handleGameOver = undefined;
    var randomPathObj = new RandomPath();
    var randomPath;
    var moves= [];
    var numOfChars = 17;    // max. number of letters in the gameboard
    var lettersFound = 0;
    var myWordList;
    var puzzlesCompleted;
    var gameClock;

    function readWordList()
    {
        // read words list from file
        var file = "data/words.json";
        var request = new XMLHttpRequest();
        request.open("GET", file, true);
        request.onreadystatechange = function () {
            if (this.readyState == this.DONE) {
                var requestStr = this.responseText;
                wordsDataList = JSON.parse(requestStr);
            }
        }
        request.send();
    }

    function nextWord ()
    {
        while (true) {
            var i = Math.floor(Math.random() * wordsDataList.length);
            if (wordsUsed[i] === true || wordsDataList[i].length > 6)
                continue;
            wordsUsed[i] = true;    // mark it used.
            return wordsDataList[i];
        }
    }

    function wordObject (word, cells)
    {
        this.word = word;
        this.cells = cells;
    }

    function getWords()
    {
        var nChars = 17;
        var words = "";
        myWordList = [];

        var n = 0;
        while (nChars != 0) {
            var word = nextWord().toUpperCase();
            var len = word.length;
            if ((len === nChars) || (len < (nChars - 2))) {
                words += word;
                var cells = new Array();
                for (var i = 0; i < len; i++) {
                    cells [i] = randomPath[n];
                    n++;
                }
                var wordObj = new wordObject(word, cells);
                myWordList.push(wordObj);
                nChars -= len;
            }
        }
        return words;
    }

    this.onGameOver = function onGameOver(callback)
    {
        handleGameOver = callback;
    }

    function fillGameBoard() {
        randomPath = randomPathObj.generatePath();
        var words = getWords();

        for (var i = 0; i < randomPath.length; i ++) {
            var char = words.charAt(i);
            var ltag = "#game_letter_" + (randomPath[i] + 1);
            var htag = "#game_honeycomb_" + (randomPath[i] + 1);
            letters[randomPath[i]] = char;
            $(ltag).html(char);
            $(ltag).css("display", "inline");

            // make sure the letters "W" and "M" align properly inside the honeycomb.
            if (char === "W") {
                $(ltag).css("margin-left", "-10px");
                $(ltag).css("padding-top", "5px");
            } else if (char === "M") {
                $(ltag).css("margin-left", "-4px");
                $(ltag).css("padding-top", "0px");
            } else {
                $(ltag).css("margin-left", "0px");
                $(ltag).css("padding-top", "0px");
            }

            $(htag).css("display", "inline");
            $(htag).removeClass("game_honeycomb_selected");
        }
    }

    function removeCells (cells)
    {
        for (var i = 0; i < cells.length; i++) {
            $('#game_honeycomb_' + cells[i]).hide();
            $('#game_letter_' + cells[i]).hide();
        }
    }

    function unSelectCells(cells)
    {
        for (var i = 0; i < cells.length; i++) {
            $('#game_honeycomb_' + cells[i]).removeClass('game_honeycomb_selected');
        }
    }

    function wrongGuess (cells)
    {
        $("#wrong_guess").fadeIn();
        setTimeout (function() {
            $("#wrong_guess").fadeOut();
            unSelectCells(cells);
        }, 1000);
        if (settingDialog.soundEffectsOn) {
            sounds.negativeBuzzer.play();
        }
    }

    function isPathValid(path1, path2)
    {
        // check to make sure the selected word follows the exact path.
        if (path1.length !== path2.length) {
            return false;
        }

        for (var i = 0; i < path2.length; i++) {
            var match = false;
            for (var j = 0; j < path1.length; j++) {
                if ((path2[i] - 1) === path1[j]) {
                    match = true;
                    break;
                }
            }
            if (match === false) {
                return false;
            }
        }
        return true;
    }

    function validateSelectedWord (cells)
    {
        var i;
        var w = "";

        for (i = 0; i < cells.length; i++) { w += letters[cells[i] - 1]; }

        // check to see if the word is in the list
        var len = w.length;
        for (i = 0; i < myWordList.length; i++) {
            if (w === myWordList[i].word) {
                if (isPathValid(myWordList[i].cells, cells) === false) {
                    wrongGuess(cells);
                    return;
                }
                self.score = self.score + len;
                $('#game_score').html(self.score);
                removeCells(cells)
                // update the answer on the right
                for (var j = 0; j < len; j++) {
                    var s = w.charAt(j);
                    var e = "#game_word" + (i+1) + "_char" + (j+1);
                    $(e).html(s);
                }
                lettersFound += len;
                updateHoneyLevel (len * honeyDrainRate);
                return;
            }
        }
        wrongGuess(cells);
    }

    function validateMove (e)
    {
        var i;
        if (moves.length > 0) {
            var lastMove = moves[moves.length - 1];
            var adj = randomPathObj.adj[lastMove - 1];
            if (adj.indexOf(e - 1) === -1) {
                return false;
            }
        }

        for (i = 0; i < moves.length; i++) {
            if (e === moves[i])  {
                if ((i + 1) < moves.length)  {
                    var cells = moves.slice(i+1);
                    unSelectCells(cells);
                    moves.splice(i, (moves.length - i + 1));
                    break;
                }
            }
        }
        moves.push(e);
        if (settingDialog.soundEffectsOn) {
            sounds.chooseWord.play();
        }
        return true;
    }

    function handleMouseUp()
    {
        wordBegin = false;
        $(document).off('mouseup touchend', handleMouseUp);
        if (moves.length > 0) {
            validateSelectedWord(moves);
            if (lettersFound === numOfChars) {
                puzzlesCompleted += 1;
                if (puzzlesCompleted === 3) {
                    showLevelCompletedMessage();
                } else {
                    setTimeout ('wordGame.newWordPuzzle()', 1000);
                }
            }
        }
    }

    // "element" is a number which can be used to locate an element,
    // rather than the actual DOM element
    this.handleMouseDown = function (element)
    {
        wordBegin = true;
        moves = [];
        validateMove(element);
        $('#game_honeycomb_' + element).addClass('game_honeycomb_selected');
        $(document).on('mouseup touchend', handleMouseUp);
    }

    this.handleMouseOver = function (element)
    {
        if (wordBegin) {
            if (validateMove(element) === true)  {
                $('#game_honeycomb_' + element).addClass('game_honeycomb_selected');
            }
        }
    }

    function showLevelCompletedMessage ()
    {

        gameClock.reset();
        var e = $('#game_level_completed_msg');
        var message = "Level " + self.level + " Completed!";
        e.html(message);
        e.show();
        setTimeout (function() {
            e.hide();
            nextLevel();
        }, 3000);
    }

    function updateHoneyLevel(amount)
    {
        honeyLevel += amount;
        if (honeyLevel > 200) { honeyLevel = 200; }
        var newHeight = honeyLevel + "px";
        var radius = 0;
        if (honeyLevel > 185) {
            radius = 15 - (200 - honeyLevel);
        }
        $('#game_honey_container').css("-webkit-border-top-left-radius", (radius+"px"));
        $('#game_honey_container').css("-webkit-border-top-right-radius", (radius+"px"));
        $('#game_honey_container').css("height", newHeight);
        if (honeyLevel < 1 && handleGameOver !== undefined) {
            self.reset();
            $('#game_honeycomb_grey').show();
            handleGameOver();
        }
    }

    function handleClockTick()
    {
        updateHoneyLevel (-(honeyDrainRate)); // per clock tick
    }

    function handleClockExpire()
    {
        self.reset();
        $('#game_honeycomb_grey').show();
        handleGameOver();
    }

    function loadHtml ()
    {
        // Create the honeycomb game board and game bees elements
        var i, j;
        var h = 1;
        var html;
        for (j = 1; j < 6; j++) {
            for (i = 1; i < 8; i++) {
                if ((((i % 2) != 0) && ((j % 2) === 0)) ||
                    (((i % 2) === 0) && ((j % 2) != 0))) {
                    html = '<div id="game_honeycomb_' + h +
                           '" class="game_honeycomb game_honeycomb_row' + i +
                           ' game_honeycomb_column' + j + '"></div>';
                    $('#game_honeycombs').append(html);

                    html = '<div id="game_letter_' + h +
                           '" class="game_letter game_honeycomb_row' + i +
                           ' game_letter_column' + j + '"' +
                           ' data-element-number="' + h + '"></div>';
                    $('#game_honeycombs').append(html);

                    html =  '<div id="bee_' + h +
                            '" class="game_bee game_bee_row' + i +
                            ' game_bee_column' + j + '"></div>';
                    $('#game_bees').append(html);

                    html =  '<div id="wings_' + h +
                            '" class="game_bee_wings game_bee_wings_row' + i +
                            ' game_bee_wings_column' + j + '"></div>';

                    $('#game_bees').append(html);

                    h++;
                } // end if
            }  // end for
        } // end for

        // add delegated event handlers for touch/mouse events
        $('#game_honeycombs').delegate('[data-element-number]', 'mousedown', function (e) {
            e.preventDefault();
            e.stopPropagation();

            var elementNumber = $(e.target).attr('data-element-number');
            wordGame.handleMouseDown(elementNumber);
        });

        $('#game_honeycombs').delegate('[data-element-number]', 'mouseover', function (e) {
            e.preventDefault();
            e.stopPropagation();

            var elementNumber = $(e.target).attr('data-element-number');
            wordGame.handleMouseOver(elementNumber);
        });
    }

    function init()
    {
        readWordList();

        setTimeout(loadHtml, 0);
        pauseDialog = new PauseDialog;
        gameClock = new GameClock(180);
        gameClock.onClockExpired(handleClockExpire);
        gameClock.onEachClockTick(handleClockTick);

        // hook up the go button for 1 player
        $('#game_go_window_label_go').click (function () {
            $('#game_go_window_1player').fadeOut();
            $('#game_bees').fadeIn();
            if (settingDialog.soundEffectsOn) {
                sounds.beesAppear.play();
            }
            setTimeout ('wordGame.newGame()', 4500);
        });

        // hook up the go button for 2 players
        $('#game_go_2players_go').click (function () {
            $('#game_go_2players').fadeOut();
            $('#game_player1_label').show();
            $('#game_bees').fadeIn();
            if (settingDialog.soundEffectsOn) {
                sounds.beesAppear.play();
            }
            setTimeout ('wordGame.newGame()', 4500);
        });

        // hook up the setting button
        $('#game_setting').click (function() {
            gameClock.pause();
            settingDialog.onDialogClose(resume);
            settingDialog.open();
        });

        // hook up the pause button
        $('#game_pause_btn').click (function () {
            pauseDialog.open();
        });
    }

    this.reset = function reset() {
        $('#game_pause_btn').hide();
        $('#game_honeycombs').hide();
        $('#game_honeycomb_darkbrown').hide();
        $('#game_honeycomb_grey').hide();
        $('#game_level_label').hide();
        $('#game_setting').hide();
        var e = $('#game_words');
        e.empty();
        gameClock.reset();
    }

    this.newGame = function newGame() {

        self.level = 0;
        self.score = 0;
        $('#game_score').html("");
        $('#game_bees').hide();
        $('#game_pause_btn').show();
        $('#game_honeycomb_grey').hide();
        $('#game_honeycomb_darkbrown').css("display", "inline");
        $('#game_honey_container').show();
        $('#game_score').show();
        $('#game_setting').show();
        nextLevel();
     }

     function pause() {
         // restart the game clock
         gameClock.pause();
     }

     function resume() {
         // restart the game clock
         gameClock.start();
     }

     function nextLevel() {
        puzzlesCompleted = 0;
        honeyLevel = 200;
        var newHeight = honeyLevel + "px";
        $('#game_honey_container').css("-webkit-border-top-left-radius", "15px");
        $('#game_honey_container').css("-webkit-border-top-right-radius", "15px");
        $('#game_honey_container').css("height", newHeight);

        self.level += 1;
        honeyDrainRate = self.level * 1;
        if (honeyDrainRate > 20) { honeyDrainRate = 20; };

        $('#game_level_label').html('LEVEL ' + self.level).show();

        for (var i = 0; i < wordsDataList.length; i++) { wordsUsed[i] = false; }

        newWordPuzzle();
        gameClock.reset();
        gameClock.start();
     }

     function newWordPuzzle() {
        lettersFound = 0;

        for (var i = 0; i < numOfChars; i++) { letters[i] = " "; }

        fillGameBoard();

        var e = $('#game_words');
        e.empty();
        var html;
        for (var i = 0; i < myWordList.length; i ++ ) {
            var w = myWordList[i].word;
            var top = "top: " + (i * 27) + "px;";
            for (var j = 0; j < w.length; j++) {
                var s = "&emsp;";
                if (j === 0)
                    s = w.charAt(j);

                html = '<div id="game_word' + (i+1) + '_char' + (j+1) +
                       '" class="game_answerText" style="' + top +
                        ' left: ' + (j * 25 + 5) + 'px;">' + s + '</div>';
                e.append(html);
            }

        }
        $('#game_honeycombs').show();
    }

    init();
}
