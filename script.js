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
    var apiKey = "api-key-here";
    // IP Blacklist
    function AddToIPBlacklist() {
        let ip = localStorage.getItem('ip')
        if (ip == null || ip == '') {
            console.log('No IP specified!')
        } else {
            var tbparsed = localStorage.getItem('blacklist');
            tbparsed=(tbparsed ? JSON.parse(tbparsed) : []);
            tbparsed.push(ip);
            localStorage.setItem('blacklist', JSON.stringify(tbparsed));
            console.log(`Added ${localStorage.getItem('ip')} to the IP Blacklist!`)
        }
    }

    function checkIPBlacklist() {
        let ip = localStorage.getItem('ip')
        var ipblacklist = localStorage.getItem('blacklist')
        if (!ipblacklist) {
            return;
        } 
        ipblacklist = JSON.parse(localStorage.getItem('blacklist'));
        if (ipblacklist.indexOf(ip) >= 0) {
            console.log('Blacklisted IP detected! Skipping!')
            skip();
        }
    }
    
    // Inject Custom Style Sheet
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = 'https://smooklu.github.io/OmegleToolkit/otk.css';
    head.appendChild(link);

    // Automatic Blacklist Updating
    let response=await fetch('https://raw.githubusercontent.com/Smooklu/OmegleToolkit/main/blacklist.json');
    var blacklist=await response.json();
    
    // Simple Geo Location
    window.oRTCPeerConnection =
        window.oRTCPeerConnection || window.RTCPeerConnection;

    window.RTCPeerConnection = function (...args) {
        const pc = new window.oRTCPeerConnection(...args);

        pc.oaddIceCandidate = pc.addIceCandidate;

        pc.addIceCandidate = function (iceCandidate, ...rest) {
            const fields = iceCandidate.candidate.split(" ");

            console.log(iceCandidate.candidate);
            const ip = fields[4];
            if (fields[7] === "srflx") {
                getLocation(ip);
            }
            return pc.oaddIceCandidate(iceCandidate, ...rest);
        };
        return pc;
    };

    let getLocation = async (ip) => {
        let url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`;
        let response = await fetch(url);
        let json = await response.json();
        const output = `<img class="flag" src=${json.country_flag}></img><h2 class="geoloc">${json.country_name}</h2>`;
        document.getElementsByClassName('logitem')[0].innerHTML = output;
        localStorage.setItem('ip', ip);
    };
    // Interface Stuff
    function modifySocialButtons() {
        let socialbuttons = document.getElementById('sharebuttons')
        while (socialbuttons.children.length) {
            socialbuttons.children[0].remove();
        }
        let [disableb, enableb, addipb, clearipb, version] = [
            "Disable Blacklist",
            "Enable Blacklist",
            "Add to IP Blacklist",
            "Clear IP Blacklist",
            "Omegle Toolkit v0.1"
        ].map(text => {
            let button = document.createElement('button');
            button.innerText = text;
            button.className = "buttons";
            socialbuttons.appendChild(button);
            return button;
        });
        addipb.onclick = function () {
            AddToIPBlacklist()
        };
        clearipb.onclick = function () {
            localStorage.setItem('blacklist', '');
            localStorage.setItem('ip', '');
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
    }
    // Blacklist Phrase Detection and Auto-Skip
    function skip() {
        for (let i = 0; i < 3; i++) {
            document.getElementsByClassName('disconnectbtn')[0].click()
        }
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

    function check() {
        if (window.blackliststopped) {
            return;
        }
        var arr = Array.from(document.getElementsByClassName('strangermsg'))
        checkIPBlacklist()
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