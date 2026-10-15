// ==========================================
// PUSH NOTIFICATIONS & SERVICE WORKER
// ==========================================
if ('Notification' in window && 'serviceWorker' in navigator) {
    // 1. Notification සඳහා අවසර ඉල්ලීම
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log("Notifications සඳහා අවසර ලැබුණා!");

            // 2. Service Worker එක ලියාපදිංචි කිරීම
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log("Service Worker සාර්ථකයි!", reg))
                .catch(err => console.error("Service Worker දෝෂයක්:", err));
        } else {
            console.log("Notifications සඳහා අවසර ලබා දුන්නේ නැත.");
        }
    });
}

// ටෙස්ට් කිරීම සඳහා Notification එකක් යවන Function එක
window.sendTestNotification = function () {
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(reg => {
            reg.showNotification('Garage.lk 🔴', {
                body: 'අලුත් ඉල්ලීමක්! පාරිභෝගිකයෙකුට කාර්මිකයෙකු අවශ්‍ය වී ඇත.',
                icon: 'https://cdn-icons-png.flaticon.com/512/198/198111.png', // කුඩා අයිකනයක්
                vibrate: [200, 100, 200, 100, 200], // ෆෝන් එක වයිබ්‍රේට් වෙන රටාව
            });
        });
    } else {
        alert("කරුණාකර Notifications සඳහා Allow කරන්න.");
    }
};


// ==========================================
// 0. FIREBASE DATABASE CONNECTION
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyCDqryDjXE4mipP-sAxhEsX_j9-mr2gli0",
    authDomain: "garage-lk-c27a9.firebaseapp.com",
    projectId: "garage-lk-c27a9",
    storageBucket: "garage-lk-c27a9.firebasestorage.app",
    messagingSenderId: "974892352940",
    appId: "1:974892352940:web:860ae44797ab1b976f6609",
    measurementId: "G-LKS8DCNZ1L"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==========================================
// 1. HOME PAGE SERVICE CARDS SELECTION
// ==========================================
function toggleService(card) {
    const checkbox = card.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    if (checkbox.checked) {
        card.classList.add('selected');
    } else {
        card.classList.remove('selected');
    }
}

// ==========================================
// 2. DARK / LIGHT THEME TOGGLE
// ==========================================
const themeToggleBtn = document.getElementById('themeToggleBtn');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });
}

// ==========================================
// 3. LOGIN / SIGN UP MODAL LOGIC
// ==========================================
const loginBtn = document.getElementById('loginBtn');
const authModal = document.getElementById('authModal');
const closeModal = document.getElementById('closeModal');
const signInTabBtn = document.getElementById('signInTabBtn');
const signUpTabBtn = document.getElementById('signUpTabBtn');
const signInForm = document.getElementById('signInForm');
const signUpForm = document.getElementById('signUpForm');

if (loginBtn && authModal) loginBtn.addEventListener('click', () => authModal.classList.add('active'));
if (closeModal) closeModal.addEventListener('click', () => authModal.classList.remove('active'));
if (authModal) { authModal.addEventListener('click', (e) => { if (e.target === authModal) authModal.classList.remove('active'); }); }
if (signInTabBtn && signUpTabBtn) {
    signInTabBtn.addEventListener('click', () => {
        signInTabBtn.classList.add('active'); signUpTabBtn.classList.remove('active');
        signInForm.style.display = 'block'; signUpForm.style.display = 'none';
    });
    signUpTabBtn.addEventListener('click', () => {
        signUpTabBtn.classList.add('active'); signInTabBtn.classList.remove('active');
        signUpForm.style.display = 'block'; signInForm.style.display = 'none';
    });
}

// ==========================================
// 4. GARAGE REGISTRATION (register.html eken run wenawa)
// ==========================================
const registerGarageForm = document.getElementById('registerGarageForm');
let registerMap;
let registerMarker;

document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('registerMap');
    if (mapContainer) {
        registerMap = L.map('registerMap').setView([7.8731, 80.7718], 7);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri' }).addTo(registerMap);
        registerMarker = L.marker([7.8731, 80.7718], { draggable: true }).addTo(registerMap);

        registerMarker.on('dragend', function () {
            const pos = registerMarker.getLatLng();
            document.getElementById('locationCoordinates').value = pos.lat.toFixed(5) + ", " + pos.lng.toFixed(5);
        });

        registerMap.on('click', function (e) {
            registerMarker.setLatLng(e.latlng);
            document.getElementById('locationCoordinates').value = e.latlng.lat.toFixed(5) + ", " + e.latlng.lng.toFixed(5);
        });

        if (typeof L.Control.Geocoder !== 'undefined') {
            L.Control.geocoder({ defaultMarkGeocode: false, placeholder: "Search location..." })
                .on('markgeocode', function (e) {
                    const latlng = e.geocode.center;
                    registerMarker.setLatLng(latlng);
                    registerMap.setView(latlng, 15);
                    document.getElementById('locationCoordinates').value = latlng.lat.toFixed(5) + ", " + latlng.lng.toFixed(5);
                }).addTo(registerMap);
        }

        setTimeout(() => { registerMap.invalidateSize(); }, 300);
    }
});

