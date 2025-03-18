import type { Report } from "@/pages/Reports/types";

const getStyle = () => `
  <style>
    /* Modern CSS Reset and Base Styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', system-ui, -apple-system, sans-serif; 
      line-height: 1.6;
      color: #374151; 
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    
    /* Container and Layout */
    .container { 
      max-width: 1000px; 
      margin: 0 auto; 
      padding: 2rem;
      background-color: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-radius: 0.75rem;
    }
    
    /* Typography */
    h1 { font-size: 2rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; font-weight: 600; color: #1f2937; margin-bottom: 1rem; }
    h3 { font-size: 1.25rem; font-weight: 600; color: #374151; }
    p { margin-bottom: 0.75rem; }
    
    /* Header */
    .header { 
      text-align: center; 
      margin-bottom: 2rem; 
      padding-bottom: 1.5rem; 
      border-bottom: 1px solid #e5e7eb;
    }
    
    /* Summary Section */
    .summary {
      background-color: #f8fafc;
      padding: 1.5rem;
      border-radius: 0.5rem;
      border-left: 4px solid #3b82f6;
      margin-bottom: 2rem;
    }
    
    /* Main Sections */
    .section { 
      margin-bottom: 2rem; 
      padding: 1.5rem;
      border: 1px solid #e5e7eb; 
      border-radius: 0.75rem;
      background-color: white;
      transition: all 0.2s ease;
    }
    .section:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .section-icon {
      margin-right: 0.75rem;
      color: #4b5563;
    }
    
    .section-title { 
      font-size: 1.25rem; 
      font-weight: 600; 
      color: #111827; 
      margin: 0;
    }
    
    /* Grid Layouts */
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    
    @media (max-width: 768px) {
      .grid { grid-template-columns: 1fr; }
      .container { padding: 1.5rem; }
    }
    
    /* Score Displays */
    .score-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .score {
      font-size: 2.25rem;
      font-weight: 700;
      line-height: 1;
      margin: 1rem 0;
      position: relative;
    }
    
    .score-gauge {
      position: relative;
      width: 150px;
      height: 75px;
      overflow: hidden;
      margin-bottom: 1rem;
    }
    
    .gauge-background {
      width: 100%;
      height: 100%;
      background: #f3f4f6;
      border-radius: 75px 75px 0 0;
    }
    
    .gauge-fill {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: linear-gradient(90deg, #ef4444 0%, #f59e0b 33%, #3b82f6 66%, #10b981 100%);
      border-radius: 75px 75px 0 0;
    }
    
    .gauge-indicator {
      position: absolute;
      bottom: 0;
      left: 50%;
      height: 75px;
      width: 4px;
      background: #111827;
      transform: translateX(-50%);
    }
    
    .info-group {
      background: #f9fafb;
      padding: 1.25rem;
      border-radius: 0.5rem;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px dashed #e5e7eb;
    }
    
    .info-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    
    .info-label {
      font-weight: 500;
      color: #6b7280;
    }
    
    .info-value {
      font-weight: 600;
      color: #111827;
    }
    
    /* Lists */
    ul {
      list-style-position: inside;
      margin-bottom: 1rem;
    }
    
    li {
      margin-bottom: 0.5rem;
      padding-left: 0.5rem;
    }
    
    /* Recommendation Section */
    .recommendation {
      margin-top: 2rem;
      padding: 1.5rem;
      border-radius: 0.75rem;
    }
    
    .status-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 1.5rem 0;
    }
    
    .status {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1.25rem;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 1.25rem;
      letter-spacing: 0.05em;
    }
    
    /* Footer */
    .footer {
      margin-top: 3rem;
      text-align: center;
      font-size: 0.875rem;
      color: #6b7280;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }
  </style>
`;

export const getHeader = (report: Report) => `
  <div class="header">
    <h1>Tenant Screening Report</h1>
    <p>Generated on ${new Date(report.created_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    })}</p>
  </div>
`;

