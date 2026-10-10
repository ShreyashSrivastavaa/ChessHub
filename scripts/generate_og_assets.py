import os
from PIL import Image

src_mockup = r"C:\Users\Admin\.gemini\antigravity-ide\brain\0cf39d14-8967-4d8e-a29c-a178a42d4d67\.user_uploaded\media_1791640207018.jpg"
public_dir = "public"

mockup = Image.open(src_mockup).convert("RGB")
w, h = mockup.size

# Extract the dark horizontal logo: x: 550 to 760, y: 382 to 468
logo_crop = mockup.crop((550, 382, 760, 468))

# Resize to crisp 420x172
logo_420 = logo_crop.resize((420, 172), Image.Resampling.LANCZOS)
logo_420.save(os.path.join(public_dir, "logo.png"), format="PNG", optimize=True)
print("Saved public/logo.png")

# Also create a rich 1200x630 social OpenGraph card (og-image.png)
og_img = Image.new("RGBA", (1200, 630), (14, 14, 18, 255))
# Place hero knight on left or center
hero_crop = mockup.crop((50, 20, 480, 460)).resize((580, 580), Image.Resampling.LANCZOS)
og_img.paste(hero_crop, (20, 25))

# Place dark card on right
logo_og = logo_crop.resize((500, 205), Image.Resampling.LANCZOS)
og_img.paste(logo_og, (640, 210))

og_img.save(os.path.join(public_dir, "og-image.png"), format="PNG", optimize=True)
print("Saved public/og-image.png (1200x630)")
