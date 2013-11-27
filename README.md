password-manager-extension
--------------------------

Browser extension that accesses a user's private google spreadsheet using oAuth 2.0 to "manage" website passwords

**WARNING**

If you are going to store your passwords in a google spreadsheet please activate Google's 2-step verification (you should be doing that already anyways!)

http://www.google.com/landing/2step/

Uses oAuth 2.0 to grant access to your Google Speadsheets

You must format your Google Spreadsheet in a specific way:

  Row 1 must be used for column titles, please have the following 3 columns in your first worksheet (all lower case):
  * site
  * username
  * password

You can have other columns in your spreadsheet and they will be ignored.  

### Add

if you just created a new password for a site you can automatically add it to your spreadsheet.  It adds it as a new row after the last row in the worksheet.  Just input your username and password into the 2 input boxes and click on add.  Site url is automatically taken from active browser tab.


### Options

Right-click on the icon and select "options"

Copy and paste your private spreadsheet url into the options and click "save"

### Autofill

  When you are on a site's login screen:

  * click into the email input field as if you were about to start typing

  * then click on the browser action 

  * Your username and password should automatically get inserted into the input field

**TODO:**

* add option for user defined column row headers

* improve UI

* setup some kind of encryption with a one-password unlocking


----

credits:  
Some google spreadsheet parsing taken (and then mangled) from:  
https://github.com/mikeymckay/google-spreadsheet-javascript
