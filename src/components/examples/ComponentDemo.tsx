/**
 * Component Demo - Examples of using OKR System components
 *
 * This file demonstrates proper usage of all reusable components
 * built for the OKR Management System.
 */

import { Target } from 'lucide-react';
import { StatusBadge } from '../okr/StatusBadge';
import { ProgressBar } from '../okr/ProgressBar';
import { OKRCard } from '../okr/OKRCard';
import { KeyResultItem } from '../okr/KeyResultItem';
import { Navigation } from '../layout/Navigation';
import { DashboardCard } from '../dashboard/DashboardCard';
import type { Objective, KeyResult } from '@/types/okr';

export function ComponentDemo() {
  // Sample data
  const sampleObjective: Objective = {
    id: '1',
    title: 'Launch Mobile App Beta',
    description: 'Ship iOS and Android apps to 1000 beta testers by end of Q4',
    type: 'team',
    ownerId: 'user-1',
    teamId: 'team-1',
    timePeriod: 'Q4',
    year: 2025,
    status: 'active',
    category: 'Product',
    progress: 78,
    confidence: 'on-track',
    keyResultIds: ['kr-1', 'kr-2', 'kr-3'],
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-03T00:00:00Z',
  };

  const sampleKeyResult: KeyResult = {
    id: 'kr-1',
    objectiveId: '1',
    title: 'iOS app in App Store',
    ownerId: 'user-1',
    metricType: 'number',
    unit: 'beta users',
    startingValue: 0,
    targetValue: 1000,
    currentValue: 750,
    progress: 75,
    confidence: 'on-track',
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-03T00:00:00Z',
    lastCheckinAt: '2025-10-03T00:00:00Z',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Example */}
      <Navigation
        userRole="manager"
        activeRoute="/okrs"
        userName="Sarah Chen"
        onNavigate={(route) => console.log('Navigate to:', route)}
      />

      {/* Main Content */}
      <main className="lg:ml-60 pb-16 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">
            Component Demo
          </h1>

          {/* Dashboard Cards */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Dashboard Cards
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                title="Total OKRs"
                value={47}
                subtitle="↑12 this quarter"
                icon={Target}
                trend={{ value: 12, direction: 'up' }}
              />
              <DashboardCard
                title="Company Score"
                value="73%"
                icon={Target}
                trend={{ value: 5, direction: 'up' }}
              />
              <DashboardCard
                title="On Track"
                value={32}
                subtitle="68% of total"
                trend={{ value: 8, direction: 'up' }}
              />
              <DashboardCard
                title="At Risk"
                value={10}
                subtitle="21% of total"
                trend={{ value: 3, direction: 'down' }}
              />
            </div>
          </section>

          {/* Status Badges */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Status Badges
            </h2>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="on-track" />
              <StatusBadge status="at-risk" />
              <StatusBadge status="off-track" />
            </div>
          </section>

          {/* Progress Bars */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Progress Bars
            </h2>
            <div className="space-y-4 max-w-md">
              <ProgressBar progress={90} label="On Track (90%)" showPercentage />
              <ProgressBar progress={65} label="At Risk (65%)" showPercentage />
              <ProgressBar progress={35} label="Off Track (35%)" showPercentage />
              <ProgressBar progress={0} label="Not Started" showPercentage />
            </div>
          </section>

          {/* OKR Card */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              OKR Card
            </h2>
            <OKRCard
              objective={sampleObjective}
              expanded={true}
              onClick={() => console.log('Card clicked')}
            >
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900">
                  Key Results
                </h4>
                <KeyResultItem
                  keyResult={sampleKeyResult}
                  ownerName="Sarah Chen"
                  onClick={() => console.log('Update progress')}
                />
                <KeyResultItem
                  keyResult={{
                    ...sampleKeyResult,
                    id: 'kr-2',
                    title: 'Android app live',
                    metricType: 'boolean',
                    currentValue: 0,
                    targetValue: 1,
                    progress: 0,
                  }}
                  ownerName="Jake Miller"
                  onClick={() => console.log('Update progress')}
                />
                <KeyResultItem
                  keyResult={{
                    ...sampleKeyResult,
                    id: 'kr-3',
                    title: 'Achieve 4.5+ star rating',
                    metricType: 'number',
                    unit: 'stars',
                    currentValue: 4.2,
                    targetValue: 4.5,
                    progress: 93,
                  }}
                  ownerName="Sarah Chen"
                  onClick={() => console.log('Update progress')}
                />
              </div>
            </OKRCard>
          </section>

          {/* Key Result Items */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Key Result Items (Standalone)
            </h2>
            <div className="grid gap-4 max-w-2xl">
              <KeyResultItem
                keyResult={{
                  ...sampleKeyResult,
                  metricType: 'percentage',
                  currentValue: 67,
                  targetValue: 100,
                  progress: 67,
                }}
                ownerName="Sarah Chen"
                onClick={() => console.log('Update progress')}
              />
              <KeyResultItem
                keyResult={{
                  ...sampleKeyResult,
                  metricType: 'currency',
                  currentValue: 350000,
                  targetValue: 500000,
                  progress: 70,
                }}
                ownerName="Mike Ross"
                onClick={() => console.log('Update progress')}
              />
            </div>
          </section>

          {/* Usage Instructions */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Usage Instructions
            </h2>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Import Components
              </h3>
              <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto text-sm">
{`// Import individual components
import { StatusBadge } from '@/components/okr/StatusBadge';
import { ProgressBar } from '@/components/okr/ProgressBar';
import { OKRCard } from '@/components/okr/OKRCard';
import { KeyResultItem } from '@/components/okr/KeyResultItem';
import { Navigation } from '@/components/layout/Navigation';
import { DashboardCard } from '@/components/dashboard/DashboardCard';

// Or use index exports
import { StatusBadge, ProgressBar, OKRCard, KeyResultItem } from '@/components/okr';
import { Navigation } from '@/components/layout';
import { DashboardCard } from '@/components/dashboard';`}
              </pre>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
