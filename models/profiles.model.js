import { sequelize } from "../database/dbConn.js";
import { DataTypes } from "sequelize";
import UserAccount from "./userAccounts.model.js";

const profiles = sequelize.define(
  "profiles",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: UserAccount,
        key: "userId",
      },
      onDelete: "CASCADE",
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: false,
    },
    DOB: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    complexion: {
      type: DataTypes.ENUM("fair", "wheatish", "dusky", "dark"),
      allowNull: false,
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    income: {
      type: DataTypes.ENUM("0-5L", "5-10L", "10-20L", "20-50L", "50L+"),
      allowNull: true,
    },
    education: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fathers_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fathers_occupation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mothers_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mothers_occupation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_of_siblings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 20,
      },
    },
    contact_person: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[6-9]\d{9}$/,
      },
    },
    contact_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    residential_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    image_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

export default profiles;
