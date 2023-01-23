// App functionality lives here

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js"
import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js"
import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/+esm'

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
const documentCanvas = document.getElementById("documentCanvas");

const announcementsApp = createApp({
    data() {
        return {
            announcements: []
        }
    },
    created() {
        getAnnouncements();
    }
}).mount("#announcementsApp");

const documentsApp = createApp({
    data() {
        return {
            documentSlug: ""
        }
    },
    watch: {
        // set a watcher on documentSlug 
        // to attempt to open a document anytime a valid slug is found
        documentSlug(newValue, oldValue) {
            if(newValue) { this.openDocument(); }
        }
    },
    methods: {
        openDocument() {
            findDocumentWithSlug(this.documentSlug).then(res => {
                const contentElement = document.getElementById("markDownContent");
                const canvas = new bootstrap.Offcanvas('#documentCanvas');
                if(res.status == 200) {
                    res.text().then(md => {
                        const m = markdownIt();
                        contentElement.innerHTML = m.render(md);
                    });
                    canvas.show();
                } else {
                    contentElement.innerHTML = "Document Not Found :(";
                    console.error("Could not find article with slug: " + this.documentSlug);
                }
            });
        },
        findSlug() {
            const s = findSlugFromUrl();
            if (s) { this.documentSlug = s; }
        },
        cleanUp() {
            this.documentSlug = ""; // clear slug so we can detect new changes
            document.getElementById("markDownContent").innerHTML = ""; // 'clear' the content of our canvas ;)
            history.pushState("", 
                document.title, 
                window.location.pathname + window.location.search
            ); // remove slug. I hate this but it works.
        }
    },
    mounted() {
        // once app is ready, attempt to find a slug so we open any referenced documents
        this.findSlug();
    }
}).mount("#documentCanvas");

prepareCanvas();

function getAnnouncements() {
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

function findSlugFromUrl() {
    const urlParts = window.location.href.split("#");
    if (urlParts.length == 2) {
        // this means there's a hash in the url, 
        // which means we might have a document slug
        // we then check to see if the url hash has 'documents', the path to our documents directory

        if (urlParts[1].startsWith("documents")) {
            return urlParts[1];
        }
    }
    return null;
}

function findDocumentWithSlug(slug) {
    return fetch("/" + slug + ".md")
        .then(response => response);
}

// Prepare Canvas for reading canvas-data attributes
function prepareCanvas() {
    // const canvas = document.getElementById("articleCanvas");
    // documentCanvas.addEventListener("show.bs.offcanvas", event => {
        // As an example, canvasSlug (data-canvas-slug in HTML) passes a slug to Canvas
        // We can mount a Vue app in show.bs.offcanvas to request an article from a remote source
        // and display the contents in Canvas
        //
        // Ideally, we should be able to read the page's URL, 
        // and where a valid deeplink is found, open Canvas automagically in this same way
        // console.log(event.relatedTarget.dataset.canvasSlug);
        // UPDATE 23/01/2023: we may no longer need to pass this data attribute to documentCanvas
    // });

    documentCanvas.addEventListener("hide.bs.offcanvas", event => {
        documentsApp.cleanUp();
    });

    window.addEventListener("hashchange", event => {
        // We listen to changes in the URL hash, and attempt to find a document slug.
        documentsApp.findSlug();
    });
}

