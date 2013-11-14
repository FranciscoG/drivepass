password-manager-extension
==========================

Browser extension that accesses a user's private google spreadsheet using oAuth 2.0 to "manage" website passwords

**WARNING**

If you are going to store your passwords in a google spreadsheet please activate Google's 2-step verification (you should be doing that already anyways!)

http://www.google.com/landing/2step/

Uses oAuth 2.0 to grant access to your Google Speadsheets

Right now it's only grabbing data from a published spreadsheet

Your spreadsheet must be only 3 columns and they must be in this order:

* col1 = site name -- 
  this must only be the domain name, remove the http:// and everything after the first slash.
  example:  https://blabla.com/page/blog/1 ----> blabla.com
* col2 = user name
* col3 = password

| site | username | password |
| www.google.com | user123 | passwordX |
| github.com | userB | passB |

credits:

I'm using mikeymckay's google-spreadsheet-js to grab the data

https://github.com/mikeymckay/google-spreadsheet-javascript
