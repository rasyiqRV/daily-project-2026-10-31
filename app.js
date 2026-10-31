// ========== State ==========
const state = {
    modes: {
        pomodoro: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
    },
    currentMode: 'pomodoro',
    timeRemaining: 25 * 60,
    totalTime: 25 * 60,
    isRunning: false,
    intervalId: null,
    completedSessions: 0,
    totalFocusSeconds: 0,
    longBreakInterval: 4,
    autoStart: false,
    tasks: [],
};

// ========== DOM Elements ==========
const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const completedCount = document.getElementById('completedCount');
const totalTimeDisplay = document.getElementById('totalTime');
const progressCircle = document.querySelector('.progress-ring__circle');
const timerDisplayEl = document.querySelector('.timer-display');
const tabs = document.querySelectorAll('.tab');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

// Settings
const pomodoroTimeInput = document.getElementById('pomodoroTime');
const shortBreakTimeInput = document.getElementById('shortBreakTime');
const longBreakTimeInput = document.getElementById('longBreakTime');
const longBreakIntervalInput = document.getElementById('longBreakInterval');
const autoStartInput = document.getElementById('autoStart');

// Progress ring setup
const circumference = 2 * Math.PI * 120;
progressCircle.style.strokeDasharray = circumference;

// ========== Timer Functions ==========
function updateDisplay() {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.title = `${timeDisplay.textContent} — Pomodoro Timer`;

    // Update progress ring
    const progress = state.timeRemaining / state.totalTime;
    const offset = circumference * progress;
    progressCircle.style.strokeDashoffset = circumference - offset;
}

function startTimer() {
    if (state.isRunning) {
        pauseTimer();
        return;
    }

    state.isRunning = true;
    startBtn.textContent = 'Jeda';
    timerDisplayEl.classList.add('running');

    state.intervalId = setInterval(() => {
        state.timeRemaining--;

        if (state.timeRemaining < 0) {
            clearInterval(state.intervalId);
            state.isRunning = false;
            timerDisplayEl.classList.remove('running');
            onTimerComplete();
            return;
        }

        updateDisplay();
    }, 1000);
}

function pauseTimer() {
    clearInterval(state.intervalId);
    state.isRunning = false;
    startBtn.textContent = 'Lanjut';
    timerDisplayEl.classList.remove('running');
}

function resetTimer() {
    clearInterval(state.intervalId);
    state.isRunning = false;
    state.timeRemaining = state.totalTime;
    startBtn.textContent = 'Mulai';
    timerDisplayEl.classList.remove('running');
    updateDisplay();
}

function onTimerComplete() {
    playAlarm();

    if (state.currentMode === 'pomodoro') {
        state.completedSessions++;
        state.totalFocusSeconds += state.totalTime;
        updateStats();

        // Determine next break type
        if (state.completedSessions % state.longBreakInterval === 0) {
            switchMode('longBreak');
        } else {
            switchMode('shortBreak');
        }
    } else {
        switchMode('pomodoro');
    }

    if (state.autoStart) {
        setTimeout(startTimer, 1000);
    } else {
        startBtn.textContent = 'Mulai';
    }
}

function switchMode(mode) {
    state.currentMode = mode;
    state.timeRemaining = state.modes[mode];
    state.totalTime = state.modes[mode];

    // Update tab styles
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    // Update progress ring color
    const colors = {
        pomodoro: '#e74c3c',
        shortBreak: '#3498db',
        longBreak: '#9b59b6',
    };
    progressCircle.style.stroke = colors[mode];

    updateDisplay();
}

function updateStats() {
    completedCount.textContent = state.completedSessions;
    const totalMinutes = Math.floor(state.totalFocusSeconds / 60);
    if (totalMinutes >= 60) {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        totalTimeDisplay.textContent = `${hours}j ${mins}m`;
    } else {
        totalTimeDisplay.textContent = `${totalMinutes}m`;
    }
}

