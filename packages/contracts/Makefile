# =============================================================================
# UniPass Contracts Makefile
# =============================================================================

-include .env

.PHONY: all build test clean deploy deploy-local install fmt

# Default target
all: clean install build test

# Install dependencies
install:
	forge install foundry-rs/forge-std --no-commit
	forge install semaphore-protocol/semaphore --no-commit
	forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Build contracts
build:
	forge build

# Run tests
test:
	forge test -vvv

# Run tests with gas report
test-gas:
	forge test -vvv --gas-report

# Format code
fmt:
	forge fmt

# Clean build artifacts
clean:
	forge clean

# =============================================================================
# Deployment Commands
# =============================================================================

# Deploy to local Anvil node (with mock contracts)
deploy-local:
	forge script script/Deploy.s.sol:DeployMockScript \
		--rpc-url localhost \
		--broadcast \
		-vvvv

# Deploy to Sepolia testnet
deploy-sepolia:
	@echo "Deploying to Sepolia..."
	@echo "Make sure SEMAPHORE_ADDRESS and ZKPASSPORT_VERIFIER_ADDRESS are set in .env"
	forge script script/Deploy.s.sol:DeployScript \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--broadcast \
		--verify \
		-vvvv

# Deploy to Mainnet
deploy-mainnet:
	@echo "Deploying to Mainnet..."
	@echo "Make sure SEMAPHORE_ADDRESS and ZKPASSPORT_VERIFIER_ADDRESS are set in .env"
	forge script script/Deploy.s.sol:DeployScript \
		--rpc-url $(MAINNET_RPC_URL) \
		--broadcast \
		--verify \
		-vvvv

# =============================================================================
# Development Helpers
# =============================================================================

# Start local Anvil node
anvil:
	anvil

# Generate ABI files
abi:
	forge inspect UniPassRegistry abi > out/UniPassRegistry.abi.json
	@echo "ABI exported to out/UniPassRegistry.abi.json"

# Run coverage
coverage:
	forge coverage

# Run slither static analysis (requires slither-analyzer)
slither:
	slither src/

# =============================================================================
# Help
# =============================================================================

help:
	@echo "UniPass Contracts - Available Commands:"
	@echo ""
	@echo "  make install      - Install Foundry dependencies"
	@echo "  make build        - Build contracts"
	@echo "  make test         - Run tests"
	@echo "  make test-gas     - Run tests with gas report"
	@echo "  make fmt          - Format Solidity code"
	@echo "  make clean        - Clean build artifacts"
	@echo ""
	@echo "  make anvil        - Start local Anvil node"
	@echo "  make deploy-local - Deploy mock contracts to Anvil"
	@echo "  make deploy-sepolia - Deploy to Sepolia testnet"
	@echo "  make deploy-mainnet - Deploy to Ethereum mainnet"
	@echo ""
	@echo "  make abi          - Export contract ABI"
	@echo "  make coverage     - Run test coverage"
	@echo "  make slither      - Run Slither static analysis"

