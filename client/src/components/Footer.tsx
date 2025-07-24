import { FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Brand Name */}
          <div className="mb-6">
            <span className="text-xl font-alata text-white font-medium">Investor Feed</span>
          </div>
          
          <p className="text-gray-400 font-alata mb-6 max-w-md mx-auto">
            Cutting through market noise to deliver the insights that matter most to your investment decisions.
          </p>
          
          {/* Contact & Support */}
          <div className="mb-6 space-y-4">
            <div className="text-center">
              <p className="text-gray-400 font-alata text-sm mb-2">Contact us:</p>
              <a 
                href="mailto:investor@investorfeed.in" 
                className="text-[hsl(280,100%,70%)] hover:text-[hsl(280,100%,75%)] font-alata transition-colors duration-200"
              >
                investor@investorfeed.in
              </a>
            </div>
            
            <div className="text-center">
              <p className="text-gray-400 font-alata text-sm mb-2">Appreciate what we do:</p>
              <a 
                href="https://pages.razorpay.com/pl_PWmbKVx0mTStf4/view" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] text-black font-alata text-sm rounded-lg hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] transition-all duration-200"
              >
                💝 Support Us
              </a>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-6">
            <a 
              href="https://x.com/_Investor_Feed_" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[hsl(280,100%,70%)] transition-colors duration-200"
            >
              <FaTwitter className="text-xl" />
            </a>
          </div>
          
          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-500 font-alata text-sm">
              &copy; 2024 Investor Feed. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
