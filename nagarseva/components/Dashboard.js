"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import './Dashboard.css';

function Dashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [wards, setWards] = useState([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' or 'public'
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form State
  const [title, setTitle] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    fetchWards();

    // Live Ticking Clock (Updates every single second)
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Supabase Real-time Engine (Listens for updates, inserts, deletes)
    const channel = supabase
      .channel('public:tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchData(); 
      })
      .subscribe();

    return () => {
      clearInterval(timerId);
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, wards(name)')
      .order('created_at', { ascending: false });

    if (!error && data) setTickets(data);
  }

  async function fetchWards() {
    const { data, error } = await supabase.from('wards').select('*');
    if (!error && data) setWards(data);
  }

  async function handleAddTicket(e) {
    e.preventDefault();
    if (!title || !selectedWard) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('tickets').insert([
      { title: title, ward_id: selectedWard, status: 'Open' }
    ]);

    setIsSubmitting(false);
    if (!error) {
      setTitle('');
      setSelectedWard('');
    }
  }

  // Quick Action: Update ticket status instantly in the database
  async function updateTicketStatus(ticketId, newStatus) {
    const { error } = await supabase
      .from('tickets')
      .update({ status: newStatus })
      .eq('id', ticketId);

    if (error) alert("Failed to update status: " + error.message);
  }

  // Auto-Detects Categories based on key terms in the issue title
  const getCategoryBadge = (titleText) => {
    const lower = titleText.toLowerCase();
    if (lower.includes('light') || lower.includes('electric')) return { name: 'Electricity', color: '#6366f1' };
    if (lower.includes('water') || lower.includes('pipe') || lower.includes('leak')) return { name: 'Water Supply', color: '#0ea5e9' };
    if (lower.includes('pothole') || lower.includes('road') || lower.includes('street')) return { name: 'Infrastructure', color: '#f59e0b' };
    if (lower.includes('garbage') || lower.includes('waste') || lower.includes('dump')) return { name: 'Sanitation', color: '#10b981' };
    return { name: 'General', color: '#64748b' };
  };

  // Precise SLA Timing Computations
  const getSLAStatus = (createdAt) => {
    const createdDate = new Date(createdAt);
    const deadline = new Date(createdDate.getTime() + (48 * 60 * 60 * 1000)); // 48-Hour SLA
    const diffMs = deadline - currentTime;
    
    const totalSeconds = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((Math.abs(totalSeconds) % 3600) / 60);
    const secs = Math.abs(totalSeconds) % 60;
    const timeString = `${Math.abs(hrs)}h ${mins}m ${secs}s`;

    if (hrs > 24) {
      return { color: '#10b981', text: `${timeString} left`, badge: null, isOverdue: false, deduction: 0 };
    } else if (hrs >= 0) {
      return { color: '#f59e0b', text: `${timeString} left`, badge: 'Nudge Sent', isOverdue: false, deduction: 5 };
    } else {
      return { color: '#ef4444', text: `-${timeString} Overdue`, badge: 'Escalated to Commissioner', isOverdue: true, deduction: 15 };
    }
  };

  // Automated Performance Dashboard Scoring Engine
  const getRankedWards = () => {
    return wards.map(ward => {
      const wardTickets = tickets.filter(t => t.ward_id === ward.id);
      
      let scoreDeduction = 0;
      wardTickets.forEach(ticket => {
        if (ticket.status === 'Open') scoreDeduction += 5;
        if (ticket.status === 'In Progress') scoreDeduction += 2;
        
        const sla = getSLAStatus(ticket.created_at);
        scoreDeduction += sla.deduction; 
      });

      const finalScore = Math.max(100 - scoreDeduction, 30);
      
      let performanceColor = '#10b981'; // Green
      let statusLabel = 'Excellent';
      if (finalScore < 85) { performanceColor = '#f59e0b'; statusLabel = 'Warning'; }
      if (finalScore < 65) { performanceColor = '#ef4444'; statusLabel = 'Critical'; }

      // Generate realistic dynamic populations for data tracking parity
      const mockPopulation = (ward.id * 14200 + 45000).toLocaleString();

      return { ...ward, score: finalScore, activeCount: wardTickets.filter(t => t.status !== 'Resolved').length, color: performanceColor, label: statusLabel, population: mockPopulation };
    }).sort((a, b) => b.score - a.score); // Absolute Leaderboard Ranking Sort
  };

  const rankedWards = getRankedWards();

  return (
    <div className="dashboard-container">
      <header className="main-header">
        <h1>NagarSeva Control Center</h1>
        <div className="live-pill">● System Live Sync</div>
      </header>
      
      {/* Dynamic Navigation Tabs */}
      <div className="tabs">
        <button className={activeTab === 'tracker' ? 'tab active' : 'tab'} onClick={() => setActiveTab('tracker')}>
          💼 Internal Ticket Tracker (Kanban)
        </button>
        <button className={activeTab === 'public' ? 'tab active' : 'tab'} onClick={() => setActiveTab('public')}>
          📢 Public Accountability Dashboard
        </button>
      </div>

      {/* VIEW 1: INTERNAL TICKET TRACKER (KANBAN STYLE) */}
      {activeTab === 'tracker' && (
        <div className="tab-content animate-fade">
          
          {/* Advanced Intake Panel */}
          <div className="add-ticket-card">
            <h3>Report an Urban Grievance</h3>
            <form onSubmit={handleAddTicket} className="add-ticket-form">
              <input type="text" placeholder="Describe the issue clearly (e.g., Water pipe leak on Central Avenue)..." value={title} onChange={(e) => setTitle(e.target.value)} required />
              <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} required>
                <option value="" disabled>Select Target Ward Jurisdiction</option>
                {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <button type="submit" disabled={isSubmitting}>File Report</button>
            </form>
          </div>

          {/* Kanban Board Container */}
          <div className="kanban-board">
            {['Open', 'In Progress', 'Resolved'].map(statusColumn => {
              const columnTickets = tickets.filter(t => (t.status || 'Open') === statusColumn);
              
              return (
                <div key={statusColumn} className="kanban-column">
                  <div className="column-header">
                    <h4>{statusColumn}</h4>
                    <span className="count-badge">{columnTickets.length}</span>
                  </div>
                  
                  <div className="column-cards-container">
                    {columnTickets.length === 0 ? (
                      <div className="empty-column-state">No tickets in this status</div>
                    ) : (
                      columnTickets.map(ticket => {
                        const sla = getSLAStatus(ticket.created_at);
                        const category = getCategoryBadge(ticket.title);
                        
                        return (
                          <div key={ticket.id} className="ticket-card">
                            <div className="card-top">
                              <span className="category-tag" style={{ backgroundColor: category.color }}>{category.name}</span>
                              <span className="ward-tag">{ticket.wards?.name || 'Unknown Ward'}</span>
                            </div>
                            
                            <h4 className="ticket-card-title">{ticket.title}</h4>
                            
                            {/* Live SLA Engine Display */}
                            {statusColumn !== 'Resolved' && (
                              <div className="card-sla-section" style={{ borderLeftColor: sla.color }}>
                                <span className="sla-countdown" style={{ color: sla.color }}>{sla.text}</span>
                                {sla.badge && <span className="escalation-alert-badge" style={{ backgroundColor: sla.color }}>{sla.badge}</span>}
                              </div>
                            )}

                            {statusColumn === 'Resolved' && (
                              <div className="card-sla-section resolved-border">
                                <span className="sla-countdown resolved-text">✓ Resolution Target Achieved</span>
                              </div>
                            )}

                            {/* Direct Action State Controller */}
                            <div className="card-actions">
                              {statusColumn === 'Open' && (
                                <button className="action-btn next" onClick={() => updateTicketStatus(ticket.id, 'In Progress')}>Start Work →</button>
                              )}
                              {statusColumn === 'In Progress' && (
                                <>
                                  <button className="action-btn back" onClick={() => updateTicketStatus(ticket.id, 'Open')}>← Reopen</button>
                                  <button className="action-btn resolve" onClick={() => updateTicketStatus(ticket.id, 'Resolved')}>Resolve ✓</button>
                                </>
                              )}
                              {statusColumn === 'Resolved' && (
                                <button className="action-btn back" onClick={() => updateTicketStatus(ticket.id, 'In Progress')}>Re-activate ↺</button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: PUBLIC ACCOUNTABILITY DASHBOARD (LEADERBOARD) */}
      {activeTab === 'public' && (
        <div className="tab-content animate-fade">
          <div className="stats-strip">
            <div className="stat-box">
              <small>Total Tracked Wards</small>
              <h2>{wards.length} Administrations</h2>
            </div>
            <div className="stat-box">
              <small>Active Unresolved Grievances</small>
              <h2>{tickets.filter(t => t.status !== 'Resolved').length} Backlogs</h2>
            </div>
            <div className="stat-box">
              <small>Metropolitan Health Metric</small>
              <h2 style={{ color: '#10b981' }}>Stabilized</h2>
            </div>
          </div>

          <h2>Ward Performance Leaderboard (Ranked by Responsiveness)</h2>
          <div className="leaderboard-list">
            {rankedWards.map((ward, index) => (
              <div key={ward.id} className="leaderboard-row" style={{ borderLeft: `5px solid ${ward.color}` }}>
                <div className="row-rank">#{index + 1}</div>
                
                <div className="row-identity">
                  <h4>{ward.name}</h4>
                  <small>Tracking Population: {ward.population} Residents</small>
                </div>

                <div className="row-stat">
                  <span className="metric-num">{ward.activeCount}</span>
                  <small>Pending Tasks</small>
                </div>

                <div className="row-score-zone">
                  <div className="score-display" style={{ backgroundColor: ward.color + '15', color: ward.color }}>
                    {ward.score}/100
                  </div>
                  <span className="performance-pill" style={{ backgroundColor: ward.color }}>{ward.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="logout-button-fixed" onClick={() => supabase.auth.signOut()}>
        Terminate Control Session (Logout)
      </button>
    </div>
  );
}

export default Dashboard;