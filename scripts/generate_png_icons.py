import os
from PIL import Image, ImageDraw, ImageFilter, ImageOps

src_mockup = r"C:\Users\Admin\.gemini\antigravity-ide\brain\0cf39d14-8967-4d8e-a29c-a178a42d4d67\.user_uploaded\media_1791640207018.jpg"
public_dir = "public"

# Load source mockup
mockup = Image.open(src_mockup).convert("RGB")
w, h = mockup.size

# Extract the high-res 512 squircle icon from top-right of sheet
# The first favicon in the top row: x: 560 to 670, y: 50 to 155 (exact squircle)
fav_crop = mockup.crop((559, 48, 670, 154))

# Also in bottom right there is APP ICON PREVIEW (Dark): x: 563 to 648, y: 535 to 618
app_icon_crop = mockup.crop((563, 535, 648, 618))

# Let's create a pristine 512x512 master icon:
# 1. Start with 512x512 deep dark background (#0E0E12)
master_512 = Image.new("RGBA", (512, 512), (14, 14, 18, 255))
draw = ImageDraw.Draw(master_512)

# Rounded squircle for app icon / favicon
# Draw smooth rounded rectangle
radius = 112
draw.rounded_rectangle([16, 16, 496, 496], radius=radius, fill=(18, 18, 24, 255), outline=(46, 46, 56, 255), width=4)

# Resize the brand knight crop with high quality Lanczos interpolation
knight_img = fav_crop.resize((480, 480), Image.Resampling.LANCZOS).convert("RGBA")

# Create squircle mask for the knight
mask = Image.new("L", (480, 480), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle([0, 0, 480, 480], radius=105, fill=255)

master_512.paste(knight_img, (16, 16), mask)

# Save icon-512.png
master_512.save(os.path.join(public_dir, "icon-512.png"), format="PNG", optimize=True)
print("Generated public/icon-512.png (512x512)")

# Generate icon-192.png
icon_192 = master_512.resize((192, 192), Image.Resampling.LANCZOS)
icon_192.save(os.path.join(public_dir, "icon-192.png"), format="PNG", optimize=True)
print("Generated public/icon-192.png (192x192)")

# Generate apple-touch-icon.png (180x180)
apple_touch = master_512.resize((180, 180), Image.Resampling.LANCZOS)
apple_touch.save(os.path.join(public_dir, "apple-touch-icon.png"), format="PNG", optimize=True)
print("Generated public/apple-touch-icon.png (180x180)")

# Generate icon-32.png
icon_32 = master_512.resize((32, 32), Image.Resampling.LANCZOS)
icon_32.save(os.path.join(public_dir, "icon-32.png"), format="PNG", optimize=True)
print("Generated public/icon-32.png (32x32)")

# Generate icon-16.png
icon_16 = master_512.resize((16, 16), Image.Resampling.LANCZOS)
icon_16.save(os.path.join(public_dir, "icon-16.png"), format="PNG", optimize=True)
print("Generated public/icon-16.png (16x16)")

# Generate multi-size favicon.ico (16, 32, 48)
icon_48 = master_512.resize((48, 48), Image.Resampling.LANCZOS)
master_512.save(
    os.path.join(public_dir, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
    append_images=[icon_16, icon_32, icon_48]
)
print("Generated public/favicon.ico (multi-size: 16x16, 32x32, 48x48)")

# Also create high-res transparent logo-icon.png
if os.path.exists("scripts/knight_transparent.png"):
    raw_kt = Image.open("scripts/knight_transparent.png")
    # upscale to crisp 300x440
    kt_high = raw_kt.resize((300, 437), Image.Resampling.LANCZOS)
    kt_high.save(os.path.join(public_dir, "logo-icon.png"), format="PNG", optimize=True)
    print("Generated public/logo-icon.png")

print("All icon assets generated successfully in public/!")
