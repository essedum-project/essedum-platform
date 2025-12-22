# py-job-executer
Steps to follow for the setup of py-job executor on  windows machine

. Have python installed on the system , set the path of exe in environment variables
. Create a virtuan env , activate the virtual env ,Install the req.txt 
. Once the installation is done , please run the app.py => which will start the service on mentioned ip
. To expose the ip , Go to the firewall advance settings>Inbound rule>add new rule> And expose a tcp connection for that sepcific port or all ports if  required ,follow the default settings of it , then give a name to that rule
. You will now be able to access that service outside the vm 
. To add it in service manager , you need to install nssm application , once done add the path in environment variables ,run it as admin =>which will open a cmd prompt => then run .\nssm.exe install =>nssm prompt opens up => which will allow you to add the bat file (bat file takes care of starting the service , whenever it has to restart on it's own),also create a txt file and add it's path in I/o tab of nssm @ both the fields (in and out), now you can check at services window ,The py-job executor is in runnning status (if not start it ,using right click) 

