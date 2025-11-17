import React, { useState, useEffect } from 'react';
import './Stats.css';

function Stats({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/game/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="stats-container">Loading statistics...</div>;
  }

  if (!stats || stats.totalGames === 0) {
    return (
      <div className="stats-container">
        <div className="stats-card">
          <h2>🥊 Fight Record</h2>
          <p className="no-stats">No fights yet! Step into the ring and start playing!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stats-card">
        <h2>🥊 Lifetime Fight Record</h2>
        
        <div className="stats-grid">
          <div className="stat-item highlight">
            <div className="stat-label">Total Fights</div>
            <div className="stat-value">{stats.totalGames}</div>
          </div>

          <div className="stat-item win">
            <div className="stat-label">Victories</div>
            <div className="stat-value">{stats.wins}</div>
          </div>

          <div className="stat-item loss">
            <div className="stat-label">Defeats</div>
            <div className="stat-value">{stats.losses}</div>
          </div>

          <div className="stat-item push">
            <div className="stat-label">Draws</div>
            <div className="stat-value">{stats.pushes}</div>
          </div>
        </div>

        <div className="win-percentage">
          <div className="percentage-label">Win Rate</div>
          <div className="percentage-value">{stats.winPercentage}%</div>
          <div className="percentage-bar">
            <div 
              className="percentage-fill" 
              style={{ width: `${stats.winPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="stats-details">
          <div className="detail-item">
            <span className="detail-label">Average Score:</span>
            <span className="detail-value">{stats.avgPlayerScore || 0}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Highest Score:</span>
            <span className="detail-value">{stats.highestScore || 0}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Avg Dealer Score:</span>
            <span className="detail-value">{stats.avgDealerScore || 0}</span>
          </div>
        </div>

        {stats.firstGame && (
          <div className="career-info">
            <p>Career Started: {new Date(stats.firstGame).toLocaleDateString()}</p>
            <p>Last Fight: {new Date(stats.lastGame).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Stats;