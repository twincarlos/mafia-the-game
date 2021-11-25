window.addEventListener('DOMContentLoaded', e => {

    let names = [];
    let players = [];
    let MAFIAS = [];
    let DOCTOR = null;
    let DETECTIVE = null;
    let CIVILIANS = [];
    const NUMBERS = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);

    let ACTION = null;
    let KILLED = null;
    let SAVED = null;


    let GHOSTS = new Set();

    let LAST_PLAYER = false;
    let playerTag = 1;
    let status = 0;

    /*--------------------------------------------------------------------*/

    // HOME
    const home = document.getElementsByClassName('home')[0];
    const input = document.querySelector('input');
    const add = document.getElementById('add');
    const start = document.getElementById('start');
    const ol = document.querySelector('ol');

    // ROLES
    const roles = document.getElementsByClassName('roles')[0];
    const upcoming = document.getElementById('upcoming');
    const reveal = document.getElementById('reveal');
    const next = document.getElementById('next');
    const playerRole = document.getElementById('player-role');

    // NIGHT
    const night = document.getElementsByClassName('night')[0];
    const playerButtons = Array.from(document.querySelector('.buttons').children);
    const nightRole = document.getElementById('night-role');
    const upcomingAtNight = document.getElementById('upcoming-night');
    const clue = document.getElementById('clue');

    // DAY
    const day = document.getElementsByClassName('day')[0];
    const results = document.getElementById('results');
    const vote = document.getElementById('vote');

    /*--------------------------------------------------------------------*/

    function shuffle(arr) {
        let count = 0;
        while (arr.length > 0) {
            let rand = Math.floor(Math.random() * arr.length);
            if (count <= 1) {
                MAFIAS.push(arr[rand]);
                arr.splice(rand, 1);
            }
            else if (count === 2) {
                DOCTOR = arr[rand];
                arr.splice(rand, 1);
            }
            else if (count === 3) {
                DETECTIVE = arr[rand];
                arr.splice(rand, 1);
            }
            else {
                CIVILIANS.push(arr.shift());
            }
            count++;
        }
    }

    /*--------------------------------------------------------------------*/

    function lastPlayer () {
        if (KILLED !== SAVED) {
            GHOSTS.add(KILLED);
            results.innerText = `${KILLED} was killed :(`;
        }
        else {
            results.innerText = `${SAVED} was saved :)`;
        }

        KILLED = null;
        SAVED = null;
        LAST_PLAYER = false;
        status = 0;
    }

    /*--------------------------------------------------------------------*/

    function killSaveOrCheck (player, action) {
        if (action === 'kill') {
            KILLED = player;
        }

        else if (action === 'save') {
            SAVED = player;
        }

        else if (action === 'check') {
            if (MAFIAS.includes(player)) {
                console.log('yes, they are mafia');
            } else {
                console.log('no, they are not mafia');
            }
        }

        if (LAST_PLAYER) {
            lastPlayer();
        }
    }

    /*--------------------------------------------------------------------*/

    add.addEventListener('click', e => {
        const inputValue = input.value.toUpperCase();

        input.value = '';

        const li = document.createElement('li');
        li.innerText = inputValue;
        ol.appendChild(li);

        const playerButton = document.getElementById(playerTag);
        playerButton.id = inputValue;
        playerButton.innerText = inputValue;

        names.push(inputValue);
        players.push(inputValue);
        playerTag++;
    });

    // START BUTTON
    start.addEventListener('click', e => {
        shuffle(names);
        home.style.visibility = 'hidden';
        roles.style.visibility = 'visible';
        upcoming.innerText = `${players[status]}, you are next.`;
        next.disabled = true;

        // ENABLE PLAYER BUTTONS
        playerButtons.forEach(pb => {
            if (NUMBERS.has(pb.id)) {
                pb.disabled = true;
            }
            else {
                pb.addEventListener('click', e => {
                    e.stopImmediatePropagation();
                    reveal.disabled = false;
                    next.disabled = true;

                    if(LAST_PLAYER) {
                        LAST_PLAYER = true;
                        night.style.visibility = 'hidden';
                        day.style.visibility = 'visible';
                    } else {
                        night.style.visibility = 'hidden';
                        roles.style.visibility = 'visible';
                    }

                    killSaveOrCheck(pb.id, ACTION);
                });
            }
        });
    });

    // REVEAL BUTTON
    reveal.addEventListener('click', e => {
        clue.innerText = `Choose wisely`;

        if(!players[status + 1]) {
            LAST_PLAYER = true;
            upcomingAtNight.innerText = `You're the last player. Click NEXT and go to sleep.`;
            upcoming.innerText = `You're the last player. Click NEXT and go to sleep.`;
        } else {
            upcomingAtNight.innerText = `${players[status + 1]} is next`;
            upcoming.innerText = `${players[status + 1]} is next`;
        }

        let player = players[status];

        next.disabled = false;
        reveal.disabled = true;

        if (player === MAFIAS[0]) {
            if (KILLED) {
                clue.innerText = `${MAFIAS[1]} chose to kill ${KILLED}. You can overwrite that.`;
            }

            ACTION = 'kill';
            roles.style.visibility = 'hidden';
            night.style.visibility = 'visible';
            nightRole.innerText = `${player}: you are MAFIA with ${MAFIAS[1]}. Select a player to kill.`
        }

        else if (player === MAFIAS[1]) {
            if (KILLED) {
                clue.innerText = `${MAFIAS[0]} chose to kill ${KILLED}. You can overwrite that.`;
            }

            ACTION = 'kill';
            roles.style.visibility = 'hidden';
            night.style.visibility = 'visible';
            nightRole.innerText = `${player}: you are MAFIA with ${MAFIAS[0]}. Select a player to kill.`
        }

        else if (player === DOCTOR) {
            ACTION = 'save';
            roles.style.visibility = 'hidden';
            night.style.visibility = 'visible';
            nightRole.innerText = `${player}: you are the DOCTOR. Select a player to save.`
        }

        else if (player === DETECTIVE) {
            ACTION = 'check';
            roles.style.visibility = 'hidden';
            night.style.visibility = 'visible';
            nightRole.innerText = `${player}: you are the DETECTIVE. Select a player to check.`
        }

        else {
            ACTION = null;
            playerRole.style.visibility = 'visible';
            playerRole.innerText = `${player}: you are a boring average civilian`;
        }

        status++;
    });

    // NEXT BUTTON
    next.addEventListener('click', e => {
        next.disabled = true;
        reveal.disabled = false;
        playerRole.style.visibility = 'hidden';
        upcoming.innerText = `${players[status]} it's your turn`;

        if (!players[status]) {
            lastPlayer();
            roles.style.visibility = 'hidden';
            day.style.visibility = 'visible';
        }
    });

    // VOTE BUTTON
    vote.addEventListener('click', e => {
        playerButtons.forEach(pb => {
            if (GHOSTS.has(pb.id)) {
                pb.disabled = true;
            }
        });
        night.style.visibility = 'visible';
        day.style.visibility = 'hidden';
    })
});
