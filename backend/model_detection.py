import torch
import torch.nn as nn
import torch.nn.functional as F

class ConvBlock3D(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(ConvBlock3D, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv3d(in_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm3d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv3d(out_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm3d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.conv(x)

class UNet3D(nn.Module):
    """
    Lightweight 3D U-Net for nodule detection.
    Reduced channel counts for memory efficiency.
    """
    def __init__(self, in_channels=1, out_channels=1):
        super(UNet3D, self).__init__()
        
        # Encoder
        self.enc1 = ConvBlock3D(in_channels, 16)
        self.pool1 = nn.MaxPool3d(2)
        self.enc2 = ConvBlock3D(16, 32)
        self.pool2 = nn.MaxPool3d(2)
        self.enc3 = ConvBlock3D(32, 64)
        self.pool3 = nn.MaxPool3d(2)
        
        # Bottleneck
        self.bottleneck = ConvBlock3D(64, 128)
        
        # Decoder
        self.up3 = nn.ConvTranspose3d(128, 64, kernel_size=2, stride=2)
        self.dec3 = ConvBlock3D(128, 64)
        self.up2 = nn.ConvTranspose3d(64, 32, kernel_size=2, stride=2)
        self.dec2 = ConvBlock3D(64, 32)
        self.up1 = nn.ConvTranspose3d(32, 16, kernel_size=2, stride=2)
        self.dec1 = ConvBlock3D(32, 16)
        
        # Output
        self.out_conv = nn.Conv3d(16, out_channels, kernel_size=1)

    def forward(self, x):
        e1 = self.enc1(x)
        p1 = self.pool1(e1)
        
        e2 = self.enc2(p1)
        p2 = self.pool2(e2)
        
        e3 = self.enc3(p2)
        p3 = self.pool3(e3)
        
        b = self.bottleneck(p3)
        
        u3 = self.up3(b)
        u3 = torch.cat([u3, e3], dim=1)
        d3 = self.dec3(u3)
        
        u2 = self.up2(d3)
        u2 = torch.cat([u2, e2], dim=1)
        d2 = self.dec2(u2)
        
        u1 = self.up1(d2)
        u1 = torch.cat([u1, e1], dim=1)
        d1 = self.dec1(u1)
        
        return torch.sigmoid(self.out_conv(d1))

def get_model():
    return UNet3D()

if __name__ == "__main__":
    # Test model instantiation and forward pass
    model = get_model()
    dummy_input = torch.randn(1, 1, 64, 64, 64)
    output = model(dummy_input)
    print(f"Output shape: {output.shape}")
