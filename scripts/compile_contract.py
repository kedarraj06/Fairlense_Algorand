#!/usr/bin/env python3
"""
Compile PyTeal smart contract to TEAL
"""

import sys
import os

# Add the contracts directory to the path
contracts_dir = os.path.join(os.path.dirname(__file__), '..', 'contracts')
sys.path.append(contracts_dir)

try:
    # Import the fairlens_app module
    import fairlens_app
    from pyteal import compileTeal, Mode
except ImportError as e:
    print(f"Error importing PyTeal: {e}")
    print("Please install PyTeal with: pip install pyteal")
    sys.exit(1)

def main():
    try:
        # Compile approval program
        approval_teal = compileTeal(fairlens_app.approval_program(), Mode.Application, version=6)
        
        # Compile clear state program
        clear_teal = compileTeal(fairlens_app.clear_state_program(), Mode.Application, version=6)
        
        # Write to files
        backend_contracts_dir = os.path.join(os.path.dirname(__file__), '..', 'backend', 'contracts')
        os.makedirs(backend_contracts_dir, exist_ok=True)
        
        with open(os.path.join(backend_contracts_dir, 'fairlens_approval.teal'), 'w') as f:
            f.write(approval_teal)
            
        with open(os.path.join(backend_contracts_dir, 'fairlens_clear.teal'), 'w') as f:
            f.write(clear_teal)
            
        print("✅ Smart contracts compiled successfully!")
        print(f"   Approval program: {os.path.join(backend_contracts_dir, 'fairlens_approval.teal')}")
        print(f"   Clear state program: {os.path.join(backend_contracts_dir, 'fairlens_clear.teal')}")
        
    except Exception as e:
        print(f"❌ Error compiling contracts: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()