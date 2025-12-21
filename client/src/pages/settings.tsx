import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageSquare, FileText, Trash2, ChevronRight, Star } from 'lucide-react';
import { useLocation, Link } from 'wouter';

type SettingsSection = 'feedback' | 'legal' | 'delete';

interface Question {
  id: number;
  question: string;
  placeholder: string;
}

interface FeedbackAnswer {
  question: string;
  answer: string;
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<SettingsSection>('feedback');

  // Feedback state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [rating, setRating] = useState<number>(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLocation('/login');
    }
  }, [setLocation]);

  // Fetch questionnaire
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/feedbacks/questionnaire');
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error('Error fetching questionnaire:', error);
        // Fallback questions for demo
        setQuestions([
          {
            id: 1,
            question: "If our product were a person, what advice would you give them?",
            placeholder: "Be honest - we can take it!"
          },
          {
            id: 2,
            question: "What's one thing that made you smile (or sigh) while using us?",
            placeholder: "The good, the bad, or the ugly..."
          },
          {
            id: 3,
            question: "What would make you recommend us to a friend without hesitation?",
            placeholder: "What's missing from your 'must-have' list?"
          }
        ]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    const feedbacks: FeedbackAnswer[] = questions
      .filter(q => answers[q.id]?.trim())
      .map(q => ({
        question: q.question,
        answer: answers[q.id].trim()
      }));

    if (feedbacks.length === 0) {
      toast({
        title: "Feedback required",
        description: "Please answer at least one question.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          rating,
          feedbacks,
        }),
      });

      if (response.ok) {
        toast({
          title: "Thank you!",
          description: "Your feedback has been submitted successfully.",
        });
        setAnswers({});
        setRating(0);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem('authToken');
        toast({
          title: "Account deleted",
          description: "Your account has been permanently deleted.",
        });
        setLocation('/');
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Deletion failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const sidebarItems = [
    { id: 'feedback' as const, label: 'Feedback', icon: MessageSquare },
    { id: 'legal' as const, label: 'Legal', icon: FileText },
    { id: 'delete' as const, label: 'Delete Account', icon: Trash2, danger: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => setLocation('/home')}
              className="text-foreground hover:bg-muted font-alata mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <span className="text-xl font-alata font-medium text-foreground">Settings</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Card className="bg-card border-border">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg font-alata transition-colors ${
                        activeSection === item.id
                          ? 'bg-muted text-foreground'
                          : item.danger
                          ? 'text-red-400 hover:bg-muted/50'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 mr-3 ${
                        activeSection === item.id && !item.danger
                          ? 'text-[hsl(280,100%,70%)]'
                          : ''
                      }`} />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content Panel */}
          <div className="flex-1">
            {/* Feedback Section */}
            {activeSection === 'feedback' && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl font-alata text-foreground">Feedback</CardTitle>
                  <CardDescription className="text-muted-foreground font-alata">
                    We'd love to hear from you. Help us improve your experience.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-alata text-foreground mb-3">
                      How would you rate your experience? <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <button
                          key={value}
                          onClick={() => setRating(value)}
                          className={`w-10 h-10 rounded-lg font-alata font-medium transition-all ${
                            rating >= value
                              ? 'bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] text-black'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 font-alata mt-2">
                      1 = Poor, 10 = Excellent
                    </p>
                  </div>

                  <Separator className="bg-border" />

                  {/* Questions */}
                  {isLoadingQuestions ? (
                    <div className="text-muted-foreground font-alata">Loading questions...</div>
                  ) : (
                    <div className="space-y-6">
                      {questions.map((q) => (
                        <div key={q.id}>
                          <label className="block text-sm font-alata text-foreground mb-2">
                            {q.question}
                          </label>
                          <Textarea
                            placeholder={q.placeholder}
                            value={answers[q.id] || ''}
                            onChange={(e) => setAnswers(prev => ({
                              ...prev,
                              [q.id]: e.target.value
                            }))}
                            className="bg-muted border-border text-foreground font-alata placeholder:text-muted-foreground focus:border-[hsl(280,100%,70%)] min-h-[100px]"
                            maxLength={2000}
                          />
                          <p className="text-xs text-muted-foreground font-alata mt-1 text-right">
                            {(answers[q.id] || '').length}/2000
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Legal Section */}
            {activeSection === 'legal' && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl font-alata text-foreground">Legal</CardTitle>
                  <CardDescription className="text-muted-foreground font-alata">
                    Review our policies and terms of service.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/privacy">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors cursor-pointer">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-[hsl(280,100%,70%)] mr-3" />
                        <span className="font-alata text-foreground">Privacy Policy</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>

                  <Link href="/terms">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors cursor-pointer">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-[hsl(200,100%,70%)] mr-3" />
                        <span className="font-alata text-foreground">Terms & Conditions</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Delete Account Section */}
            {activeSection === 'delete' && (
              <Card className="bg-card border-red-900/50">
                <CardHeader>
                  <CardTitle className="text-xl font-alata text-red-400">Delete Account</CardTitle>
                  <CardDescription className="text-muted-foreground font-alata">
                    Permanently delete your account and all associated data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-red-900/20 rounded-lg border border-red-900/50">
                    <p className="text-sm font-alata text-foreground">
                      <strong className="text-red-400">Warning:</strong> This action cannot be undone.
                      Once you delete your account, all your data will be permanently removed from our servers.
                    </p>
                  </div>

                  <ul className="text-sm font-alata text-muted-foreground space-y-2">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2 mt-2"></span>
                      Your profile and preferences will be deleted
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2 mt-2"></span>
                      Your saved insights and history will be removed
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2 mt-2"></span>
                      Any active subscriptions will be cancelled
                    </li>
                  </ul>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full font-alata bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground font-alata">
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground font-alata">
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="font-alata bg-muted border-border text-foreground hover:bg-muted/80">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="font-alata bg-red-600 hover:bg-red-700 text-white"
                        >
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
