import firebase from 'firebase/app'
import 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { app } from './firebase'

export const firebaseAuth = app.auth()
export const login = () => app.auth().signInWithPopup(authProvider)
export const logout = () => app.auth().signOut()

export const authProvider = new firebase.auth.GoogleAuthProvider()

export const useAuth = (auth: firebase.auth.Auth) => {
  const [user, loading, error] = useAuthState(auth)
  const notLoggedIn = !loading && !user
  return { user, loading, notLoggedIn, error }
}
