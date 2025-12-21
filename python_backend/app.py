from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app) # Cho phép React gọi sang mà không bị chặn

# Load model đã train
model = joblib.load('heart_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Lấy dữ liệu theo đúng thứ tự lúc train
        # ['age', 'sex', 'cp', 'trestbps', 'chol', 'thalach', 'exang']
        features = [
            float(data['age']),
            float(data['sex']),
            float(data['cp']),
            float(data['trestbps']),
            float(data['chol']),
            float(data['thalach']),
            float(data['exang'])
        ]
        
        # Dự đoán
        prediction = model.predict([features])
        probability = model.predict_proba([features])
        
        # Lấy % nguy cơ (xác suất rơi vào lớp 1)
        risk_score = round(probability[0][1] * 100, 2)
        
        result = {
            'prediction': int(prediction[0]), # 1: Có bệnh, 0: Không
            'risk_score': risk_score,
            'message': 'Nguy cơ CAO' if prediction[0] == 1 else 'Nguy cơ THẤP'
        }
        
        return jsonify({
            'success': True,
            'result': result
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

if __name__ == '__main__':
    print("Server AI đang chạy tại http://127.0.0.1:5000")
    app.run(port=5000, debug=True)