// News fetcher for Nigerian economic news
class NewsFetcher {
    constructor() {
        this.sources = [
            {
                name: "BusinessDay Nigeria",
                url: "https://businessday.ng/feed/",
                type: "rss"
            },
            {
                name: "Nairametrics",
                url: "https://nairametrics.com/feed/",
                type: "rss"
            },
            {
                name: "Premium Times",
                url: "https://www.premiumtimesng.com/feed/",
                type: "rss"
            },
            {
                name: "The Cable",
                url: "https://www.thecable.ng/feed",
                type: "rss"
            }
        ];
        
        this.keywords = [
            'economy', 'economic', 'finance', 'business', 'market',
            'inflation', 'CBN', 'Central Bank', 'interest rate',
            'naira', 'dollar', 'exchange rate', 'GDP', 'growth',
            'budget', 'debt', 'revenue', 'oil', 'petroleum',
            'unemployment', 'employment', 'trade', 'export', 'import'
        ];
    }

    // Fetch news from RSS feeds
    async fetchRSS(url, sourceName) {
        try {
            // Use CORS proxy
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            const text = await response.text();
            
            // Parse RSS (simplified - in production use proper RSS parser)
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "text/xml");
            const items = xml.querySelectorAll("item");
            
            const articles = [];
            items.forEach(item => {
                const title = item.querySelector("title")?.textContent || "";
                const link = item.querySelector("link")?.textContent || "";
                const pubDate = item.querySelector("pubDate")?.textContent || "";
                const description = item.querySelector("description")?.textContent || "";
                
                // Check if relevant
                if (this.isRelevant(title + " " + description)) {
                    articles.push({
                        title: this.cleanText(title),
                        url: link,
                        summary: this.cleanText(description).substring(0, 200) + "...",
                        source: sourceName,
                        published_at: pubDate || new Date().toISOString(),
                        category: this.getCategory(title + description)
                    });
                }
            });
            
            return articles;
            
        } catch (error) {
            console.error(`Error fetching ${sourceName}:`, error);
            return [];
        }
    }

    // Check if text is relevant
    isRelevant(text) {
        const lowerText = text.toLowerCase();
        return this.keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
    }

    // Clean text
    cleanText(text) {
        if (!text) return "";
        // Remove HTML tags
        text = text.replace(/<[^>]*>/g, '');
        // Decode HTML entities
        text = text.replace(/&[a-z]+;/g, ' ');
        // Trim and clean
        return text.trim().replace(/\s+/g, ' ');
    }

    // Get category from text
    getCategory(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('cbn') || lowerText.includes('central bank') || lowerText.includes('interest rate')) {
            return 'policy';
        } else if (lowerText.includes('naira') || lowerText.includes('dollar') || lowerText.includes('exchange')) {
            return 'markets';
        } else if (lowerText.includes('inflation') || lowerText.includes('gdp') || lowerText.includes('unemployment')) {
            return 'economy';
        } else {
            return 'business';
        }
    }

    // Fetch all news
    async fetchAll() {
        console.log("📰 Fetching Nigerian economic news...");
        
        const allArticles = [];
        
        for (const source of this.sources) {
            try {
                const articles = await this.fetchRSS(source.url, source.name);
                allArticles.push(...articles.slice(0, 5)); // Limit per source
                console.log(`✅ ${source.name}: ${articles.length} articles`);
            } catch (error) {
                console.log(`❌ ${source.name}: Failed`);
            }
            
            // Delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Remove duplicates
        const uniqueArticles = this.removeDuplicates(allArticles);
        
        // Sort by date
        uniqueArticles.sort((a, b) => 
            new Date(b.published_at) - new Date(a.published_at)
        );
        
        console.log(`📊 Total articles: ${uniqueArticles.length}`);
        
        return {
            last_updated: new Date().toISOString(),
            articles: uniqueArticles
        };
    }

    // Remove duplicate articles
    removeDuplicates(articles) {
        const seen = new Set();
        return articles.filter(article => {
            const key = article.title.substring(0, 50).toLowerCase();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
}

// Export for use in main app
if (typeof module !== 'undefined') {
    module.exports = NewsFetcher;
}
