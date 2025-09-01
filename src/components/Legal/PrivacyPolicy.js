// src/components/Legal/PrivacyPolicy.js
import React from 'react';
import { X, Shield, Lock, Eye, Database, Trash2, Users } from 'lucide-react';

export default function PrivacyPolicy({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Privacy Promise */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Our Privacy Promise</h3>
                <p className="text-blue-700 text-sm">
                  Your data is yours. We're just the fancy AI butler helping you organize it. 
                  We don't snoop, we don't sell, and we definitely don't gossip about your business plans. 🤐
                </p>
              </div>
            </div>
          </div>

          {/* What We Collect */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Database className="w-5 h-5 text-green-600" />
              <span>What We Collect (And What We Don't)</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✅ What We Do Collect</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Basic account info (email, name)</li>
                  <li>• App usage analytics (which features you love)</li>
                  <li>• Technical logs (for fixing bugs)</li>
                  <li>• Subscription status (to keep the lights on)</li>
                </ul>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">❌ What We Don't Collect</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Your document contents</li>
                  <li>• Your conversation history</li>
                  <li>• Your business strategies</li>
                  <li>• Your secret sauce recipes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Handle Your Documents */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Lock className="w-5 h-5 text-purple-600" />
              <span>Your Documents & Ideas</span>
            </h3>
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Local First Processing</h4>
                <p className="text-purple-700 text-sm">
                  When possible, we process your documents right in your browser. No upload, 
                  no storage, no peeking. It's like having a super smart intern who immediately 
                  forgets everything after helping you.
                </p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Temporary Server Processing</h4>
                <p className="text-purple-700 text-sm">
                  For complex analysis, we might briefly use our servers. Think of it like a 
                  high-security shredder - your document goes in, insights come out, and the 
                  original is immediately destroyed. No copies, no backups, no "oops we forgot to delete it."
                </p>
              </div>
            </div>
          </section>

          {/* AI & Third Parties */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span>AI Services & Third Parties</span>
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>AI Providers:</strong> We use AI services like OpenAI and Anthropic to power 
                our advisors. These providers may temporarily process your queries according to their 
                own privacy policies, but they don't use your data to train their models.
              </p>
              <p>
                <strong>No Selling:</strong> We never sell your data to advertisers, data brokers, 
                or that guy who keeps calling about your car's extended warranty. Your information 
                stays with us and our trusted service providers only.
              </p>
              <p>
                <strong>Service Providers:</strong> We work with hosting providers, payment processors, 
                and analytics services. They're all bound by strict agreements to keep your data safe.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span>Data Retention & Deletion</span>
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Account Data:</strong> We keep your account information as long as you're 
                using the service. Delete your account, and we'll remove your data within 30 days 
                (except what we're legally required to keep for accounting).
              </p>
              <p>
                <strong>Document Processing:</strong> Documents are deleted immediately after processing. 
                No storage, no cache, no "just in case" copies.
              </p>
              <p>
                <strong>Conversation History:</strong> Stored locally in your browser only. We can't 
                see it, and you can clear it anytime.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>Your Rights</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">🔍 Right to Know</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Ask us what data we have about you (spoiler: it's probably just your email and subscription status).
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">✏️ Right to Correct</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Update your information anytime through your account settings.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">🗑️ Right to Delete</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Delete your account and data anytime. We'll miss you, but we respect your choice.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">📱 Right to Portability</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Export your data if you want to take it elsewhere (though we'd prefer you stay).
                </p>
              </div>
            </div>
          </section>

          {/* Security */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Security Measures</h3>
            <div className="space-y-3 text-gray-700">
              <p>
                We use industry-standard security measures including encryption in transit and at rest, 
                secure authentication, and regular security audits. Our servers are protected better 
                than the secret recipe for Coca-Cola.
              </p>
              <p>
                However, no system is 100% secure (not even Fort Knox). We do our best, but you should 
                still use strong passwords and not share your account credentials.
              </p>
            </div>
          </section>

          {/* Contact & Updates */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-gray-700">
              <p>
                Privacy questions? Concerns about how we handle your data? Just want to compliment 
                our privacy policy writing skills? Reach out through our support channels.
              </p>
              <p>
                We'll update this policy occasionally to reflect new features or legal requirements. 
                Major changes will be communicated with reasonable notice - no midnight policy switches.
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-sm text-gray-500 text-center">
              Last updated: {new Date().toLocaleDateString()} • 
              We take your privacy seriously, even if we joke about everything else. 
              Your trust is not a laughing matter. 🔒
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}