from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


OUT = Path(__file__).resolve().parents[1] / "demo" / "evidence"
OUT.mkdir(parents=True, exist_ok=True)


def room_item(kind: str, damaged: bool = False) -> Image.Image:
    image = Image.new("RGB", (768, 512), "#e9e5df")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 370, 768, 512), fill="#c8b8a5")
    draw.rectangle((90, 205, 660, 370), fill="#637087" if kind == "screen" else "#8d735a")
    draw.rectangle((118, 232, 632, 344), fill="#d8dce1" if kind == "screen" else "#b19473")
    if kind == "screen":
        draw.rectangle((90, 205, 660, 370), outline="#343942", width=12)
        if damaged:
            draw.line([(387, 212), (360, 273), (405, 299), (379, 368)], fill="#3b414a", width=7)
            draw.line([(360, 273), (319, 254), (290, 230)], fill="#3b414a", width=5)
            draw.line([(405, 299), (464, 276), (508, 245)], fill="#3b414a", width=5)
            draw.line([(405, 299), (440, 327), (482, 342)], fill="#3b414a", width=5)
    else:
        draw.ellipse((235, 235, 270, 270), fill="#ddd0bd")
        if damaged:
            draw.line([(145, 241), (218, 262), (281, 248), (352, 277)], fill="#4b392f", width=8)
            draw.line([(218, 262), (238, 315), (286, 338)], fill="#4b392f", width=6)
    return image


def save(name: str, image: Image.Image) -> None:
    image.save(OUT / f"{name}.png", format="PNG", optimize=True)


unchanged = room_item("table")
save("unchanged-baseline", unchanged)
save("unchanged-checkout", unchanged.copy())

wear_base = room_item("table")
wear_checkout = wear_base.copy()
d = ImageDraw.Draw(wear_checkout)
d.line([(145, 250), (164, 254), (180, 252)], fill="#8a796b", width=3)
d.line([(153, 264), (166, 266)], fill="#948577", width=2)
save("normal-wear-baseline", wear_base)
save("normal-wear-checkout", wear_checkout)

save("new-damage-baseline", room_item("screen", damaged=False))
save("new-damage-checkout", room_item("screen", damaged=True))

ambiguous = room_item("table")
save("inconclusive-baseline", ambiguous)
save("inconclusive-checkout", ambiguous.crop((190, 115, 570, 385)).resize((768, 512)).filter(ImageFilter.GaussianBlur(9)))
