// src/components/Legal/TermsOfService.js
import React from 'react';
import { X, Shield, Lock, Eye, AlertTriangle } from 'lucide-react';

export default function TermsOfService({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Privacy First Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 mb-2">Your Privacy is Our Priority</h3>
                <p className="text-green-700 text-sm">
                  We don't store, access, or peek at your documents, ideas, or conversations. 
                  Your intellectual property stays yours. Period. 🛡️
                </p>
              </div>
            </div>
          </div>

          {/* Main Terms */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <span>Data Security & Privacy</span>
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Your Documents:</strong> We process documents locally in your browser when possible. 
                Any server processing is temporary and documents are immediately deleted after analysis.
              </p>
              <p>
                <strong>Your Ideas:</strong> All conversations, strategies, and insights generated remain 
                your intellectual property. We don't train models on your data or share it with anyone.
              </p>
              <p>
                <strong>Your Privacy:</strong> We don't sell data, don't have ads, and don't peek at your 
                private board meetings. What happens in the boardroom, stays in the boardroom.
              </p>
            </div>
          </section>

          {/* AI Disclaimers */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span>AI Advisory Disclaimers (The Fun Stuff)</span>
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Not Real Financial Advice:</strong> Our AI advisors are very smart, but they're 
                not licensed financial advisors, lawyers, or fortune tellers. Don't bet your house on 
                what Mark Cuban's AI says about your startup. 🎰
              </p>
              <p>
                <strong>AI Can Be Creative:</strong> Sometimes our AI advisors get a little too creative 
                and might make up facts, statistics, or even entire companies. Always verify important 
                information before making decisions.
              </p>
              <p>
                <strong>No Warranty:</strong> We provide this service "as is" - like a prototype you 
                found in a garage. It might be brilliant, it might be quirky, but we can't guarantee 
                it won't occasionally suggest pivoting to a pet rock business.
              </p>
            </div>
          </section>

          {/* Usage Terms */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Acceptable Use</h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Be Cool:</strong> Use the platform for legitimate business purposes. Don't try 
                to break it, hack it, or use it to plan world domination (unless it's a legitimate 
                business plan).
              </p>
              <p>
                <strong>Respect Others:</strong> If you're sharing access with team members, be respectful. 
                No spam, no harassment, no asking the AI to roast your competitors (tempting, we know).
              </p>
              <p>
                <strong>Stay Legal:</strong> Don't use the platform for anything illegal, unethical, 
                or that would make your grandmother disappointed in you.
              </p>
            </div>
          </section>

          {/* Service Availability */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Service Availability</h3>
            <div className="space-y-3 text-gray-700">
              <p>
                We strive for 99.9% uptime, but sometimes the internet gremlins attack our servers. 
                We'll do our best to keep things running smoothly, but we can't guarantee the service 
                will be available 24/7/365.
              </p>
              <p>
                We may update, modify, or discontinue features with notice. We promise to be cool about 
                it and not remove your favorite advisor without warning.
              </p>
            </div>
          </section>

          {/* Contact & Updates */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Updates & Contact</h3>
            <div className="space-y-3 text-gray-700">
              <p>
                We may update these terms occasionally. Major changes will be communicated clearly - 
                no sneaky fine print updates at 3 AM.
              </p>
              <p>
                Questions? Concerns? Just want to tell us how awesome we are? 
                Drop us a line through our support channels.
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-sm text-gray-500 text-center">
              Last updated: {new Date().toLocaleDateString()} • 
              By using this service, you agree to these terms and acknowledge that AI advice 
              should be taken with a grain of salt and a sense of humor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}