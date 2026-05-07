from flask import Flask, render_template, request, jsonify
import os
import tempfile

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

def summarize_text(text, max_length=500):
    if len(text) <= max_length:
        return text
    
    sentences = text.replace('\n', ' ').split('。')
    summary = ''
    for sent in sentences:
        if len(summary) + len(sent) <= max_length:
            summary += sent + '。'
        else:
            break
    return summary if summary else text[:max_length] + '...'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': '未上传文件'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            file.save(tmp.name)
            with open(tmp.name, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            os.unlink(tmp.name)
        
        summary = summarize_text(content)
        return jsonify({'original_length': len(content), 'summary': summary})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)