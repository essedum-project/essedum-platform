#!/bin/bash
set -x
moduleName=common-app
releaseVersion=3.2
# minorVersion=0


rm -rf *.tgz

resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST   -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"essedum-ai_npm_virtual"}, "name": {"$match" : "'"$moduleName"'-'"$releaseVersion"'.*.tgz"}}).sort({"$desc":["modified","created"]}).limit(5)')
echo $resultAsJson
latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')
echo $latestFile
if [[ $latestFile != "null" ]]; then 
   temp=${latestFile/$moduleName-$releaseVersion./}
   temp=${temp/.tgz/}
   currentVersion=$temp
else 
   currentVersion="0"
fi
nextVersion=$((currentVersion + 1))
# nextVersion=${nextVersion/.0.0/}
nextVersion=$releaseVersion.$nextVersion
#releaseName=$moduleName-$nextVersion
#echo $releaseName

if [[ ! -d "dist/$moduleName/" ]]; then
        echo "Directory dist/'$moduleName'/ DOES NOT exists. So nothing to publish..."
        exit 999
fi
cp package.json dist/$moduleName/
#cp LICENSE.MD dist/$moduleName/
#cd dist/$moduleName
echo "publishing version" $nextVersion
yarn --verbose publish dist/$moduleName/  --new-version $nextVersion --no-git-tag-version
