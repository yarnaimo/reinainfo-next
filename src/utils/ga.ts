import { useRouter } from 'next/router'
import ReactGA from 'react-ga'
import { useEffectOnce } from 'react-use'
import { env } from '../env'

export const useGA = (code: string) => {
  const router = useRouter()

  useEffectOnce(() => {
    initGA(code)
    logPageView()
    router.events.on('routeChangeComplete', logPageView)
  })
}

export const initGA = (code: string) => {
  console.log('GA init')
  if (!env.isDev) {
    ReactGA.initialize(code)
  }
}

export const logPageView = () => {
  console.log(`Logging pageview for ${window.location.pathname}`)
  ReactGA.set({ page: window.location.pathname })
  ReactGA.pageview(window.location.pathname)
}

export const logEvent = (category = '', action = '') => {
  if (category && action) {
    ReactGA.event({ category, action })
  }
}

export const logException = (description = '', fatal = false) => {
  if (description) {
    ReactGA.exception({ description, fatal })
  }
}
