# FAIRLENS Authentication & Blockchain Features Guide

## 🔐 Enhanced Authentication System

### Government Login (Maximum Security - 3-Step Process)

**Access:** Click "Login as Government" on landing page

**Step 1: Primary Credentials**
- Official Email: `admin@fairlens.gov`
- Password: `password123`
- Features: Email validation (must end with .gov/.gov.in), password strength check

**Step 2: Security Passkey**
- Demo Passkey: `SecureKey@2025`
- Real-time strength indicator (must be 75%+ to proceed)
- Requirements: 8+ chars, uppercase, number, special character

**Step 3: Two-Factor Authentication**
- 6-digit OTP: `123456`
- 30-second timer with resend option
- "Trust this device" for 30 days

### Contractor Login (Business Security - 3-Step Process)

**Access:** Click "Login as Contractor" on landing page

**Step 1: Business Credentials**
- Company Email: `abc@constructions.com`
- Password: `business123`

**Step 2: Business Verification**
- Company Type: Select from dropdown (Private Limited, Public, etc.)
- GSTIN/PAN: `22AAAAA0000A1Z5`
- Company Passkey: `CompanyKey@123`

**Step 3: OTP Verification**
- Choose Email or SMS OTP
- 6-digit code: `654321`
- 60-second timer

### Citizen Access (Three Options)

**Access:** Click "Access as Citizen" on landing page

**Option 1: Quick Public Access**
- No registration required
- Click "Browse Anonymously"
- Read-only access to all public data
- Features: View projects, spending analytics, project maps

**Option 2: Sign In (Registered Users)**
- Email/Mobile: `citizen@fairlens.in`
- Password: `citizen123`
- Remember me option
- Access to personalized dashboard

**Option 3: Sign Up (New Account - 3-Step Process)**

**Step 1: Basic Details**
- Full Name, Email, Mobile (10 digits), Location

**Step 2: Verification**
- Email OTP: `111111`
- Mobile OTP: `222222`

**Step 3: Password Setup**
- Create strong password with real-time strength meter
- Confirm password
- Accept terms & privacy policy

**Registered Account Benefits:**
- ✓ Track favorite projects
- ✓ Submit and track issue reports
- ✓ Get personalized notifications
- ✓ Community engagement features

## 🔗 Blockchain Smart Contract Features

### Viewing Smart Contracts

Smart contract details can be accessed from multiple locations:

**Government Dashboard:**
1. Navigate to "Blockchain Verification" tab
2. Go to "Smart Contracts" section
3. Click "View Contract Details" on any contract

**Contractor Dashboard:**
1. Navigate to "Payments" tab
2. Click "View Smart Contract Details" button at bottom

### Smart Contract Viewer Features

**Overview Tab:**
- Full contract address with copy/external link
- Blockchain network information
- Creation date and performance score
- Total value, released amount, remaining balance
- Visual progress indicators

**Milestones Tab:**
- Interactive timeline visualization
- Each milestone shows:
  - Completion status (Completed/In Progress/Pending)
  - Payment amount and percentage
  - Payment release conditions checklist
  - Blockchain verification hash
  - Completion date

**Transactions Tab:**
- Complete transaction history
- Columns: Timestamp, Type, Amount, Block, Status, Hash
- Copy hash to clipboard
- Link to blockchain explorer

**Terms Tab:**
- Complete contract terms and conditions:
  - Project scope
  - Duration
  - Penalty rates
  - Quality standards
  - Grace period
  - Dispute resolution

**Audit Trail Tab:**
- Government verification history
- Quality audit reports
- Inspector details and scores
- Comments and findings
- Dispute status (if any)

### Blockchain Security Features

**Immutability:**
- All transactions recorded on Algorand blockchain
- Cryptographic verification
- Tamper-proof records

**Transparency:**
- Public audit trail
- Independently verifiable
- Real-time updates

**Smart Contract Automation:**
- Automatic payment release when conditions met
- No manual intervention needed
- Milestone-based verification

## 🎯 Demo Credentials Quick Reference

### Government
- Email: `admin@fairlens.gov`
- Password: `password123`
- Passkey: `SecureKey@2025`
- 2FA: `123456`

### Contractor
- Email: `abc@constructions.com`
- Password: `business123`
- GSTIN: `22AAAAA0000A1Z5`
- Passkey: `CompanyKey@123`
- OTP: `654321`

### Citizen (Sign In)
- Email: `citizen@fairlens.in`
- Password: `citizen123`

### Citizen (Sign Up)
- Email OTP: `111111`
- Mobile OTP: `222222`

## 🚀 Key Features Summary

**Authentication:**
- ✅ Multi-factor authentication for government & contractors
- ✅ Email, passkey, and OTP verification
- ✅ Real-time password strength indicators
- ✅ Session management and device trust
- ✅ Anonymous public access for citizens
- ✅ Registered accounts with enhanced features

**Blockchain Integration:**
- ✅ Smart contract detail viewer
- ✅ Transaction history with blockchain verification
- ✅ Milestone tracking with conditions
- ✅ Audit trail and verification logs
- ✅ Copy-to-clipboard for hashes
- ✅ Performance scoring and monitoring

**Security:**
- ✅ All logins blockchain-verified
- ✅ Immutable access logs
- ✅ Encrypted data transmission
- ✅ Role-based access control
- ✅ Digital signature support

## 📱 User Experience Highlights

**Smooth Animations:**
- Progress indicators during authentication
- Loading states with countdown timers
- Smooth modal transitions
- Success/error state feedback

**Validation:**
- Real-time email format checking
- Password strength meters
- OTP format validation
- Form field requirements

**Accessibility:**
- Show/hide password toggles
- Copy-to-clipboard buttons
- Tooltips and help text
- Keyboard navigation support

## 🔒 Privacy & Security Notes

**For Citizens:**
- Anonymous browsing option available
- Optional registration for enhanced features
- Issue reporting can be anonymous
- Data protection compliance

**For Government/Contractors:**
- Maximum security authentication
- All actions logged on blockchain
- Session timeout and re-authentication
- Suspicious activity monitoring

**Blockchain Benefits:**
- Complete transparency
- Audit trail for accountability
- Prevention of data tampering
- Independent verification capability

---

All authentication flows include proper error handling, success notifications, and blockchain verification confirmation. The system is designed for maximum security while maintaining user-friendly experience.
