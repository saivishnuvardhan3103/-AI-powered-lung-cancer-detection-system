import torch
import torch.nn as nn

class NoduleClassifier3D(nn.Module):
    """
    Simple 3D CNN for nodule classification (Benign vs Malignant).
    """
    def __init__(self, in_channels=1, num_classes=1):
        super(NoduleClassifier3D, self).__init__()
        
        self.features = nn.Sequential(
            nn.Conv3d(in_channels, 16, kernel_size=3, padding=1),
            nn.BatchNorm3d(16),
            nn.ReLU(inplace=True),
            nn.MaxPool3d(2),
            
            nn.Conv3d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm3d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool3d(2),
            
            nn.Conv3d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm3d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool3d(2),
            
            nn.Conv3d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm3d(128),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool3d((1, 1, 1))
        )
        
        self.classifier = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return torch.sigmoid(x)

def get_model():
    return NoduleClassifier3D()

if __name__ == "__main__":
    # Test model instantiation and forward pass
    model = get_model()
    dummy_input = torch.randn(1, 1, 64, 64, 64)
    output = model(dummy_input)
    print(f"Output shape: {output.shape}")
