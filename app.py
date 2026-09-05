from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import os

app = Flask(__name__)

# ==========================================
# OPENAI CLIENT
# ==========================================

api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key) if api_key else None


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():
    return render_template("index.html")


# ==========================================
# HEALTH CHECK
# ==========================================

@app.route("/health")
def health():

    return jsonify({
        "status": "online",
        "ai_configured": client is not None
    })


# ==========================================
# CHAT
# ==========================================

@app.route("/chat", methods=["POST"])
def chat():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No message received."
            }), 400

        message = data.get("message", "").strip()

        if not message:
            return jsonify({
                "success": False,
                "error": "Please enter a message."
            }), 400

        # Check API key
        if client is None:
            return jsonify({
                "success": False,
                "error": "OPENAI_API_KEY is not configured."
            }), 503

        # ==================================
        # REAL OPENAI AI
        # ==================================

        response = client.responses.create(

            model="gpt-5.6-luna",

            instructions=(
                "You are NEXORA AI, a helpful, friendly and intelligent "
                "digital assistant. Answer accurately and clearly. "
                "Use simple language when appropriate. "
                "If the user asks for code, provide clean and understandable code."
            ),

            input=message
        )

        reply = response.output_text

        return jsonify({
            "success": True,
            "reply": reply
        })

    except Exception as error:

        print("NEXORA ERROR:", error)

        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )