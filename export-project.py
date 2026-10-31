#!/usr/bin/env python3
"""
Export script for Galicia 10-Day Trip Project.
Packages all project source files, configuration, assets, and documentation
into 100% valid, universally compatible ZIP (Windows Explorer, WinRAR, 7-Zip, macOS, Linux)
and TAR.GZ archives for easy migration to Hostinger VPS, Coolify, GitHub, or OpenCode.

Features guaranteed compatibility with Windows Explorer (zipfldr.dll):
1. Explicit directory entries for all parent paths (ending in '/').
2. MS-DOS attributes in lower 16 bits (0x10 for directories, 0x20 for archive files).
3. Unix POSIX permissions in upper 16 bits (0o755 for dirs, 0o644 for files).
4. Valid MS-DOS date/time stamps (clamped to >= 1980).
5. Normalized forward slashes ('/') in all path entries.
"""

import os
import zipfile
import tarfile
import shutil
import time

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, 'public')
DIST_DIR = os.path.join(PROJECT_ROOT, 'dist')
ROOT_ZIP_DEST = os.path.join(PROJECT_ROOT, 'galicia-trip-project.zip')
PUBLIC_ZIP_DEST = os.path.join(PUBLIC_DIR, 'galicia-trip-project.zip')
ROOT_TAR_DEST = os.path.join(PROJECT_ROOT, 'galicia-trip-project.tar.gz')
PUBLIC_TAR_DEST = os.path.join(PUBLIC_DIR, 'galicia-trip-project.tar.gz')

EXCLUDE_DIRS = {
    'node_modules',
    '.git',
    'dist',
    'build',
    '.aistudio',
    'coverage',
    '__pycache__',
    '.vscode',
    '.idea'
}

EXCLUDE_FILES = {
    '.DS_Store',
    'galicia-trip-project.zip',
    'galicia-trip-project.tar.gz',
    'test_win.zip',
    'test_download.zip'
}

def should_include(rel_path):
    parts = rel_path.replace('\\', '/').split('/')
    for part in parts:
        if part in EXCLUDE_DIRS:
            return False
    filename = os.path.basename(rel_path)
    if filename in EXCLUDE_FILES or filename.endswith('.log'):
        return False
    return True

def get_dostime(mtime):
    """Convert timestamp to (year, month, day, hour, min, sec) tuple clamped to >= 1980."""
    try:
        t = time.localtime(max(mtime, 315532800))  # 1980-01-01
        year = max(1980, min(2099, t.tm_year))
        return (year, t.tm_mon, t.tm_mday, t.tm_hour, t.tm_min, t.tm_sec)
    except Exception:
        return (2026, 1, 1, 12, 0, 0)

def create_zip():
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    
    # 1. Collect all files and directories to include
    all_files = []
    all_dirs = set()

    for root, dirs, files in os.walk(PROJECT_ROOT):
        # Filter out excluded directories in place
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in sorted(files):
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, PROJECT_ROOT)
            if should_include(rel_path):
                norm_rel = rel_path.replace(os.sep, '/')
                all_files.append((full_path, norm_rel))
                
                # Register all parent directories
                parts = norm_rel.split('/')[:-1]
                for i in range(1, len(parts) + 1):
                    all_dirs.add('/'.join(parts[:i]) + '/')

    # 2. Write archive with explicit directory records and strict DOS + Unix attributes
    with zipfile.ZipFile(ROOT_ZIP_DEST, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
        # Write directories first in sorted order
        for d in sorted(all_dirs):
            d_info = zipfile.ZipInfo(d)
            d_info.date_time = (2026, 1, 1, 12, 0, 0)
            # System 0 = MS-DOS FAT (maximum compatibility with Windows Explorer)
            d_info.create_system = 0
            # Attribute: Directory flag (0x10) | POSIX dir permissions (0o40755)
            d_info.external_attr = (0o040755 << 16) | 0x10
            zipf.writestr(d_info, b'')

        # Write all files
        for full_path, norm_rel in sorted(all_files, key=lambda x: x[1]):
            mtime = os.path.getmtime(full_path)
            dt = get_dostime(mtime)
            with open(full_path, 'rb') as f:
                data = f.read()

            f_info = zipfile.ZipInfo(norm_rel, date_time=dt)
            f_info.create_system = 0
            f_info.compress_type = zipfile.ZIP_DEFLATED
            # Attribute: Archive flag (0x20) | POSIX file permissions (0o100644)
            f_info.external_attr = (0o100644 << 16) | 0x20
            zipf.writestr(f_info, data)

    # 3. Verify integrity with testzip
    with zipfile.ZipFile(ROOT_ZIP_DEST, 'r') as verify_zip:
        bad_file = verify_zip.testzip()
        if bad_file:
            raise RuntimeError(f"Zip verification failed on file: {bad_file}")

    # 4. Copy to public directory so it's directly accessible
    shutil.copyfile(ROOT_ZIP_DEST, PUBLIC_ZIP_DEST)

    # 5. Copy to dist/ if it exists
    if os.path.exists(DIST_DIR):
        shutil.copyfile(ROOT_ZIP_DEST, os.path.join(DIST_DIR, 'galicia-trip-project.zip'))

    print(f"Created 100% Windows-Explorer compatible ZIP:")
    print(f"  - Directories: {len(all_dirs)}")
    print(f"  - Files: {len(all_files)}")
    print(f"  - Destination: {ROOT_ZIP_DEST} & {PUBLIC_ZIP_DEST}")

def create_tar():
    with tarfile.open(ROOT_TAR_DEST, "w:gz") as tar:
        for root, dirs, files in os.walk(PROJECT_ROOT):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in sorted(files):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, PROJECT_ROOT)
                if should_include(rel_path):
                    arcname = rel_path.replace(os.sep, '/')
                    tar.add(full_path, arcname=arcname)
    shutil.copyfile(ROOT_TAR_DEST, PUBLIC_TAR_DEST)
    if os.path.exists(DIST_DIR):
        shutil.copyfile(ROOT_TAR_DEST, os.path.join(DIST_DIR, 'galicia-trip-project.tar.gz'))
    print(f"Created TAR.GZ bundle at: {ROOT_TAR_DEST} & {PUBLIC_TAR_DEST}")

if __name__ == '__main__':
    create_zip()
    create_tar()
    print("Project bundle export completed successfully!")
