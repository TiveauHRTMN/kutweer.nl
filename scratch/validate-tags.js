const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../src/components/WeatherDashboard.tsx'), 'utf8');

const stack = [];
const tagRegex = /<(\/?[a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
let match;

while ((match = tagRegex.exec(code)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    const attributes = match[2];

    if (fullTag.endsWith('/>')) {
        // Self-closing
        continue;
    }

    if (tagName.startsWith('/')) {
        const closingName = tagName.substring(1);
        if (stack.length === 0) {
            console.error(`Unmatched closing tag: ${fullTag} at index ${match.index}`);
        } else {
            const opening = stack.pop();
            if (opening.name !== closingName) {
                console.error(`Mismatched tags: opened ${opening.name} but closed ${closingName} at index ${match.index}`);
            }
        }
    } else {
        stack.push({ name: tagName, index: match.index });
    }
}

console.log('Remaining open tags in stack:', stack.map(t => t.name).join(', '));
