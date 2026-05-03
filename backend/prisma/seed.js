require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const argon2 = require('argon2')

const prisma = new PrismaClient()

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
}

const hashPassword = async (password) => {
  const pepper = process.env.ARGON2_PEPPER || ''
  return argon2.hash(pepper + password, ARGON2_OPTIONS)
}

const staffUsers = [
  {
    username:      'staff01',
    password:      'StaffSecure@2026!',
    fullName:      'Staff Member One',
    accountNumber: '10000001',
    idNumber:      '0000000000001',
  },
  {
    username:      'staff02',
    password:      'StaffSecure@2026!',
    fullName:      'Staff Member Two',
    accountNumber: '10000002',
    idNumber:      '0000000000002',
  },
]

async function main() {
  console.log('Seeding staff users...')

  for (const staff of staffUsers) {
    const passwordHash = await hashPassword(staff.password)

    await prisma.user.upsert({
      where:  { username: staff.username },
      update: { passwordHash },
      create: {
        username:      staff.username,
        passwordHash,
        fullName:      staff.fullName,
        accountNumber: staff.accountNumber,
        idNumber:      staff.idNumber,
        role:          'STAFF',
      },
    })

    console.log(`✓ ${staff.username} (${staff.fullName}) seeded`)
  }

  console.log('\nStaff credentials:')
  console.log('  Username: staff01  Password: StaffSecure@2026!')
  console.log('  Username: staff02  Password: StaffSecure@2026!')
  console.log('\nDone.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
