# ml-service/detector.py
from flask import Flask, request, jsonify
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os

app = Flask(__name__)

# Feature names matching what Claude extracts
FEATURE_NAMES = [
    'noise_uniformity',
    'compression_artifact_score', 
    'facial_landmark_consistency',
    'temporal_coherence',        # video only
    'frequency_domain_anomaly',
    'metadata_consistency',
]

def load_or_create_model():
    model_path = 'models/isolation_forest.pkl'
    if os.path.exists(model_path):
        return joblib.load(model_path)
    
    # Bootstrap with synthetic "authentic" baseline
    np.random.seed(42)
    authentic_samples = np.random.normal(loc=0.85, scale=0.05, size=(500, len(FEATURE_NAMES)))
    
    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,
        random_state=42
    )
    scaler = StandardScaler()
    authentic_scaled = scaler.fit_transform(authentic_samples)
    model.fit(authentic_scaled)
    
    os.makedirs('models', exist_ok=True)
    joblib.dump({'model': model, 'scaler': scaler}, model_path)
    return {'model': model, 'scaler': scaler}

artifacts = load_or_create_model()

@app.route('/score', methods=['POST'])
def score():
    data = request.json
    features = np.array([[
        data.get('noise_uniformity', 0.5),
        data.get('compression_artifact_score', 0.5),
        data.get('facial_landmark_consistency', 0.5),
        data.get('temporal_coherence', 0.5),
        data.get('frequency_domain_anomaly', 0.5),
        data.get('metadata_consistency', 0.5),
    ]])
    
    scaler = artifacts['scaler']
    model = artifacts['model']
    
    scaled = scaler.transform(features)
    anomaly_score = model.decision_function(scaled)[0]
    is_anomaly = model.predict(scaled)[0] == -1
    
    # Normalize to 0-1 (higher = more anomalous)
    normalized_score = max(0, min(1, (0.5 - anomaly_score)))
    
    return jsonify({
        'ml_anomaly_score': round(float(normalized_score), 4),
        'is_anomaly': bool(is_anomaly),
        'confidence': round(float(abs(anomaly_score)), 4),
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'IsolationForest'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)

# ml-service/requirements.txt
flask==3.0.0
scikit-learn==1.4.0
numpy==1.26.3
joblib==1.3.2
