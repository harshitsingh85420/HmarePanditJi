const fs = require('fs');
const data = JSON.parse(fs.readFileSync('eslint.json', 'utf8'));
const errors = [];
data.forEach(file => {
  file.messages.forEach(msg => {
    if (msg.severity === 2 || msg.severity === 'error' || msg.fatal) {
      errors.push(`${file.filePath}:${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId})`);
    }
  });
});
fs.writeFileSync('eslint_errors_utf8.txt', errors.join('\n'), 'utf8');
