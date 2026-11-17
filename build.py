#!/usr/bin/env python3

import re
import shutil
from pathlib import Path

root_dir = Path(__file__).resolve().parent
output_dir = root_dir / "docs"
components = root_dir / "components"

try:
    shutil.rmtree(output_dir)
except FileNotFoundError:
    pass

output_dir.mkdir()


def get_component_text(tag):
    name = tag.removeprefix("<").removesuffix(">")
    return (components / f"{name}.html").read_text()


excluded_files = {
    "docs",
    "components",
    ".git",
    ".nvim.lua",
    ".ruff_cache",
    "build.py",
    "AGENTS.md",
    ".gitignore",
    "Session.vim",
}

for file_or_dir in root_dir.rglob("*"):
    relative_path = file_or_dir.relative_to(root_dir)

    if not file_or_dir.is_file():
        continue
    if any(part in excluded_files for part in relative_path.parts):
        continue

    destination = output_dir / relative_path
    destination.parent.mkdir(parents=True, exist_ok=True)

    if file_or_dir.suffix != ".html":
        shutil.copy2(file_or_dir, destination)
        continue

    # process html
    html = file_or_dir.read_text()
    tags = set(re.findall(r"<CUSTOM_[A-Z_]+>", html))

    for tag in tags:
        html = html.replace(tag, get_component_text(tag))

    destination.write_text(html)
