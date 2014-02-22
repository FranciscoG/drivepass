<p align="center">
  <a href="https://github.com/FranciscoG/password-manager-extension">
    <img height="128" width="128" src="https://raw.github.com/FranciscoG/password-manager-extension/trying-gulp/assets/drive-pass128.png"/>
  </a>
</p>

DrivePass
--------------------------

Browser extension that accesses a user's private google spreadsheet to store and access website logins and passwords.

**!! WARNING !!**

If you are going to store your passwords in a google spreadsheet please activate Google's 2-step verification (you should be doing that already anyways!)

http://www.google.com/landing/2step/

Uses oAuth 2.0 to grant access to your Google Speadsheets

Install dependencies:    
```javascript
npm install -g gulp && npm install
```  
Run Gulp to move prep files and move them into the Chrome folder
```javascript
npm install -g gulp && npm install
``` 


**TODO:**

* UI improvements on all pages

* encryption using CryptoJS

* more options

* create a new spreadsheet if none exists

* viewing passwords locally

* better integration with sites inputs


----

credits:    

My GoogleSpreadsheet module started off from this source:    
[https://github.com/mikeymckay/google-spreadsheet-javascript](https://github.com/mikeymckay/google-spreadsheet-javascript)
  
Enytpo Font 2.0    
[http://www.entypo.com/](http://www.entypo.com/)
