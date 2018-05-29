#!/bin/bash

reports=`ls ./functional-output | grep "parallel"`
reportsArray=(${reports//$"\s"/ })
for i in "${reportsArray[@]}"
do
    cp ./functional-output/${i}/mochawesome.html ./functional-output/${i}.html
    cp ./functional-output/${i}/mochawesome.json ./functional-output/${i}.json
done