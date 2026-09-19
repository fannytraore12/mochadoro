// ===== Mochadoro Renderer =====

// --- Page elements ---
const startAppBtn = document.getElementById("start-btn");
const startPage = document.getElementById("start-page");
const menuPage = document.getElementById("menu-page");
const timerPage = document.getElementById("timer-page");
const resultPage = document.getElementById("result-page");
const breakPage = document.getElementById("break-page");

// --- Brewing page elements ---
const brewTime = document.getElementById("brew-timer");
const coffeeImage = document.getElementById("result-coffee-img");
const pauseBtn = document.getElementById("pause-opt");
const stopBtn = document.getElementById("stop-opt");
const nextBtn = document.getElementById("break-btn");

// --- Break page elements ---
const breakTimerDisplay = document.getElementById("break-timer");
const skipBtn = document.getElementById("skip-opt");
const startBreakBtn = document.getElementById("start-opt");

// --- State ---
let remainingSeconds = 0;
let selectedBrewMinutes = 0;
let totalPaused = 0; // counts how many times pause has been pressed during this brew
let isPaused = false;
let isOnBreak = false;
let timerInterval = null;
let selectedCoffeeImage = "";

// --- Arduino LED helper ---
// red   = timer actively running (brewing/focus)
// green = break active
// amber = paused
function setLeds({ red = false, green = false, amber = false } = {}) {
    window.api.sendArduinoCommand(`LED:R:${red ? 1 : 0}`);
    window.api.sendArduinoCommand(`LED:G:${green ? 1 : 0}`);
    window.api.sendArduinoCommand(`LED:A:${amber ? 1 : 0}`);
}

// --- Start -> Menu ---
startAppBtn.addEventListener("click", () => {
    startPage.classList.add("hidden");
    menuPage.classList.remove("hidden");
});

// --- Menu -> Timer (pick a coffee) ---
document.querySelectorAll(".timer-opt").forEach((button) => {
    button.addEventListener("click", (event) => {
        const selectedTime = event.currentTarget.dataset.time;
        selectedBrewMinutes = parseInt(selectedTime, 10);
        selectedCoffeeImage = event.currentTarget.dataset.image;

        remainingSeconds = selectedBrewMinutes * 60;
        totalPaused = 0;
        isPaused = false;
        isOnBreak = false;
        pauseBtn.textContent = "pause";
        brewTime.classList.remove("paused-text");

        coffeeImage.src = selectedCoffeeImage;
        updateTimerDisplay();

        menuPage.classList.add("hidden");
        timerPage.classList.remove("hidden");

        startCountdown();
        startBrewingAnimation();

        // Arduino: focus/brewing session started -> red on, reset pause-count display
        setLeds({ red: true });
        window.api.sendArduinoCommand('DISP:0');
    });
});

// --- Shared countdown ---
function updateTimerDisplay() {
    const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
    const secs = String(remainingSeconds % 60).padStart(2, "0");
    const display = isOnBreak ? breakTimerDisplay : brewTime;
    display.textContent = `${mins}:${secs}`;
}

function startCountdown() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            if (isOnBreak) {
                // Break finished -> back to menu
                setLeds(); // all off
                window.api.sendArduinoCommand('BUZZ:ON');
                breakPage.classList.add("hidden");
                menuPage.classList.remove("hidden");
            } else {
                showResults(selectedCoffeeImage);
            }
            return;
        }
        remainingSeconds--;
        updateTimerDisplay();
    }, 1000);
}

function showResults(imagePath) {
    clearInterval(timerInterval);
    stopBrewingAnimation();
    timerPage.classList.add("hidden");
    resultPage.classList.remove("hidden");
    coffeeImage.src = imagePath;

    // Arduino: brewing timer ended (naturally, stopped, or paused too many times) -> buzz, LEDs off
    setLeds();
    window.api.sendArduinoCommand('BUZZ:ON');
}

