import { FaTwitter } from "react-icons/fa";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-card text-foreground py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Brand Name */}
          <div className="mb-6">
            <span className="text-xl font-alata text-foreground font-medium">Investor Feed</span>
          </div>

          <p className="text-muted-foreground font-alata mb-6 max-w-md mx-auto">
            Cutting through market noise to deliver the insights that matter most to your investment decisions.
          </p>

          {/* Contact & Support */}
          <div className="mb-6 space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground font-alata text-sm mb-2">Contact us:</p>
              <a
                href="mailto:investor@investorfeed.in"
                className="text-primary hover:opacity-80 font-alata transition-colors duration-200"
              >
                investor@investorfeed.in
              </a>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground font-alata text-sm mb-2">Appreciate what we do:</p>
              <a
                href="https://pages.razorpay.com/pl_PWmbKVx0mTStf4/view"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 gradient-bg text-white font-alata text-sm rounded-lg hover:opacity-90 transition-all duration-200"
              >
                Support Us
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-6">
            <a
              href="https://x.com/_Investor_Feed_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <FaTwitter className="text-xl" />
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex justify-center flex-wrap gap-4 mb-6 text-sm">
            <Link href="/terms" className="text-muted-foreground hover:text-primary font-alata transition-colors duration-200">
              Terms of Service
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary font-alata transition-colors duration-200">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/contact" className="text-muted-foreground hover:text-primary font-alata transition-colors duration-200">
              Contact
            </Link>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-muted-foreground font-alata text-sm">
              &copy; 2025 Investor Feed. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
