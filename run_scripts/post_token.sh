#/bin/bash
curl -vv -XPOST -d "{\"username\": \"danniben2\", \"password\": \"123456\"}" -H "Content-Type: Application/json" http://localhost:5000/api/token
