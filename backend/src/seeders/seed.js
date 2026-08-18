const bcrypt = require('bcryptjs');
const {
  User,
  Category,
  Location,
  SubscriptionPlan
} = require('../models');

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-');
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');
    console.log('🔥 Using updated seed.js');

    // ============================================================
    // 1. CREATE ADMIN USER
    // ============================================================

    const adminPassword = await bcrypt.hash('Admin123!', 10);

    const [admin, adminCreated] = await User.findOrCreate({
      where: {
        email: 'admin@discovertbilisi.ge'
      },
      defaults: {
        email: 'admin@discovertbilisi.ge',
        password_hash: adminPassword,
        full_name: 'Admin User',
        role: 'super_admin',
        is_email_verified: true
      }
    });

    if (adminCreated) {
      console.log('✅ Admin user created');
    } else {
      console.log('⏭️ Admin user already exists');
    }

    // ============================================================
    // 2. CREATE TEST USER
    // ============================================================

    const userPassword = await bcrypt.hash('Test123!', 10);

    const [user, userCreated] = await User.findOrCreate({
      where: {
        email: 'user@example.com'
      },
      defaults: {
        email: 'user@example.com',
        password_hash: userPassword,
        full_name: 'Regular User',
        role: 'user',
        is_email_verified: true
      }
    });

    if (userCreated) {
      console.log('✅ Test user created');
    } else {
      console.log('⏭️ Test user already exists');
    }

    // ============================================================
    // 3. CREATE BUSINESS USER
    // ============================================================

    const businessPassword = await bcrypt.hash('Business123!', 10);

    const [businessUser, businessCreated] = await User.findOrCreate({
      where: {
        email: 'business@example.com'
      },
      defaults: {
        email: 'business@example.com',
        password_hash: businessPassword,
        full_name: 'Business Owner',
        role: 'business',
        is_email_verified: true
      }
    });

    if (businessCreated) {
      console.log('✅ Business user created');
    } else {
      console.log('⏭️ Business user already exists');
    }

    // ============================================================
    // 4. CREATE CATEGORIES
    // ============================================================

    console.log('\n📂 Checking categories...');

    const categories = [
      {
        name: '🍽️ Restaurants & Cafés',
        slug: 'restaurants-cafes',
        display_order: 1
      },
      {
        name: '🏠 Real Estate',
        slug: 'real-estate',
        display_order: 2
      },
      {
        name: '🚗 Automotive & Rentals',
        slug: 'automotive-rentals',
        display_order: 3
      },
      {
        name: '💄 Beauty & Wellness',
        slug: 'beauty-wellness',
        display_order: 4
      },
      {
        name: '💪 Fitness & Health',
        slug: 'fitness-health',
        display_order: 5
      },
      {
        name: '🛍️ Shopping & Fashion',
        slug: 'shopping-fashion',
        display_order: 6
      },
      {
        name: '🏨 Travel & Hospitality',
        slug: 'travel-hospitality',
        display_order: 7
      },
      {
        name: '🎓 Education & Learning',
        slug: 'education-learning',
        display_order: 8
      },
      {
        name: '🎭 Entertainment & Arts',
        slug: 'entertainment-arts',
        display_order: 9
      },
      {
        name: '🔧 Professional & Home Services',
        slug: 'professional-home-services',
        display_order: 10
      }
    ];

    for (const categoryData of categories) {
      const [category, categoryCreated] =
        await Category.findOrCreate({
          where: {
            slug: categoryData.slug
          },
          defaults: {
            name: categoryData.name,
            slug: categoryData.slug,
            display_order: categoryData.display_order,
            is_active: true
          }
        });

      if (categoryCreated) {
        console.log(`✅ Category created: ${categoryData.name}`);
      } else {
        console.log(`⏭️ Category already exists: ${categoryData.name}`);
      }
    }

    // ============================================================
    // 5. CREATE / REPAIR LOCATIONS
    // ============================================================

    console.log('\n📍 Checking Tbilisi locations...');

    const neighborhoods = [
      'Vake',
      'Saburtalo',
      'Didube',
      'Chughureti',
      'Mtatsminda',
      'Sololaki',
      'Vera',
      'Avlabari',
      'Old Tbilisi',
      'Ortachala',
      'Gldani',
      'Isani',
      'Samgori',
      'Nadzaladevi',
      'Varketili'
    ];

    for (const locName of neighborhoods) {
      const slug = generateSlug(locName);

      // ----------------------------------------------------------
      // First check by name.
      // This is important because you may already have locations
      // in the database with NULL slugs.
      // ----------------------------------------------------------

      let location = await Location.findOne({
        where: {
          name: locName
        }
      });

      // ----------------------------------------------------------
      // Location already exists
      // ----------------------------------------------------------

      if (location) {
        let needsUpdate = false;

        // Repair missing slug
        if (!location.slug) {
          location.slug = slug;
          needsUpdate = true;
        }

        // Repair missing city
        if (!location.city) {
          location.city = 'Tbilisi';
          needsUpdate = true;
        }

        // Repair inactive location
        if (location.is_active === null || location.is_active === undefined) {
          location.is_active = true;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await location.save();

          console.log(
            `🔧 Location repaired: ${locName} → ${slug}`
          );
        } else {
          console.log(
            `⏭️ Location already exists: ${locName}`
          );
        }

        continue;
      }

      // ----------------------------------------------------------
      // Location does not exist → create it
      // ----------------------------------------------------------

      location = await Location.create({
        name: locName,
        slug: slug,
        city: 'Tbilisi',
        is_active: true
      });

      console.log(
        `✅ Location created: ${locName} → ${slug}`
      );
    }

    // ============================================================
    // 6. CREATE SUBSCRIPTION PLANS
    // ============================================================

    console.log('\n💳 Checking subscription plans...');

   // ============================================================
