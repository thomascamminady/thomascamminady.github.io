---
layout: page
title: Python Snippets
permalink: /python/
sidebar: false
toc: false
style: assets/style.css
---

<script data-goatcounter="https://drtc.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>

# Python Snippets

A collection of useful `python` snippets.

## `uv` script template

Run a `python` file with dependencies using `uv`.

```python
#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.13"
# dependencies = [
#   "fire",
# ]
# ///
# pyright: reportMissingModuleSource=false
# pyright: reportMissingImports=false


import fire


def main(name: str) -> None:
    """Greet the user.

    Run this script with the command:
        `uv run script.py --name="You"`
    Or:
        `chmod +x script.py`
        `./script.py --name="You"`
    """
    print(f"Hello {name}!")


if __name__ == "__main__":
    fire.Fire(main)

```
