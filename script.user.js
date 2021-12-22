// ==UserScript==
// @name         Omegle Toolkit
// @namespace    https://github.com/Smooklu/OmegleToolkit
// @version      1.0
// @description  A toolkit designed to make your experience on Omegle safe and smooth.
// @author       Smooklu & Chinoto
// @match        https://www.omegle.com/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';
    // Startup Vars
    let apikey = localStorage.getItem('apikey');
    let ip = '';
    let country = '';
    let blackliststopped = false;

    // IP and Country Blacklist
    function AddToIPBlacklist() {
        if (!ip) {
            console.log('No IP specified!');
        }
        let tbunparsed = localStorage.getItem('ipblacklist');
        let tbparsed = (tbunparsed ? JSON.parse(tbunparsed) : []);
        tbparsed.push(ip);
        localStorage.setItem('ipblacklist', JSON.stringify(tbparsed));
        console.log(`Added ${ip} to the IP Blacklist!`);
    }

    function addToCountryBlacklist() {
        let country = prompt('Enter country to be blacklisted:');
        if (!country) {
            console.log('No country specified!');
        }
        let tbunparsed = localStorage.getItem('cblacklist');
        let tbparsed = (tbunparsed ? JSON.parse(tbunparsed) : []);
        tbparsed.push(country);
        localStorage.setItem('cblacklist', JSON.stringify(tbparsed));
        console.log(`Added ${country} to the Country Blacklist!`);
    }

    function checkIPBlacklist() {
        let ipblacklist = localStorage.getItem('ipblacklist');
        if (!ipblacklist) {
            return;
        }
        ipblacklist = JSON.parse(ipblacklist);
        if (ipblacklist.indexOf(ip) !== -1) {
            console.log('Blacklisted IP detected! Skipping!');
            skip();
        }
    }

    function checkCountryBlacklist() {
        let cblacklist = localStorage.getItem('cblacklist');
        if (!cblacklist) {
            return;
        }
        cblacklist = JSON.parse(cblacklist);
        if (cblacklist.indexOf(country) !== -1) {
            console.log('Blacklisted country detected! Skipping!');
            skip();
        }
    }
    // Inject Custom Style Sheet
    let link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = 'https://smooklu.github.io/OmegleToolkit/otk.css';
    document.head.appendChild(link);

    // Automatic Blacklist Updating
    let response = await fetch('https://raw.githubusercontent.com/Smooklu/OmegleToolkit/main/blacklist.json');
    let blacklist = await response.json();

    // Simple Geo Location
    window.oRTCPeerConnection =
        window.oRTCPeerConnection || window.RTCPeerConnection;

    window.RTCPeerConnection = function (...args) {
        const pc = new window.oRTCPeerConnection(...args);

        pc.oaddIceCandidate = pc.addIceCandidate;

        pc.addIceCandidate = function (iceCandidate, ...rest) {
            const fields = iceCandidate.candidate.split(" ");

            console.log(iceCandidate.candidate);
            ip = fields[4];
            if (fields[7] === "srflx") {
                getLocation();
            }
            return pc.oaddIceCandidate(iceCandidate, ...rest);
        };
        return pc;
    };

    let clogitem = document.getElementsByClassName('logitem');
    let getLocation = async () => {
        let output = `<h2 class="geoloc">Unknown</h2>`;
        if (apikey) {
            if (!window.geoturnoff) {
                let url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apikey}&ip=${ip}`;
                let response = await fetch(url);
                let json = await response.json();
                output = `<img class="flag" src=${json.country_flag}></img><h2 class="geoloc">${json.country_name}</h2>`;
                country = json.country_name;
            }
        }
        clogitem[0].innerHTML = output;
    };

    function autoConfirmTerms() {
        let confirm = document.querySelector('input[value="Confirm & continue"]');
        if (!confirm) { return; }
        let checkboxes = confirm.closest('div')
            .querySelectorAll('input[type=checkbox]:not(:checked)');
        for (let checkbox of checkboxes) { checkbox.click(); }
        confirm.click();
    }

    // Interface Stuff
    let socialbuttons = document.getElementById('sharebuttons');
    function deleteSocialButtons() {
        while (socialbuttons.children.length) {
            socialbuttons.children[0].remove();
        }
    }
    let logbox_collection = document.getElementsByClassName('logwrapper');
    async function addInterface() {
        while (!logbox_collection[0]) {
            await new Promise(res => setTimeout(res, 50));
        }
        // Don't run if the menu already exists
        if (document.querySelector('.buttonmenu')) { return; }
        let logbox = logbox_collection[0];
        let menu = document.createElement('menu');
        menu.className = 'buttonmenu';
        let [submenu1, submenu2] = [0, 0].map(() => {
            let submenu = document.createElement('div');
            menu.appendChild(submenu);
            return submenu;
        });
        var blackliststatus = document.createElement('p')
        if (!blackliststopped) {
            blackliststatus.innerText = 'Blacklist: Enabled'
        }
        else {
            blackliststatus.innerText = 'Blacklist: Disabled'
        }
        let [pbcat, disableb, enableb, ipbcat, addipb, clearipb, cbcat, addcblacklist, clearcblacklist, misccat, enterapi, turnoffgeo, turnongeo, version] = [
            "C*Blacklist Control",
            "Disable Blacklist",
            "Enable Blacklist",
            "C*IP Blacklist",
            "Add to IP Blacklist",
            "Clear IP Blacklist",
            "C*Country Blacklist",
            "Add Country to Blacklist",
            "Clear Country Blacklist",
            "C*Miscellaneous",
            "Enter API Key",
            "Turn Off Geolocation",
            "Turn On Geolocation",
            "Omegle Toolkit v1.0"
        ].map(text => {
            if (text.startsWith('C*')) {
                let catagory = document.createElement('p');
                catagory.innerText = text.slice(2);
                catagory.className = "catagory";
                submenu1.appendChild(catagory);
                return catagory;
            }
            else {
                let button = document.createElement('button');
                button.innerText = text;
                button.className = "buttons";
                submenu1.appendChild(button);
                return button;
            }
        });
        addipb.onclick = AddToIPBlacklist;
        clearipb.onclick = function () {
            localStorage.setItem('ipblacklist', '');
            ip = '';
            console.log('Cleared IP Blacklist!');
        };
        disableb.onclick = function () {
            blackliststopped = true;
            console.log('Disabled blacklist!');
            socialbuttons.children[0].innerText = "Blacklist: Disabled"
        };
        enableb.onclick = function () {
            blackliststopped = false;
            console.log('Enabled blacklist!');
            socialbuttons.children[0].innerText = "Blacklist: Enabled"
        };
        enterapi.onclick = function () {
            let apikey = prompt('Enter API key from https://app.ipgeolocation.io/');
            if (!apikey) {
                return;
            }
            localStorage.setItem('apikey', apikey);
        }
        addcblacklist.onclick = addToCountryBlacklist;
        clearcblacklist.onclick = function () {
            localStorage.setItem('cblacklist', '');
            country = '';
            console.log('Cleared Country Blacklist!');
        };
        turnoffgeo.onclick = function () {
            console.log('Turned off Geolocation!')
            window.geoturnoff = true
        }
        turnongeo.onclick = function () {
            console.log('Turned on Geolocation!')
            window.geoturnoff = false
        }
        version.classList.add('otk_version');
        submenu2.appendChild(version);
        logbox.appendChild(menu);
        socialbuttons.appendChild(socialbuttons)
    }
    // Blacklist Phrase Detection and Auto-Skip
    let disconnectbtn = document.getElementsByClassName('disconnectbtn');
    function skip() {
        for (let i = 0; i < 3; i++) {
            disconnectbtn[0]?.click();
        }
        ip = '';
        country = '';
    }

    function verify(element) {
        let msg = element.children[1].innerText;
        if (blacklist.exact.indexOf(msg.toLowerCase()) >= 0) {
            console.log('Exact match blacklist phrase detected! Skipping!');
            skip();
        } else if (blacklist.startswith.some(element => msg.toLowerCase().startsWith(element))) {
            console.log('Starts with blacklist phrase detected! Skipping!');
            skip();
        }
    }

    let strangermsg = document.getElementsByClassName('strangermsg');
    function check() {
        autoConfirmTerms();
        addInterface();
        if (blackliststopped) {
            return;
        }
        let arr = Array.from(strangermsg);
        checkIPBlacklist();
        checkCountryBlacklist();
        if (arr.length == 0) {
            return;
        }
        arr.forEach(element => verify(element));
        console.log('Checking: ' + arr.length + ' messages');
    }
    window.myInterval = setInterval(check, 1000);
    window.addEventListener("load", deleteSocialButtons);
})();
