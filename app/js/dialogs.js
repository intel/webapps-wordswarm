/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the 
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

function SettingDialog(onDialogCloseCallback)
{
    self = this;
    this.soundEffectsOn;
    this.themeMusicOn;

    var $settingPage = $('#setting_page');
    var $themeSwitch = $('#setting_theme_music_switch');
    var $themeSwitchOn = $('#setting_theme_music_switch_on');
    var $themeSwitchOff = $('#setting_theme_music_switch_off');
    var $soundSwitch = $('#setting_sound_effects_switch');
    var $soundSwitchOn = $('#setting_sound_effects_switch_on');
    var $soundSwitchOff = $('#setting_sound_effects_switch_off');

    var themeSid = "com.intel.wordswarm.theme";
    var soundSid = "com.intel.wordswarm.sound";

    try {
        self.soundEffectsOn = JSON.pare(localStorage[soundSid]);
    }
    catch (e) {
        self.soundEffectsOn = true;
        localStorage[soundSid] = JSON.stringify(self.soundEffectsOn);
    }

    try {
        self.themeMusicOn = JSON.pare(localStorage[themeSid]);
    }
    catch (e) {
        self.themeMusicOn = true;
        localStorage[themeSid] = JSON.stringify(self.soundEffectsOn);
    }

    this.onDialogClose = function onDialogClose (closeCallback) {
        self.callback = closeCallback;
    }

    this.open = function open() {
        $settingPage.show();
    }

    // hook up the done button
    $('#setting_done_button').click (function() {
        $settingPage.hide();
        if (self.callback !== undefined) {
            self.callback();   //notify the caller setting dialog is closed.
        }
    });


    $themeSwitchOn.click (function() {
        self.themMusicOn = true;
        localStorage[themeSid] = JSON.stringify(self.themMusicOn);
        $themeSwitch.css("left", "536px")
        $themeSwitchOn.css("color", "#393739")
        $themeSwitchOff.css("color", "#575758")
    });

    $themeSwitchOff.click (function() {
        self.themMusicOn = false;
        localStorage[themeSid] = JSON.stringify(self.themMusicOn);
        $themeSwitch.css("left", "595px")
        $themeSwitchOff.css("color", "#393739")
        $themeSwitchOn.css("color", "#575758")
    });

    $soundSwitchOn.click (function() {
        self.soundEffectsOn = false;    // default
        localStorage[soundSid] = JSON.stringify(self.soundEffectsOn);
        $soundSwitch.css("left", "536px")
        $soundSwitchOn.css("color", "#393739")
        $soundSwitchOff.css("color", "#575758")
    });

    $soundSwitchOff.click (function() {
        self.soundEffectsOn = false;
        localStorage[soundSid] = JSON.stringify(self.soundEffectsOn);
        $soundSwitch.css("left", "595px")
        $soundSwitchOff.css("color", "#393739")
        $soundSwitchOn.css("color", "#575758")
    });
}

function PauseDialog() {
    "use strict";
    var $pauseDialog = $('#pause_page');

    function init() {
        $('#game_pause_window_label_resume').click (function () {
            $pauseDialog.hide();
            wordGame.resume();
        }); 

        $('#game_pause_window_label_home').click (function () {
            $('#game_page').hide();
            $pauseDialog.hide();
            mainPage.show();
            wordGame.reset();
        }); 
    }   

    this.open = function open () {
        wordGame.pause();
        $('#game_pause_window_label_level').html("LEVEL " + wordGame.level)
        $pauseDialog.show();
    }   

    init();
}

function SinglePlayerGameOverDialog() {
    "use strict";
    var $gameoverDialog = $('#gameover_1player_window');

    function init () {
        $('#gameover_1player_play_again').click (function() {
            $gameoverDialog.hide();
            wordGame.newGame();
        });
 
        $('#gameover_1player_menu_home').click (function() {
            $gameoverDialog.hide();
            $('#game_page').hide();
            mainPage.show();
            wordGame.reset();
        });
    }

    this.show = function show() {
        $("#gameover_1player_score").html (wordGame.score);
        $("#gameover_1player_level_reached").html ("LEVEL REACHED: " + wordGame.level);
        $gameoverDialog.show();
    }

    init ();
}

function DualPlayersGameOverDialog() {
    "use strict";
    var $gameoverDialog = $('#gameover_2players_window');

    function init () {
        $('#gameover_2players_play_again').click (function() {
            $gameoverDialog.hide();
            mainPage.twoPlayersPlayAgain();
        });
 
        $('#gameover_2players_menu_home').click (function() {
            $gameoverDialog.hide();
            $('#game_page').hide();
            mainPage.show();
            wordGame.reset();
        });
    }

    this.show = function show(id) {
        if (id === 0) {
            $("#gameover_2players_id").html("GAME");
            $("#gameover_2players_win_label").html("TIES!")
        } else {
            $("#gameover_2players_id").html("PLAYER " + id);
            $("#gameover_2players_win_label").html("WINS!")
        }
       
        $gameoverDialog.show();
    }

    init ();
}
