// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { GlyphField, glyphOffset } from './lib/motion';

describe('motion helpers', () => {
  it('keeps the wave inside its amplitude and repeats', () => {
    for (let i = 0; i < 40; i++) {
      const v = glyphOffset(i, 1.7, 12);
      expect(Math.abs(v)).toBeLessThanOrEqual(12);
    }
    expect(glyphOffset(3, 0)).toBeCloseTo(Math.sin(3 * 0.55), 6);
    expect(glyphOffset(3, 0)).toBe(glyphOffset(3, 0));
  });

  it('renders an aria-hidden canvas for the glyph field', () => {
    const { container } = render(<GlyphField />);
    const canvas = container.querySelector('canvas.glyph-field');
    expect(canvas).not.toBeNull();
    expect(canvas.getAttribute('aria-hidden')).toBe('true');
  });
});
