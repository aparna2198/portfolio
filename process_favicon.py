from PIL import Image
import os

def process_favicon(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Change all white (also shades of whites) pixels to transparent
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        
        img.putdata(newData)
        
        # Crop the image to the bounding box of non-transparent pixels
        bbox = img.getbbox()
        if bbox:
            print(f"Cropping to {bbox}")
            img = img.crop(bbox)
        
        img.save(output_path, "PNG")
        print(f"Saved processed image to {output_path}")

    except Exception as e:
        print(f"Error: {e}")

input_file = "/Users/aparna/Documents/personal/documents/learning/python/opensource/portfolio/public/favicon_custom.png"
output_file = "/Users/aparna/Documents/personal/documents/learning/python/opensource/portfolio/public/favicon_processed.png"

process_favicon(input_file, output_file)
