#1/bin/bash
curl -vv -XGET http://localhost:4000 | python -m json.tool
