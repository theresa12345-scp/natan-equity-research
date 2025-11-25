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

# API Keys - Set these as environment variables or GitHub Secrets
FINNHUB_API_KEY = os.getenv('FINNHUB_API_KEY', 'your_finnhub_key_here')
ALPHA_VANTAGE_KEY = os.getenv('ALPHA_VANTAGE_KEY', 'your_alpha_vantage_key_here')
NEWS_API_KEY = os.getenv('NEWS_API_KEY', 'your_newsapi_key_here')

# Output path
OUTPUT_PATH = Path(__file__).parent.parent / 'public' / 'sentiment.json'

def analyze_sentiment(headline: str, summary: str = '') -> str:
    """Simple keyword-based sentiment analysis"""
    text = (headline + ' ' + summary).lower()

    positive_words = [
        'surge', 'rally', 'gain', 'rise', 'jump', 'soar', 'boost', 'record high',
        'bullish', 'growth', 'expand', 'profit', 'beat', 'upgrade', 'strong',
        'positive', 'outperform', 'recovery', 'accelerate', 'opportunity'
    ]
    negative_words = [
        'fall', 'drop', 'decline', 'plunge', 'crash', 'loss', 'bearish', 'slump',
        'weak', 'miss', 'downgrade', 'cut', 'risk', 'concern', 'warning', 'fear',
        'recession', 'crisis', 'negative', 'underperform', 'sell-off'
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
    high_value = ['indonesia', 'jakarta', 'rupiah', 'jci', 'bank indonesia', 'fed', 'gdp', 'inflation', 'earnings']
    for kw in high_value:
        if kw in headline.lower():
            score += 1

    # Trusted sources get bonus
    trusted = ['reuters', 'bloomberg', 'cnbc', 'yahoo finance', 'marketwatch']
    if any(t in source.lower() for t in trusted):
        score += 1

    return min(10, max(1, score))

def categorize_news(headline: str) -> str:
    """Categorize news article"""
    text = headline.lower()

    if any(w in text for w in ['indonesia', 'jakarta', 'rupiah', 'jci']):
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
    """Fetch news from Finnhub (free tier: 60 calls/min)"""
    if FINNHUB_API_KEY == 'your_finnhub_key_here':
        print("Skipping Finnhub - no API key set")
        return []

    articles = []
    try:
        # Market news
        url = f"https://finnhub.io/api/v1/news?category=general&token={FINNHUB_API_KEY}"
        response = requests.get(url, timeout=10)
        data = response.json()

        for item in data[:15]:
            headline = item.get('headline', '')
            summary = item.get('summary', '')
            articles.append({
                'headline': headline,
                'score': calculate_score(headline, item.get('source', '')),
                'source': item.get('source', 'Finnhub'),
                'sentiment': analyze_sentiment(headline, summary),
                'impact': summary[:200] + '...' if len(summary) > 200 else summary,
                'category': categorize_news(headline),
                'date': datetime.fromtimestamp(item.get('datetime', 0)).strftime('%Y-%m-%d %H:%M'),
                'link': item.get('url', 'https://finnhub.io/')
            })
        print(f"Fetched {len(articles)} articles from Finnhub")
    except Exception as e:
        print(f"Finnhub error: {e}")

    return articles

def fetch_alpha_vantage_news() -> list:
    """Fetch news from Alpha Vantage (free tier: 25 calls/day)"""
    if ALPHA_VANTAGE_KEY == 'your_alpha_vantage_key_here':
        print("Skipping Alpha Vantage - no API key set")
        return []

    articles = []
    try:
        # News sentiment API
        tickers = 'SPY,AAPL,MSFT,BBRI.JK'  # Include Indonesian stocks
        url = f"https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers={tickers}&apikey={ALPHA_VANTAGE_KEY}"
        response = requests.get(url, timeout=10)
        data = response.json()

        for item in data.get('feed', [])[:10]:
            headline = item.get('title', '')
            summary = item.get('summary', '')

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
                'impact': summary[:200] + '...' if len(summary) > 200 else summary,
                'category': categorize_news(headline),
                'date': item.get('time_published', '')[:16].replace('T', ' '),
                'link': item.get('url', 'https://www.alphavantage.co/')
            })
        print(f"Fetched {len(articles)} articles from Alpha Vantage")
    except Exception as e:
        print(f"Alpha Vantage error: {e}")

    return articles

