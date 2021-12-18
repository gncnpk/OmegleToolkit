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

(function () {
    'use strict';
    // API Key for Simple Geo Location
    var apiKey = "api-key-here";
    // IP Blacklist
    function AddToIPBlacklist() {
        let ip = localStorage.getItem('ip')
        if (ip == null || ip == '') {
            return false;
        }
        else {
            var tbparsed = localStorage.getItem('blacklist');
            if (tbparsed == '' || tbparsed == null) {
                tbparsed = []
            }
            else {
                tbparsed = JSON.parse(localStorage.getItem('blacklist'));
            }
            tbparsed.push(ip);
            localStorage.setItem('blacklist', JSON.stringify(tbparsed));
        }
    }
    function checkIPBlacklist() {
        let ip = localStorage.getItem('ip')
        let ipblacklist = JSON.parse(localStorage.getItem('blacklist'))
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
    var blacklist
    function getBlacklist() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://raw.githubusercontent.com/Smooklu/OmegleToolkit/main/blacklist.json');
        xhr.send();
        xhr.onload = function () {
            blacklist = JSON.parse(xhr.response);
        };
    }
    getBlacklist()
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
        await fetch(url).then((response) =>
            response.json().then((json) => {
                const output = `<img src=${json.country_flag}></img><h2 class="geoloc">${json.country_name}</h2>`;
                document.getElementsByClassName('logitem')[0].innerHTML = output
                localStorage.setItem('ip', ip)
            })
        );
    };
    // Interface Stuff
    var enable = 'Enable Blacklist'
    var disable = 'Disable Blacklist'
    function modifySocialButtons() {
        var e = document.getElementById('sharebuttons').children[0];
        var d = document.createElement('button');
        d.innerHTML = e.innerHTML;
        e.parentNode.replaceChild(d, e);
        var e1 = document.getElementById('sharebuttons').children[1];
        var d1 = document.createElement('button');
        d1.innerHTML = e1.innerHTML;
        e1.parentNode.replaceChild(d1, e1);
        var version = document.createElement('button');
        version.innerText = "Omegle Toolkit v0.1"
        version.className = "buttons version"
        var addipb = document.createElement('button');
        addipb.innerText = "Add to IP Blacklist"
        addipb.className = "buttons version"
        var clearipb = document.createElement('button');
        clearipb.innerText = "Clear IP Blacklist"
        clearipb.className = "buttons version"
        document.getElementById('sharebuttons').children[0].href = ''
        document.getElementById('sharebuttons').children[1].href = ''
        document.getElementById('sharebuttons').children[0].innerText = disable
        document.getElementById('sharebuttons').children[1].innerText = enable
        document.getElementById('sharebuttons').children[0].className = "buttons disable"
        document.getElementById('sharebuttons').children[1].className = "buttons enable"
        document.getElementById('sharebuttons').children[0].onclick = function () { window.blackliststopped = true; console.log('Disabled blacklist!'); };
        document.getElementById('sharebuttons').children[1].onclick = function () { window.blackliststopped = false; console.log('Enabled blacklist!'); };
        addipb.onclick = function () { AddToIPBlacklist(); console.log(`Added ${localStorage.getItem('ip')} to the IP Blacklist!`) };
        clearipb.onclick = function () { localStorage.setItem('blacklist', ''); localStorage.setItem('ip', ''); console.log('Cleared IP Blacklist!') };
        document.getElementById('sharebuttons').children[2].remove()
        var socialbuttons = document.getElementById('sharebuttons')
        socialbuttons.appendChild(addipb)
        socialbuttons.appendChild(clearipb)
        socialbuttons.appendChild(version)
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
        }
        else if (blacklist.startswith.some(element => msg.toLowerCase().startsWith(element))) {
            console.log('Starts with blacklist phrase detected! Skipping!')
            skip()
        }
    }
    function check() {
        if (window.blackliststopped) {
            return false;
        }
        else {
            var arr = Array.from(document.getElementsByClassName('strangermsg'))
            if (arr.length == 0) {
                return false;
            }
            else {
                arr.forEach(element => verify(element))
                console.log('Checking: ' + arr.length + ' messages')
            }
            checkIPBlacklist()
        }
    }
    window.myInterval = setInterval(check, 1000);
    modifySocialButtons();

})();