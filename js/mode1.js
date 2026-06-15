import {$} from "../library/jquery-4.0.0.slim.module.min.js";
$(function() {
    $('#play').on('click', function() {
        let gameOptions = {
            cards: Number($('#cards').val()),
            difficulty: $('#difficulty').val(),
            groupSize: Number($('#groupSize').val())
        };

        sessionStorage.gameOptions = JSON.stringify(gameOptions);
        window.location.href = "game.html";
    });
});