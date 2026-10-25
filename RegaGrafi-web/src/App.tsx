import './App.css'
import AppRouter from './routs'
import Header from './components/features/Header'



function App() {
// const [email, setEmail] = useState("")

  return (
    
    <>
{/* 
<TextField onChange={setEmail}  label='email' type='email' value={email}/>
<TextField label='password' type='password'onChange={setEmail}   value={email}/> */}
<AppRouter></AppRouter>

  </>
  )
}
export default App
