// Nigeria Economic Dashboard - Main Application
const Dashboard = {
    config: {
        apiBase: './data',
        updateInterval: 7200000, // 2 hours
        indicators: {},
        rates: {},
        articles: [],
        filters: {
            source: 'all',
            category: 'all'
        }
    },

    // Initialize dashboard
    init: function() {
        console.log('🇳🇬 Nigeria Economic Dashboard Initializing...');
        
        // Load initial data
        this.loadAllData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start auto-update
        this.startAutoUpdate();
        
        // Update UI
        this.updateUI();
    },

    // Load all data
    loadAllData: async function() {
        try {
            // Show loading states
            this.showLoading(true);
            
            // Load data from files
            const [indicators, rates, articles, sources] = await Promise.allSettled([
                this.loadJSON('data/indicators.json'),
                this.loadJSON('data/rates.json'),
                this.loadJSON('data/news.json'),
                this.loadJSON('data/sources.json')
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
            console.error('Error loading data:', error);
            this.showError('Failed to load data. Please refresh.');
        } finally {
            this.showLoading(false);
        }
    },

    // Load JSON file
    loadJSON: async function(url) {
        const response = await fetch(url + '?t=' + Date.now());
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return await response.json();
    },

    // Display economic indicators
    displayIndicators: function() {
        const grid = document.getElementById('indicatorsGrid');
        if (!grid || !this.config.indicators.indicators) return;
        
        const indicators = this.config.indicators.indicators;
        
        grid.innerHTML = indicators.map(indicator => `
            <div class="indicator-card">
                <div class="indicator-icon">
                    <i class="${indicator.icon || 'fas fa-chart-line'}"></i>
                </div>
                <div class="indicator-content">
                    <h3>${indicator.name}</h3>
                    <p class="indicator-value">${indicator.value}</p>
                    <p class="indicator-source">${indicator.source}</p>
                    ${indicator.change ? `
                        <span class="indicator-change ${indicator.change > 0 ? 'change-positive' : 'change-negative'}">
                            ${indicator.change > 0 ? '↗' : '↘'} ${Math.abs(indicator.change)}%
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
        
        grid.innerHTML = rates.map(rate => `
            <div class="rate-card">
                <h3><i class="${rate.icon || 'fas fa-money-bill-wave'}"></i> ${rate.name}</h3>
                <p class="rate-value">${rate.value}</p>
                <p class="rate-label">${rate.description || ''}</p>
                <div class="rate-details">
                    <span>Source: ${rate.source}</span>
                    <span>Updated: ${this.formatTime(rate.updated)}</span>
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
        
        // Apply filters
        let filteredArticles = [...this.config.articles];
        
        if (this.config.filters.source !== 'all') {
            filteredArticles = filteredArticles.filter(article => 
                article.source === this.config.filters.source
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
                            <i class="fas fa-external-link-alt"></i> Read Full Article
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
        // Update counts
        document.getElementById('articleCount').textContent = this.config.articles.length;
        document.getElementById('indicatorCount').textContent = 
            (this.config.indicators.indicators?.length || 0) + 
            (this.config.rates.rates?.length || 0);
        
        // Update timestamp
        const now = new Date();
        document.getElementById('updateTimestamp').textContent = 
            now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Update last update
        const lastUpdate = this.config.indicators.last_updated || 
                          this.config.rates.last_updated || 
                          now.toISOString();
        document.getElementById('lastUpdate').textContent = 
            `Updated ${this.formatRelativeTime(lastUpdate)}`;
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAllData());
        }
        
        // Manual update button
        const manualUpdateBtn = document.getElementById('manualUpdateBtn');
        if (manualUpdateBtn) {
            manualUpdateBtn.addEventListener('click', () => {
                this.forceUpdate();
            });
        }
        
        // News filters
        const sourceFilter = document.getElementById('newsSourceFilter');
        const categoryFilter = document.getElementById('newsCategoryFilter');
        
        if (sourceFilter) {
            sourceFilter.addEventListener('change', (e) => {
                this.config.filters.source = e.target.value;
                this.displayNews();
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.config.filters.category = e.target.value;
                this.displayNews();
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportData();
            });
        }
        
        // Bookmark button
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.bookmarkPage();
            });
        }
    },

    // Force update all data
    forceUpdate: async function() {
        try {
            this.showLoading(true);
            
            // Call update script
            const response = await fetch('scripts/update.js');
            if (response.ok) {
                console.log('Data update triggered');
                setTimeout(() => {
                    this.loadAllData();
                    this.showNotification('Data updated successfully!', 'success');
                }, 2000);
            }
            
        } catch (error) {
            console.error('Update error:', error);
            this.showError('Update failed. Please try again.');
        }
    },

    // Start auto-update interval
    startAutoUpdate: function() {
        setInterval(() => {
            console.log('Auto-updating data...');
            this.loadAllData();
        }, this.config.updateInterval);
    },

    // Export data
    exportData: function() {
        const exportData = {
            exported_at: new Date().toISOString(),
            indicators: this.config.indicators,
            rates: this.config.rates,
            articles: this.config.articles.slice(0, 20)
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `nigeria-economy-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Data exported successfully!', 'success');
    },

    // Bookmark page
    bookmarkPage: function() {
        if (window.navigator.share) {
            navigator.share({
                title: 'Nigeria Economic Dashboard',
                url: window.location.href
            });
        } else {
            alert(`Bookmark this page:\n${window.location.href}`);
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

    formatTime: function(dateString) {
        if (!dateString) return '--:--';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    showLoading: function(show) {
        const elements = document.querySelectorAll('.loading');
        elements.forEach(el => {
            el.style.display = show ? 'block' : 'none';
        });
    },

    showError: function(message) {
        this.showNotification(message, 'error');
    },

    showNotification: function(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Style it
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
};

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification button {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: 10px;
        color: inherit;
    }
`;
document.head.appendChild(notificationStyles);
