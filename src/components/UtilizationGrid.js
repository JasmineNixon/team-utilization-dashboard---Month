
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getUsersList } from '../Services/userService';

import './styles.css';
import { FaFilter } from 'react-icons/fa';

const UtilizationGrid = () => {

  const [users, setUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [tasksByUser, setTasksByUser] = useState({});
  const [days, setDays] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    generateWeekStartDates(selectedStartDate);
  }, [selectedStartDate]);

  const generateWeekStartDates = (startDate) => {
    const startOfWeek = new Date(startDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeks = [];
    for (let i = -6; i <= 6; i++) {
      const weekStart = new Date(startOfWeek);
      weekStart.setDate(startOfWeek.getDate() + i * 7);
      const options = { month: 'short', day: 'numeric' };
      weeks.push(weekStart.toLocaleDateString('en-US', options));
    }
    setDays(weeks);
  };

  useEffect(() => {
    getUsersList()
      .then(setUsers)
      .catch(err => console.error('Error loading users:', err));
  }, []);

  useEffect(() => {
    const fetchTasksForVisibleUsers = async () => {
      const indexOfLastUser = currentPage * usersPerPage;
      const indexOfFirstUser = indexOfLastUser - usersPerPage;
      const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

      for (const user of currentUsers) {
        if (!tasksByUser[user.id]) {
          const tasks = await fetchTasksForUser(user.id);
          setTasksByUser(prev => ({ ...prev, [user.id]: tasks }));
        }
      }
    };

    if (users.length) fetchTasksForVisibleUsers();
  }, [users, currentPage]);

  const API_KEY = 'apikey';
  const PASSWORD = '0b78127b3361cb3c7186fdc1b23bc152f905108d70a6c3e65761a86117557a5a';
  const authHeader = 'Basic ' + btoa(`${API_KEY}:${PASSWORD}`);

  const fetchTasksForUser = async (userId) => {
    const url = `https://cors-anywhere.herokuapp.com/http://164.68.99.129/api/v3/work_packages?filters=[{"assignee":{"operator":"=","values":["${userId}"]}}]`;
    try {
      const res = await axios.get(url, { headers: { Authorization: authHeader } });
      return res.data._embedded?.elements || [];
    } catch (error) {
      console.error(`Error fetching tasks for user ${userId}:`, error.message);
      return [];
    }
  };

  const toggleExpand = async (user) => {
    const isExpanding = expandedUserId !== user.id;
    setExpandedUserId(isExpanding ? user.id : null);

    if (isExpanding && !tasksByUser[user.id]) {
      const tasks = await fetchTasksForUser(user.id);
      setTasksByUser(prev => ({ ...prev, [user.id]: tasks }));
    }


  };

  const getCellColor = (percent) => {
    if (percent >= 100) return '#4caf5073';
    if (percent >= 50) return '#79bcf578';
    if (percent >= 10) return '#ffeb3b66';
    return '#f443368c';
  };

  const getWorkingDays = (start, end) => {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const parseISO8601DurationToHours = (duration) => {
    const match = duration.match(/P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/);
    if (!match) return 0;
    const days = parseInt(match[1]) || 0;
    const hours = parseInt(match[2]) || 0;
    const minutes = parseInt(match[3]) || 0;
    return days * 8 + hours + minutes / 60;
  };

  const calculateEffortThisWeek = (task, weekStart, weekEnd) => {
    const startDate = new Date(task.startDate || task.start);
    const endDate = new Date(task.dueDate || task.end);

    const estimatedHours = typeof task.estimatedTime === 'string'
      ? parseISO8601DurationToHours(task.estimatedTime)
      : task.estimatedTime || 0;

    if (startDate > weekEnd || endDate < weekStart || !estimatedHours) return 0;

    const totalWorkingDays = getWorkingDays(startDate, endDate);
    if (totalWorkingDays === 0) return 0;

    const overlapStart = new Date(Math.max(startDate, weekStart));
    const overlapEnd = new Date(Math.min(endDate, weekEnd));
    const overlapDays = getWorkingDays(overlapStart, overlapEnd);

    const effort = ((estimatedHours / totalWorkingDays) * overlapDays).toFixed(1);
    return parseFloat(effort);
  };

  const mapTasksToWeeks = (tasks) => {
    const weekMap = {};
    days.forEach(day => (weekMap[day] = []));

    tasks.forEach(task => {
      const start = new Date(task.startDate || task.start);
      const end = new Date(task.dueDate || task.end);

      days.forEach(day => {
        const [month, date] = day.split(' ');
        const weekStart = new Date(`${month} ${date}, ${new Date().getFullYear()}`);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        if ((start <= weekEnd && end >= weekStart)) {
          weekMap[day].push(task);
        }
      });
    });

    return weekMap;
  };

  const calculateUtilization = (userId, day) => {
    const tasks = tasksByUser[userId] || [];
    const weekMap = mapTasksToWeeks(tasks);
    const count = weekMap[day]?.length || 0;
    const percent = Math.min((count / 5) * 100, 100);
    return Math.round(percent);
  };
   


  //pagination 
  
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const currentPageNavigation = ()=>{

    if(currentPage !== 0)
      setCurrentPage(1) 
  }

  const handleWeekNavigation = (direction) => {
    const newDate = new Date(selectedStartDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedStartDate(newDate);
  };

  const handleEmployeeChange = (e) => setSelectedEmployee(e.target.value);
  const handleProjectChange = (e) => setSelectedProject(e.target.value);

  // Custom dropdown toggle
  const toggleMonthDropdown = () => setMonthDropdownOpen((open) => !open);

  // Handle selecting a month from custom dropdown
  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setMonthDropdownOpen(false);
  };

  const applyQuickFilter = (filter) => {
    const now = new Date();
    let start, end;

    if (filter === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (filter === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (filter === 'thisQuarter') {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), quarterStartMonth, 1);
      end = new Date(now.getFullYear(), quarterStartMonth + 3, 0);
    } else if (filter === 'custom') {
      start = '';
      end = '';
    }

    setStartDate(start ? start.toISOString().slice(0, 10) : '');
    setEndDate(end ? end.toISOString().slice(0, 10) : '');
    setActiveFilter(filter);
  };

  const filteredDays = days.filter((day) => {
    const date = new Date(day);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || date >= start) && (!end || date <= end);
  });

  const filteredEmployees = employees.filter((name) => {
    const matchesEmployee = selectedEmployee ? name === selectedEmployee : true;
    return matchesEmployee;
  });

  // Close dropdown if clicked outside
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMonthDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="util-grid">

      <div className="week-filter">
        <button onClick={() => handleWeekNavigation(-1)}>← Previous Weeks</button>
         <button onClick={currentPageNavigation}>Current Page</button>
        <button onClick={() => handleWeekNavigation(1)}>Next Weeks →</button>
      </div>


      {/* Filters and Legend */}
      <div className="filters-legend">
        <div className="filters">
          <select value={selectedEmployee} onChange={handleEmployeeChange}>
            <option value="">All Members</option>
            {employees.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <select value={selectedProject} onChange={handleProjectChange}>
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>

          {/* Custom Month dropdown */}
          <div
            ref={dropdownRef}
            style={{ position: 'relative', display: 'inline-block', marginLeft: 10 }}
          >
            <button
              type="button"
              className="month-dropdown-btn"
              onClick={toggleMonthDropdown}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                cursor: 'pointer',
                border: '1px solid #ccc',
                borderRadius: 4,
                backgroundColor: 'white',
                minWidth: 140,
              }}
            >
              <FaFilter style={{ marginRight: 6, color: '#0a738e' }} />
              <span>{selectedMonth || 'Select Month'}</span>
              <span style={{ marginLeft: 'auto' }}>{monthDropdownOpen ? '▲' : '▼'}</span>
            </button>

            {monthDropdownOpen && (
              <div
                className="month-dropdown-menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  minWidth: '140px',
                }}
              >
                <div
                  onClick={() => handleMonthSelect('')}
                  className="month-dropdown-item"
                  style={{ padding: '6px 10px', cursor: 'pointer' }}
                >
                  All Months
                </div>
                {months.map((month) => (
                  <div
                    key={month}
                    onClick={() => handleMonthSelect(month)}
                    className="month-dropdown-item"
                    style={{ padding: '6px 10px', cursor: 'pointer' }}
                  >
                    {month}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="legend">
          <span className="legend-item" style={{ backgroundColor: '#4caf5073' }}>100%+</span>
          <span className="legend-item" style={{ backgroundColor: '#79bcf578' }}>50–99%</span>
          <span className="legend-item" style={{ backgroundColor: '#ffeb3b66' }}>10–49%</span>
          <span className="legend-item" style={{ backgroundColor: '#f443368c' }}>0–9%</span>
        </div>
      </div>

      {/* Table Header */}

  

        {currentUsers.map(user => {
          const isExpanded = expandedUserId === user.id;
          const tasks = tasksByUser[user.id] || [];
          const weekMap = mapTasksToWeeks(tasks);

          const taskRows = isExpanded
            ? tasks.map(task => {
              const taskWeeks = days.filter(day =>
                weekMap[day]?.some(t => t.id === task.id)
              );
              return taskWeeks.length > 0 ? { task, taskWeeks } : null;
            }).filter(Boolean)
            : [];

          return (
            <React.Fragment key={user.id}>
              <div className="row">
                <div className="employee-cell teamname">
                  <button className="expand-btn" onClick={() => toggleExpand(user)}>
                    {isExpanded ? '−' : '+'}
                  </button>
                  {user.name}
                </div>
                {days.map((day, idx) => {
                  const percent = calculateUtilization(user.id, day);
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

              {isExpanded && taskRows.map(({ task, taskWeeks }) => (
                <div className="row task-row" key={task.id}>
                  <div className="employee-cell teamname task-cell">
                    <small>{task.subject}</small>
                  </div>
                  {days.map((day, idx) => {
                    const [month, date] = day.split(' ');
                    const weekStart = new Date(`${month} ${date}, ${new Date().getFullYear()}`);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);

                    const effort = calculateEffortThisWeek(task, weekStart, weekEnd);
                    return (
                      <div
                        key={idx}
                        className="month-cell task-cell"
                        style={{ backgroundColor: effort > 0 ? '#e0f7fa' : 'transparent' }}
                      >
                        {effort > 0 && <span className="effort-text">{effort}h</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>

      <div className="pagination-controls">
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <span style={{ margin: '0 10px' }}>Page {currentPage} of {totalPages}</span>
         <button onClick={currentPageNavigation}>Current Page</button>
        <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>

        {filteredEmployees.map((name) => (
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
              {filteredDays.map((day, idx) => {
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
  <>
    {[1, 2, 3].map((i) => (
      <div key={i} className="row expanded-row">
        <div className="employee-cell teamname">
          <em className='taskname'>{`Tasks List ${name} - Detail ${i}`}</em>
        </div>
        {filteredDays.map((day, idx) => (
          <div key={idx} className="month-cell detail-cell">
            {/* Detail content for row i and day */}
          </div>
        ))}
      </div>
    ))}
  </>
)}
          </React.Fragment>
        ))}

      </div>

      
    </div>
  );
};

export default UtilizationGrid;
