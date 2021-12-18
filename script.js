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
    let apiKey = "api-key-here";
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
                const output = `<img src=${json.country_flag}></img><h2 style="color: orange; display: inline-block;">${json.country_name}</h2>`;
                document.getElementsByClassName('logitem')[0].innerHTML = output
            })
        );
    };
    // Blacklist Phrase Detection and Auto-Skip
    var enable = 'Enable Blacklist'
    var disable = 'Disable Blacklist'
    let skiptts = new SpeechSynthesisUtterance('Skipping!');
    function modifySocialButtons() {
        var e = document.getElementById('sharebuttons').children[0];
        var d = document.createElement('button');
        d.innerHTML = e.innerHTML;
        e.parentNode.replaceChild(d, e);
        var e1 = document.getElementById('sharebuttons').children[1];
        var d1 = document.createElement('button');
        d1.innerHTML = e1.innerHTML;
        e1.parentNode.replaceChild(d1, e1);
        document.getElementById('sharebuttons').children[0].href = ''
        document.getElementById('sharebuttons').children[1].href = ''
        document.getElementById('sharebuttons').children[0].innerText = disable
        document.getElementById('sharebuttons').children[1].innerText = enable
        document.getElementById('sharebuttons').children[0].style = 'border-radius: 5px; background-color: red; color: white;'
        document.getElementById('sharebuttons').children[1].style = 'border-radius: 5px; background-color: green; color: white;'
        document.getElementById('sharebuttons').children[0].onclick = function () { window.blackliststopped = true; console.log('Disabled blacklist!'); };
        document.getElementById('sharebuttons').children[1].onclick = function () { window.blackliststopped = false; console.log('Enabled blacklist!'); };
        document.getElementById('sharebuttons').children[2].remove()
    }
    function skip() {
        for (let i = 0; i < 3; i++) {
            document.getElementsByClassName('disconnectbtn')[0].click()
        }
    }
    function verify(element) {
        var msg = element.children[1].innerText
        if (blacklist.exact.indexOf(msg.toLowerCase()) >= 0) {
            console.log('Exact match blacklist phrase detected! Skipping! Phrase: ' + msg.toLowerCase())
            //window.speechSynthesis.speak(skiptts);
            skip()
        }
        else if (blacklist.startswith.some(element => msg.toLowerCase().startsWith(element))) {
            console.log('Starts with blacklist phrase detected! Skipping! Phrase: ' + msg.toLowerCase())
            //window.speechSynthesis.speak(skiptts);
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
        }
    }
    window.myInterval = setInterval(check, 1000);
    modifySocialButtons();
})();