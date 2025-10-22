# tests/run_all_tests.py
# Test runner for all FairLens tests

import unittest
import sys
import os
import subprocess
import time

def run_contract_tests():
    """Run smart contract unit tests."""
    print("🧪 Running smart contract unit tests...")
    try:
        result = subprocess.run([
            sys.executable, '-m', 'pytest', 
            'tests/test_contract_unit.py', 
            '-v', '--tb=short'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Smart contract tests passed")
            return True
        else:
            print(f"❌ Smart contract tests failed:\n{result.stdout}\n{result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error running smart contract tests: {e}")
        return False

def run_backend_tests():
    """Run backend API tests."""
    print("🧪 Running backend API tests...")
    try:
        result = subprocess.run([
            sys.executable, '-m', 'pytest', 
            'tests/test_backend_api.py', 
            '-v', '--tb=short'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Backend API tests passed")
            return True
        else:
            print(f"❌ Backend API tests failed:\n{result.stdout}\n{result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error running backend API tests: {e}")
        return False

def run_frontend_tests():
    """Run frontend tests."""
    print("🧪 Running frontend tests...")
    try:
        # Change to frontend directory
        os.chdir('frontend')
        
        # Install dependencies if needed
        subprocess.run(['npm', 'install'], check=True)
        
        # Run tests
        result = subprocess.run([
            'npm', 'test', '--', '--watchAll=false', '--verbose'
        ], capture_output=True, text=True)
        
        # Change back to root directory
        os.chdir('..')
        
        if result.returncode == 0:
            print("✅ Frontend tests passed")
            return True
        else:
            print(f"❌ Frontend tests failed:\n{result.stdout}\n{result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error running frontend tests: {e}")
        # Change back to root directory in case of error
        os.chdir('..')
        return False

def run_integration_tests():
    """Run integration tests."""
    print("🧪 Running integration tests...")
    try:
        result = subprocess.run([
            sys.executable, 'scripts/test_contract.py'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Integration tests passed")
            return True
        else:
            print(f"❌ Integration tests failed:\n{result.stdout}\n{result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error running integration tests: {e}")
        return False

def run_security_tests():
    """Run security tests."""
    print("🧪 Running security tests...")
    try:
        # Install security tools
        subprocess.run([
            sys.executable, '-m', 'pip', 'install', 
            'bandit', 'safety'
        ], check=True)
        
        # Run Bandit
        print("  Running Bandit security scan...")
        result = subprocess.run([
            'bandit', '-r', 'backend/', '-f', 'json'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("  ✅ Bandit security scan passed")
        else:
            print(f"  ⚠️  Bandit found issues:\n{result.stdout}")
        
        # Run Safety
        print("  Running Safety dependency scan...")
        result = subprocess.run([
            'safety', 'check', '--json'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("  ✅ Safety dependency scan passed")
        else:
            print(f"  ⚠️  Safety found issues:\n{result.stdout}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error running security tests: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 FairLens Test Suite")
    print("=" * 50)
    
    test_results = []
    
    # Run all test suites
    test_results.append(("Smart Contract", run_contract_tests()))
    test_results.append(("Backend API", run_backend_tests()))
    test_results.append(("Frontend", run_frontend_tests()))
    test_results.append(("Integration", run_integration_tests()))
    test_results.append(("Security", run_security_tests()))
    
    # Print summary
    print("\n📊 Test Results Summary")
    print("=" * 50)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:20} {status}")
        
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {passed + failed} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {failed} test suite(s) failed")
        return 1

if __name__ == '__main__':
    sys.exit(main())
