// Utility functions for numeric conversion

export interface ConversionResult {
  originalInput: string;
  numericValue: number;
  shorthandForm: string;
  wordsForm: string;
  currency?: string;
  isValid: boolean;
}

// Currency symbols and their word representations
const CURRENCY_MAP = {
  '$': 'dollars',
  '€': 'euros', 
  '£': 'pounds',
  '¥': 'yen',
  '₹': 'rupees',
  '₽': 'rubles',
  '₩': 'won',
  '¢': 'cents'
} as const;

// Number to words conversion
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const SCALES = ['', 'thousand', 'million', 'billion', 'trillion'];

function convertHundreds(num: number): string {
  let result = '';
  
  if (num >= 100) {
    result += ONES[Math.floor(num / 100)] + ' hundred';
    num %= 100;
    if (num > 0) result += ' ';
  }
  
  if (num >= 20) {
    result += TENS[Math.floor(num / 10)];
    num %= 10;
    if (num > 0) result += '-' + ONES[num];
  } else if (num >= 10) {
    result += TEENS[num - 10];
  } else if (num > 0) {
    result += ONES[num];
  }
  
  return result;
}

export function numberToWords(num: number): string {
  if (num === 0) return 'zero';
  if (num < 0) return 'negative ' + numberToWords(-num);
  
  const parts = [];
  let scaleIndex = 0;
  
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk);
      if (scaleIndex > 0) {
        parts.unshift(chunkWords + ' ' + SCALES[scaleIndex]);
      } else {
        parts.unshift(chunkWords);
      }
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }
  
  return parts.join(' ');
}

// Parse shorthand notation (e.g., 1K, 2.5M, 1.2B)
export function parseShorthand(input: string): number | null {
  const cleanInput = input.replace(/[^0-9.KMBTkmbt]/g, '');
  const match = cleanInput.match(/^(\d+\.?\d*)([KMBTkmbt]?)$/);
  
  if (!match) return null;
  
  const [, numberPart, suffix] = match;
  const baseNumber = parseFloat(numberPart);
  
  if (isNaN(baseNumber)) return null;
  
  const multipliers = {
    'k': 1000, 'K': 1000,
    'm': 1000000, 'M': 1000000,
    'b': 1000000000, 'B': 1000000000,
    't': 1000000000000, 'T': 1000000000000
  } as const;
  
  const multiplier = suffix ? multipliers[suffix as keyof typeof multipliers] || 1 : 1;
  return baseNumber * multiplier;
}

// Convert number to shorthand
export function numberToShorthand(num: number): string {
  if (num === 0) return '0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 1000000000000) {
    return sign + (absNum / 1000000000000).toFixed(absNum % 1000000000000 === 0 ? 0 : 1) + 'T';
  } else if (absNum >= 1000000000) {
    return sign + (absNum / 1000000000).toFixed(absNum % 1000000000 === 0 ? 0 : 1) + 'B';
  } else if (absNum >= 1000000) {
    return sign + (absNum / 1000000).toFixed(absNum % 1000000 === 0 ? 0 : 1) + 'M';
  } else if (absNum >= 1000) {
    return sign + (absNum / 1000).toFixed(absNum % 1000 === 0 ? 0 : 1) + 'K';
  } else {
    return num.toString();
  }
}

// Extract currency symbol from input
export function extractCurrency(input: string): string | undefined {
  for (const symbol of Object.keys(CURRENCY_MAP)) {
    if (input.includes(symbol)) {
      return symbol;
    }
  }
  return undefined;
}

// Main conversion function
export function convertNumber(input: string): ConversionResult {
  const trimmedInput = input.trim();
  
  if (!trimmedInput) {
    return {
      originalInput: input,
      numericValue: 0,
      shorthandForm: '0',
      wordsForm: 'zero',
      isValid: false
    };
  }
  
  const currency = extractCurrency(trimmedInput);
  const currencyWord = currency ? CURRENCY_MAP[currency as keyof typeof CURRENCY_MAP] : undefined;
  
  // Try parsing as shorthand first
  let numericValue = parseShorthand(trimmedInput);
  
  // If shorthand parsing failed, try parsing as regular number
  if (numericValue === null) {
    const cleanNumber = trimmedInput.replace(/[^0-9.-]/g, '');
    numericValue = parseFloat(cleanNumber);
  }
  
  if (isNaN(numericValue)) {
    return {
      originalInput: input,
      numericValue: 0,
      shorthandForm: '0',
      wordsForm: 'invalid input',
      currency,
      isValid: false
    };
  }
  
  const shorthandForm = currency 
    ? currency + numberToShorthand(numericValue)
    : numberToShorthand(numericValue);
    
  const wordsForm = currencyWord 
    ? numberToWords(numericValue) + ' ' + currencyWord
    : numberToWords(numericValue);
  
  return {
    originalInput: input,
    numericValue,
    shorthandForm,
    wordsForm,
    currency,
    isValid: true
  };
}