def fetch_newsapi() -> list:
    """Fetch from NewsAPI (free tier: 100 calls/day)"""
    if NEWS_API_KEY == 'your_newsapi_key_here':
        print("Skipping NewsAPI - no API key set")
        return []

    articles = []
    try:
        # Business/financial news
        url = f"https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=15&apiKey={NEWS_API_KEY}"
        response = requests.get(url, timeout=10)
        data = response.json()

        for item in data.get('articles', []):
            headline = item.get('title', '')
            description = item.get('description', '') or ''

            articles.append({
                'headline': headline,
                'score': calculate_score(headline, item.get('source', {}).get('name', '')),
                'source': item.get('source', {}).get('name', 'NewsAPI'),
                'sentiment': analyze_sentiment(headline, description),
                'impact': description[:200] + '...' if len(description) > 200 else description,
                'category': categorize_news(headline),
                'date': item.get('publishedAt', '')[:16].replace('T', ' '),
                'link': item.get('url', 'https://newsapi.org/')
            })
        print(f"Fetched {len(articles)} articles from NewsAPI")
    except Exception as e:
        print(f"NewsAPI error: {e}")

    return articles

def fetch_google_rss() -> list:
    """Fetch from Google News RSS (no API key needed!)"""
    import xml.etree.ElementTree as ET

    articles = []
    feeds = [
        ('https://news.google.com/rss/search?q=indonesia+stock+market&hl=en-US&gl=US&ceid=US:en', 'Indonesia'),
        ('https://news.google.com/rss/search?q=jakarta+composite+index&hl=en-US&gl=US&ceid=US:en', 'JCI'),
        ('https://news.google.com/rss/search?q=S%26P+500&hl=en-US&gl=US&ceid=US:en', 'S&P 500'),
        ('https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en', 'Business'),
    ]

    for feed_url, topic in feeds:
        try:
            response = requests.get(feed_url, timeout=10)
            root = ET.fromstring(response.content)

            for item in root.findall('.//item')[:5]:
                headline = item.find('title').text if item.find('title') is not None else ''
                link = item.find('link').text if item.find('link') is not None else ''
                pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ''
                source = item.find('source').text if item.find('source') is not None else 'Google News'

                # Parse date
                try:
                    dt = datetime.strptime(pub_date, '%a, %d %b %Y %H:%M:%S %Z')
                    date_str = dt.strftime('%Y-%m-%d %H:%M')
                except:
                    date_str = datetime.now().strftime('%Y-%m-%d %H:%M')

                articles.append({
                    'headline': headline.split(' - ')[0] if ' - ' in headline else headline,
                    'score': calculate_score(headline, source),
                    'source': source,
                    'sentiment': analyze_sentiment(headline),
                    'impact': f"Breaking news on {topic}. Click to read the full article.",
                    'category': categorize_news(headline),
                    'date': date_str,
                    'link': link
                })
        except Exception as e:
            print(f"Google RSS error for {topic}: {e}")

    print(f"Fetched {len(articles)} articles from Google News RSS")
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
    print(f"Starting news update at {datetime.now().isoformat()}")

    # Fetch from all sources
    all_articles = []
    all_articles.extend(fetch_google_rss())  # Free, no key needed
    all_articles.extend(fetch_finnhub_news())
    all_articles.extend(fetch_alpha_vantage_news())
    all_articles.extend(fetch_newsapi())

    # Deduplicate and sort by score
    unique_articles = deduplicate_articles(all_articles)
    unique_articles.sort(key=lambda x: x.get('score', 0), reverse=True)

    # Take top 20 articles
    top_articles = unique_articles[:20]

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

    print(f"Updated {OUTPUT_PATH} with {len(top_articles)} articles")
    print(f"Summary: {output['summary']}")

    return output

if __name__ == '__main__':
    main()
