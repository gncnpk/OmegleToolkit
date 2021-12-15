// ==UserScript==
// @name         Omegle Blacklisted Phrase Detector
// @namespace    https://github.com/Smooklu/OBPD
// @version      0.1
// @description  Detects blacklisted phrases and auto-skips
// @author       Smooklu
// @match        https://www.omegle.com/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var blacklist = ['phrase1', 'phrase2', 'phrase3', 'phrase4', 'phrase5', 'phrase6']
    var enable = '✔️ Enable Script'
    var disable = '❌ Disable Script'
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
    document.getElementById('sharebuttons').children[0].onclick = function () {window.stopped = true; console.log('Disabled script!');};
    document.getElementById('sharebuttons').children[1].onclick = function () {window.stopped = false; console.log('Enabled script!');};
    }
    function skip() {
        for (let i = 0; i < 3; i++) {
            document.getElementsByClassName('disconnectbtn')[0].click()
        }
    }
    function verify(element) {
        var msg = element.children[1].innerText
            console.log('Checking: ' + msg)
            if (blacklist.indexOf(msg.toLowerCase()) >= 0) {
                console.log('Blacklisted phrase detected! Skipping!')
                skip()
                window.stopped = false;
            }
    }
    function check() {
        if (window.stopped) {
            return false;
        }
        else {
            var arr = Array.from(document.getElementsByClassName('strangermsg'))
            arr.forEach(element => verify(element))
        }
    }
window.myInterval=setInterval(check, 1000);
modifySocialButtons();
})();
