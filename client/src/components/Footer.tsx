import { FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Logo in Footer */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-10 h-10 mr-3">
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 75 L35 55 L50 70 L85 35" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M70 35 L85 35 L85 50" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="20" y="60" width="4" height="20" fill="white" rx="2"/>
                <rect x="35" y="45" width="4" height="35" fill="white" rx="2"/>
                <rect x="65" y="30" width="4" height="50" fill="white" rx="2"/>
              </svg>
            </div>
            <span className="text-xl font-alata text-white font-medium">Investor Feed</span>
          </div>
          
          <p className="text-gray-400 font-alata mb-6 max-w-md mx-auto">
            Cutting through market noise to deliver the insights that matter most to your investment decisions.
          </p>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-6">
            <a 
              href="https://x.com/_Investor_Feed_" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-200"
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
