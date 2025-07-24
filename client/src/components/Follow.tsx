import { Button } from "@/components/ui/button";
import { FaTwitter } from "react-icons/fa";
import { Filter, Clock, Lightbulb } from "lucide-react";

export default function Follow() {
  return (
    <section id="follow" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-alata text-white mb-12">
            Stay <span className="gradient-text">Connected</span>
          </h2>
          
          {/* Twitter Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-lg border border-gray-700 mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] rounded-full flex items-center justify-center">
                <FaTwitter className="text-black text-2xl" />
              </div>
            </div>
            <h3 className="text-2xl font-alata text-white mb-4">@_Investor_Feed_</h3>
            <p className="text-lg font-alata text-gray-300 mb-6">
              Get real-time market insights, investment analysis, and curated financial news 
              delivered directly to your feed.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <a 
                href="https://x.com/_Investor_Feed_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3"
              >
                <FaTwitter className="mr-2" />
                Follow Now
              </a>
            </Button>
          </div>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(280,100%,70%)]/20 to-[hsl(200,100%,70%)]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Filter className="text-[hsl(280,100%,70%)] text-xl w-6 h-6" />
              </div>
              <h4 className="text-lg font-alata text-white mb-2">Curated Content</h4>
              <p className="text-gray-300 font-alata">Quality over quantity - only the insights that matter</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(280,100%,70%)]/20 to-[hsl(200,100%,70%)]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="text-[hsl(200,100%,70%)] text-xl w-6 h-6" />
              </div>
              <h4 className="text-lg font-alata text-white mb-2">Timely Updates</h4>
              <p className="text-gray-300 font-alata">Real-time analysis when markets move</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(280,100%,70%)]/20 to-[hsl(200,100%,70%)]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="text-[hsl(320,100%,75%)] text-xl w-6 h-6" />
              </div>
              <h4 className="text-lg font-alata text-white mb-2">Clear Insights</h4>
              <p className="text-gray-300 font-alata">Complex data simplified for better decisions</p>
            </div>
          </div>

          {/* Contact & Support Section */}
          <div className="mt-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-lg border border-gray-700">
            <h3 className="text-2xl font-alata text-white mb-6 text-center">Get in Touch</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <h4 className="text-lg font-alata text-white mb-3">Contact Us</h4>
                <p className="text-gray-300 font-alata mb-4">Have questions or suggestions?</p>
                <a 
                  href="mailto:investor@investorfeed.in" 
                  className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-[hsl(280,100%,70%)] font-alata rounded-lg transition-colors duration-200"
                >
                  📧 investor@investorfeed.in
                </a>
              </div>
              
              <div className="text-center">
                <h4 className="text-lg font-alata text-white mb-3">Support Our Work</h4>
                <p className="text-gray-300 font-alata mb-4">Help us continue providing valuable insights</p>
                <a 
                  href="https://pages.razorpay.com/pl_PWmbKVx0mTStf4/view" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata rounded-lg transition-all duration-200"
                >
                  💝 Tip Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
