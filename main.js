class Card {
    constructor(name, backgroundImage, reference) {
        this.name = name;
        this.backgroundImage = backgroundImage;
        this.reference = reference
    }

    getName() { return this.name; }
    getBackgroundImage() { return this.backgroundImage; }
    getReference() { return this.reference; }
}




addEventListener("DOMContentLoaded", () => { 
    // Config
    const ROWS = 6;
    const COLS = 6;

    const GAME_TIME = 120 // In seconds
    const GAME_RESTART_DELAY = 800 // In ms

    const CARD_FLIP_BACK_DELAY = 600 // In ms

    const DRAW_CUP_DELAY = 600 // In ms

    const FALLING_STAR_MIN_DELAY = 6000; // In ms
    const FALLING_STAR_RANDOM_ADD = 6000; // In ms
    const FALLING_STAR_SIZE_PX = 200;

    const cards = [
        new Card('Dog','img/dog.webp', 'https://unsplash.com/photos/white-long-coat-small-dog-5Vr_RVPfbMI'),
        new Card('Cat','img/cat.webp', 'https://unsplash.com/photos/white-and-brown-long-fur-cat-ZCHj_2lJP00'),
        new Card('Panda','img/panda.webp', 'https://unsplash.com/photos/a-panda-bear-sitting-in-the-grass-eating-bamboo-ScdnaKVtPIA'),
        new Card('Fox','img/fox.webp', 'https://unsplash.com/photos/orange-and-silver-fox-mEdKuPYJe1I'),
        new Card('Hamster','img/hamster.webp', 'https://unsplash.com/photos/a-small-rodent-sitting-inside-of-a-black-cup-Blq2GgF49yM'),
        new Card('Bunny','img/bunny.webp', 'https://unsplash.com/photos/white-rabbit-on-green-grass-u_kMWN-BWyU'),
        new Card('Serval','img/serval.webp', 'https://unsplash.com/photos/brown-and-black-leopard-on-green-grass-during-daytime-TmVu3JkX5tM'),
        new Card('Parrot','img/parrot.webp', 'https://unsplash.com/photos/green-and-yellow-small-beaked-bird-on-twig-OlKkCmToXEs'),
        new Card('Eagle','img/eagle.webp', 'https://unsplash.com/photos/white-and-brown-bald-eagle-NEvS5lHyrlk'),
        new Card('Giraffe','img/giraffe.webp', 'https://unsplash.com/photos/white-and-brown-bald-eagle-NEvS5lHyrlk'),
        new Card('Horse','img/horse.webp', 'https://unsplash.com/photos/a-horse-jumping-in-the-air-cwoXqhi3Prc'),
        new Card('Red panda','img/red_panda.webp', 'https://unsplash.com/photos/a-red-panda-on-a-tree-branch-HKyOAZkFzRM'),
        new Card('Raccoon','img/raccoon.webp', 'https://unsplash.com/photos/brown-and-black-animal-on-green-grass-C1BjxQCqba0'),
        new Card('Hedgehog','img/hedgehog.webp', 'https://unsplash.com/photos/brown-and-black-animal-on-green-grass-C1BjxQCqba0'),
        new Card('Squirrel','img/squirrel.webp', 'https://unsplash.com/photos/focus-photo-of-squirrel-bating-a-brown-walnut-rYZHmeH4dvQ'),
        new Card('Deer','img/deer.webp', 'https://unsplash.com/photos/brown-deer-on-green-grass-during-daytime-aJuv14zf-ZY'),
        new Card('Bear','img/bear.webp', 'https://unsplash.com/photos/polar-bear-on-snow-covered-ground-during-daytime-LVT82myoXSE'),
        new Card('Tiger','img/tiger.webp', 'https://unsplash.com/photos/tiger-on-brown-grass-during-daytime-XCg1BQf-fso'),
    ];

    // Setup the deck of cards
    const DECK_SIZE = cards.length * 2;
    const deck = new Array(DECK_SIZE);

    for (let i = 0; i < DECK_SIZE; i++) {
        deck[i] = i % cards.length; // Do not overflow and create 2 copies of each card
    }

    shuffle(deck);
    let resetBtnBlock = false;

    // Create the visuals in the DOM
    function init() {
        const gameDiv = document.getElementById('game');
        
        // Clean from the previous game
        gameDiv.innerHTML = '';
        document.getElementById('timer').textContent = GAME_TIME;
        resetBtnBlock = false;

        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                const randomCardIndex = deck[(j + COLS*i)];

                const card = document.createElement('div');
                const cardFront = document.createElement('div');
                const cardBack = document.createElement('div');
                
                card.classList.add('game-card');

                cardFront.classList.add('game-card-common');
                cardFront.classList.add('game-card-front');

                cardBack.classList.add('game-card-common');
                cardBack.classList.add('game-card-back');

                cardFront.style.backgroundImage = 'url(' + cards[randomCardIndex].getBackgroundImage() + ')';
                
                card.onclick = onCardClick;
                card.setAttribute('data-card-index', randomCardIndex);
                card.setAttribute('data-flipped', false);

                card.appendChild(cardFront);
                card.appendChild(cardBack);

                gameDiv.appendChild(card);
            }
        }
    };

    init();

    // On card click logic
    let firstCard = null;
    let blocked = false;
    let gameStarted = false;
    let remainingTime = GAME_TIME;
    let intervalFunctionCountdown = null;

    let guessedPairs = 0;
    

    function onCardClick() {
        if (this.dataset.flipped === 'true' || blocked) return;

        if (!gameStarted) {
            gameStarted = true;
            intervalFunctionCountdown = setInterval(countdown, 1000);
        }

        flipCard(this);

        if (!firstCard) {
            firstCard = this;
        } else if (this.dataset.cardIndex === firstCard.dataset.cardIndex) {
            // We guessed a card
            guessedPairs++;

            firstCard.querySelector('.game-card-front').classList.add('fade');
            this.querySelector('.game-card-front').classList.add('fade');

            firstCard = null;

            // Win!
            if (guessedPairs === DECK_SIZE / 2 && remainingTime >= 0) {
                setTimeout(drawCup, DRAW_CUP_DELAY);
                clearInterval(intervalFunctionCountdown);
                winScreen.classList.add('fly');
            }
        } else {
            // Didn't guess a card, so we block gameplay till animation finishes
            blocked = true;

            const that = this;
            setTimeout(() => {
                flipCard(that);
                flipCard(firstCard);

                firstCard = null;
                blocked = false;
            }, CARD_FLIP_BACK_DELAY);
        }
    }

    function flipCard(card) {
        if (card.dataset.flipped === 'true') {
            card.dataset.flipped = false;
            card.classList.remove('flipped');
        } else {
            card.dataset.flipped = true;
            card.classList.add('flipped');
        }
    }

    // The cup
    // █----█
    // █----█
    // █----█
    // -█--█-
    // --██--
    // -████-
    //-------
    function drawCup () {
        const playCards = document.querySelectorAll('.game-card');
        const indexesToFlip = [0, 5, 6, 11, 12, 17, 19, 22, 26, 27, 31, 32, 33, 34];

        // Remove click events for the cards
        playCards.forEach(c => c.onclick = null);

        for (const idx of indexesToFlip) {
            const card = playCards[idx];
            flipCard(card);
        }
    }

    const timerEl = document.getElementById('timer');
    function countdown() {
        // You lose!
        if (remainingTime === 0) {
            loseScreen.classList.add('fly-across');
            clearInterval(intervalFunctionCountdown);
        }

        --remainingTime;

        if (remainingTime >= 0) {
            timerEl.textContent = remainingTime
        }
    }

    // Game reset
    document.getElementById('reset-btn').onclick = () => {
        if (resetBtnBlock) {
            return;
        } else {
            resetBtnBlock = true;
        }

        const playCards = document.querySelectorAll('.game-card');
        // Draw the X
        const indexesToFlipWhenNoGuesses = [0, 5, 7, 10, 14, 15, 20, 21, 25, 28, 30, 35];

        if (guessedPairs === 0) {
            for (const card of playCards) {
                // Reset single flip cards
                if (card.dataset.flipped === 'true') {
                    flipCard(card)
                }
            }

            for (const idx of indexesToFlipWhenNoGuesses) {
                const card = playCards[idx];
                flipCard(card);
                setTimeout(() => flipCard(card), GAME_RESTART_DELAY / 2 );
            }

        } else {
            for (const card of playCards) {
                if (card.dataset.flipped === 'true') {
                    flipCard(card);
                }
            }
        }

        

        firstCard = null;
        blocked = false;
        gameStarted = false;
        remainingTime = GAME_TIME;

        guessedPairs = 0;

        shuffle(deck);

        setTimeout(init, GAME_RESTART_DELAY);

        clearInterval(intervalFunctionCountdown);
    }

    // Add images sources to the gallery list
    {
        const galleryList = document.getElementById('gallery-list');

        for (const card of cards) {
            const li = document.createElement('li');
            const anchor = document.createElement('a');

            anchor.textContent = card.getName();
            anchor.href = card.getReference();

            li.appendChild(anchor);
            galleryList.appendChild(li);
        };
    }

    // Create the paralax moon effect
    {
        const sky = document.querySelector('.moon');
        document.onscroll  = () => {
            // The moon might show again from bottom if we dont stop paralaxing
            if (window.pageYOffset > window.innerHeight * 0.6) return;
            
            const graph = x => 0.0008 * x * x; // Gives a good curve on the moon

            sky.style.backgroundPosition = `${graph(window.pageYOffset)}px ${-window.pageYOffset * 0.4}px`;
        } 
    }

    // Set up win and lose screens
    const winScreen = document.getElementById('win-screen');
    winScreen.onanimationend = () => winScreen.classList.remove('fly');

    const loseScreen = document.getElementById('lose-screen');
    loseScreen.onanimationend = () => loseScreen.classList.remove('fly-across');

    // Create the falling star effect
    {
        const star = document.getElementById('falling-star');

        function fallingStar() {
            star.classList.add('fall-animated');

            // 50 / 50 if the star falls from top or from right
            const coinFlip = Math.random() > 0.5;
            if (coinFlip) {
                star.style.right = `${Math.random() * window.innerHeight / 2 - FALLING_STAR_SIZE_PX}px`
            } else {
                star.style.top = `${Math.random() * window.innerWidth / 2 - FALLING_STAR_SIZE_PX}px`
            }

            setTimeout(fallingStar, Math.round(Math.random() * FALLING_STAR_RANDOM_ADD) + FALLING_STAR_MIN_DELAY);
        };

        setTimeout(fallingStar, FALLING_STAR_MIN_DELAY);

        star.addEventListener('animationend', function() {
            star.style.right = `-${FALLING_STAR_SIZE_PX}px`
            star.style.top = `-${FALLING_STAR_SIZE_PX}px`

            star.classList.remove('fall-animated');
        }, false);
    }

    // Knuth Shuffle: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array#2450976
    function shuffle(array) {
        let currentIndex = array.length;

        while (currentIndex != 0) {

            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        };
    }
});
