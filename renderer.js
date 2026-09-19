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
const nextBtn = document.getElementById("break-btn"); // fixed: was "break-timer"

// --- Break page elements ---
const breakTimerDisplay = document.getElementById("break-timer");
const skipBtn = document.getElementById("skip-opt");
const startBreakBtn = document.getElementById("start-opt");

// --- State ---
let remainingSeconds = 0;
let selectedBrewMinutes = 0;
let totalPaused = 0;
let isPaused = false;
let isOnBreak = false;
let timerInterval = null;
let pauseInterval = null;
let selectedCoffeeImage = "";

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
    clearInterval(pauseInterval);
    stopBrewingAnimation();
    timerPage.classList.add("hidden");
    resultPage.classList.remove("hidden");
    coffeeImage.src = imagePath;
}

// --- Pause / resume (brew timer) ---
pauseBtn.addEventListener("click", () => {
    if (totalPaused >= 3) {
        showResults("assets/Still_coffee.PNG");
        return;
    }

    if (!isPaused) {
        isPaused = true;
        pauseBtn.textContent = "start";
        brewTime.classList.add("paused-text");
        stopBrewingAnimation();
        clearInterval(timerInterval);
        clearInterval(pauseInterval);
        pauseInterval = setInterval(() => {
            totalPaused++;
        }, 1000);
    } else {
        isPaused = false;
        pauseBtn.textContent = "pause";
        brewTime.classList.remove("paused-text");
        clearInterval(pauseInterval);
        startBrewingAnimation();
        startCountdown();
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
    updateTimerDisplay();

    resultPage.classList.add("hidden");
    breakPage.classList.remove("hidden");

    startCountdown();
    startBrewingAnimation();
    
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
    } else {
        isPaused = false;
        startBreakBtn.textContent = "pause";
        breakTime.classList.remove("paused-text");
        startCountdown();
        startBrewingAnimation();
    }
});

// --- Break page: skip straight to menu ---
skipBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
    isOnBreak = false;
    breakPage.classList.add("hidden");
    menuPage.classList.remove("hidden");
});

const goBackBtn = document.getElementById("go-back");

goBackBtn.addEventListener('click', ()=>{
    menuPage.classList.add("hidden");
    startPage.classList.remove("hidden");


})

document.getElementById('minimize-btn').addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
});

document.getElementById('close-btn').addEventListener('click', () => {
    window.electronAPI.closeWindow();
});