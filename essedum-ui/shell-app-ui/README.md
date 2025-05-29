# common-app
common-app repository

If frontend is running only, then no changes needs to be done it will redirect the apis to the url mentioned in environment.ts file

If both frontend and backend are running and needs to redirect the apis to backend port then do these changes:-
1.   In interceptor file, comment line no 16 to 18
2.   In package.json, change lead-usm version to 4.0.1 like this "lead-usm": "file:./npm-tgz/lead-usm-4.0.1.tgz",

To configure title value according to mfe route put that in manifest file in title field and if value of title is not set or title field is not there then title value mentioned in app.config.json file will be used.
