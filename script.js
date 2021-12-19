// ==UserScript==
// @name         Omegle Toolkit
// @namespace    https://github.com/Smooklu/OmegleToolkit
// @version      0.1
// @description  A toolkit designed to make your experience on Omegle safe and smooth.
// @author       Smooklu
// @match        https://www.omegle.com/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';
    // API Key for Simple Geo Location
    var apikey = localStorage.getItem('apikey');
    let ip;
    let country;

    // IP Blacklist
    function AddToIPBlacklist() {
        if (!ip) {
            console.log('No IP specified!')
        }
        var tbparsed = localStorage.getItem('ipblacklist');
        tbparsed = (tbparsed ? JSON.parse(tbparsed) : []);
        tbparsed.push(ip);
        localStorage.setItem('ipblacklist', JSON.stringify(tbparsed));
        console.log(`Added ${ip} to the IP Blacklist!`)
    }

    function AddToCountryBlacklist() {
        let country = prompt('Enter country to be blacklisted:')
        if (!country) {
            console.log('No country specified!')
        }
        var tbparsed = localStorage.getItem('cblacklist');
        tbparsed = (tbparsed ? JSON.parse(tbparsed) : []);
        tbparsed.push(country);
        localStorage.setItem('cblacklist', JSON.stringify(tbparsed));
        console.log(`Added ${country} to the Country Blacklist!`)
    }

    function checkIPBlacklist() {
        var ipblacklist = localStorage.getItem('ipblacklist')
        if (!ipblacklist) {
            return;
        }
        ipblacklist = JSON.parse(ipblacklist);
        if (ipblacklist.indexOf(ip) !== -1) {
            console.log('Blacklisted IP detected! Skipping!')
            skip();
        }
    }

    function checkCountryBlacklist() {
        var cblacklist = localStorage.getItem('cblacklist')
        if (!cblacklist) {
            return;
        }
        cblacklist = JSON.parse(cblacklist);
        if (cblacklist.indexOf(country) !== -1) {
            console.log('Blacklisted country detected! Skipping!')
            skip();
        }
    }
    // Inject Custom Style Sheet
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = 'https://smooklu.github.io/OmegleToolkit/otk.css';
    document.head.appendChild(link);

    // Automatic Blacklist Updating
    let response = await fetch('https://raw.githubusercontent.com/Smooklu/OmegleToolkit/main/blacklist.json');
    var blacklist = await response.json();

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
        let output;
        if (apikey) {
            let url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apikey}&ip=${ip}`;
            let response = await fetch(url);
            let json = await response.json();
            output = `<img class="flag" src=${json.country_flag}></img><h2 class="geoloc">${json.country_name}</h2>`;
            country = json.country_name;
        } else {
            output = 'idfk what country this is';
        }
        clogitem[0].innerHTML = output;
    };
    // Interface Stuff
    async function modifySocialButtons() {
        let logbox_collection = document.getElementsByClassName('logwrapper');
        while (!logbox_collection[0]) {
            await new Promise(res => setTimeout(res, 50));
        }
        let logbox = logbox_collection[0];

        let socialbuttons = document.getElementById('sharebuttons')
        let menu = document.createElement('menu')
        while (socialbuttons.children.length) {
            socialbuttons.children[0].remove();
        }
        let [disableb, enableb, addipb, clearipb, addcblacklist, clearcblacklist, enterapi, version] = [
            "Disable Blacklist",
            "Enable Blacklist",
            "Add to IP Blacklist",
            "Clear IP Blacklist",
            "Add Country to Blacklist",
            "Clear Country Blacklist",
            "Enter API Key",
            "Omegle Toolkit v0.1"
        ].map(text => {
            let button = document.createElement('button');
            button.innerText = text;
            button.className = "buttons";
            menu.appendChild(button);
            return button;
        });
        addipb.onclick = function () {
            AddToIPBlacklist()
        };
        clearipb.onclick = function () {
            localStorage.setItem('ipblacklist', '');
            ip = '';
            console.log('Cleared IP Blacklist!')
        };
        disableb.onclick = function () {
            window.blackliststopped = true;
            console.log('Disabled blacklist!');
        };
        enableb.onclick = function () {
            window.blackliststopped = false;
            console.log('Enabled blacklist!');
        };
        enterapi.onclick = function () {
            let apikey = prompt('Enter API key from https://app.ipgeolocation.io/');
            if (!apikey) {
                return;
            }
            localStorage.setItem('apikey', apikey);
        }
        addcblacklist.onclick = AddToCountryBlacklist
        clearcblacklist.onclick = function () {
            localStorage.setItem('cblacklist', '');
            country = '';
            console.log('Cleared Country Blacklist!')
        };
        version.classList.add('otk_version');
        logbox.appendChild(version);
        logbox.style = "top: 89px;margin-left: 584px;margin-right: 175px;"
        menu.className = 'buttonmenu'
        logbox.appendChild(menu)
    }
    // Blacklist Phrase Detection and Auto-Skip
    let disconnectbtn = document.getElementsByClassName('disconnectbtn');
    function skip() {
        for (let i = 0; i < 3; i++) {
            disconnectbtn[0]?.click()
        }
        ip = '';
        country = '';
    }

    function verify(element) {
        var msg = element.children[1].innerText
        if (blacklist.exact.indexOf(msg.toLowerCase()) >= 0) {
            console.log('Exact match blacklist phrase detected! Skipping!')
            skip()
        } else if (blacklist.startswith.some(element => msg.toLowerCase().startsWith(element))) {
            console.log('Starts with blacklist phrase detected! Skipping!')
            skip()
        }
    }

    let strangermsg = document.getElementsByClassName('strangermsg');
    function check() {
        if (window.blackliststopped) {
            return;
        }
        var arr = Array.from(strangermsg)
        checkIPBlacklist()
        checkCountryBlacklist()
        if (arr.length == 0) {
            return;
        }
        arr.forEach(element => verify(element))
        console.log('Checking: ' + arr.length + ' messages')
    }
    window.myInterval = setInterval(check, 1000);
    window.addEventListener("load", function () {
        modifySocialButtons();
    });
})();