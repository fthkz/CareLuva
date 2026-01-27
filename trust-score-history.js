/**
 * Trust Score History Tracker
 * Tracks and stores historical trust scores for clinics
 */

class TrustScoreHistory {
    constructor() {
        this.collectionName = 'trustScoreHistory';
    }

    /**
     * Save current trust score to history
     * @param {string} clinicId - Clinic ID
     * @param {Object} trustScoreData - Trust score data from calculator
     * @param {Object} db - Firestore database instance
     */
    async saveTrustScore(clinicId, trustScoreData, db) {
        try {
            const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            
            const historyData = {
                clinicId: clinicId,
                score: trustScoreData.score,
                breakdown: trustScoreData.breakdown,
                level: trustScoreData.level,
                timestamp: serverTimestamp(),
                date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
            };
            
            await addDoc(collection(db, this.collectionName), historyData);
            console.log(`Trust score saved for clinic ${clinicId}: ${trustScoreData.score}`);
        } catch (error) {
            console.error('Error saving trust score history:', error);
        }
    }

    /**
     * Load historical trust scores for a clinic
     * @param {string} clinicId - Clinic ID
     * @param {Object} db - Firestore database instance
     * @param {number} days - Number of days to retrieve (default: 90)
     * @returns {Array} Array of historical trust score data
     */
    async loadHistory(clinicId, db, days = 90) {
        try {
            const { collection, query, where, orderBy, limit, getDocs, Timestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            const historyRef = collection(db, this.collectionName);
            const q = query(
                historyRef,
                where('clinicId', '==', clinicId),
                where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
                orderBy('timestamp', 'desc'),
                limit(100) // Limit to last 100 records
            );
            
            const snapshot = await getDocs(q);
            const history = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                history.push({
                    id: doc.id,
                    score: data.score,
                    breakdown: data.breakdown || {},
                    level: data.level,
                    date: data.date || (data.timestamp ? data.timestamp.toDate().toISOString().split('T')[0] : null),
                    timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
                });
            });
            
            // Sort by date (oldest first for chart)
            history.sort((a, b) => {
                const dateA = new Date(a.date || a.timestamp);
                const dateB = new Date(b.date || b.timestamp);
                return dateA - dateB;
            });
            
            return history;
        } catch (error) {
            console.error('Error loading trust score history:', error);
            return [];
        }
    }

    /**
     * Generate chart HTML for trust score trends
     * @param {Array} history - Historical trust score data
     * @param {string} size - Chart size: 'small', 'medium', 'large'
     * @returns {string} HTML string for the chart
     */
    generateTrendChart(history, size = 'medium') {
        if (!history || history.length === 0) {
            return `
                <div style="padding: 40px; text-align: center; color: #6b7280;">
                    <i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p>No historical data available yet. Trust scores will be tracked over time.</p>
                </div>
            `;
        }

        const sizes = {
            small: { height: '150px', fontSize: '0.75rem' },
            medium: { height: '200px', fontSize: '0.875rem' },
            large: { height: '300px', fontSize: '1rem' }
        };
        
        const sizeStyle = sizes[size] || sizes.medium;
        
        // Calculate chart dimensions
        const maxScore = 10;
        const minScore = Math.min(...history.map(h => h.score), 0);
        const scoreRange = maxScore - minScore;
        
        // Get date range
        const dates = history.map(h => h.date || h.timestamp.toISOString().split('T')[0]);
        const uniqueDates = [...new Set(dates)];
        
        // Calculate points for line chart
        const points = history.map((h, index) => {
            const x = (index / (history.length - 1)) * 100; // 0-100%
            const y = 100 - ((h.score - minScore) / scoreRange) * 100; // Inverted Y (0 at top)
            return { x, y, score: h.score, date: h.date };
        });
        
        // Generate SVG path
        const pathData = points.map((p, i) => {
            return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
        }).join(' ');
        
        // Generate area path (for filled area under line)
        const areaPath = `${pathData} L ${points[points.length - 1].x} 100 L 0 100 Z`;
        
        return `
            <div class="trust-score-chart" style="position: relative; width: 100%; height: ${sizeStyle.height};">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width: 100%; height: 100%;">
                    <!-- Grid lines -->
                    ${[0, 2, 4, 6, 8, 10].map(score => {
                        const y = 100 - ((score - minScore) / scoreRange) * 100;
                        return `<line x1="0" y1="${y}" x2="100" y2="${y}" stroke="#e5e7eb" stroke-width="0.5" opacity="0.5"/>`;
                    }).join('')}
                    
                    <!-- Area under curve -->
                    <path d="${areaPath}" fill="url(#trustScoreGradient)" opacity="0.3"/>
                    
                    <!-- Line -->
                    <path d="${pathData}" 
                          fill="none" 
                          stroke="#3b82f6" 
                          stroke-width="2" 
                          stroke-linecap="round" 
                          stroke-linejoin="round"/>
                    
                    <!-- Data points -->
                    ${points.map((p, i) => {
                        if (i % Math.ceil(points.length / 10) !== 0 && i !== points.length - 1) return '';
                        return `<circle cx="${p.x}" cy="${p.y}" r="1.5" fill="#3b82f6" stroke="white" stroke-width="0.5"/>`;
                    }).join('')}
                    
                    <!-- Gradient definition -->
                    <defs>
                        <linearGradient id="trustScoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.5" />
                            <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.1" />
                        </linearGradient>
                    </defs>
                </svg>
                
                <!-- Y-axis labels -->
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 30px; display: flex; flex-direction: column; justify-content: space-between; font-size: ${sizeStyle.fontSize}; color: #6b7280;">
                    <span>10</span>
                    <span>8</span>
                    <span>6</span>
                    <span>4</span>
                    <span>2</span>
                    <span>0</span>
                </div>
                
                <!-- X-axis labels (dates) -->
                <div style="position: absolute; bottom: -25px; left: 30px; right: 0; display: flex; justify-content: space-between; font-size: ${sizeStyle.fontSize}; color: #6b7280;">
                    ${uniqueDates.filter((_, i) => i % Math.ceil(uniqueDates.length / 5) === 0 || i === uniqueDates.length - 1).map(date => {
                        const d = new Date(date);
                        return `<span>${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>`;
                    }).join('')}
                </div>
                
                <!-- Current score indicator -->
                ${history.length > 0 ? `
                    <div style="position: absolute; top: 10px; right: 10px; background: white; padding: 8px 12px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="font-size: ${sizeStyle.fontSize}; color: #6b7280; margin-bottom: 4px;">Current</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #3b82f6;">
                            ${history[history.length - 1].score.toFixed(1)}/10
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <!-- Statistics -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 15px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                ${(() => {
                    const scores = history.map(h => h.score);
                    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                    const min = Math.min(...scores);
                    const max = Math.max(...scores);
                    const trend = history.length >= 2 ? (history[history.length - 1].score - history[0].score) : 0;
                    
                    return `
                        <div style="text-align: center;">
                            <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 4px;">Average</div>
                            <div style="font-size: 1.125rem; font-weight: 600; color: #1f2937;">${avg.toFixed(1)}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 4px;">Range</div>
                            <div style="font-size: 1.125rem; font-weight: 600; color: #1f2937;">${min.toFixed(1)} - ${max.toFixed(1)}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 4px;">Trend</div>
                            <div style="font-size: 1.125rem; font-weight: 600; color: ${trend >= 0 ? '#10b981' : '#ef4444'};">
                                ${trend >= 0 ? '↑' : '↓'} ${Math.abs(trend).toFixed(1)}
                            </div>
                        </div>
                    `;
                })()}
            </div>
        `;
    }

    /**
     * Auto-save trust score (call this periodically or after significant changes)
     * @param {string} clinicId - Clinic ID
     * @param {Object} clinicData - Full clinic data
     * @param {Object} reviewData - Review statistics
     * @param {Object} pricingData - Pricing data
     * @param {Object} appointmentData - Appointment statistics
     * @param {Object} db - Firestore database instance
     */
    async autoSaveTrustScore(clinicId, clinicData, reviewData, pricingData, appointmentData, db) {
        try {
            const trustCalculator = new TrustScoreCalculator();
            const trustScore = trustCalculator.calculateTrustScore(
                clinicData,
                reviewData,
                pricingData,
                appointmentData
            );
            
            // Only save if score has changed significantly (0.1 difference) or it's a new day
            const today = new Date().toISOString().split('T')[0];
            const recentHistory = await this.loadHistory(clinicId, db, 1);
            
            if (recentHistory.length === 0) {
                // No history today, save it
                await this.saveTrustScore(clinicId, trustScore, db);
            } else {
                const lastScore = recentHistory[recentHistory.length - 1];
                if (Math.abs(lastScore.score - trustScore.score) >= 0.1) {
                    // Significant change, save it
                    await this.saveTrustScore(clinicId, trustScore, db);
                }
            }
        } catch (error) {
            console.error('Error auto-saving trust score:', error);
        }
    }
}

// Make available globally
window.TrustScoreHistory = TrustScoreHistory;

