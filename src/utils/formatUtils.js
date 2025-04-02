import { config } from '../config.js';

// Helper functions for formatting numbers in the game 
export function formatNumber(number, decimals = config.ui.numberFormatting.maxDecimals) {
  // Round to specified decimal places
  const rounded = Number(Math.round(number + 'e' + decimals) + 'e-' + decimals);
  // If trimming trailing zeros is enabled in config
  if (config.ui.numberFormatting.trimTrailingZeros) {
    // Convert to string and remove trailing zeros after decimal
    return Number(rounded).toString();
  }
  // Otherwise return with fixed decimals
  return rounded.toFixed(decimals);
}