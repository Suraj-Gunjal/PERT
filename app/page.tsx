'use client';

import { useState, useCallback } from 'react';
import ActivityTable from '@/components/ActivityTable';
import GraphDisplay from '@/components/GraphDisplay';
import ResultsTable from '@/components/ResultsTable';
import StatsCard from '@/components/StatsCard';
import GanttChart from '@/components/GanttChart';
import { calculateCPM, validateActivities } from '@/lib/calculations';

type Activity = {
  id: string;
  name: string;
  duration: number;
  predecessors: string[];
  o: number;
  m: number;
  p: number;
};
type CalculationResults = {
  activities: (Activity & { es: number; ef: number; ls: number; lf: number; slack: number; critical: boolean })[];
  projectDuration: number;
  criticalPath: string[];
};

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([
    { id: 'A', name: 'Start', duration: 0, predecessors: [], o: 0, m: 0, p: 0 },
  ]);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [usePerT, setUsePERT] = useState(false);
  const [activeTab, setActiveTab] = useState('network'); // network, gantt, stats
  const [error, setError] = useState('');

  const handleAddActivity = useCallback(() => {
    const newId = String.fromCharCode(65 + activities.length);
    setActivities(prev => [
      ...prev,
      { id: newId, name: '', duration: 0, predecessors: [], o: 0, m: 0, p: 0 },
    ]);
  }, [activities.length]);

  const handleUpdateActivity = useCallback((index: number, field: string, value: string) => {
    setActivities(prev => {
      const updated = [...prev];
      const activity = updated[index];
      if (field === 'predecessors') {
        activity.predecessors = value
          .split(',')
          .map(v => v.trim())
          .filter(v => v);
      } else if (['duration', 'o', 'm', 'p'].includes(field)) {
        activity[field as 'duration' | 'o' | 'm' | 'p'] = Math.max(0, parseFloat(value) || 0);
      } else {
        activity[field as 'id' | 'name'] = value;
      }
      return updated;
    });
  }, []);

  const handleDeleteActivity = useCallback((index: number) => {
    setActivities(prev => {
      if (prev.length <= 1) return prev;
      const deleted = prev[index];
      const updated = prev.filter((_, i) => i !== index);
      return updated.map(activity => ({
        ...activity,
        predecessors: activity.predecessors.filter(p => p !== deleted.id),
      }));
    });
  }, []);

  const handleCalculate = useCallback(() => {
    try {
      setError('');
      const validation = validateActivities(activities);
      if (!validation.valid) {
        setError(validation.error || 'Please review the activity inputs.');
        return;
      }
      const calculatedResults = calculateCPM(activities, usePerT) as CalculationResults;
      setResults(calculatedResults);
    } catch (error) {
      setError(`Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [activities, usePerT]);

const handleLoadExample = useCallback(() => {
  setActivities([
    {
      id: 'A',
      name: 'Problem Definition & Requirements',
      duration: 4,
      predecessors: [],
      o: 3,
      m: 4,
      p: 6,
    },
    {
      id: 'B',
      name: 'Dataset Collection',
      duration: 7,
      predecessors: ['A'],
      o: 5,
      m: 7,
      p: 10,
    },
    {
      id: 'C',
      name: 'Data Cleaning & Preprocessing',
      duration: 6,
      predecessors: ['B'],
      o: 4,
      m: 6,
      p: 9,
    },
    {
      id: 'D',
      name: 'Exploratory Data Analysis',
      duration: 5,
      predecessors: ['C'],
      o: 3,
      m: 5,
      p: 7,
    },
    {
      id: 'E',
      name: 'Feature Engineering',
      duration: 6,
      predecessors: ['D'],
      o: 4,
      m: 6,
      p: 9,
    },
    {
      id: 'F',
      name: 'Model Development',
      duration: 10,
      predecessors: ['E'],
      o: 7,
      m: 10,
      p: 14,
    },
    {
      id: 'G',
      name: 'Model Evaluation & Tuning',
      duration: 7,
      predecessors: ['F'],
      o: 5,
      m: 7,
      p: 10,
    },
    {
      id: 'H',
      name: 'Backend API Development',
      duration: 8,
      predecessors: ['C'],
      o: 6,
      m: 8,
      p: 11,
    },
    {
      id: 'I',
      name: 'Frontend Dashboard',
      duration: 7,
      predecessors: ['H'],
      o: 5,
      m: 7,
      p: 10,
    },
    {
      id: 'J',
      name: 'Model Integration',
      duration: 5,
      predecessors: ['G', 'I'],
      o: 3,
      m: 5,
      p: 8,
    },
    {
      id: 'K',
      name: 'Testing & Validation',
      duration: 6,
      predecessors: ['J'],
      o: 4,
      m: 6,
      p: 9,
    },
    {
      id: 'L',
      name: 'Deployment & Documentation',
      duration: 4,
      predecessors: ['K'],
      o: 3,
      m: 4,
      p: 6,
    },
  ]);

  setResults(null);
  setError('');
}, []);

  const handleClearAll = useCallback(() => {
    setActivities([{ id: 'A', name: 'Start', duration: 0, predecessors: [], o: 0, m: 0, p: 0 }]);
    setResults(null);
    setError('');
  }, []);

  const handleExport = useCallback(
    (format: 'csv' | 'json') => {
      if (!results) return;

      if (format === 'csv') {
        let csv = 'Activity,Name,Duration,ES,EF,LS,LF,Slack,Critical\n';
        results.activities.forEach(a => {
          csv += `${a.id},"${a.name}",${a.duration.toFixed(2)},${a.es.toFixed(2)},${a.ef.toFixed(2)},${a.ls.toFixed(2)},${a.lf.toFixed(2)},${a.slack.toFixed(2)},${
            a.critical ? 'Yes' : 'No'
          }\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pert_cpm_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      } else if (format === 'json') {
        const data = {
          exportDate: new Date().toISOString(),
          projectDuration: results.projectDuration,
          criticalPath: results.criticalPath,
          activities: results.activities,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pert_cpm_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
    },
    [results]
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">P</div>
          <div>
            <p className="eyebrow">Operations studio</p>
            <h1>PERT / CPM Planner</h1>
          </div>
        </div>
        <div className="topbar-meta">
          <span className="status-dot" />
          <span>Planning workspace</span>
        </div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow accent-eyebrow">Schedule intelligence</p>
          <h2>Turn dependencies into a clear delivery plan.</h2>
          <p className="intro-copy">Model activities, surface the critical path, and understand where your schedule has room to move.</p>
        </div>
        <div className="intro-note">
          <span className="note-line" />
          <p>Built for fast scenario planning<br />and confident project reviews.</p>
        </div>
      </section>

      <div className="content">
        <section className="panel input-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">01 / Define</p>
              <h3>Project activities</h3>
            </div>
            <span className="count-badge">{activities.length} {activities.length === 1 ? 'activity' : 'activities'}</span>
          </div>

          {error && (
            <div className="alert" role="alert"><span className="alert-icon">!</span>{error}</div>
          )}

          <div className="mode-switch">
            <label className="toggle-label">
              <input type="checkbox" checked={usePerT} onChange={e => setUsePERT(e.target.checked)} />
              <span className="toggle-track"><span /></span>
              <span><strong>PERT mode</strong><small>Use optimistic, likely, and pessimistic estimates</small></span>
            </label>
          </div>

          <ActivityTable
            activities={activities}
            onUpdate={handleUpdateActivity}
            onAdd={handleAddActivity}
            onDelete={handleDeleteActivity}
            usePERT={usePerT}
          />

          <div className="controls action-row">
            <button onClick={handleCalculate} className="btn btn-primary calculate-button">
              <span>Run analysis</span><span className="button-arrow">↗</span>
            </button>
            <button onClick={handleLoadExample} className="btn btn-secondary btn-small">
              Load example
            </button>
            <button onClick={handleClearAll} className="btn btn-danger btn-small">
              Clear
            </button>
          </div>
        </section>

        <section className="panel results-panel">
          {results ? (
            <>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">02 / Read</p>
                  <h3>Schedule overview</h3>
                </div>
                <span className="live-badge"><span />Calculated</span>
              </div>

              <StatsCard results={results} />

              <ResultsTable results={results} />

              <div className="controls export-row">
                <button
                  onClick={() => handleExport('csv')}
                  className="btn btn-success btn-small"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="btn btn-success btn-small"
                >
                  Export JSON
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">↗</div>
              <p className="eyebrow">02 / Read</p>
              <h3>Your schedule, at a glance.</h3>
              <p>Run the analysis to reveal duration, float, and the activities that control delivery.</p>
            </div>
          )}
        </section>
      </div>

      {results && (
        <section className="visual-section">
          <div className="visual-heading">
            <div>
              <p className="eyebrow">03 / Explore</p>
              <h3>Project visualizations</h3>
            </div>
            <p>Follow the shape of the plan, then inspect the pressure points.</p>
          </div>

          <div className="view-tabs">
            <button
              onClick={() => setActiveTab('network')}
              className={`tab-button ${activeTab === 'network' ? 'active' : ''}`}
            >
              <span className="tab-number">01</span> Network graph
            </button>
            <button
              onClick={() => setActiveTab('gantt')}
              className={`tab-button ${activeTab === 'gantt' ? 'active' : ''}`}
            >
              <span className="tab-number">02</span> Gantt chart
            </button>
          </div>

          {activeTab === 'network' && <GraphDisplay results={results} activities={activities} />}
          {activeTab === 'gantt' && <GanttChart results={results} />}
        </section>
      )}
      <footer className="footer">PERT / CPM Planner <span>•</span> A practical view of schedule risk and momentum</footer>
    </main>
  );
}

// FILE: components/ActivityTable.js


// FILE: components/ResultsTable.js

// FILE: components/StatsCard.js

// FILE: components/GraphDisplay.js


// FILE: components/GanttChart.js

// FILE: lib/calculations.js
/**
 * calculateCPM - Main CPM calculation engine
 * Implements the Critical Path Method for project scheduling
 * Uses forward and backward pass algorithms to compute scheduling parameters
 */

/**
 * Validate activities for circular dependencies and missing predecessors
 */


// FILE: next.config.js

// FILE: package.json


// FILE: .gitignore

/*
╔═══════════════════════════════════════════════════════════════╗
║          PERT/CPM NETWORK ANALYSIS - COMPLETE APP            ║
╚═══════════════════════════════════════════════════════════════╝

INSTALLATION & SETUP:
═══════════════════════

1. Create Next.js project:
   npx create-next-app@latest pert-cpm --typescript=false --tailwind=false --eslint=false

2. Copy all files from this artifact into your project

3. Create directory structure:
   mkdir -p components lib public

4. Install dependencies:
   npm install

5. Run application:
   npm run dev

6. Open browser:
   http://localhost:3000

═══════════════════════════════════════════════════════════════

PROJECT STRUCTURE:
═══════════════════

pert-cpm-analyzer/
├── app/
│   ├── page.js              (Main page & state management)
│   ├── layout.js            (Root layout)
│   └── globals.css          (Global styling)
├── components/
│   ├── ActivityTable.js     (Activity input form)
│   ├── ResultsTable.js      (CPM results table)
│   ├── StatsCard.js         (Statistics dashboard)
│   ├── GraphDisplay.js      (Network diagram - Canvas)
│   └── GanttChart.js        (Gantt chart - SVG)
├── lib/
│   └── calculations.js      (CPM/PERT calculation engine)
├── package.json
├── next.config.js
├── jsconfig.json
└── .gitignore

═══════════════════════════════════════════════════════════════

FEATURES:
═════════

✅ CORE FUNCTIONALITY:
   • CPM (Critical Path Method) calculations
   • PERT (Program Evaluation Review Technique)
   • Forward pass (ES/EF calculation)
   • Backward pass (LS/LF calculation)
   • Slack/Float calculation
   • Critical path identification
   • Input validation & error handling
   • Circular dependency detection

✅ VISUALIZATIONS:
   • Interactive network graph (Canvas 2D)
   • Professional Gantt chart (SVG)
   • Critical path highlighting
   • Activity relationships display
   • Slack visualization in Gantt

✅ UI/UX:
   • Modern gradient design
   • Responsive layout (desktop/tablet/mobile)
   • Tab switching between views
   • Statistics dashboard
   • Real-time validation
   • Loading/error states
   • Smooth animations

✅ DATA MANAGEMENT:
   • Add/edit/delete activities
   • Load example projects
   • Clear all data
   • Export to CSV & JSON
   • Activity relationship management

═══════════════════════════════════════════════════════════════

CALCULATION ALGORITHMS:
═══════════════════════

FORWARD PASS (Calculate ES/EF):
───────────────────────────────
For each activity:
  • ES = MAX(EF of all predecessors)  [Start time]
  • EF = ES + Duration                [End time]

BACKWARD PASS (Calculate LS/LF):
────────────────────────────────
For each activity (reverse order):
  • LF = MIN(LS of all successors)    [Latest finish]
  • LS = LF - Duration                [Latest start]

CRITICAL PATH:
───────────────
Activities where: Slack = (LF - EF) ≈ 0

PERT CALCULATION:
─────────────────
Expected Duration = (O + 4M + P) / 6
Standard Dev = (P - O) / 6

═══════════════════════════════════════════════════════════════

USAGE EXAMPLE:
═══════════════

1. Click "Example" button to load sample project
2. Observe activities: Planning → Design → Dev → Testing
3. Click "Calculate CPM/PERT"
4. View results:
   • Critical path shown in red
   • Project duration displayed
   • All metrics calculated
5. Toggle between Network and Gantt visualizations
6. Export results as CSV or JSON

═══════════════════════════════════════════════════════════════

KEYBOARD SHORTCUTS & TIPS:
═════════════════════════

• Enter predecessors as comma-separated: A,B,C
• Use unique activity IDs
• PERT mode: all 3 estimates optional but recommended
• Critical path = sequence with zero slack
• Export before closing for data backup
• Mobile: scroll horizontally to see full tables

═══════════════════════════════════════════════════════════════

CUSTOMIZATION:
═══════════════

Colors in globals.css:
  • Primary: #667eea (purple)
  • Secondary: #764ba2 (dark purple)
  • Critical: #dc3545 (red)
  • Success: #28a745 (green)

Modify these for custom branding.

═══════════════════════════════════════════════════════════════

TROUBLESHOOTING:
═════════════════

Issue: "Circular dependency detected"
→ Check activity predecessors for loops

Issue: "Undefined predecessor"
→ Ensure predecessor activity ID exists

Issue: Network won't load
→ Ensure all activities have valid durations

Issue: Export button not working
→ Make sure calculation is completed first

═══════════════════════════════════════════════════════════════

DEPLOYMENT:
═════════════

To deploy on Vercel:

1. Push code to GitHub
2. Connect repo to Vercel
3. Vercel auto-detects Next.js
4. Click Deploy

Alternative: Build and serve locally
  npm run build
  npm run start

═══════════════════════════════════════════════════════════════
*/
