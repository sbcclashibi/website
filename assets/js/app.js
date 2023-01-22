// App functionality lives here

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js"
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js'

// Set up Firebase conf
const firebaseConfig = {
    apiKey: "AIzaSyAh9J3pLBxIzai2hcjidrjXH-WyVquXo_0",
    authDomain: "sbcc-website-339820.firebaseapp.com",
    projectId: "sbcc-website-339820",
    storageBucket: "sbcc-website-339820.appspot.com",
    messagingSenderId: "211208154905",
    appId: "1:211208154905:web:565871c26e7f562fff1f88",
    databaseUrl: "https://sbcc-website-339820-default-rtdb.firebaseio.com/"
};
    
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const announcementsApp = createApp({
    data() {
        return {
            announcements: []
        }
    },
    created() {
        getAnnouncements();
    },
    mounted() {
        console.log("I've just been mounted!");
    }
}).mount("#announcementsApp");

prepareCanvas();

function getAnnouncements() {
    console.log("Getting announcements...");
    const announcementsRef = ref(database, "beta/announcements");
    onValue(announcementsRef, (snapshot) => {
        const data = snapshot.val();
        announcementsApp.announcements = snapshot.val()
        // We add and remove d-none from the status indicator and announcements row proper
        // to prevent ugly moustaches from showing before Vue takes control of web page
        document.getElementById("announcementsAppStatus").classList.add("d-none");
        document.getElementById("announcementsAppRow").classList.remove("d-none");
    });
}

// Prepare Canvas for reading canvas-data attributes
function prepareCanvas() {
    const canvas = document.getElementById("offcanvasBottom");
    canvas.addEventListener("show.bs.offcanvas", event => {
        // As an example, canvasSlug (data-canvas-slug in HTML) passes a slug to Canvas
        // We can mount a Vue app in show.bs.offcanvas to request an article from a remote source
        // and display the contents in Canvas
        //
        // Ideally, we should be able to read the page's URL, 
        // and where a valid deeplink is found, open Canvas automagically in this same way
        console.log(event.relatedTarget.dataset.canvasSlug);
    });
}