const { EntitySchema } = require("typeorm");

module.exports = {
  User: new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
      id: {
        primary: true,
        type: "uuid",
        generated: "uuid",
      },
      username: {
        type: "varchar",
      },
      email: {
        type: "varchar",
      },
      phoneNumber: {
        type: "varchar",
      },
      password: {
        type: "varchar",
      },
      isAdmin: {
        type: "enum",
        enum: ["user", "admin"], 
        default: "user",
      },
    },
    relations: {
      otps: {
        type: "one-to-many",
        target: "OTP",
        inverseSide: "user",
        cascade: true,
      },
    },
  }),
};
