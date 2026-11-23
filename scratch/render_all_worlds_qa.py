import math
import random
import os
from PIL import Image, ImageDraw, ImageFont

ARTIFACT_DIR = r"C:\Users\USER\.gemini\antigravity\brain\71d66b3d-cd6a-4e30-8b62-f104237fd0aa"

WORLDS = [
    {
        "id": "region_moonpool",
        "name": "Moonpool Cove",
        "subtitle": "Starter Celestial Sanctuary",
        "sky_top": (6, 4, 18),
        "sky_bot": (14, 11, 36),
        "celestial_type": "moon",
        "cliff_drop": (5, 3, 12),
        "cliff_mid": (28, 23, 51),
        "cliff_hi": (41, 34, 77),
        "turf_out": (26, 34, 84),
        "turf_mid": (38, 49, 116),
        "turf_in": (46, 61, 140),
        "pond_bed": (6, 17, 31),
        "pond_stops": [(19, 53, 94), (13, 37, 69), (9, 27, 51), (6, 18, 36), (3, 10, 20)],
        "refl_halo": (30, 64, 175, 64),
        "refl_mid": (2, 132, 199, 76),
        "refl_core": (56, 189, 248, 90),
        "props": ["sakura", "willow", "pine", "crystal", "lamp"],
        "accent": (56, 189, 248),
        "pad_style": "lotus",
        "fauna": "Celestial Koi & Stargazer",
    },
    {
        "id": "region_nebula_lagoon",
        "name": "Nebula Lagoon",
        "subtitle": "Vibrant Cosmic Ocean",
        "sky_top": (8, 2, 20),
        "sky_bot": (24, 6, 51),
        "celestial_type": "nebula",
        "cliff_drop": (6, 2, 15),
        "cliff_mid": (26, 8, 51),
        "cliff_hi": (46, 15, 89),
        "turf_out": (12, 39, 56),
        "turf_mid": (16, 65, 90),
        "turf_in": (23, 89, 122),
        "pond_bed": (5, 17, 28),
        "pond_stops": [(30, 64, 175), (29, 78, 216), (14, 116, 144), (8, 51, 68), (2, 24, 36)],
        "refl_halo": (168, 85, 247, 76),
        "refl_mid": (6, 182, 212, 96),
        "refl_core": (103, 232, 249, 115),
        "props": ["coral", "alien_mushroom", "crystal", "bio_lamp"],
        "accent": (34, 211, 238),
        "pad_style": "coral",
        "fauna": "Luminous Jellyfish & Angler",
    },
    {
        "id": "region_comet_falls",
        "name": "Comet Falls",
        "subtitle": "Cascading Starlight Rivers",
        "sky_top": (4, 11, 23),
        "sky_bot": (10, 26, 51),
        "celestial_type": "waterfall",
        "cliff_drop": (3, 8, 18),
        "cliff_mid": (15, 23, 42),
        "cliff_hi": (30, 41, 59),
        "turf_out": (15, 35, 56),
        "turf_mid": (23, 54, 86),
        "turf_in": (31, 72, 115),
        "pond_bed": (3, 13, 26),
        "pond_stops": [(2, 132, 199), (3, 105, 161), (7, 89, 133), (12, 74, 110), (8, 47, 73)],
        "refl_halo": (14, 165, 233, 76),
        "refl_mid": (245, 158, 11, 82),
        "refl_core": (253, 224, 71, 102),
        "props": ["meteor", "pine", "crystal", "comet_lamp"],
        "accent": (249, 115, 22),
        "pad_style": "lotus",
        "fauna": "Comet Salmon & Meteor Dart",
    },
    {
        "id": "region_saturn_rings",
        "name": "Saturn's Ringwater",
        "subtitle": "Crystalline Planetary Rings",
        "sky_top": (10, 8, 20),
        "sky_bot": (26, 19, 6),
        "celestial_type": "saturn",
        "cliff_drop": (8, 6, 15),
        "cliff_mid": (30, 28, 46),
        "cliff_hi": (51, 47, 74),
        "turf_out": (24, 27, 48),
        "turf_mid": (35, 41, 71),
        "turf_in": (49, 58, 99),
        "pond_bed": (8, 12, 23),
        "pond_stops": [(30, 58, 138), (23, 37, 84), (30, 41, 59), (15, 23, 42), (2, 6, 23)],
        "refl_halo": (250, 204, 21, 62),
        "refl_mid": (96, 165, 250, 82),
        "refl_core": (224, 242, 254, 108),
        "props": ["ice_spire", "ice_cluster", "crystal", "frost_lamp"],
        "accent": (250, 204, 21),
        "pad_style": "ice",
        "fauna": "Crystalline Ice Koi & Prism Fin",
    },
    {
        "id": "region_aurora_deep",
        "name": "Aurora Deep",
        "subtitle": "Abyss of Shifting Curtains",
        "sky_top": (2, 14, 13),
        "sky_bot": (4, 31, 26),
        "celestial_type": "aurora",
        "cliff_drop": (2, 10, 7),
        "cliff_mid": (6, 36, 26),
        "cliff_hi": (10, 61, 44),
        "turf_out": (8, 38, 28),
        "turf_mid": (12, 56, 41),
        "turf_in": (18, 77, 57),
        "pond_bed": (2, 18, 14),
        "pond_stops": [(6, 95, 70), (4, 120, 87), (15, 118, 110), (19, 78, 74), (4, 47, 46)],
        "refl_halo": (16, 185, 129, 82),
        "refl_mid": (45, 212, 191, 96),
        "refl_core": (167, 243, 208, 112),
        "props": ["abyssal_spire", "willow", "alien_mushroom", "aurora_lamp"],
        "accent": (52, 211, 153),
        "pad_style": "phantom",
        "fauna": "Aurora Ghost Koi & Specter",
    },
    {
        "id": "region_eclipse_well",
        "name": "Eclipse Well",
        "subtitle": "Ancient Celestial Singularity",
        "sky_top": (3, 2, 6),
        "sky_bot": (10, 6, 20),
        "celestial_type": "eclipse",
        "cliff_drop": (3, 2, 6),
        "cliff_mid": (18, 13, 31),
        "cliff_hi": (34, 25, 59),
        "turf_out": (18, 11, 36),
        "turf_mid": (28, 18, 56),
        "turf_in": (41, 27, 82),
        "pond_bed": (5, 2, 10),
        "pond_stops": [(59, 7, 100), (46, 16, 101), (30, 27, 75), (15, 7, 40), (3, 1, 10)],
        "refl_halo": (245, 158, 11, 86),
        "refl_mid": (251, 191, 36, 102),
        "refl_core": (254, 240, 138, 122),
        "props": ["eclipse_pillar", "void_monolith", "crystal", "eclipse_lamp"],
        "accent": (251, 191, 36),
        "pad_style": "ancient_gold",
        "fauna": "Solar Corona Dragon & Void Serpent",
    }
]

