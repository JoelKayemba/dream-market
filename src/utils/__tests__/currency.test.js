import { formatPrice, getCurrencySymbol, formatPriceWithUnit } from '../currency';

describe('Currency Utils', () => {
  describe('formatPrice', () => {
    it('should format price with default currency EUR', () => {
      expect(formatPrice(1000)).toBe('1000.00€');
    });

    it('should format price with USD currency', () => {
      expect(formatPrice(50, 'USD')).toBe('50.00$');
    });

    it('should format price with CDF currency', () => {
      expect(formatPrice(1000, 'CDF')).toBe('1000.00FC');
    });

    it('should handle decimal prices', () => {
      expect(formatPrice(1234.56)).toBe('1234.56€');
    });

    it('should handle null or undefined', () => {
      expect(formatPrice(null)).toBe('0€');
      expect(formatPrice(undefined)).toBe('0€');
    });

    it('should handle invalid numbers', () => {
      expect(formatPrice('invalid')).toBe('0€');
      expect(formatPrice(NaN)).toBe('0€');
    });

    it('should handle zero', () => {
      expect(formatPrice(0)).toBe('0.00€');
    });

    it('should handle large numbers', () => {
      expect(formatPrice(1000000)).toBe('1000000.00€');
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return correct symbol for CDF', () => {
      expect(getCurrencySymbol('CDF')).toBe('FC');
    });

    it('should return correct symbol for USD', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
    });

    it('should return correct symbol for EUR', () => {
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    it('should return currency code as fallback', () => {
      expect(getCurrencySymbol('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('formatPriceWithUnit', () => {
    it('should format price with unit', () => {
      expect(formatPriceWithUnit(1000, 'kg', 'CDF')).toBe('1000.00FC/kg');
    });

    it('should handle null or undefined', () => {
      expect(formatPriceWithUnit(null, 'kg')).toBe('0€/kg');
    });
  });
});

