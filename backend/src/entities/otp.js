const { EntitySchema } = require("typeorm");

module.exports = {
  OTP: new EntitySchema({
    name: "OTP",
    tableName: "user_otps",
    columns: {
      id: {
        primary: true,
        type: "uuid",
        generated: "uuid",
      },
      otp: {
        type: "varchar",
      },
      createdAt: {
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
      },
      otpExpires: {
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP + INTERVAL '5 minutes'",
      },
    },
    relations: {
      user: {
        type: "many-to-one",
        target: "User",
        joinColumn: true,
        onDelete: "CASCADE",
      },
    },
  }),
};
