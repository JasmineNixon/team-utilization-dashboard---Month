import React, { useState,useEffect } from 'react';
import { getUsersList ,getUsersTask } from '../Services/userService';
import './styles.css';

const UtilizationGrid = () => { 
 
 
 const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsersList()
      .then(data => {
        setUsers(data); // Adjust if `data` has nested structure like `data.items`
      })
      .catch(error => {
        console.error('Failed to load users:', error);
      });
  }, []);
   

  const [expandedRows, setExpandedRows] = useState({});
  const [tasksByUser, setTasksByUser] = useState({});

  const employees = ['John', 'Jane', 'Bob', 'Alice'];

  const days = [
    'Apr 7', 'Apr 14', 'Apr 21', 'Apr 28', 
    'May 5', 'May 12', 'May 19', 'May 26',
    'Jun 2', 'Jun 9', 'Jun 16', 'Jun 23', 'Jun 30'
  ];

   const utilizationData = {
    'John': {
      'Apr 7': 100, 'Apr 14': 80, 'Apr 21': 60, 'Apr 28': 40, 'May 5': 2, 'May 12': 90,
      'May 19': 140, 'May 26': 85, 'Jun 2': 75, 'Jun 9': 50, 'Jun 16': 65, 'Jun 23': 80, 'Jun 30': 95,
    },
    'Jane': {
      'Apr 7': 60, 'Apr 14': 1, 'Apr 21': 80, 'Apr 28': 90, 'May 5': 120, 'May 12': 85,
      'May 19': 75, 'May 26': 65, 'Jun 2': 55, 'Jun 9': 45, 'Jun 16': 35, 'Jun 23': 25, 'Jun 30': 15,
    },
    'Bob': {
      'Apr 7': 10, 'Apr 14': 20, 'Apr 21': 30, 'Apr 28': 40, 'May 5': 50, 'May 12': 60,
      'May 19': 70, 'May 26': 80, 'Jun 2': 90, 'Jun 9': 160, 'Jun 16': 75, 'Jun 23': 55, 'Jun 30': 35,
    },
    'Alice': {
      'Apr 7': 95, 'Apr 14': 4, 'Apr 21': 75, 'Apr 28': 65, 'May 5': 55, 'May 12': 45,
      'May 19': 35, 'May 26': 25, 'Jun 2': 15, 'Jun 9': 5, 'Jun 16': 20, 'Jun 23': 30, 'Jun 30': 40,
    },
  };

  const getCellColor = (percent) => {
    if (percent >= 100) return '#4caf5073';
    if (percent >= 50) return '#79bcf578';
    if (percent >= 10) return '#ffeb3b66';
    return '#f443368c';
  };

  const toggleExpand = (name) => {
    setExpandedRows((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // const toggleExpand = async (user) => {
  //   setExpandedRows(prev => ({
  //     ...prev,
  //     [user.name]: !prev[user.name],
  //   }));

  //   // if (!tasksByUser[user.id]) {
  //   //   try {
  //   //     const tasks = await getUsersTask(user.id);
  //   //     setTasksByUser(prev => ({
  //   //       ...prev,
  //   //       [user.id]: tasks,
  //   //     }));
  //   //   } catch (err) {
  //   //     console.error('Error fetching tasks for user:', user.name, err);
  //   //   }
  //   // }
  // };

  return (
    <div className="util-grid">
      <div className="grid-header">
        <div className="header-row">
          <div className="employee-cell teammember">Team Member</div>
          {days.map((day, index) => (
            <div key={index} className="month-header">{day}</div>
          ))}
        </div>
      </div>

      <div className="grid-body">
        {users.map((name) => (
          <React.Fragment key={name}>
            <div className="row">
              <div className="employee-cell teamname">
                <button 
                  className="expand-btn"
                  onClick={() => toggleExpand(name)}
                >
                  {expandedRows[name] ? '−' : '+'}
                </button>
                {name}
              </div>
              {days.map((day, idx) => {
                const percent = utilizationData[name]?.[day] || 0;
                return (
                  <div 
                    key={idx} 
                    className="month-cell" 
                    style={{ backgroundColor: getCellColor(percent) }}
                  >
                    <span className="project-percent">{percent}%</span>
                  </div>
                );
              })}
            </div>

            {expandedRows[name] && (
              <div className="row expanded-row">
                <div className="employee-cell teamname">
                  <em>Tasks List {name}</em>
                </div>
                {days.map((day, idx) => (
                  <div key={idx} className="month-cell detail-cell">
                    <small>Task A</small>
                  </div>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>


     
  );
};

export default UtilizationGrid;
