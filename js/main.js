import {$} from "../library/jquery-4.0.0.slim.module.min.js";
$(function() {
    $('#play').on('click', 
    function(){
        window.location.assign("./html/mode.html");
    });
    $('#options').on('click', 
    function(){
        window.location.assign("./html/options.html");
    });

    $('#saves').on('click', 
    function(){
        let to_load = localStorage.save;
        fetch('../php/load.php', {
            method: "POST",
            body: JSON.stringify({}),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json())
        .then(json => to_load = (!json.error)?JSON.stringify(json.save): localStorage.save)
        .catch (err => {
            console.error(err);
            console.warn("La partida s'intentarà carregar de local");
        });

        if (!to_load) {
            alert("No hi ha cap partida a carregar");
            return;
        }
        sessionStorage.load = to_load;
        window.location.assign("./html/game.html");
    });

    $('#exit').on('click', 
    function(){
        console.warn("No es pot sortir!");
    });

    $('#ranking').on('click',
    function() {
        let ranking = localStorage.ranking ? JSON.parse(localStorage.ranking) : [];
    
        if (ranking.length === 0) {
            alert("Encara no hi ha cap puntuació registrada al rànquing del Mode 2.");
         return;
        }
    
        let rankingText = "RÀNQUING TOP 10 (MODE 2)\n\n";
        ranking.forEach((player, index) => {
            rankingText += `${index + 1}. ${player.name} - ${player.score} punts (Nivells completats: ${player.level})\n`;
        });
        
        alert(rankingText);
    });
    $('#saves').on('click', function() {
    
        let savesList = localStorage.saves ? JSON.parse(localStorage.saves) : [];

        if (savesList.length === 0) {
            alert("No hi ha cap partida guardada per carregar.");
            return;
        }

        let menuText = "Escriu el NÚMERO de la partida que vols carregar:\n\n";
        savesList.forEach((partida, idx) => { menuText += `${idx + 1}) [${partida.date}] Mode: ${partida.mode} | Punts: ${partida.score}\n`;});

        let opcio = prompt(menuText);
        if (opcio === null) return;

        let indexEscollit = parseInt(opcio) - 1;
        if (indexEscollit >= 0 && indexEscollit < savesList.length) {
            let partidaCarregada = savesList[indexEscollit];
            sessionStorage.load = JSON.stringify(partidaCarregada);
            sessionStorage.mode = partidaCarregada.mode;
            if (partidaCarregada.level) sessionStorage.level = partidaCarregada.level;
            window.location.assign("./html/game.html");
        }else{
            alert("Opció no vàlida. Intenta-ho de nou.");
        }
    });
});