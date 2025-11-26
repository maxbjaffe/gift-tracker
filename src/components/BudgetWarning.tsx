'use client';

import { useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import type { Recipient } from '@/types/database.types';

interface BudgetWarningProps {
  recipient: Recipient;
  currentSpending: number;
  additionalAmount?: number; // Optional - for preview when adding a new gift
  compact?: boolean;
}

export function BudgetWarning({
  recipient,
  currentSpending,
  additionalAmount = 0,
  compact = false
}: BudgetWarningProps) {
  const budget = recipient.max_purchased_budget || recipient.max_budget;

  // If no budget set, don't show anything
  if (!budget || budget <= 0) {
    return null;
  }

  const projectedSpending = currentSpending + additionalAmount;
  const percentage = Math.min((projectedSpending / budget) * 100, 100);
  const remaining = Math.max(budget - projectedSpending, 0);
  const isOver = projectedSpending > budget;
  const isNearLimit = percentage >= 80 && !isOver;

  // Determine alert variant
  const getAlertVariant = () => {
    if (isOver) return 'destructive';
    if (isNearLimit) return 'default'; // Warning yellow
    return null;
  };

  const variant = getAlertVariant();

  // Don't show if under 50% and no additional amount
  if (!additionalAmount && percentage < 50) {
    return null;
  }

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">
            Budget: ${budget.toFixed(2)}
          </span>
          <span className={`font-semibold ${isOver ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        <Progress
          value={percentage}
          className={`h-1.5 ${isOver ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : ''}`}
        />
        {additionalAmount > 0 && (
          <p className="text-xs text-gray-600">
            +${additionalAmount.toFixed(2)} = ${projectedSpending.toFixed(2)} total
          </p>
        )}
      </div>
    );
  }

  if (!variant) {
    // Show simple progress if not near limit
    return (
      <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">Budget Progress</span>
          </div>
          <span className="text-sm font-semibold text-blue-600">
            {percentage.toFixed(0)}%
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Spent: ${projectedSpending.toFixed(2)}</span>
          <span>Budget: ${budget.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  return (
    <Alert variant={variant}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              {isOver ? 'Over Budget!' : 'Near Budget Limit'}
            </span>
            <span className="text-sm font-bold">
              {percentage.toFixed(0)}%
            </span>
          </div>
          <Progress
            value={percentage}
            className={`h-2 ${isOver ? 'bg-red-200' : 'bg-yellow-200'}`}
          />
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between">
              <span>Current spending:</span>
              <span className="font-semibold">${currentSpending.toFixed(2)}</span>
            </div>
            {additionalAmount > 0 && (
              <div className="flex items-center justify-between">
                <span>This gift:</span>
                <span className="font-semibold">+${additionalAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Total spending:</span>
              <span className="font-semibold">${projectedSpending.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-1 mt-1">
              <span>Budget limit:</span>
              <span className="font-semibold">${budget.toFixed(2)}</span>
            </div>
            {isOver ? (
              <div className="flex items-center justify-between text-red-700 font-semibold">
                <span>Over budget:</span>
                <span>${(projectedSpending - budget).toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-green-700">
                <span>Remaining:</span>
                <span className="font-semibold">${remaining.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
