// Modals
function openCheatSheet() {
    document.getElementById('cheat-sheet-modal').style.display = 'block';
}

function closeCheatSheet() {
    document.getElementById('cheat-sheet-modal').style.display = 'none';
}

function openGamifiedDemo() {
    document.getElementById('gamified-modal').style.display = 'block';
}

function closeGamifiedDemo() {
    document.getElementById('gamified-modal').style.display = 'none';
    document.getElementById('gamified-answer').style.display = 'none';
}

function revealAnswer(isProxy) {
    const answerDiv = document.getElementById('gamified-answer');
    answerDiv.style.display = 'block';
    if (isProxy) {
        answerDiv.style.backgroundColor = 'var(--success-bg)';
        answerDiv.style.color = 'var(--success-color)';
        answerDiv.innerHTML = '✅ Correct! This is Proxy Bias. Zip code acts as a proxy for race/ethnicity, leading to discriminatory outcomes even without explicitly asking for race.';
    } else {
        answerDiv.style.backgroundColor = 'var(--danger-bg)';
        answerDiv.style.color = 'var(--danger-color)';
        answerDiv.innerHTML = '❌ Incorrect. Direct discrimination would explicitly use race. Here, Zip code is used, making it Proxy Bias.';
    }
}

// Tab switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    checkInputReady();
}

function checkInputReady() {
    const isUploadActive = document.getElementById('tab-upload').classList.contains('active');
    if (isUploadActive) {
        if (fileInput && fileInput.files.length > 0) {
            analyzeBtn.disabled = false;
        } else {
            analyzeBtn.disabled = true;
        }
    } else {
        const dataInput = document.getElementById('data-input');
        if (dataInput && dataInput.value.trim().length > 0) {
            analyzeBtn.disabled = false;
        } else {
            analyzeBtn.disabled = true;
        }
    }
}

// File Upload Logic (Landing Page)
const fileInput = document.getElementById('file-input');
const uploadArea = document.getElementById('upload-area');
const analyzeBtn = document.getElementById('analyze-btn');

if (uploadArea) {
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.background = 'rgba(255,255,255,0.8)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.background = 'rgba(255,255,255,0.4)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileInput.files = e.dataTransfer.files;
        handleFileSelect();
    });

    fileInput.addEventListener('change', handleFileSelect);
}

function handleFileSelect() {
    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        uploadArea.querySelector('p').innerHTML = `Selected: <strong>${fileName}</strong>`;
        if (typeof checkInputReady === 'function') {
            checkInputReady();
        } else {
            analyzeBtn.disabled = false;
        }
    }
}

// Event listener for data input
document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('data-input');
    if (dataInput) {
        dataInput.addEventListener('input', checkInputReady);
    }
});

function analyzeData() {
    analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scanning...';
    // Simulate API call delay
    setTimeout(() => {
        window.location.href = '/dashboard';
    }, 1500);
}

// Screen Recording Feature
let mediaRecorder;
let recordedChunks = [];
const startBtn = document.getElementById('start-recording');
const stopBtn = document.getElementById('stop-recording');

if (startBtn) {
    startBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = function (e) {
                if (e.data.size > 0) recordedChunks.push(e.data);
            };
            
            mediaRecorder.onstop = function () {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'FairLens_Demo_Recording.webm';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
                recordedChunks = [];
                
                // Reset UI
                startBtn.classList.remove('hidden');
                stopBtn.classList.add('hidden');
            };
            
            mediaRecorder.start();
            startBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
            
            // Handle user stopping via browser UI
            stream.getVideoTracks()[0].onended = function () {
                if(mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            };
        } catch (err) {
            console.error("Error starting screen recording:", err);
            alert("Could not start screen recording. Please grant permissions.");
        }
    });

    stopBtn.addEventListener('click', () => {
        if(mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    });
}

// Dashboard Charts & Toggles
let myChart;

const biasedData = {
    labels: ['Privileged Group', 'Unprivileged Group'],
    datasets: [{
        label: 'Approval Rate (%)',
        data: [85, 65], // Biased outcomes
        backgroundColor: ['#00ACC1', '#F57F17'],
        borderRadius: 8
    }]
};

