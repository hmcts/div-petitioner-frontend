#!/bin/bash

supportedBrowsers=`sed '/\/\//d' test/crossbrowser/supportedBrowsers.js | sed '/: {/!d' | sed "s/[\'\:\{ ]//g"`
browsersArray=(${supportedBrowsers//$'\n'/ })
finalExitStatus=0

outputDirectory="${E2E_CROSSBROWSER_OUTPUT_DIR:-test/crossbrowser/reports}"

echo
echo "*****************************************"
echo "* The following browsers will be tested *"
echo "*****************************************"
echo  "$supportedBrowsers"
echo "****************************************"
echo

for i in "${browsersArray[@]}"
do
    echo "*** Testing $i ***"
    SAUCELABS_BROWSER=$i TUNNEL_IDENTIFIER=saucelabs-overnight-tunnel yarn test-crossbrowser-e2e --reporter mochawesome --reporter-options reportFilename="${i}_report",reportDir="${outputDirectory}"

    exitStatus=$?
    if [ $exitStatus -ne 0 ]; then
        finalExitStatus=$exitStatus
    fi
done

exit $finalExitStatus
