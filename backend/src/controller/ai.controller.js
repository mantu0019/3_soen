 
import { generateResult } from "../services/ai.service.js";

export const getResult = async (req, res) => {
  try {
    const { prompt } = req.query;
     

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const result = await generateResult(prompt);

    return res.status(200).json({
      success: true,
      message: "Successfully",
      result,
    });
  } catch (error) {
    console.error("AI Error:", error.message);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
}; 
