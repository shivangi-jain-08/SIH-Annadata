from pathlib import Path
import random
from PIL import Image
import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import torchvision
import os
import numpy


def imageclassifier(ar):

    device = "cuda" if torch.cuda.is_available() else "cpu"


    class_dict = {'Apple___Apple_scab': 0, 'Apple___Black_rot': 1, 'Apple___Cedar_apple_rust': 2, 'Apple___healthy': 3, 'Blueberry___healthy': 4, 'Cherry_(including_sour)___Powdery_mildew': 5, 'Cherry_(including_sour)___healthy': 6, 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': 7, 'Corn_(maize)___Common_rust_': 8, 'Corn_(maize)___Northern_Leaf_Blight': 9, 'Corn_(maize)___healthy': 10, 'Grape___Black_rot': 11, 'Grape___Esca_(Black_Measles)': 12, 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': 13, 'Grape___healthy': 14, 'Orange___Haunglongbing_(Citrus_greening)': 15, 'Peach___Bacterial_spot': 16, 'Peach___healthy': 17, 'Pepper,_bell___Bacterial_spot': 18, 'Pepper,_bell___healthy': 19, 'Potato___Early_blight': 20, 'Potato___Late_blight': 21, 'Potato___healthy': 22, 'Raspberry___healthy': 23, 'Soybean___healthy': 24, 'Squash___Powdery_mildew': 25, 'Strawberry___Leaf_scorch': 26, 'Strawberry___healthy': 27, 'Tomato___Bacterial_spot': 28, 'Tomato___Early_blight': 29, 'Tomato___Late_blight': 30, 'Tomato___Leaf_Mold': 31, 'Tomato___Septoria_leaf_spot': 32, 'Tomato___Spider_mites Two-spotted_spider_mite': 33, 'Tomato___Target_Spot': 34, 'Tomato___Tomato_Yellow_Leaf_Curl_Virus': 35, 'Tomato___Tomato_mosaic_virus': 36, 'Tomato___healthy': 37}

    class TinyVGG(nn.Module):

        def __init__(self, input_shape: int, hidden_units: int, output_shape: int) -> None:
            super().__init__()
            self.conv_block_1 = nn.Sequential(
                nn.Conv2d(in_channels=input_shape, 
                          out_channels=hidden_units, 
                          kernel_size=3,
                          stride=1,
                          padding=1),
                nn.ReLU(),
                nn.Conv2d(in_channels=hidden_units, 
                          out_channels=hidden_units,
                          kernel_size=3,
                          stride=1,
                          padding=1),
                nn.ReLU(),
                nn.MaxPool2d(kernel_size=2,
                             stride=2)
            )
            self.conv_block_2 = nn.Sequential(
                nn.Conv2d(hidden_units, hidden_units, kernel_size=3, padding=1),
                nn.ReLU(),
                nn.Conv2d(hidden_units, hidden_units, kernel_size=3, padding=1),
                nn.ReLU(),
                nn.MaxPool2d(2)
            )
            self.classifier = nn.Sequential(
                nn.Flatten(),
                nn.LazyLinear(out_features=output_shape)
    )


        def forward(self, x: torch.Tensor):
            x = self.conv_block_1(x)

            x = self.conv_block_2(x)

            x = self.classifier(x)

            return x



    loaded_model_2 = TinyVGG(input_shape=3,
                      hidden_units=64, 
                      output_shape=len(class_dict))


    loaded_model_2.load_state_dict(torch.load(f="Super_models\\Super_Modelv3.pth"))


    loaded_model_2 = loaded_model_2.to(device)


    custom_image_transform = transforms.Compose([
        transforms.Resize((64, 64)),
        transforms.Normalize([0.5,0.5,0.5],[0.5,0.5,0.5])
    ])
    lis = []
    
    path = "SIH-Annadata\\uploads"  # img to be uploaded here!
    for root, dirs, files in os.walk(path):
        for file_name in ar:
                file_path = os.path.join(root,file_name)
                custom_image_uint8 = torchvision.io.read_image(str(file_path))
                custom_image = custom_image_uint8 / 255.
                custom_image_transformed = custom_image_transform(custom_image)
                loaded_model_2.eval()
                with torch.inference_mode():
                    custom_image_pred = loaded_model_2(custom_image_transformed.unsqueeze(dim=0).to(device))
                custom_image_pred_probs = torch.softmax(custom_image_pred, dim=1)
                custom_image_pred_label = torch.argmax(custom_image_pred_probs, dim=1)
                for key, value in class_dict.items():
                    if value == custom_image_pred_label:
                        lis.append((key,custom_image_pred_probs.max().item()))
            
    return lis         