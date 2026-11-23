import os
from PIL import Image, ImageDraw

artifact_dir = r"C:\Users\USER\.gemini\antigravity\brain\71d66b3d-cd6a-4e30-8b62-f104237fd0aa"
project_dir = r"c:\Users\USER\Documents\1-SYSTEM FOLDERS\01-Projects\Wish-me-cat"

w, h = 860, 560
img = Image.new("RGBA", (w, h), "#060412")
d = ImageDraw.Draw(img)

# Outer Modal Panel
d.rectangle([10, 10, w - 10, h - 10], fill="#09081a", outline="#38bdf8", width=2)

# Modal Header
d.rectangle([10, 10, w - 10, 52], fill="#0f0c29")
d.text((28, 20), "🐱 CAT DRESSING ROOM", fill="#fef08a")
d.text((28, 36), "CUSTOMIZE YOUR FELINE HERO WITH BREEDS, HATS, CAPES & CHARMS", fill="#94a3b8")
d.text((w - 36, 20), "✕", fill="#f87171")

# Live Dressing Mirror Box (Top)
d.rectangle([26, 64, w - 26, 175], fill="#0f0c29", outline="#38bdf8", width=2)
# Mirror canvas frame
d.rectangle([36, 74, 156, 165], fill="#070514", outline="#6366f1", width=2)
d.text((54, 148), "LIVE MIRROR", fill="#38bdf8")

# Cat in mirror
cat_path = os.path.join(project_dir, "public", "assets", "character", "celestial", "CharacterPortraits", "front.png")
if os.path.exists(cat_path):
    cat_img = Image.open(cat_path).convert("RGBA").resize((70, 70), Image.Resampling.NEAREST)
    img.paste(cat_img, (60, 80), cat_img)

# Loadout Grid
d.text((170, 74), "ACTIVE GEAR LOADOUT", fill="#fef08a")
d.text((w - 240, 74), "10 / 10 ACCESSORIES UNLOCKED", fill="#38bdf8")

slots = [
    ("BREED", "CELESTIAL", "#f8fafc"),
    ("HAT", "Crown of Supernova", "#facc15"),
    ("CAPE", "Comet Stardust Scarf", "#c084fc"),
    ("CHARM", "Solaris Sun Amulet", "#38bdf8")
]
for idx, (label, val, col) in enumerate(slots):
    sx = 170 + idx * 160
    sy = 96
    d.rectangle([sx, sy, sx + 150, sy + 36], fill="#09081a", outline="#312e81")
    d.text((sx + 8, sy + 4), f"{label}:", fill="#94a3b8")
    d.text((sx + 8, sy + 18), val, fill=col)

# Rod Banner
d.rectangle([170, 140, w - 38, 165], fill="#110e2e")
d.text((178, 146), "🎣 ROD: Starlight Caster (Common)  •  Passive: Starlight Affinity (+10% baseline stats)", fill="#38bdf8")

# Tabs
d.rectangle([26, 186, 200, 214], fill="#0284c7", outline="#38bdf8")
d.text((36, 194), "🐱 FELINE BREEDS (4)", fill="#ffffff")

d.rectangle([210, 186, 430, 214], fill="#1e1b4b", outline="#312e81")
d.text((220, 194), "👑 ACCESSORIES & COSMETICS (10)", fill="#94a3b8")

# Breeds Grid (4 items)
breeds = [
    ("CELESTIAL", "Mystic Star Wanderer", "#38bdf8", True),
    ("CALICO", "Serene Lake Whisperer", "#fb923c", False),
    ("KURO", "Midnight Void Prowler", "#a855f7", False),
    ("CLOUD", "Dreamy Starlight Floof", "#38bdf8", False),
]

for idx, (bname, btitle, bcol, eq) in enumerate(breeds):
    col_idx = idx % 2
    row_idx = idx // 2
    bx = 26 + col_idx * 405
    by = 226 + row_idx * 155
    
    d.rectangle([bx, by, bx + 395, by + 145], fill="#141c3d" if eq else "#0c0a20", outline="#38bdf8" if eq else "#281f4a", width=2)
    d.text((bx + 12, by + 10), bname, fill="#f8fafc")
    d.text((bx + 12, by + 26), btitle, fill=bcol)
    
    # Portrait
    p_path = os.path.join(project_dir, "public", "assets", "character", bname.lower(), "CharacterPortraits", "front.png")
    if os.path.exists(p_path):
        p_img = Image.open(p_path).convert("RGBA").resize((48, 48), Image.Resampling.NEAREST)
        img.paste(p_img, (bx + 12, by + 46), p_img)
        
    d.text((bx + 68, by + 48), "Attuned to celestial pools and meteor showers.", fill="#94a3b8")
    d.text((bx + 68, by + 64), "High baseline luck & harmonic purring aura.", fill="#94a3b8")
    
    # Button
    d.rectangle([bx + 12, by + 105, bx + 383, by + 135], fill="#15803d" if eq else "#0369a1")
    d.text((bx + 150, by + 115), "✓ CURRENTLY EQUIPPED" if eq else f"SELECT {bname}", fill="#ffffff")

out_path = os.path.join(artifact_dir, "cat_dressing_room_ui_preview.png")
img.save(out_path)
print(f"Saved Dressing Room UI Preview: {out_path}")
