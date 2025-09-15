#!/bin/bash
set -x
moduleName=aip-app
releaseVersion=3.2
# minorVersion=0

resultAsJson=$(curl -u ${ARTIFACTORY_REPO_USER}:${ARTIFACTORY_REPO_PASS} -X POST  -H "content-type: text/plain" -d 'items.find({ "repo": {"$eq":"essedum-ai_npm_virtual"}, "name": {"$match" : "'"$moduleName"-'ui-'"$releaseVersion"'.*.tgz"}}).sort({"$desc":["modified","created"]}).limit(5)')
latestFile=$(echo $resultAsJson | jq -r '.results | sort_by(.updated) [length-1].name')

echo $latestFile
if [[ $latestFile != "null" ]]; then 
   temp=${latestFile/$moduleName-'ui'-$releaseVersion./}
   temp=${temp/.tgz/}
   currentVersion=$temp
else 
   currentVersion="0"
fi
nextVersion=$((currentVersion + 1))
# nextVersion=${nextVersion/.0.0/}
nextVersion=$releaseVersion.$nextVersion

if [[ ! -d "dist/$moduleName/" ]]; then
        echo "Directory dist/$moduleName/ DOES NOT exists. So nothing to publish..."
        exit 999
fi
#mv package.json temp.json
#jq -r '.name |= "aip-app"' temp.json > package.json
#rm temp.json
cp package.json dist/$moduleName/
cp LICENSE.MD dist/$moduleName/
mv dist/$moduleName/ dist/$moduleName-'ui'/
#cd dist/icip-app
echo "publishing version " $nextVersion
yarn --verbose publish dist/$moduleName-'ui'/  --new-version $nextVersion --no-git-tag-version
