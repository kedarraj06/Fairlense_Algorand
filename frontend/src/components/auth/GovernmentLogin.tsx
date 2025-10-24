import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Eye, EyeOff, Shield, Lock, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '../ui/progress';
import { toast } from 'sonner@2.0.3';

interface GovernmentLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GovernmentLogin({ isOpen, onClose, onSuccess }: GovernmentLoginProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passkey, setPasskey] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [timer, setTimer] = useState(30);
  const [passkeyStrength, setPasskeyStrength] = useState(0);

  useEffect(() => {
    if (step === 3 && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  useEffect(() => {
    if (passkey.length > 0) {
      let strength = 0;
      if (passkey.length >= 8) strength += 25;
      if (passkey.length >= 12) strength += 25;
      if (/[A-Z]/.test(passkey)) strength += 25;
      if (/[0-9]/.test(passkey) && /[!@#$%^&*]/.test(passkey)) strength += 25;
      setPasskeyStrength(strength);
    } else {
      setPasskeyStrength(0);
    }
  }, [passkey]);

  const validateEmail = (email: string) => {
    return email.endsWith('.gov.in') || email.endsWith('.gov') || email === 'admin@fairlens.gov';
  };

  const handleStep1 = () => {
    if (!validateEmail(email)) {
      toast.error('Please use a valid government email address');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Credentials validated');
    setStep(2);
  };

  const handleStep2 = () => {
    if (passkeyStrength < 75) {
      toast.error('Security passkey is too weak');
      return;
    }
    toast.success('Security passkey verified');
    setStep(3);
    setTimer(30);
  };

  const handleStep3 = () => {
    if (twoFactorCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    toast.success('Authentication successful!', {
      description: 'Access logged on blockchain',
    });
    setTimeout(() => {
      onSuccess();
      onClose();
      setStep(1);
    }, 1000);
  };

  const resendCode = () => {
    setTimer(30);
    toast.success('New verification code sent');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Government Secure Access</DialogTitle>
          <DialogDescription className="text-center">
            Multi-factor authentication with blockchain verification
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between mb-2 text-sm">
            <span className={step >= 1 ? 'text-blue-600' : 'text-gray-400'}>Credentials</span>
            <span className={step >= 2 ? 'text-blue-600' : 'text-gray-400'}>Security Key</span>
            <span className={step >= 3 ? 'text-blue-600' : 'text-gray-400'}>2FA</span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        {/* Step 1: Primary Credentials */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="gov-email">Official Email Address</Label>
              <Input
                id="gov-email"
                type="email"
                placeholder="admin@fairlens.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Use demo: admin@fairlens.gov</p>
            </div>

            <div>
              <Label htmlFor="gov-password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="gov-password"
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
              <p className="text-xs text-gray-500 mt-1">Use demo: password123</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <div className="flex items-start">
                <Shield className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-900">All authentication attempts are logged</p>
                  <p className="text-blue-700 text-xs mt-1">Blockchain-verified access control</p>
                </div>
              </div>
            </div>

            <Button onClick={handleStep1} className="w-full bg-blue-600 hover:bg-blue-700">
              Continue to Security Key
            </Button>
          </div>
        )}

        {/* Step 2: Security Passkey */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="gov-passkey">Security Passkey</Label>
              <div className="relative mt-1">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="gov-passkey"
                  type="password"
                  placeholder="Enter security passkey"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Use demo: SecureKey@2025</p>
            </div>

            {/* Passkey Strength Indicator */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Passkey Strength</span>
                <span className={
                  passkeyStrength >= 75 ? 'text-green-600' :
                  passkeyStrength >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }>
                  {passkeyStrength}%
                </span>
              </div>
              <Progress value={passkeyStrength} className="h-2" />
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs ${passkey.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                  ✓ 8+ characters
                </span>
                <span className={`text-xs ${/[A-Z]/.test(passkey) ? 'text-green-600' : 'text-gray-400'}`}>
                  ✓ Uppercase
                </span>
                <span className={`text-xs ${/[0-9]/.test(passkey) ? 'text-green-600' : 'text-gray-400'}`}>
                  ✓ Number
                </span>
                <span className={`text-xs ${/[!@#$%^&*]/.test(passkey) ? 'text-green-600' : 'text-gray-400'}`}>
                  ✓ Special char
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleStep2} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Verify Security Key
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Two-Factor Authentication */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto mb-3 flex items-center justify-center">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div>
              <Label htmlFor="gov-2fa">Verification Code</Label>
              <Input
                id="gov-2fa"
                type="text"
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest mt-1"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1 text-center">Use demo: 123456</p>
            </div>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-600">Code expires in {timer}s</p>
              ) : (
                <Button variant="link" onClick={resendCode} className="text-blue-600">
                  Resend Code
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-device"
                checked={rememberDevice}
                onCheckedChange={(checked) => setRememberDevice(checked as boolean)}
              />
              <Label htmlFor="remember-device" className="text-sm cursor-pointer">
                Trust this device for 30 days
              </Label>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleStep3} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Login
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t pt-4">
          <p>All access logged and blockchain-verified</p>
          <p className="mt-1">Hash: 0x7f9f...91385</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