const regSrvBtns = document.querySelectorAll('.reg-srv-btn');
regSrvBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        this.classList.toggle('active');
    });
});

if (registerGarageForm) {
    registerGarageForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const pass = document.getElementById('garagePassword').value;
        const confirmPass = document.getElementById('garageConfirmPassword').value;
        if (pass.length < 6) { alert("Password එක සඳහා අවම වශයෙන් අකුරු හෝ ඉලක්කම් 6ක් අවශ්‍යයි."); return; }
        if (pass !== confirmPass) { alert("ඔබ ඇතුළත් කළ පාස්වර්ඩ් දෙක එකිනෙකට නොගැළපේ."); return; }

        const selectedRegServices = Array.from(document.querySelectorAll('.reg-srv-btn.active')).map(btn => btn.getAttribute('data-value'));
        if (selectedRegServices.length === 0) {
            alert("කරුණාකර ඔබගේ ගරාජයෙන් සපයන එක් සේවාවක් හෝ තෝරන්න.");
            return;
        }

        const gName = document.querySelector('input[placeholder="Enter garage name"]').value;
        const gPhone = document.querySelector('input[placeholder="Enter contact number"]').value;
        const locCoords = document.getElementById('locationCoordinates').value;
        if (!locCoords) { alert("කරුණාකර සිතියමේ ඔබගේ ස්ථානය ලකුණු කරන්න."); return; }

        const coordsArray = locCoords.split(',');
        const newGarage = {
            name: gName,
            lat: parseFloat(coordsArray[0]),
            lng: parseFloat(coordsArray[1]),
            phone: gPhone,
            services: selectedRegServices
        };

        const submitBtn = document.querySelector('#registerGarageForm .submit-btn');
        submitBtn.innerHTML = "SAVING TO DATABASE...";

        db.collection("garages").add(newGarage).then(() => {
            alert("Registration Successfully! ඔබගේ ගරාජය අන්තර්ජාල දත්ත සමුදායට එක් කරන ලදී.");
            registerGarageForm.reset();
            document.querySelectorAll('.reg-srv-btn.active').forEach(btn => btn.classList.remove('active'));
            if (registerMarker) {
                registerMarker.setLatLng([7.8731, 80.7718]);
                document.getElementById('locationCoordinates').value = '';
            }
            submitBtn.innerHTML = "SUBMIT REGISTRATION";
            window.location.href = "index.html";
        }).catch((error) => {
            console.error("Error adding document: ", error);
            alert("දත්ත ඇතුළත් කිරීමේදී දෝෂයක් මතු විය. කරුණාකර Firebase Firestore Security Rules පරීක්ෂා කරන්න.");
            submitBtn.innerHTML = "SUBMIT REGISTRATION";
        });
    });
}

// ==========================================
// 5. FIND NEARBY GARAGES (FETCHING FROM FIREBASE)
// ==========================================
const initialGarages = [
    { name: "Saman Auto Care (Colombo)", lat: 6.9271, lng: 79.8612, phone: "0771111111", services: ["engine", "tyre", "oil", "battery"] },
    { name: "Colombo Quick Fix", lat: 6.9350, lng: 79.8500, phone: "0772221111", services: ["towing", "ac", "fuel"] },
    { name: "Kumara Garage (Kandy)", lat: 7.2906, lng: 80.6337, phone: "0773333333", services: ["battery", "ac", "tyre", "engine"] },
    { name: "Galle Auto Fix (Galle)", lat: 6.0328, lng: 80.2168, phone: "0774444444", services: ["engine", "oil", "battery", "tyre"] }
];

const findGaragesBtn = document.getElementById('findGaragesBtn');
const useCurrentLocBtn = document.getElementById('useCurrentLocBtn');
const searchAreaInput = document.getElementById('searchAreaInput');
const garagesMapModal = document.getElementById('garagesMapModal');
const closeGaragesMapModal = document.getElementById('closeGaragesMapModal');

let resultsMap;
let userCoords = null;

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

