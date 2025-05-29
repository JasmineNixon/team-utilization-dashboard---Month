import React, { useState, useRef, useEffect } from 'react';
import './styles.css';
import { FaFilter } from 'react-icons/fa';

const UtilizationGrid = () => {
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeFilter, setActiveFilter] = useState('custom');

  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);

  const employees = ['John', 'Jane', 'Bob', 'Alice'];
  const projects = ['Project A', 'Project B', 'Project C'];
  const months = ['Last Month', 'This month', 'Next Month'];
  const days = [
    '2024-04-07', '2024-04-14', '2024-04-21', '2024-04-28',
    '2024-05-05', '2024-05-12', '2024-05-19', '2024-05-26',
    '2024-06-02', '2024-06-09', '2024-06-16', '2024-06-23', '2024-06-30'
  ];

  const utilizationData = {
    'John': {
      '2024-04-07': 100, '2024-04-14': 80, '2024-04-21': 60, '2024-04-28': 40, '2024-05-05': 2, '2024-05-12': 90,
      '2024-05-19': 140, '2024-05-26': 85, '2024-06-02': 75, '2024-06-09': 50, '2024-06-16': 65, '2024-06-23': 80, '2024-06-30': 95,
    },
    'Jane': {
      '2024-04-07': 60, '2024-04-14': 1, '2024-04-21': 80, '2024-04-28': 90, '2024-05-05': 120, '2024-05-12': 85,
      '2024-05-19': 75, '2024-05-26': 65, '2024-06-02': 55, '2024-06-09': 45, '2024-06-16': 35, '2024-06-23': 25, '2024-06-30': 15,
    },
    'Bob': {
      '2024-04-07': 10, '2024-04-14': 20, '2024-04-21': 30, '2024-04-28': 40, '2024-05-05': 50, '2024-05-12': 60,
      '2024-05-19': 70, '2024-05-26': 80, '2024-06-02': 90, '2024-06-09': 160, '2024-06-16': 75, '2024-06-23': 55, '2024-06-30': 35,
    },
    'Alice': {
      '2024-04-07': 95, '2024-04-14': 4, '2024-04-21': 75, '2024-04-28': 65, '2024-05-05': 55, '2024-05-12': 45,
      '2024-05-19': 35, '2024-05-26': 25, '2024-06-02': 15, '2024-06-09': 5, '2024-06-16': 20, '2024-06-23': 30, '2024-06-30': 40,
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
      <div className="grid-header">
        <div className="header-row">
          <div className="employee-cell teammember">Team Member</div>
          {filteredDays.map((day, index) => (
            <div key={index} className="month-header">
              {new Date(day).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
            </div>
          ))}
        </div>
      </div>

      {/* Table Body */}
      <div className="grid-body">
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
