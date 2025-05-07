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
from typing import Literal, overload


@overload
def fit_poly(order: Literal[2]) -> tuple[float, float]: ...


@overload
def fit_poly(order: Literal[3]) -> tuple[float, float, float]: ...


def fit_poly(order: Literal[2, 3]) -> tuple[float, float] | tuple[float, float, float]:
    if order == 2:
        return (1.0, 2.0)
    elif order == 3:
        return (1.0, 2.0, 3.0)
    else:
        raise ValueError("order must be 2 or 3")


if __name__ == "__main__":
    a, b = fit_poly(2) # works
    a, b, c = fit_poly(3) # works
    a, b, c = fit_poly(2)  # won't work
```

## Interactive `matplotlib` animation in notebooks

```python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider

%matplotlib widget
plt.ion()


def f(params, x):
    a, b, c, d, e = params[0], params[1], params[2], params[3], params[4]
    return a / (1 + np.exp(b * (x + c)) + d + e * x)


params0 = np.array([5, -3.0, -4.0, 1.0, 1.0])
params1 = np.array([4, -2.0, -7.0, 2.0, 2.0])
x = np.linspace(0, 10, 100)
y0 = f(params0, x)
y1 = f(params1, x)

fig, ax = plt.subplots()
alpha_slider = Slider(
    ax=plt.axes([0.2, 0.01, 0.65, 0.03]),
    label="alpha",
    valmin=0,
    valmax=1,
    valinit=0.5,
    valstep=0.01,
)
ax.plot(x, y0, label="params0")
ax.plot(x, y1, label="params1")


def update(val):
    alpha = alpha_slider.val
    ax.clear()
    ax.plot(x, y0, label="params0")
    ax.plot(x, y1, label="params1")
    ax.plot(x, alpha * y0 + (1 - alpha) * y1, label="interp function")
    ax.plot(x, f(alpha * params0 + (1 - alpha) * params1, x), label="interp params")
    ax.set_xlabel("x")
    ax.set_ylabel("f(x)")
    ax.grid()
    ax.legend()
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 1)


alpha_slider.on_changed(update)

```
