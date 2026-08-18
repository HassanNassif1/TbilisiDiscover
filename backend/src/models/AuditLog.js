module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    target_type: {
      type: DataTypes.STRING(50)
    },
    target_id: {
      type: DataTypes.INTEGER
    },
    changes: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    ip_address: {
      type: DataTypes.STRING(45)
    },
    user_agent: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return AuditLog;
};