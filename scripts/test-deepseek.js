/**
 * test-deepseek.js
 * Quick test to verify DeepSeek API integration
 * Run: node scripts/test-deepseek.js
 */

const fs = require('fs');
const path = require('path');

// Parse .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.trim().startsWith('#')) {
        envVars[key.trim()] = value.trim();
    }
});

const DEEPSEEK_API_KEY = envVars.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = envVars.DEEPSEEK_MODEL || 'deepseek-chat';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

async function testDeepSeek() {
    console.log('🔍 Testing DeepSeek API Integration...\n');
    console.log(`Model: ${DEEPSEEK_MODEL}`);
    console.log(`API Key configured: ${DEEPSEEK_API_KEY ? '✅ Yes' : '❌ No'}\n`);

    if (!DEEPSEEK_API_KEY) {
        console.error('❌ Error: DEEPSEEK_API_KEY not found in .env file');
        process.exit(1);
    }

    try {
        console.log('📡 Sending test request to DeepSeek API...\n');

        const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: DEEPSEEK_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are Guruji AI, a helpful Hindu ritual assistant for HmarePanditJi.'
                    },
                    {
                        role: 'user',
                        content: 'Namaste! What is the significance of Griha Pravesh puja? Please answer briefly.'
                    }
                ],
                temperature: 0.7,
                max_tokens: 200,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        console.log('✅ API Response received successfully!\n');
        console.log('─'.repeat(60));
        console.log('📜 Response:');
        console.log('─'.repeat(60));
        console.log(data.choices[0]?.message?.content || 'No content');
        console.log('─'.repeat(60));
        console.log(`\n📊 Tokens used: ${data.usage?.total_tokens || 'N/A'}`);
        console.log(`⏱️  Finish reason: ${data.choices[0]?.finish_reason || 'N/A'}\n`);
        console.log('✅ DeepSeek integration is working perfectly!\n');
        console.log('🙏 Jai Shri Ram!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check if your API key is valid');
        console.error('   2. Ensure you have internet connection');
        console.error('   3. Verify DEEPSEEK_MODEL is correct');
        console.error('   4. Check DeepSeek service status');
        process.exit(1);
    }
}

testDeepSeek();
