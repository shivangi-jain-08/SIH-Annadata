from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from urllib.parse import quote_plus
from Crop_Disease_Classification import imageclassifier
from Crop_classification import crop_class
from Hardware_dummy import fcv
import threading
import certifi
import google.generativeai as genai


genai.configure(api_key="AIzaSyC4YksUB1RhziccEL7RdbOUkk6y9s0zHSA") # type: ignore

model = genai.GenerativeModel("gemini-2.5-flash")  # type: ignore


app = Flask(__name__)
CORS(app)

client = MongoClient(
    f"mongodb+srv://myselfshivangi08:indiA_1234@cluster1.goeqstp.mongodb.net/annadata?retryWrites=true&w=majority&appName=Cluster1",
    tls=True,
    tlsCAFile=certifi.where(),
    tlsAllowInvalidCertificates=False
)

db = client["annadata"]
arraysender = db["hardwaremessages"]
recommendations = db["croprecommendations"]




def imgdiseaseclas(path):
    res = imageclassifier(path)
    return res

def manualcrop(arrayd):
    res = crop_class(arrayd)
    return res

def buffer():
    tron = None
    temp = []
    count = 0
    try:
        for i in fcv():
            if len(temp) < 10:
                temp.append(i)
            elif len(temp) == 10:
                cache = []
                comparer = []
                count+=1
                for b in temp[1:len(temp)]:
                    lis = []
                    for j,k in zip(b,temp[0]):
                        lis.append(k-j)
                    cache.append(lis)
                for m in cache:
                    comparer.append(sum(m)) 
                if tron == temp[comparer.index(max(comparer,key=abs))+1]:
                    print("same")
                else:
                    arr = temp[comparer.index(max(comparer, key=abs)) + 1]
                    Nitrogen = arr[0]
                    Phosphorus = arr[1]
                    Potassium = arr[2]
                    Temperature = arr[3]
                    Humidity = arr[4]
                    pH_Value = arr[5]
                    Rainfall = arr[6]
                    Crop = crop_class(arr)                                  
                    # If anyone wanted to change the prompt-change it here    \/
                    response = model.generate_content(f"Based on the given soil and climate data Nitrogen: {Nitrogen}, Phosphorus: {Phosphorus}, Potassium: {Potassium}, Temperature: {Temperature}, Humidity: {Humidity}, pH Value: {pH_Value}, Rainfall: {Rainfall},  the recommended crop is {Crop} for Punjab. Write farmer-friendly advice in simple English, within 70 words, in clear bullet points. Do not include any introductory phrases like 'Here is your advice'—only the direct guidance.")
                    arraysender.insert_one({"Nitrogen":Nitrogen,"Phosphorus":Phosphorus,"Potassium":Potassium,"Temperature":Temperature,"Humidity":Humidity,"pH":pH_Value,"Rainfall":Rainfall})
                    recommendations.insert_one({"recommendations":Crop,"generalRecommendations":response.text})
                    tron = temp[comparer.index(max(comparer,key=abs))+1]
                    print(f"changed: {arr}")    
                temp.pop(0)
                temp.append(i)
            else:
                break
    except TypeError:
        print("Harware is not connected")        
  
@app.route('/receive_data', methods=['POST'])
def receive_data():
    try:
        data = request.get_json(force=True)
        print("Received JSON:", data)

        manual7 = data.get("manualentryarray")
        isimg = data.get("image_url")

        if isimg:
            dis = imgdiseaseclas([isimg])
            return jsonify({"message": dis or "File was not Uploaded"}) #returning example :- [('Grape___Black_rot', 0.851711094379425)]
        elif manual7:
            man = manualcrop(manual7)
            return jsonify({"message": man or "No 7 inputs were inserted"}) #returning example :- {'crop_name': 'Rice', 'Suitability': 1.0}
        else:
            return jsonify({"message": "Invalid request"})

    except Exception as e:
        print("Backend Error:", e)
        return jsonify({"message": "Internal server error", "error": str(e)}), 500
    
if __name__ == '__main__':
    t = threading.Thread(target=buffer, daemon=True)
    t.start()
    app.run(debug=False)

