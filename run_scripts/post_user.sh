#/bin/bash
curl -vv -XPOST -d "{\"name\": \"Daniel Benediktsson\", \"username\": \"danniben2\", \"password\": \"123456\", \"email\": \"danielb15@ru.is\", \"age\": 25, \"gender\": \"f\"}" -H "Content-Type: Application/json" http://localhost:5000/api/users
