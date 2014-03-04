<p align="center">
  <a href="https://github.com/FranciscoG/password-manager-extension">
    <img height="128" width="128" src="https://raw.github.com/FranciscoG/drivepass/master/src/img/drive-pass128.png"/>
  </a>
</p>

DrivePass
--------------------------

Browser extension that accesses a user's private google spreadsheet to store and access website logins and passwords.

<h2 style="color:red;font-weight:bold;line-height:1; border:none; margin-top:5px;" align="center">!! WARNING !!</h2>

If you are going to store your passwords in a google spreadsheet please activate Google's 2-step verification (you should be doing that already anyways!)

<a href="http://www.google.com/landing/2step/">http://www.google.com/landing/2step/</a>


Uses oAuth 2.0 to grant access to your Google Speadsheets

#### Dev Setup

Install [Gulp](http://gulpjs.com/) globally and its dependencies:    
```javascript
npm install -g gulp && npm install
```  
Run Gulp to prep files and move them into the Chrome folder
```javascript
gulp
``` 

Run Gulp Watch while developing to automatically jshint, concat, uglify, and copy files
```javascript
gulp watch
```


**TODO:**

* UI improvements on all pages

* encryption using CryptoJS

* master password

* more options

* create a new spreadsheet if none exists

* viewing passwords locally

* better integration with sites inputs

* way down the line, possible FireFox version

#### Disclaimer  
This project is a personal work in progress and is nowhere near finished, it's not available in the Chrome App Store. Use it at your own risk, I am not responsible for the security of your information.

----

credits:    

My GoogleSpreadsheet module started off from this source:    
[https://github.com/mikeymckay/google-spreadsheet-javascript](https://github.com/mikeymckay/google-spreadsheet-javascript)
  
Enytpo Font 2.0    
[http://www.entypo.com/](http://www.entypo.com/)

Google Drive logo owned by Google
