import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders with aria-busy when loading', () => {
    render(<Button loading>Carregando</Button>);
    const btn = screen.getByRole('button', { name: 'Carregando' });
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });
});

