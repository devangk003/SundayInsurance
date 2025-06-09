import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Users, Shield, Clock, Award, Phone, Mail, MapPin } from "lucide-react";

const AboutUs = () => {
  const values = [
    {
      icon: <Shield className="w-8 h-8 text-emerald-600" />,
      title: "Trust & Security",
      description: "We prioritize the security of your personal information and ensure all insurance partners are verified and reliable."
    },
    {
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      title: "Customer First",
      description: "Your satisfaction is our priority. We provide personalized service and support throughout your insurance journey."
    },
    {
      icon: <Clock className="w-8 h-8 text-emerald-600" />,
      title: "Quick & Efficient",
      description: "Get instant quotes and compare multiple insurance options in minutes, not hours or days."
    },
    {
      icon: <Award className="w-8 h-8 text-emerald-600" />,
      title: "Best Value",
      description: "We help you find the most competitive rates without compromising on coverage quality."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "/api/placeholder/150/150",
      description: "Former insurance executive with 15+ years of experience in the industry."
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      image: "/api/placeholder/150/150",
      description: "Tech innovator focused on making insurance platform simple and accessible."
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Customer Success",
      image: "/api/placeholder/150/150",
      description: "Dedicated to ensuring every customer finds the perfect insurance solution."
    }
  ];

  const stats = [
    { number: "500K+", label: "Happy Customers" },
    { number: "50+", label: "Insurance Partners" },
    { number: "₹2B+", label: "Claims Processed" },
    { number: "4.8/5", label: "Customer Rating" }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="font-bold text-2xl bg-white/10 backdrop-blur-sm border border-slate-200 px-4 py-2 rounded-lg">
                <span className="text-emerald-500">Sunday</span>
                <span className="text-slate-800">Insurance</span>
              </a>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-slate-600 hover:text-emerald-500 transition-colors">Home</a>
              <a href="#" className="text-slate-600 hover:text-emerald-500 transition-colors">Car Insurance</a>
              <a href="#" className="text-slate-600 hover:text-emerald-500 transition-colors">Business</a>
              <a href="#" className="text-slate-600 hover:text-emerald-500 transition-colors">How It Works</a>
              <a href="/about" className="text-emerald-500 font-medium">About Us</a>
            </nav>

            {/* CTA */}
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full"
              >
                Get Quote
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-5xl font-bold text-slate-800 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              About <span className="text-emerald-500">SundayInsurance</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-slate-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We're revolutionizing the way people find and compare insurance. Our mission is to make 
              insurance accessible, transparent, and affordable for everyone.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl font-bold text-emerald-500 mb-2">{stat.number}</div>
                <div className="text-slate-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-slate-800 mb-6">Our Story</h2>
              <p className="text-lg text-slate-600 mb-6">
                SundayInsurance was founded with a simple belief: finding the right insurance 
                shouldn't be complicated, time-consuming, or overwhelming. We recognized that 
                traditional insurance shopping was broken – filled with endless paperwork, 
                confusing jargon, and hidden fees.
              </p>
              <p className="text-lg text-slate-600 mb-6">
                Our team of insurance experts and technology professionals came together to 
                create a platform that puts customers first. We leverage smart technology 
                to instantly compare quotes from top insurers, ensuring you get the best 
                coverage at the most competitive rates.
              </p>
              <p className="text-lg text-slate-600">
                Today, we're proud to serve over 500,000 customers across India, helping 
                them save money and find peace of mind through comprehensive insurance coverage.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src="/api/placeholder/600/400" 
                alt="Our team working" 
                className="rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Our Values</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape how we serve our customers every day.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">{value.title}</h3>
                    <p className="text-slate-600">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Meet Our Team</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our dedicated team combines deep insurance expertise with cutting-edge technology 
              to deliver exceptional service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{member.name}</h3>
                    <p className="text-emerald-600 font-medium mb-3">{member.role}</p>
                    <p className="text-slate-600">{member.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Get in Touch</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Have questions? We're here to help. Reach out to us through any of these channels.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-4">
                <Phone className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Phone</h3>
              <p className="text-slate-600">+91 1800-123-4567</p>
              <p className="text-sm text-slate-500">Mon-Fri 9AM-6PM</p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-4">
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Email</h3>
              <p className="text-slate-600">support@sundayinsurance.com</p>
              <p className="text-sm text-slate-500">24/7 Response</p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-4">
                <MapPin className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Office</h3>
              <p className="text-slate-600">Mumbai, Maharashtra</p>
              <p className="text-sm text-slate-500">India</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-8">
              Ready to Find Your Perfect Insurance?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of satisfied customers who trust SundayInsurance for their coverage needs.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-white hover:bg-gray-100 text-emerald-600 px-8 py-3 rounded-full text-lg inline-flex items-center"
            >
              Get Started Today
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="text-2xl font-bold">
                  <span className="text-emerald-500">Sunday</span>
                  <span className="text-slate-800">Insurance</span>
                </span>
              </div>
              <p className="text-slate-600 mb-6">
                SundayInsurance offers comprehensive insurance solutions to
                individuals, families and businesses
              </p>
              <p className="text-slate-400 text-sm">
                © SundayInsurance 2025 All rights reserved
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Personal</h4>
              <div className="space-y-2">
                <p className="text-slate-600">Car Insurance</p>
                <p className="text-slate-600">Privacy Policy</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Business</h4>
              <div className="space-y-2">
                <p className="text-slate-600">Commercial Insurance</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Support</h4>
              <div className="space-y-2">
                <p className="text-slate-600">Help Center</p>
                <p className="text-slate-600">Terms & Conditions</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Connect</h4>
              <div className="flex space-x-4 mt-6">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 text-sm">in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
