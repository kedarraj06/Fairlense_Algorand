import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Eye, EyeOff, Users, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';

interface CitizenAccessProps {
  isOpen: boolean;
  onClose: () => void;
  onPublicAccess: () => void;
  onRegisteredAccess: () => void;
}

export default function CitizenAccess({ isOpen, onClose, onPublicAccess, onRegisteredAccess }: CitizenAccessProps) {
  const [activeTab, setActiveTab] = useState('public');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Sign In
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Sign Up
  const [signUpStep, setSignUpStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailOTP, setEmailOTP] = useState('');
  const [mobileOTP, setMobileOTP] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd) && /[!@#$%^&*]/.test(pwd)) strength += 25;
    setPasswordStrength(strength);
  };

  const handlePublicAccess = () => {
    toast.success('Accessing public portal');
    onPublicAccess();
    onClose();
  };

  const handleSignIn = () => {
    if (!signInEmail || !signInPassword) {
      toast.error('Please enter email and password');
      return;
    }
    toast.success('Welcome back!', {
      description: 'Accessing your personalized dashboard',
    });
    setTimeout(() => {
      onRegisteredAccess();
      onClose();
    }, 1000);
  };

  const handleSignUpStep1 = () => {
    if (!fullName || !email || !mobile || !location) {
      toast.error('Please fill all fields');
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    toast.success('Verification codes sent to email and mobile');
    setSignUpStep(2);
  };

  const handleSignUpStep2 = () => {
    if (emailOTP.length !== 6 || mobileOTP.length !== 6) {
      toast.error('Please enter both verification codes');
      return;
    }
    toast.success('Contact details verified');
    setSignUpStep(3);
  };

  const handleSignUpStep3 = () => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordStrength < 75) {
      toast.error('Password is too weak');
      return;
    }
    if (!acceptTerms) {
      toast.error('Please accept terms and privacy policy');
      return;
    }
    toast.success('Account created successfully!', {
      description: 'Welcome to FAIRLENS',
    });
    setTimeout(() => {
      onRegisteredAccess();
      onClose();
      setSignUpStep(1);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Citizen Access Portal</DialogTitle>
          <DialogDescription className="text-center">
            Choose how you want to access FAIRLENS
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="public">Public Access</TabsTrigger>
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Public Access */}
          <TabsContent value="public" className="space-y-4 mt-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg mb-2">Quick Public Access</h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse projects, view spending analytics, and explore public data without registration
              </p>
              <div className="space-y-2 text-sm text-left mb-4">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>View all public projects</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Access spending dashboards</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Explore project maps</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Read-only anonymous browsing</span>
                </div>
              </div>
              <Button onClick={handlePublicAccess} className="w-full bg-purple-600 hover:bg-purple-700">
                Browse Anonymously
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>Want more features?</p>
              <div className="flex justify-center space-x-4 mt-2">
                <Button variant="link" onClick={() => setActiveTab('signin')} className="text-purple-600">
                  Sign In
                </Button>
                <Button variant="link" onClick={() => setActiveTab('signup')} className="text-purple-600">
                  Create Account
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Sign In */}
          <TabsContent value="signin" className="space-y-4 mt-6">
            <div>
              <Label htmlFor="signin-email">Email or Mobile Number</Label>
              <Input
                id="signin-email"
                type="text"
                placeholder="your.email@example.com or 9876543210"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Use demo: citizen@fairlens.in</p>
            </div>

            <div>
              <Label htmlFor="signin-password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Use demo: citizen123</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember-me" className="text-sm cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Button variant="link" className="text-purple-600 text-sm p-0">
                Forgot password?
              </Button>
            </div>

            <Button onClick={handleSignIn} className="w-full bg-purple-600 hover:bg-purple-700">
              Sign In to Dashboard
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Button variant="link" onClick={() => setActiveTab('signup')} className="text-purple-600 p-0">
                Sign Up
              </Button>
            </div>
          </TabsContent>

          {/* Sign Up */}
          <TabsContent value="signup" className="space-y-4 mt-6">
            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between mb-2 text-sm">
                <span className={signUpStep >= 1 ? 'text-purple-600' : 'text-gray-400'}>Details</span>
                <span className={signUpStep >= 2 ? 'text-purple-600' : 'text-gray-400'}>Verify</span>
                <span className={signUpStep >= 3 ? 'text-purple-600' : 'text-gray-400'}>Password</span>
              </div>
              <Progress value={(signUpStep / 3) * 100} className="h-2 [&>div]:bg-purple-600" />
            </div>

            {/* Step 1: Basic Details */}
            {signUpStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="pl-10"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location / Pincode</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="Mumbai, 400001"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button onClick={handleSignUpStep1} className="w-full bg-purple-600 hover:bg-purple-700">
                  Continue to Verification
                </Button>
              </div>
            )}

            {/* Step 2: Verification */}
            {signUpStep === 2 && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
                  <p className="text-purple-900">Verification codes sent to:</p>
                  <p className="text-purple-700 text-xs mt-1">Email: {email}</p>
                  <p className="text-purple-700 text-xs">Mobile: {mobile}</p>
                </div>

                <div>
                  <Label htmlFor="email-otp">Email Verification Code</Label>
                  <Input
                    id="email-otp"
                    type="text"
                    placeholder="000000"
                    value={emailOTP}
                    onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center tracking-widest mt-1"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">Use demo: 111111</p>
                </div>

                <div>
                  <Label htmlFor="mobile-otp">Mobile Verification Code</Label>
                  <Input
                    id="mobile-otp"
                    type="text"
                    placeholder="000000"
                    value={mobileOTP}
                    onChange={(e) => setMobileOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center tracking-widest mt-1"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">Use demo: 222222</p>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setSignUpStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSignUpStep2} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Verify Codes
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Password Setup */}
            {signUpStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Create Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        calculatePasswordStrength(e.target.value);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Password Strength</span>
                    <span className={
                      passwordStrength >= 75 ? 'text-green-600' :
                      passwordStrength >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }>
                      {passwordStrength >= 75 ? 'Strong' : passwordStrength >= 50 ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className="h-2" />
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="accept-terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  />
                  <Label htmlFor="accept-terms" className="text-xs cursor-pointer leading-relaxed">
                    I accept the Terms of Service and Privacy Policy
                  </Label>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setSignUpStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSignUpStep3} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Account
                  </Button>
                </div>
              </div>
            )}

            {signUpStep === 1 && (
              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Button variant="link" onClick={() => setActiveTab('signin')} className="text-purple-600 p-0">
                  Sign In
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Benefits */}
        {activeTab === 'signup' && signUpStep === 1 && (
          <div className="border-t pt-4">
            <p className="text-sm mb-2">Registered Account Benefits:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-purple-600 mr-1" />
                <span>Track favorite projects</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-purple-600 mr-1" />
                <span>Report issues</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-purple-600 mr-1" />
                <span>Get notifications</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-purple-600 mr-1" />
                <span>Community engagement</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
