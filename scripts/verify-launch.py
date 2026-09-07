"""Read-only deployment verification. Usage: python3 scripts/verify-launch.py SITE_URL API_URL"""
import json
import sys
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from html.parser import HTMLParser


class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []
        self.noindex = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href"))
        if tag == "meta" and attrs.get("name") == "robots":
            self.noindex |= "noindex" in attrs.get("content", "").lower()


def origin(url):
    parsed = urllib.parse.urlsplit(url)
    return f"{parsed.scheme}://{parsed.netloc}"


def get(url, headers=None):
    request = urllib.request.Request(url, headers={"User-Agent": "WorldStories-Nepali-Launch-Check", **(headers or {})})
    with urllib.request.urlopen(request, timeout=30) as response:
        if response.status != 200:
            raise RuntimeError(f"{url}: HTTP {response.status}")
        return response.read().decode("utf-8"), response.headers, response.url


def main(site, api):
    site = site.rstrip("/")
    api = api.rstrip("/")
    if origin(site) != site or not site.startswith("https://"):
        raise ValueError("SITE_URL must be the final HTTPS origin, without a path")
    if site in ("https://worldstories.net", "https://www.worldstories.net"):
        raise ValueError("Use the Nepali site, not the parent site")
    robots, _, _ = get(f"{site}/robots.txt")
    if f"Sitemap: {site}/sitemap.xml" not in robots:
        raise RuntimeError("robots.txt does not advertise this site's sitemap")
    xml, headers, final_url = get(f"{site}/sitemap.xml")
    if origin(final_url) != site or "xml" not in headers.get("Content-Type", ""):
        raise RuntimeError("Sitemap must be XML served on the Nepali origin")
    root = ET.fromstring(xml)
    namespace = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    if root.tag != namespace + "urlset":
        raise RuntimeError("Expected the Nepali URL sitemap")
    urls = [item.text for item in root.findall(f"{namespace}url/{namespace}loc")]
    if not urls or len(urls) != len(set(urls)):
        raise RuntimeError("Sitemap is empty or contains duplicate URLs")
    if f"{site}/" not in urls or f"{site}/kathaharu" not in urls:
        raise RuntimeError("Homepage/catalogue sitemap entries are missing")
    # Validate every origin before fetching any URL obtained from the sitemap.
    for url in urls:
        if not url or origin(url) != site:
            raise RuntimeError(f"Sitemap contains a foreign URL: {url}")
    for url in urls:
        html, _, final_url = get(url)
        if final_url != url:
            raise RuntimeError(f"Sitemap URL redirects: {url} -> {final_url}")
        head = Head()
        head.feed(html.split("</head>", 1)[0])
        if head.noindex or head.canonicals != [url]:
            raise RuntimeError(f"Not indexable or canonical mismatch: {url}")
        print(f"200, self-canonical: {url}")
    for endpoint in ("stories", "genres"):
        body, headers, _ = get(f"{api}/{endpoint}/?show_in_nepali_site=true", {"Origin": site})
        if headers.get("Access-Control-Allow-Origin") not in (site, "*"):
            raise RuntimeError(f"CORS does not allow {site} on {endpoint}")
        if "application/json" not in headers.get("Content-Type", ""):
            raise RuntimeError(f"Expected JSON from {endpoint}")
        json.loads(body)
    print(f"Verified {len(urls)} sitemap URLs, robots, canonicals and public API CORS headers.")
    print("Also verify an actual browser fetch from this origin before marking end-to-end CORS complete.")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(*sys.argv[1:])
