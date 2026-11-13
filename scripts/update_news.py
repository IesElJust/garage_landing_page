#!/usr/bin/env python3
"""Refresh only the bundled RSS fallback. Runtime updates use browser JavaScript."""
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path
import json
import re
import urllib.request
import xml.etree.ElementTree as ET

FEED = "https://portal.edu.gva.es/iesjaumeeljust/category/justhub-garage/feed/"
ROOT = Path(__file__).resolve().parents[1]

def plain_text(value):
    return unescape(re.sub(r"<[^>]+>", " ", value or "")).strip()


def main():
    with urllib.request.urlopen(FEED, timeout=25) as response:
        feed = ET.fromstring(response.read())
    items = []
    for item in feed.findall("./channel/item")[:6]:
        content = item.findtext("{http://purl.org/rss/1.0/modules/content/}encoded") or ""
        images = re.findall(r'<img[^>]+src=["\']([^"\']+)', content)
        image = next((url for url in images if "/iesjaumeeljust/wp-content/uploads/" in url), "")
        items.append({
            "title": unescape(item.findtext("title") or ""),
            "link": item.findtext("link"),
            "date": parsedate_to_datetime(item.findtext("pubDate")).isoformat(),
            "excerpt": plain_text(item.findtext("description") or content),
            "image": image,
        })
    if not items:
        raise RuntimeError("Empty feed; the previous fallback has been preserved")
    target = ROOT / "docs" / "data" / "news.json"
    target.parent.mkdir(exist_ok=True)
    temporary = target.with_suffix(".tmp")
    temporary.write_text(json.dumps({"source": FEED, "updated": datetime.now(timezone.utc).isoformat(), "items": items}, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(target)
    print(f"Saved {len(items)} fallback articles")


if __name__ == "__main__":
    main()
