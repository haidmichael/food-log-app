import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
})

const SYSTEM_PROMPT = `You are a nutrition expert that parses food descriptions into structured data.

When given a description of food eaten, return a JSON array of food entries.
Each entry must have these exact fields: 
- foodName: string (specific food name)
- servingSize: number (numeric amount)
- servingUnit: string (must be one of: g, oz, cup, tbsp, tsp, whole, piece, slice, bar, serving)
- calories: number (integer)
- protein: number (one decimal place)
- carbs: number (one decimal place)
- fat: number (one decimal place)

Rules:
- Always return ONLY a valid JSON array, no other text
- Use realistic nutrition values basead on USDA data
- If serving size is unclear, use standard serving (e.g. 1 cup, 100g)
- Split combined foods into separate entries
- Never include markdown, code blocks, or explanations
IMPORTANT: Return ONLY the raw JSON array. Do NOT wrap in markdown code blocks. Do NOT use code fences. Start your response with [ and end with ].

Example input: "2 scrambled eggs and a cup of oatmeal"
Example output: 
[
  {
    "foodName": "Scrambled eggs",
    "servingSize": 2,
    "servingUnit": "whole",
    "calories": 182,
    "protein": 12.0,
    "carbs": 2.4,
    "fat": 13.6
  },
  {
    "foodName": "Oatmeal, cooked",
    "servingSize": 1,
    "servingUnit": "cup",
    "calories": 166,
    "protein": 5.9,
    "carbs": 28.1,
    "fat": 3.6
  }
]`

export const parseFoodDescription = async (req, res) => {
    try {
        const { description } = req.body

        if (!description || description.trim().length < 2) {
            return res.status(400).json({ error: 'Please describe what you ate' })
        }

        if (description.trim().length > 500) {
            return res.status(400).json({ error: 'Description too long - keep it under 500 characters' })
        }

        const message = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: description.trim()
                }
            ]
        })

        // Extract text response
        const responseText = message.content[0].text

        // Parse JSON safely
        let foodEntries
        try {
        const cleanResponse = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()
            foodEntries = JSON.parse(cleanResponse)
        } catch (parseErr) {
            console.error('Failed to parse AI response:', responseText)
            return res.status(500).json({ error: 'Failed to parse food data. Please try again.' })
        }

        // Validate it's an array
        if(!Array.isArray(foodEntries)) {
            return res.status(500).json({ error: 'Unexpected response format. Please try again' })
        }

        // Log token usage for monitoring costs
        const totalTokens = message.usage.input_tokens + message.usage.output_tokens
        if (totalTokens > 1500) {
            console.log(`AI high token usage: ${totalTokens} tokens for: "${description.substring(0, 50)}"`)
        }

        res.json({ foods: foodEntries })

    } catch (err) {
        console.error('AI parse error:', err)
        res.status(500).json({ error: 'AI service unavailable. Please try agian.' })
    }
}