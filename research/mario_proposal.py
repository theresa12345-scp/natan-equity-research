#!/usr/bin/env python3
"""
Mario-Style Marriage Proposal ASCII Art
Run this in your terminal for a cool retro proposal visualization!
"""

import time
import os
import sys

# ANSI Color Codes
class Colors:
    RESET = '\033[0m'
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    BG_RED = '\033[41m'
    BG_YELLOW = '\033[43m'

def clear_screen():
    """Clear the terminal screen"""
    os.system('clear' if os.name != 'nt' else 'cls')

def print_with_delay(text, delay=0.05):
    """Print text with a typing effect"""
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    print()

def draw_hearts():
    """Draw floating hearts"""
    hearts = f"""
    {Colors.RED}  ♥     ♥       ♥        ♥     ♥
      ♥       ♥    ♥    ♥         ♥
    ♥    ♥        ♥          ♥       ♥{Colors.RESET}
    """
    print(hearts)

def draw_boy():
    """Draw the boy character (Mario-style)"""
    boy = f"""
    {Colors.BLUE}    ▄▄▄▄▄
       ███████
      █{Colors.YELLOW}●{Colors.BLUE}█{Colors.YELLOW}●{Colors.BLUE}███     {Colors.WHITE}(Me){Colors.BLUE}
       █{Colors.RESET}▼{Colors.BLUE}█████
       ███████
        █████
    {Colors.RED}   ▄██{Colors.YELLOW}[💍]{Colors.RED}██▄
      ███████{Colors.BLUE}
       ██ ██
      ██  ██{Colors.RESET}
    """
    return boy

def draw_girl():
    """Draw the girl character"""
    girl = f"""
    {Colors.MAGENTA}    ▄▄▄▄▄
      ████░████     {Colors.WHITE}(You){Colors.MAGENTA}
     ██{Colors.YELLOW}●{Colors.MAGENTA}██{Colors.YELLOW}●{Colors.MAGENTA}██
      ██{Colors.RESET}▽{Colors.MAGENTA}████
      ███████
    {Colors.YELLOW}   ▄███████▄{Colors.MAGENTA}
      ███████
       ██ ██
      ██  ██{Colors.RESET}
    """
    return girl

def draw_scene():
    """Draw the complete proposal scene"""
    scene = f"""
    {Colors.CYAN}╔════════════════════════════════════════════════════╗
    ║        SUPER MARIO PROPOSAL ADVENTURE!         ║
    ╚════════════════════════════════════════════════════╝{Colors.RESET}
    """
    print(scene)

    # Draw hearts
    draw_hearts()

    # Draw characters side by side
    boy_lines = draw_boy().split('\n')
    girl_lines = draw_girl().split('\n')

    max_lines = max(len(boy_lines), len(girl_lines))

    for i in range(max_lines):
        boy_line = boy_lines[i] if i < len(boy_lines) else ""
        girl_line = girl_lines[i] if i < len(girl_lines) else ""
        print(f"        {boy_line}            {girl_line}")

    # Ground
    print(f"\n    {Colors.GREEN}{'═' * 50}{Colors.RESET}")

def draw_ring():
    """Draw a fancy ring"""
    ring = f"""
    {Colors.YELLOW}            ✧･ﾟ: *✧･ﾟ:* 💍 *:･ﾟ✧*:･ﾟ✧

            {Colors.CYAN}╔═══════════════════════════╗
            ║  {Colors.YELLOW}◆ THE RING OF LOVE ◆{Colors.CYAN}  ║
            ╚═══════════════════════════╝{Colors.RESET}
    """
    print(ring)

def show_message():
    """Show the proposal message"""
    message = f"""
    {Colors.BOLD}{Colors.RED}
    ╔════════════════════════════════════════════════════╗
    ║                                                    ║
    ║           WILL YOU MARRY ME?                      ║
    ║                                                    ║
    ║      Press 1-1 to Start Our Adventure! 🍄         ║
    ║                                                    ║
    ╚════════════════════════════════════════════════════╝
    {Colors.RESET}
    """
    print(message)

def animate_coin():
    """Animate a coin flip"""
    coins = [
        f"{Colors.YELLOW}[●]{Colors.RESET}",
        f"{Colors.YELLOW}[◐]{Colors.RESET}",
        f"{Colors.YELLOW}[○]{Colors.RESET}",
        f"{Colors.YELLOW}[◑]{Colors.RESET}",
    ]

    print("\n    Collecting coins of love... ", end="")
    for _ in range(10):
        for coin in coins:
            print(f"\b\b\b{coin}", end="", flush=True)
            time.sleep(0.1)
    print(" Done! 💰")

def play_proposal():
    """Main proposal sequence"""
    clear_screen()

    # Title screen
    print(f"\n{Colors.BOLD}{Colors.RED}")
    print("    ╔════════════════════════════════════════════════════╗")
    print("    ║                                                    ║")
    print("    ║          🍄 SUPER PROPOSAL BROS 🍄                ║")
    print("    ║                                                    ║")
    print("    ╚════════════════════════════════════════════════════╝")
    print(f"{Colors.RESET}\n")
    time.sleep(2)

    # Loading animation
    print_with_delay("    Loading your love story...", 0.1)
    animate_coin()
    time.sleep(1)

    clear_screen()

    # Main scene
    draw_scene()
    time.sleep(2)

    # Ring reveal
    print("\n")
    draw_ring()
    time.sleep(2)

    # Message
    show_message()

    # Final hearts
    print(f"\n{Colors.RED}")
    print("    " + "💕 " * 25)
    print(f"{Colors.RESET}\n")

    # Mario-style message
    print(f"    {Colors.GREEN}🎮 Game Over? Nope! Our Adventure Just Begins! 🎮{Colors.RESET}\n")

if __name__ == "__main__":
    try:
        play_proposal()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.RED}Don't press B to cancel! Try again! 😄{Colors.RESET}\n")
