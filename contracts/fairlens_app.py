# fairlens_app.py
# Production-ready PyTeal smart contract for FairLens
# Features: Ed25519 verification, inner transactions, milestone management
# Requires: pyteal >= 0.14+, Target AVM/TEAL version: 6
# Install: pip install pyteal

from pyteal import *

# ---------------------------
# Global state keys
# ---------------------------
OWNER_KEY = Bytes("owner")           # owner/government address (bytes)
CONTRACTOR_KEY = Bytes("contractor") # contractor address (bytes)
VERIFIER_KEY = Bytes("verifier_pk")  # ed25519 public key (32 bytes) of trusted verifier
TOTAL_MS = Bytes("total_ms")         # total milestones (uint64)
CUR_MS = Bytes("cur_ms")             # current milestone index (uint64)
ESCROW_BALANCE = Bytes("escrow")     # total escrow balance (uint64)

# Milestone storage keys: "m{index}_amt", "m{index}_hash", "m{index}_due"
def ms_amt_key(i: Expr) -> Expr:
    return Concat(Bytes("m"), Itob(i), Bytes("_amt"))

def ms_hash_key(i: Expr) -> Expr:
    return Concat(Bytes("m"), Itob(i), Bytes("_hash"))

def ms_due_key(i: Expr) -> Expr:
    return Concat(Bytes("m"), Itob(i), Bytes("_due"))

