export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-alata text-white mb-4">
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p className="text-gray-400 font-alata">Last updated: January 2025</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 font-alata mb-4">
              By accessing and using Investor Feed's services, including our website and social media content, 
              you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">2. Service Description</h2>
            <p className="text-gray-300 font-alata mb-4">
              Investor Feed provides financial market insights, analysis, and information primarily through 
              our Twitter account (@_Investor_Feed_). Our services include:
            </p>
            <ul className="text-gray-300 font-alata mb-4 list-disc pl-6">
              <li>Real-time market intelligence updates</li>
              <li>Analysis of Indian Stock Exchange announcements</li>
              <li>Financial insights and commentary</li>
              <li>Investment-related educational content</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">3. Disclaimer</h2>
            <p className="text-gray-300 font-alata mb-4">
              <strong>Important:</strong> All content provided by Investor Feed is for informational and 
              educational purposes only. This is NOT investment advice, and we are NOT SEBI registered 
              investment advisors.
            </p>
            <p className="text-gray-300 font-alata mb-4">
              You should consult with qualified financial professionals before making any investment decisions. 
              Past performance does not guarantee future results.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">4. User Responsibilities</h2>
            <p className="text-gray-300 font-alata mb-4">Users agree to:</p>
            <ul className="text-gray-300 font-alata mb-4 list-disc pl-6">
              <li>Use our content responsibly and at their own risk</li>
              <li>Not redistribute our content without permission</li>
              <li>Respect intellectual property rights</li>
              <li>Follow applicable laws and regulations</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-300 font-alata mb-4">
              Investor Feed shall not be liable for any direct, indirect, incidental, special, 
              consequential, or punitive damages arising from your use of our services or any 
              investment decisions made based on our content.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">6. Contact Information</h2>
            <p className="text-gray-300 font-alata mb-4">
              For questions about these Terms of Service, please contact us at:
              <br />
              <a href="mailto:investor@investorfeed.in" className="text-[hsl(280,100%,70%)] hover:underline">
                investor@investorfeed.in
              </a>
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <a 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata rounded-lg transition-all duration-200"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}