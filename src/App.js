import React from 'react';
import UtilizationGrid from './components/UtilizationGrid';



const weekHeaders = [
  'Apr 7', 'Apr 14', 'Apr 21', 'Apr 28',
  'May 5', 'May 12', 'May 19', 'May 26',
  'Jun 2', 'Jun 9', 'Jun 16', 'Jun 23', 'Jun 30',
];

// Sample data keyed by week label, with utilization percentage
const sampleData = [
  {
    name: 'John',
    projects: {
      'Apr 7': 80, 'Apr 14': 100, 'Apr 21': 30, 'Apr 28': 50,
      'May 5': 60, 'May 12': 70, 'May 19': 0, 'May 26': 10,
      'Jun 2': 25, 'Jun 9': 90, 'Jun 16': 100, 'Jun 23': 50, 'Jun 30': 0,
    },
  },
  {
    name: 'Bob',
    projects: {
      'Apr 7': 50, 'Apr 14': 60, 'Apr 21': 40, 'Apr 28': 30,
      'May 5': 90, 'May 12': 85, 'May 19': 60, 'May 26': 40,
      'Jun 2': 10, 'Jun 9': 0, 'Jun 16': 20, 'Jun 23': 35, 'Jun 30': 40,
    },
  },
  {
    name: 'Alice',
    projects: {
      'Apr 7': 10, 'Apr 14': 15, 'Apr 21': 5, 'Apr 28': 0,
      'May 5': 10, 'May 12': 25, 'May 19': 15, 'May 26': 0,
      'Jun 2': 5, 'Jun 9': 10, 'Jun 16': 15, 'Jun 23': 20, 'Jun 30': 25,
    },
  },
];

function App() {
  return (
    <div style={{ padding: '10px' }}>
      <h2>Team Weekly Utilization Dashboard</h2>
      <div style={{ overflowX: 'auto', maxWidth: '100vw',borderRadius: 4 }}>
        <UtilizationGrid data={sampleData} weeks={weekHeaders} />
      </div>
    </div>
  );
}

export default App;
