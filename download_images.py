"""
download_images.py
------------------
Run this ONCE on your own computer (needs internet):

    python download_images.py

It will:
  1. Find every online image (http/https) used in the .html files
  2. Download it into an "images/" folder next to the HTML files
  3. Rewrite the HTML so the site uses the local copies

After this the website no longer depends on other websites' links,
so images will never break. Keep a backup of the folder before running.
"""
import re, glob, os, urllib.request

os.makedirs("images", exist_ok=True)
HEADERS = {"User-Agent": "Mozilla/5.0"}
done = {}  # url -> local path

def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "image"

for page in glob.glob("*.html"):
    html = open(page, encoding="utf-8").read()

    def replace(match):
        url, alt = match.group(1), match.group(2)
        if url in done:
            return match.group(0).replace(url, done[url])
        name = slug(alt)
        path = f"images/{name}.jpg"
        n = 2
        while os.path.exists(path) and path not in done.values():
            path = f"images/{name}-{n}.jpg"; n += 1
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20) as r, open(path, "wb") as out:
                out.write(r.read())
            done[url] = path
            print("OK   ", path)
            return match.group(0).replace(url, path)
        except Exception as e:
            print("FAIL ", url[:70], "->", e)
            return match.group(0)  # keep the old link

    html = re.sub(r'<img[^>]*?src="(https?://[^"]+)"[^>]*?alt="([^"]*)"', replace, html)
    open(page, "w", encoding="utf-8").write(html)

print("\nDone. Open the site and check that every image shows.")
print("If some FAILED, download them manually from Unsplash/Pexels into images/")
print("and change the src in the HTML.")
