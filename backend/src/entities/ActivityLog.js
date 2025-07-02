const { EntitySchema } = require("typeorm");

const ActivityLog = new EntitySchema({
  name: "ActivityLog",
  tableName: "activity_logs",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    action: {
      type: "varchar",
      length: 100,
      nullable: false
    },
    userId: {
      type: "uuid",
      nullable: true
    },
    userEmail: {
      type: "varchar",
      length: 100,
      nullable: true
    },
    details: {
      type: "text",
      nullable: true
    },
    status: {
      type: "varchar",
      length: 50,
      default: "normal"
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    }
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: {
        name: "userId"
      },
      nullable: true
    }
  }
});

module.exports = { ActivityLog };
