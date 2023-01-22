// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js"
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js'
//   import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
      
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAh9J3pLBxIzai2hcjidrjXH-WyVquXo_0",
    authDomain: "sbcc-website-339820.firebaseapp.com",
    projectId: "sbcc-website-339820",
    storageBucket: "sbcc-website-339820.appspot.com",
    messagingSenderId: "211208154905",
    appId: "1:211208154905:web:565871c26e7f562fff1f88",
    databaseUrl: "https://sbcc-website-339820-default-rtdb.firebaseio.com/"
    // measurementId: "G-6GHXXTPH6J"
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

function getAnnouncements() {
    console.log("Getting announcements");
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