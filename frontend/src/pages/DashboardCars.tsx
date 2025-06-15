import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  FileText,
  Shield,
  Fuel,
  Gauge,
  MapPin,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';

interface CarData {
  id: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'Electric';
  variant: string;
  mileage: number;
  location: string;
  policyStatus: 'Active' | 'Expired' | 'Expiring Soon';
  policyExpiryDate: string;
  idv: string;
  imageUrl?: string;
  lastUpdated: string;
}

interface AddCarFormData {
  make: string;
  model: string;
  year: string;
  registrationNumber: string;
  fuelType: string;
  variant: string;
}

const DashboardCars = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<CarData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'expiring'>('all');
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);
  const [formData, setFormData] = useState<AddCarFormData>({
    make: '',
    model: '',
    year: '',
    registrationNumber: '',
    fuelType: 'Petrol',
    variant: ''
  });

  // Check if user came from quick action
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsAddCarModalOpen(true);
      setSearchParams({}); // Clear the search param
    }
  }, [searchParams, setSearchParams]);

  // Sample data - TODO: Replace with API calls
  useEffect(() => {
    const sampleCars: CarData[] = [
      {
        id: '1',
        make: 'Honda',
        model: 'City',
        year: 2022,
        registrationNumber: 'MH12AB1234',
        fuelType: 'Petrol',
        variant: 'VX CVT',
        mileage: 18.5,
        location: 'Mumbai, Maharashtra',
        policyStatus: 'Active',
        policyExpiryDate: '2025-03-15',
        idv: '₹8,50,000',
        lastUpdated: '2 days ago'
      },
      {
        id: '2',
        make: 'Maruti Suzuki',
        model: 'Swift',
        year: 2020,
        registrationNumber: 'DL08CD5678',
        fuelType: 'Petrol',
        variant: 'ZXI',
        mileage: 21.2,
        location: 'Delhi',
        policyStatus: 'Expiring Soon',
        policyExpiryDate: '2024-07-20',
        idv: '₹5,25,000',
        lastUpdated: '1 week ago'
      },
      {
        id: '3',
        make: 'BMW',
        model: 'X1',
        year: 2023,
        registrationNumber: 'KA05EF9012',
        fuelType: 'Diesel',
        variant: 'sDrive20d xLine',
        mileage: 16.5,
        location: 'Bangalore, Karnataka',
        policyStatus: 'Active',
        policyExpiryDate: '2025-12-10',
        idv: '₹42,00,000',
        lastUpdated: '5 days ago'
      }
    ];
    setCars(sampleCars);
  }, []);

  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && car.policyStatus === 'Active') ||
      (filterStatus === 'expired' && car.policyStatus === 'Expired') ||
      (filterStatus === 'expiring' && car.policyStatus === 'Expiring Soon');
    
    return matchesSearch && matchesFilter;
  });

  const handleAddCar = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to add car
    console.log('Adding car:', formData);
    setIsAddCarModalOpen(false);
    setFormData({
      make: '',
      model: '',
      year: '',
      registrationNumber: '',
      fuelType: 'Petrol',
      variant: ''
    });
  };

  const getStatusBadgeColor = (status: CarData['policyStatus']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Expiring Soon':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFuelTypeIcon = (fuelType: CarData['fuelType']) => {
    return <Fuel className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Cars</h1>
          <p className="text-gray-600">Manage your vehicle fleet and insurance policies</p>
        </div>
        <Button 
          onClick={() => setIsAddCarModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by make, model, or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-0 bg-white/50 backdrop-blur-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'expiring' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('expiring')}
              >
                Expiring
              </Button>
              <Button
                variant={filterStatus === 'expired' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('expired')}
              >
                Expired
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCars.map((car, index) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <Car className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{car.make} {car.model}</h3>
                        <p className="text-sm text-gray-600">{car.year} • {car.variant}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          View Policy
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Vehicle
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Registration Number */}
                  <div className="p-3 rounded-lg bg-gray-50 border-2 border-dashed border-gray-200">
                    <p className="text-center font-mono text-lg font-bold text-gray-800">
                      {car.registrationNumber}
                    </p>
                  </div>

                  {/* Policy Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Policy Status</span>
                    <Badge className={getStatusBadgeColor(car.policyStatus)}>
                      {car.policyStatus}
                    </Badge>
                  </div>

                  {/* Vehicle Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      {getFuelTypeIcon(car.fuelType)}
                      <span className="text-gray-600">{car.fuelType}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gauge className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">{car.mileage} km/l</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600 truncate">{car.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">{car.policyExpiryDate}</span>
                    </div>
                  </div>

                  {/* IDV */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Insured Value</span>
                    <span className="font-semibold text-blue-600">{car.idv}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Shield className="h-4 w-4 mr-2" />
                      View Policy
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Renew
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredCars.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No vehicles found' : 'No vehicles yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Add your first vehicle to get started with insurance tracking'
            }
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <Button 
              onClick={() => setIsAddCarModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Vehicle
            </Button>
          )}
        </motion.div>
      )}

      {/* Add Car Modal */}
      <Dialog open={isAddCarModalOpen} onOpenChange={setIsAddCarModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                <Input
                  required
                  value={formData.make}
                  onChange={(e) => setFormData({...formData, make: e.target.value})}
                  placeholder="e.g., Honda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <Input
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="e.g., City"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <Input
                  required
                  type="number"
                  min="2000"
                  max="2024"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  placeholder="2022"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.fuelType}
                  onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
              <Input
                required
                value={formData.registrationNumber}
                onChange={(e) => setFormData({...formData, registrationNumber: e.target.value.toUpperCase()})}
                placeholder="MH12AB1234"
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Variant</label>
              <Input
                required
                value={formData.variant}
                onChange={(e) => setFormData({...formData, variant: e.target.value})}
                placeholder="e.g., VX CVT"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddCarModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                Add Vehicle
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardCars;
