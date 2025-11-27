# backend/shop/ai_utils.py
import os
import json
from openai import OpenAI

# ✅ API key .env থেকে যাবে
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def ai_generate_product_meta(title: str) -> dict:
    """
    ইংরেজি + বাংলা দুই ভাষায় product description, category, price সাজেশন
    JSON ফরম্যাটে ফেরত দেবে।
    """
    prompt = (
        "You are an AI assistant for an e-commerce website.\n"
        f'Given a product title: "{title}"\n\n'
        "Return STRICT JSON with these exact keys:\n"
        "- title_en\n"
        "- title_bn\n"
        "- description_en\n"
        "- description_bn\n"
        "- category\n"
        "- suggested_price\n\n"
        "Rules:\n"
        "1. title_en = short clean English title.\n"
        "2. title_bn = natural Bangla title.\n"
        "3. description_en = 3-6 line marketing description in English.\n"
        "4. description_bn = Bangla translation, natural conversational tone.\n"
        "5. category = single word or short phrase like 'Fashion', 'Electronics'.\n"
        "6. suggested_price = realistic float number.\n"
        "Return ONLY pure JSON."
    )

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )

    data = json.loads(resp.choices[0].message.content)
    return data
