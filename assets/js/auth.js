const SUPABASE_URL = 'https://xiaukzzqjixkycuepqzm.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_ANUwxvL9ux63ATKGyX1leA_MIhWIUOg'

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function getAuthMessage(error) {
  if (!error) return ''

  const messages = {
    'Invalid login credentials': 'E-mail ou senha inválidos.',
    'User already registered': 'Este e-mail já está cadastrado.',
    'Password should be at least 6 characters.': 'A senha precisa ter pelo menos 6 caracteres.',
    'Signup requires a valid password': 'Digite uma senha válida.',
    'Unable to validate email address: invalid format': 'Digite um e-mail válido.',
    'Email rate limit exceeded': 'Muitas tentativas de cadastro. Aguarde alguns minutos.',
    'For security purposes, you can only request this after': 'Espere um pouco antes de tentar novamente.'
  }

  return messages[error.message] || error.message || 'Não foi possível concluir a operação.'
}
async function login(email, password) {

  if (!email || !password) {
    alert('Preencha o e-mail e a senha.')
    return
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    alert(getAuthMessage(error))
    return
  }

  localStorage.setItem('token', data.session.access_token)
  localStorage.setItem('userEmail', data.user.email)

  window.location.href = 'index.html'
}
async function register(email, password) {

  if (!email || !password) {
    alert('Preencha o e-mail e a senha.')
    return
  }

  if (password.length < 6) {
    alert('A senha precisa ter pelo menos 6 caracteres.')
    return
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined
    }
  })

  if (error) {
    console.log(error)
    alert(getAuthMessage(error))
    return
  }

  alert('Conta criada com sucesso!')

  window.location.href = 'login.html'
}

async function checkAuth() {
  const { data } = await supabaseClient.auth.getSession()

  if (!data.session) {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    window.location.href = 'login.html'
    return
  }

  localStorage.setItem('token', data.session.access_token)
  localStorage.setItem('userEmail', data.session.user.email)
};