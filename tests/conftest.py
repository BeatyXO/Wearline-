"""Windows cleanup compatibility for genlayer-test Direct Mode."""

import os

from gltest.direct import loader
from gltest.direct.vm import VMContext


_original_unlink = os.unlink
_original_inject_message = loader._inject_message_to_fd0
_original_vm_cleanup = VMContext._cleanup_after_deactivate


def _inject_with_deferred_windows_unlink(vm):
    pending = []

    def unlink_while_fd0_is_open(path, *args, **kwargs):
        try:
            return _original_unlink(path, *args, **kwargs)
        except PermissionError:
            pending.append(path)

    os.unlink = unlink_while_fd0_is_open
    try:
        _original_inject_message(vm)
    finally:
        os.unlink = _original_unlink
    vm._direct_mode_tempfiles = pending


def _cleanup_after_vm(self):
    _original_vm_cleanup(self)
    for path in getattr(self, "_direct_mode_tempfiles", []):
        try:
            _original_unlink(path)
        except FileNotFoundError:
            pass


loader._inject_message_to_fd0 = _inject_with_deferred_windows_unlink
VMContext._cleanup_after_deactivate = _cleanup_after_vm
