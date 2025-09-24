import torch
from torch import nn
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

def crop_class(arr):
    device = "cuda"
    class CropModel(nn.Module):
      def __init__(self,in_,hidden,out):
        super().__init__()
        self.stackmf = nn.Sequential(
            nn.Linear(in_features=in_,out_features=hidden),
            nn.ReLU(),
            nn.Linear(in_features=hidden,out_features=hidden),
            nn.ReLU(),
            nn.Linear(in_features=hidden,out_features=out)
        )
      def forward(self,x):
        return self.stackmf(x)

    Model = CropModel(in_=7,hidden=64,out=22).to(device)

    Model.load_state_dict(torch.load(f="Crop_models\\Crop_Classification_modelv5.pth"))

    data = np.array(arr)
    data_tensor = torch.from_numpy(data).float().to(device)
    mapping = {"Rice": 1, "Maize": 2, "ChickPea": 3,"KidneyBeans":4,"PigeonPeas":5,"MothBeans":6,"MungBean":7,"Blackgram":8,"Lentil":9,"Pomegranate":10,"Banana":11,"Mango":12,"Grapes":13,"Watermelon":14,"Muskmelon":15,"Apple":16,"Orange":17,"Papaya":18,"Coconut":19,"Cotton":20,"Jute":21,"Coffee":22}
    Model.eval()
    with torch.inference_mode():
      pred = Model(data_tensor)
    ss = torch.softmax(pred,dim=0)
    for keys,values in mapping.items():
      if values == ss.argmax().item()+1:
        li = ss.max().item()
        return {"crop_name": keys, "Suitability": li} 