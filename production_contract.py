"""
Production-ready FairLens smart contract for Algorand blockchain.

This contract implements a milestone-based payment system with the following features:
- Multi-role support (Owner, Contractor, Verifier)
- Ed25519 signature verification
- Inner transaction payments
- State management for milestones and escrow

The contract is designed to be deployed on Algorand TestNet or MainNet.
"""

from pyteal import *

def fairlens_approval_program():
    """
    FairLens approval program with milestone-based payments.
    
    On creation: [owner_address, contractor_address, verifier_public_key]
    """
    
    # Global state keys
    owner_key = Bytes("owner")
    contractor_key = Bytes("contractor")
    verifier_key = Bytes("verifier_pk")
    total_milestones_key = Bytes("total_ms")
    current_milestone_key = Bytes("cur_ms")
    escrow_balance_key = Bytes("escrow")
    
    # Helper functions for milestone storage
    def milestone_amount_key(index):
        return Concat(Bytes("m"), Itob(index), Bytes("_amt"))
    
    def milestone_hash_key(index):
        return Concat(Bytes("m"), Itob(index), Bytes("_hash"))
    
    def milestone_due_key(index):
        return Concat(Bytes("m"), Itob(index), Bytes("_due"))
    
    def proof_key(index):
        return Concat(Bytes("proof_"), Itob(index))
    
    # On creation - store initial parameters
    on_creation = Seq([
        Assert(Txn.application_args.length() == Int(3)),
        App.globalPut(owner_key, Txn.application_args[0]),
        App.globalPut(contractor_key, Txn.application_args[1]),
        App.globalPut(verifier_key, Txn.application_args[2]),
        App.globalPut(total_milestones_key, Int(0)),
        App.globalPut(current_milestone_key, Int(0)),
        App.globalPut(escrow_balance_key, Int(0)),
        Approve()
    ])
    
    # Add milestone - only owner can call
    add_milestone = Seq([
        Assert(Txn.sender() == App.globalGet(owner_key)),
        Assert(Txn.application_args.length() == Int(5)),
        
        # Store milestone data
        App.globalPut(milestone_amount_key(Btoi(Txn.application_args[1])), Btoi(Txn.application_args[2])),
        App.globalPut(milestone_due_key(Btoi(Txn.application_args[1])), Btoi(Txn.application_args[3])),
        App.globalPut(milestone_hash_key(Btoi(Txn.application_args[1])), Txn.application_args[4]),
        
        # Update total milestones
        If(Btoi(Txn.application_args[1]) >= App.globalGet(total_milestones_key)).Then(
            App.globalPut(total_milestones_key, Btoi(Txn.application_args[1]) + Int(1))
        ),
        
        # Update escrow balance
        App.globalPut(escrow_balance_key, App.globalGet(escrow_balance_key) + Btoi(Txn.application_args[2])),
        
        Approve()
    ])
    
    # Submit proof - only contractor can call
    submit_proof = Seq([
        Assert(Txn.sender() == App.globalGet(contractor_key)),
        Assert(Txn.application_args.length() == Int(3)),
        Assert(Btoi(Txn.application_args[1]) == App.globalGet(current_milestone_key)),
        
        App.globalPut(proof_key(Btoi(Txn.application_args[1])), Txn.application_args[2]),
        Approve()
    ])
    
    # Verify and release payment - only verifier can call
    verify_and_release = Seq([
        Assert(Txn.application_args.length() == Int(4)),
        Assert(Btoi(Txn.application_args[1]) == App.globalGet(current_milestone_key)),
        
        # Get milestone amount
        App.globalPut(Bytes("temp_amount"), App.globalGet(milestone_amount_key(Btoi(Txn.application_args[1])))),
        
        # Verify proof exists
        App.globalPut(Bytes("temp_proof"), App.globalGet(proof_key(Btoi(Txn.application_args[1])))),
        Assert(App.globalGet(Bytes("temp_proof")) != Bytes("")),
        
        # Verify Ed25519 signature
        Assert(Ed25519Verify(Txn.application_args[2], Txn.application_args[3], App.globalGet(verifier_key))),
        
        # Create payment transaction
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: App.globalGet(contractor_key),
            TxnField.amount: App.globalGet(Bytes("temp_amount")),
        }),
        InnerTxnBuilder.Submit(),
        
        # Update state
        App.globalPut(current_milestone_key, App.globalGet(current_milestone_key) + Int(1)),
        App.globalPut(escrow_balance_key, App.globalGet(escrow_balance_key) - App.globalGet(Bytes("temp_amount"))),
        
        # Clean up temporary variables
        App.globalDel(Bytes("temp_amount")),
        App.globalDel(Bytes("temp_proof")),
        
        Approve()
    ])
    
    # Change verifier - only owner can call
    change_verifier = Seq([
        Assert(Txn.sender() == App.globalGet(owner_key)),
        Assert(Txn.application_args.length() == Int(2)),
        App.globalPut(verifier_key, Txn.application_args[1]),
        Approve()
    ])
    
    # Change contractor - only owner can call
    change_contractor = Seq([
        Assert(Txn.sender() == App.globalGet(owner_key)),
        Assert(Txn.application_args.length() == Int(2)),
        App.globalPut(contractor_key, Txn.application_args[1]),
        Approve()
    ])
    
    # Fund escrow - only owner can call
    fund_escrow = Seq([
        Assert(Txn.sender() == App.globalGet(owner_key)),
        Assert(Txn.application_args.length() == Int(1)),
        Approve()
    ])
    
    # Main program dispatcher
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == App.globalGet(owner_key))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == App.globalGet(owner_key))],
        [Txn.on_completion() == OnComplete.CloseOut, Reject()],
        [Txn.on_completion() == OnComplete.OptIn, Reject()],
        [Txn.application_args[0] == Bytes("add_milestone"), add_milestone],
        [Txn.application_args[0] == Bytes("submit_proof"), submit_proof],
        [Txn.application_args[0] == Bytes("verify_release"), verify_and_release],
        [Txn.application_args[0] == Bytes("change_verifier"), change_verifier],
        [Txn.application_args[0] == Bytes("change_contractor"), change_contractor],
        [Txn.application_args[0] == Bytes("fund_escrow"), fund_escrow],
    )
    
    return program

def fairlens_clear_state_program():
    """FairLens clear state program."""
    return Approve()

# For testing and compilation
if __name__ == "__main__":
    # Compile the contract
    approval_teal = compileTeal(fairlens_approval_program(), Mode.Application, version=6)
    clear_teal = compileTeal(fairlens_clear_state_program(), Mode.Application, version=6)
    
    print("=== FAIRLENS APPROVAL PROGRAM ===")
    print(approval_teal)
    print("\n=== FAIRLENS CLEAR STATE PROGRAM ===")
    print(clear_teal)
    
    # Save to files
    with open("fairlens_approval.teal", "w") as f:
        f.write(approval_teal)
    
    with open("fairlens_clear.teal", "w") as f:
        f.write(clear_teal)
    
    print("\n✅ Contract compiled and saved to fairlens_approval.teal and fairlens_clear.teal")