export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const inventory = [
  { group: 'A+', rbc: 42, plasma: 28, platelets: 15, whole: 8, expiringSoon: 3 },
  { group: 'A-', rbc: 12, plasma: 8, platelets: 5, whole: 2, expiringSoon: 1 },
  { group: 'B+', rbc: 35, plasma: 22, platelets: 18, whole: 6, expiringSoon: 2 },
  { group: 'B-', rbc: 8, plasma: 5, platelets: 3, whole: 1, expiringSoon: 0 },
  { group: 'AB+', rbc: 18, plasma: 14, platelets: 9, whole: 4, expiringSoon: 1 },
  { group: 'AB-', rbc: 4, plasma: 3, platelets: 2, whole: 0, expiringSoon: 0 },
  { group: 'O+', rbc: 55, plasma: 40, platelets: 25, whole: 12, expiringSoon: 5 },
  { group: 'O-', rbc: 6, plasma: 4, platelets: 3, whole: 1, expiringSoon: 1 },
]

export const donors = [
  { id: 'D001', name: 'Arjun Sharma', bloodGroup: 'O+', age: 28, city: 'Bhubaneswar', donations: 8, score: 94, lastDonation: '2025-03-12', eligible: true, phone: '9876543210' },
  { id: 'D002', name: 'Priya Patel', bloodGroup: 'A+', age: 24, city: 'Cuttack', donations: 5, score: 87, lastDonation: '2025-01-20', eligible: true, phone: '9765432109' },
  { id: 'D003', name: 'Rohit Mishra', bloodGroup: 'B-', age: 32, city: 'Bhubaneswar', donations: 12, score: 98, lastDonation: '2025-04-05', eligible: false, phone: '9654321098' },
  { id: 'D004', name: 'Sneha Nair', bloodGroup: 'AB-', age: 27, city: 'Puri', donations: 3, score: 82, lastDonation: '2025-02-14', eligible: true, phone: '9543210987' },
  { id: 'D005', name: 'Karthik Reddy', bloodGroup: 'O-', age: 35, city: 'Bhubaneswar', donations: 15, score: 99, lastDonation: '2025-03-28', eligible: false, phone: '9432109876' },
  { id: 'D006', name: 'Meera Krishnan', bloodGroup: 'A-', age: 29, city: 'Khordha', donations: 7, score: 91, lastDonation: '2025-01-10', eligible: true, phone: '9321098765' },
]

export const requests = [
  { id: 'R001', patient: 'Rahul Das', hospital: 'AIIMS Bhubaneswar', bloodGroup: 'O+', units: 3, component: 'RBC', urgency: 'Critical', status: 'Fulfilled', date: '2025-06-10', assignedBank: 'State Blood Bank' },
  { id: 'R002', patient: 'Sunita Mohanty', hospital: 'SCB Medical College', bloodGroup: 'AB-', units: 2, component: 'Plasma', urgency: 'Urgent', status: 'Processing', date: '2025-06-14', assignedBank: 'Red Cross Cuttack' },
  { id: 'R003', patient: 'Bikram Sahu', hospital: 'Apollo Bhubaneswar', bloodGroup: 'B+', units: 4, component: 'Platelets', urgency: 'Normal', status: 'Pending', date: '2025-06-15', assignedBank: null },
  { id: 'R004', patient: 'Ananya Swain', hospital: 'KIMS Hospital', bloodGroup: 'A+', units: 1, component: 'Whole Blood', urgency: 'Critical', status: 'In Transit', date: '2025-06-15', assignedBank: 'State Blood Bank' },
  { id: 'R005', patient: 'Deba Prasad', hospital: 'AIIMS Bhubaneswar', bloodGroup: 'O-', units: 2, component: 'RBC', urgency: 'Urgent', status: 'Allocated', date: '2025-06-16', assignedBank: 'Tata Blood Centre' },
]

export const hospitals = [
  { id: 'H001', name: 'AIIMS Bhubaneswar', type: 'Government', beds: 960, city: 'Bhubaneswar', verified: true, activeRequests: 3, lat: 20.2961, lng: 85.8245 },
  { id: 'H002', name: 'SCB Medical College', type: 'Government', beds: 1200, city: 'Cuttack', verified: true, activeRequests: 5, lat: 20.4686, lng: 85.8792 },
  { id: 'H003', name: 'Apollo Hospitals', type: 'Private', beds: 350, city: 'Bhubaneswar', verified: true, activeRequests: 1, lat: 20.2961, lng: 85.8396 },
  { id: 'H004', name: 'KIMS Hospital', type: 'Private', beds: 450, city: 'Bhubaneswar', verified: true, activeRequests: 2, lat: 20.3061, lng: 85.8195 },
]

