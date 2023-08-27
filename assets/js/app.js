// App functionality lives here

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js"
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-analytics.js"
import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js"
import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/+esm'
import 'https://cdn.jsdelivr.net/gh/mcstudios/glightbox/dist/js/glightbox.min.js'

// Set up Firebase conf
const firebaseConfig = {
    apiKey: "AIzaSyAh9J3pLBxIzai2hcjidrjXH-WyVquXo_0",
    authDomain: "sbcc-website-339820.firebaseapp.com",
    projectId: "sbcc-website-339820",
    storageBucket: "sbcc-website-339820.appspot.com",
    messagingSenderId: "211208154905",
    appId: "1:211208154905:web:a6ddcef6a52fc709ff1f88",
    measurementId: "G-MFK69HVM3Y",
    databaseUrl: "https://sbcc-website-339820-default-rtdb.firebaseio.com/"
};

// Initialize apps
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);
const isLiveSite = window.location.hostname.startsWith("saintbakhita.");
const contentCategories = ["uncategorized", "commentary", "reflection"];

const log = function(eventName = "unknown_event", eventData = {}){
    if(isLiveSite) { /* logEvent(analytics, eventName, eventData); */ }
}

const announcementsApp = createApp({
    delimiters: ["[[", "]]"],
    data() {
        return {
            announcements: []
        }
    },
    methods: {
        getAnnouncements() {
            // index === 0 ? 'carousel-item active' : 'carousel-item'
            // const announcementsRef = ref(database, "beta/announcements");
            // the exact database ref is based on the subdomain.
            // the beta site listens on "beta/*" refs, and all others listen on "prod/*" refs
            const announcementsRef = ref(database, 
                isLiveSite ? "prod/announcements" : "beta/announcements"
            );
            onValue(announcementsRef, (snapshot) => {
                const data = snapshot.val();
                if(data) {
                    announcementsApp.announcements = data
                    // We add and remove d-none from the status indicator and announcements row proper
                    // to prevent ugly moustaches from showing before Vue takes control of web page
                    document.getElementById("announcementsAppStatus").classList.add("d-none");
                    document.getElementById("announcementsAppRow").classList.remove("d-none");
                }
            });
        }
    },
    created() {
        this.getAnnouncements();
        setTimeout(_ => {
            // if for some reason announcements took too long to load,
            // let the user know
            // hint: this might not be terribly useful :(
            document.getElementById("announcementsAppStatus").innerHTML =
                "Announcements took too long to load. " 
                + "<br>Kindly refresh the page. <i class='bi bi-arrow-clockwise'></i>";
        }, 5000);
    }
}).mount("#announcementsApp");

const schedulesApp = createApp({
    delimiters: ["[[", "]]"],
    data() {
        return {
            masses: [],
            events: [],
            sacraments: []
        }
    },
    methods: {
        getschedules() {
            // the exact database ref is based on the subdomain.
            // the beta site listens on "beta/*" refs, and all others listen on "prod/*" refs
            const schedulesRef = ref(database, 
                isLiveSite ? "prod/schedules" : "beta/schedules"
            );
            onValue(schedulesRef, (snapshot) => {
                const data = snapshot.val();
                if(data) {
                    // We add and remove d-none from the status indicator and schedules row proper
                    // to prevent ugly moustaches from showing before Vue takes control of web page
                    schedulesApp.masses = data["masses"];
                    schedulesApp.events = data["events"];
                    schedulesApp.sacraments = data["sacraments"];

                    // By default, the containers for events are hidden.
                    // Unhide them after they have been set
                    document.getElementById("massItems").classList.remove("d-none");
                    document.getElementById("eventItems").classList.remove("d-none");
                    document.getElementById("sacramentItems").classList.remove("d-none");
                }
            });
        }
    },
    created() {
        this.getschedules();
        setTimeout(_ => {
            // if for some reason schedules took too long to load,
            // let the user know
            // hint: this might not be terribly useful :(
            document.getElementById("announcementsAppStatus").innerHTML =
                "Schedules took too long to load. " 
                + "<br>Kindly refresh the page. <i class='bi bi-arrow-clockwise'></i>";
        }, 5000);
    }
}).mount("#schedulesApp");


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
                        const m = markdownIt({
                            html: true,
                            typographer: true
                        });
                        contentElement.innerHTML = m.render(md);
                        log("document_open", {"slug": this.documentSlug});
                    });
                } else {
                    contentElement.innerHTML = "Document not found <i class='bi bi-emoji-frown'></i>";
                    console.error("Could not find article with slug: " + this.documentSlug);
                    log("document_not_found", {"slug": this.documentSlug});
                }
                canvas.show();
            });
        },
        findSlug() {
            const urlHash = window.location.hash.trim().substring(1);
            const pathName = window.location.pathname.trim().substring(1);
            // We found a non-empty URL hash 
            // which means we might have a document slug
            // we then check to see if the url hash starts with 'documents/', 
            // the path to our documents directory
            if (urlHash && urlHash.startsWith("documents/")) {
                this.documentSlug = urlHash;
                return;
            }

            // We did not find a URL hash,
            // so we attempt to get a new slug by reading the current URL whole
            // and searching for recognized content categories, as these will tell us
            // we're looking at some content page's url
            if (pathName && contentCategories.some(category => pathName.startsWith(category))) {
                // Drop the trailing slash from pathName, 
                // split along '/' and retrieve slug from the last item in the array
                // then, append "documents/" to create the fully qualified slug path
                this.documentSlug = "documents/" + pathName.slice(0, -1).split("/").pop();
                return;
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
    delimiters: ["[[", "]]"],
    data() {
        return {
            gallery: []
        }
    },
    methods: {
        getGalleryItems() {
            var URL = "/gallery/gallery.json";
            console.log(window.location.pathname);
            if(window.location.pathname.startsWith("/events")) {
                URL = "/gallery/gallery-events.json";
            }
            fetch(URL)
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
        // sometimes, gallery overlays the next section, leading to horrible UX
        // I think this happens when the gallery images don't load immediately
        // and the Isotope layout is already initialized
        // to fix this (I hope!), we delay the Isotope's init by a few seconds 
        // this should give us enough time to get all images loaded
        // See: https://isotope.metafizzy.co/layout.html for suggested fix
        setTimeout( _ => {
            let portfolioContainer = document.querySelector('.portfolio-container');
            if (portfolioContainer) {
              let portfolioIsotope = new Isotope(portfolioContainer, {
                itemSelector: '.portfolio-item'
              });
            }
        }, 3000);
    }
}).mount("#galleryApp");

const slideApp = createApp({
    delimiters: ["[[", "]]"],
    data() {
        return {
            items: []
        }
    },
    methods: {
        getSlideItems() {
            var URL = "/slide/slide.json";
            console.log(window.location.pathname);
            if(window.location.pathname.startsWith("/events")) {
                URL = "/slide/slide-events.json";
            }
            fetch(URL)
            .then(response => response.json())
            .then(it => {
                this.items = it;
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

const modalDialogApp = createApp({
    data() {
        return {
            type: "default"
        }
    },
    watch : {
        type(newValue, oldValue) { console.log(this.type) }
    },
    created() {
        const modal = document.getElementById("modalDialog");
        modal.addEventListener('show.bs.modal', event => {
            // When modal is shown, get target attributes
            // to determine what to show
            // callers of modalDialogApp MUST include data-bk-type
            // Valid types include:
            // default -> blank modal, don't use this please :)
            // memberFormsModal -> list of forms parishioners can fill
            console.log("")
            this.type = event.relatedTarget.getAttribute('data-bk-type');
        });
    }
}).mount("#modalDialog");