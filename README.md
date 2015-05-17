#Micra Cup
=============================

##Getting started with Grunt:
http://gruntjs.com/getting-started

##Install dependencies:

Open terminal in root directory containing Gruntfile.js and package.json:
```
npm install
```

##Directory structure:
src/ - The code you can edit

build/ - The compiled code, DO NOT edit this code - it will be overwritten when the build command is run

release/ - The build/ version with debugging and development tools removed (ex. livereload)

##Commands:

Note: Be sure to terminal to: nci-nissan-docroot/src/main/webapp/micra-cup/ before running grunt commands

###Build:
```
grunt build
```

###Release:
```
grunt release
```

###Build and Release
```
grunt build-release
```

###Automated build with live reload:
```
grunt
```
**Note: You may have to change the default envPath in the Gruntfile if it is different from:**

http://localhost:8888/

ex. http://localhost:8888/nci-nissan-micracup2/build/en/

###To change live reload target to French on default task:
```
grunt --lang=fr
```