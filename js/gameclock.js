/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the 
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

function GameClock (timeLimit)
{
    "use strict";
    var self = this;
    var duration = timeLimit;
    var handleClockExpire = undefined;
    var handleClockTick = undefined;
    var timeLeft;
    var timer = undefined;

    this.onClockExpired = function onClockExpired (callback)
    {
        handleClockExpire = callback;
    }

    this.onEachClockTick = function onEachClockTick (callback)
    {
        handleClockTick = callback;
    }

    function formatTime (seconds) {
        var mins = Math.floor (seconds / 60 );
        var secs = seconds % 60;
        var timeStr = mins + ":";
        if (secs < 10)
            timeStr += "0";
        timeStr += secs;
        return timeStr;
    }

    this.reset  = function reset () {
        timeLeft = duration;
        $('#game_clock').html (formatTime(timeLeft));
        if (timer !== undefined) {
            clearInterval(timer);
            timer = undefined;
        }
        this.hide();
    }

    function tick () {
        timeLeft--;

        if (timeLeft < 0) {
            if (timer !== undefined) {
                clearInterval (timer);
                timer = undefined;
            }
            if (handleClockExpire !== undefined)
                handleClockExpire();    // call the callback function
            return;
        }

        if (handleClockTick !== undefined)
            handleClockTick();

        $('#game_clock').html (formatTime(timeLeft));
    }

    this.hide = function hide () {
       $('#game_clock').hide();
    }

    this.show = function show () {
       $('#game_clock').show();
    }

    this.start = function start() {
        self.show();
        if (timer != undefined) { clearInterval (timer); }
        timer = setInterval (tick, 1000);
    }

    this.pause = function pause() {
            clearInterval (timer);
            timer = undefined;
    }

    this.reset();
}
