/**
 * Data Governance — Soft Delete Service
 * 
 * Legal-compliant 5-year data retention via soft-delete.
 * When a user requests account deletion:
 *   1. Sets isActive: false on the user document
 *   2. Sets deletedAt timestamp
 *   3. Sets retentionExpiry to 5 years from now
 *   4. Signs the user out
 * 
 * Data remains in Firestore for legal compliance but is inaccessible
 * to the app via Firestore security rules.
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth, signOut, deleteUser } from 'firebase/auth'
import { db } from '@/lib/firebase'

const RETENTION_YEARS = 5

export async function softDeleteAccount(): Promise<void> {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) throw new Error('No authenticated user')

  const retentionExpiry = new Date()
  retentionExpiry.setFullYear(retentionExpiry.getFullYear() + RETENTION_YEARS)

  // 1. Mark user document as soft-deleted
  const userDocRef = doc(db, 'users', user.uid)
  await setDoc(userDocRef, {
    isActive: false,
    deletedAt: serverTimestamp(),
    retentionExpiry: retentionExpiry.toISOString(),
    deletionReason: 'user_requested',
    email: user.email || '',
  }, { merge: true })

  // 2. Sign out the user (data remains in Firestore for retention period)
  await signOut(auth)
}

/**
 * Hard-delete: permanently delete Auth account.
 * Only callable AFTER soft-delete has been applied.
 * The Firestore data stays for legal retention.
 */
export async function hardDeleteAuthAccount(): Promise<void> {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) throw new Error('No authenticated user')
  
  await deleteUser(user)
}
