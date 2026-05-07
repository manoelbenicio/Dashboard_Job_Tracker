/**
 * JobFlow — Admin Account Seeder
 * Creates the admin user in Firebase Authentication
 * Run once: npx tsx create-admin.ts
 */

const FIREBASE_API_KEY = 'AIzaSyBZgYqlJlAHssJixxlS1xbqimN4YliT4s8'

const ADMIN_EMAIL = 'admin@jobflow.app'
const ADMIN_PASSWORD = 'JobFlow2026!'
const ADMIN_NAME = 'JobFlow Admin'

async function createAdmin() {
  console.log('\n  🔐 Creating JobFlow Admin Account...\n')

  // Step 1: Create user via Firebase REST API
  const signupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`
  
  const res = await fetch(signupUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: ADMIN_NAME,
      returnSecureToken: true,
    }),
  })

  const data = await res.json()

  if (data.error) {
    if (data.error.message === 'EMAIL_EXISTS') {
      console.log('  ℹ  Admin account already exists.\n')
      console.log('  ┌─────────────────────────────────────────┐')
      console.log('  │  📧 Email:    admin@jobflow.app          │')
      console.log('  │  🔑 Password: JobFlow2026!               │')
      console.log('  └─────────────────────────────────────────┘')
      console.log()
      return
    }
    console.error('  ❌ Error:', data.error.message)
    return
  }

  // Step 2: Update display name
  const updateUrl = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`
  
  await fetch(updateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken: data.idToken,
      displayName: ADMIN_NAME,
      returnSecureToken: false,
    }),
  })

  console.log('  ✅ Admin account created successfully!\n')
  console.log('  ┌─────────────────────────────────────────────────────────┐')
  console.log('  │  📧 Email:      admin@jobflow.app                       │')
  console.log('  │  🔑 Password:   JobFlow2026!                            │')
  console.log('  │  👤 Name:       JobFlow Admin                           │')
  console.log('  │  🆔 UID:        ' + data.localId.padEnd(39) + '│')
  console.log('  └─────────────────────────────────────────────────────────┘')
  console.log()
  console.log('  🌐 Login at: https://jobflow-exec-tracker.web.app')
  console.log()
}

createAdmin().catch(console.error)
