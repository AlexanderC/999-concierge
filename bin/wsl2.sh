#!/bin/bash

SCRIPT_DIR=$(cd `dirname "$0"` && pwd)
EXEC_DIR="/mnt/c/Program Files/VcXsrv"

if [ -z $WSLENV ]; then
  echo "Environment is not WSL! Skipping..."
  exit 0
fi

powershell.exe -C "Stop-Process -Name vcxsrv -EA SilentlyContinue"
"$EXEC_DIR/xlaunch.exe" -run "$SCRIPT_DIR/config.xlaunch"
export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2; exit;}'):0.0
HOST=$(ip address show dev eth0 | awk -F '[ /]+' '/inet / { print $3 }')
WSLENV="$WSLENV:DISPLAY" "$EXEC_DIR/xhost.exe" "$HOST" >/dev/null