function playAlarm() {
    // Create a simple beep using Web Audio API
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;

        oscillator.start();

        // Beep pattern: 3 short beeps
        setTimeout(() => { gainNode.gain.value = 0; }, 200);
        setTimeout(() => { gainNode.gain.value = 0.3; }, 400);
        setTimeout(() => { gainNode.gain.value = 0; }, 600);
        setTimeout(() => { gainNode.gain.value = 0.3; }, 800);
        setTimeout(() => {
            oscillator.stop();
            audioCtx.close();
        }, 1000);
    } catch (e) {
        console.log('Audio not supported');
    }

    // Browser notification
    if (Notification.permission === 'granted') {
        const messages = {
            pomodoro: '⏰ Waktu fokus selesai! Saatnya istirahat.',
            shortBreak: '☕ Istirahat selesai! Saatnya fokus lagi.',
            longBreak: '🎉 Istirahat panjang selesai! Siap untuk sesi baru?',
        };
        new Notification('Pomodoro Timer', {
            body: messages[state.currentMode],
            icon: '🍅',
        });
    }
}

// ========== Task Functions ==========
function addTask(text) {
    if (!text.trim()) return;

    const task = {
        id: Date.now(),
        text: text.trim(),
        done: false,
    };

    state.tasks.push(task);
    renderTasks();
    saveTasks();
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.done = !task.done;
        renderTasks();
        saveTasks();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    renderTasks();
    saveTasks();
}

function renderTasks() {
    taskList.innerHTML = '';
    state.tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${task.id})">
            <span class="task-text ${task.done ? 'done' : ''}">${escapeHtml(task.text)}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">✕</button>
        `;
        taskList.appendChild(li);
    });
}

function saveTasks() {
    localStorage.setItem('pomodoro-tasks', JSON.stringify(state.tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('pomodoro-tasks');
    if (saved) {
        state.tasks = JSON.parse(saved);
        renderTasks();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== Settings ==========
function applySettings() {
    const pomodoroMin = parseInt(pomodoroTimeInput.value) || 25;
    const shortBreakMin = parseInt(shortBreakTimeInput.value) || 5;
    const longBreakMin = parseInt(longBreakTimeInput.value) || 15;

    state.modes.pomodoro = pomodoroMin * 60;
    state.modes.shortBreak = shortBreakMin * 60;
    state.modes.longBreak = longBreakMin * 60;
    state.longBreakInterval = parseInt(longBreakIntervalInput.value) || 4;
    state.autoStart = autoStartInput.checked;

    // Reset current timer to new duration
    if (!state.isRunning) {
        state.timeRemaining = state.modes[state.currentMode];
        state.totalTime = state.modes[state.currentMode];
        updateDisplay();
    }

    // Save settings
    localStorage.setItem('pomodoro-settings', JSON.stringify({
        pomodoro: pomodoroMin,
        shortBreak: shortBreakMin,
        longBreak: longBreakMin,
        longBreakInterval: state.longBreakInterval,
        autoStart: state.autoStart,
    }));
}

function loadSettings() {
    const saved = localStorage.getItem('pomodoro-settings');
    if (saved) {
        const s = JSON.parse(saved);
        pomodoroTimeInput.value = s.pomodoro;
        shortBreakTimeInput.value = s.shortBreak;
        longBreakTimeInput.value = s.longBreak;
        longBreakIntervalInput.value = s.longBreakInterval;
        autoStartInput.checked = s.autoStart;
        applySettings();
    }
}

// ========== Event Listeners ==========
startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        if (state.isRunning) {
            clearInterval(state.intervalId);
            state.isRunning = false;
            timerDisplayEl.classList.remove('running');
        }
        switchMode(tab.dataset.mode);
        startBtn.textContent = 'Mulai';
    });
});

// Settings listeners
[pomodoroTimeInput, shortBreakTimeInput, longBreakTimeInput, longBreakIntervalInput].forEach(input => {
    input.addEventListener('change', applySettings);
});
autoStartInput.addEventListener('change', applySettings);

// Task listeners
addTaskBtn.addEventListener('click', () => {
    addTask(taskInput.value);
    taskInput.value = '';
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask(taskInput.value);
        taskInput.value = '';
    }
});

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') {
        e.preventDefault();
        startTimer();
    } else if (e.code === 'KeyR') {
        resetTimer();
    }
});

// ========== Init ==========
loadSettings();
loadTasks();
updateDisplay();
