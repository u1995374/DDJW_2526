import {$} from "../library/jquery-4.0.0.slim.module.min.js";
$(function() {
    $('#mode1').on('click', function() {
        sessionStorage.mode = "mode1";
        window.location.href = "mode1.html";
    });

    $('#mode2').on('click', function() {
        sessionStorage.mode = "mode2";
        let savedOptions = localStorage.options ? JSON.parse(localStorage.options) : {};
        let startLevel = (savedOptions.mode2 && savedOptions.mode2.startLevel) ? savedOptions.mode2.startLevel : 1;
        sessionStorage.level = startLevel;
        window.location.href = "game.html";
    });

});