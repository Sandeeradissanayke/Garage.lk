// 1. ඔබගේ Firebase Config මෙතනට දාන්න
const firebaseConfig = {
    apiKey: "AIzaSyCDqryDjXE4mipP-sAxhEsX_j9-mr2gli0",
    authDomain: "garage-lk-c27a9.firebaseapp.com",
    projectId: "garage-lk-c27a9",
    storageBucket: "garage-lk-c27a9.firebasestorage.app",
    messagingSenderId: "974892352940",
    appId: "1:974892352940:web:860ae44797ab1b976f6609",
    measurementId: "G-LKS8DCNZ1L"
};

// Firebase ආරම්භ කිරීම
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// දැනටමත් ලොග් වී ඇත්නම් කෙලින්ම Dashboard එකට යැවීම
auth.onAuthStateChanged((user) => {
    if (user) {
        window.location.href = "dashboard.html";
    }
});

// ලොගින් ෆෝම් එක සබ්මිට් කිරීම
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // පිටුව රීලෝඩ් වීම වැළැක්වීම

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loginBtn.innerHTML = "Logging in...";
    loginBtn.disabled = true;
    errorMessage.innerHTML = "";

    // Firebase හරහා ලොග් වීම
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // සාර්ථකව ලොග් වුවහොත්
            loginBtn.innerHTML = "Success!";
            loginBtn.style.background = "#2ecc71";
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            // දෝෂයක් මතු වුවහොත්
            loginBtn.innerHTML = "Login to Dashboard";
            loginBtn.disabled = false;

            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage.innerHTML = "ඊමේල් ලිපිනය හෝ මුරපදය වැරදියි!";
            } else {
                errorMessage.innerHTML = error.message;
            }
        });
});