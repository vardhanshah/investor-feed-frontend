import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FaTwitter } from "react-icons/fa";
import { Link } from "wouter";

export default function FinalCTA() {
  return (
    <section className="py-20 bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative text-center">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-transparent to-cyan-100 dark:from-purple-950/30 dark:via-transparent dark:to-cyan-950/30 rounded-3xl blur-3xl opacity-50" />

          {/* Content Card */}
          <div className="relative bg-card rounded-3xl border border-border p-8 md:p-12 shadow-sm">
            <h2 className="text-3xl lg:text-4xl font-alata text-foreground mb-4">
              Ready to{' '}
              <span className="gradient-text">Stay Ahead</span>?
            </h2>
            <p className="text-muted-foreground font-alata text-lg mb-8 max-w-xl mx-auto">
              Join thousands of investors who never miss market-moving announcements.
              Powerful features to keep you ahead of the market.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gradient-bg hover:opacity-90 text-white font-alata text-lg px-8 py-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Tracking
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Secondary CTA */}
            <div className="pt-6 border-t border-border">
              <p className="text-muted-foreground font-alata text-sm mb-4">
                Not ready yet? Follow us on Twitter for updates
              </p>
              <a
                href="https://twitter.com/_Investor_Feed_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:opacity-80 font-alata transition-colors"
              >
                <FaTwitter className="mr-2" />
                Follow @_Investor_Feed_
              </a>
            </div>
          </div>
        </div>

        {/* Contact & Footer Links */}
        <div id="contact-section" className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="text-center p-6 bg-card rounded-2xl border border-border">
            <h4 className="text-lg font-alata text-foreground mb-3">Contact Us</h4>
            <p className="text-muted-foreground font-alata mb-4 text-sm">Have questions or suggestions?</p>
            <a
              href="mailto:investor@investorfeed.in"
              className="inline-flex items-center px-5 py-2.5 bg-muted hover:bg-muted/80 text-primary font-alata rounded-lg transition-colors duration-200 text-sm"
            >
              investor@investorfeed.in
            </a>
          </div>

          <div className="text-center p-6 bg-card rounded-2xl border border-border">
            <h4 className="text-lg font-alata text-foreground mb-3">Support Our Work</h4>
            <p className="text-muted-foreground font-alata mb-4 text-sm">Help us continue providing valuable insights</p>
            <a
              href="https://pages.razorpay.com/pl_PWmbKVx0mTStf4/view"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 gradient-bg hover:opacity-90 text-white font-alata rounded-lg transition-all duration-200 text-sm"
            >
              Tip Us
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <div className="mb-4 flex justify-center space-x-6">
            <a
              href="/terms"
              className="text-muted-foreground hover:text-primary font-alata text-sm transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="/privacy"
              className="text-muted-foreground hover:text-primary font-alata text-sm transition-colors duration-200"
            >
              Privacy Policy
            </a>
          </div>
          <p className="text-muted-foreground font-alata text-sm">
            &copy; 2025 Investor Feed. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
}