const mitigatedData = {
    labels: ['Privileged Group', 'Unprivileged Group'],
    datasets: [{
        label: 'Approval Rate (%)',
        data: [82, 79], // Mitigated outcomes
        backgroundColor: ['#00ACC1', '#00ACC1'],
        borderRadius: 8
    }]
};

function initDashboard() {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;

    myChart = new Chart(ctx, {
        type: 'bar',
        data: biasedData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function toggleBiasCorrection() {
    const isMitigated = document.getElementById('bias-toggle').checked;
    updateDashboardUI(isMitigated);
}

function applyMitigation() {
    document.getElementById('bias-toggle').checked = true;
    updateDashboardUI(true);
}

function updateDashboardUI(isMitigated) {
    const statusBanner = document.getElementById('status-banner');
    const toggleStatusText = document.getElementById('toggle-status-text');
    
    // Update Chart
    myChart.data = isMitigated ? mitigatedData : biasedData;
    myChart.update();
    
    if (isMitigated) {
        // Update Banner
        statusBanner.style.background = 'var(--success-bg)';
        statusBanner.style.borderColor = '#a5d6a7';
        statusBanner.innerHTML = `
            <div class="status-icon" style="color: var(--success-color)"><i class="fa-solid fa-circle-check"></i></div>
            <div class="status-text">
                <h2 style="color: var(--success-color)">Fairness Mitigations Applied</h2>
                <p>The model now passes fairness checks with balanced outcomes.</p>
            </div>
        `;
        
        // Update Metrics
        document.getElementById('val-parity').innerText = '-0.02';
        document.getElementById('card-parity').querySelector('.indicator').className = 'indicator good';
        document.getElementById('card-parity').querySelector('.indicator').innerHTML = '<i class="fa-solid fa-check"></i> Fair';
        
        document.getElementById('val-opportunity').innerText = '-0.05';
        document.getElementById('card-opportunity').querySelector('.indicator').className = 'indicator good';
        document.getElementById('card-opportunity').querySelector('.indicator').innerHTML = '<i class="fa-solid fa-check"></i> Fair';
        
        document.getElementById('val-impact').innerText = '0.95';
        document.getElementById('card-impact').querySelector('.indicator').className = 'indicator good';
        document.getElementById('card-impact').querySelector('.indicator').innerHTML = '<i class="fa-solid fa-check"></i> Passes 80% Rule';
        
        toggleStatusText.innerText = "Showing: Corrected Model";
        toggleStatusText.style.color = 'var(--success-color)';
    } else {
        // Revert to Biased
        statusBanner.style.background = 'var(--danger-bg)';
        statusBanner.style.borderColor = '#ef9a9a';
        statusBanner.innerHTML = `
            <div class="status-icon" style="color: var(--danger-color)"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <div class="status-text">
                <h2 style="color: var(--danger-color)">Bias Detected in Dataset</h2>
                <p>The model shows significant statistical disparity against unprivileged groups.</p>
            </div>
        `;
        
        // Revert Metrics
        document.getElementById('val-parity').innerText = '-0.15';
        document.getElementById('card-parity').querySelector('.indicator').className = 'indicator bad';
        document.getElementById('card-parity').querySelector('.indicator').innerHTML = '<i class="fa-solid fa-arrow-down"></i> High Disparity';
        
        document.getElementById('val-opportunity').innerText = '-0.22';
        document.getElementById('card-opportunity').querySelector('.indicator').className = 'indicator bad';
        document.getElementById('card-opportunity').querySelector('.indicator').innerHTML = '<i class="fa-solid fa-arrow-down"></i> High Disparity';
        
        document.getElementById('val-impact').innerText = '0.78';
        document.getElementById('card-impact').querySelector('.indicator').className = 'indicator warning';
        document.getElementById('card-impact').querySelector('.indicator').innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Below 0.8 (80% Rule)';
        
        toggleStatusText.innerText = "Showing: Biased Model";
        toggleStatusText.style.color = 'var(--danger-color)';
    }
}