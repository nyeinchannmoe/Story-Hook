"""Generate favicon and PWA icons from the official Story Hook 1024 PNG."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src" / "assets" / "storyhook_icon_1024.png"
PUBLIC = ROOT / "public"
ICONS = PUBLIC / "icons"


def resize(source: Image.Image, size: int) -> Image.Image:
    return source.resize((size, size), Image.Resampling.LANCZOS)


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)} {image.size}")


def main() -> None:
    source = Image.open(SRC).convert("RGBA")
    ICONS.mkdir(parents=True, exist_ok=True)

    outputs = [
        (16, PUBLIC / "favicon-16x16.png"),
        (32, PUBLIC / "favicon-32x32.png"),
        (48, PUBLIC / "favicon-48x48.png"),
        (180, PUBLIC / "apple-touch-icon.png"),
        (96, ICONS / "app-icon-96.png"),
        (192, ICONS / "pwa-192x192.png"),
        (512, ICONS / "pwa-512x512.png"),
    ]
    for size, path in outputs:
        save_png(resize(source, size), path)

    # Maskable: theme background with ~80% safe-zone icon.
    maskable_bg = (10, 10, 15, 255)  # #0a0a0f
    canvas = Image.new("RGBA", (512, 512), maskable_bg)
    inner = 410
    icon = resize(source, inner)
    offset = (512 - inner) // 2
    canvas.paste(icon, (offset, offset), icon)
    save_png(canvas, ICONS / "pwa-512x512-maskable.png")

    ico_sizes = [16, 32, 48]
    ico_images = [resize(source, size) for size in ico_sizes]
    ico_path = PUBLIC / "favicon.ico"
    ico_images[0].save(
        ico_path,
        format="ICO",
        sizes=[(size, size) for size in ico_sizes],
        append_images=ico_images[1:],
    )
    print(f"wrote {ico_path.relative_to(ROOT)} sizes={ico_sizes}")

    # Lightweight UI asset used by BrandLogo (keeps the 1024 master intact).
    save_png(resize(source, 128), ROOT / "src" / "assets" / "storyhook_icon_128.png")


if __name__ == "__main__":
    main()
