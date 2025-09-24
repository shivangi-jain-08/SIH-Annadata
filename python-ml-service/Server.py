from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from urllib.parse import quote_plus
from tom import imageclassifier
from Crop_classification_training import crop_class
from testingpurpose import arraan
import threading



app = Flask(__name__)
CORS(app)


username = quote_plus("guntijoy1202_db_user")
password = quote_plus("Gagan")

# Setup MongoDB
client = MongoClient(
    f"mongodb+srv://{username}:{password}@cluster0.uehraz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)

db = client["ataron"]
collection = db["ataron"]




def imgdiseaseclas(path):
    res = imageclassifier(path)
    return res

def cropclashard():
    arrayd = arraan(buffer)
    res = crop_class(arrayd)
    return res

def manualcrop(arrayd):
    res = crop_class(arrayd)
    return res

def buffer(data):
    print(data)
    collection.delete_many({})
    collection.insert_one({"values": data})

def sender():
    arraan(buffer)

@app.route('/receive_data', methods=['POST'])
def receive_data():
    try:
        data = request.get_json(force=True)
        print("Received JSON:", data)

        isimg = data.get("Cropimgdiseaseclas")
        hardwarein = data.get("cropclasshard")
        manualin = data.get("cropclassmanual")
        array = data.get('array')

        if isimg:
            dis = imgdiseaseclas(isimg)
            return jsonify({"message": dis or "File was not Uploaded"})

        elif hardwarein:
            crop = cropclashard()
            return jsonify({"message": crop or "Data was not coming!"})

        elif manualin:
            s = manualcrop(array)
            return jsonify({"message": s or "error"})

        else:
            return jsonify({"message": "Invalid request"})

    except Exception as e:
        print("Backend Error:", e)
        return jsonify({"message": "Internal server error", "error": str(e)}), 500
    
if __name__ == '__main__':
   # threading.Thread(target=sender, daemon=True).start()
    app.run(debug=False)
