# Importing the essentials
import os
import json
import pandas as pd
import numpy as np

# Importing Flask stuff
from flask import Flask, request
from flask_session import Session
from flask_cors import CORS

# Importing Keras
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import tokenizer_from_json

# Importing the Preprocessing stuff
from preprocess import *

# Load Model
prd_model = load_model('weights.005-0.7504.h5')
# Load Tokenizer
with open('tokenizer.json') as f:
    data = json.load(f)
    tokenizer = tokenizer_from_json(data)

# Function for spoiler prediction
def spoiler_pred(prd_model, text_data):
    live_list = []
    batchSize = len(text_data)
    text_data_sample = text_data['text'][0]

    # Passing Data through preprocessing
    text_data_sample = replace_list([text_data_sample])

    # Preprocessing Data
    text_data_list = tokenizer.texts_to_sequences(text_data_sample)
    data_index = pad_sequences(text_data_list, maxlen = 3000)

    # Appending Data to list
    live_list.append(data_index[0])

    # Converting list to array
    live_list_np = np.asarray(live_list)
    score = prd_model.predict(live_list_np, batch_size=1, verbose=0)
    text_data['spoilerChance'] = score[0][1]

    return text_data
    # return score

# Load app and enable CORS
app = Flask(__name__)
CORS(app)

# Route for app route
@app.route('/apitest', methods = ['POST'])
def sentiment():
    if request.method == 'POST':
        # Handling the Req
        text_data = pd.DataFrame(request.json)

        # Passing Data through Model
        text_out = spoiler_pred(prd_model, text_data)

        # Making the data look nicer
        text_out = text_out[['ref','spoilerChance']]

        #Convert df to dict and then to Json
        text_out_dict = text_out.to_dict(orient='records')
        text_out_json = json.dumps(text_out_dict, ensure_ascii=False)

        return text_out_json
