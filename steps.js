import { getSession, canEdit, requireAuth } from '../utils/auth.js';
import { getSeniorData, updateSeniorData } from '../utils/storage.js';

// DOM Elements
const liveCounter = document.getElementById('liveCounter');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

// Pedometer Variables
let currentSessionSteps = 0;
let isTracking = false;
let lastAcceleration = { x: 0, y: 0, z: 0 };
const SHAKE_THRESHOLD = 12; // Adjust this sensitivity (higher = harder to trigger)

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    loadData();
});

// Request Permission for iOS/Sensors
async function requestSensorPermission() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        const response = await DeviceMotionEvent.requestPermission();
        return response === 'granted';
    }
    return true; // Assume granted on Android/Chrome
}

// The Pedometer Engine
function handleMotion(event) {
    if (!isTracking) return;

    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    // Calculate the magnitude of the movement
    // Formula: sqrt(x² + y² + z²)
    const acceleration = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    const delta = Math.abs(acceleration - lastAcceleration.total);

    // If movement exceeds threshold, count it as a step
    if (delta > SHAKE_THRESHOLD) {
        currentSessionSteps++;
        liveCounter.textContent = currentSessionSteps;
    }

    lastAcceleration = {
        x: acc.x,
        y: acc.y,
        z: acc.z,
        total: acceleration
    };
}

startBtn.addEventListener('click', async () => {
    const permission = await requestSensorPermission();
    if (!permission) {
        alert("Permission to access motion sensors was denied.");
        return;
    }

    isTracking = true;
    currentSessionSteps = 0;
    liveCounter.textContent = '0';
    
    document.getElementById('trackingIdle').classList.add('hidden');
    document.getElementById('trackingActive').classList.remove('hidden');

    window.addEventListener('devicemotion', handleMotion);
});

stopBtn.addEventListener('click', () => {
    isTracking = false;
    window.removeEventListener('devicemotion', handleMotion);

    if (currentSessionSteps > 0) {
        saveSteps(currentSessionSteps);
    }

    document.getElementById('trackingActive').classList.add('hidden');
    document.getElementById('trackingIdle').classList.remove('hidden');
});
// Add these variables to your existing steps.js
const circle = document.getElementById('progressCircle');
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function updateProgress(current, goal) {
    const percent = Math.min((current / goal) * 100, 100);
    const offset = circumference - (percent / 100 * circumference);
    circle.style.strokeDashoffset = offset;
    
    // Change color to green if goal met
    circle.style.stroke = percent >= 100 ? "#22c55e" : "#3b82f6";
}

// Goal Management
let dailyGoal = localStorage.getItem('stepGoal') || 5000;
document.getElementById('goalDisplay').textContent = dailyGoal;
document.getElementById('goalInput').value = dailyGoal;

document.getElementById('updateGoalBtn').addEventListener('click', () => {
    dailyGoal = document.getElementById('goalInput').value;
    localStorage.setItem('stepGoal', dailyGoal);
    document.getElementById('goalDisplay').textContent = dailyGoal;
    loadData(); // Refresh UI
});

// Update your existing loadData function to include updateProgress:
function loadData() {
    const session = getSession();
    const data = getSeniorData(session.seniorId);
    
    if (data && data.steps) {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayTotal = data.steps
            .filter(s => s.date.startsWith(todayStr))
            .reduce((sum, s) => sum + s.steps, 0);

        document.getElementById('totalStepsDisplay').textContent = todayTotal.toLocaleString();
        updateProgress(todayTotal, dailyGoal);
        renderHistory(data.steps);
    }
}
