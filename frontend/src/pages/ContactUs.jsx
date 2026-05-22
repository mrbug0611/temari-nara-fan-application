// frontend/src/pages/ContactUs.jsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '', 
        contactMethod: 'email', // default contact method
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // auto clear success message after 5 seconds
    React.useEffect(() => {
        let timer; 

        if (submitted) {
            timer = setTimeout(() => {
                setSubmitted(false);
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                    contactMethod: 'email',
                });
            }, 5000);
        }

        return () => clearTimeout(timer);
    }, [submitted]);

   // handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // validation 
        if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }; 

        if (formData.message.trim().length < 10) {
            setError('Message must be at least 10 characters long');
            setLoading(false);
            return;
        };

        try {
            // send contact form data to backend 
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong failed to send message');
            }; 

            setSubmitted(true);
            setLoading(false);



        } catch (error) {
            setError('An error occurred while submitting the form');
            setLoading(false);
        }
    } 
    
    
      return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black pt-20 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-emerald-300 text-lg max-w-2xl mx-auto">
            Have questions about the Temari Fan App or want to share your thoughts? We'd love to hear from you! Whether you have feedback, suggestions, or just want to connect with our community, reach out below.
          </p>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-1">
            
            {/* Email */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 rounded-xl p-6 mb-6 hover:border-emerald-400/50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <Mail className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-emerald-300 font-semibold mb-2">Email</h3>
                  <p className="text-emerald-200 text-sm">
                    <a href="mailto:contact@temari-fan.app" className="hover:text-emerald-300 transition-colors">
                      contact@temari-fan.app
                    </a>
                  </p>
                  <p className="text-emerald-400/70 text-xs mt-2">
                    We'll respond within 24 hours
                  </p>
                </div>
              </div>
            </div>
 
            {/* Response Time */}
            <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/5 border border-teal-500/30 rounded-xl p-6 mb-6 hover:border-teal-400/50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-teal-500/20 rounded-lg">
                  <Phone className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-teal-300 font-semibold mb-2">Response Time</h3>
                  <p className="text-teal-200 text-sm">
                    Usually 24-48 hours
                  </p>
                  <p className="text-teal-400/70 text-xs mt-2">
                    During business hours (EST)
                  </p>
                </div>
              </div>
            </div>
 
            {/* Community */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400/50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <MapPin className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-cyan-300 font-semibold mb-2">Community</h3>
                  <p className="text-cyan-200 text-sm">
                    Join our fan community and connect with other Temari enthusiasts
                  </p>
                  <p className="text-cyan-400/70 text-xs mt-2">
                    Built for fans, by fans
                  </p>
                </div>
              </div>
            </div>
 
          </div>
 
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800/50 to-gray-900/50 border border-emerald-500/20 rounded-2xl p-8 backdrop-blur-md">
              
              {/* Success Message */}
              {submitted && (
                <div className="mb-6 p-4 bg-emerald-500/15 border border-emerald-500/50 rounded-lg flex items-center space-x-3 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-300 font-semibold">Message Sent!</p>
                    <p className="text-emerald-200 text-sm">Thank you for reaching out. We'll get back to you soon.</p>
                  </div>
                </div>
              )}
 
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/15 border border-red-500/50 rounded-lg flex items-center space-x-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-red-300 font-semibold">Error</p>
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                </div>
              )}
 
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name */}
                <div>
                  <label className="block text-emerald-300 font-semibold mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg text-emerald-100 placeholder-emerald-500/50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-colors"
                  />
                </div>
 
                {/* Email */}
                <div>
                  <label className="block text-emerald-300 font-semibold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg text-emerald-100 placeholder-emerald-500/50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-colors"
                  />
                </div>
 
                {/* Subject */}
                <div>
                  <label className="block text-emerald-300 font-semibold mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg text-emerald-100 placeholder-emerald-500/50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-colors"
                  />
                </div>
 
                {/* Message */}
                <div>
                  <label className="block text-emerald-300 font-semibold mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what's on your mind..."
                    rows="6"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg text-emerald-100 placeholder-emerald-500/50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-colors resize-none"
                  />
                </div>
 
                {/* Contact Method */}
                <div>
                  <label className="block text-emerald-300 font-semibold mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    name="contactMethod"
                    value={formData.contactMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg text-emerald-100 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-colors"
                  >
                    <option value="email">Email</option>
                  </select>
                </div>
 
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || submitted}
                  className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-emerald-600 disabled:to-teal-600 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-2 group"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : submitted ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Message Sent!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
 
                {/* Privacy Note */}
                <p className="text-emerald-400/70 text-xs text-center">
                  We respect your privacy. Your email will only be used to respond to your inquiry.
                </p>
              </form>
            </div>
          </div>
 
        </div>
 
        {/* FAQ Section */}
        <div className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-emerald-400 mb-8">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div>
              <h3 className="text-emerald-300 font-semibold mb-2">How long does it take to get a response?</h3>
              <p className="text-emerald-200 text-sm">
                We typically respond to all inquiries within 24-48 hours. During busy periods, it may take up to 72 hours.
              </p>
            </div>
 
            <div>
              <h3 className="text-emerald-300 font-semibold mb-2">Can I report bugs or issues?</h3>
              <p className="text-emerald-200 text-sm">
                Absolutely! You can use our dedicated <a href="/reports" className="text-emerald-400 hover:text-emerald-300 transition-colors">Report Issue</a> page for bug reports, or contact us directly here.
              </p>
            </div>
 
            <div>
              <h3 className="text-emerald-300 font-semibold mb-2">How can I contribute fan art?</h3>
              <p className="text-emerald-200 text-sm">
                Visit our <a href="/gallery" className="text-emerald-400 hover:text-emerald-300 transition-colors">Gallery</a> page to submit your artwork. We'd love to see your creations!
              </p>
            </div>
 
            <div>
              <h3 className="text-emerald-300 font-semibold mb-2">Is there a Discord community?</h3>
              <p className="text-emerald-200 text-sm">
                Check back soon! We're planning to launch a Discord server. Contact us to express your interest!
              </p>
            </div>
 
            <div>
              <h3 className="text-emerald-300 font-semibold mb-2">Can I request new features?</h3>
              <p className="text-emerald-200 text-sm">
                Yes! Use the "Feature Request" option on the <a href="/reports" className="text-emerald-400 hover:text-emerald-300 transition-colors">Report Issue</a> page, or contact us directly.
              </p>
            </div>
 
            <div>
              <h3 className="text-emerald-300 font-semibold mb-2">Do you accept sponsorships?</h3>
              <p className="text-emerald-200 text-sm">
                We're open to partnerships and collaborations! Reach out through this form and let's discuss possibilities.
              </p>
            </div>
 
          </div>
        </div>
 
      </div>
    </div>
  );

};


export default ContactUs;
