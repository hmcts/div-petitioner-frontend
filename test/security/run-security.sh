set -e
echo "Running security testing on: $1"

zap-cli --zap-url http://127.0.0.1 -p 8090 status -t 120
zap-cli --zap-url http://127.0.0.1 -p 8090 open-url "$1"
zap-cli --zap-url http://127.0.0.1 -p 8090 spider "$1"
zap-cli --zap-url http://127.0.0.1 -p 8090 active-scan  --scanners all --recursive "$1"
zap-cli --zap-url http://127.0.0.1 -p 8090 report -o 'security-reports/active-scan.html' -f html
zap-cli --zap-url http://127.0.0.1 -p 8090 ajax-spider "$1"
zap-cli --zap-url http://127.0.0.1 -p 8090 report -o 'security-reports/ajax-spider.html' -f html
zap-cli --zap-url http://127.0.0.1 -p 8090 alerts -l Low
