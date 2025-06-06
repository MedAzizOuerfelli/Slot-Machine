const ROWS = 3;
const COLS = 3;
const SYMBOLS_COUNT = {
    '🍒': 2,
    '🍋': 4,
    '🍊': 6,
    '🍇': 8
};
const SYMBOLS_VALUE = {
    '🍒': 5,
    '🍋': 3,
    '🍊': 4,
    '🍇': 2
};

// DOM Elements
const depositScreen = document.getElementById('deposit-screen');
const gameScreen = document.getElementById('game-screen');
const depositInput = document.getElementById('deposit');
const startButton = document.getElementById('start-btn');
const balanceElement = document.getElementById('balance');
const linesSelect = document.getElementById('lines');
const betInput = document.getElementById('bet');
const spinButton = document.getElementById('spin-btn');
const resultMessage = document.getElementById('result-message');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

let balance = 0;
let isSpinning = false;

// Initialize game
function init() {
    // Add event listeners for deposit screen
    startButton.addEventListener('click', startGame);
    depositInput.addEventListener('input', validateDeposit);
}

function validateDeposit() {
    const deposit = parseInt(depositInput.value);
    if (isNaN(deposit) || deposit <= 0) {
        depositInput.value = 100;
    }
}

function startGame() {
    const deposit = parseInt(depositInput.value);
    if (isNaN(deposit) || deposit <= 0) {
        alert('Please enter a valid deposit amount!');
        return;
    }
    
    balance = deposit;
    updateBalance();
    
    // Hide deposit screen and show game screen
    depositScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Add game event listeners
    spinButton.addEventListener('click', spin);
    betInput.addEventListener('input', validateBet);
}

function updateBalance() {
    balanceElement.textContent = balance;
}

function validateBet() {
    const bet = parseInt(betInput.value);
    const lines = parseInt(linesSelect.value);
    const totalBet = bet * lines;
    
    if (totalBet > balance) {
        betInput.value = Math.floor(balance / lines);
    }
}

function playSound(type) {
    const sounds = {
        spin: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
        win: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'
    };
    
    const audio = new Audio(sounds[type]);
    audio.volume = 0.5;
    audio.play();
}

function spin() {
    if (isSpinning) return;
    
    const lines = parseInt(linesSelect.value);
    const bet = parseInt(betInput.value);
    const totalBet = bet * lines;
    
    if (totalBet > balance) {
        resultMessage.textContent = "You don't have enough balance!";
        return;
    }
    
    isSpinning = true;
    playSound('spin');
    
    // Disable controls during spin
    spinButton.disabled = true;
    linesSelect.disabled = true;
    betInput.disabled = true;
    
    // Deduct bet from balance
    balance -= totalBet;
    updateBalance();
    
    // Clear previous results
    resultMessage.textContent = "";
    
    // Generate new symbols
    const symbols = [];
    for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
        for (let i = 0; i < count; i++) {
            symbols.push(symbol);
        }
    }
    
    // Spin animation
    reels.forEach((reel, index) => {
        const symbolsCopy = [...symbols];
        const reelSymbols = [];
        
        for (let i = 0; i < ROWS; i++) {
            const randomIndex = Math.floor(Math.random() * symbolsCopy.length);
            const selectedSymbol = symbolsCopy[randomIndex];
            reelSymbols.push(selectedSymbol);
            symbolsCopy.splice(randomIndex, 1);
        }
        
        // Create symbol elements
        reel.innerHTML = '';
        reelSymbols.forEach(symbol => {
            const symbolElement = document.createElement('div');
            symbolElement.className = 'w-full h-24 flex justify-center items-center text-4xl border-b border-gray-200 select-none';
            symbolElement.textContent = symbol;
            reel.appendChild(symbolElement);
        });
        
        // Add spinning animation
        reel.classList.add('animate-[spin_0.5s_linear_infinite]');
    });
    
    // Stop spinning after animation
    setTimeout(() => {
        reels.forEach(reel => reel.classList.remove('animate-[spin_0.5s_linear_infinite]'));
        
        // Calculate winnings
        const rows = [];
        for (let i = 0; i < ROWS; i++) {
            const row = [];
            for (let j = 0; j < COLS; j++) {
                const symbol = reels[j].children[i].textContent;
                row.push(symbol);
            }
            rows.push(row);
        }
        
        let winnings = 0;
        for (let row = 0; row < lines; row++) {
            const symbols = rows[row];
            let allSame = true;
            for (const symbol of symbols) {
                if (symbol !== symbols[0]) {
                    allSame = false;
                    break;
                }
            }
            if (allSame) {
                winnings += bet * SYMBOLS_VALUE[symbols[0]];
            }
        }
        
        // Update balance and show results
        balance += winnings;
        updateBalance();
        
        if (winnings > 0) {
            playSound('win');
            resultMessage.innerHTML = `<i class="fas fa-trophy mr-2"></i>You won $${winnings}!`;
            resultMessage.classList.add('animate-bounce');
            setTimeout(() => resultMessage.classList.remove('animate-bounce'), 1000);
        } else {
            resultMessage.textContent = "Try again!";
        }
        
        // Re-enable controls
        spinButton.disabled = false;
        linesSelect.disabled = false;
        betInput.disabled = false;
        isSpinning = false;
        
        // Check if game over
        if (balance <= 0) {
            resultMessage.innerHTML = `<i class="fas fa-gamepad mr-2"></i>Game Over! Refresh to play again.`;
            spinButton.disabled = true;
        }
    }, 2000);
}

// Start the game
init(); 