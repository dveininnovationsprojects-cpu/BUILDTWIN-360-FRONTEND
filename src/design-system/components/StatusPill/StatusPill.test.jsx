import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPill } from './StatusPill';

describe('StatusPill Component', () => {
  it('renders standard workflow status via status prop', () => {
    render(<StatusPill status="APPROVED" />);
    const pill = screen.getByText('approved');
    expect(pill).toBeInTheDocument();
    expect(pill.className).toContain('text-status-success');
  });

  it('renders children safely when status prop is omitted', () => {
    render(<StatusPill tone="info">On Budget</StatusPill>);
    const pill = screen.getByText('On Budget');
    expect(pill).toBeInTheDocument();
    expect(pill.className).toContain('text-status-info');
  });

  it('renders label prop when status is used for tone mapping', () => {
    render(<StatusPill status="SUCCESS" label="FULLY ACCEPTED" />);
    const pill = screen.getByText('FULLY ACCEPTED');
    expect(pill).toBeInTheDocument();
    expect(pill.className).toContain('text-status-success');
  });

  it('handles completely undefined status and tone without crashing', () => {
    render(<StatusPill />);
    const pill = screen.getByText('—');
    expect(pill).toBeInTheDocument();
    expect(pill.className).toContain('text-status-neutral');
  });

  it('handles EVM cost status and variants correctly', () => {
    render(<StatusPill tone="danger">Severe Cost Overrun</StatusPill>);
    const pill = screen.getByText('Severe Cost Overrun');
    expect(pill).toBeInTheDocument();
    expect(pill.className).toContain('text-status-danger');
  });

  it('normalizes snake_case status text to display words', () => {
    render(<StatusPill status="IN_PROGRESS" />);
    const pill = screen.getByText('in progress');
    expect(pill).toBeInTheDocument();
    expect(pill.className).toContain('text-status-info');
  });
});