// 6. CREATE / REPAIR SUBSCRIPTION PLANS
// ============================================================

console.log('\n💳 Checking subscription plans...');

const plans = [
  {
    name: 'Free',
    slug: 'free',
    price: 0,
    currency: 'GEL',
    interval: 'monthly',
    max_photos: 3,
    max_deals: 0,
    has_menu: false,
    has_analytics: false,
    has_booking: false,
    is_featured: false,
    features: {
      basic_listing: true,
      business_info: true
    },
    display_order: 1
  },
  {
    name: 'Premium',
    slug: 'premium',
    price: 49.99,
    currency: 'GEL',
    interval: 'monthly',
    max_photos: 10,
    max_deals: 3,
    has_menu: true,
    has_analytics: true,
    has_booking: false,
    is_featured: true,
    features: {
      featured_placement: true,
      more_photos: true,
      deals: true
    },
    display_order: 2
  },
  {
    name: 'Pro',
    slug: 'pro',
    price: 99.99,
    currency: 'GEL',
    interval: 'monthly',
    max_photos: 25,
    max_deals: 10,
    has_menu: true,
    has_analytics: true,
    has_booking: true,
    is_featured: true,
    features: {
      premium: true,
      advanced_analytics: true,
      booking_tools: true
    },
    display_order: 3
  }
];

for (const planData of plans) {

  // Check existing plan by name
  let subscriptionPlan = await SubscriptionPlan.findOne({
    where: {
      name: planData.name
    }
  });

  // ----------------------------------------------------------
  // Existing plan
  // ----------------------------------------------------------

  if (subscriptionPlan) {

    let needsUpdate = false;

    if (!subscriptionPlan.slug) {
      subscriptionPlan.slug = planData.slug;
      needsUpdate = true;
    }

    if (!subscriptionPlan.currency) {
      subscriptionPlan.currency = planData.currency;
      needsUpdate = true;
    }

    if (!subscriptionPlan.interval) {
      subscriptionPlan.interval = planData.interval;
      needsUpdate = true;
    }

    if (subscriptionPlan.features === null) {
      subscriptionPlan.features = planData.features;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await subscriptionPlan.save();

      console.log(
        `🔧 Subscription plan repaired: ${planData.name} → ${planData.slug}`
      );
    } else {
      console.log(
        `⏭️ Subscription plan already exists: ${planData.name}`
      );
    }

    continue;
  }

  // ----------------------------------------------------------
  // Create new plan
  // ----------------------------------------------------------

  subscriptionPlan = await SubscriptionPlan.create({
    name: planData.name,
    slug: planData.slug,
    price: planData.price,
    currency: planData.currency,
    interval: planData.interval,
    max_photos: planData.max_photos,
    max_deals: planData.max_deals,
    has_menu: planData.has_menu,
    has_analytics: planData.has_analytics,
    has_booking: planData.has_booking,
    is_featured: planData.is_featured,
    features: planData.features,
    display_order: planData.display_order
  });

  console.log(
    `✅ Subscription plan created: ${planData.name} → ${planData.slug}`
  );
}

    for (const planData of plans) {
      const [subscriptionPlan, planCreated] =
        await SubscriptionPlan.findOrCreate({
          where: {
            name: planData.name
          },
          defaults: planData
        });

      if (planCreated) {
        console.log(
          `✅ Subscription plan created: ${planData.name}`
        );
      } else {
        console.log(
          `⏭️ Subscription plan already exists: ${planData.name}`
        );
      }
    }

    // ============================================================
    // 7. SUCCESS
    // ============================================================

    console.log('\n==============================================');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('==============================================');

    console.log('\n📋 Test Credentials:\n');

    console.log('Admin:');
    console.log('  Email:    admin@discovertbilisi.ge');
    console.log('  Password: Admin123!');

    console.log('\nRegular User:');
    console.log('  Email:    user@example.com');
    console.log('  Password: Test123!');

    console.log('\nBusiness User:');
    console.log('  Email:    business@example.com');
    console.log('  Password: Business123!');

    console.log('\n📍 Locations:');

    for (const locName of neighborhoods) {
      console.log(
        `  ${locName} → ${generateSlug(locName)}`
      );
    }

    console.log('\n==============================================\n');

  } catch (error) {
    console.error('\n❌ SEEDING ERROR');
    console.error('==============================================');
    console.error(error);
    console.error('==============================================\n');

    // Re-throw the error so app.js knows initialization failed
    throw error;
  }
};

module.exports = seedDatabase;