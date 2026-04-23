const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../src/components/WeatherDashboard.tsx'), 'utf8');

const stack = [];
// Improved regex to avoid generic types like <City>
const tagRegex = /<(\/?[a-z][a-zA-Z0-9]*|PremiumGate|AmazonStickyBar|WeatherBackground|LogoFull|PersonaBadge|LoadingScreen|Footer|RainRadar|AdSlot|NLPulse|LeadRescue|EmailSubscribe|NavBar|AffiliateCard|PietInlineTip)([^>]*?)>/gs;
let match;

while ((match = tagRegex.exec(code)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    
    if (fullTag.endsWith('/>')) continue;

    if (tagName.startsWith('/')) {
        const closingName = tagName.substring(1);
        if (stack.length > 0) {
            stack.pop();
        }
    } else {
        const line = code.substring(0, match.index).split('\n').length;
        stack.push({ name: tagName, line });
    }
}

console.log('Unclosed tags at the end:');
stack.forEach(t => console.log(`${t.name} at line ${t.line}`));
