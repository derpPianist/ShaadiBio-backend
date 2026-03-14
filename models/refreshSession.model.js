import { sequelize } from "../database/dbConn.js";
import { DataTypes } from "sequelize";
import UserAccount from "./userAccounts.model.js";

const Refresh_Session = sequelize.define(
  "refresh_session",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    //Establishing just the foreign key here, not enough as relationship needs to be established (done in /models/index)
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { 
        model: UserAccount,
        key: "userId",
      },
      onDelete: "CASCADE",
    },

    hashed_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    deviceIPV4: {
      type: DataTypes.CIDR,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
);

export default Refresh_Session;
