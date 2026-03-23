#!/usr/bin/env node
/**
 * ask-deepseek.js
 * ----------------
 * Quick script to ask DeepSeek AI anything from command line
 * Works great with Antigravity!
 * 
 * Usage:
 *   node scripts/ask-deepseek.js "Create a React component for..."
 *   node scripts/ask-deepseek.js --file apps/web/src/app/page.tsx "Fix TypeScript errors"
 */

const DEEPSEEK_API_KEY = 'sk-8ff9a856f5ea4c638fcd715c65655218';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// Parse command line arguments
const args = process.argv.slice(2);
const fileFlag = args.indexOf('--file');
let filePath = null;
let prompt = '';

if (fileFlag !== -1) {
    filePath = args[fileFlag + 1];
    prompt = args.slice(fileFlag + 2).join(' ');
} else {
    prompt = args.join(' ');
}

if (!prompt) {
    console.error('❌ Usage: node scripts/ask-deepseek.js "Your prompt here"');
    console.error('   Or: node scripts/ask-deepseek.js --file <filepath> "Your prompt"');
    process.exit(1);
}

// Read file content if --file is provided
let fileContent = '';
if (filePath) {
    const fs = require('fs');
    const path = require('path');
    
    try {
        const absolutePath = path.resolve(filePath);
        fileContent = fs.readFileSync(absolutePath, 'utf-8');
        console.log(`📄 Reading file: ${filePath}\n`);
    } catch (error) {
        console.error(`❌ Error reading file: ${error.message}`);
        process.exit(1);
    }
}

async function askDeepSeek(userPrompt, fileContent = '') {
    const messages = [
        {
            role: 'system',
            content: `You are an expert Next.js 14, React, and TypeScript developer. You help build HmarePanditJi - a Hindu pandit booking platform. Write clean, production-ready code following best practices. Always end with "🙏 Jai Shri Ram"`
        }
    ];

    if (fileContent) {
        messages.push({
            role: 'user',
            content: `Here's the file content:\n\n\`\`\`\n${fileContent}\n\`\`\`\n\nRequest: ${userPrompt}`
        });
    } else {
        messages.push({
            role: 'user',
            content: userPrompt
        });
    }

    try {
        console.log('🤔 Asking DeepSeek...\n');
        
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages,
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';

        return content;

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Main execution
(async () => {
    try {
        const answer = await askDeepSeek(prompt, fileContent);
        
        console.log('\n' + '='.repeat(60));
        console.log('🤖 DeepSeek Response:');
        console.log('='.repeat(60) + '\n');
        console.log(answer);
        console.log('\n' + '='.repeat(60));
        
        // Save to file
        const fs = require('fs');
        const outputPath = 'test-results/deepseek-response.md';
        
        // Ensure directory exists
        const dir = require('path').dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, `# DeepSeek AI Response\n\n**Prompt:** ${prompt}\n\n**File:** ${filePath || 'N/A'}\n\n**Timestamp:** ${new Date().toISOString()}\n\n---\n\n${answer}\n`);
        
        console.log(`\n💾 Saved to: ${outputPath}`);
        console.log('\n🙏 Jai Shri Ram!\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
