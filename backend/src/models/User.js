const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(50)
    },
    profile_image: {
      type: DataTypes.STRING(500)
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: 'user',
      validate: {
        // ✅ ADD 'agent' to the allowed roles
        isIn: [['user', 'business', 'admin', 'super_admin', 'agent']]
      }
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    email_verification_token: {
      type: DataTypes.STRING(255)
    },
    password_reset_token: {
      type: DataTypes.STRING(255)
    },
    password_reset_expires: {
      type: DataTypes.DATE
    },
    refresh_token: {
      type: DataTypes.STRING(500)
    },
    deleted_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'users',
    paranoid: true,
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password_hash', 'refresh_token', 'email_verification_token', 'password_reset_token'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password_hash'] }
      },
      withRefreshToken: {
        attributes: { include: ['refresh_token'] }
      }
    }
  });

  User.associate = (models) => {
    User.hasMany(models.Business, { foreignKey: 'user_id', as: 'businesses' });
    User.hasMany(models.Review, { foreignKey: 'user_id', as: 'reviews' });
    User.hasMany(models.Favorite, { foreignKey: 'user_id', as: 'favorites' });
    User.hasMany(models.Notification, { foreignKey: 'user_id', as: 'notifications' });
    User.hasMany(models.Report, { foreignKey: 'reporter_id', as: 'reports' });
    User.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
    User.hasMany(models.Payment, { foreignKey: 'user_id', as: 'payments' });
    // ✅ Add Agent association
    User.hasOne(models.Agent, { foreignKey: 'user_id', as: 'agentProfile' });
  };

  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    delete values.refresh_token;
    delete values.email_verification_token;
    delete values.password_reset_token;
    return values;
  };

  return User;
};