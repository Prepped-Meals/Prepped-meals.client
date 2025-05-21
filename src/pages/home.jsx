import React from "react";
import bannerImg from "../assets/images/banner.jpg";
import highProteinBreakfast from "../assets/images/ProteinBF_Dulen.jpg";
import lowCarbGrilledChicken from "../assets/images/Grilled_Dulen.jpg";
import veganDinner from "../assets/images/Vegen_Dulen.jpg";
import balancedPowerBowl from "../assets/images/P.Bowl_Dulen.jpg";
import frozenIcon from "../assets/images/frozen.jpg";
import deliveryIcon from "../assets/images/delivery.jpg";
import chefIcon from "../assets/images/chef.jpg";
import nutritionIcon from "../assets/images/nutrition.jpg";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Sample Testimonial Data
const testimonials = [
  {
    name: "Selena Gomez",
    rating: 4,
    feedback:
      "Frozen butter chicken was yummy! But should've been a bit more spicy",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Milsara Rathnayaka",
    rating: 4,
    feedback: "I love the variety and quality. Perfect for my fitness goals.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Alexa Rawles",
    rating: 5,
    feedback: "It feels like a restaurant at home! So convenient and tasty!",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Madusha Silva",
    rating: 4,
    feedback: "Great meals for busy days. I can't recommend them enough!",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
  },
];

// Star Rating Component
const StarRating = ({ count }) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="text-yellow-400 text-xl">
          ★
        </span>
      ))}
    </div>
  );
};

