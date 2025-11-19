import google.generativeai as genai
import os

GENAI_API_KEY = "AIzaSyCNmly7o_o-hg1mVJQOspcXt_gJVWXHNxQ"
genai.configure(api_key=GENAI_API_KEY)

def test_gemini():
    try:
        print("Listing models...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
                
        print("Creating dummy file...")
        with open("test.txt", "w") as f:
            f.write("This is a test file.")
            
        print("Uploading file...")
        myfile = genai.upload_file("test.txt")
        print(f"File uploaded: {myfile.name}")
        
        print("Generating content...")
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content([myfile, "Explain this file."])
        print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_gemini()
