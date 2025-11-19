import os
import tempfile
import json
import re
import requests
import threading
from flask import Flask, render_template, request, jsonify
from bs4 import BeautifulSoup
import google.generativeai as genai

app = Flask(__name__)

# Configure Gemini API
GENAI_API_KEY = "AIzaSyCNmly7o_o-hg1mVJQOspcXt_gJVWXHNxQ"
genai.configure(api_key=GENAI_API_KEY)

CACHE_FILE = 'notes_cache.json'

# Lock to ensure only one MP3 is processed at a time (reduces storage overhead)
processing_lock = threading.Lock()

def clean_latex_formatting(text):
    """Removes LaTeX formatting like $\text{...}$ from the text."""
    # Remove $\text{...}$ and replace with just the content inside
    text = re.sub(r'\$\\text\{([^}]*)\}\$', r'\1', text)
    # Also handle \\text{...} without dollar signs
    text = re.sub(r'\\text\{([^}]*)\}', r'\1', text)
    # Remove any remaining single $ signs (inline math)
    text = re.sub(r'\$([^$]*)\$', r'\1', text)
    return text

def load_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_cache(cache):
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f)

def get_mp3_url(page_url):
    """Scrapes the Yutorah page to find the MP3 download link."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(page_url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Strategy 1: Look for a link that ends with .mp3
        for a in soup.find_all('a', href=True):
            if a['href'].strip().lower().endswith('.mp3'):
                return a['href']
        
        # Strategy 2: Look for audio tag source
        audio = soup.find('audio')
        if audio and audio.get('src'):
            return audio['src']
            
        return None
    except Exception as e:
        print(f"Error scraping URL: {e}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process_shiur():
    data = request.json
    page_url = data.get('url')
    
    if not page_url:
        return jsonify({'error': 'No URL provided'}), 400
    
    # Check cache
    cache = load_cache()
    if page_url in cache:
        print(f"Returning cached notes for {page_url}")
        cleaned_notes = clean_latex_formatting(cache[page_url])
        return jsonify({'notes': cleaned_notes, 'cached': True})
    
    # Acquire lock to ensure only one MP3 is processed at a time
    if not processing_lock.acquire(blocking=False):
        return jsonify({'error': 'Server is currently processing another request. Please try again in a moment.'}), 503
    
    try:
        # 1. Get MP3 URL
        mp3_url = get_mp3_url(page_url)
        if not mp3_url:
            return jsonify({'error': 'Could not find MP3 link on the page'}), 404
            
        print(f"Found MP3 URL: {mp3_url}")
        
        # 2. Download MP3 to temp file in /tmp/ (Render-compatible)
        temp_dir = '/tmp' if os.path.exists('/tmp') else None
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3', dir=temp_dir) as temp_mp3:
            print("Downloading MP3...")
            with requests.get(mp3_url, stream=True) as r:
                r.raise_for_status()
                # Stream in larger chunks for better performance
                for chunk in r.iter_content(chunk_size=1024*1024):  # 1MB chunks
                    if chunk:  # filter out keep-alive new chunks
                        temp_mp3.write(chunk)
            temp_mp3_path = temp_mp3.name
            
        try:
            # 3. Upload to Gemini
            print("Uploading to Gemini...")
            myfile = genai.upload_file(temp_mp3_path)
            
            # 4. Generate Notes
            print("Generating notes...")
            model = genai.GenerativeModel("gemini-flash-latest")
            
            prompt = "Take extensive and clear notes on this shiur. Make sure to write hebrew terms in hebrew but the rest in english(do not translate or transliterate the hebrew terms)."
            
            result = model.generate_content([myfile, prompt])
            notes = result.text
            
            # Clean LaTeX formatting
            cleaned_notes = clean_latex_formatting(notes)
            
            # Save to cache
            cache[page_url] = cleaned_notes
            save_cache(cache)
            
            return jsonify({'notes': cleaned_notes, 'cached': False})
            
        finally:
            # Cleanup temp file
            if os.path.exists(temp_mp3_path):
                os.unlink(temp_mp3_path)
                
    except Exception as e:
        print(f"Error processing: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        # Always release the lock
        processing_lock.release()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