export const bloodBanks = [
  { id: 'BB001', name: 'State Blood Bank', city: 'Bhubaneswar', license: 'SBBHBW001', accredited: true, totalUnits: 248, lastUpdated: '2025-06-16', contact: '0674-2390001' },
  { id: 'BB002', name: 'Red Cross Blood Centre', city: 'Cuttack', license: 'RCCUTK002', accredited: true, totalUnits: 183, lastUpdated: '2025-06-15', contact: '0671-2501234' },
  { id: 'BB003', name: 'Tata Blood Centre', city: 'Bhubaneswar', license: 'TBCBHBW003', accredited: true, totalUnits: 95, lastUpdated: '2025-06-16', contact: '0674-2398765' },
]

export const demandForecast = [
  { month: 'Jan', actual: 180, forecast: 175, shortage: false },
  { month: 'Feb', actual: 165, forecast: 170, shortage: false },
  { month: 'Mar', actual: 195, forecast: 190, shortage: false },
  { month: 'Apr', actual: 210, forecast: 205, shortage: false },
  { month: 'May', actual: 245, forecast: 240, shortage: true },
  { month: 'Jun', actual: 220, forecast: 280, shortage: true },
  { month: 'Jul', actual: null, forecast: 310, shortage: true },
  { month: 'Aug', actual: null, forecast: 295, shortage: false },
]

export const donationStats = [
  { month: 'Jan', donations: 145, camps: 8 },
  { month: 'Feb', donations: 132, camps: 6 },
  { month: 'Mar', donations: 178, camps: 10 },
  { month: 'Apr', donations: 196, camps: 12 },
  { month: 'May', donations: 221, camps: 14 },
  { month: 'Jun', donations: 198, camps: 11 },
]

export const recentActivity = [
  { id: 1, type: 'donation', message: 'Arjun Sharma donated O+ at State Blood Bank', time: '2 min ago', icon: 'heart' },
  { id: 2, type: 'request', message: 'AIIMS Bhubaneswar raised critical O- request', time: '8 min ago', icon: 'alert' },
  { id: 3, type: 'delivery', message: 'Delivery #DL004 arrived at Apollo Hospitals', time: '15 min ago', icon: 'truck' },
  { id: 4, type: 'alert', message: 'AB- stock critically low at Red Cross Centre', time: '22 min ago', icon: 'warning' },
  { id: 5, type: 'camp', message: 'New donation camp registered — ITER College', time: '1 hr ago', icon: 'calendar' },
  { id: 6, type: 'donation', message: 'Meera Krishnan donated A- at Tata Blood Centre', time: '2 hr ago', icon: 'heart' },
]

export const deliveries = [
  { id: 'DL001', from: 'State Blood Bank', to: 'AIIMS Bhubaneswar', bloodGroup: 'O+', units: 3, status: 'Delivered', driver: 'Ramesh Kumar', time: '09:45' },
  { id: 'DL002', from: 'Red Cross Cuttack', to: 'SCB Medical', bloodGroup: 'AB-', units: 2, status: 'In Transit', driver: 'Suresh Babu', time: '11:20', eta: '25 min' },
  { id: 'DL003', from: 'Tata Blood Centre', to: 'KIMS Hospital', bloodGroup: 'A+', units: 1, status: 'Preparing', driver: 'Dinesh Singh', time: '13:00' },
]

export const camps = [
  { id: 'C001', name: 'ITER College Blood Drive', date: '2025-06-20', venue: 'ITER Campus, Bhubaneswar', organizer: 'NSS Unit', target: 100, registered: 68 },
  { id: 'C002', name: 'Corporate Drive — Infosys', date: '2025-06-22', venue: 'Infosys SEZ, Patia', organizer: 'Infosys CSR', target: 150, registered: 112 },
  { id: 'C003', name: 'Community Camp — Puri', date: '2025-06-25', venue: 'Town Hall, Puri', organizer: 'Rotary Club', target: 80, registered: 44 },
]
