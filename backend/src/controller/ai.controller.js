import { interaction } from "../services/ai.service.js";

export const getResult = async (req, res) => {
  const { prompt } = req.query;

  const result = await interaction(prompt);

  res.status(200).json({
    success: true,
    message: "successfully",
    result,
  });
};
