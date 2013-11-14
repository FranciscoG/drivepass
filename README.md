password-manager-extension
==========================

Browser extension that accesses a user's private google spreadsheet using oAuth 2.0 to "manage" website passwords

Uses oAuth 2.0 to grant access to your Google Speadsheets

Right now it's onlg grabbing data from a published spreadsheet

Your spreadsheet must be only 3 columns and they must be in this order:

* col1 = site name
  this must only be the domain name, remove the http:// and everything after the first slash
  example:  https://blabla.com/page/blog/1 ----> blabla.com
* col2 = user name
* col3 = password

credits:
google spreadsheet js
https://github.com/mikeymckay/google-spreadsheet-javascript
