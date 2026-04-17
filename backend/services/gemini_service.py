import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
# NOTE: Replace 'YOUR_API_KEY' via env or config, keeping within free-tier
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "DUMMY_KEY_FOR_LOCAL_TESTING"))

def smart_match_volunteer(task_details: str, volunteers: list) -> dict:
    """
    Uses Gemini API to analyze task details against volunteer profiles and predict the best match.
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are an intelligent volunteer coordinator AI for an NGO.
        Task Details: {task_details}
        
        Available Volunteers: {volunteers}
        
        Analyze the task and pick the best volunteer based on skills and availability. 
        Return ONLY a JSON with two keys: "best_volunteer_id" and "reasoning".
        """
        
        response = model.generate_content(prompt)
        # Mocking or parsing the JSON out of response.text
        return {"result": response.text}
    except Exception as e:
        return {"error": str(e)}
