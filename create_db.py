import urllib.request
import json
import uuid

data = json.dumps({
    "eventData": {
        "title": "Test",
        "durationMinutes": 30,
        "dateRangeStart": "2026-05-23T00:00:00.000Z",
        "dateRangeEnd": "2026-05-24T00:00:00.000Z",
        "organizerId": "0ff0cf1f-83f3-49ed-99f2-b0e87bd3e1d8",
        "status": "published"
    },
    "participantsEmails": ["test@test.com"]
}).encode('utf-8')

req = urllib.request.Request("http://localhost:3000/events", data=data, headers={'Content-Type': 'application/json'})
try:
    response = urllib.request.urlopen(req)
    print(response.read())
except Exception as e:
    print(e)
