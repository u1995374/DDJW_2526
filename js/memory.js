
const resources = ['../resources/cb.png', '../resources/co.png',
                '../resources/sb.png', '../resources/so.png',
                '../resources/tb.png', '../resources/to.png'];
const back = '../resources/back.png';

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
    goBack: function(idx){
        this.setValue && this.setValue[idx](back);
        this.states[idx] = StateCard.ENABLE;
    },
    goFront: function(idx){
        this.setValue && this.setValue[idx](this.items[idx]);
        this.states[idx] = StateCard.DISABLE;
    },
    select: function(){
        if (sessionStorage.load){ // Carreguem partida
            let toLoad = JSON.parse(sessionStorage.load);
            this.items = toLoad.items;
            this.states = toLoad.states;
            this.selectCards = toLoad.selectCards;
            this.score = toLoad.score;
            this.groupsLeft = toLoad.groupsLeft;
            this.groupSize = toLoad.groupSize;
        }
        else{ // Nova partida
            this.items = resources.slice(0, this.groupsLeft);          
            shuffe(this.items);                      
                     
            let temp = [];
            for (let i = 0; i < this.groupSize; i++) {
                temp = temp.concat(this.items);
            }
            this.items = temp;     
            shuffe(this.items);
            this.states = new Array(this.items.length).fill(StateCard.ENABLE);
        }
    },
    start: function(){
        this.items.forEach((_,indx)=>{
            if (this.states[indx] === StateCard.DISABLE ||
                this.states[indx] === StateCard.DONE){
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
                    this.score += 25;
                    this.selectCards = [];
                    if (this.groupsLeft <= 0){
                        alert(`Has guanyat amb ${this.score} punts!!!!`);
                        window.location.assign("../");
                    }
                }
            }
            else { // carta incorrecta
                this.selectCards.push(indx);
                this.score -= 25;
                setTimeout(()=>{
                    this.selectCards.forEach(i => {
                        this.goBack(i);
                    });
                    this.selectCards = [];
                }, 1000);
                if (this.score <= 0){
                    alert ("Has perdut");
                    window.location.assign("../");
                }
            }
        }
    },
    save: function(){
        let to_save = JSON.stringify({
            items: this.items,
            states: this.states,
            selectCards: this.selectCards,
            score: this.score,
            groupsLeft: this.groupsLeft,
            groupSize: this.groupSize,
        });
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
            localStorage.save = to_save;
        }
        window.location.assign("../");
    }
}

function shuffe(arr){
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