def render_world_image(world, w=800, h=600):
    img = Image.new('RGBA', (w, h), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    cx, cy = w // 2, int(h * 0.52)
    rx_island, ry_island = 300, 250
    rx_pond, ry_pond = 135, 115

    # 1. Sky Gradient
    for y in range(h):
        t = y / float(h)
        r = int(world["sky_top"][0] * (1 - t) + world["sky_bot"][0] * t)
        g = int(world["sky_top"][1] * (1 - t) + world["sky_bot"][1] * t)
        b = int(world["sky_top"][2] * (1 - t) + world["sky_bot"][2] * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # 2. Distant Stars
    random.seed(42 + hash(world["id"]))
    for _ in range(110):
        sx = random.randint(0, w)
        sy = random.randint(0, int(h * 0.75))
        sz = 2 if random.random() > 0.8 else 1
        alpha = random.randint(100, 255)
        draw.rectangle([sx, sy, sx + sz - 1, sy + sz - 1], fill=(255, 255, 255, alpha))

    # 3. Celestial Sky Feature
    ctype = world["celestial_type"]
    if ctype == "moon":
        mx, my = int(w * 0.75), 80
        # Glow
        for rad in range(60, 10, -5):
            draw.ellipse([mx - rad, my - rad, mx + rad, my + rad], fill=(254, 240, 138, int(20 * (1 - rad / 60.0))))
        # Crescent
        draw.ellipse([mx - 24, my - 24, mx + 24, my + 24], fill=(254, 240, 138, 255))
        draw.ellipse([mx - 15, my - 28, mx + 30, my + 20], fill=world["sky_top"] + (255,))

    elif ctype == "nebula":
        # Swirling dual core
        nx, ny = int(w * 0.5), 110
        for rad in range(180, 20, -10):
            draw.ellipse([nx - rad - 20, ny - int(rad * 0.6), nx + rad - 20, ny + int(rad * 0.6)], fill=(217, 70, 239, int(35 * (1 - rad / 180.0))))
            draw.ellipse([nx - rad + 30, ny - int(rad * 0.5) + 15, nx + rad + 30, ny + int(rad * 0.5) + 15], fill=(34, 211, 238, int(40 * (1 - rad / 180.0))))
        # Swimming manta
        draw.ellipse([nx + 80, 95, nx + 130, 115], fill=(6, 182, 212, 140))
        draw.polygon([(nx + 80, 105), (nx + 105, 85), (nx + 120, 105)], fill=(232, 121, 249, 120))

    elif ctype == "waterfall":
        # Vertical Starlight Waterfalls
        for fx in [int(w * 0.2), int(w * 0.5), int(w * 0.8)]:
            for step in range(25):
                alpha = int(70 * (1 - step / 25.0))
                draw.rectangle([fx - 14, step * 14, fx + 14, step * 14 + 14], fill=(56, 189, 248, alpha))
            draw.line([(fx, 0), (fx, 340)], fill=(255, 255, 255, 180), width=2)
        # Streaking Comets
        draw.line([(80, 30), (320, 210)], fill=(255, 255, 255, 230), width=3)
        draw.line([(320, 210), (360, 240)], fill=(249, 115, 22, 160), width=2)
        draw.rectangle([318, 208, 323, 213], fill=(255, 255, 255, 255))
        draw.line([(420, 20), (640, 180)], fill=(253, 224, 71, 200), width=2)

    elif ctype == "saturn":
        sx, sy = int(w * 0.68), 115
        prad = 62
        # Outer Ring Back
        draw.arc([sx - prad * 2.4, sy - int(prad * 0.62), sx + prad * 2.4, sy + int(prad * 0.62)], 180, 360, fill=(253, 224, 71, 160), width=14)
        draw.arc([sx - prad * 1.8, sy - int(prad * 0.46), sx + prad * 1.8, sy + int(prad * 0.46)], 180, 360, fill=(245, 158, 11, 200), width=16)
        # Planet Sphere
        draw.ellipse([sx - prad, sy - prad, sx + prad, sy + prad], fill=(180, 83, 9, 255))
        # Atmospheric bands
        draw.rectangle([sx - prad, sy - 20, sx + prad, sy - 6], fill=(245, 158, 11, 255))
        draw.rectangle([sx - prad, sy - 6, sx + prad, sy + 8], fill=(254, 240, 138, 255))
        draw.rectangle([sx - prad, sy + 8, sx + prad, sy + 22], fill=(217, 119, 6, 255))
        # Outer Ring Front
        draw.arc([sx - prad * 2.4, sy - int(prad * 0.62), sx + prad * 2.4, sy + int(prad * 0.62)], 0, 180, fill=(253, 224, 71, 190), width=14)
        draw.arc([sx - prad * 1.8, sy - int(prad * 0.46), sx + prad * 1.8, sy + int(prad * 0.46)], 0, 180, fill=(245, 158, 11, 230), width=16)
        # Moonlet
        draw.ellipse([sx - 110, sy + 38, sx - 102, sy + 46], fill=(254, 240, 138, 255))

    elif ctype == "aurora":
        # Multi-layer wavy curtains
        for idx, (col, ybase, amp) in enumerate([
            ((16, 185, 129, 90), 40, 35),
            ((45, 212, 191, 80), 65, 28),
            ((139, 92, 246, 75), 35, 32),
            ((52, 211, 153, 95), 90, 24)
        ]):
            points = [(0, 0)]
            for x in range(0, w + 30, 25):
                y = int(ybase + math.sin(x * 0.012 + idx * 1.5) * amp)
                points.append((x, y))
            points.append((w, 0))
            draw.polygon(points, fill=col)

    elif ctype == "eclipse":
        ex, ey = int(w * 0.5), 110
        erad = 44
        # Gravitational distortion rings
        for r_ring in [65, 95, 125]:
            draw.ellipse([ex - r_ring, ey - r_ring, ex + r_ring, ey + r_ring], outline=(168, 85, 247, 60), width=2)
        # Solar Corona flare
        for rad in range(120, erad, -6):
            draw.ellipse([ex - rad, ey - rad, ex + rad, ey + rad], fill=(251, 191, 36, int(35 * (1 - (rad - erad) / 80.0))))
        # Solar prominences
        for a in [0.4, 1.2, 2.1, 3.5, 4.3, 5.2]:
            fx1 = ex + math.cos(a) * erad
            fy1 = ey + math.sin(a) * erad
            fx2 = ex + math.cos(a) * (erad + 18)
            fy2 = ey + math.sin(a) * (erad + 18)
            draw.line([(fx1, fy1), (fx2, fy2)], fill=(253, 224, 71, 255), width=3)
        # Black Hole / Obsidian Moon Disc
        draw.ellipse([ex - erad, ey - erad, ex + erad, ey + erad], fill=(3, 2, 6, 255))
        draw.ellipse([ex - erad, ey - erad, ex + erad, ey + erad], outline=(255, 255, 255, 200), width=1)

    # 4. Island Cliff Base & Steps
    draw.ellipse([cx - rx_island - 10, cy - ry_island + 16, cx + rx_island + 10, cy + ry_island + 28], fill=world["cliff_drop"] + (255,))
    draw.ellipse([cx - rx_island - 2, cy - ry_island + 10, cx + rx_island + 2, cy + ry_island + 16], fill=world["cliff_mid"] + (255,))
    draw.ellipse([cx - rx_island, cy - ry_island + 4, cx + rx_island, cy + ry_island + 6], fill=world["cliff_hi"] + (255,))

    # Island Top Turf (Multi-Toned Ground)
    draw.ellipse([cx - rx_island, cy - ry_island, cx + rx_island, cy + ry_island], fill=world["turf_out"] + (255,))
    draw.ellipse([cx - int(rx_island * 0.88), cy - int(ry_island * 0.88), cx + int(rx_island * 0.88), cy + int(ry_island * 0.88)], fill=world["turf_mid"] + (255,))
    draw.ellipse([cx - int(rx_island * 0.65), cy - int(ry_island * 0.65), cx + int(rx_island * 0.65), cy + int(ry_island * 0.65)], fill=world["turf_in"] + (255,))

    # Stepping Cobblestone Ring
    for i in range(64):
        angle = (i / 64) * math.pi * 2
        dist = 1.14 + (math.sin(i * 4) * 0.03)
        sx = cx + math.cos(angle) * rx_pond * dist
        sy = cy + math.sin(angle) * ry_pond * dist
        draw.rectangle([sx - 3, sy - 2, sx + 3, sy + 2], fill=(world["cliff_hi"][0] + 15, world["cliff_hi"][1] + 15, world["cliff_hi"][2] + 25, 255))

    # Stepping stone branches
    station_pos = [(205, -70), (-205, -70), (-195, 95), (0, -95), (195, 95), (0, -165)]
    for stx, sty in station_pos:
        for s in range(1, 10):
            t = s / 10.0
            bx = cx + stx * t + math.sin(s * 2) * 3
            by = cy + sty * t + math.cos(s * 2) * 3
            if math.hypot((bx - cx) / rx_pond, (by - cy) / ry_pond) > 1.08:
                draw.rectangle([bx - 3, by - 2, bx + 3, by + 2], fill=(world["cliff_hi"][0] + 15, world["cliff_hi"][1] + 15, world["cliff_hi"][2] + 25, 255))

    # 5. Starpond Sunken Embankment & Water Surface
    draw.ellipse([cx - rx_pond - 6, cy - ry_pond - 4, cx + rx_pond + 6, cy + ry_pond + 14], fill=world["cliff_drop"] + (255,))
    draw.ellipse([cx - rx_pond, cy - ry_pond, cx + rx_pond, cy + ry_pond], fill=world["pond_bed"] + (255,))

    # Water gradient stops
    stops = world["pond_stops"]
    scales = [0.94, 0.76, 0.56, 0.38, 0.22]
    for idx, (r, g, b) in enumerate(stops):
        sc = scales[idx]
        draw.ellipse([cx - int(rx_pond * sc), cy - int(ry_pond * sc), cx + int(rx_pond * sc), cy + int(ry_pond * sc)], fill=(r, g, b, 255))

    # Sky Clearing Reflection in Water
    draw.ellipse([cx - 50, cy - 10, cx + 50, cy + 50], fill=world["refl_halo"])
    draw.ellipse([cx - 36, cy, cx + 36, cy + 42], fill=world["refl_mid"])
    draw.ellipse([cx - 24, cy + 8, cx + 24, cy + 34], fill=world["refl_core"])

    # 4 Cardinal Wooden Fishing Piers
    # South
    draw.rectangle([cx - 14, cy + ry_pond - 6, cx + 14, cy + ry_pond + 32], fill=(107, 68, 35, 255))
    draw.rectangle([cx + 10, cy + ry_pond + 16, cx + 14, cy + ry_pond + 30], fill=(45, 24, 16, 255))
    draw.ellipse([cx + 6, cy + ry_pond + 12, cx + 18, cy + ry_pond + 24], fill=world["accent"] + (90,))
    # North
    draw.rectangle([cx - 14, cy - ry_pond - 32, cx + 14, cy - ry_pond + 6], fill=(107, 68, 35, 255))
    # East
    draw.rectangle([cx + rx_pond - 6, cy - 14, cx + rx_pond + 32, cy + 14], fill=(107, 68, 35, 255))
    # West
    draw.rectangle([cx - rx_pond - 32, cy - 14, cx - rx_pond + 6, cy + 14], fill=(107, 68, 35, 255))

    # Swimming Fauna in Pond
    kx, ky = cx + 45, cy + 24
    draw.ellipse([kx - 9, ky + 4, kx + 9, ky + 10], fill=(2, 6, 16, 120))
    draw.ellipse([kx - 11, ky - 5, kx + 11, ky + 5], fill=world["accent"] + (255,))
    draw.ellipse([kx - 6, ky - 2, kx + 6, ky + 2], fill=(255, 255, 255, 220))

    kx2, ky2 = cx - 55, cy - 18
    draw.ellipse([kx2 - 7, ky2 + 3, kx2 + 7, ky2 + 8], fill=(2, 6, 16, 110))
    draw.ellipse([kx2 - 10, ky2 - 4, kx2 + 10, ky2 + 4], fill=(254, 240, 138, 255))

    # Themed Water Surface Debris / Pads
    pstyle = world["pad_style"]
    pad_positions = [(-75, -50), (-85, 38), (68, 18), (38, 52)]
    for px, py in pad_positions:
        p_x, p_y = cx + px, cy + py
        if pstyle == "lotus":
            draw.ellipse([p_x - 10, p_y - 8, p_x + 10, p_y + 8], fill=(5, 150, 105, 255))
            draw.ellipse([p_x - 4, p_y - 4, p_x + 4, p_y + 4], fill=(244, 114, 182, 255))
        elif pstyle == "coral":
            draw.ellipse([p_x - 10, p_y - 8, p_x + 10, p_y + 8], fill=(14, 116, 144, 255))
            draw.ellipse([p_x - 4, p_y - 4, p_x + 4, p_y + 4], fill=(232, 121, 249, 255))
        elif pstyle == "ice":
            draw.polygon([(p_x - 10, p_y), (p_x - 4, p_y - 8), (p_x + 8, p_y - 6), (p_x + 10, p_y + 4), (p_x, p_y + 8)], fill=(186, 230, 253, 255))
            draw.polygon([(p_x - 6, p_y), (p_x - 2, p_y - 5), (p_x + 5, p_y - 3), (p_x + 6, p_y + 2)], fill=(240, 249, 255, 255))
        elif pstyle == "phantom":
            draw.ellipse([p_x - 10, p_y - 8, p_x + 10, p_y + 8], fill=(4, 120, 87, 255))
            draw.ellipse([p_x - 4, p_y - 4, p_x + 4, p_y + 4], fill=(167, 243, 208, 255))
        elif pstyle == "ancient_gold":
            draw.ellipse([p_x - 9, p_y - 7, p_x + 9, p_y + 7], fill=(245, 158, 11, 255))
            draw.ellipse([p_x - 5, p_y - 4, p_x + 5, p_y + 4], fill=(254, 240, 138, 255))
            draw.ellipse([p_x - 2, p_y - 2, p_x + 2, p_y + 2], fill=(6, 4, 11, 255))

    # 6. Handcrafted Themed World Props
    prop_coords = [
        (-140, -150), (140, -150), (-170, 50), (180, 50), (-70, 195), (70, 195),
        (-225, 10), (225, 10), (-240, -80), (240, -80)
    ]

    for idx, (tx, ty) in enumerate(prop_coords):
        px, py = cx + tx, cy + ty
        ptype = world["props"][idx % len(world["props"])]

        # Shadow
        draw.ellipse([px - 14, py + 8, px + 14, py + 14], fill=(5, 3, 12, 100))

        if ptype == "sakura":
            # Trunk
            draw.rectangle([px - 4, py - 18, px + 4, py + 10], fill=(45, 24, 16, 255))
            # Blossom Crown
            draw.ellipse([px - 22, py - 52, px + 22, py - 12], fill=(168, 22, 94, 255))
            draw.ellipse([px - 18, py - 48, px + 18, py - 16], fill=(244, 63, 94, 255))
            draw.ellipse([px - 12, py - 44, px + 12, py - 20], fill=(252, 231, 243, 255))
        elif ptype == "willow":
            draw.rectangle([px - 4, py - 18, px + 4, py + 10], fill=(28, 25, 23, 255))
            draw.ellipse([px - 26, py - 48, px + 26, py - 14], fill=(4, 120, 87, 255))
            for vx in range(px - 20, px + 24, 6):
                draw.line([(vx, py - 20), (vx, py + 4)], fill=(52, 211, 153, 255), width=2)
        elif ptype == "pine":
            draw.rectangle([px - 3, py - 12, px + 3, py + 10], fill=(28, 25, 23, 255))
            draw.polygon([(px - 18, py - 10), (px, py - 38), (px + 18, py - 10)], fill=(14, 116, 144, 255))
            draw.polygon([(px - 14, py - 22), (px, py - 46), (px + 14, py - 22)], fill=(6, 182, 212, 255))
        elif ptype == "coral":
            # Branching cyan/magenta coral
            draw.rectangle([px - 4, py - 16, px + 4, py + 8], fill=(59, 7, 100, 255))
            draw.rectangle([px - 16, py - 36, px - 6, py - 16], fill=(6, 182, 212, 255))
            draw.rectangle([px + 6, py - 40, px + 16, py - 14], fill=(192, 38, 211, 255))
            draw.rectangle([px - 8, py - 48, px + 8, py - 20], fill=(34, 211, 238, 255))
            draw.rectangle([px - 2, py - 52, px + 4, py - 46], fill=(253, 244, 255, 255))
        elif ptype == "alien_mushroom":
            draw.rectangle([px - 3, py - 14, px + 3, py + 8], fill=(30, 41, 59, 255))
            draw.ellipse([px - 18, py - 36, px + 18, py - 12], fill=(2, 132, 199, 255))
            draw.ellipse([px - 14, py - 34, px + 14, py - 16], fill=(56, 189, 248, 255))
            draw.rectangle([px - 4, py - 28, px + 4, py - 22], fill=(240, 171, 252, 255))
        elif ptype == "meteor":
            # Jagged basalt shard
            draw.polygon([(px - 16, py + 8), (px - 6, py - 44), (px + 8, py - 48), (px + 18, py + 8)], fill=(15, 23, 42, 255))
            draw.polygon([(px - 10, py + 6), (px - 2, py - 38), (px + 10, py + 6)], fill=(30, 41, 59, 255))
            # Magma veins
            draw.line([(px - 2, py - 30), (px + 2, py)], fill=(245, 158, 11, 255), width=2)
            draw.line([(px - 2, py - 20), (px, py - 6)], fill=(254, 240, 138, 255), width=1)
        elif ptype == "ice_spire":
            # Sharp ice spire
            draw.polygon([(px - 14, py + 8), (px, py - 52), (px + 14, py + 8)], fill=(2, 132, 199, 255))
            draw.polygon([(px - 6, py + 6), (px, py - 48), (px + 8, py + 6)], fill=(56, 189, 248, 255))
            draw.line([(px, py - 48), (px, py + 4)], fill=(224, 242, 254, 255), width=2)
        elif ptype == "ice_cluster":
            draw.polygon([(px - 12, py + 6), (px - 4, py - 26), (px + 4, py + 6)], fill=(3, 105, 161, 255))
            draw.polygon([(px - 2, py + 6), (px + 6, py - 32), (px + 14, py + 6)], fill=(56, 189, 248, 255))
        elif ptype == "abyssal_spire":
            # Ancient megalith with glowing moss
            draw.rectangle([px - 12, py - 44, px + 12, py + 8], fill=(6, 36, 26, 255))
            draw.line([(px - 6, py - 36), (px - 6, py + 2)], fill=(16, 185, 129, 255), width=3)
            draw.rectangle([px, py - 28, px + 6, py - 22], fill=(52, 211, 153, 255))
            draw.rectangle([px - 2, py - 52, px + 2, py - 48], fill=(167, 243, 208, 255))
        elif ptype == "eclipse_pillar":
            # Black obsidian pillar with gold runes
            draw.rectangle([px - 12, py - 48, px + 12, py + 8], fill=(22, 15, 38, 255))
            draw.rectangle([px - 14, py - 52, px + 14, py - 46], fill=(6, 4, 11, 255))
            draw.rectangle([px - 14, py + 4, px + 14, py + 10], fill=(6, 4, 11, 255))
            draw.line([(px, py - 38), (px, py)], fill=(245, 158, 11, 255), width=2)
            draw.rectangle([px - 3, py - 30, px + 3, py - 24], fill=(254, 240, 138, 255))
        elif ptype == "void_monolith":
            draw.polygon([(px - 14, py + 4), (px - 8, py - 40), (px + 8, py - 40), (px + 14, py + 4)], fill=(28, 19, 48, 255))
            draw.rectangle([px - 4, py - 28, px + 4, py - 12], fill=(245, 158, 11, 255))
        elif "lamp" in ptype:
            draw.rectangle([px - 3, py - 14, px + 3, py + 8], fill=(71, 85, 105, 255))
            draw.ellipse([px - 8, py - 20, px + 8, py - 4], fill=world["accent"] + (180,))
            draw.rectangle([px - 2, py - 14, px + 2, py - 8], fill=(255, 255, 255, 255))
        elif ptype == "crystal":
            draw.polygon([(px - 8, py + 6), (px, py - 24), (px + 8, py + 6)], fill=(2, 132, 199, 255))
            draw.polygon([(px - 3, py + 4), (px, py - 20), (px + 5, py + 4)], fill=(125, 211, 252, 255))

    # 7. Player Cat on South Pier
    cat_x, cat_y = cx, cy + ry_pond + 8
    # Cat Shadow
    draw.ellipse([cat_x - 10, cat_y + 4, cat_x + 10, cat_y + 9], fill=(5, 3, 12, 140))
    # Body
    draw.ellipse([cat_x - 9, cat_y - 10, cat_x + 9, cat_y + 6], fill=(254, 243, 199, 255)) # Ivory fur
    draw.ellipse([cat_x - 6, cat_y - 6, cat_x + 8, cat_y + 4], fill=(249, 115, 22, 255)) # Calico orange patch
    # Head & Ears
    draw.ellipse([cat_x - 7, cat_y - 18, cat_x + 7, cat_y - 8], fill=(254, 243, 199, 255))
    draw.polygon([(cat_x - 7, cat_y - 16), (cat_x - 5, cat_y - 23), (cat_x - 2, cat_y - 16)], fill=(244, 63, 94, 255))
    draw.polygon([(cat_x + 2, cat_y - 16), (cat_x + 5, cat_y - 23), (cat_x + 7, cat_y - 16)], fill=(249, 115, 22, 255))
    # Scarf & Bell
    draw.rectangle([cat_x - 6, cat_y - 10, cat_x + 6, cat_y - 7], fill=(244, 63, 94, 255))
    draw.ellipse([cat_x - 2, cat_y - 8, cat_x + 2, cat_y - 4], fill=(254, 240, 138, 255))

    # Fishing Rod & Line Cast into Starpond
    rod_tip_x = cat_x - 18
    rod_tip_y = cat_y - 28
    draw.line([(cat_x - 3, cat_y - 4), (rod_tip_x, rod_tip_y)], fill=(180, 83, 9, 255), width=2) # Rod
    draw.line([(rod_tip_x, rod_tip_y), (cx + 8, cy + 40)], fill=world["accent"] + (220,), width=1) # Line
    # Bobber in Pond
    draw.ellipse([cx + 6, cy + 38, cx + 12, cy + 44], fill=(245, 158, 11, 255))
    draw.ellipse([cx + 7, cy + 39, cx + 11, cy + 43], fill=(254, 240, 138, 255))
    draw.ellipse([cx + 2, cy + 36, cx + 16, cy + 46], outline=world["accent"] + (180,), width=1) # Ripple

    # 8. HUD & World Title Overlay
    # Top Left Level Pill
    draw.rectangle([16, 16, 120, 44], fill=(12, 10, 32, 230), outline=(56, 189, 248, 180), width=1)
    draw.rectangle([20, 20, 40, 40], fill=(245, 158, 11, 255))
    # Bottom Left World Banner Pill
    draw.rectangle([16, h - 54, 260, h - 16], fill=(12, 10, 32, 230), outline=world["accent"] + (180,), width=1)
    
    # Text labels
    # Use default bitmap font
    font = ImageFont.load_default()
    draw.text((46, 26), f"LV.35  EXP", fill=(255, 255, 255, 255), font=font)
    draw.text((26, h - 46), f"MAP: {world['name'].upper()}", fill=world["accent"] + (255,), font=font)
    draw.text((26, h - 32), f"{world['subtitle']}", fill=(203, 213, 225, 255), font=font)

    # Top Right Currency Pill
    draw.rectangle([w - 180, 16, w - 16, 44], fill=(12, 10, 32, 230), outline=(56, 189, 248, 180), width=1)
    draw.text((w - 170, 26), f"* 25,000 STARDUST", fill=(254, 240, 138, 255), font=font)

    return img

def main():
    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    rendered_images = []

    # 1. Render all 6 individual world preview images
    for idx, world in enumerate(WORLDS):
        img = render_world_image(world)
        filename = f"world_{idx}_{world['id']}_preview.png"
        filepath = os.path.join(ARTIFACT_DIR, filename)
        img.save(filepath)
        rendered_images.append((world, img, filepath))
        print(f"Rendered: {filename}")

    # 2. Render 6-World Comparison Showcase (3 cols x 2 rows composite)
    comp_w, comp_h = 1200, 900
    comp = Image.new('RGBA', (comp_w, comp_h), (8, 6, 20, 255))
    draw_comp = ImageDraw.Draw(comp)
    font = ImageFont.load_default()

    # Title header
    draw_comp.rectangle([0, 0, comp_w, 54], fill=(15, 12, 38, 255))
    draw_comp.text((24, 18), "WISH ME CAT: PURRSEIDS -- ALL 6 HANDCRAFTED WORLD ENVIRONMENTS SHOWCASE", fill=(254, 240, 138, 255), font=font)

    thumb_w, thumb_h = 380, 260
    for idx, (world, img, _) in enumerate(rendered_images):
        row = idx // 3
        col = idx % 3
        x = 20 + col * 395
        y = 70 + row * 400

        thumb = img.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        # Border
        draw_comp.rectangle([x - 2, y - 2, x + thumb_w + 2, y + thumb_h + 2], outline=world["accent"] + (255,), width=2)
        comp.paste(thumb, (x, y))

        # Card Footer Details
        draw_comp.rectangle([x, y + thumb_h + 4, x + thumb_w, y + thumb_h + 100], fill=(14, 11, 32, 255), outline=(40, 32, 70, 255))
        draw_comp.text((x + 8, y + thumb_h + 10), f"WORLD {idx}: {world['name'].upper()}", fill=world["accent"] + (255,), font=font)
        draw_comp.text((x + 8, y + thumb_h + 26), f"Theme: {world['subtitle']}", fill=(248, 250, 252, 255), font=font)
        draw_comp.text((x + 8, y + thumb_h + 42), f"Fauna: {world['fauna']}", fill=(148, 163, 184, 255), font=font)
        draw_comp.text((x + 8, y + thumb_h + 58), f"Props: {', '.join(world['props'][:3]).title()}", fill=(203, 213, 225, 255), font=font)
        draw_comp.text((x + 8, y + thumb_h + 74), f"Celestial: {world['celestial_type'].title()} Focus", fill=(254, 240, 138, 255), font=font)

    comp_path = os.path.join(ARTIFACT_DIR, "worlds_all_6_comparison.png")
    comp.save(comp_path)
    print(f"Rendered composite showcase: {comp_path}")

    # 3. Render RegionModal Travel Gateway Preview
    modal_w, modal_h = 800, 600
    modal_img = Image.new('RGBA', (modal_w, modal_h), (5, 3, 15, 220))
    d_m = ImageDraw.Draw(modal_img)

    # Modal Box
    bx, by, bw, bh = 40, 30, 720, 540
    d_m.rectangle([bx, by, bx + bw, by + bh], fill=(12, 10, 32, 255), outline=(56, 189, 248, 255), width=2)

    # Header
    d_m.rectangle([bx + 2, by + 2, bx + bw - 2, by + 46], fill=(22, 18, 54, 255))
    d_m.text((bx + 18, by + 16), "[*] COSMIC REALM GATEWAY -- WORLD SELECTION", fill=(254, 240, 138, 255), font=font)
    d_m.rectangle([bx + bw - 36, by + 12, bx + bw - 14, by + 34], fill=(244, 63, 94, 255))
    d_m.text((bx + bw - 28, by + 18), "X", fill=(255, 255, 255, 255), font=font)

    # 6 Region Cards inside Modal Grid (2 cols x 3 rows)
    grid_w = 340
    grid_h = 145
    for idx, world in enumerate(WORLDS):
        r = idx // 2
        c = idx % 2
        gx = bx + 16 + c * (grid_w + 12)
        gy = by + 56 + r * (grid_h + 12)

        is_current = (idx == 0)
        border_col = world["accent"] if is_current else (75, 54, 110)
        d_m.rectangle([gx, gy, gx + grid_w, gy + grid_h], fill=(18, 14, 44, 255), outline=border_col + (255,), width=2)

        # Mini Sky Banner
        d_m.rectangle([gx + 2, gy + 2, gx + grid_w - 2, gy + 42], fill=world["sky_bot"] + (255,))
        d_m.text((gx + 10, gy + 8), f"{world['name'].upper()}", fill=(255, 255, 255, 255), font=font)
        d_m.text((gx + 10, gy + 24), f"{world['subtitle']}", fill=world["accent"] + (255,), font=font)

        badge_bg = (2, 132, 199, 255) if is_current else (5, 150, 105, 255)
        badge_txt = "ACTIVE" if is_current else "UNLOCKED"
        d_m.rectangle([gx + grid_w - 74, gy + 8, gx + grid_w - 8, gy + 28], fill=badge_bg)
        d_m.text((gx + grid_w - 68, gy + 14), badge_txt, fill=(255, 255, 255, 255), font=font)

        # Details
        d_m.text((gx + 10, gy + 52), f"Fauna: {world['fauna']}", fill=(148, 163, 184, 255), font=font)
        d_m.text((gx + 10, gy + 68), f"Biome: {world['celestial_type'].title()} Horizon", fill=(203, 213, 225, 255), font=font)

        # Action Button
        btn_x = gx + grid_w - 110
        btn_y = gy + 96
        if is_current:
            d_m.rectangle([btn_x, btn_y, btn_x + 98, btn_y + 32], fill=(40, 50, 80, 255), outline=(56, 189, 248, 255))
            d_m.text((btn_x + 8, btn_y + 10), "CURRENT", fill=(203, 213, 225, 255), font=font)
        else:
            d_m.rectangle([btn_x, btn_y, btn_x + 98, btn_y + 32], fill=(2, 132, 199, 255))
            d_m.text((btn_x + 12, btn_y + 10), "+ TRAVEL +", fill=(255, 255, 255, 255), font=font)

        d_m.text((gx + 10, gy + 106), "REQ: UNLOCKED", fill=(52, 211, 153, 255), font=font)

    modal_path = os.path.join(ARTIFACT_DIR, "region_modal_travel_gateway_preview.png")
    modal_img.save(modal_path)
    print(f"Rendered modal preview: {modal_path}")

if __name__ == '__main__':
    main()
