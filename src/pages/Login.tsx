import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import type { Lang } from '@/i18n/translations'

const LANGS: { code: Lang; native: string }[] = [
  { code: 'de', native: 'DE' },
  { code: 'en', native: 'EN' },
  { code: 'es', native: 'ES' },
]

type Tab = 'signin' | 'register'

export default function Login() {
  const { signIn, register } = useAuth()
  const navigate = useNavigate()
  const { t, lang, setLang } = useLanguage()
  const [tab, setTab] = useState<Tab>('signin')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    const trimmedName = name.trim()
    const trimmedPass = password.trim()
    if (!trimmedName || !trimmedPass) {
      setError(t('nameRequired'))
      return
    }
    setLoading(true)
    setError('')
    if (tab === 'signin') {
      const r = await signIn(trimmedName, trimmedPass)
      if (!r.ok) {
        setError(r.error === 'notfound' ? t('errNotRegistered') : t('errWrongPass'))
      } else {
        navigate('/home')
      }
    } else {
      const r = await register(trimmedName, trimmedPass, code.trim() || undefined)
      if (!r.ok) {
        setError(r.error === 'taken' ? t('errNameTaken') : r.error === 'badcode' ? t('errBadCode') : t('genericError'))
      } else {
        navigate('/home')
      }
    }
    setLoading(false)
  }

  return (
    <div className="app-shell flex flex-col min-h-svh bg-gradient-to-b from-primary/8 to-white">
      <div className="flex justify-end px-4 pt-4 gap-1">
        {LANGS.map(({ code: lCode, native }) => (
          <button
            key={lCode}
            onClick={() => setLang(lCode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              lang === lCode ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            {native}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center flex-1 px-6 py-6">
        <div className="mb-5">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-xl shadow-primary/25">
            <span className="text-3xl">✈️</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('appName')}</h1>
        <p className="text-gray-500 text-center text-sm mb-6 max-w-xs leading-relaxed">{t('tagline')}</p>

        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{t('howItWorks')}</p>
          <div className="flex flex-col gap-2.5">
            {[t('step1'), t('step2'), t('step3')].map((label, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-4">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            {(['signin', 'register'] as Tab[]).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => { setTab(tabKey); setError('') }}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  tab === tabKey ? 'bg-white text-primary shadow-sm' : 'text-gray-400'
                }`}
              >
                {tabKey === 'signin' ? t('signInTab') : t('registerTab')}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">{t('usernameLabel')}</Label>
              <Input id="username" placeholder={t('namePlaceholder')} value={name}
                onChange={(e) => { setName(e.target.value); setError('') }}
                className="h-12 rounded-xl" autoFocus />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">{t('passwordLabel')}</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="h-12 rounded-xl" />
            </div>
            {tab === 'register' && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="inviteCode" className="text-sm font-semibold text-gray-700">{t('inviteCodeOptional')}</Label>
                <Input id="inviteCode" placeholder="z.B. ABC-123" value={code}
                  onChange={(e) => setCode(e.target.value)} className="h-12 rounded-xl" />
              </div>
            )}
            {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
            <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 rounded-xl text-base font-semibold">
              {loading ? '…' : (tab === 'signin' ? t('signIn') : t('registerTab'))}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-8 px-4">{t('privacyNote')}</p>
    </div>
  )
}
