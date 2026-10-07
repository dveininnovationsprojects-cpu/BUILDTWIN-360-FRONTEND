import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/design-system/utils/cn';
import { STATUS_TONE_CLASSES, WORKFLOW_STATUS_TONE } from '@/design-system/tokens/status';
/** Renders any backend workflow status (DPR, NCR, alert severity, activity state) consistently. */
export function StatusPill({ status, tone, className }) {
    const resolvedTone = tone ?? WORKFLOW_STATUS_TONE[status.toUpperCase().replace(/[\s-]+/g, '_')] ?? 'neutral';
    return (_jsx("span", { className: cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', STATUS_TONE_CLASSES[resolvedTone], className), children: status.replace(/_/g, ' ').toLowerCase() }));
}
