import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Category IDs are carefully assigned:
// 0 = General (schema default for expenses)
// 1 = Payment (hardcoded for reimbursements in expense-form.tsx)
const categories = [
  // General
  { id: 0, grouping: 'General', name: 'General' },

  // Payment
  { id: 1, grouping: 'Payment', name: 'Payment' },

  // Housing
  { id: 2, grouping: 'Housing', name: 'Rent' },
  { id: 3, grouping: 'Housing', name: 'Mortgage' },
  { id: 4, grouping: 'Housing', name: 'Utilities' },
  { id: 5, grouping: 'Housing', name: 'Internet' },
  { id: 6, grouping: 'Housing', name: 'Phone' },
  { id: 7, grouping: 'Housing', name: 'Maintenance' },
  { id: 8, grouping: 'Housing', name: 'Insurance' },
  { id: 9, grouping: 'Housing', name: 'Property Tax' },
  { id: 10, grouping: 'Housing', name: 'Home Supplies' },
  { id: 11, grouping: 'Housing', name: 'Furniture' },
  { id: 12, grouping: 'Housing', name: 'Electronics' },
  { id: 13, grouping: 'Housing', name: 'Appliances' },
  { id: 14, grouping: 'Housing', name: 'Cleaning' },
  { id: 15, grouping: 'Housing', name: 'Other' },

  // Transportation
  { id: 16, grouping: 'Transportation', name: 'Fuel' },
  { id: 17, grouping: 'Transportation', name: 'Public Transit' },
  { id: 18, grouping: 'Transportation', name: 'Taxi' },
  { id: 19, grouping: 'Transportation', name: 'Ride Share' },
  { id: 20, grouping: 'Transportation', name: 'Parking' },
  { id: 21, grouping: 'Transportation', name: 'Tolls' },
  { id: 22, grouping: 'Transportation', name: 'Vehicle Maintenance' },
  { id: 23, grouping: 'Transportation', name: 'Vehicle Insurance' },
  { id: 24, grouping: 'Transportation', name: 'Vehicle Registration' },
  { id: 25, grouping: 'Transportation', name: 'Rental' },
  { id: 26, grouping: 'Transportation', name: 'Flights' },
  { id: 27, grouping: 'Transportation', name: 'Train' },
  { id: 28, grouping: 'Transportation', name: 'Bus' },
  { id: 29, grouping: 'Transportation', name: 'Other' },

  // Food & Dining
  { id: 30, grouping: 'Food & Dining', name: 'Groceries' },
  { id: 31, grouping: 'Food & Dining', name: 'Restaurant' },
  { id: 32, grouping: 'Food & Dining', name: 'Takeaway' },
  { id: 33, grouping: 'Food & Dining', name: 'Delivery' },
  { id: 34, grouping: 'Food & Dining', name: 'Coffee' },
  { id: 35, grouping: 'Food & Dining', name: 'Snacks' },
  { id: 36, grouping: 'Food & Dining', name: 'Drinks' },
  { id: 37, grouping: 'Food & Dining', name: 'Alcohol' },
  { id: 38, grouping: 'Food & Dining', name: 'Other' },

  // Shopping
  { id: 39, grouping: 'Shopping', name: 'Clothing' },
  { id: 40, grouping: 'Shopping', name: 'Shoes' },
  { id: 41, grouping: 'Shopping', name: 'Accessories' },
  { id: 42, grouping: 'Shopping', name: 'Personal Care' },
  { id: 43, grouping: 'Shopping', name: 'Beauty' },
  { id: 44, grouping: 'Shopping', name: 'Health' },
  { id: 45, grouping: 'Shopping', name: 'Pharmacy' },
  { id: 46, grouping: 'Shopping', name: 'Gifts' },
  { id: 47, grouping: 'Shopping', name: 'Books' },
  { id: 48, grouping: 'Shopping', name: 'Stationery' },
  { id: 49, grouping: 'Shopping', name: 'Sports' },
  { id: 50, grouping: 'Shopping', name: 'Hobbies' },
  { id: 51, grouping: 'Shopping', name: 'Toys' },
  { id: 52, grouping: 'Shopping', name: 'Pets' },
  { id: 53, grouping: 'Shopping', name: 'Baby' },
  { id: 54, grouping: 'Shopping', name: 'Other' },

  // Entertainment
  { id: 55, grouping: 'Entertainment', name: 'Movies' },
  { id: 56, grouping: 'Entertainment', name: 'Concerts' },
  { id: 57, grouping: 'Entertainment', name: 'Theatre' },
  { id: 58, grouping: 'Entertainment', name: 'Museums' },
  { id: 59, grouping: 'Entertainment', name: 'Amusement Parks' },
  { id: 60, grouping: 'Entertainment', name: 'Sports Events' },
  { id: 61, grouping: 'Entertainment', name: 'Streaming' },
  { id: 62, grouping: 'Entertainment', name: 'Music' },
  { id: 63, grouping: 'Entertainment', name: 'Games' },
  { id: 64, grouping: 'Entertainment', name: 'Other' },

  // Travel
  { id: 65, grouping: 'Travel', name: 'Hotel' },
  { id: 66, grouping: 'Travel', name: 'Hostel' },
  { id: 67, grouping: 'Travel', name: 'Airbnb' },
  { id: 68, grouping: 'Travel', name: 'Activities' },
  { id: 69, grouping: 'Travel', name: 'Tours' },
  { id: 70, grouping: 'Travel', name: 'Sightseeing' },
  { id: 71, grouping: 'Travel', name: 'Travel Insurance' },
  { id: 72, grouping: 'Travel', name: 'Visa' },
  { id: 73, grouping: 'Travel', name: 'Luggage' },
  { id: 74, grouping: 'Travel', name: 'Other' },

  // Healthcare
  { id: 75, grouping: 'Healthcare', name: 'Doctor' },
  { id: 76, grouping: 'Healthcare', name: 'Dentist' },
  { id: 77, grouping: 'Healthcare', name: 'Hospital' },
  { id: 78, grouping: 'Healthcare', name: 'Pharmacy' },
  { id: 79, grouping: 'Healthcare', name: 'Optician' },
  { id: 80, grouping: 'Healthcare', name: 'Therapy' },
  { id: 81, grouping: 'Healthcare', name: 'Health Insurance' },
  { id: 82, grouping: 'Healthcare', name: 'Other' },

  // Education
  { id: 83, grouping: 'Education', name: 'Tuition' },
  { id: 84, grouping: 'Education', name: 'Books' },
  { id: 85, grouping: 'Education', name: 'Supplies' },
  { id: 86, grouping: 'Education', name: 'Courses' },
  { id: 87, grouping: 'Education', name: 'Workshops' },
  { id: 88, grouping: 'Education', name: 'Certifications' },
  { id: 89, grouping: 'Education', name: 'Other' },

  // Income
  { id: 90, grouping: 'Income', name: 'Salary' },
  { id: 91, grouping: 'Income', name: 'Freelance' },
  { id: 92, grouping: 'Income', name: 'Refund' },
  { id: 93, grouping: 'Income', name: 'Gift' },
  { id: 94, grouping: 'Income', name: 'Investment' },
  { id: 95, grouping: 'Income', name: 'Other' },

  // Donation
  { id: 96, grouping: 'Donation', name: 'Donation' },
  { id: 97, grouping: 'Donation', name: 'Charity' },
  { id: 98, grouping: 'Donation', name: 'Other' },

  // Additional "Other" categories for General and Payment groups
  { id: 99, grouping: 'General', name: 'Other' },
  { id: 100, grouping: 'Payment', name: 'Other' },
]

async function main() {
  console.log('Seeding categories...')
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: { grouping: category.grouping, name: category.name },
      create: category,
    })
  }
  console.log(`Seeded ${categories.length} categories`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
