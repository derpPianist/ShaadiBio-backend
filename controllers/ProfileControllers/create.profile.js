import chalk from "chalk";
import profiles from "../../models/profiles.model.js";
import UserAccount from "../../models/userAccounts.model.js";

export const createProfile = async (req, res, imageUrl) => {
  try {
    const body = req.body;
    const userId = req.user?.sub;

    console.log(chalk.blue("req.user: "), req.user);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: userId not found",
      });
    }

    const user = await UserAccount.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const requiredFields = [
      "name",
      "gender",
      "DOB",
      "complexion",
      "occupation",
      "education",
      "fathers_name",
      "fathers_occupation",
      "mothers_name",
      "mothers_occupation",
      "no_of_siblings",
      "contact_person",
      "contact_number",
      "contact_email",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return res.status(400).json({
          message: `Missing required field: ${field}`,
        });
      }
    }

    if (!imageUrl) {
      return res.status(400).json({
        message: "Profile image is required",
      });
    }

    const newProfile = await profiles.create({
      userId: userId,
      name: body.name,
      gender: body.gender.toLowerCase(),
      DOB: body.DOB,
      complexion: body.complexion.toLowerCase(),
      occupation: body.occupation,
      income: body.income || null,
      education: body.education,
      fathers_name: body.fathers_name,
      fathers_occupation: body.fathers_occupation,
      mothers_name: body.mothers_name,
      mothers_occupation: body.mothers_occupation,
      no_of_siblings: body.no_of_siblings,
      contact_person: body.contact_person,
      contact_number: body.contact_number,
      contact_email: body.contact_email,
      residential_address: body.residential_address || null,
      image_url: imageUrl,
    });

    return res.status(201).json({
      message: "new profile successfully registered",
      profileInfo: newProfile,
    });
  } catch (error) {
    console.error("Error in creating profile: ", error);
    return res.status(500).json({
      message: "Error in creating profile, pls try later",
    });
  }
};
