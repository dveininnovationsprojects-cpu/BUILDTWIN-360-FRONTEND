import React from 'react';
import { cn } from '@/design-system/utils/cn';
import { STATUS_TONE_CLASSES, WORKFLOW_STATUS_TONE } from '@/design-system/tokens/status';

/**
 * Renders any backend workflow status (DPR, NCR, alert severity, activity state, EVM status) consistently.
 * Gracefully accepts `status`, `children`, `label`, `tone`, `variant`, and `className`.
 */
export function StatusPill({
  status,
  children,
  label,
  tone,
  variant,
  className,
  ...props
}) {
  // Determine raw value for status/tone mapping
  const rawStatus = status !== undefined && status !== null ? String(status) : '';
  const rawChildren =
    children !== undefined && children !== null && typeof children === 'string'
      ? children
      : '';
  const rawLabel = label !== undefined && label !== null ? String(label) : '';

  // Determine display text
  let displayText = '—';
  if (children !== undefined && children !== null && children !== '') {
    displayText = children;
  } else if (rawLabel) {
    displayText = rawLabel;
  } else if (rawStatus) {
    displayText = rawStatus.replace(/_/g, ' ').toLowerCase();
  }

  // Determine tone
  const explicitTone = (tone || variant || '').toString().toLowerCase();

  let resolvedTone = 'neutral';
  if (explicitTone && STATUS_TONE_CLASSES[explicitTone]) {
    resolvedTone = explicitTone;
  } else if (rawStatus) {
    const normalizedKey = rawStatus.trim().toUpperCase().replace(/[\s-]+/g, '_');
    resolvedTone =
      WORKFLOW_STATUS_TONE[normalizedKey] ||
      (STATUS_TONE_CLASSES[rawStatus.toLowerCase()] ? rawStatus.toLowerCase() : 'neutral');
  } else if (rawChildren) {
    const normalizedKey = rawChildren.trim().toUpperCase().replace(/[\s-]+/g, '_');
    resolvedTone =
      WORKFLOW_STATUS_TONE[normalizedKey] ||
      (STATUS_TONE_CLASSES[rawChildren.toLowerCase()] ? rawChildren.toLowerCase() : 'neutral');
  } else if (rawLabel) {
    const normalizedKey = rawLabel.trim().toUpperCase().replace(/[\s-]+/g, '_');
    resolvedTone =
      WORKFLOW_STATUS_TONE[normalizedKey] ||
      (STATUS_TONE_CLASSES[rawLabel.toLowerCase()] ? rawLabel.toLowerCase() : 'neutral');
  }

  const toneClass = STATUS_TONE_CLASSES[resolvedTone] || STATUS_TONE_CLASSES.neutral;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        toneClass,
        className
      )}
      {...props}
    >
      {displayText}
    </span>
  );
}

export default StatusPill;
