import {$} from "../library/jquery-4.0.0.slim.module.min.js";
$(function() {

    $('#mode1').on('click', function() {
        sessionStorage.mode = "mode1";
        window.location.href = "game.html";
    });

    $('#mode2').on('click', function() {
        sessionStorage.mode = "mode2";
        window.location.href = "game.html";
    });

});