const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.STRING(100)
    },
    event_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    start_time: {
      type: DataTypes.TIME
    },
    end_time: {
      type: DataTypes.TIME
    },
    address: {
      type: DataTypes.TEXT
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8)
    },
    price: {
      type: DataTypes.DECIMAL(10, 2)
    },
    ticket_url: {
      type: DataTypes.STRING(500)
    },
    organizer: {
      type: DataTypes.STRING(255)
    },
    image_url: {
      type: DataTypes.STRING(500)
    },
    is_free: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'approved', 'rejected', 'cancelled']]
      }
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'events',
    timestamps: true
  });

  Event.associate = (models) => {
    Event.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
  };

  Event.beforeCreate(async (event) => {
    if (!event.slug) {
      const baseSlug = slugify(event.title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await Event.findOne({ where: { slug } });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      event.slug = slug;
    }
  });

  return Event;
};