#!/usr/bin/env python3
"""
NATAN Institutional Platform - Daily News Fetcher
Fetches financial news from free APIs and updates sentiment.json
Run daily via GitHub Actions or cron job
"""

import json
import os
import requests
from datetime import datetime, timedelta
from pathlib import Path
import xml.etree.ElementTree as ET

# API Keys - Set these as environment variables or GitHub Secrets
FINNHUB_API_KEY = os.getenv('FINNHUB_API_KEY', '')
ALPHA_VANTAGE_KEY = os.getenv('ALPHA_VANTAGE_KEY', '')
NEWS_API_KEY = os.getenv('NEWS_API_KEY', '')

# Output path
OUTPUT_PATH = Path(__file__).parent.parent / 'public' / 'sentiment.json'

# Only include articles from last 3 days
MAX_AGE_DAYS = 3

def is_recent(date_str: str) -> bool:
    """Check if article is within MAX_AGE_DAYS"""
    try:
        # Try parsing various date formats
        for fmt in ['%Y-%m-%d %H:%M', '%Y-%m-%d', '%Y%m%dT%H%M%S']:
            try:
                article_date = datetime.strptime(date_str[:16].replace('T', ' '), '%Y-%m-%d %H:%M')
                cutoff = datetime.now() - timedelta(days=MAX_AGE_DAYS)
                return article_date >= cutoff
            except:
                continue
        return True  # If can't parse, include it
    except:
        return True

def analyze_sentiment(headline: str, summary: str = '') -> str:
    """Simple keyword-based sentiment analysis"""
    text = (headline + ' ' + summary).lower()

    positive_words = [
        'surge', 'rally', 'gain', 'rise', 'jump', 'soar', 'boost', 'record high',
        'bullish', 'growth', 'expand', 'profit', 'beat', 'upgrade', 'strong',
        'positive', 'outperform', 'recovery', 'accelerate', 'opportunity', 'higher'
    ]
    negative_words = [
        'fall', 'drop', 'decline', 'plunge', 'crash', 'loss', 'bearish', 'slump',
        'weak', 'miss', 'downgrade', 'cut', 'risk', 'concern', 'warning', 'fear',
        'recession', 'crisis', 'negative', 'underperform', 'sell-off', 'lower', 'dive'
    ]

    pos_count = sum(1 for word in positive_words if word in text)
    neg_count = sum(1 for word in negative_words if word in text)

    if pos_count > neg_count:
        return 'positive'
    elif neg_count > pos_count:
        return 'negative'
    return 'neutral'

def calculate_score(headline: str, source: str) -> int:
    """Calculate relevance score 1-10"""
    score = 5  # Base score

    # High-value keywords
    high_value = ['indonesia', 'jakarta', 'rupiah', 'jci', 'bank indonesia', 'fed', 'gdp', 'inflation', 'earnings', 's&p', 'nasdaq']
    for kw in high_value:
        if kw in headline.lower():
            score += 1

    # Trusted sources get bonus
    trusted = ['reuters', 'bloomberg', 'cnbc', 'yahoo finance', 'marketwatch', 'finnhub']
    if any(t in source.lower() for t in trusted):
        score += 1

    return min(10, max(1, score))

def categorize_news(headline: str) -> str:
    """Categorize news article"""
    text = headline.lower()

    if any(w in text for w in ['indonesia', 'jakarta', 'rupiah', 'jci', 'idx']):
        if any(w in text for w in ['bank', 'rate', 'bi ']):
            return 'indonesia_monetary_policy'
        elif any(w in text for w in ['gdp', 'inflation', 'growth']):
            return 'indonesia_economy'
        elif any(w in text for w in ['stock', 'index', 'jci', 'equity']):
            return 'indonesia_equities'
        return 'indonesia_specific'
    elif any(w in text for w in ['fed', 'federal reserve', 'fomc']):
        return 'us_monetary_policy'
    elif any(w in text for w in ['s&p', 'nasdaq', 'dow', 'wall street']):
        return 'us_equities'
    elif any(w in text for w in ['oil', 'gold', 'commodity', 'brent']):
        return 'commodities'
    elif any(w in text for w in ['china', 'asia', 'emerging']):
        return 'asia_economy'
    return 'global_markets'

