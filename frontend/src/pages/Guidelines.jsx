import React from 'react';
import {Shield, Heart, Users, AlertCircle, CheckCircle, Flag} from 'lucide-react';

const Guidelines = () => {
    const sections = [{
      icon: <Heart className="w-6 h-6" />,
      title: 'Respect and Inclusivity',
      content: 'Treat all community members with respect. We celebrate diverse perspectives and welcome fans of all backgrounds. Harassment, discrimination, or hate speech of any kind will not be tolerated.',
      rules: [
        'Be respectful to other users',
        'No personal attacks or insults',
        'Avoid discrimination based on any characteristic',
        'Welcome diverse opinions and discussions'
      ]
    }, 

    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community Conduct',
      content: 'Keep discussions civil and constructive. This is a space for fans to share their passion for Temari and the Naruto universe. Off-topic or disruptive behavior may result in moderation.',
      rules: [
        'Keep conversations relevant to the community',
        'Use appropriate language',
        'No spam or self-promotion without permission',
        'Avoid double-posting or excessive flooding'
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Content Guidelines',
      content: 'All submitted content must be original or properly credited. Respect intellectual property and avoid posting copyrighted material without permission. Art credit is appreciated in fan art submissions.',
      rules: [
        'Only submit original or properly licensed content',
        'Credit artists and creators when sharing their work',
        'No explicit or NSFW content',
        'Avoid spoilers without warning labels',
        'No harassment or targeted content'
      ]
    },
    {
      icon: <Flag className="w-6 h-6" />,
      title: 'Moderation and Enforcement',
      content: 'Our moderators work to maintain a safe and welcoming environment. Violations of these guidelines may result in warnings, content removal, or account suspension depending on severity.',
      rules: [
        'First violation: Warning and content removal',
        'Second violation: Temporary mute (24-48 hours)',
        'Third violation: Temporary ban (7 days)',
        'Severe violations: Permanent ban'
      ]
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: 'Safety and Privacy',
      content: 'Never share personal information online. Do not ask others for personal details, phone numbers, addresses, or financial information. Report any unsafe behavior to our moderation team.',
      rules: [
        'Keep personal information private',
        'Do not share contact information in posts',
        'Report suspicious behavior immediately',
        'Use strong passwords for your account'
      ]
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Fan Art and Submissions',
      content: 'We love fan creations! When submitting art, make sure you have the rights to share it. Fan art is welcome as long as it follows our content guidelines.',
      rules: [
        'Only submit your own work or work you have permission to share',
        'Include appropriate content warnings if needed',
        'Respect other artists\' work and give proper credit',        
        'Follow rating guidelines (no NSFW content)',
        'Provide context and source information when relevant'
      ]
    }
];

 return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Community Guidelines
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Welcome to the Temari Fan Community! These guidelines help us maintain a respectful, inclusive, and safe space for all fans.
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-emerald-300 mb-4">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed">
            We're dedicated to creating a welcoming community where Temari fans can share their passion, discuss character insights, showcase their creativity, and connect with like-minded individuals. By following these guidelines, you help us maintain this positive environment for everyone.
          </p>
        </div>

        {/* Guidelines Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-slate-800/50 border border-emerald-500/20 rounded-2xl p-8 hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="text-emerald-400 flex-shrink-0">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-emerald-300 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {section.content}
                  </p>
                </div>
              </div>

              {/* Rules List */}
              <div className="ml-10 space-y-2">
                {section.rules.map((rule, ruleIdx) => (
                  <div key={ruleIdx} className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <p className="text-gray-300 text-sm">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reporting */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-orange-300 mb-4">Report a Violation</h2>
          <p className="text-gray-300 mb-4">
            If you witness any behavior that violates these guidelines, please report it to our moderation team. We take all reports seriously and will investigate promptly.
          </p>
          <div className="space-y-2">
            <p className="text-gray-400">
              <strong className="text-orange-300">How to Report:</strong>
            </p>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• Click the "Report" button on any post or comment</li>
              <li>• Use the contact form with details of the violation</li>
              <li>• Email us directly with screenshots and context</li>
              <li>• Mention a moderator in a comment for urgent issues</li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-slate-800/50 border border-emerald-500/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-emerald-300 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I post fan art that I created?',
                a: 'Absolutely! We encourage fan art. Just make sure to tag it appropriately and provide any relevant content warnings.'
              },
              {
                q: 'What happens if I violate these guidelines?',
                a: 'Depending on severity, violations may result in warnings, content removal, temporary mutes, or account suspension. Our moderators will work with you to improve community standards.'
              },
              {
                q: 'Can I share spoilers from the anime or manga?',
                a: 'Yes, but please use spoiler tags or clearly warn others. Use format: [SPOILER: Brief description] before your spoiler text.'
              },
              {
                q: 'Is self-promotion allowed?',
                a: 'Limited self-promotion is allowed with prior permission. Focus on contributing to the community first. Excessive promotion will be removed.'
              },
              {
                q: 'How do I become a moderator?',
                a: 'Moderators are selected by the community team based on contributions, conduct, and dedication. Being a great community member is the best way to be considered.'
              },
              {
                q: 'What if I disagree with a moderation decision?',
                a: 'You can appeal moderation decisions by contacting the moderation team with your reasoning. We welcome feedback and strive to be fair.'
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

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-400">
          <p>
            Thank you for being part of the Temari community! Together, we create an amazing space for fans. 🌬️
          </p>
        </div>
      </div>
    </div>
  );
};


export default Guidelines;