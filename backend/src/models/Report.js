module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    reporter_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    target_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['business', 'review', 'user', 'content']]
      }
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'investigated', 'resolved', 'rejected']]
      }
    },
    admin_notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'reports',
    timestamps: true
  });

  Report.associate = (models) => {
    Report.belongsTo(models.User, { foreignKey: 'reporter_id', as: 'reporter' });
  };

  return Report;
};