// --- Pause / resume (brew timer) ---
pauseBtn.addEventListener("click", () => {
    if (!isPaused) {
        // Pressing pause: count this pause, update the 7-segment display, amber on
        isPaused = true;
        pauseBtn.textContent = "start";
        brewTime.classList.add("paused-text");
        stopBrewingAnimation();
        clearInterval(timerInterval);

        totalPaused++;
        window.api.sendArduinoCommand(`DISP:${totalPaused}`);
        setLeds({ amber: true });

        if (totalPaused >= 3) {
            showResults("assets/Still_coffee.PNG");
            return;
        }
    } else {
        // Resuming -> back to red
        isPaused = false;
        pauseBtn.textContent = "pause";
        brewTime.classList.remove("paused-text");
        startBrewingAnimation();
        startCountdown();
        setLeds({ red: true });
    }
});

// --- Stop ---
stopBtn.addEventListener("click", () => {
    showResults("assets/burned_coffee.PNG");
});

// --- Brewing animation ---
const brewKettleImg = document.getElementById("brew-kettle");
const breakKettleImg = document.getElementById("break-kettle");
const brewingFrames = [
    "assets/Brewing1.PNG",
    "assets/Brewing2.PNG",
    "assets/Brewing3.PNG",
    "assets/Brewing4.PNG",
    "assets/Brewing6.PNG",
    "assets/Brewing5.PNG",
    "assets/Brewing7.PNG",
    "assets/Brewing8.PNG",
    "assets/Brewing9.PNG",
];
let brewingFrameIndex = 0;
let brewingAnimInterval = null;

function startBrewingAnimation() {
    clearInterval(brewingAnimInterval);
    brewingFrameIndex = 0;
    const targetImg = isOnBreak ? breakKettleImg : brewKettleImg;
    brewingAnimInterval = setInterval(() => {
        brewingFrameIndex = (brewingFrameIndex + 1) % brewingFrames.length;
        targetImg.src = brewingFrames[brewingFrameIndex];
    }, 200);
}
function stopBrewingAnimation() {
    clearInterval(brewingAnimInterval);
}

// --- Result -> Break ---
nextBtn.addEventListener("click", () => {
    let breakMinutes;
    if (selectedBrewMinutes === 20) breakMinutes = 5;
    else if (selectedBrewMinutes === 30) breakMinutes = 10;
    else if (selectedBrewMinutes === 40) breakMinutes = 15;
    else breakMinutes = 20;

    remainingSeconds = breakMinutes * 60;
    isOnBreak = true;
    isPaused = false;
    updateTimerDisplay();

    resultPage.classList.add("hidden");
    breakPage.classList.remove("hidden");

    startCountdown();
    startBrewingAnimation();

    // Arduino: break started -> green on, buzzer off (from the previous ending)
    setLeds({ green: true });
    window.api.sendArduinoCommand('BUZZ:OFF');
});

const breakTime = document.getElementById("break-timer");

// --- Break page: pause / resume ---
startBreakBtn.addEventListener("click", () => {
    if (!isPaused) {
        isPaused = true;
        startBreakBtn.textContent = "start";
        breakTime.classList.add("paused-text");
        clearInterval(timerInterval);
        stopBrewingAnimation();
        setLeds({ amber: true });
    } else {
        isPaused = false;
        startBreakBtn.textContent = "pause";
        breakTime.classList.remove("paused-text");
        startCountdown();
        startBrewingAnimation();
        setLeds({ green: true });
    }
});

// --- Break page: skip straight to menu ---
skipBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
    isOnBreak = false;
    breakPage.classList.add("hidden");
    menuPage.classList.remove("hidden");
    setLeds(); // all off
});

// --- Go back (menu -> start) ---
const goBackBtn = document.getElementById("go-back");
goBackBtn.addEventListener('click', () => {
    menuPage.classList.add("hidden");
    startPage.classList.remove("hidden");
    setLeds(); // all off, in case a session was left mid-way
});

// --- Window controls ---
document.getElementById('minimize-btn').addEventListener('click', () => {
    window.api.minimizeWindow();
});

document.getElementById('close-btn').addEventListener('click', () => {
    window.api.closeWindow();
});