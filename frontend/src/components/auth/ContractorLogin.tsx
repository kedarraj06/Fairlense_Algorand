import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Eye, EyeOff, Briefcase, Lock, Key, CheckCircle } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

interface ContractorLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContractorLogin({ isOpen, onClose, onSuccess }: ContractorLoginProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [companyEmail, setCompanyEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyPasskey, setCompanyPasskey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [gstin, setGstin] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [otpMethod, setOtpMethod] = useState('email');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (step === 3 && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const handleStep1 = () => {
    if (!companyEmail || !password) {
      toast.error('Please enter all credentials');
      return;
    }
    toast.success('Business credentials validated');
    setStep(2);
  };

  const handleStep2 = () => {
    if (!companyType || !gstin || companyPasskey.length < 8) {
      toast.error('Please complete business verification');
      return;
    }
    toast.success('Business verification successful');
    setStep(3);
    setTimer(60);
  };

  const handleStep3 = () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    toast.success('Authentication successful!', {
      description: 'Business access granted',
    });
    setTimeout(() => {
      onSuccess();
      onClose();
      setStep(1);
    }, 1000);
  };

  const resendOTP = () => {
    setTimer(60);
    toast.success(`New OTP sent to your ${otpMethod}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Contractor Business Portal</DialogTitle>
          <DialogDescription className="text-center">
            Secure business authentication with verification
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between mb-2 text-sm">
            <span className={step >= 1 ? 'text-emerald-600' : 'text-gray-400'}>Credentials</span>
            <span className={step >= 2 ? 'text-emerald-600' : 'text-gray-400'}>Verification</span>
            <span className={step >= 3 ? 'text-emerald-600' : 'text-gray-400'}>OTP</span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2 [&>div]:bg-emerald-600" />
        </div>

        {/* Step 1: Business Credentials */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-email">Company Email / Registration ID</Label>
              <Input
                id="company-email"
                type="text"
                placeholder="contractor@company.com"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Use demo: abc@constructions.com</p>
            </div>

            <div>
              <Label htmlFor="company-password">Corporate Password</Label>
              <div className="relative mt-1">
                <Input
                  id="company-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Use demo: business123</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
              <div className="flex items-start">
                <Briefcase className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-emerald-900">Secure business access</p>
                  <p className="text-emerald-700 text-xs mt-1">Multiple admin levels supported</p>
                </div>
              </div>
            </div>

            <Button onClick={handleStep1} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Continue to Verification
            </Button>
          </div>
        )}

        {/* Step 2: Business Verification */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-type">Company Type</Label>
              <Select value={companyType} onValueChange={setCompanyType}>
                <SelectTrigger id="company-type" className="mt-1">
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pvt-ltd">Private Limited</SelectItem>
                  <SelectItem value="public">Public Limited</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="proprietorship">Proprietorship</SelectItem>
                  <SelectItem value="llp">LLP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gstin">GSTIN / PAN Number</Label>
              <Input
                id="gstin"
                type="text"
                placeholder="22AAAAA0000A1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="mt-1"
                maxLength={15}
              />
              <p className="text-xs text-gray-500 mt-1">Use demo: 22AAAAA0000A1Z5</p>
            </div>

            <div>
              <Label htmlFor="company-passkey">Company Security Passkey</Label>
              <div className="relative mt-1">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="company-passkey"
                  type="password"
                  placeholder="Enter company passkey"
                  value={companyPasskey}
                  onChange={(e) => setCompanyPasskey(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Use demo: CompanyKey@123</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
              <p className="text-blue-900">Business documents will be verified automatically</p>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleStep2} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                Verify Business
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: OTP Verification */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto mb-3 flex items-center justify-center">
                <Lock className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-sm text-gray-600">
                Enter the OTP sent to your registered {otpMethod}
              </p>
            </div>

            <div>
              <Label>Verification Method</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={otpMethod === 'email' ? 'default' : 'outline'}
                  onClick={() => setOtpMethod('email')}
                  className="flex-1"
                  size="sm"
                >
                  Email OTP
                </Button>
                <Button
                  variant={otpMethod === 'sms' ? 'default' : 'outline'}
                  onClick={() => setOtpMethod('sms')}
                  className="flex-1"
                  size="sm"
                >
                  SMS OTP
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="contractor-otp">Verification Code</Label>
              <Input
                id="contractor-otp"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest mt-1"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1 text-center">Use demo: 654321</p>
            </div>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-600">OTP expires in {timer}s</p>
              ) : (
                <Button variant="link" onClick={resendOTP} className="text-emerald-600">
                  Resend OTP
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleStep3} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Access Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t pt-4">
          <p>Blockchain-secured business transactions</p>
          <p className="mt-1">Session ID: 0x8a1b...2496</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
