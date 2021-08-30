#! /bin/bash

podman login registry.gitlab.app.whenderson.net
podman build -t registry.gitlab.app.whenderson.net/wah/youtify .
podman push registry.gitlab.app.whenderson.net/wah/youtify
