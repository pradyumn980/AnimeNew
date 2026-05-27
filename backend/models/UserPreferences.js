import mongoose from "mongoose";

const userPreferencesSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		favoriteGenres: { type: [String], default: [] },
		mood: { type: String, default: "" },
		favoriteAnimes: { type: [String], default: [] },
		lastRecommendations: { type: mongoose.Schema.Types.Mixed, default: null },
		lastRecommendedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

const UserPreferences = mongoose.model(
	"UserPreferences",
	userPreferencesSchema,
);

export default UserPreferences;
