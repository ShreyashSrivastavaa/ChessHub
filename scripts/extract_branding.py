import os
from PIL import Image

src_path = r"C:\Users\Admin\.gemini\antigravity-ide\brain\0cf39d14-8967-4d8e-a29c-a178a42d4d67\.user_uploaded\media_1791640207018.jpg"
if not os.path.exists(src_path):
    print("Source not found:", src_path)
    exit(1)

img = Image.open(src_path)
w, h = img.size
print(f"Loaded image {w}x{h}")

# Find exact regions
# Top Right Favicon 512 squircle: x: 558 to 670, y: 48 to 153
fav_sq = img.crop((558, 48, 670, 153))
fav_sq.save("scripts/fav_sq.png")

# Dark horizontal logo card: x: 545 to 768, y: 375 to 475
dark_card = img.crop((545, 375, 768, 475))
dark_card.save("scripts/dark_card.png")

# Bottom left logo mark: x: 60 to 175, y: 510 to 650
mark_sample = img.crop((60, 510, 175, 650))
mark_sample.save("scripts/mark_sample.png")

print("Cropped sample reference regions to scripts/")
