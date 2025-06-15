import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Download,
  RefreshCw,
  Phone,
  Mail,
  Car,
  IndianRupee,
  Search,
  Filter,
  MoreVertical,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface PolicyData {
  id: string;
  policyNumber: string;
  vehicleDetails: {
    make: string;
    model: string;
    registrationNumber: string;
    year: number;
  };
  insurer: {
    name: string;
    logo: string;
    contactPhone: string;
    contactEmail: string;
  };
  policyType: 'Comprehensive' | 'Third Party' | 'Own Damage';
  status: 'Active' | 'Expired' | 'Expiring Soon' | 'Claimed';
  startDate: string;
  endDate: string;
  premium: {
    annual: number;
    paid: number;
    pending: number;
  };
  idv: number;
  coverage: {
    ownDamage: number;
    thirdParty: number;
    personalAccident: number;
  };
  addOns: string[];
  claims: {
    total: number;
    settled: number;
    pending: number;
  };
  documents: {
    policyDocument: string;
    receiptCopy: string;
  };
  renewalDate: string;
  lastUpdated: string;
}

const DashboardPolicies = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<PolicyData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'expiring' | 'claimed'>('all');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyData | null>(null);
  const [isPolicyDetailOpen, setIsPolicyDetailOpen] = useState(false);

  // Sample data - TODO: Replace with API calls
  useEffect(() => {
    const samplePolicies: PolicyData[] = [
      {
        id: '1',
        policyNumber: 'HIC/2024/12345678',
        vehicleDetails: {
          make: 'Honda',
          model: 'City',
          registrationNumber: 'MH12AB1234',
          year: 2022
        },
        insurer: {
          name: 'HDFC ERGO',
          logo: '/api/placeholder/40/40',
          contactPhone: '1800-266-4444',
          contactEmail: 'support@hdfcergo.com'
        },
        policyType: 'Comprehensive',
        status: 'Active',
        startDate: '2024-03-15',
        endDate: '2025-03-15',
        premium: {
          annual: 18500,
          paid: 18500,
          pending: 0
        },
        idv: 850000,
        coverage: {
          ownDamage: 850000,
          thirdParty: 750000,
          personalAccident: 200000
        },
        addOns: ['Zero Depreciation', 'Engine Protection', 'Roadside Assistance'],
        claims: {
          total: 1,
          settled: 1,
          pending: 0
        },
        documents: {
          policyDocument: '/documents/policy1.pdf',
          receiptCopy: '/documents/receipt1.pdf'
        },
        renewalDate: '2025-03-15',
        lastUpdated: '2 days ago'
      },
      {
        id: '2',
        policyNumber: 'IFFCO/2023/87654321',
        vehicleDetails: {
          make: 'Maruti Suzuki',
          model: 'Swift',
          registrationNumber: 'DL08CD5678',
          year: 2020
        },
        insurer: {
          name: 'IFFCO Tokio',
          logo: '/api/placeholder/40/40',
          contactPhone: '1800-103-5499',
          contactEmail: 'customercare@iffcotokio.co.in'
        },
        policyType: 'Comprehensive',
        status: 'Expiring Soon',
        startDate: '2023-07-20',
        endDate: '2024-07-20',
        premium: {
          annual: 12500,
          paid: 12500,
          pending: 0
        },
        idv: 525000,
        coverage: {
          ownDamage: 525000,
          thirdParty: 750000,
          personalAccident: 150000
        },
        addOns: ['Zero Depreciation', 'Roadside Assistance'],
        claims: {
          total: 0,
          settled: 0,
          pending: 0
        },
        documents: {
          policyDocument: '/documents/policy2.pdf',
          receiptCopy: '/documents/receipt2.pdf'
        },
        renewalDate: '2024-07-20',
        lastUpdated: '1 week ago'
      },
      {
        id: '3',
        policyNumber: 'BMW/2023/45678901',
        vehicleDetails: {
          make: 'BMW',
          model: 'X1',
          registrationNumber: 'KA05EF9012',
          year: 2023
        },
        insurer: {
          name: 'BMW Insurance',
          logo: '/api/placeholder/40/40',
          contactPhone: '1800-102-2269',
          contactEmail: 'insurance@bmw.in'
        },
        policyType: 'Comprehensive',
        status: 'Active',
        startDate: '2023-12-10',
        endDate: '2024-12-10',
        premium: {
          annual: 45000,
          paid: 45000,
          pending: 0
        },
        idv: 4200000,
        coverage: {
          ownDamage: 4200000,
          thirdParty: 750000,
          personalAccident: 1000000
        },
        addOns: ['Zero Depreciation', 'Engine Protection', 'Roadside Assistance', 'Key Replacement'],
        claims: {
          total: 0,
          settled: 0,
          pending: 0
        },
        documents: {
          policyDocument: '/documents/policy3.pdf',
          receiptCopy: '/documents/receipt3.pdf'
        },
        renewalDate: '2024-12-10',
        lastUpdated: '5 days ago'
      }
    ];
    setPolicies(samplePolicies);
  }, []);

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = 
      policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.vehicleDetails.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.vehicleDetails.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.vehicleDetails.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.insurer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && policy.status === 'Active') ||
      (filterStatus === 'expired' && policy.status === 'Expired') ||
      (filterStatus === 'expiring' && policy.status === 'Expiring Soon') ||
      (filterStatus === 'claimed' && policy.status === 'Claimed');
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeColor = (status: PolicyData['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Expiring Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Claimed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: PolicyData['status']) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Expired':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'Expiring Soon':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Claimed':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysToExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Insurance Policies</h1>
          <p className="text-gray-600">Manage your vehicle insurance coverage and claims</p>
        </div>        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync Policies
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by policy number, vehicle, or insurer..."
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

      {/* Policies Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredPolicies.map((policy, index) => (
            <motion.div
              key={policy.id}
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
                        <Shield className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {policy.vehicleDetails.make} {policy.vehicleDetails.model}
                        </h3>
                        <p className="text-sm text-gray-600 font-mono">{policy.policyNumber}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                          setSelectedPolicy(policy);
                          setIsPolicyDetailOpen(true);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download Policy
                        </DropdownMenuItem>                        <DropdownMenuItem>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renew Policy
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Insurer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status and Expiry */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(policy.status)}
                      <Badge className={getStatusBadgeColor(policy.status)}>
                        {policy.status}
                      </Badge>
                    </div>
                    {policy.status === 'Expiring Soon' && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-yellow-600">
                          {getDaysToExpiry(policy.endDate)} days left
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Insurer */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{policy.insurer.name}</p>
                        <p className="text-xs text-gray-600">{policy.policyType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Registration</p>
                      <p className="font-mono font-medium">{policy.vehicleDetails.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Policy Period</p>
                      <p className="font-medium">{formatDate(policy.startDate)} - {formatDate(policy.endDate)}</p>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-gray-600">Annual Premium</p>
                      <p className="font-semibold text-blue-600">{formatCurrency(policy.premium.annual)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Insured Value (IDV)</p>
                      <p className="font-semibold text-green-600">{formatCurrency(policy.idv)}</p>
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Add-ons ({policy.addOns.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {policy.addOns.slice(0, 3).map((addon, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {addon}
                        </Badge>
                      ))}
                      {policy.addOns.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{policy.addOns.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                      setSelectedPolicy(policy);
                      setIsPolicyDetailOpen(true);
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>                    {policy.status === 'Expiring Soon' && (
                      <Button size="sm" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Renew
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPolicies.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No policies found' : 'No policies yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Add your vehicles to start tracking insurance policies'
            }
          </p>
        </motion.div>
      )}

      {/* Policy Detail Modal */}
      <Dialog open={isPolicyDetailOpen} onOpenChange={setIsPolicyDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Policy Details</DialogTitle>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-6">
              {/* Vehicle & Policy Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Vehicle Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Make & Model:</span> {selectedPolicy.vehicleDetails.make} {selectedPolicy.vehicleDetails.model}</p>
                    <p><span className="text-gray-600">Year:</span> {selectedPolicy.vehicleDetails.year}</p>
                    <p><span className="text-gray-600">Registration:</span> {selectedPolicy.vehicleDetails.registrationNumber}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Policy Info</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Policy Number:</span> {selectedPolicy.policyNumber}</p>
                    <p><span className="text-gray-600">Type:</span> {selectedPolicy.policyType}</p>
                    <p><span className="text-gray-600">Insurer:</span> {selectedPolicy.insurer.name}</p>
                  </div>
                </div>
              </div>

              {/* Coverage Details */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Coverage Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50">
                    <p className="text-sm text-blue-600 font-medium">Own Damage</p>
                    <p className="text-lg font-bold text-blue-800">{formatCurrency(selectedPolicy.coverage.ownDamage)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50">
                    <p className="text-sm text-green-600 font-medium">Third Party</p>
                    <p className="text-lg font-bold text-green-800">{formatCurrency(selectedPolicy.coverage.thirdParty)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50">
                    <p className="text-sm text-purple-600 font-medium">Personal Accident</p>
                    <p className="text-lg font-bold text-purple-800">{formatCurrency(selectedPolicy.coverage.personalAccident)}</p>
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Add-ons</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPolicy.addOns.map((addon, i) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      {addon}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Insurer Contact</h4>
                <div className="flex gap-4">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    {selectedPolicy.insurer.contactPhone}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact via Email
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPolicies;
