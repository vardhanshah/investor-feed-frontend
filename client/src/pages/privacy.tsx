export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-alata text-white mb-4">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-gray-400 font-alata">Last updated: January 2025</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">1. Information We Collect</h2>
            <p className="text-gray-300 font-alata mb-4">
              Investor Feed collects minimal information to provide our services:
            </p>
            <ul className="text-gray-300 font-alata mb-4 list-disc pl-6">
              <li><strong>Website Analytics:</strong> Basic usage data through web analytics (IP address, browser type, pages visited)</li>
              <li><strong>Contact Information:</strong> Email addresses when you contact us directly</li>
              <li><strong>Social Media Data:</strong> Public interaction data when you engage with our Twitter content</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300 font-alata mb-4">We use collected information to:</p>
            <ul className="text-gray-300 font-alata mb-4 list-disc pl-6">
              <li>Improve our website and content delivery</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Analyze content performance and user engagement</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">3. Information Sharing</h2>
            <p className="text-gray-300 font-alata mb-4">
              We do NOT sell, trade, or rent your personal information to third parties. 
              We may share information only in these limited circumstances:
            </p>
            <ul className="text-gray-300 font-alata mb-4 list-disc pl-6">
              <li>With your explicit consent</li>
              <li>To comply with legal requirements</li>
              <li>To protect our rights and safety</li>
              <li>With service providers who help operate our website (under strict confidentiality)</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">4. Third-Party Services</h2>
            <p className="text-gray-300 font-alata mb-4">Our website and services may include:</p>
            <ul className="text-gray-300 font-alata mb-4 list-disc pl-6">
              <li><strong>Twitter/X:</strong> Our primary content platform (subject to Twitter's privacy policy)</li>
              <li><strong>Razorpay:</strong> Payment processing for tips (subject to Razorpay's privacy policy)</li>
              <li><strong>Web Analytics:</strong> To understand website usage patterns</li>
            </ul>
            <p className="text-gray-300 font-alata mb-4">
              These services have their own privacy policies which govern their data practices.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">5. Data Security</h2>
            <p className="text-gray-300 font-alata mb-4">
              We implement appropriate technical and organizational measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">6. Your Rights</h2>
            <p className="text-gray-300 font-alata mb-4">You have the right to:</p>
            <ul className="text-gray-300 font-alata mb-4 list-disc pl-6">
              <li>Access your personal information we hold</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent where applicable</li>
              <li>File complaints with relevant authorities</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">7. Cookies</h2>
            <p className="text-gray-300 font-alata mb-4">
              Our website may use cookies and similar technologies to enhance user experience 
              and analyze website traffic. You can control cookie settings through your browser preferences.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-alata text-white mb-4">8. Contact Us</h2>
            <p className="text-gray-300 font-alata mb-4">
              If you have questions about this Privacy Policy, please contact us:
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