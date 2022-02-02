VENV_PREFIX=poetry run

format:
	$(VENV_PREFIX) isort --fss -w 88 .
	$(VENV_PREFIX) black .

lint:
	$(VENV_PREFIX) isort --fss -w 88 --check-only .
	$(VENV_PREFIX) black . --check
	$(VENV_PREFIX) flake8 kuwala/core kuwala/common kuwala/pipelines