export const getSummarySection = (report: Report) => {
  const getCreditRating = () => {
    const score = report.analysis.credit.score;
    if (score >= 740) return "Excellent";
    if (score >= 670) return "Good";
    if (score >= 580) return "Fair";
    return "Poor";
  };
  
  return `
    <div class="summary">
      <h2>Summary</h2>
      <div class="grid">
        <div class="info-group">
          <div class="info-item">
            <span class="info-label">Credit Rating:</span>
            <span class="info-value">${getCreditRating()}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Rent-to-Income Ratio:</span>
            <span class="info-value">${Math.round((report.analysis.income.monthly / 3) * 100) / 100}:1</span>
          </div>
          <div class="info-item">
            <span class="info-label">Background Issues:</span>
            <span class="info-value">${report.analysis.background.criminal_records || report.analysis.background.eviction_history ? "Yes" : "No"}</span>
          </div>
        </div>
        <div class="status-container">
          <div class="status" style="background-color: ${
            report.recommendation === "approved"
              ? "#dcfce7"
              : report.recommendation === "denied"
              ? "#fee2e2"
              : "#fef9c3"
          }; color: ${
            report.recommendation === "approved"
              ? "#166534"
              : report.recommendation === "denied"
              ? "#991b1b"
              : "#854d0e"
          }">
            ${report.recommendation.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  `;
};

export const getCreditSection = (report: Report) => {
  const score = report.analysis.credit.score;
  const percentage = score / 850 * 100;
  const fillHeight = Math.max(5, Math.min(100, percentage)) + '%';
  
  return `
    <div class="section">
      <div class="section-header">
        <div class="section-icon">📊</div>
        <h2 class="section-title">Credit Analysis</h2>
      </div>
      <div class="grid">
        <div class="score-container">
          <div class="score-gauge">
            <div class="gauge-background"></div>
            <div class="gauge-fill" style="height: ${fillHeight}"></div>
          </div>
          <div class="score" style="color: ${
            score >= 740
              ? "#059669"
              : score >= 670
              ? "#2563eb"
              : score >= 580
              ? "#d97706"
              : "#dc2626"
          }">${score}</div>
          <p>Rating: <strong>${report.analysis.credit.rating.toUpperCase()}</strong></p>
        </div>
        <div>
          <h3>Key Factors:</h3>
          <ul>
            ${report.analysis.credit.factors.map((factor) => `<li>${factor}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;
};

