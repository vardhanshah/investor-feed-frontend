import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-foreground hover:bg-muted font-alata"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-alata text-foreground mb-4">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-muted-foreground font-alata">Last updated: December 2025</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground font-alata mb-4">
              Investor Feed collects only essential information to provide our services:
            </p>
            <h3 className="text-xl font-alata text-foreground mb-3">Account Information</h3>
            <p className="text-muted-foreground font-alata mb-4">
              When you create an account, we collect:
            </p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Profile picture (if provided via OAuth)</li>
            </ul>
            <h3 className="text-xl font-alata text-foreground mb-3">Authentication Data</h3>
            <p className="text-muted-foreground font-alata mb-4">
              If you sign in using Google or Twitter/X, we receive basic profile information
              (name, email, profile picture) from these providers. We do not access your
              contacts, posts, or other personal data from these platforms.
            </p>
            <h3 className="text-xl font-alata text-foreground mb-3">Technical Data</h3>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>IP address and browser type (for security and analytics)</li>
              <li>Session data (to keep you logged in)</li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground font-alata mb-4">We use collected information to:</p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>Create and manage your account</li>
              <li>Provide access to our filtering and sorting tools</li>
              <li>Authenticate your identity when you log in</li>
              <li>Send important service-related communications</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground font-alata mb-4">
              We do <strong className="text-foreground">NOT</strong> sell, trade, or rent your personal information to third parties.
              We may share information only in these limited circumstances:
            </p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>With your explicit consent</li>
              <li>To comply with legal requirements or court orders</li>
              <li>To protect our rights, property, and safety</li>
              <li>With service providers who help operate our platform (under strict confidentiality agreements)</li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">4. Third-Party Services</h2>
            <p className="text-muted-foreground font-alata mb-4">Our platform integrates with:</p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li><strong className="text-foreground">Google:</strong> For account authentication (OAuth login)</li>
              <li><strong className="text-foreground">Twitter/X:</strong> For account authentication (OAuth login)</li>
              <li><strong className="text-foreground">Razorpay:</strong> For payment processing (subject to Razorpay's privacy policy)</li>
            </ul>
            <p className="text-muted-foreground font-alata mb-4">
              These services have their own privacy policies which govern their data practices.
              We encourage you to review them.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">5. Cookies & Sessions</h2>
            <p className="text-muted-foreground font-alata mb-4">
              We use essential cookies and session storage for:
            </p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li><strong className="text-foreground">Authentication:</strong> To keep you securely logged in</li>
              <li><strong className="text-foreground">Preferences:</strong> To remember your settings (e.g., dark/light mode)</li>
              <li><strong className="text-foreground">Security:</strong> To protect against unauthorized access</li>
            </ul>
            <p className="text-muted-foreground font-alata mb-4">
              You can control cookie settings through your browser, but disabling essential
              cookies may affect your ability to use our services.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground font-alata mb-4">
              We retain your data as follows:
            </p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li><strong className="text-foreground">Account data:</strong> Retained until you delete your account</li>
              <li><strong className="text-foreground">Session data:</strong> Automatically expires after period of inactivity</li>
            </ul>
            <p className="text-muted-foreground font-alata mb-4">
              You may request deletion of your account and associated data at any time by
              contacting us.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">7. Data Security</h2>
            <p className="text-muted-foreground font-alata mb-4">
              We implement appropriate technical and organizational measures to protect your
              personal information, including:
            </p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>Encrypted data transmission (HTTPS)</li>
              <li>Secure password storage using industry-standard hashing</li>
              <li>Regular security assessments</li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">8. Your Rights</h2>
            <p className="text-muted-foreground font-alata mb-4">You have the right to:</p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>Access your personal information we hold</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Withdraw consent where applicable</li>
              <li>File complaints with relevant data protection authorities</li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground font-alata mb-4">
              We may update this Privacy Policy from time to time. We will notify you of
              significant changes by posting the new policy on this page with an updated
              "Last updated" date.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground font-alata mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights,
              please contact us:
              <br />
              <a href="mailto:investor@investorfeed.in" className="text-primary hover:underline">
                investor@investorfeed.in
              </a>
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/">
            <span className="inline-flex items-center px-6 py-3 gradient-bg hover:opacity-90 text-white font-alata rounded-lg transition-all duration-200 cursor-pointer">
              Back to Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
