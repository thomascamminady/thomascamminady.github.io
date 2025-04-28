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

## `overload` functionality

Make type hints work when toggling a flag that changes the return type.

```python
from calendar import c
from typing import Literal, overload


@overload
def fit_poly(order: Literal[2]) -> tuple[float, float]: ...


@overload
def fit_poly(order: Literal[3]) -> tuple[float, float, float]: ...


def fit_poly(
    order: Literal[2, 3],
) -> tuple[float, float] | tuple[float, float, float]:
    if order == 2:
        return (1.0, 2.0)
    elif order == 3:
        return (1.0, 2.0, 3.0)
    else:
        raise ValueError("order must be 2 or 3")


if __name__ == "__main__":
    a, b = fit_poly(2)
    a, b, c = fit_poly(2)  # This lets you know that there is an error
```
