.PHONY: help test backend-test frontend-build validate compose-config clean

PYTHON_BIN := $(if $(wildcard .venv310/bin/python3),.venv310/bin/python3,$(if $(wildcard .venv-local/bin/python3),.venv-local/bin/python3,python3))
NPM_BIN ?= npm

help:
	@printf "Available targets:\n"
	@printf "  test            Run backend and shared Python tests\n"
	@printf "  backend-test    Alias for test\n"
	@printf "  frontend-build  Build the frontend production bundle\n"
	@printf "  compose-config  Validate docker compose files\n"
	@printf "  validate        Run the standard local verification suite\n"
	@printf "  clean           Remove common local caches and build artifacts\n"

test:
	PYTHONPATH=backend:. $(PYTHON_BIN) -m pytest backend/tests tests

backend-test: test

frontend-build:
	cd frontend && $(NPM_BIN) run build

compose-config:
	docker compose -f docker-compose.yml config
	docker compose -f docker-compose.prod.yml config

validate: test frontend-build

clean:
	./scripts/clean_local.sh
