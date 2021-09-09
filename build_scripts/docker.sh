#! /bin/bash

echo "Logging in to gitlab docker registry..."
podman login registry.gitlab.app.whenderson.net
podman build -t registry.gitlab.app.whenderson.net/wah/youtify .
podman push registry.gitlab.app.whenderson.net/wah/youtify