export const getIncomeSection = (report: Report) => `
  <div class="section">
    <div class="section-header">
      <div class="section-icon">💰</div>
      <h2 class="section-title">Income Verification</h2>
    </div>
    <div class="grid">
      <div class="info-group">
        <div class="info-item">
          <span class="info-label">Annual Income:</span>
          <span class="info-value">$${report.analysis.income.annual.toLocaleString()}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Monthly Income:</span>
          <span class="info-value">$${report.analysis.income.monthly.toLocaleString()}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Employment Length:</span>
          <span class="info-value">${report.analysis.income.employment_length}</span>
        </div>
      </div>
      <div>
        <div style="text-align: center; margin-bottom: 1rem;">
          <h3>Income Stability</h3>
          <div style="display: inline-block; padding: 0.5rem 1.5rem; border-radius: 9999px; font-weight: 600; background-color: ${
            report.analysis.income.stability.toLowerCase() === "stable" 
              ? "#d1fae5" 
              : report.analysis.income.stability.toLowerCase() === "moderate" 
                ? "#fef3c7"
                : "#fee2e2"
          }; color: ${
            report.analysis.income.stability.toLowerCase() === "stable" 
              ? "#065f46" 
              : report.analysis.income.stability.toLowerCase() === "moderate" 
                ? "#92400e"
                : "#991b1b"
          };">
            ${report.analysis.income.stability.toUpperCase()}
          </div>
        </div>
        <div class="info-group">
          <div class="info-item">
            <span class="info-label">Rent-to-Income Ratio:</span>
            <span class="info-value">${Math.round((report.analysis.income.monthly / 3) * 100) / 100}:1</span>
          </div>
          <div class="info-item">
            <span class="info-label">Recommended Ratio:</span>
            <span class="info-value">3:1</span>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

export const getBackgroundSection = (report: Report) => `
  <div class="section">
    <div class="section-header">
      <div class="section-icon">🔍</div>
      <h2 class="section-title">Background Check</h2>
    </div>
    <div class="grid">
      <div>
        <div class="info-group">
          <div class="info-item">
            <span class="info-label">Criminal Records:</span>
            <span class="info-value" style="color: ${report.analysis.background.criminal_records ? "#dc2626" : "#059669"}">
              ${report.analysis.background.criminal_records ? "Found" : "None Found"}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Eviction History:</span>
            <span class="info-value" style="color: ${report.analysis.background.eviction_history ? "#dc2626" : "#059669"}">
              ${report.analysis.background.eviction_history ? "Found" : "None Found"}
            </span>
          </div>
        </div>
      </div>
      <div>
        <h3>Recommendations:</h3>
        <ul>
          ${report.analysis.background.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    </div>
  </div>
`;

export const getRecommendationSection = (report: Report) => `
  <div class="recommendation" style="background-color: ${
    report.recommendation === "approved"
      ? "#f0fdf4"
      : report.recommendation === "denied"
      ? "#fef2f2"
      : "#fefce8"
  }; border-left: 5px solid ${
    report.recommendation === "approved"
      ? "#10b981"
      : report.recommendation === "denied"
      ? "#ef4444"
      : "#f59e0b"
  }">
    <h2 class="section-title">Final Recommendation</h2>
    <div class="status-container">
      <div class="status" style="background-color: ${
        report.recommendation === "approved"
          ? "#dcfce7"
          : report.recommendation === "denied"
          ? "#fee2e2"
          : "#fef9c3"
      }; color: ${
        report.recommendation === "approved"
          ? "#166534"
          : report.recommendation === "denied"
          ? "#991b1b"
          : "#854d0e"
      }">
        ${report.recommendation.toUpperCase()}
      </div>
    </div>
    <p style="text-align: center;">
      ${report.recommendation === "approved"
        ? "This applicant meets all requirements for tenancy."
        : report.recommendation === "denied"
        ? "This applicant does not meet the minimum requirements for tenancy."
        : "This applicant may require additional considerations or guarantors."}
    </p>
  </div>
`;

export const getExtendedSection = (report: Report) => `
  <div class="section">
    <div class="section-header">
      <div class="section-icon">📈</div>
      <h2 class="section-title">Extended Analysis</h2>
    </div>
    <div class="grid">
      <div class="info-group">
        <div class="info-item">
          <span class="info-label">Credit Rating:</span>
          <span class="info-value">${report.analysis.credit.rating.toUpperCase()}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Annual Income:</span>
          <span class="info-value">$${report.analysis.income.annual.toLocaleString()}</span>
        </div>
      </div>
      <div>
        <p>This applicant has a ${report.analysis.credit.rating.toLowerCase()} credit profile with an annual income of $${report.analysis.income.annual.toLocaleString()}, which ${
          (report.analysis.income.annual / 40) > 2000 
            ? "should be sufficient" 
            : "may not be sufficient"
        } to cover the expected monthly rent.</p>
        <p>Based on industry standards, the applicant's profile is ${
          report.recommendation === "approved" 
            ? "above average" 
            : report.recommendation === "conditional" 
              ? "average" 
              : "below average"
        } compared to other tenants in similar properties.</p>
      </div>
    </div>
  </div>
`;

export const getFooter = (report: Report) => `
  <div class="footer">
    <p>Report ID: ${report.id}</p>
    <p>Generated by Tenant Screening System</p>
    <p>© ${new Date().getFullYear()} All rights reserved</p>
  </div>
`;

export const composeReport = (report: Report) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tenant Screening Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    ${getStyle()}
  </head>
  <body>
    <div class="container">
      ${getHeader(report)}
      ${getSummarySection(report)}
      ${getCreditSection(report)}
      ${getIncomeSection(report)}
      ${getBackgroundSection(report)}
      ${getRecommendationSection(report)}
      ${getExtendedSection(report)}
      ${getFooter(report)}
    </div>
  </body>
  </html>
`;

