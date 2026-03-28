import numpy as np
import SimpleITK as sitk
import os
from scipy.ndimage import zoom

def load_scan(path):
    """
    Load 3D scan from file (MHD, NIFTI, or DICOM series directory).
    """
    if os.path.isdir(path):
        reader = sitk.ImageSeriesReader()
        dicom_names = reader.GetGDCMSeriesFileNames(path)
        reader.SetFileNames(dicom_names)
        image = reader.Execute()
    else:
        image = sitk.ReadImage(path)
    
    return image

def get_sitk_array(image):
    return sitk.GetArrayFromImage(image)

def normalize_hu(image_array, min_hu=-1000, max_hu=400):
    """
    Normalize HU values to [0, 1] range.
    Standard CT lung range is typically -1000 to 400.
    """
    image_array = (image_array - min_hu) / (max_hu - min_hu)
    image_array[image_array > 1] = 1.
    image_array[image_array < 0] = 0.
    return image_array

def resample_scan(image, new_spacing=[1.0, 1.0, 1.0]):
    """
    Resample 3D image to uniform spacing.
    """
    spacing = np.array(image.GetSpacing())
    size = np.array(image.GetSize())
    new_size = size * spacing / new_spacing
    new_size = np.round(new_size).astype(int).tolist()
    
    resample = sitk.ResampleImageFilter()
    resample.SetOutputSpacing(new_spacing)
    resample.SetSize(new_size)
    resample.SetOutputDirection(image.GetDirection())
    resample.SetOutputOrigin(image.GetOrigin())
    resample.SetTransform(sitk.Transform())
    resample.SetDefaultPixelValue(image.GetPixelIDValue())
    resample.SetInterpolator(sitk.sitkLinear)
    
    return resample.Execute(image)

def segment_lung_mask(image_array, threshold=-400):
    """
    Basic threshold-based lung segmentation.
    Returns a binary mask.
    """
    # Thresholding
    mask = image_array < threshold
    
    # Simple morphological cleanup (placeholder for more advanced segmentation)
    # In a full system, you'd use connected components to keep only the largest 
    # two components (lungs) and remove the background.
    return mask.astype(np.uint8)

def extract_patch(image_array, center_coords, patch_size=(64, 64, 64)):
    """
    Extract a 3D patch (cube) around a center coordinate.
    """
    z, y, x = center_coords
    pz, py, px = patch_size
    
    start_z = max(0, z - pz // 2)
    start_y = max(0, y - py // 2)
    start_x = max(0, x - px // 2)
    
    patch = image_array[start_z:start_z+pz, start_y:start_y+py, start_x:start_x+px]
    
    # Pad if patch is smaller than patch_size
    if patch.shape != patch_size:
        pad_z = patch_size[0] - patch.shape[0]
        pad_y = patch_size[1] - patch.shape[1]
        pad_x = patch_size[2] - patch.shape[2]
        patch = np.pad(patch, ((0, pad_z), (0, pad_y), (0, pad_x)), mode='constant')
        
    return patch

def generate_dummy_scan(shape=(128, 128, 128)):
    """
    Generate a synthetic 3D scan with a 'nodule' for testing.
    """
    # Create background (simulating lung density around -700 HU)
    scan = np.random.normal(-700, 50, shape)
    
    # Create a 'nodule' (simulating soft tissue density around 50 HU)
    center = [64, 64, 64]
    radius = 5
    z, y, x = np.ogrid[:shape[0], :shape[1], :shape[2]]
    dist_from_center = np.sqrt((z - center[0])**2 + (y - center[1])**2 + (x - center[2])**2)
    mask = dist_from_center <= radius
    scan[mask] = np.random.normal(50, 10, np.sum(mask))
    
    return scan.astype(np.float32)

if __name__ == "__main__":
    # Test dummy generation
    dummy = generate_dummy_scan()
    print(f"Generated dummy scan with shape: {dummy.shape}")
    normalized = normalize_hu(dummy)
    print(f"Normalized range: {normalized.min()} to {normalized.max()}")
