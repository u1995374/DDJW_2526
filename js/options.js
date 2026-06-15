import {$} from "../library/jquery-4.0.0.slim.module.min.js";

var options = function(){
    const default_options = {
        mode1: {
            pairs: 2,
            difficulty: 'normal'
        },
        mode2: {
            startLevel: 1,
            groupSize: 2
        }
    }

    var pairs = $('#pairs');
    var difficulty = $('#dif');
    var m2Level = $('#m2-level');
    var m2GroupSize = $('#m2-groupsize');

    var savedOptions = localStorage.options && JSON.parse(localStorage.options);
    var currentOptions = savedOptions || JSON.parse(JSON.stringify(default_options));
    
    pairs.val(currentOptions.mode1.pairs);
    difficulty.val(currentOptions.mode1.difficulty);
    
    if(m2Level.length) m2Level.val(currentOptions.mode2.startLevel);
    if(m2GroupSize.length) m2GroupSize.val(currentOptions.mode2.groupSize);

    pairs.on('change', function (){ currentOptions.mode1.pairs = pairs.val(); });
    difficulty.on('change', function (){ currentOptions.mode1.difficulty = difficulty.val(); });

    if(m2Level.length) m2Level.on('change', function (){ currentOptions.mode2.startLevel = Number(m2Level.val()); });
    if(m2GroupSize.length) m2GroupSize.on('change', function (){ currentOptions.mode2.groupSize = Number(m2GroupSize.val()); });

    return {
        applyChanges: function(){
            localStorage.options = JSON.stringify(currentOptions);
        },
        defaultValues: function(){
            currentOptions = JSON.parse(JSON.stringify(default_options));
            pairs.val(currentOptions.mode1.pairs);
            difficulty.val(currentOptions.mode1.difficulty);
            if(m2Level.length) m2Level.val(currentOptions.mode2.startLevel);
            if(m2GroupSize.length) m2GroupSize.val(currentOptions.mode2.groupSize);
        }
    }
}();

$('#default').on('click', function(){
    options.defaultValues();
})

$('#apply').on('click', function(){
    options.applyChanges();
    location.assign("../");
});
