from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
PAGES = ["index.html", "smart-paste.html", "lens.html", "capture-stack.html", "privacy.html", "support.html"]
PLACEMENTS = {"hero", "navigation", "pricing", "footer"}

class Audit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scripts, self.links = [], []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "script":
            self.scripts.append(attrs.get("src"))
        if tag == "a" and urlparse(attrs.get("href", "")).hostname in {"apps.apple.com", "itunes.apple.com"}:
            self.links.append(attrs)

count = 0
for page in PAGES:
    parser = Audit()
    parser.feed((ROOT / page).read_text())
    assert parser.scripts.count("analytics-config.js") == 1, page
    assert parser.scripts.count("analytics.js") == 1, page
    assert parser.scripts.index("analytics-config.js") < parser.scripts.index("analytics.js"), page
    for link in parser.links:
        assert link.get("data-umami-event") == "app_store_click", (page, link)
        assert link.get("data-umami-event-placement") in PLACEMENTS, (page, link)
        assert urlparse(link["href"]).scheme == "https", (page, link)
    count += len(parser.links)
print(f"PASS: loader on {len(PAGES)} pages; {count} App Store links checked.")
if not count:
    print("NOTE: no App Store links exist yet; launch CTA validation remains outstanding.")
