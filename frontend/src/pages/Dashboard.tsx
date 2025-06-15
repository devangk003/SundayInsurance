import React, { useState, useEffect, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { Car as CarIcon, FileText, MessageCircle, Settings as SettingsIcon } from 'lucide-react';
import InsuranceHero from '@/components/InsuranceHero'; // iOS-style hero insurance component

// iOS-inspired paper-textured background color
const pageStyle = {
  backgroundColor: '#FBF8F0',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23EFE9DE' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
};

// TypeScript interfaces
interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
}
interface Policy {
  _id: string;
  carId: string;
  provider: string;
  status: string;
  expiryDate: string;
}
interface Reply {
  _id: string;
  content: string;
  username: string;
  timestamp: string;
}
interface Post {
  _id: string;
  title: string;
  content: string;
  username: string;
  timestamp: string;
  replies: Reply[];
}
interface User {
  _id: string;
  name: string;
  email: string;
}

type Section = 'dashboard' | 'forum' | 'settings';

export default function Dashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [section, setSection] = useState<Section>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for adding a car
  const [newCar, setNewCar] = useState({ make: '', model: '', year: '', vin: '' });

  // Form state for posts and settings
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [settingsForm, setSettingsForm] = useState({ name: '', email: '' });

  // Fetch initial data
  useEffect(() => {
    async function fetchAll() {
      try {
        const [carRes, policyRes, userRes] = await Promise.all([
          fetch('/api/cars'),
          fetch('/api/policies'),
          fetch('/api/user')
        ]);
        if (!carRes.ok || !policyRes.ok || !userRes.ok) throw new Error('Failed to load data');
        const carsJson: Car[] = await carRes.json();
        const policiesJson: Policy[] = await policyRes.json();
        const userJson: User = await userRes.json();
        setCars(carsJson);
        setPolicies(policiesJson);
        setUserData(userJson);
        setSettingsForm({ name: userJson.name, email: userJson.email });
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Fetch forum posts
  useEffect(() => {
    if (section !== 'forum') return;
    async function loadPosts() {
      try {
        const res = await fetch('http://localhost:4567/api/category/1');
        if (!res.ok) throw new Error('Failed to load posts');
        const data = await res.json();
        setPosts(data.topics || []);
      } catch (err) {
        setError((err as Error).message);
      }
    }
    loadPosts();
  }, [section]);

  // Handlers
  const handleAddCar = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCar, _id: uuidv4(), year: Number(newCar.year) })
      });
      if (!res.ok) throw new Error('Failed to add car');
      const car: Car = await res.json();
      setCars(prev => [car, ...prev]);
      setNewCar({ make: '', model: '', year: '', vin: '' });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleNewPost = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4567/api/v3/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NODEBB_API_TOKEN}`
        },
        body: JSON.stringify({ title: newPost.title, content: newPost.content })
      });
      if (!res.ok) throw new Error('Failed to create topic');
      setNewPost({ title: '', content: '' });
      // reload posts
      setSection('forum');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSettingsSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      if (!res.ok) throw new Error('Failed to update user');
      const updated: User = await res.json();
      setUserData(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full" /></div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div style={pageStyle} className="min-h-screen p-4 font-sans text-gray-600">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Insurance Hero */}
        <InsuranceHero />

        {/* iOS-style sticky section toggles */}
        <nav className="flex justify-around bg-white rounded-full shadow-md py-2">
          {(['dashboard', 'forum', 'settings'] as Section[]).map(sec => (
            <button
              key={sec}
              onClick={() => setSection(sec)}
              className={`px-4 py-1 rounded-full transition-all duration-300 font-medium ${section === sec ? 'bg-blue-500 text-white shadow-lg' : 'hover:bg-blue-100'}`}
            >
              {sec.charAt(0).toUpperCase() + sec.slice(1)}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="bg-transparent">
          <AnimatePresence exitBeforeEnter>
            {section === 'dashboard' && (
              <motion.div
                key="dash"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Car/Policy Tracker */}
                <h2 className="text-xl font-bold mb-2">Your Garage</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cars.map(car => {
                    const policy = policies.find(p => p.carId === car._id);
                    return (
                      <div key={car._id} className="bg-white rounded-lg shadow-sm p-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <CarIcon className="h-5 w-5 text-blue-500" />
                          <h3 className="font-semibold text-lg text-gray-800">{car.make} {car.model}</h3>
                        </div>
                        <p className="text-sm">Year: {car.year}</p>
                        <p className="text-sm break-all">VIN: {car.vin}</p>
                        {policy && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium">Provider: {policy.provider}</p>
                            <p className="text-sm">Status: {policy.status}</p>
                            <p className="text-sm">Expires: {new Date(policy.expiryDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Car Form */}
                <form onSubmit={handleAddCar} className="bg-white rounded-lg shadow-sm p-4 mt-6 space-y-3">
                  <h2 className="text-lg font-bold">Add New Vehicle</h2>
                  <div className="flex flex-col md:flex-row gap-2">
                    {(['make', 'model', 'year', 'vin'] as Array<keyof typeof newCar>).map(field => (
                      <input
                        key={field}
                        type={field === 'year' ? 'number' : 'text'}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={(newCar as any)[field]}
                        onChange={e => setNewCar({ ...newCar, [field]: e.target.value })}
                        className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200 transition duration-300"
                        required
                      />
                    ))}
                  </div>
                  <button type="submit" className="w-full bg-blue-500 text-white rounded-full py-2 font-medium transition-all duration-300 hover:bg-blue-600">
                    Add Vehicle
                  </button>
                </form>
              </motion.div>
            )}

            {section === 'forum' && (
              <motion.div
                key="forum"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-2">Community Forum</h2>
                <form onSubmit={handleNewPost} className="bg-white rounded-lg shadow-sm p-4 mb-4 space-y-2">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newPost.title}
                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200 transition duration-300"
                    required
                  />
                  <textarea
                    placeholder="Content"
                    value={newPost.content}
                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 h-24 focus:ring focus:ring-blue-200 transition duration-300"
                    required
                  />
                  <button type="submit" className="bg-blue-500 text-white rounded-full px-4 py-2 font-medium transition-all duration-300 hover:bg-blue-600">
                    Post Topic
                  </button>
                </form>
                <div className="space-y-4">
                  {posts.map(post => (
                    <div key={post._id} className="bg-white rounded-lg shadow-sm p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">{post.title}</h3>
                        <span className="text-xs text-gray-500">{post.username}</span>
                      </div>
                      <p className="text-sm text-gray-700">{post.content}</p>
                      <p className="text-xs text-gray-400">{post.timestamp}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {section === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-2">Profile Settings</h2>
                <form onSubmit={handleSettingsSave} className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">Name</label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200 transition duration-300"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200 transition duration-300"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-500 text-white rounded-full py-2 font-medium transition-all duration-300 hover:bg-blue-600">
                    Save Changes
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
