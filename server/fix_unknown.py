import os
import re

files = [
    'src/controllers/case.controller.ts',
    'src/controllers/inventory.controller.ts',
    'src/controllers/search.controller.ts',
    'src/controllers/showcaseProjects.controller.ts'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    new_content = re.sub(r'\(\s*item\s+as\s+unknown\s*\)', '(item as Record<string, unknown>)', content)
    new_content = re.sub(r'\(\s*error\s+as\s+unknown\s*\)', '(error as Record<string, unknown>)', new_content)

    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Patched {file_path}")
