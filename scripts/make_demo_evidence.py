from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


OUT = Path(__file__).resolve().parents[1] / "demo" / "evidence"
OUT.mkdir(parents=True, exist_ok=True)


def display_scene(*, crack_main: bool, crack_corner: bool = False) -> Image.Image:
    image = Image.new("RGB", (768, 512), "#ece9f2")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 382, 768, 512), fill="#c9c2d4")
    draw.rounded_rectangle((92, 112, 676, 386), radius=24, fill="#2f3140", outline="#171823", width=10)
    draw.rectangle((122, 143, 646, 354), fill="#dce8f4")
    draw.rectangle((345, 386, 423, 420), fill="#3a3b49")
    draw.rounded_rectangle((287, 414, 481, 438), radius=10, fill="#4a4b59")
    if crack_main:
        draw.line([(388, 145), (356, 205), (401, 257), (374, 352)], fill="#3b3d4b", width=8)
        draw.line([(356, 205), (304, 182), (273, 160)], fill="#3b3d4b", width=5)
        draw.line([(401, 257), (465, 220), (505, 184)], fill="#3b3d4b", width=5)
    if crack_corner:
        draw.line([(124, 302), (165, 278), (199, 296), (230, 271)], fill="#3b3d4b", width=6)
    return image


def save(name: str, image: Image.Image) -> None:
    image.save(OUT / f"{name}.png", format="PNG", optimize=True)


# Case A: the documented screen crack is visibly absent after the work.
save("satisfied-baseline", display_scene(crack_main=True))
save("satisfied-completion", display_scene(crack_main=False))

# Case B: the documented defect materially remains.
save("not-satisfied-baseline", display_scene(crack_main=True))
save("not-satisfied-completion", display_scene(crack_main=True))

# Case C: the later image is too obstructed/blurred for a reliable determination.
inconclusive_base = display_scene(crack_main=True)
save("inconclusive-baseline", inconclusive_base)
blurred = inconclusive_base.crop((250, 120, 520, 350)).resize((768, 512)).filter(ImageFilter.GaussianBlur(14))
overlay = Image.new("RGBA", blurred.size, (30, 30, 40, 90))
save("inconclusive-completion", Image.alpha_composite(blurred.convert("RGBA"), overlay).convert("RGB"))

# Case D: substantial work is visible, but a material crack remains at the lower-left edge.
save("partially-satisfied-baseline", display_scene(crack_main=True, crack_corner=True))
save("partially-satisfied-completion", display_scene(crack_main=False, crack_corner=True))
