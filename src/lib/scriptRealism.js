/**
 * Script Realism Utilities
 * Generates realistic values to replace script placeholders for immersive training
 */
/**
 * Generate realistic time slots for demo scheduling
 * Returns times like "2:00 PM" or "10:30 AM"
 */
export function generateTimeSlot(slotNumber) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Morning slots: 10 AM, 10:30 AM, 11 AM, 11:30 AM
    // Afternoon slots: 2 PM, 2:30 PM, 3 PM, 3:30 PM, 4 PM
    const timeSlots = [
        '10:00 AM',
        '10:30 AM',
        '11:00 AM',
        '11:30 AM',
        '2:00 PM',
        '2:30 PM',
        '3:00 PM',
        '3:30 PM',
        '4:00 PM'
    ];
    // Return based on slot number, with some randomization
    const baseIndex = (slotNumber - 1) * 2;
    const randomOffset = Math.floor(Math.random() * 3);
    const index = (baseIndex + randomOffset) % timeSlots.length;
    return timeSlots[index];
}
/**
 * Generate realistic date for demo scheduling
 * Returns dates like "tomorrow" or "Wednesday" or "December 15th"
 */
export function generateDate(daysFromNow = 1) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    // Add ordinal suffix (st, nd, rd, th)
    const ordinalSuffix = (d) => {
        if (d > 3 && d < 21)
            return 'th';
        switch (d % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };
    if (daysFromNow === 1) {
        return 'tomorrow';
    }
    else if (daysFromNow <= 7) {
        return dayOfWeek; // "Wednesday"
    }
    else {
        return `${month} ${day}${ordinalSuffix(day)}`; // "December 15th"
    }
}
/**
 * Generate realistic day of week
 */
export function generateDay(daysFromNow = 1) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}
/**
 * Get default salesperson name (can be configured)
 */
export function getSalespersonName() {
    // This could be pulled from user config or settings
    const defaultNames = [
        'Sarah Al-Mansouri',
        'Ahmed Hassan',
        'Fatima Ibrahim',
        'Omar Khalid',
        'Layla Rahman'
    ];
    // Try to get from localStorage or use random
    const storedName = localStorage.getItem('salesperson-name');
    if (storedName)
        return storedName;
    return defaultNames[0]; // Default to first name
}
/**
 * Main script formatter with realistic value replacement
 * Removes ALL placeholder brackets for immersive experience
 */
export function formatScriptWithRealism(text, context, options = {}) {
    let formatted = text;
    // Replace prospect info (always)
    formatted = formatted
        .replace(/\[NAME\]/gi, context.prospectName || 'the prospect')
        .replace(/\[COMPANY NAME\]/gi, context.companyName || 'your company')
        .replace(/\[COMPANY\]/gi, context.companyName || 'your company')
        .replace(/\[THEIR INDUSTRY\]/gi, formatIndustryName(context.industry))
        .replace(/\[THEIR CORE OPERATION\]/gi, getIndustryOperation(context.industry));
    // Replace salesperson info
    const salespersonName = context.salespersonName || getSalespersonName();
    formatted = formatted.replace(/\[YOUR NAME\]/gi, salespersonName);
    // Replace time slots (if enabled)
    if (options.generateTimes !== false) {
        formatted = formatted
            .replace(/\[TIME 1\]/gi, generateTimeSlot(1))
            .replace(/\[TIME 2\]/gi, generateTimeSlot(2))
            .replace(/\[TIME\]/gi, generateTimeSlot(1));
    }
    // Replace dates (if enabled)
    if (options.generateDates !== false) {
        formatted = formatted
            .replace(/\[DATE\]/gi, generateDate(2))
            .replace(/\[DAY\]/gi, generateDay(1));
    }
    return formatted;
}
/**
 * Format industry name for natural speech
 */
function formatIndustryName(industry) {
    const industryMap = {
        'real-estate': 'real estate',
        'retail': 'retail',
        'trading': 'trading',
        'logistics': 'logistics',
        'consulting': 'consulting',
        'manufacturing': 'manufacturing',
        'healthcare': 'healthcare',
        'education': 'education'
    };
    return industryMap[industry] || industry.replace('-', ' ');
}
/**
 * Get industry-specific core operation
 */
function getIndustryOperation(industry) {
    const operationMap = {
        'real-estate': 'property deals and commission tracking',
        'retail': 'inventory and sales management',
        'trading': 'supplier relationships and procurement',
        'logistics': 'shipment tracking and client billing',
        'consulting': 'project management and time tracking',
        'manufacturing': 'production scheduling and quality control',
        'healthcare': 'patient records and appointment scheduling',
        'education': 'student enrollment and course management'
    };
    return operationMap[industry] || 'your daily operations';
}
/**
 * Set salesperson name (to be called from settings)
 */
export function setSalespersonName(name) {
    localStorage.setItem('salesperson-name', name);
}
/**
 * Remove any remaining placeholder brackets as fallback
 * This ensures nothing slips through
 */
export function removePlaceholderBrackets(text) {
    // Remove any remaining [PLACEHOLDER] patterns
    return text.replace(/\[([^\]]+)\]/g, (match, content) => {
        // If it's a common placeholder we missed, return a generic replacement
        const genericReplacements = {
            'AMOUNT': 'the amount',
            'DURATION': 'the timeline',
            'PERCENTAGE': 'the percentage',
            'NUMBER': 'the number'
        };
        return genericReplacements[content.toUpperCase()] || content;
    });
}
/**
 * Generate realistic pause indicators for script reading
 * Helps salespeople pace their delivery
 */
export function addPauseIndicators(text) {
    return text
        .replace(/\n\n/g, '\n\n[PAUSE 2 seconds]\n\n')
        .replace(/\?\n/g, '?\n[WAIT for response]\n');
}
