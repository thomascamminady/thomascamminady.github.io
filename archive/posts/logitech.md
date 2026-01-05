---
title: Logitech
toc: false
style: ../assets/style.css
---

<script data-goatcounter="https://drtc.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>

# Logitech MX Mechanical Mini for Mac: Issues with M1 Mac

About two month ago, I bought a Logitech MX Mechanical Mini for Mac and it worked like a charm with my previous Intel Macbook Pro (2019).
Last week I received a new work Macbook that uses the newer M1 chip (M1 Max). Since then I am experiencing issues with the connectivity of the MX Mechanical Mini.

As of now (Feb 22, 2023) I have no solution for this issue.

## What's the issue?

It's a connectivity issue, where it seems like the keyboard goes to sleep after only a couple of seconds of inactivity (smaller than ten seconds). Waking up the keyboard then takes some three to four seconds, time during which no keystrokes are recorded.
This is especially annoying for me, since I work as a developer and there are frequent periods of not typing (but thinking), followed by quick bursts of typing.

I did not notice this issue on the Intel-based Macbook which makes me wonder whether this is an issue on the hardware side of things.

## What have I tried?

I tried the usual things:

- Making sure that the battery is charged.
- Updating driver (Logi Options+)
- Disconnect the device, forget the device in bluetooth settings, and reconnect.
- Factory reset the keyboard, including the removal of all previously paired devices.
- Pairing my Mac on each of the 3 different Easy-Switch slots to see whether the slot makes a difference.

## References / Ressources

I looked for this issue and found some recent posts / threads on reddit:

- [MX mechanical sleeps](tab:https://www.reddit.com/r/logitech/comments/x7g2tb/mx_mechanical_sleeps/)
- [MX keys randomly disconnecting](tab:https://www.reddit.com/r/logitech/comments/pz3hf6/mx_keys_randomly_disconnecting/)

This website explains how to factory reset your keyboard such that all previously paired devices are forgotten:

- [Factory reset Logitech MX Keys Keyboard](tab:https://ernestojeh.com/factory-reset-mx-keys) (Note: The sequence is `esc O esc O esc B`, where `O` is the fifteenth letter of the alphabet, not the number `0`.)