if (useCurrentLocBtn) {
    useCurrentLocBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            useCurrentLocBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Detecting...';
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    userCoords = [pos.coords.latitude, pos.coords.longitude];
                    searchAreaInput.value = "Current Location Detected";
                    useCurrentLocBtn.innerHTML = '<i class="fa-solid fa-check"></i> Location Found';
                    useCurrentLocBtn.style.color = "#25d366";
                },
                (err) => {
                    alert("Location access denied.");
                    useCurrentLocBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Use current location';
                }
            );
        }
    });
}

if (findGaragesBtn && garagesMapModal) {
    findGaragesBtn.addEventListener('click', async () => {
        const selectedCheckboxes = document.querySelectorAll('.service-card input[type="checkbox"]:checked');
        const selectedServices = Array.from(selectedCheckboxes).map(cb => cb.value);

        let searchLat = null;
        let searchLng = null;

        findGaragesBtn.innerHTML = "SEARCHING...";

        if (userCoords) {
            searchLat = userCoords[0];
            searchLng = userCoords[1];
        } else if (searchAreaInput && searchAreaInput.value.trim() !== "" && searchAreaInput.value !== "Current Location Detected") {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchAreaInput.value.trim()}, Sri Lanka`);
                const data = await response.json();
                if (data && data.length > 0) {
                    searchLat = parseFloat(data[0].lat);
                    searchLng = parseFloat(data[0].lon);
                } else {
                    alert("ඔබ ලබාදුන් නගරය සිතියමේ සොයාගත නොහැක.");
                }
            } catch (err) { console.log(err); }
        }

        try {
            const snapshot = await db.collection("garages").get();
            let allGarages = [];
            snapshot.forEach(doc => allGarages.push(doc.data()));

            if (allGarages.length === 0) {
                for (let g of initialGarages) {
                    await db.collection("garages").add(g);
                    allGarages.push(g);
                }
            }

            const filteredGarages = allGarages.filter(garage => {
                let serviceMatch = true;
                if (selectedServices.length > 0) {
                    if (!garage.services) return false;
                    serviceMatch = selectedServices.some(service => garage.services.includes(service));
                }

                let distanceMatch = true;
                if (searchLat !== null && searchLng !== null) {
                    const dist = getDistance(searchLat, searchLng, garage.lat, garage.lng);
                    if (dist > 30) distanceMatch = false;
                }
                return serviceMatch && distanceMatch;
            });

            findGaragesBtn.innerHTML = "FIND NEARBY GARAGES";

            if (filteredGarages.length === 0) {
                alert("මෙම ප්‍රදේශයේ ඔබ තෝරාගත් සේවාවන් සහිත ගරාජ් කිසිවක් දැනට ලියාපදිංචි වී නොමැත.");
                return;
            }

            garagesMapModal.classList.add('active');

            setTimeout(() => {
                if (!resultsMap) {
                    resultsMap = L.map('resultsMap').setView([7.8731, 80.7718], 8);
                    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri' }).addTo(resultsMap);
                }

                resultsMap.eachLayer((layer) => { if (layer instanceof L.Marker) resultsMap.removeLayer(layer); });

                const garageIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
                const userIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });

                filteredGarages.forEach(garage => {
                    let distText = "";
                    if (searchLat && searchLng) {
                        const dist = getDistance(searchLat, searchLng, garage.lat, garage.lng);
                        distText = `<p style="margin:0 0 5px 0; font-size:12px; color:red;"><b>Distance:</b> ${dist.toFixed(1)} km</p>`;
                    }

                    const popupContent = `
                        <div style="color: black; width: 180px;">
                            <h4 style="margin:0 0 5px 0;">${garage.name}</h4>
                            <p style="margin:0 0 5px 0; font-size:12px;"><b>Services:</b> ${garage.services ? garage.services.join(", ") : "N/A"}</p>
                            <p style="margin:0 0 5px 0; font-size:12px;"><b>Phone:</b> ${garage.phone}</p>
                            ${distText}
                            <button onclick="sendMechanicRequest('${garage.phone}', '${garage.name}', this)" style="background:#1d3eff; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; width:100%; font-weight:bold;">Request Mechanic</button>
                        </div>`;
                    L.marker([garage.lat, garage.lng], { icon: garageIcon }).addTo(resultsMap).bindPopup(popupContent);
                });

                if (searchLat !== null && searchLng !== null) {
                    L.marker([searchLat, searchLng], { icon: userIcon }).addTo(resultsMap).bindPopup("<b>You are here!</b>").openPopup();
                    resultsMap.setView([searchLat, searchLng], 12);
                } else {
                    resultsMap.setView([7.8731, 80.7718], 7);
                }
                resultsMap.invalidateSize();
            }, 400);

        } catch (error) {
            console.error("Error fetching data: ", error);
            alert("අන්තර්ජාලයෙන් දත්ත ලබා ගැනීමේදී දෝෂයක් ඇති විය.");
            findGaragesBtn.innerHTML = "FIND NEARBY GARAGES";
        }
    });
}
if (closeGaragesMapModal) closeGaragesMapModal.addEventListener('click', () => garagesMapModal.classList.remove('active'));
if (garagesMapModal) garagesMapModal.addEventListener('click', (e) => { if (e.target === garagesMapModal) garagesMapModal.classList.remove('active'); });

// ==========================================
// 6. SEND MECHANIC REQUEST TO FIREBASE
// ==========================================
window.sendMechanicRequest = function (garagePhone, garageName, btnElement) {
    // 1. පාරිභෝගිකයාගෙන් දුරකථන අංකය ඉල්ලීම
    let customerPhone = prompt("කරුණාකර ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න:");

    if (customerPhone == null || customerPhone.trim() === "") {
        alert("ඉල්ලීම යැවීමට ඔබගේ දුරකථන අංකය අත්‍යවශ්‍ය වේ!");
        return;
    }

    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = "SENDING...";
    btnElement.disabled = true;

    // 2. ලොකේෂන් එක ලබා ගැනීම
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                // ලොකේෂන් එක ලැබුණොත්
                sendDataToFirebase(position.coords.latitude, position.coords.longitude);
            },
            function (error) {
                // ලොකේෂන් එක දුන්නේ නැත්නම් හෝ දෝෂයක් ආවොත්
                alert("අවවාදයයි: ඔබගේ ස්ථානය ලබා ගැනීමට නොහැකි විය. ගරාජය ඔබව දුරකථනයෙන් සම්බන්ධ කර ගනු ඇත.");
                sendDataToFirebase(null, null); // ලොකේෂන් නැතුව යවනවා
            },
            { enableHighAccuracy: true } // වඩාත් නිවැරදි ස්ථානය ගන්න
        );
    } else {
        alert("ඔබගේ බ්‍රවුසරය ස්ථානය ලබා දීමට සහය නොදක්වයි.");
        sendDataToFirebase(null, null);
    }

    // 3. Firebase එකට දත්ත යවන කොටස
    function sendDataToFirebase(lat, lng) {
        const requestData = {
            garagePhone: garagePhone,
            garageName: garageName,
            customerPhone: customerPhone,
            customerLat: lat,
            customerLng: lng,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: "pending"
        };

        db.collection("requests").add(requestData)
            .then((docRef) => {
                alert(garageName + " වෙත ඔබගේ ඉල්ලීම සාර්ථකව යවන ලදී! කරුණාකර රැඳී සිටින්න...");
                btnElement.innerHTML = "WAITING...";
                btnElement.style.background = "#f39c12";

                // අලුත් කොටස: ගරාජයෙන් ඉල්ලීම Accept කරන තුරු Real-time බලා සිටීම
                const unsubscribe = db.collection("requests").doc(docRef.id)
                    .onSnapshot((doc) => {
                        const data = doc.data();
                        if (data && data.status === "accepted") {
                            // ගරාජය ඉල්ලීම භාරගත් පසු පාරිභෝගිකයාට දැනුම් දීම
                            alert("✅ සුබ ආරංචියක්! " + garageName + " විසින් ඔබගේ ඉල්ලීම භාරගෙන ඇත. ඔවුන් ඉක්මනින් ඔබව දුරකථනයෙන් අමතනු ඇත.");
                            btnElement.innerHTML = "ACCEPTED ✓";
                            btnElement.style.background = "#2ecc71";

                            // දැනුම් දීමෙන් පසු දිගටම පරීක්ෂා කිරීම (Listening) නවත්වන්න
                            unsubscribe();
                        }
                    });
            })
            .catch((error) => {
                console.error("Error sending request: ", error);
                alert("ඉල්ලීම යැවීමේදී දෝෂයක් මතු විය.");
                btnElement.innerHTML = originalText;
                btnElement.disabled = false;
            });
    }
};

// ==========================================
// MOBILE MENU TOGGLE LOGIC
// ==========================================
const mobileMenuBtn = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        // 'active' කියන class එක දැම්මම CSS වල තියෙන විදිහට මෙනුව එළියට එනවා
        navMenu.classList.toggle('active');

        // අයිකන් එක 'හතරැස්' (bars) එකෙන් 'කතිරය' (times) එකට මාරු කිරීම
        if (navMenu.classList.contains('active')) {
            mobileMenuBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        } else {
            mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    });

    // මෙනු එකේ ලින්ක් එකක් එබුවම මෙනුව ඔටෝම වැහෙන විදිහට හැදීම
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
    });
}