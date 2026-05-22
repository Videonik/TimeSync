import subprocess
import sys

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running {cmd}:\n{result.stderr}")
        sys.exit(1)
    return result.stdout.strip()

run_cmd("git config --global user.email 'jules@example.com'")
run_cmd("git config --global user.name 'Jules'")
run_cmd("git add .")
run_cmd("git commit -m 'Fix event creation foreign key constraint and token parsing'")
run_cmd("git push new_origin HEAD:main")
print("Pushed directly to main.")
