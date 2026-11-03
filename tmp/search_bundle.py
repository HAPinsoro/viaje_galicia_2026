with open('/tmp/deployed_bundle.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

pos = text.find('suggestedArea:')
while pos != -1:
    print('--- MATCH AT', pos, '---')
    print(text[max(0, pos-100):min(len(text), pos+600)])
    pos = text.find('suggestedArea:', pos+1)
    if pos > 100000:
        break
