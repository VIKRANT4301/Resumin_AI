import os
import re
import glob

def clean_framer_motion(content):
    # Remove import
    content = re.sub(r'import\s+.*?from\s+[\'"]framer-motion[\'"];?\n?', '', content)
    
    # Replace Motion.div, motion.div, etc.
    content = re.sub(r'<(?:Motion|motion)\.([a-zA-Z0-9]+)', r'<\1', content)
    content = re.sub(r'</(?:Motion|motion)\.([a-zA-Z0-9]+)>', r'</\1>', content)
    
    # Remove framer-motion specific props
    props_to_remove = ['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap']
    
    # Simple regex to remove props with their curly braces values
    for prop in props_to_remove:
        # Matches prop={...} or prop="..."
        # Need to handle nested braces like transition={{ duration: 0.2 }}
        pattern = r'\b' + prop + r'=(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|"[^"]*"|\'[^\']*\')'
        content = re.sub(pattern, '', content)

    # Remove AnimatePresence wrapper
    content = re.sub(r'<AnimatePresence[^>]*>', '', content)
    content = re.sub(r'</AnimatePresence>', '', content)
    
    # Cleanup extra spaces inside tags
    content = re.sub(r'\s+>', '>', content)
    
    return content

directory = r'C:\Users\Admin\Practice\Pro_Res\frontend\src'
files = glob.glob(os.path.join(directory, '**', '*.jsx'), recursive=True) + glob.glob(os.path.join(directory, '**', '*.js'), recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        original = f.read()
    
    cleaned = clean_framer_motion(original)
    
    if original != cleaned:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(cleaned)
        print(f"Cleaned {file}")
