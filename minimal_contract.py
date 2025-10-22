from pyteal import *

def minimal_approval():
    # Minimal contract with no arguments
    program = Seq([
        Approve()
    ])
    return program

def minimal_clear():
    return Approve()

if __name__ == "__main__":
    # Compile to TEAL
    approval_teal = compileTeal(minimal_approval(), Mode.Application, version=6)
    clear_teal = compileTeal(minimal_clear(), Mode.Application, version=6)
    
    print("=== APPROVAL PROGRAM ===")
    print(approval_teal)
    print("\n=== CLEAR STATE PROGRAM ===")
    print(clear_teal)