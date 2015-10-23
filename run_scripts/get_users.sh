#/bin/bash
curl -vv -XGET http://localhost:5000/api/users | python -m json.tool
