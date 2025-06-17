
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Error de inicio de sesión",
            description: error.message,
            variant: "destructive",
          });
        } else {
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, firstName, lastName);
        if (error) {
          toast({
            title: "Error de registro",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "¡Registro exitoso!",
            description: "Revisa tu email para confirmar tu cuenta.",
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#ffff00] p-8">
          <h1 className="text-3xl font-black text-black mb-8 text-center">
            {isLogin ? 'INICIAR SESIÓN' : 'REGISTRARSE'}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <Input
                    type="text"
                    placeholder="NOMBRE"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-4 border-black h-12 text-lg font-bold placeholder:text-gray-400 focus:border-4 focus:border-black focus:shadow-[4px_4px_0px_0px_#ff00ff]"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="APELLIDO"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border-4 border-black h-12 text-lg font-bold placeholder:text-gray-400 focus:border-4 focus:border-black focus:shadow-[4px_4px_0px_0px_#ff00ff]"
                    required
                  />
                </div>
              </>
            )}
            
            <div>
              <Input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-4 border-black h-12 text-lg font-bold placeholder:text-gray-400 focus:border-4 focus:border-black focus:shadow-[4px_4px_0px_0px_#ff00ff]"
                required
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="CONTRASEÑA"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-4 border-black h-12 text-lg font-bold placeholder:text-gray-400 focus:border-4 focus:border-black focus:shadow-[4px_4px_0px_0px_#ff00ff]"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-lg border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all"
            >
              {loading ? 'PROCESANDO...' : (isLogin ? 'ENTRAR' : 'REGISTRARSE')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-black font-bold hover:text-pink-600 transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? REGISTRATE' : '¿Ya tienes cuenta? INICIA SESIÓN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
