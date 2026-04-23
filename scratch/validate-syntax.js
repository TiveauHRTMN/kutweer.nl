const fs = require('fs');
const path = require('path');

try {
    const code = fs.readFileSync(path.join(__dirname, '../src/components/WeatherDashboard.tsx'), 'utf8');
    // Simple check: count { and }
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    console.log(`Open braces: ${openBraces}, Close braces: ${closeBraces}`);
    
    // Count < and > (roughly)
    const openTags = (code.match(/<[a-zA-Z]/g) || []).length || (code.match(/<>/g) || []).length;
    const closeTags = (code.match(/<\//g) || []).length || (code.match(/<\/>/g) || []).length;
    console.log(`Open tags: ${openTags}, Close tags: ${closeTags}`);
} catch (e) {
    console.error(e);
}
