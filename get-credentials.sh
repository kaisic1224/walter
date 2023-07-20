#!/bin/sh
node authorize.js <<EOF
yes
sp
no
$SPOTIFY_CLIENT_ID
$SPOTIFY_CLIENT_SECRET
CA
EOF

npm start
