import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

export default function Contact() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation('/');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-20 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-foreground hover:bg-muted font-alata"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-alata text-foreground mb-4">
            Contact <span className="gradient-text">Us</span>
          </h1>
          <p className="text-muted-foreground font-alata max-w-2xl mx-auto">
            Have questions, feedback, or need support? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-alata text-foreground">Email</h2>
            </div>
            <p className="text-muted-foreground font-alata mb-4">
              For general inquiries, support, or feedback, reach out to us at:
            </p>
            <a
              href="mailto:investor@investorfeed.in"
              className="text-primary hover:underline font-alata text-lg"
            >
              investor@investorfeed.in
            </a>
            <p className="text-muted-foreground font-alata mt-4 text-sm">
              We typically respond within 24-48 hours.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <FaXTwitter className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-alata text-foreground">Social</h2>
            </div>
            <p className="text-muted-foreground font-alata mb-4">
              Follow us for updates, tips, and market insights:
            </p>
            <a
              href="https://x.com/investorfeedin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline font-alata text-lg"
            >
              <FaXTwitter className="h-5 w-5" />
              @investorfeedin
            </a>
            <p className="text-muted-foreground font-alata mt-4 text-sm">
              DMs are open for quick questions.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mt-8">
          <h2 className="text-xl font-alata text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-foreground font-alata mb-1">How do I reset my password?</h3>
              <p className="text-muted-foreground font-alata text-sm">
                If you signed up with email, use the "Forgot Password" link on the login page.
                For OAuth users (Google/Twitter), your password is managed by those providers.
              </p>
            </div>
            <div>
              <h3 className="text-foreground font-alata mb-1">How do I delete my account?</h3>
              <p className="text-muted-foreground font-alata text-sm">
                Email us at investor@investorfeed.in with your account email, and we'll process your deletion request within 48 hours.
              </p>
            </div>
            <div>
              <h3 className="text-foreground font-alata mb-1">Where does the data come from?</h3>
              <p className="text-muted-foreground font-alata text-sm">
                We aggregate publicly available filings and announcements from stock exchanges including BSE and NSE.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/">
            <span className="inline-flex items-center px-6 py-3 gradient-bg hover:opacity-90 text-black font-alata rounded-lg transition-all duration-200 cursor-pointer">
              Back to Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
