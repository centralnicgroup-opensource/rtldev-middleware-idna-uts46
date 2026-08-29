# Development image for this repository.
#
# Deliberately thin, and meant to stay that way. The packages, timezone, zsh
# configuration and commitizen setup that a hand-written devcontainer would put
# here all come from the devbase Feature:
# https://github.com/centralnicgroup-opensource/rtldev-middleware-devcontainer-features
#
# Node arrives with devbase too, which declares the node Feature at LTS as its own
# dependency — so this file pins no language image.
#
# Add a layer here only for something the Feature cannot express: a system library
# a native module needs to compile, an image-level config file. If what you are
# about to add is shared behaviour rather than this repository's own, it belongs in
# the Feature instead.

FROM mcr.microsoft.com/devcontainers/base:2-ubuntu-24.04

# No ENV DEBIAN_FRONTEND here on purpose: set at image level it persists into the
# running container, so an interactive `apt` in a shell session also loses its
# frontend. A layer that needs it sets it for itself.
ENV TERM=xterm-256color
