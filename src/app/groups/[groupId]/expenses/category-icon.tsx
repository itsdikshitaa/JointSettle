import { Category } from '@prisma/client'
import {
  Armchair,
  Baby,
  Backpack,
  Banknote,
  Bed,
  Bike,
  BookOpen,
  Brain,
  Brush,
  Bus,
  BusFront,
  Camera,
  Car,
  CarTaxiFront,
  Cat,
  Clapperboard,
  Coffee,
  Crown,
  CupSoda,
  Dices,
  DollarSign,
  Dumbbell,
  Eraser,
  FerrisWheel,
  Fuel,
  Gift,
  Glasses,
  GraduationCap,
  HandHelping,
  Heart,
  Home,
  Hotel,
  Lamp,
  LandPlot,
  Landmark,
  Laptop,
  LibraryBig,
  LucideIcon,
  LucideProps,
  Martini,
  Microscope,
  Music,
  Palette,
  ParkingMeter,
  Phone,
  PiggyBank,
  Pill,
  Plane,
  Plug,
  PlugZap,
  School,
  ScrollText,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Stethoscope,
  Syringe,
  Theater,
  ThermometerSun,
  Ticket,
  ToyBrick,
  Train,
  Trash,
  TreePine,
  TrendingUp,
  Trophy,
  Tv,
  Utensils,
  UtensilsCrossed,
  Wallet,
  Watch,
  Wifi,
  Wine,
  Wrench,
} from 'lucide-react'

export function CategoryIcon({
  category,
  ...props
}: { category: Category | null } & LucideProps) {
  const Icon = getCategoryIcon(`${category?.grouping}/${category?.name}`)
  // eslint-disable-next-line react-hooks/static-components
  return <Icon {...props} />
}

function getCategoryIcon(category: string): LucideIcon {
  switch (category) {
    // General
    case 'General/General':
      return Banknote
    case 'General/Other':
      return Banknote

    // Payment
    case 'Payment/Payment':
      return Wallet
    case 'Payment/Other':
      return Wallet

    // Housing
    case 'Housing/Rent':
      return PiggyBank
    case 'Housing/Mortgage':
      return Landmark
    case 'Housing/Utilities':
      return Plug
    case 'Housing/Internet':
      return Wifi
    case 'Housing/Phone':
      return Phone
    case 'Housing/Maintenance':
      return Wrench
    case 'Housing/Insurance':
      return ScrollText
    case 'Housing/Property Tax':
      return Landmark
    case 'Housing/Home Supplies':
      return Lamp
    case 'Housing/Furniture':
      return Armchair
    case 'Housing/Electronics':
      return Laptop
    case 'Housing/Appliances':
      return Plug
    case 'Housing/Cleaning':
      return Eraser
    case 'Housing/Other':
      return Home

    // Transportation
    case 'Transportation/Fuel':
      return Fuel
    case 'Transportation/Public Transit':
      return BusFront
    case 'Transportation/Taxi':
      return CarTaxiFront
    case 'Transportation/Ride Share':
      return Car
    case 'Transportation/Parking':
      return ParkingMeter
    case 'Transportation/Tolls':
      return Fuel
    case 'Transportation/Vehicle Maintenance':
      return Wrench
    case 'Transportation/Vehicle Insurance':
      return ScrollText
    case 'Transportation/Vehicle Registration':
      return ScrollText
    case 'Transportation/Rental':
      return Car
    case 'Transportation/Flights':
      return Plane
    case 'Transportation/Train':
      return Train
    case 'Transportation/Bus':
      return Bus
    case 'Transportation/Other':
      return Car

    // Food & Dining
    case 'Food & Dining/Groceries':
      return ShoppingCart
    case 'Food & Dining/Restaurant':
      return Utensils
    case 'Food & Dining/Takeaway':
      return ShoppingBag
    case 'Food & Dining/Delivery':
      return ShoppingBag
    case 'Food & Dining/Coffee':
      return Coffee
    case 'Food & Dining/Snacks':
      return CupSoda
    case 'Food & Dining/Drinks':
      return Martini
    case 'Food & Dining/Alcohol':
      return Wine
    case 'Food & Dining/Other':
      return UtensilsCrossed

    // Shopping
    case 'Shopping/Clothing':
      return Shirt
    case 'Shopping/Shoes':
      return Crown
    case 'Shopping/Accessories':
      return Watch
    case 'Shopping/Personal Care':
      return Brush
    case 'Shopping/Beauty':
      return Brush
    case 'Shopping/Health':
      return Heart
    case 'Shopping/Pharmacy':
      return Pill
    case 'Shopping/Gifts':
      return Gift
    case 'Shopping/Books':
      return BookOpen
    case 'Shopping/Stationery':
      return BookOpen
    case 'Shopping/Sports':
      return Dumbbell
    case 'Shopping/Hobbies':
      return Palette
    case 'Shopping/Toys':
      return ToyBrick
    case 'Shopping/Pets':
      return Cat
    case 'Shopping/Baby':
      return Baby
    case 'Shopping/Other':
      return ShoppingBag

    // Entertainment
    case 'Entertainment/Movies':
      return Clapperboard
    case 'Entertainment/Concerts':
      return Music
    case 'Entertainment/Theatre':
      return Theater
    case 'Entertainment/Museums':
      return LandPlot
    case 'Entertainment/Amusement Parks':
      return FerrisWheel
    case 'Entertainment/Sports Events':
      return Trophy
    case 'Entertainment/Streaming':
      return Tv
    case 'Entertainment/Music':
      return Music
    case 'Entertainment/Games':
      return Dices
    case 'Entertainment/Other':
      return Ticket

    // Travel
    case 'Travel/Hotel':
      return Hotel
    case 'Travel/Hostel':
      return Bed
    case 'Travel/Airbnb':
      return Home
    case 'Travel/Activities':
      return TreePine
    case 'Travel/Tours':
      return TreePine
    case 'Travel/Sightseeing':
      return Camera
    case 'Travel/Travel Insurance':
      return ScrollText
    case 'Travel/Visa':
      return ScrollText
    case 'Travel/Luggage':
      return Backpack
    case 'Travel/Other':
      return Plane

    // Healthcare
    case 'Healthcare/Doctor':
      return Stethoscope
    case 'Healthcare/Dentist':
      return Stethoscope
    case 'Healthcare/Hospital':
      return Stethoscope
    case 'Healthcare/Pharmacy':
      return Syringe
    case 'Healthcare/Optician':
      return Glasses
    case 'Healthcare/Therapy':
      return Brain
    case 'Healthcare/Health Insurance':
      return Heart
    case 'Healthcare/Other':
      return Microscope

    // Education
    case 'Education/Tuition':
      return School
    case 'Education/Books':
      return LibraryBig
    case 'Education/Supplies':
      return Backpack
    case 'Education/Courses':
      return GraduationCap
    case 'Education/Workshops':
      return Wrench
    case 'Education/Certifications':
      return ScrollText
    case 'Education/Other':
      return GraduationCap

    // Income
    case 'Income/Salary':
      return Banknote
    case 'Income/Freelance':
      return Laptop
    case 'Income/Refund':
      return Banknote
    case 'Income/Gift':
      return Gift
    case 'Income/Investment':
      return TrendingUp
    case 'Income/Other':
      return DollarSign

    // Donation
    case 'Donation/Donation':
      return HandHelping
    case 'Donation/Charity':
      return HandHelping
    case 'Donation/Other':
      return HandHelping

    default:
      return Banknote
  }
}
