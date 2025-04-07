#!/bin/bash
set -x
releaseVersion="3.1"
minorVersion="0"
branchVersion="master"

rm -rf *.tgz

if [ -e ./app ];then
 tar -cvzf aip-sv-$releaseVersion.$minorVersion.tgz app/; 
fi

resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  https://infyartifactory.jfrog.io/artifactory/api/search/aql -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"icets-ai_generic"}, "name": {"$match" : "aip-sv-'$releaseVersion'.'$minorVersion'*.tgz"}}).sort({"$desc":["modified","created"]}).limit(5)')
latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
if [[ $latestFile != "null" ]]; then
   latestFile=${latestFile/aip-sv-$releaseVersion.$minorVersion-/}
   latestFile=${latestFile/.tgz/}
   latestFile=$latestFile.0.0
else
   latestFile="0.0.0"
fi
leapver=$(semver -i major $latestFile)
leapver=${leapver/.0.0/}

mv aip-sv-$releaseVersion.$minorVersion.tgz aip-sv-$releaseVersion.$minorVersion-$leapver.tgz

ls *.tgz >> ./app/versionDetails.txt

curl -u${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -T ./*.tgz "https://infyartifactory.jfrog.io/artifactory/icets-ai_generic/aip/app/$branchVersion/"

echo "Published " *.tgz
