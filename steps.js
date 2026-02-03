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
