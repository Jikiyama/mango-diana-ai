from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from openai import OpenAI  # pip install openai

app = Flask(__name__)
CORS(app)

@app.route('/api/mealplan', methods=['POST'])
def generate_meal_plan():
    print("Received request for meal plan generation")
    
    # Get API key from environment variable
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not set")
        return jsonify({
            "error": "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable."
        }), 500
        
    client = OpenAI(api_key=api_key)
    
    data = request.json
    print("Extracted JSON data from request:", data)
    
    # Process the form data by passing the data directly
    form_data_result = process_form_data(data)
    
    prompt = """
You are an expert dietitian. 
Generate a meal plan for individuals based on: 
- Age, gender, weight, height, pregnancy status, breastfeeding status, medical conditions, physical activity level, eGFR, HBA1c, if on dialysis or not. Calculate BMI, categorize the patient based on WHO BMI classification. 

- Identify the Appropriate DRI Values: The DRIs include the Recommended Dietary Allowance (RDA), Adequate Intake (AI), Tolerable Upper Intake Level (UL), and Acceptable Macronutrient Distribution Range (AMDR). These values are specific to different life stages and gender groups. Take into account the Dietary Guidelines for Americans:
  https://www.dietaryguidelines.gov/sites/default/files/2021-03/Dietary_Guidelines_for_Americans-2020-2025.pdf
  Use the DRI Calculator at:
  https://www.nal.usda.gov/human-nutrition-and-food-safety/dri-calculator/

- Estimate energy requirements: use the Harris-Benedict or Mifflin-St Jeor equations.

- Macronutrient Distribution: Ensure that the individual's diet falls within the AMDRs: 45–65% of total calories from carbohydrates, 20–35% from fats, and 10–35% from proteins.

- Micronutrient Needs: Use the RDA or AI values to determine required intake of vitamins and minerals.

- Adjust nutrient recommendations based on specific conditions such as pregnancy, lactation, athlete status, or underlying health issues.

- For athletes, energy requirements need adjustments for sport type and environmental conditions. Endurance sports typically require higher carbohydrate intake (6–10 g/kg body weight/day) to maintain glycogen stores. Macronutrient distribution for athletes may be carbs 6–10 g/kg/day, proteins 1.2–1.7 g/kg/day for endurance and strength training, and fats 20–35% of total energy. Consuming <20% fat does not improve performance. Hydration is crucial; dehydration decreases performance. Replace fluids lost during exercise with approximately 450–675 mL of fluid for each pound (~0.5 kg) of body weight lost. Micronutrient supplementation may be necessary if dieting or eliminating food groups. Nutrient timing: Before exercise—low in fat/fiber, higher in carbs, moderate protein, plus fluids. During—carbs (30–60 g/hour) plus fluid replacement for endurance events >1 hour. After—adequate fluids, electrolytes, carbs (~1.0–1.5 g/kg) for glycogen repletion, and protein for muscle repair.

- Type 2 Diabetes: Include non-starchy vegetables, whole fruits, legumes, lean proteins, whole grains, nuts, seeds, low-fat dairy or nondairy alternatives. Minimize red meat, sugar-sweetened beverages, sweets, refined grains, processed foods. Carbohydrates 45–65% total daily calories, focusing on nutrient-dense, high-fiber sources (≥14 g fiber per 1,000 kcal). Limit simple sugars, high GI foods. Protein sources: more plant-based. Mediterranean eating pattern recommended. Fat intake: limit saturated fats (e.g. red meat, full-fat dairy, butter). Sodium <2,300 mg/day. Avoid ketogenic diets if on SGLT-2 inhibitors due to risk of ketoacidosis. If Hba1c is at goal, maintain healthy carb balance; if not, reduce carbs within recommended parameters. Typically aim for HbA1c <7% in nonpregnant adults, with individualized goals from <6.5% to <8% depending on comorbidities/hypoglycemia risk.

- CKD: 
  • Stages 3–5 (non-dialysis): protein ~0.6–0.8 g/kg/day, sodium <2,300 mg/day, more plant-based, fewer ultraprocessed foods (DASH, Mediterranean). 
  • On dialysis: higher protein (1.0–1.2 g/kg/day). 
  • If CKD 3-5d with hyperkalemia, dietary potassium <3 g/day (~77 mmol/day), avoid high-bioavailable potassium (processed meats, dairy, additives), prefer lower-bioavailability plant-based potassium. 
  • Phosphorus: limit 800–1,000 mg/day for stages 3–5D; prefer lower-bioavailability from plant sources. 
  • Calcium: ~800–1,000 mg/day for CKD 3–4 not on active vitamin D analogs. Stage 5D requires adjusting to prevent hypercalcemia with vitamin D analogs/calcimimetics.

- Hypertension: weight loss if overweight or obese, DASH diet, reduce sodium (optimal <1,500 mg). Increase potassium to 3,500–5,000 mg if no CKD or meds affecting K+ excretion (spironolactone, TMP-SMX, cyclosporine, tacrolimus, amiloride, triamterene, heparin).

- Dyslipidemia: emphasize fruits, vegetables (≥5 servings/day), whole grains, legumes, high-fiber cereals, low-fat dairy, fish, lean meats, poultry. Limit saturated fat to ~7% of total calories, trans fat to ~1%, cholesterol to ~200 mg/day. Poly- and monounsaturated fats ~10% and ~20% of total, total dietary fat 25–35%. Plant stanol esters (~2 g/day) plus 10–25 g/day soluble fiber help reduce LDL. Weight reduction. If high TG, limit alcohol/sugars/refined starches. If TG ≥500 mg/dL, individualize to prevent pancreatitis; if TG ≥1000 mg/dL, low-fat (15% energy) + no alcohol.

- CVD: minimize processed foods, reduce saturated fat <7% of total calories, no trans fats, sodium <2,300 mg/day (ideally <1,500 mg), follow DASH/USDA pattern or Mediterranean.

- Obesity: aim for 3–7% weight loss. Typically a 500–750 kcal/day deficit.

- Preferences: consider cooking time, portion sizes (number of people), leftover usage, budget, likes/dislikes, days of the week needed, batch cooking preferences (lunch/dinner leftover usage), allergies/intolerances, religious or cultural restrictions.

- Provide a nutritional chart with macronutrients (percent of total calories), break down fats (saturated, mono, poly, trans), fiber (dietary, soluble), sodium, potassium, phosphorus, calcium, vitamin D, etc. by meal and daily total, using USDA composition data. 
- Provide daily meal plan (Breakfast, Snacks if chosen, Lunch, Dinner), with recipes including specific quantities and cooking instructions, as if for a novice. Seasoning amounts for herbs, salt, spices. Use reputable sources for tasty recipes. 
- Provide a grocery list (array of objects [ingredient: string, quantity: string]). 
- Use Python for calculations. 
- If insufficient info, say so without fabricating. 
- For other conditions not listed, follow peer-reviewed or recognized guidelines (≥2010). 
- If patient wants gradual sodium reduction, start ~2,500 mg/day, reduce 200–300 mg/wk until 1,500–2,300 mg. If gradual calorie reduction, start slightly less than full deficit (100–150 kcal/wk) until 500–750 kcal/day deficit is reached.

Below is the patient's data in JSON form:\n""" + form_data_result +  """\n
REMEMBER: Return only valid JSON that adheres to this structure Note that you should generate as many days as the user requests in the prompt:
{
  "meal_plan": {
    "Day 1": { "Breakfast": "", "Snack": "", "Lunch": "", "Dinner": "" },
    "Day 2": { "Breakfast": "", "Snack": "", "Lunch": "", "Dinner": "" },
    "Day 3": { "Breakfast": "", "Snack": "", "Lunch": "", "Dinner": "" },
    "Day 4": { "Breakfast": "", "Snack": "", "Lunch": "", "Dinner": "" },
    "Day 5": { "Breakfast": "", "Snack": "", "Lunch": "", "Dinner": "" }
  },
  "nutritional_info": {
    "daily_totals": {
      "calories": "",
      "macronutrients": {
        "carbohydrates": { "percentage": "", "grams": "" },
        "proteins": { "percentage": "", "grams": "" },
        "fats": { "percentage": "", "grams": "" }
      },
      "fiber": "",
      "sodium": "",
      "potassium": "",
      "phosphorus": "",
      "calcium": "",
      "vitamin_d": ""
    },
    "meal_breakdown": {
      "Day 1": {
        "Breakfast": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Snack": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Lunch": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Dinner": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } }
      },
      "Day 2": {
        "Breakfast": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Snack": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Lunch": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Dinner": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } }
      },
      "Day 3": {
        "Breakfast": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Snack": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Lunch": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Dinner": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } }
      },
      "Day 4": {
        "Breakfast": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Snack": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Lunch": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Dinner": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } }
      },
      "Day 5": {
        "Breakfast": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Snack": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Lunch": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Dinner": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } }
      }
    },
    "notes": ""
  },
  "shopping_list": [
    { "ingredient": "", "quantity": "" }
  ],
  "recipes": {
    "Recipe Title": {
      "ingredients": [
        { "item": "", "quantity": "" }
      ],
      "instructions": ""
    }
  }
}
For each meal ion the daily meal plan, include only a short meal name that exactly matches the dictionary key in the recipes, then put the details in the recipes object
WITHIN YOUR JSON DO NOT INCLUDE RAW NEWLINES SO THAT THE JSON RESPONSE IS VALID
"""

    try:
        response = client.chat.completions.create(
            model="o3-mini",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        print("Received response from OpenAI API")

        raw_answer = response.choices[0].message.content.strip()
       
        print("Raw response received:", raw_answer[:500], "...")  # Print first 500 characters for debugging
        with open("prompt_sent.txt", "w", encoding="utf-8") as output:
            output.write(prompt)
        with open("output.txt", "w", encoding="utf-8") as output:
            output.write(raw_answer)

        print("Saved raw response to output.txt")

        parsed_response = json.loads(raw_answer)
        print("Successfully parsed JSON response")

        return jsonify(parsed_response), 200

    except json.JSONDecodeError as e:
        print("Error parsing JSON from OpenAI:", e)
        print("Raw response:", raw_answer)
        return jsonify({
            "error": "The AI response was not valid JSON. Please try again."
        }), 500

    except Exception as e:
        print("Error calling OpenAI:", e)
        return jsonify({
            "error": str(e)
        }), 500

@app.route('/api/process-form', methods=['POST'])
def process_form_endpoint():
    try:
        data = request.json
        if not data:
            return "No data provided", 400
        
        result = process_form_data(data)
        return result, 200
    
    except Exception as e:
        print("Error processing form data:", e)
        return str(e), 500

# Modified to accept data as a parameter and return only a string
def process_form_data(data):
    try:
        if not data:
            return "No data provided"
        
        # Check if data is already a dictionary
        if isinstance(data, dict):
            form_data = data
        else:
            # If it's a string or something else, try to parse it
            try:
                # Extract the JSON string from the data if it's a dict with a single key
                if isinstance(data, dict) and len(data) == 1:
                    json_str = list(data.keys())[0]
                else:
                    json_str = data
                
                # Parse the JSON string
                form_data = json.loads(json_str)
            except:
                # If parsing fails, use the data as is
                form_data = data
        
        # Process personal info
        personal_info = form_data.get("personal_info", {})
        diet_preferences = form_data.get("diet_preferences", {})
        goal_settings = form_data.get("goal_settings", {})
        
        # Build human-readable output
        output = []
        
        # Personal Information
        output.append("Personal Information:")
        output.append(f"Patient's Age: {personal_info.get('age', 'Not provided')}")
        output.append(f"Patient's Weight: {personal_info.get('weight', 'Not provided')} kg")
        output.append(f"Patient's Height: {personal_info.get('height', 'Not provided')} cm")
        output.append(f"Patient's Gender: {personal_info.get('gender', 'Not provided')}")
        output.append(f"ZIP Code: {personal_info.get('zip_code', 'Not provided')}")
        
        # Medical Information
        medical_conditions = personal_info.get('medical_conditions', [])
        output.append(f"Medical Conditions: {', '.join(medical_conditions) if medical_conditions else 'None'}")
        output.append(f"HbA1c: {personal_info.get('hba1c', 'Not provided')}")
        
        medications = personal_info.get('medications', [])
        output.append(f"Medications: {', '.join(medications) if medications else 'None'}")
        
        # Diet Preferences
        output.append("\nDiet Preferences:")
        cuisines = diet_preferences.get('cuisines', [])
        output.append(f"Preferred Cuisines: {', '.join(cuisines) if cuisines else 'None'}")
        
        other_cuisine = diet_preferences.get('other_cuisine', '')
        if other_cuisine:
            output.append(f"Other Cuisine: {other_cuisine}")
        
        allergies = diet_preferences.get('allergies', [])
        output.append(f"Allergies: {', '.join(allergies) if allergies else 'None'}")
        
        dietary_preferences = diet_preferences.get('dietary_preferences', [])
        output.append(f"Dietary Preferences: {', '.join(dietary_preferences) if dietary_preferences else 'None'}")
        output.append(f"Batch Cooking: {'Yes' if diet_preferences.get('batch_cooking', False) else 'No'}")
        output.append(f"Strictness Level: {diet_preferences.get('strictness_level', 'Not provided')}")
        
        # Goal Settings
        output.append("\nGoal Settings:")
        output.append(f"Health Goal: {goal_settings.get('health_goal', 'Not provided')}")
        output.append(f"Calorie Reduction: {goal_settings.get('calorie_reduction', 'Not provided')}")
        output.append(f"Meal Plan Days: {goal_settings.get('meal_plan_days', 'Not provided')}")
        output.append(f"Meals Per Day: {goal_settings.get('meals_per_day', 'Not provided')}")
        
        # Join all lines with newlines
        result = "\n".join(output)
        
        return result
    
    except json.JSONDecodeError as e:
        print("Error parsing JSON:", e)
        return "Invalid JSON format"
    
    except Exception as e:
        print("Error processing form data:", e)
        return str(e)

if __name__ == '__main__':
    print("Starting Flask app...")
    app.run(host='localhost', port=5000, debug=True) 