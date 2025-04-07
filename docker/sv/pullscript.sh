#!/bin/bash

echo `date` > inputVersionDetail.txt 
releaseVersion="3.2"
pluginVersion="2.1"
branchVersion="master"

while read -r ARGUMENT;
do
   KEY=$(echo $ARGUMENT | cut -f1 -d"=")

   #KEY_LENGTH=${#KEY}
   RVALUE=$(echo $ARGUMENT | cut -f2 -d"=")

   VALUE=$(echo $RVALUE | cut -f1 -d",")
   KEY_VER_VALUE=$(echo $RVALUE | cut -f2 -d",")

   VER=VER_$KEY
  
   declare $VER=$KEY_VER_VALUE 

   if  [ "${!VER}" = true ] ; then
	declare $VER=""
   fi

   if  test -z "${!VER}"  ; then
      echo "$VER is NULL"
   else
     echo $VER "${!VER}" "is present"
   fi
	
   export "$KEY"="$VALUE"
   export "$VER"="${!VER}"
   echo "$KEY"="$VALUE" >> inputVersionDetail.txt
   echo "$VER"="${!VER}" >> inputVersionDetail.txt

done < "$1"

#rm -rf ./app
#mkdir -p ./app

#rm -rf ./app/leap-2.2-SNAPSHOT
rm -f *.tgz
if [ -e ./app/leap-$releaseVersion-SNAPSHOT ];then rm -rf ./app/leap-$releaseVersion-SNAPSHOT ; fi 

mkdir -p ./app/uploads
mkdir -p ./app/data
mkdir -p ./app/jobs
mkdir -p ./app/pluginZips
mv ./inputVersionDetail.txt ./app/
cp ./start.sh ./app/
echo "Leap $releaseVersion" >> ./app/versionDetails.txt

echo "i am here"
pwd

#cd ./app

