// Data updater script
(async function updateData() {
    console.log('🔄 Updating Nigeria economic data...');
    
    try {
        // Import fetchers
        const NewsFetcher = (await import('./fetch-news.js')).default || (await import('./fetch-news.js'));
        const MacroFetcher = (await import('./fetch-macro.js')).default || (await import('./fetch-macro.js'));
        
        // Initialize fetchers
        const newsFetcher = new NewsFetcher();
        const macroFetcher = new MacroFetcher();
        
        // Fetch data
        const [newsData, macroData] = await Promise.all([
            newsFetcher.fetchAll(),
            macroFetcher.fetchCurrentData()
        ]);
        
        // Save to data directory
        await saveData('news.json', newsData);
        await saveData('indicators.json', macroData.indicators);
        await saveData('rates.json', macroData.rates);
        
        // Update sources list
        await updateSources();
        
        console.log('✅ Data update complete!');
        
    } catch (error) {
        console.error('❌ Update failed:', error);
    }
})();

// Save data to file
async function saveData(filename, data) {
    try {
        // In a real setup, this would write to server
        // For GitHub Pages, we'd commit to repo
        console.log(`💾 Saving ${filename}...`);
        
        // For demo purposes, log the data
        console.log(`${filename}:`, {
            entries: Array.isArray(data.articles || data.indicators || data.rates) 
                ? (data.articles || data.indicators || data.rates).length 
                : 0,
            updated: data.last_updated
        });
        
        return true;
        
    } catch (error) {
        console.error(`Error saving ${filename}:`, error);
        return false;
    }
}

// Update sources list
async function updateSources() {
    const sources = {
        sources: [
            { name: "BusinessDay Nigeria", type: "RSS Feed", status: "active" },
            { name: "Nairametrics", type: "RSS Feed", status: "active" },
            { name: "Premium Times", type: "RSS Feed", status: "active" },
            { name: "Central Bank of Nigeria", type: "Web Scrape", status: "active" },
            { name: "National Bureau of Statistics", type: "Web Scrape", status: "active" },
            { name: "Google News", type: "Aggregator", status: "active" }
        ],
        last_updated: new Date().toISOString()
    };
    
    await saveData('sources.json', sources);
}
