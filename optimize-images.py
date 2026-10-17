#!/usr/bin/env python3
"""
optimize-images.py - make web-sized copies of your artwork and (optionally)
point a page at them, with lazy loading and width/height added.

Why: the gallery loads 160+ full-size PNGs. Browsers download every one of
them, so the page crawls. WebP copies at grid size are typically 10-30x smaller.

SETUP (once):   pip install pillow          (use pip3 / python3 if needed)

USAGE
  # Easiest: put this file in your website folder (next to art/ and your .html
  # pages) and just double-click it / open it with Python Launcher. With no
  # arguments it processes the art and logos folders and portfolio.html and
  # portfolio_gallery.html.

  # Or choose folders and pages yourself:
  # 1) make art/web/*.webp (originals are never touched or deleted)
  python3 optimize-images.py art

  # 2) same, and also write a faster copy of a page next to the original
  python3 optimize-images.py art --html portfolio_gallery.html
      -> portfolio_gallery.optimized.html   (open it, compare, then rename/replace)

  # several folders at once (e.g. logos too), and more than one page
  python3 optimize-images.py art logos --html portfolio_gallery.html portfolio.html

OPTIONS
  --max 1200      longest side in px for the web copy (never enlarges a smaller image)
  --quality 82    WebP quality, 1-100 (82 looks identical to most people)
  --eager 8       the first N images in each page load immediately; the rest are lazy

What the page rewrite does, for every <img src="art/..."> whose web copy exists:
  * src  -> art/web/<name>.webp
  * adds width/height (the browser reserves space, so nothing jumps while loading)
  * adds loading="lazy" (after the first --eager images) and decoding="async"
  * also rewrites CSS url('art/...') values such as data-art-1="url('art/x.png')"
Images whose source file can't be found are left exactly as they were.

Run it again any time you add artwork: files that are already converted and
up to date are skipped.
"""
import argparse
import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote

try:
    from PIL import Image, ImageOps, features
except ImportError:
    sys.exit("Pillow is not installed. Run:  pip install pillow")

if not features.check("webp"):
    sys.exit("This Pillow build has no WebP support. Try:  pip install --upgrade pillow")

SOURCE_EXTS = {".png", ".jpg", ".jpeg"}


def human(n):
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.0f} {unit}" if unit == "B" else f"{n:.1f} {unit}"
        n /= 1024


def convert_folder(folder: Path, max_side: int, quality: int):
    """Convert every png/jpg in `folder` into folder/web/*.webp.
    Returns {relative source path (posix): (width, height) of the web copy}."""
    web = folder / "web"
    web.mkdir(exist_ok=True)
    sizes, total_in, total_out, done, skipped, problems = {}, 0, 0, 0, 0, []

    for src in sorted(folder.rglob("*")):
        if web in src.parents or src.suffix.lower() not in SOURCE_EXTS or not src.is_file():
            continue
        rel = src.relative_to(folder)
        dest = (web / rel).with_suffix(".webp")
        dest.parent.mkdir(parents=True, exist_ok=True)
        converting = False

        try:
            if dest.exists() and dest.stat().st_mtime >= src.stat().st_mtime:
                skipped += 1
            else:
                converting = True
                with Image.open(src) as im:
                    im = ImageOps.exif_transpose(im)
                    w, h = im.size
                    scale = min(1.0, max_side / max(w, h))
                    if scale < 1.0:
                        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
                    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
                    im = im.convert("RGBA" if has_alpha else "RGB")
                    im.save(dest, "WEBP", quality=quality, method=6)
                done += 1

            with Image.open(dest) as out:
                sizes[rel.as_posix()] = out.size
        except Exception as err:          # one bad file must never stop the whole run
            if converting:
                dest.unlink(missing_ok=True)   # don't leave a half-written copy behind
            problems.append((str(folder / rel), src.stat().st_size, type(err).__name__))
            continue

        total_in += src.stat().st_size
        total_out += dest.stat().st_size

    if sizes:
        saved = 100 - (100 * total_out / total_in) if total_in else 0
        print(f"[{folder}] {len(sizes)} images ({done} converted, {skipped} already up to date): "
              f"{human(total_in)} -> {human(total_out)}  ({saved:.0f}% smaller)")
    else:
        print(f"[{folder}] no png/jpg files found")
    if problems:
        print(f"  ! {len(problems)} file(s) could not be read and were SKIPPED "
              "(your pages keep using the original for these):")
        for name, size, why in problems:
            print(f"      {name}  ({size:,} bytes)  - {why}")
        print("    A size of 0 bytes or a few KB usually means a damaged file, or a cloud-storage\n"
              "    placeholder that isn't downloaded yet. Try opening it in Preview; re-export it\n"
              "    from your design app if it won't open.")
    return sizes


IMG_TAG = re.compile(r"<img\b[^>]*>", re.I)
SRC_ATTR = re.compile(r"""\bsrc\s*=\s*(["'])(.*?)\1""", re.I | re.S)
CSS_URL = re.compile(r"""url\(\s*(["']?)([^"')]+)\1\s*\)""", re.I)


