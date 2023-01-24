// App functionality lives here

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js"
import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js"
import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/+esm'
import 'https://cdn.jsdelivr.net/gh/mcstudios/glightbox/dist/js/glightbox.min.js';

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

// Initialize apps
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const announcementsApp = createApp({
    data() {
        return {
            announcements: []
        }
    },
    methods: {
        getAnnouncements() {
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
    },
    created() {
        this.getAnnouncements();
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
            // find document with slug and attempt to open it
            fetch("/" + this.documentSlug + ".md").then(response => {
                const contentElement = document.getElementById("markDownContent");
                const canvas = new bootstrap.Offcanvas('#documentCanvas');
                if(response.status == 200) {
                    response.text().then(md => {
                        const m = markdownIt();
                        contentElement.innerHTML = m.render(md);
                    });
                } else {
                    contentElement.innerHTML = "Document not found <i class='bi bi-emoji-frown'></i>";
                    console.error("Could not find article with slug: " + this.documentSlug);
                }
                canvas.show();
            });
        },
        findSlug() {
            const urlParts = window.location.href.split("#");
            if (urlParts.length == 2) {
                // this means there's a hash in the url, 
                // which means we might have a document slug
                // we then check to see if the url hash starts with 'documents/', 
                // the path to our documents directory
                if (urlParts[1].startsWith("documents/")) {
                    this.documentSlug = urlParts[1];
                }
            }
        },
        setUpCanvas() {
            document.getElementById("documentCanvas").addEventListener("hide.bs.offcanvas", event => {
                this.cleanUp();
            });
            
            window.addEventListener("hashchange", event => {
                // We listen to changes in the URL hash, and attempt to find a document slug.
                this.findSlug();
            });
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
    created() {
        // set up listeners and stuff
        this.setUpCanvas();
    },
    mounted() {
        // once app is ready, attempt to find a slug 
        // so we open any linked documents
        this.findSlug();
    }
}).mount("#documentCanvas");

const galleryApp = createApp({
    data() {
        return {
            gallery: []
        }
    },
    methods: {
        getGalleryItems() {
            fetch("/gallery/gallery.json")
            .then(response => response.json())
            .then(items => {
                this.gallery = items;
            });
        }
    },
    created() {
        this.getGalleryItems();
    },
    updated() {
        // initialize GLightbox only after items have been rendered
        const portfolioLightbox = GLightbox({
            selector: '.portfolio-lightbox'
        });
    }
}).mount("#galleryApp");

const slideApp = createApp({
    data() {
        return {
            items: []
        }
    },
    methods: {
        getSlideItems() {
            fetch("/slide/slide.json")
            .then(response => response.json())
            .then(it => {
                this.items = it;
                console.log(this.items.length)
            });
        },
        setUpIndicators() {
            // pilfered from main.js
            let heroCarouselIndicators = document.getElementById("hero-carousel-indicators");
            let heroCarouselItems = document.querySelectorAll('#heroCarousel .carousel-item');
            
            heroCarouselItems.forEach((item, index) => {
                (index === 0) ?
                heroCarouselIndicators.innerHTML += "<li data-bs-target='#heroCarousel' data-bs-slide-to='" + index + "' class='active'></li>":
                heroCarouselIndicators.innerHTML += "<li data-bs-target='#heroCarousel' data-bs-slide-to='" + index + "'></li>";
            });
        }
    },
    created() {
        this.getSlideItems();
    },
    updated() {
        // after items have been rendered, reveal them by unhiding slideInnerContainer
        // and set up the carousel indicators (which need to know how many .carousel-item elements exist.)
        document.getElementById("slideInnerContainer").classList.remove("d-none");
        this.setUpIndicators();
    }
}).mount("#heroCarousel");