// Frosted Glass Card Component
const FrostedCard = ({ children, className = "" }) => (
  <motion.div
    className={`backdrop-blur-md bg-white/30 rounded-xl border border-white/20 shadow-lg overflow-hidden ${className}`}
    whileHover={{
      scale: 1.02,
      boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
    }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    {children}
  </motion.div>
);

// Animated Feature Icon
//eslint-disable-next-line
const FeatureIcon = ({ icon, title, description }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView();

  React.useEffect(() => {
    if (inView) {
      controls.start({
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100 },
      });
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ y: 50, opacity: 0 }}
      animate={controls}
      className="flex flex-col items-center text-center p-6"
    >
      <div className="w-20 h-20 mb-4 flex items-center justify-center bg-white/80 rounded-full p-4 shadow-inner">
        <img src={icon} alt={title} className="w-full h-full object-contain" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const Home = () => {
  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Frozen Particle Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              width: Math.random() * 10 + 2,
              height: Math.random() * 10 + 2,
              opacity: Math.random() * 0.5 + 0.3,
            }}
            animate={{
              y: [null, Math.random() * 100 - 50],
              x: [null, Math.random() * 100 - 50],
              transition: {
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                repeatType: "reverse",
              },
            }}
          />
        ))}
      </div>
      <div className="flex flex-col items-center w-full h-full bg-gray-100">
        {/* Banner Image */}
        <div className="w-full h-full object-cover">
          <img
            src={bannerImg}
            alt="Home Page Banner"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      {/* Frozen Meal Benefits - Enhanced */}
      <section className="w-full py-20 relative bg-gradient-to-b from-white to-blue-50 overflow-hidden">
        {/* Frost particle background */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/30 backdrop-blur-sm"
              style={{
                clipPath: "polygon(50% 0%, 80% 50%, 50% 100%, 20% 50%)",
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.2 + 0.1,
                rotate: Math.random() * 360,
              }}
              animate={{
                y: [0, Math.random() * 40 - 20],
                x: [0, Math.random() * 40 - 20],
                transition: {
                  duration: Math.random() * 10 + 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 font-serif">
              Why <span className="text-blue-600">Frozen</span> is Fresher
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Our flash-freezing process locks in nutrients and flavor better
              than "fresh" meals that sit on shelves for days.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {[
              {
                icon: frozenIcon,
                title: "Flash Frozen",
                description:
                  "Preserved at Peak Freshness. Our meals are flash frozen within hours of cooking to lock in maximum flavor and nutrients. This method ensures you get the taste and texture of freshly prepared food — no preservatives needed.",
                bg: "bg-blue-50/80 backdrop-blur-sm",
                border: "border-blue-200/50",
              },
              {
                icon: deliveryIcon,
                title: "Delivered Cold",
                description:
                  "Frozen. Insulated. Fresh at Your Door. Every order is carefully packed in insulated, recyclable boxes with dry ice to maintain the ideal temperature. Whether you're home or away, your meals stay frozen and safe.",
                bg: "bg-purple-50/80 backdrop-blur-sm",
                border: "border-purple-200/50",
              },
              {
                icon: chefIcon,
                title: "Chef Crafted",
                description:
                  "Designed by Culinary Experts. Each recipe is developed and curated by experienced chefs who balance flavor with nutrition. From hearty mains to diet-specific dishes, our meals deliver restaurant-quality taste.",
                bg: "bg-teal-50/80 backdrop-blur-sm",
                border: "border-teal-200/50",
              },
              {
                icon: nutritionIcon,
                title: "Nutrition Balanced",
                description:
                  "Tailored to Your Health Goals. We calculate every macro — calories, protein, fats, and carbs — so you don't have to. Choose from meals designed for fitness, weight loss, or maintenance.",
                bg: "bg-amber-50/80 backdrop-blur-sm",
                border: "border-amber-200/50",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className={`h-full rounded-xl p-6 ${feature.bg} border ${feature.border} shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -5 }}
              >
                {/* Frost effect inside cards */}
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>

                <div className="flex flex-col h-full relative z-10">
                  <div className="w-16 h-16 mb-6 rounded-lg bg-white/90 flex items-center justify-center shadow-sm border border-gray-200/50">
                    <img
                      src={feature.icon}
                      alt={feature.title}
                      className="w-8 h-8"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 font-serif">
                    {feature.title}
                  </h3>
                  <div className="w-12 h-1 bg-green-400 mb-4 rounded-full"></div>
                  <p className="text-gray-600 mb-6 font-sans leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced decorative elements */}
          <div className="absolute -bottom-20 left-0 right-0 h-40 bg-gradient-to-t from-white via-blue-10/80 to-transparent z-80"></div>
          <div className="absolute top-1/4 -left-40 w-80 h-80 rounded-full bg-blue-100/10 blur-[80px]"></div>
          <div className="absolute bottom-1/4 -right-40 w-80 h-80 rounded-full bg-purple-100/10 blur-[80px]"></div>
        </div>
      </section>

      {/* Frozen Meal Showcase - Iceberg Inspired */}
      <section className="w-full py-20 bg-gradient-to-b from-gray-100 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Frozen. Prepped.{" "}
              <span className="text-green-600">Packed with nutrients.</span>{" "}
              Ready when you are.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join us to enjoy delicious frozen prepped meals that are packed
              with nutrients and perfectly balanced calories to keep you healthy
              and energized every day.
            </p>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                img: highProteinBreakfast,
                title: "Protein Power Breakfast",
                desc: "Packed with 5g protein, 220 calories, 28g carbs, 24g fats, 7g fiber, and 3g sugar — a nutritious meal ready in just 3 minutes!",
                tags: ["High Protein"],
                frostEffect: true,
              },
              {
                img: lowCarbGrilledChicken,
                title: "Grilled Chicken & Greens",
                desc: "Fuel your day with 30g protein, only 350 calories, and low carbs — ready in just 4 minutes!",
                tags: ["Low Carb"],
                frostEffect: true,
              },
              {
                img: veganDinner,
                title: "Vegan Harvest Bowl",
                desc: "Light and fresh vegan meal — 380 calories, packed with 4g protein, 12g carbs, 2g fats, 5g fiber, ready in just 3 minutes!",
                tags: ["Plant Based"],
                frostEffect: true,
              },
              {
                img: balancedPowerBowl,
                title: "Balanced Power Bowl",
                desc: "Wholesome all-in-one dinner with 12g protein, 15g carbs, 5g fats — ready to enjoy in just 4 minutes!",
                tags: ["All in one Dinner"],
                frostEffect: true,
              },
            ].map((meal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true, margin: "-50px" }}
                className="relative group"
              >
                <FrostedCard className="h-full">
                  <div className="relative overflow-hidden rounded-t-xl">
                    <motion.img
                      src={meal.img}
                      alt={meal.title}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                    />
                    {meal.frostEffect && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-blue-600 shadow-sm">
                          Frozen
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {meal.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{meal.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {meal.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </FrostedCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Frozen Meal Process */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 font-serif">
              From Our Kitchen to Your Home
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-serif">
              Our process ensures you get the highest quality frozen meals
              possible.
            </p>
          </motion.div>

          <div className="relative py-12">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 h-full w-0.5 bg-gradient-to-b from-green-200 to-green-100/30 transform -translate-x-1/2"></div>
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            {/* Timeline with enhanced design */}
            <div className="relative max-w-6xl mx-auto px-4">
              {/* Central line with pulse animation */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 transform -translate-x-1/2">
                <div className="absolute inset-0 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
                <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse opacity-20"></div>
              </div>

              {/* Timeline items */}
              <div className="grid md:grid-cols-2 gap-16 relative z-10">
                {[
                  {
                    step: "1",
                    title: "Chef Preparation",
                    description:
                      "Our culinary team crafts each recipe using premium, fresh ingredients sourced from trusted suppliers",
                    icon: "👨‍🍳",
                    side: "left",
                    color: "bg-blue-100",
                  },
                  {
                    step: "2",
                    title: "Flash Freezing",
                    description:
                      "Meals are rapidly frozen at -30°F within hours to lock in freshness, nutrients, and flavor",
                    icon: "❄️",
                    side: "right",
                    color: "bg-teal-100",
                  },
                  {
                    step: "3",
                    title: "Quality Assurance",
                    description:
                      "Each batch undergoes rigorous testing for taste, texture, and nutritional content",
                    icon: "🔍",
                    side: "left",
                    color: "bg-purple-100",
                  },
                  {
                    step: "4",
                    title: "Insulated Delivery",
                    description:
                      "Delivered in eco-friendly, temperature-controlled packaging to ensure frozen arrival",
                    icon: "📦",
                    side: "right",
                    color: "bg-amber-100",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className={`relative flex ${
                      item.side === "left"
                        ? "md:flex-row"
                        : "md:flex-row-reverse"
                    } items-start gap-6`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    {/* Timeline dot with animation */}
                    <div className="hidden md:block absolute top-6 left-1/2 w-5 h-5 bg-green-500 rounded-full transform -translate-x-1/2 z-10 shadow-lg"></div>
                    <div className="hidden md:block absolute top-6 left-1/2 w-5 h-5 bg-green-400 rounded-full transform -translate-x-1/2 z-0 animate-ping"></div>

                    {/* Card container */}
                    <div
                      className={`flex-1 ${item.color} rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative`}
                    >
                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/30 rounded-bl-2xl"></div>

                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm">
                            {item.icon}
                          </div>
                          <span className="text-sm font-bold text-green-600 tracking-wider">
                            STEP {item.step}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Floating decoration elements */}
              <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-green-100/20 blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-teal-100/20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials with Ice Effect */}
      <section className="w-full py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 font-serif">
              What Our <span className="text-green-600">Customers</span> Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real people enjoying real meals - frozen never tasted so fresh!
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <FrostedCard className="h-full p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-800">{t.name}</h4>
                      <StarRating count={t.rating} />
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{t.feedback}"</p>
                  <div className="mt-4 pt-4 border-t border-white/20">
                  </div>
                </FrostedCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
