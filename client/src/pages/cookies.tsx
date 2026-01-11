import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Cookies() {
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
            Cookie <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-muted-foreground font-alata">Last updated: January 2026</p>
        </div>

        <div className="prose prose-invert max-w-none">
          {/* What Are Cookies */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">What Are Cookies & Similar Technologies?</h2>
            <p className="text-muted-foreground font-alata mb-4">
              <strong className="text-foreground">Cookies</strong> are small text files stored on your device
              when you visit a website. They help websites remember your preferences and improve your experience.
            </p>
            <p className="text-muted-foreground font-alata mb-4">
              <strong className="text-foreground">Local Storage</strong> is similar to cookies but allows
              websites to store larger amounts of data locally in your browser. We use this to remember
              your preferences and keep you logged in.
            </p>
            <p className="text-muted-foreground font-alata">
              <strong className="text-foreground">Pixels</strong> are small pieces of code that help us
              understand how you interact with our service. We use Google Analytics which may use pixels
              to collect anonymous usage data.
            </p>
          </div>

          {/* How We Use Cookies */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">How We Use These Technologies</h2>
            <p className="text-muted-foreground font-alata mb-4">
              Investor Feed uses cookies and local storage to:
            </p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li><strong className="text-foreground">Authentication:</strong> Keep you securely signed in to your account</li>
              <li><strong className="text-foreground">Preferences:</strong> Remember your settings like dark/light mode and selected feed</li>
              <li><strong className="text-foreground">Security:</strong> Protect your account from unauthorized access</li>
              <li><strong className="text-foreground">Analytics:</strong> Understand how you use our service so we can improve it</li>
              <li><strong className="text-foreground">Advertising:</strong> Display relevant advertisements (via Google AdSense)</li>
            </ul>
          </div>

          {/* Essential Cookies & Local Storage */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">Essential Cookies & Local Storage</h2>
            <p className="text-muted-foreground font-alata mb-4">
              These are necessary for the website to function properly. You cannot opt out of these.
            </p>

            <h3 className="text-lg font-alata text-foreground mb-3 mt-6">Cookies</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm text-muted-foreground font-alata">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-foreground">Name</th>
                    <th className="text-left py-2 text-foreground">Purpose</th>
                    <th className="text-left py-2 text-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2 font-mono text-xs">refresh_token</td>
                    <td className="py-2">Maintains your login session securely (httpOnly)</td>
                    <td className="py-2">7 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-alata text-foreground mb-3">Local Storage</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-muted-foreground font-alata">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-foreground">Name</th>
                    <th className="text-left py-2 text-foreground">Purpose</th>
                    <th className="text-left py-2 text-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2 font-mono text-xs">authToken</td>
                    <td className="py-2">Keeps you logged in across page refreshes</td>
                    <td className="py-2">Until logout</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 font-mono text-xs">theme</td>
                    <td className="py-2">Remembers your dark/light mode preference</td>
                    <td className="py-2">Persistent</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 font-mono text-xs">selectedFeedId</td>
                    <td className="py-2">Remembers your last selected feed</td>
                    <td className="py-2">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">Analytics Cookies</h2>
            <p className="text-muted-foreground font-alata mb-4">
              We use Google Analytics to understand how visitors interact with our website.
              This data is aggregated and anonymous.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-muted-foreground font-alata">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-foreground">Name</th>
                    <th className="text-left py-2 text-foreground">Purpose</th>
                    <th className="text-left py-2 text-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2 font-mono text-xs">_ga</td>
                    <td className="py-2">Distinguishes unique visitors</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 font-mono text-xs">_ga_*</td>
                    <td className="py-2">Maintains session state for Google Analytics</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 font-mono text-xs">_gid</td>
                    <td className="py-2">Distinguishes users for analytics</td>
                    <td className="py-2">24 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Advertising Cookies */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">Advertising Cookies</h2>
            <p className="text-muted-foreground font-alata mb-4">
              We use Google AdSense to display advertisements. These cookies help show you relevant ads
              and measure ad performance.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-muted-foreground font-alata">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-foreground">Name</th>
                    <th className="text-left py-2 text-foreground">Purpose</th>
                    <th className="text-left py-2 text-foreground">Provider</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2 font-mono text-xs">__gads</td>
                    <td className="py-2">Measures ad interactions and prevents showing same ads repeatedly</td>
                    <td className="py-2">Google</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 font-mono text-xs">__gpi</td>
                    <td className="py-2">Collects visitor data for ad personalization</td>
                    <td className="py-2">Google</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 font-mono text-xs">DSID</td>
                    <td className="py-2">Identifies signed-in users for ad personalization</td>
                    <td className="py-2">Google</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 font-mono text-xs">IDE</td>
                    <td className="py-2">Used for targeted advertising across websites</td>
                    <td className="py-2">Google</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground font-alata text-sm mt-4">
              You can manage ad personalization preferences at{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Ads Settings
              </a>.
            </p>
          </div>

          {/* Third-Party Services */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground font-alata mb-4">
              We integrate with the following third-party services that may set their own cookies:
            </p>
            <ul className="text-muted-foreground font-alata list-disc pl-6">
              <li className="mb-2">
                <strong className="text-foreground">Google Analytics:</strong> Website analytics and usage statistics.{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>
              </li>
              <li className="mb-2">
                <strong className="text-foreground">Google AdSense:</strong> Displaying relevant advertisements.{' '}
                <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ad Policy</a>
              </li>
              <li className="mb-2">
                <strong className="text-foreground">Google OAuth:</strong> Sign-in with Google.{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>
              </li>
              <li>
                <strong className="text-foreground">X (Twitter) OAuth:</strong> Sign-in with X.{' '}
                <a href="https://twitter.com/en/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* Managing Cookies */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">Managing Cookies</h2>
            <p className="text-muted-foreground font-alata">
              You can manage or disable cookies through your browser settings. Note that disabling
              essential cookies may affect functionality. To clear local storage, use your browser's
              developer tools or clear site data.
            </p>
          </div>

          {/* Updates */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">Updates to This Policy</h2>
            <p className="text-muted-foreground font-alata">
              We may update this Cookie Policy from time to time. Significant changes will be
              posted on this page with an updated date.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground font-alata">
              Questions about our use of cookies? Contact us at{' '}
              <a href="mailto:investor@investorfeed.in" className="text-primary hover:underline">
                investor@investorfeed.in
              </a>
            </p>
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
