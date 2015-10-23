#1/bin/bash
while true; do
    curl -XGET http://localhost:5000 | python -m json.tool
    sleep 1
done
