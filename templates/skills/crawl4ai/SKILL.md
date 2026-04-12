---
name: crawl4ai
description: "Web crawling and scraping with Crawl4AI. Use when: (1) scraping websites for structured data, (2) deep-crawling multi-page sites, (3) extracting clean markdown from web pages for analysis, (4) discovering and mapping API endpoints, (5) bulk content extraction. Trigger words: scrape, crawl, extract, spider, web data."
metadata:
  {
    "openclaw":
      {
        "emoji": "🕷️",
        "requires": { "bins": ["crwl"] }
      }
  }
---

# Crawl4AI — Web Crawling & Scraping Tool

A powerful web crawler and scraper available via the `crwl` CLI. Installed at `/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl`.

## Quick Reference

### Basic Crawl (single page → markdown)
```bash
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://example.com -o md
```

### Clean/Fit Markdown (noise-filtered, best for LLM consumption)
```bash
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://example.com -o md-fit
```

### JSON Output (full metadata + content)
```bash
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://example.com -o json
```

### Deep Crawl (multi-page, BFS/DFS/best-first)
```bash
# BFS crawl, max 20 pages
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://example.com --deep-crawl bfs --max-pages 20 -o md-fit

# Best-first (relevance-guided) crawl
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://example.com --deep-crawl best-first --max-pages 10 -o md-fit
```

### Ask a Question About a Page
```bash
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://example.com -q "What pricing plans are available?"
```

### LLM-Based Structured Extraction
```bash
# Extract structured data with a description
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://example.com -j "Extract all product names and prices"

# With a JSON schema file
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://example.com -s schema.json
```

### Save Output to File
```bash
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://example.com -o json -O output.json
```

### Bypass Cache
```bash
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://example.com -bc -o md
```

### Verbose Mode (debugging)
```bash
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://example.com -v -o md
```

## CLI Options

| Flag | Description |
|------|-------------|
| `-o, --output` | Output format: `all`, `json`, `markdown`/`md`, `markdown-fit`/`md-fit` |
| `-O, --output-file` | Save to file instead of stdout |
| `-bc, --bypass-cache` | Skip cached results |
| `-q, --question` | Ask a question about the page content |
| `-j, --json-extract` | LLM-based structured extraction with description |
| `-s, --schema` | JSON schema file for structured extraction |
| `--deep-crawl` | Strategy: `bfs`, `dfs`, or `best-first` |
| `--max-pages` | Max pages for deep crawl |
| `-b, --browser` | Browser params as `key=value,key=value` |
| `-c, --crawler` | Crawler params as `key=value,key=value` |
| `-p, --profile` | Named browser profile (for authenticated sessions) |
| `-v, --verbose` | Verbose output |
| `-B, --browser-config` | Browser config file (YAML/JSON) |
| `-C, --crawler-config` | Crawler config file (YAML/JSON) |
| `-f, --filter-config` | Content filter config |
| `-e, --extraction-config` | Extraction strategy config |

## Common Patterns

### API Discovery
Crawl a docs site to map all API endpoints:
```bash
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://docs.api.example.com --deep-crawl bfs --max-pages 50 -o md-fit -O api_docs.md
```

### Competitor Research
Scrape a competitor's product pages:
```bash
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://competitor.com/products --deep-crawl best-first --max-pages 30 -o json -O competitor_data.json
```

### Content Aggregation
Pull blog content for analysis:
```bash
/Users/aliceclaw/.openclaw/tools/crawl4ai-env/bin/crwl crawl https://blog.example.com --deep-crawl bfs --max-pages 100 -o md-fit -O blog_content.md
```

## Tips
- Use `md-fit` output for LLM consumption — it filters out navigation, headers, footers
- Use `json` output when you need metadata (links, images, page title, etc.)
- Deep crawl with `best-first` is most efficient for targeted research
- Use `--max-pages` to control scope and avoid runaway crawls
- Crawl4AI caches results by default; use `-bc` for fresh data
