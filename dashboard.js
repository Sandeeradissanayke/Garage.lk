// 1. ඔබගේ Firebase Config මෙතනට දාන්න
const firebaseConfig = {
    apiKey: "AIzaSyCDqryDjXE4mipP-sAxhEsX_j9-mr2gli0",
    authDomain: "garage-lk-c27a9.firebaseapp.com",
    projectId: "garage-lk-c27a9",
    storageBucket: "garage-lk-c27a9.firebasestorage.app",
    messagingSenderId: "974892352940",
    appId: "1:974892352940:web:860ae44797ab1b976f6609",
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

// ලොග් වී ඇති පරිශීලකයා පරීක්ෂා කිරීම
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('status').innerHTML = `🟢 Online (${user.email})`;
        document.getElementById('status').style.color = "#2ecc71";
        document.getElementById('logoutBtn').style.display = "inline-block";

        db.collection("garages").where("email", "==", user.email).get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const myGaragePhone = querySnapshot.docs[0].data().phone;
                    loadRequests(myGaragePhone);
                } else {
                    document.getElementById('requestsList').innerHTML = "<h3>⚠️ ඔබගේ ගිණුමට අදාළ ගරාජයක් දත්ත ගබඩාවේ හමු නොවීය!</h3>";
                }
            })
            .catch((error) => console.error("Error: ", error));
    } else {
        window.location.href = "login.html";
    }
});

// Real-time Requests ලබා ගැනීමේ ෆන්ක්ෂන් එක
function loadRequests(garagePhone) {
    // නව ඉල්ලීම් (Pending) ලබා ගැනීම
    db.collection("requests")
        .where("garagePhone", "==", garagePhone)
        .where("status", "==", "pending")
        .onSnapshot((snapshot) => {
            const requestsList = document.getElementById('requestsList');

            if (!snapshot.empty) {
                requestsList.innerHTML = "<h3>🚨 ඔබට නව ඉල්ලීම් ඇත!</h3>";
            } else {
                requestsList.innerHTML = "<h3>නව ඉල්ලීම් බලාපොරොත්තුවෙන්...</h3>";
            }

            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    triggerNotification();
                }
            });

            snapshot.forEach((doc) => {
                const req = doc.data();

                // දුරකථන අංකය සහ ලොකේෂන් එක සකස් කිරීම (අලුත් කොටස)
                const phone = req.customerPhone || "අංකයක් ලබාදී නැත";
                let locationHTML = (req.customerLat && req.customerLng) ?
                    `<a href="https://www.google.com/maps?q=${req.customerLat},${req.customerLng}" target="_blank" style="color: #06b6d4;">සිතියමේ බලන්න (Google Maps)</a>` :
                    `<span style="color: #ef4444;">ස්ථානය ලබා දී නැත</span>`;

                const card = `
                <div class="request-card" id="${doc.id}">
                    <h4>🔧 කාර්මිකයෙකු අවශ්‍ය වී ඇත!</h4>
                    <p><strong>දිනය/වේලාව:</strong> ${req.timestamp ? req.timestamp.toDate().toLocaleString() : 'දැන්'}</p>
                    <p><strong>📞 පාරිභෝගික අංකය:</strong> <a href="tel:${phone}" style="color: white;">${phone}</a></p>
                    <p><strong>📍 ස්ථානය:</strong> ${locationHTML}</p>
                    <button class="btn-accept" onclick="acceptRequest('${doc.id}')">Accept Request (භාරගන්න)</button>
                </div>
              `;
                requestsList.innerHTML += card;
            });
        });

    // භාරගත් ඉල්ලීම් (Accepted) ලබා ගැනීම
    db.collection("requests")
        .where("garagePhone", "==", garagePhone)
        .where("status", "==", "accepted")
        .onSnapshot((snapshot) => {
            const acceptedList = document.getElementById('acceptedRequestsList');
            acceptedList.innerHTML = "<h3>✅ භාරගත් ඉල්ලීම් (Accepted)</h3>";

            if (snapshot.empty) {
                acceptedList.innerHTML += "<p class='empty-msg'>දැනට භාරගත් ඉල්ලීම් නොමැත.</p>";
            }

            snapshot.forEach((doc) => {
                const req = doc.data();

                // දුරකථන අංකය සහ ලොකේෂන් එක සකස් කිරීම (අලුත් කොටස)
                const phone = req.customerPhone || "අංකයක් ලබාදී නැත";
                let locationHTML = (req.customerLat && req.customerLng) ?
                    `<a href="https://www.google.com/maps?q=${req.customerLat},${req.customerLng}" target="_blank" style="color: #06b6d4;">සිතියමේ බලන්න (Google Maps)</a>` :
                    `<span style="color: #ef4444;">ස්ථානය ලබා දී නැත</span>`;

                const card = `
                <div class="accepted-card" id="${doc.id}">
                    <h4>✅ ඔබ මෙම ඉල්ලීම භාරගෙන ඇත</h4>
                    <p><strong>දිනය/වේලාව:</strong> ${req.timestamp ? req.timestamp.toDate().toLocaleString() : 'දැන්'}</p>
                    <p><strong>📞 පාරිභෝගික අංකය:</strong> <a href="tel:${phone}" style="color: white;">${phone}</a></p>
                    <p><strong>📍 ස්ථානය:</strong> ${locationHTML}</p>
                    
                    <!-- මෙන්න මේ අලුත් බොත්තම තමයි මාරු වෙන්න ඕනේ -->
                    <button class="btn-complete" onclick="completeRequest('${doc.id}')">Mark as Completed (වැඩේ අවසන්)</button>
                </div>
              `;
                acceptedList.innerHTML += card;
            });
        });
}

// Notification යැවීම
function triggerNotification() {
    if (Notification.permission === 'granted') {
        new Notification("Garage.lk 🚨", {
            body: "ඔබට අලුත් හයර් එකක් ලැබී ඇත! වහාම Dashboard එක බලන්න."
        });
    }
}

// ඉල්ලීම භාර ගැනීම
function acceptRequest(id) {
    db.collection("requests").doc(id).update({
        status: "accepted"
    })
        .then(() => {
            alert("ඔබ ඉල්ලීම සාර්ථකව භාරගත්තා!");
        })
        .catch((error) => {
            console.error("Error updating status: ", error);
            alert("දෝෂයක් මතු විය! කරුණාකර නැවත උත්සාහ කරන්න.");
        });
}

// ඉල්ලීමක් සම්පූර්ණයෙන්ම අවසන් කිරීම (Completed)
window.completeRequest = function (id) {
    // වැරදීමකින් බොත්තම එබුණොත් අහන්න Confirm එකක් දාමු
    if (confirm("මෙම වැඩය සම්පූර්ණයෙන්ම අවසන් කළ බව තහවුරු කරනවාද?")) {
        db.collection("requests").doc(id).update({
            status: "completed"
        })
            .then(() => {
                alert("වැඩය අවසන් කළ බව සාර්ථකව සටහන් විය!");
            })
            .catch((error) => {
                console.error("Error updating status: ", error);
                alert("දෝෂයක් මතු විය! කරුණාකර නැවත උත්සාහ කරන්න.");
            });
    }
}

// ලොග් අවුට් වීම
window.logout = function () {
    auth.signOut().then(() => {
        window.location.href = "login.html";
    });
}