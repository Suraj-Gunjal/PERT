'use client';
'use client';

import { useState, useCallback } from 'react';
import ActivityTable from '@/components/ActivityTable';
import GraphDisplay from '@/components/GraphDisplay';
import ResultsTable from '@/components/ResultsTable';
import StatsCard from '@/components/StatsCard';
import GanttChart from '@/components/GanttChart';
import { calculateCPM, validateActivities } from '@/lib/calculations';

export default function Home() {
  const [activities, setActivities] = useState([
    { id: 'A', name: 'Start', duration: 0, predecessors: [], o: 0, m: 0, p: 0 },
  ]);
  const [results, setResults] = useState(null);
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

  const handleUpdateActivity = useCallback((index, field, value) => {
    setActivities(prev => {
      const updated = [...prev];
      if (field === 'predecessors') {
        updated[index][field] = value
          .split(',')
          .map(v => v.trim())
          .filter(v => v);
      } else if (['duration', 'o', 'm', 'p'].includes(field)) {
        updated[index][field] = Math.max(0, parseFloat(value) || 0);
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  }, []);

  const handleDeleteActivity = useCallback(index => {
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
        setError(validation.error);
        return;
      }
      const calculatedResults = calculateCPM(activities, usePerT);
      setResults(calculatedResults);
    } catch (error) {
      setError(`Calculation error: ${error.message}`);
    }
  }, [activities, usePerT]);

  const handleLoadExample = useCallback(() => {
    setActivities([
      { id: 'A', name: 'Planning', duration: 5, predecessors: [], o: 3, m: 5, p: 7 },
      { id: 'B', name: 'Design', duration: 8, predecessors: ['A'], o: 6, m: 8, p: 10 },
      { id: 'C', name: 'Development', duration: 15, predecessors: ['B'], o: 12, m: 15, p: 18 },
      { id: 'D', name: 'Testing', duration: 6, predecessors: ['C'], o: 5, m: 6, p: 8 },
      { id: 'E', name: 'Documentation', duration: 4, predecessors: ['B'], o: 3, m: 4, p: 5 },
      { id: 'F', name: 'Deployment', duration: 3, predecessors: ['D', 'E'], o: 2, m: 3, p: 4 },
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
    format => {
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
    <div className="container">
      <div className="header">
        <h1>📊 PERT/CPM Network Analysis</h1>
        <p>Project Evaluation and Review Technique with Critical Path Method</p>
      </div>

      <div className="content">
        {/* LEFT COLUMN - INPUTS */}
        <div className="section">
          <div className="section-title">Input Activities</div>

          {error && (
            <div
              style={{
                padding: '12px',
                background: '#f8d7da',
                color: '#721c24',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <div className="control-group">
            <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
              <input type="checkbox" checked={usePerT} onChange={e => setUsePERT(e.target.checked)} />
              Use PERT (3-point estimates)
            </label>
          </div>

          <ActivityTable
            activities={activities}
            onUpdate={handleUpdateActivity}
            onAdd={handleAddActivity}
            onDelete={handleDeleteActivity}
            usePERT={usePerT}
          />

          <div className="controls">
            <button onClick={handleCalculate} className="btn btn-primary" style={{ flex: 1 }}>
              🔧 Calculate CPM/PERT
            </button>
            <button onClick={handleLoadExample} className="btn btn-secondary btn-small">
              📋 Example
            </button>
            <button onClick={handleClearAll} className="btn btn-danger btn-small">
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN - RESULTS */}
        <div className="section">
          {results ? (
            <>
              <div className="section-title">Results & Statistics</div>

              <StatsCard results={results} />

              <ResultsTable results={results} />

              <div className="controls">
                <button
                  onClick={() => handleExport('csv')}
                  className="btn btn-success btn-small"
                  style={{ flex: 1 }}
                >
                  📥 CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="btn btn-success btn-small"
                  style={{ flex: 1 }}
                >
                  📋 JSON
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📈</div>
              Click "Calculate CPM/PERT" to see results and analysis
            </div>
          )}
        </div>
      </div>

      {/* VISUALIZATIONS */}
      {results && (
        <div style={{ padding: '30px', borderTop: '1px solid #eee' }}>
          <div className="section-title" style={{ marginBottom: '20px' }}>
            Visualizations
          </div>

          <div className="controls" style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('network')}
              className={`btn ${activeTab === 'network' ? 'btn-primary' : 'btn-secondary'}`}
            >
              🌐 Network Graph
            </button>
            <button
              onClick={() => setActiveTab('gantt')}
              className={`btn ${activeTab === 'gantt' ? 'btn-primary' : 'btn-secondary'}`}
            >
              📊 Gantt Chart
            </button>
          </div>

          {activeTab === 'network' && <GraphDisplay results={results} activities={activities} />}
          {activeTab === 'gantt' && <GanttChart results={results} />}
        </div>
      )}
    </div>
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