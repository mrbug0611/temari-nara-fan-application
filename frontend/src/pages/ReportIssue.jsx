import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Mail, MessageSquare, Bug, User, FileText, Send } from 'lucide-react';

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    issueType: 'bug',
    title: '',
    description: '',
    email: '',
    username: '',
    severity: 'medium',
    pageUrl: '',
    screenshot: null,
    agreeToTerms: false
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // CodeRabbit Fix: Safely handle success message timeout and clean it up on unmount
  useEffect(() => {
    let timer;
    if (submitted) {
      timer = setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [submitted]);

  const issueTypes = [
    { value: 'bug', label: 'Bug Report', description: 'Something is not working as expected' },
    { value: 'harassment', label: 'Harassment/Abuse', description: 'Report user misconduct or harmful behavior' },
    { value: 'content', label: 'Inappropriate Content', description: 'Report content that violates guidelines' },
    { value: 'security', label: 'Security Issue', description: 'Report a security vulnerability' },
    { value: 'feedback', label: 'Feature Request', description: 'Suggest a new feature or improvement' },
    { value: 'other', label: 'Other', description: 'Something else' }
  ];

  const severityOptions = [
    { value: 'low', label: 'Low - Minor issue, not urgent' },
    { value: 'medium', label: 'Medium - Noticeable problem' },
    { value: 'high', label: 'High - Major issue affecting functionality' },
    { value: 'critical', label: 'Critical - Security or major data issue' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms before submitting');
      return;
    }

    setLoading(true);

    try {
      // CodeRabbit Fix: Use FormData payload layout to properly upload the raw screenshot file binary
      const formDataToSend = new FormData();
      formDataToSend.append('reportType', formData.issueType);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('email', formData.email);
      
      if (formData.username) formDataToSend.append('username', formData.username);
      if (formData.pageUrl) formDataToSend.append('pageUrl', formData.pageUrl);
      if (formData.screenshot) formDataToSend.append('screenshot', formData.screenshot);
      
      // CodeRabbit Fix: Conditionally append severity level only for standard bug reports
      if (formData.issueType === 'bug') {
        formDataToSend.append('severity', formData.severity);
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        credentials: 'include',
        // Note: Do not define application/json headers here. The browser automatically
        // calculates multi-part boundaries when body is a FormData object.
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setSubmitted(true);
      setFormData({
        issueType: 'bug',
        title: '',
        description: '',
        email: '',
        username: '',
        severity: 'medium',
        pageUrl: '',
        screenshot: null,
        agreeToTerms: false
      });
    } catch (err) {
      console.error('Report submission error:', err);
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-emerald-300 mb-4">Thank You!</h1>
            <p className="text-gray-300 text-lg mb-6">
              Your report has been submitted successfully. Our team will review it shortly and take appropriate action.
            </p>
            <p className="text-gray-400 mb-8">
              You should receive a confirmation email shortly.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Report an Issue
          </h1>
          <p className="text-xl text-gray-400">
            Help us improve by reporting bugs, security issues, or inappropriate content
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <Bug className="w-5 h-5 text-blue-400 mb-2" />
            <h3 className="font-semibold text-blue-300 mb-1">Technical Issues</h3>
            <p className="text-sm text-gray-400">Report bugs and technical problems</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-orange-400 mb-2" />
            <h3 className="font-semibold text-orange-300 mb-1">Content Issues</h3>
            <p className="text-sm text-gray-400">Report inappropriate or harmful content</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <User className="w-5 h-5 text-red-400 mb-2" />
            <h3 className="font-semibold text-red-300 mb-1">User Conduct</h3>
            <p className="text-sm text-gray-400">Report harassment or rule violations</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 border border-emerald-500/20 rounded-2xl p-8">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Issue Type */}
            <div>
              <label className="block text-emerald-300 font-semibold mb-3">
                Issue Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {issueTypes.map(type => (
                  <label
                    key={type.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.issueType === type.value
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-emerald-500/20 bg-slate-900/50 hover:border-emerald-500/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="issueType"
                      value={type.value}
                      checked={formData.issueType === type.value}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="font-semibold text-emerald-300">{type.label}</span>
                    <p className="text-sm text-gray-400 mt-1">{type.description}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-emerald-300 font-semibold mb-2">
                Issue Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief summary of the issue"
                className="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-emerald-300 font-semibold mb-2">
                Detailed Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please provide detailed information about the issue. Include steps to reproduce if applicable."
                rows="6"
                className="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000</p>
            </div>

            {/* Severity */}
            {formData.issueType === 'bug' && (
              <div>
                <label className="block text-emerald-300 font-semibold mb-2">
                  Severity Level
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-all"
                >
                  {severityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Page URL */}
            <div>
              <label className="block text-emerald-300 font-semibold mb-2">
                Page URL
              </label>
              <input
                type="url"
                name="pageUrl"
                value={formData.pageUrl}
                onChange={handleChange}
                placeholder="https://example.com/page (optional)"
                className="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-emerald-300 font-semibold mb-2">
                Your Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your Temari Fan App username (optional)"
                className="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-emerald-300 font-semibold mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">We'll use this to contact you about your report</p>
            </div>

            {/* Screenshot */}
            <div>
              <label className="block text-emerald-300 font-semibold mb-2">
                Screenshot or Evidence
              </label>
              <input
                type="file"
                name="screenshot"
                onChange={handleChange}
                accept="image/*"
                className="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg text-gray-400 focus:border-emerald-500 focus:outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Attach a screenshot to help us understand the issue better</p>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3 p-4 bg-slate-900/50 rounded-lg border border-emerald-500/20">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 cursor-pointer"
              />
              <label className="text-sm text-gray-300 cursor-pointer">
                I agree to the{' '}
                <a href="/guidelines" className="text-emerald-400 hover:text-emerald-300 underline">
                  Community Guidelines
                </a>
                {' '}and understand that false reports or harassment may result in account suspension.
              </label>
            </div>

            {/* Submit Button */}
            {/* User Request Fix: Disabled attribute now locks if agreeToTerms checkbox is false */}
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.agreeToTerms}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>{loading ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-slate-800/50 border border-emerald-500/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-emerald-300 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'How long does it take to respond to a report?',
                a: 'We aim to respond to reports within 24-48 hours. Critical security issues are prioritized and handled immediately.'
              },
              {
                q: 'Will my identity be kept confidential?',
                a: 'Yes, your report will be kept confidential and only reviewed by our moderation team. Your email will only be used to contact you about your report.'
              },
              {
                q: 'What should I include in my bug report?',
                a: 'Include what you were doing when the issue occurred, what happened instead of what was expected, and any error messages you saw. Screenshots are very helpful!'
              },
              {
                q: 'Can I remain anonymous when reporting?',
                a: 'We require an email address so we can follow up with you, but you can use a username of your choice.'
              },
              {
                q: 'What counts as inappropriate content?',
                a: 'This includes explicit content, hate speech, harassment, spam, and anything that violates our Community Guidelines.'
              }
            ].map((faq, idx) => (
              <div key={idx}>
                <h4 className="text-lg font-semibold text-emerald-300 mb-2">
                  {faq.q}
                </h4>
                <p className="text-gray-400">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Alternative */}
        <div className="mt-12 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-cyan-300 mb-4">Alternative Contact Methods</h2>
          <p className="text-gray-300 mb-4">
            If you prefer not to use the form, you can reach our team directly:
          </p>
          <div className="space-y-3">
            <a
              href="https://github.com/mrbug0611"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>GitHub Issues</span>
            </a>
            <p className="flex items-center space-x-3 text-cyan-300">
              <Mail className="w-5 h-5" />
              <span>temarifanapp@gmail.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;