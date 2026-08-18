module.exports = (sequelize, DataTypes) => {
  const BusinessHour = sequelize.define('BusinessHour', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6
      }
    },
    opens_at: {
      type: DataTypes.TIME
    },
    closes_at: {
      type: DataTypes.TIME
    },
    is_closed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'business_hours',
    timestamps: true
  });

  BusinessHour.associate = (models) => {
    BusinessHour.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
  };

  return BusinessHour;
};