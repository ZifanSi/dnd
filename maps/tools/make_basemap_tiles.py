"""Cut the high-res Sword Coast map into GPU-friendly basemap textures.

Outputs (in maps/assets/basemap/):
  overview.jpg        - small whole-map texture, loaded first so something shows immediately
  tile_r{row}_c{col}.jpg - COLS x ROWS detail tiles, each at most TILE_PX wide, so no single
                        texture exceeds limits that older/mobile GPUs enforce

Run from anywhere:  python maps/tools/make_basemap_tiles.py
"""
import os
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "Sword-Coast-Map_HighRes.jpg")
OUT = os.path.join(HERE, "..", "assets", "basemap")

COLS, ROWS = 4, 3
TILE_PX = 2048
OVERVIEW_PX = 2048
QUALITY = 82


def main():
    os.makedirs(OUT, exist_ok=True)
    im = Image.open(SRC).convert("RGB")
    W, H = im.size
    print("source", W, H)

    ov = im.resize((OVERVIEW_PX, round(OVERVIEW_PX * H / W)), Image.LANCZOS)
    ov.save(os.path.join(OUT, "overview.jpg"), quality=QUALITY, optimize=True)

    for r in range(ROWS):
        for c in range(COLS):
            x0, x1 = round(c * W / COLS), round((c + 1) * W / COLS)
            y0, y1 = round(r * H / ROWS), round((r + 1) * H / ROWS)
            tile = im.crop((x0, y0, x1, y1))
            scale = TILE_PX / tile.width
            tile = tile.resize((TILE_PX, round(tile.height * scale)), Image.LANCZOS)
            tile.save(os.path.join(OUT, f"tile_r{r}_c{c}.jpg"), quality=QUALITY, optimize=True)
    print("done")


if __name__ == "__main__":
    main()
