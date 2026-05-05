import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { Lock, Key, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'

interface MasterPasswordProps {
  onUnlock: () => void
}

export default function MasterPassword({ onUnlock }: MasterPasswordProps) {
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkMasterPassword()
  }, [])

  const checkMasterPassword = async () => {
    try {
      const isSet = await invoke<boolean>('is_master_password_set')
      setIsSetup(isSet)
    } catch (err) {
      console.error('Failed to check master password:', err)
    }
  }

  const handleSetup = async () => {
    setError('')

    if (password.length < 8) {
      setError('密码长度至少8位')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      await invoke('set_master_password', { password })
      onUnlock()
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async () => {
    setError('')
    setLoading(true)

    try {
      const success = await invoke<boolean>('verify_master_password', { password })
      if (success) {
        onUnlock()
      } else {
        setError('密码错误')
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isSetup) {
        handleUnlock()
      } else {
        handleSetup()
      }
    }
  }

  if (isSetup === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/60 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Key className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SecretWarehouse</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {isSetup ? '输入主密码解锁' : '设置主密码以保护您的数据'}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {isSetup ? '主密码' : '设置主密码'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isSetup ? '输入主密码' : '至少8位字符'}
                  className="w-full pl-11 pr-11 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  autoFocus
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isSetup && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="再次输入密码"
                    className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={isSetup ? handleUnlock : handleSetup}
              disabled={loading || !password || (!isSetup && !confirmPassword)}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSetup ? <Lock className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                  <span>{isSetup ? '解锁' : '设置密码'}</span>
                </>
              )}
            </button>
          </div>

          {/* Tips */}
          {!isSetup && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                主密码用于加密您的所有数据。请牢记此密码，忘记后将无法恢复数据。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