# ---------------------------
# Approval program
# ---------------------------
def approval_program():
    
    # --- On creation: args -> [owner_addr(bytes), contractor_addr(bytes), verifier_pubkey(bytes32)]
    on_creation = Seq([
        Assert(Txn.application_args.length() == Int(3)),
        App.globalPut(OWNER_KEY, Txn.application_args[0]),
        App.globalPut(CONTRACTOR_KEY, Txn.application_args[1]),
        App.globalPut(VERIFIER_KEY, Txn.application_args[2]),  # 32-byte ed25519 pubkey
        App.globalPut(TOTAL_MS, Int(0)),
        App.globalPut(CUR_MS, Int(0)),
        App.globalPut(ESCROW_BALANCE, Int(0)),
        Approve()
    ])

    # --- Admin: add milestone
    # Args: ["add_ms", index(uint64), amount(uint64 in microAlgos), due_ts(uint64), ipfs_hash(bytes)]
    add_ms = Seq([
        # Only owner can add milestones
        Assert(Txn.sender() == App.globalGet(OWNER_KEY)),
        Assert(Txn.application_args.length() == Int(5)),
        
        # Extract milestone data
        App.globalPut(ms_amt_key(Btoi(Txn.application_args[1])), Btoi(Txn.application_args[2])),
        App.globalPut(ms_due_key(Btoi(Txn.application_args[1])), Btoi(Txn.application_args[3])),
        App.globalPut(ms_hash_key(Btoi(Txn.application_args[1])), Txn.application_args[4]),
        
        # Update total milestones if needed
        If(Btoi(Txn.application_args[1]) >= App.globalGet(TOTAL_MS)).Then(
            App.globalPut(TOTAL_MS, Btoi(Txn.application_args[1]) + Int(1))
        ),
        
        # Update escrow balance
        App.globalPut(ESCROW_BALANCE, App.globalGet(ESCROW_BALANCE) + Btoi(Txn.application_args[2])),
        
        Approve()
    ])

    # --- Contractor: submit proof hash
    # Args: ["submit_proof", index, proof_ipfs_hash_or_blob]
    submit_proof = Seq([
        Assert(Txn.sender() == App.globalGet(CONTRACTOR_KEY)),
        Assert(Txn.application_args.length() == Int(3)),
        
        # Must submit for the current milestone
        Assert(Btoi(Txn.application_args[1]) == App.globalGet(CUR_MS)),
        
        App.globalPut(Concat(Bytes("proof_"), Itob(Btoi(Txn.application_args[1]))), Txn.application_args[2]),
        
        Approve()
    ])

    # --- Verify & Release: verifies Ed25519 attestation and pays contractor via inner transaction
    # Args: ["verify_release", index, attestation_message_bytes, signature_bytes]
    verify_release = Seq([
        Assert(Txn.application_args.length() == Int(4)),
        
        Assert(Btoi(Txn.application_args[1]) == App.globalGet(CUR_MS)),
        
        # Get milestone amount
        App.globalPut(Bytes("temp_amt"), App.globalGet(ms_amt_key(Btoi(Txn.application_args[1])))),
        
        # Ensure proof exists
        App.globalPut(Bytes("proof_value"), App.globalGet(Concat(Bytes("proof_"), Itob(Btoi(Txn.application_args[1]))))),
        Assert(App.globalGet(Bytes("proof_value")) != Bytes("")),
        
        # Verify Ed25519 signature
        Assert(Ed25519Verify(Txn.application_args[2], Txn.application_args[3], App.globalGet(VERIFIER_KEY))),
        
        # Create inner payment transaction
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: App.globalGet(CONTRACTOR_KEY),
            TxnField.amount: App.globalGet(Bytes("temp_amt")),
        }),
        InnerTxnBuilder.Submit(),
        
        # Update state
        App.globalPut(CUR_MS, App.globalGet(CUR_MS) + Int(1)),
        App.globalPut(ESCROW_BALANCE, App.globalGet(ESCROW_BALANCE) - App.globalGet(Bytes("temp_amt"))),
        
        # Clear temporary variables
        App.globalDel(Bytes("temp_amt")),
        App.globalDel(Bytes("proof_value")),
        
        Approve()
    ])

    # --- Admin: change verifier pubkey
    # Args: ["set_verifier", verifier_pubkey_bytes32]
    set_verifier = Seq([
        Assert(Txn.sender() == App.globalGet(OWNER_KEY)),
        Assert(Txn.application_args.length() == Int(2)),
        App.globalPut(VERIFIER_KEY, Txn.application_args[1]),
        Approve()
    ])

    # --- Admin: change contractor
    # Args: ["set_contractor", contractor_addr_bytes]
    set_contractor = Seq([
        Assert(Txn.sender() == App.globalGet(OWNER_KEY)),
        Assert(Txn.application_args.length() == Int(2)),
        App.globalPut(CONTRACTOR_KEY, Txn.application_args[1]),
        Approve()
    ])

    # --- Admin: fund escrow (owner can add funds to app account)
    # Args: ["fund_escrow"]
    fund_escrow = Seq([
        Assert(Txn.sender() == App.globalGet(OWNER_KEY)),
        Assert(Txn.application_args.length() == Int(1)),
        Approve()
    ])

    # --- Get contract state (read-only)
    # Args: ["get_state"]
    get_state = Seq([
        Approve()
    ])

    # --- Application dispatcher
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == App.globalGet(OWNER_KEY))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == App.globalGet(OWNER_KEY))],
        [Txn.on_completion() == OnComplete.CloseOut, Reject()],
        [Txn.on_completion() == OnComplete.OptIn, Reject()],
        [Txn.application_args[0] == Bytes("add_ms"), add_ms],
        [Txn.application_args[0] == Bytes("submit_proof"), submit_proof],
        [Txn.application_args[0] == Bytes("verify_release"), verify_release],
        [Txn.application_args[0] == Bytes("set_verifier"), set_verifier],
        [Txn.application_args[0] == Bytes("set_contractor"), set_contractor],
        [Txn.application_args[0] == Bytes("fund_escrow"), fund_escrow],
        [Txn.application_args[0] == Bytes("get_state"), get_state],
    )

    return program

def clear_state_program():
    return Approve()

if __name__ == "__main__":
    # Compile to TEAL
    approval_teal = compileTeal(approval_program(), Mode.Application, version=6)
    clear_teal = compileTeal(clear_state_program(), Mode.Application, version=6)
    
    print("=== APPROVAL PROGRAM ===")
    print(approval_teal)
    print("\n=== CLEAR STATE PROGRAM ===")
    print(clear_teal)