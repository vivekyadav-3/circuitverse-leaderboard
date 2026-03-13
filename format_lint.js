import fs from 'fs';

const data = JSON.parse(fs.readFileSync('lint_json.json', 'utf8'));

data.forEach(file => {
    if (file.messages.length > 0) {
        console.log(`File: ${file.filePath}`);
        file.messages.forEach(msg => {
            console.log(`  Line ${msg.line}:${msg.column} - ${msg.ruleId}: ${msg.message}`);
        });
    }
});
