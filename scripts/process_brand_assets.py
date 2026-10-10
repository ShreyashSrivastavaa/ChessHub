import os
import math
from PIL import Image, ImageDraw, ImageFilter

# 1. Inspect the extracted knight from mark_sample
raw = Image.open("scripts/knight_raw.png").convert("RGBA")
w, h = raw.size

# Background in mark_sample is off-white (#f9f5f0 to #ffffff)
# Let's create a transparent cutout of the knight
pixels = raw.load()
clean_knight = Image.new("RGBA", (w, h), (0, 0, 0, 0))
clean_pixels = clean_knight.load()

for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        # Detect background: high brightness and low saturation
        # Off-white background has r > 235, g > 230, b > 220
        if r > 230 and g > 225 and b > 215:
            # calculate alpha based on distance
            dist = max(0, min(255, int((255 - ((r + g + b) / 3)) * 8)))
            if dist < 10:
                clean_pixels[x, y] = (0, 0, 0, 0)
            else:
                clean_pixels[x, y] = (r, g, b, dist)
        else:
            clean_pixels[x, y] = (r, g, b, 255)

clean_knight.save("scripts/knight_transparent.png")
print("Saved knight_transparent.png")
