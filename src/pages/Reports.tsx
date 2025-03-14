import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, CheckCircle, CreditCard, DollarSign, Shield, Building2, ChevronDown, Eye, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Document } from '../types/documents';

interface Report {
  id: string;
  user_id: string;
  created_at: string;
  status: 'pending' | 'completed' | 'failed';
  credit_score?: number;
  income?: number;
  debt_to_income_ratio?: number;
  monthly_income?: number;
  employment_verified?: boolean;
  criminal_records?: boolean;
  eviction_history?: boolean;
  recommendation: 'approved' | 'denied' | 'review';
  documents: Document[];
  analysis: {
    credit: {
      score: number;
      rating: 'excellent' | 'good' | 'fair' | 'poor';
      factors: string[];
    };
    income: {
      monthly: number;
      annual: number;
      stability: 'high' | 'medium' | 'low';
      employment_length: string;
    };
    background: {
      criminal_records: boolean;
      eviction_history: boolean;
      recommendations: string[];
    };
  };
}

export function Reports() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      // For now, we'll use mock data for user 1@gmail.com
      const mockReport: Report = {
        id: '1',
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        status: 'completed',
        credit_score: 720,
        income: 75000,
        debt_to_income_ratio: 0.28,
        monthly_income: 6250,
        employment_verified: true,
        criminal_records: false,
        eviction_history: false,
        recommendation: 'approved',
        documents: [],
        analysis: {
          credit: {
            score: 720,
            rating: 'good',
            factors: [
              'Long credit history',
              'Low credit utilization',
              'No late payments',
              'Mix of credit types'
            ]
          },
          income: {
            monthly: 6250,
            annual: 75000,
            stability: 'high',
            employment_length: '3 years'
          },
          background: {
            criminal_records: false,
            eviction_history: false,
            recommendations: [
              'Clean background check',
              'No eviction history',
              'Stable employment history'
            ]
          }
        }
      };

      setReports([mockReport]);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 740) return 'text-green-600';
    if (score >= 670) return 'text-blue-600';
    if (score >= 580) return 'text-yellow-600';
    return 'text-red-600';
  };

  const generateReportHTML = (report: Report) => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tenant Screening Report</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.5;
            margin: 0;
            padding: 2rem;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .section {
            margin-bottom: 2rem;
            padding: 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
          }
          .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #111827;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .score {
            font-size: 2rem;
            font-weight: bold;
            color: ${report.credit_score >= 740 ? '#059669' : 
                    report.credit_score >= 670 ? '#2563eb' :
                    report.credit_score >= 580 ? '#d97706' : '#dc2626'};
          }
          .recommendation {
            margin-top: 2rem;
            padding: 1rem;
            background-color: ${report.recommendation === 'approved' ? '#f0fdf4' :
                              report.recommendation === 'denied' ? '#fef2f2' : '#fefce8'};
            border-radius: 0.5rem;
          }
          .status {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-weight: 500;
            background-color: ${report.recommendation === 'approved' ? '#dcfce7' :
                              report.recommendation === 'denied' ? '#fee2e2' : '#fef9c3'};
            color: ${report.recommendation === 'approved' ? '#166534' :
                    report.recommendation === 'denied' ? '#991b1b' : '#854d0e'};
          }
          .footer {
            margin-top: 2rem;
            text-align: center;
            font-size: 0.875rem;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tenant Screening Report</h1>
            <p>Generated on ${new Date(report.created_at).toLocaleDateString()}</p>
          </div>

          <div class="section">
            <h2 class="section-title">Credit Analysis</h2>
            <div class="grid">
              <div>
                <p>Credit Score</p>
                <div class="score">${report.analysis.credit.score}</div>
                <p>Rating: ${report.analysis.credit.rating.toUpperCase()}</p>
              </div>
              <div>
                <p>Key Factors:</p>
                <ul>
                  ${report.analysis.credit.factors.map(factor => `<li>${factor}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Income Verification</h2>
            <div class="grid">
              <div>
                <p>Annual Income: $${report.analysis.income.annual.toLocaleString()}</p>
                <p>Monthly Income: $${report.analysis.income.monthly.toLocaleString()}</p>
              </div>
              <div>
                <p>Employment Length: ${report.analysis.income.employment_length}</p>
                <p>Income Stability: ${report.analysis.income.stability.toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Background Check</h2>
            <div class="grid">
              <div>
                <p>Criminal Records: ${report.analysis.background.criminal_records ? 'Found' : 'None Found'}</p>
                <p>Eviction History: ${report.analysis.background.eviction_history ? 'Found' : 'None Found'}</p>
              </div>
              <div>
                <p>Recommendations:</p>
                <ul>
                  ${report.analysis.background.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>

          <div class="recommendation">
            <h2 class="section-title">Final Recommendation</h2>
            <div class="status">${report.recommendation.toUpperCase()}</div>
          </div>

          <div class="footer">
            <p>This report was generated by ShortStay Compliance Hub</p>
            <p>Report ID: ${report.id}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const downloadReport = (report: Report) => {
    const html = generateReportHTML(report);
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tenant-screening-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const ReportModal = () => {
    if (!selectedReport) return null;

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Tenant Screening Report</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Credit Score Section */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-6 w-6 text-gray-400" />
                  <h3 className="ml-2 text-lg font-medium">Credit Analysis</h3>
                </div>
                <div className="text-center mb-4">
                  <div className={`text-4xl font-bold ${getScoreColor(selectedReport.analysis.credit.score)}`}>
                    {selectedReport.analysis.credit.score}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Credit Score</div>
                </div>
                <div className="space-y-2">
                  {selectedReport.analysis.credit.factors.map((factor, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {factor}
                    </div>
                  ))}
                </div>
              </div>

              {/* Income Section */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                  <h3 className="ml-2 text-lg font-medium">Income Verification</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Annual Income</div>
                    <div className="text-xl font-bold">${selectedReport.analysis.income.annual.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Monthly Income</div>
                    <div className="text-xl font-bold">${selectedReport.analysis.income.monthly.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Employment Length</div>
                    <div className="text-xl font-bold">{selectedReport.analysis.income.employment_length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Income Stability</div>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {selectedReport.analysis.income.stability.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Check Section */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-gray-400" />
                  <h3 className="ml-2 text-lg font-medium">Background Check</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Criminal Records</div>
                    <div className="inline-flex items-center">
                      {selectedReport.analysis.background.criminal_records ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <span className="ml-2">
                        {selectedReport.analysis.background.criminal_records ? 'Found' : 'None Found'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Eviction History</div>
                    <div className="inline-flex items-center">
                      {selectedReport.analysis.background.eviction_history ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <span className="ml-2">
                        {selectedReport.analysis.background.eviction_history ? 'Found' : 'None Found'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Recommendations</div>
                    <ul className="space-y-2">
                      {selectedReport.analysis.background.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Final Recommendation</h3>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(selectedReport.recommendation)}`}>
                    {selectedReport.recommendation.toUpperCase()}
                  </span>
                  <button
                    onClick={() => downloadReport(selectedReport)}
                    className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Tenant Screening Reports</h1>
        </div>

        <div className="p-6">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports available</h3>
              <p className="mt-1 text-sm text-gray-500">Upload your documents to generate a screening report.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Building2 className="h-6 w-6 text-gray-400" />
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            Tenant Screening Report
                          </h3>
                          <p className="text-sm text-gray-500">
                            Generated on {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecommendationColor(report.recommendation)}`}>
                          {report.recommendation.toUpperCase()}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowReportModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Report
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-500">Credit Score</div>
                          <div className={`text-lg font-semibold ${getScoreColor(report.credit_score || 0)}`}>
                            {report.credit_score}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-500">Monthly Income</div>
                          <div className="text-lg font-semibold text-gray-900">
                            ${report.monthly_income?.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-500">Background Check</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {report.criminal_records ? (
                              <span className="text-red-600">Issues Found</span>
                            ) : (
                              <span className="text-green-600">Clear</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showReportModal && <ReportModal />}
    </div>
  );
}