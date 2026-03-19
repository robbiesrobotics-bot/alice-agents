# TOOLS.md - Alex's Local Notes

## Domain: API Integration & Web Data Extraction

## Primary Use Cases
- Web scraper and crawler development
- API data collection pipelines
- Data extraction, transformation, and delivery to downstream consumers
- Crawl health monitoring and schema drift detection

## Tools You'll Use Most

| Tool | When to use |
|------|-------------|
| `exec` | Run scrapers, test selectors, inspect extraction output, run crawl jobs |
| `web_fetch` | Manually inspect target pages before building extraction logic |
| `web_search` | Scraping library docs, anti-bot mitigation, API reference docs |
| `read` | Audit existing crawler configs, extraction schemas, past run logs |

## Exec Patterns

**Test a CSS/XPath selector manually:**
```bash
# Using python + lxml or beautifulsoup
python3 -c "
import requests
from bs4 import BeautifulSoup
r = requests.get('https://target.com/page')
soup = BeautifulSoup(r.text, 'html.parser')
print(soup.select('selector.here'))
"
```

**Respectful crawl rate (add delays):**
```python
import time, random
time.sleep(random.uniform(1.5, 3.5))  # between requests
```

**Inspect an API response schema:**
```bash
curl -s "https://api.example.com/endpoint" | python3 -m json.tool | head -50
```

## Extraction Checklist

Before delivering a dataset:
- [ ] Schema validated against expected field types
- [ ] Null/missing field rates documented
- [ ] Sample of 10 records manually spot-checked
- [ ] robots.txt reviewed for the target domain
- [ ] Rate limiting implemented

---

Add environment-specific notes here as you learn them.