#set -x
if  [ "$REFRESH_SV" = true ] ; then
    echo "REFRESH_SV IS TRUE"
	echo "VER_REFRESH_SV "$VER_REFRESH_SV
	latestFile=$VER_REFRESH_SV
	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u  ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : "icip-assembly-3.2-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icip-assembly/$releaseVersion""-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icip-assembly/3.2-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
		echo "icip-assembly Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
		exit $EXIT_STATUS
	fi
	unzip ./app/icip-assembly-3.2-*.zip -d ./app/
	mv ./app/icip-app-3.2-SNAPSHOT/* ./app/
	echo "icip-assembly " $latestFile >> ./app/versionDetails.txt
	echo "icip-assembly $latestFile added successfully"
	rm -f ./app/*.zip
	rm -rf ./app/icip-app-3.2-SNAPSHOT
fi

if  [ "$REFRESH_LEDS_SV" = true ] ; then
    echo "REFRESH_LEDS_SV IS TRUE"
	echo "VER_REFRESH_LEDS_SV "$VER_REFRESH_LEDS_SV
	latestFile=$VER_REFRESH_LEDS_SV
	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u  ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : "icip-assembly-'$releaseVersion'-aiplat-1-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icip-assembly/$releaseVersion""-aiplat-1-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -N -P ./app/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icip-assembly/$releaseVersion-aiplat-1-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
		echo "icip-assembly Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
		exit $EXIT_STATUS
	fi
	unzip ./app/icip-assembly-$releaseVersion-aiplat-1-*.zip -d ./app/
	mv ./app/icip-app-$releaseVersion-aiplat-1-SNAPSHOT/* ./app/
	echo "icip-assembly " $latestFile >> ./app/versionDetails.txt
	echo "icip-assembly $latestFile added successfully"
	rm -f ./app/*.zip
	rm -rf ./app/icip-app-$releaseVersion-aiplat-1-SNAPSHOT
fi

if  [ "$INCLUDE_PIPELINE" = true ] ; then
    mkdir -p ./app/python
	resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_python"}, "name": {"$match" : "leap-2.0*.whl"}})')
	latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	latestPath=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].path')
	whlVersion=$latestFile
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_python/"$latestPath"/"$latestFile
	wget --retry-on-http-error=503 --tries=10 --retry-on-http-error=503 --tries=10 -q -N -P ./app/python/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_python/$latestPath/$latestFile
	echo "leap-2.0 whl " $latestFile >> ./app/versionDetails.txt

        echo "SPARKEXTRA_JARS IS TRUE"
	echo "Downloading https://infyartifactory.jfrog.io:443/artifactory/icets-ai_generic/SparkExtraJars-2.1.tar"
	wget --retry-on-http-error=503 --tries=10 --retry-on-http-error=503 --tries=10 -q -N -P . --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io:443/artifactory/icets-ai_generic/SparkExtraJars-2.1.tar 
	mkdir -p ./app/spark_extrajars
	tar -xvf ./SparkExtraJars-2.1.tar -C ./app/spark_extrajars/
	rm ./SparkExtraJars-2.1.tar
	echo "spark_extrajars.zip " >> ./app/versionDetails.txt
	echo "Downloading https://infyartifactory.jfrog.io:443/artifactory/icets-ai_generic/nltk_data.zip"
	wget --retry-on-http-error=503 --tries=10 --retry-on-http-error=503 --tries=10 -q -N -P ./app/python --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io:443/artifactory/icets-ai_generic/nltk_data.zip
	unzip ./app/python/nltk_data.zip -d ./app/python
	rm ./app/python/nltk_data.zip
	echo "nltk_dat.zip " >> ./app/versionDetails.txt
	echo "Downloading https://infyartifactory.jfrog.io:443/artifactory/icets-ai_generic/en_core_web_sm-3.0.0.tar.gz"
	wget --retry-on-http-error=503 --tries=10 --retry-on-http-error=503 --tries=10 -q -N -P ./app/python --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io:443/artifactory/icets-ai_generic/en_core_web_sm-3.0.0.tar.gz
	echo "en_core_web_sm-3.0.0.tar.gz" >> ./app/versionDetails.txt
fi


if  [ "$REFRESH_UI" = true ] ; then
        echo "REFRESH_UI IS TRUE"
	# set +x
     	latestFile=$VER_REFRESH_UI
   	if  test -z "$latestFile"  ; then
      		echo $VER_REFRESH_UI" is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "icip-app-'$releaseVersion'*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/icip-app/-/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/icip-app/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "UI Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
		exit $EXIT_STATUS
	fi
	
	
	tar -xf ./leapui/ui/icip-app-$releaseVersion.$minorVersion*.tgz -C temp/
		ls
		mkdir ./leapui/ui/cip
		mv ./temp/package/* leapui/ui/cip/
	
		rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt
		
		
	tar -xf ./app/ui/icip-app-$releaseVersion*.tgz -C app/ui/
	mv ./app/ui/package/* app/ui/
	rm -f ./app/ui/icip-app-$releaseVersion*.tgz
	echo "UI" $latestFile" added successfully" >> ./app/versionDetails.txt
fi

if  [ "$INCLUDE_LEAPCLI" = true ] ; then
        echo "INCLUDE_LEAPCLI IS TRUE"
	# set +x
     	latestFile=$VER_INCLUDE_LEAPCLI
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io:443/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : "leap-cli-'$releaseVersion'*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io:443/artifactory/icets-ai_maven/com/infosys/icets/leap/leap-cli/"$releaseVersion"-SNAPSHOT/"$latestFile "-O ./app/leap-cli.zip"
	wget --retry-on-http-error=503 --tries=10 -q -N -P . --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io:443/artifactory/icets-ai_maven/com/infosys/icets/leap/leap-cli/$releaseVersion-SNAPSHOT/$latestFile -O ./app/leap-cli.zip
	if [ $? -ne 0 ]; then
  		echo "LEAPCLI Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
		exit $EXIT_STATUS
	fi
	unzip -qq ./app/leap-cli.zip -d ./app/
	echo "leap-cli " $latestFile" added successfully" >> ./app/versionDetails.txt
	rm ./app/leap-cli.zip
fi

if  [ "$ADP_ELASTIC" = true ] ; then
        echo "ADP_ELASTIC IS TRUE"
	# set +x
	latestFile=$VER_ADP_ELASTIC
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-elastic-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading  https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-elastic/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-elastic/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "Elastic plugin Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "ado-elastic " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_SERVICENOW" = true ] ; then
        echo "ADP_SERVICENOW IS TRUE"
	# set +x
	latestFile=$VER_ADP_SERVICENOW
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-servicenow-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-servicenow/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-servicenow/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "Servicenow Plugin Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-servicenow " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_APPDYNAMICS" = true ] ; then
        echo "ADP_APPDYNAMICS IS TRUE"
	# set +x
	latestFile=$VER_ADP_APPDYNAMICS
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-appdynamics-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-appdynamics/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-appdynamics/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "Appdynamics Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-appdynamics " $latestFile "sdded successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_DB2" = true ] ; then
        echo "ADP_DB2 IS TRUE"
	# set +x
	latestFile=$VER_ADP_DB2
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-db2-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-db2/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-db2/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "DB2 plugin Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi	
	echo "adp-db2 " $latestFile "added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_DEMISTO" = true ] ; then
        echo "ADP_DEMISTO IS TRUE"
	# set +x
	latestFile=$VER_ADP_DEMISTO
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-demisto-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-demisto/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 b -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-demisto/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "Demisto plugin Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-demisto " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_EMAIL" = true ] ; then
        echo "ADP_EMAIL IS TRUE"
	# set +x
	latestFile=$VER_ADP_EMAIL
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-email-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-email/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-email/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "Email plugin Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-email " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_INFLUXDB" = true ] ; then
        echo "ADP_INFLUXDB IS TRUE"
	# set +x
	latestFile=$VER_ADP_INFLUXDB
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-influxdb-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-influxdb/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-influxdb/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "InfluxDB plugin Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-influxdb " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_JIRA" = true ] ; then
        echo "ADP_JIRA IS TRUE"
	# set +x
	latestFile=$VER_ADP_JIRA
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-jira-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-jira/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-jira/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "JIRA plugin Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-jira " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_KAFKA" = true ] ; then
        echo "ADP_KAFKA IS TRUE"
	# set +x
	latestFile=$VER_ADP_KAFKA
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-kafka-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-kafka/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-kafka/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "KAFKA Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-kafka " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_MONGODB" = true ] ; then
        echo "ADP_MONGODB IS TRUE"
	# set +x
	latestFile=$VER_ADP_MONGODB
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-mongodb-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-mongodb/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-mongodb/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "MONGODB plugin Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-mongodb " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_ODATA" = true ] ; then
        echo "ADP_ODATA IS TRUE"
	# set +x
	latestFile=$VER_ADP_ODATA
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-odata-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-odata/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-odata/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "ODATA Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-odata " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_ORACLE" = true ] ; then
        echo "ADP_ORACLE IS TRUE"
	# set +x
	latestFile=$VER_ADP_ORACLE
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-oracle-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-oracle/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-oracle/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "ORACLE Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-oracle " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_PROMETHEUS" = true ] ; then
        echo "ADP_PROMETHEUS IS TRUE"
	# set +x
	latestFile=$VER_ADP_PROMETHEUS
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-prometheus-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-prometheus/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-prometheus/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "PROMETHEUS Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-prometheus " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_SOAP" = true ] ; then
        echo "ADP_SOAP IS TRUE"
	# set +x
	latestFile=$VER_ADP_SOAP
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-soap-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-soap/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-soap/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "SOAP Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-soap " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_SPLUNK" = true ] ; then
        echo "ADP_SPLUNK IS TRUE"
	# set +x
	latestFile=$VER_ADP_SPLUNK
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-splunk-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-splunk/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-splunk/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "SPLUNK Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-splunk " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_TALISMA" = true ] ; then
        echo "ADP_TALISMA IS TRUE"
	# set +x
	latestFile=$VER_ADP_TALISMA
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-talisma-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-talisma/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-talisma/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "TALISMA Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-talisma " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_AWS" = true ] ; then
        echo "ADP_AWS IS TRUE"
	# set +x
	latestFile=$VER_ADP_AWS
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-aws-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-aws/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-aws/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "AWS plugin Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-aws " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_S3" = true ] ; then
        echo "ADP_S3 IS TRUE"
	# set +x
	latestFile=$VER_ADP_S3
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-s3-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-s3/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-s3/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "ADP_S3 Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-s3 " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_ATHENA" = true ] ; then
        echo "ADP_ATHENA IS TRUE"
	# set +x
	latestFile=$VER_ADP_ATHENA
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-athena-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-athena/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-athena/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "ATHENA Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-athena " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_BIGQUERY" = true ] ; then
        echo "ADP_BIGQUERY IS TRUE"
	# set +x
	latestFile=$VER_ADP_BIGQUERY
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-bigquery-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-bigquery/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-bigquery/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "BIGQUERY Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-bigquery " $latestFile " added successfully">> ./app/versionDetails.txt

fi

if  [ "$ADP_POSTGRESQL" = true ] ; then
        echo "ADP_POSTGRESQL IS TRUE"
	# set +x
	latestFile=$VER_ADP_POSTGRESQL
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-postgresql-'$releaseVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-postgresql/"$releaseVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-postgresql/$releaseVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "POSTGRESQL Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-postgresql " $latestFile" added successfully" >> ./app/versionDetails.txt
	
	resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : "icip-adp-dynamic-3.0*.zip"}})')
        latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
        echo "Downloading Dynamic plugin"
        wget -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io:443/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-dynamic/$releaseVersion-SNAPSHOT/$latestFile 
        echo "Dynamic Plugin" $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_DYNAMIC" = true ] ; then
        echo "ADP_DYNAMIC IS TRUE"
	# set +x
	latestFile=$VER_ADP_DYNAMIC
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : "icip-adp-dynamic-3.0*.zip"}})')
        latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
    echo "Downloading Dynamic plugin"
    wget -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io:443/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-dynamic/$releaseVersion-SNAPSHOT/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "Dynamic Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-dynamic " $latestFile" added successfully" >> ./app/versionDetails.txt
fi


if  [ "$ADP_MINIO" = true ] ; then
        echo "ADP_MINIO IS TRUE"
	# set +x
	latestFile=$VER_ADP_MINIO
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : "icip-adp-minio-3.0*.zip"}})')
        latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
    echo "Downloading Minio plugin"
    wget -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io:443/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-minio/$releaseVersion-SNAPSHOT/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "Minio Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-minio " $latestFile" added successfully" >> ./app/versionDetails.txt
fi

if  [ "$ADP_AICLOUD" = true ] ; then
        echo "ADP_AICLOUD IS TRUE"
	# set +x
	latestFile=$VER_ADP_AICLOUD
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : "icip-adp-aicloud-3.0*.zip"}})')
                latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
        echo "Downloading AICLOUD plugin" $latestFile
        wget -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-aicloud/$releaseVersion-SNAPSHOT/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "aicloud Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-aicloud " $latestFile" added successfully" >> ./app/versionDetails.txt
fi
if  [ "$ADP_REMOTE" = true ] ; then
        echo "ADP_REMOTE IS TRUE"
	# set +x
	latestFile=$VER_ADP_REMOTE
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : "icip-adp-remote-3.0*.zip"}})')
                latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
        echo "Downloading REMOTE plugin" $latestFile
        wget -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-remote/$releaseVersion-SNAPSHOT/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "remote Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-remote " $latestFile" added successfully" >> ./app/versionDetails.txt
fi

if  [ "$ADP_NEO4J" = true ] ; then
        echo "ADP_NEO4J IS TRUE"
	# set +x
	latestFile=$VER_ADP_NEO4J
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-neo4j-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-neo4j/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-neo4j/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "NEO4J Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-neo4j " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_ACTIVEDIRECTORY" = true ] ; then
        echo "ADP_ACTIVEDIRECTORY IS TRUE"
	# set +x
	latestFile=$VER_ADP_ACTIVEDIRECTORY
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-activedirectory-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-activedirectory/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-activedirectory/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "ACTIVEDIRECTORY Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-activedirectory " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_DYNAMODB" = true ] ; then
        echo "ADP_DYNAMODB IS TRUE"
	# set +x
	latestFile=$VER_ADP_DYNAMODB
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-dynamodb-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-dynamodb/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-dynamodb/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "DYNAMODB Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-dynamodb " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_DYNATRACE" = true ] ; then
        echo "ADP_DYNATRACE IS TRUE"
	# set +x
	latestFile=$VER_ADP_DYNATRACE
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-dynatrace-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-dynatrace/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-dynatrace/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "DYNATRACE Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	fi
	echo "adp-dynatrace " $latestFile" added successfully" >> ./app/versionDetails.txt

fi



if  [ "$ADP_MSSQL" = true ] ; then
        echo "ADP_MSSQL IS TRUE"
	# set +x
     	latestFile=$VER_ADP_MSSQL
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-mssql-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-icip-adp-mssql/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-mssql/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "MSSQL Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
		exit $EXIT_STATUS
	fi
	echo "adp-mssql " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_MYSQL" = true ] ; then
        echo "ADP_MYSQL IS TRUE"
	# set +x
     	latestFile=$VER_ADP_MYSQL
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-mysql-'$releaseVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-mysql/"$releaseVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-mysql/$releaseVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "MYSQL Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
		exit $EXIT_STATUS
	fi
	echo "adp-mysql " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_REST" = true ] ; then
        echo "ADP_REST IS TRUE"
	# set +x
     	latestFile=$VER_ADP_REST
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-rest-'$releaseVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-rest/"$releaseVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-rest/$releaseVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "REST plugin Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
		exit $EXIT_STATUS
	fi
	echo "adp-rest " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_FILE" = true ] ; then
        echo "ADP_FILE IS TRUE"
	# set +x
     	latestFile=$VER_ADP_FILE
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-file-'$releaseVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-file/"$releaseVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-file/$releaseVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "FILE Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
		exit $EXIT_STATUS
	fi
	echo "adp-file " $latestFile" added successfully" >> ./app/versionDetails.txt

fi
if  [ "$ADP_AUTOANYWHERE" = true ] ; then
        echo "ADP_AUTOANYWHERE IS TRUE"
	# set +x
     	latestFile=$VER_ADP_AUTOANYWHERE
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-autoanywhere-'$pluginVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-autoanywhere/"$pluginVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-autoanywhere/$pluginVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "AUTOANYWHERE Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
		exit $EXIT_STATUS
	fi
	echo "adp-autoanywhere " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$ADP_H2" = true ] ; then
        echo "ADP_H2 IS TRUE"
	# set +x
     	latestFile=$VER_ADP_H2
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : " icip-adp-h2-'$releaseVersion'-*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-h2/"$releaseVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/pluginZips --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_maven/com/infosys/icets/icip/plugins/icip-adp-h2/$releaseVersion-SNAPSHOT/$latestFile
	if [ $? -ne 0 ]; then
  		echo "H2 Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
		exit $EXIT_STATUS
	fi
	echo "adp-h2 " $latestFile" added successfully" >> ./app/versionDetails.txt

fi

if  [ "$INCLUDE_ACMEDATA" = true ] ; then
        echo "INCLUDE_ACMEDATA IS TRUE"
		echo "Downloading https://infyartifactory.jfrog.io:443/artifactory/icets-ai_generic/acme_data.tar"
wget --retry-on-http-error=503 --tries=10 -q -N -P ./app --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io:443/artifactory/icets-ai_generic/acme_data.tar
if [ $? -ne 0 ]; then
	echo "ACMEDATA Failed for version acme_data.tar . Please check once." >>  ./app/versionDetails.txt
	exit $EXIT_STATUS
fi
echo "acmedata acme_data.tar" >> ./app/versionDetails.txt
fi

if  [ "$ADP_AGENT" = true ] ; then
        echo "ADP_AGENT IS TRUE"
mkdir -p ./app/agents

echo "Downloading https://infyartifactory.jfrog.io:443/artifactory/icets-ai_python/leapmetricagent/2.0/metric.zip"
wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/agents --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io:443/artifactory/icets-ai_python/leapmetricagent/2.0/metric.zip
unzip ./app/agents/metric.zip -d ./app/agents
echo "metric.zip " >> ./app/versionDetails.txt
rm ./app/agents/metric.zip

echo "Downloading https://infyartifactory.jfrog.io:443/artifactory/icets-ai_python/leapfilewatcher/2.0/filewatcher.zip"
wget --retry-on-http-error=503 --tries=10 -q -N -P ./app/agents --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io:443/artifactory/icets-ai_python/leapfilewatcher/2.0/filewatcher.zip
unzip ./app/agents/filewatcher.zip -d ./app/agents
echo "filewather.zip " >> ./app/versionDetails.txt
rm ./app/agents/filewatcher.zip

fi

if  [ "$INCLUDE_PYTHON" = true ] ; then
        echo "INCLUDE_PYTHON IS TRUE"
#rm -rf ./app/Leap-py3
#mkdir -p ./app/Leap-py3/
echo "Downloading https://infyartifactory.jfrog.io:443/artifactory/icets-ai_generic/Leap-py3-lin.tar"
wget --retry-on-http-error=503 --tries=10 -q -N -P ./app --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io:443/artifactory/icets-ai_generic/Leap-py3-lin.tar -o Leap-py3-lin.tar
if [ $? -ne 0 ]; then
	echo "PYTHON Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
	exit $EXIT_STATUS
fi
# set -x
ls 
tar -xf ./Leap-py3-lin.tar -C ./app/
echo "Leap-py3-lin.tar " >> ./app/versionDetails.txt
echo pwd >> ./app/versionDetails.txt
echo ls >> ./app/versionDetails.txt
rm ./app/Leap-py3-lin.tar
fi

if  [ "$INCLUDE_FILESERVER" = true ] ; then
        echo "INCLUDE_FILESERVER IS TRUE"
	# set +x
     	latestFile=$VER_INCLUDE_FILESERVER
   	if  test -z "$latestFile"  ; then
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io:443/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_maven"}, "name": {"$match" : "fileserver-'$releaseVersion'*.zip"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
	fi
	# set -x
	echo "Downloading https://infyartifactory.jfrog.io:443/artifactory/icets-ai_maven/com/infosys/icets/fileserver/"$releaseVersion"-SNAPSHOT/"$latestFile
	wget --retry-on-http-error=503 --tries=10 -q -N -P . --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io:443/artifactory/icets-ai_maven/com/infosys/icets/fileserver/$releaseVersion-SNAPSHOT/$latestFile -O fileserver.zip
	if [ $? -ne 0 ]; then
		echo "FILESERVER Failed for version "$latestFile" . Please check once." >>  ./app/versionDetails.txt
		exit $EXIT_STATUS
	fi
	unzip -q fileserver.zip -d ./app/
	echo "fileserver " $latestFile" added successfully" >> ./app/versionDetails.txt
	rm fileserver.zip

fi

echo "------------------------------"

if  [ "$PUBLISH_APP" = true ] ; then
        echo "PUBLISH_APP IS TRUE"
	tar -cvzf app.tgz ./app/
	chmod -R 700 ./app.tgz
	curl -u${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -T ./app.tgz "https://infyartifactory.jfrog.io/artifactory/icets-ai_generic/aip-app/release-3.0/app.tgz"
	echo "/app pushed to the artifactory"
fi
chmod -R 777 ./app
chmod -R 777 ./python/install-whl.sh

pwd
ls
