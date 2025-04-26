import React from "react";
import bannerImg from "../assets/images/banner.jpg";
import highProteinBreakfast from "../assets/images/ProteinBF_Dulen.jpg";
import lowCarbGrilledChicken from "../assets/images/Grilled_Dulen.jpg";
import veganDinner from "../assets/images/Vegen_Dulen.jpg";
import balancedPowerBowl from "../assets/images/P.Bowl_Dulen.jpg";

// Sample Testimonial Data
const testimonials = [
  {
    name: "Sarah D.",
    rating: 5,
    feedback: "These meals saved my week! Delicious, healthy, and super easy.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Jason M.",
    rating: 4,
    feedback: "I love the variety and quality. Perfect for my fitness goals.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Emily R.",
    rating: 5,
    feedback: "It feels like a restaurant at home! So convenient and tasty!",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Mark T.",
    rating: 4,
    feedback: "Great meals for busy days. I can’t recommend them enough!",
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

const Home = () => {
  return (
    <div className="flex flex-col items-center bg-gray-100">
      {/* Banner Image */}
      <div className="w-full h-[90vh]">
        <img
          src={bannerImg}
          alt="Home Page Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Featured Meals Section */}
      <section className="w-full px-4 py-16 text-center bg-gradient-to-r from-teal-100 to-pink-100 rounded-lg shadow-lg">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Our Top-Rated Meals
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Handpicked for taste, health, and satisfaction – here's why our
          customers love them.
        </p>

        <div className="grid gap-8 md:grid-cols-4 sm:grid-cols-2">
          {/* Meal Card 1 */}
          <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition duration-300">
            <img
              src={highProteinBreakfast}
              alt="High Protein Breakfast"
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Protein Boost Breakfast
            </h3>
            <p className="text-gray-600 text-sm">
              Packed with 25g of protein to kickstart your morning and fuel your
              energy.
            </p>
          </div>

          {/* Meal Card 2 */}
          <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition duration-300">
            <img
              src={lowCarbGrilledChicken}
              alt="Low-Carb Lunch"
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Low-Carb Grilled Chicken
            </h3>
            <p className="text-gray-600 text-sm">
              Ideal for weight-conscious eaters with lean protein and zero
              refined carbs.
            </p>
          </div>

          {/* Meal Card 3 */}
          <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition duration-300">
            <img
              src={veganDinner}
              alt="Vegan Dinner"
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Green Vegan Delight
            </h3>
            <p className="text-gray-600 text-sm">
              100% plant-based and loaded with fiber, vitamins, and flavor.
            </p>
          </div>

          {/* Meal Card 4 */}
          <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition duration-300">
            <img
              src={balancedPowerBowl}
              alt="Balanced Dinner"
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Balanced Power Bowl
            </h3>
            <p className="text-gray-600 text-sm">
              A perfect blend of protein, carbs, and veggies for an all-in-one
              dinner.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full px-4 py-16 text-center bg-gradient-to-l from-yellow-100 to-blue-200 rounded-lg shadow-lg">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
          Why Our Customers Love Us
        </h2>
        <p className="text-lg text-gray-600 mb-12 animate-fade-in delay-200">
          Real stories. Real smiles. Here’s what they’re saying about Prepped
          Meals.
        </p>

        <div className="flex gap-8 justify-center animate-fade-in-up">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center hover:scale-105 transition-transform duration-300"
            >
              <img
                src={t.image}
                alt={t.name}
                className="w-20 h-20 rounded-full mb-4 object-cover border-4 border-yellow-300"
              />
              <h3 className="text-xl font-semibold mb-2">{t.name}</h3>
              <StarRating count={t.rating} />
              <p className="mt-3 text-gray-600 italic">“{t.feedback}”</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
