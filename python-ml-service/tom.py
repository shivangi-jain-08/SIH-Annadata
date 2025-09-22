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

    data_path = Path("New Plant Diseases Dataset(Augmented)/")

    train_dir = data_path/ "train"
    test_dir = data_path/ "valid"

    data_transforms = transforms.Compose([
        transforms.Resize((64, 64)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.ToTensor(),
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
    ])

    train_data = datasets.ImageFolder(root=train_dir,
                                      transform = data_transforms,
                                      target_transform=None)

    class_dict = train_data.class_to_idx

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
                      output_shape=len(train_data.classes)).to(device)


    loaded_model_2.load_state_dict(torch.load(f="Super_models\\Super_Modelv3.pth"))


    loaded_model_2 = loaded_model_2.to(device)


    custom_image_transform = transforms.Compose([
        transforms.Resize((64, 64)),
        transforms.Normalize([0.5,0.5,0.5],[0.5,0.5,0.5])
    ])
    lis = []
    
    path = "test"  # img to be uploaded here!
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