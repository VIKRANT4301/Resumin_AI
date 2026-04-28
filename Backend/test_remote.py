import urllib.request
import json
import urllib.error

url = 'https://resumin-ai-1.onrender.com/api/matcher/auth/login'
data = json.dumps({"email": "test@test.com", "password": "test"}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json', 'Origin': 'https://resumin-ai.vercel.app'})
try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Headers:", response.headers)
        print("Body:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error Status:", e.code)
    print("Error Headers:", e.headers)
    print("Error Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Other Exception:", e)
