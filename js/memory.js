
const resources = ['../resources/cb.svg', '../resources/co.svg',
                '../resources/sb.svg', '../resources/so.svg',
                '../resources/tb.svg', '../resources/to.svg'];
const back = '../resources/back.svg';

const StateCard = Object.freeze({
  DISABLE: 0,
  ENABLE: 1,
  DONE: 2
});

var game = {
    groupSize : 2,
    selectCards: [],
    items: [],
    states: [],
    setValue: null,
    ready: 0,
    score: 50,
    groupsLeft: 2,
    showtime: 1000,
    penalty: 25,
    goBack: function(idx){
        this.setValue && this.setValue[idx](back);
        this.states[idx] = StateCard.ENABLE;
    },
    goFront: function(idx){
        this.setValue && this.setValue[idx](this.items[idx]);
        this.states[idx] = StateCard.DISABLE;
    },
    select: function(){
        let gameOptions = sessionStorage.gameOptions && JSON.parse(sessionStorage.gameOptions);
        if (sessionStorage.load){ // Carreguem partida
            let toLoad = JSON.parse(sessionStorage.load);
            this.items = toLoad.items;
            this.states = toLoad.states;
            this.selectCards = toLoad.selectCards;
            this.score = toLoad.score;
            this.groupsLeft = toLoad.groupsLeft;
            this.groupSize = toLoad.groupSize;
            this.showtime = toLoad.showtime || 1000;
            this.penalty = toLoad.penalty || 25;
            if(toLoad.level) sessionStorage.level = toLoad.level;
            if(toLoad.mode) sessionStorage.mode = toLoad.mode;
            sessionStorage.removeItem("load");
        }
        else{ // Nova partida o nivell nou
            if(sessionStorage.mode === "mode1" && gameOptions){
                this.groupSize = gameOptions.groupSize;
                this.groupsLeft = gameOptions.cards / gameOptions.groupSize;
                this.score = 50;    

                this.showtime = gameOptions.difficulty === "easy" ? 1500 : gameOptions.difficulty === "hard" ? 600 : 1000;
                this.penalty = gameOptions.difficulty === "easy" ? 15 : gameOptions.difficulty === "hard" ? 40 : 25;
            }
            else if(sessionStorage.mode === "mode2"){
                let savedOptions = localStorage.options ? JSON.parse(localStorage.options) : {};
                this.groupSize = (savedOptions.mode2 && savedOptions.mode2.groupSize) ? savedOptions.mode2.groupSize : 2;
                
                let level = parseInt(sessionStorage.level) || 1;

                this.groupSize = 2 + Math.min(2, Math.floor((level - 1) / 2));
                
                this.groupsLeft = 2 + Math.floor((level - 1) / 2);
                if (this.groupsLeft > 6) this.groupsLeft = 6;
                
                this.showtime = Math.max(350, 1200 - (level - 1) * 150);
                this.penalty = 20 + (level - 1) * 10;
                
                // Mantenir la puntuació entre nivells del Mode 2
                if (level === 1) {
                    this.score = 100;
                } else {
                    this.score = parseInt(sessionStorage.mode2Score) || 50;
                }
            }

            let uniqueItems = [];
            for (let i = 0; i < this.groupsLeft; i++) {
                uniqueItems.push(resources[i % resources.length]);
            }
            shuffle(uniqueItems);
            
            let temp = [];
            for (let i = 0; i < this.groupSize; i++) {
                temp = temp.concat(uniqueItems);
            }

            this.items = temp;          
            shuffle(this.items);   
            this.states = new Array(this.items.length).fill(StateCard.ENABLE);                 
        }
    },
    start: function(){
        this.ready = 0;
        this.items.forEach((_,indx)=>{
            if (this.states[indx] === StateCard.DISABLE ||  this.states[indx] === StateCard.DONE){
                this.ready++;
            }
            else{
                setTimeout(()=>{
                    this.ready++;
                    this.goBack(indx);
                }, 1000 + 100 * indx);
            }
        });
    },
    click: function(indx){  
        if (this.states[indx] !== StateCard.ENABLE || this.ready < this.items.length) return;
        this.goFront(indx);
        if (this.selectCards.length === 0) this.selectCards.push(indx); // Primera carta clicada
        else{ // Teníem carta prèvia
            if (this.items[this.selectCards[0]] === this.items[indx]){ // carta correcta
                this.selectCards.push(indx);
                if (this.selectCards.length === this.groupSize) {
                    this.selectCards.forEach(i => {
                        this.states[i] = StateCard.DONE;
                    });
                    this.groupsLeft--;
                    this.score += 30;
                    this.selectCards = [];

                    if (this.groupsLeft <= 0){
                        if (sessionStorage.mode === "mode2") {
                            alert(`Nivell superat! Puntuació actual: ${this.score} punts.`);
                            let currentLevel = parseInt(sessionStorage.level) || 1;
                            sessionStorage.level = currentLevel + 1;
                            sessionStorage.mode2Score = this.score;
                            window.location.reload(); 
                        } else {
                            alert(`Has guanyat amb ${this.score} punts!!!!`);
                            window.location.assign("../");
                        }
                    }
                }
            }
            else { // carta incorrecta
                this.selectCards.push(indx);
                this.score -= this.penalty;
                this.ready = 0;
                setTimeout(()=>{
                    this.selectCards.forEach(i => {
                        this.goBack(i);
                    });
                    this.selectCards = [];
                    this.ready = this.items.length;
                }, this.showtime);

                if (this.score <= 0){
                    alert ("Has perdut");
                    alert("Has perdut! Joc acabat.");
                    if (sessionStorage.mode === "mode2") {
                        this.saveRanking();
                    }
                    window.location.assign("../");
                }
            }
        }
    },
    save: function(){
        let currentSaveObj = {
        items: this.items,
        states: this.states,
        selectCards: this.selectCards,
        score: this.score,
        groupsLeft: this.groupsLeft,
        groupSize: this.groupSize,
        showtime: this.showtime,
        penalty: this.penalty,
        level: sessionStorage.level,
        mode: sessionStorage.mode,
        date: new Date().toLocaleString()
        };
    
        let to_save = JSON.stringify(currentSaveObj);
        let ret = false;

        fetch('../php/save.php', {
            method: "POST",
            body: to_save,
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => ret = JSON.parse(response))
        .catch (err => console.error(err));

        if (!ret) {
            console.warn("La partida s'ha guardat en local.");
            let savesList = localStorage.saves ? JSON.parse(localStorage.saves) : [];
            savesList.push(currentSaveObj);
            localStorage.saves = JSON.stringify(savesList);
        }
        window.location.assign("../");
    },
    saveRanking: function(){
        let name = prompt("Introdueix el teu nom pel rànquing:");
        if (!name) name = "Anònim";
        
        let ranking = localStorage.ranking ? JSON.parse(localStorage.ranking) : [];
        let finalScore = parseInt(sessionStorage.mode2Score) || 0; 
        let levelReached = parseInt(sessionStorage.level) || 1;
        
        ranking.push({
            name: name,
            score: finalScore,
            level: levelReached - 1 // Nivells completats amb èxit
        });
        
        ranking.sort((a, b) => b.score - a.score);
        // Mantenir només el Top 10
        ranking = ranking.slice(0, 10);
        
        localStorage.ranking = JSON.stringify(ranking);
        sessionStorage.removeItem("level");
        sessionStorage.removeItem("mode2Score");
    }
}

function shuffle(arr){
    arr.sort(function () {return Math.random() - 0.5});
}

export var gameItems;
export function selectCards() { 
    game.select();
    gameItems = game.items;
}
export function clickCard(indx){ game.click(indx); }
export function startGame(){ game.start(); }
export function initCard(callback) { 
    if (!game.setValue) game.setValue = [];
    game.setValue.push(callback); 
}
export function saveGame(){
    game.save();
}