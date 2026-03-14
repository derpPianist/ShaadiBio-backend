import Refresh_Session from "./refreshSession.model.js";
import UserAccount from "./userAccounts.model.js";
import profiles from "./profiles.model.js";

UserAccount.hasMany(Refresh_Session,{
    foreignKey: "userId",
    onDelete: "CASCADE",
    as: "sessions"
});

Refresh_Session.belongsTo(UserAccount,{
    foreignKey: "userId",
    as: "user"
});

UserAccount.hasOne(profiles, {
    foreignKey: "userId",
    onDelete: "CASCADE"
})

profiles.belongsTo(UserAccount, {
    foreignKey: "userId"
})

export { UserAccount, Refresh_Session, profiles };