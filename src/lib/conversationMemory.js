/**
 * Conversation Memory System
 * Tracks key points, promises, concerns across the conversation
 * Helps AI maintain context and reference earlier discussion naturally
 */
/**
 * Extract key information from conversation
 */
export function updateConversationMemory(context) {
    const memory = {
        keyPoints: [],
        salespersonPromises: [],
        unresolvedConcerns: [],
        priceDiscussed: false,
        competitorsMentioned: [],
        timelineDiscussed: false,
        featuresDiscussed: [],
        objectionHistory: []
    };
    for (const message of context.messages) {
        const content = message.content.toLowerCase();
        // Track price mentions
        if (content.match(/aed|price|cost|budget|payment/i)) {
            memory.priceDiscussed = true;
            // Extract specific amounts
            const amountMatch = content.match(/aed\s*[\d,]+k?/i);
            if (amountMatch) {
                memory.priceAmount = amountMatch[0];
            }
        }
        // Track competitor mentions
        const competitors = ['sap', 'microsoft', 'oracle', 'zoho', 'netsuite', 'salesforce'];
        for (const competitor of competitors) {
            if (content.includes(competitor) && !memory.competitorsMentioned.includes(competitor)) {
                memory.competitorsMentioned.push(competitor);
            }
        }
        // Track timeline mentions
        if (content.match(/\d+\s*(days?|weeks?|months?)/i)) {
            memory.timelineDiscussed = true;
            const timelineMatch = content.match(/\d+\s*(days?|weeks?|months?)/i);
            if (timelineMatch) {
                memory.timelineValue = timelineMatch[0];
            }
        }
        // Track salesperson promises (from salesperson messages)
        if (message.role === 'salesperson') {
            if (content.match(/i will|i'll|we will|we'll|i promise|guaranteed/i)) {
                const promiseMatch = content.match(/(?:i will|i'll|we will|we'll)\s+([^.!?]+)/i);
                if (promiseMatch) {
                    memory.salespersonPromises.push(promiseMatch[1].trim());
                }
            }
        }
        // Track prospect concerns (from agent messages with questions)
        if (message.role === 'agent' && content.includes('?')) {
            const concernMatch = content.match(/(?:what about|how|what if|can you|do you)\s+([^?]+)/i);
            if (concernMatch) {
                const concern = concernMatch[1].trim();
                // Check if this concern was addressed in subsequent messages
                const wasAddressed = checkIfConcernAddressed(concern, context.messages, message.id);
                if (!wasAddressed) {
                    memory.unresolvedConcerns.push(concern);
                }
            }
        }
        // Track objections
        if (message.objectionType) {
            memory.objectionHistory.push({
                type: message.objectionType,
                resolved: false, // Would need more logic to determine if truly resolved
                messageId: message.id
            });
        }
        // Track features discussed
        const features = ['automation', 'ai', 'odoo', 'erp', 'crm', 'reporting', 'integration', 'mobile'];
        for (const feature of features) {
            if (content.includes(feature) && !memory.featuresDiscussed.includes(feature)) {
                memory.featuresDiscussed.push(feature);
            }
        }
        // Track key discussion points
        if (message.role === 'agent') {
            // Add if message contains important business statements
            if (content.match(/we need|we want|we're looking for|important to us|our goal/i)) {
                const keyPoint = message.content.substring(0, 100); // First 100 chars
                if (!memory.keyPoints.includes(keyPoint)) {
                    memory.keyPoints.push(keyPoint);
                }
            }
        }
    }
    // Deduplicate and limit
    memory.keyPoints = [...new Set(memory.keyPoints)].slice(0, 5);
    memory.salespersonPromises = [...new Set(memory.salespersonPromises)].slice(0, 3);
    memory.unresolvedConcerns = [...new Set(memory.unresolvedConcerns)].slice(0, 3);
    return memory;
}
/**
 * Check if a concern was addressed in subsequent messages
 */
function checkIfConcernAddressed(concern, messages, concernMessageId) {
    const concernIndex = messages.findIndex(m => m.id === concernMessageId);
    if (concernIndex === -1)
        return false;
    // Look at next 3 salesperson messages
    const subsequentMessages = messages.slice(concernIndex + 1, concernIndex + 7);
    const salespersonResponses = subsequentMessages.filter(m => m.role === 'salesperson');
    // Simple check: did salesperson mention related keywords?
    const concernKeywords = concern.toLowerCase().split(' ').filter(w => w.length > 4);
    for (const response of salespersonResponses) {
        const responseContent = response.content.toLowerCase();
        // If salesperson message contains concern keywords, consider it addressed
        if (concernKeywords.some(keyword => responseContent.includes(keyword))) {
            return true;
        }
    }
    return false;
}
/**
 * Generate memory-aware prompt additions
 * This gets appended to the user prompt to make AI reference previous discussion
 */
export function generateMemoryPrompt(memory) {
    if (!hasSignificantMemory(memory)) {
        return ''; // No significant memory to reference
    }
    let memoryPrompt = '\n\n📝 CONVERSATION MEMORY (Reference these naturally when relevant):\n\n';
    // Price discussion
    if (memory.priceDiscussed) {
        memoryPrompt += `💰 PRICING: Price was discussed${memory.priceAmount ? ` (${memory.priceAmount})` : ''}. You know the cost now. React accordingly.\n`;
    }
    // Competitors mentioned
    if (memory.competitorsMentioned.length > 0) {
        memoryPrompt += `🔄 COMPETITORS: You mentioned comparing with: ${memory.competitorsMentioned.join(', ')}. Feel free to reference them or ask how this compares.\n`;
    }
    // Timeline discussion
    if (memory.timelineDiscussed && memory.timelineValue) {
        memoryPrompt += `⏰ TIMELINE: ${memory.timelineValue} was mentioned. Remember this commitment.\n`;
    }
    // Unresolved concerns
    if (memory.unresolvedConcerns.length > 0) {
        memoryPrompt += `⚠️ UNRESOLVED CONCERNS: You asked about:\n`;
        for (const concern of memory.unresolvedConcerns) {
            memoryPrompt += `   - "${concern}" - STILL NOT ANSWERED. Push back: "You still haven't explained..."\n`;
        }
    }
    // Salesperson promises
    if (memory.salespersonPromises.length > 0) {
        memoryPrompt += `📋 THEY PROMISED:\n`;
        for (const promise of memory.salespersonPromises) {
            memoryPrompt += `   - "${promise}" - Hold them accountable if not delivered!\n`;
        }
    }
    // Features discussed
    if (memory.featuresDiscussed.length > 0) {
        memoryPrompt += `✓ FEATURES COVERED: ${memory.featuresDiscussed.join(', ')} - Reference these naturally.\n`;
    }
    memoryPrompt += `\n💡 USE THIS MEMORY:
- Reference earlier points naturally: "You mentioned X earlier, but..."
- Hold them accountable: "You said you'd do Y, but I haven't seen..."
- Build on previous discussion: "Going back to what we discussed about Z..."
- Show you're listening: "So if I understand from earlier..."
- Don't let things slip: "Wait, you never answered my question about..."\n`;
    return memoryPrompt;
}
/**
 * Check if there's significant memory worth referencing
 */
function hasSignificantMemory(memory) {
    return (memory.priceDiscussed ||
        memory.competitorsMentioned.length > 0 ||
        memory.unresolvedConcerns.length > 0 ||
        memory.salespersonPromises.length > 0 ||
        memory.featuresDiscussed.length > 2);
}
/**
 * Get memory summary for coaching/analytics
 */
export function getMemorySummary(memory) {
    const parts = [];
    if (memory.priceDiscussed) {
        parts.push(`Price discussed${memory.priceAmount ? `: ${memory.priceAmount}` : ''}`);
    }
    if (memory.competitorsMentioned.length > 0) {
        parts.push(`Competitors mentioned: ${memory.competitorsMentioned.join(', ')}`);
    }
    if (memory.timelineDiscussed) {
        parts.push(`Timeline: ${memory.timelineValue || 'discussed'}`);
    }
    if (memory.unresolvedConcerns.length > 0) {
        parts.push(`${memory.unresolvedConcerns.length} unresolved concern(s)`);
    }
    if (memory.salespersonPromises.length > 0) {
        parts.push(`${memory.salespersonPromises.length} promise(s) made`);
    }
    return parts.join(' | ');
}
