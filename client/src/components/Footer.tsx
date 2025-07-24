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
          
          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-6">
            <a 
              href="https://x.com/_Investor_Feed_" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[hsl(258,73%,68%)] transition-colors duration-200"
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
