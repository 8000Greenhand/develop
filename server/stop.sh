#!/bin/bash
cd "$(dirname "$0")"
kill $(cat proxy.pid) 2>/dev/null
echo "Proxy stopped"