def web_path(folder_name, rel):
    return f"{folder_name}/web/{Path(rel).with_suffix('.webp').as_posix()}"


def rewrite_html(html_path: Path, maps: dict, eager: int):
    """maps: {folder name as written in the HTML (e.g. 'art'): {rel path: (w, h)}}"""
    text = html_path.read_text(encoding="utf-8")
    stats = {"rewritten": 0, "missing": 0, "css": 0, "total": 0}
    seen = {"n": 0}

    def lookup(url):
        url = unquote(url.split("?")[0])
        for folder, sizes in maps.items():
            prefix = folder + "/"
            if url.startswith(prefix):
                rel = url[len(prefix):]
                if rel.startswith("web/"):
                    return None, "already"
                return (folder, rel, sizes.get(rel)), None
        return None, "other"

    def fix_img(match):
        tag = match.group(0)
        stats["total"] += 1
        index = seen["n"]
        seen["n"] += 1
        m = SRC_ATTR.search(tag)
        if not m:
            return tag
        hit, why = lookup(m.group(2))
        if why:
            return tag
        folder, rel, size = hit
        if not size:
            stats["missing"] += 1
            return tag
        new_tag = tag[:m.start()] + f'src="{web_path(folder, rel)}"' + tag[m.end():]
        extra = []
        if not re.search(r"\swidth\s*=", new_tag, re.I):
            extra.append(f'width="{size[0]}"')
        if not re.search(r"\sheight\s*=", new_tag, re.I):
            extra.append(f'height="{size[1]}"')
        if index >= eager and not re.search(r"\sloading\s*=", new_tag, re.I):
            extra.append('loading="lazy"')
        if not re.search(r"\sdecoding\s*=", new_tag, re.I):
            extra.append('decoding="async"')
        new_tag = re.sub(r"^<img\b", "<img " + " ".join(extra), new_tag, count=1, flags=re.I) if extra else new_tag
        stats["rewritten"] += 1
        return new_tag

    text = IMG_TAG.sub(fix_img, text)

    def fix_css(match):
        hit, why = lookup(match.group(2))
        if why or not hit[2]:
            return match.group(0)
        stats["css"] += 1
        q = match.group(1)
        return f"url({q}{web_path(hit[0], hit[1])}{q})"

    text = CSS_URL.sub(fix_css, text)

    out = html_path.with_name(html_path.stem + ".optimized" + html_path.suffix)
    out.write_text(text, encoding="utf-8")
    print(f"[{html_path.name}] {stats['total']} <img> tags: {stats['rewritten']} rewritten"
          f"{', ' + str(stats['missing']) + ' skipped (source file not found)' if stats['missing'] else ''}"
          f"; {stats['css']} CSS url() values rewritten  ->  {out.name}")


def pause(enabled):
    """Keep the window open when the script was launched by double-click."""
    if enabled and sys.stdin and sys.stdin.isatty():
        try:
            input("\nPress Enter to close this window...")
        except EOFError:
            pass


def main():
    ap = argparse.ArgumentParser(description="Make web-sized WebP copies of artwork and optionally rewrite pages to use them.")
    ap.add_argument("folders", nargs="*", type=Path, help="image folders, e.g. art logos (default: art and logos next to this script)")
    ap.add_argument("--html", nargs="*", type=Path, default=[], help="page(s) to write an .optimized copy of")
    ap.add_argument("--max", type=int, default=1200, dest="max_side", help="longest side of the web copy in px (default 1200)")
    ap.add_argument("--quality", type=int, default=82, help="WebP quality 1-100 (default 82)")
    ap.add_argument("--eager", type=int, default=8, help="first N images per page load immediately (default 8)")
    args = ap.parse_args()

    # No arguments (e.g. double-clicked): work in the folder this script lives in
    no_args = not args.folders
    if no_args:
        os.chdir(Path(__file__).resolve().parent)
        args.folders = [Path(n) for n in ("art", "logos") if Path(n).is_dir()]
        if not args.html:
            args.html = [Path(n) for n in ("portfolio.html", "portfolio_gallery.html") if Path(n).is_file()]
        if not args.folders:
            print("No 'art' or 'logos' folder found next to this script.\n"
                  "Put optimize-images.py in your website folder (the one containing art/), then run it again.")
            pause(no_args)
            return
        print(f"Working in: {Path.cwd()}\n")

    maps = {}
    for folder in args.folders:
        if not folder.is_dir():
            sys.exit(f"Folder not found: {folder}")
        maps[folder.as_posix().rstrip("/")] = convert_folder(folder, args.max_side, args.quality)

    for page in args.html:
        if not page.is_file():
            sys.exit(f"Page not found: {page}")
        rewrite_html(page, maps, args.eager)

    print("\nOriginals were not changed. Open the .optimized page, check it, then replace your page with it.")
    pause(no_args)


if __name__ == "__main__":
    main()
