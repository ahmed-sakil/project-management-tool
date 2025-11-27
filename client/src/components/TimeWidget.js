import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default styles
import './TimeWidget.css'; // We will create this for Glassmorphism

const TimeWidget = () => {
  const [date, setDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Time (e.g., 10:45:30 AM)
  const formatTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  // Format Date (e.g., Mon, Nov 27)
  const formatDate = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className={`time-widget-container ${isOpen ? 'expanded' : ''}`}>
      
      {/* 1. The Clock Face (Visible when closed) */}
      {!isOpen && (
        <div className="clock-face" onClick={() => setIsOpen(true)}>
          <div className="time-display">{formatTime}</div>
          <div className="date-display">{formatDate}</div>
        </div>
      )}

      {/* 2. The Calendar (Visible when open) */}
      {isOpen && (
        <div className="calendar-wrapper">
          <div className="close-btn" onClick={(e) => {
            e.stopPropagation(); 
            setIsOpen(false);
          }}>
            &times; {/* X icon */}
          </div>
          <Calendar 
            onChange={setDate} 
            value={date} 
            className="glass-calendar"
          />
          <div className="current-time-footer">
            {formatTime}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeWidget;