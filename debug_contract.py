from contracts.fairlens_app import approval_program
from pyteal import compileTeal, Mode

# Compile the contract
approval_teal = compileTeal(approval_program(), Mode.Application, version=6)

# Print the beginning of the TEAL code to see the creation part
lines = approval_teal.split('\n')
for i, line in enumerate(lines):
    if 'main_l26:' in line:
        print("Found creation block:")
        for j in range(i, min(i+20, len(lines))):
            print(f"{j}: {lines[j]}")
        break