def fetch_finnhub_news() -> list:
    """Fetch news from Finnhub (free tier: 60 calls/min) - BEST SOURCE"""
    if not FINNHUB_API_KEY:
        print("⚠️  Skipping Finnhub - no API key set")
        return []

    articles = []
    try:
        # Market news - general
        url = f"https://finnhub.io/api/v1/news?category=general&token={FINNHUB_API_KEY}"
        response = requests.get(url, timeout=10)
        data = response.json()

        for item in data[:20]:
            headline = item.get('headline', '')
            summary = item.get('summary', '')
            timestamp = item.get('datetime', 0)

            # Convert timestamp to date string
            try:
                date_str = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M')
            except:
                date_str = datetime.now().strftime('%Y-%m-%d %H:%M')

            # Only include recent articles
            if not is_recent(date_str):
                continue

            articles.append({
                'headline': headline,
                'score': calculate_score(headline, item.get('source', '')),
                'source': item.get('source', 'Finnhub'),
                'sentiment': analyze_sentiment(headline, summary),
                'impact': summary[:250] + '...' if len(summary) > 250 else summary if summary else f"Latest market news from {item.get('source', 'Finnhub')}.",
                'category': categorize_news(headline),
                'date': date_str,
                'link': item.get('url', 'https://finnhub.io/')
            })
        print(f"✅ Fetched {len(articles)} articles from Finnhub")
    except Exception as e:
        print(f"❌ Finnhub error: {e}")

    return articles

def fetch_alpha_vantage_news() -> list:
    """Fetch news from Alpha Vantage (free tier: 25 calls/day)"""
    if not ALPHA_VANTAGE_KEY:
        print("⚠️  Skipping Alpha Vantage - no API key set")
        return []

    articles = []
    try:
        # News sentiment API - market wide
        url = f"https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey={ALPHA_VANTAGE_KEY}"
        response = requests.get(url, timeout=15)
        data = response.json()

        for item in data.get('feed', [])[:15]:
            headline = item.get('title', '')
            summary = item.get('summary', '')
            time_published = item.get('time_published', '')

            # Parse Alpha Vantage date format (20251125T143000)
            try:
                date_str = f"{time_published[:4]}-{time_published[4:6]}-{time_published[6:8]} {time_published[9:11]}:{time_published[11:13]}"
            except:
                date_str = datetime.now().strftime('%Y-%m-%d %H:%M')

            # Only include recent articles
            if not is_recent(date_str):
                continue

            # Use Alpha Vantage's sentiment score
            av_sentiment = item.get('overall_sentiment_label', 'Neutral')
            if 'bullish' in av_sentiment.lower():
                sentiment = 'positive'
            elif 'bearish' in av_sentiment.lower():
                sentiment = 'negative'
            else:
                sentiment = 'neutral'

            articles.append({
                'headline': headline,
                'score': calculate_score(headline, item.get('source', '')),
                'source': item.get('source', 'Alpha Vantage'),
                'sentiment': sentiment,
                'impact': summary[:250] + '...' if len(summary) > 250 else summary if summary else "Financial market analysis.",
                'category': categorize_news(headline),
                'date': date_str,
                'link': item.get('url', 'https://www.alphavantage.co/')
            })
        print(f"✅ Fetched {len(articles)} articles from Alpha Vantage")
    except Exception as e:
        print(f"❌ Alpha Vantage error: {e}")

    return articles

def fetch_newsapi() -> list:
    """Fetch from NewsAPI (free tier: 100 calls/day)"""
    if not NEWS_API_KEY:
        print("⚠️  Skipping NewsAPI - no API key set")
        return []

    articles = []
    try:
        # Business/financial news - last 24 hours
        url = f"https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=20&apiKey={NEWS_API_KEY}"
        response = requests.get(url, timeout=10)
        data = response.json()

        for item in data.get('articles', []):
            headline = item.get('title', '')
            description = item.get('description', '') or ''
            published_at = item.get('publishedAt', '')

            # Parse ISO date
            try:
                date_str = published_at[:16].replace('T', ' ')
            except:
                date_str = datetime.now().strftime('%Y-%m-%d %H:%M')

            # Only include recent articles
            if not is_recent(date_str):
                continue

            articles.append({
                'headline': headline.split(' - ')[0] if ' - ' in headline else headline,  # Remove source suffix
                'score': calculate_score(headline, item.get('source', {}).get('name', '')),
                'source': item.get('source', {}).get('name', 'NewsAPI'),
                'sentiment': analyze_sentiment(headline, description),
                'impact': description[:250] + '...' if len(description) > 250 else description if description else "Latest business news.",
                'category': categorize_news(headline),
                'date': date_str,
                'link': item.get('url', 'https://newsapi.org/')
            })
        print(f"✅ Fetched {len(articles)} articles from NewsAPI")
    except Exception as e:
        print(f"❌ NewsAPI error: {e}")

    return articles

