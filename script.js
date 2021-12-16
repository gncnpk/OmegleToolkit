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

(function () {
    'use strict';
    var blacklist = ['phrase', 'phrase2'];
    var enable = 'Enable Script';
    var disable = 'Disable Script';
    function modifySocialButtons() {
        var e = document.getElementById('sharebuttons').children[0];
        var d = document.createElement('button');
        d.innerHTML = e.innerHTML;
        e.parentNode.replaceChild(d, e);
        var e1 = document.getElementById('sharebuttons').children[1];
        var d1 = document.createElement('button');
        d1.innerHTML = e1.innerHTML;
        e1.parentNode.replaceChild(d1, e1);
        document.getElementById('sharebuttons').children[0].href = '';
        document.getElementById('sharebuttons').children[1].href = '';
        document.getElementById('sharebuttons').children[0].innerText = disable;
        document.getElementById('sharebuttons').children[1].innerText = enable;
        document.getElementById('sharebuttons').children[0].style = 'border-radius: 5px; background-color: red; color: white;';
        document.getElementById('sharebuttons').children[1].style = 'border-radius: 5px; background-color: green; color: white;';
        document.getElementById('sharebuttons').children[0].onclick = function () { window.stopped = true; console.log('Disabled script!'); };
        document.getElementById('sharebuttons').children[1].onclick = function () { window.stopped = false; console.log('Enabled script!'); };
        document.getElementById('sharebuttons').children[2].remove();
    }
    function skip() {
        for (let i = 0; i < 3; i++) {
            document.getElementsByClassName('disconnectbtn')[0].click();
        }
    }
    function verify(element) {
        var msg = element.children[1].innerText;
        if (blacklist.indexOf(msg.toLowerCase()) >= 0) {
            console.log('Blacklisted phrase detected! Skipping! Phrase: ' + msg);
            skip();
            window.stopped = false;
        }
    }
    function check() {
        if (window.stopped) {
            return false;
        }
        var arr = Array.from(document.getElementsByClassName('strangermsg'))
        if (arr.length == 0) {
            return false;
        }
        arr.forEach(element => verify(element));
        console.log('Checking: ' + arr.length + ' messages');
    }
    window.myInterval = setInterval(check, 1000);
    modifySocialButtons();
    console.log('Current blacklist: ');
    blacklist.forEach(element => console.log(element));
})();
