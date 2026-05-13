#!/bin/bash
cd "$(dirname "$0")"
nohup python3 proxy.py > proxy.log 2>&1 &
echo $! > proxy.pid
echo "Proxy started, PID: $(cat proxy.pid)"
