// Nigeria Economic Dashboard 2026 - Main Application
const Dashboard2026 = {
    config: {
        apiBase: './data',
        updateInterval: 7200000, // 2 hours
        indicators: {},
        rates: {},
        articles: [],
        filters: {
            source: 'all',
            category: 'all',
            year: '2026'
        },
        currentYear: 2026
    },

    // Initialize dashboard
    init: function() {
        console.log('🇳🇬 Nigeria Economic Dashboard 2026 Initializing...');
        
        // Set current year in UI
        this.setCurrentYear();
        
        // Load initial data
        this.loadAllData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start auto-update
        this.startAutoUpdate();
        
        // Update UI
        this.updateUI();
    },

    // Set current year in config
    setCurrentYear: function() {
        document.querySelectorAll('.year-tag').forEach(tag => {
            tag.textContent = this.config.currentYear;
        });
        
        document.querySelectorAll('.year-badge span').forEach(badge => {
            badge.textContent = this.config.currentYear;
        });
    },

    // Load all data
    loadAllData: async function() {
        try {
            // Show loading states
            this.showLoading(true);
            
            // Load data from files with 2026 suffix
            const [indicators, rates, articles, sources] = await Promise.allSettled([
                this.loadJSON('data/indicators-2026.json'),
                this.loadJSON('data/rates-2026.json'),
                this.loadJSON('data/news-2026.json'),
                this.loadJSON('data/sources-2026.json')
            ]);
            
            // Process data
            if (indicators.status === 'fulfilled') {
                this.config.indicators = indicators.value;
                this.displayIndicators();
            }
            
            if (rates.status === 'fulfilled') {
                this.config.rates = rates.value;
                this.displayRates();
            }
            
            if (articles.status === 'fulfilled') {
                this.config.articles = articles.value.articles || [];
                this.displayNews();
                this.updateSourceFilter();
            }
            
            if (sources.status === 'fulfilled') {
                this.displaySources(sources.value.sources || []);
            }
            
            // Update UI
            this.updateUI();
            
        } catch (error) {
            console.error('Error loading 2026 data:', error);
            this.showError('Failed to load 2026 data. Please refresh.');
            // Try to load sample data
            await this.loadSampleData();
        } finally {
            this.showLoading(false);
        }
    },

    // Load sample data if main data fails
    loadSampleData: async function() {
        console.log('Loading sample 2026 data...');
        
        // Generate sample 2026 data
        this.config.indicators = this.generateSampleIndicators();
        this.config.rates = this.generateSampleRates();
        this.config.articles = this.generateSampleArticles();
        
        // Display data
        this.displayIndicators();
        this.displayRates();
        this.displayNews();
        this.displaySources(this.generateSampleSources());
        this.updateUI();
    },

    // Generate sample indicators for 2026
    generateSampleIndicators: function() {
        const now = new Date();
        const currentYear = this.config.currentYear;
        
        return {
            last_updated: now.toISOString(),
            year: currentYear,
            indicators: [
                {
                    name: "Inflation Rate",
                    value: "17.8%",
                    source: "NBS " + currentYear,
                    icon: "fas fa-chart-line",
                    updated: now.toISOString(),
                    change: -0.3,
                    year: currentYear
                },
                {
                    name: "Policy Rate (MPR)",
                    value: "17.25%",
                    source: "CBN " + currentYear,
                    icon: "fas fa-percentage",
                    updated: now.toISOString(),
                    change: -0.5,
                    year: currentYear
                },
                {
                    name: "GDP Growth",
                    value: "3.2%",
                    source: "NBS " + currentYear,
                    icon: "fas fa-chart-bar",
                    updated: now.toISOString(),
                    change: 0.4,
                    year: currentYear
                },
                {
                    name: "Unemployment Rate",
                    value: "4.1%",
                    source: "NBS " + currentYear,
                    icon: "fas fa-users",
                    updated: now.toISOString(),
                    change: -0.2,
                    year: currentYear
                },
                {
                    name: "External Reserves",
                    value: "$38.2B",
                    source: "CBN " + currentYear,
                    icon: "fas fa-piggy-bank",
                    updated: now.toISOString(),
                    change: 1.5,
                    year: currentYear
                },
                {
                    name: "Manufacturing PMI",
                    value: "52.4",
                    source: "CBN " + currentYear,
                    icon: "fas fa-industry",
                    updated: now.toISOString(),
                    change: 0.8,
                    year: currentYear
                }
            ]
        };
    },

    // Generate sample rates for 2026
    generateSampleRates: function() {
        const now = new Date();
        const currentYear = this.config.currentYear;
        
        return {
            last_updated: now.toISOString(),
            year: currentYear,
            rates: [
                {
                    name: "Official Exchange Rate",
                    value: "₦765/$",
                    source: "CBN " + currentYear,
                    icon: "fas fa-landmark",
                    description: "CBN Official Rate " + currentYear,
                    updated: now.toISOString()
                },
                {
                    name: "Parallel Market Rate",
                    value: "₦820/$",
                    source: "Market " + currentYear,
                    icon: "fas fa-exchange-alt",
                    description: "Black Market Rate " + currentYear,
                    updated: now.toISOString()
                },
                {
                    name: "Euro Exchange Rate",
                    value: "₦895/€",
                    source: "CBN " + currentYear,
                    icon: "fas fa-euro-sign",
                    description: "Naira to Euro " + currentYear,
                    updated: now.toISOString()
                },
                {
                    name: "Crude Oil Price",
                    value: "$84.75",
                    source: "NNPC " + currentYear,
                    icon: "fas fa-oil-can",
                    description: "Brent Crude " + currentYear,
                    updated: now.toISOString()
                }
            ]
        };
    },

    // Generate sample articles for 2026
    generateSampleArticles: function() {
        const now = new Date();
        const currentYear = this.config.currentYear;
        
        return [
            {
                title: "CBN Reduces Policy Rate to 17.25% in Q1 " + currentYear,
                url: "#",
                summary: "The Central Bank of Nigeria has lowered the Monetary Policy Rate to 17.25% in its first meeting of " + currentYear + ", signaling a shift towards growth support.",
                source: "BusinessDay Nigeria " + currentYear,
                category: "policy",
                published_at: now.toISOString(),
                keywords: ["CBN", "interest rate", currentYear, "monetary policy"],
                year: currentYear
            },
            {
                title: "Inflation Drops to 17.8% in January " + currentYear,
                url: "#",
                summary: "Nigeria's inflation rate fell to 17.8% in January " + currentYear + ", continuing its downward trend from " + (currentYear - 1) + " levels.",
                source: "Nairametrics " + currentYear,
                category: "economy",
                published_at: new Date(now - 86400000).toISOString(), // Yesterday
                keywords: ["inflation", "NBS", currentYear, "economy"],
                year: currentYear
            },
            {
                title: "Naira Strengthens to ₦820/$ in Parallel Market",
                url: "#",
                summary: "The Nigerian naira has strengthened to ₦820 per US dollar in the parallel market, showing improved forex liquidity in early " + currentYear + ".",
                source: "Premium Times " + currentYear,
                category: "markets",
                published_at: new Date(now - 172800000).toISOString(), // 2 days ago
                keywords: ["naira", "exchange rate", currentYear, "forex"],
                year: currentYear
            },
            {
                title: "GDP Growth Projected at 3.2% for " + currentYear,
                url: "#",
                summary: "The International Monetary Fund projects Nigeria's GDP growth at 3.2% for " + currentYear + ", citing improved oil production and reforms.",
                source: "The Cable " + currentYear,
                category: "economy",
                published_at: new Date(now - 259200000).toISOString(), // 3 days ago
                keywords: ["GDP", "growth", currentYear, "economy"],
                year: currentYear
            },
            {
                title: "NNPC Announces $3.1 Billion Oil Revenue for Q1 " + currentYear,
                url: "#",
                summary: "The Nigerian National Petroleum Corporation reports $3.1 billion in oil revenue for the first quarter of " + currentYear + ", exceeding targets.",
                source: "ThisDay " + currentYear,
                category: "business",
                published_at: new Date(now - 345600000).toISOString(), // 4 days ago
                keywords: ["NNPC", "oil", "revenue", currentYear],
                year: currentYear
            },
            {
                title: "Manufacturing PMI Rises to 52.4 in " + currentYear,
                url: "#",
                summary: "Nigeria's Manufacturing Purchasing Managers' Index rose to 52.4 in early " + currentYear + ", indicating expansion in the manufacturing sector.",
                source: "Guardian Nigeria " + currentYear,
                category: "business",
                published_at: new Date(now - 432000000).toISOString(), // 5 days ago
                keywords: ["manufacturing", "PMI", currentYear, "industry"],
                year: currentYear
            }
        ];
    },

    // Generate sample sources
    generateSampleSources: function() {
        const currentYear = this.config.currentYear;
        
        return [
            { name: "BusinessDay Nigeria " + currentYear, type: "RSS Feed", status: "active" },
            { name: "Nairametrics " + currentYear, type: "RSS Feed", status: "active" },
            { name: "Premium Times " + currentYear, type: "RSS Feed", status: "active" },
            { name: "Central Bank of Nigeria " + currentYear, type: "Official Data", status: "active" },
            { name: "National Bureau of Statistics " + currentYear, type: "Official Data", status: "active" },
            { name: "NNPC " + currentYear, type: "Energy Data", status: "active" }
        ];
    },

    // Display economic indicators
    displayIndicators: function() {
        const grid = document.getElementById('indicatorsGrid');
        if (!grid || !this.config.indicators.indicators) return;
        
        const indicators = this.config.indicators.indicators;
        const currentYear = this.config.currentYear;
        
        grid.innerHTML = indicators.map(indicator => `
            <div class="indicator-card">
                <div class="indicator-icon">
                    <i class="${indicator.icon || 'fas fa-chart-line'}"></i>
                </div>
                <div class="indicator-content">
                    <h3>${indicator.name} <span class="indicator-year">${currentYear}</span></h3>
                    <p class="indicator-value">${indicator.value}</p>
                    <p class="indicator-source">${indicator.source}</p>
                    ${indicator.change !== undefined ? `
                        <span class="indicator-change ${indicator.change > 0 ? 'change-positive' : 'change-negative'}">
                            ${indicator.change > 0 ? '↗' : '↘'} ${Math.abs(indicator.change).toFixed(1)}%
                        </span>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    // Display currency rates
    displayRates: function() {
        const grid = document.getElementById('ratesGrid');
        if (!grid || !this.config.rates.rates) return;
        
        const rates = this.config.rates.rates;
        const currentYear = this.config.currentYear;
        
        grid.innerHTML = rates.map(rate => `
            <div class="rate-card">
                <h3><i class="${rate.icon || 'fas fa-money-bill-wave'}"></i> ${rate.name}</h3>
                <p class="rate-value">${rate.value}</p>
                <p class="rate-label">${rate.description || ''}</p>
                <div class="rate-details">
                    <span>Source: ${rate.source}</span>
                    <span>${currentYear} Data</span>
                </div>
            </div>
        `).join('');
    },

    // Display news articles
    displayNews: function() {
        const grid = document.getElementById('newsGrid');
        const loading = document.getElementById('newsLoading');
        const noNews = document.getElementById('noNews');
        
        if (!grid || !loading || !noNews) return;
        
        const currentYear = this.config.currentYear;
        
        // Filter for current year
        let filteredArticles = this.config.articles.filter(article => {
            const articleYear = new Date(article.published_at).getFullYear();
            return articleYear === currentYear || article.year === currentYear;
        });
        
        // Apply additional filters
        if (this.config.filters.source !== 'all') {
            filteredArticles = filteredArticles.filter(article => 
                article.source.includes(this.config.filters.source)
            );
        }
        
        if (this.config.filters.category !== 'all') {
            filteredArticles = filteredArticles.filter(article => 
                article.category === this.config.filters.category
            );
        }
        
        // Sort by date (newest first)
        filteredArticles.sort((a, b) => 
            new Date(b.published_at) - new Date(a.published_at)
        );
        
        // Display
        if (filteredArticles.length === 0) {
            grid.style.display = 'none';
            noNews.style.display = 'block';
            loading.style.display = 'none';
            return;
        }
        
        noNews.style.display = 'none';
        loading.style.display = 'none';
        grid.style.display = 'grid';
        
        grid.innerHTML = filteredArticles.slice(0, 12).map(article => `
            <div class="news-card">
                <div class="news-card-header">
                    <div class="news-source">
                        <i class="fas fa-newspaper"></i>
                        ${article.source}
                        <span class="news-year">${currentYear}</span>
                    </div>
                    <a href="${article.url}" target="_blank" class="news-title">
                        ${article.title}
                    </a>
                    <div class="news-meta">
                        <div class="news-time">
                            <i class="far fa-clock"></i>
                            ${this.formatRelativeTime(article.published_at)}
                        </div>
                        ${article.category ? `<span class="keyword">${article.category}</span>` : ''}
                    </div>
                </div>
                <div class="news-card-body">
                    <p class="news-summary">${article.summary || ''}</p>
                    ${article.keywords && article.keywords.length > 0 ? `
                        <div class="news-keywords">
                            ${article.keywords.slice(0, 3).map(keyword => 
                                `<span class="keyword">${keyword}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                    <div style="margin-top: 1rem;">
                        <a href="${article.url}" target="_blank" class="btn btn-secondary" style="font-size: 0.9rem;">
                            <i class="fas fa-external-link-alt"></i> Read ${currentYear} Article
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Update source filter dropdown
    updateSourceFilter: function() {
        const filter = document.getElementById('newsSourceFilter');
        if (!filter) return;
        
        // Clear existing options
        while (filter.options.length > 1) {
            filter.remove(1);
        }
        
        // Get unique sources
        const sources = [...new Set(this.config.articles.map(a => a.source))].sort();
        
        // Add options
        sources.forEach(source => {
            const option = document.createElement('option');
            option.value = source;
            option.textContent = source;
            filter.appendChild(option);
        });
    },

    // Display data sources
    displaySources: function(sources) {
        const list = document.getElementById('sourcesList');
        if (!list || !sources) return;
        
        list.innerHTML = sources.map(source => `
            <li>
                <i class="fas fa-check-circle" style="color: var(--success);"></i>
                ${source.name} - ${source.type}
            </li>
        `).join('');
    },

    // Update UI elements
    updateUI: function() {
        const currentYear = this.config.currentYear;
        
        // Update counts
        const currentYearArticles = this.config.articles.filter(article => {
            const articleYear = new Date(article.published_at).getFullYear();
            return articleYear === currentYear || article.year === currentYear;
        }).length;
        
        document.getElementById('articleCount').textContent = currentYearArticles;
        document.getElementById('indicatorCount').textContent = 
            (this.config.indicators.indicators?.length || 0) + 
            (this.config.rates.rates?.length || 0);
        
        // Update timestamp
        const now = new Date();
        document.getElementById('updateTimestamp').textContent = 
            now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + currentYear;
        
        // Update last update
        const lastUpdate = this.config.indicators.last_updated || 
                          this.config.rates.last_updated || 
                          now.toISOString();
        document.getElementById('lastUpdate').textContent = 
            `${currentYear} Data • Updated ${this.formatRelativeTime(lastUpdate)}`;
        
        // Update progress bar (simulate Q1 2026 = 15%)
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            // Assuming we're in Q1 2026 (January-March)
            const currentMonth = now.getMonth() + 1; // 1-12
            const quarterProgress = Math.min(((currentMonth - 1) / 12) * 100, 25); // Max 25% for Q1
            progressFill.style.width = `${quarterProgress}%`;
            
            const progressText = document.querySelector('.progress-text');
            if (progressText) {
                const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
                const currentQuarter = Math.floor((currentMonth - 1) / 3);
                progressText.textContent = `${quarters[currentQuarter]} ${currentYear}`;
            }
        }
    },

    // Utility functions
    formatRelativeTime: function(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    },

    // Keep other methods from previous version...
    // [All other methods remain the same as in the previous app.js]
};

// Initialize when page loads
window.Dashboard2026 = Dashboard2026;
