# Contributing

Thanks for contributing to SEER-AI++.

## Development Principles

- Keep changes small, reviewable, and focused on one concern.
- Prefer readable code and explicit naming over clever shortcuts.
- Preserve the app's degraded-mode behavior when optional AI services are unavailable.
- Update tests and docs alongside behavior changes.

## Local Setup

For the fastest backend path:

```bash
python3 -m venv .venv-local
.venv-local/bin/pip install -r backend/requirements-local.txt
cp backend/.env.local.example backend/.env
make test
```

For the full stack:

```bash
python3.10 -m venv .venv310
.venv310/bin/pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Common Commands

Use the project `Makefile` for the most common checks:

```bash
make test
make frontend-build
make validate
```

## Pull Request Checklist

- Confirm backend tests pass.
- Confirm the frontend production build completes.
- Document new environment variables, scripts, or operational steps.
- Avoid committing generated outputs, local databases, or secret-bearing `.env` files.

## Style Notes

- Python uses 4-space indentation.
- Frontend files use 2-space indentation.
- Keep comments concise and only where they add context.
- Favor small service/controller changes over broad cross-cutting rewrites unless the refactor is the task.
