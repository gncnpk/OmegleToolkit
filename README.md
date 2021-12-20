# Omegle Toolkit
A toolkit designed to ensure a smooth and safe experience on Omegle.

## Features
* Blacklisted phrases detection and automatically skips
* Stranger country detection (video only) (Geolocation)
* User-defined IP blacklist (video only)
* User-defined Country blacklist (video only) (Geolocation)

## Geolocation
Please obtain a API key from https://ipgeolocation.io/ for geolocation features to work.

## To-Do
* Brainstorm more ideas

## Install
Install Tampermonkey (Chrome) or Greasemonkey (Firefox) and add a new script with the following contents.
```js
// ==UserScript==
// @name         Omegle Toolkit
// @namespace    https://github.com/Smooklu/OmegleToolkit
// @version      0.1
// @description  A toolkit designed to make your experience on Omegle safe and smooth.
// @author       Smooklu
// @match        https://www.omegle.com/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @require      https://raw.githubusercontent.com/Smooklu/OmegleToolkit/main/script.js
// ==/UserScript==
```
