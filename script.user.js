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
    let api_key = localStorage.getItem('api_key');
    let ip = '';
    let country = '';
    let blacklist_stopped = false;
    let geo_turnoff = false;
    let version_number = '1.02';
    let auto_reroll = false;
    let chat_time = 0;

    // IP and Country Blacklist
    function addToIPBlacklist() {
        if (!ip) {
            console.log('No IP specified!');
            return;
        }
        let unparsed = localStorage.getItem('ip_blacklist');
        let parsed = unparsed ? JSON.parse(unparsed) : [];
        parsed.push(ip);
        localStorage.setItem('ip_blacklist', JSON.stringify(parsed));
        console.log(`Added ${ip} to the IP Blacklist!`);
    }

    function addToCountryBlacklist() {
        let country = prompt('Enter country to be blacklisted:');
        if (!country) {
            console.log('No country specified!');
            return;
        }
        let unparsed = localStorage.getItem('country_blacklist');
        let parsed = unparsed ? JSON.parse(unparsed) : [];
        parsed.push(country);
        localStorage.setItem('country_blacklist', JSON.stringify(parsed));
        console.log(`Added ${country} to the Country Blacklist!`);
    }

    function checkIPBlacklist() {
        let ip_blacklist = localStorage.getItem('ip_blacklist');
        if (!ip_blacklist) {
            return;
        }
        ip_blacklist = JSON.parse(ip_blacklist);
        if (ip_blacklist.indexOf(ip) !== -1) {
            console.log('Blacklisted IP detected! Disconnecting!');
            social_buttons.children[1].textContent =
                'Last Action: IP Blacklist Disconnect';
            start_stop();
        }
    }

    function checkCountryBlacklist() {
        let country_blacklist = localStorage.getItem('country_blacklist');
        if (!country_blacklist) {
            return;
        }
        country_blacklist = JSON.parse(country_blacklist);
        if (country_blacklist.indexOf(country) !== -1) {
            console.log('Blacklisted country detected! Disconnecting!');
            social_buttons.children[1].textContent =
                'Last Action: Country Blacklist Disconnect';
            start_stop();
        }
    }
    // Inject Custom Style Sheet
    let link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = 'https://smooklu.github.io/OmegleToolkit/otk.css';
    document.head.appendChild(link);

    // Automatic Blacklist and Server Status Updating
    let response = await fetch(
        'https://raw.githubusercontent.com/Smooklu/OmegleToolkit/main/blacklist.json'
    );
    let blacklist = await response.json();
    blacklist.regex = blacklist.regex.map(x => new RegExp(x));
    let omegle_status = await (
        await fetch('https://front29.omegle.com/status')
    ).json();
    let user_count = omegle_status.count;
    // Simple Geo Location
    window.originalRTCPeerConnection =
        window.originalRTCPeerConnection || window.RTCPeerConnection;

    window.RTCPeerConnection = function (...args) {
        const pc = new window.originalRTCPeerConnection(...args);

        pc.original_addIceCandidate = pc.addIceCandidate;

        pc.addIceCandidate = function (iceCandidate, ...rest) {
            const fields = iceCandidate.candidate.split(' ');

            if (fields[7] === 'srflx') {
                ip = fields[4];
                getLocation();
            }
            return pc.original_addIceCandidate(iceCandidate, ...rest);
        };
        return pc;
    };

    let statuslog = document.getElementsByClassName('statuslog');
    let getLocation = async () => {
        let output = `<h2 class="geo_loc">Unknown</h2>`;
        if (api_key && !geo_turnoff) {
            let url = `https://api.ipgeolocation.io/ipgeo?apiKey=${api_key}&ip=${ip}`;
            let response = await fetch(url);
            let json = await response.json();
            output = `<img class="flag" src=${json.country_flag}></img><h2 class="geo_loc">${json.country_name}</h2>`;
            country = json.country_name;
        }
        statuslog[0].innerHTML = output;
    };

    function autoConfirmTerms() {
        let confirm = document.querySelector(
            'input[value="Confirm & continue"]'
        );
        if (!confirm) {
            return;
        }
        let checkboxes = confirm
            .closest('div')
            .querySelectorAll('input[type=checkbox]:not(:checked)');
        for (let checkbox of checkboxes) {
            checkbox.click();
        }
        confirm.click();
    }

    // Interface Stuff
    let social_buttons = document.getElementById('sharebuttons');

    function deleteSocialButtons() {
        while (social_buttons.children.length) {
            social_buttons.children[0].remove();
        }
        document.getElementById('onlinecount').remove();
    }
    let logwrapper = document.getElementsByClassName('logwrapper');
    let videologo = document.getElementById('videologo');
    async function addInterface() {
        while (!logwrapper[0]) {
            await new Promise(res => setTimeout(res, 50));
        }
        // Don't run if the menu or if the status display already exists
        if (document.querySelector('.button_menu')) {
            return;
        }
        let log_box = logwrapper[0];
        let menu = document.createElement('menu');
        menu.className = 'button_menu';
        let [submenu1, submenu2] = [0, 0].map(() => {
            let submenu = document.createElement('div');
            menu.appendChild(submenu);
            return submenu;
        });
        social_buttons.className = 'otk_status_display';
        if (!social_buttons.children.length) {
            [
                `User Count: ${user_count}`,
                'Last Action:',
                'Chat Session Length:',
            ].map(text => {
                let status = document.createElement('p');
                status.textContent = text;
                status.style.margin = '1px';
                social_buttons.appendChild(status);
                return status;
            });
            social_buttons.style.marginTop = '-5px';
        }
        let [
            ip_blacklist_category,
            add_ip_blacklist,
            clear_ip_blacklist,
            country_blacklist_category,
            add_country_blacklist,
            clear_country_blacklist,
            display_country_blacklist,
            misc_category,
            enter_api,
            toggle_geo,
            toggle_blacklist,
            a_reroll,
            version,
        ] = [
            'C*IP Blacklist',
            'Add to IP Blacklist',
            'Clear IP Blacklist',
            'C*Country Blacklist',
            'Add Country to Blacklist',
            'Clear Country Blacklist',
            'Display Country Blacklist',
            'C*Settings',
            'Enter API Key',
            'Geolocation Enabled',
            'Blacklist Enabled',
            'Auto Reroll Disabled',
            `Omegle Toolkit v${version_number}`,
        ].map(text => {
            if (text.startsWith('C*')) {
                let category = document.createElement('p');
                category.textContent = text.slice(2);
                category.className = 'category';
                submenu1.appendChild(category);
                return category;
            } else {
                let button = document.createElement('button');
                button.textContent = text;
                button.className = 'buttons';
                submenu1.appendChild(button);
                return button;
            }
        });
        add_ip_blacklist.onclick = addToIPBlacklist;
        clear_ip_blacklist.onclick = function () {
            localStorage.setItem('ip_blacklist', '');
            ip = '';
            console.log('Cleared IP Blacklist!');
        };
        toggle_blacklist.onclick = function () {
            if (blacklist_stopped) {
                blacklist_stopped = false;
                console.log('Enabled blacklist!');
                toggle_blacklist.className = 'buttons enabled';
                toggle_blacklist.textContent = 'Blacklist Enabled';
            } else {
                blacklist_stopped = true;
                console.log('Disabled blacklist!');
                toggle_blacklist.className = 'buttons disabled';
                toggle_blacklist.textContent = 'Blacklist Disabled';
            }
        };
        enter_api.onclick = function () {
            let api_key = prompt(
                'Enter API key from https://app.ipgeolocation.io/'
            );
            if (!api_key) {
                return;
            }
            localStorage.setItem('api_key', api_key);
        };
        add_country_blacklist.onclick = addToCountryBlacklist;
        clear_country_blacklist.onclick = function () {
            localStorage.setItem('country_blacklist', '');
            country = '';
            console.log('Cleared Country Blacklist!');
        };
        display_country_blacklist.onclick = function () {
            window.alert(JSON.parse(localStorage.country_blacklist));
        };
        toggle_geo.onclick = function () {
            if (geo_turnoff) {
                geo_turnoff = false;
                console.log('Enabled geo location features!');
                toggle_geo.className = 'buttons enabled';
                toggle_geo.textContent = 'Geolocation Enabled';
            } else {
                geo_turnoff = true;
                console.log('Disabled geo location features!');
                toggle_geo.className = 'buttons disabled';
                toggle_geo.textContent = 'Geolocation Disabled';
            }
        };
        if (geo_turnoff) {
            toggle_geo.className = 'buttons disabled';
            toggle_geo.textContent = 'Geolocation Disabled';
        } else {
            toggle_geo.className = 'buttons enabled';
            toggle_geo.textContent = 'Geolocation Enabled';
        }
        if (blacklist_stopped) {
            toggle_blacklist.className = 'buttons disabled';
            toggle_blacklist.textContent = 'Blacklist Disabled';
        } else {
            toggle_blacklist.className = 'buttons enabled';
            toggle_blacklist.textContent = 'Blacklist Enabled';
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
        log_box.appendChild(menu);
    }
    // Auto Reroll
    function checkDisconnect(element) {
        if (element.textContent.includes('disconnected')) {
            if (auto_reroll) {
                console.log('Rerolling!');
                start_stop();
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
            social_buttons.children[2].textContent = '';
            return;
        }
        if (
            !Array.from(statuslog)
                .slice(-3)
                .some(x => x.textContent.includes('disconnected'))
        ) {
            chat_time += 1;
        }
        if (!disconnectbtn[0]) {
            chat_time = 0;
        }
        if (chat_time == 0) {
            social_buttons.children[2].textContent = `Chat Session Length: No Session`;
        } else {
            let minutes =
                chat_time >= 60 ? Math.floor(chat_time / 60) + 'm ' : '';
            let seconds = chat_time % 60;
            social_buttons.children[2].textContent = `Chat Session Length: ${minutes}${seconds}s`;
        }
    }
    // Blacklist Phrase Detection and Auto-Disconnect

    function start_stop() {
        if (
            disconnectbtn[0]?.textContent.startsWith("New") &&
            auto_reroll
        ) {
            var amt = 1;
        } else if (disconnectbtn[0]?.textContent.split('\n')[0] == 'Really?') {
            var amt = 1;
        } else if (disconnectbtn[0]?.textContent.split('\n')[0] == 'Stop') {
            var amt = 2;
        }
        for (let i = 0; i < amt; i++) {
            disconnectbtn[0]?.click();
        }
        ip = '';
        country = '';
        chat_time = 0;
    }

    function verify(element) {
        let msg = element.children[1].textContent.toLowerCase();
        let match = '';
        if (blacklist.exact.indexOf(msg) >= 0) {
            match = 'Exact match';
        } else if (
            blacklist.starts_with.some(element => msg.startsWith(element))
        ) {
            match = 'Starts with';
        } else if (blacklist.includes.some(element => msg.includes(element))) {
            match = 'Includes';
        } else if (blacklist.regex.some(element => element.test(msg))) {
            match = 'Regex';
        }
        if (match !== '') {
            console.log(match + ' blacklist phrase detected! Disconnecting!');
            social_buttons.children[1].textContent =
                'Last Action: Phrase Blacklist Disconnect';
            start_stop();
        }
        return match === '';
    }

    let strangermsg = document.getElementsByClassName('strangermsg');

    function check() {
        autoConfirmTerms();
        addInterface();
        if (social_buttons.className == 'otk_status_display') {
            secondCounter();
        }
        if (blacklist_stopped) {
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
        console.log(`Checking: ${arr.length} messages`);
    }
    window.myInterval = setInterval(check, 1000);
    window.setTimeout(deleteSocialButtons, 500);
})();
