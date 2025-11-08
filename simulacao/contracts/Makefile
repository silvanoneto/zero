.PHONY: help install build test coverage deploy-testnet deploy-mainnet clean

# Colors for output
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)

help: ## Show this help message
	@echo ''
	@echo 'Usage:'
	@echo '  ${YELLOW}make${RESET} ${GREEN}<target>${RESET}'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} { \
		if (/^[a-zA-Z_-]+:.*?##.*$$/) {printf "    ${YELLOW}%-20s${GREEN}%s${RESET}\n", $$1, $$2} \
		else if (/^## .*$$/) {printf "  ${WHITE}%s${RESET}\n", substr($$1,4)} \
		}' $(MAKEFILE_LIST)

## Installation
install: ## Install dependencies (Foundry + OpenZeppelin)
	@echo "${GREEN}Installing Foundry dependencies...${RESET}"
	forge install OpenZeppelin/openzeppelin-contracts --no-commit
	forge install foundry-rs/forge-std --no-commit
	@echo "${GREEN}Dependencies installed!${RESET}"

## Build & Test
build: ## Compile contracts
	@echo "${GREEN}Building contracts...${RESET}"
	forge build

test: ## Run all tests
	@echo "${GREEN}Running tests...${RESET}"
	forge test -vvv

test-summary: ## Run tests with summary
	forge test

test-gas: ## Run tests with gas report
	@echo "${GREEN}Running gas report...${RESET}"
	forge test --gas-report

test-fuzz: ## Run fuzz tests (10k iterations)
	@echo "${GREEN}Running fuzz tests...${RESET}"
	forge test --fuzz-runs 10000

coverage: ## Generate test coverage report
	@echo "${GREEN}Generating coverage...${RESET}"
	forge coverage --report lcov
	@echo "${YELLOW}Coverage report generated at lcov.info${RESET}"

## Code Quality
format: ## Format Solidity code
	forge fmt

format-check: ## Check if code is formatted
	forge fmt --check

lint: ## Run linter
	@echo "${GREEN}Running linter...${RESET}"
	solhint 'src/**/*.sol'

## Deployment
deploy-local: ## Deploy to local Anvil node
	@echo "${GREEN}Starting local node...${RESET}"
	anvil &
	@sleep 2
	@echo "${GREEN}Deploying to local node...${RESET}"
	forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast

deploy-testnet: ## Deploy to Sepolia testnet
	@echo "${YELLOW}Deploying to Sepolia testnet...${RESET}"
	@echo "${YELLOW}Make sure you have set PRIVATE_KEY and SEPOLIA_RPC_URL in .env${RESET}"
	forge script script/Deploy.s.sol:DeployScript \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--broadcast \
		--verify

deploy-mainnet: ## Deploy to Ethereum mainnet (DANGEROUS!)
	@echo "${YELLOW}⚠️  DEPLOYING TO MAINNET ⚠️${RESET}"
	@echo "${YELLOW}Have you completed ALL security checks?${RESET}"
	@echo "${YELLOW}  - 3+ independent audits${RESET}"
	@echo "${YELLOW}  - Bug bounty active${RESET}"
	@echo "${YELLOW}  - Multi-sig ready${RESET}"
	@echo "${YELLOW}  - Testnet fully tested${RESET}"
	@read -p "Type 'DEPLOY' to continue: " confirm; \
	if [ "$$confirm" = "DEPLOY" ]; then \
		forge script script/Deploy.s.sol:DeployScript \
			--rpc-url $(MAINNET_RPC_URL) \
			--broadcast \
			--verify; \
	else \
		echo "${GREEN}Deployment cancelled.${RESET}"; \
	fi

## Verification
verify-token: ## Verify GovernanceToken on Etherscan
	forge verify-contract \
		--chain-id 11155111 \
		--compiler-version v0.8.20 \
		$(IDS_TOKEN_ADDRESS) \
		GovernanceToken

verify-voting: ## Verify FederationVoting on Etherscan
	forge verify-contract \
		--chain-id 11155111 \
		--compiler-version v0.8.20 \
		--constructor-args $(shell cast abi-encode "constructor(address)" $(IDS_TOKEN_ADDRESS)) \
		$(FEDERATION_VOTING_ADDRESS) \
		FederationVoting

## Utilities
clean: ## Clean build artifacts
	@echo "${GREEN}Cleaning build artifacts...${RESET}"
	forge clean
	rm -rf cache out broadcast

snapshot: ## Create gas snapshot
	@echo "${GREEN}Creating gas snapshot...${RESET}"
	forge snapshot

size: ## Check contract sizes
	@echo "${GREEN}Checking contract sizes...${RESET}"
	forge build --sizes

inspect: ## Inspect contract (usage: make inspect CONTRACT=FederationVoting)
	@echo "${GREEN}Inspecting $(CONTRACT)...${RESET}"
	forge inspect $(CONTRACT) abi

## Documentation
doc: ## Generate documentation
	@echo "${GREEN}Generating documentation...${RESET}"
	forge doc

doc-serve: ## Serve documentation locally
	@echo "${GREEN}Serving documentation at http://localhost:3000${RESET}"
	forge doc --serve

## Environment
setup-env: ## Create .env from .env.example
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "${GREEN}.env file created! Please edit it with your keys.${RESET}"; \
	else \
		echo "${YELLOW}.env already exists. Not overwriting.${RESET}"; \
	fi

check-env: ## Check if environment is properly configured
	@echo "${GREEN}Checking environment...${RESET}"
	@if [ -f .env ]; then \
		echo "✓ .env file exists"; \
	else \
		echo "✗ .env file missing (run 'make setup-env')"; \
	fi
	@command -v forge >/dev/null 2>&1 || { echo "✗ Foundry not installed"; exit 1; }
	@echo "✓ Foundry installed"
	@echo "${GREEN}Environment OK!${RESET}"

## CI/CD
ci: install build test coverage ## Run full CI pipeline

all: clean install build test ## Clean, install, build and test

.DEFAULT_GOAL := help
