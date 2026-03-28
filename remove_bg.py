from rembg import remove
from PIL import Image

input_path = 'public/about-me-photo.png'
output_path = 'public/about-me-transparent.png'

print(f"Opening {input_path}...")
input_img = Image.open(input_path)

print("Removing background... this can take a few moments.")
output_img = remove(input_img)

print(f"Saving to {output_path}...")
output_img.save(output_path)

print("Done! Background removed successfully.")
