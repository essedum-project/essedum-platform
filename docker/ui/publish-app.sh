#!/bin/bash
set -x
releaseVersion="3.1"
minorVersion="0"
branchVersion="master"
export HTTP_PROXY=http://10.68.248.39:80
export HTTPS_PROXY=http://10.68.248.39:80
export http_proxy=http://10.68.248.39:80
export https_proxy=http://10.68.248.39:80

rm -rf *.tgz

if [ -e ./leapui ];then
 tar -cvzf aipui-$releaseVersion.$minorVersion.tgz leapui/; 
fi

resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_generic"}, "name": {"$match" : "aipui-'$releaseVersion'.'$minorVersion'*.tgz"}}).sort({"$desc":["modified","created"]}).limit(5)')
latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
if  [[ ! -z "$latestFile" &&  $latestFile != "null" ]]; then
   latestFile=${latestFile/aipui-$releaseVersion.$minorVersion-/}
   latestFile=${latestFile/.tgz/}
   latestFile=$latestFile.0.0
else
   latestFile="0.0.0"
fi
leapver=$(semver -i major $latestFile)
leapver=${leapver/.0.0/}

mv aipui-$releaseVersion.$minorVersion.tgz aipui-$releaseVersion.$minorVersion-$leapver.tgz

ls *.tgz >> ./leapui/versionDetails.txt

curl -u${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -T ./*.tgz "https://infyartifactory.jfrog.io/artifactory/icets-ai_generic/aip/app/ui/$branchVersion/"

echo "Published " *.tgz
