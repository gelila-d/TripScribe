import React from 'react'
import { useNavigate } from 'react-router-dom' 
import PassWordInput from '../../components/Input/PasswordInput.jsx'
import { validateEmail } from '../../utils/helper.js'
import axiosInstance from '../../utils/axiosInstance.js'
const Login = () => {
  const navigate = useNavigate(); 
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

 const handleLogin = async (e) => {
  e.preventDefault();

  if (!validateEmail(email)) {
    setError('Please enter a valid email address.');
    return;
  }

  if (!password) {
    setError('Please enter your password.');
    return;
  }

  setError("");

  try {
    const response = await axiosInstance.post('/login', {
      email: email,
      password: password,
    });

    // Success Logic
    if (response.data && response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      navigate('/dashboard');
    }
  } catch (error) {
    // Error Handling Logic
    console.error("Login Error:", error); // Check your console to see the real error!
    
    if (error.response && error.response.data && error.response.data.message) {
      setError(error.response.data.message);
    } else {
      setError('An error occurred. Please try again later.');
    }
  }
};
  return (
    <div className='h-screen bg-violet-100 overflow-hidden relative'>
      <div className='login-ui-box  right-10 -top-40'/>
      <div className='login-ui-box  bg-violet-350 -bottom-40 right-1/2'/>
      
      <div className='container h-screen flex items-center justify-center px-20 mx-auto'>
  
        <div className="w-2/4 h-[90vh] flex items-end bg-[url('./assets/images/login-bg.jpg')] bg-center rounded-lg p-10 z-50">
          <div>
            <h4 className=' text-4xl text-white font-semibold leading-[58px] '>
              Capture Your Journey<br/> with TripScribe
            </h4>
            <p className='text-[15px] text-white leading-6 pr-7 mt-4'>
              Share your travel stories and memories with TripScribe
            </p>
          </div>
        </div>

        <div className='w-2/4 bg-white h-[75vh] rounded-lg relative p-16 shadow-lg shadow-cyan-200/20 '>
           <form onSubmit={handleLogin}>
            <h4 className='text-2xl font-semibold mb-7'>Login </h4>
            <input type='text' placeholder='Email' className='input-box' 
            value={email}
            onChange={({target}) => setEmail(target.value)}
            
            
            />
            <PassWordInput value={password} onChange={({target}) => setPassword(target.value)} />

            {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}
            <button type='submit' className='btn-primary'>LOGIN</button>
           <p className='text-center text-sm text-slate-400 my-3'>Or</p>
            <button type='button' className='btn-primary' onClick={()=>{navigate('/signUp')}}>CREATE ACCOUNT</button>
           </form>
      </div>
    </div>
  </div>
  )
}

export default Login