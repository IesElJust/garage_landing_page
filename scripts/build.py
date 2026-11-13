#!/usr/bin/env python3
"""Build the Markdown sources with Zensical."""
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
command = shutil.which("zensical")
if command is None:
    sys.exit("Zensical is required. Install requirements.txt and activate the environment.")
subprocess.run([command, "build", "--strict"], cwd=root, check=True)