def fetch_yahoo_rss() -> list:
    """Fetch from Yahoo Finance RSS (free, no API key)"""
    articles = []

    feeds = [
        ('https://finance.yahoo.com/news/rssindex', 'Yahoo Finance'),
    ]

    for feed_url, feed_name in feeds:
        try:
            response = requests.get(feed_url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            root = ET.fromstring(response.content)

            for item in root.findall('.//item')[:10]:
                headline = item.find('title').text if item.find('title') is not None else ''
                link = item.find('link').text if item.find('link') is not None else ''
                description = item.find('description').text if item.find('description') is not None else ''
                pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ''

                # Parse RSS date format
                try:
                    dt = datetime.strptime(pub_date, '%a, %d %b %Y %H:%M:%S %z')
                    date_str = dt.strftime('%Y-%m-%d %H:%M')
                except:
                    try:
                        dt = datetime.strptime(pub_date[:25], '%a, %d %b %Y %H:%M:%S')
                        date_str = dt.strftime('%Y-%m-%d %H:%M')
                    except:
                        date_str = datetime.now().strftime('%Y-%m-%d %H:%M')

                # Only include recent articles
                if not is_recent(date_str):
                    continue

                articles.append({
                    'headline': headline,
                    'score': calculate_score(headline, feed_name),
                    'source': feed_name,
                    'sentiment': analyze_sentiment(headline, description or ''),
                    'impact': description[:250] + '...' if description and len(description) > 250 else description if description else f"Latest from {feed_name}.",
                    'category': categorize_news(headline),
                    'date': date_str,
                    'link': link
                })
        except Exception as e:
            print(f"⚠️  Yahoo RSS error: {e}")

    print(f"✅ Fetched {len(articles)} articles from Yahoo Finance RSS")
    return articles

def fetch_cnbc_rss() -> list:
    """Fetch from CNBC RSS (free, no API key)"""
    articles = []

    feeds = [
        ('https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', 'CNBC'),
    ]

    for feed_url, feed_name in feeds:
        try:
            response = requests.get(feed_url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            root = ET.fromstring(response.content)

            for item in root.findall('.//item')[:10]:
                headline = item.find('title').text if item.find('title') is not None else ''
                link = item.find('link').text if item.find('link') is not None else ''
                description = item.find('description').text if item.find('description') is not None else ''
                pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ''

                # Parse RSS date format
                try:
                    dt = datetime.strptime(pub_date, '%a, %d %b %Y %H:%M:%S %Z')
                    date_str = dt.strftime('%Y-%m-%d %H:%M')
                except:
                    try:
                        dt = datetime.strptime(pub_date[:25], '%a, %d %b %Y %H:%M:%S')
                        date_str = dt.strftime('%Y-%m-%d %H:%M')
                    except:
                        date_str = datetime.now().strftime('%Y-%m-%d %H:%M')

                # Only include recent articles
                if not is_recent(date_str):
                    continue

                articles.append({
                    'headline': headline,
                    'score': calculate_score(headline, feed_name),
                    'source': feed_name,
                    'sentiment': analyze_sentiment(headline, description or ''),
                    'impact': description[:250] + '...' if description and len(description) > 250 else description if description else f"Latest from {feed_name}.",
                    'category': categorize_news(headline),
                    'date': date_str,
                    'link': link
                })
        except Exception as e:
            print(f"⚠️  CNBC RSS error: {e}")

    print(f"✅ Fetched {len(articles)} articles from CNBC RSS")
    return articles

def fetch_marketwatch_rss() -> list:
    """Fetch from MarketWatch RSS (free, no API key)"""
    articles = []

    feeds = [
        ('https://feeds.marketwatch.com/marketwatch/topstories/', 'MarketWatch'),
    ]

    for feed_url, feed_name in feeds:
        try:
            response = requests.get(feed_url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            root = ET.fromstring(response.content)

            for item in root.findall('.//item')[:10]:
                headline = item.find('title').text if item.find('title') is not None else ''
                link = item.find('link').text if item.find('link') is not None else ''
                description = item.find('description').text if item.find('description') is not None else ''
                pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ''

                # Parse RSS date format
                try:
                    dt = datetime.strptime(pub_date, '%a, %d %b %Y %H:%M:%S %Z')
                    date_str = dt.strftime('%Y-%m-%d %H:%M')
                except:
                    try:
                        dt = datetime.strptime(pub_date[:25], '%a, %d %b %Y %H:%M:%S')
                        date_str = dt.strftime('%Y-%m-%d %H:%M')
                    except:
                        date_str = datetime.now().strftime('%Y-%m-%d %H:%M')

                # Only include recent articles
                if not is_recent(date_str):
                    continue

                articles.append({
                    'headline': headline,
                    'score': calculate_score(headline, feed_name),
                    'source': feed_name,
                    'sentiment': analyze_sentiment(headline, description or ''),
                    'impact': description[:250] + '...' if description and len(description) > 250 else description if description else f"Latest from {feed_name}.",
                    'category': categorize_news(headline),
                    'date': date_str,
                    'link': link
                })
        except Exception as e:
            print(f"⚠️  MarketWatch RSS error: {e}")

    print(f"✅ Fetched {len(articles)} articles from MarketWatch RSS")
    return articles

def deduplicate_articles(articles: list) -> list:
    """Remove duplicate articles based on headline similarity"""
    seen_headlines = set()
    unique = []

    for article in articles:
        # Normalize headline for comparison
        headline_key = article['headline'].lower()[:50]
        if headline_key not in seen_headlines:
            seen_headlines.add(headline_key)
            unique.append(article)

    return unique

def generate_summary(articles: list) -> dict:
    """Generate summary statistics"""
    sentiments = {'positive': 0, 'neutral': 0, 'negative': 0}
    sources = {}

    for article in articles:
        sentiments[article.get('sentiment', 'neutral')] += 1
        source = article.get('source', 'Unknown')
        sources[source] = sources.get(source, 0) + 1

    avg_score = sum(a.get('score', 5) for a in articles) / len(articles) if articles else 0
    high_priority = sum(1 for a in articles if a.get('score', 0) >= 8)

    return {
        'total_articles': len(articles),
        'avg_relevance': round(avg_score, 1),
        'bullish': sentiments['positive'],
        'neutral': sentiments['neutral'],
        'bearish': sentiments['negative'],
        'high_priority': high_priority,
        'material_events': sum(1 for a in articles if a.get('score', 0) >= 9)
    }

def main():
    print(f"\n{'='*60}")
    print(f"🚀 NATAN News Update - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    # Fetch from all sources (API sources first - better quality)
    all_articles = []

    # Primary sources (API - higher quality, real-time)
    all_articles.extend(fetch_finnhub_news())
    all_articles.extend(fetch_alpha_vantage_news())
    all_articles.extend(fetch_newsapi())

    # Secondary sources (RSS - free, no API key needed)
    all_articles.extend(fetch_cnbc_rss())
    all_articles.extend(fetch_marketwatch_rss())
    all_articles.extend(fetch_yahoo_rss())

    print(f"\n📊 Total raw articles: {len(all_articles)}")

    # Deduplicate and sort by date (most recent first), then by score
    unique_articles = deduplicate_articles(all_articles)

    # Sort by date (most recent first)
    unique_articles.sort(key=lambda x: x.get('date', ''), reverse=True)

    # Then prioritize by score within recent articles
    unique_articles.sort(key=lambda x: x.get('score', 0), reverse=True)

    # Take top 20 articles
    top_articles = unique_articles[:20]

    print(f"📰 Unique articles after dedup: {len(unique_articles)}")
    print(f"📌 Top articles selected: {len(top_articles)}")

    # Calculate source distribution
    sources = {}
    for article in top_articles:
        source = article.get('source', 'Unknown')
        sources[source] = sources.get(source, 0) + 1

    # Build output
    output = {
        'timestamp': datetime.now().isoformat(),
        'summary': generate_summary(top_articles),
        'sources': sources,
        'top_signals': top_articles
    }

    # Write to file
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\n✅ Updated {OUTPUT_PATH}")
    print(f"📈 Summary: {output['summary']}")
    print(f"\n{'='*60}\n")

    return output

if __name__ == '__main__':
    main()
