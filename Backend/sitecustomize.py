import os


# Watchfiles can fail on locked-down Windows environments unless it falls back
# to polling instead of using native notifications.
os.environ.setdefault("WATCHFILES_FORCE_POLLING", "true")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
