#!/bin/bash
set -x
echo `date` > inputVersionDetail.txt 
releaseVersion="3.0"
minorVersion="0"
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

rm -rf ./leapui
mkdir -p ./leapui/ui

mv ./inputVersionDetail.txt ./leapui/
echo "Leap $releaseVersion.$minorVersion" >> ./leapui/versionDetails.txt

pwd

if  [ "$REFRESH_CIP" = true ] ; then
        echo "REFRESH_CIP IS TRUE"
     	latestFile=$VER_REFRESH_CIP
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_CIP is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "icip-app-'$releaseVersion'.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/icip-app/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "cip-app UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		#exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/icip-app-$releaseVersion.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/cipui
		mv ./temp/package/* leapui/ui/cipui/
	
		rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt

	fi
fi
if  [ "$REFRESH_IDEALAUNCH" = true ] ; then
        echo "REFRESH_IDEALAUNCH IS TRUE"
     	latestFile=$VER_REFRESH_IDEALAUNCH
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_IDEALAUNCH is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "idea-launch-3.1.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/idea-launch/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "idea-launch UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/idea-launch-3.1.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/idea_launch
		mv ./temp/package/* leapui/ui/idea_launch/
	        rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt
	fi
fi

if  [ "$REFRESH_AIP" = true ] ; then
        echo "REFRESH_AIP IS TRUE"
     	latestFile=$VER_REFRESH_AIP
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_AIP is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "aip-app-ui-3.2.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/aip-app-ui/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "aip-app UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/aip-app-ui-3.2.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/aip
		mv ./temp/package/* leapui/ui/aip/
		
		rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt
	fi
fi

if  [ "$REFRESH_CONTRACT" = true ] ; then
        echo "REFRESH_CONTRACT IS TRUE"
     	latestFile=$VER_REFRESH_CONTRACT
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_CONTRACT is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "app-contract-compliance-3.1.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/app-contract-compliance/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "App Contract Compliance UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/app-contract-compliance-3.1.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/app-contract-compliance
		mv ./temp/package/* leapui/ui/app-contract-compliance/
		
		rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt
	fi
fi

if  [ "$REFRESH_PRODUCTDESIGN" = true ] ; then
        echo "REFRESH_PRODUCTDESIGN IS TRUE"
     	latestFile=$VER_REFRESH_PRODUCTDESIGN
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_PRODUCTDESIGN is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "product-design-ui-3.1.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/product-design-ui/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "product-design-ui Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/product-design-ui-3.1.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/app-product-design
		mv ./temp/package/* leapui/ui/app-product-design/
		
		rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt
	fi
fi

if  [ "$REFRESH_KNOWLEDGESEARCH" = true ] ; then
        echo "REFRESH_KNOWLEDGESEARCH IS TRUE"
     	latestFile=$VER_REFRESH_KNOWLEDGESEARCH
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_KNOWLEDGESEARCH is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "knowledge-search-3.1.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/knowledge-search/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "knowledge-search-ui Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/knowledge-search-3.1.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/knowledge-search
		mv ./temp/package/* leapui/ui/knowledge-search/
		
		rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt
	fi
fi

if  [ "$REFRESH_REMOTEAPP" = true ] ; then
        echo "REFRESH_REMOTEAPP IS TRUE"
     	latestFile=$VER_REFRESH_REMOTEAPP
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_REMOTEAPP is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "mndlz-remote-app-1.0.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/mndlz-remote-app/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "remote-app UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/mndlz-remote-app-1.0.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/remote-app
		mv ./temp/package/* leapui/ui/remote-app/
	    rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt
	fi
fi

if  [ "$REFRESH_IVM" = true ] ; then
        echo "REFRESH_IVM IS TRUE"
     	latestFile=$VER_REFRESH_IVM
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_IVM is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "ivm-app-3.2.*"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/ivm-app/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "ivm-app UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		#exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/ivm-app-3.2.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/ivm-app
		mv ./temp/package/* leapui/ui/ivm-app/
	
		rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt

	fi
fi

if  [ "$REFRESH_SHELL" = true ] ; then
        echo "REFRESH_SHELL IS TRUE"
     	latestFile=$VER_REFRESH_SHELL
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_SHELL is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "common-app-3.2.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/common-app/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "common-app UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/common-app-3.2.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/common-app
		mv ./temp/package/* leapui/ui/common-app/
		
		rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt
	fi
fi
if  [ "$REFRESH_DBS" = true ] ; then
        echo "REFRESH_DBS IS TRUE"
     	latestFile=$VER_REFRESH_DBS
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_DBS is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "dbs-app-3.2.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/dbs-app/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "dbs-app UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		#exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/dbs-app-3.2.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/dbs-app
		mv ./temp/package/* leapui/ui/dbs-app/
	
		rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt

	fi
fi
if  [ "$REFRESH_GLADIATORAPP" = true ] ; then
        echo "REFRESH_GLADIATORAPP IS TRUE"
     	latestFile=$VER_REFRESH_GLADIATORAPP
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_GLADIATORAPP is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "gladiator-remote-app-1.0.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/gladiator-remote-app/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "gladiator-app UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/gladiator-remote-app-1.0.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/gladiator-app
		mv ./temp/package/* leapui/ui/gladiator-app/
	        rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt
	fi
fi
if  [ "$REFRESH_IMSCHAT" = true ] ; then
        echo "REFRESH_IMSCHAT IS TRUE"
     	latestFile=$VER_REFRESH_IMSCHAT
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_IMSCHAT is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "rcl-adm-gladiator-ims-chat-1.0.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/rcl-adm-gladiator-ims-chat/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "ims-chat UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/rcl-adm-gladiator-ims-chat-1.0.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/ims-chat
		mv ./temp/package/* leapui/ui/ims-chat/
	        rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt
	fi
fi
if  [ "$REFRESH_GLADIATORTESTCASE" = true ] ; then
        echo "REFRESH_GLADIATORTESTCASE IS TRUE"
     	latestFile=$VER_REFRESH_GLADIATORTESTCASE
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_GLADIATORTESTCASE is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "rcl-adm-gladiator-testcase-assistant-1.0.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/rcl-adm-gladiator-testcase-assistant/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "gladiator-testcase assistant UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/rcl-adm-gladiator-testcase-assistant-1.0.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/testcase-assistant
		mv ./temp/package/* leapui/ui/testcase-assistant/
	        rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt
	fi
fi
if  [ "$REFRESH_GLADIATORUSERSTORY" = true ] ; then
        echo "REFRESH_GLADIATORUSERSTORY IS TRUE"
     	latestFile=$VER_REFRESH_GLADIATORUSERSTORY
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_GLADIATORUSERSTORY is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "rcl-adm-gladiator-userstory-app-1.0.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/rcl-adm-gladiator-userstory-app/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "gladiator-userstory UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/rcl-adm-gladiator-userstory-app-1.0.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/rcl-adm-gladiator-userstory-app
		mv ./temp/package/* leapui/ui/rcl-adm-gladiator-userstory-app/
	        rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt
	fi
fi
if  [ "$REFRESH_GLADIATORRUNBOOK" = true ] ; then
        echo "REFRESH_GLADIATORRUNBOOK IS TRUE"
     	latestFile=$VER_REFRESH_GLADIATORRUNBOOK
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_GLADIATORRUNBOOK is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "rcl-adm-gladiator-runbook-app-1.0.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/rcl-adm-gladiator-runbook-app/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "gladiator-runbook app UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/rcl-adm-gladiator-runbook-app-1.0.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/rcl-adm-gladiator-runbook-app
		mv ./temp/package/* leapui/ui/rcl-adm-gladiator-runbook-app/
         	rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt
	fi
fi
if  [ "$REFRESH_SBX" = true ] ; then
        echo "REFRESH_SBX IS TRUE"
     	latestFile=$VER_REFRESH_SBX
   	if  test -z "$latestFile"  ; then
      		echo "$VER_REFRESH_SBX is NULL"
		resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_npm"}, "name": {"$match" : "icip-lib-sbx-3.1.*.tgz"}})')
		latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
   	fi
	
	uiVersion=$latestFile
	wget --retry-on-http-error=503 --tries=10  -N -P ./leapui/ui/ --user ${ARTIFACTORY_REPO_USER} --password ${ARTIFACTORY_REPO_PASS} https://infyartifactory.jfrog.io/artifactory/icets-ai_npm/icip-lib-sbx/-/$latestFile 
	if [ $? -ne 0 ]; then
  		echo "exp-app UI Failed for version "$latestFile" . Please check once." >>  ./leapui/versionDetails.txt
		#exit $EXIT_STATUS
	else
		mkdir temp
		tar -xf ./leapui/ui/icip-lib-sbx-3.1.*.tgz -C temp/
		ls
		mkdir ./leapui/ui/exp-app
		mv ./temp/package/* leapui/ui/exp-app/
	
		rm -rf ./temp
		echo "UI" $latestFile >> ./leapui/versionDetails.txt

	fi
fi

cp ../../ui/mf.manifest.json ./leapui/ui/common-app/assets/json

rm -rf  ./leapui/ui/*.tgz
chmod -R 777 ./leapui
pwd
