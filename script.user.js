// ==UserScript==
// @name         Omegle Toolkit
// @namespace    https://github.com/Smooklu/OmegleToolkit
// @version      1.02
// @description  A toolkit designed to make your experience on Omegle safe and smooth.
// @author       Smooklu & Chinoto
// @match        https://www.omegle.com/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
// @ts-check

(async function () {
    'use strict';
    // Startup Vars
    let apikey = localStorage.getItem('apikey');
    let ip = '';
    let country = '';
    let blackliststopped = false;
    let geoturnoff = false;
    let version_number = '1.02';
    let auto_reroll = false;
    let orgsecs = 0;
    let minutes = 0;
    let modsecs = 0;

    // IP and Country Blacklist
    function addToIPBlacklist() {
        if (!ip) {
            console.log('No IP specified!');
            return;
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
            return;
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
            console.log('Blacklisted IP detected! Disconnecting!');
            socialbuttons.children[1].textContent = 'Last Action: IP Blacklist Disconnect'
            startstop();
        }
    }

    function checkCountryBlacklist() {
        let cblacklist = localStorage.getItem('cblacklist');
        if (!cblacklist) {
            return;
        }
        cblacklist = JSON.parse(cblacklist);
        if (cblacklist.indexOf(country) !== -1) {
            console.log('Blacklisted country detected! Disconnecting!');
            socialbuttons.children[1].textContent = 'Last Action: Country Blacklist Disconnect'
            startstop();
        }
    }
    // Inject Custom Style Sheet
    let link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = 'https://smooklu.github.io/OmegleToolkit/otk.css';
    document.head.appendChild(link);

    // Automatic Blacklist and Server Status Updating
    let response = await fetch('https://raw.githubusercontent.com/Smooklu/OmegleToolkit/main/blacklist.json');
    let blacklist = await response.json();
    blacklist.regex = blacklist.regex.map(x => new RegExp(x));
    let omeglestatus = await (await fetch('https://front29.omegle.com/status')).json();
    let usercount = omeglestatus.count
    // Simple Geo Location
    window.oRTCPeerConnection =
        window.oRTCPeerConnection || window.RTCPeerConnection;

    window.RTCPeerConnection = function (...args) {
        const pc = new window.oRTCPeerConnection(...args);

        pc.oaddIceCandidate = pc.addIceCandidate;

        pc.addIceCandidate = function (iceCandidate, ...rest) {
            const fields = iceCandidate.candidate.split(" ");

            if (fields[7] === "srflx") {
                ip = fields[4];
                getLocation();
            }
            return pc.oaddIceCandidate(iceCandidate, ...rest);
        };
        return pc;
    };

    let clogitem = document.getElementsByClassName('statuslog');
    let getLocation = async () => {
        let output = `<h2 class="geoloc">Unknown</h2>`;
        if (apikey && !geoturnoff) {
            let url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apikey}&ip=${ip}`;
            let response = await fetch(url);
            let json = await response.json();
            output = `<img class="flag" src=${json.country_flag}></img><h2 class="geoloc">${json.country_name}</h2>`;
            country = json.country_name;
        }
        clogitem[0].innerHTML = output;
    };

    function autoConfirmTerms() {
        let confirm = document.querySelector('input[value="Confirm & continue"]');
        if (!confirm) {
            return;
        }
        let checkboxes = confirm.closest('div')
            .querySelectorAll('input[type=checkbox]:not(:checked)');
        for (let checkbox of checkboxes) {
            checkbox.click();
        }
        confirm.click();
    }

    // Interface Stuff
    let socialbuttons = document.getElementById('sharebuttons');

    function deleteSocialButtons() {
        while (socialbuttons.children.length) {
            socialbuttons.children[0].remove();
        }
        document.getElementById('onlinecount').remove();
    }
    let logbox_collection = document.getElementsByClassName('logwrapper');
    let videologo = document.getElementById('videologo');
    async function addInterface() {
        while (!logbox_collection[0]) {
            await new Promise(res => setTimeout(res, 50));
        }
        // Don't run if the menu or if the status display already exists
        if (document.querySelector('.buttonmenu')) {
            return;
        }
        let logbox = logbox_collection[0];
        let menu = document.createElement('menu');
        menu.className = 'buttonmenu';
        let [submenu1, submenu2] = [0, 0].map(() => {
            let submenu = document.createElement('div');
            menu.appendChild(submenu);
            return submenu;
        });
        socialbuttons.className = 'otk_statusdisplay'
        if (!socialbuttons.children.length) {
            [
                `User Count: ${usercount}`,
                "Last Action:",
                "Chat Session Length:"
            ].map(text => {
                let status = document.createElement('p')
                status.textContent = text;
                status.style.margin = '1px';
                socialbuttons.appendChild(status)
                return status;
            })
            socialbuttons.style.marginTop = '-5px';
        }
        let [pbcat, addipb, clearipb, cbcat, addcblacklist, clearcblacklist, displaycblacklist, misccat, enterapi, togglegeo, toggleb, a_reroll, version] = [
            "C*IP Blacklist",
            "Add to IP Blacklist",
            "Clear IP Blacklist",
            "C*Country Blacklist",
            "Add Country to Blacklist",
            "Clear Country Blacklist",
            "Display Country Blacklist",
            "C*Settings",
            "Enter API Key",
            "Geolocation Enabled",
            "Blacklist Enabled",
            "Auto Reroll Disabled",
            `Omegle Toolkit v${version_number}`
        ].map(text => {
            if (text.startsWith('C*')) {
                let category = document.createElement('p');
                category.textContent = text.slice(2);
                category.className = "category";
                submenu1.appendChild(category);
                return category;
            } else {
                let button = document.createElement('button');
                button.textContent = text;
                button.className = "buttons";
                submenu1.appendChild(button);
                return button;
            }
        });
        addipb.onclick = addToIPBlacklist;
        clearipb.onclick = function () {
            localStorage.setItem('ipblacklist', '');
            ip = '';
            console.log('Cleared IP Blacklist!');
        };
        toggleb.onclick = function () {
            if (blackliststopped) {
                blackliststopped = false;
                console.log('Enabled blacklist!');
                toggleb.className = 'buttons enabled';
                toggleb.textContent = 'Blacklist Enabled';
            } else {
                blackliststopped = true;
                console.log('Disabled blacklist!');
                toggleb.className = 'buttons disabled';
                toggleb.textContent = 'Blacklist Disabled';
            }
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
        displaycblacklist.onclick = function () {
            window.alert(JSON.parse(localStorage.cblacklist))
        }
        togglegeo.onclick = function () {
            if (geoturnoff) {
                geoturnoff = false;
                console.log('Enabled geo location features!');
                togglegeo.className = 'buttons enabled';
                togglegeo.textContent = 'Geolocation Enabled';
            } else {
                geoturnoff = true;
                console.log('Disabled geo location features!');
                togglegeo.className = 'buttons disabled';
                togglegeo.textContent = 'Geolocation Disabled';
            }
        };
        if (geoturnoff) {
            togglegeo.className = 'buttons disabled';
            togglegeo.textContent = 'Geolocation Disabled';
        } else {
            togglegeo.className = 'buttons enabled';
            togglegeo.textContent = 'Geolocation Enabled';
        }
        if (blackliststopped) {
            toggleb.className = 'buttons disabled';
            toggleb.textContent = 'Blacklist Disabled';
        } else {
            toggleb.className = 'buttons enabled';
            toggleb.textContent = 'Blacklist Enabled';
        }
        if (auto_reroll) {
            a_reroll.className = 'buttons enabled';
            a_reroll.textContent = 'Auto Reroll Enabled';
        } else {
            a_reroll.className = 'buttons disabled';
            a_reroll.textContent = 'Auto Reroll Disabled';
        }
        a_reroll.onclick = function () {
            if (auto_reroll) {
                auto_reroll = false;
                console.log('Disabled auto reroll!');
                a_reroll.className = 'buttons disabled';
                a_reroll.textContent = 'Auto Reroll Disabled';
            } else {
                auto_reroll = true;
                console.log('Enabled auto reroll!');
                a_reroll.className = 'buttons enabled';
                a_reroll.textContent = 'Auto Reroll Enabled';
            }
        };
        version.classList.add('otk_version');
        submenu2.appendChild(version);
        logbox.appendChild(menu);
    }
    // Auto Reroll
    function checkDisconnect(element) {
        if (element.textContent.includes('disconnected')) {
            if (auto_reroll) {
                console.log('Rerolling!')
                startstop();
                return false;
            }
        } else {
            return true;
        }
        return false;
    }
    // Chat Session Length
    let disconnectbtn = document.getElementsByClassName('disconnectbtn');
    function secondCounter() {
        if (!auto_reroll) {
            socialbuttons.children[2].textContent = ''
            return
        }
        let sl = document.getElementsByClassName('statuslog')
        if (sl[sl.length - 1]?.textContent.includes('disconnected') || sl[sl.length - 3]?.textContent.includes('disconnected') || sl[sl.length - 2]?.textContent.includes('disconnected')) {
            orgsecs = orgsecs;
        } else {
            orgsecs += 1;
        }
        if (!disconnectbtn[0]) {
            orgsecs = 0;
        }
        if (orgsecs == 0) {
            socialbuttons.children[2].textContent = `Chat Session Length: No Session`
        }
        else if (orgsecs % 60 == orgsecs) {
            socialbuttons.children[2].textContent = `Chat Session Length: ${orgsecs}s`
        }
        else {
            modsecs = orgsecs;
            minutes = Math.floor(orgsecs / 60)
            modsecs = orgsecs % 60
            socialbuttons.children[2].textContent = `Chat Session Length: ${minutes}m ${modsecs}s`
        }
    }
    // Blacklist Phrase Detection and Auto-Disconnect

    function startstop() {
        if (disconnectbtn[0]?.textContent.split("\n")[0] == "New" && auto_reroll) {
            var amt = 1;
        } else if (disconnectbtn[0]?.textContent.split("\n")[0] == "Really?") {
            var amt = 1;
        } else if (disconnectbtn[0]?.textContent.split("\n")[0] == "Stop") {
            var amt = 2;
        }
        for (let i = 0; i < amt; i++) {
            disconnectbtn[0]?.click();
        }
        ip = '';
        country = '';
        orgsecs = 0;
        modsecs = 0;
        minutes = 0;
    }

    function verify(element) {
        let msg = element.children[1].textContent.toLowerCase();
        if (blacklist.exact.indexOf(msg) >= 0) {
            console.log('Exact match blacklist phrase detected! Disconnecting!');
            socialbuttons.children[1].textContent = 'Last Action: Phrase Blacklist Disconnect'
            startstop();
            return false;
        } else if (blacklist.startswith.some(element => msg.startsWith(element))) {
            console.log('Starts with blacklist phrase detected! Disconnecting!');
            socialbuttons.children[1].textContent = 'Last Action: Phrase Blacklist Disconnect'
            startstop();
            return false;
        } else if (blacklist.includes.some(element => msg.includes(element))) {
            console.log('Includes blacklist phrase detected! Disconnecting!');
            socialbuttons.children[1].textContent = 'Last Action: Phrase Blacklist Disconnect'
            startstop();
            return false;
        } else if (blacklist.regex.some(element => element.test(msg))) {
            console.log('Regex blacklist phrase detected! Disconnecting!');
            socialbuttons.children[1].textContent = 'Last Action: Phrase Blacklist Disconnect'
            startstop();
            return false;
        } else {
            return true;
        }
    }

    let strangermsg = document.getElementsByClassName('strangermsg');
    let statuslog = document.getElementsByClassName('statuslog');

    function check() {
        autoConfirmTerms();
        addInterface();
        if (socialbuttons.className == "otk_statusdisplay") {
            secondCounter();
        }
        if (blackliststopped) {
            return;
        }
        let arr = Array.from(strangermsg);
        let arr1 = Array.from(statuslog);
        checkIPBlacklist();
        checkCountryBlacklist();
        arr1.every(element => checkDisconnect(element));
        if (arr.length == 0) {
            return;
        }
        arr.every(element => verify(element));
        console.log(`Checking: ${arr.length} messages`)
    }
    window.myInterval = setInterval(check, 1000);
    window.setTimeout(deleteSocialButtons, 500);
})();
